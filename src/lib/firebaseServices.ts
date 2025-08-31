import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  onSnapshot,
  limit,
  startAfter
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { User, Issue, Area, Notification } from './types';
import { GeographicFilterService } from './geographicFilterService';

// Helper function to safely convert dates
const safeToDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  
  // If it's already a Date object, return it
  if (dateValue instanceof Date) return dateValue;
  
  // If it's a Firestore Timestamp with toDate method
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // If it's a string, parse it
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  
  // If it has seconds property (Firestore Timestamp object)
  if (dateValue && typeof dateValue.seconds === 'number') {
    return new Date(dateValue.seconds * 1000);
  }
  
  // Fallback to current date
  return new Date();
};

// Set persistence to LOCAL (persists across browser sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('⚠️ Firebase: Failed to set persistence:', error);
});

// Firebase Authentication Services
export const firebaseAuth = {
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('❌ Firebase Auth: Sign in error:', error);
      throw error;
    }
  },
  
  signUp: async (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user document in Firestore with pending status
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        email,
        role: 'pending', // Always set to pending for new signups
        isActive: false, // Inactive until approved
        status: 'inactive',
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      });
      return userCredential.user;
    } catch (error) {
      console.error('❌ Firebase Auth: Sign up error:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('❌ Firebase Auth: Sign out error:', error);
      throw error;
    }
  },
  
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Firestore Database Services
export const firestoreService = {
  // User operations
  createUser: async (userId: string, userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      });
    } catch (error) {
      console.error('❌ Firestore: Failed to create user:', error);
      throw error;
    }
  },
  
  getUser: async (userId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          department: data.department,
          phone: data.phone,
          assignedAreas: data.assignedAreas || [],
          isActive: data.isActive,
          status: data.status || 'active',
          approvalDate: data.approvalDate ? safeToDate(data.approvalDate) : undefined,
          approvedBy: data.approvedBy,
          createdAt: safeToDate(data.createdAt),
          lastLogin: safeToDate(data.lastLogin),
          profileImage: data.profileImage
        } as User;
      }
      return null;
    } catch (error) {
      console.error('❌ Firestore: Error fetching user data:', error);
      throw error;
    }
  },
  
  getUsers: async (): Promise<User[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          department: data.department,
          phone: data.phone,
          assignedAreas: data.assignedAreas || [],
          isActive: data.isActive,
          status: data.status || 'active',
          approvalDate: data.approvalDate ? safeToDate(data.approvalDate) : undefined,
          approvedBy: data.approvedBy,
          createdAt: safeToDate(data.createdAt),
          lastLogin: safeToDate(data.lastLogin),
          profileImage: data.profileImage
        } as User;
      });
    } catch (error) {
      console.warn('⚠️ Firestore: Permission error fetching users:', error);
      return [];
    }
  },
  
  updateUser: async (userId: string, userData: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('❌ Firestore: Failed to update user:', error);
      throw error;
    }
  },

  // Dashboard statistics
  getDashboardStats: async (role: string) => {
    try {
      let stats = {
        totalIssues: 0,
        activeUsers: 0,
        slaCompliance: 0,
        escalatedIssues: 0,
        pendingIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        assignedTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        pendingVerification: 0
      };

      // Get total issues
      const issuesSnapshot = await getDocs(collection(db, 'issues'));
      const issues = issuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      stats.totalIssues = issues.length;
      stats.pendingIssues = issues.filter(issue => issue.status === 'pending').length;
      stats.inProgressIssues = issues.filter(issue => issue.status === 'in_progress').length;
      stats.resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
      stats.escalatedIssues = issues.filter(issue => issue.status === 'escalated').length;
      stats.pendingVerification = issues.filter(issue => issue.status === 'resolved' && !issue.verified).length;

      // Get active users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      stats.activeUsers = usersSnapshot.docs.filter(doc => doc.data().isActive).length;

      // Calculate SLA compliance
      const resolvedIssues = issues.filter(issue => issue.status === 'resolved');
      const withinSLA = resolvedIssues.filter(issue => {
        if (!issue.resolvedAt || !issue.slaDeadline) return false;
        const resolvedTime = safeToDate(issue.resolvedAt);
        const slaTime = safeToDate(issue.slaDeadline);
        return resolvedTime <= slaTime;
      }).length;
      
      stats.slaCompliance = resolvedIssues.length > 0 ? Math.round((withinSLA / resolvedIssues.length) * 100) : 0;

      // Role-specific stats
      if (role === 'Supervisor') {
        stats.assignedTasks = issues.filter(issue => issue.assignedTo === auth.currentUser?.uid).length;
        stats.inProgressTasks = issues.filter(issue => 
          issue.assignedTo === auth.currentUser?.uid && issue.status === 'in_progress'
        ).length;
        stats.completedTasks = issues.filter(issue => 
          issue.assignedTo === auth.currentUser?.uid && issue.status === 'resolved'
        ).length;
        
        // Calculate overdue tasks
        const now = new Date();
        stats.overdueTasks = issues.filter(issue => {
          if (issue.assignedTo !== auth.currentUser?.uid || issue.status === 'resolved') return false;
          if (!issue.slaDeadline) return false;
          const slaTime = safeToDate(issue.slaDeadline);
          return now > slaTime;
        }).length;
      }

      return stats;
    } catch (error) {
      console.error('❌ Firestore: Error fetching dashboard stats:', error);
      return {
        totalIssues: 0,
        activeUsers: 0,
        slaCompliance: 0,
        escalatedIssues: 0,
        pendingIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        assignedTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        pendingVerification: 0
      };
    }
  },

  // Issue operations
  createIssue: async (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'issues'), {
        ...issueData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },
  
  getIssues: async (filters?: Record<string, string>): Promise<Issue[]> => {
    try {
      let q = query(collection(db, 'issues'));
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters?.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          category: data.category,
          location: data.location,
          reportedBy: data.reportedBy,
          assignedTo: data.assignedTo,
          images: data.images || [],
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
          resolvedAt: data.resolvedAt ? safeToDate(data.resolvedAt) : undefined,
          slaDeadline: safeToDate(data.slaDeadline),
          area: data.area,
          tags: data.tags || [],
          estimatedCost: data.estimatedCost,
          actualCost: data.actualCost,
          contractorId: data.contractorId
        } as Issue;
      });
    } catch (error) {
      console.warn('⚠️ Firebase: Permission error fetching issues:', error);
      return [];
    }
  },

  getRecentIssues: async (limitCount: number = 5): Promise<Issue[]> => {
    try {
      const q = query(
        collection(db, 'issues'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          category: data.category,
          location: data.location,
          reportedBy: data.reportedBy,
          assignedTo: data.assignedTo,
          images: data.images || [],
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
          resolvedAt: data.resolvedAt ? safeToDate(data.resolvedAt) : undefined,
          slaDeadline: safeToDate(data.slaDeadline),
          area: data.area,
          tags: data.tags || [],
          estimatedCost: data.estimatedCost,
          actualCost: data.actualCost,
          contractorId: data.contractorId
        } as Issue;
      });
    } catch (error) {
      console.error('❌ Firestore: Error fetching recent issues:', error);
      return [];
    }
  },

  // Get issues filtered by user's geographic areas
  getIssuesByGeographicArea: async (user: User): Promise<Issue[]> => {
    try {
      // Get all issues first
      const allIssues = await firestoreService.getIssues();
      
      // If user is SuperAdmin, return all issues
      if (user.role === 'SuperAdmin') {
        return allIssues;
      }

      // For Department Head, filter by proximity to department location
      if (user.role === 'Department Head') {
        // If user has geographic areas, use them for filtering
        if (user.geographicAreas && user.geographicAreas.length > 0) {
          const areas = await firestoreService.getAreas();
          const filteredIssues = GeographicFilterService.filterIssuesByUserAreas(allIssues, user, areas);
          
          // If no issues found with geographic areas, fall back to proximity-based filtering
          if (filteredIssues.length === 0) {
            return GeographicFilterService.filterIssuesByProximity(allIssues, user);
          }
          return filteredIssues;
        } else {
          // No geographic areas assigned, use proximity-based filtering
          return GeographicFilterService.filterIssuesByProximity(allIssues, user);
        }
      }

      // For other roles (Supervisor, Auditor), use geographic areas if available
      if (!user.geographicAreas || user.geographicAreas.length === 0) {
        return [];
      }

      // Get areas for reference
      const areas = await firestoreService.getAreas();
      
      // Filter issues based on geographic areas
      return GeographicFilterService.filterIssuesByUserAreas(allIssues, user, areas);
    } catch (error) {
      console.error('❌ Firestore: Error fetching issues by geographic area:', error);
      // For Department Head, return all issues on error
      if (user.role === 'Department Head') {
        return await firestoreService.getIssues();
      }
      return [];
    }
  },

  // Get geographic statistics for a user
  getGeographicStats: async (user: User) => {
    try {
      const [allIssues, areas] = await Promise.all([
        firestoreService.getIssues(),
        firestoreService.getAreas()
      ]);
      
      return GeographicFilterService.getGeographicStats(allIssues, user, areas);
    } catch (error) {
      console.error('❌ Firestore: Error fetching geographic stats:', error);
      return {
        totalIssues: 0,
        issuesInRange: 0,
        averageDistance: 0,
        coverageArea: 0
      };
    }
  },
  


  updateIssueStatus: async (issueId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('❌ Firestore: Failed to update issue status:', error);
      throw error;
    }
  },

  assignIssue: async (issueId: string, supervisorId: string) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        assignedTo: supervisorId,
        status: 'in_progress',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('❌ Firestore: Failed to assign issue:', error);
      throw error;
    }
  },

  updateIssue: async (issueId: string, updateData: Partial<Issue>) => {
    try {
      // Filter out undefined values and updatedAt to avoid conflicts
      const { updatedAt, ...filteredData } = updateData;
      const cleanData = Object.fromEntries(
        Object.entries(filteredData).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(doc(db, 'issues', issueId), {
        ...cleanData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('❌ Firestore: Failed to update issue:', error);
      throw error;
    }
  },
  
  // Area operations
  createArea: async (areaData: Omit<Area, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, 'areas'), {
      ...areaData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },
  
  getAreas: async (): Promise<Area[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'areas'));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type || 'district',
          boundaries: data.boundaries || [],
          center: data.center || { latitude: 0, longitude: 0 },
          radius: data.radius || 0,
          population: data.population || 0,
          priority: data.priority || 'medium',
          supervisorId: data.supervisorId,
          slaTargets: data.slaTargets || {},
          activeIssues: data.activeIssues || 0,
          totalIssues: data.totalIssues || 0,
          averageResolutionTime: data.averageResolutionTime || 0
        } as Area;
      });
    } catch (error) {
      console.warn('⚠️ Firebase: Permission error fetching areas:', error);
      return [];
    }
  },

  // Real-time listeners
  subscribeToIssues: (callback: (issues: Issue[]) => void) => {
    return onSnapshot(collection(db, 'issues'), (snapshot) => {
      const issues = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          category: data.category,
          location: data.location,
          reportedBy: data.reportedBy,
          assignedTo: data.assignedTo,
          images: data.images || [],
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
          resolvedAt: data.resolvedAt ? safeToDate(data.resolvedAt) : undefined,
          slaDeadline: safeToDate(data.slaDeadline),
          area: data.area,
          tags: data.tags || [],
          estimatedCost: data.estimatedCost,
          actualCost: data.actualCost,
          contractorId: data.contractorId
        } as Issue;
      });
      callback(issues);
    });
  },

  // User Management Functions for Super Admin
  approveUser: async (userId: string, role: 'Department Head' | 'Supervisor' | 'Auditor', approvedBy: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: role,
        isActive: true,
        status: 'active',
        approvalDate: Timestamp.now(),
        approvedBy: approvedBy
      });
    } catch (error) {
      console.error('❌ Firestore: Failed to approve user:', error);
      throw error;
    }
  },

  rejectUser: async (userId: string, reason: string, rejectedBy: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: false,
        status: 'suspended',
        approvalDate: Timestamp.now(),
        approvedBy: rejectedBy
      });
    } catch (error) {
      console.error('❌ Firestore: Failed to reject user:', error);
      throw error;
    }
  },

  updateUserRole: async (userId: string, newRole: 'Department Head' | 'Supervisor' | 'Auditor', updatedBy: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: Timestamp.now(),
        approvedBy: updatedBy
      });
    } catch (error) {
      console.error('❌ Firestore: Failed to update user role:', error);
      throw error;
    }
  },

  getPendingUsers: async (): Promise<User[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email,
            name: data.name,
            role: data.role,
            department: data.department,
            phone: data.phone,
            assignedAreas: data.assignedAreas || [],
            isActive: data.isActive,
            status: data.status || 'active',
            approvalDate: data.approvalDate ? safeToDate(data.approvalDate) : undefined,
            approvedBy: data.approvedBy,
            createdAt: safeToDate(data.createdAt),
            lastLogin: safeToDate(data.lastLogin),
            profileImage: data.profileImage
          } as User;
        })
        .filter(user => user.role === 'pending');
    } catch (error) {
      console.warn('⚠️ Firestore: Permission error fetching pending users:', error);
      return [];
    }
  }
};

// Firebase Storage Services
export const storageService = {
  uploadFile: async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },
  
  deleteFile: async (path: string) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }
};

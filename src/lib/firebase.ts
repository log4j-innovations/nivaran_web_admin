import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { User } from './types';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

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
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        email,
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
  
  getUser: async (userId: string): Promise<{ id: string; [key: string]: unknown } | null> => {
    try {
      console.log('🔍 Firestore: Fetching user data for:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Firestore timeout after 8 seconds')), 8000);
      });
      
      const fetchPromise = getDoc(doc(db, 'users', userId));
      const userDoc = await Promise.race([fetchPromise, timeoutPromise]);
      
      const userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
      console.log('🔍 Firestore: User data result:', userData ? 'Found' : 'Not found');
      return userData;
    } catch (error) {
      console.error('❌ Firestore: Error fetching user data:', error);
      throw error;
    }
  },
  
  getUsers: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('⚠️ Firestore: Permission error fetching users:', error);
      // Return empty array on permission error instead of breaking
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
  
  // Issue operations
  createIssue: async (issueData: Record<string, unknown>) => {
    try {
      // Filter out undefined values and File objects
      const cleanIssueData = Object.fromEntries(
        Object.entries(issueData).filter(([_, value]) => {
          if (value === undefined) return false;
          if (value instanceof File) return false;
          if (Array.isArray(value) && value.some(item => item instanceof File)) return false;
          return true;
        })
      );

      // Debug: Log the cleaned data
      console.log('Firebase service - Cleaned issue data:', JSON.stringify(cleanIssueData, null, 2));

      const docRef = await addDoc(collection(db, 'issues'), {
        ...cleanIssueData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: issueData.status || 'pending',
        assignedTo: issueData.assignedTo || null,
        resolvedAt: null,
        actualCost: null,
        comments: [],
        // Ensure these fields are always present with valid values
        slaDeadline: issueData.slaDeadline || null,
        slaTargetHours: issueData.slaTargetHours || 24,
        slaEscalationHours: issueData.slaEscalationHours || 48,
        // Ensure estimatedCost is either a number or null, never undefined
        estimatedCost: issueData.estimatedCost !== undefined ? issueData.estimatedCost : null
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },
  
  getIssues: async (filters?: Record<string, string>) => {
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
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{ id: string; [key: string]: unknown }>;
    } catch (error) {
      console.warn('⚠️ Firebase: Permission error fetching issues:', error);
      // Return empty array on permission error instead of breaking
      return [];
    }
  },

  getIssueById: async (issueId: string) => {
    try {
      const docRef = doc(db, 'issues', issueId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting issue by ID:', error);
      throw error;
    }
  },
  
  updateIssue: async (issueId: string, issueData: Record<string, unknown>) => {
    await updateDoc(doc(db, 'issues', issueId), {
      ...issueData,
      updatedAt: Timestamp.now()
    });
  },
  
  // Area operations
  createArea: async (areaData: Record<string, unknown>) => {
    const docRef = await addDoc(collection(db, 'areas'), {
      ...areaData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },
  
  getAreas: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'areas'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('⚠️ Firebase: Permission error fetching areas:', error);
      // Return empty array on permission error instead of breaking
      return [];
    }
  },
  
  // Activity operations
  createActivity: async (activityData: Record<string, unknown>) => {
    await addDoc(collection(db, 'activities'), {
      ...activityData,
      timestamp: Timestamp.now()
    });
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

export default app;

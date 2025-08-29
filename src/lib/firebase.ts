import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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

// Firebase Authentication Services
export const firebaseAuth = {
  signIn: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },
  
  signUp: async (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userData,
      email,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    });
    return userCredential.user;
  },
  
  signOut: async () => {
    await firebaseSignOut(auth);
  },
  
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Firestore Database Services
export const firestoreService = {
  // User operations
  createUser: async (userId: string, userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    });
  },
  
  getUser: async (userId: string) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  },
  
  getUsers: async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  updateUser: async (userId: string, userData: Partial<User>) => {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: Timestamp.now()
    });
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
    const snapshot = await getDocs(collection(db, 'areas'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

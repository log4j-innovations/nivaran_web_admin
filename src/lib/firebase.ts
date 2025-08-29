import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { User } from './types';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIe8VDPlWv2h1PY9PEpl8uMoTmcDnUuwE",
  authDomain: "authapp-3bd50.firebaseapp.com",
  databaseURL: "https://authapp-3bd50-default-rtdb.firebaseio.com",
  projectId: "authapp-3bd50",
  storageBucket: "authapp-3bd50.firebasestorage.app",
  messagingSenderId: "178885454844",
  appId: "1:178885454844:web:ea2c9caed5d8d0e88d2079"
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
  
  updateUser: async (userId: string, userData: Partial<User>) => {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: Timestamp.now()
    });
  },
  
  // Issue operations
  createIssue: async (issueData: Record<string, unknown>) => {
    const docRef = await addDoc(collection(db, 'issues'), {
      ...issueData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

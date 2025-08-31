'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth, firestoreService } from './firebaseServices';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Try to get user data from Firestore
          const userData = await firestoreService.getUser(firebaseUser.uid);
          
          if (userData) {
            // Check if user is pending and redirect accordingly
            if (userData.role === 'pending') {
              // Pending users should not have access to dashboards
              setUser(userData);
            } else {
              setUser(userData);
            }
          } else {
            // If user doesn't exist in Firestore, create a default user
            const defaultUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'pending', // Safe default role - pending approval
              createdAt: new Date(),
              lastLogin: new Date(),
              isActive: false,
              status: 'inactive'
            };
            
            // Save to Firestore
            await firestoreService.createUser(firebaseUser.uid, {
              email: defaultUser.email,
              name: defaultUser.name,
              role: defaultUser.role,
              isActive: defaultUser.isActive,
              status: defaultUser.status
            });
            
            setUser(defaultUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          // Fallback user creation
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            role: 'pending', // Safe default role - pending approval
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: false,
            status: 'inactive'
          };
          
          setUser(fallbackUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Removed automatic routing logic to prevent infinite loops
  // Individual pages will handle their own routing logic

  const signIn = async (email: string, password: string) => {
    try {
      await firebaseAuth.signIn(email, password);
      // User will be set by the auth state listener
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    try {
      await firebaseAuth.signUp(email, password, userData);
      // User will be set by the auth state listener
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseAuth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

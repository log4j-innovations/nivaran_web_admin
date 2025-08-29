'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from './types';
import { firebaseAuth, firestoreService } from './firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await firestoreService.getUser(firebaseUser.uid);
          if (userData) {
            // Convert Firestore timestamps to Date objects
            const user: User = {
              ...userData,
              createdAt: (userData as { createdAt?: Timestamp }).createdAt?.toDate() || new Date(),
              lastLogin: (userData as { lastLogin?: Timestamp }).lastLogin?.toDate() || new Date(),
            } as User;
            
            setUser(user);
            
            // Update last login
            await firestoreService.updateUser(firebaseUser.uid, {
              lastLogin: new Date()
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await firebaseAuth.signIn(email, password);
      // User data will be fetched in the auth state listener
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      throw new Error(errorMessage);
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseAuth.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signOutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing auth state listener');
    
    // Set a safety timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      console.warn('⚠️ AuthProvider: Timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    // Listen for Firebase auth state changes
    unsubscribeRef.current = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      console.log('🔐 AuthProvider: Firebase auth state changed:', firebaseUser ? `User ${firebaseUser.uid}` : 'No user');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log('🔐 AuthProvider: Fetching user data from Firestore...');
          // Get user data from Firestore
          const userData = await firestoreService.getUser(firebaseUser.uid);
          
          if (userData) {
            console.log('🔐 AuthProvider: User data fetched successfully:', userData.role);
            // Convert Firestore timestamps to Date objects
            const user: User = {
              ...userData,
              createdAt: (userData as { createdAt?: Timestamp }).createdAt?.toDate() || new Date(),
              lastLogin: (userData as { lastLogin?: Timestamp }).lastLogin?.toDate() || new Date(),
            } as User;
            
            setUser(user);
            
            // Update last login (non-blocking)
            firestoreService.updateUser(firebaseUser.uid, {
              lastLogin: new Date()
            }).catch(error => {
              console.warn('⚠️ AuthProvider: Failed to update last login:', error);
            });
          } else {
            console.warn('⚠️ AuthProvider: User exists in Firebase Auth but not in Firestore');
            // Create a default user with basic role if Firestore data is missing
            const defaultUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'citizen', // Safe default role
              createdAt: new Date(),
              lastLogin: new Date(),
              isActive: true
            };
            setUser(defaultUser);
            
            // Try to create user in Firestore (non-blocking)
            firestoreService.createUser(firebaseUser.uid, {
              email: defaultUser.email,
              name: defaultUser.name,
              role: defaultUser.role,
              isActive: defaultUser.isActive
            }).catch(error => {
              console.warn('⚠️ AuthProvider: Failed to create user in Firestore:', error);
            });
          }
        } catch (error) {
          console.error('❌ AuthProvider: Error fetching user data:', error);
          // Create a fallback user to prevent infinite loading
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            role: 'citizen', // Safe default role
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true
          };
          setUser(fallbackUser);
        }
      } else {
        console.log('🔐 AuthProvider: No Firebase user, setting user to null');
        setUser(null);
      }
      
      // Clear timeout and set loading to false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoading(false);
      console.log('🔐 AuthProvider: Loading complete, user:', user ? user.role : 'null');
    });

    // Cleanup function
    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth listener');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthProvider: Attempting sign in for:', email);
      await firebaseAuth.signIn(email, password);
      // User data will be fetched in the auth state listener
    } catch (error: unknown) {
      console.error('❌ AuthProvider: Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      throw new Error(errorMessage);
    }
  };

  const signOutUser = async () => {
    try {
      console.log('🔐 AuthProvider: Signing out user');
      await firebaseAuth.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error: unknown) {
      console.error('❌ AuthProvider: Sign out error:', error);
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

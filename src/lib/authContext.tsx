'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from './types';
import { mockAuth } from './mockData';

interface AuthContextType {
  user: User | null;
  firebaseUser: User | null;
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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        // Check if user is already logged in (from localStorage)
        const savedUser = localStorage.getItem('municipal_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setFirebaseUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userData = await mockAuth.signIn(email, password);
      setUser(userData);
      setFirebaseUser(userData);
      
      // Save to localStorage for persistence
      localStorage.setItem('municipal_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await mockAuth.signOut();
      setUser(null);
      setFirebaseUser(null);
      
      // Remove from localStorage
      localStorage.removeItem('municipal_user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
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

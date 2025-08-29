'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to login
        router.push('/login');
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        // User doesn't have permission, redirect to their correct dashboard
        switch (user.role) {
          case 'super_admin':
            router.push('/dashboard/super-admin');
            break;
          case 'city_engineer':
            router.push('/dashboard/city-engineer');
            break;
          case 'field_supervisor':
            router.push('/dashboard/field-supervisor');
            break;
          case 'auditor':
            router.push('/dashboard/auditor');
            break;
          default:
            router.push(redirectTo);
            break;
        }
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

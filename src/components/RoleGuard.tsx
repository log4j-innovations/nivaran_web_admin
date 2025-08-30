'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
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
  const [redirecting, setRedirecting] = useState(false);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🛡️ RoleGuard: Checking permissions', { 
      loading, 
      user: user ? { id: user.id, role: user.role } : null, 
      allowedRoles 
    });

    if (!loading) {
      if (!user) {
        console.log('🛡️ RoleGuard: No user, redirecting to login');
        setRedirecting(true);
        router.push('/login');
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        console.log('🛡️ RoleGuard: User role not allowed, redirecting to appropriate dashboard');
        setRedirecting(true);
        
        // Set a timeout for the redirect to prevent infinite loading
        const timeout = setTimeout(() => {
          console.warn('⚠️ RoleGuard: Redirect timeout, forcing navigation');
          router.push(redirectTo);
        }, 3000);

        setRedirectTimeout(timeout);

        // Redirect to appropriate dashboard based on role
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
          case 'citizen':
            router.push('/dashboard'); // Default dashboard for citizens
            break;
          default:
            console.warn('⚠️ RoleGuard: Unknown user role, redirecting to default');
            router.push(redirectTo);
            break;
        }
      } else {
        console.log('🛡️ RoleGuard: User has permission, rendering children');
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [redirectTimeout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying permissions...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we check your access</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {redirecting ? 'Redirecting...' : 'Access denied'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {redirecting ? 'Taking you to the right place' : 'You don\'t have permission to view this page'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

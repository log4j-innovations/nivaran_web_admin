'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to role-specific dashboard
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
          // Stay on main dashboard if role is not recognized
          break;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // This is a fallback page - users should be redirected to role-specific dashboards
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}

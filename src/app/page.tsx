'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Shield, Users, Eye, Wrench } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && user.isActive) {
        // Redirect based on role
        switch (user.role) {
          case 'SuperAdmin':
            router.push('/admin');
            break;
          case 'Department Head':
            router.push('/departmenthead');
            break;
          case 'Supervisor':
            router.push('/supervisor');
            break;
          case 'Auditor':
            router.push('/auditor');
            break;
          case 'pending':
            router.push('/pending-approval');
            break;
          default:
            router.push('/login');
        }
      } else {
        // User not logged in or not active, redirect to login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Municipal Dashboard</h2>
          <p className="text-gray-600">Checking your authentication status...</p>
        </div>
      </div>
    );
  }

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to your dashboard</p>
      </div>
    </div>
  );
}

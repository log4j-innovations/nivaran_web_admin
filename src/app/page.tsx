'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Municipal Dashboard</h1>
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="lg" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

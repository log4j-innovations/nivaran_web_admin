'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🏠 HomePage: Auth state changed', { loading, user: user ? user.role : null });
    
    if (!loading) {
      if (user) {
        console.log('🏠 HomePage: User authenticated, redirecting to dashboard');
        setRedirecting(true);
        router.push('/dashboard');
      } else {
        console.log('🏠 HomePage: No user, redirecting to login');
        setRedirecting(true);
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Set a safety timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ HomePage: Loading timeout reached, forcing redirect to login');
        setRedirecting(true);
        router.push('/login');
      }, 15000); // 15 second timeout

      setRedirectTimeout(timeout);

      return () => {
        if (redirectTimeout) {
          clearTimeout(redirectTimeout);
        }
      };
    }
  }, [loading, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [redirectTimeout]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Municipal Dashboard</h1>
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="lg" />
            <span className="text-gray-600">
              {redirecting ? 'Redirecting...' : 'Loading...'}
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {redirecting 
              ? 'Taking you to the right place' 
              : 'Please wait while we check your authentication status'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

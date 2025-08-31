'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Clock, UserCheck, LogOut, Building2, Shield, Wrench, ClipboardCheck } from 'lucide-react';

function PendingApprovalContent() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  useEffect(() => {
    if (!loading && user && user.role !== 'pending') {
      // If user is approved, redirect to appropriate dashboard
      const rolePath = user.role === 'SuperAdmin' ? 'admin' : user.role === 'Department Head' ? 'departmenthead' : user.role.toLowerCase();
      router.push(`/${rolePath}/`);
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'pending') {
    // If no user or user is not pending, show a message
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 bg-gray-400 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-gray-600">
            This page is only for users with pending approval status.
          </p>
          <a 
            href="/login" 
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-500 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is under review by a Super Admin
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <UserCheck className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Account Created Successfully!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Approval in Progress
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your account has been submitted and is currently being reviewed by our Super Admin team.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Super Admin reviews your application</li>
                <li>• Role assignment (Department Head, Supervisor, or Auditor)</li>
                <li>• Account activation and dashboard access</li>
                <li>• Email notification upon approval</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Your Information</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Department:</strong> {user.department || 'Not specified'}</p>
                <p><strong>Phone:</strong> {user.phone || 'Not specified'}</p>
                {user.assignedAreas && user.assignedAreas.length > 0 && (
                  <p><strong>Preferred Areas:</strong> {user.assignedAreas.join(', ')}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              This process typically takes 24-48 hours during business days.
            </p>
          </div>
        </div>

        {/* Role Icons */}
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
                            <p className="text-xs text-gray-600">Department Head</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-xs text-gray-600">Supervisor</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ClipboardCheck className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Auditor</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Questions? Contact{' '}
              <a href="mailto:support@municipal.gov.in" className="font-medium text-blue-600 hover:text-blue-500">
                support@municipal.gov.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PendingApprovalContent />
    </Suspense>
  );
}

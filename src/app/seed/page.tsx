'use client';

import React, { useState } from 'react';
import { seedDatabase } from '@/lib/seedData';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CheckCircle, AlertCircle, Database } from 'lucide-react';

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setResult(null);
    
    try {
      await seedDatabase();
      setResult({
        success: true,
        message: 'Database seeded successfully! You can now sign in with the test accounts.'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setResult({
        success: false,
        message: `Error seeding database: ${errorMessage}`
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg shadow-lg mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database Setup
          </h1>
          <p className="text-gray-600">
            Initialize your Firestore database with test data
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                This will create test users, areas, and issues in your Firestore database.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Test Accounts
                </h3>
                <div className="space-y-2 text-xs text-blue-700">
                  <div>Super Admin: admin@municipal.com / admin123</div>
                  <div>City Engineer: engineer@municipal.com / engineer123</div>
                  <div>Field Supervisor: supervisor@municipal.com / supervisor123</div>
                  <div>Auditor: auditor@municipal.com / auditor123</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Seeding Database...</span>
                </div>
              ) : (
                'Seed Database'
              )}
            </button>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm font-medium">{result.message}</span>
                </div>
              </div>
            )}

            {result?.success && (
              <div className="text-center">
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Go to Login →
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 Municipal Hazard Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

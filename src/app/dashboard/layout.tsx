'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle sidebar collapse based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Layout Container */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - Fixed Width */}
        <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-70'
        }`}>
          <div className="w-full">
            <Sidebar className={sidebarCollapsed ? 'collapsed' : ''} />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed inset-y-0 left-0 z-50 w-70 lg:hidden transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl`}>
          <Sidebar />
        </div>

        {/* Main Content Area - Takes remaining space */}
        <div className="flex-1 min-w-0">
          {/* Header - Fixed at top */}
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content - Single scrollable area */}
          <main className="bg-gray-50 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

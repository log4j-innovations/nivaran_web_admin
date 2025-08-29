'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Bell, ChevronDown } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOutUser();
    router.push('/login');
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Center - Search and Quick Actions */}
        <div className="flex-1 max-w-md mx-auto lg:mx-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-105">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </button>

          {/* Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <span className="text-sm font-semibold">
                {user?.role ? formatRole(user.role) : 'User'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Switch Role</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Super Admin</button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">City Engineer</button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Field Supervisor</button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Auditor</button>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-105"
          >
            {signingOut ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="hidden sm:block">Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

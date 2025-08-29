'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User, Settings, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOutUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Center - Title */}
        <div className="flex-1 lg:flex lg:justify-center">
          <h1 className="text-xl font-semibold text-gray-900 lg:text-center">
            {user?.role === 'super_admin' ? 'Super Admin Dashboard' : 
             user?.role === 'city_engineer' ? 'City Engineer Dashboard' :
             user?.role === 'field_supervisor' ? 'Field Supervisor Dashboard' :
             user?.role === 'auditor' ? 'Auditor Dashboard' : 'Dashboard'}
          </h1>
        </div>

        {/* Right side - User menu and logout */}
        <div className="flex items-center space-x-3">
          {/* User info and role badge */}
          <div className="flex items-center space-x-3">
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {user?.role ? formatRole(user.role) : 'User'}
            </span>
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.name}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
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

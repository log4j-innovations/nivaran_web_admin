'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  MapPin, 
  BarChart3, 
  Settings, 
  FileText,
  Shield,
  X
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  role?: string;
}

const navigationSections = {
  main: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
  ],
  management: [
    { name: 'Issues', href: '/issues', icon: AlertTriangle, badge: '12' },
    { name: 'Users', href: '/dashboard/users', icon: Users, role: 'super_admin' },
    { name: 'Areas', href: '/dashboard/areas', icon: MapPin },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, role: 'super_admin' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, role: 'city_engineer' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, role: 'auditor' }
  ],
  settings: [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings }
  ]
};

export const Sidebar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Check if sidebar is collapsed based on className
  const isCollapsed = className.includes('collapsed');

  const getFilteredItems = (items: NavItem[]) => items.filter(item => 
    !item.role || user?.role === item.role || user?.role === 'super_admin'
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`bg-white border-r border-gray-200 w-full min-h-screen flex flex-col ${className}`}>
      {/* Sidebar Header */}
      <div className={`border-b border-gray-200 transition-all duration-300 ${isCollapsed ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              </div>
            )}
          </div>
          <button
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 transition-all duration-300 ${isCollapsed ? 'px-2 py-4' : 'px-4 py-6'}`}>
        <div className="space-y-6">
          {/* Main Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
              </div>
            )}
            <ul className="space-y-1">
              {getFilteredItems(navigationSections.main).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={`${item.name}-${item.role || 'default'}`}>
                    <Link
                      href={item.href}
                      className={`group flex items-center transition-all duration-200 hover:scale-105 ${
                        isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3 py-3'
                      } rounded-xl text-sm font-medium ${
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : ''} flex-shrink-0`} />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Management Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</h3>
              </div>
            )}
            <ul className="space-y-1">
              {getFilteredItems(navigationSections.management).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={`${item.name}-${item.role || 'default'}`}>
                    <Link
                      href={item.href}
                      className={`group flex items-center transition-all duration-200 hover:scale-105 ${
                        isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3 py-3'
                      } rounded-xl text-sm font-medium ${
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : ''} flex-shrink-0`} />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Settings Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</h3>
              </div>
            )}
            <ul className="space-y-1">
              {getFilteredItems(navigationSections.settings).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={`${item.name}-${item.role || 'default'}`}>
                    <Link
                      href={item.href}
                      className={`group flex items-center transition-all duration-200 hover:scale-105 ${
                        isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3 py-3'
                      } rounded-xl text-sm font-medium ${
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : ''} flex-shrink-0`} />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* User Info */}
      <div className={`border-t border-gray-200 transition-all duration-300 ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

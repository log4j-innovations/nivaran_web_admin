'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Building2, 
  Shield, 
  Wrench, 
  ClipboardCheck,
  LogOut,
  Settings,
  Bell,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'SuperAdmin' | 'Department Head' | 'Supervisor' | 'Auditor';
}

const roleConfig = {
  SuperAdmin: {
    title: 'Super Admin Dashboard',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    route: '/admin'
  },
  'Department Head': {
    title: 'Department Head Dashboard',
    icon: Wrench,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    route: '/departmenthead'
  },
  Supervisor: {
    title: 'Field Supervisor Dashboard',
    icon: Building2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    route: '/supervisor'
  },
  Auditor: {
    title: 'Auditor Dashboard',
    icon: ClipboardCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    route: '/auditor'
  }
};

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  
  const config = roleConfig[role];
  const IconComponent = config.icon;

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: config.route, icon: IconComponent },
    { name: 'Issues', href: `${config.route}/issues`, icon: Building2 },
    { name: 'Reports', href: `${config.route}/reports`, icon: ClipboardCheck },
    ...(role === 'SuperAdmin' ? [{ name: 'Users', href: '/admin/users', icon: User }] : []),
    ...(role === 'SuperAdmin' ? [{ name: 'Settings', href: '/admin/settings', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <IconComponent className={`h-8 w-8 ${config.color}`} />
              <span className="ml-2 text-lg font-semibold text-gray-900">{config.title}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </a>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <IconComponent className={`h-8 w-8 ${config.color}`} />
            <span className="ml-2 text-lg font-semibold text-gray-900">{config.title}</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </a>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

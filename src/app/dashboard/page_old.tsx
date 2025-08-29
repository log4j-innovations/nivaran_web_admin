'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { StatsCard } from '@/components/StatsCard';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  TrendingUp,
  FileText,
  Shield,
  BarChart3,
  Settings,
  Activity,
  Database,
  Server,
  Wifi,
  Bell,
  Plus,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface StatItem {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');

  // Fix hydration issue by setting greeting on client side
  useEffect(() => {
    const time = new Date().getHours();
    let newGreeting = 'Good morning';
    
    if (time >= 12 && time < 17) {
      newGreeting = 'Good afternoon';
    } else if (time >= 17) {
      newGreeting = 'Good evening';
    }
    
    setGreeting(newGreeting);
  }, []);

  // Mock data - in real app this would come from Firebase
  const stats = {
    totalIssues: 156,
    pendingIssues: 23,
    resolvedIssues: 98,
    activeUsers: 45,
    areasCovered: 12,
    slaCompliance: 87,
    monthlyReports: 8,
    systemHealth: 'Excellent'
  };

  const getRoleBasedStats = (): StatItem[] => {
    switch (user?.role) {
      case 'super_admin':
        return [
          {
            title: 'Total Reports',
            value: '5',
            subtitle: '98 resolved',
            icon: AlertTriangle,
            color: 'blue',
            trend: { value: 8, isPositive: true }
          },
          {
            title: 'Active Users',
            value: '6',
            subtitle: '6 total registered',
            icon: Users,
            color: 'green'
          },
          {
            title: 'Pending Issues',
            value: '32',
            subtitle: 'Requires attention',
            icon: Clock,
            color: 'yellow'
          },
          {
                            title: 'System Health',
                value: '98%',
                subtitle: 'Uptime this month',
                icon: CheckCircle,
                color: 'green',
                trend: { value: 2, isPositive: true }
              },
              {
                title: 'Total Areas',
                value: '12',
                subtitle: 'Geographic zones',
                icon: MapPin,
                color: 'blue'
              },
              {
                title: 'Response Time',
                value: '2.4h',
                subtitle: 'Average response',
                icon: Clock,
                color: 'yellow'
              }
        ];
      
      case 'city_engineer':
        return [
          {
            title: 'Assigned Issues',
            value: '2',
            subtitle: 'Total issues assigned to you',
            icon: AlertTriangle,
            color: 'blue',
            trend: { value: 12, isPositive: true }
          },
          {
            title: 'Resolved This Month',
            value: '0',
            subtitle: 'Issues completed successfully',
            icon: CheckCircle,
            color: 'green',
            trend: { value: 8, isPositive: false }
          },
          {
            title: 'In Progress',
            value: '1',
            subtitle: 'Currently being worked on',
            icon: Clock,
            color: 'yellow'
          },
          {
            title: 'Pending Review',
            value: '0',
            subtitle: 'Awaiting your attention',
            icon: Shield,
            color: 'red'
          }
        ];
      
      case 'field_supervisor':
        return [
          {
            title: 'Field Tasks',
            value: '8',
            subtitle: 'Active field assignments',
            icon: MapPin,
            color: 'blue',
            trend: { value: 5, isPositive: true }
          },
          {
            title: 'Completed Today',
            value: '3',
            subtitle: 'Tasks finished today',
            icon: CheckCircle,
            color: 'green'
          },
          {
            title: 'Pending Updates',
            value: '2',
            subtitle: 'Need status updates',
            icon: Clock,
            color: 'yellow'
          },
          {
            title: 'Team Efficiency',
            value: '92%',
            subtitle: 'Performance this week',
            icon: TrendingUp,
            color: 'green',
            trend: { value: 3, isPositive: true }
          }
        ];
      
      case 'auditor':
        return [
          {
            title: 'Audit Reports',
            value: '12',
            subtitle: 'Reports generated',
            icon: FileText,
            color: 'blue'
          },
          {
            title: 'Compliance Rate',
            value: '94%',
            subtitle: 'Overall compliance',
            icon: Shield,
            color: 'green',
            trend: { value: 2, isPositive: true }
          },
          {
            title: 'Issues Reviewed',
            value: '28',
            subtitle: 'This month',
            icon: AlertTriangle,
            color: 'blue'
          },
          {
            title: 'Risk Assessment',
            value: 'Low',
            subtitle: 'Current risk level',
            icon: TrendingUp,
            color: 'green'
          }
        ];
      
      default:
        return [];
    }
  };

  const getWelcomeMessage = () => {
    return `${greeting}, ${user?.name}`;
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'super_admin':
        return 'You have full access to all system features and user management.';
      case 'city_engineer':
        return 'Manage and oversee all reported hazards and field operations.';
      case 'field_supervisor':
        return 'Handle field assignments and update issue progress in real-time.';
      case 'auditor':
        return 'Review system performance and generate compliance reports.';
      default:
        return 'Welcome to the Municipal Hazard Dashboard.';
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.role === 'super_admin' ? 'Super Admin Dashboard' : 
               user?.role === 'city_engineer' ? 'City Engineer Dashboard' :
               user?.role === 'field_supervisor' ? 'Field Supervisor Dashboard' :
               user?.role === 'auditor' ? 'Auditor Dashboard' : 'Dashboard'}
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {getRoleBasedStats().map((stat, index) => (
          <StatsCard
            key={`stat-${stat.title}-${index}`}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            className="animate-fade-in hover:scale-105 transition-transform duration-200"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Left Column - 3/4 width */}
        <div className="xl:col-span-3 space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 group">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Add User</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all duration-200 group">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">New Area</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg transition-all duration-200 group">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Report Issue</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all duration-200 group">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Analytics</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-lg transition-all duration-200 group">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Reports</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-lg transition-all duration-200 group">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Settings</span>
              </button>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Issue Resolution Rate</span>
                  <span className="text-gray-900 font-medium">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Response Time SLA</span>
                  <span className="text-gray-900 font-medium">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '94%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="text-gray-900 font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">System Uptime</span>
                  <span className="text-gray-900 font-medium">99%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '99%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Different Roles */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Test Different Roles</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 rounded-lg border border-gray-200 transition-all duration-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Super Admin</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 rounded-lg border border-gray-200 transition-all duration-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">City Engineer</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 rounded-lg border border-gray-200 transition-all duration-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Auditor</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 rounded-lg border border-gray-200 transition-all duration-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Field Supervisor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - 1/4 width */}
        <div className="xl:col-span-1 space-y-4">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup System</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-yellow-600 font-medium">Syncing</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notifications</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Issue #1247 resolved</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Report submitted</p>
                  <p className="text-xs text-gray-500">12 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Area updated</p>
                  <p className="text-xs text-gray-500">18 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Priority issue reported</p>
                  <p className="text-xs text-gray-500">25 minutes ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today's Reports</span>
                <span className="text-lg font-bold text-blue-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-lg font-bold text-green-600">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Tasks</span>
                <span className="text-lg font-bold text-yellow-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-lg font-bold text-green-600">94</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">High Priority Alert</p>
                  <p className="text-xs text-red-700">Gas leak reported on Main St</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Maintenance Scheduled</p>
                  <p className="text-xs text-yellow-700">System update at 2AM tonight</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">New Feature</p>
                  <p className="text-xs text-blue-700">Mobile app updated to v2.1</p>
                </div>
              </div>
            </div>
          </div>

          {/* Area Coverage */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Coverage</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Downtown</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Residential</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Industrial</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">78%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Parks</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '96%'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">96%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* Recent Issues */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Sample Issue Cards */}
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Pothole on Main Street</h3>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">High</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Reported 2 hours ago</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Road Safety</span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Broken Streetlight</h3>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Reported 4 hours ago</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Lighting</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">In Progress</span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Water Leak on Oak Ave</h3>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">High</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Reported 6 hours ago</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Utilities</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Resolved</span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Debris on Highway</h3>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Reported 8 hours ago</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Road Safety</span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Traffic Signal Malfunction</h3>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">High</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Reported 1 day ago</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Traffic</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">In Progress</span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Park Bench Damage</h3>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Low</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Reported 1 day ago</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Parks</span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

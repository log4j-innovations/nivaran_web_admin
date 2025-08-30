'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { RoleGuard } from '@/components/RoleGuard';
import { useToast } from '@/lib/toastContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import {
  Users,
  Shield,
  Database,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  HardDrive,
  BarChart3,
  MonitorSpeaker,
  Wrench,
  Wifi
} from 'lucide-react';

interface StatItem {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [greeting, setGreeting] = useState('Good morning');

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <SuperAdminDashboardContent user={user} toast={toast} greeting={greeting} setGreeting={setGreeting} />
    </RoleGuard>
  );
}

interface SuperAdminDashboardContentProps {
  user: {
    name: string;
    role: string;
  } | null;
  toast: {
    success: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
  };
  greeting: string;
  setGreeting: (greeting: string) => void;
}

function SuperAdminDashboardContent({ user, toast, greeting, setGreeting }: SuperAdminDashboardContentProps) {

  useEffect(() => {
    const time = new Date().getHours();
    let newGreeting = 'Good morning';

    if (time >= 12 && time < 17) {
      newGreeting = 'Good afternoon';
    } else if (time >= 17) {
      newGreeting = 'Good evening';
    }

    setGreeting(newGreeting);
  }, [setGreeting]);

  const superAdminStats: StatItem[] = [
    {
      title: 'Total System Users',
      value: '247',
      subtitle: '12 new this month',
      icon: Users,
      color: 'blue',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Active Issues',
      value: '34',
      subtitle: '6 critical, 12 high priority',
      icon: AlertTriangle,
      color: 'red',
      trend: { value: 5, isPositive: false }
    },
    {
      title: 'System Performance',
      value: '99.2%',
      subtitle: 'Uptime this month',
      icon: CheckCircle,
      color: 'green',
      trend: { value: 2, isPositive: true }
    },
    {
      title: 'Data Storage',
      value: '2.4TB',
      subtitle: '68% capacity used',
      icon: Database,
      color: 'purple'
    },
    {
      title: 'Response Time',
      value: '1.2h',
      subtitle: 'Average system response',
      icon: Activity,
      color: 'indigo',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Security Status',
      value: 'Secure',
      subtitle: 'All systems protected',
      icon: Shield,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Super Admin Welcome Header with Deep Blue Theme */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              {greeting}, {user?.name}
            </h1>
            <p className="text-blue-100 text-base sm:text-lg font-medium">
              System Administration & User Management
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                Super Administrator
              </div>
              <div className="bg-green-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>All Systems Online</span>
              </div>
              <div className="bg-blue-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                247 Active Users
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end space-x-4 lg:space-x-6">
            <div className="text-center bg-white/10 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold">{new Date().getDate()}</div>
              <div className="text-xs sm:text-sm text-blue-200 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - System Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {superAdminStats.map((stat, index) => (
          <div 
            key={`stat-${stat.title}-${index}`} 
            className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                stat.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                stat.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                stat.color === 'yellow' ? 'bg-yellow-100 group-hover:bg-yellow-200' :
                stat.color === 'red' ? 'bg-red-100 group-hover:bg-red-200' :
                stat.color === 'purple' ? 'bg-purple-100 group-hover:bg-purple-200' :
                stat.color === 'indigo' ? 'bg-indigo-100 group-hover:bg-indigo-200' :
                'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  stat.color === 'indigo' ? 'text-indigo-600' :
                  'text-gray-600'
                }`} />
              </div>
              {stat.trend && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
                  stat.trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{stat.trend.value}%</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">{stat.title}</h3>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-none">{stat.value}</div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Actions and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Admin Quick Actions */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">System Administration</h2>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button 
              onClick={() => toast.success('User Added', 'New system user has been successfully created')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-sm sm:text-base font-semibold">Add User</span>
              </div>
            </button>

            <button 
              onClick={() => toast.info('System Settings', 'Configure global system parameters')}
              className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-sm sm:text-base font-semibold">Settings</span>
              </div>
            </button>

            <button 
              onClick={() => toast.warning('Backup Started', 'System backup process has been initiated')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <HardDrive className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-sm sm:text-base font-semibold">Backup Data</span>
              </div>
            </button>

            <button 
              onClick={() => toast.info('Reports Generated', 'System performance reports are ready')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 sm:p-6 text-white hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-sm sm:text-base font-semibold">View Reports</span>
              </div>
            </button>
          </div>
        </div>

        {/* System Health Status */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">System Health</h2>
            <MonitorSpeaker className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Database Cluster</div>
                  <div className="text-sm text-gray-500">Primary & replica nodes</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Healthy</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Server className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Application Servers</div>
                  <div className="text-sm text-gray-500">Load balanced cluster</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Network Status</div>
                  <div className="text-sm text-gray-500">CDN & load balancers</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">Optimal</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Maintenance Window</div>
                  <div className="text-sm text-gray-500">Scheduled for tonight</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-700">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admin Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent System Activities</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
          <div className="space-y-4">
            {[
              { action: "User account created", detail: "New city engineer: Sarah Johnson", time: "2 min ago", type: "user", color: "green", status: "resolved", priority: "low" },
              { action: "System backup completed", detail: "Weekly automated backup finished", time: "15 min ago", type: "system", color: "blue", status: "resolved", priority: "medium" },
              { action: "Security alert resolved", detail: "Failed login attempts blocked", time: "1 hour ago", type: "security", color: "red", status: "resolved", priority: "high" },
              { action: "Database maintenance", detail: "Index optimization completed", time: "2 hours ago", type: "maintenance", color: "purple", status: "resolved", priority: "medium" },
              { action: "New role assigned", detail: "Field supervisor permissions updated", time: "3 hours ago", type: "permission", color: "orange", status: "resolved", priority: "low" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activity.color === 'red' ? 'bg-red-100' :
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'purple' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    activity.color === 'red' ? 'text-red-600' :
                    activity.color === 'green' ? 'text-green-600' :
                    activity.color === 'blue' ? 'text-blue-600' :
                    activity.color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-500 mb-2">{activity.detail}</div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={activity.status as 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed'} size="sm" />
                    <PriorityIndicator priority={activity.priority as 'low' | 'medium' | 'high' | 'critical'} variant="icon" size="sm" />
                  </div>
                </div>
                <div className="text-sm text-gray-400 font-medium">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">System Metrics</h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { metric: "Active Sessions", count: 127, percentage: 85, color: "bg-blue-500" },
              { metric: "CPU Usage", count: 45, percentage: 45, color: "bg-green-500" },
              { metric: "Memory Usage", count: 68, percentage: 68, color: "bg-yellow-500" },
              { metric: "Disk Usage", count: 72, percentage: 72, color: "bg-orange-500" },
              { metric: "Network I/O", count: 34, percentage: 34, color: "bg-purple-500" }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                  <span className="text-sm font-bold text-gray-900">{item.count}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

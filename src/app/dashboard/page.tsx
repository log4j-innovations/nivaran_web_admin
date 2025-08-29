'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Shield,
  Activity,
  Database,
  Server,
  Wifi,
  Bell,
  Plus,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  AlertCircle,
  PieChart,
  MonitorSpeaker
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

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [greeting, setGreeting] = useState('Good morning');

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

  const getRoleBasedStats = (): StatItem[] => {
    switch (user?.role) {
      case 'super_admin':
        return [
          {
            title: 'Total Reports',
            value: '156',
            subtitle: '98 resolved this month',
            icon: AlertTriangle,
            color: 'blue',
            trend: { value: 12, isPositive: true }
          },
          {
            title: 'Active Users',
            value: '89',
            subtitle: '6 new this week',
            icon: Users,
            color: 'green',
            trend: { value: 8, isPositive: true }
          },
          {
            title: 'Pending Issues',
            value: '23',
            subtitle: 'Requires attention',
            icon: Clock,
            color: 'yellow',
            trend: { value: 5, isPositive: false }
          },
          {
            title: 'System Health',
            value: '98.5%',
            subtitle: 'Uptime this month',
            icon: CheckCircle,
            color: 'green',
            trend: { value: 2, isPositive: true }
          },
          {
            title: 'Geographic Areas',
            value: '12',
            subtitle: 'Coverage zones',
            icon: MapPin,
            color: 'purple'
          },
          {
            title: 'Response Time',
            value: '2.4h',
            subtitle: 'Average response',
            icon: Activity,
            color: 'indigo',
            trend: { value: 15, isPositive: true }
          }
        ];

      default:
        return [];
    }
  };

  const getWelcomeMessage = () => {
    return `${greeting}, ${user?.name}`;
  };

  return (
    <div className="space-y-6 w-full h-full">
      {/* Modern Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              {getWelcomeMessage()}
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              Complete system oversight and management
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                Super Administrator
              </div>
              <div className="bg-green-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold">{new Date().getDate()}</div>
              <div className="text-sm text-blue-200 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Shield className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {getRoleBasedStats().map((stat, index) => (
          <div 
            key={`stat-${stat.title}-${index}`} 
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                stat.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                stat.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                stat.color === 'yellow' ? 'bg-yellow-100 group-hover:bg-yellow-200' :
                stat.color === 'red' ? 'bg-red-100 group-hover:bg-red-200' :
                stat.color === 'purple' ? 'bg-purple-100 group-hover:bg-purple-200' :
                stat.color === 'indigo' ? 'bg-indigo-100 group-hover:bg-indigo-200' :
                'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <stat.icon className={`w-7 h-7 ${
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
              <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{stat.title}</h3>
              <div className="text-4xl font-bold text-gray-900 leading-none">{stat.value}</div>
              <p className="text-gray-500 text-sm font-medium">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout for Actions and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions - Left Side */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => toast.success('User Added', 'New user has been successfully added to the system')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span className="font-semibold">Add User</span>
              </div>
            </button>

            <button 
              onClick={() => toast.info('New Area', 'Create a new geographic area for monitoring')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="font-semibold">New Area</span>
              </div>
            </button>

            <button 
              onClick={() => toast.warning('Issue Reported', 'A new high-priority issue has been logged')}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <span className="font-semibold">Report Issue</span>
              </div>
            </button>

            <button 
              onClick={() => toast.error('Analytics Error', 'Failed to load analytics data. Please try again.')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <PieChart className="w-6 h-6" />
                </div>
                <span className="font-semibold">Analytics</span>
              </div>
            </button>
          </div>
        </div>

        {/* System Status - Right Side */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">System Status</h2>
            <MonitorSpeaker className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Database</div>
                  <div className="text-sm text-gray-500">Primary cluster</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Server className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">API Services</div>
                  <div className="text-sm text-gray-500">REST & GraphQL</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Backup System</div>
                  <div className="text-sm text-gray-500">Auto sync enabled</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-700">Syncing</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Notifications</div>
                  <div className="text-sm text-gray-500">Real-time alerts</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Recent Activity and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
          <div className="space-y-4">
            {[
              { action: "New issue reported", detail: "Pothole on Main Street", time: "2 min ago", type: "issue", color: "red", status: "pending", priority: "high" },
              { action: "User registration", detail: "Sarah Johnson joined as Engineer", time: "5 min ago", type: "user", color: "green", status: "resolved", priority: "low" },
              { action: "Issue resolved", detail: "Streetlight repair completed", time: "12 min ago", type: "resolution", color: "blue", status: "resolved", priority: "medium" },
              { action: "System maintenance", detail: "Database backup completed", time: "1 hour ago", type: "system", color: "purple", status: "in_progress", priority: "critical" },
              { action: "Area updated", detail: "Downtown zone boundaries modified", time: "2 hours ago", type: "area", color: "orange", status: "escalated", priority: "high" }
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

        {/* Mini Analytics - 1/3 width */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Issue Categories</h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { category: "Road Safety", count: 45, percentage: 65, color: "bg-red-500" },
              { category: "Utilities", count: 23, percentage: 40, color: "bg-blue-500" },
              { category: "Lighting", count: 18, percentage: 30, color: "bg-yellow-500" },
              { category: "Parks", count: 12, percentage: 20, color: "bg-green-500" },
              { category: "Traffic", count: 8, percentage: 15, color: "bg-purple-500" }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
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

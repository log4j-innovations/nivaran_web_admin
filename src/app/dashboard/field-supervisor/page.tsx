'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import {
  MapPin,
  CheckCircle,
  Camera,
  Users,
  Activity,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  Route,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

interface StatItem {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple' | 'orange';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function FieldSupervisorDashboard() {
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

  const supervisorStats: StatItem[] = [
    {
      title: 'My Assignments',
      value: '14',
      subtitle: '3 due today, 5 in progress',
      icon: Wrench,
      color: 'green',
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Today Tasks",
      value: '7',
      subtitle: '3 completed, 4 remaining',
      icon: CheckCircle,
      color: 'blue',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Completion Rate',
      value: '92%',
      subtitle: 'Above team average (88%)',
      icon: TrendingUp,
      color: 'green',
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'My Zone',
      value: 'Downtown',
      subtitle: '2.5 km² coverage area',
      icon: MapPin,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Field Supervisor Welcome Header with Road Green Theme */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {greeting}, {user?.name}
            </h1>
            <p className="text-green-100 text-lg font-medium">
              Field Operations & Task Management
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                Field Supervisor
              </div>
              <div className="bg-green-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>14 Active Tasks</span>
              </div>
              <div className="bg-emerald-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                Downtown Zone
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="text-center bg-white/10 p-3 md:p-4 rounded-xl backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold">{new Date().getDate()}</div>
              <div className="text-xs md:text-sm text-green-200 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Wrench className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {supervisorStats.map((stat, index) => (
          <div 
            key={`stat-${stat.title}-${index}`} 
            className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                stat.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                stat.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                stat.color === 'yellow' ? 'bg-yellow-100 group-hover:bg-yellow-200' :
                stat.color === 'red' ? 'bg-red-100 group-hover:bg-red-200' :
                stat.color === 'purple' ? 'bg-purple-100 group-hover:bg-purple-200' :
                stat.color === 'orange' ? 'bg-orange-100 group-hover:bg-orange-200' :
                'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <stat.icon className={`w-6 h-6 md:w-7 md:h-7 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  stat.color === 'orange' ? 'text-orange-600' :
                  'text-gray-600'
                }`} />
              </div>
              {stat.trend && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs md:text-sm font-medium ${
                  stat.trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{stat.trend.value}%</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide">{stat.title}</h3>
              <div className="text-2xl md:text-4xl font-bold text-gray-900 leading-none">{stat.value}</div>
              <p className="text-gray-500 text-xs md:text-sm font-medium">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-First Action Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Actions - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Field Actions</h2>
            <Wrench className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <button 
              onClick={() => toast.success('Status Updated', 'Task status has been updated successfully')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 md:p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="font-semibold text-sm md:text-base">Update Status</span>
              </div>
            </button>

            <button 
              onClick={() => toast.info('Photo Upload', 'Camera interface opened for documentation')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Camera className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="font-semibold text-sm md:text-base">Upload Photo</span>
              </div>
            </button>

            <button 
              onClick={() => toast.warning('Help Requested', 'Assistance request sent to dispatch')}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 md:p-6 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <HelpCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="font-semibold text-sm md:text-base">Request Help</span>
              </div>
            </button>

            <button 
              onClick={() => toast.success('Route Optimized', 'Best route calculated for your assignments')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 md:p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Route className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="font-semibold text-sm md:text-base">View Route</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Task List */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Today Tasks</h2>
            <span className="bg-green-100 text-green-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">7 Total</span>
          </div>
          <div className="space-y-3 md:space-y-4">
            {[
              { task: "Repair sidewalk crack", location: "Oak Street & 2nd Ave", priority: "high", status: "pending", time: "Due in 2h" },
              { task: "Install new street sign", location: "Main Street Park", priority: "medium", status: "in_progress", time: "Started 1h ago" },
              { task: "Fix pothole", location: "Elm Street", priority: "critical", status: "pending", time: "Overdue" },
              { task: "Replace broken light", location: "City Center", priority: "low", status: "resolved", time: "Completed" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 active:bg-gray-200">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{item.task}</div>
                    <div className="text-xs md:text-sm text-gray-600 truncate">{item.location}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <StatusBadge status={item.status as 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed'} size="sm" />
                      <PriorityIndicator priority={item.priority as 'low' | 'medium' | 'high' | 'critical'} variant="icon" size="sm" />
                    </div>
                  </div>
                </div>
                <div className="text-xs md:text-sm text-gray-400 font-medium text-right ml-2">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Activity Feed */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Field Activity</h2>
          <button className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View All</span>
          </button>
        </div>
        <div className="space-y-3 md:space-y-4">
          {[
            { action: "Task completed", detail: "Pothole repair on Maple Street", time: "10 min ago", type: "completion", color: "green", status: "resolved", priority: "high" },
            { action: "Photo uploaded", detail: "Before/after documentation", time: "25 min ago", type: "documentation", color: "blue", status: "in_progress", priority: "medium" },
            { action: "Help requested", detail: "Additional crew needed for water leak", time: "1 hour ago", type: "request", color: "orange", status: "escalated", priority: "critical" },
            { action: "Route updated", detail: "Optimized path for 5 locations", time: "2 hours ago", type: "navigation", color: "purple", status: "resolved", priority: "low" }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activity.color === 'red' ? 'bg-red-100' :
                activity.color === 'green' ? 'bg-green-100' :
                activity.color === 'blue' ? 'bg-blue-100' :
                activity.color === 'purple' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <Activity className={`w-4 h-4 md:w-5 md:h-5 ${
                  activity.color === 'red' ? 'text-red-600' :
                  activity.color === 'green' ? 'text-green-600' :
                  activity.color === 'blue' ? 'text-blue-600' :
                  activity.color === 'purple' ? 'text-purple-600' :
                  'text-orange-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm md:text-base">{activity.action}</div>
                <div className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2 truncate">{activity.detail}</div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={activity.status as 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed'} size="sm" />
                  <PriorityIndicator priority={activity.priority as 'low' | 'medium' | 'high' | 'critical'} variant="icon" size="sm" />
                </div>
              </div>
              <div className="text-xs md:text-sm text-gray-400 font-medium text-right">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation Simulation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 lg:hidden z-50">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center space-y-1 p-2 text-green-600">
            <Wrench className="w-5 h-5" />
            <span className="text-xs font-medium">Tasks</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-400">
            <MapPin className="w-5 h-5" />
            <span className="text-xs font-medium">Map</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-400">
            <Camera className="w-5 h-5" />
            <span className="text-xs font-medium">Camera</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-400">
            <Activity className="w-5 h-5" />
            <span className="text-xs font-medium">Activity</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Add bottom padding to account for mobile navigation */}
      <div className="h-16 lg:hidden"></div>
    </div>
  );
}

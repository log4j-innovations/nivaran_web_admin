'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  Users,
  Activity,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  FileText,
  TrendingUp,
  BarChart3,
  UserCheck
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

export default function CityEngineerDashboard() {
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

  const engineerStats: StatItem[] = [
    {
      title: 'Active Issues',
      value: '42',
      subtitle: '8 critical, 15 high priority',
      icon: AlertTriangle,
      color: 'orange',
      trend: { value: 12, isPositive: false }
    },
    {
      title: 'SLA Compliance',
      value: '94%',
      subtitle: 'Above target (90%)',
      icon: CheckCircle,
      color: 'green',
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'Area Coverage',
      value: '8',
      subtitle: 'Districts under supervision',
      icon: MapPin,
      color: 'blue'
    },
    {
      title: 'Escalations',
      value: '6',
      subtitle: 'Require immediate attention',
      icon: TrendingUp,
      color: 'red',
      trend: { value: 15, isPositive: false }
    },
    {
      title: 'Field Teams',
      value: '12',
      subtitle: 'Currently deployed',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Avg Resolution',
      value: '2.8h',
      subtitle: 'Below target (3.5h)',
      icon: Activity,
      color: 'green',
      trend: { value: 20, isPositive: true }
    }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* City Engineer Welcome Header with Safety Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-red-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              {greeting}, {user?.name}
            </h1>
            <p className="text-orange-100 text-lg font-medium">
              Engineering Operations & Issue Management
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                City Engineer
              </div>
              <div className="bg-red-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>6 Escalations</span>
              </div>
              <div className="bg-orange-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                42 Active Issues
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold">{new Date().getDate()}</div>
              <div className="text-sm text-orange-200 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Wrench className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - Engineering Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {engineerStats.map((stat, index) => (
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
                stat.color === 'orange' ? 'bg-orange-100 group-hover:bg-orange-200' :
                'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <stat.icon className={`w-7 h-7 ${
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

      {/* Engineering Actions and Issue Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engineering Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Engineering Actions</h2>
            <Wrench className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => toast.warning('Issue Assigned', 'New critical issue assigned to field team')}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="font-semibold">Assign Issue</span>
              </div>
            </button>

            <button 
              onClick={() => toast.info('Report Generated', 'Engineering performance report created')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="font-semibold">Create Report</span>
              </div>
            </button>

            <button 
              onClick={() => toast.success('Map Updated', 'Interactive engineering map refreshed')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="font-semibold">View Map</span>
              </div>
            </button>

            <button 
              onClick={() => toast.info('Areas Managed', 'Area management interface opened')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="font-semibold">Manage Areas</span>
              </div>
            </button>
          </div>
        </div>

        {/* Escalation Queue */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Escalation Queue</h2>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">6 Critical</span>
          </div>
          <div className="space-y-4">
            {[
              { title: "Water Main Break", location: "Downtown District", time: "3h overdue", severity: "critical", type: "water" },
              { title: "Traffic Signal Failure", location: "Main & 5th Street", time: "1h overdue", severity: "high", type: "traffic" },
              { title: "Bridge Inspection Due", location: "River Bridge", time: "Due today", severity: "medium", type: "inspection" },
              { title: "Sinkhole Report", location: "Residential Area", time: "2h remaining", severity: "high", type: "road" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-700">{item.time}</div>
                  <PriorityIndicator 
                    priority={item.severity as 'low' | 'medium' | 'high' | 'critical'} 
                    variant="badge" 
                    size="sm" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Engineering Activities and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Engineering Activities</h2>
            <button className="text-orange-600 hover:text-orange-800 text-sm font-semibold flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
          <div className="space-y-4">
            {[
              { action: "Issue assigned to field team", detail: "Pothole repair on Oak Street", time: "5 min ago", type: "assignment", color: "orange", status: "in_progress", priority: "high" },
              { action: "SLA compliance check", detail: "Downtown district performance review", time: "20 min ago", type: "review", color: "blue", status: "resolved", priority: "medium" },
              { action: "Emergency response", detail: "Water leak on Maple Avenue", time: "1 hour ago", type: "emergency", color: "red", status: "resolved", priority: "critical" },
              { action: "Area performance update", detail: "Residential zone metrics updated", time: "2 hours ago", type: "update", color: "green", status: "resolved", priority: "low" },
              { action: "Team deployment", detail: "5 supervisors sent to urgent sites", time: "3 hours ago", type: "deployment", color: "purple", status: "resolved", priority: "high" }
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

        {/* Area Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Area Performance</h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { area: "Downtown", performance: 95, issues: 12, color: "bg-green-500" },
              { area: "Industrial", performance: 88, issues: 8, color: "bg-blue-500" },
              { area: "Residential", performance: 92, issues: 15, color: "bg-green-500" },
              { area: "Commercial", performance: 78, issues: 7, color: "bg-yellow-500" },
              { area: "Waterfront", performance: 85, issues: 5, color: "bg-orange-500" }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{item.area}</span>
                    <div className="text-xs text-gray-500">{item.issues} active issues</div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.performance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.performance}%` }}
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

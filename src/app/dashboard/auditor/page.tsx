'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import {
  FileText,
  BarChart3,
  CheckCircle,
  Activity,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  TrendingUp,
  Shield,
  Database,
  ClipboardList
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

export default function AuditorDashboard() {
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

  const auditorStats: StatItem[] = [
    {
      title: 'Compliance Score',
      value: '94%',
      subtitle: 'Above target (90%)',
      icon: Shield,
      color: 'yellow',
      trend: { value: 3, isPositive: true }
    },
    {
      title: 'Audit Reports',
      value: '28',
      subtitle: '5 generated this month',
      icon: FileText,
      color: 'blue',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Issues Reviewed',
      value: '156',
      subtitle: 'Across all departments',
      icon: ClipboardList,
      color: 'green'
    },
    {
      title: 'SLA Adherence',
      value: '87%',
      subtitle: 'Performance tracking',
      icon: CheckCircle,
      color: 'green',
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'Risk Assessment',
      value: 'Low',
      subtitle: 'Current system risk level',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Data Exports',
      value: '42',
      subtitle: 'Reports exported this quarter',
      icon: Database,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Auditor Welcome Header with Warning Yellow Theme */}
      <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              {greeting}, {user?.name}
            </h1>
            <p className="text-yellow-100 text-lg font-medium">
              Compliance Monitoring & Performance Analytics
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                Auditor & Info Officer
              </div>
              <div className="bg-green-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>94% Compliance</span>
              </div>
              <div className="bg-yellow-500/80 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                28 Reports Generated
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold">{new Date().getDate()}</div>
              <div className="text-sm text-yellow-200 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <BarChart3 className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - Auditor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {auditorStats.map((stat, index) => (
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

      {/* Audit Actions and Compliance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Audit & Reporting</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => toast.success('Report Generated', 'Monthly compliance report has been created')}
              className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="font-semibold">Generate Report</span>
              </div>
            </button>

            <button 
              onClick={() => toast.info('Data Exported', 'Audit data exported to CSV format')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Download className="w-6 h-6" />
                </div>
                <span className="font-semibold">Export Data</span>
              </div>
            </button>

            <button 
              onClick={() => toast.info('Analytics View', 'Performance analytics dashboard opened')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="font-semibold">View Analytics</span>
              </div>
            </button>

            <button 
              onClick={() => toast.warning('Audit Scheduled', 'New compliance audit has been scheduled')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="font-semibold">Schedule Audit</span>
              </div>
            </button>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Compliance Metrics</h2>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">94% Overall</span>
          </div>
          <div className="space-y-4">
            {[
              { metric: "SLA Compliance", department: "Engineering", score: 92, target: 90, color: "bg-green-500" },
              { metric: "Response Time", department: "Field Ops", score: 87, target: 85, color: "bg-green-500" },
              { metric: "Resolution Rate", department: "Supervisors", score: 95, target: 90, color: "bg-green-500" },
              { metric: "Data Quality", department: "System", score: 78, target: 80, color: "bg-red-500" },
              { metric: "User Satisfaction", department: "All Depts", score: 88, target: 85, color: "bg-green-500" }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                    <div className="text-xs text-gray-500">{item.department} • Target: {item.target}%</div>
                  </div>
                  <span className={`text-sm font-bold ${item.score >= item.target ? 'text-green-600' : 'text-red-600'}`}>
                    {item.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Activities and Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Audit Activities</h2>
            <button className="text-yellow-600 hover:text-yellow-800 text-sm font-semibold flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
          <div className="space-y-4">
            {[
              { action: "Compliance audit completed", detail: "Engineering department Q4 review", time: "1 hour ago", type: "audit", color: "yellow", status: "resolved", priority: "medium" },
              { action: "Performance report generated", detail: "Monthly SLA compliance summary", time: "3 hours ago", type: "report", color: "blue", status: "resolved", priority: "low" },
              { action: "Data export requested", detail: "Issue resolution metrics for analysis", time: "5 hours ago", type: "export", color: "purple", status: "resolved", priority: "low" },
              { action: "Risk assessment updated", detail: "System security evaluation completed", time: "1 day ago", type: "assessment", color: "green", status: "resolved", priority: "high" },
              { action: "Audit schedule created", detail: "Q1 2024 compliance review planned", time: "2 days ago", type: "schedule", color: "orange", status: "resolved", priority: "medium" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activity.color === 'red' ? 'bg-red-100' :
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'purple' ? 'bg-purple-100' :
                  activity.color === 'yellow' ? 'bg-yellow-100' :
                  'bg-orange-100'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    activity.color === 'red' ? 'text-red-600' :
                    activity.color === 'green' ? 'text-green-600' :
                    activity.color === 'blue' ? 'text-blue-600' :
                    activity.color === 'purple' ? 'text-purple-600' :
                    activity.color === 'yellow' ? 'text-yellow-600' :
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

        {/* Performance Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Performance Trends</h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { period: "This Month", score: 94, change: 3, trend: "up" },
              { period: "Last Month", score: 91, change: 5, trend: "up" },
              { period: "Q4 2023", score: 89, change: 2, trend: "up" },
              { period: "Q3 2023", score: 87, change: -1, trend: "down" },
              { period: "Q2 2023", score: 88, change: 4, trend: "up" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">{item.period}</div>
                  <div className="text-sm text-gray-500">Compliance Score</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{item.score}%</div>
                  <div className={`text-sm flex items-center space-x-1 ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{Math.abs(item.change)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

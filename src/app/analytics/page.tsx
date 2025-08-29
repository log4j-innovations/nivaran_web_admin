'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';
import { RoleGuard } from '@/components/RoleGuard';
import IssueAnalytics from '@/components/analytics/IssueAnalytics';
import { BarChart3, TrendingUp, Download, Filter } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={['super_admin', 'city_engineer', 'auditor']}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
              <p className="text-gray-600">Comprehensive insights into issue management performance and trends</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Tracking</p>
                <p className="text-lg font-semibold text-gray-900">Real-time Metrics</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Data Export</p>
                <p className="text-lg font-semibold text-gray-900">CSV Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Advanced Filtering</p>
                <p className="text-lg font-semibold text-gray-900">Time & Area Based</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analytics Component */}
        <IssueAnalytics />
      </div>
    </RoleGuard>
  );
}

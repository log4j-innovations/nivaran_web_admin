'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { RoleGuard } from '@/components/RoleGuard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Download, FileText, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { firestoreService } from '@/lib/firebase';

interface ReportData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  slaCompliance: number;
  averageResolutionTime: number;
  escalatedIssues: number;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedArea, setSelectedArea] = useState('all');

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedArea]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual Firestore queries
      const mockData: ReportData = {
        totalIssues: 156,
        resolvedIssues: 142,
        pendingIssues: 14,
        slaCompliance: 91.0,
        averageResolutionTime: 28.5,
        escalatedIssues: 3
      };
      setReportData(mockData);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      toast.info('Export Started', `Generating ${format.toUpperCase()} report...`);
      // Mock export - replace with actual export logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Export Complete', `${format.toUpperCase()} report downloaded successfully`);
    } catch (error) {
      toast.error('Export Failed', 'Failed to generate report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['super_admin', 'city_engineer', 'auditor']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Generate and export performance reports</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Areas</option>
                <option value="central_delhi">Central Delhi</option>
                <option value="ghaziabad">Ghaziabad</option>
                <option value="gurgaon">Gurgaon</option>
                <option value="faridabad">Faridabad</option>
                <option value="rajkot_rmc">Rajkot RMC</option>
                <option value="rajkot_ruda">Rajkot RUDA</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData?.totalIssues}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{reportData?.resolvedIssues}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                  <p className="text-2xl font-bold text-blue-600">{reportData?.slaCompliance}%</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold text-orange-600">{reportData?.averageResolutionTime}h</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Report Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Report */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Report</h3>
              <p className="text-gray-600 mb-4">Comprehensive analysis of issue resolution performance, SLA compliance, and area-wise metrics.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => exportReport('csv')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* SLA Report */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Compliance Report</h3>
              <p className="text-gray-600 mb-4">Detailed breakdown of SLA performance, escalation patterns, and compliance metrics by priority level.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => exportReport('excel')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Area Performance */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Performance Report</h3>
              <p className="text-gray-600 mb-4">Geographic analysis of issue distribution, resolution rates, and hotspot identification by area.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => exportReport('csv')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* Audit Report */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit & Compliance Report</h3>
              <p className="text-gray-600 mb-4">Comprehensive audit trail, compliance metrics, and regulatory reporting for quarterly reviews.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">Daily Operations</h4>
                <p className="text-sm text-gray-600">Generated daily at 8:00 AM</p>
                <p className="text-xs text-gray-500 mt-1">Recipients: Field Supervisors, City Engineer</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">Weekly SLA Report</h4>
                <p className="text-sm text-gray-600">Generated every Monday at 9:00 AM</p>
                <p className="text-xs text-gray-500 mt-1">Recipients: City Engineer, Super Admin</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">Monthly Performance</h4>
                <p className="text-sm text-gray-600">Generated on 1st of each month</p>
                <p className="text-xs text-gray-500 mt-1">Recipients: Super Admin, Department Heads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

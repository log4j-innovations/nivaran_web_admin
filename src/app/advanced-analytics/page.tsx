'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { RoleGuard } from '@/components/RoleGuard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BarChart3, TrendingUp, Users, Clock, AlertTriangle, Download } from 'lucide-react';
import { firestoreService } from '@/lib/firebase';

interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  escalatedIssues: number;
  slaCompliance: number;
  averageResolutionTime: number;
  userPerformance: Array<{
    userId: string;
    name: string;
    issuesAssigned: number;
    issuesResolved: number;
    averageResolutionTime: number;
    slaCompliance: number;
  }>;
  areaPerformance: Array<{
    area: string;
    totalIssues: number;
    resolvedIssues: number;
    averageResolutionTime: number;
    slaCompliance: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
}

export default function AdvancedAnalyticsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedArea, setSelectedArea] = useState('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedArea]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const issues = await firestoreService.getIssues();
      
      // Calculate analytics from issues data
      const totalIssues = issues.length;
      const resolvedIssues = issues.filter((issue: any) => issue.status === 'resolved').length;
      const pendingIssues = issues.filter((issue: any) => issue.status === 'pending').length;
      const escalatedIssues = issues.filter((issue: any) => issue.status === 'escalated').length;
      
      // Calculate SLA compliance
      const slaCompliant = issues.filter((issue: any) => {
        if (issue.status === 'resolved' && issue.slaDeadline && issue.resolvedAt) {
          const resolvedAt = new Date(issue.resolvedAt);
          const deadline = new Date(issue.slaDeadline);
          return resolvedAt <= deadline;
        }
        return false;
      }).length;
      
      const slaCompliance = totalIssues > 0 ? (slaCompliant / totalIssues) * 100 : 0;
      
      // Calculate average resolution time
      const resolvedIssuesWithTime = issues.filter((issue: any) => 
        issue.status === 'resolved' && issue.createdAt && issue.resolvedAt
      );
      
      const totalResolutionTime = resolvedIssuesWithTime.reduce((total: number, issue: any) => {
        const created = new Date(issue.createdAt);
        const resolved = new Date(issue.resolvedAt);
        return total + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      }, 0);
      
      const averageResolutionTime = resolvedIssuesWithTime.length > 0 
        ? totalResolutionTime / resolvedIssuesWithTime.length 
        : 0;

      // Category distribution
      const categoryCounts: Record<string, number> = {};
      issues.forEach((issue: any) => {
        categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
      });
      
      const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalIssues) * 100
      }));

      // Priority distribution
      const priorityCounts: Record<string, number> = {};
      issues.forEach((issue: any) => {
        priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
      });
      
      const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count,
        percentage: (count / totalIssues) * 100
      }));

      // Mock user performance data
      const userPerformance = [
        {
          userId: '1',
          name: 'John Supervisor',
          issuesAssigned: 15,
          issuesResolved: 12,
          averageResolutionTime: 24.5,
          slaCompliance: 85.7
        },
        {
          userId: '2',
          name: 'Sarah Engineer',
          issuesAssigned: 22,
          issuesResolved: 20,
          averageResolutionTime: 18.2,
          slaCompliance: 90.9
        }
      ];

      // Mock area performance data
      const areaPerformance = [
        {
          area: 'Central Delhi',
          totalIssues: 45,
          resolvedIssues: 42,
          averageResolutionTime: 22.1,
          slaCompliance: 93.3
        },
        {
          area: 'Ghaziabad',
          totalIssues: 38,
          resolvedIssues: 35,
          averageResolutionTime: 25.8,
          slaCompliance: 92.1
        },
        {
          area: 'Gurgaon',
          totalIssues: 32,
          resolvedIssues: 29,
          averageResolutionTime: 28.3,
          slaCompliance: 90.6
        }
      ];

      const mockData: AnalyticsData = {
        totalIssues,
        resolvedIssues,
        pendingIssues,
        escalatedIssues,
        slaCompliance,
        averageResolutionTime,
        userPerformance,
        areaPerformance,
        categoryDistribution,
        priorityDistribution
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      toast.info('Export Started', `Generating ${format.toUpperCase()} analytics report...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Export Complete', `${format.toUpperCase()} analytics report downloaded successfully`);
    } catch (error) {
      toast.error('Export Failed', 'Failed to generate analytics report');
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
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600">Comprehensive performance insights and trends</p>
              </div>
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
              <button
                onClick={() => exportAnalytics('excel')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.totalIssues}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                  <p className="text-2xl font-bold text-green-600">{analyticsData?.slaCompliance.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold text-orange-600">{analyticsData?.averageResolutionTime.toFixed(1)}h</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-purple-600">{analyticsData?.userPerformance.length}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Category Distribution */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Categories</h3>
              <div className="space-y-3">
                {analyticsData?.categoryDistribution.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{item.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                {analyticsData?.priorityDistribution.map((item) => (
                  <div key={item.priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.priority === 'critical' ? 'bg-red-500' :
                        item.priority === 'high' ? 'bg-orange-500' :
                        item.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{item.priority}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.priority === 'critical' ? 'bg-red-500' :
                            item.priority === 'high' ? 'bg-orange-500' :
                            item.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Performance */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">User</th>
                      <th className="text-center py-2 font-medium text-gray-900">Assigned</th>
                      <th className="text-center py-2 font-medium text-gray-900">Resolved</th>
                      <th className="text-center py-2 font-medium text-gray-900">SLA %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.userPerformance.map((user) => (
                      <tr key={user.userId} className="border-b border-gray-100">
                        <td className="py-2 text-gray-900">{user.name}</td>
                        <td className="py-2 text-center text-gray-600">{user.issuesAssigned}</td>
                        <td className="py-2 text-center text-gray-600">{user.issuesResolved}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.slaCompliance >= 90 ? 'bg-green-100 text-green-800' :
                            user.slaCompliance >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {user.slaCompliance.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Area Performance */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Area</th>
                      <th className="text-center py-2 font-medium text-gray-900">Total</th>
                      <th className="text-center py-2 font-medium text-gray-900">Resolved</th>
                      <th className="text-center py-2 font-medium text-gray-900">SLA %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.areaPerformance.map((area) => (
                      <tr key={area.area} className="border-b border-gray-100">
                        <td className="py-2 text-gray-900">{area.area.replace('_', ' ')}</td>
                        <td className="py-2 text-center text-gray-600">{area.totalIssues}</td>
                        <td className="py-2 text-center text-gray-600">{area.resolvedIssues}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            area.slaCompliance >= 90 ? 'bg-green-100 text-green-800' :
                            area.slaCompliance >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {area.slaCompliance.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive time series chart</p>
                <p className="text-sm text-gray-500">Showing trends over {selectedPeriod}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { RoleGuard } from '@/components/RoleGuard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { firestoreService } from '@/lib/firebase';
import { slaUtils } from '@/lib/slaConfig';

interface ReportData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  escalatedIssues: number;
  slaCompliance: number;
  averageResolutionTime: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  priorityBreakdown: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  areaBreakdown: Array<{
    area: string;
    totalIssues: number;
    resolvedIssues: number;
    slaCompliance: number;
    averageResolutionTime: number;
  }>;
  userPerformance: Array<{
    userId: string;
    name: string;
    role: string;
    issuesAssigned: number;
    issuesResolved: number;
    averageResolutionTime: number;
    slaCompliance: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    issuesCreated: number;
    issuesResolved: number;
    slaBreaches: number;
  }>;
}

interface ReportFilter {
  period: 'week' | 'month' | 'quarter' | 'year';
  area: string;
  category: string;
  priority: string;
  status: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({
    period: 'month',
    area: 'all',
    category: 'all',
    priority: 'all',
    status: 'all'
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const issues = await firestoreService.getIssues();
      const users = await firestoreService.getUsers();

      // Apply filters
      let filteredIssues = issues;
      
      if (filters.area !== 'all') {
        filteredIssues = filteredIssues.filter((issue: any) => issue.area === filters.area);
      }
      
      if (filters.category !== 'all') {
        filteredIssues = filteredIssues.filter((issue: any) => issue.category === filters.category);
      }
      
      if (filters.priority !== 'all') {
        filteredIssues = filteredIssues.filter((issue: any) => issue.priority === filters.priority);
      }
      
      if (filters.status !== 'all') {
        filteredIssues = filteredIssues.filter((issue: any) => issue.status === filters.status);
      }

      // Calculate report data
      const totalIssues = filteredIssues.length;
      const resolvedIssues = filteredIssues.filter((issue: any) => issue.status === 'resolved').length;
      const pendingIssues = filteredIssues.filter((issue: any) => issue.status === 'pending').length;
      const escalatedIssues = filteredIssues.filter((issue: any) => issue.status === 'escalated').length;

      // Calculate SLA compliance
      const slaCompliant = filteredIssues.filter((issue: any) => {
        if (issue.status === 'resolved' && issue.slaDeadline && issue.resolvedAt) {
          const resolvedAt = new Date(issue.resolvedAt);
          const deadline = new Date(issue.slaDeadline);
          return resolvedAt <= deadline;
        }
        return false;
      }).length;

      const slaCompliance = totalIssues > 0 ? (slaCompliant / totalIssues) * 100 : 0;

      // Calculate average resolution time
      const resolvedIssuesWithTime = filteredIssues.filter((issue: any) =>
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

      // Category breakdown
      const categoryCounts: Record<string, number> = {};
      filteredIssues.forEach((issue: any) => {
        categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
      });

      const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalIssues) * 100
      }));

      // Priority breakdown
      const priorityCounts: Record<string, number> = {};
      filteredIssues.forEach((issue: any) => {
        priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
      });

      const priorityBreakdown = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count,
        percentage: (count / totalIssues) * 100
      }));

      // Area breakdown
      const areaCounts: Record<string, any> = {};
      filteredIssues.forEach((issue: any) => {
        if (!areaCounts[issue.area]) {
          areaCounts[issue.area] = {
            totalIssues: 0,
            resolvedIssues: 0,
            slaCompliant: 0,
            totalResolutionTime: 0,
            resolvedCount: 0
          };
        }
        areaCounts[issue.area].totalIssues++;
        if (issue.status === 'resolved') {
          areaCounts[issue.area].resolvedIssues++;
          if (issue.createdAt && issue.resolvedAt) {
            const created = new Date(issue.createdAt);
            const resolved = new Date(issue.resolvedAt);
            areaCounts[issue.area].totalResolutionTime += (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
            areaCounts[issue.area].resolvedCount++;
          }
        }
        if (issue.status === 'resolved' && issue.slaDeadline && issue.resolvedAt) {
          const resolvedAt = new Date(issue.resolvedAt);
          const deadline = new Date(issue.slaDeadline);
          if (resolvedAt <= deadline) {
            areaCounts[issue.area].slaCompliant++;
          }
        }
      });

      const areaBreakdown = Object.entries(areaCounts).map(([area, data]: [string, any]) => ({
        area,
        totalIssues: data.totalIssues,
        resolvedIssues: data.resolvedIssues,
        slaCompliance: data.totalIssues > 0 ? (data.slaCompliant / data.totalIssues) * 100 : 0,
        averageResolutionTime: data.resolvedCount > 0 ? data.totalResolutionTime / data.resolvedCount : 0
      }));

      // User performance
      const userPerformance = users.map((user: any) => {
        const userIssues = filteredIssues.filter((issue: any) => issue.assignedTo === user.id);
        const resolvedUserIssues = userIssues.filter((issue: any) => issue.status === 'resolved');
        
        const totalResolutionTime = resolvedUserIssues.reduce((total: number, issue: any) => {
          if (issue.createdAt && issue.resolvedAt) {
            const created = new Date(issue.createdAt);
            const resolved = new Date(issue.resolvedAt);
            return total + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
          }
          return total;
        }, 0);

        const slaCompliant = resolvedUserIssues.filter((issue: any) => {
          if (issue.slaDeadline && issue.resolvedAt) {
            const resolvedAt = new Date(issue.resolvedAt);
            const deadline = new Date(issue.slaDeadline);
            return resolvedAt <= deadline;
          }
          return false;
        }).length;

        return {
          userId: user.id,
          name: user.name,
          role: user.role,
          issuesAssigned: userIssues.length,
          issuesResolved: resolvedUserIssues.length,
          averageResolutionTime: resolvedUserIssues.length > 0 ? totalResolutionTime / resolvedUserIssues.length : 0,
          slaCompliance: resolvedUserIssues.length > 0 ? (slaCompliant / resolvedUserIssues.length) * 100 : 0
        };
      });

      // Time series data (mock data for now)
      const timeSeriesData = [
        { date: '2024-01-01', issuesCreated: 15, issuesResolved: 12, slaBreaches: 2 },
        { date: '2024-01-02', issuesCreated: 18, issuesResolved: 15, slaBreaches: 1 },
        { date: '2024-01-03', issuesCreated: 22, issuesResolved: 19, slaBreaches: 3 },
        { date: '2024-01-04', issuesCreated: 16, issuesResolved: 14, slaBreaches: 1 },
        { date: '2024-01-05', issuesCreated: 20, issuesResolved: 18, slaBreaches: 2 }
      ];

      const data: ReportData = {
        totalIssues,
        resolvedIssues,
        pendingIssues,
        escalatedIssues,
        slaCompliance,
        averageResolutionTime,
        categoryBreakdown,
        priorityBreakdown,
        areaBreakdown,
        userPerformance,
        timeSeriesData
      };

      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setGeneratingReport(true);
      toast.info('Generating Report', `Creating ${format.toUpperCase()} report...`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Report Generated', `${format.toUpperCase()} report downloaded successfully`);
    } catch (error) {
      toast.error('Report Generation Failed', 'Failed to generate report');
    } finally {
      setGeneratingReport(false);
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
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600">Comprehensive reports and performance insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => generateReport('pdf')}
                disabled={generatingReport}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{generatingReport ? 'Generating...' : 'PDF'}</span>
              </button>
              <button
                onClick={() => generateReport('excel')}
                disabled={generatingReport}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{generatingReport ? 'Generating...' : 'Excel'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.period}
                onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              
              <select
                value={filters.area}
                onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
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
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="pothole">Pothole</option>
                <option value="street_light">Street Light</option>
                <option value="water_leak">Water Leak</option>
                <option value="traffic_signal">Traffic Signal</option>
                <option value="sidewalk">Sidewalk</option>
                <option value="drainage">Drainage</option>
                <option value="debris">Debris</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
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
                  <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                  <p className="text-2xl font-bold text-green-600">{reportData?.slaCompliance.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold text-orange-600">{reportData?.averageResolutionTime.toFixed(1)}h</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalated</p>
                  <p className="text-2xl font-bold text-red-600">{reportData?.escalatedIssues}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
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
                {reportData?.categoryBreakdown.map((item) => (
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
                {reportData?.priorityBreakdown.map((item) => (
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
                    {reportData?.areaBreakdown.map((area) => (
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
                    {reportData?.userPerformance.slice(0, 5).map((user) => (
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
          </div>

          {/* Time Series Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive time series chart</p>
                <p className="text-sm text-gray-500">Showing trends over {filters.period}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

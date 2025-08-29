'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { firestoreService } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import SimpleChart from './SimpleChart';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  DollarSign
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  area: string;
  createdAt: Date;
  resolvedAt?: Date;
  slaDeadline?: Date;
  estimatedCost?: number;
  assignedTo?: string;
}

interface AnalyticsData {
  totalIssues: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  areaPerformance: Record<string, {
    total: number;
    resolved: number;
    avgResolutionTime: number;
    slaCompliance: number;
  }>;
  slaCompliance: {
    overall: number;
    byPriority: Record<string, number>;
    byArea: Record<string, number>;
  };
  resolutionTimeMetrics: {
    average: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
  costAnalysis: {
    totalEstimated: number;
    totalActual: number;
    byCategory: Record<string, number>;
  };
}

interface IssueAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
  areaFilter?: string;
  categoryFilter?: string;
}

export default function IssueAnalytics({ 
  timeRange = '30d', 
  areaFilter, 
  categoryFilter 
}: IssueAnalyticsProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [exporting, setExporting] = useState(false);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const issues = await firestoreService.getIssues();
        
        // Filter issues based on time range and filters
        const filteredIssues = filterIssues(issues, timeRange, areaFilter, categoryFilter);
        
        // Calculate analytics
        const data = calculateAnalytics(filteredIssues);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Analytics Failed', 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, areaFilter, categoryFilter, toast]);

  // Filter issues based on criteria
  const filterIssues = (issues: Array<{ id: string; [key: string]: unknown }>, timeRange: string, area?: string, category?: string) => {
    let filtered = issues;

    // Time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[timeRange] || 30;
      
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(issue => new Date(issue.createdAt as string | number | Date) >= cutoffDate);
    }

    // Area filter
    if (area) {
      filtered = filtered.filter(issue => issue.area === area);
    }

    // Category filter
    if (category) {
      filtered = filtered.filter(issue => issue.category === category);
    }

    return filtered;
  };

  // Calculate analytics from filtered issues
  const calculateAnalytics = (issues: Array<{ id: string; [key: string]: unknown }>): AnalyticsData => {
    const statusDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};
    const areaPerformance: Record<string, {
      total: number;
      resolved: number;
      resolutionTimes: number[];
      slaCompliant: number;
      totalWithSla: number;
      avgResolutionTime?: number;
      slaCompliance?: number;
    }> = {};
    
    let totalEstimatedCost = 0;
    let totalActualCost = 0;
    let totalSlaCompliant = 0;
    let totalIssuesWithSla = 0;

    issues.forEach(issue => {
      // Status distribution
      const status = issue.status as string;
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      
      // Priority distribution
      const priority = issue.priority as string;
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
      
      // Category distribution
      const category = issue.category as string;
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      
      // Area performance
      const area = issue.area as string;
      if (!areaPerformance[area]) {
        areaPerformance[area] = {
          total: 0,
          resolved: 0,
          resolutionTimes: [],
          slaCompliant: 0,
          totalWithSla: 0
        };
      }
      
      areaPerformance[area].total++;
      
      if (status === 'resolved' || status === 'closed') {
        areaPerformance[area].resolved++;
        
        if (issue.resolvedAt && issue.createdAt) {
          const resolutionTime = (new Date(issue.resolvedAt as string | number | Date).getTime() - new Date(issue.createdAt as string | number | Date).getTime()) / (1000 * 60 * 60 * 24);
          areaPerformance[area].resolutionTimes.push(resolutionTime);
        }
      }
      
      // SLA compliance
      if (issue.slaDeadline && issue.createdAt) {
        areaPerformance[area].totalWithSla++;
        const deadline = new Date(issue.slaDeadline as string | number | Date);
        const resolved = issue.resolvedAt ? new Date(issue.resolvedAt as string | number | Date) : new Date();
        
        if (resolved <= deadline) {
          areaPerformance[area].slaCompliant++;
          totalSlaCompliant++;
        }
        totalIssuesWithSla++;
      }
      
      // Cost analysis
      if (issue.estimatedCost) {
        totalEstimatedCost += (issue.estimatedCost as number);
      }
      if (issue.actualCost) {
        totalActualCost += (issue.actualCost as number);
      }
    });

    // Calculate area performance metrics and transform to expected format
    const transformedAreaPerformance: Record<string, {
      total: number;
      resolved: number;
      avgResolutionTime: number;
      slaCompliance: number;
    }> = {};
    
    Object.keys(areaPerformance).forEach(area => {
      const perf = areaPerformance[area];
      const avgResolutionTime = perf.resolutionTimes.length > 0 
        ? perf.resolutionTimes.reduce((a: number, b: number) => a + b, 0) / perf.resolutionTimes.length 
        : 0;
      const slaCompliance = perf.totalWithSla > 0 ? (perf.slaCompliant / perf.totalWithSla) * 100 : 0;
      
      transformedAreaPerformance[area] = {
        total: perf.total,
        resolved: perf.resolved,
        avgResolutionTime,
        slaCompliance
      };
    });

    // Calculate overall SLA compliance
    const overallSlaCompliance = totalIssuesWithSla > 0 ? (totalSlaCompliant / totalIssuesWithSla) * 100 : 0;

    // Calculate resolution time metrics
    const allResolutionTimes = Object.values(areaPerformance)
      .flatMap((perf) => perf.resolutionTimes);
    
    const avgResolutionTime = allResolutionTimes.length > 0 
      ? allResolutionTimes.reduce((a: number, b: number) => a + b, 0) / allResolutionTimes.length 
      : 0;

    return {
      totalIssues: issues.length,
      statusDistribution,
      priorityDistribution,
      categoryDistribution,
      areaPerformance: transformedAreaPerformance,
      slaCompliance: {
        overall: overallSlaCompliance,
        byPriority: {}, // TODO: Implement priority-based SLA analysis
        byArea: Object.fromEntries(
          Object.entries(transformedAreaPerformance).map(([area, perf]) => [
            area, 
            perf.slaCompliance
          ])
        )
      },
      resolutionTimeMetrics: {
        average: avgResolutionTime,
        byCategory: {}, // TODO: Implement priority-based resolution time analysis
        byPriority: {} // TODO: Implement priority-based resolution time analysis
      },
      costAnalysis: {
        totalEstimated: totalEstimatedCost,
        totalActual: totalActualCost,
        byCategory: {} // TODO: Implement category-based cost analysis
      }
    };
  };

  // Export analytics data
  const exportAnalytics = async (format: 'csv' | 'pdf') => {
    if (!analyticsData) return;
    
    setExporting(true);
    try {
      if (format === 'csv') {
        await exportToCSV(analyticsData);
        toast.success('Export Complete', 'Analytics data exported to CSV');
      } else {
        await exportToPDF(analyticsData);
        toast.success('Export Complete', 'Analytics report exported to PDF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export Failed', 'Failed to export analytics data');
    } finally {
      setExporting(false);
    }
  };

  // Export to CSV
  const exportToCSV = async (data: AnalyticsData) => {
    const csvContent = generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issue-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate CSV content
  const generateCSVContent = (data: AnalyticsData): string => {
    const lines = [
      'Issue Analytics Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Time Range: ${timeRange}`,
      '',
      'Summary',
      `Total Issues,${data.totalIssues}`,
      `Overall SLA Compliance,${data.slaCompliance.overall.toFixed(2)}%`,
      `Average Resolution Time,${data.resolutionTimeMetrics.average.toFixed(2)} days`,
      '',
      'Status Distribution',
      ...Object.entries(data.statusDistribution).map(([status, count]) => `${status},${count}`),
      '',
      'Priority Distribution',
      ...Object.entries(data.priorityDistribution).map(([priority, count]) => `${priority},${count}`),
      '',
      'Category Distribution',
      ...Object.entries(data.categoryDistribution).map(([category, count]) => `${category},${count}`),
      '',
      'Area Performance',
      'Area,Total Issues,Resolved Issues,Avg Resolution Time (days),SLA Compliance (%)',
      ...Object.entries(data.areaPerformance).map(([area, perf]) => 
        `${area},${perf.total},${perf.resolved},${perf.avgResolutionTime.toFixed(2)},${perf.slaCompliance.toFixed(2)}`
      )
    ];
    
    return lines.join('\n');
  };

  // Export to PDF (placeholder - would need a PDF library)
  const exportToPDF = async (data: AnalyticsData) => {
    // TODO: Implement PDF export using a library like jsPDF
    toast.info('PDF Export', 'PDF export functionality coming soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8 text-gray-500">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Issue Analytics</h2>
          <p className="text-gray-600">Comprehensive analysis of issue management performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => window.location.href = `?timeRange=${e.target.value}`}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          
          <button
            onClick={() => exportAnalytics('csv')}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Issues</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.totalIssues}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.slaCompliance.overall.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.resolutionTimeMetrics.average.toFixed(1)}d</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-3xl font-bold text-gray-900">${analyticsData.costAnalysis.totalEstimated.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <SimpleChart
          title="Status Distribution"
          type="progress"
          data={Object.entries(analyticsData.statusDistribution).map(([status, count]) => ({
            label: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
            value: count,
            total: analyticsData.totalIssues,
            color: status === 'pending' ? 'bg-yellow-500' :
                   status === 'in_progress' ? 'bg-blue-500' :
                   status === 'resolved' ? 'bg-green-500' :
                   status === 'closed' ? 'bg-gray-500' : 'bg-gray-400'
          }))}
        />

        {/* Priority Distribution */}
        <SimpleChart
          title="Priority Distribution"
          type="progress"
          data={Object.entries(analyticsData.priorityDistribution).map(([priority, count]) => ({
            label: priority.charAt(0).toUpperCase() + priority.slice(1),
            value: count,
            total: analyticsData.totalIssues,
            color: priority === 'critical' ? 'bg-red-500' :
                   priority === 'high' ? 'bg-orange-500' :
                   priority === 'medium' ? 'bg-yellow-500' :
                   priority === 'low' ? 'bg-green-500' : 'bg-gray-400'
          }))}
        />

        {/* Category Distribution */}
        <SimpleChart
          title="Category Distribution"
          type="pie"
          height={150}
          data={Object.entries(analyticsData.categoryDistribution).map(([category, count]) => ({
            label: category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1),
            value: count,
            total: analyticsData.totalIssues,
            color: `bg-${['blue', 'green', 'yellow', 'red', 'purple', 'indigo', 'pink', 'gray'][Math.floor(Math.random() * 8)]}-500`
          }))}
        />
      </div>

      {/* Area Performance Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Area Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Issues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Resolution (days)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(analyticsData.areaPerformance).map(([area, perf]) => (
                <tr key={area} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {area.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{perf.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{perf.resolved}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {perf.avgResolutionTime.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            perf.slaCompliance >= 80 ? 'bg-green-500' :
                            perf.slaCompliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${perf.slaCompliance}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        perf.slaCompliance >= 80 ? 'text-green-600' :
                        perf.slaCompliance >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {perf.slaCompliance.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

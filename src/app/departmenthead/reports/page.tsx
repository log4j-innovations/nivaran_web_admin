'use client';

import { useState, useEffect } from 'react';
import { firestoreService } from '@/lib/firebaseServices';
import { Issue, User } from '@/lib/types';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Users, FileText, Download, Filter } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface ReportStats {
  totalIssues: number;
  assignedIssues: number;
  resolvedIssues: number;
  escalatedIssues: number;
  avgResolutionTime: number;
  slaCompliance: number;
  totalSupervisors: number;
  activeSupervisors: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

interface PriorityBreakdown {
  priority: string;
  count: number;
  percentage: number;
}

interface AreaBreakdown {
  area: string;
  count: number;
  percentage: number;
}

export default function DepartmentHeadReportsPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalIssues: 0,
    assignedIssues: 0,
    resolvedIssues: 0,
    escalatedIssues: 0,
    avgResolutionTime: 0,
    slaCompliance: 0,
    totalSupervisors: 0,
    activeSupervisors: 0,
  });
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [priorityBreakdown, setPriorityBreakdown] = useState<PriorityBreakdown[]>([]);
  const [areaBreakdown, setAreaBreakdown] = useState<AreaBreakdown[]>([]);
  const [recentActivity, setRecentActivity] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('30');

  useEffect(() => {
    loadData();
  }, [filterPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all issues and supervisors
      const [issuesData, supervisorsData] = await Promise.all([
        firestoreService.getIssues(),
        firestoreService.getUsers()
      ]);

      // Filter supervisors to only get Supervisor role
      const supervisorUsers = supervisorsData.filter(u => u.role === 'Supervisor');
      setSupervisors(supervisorUsers);

      // Filter issues based on period
      const filteredIssues = filterIssuesByPeriod(issuesData, parseInt(filterPeriod));
      setIssues(filteredIssues);

      // Calculate stats
      const calculatedStats = calculateStats(filteredIssues, supervisorUsers);
      setStats(calculatedStats);

      // Calculate breakdowns
      const statusData = calculateStatusBreakdown(filteredIssues);
      setStatusBreakdown(statusData);

      const priorityData = calculatePriorityBreakdown(filteredIssues);
      setPriorityBreakdown(priorityData);

      const areaData = calculateAreaBreakdown(filteredIssues);
      setAreaBreakdown(areaData);

      // Get recent activity (last 10 issues)
      const recent = filteredIssues
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentActivity(recent);

    } catch (err) {
      console.error('Error loading reports data:', err);
      setError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const filterIssuesByPeriod = (issues: Issue[], days: number): Issue[] => {
    if (days === 0) return issues;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return issues.filter(issue => {
      const issueDate = new Date(issue.createdAt);
      return issueDate >= cutoffDate;
    });
  };

  const calculateStats = (issues: Issue[], supervisors: User[]): ReportStats => {
    const totalIssues = issues.length;
    const assignedIssues = issues.filter(issue => issue.assignedTo).length;
    const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
    const escalatedIssues = issues.filter(issue => issue.status === 'escalated').length;

    // Calculate average resolution time (in days)
    const resolvedIssuesWithDates = issues.filter(issue => 
      issue.status === 'resolved' && issue.resolvedAt
    );
    
    let avgResolutionTime = 0;
    if (resolvedIssuesWithDates.length > 0) {
      const totalTime = resolvedIssuesWithDates.reduce((sum, issue) => {
        const created = new Date(issue.createdAt);
        const resolved = new Date(issue.resolvedAt!);
        return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0);
      avgResolutionTime = totalTime / resolvedIssuesWithDates.length;
    }

    // Calculate SLA compliance (issues resolved within 7 days)
    const slaCompliant = resolvedIssuesWithDates.filter(issue => {
      const created = new Date(issue.createdAt);
      const resolved = new Date(issue.resolvedAt!);
      const daysToResolve = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysToResolve <= 7;
    }).length;

    const slaCompliance = resolvedIssues > 0 ? (slaCompliant / resolvedIssues) * 100 : 0;

    const totalSupervisors = supervisors.length;
    const activeSupervisors = supervisors.filter(s => s.isActive).length;

    return {
      totalIssues,
      assignedIssues,
      resolvedIssues,
      escalatedIssues,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      slaCompliance: Math.round(slaCompliance * 10) / 10,
      totalSupervisors,
      activeSupervisors,
    };
  };

  const calculateStatusBreakdown = (issues: Issue[]): StatusBreakdown[] => {
    const statusCounts: { [key: string]: number } = {};
    issues.forEach(issue => {
      statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    });

    const total = issues.length;
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  };

  const calculatePriorityBreakdown = (issues: Issue[]): PriorityBreakdown[] => {
    const priorityCounts: { [key: string]: number } = {};
    issues.forEach(issue => {
      priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
    });

    const total = issues.length;
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  };

  const calculateAreaBreakdown = (issues: Issue[]): AreaBreakdown[] => {
    const areaCounts: { [key: string]: number } = {};
    issues.forEach(issue => {
      areaCounts[issue.area] = (areaCounts[issue.area] || 0) + 1;
    });

    const total = issues.length;
    return Object.entries(areaCounts).map(([area, count]) => ({
      area,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportReport = () => {
    const reportData = {
      stats,
      statusBreakdown,
      priorityBreakdown,
      areaBreakdown,
      recentActivity,
      generatedAt: new Date().toISOString(),
      period: `${filterPeriod} days`,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `department-head-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadData} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Reports</h1>
          <p className="text-gray-600">Analytics and insights for your department&apos;s performance</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter Period:</span>
              </div>
              <select 
                value={filterPeriod} 
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="0">All time</option>
              </select>
            </div>
            <button 
              onClick={exportReport} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium opacity-90">Total Issues</h3>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalIssues}</div>
              <p className="text-xs opacity-75 mt-1">All issues in period</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium opacity-90">Assigned Issues</h3>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.assignedIssues}</div>
              <p className="text-xs opacity-75 mt-1">Issues assigned to supervisors</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium opacity-90">SLA Compliance</h3>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.slaCompliance}%</div>
              <p className="text-xs opacity-75 mt-1">Resolved within 7 days</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium opacity-90">Active Supervisors</h3>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.activeSupervisors}</div>
              <p className="text-xs opacity-75 mt-1">Out of {stats.totalSupervisors} total</p>
            </div>
          </div>
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Breakdown */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Status Breakdown
            </h3>
            <div className="space-y-3">
              {statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.count}</div>
                    <div className="text-sm text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Priority Breakdown
            </h3>
            <div className="space-y-3">
              {priorityBreakdown.map((item) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.count}</div>
                    <div className="text-sm text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Area Breakdown */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Area Breakdown
            </h3>
            <div className="space-y-3">
              {areaBreakdown.map((item) => (
                <div key={item.area} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.area}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.count}</div>
                    <div className="text-sm text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activity found
              </div>
            ) : (
              recentActivity.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{issue.title}</h4>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                      <span className="text-xs text-gray-500">{issue.area}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

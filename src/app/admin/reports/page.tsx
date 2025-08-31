'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { firestoreService } from '@/lib/firebaseServices';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
  Building2
} from 'lucide-react';

interface ReportData {
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  escalatedIssues: number;
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  departmentHeads: number;
  supervisors: number;
  auditors: number;
  slaCompliance: number;
  averageResolutionTime: number;
  issuesByArea: { area: string; count: number }[];
  issuesByPriority: { priority: string; count: number }[];
  issuesByCategory: { category: string; count: number }[];
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }>;
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    totalIssues: 0,
    pendingIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    escalatedIssues: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    departmentHeads: 0,
    supervisors: 0,
    auditors: 0,
    slaCompliance: 0,
    averageResolutionTime: 0,
    issuesByArea: [],
    issuesByPriority: [],
    issuesByCategory: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [allIssues, allUsers] = await Promise.all([
        firestoreService.getIssues(),
        firestoreService.getUsers()
      ]);

      // Calculate issue statistics
      const pendingIssues = allIssues.filter(issue => issue.status === 'pending');
      const inProgressIssues = allIssues.filter(issue => issue.status === 'in_progress');
      const resolvedIssues = allIssues.filter(issue => issue.status === 'resolved');
      const escalatedIssues = allIssues.filter(issue => issue.status === 'escalated');

      // Calculate user statistics
      const activeUsers = allUsers.filter(u => u.isActive);
      const pendingUsers = allUsers.filter(u => u.role === 'pending');
      const departmentHeads = allUsers.filter(u => u.role === 'Department Head' && u.isActive);
      const supervisors = allUsers.filter(u => u.role === 'Supervisor' && u.isActive);
      const auditors = allUsers.filter(u => u.role === 'Auditor' && u.isActive);

      // Calculate SLA compliance
      const slaCompliance = allIssues.length > 0 ? Math.round((resolvedIssues.length / allIssues.length) * 100) : 0;

      // Calculate average resolution time
      const resolvedWithTime = resolvedIssues.filter(issue => issue.resolvedAt && issue.createdAt);
      const totalResolutionTime = resolvedWithTime.reduce((total, issue) => {
        const created = new Date(issue.createdAt);
        const resolved = new Date(issue.resolvedAt!);
        return total + (resolved.getTime() - created.getTime());
      }, 0);
      const averageResolutionTime = resolvedWithTime.length > 0 ? Math.round(totalResolutionTime / resolvedWithTime.length / (1000 * 60 * 60 * 24)) : 0; // in days

      // Group issues by area
      const areaMap = new Map<string, number>();
      allIssues.forEach(issue => {
        areaMap.set(issue.area, (areaMap.get(issue.area) || 0) + 1);
      });
      const issuesByArea = Array.from(areaMap.entries()).map(([area, count]) => ({ area, count }));

      // Group issues by priority
      const priorityMap = new Map<string, number>();
      allIssues.forEach(issue => {
        priorityMap.set(issue.priority, (priorityMap.get(issue.priority) || 0) + 1);
      });
      const issuesByPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({ priority, count }));

      // Group issues by category
      const categoryMap = new Map<string, number>();
      allIssues.forEach(issue => {
        categoryMap.set(issue.category, (categoryMap.get(issue.category) || 0) + 1);
      });
      const issuesByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

      // Generate recent activity (mock data for now)
      const recentActivity = [
        {
          id: '1',
          action: 'Issue Resolved',
          user: 'supervisor@municipal.gov.in',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: 'Pothole repair completed in Central District'
        },
        {
          id: '2',
          action: 'User Approved',
          user: 'superadmin@delhi.gov.in',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          details: 'New Department Head approved'
        },
        {
          id: '3',
          action: 'Issue Assigned',
          user: 'departmenthead@municipal.gov.in',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          details: 'Street light issue assigned to Supervisor'
        }
      ];

      setReportData({
        totalIssues: allIssues.length,
        pendingIssues: pendingIssues.length,
        inProgressIssues: inProgressIssues.length,
        resolvedIssues: resolvedIssues.length,
        escalatedIssues: escalatedIssues.length,
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        pendingUsers: pendingUsers.length,
        departmentHeads: departmentHeads.length,
        supervisors: supervisors.length,
        auditors: auditors.length,
        slaCompliance,
        averageResolutionTime,
        issuesByArea,
        issuesByPriority,
        issuesByCategory,
        recentActivity
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                 <div className="text-center">
           <div className="relative">
             <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
           </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Generating Reports</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we compile comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Report Generation Failed</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={loadReportData}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into municipal operations and performance</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Total Issues</p>
                <p className="text-3xl font-bold text-blue-900">{reportData.totalIssues}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">SLA Compliance</p>
                <p className="text-3xl font-bold text-green-900">{reportData.slaCompliance}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Active Users</p>
                <p className="text-3xl font-bold text-purple-900">{reportData.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700">Avg Resolution</p>
                <p className="text-3xl font-bold text-orange-900">{reportData.averageResolutionTime}d</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Issue Status Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Status Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <span className="font-medium">{reportData.pendingIssues}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">In Progress</span>
                </div>
                <span className="font-medium">{reportData.inProgressIssues}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Resolved</span>
                </div>
                <span className="font-medium">{reportData.resolvedIssues}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Escalated</span>
                </div>
                <span className="font-medium">{reportData.escalatedIssues}</span>
              </div>
            </div>
          </div>

          {/* User Role Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Department Heads</span>
                </div>
                <span className="font-medium">{reportData.departmentHeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Supervisors</span>
                </div>
                <span className="font-medium">{reportData.supervisors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Auditors</span>
                </div>
                <span className="font-medium">{reportData.auditors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Pending Approval</span>
                </div>
                <span className="font-medium">{reportData.pendingUsers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Issues by Area and Priority */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Issues by Area */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Area</h3>
            <div className="space-y-3">
              {reportData.issuesByArea.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{item.area}</span>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues by Priority */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Priority</h3>
            <div className="space-y-3">
              {reportData.issuesByPriority.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.priority === 'critical' ? 'bg-red-500' :
                      item.priority === 'high' ? 'bg-orange-500' :
                      item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className={`capitalize ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {reportData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{activity.action}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-2">By: {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

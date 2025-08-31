'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { firestoreService } from '@/lib/firebaseServices';
import { Issue } from '@/lib/types';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  User, 
  Calendar,
  Filter,
  Search,
  Eye,
  BarChart3,
  FileText,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  escalatedIssues: number;
  avgResolutionTime: number;
  slaCompliance: number;
}

export default function AuditorPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    escalatedIssues: 0,
    avgResolutionTime: 0,
    slaCompliance: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const issuesData = await firestoreService.getIssues();
      setIssues(issuesData);

      // Calculate stats
      const totalIssues = issuesData.length;
      const pendingIssues = issuesData.filter(issue => issue.status === 'pending').length;
      const resolvedIssues = issuesData.filter(issue => issue.status === 'resolved').length;
      const escalatedIssues = issuesData.filter(issue => issue.status === 'escalated').length;

      // Calculate average resolution time
      const resolvedIssuesWithDates = issuesData.filter(issue => 
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

      // Calculate SLA compliance
      const slaCompliant = resolvedIssuesWithDates.filter(issue => {
        const created = new Date(issue.createdAt);
        const resolved = new Date(issue.resolvedAt!);
        const daysToResolve = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return daysToResolve <= 7;
      }).length;

      const slaCompliance = resolvedIssues > 0 ? (slaCompliant / resolvedIssues) * 100 : 0;

      setStats({
        totalIssues,
        pendingIssues,
        resolvedIssues,
        escalatedIssues,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        slaCompliance: Math.round(slaCompliance * 10) / 10,
      });

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading auditor dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadData} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Auditor Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of municipal issues and compliance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Issues</p>
                <p className="text-3xl font-bold">{stats.totalIssues}</p>
              </div>
              <FileText className="h-8 w-8 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Resolved Issues</p>
                <p className="text-3xl font-bold">{stats.resolvedIssues}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Pending Issues</p>
                <p className="text-3xl font-bold">{stats.pendingIssues}</p>
              </div>
              <Clock className="h-8 w-8 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Escalated Issues</p>
                <p className="text-3xl font-bold">{stats.escalatedIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Avg Resolution Time</p>
                <p className="text-3xl font-bold">{stats.avgResolutionTime}d</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">SLA Compliance</p>
                <p className="text-3xl font-bold">{stats.slaCompliance}%</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-75" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/auditor/issues" 
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Eye className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">View All Issues</h3>
                <p className="text-sm text-gray-600">Browse and filter all municipal issues</p>
              </div>
            </a>
            
            <a 
              href="/auditor/reports" 
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">View Reports</h3>
                <p className="text-sm text-gray-600">Access comprehensive audit reports</p>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Issues</h2>
            <a 
              href="/auditor/issues" 
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All →
            </a>
          </div>
          
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No issues found</p>
              </div>
            ) : (
              issues
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{issue.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {issue.area}
                        </span>
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

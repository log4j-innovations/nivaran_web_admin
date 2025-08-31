'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { firestoreService } from '@/lib/firebaseServices';
import { Wrench, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  assignedIssues: number;
  escalatedIssues: number;
  totalSupervisors: number;
  activeSupervisors: number;
}

export default function DepartmentHeadDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    pendingIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    assignedIssues: 0,
    escalatedIssues: 0,
    totalSupervisors: 0,
    activeSupervisors: 0
  });
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Department Head')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch comprehensive dashboard stats from Firebase
    const fetchStats = async () => {
      if (user?.role === 'Department Head') {
        try {
          setStatsLoading(true);
          
          // Fetch issues filtered by geographic areas
          const allIssues = await firestoreService.getIssuesByGeographicArea(user);
          const pendingIssues = allIssues.filter(issue => issue.status === 'pending');
          const inProgressIssues = allIssues.filter(issue => issue.status === 'in_progress');
          const resolvedIssues = allIssues.filter(issue => issue.status === 'resolved');
          const assignedIssues = allIssues.filter(issue => issue.assignedTo && issue.assignedTo !== '');
          const escalatedIssues = allIssues.filter(issue => issue.status === 'escalated');
          
          // Fetch supervisors data
          const allUsers = await firestoreService.getUsers();
          const supervisors = allUsers.filter(u => u.role === 'Supervisor' && u.isActive);
          const activeSupervisors = supervisors.filter(s => s.status === 'active');
          
          setStats({
            totalIssues: allIssues.length,
            pendingIssues: pendingIssues.length,
            inProgressIssues: inProgressIssues.length,
            resolvedIssues: resolvedIssues.length,
            assignedIssues: assignedIssues.length,
            escalatedIssues: escalatedIssues.length,
            totalSupervisors: supervisors.length,
            activeSupervisors: activeSupervisors.length
          });

          // Fetch recent issues from geographic area
          const recentIssuesData = allIssues
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setRecentIssues(recentIssuesData);
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'Department Head') {
    return null;
  }

  return (
            <DashboardLayout role="Department Head">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Department Head Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Issue management and field supervision
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <nav className="flex space-x-8">
              <a
                href="/departmenthead"
                className="text-blue-600 border-b-2 border-blue-600 py-2 px-1 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/departmenthead/issues"
                className="text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 py-2 px-1 text-sm font-medium"
              >
                Issues
              </a>
            </nav>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Issues */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Total Issues</p>
                <p className="text-3xl font-bold text-red-900">{stats.totalIssues || 0}</p>
              </div>
            </div>
          </div>

          {/* Pending Issues */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-700">Pending Issues</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.pendingIssues || 0}</p>
              </div>
            </div>
          </div>

          {/* In Progress Issues */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Wrench className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">In Progress</p>
                <p className="text-3xl font-bold text-blue-900">{stats.inProgressIssues || 0}</p>
              </div>
            </div>
          </div>

          {/* Resolved Issues */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Resolved Issues</p>
                <p className="text-3xl font-bold text-green-900">{stats.resolvedIssues || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Assigned Issues */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">AI</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Assigned Issues</p>
                <p className="text-3xl font-bold text-purple-900">{stats.assignedIssues || 0}</p>
              </div>
            </div>
          </div>

          {/* Escalated Issues */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">ES</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700">Escalated Issues</p>
                <p className="text-3xl font-bold text-orange-900">{stats.escalatedIssues || 0}</p>
              </div>
            </div>
          </div>

          {/* Total Supervisors */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-indigo-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600">SP</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-700">Total Supervisors</p>
                <p className="text-3xl font-bold text-indigo-900">{stats.totalSupervisors || 0}</p>
              </div>
            </div>
          </div>

          {/* Active Supervisors */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl shadow-lg p-6 border border-teal-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-teal-600">AS</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-teal-700">Active Supervisors</p>
                <p className="text-3xl font-bold text-teal-900">{stats.activeSupervisors || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Head Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Department Head Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a 
                href="/departmenthead/issues"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                View All Issues
              </a>
              <a 
                href="/departmenthead/issues?filter=unassigned"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <div className="h-4 w-4 mr-2 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">AI</span>
                </div>
                Assign Issues
              </a>
              <a 
                href="/departmenthead/issues?filter=pending"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Clock className="h-4 w-4 mr-2" />
                Update Status
              </a>
              <a 
                href="/departmenthead/supervisors"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-4 w-4 mr-2 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600">SP</span>
                </div>
                Manage Supervisors
              </a>
              <a 
                href="/departmenthead/reports"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-4 w-4 mr-2 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">📊</span>
                </div>
                View Reports
              </a>
              <a 
                href="/departmenthead/areas"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-4 w-4 mr-2 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">📍</span>
                </div>
                Manage Areas
              </a>
            </div>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Issues
              </h3>
              <a
                href="/departmenthead/issues"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View All Issues →
              </a>
            </div>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentIssues.length > 0 ? (
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          issue.priority === 'critical' ? 'bg-red-100' : 
                          issue.priority === 'high' ? 'bg-orange-100' : 
                          issue.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <AlertTriangle className={`h-4 w-4 ${
                            issue.priority === 'critical' ? 'text-red-600' : 
                            issue.priority === 'high' ? 'text-orange-600' : 
                            issue.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {issue.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Priority: {issue.priority} • Status: {issue.status}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      issue.priority === 'critical' ? 'bg-red-100 text-red-800' : 
                      issue.priority === 'high' ? 'bg-orange-100 text-orange-800' : 
                      issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {issue.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent issues found.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

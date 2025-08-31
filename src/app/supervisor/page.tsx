'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { firestoreService } from '@/lib/firebaseServices';
import { Building2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  assignedTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  escalatedIssues: number;
  totalNotes: number;
  recentNotes: number;
}

export default function SupervisorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    assignedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    escalatedIssues: 0,
    totalNotes: 0,
    recentNotes: 0
  });
  const [assignedIssues, setAssignedIssues] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Supervisor')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch comprehensive dashboard stats from Firebase
    const fetchStats = async () => {
      if (user?.role === 'Supervisor') {
        try {
          setStatsLoading(true);
          
          // Fetch issues filtered by geographic areas and assigned to this supervisor
          const allIssues = await firestoreService.getIssuesByGeographicArea(user);
          const assignedIssues = allIssues.filter(issue => issue.assignedTo === user.email);
          const pendingIssues = assignedIssues.filter(issue => issue.status === 'pending');
          const inProgressIssues = assignedIssues.filter(issue => issue.status === 'in_progress');
          const resolvedIssues = assignedIssues.filter(issue => issue.status === 'resolved');
          const escalatedIssues = assignedIssues.filter(issue => issue.status === 'escalated');
          
          // Calculate overdue tasks (issues past due date)
          const now = new Date();
          const overdueIssues = assignedIssues.filter(issue => {
            if (issue.dueDate) {
              const dueDate = new Date(issue.dueDate);
              return dueDate < now && issue.status !== 'resolved';
            }
            return false;
          });
          
          // Fetch notes data (if available)
          const totalNotes = assignedIssues.reduce((count, issue) => {
            return count + (issue.notes ? issue.notes.length : 0);
          }, 0);
          
          const recentNotes = assignedIssues.reduce((count, issue) => {
            if (issue.notes) {
              const recentNoteCount = issue.notes.filter((note: any) => {
                const noteDate = new Date(note.createdAt);
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return noteDate > weekAgo;
              }).length;
              return count + recentNoteCount;
            }
            return count;
          }, 0);
          
          setStats({
            assignedTasks: assignedIssues.length,
            inProgressTasks: inProgressIssues.length,
            completedTasks: resolvedIssues.length,
            overdueTasks: overdueIssues.length,
            totalIssues: assignedIssues.length,
            pendingIssues: pendingIssues.length,
            resolvedIssues: resolvedIssues.length,
            escalatedIssues: escalatedIssues.length,
            totalNotes: totalNotes,
            recentNotes: recentNotes
          });

          // Fetch assigned issues for display
          setAssignedIssues(assignedIssues);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
                 <div className="text-center">
           <div className="relative">
             <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
           </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Supervisor Dashboard</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your assigned tasks...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'Supervisor') {
    return null;
  }

  return (
    <DashboardLayout role="Supervisor">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Field Supervisor Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Task execution and field operations
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Assigned Tasks */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Assigned Tasks</p>
                <p className="text-3xl font-bold text-blue-900">{stats.assignedTasks || 0}</p>
              </div>
            </div>
          </div>

          {/* In Progress Tasks */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-700">In Progress</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.inProgressTasks || 0}</p>
              </div>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Completed Tasks</p>
                <p className="text-3xl font-bold text-green-900">{stats.completedTasks || 0}</p>
              </div>
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-900">{stats.overdueTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pending Issues */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">P</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700">Pending Issues</p>
                <p className="text-3xl font-bold text-orange-900">{stats.pendingIssues || 0}</p>
              </div>
            </div>
          </div>

          {/* Resolved Issues */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-emerald-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600">R</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-700">Resolved Issues</p>
                <p className="text-3xl font-bold text-emerald-900">{stats.resolvedIssues || 0}</p>
              </div>
            </div>
          </div>

          {/* Total Notes */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">N</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Total Notes</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalNotes || 0}</p>
              </div>
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-indigo-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600">RN</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-700">Recent Notes</p>
                <p className="text-3xl font-bold text-indigo-900">{stats.recentNotes || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Supervisor Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Supervisor Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a 
                href="/supervisor/tasks"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Building2 className="h-4 w-4 mr-2" />
                View Assigned Tasks
              </a>
              <a 
                href="/supervisor/tasks?filter=pending"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <Clock className="h-4 w-4 mr-2" />
                Update Status
              </a>
              <a 
                href="/supervisor/tasks?action=add-note"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <div className="h-4 w-4 mr-2 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">N</span>
                </div>
                Add Note
              </a>
              <a 
                href="/supervisor/reports"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <div className="h-4 w-4 mr-2 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">📊</span>
                </div>
                View Reports
              </a>
              <a 
                href="/supervisor/overdue"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Overdue Tasks
              </a>
              <a 
                href="/supervisor/completed"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed Tasks
              </a>
            </div>
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Assigned Tasks
            </h3>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : assignedIssues.length > 0 ? (
              <div className="space-y-4">
                {assignedIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          issue.status === 'resolved' ? 'bg-green-100' : 
                          issue.status === 'in_progress' ? 'bg-blue-100' : 
                          issue.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {issue.status === 'resolved' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : issue.status === 'in_progress' ? (
                            <Clock className="h-4 w-4 text-blue-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {issue.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Priority: {issue.priority} • Due: {new Date(issue.slaDeadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                      issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {issue.status === 'resolved' ? 'Completed' : 
                       issue.status === 'in_progress' ? 'In Progress' : 
                       issue.status === 'pending' ? 'Pending' : 'Overdue'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No assigned tasks found.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { firestoreService } from '@/lib/firebaseServices';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
  Building2,
  User
} from 'lucide-react';

interface SupervisorReportData {
  totalAssignedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  slaCompliance: number;
  tasksByArea: { area: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  recentActivity: Array<{
    id: string;
    action: string;
    taskTitle: string;
    timestamp: string;
    details: string;
  }>;
}

export default function SupervisorReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<SupervisorReportData>({
    totalAssignedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    averageCompletionTime: 0,
    slaCompliance: 0,
    tasksByArea: [],
    tasksByPriority: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, user]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all issues and filter for assigned tasks
      const allIssues = await firestoreService.getIssues();
      const assignedTasks = allIssues.filter(issue => issue.assignedTo === user?.email);

      // Calculate task statistics
      const pendingTasks = assignedTasks.filter(task => task.status === 'pending');
      const inProgressTasks = assignedTasks.filter(task => task.status === 'in_progress');
      const completedTasks = assignedTasks.filter(task => task.status === 'resolved');

      // Calculate overdue tasks
      const now = new Date();
      const overdueTasks = assignedTasks.filter(task => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          return dueDate < now && task.status !== 'resolved';
        }
        return false;
      });

      // Calculate SLA compliance
      const slaCompliance = assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 0;

      // Calculate average completion time
      const completedWithTime = completedTasks.filter(task => task.resolvedAt && task.createdAt);
      const totalCompletionTime = completedWithTime.reduce((total, task) => {
        const created = new Date(task.createdAt);
        const resolved = new Date(task.resolvedAt!);
        return total + (resolved.getTime() - created.getTime());
      }, 0);
      const averageCompletionTime = completedWithTime.length > 0 ? Math.round(totalCompletionTime / completedWithTime.length / (1000 * 60 * 60 * 24)) : 0; // in days

      // Group tasks by area
      const areaMap = new Map<string, number>();
      assignedTasks.forEach(task => {
        areaMap.set(task.area, (areaMap.get(task.area) || 0) + 1);
      });
      const tasksByArea = Array.from(areaMap.entries()).map(([area, count]) => ({ area, count }));

      // Group tasks by priority
      const priorityMap = new Map<string, number>();
      assignedTasks.forEach(task => {
        priorityMap.set(task.priority, (priorityMap.get(task.priority) || 0) + 1);
      });
      const tasksByPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({ priority, count }));

      // Generate recent activity based on assigned tasks
      const recentActivity = assignedTasks.slice(0, 5).map((task, index) => ({
        id: task.id,
        action: task.status === 'resolved' ? 'Task Completed' : 
                task.status === 'in_progress' ? 'Task Started' : 'Task Assigned',
        taskTitle: task.title,
        timestamp: task.status === 'resolved' && task.resolvedAt ? 
                   new Date(task.resolvedAt).toISOString() : 
                   new Date(task.createdAt).toISOString(),
        details: `${task.area} - ${task.priority} priority`
      }));

      setReportData({
        totalAssignedTasks: assignedTasks.length,
        pendingTasks: pendingTasks.length,
        inProgressTasks: inProgressTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        averageCompletionTime,
        slaCompliance,
        tasksByArea,
        tasksByPriority,
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
                 <div className="text-center">
           <div className="relative">
             <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
           </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Generating Supervisor Reports</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we compile your performance analytics...</p>
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
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Supervisor Performance Reports</h1>
              <p className="text-gray-600">Analytics and insights for your assigned tasks and performance</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2">
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
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-900">{reportData.totalAssignedTasks}</p>
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

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700">Avg Completion</p>
                <p className="text-3xl font-bold text-orange-900">{reportData.averageCompletionTime}d</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-900">{reportData.overdueTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <span className="font-medium">{reportData.pendingTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">In Progress</span>
                </div>
                <span className="font-medium">{reportData.inProgressTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Completed</span>
                </div>
                <span className="font-medium">{reportData.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Overdue</span>
                </div>
                <span className="font-medium">{reportData.overdueTasks}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Priority</h3>
            <div className="space-y-4">
              {reportData.tasksByPriority.map((item, index) => (
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

        {/* Tasks by Area */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Area</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.tasksByArea.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{item.area}</span>
                </div>
                <span className="font-medium text-orange-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {reportData.recentActivity.length > 0 ? (
              reportData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{activity.action}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.taskTitle}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.details}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

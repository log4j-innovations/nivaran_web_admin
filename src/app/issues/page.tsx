'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { RoleGuard } from '@/components/RoleGuard';
import IssueForm from '@/components/issues/IssueForm';
import IssueList from '@/components/issues/IssueList';
import { firestoreService } from '@/lib/firebase';
import { Plus, List, Grid, Filter, FileText, Clock, Loader2, CheckCircle2 } from 'lucide-react';

export default function IssuesPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  const canCreateIssues = user?.role === 'city_engineer' || user?.role === 'super_admin';

  // Fetch real-time statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const issues = await firestoreService.getIssues();
        
        const newStats = {
          total: issues.length,
          pending: issues.filter((issue) => issue.status === 'pending').length,
          inProgress: issues.filter((issue) => issue.status === 'in_progress').length,
          resolved: issues.filter((issue) => issue.status === 'resolved').length
        };
        
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching issue stats:', error);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <RoleGuard allowedRoles={['super_admin', 'city_engineer', 'field_supervisor', 'auditor']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Issue Management</h1>
              <p className="text-gray-600 text-sm sm:text-base">Report, track, and resolve municipal issues</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button
                  onClick={() => setView('list')}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-2" />
                  List View
                </button>
                <button
                  onClick={() => setView('form')}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'form' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4 inline mr-2" />
                  Form View
                </button>
              </div>

              {/* Create Issue Button */}
              {canCreateIssues && view === 'list' && (
                <button
                  onClick={() => setView('form')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Report Issue</span>
                </button>
              )}

              {/* Back to List Button */}
              {view === 'form' && (
                <button
                  onClick={() => setView('list')}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center sm:justify-start space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Back to List</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                  <div className="text-sm text-blue-600">Total Issues</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-900">{stats.inProgress}</div>
                  <div className="text-sm text-orange-600">In Progress</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">{stats.resolved}</div>
                  <div className="text-sm text-green-600">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {view === 'list' ? (
            <IssueList />
          ) : (
            <IssueForm />
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { RoleGuard } from '@/components/RoleGuard';
import IssueForm from '@/components/issues/IssueForm';
import IssueList from '@/components/issues/IssueList';
import { firestoreService } from '@/lib/firebase';
import { Plus, List, Grid, Filter } from 'lucide-react';

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
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issue Management</h1>
              <p className="text-gray-600">Report, track, and resolve municipal issues</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Report Issue</span>
                </button>
              )}

              {/* Back to List Button */}
              {view === 'form' && (
                <button
                  onClick={() => setView('list')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <List className="w-4 h-4" />
                  <span>Back to List</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                   <Filter className="w-5 h-5 text-blue-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                   <div className="text-sm text-blue-600">Total Issues</div>
                 </div>
               </div>
             </div>

                         <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                   <Filter className="w-5 h-5 text-yellow-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                   <div className="text-sm text-yellow-600">Pending</div>
                 </div>
               </div>
             </div>

                         <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                   <Filter className="w-5 h-5 text-orange-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-orange-900">{stats.inProgress}</div>
                   <div className="text-sm text-orange-600">In Progress</div>
                 </div>
               </div>
             </div>

                         <div className="bg-green-50 p-4 rounded-xl border border-green-200">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                   <Filter className="w-5 h-5 text-green-600" />
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

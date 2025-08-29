'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { firestoreService } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import IssueDetails from './IssueDetails';
import {
  AlertTriangle,
  Search,
  Eye,
  Edit,
  Clock
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  area: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  slaDeadline?: Date;
  slaTargetHours?: number;
  slaEscalationHours?: number;
  estimatedCost?: number;
}

type FirestoreIssue = Awaited<ReturnType<typeof firestoreService.getIssues>>[0];

export default function IssueList() {
  const { user } = useAuth();
  const toast = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    area: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Fetch issues from Firestore
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const issuesData = await firestoreService.getIssues();
        setIssues(issuesData.map((issue) => ({
          id: issue.id,
          title: (issue.title as string) || '',
          description: (issue.description as string) || '',
          status: (issue.status as string) as Issue['status'],
          priority: (issue.priority as string) as Issue['priority'],
          severity: (issue.severity as string) as Issue['severity'],
          category: (issue.category as string) || '',
          location: {
            address: ((issue.location as Record<string, unknown>)?.address as string) || '',
            city: ((issue.location as Record<string, unknown>)?.city as string) || '',
            state: ((issue.location as Record<string, unknown>)?.state as string) || '',
            zipCode: ((issue.location as Record<string, unknown>)?.zipCode as string) || ''
          },
          area: (issue.area as string) || '',
          reportedBy: (issue.reportedBy as string) || '',
          assignedTo: issue.assignedTo as string | undefined,
          createdAt: (issue.createdAt as { toDate(): Date }).toDate(),
          updatedAt: (issue.updatedAt as { toDate(): Date }).toDate(),
          slaDeadline: issue.slaDeadline ? (issue.slaDeadline as { toDate(): Date }).toDate() : undefined,
          slaTargetHours: (issue.slaTargetHours as number) || undefined,
          slaEscalationHours: (issue.slaEscalationHours as number) || undefined,
          estimatedCost: (issue.estimatedCost as number) || undefined
        })));
      } catch (error) {
        console.error('Error fetching issues:', error);
        toast.error('Fetch Failed', 'Failed to load issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [toast]);

  // Apply filters and search
  useEffect(() => {
    let filtered = issues;

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(issue => issue.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }

    // Apply area filter
    if (filters.area) {
      filtered = filtered.filter(issue => issue.area === filters.area);
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  }, [issues, filters, searchTerm]);

  // Calculate SLA status
  const getSLAStatus = (issue: Issue) => {
    if (!issue.slaDeadline) return 'no-sla';
    
    const now = new Date();
    const timeRemaining = issue.slaDeadline.getTime() - now.getTime();
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);
    
    if (hoursRemaining < 0) return 'breached';
    if (hoursRemaining < 6) return 'critical';
    if (hoursRemaining < 24) return 'warning';
    return 'normal';
  };

  // Get SLA status color and text
  const getSLAStatusInfo = (status: string) => {
    switch (status) {
      case 'breached':
        return { color: 'text-red-600', bg: 'bg-red-50', text: 'SLA Breached' };
      case 'critical':
        return { color: 'text-orange-600', bg: 'bg-orange-50', text: 'Critical' };
      case 'warning':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Warning' };
      case 'normal':
        return { color: 'text-green-600', bg: 'bg-green-50', text: 'On Track' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', text: 'No SLA' };
    }
  };

  // Handle status change
  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await firestoreService.updateIssue(issueId, { status: newStatus });
      
      // Update local state
      setIssues(prev => prev.map(issue =>
        issue.id === issueId ? { ...issue, status: newStatus as Issue['status'] } : issue
      ));
      
      toast.success('Status Updated', `Issue status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Update Failed', 'Failed to update issue status');
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Issue Management</h1>
            <p className="text-gray-600">Monitor and manage municipal issues</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{filteredIssues.length}</div>
              <div className="text-sm text-gray-500">Total Issues</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
                         <select
               value={filters.status}
               onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
               className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
             >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
                         <select
               value={filters.priority}
               onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
               className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
             >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
                         <select
               value={filters.category}
               onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
               className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
             >
              <option value="">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="street_light">Street Light</option>
              <option value="water_leak">Water Leak</option>
              <option value="traffic_signal">Traffic Signal</option>
              <option value="sidewalk">Sidewalk</option>
              <option value="drainage">Drainage</option>
              <option value="debris">Debris</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.map((issue) => {
                const slaStatus = getSLAStatus(issue);
                const slaInfo = getSLAStatusInfo(slaStatus);
                
                return (
                  <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {issue.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {issue.description.substring(0, 60)}...
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {issue.location.address}, {issue.location.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    
                    <td className="px-6 py-4">
                      <PriorityIndicator priority={issue.priority} variant="badge" size="sm" />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${slaInfo.bg} ${slaInfo.color}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {slaInfo.text}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{issue.area}</div>
                      <div className="text-xs text-gray-500">{issue.category}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {issue.assignedTo ? (
                        <div className="text-sm text-gray-900">{issue.assignedTo}</div>
                      ) : (
                        <div className="text-sm text-gray-400">Unassigned</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                                                 <button
                           onClick={() => setSelectedIssueId(issue.id)}
                           className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                           title="View Details"
                         >
                           <Eye className="w-4 h-4" />
                         </button>
                        
                        {user?.role === 'city_engineer' || user?.role === 'super_admin' ? (
                          <button
                            onClick={() => {/* TODO: Edit issue */}}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Edit Issue"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        ) : null}
                        
                        {user?.role === 'field_supervisor' && issue.assignedTo === user.id ? (
                          <select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
                 )}
       </div>

       {/* Issue Details Modal */}
       {selectedIssueId && (
         <IssueDetails
           issueId={selectedIssueId}
           onClose={() => setSelectedIssueId(null)}
           onUpdate={() => {
             // Refresh issues after update
             const fetchIssues = async () => {
               try {
                 const issuesData = await firestoreService.getIssues();
                 setIssues(issuesData.map((issue) => ({
                   id: issue.id,
                   title: (issue.title as string) || '',
                   description: (issue.description as string) || '',
                   status: (issue.status as string) as Issue['status'],
                   priority: (issue.priority as string) as Issue['priority'],
                   severity: (issue.severity as string) as Issue['severity'],
                   category: (issue.category as string) || '',
                   location: {
                     address: ((issue.location as Record<string, unknown>)?.address as string) || '',
                     city: ((issue.location as Record<string, unknown>)?.city as string) || '',
                     state: ((issue.location as Record<string, unknown>)?.state as string) || '',
                     zipCode: ((issue.location as Record<string, unknown>)?.zipCode as string) || ''
                   },
                   area: (issue.area as string) || '',
                   reportedBy: (issue.reportedBy as string) || '',
                   assignedTo: issue.assignedTo as string | undefined,
                   createdAt: (issue.createdAt as { toDate(): Date }).toDate(),
                   updatedAt: (issue.updatedAt as { toDate(): Date }).toDate(),
                   slaDeadline: issue.slaDeadline ? (issue.slaDeadline as { toDate(): Date }).toDate() : undefined,
                   slaTargetHours: (issue.slaTargetHours as number) || undefined,
                   slaEscalationHours: (issue.slaEscalationHours as number) || undefined,
                   estimatedCost: (issue.estimatedCost as number) || undefined
                 })));
               } catch (error) {
                 console.error('Error refreshing issues:', error);
               }
             };
             fetchIssues();
           }}
         />
       )}
     </div>
   );
 }

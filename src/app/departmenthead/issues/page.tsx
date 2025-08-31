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
  Edit,
  Users
} from 'lucide-react';
import IssueImageGallery from '@/components/IssueImageGallery';

export default function DepartmentHeadIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssigned, setFilterAssigned] = useState<string>('all');

  useEffect(() => {
    loadIssues();
    loadSupervisors();
  }, []);

  const loadSupervisors = async () => {
    try {
      const allUsers = await firestoreService.getUsers();
      const supervisorUsers = allUsers.filter(u => u.role === 'Supervisor' && u.isActive);
      setSupervisors(supervisorUsers);
    } catch (err: any) {
      console.error('Error loading supervisors:', err);
    }
  };

  const loadIssues = async () => {
    try {
      setLoading(true);
      // Get issues filtered by user's geographic areas
      if (!user) {
        setIssues([]);
        return;
      }
      const issuesData = await firestoreService.getIssuesByGeographicArea(user);
      setIssues(issuesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    try {
      await firestoreService.updateIssueStatus(issueId, newStatus);
      await loadIssues(); // Reload issues
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignIssue = async (issueId: string, supervisorId: string) => {
    try {
      await firestoreService.assignIssue(issueId, supervisorId);
      setShowAssignModal(false);
      setSelectedIssue(null);
      await loadIssues(); // Reload issues
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
    const matchesAssigned = filterAssigned === 'all' || 
                           (filterAssigned === 'assigned' && issue.assignedTo) ||
                           (filterAssigned === 'unassigned' && !issue.assignedTo);
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.area.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesAssigned && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                 <div className="text-center">
           <div className="relative">
             <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
           </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Issues</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the latest data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Issues</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadIssues}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Management</h1>
        <p className="text-gray-600">Manage and track municipal infrastructure issues as Department Head</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{issues.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.filter(i => i.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.filter(i => i.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {issues.filter(i => i.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues by title, description, or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Assignment</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Issues ({filteredIssues.length})</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredIssues.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div key={issue.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{issue.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{issue.description}</p>
                      
                      {/* Issue Images */}
                      {(issue.images && issue.images.length > 0) || issue.imageUrl ? (
                        <div className="mb-3">
                          <IssueImageGallery 
                            images={issue.images}
                            imageUrl={issue.imageUrl}
                            title="Issue Images"
                            className="mb-3"
                          />
                        </div>
                      ) : null}
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{issue.area}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                        {issue.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Assigned to: {issue.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {issue.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowAssignModal(true);
                          }}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Assign Issue"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                      )}
                      
                      {issue.status !== 'resolved' && issue.status !== 'closed' && (
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                          title="Update Status"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Issue Details</h3>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Title</h4>
                  <p className="text-gray-600">{selectedIssue.title}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-gray-600">{selectedIssue.description}</p>
                </div>
                
                {/* Issue Images */}
                {(selectedIssue.images && selectedIssue.images.length > 0) || selectedIssue.imageUrl ? (
                  <div>
                    <IssueImageGallery 
                      images={selectedIssue.images}
                      imageUrl={selectedIssue.imageUrl}
                      title="Issue Images"
                    />
                  </div>
                ) : null}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Priority</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Area</h4>
                    <p className="text-gray-600">{selectedIssue.area}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Category</h4>
                    <p className="text-gray-600">{selectedIssue.category}</p>
                  </div>
                </div>
                
                {selectedIssue.assignedTo && (
                  <div>
                    <h4 className="font-medium text-gray-900">Assigned To</h4>
                    <p className="text-gray-600">{selectedIssue.assignedTo}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900">Created</h4>
                  <p className="text-gray-600">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                {selectedIssue.status === 'pending' && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Assign Issue
                  </button>
                )}
                
                {selectedIssue.status !== 'resolved' && selectedIssue.status !== 'closed' && (
                  <button
                    onClick={() => {
                      // Handle status update
                      const newStatus = selectedIssue.status === 'pending' ? 'in_progress' : 'resolved';
                      handleStatusUpdate(selectedIssue.id, newStatus);
                      setSelectedIssue(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {selectedIssue.status === 'pending' ? 'Start Work' : 'Mark Resolved'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Issue Modal */}
      {showAssignModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Assign Issue</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Supervisor
                </label>
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select supervisor...</option>
                  <option value="supervisor1">Supervisor 1</option>
                  <option value="supervisor2">Supervisor 2</option>
                  <option value="supervisor3">Supervisor 3</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignIssue(selectedIssue.id, assignTo)}
                  disabled={!assignTo}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

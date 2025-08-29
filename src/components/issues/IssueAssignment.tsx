'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { firestoreService } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import {
  UserPlus,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  currentWorkload?: number;
  maxCapacity?: number;
}

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  slaDeadline?: Date;
}

interface IssueAssignmentProps {
  issueId: string;
  currentAssignee?: string;
  onAssignmentChange: (assigneeId: string | null) => void;
  onClose: () => void;
}

export default function IssueAssignment({ 
  issueId, 
  currentAssignee, 
  onAssignmentChange, 
  onClose 
}: IssueAssignmentProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Fetch available users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // For now, we'll use mock data since we don't have a getUsers function
        // TODO: Implement getUsers in firestoreService
        const mockUsers: User[] = [
          {
            id: 'user-1',
            name: 'John Smith',
            email: 'john.smith@municipal.com',
            role: 'field_supervisor',
            department: 'Road Maintenance',
            currentWorkload: 3,
            maxCapacity: 5
          },
          {
            id: 'user-2',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@municipal.com',
            role: 'field_supervisor',
            department: 'Infrastructure',
            currentWorkload: 1,
            maxCapacity: 5
          },
          {
            id: 'user-3',
            name: 'Mike Davis',
            email: 'mike.davis@municipal.com',
            role: 'field_supervisor',
            department: 'Public Works',
            currentWorkload: 4,
            maxCapacity: 5
          }
        ];
        
        // Filter out current user and only show field supervisors
        const availableUsers = mockUsers.filter(u => 
          u.role === 'field_supervisor' && u.id !== user?.id
        );
        
        setUsers(availableUsers);
        setFilteredUsers(availableUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Fetch Failed', 'Failed to load available users');
      }
    };

    fetchUsers();
  }, [user, toast]);

  // Apply filters and search
  useEffect(() => {
    let filtered = users;

    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, searchTerm]);

  // Handle assignment
  const handleAssignment = async () => {
    if (!selectedUser) {
      toast.error('Selection Required', 'Please select a user to assign');
      return;
    }

    setLoading(true);
    try {
      const selectedUserData = users.find(u => u.id === selectedUser);
      
      // Update issue assignment
      await firestoreService.updateIssue(issueId, {
        assignedTo: selectedUser,
        assignedToName: selectedUserData?.name,
        status: 'assigned',
        updatedAt: new Date()
      });

      // Update user workload
      // TODO: Implement updateUserWorkload in firestoreService
      
      toast.success('Assignment Complete', `Issue assigned to ${selectedUserData?.name}`);
      onAssignmentChange(selectedUser);
      onClose();
    } catch (error) {
      console.error('Error assigning issue:', error);
      toast.error('Assignment Failed', 'Failed to assign issue');
    } finally {
      setLoading(false);
    }
  };

  // Handle unassignment
  const handleUnassignment = async () => {
    setLoading(true);
    try {
      await firestoreService.updateIssue(issueId, {
        assignedTo: null,
        assignedToName: null,
        status: 'pending',
        updatedAt: new Date()
      });

      toast.success('Unassignment Complete', 'Issue unassigned successfully');
      onAssignmentChange(null);
      onClose();
    } catch (error) {
      console.error('Error unassigning issue:', error);
      toast.error('Unassignment Failed', 'Failed to unassign issue');
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadStatus = (user: User) => {
    if (!user.currentWorkload || !user.maxCapacity) return 'unknown';
    const percentage = (user.currentWorkload / user.maxCapacity) * 100;
    
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    if (percentage >= 50) return 'moderate';
    return 'good';
  };

  const getWorkloadColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'good': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Issue Assignment</h2>
                <p className="text-blue-100">Assign or reassign this issue to a field supervisor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Current Assignment Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Assignment</h3>
            {currentAssignee ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Currently assigned to: <strong>{currentAssignee}</strong></span>
                </div>
                <button
                  onClick={handleUnassignment}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Unassign'}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-gray-600">
                <AlertTriangle className="w-5 h-5" />
                <span>No one currently assigned to this issue</span>
              </div>
            )}
          </div>

          {/* Filters and Search */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="field_supervisor">Field Supervisor</option>
              <option value="city_engineer">City Engineer</option>
            </select>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{filteredUsers.length} users available</span>
            </div>
          </div>

          {/* Available Users */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Field Supervisors</h3>
            
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No users found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => {
                  const workloadStatus = getWorkloadStatus(user);
                  const workloadColor = getWorkloadColor(workloadStatus);
                  
                  return (
                    <div
                      key={user.id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedUser === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.department}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${workloadColor}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {user.currentWorkload || 0}/{user.maxCapacity || 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Workload: {workloadStatus}
                        </div>
                        
                        {selectedUser === user.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleAssignment}
              disabled={!selectedUser || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Assign Issue</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


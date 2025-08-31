'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { firestoreService } from '@/lib/firebaseServices';
import { User } from '@/lib/types';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Edit, 
  Eye, 
  Filter,
  Search,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield,
  Clock,
  RefreshCw
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    userId: '',
    newRole: 'Department Head' as 'Department Head' | 'Supervisor' | 'Auditor',
    action: 'approve' as 'approve' | 'reject'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await firestoreService.getUsers();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string, role: 'Department Head' | 'Supervisor' | 'Auditor') => {
    try {
      await firestoreService.approveUser(userId, role, user?.id || 'admin');
      await loadUsers(); // Reload users
      setShowApprovalModal(false);
      setApprovalData({ userId: '', newRole: 'Department Head', action: 'approve' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await firestoreService.rejectUser(userId, 'Rejected by Super Admin', user?.id || 'admin');
      await loadUsers(); // Reload users
      setShowApprovalModal(false);
      setApprovalData({ userId: '', newRole: 'Department Head', action: 'approve' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'Department Head' | 'Supervisor' | 'Auditor') => {
    try {
      await firestoreService.updateUserRole(userId, newRole, user?.id || 'admin');
      await loadUsers(); // Reload users
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    // Robust null/undefined checks
    if (!user) return false;
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    // Safe string operations with null checks
    const searchTermLower = searchTerm.toLowerCase();
    const userName = user.name || '';
    const userEmail = user.email || '';
    const userDepartment = user.department || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTermLower) ||
                         userEmail.toLowerCase().includes(searchTermLower) ||
                         userDepartment.toLowerCase().includes(searchTermLower);
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return 'bg-purple-100 text-purple-800';
      case 'Department Head': return 'bg-blue-100 text-blue-800';
      case 'Supervisor': return 'bg-orange-100 text-orange-800';
      case 'Auditor': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
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
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Users</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the latest data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <UserX className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={loadUsers}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Refresh Page
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage system users, roles, and permissions</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Total Users</p>
                <p className="text-3xl font-bold text-blue-900">{users.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-700">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {users.filter(u => u?.role === 'pending').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <UserCheck className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Active Users</p>
                <p className="text-3xl font-bold text-green-900">
                  {users.filter(u => u?.isActive).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Super Admins</p>
                <p className="text-3xl font-bold text-purple-900">
                  {users.filter(u => u?.role === 'SuperAdmin').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                                 <select
                   value={filterRole}
                   onChange={(e) => setFilterRole(e.target.value)}
                   className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="all">All Roles</option>
                   <option value="SuperAdmin">Super Admin</option>
                   <option value="Department Head">Department Head</option>
                   <option value="Supervisor">Supervisor</option>
                   <option value="Auditor">Auditor</option>
                   <option value="pending">Pending</option>
                 </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Users ({filteredUsers.length})</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="relative mb-6">
                    <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">0</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Users Found</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                      ? "No users match your current search criteria. Try adjusting your filters or search terms."
                      : "No users are currently registered in the system."
                    }
                  </p>
                  {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterRole('all');
                        setFilterStatus('all');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      <RefreshCw className="h-4 w-4 inline mr-2" />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredUsers.map((userItem) => (
                <div key={userItem.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{userItem.name || 'Unnamed User'}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userItem.role || 'pending')}`}>
                          {userItem.role === 'pending' ? 'Pending Approval' : (userItem.role || 'Unknown')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(userItem.status || 'inactive')}`}>
                          {userItem.status || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{userItem.email || 'No email'}</span>
                        </div>
                        {userItem.department && (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{userItem.department}</span>
                          </div>
                        )}
                        {userItem.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{userItem.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined: {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        {userItem.approvalDate && (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            <span>Approved: {new Date(userItem.approvalDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedUser(userItem);
                          setShowUserModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {userItem.role === 'pending' && (
                        <button
                          onClick={() => {
                                                         setApprovalData({
                               userId: userItem.id,
                               newRole: 'Department Head',
                               action: 'approve'
                             });
                            setShowApprovalModal(true);
                          }}
                          className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                          title="Approve User"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      
                      {userItem.role !== 'SuperAdmin' && userItem.role !== 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedUser(userItem);
                            setShowUserModal(true);
                          }}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit User"
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

      {/* User Details Modal */}
      {selectedUser && showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Name</h4>
                  <p className="text-gray-600">{selectedUser.name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Role</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Department</h4>
                    <p className="text-gray-600">{selectedUser.department || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600">{selectedUser.phone || 'Not specified'}</p>
                  </div>
                </div>
                
                {selectedUser.assignedAreas && selectedUser.assignedAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900">Assigned Areas</h4>
                    <p className="text-gray-600">{selectedUser.assignedAreas.join(', ')}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900">Created</h4>
                  <p className="text-gray-600">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                
                {selectedUser.approvalDate && (
                  <div>
                    <h4 className="font-medium text-gray-900">Approval Date</h4>
                    <p className="text-gray-600">{new Date(selectedUser.approvalDate).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {selectedUser.role !== 'SuperAdmin' && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Update Role</h4>
                  <div className="flex gap-3">
                                         <select
                       value={approvalData.newRole}
                       onChange={(e) => setApprovalData(prev => ({ ...prev, newRole: e.target.value as any }))}
                       className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                       <option value="Department Head">Department Head</option>
                       <option value="Supervisor">Supervisor</option>
                       <option value="Auditor">Auditor</option>
                     </select>
                    <button
                      onClick={() => handleUpdateUserRole(selectedUser.id, approvalData.newRole)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Update Role
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Approve User</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Role
                </label>
                                 <select
                   value={approvalData.newRole}
                   onChange={(e) => setApprovalData(prev => ({ ...prev, newRole: e.target.value as any }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="Department Head">Department Head</option>
                   <option value="Supervisor">Supervisor</option>
                   <option value="Auditor">Auditor</option>
                 </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveUser(approvalData.userId, approvalData.newRole)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { firestoreService } from '@/lib/firebaseServices';
import { Area, Issue, User } from '@/lib/types';
import { MapPin, Users, AlertTriangle, Search, Filter, Eye, BarChart3, Clock, X } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface AreaStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  escalatedIssues: number;
  avgResolutionTime: number;
  assignedSupervisor?: string;
}

export default function DepartmentHeadAreasPage() {
  const { user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [areaStats, setAreaStats] = useState<{ [key: string]: AreaStats }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showAreaDetails, setShowAreaDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all areas, issues, and supervisors
      const [areasData, issuesData, supervisorsData] = await Promise.all([
        firestoreService.getAreas(),
        firestoreService.getIssues(),
        firestoreService.getUsers()
      ]);

      console.log('Areas loaded:', areasData);
      console.log('Issues loaded:', issuesData);
      console.log('Supervisors loaded:', supervisorsData);

      setAreas(areasData);
      setIssues(issuesData);

      // Filter supervisors to only get Supervisor role
      const supervisorUsers = supervisorsData.filter(u => u.role === 'Supervisor');
      setSupervisors(supervisorUsers);

      // Calculate stats for each area
      const stats: { [key: string]: AreaStats } = {};
      areasData.forEach(area => {
        // Try to match issues by area name (case-insensitive)
        const areaIssues = issuesData.filter(issue => {
          const issueArea = issue.area.toLowerCase();
          const areaName = area.name.toLowerCase();
          return issueArea === areaName || 
                 issueArea === areaName.replace(/\s+/g, '_') ||
                 issueArea === areaName.replace(/\s+/g, '');
        });
        
        const pendingIssues = areaIssues.filter(issue => issue.status === 'pending').length;
        const resolvedIssues = areaIssues.filter(issue => issue.status === 'resolved').length;
        const escalatedIssues = areaIssues.filter(issue => issue.status === 'escalated').length;

        // Calculate average resolution time
        const resolvedIssuesWithDates = areaIssues.filter(issue => 
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

        // Find assigned supervisor
        const assignedSupervisor = supervisorUsers.find(s => s.id === area.supervisorId)?.name;

        stats[area.name] = {
          totalIssues: areaIssues.length,
          pendingIssues,
          resolvedIssues,
          escalatedIssues,
          avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
          assignedSupervisor,
        };
      });

      setAreaStats(stats);

    } catch (err) {
      console.error('Error loading areas data:', err);
      setError('Failed to load areas data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = areas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         area.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || area.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
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

  const getAreaIssues = (areaName: string) => {
    return issues.filter(issue => {
      const issueArea = issue.area.toLowerCase();
      const areaNameLower = areaName.toLowerCase();
      return issueArea === areaNameLower || 
             issueArea === areaNameLower.replace(/\s+/g, '_') ||
             issueArea === areaNameLower.replace(/\s+/g, '');
    });
  };

  const handleViewAreaDetails = (area: Area) => {
    setSelectedArea(area);
    setShowAreaDetails(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading areas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Areas</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadData} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Area Management</h1>
          <p className="text-gray-600">Monitor and manage areas under your jurisdiction</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search areas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="district">District</option>
                <option value="neighborhood">Neighborhood</option>
                <option value="zone">Zone</option>
              </select>
            </div>
          </div>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAreas.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Areas Found</h3>
              <p className="text-gray-600">No areas match your current filters</p>
            </div>
          ) : (
            filteredAreas.map((area) => {
              const stats = areaStats[area.name] || {
                totalIssues: 0,
                pendingIssues: 0,
                resolvedIssues: 0,
                escalatedIssues: 0,
                avgResolutionTime: 0,
              };

              return (
                <div key={area.id} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        {area.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        area.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        area.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {area.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      Type: <span className="font-medium capitalize">{area.type}</span> | 
                      Population: <span className="font-medium">{area.population.toLocaleString()}</span>
                    </p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{stats.totalIssues}</div>
                        <div className="text-xs text-gray-600">Total Issues</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{stats.resolvedIssues}</div>
                        <div className="text-xs text-gray-600">Resolved</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="text-lg font-bold text-yellow-600">{stats.pendingIssues}</div>
                        <div className="text-xs text-gray-600">Pending</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="text-lg font-bold text-red-600">{stats.escalatedIssues}</div>
                        <div className="text-xs text-gray-600">Escalated</div>
                      </div>
                    </div>

                    {/* Supervisor Info */}
                    {stats.assignedSupervisor && (
                      <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Supervisor: <span className="font-medium">{stats.assignedSupervisor}</span>
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewAreaDetails(area)}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Area Details Modal */}
        {showAreaDetails && selectedArea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                    {selectedArea.name}
                  </h2>
                  <button
                    onClick={() => setShowAreaDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Area Info */}
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Area Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <p className="text-gray-900 capitalize">{selectedArea.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Priority</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedArea.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          selectedArea.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedArea.priority}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Population</label>
                        <p className="text-gray-900">{selectedArea.population.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Active Issues</label>
                        <p className="text-gray-900">{selectedArea.activeIssues}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Total Issues</label>
                        <p className="text-gray-900">{selectedArea.totalIssues}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Average Resolution Time</label>
                        <p className="text-gray-900">{selectedArea.averageResolutionTime} days</p>
                      </div>
                      {areaStats[selectedArea.name]?.assignedSupervisor && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Assigned Supervisor</label>
                          <p className="text-gray-900">{areaStats[selectedArea.name].assignedSupervisor}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Area Stats */}
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Performance Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Issues</span>
                        <span className="font-semibold">{areaStats[selectedArea.name]?.totalIssues || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Resolved Issues</span>
                        <span className="font-semibold text-green-600">{areaStats[selectedArea.name]?.resolvedIssues || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending Issues</span>
                        <span className="font-semibold text-yellow-600">{areaStats[selectedArea.name]?.pendingIssues || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Escalated Issues</span>
                        <span className="font-semibold text-red-600">{areaStats[selectedArea.name]?.escalatedIssues || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Resolution Time</span>
                        <span className="font-semibold">{areaStats[selectedArea.name]?.avgResolutionTime || 0} days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Issues */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Issues</h3>
                  <div className="space-y-3">
                    {getAreaIssues(selectedArea.name).length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No issues found for this area
                      </div>
                    ) : (
                      getAreaIssues(selectedArea.name)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((issue) => (
                          <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{issue.title}</h4>
                              <p className="text-sm text-gray-600">{issue.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                  {issue.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                                  {issue.priority}
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
          </div>
        )}
      </div>
    </div>
  );
}

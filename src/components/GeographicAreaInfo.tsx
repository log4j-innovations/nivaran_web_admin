'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { firestoreService } from '@/lib/firebaseServices';
import { GeographicFilterService } from '@/lib/geographicFilterService';
import { MapPin, Users, Target, TrendingUp } from 'lucide-react';

interface GeographicStats {
  totalIssues: number;
  issuesInRange: number;
  averageDistance: number;
  coverageArea: number;
}

export default function GeographicAreaInfo() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GeographicStats>({
    totalIssues: 0,
    issuesInRange: 0,
    averageDistance: 0,
    coverageArea: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGeographicStats();
  }, [user]);

  const loadGeographicStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const geographicStats = await firestoreService.getGeographicStats(user);
      setStats(geographicStats);
    } catch (error) {
      console.error('Error loading geographic stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.geographicAreas || user.geographicAreas.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Geographic Coverage</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No geographic areas assigned</p>
          <p className="text-sm mt-1">Contact administrator to assign areas</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Geographic Coverage</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Geographic Coverage</h3>
      </div>

      {/* Geographic Areas */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Areas</h4>
        <div className="space-y-2">
          {user.geographicAreas.map((area) => (
            <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">{area.name}</span>
              </div>
              <div className="text-sm text-gray-500">
                {area.radius}km radius
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.issuesInRange}</div>
          <div className="text-sm text-gray-600">Issues in Range</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.averageDistance}km</div>
          <div className="text-sm text-gray-600">Avg Distance</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.coverageArea}km²</div>
          <div className="text-sm text-gray-600">Coverage Area</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{user.geographicAreas.length}</div>
          <div className="text-sm text-gray-600">Total Areas</div>
        </div>
      </div>

      {/* Coverage Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Coverage Summary</span>
        </div>
        <p className="text-sm text-gray-600">
          You have access to {stats.issuesInRange} out of {stats.totalIssues} total issues 
          within your assigned geographic areas.
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MapPin, Navigation, Layers, Filter } from 'lucide-react';

interface MapIssue {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  area: string;
}

interface MapViewProps {
  issues?: MapIssue[];
  selectedArea?: string;
  showHeatmap?: boolean;
  onIssueClick?: (issueId: string) => void;
}

export default function MapView({ issues = [], selectedArea, showHeatmap = false, onIssueClick }: MapViewProps) {
  const { user } = useAuth();
  const toast = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [mapIssues, setMapIssues] = useState<MapIssue[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  // Mock issues data for demonstration
  const mockIssues: MapIssue[] = [
    {
      id: '1',
      title: 'Pothole on Main Street',
      status: 'pending',
      priority: 'high',
      category: 'pothole',
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Main Street, Central Delhi'
      },
      area: 'central_delhi'
    },
    {
      id: '2',
      title: 'Street Light Out',
      status: 'in_progress',
      priority: 'medium',
      category: 'street_light',
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: 'Park Road, Ghaziabad'
      },
      area: 'ghaziabad'
    },
    {
      id: '3',
      title: 'Water Leak',
      status: 'critical',
      priority: 'critical',
      category: 'water_leak',
      location: {
        latitude: 28.4595,
        longitude: 77.0266,
        address: 'Market Area, Gurgaon'
      },
      area: 'gurgaon'
    }
  ];

  useEffect(() => {
    setMapIssues(mockIssues);
    initializeMap();
  }, []);

  useEffect(() => {
    if (map && mapIssues.length > 0) {
      updateMarkers();
    }
  }, [map, mapIssues, filters]);

  useEffect(() => {
    if (map && showHeatmap) {
      updateHeatmap();
    }
  }, [map, mapIssues, showHeatmap]);

  const initializeMap = () => {
    // Mock Google Maps initialization
    // In real implementation, you would use Google Maps API
    setLoading(false);
    toast.info('Map Loaded', 'Interactive map is ready');
  };

  const updateMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers = mapIssues
      .filter(issue => {
        if (filters.status !== 'all' && issue.status !== filters.status) return false;
        if (filters.priority !== 'all' && issue.priority !== filters.priority) return false;
        if (filters.category !== 'all' && issue.category !== filters.category) return false;
        return true;
      })
      .map(issue => {
        // Create marker for each issue
        const marker = {
          position: { lat: issue.location.latitude, lng: issue.location.longitude },
          title: issue.title,
          icon: getMarkerIcon(issue.priority, issue.status),
          onClick: () => onIssueClick?.(issue.id)
        };
        return marker;
      });

    setMarkers(newMarkers);
  };

  const updateHeatmap = () => {
    if (heatmap) {
      heatmap.setMap(null);
    }

    const heatmapData = mapIssues.map(issue => ({
      location: { lat: issue.location.latitude, lng: issue.location.longitude },
      weight: getHeatmapWeight(issue.priority)
    }));

    // Mock heatmap implementation
    console.log('Heatmap data:', heatmapData);
    setHeatmap({ data: heatmapData, radius: 50, opacity: 0.8 });
  };

  const getMarkerIcon = (priority: string, status: string) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#eab308',
      low: '#64748b'
    };

    const statusSymbols = {
      pending: '🟡',
      in_progress: '🟠',
      resolved: '🟢',
      escalated: '🔴',
      closed: '⚫'
    };

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${colors[priority as keyof typeof colors]}" stroke="white" stroke-width="2"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${statusSymbols[status as keyof typeof statusSymbols]}</text>
        </svg>
      `)}`,
      scaledSize: { width: 24, height: 24 },
      anchor: { x: 12, y: 12 }
    };
  };

  const getHeatmapWeight = (priority: string) => {
    const weights = {
      critical: 3,
      high: 2,
      medium: 1,
      low: 0.5
    };
    return weights[priority as keyof typeof weights] || 1;
  };

  const getRouteOptimization = () => {
    // Mock route optimization
    toast.info('Route Optimization', 'Calculating optimal route for field supervisors');
  };

  const getAreaBoundaries = () => {
    // Mock area boundaries
    const boundaries = {
      central_delhi: [
        { lat: 28.6139, lng: 77.2090 },
        { lat: 28.7041, lng: 77.1025 },
        { lat: 28.4595, lng: 77.0266 }
      ],
      ghaziabad: [
        { lat: 28.7041, lng: 77.1025 },
        { lat: 28.6139, lng: 77.2090 },
        { lat: 28.4595, lng: 77.0266 }
      ]
    };
    return boundaries;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Issue Map</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filters.status === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filters.status === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: 'critical' }))}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filters.status === 'critical' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Critical
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, priority: 'all' }))}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              title="Show All Priorities"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              title="Show All Categories"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={getRouteOptimization}
              className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              title="Route Optimization"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div 
          ref={mapRef}
          className="w-full h-full bg-gray-100 flex items-center justify-center"
        >
          {/* Mock Map Display */}
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
            <p className="text-gray-600 mb-4">
              {mapIssues.length} issues mapped • {selectedArea || 'All Areas'}
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {mapIssues.slice(0, 4).map(issue => (
                <div 
                  key={issue.id}
                  className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => onIssueClick?.(issue.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      issue.priority === 'critical' ? 'bg-red-500' :
                      issue.priority === 'high' ? 'bg-orange-500' :
                      issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                      <p className="text-xs text-gray-500">{issue.area}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Low</span>
            </div>
          </div>
        </div>

        {/* Heatmap Toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, showHeatmap: !showHeatmap }))}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showHeatmap 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Heatmap
          </button>
        </div>
      </div>
    </div>
  );
}

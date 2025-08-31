'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Check } from 'lucide-react';

interface MapAreaSelectorProps {
  onAreaSelect: (area: {
    id: string;
    name: string;
    center: { latitude: number; longitude: number };
    radius: number;
  }) => void;
  selectedAreas: Array<{
    id: string;
    name: string;
    center: { latitude: number; longitude: number };
    radius: number;
  }>;
  onRemoveArea: (areaId: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function MapAreaSelector({ onAreaSelect, selectedAreas, onRemoveArea }: MapAreaSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const MAP_API_KEY = 'AIzaSyAmKQeTRcW5ix-UGfwxwHDrT0M8RPfOoDI';

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi center

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Initialize search box
    if (searchBoxRef.current) {
      const input = searchBoxRef.current.querySelector('input');
      if (input) {
        const searchBox = new window.google.maps.places.SearchBox(input);
        
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (places.length === 0) return;

          const results = places.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            location: place.geometry.location,
            types: place.types
          }));

          setSearchResults(results);
          setIsSearching(false);
        });
      }
    }

    // Add existing markers for selected areas
    selectedAreas.forEach(area => {
      addMarkerToMap(area.center.latitude, area.center.longitude, area.name, area.radius);
    });
  };

  const addMarkerToMap = (lat: number, lng: number, title: string, radius: number) => {
    if (!map || !window.google) return;

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: title,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 0.8,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      }
    });

    // Add circle to show radius
    const circle = new window.google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      map: map,
      center: { lat, lng },
      radius: radius * 1000 // Convert km to meters
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px;">${title}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">Radius: ${radius}km</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    setMarkers(prev => [...prev, { marker, circle, infoWindow }]);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const geocoder = new window.google.maps.Geocoder();
      const results = await geocoder.geocode({ address: searchTerm + ', India' });
      
      const searchResults = results.results.map((result: any) => ({
        id: result.place_id,
        name: result.formatted_address.split(',')[0],
        address: result.formatted_address,
        location: result.geometry.location,
        types: result.types
      }));

      setSearchResults(searchResults);
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAreaSelect = (result: any) => {
    const areaName = result.name || result.address.split(',')[0];
    const center = {
      latitude: result.location.lat(),
      longitude: result.location.lng()
    };

    // Default radius of 15km for new areas
    const newArea = {
      id: result.id || `area_${Date.now()}`,
      name: areaName,
      center,
      radius: 15
    };

    onAreaSelect(newArea);
    addMarkerToMap(center.latitude, center.longitude, areaName, 15);
    
    // Clear search
    setSearchTerm('');
    setSearchResults([]);
    
    // Center map on selected area
    if (map) {
      map.setCenter(result.location);
      map.setZoom(12);
    }
  };

  const handleRemoveArea = (areaId: string) => {
    // Remove marker from map
    const markerIndex = markers.findIndex(m => m.marker.title === selectedAreas.find(a => a.id === areaId)?.name);
    if (markerIndex !== -1) {
      markers[markerIndex].marker.setMap(null);
      markers[markerIndex].circle.setMap(null);
      markers[markerIndex].infoWindow.close();
      setMarkers(prev => prev.filter((_, index) => index !== markerIndex));
    }

    onRemoveArea(areaId);
  };

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search and Select Areas</h3>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative" ref={searchBoxRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for areas, cities, or landmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border rounded-md max-h-48 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleAreaSelect(result)}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{result.name}</p>
                    <p className="text-sm text-gray-600">{result.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Map View</h3>
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border"
          style={{ minHeight: '384px' }}
        />
      </div>

      {/* Selected Areas */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Areas</h3>
        
        {selectedAreas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No areas selected</p>
            <p className="text-sm mt-1">Search and select areas from the map above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedAreas.map((area) => (
              <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{area.name}</p>
                    <p className="text-sm text-gray-600">
                      {area.center.latitude.toFixed(4)}, {area.center.longitude.toFixed(4)} • {area.radius}km radius
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveArea(area.id)}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

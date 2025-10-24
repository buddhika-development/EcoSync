'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteDetailTask } from '@/types/scheduledRoute.types';

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface RouteDetailMapProps {
  tasks: RouteDetailTask[];
}

// SOLID Principle: Single Responsibility - Component only handles map display for route detail
// HCI Principle: Recognition rather than recall - Visual markers show bin status and completion
export default function RouteDetailMap({ tasks }: RouteDetailMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No bins assigned to this route</p>
      </div>
    );
  }

  // Calculate center and bounds
  const validTasks = tasks.filter((task) => task.latitude && task.longitude);

  if (validTasks.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No location data available</p>
      </div>
    );
  }

  const latitudes = validTasks.map((task) => task.latitude);
  const longitudes = validTasks.map((task) => task.longitude);

  const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
  const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;

  // Create custom icons for different bin states
  // HCI Principle: Consistency and standards - Use distinct colors for different states
  const createCustomIcon = (color: string, isCompleted: boolean) => {
    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${
          isCompleted
            ? '<svg style="width: 16px; height: 16px; color: white;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
            : ''
        }
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-bin-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  // SOLID Principle: Open/Closed - Easy to extend with new status types
  const getMarkerIcon = (task: RouteDetailTask) => {
    const isCompleted = task.requestStatus === 'COMPLETED';

    if (task.binStatus === 'FULL') {
      return createCustomIcon('#EF4444', isCompleted); // Red for full bins
    } else {
      return createCustomIcon('#10B981', isCompleted); // Green for empty bins
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validTasks.map((task) => (
          <Marker
            key={task.binId}
            position={[task.latitude, task.longitude]}
            icon={getMarkerIcon(task)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">Bin {task.binId}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        task.binStatus === 'FULL'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.binStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Task:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(task.requestStatus)}`}>
                      {task.requestStatus}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Location: {task.latitude.toFixed(6)}, {task.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend - HCI Principle: Help and documentation */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000] border border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
            <span className="text-gray-700">Full Bin</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span className="text-gray-700">Empty Bin</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-gray-700">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

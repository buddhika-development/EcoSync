'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ScheduledRouteTask } from '@/types/scheduledRoute.types';

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface RouteMiniMapProps {
  tasks: ScheduledRouteTask[];
}

// SOLID Principle: Single Responsibility - Component only handles mini map display
// HCI Principle: Recognition rather than recall - Visual preview of route
export default function RouteMiniMap({ tasks }: RouteMiniMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
        <p className="text-xs text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="w-full h-32 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-xs text-gray-500 mt-1">No bins</p>
        </div>
      </div>
    );
  }

  // Calculate center from tasks
  const validTasks = tasks.filter((task) => task.latitude !== null && task.longitude !== null);

  if (validTasks.length === 0) {
    return (
      <div className="w-full h-32 bg-gray-50 flex items-center justify-center">
        <p className="text-xs text-gray-500">No location data</p>
      </div>
    );
  }

  const latitudes = validTasks.map((task) => task.latitude as number);
  const longitudes = validTasks.map((task) => task.longitude as number);

  const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
  const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;

  // Create simple pin icon for mini map
  const createMiniIcon = () => {
    const iconHtml = `
      <div style="
        background-color: #10B981;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      "></div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-mini-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  return (
    <div className="w-full h-32 relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validTasks.map((task) => (
          <Marker
            key={task.binId}
            position={[task.latitude as number, task.longitude as number]}
            icon={createMiniIcon()}
          />
        ))}
      </MapContainer>

      {/* Bin count overlay */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 shadow-sm">
        <p className="text-xs font-medium text-gray-700">{validTasks.length} bins</p>
      </div>
    </div>
  );
}

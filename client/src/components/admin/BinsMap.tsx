'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bin } from '@/types/bin.types';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: 'red' | 'green') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color === 'red' ? '#EF4444' : '#22C55E'};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const redMarker = createCustomIcon('red');
const greenMarker = createCustomIcon('green');

// Component to fit map bounds to markers
function FitBounds({ bins }: { bins: Bin[] }) {
  const map = useMap();

  useEffect(() => {
    if (bins.length > 0) {
      const bounds = L.latLngBounds(bins.map(bin => [bin.lat, bin.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bins, map]);

  return null;
}

interface BinsMapProps {
  bins: Bin[];
}

export default function BinsMap({ bins }: BinsMapProps) {
  // Default center (Sri Lanka - Kaduwela area)
  const defaultCenter: [number, number] = [6.9271, 79.9839];
  const defaultZoom = 13;

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {bins.map((bin) => (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={bin.status === 'FULL' ? redMarker : greenMarker}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">Bin ID: {bin.id.slice(0, 8)}...</h3>
                <p className="text-xs text-gray-600">
                  <strong>Status:</strong>{' '}
                  <span className={bin.status === 'FULL' ? 'text-red-600' : 'text-green-600'}>
                    {bin.status}
                  </span>
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Area:</strong> {bin.areaName}
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Location:</strong> {bin.lat.toFixed(6)}, {bin.lng.toFixed(6)}
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Updated:</strong> {new Date(bin.updatedAt).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {bins.length > 0 && <FitBounds bins={bins} />}
      </MapContainer>
      
      {/* Legend - Positioned inside the map container but in the bottom right */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Full</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Normal/Empty</span>
          </div>
        </div>
      </div>
    </div>
  );
}

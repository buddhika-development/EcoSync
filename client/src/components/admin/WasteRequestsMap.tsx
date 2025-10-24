'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WasteRequest } from '@/types/wasteRequest.types';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for waste requests (red/orange for pending)
const createRequestMarker = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: #F97316;
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      ">
        <div style="
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const requestMarker = createRequestMarker();

// Component to fit map bounds to markers
// SOLID Principle: Single Responsibility - This component only handles map bounds fitting
function FitBounds({ requests }: { requests: WasteRequest[] }) {
  const map = useMap();

  useEffect(() => {
    if (requests.length > 0) {
      const bounds = L.latLngBounds(requests.map(req => [req.latitude, req.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [requests, map]);

  return null;
}

interface WasteRequestsMapProps {
  requests: WasteRequest[];
  selectedRequests?: Set<string>;
  onRequestSelect?: (binId: string) => void;
}

// HCI Principle: Visibility of system status - Map provides visual feedback of request locations
// HCI Principle: Recognition rather than recall - Visual markers help users recognize locations
export default function WasteRequestsMap({ 
  requests, 
  selectedRequests = new Set(), 
  onRequestSelect 
}: WasteRequestsMapProps) {
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
        
        {requests.map((request) => {
          const isSelected = selectedRequests.has(request.binId);
          
          return (
            <Marker
              key={request.fullBinId}
              position={[request.latitude, request.longitude]}
              icon={requestMarker}
              // HCI Principle: User control - Allow interaction with markers
              eventHandlers={{
                click: () => onRequestSelect?.(request.binId),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">
                    Request: {request.fullBinId.slice(0, 8)}...
                  </h3>
                  <p className="text-xs text-gray-600">
                    <strong>Bin ID:</strong> {request.binId.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Status:</strong>{' '}
                    <span className="text-orange-600 font-semibold">
                      {request.requestStatus}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Bin Status:</strong> {request.binStatus}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Area:</strong> {request.areaName}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Location:</strong> {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                  </p>
                  {request.updatedAt && (
                    <p className="text-xs text-gray-600">
                      <strong>Updated:</strong> {new Date(request.updatedAt).toLocaleString()}
                    </p>
                  )}
                  {isSelected && (
                    <p className="text-xs text-green-600 font-semibold mt-1">✓ Selected for scheduling</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {requests.length > 0 && <FitBounds requests={requests} />}
      </MapContainer>
      
      {/* Legend - HCI Principle: Consistency and standards */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Pending Request</span>
          </div>
        </div>
      </div>
    </div>
  );
}

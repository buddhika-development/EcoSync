'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Loader2 } from 'lucide-react';
import { BinDetails } from '@/types/pickup';
import { navigationService, NavigationRoute, TravelMode } from '@/services/navigation.service';

/**
 * RouteMap Component with Navigation
 * 
 * SOLID Principles:
 * - Single Responsibility: Displays map with navigation features
 * - Open/Closed: Extensible through props
 * - Dependency Inversion: Depends on abstractions
 * 
 * Features:
 * - Real-time collector location tracking
 * - Turn-by-turn navigation
 * - Route optimization
 * - Distance calculations
 */

interface RouteMapProps {
    bins?: BinDetails[]; // Make bins optional
    onBinClick?: (bin: BinDetails) => void; // Callback for bin marker click
}

/**
 * Map controller component to handle map instance
 */
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);

    return null;
}

/**
 * Create custom marker icons for different bin statuses
 * Design Pattern: Factory Pattern
 */
const createBinIcon = (status: 'COLLECTED' | 'PENDING' | 'CANCELLED') => {
    const colors = {
        COLLECTED: '#28A745', // Green
        PENDING: '#FFA500',   // Orange
        CANCELLED: '#DC3545', // Red
    };

    const color = colors[status];

    return L.divIcon({
        html: `
            <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg 
                    style="transform: rotate(45deg); width: 16px; height: 16px;" 
                    fill="white" 
                    viewBox="0 0 24 24"
                >
                    ${status === 'COLLECTED'
                ? '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>'
                : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>'}
                </svg>
            </div>
        `,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

/**
 * Create collector location marker (blue pulsing dot)
 */
const createCollectorIcon = () => {
    return L.divIcon({
        html: `
            <div style="position: relative; width: 20px; height: 20px;">
                <div style="
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background-color: #007bff;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 10px rgba(0,123,255,0.5);
                    animation: pulse 2s infinite;
                "></div>
            </div>
            <style>
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0,123,255,0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(0,123,255,0); }
                    100% { box-shadow: 0 0 0 0 rgba(0,123,255,0); }
                }
            </style>
        `,
        className: 'collector-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

export default function RouteMap({ bins, onBinClick }: RouteMapProps) {
    // State
    const [collectorLocation, setCollectorLocation] = useState<GeolocationPosition | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);
    const [navigationRoute, setNavigationRoute] = useState<NavigationRoute | null>(null);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [travelMode, setTravelMode] = useState<TravelMode>('driving-car');
    const [showRoute, setShowRoute] = useState(false);
    const watchIdRef = useRef<number | null>(null);

    // Ensure bins is always an array
    const safeBins = bins || [];

    /**
     * Calculate map center based on collector location or bin locations
     */
    const mapCenter = useMemo<[number, number]>(() => {
        // If collector location available and tracking, center on collector
        if (collectorLocation && isTrackingLocation) {
            return [
                collectorLocation.coords.latitude,
                collectorLocation.coords.longitude,
            ];
        }

        // Otherwise center on bins
        if (safeBins.length === 0) {
            return [6.9271, 79.8612]; // Colombo, Sri Lanka
        }

        const avgLat = safeBins.reduce((sum, bin) => sum + bin.latitude, 0) / safeBins.length;
        const avgLng = safeBins.reduce((sum, bin) => sum + bin.longitude, 0) / safeBins.length;

        return [avgLat, avgLng];
    }, [safeBins, collectorLocation, isTrackingLocation]);

    /**
     * Start tracking collector's location
     */
    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        setIsTrackingLocation(true);
        setLocationError(null);

        // Watch position with high accuracy
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setCollectorLocation(position);
                setLocationError(null);
            },
            (error) => {
                setLocationError(`Location error: ${error.message}`);
                console.error('Geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    /**
     * Stop tracking collector's location
     */
    const stopLocationTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTrackingLocation(false);
    };

    /**
     * Calculate route to nearest pending bin
     */
    const calculateNavigationRoute = async () => {
        if (!collectorLocation) {
            alert('Please enable location tracking first');
            return;
        }

        // Find nearest pending/scheduled bin (not yet collected)
        const pendingBins = safeBins.filter(b =>
            b.request_status === 'PENDING' || b.request_status === 'SCHEDULED'
        );
        if (pendingBins.length === 0) {
            alert('No pending bins to navigate to');
            return;
        }

        try {
            setIsCalculatingRoute(true);

            // Calculate route to nearest bin
            const nearestBin = pendingBins.reduce((nearest, bin) => {
                const distance = navigationService.calculateDistance(
                    {
                        latitude: collectorLocation.coords.latitude,
                        longitude: collectorLocation.coords.longitude,
                    },
                    {
                        latitude: bin.latitude,
                        longitude: bin.longitude,
                    }
                );

                const nearestDistance = navigationService.calculateDistance(
                    {
                        latitude: collectorLocation.coords.latitude,
                        longitude: collectorLocation.coords.longitude,
                    },
                    {
                        latitude: nearest.latitude,
                        longitude: nearest.longitude,
                    }
                );

                return distance < nearestDistance ? bin : nearest;
            });

            const route = await navigationService.calculateRoute(
                {
                    latitude: collectorLocation.coords.latitude,
                    longitude: collectorLocation.coords.longitude,
                },
                {
                    latitude: nearestBin.latitude,
                    longitude: nearestBin.longitude,
                },
                travelMode
            );

            setNavigationRoute(route);
            setShowRoute(true);
        } catch (error) {
            console.error('Route calculation error:', error);
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to calculate route. Please check your API key configuration.'
            );
        } finally {
            setIsCalculatingRoute(false);
        }
    };

    /**
     * Clear navigation route
     */
    const clearRoute = () => {
        setNavigationRoute(null);
        setShowRoute(false);
    };

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            stopLocationTracking();
        };
    }, []);

    /**
     * Fix Leaflet default marker icon issue in Next.js
     */
    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
        });
    }, []);

    // Empty state
    if (safeBins.length === 0) {
        return (
            <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No bins to display on map</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {/* Navigation Controls */}
            <div className="flex flex-wrap gap-2">
                {/* Location Tracking Button */}
                <button
                    onClick={isTrackingLocation ? stopLocationTracking : startLocationTracking}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${isTrackingLocation
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                        }`}
                >
                    <Navigation className="w-4 h-4" />
                    {isTrackingLocation ? 'Stop Tracking' : 'Track My Location'}
                </button>

                {/* Calculate Route Button */}
                {isTrackingLocation && collectorLocation && (
                    <button
                        onClick={showRoute ? clearRoute : calculateNavigationRoute}
                        disabled={isCalculatingRoute}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${showRoute
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isCalculatingRoute ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Calculating...
                            </>
                        ) : showRoute ? (
                            'Clear Route'
                        ) : (
                            'Show Route to Nearest Bin'
                        )}
                    </button>
                )}

                {/* Travel Mode Selector */}
                {isTrackingLocation && (
                    <select
                        value={travelMode}
                        onChange={(e) => setTravelMode(e.target.value as TravelMode)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold bg-white hover:border-gray-400 transition-all"
                    >
                        <option value="driving-car">🚗 Driving</option>
                        <option value="foot-walking">🚶 Walking</option>
                        <option value="cycling-regular">🚴 Cycling</option>
                    </select>
                )}
            </div>

            {/* Location Error */}
            {locationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {locationError}
                </div>
            )}

            {/* Route Info */}
            {navigationRoute && showRoute && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-blue-900">
                                📍 Route to Nearest Bin
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Distance: <strong>{navigationRoute.summary.distance}</strong> •
                                Time: <strong>{navigationRoute.summary.duration}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Container */}
            <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md relative">
                <MapContainer
                    center={mapCenter}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <MapController center={mapCenter} />

                    {/* OpenStreetMap Tiles */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Collector Location Marker */}
                    {collectorLocation && (
                        <>
                            <Marker
                                position={[
                                    collectorLocation.coords.latitude,
                                    collectorLocation.coords.longitude,
                                ]}
                                icon={createCollectorIcon()}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className="font-semibold text-sm mb-1">📍 You are here</h3>
                                        <p className="text-xs text-gray-600">
                                            Accuracy: ±{Math.round(collectorLocation.coords.accuracy)}m
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Accuracy Circle */}
                            <Circle
                                center={[
                                    collectorLocation.coords.latitude,
                                    collectorLocation.coords.longitude,
                                ]}
                                radius={collectorLocation.coords.accuracy}
                                pathOptions={{
                                    fillColor: '#007bff',
                                    fillOpacity: 0.1,
                                    color: '#007bff',
                                    weight: 1,
                                }}
                            />
                        </>
                    )}

                    {/* Navigation Route Line */}
                    {navigationRoute && showRoute && navigationRoute.coordinates && (
                        <Polyline
                            positions={navigationRoute.coordinates.map(coord => [coord[1], coord[0]])}
                            pathOptions={{
                                color: '#007bff',
                                weight: 5,
                                opacity: 0.7,
                            }}
                        />
                    )}

                    {/* Bin Markers */}
                    {safeBins.map((bin) => {
                        const icon = createBinIcon(
                            bin.request_status === 'COLLECTED'
                                ? 'COLLECTED'
                                : bin.request_status === 'CANCELLED'
                                    ? 'CANCELLED'
                                    : 'PENDING'
                        );

                        // Calculate distance from collector if location available
                        let distanceText = '';
                        if (collectorLocation) {
                            const distance = navigationService.calculateDistance(
                                {
                                    latitude: collectorLocation.coords.latitude,
                                    longitude: collectorLocation.coords.longitude,
                                },
                                {
                                    latitude: bin.latitude,
                                    longitude: bin.longitude,
                                }
                            );
                            distanceText = distance < 1000
                                ? `${Math.round(distance)}m away`
                                : `${(distance / 1000).toFixed(1)}km away`;
                        }

                        return (
                            <Marker
                                key={bin.bin_id}
                                position={[bin.latitude, bin.longitude]}
                                icon={icon}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className="font-semibold text-sm mb-1">
                                            Bin ID: {bin.bin_id.substring(0, 8)}...
                                        </h3>
                                        {distanceText && (
                                            <p className="text-xs text-blue-600 font-semibold mb-1">
                                                📏 {distanceText}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-600">
                                            Owner: {bin.user_first_name} {bin.user_last_name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Contact: {bin.user_contact_number}
                                        </p>
                                        <p className={`text-xs font-semibold mt-1 ${bin.request_status === 'COLLECTED'
                                            ? 'text-green-600'
                                            : bin.request_status === 'CANCELLED'
                                                ? 'text-red-600'
                                                : 'text-orange-600'
                                            }`}>
                                            Status: {bin.request_status}
                                        </p>
                                        {/* Scan Button in Popup */}
                                        {(bin.request_status === 'PENDING' || bin.request_status === 'SCHEDULED') && onBinClick && (
                                            <button
                                                onClick={() => onBinClick(bin)}
                                                className="w-full mt-2 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors"
                                            >
                                                Scan QR Code
                                            </button>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Map Legend */}
            <div className="bg-white border rounded-lg px-4 py-3">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    {collectorLocation && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-gray-700">Your Location</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">Collected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span className="text-gray-700">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">Cancelled</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
/**
 * Navigation Service using OpenRouteService API
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles only navigation/routing API calls
 * - Open/Closed: Extensible for other routing providers
 * - Dependency Inversion: External modules depend on this abstraction
 * 
 * OpenRouteService: FREE routing API
 * - 2000 requests/day on free tier
 * - Turn-by-turn directions
 * - Multi-stop optimization
 * - Walking/driving modes
 * 
 * API Docs: https://openrouteservice.org/dev/#/api-docs
 */

export interface RoutePoint {
    latitude: number;
    longitude: number;
}

export interface RouteSegment {
    distance: number; // meters
    duration: number; // seconds
    instruction: string;
    type: number;
}

export interface NavigationRoute {
    coordinates: [number, number][]; // [lng, lat] format for Leaflet
    distance: number; // meters
    duration: number; // seconds
    segments: RouteSegment[];
    summary: {
        distance: string; // formatted: "2.5 km"
        duration: string; // formatted: "15 min"
    };
}

export type TravelMode = 'driving-car' | 'foot-walking' | 'cycling-regular';

/**
 * Navigation Service Class
 * Design Pattern: Service Layer + Singleton
 */
class NavigationService {
    private readonly baseUrl = 'https://api.openrouteservice.org/v2';
    private apiKey: string | null = null;

    constructor() {
        // Get API key from environment
        if (typeof window !== 'undefined') {
            this.apiKey = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY || null;
        }
    }

    /**
     * Check if navigation service is configured
     */
    isConfigured(): boolean {
        return !!this.apiKey;
    }

    /**
     * Calculate route between two points
     * 
     * @param start - Starting point (collector's location)
     * @param end - Destination point (bin location)
     * @param mode - Travel mode (driving, walking, cycling)
     * @returns NavigationRoute with coordinates and instructions
     */
    async calculateRoute(
        start: RoutePoint,
        end: RoutePoint,
        mode: TravelMode = 'driving-car'
    ): Promise<NavigationRoute> {
        if (!this.apiKey) {
            throw new Error('OpenRouteService API key not configured. Please add NEXT_PUBLIC_OPENROUTE_API_KEY to .env.local');
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/directions/${mode}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.apiKey,
                    },
                    body: JSON.stringify({
                        coordinates: [
                            [start.longitude, start.latitude],
                            [end.longitude, end.latitude],
                        ],
                        instructions: true,
                        language: 'en',
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `HTTP ${response.status}: Failed to calculate route`);
            }

            const data = await response.json();
            const route = data.routes[0];

            return {
                coordinates: route.geometry.coordinates,
                distance: route.summary.distance,
                duration: route.summary.duration,
                segments: route.segments[0].steps.map((step: any) => ({
                    distance: step.distance,
                    duration: step.duration,
                    instruction: step.instruction,
                    type: step.type,
                })),
                summary: {
                    distance: this.formatDistance(route.summary.distance),
                    duration: this.formatDuration(route.summary.duration),
                },
            };
        } catch (error) {
            console.error('Navigation Service Error:', error);
            throw error;
        }
    }

    /**
     * Calculate optimized route through multiple points
     * 
     * @param start - Starting point (collector's location)
     * @param waypoints - Array of bins to visit
     * @param mode - Travel mode
     * @returns Optimized route visiting all points
     */
    async calculateOptimizedRoute(
        start: RoutePoint,
        waypoints: RoutePoint[],
        mode: TravelMode = 'driving-car'
    ): Promise<NavigationRoute> {
        if (!this.apiKey) {
            throw new Error('OpenRouteService API key not configured');
        }

        try {
            // Build coordinates array: start + waypoints
            const coordinates = [
                [start.longitude, start.latitude],
                ...waypoints.map(wp => [wp.longitude, wp.latitude]),
            ];

            const response = await fetch(
                `${this.baseUrl}/directions/${mode}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.apiKey,
                    },
                    body: JSON.stringify({
                        coordinates,
                        instructions: true,
                        language: 'en',
                        preference: 'shortest', // or 'fastest'
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || 'Failed to calculate optimized route');
            }

            const data = await response.json();
            const route = data.routes[0];

            return {
                coordinates: route.geometry.coordinates,
                distance: route.summary.distance,
                duration: route.summary.duration,
                segments: route.segments[0].steps.map((step: any) => ({
                    distance: step.distance,
                    duration: step.duration,
                    instruction: step.instruction,
                    type: step.type,
                })),
                summary: {
                    distance: this.formatDistance(route.summary.distance),
                    duration: this.formatDuration(route.summary.duration),
                },
            };
        } catch (error) {
            console.error('Optimized Route Error:', error);
            throw error;
        }
    }

    /**
     * Calculate straight-line distance between two points
     * Uses Haversine formula
     * 
     * @param point1 - First point
     * @param point2 - Second point
     * @returns Distance in meters
     */
    calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (point1.latitude * Math.PI) / 180;
        const φ2 = (point2.latitude * Math.PI) / 180;
        const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
        const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Format distance for display
     */
    private formatDistance(meters: number): string {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    }

    /**
     * Format duration for display
     */
    private formatDuration(seconds: number): string {
        if (seconds < 60) {
            return `${Math.round(seconds)} sec`;
        }
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
}

// Singleton instance
export const navigationService = new NavigationService();

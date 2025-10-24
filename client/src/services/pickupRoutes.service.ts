import { PickupRoute, PickupStatus, BinDetails } from '@/types/pickup';

/**
 * Service class for pickup routes
 * SOLID: Single Responsibility - Handles only API communication for pickups
 * Design Pattern: Service Layer Pattern
 */
class PickupRoutesService {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
    }

    /**
     * Fetch all pickup routes for the authenticated collector
     * @returns Promise<PickupRoute[]>
     */
    async fetchPickupRoutes(): Promise<PickupRoute[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/collector/pickups`, {
                method: 'GET',
                credentials: 'include', // Important: Send cookies with request
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.ok) {
                throw new Error(result.message || 'Failed to fetch pickup routes');
            }

            return result.data || [];
        } catch (error) {
            console.error('Error fetching pickup routes:', error);
            throw error;
        }
    }

    /**
     * Update pickup order status
     * @param orderId - UUID of the pickup order
     * @param status - New status to set
     * @returns Promise with message and updated data
     */
    async updatePickupStatus(
        orderId: string,
        status: PickupStatus
    ): Promise<{ message: string; data: any }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/collector/pickups/${orderId}/status`,
                {
                    method: 'PATCH', // Backend expects PATCH, not PUT
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.ok) {
                throw new Error(result.message || 'Failed to update pickup status');
            }

            return {
                message: result.message,
                data: result.data,
            };
        } catch (error) {
            console.error('Error updating pickup status:', error);
            throw error;
        }
    }

    /**
     * Fetch detailed information for a specific pickup route
     * Including all bins with their locations and owner details
     * 
     * @param orderId - UUID of the pickup order
     * @returns Promise<BinDetails[]> Array of bin details with coordinates
     */
    async fetchRouteDetails(orderId: string): Promise<BinDetails[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/collector/pickups/${orderId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.ok) {
                throw new Error(result.message || 'Failed to fetch route details');
            }

            return result.data || [];
        } catch (error) {
            console.error('Error fetching route details:', error);
            throw error;
        }
    }
}

// Singleton instance
export const pickupRoutesService = new PickupRoutesService();

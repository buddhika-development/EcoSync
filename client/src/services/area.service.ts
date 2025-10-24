import { api } from "../lib/api";

export interface Area {
    area_id: string;
    area_name: string;
    collector_id: string | null;
    collector?: {
        user_first_name: string;
        user_last_name: string;
    };
}

export interface AreasResponse {
    ok: boolean;
    message: string;
    data: Area[];
}

export async function fetchAllAreas(): Promise<AreasResponse> {
    try {
        const response = await api('/api/areas', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch areas: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.ok) {
            throw new Error(data.message || 'Failed to fetch areas');
        }

        return {
            ok: true,
            message: data.message || 'Areas fetched successfully',
            data: data.data || []
        };
    } catch (error) {
        console.error('Error fetching areas:', error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : 'Failed to fetch areas',
            data: []
        };
    }
}
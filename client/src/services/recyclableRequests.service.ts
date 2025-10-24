// Service layer for recyclable requests management
// ✅ Single Responsibility: Handles only recyclable request API communication
// ✅ Dependency Inversion: Depends on api abstraction, not direct fetch
import { api } from '@/lib/api';
import type {
    RecyclableRequestsResponse,
    RecyclableRequestDetailResponse,
    UpdateRecyclableStatusPayload,
    UpdateRecyclableStatusResponse,
    RecyclableStatus,
    RecyclableType,
    RecyclableCategory,
} from '@/types/recyclable';

const RECYCLABLE_BASE_URL = '/api/recyclable/requests';

/**
 * Filter options for recyclable requests
 */
export interface RecyclableRequestFilters {
    status?: RecyclableStatus;
    type?: RecyclableType;
    category?: RecyclableCategory;
    search?: string;
}

/**
 * Fetch recyclable collection requests history with optional filters
 * @param filters - Optional filters for status, type, category, and search
 * @returns Promise with list of recyclable requests
 */
export async function fetchRecyclableRequestsHistory(
    filters?: RecyclableRequestFilters
): Promise<RecyclableRequestsResponse> {
    // Build query params based on filters
    const params = new URLSearchParams();

    if (filters?.status) {
        params.append('status', filters.status);
    }
    if (filters?.type) {
        params.append('type', filters.type);
    }
    if (filters?.category) {
        params.append('category', filters.category);
    }
    if (filters?.search) {
        params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = `${RECYCLABLE_BASE_URL}/history${queryString ? `?${queryString}` : ''}`;

    const response = await api(url, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch recyclable requests: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch all recyclable collection requests (for collectors)
 * @returns Promise with list of recyclable requests
 */
export async function fetchAllRecyclableRequests(): Promise<RecyclableRequestsResponse> {
    const response = await api(RECYCLABLE_BASE_URL, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch recyclable requests: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch details of a specific recyclable request
 * @param requestId - The recyclable request ID
 * @returns Promise with detailed request information
 */
export async function fetchRecyclableRequestDetails(requestId: string): Promise<RecyclableRequestDetailResponse> {
    const response = await api(`${RECYCLABLE_BASE_URL}/${requestId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch recyclable request details: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Update recyclable request status, category, and/or weight
 * @param requestId - The recyclable request ID
 * @param payload - Update data (status, category, weight)
 * @returns Promise with updated request details
 */
export async function updateRecyclableRequestStatus(
    requestId: string,
    payload: UpdateRecyclableStatusPayload
): Promise<UpdateRecyclableStatusResponse> {
    const response = await api(`${RECYCLABLE_BASE_URL}/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to update recyclable request status: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Create a new recyclable collection request
 * @param payload - Request data (user_id, area_id, type, category, weight)
 * @returns Promise with created request details
 */
export async function createRecyclableRequest(
    payload: import('@/types/recyclable').CreateRecyclableRequestPayload
): Promise<import('@/types/recyclable').CreateRecyclableRequestResponse> {
    const response = await api('/api/recyclable/create', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to create recyclable request: ${response.statusText}`);
    }

    return response.json();
}

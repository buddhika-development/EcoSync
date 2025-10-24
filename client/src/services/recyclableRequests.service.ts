// Service layer for recyclable requests management
import { api } from '@/lib/api';
import type {
    RecyclableRequestsResponse,
    RecyclableRequestDetailResponse,
    UpdateRecyclableStatusPayload,
    UpdateRecyclableStatusResponse,
} from '@/types/recyclable';

const RECYCLABLE_BASE_URL = '/api/recyclable/requests';

/**
 * Fetch all recyclable collection requests
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

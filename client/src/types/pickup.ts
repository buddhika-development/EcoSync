/**
 * Type definitions for pickup routes
 * SOLID: Interface Segregation - Clear type contracts
 */

export interface PickupRoute {
    order_id: string;
    area_id: string;
    area_name: string;
    collector_id: string;
    status: PickupStatus;
    scheduled_date: string;
    created_at: string;
    updated_at: string;
    task_count: number;
    pending_task_count: number;
    is_overdue: boolean;
}

export type PickupStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface PickupRoutesResponse {
    ok: boolean;
    message: string;
    data: PickupRoute[];
}

export interface RouteFilters {
    status: PickupStatus | 'ALL';
    searchQuery: string;
    sortBy: 'date' | 'area' | 'bins';
}

/**
 * Bin request status from full_bin_requests table
 * - PENDING: Bin is full, waiting to be scheduled
 * - SCHEDULED: Bin assigned to a route, ready for collection
 * - COLLECTED: Bin successfully collected by collector
 * - CANCELLED: Collection request was cancelled
 */
export type BinRequestStatus = 'PENDING' | 'SCHEDULED' | 'COLLECTED' | 'CANCELLED';

/**
 * Detailed bin information for a pickup route
 */
export interface BinDetails {
    order_id: string;
    area_id: string;
    area_name: string;
    scheduled_date: string;
    task_id: string;
    cleared_at: string | null;
    full_bin_id: string;
    request_status: BinRequestStatus;
    bin_id: string;
    latitude: number;
    longitude: number;
    qr_code_link: string;
    owner_user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_contact_number: string;
}

/**
 * Route details response with all bins
 */
export interface RouteDetailsResponse {
    ok: boolean;
    message: string;
    data: BinDetails[];
}

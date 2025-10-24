// Types for recyclable requests management

export type RecyclableStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type RecyclableCategory = 'plastic-waste' | 'paper-waste' | 'metal-waste' | 'e-waste';
export type RecyclableType = 'PICKUP' | 'DROP-OFF';

export interface RecyclableRequestUser {
    user_first_name: string;
    user_last_name: string;
    user_email_address: string;
    user_contact_number: string;
}

export interface RecyclableRequestArea {
    area_name: string;
    collector_id: string;
}

export interface RecyclableRequest {
    recyclable_collect_request_id: string;
    user_id: string;
    area_id: string;
    status: RecyclableStatus;
    type: RecyclableType;
    category: RecyclableCategory;
    weight: number;
    created_at: string;
    updated_at: string;
    users: RecyclableRequestUser;
}

export interface RecyclableRequestDetail extends RecyclableRequest {
    area: RecyclableRequestArea;
}

export interface UpdateRecyclableStatusPayload {
    status: RecyclableStatus;
    category?: RecyclableCategory;
    weight?: number;
}

export interface RecyclableRequestsResponse {
    ok: boolean;
    message: string;
    data: RecyclableRequest[];
}

export interface RecyclableRequestDetailResponse {
    ok: boolean;
    message: string;
    data: RecyclableRequestDetail;
}

export interface UpdateRecyclableStatusResponse {
    ok: boolean;
    message: string;
    data: RecyclableRequestDetail;
}

// Helper constants for UI
export const RECYCLABLE_STATUS_LABELS: Record<RecyclableStatus, string> = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

export const RECYCLABLE_STATUS_COLORS: Record<RecyclableStatus, { bg: string; text: string; border: string }> = {
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export const RECYCLABLE_CATEGORY_LABELS: Record<RecyclableCategory, string> = {
    'plastic-waste': 'Plastic Waste',
    'paper-waste': 'Paper Waste',
    'metal-waste': 'Metal Waste',
    'e-waste': 'E-Waste',
};

export const RECYCLABLE_CATEGORY_ICONS: Record<RecyclableCategory, string> = {
    'plastic-waste': '♻️',
    'paper-waste': '📄',
    'metal-waste': '🔩',
    'e-waste': '💻',
};

export const RECYCLABLE_TYPE_LABELS: Record<RecyclableType, string> = {
    PICKUP: 'Pickup',
    'DROP-OFF': 'Drop-off',
};

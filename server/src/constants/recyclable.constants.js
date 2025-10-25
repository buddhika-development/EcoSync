export const RECYCLABLE_ERRORS = {
    INVALID_ID: 'Invalid recyclable request ID',
    NOT_FOUND: 'Recyclable request not found',
    UNAUTHORIZED: 'You are not authorized to access this request',
    VALIDATION_ERROR: 'Validation error',
    DATABASE_ERROR: 'Database operation failed',
    FETCH_FAILED: 'Unable to fetch recyclable requests at this time',
    UPDATE_FAILED: 'Unable to update recyclable request',
    ALREADY_COLLECTED: 'This recyclable request has already been collected',
    ALREADY_CANCELLED: 'This recyclable request has already been cancelled',
    ALREADY_CLAIMED: 'This recyclable request has already been claimed',
};

export const RECYCLABLE_SUCCESS = {
    REQUESTS_FETCHED: 'Recyclable requests fetched successfully',
    REQUEST_FETCHED: 'Recyclable request details fetched successfully',
    REQUEST_UPDATED: 'Recyclable request updated successfully',
    REQUEST_CLAIMED: 'Recyclable request claimed successfully',
    ALREADY_UPDATED: 'Request was already updated to the requested value',
};

export const RECYCLABLE_STATUS = {
    PENDING: 'PENDING',
    CLAIMED: 'CLAIMED',
    COLLECTED: 'COLLECTED',
    CANCELLED: 'CANCELLED',
};

export const RECYCLABLE_CATEGORY = {
    PLASTIC: 'PLASTIC',
    PAPER: 'PAPER',
    METAL: 'METAL',
    GLASS: 'GLASS',
    ELECTRONIC: 'ELECTRONIC',
    OTHER: 'OTHER',
};

export const RECYCLABLE_TYPE = {
    PICKUP: 'PICKUP',
    DROPOFF: 'DROPOFF',
};

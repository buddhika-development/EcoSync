// Collector-related constants to avoid magic strings
export const COLLECTOR_ERRORS = {
    INVALID_ID: 'Invalid collector ID',
    NOT_FOUND: 'Collector not found',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    CREATION_FAILED: 'Pickup route creation failed',
    VALIDATION_ERROR: 'Validation error',
    DATABASE_ERROR: 'Database operation failed',
    FETCH_FAILED: 'Unable to fetch data at this time',
    INCOMPLETE_BINS: 'Cannot complete pickup order. Some bins are not yet collected or cancelled',
    ALREADY_COMPLETED: 'This pickup order has already been marked as completed',
    ALREADY_CANCELLED: 'This pickup order has already been cancelled',
    ALREADY_IN_PROGRESS: 'This pickup order is already in progress',
    BIN_ALREADY_COLLECTED: 'This bin has already been marked as collected',
    BIN_ALREADY_CANCELLED: 'This bin has already been marked as cancelled',
    NO_PENDING_TASKS: 'No pending bins found for this pickup order',
};

export const COLLECTOR_SUCCESS = {
    PICKUPS_FETCHED: 'Pickup routes fetched successfully',
    PICKUP_FETCHED: 'Pickup route details fetched successfully',
    STATUS_UPDATED: 'Status updated successfully',
    BIN_STATUS_UPDATED: 'Bin status updated successfully',
    ALREADY_UPDATED: 'Status was already updated to the requested value',
};

export const PICKUP_STATUS = {
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

export const BIN_STATUS = {
    EMPTY: 'EMPTY',
    PARTIAL: 'PARTIAL',
    FULL: 'FULL',
    UNAVAILABLE: 'UNAVAILABLE',
};

export const FULL_BIN_STATUS = {
    COLLECTED: 'COLLECTED',
    CANCELLED: 'CANCELLED',
};

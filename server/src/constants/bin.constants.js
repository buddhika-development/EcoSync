// Bin-related constants to avoid magic strings (Code Smell Prevention)
export const BIN_QR_SCHEME = 'ecosync://bin/';
export const DEFAULT_BIN_STATUS = 'EMPTY';

export const BIN_ERRORS = {
    CREATION_FAILED: 'Bin creation failed',
    VALIDATION_ERROR: 'Validation error',
    DATABASE_ERROR: 'Database operation failed',
    NOT_FOUND: 'No bins found for this user',
};

export const BIN_SUCCESS = {
    CREATED: 'Bin created successfully',
    FETCHED: 'Bins fetched successfully',
};

// Bin-related constants to avoid magic strings (Code Smell Prevention)
export const BIN_QR_SCHEME = 'ecosync://bin/';
export const DEFAULT_BIN_STATUS = 'EMPTY';

export const BIN_ERRORS = {
    CREATION_FAILED: 'Bin creation failed',
    VALIDATION_ERROR: 'Validation error',
    DATABASE_ERROR: 'Database operation failed',
    NOT_FOUND: 'Bin not found',
    INVALID_QR_CODE: 'Invalid QR code',
    QR_BIN_MISMATCH: 'QR code does not match the bin ID',
    QR_VALIDATION_FAILED: 'QR code validation failed',
    UNAUTHORIZED_ACCESS: 'You are not authorized to update this bin',
};

export const BIN_SUCCESS = {
    CREATED: 'Bin created successfully',
    QR_VALIDATED: 'QR code validated successfully',
};

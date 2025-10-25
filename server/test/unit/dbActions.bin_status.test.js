import { jest } from '@jest/globals';

// Mock Supabase client
const mockSupabaseClient = {
    from: jest.fn()
};

jest.unstable_mockModule('../../libs/supabase/supabase_client.js', () => ({
    default: mockSupabaseClient
}));

// Import dbActions after mocking
const { 
    access_all_bin_detials,
    access_bin_details_with_status_filter_by_id,
    update_waste_collection_request_payment_status
} = await import('../../src/dbActions/bin_status.db.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';


// ============================================================================
// TEST SUITE 1: access_all_bin_detials
// ============================================================================
describe('bin_status.db.js - access_all_bin_detials', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully fetch all bin details
    test('should successfully fetch all bin details', async () => {
        // Arrange
        const mockBinStatusData = [
            { full_bin_id: 'fb-1', bin_id: 'bin-1', payment_status: 'PENDING' },
            { full_bin_id: 'fb-2', bin_id: 'bin-2', payment_status: 'PAID' }
        ];

        const mockSelect = jest.fn().mockResolvedValue({ 
            data: mockBinStatusData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect
        });

        // Act
        const result = await access_all_bin_detials();

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('full_bin_status');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(result.message).toBe('Successfully accessed all bin details');
        expect(result.data).toEqual(mockBinStatusData);
    });

    // TEST 2: Handle database error
    test('should handle database error when fetching all bin details', async () => {
        // Arrange
        const dbError = { message: 'Table not found' };

        const mockSelect = jest.fn().mockResolvedValue({ 
            data: null, 
            error: dbError 
        });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect
        });

        // Act
        const result = await access_all_bin_detials();

        // Assert
        expect(result.message).toBe('Failed to access all bin details');
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Network error');
        });

        // Act
        const result = await access_all_bin_detials();

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error).toBeDefined();
    });
});


// ============================================================================
// TEST SUITE 2: access_bin_details_with_status_filter_by_id
// ============================================================================
describe('bin_status.db.js - access_bin_details_with_status_filter_by_id', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully fetch bin details with status filter
    test('should successfully fetch bin details with status filter', async () => {
        // Arrange
        const status = 'PENDING';
        const binId = 'bin-123';
        const mockData = [
            { full_bin_id: 'fb-1', bin_id: binId, payment_status: status }
        ];

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq1 = jest.fn().mockReturnThis();
        const mockEq2 = jest.fn().mockResolvedValue({ data: mockData, error: null });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect
        });
        mockSelect.mockReturnValue({ eq: mockEq1 });
        mockEq1.mockReturnValue({ eq: mockEq2 });

        // Act
        const result = await access_bin_details_with_status_filter_by_id(status, binId);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('full_bin_status');
        expect(mockEq1).toHaveBeenCalledWith('payment_status', status);
        expect(mockEq2).toHaveBeenCalledWith('bin_id', binId);
        expect(result.message).toBe(`Successfully accessed bin details with status: ${status}`);
        expect(result.data).toEqual(mockData);
    });

    // TEST 2: Handle database error
    test('should handle database error when filtering by status', async () => {
        // Arrange
        const status = 'PAID';
        const binId = 'bin-123';
        const dbError = { message: 'Invalid filter' };

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq1 = jest.fn().mockReturnThis();
        const mockEq2 = jest.fn().mockResolvedValue({ data: null, error: dbError });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect
        });
        mockSelect.mockReturnValue({ eq: mockEq1 });
        mockEq1.mockReturnValue({ eq: mockEq2 });

        // Act
        const result = await access_bin_details_with_status_filter_by_id(status, binId);

        // Assert
        expect(result.message).toBe(`Failed to access bin details with status: ${status}`);
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const status = 'PENDING';
        const binId = 'bin-123';
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Connection error');
        });

        // Act
        const result = await access_bin_details_with_status_filter_by_id(status, binId);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error).toBeDefined();
    });
});


// ============================================================================
// TEST SUITE 3: update_waste_collection_request_payment_status
// ============================================================================
describe('bin_status.db.js - update_waste_collection_request_payment_status', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully update payment status
    test('should successfully update payment status', async () => {
        // Arrange
        const status = 'PAID';
        const binId = 'fb-123';
        const mockUpdatedData = [
            { full_bin_id: binId, payment_status: status }
        ];

        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockResolvedValue({ 
            data: mockUpdatedData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            update: mockUpdate
        });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect });

        // Act
        const result = await update_waste_collection_request_payment_status(status, binId);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('full_bin_status');
        expect(mockUpdate).toHaveBeenCalledWith({ payment_status: status });
        expect(mockEq).toHaveBeenCalledWith('full_bin_id', binId);
        expect(result.message).toBe(`Successfully accessed bin details with status: ${status}`);
        expect(result.data).toEqual(mockUpdatedData);
    });

    // TEST 2: Handle update error
    test('should handle error when updating payment status', async () => {
        // Arrange
        const status = 'PAID';
        const binId = 'fb-123';
        const dbError = { message: 'Update failed' };

        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockResolvedValue({ 
            data: null, 
            error: dbError 
        });

        mockSupabaseClient.from.mockReturnValue({
            update: mockUpdate
        });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect });

        // Act
        const result = await update_waste_collection_request_payment_status(status, binId);

        // Assert
        expect(result.message).toBe(`Failed to access bin details with status: ${status}`);
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const status = 'PAID';
        const binId = 'fb-123';
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Network timeout');
        });

        // Act
        const result = await update_waste_collection_request_payment_status(status, binId);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error).toBeDefined();
    });
});

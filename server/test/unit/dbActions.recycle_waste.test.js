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
    access_user_recycle_collect_requests_filter_by_status,
    update_recycle_collect_request_payment_status
} = await import('../../src/dbActions/recycle_waste.db.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';


// ============================================================================
// TEST SUITE 1: access_user_recycle_collect_requests_filter_by_status
// ============================================================================
describe('recycle_waste.db.js - access_user_recycle_collect_requests_filter_by_status', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully fetch recycle collect requests
    test('should successfully fetch recycle collect requests by status', async () => {
        // Arrange
        const userId = 'user-123';
        const status = 'PENDING';
        const mockRequests = [
            { recyclable_collect_request_id: 'req-1', user_id: userId, payment_status: status },
            { recyclable_collect_request_id: 'req-2', user_id: userId, payment_status: status }
        ];

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq1 = jest.fn().mockReturnThis();
        const mockEq2 = jest.fn().mockResolvedValue({ 
            data: mockRequests, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect
        });
        mockSelect.mockReturnValue({ eq: mockEq1 });
        mockEq1.mockReturnValue({ eq: mockEq2 });

        // Act
        const result = await access_user_recycle_collect_requests_filter_by_status(userId, status);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('recyclable_collect_request');
        expect(mockEq1).toHaveBeenCalledWith('payment_status', status);
        expect(mockEq2).toHaveBeenCalledWith('user_id', userId);
        expect(result.message).toBe(`Successfully accessed recycle collect requests with status: ${status}`);
        expect(result.data).toEqual(mockRequests);
    });

    // TEST 2: Handle database error
    test('should handle error when fetching recycle requests', async () => {
        // Arrange
        const userId = 'user-123';
        const status = 'PAID';
        const dbError = { message: 'Query failed' };

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq1 = jest.fn().mockReturnThis();
        const mockEq2 = jest.fn().mockResolvedValue({ 
            data: null, 
            error: dbError 
        });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect
        });
        mockSelect.mockReturnValue({ eq: mockEq1 });
        mockEq1.mockReturnValue({ eq: mockEq2 });

        // Act
        const result = await access_user_recycle_collect_requests_filter_by_status(userId, status);

        // Assert
        expect(result.message).toBe(`Failed to access recycle collect requests with status: ${status}`);
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const userId = 'user-123';
        const status = 'PENDING';
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Network error');
        });

        // Act
        const result = await access_user_recycle_collect_requests_filter_by_status(userId, status);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error).toBeDefined();
    });
});


// ============================================================================
// TEST SUITE 2: update_recycle_collect_request_payment_status
// ============================================================================
describe('recycle_waste.db.js - update_recycle_collect_request_payment_status', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully update payment status
    test('should successfully update recycle collect request payment status', async () => {
        // Arrange
        const requestId = 'req-123';
        const newStatus = 'PAID';
        const mockUpdatedData = [
            { recyclable_collect_request_id: requestId, payment_status: newStatus }
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
        const result = await update_recycle_collect_request_payment_status(requestId, newStatus);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('recyclable_collect_request');
        expect(mockUpdate).toHaveBeenCalledWith({ payment_status: newStatus });
        expect(mockEq).toHaveBeenCalledWith('recyclable_collect_request_id', requestId);
        expect(result.message).toBe(`Successfully updated recycle collect request payment status to: ${newStatus}`);
        expect(result.data).toEqual(mockUpdatedData);
    });

    // TEST 2: Handle update error
    test('should handle error when updating payment status', async () => {
        // Arrange
        const requestId = 'req-123';
        const newStatus = 'PAID';
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
        const result = await update_recycle_collect_request_payment_status(requestId, newStatus);

        // Assert
        expect(result.message).toBe(`Failed to update recycle collect request payment status to: ${newStatus}`);
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const requestId = 'req-123';
        const newStatus = 'PAID';
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Connection timeout');
        });

        // Act
        const result = await update_recycle_collect_request_payment_status(requestId, newStatus);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error).toBeDefined();
    });
});

import { jest } from '@jest/globals';

// Mock Supabase client
const mockSupabaseClient = {
    from: jest.fn()
};

jest.unstable_mockModule('../../libs/supabase/supabase_client.js', () => ({
    default: mockSupabaseClient
}));

// Import dbActions after mocking
const { access_bin_details_with_user_filter } = await import('../../src/dbActions/bin.db.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';


// ============================================================================
// TEST SUITE: bin.db.js - access_bin_details_with_user_filter
// ============================================================================
describe('bin.db.js - access_bin_details_with_user_filter', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully fetch bin details by user_id
    test('should successfully fetch bin details for a user', async () => {
        // Arrange
        const userId = 'user-123';
        const mockBinData = [
            { bin_id: 'bin-1', user_id: userId, latitude: 6.9271, longitude: 79.8612 },
            { bin_id: 'bin-2', user_id: userId, latitude: 6.9280, longitude: 79.8620 }
        ];

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockResolvedValue({ data: mockBinData, error: null });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect,
        });
        mockSelect.mockReturnValue({
            eq: mockEq
        });

        // Act
        const result = await access_bin_details_with_user_filter(userId);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('bins');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockEq).toHaveBeenCalledWith('user_id', userId);
        expect(result.message).toBe('Successfully accessed bin details');
        expect(result.data).toEqual(mockBinData);
    });

    // TEST 2: Handle database error
    test('should handle database error when fetching bin details', async () => {
        // Arrange
        const userId = 'user-123';
        const dbError = { message: 'Database connection failed' };

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockResolvedValue({ data: null, error: dbError });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect,
        });
        mockSelect.mockReturnValue({
            eq: mockEq
        });

        // Act
        const result = await access_bin_details_with_user_filter(userId);

        // Assert
        expect(result.message).toBe('Failed to access the bin details');
        expect(result.error.message).toBe('Failed to access the bin details');
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception in try-catch
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const userId = 'user-123';
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Connection timeout');
        });

        // Act
        const result = await access_bin_details_with_user_filter(userId);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error.message).toBe('SOmething went wrong in supabase connection.');
        expect(result.error.details).toBeDefined();
    });
});

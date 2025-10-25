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
    insert_new_recycle_coin_user,
    update_recycle_coin_balance,
    acces_single_recycle_coin
} = await import('../../src/dbActions/recycle_coin.db.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';


// ============================================================================
// TEST SUITE 1: insert_new_recycle_coin_user
// ============================================================================
describe('recycle_coin.db.js - insert_new_recycle_coin_user', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully insert new recycle coin user
    test('should successfully insert new recycle coin user', async () => {
        // Arrange
        const userId = 'user-123';
        const mockInsertedData = { 
            recycle_coin_user: userId, 
            recycle_coin_balance: 0 
        };

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: mockInsertedData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            insert: mockInsert
        });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        // Act
        const result = await insert_new_recycle_coin_user(userId);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('recycle_coin');
        expect(mockInsert).toHaveBeenCalledWith([{ recycle_coin_user: userId }]);
        expect(result.message).toBe('Sucessfully insert new recycle coin user');
        expect(result.data).toEqual(mockInsertedData);
    });

    // TEST 2: Handle insert error
    test('should handle error when inserting new user', async () => {
        // Arrange
        const userId = 'user-123';
        const dbError = { message: 'Duplicate key' };

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: null, 
            error: dbError 
        });

        mockSupabaseClient.from.mockReturnValue({
            insert: mockInsert
        });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        // Act
        const result = await insert_new_recycle_coin_user(userId);

        // Assert
        expect(result.message).toBe('Failed to insert new recycle coin user');
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const userId = 'user-123';
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Connection error');
        });

        // Act
        const result = await insert_new_recycle_coin_user(userId);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error).toBeDefined();
    });
});


// ============================================================================
// TEST SUITE 2: update_recycle_coin_balance
// ============================================================================
describe('recycle_coin.db.js - update_recycle_coin_balance', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully update coin balance
    test('should successfully update recycle coin balance', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = 500;
        const mockUpdatedData = { 
            recycle_coin_user: userId, 
            recycle_coin_balance: amount 
        };

        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: mockUpdatedData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            update: mockUpdate
        });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        // Act
        const result = await update_recycle_coin_balance(userId, amount);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('recycle_coin');
        expect(mockUpdate).toHaveBeenCalledWith({ recycle_coin_balance: amount });
        expect(mockEq).toHaveBeenCalledWith('recycle_coin_user', userId);
        expect(result.message).toBe('Successfully updated recycle coin balance');
        expect(result.data).toEqual(mockUpdatedData);
    });

    // TEST 2: Handle update error
    test('should handle error when updating balance', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = 500;
        const dbError = { message: 'User not found' };

        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: null, 
            error: dbError 
        });

        mockSupabaseClient.from.mockReturnValue({
            update: mockUpdate
        });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        // Act
        const result = await update_recycle_coin_balance(userId, amount);

        // Assert
        expect(result.message).toBe('Failed to update recycle coin balance');
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = 500;
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Database timeout');
        });

        // Act
        const result = await update_recycle_coin_balance(userId, amount);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error).toBeDefined();
    });
});


// ============================================================================
// TEST SUITE 3: acces_single_recycle_coin
// ============================================================================
describe('recycle_coin.db.js - acces_single_recycle_coin', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully fetch single coin details
    test('should successfully fetch single recycle coin details', async () => {
        // Arrange
        const userId = 'user-123';
        const mockCoinData = { 
            recycle_coin_user: userId, 
            recycle_coin_balance: 1000 
        };

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect2 = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: mockCoinData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect
        });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect2 });
        mockSelect2.mockReturnValue({ single: mockSingle });

        // Act
        const result = await acces_single_recycle_coin(userId);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('recycle_coin');
        expect(mockEq).toHaveBeenCalledWith('recycle_coin_user', userId);
        expect(result.message).toBe('Successfully accessed the single coin details');
        expect(result.data).toEqual(mockCoinData);
    });

    // TEST 2: Handle fetch error
    test('should handle error when fetching coin details', async () => {
        // Arrange
        const userId = 'user-123';
        const dbError = { message: 'Not found' };

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect2 = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: null, 
            error: dbError 
        });

        mockSupabaseClient.from.mockReturnValue({
            select: mockSelect
        });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect2 });
        mockSelect2.mockReturnValue({ single: mockSingle });

        // Act
        const result = await acces_single_recycle_coin(userId);

        // Assert
        expect(result.message).toBe('Failed to access the single recycle coin details');
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const userId = 'user-123';
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Connection lost');
        });

        // Act
        const result = await acces_single_recycle_coin(userId);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection');
        expect(result.error).toBeDefined();
    });
});

import { jest } from '@jest/globals';

// Mock Supabase client
const mockSupabaseClient = {
    from: jest.fn()
};

jest.unstable_mockModule('../../libs/supabase/supabase_client.js', () => ({
    default: mockSupabaseClient
}));

// Import dbActions after mocking
const { _insert_transaction } = await import('../../src/dbActions/transaction.db.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';


// ============================================================================
// TEST SUITE: transaction.db.js - _insert_transaction
// ============================================================================
describe('transaction.db.js - _insert_transaction', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successfully insert transaction
    test('should successfully insert new transaction', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = 1500;
        const mockTransactionData = {
            transaction_id: 'txn-456',
            user_id: userId,
            transaction_amount: amount,
            created_at: '2025-01-15T10:00:00Z'
        };

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: mockTransactionData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            insert: mockInsert
        });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        // Act
        const result = await _insert_transaction(userId, amount);

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
        expect(mockInsert).toHaveBeenCalledWith([{
            user_id: userId,
            transaction_amount: amount
        }]);
        expect(result.message).toBe('Successfully inserted new transaction.');
        expect(result.data).toEqual(mockTransactionData);
    });

    // TEST 2: Handle insert error
    test('should handle error when inserting transaction', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = 1500;
        const dbError = { message: 'Foreign key constraint failed' };

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
        const result = await _insert_transaction(userId, amount);

        // Assert
        expect(result.message).toBe('Failed to insert new transaction.');
        expect(result.error.details).toEqual(dbError);
    });

    // TEST 3: Handle exception
    test('should handle exception in supabase connection', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = 1500;
        mockSupabaseClient.from.mockImplementation(() => {
            throw new Error('Network timeout');
        });

        // Act
        const result = await _insert_transaction(userId, amount);

        // Assert
        expect(result.message).toBe('Something went wrong in supabase connection.');
        expect(result.error).toBeDefined();
    });

    // TEST 4: Test with zero amount
    test('should insert transaction with zero amount', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = 0;
        const mockTransactionData = {
            transaction_id: 'txn-789',
            user_id: userId,
            transaction_amount: amount
        };

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: mockTransactionData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            insert: mockInsert
        });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        // Act
        const result = await _insert_transaction(userId, amount);

        // Assert
        expect(result.message).toBe('Successfully inserted new transaction.');
        expect(result.data.transaction_amount).toBe(0);
    });

    // TEST 5: Test with negative amount (refund)
    test('should insert transaction with negative amount (refund)', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = -500;
        const mockTransactionData = {
            transaction_id: 'txn-999',
            user_id: userId,
            transaction_amount: amount
        };

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: mockTransactionData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            insert: mockInsert
        });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        // Act
        const result = await _insert_transaction(userId, amount);

        // Assert
        expect(result.message).toBe('Successfully inserted new transaction.');
        expect(result.data.transaction_amount).toBe(-500);
    });

    // TEST 6: Test with large amount
    test('should insert transaction with large amount', async () => {
        // Arrange
        const userId = 'user-123';
        const amount = 999999.99;
        const mockTransactionData = {
            transaction_id: 'txn-large',
            user_id: userId,
            transaction_amount: amount
        };

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ 
            data: mockTransactionData, 
            error: null 
        });

        mockSupabaseClient.from.mockReturnValue({
            insert: mockInsert
        });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        // Act
        const result = await _insert_transaction(userId, amount);

        // Assert
        expect(result.message).toBe('Successfully inserted new transaction.');
        expect(result.data.transaction_amount).toBe(999999.99);
    });
});

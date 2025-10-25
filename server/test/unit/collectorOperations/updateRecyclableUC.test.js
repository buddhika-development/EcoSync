//9
import { jest } from '@jest/globals';


jest.unstable_mockModule('../../../src/repositories/collectorRepository/collectorRepo.js', () => ({
    getRecyclableRequestById: jest.fn(),
    updateRecyclableRequest: jest.fn()
}));


jest.unstable_mockModule('../../../src/functions/_calculate_recycle_coin.js', () => ({
    _calculate_waste_recycle_coin: jest.fn()
}));


global.fetch = jest.fn();


const { getRecyclableRequestById, updateRecyclableRequest } = await import('../../../src/repositories/collectorRepository/collectorRepo.js');
const { _calculate_waste_recycle_coin } = await import('../../../src/functions/_calculate_recycle_coin.js');
const updateRecyclableUC = (await import('../../../src/usecase/recyclableUsecase/updateRecyclableUC.js')).default;

describe('updateRecyclableUC', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // positive
    test('should successfully update recyclable request to COMPLETED status', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const updates = {
            status: 'COMPLETED',
            category: 'plastic-waste',
            weight: 5.5
        };

        const mockExistingRequest = {
            recyclable_collect_request_id: requestId,
            user_id: 'user-001',
            area_id: 'area-001',
            status: 'PENDING',
            type: 'PICKUP',
            category: 'plastic-waste',
            weight: 5.0,
            created_at: '2025-10-24T10:00:00.000Z',
            updated_at: '2025-10-24T10:00:00.000Z',
            area: {
                area_id: 'area-001',
                area_name: 'Colombo 07',
                collector_id: collectorId
            }
        };

        const mockUpdatedRequest = {
            ...mockExistingRequest,
            status: 'COMPLETED',
            weight: 5.5,
            updated_at: '2025-10-25T14:30:00.000Z'
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockExistingRequest, error: null });
        updateRecyclableRequest.mockResolvedValue({ data: mockUpdatedRequest, error: null });
        _calculate_waste_recycle_coin.mockResolvedValue(55);

        //recycle coin api mock
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, balance: 155 })
        });

        // Act
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data.id).toBe(requestId);
        expect(result.data.status).toBe('COMPLETED');
        expect(result.data.weight).toBe(5.5);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
        expect(updateRecyclableRequest).toHaveBeenCalledTimes(1);
        expect(updateRecyclableRequest).toHaveBeenCalledWith(requestId, updates);
    });

    // negative
    test('should return error for invalid request ID format', async () => {
        // Arrange
        const invalidRequestId = 'invalid-uuid';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const updates = { status: 'COMPLETED' };

        // Act
        const result = await updateRecyclableUC(invalidRequestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/invalid.*id/i);

        expect(getRecyclableRequestById).not.toHaveBeenCalled();
        expect(updateRecyclableRequest).not.toHaveBeenCalled();
    });

    // negative
    test('should return error for invalid status value', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const updates = { status: 'INVALID_STATUS' };

        // Act
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(422);
        expect(result.message).toMatch(/validation.*error/i);
        expect(result.errors).toBeDefined();

        expect(getRecyclableRequestById).not.toHaveBeenCalled();
        expect(updateRecyclableRequest).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when recyclable request does not exist', async () => {
        // Arrange
        const requestId = '99999999-0000-0000-0000-000000000000';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const updates = { status: 'COMPLETED', weight: 5.0 }; // Valid updates

        getRecyclableRequestById.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toMatch(/not found/i);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
        expect(updateRecyclableRequest).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when collector is not authorized for this request', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const differentCollectorId = '11111111-2222-3333-4444-555555555555';
        const updates = { status: 'COMPLETED', weight: 3.0 }; // Valid updates

        const mockExistingRequest = {
            recyclable_collect_request_id: requestId,
            status: 'PENDING',
            area: {
                area_id: 'area-001',
                collector_id: differentCollectorId // Different collector
            }
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockExistingRequest, error: null });

        // Act
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(403);
        expect(result.message).toMatch(/unauthorized|not authorized/i);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
        expect(updateRecyclableRequest).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when database fails to update request', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const updates = { status: 'COMPLETED', weight: 4.0 }; // Valid updates

        const mockExistingRequest = {
            recyclable_collect_request_id: requestId,
            status: 'PENDING',
            area: {
                collector_id: collectorId
            }
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockExistingRequest, error: null });
        updateRecyclableRequest.mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
        });

        // Act
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toMatch(/update.*failed|unable.*update|error/i);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
        expect(updateRecyclableRequest).toHaveBeenCalledTimes(1);
    });

    // edge case
    test('should handle idempotent update when request is already COMPLETED', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const updates = { status: 'COMPLETED', weight: 5.5 };

        const mockExistingRequest = {
            recyclable_collect_request_id: requestId,
            user_id: 'user-001',
            area_id: 'area-001',
            status: 'COMPLETED',
            type: 'PICKUP',
            category: 'plastic-waste',
            weight: 5.5,
            created_at: '2025-10-24T10:00:00.000Z',
            updated_at: '2025-10-24T14:30:00.000Z',
            users: { name: 'Test User' },
            area: {
                collector_id: collectorId
            }
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockExistingRequest, error: null });

        // Act
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.message).toMatch(/already/i);
        expect(result.data).toBeDefined();
        expect(result.data.status).toBe('COMPLETED');

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
        expect(updateRecyclableRequest).not.toHaveBeenCalled();
    });

    // edge case
    test('should successfully update request status to CANCELLED', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const updates = { status: 'CANCELLED' };

        const mockExistingRequest = {
            recyclable_collect_request_id: requestId,
            user_id: 'user-001',
            status: 'PENDING',
            area: {
                collector_id: collectorId
            }
        };

        const mockUpdatedRequest = {
            ...mockExistingRequest,
            status: 'CANCELLED',
            updated_at: '2025-10-25T15:00:00.000Z'
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockExistingRequest, error: null });
        updateRecyclableRequest.mockResolvedValue({ data: mockUpdatedRequest, error: null });

        // Act
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data.status).toBe('CANCELLED');

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
        expect(updateRecyclableRequest).toHaveBeenCalledTimes(1);
    });

    // edge case
    test('should successfully update request when area is null', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const updates = { status: 'COMPLETED', weight: 3.5 };

        const mockExistingRequest = {
            recyclable_collect_request_id: requestId,
            user_id: 'user-001',
            status: 'PENDING',
            category: 'paper-waste',
            weight: 3.0,
            area: null
        };

        const mockUpdatedRequest = {
            ...mockExistingRequest,
            status: 'COMPLETED',
            weight: 3.5,
            updated_at: '2025-10-25T15:00:00.000Z'
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockExistingRequest, error: null });
        updateRecyclableRequest.mockResolvedValue({ data: mockUpdatedRequest, error: null });
        _calculate_waste_recycle_coin.mockResolvedValue(35);

        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        });

        // Act
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.status).toBe('COMPLETED');

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
        expect(updateRecyclableRequest).toHaveBeenCalledTimes(1);
    });
});

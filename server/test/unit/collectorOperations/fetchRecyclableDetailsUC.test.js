//7
import { jest } from '@jest/globals';


jest.unstable_mockModule('../../src/repositories/collectorRepository/collectorRepo.js', () => ({
    getRecyclableRequestById: jest.fn()
}));


const { getRecyclableRequestById } = await import('../../../src/repositories/collectorRepository/collectorRepo.js');
const fetchRecyclableDetailsUC = (await import('../../../src/usecase/recyclableUsecase/fetchRecyclableDetailsUC.js')).default;

describe('fetchRecyclableDetailsUC', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // positive
    test('should successfully fetch recyclable request details for valid request ID', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';

        const mockRequest = {
            recyclable_collect_request_id: requestId,
            user_id: 'user-001',
            area_id: 'area-001',
            collector_id: collectorId,
            status: 'PENDING',
            type: 'PLASTIC',
            category: 'PET',
            weight: 5.5,
            created_at: '2025-10-24T10:00:00.000Z',
            updated_at: '2025-10-24T10:00:00.000Z',
            users: {
                name: 'Test User',
                email: 'test@example.com',
                phone: '0771234567'
            },
            area: {
                area_id: 'area-001',
                area_name: 'Colombo 07',
                collector_id: collectorId
            }
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockRequest, error: null });

        // Act
        const result = await fetchRecyclableDetailsUC(requestId, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();

        // Verify data transformation
        expect(result.data).toHaveProperty('id', requestId);
        expect(result.data).toHaveProperty('userId', 'user-001');
        expect(result.data).toHaveProperty('areaId', 'area-001');
        expect(result.data).toHaveProperty('status', 'PENDING');
        expect(result.data).toHaveProperty('type', 'PLASTIC');
        expect(result.data).toHaveProperty('category', 'PET');
        expect(result.data).toHaveProperty('weight', 5.5);
        expect(result.data).toHaveProperty('users');
        expect(result.data).toHaveProperty('area');
        expect(result.data.users).toEqual(mockRequest.users);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
        expect(getRecyclableRequestById).toHaveBeenCalledWith(requestId);
    });

    // negative
    test('should return error for invalid request ID format', async () => {
        // Arrange
        const invalidRequestId = 'invalid-uuid-format';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';

        // Act
        const result = await fetchRecyclableDetailsUC(invalidRequestId, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/invalid.*id/i);

        expect(getRecyclableRequestById).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when recyclable request does not exist', async () => {
        // Arrange
        const requestId = '99999999-0000-0000-0000-000000000000';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';

        getRecyclableRequestById.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await fetchRecyclableDetailsUC(requestId, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toMatch(/not found/i);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
    });

    // negative
    test('should return error when collector is not authorized for this request', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const differentCollectorId = '11111111-2222-3333-4444-555555555555';

        const mockRequest = {
            recyclable_collect_request_id: requestId,
            user_id: 'user-001',
            area_id: 'area-001',
            collector_id: differentCollectorId,
            status: 'PENDING',
            type: 'PLASTIC',
            category: 'PET',
            weight: 5.5,
            created_at: '2025-10-24T10:00:00.000Z',
            updated_at: '2025-10-24T10:00:00.000Z'
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockRequest, error: null });

        // Act
        const result = await fetchRecyclableDetailsUC(requestId, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(403);
        expect(result.message).toMatch(/unauthorized|not authorized/i);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
    });

    // negative
    test('should return error when database fails to fetch request', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';

        getRecyclableRequestById.mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
        });

        // Act
        const result = await fetchRecyclableDetailsUC(requestId, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toMatch(/fetch.*failed|unable.*fetch|error/i);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
    });

    // edge case
    test('should successfully fetch request when collector_id is null (unassigned)', async () => {
        // Arrange
        const requestId = 'a1b2c3d4-1234-5678-90ab-cdef12345678';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';

        const mockRequest = {
            recyclable_collect_request_id: requestId,
            user_id: 'user-001',
            area_id: 'area-001',
            collector_id: null,
            status: 'PENDING',
            type: 'PLASTIC',
            category: 'PET',
            weight: 5.5,
            created_at: '2025-10-24T10:00:00.000Z',
            updated_at: '2025-10-24T10:00:00.000Z',
            users: { name: 'Test User' },
            area: { area_name: 'Colombo 07' }
        };

        getRecyclableRequestById.mockResolvedValue({ data: mockRequest, error: null });

        // Act
        const result = await fetchRecyclableDetailsUC(requestId, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data.id).toBe(requestId);

        expect(getRecyclableRequestById).toHaveBeenCalledTimes(1);
    });

    // edge case
    test('should return error for null request ID', async () => {
        // Arrange
        const nullRequestId = null;
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';

        // Act
        const result = await fetchRecyclableDetailsUC(nullRequestId, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/invalid.*id/i);

        expect(getRecyclableRequestById).not.toHaveBeenCalled();
    });
});

//7
import { jest } from '@jest/globals';


jest.unstable_mockModule('../../src/repositories/collectorRepository/collectorRepo.js', () => ({
    getAllRecyclableRequests: jest.fn(),
    getCollectorById: jest.fn()
}));


const { getAllRecyclableRequests, getCollectorById } = await import('../../../src/repositories/collectorRepository/collectorRepo.js');
const fetchAllRecyclablesUC = (await import('../../../src/usecase/recyclableUsecase/fetchAllRecyclablesUC.js')).default;

describe('fetchAllRecyclablesUC', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    //positive
    test('should successfully fetch all recyclable requests for valid collector', async () => {
        // Arrange
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const mockCollector = {
            collector_id: collectorId,
            name: 'John Collector',
            role: 'COLLECTOR'
        };

        const mockRequests = [
            {
                recyclable_collect_request_id: '8598c0cf-d287-4495-bb18-e61a67893jfh',
                user_id: '8598c0cf-d287-4495-bb18-e61a7773d635',
                area_id: 'area-001',
                status: 'PENDING',
                type: 'PLASTIC',
                category: 'PET',
                weight: 5.5,
                created_at: '2025-10-24T10:00:00.000Z',
                updated_at: '2025-10-24T10:00:00.000Z',
                users: { name: 'Test User', email: 'test@example.com' }
            },
            {
                recyclable_collect_request_id: 'req-002',
                user_id: 'user-002',
                area_id: 'area-001',
                status: 'COLLECTED',
                type: 'PAPER',
                category: 'CARDBOARD',
                weight: 3.2,
                created_at: '2025-10-23T09:00:00.000Z',
                updated_at: '2025-10-24T14:30:00.000Z',
                users: { name: 'Another User', email: 'another@example.com' }
            }
        ];

        getCollectorById.mockResolvedValue({ data: mockCollector, error: null });
        getAllRecyclableRequests.mockResolvedValue({ data: mockRequests, error: null });

        // Act
        const result = await fetchAllRecyclablesUC(collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data).toHaveLength(2);

        // Verify data transformation
        expect(result.data[0]).toHaveProperty('id', 'req-001');
        expect(result.data[0]).toHaveProperty('userId', 'user-001');
        expect(result.data[0]).toHaveProperty('status', 'PENDING');
        expect(result.data[0]).toHaveProperty('type', 'PLASTIC');
        expect(result.data[0]).toHaveProperty('weight', 5.5);

        expect(getCollectorById).toHaveBeenCalledTimes(1);
        expect(getCollectorById).toHaveBeenCalledWith(collectorId);
        expect(getAllRecyclableRequests).toHaveBeenCalledTimes(1);
        expect(getAllRecyclableRequests).toHaveBeenCalledWith(collectorId);
    });

    //negetive 
    test('should return error for invalid collector ID format', async () => {
        // Arrange
        const invalidCollectorId = 'invalid-uuid-format';

        // Act
        const result = await fetchAllRecyclablesUC(invalidCollectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/invalid.*id/i);

        expect(getCollectorById).not.toHaveBeenCalled();
        expect(getAllRecyclableRequests).not.toHaveBeenCalled();
    });

    //negetive 
    test('should return error when collector does not exist', async () => {
        // Arrange
        const collectorId = '99999999-0000-0000-0000-000000000000';

        getCollectorById.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await fetchAllRecyclablesUC(collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toMatch(/collector not found/i);

        expect(getCollectorById).toHaveBeenCalledTimes(1);
        expect(getAllRecyclableRequests).not.toHaveBeenCalled();
    });

    //negetive 
    test('should return error when database fails to fetch requests', async () => {
        // Arrange
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const mockCollector = {
            collector_id: collectorId,
            role: 'COLLECTOR'
        };

        getCollectorById.mockResolvedValue({ data: mockCollector, error: null });
        getAllRecyclableRequests.mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
        });

        // Act
        const result = await fetchAllRecyclablesUC(collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toMatch(/fetch.*failed|unable.*fetch|error/i);

        expect(getCollectorById).toHaveBeenCalledTimes(1);
        expect(getAllRecyclableRequests).toHaveBeenCalledTimes(1);
    });

    //edge case
    test('should return empty array when collector has no requests', async () => {
        // Arrange
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const mockCollector = {
            collector_id: collectorId,
            role: 'COLLECTOR'
        };

        getCollectorById.mockResolvedValue({ data: mockCollector, error: null });
        getAllRecyclableRequests.mockResolvedValue({ data: [], error: null });

        // Act
        const result = await fetchAllRecyclablesUC(collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data).toHaveLength(0);

        expect(getCollectorById).toHaveBeenCalledTimes(1);
        expect(getAllRecyclableRequests).toHaveBeenCalledTimes(1);
    });

    // edge case 
    test('should return error for null collector ID', async () => {
        // Arrange
        const nullCollectorId = null;

        // Act
        const result = await fetchAllRecyclablesUC(nullCollectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/invalid.*id/i);

        expect(getCollectorById).not.toHaveBeenCalled();
        expect(getAllRecyclableRequests).not.toHaveBeenCalled();
    });

    // edge case 
    test('should handle null data gracefully by returning empty array', async () => {
        // Arrange
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const mockCollector = {
            collector_id: collectorId,
            role: 'COLLECTOR'
        };

        getCollectorById.mockResolvedValue({ data: mockCollector, error: null });
        getAllRecyclableRequests.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await fetchAllRecyclablesUC(collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data).toHaveLength(0);

        expect(getCollectorById).toHaveBeenCalledTimes(1);
        expect(getAllRecyclableRequests).toHaveBeenCalledTimes(1);
    });
});

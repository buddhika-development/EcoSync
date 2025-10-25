import { jest } from '@jest/globals';

// Mock AdminScheduledRoutesRepository
jest.unstable_mockModule('../../../src/repositories/adminRepository/admin.scheduledroutes.repository.js', () => ({
    AdminScheduledRoutesRepository: {
        findAllScheduledRoutes: jest.fn()
    }
}));

// Import use case (named export)
const { GetScheduledRoutesUseCase } = await import('../../../src/usecase/adminUsecase/getScheduledRoutes.usecase.js');

// Import mocked repository
const { AdminScheduledRoutesRepository } = await import('../../../src/repositories/adminRepository/admin.scheduledroutes.repository.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';

// TEST SUITE: GetScheduledRoutesUseCase
describe('GetScheduledRoutesUseCase - Unit Tests', () => {

    const mockRoutesData = {
        items: [
            {
                order_id: 'order-001',
                order_status: 'SCHEDULED',
                scheduled_date: '2025-10-25',
                created_at: '2025-10-24T10:00:00Z',
                updated_at: '2025-10-24T10:00:00Z',
                area_id: 'area-001',
                area_name: 'Malabe',
                collector_id: 'collector-001',
                collector_first_name: 'John',
                collector_last_name: 'Doe',
                task_id: 'task-001',
                full_bin_id: 'fb-001',
                bin_request_status: 'SCHEDULED',
                bin_id: 'bin-001',
                bin_status: 'FULL',
                latitude: '6.9271',
                longitude: '79.8612'
            },
            {
                order_id: 'order-001',
                order_status: 'SCHEDULED',
                scheduled_date: '2025-10-25',
                created_at: '2025-10-24T10:00:00Z',
                updated_at: '2025-10-24T10:00:00Z',
                area_id: 'area-001',
                area_name: 'Malabe',
                collector_id: 'collector-001',
                collector_first_name: 'John',
                collector_last_name: 'Doe',
                task_id: 'task-002',
                full_bin_id: 'fb-002',
                bin_request_status: 'SCHEDULED',
                bin_id: 'bin-002',
                bin_status: 'FULL',
                latitude: '6.9344',
                longitude: '79.8428'
            }
        ],
        total: 2
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST CASE #1: Success - Get all scheduled routes (grouped)
    test('should successfully return grouped scheduled routes', async () => {

        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue(mockRoutesData);

        const result = await GetScheduledRoutesUseCase({});

        expect(result.data).toHaveLength(1); // 2 rows grouped into 1 order
        expect(result.total).toBe(1);
        
        const order = result.data[0];
        expect(order.orderId).toBe('order-001');
        expect(order.collectorName).toBe('John Doe');
        expect(order.areaName).toBe('Malabe');
        expect(order.tasks).toHaveLength(2);

        expect(AdminScheduledRoutesRepository.findAllScheduledRoutes).toHaveBeenCalledTimes(1);
    });

    // TEST CASE #2: Success - Filter by status
    test('should return filtered routes by status', async () => {

        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue(mockRoutesData);

        const result = await GetScheduledRoutesUseCase({ status: 'SCHEDULED' });

        expect(result.data[0].orderStatus).toBe('SCHEDULED');
        expect(AdminScheduledRoutesRepository.findAllScheduledRoutes).toHaveBeenCalledWith({
            status: 'SCHEDULED',
            areaId: undefined,
            areaName: undefined
        });
    });

    // TEST CASE #3: Edge Case - Empty result
    test('should return empty array when no routes found', async () => {
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue({ items: [], total: 0 });

        const result = await GetScheduledRoutesUseCase({ status: 'COMPLETED' });

        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
    });

    // TEST CASE #4: Edge Case - Order with no tasks
    test('should handle orders with no tasks', async () => {
      
        const orderWithoutTasks = {
            items: [{
                order_id: 'order-002',
                order_status: 'SCHEDULED',
                scheduled_date: '2025-10-26',
                created_at: '2025-10-25T10:00:00Z',
                updated_at: '2025-10-25T10:00:00Z',
                area_id: 'area-002',
                area_name: 'Kaduwela',
                collector_id: 'collector-002',
                collector_first_name: 'Jane',
                collector_last_name: 'Smith',
                task_id: null,
                full_bin_id: null,
                bin_request_status: null,
                bin_id: null,
                bin_status: null,
                latitude: null,
                longitude: null
            }],
            total: 1
        };
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue(orderWithoutTasks);

        const result = await GetScheduledRoutesUseCase({});

        expect(result.data).toHaveLength(1);
        expect(result.data[0].tasks).toEqual([]);
    });

    // TEST CASE #5: Edge Case - Multiple orders
    test('should correctly group multiple orders', async () => {
   
        const multipleOrders = {
            items: [
                ...mockRoutesData.items,
                {
                    order_id: 'order-002',
                    order_status: 'IN_PROGRESS',
                    scheduled_date: '2025-10-26',
                    created_at: '2025-10-25T10:00:00Z',
                    updated_at: '2025-10-25T10:00:00Z',
                    area_id: 'area-002',
                    area_name: 'Kaduwela',
                    collector_id: 'collector-002',
                    collector_first_name: 'Jane',
                    collector_last_name: 'Smith',
                    task_id: 'task-003',
                    full_bin_id: 'fb-003',
                    bin_request_status: 'COMPLETED',
                    bin_id: 'bin-003',
                    bin_status: 'EMPTY',
                    latitude: '6.9500',
                    longitude: '79.8500'
                }
            ],
            total: 3
        };
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue(multipleOrders);

        const result = await GetScheduledRoutesUseCase({});

        expect(result.data).toHaveLength(2); // 2 distinct orders
        expect(result.data[0].tasks).toHaveLength(2);
        expect(result.data[1].tasks).toHaveLength(1);
    });

    // TEST CASE #6: Negative - Repository throws error
    test('should throw error when repository fails', async () => {
        // ARRANGE
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockRejectedValue(
            new Error('Failed to fetch scheduled routes')
        );

        // ACT & ASSERT
        await expect(GetScheduledRoutesUseCase({}))
            .rejects.toThrow('Failed to fetch scheduled routes');
    });

    // TEST CASE #7: Negative - Invalid status filter
    test('should handle invalid status gracefully', async () => {
        // ARRANGE
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue({ 
            items: [], 
            total: 0 
        });

        // ACT
        const result = await GetScheduledRoutesUseCase({ status: 'INVALID_STATUS' });

        // ASSERT
        expect(result.data).toEqual([]);
    });

    // TEST CASE #8: Edge Case - Collector with null last name
    test('should handle collector with null last name', async () => {
        // ARRANGE
        const routeWithNullLastName = {
            items: [{
                ...mockRoutesData.items[0],
                collector_last_name: null
            }],
            total: 1
        };
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue(routeWithNullLastName);

        // ACT
        const result = await GetScheduledRoutesUseCase({});

        // ASSERT
        expect(result.data[0].collectorName).toBeNull();
    });

    // TEST CASE #9: Negative - Malformed repository response
    test('should throw error when repository returns malformed data', async () => {
        // ARRANGE
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue({ 
            items: undefined, 
            total: 0 
        });

        // ACT & ASSERT
        await expect(GetScheduledRoutesUseCase({}))
            .rejects.toThrow();
    });

    // TEST CASE #10: Edge Case - Tasks with invalid coordinates
    test('should handle tasks with invalid coordinate formats', async () => {
        // ARRANGE
        const invalidCoords = {
            items: [{
                ...mockRoutesData.items[0],
                latitude: 'invalid',
                longitude: 'invalid'
            }],
            total: 1
        };
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue(invalidCoords);

        // ACT
        const result = await GetScheduledRoutesUseCase({});

        // ASSERT
        expect(result.data[0].tasks[0].latitude).toBeNaN();
        expect(result.data[0].tasks[0].longitude).toBeNaN();
    });

    // TEST CASE #11: Edge Case - Filter by area name
    test('should filter routes by area name correctly', async () => {
        // ARRANGE
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue(mockRoutesData);

        // ACT
        const result = await GetScheduledRoutesUseCase({ areaName: 'Malabe' });

        // ASSERT
        expect(AdminScheduledRoutesRepository.findAllScheduledRoutes).toHaveBeenCalledWith({
            status: undefined,
            areaId: undefined,
            areaName: 'Malabe'
        });
    });

    // TEST CASE #12: Negative - Database connection timeout
    test('should throw error on database timeout', async () => {
        // ARRANGE
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockRejectedValue(
            new Error('Connection timeout after 30s')
        );

        // ACT & ASSERT
        await expect(GetScheduledRoutesUseCase({}))
            .rejects.toThrow('Connection timeout after 30s');
    });
});

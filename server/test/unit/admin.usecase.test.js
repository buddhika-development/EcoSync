import { jest } from '@jest/globals';

// Mock AdminBinRepository
jest.unstable_mockModule('../../src/repositories/adminRepository/admin.bins.repository.js', () => ({
    AdminBinRepository: {
        findBins: jest.fn()
    }
}));

// Mock AdminFullBinRepository
jest.unstable_mockModule('../../src/repositories/adminRepository/admin.fullbins.repository.js', () => ({
    AdminFullBinRepository: {
        findFullBins: jest.fn()
    }
}));

// Mock AdminPickupRepository
jest.unstable_mockModule('../../src/repositories/adminRepository/admin.pickups.repository.js', () => ({
    AdminPickupRepository: {
        getOrderWithTasks: jest.fn()
    }
}));

// Mock AdminScheduledRoutesRepository
jest.unstable_mockModule('../../src/repositories/adminRepository/admin.scheduledroutes.repository.js', () => ({
    AdminScheduledRoutesRepository: {
        findAllScheduledRoutes: jest.fn()
    }
}));

// Import use cases (named exports)
const { GetAdminBinsUseCase } = await import('../../src/usecase/adminUsecase/getAdminBins.usecase.js');
const { GetAdminFullBinsUseCase } = await import('../../src/usecase/adminUsecase/getAdminFullBins.usecase.js');
const { GetPickupProgressUseCase } = await import('../../src/usecase/adminUsecase/getPickupProgress.usecase.js');
const { GetScheduledRoutesUseCase } = await import('../../src/usecase/adminUsecase/getScheduledRoutes.usecase.js');

// Import mocked repositories
const { AdminBinRepository } = await import('../../src/repositories/adminRepository/admin.bins.repository.js');
const { AdminFullBinRepository } = await import('../../src/repositories/adminRepository/admin.fullbins.repository.js');
const { AdminPickupRepository } = await import('../../src/repositories/adminRepository/admin.pickups.repository.js');
const { AdminScheduledRoutesRepository } = await import('../../src/repositories/adminRepository/admin.scheduledroutes.repository.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';


// TEST SUITE 1: GetAdminBinsUseCase
describe('GetAdminBinsUseCase - Unit Tests', () => {

    // TEST DATA - Repository returns raw data
    const mockBinsData = {
        items: [
            {
                bin_id: 'bin-001',
                latitude: '6.9271',
                longitude: '79.8612',
                bin_status: 'FULL',
                area: { area_name: 'Colombo' },
                user_id: 'user-001',
                created_at: '2025-10-25T10:00:00Z',
                updated_at: '2025-10-25T10:00:00Z'
            },
            {
                bin_id: 'bin-002',
                latitude: '6.9344',
                longitude: '79.8428',
                bin_status: 'EMPTY',
                area: { area_name: 'Dehiwala' },
                user_id: 'user-002',
                created_at: '2025-10-25T11:00:00Z',
                updated_at: '2025-10-25T11:00:00Z'
            }
        ],
        total: 2
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST CASE #1: Success - Get all bins without filters
    test('should successfully return all bins without filters', async () => {
    
        AdminBinRepository.findBins.mockResolvedValue(mockBinsData);

        const result = await GetAdminBinsUseCase({});

        expect(result).toBeDefined();
        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(2);
        
        expect(result.data[0]).toEqual({
            id: 'bin-001',
            lat: 6.9271,
            lng: 79.8612,
            areaName: 'Colombo',
            userId: 'user-001',
            status: 'FULL',
            createdAt: '2025-10-25T10:00:00Z',
            updatedAt: '2025-10-25T10:00:00Z'
        });

        expect(AdminBinRepository.findBins).toHaveBeenCalledTimes(1);
        expect(AdminBinRepository.findBins).toHaveBeenCalledWith({});
    });

    // TEST CASE #2: Success - Filter by status
    test('should return filtered bins by status', async () => {

        const fullBinsOnly = {
            items: [mockBinsData.items[0]],
            total: 1
        };
        AdminBinRepository.findBins.mockResolvedValue(fullBinsOnly);

        const result = await GetAdminBinsUseCase({ status: 'FULL' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].status).toBe('FULL');
        expect(AdminBinRepository.findBins).toHaveBeenCalledWith({ status: 'FULL' });
    });

    // TEST CASE #3: Error - Invalid status
    test('should throw validation error for invalid status', async () => {
       
        await expect(GetAdminBinsUseCase({ status: 'INVALID' }))
            .rejects.toThrow('Invalid status');
    });

    // TEST CASE #4: Edge Case - Empty result
    test('should return empty array when no bins found', async () => {
     
        AdminBinRepository.findBins.mockResolvedValue({ items: [], total: 0 });

        const result = await GetAdminBinsUseCase({ status: 'FULL' });

        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
    });

    // TEST CASE #5: Edge Case - Null area (orphaned bin)
    test('should handle bins with null area', async () => {

        const binsWithNullArea = {
            items: [{
                bin_id: 'bin-003',
                latitude: '6.9271',
                longitude: '79.8612',
                bin_status: 'EMPTY',
                area: null,
                user_id: 'user-003',
                created_at: '2025-10-25T12:00:00Z',
                updated_at: '2025-10-25T12:00:00Z'
            }],
            total: 1
        };
        AdminBinRepository.findBins.mockResolvedValue(binsWithNullArea);

        const result = await GetAdminBinsUseCase({});

        expect(result.data[0].areaName).toBeNull();
    });
});

// TEST SUITE 2: GetAdminFullBinsUseCase
describe('GetAdminFullBinsUseCase - Unit Tests', () => {

    const mockFullBinsData = {
        items: [
            {
                full_bin_id: 'fb-001',
                bin_id: 'bin-003',
                request_status: 'PENDING',
                updated_at: '2025-10-25T10:00:00Z',
                bin_status: 'FULL',
                latitude: '6.9271',
                longitude: '79.8612',
                area_id: 'area-001',
                area_name: 'Malabe'
            },
            {
                full_bin_id: 'fb-002',
                bin_id: 'bin-004',
                request_status: 'SCHEDULED',
                updated_at: '2025-10-25T11:00:00Z',
                bin_status: 'FULL',
                latitude: '6.9344',
                longitude: '79.8428',
                area_id: 'area-002',
                area_name: 'Kaduwela'
            }
        ],
        total: 2
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST CASE #6: Success - Get all full bins
    test('should successfully return all full bins', async () => {

        AdminFullBinRepository.findFullBins.mockResolvedValue(mockFullBinsData);

        const result = await GetAdminFullBinsUseCase({});

        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(2);
        
        expect(result.data[0]).toEqual({
            fullBinId: 'fb-001',
            binId: 'bin-003',
            requestStatus: 'PENDING',
            updatedAt: '2025-10-25T10:00:00Z',
            binStatus: 'FULL',
            latitude: 6.9271,
            longitude: 79.8612,
            areaId: 'area-001',
            areaName: 'Malabe'
        });

        expect(AdminFullBinRepository.findFullBins).toHaveBeenCalledTimes(1);
    });

    // TEST CASE #7: Success - Filter by request status
    test('should return filtered full bins by request status', async () => {
 
        const pendingOnly = {
            items: [mockFullBinsData.items[0]],
            total: 1
        };
        AdminFullBinRepository.findFullBins.mockResolvedValue(pendingOnly);

        const result = await GetAdminFullBinsUseCase({ status: 'PENDING' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].requestStatus).toBe('PENDING');
        expect(AdminFullBinRepository.findFullBins).toHaveBeenCalledWith({ status: 'PENDING' });
    });

    // TEST CASE #8: Error - Invalid status
    test('should throw validation error for invalid status', async () => {
        
        await expect(GetAdminFullBinsUseCase({ status: 'INVALID_STATUS' }))
            .rejects.toThrow('Invalid status');
    });

    // TEST CASE #9: Edge Case - Empty result
    test('should return empty array when no full bins match filters', async () => {
        // ARRANGE
        AdminFullBinRepository.findFullBins.mockResolvedValue({ items: [], total: 0 });

        // ACT
        const result = await GetAdminFullBinsUseCase({ status: 'COMPLETED' });

        // ASSERT
        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
    });

    // TEST CASE #10: Edge Case - Null coordinates
    test('should handle null latitude/longitude gracefully', async () => {
        // ARRANGE
        const binsWithNullCoords = {
            items: [{
                full_bin_id: 'fb-003',
                bin_id: 'bin-005',
                request_status: 'PENDING',
                updated_at: '2025-10-25T12:00:00Z',
                bin_status: 'FULL',
                latitude: null,
                longitude: null,
                area_id: 'area-003',
                area_name: 'Kottawa'
            }],
            total: 1
        };
        AdminFullBinRepository.findFullBins.mockResolvedValue(binsWithNullCoords);

        // ACT
        const result = await GetAdminFullBinsUseCase({});

        // ASSERT
        expect(result.data[0].latitude).toBeNull();
        expect(result.data[0].longitude).toBeNull();
    });
});

// TEST SUITE 3: GetPickupProgressUseCase
describe('GetPickupProgressUseCase - Unit Tests', () => {

    const validOrderId = 'd54b18cb-43f7-4500-8624-0fd499cc5767';

    const mockOrderWithTasks = {
        order: {
            order_id: validOrderId,
            area_id: 'area-001',
            area: { area_name: 'Nawagamuwa' },
            collector_id: 'collector-001',
            collector: {
                user_first_name: 'Sahan',
                user_last_name: 'Fernando'
            },
            scheduled_date: '2025-10-25'
        },
        tasks: [
            {
                full_bin_status: {
                    full_bin_id: 'fb-001',
                    request_status: 'COMPLETED',
                    updated_at: '2025-10-25T10:00:00Z',
                    bins: {
                        bin_id: 'bin-001',
                        latitude: '6.9271',
                        longitude: '79.8612',
                        bin_status: 'EMPTY',
                        area: { area_name: 'Nawagamuwa' }
                    }
                }
            },
            {
                full_bin_status: {
                    full_bin_id: 'fb-002',
                    request_status: 'PENDING',
                    updated_at: '2025-10-25T11:00:00Z',
                    bins: {
                        bin_id: 'bin-002',
                        latitude: '6.9344',
                        longitude: '79.8428',
                        bin_status: 'FULL',
                        area: { area_name: 'Nawagamuwa' }
                    }
                }
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST CASE #11: Success - Get pickup progress (IN_PROGRESS)
    test('should successfully return pickup order progress with IN_PROGRESS status', async () => {
        // ARRANGE
        AdminPickupRepository.getOrderWithTasks.mockResolvedValue(mockOrderWithTasks);

        // ACT
        const result = await GetPickupProgressUseCase(validOrderId);

        // ASSERT
        expect(result.orderId).toBe(validOrderId);
        expect(result.areaName).toBe('Nawagamuwa');
        expect(result.collectorName).toBe('Sahan Fernando');
        expect(result.totalTasks).toBe(2);
        expect(result.completedTasks).toBe(1);
        expect(result.derivedStatus).toBe('IN_PROGRESS');
        expect(result.tasks).toHaveLength(2);

        expect(AdminPickupRepository.getOrderWithTasks).toHaveBeenCalledTimes(1);
        expect(AdminPickupRepository.getOrderWithTasks).toHaveBeenCalledWith(validOrderId);
    });

    // TEST CASE #12: Success - All tasks completed
    test('should return COMPLETED status when all tasks are done', async () => {
        // ARRANGE
        const completedOrder = {
            ...mockOrderWithTasks,
            tasks: [
                {
                    full_bin_status: {
                        ...mockOrderWithTasks.tasks[0].full_bin_status,
                        request_status: 'COMPLETED'
                    }
                },
                {
                    full_bin_status: {
                        ...mockOrderWithTasks.tasks[1].full_bin_status,
                        request_status: 'COMPLETED'
                    }
                }
            ]
        };
        AdminPickupRepository.getOrderWithTasks.mockResolvedValue(completedOrder);

        // ACT
        const result = await GetPickupProgressUseCase(validOrderId);

        // ASSERT
        expect(result.derivedStatus).toBe('COMPLETED');
        expect(result.completedTasks).toBe(2);
        expect(result.totalTasks).toBe(2);
    });

    // TEST CASE #13: Success - No tasks completed (SCHEDULED)
    test('should return SCHEDULED status when no tasks are completed', async () => {
        // ARRANGE
        const scheduledOrder = {
            ...mockOrderWithTasks,
            tasks: [
                {
                    full_bin_status: {
                        ...mockOrderWithTasks.tasks[0].full_bin_status,
                        request_status: 'PENDING'
                    }
                },
                {
                    full_bin_status: {
                        ...mockOrderWithTasks.tasks[1].full_bin_status,
                        request_status: 'SCHEDULED'
                    }
                }
            ]
        };
        AdminPickupRepository.getOrderWithTasks.mockResolvedValue(scheduledOrder);

        // ACT
        const result = await GetPickupProgressUseCase(validOrderId);

        // ASSERT
        expect(result.derivedStatus).toBe('SCHEDULED');
        expect(result.completedTasks).toBe(0);
    });

    // TEST CASE #14: Edge Case - Order with no tasks
    test('should handle order with no tasks', async () => {
        // ARRANGE
        const orderWithNoTasks = {
            ...mockOrderWithTasks,
            tasks: []
        };
        AdminPickupRepository.getOrderWithTasks.mockResolvedValue(orderWithNoTasks);

        // ACT
        const result = await GetPickupProgressUseCase(validOrderId);

        // ASSERT
        expect(result.tasks).toEqual([]);
        expect(result.totalTasks).toBe(0);
        expect(result.completedTasks).toBe(0);
        expect(result.derivedStatus).toBe('SCHEDULED');
    });

    // TEST CASE #15: Edge Case - Collector with no last name
    test('should handle collector with missing last name', async () => {
        // ARRANGE
        const orderWithPartialName = {
            ...mockOrderWithTasks,
            order: {
                ...mockOrderWithTasks.order,
                collector: {
                    user_first_name: 'Sahan',
                    user_last_name: ''
                }
            }
        };
        AdminPickupRepository.getOrderWithTasks.mockResolvedValue(orderWithPartialName);

        // ACT
        const result = await GetPickupProgressUseCase(validOrderId);

        // ASSERT
        expect(result.collectorName).toBe('Sahan');
    });
});

// TEST SUITE 4: GetScheduledRoutesUseCase
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

    // TEST CASE #16: Success - Get all scheduled routes (grouped)
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

    // TEST CASE #17: Success - Filter by status
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

    // TEST CASE #18: Edge Case - Empty result
    test('should return empty array when no routes found', async () => {
        AdminScheduledRoutesRepository.findAllScheduledRoutes.mockResolvedValue({ items: [], total: 0 });

        const result = await GetScheduledRoutesUseCase({ status: 'COMPLETED' });

        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
    });

    // TEST CASE #19: Edge Case - Order with no tasks
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

    // TEST CASE #20: Edge Case - Multiple orders
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
});


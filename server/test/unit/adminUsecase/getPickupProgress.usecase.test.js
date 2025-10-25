import { jest } from '@jest/globals';

// Mock AdminPickupRepository
jest.unstable_mockModule('../../../src/repositories/adminRepository/admin.pickups.repository.js', () => ({
    AdminPickupRepository: {
        getOrderWithTasks: jest.fn()
    }
}));

// Import use case (named export)
const { GetPickupProgressUseCase } = await import('../../../src/usecase/adminUsecase/getPickupProgress.usecase.js');

// Import mocked repository
const { AdminPickupRepository } = await import('../../../src/repositories/adminRepository/admin.pickups.repository.js');

// Import test utilities
import { describe, test, expect, beforeEach } from '@jest/globals';

// TEST SUITE: GetPickupProgressUseCase
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

    // TEST CASE #1: Success - Get pickup progress (IN_PROGRESS)
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

    // TEST CASE #2: Success - All tasks completed
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

    // TEST CASE #3: Success - No tasks completed (SCHEDULED)
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

    // TEST CASE #4: Edge Case - Order with no tasks
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

    // TEST CASE #5: Edge Case - Collector with no last name
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

    // TEST CASE #6: Negative - Invalid order_id format
    test('should throw error for invalid order_id format', async () => {
        // ARRANGE
        const invalidOrderId = 'invalid-uuid';
        AdminPickupRepository.getOrderWithTasks.mockRejectedValue(
            new Error('Invalid UUID format')
        );

        // ACT & ASSERT
        await expect(GetPickupProgressUseCase(invalidOrderId))
            .rejects.toThrow('Invalid UUID format');
    });

    // TEST CASE #7: Negative - Order not found
    test('should throw error when order does not exist', async () => {
        // ARRANGE
        const nonExistentOrderId = 'd54b18cb-43f7-4500-8624-0fd499cc5999';
        AdminPickupRepository.getOrderWithTasks.mockRejectedValue(
            new Error('Order not found')
        );

        // ACT & ASSERT
        await expect(GetPickupProgressUseCase(nonExistentOrderId))
            .rejects.toThrow('Order not found');
    });

    // TEST CASE #8: Negative - Repository throws database error
    test('should throw error when repository fails unexpectedly', async () => {
        // ARRANGE
        AdminPickupRepository.getOrderWithTasks.mockRejectedValue(
            new Error('Database connection lost')
        );

        // ACT & ASSERT
        await expect(GetPickupProgressUseCase(validOrderId))
            .rejects.toThrow('Database connection lost');
    });

    // TEST CASE #9: Negative - Tasks with null bins should throw error
    test('should throw error when task has null bin references', async () => {
        // ARRANGE
        const orderWithNullBins = {
            ...mockOrderWithTasks,
            tasks: [{
                full_bin_status: {
                    full_bin_id: 'fb-003',
                    request_status: 'PENDING',
                    updated_at: '2025-10-25T12:00:00Z',
                    bins: null
                }
            }]
        };
        AdminPickupRepository.getOrderWithTasks.mockResolvedValue(orderWithNullBins);

        // ACT & ASSERT
        await expect(GetPickupProgressUseCase(validOrderId))
            .rejects.toThrow();
    });

    // TEST CASE #10: Edge Case - Missing collector information returns null name
    test('should handle missing collector data by returning null name', async () => {
        // ARRANGE
        const orderWithoutCollector = {
            ...mockOrderWithTasks,
            order: {
                ...mockOrderWithTasks.order,
                collector: null
            }
        };
        AdminPickupRepository.getOrderWithTasks.mockResolvedValue(orderWithoutCollector);

        // ACT
        const result = await GetPickupProgressUseCase(validOrderId);

        // ASSERT
        expect(result.collectorName).toBeNull();
    });

    // TEST CASE #11: Edge Case - Mixed task statuses
    test('should correctly calculate progress with mixed statuses', async () => {
        // ARRANGE
        const mixedStatusOrder = {
            ...mockOrderWithTasks,
            tasks: [
                {
                    full_bin_status: {
                        full_bin_id: 'fb-001',
                        request_status: 'COMPLETED',
                        updated_at: '2025-10-25T10:00:00Z',
                        bins: mockOrderWithTasks.tasks[0].full_bin_status.bins
                    }
                },
                {
                    full_bin_status: {
                        full_bin_id: 'fb-002',
                        request_status: 'COMPLETED',
                        updated_at: '2025-10-25T11:00:00Z',
                        bins: mockOrderWithTasks.tasks[1].full_bin_status.bins
                    }
                },
                {
                    full_bin_status: {
                        full_bin_id: 'fb-003',
                        request_status: 'PENDING',
                        updated_at: '2025-10-25T12:00:00Z',
                        bins: mockOrderWithTasks.tasks[0].full_bin_status.bins
                    }
                }
            ]
        };
        AdminPickupRepository.getOrderWithTasks.mockResolvedValue(mixedStatusOrder);

        // ACT
        const result = await GetPickupProgressUseCase(validOrderId);

        // ASSERT
        expect(result.totalTasks).toBe(3);
        expect(result.completedTasks).toBe(2);
        expect(result.derivedStatus).toBe('IN_PROGRESS');
    });
});

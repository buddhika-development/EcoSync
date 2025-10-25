//9
import { jest } from '@jest/globals';


jest.unstable_mockModule('../../src/repositories/collectorRepository/collectorRepo.js', () => ({
    getPickupOrderById: jest.fn(),
    updatePickupOrderStatus: jest.fn(),
    checkAllTasksCleared: jest.fn()
}));


const { getPickupOrderById, updatePickupOrderStatus, checkAllTasksCleared } = await import('../../../src/repositories/collectorRepository/collectorRepo.js');
const updatePickupStatusUC = (await import('../../../src/usecase/collectorUsecase/updatePickupStatusUC.js')).default;

describe('updatePickupStatusUC', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // positive
    test('should successfully update pickup order status from SCHEDULED to IN_PROGRESS', async () => {
        // Arrange
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const newStatus = 'IN_PROGRESS';
        const mockPickupOrder = {
            order_id: orderId,
            area_id: '0d4f44d7-c9df-4cea-9e0f-b7cda796c56b',
            area_name: 'Nawagamuwa',
            collector_id: collectorId,
            status: 'SCHEDULED',
            scheduled_date: '2025-10-25',
            task_count: 5,
            pending_task_count: 5
        };

        const mockUpdatedOrder = {
            ...mockPickupOrder,
            status: newStatus,
            updated_at: '2025-10-25T10:30:00.000Z'
        };

        getPickupOrderById.mockResolvedValue({ data: mockPickupOrder, error: null });
        updatePickupOrderStatus.mockResolvedValue({ data: mockUpdatedOrder, error: null });

        // Act
        const result = await updatePickupStatusUC(orderId, newStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual(mockUpdatedOrder);
        expect(result.data.status).toBe(newStatus);

        expect(getPickupOrderById).toHaveBeenCalledTimes(1);
        expect(getPickupOrderById).toHaveBeenCalledWith(orderId);
        expect(updatePickupOrderStatus).toHaveBeenCalledTimes(1);
        expect(updatePickupOrderStatus).toHaveBeenCalledWith(orderId, newStatus);
    });

    // negative
    test('should return error for invalid orderId format', async () => {
        // Arrange
        const invalidOrderId = 'invalid-uuid-format';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const newStatus = 'IN_PROGRESS';

        // Act
        const result = await updatePickupStatusUC(invalidOrderId, newStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/invalid.*order.*id/i);

        expect(getPickupOrderById).not.toHaveBeenCalled();
        expect(updatePickupOrderStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when pickup order does not exist', async () => {
        // Arrange
        const orderId = '99999999-0000-0000-0000-000000000000';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const newStatus = 'IN_PROGRESS';

        getPickupOrderById.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await updatePickupStatusUC(orderId, newStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toMatch(/not found/i);

        expect(getPickupOrderById).toHaveBeenCalledTimes(1);
        expect(updatePickupOrderStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when collector is not authorized for this order', async () => {
        // Arrange
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const differentCollectorId = '11111111-2222-3333-4444-555555555555';
        const newStatus = 'IN_PROGRESS';
        const mockPickupOrder = {
            order_id: orderId,
            collector_id: differentCollectorId,
            status: 'SCHEDULED'
        };

        getPickupOrderById.mockResolvedValue({ data: mockPickupOrder, error: null });

        // Act
        const result = await updatePickupStatusUC(orderId, newStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(403);
        expect(result.message).toMatch(/not authorized|unauthorized/i);

        expect(getPickupOrderById).toHaveBeenCalledTimes(1);
        expect(updatePickupOrderStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error for invalid status transition from SCHEDULED to COMPLETED', async () => {
        // Arrange
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const newStatus = 'COMPLETED';
        const mockPickupOrder = {
            order_id: orderId,
            collector_id: collectorId,
            status: 'SCHEDULED',
            pending_task_count: 5
        };

        getPickupOrderById.mockResolvedValue({ data: mockPickupOrder, error: null });
        checkAllTasksCleared.mockResolvedValue({ allCleared: false, totalTasks: 5, clearedTasks: 0, error: null });

        // Act
        const result = await updatePickupStatusUC(orderId, newStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/incomplete|not.*collected|cannot complete/i);

        expect(getPickupOrderById).toHaveBeenCalledTimes(1);
        expect(checkAllTasksCleared).toHaveBeenCalledTimes(1);
        expect(updatePickupOrderStatus).not.toHaveBeenCalled();
    });

    //negative
    test('should return error when trying to complete order with pending tasks', async () => {
        // Arrange
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const newStatus = 'COMPLETED';
        const mockPickupOrder = {
            order_id: orderId,
            collector_id: collectorId,
            status: 'IN_PROGRESS',
            task_count: 5,
            pending_task_count: 3
        };

        getPickupOrderById.mockResolvedValue({ data: mockPickupOrder, error: null });
        checkAllTasksCleared.mockResolvedValue({ allCleared: false, totalTasks: 5, clearedTasks: 2, error: null });

        // Act
        const result = await updatePickupStatusUC(orderId, newStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/incomplete|not.*collected|cannot complete/i);

        expect(getPickupOrderById).toHaveBeenCalledTimes(1);
        expect(checkAllTasksCleared).toHaveBeenCalledTimes(1);
        expect(updatePickupOrderStatus).not.toHaveBeenCalled();
    });

    // negative
    test('should return error when database fails to update status', async () => {
        // Arrange
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const newStatus = 'IN_PROGRESS';
        const mockPickupOrder = {
            order_id: orderId,
            collector_id: collectorId,
            status: 'SCHEDULED'
        };

        getPickupOrderById.mockResolvedValue({ data: mockPickupOrder, error: null });
        updatePickupOrderStatus.mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
        });

        // Act
        const result = await updatePickupStatusUC(orderId, newStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toMatch(/database|error|failed/i);

        expect(getPickupOrderById).toHaveBeenCalledTimes(1);
        expect(updatePickupOrderStatus).toHaveBeenCalledTimes(1);
    });

    // edge case
    test('should handle idempotent update when setting same status', async () => {
        // Arrange
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const currentStatus = 'IN_PROGRESS';
        const mockPickupOrder = {
            order_id: orderId,
            collector_id: collectorId,
            status: currentStatus
        };

        getPickupOrderById.mockResolvedValue({ data: mockPickupOrder, error: null });

        // Act
        const result = await updatePickupStatusUC(orderId, currentStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.status).toBe(currentStatus);
        expect(result.message).toMatch(/already/i);

        expect(getPickupOrderById).toHaveBeenCalledTimes(1);
        expect(updatePickupOrderStatus).not.toHaveBeenCalled();
    });

    // edge case
    test('should successfully complete order when all tasks are cleared', async () => {
        // Arrange
        const orderId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
        const newStatus = 'COMPLETED';
        const mockPickupOrder = {
            order_id: orderId,
            collector_id: collectorId,
            status: 'IN_PROGRESS',
            task_count: 5,
            pending_task_count: 0
        };

        const mockCompletedOrder = {
            ...mockPickupOrder,
            status: newStatus,
            updated_at: '2025-10-25T14:30:00.000Z'
        };

        getPickupOrderById.mockResolvedValue({ data: mockPickupOrder, error: null });
        checkAllTasksCleared.mockResolvedValue({ allCleared: true, totalTasks: 5, clearedTasks: 5, error: null });
        updatePickupOrderStatus.mockResolvedValue({ data: mockCompletedOrder, error: null });

        // Act
        const result = await updatePickupStatusUC(orderId, newStatus, collectorId);

        // Assert
        expect(result).toBeDefined();
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data.status).toBe('COMPLETED');
        expect(result.data.pending_task_count).toBe(0);

        expect(getPickupOrderById).toHaveBeenCalledTimes(1);
        expect(checkAllTasksCleared).toHaveBeenCalledTimes(1);
        expect(updatePickupOrderStatus).toHaveBeenCalledTimes(1);
    });
});

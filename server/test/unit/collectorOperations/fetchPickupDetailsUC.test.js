//6
import { jest } from '@jest/globals';


jest.unstable_mockModule('../../src/repositories/collectorRepository/collectorRepo.js', () => ({
    getPickupOrderBins: jest.fn(),
    checkCollectorAndOrder: jest.fn()
}));


const { default: fetchPickupDetailsUC } = await import('../../../src/usecase/collectorUsecase/fetchPickupDetailsUC.js');


const { getPickupOrderBins, checkCollectorAndOrder } = await import('../../../src/repositories/collectorRepository/collectorRepo.js');


const { COLLECTOR_ERRORS, COLLECTOR_SUCCESS } = await import('../../../src/constants/collector.constants.js');


import { describe, test, expect, beforeEach } from '@jest/globals';

describe('fetchPickupDetailsUC', () => {

    const validOrderId = '8598c0cf-d287-4495-bb18-e61a7773d635';
    const invalidOrderId = 'invalid-uuid';
    const validCollectorId = '2bf5df38-b6fd-4598-9702-13520c8480bf';
    const invalidCollectorId = 'invalid-uuid';

    const mockBins = [
        {
            order_id: "2bf5df38-b6fd-4598-9702-13520c8480bf",
            area_id: "0d4f44d7-c9df-4cea-9e0f-b7cda796c56b",
            area_name: "Nawagamuwa",
            collector_id: "8598c0cf-d287-4495-bb18-e61a7773d635",
            status: "SCHEDULED",
            scheduled_date: "2025-10-25",
            created_at: "2025-10-24T10:52:46.441+00:00",
            updated_at: "2025-10-24T10:52:48.369861+00:00",
            task_count: 1,
            pending_task_count: 1,
            is_overdue: false
        },
        {
            order_id: "d54b18cb-43f7-4500-8624-0fd499cc5767",
            area_id: "0d4f44d7-c9df-4cea-9e0f-b7cda796c56b",
            area_name: "Nawagamuwa",
            collector_id: "8598c0cf-d287-4495-bb18-e61a7773d635",
            status: "COMPLETED",
            scheduled_date: "2025-10-25",
            created_at: "2025-10-23T13:28:08.37+00:00",
            updated_at: "2025-10-23T13:28:09.134857+00:00",
            task_count: 1,
            pending_task_count: 0,
            is_overdue: false
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });


    //positive
    test('should successfully return bin details for valid orderId', async () => {

        // ARRANGE
        getPickupOrderBins.mockResolvedValue({
            data: mockBins,
            error: null
        });

        checkCollectorAndOrder.mockResolvedValue({
            data: { order_id: validOrderId },
            error: null
        });

        // ACT
        const result = await fetchPickupDetailsUC(validOrderId, validCollectorId);

        // ASSERT
        expect(result).toBeDefined();
        expect(result).toHaveProperty('ok');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('data');

        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.message).toBe(COLLECTOR_SUCCESS.PICKUP_FETCHED);


        expect(result.data).toEqual(mockBins);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(2);

        expect(getPickupOrderBins).toHaveBeenCalledTimes(1);
        expect(checkCollectorAndOrder).toHaveBeenCalledTimes(1);
        expect(getPickupOrderBins).toHaveBeenCalledWith(validOrderId);
        expect(checkCollectorAndOrder).toHaveBeenCalledWith(validCollectorId, validOrderId);

    })

    //negative
    test('should return an error for invalid orderId', async () => {

        // ACT
        const result = await fetchPickupDetailsUC(invalidOrderId, validCollectorId);

        // ASSERT
        expect(result).toBeDefined();
        expect(result).toHaveProperty('ok');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('message');

        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe("Invalid order ID");

        expect(result.data).toBeUndefined();

        expect(getPickupOrderBins).toHaveBeenCalledTimes(0);
        expect(checkCollectorAndOrder).toHaveBeenCalledTimes(0);

    })

    test('should return an error when repository fails to fetch bins', async () => {

        // ARRANGE
        getPickupOrderBins.mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
        });

        // ACT
        const result = await fetchPickupDetailsUC(validOrderId, validCollectorId);

        // ASSERT
        expect(result).toBeDefined();
        expect(result).toHaveProperty('ok');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('message');

        expect(result.ok).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe(COLLECTOR_ERRORS.FETCH_FAILED);

        expect(getPickupOrderBins).toHaveBeenCalledTimes(1);
        expect(checkCollectorAndOrder).toHaveBeenCalledTimes(0);
        expect(getPickupOrderBins).toHaveBeenCalledWith(validOrderId);
    });

    test('should return error when collector not authorized for this order', async () => {

        // ARRANGE
        getPickupOrderBins.mockResolvedValue({
            data: mockBins,
            error: null
        });

        checkCollectorAndOrder.mockResolvedValue({
            data: null,
            error: { message: 'Unauthorized access' }
        });

        // ACT
        const result = await fetchPickupDetailsUC(validOrderId, validCollectorId);

        // ASSERT
        expect(result.ok).toBe(false);
        expect(result.status).toBe(403);
        expect(result.message).toBe(COLLECTOR_ERRORS.UNAUTHORIZED);

        expect(getPickupOrderBins).toHaveBeenCalledTimes(1);
        expect(checkCollectorAndOrder).toHaveBeenCalledTimes(1);
    });

    // EDGE CASES
    test('should return empty array when order has no bins', async () => {

        // ARRANGE
        getPickupOrderBins.mockResolvedValue({
            data: [],
            error: null
        });

        // ACT
        const result = await fetchPickupDetailsUC(validOrderId, validCollectorId);

        // ASSERT
        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual([]);
        expect(result.data.length).toBe(0);
        expect(Array.isArray(result.data)).toBe(true);


        expect(getPickupOrderBins).toHaveBeenCalledTimes(1);
        expect(checkCollectorAndOrder).not.toHaveBeenCalled();
    });

    test('should return error for null orderId', async () => {

        // ACT
        const result = await fetchPickupDetailsUC(null, validCollectorId);

        // ASSERT
        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe("Invalid order ID");

        expect(getPickupOrderBins).not.toHaveBeenCalled();
        expect(checkCollectorAndOrder).not.toHaveBeenCalled();
    });
});

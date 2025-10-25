//8
import { jest } from '@jest/globals';


jest.unstable_mockModule('../../../src/repositories/collectorRepository/collectorRepo.js', () => ({
    getCollectorById: jest.fn(),
    getAllPickupOrders: jest.fn(),
}));


const { default: fetchAllPickupsUC } = await import('../../../src/usecase/collectorUsecase/fetchAllPickupsUC.js');


const { getCollectorById, getAllPickupOrders } = await import('../../../src/repositories/collectorRepository/collectorRepo.js');


const { COLLECTOR_ERRORS, COLLECTOR_SUCCESS } = await import('../../../src/constants/collector.constants.js');


import { describe, test, expect, beforeEach } from '@jest/globals';

describe('fetchAllPickupsUC - Unit Tests', () => {

    const validCollectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';
    const invalidCollectorId = '8598c0cf-d287-4495-bb18-e61a7773d635-INVALID';

    const mockCollectorData = {
        user_id: validCollectorId,
        user_email_address: 'sahan.n@gmail.com',
        user_first_name: 'Sahan',
        user_last_name: 'Fernando',
        user_role: 'collector'
    };

    const mockPickupOrders = [
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
        },
        {
            order_id: "f6971add-226a-46f3-be02-5e03c1523da0",
            area_id: "44cf33b8-1557-44f5-a119-c0f560ddb4ec",
            area_name: "Malabe South",
            collector_id: "0a3b5b21-646a-40ae-a84a-601aa5d6b47c",
            status: "IN_PROGRESS",
            scheduled_date: "2025-10-25",
            created_at: "2025-10-24T11:44:59.309+00:00",
            updated_at: "2025-10-24T11:45:01.304999+00:00",
            task_count: 6,
            pending_task_count: 4,
            is_overdue: false
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    //positive
    test('should successfully return all pickup orders for valid collector ID', async () => {


        getCollectorById.mockResolvedValue({
            data: mockCollectorData,
            error: null
        });


        getAllPickupOrders.mockResolvedValue({
            data: mockPickupOrders,
            error: null
        });


        const result = await fetchAllPickupsUC(validCollectorId);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('ok');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('data');


        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.message).toBe(COLLECTOR_SUCCESS.PICKUPS_FETCHED);


        expect(result.data).toEqual(mockPickupOrders);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(2);


        expect(getCollectorById).toHaveBeenCalledTimes(1);
        expect(getCollectorById).toHaveBeenCalledWith(validCollectorId);
        expect(getAllPickupOrders).toHaveBeenCalledTimes(1);
        expect(getAllPickupOrders).toHaveBeenCalledWith(validCollectorId);
    });

    //negative tests
    test('should return error for invalid collector ID format', async () => {

        const result = await fetchAllPickupsUC(invalidCollectorId);

        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe(COLLECTOR_ERRORS.INVALID_ID);
        expect(result.data).toBeUndefined();


        expect(getCollectorById).not.toHaveBeenCalled();
        expect(getAllPickupOrders).not.toHaveBeenCalled();
    });

    //negative
    test('should return error when collector does not exist', async () => {


        getCollectorById.mockResolvedValue({
            data: null,
            error: { message: 'Collector not found in database' }
        });


        const result = await fetchAllPickupsUC(validCollectorId);

        expect(result.ok).toBe(false);
        expect(result.status).toBe(404);
        expect(result.message).toBe(COLLECTOR_ERRORS.NOT_FOUND);


        expect(getCollectorById).toHaveBeenCalledTimes(1);
        expect(getAllPickupOrders).not.toHaveBeenCalled();
    });

    //negative
    test('should handle database error when fetching pickups', async () => {


        getCollectorById.mockResolvedValue({
            data: mockCollectorData,
            error: null
        });


        getAllPickupOrders.mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
        });


        const result = await fetchAllPickupsUC(validCollectorId);

        expect(result.ok).toBe(false);
        expect(result.status).toBe(500);
        expect(result.message).toBe(COLLECTOR_ERRORS.FETCH_FAILED);


        expect(getCollectorById).toHaveBeenCalledTimes(1);
        expect(getAllPickupOrders).toHaveBeenCalledTimes(1);
    });

    //edge cases
    test('should return empty array when collector has no pickup orders', async () => {


        getCollectorById.mockResolvedValue({
            data: mockCollectorData,
            error: null
        });


        getAllPickupOrders.mockResolvedValue({
            data: [],
            error: null
        });


        const result = await fetchAllPickupsUC(validCollectorId);


        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual([]);
        expect(result.data.length).toBe(0);
    });

    //edge case 
    test('should return error for null collector ID', async () => {


        const result = await fetchAllPickupsUC(null);


        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe(COLLECTOR_ERRORS.INVALID_ID);


        expect(getCollectorById).not.toHaveBeenCalled();
        expect(getAllPickupOrders).not.toHaveBeenCalled();
    });

    //edge case
    test('should return error for undefined collector ID', async () => {


        const result = await fetchAllPickupsUC(undefined);

        expect(result.ok).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toBe(COLLECTOR_ERRORS.INVALID_ID);
    });

    //edge case
    test('should return empty array when pickup data is null', async () => {


        getCollectorById.mockResolvedValue({
            data: mockCollectorData,
            error: null
        });


        getAllPickupOrders.mockResolvedValue({
            data: null,
            error: null
        });


        const result = await fetchAllPickupsUC(validCollectorId);


        expect(result.ok).toBe(true);
        expect(result.status).toBe(200);
        expect(result.data).toEqual([]);
        expect(Array.isArray(result.data)).toBe(true);
    });
});


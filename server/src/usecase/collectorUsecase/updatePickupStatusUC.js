import { z } from "zod";
import { COLLECTOR_ERRORS, COLLECTOR_SUCCESS, PICKUP_STATUS } from "../../constants/collector.constants.js";
import {
    updatePickupOrderStatus,
    getPickupOrderById,
    checkAllTasksCleared
} from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * Validation schema for pickup status update
 */
const updatePickupStatusSchema = z.object({
    status: z.enum([
        PICKUP_STATUS.SCHEDULED,
        PICKUP_STATUS.IN_PROGRESS,
        PICKUP_STATUS.COMPLETED,
        PICKUP_STATUS.CANCELLED
    ])
});

/**
 * Validates UUID format
 */
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Business logic for updating pickup order status
 * SOLID: Single Responsibility - only handles status update logic
 * 
 * Key Validations:
 * 1. Cannot mark as COMPLETED unless all bins are collected/cancelled
 * 2. Idempotency - returns success message if already in requested state
 * 3. Collector authorization check
 * 
 * @param {string} orderId - UUID of pickup order
 * @param {string} status - New status value
 * @param {string} collectorId - UUID of authenticated collector
 * @returns {Promise<Object>} Standardized response
 */
export default async function updatePickupStatusUC(orderId, status, collectorId) {
    // Step 1: Validate order ID
    if (!orderId || !isValidUUID(orderId)) {
        return {
            ok: false,
            status: 400,
            message: "Invalid order ID"
        };
    }

    // Step 2: Validate status value
    const validation = updatePickupStatusSchema.safeParse({ status });

    if (!validation.success) {
        return {
            ok: false,
            status: 422,
            message: COLLECTOR_ERRORS.VALIDATION_ERROR,
            errors: validation.error.flatten().fieldErrors
        };
    }

    const newStatus = validation.data.status;

    // Step 3: Get current order to check existing status
    const { data: existingOrder, error: fetchError } = await getPickupOrderById(orderId);

    if (fetchError) {
        console.error("Error fetching pickup order:", fetchError);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.DATABASE_ERROR
        };
    }

    if (!existingOrder) {
        return {
            ok: false,
            status: 404,
            message: "Pickup order not found"
        };
    }

    // Step 4: Verify collector owns this order
    if (existingOrder.collector_id !== collectorId) {
        return {
            ok: false,
            status: 403,
            message: COLLECTOR_ERRORS.UNAUTHORIZED
        };
    }

    // Step 5: Idempotency check - if already in requested state, return success
    if (existingOrder.status === newStatus) {
        let message = COLLECTOR_SUCCESS.ALREADY_UPDATED;

        switch (newStatus) {
            case PICKUP_STATUS.COMPLETED:
                message = COLLECTOR_ERRORS.ALREADY_COMPLETED;
                break;
            case PICKUP_STATUS.CANCELLED:
                message = COLLECTOR_ERRORS.ALREADY_CANCELLED;
                break;
            case PICKUP_STATUS.IN_PROGRESS:
                message = COLLECTOR_ERRORS.ALREADY_IN_PROGRESS;
                break;
        }

        return {
            ok: true,
            status: 200,
            message,
            data: existingOrder
        };
    }

    // Step 6: Special validation for COMPLETED status
    // Cannot complete unless all bins are collected or cancelled
    if (newStatus === PICKUP_STATUS.COMPLETED) {
        const { allCleared, totalTasks, clearedTasks, error: checkError } = await checkAllTasksCleared(orderId);

        if (checkError) {
            console.error("Error checking task completion:", checkError);
            return {
                ok: false,
                status: 500,
                message: COLLECTOR_ERRORS.DATABASE_ERROR
            };
        }

        if (totalTasks === 0) {
            return {
                ok: false,
                status: 400,
                message: COLLECTOR_ERRORS.NO_PENDING_TASKS
            };
        }

        if (!allCleared) {
            return {
                ok: false,
                status: 400,
                message: COLLECTOR_ERRORS.INCOMPLETE_BINS,
                details: {
                    totalBins: totalTasks,
                    completedBins: clearedTasks,
                    pendingBins: totalTasks - clearedTasks
                }
            };
        }
    }

    // Step 7: Update status in database
    const { data, error } = await updatePickupOrderStatus(orderId, newStatus);

    if (error) {
        console.error("Error updating pickup status:", error);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.DATABASE_ERROR
        };
    }

    if (!data) {
        return {
            ok: false,
            status: 404,
            message: "Pickup order not found"
        };
    }

    // Step 8: Return success
    return {
        ok: true,
        status: 200,
        message: COLLECTOR_SUCCESS.STATUS_UPDATED,
        data
    };
}

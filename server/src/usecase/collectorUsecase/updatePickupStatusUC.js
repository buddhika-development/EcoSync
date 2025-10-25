import { z } from "zod";
import { COLLECTOR_ERRORS, COLLECTOR_SUCCESS, PICKUP_STATUS } from "../../constants/collector.constants.js";
import {
    updatePickupOrderStatus,
    getPickupOrderById,
    checkAllTasksCleared
} from "../../repositories/collectorRepository/collectorRepo.js";

const updatePickupStatusSchema = z.object({
    status: z.enum([
        PICKUP_STATUS.SCHEDULED,
        PICKUP_STATUS.IN_PROGRESS,
        PICKUP_STATUS.COMPLETED,
        PICKUP_STATUS.CANCELLED
    ])
});


function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * @param {string} orderId 
 * @param {string} status 
 * @param {string} collectorId 
 * @returns {Promise<Object>}
 */
export default async function updatePickupStatusUC(orderId, status, collectorId) {

    if (!orderId || !isValidUUID(orderId)) {
        return {
            ok: false,
            status: 400,
            message: "Invalid order ID"
        };
    }

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


    if (existingOrder.collector_id !== collectorId) {
        return {
            ok: false,
            status: 403,
            message: COLLECTOR_ERRORS.UNAUTHORIZED
        };
    }


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


    return {
        ok: true,
        status: 200,
        message: COLLECTOR_SUCCESS.STATUS_UPDATED,
        data
    };
}

import { z } from "zod";
import { COLLECTOR_ERRORS, COLLECTOR_SUCCESS, BIN_STATUS, FULL_BIN_STATUS } from "../../constants/collector.constants.js";
import {
    updateBinStatus,
    updateFullBinStatus,
    getFullBinStatusByBinId,
    getBinStatusById,
    updatePickupTaskCleared
} from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * Validation schema for bin status update
 */
const updateBinStatusSchema = z.object({
    status: z.enum([
        BIN_STATUS.EMPTY,
        BIN_STATUS.PARTIAL,
        BIN_STATUS.FULL,
        BIN_STATUS.UNAVAILABLE
    ])
});

const updateFullBinStatusSchema = z.object({
    status: z.enum([
        FULL_BIN_STATUS.COLLECTED,
        FULL_BIN_STATUS.CANCELLED
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
 * Business logic for updating bin status
 * 
 * Key Features:
 * 1. Idempotency - returns success if already in requested state
 * 2. Updates pickup_tasks.cleared_at when bin is COLLECTED or CANCELLED
 * 3. Validates bin exists before updating
 * 
 * IMPORTANT SECURITY NOTE:
 * This function updates bin status in the database. In production, the frontend
 * MUST first call /api/bins/validate-qr endpoint to verify the collector
 * physically scanned the bin's QR code before allowing status update.
 * 
 * Flow:
 * 1. Collector scans QR code → Frontend calls /api/bins/validate-qr
 * 2. If validation succeeds → Frontend enables status update button
 * 3. Collector updates status → Frontend calls this endpoint
 * 
 * SOLID: Single Responsibility - only handles bin status update logic
 * 
 * @param {string} binId - UUID of bin
 * @param {string} bin_status - New bin status (EMPTY, PARTIAL, FULL, UNAVAILABLE)
 * @param {string} full_bin_status - New full bin status (COLLECTED, CANCELLED)
 * @param {string} collectorId - UUID of authenticated collector (for logging)
 * @param {string} orderId - UUID of pickup order (optional, for task tracking)
 * @returns {Promise<Object>} Standardized response
 */
export default async function updateBinStatusUC(binId, bin_status, full_bin_status, collectorId, orderId = null) {
    // Step 1: Validate bin ID
    if (!binId || !isValidUUID(binId)) {
        return {
            ok: false,
            status: 400,
            message: "Invalid bin ID"
        };
    }

    // Step 2: Get current bin status for idempotency check
    const { data: currentBin, error: fetchBinError } = await getBinStatusById(binId);

    if (fetchBinError) {
        console.error("Error fetching bin status:", fetchBinError);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.DATABASE_ERROR
        };
    }

    if (!currentBin) {
        return {
            ok: false,
            status: 404,
            message: "Bin not found"
        };
    }

    // Step 3: Get current full bin status for idempotency check
    const { data: currentFullBin, error: fetchFullBinError } = await getFullBinStatusByBinId(binId);

    if (fetchFullBinError) {
        console.error("Error fetching full bin status:", fetchFullBinError);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.DATABASE_ERROR
        };
    }

    // Step 4: Validate bin status value
    const validation = updateBinStatusSchema.safeParse({ status: bin_status });

    if (!validation.success) {
        return {
            ok: false,
            status: 422,
            message: COLLECTOR_ERRORS.VALIDATION_ERROR,
            errors: validation.error.flatten().fieldErrors
        };
    }

    // Step 5: Validate full bin status value
    const validationFullBin = updateFullBinStatusSchema.safeParse({ status: full_bin_status });

    if (!validationFullBin.success) {
        return {
            ok: false,
            status: 422,
            message: COLLECTOR_ERRORS.VALIDATION_ERROR,
            errors: validationFullBin.error.flatten().fieldErrors
        };
    }

    const fullBinStatusValue = validationFullBin.data.status;

    // Step 6: Idempotency check for full bin status
    if (currentFullBin && currentFullBin.request_status === fullBinStatusValue) {
        let message = COLLECTOR_SUCCESS.ALREADY_UPDATED;

        if (fullBinStatusValue === FULL_BIN_STATUS.COLLECTED) {
            message = COLLECTOR_ERRORS.BIN_ALREADY_COLLECTED;
        } else if (fullBinStatusValue === FULL_BIN_STATUS.CANCELLED) {
            message = COLLECTOR_ERRORS.BIN_ALREADY_CANCELLED;
        }

        return {
            ok: true,
            status: 200,
            message,
            data: {
                bin: currentBin,
                fullBinStatus: currentFullBin
            }
        };
    }

    // Step 7: Update bin status in database
    const { data, error } = await updateBinStatus(binId, validation.data.status);

    if (error) {
        console.error("Error updating bin status:", error);
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
            message: "Bin not found"
        };
    }

    // Step 8: Update full bin status
    const { data: updatedFullBin, error: fullBinError } = await updateFullBinStatus(binId, fullBinStatusValue);

    if (fullBinError) {
        console.error("Error updating full bin status:", fullBinError);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.DATABASE_ERROR
        };
    }

    if (!updatedFullBin) {
        return {
            ok: false,
            status: 404,
            message: "Full bin not found"
        };
    }

    // Step 9: Update pickup_tasks.cleared_at if bin is COLLECTED or CANCELLED
    // This marks the task as complete so the pickup order can be completed
    if (orderId && (fullBinStatusValue === FULL_BIN_STATUS.COLLECTED || fullBinStatusValue === FULL_BIN_STATUS.CANCELLED)) {
        const { error: taskError } = await updatePickupTaskCleared(orderId, updatedFullBin.full_bin_id);

        if (taskError) {
            console.warn("Warning: Could not update pickup task cleared status:", taskError);
            // Don't fail the whole operation, just log the warning
        }
    }

    // Step 10: Return success
    return {
        ok: true,
        status: 200,
        message: COLLECTOR_SUCCESS.BIN_STATUS_UPDATED,
        data: {
            bin: data,
            fullBinStatus: updatedFullBin
        }
    };
}

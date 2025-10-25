import { z } from "zod";
import { COLLECTOR_ERRORS, COLLECTOR_SUCCESS, BIN_STATUS, FULL_BIN_STATUS } from "../../constants/collector.constants.js";
import {
    updateBinStatus,
    updateFullBinStatus,
    getFullBinStatusByBinId,
    getBinStatusById,
    updatePickupTaskCleared
} from "../../repositories/collectorRepository/collectorRepo.js";


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


function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * 
 * @param {string} binId
 * @param {string} bin_status 
 * @param {string} full_bin_status 
 * @param {string} collectorId
 * @param {string} order_id 
 * @returns {Promise<Object>} 
 */
export default async function updateBinStatusUC(binId, bin_status, full_bin_id, full_bin_status, collectorId, order_id = null) {

    console.log("Update Bin Status UC called with:", { binId, full_bin_id, bin_status, full_bin_status, collectorId, order_id });
    if (!binId || !isValidUUID(binId)) {
        return {
            ok: false,
            status: 400,
            message: "Invalid bin ID"
        };
    }


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

    console.log("Current Full Bin ID", full_bin_id)
    const { data: currentFullBin, error: fetchFullBinError } = await getFullBinStatusByBinId(full_bin_id);

    if (fetchFullBinError) {
        console.error("Error fetching full bin status:", fetchFullBinError);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.DATABASE_ERROR
        };
    }


    const validation = updateBinStatusSchema.safeParse({ status: bin_status });

    if (!validation.success) {
        return {
            ok: false,
            status: 422,
            message: COLLECTOR_ERRORS.VALIDATION_ERROR,
            errors: validation.error.flatten().fieldErrors
        };
    }


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


    const { data: updatedFullBin, error: fullBinError } = await updateFullBinStatus(full_bin_id, fullBinStatusValue);

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


    if (order_id && (fullBinStatusValue === FULL_BIN_STATUS.COLLECTED || fullBinStatusValue === FULL_BIN_STATUS.CANCELLED)) {
        const { error: taskError } = await updatePickupTaskCleared(order_id, updatedFullBin.full_bin_id);

        if (taskError) {
            console.warn("Warning: Could not update pickup task cleared status:", taskError);

        }
    }


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

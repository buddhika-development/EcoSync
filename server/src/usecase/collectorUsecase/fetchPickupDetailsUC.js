import { COLLECTOR_ERRORS, COLLECTOR_SUCCESS } from "../../constants/collector.constants.js";
import { checkCollectorAndOrder, getPickupOrderBins } from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * Validates UUID format
 * @param {string} id 
 * @returns {boolean}
 */
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Business logic for fetching detailed bins for a pickup order
 * SOLID: Single Responsibility - orchestrates pickup details fetching
 * 
 * @param {string} orderId - UUID of pickup order
 * @param {string} collectorId - UUID of authenticated collector
 * @returns {Promise<Object>} Standardized response
 */
export default async function fetchPickupDetailsUC(orderId, collectorId) {
    // Step 1: Validate input
    if (!orderId || !isValidUUID(orderId)) {
        return {
            ok: false,
            status: 400,
            message: "Invalid order ID"
        };
    }

    // Step 2: Fetch bins for this order
    const { data: bins, error } = await getPickupOrderBins(orderId);

    console.log("Fetched bins for order:", bins);
    console.log("Fetched bins for order:", error);

    if (error) {
        console.error("Error fetching pickup order bins:", error);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.FETCH_FAILED
        };
    }

    // Step 3: Verify collector owns this order (if bins exist)
    if (bins && bins.length > 0) {
        const { data: orderCheck, error: orderError } = await checkCollectorAndOrder(collectorId, orderId);

        if (orderError || !orderCheck) {
            return {
                ok: false,
                status: 403,
                message: COLLECTOR_ERRORS.UNAUTHORIZED
            };
        }
    }

    // Step 4: Return success
    return {
        ok: true,
        status: 200,
        message: COLLECTOR_SUCCESS.PICKUP_FETCHED,
        data: bins || []
    };
}

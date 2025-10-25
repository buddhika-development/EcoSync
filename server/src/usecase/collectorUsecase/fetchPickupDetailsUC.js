import { COLLECTOR_ERRORS, COLLECTOR_SUCCESS } from "../../constants/collector.constants.js";
import { checkCollectorAndOrder, getPickupOrderBins } from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * @param {string} id 
 * @returns {boolean}
 */
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * @param {string} orderId 
 * @param {string} collectorId 
 * @returns {Promise<Object>} 
 */
export default async function fetchPickupDetailsUC(orderId, collectorId) {

    if (!orderId || !isValidUUID(orderId)) {
        return {
            ok: false,
            status: 400,
            message: "Invalid order ID"
        };
    }


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


    return {
        ok: true,
        status: 200,
        message: COLLECTOR_SUCCESS.PICKUP_FETCHED,
        data: bins || []
    };
}

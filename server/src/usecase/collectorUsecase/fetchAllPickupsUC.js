import { COLLECTOR_ERRORS, COLLECTOR_SUCCESS } from "../../constants/collector.constants.js";
import { getAllPickupOrders, getCollectorById } from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * @param {string} collectorId 
 * @returns {boolean}
 */
function isValidUUID(collectorId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(collectorId);
}

/**
 * @param {string} collectorId 
 * @returns {Promise<Object>}
 */
export default async function fetchAllPickupsUC(collectorId) {

    if (!collectorId || !isValidUUID(collectorId)) {
        return {
            ok: false,
            status: 400,
            message: COLLECTOR_ERRORS.INVALID_ID
        };
    }


    const { data: collectorData, error: collectorError } = await getCollectorById(collectorId);

    if (collectorError || !collectorData) {
        console.error("Collector lookup error:", collectorError);
        return {
            ok: false,
            status: 404,
            message: COLLECTOR_ERRORS.NOT_FOUND
        };
    }


    const { data: pickups, error: pickupsError } = await getAllPickupOrders(collectorId);

    if (pickupsError) {
        console.error("Error fetching pickup orders:", pickupsError);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.FETCH_FAILED
        };
    }


    return {
        ok: true,
        status: 200,
        message: COLLECTOR_SUCCESS.PICKUPS_FETCHED,
        data: pickups || []
    };
}
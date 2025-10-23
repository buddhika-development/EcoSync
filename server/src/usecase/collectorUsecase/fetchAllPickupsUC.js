import { COLLECTOR_ERRORS, COLLECTOR_SUCCESS } from "../../constants/collector.constants.js";
import { getAllPickupOrders, getCollectorById } from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * Validates collector ID format
 * SOLID: Single Responsibility - only validates UUID format
 * @param {string} collectorId 
 * @returns {boolean}
 */
function isValidUUID(collectorId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(collectorId);
}

/**
 * Business logic for fetching all pickup routes for a collector
 * SOLID:
 * - Single Responsibility: Only orchestrates fetching pickup orders
 * - Dependency Inversion: Depends on repository abstraction
 * 
 * Design Pattern: Use Case Pattern - encapsulates business logic
 * 
 * @param {string} collectorId - UUID of collector
 * @returns {Promise<Object>} Standardized response { ok, status, message, data?, error? }
 */
export default async function fetchAllPickupsUC(collectorId) {
    // Step 1: Validate input
    if (!collectorId || !isValidUUID(collectorId)) {
        return {
            ok: false,
            status: 400,
            message: COLLECTOR_ERRORS.INVALID_ID
        };
    }

    // Step 2: Verify collector exists and has correct role
    const { data: collectorData, error: collectorError } = await getCollectorById(collectorId);

    if (collectorError || !collectorData) {
        console.error("Collector lookup error:", collectorError);
        return {
            ok: false,
            status: 404,
            message: COLLECTOR_ERRORS.NOT_FOUND
        };
    }

    // Step 3: Fetch all pickup orders for this collector
    const { data: pickups, error: pickupsError } = await getAllPickupOrders(collectorId);

    if (pickupsError) {
        console.error("Error fetching pickup orders:", pickupsError);
        return {
            ok: false,
            status: 500,
            message: COLLECTOR_ERRORS.FETCH_FAILED
        };
    }

    // Step 4: Return success with data
    return {
        ok: true,
        status: 200,
        message: COLLECTOR_SUCCESS.PICKUPS_FETCHED,
        data: pickups || []
    };
}
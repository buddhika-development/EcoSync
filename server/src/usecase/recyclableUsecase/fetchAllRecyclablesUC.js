import { RECYCLABLE_ERRORS, RECYCLABLE_SUCCESS } from "../../constants/recyclable.constants.js";
import { getAllRecyclableRequests, getCollectorById } from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * Validates UUID format
 * SOLID: Single Responsibility - only validates UUID format
 * @param {string} id 
 * @returns {boolean}
 */
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Business logic for fetching all recyclable requests for a collector
 * SOLID:
 * - Single Responsibility: Only orchestrates fetching recyclable requests
 * - Dependency Inversion: Depends on repository abstraction
 * 
 * Design Pattern: Use Case Pattern - encapsulates business logic
 * 
 * @param {string} collectorId - UUID of collector
 * @returns {Promise<Object>} Standardized response { ok, status, message, data? }
 */
export default async function fetchAllRecyclablesUC(collectorId) {
    // Step 1: Validate input
    if (!collectorId || !isValidUUID(collectorId)) {
        return {
            ok: false,
            status: 400,
            message: RECYCLABLE_ERRORS.INVALID_ID
        };
    }

    // Step 2: Verify collector exists and has correct role
    const { data: collectorData, error: collectorError } = await getCollectorById(collectorId);

    if (collectorError || !collectorData) {
        console.error("Collector lookup error:", collectorError);
        return {
            ok: false,
            status: 404,
            message: "Collector not found"
        };
    }

    // Step 3: Fetch all recyclable requests for this collector
    const { data: requests, error: requestsError } = await getAllRecyclableRequests(collectorId);

    if (requestsError) {
        console.error("Error fetching recyclable requests:", requestsError);
        return {
            ok: false,
            status: 500,
            message: RECYCLABLE_ERRORS.FETCH_FAILED
        };
    }

    // Step 4: Return success with data
    return {
        ok: true,
        status: 200,
        message: RECYCLABLE_SUCCESS.REQUESTS_FETCHED,
        data: requests || []
    };
}

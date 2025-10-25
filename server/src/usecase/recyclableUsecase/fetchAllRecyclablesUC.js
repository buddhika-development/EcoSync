import { RECYCLABLE_ERRORS, RECYCLABLE_SUCCESS } from "../../constants/recyclable.constants.js";
import { getAllRecyclableRequests, getCollectorById } from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * @param {string} id 
 * @returns {boolean}
 */
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * @param {string} collectorId 
 * @returns {Promise<Object>} 
 */
export default async function fetchAllRecyclablesUC(collectorId) {

    if (!collectorId || !isValidUUID(collectorId)) {
        return {
            ok: false,
            status: 400,
            message: RECYCLABLE_ERRORS.INVALID_ID
        };
    }


    const { data: collectorData, error: collectorError } = await getCollectorById(collectorId);

    if (collectorError || !collectorData) {
        console.error("Collector lookup error:", collectorError);
        return {
            ok: false,
            status: 404,
            message: "Collector not found"
        };
    }


    const { data: requests, error: requestsError } = await getAllRecyclableRequests(collectorId);

    if (requestsError) {
        console.error("Error fetching recyclable requests:", requestsError);
        return {
            ok: false,
            status: 500,
            message: RECYCLABLE_ERRORS.FETCH_FAILED
        };
    }


    const transformedRequests = (requests || []).map(request => ({
        id: request.recyclable_collect_request_id,
        userId: request.user_id,
        areaId: request.area_id,
        status: request.status,
        type: request.type,
        category: request.category,
        weight: request.weight,
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        users: request.users
    }));


    return {
        ok: true,
        status: 200,
        message: RECYCLABLE_SUCCESS.REQUESTS_FETCHED,
        data: transformedRequests
    };
}

import { RECYCLABLE_ERRORS, RECYCLABLE_SUCCESS } from "../../constants/recyclable.constants.js";
import { getRecyclableRequestById } from "../../repositories/collectorRepository/collectorRepo.js";

/**
 * @param {string} id 
 * @returns {boolean}
 */
function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * @param {string} requestId 
 * @param {string} collectorId
 * @returns {Promise<Object>} 
 */
export default async function fetchRecyclableDetailsUC(requestId, collectorId) {

    if (!requestId || !isValidUUID(requestId)) {
        return {
            ok: false,
            status: 400,
            message: RECYCLABLE_ERRORS.INVALID_ID
        };
    }


    const { data: request, error } = await getRecyclableRequestById(requestId);

    if (error) {
        console.error("Error fetching recyclable request:", error);
        return {
            ok: false,
            status: 500,
            message: RECYCLABLE_ERRORS.FETCH_FAILED
        };
    }

    if (!request) {
        return {
            ok: false,
            status: 404,
            message: RECYCLABLE_ERRORS.NOT_FOUND
        };
    }


    if (request.collector_id && request.collector_id !== collectorId) {
        return {
            ok: false,
            status: 403,
            message: RECYCLABLE_ERRORS.UNAUTHORIZED
        };
    }


    const transformedRequest = {
        id: request.recyclable_collect_request_id,
        userId: request.user_id,
        areaId: request.area_id,
        status: request.status,
        type: request.type,
        category: request.category,
        weight: request.weight,
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        users: request.users,
        area: request.area
    };

    return {
        ok: true,
        status: 200,
        message: RECYCLABLE_SUCCESS.REQUEST_FETCHED,
        data: transformedRequest
    };
}

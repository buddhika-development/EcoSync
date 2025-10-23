import { fail, okay } from "../../../libs/response.js";
import updateRecyclableUC from "../../usecase/recyclableUsecase/updateRecyclableUC.js";

/**
 * Controller for updating recyclable request details
 * SOLID: Single Responsibility - only handles HTTP request/response
 * 
 * @param {Object} req - Express request (expects req.params.requestId, req.body)
 * @param {Object} res - Express response
 */
export default async function updateRecyclableController(req, res) {
    try {
        const { requestId } = req.params;
        const updates = req.body; // { status?, category?, weight? }
        const collectorId = req.user?.uid;

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log(`Updating recyclable request ${requestId}:`, updates);

        // Delegate to use case layer
        const result = await updateRecyclableUC(requestId, updates, collectorId);

        if (!result.ok) {
            return fail(res, result.message, result.status, result.errors ? { fields: result.errors } : undefined);
        }

        return okay(res, result.data, result.message, result.status);
    } catch (error) {
        console.error("Unexpected error in updateRecyclableController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}

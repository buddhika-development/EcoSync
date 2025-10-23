import { fail, okay } from "../../../libs/response.js";
import fetchAllPickupsUC from "../../usecase/collectorUsecase/fetchAllPickupsUC.js";

/**
 * Controller for fetching all pickup routes for a collector
 * SOLID: Single Responsibility - only handles HTTP request/response
 * Design Pattern: Controller Pattern - delegates to use case layer
 * 
 * @param {Object} req - Express request (expects req.user.uid from auth middleware)
 * @param {Object} res - Express response
 */
export default async function fetchAllPickupsController(req, res) {
    try {
        // Get collector ID from authenticated user (set by requireAuth middleware)
        // const collectorId = req.user?.uid;
        const collectorId = '8598c0cf-d287-4495-bb18-e61a7773d635';

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log("Fetching pickup routes for collector:", collectorId);

        // Delegate to use case layer
        const { ok, status, message, data } = await fetchAllPickupsUC(collectorId);

        if (!ok) {
            return fail(res, message, status);
        }

        return okay(res, data, message, status);
    } catch (error) {
        console.error("Unexpected error in fetchAllPickupsController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}
import { fail, okay } from "../../../libs/response.js";
import fetchRecyclableDetailsUC from "../../usecase/recyclableUsecase/fetchRecyclableDetailsUC.js";

/**
 * @param {Object} req 
 * @param {Object} res 
 */
export default async function fetchRecyclableDetailsController(req, res) {
    try {
        const { requestId } = req.params;
        const collectorId = req.user?.uid;

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log("Fetching recyclable request details:", requestId);

        // Delegate to use case layer
        const { ok, status, message, data } = await fetchRecyclableDetailsUC(requestId, collectorId);

        if (!ok) {
            return fail(res, message, status);
        }

        return okay(res, data, message, status);
    } catch (error) {
        console.error("Unexpected error in fetchRecyclableDetailsController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}

import { fail, okay } from "../../../libs/response.js";
import fetchAllPickupsUC from "../../usecase/collectorUsecase/fetchAllPickupsUC.js";

/**
 * @param {Object} req 
 * @param {Object} res 
 */
export default async function fetchAllPickupsController(req, res) {
    try {

        const collectorId = req.user?.uid;

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log("Fetching pickup routes for collector:", collectorId);

        // Delegate to use case
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
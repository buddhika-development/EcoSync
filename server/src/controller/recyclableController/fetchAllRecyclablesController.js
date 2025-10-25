import { fail, okay } from "../../../libs/response.js";
import fetchAllRecyclablesUC from "../../usecase/recyclableUsecase/fetchAllRecyclablesUC.js";

/**
 * @param {Object} req
 * @param {Object} res
 */
export default async function fetchAllRecyclablesController(req, res) {
    try {

        const collectorId = req.user?.uid;

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log("Fetching recyclable requests for collector:", collectorId);


        const { ok, status, message, data } = await fetchAllRecyclablesUC(collectorId);

        if (!ok) {
            return fail(res, message, status);
        }

        return okay(res, data, message, status);
    } catch (error) {
        console.error("Unexpected error in fetchAllRecyclablesController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}

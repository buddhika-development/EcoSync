import { fail, okay } from "../../../libs/response.js";
import fetchPickupDetailsUC from "../../usecase/collectorUsecase/fetchPickupDetailsUC.js";

/**
 * @param {Object} req 
 * @param {Object} res 
 */
export default async function fetchPickupDetailsController(req, res) {
    try {
        const { orderId } = req.params;
        const collectorId = req.user?.uid;

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log("Fetching pickup details for order:", orderId);
        console.log("Fetching pickup details for collector:", collectorId);

        // Delegate to use case 
        const { ok, status, message, data } = await fetchPickupDetailsUC(orderId, collectorId);

        console.log("Fetch pickup details result:", { ok, status, message, data });

        if (!ok) {
            return fail(res, message, status);
        }

        return okay(res, data, message, status);
    } catch (error) {
        console.error("Unexpected error in fetchPickupDetailsController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}

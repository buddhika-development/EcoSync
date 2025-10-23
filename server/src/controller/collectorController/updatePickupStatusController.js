import { fail, okay } from "../../../libs/response.js";
import updatePickupStatusUC from "../../usecase/collectorUsecase/updatePickupStatusUC.js";

/**
 * Controller for updating pickup order status
 * SOLID: Single Responsibility - only handles HTTP request/response
 * 
 * @param {Object} req - Express request (expects req.params.orderId, req.body.status)
 * @param {Object} res - Express response
 */
export default async function updatePickupStatusController(req, res) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const collectorId = req.user?.uid;
        console.log("Collector ID:", collectorId);
        console.log("Order ID:", orderId);
        console.log("Order Status:", status);

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log(`Updating pickup ${orderId} status to:`, status);

        // Delegate to use case layer
        const result = await updatePickupStatusUC(orderId, status, collectorId);


        if (!result.ok) {
            return fail(res, result.message, result.status);
        }

        return okay(res, result.data, result.message, result.status);
    } catch (error) {
        console.error("Unexpected error in updatePickupStatusController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}

import { fail, okay } from "../../../libs/response.js";
import updateBinStatusUC from "../../usecase/collectorUsecase/updateBinStatusUC.js";

/**
 * @param {Object} req 
 * @param {Object} res 
 */
export default async function updateBinStatusController(req, res) {
    try {
        const { binId } = req.params;
        const { bin_status, full_bin_status, order_id, full_bin_id } = req.body;
        const collectorId = req.user?.uid;

        console.log("Full Bin ID:", full_bin_id);

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log(`Updating bin ${binId} status to:`, bin_status, full_bin_status);

        // Delegate to use case layer
        const result = await updateBinStatusUC(binId, bin_status, full_bin_id, full_bin_status, collectorId, order_id);

        if (!result.ok) {
            return fail(res, result.message, result.status);
        }

        return okay(res, result.data, result.message, result.status);
    } catch (error) {
        console.error("Unexpected error in updateBinStatusController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}

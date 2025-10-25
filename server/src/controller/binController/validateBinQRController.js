import { fail, okay } from "../../../libs/response.js";
import validateBinQRCodeUC from "../../usecase/binUsecase/validateBinQRCodeUC.js";


/**
* @param {Object} req - Express request
* @param {Object} res - Express response
*/
export default async function validateBinQRController(req, res) {
    try {
        const { binId, qrCodeLink } = req.body;
        const collectorId = req.user?.uid;

        console.log("━".repeat(50));
        console.log("QR VALIDATION REQUEST");
        console.log("Collector ID:", collectorId);
        console.log("Bin ID:", binId);
        console.log("QR Code Link:", qrCodeLink);
        console.log("━".repeat(50));

        if (!collectorId) {
            console.log("Authentication required!");
            return fail(res, "Authentication required", 401);
        }

        // Delegate to use case layer
        const result = await validateBinQRCodeUC(binId, qrCodeLink, collectorId);

        console.log("QR VALIDATION RESPONSE:");
        console.log("Success:", result.ok);
        console.log("Status Code:", result.status);
        console.log("Message:", result.message);
        console.log("Data:", JSON.stringify(result.data, null, 2));
        console.log("━".repeat(50));

        if (!result.ok) {
            return fail(
                res,
                result.message,
                result.status,
                result.errors ? { fields: result.errors } : result.details ? { details: result.details } : undefined
            );
        }

        return okay(res, result.data, result.message, result.status);
    } catch (error) {
        console.error("Unexpected error in validateBinQRController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}

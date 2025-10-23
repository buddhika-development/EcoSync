import { fail, okay } from "../../../libs/response.js";
import validateBinQRCodeUC from "../../usecase/binUsecase/validateBinQRCodeUC.js";

/**
 * Controller for validating bin QR code before status update
 * 
 * Security Feature: This endpoint must be called BEFORE updating bin status
 * to ensure collector physically scanned the bin's QR code
 * 
 * SOLID: Single Responsibility - only handles HTTP request/response
 * Design Pattern: Controller Pattern - delegates to use case layer
 * 
 * @param {Object} req - Express request
 *   Expected body: { binId: string, qrCodeLink: string }
 * @param {Object} res - Express response
 */
export default async function validateBinQRController(req, res) {
    try {
        const { binId, qrCodeLink } = req.body;
        const collectorId = req.user?.uid;

        if (!collectorId) {
            return fail(res, "Authentication required", 401);
        }

        console.log("QR validation request from collector:", collectorId);

        // Delegate to use case layer
        const result = await validateBinQRCodeUC(binId, qrCodeLink, collectorId);

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

import { fail, okay } from "../../../libs/response.js";
import addNewBinUsecase from "../../usecase/binUsecase/addNewBinUsecase.js";

/**
 * Controller for creating a new bin
 * SOLID: Single Responsibility - only handles HTTP request/response transformation
 * Design Pattern: Controller Pattern - delegates business logic to usecase layer
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export default async function AddNewBinController(req, res) {
    try {
        console.log("Bin data received:", req.body);

        // Delegate business logic to usecase layer (Separation of Concerns)
        const { ok, status, message, data, errors } = await addNewBinUsecase(req.body);

        if (!ok) {
            // Return structured validation or business logic errors
            return fail(res, message, status, errors ? { fields: errors } : undefined);
        }

        // Return success response
        return okay(res, data, message, status);
    } catch (error) {
        // Catch unexpected errors (should be rare if usecase handles errors properly)
        console.error("Unexpected error in AddNewBinController:", error);
        return fail(res, "Internal Server Error", 500);
    }
}
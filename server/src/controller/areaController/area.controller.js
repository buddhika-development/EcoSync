import { fail, okay } from "../../../libs/response.js";
import { getAllAreas } from "../../repositories/areaRepository/areaRepo.js";

/**
 * Controller for fetching all areas
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export async function getAreasController(req, res) {
    try {
        const { data, error } = await getAllAreas();

        if (error) {
            console.error("Error fetching areas:", error);
            return fail(res, "Failed to fetch areas", 500);
        }

        return okay(res, data, "Areas fetched successfully");
    } catch (error) {
        console.error("Error in getAreasController:", error);
        return fail(res, "Internal server error", 500);
    }
}
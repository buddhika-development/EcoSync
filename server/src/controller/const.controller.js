import { ERROR, sendResponse, SUCCESS } from "../../libs/response.js"
import { calculate_recycle_collection_cost, calculate_waste_collected_cost } from "../functions/_calculate_costs.js";

export const _calculate_cost = async( req, res ) => {

    const user_id = await req.params.user_id || null;

    if(user_id === null) {
        return sendResponse(res, ERROR("User ID is required to calculate cost"))
    }

    const waste_collection_cost = await calculate_waste_collected_cost(user_id);
    const recycle_collection_cost = await calculate_recycle_collection_cost(user_id);

    const total_cost = waste_collection_cost.data.total_cost + recycle_collection_cost.data.total_cost;

    const cost_data = {
        waste_collection_cost: waste_collection_cost.data,
        recycle_collection_cost: recycle_collection_cost.data,
        total_cost: total_cost
    }

    if(waste_collection_cost.error) {
        return sendResponse(res, ERROR(waste_collection_cost.message, waste_collection_cost.error))
    }

    return sendResponse(res, SUCCESS(waste_collection_cost.message, cost_data))
}
import { waste_types } from "../../../waste_config.js";
import { ERROR, sendResponse, SUCCESS } from "../../../libs/response.js";
import { _calculate_waste_recycle_coin } from "../../functions/_calculate_recycle_coin.js";

export const _e_waste_controller = async(req, res) => {

    const post_body = await req.body;
    
    // post body data
    const waste_type = post_body["waste-type"].toLowerCase() || null
    const waste_weight = post_body["waste-weight"] || null

    if(!waste_types.includes(waste_type)) {
        return sendResponse(res, 400, ERROR("Invalid api entry point."))
    }

    if( waste_type == null || waste_weight == null ) {
        return sendResponse(res, 400, ERROR("Missing required fields"))
    }

    const recycle_coin_amount = _calculate_waste_recycle_coin(waste_type, waste_weight)

    return sendResponse(res, 200,SUCCESS("E-Waste recycled successfully", {
        "recycle_coin_amount" : recycle_coin_amount,
        "time" : new Date().toISOString()
    }))
}
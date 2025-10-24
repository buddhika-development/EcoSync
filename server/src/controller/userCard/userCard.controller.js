import { ERROR, sendResponse, SUCCESS } from "../../../libs/response.js";
import { access_user_card_details_by_user_id, insert_new_user_card_details } from "../../dbActions/user_card_details.db.js";

export const _get_user_card_details = async (req, res) => {
    const { user_id } = req.params;
    const user_card_details_res = await access_user_card_details_by_user_id(user_id);

    if(user_card_details_res.error) {
        return sendResponse(res, 400, ERROR(user_card_details_res.message, user_card_details_res.error.details));
    }

    return sendResponse(res, 200, SUCCESS(user_card_details_res.message, user_card_details_res.data));
}


export const _insert_new_user_card = async (req, res) => {
    const request_body = await req.body;
    
    const user_id = request_body.user_id || null;
    const card_number = request_body.card_number || null;
    const cvc = request_body.cvc || null;
    const holder_name = request_body.holder_name || null;

    if(user_id === null || card_number === null || cvc === null || holder_name === null) {
        return sendResponse(res, 400, ERROR("Missing required fields: user_id, card_number, cvc, holder_name"));
    }

    const insert_card_response = await insert_new_user_card_details(user_id, card_number, cvc, holder_name);

    if(insert_card_response.error) {
        return sendResponse(res, 400, ERROR(insert_card_response.message, insert_card_response.error.details));
    }

    return sendResponse(res, 200, SUCCESS(insert_card_response.message, insert_card_response.data));
}
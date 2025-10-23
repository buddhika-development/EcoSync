import { response } from "express";
import { ERROR, sendResponse, SUCCESS } from "../../../libs/response.js"
import { acces_single_recycle_coin, insert_new_recycle_coin_user, update_recycle_coin_balance } from "../../dbActions/recycle_coin.db.js";
import { recycle_coin_transaction_types } from '../../../recycle_coin_config.js'

export const _create_new_recycle_coin_user = async (req, res) => {

    const post_request_body = await req.body;
    const user_id = post_request_body.user_id || null;

    if(user_id === null){
        return sendResponse(res, 400, ERROR("Required fields are missing."))
    }
    
    const recycle_coin_user_result = await insert_new_recycle_coin_user(user_id)

    if ( recycle_coin_user_result.error) {
        return sendResponse(res, 400, ERROR(recycle_coin_user_result.message, recycle_coin_user_result.error.details))
    }

    console.log(recycle_coin_user_result)

    return sendResponse(res, 200, SUCCESS(recycle_coin_user_result.message, recycle_coin_user_result.data))
}



export const _update_recycle_coin_balance = async (req, res) => {
    const post_request_body = await req.body;
    const user_id = post_request_body.user_id || null;
    const recycle_coin_transaction_type = post_request_body.transaction_type || null;
    const amount = post_request_body.amount || null;

    if(user_id === null || amount === null || recycle_coin_transaction_type === null){
        return sendResponse(res, 400, ERROR("Required fields are missing."))
    }

    if (!recycle_coin_transaction_types.includes(recycle_coin_transaction_type.toLowerCase())) {
        return sendResponse(res, 400, ERROR("Invalid recycle coin transaction type."))
    }
    
    const user_recycle_coin_details = await acces_single_recycle_coin(user_id)
    let current_recyle_coin_balance = user_recycle_coin_details["data"]["recycle_coin_balance"]
    
    // handle the earn transactions
    if ( recycle_coin_transaction_type.toLowerCase() === "earn") {
        current_recyle_coin_balance += amount
    }
    
    // handle the spend transactions
    if ( recycle_coin_transaction_type.toLowerCase() === "spend" && current_recyle_coin_balance > amount) {
        current_recyle_coin_balance -= amount
    }
    else {
        return sendResponse(res, 400, ERROR("Insufficient recycle coin balance."))
    }
    
    const update_balance_result = await update_recycle_coin_balance(user_id, current_recyle_coin_balance)

    if ( update_balance_result.error) {
        return sendResponse(res, 400, ERROR(update_balance_result.message, update_balance_result.error.details))
    }

    return sendResponse(res, 200, SUCCESS(update_balance_result.message, update_balance_result.data))
}



export const _access_user_recycle_coin_balance = async (req, res) => {
    const user_id = req.params.user_id || null;

    if(user_id === null){
        return sendResponse(res, 400, ERROR("Required fields are missing."))
    }

    const user_recycle_coin_details = await acces_single_recycle_coin(user_id)

    if ( user_recycle_coin_details.error) {
        return sendResponse(res, 400, ERROR(user_recycle_coin_details.message, user_recycle_coin_details.error.details))
    }

    return sendResponse(res, 200, SUCCESS(user_recycle_coin_details.message, user_recycle_coin_details.data))
}
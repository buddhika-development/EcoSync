import { response } from "express";
import { ERROR, sendResponse, SUCCESS } from "../../libs/response.js"
import { acces_single_recycle_coin, insert_new_recycle_coin_user, update_recycle_coin_balance } from "../dbActions/recycle_coin.db.js";

export const _create_new_recycle_coin_user = async (req, res) => {

    const post_request_body = await req.body;
    const user_id = post_request_body.user_id || null;

    if(user_id === null){
        return sendResponse(res, ERROR("Required fields are missing."))
    }
    
    const recycle_coin_user_result = await insert_new_recycle_coin_user(user_id)

    if ( recycle_coin_user_result.error) {
        return sendResponse(res, ERROR(recycle_coin_user_result.message, recycle_coin_user_result.error.details))
    }

    console.log(recycle_coin_user_result)
    
    return sendResponse(res, SUCCESS(recycle_coin_user_result.message, recycle_coin_user_result.data))
}


export const _update_recycle_coin_balance = async (req, res) => {
    const post_request_body = await req.body;
    const user_id = post_request_body.user_id || null;
    const amount = post_request_body.amount || null;

    if(user_id === null || amount === null){
        return sendResponse(res, ERROR("Required fields are missing."))
    }

    const user_recycle_coin_details = await acces_single_recycle_coin(user_id)
    const current_recyle_coin_balance = user_recycle_coin_details["data"]["recycle_coin_balance"]

    const user_new_recycle_coin_balance = current_recyle_coin_balance + amount
    
    const update_balance_result = await update_recycle_coin_balance(user_id, user_new_recycle_coin_balance)

    if ( update_balance_result.error) {
        return sendResponse(res, ERROR(update_balance_result.message, update_balance_result.error.details))
    }

    return sendResponse(res, SUCCESS(update_balance_result.message, update_balance_result.data))
}
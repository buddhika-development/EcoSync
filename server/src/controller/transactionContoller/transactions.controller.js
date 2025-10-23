import { ERROR, sendResponse, SUCCESS } from "../../../libs/response.js"
import { _insert_transaction } from "../../dbActions/transaction.db.js"

export const _new_transaction = async (req, res) => {
    
    const request_body = await req.body
    const user_id = request_body.user_id || null
    const transaction_amount = request_body.transaction_amount || null

    if(user_id === null || transaction_amount === null) {
        return sendResponse(res, 400, ERROR("Missing required fields: user_id and transaction_amount"))
    }

    const transaction_response = await _insert_transaction(user_id, transaction_amount)

    if(transaction_response.error) {
        return sendResponse(res, 400, ERROR(transaction_response.message, transaction_response.error.details))
    }

    return sendResponse(res, 200, SUCCESS(transaction_response.message, transaction_response.data))
}

export const _get_user_transactions = async (req, res) => {
    return sendResponse(res, 200, SUCCESS("Get user transactions endpoint is under construction"))
}
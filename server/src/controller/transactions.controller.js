import { sendResponse, SUCCESS } from "../../libs/response.js"

export const _new_transaction = (req, res) => {
    return sendResponse(res, SUCCESS("Transaction endpoint is under construction"))
}

export const _get_user_transactions = (req, res) => {
    return sendResponse(res, SUCCESS("Get user transactions endpoint is under construction"))
}
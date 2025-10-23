import { Router } from "express";
import { sendResponse, SUCCESS } from "../../libs/response.js";
import { _get_user_transactions, _new_transaction } from "../controller/transactions.controller.js";

const transaction_router = Router()

transaction_router.get('/health', (req, res) => {
    sendResponse(res, SUCCESS('Transaction API is healthy'))
})

transaction_router.post('/new-transaction', _new_transaction)

transaction_router.get('/user-transactions/:user_id', _get_user_transactions)

export default transaction_router
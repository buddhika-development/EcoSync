import { Router } from "express";
import { sendResponse, SUCCESS } from "../../libs/response.js";
import { _access_user_recycle_coin_balance, _create_new_recycle_coin_user, _update_recycle_coin_balance } from "../controller/recycle_coin.controller.js";

const recycle_coin_router = Router()

recycle_coin_router.get('/health', (req, res) => {
    return sendResponse(res, SUCCESS("Recycle Coin API is healthy"))
})

recycle_coin_router.get('/user/recycle-coin/:user_id', _access_user_recycle_coin_balance)
recycle_coin_router.post('/new-recycle-coin-user', _create_new_recycle_coin_user)
recycle_coin_router.post('/update-recycle-coin-balance', _update_recycle_coin_balance)

export default recycle_coin_router
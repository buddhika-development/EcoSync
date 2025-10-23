import { Router } from "express";
import { sendResponse, SUCCESS } from "../../libs/response.js";
import { _calculate_cost } from "../controller/costController/cost.controller.js";

const cost_router = Router()

cost_router.get('/health', (req, res) => {
    return sendResponse(res, 200, SUCCESS("Costs API is healthy"))
})

cost_router.get('/calculate_cost/:user_id', _calculate_cost)

export default cost_router
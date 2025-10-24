import { Router } from "express";
import { ERROR, sendResponse, SUCCESS } from "../../libs/response.js";
import { _e_waste_controller } from "../controller/wasteController/waste.controller.js";

const recycle_router = Router()

// check the health of the recycle API
recycle_router.get('/health', (req, res) => {
    sendResponse(res, 200, SUCCESS("Recycle API is healthy"))
})

// recycle endpoint => e wast
recycle_router.post('/waste', _e_waste_controller)

export default recycle_router
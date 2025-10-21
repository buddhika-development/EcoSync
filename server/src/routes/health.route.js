import { Router } from "express";
import { sendResponse, SUCCESS } from "../../libs/response.js";

const health_router = Router()

health_router.get('/', (req ,res) => {
    sendResponse(res, SUCCESS(
        "API endpoint is health."
    ))
})


health_router.get('/status', (req ,res) => {
    const uptime = process.uptime();
    const environment = process.env.NODE_ENV || "development";
    const version = "1.0.0";
    sendResponse(res, SUCCESS({
        timestamp: new Date().toISOString(),
        uptime: uptime,
        environment: environment,
        version: version
    }))
})

export default health_router
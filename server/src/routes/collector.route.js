import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireRole } from "../middleware/auth.js";
import fetchAllPickupsController from "../controller/collectorController/fetchAllPickupsController.js";
import fetchPickupDetailsController from "../controller/collectorController/fetchPickupDetailsController.js";
import updatePickupStatusController from "../controller/collectorController/updatePickupStatusController.js";
import updateBinStatusController from "../controller/collectorController/updateBinStatusController.js";

const collectorRouter = Router();


const readLimiter = rateLimit({
    windowMs: 60_000, // 1 minute
    max: 60, // 60 requests per minute
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});


const updateLimiter = rateLimit({
    windowMs: 60_000, // 1 minute
    max: 30, // 30 updates per minute
    message: "Too many update requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});


collectorRouter.get(
    '/pickups',
    readLimiter,
    requireAuth,
    requireRole('collector'),
    fetchAllPickupsController
);


collectorRouter.get(
    '/pickups/:orderId',
    readLimiter,
    requireAuth,
    requireRole('collector'),
    fetchPickupDetailsController
);


collectorRouter.patch(
    '/pickups/:orderId/status',
    requireAuth,
    requireRole('collector'),
    updateLimiter,
    updatePickupStatusController
);


collectorRouter.patch(
    '/bins/:binId/status',
    requireAuth,
    requireRole('collector'),
    updateLimiter,
    updateBinStatusController
);

export default collectorRouter;
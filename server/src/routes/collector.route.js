import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireRole } from "../middleware/auth.js";
import fetchAllPickupsController from "../controller/collectorController/fetchAllPickupsController.js";
import fetchPickupDetailsController from "../controller/collectorController/fetchPickupDetailsController.js";
import updatePickupStatusController from "../controller/collectorController/updatePickupStatusController.js";
import updateBinStatusController from "../controller/collectorController/updateBinStatusController.js";

const collectorRouter = Router();

/**
 * Rate limiter for read operations
 */
const readLimiter = rateLimit({
    windowMs: 60_000, // 1 minute
    max: 60, // 60 requests per minute
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for update operations
 */
const updateLimiter = rateLimit({
    windowMs: 60_000, // 1 minute
    max: 30, // 30 updates per minute
    message: "Too many update requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * All routes require authentication and collector role
 * Design Pattern: Chain of Responsibility - middleware chain handles auth
 */

/**
 * GET /api/collector/pickups
 * Get all pickup orders for authenticated collector
 */
collectorRouter.get(
    '/pickups',
    readLimiter,
    requireAuth,
    requireRole('collector'),
    fetchAllPickupsController
);

/**
 * GET /api/collector/pickups/:orderId
 * Get detailed bins for a specific pickup order
 */
collectorRouter.get(
    '/pickups/:orderId',
    readLimiter,
    requireAuth,
    requireRole('collector'),
    fetchPickupDetailsController
);

/**
 * PATCH /api/collector/pickups/:orderId/status
 * Update pickup order status (pending → in_progress → completed)
 */
collectorRouter.patch(
    '/pickups/:orderId/status',
    requireAuth,
    requireRole('collector'),
    updateLimiter,
    updatePickupStatusController
);

/**
 * PATCH /api/collector/bins/:binId/status
 * Update bin status when collected (FULL → EMPTY)
 */
collectorRouter.patch(
    '/bins/:binId/status',
    requireAuth,
    requireRole('collector'),
    updateLimiter,
    updateBinStatusController
);

export default collectorRouter;
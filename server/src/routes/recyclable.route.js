import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireRole } from "../middleware/auth.js";
import fetchAllRecyclablesController from "../controller/recyclableController/fetchAllRecyclablesController.js";
import fetchRecyclableDetailsController from "../controller/recyclableController/fetchRecyclableDetailsController.js";
import updateRecyclableController from "../controller/recyclableController/updateRecyclableController.js";

const recyclableRouter = Router();

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
 * GET /api/recyclable/requests
 * Get all recyclable requests for authenticated collector
 */
recyclableRouter.get(
    '/requests',
    requireAuth,
    requireRole('collector'),
    readLimiter,
    fetchAllRecyclablesController
);

/**
 * GET /api/recyclable/requests/:requestId
 * Get specific recyclable request details
 */
recyclableRouter.get(
    '/requests/:requestId',
    requireAuth,
    requireRole('collector'),
    readLimiter,
    fetchRecyclableDetailsController
);

/**
 * PATCH /api/recyclable/requests/:requestId
 * Update recyclable request (claim, update category, weight, status)
 * Body: { status?, category?, weight? }
 */
recyclableRouter.patch(
    '/requests/:requestId',
    requireAuth,
    requireRole('collector'),
    updateLimiter,
    updateRecyclableController
);

export default recyclableRouter;
import express from "express";
import CreateRecyclableRequestController from "../controller/recyclablesController/createRecyclableRequest.controller.js";
import { GetMyRecyclableRequestsController } from "../controller/recyclablesController/getMyRecyclableRequests.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";
import fetchAllRecyclablesController from "../controller/recyclableController/fetchAllRecyclablesController.js";
import fetchRecyclableDetailsController from "../controller/recyclableController/fetchRecyclableDetailsController.js";
import updateRecyclableController from "../controller/recyclableController/updateRecyclableController.js";

const recyclablesRouter = express.Router();

// Apply requireAuth middleware when ready (testing now)
recyclablesRouter.post("/create", CreateRecyclableRequestController);
recyclablesRouter.get('/requests/history', requireAuth, GetMyRecyclableRequestsController);

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
recyclablesRouter.get(
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
recyclablesRouter.get(
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
recyclablesRouter.patch(
    '/requests/:requestId/status',
    requireAuth,
    requireRole('collector'),
    updateLimiter,
    updateRecyclableController
);

export default recyclablesRouter;

import express from "express";
import CreateRecyclableRequestController from "../controller/recyclablesController/createRecyclableRequest.controller.js";
import { GetMyRecyclableRequestsController } from "../controller/recyclablesController/getMyRecyclableRequests.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";
import fetchAllRecyclablesController from "../controller/recyclableController/fetchAllRecyclablesController.js";
import fetchRecyclableDetailsController from "../controller/recyclableController/fetchRecyclableDetailsController.js";
import updateRecyclableController from "../controller/recyclableController/updateRecyclableController.js";

const recyclablesRouter = express.Router();


recyclablesRouter.post("/create", CreateRecyclableRequestController);
recyclablesRouter.get('/requests/history', requireAuth, GetMyRecyclableRequestsController);

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

recyclablesRouter.get(
    '/requests',
    requireAuth,
    requireRole('collector'),
    readLimiter,
    fetchAllRecyclablesController
);


recyclablesRouter.get(
    '/requests/:requestId',
    requireAuth,
    requireRole('collector'),
    readLimiter,
    fetchRecyclableDetailsController
);


recyclablesRouter.patch(
    '/requests/:requestId/status',
    requireAuth,
    requireRole('collector'),
    updateLimiter,
    updateRecyclableController
);

export default recyclablesRouter;

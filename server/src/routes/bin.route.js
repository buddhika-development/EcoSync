import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';

import AddNewBinController from '../controller/binController/bincontroller.js';
import makeGetMyBinsController from "../controller/binController/getMyBins.controller.js";
import MarkBinFullController from "../controller/binController/markBinFull.controller.js";
import getMyFullBinStatusController from '../controller/binController/getMyFullBinStatus.controller.js';

import makeGetUserBinsUsecase from '../usecase/binUsecase/getUserBinUsecase.js';
import * as binRepository from "../repositories/binRepository/binRepo.js";

const binRouter = Router();

/**
 * Rate limiter for bin creation
 * Prevents abuse: max 10 bin creations per minute per IP
 */
const createBinLimiter = rateLimit({
    windowMs: 60_000, // 1 minute
    max: 10,
    message: 'Too many bin creation requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const readMyBinsLimiter = rateLimit({
  windowMs: 30_000,
  max: 30,
  message: "Too many requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

const getUserBinsUsecase = makeGetUserBinsUsecase({ binRepository });
const GetMyBinsController = makeGetMyBinsController({ getUserBinsUsecase });

/**
 * POST /api/bins
 * Create a new waste bin
 * Auth: Required (any authenticated user can create bins)
 * Rate Limited: 10 requests/minute
 */

binRouter.post('/add-new', createBinLimiter, AddNewBinController);
binRouter.get("/my", (req, _res, next) => {
    // put an existing users.user_id here (UUID from your DB)
    req.user = { id: "fc05b32f-2090-4517-ac16-e1fd299ceec4" };
    next();
  }, readMyBinsLimiter, GetMyBinsController);
binRouter.post("/:id/mark-full", MarkBinFullController);
binRouter.get("/mine", requireAuth, getMyFullBinStatusController);

export default binRouter;

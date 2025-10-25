import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../middleware/auth.js';
import validateBinQRController from '../controller/binController/validateBinQRController.js';
import AddNewBinController from '../controller/binController/bincontroller.js';
import makeGetMyBinsController from "../controller/binController/getMyBins.controller.js";
import MarkBinFullController from "../controller/binController/markBinFull.controller.js";
import getMyFullBinStatusController from '../controller/binController/getMyFullBinStatus.controller.js';
import { GetBinHistoryController } from '../controller/binController/binHistory.controller.js';

import makeGetUserBinsUsecase from '../usecase/binUsecase/getUserBinUsecase.js';
import * as binRepository from "../repositories/binRepository/binRepo.js";

const binRouter = Router();

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


const qrValidationLimiter = rateLimit({
    windowMs: 60_000, // 1 minute
    max: 500, // 500 QR scans per minute
    message: 'Too many QR validation requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});



binRouter.post(
    '/validate-qr',
    requireAuth,
    requireRole('collector'),
    qrValidationLimiter,
    validateBinQRController
);

binRouter.post('/add-new', createBinLimiter, requireAuth, AddNewBinController);
binRouter.get("/my", requireAuth, readMyBinsLimiter, GetMyBinsController);
binRouter.post("/:id/mark-full", requireAuth, MarkBinFullController);
binRouter.get("/mine", requireAuth, getMyFullBinStatusController);
binRouter.get("/:binId/history", requireAuth, GetBinHistoryController);

export default binRouter;

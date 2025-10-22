import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import AddNewBinController from '../controller/binController/bincontroller.js';

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

/**
 * POST /api/bins
 * Create a new waste bin
 * Auth: Required (any authenticated user can create bins)
 * Rate Limited: 10 requests/minute
 */
binRouter.post('/add-new', createBinLimiter, AddNewBinController);

export default binRouter;

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../middleware/auth.js';
import AddNewBinController from '../controller/binController/bincontroller.js';
import validateBinQRController from '../controller/binController/validateBinQRController.js';

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
 * Rate limiter for QR validation
 * Higher limit because collectors scan many bins during route
 */
const qrValidationLimiter = rateLimit({
    windowMs: 60_000, // 1 minute
    max: 100, // 100 QR scans per minute
    message: 'Too many QR validation requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /api/bins/add-new
 * Create a new waste bin
 * Auth: Required (any authenticated user can create bins)
 * Rate Limited: 10 requests/minute
 */
binRouter.post('/add-new', requireAuth, createBinLimiter, AddNewBinController);

/**
 * POST /api/bins/validate-qr
 * Validate QR code before updating bin status
 * 
 * Security Feature: Prevents collectors from updating bin status without
 * physically scanning the bin's QR code
 * 
 * Auth: Required (collector role only)
 * Rate Limited: 100 requests/minute
 * 
 * Request Body:
 * {
 *   "binId": "uuid",           // ID of bin to update
 *   "qrCodeLink": "ecosync://bin/token" // Scanned QR code
 * }
 */
binRouter.post(
    '/validate-qr',
    requireAuth,
    requireRole('collector'),
    qrValidationLimiter,
    validateBinQRController
);

export default binRouter;

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import createUser from '../controller/userController/createUser.js';
// import { requireAuth, requireRole } from '../middleware/auth.js'; // you said you already have these

const userRouter = Router();

const createLimiter = rateLimit({
    windowMs: 60_000, // per minute
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/users  (admin only)
userRouter.post('/', createLimiter, createUser);

export default userRouter;

import { Router } from 'express';
import loginController from '../controller/authController/login.js';

const authRouter = Router();

authRouter.post('/login', loginController);

export default authRouter;

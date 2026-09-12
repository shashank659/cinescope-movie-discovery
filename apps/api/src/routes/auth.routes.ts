import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateBody, registerSchema, loginSchema } from '../validators/auth.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.get('/me', requireAuth, authController.getMe);
authRouter.post('/logout', authController.logout);

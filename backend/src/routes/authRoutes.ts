import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validateMiddleware';
import { requireAuth } from '../middleware/authMiddleware';
import { loginSchema, registerSchema } from '../schemas/authSchemas';
import { asyncHandler } from '../utils/asyncHandler';

export const authRoutes = Router();

authRoutes.post('/register', validateRequest({ body: registerSchema }), asyncHandler(authController.register as any));
authRoutes.post('/login', validateRequest({ body: loginSchema }), asyncHandler(authController.login as any));
authRoutes.get('/me', requireAuth, asyncHandler(authController.getCurrentUser as any));
authRoutes.post('/logout', requireAuth, asyncHandler(authController.logout as any));

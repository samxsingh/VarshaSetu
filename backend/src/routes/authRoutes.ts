import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validateMiddleware';
import { requireAuth } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimitMiddleware';
import { loginSchema, registerSchema } from '../schemas/authSchemas';
import { asyncHandler } from '../utils/asyncHandler';

export const authRoutes = Router();

authRoutes.post('/register', authRateLimiter, validateRequest({ body: registerSchema }), asyncHandler(authController.register as any));
authRoutes.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), asyncHandler(authController.login as any));
authRoutes.post('/demo-login', authRateLimiter, asyncHandler(authController.demoLogin as any));
authRoutes.post('/refresh', authRateLimiter, asyncHandler(authController.refresh as any));
authRoutes.get('/me', requireAuth, asyncHandler(authController.getCurrentUser as any));
authRoutes.post('/logout', requireAuth, asyncHandler(authController.logout as any));

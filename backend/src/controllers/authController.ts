import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { sendSuccess } from '../utils/responseEnvelope';
import { BadRequestError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

export const authController = {
  async register(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const result = await authService.register({
      ...req.body,
      ipAddress: req.ip,
    });
    return sendSuccess(res, result, undefined, 201);
  },

  async login(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const result = await authService.login({
      ...req.body,
      ipAddress: req.ip,
    });
    return sendSuccess(res, result);
  },

  async refresh(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new BadRequestError('Refresh token is required in request body or X-Refresh-Token header');
    }
    const result = await authService.refresh(refreshToken);
    return sendSuccess(res, result);
  },

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const user = await authService.getCurrentUser(req.user!.id);
    return sendSuccess(res, user);
  },

  async logout(_req: AuthenticatedRequest, res: Response): Promise<Response> {
    // JWT is stateless; client removes token from localStorage.
    return sendSuccess(res, { message: 'Logged out successfully' });
  },
};

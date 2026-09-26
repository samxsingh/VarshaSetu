import { Response } from 'express';
import { auditRepository } from '../repositories/auditRepository';
import { sendSuccess } from '../utils/responseEnvelope';
import { AuthenticatedRequest } from '../types';

export const auditController = {
  async listLogs(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const result = await auditRepository.list(limit, offset);
    return sendSuccess(res, result.rows, {
      total: result.total,
      limit,
      offset,
    });
  },
};

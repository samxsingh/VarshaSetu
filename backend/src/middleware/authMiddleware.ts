import { Response, NextFunction } from 'express';
import { verifyAuthToken } from '../utils/jwt';
import { userRepository } from '../repositories/userRepository';
import { UnauthorizedError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAuthToken(token);
    const userRow = await userRepository.findById(payload.userId);

    if (!userRow || !userRow.is_active) {
      return next(new UnauthorizedError('User does not exist or has been disabled'));
    }

    req.user = {
      id: userRow.id,
      role: userRow.role,
      permissions: userRow.permissions,
      fullName: userRow.full_name,
      phoneNumber: userRow.phone_number,
      email: userRow.email,
      assignedLocationId: userRow.assigned_location_id,
    };

    next();
  } catch (err: any) {
    return next(new UnauthorizedError('Invalid or expired authentication token', { original: err.message }));
  }
}

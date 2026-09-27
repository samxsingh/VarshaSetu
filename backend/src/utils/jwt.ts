import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthSessionTokenPayload, UserRole, PermissionScope } from '@shared/types';

export function signAuthToken(payload: {
  userId: string;
  role: UserRole;
  permissions: PermissionScope[];
  assignedLocationId?: string;
}): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as any,
  };
  return jwt.sign({ ...payload, sub: payload.userId }, env.JWT_SECRET, options);
}

export function verifyAuthToken(token: string): AuthSessionTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as any;
  return {
    ...decoded,
    userId: decoded.userId || decoded.sub,
  } as AuthSessionTokenPayload;
}

export function signRefreshToken(payload: { userId: string; role?: UserRole }): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  };
  return jwt.sign(
    { sub: payload.userId, userId: payload.userId, role: payload.role, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    options
  );
}

export function verifyRefreshToken(token: string): { userId: string; sub: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return { userId: decoded.userId || decoded.sub, sub: decoded.sub || decoded.userId };
}

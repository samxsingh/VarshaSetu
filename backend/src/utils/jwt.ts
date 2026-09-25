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
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAuthToken(token: string): AuthSessionTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthSessionTokenPayload;
}

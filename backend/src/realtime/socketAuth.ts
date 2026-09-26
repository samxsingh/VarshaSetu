import { Socket } from 'socket.io';
import { verifyAuthToken } from '../utils/jwt';
import { AuthenticatedSocketUser, ClientToServerEvents, ServerToClientEvents, SocketData } from './types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function socketAuthMiddleware(
  socket: TypedSocket,
  next: (err?: Error) => void
): void {
  try {
    let token: string | undefined;

    // 1. Auth payload
    if (socket.handshake.auth && typeof socket.handshake.auth.token === 'string') {
      token = socket.handshake.auth.token;
    }

    // 2. Authorization header
    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else {
        token = authHeader.trim();
      }
    }

    // 3. Query parameter fallback
    if (!token && socket.handshake.query && typeof socket.handshake.query.token === 'string') {
      token = socket.handshake.query.token;
    }

    if (!token) {
      return next(new Error('AUTHENTICATION_REQUIRED: Valid JWT token must be provided via auth.token or Authorization header'));
    }

    const payload = verifyAuthToken(token);

    if (!payload || !payload.userId || !payload.role) {
      return next(new Error('AUTHENTICATION_FAILED: Malformed token payload'));
    }

    const user: AuthenticatedSocketUser = {
      userId: payload.userId,
      role: payload.role,
      permissions: payload.permissions || [],
      assignedLocationId: payload.assignedLocationId,
    };

    socket.data.user = user;
    next();
  } catch (err: any) {
    const message = err?.message || 'Authentication error';
    return next(new Error(`AUTHENTICATION_FAILED: ${message}`));
  }
}

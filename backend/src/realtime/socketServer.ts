import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketAuthMiddleware } from './socketAuth';
import { canJoinRoom, getAutomaticRooms } from './socketRooms';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types';

let ioInstance: SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData> | null = null;

export function initSocketServer(
  httpServer: http.Server
): SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData> {
  if (ioInstance) {
    return ioInstance;
  }

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
    cors: {
      origin: '*', // Handled securely via auth middleware & reverse proxy in production
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
    pingTimeout: 20000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // Authoritative JWT Authentication Middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>) => {
    const user = socket.data.user;

    // Join automatic authorized rooms
    const autoRooms = getAutomaticRooms(user);
    for (const room of autoRooms) {
      socket.join(room);
    }

    // Client requests to join a room
    socket.on('room:join', (room: string, callback) => {
      const authResult = canJoinRoom(user, room);

      if (authResult.allowed) {
        socket.join(room);
        socket.emit('room:joined', { room, timestamp: new Date().toISOString() });
        if (callback) {
          callback({ success: true, room });
        }
      } else {
        const error = authResult.reason || 'Unauthorized room request';
        socket.emit('room:error', { room, error });
        if (callback) {
          callback({ success: false, room, error });
        }
      }
    });

    // Client requests to leave a room
    socket.on('room:leave', (room: string, callback) => {
      socket.leave(room);
      socket.emit('room:left', { room, timestamp: new Date().toISOString() });
      if (callback) {
        callback({ success: true, room });
      }
    });

    // Health ping
    socket.on('ping:health', (callback) => {
      if (typeof callback === 'function') {
        callback({
          status: 'OK',
          timestamp: new Date().toISOString(),
          role: user.role,
        });
      }
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData> {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized yet. Call initSocketServer() first.');
  }
  return ioInstance;
}

export function isSocketInitialized(): boolean {
  return ioInstance !== null;
}

export function closeSocketServer(): Promise<void> {
  return new Promise((resolve) => {
    if (ioInstance) {
      ioInstance.close(() => {
        ioInstance = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

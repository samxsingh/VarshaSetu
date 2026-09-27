import { io, Socket } from 'socket.io-client';
import { useRealtimeStore } from '../stores/useRealtimeStore';
import { env } from '../config/env';

// Safe storage accessor
const getSafeStorage = (): Storage | null => {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Fallback if inaccessible
  }
  return null;
};

class SocketClientManager {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private isExplicitlyDisconnected = false;

  public connect(tokenOverride?: string): Socket | null {
    if (typeof window === 'undefined') return null;

    const token = tokenOverride || getSafeStorage()?.getItem('varshasetu_token');
    if (!token) {
      this.disconnect();
      return null;
    }

    // Reuse existing healthy socket if token matches
    if (this.socket && this.currentToken === token && this.socket.connected) {
      return this.socket;
    }

    // Disconnect stale socket if token changed
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = token;
    this.isExplicitlyDisconnected = false;
    useRealtimeStore.getState().setConnectionStatus('CONNECTING');

    // In dev / production, connect through env.WS_URL or window.location.origin (proxied by Vite/Express)
    const socketUrl = env.WS_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5001');

    const socket = io(socketUrl, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection lifecycle
    socket.on('connect', () => {
      useRealtimeStore.getState().setConnectionStatus('CONNECTED');
    });

    socket.on('disconnect', (reason) => {
      if (this.isExplicitlyDisconnected) {
        useRealtimeStore.getState().setConnectionStatus('DISCONNECTED');
      } else {
        useRealtimeStore.getState().setConnectionStatus('RECONNECTING', `Disconnected: ${reason}`);
      }
    });

    socket.on('connect_error', (error) => {
      useRealtimeStore.getState().setConnectionStatus('ERROR', error.message);
    });

    socket.io.on('reconnect_attempt', () => {
      useRealtimeStore.getState().setConnectionStatus('RECONNECTING');
    });

    // Realtime scientific domain events
    socket.on('event:created', (data) => {
      useRealtimeStore.getState().addEvent(data);
    });

    socket.on('event:updated', (data) => {
      useRealtimeStore.getState().updateEvent(data);
    });

    socket.on('event:acknowledged', (data) => {
      useRealtimeStore.getState().updateEvent(data);
    });

    socket.on('event:resolved', (data) => {
      useRealtimeStore.getState().updateEvent(data);
    });

    socket.on('event:expired', (data) => {
      useRealtimeStore.getState().updateEvent(data);
    });

    socket.on('forecast:updated', (data) => {
      useRealtimeStore.getState().addForecastUpdate(data);
    });

    socket.on('data_health:updated', (data) => {
      useRealtimeStore.getState().setDataHealth(data);
    });

    socket.on('notification:received', (data) => {
      useRealtimeStore.getState().addNotification(data);
    });

    socket.on('operation:signal', (data) => {
      useRealtimeStore.getState().addOperationalSignal(data);
    });

    socket.on('inspection:created', (data) => {
      useRealtimeStore.getState().addOrUpdateInspectionAction(data);
    });

    socket.on('inspection:assigned', (data) => {
      useRealtimeStore.getState().addOrUpdateInspectionAction(data);
    });

    socket.on('inspection:started', (data) => {
      useRealtimeStore.getState().addOrUpdateInspectionAction(data);
    });

    socket.on('inspection:completed', (data) => {
      useRealtimeStore.getState().addOrUpdateInspectionAction(data);
    });

    socket.on('inspection:cancelled', (data) => {
      useRealtimeStore.getState().addOrUpdateInspectionAction(data);
    });

    this.socket = socket;
    return socket;
  }

  public disconnect(): void {
    this.isExplicitlyDisconnected = true;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
    useRealtimeStore.getState().setConnectionStatus('DISCONNECTED');
  }

  public joinRoom(room: string): Promise<{ success: boolean; room: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve({ success: false, room, error: 'Socket is not connected' });
        return;
      }
      this.socket.emit('room:join', room, (response: any) => {
        resolve(response || { success: true, room });
      });
    });
  }

  public leaveRoom(room: string): Promise<{ success: boolean; room: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve({ success: false, room });
        return;
      }
      this.socket.emit('room:leave', room, (response: any) => {
        resolve(response || { success: true, room });
      });
    });
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }
}

export const socketClient = new SocketClientManager();

import { create } from 'zustand';
import { UserEntity, UserRole } from '@shared/types';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';
import { useAppStore } from './useAppStore';
import { socketClient } from '../services/socketClient';

export type AuthStatus = 'IDLE' | 'AUTH_INITIALIZING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

interface AuthState {
  user: UserEntity | null;
  token: string | null;
  refreshToken: string | null;
  authStatus: AuthStatus;
  error: string | null;

  initAuth: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<UserEntity>;
  register: (payload: RegisterPayload) => Promise<UserEntity>;
  logout: () => Promise<void>;
  setUser: (user: UserEntity | null) => void;
  clearError: () => void;
}

const getSafeStorage = (): Storage | null => {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Fallback if localStorage is disabled or restricted
  }
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getSafeStorage()?.getItem('varshasetu_token') || null,
  refreshToken: getSafeStorage()?.getItem('varshasetu_refresh_token') || null,
  authStatus: 'IDLE',
  error: null,

  initAuth: async () => {
    const storage = getSafeStorage();
    const existingToken = storage?.getItem('varshasetu_token') || null;
    const existingRefreshToken = storage?.getItem('varshasetu_refresh_token') || null;

    if (!existingToken && !existingRefreshToken) {
      set({
        user: null,
        token: null,
        refreshToken: null,
        authStatus: 'UNAUTHENTICATED',
        error: null,
      });
      return;
    }

    set({ authStatus: 'AUTH_INITIALIZING', error: null });

    try {
      if (existingToken) {
        const meRes = await authService.getMe();
        if (meRes.success && meRes.data) {
          const user = meRes.data;
          set({
            user,
            token: existingToken,
            refreshToken: existingRefreshToken,
            authStatus: 'AUTHENTICATED',
            error: null,
          });
          // Synchronize role with AppStore for operational perspective consistency
          useAppStore.getState().setRole(user.role);
          try {
            socketClient.connect(existingToken);
          } catch {}
          return;
        }
      }

      // If token expired but refresh token exists, attempt refresh
      if (existingRefreshToken) {
        const refreshRes = await authService.refresh(existingRefreshToken);
        if (refreshRes.success && refreshRes.data) {
          const { token, refreshToken, user } = refreshRes.data;
          set({
            user,
            token,
            refreshToken: refreshToken || existingRefreshToken,
            authStatus: 'AUTHENTICATED',
            error: null,
          });
          useAppStore.getState().setRole(user.role);
          try {
            socketClient.connect(token);
          } catch {}
          return;
        }
      }

      // If both fail
      authService.clearTokens();
      try {
        socketClient.disconnect();
      } catch {}
      set({
        user: null,
        token: null,
        refreshToken: null,
        authStatus: 'UNAUTHENTICATED',
        error: null,
      });
    } catch (err: any) {
      authService.clearTokens();
      try {
        socketClient.disconnect();
      } catch {}
      set({
        user: null,
        token: null,
        refreshToken: null,
        authStatus: 'UNAUTHENTICATED',
        error: err?.message || 'Authentication session expired',
      });
    }
  },

  login: async (payload: LoginPayload) => {
    set({ error: null });
    try {
      const res = await authService.login(payload);
      if (!res.data) {
        throw new Error('Authentication failed: Missing response payload');
      }

      const { token, refreshToken, user } = res.data;
      set({
        user,
        token,
        refreshToken: refreshToken || null,
        authStatus: 'AUTHENTICATED',
        error: null,
      });

      // Synchronize operational perspective
      useAppStore.getState().setRole(user.role);
      try {
        socketClient.connect(token);
      } catch {}
      return user;
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      set({ error: msg });
      throw err;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ error: null });
    try {
      const res = await authService.register(payload);
      if (!res.data) {
        throw new Error('Registration failed: Missing response payload');
      }

      const { token, refreshToken, user } = res.data;
      set({
        user,
        token,
        refreshToken: refreshToken || null,
        authStatus: 'AUTHENTICATED',
        error: null,
      });

      useAppStore.getState().setRole(user.role);
      try {
        socketClient.connect(token);
      } catch {}
      return user;
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      set({ error: msg });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      authService.clearTokens();
      try {
        socketClient.disconnect();
      } catch {}
      set({
        user: null,
        token: null,
        refreshToken: null,
        authStatus: 'UNAUTHENTICATED',
        error: null,
      });
    }
  },

  setUser: (user: UserEntity | null) => {
    set({ user, authStatus: user ? 'AUTHENTICATED' : 'UNAUTHENTICATED' });
    if (user?.role) {
      useAppStore.getState().setRole(user.role);
    }
  },

  clearError: () => set({ error: null }),
}));

// Setup global event listeners to sync store with Axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('varshasetu:unauthorized', () => {
    try {
      socketClient.disconnect();
    } catch {}
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      authStatus: 'UNAUTHENTICATED',
    });
  });

  window.addEventListener('varshasetu:token-refreshed', (event: any) => {
    const detail = event.detail;
    if (detail?.token) {
      useAuthStore.setState((state) => ({
        token: detail.token,
        user: detail.user || state.user,
        authStatus: 'AUTHENTICATED',
      }));
      try {
        socketClient.connect(detail.token);
      } catch {}
    }
  });
}

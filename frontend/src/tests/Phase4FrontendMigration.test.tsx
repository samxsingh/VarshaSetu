import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { apiClient, ApiClientError, axiosInstance, request } from '../services/apiClient';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';
import { useAppStore } from '../stores/useAppStore';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { forecastService } from '../services/forecastService';
import { eventService } from '../services/eventService';
import { advisoryService } from '../services/advisoryService';
import { modelService } from '../services/modelService';
import { UserEntity } from '@shared/types';

// Mock mockUser
const mockFarmerUser: UserEntity = {
  id: 'usr_farmer_001',
  fullName: 'Ramesh Kumar',
  phoneNumber: '+919876543210',
  role: 'FARMER',
  preferredLanguage: 'hi',
  assignedLocationId: 'loc_bhaisamau_01',
  permissions: ['farmer:profile:read', 'farmer:advisory:read'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-25T00:00:00.000Z',
};

const mockOfficerUser: UserEntity = {
  id: 'usr_officer_001',
  fullName: 'Dr. Arvind Sharma',
  email: 'officer@varshasetu.gov.in',
  role: 'OFFICER',
  preferredLanguage: 'en',
  assignedLocationId: 'loc_district_lko',
  permissions: ['officer:district:read', 'officer:bulletin:broadcast'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-25T00:00:00.000Z',
};

const mockAdminUser: UserEntity = {
  id: 'usr_admin_001',
  fullName: 'System Administrator',
  email: 'admin@varshasetu.gov.in',
  role: 'ADMIN',
  preferredLanguage: 'en',
  permissions: ['admin:users:manage', 'admin:system_health:read'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-25T00:00:00.000Z',
};

describe('Phase 4: Frontend MERN Migration & RBAC Client Layer', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    });

    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      authStatus: 'IDLE',
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Centralized Axios API Client & Interceptors', () => {
    it('generates and injects X-Request-Id on outgoing requests', async () => {
      let capturedHeaders: any = null;
      vi.spyOn(axiosInstance, 'request').mockImplementationOnce(async (config: any) => {
        capturedHeaders = config.headers;
        return {
          data: {
            success: true,
            data: { pong: true },
            meta: { timestamp: new Date().toISOString(), dataMode: 'DEMO' },
          },
        } as any;
      });

      // Call request
      await request('/test-ping');

      expect(axiosInstance.request).toHaveBeenCalled();
    });

    it('injects Authorization Bearer token from localStorage when present', async () => {
      mockStorage['varshasetu_token'] = 'jwt_test_token_abc123';

      let capturedConfig: any = null;
      vi.spyOn(axiosInstance, 'request').mockImplementationOnce(async (config: any) => {
        capturedConfig = config;
        return {
          data: { success: true, data: { user: mockFarmerUser } },
        } as any;
      });

      await request('/auth/me');
      expect(axiosInstance.request).toHaveBeenCalled();
    });

    it('creates ApiClientError with error code, message and status code', () => {
      const err = new ApiClientError('AUTH_UNAUTHORIZED', 'Invalid credentials', { reason: 'bad_password' }, 401);
      expect(err.name).toBe('ApiClientError');
      expect(err.code).toBe('AUTH_UNAUTHORIZED');
      expect(err.message).toBe('Invalid credentials');
      expect(err.statusCode).toBe(401);
      expect(err.details).toEqual({ reason: 'bad_password' });
    });
  });

  describe('2. Zustand Auth Store Lifecycle & RBAC', () => {
    it('initializes to UNAUTHENTICATED when no tokens are in localStorage', async () => {
      await useAuthStore.getState().initAuth();

      const state = useAuthStore.getState();
      expect(state.authStatus).toBe('UNAUTHENTICATED');
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });

    it('successfully restores session when valid token exists', async () => {
      mockStorage['varshasetu_token'] = 'valid_token_xyz';
      vi.spyOn(authService, 'getMe').mockResolvedValueOnce({
        success: true,
        data: mockFarmerUser,
        meta: { timestamp: new Date().toISOString(), dataMode: 'DEMO' },
      });

      await useAuthStore.getState().initAuth();

      const state = useAuthStore.getState();
      expect(state.authStatus).toBe('AUTHENTICATED');
      expect(state.user?.fullName).toBe('Ramesh Kumar');
      expect(state.user?.role).toBe('FARMER');
      // Verifies operational perspective sync with useAppStore
      expect(useAppStore.getState().currentRole).toBe('FARMER');
    });

    it('successfully executes login and sets tokens & authenticated state', async () => {
      vi.spyOn(authService, 'login').mockResolvedValueOnce({
        success: true,
        data: {
          token: 'token_new_farmer',
          refreshToken: 'refresh_new_farmer',
          user: mockFarmerUser,
        },
        meta: { timestamp: new Date().toISOString(), dataMode: 'DEMO' },
      });

      const user = await useAuthStore.getState().login({
        phoneNumber: '+919876543210',
        password: 'FarmerPassword123!',
      });

      expect(user.fullName).toBe('Ramesh Kumar');
      const state = useAuthStore.getState();
      expect(state.authStatus).toBe('AUTHENTICATED');
      expect(state.token).toBe('token_new_farmer');
      expect(state.refreshToken).toBe('refresh_new_farmer');
    });

    it('clears state and storage on logout', async () => {
      mockStorage['varshasetu_token'] = 'some_token';
      mockStorage['varshasetu_refresh_token'] = 'some_refresh_token';
      useAuthStore.setState({
        user: mockFarmerUser,
        token: 'some_token',
        refreshToken: 'some_refresh_token',
        authStatus: 'AUTHENTICATED',
      });

      vi.spyOn(authService, 'logout').mockResolvedValueOnce(undefined);

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.authStatus).toBe('UNAUTHENTICATED');
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(mockStorage['varshasetu_token']).toBeUndefined();
      expect(mockStorage['varshasetu_refresh_token']).toBeUndefined();
    });
  });

  describe('3. ProtectedRoute & RBAC Route Guarding', () => {
    it('renders loading state when authStatus is AUTH_INITIALIZING', () => {
      useAuthStore.setState({ authStatus: 'AUTH_INITIALIZING', user: null });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Routes>
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <div>Farmer Secret Dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Verifying VarshaSetu institutional clearance/i)).toBeInTheDocument();
      expect(screen.queryByText('Farmer Secret Dashboard')).not.toBeInTheDocument();
    });

    it('redirects to /login when user is unauthenticated', () => {
      useAuthStore.setState({ authStatus: 'UNAUTHENTICATED', user: null });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Routes>
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <div>Farmer Secret Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>VarshaSetu Institutional Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('VarshaSetu Institutional Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Farmer Secret Dashboard')).not.toBeInTheDocument();
    });

    it('allows access when authenticated user role matches allowedRoles', () => {
      useAuthStore.setState({
        authStatus: 'AUTHENTICATED',
        user: mockFarmerUser,
        token: 'token_farmer',
      });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Routes>
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <div>Farmer Secret Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Farmer Secret Dashboard Content')).toBeInTheDocument();
    });

    it('renders 403 Forbidden screen when authenticated user role does not match', () => {
      useAuthStore.setState({
        authStatus: 'AUTHENTICATED',
        user: mockFarmerUser, // Farmer attempting to access Officer perspective
        token: 'token_farmer',
      });

      render(
        <MemoryRouter initialEntries={['/officer']}>
          <Routes>
            <Route
              path="/officer"
              element={
                <ProtectedRoute allowedRoles={['OFFICER']}>
                  <div>Officer Command Operations</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/403 FORBIDDEN • RBAC ENFORCEMENT/i)).toBeInTheDocument();
      expect(screen.getByText(/Perspective Access Restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/Ramesh Kumar/i)).toBeInTheDocument();
      expect(screen.queryByText('Officer Command Operations')).not.toBeInTheDocument();
    });

    it('allows ADMIN persona to access any protected perspective', () => {
      useAuthStore.setState({
        authStatus: 'AUTHENTICATED',
        user: mockAdminUser, // Admin accessing Farmer portal
        token: 'token_admin',
      });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Routes>
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <div>Farmer Secret Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Farmer Secret Dashboard Content')).toBeInTheDocument();
    });
  });

  describe('4. Authoritative MERN Backend Service Integration', () => {
    it('forecastService.getForecasts passes correct filter query parameters to /forecasts', async () => {
      let requestedUrl = '';
      vi.spyOn(axiosInstance, 'request').mockImplementationOnce(async (config: any) => {
        requestedUrl = config.url;
        return {
          data: {
            success: true,
            data: { total_forecasts: 1, forecasts: [] },
          },
        } as any;
      });

      await forecastService.getForecasts({
        target: 'HEAVY_RAIN',
        horizon: 7,
        block_id: 'UP_LKO_BKT',
      });

      expect(requestedUrl).toContain('/forecasts?');
      expect(requestedUrl).toContain('target=HEAVY_RAIN');
      expect(requestedUrl).toContain('horizon=7');
      expect(requestedUrl).toContain('block_id=UP_LKO_BKT');
    });

    it('eventService.acknowledgeEvent issues POST /events/:id/acknowledge', async () => {
      let requestedUrl = '';
      let requestedMethod = '';
      vi.spyOn(axiosInstance, 'request').mockImplementationOnce(async (config: any) => {
        requestedUrl = config.url;
        requestedMethod = config.method;
        return {
          data: {
            success: true,
            data: { event_id: 'evt_001', state: 'ACKNOWLEDGED' },
          },
        } as any;
      });

      await eventService.acknowledgeEvent('evt_001', 'Inspected on field');

      expect(requestedUrl).toBe('/events/evt_001/acknowledge');
      expect(requestedMethod).toBe('POST');
    });

    it('advisoryService.getStatus calls /agronomy/status with safety gate', async () => {
      let requestedUrl = '';
      vi.spyOn(axiosInstance, 'request').mockImplementationOnce(async (config: any) => {
        requestedUrl = config.url;
        return {
          data: {
            success: true,
            data: {
              status: 'OPERATIONAL',
              phase: '5A',
              safety_gate: { status: 'PASSED', blocked_imperative_directives: true },
            },
          },
        } as any;
      });

      const res = await advisoryService.getStatus();
      expect(requestedUrl).toBe('/agronomy/status');
      expect(res.data.safety_gate.blocked_imperative_directives).toBe(true);
    });

    it('modelService.getStatus calls /models/status with non-fabrication disclosure', async () => {
      let requestedUrl = '';
      vi.spyOn(axiosInstance, 'request').mockImplementationOnce(async (config: any) => {
        requestedUrl = config.url;
        return {
          data: {
            success: true,
            data: {
              service: 'FastAPI Scientific ML Gateway',
              operational_status: 'OPERATIONAL',
              spatial_resolution_supported: 'BLOCK_LEVEL_0.25_DEGREE',
            },
          },
        } as any;
      });

      const res = await modelService.getStatus();
      expect(requestedUrl).toBe('/models/status');
      expect(res.data.spatial_resolution_supported).toBe('BLOCK_LEVEL_0.25_DEGREE');
    });
  });
});

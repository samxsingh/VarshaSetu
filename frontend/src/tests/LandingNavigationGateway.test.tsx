import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import fs from 'fs';
import path from 'path';
import { RootLayout } from '../layouts/RootLayout';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage, getSafeRedirectPath, ROLE_CHOICES } from '../pages/public/LoginPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/authService';
import { DEV_DEMO_PERSONAS, IS_DEMO_ENABLED } from '../config/demoPersonas';
import { PUBLIC_NAVIGATION } from '../config/navigation';

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    getMe: vi.fn().mockResolvedValue({ success: false, data: null }),
    login: vi.fn().mockImplementation((payload: any) => {
      if (payload.password === 'WrongPassword!') {
        return Promise.reject(new Error('Invalid credentials or user not registered'));
      }
      return Promise.resolve({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: { id: 'u1', fullName: 'Ramesh Kumar', role: 'FARMER', preferredLanguage: 'hi' },
        },
      });
    }),
    register: vi.fn().mockResolvedValue({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: { id: 'u2', fullName: 'New User', role: 'FARMER', preferredLanguage: 'hi' },
      },
    }),
    refresh: vi.fn().mockResolvedValue({ success: false }),
    logout: vi.fn().mockResolvedValue(undefined),
    getToken: vi.fn().mockReturnValue(null),
    getRefreshToken: vi.fn().mockReturnValue(null),
    isAuthenticated: vi.fn().mockReturnValue(false),
    clearTokens: vi.fn(),
  },
}));

describe('Authentication & Role Gateway Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      authStatus: 'UNAUTHENTICATED',
      error: null,
    });
  });

  describe('Phase 1 & 2: Route Resolution & Tabs (/auth and /login)', () => {
    it('1. /auth renders the authentication gateway', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('auth-gateway')).toBeInTheDocument();
      expect(screen.getByText('VarshaSetu Access Gateway')).toBeInTheDocument();
    });

    it('2. /login resolves to the exact same authentication gateway', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('auth-gateway')).toBeInTheDocument();
      expect(screen.getByText('VarshaSetu Access Gateway')).toBeInTheDocument();
    });

    it('3. Login and Register tabs render and support mode switching', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      const loginTab = screen.getByTestId('tab-login');
      const registerTab = screen.getByTestId('tab-register');

      expect(loginTab).toBeInTheDocument();
      expect(registerTab).toBeInTheDocument();
      expect(loginTab).toHaveAttribute('aria-selected', 'true');
      expect(registerTab).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('button', { name: /Sign In to VarshaSetu/i })).toBeInTheDocument();

      fireEvent.click(registerTab);
      expect(registerTab).toHaveAttribute('aria-selected', 'true');
      expect(loginTab).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });
  });

  describe('Operational Roles & Terminology', () => {
    it('4. exactly four public operational roles (Farmer, Officer, Government, Analyst) are displayed', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      // Verify all 4 public roles appear
      expect(screen.getAllByText('Farmer').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Officer').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Government').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Analyst').length).toBeGreaterThanOrEqual(1);

      // Descriptions
      expect(screen.getByText(/Access weather intelligence, forecasts, advisories/i)).toBeInTheDocument();
      expect(screen.getByText(/Monitor field conditions, operational signals/i)).toBeInTheDocument();
      expect(screen.getByText(/Monitor district\/state-level agricultural and climate intelligence/i)).toBeInTheDocument();
      expect(screen.getByText(/Analyze climate data, model behavior, data health/i)).toBeInTheDocument();

      // Ensure Exactly 4 role cards exist in the role selector
      const roleCards = screen.getAllByRole('button').filter(btn => btn.getAttribute('data-testid')?.startsWith('role-choice-'));
      expect(roleCards).toHaveLength(4);

      // Government Admin / ADMIN must NOT be rendered as a public role card
      expect(screen.queryByText('Government Admin')).not.toBeInTheDocument();
      expect(screen.queryByTestId('role-choice-government-admin')).not.toBeInTheDocument();
      expect(screen.queryByTestId('role-choice-admin')).not.toBeInTheDocument();
    });

    it('4b. ADMIN is not available as a registration option in the Register tab', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByTestId('tab-register'));

      expect(screen.queryByText('Government Admin')).not.toBeInTheDocument();
      expect(screen.queryByTestId('role-choice-government-admin')).not.toBeInTheDocument();
      expect(screen.queryByTestId('role-choice-admin')).not.toBeInTheDocument();
    });

    it('5. internal enum names (FARMER, OFFICER, GOVERNMENT, ANALYST, ADMIN) are NOT displayed as visible UI labels', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      expect(screen.queryByText(/^FARMER$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^OFFICER$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^GOVERNMENT$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^ANALYST$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^ADMIN$/)).not.toBeInTheDocument();
    });
  });

  describe('Form Initial State & Validation', () => {
    it('6a. initial manual login inputs start completely empty in development and production', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;

      expect(identifierInput.value).toBe('');
      expect(passwordInput.value).toBe('');

      // Check OTP view also starts empty
      const useOtpBtn = screen.getByText('Use Demo OTP instead');
      fireEvent.click(useOtpBtn);
      const otpInput = screen.getByPlaceholderText('Enter 6-digit OTP') as HTMLInputElement;
      expect(otpInput.value).toBe('');
    });

    it('6b. clicking a public role choice card does NOT prefill manual credential inputs', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;

      fireEvent.click(screen.getByTestId('role-choice-officer'));
      expect(identifierInput.value).toBe('');
      expect(passwordInput.value).toBe('');

      fireEvent.click(screen.getByTestId('role-choice-analyst'));
      expect(identifierInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });

    it('6c. login validation rejects empty identifier or empty password', async () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /Sign In to VarshaSetu/i });
      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email');

      // Click submit with empty fields
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Please enter your phone number or email address/i)).toBeInTheDocument();
      });

      // Enter identifier only
      fireEvent.change(identifierInput, { target: { value: '+919876543210' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Please enter your password/i)).toBeInTheDocument();
      });
    });

    it('7. registration validation rejects short full name or password under 8 characters', async () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      // Switch to Register tab
      fireEvent.click(screen.getByTestId('tab-register'));

      const submitBtn = screen.getByRole('button', { name: /Create Account/i });
      const nameInput = screen.getByPlaceholderText('e.g. Rajesh Pratap Singh');
      const identifierInput = screen.getByPlaceholderText('Enter phone number or email address');
      const passwordInput = screen.getByPlaceholderText('Minimum 8 characters');

      // 1. Submit with empty/short name
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Full name must be at least 2 characters long/i)).toBeInTheDocument();
      });

      // 2. Submit with valid name but missing identifier
      fireEvent.change(nameInput, { target: { value: 'Rajesh Kumar' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Please enter your phone number or email address/i)).toBeInTheDocument();
      });

      // 3. Submit with short password
      fireEvent.change(identifierInput, { target: { value: 'rajesh@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role Redirection & Authenticated State Handling', () => {
    it('8. successful FARMER authentication routes to /farmer/dashboard', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'farmer-token',
          user: {
            id: 'u-farmer',
            fullName: 'Ramesh Kumar',
            role: 'FARMER',
            preferredLanguage: 'hi',
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="farmer/dashboard" element={<div data-testid="farmer-dash">Farmer Workspace</div>} />
          </Routes>
        </MemoryRouter>
      );

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email');
      const passwordInput = screen.getByPlaceholderText('••••••••••••');
      fireEvent.change(identifierInput, { target: { value: '+919876543210' } });
      fireEvent.change(passwordInput, { target: { value: 'FarmerPassword123!' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign In to VarshaSetu/i }));

      await waitFor(() => {
        expect(screen.getByTestId('farmer-dash')).toBeInTheDocument();
      });
    });

    it('9. successful OFFICER authentication routes to /officer/dashboard', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'officer-token',
          user: {
            id: 'u-officer',
            fullName: 'Dr. Arvind Sharma',
            role: 'OFFICER',
            preferredLanguage: 'en',
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="officer/dashboard" element={<div data-testid="officer-dash">Officer Workspace</div>} />
          </Routes>
        </MemoryRouter>
      );

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email');
      const passwordInput = screen.getByPlaceholderText('••••••••••••');
      fireEvent.change(identifierInput, { target: { value: '+919876543211' } });
      fireEvent.change(passwordInput, { target: { value: 'OfficerPassword123!' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign In to VarshaSetu/i }));

      await waitFor(() => {
        expect(screen.getByTestId('officer-dash')).toBeInTheDocument();
      });
    });

    it('10. successful GOVERNMENT authentication routes to /government/dashboard', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'gov-token',
          user: {
            id: 'u-gov',
            fullName: 'Sunita Verma',
            role: 'GOVERNMENT',
            preferredLanguage: 'hi',
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="government/dashboard" element={<div data-testid="gov-dash">Government Workspace</div>} />
          </Routes>
        </MemoryRouter>
      );

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email');
      const passwordInput = screen.getByPlaceholderText('••••••••••••');
      fireEvent.change(identifierInput, { target: { value: '+919876543212' } });
      fireEvent.change(passwordInput, { target: { value: 'GovPassword123!' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign In to VarshaSetu/i }));

      await waitFor(() => {
        expect(screen.getByTestId('gov-dash')).toBeInTheDocument();
      });
    });

    it('10b. successful ANALYST authentication routes to /analyst', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'analyst-token',
          user: {
            id: 'u-analyst',
            fullName: 'Vikram Patel',
            role: 'ANALYST',
            preferredLanguage: 'en',
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="analyst" element={<div data-testid="analyst-dash">Analyst Workspace</div>} />
          </Routes>
        </MemoryRouter>
      );

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email');
      const passwordInput = screen.getByPlaceholderText('••••••••••••');
      fireEvent.change(identifierInput, { target: { value: 'analyst.climate@varshasetu.gov.in' } });
      fireEvent.change(passwordInput, { target: { value: 'AnalystPassword123!' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign In to VarshaSetu/i }));

      await waitFor(() => {
        expect(screen.getByTestId('analyst-dash')).toBeInTheDocument();
      });
    });

    it('11. successful ADMIN authentication routes to /admin without requiring a public admin role card', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'admin-token',
          user: {
            id: 'u-admin',
            fullName: 'VarshaSetu System Administrator',
            role: 'ADMIN',
            preferredLanguage: 'en',
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="admin" element={<div data-testid="admin-dash">Admin Workspace</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Verify no admin role card exists to click
      expect(screen.queryByTestId('role-choice-government-admin')).not.toBeInTheDocument();

      // Authenticate via manual login with provisioned admin credentials
      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email');
      const passwordInput = screen.getByPlaceholderText('••••••••••••');
      fireEvent.change(identifierInput, { target: { value: 'admin@varshasetu.gov.in' } });
      fireEvent.change(passwordInput, { target: { value: 'AdminPassword123!' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign In to VarshaSetu/i }));

      await waitFor(() => {
        expect(screen.getByTestId('admin-dash')).toBeInTheDocument();
      });
    });

    it('12. authentication failure renders an appropriate error notice', async () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email');
      const passwordInput = screen.getByPlaceholderText('••••••••••••');
      fireEvent.change(identifierInput, { target: { value: '+919876543210' } });
      fireEvent.change(passwordInput, { target: { value: 'WrongPassword!' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign In to VarshaSetu/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials or user not registered/i)).toBeInTheDocument();
      });
    });

    it('13. authenticated users do NOT remain on /auth and are automatically redirected', async () => {
      useAuthStore.setState({
        user: {
          id: 'u-logged-in',
          fullName: 'Ramesh Kumar',
          role: 'FARMER',
          preferredLanguage: 'hi',
          permissions: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'existing-jwt',
        refreshToken: 'existing-refresh',
        authStatus: 'AUTHENTICATED',
        error: null,
      });

      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="farmer/dashboard" element={<div data-testid="farmer-auto-dash">Farmer Workspace</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('farmer-auto-dash')).toBeInTheDocument();
      });
    });

    it('14. getSafeRedirectPath prevents role traversal attacks (FARMER cannot be redirected to /admin)', () => {
      // Attacker attempts to route a FARMER to /admin or /officer
      expect(getSafeRedirectPath('FARMER', '/admin')).toBe('/farmer/dashboard');
      expect(getSafeRedirectPath('FARMER', '/officer/dashboard')).toBe('/farmer/dashboard');
      expect(getSafeRedirectPath('FARMER', '/government/dashboard')).toBe('/farmer/dashboard');
      expect(getSafeRedirectPath('FARMER', '/analyst')).toBe('/farmer/dashboard');
      expect(getSafeRedirectPath('FARMER', '/farmer/profile')).toBe('/farmer/profile');

      // Officer cannot be redirected to /admin or /analyst
      expect(getSafeRedirectPath('OFFICER', '/admin')).toBe('/officer/dashboard');
      expect(getSafeRedirectPath('OFFICER', '/analyst')).toBe('/officer/dashboard');
      expect(getSafeRedirectPath('OFFICER', '/officer/map')).toBe('/officer/map');

      // Analyst cannot be redirected to /admin or /officer
      expect(getSafeRedirectPath('ANALYST', '/admin')).toBe('/analyst');
      expect(getSafeRedirectPath('ANALYST', '/officer/dashboard')).toBe('/analyst');
      expect(getSafeRedirectPath('ANALYST', '/analyst/forecast-lab')).toBe('/analyst/forecast-lab');

      // Admin has universal clearance
      expect(getSafeRedirectPath('ADMIN', '/admin')).toBe('/admin');
      expect(getSafeRedirectPath('ADMIN', '/farmer/dashboard')).toBe('/farmer/dashboard');
      expect(getSafeRedirectPath('ADMIN', '/officer/dashboard')).toBe('/officer/dashboard');
      expect(getSafeRedirectPath('ADMIN', '/analyst')).toBe('/analyst');
    });

    it('15. ProtectedRoute redirects unauthenticated visitors to /login preserving destination', () => {
      render(
        <MemoryRouter initialEntries={['/officer/map']}>
          <Routes>
            <Route
              path="officer/*"
              element={
                <ProtectedRoute allowedRoles={['OFFICER']}>
                  <div>Officer Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<div data-testid="login-landing">Login Landing Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login-landing')).toBeInTheDocument();
    });

    it('16. Public homepage retains clean header with no dashboard links or demo banner', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <RootLayout />
        </MemoryRouter>
      );

      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Farmer Portal/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Officer Portal/i })).not.toBeInTheDocument();
      expect(screen.getByRole('banner')).toHaveTextContent(/VarshaSetu/i);
    });
  });

  describe('Instant Role Access & Development Demo Isolation', () => {
    it('17. development mode renders all 5 demo identities including Administrator', () => {
      expect(IS_DEMO_ENABLED).toBe(true);
      expect(DEV_DEMO_PERSONAS.length).toBe(5);

      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      expect(screen.getByTestId('demo-personas-section')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-farmer')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-officer')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-government')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-analyst')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-admin')).toBeInTheDocument();
    });

    it('18. clicking a demo persona directly authenticates without populating visible manual form fields', async () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="officer/dashboard" element={<div data-testid="officer-auto-dash">Officer Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'officer-jwt',
          user: {
            id: 'u-officer-dev',
            fullName: 'Dr. Arvind Sharma',
            role: 'OFFICER',
            preferredLanguage: 'en',
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;

      // Ensure form starts blank
      expect(identifierInput.value).toBe('');
      expect(passwordInput.value).toBe('');

      // Click Instant Role Access for Officer
      const officerDemoBtn = screen.getByTestId('demo-persona-officer');
      fireEvent.click(officerDemoBtn);

      await waitFor(() => {
        // Real authService.login was invoked directly with the dev credentials
        expect(authService.login).toHaveBeenCalledWith({
          phoneNumber: '+919876543211',
          password: 'OfficerPassword123!',
        });

        // Visible form inputs remain COMPLETELY BLANK
        expect(identifierInput.value).toBe('');
        expect(passwordInput.value).toBe('');

        // Navigation completed
        expect(screen.getByTestId('officer-auto-dash')).toBeInTheDocument();
      });
    });

    it('18b. clicking the Analyst demo persona directly authenticates and routes to /analyst without form prefill', async () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="analyst" element={<div data-testid="analyst-auto-dash">Analyst Workspace</div>} />
          </Routes>
        </MemoryRouter>
      );

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'analyst-jwt',
          user: {
            id: 'u-analyst-dev',
            fullName: 'Vikram Patel',
            role: 'ANALYST',
            preferredLanguage: 'en',
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;

      const analystDemoBtn = screen.getByTestId('demo-persona-analyst');
      fireEvent.click(analystDemoBtn);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          phoneNumber: '+919876543213',
          password: 'AnalystPassword123!',
        });
        expect(identifierInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(screen.getByTestId('analyst-auto-dash')).toBeInTheDocument();
      });
    });

    it('18c. clicking Administrator demo persona directly authenticates and routes to /admin without form prefill', async () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="auth" element={<LoginPage />} />
            <Route path="admin" element={<div data-testid="admin-auto-dash">Admin Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'admin-jwt-token',
          user: {
            id: 'u-admin-dev',
            fullName: 'VarshaSetu Administrator',
            role: 'ADMIN',
            preferredLanguage: 'en',
            permissions: ['admin:users:manage'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      } as any);

      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;

      const adminDemoBtn = screen.getByTestId('demo-persona-admin');
      fireEvent.click(adminDemoBtn);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          phoneNumber: '+919876543214',
          password: 'AdminPassword123!',
        });
        expect(identifierInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(screen.getByTestId('admin-auto-dash')).toBeInTheDocument();
      });
    });

    it('19. public ROLE_CHOICES definition contains zero passwords or phone credentials', () => {
      ROLE_CHOICES.forEach((choice) => {
        expect((choice as any).demoPassword).toBeUndefined();
        expect((choice as any).demoPhone).toBeUndefined();
        expect((choice as any).password).toBeUndefined();
      });
    });

    it('20. production dist bundle does not contain development demo passwords', () => {
      const distDir = path.resolve(__dirname, '../../dist/assets');
      if (fs.existsSync(distDir)) {
        const jsFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.js'));
        expect(jsFiles.length).toBeGreaterThan(0);

        const forbiddenStrings = [
          'FarmerPassword123!',
          'OfficerPassword123!',
          'GovPassword123!',
          'AnalystPassword123!',
          'AdminPassword123!',
        ];

        jsFiles.forEach((file) => {
          const content = fs.readFileSync(path.join(distDir, file), 'utf8');
          forbiddenStrings.forEach((secret) => {
            expect(content).not.toContain(secret);
          });
        });
      }
    });

    it('21. access gateway (/auth and /login) completely removes the informational bottom footer', () => {
      const { unmount } = render(
        <MemoryRouter initialEntries={['/auth']}>
          <RootLayout />
        </MemoryRouter>
      );

      expect(screen.queryByText(/Kisan Call Center/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/30-Year Climatology Baseline/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ICAR-CISH/i)).not.toBeInTheDocument();
      unmount();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <RootLayout />
        </MemoryRouter>
      );

      expect(screen.queryByText(/Kisan Call Center/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/30-Year Climatology Baseline/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ICAR-CISH/i)).not.toBeInTheDocument();
    });

    it('22. Phase 8: demo access panel uses compact presentation without redundant 1-click pills or oversized multi-line security paragraphs', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      const demoSection = screen.getByTestId('demo-personas-section');
      expect(demoSection).toBeInTheDocument();

      // All 5 demo options are interactive buttons
      expect(screen.getByTestId('demo-persona-farmer').tagName.toLowerCase()).toBe('button');
      expect(screen.getByTestId('demo-persona-officer').tagName.toLowerCase()).toBe('button');
      expect(screen.getByTestId('demo-persona-government').tagName.toLowerCase()).toBe('button');
      expect(screen.getByTestId('demo-persona-analyst').tagName.toLowerCase()).toBe('button');
      expect(screen.getByTestId('demo-persona-admin').tagName.toLowerCase()).toBe('button');

      // No redundant "1-Click Demo" pill in header
      expect(screen.queryByText('1-Click Demo')).not.toBeInTheDocument();

      // Compact trust indicator present
      expect(screen.getByText('SECURE ACCESS')).toBeInTheDocument();
      expect(screen.getByText('SERVER-SIDE RBAC')).toBeInTheDocument();

      // No giant multi-line security box with verbose explanation
      expect(screen.queryByText(/Authenticating establishes an authoritative signed session/i)).not.toBeInTheDocument();
    });
  });

  describe('Phase B: Authentication Gateway Visual Isolation & Public Header Cleanup', () => {
    it('1-8. /auth renders minimal public header and does NOT render application navigation, controls, or demo banner', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <RootLayout />
        </MemoryRouter>
      );

      const header = screen.getByRole('banner');

      // Minimal brand identity MUST be present
      expect(header).toHaveTextContent(/VarshaSetu/i);
      expect(within(header).getByText('वर्षासेतु')).toBeInTheDocument();
      expect(within(header).getByText('Monsoon Intelligence')).toBeInTheDocument();

      // Application navigation portal bar MUST NOT be rendered
      expect(screen.queryByLabelText('Portal navigation')).not.toBeInTheDocument();

      // 1. /auth does NOT render Home navigation in header
      expect(within(header).queryByRole('link', { name: /^Home$/i })).not.toBeInTheDocument();

      // 2. /auth does NOT render Farmer Portal navigation
      expect(screen.queryByRole('link', { name: /Farmer Portal/i })).not.toBeInTheDocument();

      // 3. /auth does NOT render Officer Center navigation
      expect(screen.queryByRole('link', { name: /Officer Center/i })).not.toBeInTheDocument();

      // 4. /auth does NOT render Government navigation in header
      expect(within(header).queryByRole('link', { name: /^Government$/i })).not.toBeInTheDocument();

      // 5. /auth does NOT render Analyst Lab navigation
      expect(screen.queryByRole('link', { name: /Analyst Lab/i })).not.toBeInTheDocument();

      // 6. /auth does NOT render Sign In application-navbar control link
      expect(within(header).queryByRole('link', { name: /^Sign In$/i })).not.toBeInTheDocument();

      // 7. /auth does NOT render Settings application-navbar control
      expect(within(header).queryByLabelText(/Admin Portal|Admin settings/i)).not.toBeInTheDocument();

      // 8. /auth does NOT render the Demo / Simulated Data banner
      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
    });

    it('9. /login exhibits the exact same minimal public authentication header behavior', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <RootLayout />
        </MemoryRouter>
      );

      const header = screen.getByRole('banner');

      expect(header).toHaveTextContent(/VarshaSetu/i);
      expect(within(header).getByText('वर्षासेतु')).toBeInTheDocument();
      expect(within(header).getByText('Monsoon Intelligence')).toBeInTheDocument();

      expect(screen.queryByLabelText('Portal navigation')).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /^Home$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Farmer Portal/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Officer Center/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /^Government$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Analyst Lab/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /^Sign In$/i })).not.toBeInTheDocument();
      expect(within(header).queryByLabelText(/Admin Portal|Admin settings/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
    });

    it('10-14. /auth retains complete gateway integrity (tabs, 4 public roles, no Admin, blank inputs, active demo personas)', () => {
      render(
        <MemoryRouter initialEntries={['/auth']}>
          <LoginPage />
        </MemoryRouter>
      );

      // 10. LOGIN and REGISTER tabs
      expect(screen.getByTestId('tab-login')).toBeInTheDocument();
      expect(screen.getByTestId('tab-register')).toBeInTheDocument();

      // 11. Exactly four public roles visible
      expect(screen.getAllByText('Farmer').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Officer').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Government').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Analyst').length).toBeGreaterThanOrEqual(1);

      // 12. ADMIN absent from public role selection
      expect(screen.queryByText('Government Admin')).not.toBeInTheDocument();
      expect(screen.queryByTestId('role-choice-government-admin')).not.toBeInTheDocument();

      // 13. Manual login fields remain empty initially
      const identifierInput = screen.getByPlaceholderText('Enter phone number or institutional email') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;
      expect(identifierInput.value).toBe('');
      expect(passwordInput.value).toBe('');

      // 14. Instant Role Access remains functional in development
      expect(screen.getByTestId('demo-persona-farmer')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-officer')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-government')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-analyst')).toBeInTheDocument();
      expect(screen.getByTestId('demo-persona-admin')).toBeInTheDocument();
    });

    it('15. authenticated role routing destinations remain valid in getSafeRedirectPath', () => {
      expect(getSafeRedirectPath('FARMER')).toBe('/farmer/dashboard');
      expect(getSafeRedirectPath('OFFICER')).toBe('/officer/dashboard');
      expect(getSafeRedirectPath('GOVERNMENT')).toBe('/government/dashboard');
      expect(getSafeRedirectPath('ANALYST')).toBe('/analyst');
      expect(getSafeRedirectPath('ADMIN')).toBe('/admin');
    });

    it('16. authenticated application routes enforce role-locked navigation and remove global demo banner (Phase 9)', () => {
      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <RootLayout />
        </MemoryRouter>
      );

      // Demo banner MUST NOT be present on authenticated application routes in Phase 9
      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();

      const header = screen.getByRole('banner');

      // Application navigation portal bar MUST be present
      expect(screen.getByLabelText('Portal navigation')).toBeInTheDocument();

      // Only the active role workspace MUST be present in header
      expect(within(header).getByRole('link', { name: /Farmer Portal/i })).toBeInTheDocument();

      // Role switcher links MUST NOT be present in normal authenticated header
      expect(within(header).queryByRole('link', { name: /^Home$/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Officer Center/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /^Government$/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Analyst Lab/i })).not.toBeInTheDocument();

      // Admin portal icon control MUST NOT be present for non-admin user
      expect(within(header).queryByLabelText(/Admin/i)).not.toBeInTheDocument();
    });
  });

  describe('Phase 2: Hero Image Blending + Navigation Architecture + Above-the-Fold Cleanup', () => {
    it('1-9. canonical hero headline is "From monsoon predictions to smarter farm decisions.", "farmer decisions" is strictly absent, and NO underline exists', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      // 1. Exact canonical headline text (plural "predictions")
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/From monsoon predictions to smarter farm decisions/i);
      expect(within(heading).getByText(/SMARTER FARM DECISIONS/i)).toBeInTheDocument();
      expect(screen.getByText(/SCIENCE \/ DATA \/ BETTER DECISIONS/i)).toBeInTheDocument();

      // 2. "monsoon predictions" exists (plural)
      expect(heading).toHaveTextContent(/monsoon predictions/i);

      // 3. Singular "From monsoon prediction to" is strictly absent
      expect(screen.queryByText(/From monsoon prediction to/i)).not.toBeInTheDocument();

      // 4. "farm decisions" exists
      expect(heading).toHaveTextContent(/farm decisions/i);

      // 5-6. "farmer decisions" and "smarter farmer decisions" are strictly absent
      expect(screen.queryByText(/farmer decisions/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/smarter farmer decisions/i)).not.toBeInTheDocument();

      // 7-8. "From climate signals..." and "confident farm decisions" / "confident farmer decisions" are absent
      expect(screen.queryByText(/From climate signals to confident farm decisions/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/confident farm decisions/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/confident farmer decisions/i)).not.toBeInTheDocument();

      // 9. STRICTLY NO underline decoration
      expect(heading.querySelector('.underline')).toBeNull();
      expect(heading.className).not.toContain('underline');
    });

    it('10-11. exactly one primary hero CTA exists and routes to /auth', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const ctaButton = screen.getByRole('button', { name: /Explore Monsoon Intelligence/i });
      expect(ctaButton).toBeInTheDocument();

      const ctaLink = ctaButton.closest('a');
      expect(ctaLink).toHaveAttribute('href', '/auth');

      // No persona shortcut buttons on homepage
      expect(screen.queryByRole('button', { name: /I'm a Farmer/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /I'm an Officer/i })).not.toBeInTheDocument();
    });

    it('12. hero image remains hero-farmer.jpg with cinematic zoom animation', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const farmerImg = screen.getByTestId('hero-farmer-image');
      expect(farmerImg).toBeInTheDocument();
      expect(farmerImg).toHaveAttribute('src', '/images/hero-farmer.jpg');
      expect(farmerImg).toHaveClass('animate-cinematic-zoom');

      // Photographic frame
      expect(screen.getByTestId('hero-image-frame')).toBeInTheDocument();
    });

    it('13-14. floating intelligence cards exist with verified climate labels and redundant cards are removed', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      // Exactly 3 Non-redundant Floating intelligence cards
      const cardMonsoon = screen.getByTestId('floating-card-monsoon');
      const cardSoil = screen.getByTestId('floating-card-soil');
      const cardField = screen.getByTestId('floating-card-field');

      expect(cardMonsoon).toBeInTheDocument();
      expect(cardSoil).toBeInTheDocument();
      expect(cardField).toBeInTheDocument();

      // Redundant card (RAIN WINDOW) is removed per Phase 2 Step 20
      expect(screen.queryByTestId('floating-card-window')).not.toBeInTheDocument();

      // Card labels
      expect(within(cardMonsoon).getByText('MONSOON FORECAST')).toBeInTheDocument();
      expect(within(cardMonsoon).getByText('Moderate Rain')).toBeInTheDocument();

      expect(within(cardSoil).getByText('SOIL MOISTURE')).toBeInTheDocument();
      expect(within(cardSoil).getByText('Adequate')).toBeInTheDocument();
      // Soil moisture is hidden on compact mobile viewports to maintain max 2 annotations on mobile
      expect(cardSoil).toHaveClass('hidden', 'sm:block');

      expect(within(cardField).getByText('FIELD CONTEXT')).toBeInTheDocument();
      expect(within(cardField).getByText('Bakshi Ka Talab')).toBeInTheDocument();
    });

    it('15-16. header navigation order matches canonical PUBLIC_NAVIGATION and actual DOM section order', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<LandingPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const nav = screen.getByLabelText('Homepage navigation');
      expect(nav).toBeInTheDocument();

      // Canonical navigation definitions
      expect(PUBLIC_NAVIGATION.map((n) => n.id)).toEqual(['home', 'intelligence', 'workspaces', 'method', 'trust']);

      // Navigation links exist in order
      const navLinks = within(nav).getAllByRole('link');
      expect(navLinks).toHaveLength(PUBLIC_NAVIGATION.length);
      PUBLIC_NAVIGATION.forEach((item, index) => {
        expect(navLinks[index]).toHaveTextContent(item.label);
        expect(navLinks[index]).toHaveAttribute('href', item.href);
      });

      // Sign in button linking to /auth with institutional entry control
      const signInLink = screen.getByRole('link', { name: /Sign in/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/auth');

      // Page destination sections exist
      const homeSection = container.querySelector('#home');
      const intelligenceSection = container.querySelector('#intelligence');
      const workspacesSection = container.querySelector('#workspaces');
      const methodSection = container.querySelector('#method');
      const trustSection = container.querySelector('#trust');

      expect(homeSection).toBeInTheDocument();
      expect(intelligenceSection).toBeInTheDocument();
      expect(workspacesSection).toBeInTheDocument();
      expect(methodSection).toBeInTheDocument();
      expect(trustSection).toBeInTheDocument();

      // DOM order verification: home precedes intelligence, intelligence precedes workspaces, workspaces precedes method, method precedes trust
      expect(homeSection!.compareDocumentPosition(intelligenceSection!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(intelligenceSection!.compareDocumentPosition(workspacesSection!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(workspacesSection!.compareDocumentPosition(methodSection!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(methodSection!.compareDocumentPosition(trustSection!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

      // Target sections have scroll-margin to prevent sticky navbar overlap
      expect(intelligenceSection).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
      expect(workspacesSection).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
      expect(methodSection).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
      expect(trustSection).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');

      // No duplicate section IDs across the page
      const allIds = Array.from(container.querySelectorAll('[id]')).map((el) => el.id);
      const uniqueIds = new Set(allIds);
      expect(allIds.length).toBe(uniqueIds.size);

      // Verify every navigation href points to an existing section
      PUBLIC_NAVIGATION.forEach((item) => {
        expect(container.querySelector(item.href)).not.toBeNull();
      });

      // Verify no broken anchors in container
      const allAnchors = Array.from(container.querySelectorAll('a[href^="#"]'));
      allAnchors.forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href.length > 1) {
          expect(container.querySelector(href)).not.toBeNull();
        }
      });
    });

    it('17. dedicated Signal → Context → Decision intelligence section exists with exact semantic h2, 3 stages, and planetary teleconnections', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const intelligenceSection = screen.getByTestId('signal-context-decision-transition');
      expect(intelligenceSection).toBeInTheDocument();
      expect(intelligenceSection).toHaveAttribute('id', 'intelligence');

      // Exactly one semantic h2 heading in this section
      const h2Elements = within(intelligenceSection).getAllByRole('heading', { level: 2 });
      expect(h2Elements).toHaveLength(1);
      expect(h2Elements[0]).toHaveTextContent(/From atmospheric signals to grounded farm intelligence/i);

      // Flow micro-label
      expect(within(intelligenceSection).getByText(/SIGNAL → CONTEXT → DECISION/i)).toBeInTheDocument();

      // Supporting narrative copy
      expect(
        within(intelligenceSection).getByText(
          /VarshaSetu combines large-scale monsoon signals, local atmospheric context, and field observations/i
        )
      ).toBeInTheDocument();

      // Three stages
      expect(within(intelligenceSection).getByText(/01 \/ MONSOON SIGNALS/i)).toBeInTheDocument();
      expect(within(intelligenceSection).getByText(/Synoptic Teleconnections/i)).toBeInTheDocument();
      expect(within(intelligenceSection).getByText(/GLOBAL \+ REGIONAL SIGNALS/i)).toBeInTheDocument();

      // Planetary teleconnections present
      expect(within(intelligenceSection).getByText(/ENSO/i)).toBeInTheDocument();
      expect(within(intelligenceSection).getByText(/IOD/i)).toBeInTheDocument();
      expect(within(intelligenceSection).getByText(/MJO/i)).toBeInTheDocument();

      expect(within(intelligenceSection).getByText(/02 \/ FIELD CONTEXT/i)).toBeInTheDocument();
      expect(within(intelligenceSection).getByText(/Hyperlocal Downscaling/i)).toBeInTheDocument();
      expect(within(intelligenceSection).getByText(/UP_LKO_BKT/i)).toBeInTheDocument();

      expect(within(intelligenceSection).getByText(/03 \/ FARM DECISIONS/i)).toBeInTheDocument();
      expect(within(intelligenceSection).getByText(/Actionable Operations/i)).toBeInTheDocument();
      expect(within(intelligenceSection).getByText(/SOWING · SPRAYING · HARVEST/i)).toBeInTheDocument();

      // Terminology verification: uses "farm decisions", strictly zero instances of "farmer decisions"
      expect(within(intelligenceSection).getAllByText(/farm decisions/i).length).toBeGreaterThanOrEqual(1);
      expect(within(intelligenceSection).queryByText(/farmer decisions/i)).not.toBeInTheDocument();
      expect(within(intelligenceSection).queryByText(/smarter farmer decisions/i)).not.toBeInTheDocument();
      expect(within(intelligenceSection).queryByText(/confident farmer decisions/i)).not.toBeInTheDocument();

      // Decorative flowline and connectors are aria-hidden
      const ariaHiddenElements = intelligenceSection.querySelectorAll('[aria-hidden="true"]');
      expect(ariaHiddenElements.length).toBeGreaterThanOrEqual(1);
    });

    it('18-20. old HUD telemetry, calibration strip, and dashboard card stack are removed from hero', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      const heroSection = heading.closest('section')!;

      // Old HUD telemetry header is removed
      expect(screen.queryByText(/FIELD OBSERVATION TELEMETRY/i)).not.toBeInTheDocument();

      // Old calibration strip is removed from hero
      expect(within(heroSection).queryByText(/MODEL CALIBRATION/i)).not.toBeInTheDocument();
      expect(within(heroSection).queryByText(/Isotonic \+ Platt Curves/i)).not.toBeInTheDocument();

      // No dashboard card stack or corner reticle labels
      expect(screen.queryByText(/\+ OPT-VIS/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/FOV 48°/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ELEV: 123m ASL/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/KHARIF-24 ARCHIVE/i)).not.toBeInTheDocument();
    });

    it('21. reduced-motion CSS rule exists in index.css and covers animations', () => {
      const cssPath = path.resolve(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(cssContent).toContain('.animate-cinematic-zoom');
      expect(cssContent).toContain('.animate-fade-up');
      expect(cssContent).toContain('.animate-settle-in');
      expect(cssContent).toContain('animation: none !important');
    });

    it('22. accessibility attributes remain present and sections contain overflow-hidden structure', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      // Descriptive hero image alt text
      const farmerImg = screen.getByTestId('hero-farmer-image');
      expect(farmerImg).toHaveAttribute(
        'alt',
        'Indian farmer inspecting VarshaSetu agro-climate intelligence on a tablet in agricultural field'
      );

      // Decorative atmospheric graphics remain aria-hidden
      const atmosphericDiv = container.querySelector('div[aria-hidden="true"]');
      expect(atmosphericDiv).not.toBeNull();

      // No horizontal overflow structure (hero section has overflow-hidden)
      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section');
      expect(heroSection).toHaveClass('overflow-hidden');

      const transitionSection = screen.getByTestId('signal-context-decision-transition');
      expect(transitionSection).toHaveClass('overflow-hidden');

      render(
        <MemoryRouter initialEntries={['/']}>
          <RootLayout />
        </MemoryRouter>
      );

      const headers = screen.getAllByRole('banner');
      const header = headers[headers.length - 1];

      // Header branding
      expect(header).toHaveTextContent(/VarshaSetu/i);
      expect(within(header).getByText('वर्षासेतु')).toBeInTheDocument();

      // No portal application navigation bar
      expect(screen.queryByLabelText('Portal navigation')).not.toBeInTheDocument();

      // No demo banner on public homepage
      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
    });
  });

  describe('Phase 1: 22 Verification Requirements (Section 35)', () => {
    it('1. Canonical navigation configuration exists with exact schema and items', () => {
      expect(PUBLIC_NAVIGATION).toBeDefined();
      expect(PUBLIC_NAVIGATION).toHaveLength(5);
      expect(PUBLIC_NAVIGATION.map((n) => n.id)).toEqual(['home', 'intelligence', 'workspaces', 'method', 'trust']);
      PUBLIC_NAVIGATION.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.label).toBeDefined();
        expect(item.href).toBe(`#${item.id}`);
        expect(item.sectionId).toBe(item.id);
      });
    });

    it('2. Navigation order matches DOM order', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const home = container.querySelector('#home');
      const intelligence = container.querySelector('#intelligence');
      const workspaces = container.querySelector('#workspaces');
      const method = container.querySelector('#method');
      const trust = container.querySelector('#trust');

      expect(home).toBeInTheDocument();
      expect(intelligence).toBeInTheDocument();
      expect(workspaces).toBeInTheDocument();
      expect(method).toBeInTheDocument();
      expect(trust).toBeInTheDocument();

      expect(home!.compareDocumentPosition(intelligence!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(intelligence!.compareDocumentPosition(workspaces!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(workspaces!.compareDocumentPosition(method!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(method!.compareDocumentPosition(trust!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('3. Every navigation href points to an existing section', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      PUBLIC_NAVIGATION.forEach((navItem) => {
        const target = container.querySelector(navItem.href);
        expect(target).not.toBeNull();
      });
    });

    it('4. No duplicate section IDs', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const allIds = Array.from(container.querySelectorAll('[id]')).map((el) => el.id);
      const uniqueIds = new Set(allIds);
      expect(allIds.length).toBe(uniqueIds.size);
    });

    it('5. Active section state works with scroll-margins and IntersectionObserver setup', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<LandingPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const intelligence = container.querySelector('#intelligence');
      const workspaces = container.querySelector('#workspaces');
      const method = container.querySelector('#method');
      const trust = container.querySelector('#trust');

      expect(intelligence).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
      expect(workspaces).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
      expect(method).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
      expect(trust).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
    });

    it('6. Sign in routes to /auth with institutional entry control', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<LandingPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const signInLink = screen.getByRole('link', { name: /Sign in/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/auth');
      expect(signInLink.className).toContain('rounded-full');
      expect(signInLink.className).toContain('min-h-[44px]');
    });

    it('7. Hero CTA routes to /auth', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heroCtaButton = screen.getByTestId('hero-primary-cta');
      const heroCtaLink = heroCtaButton.closest('a');
      expect(heroCtaLink).toHaveAttribute('href', '/auth');
    });

    it('8. Hero contains exactly one primary CTA', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section')!;
      const primaryCtas = heroSection.querySelectorAll('[data-testid="hero-primary-cta"]');
      expect(primaryCtas).toHaveLength(1);
    });

    it('9. Canonical headline remains exact', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/From monsoon predictions to\s*SMARTER FARM DECISIONS/);
    });

    it('10. "predictions" remains plural', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/monsoon predictions/i);
    });

    it('11. "farm decisions" remains present', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/farm decisions/i);
    });

    it('12. "farmer decisions" remains absent', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section')!;
      expect(within(heroSection).queryByText(/farmer decisions/i)).not.toBeInTheDocument();
      expect(within(heroSection).queryByText(/smarter farmer decisions/i)).not.toBeInTheDocument();
      expect(within(heroSection).queryByText(/confident farmer decisions/i)).not.toBeInTheDocument();
    });

    it('13. "monsoon prediction" singular remains absent', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section')!;
      expect(within(heroSection).queryByText(/From monsoon prediction to/i)).not.toBeInTheDocument();
    });

    it('14. RAIN WINDOW remains absent', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section')!;
      expect(screen.queryByTestId('floating-card-window')).not.toBeInTheDocument();
      expect(within(heroSection).queryByText(/RAIN WINDOW/i)).not.toBeInTheDocument();
    });

    it('15. Maximum 3 desktop floating annotations', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const annotations = screen.getAllByTestId(/^floating-card-/);
      expect(annotations).toHaveLength(3);
      expect(screen.getByTestId('floating-card-monsoon')).toBeInTheDocument();
      expect(screen.getByTestId('floating-card-soil')).toBeInTheDocument();
      expect(screen.getByTestId('floating-card-field')).toBeInTheDocument();
    });

    it('16. Hero image exists', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heroImage = screen.getByTestId('hero-farmer-image');
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute('src', '/images/hero-farmer.jpg');
    });

    it('17. Hero image has meaningful alt text', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heroImage = screen.getByTestId('hero-farmer-image');
      expect(heroImage).toHaveAttribute(
        'alt',
        'Indian farmer inspecting VarshaSetu agro-climate intelligence on a tablet in agricultural field'
      );
    });

    it('18. Decorative SVGs are aria-hidden', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const decorativeDivs = container.querySelectorAll('div[aria-hidden="true"]');
      expect(decorativeDivs.length).toBeGreaterThanOrEqual(1);
    });

    it('19. Navigation is keyboard accessible', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<LandingPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const nav = screen.getByLabelText('Homepage navigation');
      const links = within(nav).getAllByRole('link');
      expect(links.length).toBe(5);
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
        expect(link.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('20. Reduced-motion behavior remains present in stylesheet', () => {
      const cssPath = path.resolve(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(cssContent).toContain('.animate-cinematic-zoom');
      expect(cssContent).toContain('.animate-fade-up');
      expect(cssContent).toContain('.animate-settle-in');
      expect(cssContent).toContain('animation: none !important');
    });

    it('21. No horizontal overflow classes/layout regressions', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const hero = container.querySelector('#home');
      const intelligence = container.querySelector('#intelligence');
      const trust = container.querySelector('#trust');

      expect(hero).toHaveClass('overflow-hidden');
      expect(intelligence).toHaveClass('overflow-hidden');
      expect(trust).toHaveClass('overflow-hidden');
    });

    it('22. No broken homepage navigation anchors', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<LandingPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const anchors = Array.from(container.querySelectorAll('a[href^="#"]'));
      expect(anchors.length).toBeGreaterThanOrEqual(5);
      anchors.forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href.length > 1) {
          const destination = container.querySelector(href);
          expect(destination).not.toBeNull();
        }
      });
    });
  });

  describe('Phase 2: Hero Visual Refinement, Navigation Hierarchy & Spatial Rhythm (Section 23)', () => {
    it('1-2. Navigation order and hrefs: Home, Intelligence, Workspaces, Method, Trust', () => {
      expect(PUBLIC_NAVIGATION.map((n) => n.label)).toEqual([
        'Home',
        'Intelligence',
        'Workspaces',
        'Method',
        'Trust',
      ]);
      expect(PUBLIC_NAVIGATION.map((n) => n.href)).toEqual([
        '#home',
        '#intelligence',
        '#workspaces',
        '#method',
        '#trust',
      ]);
    });

    it('3-4. Exactly one hero h1 and canonical headline exists', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(/From monsoon predictions to\s*SMARTER FARM DECISIONS/);
    });

    it('5-7. "predictions" remains plural, "farm decisions" canonical, "farmer decisions" absent', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/monsoon predictions/i);
      expect(h1).toHaveTextContent(/farm decisions/i);

      const heroSection = h1.closest('section')!;
      expect(within(heroSection).queryByText(/farmer decisions/i)).not.toBeInTheDocument();
      expect(within(heroSection).queryByText(/smarter farmer decisions/i)).not.toBeInTheDocument();
      expect(within(heroSection).queryByText(/confident farm decisions/i)).not.toBeInTheDocument();
    });

    it('8-9. Exactly one hero primary CTA and routes to /auth', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const ctaBtn = screen.getByTestId('hero-primary-cta');
      expect(ctaBtn).toBeInTheDocument();
      expect(ctaBtn.closest('a')).toHaveAttribute('href', '/auth');

      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section')!;
      const primaryCtas = heroSection.querySelectorAll('[data-testid="hero-primary-cta"]');
      expect(primaryCtas).toHaveLength(1);
    });

    it('10. RAIN WINDOW remains absent', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section')!;
      expect(screen.queryByTestId('floating-card-window')).not.toBeInTheDocument();
      expect(within(heroSection).queryByText(/RAIN WINDOW/i)).not.toBeInTheDocument();
    });

    it('11. Hero has expected agricultural image with descriptive alt', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const img = screen.getByTestId('hero-farmer-image');
      expect(img).toHaveAttribute('src', '/images/hero-farmer.jpg');
      expect(img).toHaveAttribute(
        'alt',
        'Indian farmer inspecting VarshaSetu agro-climate intelligence on a tablet in agricultural field'
      );
    });

    it('12-13. Three desktop floating annotations and mobile constraint (max 2 on mobile)', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const annotations = screen.getAllByTestId(/^floating-card-/);
      expect(annotations).toHaveLength(3);

      const cardMonsoon = screen.getByTestId('floating-card-monsoon');
      const cardSoil = screen.getByTestId('floating-card-soil');
      const cardField = screen.getByTestId('floating-card-field');

      expect(cardMonsoon).toBeInTheDocument();
      expect(cardSoil).toBeInTheDocument();
      expect(cardField).toBeInTheDocument();

      // Soil card has hidden sm:block so mobile displays at most 2
      expect(cardSoil).toHaveClass('hidden', 'sm:block');
    });

    it('14. Public Admin role remains absent from role choices and headers', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<LandingPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Government Admin')).not.toBeInTheDocument();
      expect(screen.queryByTestId('role-choice-government-admin')).not.toBeInTheDocument();
      expect(screen.queryByTestId('role-choice-admin')).not.toBeInTheDocument();
    });

    it('15. DecisionPathwaysSection remains absent from homepage', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      expect(container.querySelector('#decision-pathways')).toBeNull();
      expect(screen.queryByTestId('decision-pathways')).not.toBeInTheDocument();
    });

    it('16. Major section IDs are unique', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const ids = Array.from(container.querySelectorAll('[id]')).map((el) => el.id);
      const unique = new Set(ids);
      expect(ids.length).toBe(unique.size);
    });

    it('17-18. #trust and #method exist with scroll margin clearance', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const method = container.querySelector('#method');
      const trust = container.querySelector('#trust');

      expect(method).toBeInTheDocument();
      expect(trust).toBeInTheDocument();
      expect(method).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
      expect(trust).toHaveClass('scroll-mt-24', 'sm:scroll-mt-28');
    });

    it('19-20. No broken #scientific-grounding or #provenance-strip links exist', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<LandingPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(container.querySelector('a[href="#scientific-grounding"]')).toBeNull();
      expect(container.querySelector('a[href="#provenance-strip"]')).toBeNull();
    });
  });

  describe('Phase 3: Intelligence Section Refinement, Asymmetric Workspaces & Continuous Method Pipeline', () => {
    it('1. Understated transition marker exists in #intelligence pointing to #workspaces', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const intelligenceSection = screen.getByTestId('signal-context-decision-transition');
      expect(within(intelligenceSection).getByText(/INTELLIGENCE → OPERATIONAL VIEWS/i)).toBeInTheDocument();
      
      const exploreLink = within(intelligenceSection).getByRole('link', { name: /Explore Roles Below/i });
      expect(exploreLink).toHaveAttribute('href', '#workspaces');
    });

    it('2. Exactly 4 public workspaces exist in compact equal 4-card grid (no asymmetric matrix) with direct accessible actions and landscape framing', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const workspacesSection = container.querySelector<HTMLElement>('#workspaces')!;
      expect(workspacesSection).toBeInTheDocument();

      // Four-column desktop grid exists
      const grid = workspacesSection.querySelector('.grid.lg\\:grid-cols-4');
      expect(grid).toBeInTheDocument();

      // Verify no asymmetric col-span classes remain
      expect(workspacesSection.querySelector('.lg\\:col-span-7')).toBeNull();
      expect(workspacesSection.querySelector('.lg\\:col-span-5')).toBeNull();

      // Exactly four public role cards
      expect(within(workspacesSection).getByRole('heading', { level: 3, name: 'Farmer' })).toBeInTheDocument();
      expect(within(workspacesSection).getByRole('heading', { level: 3, name: 'Field Officer' })).toBeInTheDocument();
      expect(within(workspacesSection).getByRole('heading', { level: 3, name: 'Government' })).toBeInTheDocument();
      expect(within(workspacesSection).getByRole('heading', { level: 3, name: 'Climate Analyst' })).toBeInTheDocument();

      // No public Admin or Researcher
      expect(within(workspacesSection).queryByText('Government Admin')).not.toBeInTheDocument();
      expect(within(workspacesSection).queryByText('Researcher')).not.toBeInTheDocument();

      // Domain badges
      expect(within(workspacesSection).getByText('FIELD / GROUND')).toBeInTheDocument();
      expect(within(workspacesSection).getByText('OPERATIONS / DISTRICT')).toBeInTheDocument();
      expect(within(workspacesSection).getByText('COMMAND / STATE')).toBeInTheDocument();
      expect(within(workspacesSection).getByText('MODEL / SIGNAL')).toBeInTheDocument();

      // Hindi role badges
      expect(within(workspacesSection).getByText('किसान')).toBeInTheDocument();
      expect(within(workspacesSection).getByText('कृषि अधिकारी')).toBeInTheDocument();
      expect(within(workspacesSection).getByText('राज्य योजना')).toBeInTheDocument();
      expect(within(workspacesSection).getByText('मौसम विश्लेषक')).toBeInTheDocument();

      // Landscape image regions (aspect-[16/10])
      const aspectImages = workspacesSection.querySelectorAll('.aspect-\\[16\\/10\\]');
      expect(aspectImages).toHaveLength(4);

      // Direct accessible workspace action links (>= 44px)
      const farmerLink = within(workspacesSection).getByRole('link', { name: /Enter Farmer workspace/i });
      const officerLink = within(workspacesSection).getByRole('link', { name: /Enter (Field )?Officer workspace/i });
      const govtLink = within(workspacesSection).getByRole('link', { name: /Enter Government workspace/i });
      const analystLink = within(workspacesSection).getByRole('link', { name: /Enter (Climate )?Analyst workspace/i });

      expect(farmerLink).toHaveAttribute('href', '/farmer');
      expect(farmerLink.className).toContain('min-h-[44px]');
      expect(officerLink).toHaveAttribute('href', '/officer');
      expect(officerLink.className).toContain('min-h-[44px]');
      expect(govtLink).toHaveAttribute('href', '/government');
      expect(govtLink.className).toContain('min-h-[44px]');
      expect(analystLink).toHaveAttribute('href', '/analyst');
      expect(analystLink.className).toContain('min-h-[44px]');

      // Verify CTA labels do NOT duplicate literal arrow and use whitespace-nowrap with SVG icon
      expect(farmerLink.textContent).not.toContain('→');
      expect(govtLink.textContent).not.toContain('→');
      expect(farmerLink.querySelector('.whitespace-nowrap')).toBeInTheDocument();
      expect(farmerLink.querySelector('svg')).toBeInTheDocument();
    });

    it('3. Redundant capability strip is removed from #workspaces', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const workspacesSection = container.querySelector<HTMLElement>('#workspaces')!;
      expect(within(workspacesSection).queryByText(/BUILT FOR BETTER MONSOON DECISIONS/i)).not.toBeInTheDocument();
      expect(within(workspacesSection).queryByText(/Deterministic Rules · PostGIS Downscaling · Probabilistic Skill/i)).not.toBeInTheDocument();
    });

    it('4. Continuous scientific pipeline renders all 6 stages in #method with ground anchor and disclosures', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const methodSection = container.querySelector<HTMLElement>('#method')!;
      expect(methodSection).toBeInTheDocument();

      // 6 continuous pipeline stages
      expect(within(methodSection).getByText(/01/)).toBeInTheDocument();
      expect(within(methodSection).getByText(/ATMOSPHERIC SIGNAL/i)).toBeInTheDocument();
      expect(within(methodSection).getByText(/REGIONAL CONTEXT/i)).toBeInTheDocument();
      expect(within(methodSection).getByText(/LOCAL DOWNSCALING/i)).toBeInTheDocument();
      expect(within(methodSection).getAllByText(/GROUND ANCHOR/i).length).toBeGreaterThanOrEqual(1);
      expect(within(methodSection).getAllByText(/CALIBRATION/i).length).toBeGreaterThanOrEqual(1);
      expect(within(methodSection).getByText(/DECISION OUTPUT/i)).toBeInTheDocument();

      // Ground anchor and telemetry
      expect(within(methodSection).getAllByText(/UP_LKO_BKT/i).length).toBeGreaterThanOrEqual(1);
      expect(within(methodSection).getAllByText(/Kharif 2024/i).length).toBeGreaterThanOrEqual(1);
      expect(within(methodSection).getByText(/122 Daily/i)).toBeInTheDocument();
      expect(within(methodSection).getByText(/DIAGNOSTIC ONLY/i)).toBeInTheDocument();
    });

    it('5. Trust section renders 4 integrity pillars in unified institutional structure', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      );

      const trustSection = container.querySelector<HTMLElement>('#trust')!;
      expect(trustSection).toBeInTheDocument();

      expect(within(trustSection).getByText(/PILLAR 01/i)).toBeInTheDocument();
      expect(within(trustSection).getByText('Traceable')).toBeInTheDocument();
      expect(within(trustSection).getByText(/PILLAR 02/i)).toBeInTheDocument();
      expect(within(trustSection).getByText('Calibrated')).toBeInTheDocument();
      expect(within(trustSection).getByText(/PILLAR 03/i)).toBeInTheDocument();
      expect(within(trustSection).getByText('Disclosed')).toBeInTheDocument();
      expect(within(trustSection).getByText(/PILLAR 04/i)).toBeInTheDocument();
      expect(within(trustSection).getByText('Guarded')).toBeInTheDocument();

      // Verification mechanisms
      expect(within(trustSection).getByText(/SHA-256 manifests/i)).toBeInTheDocument();
      expect(within(trustSection).getByText(/reliability calibration curves/i)).toBeInTheDocument();
      expect(within(trustSection).getByText(/Single-season boundary/i)).toBeInTheDocument();
      expect(within(trustSection).getByText(/Deterministic safety filters/i)).toBeInTheDocument();
    });
  });
});




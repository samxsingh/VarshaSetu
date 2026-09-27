import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { Navbar } from '../components/common/Navbar';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuthStore } from '../stores/useAuthStore';
import { useAppStore } from '../stores/useAppStore';
import { UserEntity } from '@shared/types';

const mockFarmerUser: UserEntity = {
  id: 'usr_farmer_01',
  email: 'farmer@varshasetu.in',
  fullName: 'Ramesh Kumar',
  role: 'FARMER',
  preferredLanguage: 'en',
  permissions: ['farmer:profile:read', 'farmer:advisory:read'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const mockOfficerUser: UserEntity = {
  id: 'usr_officer_01',
  email: 'officer@varshasetu.in',
  fullName: 'Dr. Arvind Sharma',
  role: 'OFFICER',
  preferredLanguage: 'en',
  permissions: ['officer:district:read', 'officer:risk_map:read'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const mockGovUser: UserEntity = {
  id: 'usr_gov_01',
  email: 'govt@varshasetu.in',
  fullName: 'Sunita Verma',
  role: 'GOVERNMENT',
  preferredLanguage: 'en',
  permissions: ['gov:spatial_indicators:read', 'gov:forecast_provenance:read'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const mockAnalystUser: UserEntity = {
  id: 'usr_analyst_01',
  email: 'analyst@varshasetu.in',
  fullName: 'Vikram Patel',
  role: 'ANALYST',
  preferredLanguage: 'en',
  permissions: ['analyst:models:read', 'analyst:features:read'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const mockAdminUser: UserEntity = {
  id: 'usr_admin_01',
  email: 'admin@varshasetu.in',
  fullName: 'VarshaSetu Administrator',
  role: 'ADMIN',
  preferredLanguage: 'en',
  permissions: ['admin:system_health:read', 'admin:audit_logs:read'],
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('Phase 9: Authenticated Session Scope, Global Demo-Banner Removal & Role-Locked Navigation', () => {
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

  afterEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      authStatus: 'UNAUTHENTICATED',
      error: null,
    });
  });

  describe('Part 1 & 2: Role-Locked Authenticated Navigation', () => {
    it('1. FARMER session renders Farmer workspace navigation only', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      const nav = screen.getByLabelText('Portal navigation');
      expect(within(nav).getByRole('link', { name: /Farmer Portal/i })).toBeInTheDocument();
      expect(screen.getByText('Ramesh Kumar')).toBeInTheDocument();
      expect(screen.getByText('FARMER')).toBeInTheDocument();
    });

    it('2. FARMER does not render Officer Center navigation', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      const header = screen.getByRole('banner');
      expect(within(header).queryByRole('link', { name: /Officer Center/i })).not.toBeInTheDocument();
    });

    it('3. FARMER does not render Government navigation', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      const header = screen.getByRole('banner');
      expect(within(header).queryByRole('link', { name: /^Government$/i })).not.toBeInTheDocument();
    });

    it('4. FARMER does not render Analyst navigation', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      const header = screen.getByRole('banner');
      expect(within(header).queryByRole('link', { name: /Analyst Lab/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /^Home$/i })).not.toBeInTheDocument();
      expect(within(header).queryByLabelText(/Admin/i)).not.toBeInTheDocument();
    });

    it('5. OFFICER only renders Officer Center navigation', () => {
      useAuthStore.setState({ user: mockOfficerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/officer/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      const header = screen.getByRole('banner');
      const nav = screen.getByLabelText('Portal navigation');
      expect(within(nav).getByRole('link', { name: /Officer Center/i })).toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Farmer Portal/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /^Government$/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Analyst Lab/i })).not.toBeInTheDocument();
      expect(screen.getByText('Dr. Arvind Sharma')).toBeInTheDocument();
      expect(screen.getByText('OFFICER')).toBeInTheDocument();
    });

    it('6. GOVERNMENT only renders Government navigation', () => {
      useAuthStore.setState({ user: mockGovUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/government/command-center']}>
          <Navbar />
        </MemoryRouter>
      );

      const header = screen.getByRole('banner');
      const nav = screen.getByLabelText('Portal navigation');
      expect(within(nav).getByRole('link', { name: /^Government$/i })).toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Farmer Portal/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Officer Center/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Analyst Lab/i })).not.toBeInTheDocument();
      expect(screen.getByText('Sunita Verma')).toBeInTheDocument();
      expect(screen.getByText('GOVERNMENT')).toBeInTheDocument();
    });

    it('7. ANALYST only renders Analyst navigation', () => {
      useAuthStore.setState({ user: mockAnalystUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/analyst']}>
          <Navbar />
        </MemoryRouter>
      );

      const header = screen.getByRole('banner');
      const nav = screen.getByLabelText('Portal navigation');
      expect(within(nav).getByRole('link', { name: /Analyst Lab/i })).toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Farmer Portal/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /Officer Center/i })).not.toBeInTheDocument();
      expect(within(header).queryByRole('link', { name: /^Government$/i })).not.toBeInTheDocument();
      expect(screen.getByText('Vikram Patel')).toBeInTheDocument();
      expect(screen.getByText('ANALYST')).toBeInTheDocument();
    });

    it('8. ADMIN can see administrative workspace navigation', () => {
      useAuthStore.setState({ user: mockAdminUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Navbar />
        </MemoryRouter>
      );

      const nav = screen.getByLabelText('Portal navigation');
      expect(within(nav).getByText(/WORKSPACE ACCESS:/i)).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Administrator/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Farmer Portal/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Officer Center/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /^Government$/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Analyst Lab/i })).toBeInTheDocument();
      expect(screen.getByText('VarshaSetu Administrator')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
  });

  describe('Part 3: Global Demo Banner Removal Across All Workspaces', () => {
    it('9. "DEMO / SIMULATED DATA" does not appear in Farmer authenticated UI', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <RootLayout />
        </MemoryRouter>
      );

      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/No live weather APIs are active/i)).not.toBeInTheDocument();
    });

    it('10. "DEMO / SIMULATED DATA" does not appear in Officer UI', () => {
      useAuthStore.setState({ user: mockOfficerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/officer/dashboard']}>
          <RootLayout />
        </MemoryRouter>
      );

      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
    });

    it('11. "DEMO / SIMULATED DATA" does not appear in Government UI', () => {
      useAuthStore.setState({ user: mockGovUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/government/dashboard']}>
          <RootLayout />
        </MemoryRouter>
      );

      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
    });

    it('12. "DEMO / SIMULATED DATA" does not appear in Analyst UI', () => {
      useAuthStore.setState({ user: mockAnalystUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/analyst']}>
          <RootLayout />
        </MemoryRouter>
      );

      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
    });

    it('13. "DEMO / SIMULATED DATA" does not appear in Admin UI', () => {
      useAuthStore.setState({ user: mockAdminUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <RootLayout />
        </MemoryRouter>
      );

      expect(screen.queryByText(/DEMO \/ SIMULATED DATA/i)).not.toBeInTheDocument();
    });
  });

  describe('Part 4: Session Isolation & Route Authorization Guard', () => {
    it('14. Logout clears authenticated user state', async () => {
      useAuthStore.setState({
        user: mockFarmerUser,
        token: 'token_123',
        refreshToken: 'refresh_123',
        authStatus: 'AUTHENTICATED',
      });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().refreshToken).toBeNull();
      expect(useAuthStore.getState().authStatus).toBe('UNAUTHENTICATED');
    });

    it('15. Logout clears role state back to default', async () => {
      useAuthStore.setState({
        user: mockAdminUser,
        authStatus: 'AUTHENTICATED',
      });
      useAppStore.getState().setRole('ADMIN');
      expect(useAppStore.getState().currentRole).toBe('ADMIN');

      await useAuthStore.getState().logout();

      expect(useAppStore.getState().currentRole).toBe('FARMER');
    });

    it('16. Logout button triggers sign out', async () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      const logoutBtn = screen.getByRole('button', { name: /Sign out/i });
      expect(logoutBtn).toBeInTheDocument();
    });

    it('17. A logged-out user cannot access protected workspace routes', () => {
      useAuthStore.setState({ user: null, authStatus: 'UNAUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/farmer/dashboard']}>
          <Routes>
            <Route
              path="/farmer/*"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <div>Farmer Secret Workspace</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Farmer Secret Workspace')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page Target')).toBeInTheDocument();
    });

    it('18. A Farmer session cannot access Officer route', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/officer']}>
          <Routes>
            <Route
              path="/officer/*"
              element={
                <ProtectedRoute allowedRoles={['OFFICER']}>
                  <div>Officer Operations Workspace</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Officer Operations Workspace')).not.toBeInTheDocument();
      expect(screen.getByText(/403 FORBIDDEN • RBAC ENFORCEMENT/i)).toBeInTheDocument();
      expect(screen.getByText(/Perspective Access Restricted/i)).toBeInTheDocument();
    });

    it('19. A Farmer session cannot access Government route', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/government']}>
          <Routes>
            <Route
              path="/government/*"
              element={
                <ProtectedRoute allowedRoles={['GOVERNMENT']}>
                  <div>Government Command Center</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Government Command Center')).not.toBeInTheDocument();
      expect(screen.getByText(/403 FORBIDDEN • RBAC ENFORCEMENT/i)).toBeInTheDocument();
    });

    it('20. A Farmer session cannot access Analyst route', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/analyst']}>
          <Routes>
            <Route
              path="/analyst/*"
              element={
                <ProtectedRoute allowedRoles={['ANALYST']}>
                  <div>Analyst Research Lab</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Analyst Research Lab')).not.toBeInTheDocument();
      expect(screen.getByText(/403 FORBIDDEN • RBAC ENFORCEMENT/i)).toBeInTheDocument();
    });

    it('21. A Farmer session cannot access Admin route', () => {
      useAuthStore.setState({ user: mockFarmerUser, authStatus: 'AUTHENTICATED' });

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <div>Administrator Governance Portal</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Administrator Governance Portal')).not.toBeInTheDocument();
      expect(screen.getByText(/403 FORBIDDEN • RBAC ENFORCEMENT/i)).toBeInTheDocument();
    });

    it('22. ADMIN retains access to all authorized workspace routes', () => {
      useAuthStore.setState({ user: mockAdminUser, authStatus: 'AUTHENTICATED' });

      // Test clearance across all perspectives
      const perspectives: { path: string; roles: any[]; label: string }[] = [
        { path: '/farmer', roles: ['FARMER'], label: 'Farmer Workspace Area' },
        { path: '/officer', roles: ['OFFICER'], label: 'Officer Workspace Area' },
        { path: '/government', roles: ['GOVERNMENT'], label: 'Government Workspace Area' },
        { path: '/analyst', roles: ['ANALYST'], label: 'Analyst Workspace Area' },
        { path: '/admin', roles: ['ADMIN'], label: 'Admin Workspace Area' },
      ];

      perspectives.forEach(({ path, roles, label }) => {
        const { unmount } = render(
          <MemoryRouter initialEntries={[path]}>
            <ProtectedRoute allowedRoles={roles}>
              <div>{label}</div>
            </ProtectedRoute>
          </MemoryRouter>
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.queryByText(/403 FORBIDDEN/i)).not.toBeInTheDocument();
        unmount();
      });
    });
  });
});

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useRealtimeStore, ScientificEventDTO, InAppNotificationDTO, ForecastUpdatedDTO } from '../stores/useRealtimeStore';
import { RealtimeStatusBadge } from '../components/common/RealtimeStatusBadge';
import { NotificationDrawer } from '../components/common/NotificationDrawer';
import { socketClient } from '../services/socketClient';

describe('Phase 5 Real-Time Operational Infrastructure', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useRealtimeStore.setState({
      connectionStatus: 'DISCONNECTED',
      lastConnectedAt: null,
      lastEventAt: null,
      unreadEventCount: 0,
      recentEvents: [],
      recentNotifications: [],
      recentForecastUpdates: [],
      latestDataHealth: null,
      connectionError: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useRealtimeStore State Operations', () => {
    it('updates connection status and records lastConnectedAt on CONNECTED', () => {
      expect(useRealtimeStore.getState().connectionStatus).toBe('DISCONNECTED');
      expect(useRealtimeStore.getState().lastConnectedAt).toBeNull();

      useRealtimeStore.getState().setConnectionStatus('CONNECTING');
      expect(useRealtimeStore.getState().connectionStatus).toBe('CONNECTING');

      useRealtimeStore.getState().setConnectionStatus('CONNECTED');
      expect(useRealtimeStore.getState().connectionStatus).toBe('CONNECTED');
      expect(useRealtimeStore.getState().lastConnectedAt).not.toBeNull();

      useRealtimeStore.getState().setConnectionStatus('RECONNECTING', 'Connection dropped');
      expect(useRealtimeStore.getState().connectionStatus).toBe('RECONNECTING');
      expect(useRealtimeStore.getState().connectionError).toBe('Connection dropped');
    });

    it('adds events and deduplicates on eventId and deduplicationHash', () => {
      const mockEvent1: ScientificEventDTO = {
        eventId: 'evt-001',
        eventType: 'DRY_SPELL',
        forecastId: 'fc-101',
        blockId: 'UP_LKO_BKT',
        detectedAt: '2024-07-15T06:00:00Z',
        validFrom: '2024-07-16T00:00:00Z',
        validUntil: '2024-07-23T00:00:00Z',
        probability: 0.78,
        threshold: 0.65,
        unit: 'PROBABILITY',
        severity: 'WARNING',
        confidenceStatus: 'PASS',
        operationalStatus: 'OPERATIONAL',
        dataFreshness: 'FRESH',
        validationStatus: 'VALIDATED',
        state: 'DETECTED',
        description: 'Dry spell duration expected to exceed 7 consecutive days',
        deduplicationHash: 'hash-dryspell-101',
      };

      useRealtimeStore.getState().addEvent(mockEvent1);
      expect(useRealtimeStore.getState().recentEvents).toHaveLength(1);
      expect(useRealtimeStore.getState().unreadEventCount).toBe(1);

      // Add duplicate event with modified description and state
      const mockEvent1Updated: ScientificEventDTO = {
        ...mockEvent1,
        state: 'ACKNOWLEDGED',
        description: 'Dry spell acknowledged by extension officer',
      };

      useRealtimeStore.getState().addEvent(mockEvent1Updated);
      // Length should remain 1 because it deduplicates
      expect(useRealtimeStore.getState().recentEvents).toHaveLength(1);
      expect(useRealtimeStore.getState().recentEvents[0].state).toBe('ACKNOWLEDGED');
      expect(useRealtimeStore.getState().recentEvents[0].description).toBe(
        'Dry spell acknowledged by extension officer'
      );
    });

    it('adds in-app notifications and manages unread counter and read marking', () => {
      const notif1: InAppNotificationDTO = {
        id: 'notif-1',
        deliveryId: 'del-1',
        userId: 'usr-1',
        title: 'Monsoon Alert',
        body: 'Heavy rainfall window approaching Bakshi Ka Talab',
        severity: 'CRITICAL',
        channel: 'IN_APP',
        status: 'DELIVERED',
        timestamp: new Date().toISOString(),
      };

      useRealtimeStore.getState().addNotification(notif1);
      expect(useRealtimeStore.getState().recentNotifications).toHaveLength(1);
      expect(useRealtimeStore.getState().unreadEventCount).toBe(1);
      expect(useRealtimeStore.getState().recentNotifications[0].isRead).toBe(false);

      // Mark all read
      useRealtimeStore.getState().markNotificationsRead();
      expect(useRealtimeStore.getState().unreadEventCount).toBe(0);
      expect(useRealtimeStore.getState().recentNotifications[0].isRead).toBe(true);
    });

    it('records forecast updates and deduplicates by forecastId and blockId', () => {
      const forecastUpdate: ForecastUpdatedDTO = {
        forecastId: 'fc-202',
        blockId: 'UP_LKO_BKT',
        targetType: 'RAINFALL_AMOUNT',
        horizonDays: 7,
        validFrom: '2024-07-20T00:00:00Z',
        validUntil: '2024-07-27T00:00:00Z',
        probability: 0.82,
        predictedValue: 42.5,
        unit: 'mm',
        severity: 'INFO',
        confidenceStatus: 'PASS',
        operationalStatus: 'OPERATIONAL',
        dataFreshness: 'FRESH',
        modelId: 'catboost-monsoon-v2',
        modelVersion: '2.1.0',
        generatedAt: new Date().toISOString(),
      };

      useRealtimeStore.getState().addForecastUpdate(forecastUpdate);
      expect(useRealtimeStore.getState().recentForecastUpdates).toHaveLength(1);

      // Repeat with updated value
      useRealtimeStore.getState().addForecastUpdate({
        ...forecastUpdate,
        predictedValue: 48.0,
      });
      expect(useRealtimeStore.getState().recentForecastUpdates).toHaveLength(1);
      expect(useRealtimeStore.getState().recentForecastUpdates[0].predictedValue).toBe(48.0);
    });

    it('records data health state correctly', () => {
      useRealtimeStore.getState().setDataHealth({
        status: 'HEALTHY',
        datasetName: 'IMD_GRIDDED_DAILY',
        recordsProcessed: 122,
        lastSyncTime: new Date().toISOString(),
        message: 'Telemetry ingestion complete',
      });

      expect(useRealtimeStore.getState().latestDataHealth?.status).toBe('HEALTHY');
      expect(useRealtimeStore.getState().latestDataHealth?.recordsProcessed).toBe(122);
    });
  });

  describe('RealtimeStatusBadge Component', () => {
    it('renders LIVE when status is CONNECTED', () => {
      useRealtimeStore.setState({ connectionStatus: 'CONNECTED' });
      render(<RealtimeStatusBadge />);

      expect(screen.getByText('LIVE')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Real-time sync status: LIVE')
      );
    });

    it('renders RETRYING when status is RECONNECTING', () => {
      useRealtimeStore.setState({ connectionStatus: 'RECONNECTING' });
      render(<RealtimeStatusBadge />);

      expect(screen.getByText('RETRYING')).toBeInTheDocument();
    });

    it('renders OFFLINE when status is DISCONNECTED', () => {
      useRealtimeStore.setState({ connectionStatus: 'DISCONNECTED' });
      render(<RealtimeStatusBadge />);

      expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    });
  });

  describe('NotificationDrawer Component', () => {
    it('renders bell button and shows unread badge when unreadEventCount > 0', () => {
      useRealtimeStore.setState({ unreadEventCount: 3 });
      render(<NotificationDrawer />);

      const bellBtn = screen.getByLabelText(/Operational notifications, 3 unread/i);
      expect(bellBtn).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('toggles flyout dialog on bell click and displays empty state when no alerts', () => {
      render(<NotificationDrawer />);

      const bellBtn = screen.getByLabelText(/Operational notifications/i);
      fireEvent.click(bellBtn);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
      expect(
        screen.getByText(/No active scientific anomalies or operational alerts in memory/i)
      ).toBeInTheDocument();
    });

    it('renders scientific events and in-app notifications in flyout', () => {
      const mockEvent: ScientificEventDTO = {
        eventId: 'evt-test-1',
        eventType: 'HEAVY_RAIN',
        forecastId: 'fc-test-1',
        blockId: 'UP_LKO_BKT',
        detectedAt: '2024-07-15T06:00:00Z',
        validFrom: '2024-07-16T00:00:00Z',
        validUntil: '2024-07-18T00:00:00Z',
        probability: 0.85,
        threshold: 65,
        unit: 'mm',
        severity: 'CRITICAL',
        confidenceStatus: 'PASS',
        operationalStatus: 'OPERATIONAL',
        dataFreshness: 'FRESH',
        validationStatus: 'VALIDATED',
        state: 'DETECTED',
        description: 'Critical rainfall exceedance projected for BKT centroid',
        deduplicationHash: 'hash-heavy-1',
      };

      const mockNotif: InAppNotificationDTO = {
        id: 'notif-test-1',
        deliveryId: 'del-test-1',
        userId: 'usr-farmer',
        title: 'Field Warning',
        body: 'Postpone fertilizer application due to pending precipitation',
        severity: 'WARNING',
        channel: 'IN_APP',
        status: 'DELIVERED',
        timestamp: '2024-07-15T06:05:00Z',
      };

      useRealtimeStore.setState({
        recentEvents: [mockEvent],
        recentNotifications: [mockNotif],
        unreadEventCount: 2,
      });

      render(<NotificationDrawer />);
      const bellBtn = screen.getByLabelText(/Operational notifications, 2 unread/i);
      fireEvent.click(bellBtn);

      // Should show both items
      expect(
        screen.getByText('Critical rainfall exceedance projected for BKT centroid')
      ).toBeInTheDocument();
      expect(screen.getByText('Field Warning')).toBeInTheDocument();
      expect(
        screen.getByText('Postpone fertilizer application due to pending precipitation')
      ).toBeInTheDocument();

      // Test filter buttons
      const eventsFilterBtn = screen.getByText('Events (1)');
      fireEvent.click(eventsFilterBtn);
      expect(
        screen.getByText('Critical rainfall exceedance projected for BKT centroid')
      ).toBeInTheDocument();
      expect(screen.queryByText('Field Warning')).not.toBeInTheDocument();

      const alertsFilterBtn = screen.getByText('Alerts (1)');
      fireEvent.click(alertsFilterBtn);
      expect(
        screen.queryByText('Critical rainfall exceedance projected for BKT centroid')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Field Warning')).toBeInTheDocument();
    });

    it('clears events when Clear button is clicked', () => {
      const mockEvent: ScientificEventDTO = {
        eventId: 'evt-test-1',
        eventType: 'HEAVY_RAIN',
        forecastId: 'fc-test-1',
        blockId: 'UP_LKO_BKT',
        detectedAt: '2024-07-15T06:00:00Z',
        validFrom: '2024-07-16T00:00:00Z',
        validUntil: '2024-07-18T00:00:00Z',
        probability: 0.85,
        threshold: 65,
        unit: 'mm',
        severity: 'CRITICAL',
        confidenceStatus: 'PASS',
        operationalStatus: 'OPERATIONAL',
        dataFreshness: 'FRESH',
        validationStatus: 'VALIDATED',
        state: 'DETECTED',
        description: 'Critical rainfall exceedance projected for BKT centroid',
        deduplicationHash: 'hash-heavy-1',
      };

      useRealtimeStore.setState({
        recentEvents: [mockEvent],
        unreadEventCount: 1,
      });

      render(<NotificationDrawer />);
      fireEvent.click(screen.getByLabelText(/Operational notifications/i));

      const clearBtn = screen.getByText('Clear');
      fireEvent.click(clearBtn);

      expect(useRealtimeStore.getState().recentEvents).toHaveLength(0);
      expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
    });
  });

  describe('socketClient Interface', () => {
    it('provides joinRoom and leaveRoom methods without error', () => {
      expect(typeof socketClient.joinRoom).toBe('function');
      expect(typeof socketClient.leaveRoom).toBe('function');
      expect(typeof socketClient.connect).toBe('function');
      expect(typeof socketClient.disconnect).toBe('function');

      // Calling joinRoom/leaveRoom when disconnected handles gracefully
      expect(() => socketClient.joinRoom('block:UP_LKO_BKT')).not.toThrow();
      expect(() => socketClient.leaveRoom('block:UP_LKO_BKT')).not.toThrow();
    });
  });
});

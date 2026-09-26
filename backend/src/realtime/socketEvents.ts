import { getIO, isSocketInitialized } from './socketServer';
import {
  ScientificEventDTO,
  ForecastUpdatedDTO,
  AdvisoryUpdatedDTO,
  DataHealthUpdatedDTO,
  InAppNotificationDTO,
  SystemAnnouncementDTO,
} from './types';
import { OperationalSignalDTO } from '../services/operational/operationalSignalTypes';


export const realtimeService = {
  /**
   * Broadcasts a newly detected scientific event to authorized block & role rooms.
   */
  emitEventCreated(event: ScientificEventDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms = [
      `block:${event.blockId}`,
      'role:officer',
      'role:government',
      'role:analyst',
      'role:admin',
    ];

    io.to(targetRooms).emit('event:created', event);
  },

  /**
   * Broadcasts event updates (e.g. probability change).
   */
  emitEventUpdated(event: ScientificEventDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms = [
      `block:${event.blockId}`,
      'role:officer',
      'role:government',
      'role:analyst',
      'role:admin',
    ];

    io.to(targetRooms).emit('event:updated', event);
  },

  /**
   * Broadcasts officer acknowledgement of a risk alert.
   */
  emitEventAcknowledged(event: ScientificEventDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms = [
      `block:${event.blockId}`,
      'role:officer',
      'role:government',
      'role:analyst',
      'role:admin',
    ];

    io.to(targetRooms).emit('event:acknowledged', event);
  },

  /**
   * Broadcasts resolution of a risk event period.
   */
  emitEventResolved(event: ScientificEventDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms = [
      `block:${event.blockId}`,
      'role:officer',
      'role:government',
      'role:analyst',
      'role:admin',
    ];

    io.to(targetRooms).emit('event:resolved', event);
  },

  /**
   * Broadcasts forecast expiration sweep event.
   */
  emitEventExpired(event: ScientificEventDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms = [
      `block:${event.blockId}`,
      'role:officer',
      'role:government',
      'role:analyst',
      'role:admin',
    ];

    io.to(targetRooms).emit('event:expired', event);
  },

  /**
   * Broadcasts newly generated or recalibrated forecast.
   * DTO is strictly sanitized to prevent leaking credentials or internal ML URLs.
   */
  emitForecastUpdated(forecast: ForecastUpdatedDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms = [
      `block:${forecast.blockId}`,
      'role:farmer',
      'role:officer',
      'role:government',
      'role:analyst',
      'role:admin',
    ];

    io.to(targetRooms).emit('forecast:updated', forecast);
  },

  /**
   * Broadcasts agronomic advisory status change or dispatch.
   */
  emitAdvisoryUpdated(advisory: AdvisoryUpdatedDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms = [
      `block:${advisory.blockId}`,
      'role:farmer',
      'role:officer',
      'role:admin',
    ];

    io.to(targetRooms).emit('advisory:updated', advisory);
  },

  /**
   * Broadcasts telemetry pipeline and ingestion status transitions.
   */
  emitDataHealthUpdated(health: DataHealthUpdatedDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms = ['role:analyst', 'role:admin'];
    io.to(targetRooms).emit('data_health:updated', health);
  },

  /**
   * Dispatches targeted in-app notification directly to a user's private channel.
   */
  emitNotification(userId: string, notification: InAppNotificationDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    io.to(`user:${userId}`).emit('notification:received', notification);
  },

  /**
   * Broadcasts institutional system announcements to all active users.
   */
  emitSystemAnnouncement(announcement: SystemAnnouncementDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    io.to('system:announcements').emit('system:announcement', announcement);
  },

  /**
   * Broadcasts an operational intelligence signal to authorized block and role rooms.
   */
  emitOperationalSignal(signal: OperationalSignalDTO): void {
    if (!isSocketInitialized()) return;
    const io = getIO();

    const targetRooms: string[] = ['role:admin', 'role:analyst'];

    if (signal.blockId) {
      targetRooms.push(`block:${signal.blockId}`);
    }

    if (signal.signalType !== 'MODEL_STATUS') {
      targetRooms.push('role:officer', 'role:government');
    }

    io.to(targetRooms).emit('operation:signal', signal);
  },
};


import { AuthenticatedSocketUser } from './types';

// Demonstration geographic IDs
const DEFAULT_DEMO_BLOCK = 'UP_LKO_BKT';
const LUCKNOW_BLOCKS = ['UP_LKO_BKT', 'UP_LKO_MAL', 'UP_LKO_MOH', 'UP_LKO_SAR', 'UP_LKO_GOS'];

export interface RoomAuthResult {
  allowed: boolean;
  reason?: string;
}

export function canJoinRoom(user: AuthenticatedSocketUser, room: string): RoomAuthResult {
  if (!user || !user.role) {
    return { allowed: false, reason: 'Unauthenticated' };
  }

  // Universal clearance for ADMIN
  if (user.role === 'ADMIN') {
    return { allowed: true };
  }

  // 1. User private notification room: user:<userId>
  if (room.startsWith('user:')) {
    const targetUserId = room.split(':')[1];
    if (targetUserId === user.userId) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Cannot join other users personal notification channel' };
  }

  // 2. Global system announcements room
  if (room === 'system:announcements') {
    return { allowed: true };
  }

  // 3. Role-based rooms: role:<roleName>
  if (room.startsWith('role:')) {
    const requestedRole = room.split(':')[1]?.toUpperCase();
    if (requestedRole === user.role) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Role '${user.role}' is not authorized to join '${room}'. Required role: '${requestedRole}'.`,
    };
  }

  // 4. Block-level geographic rooms: block:<blockId>
  if (room.startsWith('block:')) {
    const blockId = room.split(':')[1]?.toUpperCase();

    // Farmers are strictly localized to their assigned block
    if (user.role === 'FARMER') {
      const allowedBlock = (user.assignedLocationId || DEFAULT_DEMO_BLOCK).toUpperCase();
      if (blockId === allowedBlock) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `Farmer is restricted to assigned agricultural block '${allowedBlock}'. Access to '${blockId}' is prohibited.`,
      };
    }

    // Officers can access blocks within their administrative circle (Lucknow blocks by default)
    if (user.role === 'OFFICER') {
      if (LUCKNOW_BLOCKS.includes(blockId) || blockId.startsWith('UP_LKO_')) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `Officer is restricted to Lucknow circle blocks. Access to '${blockId}' is prohibited.`,
      };
    }

    // Government, Analyst have regional monitoring access
    if (user.role === 'GOVERNMENT' || user.role === 'ANALYST') {
      return { allowed: true };
    }
  }

  // 5. District-level geographic rooms: district:<districtId>
  if (room.startsWith('district:')) {
    if (user.role === 'FARMER') {
      return {
        allowed: false,
        reason: 'Farmer perspective is strictly hyperlocal (block/panchayat level). District rooms prohibited.',
      };
    }
    return { allowed: true };
  }

  // 6. State-level geographic rooms: state:<stateId>
  if (room.startsWith('state:')) {
    if (user.role === 'FARMER' || user.role === 'OFFICER') {
      return {
        allowed: false,
        reason: 'State-wide operational signals are restricted to Government and Analyst perspectives.',
      };
    }
    return { allowed: true };
  }

  // Unknown room formats rejected by default
  return { allowed: false, reason: `Unknown or unauthorized room format: '${room}'` };
}

export function getAutomaticRooms(user: AuthenticatedSocketUser): string[] {
  const rooms: string[] = [];

  // Personal room
  rooms.push(`user:${user.userId}`);

  // Role room
  rooms.push(`role:${user.role.toLowerCase()}`);

  // Global announcements
  rooms.push('system:announcements');

  // Geographic auto-join based on assignedLocationId
  if (user.role === 'FARMER') {
    const blockId = (user.assignedLocationId || DEFAULT_DEMO_BLOCK).toUpperCase();
    rooms.push(`block:${blockId}`);
  } else if (user.role === 'OFFICER') {
    rooms.push(`block:${DEFAULT_DEMO_BLOCK}`);
    rooms.push('district:UP_LKO');
  } else if (user.role === 'GOVERNMENT') {
    rooms.push('district:UP_LKO');
    rooms.push('state:UP');
  }

  return rooms;
}

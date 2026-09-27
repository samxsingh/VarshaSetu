import { userRepository, UserRow } from '../repositories/userRepository';
import { auditRepository } from '../repositories/auditRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { signAuthToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { UserEntity, UserRole, PermissionScope } from '@shared/types';
import { env } from '../config/env';

// Default permissions by role
const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, PermissionScope[]> = {
  FARMER: [
    'farmer:profile:read',
    'farmer:profile:write',
    'farmer:advisory:read',
    'farmer:simulator:execute',
  ],
  OFFICER: [
    'officer:district:read',
    'officer:panchayat:read',
    'officer:bulletin:broadcast',
    'officer:risk_map:read',
  ],
  GOVERNMENT: [
    'gov:spatial_indicators:read',
    'gov:forecast_provenance:read',
    'gov:validation_reports:read',
  ],
  ANALYST: [
    'analyst:models:read',
    'analyst:features:read',
    'analyst:hindcasting:execute',
    'analyst:validation:write',
  ],
  ADMIN: [
    'admin:users:manage',
    'admin:datasources:manage',
    'admin:system_health:read',
    'admin:audit_logs:read',
    'admin:config:write',
  ],
};

function toUserEntity(row: UserRow): UserEntity {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    email: row.email,
    preferredLanguage: row.preferred_language,
    assignedLocationId: row.assigned_location_id,
    permissions: row.permissions || ROLE_DEFAULT_PERMISSIONS[row.role] || [],
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export const authService = {
  async login(payload: {
    phoneNumber?: string;
    email?: string;
    password?: string;
    otp?: string;
    ipAddress?: string;
  }): Promise<{ token: string; refreshToken: string; user: UserEntity }> {
    let userRow: UserRow | null = null;

    if (payload.email) {
      userRow = await userRepository.findByEmail(payload.email);
    } else if (payload.phoneNumber) {
      userRow = await userRepository.findByPhone(payload.phoneNumber);
    }

    if (!userRow) {
      throw new UnauthorizedError('Invalid credentials or user not registered');
    }

    if (!userRow.is_active) {
      throw new UnauthorizedError('User account has been deactivated');
    }

    // Password verification or demo OTP bypass
    let isPasswordValid = false;

    if (payload.password) {
      isPasswordValid = await comparePassword(payload.password, userRow.password_hash);
    } else if (payload.otp) {
      if (env.NODE_ENV === 'production') {
        throw new UnauthorizedError('OTP login is disabled in production without configured SMS gateway');
      }
      // Demo OTP accepted for farmer convenience in development environment
      isPasswordValid = payload.otp === '123456';
    }

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await userRepository.updateLastLogin(userRow.id);

    // Audit log
    await auditRepository.log({
      userId: userRow.id,
      action: 'USER_LOGIN',
      resourceType: 'users',
      resourceId: userRow.id,
      metadata: { role: userRow.role, method: payload.email ? 'email' : 'phone' },
      ipAddress: payload.ipAddress,
    });

    const user = toUserEntity(userRow);
    const token = signAuthToken({
      userId: user.id,
      role: user.role,
      permissions: user.permissions,
      assignedLocationId: user.assignedLocationId,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      role: user.role,
    });

    return { token, refreshToken, user };
  },

  async register(payload: {
    fullName: string;
    phoneNumber?: string;
    email?: string;
    password: string;
    role: UserRole;
    preferredLanguage?: string;
    assignedLocationId?: string;
    ipAddress?: string;
  }): Promise<{ token: string; refreshToken: string; user: UserEntity }> {
    // Prevent unauthenticated self-registration privilege escalation
    if (payload.role && payload.role !== 'FARMER') {
      throw new ForbiddenError(
        `Self-registration is restricted to FARMER role. Roles such as '${payload.role}' require administrator assignment.`
      );
    }
    if (payload.email) {
      const existing = await userRepository.findByEmail(payload.email);
      if (existing) {
        throw new ConflictError('A user with this email address already exists');
      }
    }

    if (payload.phoneNumber) {
      const existing = await userRepository.findByPhone(payload.phoneNumber);
      if (existing) {
        throw new ConflictError('A user with this phone number already exists');
      }
    }

    const passwordHash = await hashPassword(payload.password);
    const permissions = ROLE_DEFAULT_PERMISSIONS[payload.role] || [];

    const created = await userRepository.create({
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      role: payload.role,
      passwordHash,
      preferredLanguage: payload.preferredLanguage || 'hi',
      assignedLocationId: payload.assignedLocationId,
      permissions,
    });

    await auditRepository.log({
      userId: created.id,
      action: 'USER_REGISTERED',
      resourceType: 'users',
      resourceId: created.id,
      metadata: { role: created.role },
      ipAddress: payload.ipAddress,
    });

    const user = toUserEntity(created);
    const token = signAuthToken({
      userId: user.id,
      role: user.role,
      permissions: user.permissions,
      assignedLocationId: user.assignedLocationId,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      role: user.role,
    });

    return { token, refreshToken, user };
  },

  async refresh(refreshTokenStr: string): Promise<{ token: string; refreshToken: string; user: UserEntity }> {
    try {
      const payload = verifyRefreshToken(refreshTokenStr);
      const userRow = await userRepository.findById(payload.userId);
      if (!userRow || !userRow.is_active) {
        throw new UnauthorizedError('User does not exist or has been disabled');
      }
      const user = toUserEntity(userRow);
      const token = signAuthToken({
        userId: user.id,
        role: user.role,
        permissions: user.permissions,
        assignedLocationId: user.assignedLocationId,
      });
      const newRefreshToken = signRefreshToken({
        userId: user.id,
        role: user.role,
      });
      return { token, refreshToken: newRefreshToken, user };
    } catch (err: any) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Invalid or expired refresh token', { original: err.message });
    }
  },

  async getCurrentUser(userId: string): Promise<UserEntity> {
    const userRow = await userRepository.findById(userId);
    if (!userRow) {
      throw new NotFoundError('User not found');
    }
    return toUserEntity(userRow);
  },

  async demoLogin(role: UserRole, ipAddress?: string): Promise<{ token: string; refreshToken: string; user: UserEntity }> {
    if (!env.ENABLE_DEMO_ACCOUNTS) {
      throw new ForbiddenError('Demo authentication is disabled in this environment');
    }

    const demoPhoneMap: Record<UserRole, string> = {
      FARMER: '+919876543210',
      OFFICER: '+919876543211',
      GOVERNMENT: '+919876543212',
      ANALYST: '+919876543213',
      ADMIN: '+919876543214',
    };

    const phoneNumber = demoPhoneMap[role];
    let userRow: UserRow | null = null;
    if (phoneNumber) {
      userRow = await userRepository.findByPhone(phoneNumber);
    }
    if (!userRow) {
      const emailMap: Record<UserRole, string> = {
        FARMER: 'farmer@varshasetu.in',
        OFFICER: 'officer@varshasetu.in',
        GOVERNMENT: 'gov@varshasetu.in',
        ANALYST: 'analyst@varshasetu.in',
        ADMIN: 'admin@varshasetu.in',
      };
      userRow = await userRepository.findByEmail(emailMap[role]);
    }

    if (!userRow) {
      throw new NotFoundError(`Demo user for role ${role} not found in database`);
    }

    if (!userRow.is_active) {
      throw new UnauthorizedError('Demo user account is disabled');
    }

    await userRepository.updateLastLogin(userRow.id);

    await auditRepository.log({
      userId: userRow.id,
      action: 'DEMO_LOGIN',
      resourceType: 'users',
      resourceId: userRow.id,
      metadata: { role: userRow.role, method: 'demo_auto' },
      ipAddress,
    });

    const user = toUserEntity(userRow);
    const token = signAuthToken({
      userId: user.id,
      role: user.role,
      permissions: user.permissions,
      assignedLocationId: user.assignedLocationId,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      role: user.role,
    });

    return { token, refreshToken, user };
  },
};

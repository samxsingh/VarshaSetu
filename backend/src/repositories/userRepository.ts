import { query } from '../db/pool';
import { UserRole, PermissionScope } from '@shared/types';
import { User, IUser } from '../models/User';
import { isDatabaseConnected } from '../config/database';

export interface UserRow {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number?: string;
  email?: string;
  password_hash: string;
  preferred_language: string;
  assigned_location_id?: string;
  permissions: PermissionScope[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function mongoDocToRow(doc: IUser): UserRow {
  return {
    id: (doc._id as any).toString(),
    role: doc.role,
    full_name: doc.fullName,
    phone_number: doc.phoneNumber || undefined,
    email: doc.email || undefined,
    password_hash: doc.passwordHash,
    preferred_language: doc.preferredLanguage || 'hi',
    assigned_location_id: doc.assignedLocationId ? doc.assignedLocationId.toString() : undefined,
    permissions: doc.permissions || [],
    is_active: doc.isActive !== false,
    created_at: doc.createdAt || new Date(),
    updated_at: doc.updatedAt || new Date(),
  };
}

export const userRepository = {
  async findById(id: string): Promise<UserRow | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await User.findById(id);
        if (doc) return mongoDocToRow(doc);
      } catch (err) {
        // Fall through to legacy if id was not valid ObjectId or error
      }
    }
    // Legacy PostgreSQL fallback
    try {
      const res = await query<UserRow>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (doc) return mongoDocToRow(doc);
      } catch (err) {
        // Fall through
      }
    }
    // Legacy PostgreSQL fallback
    try {
      const res = await query<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async findByPhone(phone: string): Promise<UserRow | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await User.findOne({ phoneNumber: phone });
        if (doc) return mongoDocToRow(doc);
      } catch (err) {
        // Fall through
      }
    }
    // Legacy PostgreSQL fallback
    try {
      const res = await query<UserRow>('SELECT * FROM users WHERE phone_number = $1 LIMIT 1', [phone]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  },

  async create(user: {
    fullName: string;
    phoneNumber?: string;
    email?: string;
    role: UserRole;
    passwordHash: string;
    preferredLanguage?: string;
    assignedLocationId?: string;
    permissions: PermissionScope[];
  }): Promise<UserRow> {
    if (isDatabaseConnected()) {
      const doc = await User.create({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || undefined,
        email: user.email || undefined,
        role: user.role,
        passwordHash: user.passwordHash,
        preferredLanguage: user.preferredLanguage || 'hi',
        assignedLocationId: user.assignedLocationId as any,
        permissions: user.permissions,
        isActive: true,
      });
      return mongoDocToRow(doc);
    }

    // Legacy PostgreSQL fallback
    const res = await query<UserRow>(
      `INSERT INTO users (
        full_name, phone_number, email, role, password_hash,
        preferred_language, assigned_location_id, permissions, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *`,
      [
        user.fullName,
        user.phoneNumber || null,
        user.email || null,
        user.role,
        user.passwordHash,
        user.preferredLanguage || 'hi',
        user.assignedLocationId || null,
        user.permissions,
      ]
    );
    return res.rows[0];
  },

  async updateLastLogin(id: string): Promise<void> {
    if (isDatabaseConnected()) {
      try {
        await User.findByIdAndUpdate(id, { updatedAt: new Date() });
        return;
      } catch {
        // Fall through
      }
    }
    try {
      await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [id]);
    } catch {
      // Ignored
    }
  },
};

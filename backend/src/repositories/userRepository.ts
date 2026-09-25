import { query } from '../db/pool';
import { UserRole, PermissionScope } from '@shared/types';

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

export const userRepository = {
  async findById(id: string): Promise<UserRow | null> {
    const res = await query<UserRow>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    const res = await query<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
    return res.rows[0] || null;
  },

  async findByPhone(phone: string): Promise<UserRow | null> {
    const res = await query<UserRow>('SELECT * FROM users WHERE phone_number = $1 LIMIT 1', [phone]);
    return res.rows[0] || null;
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
    await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [id]);
  },
};

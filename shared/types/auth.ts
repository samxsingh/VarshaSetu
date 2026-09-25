/**
 * VarshaSetu - Role-Based Access Control (RBAC) & Authentication Types
 * Five distinct persona roles with granular permission scopes.
 */

export type UserRole =
  | 'FARMER'
  | 'OFFICER'
  | 'GOVERNMENT'
  | 'ANALYST'
  | 'ADMIN';

export type PermissionScope =
  // Farmer domain
  | 'farmer:profile:read'
  | 'farmer:profile:write'
  | 'farmer:advisory:read'
  | 'farmer:simulator:execute'
  
  // Officer domain
  | 'officer:district:read'
  | 'officer:panchayat:read'
  | 'officer:bulletin:broadcast'
  | 'officer:risk_map:read'
  
  // Government / Met domain
  | 'gov:spatial_indicators:read'
  | 'gov:forecast_provenance:read'
  | 'gov:validation_reports:read'
  
  // Analyst domain
  | 'analyst:models:read'
  | 'analyst:features:read'
  | 'analyst:hindcasting:execute'
  | 'analyst:validation:write'
  
  // Admin domain
  | 'admin:users:manage'
  | 'admin:datasources:manage'
  | 'admin:system_health:read'
  | 'admin:audit_logs:read'
  | 'admin:config:write';

export interface UserEntity {
  id: string;
  phoneNumber?: string;
  email?: string;
  role: UserRole;
  fullName: string;
  preferredLanguage: 'hi' | 'en' | string;
  assignedLocationId?: string; // Links officer/farmer to their primary district/panchayat/village
  permissions: PermissionScope[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSessionTokenPayload {
  userId: string;
  role: UserRole;
  permissions: PermissionScope[];
  assignedLocationId?: string;
  iat: number;
  exp: number;
}

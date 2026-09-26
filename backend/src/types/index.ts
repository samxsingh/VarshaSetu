import { Request } from 'express';
import { UserRole, PermissionScope, UserEntity } from '@shared/types';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  permissions: PermissionScope[];
  fullName: string;
  phoneNumber?: string;
  email?: string;
  assignedLocationId?: string;
  preferredLanguage?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

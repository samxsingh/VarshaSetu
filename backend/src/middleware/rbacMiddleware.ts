import { Response, NextFunction } from 'express';
import { UserRole, PermissionScope } from '@shared/types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // ADMIN role has implicit superuser clearance across all workspaces
    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(
      new ForbiddenError(
        `Access denied for role '${req.user.role}'. Required: [${allowedRoles.join(', ')}]`,
        { currentRole: req.user.role, allowedRoles }
      )
    );
  };
}

export function requirePermission(requiredPermissions: PermissionScope[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // ADMIN role has implicit superuser access
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const userPerms = new Set(req.user.permissions || []);
    const missing = requiredPermissions.filter((p) => !userPerms.has(p));

    if (missing.length > 0) {
      return next(
        new ForbiddenError(
          `Insufficient permissions. Missing: [${missing.join(', ')}]`,
          { missingPermissions: missing }
        )
      );
    }

    next();
  };
}

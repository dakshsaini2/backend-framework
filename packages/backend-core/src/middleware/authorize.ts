import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

/**
 * Role-based authorization middleware factory.
 * Must be used after authenticate middleware.
 *
 * @example
 * router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);
 * router.get('/reports', authenticate, authorize('ADMIN', 'MANAGER'), getReports);
 */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized("Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden("Insufficient permissions"));
      return;
    }

    next();
  };
}

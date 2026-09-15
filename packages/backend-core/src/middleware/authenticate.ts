import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../auth/jwt";
import { AppError } from "../errors/app-error";

/**
 * Creates an authentication middleware configured with a specific JWT secret.
 * Use this when you want explicit control over the secret.
 */
export function createAuthMiddleware(secret: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next(AppError.unauthorized("Missing or invalid authorization header"));
        return;
      }

      const token = authHeader.slice(7);

      if (!token) {
        next(AppError.unauthorized("Missing token"));
        return;
      }

      const payload = verifyAccessToken(token, secret);

      req.user = {
        id: payload.sub,
        role: payload.role,
      };

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(AppError.unauthorized("Invalid or expired token"));
    }
  };
}

/**
 * Default authentication middleware.
 * Reads JWT_ACCESS_SECRET from process.env at request time.
 * Requires dotenv or equivalent to be loaded before the first request.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    next(
      new AppError("JWT_ACCESS_SECRET is not configured", 500, "CONFIG_ERROR"),
    );
    return;
  }

  createAuthMiddleware(secret)(req, res, next);
}

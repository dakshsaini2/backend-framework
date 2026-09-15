import type { Response } from "express";

/**
 * Send a standardized success response.
 *
 * @example
 * sendSuccess(res, { id: '1', name: 'John' });
 * sendSuccess(res, createdUser, 201);
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send a standardized error response.
 *
 * @example
 * sendError(res, 'User not found', 404, 'NOT_FOUND');
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = "INTERNAL_ERROR",
  details?: unknown[],
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    },
  });
}

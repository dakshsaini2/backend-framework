import type { Request, Response } from "express";

/**
 * 404 Not Found handler for unmatched routes.
 * Place after all route definitions.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { logger } from "../utils/logger";

/**
 * Checks if an error looks like a Prisma PrismaClientKnownRequestError.
 * We check by shape instead of instanceof to avoid requiring @prisma/client as a dependency.
 */
function isPrismaError(
  error: unknown,
): error is { code: string; meta?: Record<string, unknown> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string" &&
    String((error as Record<string, unknown>).code).startsWith("P")
  );
}

function handlePrismaError(
  error: { code: string; meta?: Record<string, unknown> },
  res: Response,
): void {
  switch (error.code) {
    case "P2002":
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "A record with this value already exists",
        },
      });
      return;
    case "P2025":
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Record not found",
        },
      });
      return;
    default:
      res.status(500).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "A database error occurred",
        },
      });
  }
}

/**
 * Global error handler middleware.
 * Handles AppError, ZodError, JWT errors, Prisma errors, and unknown errors.
 * In production, stack traces and internal details are never leaked.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // AppError — application-level errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && err.details.length > 0
          ? { details: err.details }
          : {}),
      },
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
      },
    });
    return;
  }

  // JWT token expired
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Token has expired",
      },
    });
    return;
  }

  // JWT invalid token
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    });
    return;
  }

  // Prisma errors (detected by shape, not by instanceof)
  if (isPrismaError(err)) {
    handlePrismaError(err, res);
    return;
  }

  // Unknown / unexpected errors
  logger.error({ err }, "Unhandled error");

  const isProduction = process.env.NODE_ENV === "production";

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: isProduction ? "Internal server error" : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
}

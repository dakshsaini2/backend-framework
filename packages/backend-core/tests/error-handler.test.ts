import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../src/middleware/error-handler";
import { AppError } from "../src/errors/app-error";
import { ZodError, ZodIssueCode } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

function createMockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

function createMockReq(): Request {
  return {} as Request;
}

describe("Error Handler Middleware", () => {
  const next = vi.fn() as NextFunction;
  let req: Request;

  beforeEach(() => {
    req = createMockReq();
    vi.clearAllMocks();
  });

  it("should handle AppError", () => {
    const res = createMockRes();
    const error = AppError.notFound("User not found");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "User not found",
      },
    });
  });

  it("should handle AppError with details", () => {
    const res = createMockRes();
    const error = new AppError("Validation failed", 400, "VALIDATION_ERROR", [
      { field: "email", message: "Required" },
    ]);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: [{ field: "email", message: "Required" }],
      },
    });
  });

  it("should handle ZodError", () => {
    const res = createMockRes();
    const error = new ZodError([
      {
        code: ZodIssueCode.too_small,
        minimum: 8,
        type: "string",
        inclusive: true,
        exact: false,
        message: "Password must be at least 8 characters",
        path: ["password"],
      },
    ]);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: [
          {
            field: "password",
            message: "Password must be at least 8 characters",
          },
        ],
      },
    });
  });

  it("should handle TokenExpiredError", () => {
    const res = createMockRes();
    const error = new TokenExpiredError("jwt expired", new Date());

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Token has expired",
      },
    });
  });

  it("should handle JsonWebTokenError", () => {
    const res = createMockRes();
    const error = new JsonWebTokenError("invalid signature");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    });
  });

  it("should handle Prisma unique constraint error (P2002)", () => {
    const res = createMockRes();
    const error = Object.assign(new Error("Unique constraint"), {
      code: "P2002",
      meta: { target: ["email"] },
    });

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "CONFLICT",
        message: "A record with this value already exists",
      },
    });
  });

  it("should handle Prisma not found error (P2025)", () => {
    const res = createMockRes();
    const error = Object.assign(new Error("Record not found"), {
      code: "P2025",
    });

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should handle unknown errors in development", () => {
    const res = createMockRes();
    vi.stubEnv("NODE_ENV", "development");
    const error = new Error("Something unexpected");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const jsonCall = vi.mocked(res.json).mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    const errorBody = jsonCall.error as Record<string, unknown>;
    expect(errorBody.message).toBe("Something unexpected");
    // Stack trace included in development
    expect(errorBody.stack).toBeDefined();
  });

  it("should hide error details in production", () => {
    const res = createMockRes();
    vi.stubEnv("NODE_ENV", "production");
    const error = new Error("Internal DB connection failed with password xyz");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const jsonCall = vi.mocked(res.json).mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    const errorBody = jsonCall.error as Record<string, unknown>;
    expect(errorBody.message).toBe("Internal server error");
    expect(errorBody.stack).toBeUndefined();
  });
});

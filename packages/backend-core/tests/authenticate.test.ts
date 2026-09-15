import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  authenticate,
  createAuthMiddleware,
} from "../src/middleware/authenticate";
import { generateAccessToken } from "../src/auth/jwt";

const SECRET = "test-access-secret-key-at-least-32-chars-long!!";

function createMockReq(authHeader?: string): Partial<Request> {
  return {
    headers: {
      ...(authHeader ? { authorization: authHeader } : {}),
    } as Request["headers"],
  };
}

function createMockRes(): Partial<Response> {
  return {};
}

describe("Authentication Middleware", () => {
  describe("createAuthMiddleware", () => {
    const middleware = createAuthMiddleware(SECRET);

    it("should reject request with no authorization header", () => {
      const req = createMockReq() as Request;
      const res = createMockRes() as Response;
      const next = vi.fn() as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: expect.stringContaining("authorization"),
        }),
      );
    });

    it("should reject request with non-Bearer token", () => {
      const req = createMockReq("Basic abc123") as Request;
      const res = createMockRes() as Response;
      const next = vi.fn() as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 }),
      );
    });

    it("should reject request with invalid token", () => {
      const req = createMockReq("Bearer invalid-token") as Request;
      const res = createMockRes() as Response;
      const next = vi.fn() as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 }),
      );
    });

    it("should accept request with valid token and attach user", () => {
      const token = generateAccessToken(
        { sub: "user-123", role: "ADMIN" },
        SECRET,
        "1h",
      );
      const req = createMockReq(`Bearer ${token}`) as Request;
      const res = createMockRes() as Response;
      const next = vi.fn() as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual({ id: "user-123", role: "ADMIN" });
    });
  });

  describe("authenticate (env-based)", () => {
    beforeEach(() => {
      vi.stubEnv("JWT_ACCESS_SECRET", SECRET);
    });

    it("should work when JWT_ACCESS_SECRET env var is set", () => {
      const token = generateAccessToken(
        { sub: "user-456", role: "USER" },
        SECRET,
        "1h",
      );
      const req = createMockReq(`Bearer ${token}`) as Request;
      const res = createMockRes() as Response;
      const next = vi.fn() as NextFunction;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual({ id: "user-456", role: "USER" });
    });

    it("should fail when JWT_ACCESS_SECRET env var is not set", () => {
      vi.stubEnv("JWT_ACCESS_SECRET", "");

      const req = createMockReq("Bearer some-token") as Request;
      const res = createMockRes() as Response;
      const next = vi.fn() as NextFunction;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 500 }),
      );
    });
  });
});

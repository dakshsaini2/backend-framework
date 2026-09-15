import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { authorize } from "../src/middleware/authorize";

function createMockReq(user?: { id: string; role: string }): Partial<Request> {
  return { user };
}

function createMockRes(): Partial<Response> {
  return {};
}

describe("Authorization Middleware", () => {
  it("should allow request when user has the required role", () => {
    const middleware = authorize("ADMIN");
    const req = createMockReq({ id: "1", role: "ADMIN" }) as Request;
    const res = createMockRes() as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should allow request when user has one of multiple allowed roles", () => {
    const middleware = authorize("ADMIN", "MANAGER");
    const req = createMockReq({ id: "1", role: "MANAGER" }) as Request;
    const res = createMockRes() as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should reject request when user role is not allowed", () => {
    const middleware = authorize("ADMIN");
    const req = createMockReq({ id: "1", role: "USER" }) as Request;
    const res = createMockRes() as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("should reject request when user is not authenticated", () => {
    const middleware = authorize("ADMIN");
    const req = createMockReq() as Request;
    const res = createMockRes() as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: "UNAUTHORIZED",
      }),
    );
  });
});

import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../src/utils/async-handler";

function createMockReq(): Request {
  return {} as Request;
}

function createMockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("asyncHandler", () => {
  it("should call the async function and pass through", async () => {
    const handler = vi.fn(async (_req: Request, res: Response) => {
      res.status(200).json({ success: true });
    });
    const wrapped = asyncHandler(handler);
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn() as NextFunction;

    wrapped(req, res, next);

    // Allow the promise to resolve
    await new Promise((r) => setTimeout(r, 10));

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("should forward errors to next()", async () => {
    const error = new Error("Something broke");
    const handler = vi.fn(async () => {
      throw error;
    });
    const wrapped = asyncHandler(handler);
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn() as NextFunction;

    wrapped(req, res, next);

    // Allow the promise to reject
    await new Promise((r) => setTimeout(r, 10));

    expect(next).toHaveBeenCalledWith(error);
  });
});

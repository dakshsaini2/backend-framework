import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../errors/app-error";

/**
 * Request body validation middleware using Zod schemas.
 *
 * @example
 * router.post('/register', validate(registerSchema), registerController);
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      // Replace body with parsed (cleaned) data
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        next(
          new AppError("Validation failed", 400, "VALIDATION_ERROR", details),
        );
        return;
      }
      next(error);
    }
  };
}

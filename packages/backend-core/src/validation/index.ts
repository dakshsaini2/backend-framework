import { z } from "zod";

/** Email validation schema — normalizes to lowercase and trims whitespace */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .trim();

/** Password validation — minimum 8 chars, requires uppercase, lowercase, number, and special char */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

/** Name validation — 2 to 100 characters, trimmed */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters")
  .trim();

/** UUID validation */
export const uuidSchema = z.string().uuid("Invalid ID format");

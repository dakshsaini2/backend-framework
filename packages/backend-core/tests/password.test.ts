import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../src/auth/password";

describe("Password Utilities", () => {
  const plainPassword = "SecureP@ss123!";

  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const hash = await hashPassword(plainPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(plainPassword);
      // bcrypt hashes start with $2a$ or $2b$
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it("should produce different hashes for the same password", async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const hash = await hashPassword(plainPassword);
      const isMatch = await comparePassword(plainPassword, hash);
      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const hash = await hashPassword(plainPassword);
      const isMatch = await comparePassword("WrongPassword!1", hash);
      expect(isMatch).toBe(false);
    });

    it("should return false for empty password", async () => {
      const hash = await hashPassword(plainPassword);
      const isMatch = await comparePassword("", hash);
      expect(isMatch).toBe(false);
    });
  });
});

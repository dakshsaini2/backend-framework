import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/auth/jwt';
import type { JwtPayload } from '../src/types/index';

const ACCESS_SECRET = 'test-access-secret-key-at-least-32-chars-long!!';
const REFRESH_SECRET = 'test-refresh-secret-key-at-least-32-chars-long!!';

const payload: JwtPayload = { sub: 'user-123', role: 'USER' };

describe('JWT Utilities Security & Validation', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT string', () => {
      const token = generateAccessToken(payload, ACCESS_SECRET);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should not contain sensitive payloads like passwords or hashes', () => {
      const sensitivePayload = { sub: 'user', role: 'USER', password: '123', hash: 'abc' } as unknown as JwtPayload;
      const token = generateAccessToken(sensitivePayload, ACCESS_SECRET);
      const decoded = jwt.decode(token) as Record<string, unknown>;
      
      expect(decoded.password).toBeUndefined();
      expect(decoded.hash).toBeUndefined();
      expect(decoded.sub).toBe('user');
      expect(decoded.role).toBe('USER');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT string', () => {
      const token = generateRefreshToken(payload, REFRESH_SECRET);
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const token = generateAccessToken(payload, ACCESS_SECRET);
      const decoded = verifyAccessToken(token, ACCESS_SECRET);
      expect(decoded.sub).toBe('user-123');
      expect(decoded.role).toBe('USER');
    });

    it('should reject a modified/tampered token', () => {
      const token = generateAccessToken(payload, ACCESS_SECRET);
      const parts = token.split('.');
      parts[1] = Buffer.from(JSON.stringify({ sub: 'hacked-user', role: 'ADMIN' })).toString('base64');
      const tamperedToken = parts.join('.');
      
      expect(() => verifyAccessToken(tamperedToken, ACCESS_SECRET)).toThrow();
    });

    it('should reject a token signed with the wrong secret', () => {
      const token = generateAccessToken(payload, ACCESS_SECRET);
      expect(() => verifyAccessToken(token, 'wrong-secret')).toThrow();
    });

    it('should reject an expired token', () => {
      const token = generateAccessToken(payload, ACCESS_SECRET, '0s');
      expect(() => verifyAccessToken(token, ACCESS_SECRET)).toThrow();
    });

    it('should reject an empty token string', () => {
      expect(() => verifyAccessToken('', ACCESS_SECRET)).toThrow();
    });

    it('should reject a completely malformed token', () => {
      expect(() => verifyAccessToken('not.a.jwt.string', ACCESS_SECRET)).toThrow();
    });

    it('should reject an undefined token (caught by types/runtime)', () => {
      // @ts-expect-error Testing runtime undefined handling
      expect(() => verifyAccessToken(undefined, ACCESS_SECRET)).toThrow();
    });

    it('should explicitly reject tokens signed with algorithm "none" (Algorithm Manipulation)', () => {
      // Create a JWT with 'alg: none'
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const body = Buffer.from(JSON.stringify({ sub: 'user-123', role: 'ADMIN' })).toString('base64url');
      const noneToken = `${header}.${body}.`;
      
      expect(() => verifyAccessToken(noneToken, ACCESS_SECRET)).toThrow();
    });
    
    it('should reject tokens missing required claims (sub, role)', () => {
       const token = jwt.sign({ sub: 'user' }, ACCESS_SECRET); // missing role
       expect(() => verifyAccessToken(token, ACCESS_SECRET)).toThrow('Invalid token payload');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const token = generateRefreshToken(payload, REFRESH_SECRET);
      const decoded = verifyRefreshToken(token, REFRESH_SECRET);
      expect(decoded.sub).toBe('user-123');
    });

    it('should reject an invalid token', () => {
      expect(() => verifyRefreshToken('bad-token', REFRESH_SECRET)).toThrow();
    });
  });
});

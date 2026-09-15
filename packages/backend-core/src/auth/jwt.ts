import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/index";

export function generateAccessToken(
  payload: JwtPayload,
  secret: string,
  expiresIn: string = "15m",
): string {
  return jwt.sign({ sub: payload.sub, role: payload.role }, secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function generateRefreshToken(
  payload: JwtPayload,
  secret: string,
  expiresIn: string = "7d",
): string {
  return jwt.sign({ sub: payload.sub, role: payload.role }, secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as jwt.JwtPayload;
  if (!decoded.sub || !decoded.role) {
    throw new Error("Invalid token payload");
  }
  return {
    sub: decoded.sub as string,
    role: decoded.role as string,
  };
}

export function verifyRefreshToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as jwt.JwtPayload;
  if (!decoded.sub || !decoded.role) {
    throw new Error("Invalid token payload");
  }
  return {
    sub: decoded.sub as string,
    role: decoded.role as string,
  };
}

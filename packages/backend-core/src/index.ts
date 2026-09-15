// ==========================================
// @devsaini2300/backend-core
// Production-ready backend infrastructure
// ==========================================

// Auth
export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./auth/jwt";
export { hashPassword, comparePassword } from "./auth/password";

// Middleware
export { authenticate, createAuthMiddleware } from "./middleware/authenticate";
export { authorize } from "./middleware/authorize";
export { validate } from "./middleware/validate";
export { errorHandler } from "./middleware/error-handler";
export { notFoundHandler } from "./middleware/not-found";

// Errors
export { AppError } from "./errors/app-error";

// Utils
export { asyncHandler } from "./utils/async-handler";
export { sendSuccess, sendError } from "./utils/response";
export { createLogger, logger } from "./utils/logger";

// Validation schemas
export {
  emailSchema,
  passwordSchema,
  nameSchema,
  uuidSchema,
} from "./validation/index";

// Types
export type {
  JwtPayload,
  TokenPair,
  AuthUser,
  AsyncRequestHandler,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from "./types/index";

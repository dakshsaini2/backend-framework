import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  errorHandler,
  notFoundHandler,
  createLogger,
} from "@devsaini2300/backend-core";
import routes from "./routes/index";
import { env } from "./config/env";

const app = express();
const logger = createLogger({ level: env.LOG_LEVEL });

// ── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));

// ── Rate Limiting for Auth Endpoints ─────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ──────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "Incoming request");
  next();
});

// ── Rate Limit Auth Routes ───────────────────────────────────
app.use("/api/auth", authLimiter);

// ── API Routes ───────────────────────────────────────────────
app.use("/api", routes);

// ── Error Handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

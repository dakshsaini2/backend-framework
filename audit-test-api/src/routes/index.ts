import { Router } from "express";
import { sendSuccess } from "@devsaini2300/backend-core";
import authRoutes from "./auth.routes";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
router.use("/auth", authRoutes);

export default router;

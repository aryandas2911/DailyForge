import express from "express";
import { getAnalytics, recoverStreak } from "../controllers/analyticsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const analyticsRouter = express.Router();

// GET /api/analytics - protected by authMiddleware
analyticsRouter.get("/", authMiddleware, getAnalytics);

// POST /api/analytics/recover-streak - protected by authMiddleware
analyticsRouter.post("/recover-streak", authMiddleware, recoverStreak);

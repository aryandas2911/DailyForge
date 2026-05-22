import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const analyticsRouter = express.Router();

// GET /api/analytics - protected by authMiddleware
analyticsRouter.get("/", authMiddleware, getAnalytics);

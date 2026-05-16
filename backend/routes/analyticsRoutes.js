import express from "express";
import { getAnalyticsSummary } from "../controllers/analyticsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// router object for analytics
export const analyticsRouter = express.Router();

// Route for getting analytics summary
analyticsRouter.get("/summary", authMiddleware, getAnalyticsSummary);
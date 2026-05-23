import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  markComplete,
  undoComplete,
  getDashboardProgress,
} from "../controllers/completionController.js";

// Router object for completions
export const completionRouter = express.Router();

// POST /api/completions — mark a routine task complete for a date
completionRouter.post("/", authMiddleware, asyncHandler(markComplete));

// DELETE /api/completions?routineId=...&taskId=...&date=... — undo a completion
completionRouter.delete("/", authMiddleware, asyncHandler(undoComplete));

// GET /api/completions/progress?week=YYYY-WW — fetch weekly progress metrics
completionRouter.get("/progress", authMiddleware, asyncHandler(getDashboardProgress));

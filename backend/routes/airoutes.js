import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getAiCoachSummary,
  generateRoutineFromNL,
  getOverloadWarning,
  getSchedulingSuggestions,
  getAdaptiveNudge,
} from "../controllers/aiController.js";

export const aiRouter = express.Router();

// All AI routes are protected by auth
aiRouter.use(authMiddleware);

// GET  /api/ai/coach      — weekly AI coach summary
aiRouter.get("/coach", getAiCoachSummary);

// POST /api/ai/routine    — generate routine from natural language
aiRouter.post("/routine", generateRoutineFromNL);

// GET  /api/ai/overload   — burnout / overload detection
aiRouter.get("/overload", getOverloadWarning);

// GET  /api/ai/scheduling — smart scheduling suggestions
aiRouter.get("/scheduling", getSchedulingSuggestions);

// GET  /api/ai/nudge      — adaptive nudge for current time of day
aiRouter.get("/nudge", getAdaptiveNudge);
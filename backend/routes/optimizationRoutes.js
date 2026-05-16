import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getOptimizationSuggestions,
  getAllRoutinesWithSuggestions,
} from "../controllers/optimizationController.js";

const router = express.Router();

// Get optimization suggestions for a specific routine
router.get("/routines/:routineId/suggestions", authMiddleware, getOptimizationSuggestions);

// Get summary of all routines with productivity scores
router.get("/routines/suggestions/summary", authMiddleware, getAllRoutinesWithSuggestions);

export default router;

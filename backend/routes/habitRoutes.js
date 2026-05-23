import express from "express";
import {
  createHabit,
  getHabits,
  toggleHabit,
  deleteHabit,
} from "../controllers/habitController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const habitRouter = express.Router();

// Get all habits
habitRouter.get("/", authMiddleware, getHabits);

// Create a new habit
habitRouter.post("/", authMiddleware, createHabit);

// Toggle a habit log/completion
habitRouter.put("/:id/toggle", authMiddleware, toggleHabit);

// Delete a habit
habitRouter.delete("/:id", authMiddleware, deleteHabit);

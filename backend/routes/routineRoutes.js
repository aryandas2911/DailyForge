import express from "express";
import {
  createRoutine,
  deleteRoutine,
  duplicateRoutine,
  getRoutines,
  updateRoutine,
} from "../controllers/routineController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// router object for routine
export const routineRouter = express.Router();

// Route for creating routine
routineRouter.post("/", authMiddleware, createRoutine);

// Route for fetching routines
routineRouter.get("/", authMiddleware, getRoutines);

// Route for duplicating routine
routineRouter.post("/:id/duplicate", authMiddleware, duplicateRoutine);

// Route for updating routine
routineRouter.put("/:id", authMiddleware, updateRoutine);

// Route for deleting routine
routineRouter.delete("/:id", authMiddleware, deleteRoutine);

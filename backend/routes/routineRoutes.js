import express from "express";
import {
  createRoutine,
  deleteRoutine,
  getRoutines,
  updateRoutine,
  shareRoutine,
} from "../controllers/routineController.js";

import {
  authMiddleware,
  canEditRoutine,
} from "../middlewares/authMiddleware.js";

// router object for routine
export const routineRouter = express.Router();

// Route for creating routine
routineRouter.post("/", authMiddleware, createRoutine);

// Route for fetching routines
routineRouter.get("/", authMiddleware, getRoutines);

// Route for sharing routine
routineRouter.post(
  "/:id/share",
  authMiddleware,
  shareRoutine
);

// Route for updating routine
routineRouter.put(
  "/:id",
  authMiddleware,
  canEditRoutine,
  updateRoutine
);

// Route for deleting routine
routineRouter.delete("/:id", authMiddleware, deleteRoutine);
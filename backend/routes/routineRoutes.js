import express from "express";
import {
  createRoutine,
  deleteRoutine,
  duplicateRoutine,
  getRoutines,
  updateRoutine,
  getPublicRoutine,
} from "../controllers/routineController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import validateObjectId from "../middlewares/validateObjectId.js";

// router object for routine
export const routineRouter = express.Router();

// Route for creating routine
routineRouter.post("/", authMiddleware, asyncHandler(createRoutine));

// Route for fetching routines
routineRouter.get("/", authMiddleware, asyncHandler(getRoutines));

// Route for duplicating routine
routineRouter.post("/:id/duplicate", authMiddleware, validateObjectId, asyncHandler(duplicateRoutine));

// Route for updating routine
routineRouter.put("/:id", authMiddleware, validateObjectId, asyncHandler(updateRoutine));

// Route for deleting routine
routineRouter.delete("/:id", authMiddleware, validateObjectId, asyncHandler(deleteRoutine));

// Route for fetching public routine (unauthenticated)
routineRouter.get("/public/:id", validateObjectId, asyncHandler(getPublicRoutine));

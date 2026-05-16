import express from "express";
import {
  createRoutine,
  deleteRoutine,
  getRoutines,
  updateRoutine,
} from "../controllers/routineController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// ✅ NEW IMPORTS
import validateObjectId from "../middlewares/validateObjectId.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// router object for routine
export const routineRouter = express.Router();

// Route for creating routine
routineRouter.post("/", authMiddleware, asyncHandler(createRoutine));

// Route for fetching routines
routineRouter.get("/", authMiddleware, asyncHandler(getRoutines));

// Route for updating routine
routineRouter.put(
  "/:id",
  authMiddleware,
  validateObjectId,              // ✅ ID check
  asyncHandler(updateRoutine)   // ✅ error handling
);

// Route for deleting routine
routineRouter.delete(
  "/:id",
  authMiddleware,
  validateObjectId,              // ✅ ID check
  asyncHandler(deleteRoutine)   // ✅ error handling
);
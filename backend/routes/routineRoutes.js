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
import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";

// router object for routine
export const routineRouter = express.Router();

//New middleware to prevent invalid IDs before controller execution.
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid routine ID",
    });
  }
  next();
};

// Route for creating routine
routineRouter.post("/", authMiddleware, asyncHandler(createRoutine));

// Route for fetching routines
routineRouter.get("/", authMiddleware, asyncHandler(getRoutines));

// Route for duplicating routine
routineRouter.post("/:id/duplicate", authMiddleware, duplicateRoutine);

// Route for updating routine
routineRouter.put("/:id", authMiddleware, validateObjectId, asyncHandler(updateRoutine));

// Route for deleting routine
routineRouter.delete("/:id", authMiddleware, validateObjectId, asyncHandler(deleteRoutine));

// Route for fetching public routine (unauthenticated)
routineRouter.get("/public/:id", validateObjectId, asyncHandler(getPublicRoutine));
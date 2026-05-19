import express from "express";
import {
  createRoutine,
  deleteRoutine,
  duplicateRoutine,
  getRoutines,
  updateRoutine,
} from "../controllers/routineController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { routineValidation, handleValidationErrors } from "../middlewares/validator.js";
// router object for routine
export const routineRouter = express.Router();

// Route for creating routine
routineRouter.post("/create", authMiddleware, routineValidation, handleValidationErrors, createRoutine);

// Route for fetching routines
routineRouter.get("/", authMiddleware, getRoutines);

// Route for duplicating routine
routineRouter.post("/:id/duplicate", authMiddleware, duplicateRoutine);

// Route for updating routine
routineRouter.put("/:id", authMiddleware, routineValidation, handleValidationErrors, updateRoutine);

// Route for deleting routine
routineRouter.delete("/:id", authMiddleware, routineValidation, handleValidationErrors, deleteRoutine);

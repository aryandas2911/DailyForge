import express from "express";

import {
  createRoutine,
  deleteRoutine,
  exportRoutineICS,
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

routineRouter.get("/export", authMiddleware, exportRoutineICS);

// Route for updating routine
routineRouter.put("/:id", authMiddleware, updateRoutine);

// Route for deleting routine
routineRouter.delete("/:id", authMiddleware, deleteRoutine);

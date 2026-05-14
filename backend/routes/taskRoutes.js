import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { taskValidation,handleValidationErrors } from "../middlewares/validator.js";

// router object for task
export const taskRouter = express.Router();

// Route for creating task
taskRouter.post("/create", authMiddleware, taskValidation, handleValidationErrors, createTask);

// Route for fetching task
taskRouter.get("/tasks", authMiddleware, getTasks);

// Route for updating task
taskRouter.put("/:id", authMiddleware, updateTask);

// Route for deleting task
taskRouter.delete("/:id", authMiddleware, deleteTask);

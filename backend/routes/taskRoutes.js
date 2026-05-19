import express from "express";
import { body } from "express-validator";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  bulkDeleteTasks,
} from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// router object for task
export const taskRouter = express.Router();

// Route for creating task
taskRouter.post("/", authMiddleware, createTask);

// Route for fetching task
taskRouter.get("/tasks", authMiddleware, getTasks);

// Route for updating task
taskRouter.put("/:id", authMiddleware, taskUpdateValidationRules, updateTask);

// Route for bulk deleting tasks
taskRouter.post("/bulk-delete", authMiddleware, bulkDeleteTasks);

// Route for deleting task
taskRouter.delete("/:id", authMiddleware, deleteTask);

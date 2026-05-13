import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  reorderTasks,
} from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// router object for task
export const taskRouter = express.Router();

// Route for reordering tasks
taskRouter.put("/reorder", authMiddleware, reorderTasks);

// Route for creating task
taskRouter.post("/", authMiddleware, createTask);

// Route for fetching task
taskRouter.get("/", authMiddleware, getTasks);

// Route for updating task
taskRouter.put("/:id", authMiddleware, updateTask);

// Route for deleting task
taskRouter.delete("/:id", authMiddleware, deleteTask);

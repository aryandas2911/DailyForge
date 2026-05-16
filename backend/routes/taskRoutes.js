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

// Validation rules for task fields
const taskValidationRules = [
  body("title")
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),

  body("tags")
    .optional()
    .trim()
    .escape(),
];

// router object for task
export const taskRouter = express.Router();

// Route for creating task
taskRouter.post("/", authMiddleware, taskValidationRules, createTask);

// Route for fetching task
taskRouter.get("/", authMiddleware, getTasks);

// Route for updating task
taskRouter.put("/:id", authMiddleware, taskValidationRules, updateTask);

// Route for bulk deleting tasks
taskRouter.post("/bulk-delete", authMiddleware, bulkDeleteTasks);

// Route for deleting task
taskRouter.delete("/:id", authMiddleware, deleteTask);

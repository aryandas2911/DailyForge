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
import asyncHandler from "../utils/asyncHandler.js";

// Validation rules for task fields (create — title required)
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

// Partial updates (e.g. status toggle) — only validate fields that are sent
const taskUpdateValidationRules = [
  body("title")
    .optional()
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

  body("tags").optional(),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("status")
    .optional()
    .isIn(["Due", "Completed"])
    .withMessage("Status must be Due or Completed"),
];

// router object for task
export const taskRouter = express.Router();

// Route for creating task
taskRouter.post(
  "/",
  authMiddleware,
  taskValidationRules,
  asyncHandler(createTask)
);

// Route for fetching task
taskRouter.get("/", authMiddleware, asyncHandler(getTasks));

// Route for updating task
taskRouter.put(
  "/:id",
  authMiddleware,
  taskUpdateValidationRules,
  asyncHandler(updateTask)
);

// Route for bulk deleting tasks
taskRouter.post("/bulk-delete", authMiddleware, asyncHandler(bulkDeleteTasks));

// Route for deleting task
taskRouter.delete("/:id", authMiddleware, asyncHandler(deleteTask));

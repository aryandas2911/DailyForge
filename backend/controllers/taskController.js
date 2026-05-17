import Task from "../src/models/Task.js";
import User from "../src/models/User.js";
import AppError from "../utils/AppError.js";
import { validationResult } from "express-validator";

// Create task function
export const createTask = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Unauthorized, user not logged in", 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      data: errors.array(),
    });
  }

  const { title, description, tags, priority, status, dueDate } = req.body;
  if (!title || !priority || !status) {
    throw new AppError("Please enter all the details", 400);
  }

  const newTask = new Task({
    userId: userId,
    title,
    description,
    tags,
    priority,
    status,
    dueDate,
  });

  await newTask.save();

  return res
    .status(201)
    .json({ message: "Task added successfully", newTask });
};

// get task function
export const getTasks = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Unauthorized, token invalid", 401);
  }

  const tasks = await Task.find({ userId: userId }).sort({ createdAt: -1 });
  if (tasks.length == 0) {
    return res.status(200).json({ success: true, tasks: [] });
  }
  return res.status(200).json({ success: true, tasks });
};

// update task function
export const updateTask = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Unauthorized, token invalid", 401);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      data: errors.array(),
    });
  }

  const updates = req.body;
  const taskId = req.params.id;

  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, userId: userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!updatedTask) {
    throw new AppError("Task not found", 404);
  }
  return res.status(200).json({
    message: "Task updated successfully",
    task: updatedTask,
  });
};

// delete task function
export const deleteTask = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Unauthorized, token invalid", 401);
  }

  const taskId = req.params.id;

  const deleted = await Task.findOneAndDelete({
    _id: taskId,
    userId: userId,
  });
  if (!deleted) {
    throw new AppError("Task not found", 404);
  }
  return res.status(200).json({
    message: "Task deleted successfully",
  });
};

// bulk delete tasks function
export const bulkDeleteTasks = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not logged in", 401);
  }

  const { ids } = req.body;
  if (!ids || ids.length === 0) {
    throw new AppError("No task IDs provided", 400);
  }

  await Task.deleteMany({ _id: { $in: ids }, userId: userId });

  return res
    .status(200)
    .json({ success: true, message: "Tasks deleted successfully" });
};

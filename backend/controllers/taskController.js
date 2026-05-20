import Routine from "../src/models/Routine.js";
import Task from "../src/models/Task.js";
import User from "../src/models/User.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create task function
export const createTask = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    // check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: errors.array(),
      });
    }

    // fetch details for task from request body
    const {
  title,
  description,
  tags,
  priority,
  status = "Due",
  dueDate,
} = req.body;
    if (!title || !priority || !dueDate) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all the details" });
    }
    
    const dueDateValue = new Date(dueDate);
    if (Number.isNaN(dueDateValue.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid due date" });
    }

    const dateStart = new Date(dueDateValue);
    dateStart.setUTCHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);

    const existingTask = await Task.findOne({
      userId,
      title: { $regex: new RegExp(`^${escapeRegex(title.trim())}$`, "i") },
      dueDate: { $gte: dateStart, $lt: dateEnd },
    });

    if (existingTask) {
      return res
        .status(409)
        .json({ success: false, message: "A task with the same title and due date already exists" });
    }
    // new task object
    const newTask = new Task({
      userId: userId,
      title,
      description,
      tags,
      priority,
      status,
      dueDate,
    });

    // save task in database
    await newTask.save();

    return res
      .status(201)
      .json({ message: "Task added successfully", newTask });
  } catch (error) {
    // error handling
    console.log("Error creating task", error);
    return res
      .status(500)
      .json({ success: false, message: "Error creating task" });
  }
};

// get task function
export const getTasks = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, token invalid" });
    }

    // fetch tasks from database
    const tasks = await Task.find({ userId: userId }).sort({ createdAt: -1 });
    if (tasks.length == 0) {
      return res.status(200).json({ success: true, tasks: [] });
    }
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    // error handling
    console.log("Error fetching tasks", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching tasks" });
  }
};

// update task function
export const updateTask = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, token invalid" });
    }

    // Validate that taskId is a valid MongoDB ObjectId before attempting cast
    const taskId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    // check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: errors.array(),
      });
    }

    // fetch update task details
    const updates = req.body;

    // fetch task from database and update
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    // error handling
    console.log("Error updating task", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating task" });
  }
};

// delete task function
export const deleteTask = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, token invalid" });
    }

    // Validate that taskId is a valid MongoDB ObjectId before attempting cast
    const taskId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    // fetch task to be deleted from database
    const deleteTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: userId,
    });
    if (!deleteTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    // error handling
    console.log("Error deleting task", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting task" });
  }
};

// bulk delete tasks function
export const bulkDeleteTasks = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not logged in" });
    }

    // fetch array of task IDs 
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No task IDs provided" });
    }

    // delete all matching tasks belonging to this user
    await Task.deleteMany({ _id: { $in: ids }, userId: userId });

    await Routine.updateMany(
      { userId },
      {
        $pull: {
          items: {
            taskId: { $in: ids },
          },
        },
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "Tasks deleted successfully" });
  } catch (error) {
    //error handling
    console.log("Error bulk deleting tasks", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting tasks" });
  }
};

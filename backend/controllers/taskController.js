import Routine from "../src/models/Routine.js";
import Task from "../src/models/Task.js";
import User from "../src/models/User.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create task function
export const createTask = async (req, res) => {
  try {
    // RESTORED: Read the real authenticated user ID from the request object
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
    const { title, description, tags, priority, status, dueDate } = req.body;
    if (!title || !priority || !status || !dueDate) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all the details" });
    }

    if (title.trim().length > 50) {
      return res
        .status(400)
        .json({ success: false, message: "Title must be 50 characters or less" });
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

    // FEATURE RETAINED: Active Daily Schedule Congestion Tracker
    const dailyTaskCount = await Task.countDocuments({
      userId,
      dueDate: { $gte: dateStart, $lt: dateEnd },
      status: { $ne: "Completed" } 
    });

    if (dailyTaskCount >= 5) {
      return res.status(400).json({
        success: false,
        message: "Schedule Bottleneck! You have reached the maximum limit of 5 pending tasks for this single day. Clear or reschedule existing items first."
      });
    }

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
    console.log("Error creating task", error);
    return res
      .status(500)
      .json({ success: false, message: "Error creating task" });
  }
};

// get task function
export const getTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, token invalid" });
    }

    const tasks = await Task.find({ userId: userId }).sort({ createdAt: -1 });
    if (tasks.length == 0) {
      return res.status(200).json({ success: true, tasks: [] });
    }
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.log("Error fetching tasks", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching tasks" });
  }
};

// update task function
export const updateTask = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, token invalid" });
    }

    const taskId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
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

    if (updates.title && updates.title.trim().length > 50) {
      return res
        .status(400)
        .json({ success: false, message: "Title must be 50 characters or less" });
    }

    const currentTask = await Task.findOne({ _id: taskId, userId: userId });
    if (!currentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const targetDueDate = updates.dueDate ? new Date(updates.dueDate) : currentTask.dueDate;
    const dateStart = new Date(targetDueDate);
    dateStart.setUTCHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);

    // ✅ FIXED FOR TIMEZONE CONSISTENCY: Compares using safe ISO string segments instead of server locale toDateString()
    if (updates.dueDate && new Date(updates.dueDate).toISOString().split('T')[0] !== currentTask.dueDate.toISOString().split('T')[0]) {
      const dailyTaskCount = await Task.countDocuments({
        userId,
        dueDate: { $gte: dateStart, $lt: dateEnd },
        status: { $ne: "Completed" },
        _id: { $ne: taskId }
      });

      if (dailyTaskCount >= 5) {
        return res.status(400).json({
          success: false,
          message: "Schedule Bottleneck! Rescheduling aborted because the destination day already has 5 or more pending items."
        });
      }
    }

    if (updates.title || updates.dueDate) {
      const targetTitle = updates.title ? updates.title.trim() : currentTask.title;
      
      const duplicateCheck = await Task.findOne({
        userId,
        _id: { $ne: taskId },
        title: { $regex: new RegExp(`^${escapeRegex(targetTitle)}$`, "i") },
        dueDate: { $gte: dateStart, $lt: dateEnd }
      });

      if (duplicateCheck) {
        return res.status(409).json({
          success: false,
          message: "A task with that title already occupies this specific target day."
        });
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    // ✅ RESTORED NULL SAFETY GUARD: Avoids passing a 200 message block if the target item vanished between requests
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found or modification unauthorized",
      });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.log("Error updating task", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating task" });
  }
};

// delete task function
export const deleteTask = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, token invalid" });
    }

    const taskId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

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
    console.log("Error deleting task", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting task" });
  }
};

// bulk delete tasks function
export const bulkDeleteTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not logged in" });
    }

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No task IDs provided" });
    }

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
    console.log("Error bulk deleting tasks", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting tasks" });
  }
};
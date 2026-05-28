import Routine from "../src/models/Routine.js";
import Task from "../src/models/Task.js";
import User from "../src/models/User.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create task function
export const createTask = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, user not logged in",
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

    const { title, description, tags, priority, status, dueDate } = req.body;

    if (!title || !priority || !status || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Please enter all the details",
      });
    }

    const dueDateValue = new Date(dueDate);

    if (Number.isNaN(dueDateValue.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    const dateStart = new Date(dueDateValue);
    dateStart.setUTCHours(0, 0, 0, 0);

    const dateEnd = new Date(dateStart);
    dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);

    const existingTask = await Task.findOne({
      userId,
      title: {
        $regex: new RegExp(`^${escapeRegex(title.trim())}$`, "i"),
      },
      dueDate: {
        $gte: dateStart,
        $lt: dateEnd,
      },
    });

    if (existingTask) {
      return res.status(409).json({
        success: false,
        message: "A task with the same title and due date already exists",
      });
    }

    const newTask = new Task({
      userId,
      title,
      description,
      tags,
      priority,
      status,
      dueDate,
      completedAt: status === "Completed" ? new Date() : null,
    });

    await newTask.save();

    return res.status(201).json({
      success: true,
      message: "Task added successfully",
      newTask,
    });
  } catch (error) {
    console.log("Error creating task", error);

    return res.status(500).json({
      success: false,
      message: "Error creating task",
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, token invalid",
      });
    }

    const tasks = await Task.find({ userId }).sort({
      createdAt: -1,
    });

    if (tasks.length === 0) {
      return res.status(200).json({
        success: true,
        tasks: [],
      });
    }

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.log("Error fetching tasks", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching tasks",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, token invalid",
      });
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
      return res.status(400).json({
        success: false,
        message: "Title must be 50 characters or less",
      });
    }

    if (updates.status === "Completed") {
      updates.completedAt = new Date();
    } else if (updates.status === "Due") {
      updates.completedAt = null;
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.log("Error updating task", error);

    return res.status(500).json({
      success: false,
      message: "Error updating task",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, token invalid",
      });
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
      userId,
    });

    if (!deleteTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting task", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting task",
    });
  }
};

export const bulkDeleteTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
      });
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No task IDs provided",
      });
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await Task.deleteMany(
        {
          _id: { $in: ids },
          userId,
        },
        { session }
      );

      await Routine.updateMany(
        { userId },
        {
          $pull: {
            items: {
              taskId: { $in: ids },
            },
          },
        },
        { session }
      );

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message: "Tasks deleted successfully",
      });

    } catch (transactionError) {
      await session.abortTransaction();

      console.log(
        "Transaction error while bulk deleting tasks",
        transactionError
      );

      throw transactionError;

    } finally {
      session.endSession();
    }

  } catch (error) {
    console.log("Error bulk deleting tasks", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting tasks",
    });
  }
};
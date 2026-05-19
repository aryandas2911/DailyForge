import Task from "../src/models/Task.js";
import User from "../src/models/User.js";
import Routine from "../src/models/Routine.js";
import { validationResult } from "express-validator";

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
    const { title, description, tags, priority, status, dueDate } = req.body;
    if (!title || !priority || !status) {
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
      return res
        .status(200)
        .json({ success: true, tasks: [] });
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
    const taskId = req.params.id;

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

    // fetch task id
    const taskId = req.params.id;

    // check if task is used in any routine
    const routinesUsingTask = await Routine.find({
      userId: userId,
      "items.taskId": taskId,
    });

    if (routinesUsingTask.length > 0) {
      const routineNames = routinesUsingTask.map((r) => r.name).join(", ");
      return res.status(409).json({
        success: false,
        message: `Cannot delete task — it is used in ${routinesUsingTask.length} routine(s): ${routineNames}. Please remove it from those routines first.`,
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
    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No task IDs provided" });
    }

    // check if any of the tasks are used in routines
    const routinesUsingTasks = await Routine.find({
      userId: userId,
      "items.taskId": { $in: ids },
    });

    if (routinesUsingTasks.length > 0) {
      const routineNames = routinesUsingTasks.map((r) => r.name).join(", ");
      return res.status(409).json({
        success: false,
        message: `Cannot delete — some tasks are used in routine(s): ${routineNames}. Please remove them from those routines first.`,
      });
    }

    // delete all matching tasks belonging to this user
    await Task.deleteMany({ _id: { $in: ids }, userId: userId });

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
import Task from "../src/models/Task.js";
import User from "../src/models/User.js";
import { validationResult } from "express-validator";
import {
  successResponse,
  errorResponse,
} from "../utils/apiResponse.js";

// Create task function
export const createTask = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(
        res,
        "Unauthorized, user not logged in",
        401
      );
    }

    // check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(
        res,
        "Validation failed",
        400,
        errors.array()
      );
    }

    // fetch details for task from request body
    const { title, description, tags, priority, status, dueDate } = req.body;
    if (!title || !priority || !status) {
      return errorResponse(
        res,
        "Please enter all the details",
        400
      );
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

    return successResponse(
      res,
      "Task added successfully",
      { newTask },
      201
    );
  } catch (error) {
    // error handling
    console.log("Error creating task", error);
    return errorResponse(
      res,
      "Error creating task",
      500
    );
  }
};

// get task function
export const getTasks = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(
        res,
        "Unauthorized, token invalid",
        401
);
    }

    // fetch tasks from database
    const tasks = await Task.find({ userId: userId }).sort({ createdAt: -1 });
    if (tasks.length === 0) {
      return errorResponse(
        res,
        "User has no task",
        400
      );
    }
    return successResponse(
      res,
      "Tasks fetched successfully",
      { tasks },
      200
    );
  } catch (error) {
    // error handling
    console.log("Error fetching tasks", error);
    return errorResponse(
      res,
      "Error fetching tasks",
      500
    );
  }
};

// update task function
export const updateTask = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(
        res,
        "Unauthorized , token invalid", 
        401
      )
    }

    // check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(
        res,
        "Validation failed",
        400,
        errors.array()
      );
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
      return errorResponse(
        res,
        "Task not found",
        404
      );
    }
    return successResponse(
      res,
      "Task updated successfully",
      { task: updatedTask },
      200
    );
  } catch (error) {
    // error handling
    console.log("Error updating task", error);
    return errorResponse(
      res,
      "Error updating task",
      500
    );
  }
};

// delete task function
export const deleteTask = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(
        res,
        "Unauthorized, token invalid",
        401
      );
    }

    // fetch task id
    const taskId = req.params.id;

    // fetch task to be deleted from database
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: userId,
    });
    if (!deletedTask) {
      return errorResponse(
        res,
        "Task not found",
        404
      );
    }
   return successResponse(
    res,
    "Task deleted successfully",
    {},
    200
  );
  } catch (error) {
    // error handling
    console.log("Error deleting task", error);
    return errorResponse(
      res,
      "Error deleting task",
      500
    );
  }
};

// bulk delete tasks function
export const bulkDeleteTasks = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(
        res,
        "User not logged in" ,
        401
      );
    }

    // fetch array of task IDs 
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return errorResponse(
        res,
        "No task IDs provided",
        400
      );
    }

    // delete all matching tasks belonging to this user
    await Task.deleteMany({ _id: { $in: ids }, userId: userId });

    return successResponse(
      res,
      "Tasks deleted successfully",
      {},
      200
    );
  } catch (error) {
    //error handling
    console.log("Error bulk deleting tasks", error);
    return errorResponse(
      res,
      "Error deleting tasks",
      500
    );
  }
};

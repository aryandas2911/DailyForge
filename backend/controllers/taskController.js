import Task from "../src/models/Task.js";
import User from "../src/models/User.js";

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

    const {
      title,
      description,
      tags,
      priority,
      status,
      dueDate,
    } = req.body;

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

    return res.status(201).json({
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

// get task function
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

    const tasks = await Task.find({ userId: userId }).sort({
      createdAt: -1,
    });

    if (tasks.length == 0) {
      res.status(400).json({
        message: "User has no task",
        success: false,
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

// update task function
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

    const updates = req.body;
    const taskId = req.params.id;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
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

// delete task function
export const deleteTask = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized, token invalid",
      });
    }

    const taskId = req.params.id;

    const deleteTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: userId,
    });

    if (!deleteTask) {
      res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
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
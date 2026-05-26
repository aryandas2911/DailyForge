import Task from "../models/taskModel.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      task,
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
    const tasks = await Task.find({ user: req.user.id });

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
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
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
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
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
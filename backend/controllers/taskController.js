import Task from "../src/models/Task.js";
import User from "../src/models/User.js";

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

    // fetch details for task from request body
    const { title, description, tags, priority, status, dueDate } = req.body;
    if (!title || !priority || !status) {
      res
        .status(400)
        .json({ success: false, message: "Please enter all the details" });
    }

    // Get the max order to append the new task at the end
    const lastTask = await Task.findOne({ userId }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    // new task object
    const newTask = new Task({
      userId: userId,
      title,
      description,
      tags,
      priority,
      status,
      dueDate,
      order,
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
    const tasks = await Task.find({ userId: userId }).sort({ order: 1, createdAt: -1 });
    if (tasks.length == 0) {
      res.status(400).json({ message: "User has no task", success: false });
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
      res.status(404).json({
        message: "Task not found",
      });
    }
    res.status(200).json({
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
      res
        .status(401)
        .json({ success: false, message: "Unauthorized, token invalid" });
    }

    // fetch task id
    const taskId = req.params.id;

    // fetch task to be deleted from database
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
    // error handling
    console.log("Error deleting task", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting task" });
  }
};

// Reorder tasks function
export const reorderTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({ success: false, message: "Invalid task IDs" });
    }

    // Bulk update orders
    const ops = taskIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: userId },
        update: { $set: { order: index } },
      },
    }));

    await Task.bulkWrite(ops);

    return res.status(200).json({ success: true, message: "Tasks reordered successfully" });
  } catch (error) {
    console.log("Error reordering tasks", error);
    return res.status(500).json({ success: false, message: "Error reordering tasks" });
  }
};

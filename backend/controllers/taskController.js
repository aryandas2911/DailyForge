import Task from "../src/models/Task.js";
import User from "../src/models/User.js";

const formatLocalDateOnly = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeDateOnlyInput = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatLocalDateOnly(value);
  }

  if (typeof value !== "string") return null;

  // Accept both "YYYY-MM-DD" and ISO strings like "YYYY-MM-DDTHH:mm:ss.sssZ"
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  const yearNum = Number(year);
  const monthNum = Number(month);
  const dayNum = Number(day);

  const candidate = new Date(Date.UTC(yearNum, monthNum - 1, dayNum));
  const isValidDate =
    candidate.getUTCFullYear() === yearNum &&
    candidate.getUTCMonth() + 1 === monthNum &&
    candidate.getUTCDate() === dayNum;

  if (!isValidDate) return null;

  return `${year}-${month}-${day}`;
};

const validateDueDate = (dueDate) => {
  if (!dueDate) {
    return { valid: false, message: "Due date is required" };
  }

  const dueDateOnly = normalizeDateOnlyInput(dueDate);
  if (!dueDateOnly) {
    return { valid: false, message: "Invalid due date" };
  }

  const todayOnly = formatLocalDateOnly(new Date());
  if (dueDateOnly < todayOnly) {
    return { valid: false, message: "Due date cannot be in the past" };
  }

  return { valid: true };
};

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
      return res
        .status(400)
        .json({ success: false, message: "Please enter all the details" });
    }

    const dueDateValidation = validateDueDate(dueDate);
    if (!dueDateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dueDateValidation.message,
      });
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

    if (Object.prototype.hasOwnProperty.call(updates, "dueDate")) {
      const dueDateValidation = validateDueDate(updates.dueDate);
      if (!dueDateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dueDateValidation.message,
        });
      }
    }

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

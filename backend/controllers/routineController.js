import Routine from "../src/models/Routine.js";
import User from "../src/models/User.js";
import AppError from "../utils/AppError.js";
import { checkOverlap } from "../utils/routineUtils.js";

const assertAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Unauthorized, user not logged in", 401);
  }
  return user;
};

const validateRoutineItems = (items) => {
  const formatted = [];
  for (const item of items) {
    if (!item.duration || item.duration < 10) {
      throw new AppError(
        "Each task duration must be at least 10 minutes",
        400
      );
    }

    const endTime = item.startTime + item.duration;
    formatted.push({
      day: item.day,
      startTime: item.startTime,
      endTime: endTime,
    });
  }

  const dayGroups = {};
  for (const task of formatted) {
    if (!dayGroups[task.day]) {
      dayGroups[task.day] = [];
    }
    dayGroups[task.day].push(task);
  }

  for (const day in dayGroups) {
    const tasks = dayGroups[day];
    tasks.sort((a, b) => a.startTime - b.startTime);
    if (checkOverlap(tasks)) {
      throw new AppError(`Tasks overlap on ${day}`, 400);
    }
  }
};

// Create routine function
export const createRoutine = async (req, res) => {
  const userId = req.userId;
  await assertAuthenticatedUser(userId);

  const { name, description, items } = req.body;
  if (!name || !items || items.length === 0) {
    throw new AppError("Please enter required details", 400);
  }

  validateRoutineItems(items);

  const newRoutine = new Routine({
    userId,
    name,
    description,
    items,
  });

  await newRoutine.save();
  return res.status(201).json({
    success: true,
    message: "Routine added successfully",
    routine: newRoutine,
  });
};

// Fetch routine function
export const getRoutines = async (req, res) => {
  const userId = req.userId;
  await assertAuthenticatedUser(userId);

  const routines = await Routine.find({ userId: userId }).sort({
    createdAt: -1,
  });
  if (routines.length === 0) {
    return res
      .status(400)
      .json({ message: "User has no routine", success: false });
  }
  return res.status(200).json({ success: true, routines });
};

// Update routine function
export const updateRoutine = async (req, res) => {
  const userId = req.userId;
  await assertAuthenticatedUser(userId);

  const updates = req.body;
  const routineId = req.params.id;

  if (updates.items) {
    validateRoutineItems(updates.items);
  }

  const updatedRoutine = await Routine.findOneAndUpdate(
    { _id: routineId, userId: userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!updatedRoutine) {
    throw new AppError("Routine not found", 404);
  }
  return res.status(200).json({
    message: "Routine updated successfully",
    routine: updatedRoutine,
  });
};

// Delete routine function
export const deleteRoutine = async (req, res) => {
  const userId = req.userId;
  await assertAuthenticatedUser(userId);

  const routineId = req.params.id;

  const deleted = await Routine.findOneAndDelete({
    _id: routineId,
    userId: userId,
  });
  if (!deleted) {
    throw new AppError("Routine not found", 404);
  }
  return res.status(200).json({
    message: "Routine deleted successfully",
  });
};

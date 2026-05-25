import Routine from "../src/models/Routine.js";
import User from "../src/models/User.js";
import { checkOverlap } from "../utils/routineUtils.js";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper to validate and format routine items
const validateAndFormatItems = (items) => {
  if (!Array.isArray(items)) {
    return { valid: false, message: "Routine items must be a valid array" };
  }

  const formatted = [];
  for (const item of items) {
    if (!item.taskId) {
      return { valid: false, message: "Each task must have a taskId" };
    }
    if (!item.day || !DAYS_OF_WEEK.includes(item.day)) {
      return { valid: false, message: `Invalid or missing day: ${item.day || "undefined"}` };
    }
    if (typeof item.startTime !== "number" || isNaN(item.startTime) || item.startTime < 0 || item.startTime > 1440) {
      return { valid: false, message: `Invalid startTime for task on ${item.day}. Must be a valid offset in minutes from midnight (0-1440).` };
    }
    if (typeof item.duration !== "number" || isNaN(item.duration) || item.duration < 10) {
      return { valid: false, message: `Invalid duration for task on ${item.day}. Must be a valid number of at least 10 minutes.` };
    }

    const endTime = item.startTime + item.duration;
    formatted.push({
      day: item.day,
      startTime: item.startTime,
      endTime: endTime,
    });
  }

  return { valid: true, formatted };
};

// Create routine function
export const createRoutine = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    // fetch routine details from request body
    const { name, description, items } = req.body;
    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter required details" });
    }
    // check if routine with same name already exists for this user
    const existingRoutine = await Routine.findOne({ userId, name });
    if (existingRoutine) {
      return res.status(400).json({
        success: false,
        message: "A routine with this name already exists",
      });
    }

    // validate and format items
    const validationResult = validateAndFormatItems(items);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
      });
    }

    const { formatted } = validationResult;

    // group tasks by day
    const dayGroups = {};
    for (const task of formatted) {
      if (!dayGroups[task.day]) {
        dayGroups[task.day] = [];
      }
      dayGroups[task.day].push(task);
    }

    // loop through each day
    for (const day in dayGroups) {
      const tasks = dayGroups[day];

      // sort tasks by start time
      tasks.sort((a, b) => a.startTime - b.startTime);

      // compare each task with next task
      if (checkOverlap(tasks)) {
        return res.status(400).json({
          success: false,
          message: `Tasks overlap on ${day}`,
        });
      }
    }

    // create new routine document
    const newRoutine = new Routine({
      userId,
      name,
      description,
      items,
    });

    // save routine in collection
    await newRoutine.save();
    
    return res
      .status(201)
      .json({ 
        success: true, 
        message: "Routine added successfully", 
        routine: newRoutine.toObject() 
      });
  } catch (error) {
    // error handling
    console.log("Error creating routine", error);
    return res
      .status(500)
      .json({ success: false, message: "Error creating routine" });
  }
};

// Fetch routine function
export const getRoutines = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    // fetch routines from database
    const routines = await Routine.find({ userId: userId }).sort({
      createdAt: -1,
    });
    if (routines.length == 0) {
      return res.status(200).json({ success: true, routines: [] });
    }
    return res.status(200).json({ success: true, routines });
  } catch (error) {
    // error handling
    console.log("Error fetching routine", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching routine" });
  }
};

// Duplicate routine function
export const duplicateRoutine = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    // validate the optional target day before creating the copy
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const { targetDay } = req.body;
    if (targetDay && !validDays.includes(targetDay)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid target day" });
    }

    // fetch the source routine for this user only
    const routineId = req.params.id;
    const sourceRoutine = await Routine.findOne({ _id: routineId, userId });
    if (!sourceRoutine) {
      return res
        .status(404)
        .json({ success: false, message: "Routine not found" });
    }

    const duplicatedItems = sourceRoutine.items.map((item) => ({
      taskId: item.taskId,
      day: targetDay || item.day,
      startTime: item.startTime,
      duration: item.duration,
    }));

    const formatted = duplicatedItems.map((item) => ({
      day: item.day,
      startTime: item.startTime,
      endTime: item.startTime + item.duration,
    }));

    const dayGroups = {};
    for (const task of formatted) {
      if (!dayGroups[task.day]) dayGroups[task.day] = [];
      dayGroups[task.day].push(task);
    }

    for (const day in dayGroups) {
      const sorted = dayGroups[day].sort((a, b) => a.startTime - b.startTime);
      if (checkOverlap(sorted)) {
        return res.status(400).json({
          success: false,
          message: `Copied tasks overlap on ${day}`,
        });
      }
    }

    const baseRoutineName = sourceRoutine.name
      .replace(/(\s*\(Copy\))+$/g, "")
      .trim();

    // If the routine name contains a weekday, rename it for the selected day.
    const duplicatedName = targetDay
      ? baseRoutineName.replace(
        /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g,
        targetDay
      )
      : baseRoutineName;

    // copy routine-owned fields and let MongoDB create fresh document ids
    const duplicatedRoutine = new Routine({
      userId,
      name: `${duplicatedName} (Copy)`,
      description: sourceRoutine.description,
      items: duplicatedItems,
    });

    await duplicatedRoutine.save();
    return res.status(201).json({
      success: true,
      message: "Routine duplicated successfully",
      routine: duplicatedRoutine,
    });
  } catch (error) {
    // error handling
    console.log("Error duplicating routine", error);
    return res
      .status(500)
      .json({ success: false, message: "Error duplicating routine" });
  }
};

// Update routine function
export const updateRoutine = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    // fetch updated routine details
    const updates = req.body;
    const routineId = req.params.id;

    if (updates.items) {
      // validate and format items
      const validationResult = validateAndFormatItems(updates.items);
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message,
        });
      }

      const { formatted } = validationResult;

      // group tasks by day
      const dayGroups = {};
      for (const task of formatted) {
        if (!dayGroups[task.day]) {
          dayGroups[task.day] = [];
        }
        dayGroups[task.day].push(task);
      }

      // loop through each day
      for (const day in dayGroups) {
        const tasks = dayGroups[day];

        // sort tasks by start time
        tasks.sort((a, b) => a.startTime - b.startTime);

        // compare each task with next task
        if (checkOverlap(tasks)) {
          return res.status(400).json({
            success: false,
            message: `Tasks overlap on ${day}`,
          });
        }
      }
    }

    // fetch routine from database and update
    const updatedRoutine = await Routine.findOneAndUpdate(
      { _id: routineId, userId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedRoutine) {
      return res.status(404).json({
        message: "Routine not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Routine updated successfully",
      routine: updatedRoutine.toObject(),
    });
  } catch (error) {
    // error handling
    console.log("Error updating routine", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating routine" });
  }
};

// Delete routine function
export const deleteRoutine = async (req, res) => {
  try {
    // check if user is logged in or not
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    // fetch routine id
    const routineId = req.params.id;

    // fetch routine to be deleted from database
    const deleteRoutine = await Routine.findOneAndDelete({
      _id: routineId,
      userId: userId,
    });
    if (!deleteRoutine) {
      return res.status(404).json({
        message: "Routine not found",
      });
    }
    return res.status(200).json({
      message: "Routine deleted successfully",
    });
  } catch (error) {
    // error handling
    console.log("Error deleting routine", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting routine" });
  }
};
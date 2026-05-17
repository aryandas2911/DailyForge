import Routine from "../src/models/Routine.js";
import User from "../src/models/User.js";
import { checkOverlap } from "../utils/routineUtils.js";
import {
  successResponse,
  errorResponse,
} from "../utils/apiResponse.js";

// Create routine function
export const createRoutine = async (req, res) => {
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

    // fetch routine details from request body
    const { name, description, items } = req.body;
    if (!name || items.length === 0 || !items) {
      return errorResponse(
        res,
        "Please enter required details",
        400
      );  
    }

    // calculate endtime for each task
    const formatted = [];
    for (const item of items) {

      // check duration greater than 10 mins
      if (!item.duration || item.duration < 10) {
        return errorResponse(
          res,
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
       return errorResponse(
        res,
        `Tasks overlap on ${day}`,
        400
      );
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
    return successResponse(
      res,
      "Routine added successfully",
      { newRoutine },
      201
    );
  } catch (error) {
    // error handling
    console.log("Error creating routine", error);
    return errorResponse(
      res,
      "Error creating routine",
      500
    );
  }
};

// Fetch routine function
export const getRoutines = async (req, res) => {
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

    // fetch routines from database
    const routines = await Routine.find({ userId: userId }).sort({
      createdAt: -1,
    });
    if (routines.length === 0) {
      return errorResponse(
        res,
        "User has no routine",
        400
      );
    }
    return successResponse(
      res,
      "Routines fetched successfully",
      { routines },
      200
    );
  } catch (error) {
    // error handling
    console.log("Error fetching routine", error);
    return errorResponse(
      res,
      "Error fetching routine",
      500
    );
  }
};

// Update routine function
export const updateRoutine = async (req, res) => {
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

    // fetch updated routine details
    const updates = req.body;
    const routineId = req.params.id;

    if (updates.items) {
      // calculate endtime for each task
      const formatted = [];
      for (const item of updates.items) {
        const endTime = item.startTime + item.duration;
        formatted.push({
          day: item.day,
          startTime: item.startTime,
          endTime: endTime,
        });
      }

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
          return errorResponse(
            res,
            `Tasks overlap on ${day}`,
            400
          );
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
      return errorResponse(
        res,
        "Routine not found",
        404
      );
    }
    return successResponse(
      res,
      "Routine updated successfully",
      { routine: updatedRoutine },
      200
    );
  } catch (error) {
    // error handling
    console.log("Error updating routine", error);
    return errorResponse(
      res,
      "Error updating routine",
      500
    );
  }
};

// Delete routine function
export const deleteRoutine = async (req, res) => {
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

    // fetch routine id
    const routineId = req.params.id;

    // fetch routine to be deleted from database
    const deletedRoutine = await Routine.findOneAndDelete({
      _id: routineId,
      userId: userId,
    });
    if (!deletedRoutine) {
      return errorResponse(
        res,
        "Routine not found",
        404
      );
    }
    return successResponse(
      res,
      "Routine deleted successfully",
      {},
      200
    );
  } catch (error) {
    // error handling
    console.log("Error deleting routine", error);
    return errorResponse(
      res,
      "Error deleting routine",
      500
    );
  }
};

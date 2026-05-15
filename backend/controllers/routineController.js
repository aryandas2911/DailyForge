import Routine from "../src/models/Routine.js";
import User from "../src/models/User.js";

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
    if (!name || items.length == 0 || !items) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter required details" });
    }

    // calculate endtime for each task
    const formatted = [];
    for (const item of items) {

      // check duration greater than 10 mins
      if (!item.duration || item.duration < 10) {
        return res.status(400).json({
          success: false,
          message: "Each task duration must be at least 10 minutes",
        });
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
      for (let i = 0; i < tasks.length - 1; i++) {
        const curr = tasks[i];
        const next = tasks[i + 1];
        if (curr.endTime > next.startTime) {
          return res.status(400).json({
            success: false,
            message: `Tasks overlap on ${day}`,
          });
        }
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
      .status(200)
      .json(
        { success: true, message: "Routine added successfully" },
        newRoutine
      );
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
      return res.status(400).json({ message: "User has no routine", success: false });
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
        for (let i = 0; i < tasks.length - 1; i++) {
          const curr = tasks[i];
          const next = tasks[i + 1];
          if (curr.endTime > next.startTime) {
            return res.status(400).json({
              success: false,
              message: `Tasks overlap on ${day}`,
            });
          }
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
      message: "Routine updated successfully",
      routine: updatedRoutine,
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

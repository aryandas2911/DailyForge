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
    // Resolution: Keeping 'description' from main, but using the cleaner validation from fix branch
    const { name, description, items } = req.body;
    if (!name || !items || items.length === 0) {
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
    return res.status(200).json({
      success: true,
      message: "Routine added successfully",
      routine: newRoutine,
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

    // Resolution: Accept fix branch (200 OK with empty array is standard API practice)
    return res.status(200).json({ success: true, routines: routines || [] });
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
      // validate each item
      for (const item of updates.items) {
        if (!item.day || item.startTime === undefined || !item.duration) {
          return res.status(400).json({
            success: false,
            message: "Each task must have a day, startTime, and duration",
          });
        }
        if (item.duration < 10) {
          return res.status(400).json({
            success: false,
            message: "Each task duration must be at least 10 minutes",
          });
        }
      }

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
        success: false,
        message: "Routine not found",
      });
    }
    return res.status(200).json({
      // Resolution: Accept fix branch (adding success flag)
      success: true,
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
    const deletedRoutine = await Routine.findOneAndDelete({
      _id: routineId,
      userId: userId,
    });

    // Resolution: Accept fix branch (corrects the typo !deleteRoutine -> !deletedRoutine)
    if (!deletedRoutine) {
      return res.status(404).json({
        success: false,
        message: "Routine not found",
      });
    }
    return res.status(200).json({
      // Resolution: Accept fix branch (adding success flag)
      success: true,
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

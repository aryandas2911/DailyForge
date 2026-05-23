import mongoose from "mongoose";
import Completion from "../src/models/Completion.js";
import Routine from "../src/models/Routine.js";
import User from "../src/models/User.js";

// --- Helpers ---

const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Convert an ISO week string "YYYY-WW" into the Monday and Sunday Date objects for that week
const getWeekBounds = (weekStr) => {
  // Parse "YYYY-WW"
  const parts = weekStr.split("-");
  const year = parseInt(parts[0], 10);
  const week = parseInt(parts[1], 10);

  if (
    isNaN(year) ||
    isNaN(week) ||
    week < 1 ||
    week > 53 ||
    year < 2000 ||
    year > 2100
  ) {
    return null;
  }

  // ISO week 1 is the week containing the first Thursday of the year.
  // Jan 4 is always in week 1.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeekJan4 = jan4.getUTCDay() || 7; // 1=Mon, 7=Sun
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeekJan4 + 1 + (week - 1) * 7);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  return { monday, sunday };
};

// Get ISO week string "YYYY-WW" for a given Date
const getISOWeekString = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // 1=Mon, 7=Sun
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
};

// Format a Date to YYYY-MM-DD
const toDateString = (date) => {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Map UTC day index (0=Sun) to weekday name
const UTC_DAY_INDEX_TO_NAME = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// --- Controllers ---

// POST /api/completions
// Body: { routineId, taskId, date }
// Marks a specific routine task as complete for a given date (upsert — idempotent)
export const markComplete = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    const { routineId, taskId, date } = req.body;

    // Validate required fields
    if (!routineId || !taskId || !date) {
      return res.status(400).json({
        success: false,
        message: "routineId, taskId, and date are required",
      });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid routineId format" });
    }
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid taskId format" });
    }

    // Validate date string
    if (!DATE_REGEX.test(date)) {
      return res.status(400).json({
        success: false,
        message: "date must be in YYYY-MM-DD format",
      });
    }

    // Derive the weekday name from the date so we can match it to a routine item
    const parsedDate = new Date(date + "T00:00:00Z");
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date value" });
    }
    const weekdayName = UTC_DAY_INDEX_TO_NAME[parsedDate.getUTCDay()];

    // Verify the routine belongs to this user
    const routine = await Routine.findOne({ _id: routineId, userId });
    if (!routine) {
      return res
        .status(404)
        .json({ success: false, message: "Routine not found" });
    }

    // Find the matching routine item (same taskId AND same day)
    const routineItem = routine.items.find(
      (item) =>
        item.taskId.toString() === taskId &&
        item.day === weekdayName
    );
    if (!routineItem) {
      return res.status(404).json({
        success: false,
        message: `Task not found in this routine for ${weekdayName}`,
      });
    }

    // Upsert completion record — idempotent if called twice
    const completion = await Completion.findOneAndUpdate(
      { userId, routineId, taskId, date },
      {
        $setOnInsert: {
          userId,
          routineId,
          taskId,
          day: weekdayName,
          date,
          duration: routineItem.duration,
          completedAt: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Task marked as complete",
      data: completion,
    });
  } catch (error) {
    console.error("Error marking task complete", error);
    return res
      .status(500)
      .json({ success: false, message: "Error marking task as complete" });
  }
};

// DELETE /api/completions
// Query params: routineId, taskId, date
// Removes a completion record (undo complete)
export const undoComplete = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    const { routineId, taskId, date } = req.query;

    // Validate required fields
    if (!routineId || !taskId || !date) {
      return res.status(400).json({
        success: false,
        message: "routineId, taskId, and date are required as query params",
      });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(routineId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid routineId format" });
    }
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid taskId format" });
    }

    // Validate date string
    if (!DATE_REGEX.test(date)) {
      return res.status(400).json({
        success: false,
        message: "date must be in YYYY-MM-DD format",
      });
    }

    // Delete the record (scoped to userId so users cannot delete other users' completions)
    const deleted = await Completion.findOneAndDelete({
      userId,
      routineId,
      taskId,
      date,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Completion record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Completion removed",
      data: null,
    });
  } catch (error) {
    console.error("Error undoing task completion", error);
    return res
      .status(500)
      .json({ success: false, message: "Error removing completion" });
  }
};

// GET /api/completions/progress?week=YYYY-WW
// Returns per-day completion metrics and weekly aggregates for a given ISO week
export const getDashboardProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, user not logged in" });
    }

    // Default to current ISO week if not specified
    const weekParam = req.query.week || getISOWeekString(new Date());

    const bounds = getWeekBounds(weekParam);
    if (!bounds) {
      return res.status(400).json({
        success: false,
        message: "Invalid week format. Use YYYY-WW (e.g. 2026-21)",
      });
    }
    const { monday } = bounds;

    // Fetch all routines for this user (needed to compute planned time per weekday)
    const routines = await Routine.find({ userId });

    // Build a map: weekdayName → total planned duration (minutes) across all routines
    const plannedByDay = {};
    VALID_DAYS.forEach((d) => (plannedByDay[d] = 0));
    routines.forEach((routine) => {
      routine.items.forEach((item) => {
        plannedByDay[item.day] = (plannedByDay[item.day] || 0) + item.duration;
      });
    });

    // Build the 7 dates of the selected week (Monday → Sunday)
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      weekDates.push(d);
    }

    // Fetch all completions for this user within the week
    const weekDateStrings = weekDates.map(toDateString);
    const completions = await Completion.find({
      userId,
      date: { $in: weekDateStrings },
    });

    // Group completions by date, summing completed duration
    const completedByDate = {};
    weekDateStrings.forEach((ds) => (completedByDate[ds] = 0));
    completions.forEach((c) => {
      completedByDate[c.date] = (completedByDate[c.date] || 0) + c.duration;
    });

    // Build per-day breakdown
    const days = weekDates.map((dateObj) => {
      const dateStr = toDateString(dateObj);
      const dayName = UTC_DAY_INDEX_TO_NAME[dateObj.getUTCDay()];
      const planned = plannedByDay[dayName] || 0;
      const completed = completedByDate[dateStr] || 0;
      const completionPct = planned > 0 ? Math.round((completed / planned) * 100) : 0;
      return {
        date: dateStr,
        dayLabel: dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }),
        dayName,
        planned,
        completed,
        completionPct,
      };
    });

    // Weekly aggregates
    const totalPlanned = days.reduce((sum, d) => sum + d.planned, 0);
    const totalCompleted = days.reduce((sum, d) => sum + d.completed, 0);
    const weeklyPct =
      totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

    // --- Streak Calculation (single aggregation, computed in-memory) ---
    // Fetch all completions for this user grouped by date (sum of durations completed per day)
    const todayStr = toDateString(new Date());

    const allCompletionsByDate = await Completion.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$date", totalCompleted: { $sum: "$duration" } } },
    ]);

    // Build a map: date string → total completed minutes
    const completedMinsMap = {};
    allCompletionsByDate.forEach((doc) => {
      completedMinsMap[doc._id] = doc.totalCompleted;
    });

    // Walk backwards from today computing streak
    let streak = 0;
    const checkDate = new Date();
    checkDate.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const ds = toDateString(checkDate);

      // What weekday is this date?
      const dayName = UTC_DAY_INDEX_TO_NAME[checkDate.getUTCDay()];
      const planned = plannedByDay[dayName] || 0;

      // Skip days with no planned tasks — they don't break the streak
      if (planned === 0) {
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        continue;
      }

      const completedMins = completedMinsMap[ds] || 0;
      const pct = Math.round((completedMins / planned) * 100);

      if (pct === 100) {
        streak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        // Today is still in progress — don't break streak on today
        if (ds !== todayStr) {
          break;
        }
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard progress fetched successfully",
      data: {
        week: weekParam,
        days,
        weeklyPct,
        totalPlanned,
        totalCompleted,
        streak,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard progress", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching dashboard progress" });
  }
};


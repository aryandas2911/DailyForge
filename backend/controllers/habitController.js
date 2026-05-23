import Habit from "../src/models/Habit.js";
import User from "../src/models/User.js";

// Helper to format Date object to YYYY-MM-DD in local time
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Calculate current and best streak based on completion log array
const calculateStreaks = (logs) => {
  if (!logs || logs.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Deduplicate and sort logs in ascending order (chronological)
  const sortedLogs = [...new Set(logs)].sort((a, b) => new Date(a) - new Date(b));

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let currentStreak = 0;
  const lastLog = sortedLogs[sortedLogs.length - 1];

  // Current streak is valid only if completed today or yesterday
  if (lastLog === todayStr || lastLog === yesterdayStr) {
    let checkDate = new Date(lastLog);
    // Use loop to count consecutive days going backwards
    let tempDateStr = getLocalDateString(checkDate);
    
    while (sortedLogs.includes(tempDateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      tempDateStr = getLocalDateString(checkDate);
    }
  }

  // Calculate best streak of all time
  let bestStreak = 0;
  let tempStreak = 0;
  let lastCheckedDate = null;

  for (const logStr of sortedLogs) {
    const currentDate = new Date(logStr);
    
    if (!lastCheckedDate) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate - lastCheckedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    
    bestStreak = Math.max(bestStreak, tempStreak);
    lastCheckedDate = currentDate;
  }

  return { currentStreak, bestStreak };
};

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Habit name is required",
      });
    }

    const newHabit = new Habit({
      userId,
      name,
      description,
      logs: [],
    });

    const savedHabit = await newHabit.save();

    res.status(201).json({
      success: true,
      message: "Habit created successfully",
      habit: savedHabit,
    });
  } catch (error) {
    console.error("Error creating habit:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating habit",
    });
  }
};

// @desc    Get all user habits
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res) => {
  try {
    const userId = req.userId;
    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      habits,
    });
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching habits",
    });
  }
};

// @desc    Toggle habit completion for a specific date (defaults to today)
// @route   PUT /api/habits/:id/toggle
// @access  Private
export const toggleHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Allow client to pass a target date, default to local today
    const { date } = req.body;
    const targetDateStr = date || getLocalDateString();

    const habit = await Habit.findOne({ _id: id, userId });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    const dateIndex = habit.logs.indexOf(targetDateStr);

    if (dateIndex > -1) {
      // Already logged, so untoggle/remove it
      habit.logs.splice(dateIndex, 1);
    } else {
      // Log completion
      habit.logs.push(targetDateStr);
    }

    // Recalculate current and best streaks
    const { currentStreak, bestStreak } = calculateStreaks(habit.logs);
    habit.currentStreak = currentStreak;
    habit.bestStreak = bestStreak;

    const updatedHabit = await habit.save();

    res.status(200).json({
      success: true,
      message: dateIndex > -1 ? "Habit marked incomplete" : "Habit marked complete",
      habit: updatedHabit,
    });
  } catch (error) {
    console.error("Error toggling habit:", error);
    res.status(500).json({
      success: false,
      message: "Server error while toggling habit",
    });
  }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const deletedHabit = await Habit.findOneAndDelete({ _id: id, userId });

    if (!deletedHabit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting habit",
    });
  }
};

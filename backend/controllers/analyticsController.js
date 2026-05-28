import Task from "../src/models/Task.js";
import Routine from "../src/models/Routine.js";
import User from "../src/models/User.js";

// Helper to format Date to YYYY-MM-DD in user's timezone/local
const formatDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, user not logged in",
      });
    }

    // Fetch all user tasks and routines
    const tasks = await Task.find({ userId });
    const routines = await Routine.find({ userId });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed");
    const completedTasksCount = completedTasks.length;
    const dueTasksCount = totalTasks - completedTasksCount;
    const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    // --- Streak Calculation ---
    // A completed task date is the date it was completed.
    // We use updatedAt for completion timestamp, fallback to dueDate if updatedAt is not set.
    const completedDates = completedTasks.map((t) => formatDateString(t.updatedAt || t.dueDate));
    const uniqueDates = [...new Set(completedDates)].sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    let bestStreak = 0;

    if (uniqueDates.length > 0) {
      const todayStr = formatDateString(new Date());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateString(yesterday);

      let checkDate = null;
      if (uniqueDates.includes(todayStr)) {
        checkDate = new Date(todayStr);
      } else if (uniqueDates.includes(yesterdayStr)) {
        checkDate = new Date(yesterdayStr);
      }

      if (checkDate) {
        let tempDate = new Date(checkDate);
        while (true) {
          const tempStr = formatDateString(tempDate);
          if (uniqueDates.includes(tempStr)) {
            currentStreak++;
            tempDate.setDate(tempDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Best streak calculation
      let currentRun = 0;
      const sortedDatesAsc = [...uniqueDates].reverse();
      let prevDate = null;

      for (const dateStr of sortedDatesAsc) {
        const currentDate = new Date(dateStr);
        if (!prevDate) {
          currentRun = 1;
        } else {
          const diffTime = Math.abs(currentDate - prevDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentRun++;
          } else if (diffDays > 1) {
            currentRun = 1;
          }
        }
        bestStreak = Math.max(bestStreak, currentRun);
        prevDate = currentDate;
      }
    }

    // --- Daily Progress (Last 7 Days) ---
    const dailyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const targetStr = formatDateString(targetDate);

      // Tasks due or created on this day
      const dailyTasks = tasks.filter((t) => formatDateString(t.dueDate) === targetStr);
      const dailyCompleted = dailyTasks.filter((t) => t.status === "Completed").length;

      dailyProgress.push({
        date: targetStr,
        label: targetDate.toLocaleDateString("en-US", { weekday: "short" }),
        total: dailyTasks.length,
        completed: dailyCompleted,
      });
    }

    // --- Weekly Trend (Last 4 Weeks) ---
    const weeklyTrend = [];
    for (let i = 3; i >= 0; i--) {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 7) + 1 - i * 7); // Monday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const weekTasks = tasks.filter((t) => {
        const due = new Date(t.dueDate);
        return due >= startOfWeek && due <= endOfWeek;
      });
      const weekCompleted = weekTasks.filter((t) => t.status === "Completed").length;

      weeklyTrend.push({
        label: `Wk -${i}`,
        total: weekTasks.length,
        completed: weekCompleted,
        rate: weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0,
      });
    }

    // --- Monthly Progress (Last 6 Months) ---
    const monthlyProgress = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date();
      targetMonth.setMonth(targetMonth.getMonth() - i);
      const year = targetMonth.getFullYear();
      const month = targetMonth.getMonth();

      const monthTasks = tasks.filter((t) => {
        const due = new Date(t.dueDate);
        return due.getFullYear() === year && due.getMonth() === month;
      });
      const monthCompleted = monthTasks.filter((t) => t.status === "Completed").length;

      monthlyProgress.push({
        label: targetMonth.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        total: monthTasks.length,
        completed: monthCompleted,
        rate: monthTasks.length > 0 ? Math.round((monthCompleted / monthTasks.length) * 100) : 0,
      });
    }

    // --- Category Breakdown ---
    const categoriesList = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Shopping', 'Other'];
    const categoryStats = categoriesList.map((category) => {
      const catTasks = tasks.filter((t) => t.tags && t.tags.includes(category));
      const catCompleted = catTasks.filter((t) => t.status === "Completed").length;
      return {
        category,
        total: catTasks.length,
        completed: catCompleted,
        rate: catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0,
      };
    });

    // --- Priority Breakdown ---
    const prioritiesList = ["High", "Medium", "Low"];
    const priorityStats = prioritiesList.map((priority) => {
      const prioTasks = tasks.filter((t) => t.priority === priority);
      const prioCompleted = prioTasks.filter((t) => t.status === "Completed").length;
      return {
        priority,
        total: prioTasks.length,
        completed: prioCompleted,
        rate: prioTasks.length > 0 ? Math.round((prioCompleted / prioTasks.length) * 100) : 0,
      };
    });

    // --- Most Frequent Completed Tasks ---
    const titleFrequencies = {};
    completedTasks.forEach((t) => {
      const title = t.title.trim();
      titleFrequencies[title] = (titleFrequencies[title] || 0) + 1;
    });

    const mostFrequentTasks = Object.entries(titleFrequencies)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // --- Routine Statistics ---
    const totalRoutines = routines.length;
    let totalRoutineTasksCount = 0;
    const routineDayDistribution = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    routines.forEach((r) => {
      if (r.items) {
        totalRoutineTasksCount += r.items.length;
        r.items.forEach((item) => {
          if (routineDayDistribution[item.day] !== undefined) {
            routineDayDistribution[item.day]++;
          }
        });
      }
    });

    // --- Weekly Productivity Dashboard Statistics (Issue #783) ---
    const activeIdsStr = req.query.activeRoutines || "";
    const activeIds = activeIdsStr ? activeIdsStr.split(",") : [];

    const activeRoutines = routines.filter((r) => activeIds.includes(r._id.toString()));
    const routinesToUse = activeRoutines.length > 0 ? activeRoutines : routines;

    let totalScheduledDurationMinutes = 0;
    const dayRoutinesDistribution = {
      Monday: { hours: 0, count: 0 },
      Tuesday: { hours: 0, count: 0 },
      Wednesday: { hours: 0, count: 0 },
      Thursday: { hours: 0, count: 0 },
      Friday: { hours: 0, count: 0 },
      Saturday: { hours: 0, count: 0 },
      Sunday: { hours: 0, count: 0 },
    };

    routinesToUse.forEach((r) => {
      if (r.items) {
        r.items.forEach((item) => {
          totalScheduledDurationMinutes += item.duration;
          if (dayRoutinesDistribution[item.day]) {
            dayRoutinesDistribution[item.day].hours += item.duration / 60;
            dayRoutinesDistribution[item.day].count += 1;
          }
        });
      }
    });

    const totalScheduledHours = parseFloat((totalScheduledDurationMinutes / 60).toFixed(1));

    const startOfCurrentWeek = new Date();
    startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - (startOfCurrentWeek.getDay() || 7) + 1);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const dailyActivity = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, idx) => {
      const dayHours = dayRoutinesDistribution[dayName].hours;
      
      const targetDayDate = new Date(startOfCurrentWeek);
      targetDayDate.setDate(startOfCurrentWeek.getDate() + idx);
      const targetDayStr = formatDateString(targetDayDate);

      const standardTasksCount = tasks.filter((t) => formatDateString(t.dueDate) === targetDayStr).length;
      const routineTasksCount = dayRoutinesDistribution[dayName].count;

      return {
        day: dayName,
        label: dayName.slice(0, 3),
        hours: parseFloat(dayHours.toFixed(1)),
        tasksCount: standardTasksCount + routineTasksCount,
      };
    });

    let mostProductiveDay = "None yet";
    let maxWorkload = 0;
    dailyActivity.forEach((dayData) => {
      const workload = dayData.hours * 2 + dayData.tasksCount;
      if (workload > maxWorkload) {
        maxWorkload = workload;
        mostProductiveDay = dayData.day;
      }
    });

    const categoryMapping = {
      Study: ["study", "learning", "homework", "school", "education", "class"],
      Fitness: ["fitness", "health", "gym", "workout", "sport", "sports"],
      Work: ["work", "job", "office", "finance", "business"],
      Personal: ["personal", "life", "shopping", "family", "home", "creative"],
    };

    const categoryDistribution = {
      Study: 0,
      Fitness: 0,
      Work: 0,
      Personal: 0,
      Others: 0,
    };

    tasks.forEach((task) => {
      let categorized = false;
      if (task.tags && task.tags.length > 0) {
        for (const tag of task.tags) {
          const lowerTag = tag.toLowerCase().trim();
          for (const [catName, keywords] of Object.entries(categoryMapping)) {
            if (keywords.some((kw) => lowerTag.includes(kw))) {
              categoryDistribution[catName]++;
              categorized = true;
              break;
            }
          }
          if (categorized) break;
        }
      }
      if (!categorized) {
        categoryDistribution.Others++;
      }
    });

    const totalCategorizedTasks = tasks.length;
    const categoryStatsData = Object.entries(categoryDistribution).map(([category, count]) => ({
      category,
      count,
      percentage: totalCategorizedTasks > 0 ? Math.round((count / totalCategorizedTasks) * 100) : 0,
    }));

    let totalItemsCount = 0;
    let sumDurations = 0;
    let longestRoutineName = "None";
    let longestRoutineDuration = 0;

    routines.forEach((r) => {
      let routineDur = 0;
      if (r.items) {
        totalItemsCount += r.items.length;
        r.items.forEach((item) => {
          sumDurations += item.duration;
          routineDur += item.duration;
        });
      }
      if (routineDur > longestRoutineDuration) {
        longestRoutineDuration = routineDur;
        longestRoutineName = r.name;
      }
    });

    const avgTaskDuration = totalItemsCount > 0 ? Math.round(sumDurations / totalItemsCount) : 0;
    const totalWeeklyPlannedHours = parseFloat((sumDurations / 60).toFixed(1));

    const routineStats = {
      avgTaskDuration,
      longestRoutine: {
        name: longestRoutineName,
        durationHours: parseFloat((longestRoutineDuration / 60).toFixed(1)),
      },
      totalWeeklyPlannedHours,
    };

    return res.status(200).json({
      success: true,
      stats: {
        summary: {
          totalTasks,
          completedTasksCount,
          dueTasksCount,
          overallCompletionRate,
          totalRoutines,
          totalRoutineTasksCount,
        },
        streaks: {
          currentStreak,
          bestStreak,
        },
        dailyProgress,
        weeklyTrend,
        monthlyProgress,
        categoryStats,
        priorityStats,
        mostFrequentTasks,
        routineDayDistribution,
        weeklyProductivity: {
          overview: {
            totalScheduledHours,
            totalTasksAdded: totalTasks,
            activeRoutinesCount: activeRoutines.length || totalRoutines,
            mostProductiveDay,
          },
          categoryDistribution: categoryStatsData,
          dailyActivity,
          routineStats,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAnalytics controller", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching analytics data",
    });
  }
};

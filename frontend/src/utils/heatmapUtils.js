/**
 * @module heatmapUtils
 * @description Utility functions for calculating streaks, scores, and generating mock data for the contribution heatmap calendar.
 */

/**
 * Generates contribution data for the last 53 weeks (371 days) ending on the current day,
 * aligned so the grid starts on a Sunday.
 * 
 * @returns {Array<object>} Array of day objects with date, tasksCompleted, tasksTotal, score, and routinesCompleted
 */
export function generateMockYearlyData() {
  const data = [];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  // Find the Saturday of the current week
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + (6 - today.getDay()));
  
  // Align grid to start on the Sunday of the week 52 weeks ago
  const totalDays = 53 * 7; // 371 days
  const startDate = new Date(saturday);
  startDate.setDate(saturday.getDate() - totalDays + 1);

  // Generate sequential data
  let tempDate = new Date(startDate);
  
  // Seed random streak patterns for realistic look
  for (let i = 0; i < totalDays; i++) {
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, "0");
    const day = String(tempDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const isWeekend = tempDate.getDay() === 0 || tempDate.getDay() === 6;
    
    const isFuture = dateStr > todayStr;
    
    // Simulate user productivity patterns
    let tasksTotal = 0;
    let tasksCompleted = 0;
    let routinesCompleted = 0;

    if (!isFuture) {
      // Define random factor
      const rand = Math.random();
      
      // 75% chance of having tasks on weekdays, 35% on weekends
      const hasTasks = isWeekend ? rand < 0.35 : rand < 0.78;
      
      if (hasTasks) {
        tasksTotal = Math.floor(Math.random() * 5) + 2; // 2 to 6 tasks
        
        const completionChance = Math.random();
        if (completionChance < 0.15) {
          // 0% completion (inactive day)
          tasksCompleted = 0;
        } else if (completionChance < 0.4) {
          // Low completion (1-30%)
          tasksCompleted = Math.max(1, Math.floor(tasksTotal * 0.25));
        } else if (completionChance < 0.7) {
          // Medium completion (31-60%)
          tasksCompleted = Math.floor(tasksTotal * 0.5);
        } else if (completionChance < 0.9) {
          // High completion (61-99%)
          tasksCompleted = Math.min(tasksTotal - 1, Math.floor(tasksTotal * 0.8));
        } else {
          // 100% completion (perfect day)
          tasksCompleted = tasksTotal;
          routinesCompleted = Math.random() < 0.5 ? 1 : 0;
        }
      }
      
      // Adjust completion for active streak towards the end to guarantee current streak matches today
      const daysFromEnd = totalDays - i;
      if (daysFromEnd <= 12) {
        // Guarantee a nice active current streak for the last 12 days
        tasksTotal = Math.floor(Math.random() * 3) + 3;
        tasksCompleted = Math.random() < 0.3 ? tasksTotal : tasksTotal - 1;
        routinesCompleted = Math.random() < 0.4 ? 1 : 0;
      }
    }

    const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
    
    // Determine color scale value (0-3) based on completed tasks count
    let score = 0; // Inactive
    if (tasksCompleted === 0) {
      score = 0;
    } else if (tasksCompleted === 1) {
      score = 1;
    } else if (tasksCompleted === 2) {
      score = 2;
    } else {
      score = 3;
    }

    data.push({
      date: new Date(tempDate),
      dateStr,
      tasksCompleted,
      tasksTotal,
      completionRate,
      routinesCompleted,
      score,
      colIdx: Math.floor(i / 7),
      isFuture,
    });

    // Move to next day
    tempDate.setDate(tempDate.getDate() + 1);
  }

  return data;
}

/**
 * Processes real user task and routine data for the last 53 weeks (371 days).
 * 
 * @param {Array<object>} tasks - User's DB tasks
 * @param {Array<object>} routineTasks - User's routine-generated tasks from localStorage
 * @returns {Array<object>} Array of day objects with date, tasksCompleted, tasksTotal, score, and routinesCompleted
 */
export function generateRealYearlyData(tasks = [], routineTasks = []) {
  const data = [];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  // Find the Saturday of the current week
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + (6 - today.getDay()));
  
  // Align grid to start on the Sunday of the week 52 weeks ago
  const totalDays = 53 * 7; // 371 days
  const startDate = new Date(saturday);
  startDate.setDate(saturday.getDate() - totalDays + 1);
  
  let tempDate = new Date(startDate);
  
  // Ensure tasks arrays are valid
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeRoutineTasks = Array.isArray(routineTasks) ? routineTasks : [];
  
  // Combine all tasks for high-performance single-pass queries
  const allTasks = [...safeTasks, ...safeRoutineTasks];

  for (let i = 0; i < totalDays; i++) {
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, "0");
    const day = String(tempDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    
    const isFuture = dateStr > todayStr;
    
    // Filter tasks that fall on this day using timezone-robust local date comparison
    const dayTasks = isFuture ? [] : allTasks.filter(t => {
      const isCompleted = t.status === "Completed";
      const dateToUse = isCompleted ? (t.completedAt || t.updatedAt || t.dueDate) : t.dueDate;
      
      if (!dateToUse) return false;
      let tDateStr = "";
      try {
        const d = new Date(dateToUse);
        if (!isNaN(d.getTime())) {
          // If the original dateToUse is a plain date string "YYYY-MM-DD", preserve it exactly
          if (typeof dateToUse === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateToUse.trim())) {
            tDateStr = dateToUse.trim();
          } else {
            // Otherwise, translate full ISO strings or Date instances to local YYYY-MM-DD
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const dPart = String(d.getDate()).padStart(2, "0");
            tDateStr = `${y}-${m}-${dPart}`;
          }
        }
      } catch {
        tDateStr = "";
      }
      return tDateStr === dateStr;
    });
    
    const tasksTotal = dayTasks.length;
    const tasksCompleted = dayTasks.filter(t => t.status === "Completed").length;
    
    // Routines completed on this day (source === "routine" or starts with "routine-")
    const routinesCompleted = dayTasks.filter(
      t => (t.source === "routine" || (t._id && String(t._id).startsWith("routine-"))) && t.status === "Completed"
    ).length;
    
    const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
    
    // Map scoring based on count of completed tasks:
    // 0 completed tasks -> score 0 (grey, inactive)
    // 1 completed task -> score 1 (low productivity, dark teal)
    // 2 completed tasks -> score 2 (medium productivity, cyan)
    // 3+ completed tasks -> score 3 (perfect day, glowing mint)
    let score = 0;
    if (tasksCompleted === 0) {
      score = 0;
    } else if (tasksCompleted === 1) {
      score = 1;
    } else if (tasksCompleted === 2) {
      score = 2;
    } else {
      score = 3;
    }
    
    data.push({
      date: new Date(tempDate),
      dateStr,
      tasksCompleted,
      tasksTotal,
      completionRate,
      routinesCompleted,
      score,
      colIdx: Math.floor(i / 7),
      isFuture,
    });
    
    tempDate.setDate(tempDate.getDate() + 1);
  }
  
  return data;
}

/**
 * Calculates productivity statistics including streaks
 * 
 * @param {Array<object>} data - The yearly contribution data
 * @returns {object} Statistics object containing currentStreak, longestStreak, totalProductiveDays, and yearlyPercentage
 */
export function calculateHeatmapStats(data) {
  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  let totalProductiveDays = 0;
  let totalCompletionSum = 0;
  let totalDaysWithTasks = 0;

  // Process chronological order to calculate streaks
  // data is already generated in order
  for (let i = 0; i < data.length; i++) {
    const day = data[i];
    const isProductive = day.tasksCompleted > 0;

    if (isProductive) {
      tempStreak++;
      totalProductiveDays++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }

    if (day.tasksTotal > 0) {
      totalCompletionSum += day.completionRate;
      totalDaysWithTasks++;
    }
  }

  // Calculate current streak working backwards from today
  // Find index of today or yesterday in data
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, "0");
  const day = String(todayDate.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;
  
  let todayIndex = data.findIndex(d => d.dateStr === todayStr);
  
  if (todayIndex === -1) {
    todayIndex = data.length - 1; // fallback to last element
  }

  // Check if today or yesterday was productive to continue current streak
  const todayDay = data[todayIndex];
  const yesterdayDay = data[todayIndex - 1];

  const todayProductive = todayDay && todayDay.tasksCompleted > 0;
  const yesterdayProductive = yesterdayDay && yesterdayDay.tasksCompleted > 0;

  if (todayProductive || yesterdayProductive) {
    // Start backwards from the latest productive day (today or yesterday)
    let startIdx = todayProductive ? todayIndex : todayIndex - 1;
    for (let i = startIdx; i >= 0; i--) {
      const day = data[i];
      if (day.tasksCompleted > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  const yearlyPercentage = totalDaysWithTasks > 0
    ? Math.round(totalCompletionSum / totalDaysWithTasks)
    : 0;

  return {
    longestStreak,
    currentStreak,
    totalProductiveDays,
    yearlyPercentage,
  };
}

/**
 * Returns color classes and color names based on score index
 * 
 * @param {number} score - Productivity score index (0-4)
 * @returns {object} Object containing color code, tailwind class, and label
 */
export function getProductivityColorDetails(score) {
  switch (score) {
    case 1:
      return {
        color: "#0f766e",
        bgClass: "bg-teal-200 dark:bg-[#0f766e]",
        textClass: "text-teal-600 dark:text-[#0f766e]",
        glowClass: "",
        label: "Low Productivity (1 task)",
      };
    case 2:
      return {
        color: "#14b8a6",
        bgClass: "bg-teal-400 dark:bg-[#14b8a6]",
        textClass: "text-teal-700 dark:text-[#14b8a6]",
        glowClass: "",
        label: "Medium Productivity (2 tasks)",
      };
    case 3:
      return {
        color: "#99f6e4",
        bgClass: "bg-teal-600 dark:bg-[#99f6e4]",
        textClass: "text-teal-800 dark:text-[#99f6e4]",
        glowClass: "shadow-[0_0_8px_rgba(13,148,136,0.35)] dark:shadow-[0_0_10px_rgba(153,246,228,0.5)] border border-teal-500/20 dark:border-[#ccfbf1]",
        label: "Perfect Day (3+ tasks)",
      };
    default:
      return {
        color: "#1e293b",
        bgClass: "bg-slate-300/80 dark:bg-slate-800/60",
        textClass: "text-slate-400 dark:text-slate-400",
        glowClass: "",
        label: "Inactive (0 tasks)",
      };
  }
}


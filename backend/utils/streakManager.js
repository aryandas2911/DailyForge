import Task from "../src/models/Task.js";

// Helper to format Date to YYYY-MM-DD in local time
export const formatDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const checkAndApplyStreakFreezes = async (user) => {
  try {
    const today = new Date();
    
    // 1. Replenish freezes if it's a new month (e.g. "2026-05")
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    if (user.lastFreezeReplenishDate !== currentMonthStr) {
      user.streakFreezeCount = 2;
      user.lastFreezeReplenishDate = currentMonthStr;
    }

    // 2. Fetch completed tasks for user to compute dates
    const completedTasks = await Task.find({ userId: user._id, status: "Completed" });
    const completedDates = completedTasks.map((t) => formatDateString(t.updatedAt || t.dueDate));
    
    // Combine completed dates and frozen dates
    let activeDates = [...new Set([...completedDates, ...user.frozenDates])];
    
    // If the user has never completed a task, they don't have a streak to protect yet.
    if (completedDates.length === 0) {
      await user.save();
      return;
    }

    // We check starting from yesterday and go backward
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    
    // Find the oldest completed task date to bound the backward check
    const oldestCompletedStr = completedDates.reduce((oldest, current) => {
      return new Date(current) < new Date(oldest) ? current : oldest;
    }, completedDates[0]);
    const oldestCompletedDate = new Date(oldestCompletedStr);

    let modified = false;

    // Check day-by-day backward
    while (checkDate >= oldestCompletedDate) {
      const checkDateStr = formatDateString(checkDate);
      
      if (activeDates.includes(checkDateStr)) {
        // Day was active (completed or frozen). The streak is intact up to here.
        // We can stop going backward because earlier days are already protected/active
        break;
      } else {
        // Gap detected! Check if user has freezes to automatically consume
        if (user.streakFreezeCount > 0) {
          user.streakFreezeCount -= 1;
          user.freezesUsed = (user.freezesUsed || 0) + 1;
          user.frozenDates.push(checkDateStr);
          activeDates.push(checkDateStr);
          modified = true;
          
          // Move checkDate to previous day to continue checking gaps
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // No freezes left. Streak breaks here, stop checking backward
          break;
        }
      }
    }

    // Update longest protected streak if freezes are active
    if (modified || user.frozenDates.length > 0) {
      const uniqueDatesSorted = [...new Set(activeDates)].sort((a, b) => new Date(b) - new Date(a));
      let currentStreak = 0;
      
      if (uniqueDatesSorted.length > 0) {
        const todayStr = formatDateString(new Date());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateString(yesterday);

        let streakStartRef = null;
        if (uniqueDatesSorted.includes(todayStr)) {
          streakStartRef = new Date(todayStr);
        } else if (uniqueDatesSorted.includes(yesterdayStr)) {
          streakStartRef = new Date(yesterdayStr);
        }

        if (streakStartRef) {
          let tempDate = new Date(streakStartRef);
          while (true) {
            const tempStr = formatDateString(tempDate);
            if (uniqueDatesSorted.includes(tempStr)) {
              currentStreak++;
              tempDate.setDate(tempDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }
      
      if (user.frozenDates.length > 0) {
        user.longestProtectedStreak = Math.max(user.longestProtectedStreak || 0, currentStreak);
      }
    }

    user.lastFreezeCheckDate = formatDateString(today);
    await user.save();
  } catch (error) {
    console.error("Error in checkAndApplyStreakFreezes helper:", error);
  }
};

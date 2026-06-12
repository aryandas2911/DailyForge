export function generateMockYearlyData() {
  const data = [];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + (6 - today.getDay()));
  
  const totalDays = 53 * 7;
  const startDate = new Date(saturday);
  startDate.setDate(saturday.getDate() - totalDays + 1);

  let tempDate = new Date(startDate);
  
  for (let i = 0; i < totalDays; i++) {
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, "0");
    const day = String(tempDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const isWeekend = tempDate.getDay() === 0 || tempDate.getDay() === 6;
    
    const isFuture = dateStr > todayStr;
    
    let tasksTotal = 0;
    let tasksCompleted = 0;
    let routinesCompleted = 0;

    if (!isFuture) {
      const rand = Math.random();
      const hasTasks = isWeekend ? rand < 0.35 : rand < 0.78;
      
      if (hasTasks) {
        tasksTotal = Math.floor(Math.random() * 5) + 2;
        
        const completionChance = Math.random();
        if (completionChance < 0.15) {
          tasksCompleted = 0;
        } else if (completionChance < 0.4) {
          tasksCompleted = Math.max(1, Math.floor(tasksTotal * 0.25));
        } else if (completionChance < 0.7) {
          tasksCompleted = Math.floor(tasksTotal * 0.5);
        } else if (completionChance < 0.9) {
          tasksCompleted = Math.min(tasksTotal - 1, Math.floor(tasksTotal * 0.8));
        } else {
          tasksCompleted = tasksTotal;
          routinesCompleted = Math.random() < 0.5 ? 1 : 0;
        }
      }
      
      const daysFromEnd = totalDays - i;
      if (daysFromEnd <= 12) {
        tasksTotal = Math.floor(Math.random() * 3) + 3;
        tasksCompleted = Math.random() < 0.3 ? tasksTotal : tasksTotal - 1;
        routinesCompleted = Math.random() < 0.4 ? 1 : 0;
      }
    }

    const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
    
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

export function generateRealYearlyData(tasks = [], routineTasks = []) {
  const data = [];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + (6 - today.getDay()));
  
  const totalDays = 53 * 7;
  const startDate = new Date(saturday);
  startDate.setDate(saturday.getDate() - totalDays + 1);
  
  let tempDate = new Date(startDate);
  
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeRoutineTasks = Array.isArray(routineTasks) ? routineTasks : [];
  const allTasks = [...safeTasks, ...safeRoutineTasks];

  for (let i = 0; i < totalDays; i++) {
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, "0");
    const day = String(tempDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    
    const isFuture = dateStr > todayStr;
    
    const dayTasks = isFuture ? [] : allTasks.filter(t => {
      const isCompleted = t.status === "Completed";
      const dateToUse = isCompleted ? (t.completedAt || t.updatedAt || t.dueDate) : t.dueDate;
      
      if (!dateToUse) return false;
      let tDateStr = "";
      try {
        const d = new Date(dateToUse);
        if (!isNaN(d.getTime())) {
          if (typeof dateToUse === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateToUse.trim())) {
            tDateStr = dateToUse.trim();
          } else {
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
    
    const routinesCompleted = dayTasks.filter(
      t => (t.source === "routine" || (t._id && String(t._id).startsWith("routine-"))) && t.status === "Completed"
    ).length;
    
    const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
    
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

export function calculateHeatmapStats(data) {
  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  let totalProductiveDays = 0;
  let totalCompletionSum = 0;
  let totalDaysWithTasks = 0;

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

  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, "0");
  const day = String(todayDate.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;
  
  let todayIndex = data.findIndex(d => d.dateStr === todayStr);
  
  if (todayIndex === -1) {
    todayIndex = data.length - 1;
  }

  const todayDay = data[todayIndex];
  const yesterdayDay = data[todayIndex - 1];

  const todayProductive = todayDay && todayDay.tasksCompleted > 0;
  const yesterdayProductive = yesterdayDay && yesterdayDay.tasksCompleted > 0;

  if (todayProductive || yesterdayProductive) {
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

export function getProductivityColorDetails(score) {
  switch (score) {
    case 1:
      return {
        color: "#3b8ea0",
        bgClass: "bg-cyan-600/30 dark:bg-[#3b8ea0]/20 border border-slate-200/50 dark:border-slate-800",
        textClass: "text-[#3b8ea0] dark:text-cyan-400",
        glowClass: "",
        label: "Low Productivity (1 task)",
      };
    case 2:
      return {
        color: "#3b8ea0",
        bgClass: "bg-[#3b8ea0] text-white",
        textClass: "text-[#3b8ea0] dark:text-cyan-300",
        glowClass: "",
        label: "Medium Productivity (2 tasks)",
      };
    case 3:
      return {
        color: "#4eb7b3",
        bgClass: "bg-[#4eb7b3] text-white",
        textClass: "text-[#4eb7b3] dark:text-emerald-400",
        glowClass: "shadow-[0_0_12px_rgba(78,183,179,0.4)] border border-[#4eb7b3]/40 dark:border-emerald-500/30",
        label: "Perfect Day (3+ tasks)",
      };
    default:
      return {
        color: "#1e293b",
        bgClass: "bg-slate-200/60 dark:bg-slate-800/40",
        textClass: "text-slate-400 dark:text-slate-500",
        glowClass: "",
        label: "Inactive (0 tasks)",
      };
  }
}
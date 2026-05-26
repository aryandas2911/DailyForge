import Task from "../src/models/Task.js";
import Routine from "../src/models/Routine.js";
import User from "../src/models/User.js";

const formatDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getIntelligence = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, user not logged in",
      });
    }

    const tasks = await Task.find({ userId });
    const routines = await Routine.find({ userId });

    // 1. Calculate Overdue Percentage (Last 7 Days)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentTasks = tasks.filter((t) => {
      const due = new Date(t.dueDate);
      return due >= sevenDaysAgo && due <= todayDate;
    });

    const recentOverdue = recentTasks.filter((t) => t.status === "Due" && new Date(t.dueDate) < new Date()).length;
    const overduePercentage = recentTasks.length > 0 ? Math.round((recentOverdue / recentTasks.length) * 100) : 0;

    // 2. Calculate Daily Workload Hours (Current Day)
    const currentDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
    
    let dailyRoutineMinutes = 0;
    routines.forEach((r) => {
      if (r.items) {
        r.items.forEach((item) => {
          if (item.day === currentDayName) {
            dailyRoutineMinutes += (item.duration || 30); // fallback 30 mins
          }
        });
      }
    });

    const tasksDueToday = tasks.filter((t) => formatDateString(t.dueDate) === formatDateString(new Date()));
    // Assume average task takes 30 mins if actualDuration is not set
    const dailyTaskMinutes = tasksDueToday.reduce((acc, t) => acc + (t.actualDuration || 30), 0);
    
    const dailyWorkloadHours = Math.round(((dailyRoutineMinutes + dailyTaskMinutes) / 60) * 10) / 10;

    // 3. Habit Fatigue & Weekly Balance
    const weeklyWorkload = {
      Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
    };
    
    routines.forEach((r) => {
      if (r.items) {
        r.items.forEach((item) => {
          if (weeklyWorkload[item.day] !== undefined) {
            weeklyWorkload[item.day] += (item.duration || 30) / 60;
          }
        });
      }
    });

    // Format weekly workload for charts
    const weeklyWorkloadArray = Object.keys(weeklyWorkload).map(day => ({
      day: day.substring(0, 3), // Mon, Tue...
      hours: Math.round(weeklyWorkload[day] * 10) / 10
    }));

    // Fatigue detection heuristics
    let fatigueDetected = false;
    if (overduePercentage > 30 && dailyWorkloadHours > 6) {
      fatigueDetected = true;
    }

    // 4. Calculate Burnout Risk Score (0-100)
    let burnoutScore = 0;
    
    // Workload contribution (up to 40 points)
    // 8+ hours is max points
    burnoutScore += Math.min(40, (dailyWorkloadHours / 8) * 40);
    
    // Overdue contribution (up to 40 points)
    burnoutScore += Math.min(40, (overduePercentage / 50) * 40); // 50% overdue gives max penalty

    // Fatigue contribution (up to 20 points)
    if (fatigueDetected) burnoutScore += 20;

    burnoutScore = Math.min(100, Math.round(burnoutScore));

    let riskLevel = "Low";
    if (burnoutScore >= 75) riskLevel = "Critical";
    else if (burnoutScore >= 50) riskLevel = "High";
    else if (burnoutScore >= 25) riskLevel = "Moderate";

    // 5. Generate Recommendations
    const recommendations = [];
    if (burnoutScore >= 75) {
      recommendations.push({
        type: "urgent",
        message: "You are at critical risk of burnout. Consider taking a mandatory rest day tomorrow and delegating non-essential tasks.",
        icon: "alert"
      });
    }

    if (dailyWorkloadHours > 8) {
      recommendations.push({
        type: "workload",
        message: `Your schedule today is extremely heavy (${dailyWorkloadHours} hours). Try to break tasks into smaller chunks.`,
        icon: "clock"
      });
    }

    if (overduePercentage > 25) {
      recommendations.push({
        type: "fatigue",
        message: `You've missed ${overduePercentage}% of your recent tasks. Consider reducing your daily goals to build momentum.`,
        icon: "trending-down"
      });
    }

    // Find the heaviest day of the week
    let maxDay = "";
    let maxHours = 0;
    Object.entries(weeklyWorkload).forEach(([day, hours]) => {
      if (hours > maxHours) {
        maxHours = hours;
        maxDay = day;
      }
    });

    if (maxHours > 6) {
      recommendations.push({
        type: "schedule",
        message: `${maxDay}s are usually your heaviest days (${Math.round(maxHours)} hrs of routines). Plan a lighter day beforehand.`,
        icon: "calendar"
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        message: "Great job! Your workload is balanced and your consistency is high. Keep up the good work!",
        icon: "check"
      });
    }

    // 6. Activity Heatmap Data (Last 30 days)
    const activityHeatmap = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDateString(d);
      
      const dayTasks = tasks.filter(t => formatDateString(t.dueDate) === dStr);
      const completedCount = dayTasks.filter(t => t.status === "Completed").length;
      
      let intensity = 0;
      if (completedCount > 5) intensity = 3;
      else if (completedCount > 2) intensity = 2;
      else if (completedCount > 0) intensity = 1;

      activityHeatmap.push({
        date: dStr,
        count: completedCount,
        intensity
      });
    }

    return res.status(200).json({
      success: true,
      intelligence: {
        burnoutScore,
        riskLevel,
        fatigueDetected,
        overduePercentage,
        dailyWorkloadHours,
        recommendations,
        weeklyWorkload: weeklyWorkloadArray,
        activityHeatmap
      }
    });
  } catch (error) {
    console.error("Error in getIntelligence controller", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching intelligence data",
    });
  }
};

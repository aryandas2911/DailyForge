import Task from "../src/models/Task.js";
import Routine from "../src/models/Routine.js";
import User from "../src/models/User.js";

const formatDate = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

// ── 1. AI Coach Summary ────────────────────────────────────────────────────
export const getAiCoachSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const allTasks = await Task.find({ userId });
    const weekTasks = allTasks.filter((t) => new Date(t.createdAt) >= weekAgo);
    const completed = weekTasks.filter((t) => t.status === "Completed");
    const due = weekTasks.filter((t) => t.status === "Due");
    const completionRate =
      weekTasks.length > 0
        ? Math.round((completed.length / weekTasks.length) * 100)
        : 0;

    const catMap = {};
    weekTasks.forEach((t) => {
      const cat = t.tags?.[0] || "Uncategorized";
      if (!catMap[cat]) catMap[cat] = { total: 0, done: 0 };
      catMap[cat].total++;
      if (t.status === "Completed") catMap[cat].done++;
    });

    const completedDates = allTasks
      .filter((t) => t.status === "Completed")
      .map((t) => formatDate(t.updatedAt || t.createdAt));
    const uniqueDates = [...new Set(completedDates)].sort(
      (a, b) => new Date(b) - new Date(a)
    );
    let streak = 0;
    const check = new Date(formatDate(now));
    for (const d of uniqueDates) {
      if (d === formatDate(check)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else break;
    }

    const overdue = allTasks.filter(
      (t) =>
        t.status === "Due" &&
        new Date(t.dueDate) < now &&
        t.priority === "High"
    );

    const suggestions = [];
    if (completionRate < 50)
      suggestions.push(
        "Your completion rate is below 50% this week. Try breaking tasks into smaller steps."
      );
    if (streak === 0)
      suggestions.push(
        "No streak active — complete at least one task today to start building momentum."
      );
    if (streak > 5)
      suggestions.push(
        `Great ${streak}-day streak! Keep going — consistency is building a habit.`
      );
    if (overdue.length > 0)
      suggestions.push(
        `You have ${overdue.length} overdue high-priority task(s). Consider rescheduling them today.`
      );
    if (due.length > completed.length * 2)
      suggestions.push(
        "You have significantly more pending tasks than completed ones. Consider setting a daily task limit."
      );

    const weakestCat = Object.entries(catMap).sort(
      (a, b) => a[1].done / a[1].total - b[1].done / b[1].total
    )[0];
    if (weakestCat && weekTasks.length > 3)
      suggestions.push(
        `"${weakestCat[0]}" category has the lowest completion rate. Try scheduling these tasks earlier in the day.`
      );

    if (suggestions.length === 0)
      suggestions.push(
        "You're doing great this week! Keep your momentum going."
      );

    return res.json({
      success: true,
      summary: {
        weekTasks: weekTasks.length,
        completed: completed.length,
        due: due.length,
        completionRate,
        streak,
        overdueHighPriority: overdue.length,
        categoryBreakdown: catMap,
        suggestions,
        generatedAt: now.toISOString(),
      },
    });
  } catch (err) {
    console.error("AI Coach error:", err);
    res.status(500).json({ success: false, message: "Failed to generate AI summary" });
  }
};

// ── 2. Natural Language → Routine ──────────────────────────────────────────
export const generateRoutineFromNL = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || !goal.trim())
      return res.status(400).json({ success: false, message: "Goal description is required" });

    const goalLower = goal.toLowerCase();
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const isWeekend = goalLower.includes("weekend");
    const isWeekday = goalLower.includes("weekday") || goalLower.includes("work day");
    const activeDays = isWeekend ? ["Saturday", "Sunday"] : isWeekday ? days.slice(0, 5) : days;

    const isHealth = /health|fit|workout|exercise|gym|run|yoga|walk/.test(goalLower);
    const isStudy = /study|learn|course|read|book|code|skill/.test(goalLower);
    const isMindfulness = /mindful|meditat|breath|calm|sleep|rest/.test(goalLower);

    let tasks = [];
    if (isHealth) {
      tasks = [
        { title: "Morning workout", duration: 45, startTime: 7 * 60, priority: "High", tags: ["Health"] },
        { title: "Healthy meal prep", duration: 30, startTime: 18 * 60, priority: "Medium", tags: ["Health"] },
        { title: "Evening walk", duration: 30, startTime: 19 * 60, priority: "Low", tags: ["Health"] },
      ];
    } else if (isStudy) {
      tasks = [
        { title: "Study session", duration: 60, startTime: 9 * 60, priority: "High", tags: ["Learning"] },
        { title: "Review & practice", duration: 30, startTime: 14 * 60, priority: "Medium", tags: ["Learning"] },
        { title: "Read / research", duration: 30, startTime: 20 * 60, priority: "Low", tags: ["Learning"] },
      ];
    } else if (isMindfulness) {
      tasks = [
        { title: "Morning meditation", duration: 15, startTime: 6 * 60 + 30, priority: "High", tags: ["Mindfulness"] },
        { title: "Journaling", duration: 15, startTime: 21 * 60, priority: "Medium", tags: ["Mindfulness"] },
        { title: "Deep breathing exercise", duration: 10, startTime: 12 * 60, priority: "Low", tags: ["Mindfulness"] },
      ];
    } else {
      tasks = [
        { title: "Morning planning", duration: 20, startTime: 8 * 60, priority: "High", tags: ["Productivity"] },
        { title: "Deep work block", duration: 90, startTime: 9 * 60, priority: "High", tags: ["Productivity"] },
        { title: "Review & wrap-up", duration: 20, startTime: 17 * 60, priority: "Medium", tags: ["Productivity"] },
      ];
    }

    const scheduledItems = [];
    activeDays.forEach((day) => {
      tasks.forEach((task) => scheduledItems.push({ ...task, day }));
    });

    return res.json({
      success: true,
      routine: {
        name: `${goal.slice(0, 40)} Routine`,
        description: `AI-generated routine for: ${goal}`,
        items: scheduledItems,
        activeDays,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("NL Routine error:", err);
    res.status(500).json({ success: false, message: "Failed to generate routine" });
  }
};

// ── 3. Overload / Burnout Detection ───────────────────────────────────────
export const getOverloadWarning = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekTasks = await Task.find({
      userId,
      dueDate: { $gte: startOfWeek, $lte: endOfWeek },
    });
    const highPriority = weekTasks.filter((t) => t.priority === "High").length;
    const total = weekTasks.length;

    const OVERLOAD_THRESHOLD = 20;
    const HIGH_PRIORITY_THRESHOLD = 8;
    const BURNOUT_THRESHOLD = 30;

    let level = "ok";
    let message = "Your weekly workload looks manageable.";
    let suggestion = null;

    if (total >= BURNOUT_THRESHOLD || highPriority >= HIGH_PRIORITY_THRESHOLD * 1.5) {
      level = "burnout";
      message = `You have ${total} tasks this week (${highPriority} high-priority). This load is unsustainable.`;
      suggestion = "Consider moving non-critical tasks to next week and block recovery time.";
    } else if (total >= OVERLOAD_THRESHOLD || highPriority >= HIGH_PRIORITY_THRESHOLD) {
      level = "overload";
      message = `You have ${total} tasks this week (${highPriority} high-priority). This exceeds the recommended load.`;
      suggestion = "Try to defer or delegate at least 3–5 tasks to stay sustainable.";
    }

    return res.json({
      success: true,
      overload: { level, message, suggestion, totalTasks: total, highPriorityTasks: highPriority },
    });
  } catch (err) {
    console.error("Overload check error:", err);
    res.status(500).json({ success: false, message: "Failed to check overload status" });
  }
};

// ── 4. Smart Scheduling Suggestions ───────────────────────────────────────
export const getSchedulingSuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    const allTasks = await Task.find({ userId, status: "Completed" })
      .sort({ completedAt: -1 })
      .limit(100);

    const hourCounts = Array(24).fill(0);
    allTasks.forEach((t) => {
      if (t.completedAt) {
        const h = new Date(t.completedAt).getHours();
        hourCounts[h]++;
      }
    });

    const ranked = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const format12h = (h) => {
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:00 ${ampm}`;
    };

    const suggestions =
      ranked.length > 0
        ? ranked.map((r) => ({
            timeSlot: format12h(r.hour),
            label: r.hour < 12 ? "Morning peak" : r.hour < 17 ? "Afternoon peak" : "Evening peak",
            completions: r.count,
          }))
        : [
            { timeSlot: "9:00 AM", label: "Typical morning peak", completions: 0 },
            { timeSlot: "2:00 PM", label: "Post-lunch focus", completions: 0 },
          ];

    return res.json({ success: true, suggestions, basedOnTasks: allTasks.length });
  } catch (err) {
    console.error("Scheduling suggestions error:", err);
    res.status(500).json({ success: false, message: "Failed to get scheduling suggestions" });
  }
};

// ── 5. Adaptive Nudge ─────────────────────────────────────────────────────
export const getAdaptiveNudge = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const hour = now.getHours();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todayTasks = await Task.find({
      userId,
      dueDate: { $gte: todayStart, $lte: todayEnd },
    });
    const completedToday = todayTasks.filter((t) => t.status === "Completed").length;
    const totalToday = todayTasks.length;
    const remaining = totalToday - completedToday;

    let nudge = "";
    if (hour < 10) {
      nudge =
        remaining > 0
          ? `Good morning! You have ${remaining} task(s) due today. Start with your highest-priority one to build momentum.`
          : "Good morning! No tasks due today — a great chance to get ahead on tomorrow's work.";
    } else if (hour < 14) {
      nudge =
        completedToday > 0
          ? `You've completed ${completedToday} task(s) so far — great work! Keep the momentum going.`
          : "It's mid-morning and no tasks done yet. Pick one small task to get started now.";
    } else if (hour < 18) {
      nudge =
        remaining > 0
          ? `Afternoon check-in: ${remaining} task(s) still pending. Can you finish one before 5 PM?`
          : "All tasks done for today — nice! Consider reviewing tomorrow's plan.";
    } else {
      nudge =
        completedToday === totalToday && totalToday > 0
          ? `Great job finishing all ${totalToday} task(s) today! Rest up for tomorrow.`
          : `Evening wrap-up: ${completedToday}/${totalToday} tasks done. Log anything incomplete for tomorrow.`;
    }

    return res.json({ success: true, nudge, completedToday, totalToday, hour });
  } catch (err) {
    console.error("Nudge error:", err);
    res.status(500).json({ success: false, message: "Failed to get nudge" });
  }
};
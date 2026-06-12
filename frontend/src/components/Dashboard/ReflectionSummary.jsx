export default function ReflectionSummary({
  completedToday,
  totalToday,
  weeklyCompletionPercent,
  tasks = [],
  upcomingTasks = [],
}) {
  const completionRate = totalToday ? Math.round((completedToday / totalToday) * 100) : 0;
  const upcomingCount = upcomingTasks?.length || 0;

  const insightText = (() => {
    if (totalToday === 0) return "No tasks scheduled for today — set a small goal to get started.";
    if (completionRate >= 75) return "You're on fire — great focus today!";
    if (completionRate >= 40) return "Solid progress — keep the momentum going.";
    return "Small wins build habits — try completing one focused task.";
  })();

  const weeklyText = weeklyCompletionPercent >= 70 ? "Strong consistency this week 🔥" : "Keep building momentum";

  return (
    <div className="w-full animate-in delay-150">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Daily Completion</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{completedToday} / {totalToday}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Tasks done today{totalToday > 0 ? ` — ${completionRate}%` : ""}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Weekly Momentum</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{weeklyCompletionPercent}%</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{weeklyText}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Productivity Insight</p>
          <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold mt-1.5 leading-relaxed">{insightText}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
            {upcomingCount > 0 ? `Next: ${upcomingCount} upcoming task${upcomingCount > 1 ? "s" : ""}` : "No upcoming tasks"}
            {" · "}
            {tasks?.length ? `${tasks.length} total` : "0 total"}
          </p>
        </div>
      </section>
    </div>
  );
}
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
        {/* Daily Completion */}
        <div className="card p-6">
          <p className="text-xs text-muted uppercase tracking-wide">Daily Completion</p>
          <p className="text-2xl font-semibold text-main mt-1">{completedToday} / {totalToday}</p>
          <p className="text-xs text-muted mt-1">Tasks done today{totalToday > 0 ? ` — ${completionRate}%` : ""}</p>
        </div>

        {/* Weekly Momentum */}
        <div className="card p-6">
          <p className="text-xs text-muted uppercase tracking-wide">Weekly Momentum</p>
          <p className="text-2xl font-semibold text-main mt-1">{weeklyCompletionPercent}%</p>
          <p className="text-xs text-muted mt-1">{weeklyText}</p>
        </div>

        {/* Productivity Insight */}
        <div className="card p-6">
          <p className="text-xs text-muted uppercase tracking-wide">Productivity Insight</p>
          <p className="text-sm text-main font-medium mt-1">{insightText}</p>
          <p className="text-xs text-muted mt-2">
            {upcomingCount > 0 ? `Next: ${upcomingCount} upcoming task${upcomingCount > 1 ? "s" : ""}` : "No upcoming tasks"}
            {" · "}
            {tasks?.length ? `${tasks.length} total` : "0 total"}
          </p>
        </div>
      </section>
    </div>
  );
}

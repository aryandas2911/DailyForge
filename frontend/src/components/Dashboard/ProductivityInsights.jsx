import { useMemo } from "react";
import { Clock, BarChart2, Zap, Lightbulb } from "lucide-react";
import { getCategoryColor } from "../../utils/categoryUtils";
import {
  getAnalyzableTasks,
  calcTotalFocusTime,
  calcCategoryBreakdown,
  calcPriorityDensity,
  generateInsightText,
  formatFocusTime,
} from "../../utils/analyticsUtils";

/** Color map for priority pill cards */
const PRIORITY_COLORS = {
  High: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
  Medium: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  Low: {
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
};

/**
 * ProductivityInsights
 *
 * Displays a "Productivity Insights & Time Audit" section on the Dashboard.
 * Accepts the full tasks array from useTasks() and derives all analytics
 * from completed tasks that have a valid actualDuration.
 *
 * @param {{ tasks: Array<Object> }} props
 */
export default function ProductivityInsights({ tasks }) {
  // Derive all analytics data once per render cycle
  const analyzableTasks = useMemo(() => getAnalyzableTasks(tasks), [tasks]);
  const totalMinutes = useMemo(
    () => calcTotalFocusTime(analyzableTasks),
    [analyzableTasks]
  );
  const categoryBreakdown = useMemo(
    () => calcCategoryBreakdown(analyzableTasks, totalMinutes),
    [analyzableTasks, totalMinutes]
  );
  const priorityDensity = useMemo(
    () => calcPriorityDensity(analyzableTasks),
    [analyzableTasks]
  );
  const insightText = useMemo(
    () => generateInsightText(analyzableTasks),
    [analyzableTasks]
  );

  // Empty state — no completed tasks with tracked durations yet
  if (analyzableTasks.length === 0) {
    return (
      <section className="card animate-in delay-300" aria-label="Productivity Insights">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-main">
            Productivity Insights
          </h2>
        </div>
        <p className="text-sm text-muted">
          Complete tasks and log your actual durations to unlock your personal
          productivity analytics.
        </p>
      </section>
    );
  }

  return (
    <section
      className="animate-in delay-300 space-y-6"
      aria-label="Productivity Insights"
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <BarChart2 size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-main">
          Productivity Insights
        </h2>
        <span className="ml-auto text-xs text-muted">
          Based on {analyzableTasks.length} completed task
          {analyzableTasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: Total Focus Time + Insight callout ── */}
        <div className="flex flex-col gap-6">
          {/* Total Focus Time */}
          <div className="card flex items-start gap-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">
                Total Focus Time
              </p>
              <p className="text-3xl font-bold text-main leading-tight">
                {formatFocusTime(totalMinutes)}
              </p>
              <p className="text-xs text-muted mt-1">
                across all completed tasks
              </p>
            </div>
          </div>

          {/* Insight callout */}
          {insightText && (
            <div className="card flex items-start gap-3 bg-primary/5 border-l-4 border-primary">
              <Lightbulb size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-main leading-relaxed">{insightText}</p>
            </div>
          )}
        </div>

        {/* ── Middle column: Category Time Allocation ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-main uppercase tracking-wide">
              Category Breakdown
            </h3>
          </div>

          <ul className="space-y-3" aria-label="Time by category">
            {categoryBreakdown.map(({ name, minutes, percent }) => {
              const cat = getCategoryColor(name);
              return (
                <li key={name}>
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: cat.bgColor,
                        color: cat.color,
                      }}
                    >
                      {name}
                    </span>
                    <span className="text-xs text-muted">
                      {formatFocusTime(minutes)}
                      {percent > 0 && (
                        <span className="ml-1 opacity-60">({percent}%)</span>
                      )}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div
                    className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${name}: ${percent}%`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Right column: Productivity Density by Priority ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-main uppercase tracking-wide">
              Avg Time by Priority
            </h3>
          </div>

          <ul className="space-y-3" aria-label="Average duration by priority">
            {priorityDensity.map(({ priority, avgMinutes, count }) => {
              const colors = PRIORITY_COLORS[priority];
              return (
                <li
                  key={priority}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${colors.bg}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`}
                    />
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {priority}
                    </span>
                  </div>
                  <div className="text-right">
                    {count > 0 ? (
                      <>
                        <p className={`text-sm font-semibold ${colors.text}`}>
                          {formatFocusTime(avgMinutes)}
                        </p>
                        <p className="text-[10px] text-muted">
                          avg · {count} task{count !== 1 ? "s" : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted italic">No data</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * @module analyticsUtils
 * @description Pure utility functions for computing productivity analytics
 * from completed task data in DailyForge. All functions are safe for use
 * in React useMemo hooks and handle edge cases defensively.
 */

/** The four task categories tracked in the application. */
export const TRACKED_CATEGORIES = ["Homework", "Routine", "Creative", "Other"];

/** Priority levels in display order. */
export const PRIORITY_LEVELS = ["High", "Medium", "Low"];

/**
 * Formats a raw minute value into a human-readable duration string.
 *
 * @param {number} totalMinutes - Total minutes (must be >= 0).
 * @returns {string} Formatted string, e.g. "5h 25m", "45m", or "0m".
 *
 * @example
 * formatFocusTime(325); // "5h 25m"
 * formatFocusTime(45);  // "45m"
 * formatFocusTime(0);   // "0m"
 */
export function formatFocusTime(totalMinutes) {
  const mins = Math.max(0, Math.round(totalMinutes));
  if (mins === 0) return "0m";
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (hours === 0) return `${remaining}m`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

/**
 * Extracts completed tasks that have a valid, positive actualDuration.
 * All other analytics functions should operate on this filtered set.
 *
 * @param {Array<Object>} tasks - Full task array from useTasks().
 * @returns {Array<Object>} Only completed tasks with actualDuration > 0.
 */
export function getAnalyzableTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.filter(
    (t) =>
      t.status === "Completed" &&
      typeof t.actualDuration === "number" &&
      t.actualDuration > 0
  );
}

/**
 * Calculates the total focus time across all analyzable completed tasks.
 *
 * @param {Array<Object>} analyzableTasks - Output of getAnalyzableTasks().
 * @returns {number} Total minutes spent across all completed tasks.
 */
export function calcTotalFocusTime(analyzableTasks) {
  return analyzableTasks.reduce((sum, t) => sum + t.actualDuration, 0);
}

/**
 * Breaks down total time spent per category (tag).
 * Tasks with no tags are bucketed under "Other".
 * Tasks with multiple tags contribute their full duration to each matching tag.
 *
 * @param {Array<Object>} analyzableTasks - Output of getAnalyzableTasks().
 * @param {number} totalMinutes - Output of calcTotalFocusTime().
 * @returns {Array<{name: string, minutes: number, percent: number}>}
 *   One entry per tracked category, sorted by minutes descending.
 */
export function calcCategoryBreakdown(analyzableTasks, totalMinutes) {
  const minutesByCategory = Object.fromEntries(
    TRACKED_CATEGORIES.map((cat) => [cat, 0])
  );

  for (const task of analyzableTasks) {
    const tags = Array.isArray(task.tags) && task.tags.length > 0
      ? task.tags
      : ["Other"];

    const matchedTracked = tags.filter((tag) =>
      TRACKED_CATEGORIES.includes(tag)
    );
    const effectiveTags =
      matchedTracked.length > 0 ? matchedTracked : ["Other"];

    for (const tag of effectiveTags) {
      minutesByCategory[tag] += task.actualDuration;
    }
  }

  return TRACKED_CATEGORIES.map((name) => {
    const minutes = minutesByCategory[name];
    const percent =
      totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0;
    return { name, minutes, percent };
  }).sort((a, b) => b.minutes - a.minutes);
}

/**
 * Calculates average actual duration grouped by task priority.
 *
 * @param {Array<Object>} analyzableTasks - Output of getAnalyzableTasks().
 * @returns {Array<{priority: string, avgMinutes: number, count: number}>}
 *   One entry per priority level. avgMinutes is 0 when count is 0.
 */
export function calcPriorityDensity(analyzableTasks) {
  const data = Object.fromEntries(
    PRIORITY_LEVELS.map((p) => [p, { total: 0, count: 0 }])
  );

  for (const task of analyzableTasks) {
    const priority = PRIORITY_LEVELS.includes(task.priority)
      ? task.priority
      : null;
    if (!priority) continue;
    data[priority].total += task.actualDuration;
    data[priority].count += 1;
  }

  return PRIORITY_LEVELS.map((priority) => {
    const { total, count } = data[priority];
    return {
      priority,
      avgMinutes: count > 0 ? Math.round(total / count) : 0,
      count,
    };
  });
}

/**
 * Generates a single, human-readable productivity insight sentence.
 * Compares which category has the fastest average completion time.
 *
 * @param {Array<Object>} analyzableTasks - Output of getAnalyzableTasks().
 * @returns {string|null} An insight sentence, or null if insufficient data.
 *
 * @example
 * // "You typically finish Creative tasks faster than others — great focus!"
 */
export function generateInsightText(analyzableTasks) {
  if (analyzableTasks.length < 3) return null;

  // Average duration per category
  const catData = {};
  for (const task of analyzableTasks) {
    const tags = Array.isArray(task.tags) && task.tags.length > 0
      ? task.tags.filter((t) => TRACKED_CATEGORIES.includes(t))
      : [];
    const effectiveTags = tags.length > 0 ? tags : ["Other"];

    for (const tag of effectiveTags) {
      if (!catData[tag]) catData[tag] = { total: 0, count: 0 };
      catData[tag].total += task.actualDuration;
      catData[tag].count += 1;
    }
  }

  // Need at least 2 categories with data to make a comparison
  const entries = Object.entries(catData)
    .filter(([, v]) => v.count >= 1)
    .map(([name, v]) => ({ name, avg: Math.round(v.total / v.count) }));

  if (entries.length < 2) return null;

  entries.sort((a, b) => a.avg - b.avg);
  const fastest = entries[0];
  const slowest = entries[entries.length - 1];

  if (fastest.avg === slowest.avg) return null;

  const percentFaster = Math.round(
    ((slowest.avg - fastest.avg) / slowest.avg) * 100
  );

  return `You typically complete ${fastest.name} tasks ~${percentFaster}% faster than ${slowest.name} tasks — great efficiency!`;
}

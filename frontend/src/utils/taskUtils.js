/**
 * @module taskUtils
 * @description Utility functions for filtering, sorting, and computing
 * statistics on task collections in the DailyForge application.
 */

import { isSameDay } from "./dateUtils";

/**
 * Filters a list of tasks to include only those created on a specific day.
 *
 * @param {Array<Object>} tasks - The full array of task objects.
 * @param {Date} [targetDate=new Date()] - The target date to filter by (defaults to today).
 * @returns {Array<Object>} Tasks whose `createdAt` falls on the same calendar day as `targetDate`.
 *
 * @example
 * const todayTasks = filterTasksByDate(tasks);
 * const yesterdayTasks = filterTasksByDate(tasks, new Date("2026-05-13"));
 */
export function filterTasksByDate(tasks, targetDate = new Date()) {
  return tasks.filter((task) => {
    const created = new Date(task.createdAt);
    return isSameDay(targetDate, created);
  });
}

/**
 * Filters tasks to return only those that are not yet completed.
 *
 * @param {Array<Object>} tasks - The full array of task objects.
 * @returns {Array<Object>} Tasks whose `status` is not "Completed".
 *
 * @example
 * const pending = filterIncompleteTasks(tasks);
 */
export function filterIncompleteTasks(tasks) {
  return tasks.filter((task) => task.status !== "Completed");
}

/**
 * Filters tasks to return only completed tasks.
 *
 * @param {Array<Object>} tasks - The full array of task objects.
 * @returns {Array<Object>} Tasks whose `status` is "Completed".
 *
 * @example
 * const done = filterCompletedTasks(tasks);
 */
export function filterCompletedTasks(tasks) {
  return tasks.filter((task) => task.status === "Completed");
}

/**
 * Returns tasks that have a due date within a specified number of days
 * from now and are not yet completed.
 *
 * @param {Array<Object>} tasks - The full array of task objects.
 * @param {number} [withinDays=3] - Number of days from today to look ahead.
 * @returns {Array<Object>} Incomplete tasks with a due date between now
 *                          and `withinDays` days in the future (inclusive).
 *
 * @example
 * const urgent = getUpcomingDeadlines(tasks, 3);
 */
export function getUpcomingDeadlines(tasks, withinDays = 3) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + withinDays);

  return tasks.filter((task) => {
    if (!task.dueDate || task.status === "Completed") return false;
    const due = new Date(task.dueDate);
    return due >= now && due <= futureDate;
  });
}

/**
 * Counts the number of incomplete tasks that have a specific priority level.
 *
 * @param {Array<Object>} tasks - The full array of task objects.
 * @param {string} priority - The priority level to count (e.g., "High", "Medium", "Low").
 * @returns {number} The count of incomplete tasks matching the given priority.
 *
 * @example
 * const highCount = countTasksByPriority(tasks, "High"); // 4
 */
export function countTasksByPriority(tasks, priority) {
  return tasks.filter(
    (t) => t.priority === priority && t.status !== "Completed"
  ).length;
}

/**
 * Calculates the completion percentage of a list of tasks.
 *
 * @param {Array<Object>} tasks - The full array of task objects.
 * @returns {number} An integer between 0 and 100 representing the percentage
 *                   of tasks that are completed. Returns 0 when the list is empty.
 *
 * @example
 * getCompletionPercent([{ status: "Completed" }, { status: "Due" }]); // 50
 * getCompletionPercent([]);                                            // 0
 */
export function getCompletionPercent(tasks) {
  const total = tasks.length;
  if (!total) return 0;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  return Math.round((completed / total) * 100);
}

/**
 * Sorts an array of tasks by their `createdAt` date in ascending
 * (oldest-first) order.
 *
 * @param {Array<Object>} tasks - The array of task objects to sort.
 * @returns {Array<Object>} A new array sorted by `createdAt` ascending.
 *
 * @example
 * const sorted = sortTasksByCreatedDate(tasks);
 */
export function sortTasksByCreatedDate(tasks) {
  return [...tasks].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
}

/**
 * Sorts an array of tasks by priority in descending order
 * (High → Medium → Low).
 *
 * @param {Array<Object>} tasks - The array of task objects to sort.
 * @returns {Array<Object>} A new array sorted by priority, highest first.
 *
 * @example
 * const sorted = sortTasksByPriority(tasks); // High tasks come first
 */
export function sortTasksByPriority(tasks) {
  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  return [...tasks].sort(
    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
  );
}

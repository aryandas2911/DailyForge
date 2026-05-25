/**
 * @module validationUtils
 * @description Utility functions for validating user input in the
 * DailyForge application. These helpers ensure that task form data
 * and other user-submitted values meet the required criteria before
 * being sent to the API.
 */

/**
 * Validates the required fields of a task form submission.
 * Returns an error message string if validation fails, or `null`
 * if all fields are valid.
 *
 * @param {Object} taskData - The task data to validate.
 * @param {string} taskData.title - The title of the task.
 * @param {string} taskData.priority - The priority level ("Low", "Medium", or "High").
 * @param {string} taskData.dueDate - The due date in "YYYY-MM-DD" format.
 * @returns {string | null} An error message if validation fails, or `null` if valid.
 *
 * @example
 * validateTaskForm({ title: "", priority: "Low", dueDate: "2026-05-14" });
 * // "Title is required"
 *
 * validateTaskForm({ title: "Study", priority: "High", dueDate: "2026-05-14" });
 * // null
 */
export function validateTaskForm({ title, priority, dueDate }) {
  if (!title || !title.trim()) return "Title is required";
  if (!priority) return "Priority is required";
  if (!dueDate) return "Due date is required";
  return null;
}

/**
 * Checks whether a given string is a properly formatted email address.
 * Uses a basic regular expression — suitable for client-side pre-validation.
 *
 * @param {string} email - The email string to validate.
 * @returns {boolean} `true` if the string matches a standard email pattern; otherwise `false`.
 *
 * @example
 * isValidEmail("user@example.com");  // true
 * isValidEmail("invalid-email");     // false
 * isValidEmail("");                  // false
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that a routine name is non-empty after trimming whitespace.
 *
 * @param {string} name - The routine name to validate.
 * @returns {boolean} `true` if the trimmed name has at least one character; otherwise `false`.
 *
 * @example
 * isValidRoutineName("Monday Routine"); // true
 * isValidRoutineName("  ");             // false
 * isValidRoutineName("");               // false
 */
export function isValidRoutineName(name) {
  return Boolean(name && name.trim());
}

/**
 * Checks if a new task overlaps with any existing scheduled tasks.
 *
 * @param {Object} newTask - The task attempting to be scheduled.
 * @param {string} newTask.day - The scheduled day.
 * @param {number} newTask.startTime - Start time in minutes since midnight.
 * @param {number} newTask.duration - Duration of the task in minutes.
 * @param {string} [newTask.taskId] - The ID of the task (to exclude self-checks when moving).
 * @param {Array<Object>} scheduledTasks - The current list of scheduled tasks.
 * @returns {Object|null} The conflicting task object if an overlap is found, or null if safe.
 */
export function checkTaskOverlap(newTask, scheduledTasks) {
  const newDuration = newTask.duration || 60;
  const newStart = newTask.startTime;
  const newEnd = newStart + newDuration;

  const conflict = scheduledTasks.find((task) => {
    // Only compare tasks on the same day, excluding the task itself (if moving/rescheduling)
    if (task.day !== newTask.day || task.taskId === newTask.taskId) {
      return false;
    }

    const taskDuration = task.duration || 60;
    const taskStart = task.startTime;
    const taskEnd = taskStart + taskDuration;

    // Mathematical overlap condition: Start A < End B && Start B < End A
    return newStart < taskEnd && taskStart < newEnd;
  });

  return conflict || null;
}


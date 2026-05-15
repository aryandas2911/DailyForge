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

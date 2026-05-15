/**
 * @module constants
 * @description Shared constants used across DailyForge frontend components.
 */

/**
 * Ordered days of the week starting Monday.
 * @type {Array<string>}
 */
export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

/**
 * Task priority levels in ascending urgency.
 * @type {Array<string>}
 */
export const PRIORITIES = ["Low", "Medium", "High"];

/**
 * Numeric weight per priority for sorting (higher = more urgent).
 * @type {Object<string, number>}
 */
export const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };

/**
 * Tailwind border-color classes per priority level.
 * @type {Object<string, string>}
 */
export const PRIORITY_BORDER_STYLES = {
  Low: "border-green-400",
  Medium: "border-yellow-400",
  High: "border-red-500",
};

/**
 * Tailwind badge classes (bg + text) per priority level.
 * @type {Object<string, string>}
 */
export const PRIORITY_BADGE_STYLES = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
};

/**
 * Tailwind card styles (border + bg) per priority level.
 * @type {Object<string, string>}
 */
export const PRIORITY_CARD_STYLES = {
  Low: "border-green-500 bg-green-50",
  Medium: "border-yellow-500 bg-yellow-50",
  High: "border-red-500 bg-red-50",
};

/**
 * Hex color codes per priority level for dot indicators.
 * @type {Object<string, string>}
 */
export const PRIORITY_COLORS = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#10b981",
};

/**
 * Task status enum values.
 * @type {Object<string, string>}
 */
export const TASK_STATUS = {
  DUE: "Due",
  COMPLETED: "Completed",
};

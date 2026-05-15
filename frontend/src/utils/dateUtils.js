/**
 * @module dateUtils
 * @description Utility functions for date operations used across the DailyForge application.
 * Provides helpers for comparing, formatting, and computing date ranges.
 */

/**
 * Checks whether two Date objects fall on the same calendar day
 * (same year, month, and date).
 *
 * @param {Date} date1 - The first date to compare.
 * @param {Date} date2 - The second date to compare.
 * @returns {boolean} `true` if both dates share the same year, month, and day; otherwise `false`.
 *
 * @example
 * isSameDay(new Date("2026-05-14"), new Date("2026-05-14")); // true
 * isSameDay(new Date("2026-05-14"), new Date("2026-05-15")); // false
 */
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Formats a Date object into a human-readable string
 * such as "Wednesday · 14 May".
 *
 * @param {Date} date - The date to format.
 * @returns {string} A formatted date string with weekday, day, and abbreviated month.
 *
 * @example
 * formatDashboardDate(new Date("2026-05-14"));
 * // "Wednesday · 14 May"
 */
export function formatDashboardDate(date) {
  return date
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    })
    .replace(",", " ·");
}

/**
 * Formats an ISO date string (or Date object) into a short
 * weekday abbreviation (e.g., "Mon", "Tue").
 *
 * @param {string | Date} dateInput - An ISO date string or Date object.
 * @returns {string} The short weekday name for the given date.
 *
 * @example
 * formatShortWeekday("2026-05-14T00:00:00Z"); // "Wed"
 */
export function formatShortWeekday(dateInput) {
  return new Date(dateInput).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

/**
 * Returns a new Date object set to `daysFromNow` days in the future
 * relative to the current date and time.
 *
 * @param {number} daysFromNow - Number of days to add to the current date.
 * @returns {Date} A Date object representing the future date.
 *
 * @example
 * const threeDaysLater = getFutureDate(3);
 */
export function getFutureDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

/**
 * Formats an ISO date string (or Date object) into a locale-aware
 * date string using the browser's default locale settings.
 *
 * @param {string | Date} dateInput - An ISO date string or Date object.
 * @returns {string} A locale-formatted date string (e.g., "5/14/2026" for en-US).
 *
 * @example
 * formatLocalDate("2026-05-14T00:00:00Z"); // "5/14/2026" (en-US)
 */
export function formatLocalDate(dateInput) {
  return new Date(dateInput).toLocaleDateString();
}

/**
 * Extracts the date portion (YYYY-MM-DD) from an ISO 8601 date-time string.
 * Useful for populating HTML date inputs from API responses.
 *
 * @param {string} isoString - An ISO 8601 date-time string (e.g., "2026-05-14T10:30:00.000Z").
 * @returns {string} The date portion of the string (e.g., "2026-05-14"),
 *                   or an empty string if the input is falsy.
 *
 * @example
 * extractDateFromISO("2026-05-14T10:30:00.000Z"); // "2026-05-14"
 * extractDateFromISO("");                          // ""
 */
export function extractDateFromISO(isoString) {
  if (!isoString) return "";
  return isoString.split("T")[0];
}

/**
 * @module timeUtils
 * @description Utility functions for time-related operations used primarily
 * in the Routine Builder feature of DailyForge. Handles conversion between
 * time strings and minute values, as well as time-slot generation.
 */

/**
 * Converts a time string in "HH:mm" format to the total number of
 * minutes since midnight.
 *
 * @param {string} time - A time string in "HH:mm" format (e.g., "09:30").
 * @returns {number} The total minutes since midnight (e.g., 570 for "09:30").
 *
 * @example
 * timeToMinutes("09:30"); // 570
 * timeToMinutes("00:00"); // 0
 * timeToMinutes("23:59"); // 1439
 */
export function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Converts a total-minutes value back to a "HH:mm" formatted string.
 * Hours and minutes are zero-padded to two digits.
 *
 * @param {number} totalMinutes - Total minutes since midnight (0–1439).
 * @returns {string} A time string in "HH:mm" format.
 *
 * @example
 * minutesToTime(570);  // "09:30"
 * minutesToTime(0);    // "00:00"
 * minutesToTime(1439); // "23:59"
 */
export function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Generates an array of hourly time-slot strings from a start hour
 * to an end hour (inclusive).
 *
 * @param {number} [startHour=6] - The first hour to include (0–23).
 * @param {number} [endHour=22] - The last hour to include (0–23).
 * @returns {Array<string>} An array of "HH:00" time-slot strings.
 *
 * @example
 * generateTimeSlots();       // ["06:00", "07:00", ..., "22:00"]
 * generateTimeSlots(9, 17);  // ["09:00", "10:00", ..., "17:00"]
 */
export function generateTimeSlots(startHour = 6, endHour = 22) {
  const slots = [];
  let hour = startHour;
  while (hour <= endHour) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    hour++;
  }
  return slots;
}

/**
 * Formats a start-time value (in minutes since midnight) into a
 * human-readable "HH:mm" display string. Useful for rendering
 * routine schedule entries.
 *
 * @param {number} startTimeMinutes - The start time expressed as minutes since midnight.
 * @returns {string} The formatted time string in "HH:mm" format.
 *
 * @example
 * formatStartTime(540); // "09:00"
 * formatStartTime(810); // "13:30"
 */
export function formatStartTime(startTimeMinutes) {
  return minutesToTime(startTimeMinutes);
}

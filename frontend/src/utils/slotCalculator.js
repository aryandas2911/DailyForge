/**
 * Calculate how many time slots a task should span
 * @param {number} startTime - Start time in minutes (0-1440)
 * @param {number} endTime - End time in minutes (0-1440)
 * @param {number} interval - Time slot interval in minutes
 * @returns {number} Number of slots to span
 */
export const calculateSlotSpan = (startTime, endTime, interval) => {
  const durationMins = endTime - startTime;
  return Math.ceil(durationMins / interval);
};

/**
 * Convert HH:mm string to minutes since midnight
 * @param {string} time - Time in HH:mm format
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Convert minutes since midnight to HH:mm format
 * @param {number} mins - Minutes since midnight
 * @returns {string} Time in HH:mm format
 */
export const minutesToTime = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

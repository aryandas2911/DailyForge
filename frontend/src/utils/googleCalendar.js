/**
 * Utility functions for Google Calendar integration.
 */

/**
 * Calculates the date of the next occurrence of a given day of the week.
 * If the day is today, it will return today's date if the time hasn't passed, 
 * or next week's date if it has. For simplicity, we default to the next occurrence in the future.
 * 
 * @param {string} dayName - The name of the day (e.g., "Monday")
 * @returns {Date} The calculated Date object
 */
export function getNextOccurrenceOfDay(dayName) {
  const daysMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  
  const targetDay = daysMap[dayName.toLowerCase()];
  if (targetDay === undefined) return new Date();

  const today = new Date();
  const currentDay = today.getDay();
  
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7; // Schedule for next week's occurrence
  }
  
  const resultDate = new Date(today);
  resultDate.setDate(today.getDate() + daysUntilTarget);
  return resultDate;
}

/**
 * Syncs a routine's tasks to the user's Google Calendar.
 * 
 * @param {Object} routine - The routine object containing items
 * @param {Array} tasks - Full list of tasks to fetch titles/descriptions
 * @param {string} accessToken - Google OAuth Access Token
 * @returns {Promise<{syncedEvents: Array, errors: Array}>} Results of the sync process
 */
export async function syncRoutineToGoogleCalendar(routine, tasks, accessToken) {
  const syncedEvents = [];
  const errors = [];

  for (const item of routine.items) {
    const taskInfo = tasks.find((t) => t._id === item.taskId);
    if (!taskInfo) continue;

    const date = getNextOccurrenceOfDay(item.day);
    
    // startTime is in minutes from midnight. E.g. 540 = 9:00 AM
    const startHour = Math.floor(item.startTime / 60);
    const startMin = item.startTime % 60;
    
    const startDate = new Date(date);
    startDate.setHours(startHour, startMin, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + item.duration);

    const event = {
      summary: taskInfo.title,
      description: taskInfo.description || `Task from DailyForge routine: ${routine.name}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      },
      reminders: {
        useDefault: true
      }
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create event");
      }

      const data = await response.json();
      syncedEvents.push(data);
    } catch (err) {
      console.error(`Error syncing task "${taskInfo.title}":`, err);
      errors.push({ title: taskInfo.title, error: err.message });
    }
  }

  return { syncedEvents, errors };
}

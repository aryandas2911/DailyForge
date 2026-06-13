import Task from "../src/models/Task.js";

const DAY_NAMES = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
];

/**
 * Generates due task instances for today from all recurring parent tasks
 * belonging to the given userId. Idempotent — safe to call multiple times.
 *
 * @param {string} userId - MongoDB ObjectId of the logged-in user
 */
export async function generateRecurringTasks(userId) {
  const now = new Date();
  const todayName = DAY_NAMES[now.getDay()];
  const todayDate = now.getDate();

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  // Fetch all active recurring parent tasks for this user
  const recurringTasks = await Task.find({
    userId,
    "recurrence.enabled": true,
    $or: [
      { "recurrence.endDate": null },
      { "recurrence.endDate": { $gte: now } },
    ],
  });

  for (const task of recurringTasks) {
    const { frequency, days, monthDay } = task.recurrence;

    // Check if today matches the recurrence rule
    const shouldCreateToday =
      frequency === "daily" ||
      (frequency === "weekly" && days.includes(todayName)) ||
      (frequency === "monthly" && monthDay === todayDate);

    if (!shouldCreateToday) continue;

    // Idempotency — skip if an instance already exists for today
    const alreadyExists = await Task.findOne({
      userId,
      parentTaskId: task._id,
      isRecurringInstance: true,
      dueDate: { $gte: dayStart, $lte: dayEnd },
    });

    if (alreadyExists) continue;

    // Create today's instance from the parent template
    await Task.create({
      userId,
      title:       task.title,
      description: task.description,
      tags:        task.tags,
      priority:    task.priority,
      status:      "Due",
      dueDate:     new Date(),
      isRecurringInstance: true,
      parentTaskId: task._id,
      recurrence: { enabled: false }, // instances don't recurse
    });
  }
}
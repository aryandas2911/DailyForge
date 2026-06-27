import cron from "node-cron";
import User from "./models/User.js";
import Task from "./models/Task.js";
import { sendTelegramMessage } from "../controllers/telegramController.js";

// Runs every minute, checks for tasks due in exactly 1 hour
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Match tasks within a 1-minute window around the 1-hour mark
    const windowStart = new Date(oneHourLater.getTime() - 30 * 1000);
    const windowEnd = new Date(oneHourLater.getTime() + 30 * 1000);

    const tasks = await Task.find({
      status: { $in: ["Due", "In Progress"] },
      dueDate: { $gte: windowStart, $lte: windowEnd },
    });

    for (const task of tasks) {
      const user = await User.findOne({
        _id: task.userId,
        telegramChatId: { $exists: true, $ne: null },
      });

      if (!user) continue;

      const message = `⏰ *1 Hour Reminder!*\n\n"${task.title}" is due at ${task.dueDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}!\n\nPriority: ${task.priority} 🎯`;

      await sendTelegramMessage(user.telegramChatId, message);
    }
  } catch (err) {
    console.error("Cron job error:", err);
  }
});
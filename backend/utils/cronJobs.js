import cron from "node-cron";
import webpush from "web-push";
import User from "../src/models/User.js";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const initCronJobs = () => {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@dailyforge.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }

  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentDay = daysOfWeek[now.getDay()];
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      const targetTimeInMinutes = currentTimeInMinutes + 5;

      const users = await User.find({
        pushSubscription: { $ne: null },
        activeRoutineIds: { $exists: true, $not: { $size: 0 } },
      }).populate('activeRoutineIds');

      for (const user of users) {
        let upcomingCount = 0;
        for (const routine of user.activeRoutineIds) {
          const upcomingTasks = routine.items.filter(
            item => item.day === currentDay && item.startTime === targetTimeInMinutes
          );
          upcomingCount += upcomingTasks.length;
        }

        if (upcomingCount > 0) {
          const payload = JSON.stringify({
            title: "Upcoming Routine Task",
            body: `You have ${upcomingCount} task(s) scheduled in 5 minutes!`,
          });

          try {
            await webpush.sendNotification(user.pushSubscription, payload);
          } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              user.pushSubscription = null;
              await user.save();
            } else {
              console.error("Error sending push notification:", err);
            }
          }
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};

import User from "../src/models/User.js";
import { checkAndApplyStreakFreezes } from "./streakManager.js";

export const startStreakScheduler = () => {
  // Validate streaks for all users every 12 hours
  const INTERVAL_MS = 12 * 60 * 60 * 1000;
  
  const runValidation = async () => {
    try {
      console.log("[SCHEDULER] Running scheduled streak freeze validation for all users...");
      const users = await User.find({});
      for (const user of users) {
        await checkAndApplyStreakFreezes(user);
      }
      console.log(`[SCHEDULER] Scheduled streak freeze validation completed for ${users.length} users.`);
    } catch (error) {
      console.error("[SCHEDULER] Error in scheduled streak validation:", error);
    }
  };

  // Run validation on server startup after a small delay (e.g., 5 seconds) to not block initial startup
  setTimeout(runValidation, 5000);

  // Set up recurring interval
  setInterval(runValidation, INTERVAL_MS);
};

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import connectDB from "../config/db.js";
import Habit from "../src/models/Habit.js";

// Load environment variables
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

// Local helper to match streak logic for isolated unit test assertion
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateStreaks = (logs) => {
  if (!logs || logs.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const sortedLogs = [...new Set(logs)].sort((a, b) => new Date(a) - new Date(b));

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let currentStreak = 0;
  const lastLog = sortedLogs[sortedLogs.length - 1];

  if (lastLog === todayStr || lastLog === yesterdayStr) {
    let checkDate = new Date(lastLog);
    let tempDateStr = getLocalDateString(checkDate);
    
    while (sortedLogs.includes(tempDateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      tempDateStr = getLocalDateString(checkDate);
    }
  }

  let bestStreak = 0;
  let tempStreak = 0;
  let lastCheckedDate = null;

  for (const logStr of sortedLogs) {
    const currentDate = new Date(logStr);
    
    if (!lastCheckedDate) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate - lastCheckedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    
    bestStreak = Math.max(bestStreak, tempStreak);
    lastCheckedDate = currentDate;
  }

  return { currentStreak, bestStreak };
};

const runTests = async () => {
  console.log("=== STARTING HABIT TRACKING INTEGRATION TESTS ===");

  // 1. Test isolated streak calculation logic
  console.log("\n[TEST 1] Running isolated streak calculation tests...");
  
  const today = getLocalDateString(new Date());
  
  const d1 = new Date();
  d1.setDate(d1.getDate() - 1);
  const yesterday = getLocalDateString(d1);

  const d2 = new Date();
  d2.setDate(d2.getDate() - 2);
  const twoDaysAgo = getLocalDateString(d2);

  const d4 = new Date();
  d4.setDate(d4.getDate() - 4);
  const fourDaysAgo = getLocalDateString(d4);

  // Consecutive days: today, yesterday, 2 days ago
  const logs1 = [today, yesterday, twoDaysAgo];
  const streaks1 = calculateStreaks(logs1);
  console.log(`- Logs: ${JSON.stringify(logs1)}`);
  console.log(`  Streaks calculated: current = ${streaks1.currentStreak}, best = ${streaks1.bestStreak}`);
  if (streaks1.currentStreak !== 3 || streaks1.currentStreak !== streaks1.bestStreak) {
    throw new Error("Test 1a failed: Current streak should be 3 and match best streak");
  }

  // Broken streak: today, yesterday, 4 days ago
  const logs2 = [today, yesterday, fourDaysAgo];
  const streaks2 = calculateStreaks(logs2);
  console.log(`- Logs: ${JSON.stringify(logs2)}`);
  console.log(`  Streaks calculated: current = ${streaks2.currentStreak}, best = ${streaks2.bestStreak}`);
  if (streaks2.currentStreak !== 2 || streaks2.bestStreak !== 2) {
    throw new Error("Test 1b failed: Current streak should be 2, best streak should be 2");
  }

  // Old streak (no completion today or yesterday): 4 days ago
  const logs3 = [fourDaysAgo];
  const streaks3 = calculateStreaks(logs3);
  console.log(`- Logs: ${JSON.stringify(logs3)}`);
  console.log(`  Streaks calculated: current = ${streaks3.currentStreak}, best = ${streaks3.bestStreak}`);
  if (streaks3.currentStreak !== 0 || streaks3.bestStreak !== 1) {
    throw new Error("Test 1c failed: Current streak should be 0, best streak should be 1");
  }
  
  console.log("✓ Isolated streak calculation tests passed!");

  // 2. Test database integration
  console.log("\n[TEST 2] Connecting to MongoDB and testing Mongoose database integration...");
  
  await connectDB();
  
  // Create a mock user ID for testing
  const testUserId = new mongoose.Types.ObjectId();
  let createdHabitId = null;

  try {
    // 2a. Test insertion
    console.log("- Creating new Habit record...");
    const habit = new Habit({
      userId: testUserId,
      name: "Test Coding Habit",
      description: "Code for at least 30 minutes every day",
      logs: [],
    });
    const savedHabit = await habit.save();
    createdHabitId = savedHabit._id;
    console.log(`  ✓ Habit record created successfully. ID: ${createdHabitId}`);

    // 2b. Test toggling completion for yesterday
    console.log("- Toggling habit completion for yesterday...");
    const habitToToggle = await Habit.findById(createdHabitId);
    habitToToggle.logs.push(yesterday);
    
    const streaks = calculateStreaks(habitToToggle.logs);
    habitToToggle.currentStreak = streaks.currentStreak;
    habitToToggle.bestStreak = streaks.bestStreak;
    const updatedHabit1 = await habitToToggle.save();
    
    console.log(`  ✓ Logged completion for: ${yesterday}`);
    console.log(`  ✓ Streaks updated in DB: current = ${updatedHabit1.currentStreak}, best = ${updatedHabit1.bestStreak}`);
    if (updatedHabit1.currentStreak !== 1 || updatedHabit1.bestStreak !== 1) {
      throw new Error("Mongoose update failed to accurately calculate streak of 1");
    }

    // 2c. Test untoggling completion
    console.log("- Untoggling habit completion...");
    const habitToUntoggle = await Habit.findById(createdHabitId);
    const dateIndex = habitToUntoggle.logs.indexOf(yesterday);
    habitToUntoggle.logs.splice(dateIndex, 1);
    
    const cleanStreaks = calculateStreaks(habitToUntoggle.logs);
    habitToUntoggle.currentStreak = cleanStreaks.currentStreak;
    habitToUntoggle.bestStreak = cleanStreaks.bestStreak;
    const updatedHabit2 = await habitToUntoggle.save();

    console.log(`  ✓ Unlogged completion. logs count: ${updatedHabit2.logs.length}`);
    console.log(`  ✓ Streaks updated in DB: current = ${updatedHabit2.currentStreak}, best = ${updatedHabit2.bestStreak}`);
    if (updatedHabit2.currentStreak !== 0 || updatedHabit2.bestStreak !== 0) {
      throw new Error("Mongoose update failed to reset streak upon untoggle");
    }

    // 2d. Clean up habit
    console.log("- Cleaning up/deleting test Habit record...");
    await Habit.findByIdAndDelete(createdHabitId);
    console.log("  ✓ Test Habit record deleted successfully.");

  } catch (dbError) {
    // Attempt clean up
    if (createdHabitId) {
      await Habit.findByIdAndDelete(createdHabitId);
    }
    throw dbError;
  } finally {
    // Disconnect DB
    await mongoose.connection.close();
    console.log("\nDisconnected from MongoDB.");
  }

  console.log("\n=== ALL HABIT TRACKING INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
};

runTests().catch((err) => {
  console.error("\n❌ TEST FAILURE:", err.message);
  process.exit(1);
});

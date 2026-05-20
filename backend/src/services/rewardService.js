import taskModel from "../models/Task.js";
import User from "../models/User.js";

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const checkAndAwardRewards = async (userId) => {
  const today = normalizeDate(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const user = await User.findById(userId);
  console.log("USER FOUND:", user?.name);
console.log("LAST COMPLETED DATE:", user?.lastCompletedDate);

  if (!user) return null;

  // prevent duplicate reward
  if (
    user.lastRewardClaimDate &&
    normalizeDate(user.lastRewardClaimDate).getTime() === today.getTime()
  ) {
    return {
      rewardPoints: user.rewardPoints,
      currentStreak: user.currentStreak,
      rewardEarned: false,
    };
  }

  const todaysTasks = await taskModel.find({
    userId,
    dueDate: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  if (todaysTasks.length === 0) {
    return null;
  }

  const allCompleted = todaysTasks.every(
    (task) => task.status === "Completed"
  );

  console.log("TODAY TASK COUNT:", todaysTasks.length);
console.log("ALL COMPLETED:", allCompleted);

  if (!allCompleted) {
    return {
      rewardPoints: user.rewardPoints,
      currentStreak: user.currentStreak,
      rewardEarned: false,
    };
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (
    user.lastCompletedDate &&
    normalizeDate(user.lastCompletedDate).getTime() === yesterday.getTime()
  ) {
    user.currentStreak += 1;
  } else {
    user.currentStreak = 1;
  }

  user.rewardPoints += 10;

  if (user.currentStreak % 7 === 0) {
    user.rewardPoints += 100;
  }

  user.lastCompletedDate = today;
  user.lastRewardClaimDate = today;

  console.log("NEW STREAK:", user.currentStreak);
console.log("NEW POINTS:", user.rewardPoints);

  await user.save();

  return {
    rewardPoints: user.rewardPoints,
    currentStreak: user.currentStreak,
    rewardEarned: true,
  };
};
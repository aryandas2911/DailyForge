/**
 * Calculates updated user points and streak multipliers based on consistency metrics.
 */
function processTaskCompletion(currentPoints, completedOnTime, currentStreak) {
  const BASE_POINTS = 10;
  const ON_TIME_BONUS = 10;

  let pointsAwarded = BASE_POINTS;
  if (completedOnTime) {
    pointsAwarded += ON_TIME_BONUS;
  }

  // 1.2x multiplier unlocked past a 3-day streak threshold
  const multiplier = currentStreak >= 3 ? 1.2 : 1.0;
  pointsAwarded = Math.round(pointsAwarded * multiplier);

  return {
    pointsAwarded,
    newTotalPoints: currentPoints + pointsAwarded
  };
}

/**
 * Evaluates the 80% routine execution rule to determine streak growth or freeze usage.
 */
function evaluateDailyStreak(currentState, completionRate, isEmergencyDay = false) {
  const newState = { ...currentState };
  const todayStr = new Date().toISOString().split('T')[0];

  if (newState.lastActiveDate === todayStr) {
    return newState; // Streak already updated today
  }

  // Task threshold adherence check (>= 80%)
  if (completionRate >= 0.8) {
    newState.currentStreak += 1;
    newState.lastActiveDate = todayStr;
  } else if (isEmergencyDay && newState.freezeAvailable > 0) {
    // Activate Streak Freeze protection
    newState.freezeAvailable -= 1;
    newState.lastActiveDate = todayStr; // Streak preserved without resetting or incrementing
  } else {
    newState.currentStreak = 0; // Reset streak if threshold missed without a freeze
  }

  return newState;
}

module.exports = { processTaskCompletion, evaluateDailyStreak };
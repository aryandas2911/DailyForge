// ─── XP Configuration ─────────────────────────────────────────────────────────

// XP awarded per task based on priority
export const XP_VALUES = {
  Low: 10,
  Medium: 20,
  High: 35,
};

// Bonus XP for completing ALL tasks in a single day
export const DAILY_COMPLETION_BONUS = 50;

// Streak bonus thresholds: { minDays, bonusXP, label }
export const STREAK_BONUSES = [
  { minDays: 30, bonusXP: 100, label: "30-Day Streak" },
  { minDays: 14, bonusXP: 60,  label: "2-Week Streak" },
  { minDays:  7, bonusXP: 40,  label: "7-Day Streak"  },
  { minDays:  3, bonusXP: 15,  label: "3-Day Streak"  },
];

// Level thresholds — total XP needed to reach each level (index = level)
export const LEVEL_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  850,  // Level 5
  1300, // Level 6
  1900, // Level 7
  2700, // Level 8
  3700, // Level 9
  5000, // Level 10
];

export const LEVEL_NAMES = [
  "Newcomer",
  "Apprentice",
  "Explorer",
  "Achiever",
  "Challenger",
  "Specialist",
  "Expert",
  "Master",
  "Grandmaster",
  "Legend",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLevelFromXP(totalXP) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function getStreakBonus(streakDays) {
  for (const tier of STREAK_BONUSES) {
    if (streakDays >= tier.minDays && streakDays % tier.minDays === 0) {
      return { bonusXP: tier.bonusXP, label: tier.label };
    }
  }
  return null;
}

export function calculateNewStreak(currentStreak, lastActivityDate) {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (!lastActivityDate) return 1;

  const last = new Date(lastActivityDate);
  const lastUTC = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()));

  const diffDays = Math.round((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}
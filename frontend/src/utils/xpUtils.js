// ─── XP Level Configuration (mirrors backend) ────────────────────────────────

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

export const LEVEL_COLORS = [
  "#94a3b8", // 1 - grey
  "#60a5fa", // 2 - blue
  "#34d399", // 3 - green
  "#a78bfa", // 4 - purple
  "#f59e0b", // 5 - amber
  "#f97316", // 6 - orange
  "#ef4444", // 7 - red
  "#ec4899", // 8 - pink
  "#8b5cf6", // 9 - violet
  "#fbbf24", // 10 - gold
];

/**
 * Given total XP, returns full level info for UI rendering.
 */
export function getLevelInfo(totalXP = 0) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }

  const isMaxLevel   = level >= LEVEL_THRESHOLDS.length;
  const currentFloor = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextCeil     = isMaxLevel ? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] : LEVEL_THRESHOLDS[level];
  const xpIntoLevel  = totalXP - currentFloor;
  const xpNeeded     = nextCeil - currentFloor;
  const progressPct  = isMaxLevel ? 100 : Math.min(100, Math.floor((xpIntoLevel / xpNeeded) * 100));

  return {
    level,
    levelName:   LEVEL_NAMES[level - 1]  ?? "Legend",
    levelColor:  LEVEL_COLORS[level - 1] ?? "#fbbf24",
    xpIntoLevel,
    xpNeeded,
    progressPct,
    isMaxLevel,
  };
}

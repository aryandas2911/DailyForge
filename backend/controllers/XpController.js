import User from "../src/models/User.js";
import { getLevelFromXP, LEVEL_THRESHOLDS, LEVEL_NAMES } from "../utils/xpUtils.js";

/**
 * GET /api/xp
 * Returns current XP, level info, streak, and recent XP history for the user.
 */
export const getXP = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "xp level streak lastActivityDate xpHistory"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentLevel   = getLevelFromXP(user.xp);
    const currentXPFloor = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
    const nextXPCeil     = LEVEL_THRESHOLDS[currentLevel]     ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const xpIntoLevel    = user.xp - currentXPFloor;
    const xpNeededForNext = nextXPCeil - currentXPFloor;
    const progressPercent = currentLevel >= LEVEL_THRESHOLDS.length
      ? 100
      : Math.min(100, Math.floor((xpIntoLevel / xpNeededForNext) * 100));

    const recentHistory = [...(user.xpHistory || [])]
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      xp: {
        total:            user.xp,
        level:            currentLevel,
        levelName:        LEVEL_NAMES[currentLevel - 1] ?? "Legend",
        currentLevelXP:   xpIntoLevel,
        nextLevelXP:      xpNeededForNext,
        progressPercent,
        streak:           user.streak,
        lastActivityDate: user.lastActivityDate,
        recentHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching XP:", error);
    return res.status(500).json({ success: false, message: "Error fetching XP data" });
  }
};
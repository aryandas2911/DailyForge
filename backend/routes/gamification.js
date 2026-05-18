const express = require('express');
const router = express.Router();

// Mock User Database Document state
let mockUserGamificationDB = {
  currentStreak: 4,
  lastActiveDate: "2026-05-17",
  freezeAvailable: 0,
  totalPoints: 340
};

// GET current gamification stats
router.get('/status', (req, res) => {
  res.json({ success: true, data: mockUserGamificationDB });
});

// POST purchase streak freeze
router.post('/purchase-freeze', (req, res) => {
  const FREEZE_COST = 200;

  if (mockUserGamificationDB.totalPoints < FREEZE_COST) {
    return res.status(400).json({ success: false, error: 'Insufficient Forge Points balance' });
  }

  mockUserGamificationDB.totalPoints -= FREEZE_COST;
  mockUserGamificationDB.freezeAvailable += 1;

  res.json({ success: true, data: mockUserGamificationDB });
});

module.exports = router;
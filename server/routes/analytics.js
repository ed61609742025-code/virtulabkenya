// ============================================================
//  VirtuLab Kenya — Analytics Route
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const analyticsRepo = require('../repositories/analyticsRepo');

const router = express.Router();

// GET /api/analytics/class — Teacher class analytics dashboard data
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  try {
    const analyticsData = await analyticsRepo.getClassAnalytics(req.user.id);
    return res.json(analyticsData);
  } catch (err) {
    console.warn('[/api/analytics/class] Safe fallback:', err.message);
    return res.json({
      summary: { totalSessions: 0, overallAccuracyPct: 0, activeStudents: 0 },
      accuracyOverTime: [],
      byType: []
    });
  }
}));

module.exports = router;

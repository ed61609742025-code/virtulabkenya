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

// GET /api/analytics/mine — Student personal progress analytics & trajectory data
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  try {
    const analyticsData = await analyticsRepo.getStudentAnalytics(req.user.id);
    return res.json(analyticsData);
  } catch (err) {
    console.warn('[/api/analytics/mine] Safe fallback:', err.message);
    return res.json({
      summary: { totalSessions: 0, overallAccuracyPct: 0, weeklySessions: 0, topDiscipline: 'None' },
      accuracyOverTime: [],
      byType: [],
      weeklyVelocity: [
        { label: '3 Wks Ago', count: 0, target: 3 },
        { label: '2 Wks Ago', count: 0, target: 3 },
        { label: 'Last Week', count: 0, target: 3 },
        { label: 'This Week', count: 0, target: 3 }
      ]
    });
  }
}));

module.exports = router;

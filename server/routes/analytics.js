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
  const analyticsData = await analyticsRepo.getClassAnalytics(req.user.id);
  return res.json(analyticsData);
}));

module.exports = router;

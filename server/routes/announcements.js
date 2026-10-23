// ============================================================
//  VirtuLab Kenya — Announcements Routes
// ============================================================

const express = require('express');
const announcementRepo = require('../repositories/announcementRepo');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// GET /api/announcements/active — Public announcements (supports ?audience=all|students|teachers&county=...&school_id=...)
router.get('/active', asyncHandler(async (req, res) => {
  const audience = req.query.audience || 'all';
  const schoolId = req.query.school_id ? parseInt(req.query.school_id, 10) : null;
  const county = req.query.county || null;
  const announcements = await announcementRepo.getActiveAnnouncements(audience, { schoolId, county });
  res.json({ success: true, announcements });
}));

module.exports = router;

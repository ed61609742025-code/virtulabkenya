// ============================================================
//  VirtuLab Kenya — Announcements Routes
// ============================================================

const express = require('express');
const announcementRepo = require('../repositories/announcementRepo');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// GET /api/announcements/active — Public announcements (supports ?audience=all|students|teachers)
router.get('/active', asyncHandler(async (req, res) => {
  const audience = req.query.audience || 'all';
  const announcements = await announcementRepo.getActiveAnnouncements(audience);
  res.json({ success: true, announcements });
}));

module.exports = router;

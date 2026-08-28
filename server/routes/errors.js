// ============================================================
//  VirtuLab Kenya — Error Telemetry & Monitoring Routes
// ============================================================

const express = require('express');
const { captureError, getRecentErrors } = require('../middleware/errorTracker');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── POST /api/errors/client ─────────────────────────────────────
// Public endpoint for ingesting client-side JavaScript crashes
router.post('/client', (req, res) => {
  const { message, stack, url, userAgent, line, col } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Error message is required.' });
  }

  const err = new Error(message);
  if (stack) err.stack = stack;

  const event = captureError(err, req, {
    clientUrl: url,
    userAgent,
    line,
    col,
    source: 'client'
  });

  return res.status(201).json({ status: 'logged', eventId: event.id });
});

// ── GET /api/errors/recent ──────────────────────────────────────
// Protected endpoint for retrieving the recent error logs (teachers & admins)
router.get('/recent', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), (req, res) => {
  const errors = getRecentErrors();
  return res.json({ errors, count: errors.length });
});

module.exports = router;

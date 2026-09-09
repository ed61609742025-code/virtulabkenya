// ============================================================
//  VirtuLab Kenya — Error Telemetry & Monitoring Routes
// ============================================================

const express = require('express');
const { captureError, getRecentErrors } = require('../middleware/errorTracker');
const { clientErrorLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── POST /api/errors/client ─────────────────────────────────────
// Public endpoint for ingesting client-side JavaScript crashes (rate-limited)
router.post('/client', clientErrorLimiter, (req, res) => {
  const { message, stack, url, userAgent, line, col } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Valid error message is required.' });
  }

  // Bound message and stack lengths to prevent memory bloating
  const safeMessage = message.trim().slice(0, 500);
  const safeStack = typeof stack === 'string' ? stack.slice(0, 2000) : null;
  const safeUrl = typeof url === 'string' ? url.slice(0, 500) : null;
  const safeUserAgent = typeof userAgent === 'string' ? userAgent.slice(0, 300) : null;
  const safeLine = Number.isInteger(line) ? line : null;
  const safeCol = Number.isInteger(col) ? col : null;

  const err = new Error(safeMessage);
  if (safeStack) err.stack = safeStack;

  const event = captureError(err, req, {
    clientUrl: safeUrl,
    userAgent: safeUserAgent,
    line: safeLine,
    col: safeCol,
    source: 'client'
  });

  return res.status(201).json({ status: 'logged', eventId: event.id });
});

// ── GET /api/errors/recent ──────────────────────────────────────
// Protected endpoint for retrieving recent error logs
// Admins receive full diagnostic stack traces; teachers receive sanitized error summaries
router.get('/recent', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), (req, res) => {
  const errors = getRecentErrors();
  const isAdmin = req.user && req.user.role === 'admin';
  const sanitized = isAdmin ? errors : errors.map(e => ({
    id: e.id,
    message: e.message,
    source: e.source,
    createdAt: e.createdAt,
    url: e.clientUrl || e.url
  }));
  return res.json({ errors: sanitized, count: sanitized.length });
});

module.exports = router;

// ============================================================
//  VirtuLab Kenya — Real-Time Laboratory Telemetry Routes
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const telemetryRepo = require('../repositories/telemetryRepo');

const router = express.Router();

// POST /api/telemetry/heartbeat — Active laboratory simulation sends apparatus heartbeat
router.post('/heartbeat', authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { practicalType, benchName, apparatusState, safetyAlerts, status, sessionToken } = req.body || {};

  const result = await telemetryRepo.recordHeartbeat(studentId, {
    practicalType,
    benchName,
    apparatusState,
    safetyAlerts,
    status,
    sessionToken
  });

  return res.json({
    success: true,
    telemetry: result.telemetry,
    interventions: result.interventions || []
  });
}));

// GET /api/telemetry/live — Teacher & Admin live laboratory monitoring feed
router.get('/live', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const data = await telemetryRepo.getLiveTelemetry(req.user.id, req.user.role);
  return res.json({ success: true, ...data });
}));

// POST /api/telemetry/intervene — Teacher sends live guidance or safety caution to a student bench
router.post('/intervene', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const { studentId, message, interventionType } = req.body || {};

  if (!studentId || !message) {
    return res.status(400).json({ error: 'studentId and message are required.' });
  }

  const intervention = await telemetryRepo.createIntervention(teacherId, {
    studentId,
    message,
    interventionType
  });

  return res.status(201).json({ success: true, intervention });
}));

// POST /api/telemetry/simulate-feed — Teacher & Admin launches a class telemetry demonstration
router.post('/simulate-feed', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const result = await telemetryRepo.simulateClassFeed(req.user.id, req.user.role);
  return res.json(result);
}));

module.exports = router;

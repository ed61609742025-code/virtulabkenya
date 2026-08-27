// ============================================================
//  VirtuLab Kenya — Titration Practical Session Routes
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateSessionSave } = require('../middleware/validators');
const sessionRepo = require('../repositories/sessionRepo');
const { parsePagination } = require('../utils/pagination');

const router = express.Router();

// POST /api/sessions — Save a titration practical session
router.post('/', apiLimiter, authMiddleware, validateSessionSave, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const {
    titrationKey,
    titrationTitle,
    indicatorLabel,
    studentAnswer,
    trueConc,
    difference,
    correct,
    score,
    mode = 'free',
    details = {},
    durationSeconds = 0,
    assignmentId = null,
    trialsCount,
    trialReadings,
    concordantFound,
    isSuitable,
    indicatorCorrect
  } = req.body;

  if (studentAnswer == null || trueConc == null) {
    return res.status(400).json({ error: 'studentAnswer and trueConc are required.' });
  }

  // Server-side calculation of difference, correctness, and marks
  const numDiff = Math.abs(Number(studentAnswer) - Number(trueConc));
  const isCorrect = numDiff <= 0.02; // KNEC 0.02 mol/dm3 precision threshold
  const sessionScore = isCorrect ? 100 : Math.max(0, Math.round((1 - Math.min(1, numDiff / 0.10)) * 100));

  const session = await sessionRepo.saveSession({
    studentId,
    type: titrationKey,
    studentAnswer: Number(studentAnswer),
    trueConc: Number(trueConc),
    difference: numDiff,
    correct: isCorrect,
    score: sessionScore,
    mode,
    indicatorLabel,
    indicatorCorrect: indicatorCorrect ?? isSuitable ?? true,
    trialsCount: trialsCount ?? (details && Array.isArray(details.readings) ? details.readings.length : 0),
    concordantFound: concordantFound ?? false,
    trialReadings: trialReadings || (details && details.readings) || null,
    details: {
      titrationTitle,
      indicatorLabel,
      ...details
    },
    durationSeconds: Number(durationSeconds),
    assignmentId
  });

  return res.status(201).json({ session });
}));

// GET /api/sessions/mine — Fetch student's own sessions
router.get('/mine', authMiddleware, asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const result = await sessionRepo.getStudentSessions(req.user.id, {
    page,
    limit,
    type: req.query.type
  });
  return res.json(result);
}));

// GET /api/sessions/class — Teacher: fetch class session history
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  try {
    const result = await sessionRepo.getClassSessions(req.user.id, {
      page,
      limit,
      type: req.query.type,
      studentClass: req.query.class,
      from: req.query.from
    });
    return res.json(result);
  } catch (err) {
    console.warn('[/api/sessions/class] Safe fallback:', err.message);
    return res.json({ sessions: [], total: 0, page, limit, totalPages: 1 });
  }
}));

module.exports = router;

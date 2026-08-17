// ============================================================
//  VirtuLab Kenya — Qualitative Analysis Routes
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateQualitativeSave } = require('../middleware/validators');
const qualitativeRepo = require('../repositories/qualitativeRepo');
const { parsePagination } = require('../utils/pagination');

const { getSalt } = require('../config/salts');

// POST /api/qualitative — Save qualitative salt analysis session
router.post('/', apiLimiter, authMiddleware, validateQualitativeSave, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const {
    saltKey,
    saltName,
    studentCation,
    studentAnion,
    testsPerformed = 0,
    testsCorrect = 0,
    observations = [],
    mode = 'selfPaced',
    assignmentId = null
  } = req.body;

  // Server-side canonical lookup to prevent client-side answer forgery
  const saltTruth = getSalt(saltKey);
  const actualCation = saltTruth ? saltTruth.cation : (req.body.trueCation || '');
  const actualAnion = saltTruth ? saltTruth.anion : (req.body.trueAnion || '');
  const actualName = saltTruth ? saltTruth.name : (saltName || saltKey);

  const cleanStudentCation = String(studentCation || '').trim().replace(/[\^_\s]/g, '').toLowerCase();
  const cleanTrueCation = actualCation.trim().replace(/[\^_\s]/g, '').toLowerCase();
  const cleanStudentAnion = String(studentAnion || '').trim().replace(/[\^_\s]/g, '').toLowerCase();
  const cleanTrueAnion = actualAnion.trim().replace(/[\^_\s]/g, '').toLowerCase();

  const cationCorrect = cleanStudentCation === cleanTrueCation;
  const anionCorrect = cleanStudentAnion === cleanTrueAnion;
  const overallCorrect = cationCorrect && anionCorrect;

  const savedSession = await qualitativeRepo.saveQualitativeSession({
    studentId,
    saltKey,
    saltName: actualName,
    trueCation: actualCation,
    trueAnion: actualAnion,
    studentCation,
    studentAnion,
    cationCorrect,
    anionCorrect,
    testsPerformed: Number(testsPerformed),
    testsCorrect: Number(testsCorrect),
    observations: Array.isArray(observations) ? observations : [],
    correct: overallCorrect,
    mode,
    assignmentId
  });

  if (assignmentId) {
    await qualitativeRepo.linkAssignmentSubmission(assignmentId, studentId);
  }

  return res.status(201).json({
    message: 'Qualitative analysis session saved successfully.',
    session: savedSession
  });
}));

// GET /api/qualitative/mine — Student session history
router.get('/mine', authMiddleware, asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const userSessions = await qualitativeRepo.getStudentSessions(req.user.id, { page, limit });
  return res.json(userSessions);
}));

// GET /api/qualitative/class — Teacher class sessions
router.get('/class', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can access class qualitative sessions.' });
  }

  const classSessions = await qualitativeRepo.getClassSessions(req.user.id);
  return res.json({ sessions: classSessions });
}));

module.exports = router;

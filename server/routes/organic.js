// ============================================================
//  VirtuLab Kenya — Organic Chemistry API Routes
//  Feature #20: Organic Chemistry Functional Group Simulator
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');
const organicRepo = require('../repositories/organicRepo');
const { getOrganicCompound, isFunctionalGroupCorrect } = require('../config/organicCompounds');

// POST /api/organic — Save organic chemistry practical attempt
router.post('/', apiLimiter, authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const student_id = req.user.id;
  const {
    compound_key,
    compound_name,
    student_functional_group,
    tests_performed = 0,
    tests_correct = 0,
    observations = [],
    mode = 'selfPaced',
    assignment_id = null
  } = req.body;

  if (!compound_key || !student_functional_group) {
    return res.status(400).json({ error: 'compound_key and student_functional_group are required fields.' });
  }

  // Server-side canonical lookup to prevent client-side answer forgery
  const orgTruth = getOrganicCompound(compound_key);
  const actualFG = orgTruth ? orgTruth.fg : (req.body.true_functional_group || '');
  const actualName = orgTruth ? orgTruth.name : (compound_name || compound_key);

  const fg_correct = orgTruth
    ? isFunctionalGroupCorrect(compound_key, student_functional_group)
    : (String(req.body.true_functional_group || '').trim().toLowerCase() === String(student_functional_group || '').trim().toLowerCase());

  const testsPerformedNum = Number(tests_performed) || 0;
  const testsCorrectNum = Number(tests_correct) || 0;
  const questions_total = req.body.questions_total || (testsPerformedNum > 0 ? testsPerformedNum : 4);
  const questions_correct = testsCorrectNum;

  let score_pct;
  if (typeof req.body.score_pct === 'number') {
    score_pct = Math.max(0, Math.min(100, Math.round(req.body.score_pct)));
  } else if (testsPerformedNum > 0) {
    const testRatio = Math.min(1, Math.max(0, testsCorrectNum / testsPerformedNum));
    const fgRatio = fg_correct ? 1.0 : 0.0;
    score_pct = Math.round((testRatio * 0.65 + fgRatio * 0.35) * 100);
  } else {
    score_pct = fg_correct ? 100 : 0;
  }

  const overall_correct = fg_correct && (testsPerformedNum === 0 || testsCorrectNum >= Math.ceil(testsPerformedNum * 0.5));

  const savedSession = await organicRepo.saveOrganicSession({
    student_id,
    assignment_id,
    compound_key,
    compound_name: actualName,
    true_functional_group: actualFG,
    student_functional_group,
    fg_correct,
    tests_performed: Number(tests_performed),
    tests_correct: Number(tests_correct),
    questions_total,
    questions_correct,
    score_pct,
    observations: Array.isArray(observations) ? observations : [],
    overall_correct,
    mode
  });

  return res.status(201).json({
    message: 'Organic chemistry session saved successfully.',
    session: savedSession
  });
}));

// GET /api/organic/mine — Fetch student's organic sessions
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const student_id = req.user.id;
  const userSessions = await organicRepo.getStudentSessions(student_id);
  return res.json(userSessions);
}));

// GET /api/organic/class — Teacher: fetch organic sessions for all students
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  try {
    const classSessions = await organicRepo.getClassSessions(req.user.id);
    return res.json({ sessions: classSessions || [] });
  } catch (err) {
    console.warn('[/api/organic/class] Safe fallback:', err.message);
    return res.json({ sessions: [] });
  }
}));

module.exports = router;

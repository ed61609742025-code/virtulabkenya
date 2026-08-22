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
router.post('/', apiLimiter, authMiddleware, asyncHandler(async (req, res) => {
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

  const overall_correct = fg_correct;
  const questions_total = req.body.questions_total || 4;
  const questions_correct = fg_correct ? Math.max(1, Number(tests_correct) || 1) : Number(tests_correct || 0);
  const score_pct = overall_correct ? 100 : Math.round((questions_correct / questions_total) * 100);

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
router.get('/mine', authMiddleware, asyncHandler(async (req, res) => {
  const student_id = req.user.id;
  const userSessions = await organicRepo.getStudentSessions(student_id);
  return res.json(userSessions);
}));

// GET /api/organic/class — Teacher: fetch organic sessions for all students
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const classSessions = await organicRepo.getClassSessions(req.user.id);
  return res.json({ sessions: classSessions });
}));

module.exports = router;

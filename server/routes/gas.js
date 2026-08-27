// ============================================================
//  VirtuLab Kenya — Gas Preparation & Collection API Routes
//  KNEC Chemistry Paper 3 Inorganic Practical Module
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const gasRepo = require('../repositories/gasRepo');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/gas/session or /api/gas — Save a completed Gas Preparation practical session
router.post('/', apiLimiter, authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const {
    assignment_id,
    gas_key = 'O2',
    gas_name,
    reactants,
    drying_agent,
    collection_method,
    drying_correct,
    collection_correct,
    tests_performed,
    tests_correct,
    test_observations,
    questions_score,
    total_score,
    rubric_breakdown,
    correct,
    mode = 'selfPaced',
    duration_seconds = 0
  } = req.body;

  const savedSession = await gasRepo.saveGasSession({
    studentId,
    assignment_id,
    gas_key,
    gas_name: gas_name || `Gas Preparation: ${gas_key}`,
    reactants,
    drying_agent,
    collection_method,
    drying_correct: !!drying_correct,
    collection_correct: !!collection_correct,
    tests_performed: parseInt(tests_performed, 10) || 0,
    tests_correct: parseInt(tests_correct, 10) || 0,
    test_observations: test_observations || {},
    questions_score: parseFloat(questions_score) || 0,
    total_score: parseFloat(total_score) || 0,
    rubric_breakdown: rubric_breakdown || {},
    correct: !!correct,
    mode,
    duration_seconds: parseInt(duration_seconds, 10) || 0
  });

  res.status(201).json({
    success: true,
    message: 'Gas Preparation session recorded successfully.',
    session: savedSession
  });
}));

// GET /api/gas/mine — Fetch student's own gas preparation practical history
router.get('/mine', authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const sessions = await gasRepo.getStudentSessions(studentId);
  res.json({ success: true, sessions });
}));

// GET /api/gas/class — Teacher view of all students' gas preparation sessions
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const sessions = await gasRepo.getClassGasSessions(teacherId);
  res.json({ success: true, sessions: sessions || [] });
}));

module.exports = router;

// ============================================================
//  VirtuLab Kenya — Academic Research & Evaluation API Routes
//  Master's in Learning Design & Technology Research Suite
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const researchRepo = require('../repositories/researchRepo');
const stats = require('../utils/statistics');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/research/cpcat/submit — Record completed CPCAT pre-test or post-test
router.post('/cpcat/submit', apiLimiter, authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const {
    assessment_type = 'pre_test',
    title,
    section_a_score,
    section_b_score,
    section_c_score,
    section_d_score,
    total_score,
    max_score = 40.0,
    percentage,
    answers,
    rubric_breakdown,
    duration_seconds
  } = req.body;

  const sA = parseFloat(section_a_score) || 0;
  const sB = parseFloat(section_b_score) || 0;
  const sC = parseFloat(section_c_score) || 0;
  const sD = parseFloat(section_d_score) || 0;
  const computedTotal = parseFloat((sA + sB + sC + sD).toFixed(2));
  const finalTotal = parseFloat(total_score) || computedTotal;
  const finalMax = parseFloat(max_score) || 40.0;
  const finalPct = parseFloat(((finalTotal / finalMax) * 100).toFixed(2));

  const saved = await researchRepo.saveAssessment({
    studentId,
    assessment_type,
    title: title || `Chemistry Practical Competency Achievement Test (${assessment_type === 'pre_test' ? 'Pre-Test' : 'Post-Test'})`,
    section_a_score: sA,
    section_b_score: sB,
    section_c_score: sC,
    section_d_score: sD,
    total_score: finalTotal,
    max_score: finalMax,
    percentage: finalPct,
    answers: answers || {},
    rubric_breakdown: rubric_breakdown || {},
    duration_seconds: parseInt(duration_seconds, 10) || 0
  });

  res.status(201).json({
    success: true,
    message: `CPCAT ${assessment_type === 'pre_test' ? 'Pre-Test' : 'Post-Test'} recorded successfully.`,
    assessment: saved
  });
}));

// GET /api/research/cpcat/status — Check pre/post test completion status for current student
router.get('/cpcat/status', authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const assessments = await researchRepo.getStudentAssessments(studentId);

  const hasPreTest = assessments.some(a => a.assessment_type === 'pre_test');
  const hasPostTest = assessments.some(a => a.assessment_type === 'post_test');
  const preTest = assessments.find(a => a.assessment_type === 'pre_test') || null;
  const postTest = assessments.find(a => a.assessment_type === 'post_test') || null;

  let hakesGain = null;
  if (preTest && postTest) {
    hakesGain = stats.computeHakesGain(preTest.total_score, postTest.total_score, 40.0);
  }

  res.json({
    success: true,
    hasPreTest,
    hasPostTest,
    preTest,
    postTest,
    hakesGain
  });
}));

// GET /api/research/cpcat/mine — Fetch student's assessments
router.get('/cpcat/mine', authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const assessments = await researchRepo.getStudentAssessments(studentId);
  res.json({ success: true, assessments });
}));

// POST /api/research/sus/submit — Record 10-item System Usability Scale survey
router.post('/sus/submit', apiLimiter, authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role || 'student';
  const schoolId = req.user.school_id || null;
  const { responses = [], feedback_text = '' } = req.body;

  const susResult = stats.computeSUSScore(responses);

  const saved = await researchRepo.saveSurvey({
    userId,
    userRole,
    schoolId,
    survey_type: 'SUS',
    responses,
    score: susResult.score,
    construct_scores: { grade: susResult.grade, adjective: susResult.adjective, acceptability: susResult.acceptability },
    feedback_text
  });

  res.status(201).json({
    success: true,
    message: 'System Usability Scale survey response recorded.',
    survey: saved,
    susScore: susResult
  });
}));

// POST /api/research/tam/submit — Record Technology Acceptance Model (TAM 3) questionnaire
router.post('/tam/submit', apiLimiter, authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role || 'student';
  const schoolId = req.user.school_id || null;
  const { responses = {}, feedback_text = '' } = req.body;

  const constructScores = stats.computeTAMConstructs(responses);

  const saved = await researchRepo.saveSurvey({
    userId,
    userRole,
    schoolId,
    survey_type: 'TAM',
    responses,
    score: constructScores.compositeMean,
    construct_scores: constructScores,
    feedback_text
  });

  res.status(201).json({
    success: true,
    message: 'Technology Acceptance Model (TAM) response recorded.',
    survey: saved,
    constructScores
  });
}));

// GET /api/research/analytics/summary — Research overview with statistical synthesis
router.get('/analytics/summary', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const teacherId = req.user.role === 'teacher' ? req.user.id : null;
  const summary = await researchRepo.getResearchSummary(teacherId);

  res.json({
    success: true,
    summary
  });
}));

// GET /api/research/export/csv — Download complete anonymized CSV research dataset
router.get('/export/csv', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const csvContent = await researchRepo.exportResearchDatasetCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="virtulab_kenya_research_dataset.csv"');
  res.send(csvContent);
}));

module.exports = router;

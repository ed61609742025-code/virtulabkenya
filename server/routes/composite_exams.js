// ============================================================
//  VirtuLab Kenya — Composite Chemistry Exam API Routes
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateCompositeSave } = require('../middleware/validators');
const compositeRepo = require('../repositories/compositeRepo');
const { sendCsv, toCsvRow } = require('../utils/csv');

function calculateKnecGrade(totalScore) {
  const score = Number(totalScore) || 0;
  const pct = (score / 40.0) * 100;

  if (pct >= 80) return 'A';
  if (pct >= 70) return 'A-';
  if (pct >= 60) return 'B+';
  if (pct >= 55) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 45) return 'C';
  if (pct >= 40) return 'D+';
  if (pct >= 35) return 'D';
  return 'E';
}

// POST /api/composite — Save 40-mark composite practical exam session
router.post('/', apiLimiter, authMiddleware, validateCompositeSave, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const {
    assignment_id = null,
    exam_title = 'KCSE Chemistry Paper 3 Practical Exam',
    q1_score = 0,
    q2_score = 0,
    q3_score = 0,
    details = {},
    duration_seconds = 0
  } = req.body;

  const q1 = Math.min(15, Math.max(0, Number(q1_score) || 0));
  const q2 = Math.min(15, Math.max(0, Number(q2_score) || 0));
  const q3 = Math.min(10, Math.max(0, Number(q3_score) || 0));
  const total = Number((q1 + q2 + q3).toFixed(1));
  const grade = calculateKnecGrade(total);

  const savedSession = await compositeRepo.saveCompositeSession({
    studentId,
    assignment_id,
    exam_title,
    q1,
    q2,
    q3,
    total,
    grade,
    details,
    duration_seconds
  });

  return res.status(201).json({
    message: 'Composite practical exam saved successfully.',
    session: savedSession,
    knec_grade: grade
  });
}));

// GET /api/composite/mine — Fetch student's own composite exam results
router.get('/mine', authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const sessions = await compositeRepo.getStudentSessions(studentId);
  return res.json({ sessions });
}));

// GET /api/composite/teacher — Teacher: fetch class composite exam attempts
router.get('/teacher', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can access class composite exam results.' });
  }

  const sessions = await compositeRepo.getTeacherSessions(req.user.id);
  return res.json({ sessions });
}));

// GET /api/composite/export/:assignmentId — Export CSV of assignment composite results
router.get('/export/:assignmentId', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can export exam results.' });
  }

  const exportData = await compositeRepo.getExportData(req.params.assignmentId, req.user.id);
  if (!exportData) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }

  const headers = ['Student Name', 'Email', 'Form', 'Q1 Score (16)', 'Q2 Score (12)', 'Q3 Score (12)', 'Total Score (40)', 'KNEC Grade', 'Duration (min)', 'Submitted At'];
  const headerRow = toCsvRow(headers);
  const dataRows = exportData.rows.map(r => toCsvRow([
    r.student_name,
    r.student_email,
    r.student_form,
    r.q1_score,
    r.q2_score,
    r.q3_score,
    r.total_score,
    r.grade,
    Math.round((r.duration_seconds || 0) / 60),
    new Date(r.created_at).toISOString()
  ]));

  const filename = `composite_exam_${exportData.assignment.id}_results.csv`;
  sendCsv(res, filename, headerRow, dataRows);
}));

module.exports = router;

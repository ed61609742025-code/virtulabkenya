// ============================================================
//  VirtuLab Kenya — Composite Chemistry Exam API Routes
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateCompositeSave } = require('../middleware/validators');
const pool = require('../db/pool');
const compositeRepo = require('../repositories/compositeRepo');
const { sendCsv, toCsvRow } = require('../utils/csv');
const path = require('path');

let calculateKnecGrade;
try {
  const knecGrading = require(path.join(__dirname, '../../client/shared/knec-grading.js'));
  calculateKnecGrade = knecGrading.calculateKnecGrade;
} catch (e) {
  calculateKnecGrade = function (score, maxScore = 40.0) {
    const s = Number(score) || 0;
    const m = Number(maxScore) || 40.0;
    const pct = (s / m) * 100.0;
    if (pct >= 80.0) return 'A';
    if (pct >= 75.0) return 'A-';
    if (pct >= 70.0) return 'B+';
    if (pct >= 65.0) return 'B';
    if (pct >= 60.0) return 'B-';
    if (pct >= 55.0) return 'C+';
    if (pct >= 50.0) return 'C';
    if (pct >= 45.0) return 'C-';
    if (pct >= 40.0) return 'D+';
    if (pct >= 35.0) return 'D';
    if (pct >= 30.0) return 'D-';
    return 'E';
  };
}

// POST /api/composite — Save 40-mark composite practical exam session
router.post('/', apiLimiter, authMiddleware, authMiddleware.requireRole('student'), validateCompositeSave, asyncHandler(async (req, res) => {
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

  // Determine dynamic maximum marks per question (supports standard 15-15-10 and polymorphic 15-10-15 exams)
  const maxQ1 = (details && details.q1 && typeof details.q1.maxScore === 'number') ? details.q1.maxScore : 15;
  const maxQ2 = (details && details.q2 && typeof details.q2.maxScore === 'number') ? details.q2.maxScore : 15;
  const maxQ3 = (details && details.q3 && typeof details.q3.maxScore === 'number') ? details.q3.maxScore : 10;

  let q1 = Math.min(maxQ1, Math.max(0, Number(q1_score) || 0));
  let q2 = Math.min(maxQ2, Math.max(0, Number(q2_score) || 0));
  let q3 = Math.min(maxQ3, Math.max(0, Number(q3_score) || 0));

  // If this exam has written questions associated with an assignment, integrate their scores
  if (assignment_id) {
    try {
      const writtenRes = await pool.query(
        `SELECT question_number, sub_question_id,
                COALESCE(teacher_score, ai_score, 0) AS final_score
         FROM written_responses
         WHERE student_id = $1 AND assignment_id = $2`,
        [studentId, assignment_id]
      );
      if (writtenRes.rows.length > 0) {
        const writtenMap = {};
        for (const row of writtenRes.rows) {
          const qNum = row.question_number;
          writtenMap[qNum] = (writtenMap[qNum] || 0) + Number(row.final_score || 0);
        }
        details.written_scores = writtenMap;
        if (writtenMap[1] !== undefined && q1 === 0) q1 = writtenMap[1];
        if (writtenMap[2] !== undefined && q2 === 0) q2 = writtenMap[2];
        if (writtenMap[3] !== undefined && q3 === 0) q3 = writtenMap[3];
      }
    } catch (e) {
      console.warn('[/api/composite] written_responses query note:', e.message);
    }
  }

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
    knec_grade: grade,
    total_score: total,
    breakdown: { q1, q2, q3 }
  });
}));

// GET /api/composite/mine — Fetch student's own composite exam results
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const sessions = await compositeRepo.getStudentSessions(studentId);
  return res.json({ sessions });
}));

// GET /api/composite/teacher — Teacher: fetch class composite exam attempts
router.get('/teacher', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can access class composite exam results.' });
  }

  try {
    const sessions = await compositeRepo.getTeacherSessions(req.user.id);
    return res.json({ sessions: sessions || [] });
  } catch (err) {
    console.warn('[/api/composite/teacher] Safe fallback:', err.message);
    return res.json({ sessions: [] });
  }
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

  const headers = ['Student Name', 'Email', 'Form', 'Q1 Score (15)', 'Q2 Score (15)', 'Q3 Score (10)', 'Total Score (40)', 'KNEC Grade', 'Duration (min)', 'Submitted At'];
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

// ============================================================
<<<<<<< HEAD
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
=======
//  VirtuLab Kenya — Session Routes
//  Phase 2, Week 9
// ============================================================
//
// POST /api/sessions        — save a practical session (student)
//                              optional body field: assignmentId,
//                              links the session to an assignment
// GET  /api/sessions/mine   — student's own session history
// GET  /api/sessions/class  — teacher's class sessions

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

// ── POST /api/sessions ──────────────────────────────────────────
// Requires a student token. Saves one practical attempt.
router.post('/', authMiddleware, authMiddleware.requireRole('student'), async (req, res) => {
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8
  const {
    titrationKey,
    titrationTitle,
    indicatorLabel,
<<<<<<< HEAD
    studentAnswer,
    trueConc,
    difference,
    correct,
    score,
    mode = 'free',
    details = {},
    durationSeconds = 0,
    assignmentId = null
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
    details: {
      titrationTitle,
      indicatorLabel,
      ...details
    },
    durationSeconds: Number(durationSeconds),
    assignmentId
  });

  if (assignmentId) {
    await sessionRepo.linkAssignmentSubmission(assignmentId, studentId);
  }

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
  const result = await sessionRepo.getClassSessions(req.user.id, {
    page,
    limit,
    type: req.query.type,
    studentClass: req.query.class,
    from: req.query.from
  });
  return res.json(result);
}));
=======
    isSuitable,
    trueConc,
    studentAnswer,
    correct,
    trialsCount,
    concordantFound,
    trialReadings,
    mode,
    durationSeconds,
    assignmentId
  } = req.body;

  if (!titrationKey) {
    return res.status(400).json({ error: 'titrationKey is required.' });
  }

  try {
    // Enforce one submission per assignment per student. Checked
    // before any insert happens, so a rejected duplicate attempt
    // never creates an orphaned practice session that isn't linked
    // to anything — the whole request fails cleanly up front.
    if (assignmentId) {
      const existing = await pool.query(
        'SELECT id FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2',
        [assignmentId, req.user.id]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'You have already submitted this assignment. Only one submission is allowed.' });
      }
    }

    const result = await pool.query(
      `INSERT INTO practical_sessions
        (student_id, titration_type, titration_title, indicator_used,
         indicator_correct, trials_count, concordant_found, trial_readings,
         student_answer, true_value, correct, duration_seconds, mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        req.user.id,
        titrationKey,
        titrationTitle || null,
        indicatorLabel || null,
        isSuitable === undefined ? null : isSuitable,
        trialsCount || 0,
        concordantFound === undefined ? false : concordantFound,
        trialReadings ? JSON.stringify(trialReadings) : null,
        studentAnswer === undefined ? null : studentAnswer,
        trueConc === undefined ? null : trueConc,
        correct === undefined ? false : correct,
        durationSeconds || null,
        mode || 'free'
      ]
    );

    const session = result.rows[0];

    // If this session was done for a specific assignment, record the
    // submission. A failure here should not lose the student's saved
    // session, so it's caught and reported separately.
    let submissionWarning = null;
    if (assignmentId) {
      try {
        await pool.query(
          `INSERT INTO assignment_submissions (assignment_id, student_id, session_id)
           VALUES ($1, $2, $3)`,
          [assignmentId, req.user.id, session.id]
        );
      } catch (subErr) {
        console.error('Record submission error:', subErr.message);
        submissionWarning = 'Session saved, but it could not be linked to the assignment.';
      }
    }

    return res.status(201).json({ session, submissionWarning });
  } catch (err) {
    console.error('Save session error:', err.message);
    return res.status(500).json({ error: 'Could not save session. Please try again.' });
  }
});

// ── GET /api/sessions/mine ──────────────────────────────────────
// Requires a student token. Returns the logged-in student's own
// session history, most recent first.
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), async (req, res) => {
  const { type: titrationType } = req.query;

  // Pagination: defaults to 5 per page (small — this is mainly used
  // for the compact "recent sessions" preview on the home page), can
  // be raised for the full history page, capped at 100.
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 5));
  const offset = (page - 1) * limit;

  const conditions = ['student_id = $1'];
  const values = [req.user.id];
  let paramIndex = 2;

  if (titrationType) {
    conditions.push(`titration_type = $${paramIndex}`);
    values.push(titrationType);
    paramIndex++;
  }
  const whereClause = conditions.join(' AND ');

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM practical_sessions WHERE ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const result = await pool.query(
      `SELECT * FROM practical_sessions
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    return res.json({
      sessions: result.rows,
      pagination: { page, limit, totalCount, totalPages }
    });
  } catch (err) {
    console.error('Get mine error:', err.message);
    return res.status(500).json({ error: 'Could not load session history.' });
  }
});

// ── GET /api/sessions/class ─────────────────────────────────────
// Requires a teacher token. Returns sessions for students assigned
// to this teacher (students.teacher_id), most recent first.
// Optional query params: ?class=Form3B&type=acidBase&from=2025-01-01
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  const { class: studentForm, type: titrationType, from } = req.query;

  // Pagination: defaults to 20 per page, capped at 100 to prevent an
  // accidentally huge request. Page numbers are 1-indexed for the
  // frontend's convenience.
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const conditions = ['s.teacher_id = $1'];
  const values = [req.user.id];
  let paramIndex = 2;

  if (studentForm) {
    conditions.push(`s.form = $${paramIndex}`);
    values.push(studentForm);
    paramIndex++;
  }
  if (titrationType) {
    conditions.push(`ps.titration_type = $${paramIndex}`);
    values.push(titrationType);
    paramIndex++;
  }
  if (from) {
    conditions.push(`ps.created_at >= $${paramIndex}`);
    values.push(from);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM practical_sessions ps
       JOIN students s ON s.id = ps.student_id
       WHERE ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const result = await pool.query(
      `SELECT ps.*, s.name AS student_name, s.form AS student_form
       FROM practical_sessions ps
       JOIN students s ON s.id = ps.student_id
       WHERE ${whereClause}
       ORDER BY ps.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    return res.json({
      sessions: result.rows,
      pagination: { page, limit, totalCount, totalPages }
    });
  } catch (err) {
    console.error('Get class sessions error:', err.message);
    return res.status(500).json({ error: 'Could not load class sessions.' });
  }
});
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

module.exports = router;

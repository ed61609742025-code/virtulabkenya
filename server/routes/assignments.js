// ============================================================
//  VirtuLab Kenya — Assignment Routes
<<<<<<< HEAD
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { validateAssignmentCreate } = require('../middleware/validators');
const assignmentRepo = require('../repositories/assignmentRepo');
const { sendCsv, toCsvRow } = require('../utils/csv');

const router = express.Router();

const CSV_HEADERS = [
  'Student Name', 'Email', 'Form', 'Titration Type', 'Titration Title',
  'Indicator', 'Trials Count', 'Trial Readings (cm3)', 'Concordant Found',
  'True Concentration (mol/dm3)', 'Student Answer (mol/dm3)', 'Correct',
  'Mode', 'Submitted At'
];

function submissionRowToValues(row) {
  const readings = Array.isArray(row.trial_readings)
    ? row.trial_readings.map(r => Number(r).toFixed(2)).join(' | ')
    : '';
  return [
    row.student_name,
    row.student_email,
    row.student_form,
    row.titration_type,
    row.titration_title,
    row.indicator_used,
    row.trials_count,
    readings,
    row.concordant_found ? 'Yes' : 'No',
    row.true_value,
    row.student_answer,
    row.correct ? 'Yes' : 'No',
    row.mode,
    row.submitted_at ? new Date(row.submitted_at).toISOString() : ''
  ];
}

const pool = require('../db/pool');

// POST /api/assignments — Create an assignment (teacher)
router.post('/', authMiddleware, authMiddleware.requireRole('teacher'), validateAssignmentCreate, asyncHandler(async (req, res) => {
  const assignment = await assignmentRepo.createAssignment(req.user.id, req.body);
  if (!assignment) {
    return res.status(404).json({ error: 'Teacher account not found.' });
  }

  // Auto-notify all students enrolled under this teacher
  try {
    const studentsRes = await pool.query('SELECT id FROM students WHERE teacher_id = $1', [req.user.id]);
    const dueFormatted = assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No deadline';
    for (const s of studentsRes.rows) {
      await pool.query(
        `INSERT INTO student_notifications (student_id, title, message, type, link)
         VALUES ($1, $2, $3, 'assignment', '/student/home.html')`,
        [
          s.id,
          `📝 New Assignment: ${assignment.title}`,
          `Your chemistry teacher posted a new practical assignment: "${assignment.title}". Due date: ${dueFormatted}.`
        ]
      );
    }
  } catch (notifErr) {
    console.warn('[Assignment Notice Warning]:', notifErr.message);
  }

  return res.status(201).json({ assignment });
}));

// POST /api/assignments/:id/remind — Teacher sends due date reminder to unsubmitted students
router.post('/:id/remind', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;
  const teacherId = req.user.id;

  // Verify assignment ownership
  const aRes = await pool.query('SELECT * FROM assignments WHERE id = $1 AND teacher_id = $2', [assignmentId, teacherId]);
  if (aRes.rows.length === 0) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }
  const assignment = aRes.rows[0];

  // Find all students under this teacher who haven't submitted yet
  const unsubmittedRes = await pool.query(
    `SELECT s.id, s.name, s.email
     FROM students s
     WHERE s.teacher_id = $1
       AND s.id NOT IN (
         SELECT sub.student_id FROM assignment_submissions sub WHERE sub.assignment_id = $2
         UNION
         SELECT ps.student_id FROM practical_sessions ps WHERE ps.assignment_id = $2
         UNION
         SELECT qs.student_id FROM qualitative_sessions qs WHERE qs.assignment_id = $2
         UNION
         SELECT os.student_id FROM organic_sessions os WHERE os.assignment_id = $2
         UNION
         SELECT cs.student_id FROM composite_sessions cs WHERE cs.assignment_id = $2
         UNION
         SELECT ss.student_id FROM solubility_sessions ss WHERE ss.assignment_id = $2
         UNION
         SELECT es.student_id FROM energy_sessions es WHERE es.assignment_id = $2
         UNION
         SELECT rs.student_id FROM rates_sessions rs WHERE rs.assignment_id = $2
       )`,
    [teacherId, assignmentId]
  );

  const dueFormatted = assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'Soon';
  let notifiedCount = 0;

  for (const s of unsubmittedRes.rows) {
    await pool.query(
      `INSERT INTO student_notifications (student_id, title, message, type, link)
       VALUES ($1, $2, $3, 'due_soon', '/student/home.html')`,
      [
        s.id,
        `⏱️ Reminder: "${assignment.title}" Due Soon`,
        `Reminder from your teacher to complete your practical assignment "${assignment.title}". Due date: ${dueFormatted}.`
      ]
    );
    notifiedCount++;
  }

  return res.json({
    success: true,
    message: `Reminder notifications sent to ${notifiedCount} student(s).`,
    notifiedCount,
    studentsNotified: unsubmittedRes.rows.map(s => s.name)
  });
}));

// GET /api/assignments/mine — Student's assignments
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const assignments = await assignmentRepo.getStudentAssignments(req.user.id);
  return res.json({ assignments });
}));

// GET /api/assignments/teacher — Teacher's assignments
router.get('/teacher', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const assignments = await assignmentRepo.getTeacherAssignments(req.user.id);
  return res.json({ assignments });
}));

// GET /api/assignments/submissions/all — Teacher's student submissions
router.get('/submissions/all', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const data = await assignmentRepo.getAllSubmissions(req.user.id, { page, limit });
  return res.json(data);
}));

// POST /api/assignments/submissions/:id/mark — Teacher approves & marks submission
router.post('/submissions/:id/mark', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const { teacherFeedback } = req.body || {};
  const submission = await assignmentRepo.markSubmission(req.params.id, req.user.id, teacherFeedback);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found or access denied.' });
  }

  // Notify student of released feedback
  try {
    if (submission.student_id) {
      await pool.query(
        `INSERT INTO student_notifications (student_id, title, message, type, link)
         VALUES ($1, $2, $3, 'feedback', '/student/home.html')`,
        [
          submission.student_id,
          `🏆 Graded: Practical Feedback Released`,
          `Your chemistry teacher has reviewed and released marks/feedback for your practical assignment.`
        ]
      );
    }
  } catch (markNotifErr) {
    console.warn('[Mark Notice Warning]:', markNotifErr.message);
  }

  return res.json({ success: true, submission });
}));

// PUT /api/assignments/:id — Edit an assignment (teacher creator)
router.put('/:id', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const updated = await assignmentRepo.updateAssignment(req.params.id, req.user.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }
  return res.json({ assignment: updated });
}));

// DELETE /api/assignments/:id — Delete an assignment (teacher creator)
router.delete('/:id', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const deleted = await assignmentRepo.deleteAssignment(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }
  return res.json({ success: true, message: 'Assignment deleted successfully.' });
}));

// GET /api/assignments/:id/export — Export CSV of submissions
router.get('/:id/export', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const data = await assignmentRepo.getAssignmentExportData(req.params.id, req.user.id);
  if (!data) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }

  const headerRow = toCsvRow(CSV_HEADERS);
  const dataRows = data.rows.map(row => toCsvRow(submissionRowToValues(row)));
  const filename = `assignment_${data.assignment.id}_submissions.csv`;

  sendCsv(res, filename, headerRow, dataRows);
}));
=======
//  Phase 4, Week 25
// ============================================================
//
// POST   /api/assignments        — create an assignment (teacher)
// GET    /api/assignments/mine   — student's assignments, with
//                                   submission status
// GET    /api/assignments/teacher — teacher's own created
//                                    assignments, with submission
//                                    counts across their class
// PUT    /api/assignments/:id    — edit an assignment (teacher,
//                                   must be the creator)
// DELETE /api/assignments/:id    — delete an assignment (teacher,
//                                   must be the creator)
// GET    /api/assignments/:id/export — download all submissions
//                                       for this assignment as CSV
//                                       (teacher, must be creator)

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

// ── POST /api/assignments ───────────────────────────────────────
// Requires a teacher token. Creates an assignment for the
// teacher's school.
router.post('/', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  const { title, titrationType, instructions, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  try {
    // Look up the teacher's school so the assignment is scoped
    // correctly without trusting a school_id from the client.
    const teacherResult = await pool.query(
      'SELECT school_id FROM teachers WHERE id = $1',
      [req.user.id]
    );
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher account not found.' });
    }
    const schoolId = teacherResult.rows[0].school_id;

    const result = await pool.query(
      `INSERT INTO assignments (teacher_id, school_id, title, titration_type, instructions, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, schoolId, title, titrationType || null, instructions || null, dueDate || null]
    );

    return res.status(201).json({ assignment: result.rows[0] });
  } catch (err) {
    console.error('Create assignment error:', err.message);
    return res.status(500).json({ error: 'Could not create assignment. Please try again.' });
  }
});

// ── GET /api/assignments/mine ───────────────────────────────────
// Requires a student token. Returns assignments for the student's
// school, each flagged with whether this student has submitted it.
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT school_id FROM students WHERE id = $1',
      [req.user.id]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student account not found.' });
    }
    const schoolId = studentResult.rows[0].school_id;

    const result = await pool.query(
      `SELECT a.*,
              (sub.id IS NOT NULL) AS submitted,
              sub.submitted_at
       FROM assignments a
       LEFT JOIN assignment_submissions sub
         ON sub.assignment_id = a.id AND sub.student_id = $1
       WHERE a.school_id = $2
       ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC`,
      [req.user.id, schoolId]
    );

    return res.json({ assignments: result.rows });
  } catch (err) {
    console.error('Get assignments error:', err.message);
    return res.status(500).json({ error: 'Could not load assignments.' });
  }
});

// ── GET /api/assignments/teacher ─────────────────────────────────
// Requires a teacher token. Returns assignments this teacher
// created, each with a submission count out of their total
// linked students — useful for "who's still pending" at a glance.
router.get('/teacher', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*,
              COUNT(DISTINCT sub.student_id) AS submitted_count,
              (SELECT COUNT(*) FROM students s WHERE s.teacher_id = $1) AS total_students
       FROM assignments a
       LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id
       WHERE a.teacher_id = $1
       GROUP BY a.id
       ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC`,
      [req.user.id]
    );
    return res.json({ assignments: result.rows });
  } catch (err) {
    console.error('Get teacher assignments error:', err.message);
    return res.status(500).json({ error: 'Could not load your assignments.' });
  }
});

// ── PUT /api/assignments/:id ─────────────────────────────────────
// Requires a teacher token. Only the teacher who created the
// assignment can edit it.
router.put('/:id', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  const { title, titrationType, instructions, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE assignments
       SET title = $1, titration_type = $2, instructions = $3, due_date = $4
       WHERE id = $5 AND teacher_id = $6
       RETURNING *`,
      [title, titrationType || null, instructions || null, dueDate || null, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found, or you do not have permission to edit it.' });
    }

    return res.json({ assignment: result.rows[0] });
  } catch (err) {
    console.error('Update assignment error:', err.message);
    return res.status(500).json({ error: 'Could not update assignment. Please try again.' });
  }
});

// ── DELETE /api/assignments/:id ──────────────────────────────────
// Requires a teacher token. Only the teacher who created the
// assignment can delete it. Deleting cascades to remove any
// submissions tied to it (see schema.sql ON DELETE CASCADE),
// but does not touch the underlying practical_sessions rows —
// a student's completed titration data is preserved either way.
router.delete('/:id', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM assignments WHERE id = $1 AND teacher_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found, or you do not have permission to delete it.' });
    }

    return res.json({ deleted: true });
  } catch (err) {
    console.error('Delete assignment error:', err.message);
    return res.status(500).json({ error: 'Could not delete assignment. Please try again.' });
  }
});

// ── GET /api/assignments/:id/export ─────────────────────────────
// Requires a teacher token, and the assignment must belong to
// them. Returns a CSV of every student's submission for this
// assignment — one row per submission, including their full trial
// readings and calculated answer, not just correct/incorrect.
router.get('/:id/export', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  try {
    const assignmentResult = await pool.query(
      'SELECT id, title FROM assignments WHERE id = $1 AND teacher_id = $2',
      [req.params.id, req.user.id]
    );
    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found, or you do not have permission to export it.' });
    }
    const assignment = assignmentResult.rows[0];

    const rowsResult = await pool.query(
      `SELECT
         s.name AS student_name,
         s.email AS student_email,
         s.form AS student_form,
         ps.titration_type,
         ps.titration_title,
         ps.indicator_used,
         ps.trials_count,
         ps.trial_readings,
         ps.concordant_found,
         ps.true_value,
         ps.student_answer,
         ps.correct,
         ps.mode,
         sub.submitted_at
       FROM assignment_submissions sub
       JOIN students s ON s.id = sub.student_id
       JOIN practical_sessions ps ON ps.id = sub.session_id
       WHERE sub.assignment_id = $1
       ORDER BY s.name ASC`,
      [req.params.id]
    );

    // Build CSV manually rather than pulling in a dependency —
    // the column set is small and fixed, so a hand-rolled escaper
    // is simpler than adding a library for this one endpoint.
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = [
      'Student Name', 'Email', 'Form', 'Titration Type', 'Titration Title',
      'Indicator', 'Trials Count', 'Trial Readings (cm3)', 'Concordant Found',
      'True Concentration (mol/dm3)', 'Student Answer (mol/dm3)', 'Correct',
      'Mode', 'Submitted At'
    ];

    const lines = [headers.map(escapeCsv).join(',')];
    rowsResult.rows.forEach(row => {
      const readings = Array.isArray(row.trial_readings)
        ? row.trial_readings.map(r => Number(r).toFixed(2)).join(' | ')
        : '';
      lines.push([
        row.student_name,
        row.student_email,
        row.student_form,
        row.titration_type,
        row.titration_title,
        row.indicator_used,
        row.trials_count,
        readings,
        row.concordant_found ? 'Yes' : 'No',
        row.true_value,
        row.student_answer,
        row.correct ? 'Yes' : 'No',
        row.mode,
        row.submitted_at ? new Date(row.submitted_at).toISOString() : ''
      ].map(escapeCsv).join(','));
    });

    const csv = lines.join('\r\n');
    const safeFilename = assignment.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}_results.csv"`);
    return res.send(csv);
  } catch (err) {
    console.error('Export assignment error:', err.message);
    return res.status(500).json({ error: 'Could not export results. Please try again.' });
  }
});
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

module.exports = router;

// ============================================================
//  VirtuLab Kenya — Assignment Routes
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { validateAssignmentCreate } = require('../middleware/validators');
const assignmentRepo = require('../repositories/assignmentRepo');
const { sendCsv, toCsvRow } = require('../utils/csv');
const pushService = require('../services/pushNotificationService');

const router = express.Router();

function getCsvConfigForAssignment(assignment, rows) {
  const type = assignment.titration_type || 'acidBase';

  if (type === 'qualitative') {
    const headers = [
      'Student Name', 'Email', 'Form', 'Salt Key', 'Salt Name',
      'Student Cation', 'Student Anion', 'Cation Correct', 'Anion Correct',
      'Tests Performed', 'Tests Correct', 'Overall Correct', 'Status', 'Teacher Feedback', 'Submitted At'
    ];
    const dataRows = rows.map(r => [
      r.student_name, r.student_email, r.student_form, r.salt_key || '—', r.salt_name || '—',
      r.student_cation || '—', r.student_anion || '—', r.cation_correct ? 'Yes' : 'No', r.anion_correct ? 'Yes' : 'No',
      r.q_tests_performed ?? 0, r.q_tests_correct ?? 0, r.correct ? 'Yes' : 'No', r.submission_status || 'submitted',
      r.teacher_feedback || '', r.submitted_at ? new Date(r.submitted_at).toISOString() : ''
    ]);
    return { headers, dataRows };
  }

  if (type === 'organic') {
    const headers = [
      'Student Name', 'Email', 'Form', 'Sample Key', 'Sample Name',
      'Identified Functional Group', 'Functional Group Correct',
      'Tests Performed', 'Tests Correct', 'Overall Correct', 'Status', 'Teacher Feedback', 'Submitted At'
    ];
    const dataRows = rows.map(r => [
      r.student_name, r.student_email, r.student_form, r.compound_key || '—', r.compound_name || '—',
      r.student_functional_group || '—', r.functional_group_correct ? 'Yes' : 'No',
      r.o_tests_performed ?? 0, r.o_tests_correct ?? 0, r.correct ? 'Yes' : 'No', r.submission_status || 'submitted',
      r.teacher_feedback || '', r.submitted_at ? new Date(r.submitted_at).toISOString() : ''
    ]);
    return { headers, dataRows };
  }

  if (type === 'solubility') {
    const headers = [
      'Student Name', 'Email', 'Form', 'Solute', 'Crystallization Temp (°C)', 'Theoretical Temp (°C)',
      'Temp Difference (°C)', 'Accuracy Mark (2.0)', 'Graph Mark (3.0)', 'Total Score (5.0)',
      'Result', 'Status', 'Teacher Feedback', 'Submitted At'
    ];
    const dataRows = rows.map(r => [
      r.student_name, r.student_email, r.student_form, r.solute_name || r.solute_key || '—',
      r.crystallization_temp ?? '', r.theoretical_temp ?? '', r.temp_difference ?? '',
      r.sol_accuracy_score ?? 0, r.sol_graph_score ?? 0, r.sol_total_score ?? 0,
      r.correct ? 'Pass' : 'Review Needed', r.submission_status || 'submitted',
      r.teacher_feedback || '', r.submitted_at ? new Date(r.submitted_at).toISOString() : ''
    ]);
    return { headers, dataRows };
  }

  if (type === 'energy' || type === 'displacement' || type === 'neutralization' || type === 'solution' || type === 'combustion') {
    const headers = [
      'Student Name', 'Email', 'Form', 'System Name', 'Category', 'Initial Temp (°C)', 'Final Temp (°C)',
      'Temp Change (°C)', 'Heat Quantity Q (J)', 'Moles (mol)', 'Molar Enthalpy ΔH (kJ/mol)', 'Theoretical ΔH (kJ/mol)',
      'Total Score (15.0)', 'Result', 'Status', 'Teacher Feedback', 'Submitted At'
    ];
    const dataRows = rows.map(r => [
      r.student_name, r.student_email, r.student_form, r.en_system_name || r.en_system_id || '—', r.en_category || '—',
      r.en_initial_temp ?? '', r.en_final_temp ?? '', r.en_temp_change ?? '', r.en_heat_quantity ?? '',
      r.en_moles ?? '', r.en_molar_enthalpy ?? '', r.theoretical_enthalpy ?? '',
      r.en_total_score ?? 0, r.correct ? 'Pass' : 'Review Needed', r.submission_status || 'submitted',
      r.teacher_feedback || '', r.submitted_at ? new Date(r.submitted_at).toISOString() : ''
    ]);
    return { headers, dataRows };
  }

  if (type === 'rates' || type === 'kinetics') {
    const headers = [
      'Student Name', 'Email', 'Form', 'Experiment Type', 'Table Score (5.0)', 'Graph Score (4.0)',
      'Calculation Score (6.0)', 'Total Score (15.0)', 'KNEC Grade', 'Result', 'Status', 'Teacher Feedback', 'Submitted At'
    ];
    const dataRows = rows.map(r => [
      r.student_name, r.student_email, r.student_form, r.rate_exp_title || r.rate_exp_type || '—',
      r.rate_table_score ?? 0, r.rate_graph_score ?? 0, r.rate_calc_score ?? 0, r.rate_total_score ?? 0,
      r.rate_grade || '—', r.correct ? 'Pass' : 'Review Needed', r.submission_status || 'submitted',
      r.teacher_feedback || '', r.submitted_at ? new Date(r.submitted_at).toISOString() : ''
    ]);
    return { headers, dataRows };
  }

  if (type === 'gas' || type === 'gasPrep') {
    const headers = [
      'Student Name', 'Email', 'Form', 'Gas Key', 'Gas Name', 'Drying Agent', 'Collection Method',
      'Drying Correct', 'Collection Correct', 'Tests Performed', 'Tests Correct', 'Total Score (10.0)',
      'Result', 'Status', 'Teacher Feedback', 'Submitted At'
    ];
    const dataRows = rows.map(r => [
      r.student_name, r.student_email, r.student_form, r.gas_key || '—', r.gas_name || '—',
      r.gas_drying_agent || '—', r.gas_collection_method || '—', r.gas_drying_correct ? 'Yes' : 'No',
      r.gas_collection_correct ? 'Yes' : 'No', r.gas_tests_performed ?? 0, r.gas_tests_correct ?? 0,
      r.gas_total_score ?? 0, r.correct ? 'Pass' : 'Review Needed', r.submission_status || 'submitted',
      r.teacher_feedback || '', r.submitted_at ? new Date(r.submitted_at).toISOString() : ''
    ]);
    return { headers, dataRows };
  }

  if (type === 'kcseComposite') {
    const headers = [
      'Student Name', 'Email', 'Form', 'Exam Title', 'Q1 Titration (15.0)', 'Q2 Salt Analysis (15.0)',
      'Q3 Organic Analysis (10.0)', 'Total Score (40.0)', 'KNEC Grade', 'Result', 'Status', 'Teacher Feedback', 'Submitted At'
    ];
    const dataRows = rows.map(r => [
      r.student_name, r.student_email, r.student_form, r.exam_title || 'KCSE Chemistry Paper 3 Mock',
      r.q1_score ?? 0, r.q2_score ?? 0, r.q3_score ?? 0, r.composite_total_score ?? 0,
      r.composite_grade || '—', r.correct ? 'Pass' : 'Review Needed', r.submission_status || 'submitted',
      r.teacher_feedback || '', r.submitted_at ? new Date(r.submitted_at).toISOString() : ''
    ]);
    return { headers, dataRows };
  }

  // Default: Volumetric Titrations
  const headers = [
    'Student Name', 'Email', 'Form', 'Titration Type', 'Titration Title',
    'Indicator', 'Trials Count', 'Trial Readings (cm3)', 'Concordant Found',
    'True Concentration (mol/dm3)', 'Student Answer (mol/dm3)', 'Correct',
    'Mode', 'Status', 'Teacher Feedback', 'Submitted At'
  ];
  const dataRows = rows.map(row => {
    let readings = '';
    if (Array.isArray(row.trial_readings)) {
      readings = row.trial_readings.map(v => Number(v).toFixed(2)).join(' | ');
    } else if (row.trial_readings && Array.isArray(row.trial_readings.readings)) {
      readings = row.trial_readings.readings.map(v => Number(v).toFixed(2)).join(' | ');
    }
    return [
      row.student_name, row.student_email, row.student_form,
      row.titration_type || type, row.titration_title || '—', row.indicator_used || '—',
      row.trials_count ?? 0, readings, row.concordant_found ? 'Yes' : 'No',
      row.true_value ?? '', row.student_answer ?? '', row.correct ? 'Yes' : 'No',
      row.practical_mode || 'assignment', row.submission_status || 'submitted',
      row.teacher_feedback || '', row.submitted_at ? new Date(row.submitted_at).toISOString() : ''
    ];
  });
  return { headers, dataRows };
}

const pool = require('../db/pool');
const { withTransaction } = require('../db/transaction');

// POST /api/assignments — Create an assignment (teacher or admin) with atomic transaction
router.post('/', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), validateAssignmentCreate, asyncHandler(async (req, res) => {
  let pushData = null;

  let assignment;
  try {
    assignment = await withTransaction(async (client) => {
      const newAssign = await assignmentRepo.createAssignment(req.user.id, req.body, client, req.user.role);
      if (!newAssign) {
        const err = new Error('Teacher or school account not found.');
        err.statusCode = 404;
        throw err;
      }

      // Auto-notify all students enrolled under this teacher (or school if admin) inside same transaction
      const studentsRes = await client.query(
        req.user.role === 'admin'
          ? 'SELECT id FROM students WHERE ($1::int IS NULL OR school_id = $1)'
          : 'SELECT id FROM students WHERE teacher_id = $1',
        [req.user.role === 'admin' ? newAssign.school_id : req.user.id]
      );
      if (studentsRes.rows.length > 0) {
        const dueFormatted = newAssign.due_date ? new Date(newAssign.due_date).toLocaleDateString() : 'No deadline';
        const title = `📝 New Assignment: ${newAssign.title}`;
        const message = `Your chemistry instructor posted a new practical assignment: "${newAssign.title}". Due date: ${dueFormatted}.`;
        const studentIds = studentsRes.rows.map(s => s.id);
        await client.query(
          `INSERT INTO student_notifications (student_id, title, message, type, link)
           SELECT unnest($1::int[]), $2, $3, 'assignment', '/student/home.html'`,
          [studentIds, title, message]
        );
        pushData = { studentIds, title, message };
      }

      return newAssign;
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    throw err;
  }

  // Dispatch Web Push notification outside transaction (network call should not block DB transaction)
  if (pushData && pushData.studentIds.length > 0) {
    pushService.sendToUsers(pushData.studentIds, 'student', {
      title: pushData.title,
      body: pushData.message,
      data: { url: '/student/home.html' }
    }).catch(err => console.warn('[Assignment Push Warning]:', err.message));
  }

  return res.status(201).json({ assignment });
}));

// POST /api/assignments/:id/remind — Teacher/Admin sends due date reminder to unsubmitted students
router.post('/:id/remind', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;
  const teacherId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  // Verify assignment ownership
  const aRes = await pool.query(
    'SELECT * FROM assignments WHERE id = $1 AND (teacher_id = $2 OR teacher_id IS NULL OR $3 = true)',
    [assignmentId, teacherId, isAdmin]
  );
  if (aRes.rows.length === 0) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }
  const assignment = aRes.rows[0];

  // Find all students under this teacher (or school for admin / school-wide assignment) who haven't submitted yet
  const unsubmittedRes = await pool.query(
    `SELECT s.id, s.name, s.email
     FROM students s
     WHERE (${assignment.teacher_id ? 's.teacher_id = $1' : '($2 = true OR s.school_id = $3 OR $3 IS NULL)'})
       AND s.id NOT IN (
         SELECT sub.student_id FROM assignment_submissions sub WHERE sub.assignment_id = $4
         UNION
         SELECT ps.student_id FROM practical_sessions ps WHERE ps.assignment_id = $4
         UNION
         SELECT qs.student_id FROM qualitative_sessions qs WHERE qs.assignment_id = $4
         UNION
         SELECT os.student_id FROM organic_sessions os WHERE os.assignment_id = $4
         UNION
         SELECT cs.student_id FROM composite_sessions cs WHERE cs.assignment_id = $4
         UNION
         SELECT ss.student_id FROM solubility_sessions ss WHERE ss.assignment_id = $4
         UNION
         SELECT es.student_id FROM energy_sessions es WHERE es.assignment_id = $4
         UNION
         SELECT rs.student_id FROM rates_sessions rs WHERE rs.assignment_id = $4
         UNION
         SELECT gs.student_id FROM gas_sessions gs WHERE gs.assignment_id = $4
       )`,
    [assignment.teacher_id || teacherId, isAdmin, assignment.school_id, assignmentId]
  );

  const dueFormatted = assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'Soon';
  const unsubmittedIds = unsubmittedRes.rows.map(s => s.id);
  const notifiedCount = unsubmittedIds.length;

  if (notifiedCount > 0) {
    const title = `⏱️ Reminder: "${assignment.title}" Due Soon`;
    const message = `Reminder from your chemistry instructor to complete your practical assignment "${assignment.title}". Due date: ${dueFormatted}.`;
    await pool.query(
      `INSERT INTO student_notifications (student_id, title, message, type, link)
       SELECT unnest($1::int[]), $2, $3, 'due_soon', '/student/home.html'`,
      [unsubmittedIds, title, message]
    );
    // Dispatch Web Push notification to unsubmitted students
    pushService.sendToUsers(unsubmittedIds, 'student', {
      title,
      body: message,
      data: { url: '/student/home.html' }
    }).catch(err => console.warn('[Remind Push Warning]:', err.message));
  }

  return res.json({
    success: true,
    message: `Reminder notifications sent to ${notifiedCount} student(s).`,
    notifiedCount,
    studentsNotified: unsubmittedRes.rows.map(s => s.name)
  });
}));

// GET /api/assignments/mine — Student's assignments (or teacher/admin preview)
router.get('/mine', authMiddleware, asyncHandler(async (req, res) => {
  let assignments = [];
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    assignments = await assignmentRepo.getTeacherAssignments(req.user.id, req.user.role);
  } else {
    assignments = await assignmentRepo.getStudentAssignments(req.user.id);
  }
  return res.json({ assignments: assignments || [] });
}));

// GET /api/assignments/teacher — Teacher/Admin's assignments
router.get('/teacher', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const assignments = await assignmentRepo.getTeacherAssignments(req.user.id, req.user.role);
  return res.json({ assignments });
}));

// GET /api/assignments/submissions/all — Teacher/Admin's student submissions
router.get('/submissions/all', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const data = await assignmentRepo.getAllSubmissions(req.user.id, { page, limit }, req.user.role);
  return res.json(data);
}));

// POST /api/assignments/submissions/:id/mark — Teacher/Admin approves & marks submission with atomic transaction
router.post('/submissions/:id/mark', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const { teacherFeedback } = req.body || {};

  let submission;
  try {
    submission = await withTransaction(async (client) => {
      const sub = await assignmentRepo.markSubmission(req.params.id, req.user.id, teacherFeedback, client, req.user.role);
      if (!sub) {
        const err = new Error('Submission not found or access denied.');
        err.statusCode = 404;
        throw err;
      }

      // Notify student of released feedback inside same transaction
      if (sub.student_id) {
        await client.query(
          `INSERT INTO student_notifications (student_id, title, message, type, link)
           VALUES ($1, $2, $3, 'feedback', '/student/home.html')`,
          [
            sub.student_id,
            `🏆 Graded: Practical Feedback Released`,
            `Your chemistry instructor has reviewed and released marks/feedback for your practical assignment.`
          ]
        );
      }

      return sub;
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    throw err;
  }

  return res.json({ success: true, submission });
}));

// PUT /api/assignments/:id — Edit an assignment (teacher creator or admin)
router.put('/:id', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const updated = await assignmentRepo.updateAssignment(req.params.id, req.user.id, req.body, req.user.role);
  if (!updated) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }
  return res.json({ assignment: updated });
}));

// DELETE /api/assignments/:id — Delete an assignment (teacher creator or admin)
router.delete('/:id', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const deleted = await assignmentRepo.deleteAssignment(req.params.id, req.user.id, req.user.role);
  if (!deleted) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }
  return res.json({ success: true, message: 'Assignment deleted successfully.' });
}));

// GET /api/assignments/:id/export — Export CSV of submissions
router.get('/:id/export', authMiddleware, authMiddleware.requireRole(['teacher', 'admin']), asyncHandler(async (req, res) => {
  const data = await assignmentRepo.getAssignmentExportData(req.params.id, req.user.id, req.user.role);
  if (!data) {
    return res.status(404).json({ error: 'Assignment not found or permission denied.' });
  }

  const { headers, dataRows } = getCsvConfigForAssignment(data.assignment, data.rows);
  const headerRow = toCsvRow(headers);
  const formattedRows = dataRows.map(row => toCsvRow(row));
  const filename = `assignment_${data.assignment.id}_submissions.csv`;

  sendCsv(res, filename, headerRow, formattedRows);
}));

module.exports = router;

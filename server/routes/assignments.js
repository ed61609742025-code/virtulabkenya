// ============================================================
//  VirtuLab Kenya — Assignment Routes
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { validateAssignmentCreate } = require('../middleware/validators');
const assignmentRepo = require('../repositories/assignmentRepo');
const { sendCsv, toCsvRow } = require('../utils/csv');

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

// POST /api/assignments — Create an assignment (teacher)
router.post('/', authMiddleware, authMiddleware.requireRole('teacher'), validateAssignmentCreate, asyncHandler(async (req, res) => {
  const assignment = await assignmentRepo.createAssignment(req.user.id, req.body);
  if (!assignment) {
    return res.status(404).json({ error: 'Teacher account not found.' });
  }

  // Auto-notify all students enrolled under this teacher
  try {
    const studentsRes = await pool.query('SELECT id FROM students WHERE teacher_id = $1', [req.user.id]);
    if (studentsRes.rows.length > 0) {
      const dueFormatted = assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No deadline';
      const title = `📝 New Assignment: ${assignment.title}`;
      const message = `Your chemistry teacher posted a new practical assignment: "${assignment.title}". Due date: ${dueFormatted}.`;
      const studentIds = studentsRes.rows.map(s => s.id);
      await pool.query(
        `INSERT INTO student_notifications (student_id, title, message, type, link)
         SELECT unnest($1::int[]), $2, $3, 'assignment', '/student/home.html'`,
        [studentIds, title, message]
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
         UNION
         SELECT gs.student_id FROM gas_sessions gs WHERE gs.assignment_id = $2
       )`,
    [teacherId, assignmentId]
  );

  const dueFormatted = assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'Soon';
  const unsubmittedIds = unsubmittedRes.rows.map(s => s.id);
  const notifiedCount = unsubmittedIds.length;

  if (notifiedCount > 0) {
    const title = `⏱️ Reminder: "${assignment.title}" Due Soon`;
    const message = `Reminder from your teacher to complete your practical assignment "${assignment.title}". Due date: ${dueFormatted}.`;
    await pool.query(
      `INSERT INTO student_notifications (student_id, title, message, type, link)
       SELECT unnest($1::int[]), $2, $3, 'due_soon', '/student/home.html'`,
      [unsubmittedIds, title, message]
    );
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
  if (req.user.role === 'teacher') {
    assignments = await assignmentRepo.getTeacherAssignments(req.user.id);
  } else {
    assignments = await assignmentRepo.getStudentAssignments(req.user.id);
  }
  return res.json({ assignments: assignments || [] });
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

  const { headers, dataRows } = getCsvConfigForAssignment(data.assignment, data.rows);
  const headerRow = toCsvRow(headers);
  const formattedRows = dataRows.map(row => toCsvRow(row));
  const filename = `assignment_${data.assignment.id}_submissions.csv`;

  sendCsv(res, filename, headerRow, formattedRows);
}));

module.exports = router;

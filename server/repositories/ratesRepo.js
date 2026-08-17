// ============================================================
//  VirtuLab Kenya — Reaction Rates & Chemical Kinetics Repository
//  KNEC Chemistry Paper 3 Quantitative Practical Module
// ============================================================

const pool = require('../db/pool');

async function saveRatesSession(data) {
  const {
    studentId,
    assignment_id,
    experiment_type,
    experiment_title,
    dilution_readings,
    table_score,
    graph_score,
    calc_score,
    total_score,
    grade,
    rubric_breakdown,
    answers,
    mode = 'practice'
  } = data;

  const query = `
    INSERT INTO rates_sessions (
      student_id, assignment_id, experiment_type, experiment_title,
      dilution_readings, table_score, graph_score, calc_score,
      total_score, grade, rubric_breakdown, answers, mode
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;

  const values = [
    studentId,
    assignment_id || null,
    experiment_type || 'cross',
    experiment_title || 'Reaction Rates & Chemical Kinetics',
    dilution_readings ? JSON.stringify(dilution_readings) : null,
    table_score || 0,
    graph_score || 0,
    calc_score || 0,
    total_score || 0,
    grade || 'E',
    rubric_breakdown ? JSON.stringify(rubric_breakdown) : null,
    answers ? JSON.stringify(answers) : null,
    mode
  ];

  const result = await pool.query(query, values);
  if (assignment_id && result.rows[0]) {
    await linkAssignmentSubmission(assignment_id, studentId, result.rows[0].id);
  }
  return result.rows[0];
}

async function linkAssignmentSubmission(assignmentId, studentId, sessionId = null) {
  try {
    await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, session_id, status, submitted_at)
       VALUES ($1, $2, $3, 'submitted', NOW())
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET session_id = COALESCE(EXCLUDED.session_id, assignment_submissions.session_id), status = 'submitted', submitted_at = NOW()`,
      [assignmentId, studentId, sessionId]
    );
  } catch (subErr) {
    console.warn('Could not record rates assignment submission:', subErr.message);
  }
}

async function getStudentSessions(studentId) {
  const result = await pool.query(
    `SELECT * FROM rates_sessions
     WHERE student_id = $1
     ORDER BY created_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function getClassRatesSessions(teacherId) {
  const result = await pool.query(
    `SELECT rs.*, s.name AS student_name, s.email AS student_email, s.form AS student_form, a.title AS assignment_title
     FROM rates_sessions rs
     JOIN students s ON s.id = rs.student_id
     LEFT JOIN assignments a ON a.id = rs.assignment_id
     WHERE s.teacher_id = $1
     ORDER BY rs.created_at DESC`,
    [teacherId]
  );
  return result.rows;
}

module.exports = {
  saveRatesSession,
  getStudentSessions,
  getClassRatesSessions,
  linkAssignmentSubmission
};

// ============================================================
//  VirtuLab Kenya — Solubility Curves Repository
//  KCSE Paper 3 Question 1/2 Solubility & Crystallization Module
// ============================================================

const pool = require('../db/pool');

async function saveSolubilitySession(data) {
  const {
    studentId,
    assignment_id,
    solute_key,
    solute_name,
    experiment_title,
    solute_mass,
    solvent_volume,
    crystallization_temp,
    theoretical_temp,
    temp_difference,
    accuracy_score,
    graph_score,
    total_score,
    trials_data,
    mode = 'selfPaced'
  } = data;

  const query = `
    INSERT INTO solubility_sessions (
      student_id, assignment_id, solute_key, solute_name, experiment_title,
      solute_mass, solvent_volume, crystallization_temp, theoretical_temp, temp_difference,
      accuracy_score, graph_score, total_score, trials_data, mode
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `;

  const values = [
    studentId,
    assignment_id || null,
    solute_key,
    solute_name || solute_key,
    experiment_title || 'Solubility Curve Determination',
    solute_mass || 0,
    solvent_volume || 0,
    crystallization_temp || 0,
    theoretical_temp || 0,
    temp_difference || 0,
    accuracy_score || 0,
    graph_score || 0,
    total_score || 0,
    trials_data ? JSON.stringify(trials_data) : null,
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
    console.warn('Could not record solubility assignment submission:', subErr.message);
  }
}

async function getStudentSessions(studentId) {
  const result = await pool.query(
    `SELECT * FROM solubility_sessions
     WHERE student_id = $1
     ORDER BY created_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function getClassSolubilitySessions(teacherId) {
  const result = await pool.query(
    `SELECT ss.*, s.name AS student_name, s.email AS student_email, s.form AS student_form, a.title AS assignment_title
     FROM solubility_sessions ss
     JOIN students s ON s.id = ss.student_id
     LEFT JOIN assignments a ON a.id = ss.assignment_id
     WHERE s.teacher_id = $1
     ORDER BY ss.created_at DESC`,
    [teacherId]
  );
  return result.rows;
}

module.exports = {
  saveSolubilitySession,
  getStudentSessions,
  getClassSolubilitySessions,
  linkAssignmentSubmission
};

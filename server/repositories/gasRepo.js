// ============================================================
//  VirtuLab Kenya — Gas Preparation & Collection Repository
//  KNEC Chemistry Paper 3 Inorganic Practical Module
// ============================================================

const pool = require('../db/pool');

async function saveGasSession(data) {
  const {
    studentId,
    assignment_id,
    gas_key,
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
  } = data;

  const query = `
    INSERT INTO gas_sessions (
      student_id, assignment_id, gas_key, gas_name, reactants,
      drying_agent, collection_method, drying_correct, collection_correct,
      tests_performed, tests_correct, test_observations, questions_score,
      total_score, rubric_breakdown, correct, mode, duration_seconds
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `;

  const values = [
    studentId,
    assignment_id || null,
    gas_key || 'O2',
    gas_name || 'Oxygen Gas (O2)',
    reactants || '',
    drying_agent || '',
    collection_method || '',
    !!drying_correct,
    !!collection_correct,
    tests_performed || 0,
    tests_correct || 0,
    test_observations ? JSON.stringify(test_observations) : null,
    questions_score || 0,
    total_score || 0,
    rubric_breakdown ? JSON.stringify(rubric_breakdown) : null,
    !!correct,
    mode,
    duration_seconds || 0
  ];

  const result = await pool.query(query, values);
  if (assignment_id && result.rows[0]) {
    await linkAssignmentSubmission({ assignmentId: assignment_id, studentId, gasSessionId: result.rows[0].id });
  }
  return result.rows[0];
}

const { linkAssignmentSubmission } = require('./assignmentRepo');

async function getStudentSessions(studentId) {
  const result = await pool.query(
    `SELECT * FROM gas_sessions
     WHERE student_id = $1
     ORDER BY created_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function getClassGasSessions(teacherId) {
  const result = await pool.query(
    `SELECT gs.*, s.name AS student_name, s.email AS student_email, s.form AS student_form, a.title AS assignment_title
     FROM gas_sessions gs
     JOIN students s ON s.id = gs.student_id
     LEFT JOIN assignments a ON a.id = gs.assignment_id
     WHERE s.teacher_id = $1
     ORDER BY gs.created_at DESC`,
    [teacherId]
  );
  return result.rows;
}

module.exports = {
  saveGasSession,
  getStudentSessions,
  getClassGasSessions,
  linkAssignmentSubmission
};

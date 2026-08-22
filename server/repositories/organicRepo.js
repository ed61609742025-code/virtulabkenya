const pool = require('../db/pool');

async function saveOrganicSession(data) {
  const {
    student_id,
    assignment_id,
    compound_key,
    compound_name,
    true_functional_group,
    student_functional_group,
    fg_correct,
    tests_performed,
    tests_correct,
    questions_total,
    questions_correct,
    score_pct,
    observations,
    overall_correct,
    mode
  } = data;

  const query = `
    INSERT INTO organic_sessions (
      student_id, assignment_id, compound_key, compound_name,
      true_functional_group, student_functional_group, functional_group_correct,
      tests_performed, tests_correct, questions_total, questions_correct,
      score_pct, observations, correct, mode
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `;

  const values = [
    student_id,
    assignment_id || null,
    compound_key,
    compound_name || compound_key,
    true_functional_group,
    student_functional_group,
    fg_correct,
    tests_performed,
    tests_correct,
    questions_total,
    questions_correct,
    score_pct,
    JSON.stringify(observations),
    overall_correct,
    mode
  ];

  const result = await pool.query(query, values);
  if (assignment_id && result.rows[0]) {
    await linkAssignmentSubmission({ assignmentId: assignment_id, studentId: student_id, organicSessionId: result.rows[0].id });
  }
  return result.rows[0];
}

const { linkAssignmentSubmission } = require('./assignmentRepo');

async function getStudentSessions(studentId) {
  const result = await pool.query(
    'SELECT * FROM organic_sessions WHERE student_id = $1 ORDER BY created_at DESC',
    [studentId]
  );
  return result.rows;
}

async function getClassSessions(teacherId) {
  const result = await pool.query(`
    SELECT os.*, s.name AS student_name, s.form AS student_form
    FROM organic_sessions os
    JOIN students s ON os.student_id = s.id
    WHERE s.teacher_id = $1
    ORDER BY os.created_at DESC
    LIMIT 50
  `, [teacherId]);

  return result.rows;
}

module.exports = {
  saveOrganicSession,
  linkAssignmentSubmission,
  getStudentSessions,
  getClassSessions
};

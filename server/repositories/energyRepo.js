// ============================================================
//  VirtuLab Kenya — Energy Changes / Thermochemistry Repository
//  KNEC Chemistry Paper 3 Quantitative Practical Module
// ============================================================

const pool = require('../db/pool');

async function saveEnergySession(data) {
  const {
    studentId,
    assignment_id,
    system_id,
    system_name,
    reaction_category,
    initial_temp,
    final_temp,
    temp_change,
    heat_quantity,
    moles,
    molar_enthalpy,
    theoretical_enthalpy,
    total_score,
    rubric_breakdown,
    readings_data,
    equation_text,
    mode = 'practice'
  } = data;

  const query = `
    INSERT INTO energy_sessions (
      student_id, assignment_id, system_id, system_name, reaction_category,
      initial_temp, final_temp, temp_change, heat_quantity, moles,
      molar_enthalpy, theoretical_enthalpy, total_score, rubric_breakdown,
      readings_data, equation_text, mode
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *
  `;

  const values = [
    studentId,
    assignment_id || null,
    system_id,
    system_name || system_id,
    reaction_category || 'thermochemistry',
    initial_temp || 0,
    final_temp || 0,
    temp_change || 0,
    heat_quantity || 0,
    moles || 0,
    molar_enthalpy || 0,
    theoretical_enthalpy || 0,
    total_score || 0,
    rubric_breakdown ? JSON.stringify(rubric_breakdown) : null,
    readings_data ? JSON.stringify(readings_data) : null,
    equation_text || null,
    mode
  ];

  const result = await pool.query(query, values);
  if (assignment_id && result.rows[0]) {
    await linkAssignmentSubmission({ assignmentId: assignment_id, studentId, energySessionId: result.rows[0].id });
  }
  return result.rows[0];
}

const { linkAssignmentSubmission } = require('./assignmentRepo');

async function getStudentSessions(studentId) {
  const result = await pool.query(
    `SELECT * FROM energy_sessions
     WHERE student_id = $1
     ORDER BY created_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function getClassEnergySessions(teacherId) {
  const result = await pool.query(
    `SELECT es.*, s.name AS student_name, s.email AS student_email, s.form AS student_form, a.title AS assignment_title
     FROM energy_sessions es
     JOIN students s ON s.id = es.student_id
     LEFT JOIN assignments a ON a.id = es.assignment_id
     WHERE s.teacher_id = $1
     ORDER BY es.created_at DESC`,
    [teacherId]
  );
  return result.rows;
}

module.exports = {
  saveEnergySession,
  getStudentSessions,
  getClassEnergySessions,
  linkAssignmentSubmission
};

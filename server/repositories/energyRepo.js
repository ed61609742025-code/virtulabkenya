// ============================================================
//  VirtuLab Kenya — Energy Changes / Thermochemistry Repository
//  KNEC Chemistry Paper 3 Quantitative Practical Module
// ============================================================

const pool = require('../db/pool');

let energyTableEnsured = false;
async function ensureEnergyTable() {
  if (energyTableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS energy_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        system_id VARCHAR(100) NOT NULL,
        system_name VARCHAR(200),
        reaction_category VARCHAR(50),
        initial_temp DECIMAL(6,2),
        final_temp DECIMAL(6,2),
        temp_change DECIMAL(6,2),
        heat_quantity DECIMAL(10,2),
        moles DECIMAL(10,4),
        molar_enthalpy DECIMAL(10,2),
        theoretical_enthalpy DECIMAL(10,2),
        total_score DECIMAL(5,2) DEFAULT 0.0,
        rubric_breakdown JSONB,
        readings_data JSONB,
        equation_text TEXT,
        mode VARCHAR(20) DEFAULT 'practice',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_energy_sessions_student_id ON energy_sessions(student_id);
    `);
    energyTableEnsured = true;
  } catch (err) {
    console.warn('[energyRepo] ensureEnergyTable note:', err.message);
  }
}

async function saveEnergySession(data) {
  await ensureEnergyTable();
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
  await ensureEnergyTable();
  try {
    const result = await pool.query(
      `SELECT * FROM energy_sessions
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[energyRepo.getStudentSessions] Query note:', err.message);
    return [];
  }
}

async function getClassEnergySessions(teacherId) {
  await ensureEnergyTable();
  try {
    const result = await pool.query(
      `SELECT es.*, s.name AS student_name, s.email AS student_email, s.form AS student_form, a.title AS assignment_title
       FROM energy_sessions es
       JOIN students s ON s.id = es.student_id
       LEFT JOIN assignments a ON a.id = es.assignment_id
       WHERE s.teacher_id = $1
       ORDER BY es.created_at DESC`,
      [teacherId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[energyRepo.getClassEnergySessions] Query note:', err.message);
    return [];
  }
}

module.exports = {
  saveEnergySession,
  getStudentSessions,
  getClassEnergySessions,
  linkAssignmentSubmission
};

// ============================================================
//  VirtuLab Kenya — Solubility Curves Repository
//  KCSE Paper 3 Question 1/2 Solubility & Crystallization Module
// ============================================================

const pool = require('../db/pool');

let solubilityTableEnsured = false;
async function ensureSolubilityTable() {
  if (solubilityTableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS solubility_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        solute_key VARCHAR(50) NOT NULL,
        solute_name VARCHAR(150),
        experiment_title VARCHAR(200),
        solute_mass DECIMAL(6,2),
        solvent_volume DECIMAL(6,2),
        crystallization_temp DECIMAL(6,2),
        theoretical_temp DECIMAL(6,2),
        temp_difference DECIMAL(6,2),
        accuracy_score DECIMAL(5,2) DEFAULT 0.0,
        graph_score DECIMAL(5,2) DEFAULT 0.0,
        total_score DECIMAL(5,2) DEFAULT 0.0,
        trials_data JSONB,
        mode VARCHAR(20) DEFAULT 'selfPaced',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_solubility_sessions_student_id ON solubility_sessions(student_id);
    `);
    solubilityTableEnsured = true;
  } catch (err) {
    console.warn('[solubilityRepo] ensureSolubilityTable note:', err.message);
  }
}

async function saveSolubilitySession(data) {
  await ensureSolubilityTable();
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
    await linkAssignmentSubmission({ assignmentId: assignment_id, studentId, solubilitySessionId: result.rows[0].id });
  }
  return result.rows[0];
}

const { linkAssignmentSubmission } = require('./assignmentRepo');

async function getStudentSessions(studentId) {
  await ensureSolubilityTable();
  try {
    const result = await pool.query(
      `SELECT * FROM solubility_sessions
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[solubilityRepo.getStudentSessions] Query note:', err.message);
    return [];
  }
}

async function getClassSolubilitySessions(teacherId) {
  await ensureSolubilityTable();
  try {
    const result = await pool.query(
      `SELECT ss.*, s.name AS student_name, s.email AS student_email, s.form AS student_form, a.title AS assignment_title
       FROM solubility_sessions ss
       JOIN students s ON s.id = ss.student_id
       LEFT JOIN assignments a ON a.id = ss.assignment_id
       WHERE s.teacher_id = $1
       ORDER BY ss.created_at DESC`,
      [teacherId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[solubilityRepo.getClassSolubilitySessions] Query note:', err.message);
    return [];
  }
}

module.exports = {
  saveSolubilitySession,
  getStudentSessions,
  getClassSolubilitySessions,
  linkAssignmentSubmission
};

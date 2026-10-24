// ============================================================
//  VirtuLab Kenya — Gas Preparation & Collection Repository
//  KNEC Chemistry Paper 3 Inorganic Practical Module
// ============================================================

const pool = require('../db/pool');

let gasTableEnsured = false;
async function ensureGasTable() {
  if (gasTableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gas_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        gas_key VARCHAR(50) NOT NULL,
        gas_name VARCHAR(150),
        reactants VARCHAR(200),
        drying_agent VARCHAR(100),
        collection_method VARCHAR(100),
        drying_correct BOOLEAN DEFAULT FALSE,
        collection_correct BOOLEAN DEFAULT FALSE,
        tests_performed INTEGER DEFAULT 0,
        tests_correct INTEGER DEFAULT 0,
        test_observations JSONB,
        questions_score DECIMAL(5,2) DEFAULT 0.0,
        total_score DECIMAL(5,2) DEFAULT 0.0,
        rubric_breakdown JSONB,
        correct BOOLEAN DEFAULT FALSE,
        mode VARCHAR(20) DEFAULT 'selfPaced',
        duration_seconds INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_gas_sessions_student_id ON gas_sessions(student_id);
      CREATE INDEX IF NOT EXISTS idx_gas_sessions_gas_key ON gas_sessions(gas_key);
    `);
    gasTableEnsured = true;
  } catch (err) {
    console.warn('[gasRepo] ensureGasTable note:', err.message);
  }
}

async function saveGasSession(data) {
  await ensureGasTable();
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
  await ensureGasTable();
  try {
    const result = await pool.query(
      `SELECT * FROM gas_sessions
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[gasRepo.getStudentSessions] Query note:', err.message);
    return [];
  }
}

async function getClassGasSessions(teacherId) {
  await ensureGasTable();
  try {
    const result = await pool.query(
      `SELECT gs.*, s.name AS student_name, s.email AS student_email, s.form AS student_form, a.title AS assignment_title
       FROM gas_sessions gs
       JOIN students s ON s.id = gs.student_id
       LEFT JOIN assignments a ON a.id = gs.assignment_id
       WHERE s.teacher_id = $1
       ORDER BY gs.created_at DESC`,
      [teacherId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[gasRepo.getClassGasSessions] Query note:', err.message);
    return [];
  }
}

module.exports = {
  saveGasSession,
  getStudentSessions,
  getClassGasSessions,
  linkAssignmentSubmission
};

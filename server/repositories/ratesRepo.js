// ============================================================
//  VirtuLab Kenya — Reaction Rates & Chemical Kinetics Repository
//  KNEC Chemistry Paper 3 Quantitative Practical Module
// ============================================================

const pool = require('../db/pool');

let ratesTableEnsured = false;
async function ensureRatesTable() {
  if (ratesTableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rates_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        experiment_type VARCHAR(50) NOT NULL,
        experiment_title VARCHAR(200),
        dilution_readings JSONB,
        table_score DECIMAL(5,2) DEFAULT 0.0,
        graph_score DECIMAL(5,2) DEFAULT 0.0,
        calc_score DECIMAL(5,2) DEFAULT 0.0,
        total_score DECIMAL(5,2) DEFAULT 0.0,
        grade VARCHAR(20),
        rubric_breakdown JSONB,
        answers JSONB,
        mode VARCHAR(20) DEFAULT 'practice',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_rates_sessions_student_id ON rates_sessions(student_id);
    `);
    ratesTableEnsured = true;
  } catch (err) {
    console.warn('[ratesRepo] ensureRatesTable note:', err.message);
  }
}

async function saveRatesSession(data) {
  await ensureRatesTable();
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
    await linkAssignmentSubmission({ assignmentId: assignment_id, studentId, ratesSessionId: result.rows[0].id });
  }
  return result.rows[0];
}

const { linkAssignmentSubmission } = require('./assignmentRepo');

async function getStudentSessions(studentId) {
  await ensureRatesTable();
  try {
    const result = await pool.query(
      `SELECT * FROM rates_sessions
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[ratesRepo.getStudentSessions] Query note:', err.message);
    return [];
  }
}

async function getClassRatesSessions(teacherId) {
  await ensureRatesTable();
  try {
    const result = await pool.query(
      `SELECT rs.*, s.name AS student_name, s.email AS student_email, s.form AS student_form, a.title AS assignment_title
       FROM rates_sessions rs
       JOIN students s ON s.id = rs.student_id
       LEFT JOIN assignments a ON a.id = rs.assignment_id
       WHERE s.teacher_id = $1
       ORDER BY rs.created_at DESC`,
      [teacherId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[ratesRepo.getClassRatesSessions] Query note:', err.message);
    return [];
  }
}

module.exports = {
  saveRatesSession,
  getStudentSessions,
  getClassRatesSessions,
  linkAssignmentSubmission
};

const pool = require('../db/pool');

async function saveQualitativeSession(data) {
  const {
    studentId,
    saltKey,
    saltName,
    trueCation,
    trueAnion,
    studentCation,
    studentAnion,
    cationCorrect,
    anionCorrect,
    testsPerformed,
    testsCorrect,
    observations,
    correct,
    mode = 'selfPaced',
    assignmentId = null
  } = data;

  const result = await pool.query(
    `INSERT INTO qualitative_sessions (
      student_id, assignment_id, salt_key, salt_name, true_cation, true_anion,
      student_cation, student_anion, cation_correct, anion_correct,
      tests_performed, tests_correct, observations, correct, mode
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
      studentId,
      assignmentId || null,
      saltKey,
      saltName || saltKey,
      trueCation,
      trueAnion,
      studentCation,
      studentAnion,
      cationCorrect,
      anionCorrect,
      testsPerformed || 0,
      testsCorrect || 0,
      JSON.stringify(observations || []),
      correct,
      mode
    ]
  );
  if (assignmentId && result.rows[0]) {
    await linkAssignmentSubmission({ assignmentId, studentId, qualitativeSessionId: result.rows[0].id });
  }
  return result.rows[0];
}

const { linkAssignmentSubmission } = require('./assignmentRepo');

async function getStudentSessions(studentId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const countRes = await pool.query(
    'SELECT COUNT(*) FROM qualitative_sessions WHERE student_id = $1',
    [studentId]
  );
  const total = parseInt(countRes.rows[0].count, 10);

  const result = await pool.query(
    `SELECT * FROM qualitative_sessions
     WHERE student_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [studentId, limit, offset]
  );

  return {
    sessions: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

let qualitativeTableEnsured = false;
async function ensureQualitativeTable() {
  if (qualitativeTableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS qualitative_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        salt_key VARCHAR(50) NOT NULL,
        salt_name VARCHAR(150),
        true_cation VARCHAR(20),
        true_anion VARCHAR(20),
        student_cation VARCHAR(20),
        student_anion VARCHAR(20),
        cation_correct BOOLEAN DEFAULT FALSE,
        anion_correct BOOLEAN DEFAULT FALSE,
        tests_performed INTEGER DEFAULT 0,
        tests_correct INTEGER DEFAULT 0,
        observations JSONB,
        correct BOOLEAN DEFAULT FALSE,
        mode VARCHAR(20) DEFAULT 'selfPaced',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_qualitative_sessions_student_id ON qualitative_sessions(student_id);
    `);
    qualitativeTableEnsured = true;
  } catch (e) {
    console.warn('[qualitativeRepo] ensureQualitativeTable note:', e.message);
  }
}

async function getClassSessions(teacherId) {
  await ensureQualitativeTable();
  try {
    const result = await pool.query(
      `SELECT qs.*, s.name AS student_name, s.form AS student_form
       FROM qualitative_sessions qs
       JOIN students s ON qs.student_id = s.id
       WHERE s.teacher_id = $1
       ORDER BY qs.created_at DESC
       LIMIT 50`,
      [teacherId]
    );

    return result.rows || [];
  } catch (err) {
    console.warn('[qualitativeRepo] getClassSessions error:', err.message);
    return [];
  }
}

module.exports = {
  saveQualitativeSession,
  linkAssignmentSubmission,
  getStudentSessions,
  getClassSessions
};

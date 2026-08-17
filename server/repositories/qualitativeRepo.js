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
    await linkAssignmentSubmission(assignmentId, studentId, result.rows[0].id);
  }
  return result.rows[0];
}

async function linkAssignmentSubmission(assignmentId, studentId, sessionId = null) {
  try {
    await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, session_id, status, submitted_at)
       VALUES ($1, $2, $3, 'submitted', NOW())
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET session_id = COALESCE(EXCLUDED.session_id, assignment_submissions.session_id), submitted_at = NOW()`,
      [assignmentId, studentId, sessionId]
    );
  } catch (subErr) {
    console.warn('Could not record qualitative assignment submission:', subErr.message);
  }
}

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

async function getClassSessions(teacherId) {
  const teacherResult = await pool.query(
    'SELECT school_id FROM teachers WHERE id = $1',
    [teacherId]
  );
  const schoolId = teacherResult.rows[0] ? teacherResult.rows[0].school_id : null;

  const result = await pool.query(
    `SELECT qs.*, s.name AS student_name, s.form AS student_form
     FROM qualitative_sessions qs
     JOIN students s ON qs.student_id = s.id
     WHERE s.teacher_id = $1 OR s.school_id = $2
     ORDER BY qs.created_at DESC
     LIMIT 50`,
    [teacherId, schoolId]
  );

  return result.rows;
}

module.exports = {
  saveQualitativeSession,
  linkAssignmentSubmission,
  getStudentSessions,
  getClassSessions
};

const pool = require('../db/pool');

async function saveCompositeSession(data) {
  const {
    studentId,
    assignment_id,
    exam_title,
    q1,
    q2,
    q3,
    total,
    grade,
    details,
    duration_seconds
  } = data;

  const result = await pool.query(
    `INSERT INTO composite_sessions
      (student_id, assignment_id, exam_title, q1_score, q2_score, q3_score, total_score, grade, details, duration_seconds)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      studentId,
      assignment_id || null,
      exam_title || 'KCSE Chemistry Paper 3 Practical Exam',
      q1,
      q2,
      q3,
      total,
      grade,
      details ? JSON.stringify(details) : null,
      duration_seconds || 0
    ]
  );
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
    console.warn('Could not record composite assignment submission:', subErr.message);
  }
}

async function getStudentSessions(studentId) {
  const result = await pool.query(
    `SELECT * FROM composite_sessions
     WHERE student_id = $1
     ORDER BY created_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function getTeacherSessions(teacherId) {
  const result = await pool.query(
    `SELECT cs.*,
            s.name AS student_name,
            s.email AS student_email,
            s.form AS student_form,
            a.title AS assignment_title
     FROM composite_sessions cs
     JOIN students s ON s.id = cs.student_id
     LEFT JOIN assignments a ON a.id = cs.assignment_id
     WHERE s.teacher_id = $1
     ORDER BY cs.created_at DESC`,
    [teacherId]
  );
  return result.rows;
}

async function getExportData(assignmentId, teacherId) {
  const assignResult = await pool.query(
    'SELECT id, title FROM assignments WHERE id = $1 AND teacher_id = $2',
    [assignmentId, teacherId]
  );
  if (assignResult.rows.length === 0) return null;

  const result = await pool.query(
    `SELECT cs.*, s.name AS student_name, s.email AS student_email, s.form AS student_form
     FROM composite_sessions cs
     JOIN students s ON s.id = cs.student_id
     WHERE cs.assignment_id = $1
     ORDER BY s.name ASC`,
    [assignmentId]
  );

  return {
    assignment: assignResult.rows[0],
    rows: result.rows
  };
}

module.exports = {
  saveCompositeSession,
  linkAssignmentSubmission,
  getStudentSessions,
  getTeacherSessions,
  getExportData
};

const pool = require('../db/pool');

async function getStudentBadgeData(studentId) {
  const result = await pool.query(
    `SELECT titration_type, correct, concordant_found, trials_count, created_at
     FROM practical_sessions
     WHERE student_id = $1
     ORDER BY created_at ASC`,
    [studentId]
  );
  return result.rows;
}

async function getClassBadgeData(teacherId) {
  const studentsRes = await pool.query(
    'SELECT id, name, form FROM students WHERE teacher_id = $1 ORDER BY name ASC',
    [teacherId]
  );
  const students = studentsRes.rows;

  if (students.length === 0) return [];

  const studentIds = students.map(s => s.id);
  const sessionsRes = await pool.query(
    `SELECT student_id, titration_type, correct, concordant_found, trials_count, created_at
     FROM practical_sessions
     WHERE student_id = ANY($1::int[])
     ORDER BY created_at ASC`,
    [studentIds]
  );

  const sessionsByStudent = new Map();
  sessionsRes.rows.forEach(s => {
    if (!sessionsByStudent.has(s.student_id)) {
      sessionsByStudent.set(s.student_id, []);
    }
    sessionsByStudent.get(s.student_id).push(s);
  });

  return students.map(s => ({
    student: s,
    sessions: sessionsByStudent.get(s.id) || []
  }));
}

module.exports = {
  getStudentBadgeData,
  getClassBadgeData
};

const pool = require('../db/pool');

async function findStudentByEmail(email) {
  const { rows } = await pool.query(
    `SELECT s.*, 'student' AS role, sc.name AS school_name, sc.county
     FROM students s
     LEFT JOIN schools sc ON s.school_id = sc.id
     WHERE s.email = $1`,
    [email]
  );
  return rows[0];
}

async function findTeacherByEmail(email) {
  const { rows } = await pool.query(
    `SELECT t.*, 'teacher' AS role, sc.name AS school_name, sc.county
     FROM teachers t
     LEFT JOIN schools sc ON t.school_id = sc.id
     WHERE t.email = $1`,
    [email]
  );
  return rows[0];
}

async function findStudentById(id) {
  const { rows } = await pool.query(
    `SELECT s.*, 'student' AS role, sc.name AS school_name, sc.county
     FROM students s
     LEFT JOIN schools sc ON s.school_id = sc.id
     WHERE s.id = $1`,
    [id]
  );
  return rows[0];
}

async function findTeacherById(id) {
  const { rows } = await pool.query(
    `SELECT t.*, 'teacher' AS role, sc.name AS school_name, sc.county
     FROM teachers t
     LEFT JOIN schools sc ON t.school_id = sc.id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0];
}

async function createStudent(data) {
  const { rows } = await pool.query(
    `INSERT INTO students (name, email, password_hash, form, school_id, teacher_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, form, school_id, teacher_id, created_at`,
    [data.name, data.email, data.passwordHash, data.form, data.schoolId, data.teacherId]
  );
  return rows[0];
}

async function createTeacher(data) {
  const { rows } = await pool.query(
    `INSERT INTO teachers (name, email, password_hash, school_id, teacher_code)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, school_id, teacher_code, created_at`,
    [data.name, data.email, data.passwordHash, data.schoolId, data.teacherCode]
  );
  return rows[0];
}

async function updatePassword(table, passwordHash, id) {
  // Safe table determination inside code, not from user input
  const tableName = table === 'teachers' ? 'teachers' : 'students';
  const { rows } = await pool.query(
    `UPDATE ${tableName} SET password_hash = $1 WHERE id = $2 RETURNING *`,
    [passwordHash, id]
  );
  return rows[0];
}

async function findSchoolByAdminCode(adminCode) {
  const { rows } = await pool.query('SELECT id FROM schools WHERE admin_code = $1', [adminCode]);
  return rows[0];
}

async function findTeacherByCode(teacherCode) {
  const { rows } = await pool.query('SELECT id, school_id FROM teachers WHERE teacher_code = $1', [teacherCode]);
  return rows[0];
}

async function getClassStudents(teacherId) {
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.email, s.form, s.created_at, COALESCE(s.status, 'active') as status,
            (SELECT COUNT(*) FROM practical_sessions ps WHERE ps.student_id = s.id) AS total_sessions
     FROM students s
     WHERE s.teacher_id = $1
     ORDER BY s.name ASC`,
    [teacherId]
  );
  return rows;
}

module.exports = {
  findStudentByEmail,
  findTeacherByEmail,
  findStudentById,
  findTeacherById,
  createStudent,
  createTeacher,
  updatePassword,
  findSchoolByAdminCode,
  findTeacherByCode,
  getClassStudents
};

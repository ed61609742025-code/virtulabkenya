// ============================================================
//  VirtuLab Kenya — Student, Attendance & Workgroup Repository
// ============================================================

const pool = require('../db/pool');

let tablesEnsured = false;

/**
 * Ensure database tables for Class Attendance and Lab Workgroups exist.
 */
async function ensureStudentTables() {
  if (tablesEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS class_attendance (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
        school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        session_date DATE NOT NULL DEFAULT CURRENT_DATE,
        practical_type VARCHAR(64) DEFAULT 'general',
        status VARCHAR(32) NOT NULL DEFAULT 'present',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_student_attendance UNIQUE (student_id, session_date, practical_type)
      );

      CREATE INDEX IF NOT EXISTS idx_attendance_teacher_date ON class_attendance(teacher_id, session_date);
      CREATE INDEX IF NOT EXISTS idx_attendance_student ON class_attendance(student_id);

      CREATE TABLE IF NOT EXISTS lab_workgroups (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
        school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        form VARCHAR(32) DEFAULT 'Form 4',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lab_workgroup_members (
        id SERIAL PRIMARY KEY,
        workgroup_id INTEGER REFERENCES lab_workgroups(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'Member',
        assigned_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_workgroup_student UNIQUE (workgroup_id, student_id)
      );

      CREATE INDEX IF NOT EXISTS idx_workgroups_teacher ON lab_workgroups(teacher_id);
    `);
    tablesEnsured = true;
  } catch (err) {
    console.warn('[studentRepo] ensureStudentTables note:', err.message);
  }
}

/**
 * Fetch class students with aggregated performance metrics.
 * Supports both teacher and admin roles.
 */
async function getClassStudents(userId, userRole = 'teacher') {
  await ensureStudentTables();
  const isAdmin = userRole === 'admin';

  let query;
  let params;

  if (isAdmin) {
    query = `
      SELECT 
        s.id, s.name, s.email, s.form, s.status, s.created_at, s.school_id, s.teacher_id,
        t.name AS teacher_name,
        COUNT(p.id)::int AS total_sessions,
        COALESCE(ROUND(AVG(CASE WHEN p.correct THEN 100.0 ELSE 0.0 END)), 0)::int AS avg_accuracy,
        MAX(p.created_at) AS last_active
      FROM students s
      LEFT JOIN teachers t ON t.id = s.teacher_id
      LEFT JOIN practical_sessions p ON p.student_id = s.id
      GROUP BY s.id, s.name, s.email, s.form, s.status, s.created_at, s.school_id, s.teacher_id, t.name
      ORDER BY s.name ASC
    `;
    params = [];
  } else {
    query = `
      SELECT 
        s.id, s.name, s.email, s.form, s.status, s.created_at, s.school_id, s.teacher_id,
        COUNT(p.id)::int AS total_sessions,
        COALESCE(ROUND(AVG(CASE WHEN p.correct THEN 100.0 ELSE 0.0 END)), 0)::int AS avg_accuracy,
        MAX(p.created_at) AS last_active
      FROM students s
      LEFT JOIN practical_sessions p ON p.student_id = s.id
      WHERE s.teacher_id = $1
      GROUP BY s.id, s.name, s.email, s.form, s.status, s.created_at, s.school_id, s.teacher_id
      ORDER BY s.name ASC
    `;
    params = [userId];
  }

  const result = await pool.query(query, params);
  return result.rows || [];
}

/**
 * Fetch attendance register for a specific date and practical type.
 */
async function getAttendance(userId, userRole = 'teacher', filters = {}) {
  await ensureStudentTables();
  const isAdmin = userRole === 'admin';
  const sessionDate = filters.date || new Date().toISOString().split('T')[0];
  const practicalType = filters.practicalType || 'general';
  const formFilter = filters.form ? filters.form.trim() : null;

  let studentFilterClause = isAdmin ? '1=1' : 's.teacher_id = $1';
  const params = isAdmin ? [sessionDate, practicalType] : [userId, sessionDate, practicalType];

  if (formFilter) {
    params.push(formFilter);
    studentFilterClause += ` AND s.form = $${params.length}`;
  }

  const dateParamIdx = isAdmin ? 1 : 2;
  const practicalParamIdx = isAdmin ? 2 : 3;

  const query = `
    SELECT 
      s.id AS student_id,
      s.name AS student_name,
      s.email AS student_email,
      s.form,
      s.teacher_id,
      COALESCE(ca.status, 'unrecorded') AS status,
      COALESCE(ca.remarks, '') AS remarks,
      ca.session_date,
      ca.practical_type,
      ca.id AS attendance_id
    FROM students s
    LEFT JOIN class_attendance ca 
      ON ca.student_id = s.id 
      AND ca.session_date = $${dateParamIdx}
      AND ca.practical_type = $${practicalParamIdx}
    WHERE ${studentFilterClause}
    ORDER BY s.name ASC
  `;

  const result = await pool.query(query, params);
  return {
    date: sessionDate,
    practicalType,
    records: result.rows || []
  };
}

/**
 * Save batch attendance records atomically (upsert on duplicate student + date + practicalType).
 */
async function saveAttendanceBatch(userId, userRole = 'teacher', { date, practicalType = 'general', records = [] }) {
  await ensureStudentTables();
  if (!Array.isArray(records) || records.length === 0) {
    return { success: true, savedCount: 0, records: [] };
  }

  const sessionDate = date || new Date().toISOString().split('T')[0];
  const isAdmin = userRole === 'admin';

  // Determine teacher_id and school_id
  let teacherId = null;
  let schoolId = null;

  if (isAdmin) {
    const schoolRes = await pool.query('SELECT id FROM schools LIMIT 1');
    schoolId = schoolRes.rows[0]?.id || null;
  } else {
    const teacherRes = await pool.query('SELECT id, school_id FROM teachers WHERE id = $1', [userId]);
    teacherId = teacherRes.rows[0]?.id || null;
    schoolId = teacherRes.rows[0]?.school_id || null;
  }

  const savedRecords = [];
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const rec of records) {
      const studentId = parseInt(rec.studentId || rec.student_id, 10);
      if (isNaN(studentId)) continue;

      const rawStatus = (rec.status || 'present').toLowerCase().trim();
      const validStatuses = ['present', 'late', 'absent', 'excused'];
      const status = validStatuses.includes(rawStatus) ? rawStatus : 'present';
      const remarks = rec.remarks ? String(rec.remarks).trim() : null;

      const upsertRes = await client.query(
        `INSERT INTO class_attendance (teacher_id, school_id, student_id, session_date, practical_type, status, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (student_id, session_date, practical_type)
         DO UPDATE SET 
           status = EXCLUDED.status,
           remarks = EXCLUDED.remarks,
           teacher_id = COALESCE(EXCLUDED.teacher_id, class_attendance.teacher_id),
           school_id = COALESCE(EXCLUDED.school_id, class_attendance.school_id)
         RETURNING id, student_id, session_date, practical_type, status, remarks`,
        [teacherId, schoolId, studentId, sessionDate, practicalType, status, remarks]
      );

      if (upsertRes.rows[0]) {
        savedRecords.push(upsertRes.rows[0]);
      }
    }

    await client.query('COMMIT');
    return {
      success: true,
      savedCount: savedRecords.length,
      records: savedRecords
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get cumulative attendance summary statistics across practicals.
 */
async function getAttendanceSummary(userId, userRole = 'teacher', filters = {}) {
  await ensureStudentTables();
  const isAdmin = userRole === 'admin';
  const formFilter = filters.form ? filters.form.trim() : null;

  let studentFilterClause = isAdmin ? '1=1' : 's.teacher_id = $1';
  const params = isAdmin ? [] : [userId];

  if (formFilter) {
    params.push(formFilter);
    studentFilterClause += ` AND s.form = $${params.length}`;
  }

  const query = `
    SELECT 
      s.id AS student_id,
      s.name AS student_name,
      s.form,
      COUNT(ca.id)::int AS total_recorded_sessions,
      COUNT(CASE WHEN ca.status = 'present' THEN 1 END)::int AS present_count,
      COUNT(CASE WHEN ca.status = 'late' THEN 1 END)::int AS late_count,
      COUNT(CASE WHEN ca.status = 'absent' THEN 1 END)::int AS absent_count,
      COUNT(CASE WHEN ca.status = 'excused' THEN 1 END)::int AS excused_count,
      CASE 
        WHEN COUNT(ca.id) > 0 THEN 
          ROUND((COUNT(CASE WHEN ca.status IN ('present', 'late') THEN 1 END)::decimal / COUNT(ca.id)::decimal) * 100)::int
        ELSE 100
      END AS attendance_pct
    FROM students s
    LEFT JOIN class_attendance ca ON ca.student_id = s.id
    WHERE ${studentFilterClause}
    GROUP BY s.id, s.name, s.form
    ORDER BY s.name ASC
  `;

  const result = await pool.query(query, params);
  const rows = result.rows || [];

  const totalStudents = rows.length;
  const avgAttendance = totalStudents > 0
    ? Math.round(rows.reduce((acc, r) => acc + (r.attendance_pct || 0), 0) / totalStudents)
    : 100;

  return {
    totalStudents,
    avgAttendance,
    summary: rows
  };
}

/**
 * Fetch all lab workgroups / benches with assigned members.
 */
async function getWorkgroups(userId, userRole = 'teacher', filters = {}) {
  await ensureStudentTables();
  const isAdmin = userRole === 'admin';
  const formFilter = filters.form ? filters.form.trim() : null;

  let whereClause = isAdmin ? '1=1' : '(lw.teacher_id = $1 OR lw.teacher_id IS NULL)';
  const params = isAdmin ? [] : [userId];

  if (formFilter) {
    params.push(formFilter);
    whereClause += ` AND lw.form = $${params.length}`;
  }

  const query = `
    SELECT 
      lw.id,
      lw.name,
      lw.description,
      lw.form,
      lw.teacher_id,
      lw.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'student_id', s.id,
            'student_name', s.name,
            'student_email', s.email,
            'form', s.form,
            'role', lwm.role,
            'assigned_at', lwm.assigned_at
          ) ORDER BY lwm.role = 'Team Lead' DESC, s.name ASC
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS members
    FROM lab_workgroups lw
    LEFT JOIN lab_workgroup_members lwm ON lwm.workgroup_id = lw.id
    LEFT JOIN students s ON s.id = lwm.student_id
    WHERE ${whereClause}
    GROUP BY lw.id, lw.name, lw.description, lw.form, lw.teacher_id, lw.created_at
    ORDER BY lw.name ASC
  `;

  const result = await pool.query(query, params);
  return result.rows || [];
}

/**
 * Create a new lab workgroup with optional members.
 */
async function createWorkgroup(userId, userRole = 'teacher', { name, description = '', form = 'Form 4', members = [] }) {
  await ensureStudentTables();
  const cleanName = (name || '').trim();
  if (!cleanName) {
    throw new Error('Workgroup name is required.');
  }

  const isAdmin = userRole === 'admin';
  let teacherId = null;
  let schoolId = null;

  if (isAdmin) {
    const schoolRes = await pool.query('SELECT id FROM schools LIMIT 1');
    schoolId = schoolRes.rows[0]?.id || null;
  } else {
    const teacherRes = await pool.query('SELECT id, school_id FROM teachers WHERE id = $1', [userId]);
    teacherId = teacherRes.rows[0]?.id || null;
    schoolId = teacherRes.rows[0]?.school_id || null;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const groupRes = await client.query(
      `INSERT INTO lab_workgroups (teacher_id, school_id, name, description, form)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, form, created_at`,
      [teacherId, schoolId, cleanName, description.trim(), form.trim()]
    );
    const group = groupRes.rows[0];

    const insertedMembers = [];
    if (Array.isArray(members) && members.length > 0) {
      for (const m of members) {
        const studentId = parseInt(m.studentId || m.student_id || m.id, 10);
        if (isNaN(studentId)) continue;
        const role = (m.role || 'Member').trim();

        const memRes = await client.query(
          `INSERT INTO lab_workgroup_members (workgroup_id, student_id, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (workgroup_id, student_id) DO UPDATE SET role = EXCLUDED.role
           RETURNING id, student_id, role`,
          [group.id, studentId, role]
        );
        insertedMembers.push(memRes.rows[0]);
      }
    }

    await client.query('COMMIT');
    return { ...group, members: insertedMembers };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update an existing workgroup.
 */
async function updateWorkgroup(workgroupId, userId, userRole = 'teacher', { name, description, form, members }) {
  await ensureStudentTables();
  const isAdmin = userRole === 'admin';
  const id = parseInt(workgroupId, 10);
  if (isNaN(id)) throw new Error('Invalid workgroup ID.');

  const checkQuery = isAdmin
    ? 'SELECT id FROM lab_workgroups WHERE id = $1'
    : 'SELECT id FROM lab_workgroups WHERE id = $1 AND (teacher_id = $2 OR teacher_id IS NULL)';
  const checkParams = isAdmin ? [id] : [id, userId];

  const checkRes = await pool.query(checkQuery, checkParams);
  if (checkRes.rows.length === 0) return null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateRes = await client.query(
      `UPDATE lab_workgroups
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           form = COALESCE($3, form)
       WHERE id = $4
       RETURNING id, name, description, form, created_at`,
      [name ? name.trim() : null, description !== undefined ? description.trim() : null, form ? form.trim() : null, id]
    );

    if (Array.isArray(members)) {
      // Refresh members
      await client.query('DELETE FROM lab_workgroup_members WHERE workgroup_id = $1', [id]);
      for (const m of members) {
        const studentId = parseInt(m.studentId || m.student_id || m.id, 10);
        if (isNaN(studentId)) continue;
        const role = (m.role || 'Member').trim();
        await client.query(
          `INSERT INTO lab_workgroup_members (workgroup_id, student_id, role)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [id, studentId, role]
        );
      }
    }

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Delete a workgroup.
 */
async function deleteWorkgroup(workgroupId, userId, userRole = 'teacher') {
  await ensureStudentTables();
  const isAdmin = userRole === 'admin';
  const id = parseInt(workgroupId, 10);
  if (isNaN(id)) return false;

  const deleteQuery = isAdmin
    ? 'DELETE FROM lab_workgroups WHERE id = $1 RETURNING id'
    : 'DELETE FROM lab_workgroups WHERE id = $1 AND (teacher_id = $2 OR teacher_id IS NULL) RETURNING id';
  const deleteParams = isAdmin ? [id] : [id, userId];

  const result = await pool.query(deleteQuery, deleteParams);
  return result.rows.length > 0;
}

/**
 * Auto-assign students into lab benches/workgroups.
 * Supports configurable bench sizes (e.g., 3-5 students per bench) and automatic role distribution.
 */
async function autoAssignWorkgroups(userId, userRole = 'teacher', { groupSize = 4, form = null, namingPrefix = 'Lab Bench' }) {
  await ensureStudentTables();
  const students = await getClassStudents(userId, userRole);
  const targetStudents = form
    ? students.filter(s => (s.form || '').toLowerCase() === form.toLowerCase())
    : students;

  if (targetStudents.length === 0) {
    throw new Error('No students found to assign into workgroups.');
  }

  const effectiveSize = Math.max(2, Math.min(10, parseInt(groupSize, 10) || 4));
  const numGroups = Math.ceil(targetStudents.length / effectiveSize);

  // Shuffle or order students to balance experience/accuracy
  const poolCopy = [...targetStudents].sort((a, b) => (b.avg_accuracy || 0) - (a.avg_accuracy || 0));

  const createdWorkgroups = [];
  const roles = ['Team Lead', 'Lab Technician', 'Data Recorder', 'Safety Officer', 'Apparatus Manager'];

  for (let g = 0; g < numGroups; g++) {
    const benchNum = g + 1;
    const groupName = `${namingPrefix.trim()} ${benchNum}`;
    const groupDesc = `Practical bench team for ${form || 'Chemistry Practical Class'}`;

    // Select slice of students (snake draft distribution for balance)
    const members = [];
    for (let i = g; i < poolCopy.length; i += numGroups) {
      const student = poolCopy[i];
      const roleIndex = members.length < roles.length ? members.length : roles.length - 1;
      members.push({
        studentId: student.id,
        role: roles[roleIndex]
      });
    }

    const created = await createWorkgroup(userId, userRole, {
      name: groupName,
      description: groupDesc,
      form: form || 'Form 4',
      members
    });
    createdWorkgroups.push(created);
  }

  return {
    totalStudentsAssigned: targetStudents.length,
    groupsCreated: createdWorkgroups.length,
    workgroups: createdWorkgroups
  };
}

module.exports = {
  ensureStudentTables,
  getClassStudents,
  getAttendance,
  saveAttendanceBatch,
  getAttendanceSummary,
  getWorkgroups,
  createWorkgroup,
  updateWorkgroup,
  deleteWorkgroup,
  autoAssignWorkgroups
};

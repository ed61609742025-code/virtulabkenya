const pool = require('../db/pool');

let compositeTableEnsured = false;
async function ensureCompositeTable() {
  if (compositeTableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS composite_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        exam_title VARCHAR(200) DEFAULT 'KCSE Chemistry Paper 3 Practical Exam',
        q1_score DECIMAL(5,2) DEFAULT 0.0,
        q2_score DECIMAL(5,2) DEFAULT 0.0,
        q3_score DECIMAL(5,2) DEFAULT 0.0,
        total_score DECIMAL(5,2) DEFAULT 0.0,
        grade VARCHAR(10) DEFAULT 'E',
        details JSONB,
        duration_seconds INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_composite_sessions_student_id ON composite_sessions(student_id);
    `);
    compositeTableEnsured = true;
  } catch (e) {
    console.warn('[compositeRepo] ensureCompositeTable note:', e.message);
  }
}

async function saveCompositeSession(data) {
  await ensureCompositeTable();
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
    await linkAssignmentSubmission({ assignmentId: assignment_id, studentId, compositeSessionId: result.rows[0].id });
  }
  return result.rows[0];
}

const { linkAssignmentSubmission } = require('./assignmentRepo');

async function getStudentSessions(studentId) {
  await ensureCompositeTable();
  try {
    const result = await pool.query(
      `SELECT * FROM composite_sessions
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    );
    return result.rows || [];
  } catch (err) {
    console.warn('[compositeRepo] getStudentSessions error:', err.message);
    return [];
  }
}

async function getTeacherSessions(teacherId) {
  await ensureCompositeTable();
  try {
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
    return result.rows || [];
  } catch (err) {
    console.warn('[compositeRepo] getTeacherSessions error:', err.message);
    return [];
  }
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

async function getSessionById(sessionId, userId, userRole) {
  await ensureCompositeTable();
  try {
    let query, params;
    if (userRole === 'teacher') {
      query = `SELECT cs.*,
                      s.name AS student_name,
                      s.email AS student_email,
                      s.form AS student_form,
                      a.title AS assignment_title
               FROM composite_sessions cs
               JOIN students s ON s.id = cs.student_id
               LEFT JOIN assignments a ON a.id = cs.assignment_id
               WHERE cs.id = $1 AND s.teacher_id = $2`;
      params = [sessionId, userId];
    } else {
      query = `SELECT cs.*,
                      s.name AS student_name,
                      s.email AS student_email,
                      s.form AS student_form
               FROM composite_sessions cs
               JOIN students s ON s.id = cs.student_id
               WHERE cs.id = $1 AND cs.student_id = $2`;
      params = [sessionId, userId];
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  } catch (err) {
    console.warn('[compositeRepo] getSessionById error:', err.message);
    return null;
  }
}

async function getTeacherSummary(teacherId) {
  const sessions = await getTeacherSessions(teacherId);
  const cohortBenchmarks = [58, 72, 64, 54, 46];

  if (!sessions || sessions.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      averagePercentage: 0,
      gradeDistribution: {
        'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0,
        'C+': 0, 'C': 0, 'C-': 0, 'D+': 0, 'D': 0, 'D-': 0, 'E': 0
      },
      classCompetencyAverages: {
        accuracy: 0,
        decimals: 0,
        averaging: 0,
        inorganic: 0,
        organic: 0,
        overall: 0
      },
      cohortBenchmarks
    };
  }

  const gradeDist = {
    'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0,
    'C+': 0, 'C': 0, 'C-': 0, 'D+': 0, 'D': 0, 'D-': 0, 'E': 0
  };

  let totalScoreSum = 0;
  let compSums = { ac: 0, d: 0, pa: 0, inorg: 0, org: 0, count: 0 };

  sessions.forEach(s => {
    totalScoreSum += Number(s.total_score) || 0;
    const g = (s.grade || 'E').toUpperCase().trim();
    if (gradeDist[g] !== undefined) {
      gradeDist[g]++;
    } else {
      gradeDist['E']++;
    }

    const details = typeof s.details === 'string' ? JSON.parse(s.details) : (s.details || {});
    const cm = details.competencyMetrics;
    if (cm && cm.metrics) {
      compSums.ac += Number(cm.metrics.accuracy?.candidate) || 0;
      compSums.d += Number(cm.metrics.decimals?.candidate) || 0;
      compSums.pa += Number(cm.metrics.averaging?.candidate) || 0;
      compSums.inorg += Number(cm.metrics.inorganic?.candidate) || 0;
      compSums.org += Number(cm.metrics.organic?.candidate) || 0;
      compSums.count++;
    }
  });

  const n = sessions.length;
  const avgScore = Number((totalScoreSum / n).toFixed(1));
  const avgPct = Math.round((avgScore / 40.0) * 100);

  const cCount = compSums.count || 1;
  const classCompAvg = {
    accuracy: Math.round(compSums.ac / cCount),
    decimals: Math.round(compSums.d / cCount),
    averaging: Math.round(compSums.pa / cCount),
    inorganic: Math.round(compSums.inorg / cCount),
    organic: Math.round(compSums.org / cCount),
    overall: Math.round((compSums.ac + compSums.d + compSums.pa + compSums.inorg + compSums.org) / (5 * cCount))
  };

  return {
    totalAttempts: n,
    averageScore: avgScore,
    averagePercentage: avgPct,
    gradeDistribution: gradeDist,
    classCompetencyAverages: classCompAvg,
    cohortBenchmarks
  };
}

module.exports = {
  saveCompositeSession,
  linkAssignmentSubmission,
  getStudentSessions,
  getTeacherSessions,
  getExportData,
  getSessionById,
  getTeacherSummary
};

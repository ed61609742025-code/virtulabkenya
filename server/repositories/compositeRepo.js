const pool = require('../db/pool');
const path = require('path');

let knecGrading;
try {
  knecGrading = require(path.join(__dirname, '../../client/shared/knec-grading.js'));
} catch (e) {
  knecGrading = {
    calculateKnecGrade: (score, maxScore = 40.0) => {
      const pct = (Number(score) / Number(maxScore)) * 100.0;
      if (pct >= 80.0) return 'A';
      if (pct >= 75.0) return 'A-';
      if (pct >= 70.0) return 'B+';
      if (pct >= 65.0) return 'B';
      if (pct >= 60.0) return 'B-';
      if (pct >= 55.0) return 'C+';
      if (pct >= 50.0) return 'C';
      if (pct >= 45.0) return 'C-';
      if (pct >= 40.0) return 'D+';
      if (pct >= 35.0) return 'D';
      if (pct >= 30.0) return 'D-';
      return 'E';
    },
    evaluateKnecTable1: (trials = [], trueTitre = 20.0) => {
      const valid = (trials || []).filter(t => t && t.recorded && Number(t.used) > 0);
      let minDev = 999.0;
      for (const t of valid) {
        const dev = Math.abs(Number(t.used) - trueTitre);
        if (dev < minDev) minDev = dev;
      }
      let acMark = 0.0;
      if (valid.length >= 2 && minDev <= 0.10) acMark = 1.0;
      else if (valid.length >= 2 && minDev <= 0.20) acMark = 0.5;
      return { tableScore: 3.0 + acMark, maxScore: 5.0 };
    }
  };
}

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

      CREATE TABLE IF NOT EXISTS teacher_calibrations (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        teacher_id INTEGER,
        supervisor_titre DECIMAL(5,2) DEFAULT 20.00,
        tolerance DECIMAL(5,2) DEFAULT 0.20,
        true_cation VARCHAR(50) DEFAULT 'Fe2+',
        true_anion VARCHAR(50) DEFAULT 'SO4 2-',
        true_functional_group VARCHAR(100) DEFAULT 'Alkanol',
        notes TEXT,
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_assignment_calibration UNIQUE (assignment_id)
      );
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

async function getTeacherSessions(userId, userRole = 'teacher') {
  await ensureCompositeTable();
  const isAdmin = userRole === 'admin';
  try {
    const query = isAdmin
      ? `SELECT cs.*,
                s.name AS student_name,
                s.email AS student_email,
                s.form AS student_form,
                a.title AS assignment_title
         FROM composite_sessions cs
         JOIN students s ON s.id = cs.student_id
         LEFT JOIN assignments a ON a.id = cs.assignment_id
         ORDER BY cs.created_at DESC`
      : `SELECT cs.*,
                s.name AS student_name,
                s.email AS student_email,
                s.form AS student_form,
                a.title AS assignment_title
         FROM composite_sessions cs
         JOIN students s ON s.id = cs.student_id
         LEFT JOIN assignments a ON a.id = cs.assignment_id
         WHERE (s.teacher_id = $1 OR s.teacher_id IS NULL)
         ORDER BY cs.created_at DESC`;
    const params = isAdmin ? [] : [userId];
    const result = await pool.query(query, params);
    return result.rows || [];
  } catch (err) {
    console.warn('[compositeRepo] getTeacherSessions error:', err.message);
    return [];
  }
}

async function getExportData(assignmentId, userId, userRole = 'teacher') {
  const isAdmin = userRole === 'admin';
  const assignQuery = isAdmin
    ? 'SELECT id, title FROM assignments WHERE id = $1'
    : 'SELECT id, title FROM assignments WHERE id = $1 AND (teacher_id = $2 OR teacher_id IS NULL)';
  const assignParams = isAdmin ? [assignmentId] : [assignmentId, userId];

  const assignResult = await pool.query(assignQuery, assignParams);
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
    if (userRole === 'admin') {
      query = `SELECT cs.*,
                      s.name AS student_name,
                      s.email AS student_email,
                      s.form AS student_form,
                      a.title AS assignment_title
               FROM composite_sessions cs
               JOIN students s ON s.id = cs.student_id
               LEFT JOIN assignments a ON a.id = cs.assignment_id
               WHERE cs.id = $1`;
      params = [sessionId];
    } else if (userRole === 'teacher') {
      query = `SELECT cs.*,
                      s.name AS student_name,
                      s.email AS student_email,
                      s.form AS student_form,
                      a.title AS assignment_title
               FROM composite_sessions cs
               JOIN students s ON s.id = cs.student_id
               LEFT JOIN assignments a ON a.id = cs.assignment_id
               WHERE cs.id = $1 AND (s.teacher_id = $2 OR s.teacher_id IS NULL)`;
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

async function getTeacherSummary(userId, userRole = 'teacher') {
  const sessions = await getTeacherSessions(userId, userRole);
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

/**
 * Save or update teacher concordant calibration for an assignment.
 */
async function saveCalibration(userId, userRole, {
  assignmentId,
  supervisorTitre = 20.00,
  tolerance = 0.20,
  trueCation = 'Fe2+',
  trueAnion = 'SO4 2-',
  trueFunctionalGroup = 'Alkanol',
  notes = ''
}) {
  await ensureCompositeTable();
  const aId = parseInt(assignmentId, 10);
  if (isNaN(aId)) throw new Error('Valid assignmentId required.');

  const result = await pool.query(
    `INSERT INTO teacher_calibrations 
       (assignment_id, teacher_id, supervisor_titre, tolerance, true_cation, true_anion, true_functional_group, notes, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (assignment_id)
     DO UPDATE SET
       supervisor_titre = EXCLUDED.supervisor_titre,
       tolerance = EXCLUDED.tolerance,
       true_cation = EXCLUDED.true_cation,
       true_anion = EXCLUDED.true_anion,
       true_functional_group = EXCLUDED.true_functional_group,
       notes = EXCLUDED.notes,
       teacher_id = COALESCE(EXCLUDED.teacher_id, teacher_calibrations.teacher_id),
       updated_at = NOW()
     RETURNING *`,
    [aId, userId, parseFloat(supervisorTitre) || 20.00, parseFloat(tolerance) || 0.20, trueCation, trueAnion, trueFunctionalGroup, notes]
  );

  return result.rows[0];
}

/**
 * Fetch calibration for a given assignment.
 */
async function getCalibration(assignmentId) {
  await ensureCompositeTable();
  const aId = parseInt(assignmentId, 10);
  if (isNaN(aId)) return null;

  const result = await pool.query(
    'SELECT * FROM teacher_calibrations WHERE assignment_id = $1',
    [aId]
  );
  return result.rows[0] || null;
}

/**
 * Fetch official KNEC KCSE Paper 3 benchmarks, standards & competencies.
 */
function getNationalBenchmarks() {
  return {
    knecExamCode: '233/3',
    examTitle: 'KCSE Chemistry Practical Paper 3',
    maxScore: 40.0,
    nationalBaselineMean: 23.6,
    nationalBaselinePercentage: 59.0,
    rubricStandards: {
      concordancyThreshold: '±0.20 cm³ between consecutive titres',
      decimalPrecision: 'Strict 2 d.p. ending in .00 or .05',
      accuracyMaxMarkThreshold: '±0.10 cm³ vs School Supervisor Titre (1.0 mk)',
      accuracyPartialThreshold: '±0.20 cm³ vs School Supervisor Titre (0.5 mk)',
      averagingConvention: 'Mean computed strictly from concordant readings'
    },
    competencyBaselines: {
      accuracy: 58,
      decimals: 72,
      averaging: 64,
      inorganic: 54,
      organic: 46
    },
    gradeCutoffs: [
      { grade: 'A', minScore: 32.0, minPct: 80, points: 12, descriptor: 'Distinction' },
      { grade: 'A-', minScore: 30.0, minPct: 75, points: 11, descriptor: 'Excellent' },
      { grade: 'B+', minScore: 28.0, minPct: 70, points: 10, descriptor: 'Very Good' },
      { grade: 'B', minScore: 26.0, minPct: 65, points: 9, descriptor: 'Good' },
      { grade: 'B-', minScore: 24.0, minPct: 60, points: 8, descriptor: 'Above Average' },
      { grade: 'C+', minScore: 22.0, minPct: 55, points: 7, descriptor: 'University Entry' },
      { grade: 'C', minScore: 20.0, minPct: 50, points: 6, descriptor: 'Average' },
      { grade: 'C-', minScore: 18.0, minPct: 45, points: 5, descriptor: 'Below Average' },
      { grade: 'D+', minScore: 16.0, minPct: 40, points: 4, descriptor: 'Elementary' },
      { grade: 'D', minScore: 14.0, minPct: 35, points: 3, descriptor: 'Weak' },
      { grade: 'D-', minScore: 12.0, minPct: 30, points: 2, descriptor: 'Very Weak' },
      { grade: 'E', minScore: 0.0, minPct: 0, points: 1, descriptor: 'Remediation Required' }
    ]
  };
}

/**
 * Synchronize candidate scores for an assignment against calibrated supervisor titre.
 */
async function syncCohortScores(assignmentId) {
  await ensureCompositeTable();
  const aId = parseInt(assignmentId, 10);
  if (isNaN(aId)) throw new Error('Valid assignmentId required.');

  const calibration = await getCalibration(aId);
  const supervisorTitre = calibration ? Number(calibration.supervisor_titre) : 20.00;
  const tolerance = calibration ? Number(calibration.tolerance) : 0.20;

  const sessionsRes = await pool.query(
    'SELECT * FROM composite_sessions WHERE assignment_id = $1',
    [aId]
  );
  const sessions = sessionsRes.rows || [];
  let updatedCount = 0;

  for (const s of sessions) {
    const details = typeof s.details === 'string' ? JSON.parse(s.details) : (s.details || {});
    const trials = details.q1?.trials || details.titration?.trials || details.trials || [];

    if (trials && trials.length > 0) {
      const tableEval = knecGrading.evaluateKnecTable1(trials, supervisorTitre);
      const newTableScore = tableEval.tableScore || 0;

      // Extract existing written or subsidiary score
      const oldTableScore = (details.q1 && typeof details.q1.tableScore === 'number') ? details.q1.tableScore : 5.0;
      const writtenScore = Math.max(0, (Number(s.q1_score) || 0) - oldTableScore);
      const newQ1 = Math.min(15.0, Number((newTableScore + writtenScore).toFixed(1)));

      const newTotal = Number((newQ1 + (Number(s.q2_score) || 0) + (Number(s.q3_score) || 0)).toFixed(1));
      const newGrade = knecGrading.calculateKnecGrade(newTotal);

      details.q1 = details.q1 || {};
      details.q1.tableScore = newTableScore;
      details.q1.calibratedSupervisorTitre = supervisorTitre;
      details.q1.rubric = tableEval.rubric;

      await pool.query(
        `UPDATE composite_sessions 
         SET q1_score = $1, total_score = $2, grade = $3, details = $4
         WHERE id = $5`,
        [newQ1, newTotal, newGrade, JSON.stringify(details), s.id]
      );
      updatedCount++;
    }
  }

  return {
    assignmentId: aId,
    supervisorTitre,
    tolerance,
    totalSessions: sessions.length,
    updatedCount
  };
}

module.exports = {
  saveCompositeSession,
  linkAssignmentSubmission,
  getStudentSessions,
  getTeacherSessions,
  getExportData,
  getSessionById,
  getTeacherSummary,
  saveCalibration,
  getCalibration,
  getNationalBenchmarks,
  syncCohortScores
};

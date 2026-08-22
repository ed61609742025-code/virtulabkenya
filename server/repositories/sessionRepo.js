const pool = require('../db/pool');

async function saveSession(data) {
  const {
    studentId,
    type,
    titrationKey,
    titrationTitle,
    indicatorLabel,
    indicatorCorrect,
    trialsCount,
    concordantFound,
    trialReadings,
    studentAnswer,
    trueConc,
    trueValue,
    difference,
    correct,
    score,
    mode = 'free',
    details = {},
    durationSeconds = 0,
    assignmentId = null
  } = data;

  const actualType = type || titrationKey || 'acidBase';
  const actualTrueConc = trueConc != null ? trueConc : trueValue;
  const actualTitle = titrationTitle || (details && details.titrationTitle) || null;
  const actualIndicator = indicatorLabel || (details && details.indicatorLabel) || null;
  const actualReadings = trialReadings || (details && details.readings) || null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO practical_sessions
        (student_id, assignment_id, titration_type, titration_title, indicator_used, indicator_correct, trials_count, concordant_found, trial_readings, student_answer, true_value, type, true_conc, difference, correct, score, mode, details, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        studentId,
        assignmentId || null,
        actualType,
        actualTitle,
        actualIndicator,
        indicatorCorrect != null ? indicatorCorrect : true,
        trialsCount || 0,
        concordantFound != null ? concordantFound : false,
        actualReadings ? JSON.stringify(actualReadings) : null,
        studentAnswer,
        actualTrueConc,
        actualType,
        actualTrueConc,
        difference || 0,
        correct != null ? correct : true,
        score || 0,
        mode,
        JSON.stringify(details),
        durationSeconds
      ]
    );
    if (assignmentId && rows[0]) {
      await linkAssignmentSubmission({ assignmentId, studentId, sessionId: rows[0].id });
    }
    return rows[0];
  } catch (err) {
    if (err.message && (err.message.includes('column "type"') || err.message.includes('column "true_conc"'))) {
      const { rows } = await pool.query(
        `INSERT INTO practical_sessions
          (student_id, assignment_id, titration_type, titration_title, indicator_used, indicator_correct, trials_count, concordant_found, trial_readings, student_answer, true_value, correct, mode, duration_seconds)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          studentId,
          assignmentId || null,
          actualType,
          actualTitle,
          actualIndicator,
          indicatorCorrect != null ? indicatorCorrect : true,
          trialsCount || 0,
          concordantFound != null ? concordantFound : false,
          actualReadings ? JSON.stringify(actualReadings) : null,
          studentAnswer,
          actualTrueConc,
          correct != null ? correct : true,
          mode,
          durationSeconds
        ]
      );
      if (assignmentId && rows[0]) {
        await linkAssignmentSubmission({ assignmentId, studentId, sessionId: rows[0].id });
      }
      return rows[0];
    }
    throw err;
  }
}

const { linkAssignmentSubmission } = require('./assignmentRepo');

async function getStudentSessions(studentId, { page = 1, limit = 5, type } = {}) {
  const offset = (page - 1) * limit;
  const params = [studentId];
  let typeClause = '';

  if (type) {
    params.push(type);
    typeClause = `AND (titration_type = $${params.length} OR type = $${params.length})`;
  }

  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM practical_sessions WHERE student_id = $1 ${typeClause}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const queryParams = [...params, limit, offset];
    const rowsRes = await pool.query(
      `SELECT *, COALESCE(titration_type, type) AS type, COALESCE(titration_type, type) AS titration_type FROM practical_sessions
       WHERE student_id = $1 ${typeClause}
       ORDER BY created_at DESC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams
    );

    const sessions = rowsRes.rows.map(s => ({
      ...s,
      type: s.type || s.titration_type || 'acidBase'
    }));

    return {
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      pagination: {
        totalCount: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    if (err.message && err.message.includes('column "type" does not exist')) {
      const fallbackClause = type ? `AND titration_type = $2` : '';
      const fallbackParams = type ? [studentId, type] : [studentId];

      const countRes = await pool.query(
        `SELECT COUNT(*) FROM practical_sessions WHERE student_id = $1 ${fallbackClause}`,
        fallbackParams
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const queryParams = [...fallbackParams, limit, offset];
      const rowsRes = await pool.query(
        `SELECT *, titration_type AS type FROM practical_sessions
         WHERE student_id = $1 ${fallbackClause}
         ORDER BY created_at DESC
         LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
        queryParams
      );

      return {
        sessions: rowsRes.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        pagination: {
          totalCount: total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    }
    throw err;
  }
}

async function getClassSessions(teacherId, { page = 1, limit = 20, type, studentClass, from } = {}) {
  const offset = (page - 1) * limit;
  const whereClauses = ['s.teacher_id = $1'];
  const params = [teacherId];

  if (type) {
    params.push(type);
    whereClauses.push(`(ps.titration_type = $${params.length} OR ps.type = $${params.length})`);
  }
  if (studentClass) {
    params.push(studentClass);
    whereClauses.push(`s.form = $${params.length}`);
  }
  if (from) {
    params.push(from);
    whereClauses.push(`ps.created_at >= $${params.length}`);
  }

  const whereStr = whereClauses.join(' AND ');

  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM practical_sessions ps JOIN students s ON s.id = ps.student_id WHERE ${whereStr}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const queryParams = [...params, limit, offset];
    const rowsRes = await pool.query(
      `SELECT ps.*, COALESCE(ps.titration_type, ps.type) AS type, s.name AS student_name, s.email AS student_email, s.form AS student_form
       FROM practical_sessions ps
       JOIN students s ON s.id = ps.student_id
       WHERE ${whereStr}
       ORDER BY ps.created_at DESC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams
    );

    return {
      sessions: rowsRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (err) {
    if (err.message && err.message.includes('column "type" does not exist')) {
      const fallbackWhereClauses = ['s.teacher_id = $1'];
      const fallbackParams = [teacherId];

      if (type) {
        fallbackParams.push(type);
        fallbackWhereClauses.push(`ps.titration_type = $${fallbackParams.length}`);
      }
      if (studentClass) {
        fallbackParams.push(studentClass);
        fallbackWhereClauses.push(`s.form = $${fallbackParams.length}`);
      }
      if (from) {
        fallbackParams.push(from);
        fallbackWhereClauses.push(`ps.created_at >= $${fallbackParams.length}`);
      }

      const fallbackWhereStr = fallbackWhereClauses.join(' AND ');

      const countRes = await pool.query(
        `SELECT COUNT(*) FROM practical_sessions ps JOIN students s ON s.id = ps.student_id WHERE ${fallbackWhereStr}`,
        fallbackParams
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const queryParams = [...fallbackParams, limit, offset];
      const rowsRes = await pool.query(
        `SELECT ps.*, ps.titration_type AS type, s.name AS student_name, s.email AS student_email, s.form AS student_form
         FROM practical_sessions ps
         JOIN students s ON s.id = ps.student_id
         WHERE ${fallbackWhereStr}
         ORDER BY ps.created_at DESC
         LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
        queryParams
      );

      return {
        sessions: rowsRes.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    }
    throw err;
  }
}

module.exports = {
  saveSession,
  linkAssignmentSubmission,
  getStudentSessions,
  getClassSessions
};

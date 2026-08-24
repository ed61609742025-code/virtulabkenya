const pool = require('../db/pool');

async function createAssignment(teacherId, data) {
  const teacherResult = await pool.query(
    'SELECT school_id FROM teachers WHERE id = $1',
    [teacherId]
  );
  if (teacherResult.rows.length === 0) return null;

  const schoolId = teacherResult.rows[0].school_id;
  const { title, titrationType, instructions, dueDate, examConfig } = data;

  const result = await pool.query(
    `INSERT INTO assignments (teacher_id, school_id, title, titration_type, instructions, due_date, exam_config)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      teacherId,
      schoolId,
      title,
      titrationType || null,
      instructions || null,
      dueDate || null,
      examConfig ? JSON.stringify(examConfig) : null
    ]
  );
  return result.rows[0];
}

async function getStudentAssignments(studentId) {
  const studentResult = await pool.query(
    'SELECT teacher_id, school_id FROM students WHERE id = $1',
    [studentId]
  );
  if (studentResult.rows.length === 0) return [];
  const teacherId = studentResult.rows[0].teacher_id ?? null;
  const schoolId = studentResult.rows[0].school_id ?? null;

  const query = `
    SELECT a.*,
           t.name AS teacher_name,
           t.teacher_code AS teacher_code,
           (sub.id IS NOT NULL OR ps.id IS NOT NULL OR qs.id IS NOT NULL OR os.id IS NOT NULL OR cs.id IS NOT NULL OR ss.id IS NOT NULL OR es.id IS NOT NULL OR rs.id IS NOT NULL OR gs.id IS NOT NULL) AS submitted,
           COALESCE(sub.status, 
             CASE WHEN (sub.id IS NOT NULL OR ps.id IS NOT NULL OR qs.id IS NOT NULL OR os.id IS NOT NULL OR cs.id IS NOT NULL OR ss.id IS NOT NULL OR es.id IS NOT NULL OR rs.id IS NOT NULL OR gs.id IS NOT NULL) 
                  THEN 'submitted' 
                  ELSE NULL 
             END
           ) AS submission_status,
           COALESCE(sub.submitted_at, ps.created_at, qs.created_at, os.created_at, cs.created_at, ss.created_at, es.created_at, rs.created_at, gs.created_at) AS submitted_at,
           sub.teacher_feedback,
           sub.marked_at,
           ps.student_answer AS ps_student_answer, COALESCE(ps.true_conc, 0) AS ps_true_value, ps.titration_type AS ps_titration_type, ps.titration_title AS ps_titration_title, ps.indicator_used, ps.trials_count, ps.trial_readings, ps.mode AS practical_mode, ps.details AS ps_details,
           qs.salt_key, qs.salt_name, qs.true_cation, qs.true_anion, qs.student_cation, qs.student_anion, qs.cation_correct, qs.anion_correct, qs.tests_performed AS q_tests_performed, qs.tests_correct AS q_tests_correct,
           os.compound_key, os.compound_name, os.true_functional_group, os.student_functional_group, os.functional_group_correct, os.tests_performed AS o_tests_performed, os.tests_correct AS o_tests_correct,
           cs.exam_title, cs.q1_score, cs.q2_score, cs.q3_score, cs.total_score AS cs_total_score, cs.grade AS cs_grade,
           ss.solute_key, ss.solute_name, ss.crystallization_temp, ss.theoretical_temp, ss.temp_difference, ss.accuracy_score AS sol_accuracy_score, ss.graph_score AS sol_graph_score, ss.total_score AS sol_total_score, ss.trials_data AS sol_trials_data,
           es.system_id AS en_system_id, es.system_name AS en_system_name, es.reaction_category AS en_category, es.initial_temp AS en_initial_temp, es.final_temp AS en_final_temp, es.temp_change AS en_temp_change, es.heat_quantity AS en_heat_quantity, es.moles AS en_moles, es.molar_enthalpy AS en_molar_enthalpy, es.theoretical_enthalpy AS en_theoretical_enthalpy, es.total_score AS en_total_score, es.rubric_breakdown AS en_rubrics, es.equation_text AS en_equation,
           rs.experiment_type AS rate_exp_type, rs.experiment_title AS rate_exp_title, rs.dilution_readings AS rate_readings, rs.table_score AS rate_table_score, rs.graph_score AS rate_graph_score, rs.calc_score AS rate_calc_score, rs.total_score AS rate_total_score, rs.grade AS rate_grade, rs.rubric_breakdown AS rate_rubrics,
           gs.gas_key, gs.gas_name, gs.drying_agent AS gas_drying_agent, gs.collection_method AS gas_collection_method, gs.drying_correct AS gas_drying_correct, gs.collection_correct AS gas_collection_correct, gs.tests_performed AS gas_tests_performed, gs.tests_correct AS gas_tests_correct, gs.total_score AS gas_total_score, gs.rubric_breakdown AS gas_rubrics,
           COALESCE(ps.student_answer, cs.total_score, ss.total_score, es.total_score, rs.total_score, gs.total_score) AS student_answer,
           CASE 
             WHEN ps.id IS NOT NULL THEN COALESCE(ps.true_conc, 0)
             WHEN cs.id IS NOT NULL THEN 40.0
             WHEN ss.id IS NOT NULL THEN 5.0
             WHEN es.id IS NOT NULL THEN 15.0
             WHEN rs.id IS NOT NULL THEN 15.0
             WHEN gs.id IS NOT NULL THEN 10.0
             ELSE NULL
           END AS true_value,
           COALESCE((ps.score >= 8 OR ps.concordant_found = true), qs.correct, os.correct, (cs.total_score >= 20), (ss.total_score >= 3.0), (es.total_score >= 8.0), (rs.total_score >= 8.0), (gs.total_score >= 6.0)) AS correct
    FROM assignments a
    LEFT JOIN teachers t ON a.teacher_id = t.id
    LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = $1
    LEFT JOIN (
      SELECT DISTINCT ON (assignment_id, student_id) *
      FROM practical_sessions
      WHERE student_id = $1 AND assignment_id IS NOT NULL
      ORDER BY assignment_id, student_id, created_at DESC
    ) ps ON ps.assignment_id = a.id
    LEFT JOIN (
      SELECT DISTINCT ON (assignment_id, student_id) *
      FROM qualitative_sessions
      WHERE student_id = $1 AND assignment_id IS NOT NULL
      ORDER BY assignment_id, student_id, created_at DESC
    ) qs ON qs.assignment_id = a.id
    LEFT JOIN (
      SELECT DISTINCT ON (assignment_id, student_id) *
      FROM organic_sessions
      WHERE student_id = $1 AND assignment_id IS NOT NULL
      ORDER BY assignment_id, student_id, created_at DESC
    ) os ON os.assignment_id = a.id
    LEFT JOIN (
      SELECT DISTINCT ON (assignment_id, student_id) *
      FROM composite_sessions
      WHERE student_id = $1 AND assignment_id IS NOT NULL
      ORDER BY assignment_id, student_id, created_at DESC
    ) cs ON cs.assignment_id = a.id
    LEFT JOIN (
      SELECT DISTINCT ON (assignment_id, student_id) *
      FROM solubility_sessions
      WHERE student_id = $1 AND assignment_id IS NOT NULL
      ORDER BY assignment_id, student_id, created_at DESC
    ) ss ON ss.assignment_id = a.id
    LEFT JOIN (
      SELECT DISTINCT ON (assignment_id, student_id) *
      FROM energy_sessions
      WHERE student_id = $1 AND assignment_id IS NOT NULL
      ORDER BY assignment_id, student_id, created_at DESC
    ) es ON es.assignment_id = a.id
    LEFT JOIN (
      SELECT DISTINCT ON (assignment_id, student_id) *
      FROM rates_sessions
      WHERE student_id = $1 AND assignment_id IS NOT NULL
      ORDER BY assignment_id, student_id, created_at DESC
    ) rs ON rs.assignment_id = a.id
    LEFT JOIN (
      SELECT DISTINCT ON (assignment_id, student_id) *
      FROM gas_sessions
      WHERE student_id = $1 AND assignment_id IS NOT NULL
      ORDER BY assignment_id, student_id, created_at DESC
    ) gs ON gs.assignment_id = a.id
    WHERE ($2::int IS NOT NULL AND (a.teacher_id = $2 OR ($3::int IS NOT NULL AND a.school_id = $3) OR (a.teacher_id IS NULL AND a.school_id IS NULL)))
       OR ($2::int IS NULL AND $3::int IS NOT NULL AND (a.school_id = $3 OR a.school_id IS NULL OR a.teacher_id IS NULL))
       OR ($2::int IS NULL AND $3::int IS NULL)
    ORDER BY a.created_at DESC
  `;
  const result = await pool.query(query, [studentId, teacherId, schoolId]);
  return result.rows;
}

async function getTeacherAssignments(teacherId) {
  const query = `
    SELECT a.*,
           (
             SELECT COUNT(DISTINCT s_id)::int FROM (
               SELECT student_id AS s_id FROM assignment_submissions WHERE assignment_id = a.id
               UNION
               SELECT student_id AS s_id FROM practical_sessions WHERE assignment_id = a.id
               UNION
               SELECT student_id AS s_id FROM qualitative_sessions WHERE assignment_id = a.id
               UNION
               SELECT student_id AS s_id FROM organic_sessions WHERE assignment_id = a.id
               UNION
               SELECT student_id AS s_id FROM composite_sessions WHERE assignment_id = a.id
               UNION
               SELECT student_id AS s_id FROM solubility_sessions WHERE assignment_id = a.id
               UNION
               SELECT student_id AS s_id FROM energy_sessions WHERE assignment_id = a.id
               UNION
               SELECT student_id AS s_id FROM rates_sessions WHERE assignment_id = a.id
               UNION
               SELECT student_id AS s_id FROM gas_sessions WHERE assignment_id = a.id
             ) all_subs
           ) AS submitted_count,
           (SELECT COUNT(*)::int FROM students WHERE teacher_id = a.teacher_id) AS total_students
    FROM assignments a
    WHERE a.teacher_id = $1
    ORDER BY a.created_at DESC
  `;
  const result = await pool.query(query, [teacherId]);
  return result.rows;
}

async function updateAssignment(assignmentId, teacherId, data) {
  const { title, titrationType, instructions, dueDate, examConfig } = data;
  const query = `
    UPDATE assignments
    SET title = COALESCE($1, title),
        titration_type = COALESCE($2, titration_type),
        instructions = COALESCE($3, instructions),
        due_date = COALESCE($4, due_date),
        exam_config = COALESCE($5, exam_config)
    WHERE id = $6 AND teacher_id = $7
    RETURNING *
  `;
  const result = await pool.query(query, [
    title || null,
    titrationType || null,
    instructions || null,
    dueDate || null,
    examConfig ? JSON.stringify(examConfig) : null,
    assignmentId,
    teacherId
  ]);
  return result.rows[0] || null;
}

async function deleteAssignment(assignmentId, teacherId) {
  const result = await pool.query(
    'DELETE FROM assignments WHERE id = $1 AND teacher_id = $2 RETURNING id',
    [assignmentId, teacherId]
  );
  return result.rows.length > 0;
}

async function getAssignmentExportData(assignmentId, teacherId) {
  const assignResult = await pool.query(
    'SELECT id, title, titration_type FROM assignments WHERE id = $1 AND teacher_id = $2',
    [assignmentId, teacherId]
  );
  if (assignResult.rows.length === 0) return null;

  const result = await pool.query(
    `SELECT DISTINCT ON (s.id)
       s.id AS student_id,
       s.name AS student_name,
       s.email AS student_email,
       s.form AS student_form,
       sub.status AS submission_status,
       sub.teacher_feedback,
       sub.marked_at,
       COALESCE(sub.submitted_at, ps.created_at, qs.created_at, os.created_at, cs.created_at, ss.created_at, es.created_at, rs.created_at, gs.created_at) AS submitted_at,
       COALESCE(ps.student_answer, cs.total_score, ss.total_score, es.total_score, rs.total_score, gs.total_score) AS student_answer,
       COALESCE((ps.score >= 8 OR ps.concordant_found = true), qs.correct, os.correct, (cs.total_score >= 20), (ss.total_score >= 3.0), (es.total_score >= 8.0), (rs.total_score >= 8.0), (gs.total_score >= 6.0)) AS correct,
       ps.titration_type, ps.titration_title, ps.indicator_used, ps.trials_count, ps.trial_readings, COALESCE(ps.true_conc, 0) AS true_value, ps.mode AS practical_mode,
       qs.salt_key, qs.salt_name, qs.true_cation, qs.true_anion, qs.student_cation, qs.student_anion, qs.cation_correct, qs.anion_correct, qs.tests_performed AS q_tests_performed, qs.tests_correct AS q_tests_correct,
       os.compound_key, os.compound_name, os.true_functional_group, os.student_functional_group, os.functional_group_correct, os.tests_performed AS o_tests_performed, os.tests_correct AS o_tests_correct,
       cs.exam_title, cs.q1_score, cs.q2_score, cs.q3_score, cs.total_score AS composite_total_score, cs.grade AS composite_grade,
       ss.solute_key, ss.solute_name, ss.crystallization_temp, ss.theoretical_temp, ss.temp_difference, ss.accuracy_score AS sol_accuracy_score, ss.graph_score AS sol_graph_score, ss.total_score AS sol_total_score,
       es.system_id AS en_system_id, es.system_name AS en_system_name, es.reaction_category AS en_category, es.initial_temp AS en_initial_temp, es.final_temp AS en_final_temp, es.temp_change AS en_temp_change, es.heat_quantity AS en_heat_quantity, es.moles AS en_moles, es.molar_enthalpy AS en_molar_enthalpy, es.theoretical_enthalpy AS en_theoretical_enthalpy, es.total_score AS en_total_score,
       rs.experiment_type AS rate_exp_type, rs.experiment_title AS rate_exp_title, rs.table_score AS rate_table_score, rs.graph_score AS rate_graph_score, rs.calc_score AS rate_calc_score, rs.total_score AS rate_total_score, rs.grade AS rate_grade,
       gs.gas_key, gs.gas_name, gs.drying_agent AS gas_drying_agent, gs.collection_method AS gas_collection_method, gs.drying_correct AS gas_drying_correct, gs.collection_correct AS gas_collection_correct, gs.tests_performed AS gas_tests_performed, gs.tests_correct AS gas_tests_correct, gs.total_score AS gas_total_score
     FROM students s
     LEFT JOIN assignment_submissions sub ON sub.assignment_id = $1 AND sub.student_id = s.id
     LEFT JOIN practical_sessions ps ON ps.assignment_id = $1 AND ps.student_id = s.id
     LEFT JOIN qualitative_sessions qs ON qs.assignment_id = $1 AND qs.student_id = s.id
     LEFT JOIN organic_sessions os ON os.assignment_id = $1 AND os.student_id = s.id
     LEFT JOIN composite_sessions cs ON cs.assignment_id = $1 AND cs.student_id = s.id
     LEFT JOIN solubility_sessions ss ON ss.assignment_id = $1 AND ss.student_id = s.id
     LEFT JOIN energy_sessions es ON es.assignment_id = $1 AND es.student_id = s.id
     LEFT JOIN rates_sessions rs ON rs.assignment_id = $1 AND rs.student_id = s.id
     LEFT JOIN gas_sessions gs ON gs.assignment_id = $1 AND gs.student_id = s.id
     WHERE (sub.id IS NOT NULL OR ps.id IS NOT NULL OR qs.id IS NOT NULL OR os.id IS NOT NULL OR cs.id IS NOT NULL OR ss.id IS NOT NULL OR es.id IS NOT NULL OR rs.id IS NOT NULL OR gs.id IS NOT NULL)
     ORDER BY s.id, COALESCE(sub.submitted_at, ps.created_at, qs.created_at, os.created_at, cs.created_at, ss.created_at, es.created_at, rs.created_at, gs.created_at) DESC`,
    [assignmentId]
  );

  return {
    assignment: assignResult.rows[0],
    rows: result.rows
  };
}

async function getAllSubmissions(teacherId, { page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM (
      SELECT DISTINCT ON (sub_key)
        CONCAT(COALESCE(sub.assignment_id, ps.assignment_id, qs.assignment_id, os.assignment_id, cs.assignment_id, ss.assignment_id, es.assignment_id, rs.assignment_id, gs.assignment_id), '_', COALESCE(sub.student_id, ps.student_id, qs.student_id, os.student_id, cs.student_id, ss.student_id, es.student_id, rs.student_id, gs.student_id)) AS sub_key,
        COALESCE(sub.id, ps.id, qs.id, os.id, cs.id, ss.id, es.id, rs.id, gs.id) AS submission_id,
        COALESCE(sub.assignment_id, ps.assignment_id, qs.assignment_id, os.assignment_id, cs.assignment_id, ss.assignment_id, es.assignment_id, rs.assignment_id, gs.assignment_id) AS assignment_id,
        COALESCE(sub.student_id, ps.student_id, qs.student_id, os.student_id, cs.student_id, ss.student_id, es.student_id, rs.student_id, gs.student_id) AS student_id,
        COALESCE(sub.status, 'submitted') AS submission_status,
        COALESCE(sub.submitted_at, ps.created_at, qs.created_at, os.created_at, cs.created_at, ss.created_at, es.created_at, rs.created_at, gs.created_at) AS submitted_at,
        sub.teacher_feedback,
        sub.marked_at,
        s.name AS student_name,
        s.email AS student_email,
        s.form AS student_form,
        a.title AS assignment_title,
        a.titration_type AS assignment_type,
        ps.titration_type, ps.titration_title, ps.indicator_used, ps.trials_count, ps.trial_readings, ps.student_answer, COALESCE(ps.true_conc, 0) AS true_value, (ps.score >= 8 OR ps.concordant_found = true) AS correct, ps.mode AS practical_mode, ps.details,
        qs.salt_key, qs.salt_name, qs.true_cation, qs.true_anion, qs.student_cation, qs.student_anion, qs.cation_correct, qs.anion_correct, qs.tests_performed AS q_tests_performed, qs.tests_correct AS q_tests_correct,
        os.compound_key, os.compound_name, os.true_functional_group, os.student_functional_group, os.functional_group_correct, os.tests_performed AS o_tests_performed, os.tests_correct AS o_tests_correct,
        cs.exam_title, cs.q1_score, cs.q2_score, cs.q3_score, cs.total_score, cs.grade,
        ss.solute_key, ss.solute_name, ss.crystallization_temp, ss.theoretical_temp, ss.temp_difference, ss.accuracy_score AS sol_accuracy_score, ss.graph_score AS sol_graph_score, ss.total_score AS sol_total_score, ss.trials_data AS sol_trials_data,
        es.system_id AS en_system_id, es.system_name AS en_system_name, es.reaction_category AS en_category, es.initial_temp AS en_initial_temp, es.final_temp AS en_final_temp, es.temp_change AS en_temp_change, es.heat_quantity AS en_heat_quantity, es.moles AS en_moles, es.molar_enthalpy AS en_molar_enthalpy, es.theoretical_enthalpy AS en_theoretical_enthalpy, es.total_score AS en_total_score, es.rubric_breakdown AS en_rubrics, es.equation_text AS en_equation,
        rs.experiment_type AS rate_exp_type, rs.experiment_title AS rate_exp_title, rs.dilution_readings AS rate_readings, rs.table_score AS rate_table_score, rs.graph_score AS rate_graph_score, rs.calc_score AS rate_calc_score, rs.total_score AS rate_total_score, rs.grade AS rate_grade, rs.rubric_breakdown AS rate_rubrics, rs.answers AS rate_answers,
        gs.gas_key, gs.gas_name, gs.drying_agent AS gas_drying_agent, gs.collection_method AS gas_collection_method, gs.drying_correct AS gas_drying_correct, gs.collection_correct AS gas_collection_correct, gs.tests_performed AS gas_tests_performed, gs.tests_correct AS gas_tests_correct, gs.total_score AS gas_total_score, gs.rubric_breakdown AS gas_rubrics
      FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id
      LEFT JOIN practical_sessions ps ON ps.assignment_id = a.id
      LEFT JOIN qualitative_sessions qs ON qs.assignment_id = a.id
      LEFT JOIN organic_sessions os ON os.assignment_id = a.id
      LEFT JOIN composite_sessions cs ON cs.assignment_id = a.id
      LEFT JOIN solubility_sessions ss ON ss.assignment_id = a.id
      LEFT JOIN energy_sessions es ON es.assignment_id = a.id
      LEFT JOIN rates_sessions rs ON rs.assignment_id = a.id
      LEFT JOIN gas_sessions gs ON gs.assignment_id = a.id
      JOIN students s ON s.id = COALESCE(sub.student_id, ps.student_id, qs.student_id, os.student_id, cs.student_id, ss.student_id, es.student_id, rs.student_id, gs.student_id)
      WHERE (a.teacher_id = $1 OR s.teacher_id = $1)
        AND (sub.id IS NOT NULL OR ps.id IS NOT NULL OR qs.id IS NOT NULL OR os.id IS NOT NULL OR cs.id IS NOT NULL OR ss.id IS NOT NULL OR es.id IS NOT NULL OR rs.id IS NOT NULL OR gs.id IS NOT NULL)
      ORDER BY sub_key, COALESCE(sub.submitted_at, ps.created_at, qs.created_at, os.created_at, cs.created_at, ss.created_at, es.created_at, rs.created_at, gs.created_at) DESC
    ) unified_submissions
    ORDER BY submitted_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT CONCAT(COALESCE(sub.assignment_id, ps.assignment_id, qs.assignment_id, os.assignment_id, cs.assignment_id, ss.assignment_id, es.assignment_id, rs.assignment_id, gs.assignment_id), '_', COALESCE(sub.student_id, ps.student_id, qs.student_id, os.student_id, cs.student_id, ss.student_id, es.student_id, rs.student_id, gs.student_id)))
    FROM assignments a
    LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id
    LEFT JOIN practical_sessions ps ON ps.assignment_id = a.id
    LEFT JOIN qualitative_sessions qs ON qs.assignment_id = a.id
    LEFT JOIN organic_sessions os ON os.assignment_id = a.id
    LEFT JOIN composite_sessions cs ON cs.assignment_id = a.id
    LEFT JOIN solubility_sessions ss ON ss.assignment_id = a.id
    LEFT JOIN energy_sessions es ON es.assignment_id = a.id
    LEFT JOIN rates_sessions rs ON rs.assignment_id = a.id
    LEFT JOIN gas_sessions gs ON gs.assignment_id = a.id
    JOIN students s ON s.id = COALESCE(sub.student_id, ps.student_id, qs.student_id, os.student_id, cs.student_id, ss.student_id, es.student_id, rs.student_id, gs.student_id)
    WHERE (a.teacher_id = $1 OR s.teacher_id = $1)
      AND (sub.id IS NOT NULL OR ps.id IS NOT NULL OR qs.id IS NOT NULL OR os.id IS NOT NULL OR cs.id IS NOT NULL OR ss.id IS NOT NULL OR es.id IS NOT NULL OR rs.id IS NOT NULL OR gs.id IS NOT NULL)
  `;

  const [rowsRes, countRes] = await Promise.all([
    pool.query(query, [teacherId, limit, offset]),
    pool.query(countQuery, [teacherId])
  ]);

  const total = parseInt(countRes.rows[0].count, 10);
  return {
    submissions: rowsRes.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

async function linkAssignmentSubmission({
  assignmentId,
  studentId,
  sessionId = null,
  qualitativeSessionId = null,
  organicSessionId = null,
  compositeSessionId = null,
  solubilitySessionId = null,
  energySessionId = null,
  ratesSessionId = null,
  gasSessionId = null,
  status = 'submitted'
}) {
  if (!assignmentId || !studentId) return null;
  try {
    const query = `
      INSERT INTO assignment_submissions (
        assignment_id, student_id, session_id, qualitative_session_id, organic_session_id,
        composite_session_id, solubility_session_id, energy_session_id, rates_session_id, gas_session_id, status, submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (assignment_id, student_id)
      DO UPDATE SET
        session_id = COALESCE(EXCLUDED.session_id, assignment_submissions.session_id),
        qualitative_session_id = COALESCE(EXCLUDED.qualitative_session_id, assignment_submissions.qualitative_session_id),
        organic_session_id = COALESCE(EXCLUDED.organic_session_id, assignment_submissions.organic_session_id),
        composite_session_id = COALESCE(EXCLUDED.composite_session_id, assignment_submissions.composite_session_id),
        solubility_session_id = COALESCE(EXCLUDED.solubility_session_id, assignment_submissions.solubility_session_id),
        energy_session_id = COALESCE(EXCLUDED.energy_session_id, assignment_submissions.energy_session_id),
        rates_session_id = COALESCE(EXCLUDED.rates_session_id, assignment_submissions.rates_session_id),
        gas_session_id = COALESCE(EXCLUDED.gas_session_id, assignment_submissions.gas_session_id),
        status = CASE WHEN assignment_submissions.status = 'marked' THEN 'marked' ELSE EXCLUDED.status END,
        submitted_at = NOW()
      RETURNING *
    `;
    const res = await pool.query(query, [
      assignmentId, studentId, sessionId, qualitativeSessionId, organicSessionId,
      compositeSessionId, solubilitySessionId, energySessionId, ratesSessionId, gasSessionId, status
    ]);
    return res.rows[0];
  } catch (err) {
    console.warn('[AssignmentRepo] Failed to link submission:', err.message);
    return null;
  }
}

async function markSubmission(submissionId, teacherId, teacherFeedback) {
  // 1. Direct match on assignment_submissions.id
  const directQuery = `
    UPDATE assignment_submissions
    SET status = 'marked',
        teacher_feedback = COALESCE($1, teacher_feedback),
        marked_at = NOW()
    WHERE id = $2
      AND assignment_id IN (SELECT id FROM assignments WHERE teacher_id = $3 OR teacher_id IS NULL)
    RETURNING *
  `;
  try {
    const result = await pool.query(directQuery, [teacherFeedback || null, submissionId, teacherId]);
    if (result.rows[0]) return result.rows[0];
  } catch (e) {}

  // 2. Check if submissionId is in format "assignmentId_studentId"
  if (typeof submissionId === 'string' && submissionId.includes('_')) {
    const [aId, sId] = submissionId.split('_').map(x => parseInt(x, 10));
    if (aId && sId) {
      const upsertQuery = `
        INSERT INTO assignment_submissions (assignment_id, student_id, status, teacher_feedback, marked_at)
        VALUES ($1, $2, 'marked', $3, NOW())
        ON CONFLICT (assignment_id, student_id)
        DO UPDATE SET status = 'marked', teacher_feedback = COALESCE($3, assignment_submissions.teacher_feedback), marked_at = NOW()
        RETURNING *
      `;
      try {
        const result = await pool.query(upsertQuery, [aId, sId, teacherFeedback || null]);
        if (result.rows[0]) return result.rows[0];
      } catch (e) {}
    }
  }

  // 3. Fallback: Lookup by practical_sessions, qualitative_sessions, organic_sessions, composite_sessions, solubility_sessions, energy_sessions, rates_sessions, gas_sessions
  const sessionLookups = [
    'SELECT assignment_id, student_id FROM practical_sessions WHERE id = $1 AND assignment_id IS NOT NULL',
    'SELECT assignment_id, student_id FROM qualitative_sessions WHERE id = $1 AND assignment_id IS NOT NULL',
    'SELECT assignment_id, student_id FROM organic_sessions WHERE id = $1 AND assignment_id IS NOT NULL',
    'SELECT assignment_id, student_id FROM composite_sessions WHERE id = $1 AND assignment_id IS NOT NULL',
    'SELECT assignment_id, student_id FROM solubility_sessions WHERE id = $1 AND assignment_id IS NOT NULL',
    'SELECT assignment_id, student_id FROM energy_sessions WHERE id = $1 AND assignment_id IS NOT NULL',
    'SELECT assignment_id, student_id FROM rates_sessions WHERE id = $1 AND assignment_id IS NOT NULL',
    'SELECT assignment_id, student_id FROM gas_sessions WHERE id = $1 AND assignment_id IS NOT NULL'
  ];

  for (const lookupSql of sessionLookups) {
    try {
      const sessRes = await pool.query(lookupSql, [submissionId]);
      if (sessRes.rows[0]) {
        const { assignment_id, student_id } = sessRes.rows[0];
        const upsertQuery = `
          INSERT INTO assignment_submissions (assignment_id, student_id, session_id, status, teacher_feedback, marked_at)
          VALUES ($1, $2, $3, 'marked', $4, NOW())
          ON CONFLICT (assignment_id, student_id)
          DO UPDATE SET status = 'marked', teacher_feedback = COALESCE($4, assignment_submissions.teacher_feedback), marked_at = NOW()
          RETURNING *
        `;
        const markedRes = await pool.query(upsertQuery, [assignment_id, student_id, submissionId, teacherFeedback || null]);
        if (markedRes.rows[0]) return markedRes.rows[0];
      }
    } catch (e) {}
  }

  return null;
}

module.exports = {
  createAssignment,
  getStudentAssignments,
  getTeacherAssignments,
  updateAssignment,
  deleteAssignment,
  getAssignmentExportData,
  getAllSubmissions,
  markSubmission,
  linkAssignmentSubmission
};

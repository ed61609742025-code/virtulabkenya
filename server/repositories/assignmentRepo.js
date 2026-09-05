const pool = require('../db/pool');

let assignmentTablesEnsured = false;
async function ensureAssignmentTables() {
  if (assignmentTablesEnsured) return;
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

      CREATE TABLE IF NOT EXISTS organic_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        compound_key VARCHAR(50) NOT NULL,
        compound_name VARCHAR(150),
        true_functional_group VARCHAR(50),
        student_functional_group VARCHAR(50),
        functional_group_correct BOOLEAN DEFAULT FALSE,
        tests_performed INTEGER DEFAULT 0,
        tests_correct INTEGER DEFAULT 0,
        questions_total INTEGER DEFAULT 4,
        questions_correct INTEGER DEFAULT 0,
        score_pct INTEGER DEFAULT 0,
        observations JSONB,
        correct BOOLEAN DEFAULT FALSE,
        mode VARCHAR(20) DEFAULT 'selfPaced',
        created_at TIMESTAMP DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS solubility_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        solute_key VARCHAR(50) NOT NULL,
        solute_name VARCHAR(150),
        experiment_title VARCHAR(200),
        solute_mass DECIMAL(6,2),
        solvent_volume DECIMAL(6,2),
        crystallization_temp DECIMAL(6,2),
        theoretical_temp DECIMAL(6,2),
        temp_difference DECIMAL(6,2),
        accuracy_score DECIMAL(5,2) DEFAULT 0.0,
        graph_score DECIMAL(5,2) DEFAULT 0.0,
        total_score DECIMAL(5,2) DEFAULT 0.0,
        trials_data JSONB,
        mode VARCHAR(20) DEFAULT 'selfPaced',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS energy_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        system_id VARCHAR(100) NOT NULL,
        system_name VARCHAR(200),
        reaction_category VARCHAR(50),
        initial_temp DECIMAL(6,2),
        final_temp DECIMAL(6,2),
        temp_change DECIMAL(6,2),
        heat_quantity DECIMAL(10,2),
        moles DECIMAL(10,4),
        molar_enthalpy DECIMAL(10,2),
        theoretical_enthalpy DECIMAL(10,2),
        total_score DECIMAL(5,2) DEFAULT 0.0,
        rubric_breakdown JSONB,
        readings_data JSONB,
        equation_text TEXT,
        mode VARCHAR(20) DEFAULT 'practice',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rates_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        experiment_type VARCHAR(50) NOT NULL,
        experiment_title VARCHAR(200),
        dilution_readings JSONB,
        table_score DECIMAL(5,2) DEFAULT 0.0,
        graph_score DECIMAL(5,2) DEFAULT 0.0,
        calc_score DECIMAL(5,2) DEFAULT 0.0,
        total_score DECIMAL(5,2) DEFAULT 0.0,
        grade VARCHAR(20),
        rubric_breakdown JSONB,
        answers JSONB,
        mode VARCHAR(20) DEFAULT 'practice',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS gas_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
        gas_key VARCHAR(50) NOT NULL,
        gas_name VARCHAR(150),
        reactants VARCHAR(200),
        drying_agent VARCHAR(100),
        collection_method VARCHAR(100),
        drying_correct BOOLEAN DEFAULT FALSE,
        collection_correct BOOLEAN DEFAULT FALSE,
        tests_performed INTEGER DEFAULT 0,
        tests_correct INTEGER DEFAULT 0,
        test_observations JSONB,
        questions_score DECIMAL(5,2) DEFAULT 0.0,
        total_score DECIMAL(5,2) DEFAULT 0.0,
        rubric_breakdown JSONB,
        correct BOOLEAN DEFAULT FALSE,
        mode VARCHAR(20) DEFAULT 'selfPaced',
        duration_seconds INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS qualitative_session_id INTEGER;
      ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS organic_session_id INTEGER;
      ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS composite_session_id INTEGER;
      ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS solubility_session_id INTEGER;
      ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS energy_session_id INTEGER;
      ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS rates_session_id INTEGER;
      ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS gas_session_id INTEGER;
      ALTER TABLE assignments ADD COLUMN IF NOT EXISTS exam_config JSONB;
    `);
    assignmentTablesEnsured = true;
  } catch (e) {
    console.warn('[assignmentRepo] ensureAssignmentTables note:', e.message);
  }
}

async function createAssignment(teacherId, data) {
  await ensureAssignmentTables();
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
  try {
    const studentResult = await pool.query(
      'SELECT teacher_id, school_id FROM students WHERE id = $1',
      [studentId]
    );
  if (studentResult.rows.length === 0) return [];
  const teacherId = studentResult.rows[0].teacher_id || null;
  const schoolId = studentResult.rows[0].school_id || null;

  let whereClause = '';
  const params = [studentId];

  if (teacherId && schoolId) {
    params.push(teacherId, schoolId);
    whereClause = `WHERE (a.teacher_id = $2 OR a.school_id = $3 OR (a.teacher_id IS NULL AND a.school_id IS NULL))`;
  } else if (teacherId) {
    params.push(teacherId);
    whereClause = `WHERE (a.teacher_id = $2 OR (a.teacher_id IS NULL AND a.school_id IS NULL))`;
  } else if (schoolId) {
    params.push(schoolId);
    whereClause = `WHERE (a.school_id = $2 OR a.school_id IS NULL OR a.teacher_id IS NULL)`;
  } else {
    whereClause = '';
  }

  const query = `
    SELECT * FROM (
      SELECT DISTINCT ON (a.id)
        a.*,
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
      ) ps ON (ps.assignment_id = a.id OR ps.id = sub.session_id)
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
      ${whereClause}
      ORDER BY a.id, COALESCE(sub.marked_at, sub.submitted_at, ps.created_at, a.created_at) DESC
    ) deduped_assignments
    ORDER BY created_at DESC
  `;
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (queryErr) {
      console.warn('[getStudentAssignments Warning - Query Failed, Falling back to resilient core query]:', queryErr.message);
      const safeQuery = `
        SELECT * FROM (
          SELECT DISTINCT ON (a.id)
            a.*,
            t.name AS teacher_name,
            t.teacher_code AS teacher_code,
            (sub.id IS NOT NULL OR ps.id IS NOT NULL) AS submitted,
            COALESCE(sub.status, CASE WHEN ps.id IS NOT NULL THEN 'submitted' ELSE NULL END) AS submission_status,
            COALESCE(sub.submitted_at, ps.created_at) AS submitted_at,
            sub.teacher_feedback,
            sub.marked_at,
            ps.student_answer AS ps_student_answer,
            COALESCE(ps.true_conc, ps.true_value, 0) AS ps_true_value,
            ps.titration_type AS ps_titration_type,
            ps.titration_title AS ps_titration_title,
            ps.indicator_used,
            ps.trials_count,
            ps.trial_readings,
            ps.mode AS practical_mode,
            ps.details AS ps_details,
            ps.details,
            ps.student_answer,
            COALESCE(ps.true_conc, ps.true_value, 0) AS true_value,
            COALESCE((ps.score >= 8 OR ps.concordant_found = true), false) AS correct
          FROM assignments a
          LEFT JOIN teachers t ON a.teacher_id = t.id
          LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = $1
          LEFT JOIN (
            SELECT DISTINCT ON (assignment_id, student_id) *
            FROM practical_sessions
            WHERE student_id = $1 AND assignment_id IS NOT NULL
            ORDER BY assignment_id, student_id, created_at DESC
          ) ps ON (ps.assignment_id = a.id OR ps.id = sub.session_id)
          ${whereClause}
          ORDER BY a.id, COALESCE(sub.marked_at, sub.submitted_at, a.created_at) DESC
        ) deduped_safe
        ORDER BY created_at DESC
      `;
      const fallbackResult = await pool.query(safeQuery, params);
      return fallbackResult.rows;
    }
  } catch (outerErr) {
    console.error('[getStudentAssignments Fatal Error]:', outerErr.message);
    return [];
  }
}

async function getTeacherAssignments(teacherId) {
  await ensureAssignmentTables();
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
  try {
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  } catch (err) {
    console.warn('[getTeacherAssignments] Multi-discipline query failed, falling back to core query:', err.message);
    try {
      const fallbackQuery = `
        SELECT a.*,
               (
                 SELECT COUNT(DISTINCT s_id)::int FROM (
                   SELECT student_id AS s_id FROM assignment_submissions WHERE assignment_id = a.id
                   UNION
                   SELECT student_id AS s_id FROM practical_sessions WHERE assignment_id = a.id
                 ) all_subs
               ) AS submitted_count,
               (SELECT COUNT(*)::int FROM students WHERE teacher_id = a.teacher_id) AS total_students
        FROM assignments a
        WHERE a.teacher_id = $1
        ORDER BY a.created_at DESC
      `;
      const fallbackResult = await pool.query(fallbackQuery, [teacherId]);
      return fallbackResult.rows;
    } catch (fErr) {
      console.error('[getTeacherAssignments] Critical fallback query failed:', fErr.message);
      const bareQuery = `SELECT a.*, 0 AS submitted_count, 0 AS total_students FROM assignments a WHERE a.teacher_id = $1 ORDER BY a.created_at DESC`;
      const bareResult = await pool.query(bareQuery, [teacherId]);
      return bareResult.rows;
    }
  }
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
  await ensureAssignmentTables();
  const assignResult = await pool.query(
    'SELECT id, title, titration_type FROM assignments WHERE id = $1 AND teacher_id = $2',
    [assignmentId, teacherId]
  );
  if (assignResult.rows.length === 0) return null;

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (s.id)
         s.id AS student_id,
         s.name AS student_name,
         s.email AS student_email,
         s.form AS student_form,
         COALESCE(sub.status, 'submitted') AS submission_status,
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
  } catch (err) {
    console.warn('[getAssignmentExportData] Multi-discipline export query failed, falling back to core query:', err.message);
    const fallbackRes = await pool.query(
      `SELECT DISTINCT ON (s.id)
         s.id AS student_id,
         s.name AS student_name,
         s.email AS student_email,
         s.form AS student_form,
         COALESCE(sub.status, 'submitted') AS submission_status,
         sub.teacher_feedback,
         sub.marked_at,
         COALESCE(sub.submitted_at, ps.created_at) AS submitted_at,
         ps.student_answer,
         (ps.score >= 8 OR ps.concordant_found = true) AS correct,
         ps.titration_type, ps.titration_title, ps.indicator_used, ps.trials_count, ps.trial_readings, COALESCE(ps.true_conc, 0) AS true_value, ps.mode AS practical_mode
       FROM students s
       LEFT JOIN assignment_submissions sub ON sub.assignment_id = $1 AND sub.student_id = s.id
       LEFT JOIN practical_sessions ps ON ps.assignment_id = $1 AND ps.student_id = s.id
       WHERE (sub.id IS NOT NULL OR ps.id IS NOT NULL)
       ORDER BY s.id, COALESCE(sub.submitted_at, ps.created_at) DESC`,
      [assignmentId]
    );
    return {
      assignment: assignResult.rows[0],
      rows: fallbackRes.rows
    };
  }
}

async function getAllSubmissions(teacherId, { page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;

  const query = `
    WITH all_candidates AS (
      SELECT
        sub.id AS submission_id,
        sub.assignment_id,
        sub.student_id,
        sub.status AS submission_status,
        sub.submitted_at,
        sub.teacher_feedback,
        sub.marked_at,
        sub.session_id,
        sub.qualitative_session_id,
        sub.organic_session_id,
        sub.composite_session_id,
        sub.solubility_session_id,
        sub.energy_session_id,
        sub.rates_session_id,
        sub.gas_session_id
      FROM assignment_submissions sub
      JOIN assignments a ON a.id = sub.assignment_id
      WHERE a.teacher_id = $1
      
      UNION
      
      SELECT
        NULL AS submission_id,
        ps.assignment_id,
        ps.student_id,
        'submitted' AS submission_status,
        ps.created_at AS submitted_at,
        NULL AS teacher_feedback,
        NULL AS marked_at,
        ps.id AS session_id,
        NULL AS qualitative_session_id,
        NULL AS organic_session_id,
        NULL AS composite_session_id,
        NULL AS solubility_session_id,
        NULL AS energy_session_id,
        NULL AS rates_session_id,
        NULL AS gas_session_id
      FROM practical_sessions ps
      JOIN assignments a ON a.id = ps.assignment_id
      WHERE a.teacher_id = $1 AND ps.assignment_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM assignment_submissions sub WHERE sub.assignment_id = ps.assignment_id AND sub.student_id = ps.student_id)

      UNION
      
      SELECT
        NULL AS submission_id,
        qs.assignment_id,
        qs.student_id,
        'submitted' AS submission_status,
        qs.created_at AS submitted_at,
        NULL AS teacher_feedback,
        NULL AS marked_at,
        NULL AS session_id,
        qs.id AS qualitative_session_id,
        NULL AS organic_session_id,
        NULL AS composite_session_id,
        NULL AS solubility_session_id,
        NULL AS energy_session_id,
        NULL AS rates_session_id,
        NULL AS gas_session_id
      FROM qualitative_sessions qs
      JOIN assignments a ON a.id = qs.assignment_id
      WHERE a.teacher_id = $1 AND qs.assignment_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM assignment_submissions sub WHERE sub.assignment_id = qs.assignment_id AND sub.student_id = qs.student_id)

      UNION
      
      SELECT
        NULL AS submission_id,
        os.assignment_id,
        os.student_id,
        'submitted' AS submission_status,
        os.created_at AS submitted_at,
        NULL AS teacher_feedback,
        NULL AS marked_at,
        NULL AS session_id,
        NULL AS qualitative_session_id,
        os.id AS organic_session_id,
        NULL AS composite_session_id,
        NULL AS solubility_session_id,
        NULL AS energy_session_id,
        NULL AS rates_session_id,
        NULL AS gas_session_id
      FROM organic_sessions os
      JOIN assignments a ON a.id = os.assignment_id
      WHERE a.teacher_id = $1 AND os.assignment_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM assignment_submissions sub WHERE sub.assignment_id = os.assignment_id AND sub.student_id = os.student_id)

      UNION
      
      SELECT
        NULL AS submission_id,
        cs.assignment_id,
        cs.student_id,
        'submitted' AS submission_status,
        cs.created_at AS submitted_at,
        NULL AS teacher_feedback,
        NULL AS marked_at,
        NULL AS session_id,
        NULL AS qualitative_session_id,
        NULL AS organic_session_id,
        cs.id AS composite_session_id,
        NULL AS solubility_session_id,
        NULL AS energy_session_id,
        NULL AS rates_session_id,
        NULL AS gas_session_id
      FROM composite_sessions cs
      JOIN assignments a ON a.id = cs.assignment_id
      WHERE a.teacher_id = $1 AND cs.assignment_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM assignment_submissions sub WHERE sub.assignment_id = cs.assignment_id AND sub.student_id = cs.student_id)

      UNION
      
      SELECT
        NULL AS submission_id,
        ss.assignment_id,
        ss.student_id,
        'submitted' AS submission_status,
        ss.created_at AS submitted_at,
        NULL AS teacher_feedback,
        NULL AS marked_at,
        NULL AS session_id,
        NULL AS qualitative_session_id,
        NULL AS organic_session_id,
        NULL AS composite_session_id,
        ss.id AS solubility_session_id,
        NULL AS energy_session_id,
        NULL AS rates_session_id,
        NULL AS gas_session_id
      FROM solubility_sessions ss
      JOIN assignments a ON a.id = ss.assignment_id
      WHERE a.teacher_id = $1 AND ss.assignment_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM assignment_submissions sub WHERE sub.assignment_id = ss.assignment_id AND sub.student_id = ss.student_id)

      UNION
      
      SELECT
        NULL AS submission_id,
        es.assignment_id,
        es.student_id,
        'submitted' AS submission_status,
        es.created_at AS submitted_at,
        NULL AS teacher_feedback,
        NULL AS marked_at,
        NULL AS session_id,
        NULL AS qualitative_session_id,
        NULL AS organic_session_id,
        NULL AS composite_session_id,
        NULL AS solubility_session_id,
        es.id AS energy_session_id,
        NULL AS rates_session_id,
        NULL AS gas_session_id
      FROM energy_sessions es
      JOIN assignments a ON a.id = es.assignment_id
      WHERE a.teacher_id = $1 AND es.assignment_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM assignment_submissions sub WHERE sub.assignment_id = es.assignment_id AND sub.student_id = es.student_id)

      UNION
      
      SELECT
        NULL AS submission_id,
        rs.assignment_id,
        rs.student_id,
        'submitted' AS submission_status,
        rs.created_at AS submitted_at,
        NULL AS teacher_feedback,
        NULL AS marked_at,
        NULL AS session_id,
        NULL AS qualitative_session_id,
        NULL AS organic_session_id,
        NULL AS composite_session_id,
        NULL AS solubility_session_id,
        NULL AS energy_session_id,
        rs.id AS rates_session_id,
        NULL AS gas_session_id
      FROM rates_sessions rs
      JOIN assignments a ON a.id = rs.assignment_id
      WHERE a.teacher_id = $1 AND rs.assignment_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM assignment_submissions sub WHERE sub.assignment_id = rs.assignment_id AND sub.student_id = rs.student_id)

      UNION
      
      SELECT
        NULL AS submission_id,
        gs.assignment_id,
        gs.student_id,
        'submitted' AS submission_status,
        gs.created_at AS submitted_at,
        NULL AS teacher_feedback,
        NULL AS marked_at,
        NULL AS session_id,
        NULL AS qualitative_session_id,
        NULL AS organic_session_id,
        NULL AS composite_session_id,
        NULL AS solubility_session_id,
        NULL AS energy_session_id,
        NULL AS rates_session_id,
        gs.id AS gas_session_id
      FROM gas_sessions gs
      JOIN assignments a ON a.id = gs.assignment_id
      WHERE a.teacher_id = $1 AND gs.assignment_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM assignment_submissions sub WHERE sub.assignment_id = gs.assignment_id AND sub.student_id = gs.student_id)
    )
    SELECT * FROM (
      SELECT DISTINCT ON (c.assignment_id, c.student_id)
        CONCAT(c.assignment_id, '_', c.student_id) AS sub_key,
        COALESCE(c.submission_id, c.session_id, c.qualitative_session_id, c.organic_session_id, c.composite_session_id, c.solubility_session_id, c.energy_session_id, c.rates_session_id, c.gas_session_id) AS submission_id,
        c.assignment_id,
        c.student_id,
        c.submission_status,
        c.submitted_at,
        c.teacher_feedback,
        c.marked_at,
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
      FROM all_candidates c
      JOIN students s ON s.id = c.student_id
      JOIN assignments a ON a.id = c.assignment_id
      LEFT JOIN (
        SELECT DISTINCT ON (assignment_id, student_id) *
        FROM practical_sessions
        WHERE assignment_id IS NOT NULL
        ORDER BY assignment_id, student_id, created_at DESC
      ) ps ON (ps.id = c.session_id OR (ps.assignment_id = a.id AND ps.student_id = c.student_id))
      LEFT JOIN qualitative_sessions qs ON qs.id = c.qualitative_session_id
      LEFT JOIN organic_sessions os ON os.id = c.organic_session_id
      LEFT JOIN composite_sessions cs ON cs.id = c.composite_session_id
      LEFT JOIN solubility_sessions ss ON ss.id = c.solubility_session_id
      LEFT JOIN energy_sessions es ON es.id = c.energy_session_id
      LEFT JOIN rates_sessions rs ON rs.id = c.rates_session_id
      LEFT JOIN gas_sessions gs ON gs.id = c.gas_session_id
      ORDER BY c.assignment_id, c.student_id, (c.submission_status = 'marked') DESC, c.submitted_at DESC
    ) deduped_subs
    ORDER BY submitted_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    WITH all_candidates AS (
      SELECT sub.assignment_id, sub.student_id
      FROM assignment_submissions sub
      JOIN assignments a ON a.id = sub.assignment_id
      WHERE a.teacher_id = $1
      
      UNION
      
      SELECT ps.assignment_id, ps.student_id
      FROM practical_sessions ps
      JOIN assignments a ON a.id = ps.assignment_id
      WHERE a.teacher_id = $1 AND ps.assignment_id IS NOT NULL

      UNION
      
      SELECT qs.assignment_id, qs.student_id
      FROM qualitative_sessions qs
      JOIN assignments a ON a.id = qs.assignment_id
      WHERE a.teacher_id = $1 AND qs.assignment_id IS NOT NULL

      UNION
      
      SELECT os.assignment_id, os.student_id
      FROM organic_sessions os
      JOIN assignments a ON a.id = os.assignment_id
      WHERE a.teacher_id = $1 AND os.assignment_id IS NOT NULL

      UNION
      
      SELECT cs.assignment_id, cs.student_id
      FROM composite_sessions cs
      JOIN assignments a ON a.id = cs.assignment_id
      WHERE a.teacher_id = $1 AND cs.assignment_id IS NOT NULL

      UNION
      
      SELECT ss.assignment_id, ss.student_id
      FROM solubility_sessions ss
      JOIN assignments a ON a.id = ss.assignment_id
      WHERE a.teacher_id = $1 AND ss.assignment_id IS NOT NULL

      UNION
      
      SELECT es.assignment_id, es.student_id
      FROM energy_sessions es
      JOIN assignments a ON a.id = es.assignment_id
      WHERE a.teacher_id = $1 AND es.assignment_id IS NOT NULL

      UNION
      
      SELECT rs.assignment_id, rs.student_id
      FROM rates_sessions rs
      JOIN assignments a ON a.id = rs.assignment_id
      WHERE a.teacher_id = $1 AND rs.assignment_id IS NOT NULL

      UNION
      
      SELECT gs.assignment_id, gs.student_id
      FROM gas_sessions gs
      JOIN assignments a ON a.id = gs.assignment_id
      WHERE a.teacher_id = $1 AND gs.assignment_id IS NOT NULL
    )
    SELECT COUNT(DISTINCT CONCAT(assignment_id, '_', student_id))::int AS count FROM all_candidates
  `;

  try {
    const [rowsRes, countRes] = await Promise.all([
      pool.query(query, [teacherId, limit, offset]),
      pool.query(countQuery, [teacherId])
    ]);

    const total = parseInt(countRes.rows[0] ? countRes.rows[0].count : 0, 10) || 0;
    return {
      submissions: rowsRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (err) {
    console.warn('[getAllSubmissions] Multi-discipline query failed, falling back to core submissions:', err.message);
    try {
      const fallbackQuery = `
        SELECT 
          sub.id AS submission_id,
          sub.assignment_id,
          sub.student_id,
          COALESCE(sub.status, 'submitted') AS submission_status,
          COALESCE(sub.submitted_at, NOW()) AS submitted_at,
          sub.teacher_feedback,
          sub.marked_at,
          s.name AS student_name,
          s.email AS student_email,
          s.form AS student_form,
          a.title AS assignment_title,
          a.titration_type AS assignment_type,
          ps.titration_type,
          ps.titration_title,
          ps.indicator_used,
          ps.trials_count,
          ps.trial_readings,
          ps.student_answer,
          COALESCE(ps.true_conc, 0) AS true_value,
          (ps.score >= 8 OR ps.concordant_found = true OR ps.correct = true) AS correct,
          ps.mode AS practical_mode,
          ps.details
        FROM assignment_submissions sub
        JOIN students s ON s.id = sub.student_id
        JOIN assignments a ON a.id = sub.assignment_id
        LEFT JOIN practical_sessions ps ON ps.id = sub.session_id
        WHERE a.teacher_id = $1
        ORDER BY sub.submitted_at DESC
        LIMIT $2 OFFSET $3
      `;
      const fallbackCount = `
        SELECT COUNT(*)::int AS count
        FROM assignment_submissions sub
        JOIN assignments a ON a.id = sub.assignment_id
        WHERE a.teacher_id = $1
      `;
      const [fRows, fCount] = await Promise.all([
        pool.query(fallbackQuery, [teacherId, limit, offset]),
        pool.query(fallbackCount, [teacherId])
      ]);
      const total = parseInt(fCount.rows[0] ? fCount.rows[0].count : 0, 10) || 0;
      return {
        submissions: fRows.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (fErr) {
      console.error('[getAllSubmissions] Critical fallback error:', fErr.message);
      return { submissions: [], total: 0, page, limit, totalPages: 1 };
    }
  }
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
      let foundSessionId = null;
      try {
        const pRes = await pool.query(
          `SELECT id FROM practical_sessions WHERE student_id = $1 AND (assignment_id = $2 OR titration_type = (SELECT titration_type FROM assignments WHERE id = $2)) ORDER BY created_at DESC LIMIT 1`,
          [sId, aId]
        );
        foundSessionId = pRes.rows[0]?.id || null;
        if (foundSessionId) {
          await pool.query('UPDATE practical_sessions SET assignment_id = $1 WHERE id = $2 AND assignment_id IS NULL', [aId, foundSessionId]);
        }
      } catch (e) {}

      const upsertQuery = `
        INSERT INTO assignment_submissions (assignment_id, student_id, session_id, status, teacher_feedback, marked_at)
        VALUES ($1, $2, $3, 'marked', $4, NOW())
        ON CONFLICT (assignment_id, student_id)
        DO UPDATE SET
          status = 'marked',
          session_id = COALESCE(assignment_submissions.session_id, EXCLUDED.session_id),
          teacher_feedback = COALESCE($4, assignment_submissions.teacher_feedback),
          marked_at = NOW()
        RETURNING *
      `;
      try {
        const result = await pool.query(upsertQuery, [aId, sId, foundSessionId, teacherFeedback || null]);
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

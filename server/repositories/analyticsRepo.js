const pool = require('../db/pool');

async function getClassAnalytics(teacherId) {
  const cte = `
    WITH all_class_sessions AS (
      SELECT
        ps.student_id,
        ps.created_at,
        COALESCE(ps.titration_type, 'acidBase') AS practical_type,
        (COALESCE(ps.score >= 8, ps.concordant_found, false)) AS is_correct
      FROM practical_sessions ps
      JOIN students s ON s.id = ps.student_id
      WHERE s.teacher_id = $1

      UNION ALL

      SELECT
        qs.student_id,
        qs.created_at,
        'qualitative' AS practical_type,
        (qs.correct IS TRUE OR (qs.cation_correct IS TRUE AND qs.anion_correct IS TRUE)) AS is_correct
      FROM qualitative_sessions qs
      JOIN students s ON s.id = qs.student_id
      WHERE s.teacher_id = $1

      UNION ALL

      SELECT
        os.student_id,
        os.created_at,
        'organic' AS practical_type,
        (os.correct IS TRUE OR os.functional_group_correct IS TRUE OR os.score_pct >= 60) AS is_correct
      FROM organic_sessions os
      JOIN students s ON s.id = os.student_id
      WHERE s.teacher_id = $1

      UNION ALL

      SELECT
        ss.student_id,
        ss.created_at,
        'solubility' AS practical_type,
        (ss.total_score >= 3.0 OR ss.temp_difference <= 2.5) AS is_correct
      FROM solubility_sessions ss
      JOIN students s ON s.id = ss.student_id
      WHERE s.teacher_id = $1

      UNION ALL

      SELECT
        es.student_id,
        es.created_at,
        'energy' AS practical_type,
        (es.total_score >= 8.0) AS is_correct
      FROM energy_sessions es
      JOIN students s ON s.id = es.student_id
      WHERE s.teacher_id = $1

      UNION ALL

      SELECT
        rs.student_id,
        rs.created_at,
        'rates' AS practical_type,
        (rs.total_score >= 8.0) AS is_correct
      FROM rates_sessions rs
      JOIN students s ON s.id = rs.student_id
      WHERE s.teacher_id = $1

      UNION ALL

      SELECT
        cs.student_id,
        cs.created_at,
        'kcseComposite' AS practical_type,
        (cs.total_score >= 20.0) AS is_correct
      FROM composite_sessions cs
      JOIN students s ON s.id = cs.student_id
      WHERE s.teacher_id = $1

      UNION ALL

      SELECT
        gs.student_id,
        gs.created_at,
        'gas' AS practical_type,
        (gs.total_score >= 6.0 OR gs.correct IS TRUE) AS is_correct
      FROM gas_sessions gs
      JOIN students s ON s.id = gs.student_id
      WHERE s.teacher_id = $1
    )
  `;

  const trendResult = await pool.query(
    `${cte}
     SELECT
       DATE(created_at) AS day,
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE is_correct) AS correct_count
     FROM all_class_sessions
     WHERE created_at >= NOW() - INTERVAL '30 days'
     GROUP BY DATE(created_at)
     ORDER BY day ASC`,
    [teacherId]
  );

  const accuracyOverTime = trendResult.rows.map(row => ({
    day: row.day,
    totalSessions: Number(row.total),
    accuracyPct: row.total > 0 ? +((row.correct_count / row.total) * 100).toFixed(1) : 0
  }));

  const typeResult = await pool.query(
    `${cte}
     SELECT
       practical_type AS titration_type,
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE is_correct) AS correct_count
     FROM all_class_sessions
     GROUP BY practical_type
     ORDER BY total DESC`,
    [teacherId]
  );

  const byType = typeResult.rows.map(row => ({
    titrationType: row.titration_type,
    totalSessions: Number(row.total),
    accuracyPct: row.total > 0 ? +((row.correct_count / row.total) * 100).toFixed(1) : 0,
    concordantPct: row.total > 0 ? +((row.correct_count / row.total) * 100).toFixed(1) : 0
  }));

  const summaryResult = await pool.query(
    `${cte}
     SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE is_correct) AS correct_count,
       COUNT(DISTINCT student_id) AS active_students
     FROM all_class_sessions`,
    [teacherId]
  );
  const summaryRow = summaryResult.rows[0] || {};
  const totalSessions = Number(summaryRow.total || 0);

  return {
    summary: {
      totalSessions,
      overallAccuracyPct: totalSessions > 0 ? +((summaryRow.correct_count / totalSessions) * 100).toFixed(1) : 0,
      activeStudents: Number(summaryRow.active_students || 0)
    },
    accuracyOverTime,
    byType
  };
}

module.exports = {
  getClassAnalytics
};

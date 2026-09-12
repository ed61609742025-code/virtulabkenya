const pool = require('../db/pool');

async function getClassAnalytics(teacherId) {
  try {
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
  } catch (err) {
    console.warn('[getClassAnalytics] Multi-module query failed, using safe fallback:', err.message);
    try {
      const fallbackSummary = await pool.query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE score >= 8 OR concordant_found = true OR correct = true) AS correct_count,
           COUNT(DISTINCT ps.student_id) AS active_students
         FROM practical_sessions ps
         JOIN students s ON s.id = ps.student_id
         WHERE s.teacher_id = $1`,
        [teacherId]
      );
      const row = fallbackSummary.rows[0] || {};
      const totalSessions = Number(row.total || 0);

      const fallbackTrend = await pool.query(
        `SELECT
           DATE(ps.created_at) AS day,
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE ps.score >= 8 OR ps.concordant_found = true OR ps.correct = true) AS correct_count
         FROM practical_sessions ps
         JOIN students s ON s.id = ps.student_id
         WHERE s.teacher_id = $1 AND ps.created_at >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(ps.created_at)
         ORDER BY day ASC`,
        [teacherId]
      );

      const fallbackType = await pool.query(
        `SELECT
           COALESCE(ps.titration_type, 'acidBase') AS titration_type,
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE ps.score >= 8 OR ps.concordant_found = true OR ps.correct = true) AS correct_count
         FROM practical_sessions ps
         JOIN students s ON s.id = ps.student_id
         WHERE s.teacher_id = $1
         GROUP BY COALESCE(ps.titration_type, 'acidBase')
         ORDER BY total DESC`,
        [teacherId]
      );

      return {
        summary: {
          totalSessions,
          overallAccuracyPct: totalSessions > 0 ? +((row.correct_count / totalSessions) * 100).toFixed(1) : 0,
          activeStudents: Number(row.active_students || 0)
        },
        accuracyOverTime: fallbackTrend.rows.map(r => ({
          day: r.day,
          totalSessions: Number(r.total),
          accuracyPct: r.total > 0 ? +((r.correct_count / r.total) * 100).toFixed(1) : 0
        })),
        byType: fallbackType.rows.map(r => ({
          titrationType: r.titration_type,
          totalSessions: Number(r.total),
          accuracyPct: r.total > 0 ? +((r.correct_count / r.total) * 100).toFixed(1) : 0,
          concordantPct: r.total > 0 ? +((r.correct_count / r.total) * 100).toFixed(1) : 0
        }))
      };
    } catch (fallbackErr) {
      console.error('[getClassAnalytics] Critical fallback error:', fallbackErr.message);
      return {
        summary: { totalSessions: 0, overallAccuracyPct: 0, activeStudents: 0 },
        accuracyOverTime: [],
        byType: []
      };
    }
  }
}

async function getStudentAnalytics(studentId) {
  try {
    const cte = `
      WITH all_student_sessions AS (
        SELECT
          ps.created_at,
          COALESCE(ps.titration_type, 'acidBase') AS practical_type,
          (COALESCE(ps.score >= 8, ps.concordant_found, false) OR ps.correct IS TRUE) AS is_correct
        FROM practical_sessions ps
        WHERE ps.student_id = $1

        UNION ALL

        SELECT
          qs.created_at,
          'qualitative' AS practical_type,
          (qs.correct IS TRUE OR (qs.cation_correct IS TRUE AND qs.anion_correct IS TRUE)) AS is_correct
        FROM qualitative_sessions qs
        WHERE qs.student_id = $1

        UNION ALL

        SELECT
          os.created_at,
          'organic' AS practical_type,
          (os.correct IS TRUE OR os.functional_group_correct IS TRUE OR os.score_pct >= 60) AS is_correct
        FROM organic_sessions os
        WHERE os.student_id = $1

        UNION ALL

        SELECT
          ss.created_at,
          'solubility' AS practical_type,
          (ss.total_score >= 3.0 OR ss.temp_difference <= 2.5) AS is_correct
        FROM solubility_sessions ss
        WHERE ss.student_id = $1

        UNION ALL

        SELECT
          es.created_at,
          'energy' AS practical_type,
          (es.total_score >= 8.0) AS is_correct
        FROM energy_sessions es
        WHERE es.student_id = $1

        UNION ALL

        SELECT
          rs.created_at,
          'rates' AS practical_type,
          (rs.total_score >= 8.0) AS is_correct
        FROM rates_sessions rs
        WHERE rs.student_id = $1

        UNION ALL

        SELECT
          cs.created_at,
          'kcseComposite' AS practical_type,
          (cs.total_score >= 20.0) AS is_correct
        FROM composite_sessions cs
        WHERE cs.student_id = $1

        UNION ALL

        SELECT
          gs.created_at,
          'gas' AS practical_type,
          (gs.total_score >= 6.0 OR gs.correct IS TRUE) AS is_correct
        FROM gas_sessions gs
        WHERE gs.student_id = $1
      )
    `;

    // 1. Overall Summary KPIs
    const summaryRes = await pool.query(
      `${cte}
       SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE is_correct) AS correct_count,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS weekly_sessions
       FROM all_student_sessions`,
      [studentId]
    );
    const summaryRow = summaryRes.rows[0] || {};
    const totalSessions = Number(summaryRow.total || 0);
    const correctCount = Number(summaryRow.correct_count || 0);
    const weeklySessions = Number(summaryRow.weekly_sessions || 0);
    const overallAccuracyPct = totalSessions > 0 ? +((correctCount / totalSessions) * 100).toFixed(1) : 0;

    // 2. 30-Day Accuracy Trajectory
    const trendRes = await pool.query(
      `${cte}
       SELECT
         DATE(created_at) AS day,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE is_correct) AS correct_count
       FROM all_student_sessions
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      [studentId]
    );
    const accuracyOverTime = trendRes.rows.map(row => ({
      day: row.day,
      totalSessions: Number(row.total),
      accuracyPct: row.total > 0 ? +((row.correct_count / row.total) * 100).toFixed(1) : 0
    }));

    // 3. Breakdown by Discipline
    const typeRes = await pool.query(
      `${cte}
       SELECT
         practical_type,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE is_correct) AS correct_count
       FROM all_student_sessions
       GROUP BY practical_type
       ORDER BY total DESC`,
      [studentId]
    );

    const typeDisplayMap = {
      'acidBase': 'Acid-Base',
      'redox': 'Redox',
      'precipitation': 'Precipitation',
      'complexometric': 'Complexometric',
      'qualitative': 'Qualitative Analysis',
      'organic': 'Organic Chemistry',
      'solubility': 'Solubility Curves',
      'energy': 'Thermochemistry',
      'rates': 'Reaction Rates',
      'gas': 'Gas Preparation',
      'kcseComposite': 'KCSE Mock Exam'
    };

    const byType = typeRes.rows.map(r => ({
      practicalType: r.practical_type,
      label: typeDisplayMap[r.practical_type] || r.practical_type,
      totalSessions: Number(r.total),
      accuracyPct: r.total > 0 ? +((r.correct_count / r.total) * 100).toFixed(1) : 0
    }));

    // Determine top discipline
    let topDiscipline = 'None yet';
    if (byType.length > 0) {
      topDiscipline = byType[0].label;
    }

    // 4. 4-Week Practice Velocity
    const velocityRes = await pool.query(
      `${cte}
       SELECT
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS week_0,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') AS week_1,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '21 days' AND created_at < NOW() - INTERVAL '14 days') AS week_2,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '28 days' AND created_at < NOW() - INTERVAL '21 days') AS week_3
       FROM all_student_sessions`,
      [studentId]
    );
    const velRow = velocityRes.rows[0] || {};
    const weeklyVelocity = [
      { label: '3 Wks Ago', count: Number(velRow.week_3 || 0), target: 3 },
      { label: '2 Wks Ago', count: Number(velRow.week_2 || 0), target: 3 },
      { label: 'Last Week', count: Number(velRow.week_1 || 0), target: 3 },
      { label: 'This Week', count: Number(velRow.week_0 || 0), target: 3 }
    ];

    return {
      summary: {
        totalSessions,
        overallAccuracyPct,
        weeklySessions,
        topDiscipline
      },
      accuracyOverTime,
      byType,
      weeklyVelocity
    };
  } catch (err) {
    console.warn('[getStudentAnalytics] Multi-module query failed, using safe fallback:', err.message);
    try {
      const fallbackSummary = await pool.query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE score >= 8 OR concordant_found = true OR correct = true) AS correct_count,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS weekly_sessions
         FROM practical_sessions
         WHERE student_id = $1`,
        [studentId]
      );
      const row = fallbackSummary.rows[0] || {};
      const totalSessions = Number(row.total || 0);
      const correctCount = Number(row.correct_count || 0);
      const weeklySessions = Number(row.weekly_sessions || 0);

      const fallbackTrend = await pool.query(
        `SELECT
           DATE(created_at) AS day,
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE score >= 8 OR concordant_found = true OR correct = true) AS correct_count
         FROM practical_sessions
         WHERE student_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(created_at)
         ORDER BY day ASC`,
        [studentId]
      );

      const fallbackType = await pool.query(
        `SELECT
           COALESCE(titration_type, 'acidBase') AS practical_type,
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE score >= 8 OR concordant_found = true OR correct = true) AS correct_count
         FROM practical_sessions
         WHERE student_id = $1
         GROUP BY COALESCE(titration_type, 'acidBase')
         ORDER BY total DESC`,
        [studentId]
      );

      return {
        summary: {
          totalSessions,
          overallAccuracyPct: totalSessions > 0 ? +((correctCount / totalSessions) * 100).toFixed(1) : 0,
          weeklySessions,
          topDiscipline: fallbackType.rows[0] ? fallbackType.rows[0].practical_type : 'Volumetric'
        },
        accuracyOverTime: fallbackTrend.rows.map(r => ({
          day: r.day,
          totalSessions: Number(r.total),
          accuracyPct: r.total > 0 ? +((r.correct_count / r.total) * 100).toFixed(1) : 0
        })),
        byType: fallbackType.rows.map(r => ({
          practicalType: r.practical_type,
          label: r.practical_type,
          totalSessions: Number(r.total),
          accuracyPct: r.total > 0 ? +((r.correct_count / r.total) * 100).toFixed(1) : 0
        })),
        weeklyVelocity: [
          { label: '3 Wks Ago', count: 0, target: 3 },
          { label: '2 Wks Ago', count: 0, target: 3 },
          { label: 'Last Week', count: 0, target: 3 },
          { label: 'This Week', count: weeklySessions, target: 3 }
        ]
      };
    } catch (fallbackErr) {
      console.error('[getStudentAnalytics] Critical fallback error:', fallbackErr.message);
      return {
        summary: { totalSessions: 0, overallAccuracyPct: 0, weeklySessions: 0, topDiscipline: 'None' },
        accuracyOverTime: [],
        byType: [],
        weeklyVelocity: [
          { label: '3 Wks Ago', count: 0, target: 3 },
          { label: '2 Wks Ago', count: 0, target: 3 },
          { label: 'Last Week', count: 0, target: 3 },
          { label: 'This Week', count: 0, target: 3 }
        ]
      };
    }
  }
}

module.exports = {
  getClassAnalytics,
  getStudentAnalytics
};

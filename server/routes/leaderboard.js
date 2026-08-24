// ============================================================
//  VirtuLab Kenya — Leaderboard Route
// ============================================================
//
// GET /api/leaderboard/class
//
// Ranked by accuracy (% of sessions marked correct), scoped to a
// single teacher's class (students.teacher_id). A minimum session
// count is required to appear on the ranking, so one lucky first
// attempt can't land someone at #1.
//
// Teachers get the full ranked list (they already see every
// student's individual sessions on the dashboard, so this adds no
// new exposure). Students get only the top 5 plus their own rank —
// full public exposure of a whole class's standing can discourage
// lower performers, so this keeps the motivational upside without
// putting everyone's position on display to everyone else.

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const pool = require('../db/pool');

const router = express.Router();
const MIN_SESSIONS = 3;

async function getRankedClass(teacherId) {
  const result = await pool.query(
    `WITH all_class_sessions AS (
       SELECT ps.student_id, ps.correct AS is_correct
       FROM practical_sessions ps
       JOIN students s ON s.id = ps.student_id
       WHERE s.teacher_id = $1

       UNION ALL

       SELECT qs.student_id, (qs.correct IS TRUE OR (qs.cation_correct IS TRUE AND qs.anion_correct IS TRUE)) AS is_correct
       FROM qualitative_sessions qs
       JOIN students s ON s.id = qs.student_id
       WHERE s.teacher_id = $1

       UNION ALL

       SELECT os.student_id, (os.correct IS TRUE OR os.functional_group_correct IS TRUE OR os.score_pct >= 60) AS is_correct
       FROM organic_sessions os
       JOIN students s ON s.id = os.student_id
       WHERE s.teacher_id = $1

       UNION ALL

       SELECT ss.student_id, (ss.total_score >= 3.0 OR ss.temp_difference <= 2.5) AS is_correct
       FROM solubility_sessions ss
       JOIN students s ON s.id = ss.student_id
       WHERE s.teacher_id = $1

       UNION ALL

       SELECT es.student_id, (es.total_score >= 8.0) AS is_correct
       FROM energy_sessions es
       JOIN students s ON s.id = es.student_id
       WHERE s.teacher_id = $1

       UNION ALL

       SELECT rs.student_id, (rs.total_score >= 8.0) AS is_correct
       FROM rates_sessions rs
       JOIN students s ON s.id = rs.student_id
       WHERE s.teacher_id = $1

       UNION ALL

       SELECT cs.student_id, (cs.total_score >= 20.0) AS is_correct
       FROM composite_sessions cs
       JOIN students s ON s.id = cs.student_id
       WHERE s.teacher_id = $1

       UNION ALL

       SELECT gs.student_id, (gs.total_score >= 6.0 OR gs.correct IS TRUE) AS is_correct
       FROM gas_sessions gs
       JOIN students s ON s.id = gs.student_id
       WHERE s.teacher_id = $1
     )
     SELECT s.id, s.name, s.form,
            COUNT(acs.student_id) AS total_sessions,
            COUNT(acs.student_id) FILTER (WHERE acs.is_correct) AS correct_count
     FROM students s
     JOIN all_class_sessions acs ON acs.student_id = s.id
     WHERE s.teacher_id = $1
     GROUP BY s.id, s.name, s.form
     HAVING COUNT(acs.student_id) >= $2
     ORDER BY
       (COUNT(acs.student_id) FILTER (WHERE acs.is_correct))::float / NULLIF(COUNT(acs.student_id), 0) DESC,
       COUNT(acs.student_id) DESC`,
    [teacherId, MIN_SESSIONS]
  );

  return result.rows.map((row, i) => ({
    rank: i + 1,
    studentId: row.id,
    name: row.name,
    form: row.form,
    totalSessions: Number(row.total_sessions),
    accuracyPct: row.total_sessions > 0
      ? +((row.correct_count / row.total_sessions) * 100).toFixed(1)
      : 0
  }));
}

router.get('/class', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role === 'teacher') {
    const ranked = await getRankedClass(req.user.id);
    return res.json({ scope: 'class', minSessionsRequired: MIN_SESSIONS, ranked });
  }

  if (req.user.role === 'student') {
    const studentResult = await pool.query(
      'SELECT teacher_id FROM students WHERE id = $1',
      [req.user.id]
    );
    const teacherId = studentResult.rows[0] ? studentResult.rows[0].teacher_id : null;

    if (!teacherId) {
      return res.json({
        scope: 'class',
        minSessionsRequired: MIN_SESSIONS,
        top: [],
        you: null,
        message: 'No teacher linked to your account, so a class leaderboard isn\'t available. Ask your teacher for a teacher code to link your account.'
      });
    }

    const ranked = await getRankedClass(teacherId);
    const top = ranked.slice(0, 5);
    const you = ranked.find(r => r.studentId === req.user.id) || null;

    return res.json({ scope: 'class', minSessionsRequired: MIN_SESSIONS, top, you });
  }

  return res.status(403).json({ error: 'Unrecognized account role.' });
}));

module.exports = router;

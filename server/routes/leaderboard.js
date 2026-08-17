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
const pool = require('../db/pool');

const router = express.Router();
const MIN_SESSIONS = 3;

async function getRankedClass(teacherId) {
  const result = await pool.query(
    `SELECT s.id, s.name, s.form,
            COUNT(ps.id) AS total_sessions,
            COUNT(ps.id) FILTER (WHERE ps.correct) AS correct_count
     FROM students s
     LEFT JOIN practical_sessions ps ON ps.student_id = s.id
     WHERE s.teacher_id = $1
     GROUP BY s.id, s.name, s.form
     HAVING COUNT(ps.id) >= $2
     ORDER BY
       (COUNT(ps.id) FILTER (WHERE ps.correct))::float / NULLIF(COUNT(ps.id), 0) DESC,
       COUNT(ps.id) DESC`,
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

router.get('/class', authMiddleware, async (req, res) => {
  try {
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
  } catch (err) {
    console.error('Get leaderboard error:', err.message);
    res.status(500).json({ error: 'Could not load leaderboard.' });
  }
});

module.exports = router;

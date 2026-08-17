// ============================================================
//  VirtuLab Kenya — Analytics Route
// ============================================================
<<<<<<< HEAD

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const analyticsRepo = require('../repositories/analyticsRepo');

const router = express.Router();

// GET /api/analytics/class — Teacher class analytics dashboard data
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const analyticsData = await analyticsRepo.getClassAnalytics(req.user.id);
  return res.json(analyticsData);
}));
=======
//
// GET /api/analytics/class — requires teacher token
//
// Returns pre-aggregated data for dashboard charts, computed via
// SQL GROUP BY rather than pulling every session row to the client
// and aggregating in JS. This keeps the endpoint fast regardless of
// how many sessions a class accumulates over a term — the result
// set stays small (one row per day, one row per titration type)
// even if the underlying session count grows into the thousands.

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  try {
    // ── Accuracy over time (last 30 days, by day) ──────────────
    const trendResult = await pool.query(
      `SELECT
         DATE(ps.created_at) AS day,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE ps.correct) AS correct_count
       FROM practical_sessions ps
       JOIN students s ON s.id = ps.student_id
       WHERE s.teacher_id = $1
         AND ps.created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(ps.created_at)
       ORDER BY day ASC`,
      [req.user.id]
    );

    const accuracyOverTime = trendResult.rows.map(row => ({
      day: row.day,
      totalSessions: Number(row.total),
      accuracyPct: row.total > 0 ? +((row.correct_count / row.total) * 100).toFixed(1) : 0
    }));

    // ── Breakdown by titration type ─────────────────────────────
    const typeResult = await pool.query(
      `SELECT
         ps.titration_type,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE ps.correct) AS correct_count,
         COUNT(*) FILTER (WHERE ps.concordant_found) AS concordant_count
       FROM practical_sessions ps
       JOIN students s ON s.id = ps.student_id
       WHERE s.teacher_id = $1
       GROUP BY ps.titration_type
       ORDER BY total DESC`,
      [req.user.id]
    );

    const byType = typeResult.rows.map(row => ({
      titrationType: row.titration_type,
      totalSessions: Number(row.total),
      accuracyPct: row.total > 0 ? +((row.correct_count / row.total) * 100).toFixed(1) : 0,
      concordantPct: row.total > 0 ? +((row.concordant_count / row.total) * 100).toFixed(1) : 0
    }));

    // ── Overall summary ──────────────────────────────────────────
    const summaryResult = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE ps.correct) AS correct_count,
         COUNT(DISTINCT ps.student_id) AS active_students
       FROM practical_sessions ps
       JOIN students s ON s.id = ps.student_id
       WHERE s.teacher_id = $1`,
      [req.user.id]
    );
    const summaryRow = summaryResult.rows[0];
    const totalSessions = Number(summaryRow.total);

    res.json({
      summary: {
        totalSessions,
        overallAccuracyPct: totalSessions > 0 ? +((summaryRow.correct_count / totalSessions) * 100).toFixed(1) : 0,
        activeStudents: Number(summaryRow.active_students)
      },
      accuracyOverTime,
      byType
    });
  } catch (err) {
    console.error('Get class analytics error:', err.message);
    res.status(500).json({ error: 'Could not load analytics.' });
  }
});
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

module.exports = router;

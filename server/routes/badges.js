// ============================================================
//  VirtuLab Kenya — Badges Route
// ============================================================
<<<<<<< HEAD

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const badgeRepo = require('../repositories/badgeRepo');
=======
//
// GET /api/badges/mine  — requires student token
// GET /api/badges/class — requires teacher token, badge status
//                          for every student linked to this teacher
//
// Badges are computed live from practical_sessions on each
// request rather than stored in their own table. This keeps them
// tied directly to real, objective session history (matching the
// "usage logs" data the project's evaluation framework already
// relies on) and avoids a schema migration for what is, at its
// core, a read-only view over existing data.
//
// The badge rules live in one place (computeBadges) so the
// student's own view and the teacher's class view can never drift
// out of sync with each other.

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

const router = express.Router();

function computeBadges(sessions) {
  const totalSessions = sessions.length;
  const distinctTypes = new Set(sessions.map(s => s.titration_type)).size;
  const correctCount = sessions.filter(s => s.correct).length;
  const accuracyPct = totalSessions > 0 ? (correctCount / totalSessions) * 100 : 0;
  const anyConcordant = sessions.some(s => s.concordant_found);
  const anyPrecision = sessions.some(s => s.correct && (s.trials_count || 0) <= 2);
  const last3 = sessions.slice(-3);
  const perfectStreak = last3.length === 3 && last3.every(s => s.correct);

  const badges = [
    {
      key: 'firstSteps',
      name: 'First Steps',
      description: 'Complete your first practical session.',
      icon: '🧪',
      unlocked: totalSessions >= 1,
      progress: `${Math.min(totalSessions, 1)}/1 sessions`
    },
    {
      key: 'concordant',
      name: 'Concordant!',
      description: 'Get two titre readings within 0.10 cm³ of each other.',
      icon: '🎯',
      unlocked: anyConcordant,
      progress: anyConcordant ? 'Achieved' : 'Not yet achieved'
    },
    {
      key: 'precision',
      name: 'Precision',
      description: 'Get a correct result in 2 trials or fewer.',
      icon: '⚡',
      unlocked: anyPrecision,
      progress: anyPrecision ? 'Achieved' : 'Not yet achieved'
    },
    {
      key: 'allRounder',
      name: 'All-Rounder',
      description: 'Try all four titration types: acid-base, redox, precipitation, complexometric.',
      icon: '🧬',
      unlocked: distinctTypes >= 4,
      progress: `${distinctTypes}/4 types tried`
    },
    {
      key: 'streak',
      name: 'On a Roll',
      description: 'Get your last 3 sessions correct in a row.',
      icon: '🔥',
      unlocked: perfectStreak,
      progress: perfectStreak ? 'Achieved' : 'Not yet achieved'
    },
    {
      key: 'sharpshooter',
      name: 'Sharpshooter',
      description: 'Reach 80% accuracy or higher across at least 5 sessions.',
      icon: '🏆',
      unlocked: totalSessions >= 5 && accuracyPct >= 80,
      progress: totalSessions >= 5 ? `${accuracyPct.toFixed(0)}% accuracy` : `${totalSessions}/5 sessions needed`
    }
  ];

  return {
    badges,
    stats: { totalSessions, correctCount, accuracyPct: +accuracyPct.toFixed(1), distinctTypes }
  };
}

<<<<<<< HEAD
// GET /api/badges/mine — Student badges
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const sessions = await badgeRepo.getStudentBadgeData(req.user.id);
  const result = computeBadges(sessions);
  return res.json(result);
}));

// GET /api/badges/class — Teacher class badges
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const classData = await badgeRepo.getClassBadgeData(req.user.id);
  const summary = classData.map(({ student, sessions }) => {
    const computed = computeBadges(sessions);
    return {
      student,
      unlockedCount: computed.badges.filter(b => b.unlocked).length,
      totalBadges: computed.badges.length,
      badges: computed.badges,
      stats: computed.stats
    };
  });
  return res.json({ students: summary });
}));

module.exports = router;
module.exports.computeBadges = computeBadges;

=======
// ── GET /api/badges/mine ────────────────────────────────────────
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT titration_type, correct, concordant_found, trials_count, created_at
       FROM practical_sessions
       WHERE student_id = $1
       ORDER BY created_at ASC`,
      [req.user.id]
    );

    const { badges, stats } = computeBadges(result.rows);
    res.json({ badges, stats });
  } catch (err) {
    console.error('Get badges error:', err.message);
    res.status(500).json({ error: 'Could not load badges.' });
  }
});

// ── GET /api/badges/class ───────────────────────────────────────
// Requires a teacher token. Returns badge status for every student
// linked to this teacher — including students with zero sessions
// (shown with everything locked), so a teacher sees the whole
// class, not just the ones who've already engaged.
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  try {
    const studentsResult = await pool.query(
      'SELECT id, name, form FROM students WHERE teacher_id = $1 ORDER BY name ASC',
      [req.user.id]
    );
    const students = studentsResult.rows;

    if (students.length === 0) {
      return res.json({ classBadges: [] });
    }

    const studentIds = students.map(s => s.id);
    const sessionsResult = await pool.query(
      `SELECT student_id, titration_type, correct, concordant_found, trials_count, created_at
       FROM practical_sessions
       WHERE student_id = ANY($1::int[])
       ORDER BY created_at ASC`,
      [studentIds]
    );

    const sessionsByStudent = {};
    sessionsResult.rows.forEach(row => {
      if (!sessionsByStudent[row.student_id]) sessionsByStudent[row.student_id] = [];
      sessionsByStudent[row.student_id].push(row);
    });

    const classBadges = students.map(s => {
      const { badges, stats } = computeBadges(sessionsByStudent[s.id] || []);
      return {
        studentId: s.id,
        name: s.name,
        form: s.form,
        unlockedCount: badges.filter(b => b.unlocked).length,
        totalBadges: badges.length,
        badges,
        stats
      };
    });

    res.json({ classBadges });
  } catch (err) {
    console.error('Get class badges error:', err.message);
    res.status(500).json({ error: 'Could not load class badges.' });
  }
});

module.exports = router;
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

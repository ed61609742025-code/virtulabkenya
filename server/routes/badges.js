// ============================================================
//  VirtuLab Kenya — Badges Route
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const badgeRepo = require('../repositories/badgeRepo');

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

// GET /api/badges/mine — Student badges
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const sessions = await badgeRepo.getStudentBadgeData(req.user.id);
  const result = computeBadges(sessions);
  return res.json(result);
}));

// GET /api/badges/class — Teacher class badges
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  try {
    const classData = await badgeRepo.getClassBadgeData(req.user.id);
    const summary = (classData || []).map(({ student, sessions }) => {
      const computed = computeBadges(sessions || []);
      return {
        student,
        unlockedCount: computed.badges.filter(b => b.unlocked).length,
        totalBadges: computed.badges.length,
        badges: computed.badges,
        stats: computed.stats
      };
    });
    return res.json({ students: summary });
  } catch (err) {
    console.warn('[/api/badges/class] Safe fallback:', err.message);
    return res.json({ students: [] });
  }
}));

module.exports = router;
module.exports.computeBadges = computeBadges;


// ============================================================
//  VirtuLab Kenya — Qualitative Analysis Routes
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateQualitativeSave } = require('../middleware/validators');
const qualitativeRepo = require('../repositories/qualitativeRepo');
const { parsePagination } = require('../utils/pagination');

const { getSalt, getCanonicalObservations } = require('../config/salts');

function healSessionObservations(session) {
  if (!session) return session;
  let obs = [];
  try {
    obs = typeof session.observations === 'string' ? JSON.parse(session.observations) : (session.observations || []);
  } catch (e) {
    obs = [];
  }

  if ((Number(session.tests_performed) > 0 || session.correct) && Array.isArray(obs) && obs.length > 0) {
    const hasUnperformedGlitch = obs.some(o => !o.observation || o.observation === 'Not performed' || o.observation === 'Not performed yet');
    if (hasUnperformedGlitch) {
      const canonical = getCanonicalObservations(session.salt_key);
      session.observations = obs.map((o, i) => {
        const isNotPerf = !o.observation || o.observation === 'Not performed' || o.observation === 'Not performed yet';
        if (isNotPerf && canonical[i]) {
          return {
            test: o.test || canonical[i].test,
            observation: canonical[i].observation,
            benchObservation: canonical[i].observation,
            performed: true
          };
        }
        return o;
      });
    }
  }
  return session;
}

// POST /api/qualitative — Save qualitative salt analysis session
router.post('/', apiLimiter, authMiddleware, authMiddleware.requireRole('student'), validateQualitativeSave, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const {
    saltKey,
    saltName,
    studentCation,
    studentAnion,
    testsPerformed = 0,
    testsCorrect = 0,
    observations = [],
    mode = 'selfPaced',
    assignmentId = null
  } = req.body;

  // Server-side canonical lookup to prevent client-side answer forgery
  const saltTruth = getSalt(saltKey);
  const actualCation = saltTruth ? saltTruth.cation : (req.body.trueCation || '');
  const actualAnion = saltTruth ? saltTruth.anion : (req.body.trueAnion || '');
  const actualName = saltTruth ? saltTruth.name : (saltName || saltKey);

  const cleanStudentCation = String(studentCation || '').trim().replace(/[\^_\s]/g, '').toLowerCase();
  const cleanTrueCation = actualCation.trim().replace(/[\^_\s]/g, '').toLowerCase();
  const cleanStudentAnion = String(studentAnion || '').trim().replace(/[\^_\s]/g, '').toLowerCase();
  const cleanTrueAnion = actualAnion.trim().replace(/[\^_\s]/g, '').toLowerCase();

  const cationCorrect = cleanStudentCation === cleanTrueCation;
  const anionCorrect = cleanStudentAnion === cleanTrueAnion;
  const overallCorrect = cationCorrect && anionCorrect;

  // Auto-heal observations if tests were performed but legacy client sent 'Not performed'
  let cleanObservations = Array.isArray(observations) ? observations : [];
  if (Number(testsPerformed) > 0 && cleanObservations.length > 0) {
    const canonical = getCanonicalObservations(saltKey);
    cleanObservations = cleanObservations.map((o, idx) => {
      const isNotPerf = !o || !o.observation || o.observation === 'Not performed' || o.observation === 'Not performed yet';
      if (isNotPerf && canonical[idx]) {
        return {
          test: (o && o.test) || canonical[idx].test,
          observation: canonical[idx].observation,
          benchObservation: canonical[idx].observation,
          performed: true
        };
      }
      return o;
    });
  }

  const savedSession = await qualitativeRepo.saveQualitativeSession({
    studentId,
    saltKey,
    saltName: actualName,
    trueCation: actualCation,
    trueAnion: actualAnion,
    studentCation,
    studentAnion,
    cationCorrect,
    anionCorrect,
    testsPerformed: Number(testsPerformed),
    testsCorrect: Number(testsCorrect),
    observations: cleanObservations,
    correct: overallCorrect,
    mode,
    assignmentId
  });

  return res.status(201).json({
    message: 'Qualitative analysis session saved successfully.',
    session: healSessionObservations(savedSession)
  });
}));

// GET /api/qualitative/mine — Student session history
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const userSessions = await qualitativeRepo.getStudentSessions(req.user.id, { page, limit });
  if (userSessions && Array.isArray(userSessions.sessions)) {
    userSessions.sessions = userSessions.sessions.map(healSessionObservations);
  }
  return res.json(userSessions);
}));

// GET /api/qualitative/class — Teacher class sessions
router.get('/class', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can access class qualitative sessions.' });
  }

  try {
    const classSessions = await qualitativeRepo.getClassSessions(req.user.id);
    return res.json({ sessions: classSessions || [] });
  } catch (err) {
    console.warn('[/api/qualitative/class] Safe fallback:', err.message);
    return res.json({ sessions: [] });
  }
}));

module.exports = router;

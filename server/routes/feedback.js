// ============================================================
//  VirtuLab Kenya — AI Feedback & KCSE Tutor Routes (Gemini)
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { ForbiddenError, ValidationError } = require('../utils/AppError');
const aiTutorService = require('../services/aiTutorService');
const remediationDrillService = require('../services/remediationDrillService');

const router = express.Router();

/**
 * Middleware helper to ensure AI Tutor is NOT invoked during formal assignments or exams.
 */
function guardAssessmentMode(req, res, next) {
  const { studyMode } = req.body;
  if (studyMode === 'assignment' || studyMode === 'exam') {
    return res.status(403).json({ error: 'AI Assistant is disabled during formal assignments and exams.' });
  }
  next();
}

/**
 * POST /api/feedback/tutor-hint
 * Socratic hint coaching during practice experiments.
 */
router.post('/tutor-hint', authMiddleware, authMiddleware.requireRole('student'), guardAssessmentMode, asyncHandler(async (req, res) => {
  const { experimentType, context, studentQuery } = req.body;

  try {
    const hint = await aiTutorService.generateSocraticHint({
      experimentType: experimentType || 'Chemistry Practical',
      context: context || {},
      studentQuery: studentQuery || 'What should I observe or do next?'
    });
    return res.json({ success: true, hint });
  } catch (err) {
    if (err.message === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI Assistant is not configured on this server.' });
    }
    return res.status(503).json({ error: 'AI Assistant is temporarily unavailable.' });
  }
}));

/**
 * POST /api/feedback/grade-kcse
 * Automated KNEC observation grading & keyword analysis.
 */
router.post('/grade-kcse', authMiddleware, authMiddleware.requireRole('student'), guardAssessmentMode, asyncHandler(async (req, res) => {
  const { testTitle, studentObservation, expectedObservation, expectedInference } = req.body;

  if (!studentObservation) {
    throw new ValidationError('Student observation text is required.');
  }

  try {
    const result = await aiTutorService.gradeKcseObservation({
      testTitle,
      studentObservation,
      expectedObservation,
      expectedInference
    });
    return res.json({ success: true, evaluation: result });
  } catch (err) {
    if (err.message === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI Grading is not configured on this server.' });
    }
    return res.status(503).json({ error: 'AI Grading is temporarily unavailable.' });
  }
}));

/**
 * POST /api/feedback/explain
 * Existing diagnostic explanation / worked calculation solution endpoint.
 */
router.post('/explain', authMiddleware, authMiddleware.requireRole('student'), guardAssessmentMode, asyncHandler(async (req, res) => {
  const {
    mode,
    titrationTitle,
    trials,
    studentAverage,
    correctAverage,
    averageCorrect,
    studentAnswer,
    expectedAnswer,
    concentrationCorrect,
    answerSymbol,
    sessionAnalyteVolume,
    sessionTitrantConc,
    titrantName,
    ratio,
    equation
  } = req.body;

  if (!trials || !Array.isArray(trials) || trials.length === 0) {
    throw new ValidationError('Trial data is required.');
  }

  const isWorkingMode = mode === 'working';
  const bothCorrect = averageCorrect && concentrationCorrect;

  if (!isWorkingMode && bothCorrect) {
    return res.json({ feedback: null });
  }

  try {
    if (isWorkingMode) {
      const solution = await aiTutorService.generateWorkedSolution({
        titrationTitle,
        equation,
        trials,
        sessionTitrantConc,
        sessionAnalyteVolume,
        ratio,
        correctAverage,
        expectedAnswer,
        answerSymbol
      });
      return res.json({ feedback: solution });
    } else {
      const hint = await aiTutorService.generateSocraticHint({
        experimentType: 'Titration Practical',
        context: { titrationTitle, studentAverage, correctAverage, studentAnswer, expectedAnswer },
        studentQuery: `My average was ${studentAverage} (correct: ${correctAverage}) and my conc was ${studentAnswer} (expected: ${expectedAnswer}). What went wrong?`
      });
      return res.json({ feedback: hint });
    }
  } catch (err) {
    if (err.message === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI feedback is not configured on this server.' });
    }
    return res.status(503).json({ error: 'AI feedback is temporarily unavailable.' });
  }
}));

/**
 * GET /api/feedback/drill-catalog
 * Retrieve available micro-drills categorized by the 5 KNEC competency axes
 */
router.get('/drill-catalog', authMiddleware, asyncHandler(async (req, res) => {
  const catalog = remediationDrillService.getDrillCatalog();
  return res.json({ success: true, catalog });
}));

/**
 * POST /api/feedback/remediation-drill
 * Fetch a targeted micro-drill for a specific competency code
 */
router.post('/remediation-drill', authMiddleware, asyncHandler(async (req, res) => {
  const { competencyCode, drillId } = req.body;
  if (!competencyCode) {
    throw new ValidationError('competencyCode is required.');
  }

  const rawDrill = remediationDrillService.getRemediationDrill(competencyCode, drillId);
  if (!rawDrill) {
    return res.status(404).json({ success: false, error: 'Remediation drill not found for this competency.' });
  }

  // Sanitize drill questions so correct answers/flags are omitted
  const sanitized = {
    id: rawDrill.id,
    competencyCode: rawDrill.competencyCode,
    title: rawDrill.title,
    durationSeconds: rawDrill.durationSeconds,
    knecMarkWeight: rawDrill.knecMarkWeight,
    examinerRule: rawDrill.examinerRule,
    objective: rawDrill.objective,
    questions: rawDrill.questions.map(q => {
      const qCopy = {
        id: q.id,
        type: q.type,
        prompt: q.prompt
      };
      if (q.options) {
        qCopy.options = q.options.map(opt => ({ id: opt.id, text: opt.text }));
      }
      return qCopy;
    })
  };

  return res.json({ success: true, drill: sanitized });
}));

/**
 * POST /api/feedback/grade-drill
 * Grade student answers and compute score & competency boost
 */
router.post('/grade-drill', authMiddleware, asyncHandler(async (req, res) => {
  const { competencyCode, drillId, answers } = req.body;
  if (!competencyCode || !drillId) {
    throw new ValidationError('competencyCode and drillId are required.');
  }

  const evaluation = remediationDrillService.gradeDrillSubmission(
    competencyCode,
    drillId,
    answers || {}
  );

  return res.json({ success: true, evaluation });
}));

/**
 * POST /api/feedback/drill-hint
 * Provide Socratic AI hint during drill practice
 */
router.post('/drill-hint', authMiddleware, asyncHandler(async (req, res) => {
  const { competencyCode, drillId, questionId, studentContext } = req.body;
  if (!competencyCode || !drillId || !questionId) {
    throw new ValidationError('competencyCode, drillId, and questionId are required.');
  }

  try {
    const hint = await remediationDrillService.getDrillAiHint({
      competencyCode,
      drillId,
      questionId,
      studentContext
    });
    return res.json({ success: true, hint });
  } catch (err) {
    if (err.message === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI coaching is not configured on this server.' });
    }
    return res.status(503).json({ error: 'AI hint is temporarily unavailable.' });
  }
}));

module.exports = router;


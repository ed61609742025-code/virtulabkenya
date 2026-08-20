// ============================================================
//  VirtuLab Kenya — AI Feedback & KCSE Tutor Routes (Gemini)
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { ForbiddenError, ValidationError } = require('../utils/AppError');
const aiTutorService = require('../services/aiTutorService');

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

module.exports = router;

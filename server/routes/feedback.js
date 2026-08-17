// ============================================================
<<<<<<< HEAD
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
=======
//  VirtuLab Kenya — AI Feedback Route (Gemini)
// ============================================================
//
// POST /api/feedback/explain — requires student token
//
// Generates a short, personalized explanation of a student's
// likely error, using their own actual numbers (trial readings,
// their entered average vs. the correct one, their concentration
// answer vs. what their own average implies). This is the one
// place in the app where a rule-based "Correct/Incorrect" check
// genuinely can't do what's needed — diagnosing *why* a specific
// student's specific numbers went wrong.
//
// Uses the Google Gemini API. Requires GEMINI_API_KEY in the
// server's .env. If it's not configured, or the request fails for
// any reason, this endpoint fails quietly (503) rather than
// breaking the student's submit flow — AI feedback is an
// enhancement on top of the core marking, not a dependency of it.
//
// GEMINI_MODEL is also read from .env (defaults to a fast, cheap
// model below) so the model can be updated later without touching
// code — Google's available model names change over time, and
// what's current at the time this was written may not be current
// when you're reading it. Check https://ai.google.dev/gemini-api/docs/models
// for the current list if the default stops working.

const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

router.post('/explain', authMiddleware, authMiddleware.requireRole('student'), async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI feedback is not configured on this server.' });
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const {
    mode, // 'explain' (default) or 'working'
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8
    titrationTitle,
    trials,
    studentAverage,
    correctAverage,
    averageCorrect,
    studentAnswer,
    expectedAnswer,
    concentrationCorrect,
    answerSymbol,
<<<<<<< HEAD
=======
    // Only needed for 'working' mode, to show the actual formula
    // substitution rather than just the final numbers.
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8
    sessionAnalyteVolume,
    sessionTitrantConc,
    titrantName,
    ratio,
<<<<<<< HEAD
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
=======
    equation,
    studyMode // 'guided', 'selfPaced', or 'assignment' — only 'guided' changes behavior here
  } = req.body;

  if (!trials || !Array.isArray(trials) || trials.length === 0) {
    return res.status(400).json({ error: 'Trial data is required.' });
  }

  const isWorkingMode = mode === 'working';
  const isGuided = studyMode === 'guided';
  const bothCorrect = averageCorrect && concentrationCorrect;

  // For the short diagnostic explanation, nothing to explain if both
  // steps were already correct — protects against pointless API cost.
  // Guided mode is the exception: it's meant to actively coach, so a
  // fully correct attempt still gets a short reinforcing response
  // rather than silence. The step-by-step working mode also skips
  // this check on its own terms — a student who got everything right
  // might still want the full worked calculation as a learning aid.
  if (!isWorkingMode && bothCorrect && !isGuided) {
    return res.json({ feedback: null });
  }

  const explainPrompt = `You are a supportive KCSE Chemistry Paper 3 tutor helping a Kenyan secondary school student understand a mistake in their titration practical. Respond with ONLY the final explanation as plain conversational sentences — 2 to 3 sentences maximum. Do not show any working, reasoning steps, labels, or restate the numbers as a bare equation. Do not just restate the correct answer; explain in plain English the likely reason for the specific error. Do not use markdown formatting, headings, or bullet points.

Practical: ${titrationTitle || 'Titration'}
Their recorded titre readings (cm³): ${trials.map(t => Number(t).toFixed(2)).join(', ')}

Step 1 (average titre):
- Their entered average: ${studentAverage} cm³
- Correct average from their own readings: ${correctAverage} cm³
- Was this correct?: ${averageCorrect ? 'Yes' : 'No'}

Step 2 (concentration of ${answerSymbol || 'the analyte'}):
- Their entered concentration: ${studentAnswer} mol/dm³
- Expected concentration, calculated using THEIR OWN average from Step 1: ${expectedAnswer} mol/dm³
- Was this correct?: ${concentrationCorrect ? 'Yes' : 'No'}

Explain the most likely source of their error and give one specific, encouraging tip for their next attempt.`;

  const workingPrompt = `You are a KCSE Chemistry Paper 3 tutor showing a Kenyan secondary school student the full worked solution to their titration calculation, using their own actual numbers. Write it as short, clearly numbered plain-text lines (e.g. "1) ...", "2) ..."), one calculation step per line, with a line break between each step. Keep each numbered line under 20 words. Do not use markdown symbols like ** or # or bullet points — numbered plain text lines only.

Practical: ${titrationTitle || 'Titration'}
Balanced equation: ${equation || '(not provided)'}
Their recorded titre readings (cm³): ${trials.map(t => Number(t).toFixed(2)).join(', ')}
Titrant: ${sessionTitrantConc} M ${titrantName || 'titrant'}
Analyte volume: ${sessionAnalyteVolume} cm³
Stoichiometric ratio (moles analyte per mole titrant): ${ratio}

Show these steps using the actual numbers above:
1. State the balanced chemical equation given above exactly as written.
2. Identify the concordant titre readings and calculate their average (should equal ${correctAverage} cm³).
3. State the mole ratio between titrant and analyte, referring back to the equation in step 1.
4. Calculate moles of titrant used: (average titre in dm³) × (titrant concentration).
5. Use the mole ratio to find moles of ${answerSymbol || 'analyte'}.
6. Divide by the analyte volume (in dm³) to get the concentration of ${answerSymbol || 'analyte'} (should equal ${expectedAnswer} mol/dm³).

Then, in one final line, briefly compare this correct working to what the student actually entered (their average: ${studentAverage} cm³, their concentration answer: ${studentAnswer} mol/dm³) and note in plain words where their method diverged, if it did.`;

  const reinforcePrompt = `You are a supportive KCSE Chemistry Paper 3 tutor coaching a Kenyan secondary school student through Guided Practice. They got everything correct on this attempt. Respond with ONLY 1 to 2 short, warm, conversational sentences — no markdown, no headings, no restating the raw numbers as an equation. Briefly affirm what they did well and reinforce the underlying concept (why their technique or reasoning worked), rather than just saying "well done."

Practical: ${titrationTitle || 'Titration'}
Their recorded titre readings (cm³): ${trials.map(t => Number(t).toFixed(2)).join(', ')}
Their average titre: ${studentAverage} cm³ (correct)
Their concentration answer: ${studentAnswer} mol/dm³ (correct, matching their own average)`;

  const prompt = isWorkingMode ? workingPrompt : (bothCorrect ? reinforcePrompt : explainPrompt);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          // Raised well above what a normal answer needs, since some
          // Gemini models spend part of this budget on invisible
          // internal "thinking" before writing the visible answer,
          // which can otherwise truncate the real response. (An
          // earlier attempt at explicitly disabling thinking via
          // thinkingConfig caused this model to reject the request
          // outright with a 400 — that field isn't silently ignored
          // the way unknown fields normally are, so it's left out
          // entirely and a big token budget is used instead.)
          // Working mode gets a bigger budget than the short
          // diagnostic explanation, since a 5-step numbered
          // calculation is naturally much longer.
          // Thinking token usage varies unpredictably per request —
          // sometimes it's minimal, sometimes it consumes nearly the
          // entire budget (observed as high as ~980 tokens on a
          // request that only needed ~150 for the visible answer).
          // Since it can't be reliably disabled for this model (see
          // note above), both modes get generous, similar headroom
          // rather than sizing tightly to the expected visible
          // answer length.
          maxOutputTokens: isWorkingMode ? 3000 : 2048,
          temperature: 0.6
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(503).json({ error: 'AI feedback is temporarily unavailable.' });
    }

    const data = await response.json();

    // Gemini's response shape: candidates[0].content.parts[].text
    const candidate = data.candidates && data.candidates[0];
    const feedbackText = candidate && candidate.content && candidate.content.parts
      ? candidate.content.parts.map(p => p.text || '').join('').trim()
      : '';

    // Always log this while the feature is being tuned — finishReason
    // 'MAX_TOKENS' means the response was cut off before completing
    // (the token-budget problem), 'STOP' means it finished normally,
    // 'SAFETY' means Gemini's safety filters blocked it. usageMetadata
    // shows exactly how the token budget was split, which is the
    // fastest way to confirm whether thinking is the culprit.
    console.log('Gemini finishReason:', candidate && candidate.finishReason, '| usage:', data.usageMetadata);

    // Reject the response outright if it was cut off before finishing
    // (finishReason 'MAX_TOKENS'), regardless of how much text came
    // through — a truncated mid-sentence answer (e.g. ending on an
    // unclosed parenthesis) is worse to show a student than no card
    // at all, since it looks broken rather than just unavailable.
    if (!feedbackText || (candidate && candidate.finishReason === 'MAX_TOKENS')) {
      console.error('Gemini response was empty or cut off before completing.');
      return res.status(503).json({ error: 'AI feedback is temporarily unavailable.' });
    }

    return res.json({ feedback: feedbackText });
  } catch (err) {
    console.error('AI feedback error:', err.message);
    return res.status(503).json({ error: 'AI feedback is temporarily unavailable.' });
  }
});
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

module.exports = router;

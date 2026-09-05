// ============================================================
//  VirtuLab Kenya — Written Questions API Routes
//  Handles student text answers for 'written' simulationType questions
//  where no interactive simulation exists yet (e.g. paper chromatography,
//  electrolysis, food tests, graph reading, diagram labelling, etc.)
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');
const pool = require('../db/pool');

/**
 * Score a single student answer using Gemini as a KNEC examiner.
 * Returns { score, feedback } or null if AI is not configured.
 */
async function scoreAnswerWithAI({ questionText, modelAnswer, answerText, maxMarks }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const prompt = `You are a KNEC Chemistry practical examiner. Award marks strictly.
Question: ${questionText}
Model Answer: ${modelAnswer}
Student Answer: ${answerText}
Maximum Marks: ${maxMarks}
Award a score between 0 and ${maxMarks}. Respond with ONLY valid JSON:
{ "score": <number>, "feedback": "<one sentence explaining the mark awarded>" }`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.2, responseMimeType: 'application/json' }
      })
    });
    if (!response.ok) throw new Error(`GEMINI_API_ERROR (${response.status})`);
    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    let text = (candidate?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!text) throw new Error('GEMINI_EMPTY_RESPONSE');

    // Clean markdown fences if present
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
    if (match && match[1]) text = match[1].trim();
    const result = JSON.parse(text);
    return {
      score: Math.min(Number(maxMarks), Math.max(0, Number(result.score) || 0)),
      feedback: String(result.feedback || '').trim()
    };
  } catch (err) {
    console.warn('[written_questions] AI scoring failed:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/written-questions/submit
//   Auth: student only
//   Body: { assignmentId, questionNumber, answers: [{ subQuestionId, answerText, maxMarks, modelAnswer, questionText }] }
// ─────────────────────────────────────────────────────────────
router.post('/submit', apiLimiter, authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can submit written answers.' });
  }

  const studentId = req.user.id;
  const { assignmentId, questionNumber, answers } = req.body;

  if (!assignmentId || !questionNumber || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'assignmentId, questionNumber, and answers[] are required.' });
  }

  // Verify the assignment exists and this student belongs to the same school
  const assignmentCheck = await pool.query(
    `SELECT a.id FROM assignments a
     JOIN students s ON s.school_id = a.school_id
     WHERE a.id = $1 AND s.id = $2
     LIMIT 1`,
    [assignmentId, studentId]
  );
  if (assignmentCheck.rows.length === 0) {
    return res.status(403).json({ error: 'Assignment not found or access denied.' });
  }

  const requiresManualMarking = !process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim();
  const responses = [];

  for (const answer of answers) {
    const { subQuestionId, answerText = '', maxMarks = 0, modelAnswer = '', questionText = '' } = answer;
    if (!subQuestionId) continue;

    // Attempt AI scoring
    let aiScore = null;
    let aiFeedback = null;
    if (!requiresManualMarking && answerText.trim()) {
      const aiResult = await scoreAnswerWithAI({
        questionText: questionText || `Sub-question ${subQuestionId}`,
        modelAnswer,
        answerText,
        maxMarks: Number(maxMarks)
      });
      if (aiResult) {
        aiScore = aiResult.score;
        aiFeedback = aiResult.feedback;
      }
    }

    // Upsert into written_responses
    const upsertResult = await pool.query(
      `INSERT INTO written_responses
         (student_id, assignment_id, question_number, sub_question_id,
          answer_text, model_answer, ai_score, ai_feedback, max_marks, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT ON CONSTRAINT unique_written_response
       DO UPDATE SET
         answer_text  = EXCLUDED.answer_text,
         model_answer = EXCLUDED.model_answer,
         ai_score     = EXCLUDED.ai_score,
         ai_feedback  = EXCLUDED.ai_feedback,
         max_marks    = EXCLUDED.max_marks,
         updated_at   = NOW()
       RETURNING id, ai_score, ai_feedback, max_marks`,
      [studentId, assignmentId, questionNumber, subQuestionId,
       answerText, modelAnswer, aiScore, aiFeedback, Number(maxMarks)]
    );

    responses.push({
      subQuestionId,
      id: upsertResult.rows[0]?.id,
      aiScore: upsertResult.rows[0]?.ai_score,
      aiFeedback: upsertResult.rows[0]?.ai_feedback,
      maxMarks: upsertResult.rows[0]?.max_marks
    });
  }

  return res.status(201).json({
    success: true,
    requiresManualMarking,
    responses,
    message: requiresManualMarking
      ? 'Answers saved. Your teacher will review and mark these manually.'
      : 'Submitted — your answers have been saved and draft-scored. Marks are subject to teacher review.'
  });
}));

// ─────────────────────────────────────────────────────────────
// GET /api/written-questions/:assignmentId/:studentId
//   Auth: teacher OR the student themselves
// ─────────────────────────────────────────────────────────────
router.get('/:assignmentId/:studentId', authMiddleware, asyncHandler(async (req, res) => {
  const { assignmentId, studentId } = req.params;
  const requester = req.user;

  // A student can only read their own responses; teachers can read any
  if (requester.role === 'student' && String(requester.id) !== String(studentId)) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const result = await pool.query(
    `SELECT wr.id, wr.question_number, wr.sub_question_id,
            wr.answer_text, wr.model_answer,
            wr.ai_score, wr.ai_feedback,
            wr.teacher_score, wr.teacher_feedback,
            wr.max_marks, wr.created_at, wr.updated_at
     FROM written_responses wr
     WHERE wr.assignment_id = $1 AND wr.student_id = $2
     ORDER BY wr.question_number, wr.sub_question_id`,
    [assignmentId, studentId]
  );

  return res.json({ success: true, responses: result.rows });
}));

// ─────────────────────────────────────────────────────────────
// PATCH /api/written-questions/:responseId/teacher-mark
//   Auth: teacher only
//   Body: { teacherScore, teacherFeedback }
// ─────────────────────────────────────────────────────────────
router.patch('/:responseId/teacher-mark', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can mark written responses.' });
  }

  const { responseId } = req.params;
  const { teacherScore, teacherFeedback = '' } = req.body;

  if (teacherScore === undefined || teacherScore === null) {
    return res.status(400).json({ error: 'teacherScore is required.' });
  }

  const result = await pool.query(
    `UPDATE written_responses
     SET teacher_score    = $1,
         teacher_feedback = $2,
         updated_at       = NOW()
     WHERE id = $3
     RETURNING id, question_number, sub_question_id,
               ai_score, ai_feedback,
               teacher_score, teacher_feedback,
               max_marks, updated_at`,
    [Number(teacherScore), teacherFeedback, responseId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Written response not found.' });
  }

  return res.json({ success: true, response: result.rows[0] });
}));

module.exports = router;

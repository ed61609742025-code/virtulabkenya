// ============================================================
//  VirtuLab Kenya — AI Teacher Exam Assistant Routes
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../utils/AppError');
const aiExamService = require('../services/aiExamAssistantService');

const { aiAssistantLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply AI rate limiter to protect Gemini quota
router.use(aiAssistantLimiter);

// Require teacher or admin role for all exam setting assistant routes
router.use(authMiddleware);
router.use(authMiddleware.requireRole(['teacher', 'admin']));

/**
 * POST /api/ai-assistant/parse-paper
 * Uploaded exam paper document/photo parsing (Multimodal)
 */
router.post('/parse-paper', asyncHandler(async (req, res) => {
  const { fileData, mimeType, textContent, teacherNotes } = req.body;

  if (fileData && typeof fileData !== 'string') {
    throw new ValidationError('Invalid file data format.');
  }

  if (!fileData && !textContent) {
    throw new ValidationError('Please provide an exam paper file or paste the exam text.');
  }

  const exam = await aiExamService.parseExamPaper({
    fileData: fileData || null,
    mimeType: mimeType || null,
    textContent: textContent || '',
    teacherNotes: teacherNotes || ''
  });

  return res.json({
    success: true,
    message: 'Exam paper analyzed successfully.',
    exam
  });
}));

/**
 * POST /api/ai-assistant/generate-exam
 * Generate complete KCSE exam from an idea / prompt
 */
router.post('/generate-exam', asyncHandler(async (req, res) => {
  const { prompt, formLevel, moduleType, difficulty, durationMinutes } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new ValidationError('Please provide an exam idea or description.');
  }

  const exam = await aiExamService.generateExamFromIdea({
    prompt: prompt.trim(),
    formLevel: formLevel || 'Form 4',
    moduleType: moduleType || 'kcseComposite',
    difficulty: difficulty || 'standard',
    durationMinutes: Number(durationMinutes) || 135
  });

  return res.json({
    success: true,
    message: 'Exam generated from idea successfully.',
    exam
  });
}));

/**
 * POST /api/ai-assistant/refine-exam
 * Conversational refinement of an existing exam draft
 */
router.post('/refine-exam', asyncHandler(async (req, res) => {
  const { currentDraft, instruction } = req.body;

  if (!currentDraft || typeof currentDraft !== 'object') {
    throw new ValidationError('Current exam draft is required.');
  }

  if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
    throw new ValidationError('Please provide a refinement instruction.');
  }

  const exam = await aiExamService.refineExamDraft({
    currentDraft,
    instruction: instruction.trim()
  });

  return res.json({
    success: true,
    message: 'Exam refined successfully.',
    exam
  });
}));

module.exports = router;

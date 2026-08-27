// ============================================================
//  VirtuLab Kenya — Reaction Rates & Chemical Kinetics API Routes
//  KNEC Chemistry Form 4 Topic 1 & Paper 3 Practical Module
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ratesRepo = require('../repositories/ratesRepo');

// POST /api/rates — Save a completed Reaction Rates practical session
router.post('/', apiLimiter, authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      assignment_id,
      experiment_type = 'cross',
      experiment_title,
      dilution_readings = [],
      table_score,
      graph_score,
      calc_score,
      total_score,
      grade,
      rubric_breakdown,
      answers,
      mode = 'practice'
    } = req.body;

    const tScore = parseFloat(table_score) || 0.0;
    const gScore = parseFloat(graph_score) || 0.0;
    const cScore = parseFloat(calc_score) || 0.0;
    const calculatedTotal = parseFloat((tScore + gScore + cScore).toFixed(2));
    const finalTotal = parseFloat(total_score) || calculatedTotal;

    let computedGrade = grade || 'E';
    if (!grade) {
      if (finalTotal >= 13.0) computedGrade = 'A';
      else if (finalTotal >= 11.0) computedGrade = 'A-';
      else if (finalTotal >= 9.5) computedGrade = 'B+';
      else if (finalTotal >= 8.0) computedGrade = 'B';
      else if (finalTotal >= 6.5) computedGrade = 'C+';
      else if (finalTotal >= 5.0) computedGrade = 'C';
      else computedGrade = 'D';
    }

    const savedSession = await ratesRepo.saveRatesSession({
      studentId,
      assignment_id,
      experiment_type,
      experiment_title: experiment_title || `Reaction Rates: ${experiment_type.toUpperCase()}`,
      dilution_readings,
      table_score: tScore,
      graph_score: gScore,
      calc_score: cScore,
      total_score: finalTotal,
      grade: computedGrade,
      rubric_breakdown: rubric_breakdown || {},
      answers: answers || {},
      mode
    });

    res.status(201).json({
      success: true,
      message: 'Reaction Rates session recorded successfully.',
      session: savedSession,
      analysis: {
        tableScore: tScore,
        graphScore: gScore,
        calcScore: cScore,
        totalScore: finalTotal,
        grade: computedGrade
      }
    });
  } catch (err) {
    console.error('Error saving reaction rates session:', err.message);
    res.status(500).json({ error: 'Failed to record Reaction Rates practical session.' });
  }
});

// GET /api/rates/mine — Fetch student's own reaction rates practical history
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const sessions = await ratesRepo.getStudentSessions(studentId);
    res.json({ success: true, sessions });
  } catch (err) {
    console.error('Error fetching student reaction rates sessions:', err.message);
    res.status(500).json({ error: 'Failed to fetch reaction rates sessions.' });
  }
});

// GET /api/rates/class — Teacher view of all students' reaction rates sessions
router.get('/class', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access forbidden. Teachers only.' });
    }
    const teacherId = req.user.id;
    const sessions = await ratesRepo.getClassRatesSessions(teacherId);
    res.json({ success: true, sessions: sessions || [] });
  } catch (err) {
    console.warn('[/api/rates/class] Safe fallback:', err.message);
    res.json({ success: true, sessions: [] });
  }
});

module.exports = router;

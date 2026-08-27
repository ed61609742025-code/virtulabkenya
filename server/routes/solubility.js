// ============================================================
//  VirtuLab Kenya — Solubility Curves & Crystallization Routes
//  KCSE Form 4 / Paper 3 Question 1 & 2 Laboratory
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const solubilityRepo = require('../repositories/solubilityRepo');

// Theoretical thermodynamic models for KNEC salts (S in g / 100g water)
const SALT_MODELS = {
  'KNO3': {
    name: 'Potassium Nitrate (KNO₃)',
    tempFromSolubility: (s) => {
      const a = 0.015, b = 0.57, c = 13.3 - s;
      const disc = b * b - 4 * a * c;
      return disc < 0 ? 0 : Math.max(0, parseFloat(((-b + Math.sqrt(disc)) / (2 * a)).toFixed(1)));
    }
  },
  'KClO3': {
    name: 'Potassium Chlorate (KClO₃)',
    tempFromSolubility: (s) => {
      const a = 0.005, b = 0.25, c = 3.3 - s;
      const disc = b * b - 4 * a * c;
      return disc < 0 ? 0 : Math.max(0, parseFloat(((-b + Math.sqrt(disc)) / (2 * a)).toFixed(1)));
    }
  },
  'CuSO4': {
    name: 'Copper(II) Sulfate (CuSO₄)',
    tempFromSolubility: (s) => {
      const a = 0.002, b = 0.28, c = 14.3 - s;
      const disc = b * b - 4 * a * c;
      return disc < 0 ? 0 : Math.max(0, parseFloat(((-b + Math.sqrt(disc)) / (2 * a)).toFixed(1)));
    }
  },
  'PbNO3': {
    name: 'Lead(II) Nitrate (Pb(NO₃)₂)',
    tempFromSolubility: (s) => {
      const a = 0.003, b = 0.65, c = 38.8 - s;
      const disc = b * b - 4 * a * c;
      return disc < 0 ? 0 : Math.max(0, parseFloat(((-b + Math.sqrt(disc)) / (2 * a)).toFixed(1)));
    }
  },
  'NaCl': {
    name: 'Sodium Chloride (NaCl)',
    tempFromSolubility: (s) => Math.max(0, parseFloat(((s - 35.7) / 0.03).toFixed(1)))
  }
};

// POST /api/solubility — Save a completed solubility curve experiment
router.post('/', apiLimiter, authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      assignment_id,
      solute_key,
      solute_name,
      experiment_title,
      solute_mass,
      solvent_volume,
      crystallization_temp,
      accuracy_score,
      graph_score,
      trials_data,
      mode
    } = req.body;

    if (!solute_key) {
      return res.status(400).json({ error: 'Solute key is required.' });
    }

    const saltModel = SALT_MODELS[solute_key] || { name: solute_name || solute_key, tempFromSolubility: () => crystallization_temp || 25.0 };
    const mass = parseFloat(solute_mass) || 5.0;
    const volume = parseFloat(solvent_volume) || 10.0;
    const solubility100g = volume > 0 ? (mass / volume) * 100.0 : 0;
    const theoreticalTemp = saltModel.tempFromSolubility(solubility100g);
    const studentTemp = parseFloat(crystallization_temp) || 0;
    const tempDiff = parseFloat(Math.abs(studentTemp - theoreticalTemp).toFixed(2));

    // KNEC Scoring: Accuracy within +/- 2.0 °C earns full 2.0 marks; Graph earns up to 3.0 marks
    const computedAccuracyScore = tempDiff <= 2.0 ? 2.0 : tempDiff <= 4.0 ? 1.0 : 0.0;
    const computedGraphScore = Math.min(3.0, Math.max(0.0, parseFloat(graph_score) || 0.0));
    const totalScore = parseFloat((computedAccuracyScore + computedGraphScore).toFixed(2));

    const session = await solubilityRepo.saveSolubilitySession({
      studentId,
      assignment_id,
      solute_key,
      solute_name: saltModel.name,
      experiment_title: experiment_title || `Solubility of ${saltModel.name}`,
      solute_mass: mass,
      solvent_volume: volume,
      crystallization_temp: studentTemp,
      theoretical_temp: theoreticalTemp,
      temp_difference: tempDiff,
      accuracy_score: computedAccuracyScore,
      graph_score: computedGraphScore,
      total_score: totalScore,
      trials_data: trials_data || [],
      mode: mode || 'selfPaced'
    });

    return res.status(201).json({
      success: true,
      session,
      analysis: {
        solubility100g,
        theoreticalTemp,
        tempDiff,
        accuracyScore: computedAccuracyScore,
        graphScore: computedGraphScore,
        totalScore
      }
    });
  } catch (err) {
    console.error('Error saving solubility session:', err.message);
    return res.status(500).json({ error: 'Could not record solubility practical session.' });
  }
});

// GET /api/solubility/mine — Fetch student's solubility curve session history
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const sessions = await solubilityRepo.getStudentSessions(studentId);
    return res.json({ success: true, sessions });
  } catch (err) {
    console.error('Error fetching student solubility sessions:', err.message);
    return res.status(500).json({ error: 'Could not fetch solubility practical history.' });
  }
});

// GET /api/solubility/class — Teacher view of all class solubility sessions
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const sessions = await solubilityRepo.getClassSolubilitySessions(teacherId);
    return res.json({ success: true, sessions: sessions || [] });
  } catch (err) {
    console.warn('[/api/solubility/class] Safe fallback:', err.message);
    return res.json({ success: true, sessions: [] });
  }
});

module.exports = router;

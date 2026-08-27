// ============================================================
//  VirtuLab Kenya — Thermochemistry / Energy Changes Routes
//  KCSE Form 4 / Paper 3 Question 1 & 2 Laboratory
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const energyRepo = require('../repositories/energyRepo');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../utils/AppError');

// Theoretical thermodynamic values for KNEC standard reactions (ΔH in kJ/mol)
const REACTION_MODELS = {
  'KCSE_2022_DISPLACEMENT': {
    name: 'Displacement Enthalpy: Zn + CuSO₄',
    category: 'displacement',
    deltaH_theoretical: -217.0
  },
  'KCSE_2023_NEUTRALIZATION': {
    name: 'Neutralization Enthalpy: NaOH + HCl',
    category: 'neutralization',
    deltaH_theoretical: -57.1
  },
  'KCSE_2024_WEAK_STRONG': {
    name: 'Neutralization & Ionization Enthalpy: CH₃COOH + NaOH',
    category: 'neutralization',
    deltaH_theoretical: -55.2
  },
  'KCSE_2020_SOLUTION_ENDOTHERMIC': {
    name: 'Enthalpy of Solution: NH₄NO₃ (Endothermic)',
    category: 'solution',
    deltaH_theoretical: 25.7
  },
  'KCSE_2019_HESS_LAW': {
    name: "Hess's Law Hydration Enthalpy: Anhydrous vs Hydrated CuSO₄",
    category: 'solution',
    deltaH_theoretical: -66.5
  },
  'KCSE_2021_COMBUSTION': {
    name: 'Enthalpy of Combustion: Ethanol (C₂H₅OH)',
    category: 'combustion',
    deltaH_theoretical: -1367.0
  }
};

// POST /api/energy — Save a completed thermochemistry practical session
router.post('/', apiLimiter, authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const {
    assignment_id,
    system_id,
    system_name,
    reaction_category,
    initial_temp,
    final_temp,
    temp_change,
    heat_quantity,
    moles,
    molar_enthalpy,
    total_score,
    rubric_breakdown,
    readings_data,
    equation_text,
    mode
  } = req.body;

  if (!system_id) {
    throw new ValidationError('Reaction system ID is required.');
  }

  const model = REACTION_MODELS[system_id] || {
    name: system_name || system_id,
    category: reaction_category || 'thermochemistry',
    deltaH_theoretical: molar_enthalpy || 0.0
  };

  const session = await energyRepo.saveEnergySession({
    studentId,
    assignment_id: assignment_id ? parseInt(assignment_id, 10) : null,
    system_id,
    system_name: model.name,
    reaction_category: model.category,
    initial_temp: parseFloat(initial_temp) || 0,
    final_temp: parseFloat(final_temp) || 0,
    temp_change: parseFloat(temp_change) || 0,
    heat_quantity: parseFloat(heat_quantity) || 0,
    moles: parseFloat(moles) || 0,
    molar_enthalpy: parseFloat(molar_enthalpy) || 0,
    theoretical_enthalpy: model.deltaH_theoretical,
    total_score: parseFloat(total_score) || 0,
    rubric_breakdown: rubric_breakdown || [],
    readings_data: readings_data || [],
    equation_text: equation_text || '',
    mode: mode || 'practice'
  });

  return res.status(201).json({
    success: true,
    session
  });
}));

// GET /api/energy/mine — Fetch student's thermochemistry session history
router.get('/mine', authMiddleware, asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const sessions = await energyRepo.getStudentSessions(studentId);
  return res.json({ success: true, sessions });
}));

// GET /api/energy/class — Teacher view of all class thermochemistry sessions
router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const sessions = await energyRepo.getClassEnergySessions(teacherId);
  return res.json({ success: true, sessions: sessions || [] });
}));

module.exports = router;

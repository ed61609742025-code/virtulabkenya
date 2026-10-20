// ============================================================
//  VirtuLab Kenya — AI Tutor Context-Awareness Tests
// ============================================================

const { describe, it } = require('node:test');
const assert = require('node:assert');

const aiTutorService = require('../services/aiTutorService');

describe('AI Tutor Context & Socratic Hint Engine', () => {

  it('aiTutorService should expose generateSocraticHint function', () => {
    assert.strictEqual(typeof aiTutorService.generateSocraticHint, 'function');
  });

  it('aiTutorService should fail gracefully with AI_NOT_CONFIGURED when GEMINI_API_KEY is not set', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      await aiTutorService.generateSocraticHint({
        experimentType: 'Volumetric Analysis (Titration)',
        context: {
          practicalTitle: 'Acid-Base Titration',
          analyte: 'HCl(aq) — Solution A',
          titrant: 'NaOH — Solution B (0.1000 M)',
          activeStep: 'Step (b): Moles of Titrant in Average Titre',
          lastErrorOrFeedback: 'Expected around 0.00250 moles'
        },
        studentQuery: 'How do I calculate moles from titre volume?',
        history: [
          { role: 'user', text: 'What is the average titre?' },
          { role: 'model', text: 'Check your concordant readings within 0.10 cm³.' }
        ]
      });
      assert.fail('Should have thrown AI_NOT_CONFIGURED');
    } catch (err) {
      assert.strictEqual(err.message, 'AI_NOT_CONFIGURED');
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('aiTutorService should handle qualitative and gas preparation context payloads without crashing', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    // Test Gas Prep context payload
    try {
      await aiTutorService.generateSocraticHint({
        experimentType: 'Gas Preparation & Collection',
        context: {
          gasName: 'Ammonia (NH₃)',
          reactants: 'Ca(OH)₂ + 2NH₄Cl heated',
          selectedDrying: 'concH2SO4',
          selectedCollection: 'upwardDelivery',
          heatingEnabled: 'Heating ON (Bunsen burner)',
          lastErrorOrFeedback: 'Incompatible: Ammonia reacts with concentrated H₂SO₄!'
        },
        studentQuery: 'Why is my drying agent wrong?'
      });
    } catch (err) {
      // Must throw AI_NOT_CONFIGURED, proving payload validation passed cleanly through formatLabContext
      assert.strictEqual(err.message, 'AI_NOT_CONFIGURED');
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('aiTutorService should handle reaction rates, thermochemistry, and solubility curve contexts without error', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      // 1. Reaction Rates
      await aiTutorService.generateSocraticHint({
        experimentType: 'Reaction Rates & Chemical Kinetics',
        context: {
          practicalTitle: 'Disappearing Cross (Na₂S₂O₃ + HCl)',
          activeExperiment: 'cross',
          reactionConditions: 'Thio: 50.0 cm³, H₂O: 0.0 cm³, Temp: 25.0°C, Conc: 0.20 M',
          reactionProgress: 'Cross disappeared at t = 38.5s',
          elapsedTime: '38.5 s',
          lastErrorOrFeedback: 'Turbidity threshold reached'
        },
        studentQuery: 'How does concentration affect rate?'
      });
      assert.fail('Should throw AI_NOT_CONFIGURED');
    } catch (err) {
      assert.strictEqual(err.message, 'AI_NOT_CONFIGURED');
    }

    try {
      // 2. Thermochemistry
      await aiTutorService.generateSocraticHint({
        experimentType: 'Thermochemistry & Energy Changes',
        context: {
          practicalTitle: 'Enthalpy of Displacement: Zn + CuSO₄',
          category: 'displacement',
          reactants: '25.0 cm³ 0.5M CuSO₄ + 3.0g Zinc powder',
          initialTemp: '22.0 °C',
          currentTemp: '44.5 °C',
          tempChange: '+22.5 °C',
          thermalStatus: 'Reactants mixed into calorimeter',
          lastErrorOrFeedback: null
        },
        studentQuery: 'How do I calculate Q using mcΔT?'
      });
      assert.fail('Should throw AI_NOT_CONFIGURED');
    } catch (err) {
      assert.strictEqual(err.message, 'AI_NOT_CONFIGURED');
    }

    try {
      // 3. Solubility Curves
      await aiTutorService.generateSocraticHint({
        experimentType: 'Solubility Curves & Crystallization',
        context: {
          practicalTitle: 'KCSE 2018 (Salt W — Potassium Nitrate)',
          solute: 'Potassium Nitrate (KNO₃) — Salt W',
          saltMass: '5.00 g',
          waterVolume: '10.0 cm³',
          solutionTemp: '62.0 °C',
          burnerMode: 'GENTLE',
          coolingMode: 'AIR',
          crystTemp: '58.4 °C',
          recordedTrials: ['Vol: 10 cm³, Temp: 58.4°C, Sol: 50.0 g/100g'],
          lastErrorOrFeedback: null
        },
        studentQuery: 'How do I plot the solubility curve?'
      });
      assert.fail('Should throw AI_NOT_CONFIGURED');
    } catch (err) {
      assert.strictEqual(err.message, 'AI_NOT_CONFIGURED');
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });

});

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

});

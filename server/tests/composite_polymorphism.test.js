// ============================================================
//  VirtuLab Kenya — Polymorphic Q2/Q3 Engine Test Suite
// ============================================================

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const { CompositeExamEngine } = require(path.join(rootDir, 'client', 'student', 'js', 'composite-engine.js'));

describe('Polymorphic Question 2 & Question 3 Architecture', () => {

  it('should cleanly strip leading numbering without cutting internal clauses like (or aqueous...) or manganate(VII)', () => {
    function getCleanTestPromptTitle(prompt, fallbackLetter = 'a') {
      if (!prompt || typeof prompt !== 'string') return `Test Procedure (${fallbackLetter})`;
      const clean = prompt.replace(/^\s*(?:\([a-zA-Z0-9ivxLCDM]+\)|[a-zA-Z0-9ivxLCDM]+[\.\)])\s*/i, '').trim();
      return clean || `Test Procedure (${fallbackLetter})`;
    }

    const test1 = "(b) To about 2 cm³ of liquid N (or aqueous solution of N) in a test tube, add 2-3 drops of universal indicator";
    assert.strictEqual(
      getCleanTestPromptTitle(test1, 'b'),
      "To about 2 cm³ of liquid N (or aqueous solution of N) in a test tube, add 2-3 drops of universal indicator"
    );

    const test2 = "(d) To about 2 cm³ of liquid N, add 2-3 drops of acidified potassium manganate(VII) solution and warm gently.";
    assert.strictEqual(
      getCleanTestPromptTitle(test2, 'd'),
      "To about 2 cm³ of liquid N, add 2-3 drops of acidified potassium manganate(VII) solution and warm gently."
    );

    const test3 = "a) Place about one-third of solid N on a clean metallic spatula and burn it";
    assert.strictEqual(
      getCleanTestPromptTitle(test3, 'a'),
      "Place about one-third of solid N on a clean metallic spatula and burn it"
    );

    const test4 = "(iv) Add 2M NaOH dropwise until in excess";
    assert.strictEqual(
      getCleanTestPromptTitle(test4, 'd'),
      "Add 2M NaOH dropwise until in excess"
    );
  });

  it('should correctly configure and grade Question 2 when Q2 is Organic and Q3 is Inorganic', () => {
    const customExamConfig = {
      questions: [
        {
          number: 1,
          type: 'volumetric',
          simulationType: 'volumetric',
          title: 'Question 1: Volumetric Analysis',
          marks: 15,
          acidMolarity: 0.1,
          baseVolume: 25.0
        },
        {
          number: 2,
          type: 'organic',
          simulationType: 'organic',
          title: 'Question 2: Organic Functional Group Analysis',
          marks: 10,
          sampleName: 'Solid N',
          trueOrganicKey: 'Benzoic Acid',
          trueFunctionalGroup: '—COOH (Carboxylic Acid)',
          tests: [
            { id: 't1', prompt: '(a) Place solid N on spatula and burn it in flame', correctObs: 'Burns with smoky sooty flame', correctInf: 'Unsaturated / aromatic organic compound' },
            { id: 't2', prompt: '(b) Dissolve solid N in water and test with blue litmus', correctObs: 'Moist blue litmus paper turns red', correctInf: '—COOH present / acidic' },
            { id: 't3', prompt: '(c) To solution of N, add solid sodium hydrogen carbonate', correctObs: 'Vigorous effervescence of colorless gas', correctInf: '—COOH present / R-COOH confirmed' },
            { id: 't4', prompt: '(d) Add acidified potassium manganate(VII) solution', correctObs: 'Purple acidified KMnO4 remains purple', correctInf: 'No C=C or easily oxidizable group' }
          ]
        },
        {
          number: 3,
          type: 'qualitative',
          simulationType: 'qualitative',
          title: 'Question 3: Qualitative Inorganic Analysis',
          marks: 15,
          sampleName: 'Solid M',
          trueSaltKey: 'Pb(NO3)2',
          trueCation: 'Pb²⁺',
          trueAnion: 'NO₃⁻',
          tests: [
            { id: 'm1', prompt: '(a) Heat solid M in dry test tube', correctObs: 'Brown fumes of NO2 evolved; decrepitates', correctInf: 'NO3- present' },
            { id: 'm2', prompt: '(b) Dissolve solid M in distilled water', correctObs: 'Dissolves to form colorless solution', correctInf: 'Soluble salt present' },
            { id: 'm3', prompt: '(c) Add 2M NaOH dropwise until in excess', correctObs: 'White precipitate soluble in excess', correctInf: 'Pb2+, Al3+, Zn2+ present' }
          ]
        }
      ]
    };

    const engine = new CompositeExamEngine({ presetKey: 'custom' });
    engine.applyConfig(customExamConfig);

    // Verify Question 2 correctly mapped to organic
    assert.strictEqual(engine.preset.q2.simulationType, 'organic');
    assert.strictEqual(engine.preset.q2.sampleName, 'Solid N');
    assert.strictEqual(engine.preset.q2.tests.length, 4);

    // Verify Question 3 correctly mapped to inorganic
    assert.strictEqual(engine.preset.q3.simulationType, 'qualitative');
    assert.strictEqual(engine.preset.q3.sampleName, 'Solid M');
    assert.strictEqual(engine.preset.q3.tests.length, 3);

    // Provide student responses for Q2
    engine.setQ2Response('t1', 'Burns with yellow smoky sooty flame', 'Unsaturated compound present');
    engine.setQ2Response('t2', 'Turns blue litmus red', '—COOH present');
    engine.setQ2Response('t3', 'Vigorous effervescence of gas', 'Carboxylic acid (—COOH) confirmed');
    engine.setQ2Response('t4', 'Purple KMnO4 remains unchanged', 'Alkanol absent');
    engine.setQ2OrganicDeduction('—COOH (Carboxylic Acid)');

    const q2Score = engine.calculateQ2Score();
    assert.ok(q2Score.totalScore >= 7.0, `Q2 score should be high for correct organic responses, got ${q2Score.totalScore}`);
    assert.strictEqual(q2Score.maxScore, 10.0);
    assert.ok(q2Score.rubric.some(r => r.code === 'Q2_FG' && r.pass === true), 'Should pass Q2 Functional Group deduction');

    // Provide student responses for Q3
    engine.setQ3Response('m1', 'Brown fumes evolved that turn blue litmus red', 'NO₃⁻ present');
    engine.setQ3Response('m2', 'White solid dissolves completely', 'Soluble salt');
    engine.setQ3Response('m3', 'White precipitate formed, dissolves in excess to form colorless solution', 'Pb²⁺, Al³⁺, Zn²⁺ present');
    engine.setQ3Deduction('Pb²⁺');

    const q3Score = engine.calculateQ3Score();
    assert.ok(q3Score.totalScore >= 7.0, `Q3 score should be high for correct inorganic responses, got ${q3Score.totalScore}`);
  });

  it('should maintain 100% backward compatibility for standard Series 1 (Q2 Inorganic, Q3 Organic)', () => {
    const engine = new CompositeExamEngine({ presetKey: 'series_1' });
    assert.strictEqual(engine.preset.q2.simulationType, 'qualitative');
    assert.strictEqual(engine.preset.q3.simulationType, 'organic');
    assert.ok(Array.isArray(engine.preset.q2.tests) && engine.preset.q2.tests.length > 0);
    assert.ok(Array.isArray(engine.preset.q3.tests) && engine.preset.q3.tests.length > 0);
  });
});

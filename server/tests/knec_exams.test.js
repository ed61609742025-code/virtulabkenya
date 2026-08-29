// ============================================================
//  VirtuLab Kenya — KNEC Exam Standards & Algorithms Test Suite
// ============================================================

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..', '..');

describe('KNEC Paper 3 Examination Suite Standards', () => {

  const compositeEnginePath = path.join(rootDir, 'client', 'student', 'js', 'composite-engine.js');
  const {
    COMPOSITE_EXAM_PRESETS,
    CompositeExamEngine
  } = require(compositeEnginePath);

  it('should initialize and validate all 6 official KNEC Paper 3 Mock Series', () => {
    const seriesList = ['series_1', 'series_2', 'series_3', 'series_4', 'series_5', 'series_6'];
    seriesList.forEach(key => {
      const engine = new CompositeExamEngine({ presetKey: key });
      assert.ok(engine.preset, `Preset ${key} must exist`);
      assert.ok(engine.preset.q1.calcType, `Preset ${key} must have calcType`);
      assert.ok(Array.isArray(engine.preset.q1.questions), `Preset ${key} must have questions array`);
      assert.ok(engine.preset.q1.questions.length >= 5, `Preset ${key} must have at least 5 calculation questions`);

      engine.recordTrial(1, 25.00, 0.00);
      engine.recordTrial(2, 25.00, 0.00);
      engine.recordTrial(3, 25.00, 0.00);
      engine.setConcordant(1, true);
      engine.setConcordant(2, true);

      const worked = engine.generateWorkedSolutions();
      assert.ok(Object.keys(worked).length >= 5, `Preset ${key} must generate worked solutions`);
    });
  });

  it('should correctly award marks using Error Carried Forward (e.c.f.) on algebraic calculations', () => {
    const engineS2 = new CompositeExamEngine({ presetKey: 'series_2' });
    engineS2.recordTrial(1, 24.00, 0.00);
    engineS2.recordTrial(2, 24.00, 0.00);
    engineS2.setConcordant(1, true);
    engineS2.setConcordant(2, true);

    // Candidate uses 24.00 cm³ instead of theoretical 25.00 cm³
    engineS2.setQ1Answer('avgTitre', '24.00'); // Step a
    engineS2.setQ1Answer('molesA', '0.00240'); // Step b with e.c.f.
    engineS2.setQ1Answer('molesB', '0.00120'); // Step c with e.c.f.
    engineS2.setQ1Answer('molarityB', '0.048'); // Step d with e.c.f.
    engineS2.setQ1Answer('rfmHydrated', '297.9'); // Step e with e.c.f.
    engineS2.setQ1Answer('waterOfCryst', '11'); // Step f with e.c.f.

    const score = engineS2.calculateQ1Score();
    assert.strictEqual(score.calcScore, 10.0, 'Candidate should get full 10.0 marks for correct algebraic methodology');
    const ecfSteps = score.rubric.filter(r => r.pass && r.detail.includes('Error Carried Forward'));
    assert.ok(ecfSteps.length >= 1, 'At least one step must explicitly record e.c.f. credit');
  });

  it('should ensure Series 1 standard titration logically calculates moles of A, moles of B, and molarity of unknown Solution B', () => {
    const engineS1 = new CompositeExamEngine({ presetKey: 'series_1' });
    const questions = engineS1.preset.q1.questions;
    assert.strictEqual(questions[0].field, 'avgTitre');
    assert.strictEqual(questions[1].field, 'molesA');
    assert.strictEqual(questions[2].field, 'molesB');
    assert.strictEqual(questions[3].field, 'molarityB');
    assert.strictEqual(questions[4].field, 'concGrams');

    // Verify candidate calculates unknown Solution B correctly
    engineS1.recordTrial(1, 25.00, 0.00);
    engineS1.recordTrial(2, 25.00, 0.00);
    engineS1.setQ1Answer('avgTitre', '25.00'); // Step a
    engineS1.setQ1Answer('molesA', '0.00250'); // Step b
    engineS1.setQ1Answer('molesB', '0.00250'); // Step c
    engineS1.setQ1Answer('molarityB', '0.100'); // Step d (unknown Solution B)
    engineS1.setQ1Answer('concGrams', '4.00'); // Step e (NaOH mass conc)

    const score = engineS1.calculateQ1Score();
    assert.strictEqual(score.calcScore, 10.0, 'Full 10.0 marks for Series 1 stoichiometric calculation');
  });

  it('should validate CPCAT Engine with 40 authentic items and 25% balanced keys', () => {
    const cpcatPath = path.join(rootDir, 'client', 'student', 'js', 'cpcat-engine.js');
    const { CPCAT_ITEMS, CPCATEngine } = require(cpcatPath);

    assert.strictEqual(CPCAT_ITEMS.length, 40, 'CPCAT item bank must contain exactly 40 items');

    const keyDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const sectionCounts = { A: 0, B: 0, C: 0, D: 0 };

    CPCAT_ITEMS.forEach(item => {
      assert.ok(item.correctIndex >= 0 && item.correctIndex <= 3, 'correctIndex must be in range 0..3');
      keyDist[item.correctIndex]++;
      sectionCounts[item.section]++;
    });

    assert.deepStrictEqual(keyDist, { 0: 10, 1: 10, 2: 10, 3: 10 }, 'Keys must be equally balanced at 25% each');
    assert.deepStrictEqual(sectionCounts, { A: 10, B: 10, C: 10, D: 10 }, 'Each section must have exactly 10 questions');

    const engine = new CPCATEngine('post_test');
    CPCAT_ITEMS.forEach(item => engine.recordAnswer(item.id, item.correctIndex));
    const result = engine.calculateScore();
    assert.strictEqual(result.totalScore, 40.0);
    assert.strictEqual(result.percentage, 100.0);
  });

  it('should validate Chemical Speed Battle question pool of 80 high-yield items', () => {
    const speedBattleCode = fs.readFileSync(path.join(rootDir, 'client', 'student', 'js', 'speed-battle.js'), 'utf8');
    const poolMatch = speedBattleCode.match(/const QUESTIONS_POOL = (\[[\s\S]*?\n  \];)/);
    assert.ok(poolMatch, 'QUESTIONS_POOL must exist in speed-battle.js');

    const questionsPool = eval(poolMatch[1]);
    assert.strictEqual(questionsPool.length, 80, 'Speed battle pool must have exactly 80 items');
    questionsPool.forEach((q, i) => {
      assert.ok(q.q && q.q.length > 5, `Question ${i} must have valid prompt`);
      assert.strictEqual(q.options.length, 4, `Question ${i} must have 4 options`);
      assert.ok(q.ans >= 0 && q.ans <= 3, `Question ${i} ans must be 0..3`);
      assert.ok(q.exp && q.exp.length > 5, `Question ${i} must have explanation`);
    });
  });

  it('should strictly grade Question 1 Table 1 with CT, D, AC, PA, and FA', () => {
    const engine = new CompositeExamEngine({ presetKey: 'series_1' });
    const sv = engine.preset.q1.trueTitre; // e.g. 25.00

    // Full 5.0 Marks scenario
    engine.recordTrial(1, sv, 0.00);
    engine.recordTrial(2, sv + 0.05, 0.00);
    engine.recordTrial(3, sv, 0.00);
    engine.setConcordant(1, true);
    engine.setConcordant(2, true);
    engine.setConcordant(3, true);
    const avg = ((sv + sv + 0.05 + sv) / 3).toFixed(2);
    engine.setQ1Answer('avgTitre', avg);

    let score = engine.calculateQ1Score();
    assert.strictEqual(score.tableScore, 5.0, 'Candidate should get full 5.0 marks on Table 1');

    // Decimal penalty scenario (2nd d.p. is .03)
    const engineDec = new CompositeExamEngine({ presetKey: 'series_1' });
    engineDec.recordTrial(1, sv + 0.03, 0.00);
    engineDec.recordTrial(2, sv, 0.00);
    engineDec.setQ1Answer('avgTitre', sv.toFixed(2));
    const scoreDec = engineDec.calculateQ1Score();
    const dRubric = scoreDec.rubric.find(r => r.code === 'D');
    assert.strictEqual(dRubric.mark, 0.0, 'Readings terminating in non-zero/non-five must get 0 for decimals');

    // Principles of Averaging penalty (3 concordant, but only averaged 2)
    const enginePa = new CompositeExamEngine({ presetKey: 'series_1' });
    enginePa.recordTrial(1, 24.90, 0.00);
    enginePa.recordTrial(2, 25.00, 0.00);
    enginePa.recordTrial(3, 25.05, 0.00); // all 3 within 0.15 cm³
    enginePa.setConcordant(1, true);
    enginePa.setConcordant(2, true);
    enginePa.setConcordant(3, false); // candidate omitted trial 3
    enginePa.setQ1Answer('avgTitre', '24.95'); // average of only 1 & 2
    const scorePa = enginePa.calculateQ1Score();
    const paRubric = scorePa.rubric.find(r => r.code === 'PA');
    assert.strictEqual(paRubric.mark, 0.5, 'Failing to average all 3 concordant titres must be penalized 0.5 Mk');
  });

  it('should enforce Qualitative Analysis Q2 marking, amphoteric grouping, contradictory ion penalty, and charge penalties', () => {
    const engine = new CompositeExamEngine({ presetKey: 'series_1' });

    // Test NaOH: Full amphoteric grouping (Pb²⁺, Al³⁺, Zn²⁺)
    engine.setQ2Response('q2_naoh', 'White precipitate formed, soluble in excess to form a colorless solution', 'Pb²⁺, Al³⁺, Zn²⁺ present');
    let q2Score = engine.calculateQ2Score();
    const naohRubric = q2Score.rubric.find(r => r.code.includes('Q2_c') || r.item.includes('NaOH'));
    assert.strictEqual(naohRubric.mark, 3.0, 'Full mark (1.5 obs + 1.5 inf) for correct amphoteric deduction');

    // Contradictory ion penalty: candidate includes Cu²⁺ for white precipitate
    const engineCi = new CompositeExamEngine({ presetKey: 'series_1' });
    engineCi.setQ2Response('q2_naoh', 'White precipitate formed, soluble in excess to form a colorless solution', 'Pb²⁺, Al³⁺, Zn²⁺, Cu²⁺ present');
    let q2CiScore = engineCi.calculateQ2Score();
    const ciRubric = q2CiScore.rubric.find(r => r.code.includes('Q2_c') || r.item.includes('NaOH'));
    assert.ok(ciRubric.detail.includes('CI Penalty'), 'Contradictory ion must trigger CI penalty');
    assert.ok(ciRubric.mark < 3.0, 'Mark must be reduced due to contradictory ion penalty');

    // Ionic charge penalty: candidate writes Pb, Al without charges
    const engineCp = new CompositeExamEngine({ presetKey: 'series_1' });
    engineCp.setQ2Response('q2_naoh', 'White precipitate formed, soluble in excess to form a colorless solution', 'Pb, Al present');
    let q2CpScore = engineCp.calculateQ2Score();
    const cpRubric = q2CpScore.rubric.find(r => r.code.includes('Q2_c') || r.item.includes('NaOH'));
    assert.ok(cpRubric.detail.includes('CP Penalty'), 'Missing ionic charge superscripts must trigger CP penalty');

    // Final Cation & Anion Deductions
    engine.setQ2Deduction('Pb²⁺', 'NO₃⁻');
    const finalScore = engine.calculateQ2Score();
    const catRubric = finalScore.rubric.find(r => r.code === 'Q2_CAT');
    const aniRubric = finalScore.rubric.find(r => r.code === 'Q2_ANI');
    assert.strictEqual(catRubric.mark, 1.5, 'Cation with charge awarded 1.5 Mks');
    assert.strictEqual(aniRubric.mark, 1.5, 'Anion identified awarded 1.5 Mks');
  });

  it('should enforce Organic Analysis Q3 rubrics and functional group deduction', () => {
    const engine = new CompositeExamEngine({ presetKey: 'series_1' });
    engine.setQ3Response('q3_ignition', 'Burns with a non-sooty, pale blue flame', 'Low C:H ratio / Saturated compound');
    engine.setQ3Response('q3_litmus', 'No change on moist red and blue litmus paper', 'Neutral substance');
    engine.setQ3Response('q3_kmno4', 'Purple acidified KMnO₄ decolorized', 'Alkanol (—OH group) present');
    engine.setQ3Response('q3_nahco3', 'No effervescence observed', 'R-COOH absent');
    engine.setQ3Deduction('Alkanol (-OH)');

    const q3Score = engine.calculateQ3Score();
    assert.strictEqual(q3Score.totalScore, 10.0, 'Candidate should get full 10.0 marks for complete organic diagnosis');

    // Test partial credit for functional group (only class name or only symbol)
    engine.setQ3Deduction('Alkanol');
    const q3Partial = engine.calculateQ3Score();
    const fgRubric = q3Partial.rubric.find(r => r.code === 'Q3_FG');
    assert.strictEqual(fgRubric.mark, 1.0, 'Partial mark awarded when only class name or symbol is provided');
  });

  it('should validate AI Exam Assistant Service blueprints and fallbacks', () => {
    const assistantService = require(path.join(rootDir, 'server', 'services', 'aiExamAssistantService.js'));
    const { FALLBACK_PRESETS } = assistantService;
    assert.ok(FALLBACK_PRESETS.classic, 'Classic preset must exist');
    assert.ok(FALLBACK_PRESETS.redox, 'Redox preset must exist');
    assert.strictEqual(FALLBACK_PRESETS.classic.examConfig.q1.calcType, 'standard_molarity');
    assert.strictEqual(FALLBACK_PRESETS.redox.examConfig.q1.calcType, 'redox_stoichiometry');
  });

});

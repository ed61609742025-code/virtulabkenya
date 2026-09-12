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

  it('should validate KCSE 2023 authentic preset with dual-key ECF answering', () => {
    const engine2023 = new CompositeExamEngine({ presetKey: 'series_2023' });
    assert.strictEqual(engine2023.preset.id, 'series_2023');
    assert.strictEqual(engine2023.preset.q2.trueCation, 'Ca2+');
    assert.strictEqual(engine2023.preset.q3.trueOrganicKey, 'Hex-1-ene');
    assert.strictEqual(engine2023.preset.q1.moleRatioAcid, 1);
    assert.strictEqual(engine2023.preset.q1.moleRatioBase, 2);

    engine2023.recordTrial(1, 25.00, 0.00);
    engine2023.recordTrial(2, 25.00, 0.00);
    engine2023.setConcordant(1, true);
    engine2023.setConcordant(2, true);

    // Test dual-keying by answering with step_a, step_b, step_c, step_d, step_e
    engine2023.setQ1Answer('step_a', '25.00'); // 25.00 cm³
    engine2023.setQ1Answer('step_b', '0.00125'); // (0.050 * 25) / 1000 = 0.00125 mol H2C2O4
    engine2023.setQ1Answer('step_c', '0.00250'); // 0.00125 * 2 = 0.00250 mol NaOH
    engine2023.setQ1Answer('step_d', '0.100'); // (0.00250 * 1000) / 25 = 0.100 M NaOH
    engine2023.setQ1Answer('step_e', '4.00'); // 0.100 * 40 = 4.00 g/dm³

    const score = engine2023.calculateQ1Score();
    assert.strictEqual(score.calcScore, 10.0, 'Full 10.0 marks for KCSE 2023 dual-key answered steps');
  });

  it('should validate KCSE 2024 authentic percentage purity preset and ECF logic', () => {
    const engine2024 = new CompositeExamEngine({ presetKey: 'series_2024' });
    assert.strictEqual(engine2024.preset.id, 'series_2024');
    assert.strictEqual(engine2024.preset.q1.calcType, 'percentage_purity');
    assert.strictEqual(engine2024.preset.q2.trueCation, 'Fe3+');
    assert.strictEqual(engine2024.preset.q3.trueOrganicKey, 'Butan-1-ol');

    engine2024.recordTrial(1, 24.00, 0.00);
    engine2024.recordTrial(2, 24.00, 0.00);
    engine2024.setConcordant(1, true);
    engine2024.setConcordant(2, true);

    // Candidate has slightly different titre (24.00 cm³) with ECF propagation
    engine2024.setQ1Answer('avgTitre', '24.00'); // 24.00 cm³
    engine2024.setQ1Answer('molesA', '0.00240'); // (0.100 * 24.00) / 1000 = 0.00240 mol HCl
    engine2024.setQ1Answer('molesB', '0.00240'); // 1:1 ratio = 0.00240 mol NaHCO3
    engine2024.setQ1Answer('molarityB', '0.0960'); // (0.00240 * 1000) / 25 = 0.0960 M
    engine2024.setQ1Answer('massPure', '8.064'); // 0.0960 * 84 = 8.064 g
    engine2024.setQ1Answer('percentagePurity', '80.6'); // (8.064 / 10.00) * 100 = 80.6%

    const score = engine2024.calculateQ1Score();
    assert.strictEqual(score.calcScore, 10.0, 'Full marks via ECF for KCSE 2024 percentage purity');
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

  it('should enforce standalone Qualitative Salt Analysis KNEC rubrics, taboo penalties, CI penalties, and CP penalties', () => {
    const qualEnginePath = path.join(rootDir, 'client', 'student', 'js', 'qualitative-engine.js');
    const {
      SALTS,
      TESTS,
      parseInferredIons,
      detectContradictoryIons,
      evaluateObservationAccuracy,
      evaluateInferenceAccuracy
    } = require(qualEnginePath);

    assert.ok(SALTS, 'SALTS dictionary must exist');
    assert.ok(TESTS, 'TESTS array must exist');
    assert.strictEqual(TESTS.length, 9, 'Must have all 9 systematic KNEC tests');

    const leadNitrate = SALTS.leadNitrate;
    const testNaOH = TESTS.find(t => t.key === 'naoh');
    const testNH3 = TESTS.find(t => t.key === 'nh3');

    // 1. Taboo deduction: writing "white solution" must receive -0.5 penalty
    const tabooEval = evaluateObservationAccuracy(testNaOH, leadNitrate, 'White solution formed in excess');
    assert.strictEqual(tabooEval.tabooPenalty, true, 'Must flag taboo term "white solution"');
    assert.ok(tabooEval.notes.some(n => n.includes('KNEC Penalty')), 'Must include KNEC Penalty note');

    // 2. Accurate observation: "White precipitate, dissolves in excess to form a colorless solution"
    const accurateObs = evaluateObservationAccuracy(testNaOH, leadNitrate, 'White ppt, soluble in excess to form a colorless solution');
    assert.strictEqual(accurateObs.score, 0.55, 'Full 0.55 marks awarded for accurate observation with excess behavior');
    assert.strictEqual(accurateObs.tabooPenalty, false);

    // 3. Omitted excess behavior: partial marks
    const partialObs = evaluateObservationAccuracy(testNaOH, leadNitrate, 'White ppt formed');
    assert.strictEqual(partialObs.score, 0.35, 'Partial 0.35 mark awarded when excess behavior is omitted');
    assert.ok(partialObs.warnings.length > 0, 'Should warn about specifying excess reagent');

    // 4. Missing charge penalty: writing "Pb, Al, Zn" without charges
    const cpEval = evaluateInferenceAccuracy(testNaOH, leadNitrate, 'Pb, Al, Zn present', 'White ppt, soluble in excess');
    assert.strictEqual(cpEval.chargePenalty, 0.5, 'Must penalize 0.5 marks for missing ionic charges');
    assert.ok(cpEval.notes.some(n => n.includes('Ionic Charge Penalty')), 'Must note missing charge penalty');

    // 5. Contradictory ion penalty: candidate includes Cu²⁺ or Fe³⁺ for white ppt
    const ciEval = evaluateInferenceAccuracy(testNaOH, leadNitrate, 'Pb²⁺, Al³⁺, Zn²⁺, Cu²⁺ present', 'White ppt, soluble in excess');
    assert.strictEqual(ciEval.ciPenalty, 0.5, 'Must penalize 0.5 marks for contradictory colored ion');
    assert.ok(ciEval.contradictions.some(c => c.ion === 'Cu²⁺'), 'Must list Cu²⁺ as contradiction');

    // 6. Insoluble in excess NH3: inferring Zn²⁺ is contradictory
    const ciZnEval = evaluateInferenceAccuracy(testNH3, leadNitrate, 'Pb²⁺, Al³⁺, Zn²⁺ present', 'White ppt, insoluble in excess NH₃');
    assert.strictEqual(ciZnEval.ciPenalty, 0.5, 'Must penalize 0.5 marks for inferring Zn²⁺ when ppt is insoluble in excess NH₃');
    assert.ok(ciZnEval.contradictions.some(c => c.ion === 'Zn²⁺'), 'Must identify Zn²⁺ contradiction');

    // 7. Calcium Chloride in Aqueous Ammonia [NH3(aq)]: NO PRECIPITATE formed
    const calciumChloride = SALTS.calciumChloride;
    const noPptObs1 = evaluateObservationAccuracy(testNH3, calciumChloride, 'No precipitate formed');
    assert.strictEqual(noPptObs1.score, 0.55, 'Full 0.55 mark for "No precipitate formed" in NH3 for Ca²⁺');

    const noPptObs2 = evaluateObservationAccuracy(testNH3, calciumChloride, 'No white precipitate formed (colorless solution remains)');
    assert.strictEqual(noPptObs2.score, 0.55, 'Full 0.55 mark for "No white precipitate formed (colorless solution remains)" in NH3');

    // 8. Calcium Chloride in NH3 Inferences: "Ca²⁺ present" and "Cu²⁺, Fe²⁺, Fe³⁺, Al³⁺, Pb²⁺, Zn²⁺ absent"
    const caPresentInf = evaluateInferenceAccuracy(testNH3, calciumChloride, 'Ca²⁺ present', 'No precipitate formed');
    assert.strictEqual(caPresentInf.score, 0.55, 'Full marks for Ca²⁺ present when no ppt in NH3');
    assert.strictEqual(caPresentInf.ciPenalty, 0.0);

    const absentIonsInf = evaluateInferenceAccuracy(testNH3, calciumChloride, 'Cu²⁺, Fe²⁺, Fe³⁺, Al³⁺, Pb²⁺, Zn²⁺ absent', 'No precipitate formed');
    assert.strictEqual(absentIonsInf.score, 0.55, 'Full marks for deducing absence of precipitating cations');
    assert.strictEqual(absentIonsInf.ciPenalty, 0.0, 'Must not falsely penalize absent ions as contradictory');

    // 9. Copper Sulfate with AgNO3: Halide absence
    const testAgNO3 = TESTS.find(t => t.key === 'agno3');
    const copperSulfate = SALTS.copperSulfate;
    const agno3NoPptObs = evaluateObservationAccuracy(testAgNO3, copperSulfate, 'No precipitate formed');
    assert.strictEqual(agno3NoPptObs.score, 0.55, 'Full marks for "No precipitate formed" with AgNO3 on sulfate');

    const halideAbsentInf = evaluateInferenceAccuracy(testAgNO3, copperSulfate, 'Cl⁻, Br⁻, I⁻ absent', 'No precipitate formed');
    assert.strictEqual(halideAbsentInf.score, 0.55, 'Full marks for Halides absent on negative AgNO3 test');
    assert.strictEqual(halideAbsentInf.ciPenalty, 0.0);

    // 10. Calcium Chloride with BaCl2: Sulfate absence
    const testBaCl2 = TESTS.find(t => t.key === 'bacl2');
    const bacl2NoPptObs = evaluateObservationAccuracy(testBaCl2, calciumChloride, 'No precipitate formed');
    assert.strictEqual(bacl2NoPptObs.score, 0.55, 'Full marks for "No precipitate formed" with BaCl2 on chloride');

    const sulfateAbsentInf = evaluateInferenceAccuracy(testBaCl2, calciumChloride, 'SO₄²⁻, SO₃²⁻ absent', 'No precipitate formed');
    assert.strictEqual(sulfateAbsentInf.score, 0.55, 'Full marks for SO4²⁻, SO3²⁻ absent on negative BaCl2 test');
    assert.strictEqual(sulfateAbsentInf.ciPenalty, 0.0);

    // 11. Sodium Carbonate & Sodium Hydrogen Carbonate in HCl: dual CO₃²⁻ / HCO₃⁻ inference
    const testHCl = TESTS.find(t => t.key === 'hcl');
    const sodiumCarbonate = SALTS.sodiumCarbonate;
    const sodiumHydrogenCarbonate = SALTS.sodiumHydrogenCarbonate;

    assert.ok(sodiumHydrogenCarbonate, 'SALTS.sodiumHydrogenCarbonate must be registered');

    const hclDualInf1 = evaluateInferenceAccuracy(testHCl, sodiumCarbonate, 'CO₃²⁻ / HCO₃⁻ present', 'Brisk effervescence; gas turns limewater milky');
    assert.strictEqual(hclDualInf1.score, 0.55, 'Full 0.55 mark for "CO₃²⁻ / HCO₃⁻ present" on Na2CO3 acid effervescence');
    assert.strictEqual(hclDualInf1.ciPenalty, 0.0);

    const hclDualInf2 = evaluateInferenceAccuracy(testHCl, sodiumHydrogenCarbonate, 'CO₃²⁻ or HCO₃⁻ present', 'Brisk effervescence; gas turns limewater milky');
    assert.strictEqual(hclDualInf2.score, 0.55, 'Full 0.55 mark for "CO₃²⁻ or HCO₃⁻ present" on NaHCO3 acid effervescence');

    const hclSingleHco3Inf = evaluateInferenceAccuracy(testHCl, sodiumHydrogenCarbonate, 'HCO₃⁻ present', 'Brisk effervescence; gas turns limewater milky');
    assert.strictEqual(hclSingleHco3Inf.score, 0.55, 'Full 0.55 mark for "HCO₃⁻ present" on NaHCO3 acid effervescence');

    // 12. NaHCO3 Dry Thermal Heating: water droplets + CO2 observation and HCO3- inference
    const testHeat = TESTS.find(t => t.key === 'heat_solid');
    const heatHco3Obs = evaluateObservationAccuracy(testHeat, sodiumHydrogenCarbonate, 'Colorless water droplets condense on cooler upper walls; colorless gas turns limewater milky; white residue remains');
    assert.strictEqual(heatHco3Obs.score, 0.55, 'Full 0.55 mark for NaHCO3 thermal decomposition observation');

    const heatHco3Inf = evaluateInferenceAccuracy(testHeat, sodiumHydrogenCarbonate, 'HCO₃⁻ present (decomposes with CO₂ & H₂O)', 'Water droplets condense, limewater milky');
    assert.strictEqual(heatHco3Inf.score, 0.55, 'Full 0.55 mark for HCO₃⁻ present deduction on thermal heating');
  });

});

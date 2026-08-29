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

  it('should validate AI Exam Assistant Service blueprints and fallbacks', () => {
    const assistantService = require(path.join(rootDir, 'server', 'services', 'aiExamAssistantService.js'));
    const { FALLBACK_PRESETS } = assistantService;
    assert.ok(FALLBACK_PRESETS.classic, 'Classic preset must exist');
    assert.ok(FALLBACK_PRESETS.redox, 'Redox preset must exist');
    assert.strictEqual(FALLBACK_PRESETS.classic.examConfig.q1.calcType, 'standard_molarity');
    assert.strictEqual(FALLBACK_PRESETS.redox.examConfig.q1.calcType, 'redox_stoichiometry');
  });

});

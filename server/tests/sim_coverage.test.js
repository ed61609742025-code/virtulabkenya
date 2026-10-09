// ============================================================
//  VirtuLab Kenya — Simulation Coverage Regression Test Suite
//  Verifies that every question's simulation status is accurately tracked.
// ============================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { evaluateSimulationCoverage } = require('../scripts/check_sim_coverage.js');
const { KCSE_PAST_PAPERS_ARCHIVE } = require('../../client/student/js/kcse-past-papers-data.js');
const { COMPOSITE_EXAM_PRESETS } = require('../../client/student/js/composite-engine.js');

test('Simulation Coverage & Gap Reporting Suite', async (t) => {
  await t.test('should calculate accurate metrics across past papers archive', () => {
    const report = evaluateSimulationCoverage();

    assert.ok(report, 'Report should be defined');
    assert.strictEqual(report.totalPapers, KCSE_PAST_PAPERS_ARCHIVE.length, 'Total papers matches archive');
    assert.ok(report.totalQuestions >= 50, 'Total questions should be at least 50');
    assert.ok(report.playablePapers >= 8, 'At least 8 papers must have full 40-mark simulations');
    assert.ok(report.simulatedQuestions >= 24, 'At least 24 questions must be simulated');
    assert.strictEqual(report.totalQuestions, report.simulatedQuestions + report.writtenOnlyQuestions, 'Sum of simulated and written questions must equal total');
  });

  await t.test('should verify that all playable papers map to existing presets in COMPOSITE_EXAM_PRESETS', () => {
    const report = evaluateSimulationCoverage();
    const playablePapers = report.paperLedger.filter(p => p.isPlayable);

    playablePapers.forEach(p => {
      assert.ok(p.playablePresetKey, `Paper ${p.id} must have playablePresetKey`);
      assert.ok(COMPOSITE_EXAM_PRESETS[p.playablePresetKey], `Preset ${p.playablePresetKey} must exist in COMPOSITE_EXAM_PRESETS`);
      assert.strictEqual(p.simulatedCount, p.questionCount, `Playable paper ${p.id} must have all questions simulated`);
    });
  });

  await t.test('should track all pending un-simulated questions with clear metadata', () => {
    const report = evaluateSimulationCoverage();
    
    assert.ok(Array.isArray(report.pendingSimulations), 'pendingSimulations should be an array');
    report.pendingSimulations.forEach(pend => {
      assert.ok(pend.paperId, 'Pending entry must have paperId');
      assert.ok(pend.year, 'Pending entry must have year');
      assert.ok(pend.questionNumber, 'Pending entry must have questionNumber');
      assert.ok(pend.questionTitle, 'Pending entry must have questionTitle');
    });
  });
});

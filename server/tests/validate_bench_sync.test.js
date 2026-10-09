// ============================================================
//  VirtuLab Kenya — Bench & Question Synchronization Test Suite
//  Automated regression test verifying that questions, mock presets,
//  and simulation benches have zero drift.
// ============================================================

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const { runValidation } = require(path.join(__dirname, '..', 'scripts', 'validate_bench_sync.js'));

describe('Cross-Bench & Question Synchronization Validator', () => {

  it('should pass all critical synchronization checks without errors', () => {
    const result = runValidation({ verbose: false });
    
    assert.strictEqual(
      result.stats.errorsCount,
      0,
      `Validation found ${result.stats.errorsCount} critical errors: ${JSON.stringify(result.issues.filter(i => i.severity === 'error'))}`
    );
    assert.strictEqual(result.success, true, 'Validation suite must succeed');
  });

  it('should verify all 6 canonical shared bench registries are populated and accessible in Node', () => {
    const rootDir = path.resolve(__dirname, '..', '..');
    const QualitativeBenchCore = require(path.join(rootDir, 'client', 'shared', 'qualitative-bench-core.js'));
    const OrganicBenchCore = require(path.join(rootDir, 'client', 'shared', 'organic-bench-core.js'));
    const EnergyBenchCore = require(path.join(rootDir, 'client', 'shared', 'energy-bench-core.js'));
    const RatesBenchCore = require(path.join(rootDir, 'client', 'shared', 'rates-bench-core.js'));
    const GasPrepBenchCore = require(path.join(rootDir, 'client', 'shared', 'gas-prep-bench-core.js'));
    const SolubilityBenchCore = require(path.join(rootDir, 'client', 'shared', 'solubility-bench-core.js'));

    assert.ok(Object.keys(QualitativeBenchCore.SALTS).length >= 10, 'Qualitative salts registry');
    assert.ok(Object.keys(OrganicBenchCore.SAMPLES).length >= 6, 'Organic samples registry');
    assert.ok(Object.keys(EnergyBenchCore.SYSTEMS).length >= 3, 'Energy systems registry');
    assert.ok(Object.keys(RatesBenchCore.EXPERIMENTS).length >= 2, 'Rates experiments registry');
    assert.ok(Object.keys(GasPrepBenchCore.GAS_DATABASE).length >= 5, 'Gas prep database');
    assert.ok(Object.keys(SolubilityBenchCore.SALT_MODELS).length >= 3, 'Solubility salt models');
  });

  it('should ensure all playable presets in past papers archive resolve to valid composite presets', () => {
    const rootDir = path.resolve(__dirname, '..', '..');
    const { COMPOSITE_EXAM_PRESETS } = require(path.join(rootDir, 'client', 'student', 'js', 'composite-engine.js'));
    const { KCSE_PAST_PAPERS_ARCHIVE } = require(path.join(rootDir, 'client', 'student', 'js', 'kcse-past-papers-data.js'));

    const playablePapers = KCSE_PAST_PAPERS_ARCHIVE.filter(p => Boolean(p.playablePresetKey));
    assert.ok(playablePapers.length > 0, 'Must have at least one playable past paper preset');

    playablePapers.forEach(paper => {
      const preset = COMPOSITE_EXAM_PRESETS[paper.playablePresetKey];
      assert.ok(
        preset,
        `Past paper [${paper.id}] references unknown playablePresetKey '${paper.playablePresetKey}'`
      );
      assert.ok(preset.q1, `Preset [${paper.playablePresetKey}] must have q1`);
      assert.ok(preset.q2, `Preset [${paper.playablePresetKey}] must have q2`);
      assert.ok(preset.q3, `Preset [${paper.playablePresetKey}] must have q3`);
    });
  });

  it('should verify all volumetric titration presets produce KNEC concordant titres (10.0 to 35.0 cm³)', () => {
    const rootDir = path.resolve(__dirname, '..', '..');
    const { COMPOSITE_EXAM_PRESETS } = require(path.join(rootDir, 'client', 'student', 'js', 'composite-engine.js'));

    Object.keys(COMPOSITE_EXAM_PRESETS).forEach(key => {
      const p = COMPOSITE_EXAM_PRESETS[key];
      if (p.q1 && p.q1.type === 'titration') {
        const procedures = p.q1.hasMultipleProcedures && Array.isArray(p.q1.procedures) ? p.q1.procedures : [p.q1];
        procedures.forEach((proc, idx) => {
          let titre = proc.trueTitre;
          if (!titre && proc.trueAcidMolarity && proc.trueBaseMolarity) {
            const rA = Number(proc.moleRatioAcid || 1);
            const rB = Number(proc.moleRatioBase || 1);
            const pVol = Number(proc.pipetteVolume || 25.0);
            titre = (rA * proc.trueBaseMolarity * pVol) / (rB * proc.trueAcidMolarity);
          }
          assert.ok(
            titre >= 10.0 && titre <= 35.0,
            `Preset [${key}] procedure ${idx + 1} titre ${titre} cm³ outside valid concordant range [10, 35]`
          );
        });
      }
    });
  });

});

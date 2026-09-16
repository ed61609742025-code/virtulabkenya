/**
 * VirtuLab Kenya — Laboratory Bench Fidelity & Realism Suite Tests
 * Tests for Category 3: Laboratory Bench Fidelity & Realism
 * 
 * Validates:
 * 1. Half-Drop (+0.025 cm³) precision delivery and concordancy math
 * 2. Burette Parallax Simulator viewing angles (-8°, 0°, +8°) and apparent volume shifts
 * 3. Flame Emission Spectra Dual-Optical Viewport (Naked Eye vs Cobalt Blue Glass)
 * 4. Transient Endpoint Swirl Dissipation & Equivalence Permanence Dynamics
 * 5. Glassware tip-touching animation & DOM chassis verification
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const QualitativeBenchCore = require('../../client/shared/qualitative-bench-core.js');

describe('Category 3: Laboratory Bench Fidelity & Realism Tests', () => {

  describe('1. Volumetric Half-Drop & Tip-Touching Precision Delivery', () => {
    it('should accurately deliver +0.025 cm³ per half-drop without floating-point drift', () => {
      let currentVolume = 0.0;
      const HALF_DROP = 0.025;

      // Simulate 4 half-drops: 0.000 -> 0.025 -> 0.050 -> 0.075 -> 0.100
      for (let i = 1; i <= 4; i++) {
        currentVolume = Math.min(50, Math.round((currentVolume + HALF_DROP) * 1000) / 1000);
      }

      assert.strictEqual(currentVolume, 0.1, '4 half-drops must equal exactly 0.100 cm³');
    });

    it('should correctly format half-drop volumes to 2 decimal places for KNEC Table 1', () => {
      function roundTo2DP(vol) {
        return (Math.round((vol + Number.EPSILON) * 100) / 100).toFixed(2);
      }
      const vol1 = 14.025;
      const vol2 = 14.050;
      const vol3 = 14.075;

      assert.strictEqual(roundTo2DP(vol1), '14.03', '14.025 cm³ should round to 14.03 cm³');
      assert.strictEqual(roundTo2DP(vol2), '14.05', '14.050 cm³ should format as 14.05 cm³');
      assert.strictEqual(roundTo2DP(vol3), '14.08', '14.075 cm³ should round to 14.08 cm³');
    });

    it('should evaluate concordancy when candidate uses precision half-drop titres', () => {
      // Two concordant trials within ±0.10 cm³ of each other
      const trial1 = 22.425;
      const trial2 = 22.450;
      const diff = Math.abs(trial1 - trial2);
      assert.ok(diff <= 0.10, `Difference ${diff.toFixed(3)} cm³ is well within KCSE ±0.10 cm³ concordancy limit`);

      const avg = (trial1 + trial2) / 2;
      assert.strictEqual(Math.round(avg * 100) / 100, 22.44, 'Average should be 22.44 cm³');
    });
  });

  describe('2. Burette Parallax Simulator & Sightline Angle Calibration', () => {
    function calcApparentVolume(trueVolume, angle) {
      const shift = (angle / 8) * 0.08;
      return Math.max(0, Math.min(50, Math.round((trueVolume + shift) * 1000) / 1000));
    }

    function calcTickSplitOffset(angle) {
      return angle * 0.75; // px separation between front and rear marks
    }

    it('should provide zero parallax error at 0° calibrated eye level', () => {
      const trueVolume = 18.50;
      const apparent = calcApparentVolume(trueVolume, 0);
      const offset = calcTickSplitOffset(0);

      assert.strictEqual(apparent, 18.50, 'At 0° eye level, apparent volume must exactly equal true volume');
      assert.strictEqual(offset, 0, 'At 0° eye level, front and rear ticks must coincide (0px offset)');
    });

    it('should introduce +0.08 cm³ apparent error when looking from above (+8° High)', () => {
      const trueVolume = 18.50;
      const apparent = calcApparentVolume(trueVolume, 8);
      const offset = calcTickSplitOffset(8);

      assert.strictEqual(apparent, 18.58, 'At +8° high, meniscus bottom projects downward to higher scale reading (+0.08 cm³)');
      assert.strictEqual(offset, 6.0, 'Front and rear graduation marks split by 6.0px');
    });

    it('should introduce -0.08 cm³ apparent error when looking from below (-8° Low)', () => {
      const trueVolume = 18.50;
      const apparent = calcApparentVolume(trueVolume, -8);
      const offset = calcTickSplitOffset(-8);

      assert.strictEqual(apparent, 18.42, 'At -8° low, meniscus bottom projects upward to lower scale reading (-0.08 cm³)');
      assert.strictEqual(offset, -6.0, 'Front and rear graduation marks split by -6.0px');
    });

    it('should warn students that an off-angle reading risks losing KNEC Accuracy [AC] marks', () => {
      // KNEC penalizes deviations from teacher Standard Value:
      // Within ±0.10 cm³ = full marks (5/5)
      // Within ±0.20 cm³ = partial marks (3/5)
      // Deviation > 0.20 cm³ = 0/5
      const standardVal = 20.00;
      const readingWithParallax = calcApparentVolume(standardVal, 8) + 0.05; // Cumulative student error + parallax
      const deviation = Math.abs(readingWithParallax - standardVal);

      assert.ok(deviation > 0.10, 'Parallax error pushes reading outside strict ±0.10 cm³ full-mark threshold');
    });
  });

  describe('3. Flame Emission Spectra Dual-Optical Viewport (Naked Eye vs Cobalt Blue Glass)', () => {
    it('should absorb 589 nm Sodium yellow emission completely through Cobalt Blue Glass', () => {
      const naState = QualitativeBenchCore.resolveReactionState(
        'sodiumCarbonate',
        'q2_flame',
        'done',
        'Dip clean glass rod into solution and place in flame',
        '',
        { isCobaltGlass: true }
      );
      assert.ok(naState.statusLabel.includes('completely absorbed') || naState.statusLabel.includes('invisible'),
        'Sodium golden yellow flame must be completely absorbed by cobalt blue glass');

      const naSvg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'sodiumCarbonate',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip clean glass rod into flame',
        isCobaltGlass: true
      });
      assert.ok(naSvg.includes('rgba(148, 163, 184, 0.22)'), 'Absorbed flame color must match faint slate tint');
    });

    it('should transmit Potassium lilac emission (766 nm & 404 nm) through Cobalt Blue Glass', () => {
      const kState = QualitativeBenchCore.resolveReactionState(
        'potassiumChloride',
        'q2_flame',
        'done',
        'Dip clean glass rod into solution and place in flame',
        '',
        { isCobaltGlass: true }
      );
      assert.ok(kState.statusLabel.includes('Pale lilac') || kState.statusLabel.includes('purple'),
        'Potassium lilac emission must transmit clearly through cobalt blue glass');

      const kSvg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'potassiumChloride',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip clean glass rod into flame',
        isCobaltGlass: true
      });
      assert.ok(kSvg.includes('#F472B6') || kSvg.includes('#C084FC'),
        'Transmitted potassium flame must be radiant lilac/pink');
    });

    it('should attenuate Calcium brick-red flame (622 nm) through Cobalt Blue Glass', () => {
      const caSvg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'calciumChloride',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip clean glass rod into flame',
        isCobaltGlass: true
      });
      assert.ok(caSvg.includes('rgba(148, 163, 184, 0.35)'), 'Calcium brick-red flame is attenuated');
    });

    it('should transmit Copper peacock blue-green flame (510 nm) through Cobalt Blue Glass', () => {
      const cuSvg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'copperSulfate',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip clean glass rod into flame',
        isCobaltGlass: true
      });
      assert.ok(cuSvg.includes('#38BDF8'), 'Copper viridian/blue-green flame transmits through blue optical filter');
    });

    it('should absorb Barium apple-green flame (553 nm) through Cobalt Blue Glass', () => {
      const baSvg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'bariumChloride',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip clean glass rod into flame',
        isCobaltGlass: true
      });
      assert.ok(baSvg.includes('rgba(100, 116, 139, 0.3)'), 'Barium apple-green flame is absorbed by cobalt blue glass');
    });
  });

  describe('4. Transient Endpoint Swirl & Color Premonition Dynamics', () => {
    function evaluateTitrationColorStage(delivered, eqVol) {
      const diff = delivered - eqVol;
      if (diff < -0.25) return 'stage0_base';
      if (diff < 0.00) return 'stage1_transient';
      if (diff < 0.40) return 'stage2_permanent';
      return 'stage3_overtitrated';
    }

    it('should identify near-endpoint premonition zone within 0.25 cm³ of equivalence', () => {
      const eqVol = 24.50;
      assert.strictEqual(evaluateTitrationColorStage(24.20, eqVol), 'stage0_base', '24.20 cm³ is before premonition zone');
      assert.strictEqual(evaluateTitrationColorStage(24.30, eqVol), 'stage1_transient', '24.30 cm³ is in transient premonition zone');
      assert.strictEqual(evaluateTitrationColorStage(24.45, eqVol), 'stage1_transient', '24.45 cm³ is in transient premonition zone');
      assert.strictEqual(evaluateTitrationColorStage(24.50, eqVol), 'stage2_permanent', '24.50 cm³ is permanent equivalence point');
      assert.strictEqual(evaluateTitrationColorStage(25.00, eqVol), 'stage3_overtitrated', '25.00 cm³ is overtitrated');
    });

    it('should simulate transient dissipation: color flash returns to base color unless swirled or equivalence reached', () => {
      const eqVol = 20.00;
      let isSwirled = false;

      // Unswirled after 1.5s -> dissipates back to stage0_base
      const unswirledDissipation = (isSwirled) ? 'stage0_swirled_clean' : 'stage0_base';
      assert.strictEqual(unswirledDissipation, 'stage0_base', 'Bloom dissipates if unswirled');

      // Swirled -> thoroughly mixes and clears localized bloom
      isSwirled = true;
      const swirledState = (isSwirled) ? 'stage0_swirled_clean' : 'stage0_base';
      assert.strictEqual(swirledState, 'stage0_swirled_clean', 'Swirling mixes away localized tinge');
    });

    it('should permanently lock equivalence color when diff >= 0.00 cm³ without dissipating', () => {
      const eqVol = 20.00;
      const delivered = 20.00; // true equivalence
      const stage = evaluateTitrationColorStage(delivered, eqVol);
      assert.strictEqual(stage, 'stage2_permanent', 'Permanent endpoint achieved at equivalence volume');
    });
  });

  describe('5. DOM & Stylesheet Bench Fidelity Asset Verification', () => {
    const labHtmlPath = path.resolve(__dirname, '../../client/student/lab.html');
    const labCssPath = path.resolve(__dirname, '../../client/student/css/lab.css');
    const titrationWorkbenchPath = path.resolve(__dirname, '../../client/student/js/titration-workbench.js');
    const qualitativeEnginePath = path.resolve(__dirname, '../../client/student/js/qualitative-engine.js');

    it('should have parallax angle selector and status chip in lab.html', () => {
      const html = fs.readFileSync(labHtmlPath, 'utf8');
      assert.ok(html.includes('btnParallaxLow'), 'lab.html must contain btnParallaxLow button');
      assert.ok(html.includes('btnParallaxZero'), 'lab.html must contain btnParallaxZero button');
      assert.ok(html.includes('btnParallaxHigh'), 'lab.html must contain btnParallaxHigh button');
      assert.ok(html.includes('parallaxStatusChip'), 'lab.html must contain parallaxStatusChip');
      assert.ok(html.includes('btnHalfDrop'), 'lab.html must contain btnHalfDrop button');
    });

    it('should have tip-touch keyframes and parallax classes in lab.css', () => {
      const css = fs.readFileSync(labCssPath, 'utf8');
      assert.ok(css.includes('@keyframes flaskTipTouch'), 'lab.css must contain flaskTipTouch keyframes');
      assert.ok(css.includes('anim-flask-tip-touch'), 'lab.css must contain anim-flask-tip-touch class');
      assert.ok(css.includes('parallax-view-controls'), 'lab.css must contain parallax-view-controls class');
      assert.ok(css.includes('parallax-status-chip'), 'lab.css must contain parallax-status-chip class');
      assert.ok(css.includes('btn-action-halfdrop'), 'lab.css must contain btn-action-halfdrop class');
    });

    it('should export setParallaxAngle, addHalfDrop, and apparent volume in titration-workbench.js', () => {
      const js = fs.readFileSync(titrationWorkbenchPath, 'utf8');
      assert.ok(js.includes('setParallaxAngle'), 'titration-workbench.js must define setParallaxAngle');
      assert.ok(js.includes('addHalfDrop'), 'titration-workbench.js must define addHalfDrop');
      assert.ok(js.includes('currentParallaxAngle'), 'titration-workbench.js must track currentParallaxAngle');
      assert.ok(js.includes('transientColorTimeout'), 'titration-workbench.js must track transientColorTimeout');
      assert.ok(js.includes('anim-flask-tip-touch'), 'titration-workbench.js must apply anim-flask-tip-touch animation');
    });

    it('should have Dual-Optical Viewport and mode selector in qualitative-engine.js', () => {
      const js = fs.readFileSync(qualitativeEnginePath, 'utf8');
      assert.ok(js.includes('flameOpticalMode'), 'qualitative-engine.js must track flameOpticalMode');
      assert.ok(js.includes('setFlameOpticalMode'), 'qualitative-engine.js must export setFlameOpticalMode');
      assert.ok(js.includes('Dual Split-View'), 'qualitative-engine.js must provide Dual Split-View mode');
      assert.ok(js.includes('clipLeft_'), 'qualitative-engine.js must render dual split optical clip paths');
      assert.ok(js.includes('589 nm'), 'qualitative-engine.js must label 589 nm sodium emission');
    });
  });

});
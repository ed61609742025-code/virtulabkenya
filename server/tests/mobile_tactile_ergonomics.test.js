// ============================================================
//  VirtuLab Kenya — Mobile Tactile Touch & Responsive Ergonomics Test Suite
//  Option 4: WCAG 2.5.5 / 2.5.8 Touch Targets, Notch Insets & Haptic Feedback
// ============================================================

process.env.NODE_ENV = 'test';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

describe('VirtuLab Kenya — Mobile Tactile Touch & Responsive Ergonomics Suite', () => {

  // ─────────────────────────────────────────────────────────────
  //  1. WCAG 2.5.5 / 2.5.8 Touch Target Compliance (>= 44x44px)
  // ─────────────────────────────────────────────────────────────
  describe('1. WCAG 2.5.5 / 2.5.8 Touch Target Dimensions (>= 44px)', () => {
    
    it('should declare min-height: 44px for touch targets in client/shared/style.css', () => {
      const stylePath = path.join(rootDir, 'client/shared/style.css');
      const content = fs.readFileSync(stylePath, 'utf8');

      assert.ok(content.includes('min-height: 44px;'), 'style.css must enforce min-height: 44px for buttons');
      assert.ok(content.includes('.btn-tactile'), 'style.css must include .btn-tactile in touch target rules');
      assert.ok(content.includes('.btn-pill-action'), 'style.css must include .btn-pill-action in touch target rules');
      assert.ok(content.includes('.btn-action-swirl'), 'style.css must include .btn-action-swirl in touch target rules');
      assert.ok(content.includes('.btn-action-record'), 'style.css must include .btn-action-record in touch target rules');
      assert.ok(content.includes('.btn-action-reset'), 'style.css must include .btn-action-reset in touch target rules');
      assert.ok(content.includes('.btn-perform-test'), 'style.css must include .btn-perform-test in touch target rules');
      assert.ok(content.includes('.btn-redo-test'), 'style.css must include .btn-redo-test in touch target rules');
    });

    it('should declare min-height: 44px in client/student/css/mobile.css workbench section', () => {
      const mobilePath = path.join(rootDir, 'client/student/css/mobile.css');
      const content = fs.readFileSync(mobilePath, 'utf8');

      assert.ok(content.includes('Practical Workbench Tactile Touch & Input Ergonomics'), 'mobile.css must include workbench ergonomics section');
      assert.ok(content.includes('min-height: 44px !important;'), 'mobile.css must enforce min-height: 44px !important on small screens');
    });

    it('should ensure titration bench controls in client/student/lab.html satisfy 44px touch target minimums', () => {
      const labPath = path.join(rootDir, 'client/student/lab.html');
      const content = fs.readFileSync(labPath, 'utf8');

      // Stopcock buttons
      assert.ok(content.includes('min-height:44px;touch-action:manipulation;" title="Add 1.00 cm³ titrant'), '+1 cm3 button must have min-height:44px');
      assert.ok(content.includes('min-height:44px;touch-action:manipulation;" title="Add 0.50 cm³ titrant'), '+0.5 cm3 button must have min-height:44px');
      assert.ok(content.includes('min-height:44px;touch-action:manipulation;" title="Add 0.10 cm³ titrant'), '+0.1 cm3 button must have min-height:44px');
      assert.ok(content.includes('min-height:44px;touch-action:manipulation;" title="Add single drop (0.05 cm³)'), '+0.05 cm3 drop button must have min-height:44px');
      assert.ok(content.includes('min-height:44px;touch-action:manipulation;" title="Split a half-drop on burette tip'), 'half-drop button must have min-height:44px');

      // Swirl, Record, and Reset buttons
      assert.ok(content.includes('min-height:44px;touch-action:manipulation;" data-i18n="swirl_flask"'), 'swirl button must have min-height:44px');
      assert.ok(content.includes('min-height:44px;touch-action:manipulation;" data-i18n="record_endpoint"'), 'record endpoint button must have min-height:44px');
      assert.ok(content.includes('min-height:44px;touch-action:manipulation;" data-i18n="reset_burette"'), 'reset burette button must have min-height:44px');
    });

    it('should declare min-height: 44px on qualitative testing buttons in client/student/css/qualitative.css', () => {
      const qualPath = path.join(rootDir, 'client/student/css/qualitative.css');
      const content = fs.readFileSync(qualPath, 'utf8');

      assert.ok(content.includes('.btn-perform-test {') && content.includes('min-height: 44px;'), 'btn-perform-test must declare min-height: 44px');
      assert.ok(content.includes('.btn-redo-test {') && content.includes('min-height: 44px;'), 'btn-redo-test must declare min-height: 44px');
      assert.ok(content.includes('.suggestion-chip {') && content.includes('min-height: 44px;'), 'suggestion-chip must declare min-height: 44px');
      assert.ok(content.includes('.btn-probe-chip {') && content.includes('min-height: 44px;'), 'btn-probe-chip must declare min-height: 44px');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  2. 300ms Delay Elimination & Simulation Canvas Containment
  // ─────────────────────────────────────────────────────────────
  describe('2. Elimination of 300ms Browser Delay & Canvas Touch Containment', () => {

    it('should declare touch-action: manipulation across buttons and links to eliminate 300ms delay', () => {
      const stylePath = path.join(rootDir, 'client/shared/style.css');
      const content = fs.readFileSync(stylePath, 'utf8');

      assert.ok(content.includes('touch-action: manipulation;'), 'style.css must enforce touch-action: manipulation');
      assert.ok(content.includes('-webkit-tap-highlight-color: transparent;'), 'style.css must disable tap highlight flash');
    });

    it('should declare touch-action: none on simulation canvases to prevent pinch-zoom and scroll interference', () => {
      const stylePath = path.join(rootDir, 'client/shared/style.css');
      const content = fs.readFileSync(stylePath, 'utf8');

      assert.ok(content.includes('.curve-canvas-container canvas'), 'style.css must contain titration curve canvas');
      assert.ok(content.includes('.rate-sim-canvas'), 'style.css must contain rates canvas');
      assert.ok(content.includes('#solLabCanvas'), 'style.css must contain solubility canvas');
      assert.ok(content.includes('#energyRigCanvas'), 'style.css must contain energy calorimeter canvas');
      assert.ok(content.includes('touch-action: none;'), 'simulation canvases must declare touch-action: none');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  3. Hardware Notch & Safe-Area Insets Compatibility
  // ─────────────────────────────────────────────────────────────
  describe('3. Hardware Notch & Safe-Area Insets (env(safe-area-inset-*))', () => {

    it('should declare safe area insets in :root and mobile media queries in style.css', () => {
      const stylePath = path.join(rootDir, 'client/shared/style.css');
      const content = fs.readFileSync(stylePath, 'utf8');

      assert.ok(content.includes('env(safe-area-inset-top'), 'style.css must include safe-area-inset-top');
      assert.ok(content.includes('env(safe-area-inset-bottom'), 'style.css must include safe-area-inset-bottom');
      assert.ok(content.includes('env(safe-area-inset-left'), 'style.css must include safe-area-inset-left');
      assert.ok(content.includes('env(safe-area-inset-right'), 'style.css must include safe-area-inset-right');
    });

    it('should apply safe-area insets to top navigation bar and main workbench containers', () => {
      const stylePath = path.join(rootDir, 'client/shared/style.css');
      const content = fs.readFileSync(stylePath, 'utf8');

      assert.ok(content.includes('.top-navbar') && content.includes('padding-top: max('), 'top-navbar must pad for hardware notches');
      assert.ok(content.includes('.workbench-container') && content.includes('padding-left: max('), 'workbench-container must pad for horizontal notches');
    });

    it('should support viewport-fit=cover in student workbench HTML pages', () => {
      const labPath = path.join(rootDir, 'client/student/lab.html');
      const qualPath = path.join(rootDir, 'client/student/qualitative.html');

      const labContent = fs.readFileSync(labPath, 'utf8');
      const qualContent = fs.readFileSync(qualPath, 'utf8');

      assert.ok(labContent.includes('viewport-fit=cover'), 'lab.html must include viewport-fit=cover');
      assert.ok(qualContent.includes('viewport-fit=cover'), 'qualitative.html must include viewport-fit=cover');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  4. Mobile Keypad & Quantitative Table Auto-Zoom Prevention
  // ─────────────────────────────────────────────────────────────
  describe('4. Mobile Keypad Numeric Trigger & Auto-Zoom Prevention', () => {

    it('should enforce font-size: 16px !important on inputs on mobile viewports to prevent auto-zoom', () => {
      const stylePath = path.join(rootDir, 'client/shared/style.css');
      const content = fs.readFileSync(stylePath, 'utf8');

      assert.ok(content.includes('font-size: 16px !important;'), 'style.css must enforce font-size: 16px on mobile inputs');
      assert.ok(content.includes('.calc-input'), 'style.css must apply 16px rule to .calc-input');
      assert.ok(content.includes('.wb-select'), 'style.css must apply 16px rule to .wb-select');
    });

    it('should enforce font-size: 16px !important in mobile.css for workbench and ledger tables', () => {
      const mobilePath = path.join(rootDir, 'client/student/css/mobile.css');
      const content = fs.readFileSync(mobilePath, 'utf8');

      assert.ok(content.includes('font-size: 16px !important;'), 'mobile.css must enforce font-size: 16px on mobile inputs');
    });

    it('should render calculation inputs with inputmode="decimal" and autocomplete="off" in titration-workbench.js', () => {
      const benchPath = path.join(rootDir, 'client/student/js/titration-workbench.js');
      const content = fs.readFileSync(benchPath, 'utf8');

      assert.ok(content.includes('inputmode="decimal"'), 'titration-workbench.js must specify inputmode="decimal"');
      assert.ok(content.includes('autocomplete="off"'), 'titration-workbench.js must specify autocomplete="off"');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  5. Tactile Haptic Feedback API Integration
  // ─────────────────────────────────────────────────────────────
  describe('5. Tactile Haptic Vibration Integration (navigator.vibrate)', () => {

    it('should provide safe triggerHaptic helper with silent fallback in titration-workbench.js', () => {
      const benchPath = path.join(rootDir, 'client/student/js/titration-workbench.js');
      const content = fs.readFileSync(benchPath, 'utf8');

      assert.ok(content.includes('function triggerHaptic('), 'titration-workbench.js must define triggerHaptic helper');
      assert.ok(content.includes('vibrate\' in navigator'), 'triggerHaptic must check for navigator.vibrate support');
    });

    it('should invoke triggerHaptic on burette addition, half-drop, swirl, record, and reset actions', () => {
      const benchPath = path.join(rootDir, 'client/student/js/titration-workbench.js');
      const content = fs.readFileSync(benchPath, 'utf8');

      assert.ok(content.includes('triggerHaptic(amount >= 0.5 ? 20 : 12);'), 'addVolume must trigger tactile haptic');
      assert.ok(content.includes('triggerHaptic(10);'), 'addHalfDrop must trigger gentle haptic');
      assert.ok(content.includes('triggerHaptic([15, 20, 15]);'), 'swirlFlask must trigger swirl haptic pulse');
      assert.ok(content.includes('triggerHaptic([25, 30, 40]);'), 'recordTrial must trigger confirmation haptic');
      assert.ok(content.includes('triggerHaptic(20);'), 'resetBurette must trigger reset haptic');
      assert.ok(content.includes('triggerHaptic(12);'), 'addIndicatorDrops must trigger drop haptic');
    });

    it('should trigger distinctive haptic transition pulse upon reaching permanent equivalence endpoint', () => {
      const benchPath = path.join(rootDir, 'client/student/js/titration-workbench.js');
      const content = fs.readFileSync(benchPath, 'utf8');

      assert.ok(content.includes('triggerHaptic([30, 40, 30]);'), 'must pulse haptic upon permanent equivalence transition');
    });

    it('should integrate haptic feedback into qualitative salt analysis engine', () => {
      const qualJsPath = path.join(rootDir, 'client/student/js/qualitative-engine.js');
      const content = fs.readFileSync(qualJsPath, 'utf8');

      assert.ok(content.includes('triggerQualHaptic('), 'qualitative-engine.js must define haptic helper');
      assert.ok(content.includes('triggerQualHaptic(15);'), 'performTestStage must trigger tactile feedback');
      assert.ok(content.includes('triggerQualHaptic(20);'), 'redoTest must trigger tactile feedback');
      assert.ok(content.includes('triggerQualHaptic([30, 40, 50]);'), 'submitIdentification must trigger celebration haptic');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  6. Preservation of Chart.js Cryptographic SRI Integrity
  // ─────────────────────────────────────────────────────────────
  describe('6. Cryptographic SRI & Security Integrity Check', () => {

    it('should preserve Chart.js 4.4.1 SRI hash across all student and teacher pages', () => {
      const files = [
        'client/student/home.html',
        'client/student/history.html',
        'client/teacher/dashboard.html',
        'client/teacher/research_portal.html'
      ];

      const expectedSri = 'sha384-bs/nf9FbdNouRbMiFcrcZfLXYPKiPaGVGplVbv7dLGECccEXDW+S3zjqSKR5ZEaD';

      files.forEach(file => {
        const fullPath = path.join(rootDir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(content.includes(expectedSri), `${file} must preserve the Chart.js 4.4.1 SRI hash`);
      });
    });
  });

});

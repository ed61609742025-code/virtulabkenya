// ============================================================
//  VirtuLab Kenya — Mobile Tactile Touch & Responsive Ergonomics
//  Option 4 Implementation Script
// ============================================================

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────
//  1. client/shared/style.css
// ─────────────────────────────────────────────────────────────
console.log('1. Updating client/shared/style.css...');
const stylePath = path.join(rootDir, 'client/shared/style.css');
let styleContent = fs.readFileSync(stylePath, 'utf8');

// Identify target mobile section
const oldMobileTarget = '/* ── PHONE & MOBILE RESPONSIVE HYGIENE ── */\r\n@media (max-width: 768px) {';
const oldMobileTargetLF = '/* ── PHONE & MOBILE RESPONSIVE HYGIENE ── */\n@media (max-width: 768px) {';

const newMobileSection = `/* ── PHONE & MOBILE RESPONSIVE HYGIENE & TACTILE TOUCH ERGONOMICS ── */
:root {
  --safe-inset-top: env(safe-area-inset-top, 0px);
  --safe-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-inset-left: env(safe-area-inset-left, 0px);
  --safe-inset-right: env(safe-area-inset-right, 0px);
}

@media (pointer: coarse) {
  /* Enforce WCAG 2.5.5 / 2.5.8 touch target minimum (44x44px) on touch screens */
  button, 
  input[type="button"], 
  input[type="submit"], 
  input[type="reset"],
  a.btn,
  .btn,
  .btn-tactile,
  .btn-pill-action,
  .btn-action-swirl,
  .btn-action-record,
  .btn-action-reset,
  .btn-action-halfdrop,
  .btn-perform-test,
  .btn-redo-test,
  .suggestion-chip,
  .btn-probe-chip {
    min-height: 44px;
    touch-action: manipulation;
  }
}

@media (max-width: 768px) {
  html, body {
    overflow-x: hidden;
    max-width: 100vw;
    -webkit-text-size-adjust: 100%;
  }

  /* Hardware notch & safe-area insets compatibility for Kenyan smartphones (Tecno, Infinix, Samsung) */
  body {
    padding-top: max(0px, env(safe-area-inset-top, 0px));
    padding-left: max(0px, env(safe-area-inset-left, 0px));
    padding-right: max(0px, env(safe-area-inset-right, 0px));
  }

  .academic-top-header,
  .top-navbar {
    padding-top: max(8px, env(safe-area-inset-top, 0px)) !important;
    padding-left: max(12px, env(safe-area-inset-left, 0px)) !important;
    padding-right: max(12px, env(safe-area-inset-right, 0px)) !important;
  }

  .workbench-container,
  .page-container,
  .rate-page-wrap,
  .sol-workbench-grid,
  .dashboard-container {
    padding-left: max(12px, env(safe-area-inset-left, 0px)) !important;
    padding-right: max(12px, env(safe-area-inset-right, 0px)) !important;
    padding-bottom: max(20px, env(safe-area-inset-bottom, 0px)) !important;
  }

  /* Accessible touch targets on phones (WCAG 2.5.5 / 2.5.8 >= 44x44px) */
  button, 
  input[type="button"], 
  input[type="submit"], 
  input[type="reset"],
  a.btn,
  .btn,
  .btn-tactile,
  .btn-pill-action,
  .btn-action-swirl,
  .btn-action-record,
  .btn-action-reset,
  .btn-action-halfdrop,
  .parallax-btn,
  .curve-toggle-btn,
  .rate-btn,
  .rate-exp-tab,
  .sol-btn,
  .sol-mini-btn,
  .sol-scenario-tab,
  .btn-perform-test,
  .btn-redo-test,
  .suggestion-chip,
  .btn-probe-chip,
  .btn-game-action,
  .speed-btn-chip {
    min-height: 44px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  /* Prevent browser 300ms click delay on anchor actions and interactive cards */
  a, 
  .theme-btn-chip, 
  .nav-btn-chip, 
  .practice-banner-card, 
  .game-mode-card {
    touch-action: manipulation;
  }

  /* Mobile Keypad Auto-Zoom Prevention: font-size >= 16px eliminates unwanted zoom */
  input, 
  select, 
  textarea,
  .calc-input,
  .results-table input,
  .kcse-table input,
  .wb-select,
  .id-select,
  .sol-select {
    font-size: 16px !important;
    min-height: 44px;
    touch-action: manipulation;
  }

  /* Simulation canvas touch containment: prevent pull-to-refresh & pinch zoom during drag */
  .curve-canvas-container canvas,
  .rate-sim-canvas,
  #solLabCanvas,
  #energyRigCanvas,
  .circular-loupe-chassis {
    touch-action: none;
  }`;

if (styleContent.includes(oldMobileTarget)) {
  styleContent = styleContent.replace(oldMobileTarget, newMobileSection.replace(/\n/g, '\r\n') + '\r\n');
} else if (styleContent.includes(oldMobileTargetLF)) {
  styleContent = styleContent.replace(oldMobileTargetLF, newMobileSection + '\n');
} else {
  console.warn('Could not find exact match in style.css, appending rules.');
  styleContent += '\n' + newMobileSection;
}

// Remove redundant old button rule if present
styleContent = styleContent.replace(
  /(\r?\n)\s*\/\* Accessible touch targets on phones \*\/\r?\n\s*button,\s*input\[type="button"\],\s*input\[type="submit"\],\s*a\.btn\s*\{\r?\n\s*min-height:\s*44px;\r?\n\s*touch-action:\s*manipulation;\r?\n\s*\}/,
  ''
);

fs.writeFileSync(stylePath, styleContent, 'utf8');
console.log('style.css updated successfully.');

// ─────────────────────────────────────────────────────────────
//  2. client/student/lab.html
// ─────────────────────────────────────────────────────────────
console.log('2. Updating client/student/lab.html touch targets...');
const labHtmlPath = path.join(rootDir, 'client/student/lab.html');
let labHtml = fs.readFileSync(labHtmlPath, 'utf8');

// Update Left Wing (Indicator & Swirl Flask)
labHtml = labHtml.replace(
  'id="addIndicatorBtn" onclick="addIndicatorDrops()" style="width:100%;font-weight:700;padding:8px 8px;font-size:0.78rem;line-height:1.3;"',
  'id="addIndicatorBtn" onclick="addIndicatorDrops()" style="width:100%;font-weight:700;padding:10px 8px;font-size:0.78rem;line-height:1.3;min-height:44px;touch-action:manipulation;"'
);

labHtml = labHtml.replace(
  'onclick="swirlFlask()" style="width:100%;padding:8px 8px;font-size:0.78rem;font-weight:700;height:38px;"',
  'onclick="swirlFlask()" style="width:100%;padding:10px 8px;font-size:0.78rem;font-weight:700;min-height:44px;touch-action:manipulation;"'
);

// Update Right Wing (Stopcock Buttons + Record/Reset)
labHtml = labHtml.replace(
  'onclick="addVolume(1.0)" style="padding:8px 4px;font-size:0.78rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;" title="Add 1.00 cm³ titrant (Coarse delivery)" aria-label="Add 1.00 cm³ titrant">+1 cm³</button>',
  'onclick="addVolume(1.0)" style="padding:10px 4px;font-size:0.78rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;min-height:44px;touch-action:manipulation;" title="Add 1.00 cm³ titrant (Coarse delivery)" aria-label="Add 1.00 cm³ titrant">+1 cm³</button>'
);

labHtml = labHtml.replace(
  'onclick="addVolume(0.5)" style="padding:8px 4px;font-size:0.78rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;" title="Add 0.50 cm³ titrant" aria-label="Add 0.50 cm³ titrant">+0.5 cm³</button>',
  'onclick="addVolume(0.5)" style="padding:10px 4px;font-size:0.78rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;min-height:44px;touch-action:manipulation;" title="Add 0.50 cm³ titrant" aria-label="Add 0.50 cm³ titrant">+0.5 cm³</button>'
);

labHtml = labHtml.replace(
  'onclick="addVolume(0.1)" style="padding:8px 4px;font-size:0.78rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;" title="Add 0.10 cm³ titrant" aria-label="Add 0.10 cm³ titrant">+0.1 cm³</button>',
  'onclick="addVolume(0.1)" style="padding:10px 4px;font-size:0.78rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;min-height:44px;touch-action:manipulation;" title="Add 0.10 cm³ titrant" aria-label="Add 0.10 cm³ titrant">+0.1 cm³</button>'
);

labHtml = labHtml.replace(
  'onclick="addVolume(0.05)" style="padding:8px 4px;font-size:0.78rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;" title="Add single drop (0.05 cm³) for precision equivalence" aria-label="Add single drop of 0.05 cm³">💧 +0.05 cm³</button>',
  'onclick="addVolume(0.05)" style="padding:10px 4px;font-size:0.78rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;min-height:44px;touch-action:manipulation;" title="Add single drop (0.05 cm³) for precision equivalence" aria-label="Add single drop of 0.05 cm³">💧 +0.05 cm³</button>'
);

labHtml = labHtml.replace(
  'id="btnHalfDrop" onclick="addHalfDrop()" style="width:100%;padding:7px 4px;font-size:0.75rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;display:flex;align-items:center;justify-content:center;gap:4px;"',
  'id="btnHalfDrop" onclick="addHalfDrop()" style="width:100%;padding:10px 4px;font-size:0.75rem;font-weight:700;font-family:\'JetBrains Mono\',monospace;display:flex;align-items:center;justify-content:center;gap:4px;min-height:44px;touch-action:manipulation;"'
);

labHtml = labHtml.replace(
  'onclick="recordTrial()" style="width:100%;padding:8px 6px;font-size:0.80rem;font-weight:700;height:38px;" data-i18n="record_endpoint"',
  'onclick="recordTrial()" style="width:100%;padding:10px 6px;font-size:0.80rem;font-weight:700;min-height:44px;touch-action:manipulation;" data-i18n="record_endpoint"'
);

labHtml = labHtml.replace(
  'onclick="resetBurette()" style="width:100%;padding:7px 6px;font-size:0.78rem;font-weight:700;height:36px;" data-i18n="reset_burette"',
  'onclick="resetBurette()" style="width:100%;padding:10px 6px;font-size:0.78rem;font-weight:700;min-height:44px;touch-action:manipulation;" data-i18n="reset_burette"'
);

// Switch practical reset button
labHtml = labHtml.replace(
  'onclick="resetWorkbench()" class="btn-pill-action" style="width:100%; margin-top:10px; height:40px; font-size:0.80rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px;"',
  'onclick="resetWorkbench()" class="btn-pill-action" style="width:100%; margin-top:10px; min-height:44px; font-size:0.80rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px; touch-action:manipulation;"'
);

fs.writeFileSync(labHtmlPath, labHtml, 'utf8');
console.log('lab.html updated successfully.');

// ─────────────────────────────────────────────────────────────
//  3. client/student/js/titration-workbench.js
// ─────────────────────────────────────────────────────────────
console.log('3. Updating titration-workbench.js (Haptics, Keypad & Auto-Zoom)...');
const benchJsPath = path.join(rootDir, 'client/student/js/titration-workbench.js');
let benchJs = fs.readFileSync(benchJsPath, 'utf8');

// Inject universal tactile haptic vibration helper near top
const hapticHelperCode = `
  // ── Universal Tactile Haptic Feedback Helper ──
  function triggerHaptic(pattern = 15) {
    if (typeof window !== 'undefined' && window.BrilliantUI && typeof window.BrilliantUI.vibrate === 'function') {
      try { window.BrilliantUI.vibrate(pattern); } catch(e) {}
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch(e) {}
    }
  }
  window.triggerHaptic = triggerHaptic;
`;

if (!benchJs.includes('function triggerHaptic(')) {
  benchJs = benchJs.replace('requireStudentLogin();', 'requireStudentLogin();\n' + hapticHelperCode);
}

// Wire haptic feedback in addVolume
benchJs = benchJs.replace(
  'function addVolume(amt) {',
  `function addVolume(amt) {
    triggerHaptic(amt >= 0.5 ? 20 : 12);`
);

// Wire haptic feedback in addHalfDrop
benchJs = benchJs.replace(
  'function addHalfDrop() {',
  `function addHalfDrop() {
    triggerHaptic(10);`
);

// Wire haptic feedback in swirlFlask
benchJs = benchJs.replace(
  'function swirlFlask() {',
  `function swirlFlask() {
    triggerHaptic([15, 20, 15]);`
);

// Wire haptic feedback in recordTrial
benchJs = benchJs.replace(
  'function recordTrial() {',
  `function recordTrial() {
    triggerHaptic([25, 30, 40]);`
);

// Wire haptic feedback in resetBurette
benchJs = benchJs.replace(
  'function resetBurette() {',
  `function resetBurette() {
    triggerHaptic(20);`
);

// Wire haptic feedback in addIndicatorDrops
benchJs = benchJs.replace(
  'function addIndicatorDrops() {',
  `function addIndicatorDrops() {
    triggerHaptic(12);`
);

// Check if equivalence reached and trigger haptic transition
const eqTransitionHook = `
    // Haptic pulse when crossing exactly into permanent endpoint
    if (diff >= 0.00 && diff < 0.40 && !window._lastEquivalenceVibrated) {
      window._lastEquivalenceVibrated = true;
      triggerHaptic([30, 40, 30]);
    } else if (diff < 0.00) {
      window._lastEquivalenceVibrated = false;
    }
`;

if (!benchJs.includes('_lastEquivalenceVibrated')) {
  benchJs = benchJs.replace('updateTitrationCurve();', eqTransitionHook + '    updateTitrationCurve();');
}

// Numerical input formatting: inputmode="decimal", autocomplete="off", min-height: 44px
benchJs = benchJs.replace(
  '<input type="number" step="${q.step}" id="${inputId}" data-placeholder="${q.placeholder}" placeholder="${inputPlaceholder}" oninput="saveDraft()" ${isUnlocked ? \'\' : \'disabled\'} aria-label="${cleanLabel}" style="width:100%; font-family:\'JetBrains Mono\', monospace; font-size:0.88rem; padding:10px 12px;">',
  '<input type="number" step="${q.step}" id="${inputId}" data-placeholder="${q.placeholder}" placeholder="${inputPlaceholder}" oninput="saveDraft()" ${isUnlocked ? \'\' : \'disabled\'} aria-label="${cleanLabel}" inputmode="decimal" autocomplete="off" autocorrect="off" spellcheck="false" style="width:100%; font-family:\'JetBrains Mono\', monospace; font-size:1rem; min-height:44px; padding:10px 12px; touch-action:manipulation;">'
);

fs.writeFileSync(benchJsPath, benchJs, 'utf8');
console.log('titration-workbench.js updated successfully.');

// ─────────────────────────────────────────────────────────────
//  4. client/student/css/qualitative.css
// ─────────────────────────────────────────────────────────────
console.log('4. Updating qualitative.css touch targets & auto-zoom prevention...');
const qualCssPath = path.join(rootDir, 'client/student/css/qualitative.css');
let qualCss = fs.readFileSync(qualCssPath, 'utf8');

// Ensure .btn-perform-test and .btn-redo-test have min-height: 44px & touch-action: manipulation
qualCss = qualCss.replace(
  '.btn-perform-test {',
  `.btn-perform-test {
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;`
);

qualCss = qualCss.replace(
  '.btn-redo-test {',
  `.btn-redo-test {
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;`
);

qualCss = qualCss.replace(
  '.suggestion-chip {',
  `.suggestion-chip {
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;`
);

qualCss = qualCss.replace(
  '.btn-probe-chip {',
  `.btn-probe-chip {
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;`
);

// Append mobile keypad auto-zoom prevention & safe area insets to qualitative.css
const qualMobileAdditions = `
/* ── Mobile Ergonomics & Keypad Auto-Zoom Prevention ── */
@media (max-width: 768px) {
  .id-select, 
  .specimen-select,
  .knec-notes-input {
    font-size: 16px !important;
    min-height: 44px !important;
    touch-action: manipulation;
  }
  .btn-submit-id {
    min-height: 48px !important;
    touch-action: manipulation;
  }
  .specimen-station-card,
  .id-panel {
    padding-left: max(14px, env(safe-area-inset-left, 0px));
    padding-right: max(14px, env(safe-area-inset-right, 0px));
  }
}
`;

if (!qualCss.includes('Mobile Ergonomics & Keypad Auto-Zoom Prevention')) {
  qualCss += '\n' + qualMobileAdditions;
}

fs.writeFileSync(qualCssPath, qualCss, 'utf8');
console.log('qualitative.css updated successfully.');

// ─────────────────────────────────────────────────────────────
//  5. client/student/js/qualitative-engine.js
// ─────────────────────────────────────────────────────────────
console.log('5. Updating qualitative-engine.js (Haptic Integration)...');
const qualJsPath = path.join(rootDir, 'client/student/js/qualitative-engine.js');
let qualJs = fs.readFileSync(qualJsPath, 'utf8');

const qualHapticHelper = `
  function triggerQualHaptic(pattern = 15) {
    if (typeof window !== 'undefined' && window.BrilliantUI && typeof window.BrilliantUI.vibrate === 'function') {
      try { window.BrilliantUI.vibrate(pattern); } catch(e) {}
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch(e) {}
    }
  }
  window.triggerQualHaptic = triggerQualHaptic;
`;

if (!qualJs.includes('triggerQualHaptic(')) {
  qualJs = qualJs.replace('(function() {', '(function() {\n' + qualHapticHelper);
}

// Wire haptic in performTestStage
qualJs = qualJs.replace(
  'window.performTestStage = function(testKey, targetStage, probeOption = null) {',
  `window.performTestStage = function(testKey, targetStage, probeOption = null) {
    triggerQualHaptic(15);`
);

// Wire haptic in redoTest
qualJs = qualJs.replace(
  'window.redoTest = function(testKey) {',
  `window.redoTest = function(testKey) {
    triggerQualHaptic(20);`
);

// Wire haptic in submitIdentification
qualJs = qualJs.replace(
  'window.submitIdentification = function() {',
  `window.submitIdentification = function() {
    triggerQualHaptic([30, 40, 50]);`
);

fs.writeFileSync(qualJsPath, qualJs, 'utf8');
console.log('qualitative-engine.js updated successfully.');

// ─────────────────────────────────────────────────────────────
//  6. client/student/css/mobile.css
// ─────────────────────────────────────────────────────────────
console.log('6. Updating client/student/css/mobile.css...');
const mobileCssPath = path.join(rootDir, 'client/student/css/mobile.css');
let mobileCss = fs.readFileSync(mobileCssPath, 'utf8');

const labErgonomicsSection = `
/* ── O. Practical Workbench Tactile Touch & Input Ergonomics ─ */
@media (max-width: 768px) {
  /* Enforce >= 44px touch targets across titration and bench controls */
  .btn-tactile,
  .btn-pill-action,
  .btn-action-swirl,
  .btn-action-record,
  .btn-action-reset,
  .btn-action-halfdrop,
  .btn-perform-test,
  .btn-redo-test,
  .btn-probe-chip,
  .suggestion-chip,
  .parallax-btn,
  .speed-btn-chip,
  .rate-btn,
  .sol-btn,
  .sol-mini-btn {
    min-height: 44px !important;
    touch-action: manipulation !important;
  }

  /* Prevent involuntary auto-zoom on mobile keypad appearance (font-size >= 16px) */
  .calc-input,
  .wb-select,
  .id-select,
  .sol-select,
  .results-table input,
  .kcse-table input {
    font-size: 16px !important;
    min-height: 44px !important;
    touch-action: manipulation !important;
  }

  /* Safe-area insets padding for notched devices */
  .academic-top-header,
  .top-navbar {
    padding-top: max(8px, env(safe-area-inset-top, 0px)) !important;
  }
}
`;

if (!mobileCss.includes('Practical Workbench Tactile Touch & Input Ergonomics')) {
  mobileCss += '\n' + labErgonomicsSection;
  fs.writeFileSync(mobileCssPath, mobileCss, 'utf8');
  console.log('mobile.css updated successfully.');
}

console.log('✅ Mobile Tactile Touch & Responsive Ergonomics Audit applied successfully!');

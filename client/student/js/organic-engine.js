/**
 * VirtuLab Kenya — Organic Chemistry Qualitative Engine
 * Implements KNEC Paper 3 Organic Qualitative Analysis
 * Perfectly mirrors Qualitative Salt Analysis Workbench design & architecture
 */

(() => {
  'use strict';

  requireStudentLogin();
  updateThemeButtons();

  /* ══════════════════════════════════════
     SAMPLES REGISTRY & TEST DEFINITIONS
  ══════════════════════════════════════ */
  /* ══════════════════════════════════════
     SAMPLES REGISTRY & TEST DEFINITIONS
     Exact KNEC KCSE Paper 3 Standard Rubric
  ══════════════════════════════════════ */
  const SAMPLES = {
    'org_alkene': {
      key: 'org_alkene',
      label: 'Sample A (Liquid)',
      name: 'Hex-1-ene (C₆H₁₂)',
      compoundKey: 'hexene',
      fgKey: 'alkene',
      fgName: 'Alkene (C=C unsaturation)',
      solubility: {
        obs: 'Immiscible. Forms two distinct liquid layers.',
        inf: 'Non-polar hydrocarbon present',
        status: 'Immiscible (2 Separate Layers)'
      },
      ignition: {
        obs: 'Burns with a yellow smoky sooty flame.',
        inf: 'High C:H ratio or unsaturation present',
        status: 'Luminous Yellow Sooty Flame (Black Smoke)'
      },
      bromine: {
        obs: 'Bromine water is decolourized immediately.',
        inf: '-C=C- or -C≡C- unsaturation present',
        status: 'Bromine Decolourized (Turns Colourless)'
      },
      dichromate: {
        obs: 'Acidified potassium dichromate(VI) remains orange.',
        inf: 'Alkanol absent',
        status: 'Orange Colour Persists (No change)'
      },
      carbonate: {
        obs: 'No effervescence observed.',
        inf: 'Carboxylic acid absent',
        status: 'No Effervescence (Solid settles)'
      },
      esterification: {
        obs: 'Pungent acid smell persists.',
        inf: 'Alkanol absent',
        status: 'Pungent Acid Smell (No sweet ester)'
      },
      litmus: {
        obs: 'Litmus papers remain unchanged.',
        inf: 'Neutral organic compound',
        status: 'Neutral (No Litmus Colour Change, pH 7)'
      }
    },
    'org_alcohol': {
      key: 'org_alcohol',
      label: 'Sample B (Liquid)',
      name: 'Ethanol (C₂H₅OH)',
      compoundKey: 'ethanol',
      fgKey: 'alkanol',
      fgName: 'Primary Alkanol (R-OH)',
      solubility: {
        obs: 'Miscible. Dissolves completely in water.',
        inf: 'Polar organic compound present',
        status: 'Miscible (Single Clear Layer)'
      },
      ignition: {
        obs: 'Burns with a clear blue non-sooty flame.',
        inf: 'Saturated organic compound present',
        status: 'Non-Luminous Clear Blue Flame'
      },
      bromine: {
        obs: 'Bromine water remains reddish-brown.',
        inf: 'Saturated compound with no unsaturation',
        status: 'Red-Brown Colour Persists'
      },
      dichromate: {
        obs: 'Acidified potassium dichromate(VI) turns green.',
        inf: 'Primary or secondary alkanol present',
        status: 'Turns Emerald Green (Cr³⁺ reduced)'
      },
      carbonate: {
        obs: 'No effervescence observed.',
        inf: 'Carboxylic acid absent',
        status: 'No Effervescence'
      },
      esterification: {
        obs: 'Sweet pleasant fruity aroma produced.',
        inf: 'Alkanol (R-OH) present',
        status: 'Pleasant Sweet Fruity Aroma (Ester)'
      },
      litmus: {
        obs: 'Litmus papers remain unchanged.',
        inf: 'Neutral organic compound',
        status: 'Neutral (No Litmus Colour Change, pH 7)'
      }
    },
    'org_acid': {
      key: 'org_acid',
      label: 'Sample C (Liquid)',
      name: 'Ethanoic Acid (CH₃COOH)',
      compoundKey: 'ethanoic_acid',
      fgKey: 'alkanoic_acid',
      fgName: 'Alkanoic Acid (R-COOH)',
      solubility: {
        obs: 'Miscible. Dissolves completely in water.',
        inf: 'Polar carboxylic acid present',
        status: 'Miscible (Single Clear Layer)'
      },
      ignition: {
        obs: 'Burns with a clear blue non-sooty flame.',
        inf: 'Saturated organic compound present',
        status: 'Non-Luminous Clear Blue Flame'
      },
      bromine: {
        obs: 'Bromine water remains reddish-brown.',
        inf: 'Saturated compound with no unsaturation',
        status: 'Red-Brown Colour Persists'
      },
      dichromate: {
        obs: 'Acidified potassium dichromate(VI) remains orange.',
        inf: 'Alkanol absent',
        status: 'Orange Colour Persists'
      },
      carbonate: {
        obs: 'Effervescence of colourless gas that turns limewater milky.',
        inf: 'Carboxylic acid (R-COOH) present',
        status: 'Rapid Effervescence of CO₂ Gas'
      },
      esterification: {
        obs: 'Pungent vinegar smell persists.',
        inf: 'Alkanol absent',
        status: 'Pungent Vinegar Smell (No sweet ester)'
      },
      litmus: {
        obs: 'Blue litmus paper turns red.',
        inf: 'Carboxylic acid (R-COOH) present',
        status: 'Acidic (Moist Blue Litmus Turns Red, pH 3)'
      }
    },
    'org_alkane': {
      key: 'org_alkane',
      label: 'Sample D (Liquid)',
      name: 'Hexane (C₆H₁₄)',
      compoundKey: 'hexane',
      fgKey: 'alkane',
      fgName: 'Alkane (Saturated C-C)',
      solubility: {
        obs: 'Immiscible. Forms two distinct liquid layers.',
        inf: 'Non-polar hydrocarbon present',
        status: 'Immiscible (2 Separate Layers)'
      },
      ignition: {
        obs: 'Burns with a clear blue non-sooty flame.',
        inf: 'Saturated organic compound present',
        status: 'Non-Luminous Clear Blue Flame'
      },
      bromine: {
        obs: 'Bromine water remains reddish-brown.',
        inf: 'Saturated compound with no unsaturation',
        status: 'Red-Brown Colour Persists'
      },
      dichromate: {
        obs: 'Acidified potassium dichromate(VI) remains orange.',
        inf: 'Alkanol absent',
        status: 'Orange Colour Persists'
      },
      carbonate: {
        obs: 'No effervescence observed.',
        inf: 'Carboxylic acid absent',
        status: 'No Effervescence'
      },
      esterification: {
        obs: 'Pungent acid smell persists.',
        inf: 'Alkanol absent',
        status: 'Pungent Acid Smell (No sweet ester)'
      },
      litmus: {
        obs: 'Litmus papers remain unchanged.',
        inf: 'Neutral organic compound',
        status: 'Neutral (No Litmus Colour Change, pH 7)'
      }
    }
  };

  const TESTS = [
    {
      key: 'solubility',
      label: 'Solubility & Miscibility in Distilled Water',
      procedure: 'To 2 cm³ of the sample in a clean dry test tube, add 2 cm³ of distilled water and shake the mixture thoroughly.',
      actionLabel: '💧 Add Distilled Water & Shake',
      marks: '1.4 Marks'
    },
    {
      key: 'ignition',
      label: 'Ignition & Combustion on Metallic Spatula',
      procedure: 'Place 2-3 drops of the sample on a clean metallic spatula and ignite directly in a non-luminous Bunsen burner flame.',
      actionLabel: '🔥 Ignite Sample on Spatula',
      marks: '1.4 Marks'
    },
    {
      key: 'bromine',
      label: 'Acidified Bromine Water Test (Br₂/H₂O)',
      procedure: 'To 2 cm³ of the sample in a test tube, add 3-4 drops of acidified bromine water and warm gently.',
      actionLabel: '🧪 Add Bromine Water',
      marks: '1.4 Marks'
    },
    {
      key: 'dichromate',
      label: 'Acidified Potassium Dichromate(VI) Oxidation',
      procedure: 'To 2 cm³ of the sample, add 1 cm³ of acidified potassium dichromate(VI) (K₂Cr₂O₇/H₂SO₄) and heat in a boiling water bath for 2 minutes.',
      actionLabel: '🌡️ Add K₂Cr₂O₇ & Warm',
      marks: '1.4 Marks'
    },
    {
      key: 'carbonate',
      label: 'Solid Sodium Carbonate / Hydrogen Carbonate',
      procedure: 'To 2 cm³ of the sample solution, add a half-spatula of solid sodium carbonate (Na₂CO₃) powder.',
      actionLabel: '🥄 Add Solid Na₂CO₃',
      marks: '1.4 Marks'
    },
    {
      key: 'esterification',
      label: 'Esterification Aroma Reaction',
      procedure: 'To 2 cm³ of the sample, add 2 cm³ of ethanoic acid and 3 drops of concentrated H₂SO₄. Warm in a water bath, then pour the mixture into a beaker containing water and note the odor.',
      actionLabel: '🍬 Warm in Water Bath & Smell',
      marks: '1.4 Marks'
    },
    {
      key: 'litmus',
      label: 'Litmus Paper & Universal pH Testing',
      procedure: 'Dip moist blue and red litmus paper strips into the sample solution and record the color changes.',
      actionLabel: '📄 Dip Litmus Strips',
      marks: '1.4 Marks'
    }
  ];

  /* ══════════════════════════════════════
     STATE
  ══════════════════════════════════════ */
  let currentSampleKey = 'org_alcohol';
  let testStates = {};
  let examSeconds = 2700;
  let timerInterval = null;
  let timerRunning = false;

  /* Audio Synthesizer */
  function playAudioTone(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'clink') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'flame') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'drip') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'bubble') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {}
  }

  /* ══════════════════════════════════════
     SUGGESTION VOCABULARY CHIPS
     Exact KNEC Marking Language
  ══════════════════════════════════════ */
  function getObsSuggestionChips(testKey) {
    const suggestions = {
      solubility: [
        'Miscible. Dissolves completely in water',
        'Immiscible. Forms two distinct liquid layers'
      ],
      ignition: [
        'Burns with a yellow smoky sooty flame',
        'Burns with a clear blue non-sooty flame'
      ],
      bromine: [
        'Bromine water is decolourized immediately',
        'Bromine water remains reddish-brown'
      ],
      dichromate: [
        'Acidified potassium dichromate(VI) turns green',
        'Acidified potassium dichromate(VI) remains orange'
      ],
      carbonate: [
        'Effervescence of colourless gas that turns limewater milky',
        'No effervescence observed'
      ],
      esterification: [
        'Sweet pleasant fruity aroma produced',
        'Pungent acid smell persists'
      ],
      litmus: [
        'Blue litmus paper turns red',
        'Litmus papers remain unchanged'
      ]
    };
    const chips = suggestions[testKey] || [];
    return chips.map(c => `
      <button type="button" class="suggestion-chip" onclick="insertSuggestion('obs_${testKey}', '${c.replace(/'/g, "\\'")}')">+ ${c}</button>
    `).join('');
  }

  function getInfSuggestionChips(testKey) {
    const suggestions = {
      solubility: [
        'Polar organic compound present',
        'Non-polar hydrocarbon present'
      ],
      ignition: [
        'High C:H ratio compound present',
        'Saturated organic compound present'
      ],
      bromine: [
        '-C=C- or -C≡C- unsaturation present',
        'Saturated compound with no unsaturation'
      ],
      dichromate: [
        'Primary or secondary alkanol present',
        'Alkanol absent'
      ],
      carbonate: [
        'Carboxylic acid (R-COOH) present',
        'Carboxylic acid absent'
      ],
      esterification: [
        'Alkanol (R-OH) present',
        'Alkanol absent'
      ],
      litmus: [
        'Carboxylic acid (R-COOH) present',
        'Neutral organic compound'
      ]
    };
    const chips = suggestions[testKey] || [];
    return chips.map(c => `
      <button type="button" class="suggestion-chip" onclick="insertSuggestion('inf_${testKey}', '${c.replace(/'/g, "\\'")}')">+ ${c}</button>
    `).join('');
  }

  window.insertSuggestion = function(elemId, text) {
    const elem = document.getElementById(elemId);
    if (elem) {
      elem.value = text;
      const parts = elemId.split('_');
      const testKey = parts[1];
      saveTextState(testKey);
    }
  };

  function saveTextState(testKey) {
    const obsElem = document.getElementById(`obs_${testKey}`);
    const infElem = document.getElementById(`inf_${testKey}`);
    if (!testStates[testKey]) testStates[testKey] = { performed: true };
    if (obsElem) testStates[testKey].obsText = obsElem.value;
    if (infElem) testStates[testKey].infText = infElem.value;
    updateProgress();
  }
  window.saveTextState = saveTextState;

  function updateProgress() {
    const totalTests = TESTS.length;
    const performedCount = Object.keys(testStates).filter(k => testStates[k].performed).length;
    const filledCount = Object.keys(testStates).filter(k => (testStates[k].obsText || '').trim() && (testStates[k].infText || '').trim()).length;
    const pct = Math.round((performedCount / totalTests) * 100);

    const fill = document.getElementById('progressFill');
    const txt = document.getElementById('progressCount');
    if (fill) fill.style.width = `${pct}%`;
    if (txt) txt.textContent = `${performedCount} / ${totalTests} Tests Performed (${filledCount} Recorded)`;
  }

  /* ══════════════════════════════════════
     DYNAMIC REAL-TIME REALISTIC SVG VISUALIZERS
  ══════════════════════════════════════ */
  function getGlassDefs(id) {
    return `
      <defs>
        <!-- Cylindrical Pyrex Glass Refractive Gradient -->
        <linearGradient id="pyrexGlass_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.35"/>
          <stop offset="12%" stop-color="#FFFFFF" stop-opacity="0.6"/>
          <stop offset="28%" stop-color="#FFFFFF" stop-opacity="0.18"/>
          <stop offset="72%" stop-color="#38BDF8" stop-opacity="0.06"/>
          <stop offset="88%" stop-color="#FFFFFF" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#0284C7" stop-opacity="0.4"/>
        </linearGradient>

        <!-- Glass Rim Lip Gradient -->
        <linearGradient id="rimGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284C7" stop-opacity="0.6"/>
          <stop offset="18%" stop-color="#FFFFFF" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#38BDF8" stop-opacity="0.3"/>
          <stop offset="85%" stop-color="#FFFFFF" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#0284C7" stop-opacity="0.6"/>
        </linearGradient>

        <!-- Laboratory Wood Clamp -->
        <linearGradient id="woodClamp_${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#A16207"/>
          <stop offset="35%" stop-color="#CA8A04"/>
          <stop offset="70%" stop-color="#854D0E"/>
          <stop offset="100%" stop-color="#713F12"/>
        </linearGradient>

        <!-- Brass Screw -->
        <linearGradient id="brassScrew_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF08A"/>
          <stop offset="50%" stop-color="#EAB308"/>
          <stop offset="100%" stop-color="#78350F"/>
        </linearGradient>

        <!-- Precision Dropper Bulb -->
        <linearGradient id="dropperTeat_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#DC2626"/>
          <stop offset="35%" stop-color="#F87171"/>
          <stop offset="70%" stop-color="#EF4444"/>
          <stop offset="100%" stop-color="#991B1B"/>
        </linearGradient>

        <!-- Metallic Spatula -->
        <linearGradient id="spatulaMetal_${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC"/>
          <stop offset="30%" stop-color="#CBD5E1"/>
          <stop offset="70%" stop-color="#64748B"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>

        <!-- Bunsen Burner Metal Barrel -->
        <linearGradient id="burnerBarrel_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="25%" stop-color="#94A3B8"/>
          <stop offset="60%" stop-color="#CBD5E1"/>
          <stop offset="85%" stop-color="#64748B"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>

        <!-- Clear Non-Luminous Blue Flame (Alcohols, Alkanes, Carboxylic Acids) -->
        <linearGradient id="clearBlueFlame_outer_${id}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#1E40AF" stop-opacity="0.95"/>
          <stop offset="30%" stop-color="#2563EB" stop-opacity="0.95"/>
          <stop offset="65%" stop-color="#0284C7" stop-opacity="0.92"/>
          <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.88"/>
        </linearGradient>
        <linearGradient id="clearBlueFlame_inner_${id}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.98"/>
          <stop offset="55%" stop-color="#BAE6FD" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.98"/>
        </linearGradient>

        <!-- Luminous Sooty Yellow-Orange Flame (Unsaturated Alkenes / Alkynes) -->
        <linearGradient id="sootyYellowFlame_outer_${id}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#C2410C" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="#EA580C" stop-opacity="0.95"/>
          <stop offset="75%" stop-color="#F59E0B" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#FDE047" stop-opacity="0.92"/>
        </linearGradient>
        <linearGradient id="sootyYellowFlame_inner_${id}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.98"/>
          <stop offset="60%" stop-color="#FEF08A" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#FFFBEB" stop-opacity="0.98"/>
        </linearGradient>

        <!-- Liquid Highlights -->
        <linearGradient id="liquidSheen_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45"/>
          <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.1"/>
          <stop offset="80%" stop-color="#FFFFFF" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
    `;
  }

  function getOrganicVisual(test, st) {
    const performed = st && st.performed;
    const sample = SAMPLES[currentSampleKey] || SAMPLES['org_alcohol'];
    const testKey = test.key;
    const defs = getGlassDefs(testKey);

    // 1. SOLUBILITY & MISCIBILITY TEST
    if (testKey === 'solubility') {
      const isMiscible = sample.fgKey === 'alkanol' || sample.fgKey === 'alkanoic_acid';
      const waterColor = isMiscible ? 'rgba(56, 189, 248, 0.45)' : 'rgba(56, 189, 248, 0.35)';

      const liquidHtml = performed ? (isMiscible ? `
        <!-- Single Homogeneous Layer -->
        <path d="M 33,68 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,68 Z" fill="${waterColor}"/>
        <path d="M 33,68 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,68 Z" fill="url(#liquidSheen_${testKey})"/>
        <ellipse cx="50" cy="68" rx="17" ry="3.5" fill="rgba(56, 189, 248, 0.7)"/>
        <path d="M 33,68 Q 50,71 67,68" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>
      ` : `
        <!-- Lower Aqueous Layer -->
        <path d="M 33,96 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,96 Z" fill="rgba(56, 189, 248, 0.4)"/>
        <path d="M 33,96 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,96 Z" fill="url(#liquidSheen_${testKey})"/>
        <!-- Interface Boundary Meniscus -->
        <ellipse cx="50" cy="96" rx="17" ry="3.2" fill="rgba(56, 189, 248, 0.6)"/>
        <path d="M 33,96 Q 50,99 67,96" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.4"/>

        <!-- Upper Immiscible Hydrocarbon Layer -->
        <path d="M 33,68 L 33,96 L 67,96 L 67,68 Z" fill="rgba(245, 158, 11, 0.45)"/>
        <ellipse cx="50" cy="68" rx="17" ry="3.5" fill="rgba(245, 158, 11, 0.65)"/>
        <path d="M 33,68 Q 50,71 67,68" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>
      `) : `
        <!-- Unmixed Sample in Base -->
        <path d="M 33,92 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,92 Z" fill="rgba(56, 189, 248, 0.25)"/>
        <ellipse cx="50" cy="92" rx="17" ry="3.5" fill="rgba(56, 189, 248, 0.4)"/>
      `;

      return `<svg width="100" height="150" viewBox="0 0 100 150">
        ${defs}
        <!-- Test Tube Clamp -->
        <g transform="translate(0, 0)">
          <rect x="4" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <rect x="68" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="54" r="2.8" fill="url(#brassScrew_${testKey})"/>
          <circle cx="86" cy="54" r="2.8" fill="url(#brassScrew_${testKey})"/>
        </g>

        <!-- Glass Test Tube Body -->
        <path d="M 32,26 L 32,118 C 32,134 40,140 50,140 C 60,140 68,134 68,118 L 68,26 Z" fill="url(#pyrexGlass_${testKey})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="50" cy="25" rx="19" ry="3.5" fill="url(#rimGrad_${testKey})" stroke="#38BDF8" stroke-width="0.8"/>
        <ellipse cx="50" cy="25" rx="16.5" ry="2.6" fill="rgba(15,23,42,0.3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.6"/>

        <!-- Liquid Phase(s) -->
        ${liquidHtml}

        <!-- Volumetric Scale Lines -->
        <g opacity="0.35" stroke="#FFFFFF" stroke-width="0.75">
          <line x1="64" y1="58" x2="59" y2="58"/>
          <line x1="64" y1="80" x2="56" y2="80"/>
          <line x1="64" y1="102" x2="59" y2="102"/>
        </g>

        <!-- Specular Highlights -->
        <path d="M 35,30 L 35,116 C 35,128 40,135 48,137" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>
        <line x1="65" y1="32" x2="65" y2="112" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>

        <!-- Water Dropper Pipette -->
        <g style="transition: transform 0.6s ease; transform: translate(0px, ${performed ? '4px' : '0px'});">
          <ellipse cx="50" cy="6" rx="6.5" ry="5" fill="url(#dropperTeat_${testKey})"/>
          <rect x="48.5" y="10" width="3" height="14" fill="rgba(255,255,255,0.7)" stroke="#38BDF8" stroke-width="0.6"/>
          <path d="M 48.5,24 L 51.5,24 L 50.8,30 L 49.2,30 Z" fill="rgba(255,255,255,0.85)" stroke="#38BDF8" stroke-width="0.6"/>
          ${!performed ? '<ellipse cx="50" cy="38" rx="2.2" ry="3.2" fill="#38BDF8" class="anim-droplet"/>' : ''}
        </g>
        <text x="50" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Water Immersion</text>
      </svg>`;
    }

    // 2. IGNITION & SPATULA COMBUSTION TEST
    if (testKey === 'ignition') {
      const isSooty = sample.fgKey === 'alkene' || sample.fgKey === 'alkyne' || sample.fgKey === 'arene';
      const isLuminous = isSooty;

      const flameOuterFill = isLuminous ? `url(#sootyYellowFlame_outer_${testKey})` : `url(#clearBlueFlame_outer_${testKey})`;
      const flameCoreFill = isLuminous ? `url(#sootyYellowFlame_inner_${testKey})` : `url(#clearBlueFlame_inner_${testKey})`;

      const sootParticles = performed && isSooty ? `
        <g class="anim-soot">
          <circle cx="52" cy="18" r="3.2" fill="#0F172A" opacity="0.9"/>
          <circle cx="58" cy="10" r="4.2" fill="#1E293B" opacity="0.8"/>
          <circle cx="48" cy="2" r="5.5" fill="#020617" opacity="0.7"/>
          <circle cx="56" cy="-8" r="7.0" fill="#000000" opacity="0.5"/>
        </g>
      ` : '';

      const spatulaCombustion = performed ? (isLuminous ? `
        <ellipse cx="44" cy="55" rx="3.5" ry="2.2" fill="#F59E0B" opacity="0.95"/>
        <path d="M 44,46 C 41,50 42,55 44,55 C 46,55 47,50 44,46 Z" fill="url(#sootyYellowFlame_outer_${testKey})" class="anim-flame" style="transform-origin: 44px 55px;"/>
      ` : `
        <ellipse cx="44" cy="55" rx="3.5" ry="2.2" fill="#2563EB" opacity="0.95"/>
        <path d="M 44,46 C 41,50 42,55 44,55 C 46,55 47,50 44,46 Z" fill="url(#clearBlueFlame_outer_${testKey})" class="anim-flame" style="transform-origin: 44px 55px;"/>
      `) : `
        <circle cx="44" cy="55" r="2.2" fill="#38BDF8" opacity="0.9"/>
      `;

      return `<svg width="105" height="150" viewBox="0 0 105 150">
        ${defs}
        <!-- Bunsen Burner Base & Barrel Assembly -->
        <rect x="36" y="122" width="34" height="14" rx="3" fill="#334155" stroke="#1E293B" stroke-width="1"/>
        <rect x="49" y="80" width="8" height="42" fill="url(#burnerBarrel_${testKey})" stroke="#334155" stroke-width="0.8"/>
        <!-- Air Collar & Gas Tube -->
        <circle cx="53" cy="116" r="3" fill="#0F172A"/>
        <path d="M 57,126 Q 78,126 84,136" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Fast-Burning Dual-Zone Bunsen Flame -->
        <g class="anim-flame" style="transform-origin: 53px 80px;">
          <!-- Outer Flame Mantle -->
          <path d="M 53,24 C 36,40 40,78 53,78 C 66,78 70,40 53,24 Z" fill="${flameOuterFill}"/>
          <!-- Inner Core Cone -->
          <path d="M 53,46 C 45,56 47,78 53,78 C 59,78 61,56 53,46 Z" fill="${flameCoreFill}" class="anim-flame-inner" style="transform-origin: 53px 78px;"/>
        </g>
        ${sootParticles}

        <!-- Stainless Steel Spatula with Organic Sample -->
        <g style="transition: transform 0.8s ease; transform: translate(${performed ? '12px, 0px' : '-6px, 0px'});">
          <line x1="2" y1="56" x2="44" y2="56" stroke="url(#spatulaMetal_${testKey})" stroke-width="3.2" stroke-linecap="round"/>
          <ellipse cx="44" cy="56" rx="6.5" ry="3.2" fill="url(#spatulaMetal_${testKey})" stroke="#475569" stroke-width="0.6"/>
          ${spatulaCombustion}
        </g>
        <text x="53" y="146" font-size="8.5" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Spatula Ignition</text>
      </svg>`;
    }

    // 3. BROMINE WATER TEST (Br₂/H₂O)
    if (testKey === 'bromine') {
      const isDecolourized = sample.fgKey === 'alkene' || sample.fgKey === 'alkyne';
      const liquidColor = performed ? (isDecolourized ? 'rgba(224, 242, 254, 0.3)' : 'rgba(220, 38, 38, 0.85)') : 'rgba(56, 189, 248, 0.35)';
      const meniscusColor = performed ? (isDecolourized ? 'rgba(224, 242, 254, 0.5)' : '#DC2626') : '#38BDF8';

      return `<svg width="100" height="150" viewBox="0 0 100 150">
        ${defs}
        <!-- Test Tube Clamp -->
        <g transform="translate(0, 0)">
          <rect x="4" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <rect x="68" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="54" r="2.8" fill="url(#brassScrew_${testKey})"/>
          <circle cx="86" cy="54" r="2.8" fill="url(#brassScrew_${testKey})"/>
        </g>

        <!-- Glass Tube Body -->
        <path d="M 32,26 L 32,118 C 32,134 40,140 50,140 C 60,140 68,134 68,118 L 68,26 Z" fill="url(#pyrexGlass_${testKey})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="50" cy="25" rx="19" ry="3.5" fill="url(#rimGrad_${testKey})" stroke="#38BDF8" stroke-width="0.8"/>
        <ellipse cx="50" cy="25" rx="16.5" ry="2.6" fill="rgba(15,23,42,0.3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.6"/>

        <!-- Bromine Liquid Column -->
        <path d="M 33,68 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,68 Z" fill="${liquidColor}"/>
        <path d="M 33,68 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,68 Z" fill="url(#liquidSheen_${testKey})"/>
        <ellipse cx="50" cy="68" rx="17" ry="3.5" fill="${meniscusColor}" opacity="0.85"/>
        <path d="M 33,68 Q 50,71 67,68" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>

        <!-- Volumetric Scale -->
        <g opacity="0.35" stroke="#FFFFFF" stroke-width="0.75">
          <line x1="64" y1="58" x2="59" y2="58"/>
          <line x1="64" y1="80" x2="56" y2="80"/>
          <line x1="64" y1="102" x2="59" y2="102"/>
        </g>

        <!-- Specular Glass Highlights -->
        <path d="M 35,30 L 35,116 C 35,128 40,135 48,137" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>
        <line x1="65" y1="32" x2="65" y2="112" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>

        <!-- Red Bromine Dropper Assembly -->
        <g style="transition: transform 0.6s ease; transform: translate(0px, ${performed ? '4px' : '0px'});">
          <ellipse cx="50" cy="6" rx="6.5" ry="5" fill="url(#dropperTeat_${testKey})"/>
          <rect x="48.5" y="10" width="3" height="14" fill="rgba(255,255,255,0.7)" stroke="#EA580C" stroke-width="0.6"/>
          <path d="M 48.5,24 L 51.5,24 L 50.8,30 L 49.2,30 Z" fill="#DC2626" stroke="#B91C1C" stroke-width="0.6"/>
          ${!performed ? '<ellipse cx="50" cy="38" rx="2.4" ry="3.5" fill="#DC2626" class="anim-droplet"/>' : ''}
        </g>
        <text x="50" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Bromine Tube</text>
      </svg>`;
    }

    // 4. ACIDIFIED POTASSIUM DICHROMATE(VI) OXIDATION
    if (testKey === 'dichromate') {
      const turnsGreen = sample.fgKey === 'alkanol';
      const liquidColor = performed ? (turnsGreen ? '#059669' : '#EA580C') : '#F59E0B';
      const meniscusColor = performed ? (turnsGreen ? '#10B981' : '#F97316') : '#FBBF24';

      const vapors = performed && turnsGreen ? `
        <g class="anim-vapor">
          <path d="M 44,20 Q 48,10 45,0" stroke="rgba(255,255,255,0.75)" stroke-width="1.8" fill="none"/>
          <path d="M 56,22 Q 60,12 57,2" stroke="rgba(255,255,255,0.75)" stroke-width="1.8" fill="none"/>
        </g>
      ` : '';

      return `<svg width="100" height="150" viewBox="0 0 100 150">
        ${defs}
        <!-- Test Tube Clamp -->
        <g transform="translate(0, 0)">
          <rect x="4" y="48" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <rect x="68" y="48" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="52" r="2.8" fill="url(#brassScrew_${testKey})"/>
          <circle cx="86" cy="52" r="2.8" fill="url(#brassScrew_${testKey})"/>
        </g>

        <!-- Glass Tube Body -->
        <path d="M 32,24 L 32,112 C 32,126 40,132 50,132 C 60,132 68,126 68,112 L 68,24 Z" fill="url(#pyrexGlass_${testKey})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="50" cy="23" rx="19" ry="3.5" fill="url(#rimGrad_${testKey})" stroke="#38BDF8" stroke-width="0.8"/>
        <ellipse cx="50" cy="23" rx="16.5" ry="2.6" fill="rgba(15,23,42,0.3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.6"/>

        <!-- Dichromate Liquid Column -->
        <path d="M 33,64 L 33,112 C 33,124 41,130 50,130 C 59,130 67,124 67,112 L 67,64 Z" fill="${liquidColor}"/>
        <path d="M 33,64 L 33,112 C 33,124 41,130 50,130 C 59,130 67,124 67,112 L 67,64 Z" fill="url(#liquidSheen_${testKey})"/>
        <ellipse cx="50" cy="64" rx="17" ry="3.5" fill="${meniscusColor}" opacity="0.9"/>
        <path d="M 33,64 Q 50,67 67,64" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>
        ${vapors}

        <!-- Specular Highlights -->
        <path d="M 35,28 L 35,110 C 35,122 40,128 48,130" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>
        <line x1="65" y1="30" x2="65" y2="108" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>

        <!-- Heating Bunsen Base & Gentle Fast Warming Blue Flame -->
        <path d="M 50,132 C 44,138 46,148 50,148 C 54,148 56,138 50,132 Z" fill="url(#clearBlueFlame_outer_${testKey})" class="anim-flame" style="transform-origin: 50px 148px;"/>
        <path d="M 50,138 C 47,142 48,148 50,148 C 52,148 53,142 50,138 Z" fill="url(#clearBlueFlame_inner_${testKey})" class="anim-flame-inner" style="transform-origin: 50px 148px;"/>
        <text x="50" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted)" text-anchor="middle">K₂Cr₂O₇ / Heat</text>
      </svg>`;
    }

    // 5. SOLID SODIUM CARBONATE EFFERVESCENCE TEST (Na₂CO₃)
    if (testKey === 'carbonate') {
      const hasEffervescence = sample.fgKey === 'alkanoic_acid';

      const bubbles = performed && hasEffervescence ? `
        <g class="anim-bubble">
          <circle cx="42" cy="112" r="2.2" fill="#FFFFFF" opacity="0.9"/>
          <circle cx="52" cy="100" r="2.8" fill="#FFFFFF" opacity="0.95"/>
          <circle cx="46" cy="88" r="2.4" fill="#FFFFFF" opacity="0.9"/>
          <circle cx="56" cy="78" r="2.6" fill="#FFFFFF" opacity="0.85"/>
          <circle cx="39" cy="74" r="2.0" fill="#FFFFFF" opacity="0.8"/>
        </g>
        <!-- Frothy Surface Foam Layer -->
        <ellipse cx="50" cy="67" rx="17" ry="4" fill="rgba(255,255,255,0.92)" class="anim-froth"/>
        <circle cx="44" cy="65" r="1.8" fill="#FFFFFF"/>
        <circle cx="54" cy="65" r="2.2" fill="#FFFFFF"/>
      ` : '';

      return `<svg width="100" height="150" viewBox="0 0 100 150">
        ${defs}
        <!-- Test Tube Clamp -->
        <g transform="translate(0, 0)">
          <rect x="4" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <rect x="68" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="54" r="2.8" fill="url(#brassScrew_${testKey})"/>
          <circle cx="86" cy="54" r="2.8" fill="url(#brassScrew_${testKey})"/>
        </g>

        <!-- Glass Tube Body -->
        <path d="M 32,26 L 32,118 C 32,134 40,140 50,140 C 60,140 68,134 68,118 L 68,26 Z" fill="url(#pyrexGlass_${testKey})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="50" cy="25" rx="19" ry="3.5" fill="url(#rimGrad_${testKey})" stroke="#38BDF8" stroke-width="0.8"/>
        <ellipse cx="50" cy="25" rx="16.5" ry="2.6" fill="rgba(15,23,42,0.3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.6"/>

        <!-- Sample Liquid Column -->
        <path d="M 33,68 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,68 Z" fill="rgba(56, 189, 248, 0.35)"/>
        <path d="M 33,68 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,68 Z" fill="url(#liquidSheen_${testKey})"/>
        <ellipse cx="50" cy="68" rx="17" ry="3.5" fill="rgba(56, 189, 248, 0.6)"/>
        <path d="M 33,68 Q 50,71 67,68" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>

        <!-- White Solid Na2CO3 Sediment at Base -->
        ${performed ? `
          <ellipse cx="50" cy="134" rx="14" ry="5" fill="#FFFFFF" opacity="0.95"/>
          <circle cx="43" cy="131" r="2.5" fill="#F8FAFC"/>
          <circle cx="56" cy="132" r="2.8" fill="#F8FAFC"/>
        ` : ''}

        ${bubbles}

        <!-- Specular Highlights -->
        <path d="M 35,30 L 35,116 C 35,128 40,135 48,137" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>
        <line x1="65" y1="32" x2="65" y2="112" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>

        <!-- Spatula Delivering Powder -->
        <g style="transition: transform 0.6s ease; transform: translate(${performed ? '4px, 4px' : '0px, 0px'});">
          <line x1="20" y1="18" x2="48" y2="18" stroke="url(#spatulaMetal_${testKey})" stroke-width="2.5"/>
          <ellipse cx="48" cy="18" rx="4" ry="2" fill="#94A3B8"/>
          <circle cx="48" cy="17" r="1.8" fill="#FFFFFF"/>
        </g>
        <text x="50" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Na₂CO₃ Effervescence</text>
      </svg>`;
    }

    // 6. ESTERIFICATION IN BEAKER WATER BATH
    if (testKey === 'esterification') {
      const isFruity = sample.fgKey === 'alkanol';
      const liquidColor = performed ? (isFruity ? 'rgba(192, 132, 252, 0.75)' : 'rgba(56, 189, 248, 0.45)') : 'rgba(56, 189, 248, 0.35)';

      const vapors = performed && isFruity ? `
        <g class="anim-vapor">
          <path d="M 44,22 Q 50,12 46,2" stroke="rgba(192, 132, 252, 0.85)" stroke-width="2" fill="none"/>
          <path d="M 56,24 Q 62,14 58,4" stroke="rgba(192, 132, 252, 0.85)" stroke-width="2" fill="none"/>
        </g>
      ` : '';

      return `<svg width="105" height="150" viewBox="0 0 105 150">
        ${defs}
        <!-- Pyrex Beaker (250 mL Water Bath) -->
        <path d="M 16,68 L 16,132 C 16,138 24,142 34,142 L 72,142 C 82,142 90,138 90,132 L 90,68" fill="none" stroke="#64748B" stroke-width="1.8"/>
        <!-- Beaker Spout -->
        <path d="M 12,68 L 16,70" stroke="#64748B" stroke-width="1.8"/>
        <!-- Beaker Water Level -->
        <path d="M 18,84 L 18,132 C 18,136 24,140 34,140 L 72,140 C 82,140 88,136 88,132 L 88,84 Z" fill="rgba(56, 189, 248, 0.22)"/>
        <ellipse cx="53" cy="84" rx="35" ry="5" fill="rgba(56, 189, 248, 0.35)"/>
        <!-- Beaker Scale -->
        <line x1="22" y1="95" x2="30" y2="95" stroke="#94A3B8" stroke-width="0.8"/>
        <line x1="22" y1="110" x2="28" y2="110" stroke="#94A3B8" stroke-width="0.8"/>
        <line x1="22" y1="125" x2="30" y2="125" stroke="#94A3B8" stroke-width="0.8"/>

        <!-- Boiling Tube inside Water Bath -->
        <path d="M 40,26 L 40,118 C 40,128 46,134 53,134 C 60,134 66,128 66,118 L 66,26 Z" fill="url(#pyrexGlass_${testKey})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="53" cy="25" rx="15" ry="3.2" fill="url(#rimGrad_${testKey})" stroke="#38BDF8" stroke-width="0.8"/>

        <!-- Tube Ester Reaction Mixture -->
        <path d="M 41,56 L 41,118 C 41,126 47,132 53,132 C 59,132 65,126 65,118 L 65,56 Z" fill="${liquidColor}"/>
        <ellipse cx="53" cy="56" rx="12" ry="3" fill="${liquidColor}" opacity="0.9"/>
        <path d="M 41,56 Q 53,59 65,56" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>
        ${vapors}

        <!-- Specular Highlight on Boiling Tube -->
        <path d="M 43,30 L 43,114 C 43,122 47,128 52,130" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity="0.65"/>
        <text x="53" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Water Bath Ester</text>
      </svg>`;
    }

    // 7. LITMUS PAPER & UNIVERSAL pH TESTING
    if (testKey === 'litmus') {
      const isAcidic = sample.fgKey === 'alkanoic_acid';
      const blueStripTop = '#3B82F6';
      const blueStripBottom = performed ? (isAcidic ? '#EF4444' : '#3B82F6') : '#3B82F6';
      const redStripColor = '#EF4444';
      const liquidColor = performed ? (isAcidic ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.45)') : 'rgba(56, 189, 248, 0.35)';

      return `<svg width="100" height="150" viewBox="0 0 100 150">
        ${defs}
        <!-- Test Tube Clamp -->
        <g transform="translate(0, 0)">
          <rect x="4" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <rect x="68" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${testKey})" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="54" r="2.8" fill="url(#brassScrew_${testKey})"/>
          <circle cx="86" cy="54" r="2.8" fill="url(#brassScrew_${testKey})"/>
        </g>

        <!-- Glass Tube Body -->
        <path d="M 32,26 L 32,118 C 32,134 40,140 50,140 C 60,140 68,134 68,118 L 68,26 Z" fill="url(#pyrexGlass_${testKey})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="50" cy="25" rx="19" ry="3.5" fill="url(#rimGrad_${testKey})" stroke="#38BDF8" stroke-width="0.8"/>
        <ellipse cx="50" cy="25" rx="16.5" ry="2.6" fill="rgba(15,23,42,0.3)" stroke="rgba(255,255,255,0.4)" stroke-width="0.6"/>

        <!-- Sample Liquid Column -->
        <path d="M 33,70 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,70 Z" fill="${liquidColor}"/>
        <ellipse cx="50" cy="70" rx="17" ry="3.5" fill="${liquidColor}" opacity="0.85"/>
        <path d="M 33,70 Q 50,73 67,70" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>

        <!-- Litmus Paper Strips Dipping into Fluid -->
        <g style="transition: transform 0.8s ease; transform: translate(0px, ${performed ? '18px' : '0px'});">
          <!-- Blue Litmus Strip -->
          <g transform="rotate(-4 43 50)">
            <rect x="40" y="10" width="7" height="60" rx="1" fill="${blueStripTop}"/>
            <rect x="40" y="52" width="7" height="18" rx="1" fill="${blueStripBottom}"/>
            <!-- Tide Line -->
            <line x1="39" y1="52" x2="48" y2="52" stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
          </g>

          <!-- Red Litmus Strip -->
          <g transform="rotate(4 57 50)">
            <rect x="54" y="10" width="7" height="60" rx="1" fill="${redStripColor}"/>
            <!-- Wet Tide Line -->
            <rect x="54" y="52" width="7" height="18" rx="1" fill="#DC2626"/>
            <line x1="53" y1="52" x2="62" y2="52" stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
          </g>
        </g>

        <!-- Specular Highlights -->
        <path d="M 35,30 L 35,116 C 35,128 40,135 48,137" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>
        <line x1="65" y1="32" x2="65" y2="112" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>
        <text x="50" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Litmus Strips</text>
      </svg>`;
    }

    return '';
  }

  /* ══════════════════════════════════════
     RENDER BENCH GRID
  ══════════════════════════════════════ */
  function renderGrid() {
    const grid = document.getElementById('testGrid');
    if (!grid) return;

    grid.innerHTML = TESTS.map((test, idx) => {
      const st = testStates[test.key] || { performed: false };
      const testLetter = String.fromCharCode(97 + idx); // a, b, c, d, e, f, g

      let actionButtonsHtml = '';
      if (!st.performed) {
        actionButtonsHtml = `
          <button class="btn-perform-test" onclick="performTest('${test.key}')">
            ${test.actionLabel}
          </button>`;
      } else {
        actionButtonsHtml = `
          <button class="btn-perform-test done" disabled>
            ✅ Test Completed — Result Observed
          </button>
          <button class="btn-redo-test" onclick="redoTest('${test.key}')" title="Clean test tube and redo test">
            <span class="redo-icon">↺</span> Redo Test
          </button>`;
      }

      return `
        <div class="kcse-question-block" id="block_${test.key}">
          <div class="test-card-top">
            <div class="test-header-left">
              <span class="test-step-badge">(${testLetter})</span>
              <h3 class="test-title-text">${test.label}</h3>
            </div>
            <span class="timer-chip" style="font-size:0.75rem; padding:2px 8px;">${test.marks}</span>
          </div>

          <div class="test-layout-grid">
            <!-- Left Column: Dynamic SVG Reaction Apparatus -->
            <div class="apparatus-stage">
              <div class="apparatus-view">
                ${getOrganicVisual(test, st)}
              </div>
              <div class="apparatus-status-tag" id="status_${test.key}">
                ${!st.performed ? 'Awaiting Reagent' : (st.statusLabel || 'Test Completed')}
              </div>
            </div>

            <!-- Right Column: Procedure & 2-Column KCSE Table -->
            <div>
              <!-- Official KCSE Procedure Callout -->
              <div style="font-size:0.84rem; color:var(--text-main); line-height:1.5; margin-bottom:12px; background:var(--bg-dark); padding:10px 14px; border-radius:8px; border-left:3px solid var(--violet-accent); border:1px solid var(--card-border); border-left-width:3px;">
                <span style="font-weight:800; color:var(--heading-color); display:flex; align-items:center; gap:6px; margin-bottom:3px;">
                  📋 Procedure / Instructions:
                </span>
                <span>${test.procedure}</span>
              </div>

              <!-- Action Button Row with Redo -->
              <div class="action-buttons-row">
                ${actionButtonsHtml}
              </div>

              <!-- KCSE Observation & Inference Table -->
              <table class="knec-table">
                <thead>
                  <tr>
                    <th style="width:50%;">
                      <span class="sci-tooltip">Observations <span class="sci-tip-text">Observations: Record clear sensory evidence — colour changes, sooty flame, effervescence, or fruity scent.</span></span> (0.7 Mark)
                    </th>
                    <th style="width:50%;">
                      <span class="sci-tooltip">Inferences <span class="sci-tip-text">Inferences: Deduce active functional groups (e.g. -C=C-, R-OH, R-COOH, Polar/Non-polar).</span></span> (0.7 Mark)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <textarea class="kcse-input" id="obs_${test.key}" placeholder="Write exact observations (e.g. Reddish-brown bromine water is decolourized)..." oninput="saveTextState('${test.key}')">${st.obsText || ''}</textarea>
                      <div class="suggestion-chips-container">
                        ${getObsSuggestionChips(test.key)}
                      </div>
                    </td>
                    <td>
                      <textarea class="kcse-input" id="inf_${test.key}" placeholder="Write deductions (e.g. -C=C- or -C≡C- present)..." oninput="saveTextState('${test.key}')">${st.infText || ''}</textarea>
                      <div class="suggestion-chips-container">
                        ${getInfSuggestionChips(test.key)}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ══════════════════════════════════════
     PERFORM & REDO ACTIONS
  ══════════════════════════════════════ */
  window.performTest = function(testKey) {
    const sample = SAMPLES[currentSampleKey] || SAMPLES['org_alcohol'];
    const expected = sample[testKey];
    if (!expected) return;

    if (testKey === 'ignition') playAudioTone('flame');
    else if (testKey === 'carbonate') playAudioTone('bubble');
    else if (testKey === 'bromine' || testKey === 'dichromate') playAudioTone('drip');
    else playAudioTone('clink');

    testStates[testKey] = {
      performed: true,
      statusLabel: expected.status || 'Test Completed',
      obsText: (testStates[testKey] && testStates[testKey].obsText) || '',
      infText: (testStates[testKey] && testStates[testKey].infText) || ''
    };

    renderGrid();
    updateProgress();
  };

  window.redoTest = function(testKey) {
    playAudioTone('clink');
    if (testStates[testKey]) {
      testStates[testKey].performed = false;
      testStates[testKey].statusLabel = 'Awaiting Test';
    }
    renderGrid();
    updateProgress();
  };

  /* ══════════════════════════════════════
     IDENTIFICATION & SUBMISSION
  ══════════════════════════════════════ */
  window.newSample = function() {
    const keys = Object.keys(SAMPLES);
    const otherKeys = keys.filter(k => k !== currentSampleKey);
    currentSampleKey = otherKeys[Math.floor(Math.random() * otherKeys.length)] || keys[0];

    const sample = SAMPLES[currentSampleKey];
    const badge = document.getElementById('sampleIdBadge');
    if (badge) badge.textContent = `Sample: ${sample.label}`;

    testStates = {};
    const fgSelect = document.getElementById('fgSelect');
    if (fgSelect) fgSelect.value = '';
    const compSelect = document.getElementById('compoundSelect');
    if (compSelect) compSelect.value = '';
    const resBox = document.getElementById('idResultBox');
    if (resBox) resBox.style.display = 'none';

    renderGrid();
    updateProgress();
  };

  window.submitIdentification = function() {
    const fgSelect = document.getElementById('fgSelect');
    const compSelect = document.getElementById('compoundSelect');
    const resBox = document.getElementById('idResultBox');
    if (!fgSelect || !compSelect || !resBox) return;

    const chosenFg = fgSelect.value;
    const chosenComp = compSelect.value;
    const sample = SAMPLES[currentSampleKey];

    if (!chosenFg || !chosenComp) {
      alert('Please select both the Functional Group and the Specific Compound Formula to submit.');
      return;
    }

    const fgCorrect = chosenFg === sample.fgKey;
    const compCorrect = chosenComp === sample.compoundKey;

    let testMarks = 0;
    TESTS.forEach(t => {
      const st = testStates[t.key];
      if (st && st.performed) {
        if ((st.obsText || '').trim().length > 3) testMarks += 0.7;
        if ((st.infText || '').trim().length > 3) testMarks += 0.7;
      }
    });

    const deductionMarks = (fgCorrect ? 2.5 : 0) + (compCorrect ? 2.5 : 0);
    const totalScore = +(testMarks + deductionMarks).toFixed(1);
    const maxScore = 14.8;
    const percentage = Math.round((totalScore / maxScore) * 100);

    resBox.style.display = 'block';
    resBox.innerHTML = `
      <div class="id-result-card ${fgCorrect && compCorrect ? 'correct' : 'incorrect'}">
        <div class="id-result-icon">${fgCorrect && compCorrect ? '🏆' : '⚠️'}</div>
        <div class="id-result-text" style="flex:1;">
          <h3>KCSE Examination Performance: ${totalScore} / ${maxScore} Marks (${percentage}%)</h3>
          <p><strong>Actual Sample Identity:</strong> ${sample.name} (${sample.fgName})</p>
          <p style="margin-top:4px;">
            • <b>Functional Group:</b> ${fgCorrect ? '<span style="color:var(--green-accent); font-weight:700;">✅ Correct (+2.5 Marks)</span>' : '<span style="color:var(--red-accent); font-weight:700;">❌ Incorrect (Expected: ' + sample.fgName + ')</span>'}<br>
            • <b>Molecular Formula:</b> ${compCorrect ? '<span style="color:var(--green-accent); font-weight:700;">✅ Correct (+2.5 Marks)</span>' : '<span style="color:var(--red-accent); font-weight:700;">❌ Incorrect (Expected: ' + sample.name + ')</span>'}<br>
            • <b>Observations & Inferences Score:</b> ${testMarks.toFixed(1)} / 9.8 Marks
          </p>
        </div>
        <div>
          <button class="btn-primary-solid" onclick="newSample()">⚗️ Next Sample</button>
        </div>
      </div>
    `;

    // Save session to backend
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('assignment') ? parseInt(urlParams.get('assignment'), 10) : null;

    let performedCount = 0;
    TESTS.forEach(t => {
      if (testStates[t.key] && testStates[t.key].performed) performedCount++;
    });

    const fgLabel = fgSelect.options[fgSelect.selectedIndex]?.text || sample.fgName;

    const payload = {
      compound_key: sample.key,
      compound_name: sample.name,
      student_functional_group: fgLabel,
      tests_performed: performedCount,
      tests_correct: (fgCorrect && compCorrect) ? 7 : (fgCorrect ? 5 : 2),
      questions_total: 4,
      questions_correct: fgCorrect ? 4 : (compCorrect ? 2 : 1),
      observations: Object.keys(testStates).map(k => ({ test: k, obs: testStates[k].obsText, inf: testStates[k].infText })),
      mode: 'practice',
      assignment_id: assignmentId
    };

    if (typeof Organic !== 'undefined' && Organic.save) {
      Organic.save(payload).then(() => {
        if (assignmentId) {
          alert('🎉 Practical Assignment Submitted Successfully!\nYour teacher will review your functional group analysis deductions.');
        }
      }).catch(err => console.warn('Organic session offline sync:', err.message));
    } else if (typeof apiRequest === 'function') {
      apiRequest('POST', '/organic', payload).then(() => {
        if (assignmentId) {
          alert('🎉 Practical Assignment Submitted Successfully!\nYour teacher will review your functional group analysis deductions.');
        }
      }).catch(err => console.warn('Organic session offline sync:', err.message));
    }
  };

  /* ══════════════════════════════════════
     MODAL CONTROLS & TIMERS
  ══════════════════════════════════════ */
  window.openExaminerTipsModal = function() {
    const m = document.getElementById('examinerTipsModal');
    if (m) m.style.display = 'flex';
  };
  window.closeExaminerTipsModal = function() {
    const m = document.getElementById('examinerTipsModal');
    if (m) m.style.display = 'none';
  };

  window.openFlowchartModal = function() {
    const m = document.getElementById('flowchartModal');
    const c = document.getElementById('flowchartContent');
    if (c) {
      c.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--card-bg); border-left:4px solid var(--purple-accent); padding:12px 16px; border-radius:6px;">
            <b style="color:var(--purple-accent); font-size:0.95rem;">Step 1: Test with Distilled Water</b>
            <p style="margin:4px 0 0 0;">• <b>Miscible (1 Layer):</b> Polar (Low mass Alkanol or Alkanoic Acid)<br>• <b>Immiscible (2 Layers):</b> Non-polar Hydrocarbon (Alkane, Alkene, Arene)</p>
          </div>
          <div style="background:var(--card-bg); border-left:4px solid var(--amber-accent); padding:12px 16px; border-radius:6px;">
            <b style="color:var(--amber-accent); font-size:0.95rem;">Step 2: Ignition on Metallic Spatula</b>
            <p style="margin:4px 0 0 0;">• <b>Yellow Sooty Flame:</b> High C:H ratio &rarr; Alkene (-C=C-), Alkyne (-C≡C-), or Arene<br>• <b>Clear Blue Flame:</b> Low C:H ratio &rarr; Saturated Alkane, Alkanol, or Alkanoic Acid</p>
          </div>
          <div style="background:var(--card-bg); border-left:4px solid var(--green-accent); padding:12px 16px; border-radius:6px;">
            <b style="color:var(--green-accent); font-size:0.95rem;">Step 3: Acidified Bromine Water & K₂Cr₂O₇</b>
            <p style="margin:4px 0 0 0;">• <b>Bromine Decolourized:</b> Confirms -C=C- or -C≡C- unsaturation<br>• <b>K₂Cr₂O₇ turns Green:</b> Confirms R-OH (Primary or Secondary Alkanol)<br>• <b>Solid Na₂CO₃ Effervescence:</b> Confirms R-COOH (Alkanoic Acid)</p>
          </div>
        </div>
      `;
    }
    if (m) m.style.display = 'flex';
  };
  window.closeFlowchartModal = function() {
    const m = document.getElementById('flowchartModal');
    if (m) m.style.display = 'none';
  };

  window.evaluateKnecMarking = function() {
    const m = document.getElementById('knecEvalModal');
    const res = document.getElementById('knecEvalResults');
    if (res) {
      let performedCount = 0;
      let breakdownHtml = '';

      TESTS.forEach((t, i) => {
        const st = testStates[t.key];
        const done = st && st.performed;
        if (done) performedCount++;
        const obs = (st && st.obsText) || '—';
        const inf = (st && st.infText) || '—';
        breakdownHtml += `
          <div style="background:var(--bg-dark); border:1px solid var(--card-border); border-radius:8px; padding:10px 14px; margin-bottom:8px;">
            <div style="font-weight:700; color:var(--purple-accent); font-size:0.85rem;">(${String.fromCharCode(97 + i)}) ${t.label}</div>
            <div style="font-size:0.8rem; color:var(--text-main); margin-top:3px;"><b>Obs:</b> ${obs}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);"><b>Inf:</b> ${inf}</div>
          </div>
        `;
      });

      res.innerHTML = `
        <div style="margin-bottom:14px; font-size:0.88rem; color:var(--text-main);">
          <strong>Tests Evaluated:</strong> ${performedCount} of ${TESTS.length} tests performed.
        </div>
        <div style="max-height:360px; overflow-y:auto; margin-bottom:16px;">
          ${breakdownHtml}
        </div>
        <div style="text-align:right;">
          <button class="btn-primary-solid" onclick="closeKnecEvalModal()" style="padding:8px 20px;">Done</button>
        </div>
      `;
    }
    if (m) m.style.display = 'flex';
  };
  window.closeKnecEvalModal = function() {
    const m = document.getElementById('knecEvalModal');
    if (m) m.style.display = 'none';
  };

  window.toggleExamTimer = function() {
    const btn = document.getElementById('examTimerBtn');
    const disp = document.getElementById('timerDisplay');
    if (!btn || !disp) return;

    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      btn.textContent = '⏱️ Resume Timer';
    } else {
      timerRunning = true;
      btn.textContent = '⏸️ Pause Timer';
      timerInterval = setInterval(() => {
        if (examSeconds > 0) {
          examSeconds--;
          const m = String(Math.floor(examSeconds / 60)).padStart(2, '0');
          const s = String(examSeconds % 60).padStart(2, '0');
          disp.textContent = `⏱️ ${m}:${s}`;
        } else {
          clearInterval(timerInterval);
          disp.textContent = '⏱️ 00:00';
          alert('Exam time is up! Please submit your deductions.');
        }
      }, 1000);
    }
  };

  /* ══════════════════════════════════════
     INITIALIZATION
  ══════════════════════════════════════ */
  function init() {
    const sample = SAMPLES[currentSampleKey];
    const badge = document.getElementById('sampleIdBadge');
    if (badge) badge.textContent = `Sample: ${sample.label}`;

    renderGrid();
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
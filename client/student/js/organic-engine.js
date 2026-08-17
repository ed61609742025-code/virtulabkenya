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
  const SAMPLES = {
    'org_alkene': {
      key: 'org_alkene',
      label: 'Sample A (Liquid)',
      name: 'Hex-1-ene (C₆H₁₂)',
      compoundKey: 'hexene',
      fgKey: 'alkene',
      fgName: 'Alkene (C=C unsaturation)',
      solubility: { obs: 'Immiscible. Forms two distinct liquid layers.', inf: 'Non-polar organic compound / hydrocarbon present', status: 'Immiscible (2 Layers)' },
      ignition: { obs: 'Burns with a yellow smoky / sooty flame.', inf: 'High C:H ratio / -C=C- or -C≡C- present', status: 'Yellow Sooty Flame' },
      bromine: { obs: 'Reddish-brown bromine water is decolourized / turns colourless rapidly.', inf: '-C=C- or -C≡C- present / Unsaturated compound', status: 'Bromine Decolourized' },
      dichromate: { obs: 'Orange solution persists. No colour change on warming.', inf: 'R-OH / Primary or secondary alkanol absent', status: 'Remains Orange' },
      carbonate: { obs: 'No effervescence / no bubbles of gas observed.', inf: 'R-COOH absent / Not acidic', status: 'No Effervescence' },
      esterification: { obs: 'Pungent ethanoic acid odour remains; no fruity scent.', inf: 'R-OH absent', status: 'Pungent Odour' },
      litmus: { obs: 'Blue and red litmus papers remain unchanged (pH 7).', inf: 'Neutral organic compound', status: 'Neutral (pH 7)' }
    },
    'org_alcohol': {
      key: 'org_alcohol',
      label: 'Sample B (Liquid)',
      name: 'Ethanol (C₂H₅OH)',
      compoundKey: 'ethanol',
      fgKey: 'alkanol',
      fgName: 'Primary Alkanol (R-OH)',
      solubility: { obs: 'Miscible. Dissolves completely to form a single colourless solution layer.', inf: 'Polar organic compound / low molecular mass alkanol present', status: 'Miscible (1 Layer)' },
      ignition: { obs: 'Burns with a clear blue non-sooty flame.', inf: 'Saturated organic compound / Low C:H ratio', status: 'Clear Blue Flame' },
      bromine: { obs: 'Bromine water remains reddish-brown. No decolourization.', inf: '-C=C- or -C≡C- absent / Saturated organic compound', status: 'Remains Red-Brown' },
      dichromate: { obs: 'Acidified K₂Cr₂O₇ turns from orange to emerald green.', inf: 'R-OH / Primary or secondary alkanol present', status: 'Turns Green (Cr³⁺)' },
      carbonate: { obs: 'No effervescence or bubbling observed.', inf: 'R-COOH absent / Not acidic', status: 'No Effervescence' },
      esterification: { obs: 'Sweet, pleasant fruity aroma detected on warming in water bath.', inf: 'Ester formed / R-OH alkanol present', status: 'Sweet Fruity Aroma' },
      litmus: { obs: 'Both blue and red litmus papers show no colour change (pH 7).', inf: 'Neutral organic compound', status: 'Neutral (pH 7)' }
    },
    'org_acid': {
      key: 'org_acid',
      label: 'Sample C (Liquid)',
      name: 'Ethanoic Acid (CH₃COOH)',
      compoundKey: 'ethanoic_acid',
      fgKey: 'alkanoic_acid',
      fgName: 'Alkanoic Acid (R-COOH)',
      solubility: { obs: 'Miscible in all proportions to form a single clear solution layer.', inf: 'Polar organic compound / carboxylic acid present', status: 'Miscible (1 Layer)' },
      ignition: { obs: 'Burns with a clear blue non-sooty flame.', inf: 'Saturated organic compound / Low C:H ratio', status: 'Clear Blue Flame' },
      bromine: { obs: 'Bromine water remains reddish-brown without decolourization.', inf: 'Saturated organic compound / Unsaturation absent', status: 'Remains Red-Brown' },
      dichromate: { obs: 'Orange solution persists. No green reduction observed.', inf: 'R-OH absent / Non-reducing compound', status: 'Remains Orange' },
      carbonate: { obs: 'Rapid effervescence of a colourless gas that turns limewater milky (CO₂).', inf: 'R-COOH / Carboxylic acid / H⁺ ions present', status: 'Rapid Effervescence (CO₂)' },
      esterification: { obs: 'Pungent vinegar-like smell remains; no sweet ester aroma.', inf: 'R-OH absent', status: 'Pungent Acid Smell' },
      litmus: { obs: 'Blue litmus paper turns red; red litmus remains red (pH 3).', inf: 'Acidic organic compound / H⁺ ions present / R-COOH present', status: 'Acidic (Turns Red)' }
    },
    'org_alkane': {
      key: 'org_alkane',
      label: 'Sample D (Liquid)',
      name: 'Hexane (C₆H₁₄)',
      compoundKey: 'hexane',
      fgKey: 'alkane',
      fgName: 'Alkane (Saturated C-C)',
      solubility: { obs: 'Immiscible. Forms two separate immiscible layers.', inf: 'Non-polar hydrocarbon present', status: 'Immiscible (2 Layers)' },
      ignition: { obs: 'Burns with a clear blue non-sooty flame.', inf: 'Saturated organic compound / Low C:H ratio', status: 'Clear Blue Flame' },
      bromine: { obs: 'Bromine water remains reddish-brown. Decolourization is absent.', inf: '-C=C- or -C≡C- absent / Saturated hydrocarbon', status: 'Remains Red-Brown' },
      dichromate: { obs: 'Orange K₂Cr₂O₇ solution remains orange.', inf: 'R-OH absent / Non-reducing', status: 'Remains Orange' },
      carbonate: { obs: 'No effervescence / no gas produced.', inf: 'R-COOH absent', status: 'No Effervescence' },
      esterification: { obs: 'Pungent acid smell persists; no sweet fragrance.', inf: 'R-OH absent', status: 'No Fruity Aroma' },
      litmus: { obs: 'No colour change on blue or red litmus papers (pH 7).', inf: 'Neutral organic compound', status: 'Neutral (pH 7)' }
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
  ══════════════════════════════════════ */
  function getObsSuggestionChips(testKey) {
    const suggestions = {
      solubility: [
        'Miscible. Forms a single homogeneous colourless layer',
        'Immiscible. Forms two distinct separate liquid layers'
      ],
      ignition: [
        'Burns with a yellow sooty / smoky flame',
        'Burns with a clear blue non-sooty flame',
        'Burns with a luminous flame leaving carbon residue'
      ],
      bromine: [
        'Reddish-brown bromine water is decolourized / turns colourless',
        'Bromine water remains reddish-brown. Decolourization is absent'
      ],
      dichromate: [
        'Acidified K₂Cr₂O₇ solution turns from orange to emerald green',
        'Orange colour of K₂Cr₂O₇ persists without change'
      ],
      carbonate: [
        'Rapid effervescence of a colourless gas turning limewater milky (CO₂)',
        'No effervescence or bubbling observed; solid powder settles'
      ],
      esterification: [
        'Sweet, pleasant fruity aroma detected upon warming',
        'Pungent vinegar-like smell remains; no sweet ester fragrance'
      ],
      litmus: [
        'Blue litmus turns red; red litmus remains red (Acidic, pH 3)',
        'Both blue and red litmus papers show no colour change (Neutral, pH 7)'
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
        'Polar organic compound / R-OH or R-COOH present',
        'Non-polar organic compound / hydrocarbon present'
      ],
      ignition: [
        'High C:H ratio / -C=C- or -C≡C- present / Aromatic compound',
        'Saturated organic compound / Low C:H ratio'
      ],
      bromine: [
        '-C=C- or -C≡C- present / Unsaturated compound',
        '-C=C- and -C≡C- absent / Saturated compound'
      ],
      dichromate: [
        'R-OH / Primary or secondary alkanol present',
        'R-OH absent / Non-reducing compound'
      ],
      carbonate: [
        'R-COOH / Carboxylic acid / H⁺ ions present',
        'R-COOH absent / Not acidic'
      ],
      esterification: [
        'R-OH / Alkanol functional group present',
        'R-OH absent'
      ],
      litmus: [
        'R-COOH / Carboxylic acid / H⁺ ions present',
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
     DYNAMIC REAL-TIME SVG VISUALIZERS
  ══════════════════════════════════════ */
  function getOrganicVisual(test, st) {
    const performed = st && st.performed;
    const sample = SAMPLES[currentSampleKey] || SAMPLES['org_alcohol'];
    const testKey = test.key;

    if (testKey === 'solubility') {
      const isMiscible = sample.solubility.obs.includes('Miscible') || sample.solubility.obs.includes('single');
      const liquidD = performed ? (isMiscible ? 'M 27,65 L 27,118 Q 27,128 45,128 Q 63,128 63,118 L 63,65 Z' : 'M 27,88 L 27,118 Q 27,128 45,128 Q 63,128 63,118 L 63,88 Z') : 'M 27,88 L 27,118 Q 27,128 45,128 Q 63,128 63,118 L 63,88 Z';
      const waterColor = performed ? (isMiscible ? 'rgba(56, 189, 248, 0.45)' : 'rgba(56, 189, 248, 0.35)') : 'rgba(56, 189, 248, 0.25)';
      const organicLayer = performed && !isMiscible ? `
        <path d="M 27,65 L 27,88 L 63,88 L 63,65 Z" fill="rgba(245, 158, 11, 0.4)"/>
        <ellipse cx="45" cy="65" rx="18" ry="4" fill="rgba(245, 158, 11, 0.6)"/>
        <ellipse cx="45" cy="88" rx="18" ry="4" fill="rgba(56, 189, 248, 0.6)"/>
      ` : '';

      return `<svg width="90" height="140" viewBox="0 0 90 140">
        <!-- Test Tube Glass -->
        <rect x="25" y="40" width="40" height="90" rx="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
        <path d="${liquidD}" fill="${waterColor}"/>
        ${organicLayer}
        <!-- Dropper Assembly -->
        <g style="transition: transform 0.8s ease; transform: translate(${performed ? '0px, 8px' : '0px, 0px'});">
          <path d="M 45,8 L 45,34" stroke="#38BDF8" stroke-width="2.8" stroke-linecap="round"/>
          <circle cx="45" cy="8" r="4.5" fill="#0284C7"/>
        </g>
        <text x="45" y="136" font-size="9" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Water Test</text>
      </svg>`;
    }

    if (testKey === 'ignition') {
      const isSooty = sample.ignition.obs.toLowerCase().includes('sooty') || sample.ignition.obs.toLowerCase().includes('smoky');
      const flameColor = performed ? (isSooty ? '#F59E0B' : 'rgba(56, 189, 248, 0.85)') : 'rgba(56, 189, 248, 0.35)';
      const sootParticles = performed && isSooty ? `
        <g class="anim-soot">
          <circle cx="48" cy="18" r="3.5" fill="#1E293B" opacity="0.85"/>
          <circle cx="53" cy="10" r="4.5" fill="#0F172A" opacity="0.75"/>
          <circle cx="45" cy="2" r="5.5" fill="#020617" opacity="0.6"/>
        </g>
      ` : '';

      return `<svg width="100" height="140" viewBox="0 0 100 140">
        <!-- Burner Base & Barrel -->
        <rect x="35" y="112" width="30" height="14" fill="#334155" rx="3"/>
        <rect x="46" y="75" width="8" height="38" fill="#64748B"/>
        <!-- Flame Cone -->
        <path d="M 50,22 C 34,36 38,72 50,72 C 62,72 66,36 50,22 Z" fill="${flameColor}" class="${performed ? 'anim-flame' : ''}"/>
        <path d="M 50,42 C 43,52 45,72 50,72 C 55,72 57,52 50,42 Z" fill="#E0F2FE" opacity="0.9" class="${performed ? 'anim-flame-inner' : ''}"/>
        ${sootParticles}
        <!-- Spatula -->
        <g style="transition: transform 0.8s ease; transform: translate(${performed ? '16px, 0px' : '0px, 0px'});">
          <line x1="6" y1="48" x2="42" y2="48" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="42" cy="48" rx="5" ry="2.5" fill="#94A3B8"/>
        </g>
        <text x="50" y="136" font-size="9" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Spatula Burn</text>
      </svg>`;
    }

    if (testKey === 'bromine') {
      const isDecolourized = sample.bromine.obs.toLowerCase().includes('colorless') || sample.bromine.obs.toLowerCase().includes('colourless') || sample.bromine.obs.toLowerCase().includes('decolor');
      const liquidColor = performed ? (isDecolourized ? 'rgba(255, 255, 255, 0.2)' : 'rgba(220, 38, 38, 0.75)') : 'rgba(56, 189, 248, 0.35)';

      return `<svg width="90" height="140" viewBox="0 0 90 140">
        <rect x="25" y="40" width="40" height="90" rx="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
        <path d="M 27,65 L 27,118 Q 27,128 45,128 Q 63,128 63,118 L 63,65 Z" fill="${liquidColor}" class="${performed && isDecolourized ? 'anim-decolorize' : ''}"/>
        <ellipse cx="45" cy="65" rx="18" ry="4" fill="${liquidColor}"/>
        <!-- Bromine Dropper -->
        <g style="transition: transform 0.6s ease; transform: translate(${performed ? '0px, 6px' : '0px, 0px'});">
          <path d="M 45,6 L 45,32" stroke="#EA580C" stroke-width="2.8"/>
          <circle cx="45" cy="6" r="4.5" fill="#C2410C"/>
        </g>
        <text x="45" y="136" font-size="9" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Br₂(aq) Tube</text>
      </svg>`;
    }

    if (testKey === 'dichromate') {
      const turnsGreen = sample.dichromate.obs.toLowerCase().includes('green');
      const liquidColor = performed ? (turnsGreen ? '#059669' : '#EA580C') : '#F59E0B';
      const vapors = performed && turnsGreen ? `
        <g class="anim-vapor">
          <path d="M 38,28 Q 42,18 40,8" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" fill="none"/>
          <path d="M 48,30 Q 52,20 50,10" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" fill="none"/>
        </g>
      ` : '';

      return `<svg width="90" height="140" viewBox="0 0 90 140">
        <rect x="25" y="35" width="40" height="85" rx="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
        <path d="M 27,60 L 27,110 Q 27,118 45,118 Q 63,118 63,110 L 63,60 Z" fill="${liquidColor}"/>
        <ellipse cx="45" cy="60" rx="18" ry="4" fill="${liquidColor}"/>
        ${vapors}
        <!-- Heating burner under tube -->
        <path d="M 45,122 C 38,128 40,138 45,138 C 50,138 52,128 45,122 Z" fill="#F59E0B" class="anim-flame"/>
        <text x="45" y="138" font-size="9" font-weight="700" fill="var(--text-muted)" text-anchor="middle">K₂Cr₂O₇ / Heat</text>
      </svg>`;
    }

    if (testKey === 'carbonate') {
      const hasEffervescence = sample.carbonate.obs.toLowerCase().includes('effervescence') || sample.carbonate.obs.toLowerCase().includes('bubbling');
      const bubbles = performed && hasEffervescence ? `
        <g class="anim-bubble">
          <circle cx="36" cy="95" r="2.2" fill="#FFFFFF"/>
          <circle cx="45" cy="85" r="2.8" fill="#FFFFFF"/>
          <circle cx="52" cy="100" r="2" fill="#FFFFFF"/>
          <circle cx="40" cy="75" r="2.5" fill="#FFFFFF"/>
        </g>
        <rect x="27" y="60" width="36" height="8" rx="3" fill="rgba(255,255,255,0.75)" class="anim-froth"/>
      ` : (performed ? '<ellipse cx="45" cy="115" rx="12" ry="3" fill="#FFFFFF" opacity="0.9"/>' : '');

      return `<svg width="90" height="140" viewBox="0 0 90 140">
        <rect x="25" y="40" width="40" height="90" rx="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
        <path d="M 27,65 L 27,118 Q 27,128 45,128 Q 63,128 63,118 L 63,65 Z" fill="rgba(56, 189, 248, 0.4)"/>
        <ellipse cx="45" cy="65" rx="18" ry="4" fill="rgba(56, 189, 248, 0.6)"/>
        ${bubbles}
        <!-- Spatula powder deposit -->
        <g style="transition: transform 0.6s ease; transform: translate(${performed ? '4px, 4px' : '0px, 0px'});">
          <line x1="20" y1="28" x2="46" y2="28" stroke="#94A3B8" stroke-width="2.5"/>
          <circle cx="46" cy="28" r="2" fill="#FFFFFF"/>
        </g>
        <text x="45" y="136" font-size="9" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Na₂CO₃ Test</text>
      </svg>`;
    }

    if (testKey === 'esterification') {
      const isFruity = sample.esterification.obs.toLowerCase().includes('fruity') || sample.esterification.obs.toLowerCase().includes('sweet');
      const liquidColor = performed ? (isFruity ? 'rgba(192, 132, 252, 0.65)' : 'rgba(56, 189, 248, 0.45)') : 'rgba(56, 189, 248, 0.35)';
      const vapors = performed && isFruity ? `
        <g class="anim-vapor">
          <path d="M 38,26 Q 44,16 40,6" stroke="rgba(192, 132, 252, 0.8)" stroke-width="2" fill="none"/>
          <path d="M 50,28 Q 56,18 52,8" stroke="rgba(192, 132, 252, 0.8)" stroke-width="2" fill="none"/>
        </g>
      ` : '';

      return `<svg width="90" height="140" viewBox="0 0 90 140">
        <!-- Beaker water bath -->
        <path d="M 12,65 L 12,120 Q 12,126 22,126 L 68,126 Q 78,126 78,120 L 78,65" fill="none" stroke="#64748B" stroke-width="1.8"/>
        <rect x="14" y="80" width="62" height="44" fill="rgba(56, 189, 248, 0.2)"/>
        <!-- Boiling Tube inside bath -->
        <rect x="35" y="32" width="20" height="85" rx="7" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <path d="M 36,55 L 36,110 Q 36,116 45,116 Q 54,116 54,110 L 54,55 Z" fill="${liquidColor}"/>
        ${vapors}
        <text x="45" y="136" font-size="9" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Esterification</text>
      </svg>`;
    }

    if (testKey === 'litmus') {
      const isAcidic = sample.litmus.obs.includes('turns red');
      const blueStripFill = performed ? (isAcidic ? '#EF4444' : '#3B82F6') : '#3B82F6';
      const redStripFill = '#EF4444';
      const liquidColor = performed ? (isAcidic ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)') : 'rgba(56, 189, 248, 0.35)';

      return `<svg width="90" height="140" viewBox="0 0 90 140">
        <rect x="25" y="40" width="40" height="90" rx="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
        <path d="M 27,70 L 27,118 Q 27,128 45,128 Q 63,128 63,118 L 63,70 Z" fill="${liquidColor}"/>
        <!-- Litmus Paper Strips -->
        <g style="transition: transform 0.8s ease; transform: translate(0px, ${performed ? '16px' : '0px'});">
          <rect x="35" y="15" width="7" height="65" fill="${blueStripFill}" rx="1"/>
          <rect x="47" y="15" width="7" height="65" fill="${redStripFill}" rx="1"/>
        </g>
        <text x="45" y="136" font-size="9" font-weight="700" fill="var(--text-muted)" text-anchor="middle">Litmus Strips</text>
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
          <!-- Left Column: Dynamic SVG Reaction Apparatus -->
          <div style="background: var(--bg-dark); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 185px; position: relative;">
            ${getOrganicVisual(test, st)}
            <div id="status_${test.key}" style="font-size: 0.72rem; font-weight: 800; color: ${st.performed ? 'var(--purple-accent)' : 'var(--text-muted)'}; margin-top: 6px; text-align: center; max-width: 130px; line-height: 1.2;">
              ${!st.performed ? 'Awaiting Test' : (st.statusLabel || 'Test Completed')}
            </div>
          </div>

          <!-- Right Column: Procedure & 2-Column KCSE Table -->
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="font-family:var(--font-heading); font-size:1.05rem; font-weight:800; color:var(--heading-color);">
                (${testLetter}) ${test.label}
              </div>
              <span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--purple-accent); background:var(--purple-bg); padding:2px 8px; border-radius:100px;">${test.marks}</span>
            </div>

            <!-- Official KCSE Procedure Callout -->
            <div style="font-size:0.84rem; color:var(--text-main); line-height:1.55; margin-bottom:12px; background:var(--bg-dark); padding:10px 14px; border-radius:8px; border-left:3.5px solid var(--purple-accent); border:1px solid var(--card-border);">
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
            <table class="kcse-table">
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
                  <td style="vertical-align:top;">
                    <textarea class="kcse-input" id="obs_${test.key}" placeholder="Write exact observations..." oninput="saveTextState('${test.key}')">${st.obsText || ''}</textarea>
                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
                      ${getObsSuggestionChips(test.key)}
                    </div>
                  </td>
                  <td style="vertical-align:top;">
                    <textarea class="kcse-input" id="inf_${test.key}" placeholder="Write deductions..." oninput="saveTextState('${test.key}')">${st.infText || ''}</textarea>
                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
                      ${getInfSuggestionChips(test.key)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--heading-color);">
          📊 KCSE Practical Score: ${totalScore} / ${maxScore} Marks (${percentage}%)
        </h3>
        <span style="background:${percentage >= 70 ? 'var(--green-accent)' : 'var(--amber-accent)'}; color:#FFF; font-size:0.78rem; font-weight:800; padding:4px 12px; border-radius:100px;">
          ${percentage >= 70 ? 'Distinction' : 'Pass'}
        </span>
      </div>
      <div style="font-size:0.86rem; line-height:1.6; color:var(--text-main);">
        <p><strong>Actual Sample:</strong> ${sample.name} — <em>${sample.fgName}</em></p>
        <p><strong>Functional Group Identification:</strong> ${fgCorrect ? '✅ <span style="color:var(--green-accent); font-weight:700;">Correct (+2.5 Marks)</span>' : '❌ <span style="color:var(--red-accent);">Incorrect (Expected: ' + sample.fgName + ')</span>'}</p>
        <p><strong>Compound Formula Identification:</strong> ${compCorrect ? '✅ <span style="color:var(--green-accent); font-weight:700;">Correct (+2.5 Marks)</span>' : '❌ <span style="color:var(--red-accent);">Incorrect (Expected: ' + sample.name + ')</span>'}</p>
        <p><strong>Test Observations & Inferences Recorded:</strong> ${testMarks.toFixed(1)} / 9.8 Marks</p>
      </div>
      <div style="text-align:right; margin-top:14px;">
        <button class="btn-primary-solid" onclick="newSample()">⚗️ Practice Next Sample</button>
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
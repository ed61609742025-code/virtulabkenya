// ============================================================
//  VirtuLab Kenya — Canonical Organic Chemistry Core Module
//  High-Fidelity SVG Apparatus, Multi-Stage State Machine & Web Audio Synthesizer
//  Shared between Standalone Bench (organic.html) and Composite Mock Exam (composite_exam.html)
// ============================================================

(function(global) {
  'use strict';

  // ── 1. Canonical Organic Samples Registry ──────────────────────
  const SAMPLES = {
    'org_alkene': {
      key: 'org_alkene',
      altKeys: ['HEXENE', 'HEX-1-ENE', 'ALKENE', 'C6H12'],
      label: 'Sample A (Liquid)',
      name: 'Hex-1-ene (C₆H₁₂)',
      compoundKey: 'hexene',
      fgKey: 'alkene',
      fgName: 'Alkene (>C=C< unsaturation)',
      isSooty: true,
      solubility: {
        isMiscible: false,
        obs: 'Immiscible. Forms two distinct liquid layers.',
        inf: 'Non-polar hydrocarbon present',
        status: 'Immiscible (2 Separate Layers)'
      },
      ignition: {
        isSooty: true,
        obs: 'Burns with a yellow smoky sooty flame.',
        inf: 'High C:H ratio or unsaturation (>C=C<) present',
        status: 'Luminous Yellow Sooty Flame (Black Smoke)'
      },
      bromine: {
        isDecolorized: true,
        obs: 'Bromine water is decolourized immediately.',
        inf: '>C=C< or -C≡C- unsaturation present',
        status: 'Bromine Decolourized (Turns Colourless)'
      },
      kmno4: {
        isDecolorized: true,
        obs: 'Purple acidified KMnO₄ is rapidly decolourized.',
        inf: '>C=C< or -C≡C- unsaturation present',
        status: 'KMnO₄ Decolourized (Purple to Colourless)'
      },
      dichromate: {
        turnsGreen: false,
        obs: 'Acidified potassium dichromate(VI) remains orange.',
        inf: 'Alkanol absent',
        status: 'Orange Colour Persists (No oxidation)'
      },
      carbonate: {
        hasEffervescence: false,
        obs: 'No effervescence observed.',
        inf: 'Carboxylic acid (-COOH) absent',
        status: 'No Effervescence (Solid settles at bottom)'
      },
      esterification: {
        isFruity: false,
        obs: 'Pungent hydrocarbon odour persists; no fruity smell.',
        inf: 'Alkanol (-OH) absent',
        status: 'No Sweet Ester Formed'
      },
      litmus: {
        isAcidic: false,
        obs: 'Both moist red and blue litmus papers remain unchanged.',
        inf: 'Neutral organic compound',
        status: 'Neutral (No Litmus Colour Change, pH 7)'
      }
    },
    'org_alcohol': {
      key: 'org_alcohol',
      altKeys: ['ETHANOL', 'ALCOHOL', 'ALKANOL', 'C2H5OH'],
      label: 'Sample B (Liquid)',
      name: 'Ethanol (C₂H₅OH)',
      compoundKey: 'ethanol',
      fgKey: 'alkanol',
      fgName: 'Primary Alkanol (R-OH)',
      isSooty: false,
      solubility: {
        isMiscible: true,
        obs: 'Miscible. Dissolves completely in water to form single phase.',
        inf: 'Polar organic compound present',
        status: 'Miscible (Single Clear Solution)'
      },
      ignition: {
        isSooty: false,
        obs: 'Burns with a clear pale blue non-sooty flame.',
        inf: 'Saturated organic compound present',
        status: 'Non-Luminous Clear Pale Blue Flame'
      },
      bromine: {
        isDecolorized: false,
        obs: 'Bromine water remains reddish-brown.',
        inf: 'Saturated compound with no carbon-carbon double bonds',
        status: 'Reddish-Brown Colour Persists'
      },
      kmno4: {
        isDecolorized: true,
        obs: 'Purple acidified KMnO₄ slowly decolourizes on warming.',
        inf: 'Primary alkanol oxidized',
        status: 'Decolourizes on Gentle Warming'
      },
      dichromate: {
        turnsGreen: true,
        obs: 'Acidified potassium dichromate(VI) turns from orange to green.',
        inf: 'Primary or secondary alkanol (R-OH) present',
        status: 'Turns Emerald Green (Cr³⁺ reduced)'
      },
      carbonate: {
        hasEffervescence: false,
        obs: 'No effervescence observed.',
        inf: 'Carboxylic acid (-COOH) absent',
        status: 'No Effervescence'
      },
      esterification: {
        isFruity: true,
        obs: 'Sweet pleasant fruity aroma produced.',
        inf: 'Alkanol (R-OH) confirmed',
        status: 'Pleasant Sweet Fruity Aroma (Ethyl ethanoate ester)'
      },
      litmus: {
        isAcidic: false,
        obs: 'Litmus papers remain unchanged.',
        inf: 'Neutral organic compound',
        status: 'Neutral (No Litmus Colour Change, pH 7)'
      }
    },
    'org_acid': {
      key: 'org_acid',
      altKeys: ['ETHANOIC ACID', 'ACETIC ACID', 'CARBOXYLIC ACID', 'CH3COOH'],
      label: 'Sample C (Liquid)',
      name: 'Ethanoic Acid (CH₃COOH)',
      compoundKey: 'ethanoic_acid',
      fgKey: 'alkanoic_acid',
      fgName: 'Carboxylic Acid (R-COOH)',
      isSooty: false,
      solubility: {
        isMiscible: true,
        obs: 'Miscible. Dissolves completely in water.',
        inf: 'Polar carboxylic acid present',
        status: 'Miscible (Single Clear Solution)'
      },
      ignition: {
        isSooty: false,
        obs: 'Burns with a clear pale blue non-sooty flame.',
        inf: 'Saturated organic compound present',
        status: 'Non-Luminous Clear Blue Flame'
      },
      bromine: {
        isDecolorized: false,
        obs: 'Bromine water remains reddish-brown.',
        inf: 'Saturated compound with no unsaturation',
        status: 'Reddish-Brown Colour Persists'
      },
      kmno4: {
        isDecolorized: false,
        obs: 'Acidified KMnO₄ remains purple.',
        inf: 'Resistant to mild oxidation',
        status: 'Purple Colour Persists'
      },
      dichromate: {
        turnsGreen: false,
        obs: 'Acidified potassium dichromate(VI) remains orange.',
        inf: 'Alkanol absent',
        status: 'Orange Colour Persists'
      },
      carbonate: {
        hasEffervescence: true,
        obs: 'Brisk effervescence of a colourless gas that turns limewater milky (CO₂).',
        inf: 'Carboxylic acid (R-COOH) confirmed',
        status: 'Vigorous Effervescence of CO₂ Gas'
      },
      esterification: {
        isFruity: true,
        obs: 'Sweet pleasant fruity aroma produced when heated with ethanol and conc. H₂SO₄.',
        inf: 'Carboxylic acid (R-COOH) confirmed',
        status: 'Pleasant Sweet Fruity Aroma (Ester formed)'
      },
      litmus: {
        isAcidic: true,
        obs: 'Moist blue litmus paper turns red; red litmus remains red.',
        inf: 'Carboxylic acid (R-COOH) present',
        status: 'Acidic (Moist Blue Litmus Turns Red, pH 3)'
      }
    },
    'org_butanol': {
      key: 'org_butanol',
      altKeys: ['BUTANOL', 'BUTAN-1-OL', 'C4H9OH'],
      label: 'Sample D (Liquid)',
      name: 'Butan-1-ol (C₄H₉OH)',
      compoundKey: 'butanol',
      fgKey: 'alkanol',
      fgName: 'Primary Alkanol (R-OH)',
      isSooty: false,
      solubility: {
        isMiscible: true,
        obs: 'Moderately miscible with water; dissolves with gentle shaking.',
        inf: 'Polar organic compound present',
        status: 'Miscible with Shaking'
      },
      ignition: {
        isSooty: false,
        obs: 'Burns with a luminous pale blue flame, slightly smoky at tip.',
        inf: 'Saturated alkanol present',
        status: 'Non-Sooty Pale Blue Flame'
      },
      bromine: {
        isDecolorized: false,
        obs: 'Bromine water remains reddish-brown.',
        inf: 'Unsaturation absent',
        status: 'Red-Brown Colour Persists'
      },
      kmno4: {
        isDecolorized: true,
        obs: 'Purple acidified KMnO₄ turns colourless on heating.',
        inf: 'Primary alkanol oxidized',
        status: 'Decolourized on Heating'
      },
      dichromate: {
        turnsGreen: true,
        obs: 'Acidified potassium dichromate(VI) turns from orange to green.',
        inf: 'Primary alkanol (R-OH) present',
        status: 'Turns Emerald Green (Cr³⁺ reduced)'
      },
      carbonate: {
        hasEffervescence: false,
        obs: 'No effervescence observed.',
        inf: 'Carboxylic acid absent',
        status: 'No Effervescence'
      },
      esterification: {
        isFruity: true,
        obs: 'Pleasant fruity banana/pear aroma produced.',
        inf: 'Alkanol (R-OH) present',
        status: 'Pleasant Fruity Aroma (Butyl ethanoate)'
      },
      litmus: {
        isAcidic: false,
        obs: 'Litmus papers remain unchanged.',
        inf: 'Neutral organic compound',
        status: 'Neutral (pH 7)'
      }
    },
    'org_alkane': {
      key: 'org_alkane',
      altKeys: ['HEXANE', 'CYCLOHEXANE', 'ALKANE', 'PARAFFIN'],
      label: 'Sample E (Liquid)',
      name: 'Cyclohexane (C₆H₁₂)',
      compoundKey: 'cyclohexane',
      fgKey: 'alkane',
      fgName: 'Saturated Cycloalkane (C-C)',
      isSooty: false,
      solubility: {
        isMiscible: false,
        obs: 'Immiscible. Forms two distinct liquid layers.',
        inf: 'Non-polar hydrocarbon present',
        status: 'Immiscible (2 Separate Layers)'
      },
      ignition: {
        isSooty: true,
        obs: 'Burns with a luminous smoky sooty flame.',
        inf: 'Ring structure or high carbon content',
        status: 'Luminous Smoky Sooty Flame'
      },
      bromine: {
        isDecolorized: false,
        obs: 'Bromine water remains reddish-brown in the dark.',
        inf: 'Unsaturation absent',
        status: 'Red-Brown Colour Persists'
      },
      kmno4: {
        isDecolorized: false,
        obs: 'Acidified KMnO₄ remains purple.',
        inf: 'Saturated hydrocarbon unreactive to KMnO₄',
        status: 'Purple Colour Persists'
      },
      dichromate: {
        turnsGreen: false,
        obs: 'Acidified potassium dichromate(VI) remains orange.',
        inf: 'Alkanol absent',
        status: 'Orange Colour Persists'
      },
      carbonate: {
        hasEffervescence: false,
        obs: 'No effervescence observed.',
        inf: 'Carboxylic acid absent',
        status: 'No Effervescence'
      },
      esterification: {
        isFruity: false,
        obs: 'No pleasant fruity odour formed.',
        inf: 'Alkanol absent',
        status: 'No Reaction'
      },
      litmus: {
        isAcidic: false,
        obs: 'Litmus papers remain unchanged.',
        inf: 'Neutral hydrocarbon',
        status: 'Neutral (pH 7)'
      }
    }
  };

  function resolveSample(query) {
    if (!query) return SAMPLES.org_alkene;
    if (typeof query === 'object' && query.key && SAMPLES[query.key]) return SAMPLES[query.key];
    const norm = String(query).toUpperCase().trim();
    for (const key of Object.keys(SAMPLES)) {
      const s = SAMPLES[key];
      if (s.key.toUpperCase() === norm) return s;
      if (s.name.toUpperCase().includes(norm)) return s;
      if (s.altKeys && s.altKeys.some(alt => norm.includes(alt) || alt.includes(norm))) return s;
    }
    if (norm.includes('ACID') || norm.includes('COOH')) return SAMPLES.org_acid;
    if (norm.includes('ALCOHOL') || norm.includes('OL') || norm.includes('ETHANOL') || norm.includes('BUTANOL')) return SAMPLES.org_alcohol;
    if (norm.includes('ENE') || norm.includes('HEXENE') || norm.includes('ALKENE')) return SAMPLES.org_alkene;
    return SAMPLES.org_alkene;
  }

  // ── 2. Procedural Web Audio API Synthesizer ────────────────────
  let audioCtx = null;

  function isAudioMuted() {
    return localStorage.getItem('vlk_muted') === 'true';
  }

  function getAudioContext() {
    if (isAudioMuted()) return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playFlameSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.7);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.75);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  function playEffervescenceSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.sin(i / 120));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  function playDropSplashSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.045);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.055);
    } catch(e) {}
  }

  function playOrganicSound(reactionType) {
    if (reactionType === 'flame' || reactionType === 'ignition') playFlameSound();
    else if (reactionType === 'effervescence' || reactionType === 'carbonate' || reactionType === 'nahco3') playEffervescenceSound();
    else playDropSplashSound();
  }

  // ── 3. High-Fidelity SVG Apparatus Renderers ────────────────────

  function getCommonDefs(tubeId) {
    return `
      <defs>
        <!-- Wooden Clamp -->
        <linearGradient id="woodClamp_${tubeId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#9A3412"/>
          <stop offset="35%" stop-color="#C2410C"/>
          <stop offset="70%" stop-color="#7C2D12"/>
          <stop offset="100%" stop-color="#431407"/>
        </linearGradient>
        <radialGradient id="brassScrew_${tubeId}" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FEF08A"/>
          <stop offset="60%" stop-color="#CA8A04"/>
          <stop offset="100%" stop-color="#713F12"/>
        </radialGradient>

        <!-- Glass Materials -->
        <linearGradient id="pyrexGlass_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
          <stop offset="15%" stop-color="rgba(255,255,255,0.12)"/>
          <stop offset="85%" stop-color="rgba(255,255,255,0.08)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.4)"/>
        </linearGradient>

        <!-- Bunsen Flames -->
        <linearGradient id="clearBlueFlame_outer_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#1D4ED8" stop-opacity="0.95"/>
          <stop offset="40%" stop-color="#38BDF8" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#BAE6FD" stop-opacity="0.15"/>
        </linearGradient>
        <linearGradient id="clearBlueFlame_inner_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0284C7" stop-opacity="0.98"/>
          <stop offset="50%" stop-color="#67E8F9" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="sootyYellowFlame_outer_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#D97706" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="#F59E0B" stop-opacity="0.95"/>
          <stop offset="75%" stop-color="#FBBF24" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#FDE047" stop-opacity="0.92"/>
        </linearGradient>
        <linearGradient id="sootyYellowFlame_inner_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.98"/>
          <stop offset="60%" stop-color="#FEF08A" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#FFFBEB" stop-opacity="0.98"/>
        </linearGradient>

        <!-- Metallic Spatula -->
        <linearGradient id="spatulaMetal_${tubeId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F1F5F9"/>
          <stop offset="40%" stop-color="#CBD5E1"/>
          <stop offset="80%" stop-color="#94A3B8"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>
      </defs>
    `;
  }

  // 1. Ignition on Spatula over Bunsen Burner
  function renderIgnitionSvg(options = {}) {
    const { sampleKey = 'org_alkene', performed = false, tubeId = 'ign_1' } = options;
    const sample = resolveSample(sampleKey);
    const isSooty = sample.isSooty || sample.fgKey === 'alkene' || sample.fgKey === 'alkyne';

    const flameOuterFill = isSooty ? `url(#sootyYellowFlame_outer_${tubeId})` : `url(#clearBlueFlame_outer_${tubeId})`;
    const flameCoreFill = isSooty ? `url(#sootyYellowFlame_inner_${tubeId})` : `url(#clearBlueFlame_inner_${tubeId})`;

    const sootParticles = performed && isSooty ? `
      <g class="anim-soot">
        <circle cx="52" cy="18" r="3.2" fill="#0F172A" opacity="0.9"/>
        <circle cx="58" cy="10" r="4.2" fill="#1E293B" opacity="0.8"/>
        <circle cx="48" cy="2" r="5.5" fill="#020617" opacity="0.7"/>
        <circle cx="56" cy="-8" r="7.0" fill="#000000" opacity="0.5"/>
      </g>
    ` : '';

    const spatulaCombustion = performed ? (isSooty ? `
      <ellipse cx="44" cy="55" rx="3.5" ry="2.2" fill="#F59E0B" opacity="0.95"/>
      <path d="M 44,46 C 41,50 42,55 44,55 C 46,55 47,50 44,46 Z" fill="url(#sootyYellowFlame_outer_${tubeId})" class="anim-flame" style="transform-origin: 44px 55px;"/>
    ` : `
      <ellipse cx="44" cy="55" rx="3.5" ry="2.2" fill="#2563EB" opacity="0.95"/>
      <path d="M 44,46 C 41,50 42,55 44,55 C 46,55 47,50 44,46 Z" fill="url(#clearBlueFlame_outer_${tubeId})" class="anim-flame" style="transform-origin: 44px 55px;"/>
    `) : `
      <circle cx="44" cy="55" r="2.2" fill="#38BDF8" opacity="0.9"/>
    `;

    return `
      <svg width="105" height="150" viewBox="0 0 105 150">
        ${getCommonDefs(tubeId)}
        <!-- Bunsen Burner Base & Barrel -->
        <rect x="36" y="122" width="34" height="14" rx="3" fill="#334155" stroke="#1E293B" stroke-width="1"/>
        <rect x="49" y="80" width="8" height="42" fill="#64748B" stroke="#334155" stroke-width="0.8"/>
        <circle cx="53" cy="116" r="3" fill="#0F172A"/>
        <path d="M 57,126 Q 78,126 84,136" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Dual-Zone Bunsen Flame -->
        <g class="anim-flame" style="transform-origin: 53px 80px;">
          <path d="M 53,24 C 36,40 40,78 53,78 C 66,78 70,40 53,24 Z" fill="${flameOuterFill}"/>
          <path d="M 53,46 C 45,56 47,78 53,78 C 59,78 61,56 53,46 Z" fill="${flameCoreFill}" class="anim-flame-inner" style="transform-origin: 53px 78px;"/>
        </g>
        ${sootParticles}

        <!-- Spatula -->
        <g style="transition: transform 0.8s ease; transform: translate(${performed ? '12px, 0px' : '-6px, 0px'});">
          <line x1="2" y1="56" x2="44" y2="56" stroke="url(#spatulaMetal_${tubeId})" stroke-width="3.2" stroke-linecap="round"/>
          <ellipse cx="44" cy="56" rx="6.5" ry="3.2" fill="url(#spatulaMetal_${tubeId})" stroke="#475569" stroke-width="0.6"/>
          ${spatulaCombustion}
        </g>
        <text x="53" y="146" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">Spatula Ignition</text>
      </svg>
    `;
  }

  // 2. Litmus Paper Strips Dipping into Fluid
  function renderLitmusSvg(options = {}) {
    const { sampleKey = 'org_alkene', performed = false, tubeId = 'lit_1' } = options;
    const sample = resolveSample(sampleKey);
    const isAcidic = sample.fgKey === 'alkanoic_acid' || sample.litmus?.isAcidic;

    const blueStripTop = '#3B82F6';
    const blueStripBottom = performed ? (isAcidic ? '#EF4444' : '#3B82F6') : '#3B82F6';
    const redStripColor = '#EF4444';
    const liquidColor = performed ? (isAcidic ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.45)') : 'rgba(56, 189, 248, 0.35)';

    return `
      <svg width="100" height="150" viewBox="0 0 100 150">
        ${getCommonDefs(tubeId)}
        <!-- Clamp -->
        <g transform="translate(0, 0)">
          <rect x="4" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="0.8"/>
          <rect x="68" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="54" r="2.8" fill="url(#brassScrew_${tubeId})"/>
          <circle cx="86" cy="54" r="2.8" fill="url(#brassScrew_${tubeId})"/>
        </g>

        <!-- Glass Tube Body -->
        <path d="M 32,26 L 32,118 C 32,134 40,140 50,140 C 60,140 68,134 68,118 L 68,26 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="50" cy="25" rx="19" ry="3.5" fill="rgba(255,255,255,0.2)" stroke="#38BDF8" stroke-width="0.8"/>

        <!-- Sample Liquid Column -->
        <path d="M 33,70 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,70 Z" fill="${liquidColor}"/>
        <ellipse cx="50" cy="70" rx="17" ry="3.5" fill="${liquidColor}" opacity="0.85"/>

        <!-- Litmus Paper Strips Dipping into Fluid -->
        <g style="transition: transform 0.8s ease; transform: translate(0px, ${performed ? '18px' : '0px'});">
          <!-- Blue Litmus Strip -->
          <g transform="rotate(-4 43 50)">
            <rect x="40" y="10" width="7" height="60" rx="1" fill="${blueStripTop}"/>
            <rect x="40" y="52" width="7" height="18" rx="1" fill="${blueStripBottom}"/>
            <line x1="39" y1="52" x2="48" y2="52" stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
          </g>

          <!-- Red Litmus Strip -->
          <g transform="rotate(4 57 50)">
            <rect x="54" y="10" width="7" height="60" rx="1" fill="${redStripColor}"/>
            <rect x="54" y="52" width="7" height="18" rx="1" fill="#DC2626"/>
            <line x1="53" y1="52" x2="62" y2="52" stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
          </g>
        </g>

        <!-- Specular Highlight -->
        <path d="M 35,30 L 35,116 C 35,128 40,135 48,137" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>
        <text x="50" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">Litmus Strips</text>
      </svg>
    `;
  }

  // 3. Decolorization Reagent Test (Bromine water, Acidified KMnO4, K2Cr2O7)
  function renderDecolorizationSvg(options = {}) {
    const { sampleKey = 'org_alkene', testType = 'bromine', performed = false, tubeId = 'dec_1' } = options;
    const sample = resolveSample(sampleKey);

    let liquidColor = 'rgba(56, 189, 248, 0.35)';
    let meniscusColor = '#38BDF8';
    let dropperColor = '#EA580C';
    let testLabel = 'Reagent Tube';
    let showHeating = false;

    if (testType === 'bromine') {
      const isDecolorized = sample.bromine?.isDecolorized || sample.fgKey === 'alkene' || sample.fgKey === 'alkyne';
      liquidColor = performed ? (isDecolorized ? 'rgba(224, 242, 254, 0.3)' : 'rgba(220, 38, 38, 0.85)') : 'rgba(56, 189, 248, 0.35)';
      meniscusColor = performed ? (isDecolorized ? 'rgba(224, 242, 254, 0.5)' : '#DC2626') : '#38BDF8';
      dropperColor = '#DC2626';
      testLabel = 'Bromine Water';
    } else if (testType === 'kmno4') {
      const isDecolorized = sample.kmno4?.isDecolorized || sample.fgKey === 'alkene' || sample.fgKey === 'alkanol';
      liquidColor = performed ? (isDecolorized ? 'rgba(241, 245, 249, 0.3)' : 'rgba(168, 85, 247, 0.85)') : 'rgba(56, 189, 248, 0.35)';
      meniscusColor = performed ? (isDecolorized ? 'rgba(241, 245, 249, 0.5)' : '#9333EA') : '#38BDF8';
      dropperColor = '#9333EA';
      testLabel = 'KMnO₄ Tube';
    } else if (testType === 'dichromate') {
      const turnsGreen = sample.dichromate?.turnsGreen || sample.fgKey === 'alkanol';
      liquidColor = performed ? (turnsGreen ? '#059669' : '#EA580C') : '#F59E0B';
      meniscusColor = performed ? (turnsGreen ? '#10B981' : '#F97316') : '#FBBF24';
      dropperColor = '#EA580C';
      testLabel = 'K₂Cr₂O₇ / Heat';
      showHeating = true;
    }

    return `
      <svg width="100" height="150" viewBox="0 0 100 150">
        ${getCommonDefs(tubeId)}
        <!-- Clamp -->
        <g transform="translate(0, 0)">
          <rect x="4" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="0.8"/>
          <rect x="68" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="54" r="2.8" fill="url(#brassScrew_${tubeId})"/>
          <circle cx="86" cy="54" r="2.8" fill="url(#brassScrew_${tubeId})"/>
        </g>

        <!-- Glass Tube Body -->
        <path d="M 32,26 L 32,118 C 32,134 40,140 50,140 C 60,140 68,134 68,118 L 68,26 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="50" cy="25" rx="19" ry="3.5" fill="rgba(255,255,255,0.2)" stroke="#38BDF8" stroke-width="0.8"/>

        <!-- Reagent Liquid Column -->
        <path d="M 33,68 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,68 Z" fill="${liquidColor}"/>
        <ellipse cx="50" cy="68" rx="17" ry="3.5" fill="${meniscusColor}" opacity="0.85"/>
        <path d="M 33,68 Q 50,71 67,68" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>

        <!-- Dropper Assembly -->
        <g style="transition: transform 0.6s ease; transform: translate(0px, ${performed ? '4px' : '0px'});">
          <ellipse cx="50" cy="6" rx="6.5" ry="5" fill="#DC2626"/>
          <rect x="48.5" y="10" width="3" height="14" fill="rgba(255,255,255,0.7)" stroke="#EA580C" stroke-width="0.6"/>
          <path d="M 48.5,24 L 51.5,24 L 50.8,30 L 49.2,30 Z" fill="${dropperColor}" stroke="#B91C1C" stroke-width="0.6"/>
          ${!performed ? `<ellipse cx="50" cy="38" rx="2.4" ry="3.5" fill="${dropperColor}" class="anim-droplet"/>` : ''}
        </g>

        ${showHeating ? `
          <!-- Gentle Heating Flame -->
          <path d="M 50,132 C 44,138 46,148 50,148 C 54,148 56,138 50,132 Z" fill="url(#clearBlueFlame_outer_${tubeId})" class="anim-flame" style="transform-origin: 50px 148px;"/>
        ` : ''}

        <!-- Specular Glass Highlights -->
        <path d="M 35,30 L 35,116 C 35,128 40,135 48,137" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>
        <text x="50" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">${testLabel}</text>
      </svg>
    `;
  }

  // 4. Solid Sodium Carbonate / Hydrogen Carbonate Effervescence
  function renderEffervescenceSvg(options = {}) {
    const { sampleKey = 'org_alkene', performed = false, tubeId = 'eff_1' } = options;
    const sample = resolveSample(sampleKey);
    const hasEffervescence = sample.carbonate?.hasEffervescence || sample.fgKey === 'alkanoic_acid';

    const bubbles = performed && hasEffervescence ? `
      <g class="anim-bubble">
        <circle cx="42" cy="112" r="2.2" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="52" cy="100" r="2.8" fill="#FFFFFF" opacity="0.95"/>
        <circle cx="46" cy="88" r="2.4" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="56" cy="78" r="2.6" fill="#FFFFFF" opacity="0.85"/>
        <circle cx="39" cy="74" r="2.0" fill="#FFFFFF" opacity="0.8"/>
      </g>
      <ellipse cx="50" cy="67" rx="17" ry="4" fill="rgba(255,255,255,0.92)" class="anim-froth"/>
      <circle cx="44" cy="65" r="1.8" fill="#FFFFFF"/>
      <circle cx="54" cy="65" r="2.2" fill="#FFFFFF"/>
    ` : '';

    return `
      <svg width="100" height="150" viewBox="0 0 100 150">
        ${getCommonDefs(tubeId)}
        <!-- Clamp -->
        <g transform="translate(0, 0)">
          <rect x="4" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="0.8"/>
          <rect x="68" y="50" width="28" height="8" rx="2" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="54" r="2.8" fill="url(#brassScrew_${tubeId})"/>
          <circle cx="86" cy="54" r="2.8" fill="url(#brassScrew_${tubeId})"/>
        </g>

        <!-- Glass Tube Body -->
        <path d="M 32,26 L 32,118 C 32,134 40,140 50,140 C 60,140 68,134 68,118 L 68,26 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="50" cy="25" rx="19" ry="3.5" fill="rgba(255,255,255,0.2)" stroke="#38BDF8" stroke-width="0.8"/>

        <!-- Sample Liquid Column -->
        <path d="M 33,68 L 33,118 C 33,132 41,138 50,138 C 59,138 67,132 67,118 L 67,68 Z" fill="rgba(56, 189, 248, 0.35)"/>
        <ellipse cx="50" cy="68" rx="17" ry="3.5" fill="rgba(56, 189, 248, 0.6)"/>

        <!-- White Solid NaHCO3 Sediment at Base -->
        ${performed ? `
          <ellipse cx="50" cy="134" rx="14" ry="5" fill="#FFFFFF" opacity="0.95"/>
          <circle cx="43" cy="131" r="2.5" fill="#F8FAFC"/>
          <circle cx="56" cy="132" r="2.8" fill="#F8FAFC"/>
        ` : ''}

        ${bubbles}

        <!-- Spatula Delivering Powder -->
        <g style="transition: transform 0.6s ease; transform: translate(${performed ? '4px, 4px' : '0px, 0px'});">
          <line x1="20" y1="18" x2="48" y2="18" stroke="url(#spatulaMetal_${tubeId})" stroke-width="2.5"/>
          <ellipse cx="48" cy="18" rx="4" ry="2" fill="#94A3B8"/>
          <circle cx="48" cy="17" r="1.8" fill="#FFFFFF"/>
        </g>

        <!-- Specular Highlights -->
        <path d="M 35,30 L 35,116 C 35,128 40,135 48,137" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>
        <text x="50" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">NaHCO₃ Effervescence</text>
      </svg>
    `;
  }

  // 5. Esterification in Water Bath
  function renderEsterificationSvg(options = {}) {
    const { sampleKey = 'org_alcohol', performed = false, tubeId = 'est_1' } = options;
    const sample = resolveSample(sampleKey);
    const isFruity = sample.esterification?.isFruity || sample.fgKey === 'alkanol' || sample.fgKey === 'alkanoic_acid';
    const liquidColor = performed ? (isFruity ? 'rgba(192, 132, 252, 0.75)' : 'rgba(56, 189, 248, 0.45)') : 'rgba(56, 189, 248, 0.35)';

    const vapors = performed && isFruity ? `
      <g class="anim-vapor">
        <path d="M 44,22 Q 50,12 46,2" stroke="rgba(192, 132, 252, 0.85)" stroke-width="2" fill="none"/>
        <path d="M 56,24 Q 62,14 58,4" stroke="rgba(192, 132, 252, 0.85)" stroke-width="2" fill="none"/>
      </g>
    ` : '';

    return `
      <svg width="105" height="150" viewBox="0 0 105 150">
        ${getCommonDefs(tubeId)}
        <!-- Pyrex Beaker Water Bath -->
        <path d="M 16,68 L 16,132 C 16,138 24,142 34,142 L 72,142 C 82,142 90,138 90,132 L 90,68" fill="none" stroke="#64748B" stroke-width="1.8"/>
        <path d="M 18,84 L 18,132 C 18,136 24,140 34,140 L 72,140 C 82,140 88,136 88,132 L 88,84 Z" fill="rgba(56, 189, 248, 0.22)"/>
        <ellipse cx="53" cy="84" rx="35" ry="5" fill="rgba(56, 189, 248, 0.35)"/>

        <!-- Boiling Tube inside Water Bath -->
        <path d="M 40,26 L 40,118 C 40,128 46,134 53,134 C 60,134 66,128 66,118 L 66,26 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.2"/>
        <ellipse cx="53" cy="25" rx="15" ry="3.2" fill="rgba(255,255,255,0.2)" stroke="#38BDF8" stroke-width="0.8"/>

        <!-- Reaction Mixture -->
        <path d="M 41,56 L 41,118 C 41,126 47,132 53,132 C 59,132 65,126 65,118 L 65,56 Z" fill="${liquidColor}"/>
        <ellipse cx="53" cy="56" rx="12" ry="3" fill="${liquidColor}" opacity="0.9"/>
        ${vapors}

        <!-- Specular Highlight -->
        <path d="M 43,30 L 43,114 C 43,122 47,128 52,130" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity="0.65"/>
        <text x="53" y="148" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">Water Bath Ester</text>
      </svg>
    `;
  }

  // Unified Dispatcher: Renders any organic test apparatus based on test identifier or prompt
  function renderApparatusSvg(options = {}) {
    const {
      testId = '',
      sampleKey = 'org_alkene',
      performed = false,
      prompt = '',
      tubeId = `org_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const tId = String(testId).toLowerCase();
    const pStr = String(prompt).toLowerCase();

    if (tId.includes('ignit') || pStr.includes('ignit') || pStr.includes('flame') || pStr.includes('spatula') || pStr.includes('burn')) {
      return renderIgnitionSvg({ sampleKey, performed, tubeId });
    }
    if (tId.includes('litmus') || pStr.includes('litmus') || pStr.includes('ph')) {
      return renderLitmusSvg({ sampleKey, performed, tubeId });
    }
    if (tId.includes('bromine') || pStr.includes('bromine')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'bromine', performed, tubeId });
    }
    if (tId.includes('kmno4') || pStr.includes('kmno4') || pStr.includes('manganate') || pStr.includes('permanganate')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'kmno4', performed, tubeId });
    }
    if (tId.includes('dichromate') || pStr.includes('dichromate') || pStr.includes('cr2o7')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'dichromate', performed, tubeId });
    }
    if (tId.includes('nahco3') || tId.includes('carbonate') || pStr.includes('nahco3') || pStr.includes('carbonate') || pStr.includes('effervesc')) {
      return renderEffervescenceSvg({ sampleKey, performed, tubeId });
    }
    if (tId.includes('ester') || pStr.includes('ester') || pStr.includes('fruity')) {
      return renderEsterificationSvg({ sampleKey, performed, tubeId });
    }

    // Default fallback: Decolorization / generic organic tube
    return renderDecolorizationSvg({ sampleKey, testType: 'generic', performed, tubeId });
  }

  // ── 4. Reaction State & Multi-Stage Action Button Resolver ─────
  function resolveOrganicReactionState(sampleKey, testId, performed = false, prompt = '') {
    const sample = resolveSample(sampleKey);
    const tId = String(testId).toLowerCase();
    const pStr = String(prompt).toLowerCase();

    let statusLabel = 'Ready to test';
    let soundType = 'drop';

    if (tId.includes('ignit') || pStr.includes('ignit') || pStr.includes('flame')) {
      const isSooty = sample.isSooty || sample.fgKey === 'alkene' || sample.fgKey === 'alkyne';
      statusLabel = performed ? (isSooty ? 'Ignition: Luminous smoky sooty yellow flame' : 'Ignition: Clear non-sooty pale blue flame') : 'Awaiting Bunsen Flame';
      soundType = 'flame';
    } else if (tId.includes('litmus') || pStr.includes('litmus')) {
      const isAcidic = sample.fgKey === 'alkanoic_acid';
      statusLabel = performed ? (isAcidic ? 'Litmus: Moist blue litmus turns red (Acidic, pH 3)' : 'Litmus: Neutral, no colour change (pH 7)') : 'Awaiting Litmus Strips';
      soundType = 'drop';
    } else if (tId.includes('bromine') || pStr.includes('bromine')) {
      const isDecolorized = sample.bromine?.isDecolorized || sample.fgKey === 'alkene' || sample.fgKey === 'alkyne';
      statusLabel = performed ? (isDecolorized ? 'Bromine Water: Rapidly decolourized to colourless' : 'Bromine Water: Reddish-brown colour persists') : 'Awaiting Bromine Water';
      soundType = 'drop';
    } else if (tId.includes('kmno4') || pStr.includes('kmno4')) {
      const isDecolorized = sample.kmno4?.isDecolorized || sample.fgKey === 'alkene' || sample.fgKey === 'alkanol';
      statusLabel = performed ? (isDecolorized ? 'KMnO₄: Purple acidified KMnO₄ rapidly decolourized' : 'KMnO₄: Purple colour remains unchanged') : 'Awaiting KMnO₄';
      soundType = 'drop';
    } else if (tId.includes('dichromate') || pStr.includes('dichromate')) {
      const turnsGreen = sample.dichromate?.turnsGreen || sample.fgKey === 'alkanol';
      statusLabel = performed ? (turnsGreen ? 'K₂Cr₂O₇: Orange turns emerald green (Cr³⁺ reduced)' : 'K₂Cr₂O₇: Orange colour persists') : 'Awaiting K₂Cr₂O₇';
      soundType = 'flame';
    } else if (tId.includes('nahco3') || tId.includes('carbonate') || pStr.includes('nahco3')) {
      const hasEff = sample.carbonate?.hasEffervescence || sample.fgKey === 'alkanoic_acid';
      statusLabel = performed ? (hasEff ? 'NaHCO₃: Vigorous effervescence of CO₂ gas' : 'NaHCO₃: No effervescence observed') : 'Awaiting Solid NaHCO₃';
      soundType = hasEff ? 'effervescence' : 'drop';
    } else {
      statusLabel = performed ? 'Test Completed: Observation Recorded' : 'Ready to test';
    }

    return {
      sample,
      performed,
      statusLabel,
      soundType
    };
  }

  function getOrganicActions(testId, prompt, performed = false) {
    if (!performed) {
      return [
        { stage: 'done', label: '🧪 Perform Test Procedure', cls: 'btn-perform-test' }
      ];
    } else {
      return [
        { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
        { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
      ];
    }
  }

  // ── 5. Public API Export ───────────────────────────────────────
  const OrganicBenchCore = {
    SAMPLES,
    resolveSample,
    renderIgnitionSvg,
    renderLitmusSvg,
    renderDecolorizationSvg,
    renderEffervescenceSvg,
    renderEsterificationSvg,
    renderApparatusSvg,
    resolveOrganicReactionState,
    getOrganicActions,
    playFlameSound,
    playEffervescenceSound,
    playDropSplashSound,
    playOrganicSound
  };

  global.OrganicBenchCore = OrganicBenchCore;

})(typeof window !== 'undefined' ? window : this);

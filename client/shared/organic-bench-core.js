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
    },
    'org_methanoic_acid': {
      key: 'org_methanoic_acid',
      altKeys: ['METHANOIC ACID', 'FORMIC ACID', 'HCOOH', 'METHANOIC'],
      label: 'Sample F (Liquid)',
      name: 'Methanoic Acid (HCOOH)',
      compoundKey: 'methanoic_acid',
      fgKey: 'alkanoic_acid',
      fgName: 'Alkanoic Acid with Aldehydic Reducing Group',
      isSooty: false,
      solubility: {
        isMiscible: true,
        obs: 'Miscible. Dissolves completely in water to form single phase.',
        inf: 'Polar carboxylic acid present',
        status: 'Miscible (Single Clear Solution)'
      },
      ignition: {
        isSooty: false,
        obs: 'Burns with a non-sooty, clear pale blue flame.',
        inf: 'Saturated organic compound present',
        status: 'Non-Luminous Clear Pale Blue Flame'
      },
      bromine: {
        isDecolorized: false,
        obs: 'Bromine water remains reddish-brown.',
        inf: 'Unsaturation absent',
        status: 'Reddish-Brown Colour Persists'
      },
      kmno4: {
        isDecolorized: true,
        obs: 'Purple acidified KMnO₄ is decolourized with gentle effervescence of CO₂ gas.',
        inf: 'Methanoic acid reduces KMnO₄ due to the unique formyl (—CHO) hydrogen structure',
        status: 'KMnO₄ Decolourized with Gas Bubbling (CO₂)'
      },
      dichromate: {
        turnsGreen: false,
        obs: 'Acidified potassium dichromate(VI) remains orange.',
        inf: 'Alkanol absent',
        status: 'Orange Colour Persists'
      },
      carbonate: {
        hasEffervescence: true,
        obs: 'Vigorous effervescence of a colourless gas that forms a white precipitate with limewater (CO₂).',
        inf: 'Carboxylic acid (-COOH) confirmed',
        status: 'Vigorous Effervescence of CO₂ Gas'
      },
      esterification: {
        isFruity: true,
        obs: 'Sweet fruity smell of ethyl methanoate formed.',
        inf: 'Carboxylic acid confirmed',
        status: 'Pleasant Fruity Aroma (Ethyl Methanoate)'
      },
      litmus: {
        isAcidic: true,
        obs: 'Moist blue litmus paper turns red; red litmus remains red.',
        inf: 'Carboxylic acid present',
        status: 'Acidic (Moist Blue Litmus Turns Red, pH 2)'
      }
    },
    'org_benzoic_acid': {
      key: 'org_benzoic_acid',
      altKeys: ['BENZOIC ACID', 'C6H5COOH', 'BENZOIC'],
      label: 'Sample G (Solid)',
      name: 'Benzoic Acid (C₆H₅COOH)',
      compoundKey: 'benzoic_acid',
      fgKey: 'alkanoic_acid',
      fgName: 'Aromatic Carboxylic Acid (Ar-COOH)',
      isSooty: true,
      solubility: {
        isMiscible: false,
        obs: 'Sparingly soluble in cold water; dissolves on heating and recrystallizes on cooling.',
        inf: 'Aromatic carboxylic acid present',
        status: 'Sparingly Soluble Cold / Dissolves Hot'
      },
      ignition: {
        isSooty: true,
        obs: 'Melts and burns with a luminous, highly smoky and sooty yellow flame leaving carbon residue.',
        inf: 'Aromatic compound / high C:H ratio present',
        status: 'Luminous Smoky Sooty Flame (Aromatic Ring)'
      },
      bromine: {
        isDecolorized: false,
        obs: 'Bromine water remains yellow/orange without catalyst.',
        inf: 'Aliphatic alkene / alkyne absent; stable aromatic benzene ring',
        status: 'Bromine Colour Persists (Yellow/Orange)'
      },
      kmno4: {
        isDecolorized: false,
        obs: 'Purple acidified KMnO₄ remains purple.',
        inf: 'Aromatic carboxylic acid resistant to mild oxidation',
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
        obs: 'Vigorous effervescence of a colourless gas that turns limewater milky (CO₂).',
        inf: 'Carboxylic acid (-COOH) confirmed present',
        status: 'Vigorous Effervescence of CO₂ Gas'
      },
      esterification: {
        isFruity: true,
        obs: 'Pleasant fruity odour of ethyl benzoate formed.',
        inf: 'Carboxylic acid confirmed',
        status: 'Pleasant Fruity Smell (Ethyl Benzoate)'
      },
      litmus: {
        isAcidic: true,
        obs: 'Moist blue litmus paper turns red; red litmus remains red.',
        inf: 'Carboxylic acid present',
        status: 'Acidic (Moist Blue Litmus Turns Red, pH 3)'
      }
    }
  };

  function resolveSample(query) {
    if (!query) return SAMPLES.org_alkene;
    if (typeof query === 'object' && query.key && SAMPLES[query.key]) return SAMPLES[query.key];
    const norm = String(query).toUpperCase().trim();

    // 1. Exact matches first (key, compoundKey, name, exact altKey)
    for (const key of Object.keys(SAMPLES)) {
      const s = SAMPLES[key];
      if (s.key.toUpperCase() === norm) return s;
      if (s.name.toUpperCase() === norm) return s;
      if (s.compoundKey && s.compoundKey.toUpperCase() === norm) return s;
      if (s.altKeys && s.altKeys.some(alt => alt.toUpperCase() === norm)) return s;
    }

    // 2. Specific compound checks before generic fallbacks
    if (norm.includes('METHANOIC') || norm.includes('FORMIC') || norm.includes('HCOOH')) return SAMPLES.org_methanoic_acid;
    if (norm.includes('BENZOIC') || norm.includes('C6H5COOH')) return SAMPLES.org_benzoic_acid;
    if (norm.includes('CYCLOHEXENE')) return SAMPLES.org_alkene;
    if (norm.includes('CYCLOHEXANE')) return SAMPLES.org_alkane;
    if (norm.includes('BUTAN')) return SAMPLES.org_butanol;
    if (norm.includes('PROPAN')) return SAMPLES.org_alcohol;

    // 3. Name or word-boundary altKey matching
    for (const key of Object.keys(SAMPLES)) {
      const s = SAMPLES[key];
      if (s.name.toUpperCase().includes(norm)) return s;
    }

    // 4. Broad functional group fallbacks
    if (norm.includes('ACID') || norm.includes('COOH')) return SAMPLES.org_acid;
    if (norm.includes('ALCOHOL') || norm.includes('OL') || norm.includes('ETHANOL')) return SAMPLES.org_alcohol;
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

        <!-- Glass Materials & Refraction -->
        <linearGradient id="pyrexGlass_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.48)"/>
          <stop offset="12%" stop-color="rgba(255,255,255,0.12)"/>
          <stop offset="50%" stop-color="rgba(255,255,255,0.03)"/>
          <stop offset="88%" stop-color="rgba(255,255,255,0.08)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.42)"/>
        </linearGradient>
        <linearGradient id="glassWallRefract_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.6"/>
          <stop offset="20%" stop-color="#FFFFFF" stop-opacity="0.1"/>
          <stop offset="80%" stop-color="#FFFFFF" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.5"/>
        </linearGradient>

        <!-- Bunsen Flames & Temperature Zones -->
        <linearGradient id="clearBlueFlame_outer_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#1D4ED8" stop-opacity="0.95"/>
          <stop offset="40%" stop-color="#0284C7" stop-opacity="0.88"/>
          <stop offset="75%" stop-color="#38BDF8" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#BAE6FD" stop-opacity="0.15"/>
        </linearGradient>
        <linearGradient id="clearBlueFlame_inner_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0284C7" stop-opacity="0.98"/>
          <stop offset="45%" stop-color="#67E8F9" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="sootyYellowFlame_outer_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#D97706" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="#F59E0B" stop-opacity="0.98"/>
          <stop offset="70%" stop-color="#FBBF24" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#FEF08A" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="sootyYellowFlame_inner_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.98"/>
          <stop offset="60%" stop-color="#FEF08A" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.98"/>
        </linearGradient>

        <!-- Stainless Steel Spatula & Metal Highlights -->
        <linearGradient id="spatulaMetal_${tubeId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC"/>
          <stop offset="30%" stop-color="#CBD5E1"/>
          <stop offset="70%" stop-color="#94A3B8"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
        <linearGradient id="spatulaGlow_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#EF4444"/>
          <stop offset="50%" stop-color="#F97316"/>
          <stop offset="100%" stop-color="#FEF08A"/>
        </linearGradient>
        <linearGradient id="castIronBase_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1E293B"/>
          <stop offset="35%" stop-color="#334155"/>
          <stop offset="70%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <linearGradient id="burnerBarrel_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="30%" stop-color="#94A3B8"/>
          <stop offset="60%" stop-color="#64748B"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
        <linearGradient id="amberHose_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#78350F"/>
          <stop offset="40%" stop-color="#B45309"/>
          <stop offset="80%" stop-color="#D97706"/>
          <stop offset="100%" stop-color="#78350F"/>
        </linearGradient>
        <linearGradient id="dropperBulb_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#EF4444"/>
          <stop offset="40%" stop-color="#DC2626"/>
          <stop offset="100%" stop-color="#991B1B"/>
        </linearGradient>
        <linearGradient id="capillaryWettingGrad_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#DC2626"/>
          <stop offset="60%" stop-color="#DC2626"/>
          <stop offset="100%" stop-color="#2563EB"/>
        </linearGradient>
      </defs>
    `;
  }

  // 1. Ignition on Stainless Steel Spatula over Roaring Bunsen Flame
  function renderIgnitionSvg(options = {}) {
    const { sampleKey = 'org_alkene', performed = false, tubeId = 'ign_1' } = options;
    const sample = resolveSample(sampleKey);
    const isSooty = sample.isSooty || sample.fgKey === 'alkene' || sample.fgKey === 'alkyne';

    const flameOuterFill = isSooty ? `url(#sootyYellowFlame_outer_${tubeId})` : `url(#clearBlueFlame_outer_${tubeId})`;
    const flameCoreFill = isSooty ? `url(#sootyYellowFlame_inner_${tubeId})` : `url(#clearBlueFlame_inner_${tubeId})`;

    // Billowing carbon soot particulate clouds
    const sootParticles = performed && isSooty ? `
      <g class="anim-soot">
        <circle cx="82" cy="18" r="4.5" fill="#0F172A" opacity="0.9"/>
        <circle cx="92" cy="10" r="6.0" fill="#1E293B" opacity="0.85"/>
        <circle cx="75" cy="0" r="7.5" fill="#020617" opacity="0.75"/>
        <circle cx="95" cy="-12" r="9.0" fill="#09090B" opacity="0.6"/>
        <circle cx="78" cy="-24" r="11.0" fill="#000000" opacity="0.45"/>
        <circle cx="88" cy="-38" r="13.5" fill="#000000" opacity="0.3"/>
      </g>
    ` : '';

    // Convection hot air shimmer for clean non-sooty combustion
    const heatHaze = performed && !isSooty ? `
      <g class="anim-steam" opacity="0.75">
        <path d="M 80,26 Q 84,16 81,6" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" fill="none"/>
        <path d="M 89,28 Q 93,18 90,8" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" fill="none"/>
      </g>
    ` : '';

    // Active flame behavior
    const flameMarkup = performed ? `
      <g class="anim-flame" style="transform-origin: 85px 105px;">
        <path d="M 85,${isSooty ? '22' : '34'} C ${isSooty ? '58,42 64,105 85,105 C 106,105 112,42 85,22' : '68,52 72,105 85,105 C 98,105 102,52 85,34'} Z" fill="${flameOuterFill}"/>
        <path d="M 85,${isSooty ? '48' : '62'} C ${isSooty ? '74,62 76,105 85,105 C 94,105 96,62 85,48' : '77,74 78,105 85,105 C 92,105 93,74 85,62'} Z" fill="${flameCoreFill}" class="anim-flame-inner" style="transform-origin: 85px 105px;"/>
      </g>
    ` : `
      <!-- Idling Bunsen Blue Pilot Flame -->
      <g class="anim-flame" style="transform-origin: 85px 105px;">
        <path d="M 85,78 C 79,88 80,105 85,105 C 90,105 91,88 85,78 Z" fill="url(#clearBlueFlame_outer_${tubeId})"/>
        <path d="M 85,88 C 82,94 83,105 85,105 C 87,105 88,94 85,88 Z" fill="url(#clearBlueFlame_inner_${tubeId})"/>
      </g>
    `;

    // Spatula insertion & sample combustion
    const spatulaMarkup = performed ? `
      <g style="transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); transform: translate(8px, -6px);">
        <!-- Stainless Steel Spatula Blade entering flame -->
        <path d="M 12,98 L 74,89 L 84,86 C 89,84 93,87 91,91 C 89,94 82,95 75,95 L 12,104 Z" fill="url(#spatulaMetal_${tubeId})" stroke="#475569" stroke-width="0.8"/>
        <!-- Cherry-Red Heated Spatula Tip -->
        <path d="M 74,89 L 84,86 C 89,84 93,87 91,91 C 89,94 82,95 75,95 Z" fill="url(#spatulaGlow_${tubeId})" opacity="0.85"/>
        ${isSooty ? `
          <!-- Carbonaceous Black Soot Residue on Spoon -->
          <ellipse cx="84" cy="89" rx="5.5" ry="2.8" fill="#09090B" opacity="0.95"/>
        ` : ''}
      </g>
    ` : `
      <g style="transition: transform 0.8s ease; transform: translate(-10px, 4px);">
        <!-- Spatula holding unburned organic sample liquid/crystal -->
        <path d="M 8,98 L 64,91 L 74,88 C 78,86 82,89 80,92 C 78,95 71,96 65,96 L 8,103 Z" fill="url(#spatulaMetal_${tubeId})" stroke="#475569" stroke-width="0.8"/>
        <circle cx="73" cy="91" r="2.8" fill="#38BDF8" opacity="0.95"/>
      </g>
    `;

    return `
      <svg width="180" height="215" viewBox="0 0 180 215" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
        ${getCommonDefs(tubeId)}

        <!-- Heavy Cast-Iron Bunsen Burner Base -->
        <path d="M 48,188 L 122,188 L 114,174 L 56,174 Z" fill="url(#castIronBase_${tubeId})" stroke="#0F172A" stroke-width="1.2"/>
        <rect x="44" y="188" width="82" height="12" rx="3" fill="url(#castIronBase_${tubeId})" stroke="#0F172A" stroke-width="1.2"/>
        <line x1="46" y1="189" x2="124" y2="189" stroke="#94A3B8" stroke-width="0.75" opacity="0.6"/>

        <!-- Gas Inlet Spout & Amber Tubing -->
        <path d="M 98,182 Q 128,182 148,202" fill="none" stroke="url(#amberHose_${tubeId})" stroke-width="6.5" stroke-linecap="round"/>
        <rect x="94" y="179" width="10" height="6" rx="1.5" fill="#CA8A04" stroke="#713F12" stroke-width="0.6"/>

        <!-- Burner Barrel (Chrome/Brass Chimney) -->
        <rect x="80" y="105" width="10" height="70" fill="url(#burnerBarrel_${tubeId})" stroke="#334155" stroke-width="0.8"/>
        <line x1="82" y1="106" x2="82" y2="174" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>

        <!-- Air Collar Ring with Air Intake Hole -->
        <rect x="78" y="156" width="14" height="11" rx="2" fill="#CA8A04" stroke="#713F12" stroke-width="0.8"/>
        <circle cx="85" cy="161.5" r="2.8" fill="#09090B"/>

        <!-- Flame Layer & Smoke -->
        ${flameMarkup}
        ${sootParticles}
        ${heatHaze}

        <!-- Spatula Layer -->
        ${spatulaMarkup}

        <!-- Apparatus Label -->
        <text x="90" y="210" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">Spatula Ignition Test</text>
      </svg>
    `;
  }

  // 2. Moist Litmus Paper Strips (Blue & Red) with Capillary Fluid Wetting
  function renderLitmusSvg(options = {}) {
    const { sampleKey = 'org_alkene', performed = false, tubeId = 'lit_1' } = options;
    const sample = resolveSample(sampleKey);
    const isAcidic = sample.fgKey === 'alkanoic_acid' || sample.litmus?.isAcidic;

    const liquidColor = performed ? (isAcidic ? 'rgba(239, 68, 68, 0.28)' : 'rgba(56, 189, 248, 0.25)') : 'rgba(56, 189, 248, 0.28)';

    // Blue litmus wetting: turns red if acidic, else stays blue
    const blueLitmusWettingFill = performed && isAcidic ? `url(#capillaryWettingGrad_${tubeId})` : '#2563EB';

    return `
      <svg width="160" height="215" viewBox="0 0 160 215" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.35));">
        ${getCommonDefs(tubeId)}

        <!-- Wooden Clamp -->
        <g transform="translate(0, 0)">
          <rect x="8" y="78" width="46" height="12" rx="2.5" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="1"/>
          <rect x="106" y="78" width="46" height="12" rx="2.5" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="1"/>
          <circle cx="24" cy="84" r="4.2" fill="url(#brassScrew_${tubeId})" stroke="#713F12" stroke-width="0.8"/>
          <circle cx="136" cy="84" r="4.2" fill="url(#brassScrew_${tubeId})" stroke="#713F12" stroke-width="0.8"/>
        </g>

        <!-- Borosilicate Test Tube Glass Outer Shell -->
        <path d="M 54,32 L 54,175 C 54,196 66,204 80,204 C 94,204 106,196 106,175 L 106,32 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.3"/>
        <path d="M 56,33 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,33" fill="none" stroke="url(#glassWallRefract_${tubeId})" stroke-width="1.2"/>

        <!-- Rim Caustic Highlight -->
        <ellipse cx="80" cy="32" rx="26" ry="4.5" fill="rgba(255,255,255,0.22)" stroke="#38BDF8" stroke-width="1"/>
        <ellipse cx="80" cy="32" rx="23" ry="3.5" fill="rgba(15,23,42,0.18)"/>

        <!-- Frosted Marking Patch & Graduations -->
        <rect x="67" y="58" width="26" height="14" rx="2" fill="rgba(255,255,255,0.3)"/>
        <text x="80" y="68" font-size="6.5" font-family="'JetBrains Mono', monospace" font-weight="800" fill="rgba(15,23,42,0.65)" text-anchor="middle">PYREX®</text>
        <g stroke="#FFFFFF" stroke-width="0.8" opacity="0.5">
          <line x1="102" y1="92" x2="94" y2="92"/><text x="92" y="94" font-size="5" fill="#FFFFFF" text-anchor="end">10ml</text>
          <line x1="102" y1="122" x2="96" y2="122"/>
          <line x1="102" y1="148" x2="94" y2="148"/><text x="92" y="150" font-size="5" fill="#FFFFFF" text-anchor="end">5ml</text>
        </g>

        <!-- Sample Liquid Column -->
        <path d="M 56,115 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,115 Z" fill="${liquidColor}"/>
        <!-- Curved Meniscus -->
        <ellipse cx="80" cy="115" rx="24" ry="4" fill="${liquidColor}"/>
        <path d="M 56,115 Q 80,120 104,115" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.2"/>

        <!-- Litmus Paper Strips Dipping into Liquid -->
        <g style="transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); transform: translate(0px, ${performed ? '22px' : '0px'});">
          <!-- Blue Litmus Paper Strip -->
          <g transform="rotate(-3 70 80)">
            <rect x="64" y="18" width="10" height="72" rx="1.5" fill="#2563EB"/>
            <rect x="64" y="90" width="10" height="38" rx="1.5" fill="${blueLitmusWettingFill}"/>
            <line x1="63" y1="90" x2="75" y2="90" stroke="rgba(255,255,255,0.7)" stroke-width="0.75"/>
          </g>

          <!-- Red Litmus Paper Strip -->
          <g transform="rotate(3 90 80)">
            <rect x="86" y="18" width="10" height="72" rx="1.5" fill="#E11D48"/>
            <rect x="86" y="90" width="10" height="38" rx="1.5" fill="#DC2626"/>
            <line x1="85" y1="90" x2="97" y2="90" stroke="rgba(255,255,255,0.7)" stroke-width="0.75"/>
          </g>
        </g>

        <!-- Strip Identification Labels -->
        <text x="64" y="16" font-size="6.5" font-weight="800" fill="#3B82F6" text-anchor="middle">Blue</text>
        <text x="96" y="16" font-size="6.5" font-weight="800" fill="#EF4444" text-anchor="middle">Red</text>

        <!-- Vertical Glass Wall Specular Highlights -->
        <path d="M 58,36 L 58,170 C 58,185 66,195 78,199" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
        <line x1="102" y1="40" x2="102" y2="165" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>

        <!-- Apparatus Label -->
        <text x="80" y="212" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">Moist Litmus Paper Test</text>
      </svg>
    `;
  }

  // 3. Decolorization Reagents (Bromine Water, Acidified KMnO₄, Acidified K₂Cr₂O₇)
  function renderDecolorizationSvg(options = {}) {
    const { sampleKey = 'org_alkene', testType = 'bromine', performed = false, tubeId = 'dec_1' } = options;
    const sample = resolveSample(sampleKey);

    let liquidColor = 'rgba(56, 189, 248, 0.28)';
    let meniscusColor = 'rgba(56, 189, 248, 0.45)';
    let dropperColor = '#DC2626';
    let testLabel = 'Reagent Tube';
    let showHeating = false;
    let halogenVapor = '';
    let schlierenWaves = '';

    if (testType === 'bromine') {
      const isDecolorized = sample.bromine?.isDecolorized || sample.fgKey === 'alkene' || sample.fgKey === 'alkyne';
      liquidColor = performed ? (isDecolorized ? 'rgba(240, 249, 255, 0.22)' : 'rgba(185, 28, 28, 0.88)') : 'rgba(217, 119, 6, 0.82)';
      meniscusColor = performed ? (isDecolorized ? 'rgba(240, 249, 255, 0.5)' : '#B91C1C') : '#D97706';
      dropperColor = '#B91C1C';
      testLabel = 'Bromine Water (Br₂/H₂O)';

      if (!performed || !isDecolorized) {
        halogenVapor = `
          <!-- Halogen Bromine Dense Vapor -->
          <ellipse cx="80" cy="108" rx="23" ry="8" fill="rgba(220, 38, 38, 0.22)"/>
        `;
      } else {
        schlierenWaves = `
          <!-- Bleached Colorless Solution with Schlieren Density Waves -->
          <path d="M 62,130 Q 80,135 98,130" stroke="rgba(255,255,255,0.45)" stroke-width="1.0" fill="none"/>
          <path d="M 64,152 Q 80,157 96,152" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none"/>
        `;
      }
    } else if (testType === 'kmno4') {
      const isMethanoic = sample.compoundKey === 'methanoic_acid' || sample.key === 'org_methanoic_acid';
      const isDecolorized = sample.kmno4?.isDecolorized || sample.fgKey === 'alkene' || sample.fgKey === 'alkanol' || isMethanoic;
      liquidColor = performed ? (isDecolorized ? 'rgba(240, 249, 255, 0.22)' : 'rgba(107, 33, 168, 0.92)') : 'rgba(107, 33, 168, 0.92)';
      meniscusColor = performed ? (isDecolorized ? 'rgba(240, 249, 255, 0.5)' : '#7E22CE') : '#7E22CE';
      dropperColor = '#6B21A8';
      testLabel = 'Acidified KMnO₄';

      if (performed && isDecolorized) {
        schlierenWaves = `
          <path d="M 62,130 Q 80,135 98,130" stroke="rgba(255,255,255,0.45)" stroke-width="1.0" fill="none"/>
          <path d="M 64,155 Q 80,160 96,155" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none"/>
          ${isMethanoic ? `
            <!-- CO2 Bubbles from Formic Acid Oxidation -->
            <g class="anim-bubbles">
              <circle cx="74" cy="170" r="2.2" fill="rgba(255,255,255,0.7)" stroke="#38BDF8" stroke-width="0.5"/>
              <circle cx="86" cy="160" r="2.8" fill="rgba(255,255,255,0.7)" stroke="#38BDF8" stroke-width="0.5"/>
              <circle cx="78" cy="145" r="1.8" fill="rgba(255,255,255,0.7)" stroke="#38BDF8" stroke-width="0.5"/>
              <circle cx="82" cy="132" r="2.5" fill="rgba(255,255,255,0.7)" stroke="#38BDF8" stroke-width="0.5"/>
            </g>
          ` : ''}
        `;
      }
    } else if (testType === 'dichromate') {
      const turnsGreen = sample.dichromate?.turnsGreen || sample.fgKey === 'alkanol';
      liquidColor = performed ? (turnsGreen ? 'rgba(5, 150, 105, 0.92)' : 'rgba(234, 88, 12, 0.88)') : 'rgba(234, 88, 12, 0.88)';
      meniscusColor = performed ? (turnsGreen ? '#10B981' : '#F97316') : '#F97316';
      dropperColor = '#EA580C';
      testLabel = 'K₂Cr₂O₇ / Heat';
      showHeating = true;

      if (performed && turnsGreen) {
        schlierenWaves = `
          <!-- Cr³⁺ Emerald Green Complex Glow -->
          <ellipse cx="80" cy="155" rx="18" ry="12" fill="rgba(16, 185, 129, 0.35)"/>
        `;
      }
    }

    return `
      <svg width="160" height="215" viewBox="0 0 160 215" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.35));">
        ${getCommonDefs(tubeId)}

        <!-- Wooden Clamp -->
        <g transform="translate(0, 0)">
          <rect x="8" y="76" width="46" height="12" rx="2.5" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="1"/>
          <rect x="106" y="76" width="46" height="12" rx="2.5" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="1"/>
          <circle cx="24" cy="82" r="4.2" fill="url(#brassScrew_${tubeId})" stroke="#713F12" stroke-width="0.8"/>
          <circle cx="136" cy="82" r="4.2" fill="url(#brassScrew_${tubeId})" stroke="#713F12" stroke-width="0.8"/>
        </g>

        <!-- Borosilicate Test Tube Glass Body -->
        <path d="M 54,32 L 54,175 C 54,196 66,204 80,204 C 94,204 106,196 106,175 L 106,32 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.3"/>
        <path d="M 56,33 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,33" fill="none" stroke="url(#glassWallRefract_${tubeId})" stroke-width="1.2"/>

        <!-- Rim -->
        <ellipse cx="80" cy="32" rx="26" ry="4.5" fill="rgba(255,255,255,0.22)" stroke="#38BDF8" stroke-width="1"/>

        <!-- Frosted Patch & Graduations -->
        <rect x="67" y="56" width="26" height="14" rx="2" fill="rgba(255,255,255,0.3)"/>
        <text x="80" y="66" font-size="6.5" font-family="'JetBrains Mono', monospace" font-weight="800" fill="rgba(15,23,42,0.65)" text-anchor="middle">PYREX®</text>
        <g stroke="#FFFFFF" stroke-width="0.8" opacity="0.5">
          <line x1="102" y1="90" x2="94" y2="90"/>
          <line x1="102" y1="120" x2="96" y2="120"/>
          <line x1="102" y1="148" x2="94" y2="148"/>
        </g>

        <!-- Reagent Fluid Column -->
        <path d="M 56,114 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,114 Z" fill="${liquidColor}"/>
        <!-- Fluid Meniscus & Caustic Highlight -->
        <ellipse cx="80" cy="114" rx="24" ry="4" fill="${meniscusColor}" opacity="0.9"/>
        <path d="M 56,114 Q 80,119 104,114" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>

        ${halogenVapor}
        ${schlierenWaves}

        <!-- Precision Dropper Pipette -->
        <g style="transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); transform: translate(0px, ${performed ? '6px' : '0px'});">
          <ellipse cx="80" cy="8" rx="8.5" ry="6.5" fill="url(#dropperBulb_${tubeId})"/>
          <rect x="78" y="14" width="4" height="20" fill="rgba(255,255,255,0.7)" stroke="#64748B" stroke-width="0.7"/>
          <path d="M 78,34 L 82,34 L 81,42 L 79,42 Z" fill="${dropperColor}" stroke="#991B1B" stroke-width="0.6"/>
          ${!performed ? `
            <!-- Falling Droplet -->
            <ellipse cx="80" cy="54" rx="2.5" ry="3.8" fill="${dropperColor}" class="anim-droplet"/>
          ` : ''}
        </g>

        ${showHeating ? `
          <!-- Gentle Bunsen Heating Flame warming hemispherical base -->
          <g class="anim-flame" style="transform-origin: 80px 208px;">
            <path d="M 80,188 C 72,194 74,208 80,208 C 86,208 88,194 80,188 Z" fill="url(#clearBlueFlame_outer_${tubeId})"/>
            <path d="M 80,195 C 76,198 77,208 80,208 C 83,208 84,198 80,195 Z" fill="url(#clearBlueFlame_inner_${tubeId})"/>
          </g>
          <g class="anim-vapor" opacity="0.8">
            <path d="M 74,28 Q 70,16 73,6" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" fill="none"/>
            <path d="M 86,30 Q 90,18 87,8" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" fill="none"/>
          </g>
        ` : ''}

        <!-- Specular Glass Highlights -->
        <path d="M 58,36 L 58,170 C 58,185 66,195 78,199" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
        <line x1="102" y1="40" x2="102" y2="165" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>

        <!-- Apparatus Label -->
        <text x="80" y="212" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">${testLabel}</text>
      </svg>
    `;
  }

  // 4. Solid Sodium Carbonate / Hydrogen Carbonate (NaHCO₃) Effervescence Test
  function renderEffervescenceSvg(options = {}) {
    const { sampleKey = 'org_alkene', performed = false, tubeId = 'eff_1' } = options;
    const sample = resolveSample(sampleKey);
    const hasEffervescence = sample.carbonate?.hasEffervescence || sample.fgKey === 'alkanoic_acid';

    const bubblesAndFroth = performed && hasEffervescence ? `
      <!-- Vigorous CO2 Effervescence Bubble Cascade -->
      <g class="anim-bubble">
        <circle cx="68" cy="180" r="2.2" fill="#FFFFFF" opacity="0.95"/>
        <circle cx="88" cy="172" r="2.8" fill="#FFFFFF" opacity="0.95"/>
        <circle cx="74" cy="156" r="3.2" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="82" cy="144" r="2.4" fill="#FFFFFF" opacity="0.95"/>
        <circle cx="70" cy="132" r="2.0" fill="#FFFFFF" opacity="0.85"/>
        <circle cx="92" cy="124" r="2.6" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="76" cy="118" r="3.0" fill="#FFFFFF" opacity="0.95"/>
        <circle cx="84" cy="120" r="2.2" fill="#FFFFFF" opacity="0.9"/>
      </g>

      <!-- Billowing White Foam Froth Head at Meniscus -->
      <ellipse cx="80" cy="114" rx="24" ry="7" fill="rgba(255,255,255,0.95)" class="anim-froth"/>
      <circle cx="72" cy="111" r="3.5" fill="#FFFFFF"/>
      <circle cx="82" cy="109" r="4.2" fill="#FFFFFF"/>
      <circle cx="90" cy="112" r="3.2" fill="#FFFFFF"/>
      <circle cx="77" cy="108" r="2.8" fill="#F8FAFC"/>

      <!-- Escaping Invisible CO2 Gas Convection Shimmer -->
      <g class="anim-vapor" opacity="0.75">
        <path d="M 74,28 Q 70,16 73,6" stroke="rgba(255,255,255,0.6)" stroke-width="1.4" fill="none"/>
        <path d="M 86,30 Q 90,18 87,8" stroke="rgba(255,255,255,0.6)" stroke-width="1.4" fill="none"/>
      </g>
    ` : '';

    return `
      <svg width="160" height="215" viewBox="0 0 160 215" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.35));">
        ${getCommonDefs(tubeId)}

        <!-- Wooden Clamp -->
        <g transform="translate(0, 0)">
          <rect x="8" y="76" width="46" height="12" rx="2.5" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="1"/>
          <rect x="106" y="76" width="46" height="12" rx="2.5" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="1"/>
          <circle cx="24" cy="82" r="4.2" fill="url(#brassScrew_${tubeId})" stroke="#713F12" stroke-width="0.8"/>
          <circle cx="136" cy="82" r="4.2" fill="url(#brassScrew_${tubeId})" stroke="#713F12" stroke-width="0.8"/>
        </g>

        <!-- Borosilicate Test Tube Glass Body -->
        <path d="M 54,32 L 54,175 C 54,196 66,204 80,204 C 94,204 106,196 106,175 L 106,32 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.3"/>
        <path d="M 56,33 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,33" fill="none" stroke="url(#glassWallRefract_${tubeId})" stroke-width="1.2"/>

        <!-- Rim -->
        <ellipse cx="80" cy="32" rx="26" ry="4.5" fill="rgba(255,255,255,0.22)" stroke="#38BDF8" stroke-width="1"/>

        <!-- Frosted Patch & Graduations -->
        <rect x="67" y="56" width="26" height="14" rx="2" fill="rgba(255,255,255,0.3)"/>
        <text x="80" y="66" font-size="6.5" font-family="'JetBrains Mono', monospace" font-weight="800" fill="rgba(15,23,42,0.65)" text-anchor="middle">PYREX®</text>
        <g stroke="#FFFFFF" stroke-width="0.8" opacity="0.5">
          <line x1="102" y1="90" x2="94" y2="90"/>
          <line x1="102" y1="120" x2="96" y2="120"/>
          <line x1="102" y1="148" x2="94" y2="148"/>
        </g>

        <!-- Sample Liquid Column -->
        <path d="M 56,114 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,114 Z" fill="rgba(56, 189, 248, 0.28)"/>
        <ellipse cx="80" cy="114" rx="24" ry="4" fill="rgba(56, 189, 248, 0.45)"/>

        <!-- White Solid NaHCO3 Granular Sediment at Base -->
        ${performed ? `
          <ellipse cx="80" cy="198" rx="20" ry="5.5" fill="#FFFFFF" opacity="0.95"/>
          <circle cx="70" cy="194" r="3.2" fill="#F8FAFC"/>
          <circle cx="86" cy="195" r="3.6" fill="#F8FAFC"/>
          <circle cx="78" cy="196" r="2.8" fill="#F1F5F9"/>
        ` : ''}

        ${bubblesAndFroth}

        <!-- Spatula Delivering Solid Crystalline NaHCO3 Powder -->
        <g style="transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); transform: translate(${performed ? '8px, 6px' : '0px, 0px'});">
          <line x1="28" y1="26" x2="76" y2="26" stroke="url(#spatulaMetal_${tubeId})" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="76" cy="26" rx="6" ry="3" fill="url(#spatulaMetal_${tubeId})" stroke="#475569" stroke-width="0.6"/>
          <circle cx="76" cy="25" r="2.4" fill="#FFFFFF"/>
        </g>

        <!-- Specular Highlights -->
        <path d="M 58,36 L 58,170 C 58,185 66,195 78,199" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
        <line x1="102" y1="40" x2="102" y2="165" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>

        <!-- Apparatus Label -->
        <text x="80" y="212" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">NaHCO₃ Effervescence</text>
      </svg>
    `;
  }

  // 5. Esterification in Warm Water Bath with Porous Boiling Chips
  function renderEsterificationSvg(options = {}) {
    const { sampleKey = 'org_alcohol', performed = false, tubeId = 'est_1' } = options;
    const sample = resolveSample(sampleKey);
    const isFruity = sample.esterification?.isFruity || sample.fgKey === 'alkanol' || sample.fgKey === 'alkanoic_acid';

    // Fruity pleasant aroma vapors
    const vapors = performed && isFruity ? `
      <g class="anim-vapor">
        <path d="M 88,32 Q 80,18 86,4" stroke="rgba(244, 114, 182, 0.85)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M 102,34 Q 110,20 104,6" stroke="rgba(244, 114, 182, 0.85)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      </g>
    ` : '';

    return `
      <svg width="190" height="215" viewBox="0 0 190 215" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
        ${getCommonDefs(tubeId)}

        <!-- 250 mL Pyrex Beaker Acting as Water Bath -->
        <path d="M 28,95 L 28,198 C 28,206 38,210 50,210 L 140,210 C 152,210 162,206 162,198 L 162,95" fill="none" stroke="#64748B" stroke-width="2"/>
        <path d="M 24,95 L 28,98" stroke="#64748B" stroke-width="2"/>

        <!-- Beaker Volumetric Graduations -->
        <g stroke="#94A3B8" stroke-width="0.8" opacity="0.65">
          <line x1="30" y1="125" x2="40" y2="125"/><text x="44" y="127" font-size="5" fill="#94A3B8">200ml</text>
          <line x1="30" y1="150" x2="38" y2="150"/>
          <line x1="30" y1="175" x2="40" y2="175"/><text x="44" y="177" font-size="5" fill="#94A3B8">100ml</text>
        </g>

        <!-- Water Bath Liquid Column -->
        <path d="M 30,118 L 30,198 C 30,205 38,208 50,208 L 140,208 C 152,208 160,205 160,198 L 160,118 Z" fill="rgba(56, 189, 248, 0.2)"/>
        <ellipse cx="95" cy="118" rx="65" ry="8" fill="rgba(56, 189, 248, 0.35)"/>

        <!-- Boiling Tube Suspended Inside Water Bath -->
        <path d="M 78,35 L 78,185 C 78,198 86,204 95,204 C 104,204 112,198 112,185 L 112,35 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.3"/>
        <ellipse cx="95" cy="35" rx="17" ry="3.5" fill="rgba(255,255,255,0.2)" stroke="#38BDF8" stroke-width="0.8"/>

        <!-- Porous Boiling Chips (Pumice Stones) at Base -->
        <polygon points="88,200 93,196 97,199 94,203" fill="#E2E8F0" stroke="#64748B" stroke-width="0.5"/>
        <polygon points="98,201 103,197 106,200 102,203" fill="#CBD5E1" stroke="#64748B" stroke-width="0.5"/>

        <!-- Reaction Fluid Phases inside Boiling Tube -->
        ${performed && isFruity ? `
          <!-- Lower Aqueous / Acid Layer -->
          <path d="M 80,145 L 80,185 C 80,196 87,202 95,202 C 103,202 110,196 110,185 L 110,145 Z" fill="rgba(56, 189, 248, 0.38)"/>
          <ellipse cx="95" cy="145" rx="15" ry="3" fill="rgba(56, 189, 248, 0.6)"/>
          <!-- Upper Floating Fragrant Ester Layer -->
          <path d="M 80,115 L 80,145 L 110,145 L 110,115 Z" fill="rgba(244, 114, 182, 0.65)"/>
          <ellipse cx="95" cy="115" rx="15" ry="3" fill="rgba(244, 114, 182, 0.85)"/>
        ` : `
          <!-- Single Unreacted Phase -->
          <path d="M 80,125 L 80,185 C 80,196 87,202 95,202 C 103,202 110,196 110,185 L 110,125 Z" fill="rgba(56, 189, 248, 0.32)"/>
          <ellipse cx="95" cy="125" rx="15" ry="3" fill="rgba(56, 189, 248, 0.5)"/>
        `}

        ${vapors}

        <!-- Boiling Tube Specular Highlight -->
        <path d="M 81,38 L 81,180 C 81,192 86,198 93,200" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.65"/>

        <!-- Apparatus Label -->
        <text x="95" y="212" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">Water Bath Esterification</text>
      </svg>
    `;
  }

  // 6. Water Solubility & Miscibility Apparatus
  function renderSolubilitySvg(options = {}) {
    const { sampleKey = 'org_alkene', performed = false, tubeId = 'sol_1' } = options;
    const sample = resolveSample(sampleKey);
    const isMiscible = sample.solubility ? Boolean(sample.solubility.isMiscible) : (sample.fgKey === 'alkanol' || (sample.fgKey === 'alkanoic_acid' && sample.compoundKey !== 'benzoic_acid'));
    const isSolid = sample.compoundKey === 'benzoic_acid' || sample.key === 'org_benzoic_acid' || (sample.label && sample.label.includes('Solid'));

    let fluidMarkup = '';
    if (!performed) {
      fluidMarkup = `
        <!-- Unmixed Sample at Base -->
        <path d="M 56,155 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,155 Z" fill="rgba(56, 189, 248, 0.35)"/>
        <ellipse cx="80" cy="155" rx="24" ry="4" fill="rgba(56, 189, 248, 0.55)"/>
      `;
    } else if (isMiscible) {
      fluidMarkup = `
        <!-- Single Clear Homogeneous Solution with Schlieren Currents -->
        <path d="M 56,105 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,105 Z" fill="rgba(56, 189, 248, 0.38)"/>
        <ellipse cx="80" cy="105" rx="24" ry="4" fill="rgba(56, 189, 248, 0.6)"/>
        <path d="M 56,105 Q 80,110 104,105" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>
        <!-- Schlieren Optical Currents -->
        <path d="M 64,135 Q 80,140 96,135" stroke="rgba(255,255,255,0.4)" stroke-width="1.0" fill="none"/>
        <path d="M 66,160 Q 80,165 94,160" stroke="rgba(255,255,255,0.35)" stroke-width="0.8" fill="none"/>
      `;
    } else if (isSolid) {
      fluidMarkup = `
        <!-- Clear Water Column with Undissolved Solid Benzoic Acid Crystals at Base -->
        <path d="M 56,105 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,105 Z" fill="rgba(56, 189, 248, 0.28)"/>
        <ellipse cx="80" cy="105" rx="24" ry="4" fill="rgba(56, 189, 248, 0.5)"/>
        <path d="M 56,105 Q 80,110 104,105" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>
        <!-- Undissolved Crystalline Flakes at Base -->
        <polygon points="68,198 72,190 76,198" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.7"/>
        <polygon points="77,201 81,192 86,201" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.7"/>
        <polygon points="85,199 90,191 95,199" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.7"/>
      `;
    } else {
      fluidMarkup = `
        <!-- Lower Aqueous Water Layer -->
        <path d="M 56,145 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,145 Z" fill="rgba(56, 189, 248, 0.45)"/>
        <ellipse cx="80" cy="145" rx="24" ry="4" fill="rgba(56, 189, 248, 0.65)"/>
        <!-- Curved Interfacial Boundary Meniscus -->
        <path d="M 56,145 Q 80,150 104,145" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="1.6"/>

        <!-- Upper Non-Polar Hydrocarbon Oil Layer -->
        <path d="M 56,105 L 56,145 L 104,145 L 104,105 Z" fill="rgba(245, 158, 11, 0.55)"/>
        <ellipse cx="80" cy="105" rx="24" ry="4" fill="rgba(245, 158, 11, 0.75)"/>
        <path d="M 56,105 Q 80,110 104,105" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.3"/>

        <!-- Layer Indicator Labels -->
        <text x="50" y="128" font-size="5.5" font-family="'JetBrains Mono', monospace" font-weight="700" fill="rgba(254,243,199,0.9)" text-anchor="end">Organic</text>
        <line x1="51" y1="126" x2="59" y2="126" stroke="rgba(254,243,199,0.7)" stroke-width="0.7"/>

        <text x="50" y="162" font-size="5.5" font-family="'JetBrains Mono', monospace" font-weight="700" fill="rgba(186,230,253,0.9)" text-anchor="end">Aqueous</text>
        <line x1="51" y1="160" x2="59" y2="160" stroke="rgba(186,230,253,0.7)" stroke-width="0.7"/>

        <!-- Interfacial Hydrocarbon Droplets -->
        <circle cx="72" cy="144" r="2.2" fill="#FBBF24" opacity="0.9"/>
        <circle cx="88" cy="146" r="2.6" fill="#FBBF24" opacity="0.9"/>
        <circle cx="79" cy="143" r="1.8" fill="#FDE68A" opacity="0.8"/>
      `;
    }

    return `
      <svg width="160" height="215" viewBox="0 0 160 215" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.35));">
        ${getCommonDefs(tubeId)}

        <!-- Wooden Clamp -->
        <g transform="translate(0, 0)">
          <rect x="8" y="76" width="46" height="12" rx="2.5" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="1"/>
          <rect x="106" y="76" width="46" height="12" rx="2.5" fill="url(#woodClamp_${tubeId})" stroke="#451A03" stroke-width="1"/>
          <circle cx="24" cy="82" r="4.2" fill="url(#brassScrew_${tubeId})" stroke="#713F12" stroke-width="0.8"/>
          <circle cx="136" cy="82" r="4.2" fill="url(#brassScrew_${tubeId})" stroke="#713F12" stroke-width="0.8"/>
        </g>

        <!-- Borosilicate Test Tube Glass Body -->
        <path d="M 54,32 L 54,175 C 54,196 66,204 80,204 C 94,204 106,196 106,175 L 106,32 Z" fill="url(#pyrexGlass_${tubeId})" stroke="#94A3B8" stroke-width="1.3"/>
        <path d="M 56,33 L 56,174 C 56,194 67,202 80,202 C 93,202 104,194 104,174 L 104,33" fill="none" stroke="url(#glassWallRefract_${tubeId})" stroke-width="1.2"/>

        <!-- Rim -->
        <ellipse cx="80" cy="32" rx="26" ry="4.5" fill="rgba(255,255,255,0.22)" stroke="#38BDF8" stroke-width="1"/>

        <!-- Frosted Patch & Graduations -->
        <rect x="67" y="56" width="26" height="14" rx="2" fill="rgba(255,255,255,0.3)"/>
        <text x="80" y="66" font-size="6.5" font-family="'JetBrains Mono', monospace" font-weight="800" fill="rgba(15,23,42,0.65)" text-anchor="middle">PYREX®</text>
        <g stroke="#FFFFFF" stroke-width="0.8" opacity="0.5">
          <line x1="102" y1="90" x2="94" y2="90"/>
          <line x1="102" y1="120" x2="96" y2="120"/>
          <line x1="102" y1="148" x2="94" y2="148"/>
        </g>

        <!-- Fluid Column -->
        ${fluidMarkup}

        <!-- Water Dropper Pipette -->
        <g style="transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); transform: translate(0px, ${performed ? '-30px' : '0px'}); opacity: ${performed ? '0' : '1'};">
          <ellipse cx="80" cy="8" rx="8.5" ry="6.5" fill="url(#dropperBulb_${tubeId})"/>
          <rect x="78" y="14" width="4" height="20" fill="rgba(255,255,255,0.7)" stroke="#64748B" stroke-width="0.7"/>
          <path d="M 78,34 L 82,34 L 81,42 L 79,42 Z" fill="rgba(255,255,255,0.85)" stroke="#38BDF8" stroke-width="0.6"/>
          ${!performed ? `
            <ellipse cx="80" cy="54" rx="2.5" ry="3.8" fill="#38BDF8" class="anim-droplet"/>
          ` : ''}
        </g>

        <!-- Specular Highlights -->
        <path d="M 58,36 L 58,170 C 58,185 66,195 78,199" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
        <line x1="102" y1="40" x2="102" y2="165" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>

        <!-- Apparatus Label -->
        <text x="80" y="212" font-size="8.5" font-weight="700" fill="var(--text-muted, #94A3B8)" text-anchor="middle">Water Solubility & Miscibility</text>
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

    // 1. Prioritize specific chemical procedure described in prompt
    if (pStr.includes('bromine')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'bromine', performed, tubeId });
    }
    if (pStr.includes('dichromate') || pStr.includes('cr2o7')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'dichromate', performed, tubeId });
    }
    if (pStr.includes('kmno4') || pStr.includes('manganate') || pStr.includes('permanganate')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'kmno4', performed, tubeId });
    }
    if (pStr.includes('nahco3') || pStr.includes('carbonate') || pStr.includes('effervesc')) {
      return renderEffervescenceSvg({ sampleKey, performed, tubeId });
    }
    if (pStr.includes('litmus') || pStr.includes('ph')) {
      return renderLitmusSvg({ sampleKey, performed, tubeId });
    }
    if (pStr.includes('ignit') || pStr.includes('flame') || (pStr.includes('spatula') && (pStr.includes('flame') || pStr.includes('burn') || pStr.includes('heat') || pStr.includes('ignit'))) || pStr.includes('burn')) {
      return renderIgnitionSvg({ sampleKey, performed, tubeId });
    }
    if (pStr.includes('ester') || pStr.includes('fruity')) {
      return renderEsterificationSvg({ sampleKey, performed, tubeId });
    }
    if (pStr.includes('solub') || pStr.includes('miscib') || pStr.includes('water')) {
      return renderSolubilitySvg({ sampleKey, performed, tubeId });
    }

    // 2. Secondary fallback based on testId
    if (tId.includes('ignit')) {
      return renderIgnitionSvg({ sampleKey, performed, tubeId });
    }
    if (tId.includes('litmus')) {
      return renderLitmusSvg({ sampleKey, performed, tubeId });
    }
    if (tId.includes('bromine')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'bromine', performed, tubeId });
    }
    if (tId.includes('dichromate') || tId.includes('cr2o7')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'dichromate', performed, tubeId });
    }
    if (tId.includes('kmno4') || tId.includes('manganate')) {
      return renderDecolorizationSvg({ sampleKey, testType: 'kmno4', performed, tubeId });
    }
    if (tId.includes('nahco3') || tId.includes('carbonate')) {
      return renderEffervescenceSvg({ sampleKey, performed, tubeId });
    }
    if (tId.includes('solub') || tId.includes('miscib') || tId.includes('water')) {
      return renderSolubilitySvg({ sampleKey, performed, tubeId });
    }
    if (tId.includes('ester')) {
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

    const isMethanoic = sample.compoundKey === 'methanoic_acid' || sample.key === 'org_methanoic_acid';
    const isBenzoic = sample.compoundKey === 'benzoic_acid' || sample.key === 'org_benzoic_acid';

    if (pStr.includes('bromine') || tId.includes('bromine')) {
      const isDecolorized = sample.bromine?.isDecolorized || sample.fgKey === 'alkene' || sample.fgKey === 'alkyne';
      statusLabel = performed ? (isDecolorized ? 'Bromine Water: Rapidly decolourized to colourless' : 'Bromine Water: Reddish-brown colour persists') : 'Awaiting Bromine Water';
      soundType = 'drop';
    } else if (pStr.includes('dichromate') || pStr.includes('cr2o7') || tId.includes('dichromate')) {
      const turnsGreen = sample.dichromate?.turnsGreen || sample.fgKey === 'alkanol';
      statusLabel = performed ? (turnsGreen ? 'K₂Cr₂O₇: Orange turns emerald green (Cr³⁺ reduced)' : 'K₂Cr₂O₇: Orange colour persists') : 'Awaiting K₂Cr₂O₇';
      soundType = 'flame';
    } else if (pStr.includes('kmno4') || pStr.includes('manganate') || pStr.includes('permanganate') || tId.includes('kmno4')) {
      const isDecolorized = sample.kmno4?.isDecolorized || sample.fgKey === 'alkene' || sample.fgKey === 'alkanol' || isMethanoic;
      statusLabel = performed
        ? (isDecolorized
            ? (isMethanoic
                ? 'KMnO₄: Purple acidified KMnO₄ rapidly decolourized with gentle CO₂ effervescence'
                : 'KMnO₄: Purple acidified KMnO₄ rapidly decolourized')
            : 'KMnO₄: Purple colour remains unchanged')
        : 'Awaiting KMnO₄';
      soundType = (performed && isMethanoic) ? 'effervescence' : 'drop';
    } else if (pStr.includes('nahco3') || pStr.includes('carbonate') || pStr.includes('effervesc') || tId.includes('nahco3') || tId.includes('carbonate')) {
      const hasEff = sample.carbonate?.hasEffervescence || sample.fgKey === 'alkanoic_acid';
      statusLabel = performed ? (hasEff ? 'NaHCO₃: Vigorous effervescence of CO₂ gas' : 'NaHCO₃: No effervescence observed') : 'Awaiting Solid NaHCO₃';
      soundType = hasEff ? 'effervescence' : 'drop';
    } else if (pStr.includes('litmus') || pStr.includes('ph') || tId.includes('litmus')) {
      const isAcidic = sample.fgKey === 'alkanoic_acid';
      statusLabel = performed ? (isAcidic ? 'Litmus: Moist blue litmus turns red (Acidic, pH 3)' : 'Litmus: Neutral, no colour change (pH 7)') : 'Awaiting Litmus Strips';
      soundType = 'drop';
    } else if (pStr.includes('ignit') || pStr.includes('flame') || pStr.includes('burn') || (pStr.includes('spatula') && (pStr.includes('flame') || pStr.includes('burn') || pStr.includes('heat') || pStr.includes('ignit'))) || tId.includes('ignit')) {
      const isSooty = sample.isSooty || sample.fgKey === 'alkene' || sample.fgKey === 'alkyne' || isBenzoic;
      statusLabel = performed ? (isSooty ? 'Ignition: Luminous smoky sooty yellow flame' : 'Ignition: Clear non-sooty pale blue flame') : 'Awaiting Bunsen Flame';
      soundType = 'flame';
    } else if (pStr.includes('solub') || pStr.includes('miscib') || pStr.includes('water') || tId.includes('solub') || tId.includes('miscib')) {
      const isMiscible = sample.solubility ? Boolean(sample.solubility.isMiscible) : (sample.fgKey === 'alkanol' || (sample.fgKey === 'alkanoic_acid' && !isBenzoic));
      statusLabel = performed ? (sample.solubility?.status || (isMiscible ? 'Miscible: Dissolves completely in water' : 'Immiscible: Forms two distinct liquid layers')) : 'Awaiting Distilled Water';
      soundType = 'drop';
    } else if (pStr.includes('ester') || pStr.includes('fruity') || tId.includes('ester')) {
      const isFruity = sample.esterification?.isFruity ?? (sample.fgKey === 'alkanol' || sample.fgKey === 'alkanoic_acid');
      statusLabel = performed ? (sample.esterification?.status || (isFruity ? 'Esterification: Pleasant fruity aroma detected' : 'Esterification: No fruity smell')) : 'Awaiting Esterification Mixture';
      soundType = 'flame';
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
    renderSolubilitySvg,
    renderApparatusSvg,
    resolveOrganicReactionState,
    getOrganicActions,
    playFlameSound,
    playEffervescenceSound,
    playDropSplashSound,
    playOrganicSound
  };

  global.OrganicBenchCore = OrganicBenchCore;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrganicBenchCore;
  }

})(typeof window !== 'undefined' ? window : this);

// ============================================================
//  VirtuLab Kenya — Canonical Qualitative Laboratory Core Module
//  High-Fidelity SVG Apparatus, Multi-Stage State Machine & Web Audio Synthesizer
//  Shared between Standalone Bench (qualitative.html) and Composite Mock Exam (composite_exam.html)
// ============================================================

(function(global) {
  'use strict';

  // ── 1. Canonical Salts Registry & Crystal Visuals ──────────────
  const SALTS = {
    ammoniumChloride: {
      key: 'ammoniumChloride',
      altKeys: ['NH4CL', 'AMMONIUM CHLORIDE', 'AMMONIUM_CHLORIDE'],
      name: 'Ammonium Chloride',
      formula: 'NH₄Cl',
      cation: 'NH4+',
      anion: 'Cl-',
      cationDisplay: 'NH₄⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White crystalline solid',
      solubility: 'Readily soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    copperSulfate: {
      key: 'copperSulfate',
      altKeys: ['CUSO4', 'COPPER SULFATE', 'COPPER(II) SULFATE', 'COPPER_SULFATE'],
      name: 'Copper(II) Sulfate',
      formula: 'CuSO₄',
      cation: 'Cu2+',
      anion: 'SO4^2-',
      cationDisplay: 'Cu²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'Blue hydrated crystalline solid (rhombic crystals)',
      solubility: 'Readily soluble in water; forms a clear sky-blue stock solution.',
      crystalColor: '#38BDF8',
      crystalSecondary: '#1D4ED8',
      crystalHighlight: '#BAE6FD'
    },
    ironSulfate: {
      key: 'ironSulfate',
      altKeys: ['FESO4', 'IRON SULFATE', 'IRON(II) SULFATE', 'IRON_SULFATE'],
      name: 'Iron(II) Sulfate',
      formula: 'FeSO₄',
      cation: 'Fe2+',
      anion: 'SO4^2-',
      cationDisplay: 'Fe²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'Pale-green crystalline solid',
      solubility: 'Readily soluble in water; forms a pale-green stock solution.',
      crystalColor: '#34D399',
      crystalSecondary: '#059669',
      crystalHighlight: '#A7F3D0'
    },
    ironChloride: {
      key: 'ironChloride',
      altKeys: ['FECL3', 'IRON CHLORIDE', 'IRON(III) CHLORIDE', 'IRON_CHLORIDE'],
      name: 'Iron(III) Chloride',
      formula: 'FeCl₃',
      cation: 'Fe3+',
      anion: 'Cl-',
      cationDisplay: 'Fe³⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'Brownish-yellow crystalline deliquescent solid',
      solubility: 'Readily soluble in water; forms a yellow-brown acidic solution.',
      crystalColor: '#F59E0B',
      crystalSecondary: '#B45309',
      crystalHighlight: '#FDE68A'
    },
    sodiumCarbonate: {
      key: 'sodiumCarbonate',
      altKeys: ['NA2CO3', 'SODIUM CARBONATE', 'SODIUM_CARBONATE'],
      name: 'Sodium Carbonate',
      formula: 'Na₂CO₃',
      cation: 'Na+',
      anion: 'CO3^2-',
      cationDisplay: 'Na⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White crystalline solid / powder',
      solubility: 'Readily soluble in water; forms a clear, alkaline stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    calciumChloride: {
      key: 'calciumChloride',
      altKeys: ['CACL2', 'CALCIUM CHLORIDE', 'CALCIUM_CHLORIDE'],
      name: 'Calcium Chloride',
      formula: 'CaCl₂',
      cation: 'Ca2+',
      anion: 'Cl-',
      cationDisplay: 'Ca²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White deliquescent crystalline solid',
      solubility: 'Highly soluble in water with slight heat evolution; forms a clear stock solution.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    calciumNitrate: {
      key: 'calciumNitrate',
      altKeys: ['CA(NO3)2', 'CANO32', 'CALCIUM NITRATE', 'CALCIUM_NITRATE'],
      name: 'Calcium Nitrate',
      formula: 'Ca(NO₃)₂',
      cation: 'Ca2+',
      anion: 'NO3-',
      cationDisplay: 'Ca²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline deliquescent granules',
      solubility: 'Very soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    potassiumChloride: {
      key: 'potassiumChloride',
      altKeys: ['KCL', 'POTASSIUM CHLORIDE', 'POTASSIUM_CHLORIDE'],
      name: 'Potassium Chloride',
      formula: 'KCl',
      cation: 'K+',
      anion: 'Cl-',
      cationDisplay: 'K⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White crystalline solid (cubic granules)',
      solubility: 'Readily soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    leadNitrate: {
      key: 'leadNitrate',
      altKeys: ['PB(NO3)2', 'PBNO32', 'LEAD NITRATE', 'LEAD(II) NITRATE', 'LEAD_NITRATE'],
      name: 'Lead(II) Nitrate',
      formula: 'Pb(NO₃)₂',
      cation: 'Pb2+',
      anion: 'NO3-',
      cationDisplay: 'Pb²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White / colorless sparkling crystalline solid',
      solubility: 'Soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#94A3B8',
      crystalHighlight: '#FFFFFF'
    },
    zincSulfate: {
      key: 'zincSulfate',
      altKeys: ['ZNSO4', 'ZINC SULFATE', 'ZINC_SULFATE'],
      name: 'Zinc Sulfate',
      formula: 'ZnSO₄',
      cation: 'Zn2+',
      anion: 'SO4^2-',
      cationDisplay: 'Zn²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'White crystalline solid',
      solubility: 'Readily soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    zincNitrate: {
      key: 'zincNitrate',
      altKeys: ['ZN(NO3)2', 'ZNNO32', 'ZINC NITRATE', 'ZINC_NITRATE'],
      name: 'Zinc Nitrate',
      formula: 'Zn(NO₃)₂',
      cation: 'Zn2+',
      anion: 'NO3-',
      cationDisplay: 'Zn²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline solid (needle-like granules)',
      solubility: 'Very soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    aluminumNitrate: {
      key: 'aluminumNitrate',
      altKeys: ['AL(NO3)3', 'ALNO33', 'ALUMINUM NITRATE', 'ALUMINIUM NITRATE', 'ALUMINUM_NITRATE'],
      name: 'Aluminum Nitrate',
      formula: 'Al(NO₃)₃',
      cation: 'Al3+',
      anion: 'NO3-',
      cationDisplay: 'Al³⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline deliquescent solid',
      solubility: 'Very soluble in water; forms a clear, acidic stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    ammoniumCarbonate: {
      key: 'ammoniumCarbonate',
      altKeys: ['(NH4)2CO3', 'NH42CO3', 'AMMONIUM CARBONATE', 'AMMONIUM_CARBONATE'],
      name: 'Ammonium Carbonate',
      formula: '(NH₄)₂CO₃',
      cation: 'NH4+',
      anion: 'CO3^2-',
      cationDisplay: 'NH₄⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White translucent crystalline powder with faint ammonia odor',
      solubility: 'Readily soluble in water; forms an alkaline stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    bariumChloride: {
      key: 'bariumChloride',
      altKeys: ['BACL2', 'BARIUM CHLORIDE', 'BARIUM_CHLORIDE'],
      name: 'Barium Chloride',
      formula: 'BaCl₂',
      cation: 'Ba2+',
      anion: 'Cl-',
      cationDisplay: 'Ba²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White crystalline plates / granules',
      solubility: 'Soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    }
  };

  function resolveSalt(saltKey) {
    if (!saltKey) return SALTS.leadNitrate;
    if (SALTS[saltKey]) return SALTS[saltKey];
    const norm = String(saltKey).toUpperCase().replace(/[\s\-_]/g, '');
    for (const key in SALTS) {
      const salt = SALTS[key];
      if (salt.key.toUpperCase() === norm) return salt;
      if (salt.formula.toUpperCase().replace(/[\s\-_()]/g, '') === norm.replace(/[()]/g, '')) return salt;
      if (salt.altKeys && salt.altKeys.some(k => k.replace(/[\s\-_()]/g, '') === norm.replace(/[()]/g, ''))) return salt;
    }
    // Fuzzy matching
    if (norm.includes('ZN')) return SALTS.zincSulfate;
    if (norm.includes('PB')) return SALTS.leadNitrate;
    if (norm.includes('CU')) return SALTS.copperSulfate;
    if (norm.includes('FE') && (norm.includes('3') || norm.includes('CL'))) return SALTS.ironChloride;
    if (norm.includes('FE')) return SALTS.ironSulfate;
    if (norm.includes('CA') && norm.includes('NO3')) return SALTS.calciumNitrate;
    if (norm.includes('CA')) return SALTS.calciumChloride;
    if (norm.includes('NH4') && norm.includes('CO3')) return SALTS.ammoniumCarbonate;
    if (norm.includes('NH4')) return SALTS.ammoniumChloride;
    if (norm.includes('BA')) return SALTS.bariumChloride;
    if (norm.includes('AL')) return SALTS.aluminumNitrate;
    return SALTS.leadNitrate;
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

  function playDropSplashSound(isExcess = false) {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // 1. Subtle pipette bulb squeeze click at t=0
    try {
      const now = ctx.currentTime;
      const squeezeOsc = ctx.createOscillator();
      const squeezeGain = ctx.createGain();
      squeezeOsc.type = 'sine';
      squeezeOsc.frequency.setValueAtTime(360, now);
      squeezeOsc.frequency.exponentialRampToValueAtTime(180, now + 0.035);
      squeezeGain.gain.setValueAtTime(0.04, now);
      squeezeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
      squeezeOsc.connect(squeezeGain);
      squeezeGain.connect(ctx.destination);
      squeezeOsc.start(now);
      squeezeOsc.stop(now + 0.04);
    } catch(e) {}

    // 2. High-fidelity acoustic liquid droplet impact synthesis
    function triggerSingleDropSplash(pitchBase = 780, volume = 0.28) {
      try {
        const t = ctx.currentTime;
        // Minnaert bubble cavity resonance
        const bubbleOsc = ctx.createOscillator();
        const bubbleGain = ctx.createGain();
        bubbleOsc.type = 'sine';
        bubbleOsc.frequency.setValueAtTime(pitchBase, t);
        bubbleOsc.frequency.exponentialRampToValueAtTime(pitchBase * 2.35, t + 0.046);
        bubbleGain.gain.setValueAtTime(volume, t);
        bubbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.054);
        bubbleOsc.connect(bubbleGain);
        bubbleGain.connect(ctx.destination);
        bubbleOsc.start(t);
        bubbleOsc.stop(t + 0.058);

        // Surface tension rupture transient pop
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(3200, t);
        popOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.012);
        popGain.gain.setValueAtTime(volume * 0.5, t);
        popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(t);
        popOsc.stop(t + 0.018);

        // Glass vessel body resonance
        const glassOsc = ctx.createOscillator();
        const glassGain = ctx.createGain();
        glassOsc.type = 'sine';
        glassOsc.frequency.setValueAtTime(1550, t);
        glassGain.gain.setValueAtTime(volume * 0.16, t);
        glassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        glassOsc.connect(glassGain);
        glassGain.connect(ctx.destination);
        glassOsc.start(t);
        glassOsc.stop(t + 0.075);
      } catch(e) {}
    }

    // Schedule droplet impact at 350ms (synchronously matches 0.36s visual drop impact)
    setTimeout(() => {
      triggerSingleDropSplash(780, 0.28);
    }, 350);

    // If excess reagent added, schedule secondary and tertiary trailing droplets
    if (isExcess) {
      setTimeout(() => { triggerSingleDropSplash(920, 0.22); }, 480);
      setTimeout(() => { triggerSingleDropSplash(1060, 0.16); }, 590);
    }
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

  function playCrystalInspectSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch(e) {}
  }

  // ── 3. Reaction Physics & State Resolver ───────────────────────
  function resolveReactionState(saltKey, testId, stage = 'idle', prompt = '', obsStr = '') {
    const salt = resolveSalt(saltKey);
    const pStr = (prompt || '').toLowerCase();
    const oStr = (obsStr || '').toLowerCase();
    const tId = (testId || '').toLowerCase();

    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const isExcess = stage === 'excess' || stage === 'step3_nh3' || stage === 'step2_bacl2' || stage === 'step2_gas_warm' || pStr.includes('excess');
    const isStep1 = stage === 'few_drops' || stage === 'step1' || stage === 'stage1' || stage === 'step1_hno3' || stage === 'step1_acid' || stage === 'step1_hcl' || stage === 'step1_feso4' || stage === 'inspected';
    const isHeated = stage === 'heated' || tId.includes('heat') || pStr.includes('heat') || pStr.includes('ignit');
    const isCooled = stage === 'cooled' || pStr.includes('cool');

    const cation = salt.cation;
    const anion = salt.anion;

    // Detect specialized test types
    const isPhysicalAppearance =
      pStr.includes('physical appearance') ||
      pStr.includes('appearance of solid') ||
      pStr.includes('describe solid') ||
      pStr.includes('appearance of sample') ||
      (pStr.includes('appearance') && !pStr.includes('dissolv') && !pStr.includes('water')) ||
      (tId.includes('appearance') && !pStr.includes('water')) ||
      (tId === 't1' && pStr.includes('describe') && pStr.includes('solid'));

    const isDissolving = !isPhysicalAppearance && (
      pStr.includes('dissolv') ||
      (pStr.includes('water') && (pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('portion')))
    );

    const isFlameTest = pStr.includes('flame test') || pStr.includes('nichrome') || tId.includes('flame');

    const isHeat = !isFlameTest && (
      (pStr.includes('heat') && (pStr.includes('dry') || pStr.includes('strongly') || pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('test tube'))) ||
      tId.includes('heat') ||
      tId.includes('ignit')
    );

    const isNaOH = tId.includes('naoh') || pStr.includes('naoh') || pStr.includes('sodium hydroxide');
    const isNH3 = tId.includes('nh3') || pStr.includes('ammonia') || pStr.includes('nh₃') || pStr.includes('nh3');
    const isKI = tId.includes('ki') || pStr.includes('potassium iodide') || pStr.includes('iodide');
    const isBrownRing = tId.includes('brown_ring') || tId.includes('ring') || (pStr.includes('feso4') && pStr.includes('h2so4')) || pStr.includes('brown ring');
    const isAgNO3 = tId.includes('agno3') || pStr.includes('silver nitrate') || (pStr.includes('hno3') && pStr.includes('agno3'));
    const isBaCl2 = tId.includes('bacl2') || tId.includes('barium') || pStr.includes('barium chloride') || pStr.includes('ba(no3)2') || pStr.includes('bacl2');
    const isHCl = tId.includes('hcl') || tId.includes('acid') || pStr.includes('hydrochloric') || pStr.includes('limewater');

    let liquidColor = 'rgba(56, 189, 248, 0.25)';
    let ppt = false;
    let pptColor = '#FFFFFF';
    let pptDissolved = false;
    let bubbling = false;
    let complexDeepBlue = false;
    let statusLabel = 'Reaction Observed';
    let soundType = 'drop';

    if (performed) {
      if (isBrownRing) {
        // Handled in SVG generator
      } else if (isKI) {
        if (cation === 'Pb2+') {
          ppt = !isHeated;
          pptColor = '#FACC15'; // Bright yellow
          liquidColor = isHeated ? 'rgba(250, 204, 21, 0.55)' : 'rgba(234, 179, 8, 0.35)';
          statusLabel = isHeated ? 'Warmed: Yellow precipitate dissolves to clear hot solution' : (isCooled ? 'Cooled: Golden shimmering spangles recrystallized' : 'Few Drops: Bright yellow precipitate formed (PbI₂)');
        } else {
          liquidColor = 'rgba(250, 204, 21, 0.2)';
          statusLabel = 'No precipitate formed';
        }
      } else if (isNaOH) {
        if (cation === 'Pb2+' || cation === 'Al3+' || cation === 'Zn2+') {
          if (isExcess) {
            pptDissolved = true;
            liquidColor = 'rgba(255, 255, 255, 0.2)';
            statusLabel = `In Excess: White ppt dissolves to form clear colorless solution ([${cation === 'Pb2+' ? 'Pb(OH)₄' : cation === 'Al3+' ? 'Al(OH)₄' : 'Zn(OH)₄'}]²⁻)`;
          } else {
            ppt = true;
            pptColor = '#FFFFFF';
            statusLabel = 'Few Drops: White precipitate formed';
          }
        } else if (cation === 'Ca2+' || cation === 'Mg2+') {
          ppt = true;
          pptColor = '#FFFFFF';
          statusLabel = isExcess ? 'In Excess: White precipitate insoluble' : 'Few Drops: White precipitate formed';
        } else if (cation === 'Cu2+') {
          ppt = true;
          pptColor = '#38BDF8'; // Pale blue
          statusLabel = isExcess ? 'In Excess: Pale blue precipitate insoluble' : 'Few Drops: Pale blue precipitate formed (Cu(OH)₂)';
        } else if (cation === 'Fe2+') {
          ppt = true;
          pptColor = '#15803D'; // Dirty green
          statusLabel = isExcess ? 'In Excess: Dirty-green precipitate insoluble' : 'Few Drops: Dirty-green precipitate formed (Fe(OH)₂)';
        } else if (cation === 'Fe3+') {
          ppt = true;
          pptColor = '#991B1B'; // Reddish-brown
          statusLabel = isExcess ? 'In Excess: Reddish-brown precipitate insoluble' : 'Few Drops: Reddish-brown precipitate formed (Fe(OH)₃)';
        } else if (cation === 'NH4+') {
          bubbling = isHeated;
          statusLabel = isHeated ? 'Warmed: Pungent gas evolved (NH₃) turning moist red litmus blue' : 'No precipitate formed';
        }
      } else if (isNH3) {
        if (cation === 'Zn2+') {
          if (isExcess) {
            pptDissolved = true;
            liquidColor = 'rgba(255, 255, 255, 0.2)';
            statusLabel = 'In Excess: White precipitate dissolves to form colorless solution ([Zn(NH₃)₄]²⁺)';
          } else {
            ppt = true;
            pptColor = '#FFFFFF';
            statusLabel = 'Few Drops: White precipitate formed';
          }
        } else if (cation === 'Pb2+' || cation === 'Al3+') {
          ppt = true;
          pptColor = '#FFFFFF';
          statusLabel = isExcess ? 'In Excess: White precipitate insoluble' : 'Few Drops: White precipitate formed';
        } else if (cation === 'Cu2+') {
          if (isExcess) {
            complexDeepBlue = true;
            liquidColor = '#1D4ED8';
            statusLabel = 'In Excess: Pale blue ppt dissolves to form deep royal blue solution ([Cu(NH₃)₄]²⁺)';
          } else {
            ppt = true;
            pptColor = '#38BDF8';
            statusLabel = 'Few Drops: Pale blue precipitate formed';
          }
        } else if (cation === 'Fe2+') {
          ppt = true;
          pptColor = '#15803D';
          statusLabel = isExcess ? 'In Excess: Dirty green precipitate insoluble' : 'Few Drops: Dirty green precipitate formed';
        } else if (cation === 'Fe3+') {
          ppt = true;
          pptColor = '#991B1B';
          statusLabel = isExcess ? 'In Excess: Reddish-brown precipitate insoluble' : 'Few Drops: Reddish-brown precipitate formed';
        } else if (cation === 'Ca2+' || cation === 'NH4+') {
          statusLabel = 'No precipitate formed with drops or excess NH₃';
        }
      } else if (isAgNO3) {
        if (anion === 'Cl-') {
          if (stage === 'step3_nh3' || isExcess) {
            pptDissolved = true;
            liquidColor = 'rgba(255, 255, 255, 0.2)';
            statusLabel = 'In Aqueous NH₃: White AgCl precipitate readily dissolves';
          } else if (stage === 'step2_agno3' || !isStep1) {
            ppt = true;
            pptColor = '#FFFFFF';
            statusLabel = 'AgNO₃ Added: Dense white precipitate of AgCl formed';
          } else {
            statusLabel = 'Dilute HNO₃ Added: Acidified stock solution';
          }
        } else {
          statusLabel = 'No precipitate formed';
        }
      } else if (isBaCl2) {
        if (anion === 'SO4^2-' || anion === 'SO42-') {
          if (stage === 'step2_bacl2' || !isStep1) {
            ppt = true;
            pptColor = '#FFFFFF';
            statusLabel = 'Ba²⁺ Added: Dense white precipitate of BaSO₄ formed (acid-insoluble)';
          } else {
            statusLabel = 'Dilute Acid Added: Clear solution remains';
          }
        } else if (anion === 'CO3^2-' || anion === 'CO32-') {
          if (isStep1) {
            bubbling = true;
            statusLabel = 'Acid Added: Vigorous effervescence of CO₂ gas';
          }
        }
      } else if (isHCl) {
        if (anion === 'CO3^2-' || anion === 'CO32-') {
          bubbling = true;
          statusLabel = '2M HCl Added: Vigorous effervescence of a gas that turns limewater milky (CO₂)';
        } else {
          statusLabel = 'No effervescence / No gas evolved';
        }
      } else if (isPhysicalAppearance) {
        statusLabel = `Inspected: ${salt.appearance || 'Crystalline Solid'}`;
        soundType = 'inspect';
      } else if (isDissolving) {
        liquidColor = (cation === 'Cu2+') ? 'rgba(56, 189, 248, 0.6)'
          : (cation === 'Fe2+') ? 'rgba(16, 185, 129, 0.4)'
          : (cation === 'Fe3+') ? 'rgba(217, 119, 6, 0.45)'
          : 'rgba(255, 255, 255, 0.25)';
        statusLabel = `Water Added: ${salt.solubility || 'Solid dissolves completely to form clear stock solution'}`;
        soundType = 'dissolve';
      } else if (isFlameTest) {
        statusLabel = (cation === 'Ca2+') ? 'Flame Test: Brick-red / orange-red flame'
          : (cation === 'Cu2+') ? 'Flame Test: Blue-green flame'
          : (cation === 'Ba2+') ? 'Flame Test: Apple-green flame'
          : (salt.key.includes('sodium') || salt.name.includes('Sodium')) ? 'Flame Test: Persistent golden yellow flame'
          : (salt.key.includes('potassium') || salt.name.includes('Potassium')) ? 'Flame Test: Pale lilac flame'
          : 'Flame Test: Characteristic emission color recorded';
        soundType = 'flame';
      } else if (isHeat) {
        if (anion === 'NO3-') {
          liquidColor = 'rgba(180, 83, 9, 0.55)';
          statusLabel = (cation === 'Pb2+')
            ? 'Heated: Decrepitates; brown fumes of NO₂; rekindles glowing splint (O₂); reddish-brown hot, yellow cold'
            : 'Heated Strongly: Brown fumes of NO₂ evolved; rekindles glowing splint (O₂)';
        } else if (cation === 'NH4+') {
          statusLabel = 'Heated: Sublimes; dense white fumes deposit on upper cooler walls';
        } else if (cation === 'Zn2+') {
          statusLabel = 'Heated: Solid turns yellow when hot, white on cooling (ZnO formation)';
        } else if (cation === 'Cu2+') {
          statusLabel = 'Heated: Blue crystals dehydrate to white anhydrous powder; water droplets condense';
        } else if (cation === 'Fe2+') {
          statusLabel = 'Heated: Pale green crystals turn dirty brown; water droplets condense';
        } else {
          statusLabel = 'Heated Strongly: Thermal decomposition observed';
        }
        soundType = 'flame';
      }
    } else {
      if (isPhysicalAppearance) statusLabel = 'Solid Specimen Y on Watch Glass';
      else if (isDissolving) statusLabel = 'Awaiting Distilled Water';
      else if (isHeat || isFlameTest) statusLabel = 'Awaiting Bunsen Flame';
      else statusLabel = 'Awaiting Reagent';
    }

    return {
      salt,
      performed,
      stage,
      liquidTopY: isStep1 ? 80 : 54,
      liquidColor,
      ppt,
      pptColor,
      pptDissolved,
      bubbling,
      isBrownRing,
      hasBrownRing: isBrownRing && anion === 'NO3-',
      isKI,
      isLead: cation === 'Pb2+',
      isHeated,
      isCooled,
      complexDeepBlue,
      isExcess,
      isStep1,
      isPhysicalAppearance,
      isDissolving,
      isFlameTest,
      isHeat,
      statusLabel,
      soundType
    };
  }

  // ── 4. High-Fidelity SVG Test Tube Apparatus ──────────────────
  function renderTubeSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      testId = 'test_1',
      stage = 'idle',
      prompt = '',
      obsStr = '',
      tubeId = `tube_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const r = resolveReactionState(saltKey, testId, stage, prompt, obsStr);
    const performed = r.performed;
    const isStep1 = r.isStep1;
    const isExcess = r.isExcess;

    // Special Case 1: Brown Ring Test Stratification
    if (performed && r.isBrownRing) {
      const isStep2 = stage === 'step2_h2so4' || stage === 'excess' || stage === 'done';
      return `<svg width="86" height="136" viewBox="0 0 86 136">
        <defs>
          <linearGradient id="h2so4Grad_${tubeId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(241, 245, 249, 0.85)"/>
            <stop offset="100%" stop-color="rgba(203, 213, 225, 0.95)"/>
          </linearGradient>
          <radialGradient id="ringGlow_${tubeId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#451A03" stop-opacity="1"/>
            <stop offset="70%" stop-color="#78350F" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#92400E" stop-opacity="0.2"/>
          </radialGradient>
        </defs>
        
        <!-- Wooden Test Tube Clamp -->
        <g transform="translate(0, 48)">
          <rect x="2" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <rect x="60" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="7" r="2.5" fill="#64748B"/>
          <circle cx="72" cy="7" r="2.5" fill="#64748B"/>
        </g>

        <!-- Glass Test Tube Body & Lip -->
        <rect x="23" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M 26,36 L 26,112 Q 26,130 43,130 Q 60,130 60,112 L 60,36 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>

        ${isStep2 ? `
          <!-- Lower Dense Layer (Conc. H2SO4) -->
          <path d="M 27,94 L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,94 Z" fill="url(#h2so4Grad_${tubeId})"/>
          <ellipse cx="43" cy="94" rx="16" ry="3.5" fill="rgba(203, 213, 225, 0.95)"/>
        ` : ''}

        <!-- Upper Layer (Fresh FeSO4 Solution - pale green) -->
        <path d="M 27,${isStep2 ? 66 : 78} L 27,${isStep2 ? 94 : 112} ${isStep2 ? '' : 'Q 27,128 43,128 Q 59,128 59,112'} L 59,${isStep2 ? 94 : 78} L 59,${isStep2 ? 66 : 78} Z" fill="rgba(16, 185, 129, 0.28)"/>
        <ellipse cx="43" cy="${isStep2 ? 66 : 78}" rx="16" ry="3.5" fill="rgba(16, 185, 129, 0.4)"/>

        <!-- Brown Ring [Fe(H2O)5(NO)]2+ Interface -->
        ${r.hasBrownRing && isStep2 ? `
          <g class="anim-brown-ring">
            <ellipse cx="43" cy="94" rx="15.8" ry="4.5" fill="url(#ringGlow_${tubeId})" stroke="#B45309" stroke-width="1.5"/>
            <ellipse cx="43" cy="94" rx="12" ry="2.5" fill="#290E02"/>
          </g>
        ` : ''}

        <!-- Specular Highlight Curve -->
        <path d="M 29,38 L 29,112 Q 29,126 43,126" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
      </svg>`;
    }

    // Special Case 2: Potassium Iodide Test for Lead (PbI2 Golden Spangles)
    if (performed && r.isKI && r.isLead) {
      return `<svg width="86" height="136" viewBox="0 0 86 136">
        <!-- Clamp -->
        <g transform="translate(0, 48)">
          <rect x="2" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <rect x="60" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="7" r="2.5" fill="#64748B"/>
          <circle cx="72" cy="7" r="2.5" fill="#64748B"/>
        </g>

        <!-- Glass Body & Lip -->
        <rect x="23" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M 26,36 L 26,112 Q 26,130 43,130 Q 60,130 60,112 L 60,36 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>

        <!-- Liquid Phase -->
        <path class="${isExcess ? 'anim-liquid-rise' : ''}" d="M 27,${r.liquidTopY} L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,${r.liquidTopY} Z" fill="${r.liquidColor}"/>
        <ellipse cx="43" cy="${r.liquidTopY}" rx="16" ry="3.5" fill="${r.liquidColor}" class="anim-meniscus-ripple"/>

        <!-- Precision Dropper Pipette (when few drops) -->
        ${isStep1 ? `
          <g class="anim-dropper" opacity="1">
            <path class="anim-dropper-bulb" d="M 39,2 L 47,2 L 45,12 L 41,12 Z" fill="#EF4444" rx="2"/>
            <rect x="41.5" y="12" width="3" height="15" fill="rgba(255,255,255,0.75)" stroke="#94A3B8" stroke-width="0.8"/>
            <path d="M 41.5,27 L 44.5,27 L 43,35 Z" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" stroke-width="0.8"/>
          </g>
          <ellipse cx="43" cy="36" rx="2" ry="2.8" fill="#FACC15" class="anim-droplet"/>
        ` : ''}

        <!-- Convection Heat Waves when warmed -->
        ${r.isHeated ? `
          <g class="anim-heat-wave">
            <path d="M 36,46 Q 40,40 44,46" stroke="rgba(245, 158, 11, 0.7)" stroke-width="1.5" fill="none"/>
            <path d="M 44,42 Q 48,36 52,42" stroke="rgba(245, 158, 11, 0.6)" stroke-width="1.5" fill="none"/>
          </g>
        ` : ''}

        <!-- PbI2 Golden Precipitate -->
        ${r.ppt ? `
          <g class="anim-ppt-form">
            <ellipse cx="43" cy="120" rx="14" ry="7" fill="#EAB308" opacity="0.9"/>
            <circle cx="34" cy="116" r="3" fill="#FACC15"/>
            <circle cx="48" cy="118" r="3.2" fill="#CA8A04"/>
            <circle cx="42" cy="112" r="2.5" fill="#FEF08A"/>
            <circle cx="38" cy="122" r="2.8" fill="#FACC15"/>
          </g>
        ` : ''}

        <!-- Sparkling Golden Spangles upon cooling -->
        ${r.isCooled ? `
          <g class="anim-spangle" style="animation-delay: 0s;">
            <polygon points="43,84 45,88 49,89 45,90 43,94 41,90 37,89 41,88" fill="#FEF08A"/>
          </g>
          <g class="anim-spangle" style="animation-delay: 0.4s;">
            <polygon points="34,74 35.5,77 39,78 35.5,79 34,82 32.5,79 29,78 32.5,77" fill="#FDE047"/>
          </g>
          <g class="anim-spangle" style="animation-delay: 0.8s;">
            <polygon points="52,98 53.5,101 57,102 53.5,103 52,106 50.5,103 47,102 50.5,101" fill="#FEF08A"/>
          </g>
        ` : ''}

        <path d="M 29,38 L 29,112 Q 29,126 43,126" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
      </svg>`;
    }

    // Standard Qualitative Reagent Test Tube (NaOH, NH3, HCl, AgNO3, BaCl2, Heat)
    const isPpt = performed && r.ppt;
    const isPptDissolved = performed && r.pptDissolved;
    const isDeepBlue = performed && r.complexDeepBlue;

    return `<svg width="86" height="136" viewBox="0 0 86 136">
      <defs>
        <radialGradient id="liquidGlow_${tubeId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${isDeepBlue ? '#1D4ED8' : r.liquidColor}" stop-opacity="${isDeepBlue ? '1' : '0.9'}"/>
          <stop offset="100%" stop-color="${isDeepBlue ? '#1E40AF' : r.liquidColor}" stop-opacity="${isDeepBlue ? '0.9' : '0.7'}"/>
        </radialGradient>
      </defs>

      <!-- Precision Reagent Dropper Pipette (Centered over Mouth) -->
      <g class="anim-dropper" opacity="${performed ? '1' : '0.45'}">
        <path class="${performed ? 'anim-dropper-bulb' : ''}" d="M 39,2 L 47,2 L 45,12 L 41,12 Z" fill="#EF4444" rx="2"/>
        <rect x="41.5" y="12" width="3" height="15" fill="rgba(255,255,255,0.75)" stroke="#94A3B8" stroke-width="0.8"/>
        <path d="M 41.5,27 L 44.5,27 L 43,35 Z" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" stroke-width="0.8"/>
      </g>
      ${performed ? `
        <!-- Fast Gravitational Falling Reagent Droplet -->
        <ellipse cx="43" cy="36" rx="2" ry="2.8" fill="${isPpt ? r.pptColor : (r.liquidColor && r.liquidColor.startsWith('#') ? r.liquidColor : '#38BDF8')}" class="anim-droplet"/>
      ` : ''}

      <!-- Wooden Test Tube Clamp -->
      <g transform="translate(0, 48)">
        <rect x="2" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
        <rect x="60" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
        <circle cx="14" cy="7" r="2.5" fill="#64748B"/>
        <circle cx="72" cy="7" r="2.5" fill="#64748B"/>
      </g>

      <!-- Glass Test Tube Body & Lip -->
      <rect x="23" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
      <path d="M 26,36 L 26,112 Q 26,130 43,130 Q 60,130 60,112 L 60,36 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>

      <!-- Liquid Column with Volume Rise & Meniscus Ripple -->
      ${performed ? `
        <path class="${isExcess ? 'anim-liquid-rise' : ''}" d="M 27,${r.liquidTopY} L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,${r.liquidTopY} Z" fill="url(#liquidGlow_${tubeId})" opacity="0.9"/>
        <ellipse cx="43" cy="${r.liquidTopY}" rx="16" ry="3.5" fill="${isDeepBlue ? '#1E40AF' : r.liquidColor}" opacity="0.95" class="${performed ? 'anim-meniscus-ripple' : ''}"/>
      ` : ''}

      <!-- Precipitate Curd Mass at Base -->
      ${performed && isPpt && !r.bubbling ? `
        <g class="anim-ppt-form">
          <ellipse cx="43" cy="120" rx="14.5" ry="7" fill="${r.pptColor}" opacity="0.95" filter="brightness(0.9)"/>
          <circle cx="34" cy="116" r="2.8" fill="${r.pptColor}" filter="brightness(1.15)"/>
          <circle cx="48" cy="118" r="3.2" fill="${r.pptColor}" filter="brightness(0.85)"/>
          <circle cx="41" cy="113" r="2.5" fill="${r.pptColor}" filter="brightness(1.1)"/>
          <circle cx="38" cy="122" r="2.8" fill="${r.pptColor}" filter="brightness(0.9)"/>
          <circle cx="46" cy="122" r="2.6" fill="${r.pptColor}" filter="brightness(1.05)"/>
        </g>
      ` : ''}

      <!-- Dissolving Precipitate Transition (Excess) -->
      ${performed && isPptDissolved ? `
        <g class="anim-ppt-dissolve">
          <ellipse cx="43" cy="120" rx="12" ry="5" fill="#E2E8F0" opacity="0.4"/>
          <circle cx="38" cy="118" r="2" fill="#E2E8F0" opacity="0.4"/>
          <circle cx="46" cy="119" r="2" fill="#E2E8F0" opacity="0.4"/>
        </g>
      ` : ''}

      <!-- Bubbles & Froth Header for Acid Effervescence -->
      ${performed && r.bubbling ? `
        <g class="anim-qual-froth">
          <ellipse cx="43" cy="${r.liquidTopY}" rx="15" ry="3.5" fill="#FFF" opacity="0.8"/>
        </g>
        <circle cx="36" cy="112" r="2.4" fill="#FFF" opacity="0.8" class="bubble anim-qual-bubble"/>
        <circle cx="46" cy="104" r="2.8" fill="#FFF" opacity="0.9" class="bubble anim-qual-bubble" style="animation-delay: 0.25s;"/>
        <circle cx="40" cy="94" r="2.2" fill="#FFF" opacity="0.75" class="bubble anim-qual-bubble" style="animation-delay: 0.5s;"/>
        <circle cx="48" cy="84" r="2.6" fill="#FFF" opacity="0.85" class="bubble anim-qual-bubble" style="animation-delay: 0.75s;"/>
        <circle cx="34" cy="74" r="2.4" fill="#FFF" opacity="0.8" class="bubble anim-qual-bubble" style="animation-delay: 0.35s;"/>
      ` : ''}

      <!-- Glass Specular Highlight Curve -->
      <path d="M 29,38 L 29,112 Q 29,126 43,126" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
    </svg>`;
  }

  // ── 5. Interactive Specimen Watch Glass Renderer ───────────────
  function renderWatchGlassSvg(saltKey = 'leadNitrate', width = 130, height = 90) {
    const salt = resolveSalt(saltKey);
    const prim = salt.crystalColor || '#F8FAFC';
    const sec = salt.crystalSecondary || '#CBD5E1';
    const hi = salt.crystalHighlight || '#FFFFFF';

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 130 90" class="watchglass-dish-svg">
        <defs>
          <radialGradient id="dishGlassGrad_${salt.key}" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.4)" />
            <stop offset="45%" stop-color="rgba(255,255,255,0.08)" />
            <stop offset="90%" stop-color="rgba(148,163,184,0.3)" />
            <stop offset="100%" stop-color="rgba(56,189,248,0.35)" />
          </radialGradient>
          <linearGradient id="dishRimGrad_${salt.key}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.6)" />
            <stop offset="50%" stop-color="rgba(255,255,255,0.15)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.5)" />
          </linearGradient>
          <filter id="crystalShadow_${salt.key}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
          </filter>
        </defs>

        <!-- Watch Glass Elliptical Shadow -->
        <ellipse cx="65" cy="58" rx="56" ry="24" fill="rgba(15,23,42,0.14)" filter="blur(4px)" />

        <!-- Outer Concave Dish -->
        <path d="M 12,42 C 12,74 118,74 118,42" fill="url(#dishGlassGrad_${salt.key})" stroke="url(#dishRimGrad_${salt.key})" stroke-width="1.8"/>
        <!-- Inner Dish Oval -->
        <ellipse cx="65" cy="42" rx="53" ry="18" fill="rgba(255,255,255,0.05)" stroke="url(#dishRimGrad_${salt.key})" stroke-width="1.2"/>
        
        <!-- Authentic Dynamic Salt Crystals -->
        <g filter="url(#crystalShadow_${salt.key})">
          <!-- Base heap mound -->
          <ellipse cx="65" cy="46" rx="28" ry="11" fill="${sec}" opacity="0.6"/>
          <ellipse cx="65" cy="44" rx="22" ry="8" fill="${prim}"/>
          
          <!-- Faceted crystal micro-geometry -->
          <polygon points="56,38 64,34 68,39 60,43" fill="${hi}" opacity="0.95"/>
          <polygon points="68,39 64,34 76,36 78,41" fill="${sec}" opacity="0.85"/>
          <polygon points="48,42 54,39 58,45 52,48" fill="${prim}"/>
          <polygon points="52,48 58,45 66,47 60,50" fill="${sec}"/>
          <polygon points="70,41 78,41 82,47 74,47" fill="${hi}" opacity="0.9"/>
          <polygon points="74,47 82,47 78,52 70,52" fill="${prim}"/>
          <polygon points="42,46 48,43 54,49 48,52" fill="${sec}"/>
          <polygon points="60,44 68,42 72,48 64,50" fill="${hi}"/>

          <!-- Scattered granules -->
          <circle cx="36" cy="46" r="2.2" fill="${prim}"/>
          <circle cx="41" cy="51" r="1.8" fill="${sec}"/>
          <circle cx="86" cy="46" r="2.4" fill="${prim}"/>
          <circle cx="91" cy="49" r="1.6" fill="${hi}"/>
          <circle cx="65" cy="53" r="2" fill="${sec}"/>
        </g>

        <!-- Dish Specular Sheen -->
        <path d="M 28,43 C 40,55 90,55 102,43" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `;
  }

  // ── 5b. Watch Glass Specimen Examination Apparatus SVG (for Q2 / Q3 Physical Appearance) ──
  function renderWatchGlassApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      stage = 'idle',
      tubeId = `wg_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const salt = resolveSalt(saltKey);
    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const prim = salt.crystalColor || '#FFFFFF';
    const sec = salt.crystalSecondary || '#E2E8F0';
    const hi = salt.crystalHighlight || '#FFFFFF';

    return `
      <svg width="112" height="136" viewBox="0 0 112 136">
        <defs>
          <radialGradient id="dishGrad_${tubeId}" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.35)"/>
            <stop offset="50%" stop-color="rgba(255,255,255,0.08)"/>
            <stop offset="90%" stop-color="rgba(148,163,184,0.3)"/>
            <stop offset="100%" stop-color="rgba(56,189,248,0.35)"/>
          </radialGradient>
          <linearGradient id="rimGrad_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.6)"/>
            <stop offset="50%" stop-color="rgba(255,255,255,0.15)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.5)"/>
          </linearGradient>
          <filter id="crystShadow_${tubeId}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        <!-- Lab Bench Surface Shadow -->
        <ellipse cx="56" cy="94" rx="48" ry="18" fill="rgba(15,23,42,0.3)" filter="blur(3px)"/>

        <!-- Watch Glass Dish Body -->
        <path d="M 12,78 C 12,108 100,108 100,78" fill="url(#dishGrad_${tubeId})" stroke="url(#rimGrad_${tubeId})" stroke-width="1.8"/>
        <ellipse cx="56" cy="78" rx="44" ry="14" fill="rgba(255,255,255,0.06)" stroke="url(#rimGrad_${tubeId})" stroke-width="1.2"/>

        <!-- Dynamic Salt Crystals Mound -->
        <g filter="url(#crystShadow_${tubeId})">
          <ellipse cx="56" cy="82" rx="26" ry="9" fill="${sec}" opacity="0.75"/>
          <ellipse cx="56" cy="80" rx="20" ry="7" fill="${prim}"/>

          <!-- Faceted Micro-Crystals -->
          <polygon points="48,74 55,71 59,75 52,78" fill="${hi}" opacity="0.95"/>
          <polygon points="59,75 55,71 66,73 68,77" fill="${sec}" opacity="0.85"/>
          <polygon points="41,77 47,74 51,79 45,82" fill="${prim}"/>
          <polygon points="45,82 51,79 58,81 53,84" fill="${sec}"/>
          <polygon points="61,76 68,76 72,81 65,81" fill="${hi}" opacity="0.9"/>
          <polygon points="65,81 72,81 68,86 61,86" fill="${prim}"/>
          <polygon points="35,80 41,78 46,83 40,85" fill="${sec}"/>
          <polygon points="52,79 59,77 63,82 56,84" fill="${hi}"/>

          <!-- Granules -->
          <circle cx="30" cy="80" r="1.8" fill="${prim}"/>
          <circle cx="34" cy="84" r="1.5" fill="${sec}"/>
          <circle cx="76" cy="81" r="2" fill="${prim}"/>
          <circle cx="81" cy="83" r="1.4" fill="${hi}"/>
          <circle cx="56" cy="87" r="1.7" fill="${sec}"/>
        </g>

        <!-- Specular Sheen Curve on Watch Glass Rim -->
        <path d="M 22,79 C 32,89 80,89 90,79" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" stroke-linecap="round"/>

        <!-- Laboratory Magnifying Inspection Loupe -->
        ${performed ? `
          <!-- Inspection Loupe Centered Over Sample (Inspecting) -->
          <g class="anim-loupe-inspect">
            <!-- Loupe Handle -->
            <line x1="72" y1="58" x2="98" y2="32" stroke="#64748B" stroke-width="4.5" stroke-linecap="round"/>
            <line x1="72" y1="58" x2="98" y2="32" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
            <!-- Loupe Metal Frame & Lens -->
            <circle cx="56" cy="74" r="25" fill="rgba(56,189,248,0.12)" stroke="#38BDF8" stroke-width="2.5"/>
            <circle cx="56" cy="74" r="23" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
            <path d="M 40,64 A 20 20 0 0 1 70,60" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
            <!-- Sparkling Crystal Facets under Magnification -->
            <g class="anim-crystal-glint">
              <polygon points="56,66 57.5,70 61,71 57.5,72 56,76 54.5,72 51,71 54.5,70" fill="#FFFFFF"/>
              <polygon points="46,74 47,77 50,77.5 47,78 46,81 45,78 42,77.5 45,77" fill="${hi}"/>
              <polygon points="66,73 67,76 70,76.5 67,77 66,80 65,77 62,76.5 65,76" fill="${hi}"/>
            </g>
          </g>
        ` : `
          <!-- Inspection Loupe Resting on Upper Edge -->
          <g opacity="0.75" transform="translate(14, -6)">
            <line x1="64" y1="44" x2="88" y2="20" stroke="#64748B" stroke-width="4" stroke-linecap="round"/>
            <line x1="64" y1="44" x2="88" y2="20" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="50" cy="56" r="20" fill="rgba(255,255,255,0.1)" stroke="#94A3B8" stroke-width="2"/>
            <path d="M 38,48 A 16 16 0 0 1 60,46" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
          </g>
        `}

        <!-- Specimen Plaque Label -->
        <g transform="translate(16, 114)">
          <rect x="0" y="0" width="80" height="18" rx="4" fill="rgba(15,23,42,0.85)" stroke="#334155" stroke-width="1"/>
          <text x="40" y="12.5" font-size="8.5" font-weight="800" fill="#38BDF8" text-anchor="middle" font-family="'JetBrains Mono', monospace">
            ${performed ? 'CRYSTALS: OBSERVED' : 'SOLID SPECIMEN Y'}
          </text>
        </g>
      </svg>
    `;
  }

  function renderDryHeatingApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      stage = 'idle',
      prompt = '',
      obsStr = '',
      tubeId = `heat_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const salt = resolveSalt(saltKey);
    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const cation = salt.cation;
    const anion = salt.anion;
    const isNitrate = anion === 'NO3-';
    const isHydrated = salt.appearance?.toLowerCase().includes('hydrat') || salt.formula?.includes('H2O') || cation === 'Cu2+' || cation === 'Fe2+';

    // Solid color hot vs cold
    let hotPowderColor = salt.crystalColor || '#FFFFFF';
    if (performed) {
      if (cation === 'Zn2+') hotPowderColor = '#FACC15'; // ZnO yellow when hot
      else if (cation === 'Cu2+') hotPowderColor = '#E2E8F0'; // Anhydrous white
      else if (cation === 'Fe2+') hotPowderColor = '#78350F'; // Dirty brown Fe2O3/FeO
      else if (cation === 'Pb2+') hotPowderColor = '#9A3412'; // PbO reddish-brown hot
    }

    return `
      <svg width="112" height="136" viewBox="0 0 112 136">
        <defs>
          <linearGradient id="flameInner_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.95"/>
            <stop offset="60%" stop-color="#0284C7" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="flameOuter_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#2563EB" stop-opacity="0.8"/>
            <stop offset="70%" stop-color="#60A5FA" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="#93C5FD" stop-opacity="0"/>
          </linearGradient>
          <radialGradient id="no2Fumes_${tubeId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#78350F" stop-opacity="0.85"/>
            <stop offset="60%" stop-color="#92400E" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#B45309" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Retort Stand Vertical Rod -->
        <line x1="8" y1="10" x2="8" y2="132" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
        <line x1="2" y1="130" x2="30" y2="130" stroke="#475569" stroke-width="4" stroke-linecap="round"/>

        <!-- Wooden Clamp Arm Tilted holding tube -->
        <g transform="translate(8, 46)">
          <line x1="0" y1="0" x2="28" y2="4" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
          <circle cx="0" cy="0" r="3.5" fill="#94A3B8"/>
          <!-- Clamp jaws -->
          <rect x="24" y="-4" width="16" height="6" rx="1.5" fill="#78350F" stroke="#451A03" stroke-width="0.8" transform="rotate(20 28 0)"/>
          <rect x="24" y="2" width="16" height="6" rx="1.5" fill="#78350F" stroke="#451A03" stroke-width="0.8" transform="rotate(20 28 0)"/>
        </g>

        <!-- Hard-Glass Test Tube (Tilted at 22 degrees) -->
        <g transform="translate(32, 20) rotate(22 20 50)">
          <!-- Glass Lip & Body -->
          <rect x="13" y="10" width="22" height="3" rx="1" fill="rgba(255,255,255,0.2)" stroke="#94A3B8" stroke-width="1"/>
          <path d="M 15,12 L 15,82 Q 15,96 24,96 Q 33,96 33,82 L 33,12 Z" fill="rgba(255,255,255,0.06)" stroke="#94A3B8" stroke-width="1.3"/>

          <!-- Dry Solid Powder Mound at base of tube -->
          <path d="M 16,74 L 16,82 Q 16,95 24,95 Q 32,95 32,82 L 32,74 Q 24,78 16,74 Z" fill="${hotPowderColor}"/>

          <!-- Decrepitation Sparkles if Pb(NO3)2 -->
          ${performed && cation === 'Pb2+' ? `
            <g class="anim-spangle">
              <circle cx="21" cy="78" r="1.4" fill="#FDE047"/>
              <circle cx="27" cy="75" r="1.2" fill="#F59E0B"/>
              <circle cx="24" cy="72" r="1" fill="#FFFFFF"/>
            </g>
          ` : ''}

          <!-- Condensed Water Droplets on upper walls if hydrated -->
          ${performed && isHydrated ? `
            <g opacity="0.85">
              <ellipse cx="17" cy="40" rx="1.5" ry="2" fill="#BAE6FD"/>
              <ellipse cx="31" cy="46" rx="1.8" ry="2.2" fill="#BAE6FD"/>
              <ellipse cx="17" cy="54" rx="1.6" ry="2" fill="#BAE6FD"/>
              <ellipse cx="31" cy="36" rx="1.4" ry="1.8" fill="#BAE6FD"/>
            </g>
          ` : ''}

          <!-- Brown NO2 Fumes rising in tube if nitrate -->
          ${performed && isNitrate ? `
            <g class="anim-heat-wave">
              <ellipse cx="24" cy="50" rx="7" ry="14" fill="url(#no2Fumes_${tubeId})"/>
              <ellipse cx="24" cy="30" rx="8" ry="16" fill="url(#no2Fumes_${tubeId})"/>
            </g>
          ` : ''}

          <!-- Glass Specular Highlight -->
          <path d="M 17,14 L 17,82 Q 17,92 24,92" fill="none" stroke="#FFFFFF" stroke-width="0.9" opacity="0.3"/>

          <!-- Litmus paper or splint at mouth -->
          ${performed && isNitrate ? `
            <!-- Moist Blue Litmus turning Red at mouth -->
            <path d="M 21,2 L 27,2 L 27,16 L 21,16 Z" fill="#EF4444" stroke="#DC2626" stroke-width="0.5"/>
            <path d="M 21,2 L 27,2 L 27,8 L 21,8 Z" fill="#3B82F6"/>
          ` : ''}
        </g>

        <!-- Billowing Fumes escaping mouth into air -->
        ${performed && isNitrate ? `
          <g class="anim-heat-wave" transform="translate(18, 10)">
            <circle cx="16" cy="12" r="6" fill="url(#no2Fumes_${tubeId})" opacity="0.8"/>
            <circle cx="12" cy="4" r="8" fill="url(#no2Fumes_${tubeId})" opacity="0.6"/>
          </g>
        ` : ''}

        <!-- Bunsen Burner heating tube base -->
        <g transform="translate(48, 86)">
          <!-- Burner Chimney & Base -->
          <rect x="18" y="24" width="8" height="22" fill="#64748B" stroke="#334155" stroke-width="0.8"/>
          <ellipse cx="22" cy="46" rx="18" ry="4" fill="#334155"/>
          <ellipse cx="22" cy="24" rx="4" ry="1.5" fill="#475569"/>

          ${performed ? `
            <!-- Roaring Non-Luminous Bunsen Flame -->
            <g class="anim-flame">
              <!-- Outer Blue Cone -->
              <path d="M 17,24 C 15,10 18,2 22,2 C 26,2 29,10 27,24 Z" fill="url(#flameOuter_${tubeId})"/>
              <!-- Inner Pale Blue Core -->
              <path d="M 19,24 C 18,16 20,8 22,8 C 24,8 26,16 25,24 Z" fill="url(#flameInner_${tubeId})"/>
            </g>
          ` : `
            <!-- Gentle Pilot Flame -->
            <path d="M 20,24 C 19,19 21,16 22,16 C 23,16 25,19 24,24 Z" fill="#38BDF8" opacity="0.6"/>
          `}
        </g>
      </svg>
    `;
  }

  function renderDissolutionApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      stage = 'idle',
      prompt = '',
      obsStr = '',
      tubeId = `diss_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const salt = resolveSalt(saltKey);
    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const cation = salt.cation;

    let solnColor = 'rgba(56, 189, 248, 0.25)';
    if (cation === 'Cu2+') solnColor = 'rgba(56, 189, 248, 0.6)';
    else if (cation === 'Fe2+') solnColor = 'rgba(16, 185, 129, 0.4)';
    else if (cation === 'Fe3+') solnColor = 'rgba(217, 119, 6, 0.45)';

    return `
      <svg width="100" height="136" viewBox="0 0 100 136">
        <!-- Clamp -->
        <g transform="translate(0, 48)">
          <rect x="6" y="3" width="22" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <rect x="72" y="3" width="22" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="16" cy="7" r="2.5" fill="#64748B"/>
          <circle cx="82" cy="7" r="2.5" fill="#64748B"/>
        </g>

        <!-- Wash Bottle Nozzle (when adding water) -->
        ${performed ? `
          <g class="anim-dropper">
            <path d="M 68,6 L 56,22 L 53,24" fill="none" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round"/>
            <line x1="53" y1="24" x2="50" y2="42" stroke="rgba(56,189,248,0.7)" stroke-width="1.8" stroke-dasharray="3,2" class="anim-droplet"/>
          </g>
        ` : ''}

        <!-- Boiling Tube Body & Lip -->
        <rect x="27" y="28" width="46" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M 30,32 L 30,114 Q 30,132 50,132 Q 70,132 70,114 L 70,32 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>

        ${performed ? `
          <!-- Dissolving Solution Column -->
          <path d="M 31,64 L 31,114 Q 31,130 50,130 Q 69,130 69,114 L 69,64 Z" fill="${solnColor}" class="anim-liquid-rise"/>
          <ellipse cx="50" cy="64" rx="19" ry="4" fill="${solnColor}" class="anim-meniscus-ripple"/>
          <!-- Swirling Dissolution Waves -->
          <g opacity="0.6">
            <path d="M 40,88 Q 50,82 60,88" stroke="rgba(255,255,255,0.6)" stroke-width="1.2" fill="none"/>
            <path d="M 38,104 Q 50,98 62,104" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" fill="none"/>
          </g>
        ` : `
          <!-- Dry Solid Crystals at bottom awaiting water -->
          <ellipse cx="50" cy="120" rx="14" ry="6" fill="${salt.crystalColor || '#FFFFFF'}" opacity="0.9"/>
          <circle cx="44" cy="118" r="2.2" fill="${salt.crystalHighlight || '#FFFFFF'}"/>
          <circle cx="54" cy="121" r="2.5" fill="${salt.crystalSecondary || '#CBD5E1'}"/>
        `}

        <!-- Specular Highlight -->
        <path d="M 34,34 L 34,114 Q 34,126 50,126" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
      </svg>
    `;
  }

  function renderFlameTestApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      stage = 'idle',
      prompt = '',
      tubeId = `flame_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const salt = resolveSalt(saltKey);
    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const cation = salt.cation;

    let flameColor = '#38BDF8';
    let flameOuter = '#0284C7';
    if (performed) {
      if (cation === 'Ca2+') {
        flameColor = '#EA580C'; // Brick red / orange-red
        flameOuter = '#DC2626';
      } else if (cation === 'Cu2+') {
        flameColor = '#10B981'; // Green / blue-green
        flameOuter = '#059669';
      } else if (cation === 'Ba2+') {
        flameColor = '#84CC16'; // Pale apple-green
        flameOuter = '#65A30D';
      } else if (salt.key.includes('sodium') || salt.name.includes('Sodium')) {
        flameColor = '#FACC15'; // Golden yellow
        flameOuter = '#EAB308';
      } else if (salt.key.includes('potassium') || salt.name.includes('Potassium')) {
        flameColor = '#C084FC'; // Lilac
        flameOuter = '#A855F7';
      }
    }

    return `
      <svg width="100" height="136" viewBox="0 0 100 136">
        <!-- Bunsen Burner Chimney & Base -->
        <rect x="42" y="80" width="16" height="36" fill="#64748B" stroke="#334155" stroke-width="1"/>
        <ellipse cx="50" cy="116" rx="32" ry="7" fill="#334155"/>
        <ellipse cx="50" cy="80" rx="8" ry="2.5" fill="#475569"/>

        <!-- Flame -->
        <g class="anim-flame">
          <path d="M 40,80 C 35,50 42,24 50,24 C 58,24 65,50 60,80 Z" fill="${flameOuter}" opacity="0.8"/>
          <path d="M 44,80 C 42,60 46,40 50,40 C 54,40 58,60 56,80 Z" fill="${flameColor}" opacity="0.95"/>
        </g>

        <!-- Nichrome Wire with Loop -->
        <g transform="${performed ? 'translate(0, 0)' : 'translate(20, -15)'}">
          <line x1="12" y1="12" x2="48" y2="48" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
          <circle cx="50" cy="50" r="3.5" fill="none" stroke="${performed ? flameColor : '#CBD5E1'}" stroke-width="2"/>
        </g>
      </svg>
    `;
  }

  // Unified Dispatcher: Dispatches to the exact apparatus based on procedure prompt & test ID
  function renderApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      testId = '',
      stage = 'idle',
      prompt = '',
      obsStr = '',
      tubeId = `app_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const pStr = (prompt || '').toLowerCase();
    const tId = (testId || '').toLowerCase();

    // 1. Physical Appearance of Solid
    if (
      pStr.includes('physical appearance') ||
      pStr.includes('appearance of solid') ||
      pStr.includes('describe solid') ||
      pStr.includes('appearance of sample') ||
      (pStr.includes('appearance') && !pStr.includes('dissolv') && !pStr.includes('water')) ||
      (tId.includes('appearance') && !pStr.includes('water')) ||
      (tId === 't1' && pStr.includes('describe') && pStr.includes('solid'))
    ) {
      return renderWatchGlassApparatusSvg({ saltKey, stage, prompt, tubeId });
    }

    // 2. Flame Test
    if (pStr.includes('flame test') || pStr.includes('nichrome') || tId.includes('flame')) {
      return renderFlameTestApparatusSvg({ saltKey, stage, prompt, tubeId });
    }

    // 3. Dry Thermal Heating
    if (
      (pStr.includes('heat') && (pStr.includes('dry') || pStr.includes('strongly') || pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('test tube'))) ||
      tId.includes('heat') ||
      tId.includes('ignit')
    ) {
      return renderDryHeatingApparatusSvg({ saltKey, stage, prompt, obsStr, tubeId });
    }

    // 4. Dissolution in Distilled Water
    if (
      pStr.includes('dissolv') ||
      (pStr.includes('distilled water') && (pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('portion')))
    ) {
      return renderDissolutionApparatusSvg({ saltKey, stage, prompt, obsStr, tubeId });
    }

    // 5. Standard Reagent Test Tube
    return renderTubeSvg(options);
  }

  // ── 6. Step Action Buttons & Flow Machine ──────────────────────
  function getMultiStageActions(testId, prompt, stage = 'idle', testKeyOverride = null) {
    const pStr = (prompt || '').toLowerCase();
    const tId = (testId || '').toLowerCase();

    // 0. Physical Appearance of Solid
    if (
      pStr.includes('physical appearance') ||
      pStr.includes('appearance of solid') ||
      pStr.includes('describe solid') ||
      pStr.includes('appearance of sample') ||
      (pStr.includes('appearance') && !pStr.includes('dissolv') && !pStr.includes('water')) ||
      (tId.includes('appearance') && !pStr.includes('water')) ||
      (tId === 't1' && pStr.includes('describe') && pStr.includes('solid'))
    ) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'inspected', label: '🔍 Inspect Solid Specimen Y', cls: 'btn-perform-test btn-step-inspect' }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Sample Inspected', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Re-examine', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 0b. Dissolving Solid in Distilled Water
    if (
      pStr.includes('dissolv') ||
      (pStr.includes('distilled water') && (pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('portion')))
    ) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'dissolved', label: '💧 Add Distilled Water & Dissolve', cls: 'btn-perform-test btn-step-dissolve' }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Stock Solution Formed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 0c. Flame Test
    if (pStr.includes('flame test') || pStr.includes('nichrome')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'flame_tested', label: '🔥 Insert Wire Loop into Flame', cls: 'btn-perform-test btn-step-heat' }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Flame Color Recorded', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 1. NaOH or NH3: Step 1 (Dropwise) -> Step 2 (Excess)
    if (tId.includes('naoh') || pStr.includes('naoh') || pStr.includes('sodium hydroxide')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'few_drops', label: '💧 Step 1: Add Dropwise (2–3 drops NaOH)', cls: 'btn-perform-test' }
        ];
      } else if (stage === 'few_drops' || stage === 'stage1') {
        return [
          { stage: 'excess', label: '🧪 Step 2: Add in Excess (~5 cm³ NaOH)', cls: 'btn-perform-test btn-step-excess' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 2. Potassium Iodide (KI): Step 1 (Add KI) -> Step 2 (Warm) -> Step 3 (Cool)
    if (tId.includes('ki') || pStr.includes('potassium iodide') || pStr.includes('iodide')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'few_drops', label: '💧 Step 1: Add 2–3 drops KI Solution', cls: 'btn-perform-test' }
        ];
      } else if (stage === 'few_drops' || stage === 'stage1') {
        return [
          { stage: 'heated', label: '🔥 Step 2: Warm Gently in Bunsen Flame', cls: 'btn-perform-test btn-step-heat' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else if (stage === 'heated') {
        return [
          { stage: 'cooled', label: '❄️ Step 3: Allow to Cool under Tap', cls: 'btn-perform-test btn-step-cool' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 6. Heating solid
    if (
      (pStr.includes('heat') && (pStr.includes('dry') || pStr.includes('strongly') || pStr.includes('solid') || pStr.includes('spatula'))) ||
      tId.includes('heat') ||
      tId.includes('ignit')
    ) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'heated', label: '🔥 Heat Strongly in Bunsen Flame', cls: 'btn-perform-test btn-step-heat' }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Thermal Observation Recorded', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // Default 1-step test
    if (!stage || stage === 'idle') {
      return [
        { stage: 'stage1', label: '🧪 Perform Test Procedure', cls: 'btn-perform-test' }
      ];
    } else {
      return [
        { stage: 'done', label: '✅ Reaction Observed', cls: 'btn-perform-test done', disabled: true },
        { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
      ];
    }
  }

  // ── 7. Public API Export ───────────────────────────────────────
  const QualitativeBenchCore = {
    SALTS,
    resolveSalt,
    resolveReactionState,
    renderTubeSvg,
    renderWatchGlassSvg,
    renderWatchGlassApparatusSvg,
    renderDryHeatingApparatusSvg,
    renderDissolutionApparatusSvg,
    renderFlameTestApparatusSvg,
    renderApparatusSvg,
    getMultiStageActions,
    playDropSplashSound,
    playEffervescenceSound,
    playFlameSound,
    playCrystalInspectSound,
    playReactionSound: function(reactionStateOrType, isExcess = false) {
      if (typeof reactionStateOrType === 'string') {
        if (reactionStateOrType === 'effervescence' || reactionStateOrType === 'bubbling') playEffervescenceSound();
        else if (reactionStateOrType === 'flame' || reactionStateOrType === 'heat') playFlameSound();
        else if (reactionStateOrType === 'inspect') playCrystalInspectSound();
        else playDropSplashSound(isExcess);
      } else if (reactionStateOrType && typeof reactionStateOrType === 'object') {
        if (reactionStateOrType.bubbling) playEffervescenceSound();
        else if (reactionStateOrType.isHeated || reactionStateOrType.soundType === 'flame') playFlameSound();
        else if (reactionStateOrType.isPhysicalAppearance || reactionStateOrType.soundType === 'inspect') playCrystalInspectSound();
        else playDropSplashSound(reactionStateOrType.isExcess);
      } else {
        playDropSplashSound(isExcess);
      }
    }
  };

  global.QualitativeBenchCore = QualitativeBenchCore;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = QualitativeBenchCore;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

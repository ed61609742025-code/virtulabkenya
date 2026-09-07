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

  // ── 3. Reaction Physics & State Resolver ───────────────────────
  function resolveReactionState(saltKey, testId, stage = 'idle', prompt = '', obsStr = '') {
    const salt = resolveSalt(saltKey);
    const pStr = (prompt || '').toLowerCase();
    const oStr = (obsStr || '').toLowerCase();
    const tId = (testId || '').toLowerCase();

    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const isExcess = stage === 'excess' || stage === 'step3_nh3' || stage === 'step2_bacl2' || stage === 'step2_gas_warm' || pStr.includes('excess');
    const isStep1 = stage === 'few_drops' || stage === 'step1' || stage === 'stage1' || stage === 'step1_hno3' || stage === 'step1_acid' || stage === 'step1_hcl' || stage === 'step1_feso4';
    const isHeated = stage === 'heated' || tId.includes('heat') || pStr.includes('heat') || pStr.includes('ignit');
    const isCooled = stage === 'cooled' || pStr.includes('cool');

    const cation = salt.cation;
    const anion = salt.anion;

    // Detect specialized test types
    const isNaOH = tId.includes('naoh') || pStr.includes('naoh') || pStr.includes('sodium hydroxide');
    const isNH3 = tId.includes('nh3') || pStr.includes('ammonia') || pStr.includes('nh₃') || pStr.includes('nh3');
    const isKI = tId.includes('ki') || pStr.includes('potassium iodide') || pStr.includes('iodide');
    const isBrownRing = tId.includes('brown_ring') || tId.includes('ring') || (pStr.includes('feso4') && pStr.includes('h2so4')) || pStr.includes('brown ring');
    const isAgNO3 = tId.includes('agno3') || pStr.includes('silver nitrate') || (pStr.includes('hno3') && pStr.includes('agno3'));
    const isBaCl2 = tId.includes('bacl2') || tId.includes('barium') || pStr.includes('barium chloride') || pStr.includes('ba(no3)2') || pStr.includes('bacl2');
    const isHCl = tId.includes('hcl') || tId.includes('acid') || pStr.includes('hydrochloric') || pStr.includes('limewater');
    const isHeat = tId.includes('heat') || pStr.includes('heat');
    const isAppearance = tId.includes('appearance') || pStr.includes('dissolv') || pStr.includes('water');

    let liquidColor = 'rgba(56, 189, 248, 0.25)';
    let ppt = false;
    let pptColor = '#FFFFFF';
    let pptDissolved = false;
    let bubbling = false;
    let complexDeepBlue = false;
    let statusLabel = 'Reaction Observed';

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
      } else if (isHeat) {
        if (anion === 'NO3-') {
          liquidColor = 'rgba(180, 83, 9, 0.55)';
          statusLabel = 'Heated Strongly: Brown fumes of NO₂ evolved; rekindles glowing splint (O₂)';
        } else if (cation === 'NH4+') {
          statusLabel = 'Heated: Sublimes; dense white fumes deposit on upper cooler walls';
        } else if (cation === 'Zn2+') {
          statusLabel = 'Heated: Solid turns yellow when hot, white on cooling';
        } else if (cation === 'Cu2+') {
          statusLabel = 'Heated: Blue crystals dehydrate to white anhydrous powder; water droplets condense';
        } else if (cation === 'Fe2+') {
          statusLabel = 'Heated: Pale green crystals turn dirty brown; water droplets condense';
        }
      } else if (isAppearance) {
        liquidColor = (cation === 'Cu2+') ? 'rgba(56, 189, 248, 0.6)'
          : (cation === 'Fe2+') ? 'rgba(16, 185, 129, 0.4)'
          : (cation === 'Fe3+') ? 'rgba(180, 83, 9, 0.45)'
          : 'rgba(255, 255, 255, 0.25)';
        statusLabel = `Appearance: ${salt.appearance} dissolves completely`;
      }
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
      statusLabel
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
        <path d="M 24,42 C 34,54 96,54 106,42" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `;
  }

  // ── 6. Step Action Buttons & Flow Machine ──────────────────────
  function getMultiStageActions(testId, prompt, stage = 'idle', testKeyOverride = null) {
    const pStr = (prompt || '').toLowerCase();
    const tId = (testId || '').toLowerCase();

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

    if (tId.includes('nh3') || pStr.includes('ammonia') || pStr.includes('nh₃') || pStr.includes('nh3')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'few_drops', label: '💧 Step 1: Add Dropwise (2–3 drops NH₃)', cls: 'btn-perform-test' }
        ];
      } else if (stage === 'few_drops' || stage === 'stage1') {
        return [
          { stage: 'excess', label: '🧪 Step 2: Add in Excess (~5 cm³ NH₃)', cls: 'btn-perform-test btn-step-excess' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 2. Potassium Iodide (KI): Step 1 (Add KI) -> Step 2 (Warm in Water Bath) -> Step 3 (Cool for Spangles)
    if (tId.includes('ki') || pStr.includes('potassium iodide') || pStr.includes('iodide')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'few_drops', label: '💧 Step 1: Add KI Solution', cls: 'btn-perform-test' }
        ];
      } else if (stage === 'few_drops' || stage === 'stage1') {
        return [
          { stage: 'heated', label: '🔥 Step 2: Warm Gently in Water Bath', cls: 'btn-perform-test btn-step-heat' },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      } else if (stage === 'heated') {
        return [
          { stage: 'cooled', label: '❄️ Step 3: Cool under Tap Water (Spangles)', cls: 'btn-perform-test btn-step-cool' },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 3. Silver Nitrate (AgNO3): Step 1 (Add HNO3) -> Step 2 (Follow with AgNO3) -> Step 3 (Test with NH3)
    if (tId.includes('agno3') || (pStr.includes('agno3') && pStr.includes('hno3')) || pStr.includes('silver nitrate')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'step1_hno3', label: '💧 Step 1: Add Dilute Nitric Acid (HNO₃)', cls: 'btn-perform-test btn-step-acid' }
        ];
      } else if (stage === 'step1_hno3' || stage === 'stage1') {
        return [
          { stage: 'step2_agno3', label: '🔬 Step 2: Follow with Silver Nitrate (AgNO₃)', cls: 'btn-perform-test btn-step-reagent' },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      } else if (stage === 'step2_agno3') {
        return [
          { stage: 'step3_nh3', label: '🫧 Step 3: Test Precipitate with Aqueous NH₃', cls: 'btn-perform-test btn-step-ammonia' },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 4. Barium Chloride / Nitrate (Ba2+): Step 1 (Add Acid) -> Step 2 (Follow with Ba reagent)
    if (tId.includes('bacl2') || tId.includes('barium') || pStr.includes('ba(no3)2') || pStr.includes('barium')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'step1_acid', label: '💧 Step 1: Add Dilute Acid (HCl / HNO₃)', cls: 'btn-perform-test btn-step-acid' }
        ];
      } else if (stage === 'step1_acid' || stage === 'stage1') {
        return [
          { stage: 'step2_bacl2', label: '🧫 Step 2: Follow with Barium Solution', cls: 'btn-perform-test btn-step-reagent' },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 5. Brown Ring: Step 1 (Add fresh FeSO4) -> Step 2 (Conc H2SO4)
    if (tId.includes('brown_ring') || tId.includes('ring') || pStr.includes('brown ring')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'step1_feso4', label: '🧪 Step 1: Add Fresh FeSO₄(aq) Solution', cls: 'btn-perform-test btn-step-reagent' }
        ];
      } else if (stage === 'step1_feso4' || stage === 'stage1') {
        return [
          { stage: 'step2_h2so4', label: '🟤 Step 2: Trickle Conc. H₂SO₄ down the side', cls: 'btn-perform-test btn-step-heat' },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 6. Heating solid
    if (tId.includes('heat') || pStr.includes('heat') || pStr.includes('ignit')) {
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
    getMultiStageActions,
    playDropSplashSound,
    playEffervescenceSound,
    playFlameSound,
    playReactionSound: function(reactionStateOrType, isExcess = false) {
      if (typeof reactionStateOrType === 'string') {
        if (reactionStateOrType === 'effervescence' || reactionStateOrType === 'bubbling') playEffervescenceSound();
        else if (reactionStateOrType === 'flame' || reactionStateOrType === 'heat') playFlameSound();
        else playDropSplashSound(isExcess);
      } else if (reactionStateOrType && typeof reactionStateOrType === 'object') {
        if (reactionStateOrType.bubbling) playEffervescenceSound();
        else if (reactionStateOrType.isHeated) playFlameSound();
        else playDropSplashSound(reactionStateOrType.isExcess);
      } else {
        playDropSplashSound(isExcess);
      }
    }
  };

  global.QualitativeBenchCore = QualitativeBenchCore;

})(typeof window !== 'undefined' ? window : this);

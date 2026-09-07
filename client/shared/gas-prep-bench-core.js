// ============================================================
//  VirtuLab Kenya — Canonical Gas Preparation & Collection Core Module
//  High-Fidelity SVG Chemical Apparatus, Physics Models & Web Audio Synthesizer
// ============================================================

(function(global) {
  'use strict';

  // ── 1. Canonical Gas Chemistry Database ────────────────────────
  const GAS_DATABASE = {
    O2: {
      key: 'O2',
      name: 'Oxygen Gas',
      formula: 'O₂',
      equation: '2H₂O₂(aq) —[MnO₂]→ 2H₂O(l) + O₂(g)↑',
      reactants: 'Hydrogen Peroxide (H₂O₂) + Manganese(IV) Oxide (MnO₂)',
      heatingRequired: false,
      densityVsAir: 'Slightly denser than air (approx 1.1x)',
      solubilityInWater: 'Slightly soluble in water',
      compatibleDrying: ['concH2SO4', 'anhydrousCaCl2'],
      compatibleCollection: ['overWater', 'downwardDelivery'],
      colorHex: '#10B981',
      tests: {
        glowingSplint: { result: 'Glowing wooden splint relights into flame.', inference: 'Supports combustion; confirms Oxygen (O₂).' },
        dampLitmus: { result: 'Both red and blue litmus papers remain unchanged.', inference: 'Neutral gas.' }
      }
    },
    CO2: {
      key: 'CO2',
      name: 'Carbon Dioxide',
      formula: 'CO₂',
      equation: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)↑',
      reactants: 'Calcium Carbonate (CaCO₃ chips) + Dilute Hydrochloric Acid (HCl)',
      heatingRequired: false,
      densityVsAir: 'Denser than air (approx 1.5x)',
      solubilityInWater: 'Fairly soluble in cold water',
      compatibleDrying: ['concH2SO4', 'anhydrousCaCl2'],
      compatibleCollection: ['downwardDelivery', 'overWater'],
      colorHex: '#64748B',
      tests: {
        limeWater: { result: 'Forms white precipitate; limewater turns milky.', inference: 'Confirms Carbon Dioxide (CO₂).' },
        dampLitmus: { result: 'Moist blue litmus paper turns faint pink/red.', inference: 'Weakly acidic gas.' }
      }
    },
    H2: {
      key: 'H2',
      name: 'Hydrogen Gas',
      formula: 'H₂',
      equation: 'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)↑',
      reactants: 'Granulated Zinc (Zn) + Dilute Sulfuric Acid (H₂SO₄)',
      heatingRequired: false,
      densityVsAir: 'Much less dense than air (approx 0.07x, lightest gas)',
      solubilityInWater: 'Insoluble in water',
      compatibleDrying: ['concH2SO4', 'anhydrousCaCl2'],
      compatibleCollection: ['overWater', 'upwardDelivery'],
      colorHex: '#38BDF8',
      tests: {
        burningSplint: { result: 'Burns with a characteristic "squeaky pop" sound.', inference: 'Confirms Hydrogen (H₂).' }
      }
    },
    NH3: {
      key: 'NH3',
      name: 'Ammonia Gas',
      formula: 'NH₃',
      equation: '2NH₄Cl(s) + Ca(OH)₂(s) —[Heat]→ CaCl₂(s) + 2H₂O(l) + 2NH₃(g)↑',
      reactants: 'Ammonium Chloride (NH₄Cl) + Calcium Hydroxide (Ca(OH)₂)',
      heatingRequired: true,
      densityVsAir: 'Less dense than air (approx 0.6x)',
      solubilityInWater: 'Extremely soluble in water (alkaline solution)',
      compatibleDrying: ['quicklimeCaO'],
      compatibleCollection: ['upwardDelivery'],
      colorHex: '#A855F7',
      tests: {
        dampLitmus: { result: 'Moist red litmus paper turns blue immediately.', inference: 'Alkaline gas; confirms Ammonia (NH₃).' },
        hclRod: { result: 'Glass rod dipped in conc. HCl produces dense white fumes of NH₄Cl.', inference: 'Confirms Ammonia (NH₃).' }
      }
    },
    Cl2: {
      key: 'Cl2',
      name: 'Chlorine Gas',
      formula: 'Cl₂',
      equation: 'MnO₂(s) + 4HCl(conc) —[Heat]→ MnCl₂(aq) + 2H₂O(l) + Cl₂(g)↑',
      reactants: 'Manganese(IV) Oxide (MnO₂) + Concentrated HCl',
      heatingRequired: true,
      densityVsAir: 'Much denser than air (approx 2.5x)',
      solubilityInWater: 'Soluble in water (forms pale yellow chlorine water)',
      compatibleDrying: ['concH2SO4'],
      compatibleCollection: ['downwardDelivery'],
      colorHex: '#84CC16',
      tests: {
        dampLitmus: { result: 'Moist blue litmus paper turns red, then is bleached white.', inference: 'Acidic & strong bleaching agent; confirms Chlorine (Cl₂).' }
      }
    }
  };

  function resolveGas(gasKey) {
    if (!gasKey) return GAS_DATABASE.O2;
    const norm = String(gasKey).toUpperCase().trim();
    if (norm.includes('CO2') || norm.includes('CARBON')) return GAS_DATABASE.CO2;
    if (norm.includes('H2') || norm.includes('HYDROGEN')) return GAS_DATABASE.H2;
    if (norm.includes('NH3') || norm.includes('AMMONIA')) return GAS_DATABASE.NH3;
    if (norm.includes('CL2') || norm.includes('CHLORINE')) return GAS_DATABASE.Cl2;
    return GAS_DATABASE.O2;
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

  function playGasBubbling() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.random() * 300, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.04);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch(e) {}
  }

  function playSqueakyPop() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(1480, t + 0.035);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch(e) {}
  }

  function playFlameWhoosh() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  // ── 3. High-Fidelity SVG Apparatus Renderers ────────────────────
  function renderCompleteGasApparatusSvg(options = {}) {
    const {
      gasKey = 'O2',
      isGenerating = false,
      heatingEnabled = false,
      dryingAgent = 'concH2SO4',
      collectionMethod = 'overWater',
      width = 500,
      height = 280
    } = options;

    const gas = resolveGas(gasKey);

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 500 280" style="display:block; margin:0 auto;">
        <defs>
          <linearGradient id="gasFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#1D4ED8"/>
            <stop offset="50%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#BAE6FD" stop-opacity="0.3"/>
          </linearGradient>
        </defs>

        <!-- Bunsen Burner underneath Flask if heating -->
        ${heatingEnabled ? `
          <rect x="95" y="240" width="30" height="35" fill="#475569" stroke="#334155" stroke-width="1"/>
          <path d="M 110,205 C 104,215 106,240 110,240 C 114,240 116,215 110,205 Z" fill="url(#gasFlameGrad)" class="anim-flame" style="transform-origin: 110px 240px;"/>
        ` : ''}

        <!-- 1. Generation Flask (Flat Bottom) -->
        <g id="flaskGroup">
          <path d="M 100,120 L 100,165 L 75,225 C 72,232 78,236 86,236 L 134,236 C 142,236 148,232 145,225 L 120,165 L 120,120 Z" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="2"/>
          <ellipse cx="110" cy="119" rx="12" ry="3" fill="rgba(255,255,255,0.3)" stroke="#38BDF8" stroke-width="0.8"/>
          <!-- Reactant Liquid / Solid -->
          <path d="M 80,210 L 76,224 C 74,230 78,234 86,234 L 134,234 C 142,234 146,230 144,224 L 140,210 Z" fill="rgba(56, 189, 248, 0.45)"/>
          <!-- Thistle Funnel -->
          <line x1="105" y1="60" x2="105" y2="225" stroke="#94A3B8" stroke-width="2.5"/>
          <polygon points="98,40 112,40 106,60 104,60" fill="rgba(255,255,255,0.4)" stroke="#94A3B8" stroke-width="1.2"/>
          <!-- Two-Hole Rubber Bung -->
          <polygon points="98,120 122,120 120,105 100,105" fill="#334155" stroke="#1E293B" stroke-width="1"/>
        </g>

        <!-- Delivery Tube 1: From Flask to Drying Vessel -->
        <path d="M 115,105 L 115,75 Q 115,68 125,68 L 225,68 Q 235,68 235,78 L 235,175" fill="none" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round"/>

        <!-- 2. Drying Vessel (Wash Bottle / Drying Tower) -->
        <g id="dryingGroup">
          <rect x="215" y="145" width="40" height="90" rx="6" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="2"/>
          <!-- Drying Reagent Liquid / Solid Fused Granules -->
          <rect x="217" y="185" width="36" height="48" rx="4" fill="${dryingAgent === 'concH2SO4' ? '#F59E0B' : '#FFFFFF'}" opacity="0.6"/>
          <text x="235" y="250" font-size="9" fill="#94A3B8" text-anchor="middle" font-family="monospace">Drying</text>
        </g>

        <!-- Delivery Tube 2: From Drying Bottle to Collection Jar -->
        <path d="M 245,155 L 245,85 Q 245,78 255,78 L 365,78 Q 375,78 375,88 L 375,150" fill="none" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round"/>

        <!-- 3. Collection Assembly -->
        <g id="collectionGroup">
          ${collectionMethod === 'overWater' ? `
            <!-- Pneumatic Trough with Water -->
            <rect x="330" y="200" width="90" height="40" rx="4" fill="rgba(2, 132, 199, 0.35)" stroke="#38BDF8" stroke-width="1.8"/>
            <!-- Inverted Gas Jar over Beehive Shelf -->
            <rect x="355" y="110" width="40" height="95" rx="3" fill="rgba(255,255,255,0.22)" stroke="#94A3B8" stroke-width="2"/>
            <!-- Collected Gas Pocket at top of inverted jar -->
            <rect x="357" y="112" width="36" height="${isGenerating ? '55' : '0'}" rx="2" fill="${gas.colorHex}" opacity="0.5"/>
          ` : `
            <!-- Upright Gas Jar (Downward Delivery) -->
            <rect x="355" y="140" width="40" height="95" rx="3" fill="rgba(255,255,255,0.22)" stroke="#94A3B8" stroke-width="2"/>
            <!-- Collected Gas Layer in jar -->
            <rect x="357" y="${isGenerating ? '185' : '233'}" width="36" height="${isGenerating ? '48' : '0'}" rx="2" fill="${gas.colorHex}" opacity="0.5"/>
          `}
          <text x="375" y="255" font-size="9" fill="#94A3B8" text-anchor="middle" font-family="monospace">Collection</text>
        </g>

        <!-- Evolving Bubbles if Generating -->
        ${isGenerating ? `
          <g class="anim-bubble">
            <circle cx="108" cy="225" r="2.2" fill="#FFF" opacity="0.9"/>
            <circle cx="116" cy="220" r="2.8" fill="#FFF" opacity="0.95"/>
            <circle cx="112" cy="214" r="2.0" fill="#FFF" opacity="0.9"/>
          </g>
        ` : ''}

        <!-- Status Tag -->
        <rect x="180" y="15" width="140" height="24" rx="6" fill="#0F172A" stroke="#334155" stroke-width="1.2"/>
        <text x="250" y="31" font-size="11" font-weight="800" fill="${gas.colorHex}" text-anchor="middle" font-family="monospace">
          ${gas.formula}: ${isGenerating ? 'GENERATING' : 'READY'}
        </text>
      </svg>
    `;
  }

  // ── 4. Public API Export ───────────────────────────────────────
  const GasPrepBenchCore = {
    GAS_DATABASE,
    resolveGas,
    renderCompleteGasApparatusSvg,
    playGasBubbling,
    playSqueakyPop,
    playFlameWhoosh
  };

  global.GasPrepBenchCore = GasPrepBenchCore;

})(typeof window !== 'undefined' ? window : this);

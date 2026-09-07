// ============================================================
//  VirtuLab Kenya — Canonical Solubility Curves & Crystallization Core Module
//  High-Fidelity SVG Water Bath Apparatus, Crystal Habit Models & Web Audio Synthesizer
// ============================================================

(function(global) {
  'use strict';

  // ── 1. Salt Thermodynamic & Crystallography Registry ───────────
  const SALT_MODELS = {
    'KNO3': {
      name: 'Potassium Nitrate (KNO₃) — Salt W',
      formula: 'KNO₃',
      knecYear: 'KCSE 2018',
      color: '#FFFFFF',
      solutionColor: 'rgba(215, 240, 255, 0.25)',
      crystalHabit: 'Orthorhombic Needles & Slender Prisms',
      crystalColor: '#F8FAFC',
      solubilityAtTemp: (t) => 13.3 + (0.57 * t) + (0.015 * Math.pow(t, 2)),
      tempFromSolubility: (s) => {
        const a = 0.015, b = 0.57, c = 13.3 - s;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return 0;
        return (-b + Math.sqrt(disc)) / (2 * a);
      }
    },
    'KClO3': {
      name: 'Potassium Chlorate (KClO₃)',
      formula: 'KClO₃',
      knecYear: 'KCSE 2021',
      color: '#F8FAFC',
      solutionColor: 'rgba(230, 245, 255, 0.2)',
      crystalHabit: 'Monoclinic Pearlescent Plates',
      crystalColor: '#FFFFFF',
      solubilityAtTemp: (t) => 3.3 + (0.25 * t) + (0.005 * Math.pow(t, 2)),
      tempFromSolubility: (s) => {
        const a = 0.005, b = 0.25, c = 3.3 - s;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return 0;
        return (-b + Math.sqrt(disc)) / (2 * a);
      }
    },
    'CuSO4': {
      name: 'Copper(II) Sulfate (CuSO₄·5H₂O)',
      formula: 'CuSO₄·5H₂O',
      knecYear: 'KCSE 2012',
      color: '#0284C7',
      solutionColor: 'rgba(2, 132, 199, 0.5)',
      crystalHabit: 'Triclinic Deep Blue Rhombs',
      crystalColor: '#38BDF8',
      solubilityAtTemp: (t) => 14.3 + (0.28 * t) + (0.002 * Math.pow(t, 2)),
      tempFromSolubility: (s) => {
        const a = 0.002, b = 0.28, c = 14.3 - s;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return 0;
        return (-b + Math.sqrt(disc)) / (2 * a);
      }
    },
    'NaCl': {
      name: 'Sodium Chloride (NaCl)',
      formula: 'NaCl',
      knecYear: 'Standard Reference',
      color: '#F8FAFC',
      solutionColor: 'rgba(240, 248, 255, 0.2)',
      crystalHabit: 'Cubic Granules',
      crystalColor: '#FFFFFF',
      solubilityAtTemp: (t) => 35.7 + (0.02 * t),
      tempFromSolubility: (s) => (s - 35.7) / 0.02
    }
  };

  function resolveSaltModel(key) {
    if (!key) return SALT_MODELS.KNO3;
    const norm = String(key).toUpperCase().trim();
    if (norm.includes('CLO3')) return SALT_MODELS.KClO3;
    if (norm.includes('CUSO4') || norm.includes('COPPER')) return SALT_MODELS.CuSO4;
    if (norm.includes('NACL') || norm.includes('SODIUM CHLORIDE')) return SALT_MODELS.NaCl;
    return SALT_MODELS.KNO3;
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

  function playCrystalNucleationChime() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      // Dual-harmonic crystal bell chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1174.66, t); // D6
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760.00, t); // A6

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.65);
      osc2.stop(t + 0.65);
    } catch(e) {}
  }

  function playWaterSimmer() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  // ── 3. High-Fidelity SVG Apparatus Renderers ────────────────────

  // Hot Water Bath Setup with Clamped Boiling Tube, Beaker, Tripod, Gauze & Burner
  function renderSolubilityBathSvg(options = {}) {
    const {
      saltKey = 'KNO3',
      temp = 25.0,
      isHeating = false,
      isDissolved = false,
      width = 240,
      height = 290
    } = options;

    const salt = resolveSaltModel(saltKey);
    const minT = 20, maxT = 95;
    const normT = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)));
    const mercuryTopY = 150 - normT * 105;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 240 290" style="display:block; margin:0 auto;">
        <defs>
          <linearGradient id="solPyrexBeaker" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
            <stop offset="25%" stop-color="rgba(255,255,255,0.08)"/>
            <stop offset="75%" stop-color="rgba(255,255,255,0.05)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.3)"/>
          </linearGradient>
          <linearGradient id="solBlueFlame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#1D4ED8"/>
            <stop offset="50%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#BAE6FD" stop-opacity="0.2"/>
          </linearGradient>
        </defs>

        <!-- Bunsen Burner & Blue Heating Flame -->
        <rect x="106" y="240" width="28" height="38" rx="2" fill="#475569" stroke="#1E293B" stroke-width="1"/>
        <rect x="116" y="222" width="8" height="18" fill="#64748B"/>
        ${isHeating ? `
          <path d="M 120,188 C 112,202 114,222 120,222 C 126,222 128,202 120,188 Z" fill="url(#solBlueFlame)" class="anim-flame" style="transform-origin: 120px 222px;"/>
        ` : ''}

        <!-- Tripod Stand Legs & Ring with Wire Gauze -->
        <line x1="45" y1="285" x2="60" y2="185" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="195" y1="285" x2="180" y2="185" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <!-- Ceramic Centered Wire Gauze -->
        <rect x="52" y="182" width="136" height="4" rx="1.5" fill="#475569" stroke="#1E293B" stroke-width="1"/>
        <rect x="85" y="181" width="70" height="2" fill="#E2E8F0"/>

        <!-- 250 mL Pyrex Water Bath Beaker -->
        <path d="M 62,80 L 62,180 C 62,184 68,186 78,186 L 162,186 C 172,186 178,184 178,180 L 178,80" fill="url(#solPyrexBeaker)" stroke="#94A3B8" stroke-width="2"/>
        <path d="M 58,80 L 62,82" stroke="#94A3B8" stroke-width="1.8"/>
        <!-- Bath Water Fill -->
        <path d="M 64,105 L 64,180 C 64,183 68,185 78,185 L 162,185 C 172,185 176,183 176,180 L 176,105 Z" fill="rgba(56, 189, 248, 0.28)"/>
        <ellipse cx="120" cy="105" rx="56" ry="6" fill="rgba(56, 189, 248, 0.45)"/>

        <!-- Boiling Tube inside Water Bath -->
        <path d="M 107,32 L 107,162 C 107,170 113,174 120,174 C 127,174 133,170 133,162 L 133,32 Z" fill="rgba(255,255,255,0.2)" stroke="#64748B" stroke-width="1.5"/>
        <ellipse cx="120" cy="31" rx="14" ry="3.5" fill="rgba(255,255,255,0.4)" stroke="#38BDF8" stroke-width="0.8"/>

        <!-- Solute Solution in Boiling Tube -->
        <path d="M 108,72 L 108,162 C 108,168 113,172 120,172 C 127,172 132,168 132,162 L 132,72 Z" fill="${salt.solutionColor}"/>
        <ellipse cx="120" cy="72" rx="12" ry="3" fill="${salt.solutionColor}" opacity="0.9"/>

        <!-- Undissolved Salt Crystals at bottom of boiling tube -->
        ${!isDissolved ? `
          <ellipse cx="120" cy="168" rx="10" ry="3.5" fill="${salt.crystalColor}" opacity="0.95"/>
          <circle cx="115" cy="166" r="2" fill="${salt.crystalColor}"/>
          <circle cx="125" cy="167" r="2.2" fill="${salt.crystalColor}"/>
        ` : ''}

        <!-- Thermometer Dipping into Boiling Tube -->
        <rect x="124" y="10" width="5" height="152" rx="2.5" fill="rgba(255,255,255,0.75)" stroke="#64748B" stroke-width="1"/>
        <rect x="125.5" y="${mercuryTopY}" width="2" height="${158 - mercuryTopY}" fill="#EF4444"/>
        <circle cx="126.5" cy="158" r="4.5" fill="#EF4444"/>

        <!-- Glass Stirrer Loop in Boiling Tube -->
        <line x1="114" y1="20" x2="114" y2="155" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="114" cy="155" rx="5" ry="2" fill="none" stroke="#94A3B8" stroke-width="1.5"/>

        <!-- Temperature Readout -->
        <rect x="156" y="22" width="76" height="24" rx="6" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
        <text x="194" y="38" font-size="11" font-weight="800" fill="#EF4444" text-anchor="middle" font-family="monospace">
          ${temp.toFixed(1)} °C
        </text>
      </svg>
    `;
  }

  // ── 4. Public API Export ───────────────────────────────────────
  const SolubilityBenchCore = {
    SALT_MODELS,
    resolveSaltModel,
    renderSolubilityBathSvg,
    playCrystalNucleationChime,
    playWaterSimmer
  };

  global.SolubilityBenchCore = SolubilityBenchCore;

})(typeof window !== 'undefined' ? window : this);

// ============================================================
//  VirtuLab Kenya — Canonical Thermochemistry & Energy Changes Core Module
//  High-Fidelity SVG Calorimeter Apparatus, Physics Models & Web Audio Synthesizer
// ============================================================

(function(global) {
  'use strict';

  // ── 1. Thermodynamic Reaction Systems Registry ─────────────────
  const SYSTEMS = {
    'KCSE_2022_DISPLACEMENT': {
      id: 'KCSE_2022_DISPLACEMENT',
      name: 'Displacement Enthalpy: Zn(s) + CuSO₄(aq)',
      knecYear: 'KCSE 2022 / 2017 Paper 3',
      category: 'displacement',
      reactantA: '0.5M Copper(II) Sulfate (CuSO₄) Solution',
      volumeA: 25.0, // cm³
      reactantB: 'Zinc Powder (Zn)',
      massB: 2.00, // g (excess)
      deltaH_theoretical: -217.0, // kJ/mol
      initialTemp: 22.0,
      coolingRate: 0.0035,
      initialColor: 'rgba(2, 132, 199, 0.8)', // Deep blue
      finalColor: 'rgba(230, 242, 250, 0.35)', // Clear / pale
      depositColor: '#8B4513' // Brown copper deposit
    },
    'KCSE_2023_NEUTRALIZATION': {
      id: 'KCSE_2023_NEUTRALIZATION',
      name: 'Neutralization Enthalpy: NaOH(aq) + HCl(aq)',
      knecYear: 'KCSE 2023 / 2019 Paper 3',
      category: 'neutralization',
      reactantA: '2.0M Hydrochloric Acid (HCl)',
      volumeA: 25.0, // cm³
      reactantB: '2.0M Sodium Hydroxide (NaOH)',
      volumeB: 25.0, // cm³
      deltaH_theoretical: -57.1, // kJ/mol of water
      initialTemp: 21.5,
      coolingRate: 0.0028,
      initialColor: 'rgba(235, 245, 255, 0.35)',
      finalColor: 'rgba(235, 245, 255, 0.35)',
      depositColor: null
    },
    'KCSE_2024_WEAK_STRONG': {
      id: 'KCSE_2024_WEAK_STRONG',
      name: 'Neutralization Enthalpy: CH₃COOH(aq) + NaOH(aq)',
      knecYear: 'KCSE 2024 Paper 3 Spec',
      category: 'neutralization',
      reactantA: '2.0M Ethanoic Acid (CH₃COOH)',
      volumeA: 25.0,
      reactantB: '2.0M Sodium Hydroxide (NaOH)',
      volumeB: 25.0,
      deltaH_theoretical: -55.2, // kJ/mol
      initialTemp: 22.0,
      coolingRate: 0.0030,
      initialColor: 'rgba(240, 248, 255, 0.35)',
      finalColor: 'rgba(240, 248, 255, 0.35)',
      depositColor: null
    }
  };

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

  function playMetronomeBeep(highPitch = false) {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(highPitch ? 1200 : 880, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch(e) {}
  }

  function playStirrerSwoosh() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.25);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch(e) {}
  }

  // ── 3. High-Fidelity SVG Calorimeter Apparatus ──────────────────
  function renderCalorimeterSvg(options = {}) {
    const {
      temp = 22.0,
      liquidColor = 'rgba(56, 189, 248, 0.5)',
      hasDeposit = false,
      isStirring = false,
      width = 240,
      height = 280
    } = options;

    // Thermometer mercury height (mapped from 15°C to 50°C)
    const minT = 15, maxT = 55;
    const normT = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)));
    const mercuryTopY = 160 - normT * 110; // Moves between 160 (15°C) and 50 (55°C)

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 240 280" style="display:block; margin:0 auto;">
        <defs>
          <linearGradient id="cupShading" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="30%" stop-color="#F1F5F9"/>
            <stop offset="70%" stop-color="#E2E8F0"/>
            <stop offset="100%" stop-color="#CBD5E1"/>
          </linearGradient>
          <linearGradient id="beakerGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
            <stop offset="20%" stop-color="rgba(255,255,255,0.08)"/>
            <stop offset="80%" stop-color="rgba(255,255,255,0.05)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.3)"/>
          </linearGradient>
        </defs>

        <!-- Outer 250 mL Pyrex Protective Beaker -->
        <path d="M 40,110 L 40,245 C 40,255 50,260 62,260 L 178,260 C 190,260 200,255 200,245 L 200,110" fill="url(#beakerGlass)" stroke="#94A3B8" stroke-width="2"/>
        <path d="M 36,110 L 40,113" stroke="#94A3B8" stroke-width="2"/>

        <!-- Insulating Cotton Wool Nest inside Beaker -->
        <path d="M 44,200 C 48,225 60,255 80,255 L 160,255 C 180,255 192,225 196,200 L 192,250 L 48,250 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>

        <!-- Polystyrene Calorimeter Cup (Coffee Cup) -->
        <path d="M 60,118 L 72,240 C 73,248 80,252 90,252 L 150,252 C 160,252 167,248 168,240 L 180,118 Z" fill="url(#cupShading)" stroke="#94A3B8" stroke-width="1.8"/>

        <!-- Liquid Contents inside Cup -->
        <path d="M 68,168 L 74,238 C 75,245 82,248 92,248 L 148,248 C 158,248 165,245 166,238 L 172,168 Z" fill="${liquidColor}"/>
        <ellipse cx="120" cy="168" rx="52" ry="7" fill="${liquidColor}" opacity="0.9"/>

        <!-- Copper Deposit at Base if displacement reaction -->
        ${hasDeposit ? `
          <ellipse cx="120" cy="246" rx="28" ry="4" fill="#8B4513" opacity="0.95"/>
          <circle cx="110" cy="244" r="2.5" fill="#A0522D"/>
          <circle cx="128" cy="245" r="3.0" fill="#8B4513"/>
          <circle cx="118" cy="246" r="2.0" fill="#CD853F"/>
        ` : ''}

        <!-- Cardboard / Plastic Insulating Lid -->
        <ellipse cx="120" cy="116" rx="66" ry="10" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
        <ellipse cx="120" cy="114" rx="63" ry="8" fill="#F1F5F9"/>

        <!-- Glass / Plastic Stirrer with Helical Loop -->
        <g style="transition: transform 0.3s ease; transform: translate(0px, ${isStirring ? '-8px' : '0px'});">
          <!-- Stirrer Shaft -->
          <line x1="95" y1="50" x2="95" y2="235" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
          <!-- Stirrer Loop at bottom -->
          <ellipse cx="95" cy="235" rx="14" ry="4" fill="none" stroke="#94A3B8" stroke-width="2.5"/>
          <!-- Stirrer Handle -->
          <ellipse cx="95" cy="50" rx="4" ry="3" fill="#64748B"/>
        </g>

        <!-- Precision 0.1°C Thermometer Stem & Bulb -->
        <!-- Thermometer Glass Stem -->
        <rect x="138" y="25" width="8" height="210" rx="4" fill="rgba(255,255,255,0.7)" stroke="#64748B" stroke-width="1.2"/>
        <!-- Degree Graduations -->
        <g stroke="#64748B" stroke-width="0.8" opacity="0.85">
          <line x1="143" y1="50" x2="146" y2="50"/>
          <line x1="143" y1="75" x2="146" y2="75"/>
          <line x1="143" y1="100" x2="146" y2="100"/>
          <line x1="143" y1="125" x2="146" y2="125"/>
          <line x1="143" y1="150" x2="146" y2="150"/>
        </g>
        <!-- Red Ethanol / Mercury Column -->
        <rect x="140.5" y="${mercuryTopY}" width="3" height="${230 - mercuryTopY}" fill="#EF4444"/>
        <!-- Bulb at bottom -->
        <circle cx="142" cy="232" r="6" fill="#EF4444" stroke="#B91C1C" stroke-width="1"/>

        <!-- Floating Live Temperature Tag -->
        <rect x="156" y="32" width="76" height="26" rx="6" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
        <text x="194" y="49" font-size="11" font-weight="800" fill="#EF4444" text-anchor="middle" font-family="monospace">
          ${temp.toFixed(1)} °C
        </text>
      </svg>
    `;
  }

  // ── 4. Public API Export ───────────────────────────────────────
  const EnergyBenchCore = {
    SYSTEMS,
    renderCalorimeterSvg,
    playMetronomeBeep,
    playStirrerSwoosh
  };

  global.EnergyBenchCore = EnergyBenchCore;

})(typeof window !== 'undefined' ? window : this);

// ============================================================
//  VirtuLab Kenya — Canonical Reaction Rates & Chemical Kinetics Core Module
//  High-Fidelity SVG Apparatus, Physics Kinetics Models & Web Audio Synthesizer
// ============================================================

(function(global) {
  'use strict';

  // ── 1. Reaction Kinetics Models & Constants ────────────────────
  const EXPERIMENTS = {
    cross: {
      id: 'cross',
      name: 'Disappearing Cross (Sodium Thiosulfate + Dilute HCl)',
      equation: 'Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + SO₂(g) + S(s)↓ + H₂O(l)',
      description: 'Precipitation of colloidal yellow sulfur obscures black cross on paper beneath beaker.',
      standardVolsThio: [50, 40, 30, 20, 10],
      standardVolsWater: [0, 10, 20, 30, 40],
      standardVolAcid: 5.0,
      knecStandard: 'KCSE Chemistry Form 4 Topic 1 / Paper 3 Practical'
    },
    syringe: {
      id: 'syringe',
      name: 'Gas Syringe Collection (CaCO₃ / Mg + Dilute Acid)',
      equation: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)↑',
      description: 'Direct measurement of gas evolution volume over time using an airtight 100 cm³ gas syringe.',
      maxVolume: 100.0,
      knecStandard: 'KCSE Chemistry Form 4 Topic 1'
    },
    massLoss: {
      id: 'massLoss',
      name: 'Mass Loss on Electronic Digital Balance',
      equation: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)↑',
      description: 'Continuous digital mass decrease as carbon dioxide gas escapes through cotton wool plug.',
      knecStandard: 'KCSE Chemistry Form 4 Topic 1'
    },
    catalyst: {
      id: 'catalyst',
      name: 'Catalytic Decomposition of Hydrogen Peroxide',
      equation: '2H₂O₂(aq) —[MnO₂]→ 2H₂O(l) + O₂(g)↑',
      description: 'Comparing efficacy of catalysts (MnO₂, CuO, Fe₂O₃, Fresh Potato Catalase) on reaction rate.',
      knecStandard: 'KCSE Chemistry Form 4 Topic 1'
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

  function playStopwatchClick() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.02);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch(e) {}
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
      osc.frequency.setValueAtTime(600 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 600, t + 0.04);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch(e) {}
  }

  function playPourLiquid() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  // ── 3. High-Fidelity SVG Apparatus Renderers ────────────────────

  // Disappearing Cross Apparatus: Pyrex Beaker over Black X with Sulfur Turbidity
  function renderDisappearingCrossSvg(options = {}) {
    const {
      turbidity = 0.0, // 0.0 (clear) to 1.0 (completely obscured)
      disappeared = false,
      timerSec = 0.0,
      width = 240,
      height = 240
    } = options;

    const crossOpacity = Math.max(0.0, 1.0 - Math.min(1.0, turbidity * 1.08));
    const sulfurAlpha = Math.min(0.96, turbidity * 0.95);

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 240 240" style="display:block; margin:0 auto;">
        <defs>
          <radialGradient id="crossGlassSheen" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
            <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.3"/>
          </radialGradient>
          <radialGradient id="sulfurTurbidityGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FEF08A" stop-opacity="${sulfurAlpha}"/>
            <stop offset="65%" stop-color="#FDE047" stop-opacity="${sulfurAlpha * 0.95}"/>
            <stop offset="100%" stop-color="#EAB308" stop-opacity="${sulfurAlpha * 0.9}"/>
          </radialGradient>
        </defs>

        <!-- White Filter Paper / Tile Base -->
        <rect x="20" y="20" width="200" height="200" rx="16" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>

        <!-- The KNEC Black Cross Mark (X) underneath beaker -->
        <g opacity="${crossOpacity}">
          <line x1="75" y1="75" x2="165" y2="165" stroke="#0F172A" stroke-width="12" stroke-linecap="round"/>
          <line x1="165" y1="75" x2="75" y2="165" stroke="#0F172A" stroke-width="12" stroke-linecap="round"/>
        </g>

        <!-- Pyrex Beaker Base Outline (Top-Down Bird's Eye View) -->
        <circle cx="120" cy="120" r="76" fill="rgba(240, 249, 255, 0.35)" stroke="#64748B" stroke-width="3"/>
        <circle cx="120" cy="120" r="72" fill="url(#sulfurTurbidityGrad)"/>

        <!-- Colloidal Sulfur Particles (Shimmering flocculation) -->
        ${turbidity > 0.15 ? `
          <g opacity="${Math.min(1.0, turbidity * 1.2)}">
            <circle cx="95" cy="110" r="2.5" fill="#CA8A04"/>
            <circle cx="140" cy="100" r="3.0" fill="#EAB308"/>
            <circle cx="130" cy="140" r="2.2" fill="#CA8A04"/>
            <circle cx="110" cy="130" r="3.2" fill="#FEF08A"/>
            <circle cx="150" cy="125" r="2.0" fill="#EAB308"/>
            <circle cx="100" cy="135" r="2.8" fill="#FACC15"/>
            <circle cx="125" cy="95" r="2.4" fill="#CA8A04"/>
          </g>
        ` : ''}

        <!-- Glass Rim & Specular Glare -->
        <circle cx="120" cy="120" r="76" fill="url(#crossGlassSheen)" stroke="#94A3B8" stroke-width="2"/>
        <path d="M 68,90 A 70 70 0 0 1 120,50" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.65"/>

        <!-- Cross Visibility Status Indicator Pill -->
        <rect x="55" y="194" width="130" height="24" rx="12" fill="${disappeared ? '#EF4444' : (turbidity > 0.6 ? '#F59E0B' : '#10B981')}" opacity="0.95"/>
        <text x="120" y="210" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle" font-family="system-ui, sans-serif">
          ${disappeared ? '✕ CROSS DISAPPEARED' : (turbidity > 0 ? `OBSCURING (${(turbidity * 100).toFixed(0)}%)` : 'CROSS CLEARLY VISIBLE')}
        </text>
      </svg>
    `;
  }

  // Precision Gas Syringe Apparatus: Reaction Flask + Rubber Bung + Calibrated Syringe Barrel
  function renderGasSyringeSvg(options = {}) {
    const {
      currentVol = 0.0,
      maxVol = 100.0,
      isRunning = false,
      width = 300,
      height = 160
    } = options;

    const clampedVol = Math.max(0, Math.min(maxVol, currentVol));
    const plungerX = 145 + (clampedVol / maxVol) * 85; // Moves from 145 to 230 px

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 300 160" style="display:block; margin:0 auto;">
        <defs>
          <linearGradient id="syringeGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
            <stop offset="50%" stop-color="rgba(255,255,255,0.1)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.3)"/>
          </linearGradient>
        </defs>

        <!-- Conical Reaction Flask -->
        <path d="M 35,65 L 35,90 L 15,140 C 12,148 18,152 28,152 L 82,152 C 92,152 98,148 95,140 L 75,90 L 75,65 Z" fill="rgba(255,255,255,0.15)" stroke="#94A3B8" stroke-width="2"/>
        <!-- Acid Solution -->
        <path d="M 22,125 L 18,138 C 16,144 20,148 28,148 L 82,148 C 90,148 94,144 92,138 L 88,125 Z" fill="rgba(56, 189, 248, 0.45)"/>
        <!-- Marble Chips at bottom -->
        <polygon points="35,144 42,140 48,144 44,147 38,147" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8"/>
        <polygon points="52,144 60,139 66,145 61,148 54,147" fill="#CBD5E1" stroke="#94A3B8" stroke-width="0.8"/>
        <polygon points="70,145 76,141 81,146 75,148" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8"/>

        <!-- Rubber Stopper Bung -->
        <polygon points="33,65 77,65 73,50 37,50" fill="#334155" stroke="#1E293B" stroke-width="1.2"/>

        <!-- Delivery Tube connecting flask to syringe nozzle -->
        <path d="M 55,50 L 55,28 Q 55,20 65,20 L 125,20 Q 135,20 135,32 L 135,70 L 145,70" fill="none" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>

        <!-- Gas Syringe Barrel (Ground Glass) -->
        <rect x="145" y="55" width="115" height="30" rx="3" fill="url(#syringeGlass)" stroke="#64748B" stroke-width="2"/>
        <rect x="140" y="67" width="6" height="6" fill="#94A3B8" stroke="#475569" stroke-width="1"/>
        <rect x="258" y="52" width="4" height="36" rx="2" fill="#475569"/>

        <!-- Volumetric Calibrations on Syringe Barrel -->
        <g stroke="#94A3B8" stroke-width="1" opacity="0.8">
          <line x1="150" y1="56" x2="150" y2="64"/><line x1="171" y1="56" x2="171" y2="61"/>
          <line x1="192" y1="56" x2="192" y2="64"/><line x1="213" y1="56" x2="213" y2="61"/>
          <line x1="234" y1="56" x2="234" y2="64"/><line x1="255" y1="56" x2="255" y2="64"/>
        </g>
        <text x="150" y="51" font-size="8" fill="#94A3B8" font-family="monospace">0</text>
        <text x="190" y="51" font-size="8" fill="#94A3B8" font-family="monospace">50</text>
        <text x="230" y="51" font-size="8" fill="#94A3B8" font-family="monospace">100cm³</text>

        <!-- Dynamic Plunger inside Barrel -->
        <!-- Plunger Head -->
        <rect x="${plungerX}" y="57" width="6" height="26" rx="1.5" fill="#0284C7" stroke="#0369A1" stroke-width="1"/>
        <!-- Plunger Shaft -->
        <rect x="${plungerX + 6}" y="67" width="40" height="6" fill="#94A3B8" stroke="#64748B" stroke-width="0.8"/>
        <!-- Plunger Push Handle -->
        <rect x="${plungerX + 46}" y="56" width="5" height="28" rx="2" fill="#0284C7"/>

        <!-- Collected Gas Volume Highlight -->
        <rect x="146" y="57" width="${Math.max(0, plungerX - 146)}" height="26" fill="rgba(56, 189, 248, 0.18)"/>

        <!-- Digital Readout Tag -->
        <rect x="150" y="100" width="110" height="26" rx="6" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
        <text x="205" y="118" font-size="12" font-weight="800" fill="#38BDF8" text-anchor="middle" font-family="monospace">
          ${clampedVol.toFixed(1)} cm³
        </text>
      </svg>
    `;
  }

  // ── 4. Public API Export ───────────────────────────────────────
  const RatesBenchCore = {
    EXPERIMENTS,
    renderDisappearingCrossSvg,
    renderGasSyringeSvg,
    playStopwatchClick,
    playGasBubbling,
    playPourLiquid
  };

  global.RatesBenchCore = RatesBenchCore;

})(typeof window !== 'undefined' ? window : this);

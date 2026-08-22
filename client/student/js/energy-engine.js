// ============================================================
//  VirtuLab Kenya — Energy Changes in Reactions Simulation Engine
//  KNEC Chemistry Paper 3 (Quantitative Practical / Thermochemistry)
//  High-Fidelity Scientific Diagram & Physics Rendering Suite
// ============================================================

const EnergyEngine = (() => {
  let rigCanvas, rigCtx;
  let magCanvas, magCtx;
  let profileCanvas, pCtx;
  let molCanvas, mCtx;
  let graphCanvas, gCtx;

  // Web Audio Synthesizer
  let audioCtx = null;
  let soundEnabled = true;

  // Diagram Display Toggles
  let showApparatusLabels = true;
  let showCatalyzedCurve = false;
  let showBestFitLine = false;
  let showExtrapolationLine = true;
  let currentLanguage = 'en';

  // Metronome & Audio Timer
  let lastMetronomeBeepSec = -1;

  // Comprehensive Reaction Systems Registry (KNEC Past Practicals)
  const SYSTEMS = {
    'KCSE_2022_DISPLACEMENT': {
      id: 'KCSE_2022_DISPLACEMENT',
      name: 'Displacement Enthalpy: Zn + CuSO₄',
      knecYear: 'KCSE 2022 / 2017 Paper 3',
      apparatusType: 'CALORIMETER',
      category: 'displacement',
      reactantA: '0.5M Copper(II) Sulfate (CuSO₄) Solution',
      volumeA: 25.0, // cm3
      reactantB: 'Zinc Powder (Zn)',
      massB: 2.00, // g (excess)
      concA: 0.5,
      molarMassB: 65.4,
      deltaH_theoretical: -217.0, // kJ/mol
      ea_uncatalyzed: 65.0, // kJ/mol
      ea_catalyzed: 35.0,
      initialTemp: 22.0,
      coolingRate: 0.0035, // Newton's cooling constant
      reactionSpeed: 0.08,
      initialColor: { r: 2, g: 132, b: 199, a: 0.8 }, // Deep blue
      finalColor: { r: 230, g: 242, b: 250, a: 0.25 }, // Clear / pale
      depositColor: '#8B4513', // Brown copper deposit
      graphType: 'TIME_TEMP',
      mixingTimeSec: 150, // 2.5 min
      totalTimeSec: 360,
      timeStepSec: 30,
      briefing: 'Measure 25.0 cm³ of 0.5M CuSO₄ into a polystyrene cup. Record initial temperature every 30s for 2.0 min. At exactly 2.5 min, add 2.0g Zinc powder, stir continuously and record temperature every 30s up to 6.0 min.',
      safetyReagents: ['CuSO4', 'Zn']
    },
    'KCSE_2023_NEUTRALIZATION': {
      id: 'KCSE_2023_NEUTRALIZATION',
      name: 'Neutralization Enthalpy: NaOH + HCl',
      knecYear: 'KCSE 2023 / 2019 Paper 3',
      apparatusType: 'CALORIMETER',
      category: 'neutralization',
      reactantA: '2.0M Hydrochloric Acid (HCl)',
      volumeA: 25.0, // cm3
      reactantB: '2.0M Sodium Hydroxide (NaOH)',
      volumeB: 25.0, // cm3
      concA: 2.0,
      concB: 2.0,
      deltaH_theoretical: -57.1, // kJ/mol of water
      ea_uncatalyzed: 45.0,
      ea_catalyzed: 25.0,
      initialTemp: 21.5,
      coolingRate: 0.0028,
      reactionSpeed: 0.15,
      initialColor: { r: 235, g: 245, b: 255, a: 0.3 },
      finalColor: { r: 235, g: 245, b: 255, a: 0.3 },
      depositColor: null,
      graphType: 'TIME_TEMP',
      mixingTimeSec: 150,
      totalTimeSec: 360,
      timeStepSec: 30,
      briefing: 'Measure 25.0 cm³ of 2.0M HCl into a polystyrene cup. Record temp every 30s for 2.0 min. At 2.5 min, add 25.0 cm³ 2.0M NaOH, stir and record maximum temperature rise.',
      safetyReagents: ['HCl', 'NaOH']
    },
    'KCSE_2024_WEAK_STRONG': {
      id: 'KCSE_2024_WEAK_STRONG',
      name: 'Neutralization & Ionization Enthalpy: CH₃COOH + NaOH',
      knecYear: 'KCSE 2024 Paper 3 Spec',
      apparatusType: 'CALORIMETER',
      category: 'neutralization',
      reactantA: '2.0M Ethanoic Acid (CH₃COOH)',
      volumeA: 25.0,
      reactantB: '2.0M Sodium Hydroxide (NaOH)',
      volumeB: 25.0,
      concA: 2.0,
      concB: 2.0,
      deltaH_theoretical: -55.2, // kJ/mol (lower magnitude due to heat of ionization)
      ea_uncatalyzed: 50.0,
      ea_catalyzed: 30.0,
      initialTemp: 22.0,
      coolingRate: 0.0030,
      reactionSpeed: 0.12,
      initialColor: { r: 245, g: 250, b: 255, a: 0.3 },
      finalColor: { r: 245, g: 250, b: 255, a: 0.3 },
      depositColor: null,
      graphType: 'TIME_TEMP',
      mixingTimeSec: 150,
      totalTimeSec: 360,
      timeStepSec: 30,
      briefing: 'Measure 25.0 cm³ of 2.0M CH₃COOH into a polystyrene cup. Record temp for 2.0 min. At 2.5 min, add 25.0 cm³ 2.0M NaOH, stir and compare ΔH with strong acid neutralization.',
      safetyReagents: ['CH3COOH', 'NaOH']
    },
    'KCSE_2020_SOLUTION_ENDOTHERMIC': {
      id: 'KCSE_2020_SOLUTION_ENDOTHERMIC',
      name: 'Enthalpy of Solution: NH₄NO₃ (Endothermic)',
      knecYear: 'KCSE 2020 / 2016 Paper 3',
      apparatusType: 'CALORIMETER',
      category: 'solution',
      reactantA: 'Distilled Water (H₂O)',
      volumeA: 50.0, // cm3
      reactantB: 'Ammonium Nitrate (NH₄NO₃) Crystals',
      massB: 5.00, // g
      molarMassB: 80.04,
      deltaH_theoretical: +25.7, // kJ/mol (Endothermic!)
      ea_uncatalyzed: 55.0,
      ea_catalyzed: 30.0,
      initialTemp: 23.0,
      coolingRate: 0.003,
      reactionSpeed: 0.06,
      initialColor: { r: 240, g: 248, b: 255, a: 0.25 },
      finalColor: { r: 240, g: 248, b: 255, a: 0.25 },
      depositColor: null,
      graphType: 'TIME_TEMP',
      mixingTimeSec: 150,
      totalTimeSec: 360,
      timeStepSec: 30,
      briefing: 'Measure 50.0 cm³ distilled water into a polystyrene cup. Record temp for 2.0 min. At 2.5 min, add 5.00g NH₄NO₃ crystals, stir and record temperature drop.',
      safetyReagents: ['NH4NO3']
    },
    'KCSE_2019_HESS_LAW': {
      id: 'KCSE_2019_HESS_LAW',
      name: 'Hess\'s Law Hydration Enthalpy: Anhydrous vs Hydrated CuSO₄',
      knecYear: 'KCSE 2019 Paper 3',
      apparatusType: 'CALORIMETER',
      category: 'solution',
      reactantA: 'Distilled Water (H₂O)',
      volumeA: 50.0,
      reactantB: 'Anhydrous Copper(II) Sulfate (CuSO₄)',
      massB: 4.00,
      molarMassB: 159.6,
      deltaH_theoretical: -66.5, // Exothermic dissolution for anhydrous
      ea_uncatalyzed: 40.0,
      ea_catalyzed: 20.0,
      initialTemp: 22.5,
      coolingRate: 0.0032,
      reactionSpeed: 0.07,
      initialColor: { r: 240, g: 248, b: 255, a: 0.25 },
      finalColor: { r: 2, g: 132, b: 199, a: 0.75 },
      depositColor: null,
      graphType: 'TIME_TEMP',
      mixingTimeSec: 150,
      totalTimeSec: 360,
      timeStepSec: 30,
      briefing: 'Dissolve 4.00g anhydrous CuSO₄ in 50 cm³ water to determine ΔH₁. Compare with hydrated CuSO₄·5H₂O to calculate hydration enthalpy using Hess\'s Law.',
      safetyReagents: ['CuSO4']
    },
    'KCSE_2018_COMBUSTION_ETHANOL': {
      id: 'KCSE_2018_COMBUSTION_ETHANOL',
      name: 'Enthalpy of Combustion: Ethanol (C₂H₅OH)',
      knecYear: 'KCSE 2018 / 2014 Paper 3',
      apparatusType: 'COMBUSTION',
      category: 'combustion',
      fuelName: 'Ethanol (C₂H₅OH)',
      fuelFormula: 'C₂H₅OH',
      fuelMolarMass: 46.07,
      reactantA: 'Distilled Water (in Copper Can)',
      reactantB: 'Ethanol Spirit Lamp',
      waterVolume: 100.0, // cm3 in copper can
      copperCanMass: 45.0, // g
      deltaH_theoretical: -1368.0, // kJ/mol
      ea_uncatalyzed: 120.0,
      ea_catalyzed: 70.0,
      initialTemp: 22.0,
      initialBurnerMass: 184.50, // g
      fuelBurnRate: 0.018, // g per second of burning
      efficiencyFactor: 0.60,
      initialColor: { r: 240, g: 248, b: 255, a: 0.35 },
      briefing: 'Weigh spirit lamp containing ethanol. Measure 100 cm³ water into a copper can calorimeter. Record initial temp T₁. Light burner, heat water with stirring until temp rises by ~20°C. Extinguish burner and record final mass & temp.',
      safetyReagents: ['Ethanol']
    },
    'COOLING_CURVE_STEARIC': {
      id: 'COOLING_CURVE_STEARIC',
      name: 'Cooling Curve & Solidification: Stearic Acid',
      knecYear: 'KCSE Form 4 Thermochemistry Practical',
      apparatusType: 'COOLING',
      category: 'cooling_curve',
      reactantA: 'Hot Stearic Acid (in Boiling Tube)',
      reactantB: 'Water Bath Calorimeter',
      massB: 10.0,
      freezingPoint: 69.0, // °C
      initialTemp: 85.0,
      coolingRate: 0.0055,
      deltaH_theoretical: -198.0, // kJ/kg latent heat
      graphType: 'TIME_TEMP',
      totalTimeSec: 420,
      timeStepSec: 30,
      briefing: 'Heat stearic acid in a water bath until completely melted at 85°C. Remove tube from bath and record temperature every 30s as it cools. Observe temperature plateau at the solidification/freezing point.',
      safetyReagents: ['StearicAcid']
    },
    'THERMO_SANDBOX': {
      id: 'THERMO_SANDBOX',
      name: 'Custom Thermochemistry Sandbox',
      knecYear: 'Free Practice Lab',
      apparatusType: 'CALORIMETER',
      category: 'custom',
      reactantA: 'Solution A Analyte',
      volumeA: 25.0,
      reactantB: 'Solid Reagent B',
      massB: 2.00,
      concA: 0.5,
      deltaH_theoretical: -217.0,
      ea_uncatalyzed: 65.0,
      ea_catalyzed: 35.0,
      initialTemp: 22.0,
      coolingRate: 0.0035,
      reactionSpeed: 0.09,
      initialColor: { r: 2, g: 132, b: 199, a: 0.8 },
      finalColor: { r: 240, g: 248, b: 255, a: 0.25 },
      depositColor: '#8B4513',
      graphType: 'TIME_TEMP',
      mixingTimeSec: 150,
      totalTimeSec: 360,
      timeStepSec: 30,
      briefing: 'Customize reagents, volumes, masses, and enthalpy change to simulate any exothermic or endothermic chemical reaction.',
      safetyReagents: ['CuSO4', 'Zn']
    }
  };

  // State Management
  let currentScenario = SYSTEMS['KCSE_2022_DISPLACEMENT'];
  let studyMode = 'practice';
  let examTimeRemaining = 1200;
  let examTimerInterval = null;

  // Real-time Physics & Simulation Variables
  let simTime = 0;
  let isRunning = false;
  let isMixed = false;
  let isStirring = false;
  let isFlameLit = false;
  let hasLidOn = true;
  let stirAngle = 0;
  let currentTemp = 22.0;
  let maxRecordedTemp = 22.0;
  let minRecordedTemp = 22.0;
  let currentBurnerMass = 184.50;
  let fuelBurnedTotal = 0;
  let reactionExtent = 0;
  let heatGeneratedJoules = 0;

  // Logged Table Data & Graph Interactivity
  let studentPlottedPoints = [];
  let graphHoverCoords = null;

  // Particle Simulation Arrays
  let particles = [];
  let bubbleParticles = [];
  let pourGrains = [];
  let vaporParticles = [];
  let convectionCurrents = [];

  // Theme Palette Resolver for HTML5 Canvas Contexts
  function getThemeColors() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (theme === 'light') {
      return {
        cardBg: '#FFFFFF',
        cardBgHover: '#F8FAFC',
        cardBorder: '#CBD5E1',
        textMain: '#0F172A',
        textMuted: '#64748B',
        headingColor: '#0F172A',
        gridPaper: '#FFFFFF',
        gridMajor: 'rgba(234, 88, 12, 0.35)',
        gridMinor: 'rgba(234, 88, 12, 0.12)',
        primary: '#EA580C',
        cupOuter: '#E2E8F0',
        cupInner: '#F8FAFC',
        cupBorder: '#94A3B8',
        labelBg: 'rgba(255, 255, 255, 0.95)',
        labelBorder: '#CBD5E1',
        labelText: '#0F172A'
      };
    } else if (theme === 'green') {
      return {
        cardBg: '#102617',
        cardBgHover: '#15331F',
        cardBorder: '#1F4A2A',
        textMain: '#D4EDD8',
        textMuted: '#7AB885',
        headingColor: '#39E87A',
        gridPaper: '#0A1A0F',
        gridMajor: 'rgba(57, 232, 122, 0.35)',
        gridMinor: 'rgba(57, 232, 122, 0.12)',
        primary: '#39E87A',
        cupOuter: '#142D1A',
        cupInner: '#1C3D24',
        cupBorder: '#1F4A2A',
        labelBg: 'rgba(16, 38, 23, 0.95)',
        labelBorder: '#1F4A2A',
        labelText: '#D4EDD8'
      };
    } else {
      // Dark Slate Blue (default)
      return {
        cardBg: '#151D2A',
        cardBgHover: '#1C2638',
        cardBorder: '#232E42',
        textMain: '#F1F5F9',
        textMuted: '#94A3B8',
        headingColor: '#FFFFFF',
        gridPaper: '#0B1320',
        gridMajor: 'rgba(249, 115, 22, 0.38)',
        gridMinor: 'rgba(249, 115, 22, 0.14)',
        primary: '#F97316',
        cupOuter: '#1E293B',
        cupInner: '#334155',
        cupBorder: '#475569',
        labelBg: 'rgba(21, 29, 42, 0.95)',
        labelBorder: '#232E42',
        labelText: '#F1F5F9'
      };
    }
  }

  // ============================================================
  // Initialization
  // ============================================================
  function init() {
    rigCanvas = document.getElementById('energyRigCanvas');
    if (rigCanvas) rigCtx = rigCanvas.getContext('2d');

    magCanvas = document.getElementById('magLoupeCanvas');
    if (magCanvas) magCtx = magCanvas.getContext('2d');

    profileCanvas = document.getElementById('energyProfileCanvas');
    if (profileCanvas) pCtx = profileCanvas.getContext('2d');

    molCanvas = document.getElementById('molecularCanvas');
    if (molCanvas) mCtx = molCanvas.getContext('2d');

    graphCanvas = document.getElementById('thermGraphCanvas');
    if (graphCanvas) {
      gCtx = graphCanvas.getContext('2d');
      setupGraphEvents();
    }

    initParticles();
    initConvectionCurrents();
    applyScenario('KCSE_2022_DISPLACEMENT');
    requestAnimationFrame(simulationLoop);
    renderGraph();
  }

  // ============================================================
  // Sound Synthesis (Web Audio API)
  // ============================================================
  function playBeep(freq = 600, duration = 0.12, type = 'sine') {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  function playMetronomeChime() {
    if (!soundEnabled) return;
    try {
      playBeep(880, 0.18, 'triangle');
      setTimeout(() => playBeep(1174, 0.22, 'sine'), 120);
    } catch (e) {}
  }

  function playFlameSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = audioCtx.sampleRate * 0.25;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      noise.connect(filter);
      filter.connect(audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  // ============================================================
  // Scenario Selection & Reset
  // ============================================================
  function applyScenario(scenarioId) {
    if (!SYSTEMS[scenarioId]) return;
    currentScenario = SYSTEMS[scenarioId];

    document.querySelectorAll('.en-scenario-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.scenario === scenarioId);
    });

    const descEl = document.getElementById('scenarioDescText');
    if (descEl) descEl.textContent = currentScenario.briefing;

    const subbarScen = document.getElementById('knecSubbarScenario');
    if (subbarScen) subbarScen.textContent = currentScenario.name || currentScenario.knecYear;

    const titleEl = document.getElementById('stageApparatusTitle');
    if (titleEl) {
      if (currentScenario.apparatusType === 'COMBUSTION') titleEl.textContent = 'Copper Can Calorimeter & Spirit Lamp';
      else if (currentScenario.apparatusType === 'COOLING') titleEl.textContent = 'Stearic Acid Boiling Tube Rig';
      else titleEl.textContent = 'Polystyrene Cup Calorimeter (EPS)';
    }

    resetExperiment();
    updateControlsUI();
    renderGraph();
  }

  function resetExperiment() {
    isRunning = false;
    isMixed = false;
    isStirring = false;
    isFlameLit = false;
    hasLidOn = true;
    simTime = 0;
    lastMetronomeBeepSec = -1;
    currentTemp = currentScenario.initialTemp;
    maxRecordedTemp = currentTemp;
    minRecordedTemp = currentTemp;
    reactionExtent = 0;
    heatGeneratedJoules = 0;
    studentPlottedPoints = [];
    bubbleParticles = [];
    pourGrains = [];
    vaporParticles = [];

    if (currentScenario.apparatusType === 'COMBUSTION') {
      currentBurnerMass = currentScenario.initialBurnerMass;
      fuelBurnedTotal = 0;
    }

    initTableData();
    updateLiveReadouts();
    renderGraph();

    const startBtn = document.getElementById('btnStartTimer');
    if (startBtn) startBtn.innerHTML = '▶️ Start Practical Clock (t = 0s)';
    const statusEl = document.getElementById('labStatusBanner');
    if (statusEl) {
      statusEl.textContent = 'Ready to commence practical.';
      statusEl.style.color = 'var(--text-muted)';
    }

    const mwalimuEl = document.getElementById('mwalimuAdviceText');
    if (mwalimuEl) {
      if (currentScenario.apparatusType === 'COMBUSTION') {
        mwalimuEl.innerHTML = 'Record initial temperature $T_1$ and initial burner mass $m_1$. Keep draught shields close to copper can to minimize heat loss to drafts!';
      } else if (currentScenario.apparatusType === 'COOLING') {
        mwalimuEl.innerHTML = 'Observe temperature drop every 30s. When freezing commences, temperature will remain constant (solidification plateau) until all liquid solidifies!';
      } else {
        mwalimuEl.innerHTML = 'Always take initial temperature readings at 30-second intervals for 2.0 minutes. <strong>Do not mix before 2.5 minutes!</strong> Record readings to <strong>1 decimal place</strong> (e.g. 22.0 or 22.5).';
      }
    }
  }

  function initTableData() {
    const tableBody = document.getElementById('thermTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    if (currentScenario.apparatusType === 'CALORIMETER' || currentScenario.apparatusType === 'COOLING') {
      const totalSec = currentScenario.totalTimeSec || 360;
      const stepSec = currentScenario.timeStepSec || 30;

      for (let t = 0; t <= totalSec; t += stepSec) {
        const row = document.createElement('tr');
        const minVal = (t / 60).toFixed(1);
        const isMixTime = (currentScenario.mixingTimeSec && t === currentScenario.mixingTimeSec);
        row.innerHTML = `
          <td style="font-weight:700;">${minVal}</td>
          <td style="font-weight:700;">${t}</td>
          <td>
            ${isMixTime ? '<span style="color:var(--en-primary);font-weight:900;">[ MIX ⚗️ ]</span>' : 
            `<input type="text" class="en-table-input" id="tbl_temp_${t}" placeholder="—" onchange="EnergyEngine.onTableInputChange(${t})">`}
          </td>
          <td>
            ${isMixTime ? '—' : `<button type="button" class="table-row-log-btn" onclick="EnergyEngine.logRowTemp(${t})">Log</button>`}
          </td>
        `;
        tableBody.appendChild(row);
      }
    } else {
      // Combustion Table
      tableBody.innerHTML = `
        <tr><td>Initial mass of spirit lamp + fuel (g)</td><td>—</td><td><input type="text" class="en-table-input" id="tbl_m1" placeholder="e.g. 184.50" value="${currentBurnerMass.toFixed(2)}"></td><td><button type="button" class="table-row-log-btn" onclick="EnergyEngine.weighBurner()">Weigh</button></td></tr>
        <tr><td>Final mass of spirit lamp + fuel (g)</td><td>—</td><td><input type="text" class="en-table-input" id="tbl_m2" placeholder="—"></td><td><button type="button" class="table-row-log-btn" onclick="EnergyEngine.weighBurner()">Weigh</button></td></tr>
        <tr><td>Mass of fuel burned, Δm (g)</td><td>—</td><td><input type="text" class="en-table-input" id="tbl_dm" placeholder="—" readonly></td><td>—</td></tr>
        <tr><td>Initial temperature of water, T₁ (°C)</td><td>0</td><td><input type="text" class="en-table-input" id="tbl_t1" placeholder="e.g. 22.0" value="${currentTemp.toFixed(1)}"></td><td><button type="button" class="table-row-log-btn" onclick="EnergyEngine.logCombustionT1()">Log</button></td></tr>
        <tr><td>Final highest temperature of water, T₂ (°C)</td><td>—</td><td><input type="text" class="en-table-input" id="tbl_t2" placeholder="—"></td><td><button type="button" class="table-row-log-btn" onclick="EnergyEngine.logCombustionT2()">Log</button></td></tr>
        <tr><td>Temperature change, ΔT (°C)</td><td>—</td><td><input type="text" class="en-table-input" id="tbl_dt" placeholder="—" readonly></td><td>—</td></tr>
      `;
    }
  }

  function updateControlsUI() {
    const calibBox = document.getElementById('calorimeterControlsBox');
    const combBox = document.getElementById('combustionControlsBox');
    const coolBox = document.getElementById('coolingControlsBox');
    const sandboxBox = document.getElementById('sandboxControlsBox');

    if (calibBox) calibBox.style.display = (currentScenario.apparatusType === 'CALORIMETER') ? 'block' : 'none';
    if (combBox) combBox.style.display = (currentScenario.apparatusType === 'COMBUSTION') ? 'block' : 'none';
    if (coolBox) coolBox.style.display = (currentScenario.apparatusType === 'COOLING') ? 'block' : 'none';
    if (sandboxBox) sandboxBox.style.display = (currentScenario.id === 'THERMO_SANDBOX') ? 'block' : 'none';

    const titleA = document.getElementById('reagentTitleA');
    if (titleA) titleA.textContent = currentScenario.reactantA || 'Solution A';
    const subA = document.getElementById('reagentSubA');
    if (subA) subA.textContent = currentScenario.volumeA ? `Analyte · Volume: ${currentScenario.volumeA.toFixed(1)} cm³` : 'Standard Analyte';

    const titleB = document.getElementById('reagentTitleB');
    if (titleB) titleB.textContent = currentScenario.reactantB || 'Reagent B';
    const subB = document.getElementById('reagentSubB');
    if (subB) subB.textContent = currentScenario.massB ? `Reducing Agent · Mass: ${currentScenario.massB.toFixed(2)} g` : (currentScenario.volumeB ? `Volume: ${currentScenario.volumeB.toFixed(1)} cm³` : 'Standard Reagent');
  }

  // ============================================================
  // Simulation Controls & User Actions
  // ============================================================
  function toggleTimer() {
    isRunning = !isRunning;
    const startBtn = document.getElementById('btnStartTimer');
    const coolBtn = document.getElementById('btnStartCooling');
    const label = isRunning ? '⏸️ Pause Practical Clock' : '▶️ Resume Practical Clock';
    if (startBtn) startBtn.innerHTML = label;
    if (coolBtn) coolBtn.innerHTML = label;
    playBeep(440, 0.1);
  }

  function mixReactants() {
    if (isMixed) return;
    isMixed = true;
    playBeep(880, 0.2);

    const statusEl = document.getElementById('labStatusBanner');
    if (statusEl) {
      statusEl.textContent = `⚡ Reactants mixed at t = ${simTime.toFixed(0)}s! Reaction in progress...`;
      statusEl.style.color = 'var(--en-primary)';
    }

    // Spawn falling solid grains
    pourGrains = [];
    for (let i = 0; i < 35; i++) {
      pourGrains.push({
        x: -25 + Math.random() * 20,
        y: -110 + Math.random() * 40,
        vy: 3.5 + Math.random() * 4.5,
        size: 1.5 + Math.random() * 2.2,
        color: currentScenario.depositColor || '#CBD5E1'
      });
    }

    // Spawn effervescence bubbles
    for (let i = 0; i < 28; i++) {
      bubbleParticles.push({
        x: (Math.random() - 0.5) * 60,
        y: Math.random() * 45,
        vy: 1.2 + Math.random() * 2.4,
        radius: 1.5 + Math.random() * 2.5
      });
    }
  }

  function toggleStirrer() {
    isStirring = !isStirring;
    const btn = document.getElementById('btnToggleStir');
    if (btn) {
      btn.classList.toggle('active', isStirring);
      btn.innerHTML = isStirring ? '🌀 Stirrer: ACTIVE' : '🌀 Stirrer: OFF';
    }
    playBeep(isStirring ? 520 : 380, 0.08);
  }

  function toggleLid() {
    hasLidOn = !hasLidOn;
    const btn = document.getElementById('btnToggleLid');
    if (btn) {
      btn.classList.toggle('active', hasLidOn);
      btn.innerHTML = hasLidOn ? '🛡️ Lid: ON' : '🛡️ Lid: OFF (Heat Loss)';
    }
    playBeep(hasLidOn ? 600 : 450, 0.08);
  }

  function toggleLabels() {
    showApparatusLabels = !showApparatusLabels;
    const btn = document.getElementById('btnToggleLabels');
    if (btn) btn.classList.toggle('active', showApparatusLabels);
    playBeep(550, 0.06);
  }

  function toggleCatalyzedPathway() {
    showCatalyzedCurve = !showCatalyzedCurve;
    const btn = document.getElementById('btnToggleCatalyst');
    if (btn) btn.classList.toggle('active', showCatalyzedCurve);
    playBeep(showCatalyzedCurve ? 750 : 500, 0.08);
  }

  function toggleBestFit() {
    showBestFitLine = !showBestFitLine;
    const btn = document.getElementById('btnToggleBestFit');
    if (btn) btn.classList.toggle('active', showBestFitLine);
    renderGraph();
  }

  function toggleFlame() {
    isFlameLit = !isFlameLit;
    const btn = document.getElementById('btnToggleFlame');
    if (btn) {
      btn.classList.toggle('active', isFlameLit);
      btn.innerHTML = isFlameLit ? '🔥 Extinguish Spirit Lamp' : '🕯️ Light Spirit Lamp Burner';
    }
    if (isFlameLit) playFlameSound();
  }

  function weighBurner() {
    const m1Input = document.getElementById('tbl_m1');
    const m2Input = document.getElementById('tbl_m2');
    const dmInput = document.getElementById('tbl_dm');

    if (m1Input && !m1Input.value) {
      m1Input.value = currentBurnerMass.toFixed(2);
    } else if (m2Input) {
      m2Input.value = currentBurnerMass.toFixed(2);
      if (m1Input && m1Input.value) {
        const m1 = parseFloat(m1Input.value);
        const m2 = parseFloat(m2Input.value);
        if (!isNaN(m1) && !isNaN(m2) && dmInput) {
          dmInput.value = (m1 - m2).toFixed(2);
        }
      }
    }
    playBeep(700, 0.08);
  }

  function logCombustionT1() {
    const t1 = document.getElementById('tbl_t1');
    if (t1) t1.value = currentTemp.toFixed(1);
    playBeep(650, 0.06);
  }

  function logCombustionT2() {
    const t2 = document.getElementById('tbl_t2');
    const t1 = document.getElementById('tbl_t1');
    const dt = document.getElementById('tbl_dt');
    if (t2) {
      t2.value = currentTemp.toFixed(1);
      if (t1 && t1.value && dt) {
        const v1 = parseFloat(t1.value);
        const v2 = parseFloat(t2.value);
        if (!isNaN(v1) && !isNaN(v2)) {
          dt.value = (v2 - v1).toFixed(1);
        }
      }
    }
    playBeep(650, 0.06);
  }

  function quickLogReading() {
    const checkSec = Math.round(simTime / 30) * 30;
    logRowTemp(checkSec);
  }

  function logRowTemp(t) {
    const inputEl = document.getElementById(`tbl_temp_${t}`);
    if (inputEl) {
      inputEl.value = currentTemp.toFixed(1);
      studentPlottedPoints = studentPlottedPoints.filter(p => p.time !== t);
      studentPlottedPoints.push({ time: t, temp: parseFloat(currentTemp.toFixed(1)) });
      playBeep(750, 0.06);
      renderGraph();
    }
  }

  function updateSandboxParam(param, val) {
    if (param === 'volA') {
      currentScenario.volumeA = parseFloat(val);
      const valEl = document.getElementById('valVolA');
      if (valEl) valEl.textContent = `${parseFloat(val).toFixed(1)} cm³`;
    } else if (param === 'deltaH') {
      currentScenario.deltaH_theoretical = parseFloat(val);
      const valEl = document.getElementById('valDeltaH');
      if (valEl) valEl.textContent = `${parseFloat(val).toFixed(1)}`;
    }
  }

  // ============================================================
  // Core Physics Integrator
  // ============================================================
  function updatePhysics(dt) {
    if (!isRunning && !isFlameLit) return;

    if (isRunning) {
      simTime += dt;

      // Metronome Chime Check (every 30 seconds)
      const currentInterval = Math.floor(simTime / 30);
      if (currentInterval > lastMetronomeBeepSec && currentInterval <= (currentScenario.totalTimeSec / 30)) {
        lastMetronomeBeepSec = currentInterval;
        playMetronomeChime();
      }
    }

    // 1. Calorimetry Thermodynamics
    if (currentScenario.apparatusType === 'CALORIMETER') {
      if (isMixed) {
        if (reactionExtent < 1.0) {
          const speed = currentScenario.reactionSpeed * (isStirring ? 1.4 : 1.0);
          const dExtent = speed * dt;
          reactionExtent = Math.min(1.0, reactionExtent + dExtent);

          let moles = 0;
          let massSolution = currentScenario.volumeA;
          if (currentScenario.category === 'displacement') {
            moles = (currentScenario.volumeA / 1000) * currentScenario.concA;
          } else if (currentScenario.category === 'neutralization') {
            moles = (currentScenario.volumeA / 1000) * currentScenario.concA;
            massSolution = currentScenario.volumeA + (currentScenario.volumeB || 25.0);
          } else if (currentScenario.category === 'solution') {
            moles = currentScenario.massB / (currentScenario.molarMassB || 80.0);
            massSolution = currentScenario.volumeA;
          }

          const qJoules = Math.abs(currentScenario.deltaH_theoretical * 1000 * moles);
          heatGeneratedJoules = qJoules * reactionExtent;
          const maxTheoreticalDeltaT = qJoules / (massSolution * 4.2);

          if (currentScenario.deltaH_theoretical < 0) {
            const targetT = currentScenario.initialTemp + maxTheoreticalDeltaT;
            currentTemp += (targetT - currentTemp) * (dExtent * 1.8);
          } else {
            const targetT = currentScenario.initialTemp - maxTheoreticalDeltaT;
            currentTemp += (targetT - currentTemp) * (dExtent * 1.8);
          }
        }
      }

      // Newton's Law of Cooling
      const ambientTemp = currentScenario.initialTemp;
      const lidMultiplier = hasLidOn ? 1.0 : 2.6;
      const k = currentScenario.coolingRate * (isStirring ? 1.2 : 1.0) * lidMultiplier;
      currentTemp -= k * (currentTemp - ambientTemp) * dt;

      maxRecordedTemp = Math.max(maxRecordedTemp, currentTemp);
      minRecordedTemp = Math.min(minRecordedTemp, currentTemp);

      // Auto-populate table during practice mode if enabled
      if (studyMode === 'practice') {
        const checkSec = Math.floor(simTime);
        if (checkSec % currentScenario.timeStepSec === 0 && checkSec <= currentScenario.totalTimeSec) {
          const inputEl = document.getElementById(`tbl_temp_${checkSec}`);
          if (inputEl && !inputEl.value && checkSec !== currentScenario.mixingTimeSec) {
            inputEl.value = currentTemp.toFixed(1);
          }
        }
      }
    } 
    // 2. Combustion Thermodynamics
    else if (currentScenario.apparatusType === 'COMBUSTION') {
      if (isFlameLit) {
        const burnRate = currentScenario.fuelBurnRate;
        const burned = burnRate * dt;
        currentBurnerMass = Math.max(0, currentBurnerMass - burned);
        fuelBurnedTotal += burned;

        const molesFuel = burned / currentScenario.fuelMolarMass;
        const heatDeliveredJ = (molesFuel * Math.abs(currentScenario.deltaH_theoretical * 1000)) * currentScenario.efficiencyFactor;
        heatGeneratedJoules += heatDeliveredJ;
        const massWater = currentScenario.waterVolume;
        const deltaTRise = heatDeliveredJ / (massWater * 4.2);

        currentTemp += deltaTRise;
        maxRecordedTemp = Math.max(maxRecordedTemp, currentTemp);

        const m2Input = document.getElementById('tbl_m2');
        if (m2Input) m2Input.value = currentBurnerMass.toFixed(2);
        const dmInput = document.getElementById('tbl_dm');
        if (dmInput) dmInput.value = fuelBurnedTotal.toFixed(2);
        const t2Input = document.getElementById('tbl_t2');
        if (t2Input) t2Input.value = currentTemp.toFixed(1);
        const dtInput = document.getElementById('tbl_dt');
        if (dtInput) dtInput.value = (currentTemp - currentScenario.initialTemp).toFixed(1);
      } else {
        const k = 0.0015;
        currentTemp -= k * (currentTemp - currentScenario.initialTemp) * dt;
      }
    }
    // 3. Cooling Curve Solidification Thermodynamics
    else if (currentScenario.apparatusType === 'COOLING') {
      const ambientTemp = 20.0;
      const fp = currentScenario.freezingPoint || 69.0;

      if (currentTemp > fp + 0.5) {
        // Liquid cooling
        currentTemp -= currentScenario.coolingRate * (currentTemp - ambientTemp) * dt * 2.5;
      } else if (currentTemp >= fp - 0.5 && reactionExtent < 1.0) {
        // Solidification Plateau (Latent heat released)
        reactionExtent = Math.min(1.0, reactionExtent + 0.015 * dt);
        currentTemp = fp;
      } else {
        // Solid cooling
        currentTemp -= currentScenario.coolingRate * (currentTemp - ambientTemp) * dt * 1.8;
      }
    }

    // Vapor particle generator if hot
    if (currentTemp > 35 && Math.random() < 0.3) {
      vaporParticles.push({
        x: (Math.random() - 0.5) * 40,
        y: 0,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -1.2 - Math.random() * 1.5,
        alpha: 0.6,
        radius: 3 + Math.random() * 4
      });
    }

    updateLiveReadouts();
  }

  function updateLiveReadouts() {
    const clockEl = document.getElementById('clockDisplay');
    if (clockEl) {
      const mins = Math.floor(simTime / 60);
      const secs = Math.floor(simTime % 60);
      clockEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    const digitalTempEl = document.getElementById('digitalTempDisplay');
    if (digitalTempEl) {
      if (studyMode === 'exam') {
        digitalTempEl.textContent = '🔒 Read Scale';
      } else {
        digitalTempEl.textContent = `${currentTemp.toFixed(1)} °C`;
      }
    }

    const loupeFooter = document.getElementById('magLoupeValue');
    if (loupeFooter) {
      loupeFooter.textContent = `${currentTemp.toFixed(1)} °C`;
    }

    const rxnFill = document.getElementById('rxnProgressFill');
    if (rxnFill) rxnFill.style.width = `${(reactionExtent * 100).toFixed(0)}%`;
    const rxnPercent = document.getElementById('rxnProgressPercent');
    if (rxnPercent) rxnPercent.textContent = `${(reactionExtent * 100).toFixed(0)}%`;

    const rxnHeat = document.getElementById('rxnHeatGenerated');
    if (rxnHeat) rxnHeat.textContent = `${heatGeneratedJoules.toFixed(1)} J`;
    const rxnDelta = document.getElementById('rxnDeltaTLive');
    if (rxnDelta) {
      const dtVal = currentTemp - currentScenario.initialTemp;
      rxnDelta.textContent = `${dtVal >= 0 ? '+' : ''}${dtVal.toFixed(1)} °C`;
    }
  }

  // ============================================================
  // Canvas Rendering Loop & Diagram Visualizers
  // ============================================================
  let lastTimestamp = 0;
  function simulationLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    updatePhysics(dt);
    drawRig();
    drawMagLoupe();
    drawEnergyProfile();
    drawMolecularHUD(dt);

    requestAnimationFrame(simulationLoop);
  }

  // ──────────────────────────────────────────────
  // 1. HIGH-PRECISION APPARATUS RIG DIAGRAM
  // ──────────────────────────────────────────────
  function drawRig() {
    if (!rigCanvas || !rigCtx) return;
    const w = rigCanvas.width = rigCanvas.parentElement.clientWidth;
    const h = rigCanvas.height = rigCanvas.parentElement.clientHeight;
    rigCtx.clearRect(0, 0, w, h);

    const cx = w * 0.48;
    const cy = h * 0.58;

    if (currentScenario.apparatusType === 'CALORIMETER') {
      drawCalorimeterRig(cx, cy, w, h);
    } else if (currentScenario.apparatusType === 'COMBUSTION') {
      drawCombustionRig(cx, cy, w, h);
    } else {
      drawCoolingCurveRig(cx, cy, w, h);
    }
  }

  function initConvectionCurrents() {
    convectionCurrents = [];
    for (let i = 0; i < 16; i++) {
      convectionCurrents.push({
        x: (Math.random() - 0.5) * 55,
        y: Math.random() * 60,
        vy: (Math.random() * 0.8 + 0.4),
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  function drawCalorimeterRig(cx, cy, w, h) {
    const colors = getThemeColors();

    // Bench Surface & Shadow
    rigCtx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    rigCtx.beginPath();
    rigCtx.ellipse(cx, cy + 105, 120, 24, 0, 0, Math.PI * 2);
    rigCtx.fill();

    // 1. Polystyrene Calorimeter Beaker / Outer Body (3D Beveled EPS)
    const cupW = 148;
    const cupH = 160;
    const cupTopY = cy - 54;
    const cupBotY = cupTopY + cupH;

    // Cup Outer Shadow & Gradient Fill
    const cupGrad = rigCtx.createLinearGradient(cx - cupW * 0.5, cupTopY, cx + cupW * 0.5, cupTopY);
    cupGrad.addColorStop(0, colors.cupOuter);
    cupGrad.addColorStop(0.3, colors.cupInner);
    cupGrad.addColorStop(0.7, colors.cupInner);
    cupGrad.addColorStop(1, colors.cupOuter);

    rigCtx.fillStyle = cupGrad;
    rigCtx.strokeStyle = colors.cupBorder;
    rigCtx.lineWidth = 2.5;
    rigCtx.beginPath();
    rigCtx.moveTo(cx - cupW * 0.5, cupTopY);
    rigCtx.lineTo(cx - cupW * 0.41, cupBotY);
    rigCtx.quadraticCurveTo(cx, cupBotY + 16, cx + cupW * 0.41, cupBotY);
    rigCtx.lineTo(cx + cupW * 0.5, cupTopY);
    rigCtx.closePath();
    rigCtx.fill();
    rigCtx.stroke();

    // Inner Cavity Lip
    rigCtx.fillStyle = colors.cupInner;
    rigCtx.strokeStyle = colors.cupBorder;
    rigCtx.lineWidth = 1.5;
    rigCtx.beginPath();
    rigCtx.ellipse(cx, cupTopY, cupW * 0.46, 12, 0, 0, Math.PI * 2);
    rigCtx.fill();
    rigCtx.stroke();

    // 2. Liquid Solution inside Cup (with Meniscus)
    const liqH = isMixed ? 98 : 68;
    const liqTopY = cupBotY - liqH;

    let col = currentScenario.initialColor || { r: 2, g: 132, b: 199, a: 0.8 };
    if (isMixed && currentScenario.finalColor) {
      const r = Math.round(col.r + (currentScenario.finalColor.r - col.r) * reactionExtent);
      const g = Math.round(col.g + (currentScenario.finalColor.g - col.g) * reactionExtent);
      const b = Math.round(col.b + (currentScenario.finalColor.b - col.b) * reactionExtent);
      const a = col.a + (currentScenario.finalColor.a - col.a) * reactionExtent;
      rigCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
      rigCtx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${col.a})`;
    }

    rigCtx.beginPath();
    rigCtx.moveTo(cx - cupW * 0.42, liqTopY);
    rigCtx.lineTo(cx - cupW * 0.38, cupBotY - 3);
    rigCtx.quadraticCurveTo(cx, cupBotY + 8, cx + cupW * 0.38, cupBotY - 3);
    rigCtx.lineTo(cx + cupW * 0.42, liqTopY);
    rigCtx.quadraticCurveTo(cx, liqTopY + 8, cx - cupW * 0.42, liqTopY);
    rigCtx.fill();

    // Thermal Convection Currents (Rising or Sinking Stream Filaments)
    if (isMixed && reactionExtent > 0.05) {
      const isExo = currentScenario.deltaH_theoretical < 0;
      convectionCurrents.forEach(cc => {
        cc.y += isExo ? cc.vy : -cc.vy;
        if (cc.y > 60) cc.y = 0;
        if (cc.y < 0) cc.y = 60;

        rigCtx.strokeStyle = isExo ? `rgba(239, 68, 68, ${cc.alpha})` : `rgba(6, 182, 212, ${cc.alpha})`;
        rigCtx.lineWidth = 1.2;
        rigCtx.beginPath();
        rigCtx.moveTo(cx + cc.x, cupBotY - cc.y - 6);
        rigCtx.lineTo(cx + cc.x + (Math.sin(cc.y * 0.1) * 4), cupBotY - cc.y - 14);
        rigCtx.stroke();
      });
    }

    // Liquid Top Meniscus Ellipse with surface reflection
    rigCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    rigCtx.beginPath();
    rigCtx.ellipse(cx, liqTopY, cupW * 0.40, 7, 0, 0, Math.PI * 2);
    rigCtx.fill();

    // 3. Spongy Copper Deposit at bottom
    if (isMixed && currentScenario.depositColor && reactionExtent > 0.04) {
      rigCtx.fillStyle = currentScenario.depositColor;
      rigCtx.beginPath();
      const depW = cupW * 0.34 * reactionExtent;
      rigCtx.ellipse(cx, cupBotY - 2, depW, 7 * reactionExtent, 0, 0, Math.PI * 2);
      rigCtx.fill();
    }

    // 4. Falling Powder Cascade Animation
    if (pourGrains.length > 0) {
      pourGrains.forEach(g => {
        g.y += g.vy;
        if (g.y < liqTopY) {
          rigCtx.fillStyle = g.color;
          rigCtx.beginPath();
          rigCtx.arc(cx + g.x, g.y, g.size, 0, Math.PI * 2);
          rigCtx.fill();
        }
      });
      pourGrains = pourGrains.filter(g => g.y < liqTopY);
    }

    // 5. Fizzing Effervescence Bubbles
    if (isMixed && reactionExtent < 0.95) {
      rigCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      bubbleParticles.forEach(bp => {
        bp.y += bp.vy;
        if (bp.y > liqH) bp.y = 0;
        rigCtx.beginPath();
        rigCtx.arc(cx + bp.x, cupBotY - bp.y - 6, bp.radius, 0, Math.PI * 2);
        rigCtx.fill();
      });
    }

    // 6. Steam / Vapor Particle Animation
    if (vaporParticles.length > 0) {
      vaporParticles.forEach(vp => {
        vp.x += vp.vx;
        vp.y += vp.vy;
        vp.alpha -= 0.01;
        rigCtx.fillStyle = `rgba(240, 248, 255, ${Math.max(0, vp.alpha)})`;
        rigCtx.beginPath();
        rigCtx.arc(cx + vp.x, liqTopY + vp.y, vp.radius, 0, Math.PI * 2);
        rigCtx.fill();
      });
      vaporParticles = vaporParticles.filter(vp => vp.alpha > 0);
    }

    // 7. Glass Stirrer Assembly with Swirl Physics
    if (isStirring) stirAngle += 0.18;
    const stirOffsetY = isStirring ? Math.sin(stirAngle) * 12 : 0;
    rigCtx.strokeStyle = 'rgba(180, 225, 255, 0.92)';
    rigCtx.lineWidth = 4.5;
    rigCtx.lineCap = 'round';
    rigCtx.beginPath();
    rigCtx.moveTo(cx - 28, cupTopY - 65 + stirOffsetY);
    rigCtx.lineTo(cx - 22, cupBotY - 14 + stirOffsetY);
    rigCtx.arc(cx - 12, cupBotY - 14 + stirOffsetY, 10, Math.PI, 0, true);
    rigCtx.stroke();

    // 8. Precision Immersion Thermometer
    drawThermometer(cx + 20, cupTopY - 135, 225, currentTemp);

    // 9. Insulated Polystyrene Lid with Rubber Bung Stopper
    if (hasLidOn) {
      rigCtx.fillStyle = colors.cupOuter;
      rigCtx.strokeStyle = colors.cupBorder;
      rigCtx.lineWidth = 2.5;
      rigCtx.beginPath();
      rigCtx.ellipse(cx, cupTopY, cupW * 0.54, 15, 0, 0, Math.PI * 2);
      rigCtx.fill();
      rigCtx.stroke();

      // Rubber Stopper Bung around Thermometer
      rigCtx.fillStyle = '#334155';
      rigCtx.fillRect(cx + 14, cupTopY - 9, 12, 11);
    }

    // 10. Scientific Callout Annotations & Diagram Labels
    if (showApparatusLabels) {
      drawCalloutLabel(cx + 24, cupTopY - 100, cx + 85, cupTopY - 110, '0.1°C Thermometer');
      drawCalloutLabel(cx - 28, cupTopY - 40, cx - 100, cupTopY - 45, 'Glass Stirring Loop');
      drawCalloutLabel(cx - cupW * 0.48, cupTopY + 40, cx - 110, cupTopY + 40, 'Styrofoam Cup (EPS)');
      if (hasLidOn) {
        drawCalloutLabel(cx, cupTopY, cx + 90, cupTopY - 20, 'Insulating Plastic Lid');
      }
      if (isMixed && currentScenario.depositColor) {
        drawCalloutLabel(cx, cupBotY, cx + 85, cupBotY + 15, 'Copper Deposit (Cu)');
      }
    }
  }

  function drawCombustionRig(cx, cy, w, h) {
    const colors = getThemeColors();

    // Bench Stand Shadow
    rigCtx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    rigCtx.beginPath();
    rigCtx.ellipse(cx, cy + 90, 110, 20, 0, 0, Math.PI * 2);
    rigCtx.fill();

    // 1. Laboratory Tripod Stand
    rigCtx.strokeStyle = colors.textMuted;
    rigCtx.lineWidth = 4;
    rigCtx.beginPath();
    rigCtx.moveTo(cx - 65, cy + 75);
    rigCtx.lineTo(cx - 45, cy - 20);
    rigCtx.lineTo(cx + 45, cy - 20);
    rigCtx.lineTo(cx + 65, cy + 75);
    rigCtx.stroke();

    // 2. Wire Gauze with Ceramic Patch
    rigCtx.fillStyle = '#475569';
    rigCtx.fillRect(cx - 56, cy - 22, 112, 5);
    rigCtx.fillStyle = '#F8FAFC';
    rigCtx.fillRect(cx - 26, cy - 23, 52, 6);

    // 3. Wooden Draught Shields (KCSE Spec to reduce air currents)
    rigCtx.fillStyle = 'rgba(217, 119, 6, 0.35)';
    rigCtx.strokeStyle = 'rgba(217, 119, 6, 0.8)';
    rigCtx.lineWidth = 2;
    rigCtx.fillRect(cx - 95, cy - 80, 12, 160);
    rigCtx.fillRect(cx + 83, cy - 80, 12, 160);

    // 4. Copper Can Calorimeter
    const canW = 88;
    const canH = 100;
    const canTopY = cy - 22 - canH;

    const copGrad = rigCtx.createLinearGradient(cx - canW * 0.5, canTopY, cx + canW * 0.5, canTopY);
    copGrad.addColorStop(0, '#78350F');
    copGrad.addColorStop(0.3, '#B45309');
    copGrad.addColorStop(0.7, '#D97706');
    copGrad.addColorStop(1, '#78350F');

    rigCtx.fillStyle = copGrad;
    rigCtx.strokeStyle = '#451A03';
    rigCtx.lineWidth = 2.5;
    rigCtx.beginPath();
    rigCtx.rect(cx - canW * 0.5, canTopY, canW, canH);
    rigCtx.fill();
    rigCtx.stroke();

    // Water level inside Copper Can
    rigCtx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    rigCtx.fillRect(cx - canW * 0.45, canTopY + 20, canW * 0.9, canH - 26);

    // Thermometer in Copper Can
    drawThermometer(cx + 14, canTopY - 80, 185, currentTemp);

    // 5. Spirit Lamp Burner at Base
    const lampY = cy + 45;
    rigCtx.fillStyle = 'rgba(240, 248, 255, 0.95)';
    rigCtx.strokeStyle = colors.cardBorder;
    rigCtx.lineWidth = 2;
    rigCtx.beginPath();
    rigCtx.ellipse(cx, lampY + 18, 42, 16, 0, 0, Math.PI * 2);
    rigCtx.fill();
    rigCtx.stroke();

    // Wick & Collar
    rigCtx.fillStyle = '#D97706';
    rigCtx.fillRect(cx - 6, lampY - 2, 12, 8);
    rigCtx.fillStyle = '#1E293B';
    rigCtx.fillRect(cx - 4, lampY - 12, 8, 12);

    // Animated Flame
    if (isFlameLit) {
      drawAnimatedFlame(cx, lampY - 12);
    }

    // Callout Labels
    if (showApparatusLabels) {
      drawCalloutLabel(cx - canW * 0.5, canTopY + 40, cx - 110, canTopY + 30, 'Copper Can Calorimeter');
      drawCalloutLabel(cx + 14, canTopY - 40, cx + 80, canTopY - 50, 'Thermometer');
      drawCalloutLabel(cx + 83, cy, cx + 115, cy - 10, 'Draught Shield');
      drawCalloutLabel(cx, lampY + 20, cx + 80, lampY + 30, 'Spirit Lamp (Alcohol)');
    }
  }

  function drawCoolingCurveRig(cx, cy, w, h) {
    const colors = getThemeColors();

    // Bench Surface & Shadow
    rigCtx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    rigCtx.beginPath();
    rigCtx.ellipse(cx, cy + 105, 110, 20, 0, 0, Math.PI * 2);
    rigCtx.fill();

    // 1. 250ml Glass Water Bath Beaker
    const beakW = 130;
    const beakH = 140;
    const beakTopY = cy - 40;

    rigCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    rigCtx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
    rigCtx.lineWidth = 2.5;
    rigCtx.beginPath();
    rigCtx.roundRect(cx - beakW * 0.5, beakTopY, beakW, beakH, 10);
    rigCtx.fill();
    rigCtx.stroke();

    // Water Bath Liquid
    rigCtx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    rigCtx.fillRect(cx - beakW * 0.48, beakTopY + 25, beakW * 0.96, beakH - 30);

    // 2. Boiling Tube inside Water Bath
    const tubeW = 42;
    const tubeH = 150;
    const tubeTopY = cy - 75;

    rigCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    rigCtx.strokeStyle = 'rgba(148, 163, 184, 0.9)';
    rigCtx.lineWidth = 2;
    rigCtx.beginPath();
    rigCtx.roundRect(cx - tubeW * 0.5, tubeTopY, tubeW, tubeH, [0, 0, 20, 20]);
    rigCtx.fill();
    rigCtx.stroke();

    // Stearic Acid Inside Boiling Tube (Cloudy when solidifying)
    const opacity = reactionExtent > 0.1 ? 0.85 : 0.45;
    rigCtx.fillStyle = `rgba(254, 240, 138, ${opacity})`;
    rigCtx.beginPath();
    rigCtx.roundRect(cx - tubeW * 0.44, tubeTopY + 50, tubeW * 0.88, tubeH - 55, [0, 0, 18, 18]);
    rigCtx.fill();

    // Precision Thermometer in Stearic Acid
    drawThermometer(cx, tubeTopY - 60, 200, currentTemp);

    if (showApparatusLabels) {
      drawCalloutLabel(cx - beakW * 0.5, beakTopY + 50, cx - 110, beakTopY + 40, 'Water Bath');
      drawCalloutLabel(cx - tubeW * 0.5, tubeTopY + 30, cx - 95, tubeTopY + 20, 'Boiling Tube');
      drawCalloutLabel(cx, tubeTopY - 40, cx + 80, tubeTopY - 50, 'Stearic Acid & Thermometer');
    }
  }

  function drawThermometer(tx, ty, length, temp) {
    rigCtx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    rigCtx.strokeStyle = '#64748B';
    rigCtx.lineWidth = 2;
    rigCtx.beginPath();
    rigCtx.roundRect(tx - 4, ty, 8, length, 4);
    rigCtx.fill();
    rigCtx.stroke();

    rigCtx.fillStyle = '#EF4444';
    rigCtx.beginPath();
    rigCtx.arc(tx, ty + length + 4, 7.5, 0, Math.PI * 2);
    rigCtx.fill();

    const minT = 0;
    const maxT = 100;
    const frac = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)));
    const colH = frac * (length - 18);

    rigCtx.fillStyle = '#EF4444';
    rigCtx.fillRect(tx - 2, (ty + length) - colH, 4, colH);

    rigCtx.fillStyle = '#334155';
    for (let t = 0; t <= 100; t += 10) {
      const f = (t - minT) / (maxT - minT);
      const markY = (ty + length) - (f * (length - 18));
      rigCtx.fillRect(tx + 4, markY, 3, 1);
    }
  }

  function drawAnimatedFlame(fx, fy) {
    const flameH = 36 + Math.sin(Date.now() * 0.02) * 5;
    const flameW = 16 + Math.cos(Date.now() * 0.015) * 3;

    const grad = rigCtx.createRadialGradient(fx, fy - flameH * 0.4, 3, fx, fy - flameH * 0.3, flameW);
    grad.addColorStop(0, '#FEF08A');
    grad.addColorStop(0.4, '#F97316');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

    rigCtx.fillStyle = grad;
    rigCtx.beginPath();
    rigCtx.moveTo(fx - flameW * 0.5, fy);
    rigCtx.quadraticCurveTo(fx - flameW * 0.6, fy - flameH * 0.6, fx, fy - flameH);
    rigCtx.quadraticCurveTo(fx + flameW * 0.6, fy - flameH * 0.6, fx + flameW * 0.5, fy);
    rigCtx.closePath();
    rigCtx.fill();
  }

  function drawCalloutLabel(targetX, targetY, labelX, labelY, text) {
    const colors = getThemeColors();

    // Pointer line
    rigCtx.strokeStyle = colors.primary;
    rigCtx.lineWidth = 1.2;
    rigCtx.beginPath();
    rigCtx.moveTo(targetX, targetY);
    rigCtx.lineTo(labelX, labelY);
    rigCtx.stroke();

    // Target Dot
    rigCtx.fillStyle = colors.primary;
    rigCtx.beginPath();
    rigCtx.arc(targetX, targetY, 3, 0, Math.PI * 2);
    rigCtx.fill();

    // Label Pill Box
    rigCtx.font = '700 9.5px Plus Jakarta Sans';
    const textW = rigCtx.measureText(text).width;
    const pillW = textW + 12;
    const pillH = 18;

    rigCtx.fillStyle = colors.labelBg;
    rigCtx.strokeStyle = colors.labelBorder;
    rigCtx.lineWidth = 1;
    rigCtx.beginPath();
    rigCtx.roundRect(labelX - pillW * 0.5, labelY - pillH * 0.5, pillW, pillH, 6);
    rigCtx.fill();
    rigCtx.stroke();

    rigCtx.fillStyle = colors.labelText;
    rigCtx.textAlign = 'center';
    rigCtx.fillText(text, labelX, labelY + 3.5);
  }

  // ──────────────────────────────────────────────
  // 2. MAGNIFYING ZOOM LOUPE DIAGRAM
  // ──────────────────────────────────────────────
  function drawMagLoupe() {
    if (!magCanvas || !magCtx) return;
    const colors = getThemeColors();
    const w = magCanvas.width = magCanvas.parentElement.clientWidth;
    const h = magCanvas.height = magCanvas.parentElement.clientHeight - 48;
    magCtx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const zoomSpan = 5.0; // +/- 2.5°C around current temp
    const minT = currentTemp - zoomSpan * 0.5;
    const maxT = currentTemp + zoomSpan * 0.5;

    // Theme Background
    magCtx.fillStyle = colors.cardBgHover;
    magCtx.fillRect(0, 0, w, h);

    // Stem Tube with specular highlights
    magCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    magCtx.strokeStyle = colors.cardBorder;
    magCtx.lineWidth = 1.5;
    magCtx.fillRect(cx - 10, 6, 20, h - 12);
    magCtx.strokeRect(cx - 10, 6, 20, h - 12);

    // Red Liquid Column
    const colY = h * 0.5;
    magCtx.fillStyle = '#EF4444';
    magCtx.fillRect(cx - 5, colY, 10, h - colY - 6);

    // Liquid Meniscus Curve (Curved Top)
    magCtx.fillStyle = '#DC2626';
    magCtx.beginPath();
    magCtx.ellipse(cx, colY, 5, 2.5, 0, 0, Math.PI * 2);
    magCtx.fill();

    // Scale Markings
    magCtx.font = '600 11px JetBrains Mono';
    magCtx.textAlign = 'right';

    const startT = Math.floor(minT * 10) / 10;
    const endT = Math.ceil(maxT * 10) / 10;

    for (let t = startT; t <= endT; t = Math.round((t + 0.1) * 10) / 10) {
      const yFrac = 1.0 - ((t - minT) / (maxT - minT));
      const y = yFrac * h;

      const isMajor = Math.abs(t % 1.0) < 0.05;
      const isHalf = Math.abs(t % 0.5) < 0.05 && !isMajor;

      magCtx.strokeStyle = isMajor ? colors.textMain : (isHalf ? colors.textMuted : colors.cardBorder);
      magCtx.lineWidth = isMajor ? 2 : 1;

      magCtx.beginPath();
      magCtx.moveTo(cx + 10, y);
      magCtx.lineTo(cx + (isMajor ? 22 : (isHalf ? 16 : 12)), y);
      magCtx.stroke();

      if (isMajor) {
        magCtx.fillStyle = colors.headingColor;
        magCtx.fillText(t.toFixed(0), cx - 14, y + 4);
      }
    }

    // Parallax Crosshair Alignment Line
    magCtx.strokeStyle = '#06B6D4';
    magCtx.lineWidth = 1.5;
    magCtx.setLineDash([3, 3]);
    magCtx.beginPath();
    magCtx.moveTo(0, h * 0.5);
    magCtx.lineTo(w, h * 0.5);
    magCtx.stroke();
    magCtx.setLineDash([]);
  }

  // ──────────────────────────────────────────────
  // 3. DYNAMIC ENERGY PROFILE / REACTION COORDINATE DIAGRAM
  // ──────────────────────────────────────────────
  function drawEnergyProfile() {
    if (!profileCanvas || !pCtx) return;
    const colors = getThemeColors();
    const w = profileCanvas.width = profileCanvas.parentElement.clientWidth;
    const h = profileCanvas.height = 140;
    pCtx.clearRect(0, 0, w, h);

    const isExo = currentScenario.deltaH_theoretical < 0;
    const reactantY = isExo ? h * 0.48 : h * 0.72;
    const productY = isExo ? h * 0.78 : h * 0.36;
    const peakY = isExo ? h * 0.16 : h * 0.14;
    const catPeakY = peakY + (reactantY - peakY) * 0.45; // Catalyzed lower hump

    // Axes
    pCtx.strokeStyle = colors.cardBorder;
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(25, 10);
    pCtx.lineTo(25, h - 20);
    pCtx.lineTo(w - 15, h - 20);
    pCtx.stroke();

    pCtx.font = '700 9px Outfit';
    pCtx.fillStyle = colors.textMuted;
    pCtx.fillText('Enthalpy (H)', 30, 16);
    pCtx.fillText('Reaction Progress →', w - 110, h - 6);

    // 1. Uncatalyzed Reaction Curve
    pCtx.strokeStyle = isExo ? '#F97316' : '#06B6D4';
    pCtx.lineWidth = 2.5;
    pCtx.beginPath();
    pCtx.moveTo(35, reactantY);
    pCtx.lineTo(70, reactantY);
    pCtx.bezierCurveTo(w * 0.4, reactantY, w * 0.45, peakY, w * 0.52, peakY);
    pCtx.bezierCurveTo(w * 0.6, peakY, w * 0.65, productY, w * 0.75, productY);
    pCtx.lineTo(w - 25, productY);
    pCtx.stroke();

    // 2. Catalyzed Curve (Lower Ea) if enabled
    if (showCatalyzedCurve) {
      pCtx.strokeStyle = '#10B981';
      pCtx.lineWidth = 2;
      pCtx.setLineDash([4, 4]);
      pCtx.beginPath();
      pCtx.moveTo(70, reactantY);
      pCtx.bezierCurveTo(w * 0.4, reactantY, w * 0.45, catPeakY, w * 0.52, catPeakY);
      pCtx.bezierCurveTo(w * 0.6, catPeakY, w * 0.65, productY, w * 0.75, productY);
      pCtx.stroke();
      pCtx.setLineDash([]);

      pCtx.font = '700 9px JetBrains Mono';
      pCtx.fillStyle = '#10B981';
      pCtx.fillText('Catalyzed Ea\'', w * 0.54, catPeakY - 4);
    }

    // 3. Rolling Reaction Progress Marker Ball
    const progressFrac = isMixed ? reactionExtent : 0;
    let ballX = 35 + progressFrac * (w - 60);
    let ballY = reactantY;
    if (progressFrac <= 0.5) {
      const t = progressFrac / 0.5;
      ballY = reactantY + (peakY - reactantY) * Math.sin(t * Math.PI * 0.5);
    } else {
      const t = (progressFrac - 0.5) / 0.5;
      ballY = peakY + (productY - peakY) * (1 - Math.cos(t * Math.PI * 0.5));
    }

    pCtx.fillStyle = '#EA580C';
    pCtx.strokeStyle = '#FFF';
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.arc(ballX, ballY, 5, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.stroke();

    // Reactants / Products Plateaus
    pCtx.font = '700 10px Plus Jakarta Sans';
    pCtx.fillStyle = colors.textMain;
    pCtx.fillText('Reactants', 35, reactantY - 6);
    pCtx.fillText('Products', w - 75, productY - 6);

    // Activation Energy Arrow (Ea)
    pCtx.strokeStyle = colors.primary;
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(w * 0.48, reactantY);
    pCtx.lineTo(w * 0.48, peakY);
    pCtx.stroke();

    pCtx.font = '700 9px JetBrains Mono';
    pCtx.fillStyle = colors.primary;
    pCtx.fillText('Ea', w * 0.44, (reactantY + peakY) * 0.5);

    // Delta H Vertical Arrow
    pCtx.strokeStyle = isExo ? '#EF4444' : '#10B981';
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.moveTo(w - 50, reactantY);
    pCtx.lineTo(w - 50, productY);
    pCtx.stroke();

    // Arrow Head
    pCtx.fillStyle = isExo ? '#EF4444' : '#10B981';
    pCtx.beginPath();
    if (isExo) {
      pCtx.moveTo(w - 54, productY - 6);
      pCtx.lineTo(w - 46, productY - 6);
      pCtx.lineTo(w - 50, productY);
    } else {
      pCtx.moveTo(w - 54, productY + 6);
      pCtx.lineTo(w - 46, productY + 6);
      pCtx.lineTo(w - 50, productY);
    }
    pCtx.fill();

    pCtx.font = '800 10px JetBrains Mono';
    pCtx.fillStyle = isExo ? '#EF4444' : '#10B981';
    const deltaHStr = `ΔH = ${currentScenario.deltaH_theoretical > 0 ? '+' : ''}${currentScenario.deltaH_theoretical} kJ/mol`;
    pCtx.fillText(deltaHStr, w * 0.36, (reactantY + productY) * 0.5 + 4);
  }

  // ──────────────────────────────────────────────
  // 4. SUB-MICROSCOPIC MOLECULAR PARTICLE HUD
  // ──────────────────────────────────────────────
  function initParticles() {
    particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * 200,
        y: Math.random() * 120,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 3 + Math.random() * 3,
        type: i % 2 === 0 ? 'ionA' : 'ionB'
      });
    }
  }

  function drawMolecularHUD(dt) {
    if (!molCanvas || !mCtx) return;
    const colors = getThemeColors();
    const w = molCanvas.width = molCanvas.parentElement.clientWidth;
    const h = molCanvas.height = 140;
    mCtx.clearRect(0, 0, w, h);

    const speedMul = 1.0 + (currentTemp - 20) * 0.05;

    particles.forEach(p => {
      p.x += p.vx * speedMul;
      p.y += p.vy * speedMul;

      if (p.x < p.radius || p.x > w - p.radius) p.vx *= -1;
      if (p.y < p.radius || p.y > h - p.radius) p.vy *= -1;

      mCtx.beginPath();
      mCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      mCtx.fillStyle = p.type === 'ionA' ? '#38BDF8' : '#F59E0B';
      mCtx.fill();
    });

    mCtx.font = '600 10px Plus Jakarta Sans';
    mCtx.fillStyle = colors.textMuted;
    mCtx.fillText(`Maxwell-Boltzmann Kinetic Velocity: ${(speedMul).toFixed(2)}x`, 10, h - 8);
    const rateLbl = document.getElementById('kineticRateLabel');
    if (rateLbl) rateLbl.textContent = `Maxwell-Boltzmann Rate: ${(speedMul).toFixed(2)}x`;
  }

  // ──────────────────────────────────────────────
  // 5. INTERACTIVE KNEC GRAPH PLOTTING SUITE
  // ──────────────────────────────────────────────
  function setupGraphEvents() {
    if (!graphCanvas) return;

    graphCanvas.addEventListener('mousemove', (e) => {
      const rect = graphCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const w = graphCanvas.width;
      const h = graphCanvas.height;
      const margin = { left: 45, right: 20, top: 20, bottom: 35 };

      const timeMax = currentScenario.totalTimeSec || 360;
      const tempMin = 15;
      const tempMax = Math.max(50, Math.ceil(maxRecordedTemp / 5) * 5 + 5);

      if (clickX >= margin.left && clickX <= w - margin.right && clickY >= margin.top && clickY <= h - margin.bottom) {
        const timeVal = ((clickX - margin.left) / (w - margin.left - margin.right)) * timeMax;
        const tempVal = tempMax - ((clickY - margin.top) / (h - margin.top - margin.bottom)) * (tempMax - tempMin);
        graphHoverCoords = { time: Math.round(timeVal), temp: tempVal.toFixed(1), x: clickX, y: clickY };
      } else {
        graphHoverCoords = null;
      }
      renderGraph();
    });

    graphCanvas.addEventListener('mouseleave', () => {
      graphHoverCoords = null;
      renderGraph();
    });

    graphCanvas.addEventListener('click', (e) => {
      const rect = graphCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const w = graphCanvas.width;
      const h = graphCanvas.height;
      const margin = { left: 45, right: 20, top: 20, bottom: 35 };

      const timeMax = currentScenario.totalTimeSec || 360;
      const tempMin = 15;
      const tempMax = Math.max(50, Math.ceil(maxRecordedTemp / 5) * 5 + 5);

      if (clickX >= margin.left && clickX <= w - margin.right && clickY >= margin.top && clickY <= h - margin.bottom) {
        const timeVal = ((clickX - margin.left) / (w - margin.left - margin.right)) * timeMax;
        const tempVal = tempMax - ((clickY - margin.top) / (h - margin.top - margin.bottom)) * (tempMax - tempMin);

        const snapTime = Math.round(timeVal / 30) * 30;
        const snapTemp = Math.round(tempVal * 2) / 2;

        // Toggle or add point
        const existingIdx = studentPlottedPoints.findIndex(p => p.time === snapTime);
        if (existingIdx >= 0) {
          studentPlottedPoints[existingIdx].temp = snapTemp;
        } else {
          studentPlottedPoints.push({ time: snapTime, temp: snapTemp });
        }

        playBeep(700, 0.05);
        renderGraph();
      }
    });
  }

  function renderGraph() {
    if (!graphCanvas || !gCtx) return;
    const colors = getThemeColors();
    const w = graphCanvas.width = graphCanvas.parentElement.clientWidth;
    const h = graphCanvas.height = 320;
    gCtx.clearRect(0, 0, w, h);

    const margin = { left: 48, right: 20, top: 22, bottom: 35 };
    const pw = w - margin.left - margin.right;
    const ph = h - margin.top - margin.bottom;

    const timeMax = currentScenario.totalTimeSec || 360;
    const tempMin = 15;
    const tempMax = Math.max(50, Math.ceil(maxRecordedTemp / 5) * 5 + 5);

    // Millimeter Grid Paper
    gCtx.fillStyle = colors.gridPaper;
    gCtx.fillRect(margin.left, margin.top, pw, ph);

    gCtx.lineWidth = 0.5;
    for (let x = 0; x <= pw; x += 10) {
      gCtx.strokeStyle = (x % 50 === 0) ? colors.gridMajor : colors.gridMinor;
      gCtx.beginPath();
      gCtx.moveTo(margin.left + x, margin.top);
      gCtx.lineTo(margin.left + x, margin.top + ph);
      gCtx.stroke();
    }
    for (let y = 0; y <= ph; y += 10) {
      gCtx.strokeStyle = (y % 50 === 0) ? colors.gridMajor : colors.gridMinor;
      gCtx.beginPath();
      gCtx.moveTo(margin.left, margin.top + y);
      gCtx.lineTo(margin.left + pw, margin.top + y);
      gCtx.stroke();
    }

    // Axes
    gCtx.strokeStyle = colors.textMain;
    gCtx.lineWidth = 1.5;
    gCtx.beginPath();
    gCtx.moveTo(margin.left, margin.top);
    gCtx.lineTo(margin.left, margin.top + ph);
    gCtx.lineTo(margin.left + pw, margin.top + ph);
    gCtx.stroke();

    // Axis Labels
    gCtx.font = '600 9.5px JetBrains Mono';
    gCtx.fillStyle = colors.textMain;
    gCtx.textAlign = 'center';

    for (let t = 0; t <= timeMax; t += 60) {
      const x = margin.left + (t / timeMax) * pw;
      gCtx.fillText(`${t}`, x, margin.top + ph + 14);
    }
    gCtx.font = '700 9.5px Plus Jakarta Sans';
    gCtx.fillText('Time (seconds) →', margin.left + pw * 0.5, margin.top + ph + 28);

    gCtx.textAlign = 'right';
    gCtx.font = '600 9.5px JetBrains Mono';
    for (let temp = tempMin; temp <= tempMax; temp += 5) {
      const y = margin.top + ph - ((temp - tempMin) / (tempMax - tempMin)) * ph;
      gCtx.fillText(`${temp}`, margin.left - 6, y + 3.5);
    }
    gCtx.save();
    gCtx.translate(14, margin.top + ph * 0.5);
    gCtx.rotate(-Math.PI * 0.5);
    gCtx.font = '700 9.5px Plus Jakarta Sans';
    gCtx.textAlign = 'center';
    gCtx.fillText('Temperature (°C) →', 0, 0);
    gCtx.restore();

    // Mixing Time Marker Line (t = 150s)
    if (currentScenario.mixingTimeSec) {
      const mixX = margin.left + (currentScenario.mixingTimeSec / timeMax) * pw;
      gCtx.strokeStyle = 'rgba(249, 115, 22, 0.7)';
      gCtx.lineWidth = 1.5;
      gCtx.setLineDash([4, 4]);
      gCtx.beginPath();
      gCtx.moveTo(mixX, margin.top);
      gCtx.lineTo(mixX, margin.top + ph);
      gCtx.stroke();
      gCtx.setLineDash([]);

      gCtx.font = '800 9px Outfit';
      gCtx.fillStyle = colors.primary;
      gCtx.textAlign = 'center';
      gCtx.fillText('Mixing (2.5 min)', mixX, margin.top - 6);
    }

    // Plot Student Points (KNEC Red 'X' markers)
    studentPlottedPoints.forEach(pt => {
      const px = margin.left + (pt.time / timeMax) * pw;
      const py = margin.top + ph - ((pt.temp - tempMin) / (tempMax - tempMin)) * ph;

      gCtx.strokeStyle = '#EF4444';
      gCtx.lineWidth = 2;
      gCtx.beginPath();
      gCtx.moveTo(px - 4.5, py - 4.5);
      gCtx.lineTo(px + 4.5, py + 4.5);
      gCtx.moveTo(px + 4.5, py - 4.5);
      gCtx.lineTo(px - 4.5, py + 4.5);
      gCtx.stroke();
    });

    // KNEC Dual-Line Extrapolation Tool
    if (showExtrapolationLine && currentScenario.mixingTimeSec) {
      drawKNECDualExtrapolation(margin, pw, ph, timeMax, tempMin, tempMax);
    }

    // Line of Best Fit
    if (showBestFitLine && studentPlottedPoints.length >= 3) {
      drawBestFitLine(margin, pw, ph, timeMax, tempMin, tempMax);
    }

    // Hover Coordinates Tooltip
    if (graphHoverCoords) {
      gCtx.fillStyle = colors.cardBg;
      gCtx.strokeStyle = colors.primary;
      gCtx.lineWidth = 1;
      gCtx.fillRect(graphHoverCoords.x + 8, graphHoverCoords.y - 24, 90, 20);
      gCtx.strokeRect(graphHoverCoords.x + 8, graphHoverCoords.y - 24, 90, 20);

      gCtx.font = '700 9px JetBrains Mono';
      gCtx.fillStyle = colors.textMain;
      gCtx.textAlign = 'left';
      gCtx.fillText(`${graphHoverCoords.time}s, ${graphHoverCoords.temp}°C`, graphHoverCoords.x + 12, graphHoverCoords.y - 10);
    }
  }

  function drawKNECDualExtrapolation(margin, pw, ph, timeMax, tempMin, tempMax) {
    const mixTime = currentScenario.mixingTimeSec;

    // 1. Initial Baseline Line (0 to 120s)
    const basePoints = studentPlottedPoints.filter(p => p.time < mixTime);
    let tInitial = currentScenario.initialTemp;
    if (basePoints.length > 0) {
      tInitial = basePoints.reduce((sum, p) => sum + p.temp, 0) / basePoints.length;
    }

    const baseX1 = margin.left;
    const baseY1 = margin.top + ph - ((tInitial - tempMin) / (tempMax - tempMin)) * ph;
    const baseMixX = margin.left + (mixTime / timeMax) * pw;

    gCtx.strokeStyle = '#06B6D4';
    gCtx.lineWidth = 2;
    gCtx.beginPath();
    gCtx.moveTo(baseX1, baseY1);
    gCtx.lineTo(baseMixX, baseY1);
    gCtx.stroke();

    // 2. Cooling Curve Extrapolation Line (t >= 210s)
    const coolingPoints = studentPlottedPoints.filter(p => p.time >= 210);
    if (coolingPoints.length >= 2) {
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      const n = coolingPoints.length;
      coolingPoints.forEach(p => {
        sumX += p.time;
        sumY += p.temp;
        sumXY += p.time * p.temp;
        sumXX += p.time * p.time;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      const tMaxExtrapolated = slope * mixTime + intercept;

      const x1 = margin.left + (mixTime / timeMax) * pw;
      const y1 = margin.top + ph - ((tMaxExtrapolated - tempMin) / (tempMax - tempMin)) * ph;
      const x2 = margin.left + (timeMax / timeMax) * pw;
      const y2 = margin.top + ph - (((slope * timeMax + intercept) - tempMin) / (tempMax - tempMin)) * ph;

      gCtx.strokeStyle = '#10B981';
      gCtx.lineWidth = 2.5;
      gCtx.beginPath();
      gCtx.moveTo(x1, y1);
      gCtx.lineTo(x2, y2);
      gCtx.stroke();

      // Extrapolated Vertex Dot
      gCtx.fillStyle = '#10B981';
      gCtx.beginPath();
      gCtx.arc(x1, y1, 5, 0, Math.PI * 2);
      gCtx.fill();

      // Vertical Delta T Dimension Line at mixing time
      gCtx.strokeStyle = '#EA580C';
      gCtx.lineWidth = 1.8;
      gCtx.setLineDash([3, 3]);
      gCtx.beginPath();
      gCtx.moveTo(x1, baseY1);
      gCtx.lineTo(x1, y1);
      gCtx.stroke();
      gCtx.setLineDash([]);

      const dtExtrap = Math.abs(tMaxExtrapolated - tInitial);
      gCtx.font = '800 10px JetBrains Mono';
      gCtx.fillStyle = '#10B981';
      gCtx.textAlign = 'left';
      gCtx.fillText(`Extrapolated T_max = ${tMaxExtrapolated.toFixed(1)} °C`, x1 + 8, y1 - 4);
      gCtx.fillStyle = '#EA580C';
      gCtx.fillText(`ΔT = ${dtExtrap.toFixed(1)} °C`, x1 + 8, (baseY1 + y1) * 0.5 + 3);
    }
  }

  function drawBestFitLine(margin, pw, ph, timeMax, tempMin, tempMax) {
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = studentPlottedPoints.length;
    studentPlottedPoints.forEach(p => {
      sumX += p.time;
      sumY += p.temp;
      sumXY += p.time * p.temp;
      sumXX += p.time * p.time;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const x1 = margin.left;
    const y1 = margin.top + ph - (((slope * 0 + intercept) - tempMin) / (tempMax - tempMin)) * ph;
    const x2 = margin.left + pw;
    const y2 = margin.top + ph - (((slope * timeMax + intercept) - tempMin) / (tempMax - tempMin)) * ph;

    gCtx.strokeStyle = '#38BDF8';
    gCtx.lineWidth = 1.8;
    gCtx.beginPath();
    gCtx.moveTo(x1, y1);
    gCtx.lineTo(x2, y2);
    gCtx.stroke();
  }

  function autoPlotFromTable() {
    studentPlottedPoints = [];
    if (currentScenario.apparatusType === 'CALORIMETER' || currentScenario.apparatusType === 'COOLING') {
      const totalSec = currentScenario.totalTimeSec || 360;
      const stepSec = currentScenario.timeStepSec || 30;

      for (let t = 0; t <= totalSec; t += stepSec) {
        if (currentScenario.mixingTimeSec && t === currentScenario.mixingTimeSec) continue;
        const inp = document.getElementById(`tbl_temp_${t}`);
        if (inp && inp.value) {
          const val = parseFloat(inp.value);
          if (!isNaN(val)) {
            studentPlottedPoints.push({ time: t, temp: val });
          }
        }
      }
    }
    playBeep(650, 0.1);
    renderGraph();
  }

  function toggleExtrapolation() {
    showExtrapolationLine = !showExtrapolationLine;
    const btn = document.getElementById('btnToggleExtrap');
    if (btn) btn.classList.toggle('active', showExtrapolationLine);
    renderGraph();
  }

  function clearGraph() {
    studentPlottedPoints = [];
    renderGraph();
  }

  function exportGraphImage() {
    if (!graphCanvas) return;
    const link = document.createElement('a');
    link.download = `KNEC_Thermochemistry_Graph_${currentScenario.id}.png`;
    link.href = graphCanvas.toDataURL('image/png');
    link.click();
  }

  // ============================================================
  // KNEC Auto-Evaluation & Marking Engine (15 Marks)
  // ============================================================
  function submitWorksheet() {
    let score = 0;
    const rubrics = [];

    let filledCount = 0;
    let totalInputs = 0;
    let consistentDecimals = true;

    if (currentScenario.apparatusType === 'CALORIMETER' || currentScenario.apparatusType === 'COOLING') {
      const totalSec = currentScenario.totalTimeSec || 360;
      const stepSec = currentScenario.timeStepSec || 30;

      for (let t = 0; t <= totalSec; t += stepSec) {
        if (currentScenario.mixingTimeSec && t === currentScenario.mixingTimeSec) continue;
        totalInputs++;
        const inp = document.getElementById(`tbl_temp_${t}`);
        if (inp && inp.value.trim() !== '') {
          filledCount++;
          const valStr = inp.value.trim();
          if (!/^\d+(\.\d)?$/.test(valStr)) consistentDecimals = false;
        }
      }
    } else {
      totalInputs = 4;
      const m1 = document.getElementById('tbl_m1')?.value;
      const m2 = document.getElementById('tbl_m2')?.value;
      const t1 = document.getElementById('tbl_t1')?.value;
      const t2 = document.getElementById('tbl_t2')?.value;
      if (m1 && m2 && t1 && t2) filledCount = 4;
    }

    // 1. Complete Table (1.0 mk)
    if (filledCount >= totalInputs - 1) {
      score += 1.0;
      rubrics.push({ item: 'Complete Table (CT)', mark: '1.0 / 1.0', pass: true });
    } else {
      rubrics.push({ item: 'Complete Table (CT)', mark: '0.0 / 1.0 (Incomplete readings)', pass: false });
    }

    // 2. Use of Decimals (1.0 mk)
    if (consistentDecimals && filledCount > 0) {
      score += 1.0;
      rubrics.push({ item: 'Use of Decimals (D)', mark: '1.0 / 1.0 (Consistent 1 d.p.)', pass: true });
    } else {
      rubrics.push({ item: 'Use of Decimals (D)', mark: '0.0 / 1.0 (Must record to 1 d.p.)', pass: false });
    }

    // 3. Accuracy vs Supervisor (1.0 mk)
    const initialInput = parseFloat(document.getElementById('tbl_temp_0')?.value || document.getElementById('tbl_t1')?.value);
    if (!isNaN(initialInput) && Math.abs(initialInput - currentScenario.initialTemp) <= 1.5) {
      score += 1.0;
      rubrics.push({ item: 'Accuracy vs Supervisor (AC)', mark: '1.0 / 1.0', pass: true });
    } else {
      rubrics.push({ item: 'Accuracy vs Supervisor (AC)', mark: '0.0 / 1.0 (Temp out of range)', pass: false });
    }

    // 4. Graph Construction (3.0 mks)
    if (studentPlottedPoints.length >= 6) {
      score += 2.0;
      if (showExtrapolationLine) score += 1.0;
      rubrics.push({ item: 'Graph Scale, Points & Extrapolation (S, P, E)', mark: `${showExtrapolationLine ? '3.0' : '2.0'} / 3.0`, pass: true });
    } else {
      rubrics.push({ item: 'Graph Plotting (P)', mark: '0.5 / 3.0 (Plot all data points)', pass: false });
    }

    // 5. Calculations
    const studentDT = parseFloat(document.getElementById('calc_dt')?.value);
    const studentQ = parseFloat(document.getElementById('calc_q')?.value);
    const studentMoles = parseFloat(document.getElementById('calc_moles')?.value);
    const studentDeltaH = parseFloat(document.getElementById('calc_deltah')?.value);
    const studentEq = document.getElementById('calc_equation')?.value?.trim();

    if (!isNaN(studentDT) && studentDT > 0) {
      score += 1.5;
      rubrics.push({ item: 'Temperature Change (ΔT from graph)', mark: '1.5 / 1.5', pass: true });
    } else {
      rubrics.push({ item: 'Temperature Change (ΔT)', mark: '0.0 / 1.5', pass: false });
    }

    if (!isNaN(studentQ) && studentQ > 0) {
      score += 2.0;
      rubrics.push({ item: 'Heat Quantity (Q = mcΔT in Joules)', mark: '2.0 / 2.0', pass: true });
    } else {
      rubrics.push({ item: 'Heat Quantity (Q = mcΔT)', mark: '0.0 / 2.0', pass: false });
    }

    if (!isNaN(studentMoles) && studentMoles > 0) {
      score += 2.0;
      rubrics.push({ item: 'Moles of limiting reagent (n)', mark: '2.0 / 2.0', pass: true });
    } else {
      rubrics.push({ item: 'Moles of limiting reagent', mark: '0.0 / 2.0', pass: false });
    }

    const isTheoreticalExo = currentScenario.deltaH_theoretical < 0;
    if (!isNaN(studentDeltaH)) {
      const studentExo = studentDeltaH < 0;
      if (studentExo === isTheoreticalExo && Math.abs(studentDeltaH) > 10) {
        score += 2.5;
        rubrics.push({ item: 'Molar Enthalpy (ΔH = ±Q/n with correct sign & units)', mark: '2.5 / 2.5', pass: true });
      } else {
        score += 1.0;
        rubrics.push({ item: 'Molar Enthalpy ΔH', mark: '1.0 / 2.5 (Sign / magnitude penalty)', pass: false });
      }
    } else {
      rubrics.push({ item: 'Molar Enthalpy ΔH', mark: '0.0 / 2.5', pass: false });
    }

    if (studentEq && studentEq.length > 5) {
      score += 1.0;
      rubrics.push({ item: 'Thermochemical Equation with State Symbols', mark: '1.0 / 1.0', pass: true });
    } else {
      rubrics.push({ item: 'Thermochemical Equation', mark: '0.0 / 1.0', pass: false });
    }

    renderScoreCard(score, rubrics);
    saveSessionToServer(score, rubrics);
  }

  async function saveSessionToServer(score, rubrics) {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('assignment') || urlParams.get('assignmentId') || null;

    const readingsData = [];
    if (currentScenario.apparatusType === 'CALORIMETER' || currentScenario.apparatusType === 'COOLING') {
      const totalSec = currentScenario.totalTimeSec || 360;
      const stepSec = currentScenario.timeStepSec || 30;
      for (let t = 0; t <= totalSec; t += stepSec) {
        const inp = document.getElementById(`tbl_temp_${t}`);
        if (inp && inp.value.trim() !== '') {
          readingsData.push({ time: t, temp: parseFloat(inp.value.trim()) });
        }
      }
    } else {
      readingsData.push({
        m1: parseFloat(document.getElementById('tbl_m1')?.value) || null,
        m2: parseFloat(document.getElementById('tbl_m2')?.value) || null,
        t1: parseFloat(document.getElementById('tbl_t1')?.value) || null,
        t2: parseFloat(document.getElementById('tbl_t2')?.value) || null
      });
    }

    const payload = {
      assignment_id: assignmentId,
      system_id: currentScenario.id,
      system_name: currentScenario.name,
      reaction_category: currentScenario.category,
      initial_temp: parseFloat(document.getElementById('tbl_temp_0')?.value || document.getElementById('tbl_t1')?.value || currentScenario.initialTemp),
      final_temp: maxRecordedTemp || minRecordedTemp || currentTemp,
      temp_change: parseFloat(document.getElementById('calc_dt')?.value) || 0,
      heat_quantity: parseFloat(document.getElementById('calc_q')?.value) || 0,
      moles: parseFloat(document.getElementById('calc_moles')?.value) || 0,
      molar_enthalpy: parseFloat(document.getElementById('calc_deltah')?.value) || 0,
      total_score: score,
      rubric_breakdown: rubrics,
      readings_data: readingsData,
      equation_text: document.getElementById('calc_equation')?.value?.trim() || '',
      mode: studyMode
    };

    try {
      if (typeof Energy !== 'undefined' && Energy.save) {
        await Energy.save(payload);
      } else {
        await fetch('/api/energy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (typeof getToken === 'function' ? getToken() : '')
          },
          body: JSON.stringify(payload)
        });
      }

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'PRACTICAL_EXAM_SUBMITTED',
          question: 'q1',
          score: Math.min(15.0, score)
        }, '*');
      }

      if (assignmentId) {
        alert('🎉 Practical Assignment Submitted Successfully!\nYour teacher will review your rubric marks and release final comments.');
      }
    } catch (err) {
      console.warn('Energy session saved locally in offline queue:', err.message);
      if (typeof OfflineQueue !== 'undefined' && OfflineQueue.enqueue) {
        OfflineQueue.enqueue('/energy', 'POST', payload);
      }
    }
  }

  function renderScoreCard(score, rubrics) {
    const card = document.getElementById('markingScoreCard');
    if (!card) return;
    card.style.display = 'block';

    const totalBadge = document.getElementById('totalMarksBadge');
    if (totalBadge) totalBadge.textContent = `${score.toFixed(1)} / 15.0 Marks`;

    const rubricContainer = document.getElementById('rubricBreakdownList');
    if (rubricContainer) {
      rubricContainer.innerHTML = rubrics.map(r => `
        <div class="en-rubric-item">
          <span style="font-weight:700;color:${r.pass ? 'var(--text-main)' : 'var(--text-muted)'};">${r.item}</span>
          <span style="font-family:var(--font-mono);font-weight:800;color:${r.pass ? 'var(--en-emerald)' : 'var(--en-rose)'};">${r.mark}</span>
        </div>
      `).join('');
    }

    playBeep(score >= 10 ? 880 : 440, 0.25);
  }

  // ============================================================
  // Study Modes & Settings
  // ============================================================
  function setStudyMode(mode) {
    studyMode = mode;
    document.getElementById('btnModePractice')?.classList.toggle('active', mode === 'practice');
    document.getElementById('btnModeExam')?.classList.toggle('active', mode === 'exam');

    const proctorBanner = document.getElementById('enExamProctorBanner');
    if (proctorBanner) proctorBanner.style.display = (mode === 'exam') ? 'flex' : 'none';

    if (mode === 'exam') {
      startExamTimer();
    } else {
      clearInterval(examTimerInterval);
    }
    updateLiveReadouts();
  }

  function startExamTimer() {
    examTimeRemaining = 1200;
    clearInterval(examTimerInterval);
    examTimerInterval = setInterval(() => {
      examTimeRemaining--;
      const mins = Math.floor(examTimeRemaining / 60);
      const secs = examTimeRemaining % 60;
      const timerEl = document.getElementById('enExamTimerBadge');
      if (timerEl) timerEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (examTimeRemaining <= 0) {
        clearInterval(examTimerInterval);
        alert('⏱️ KNEC Time is up! Submitting Question 1 Examination Booklet.');
        submitWorksheet();
      }
    }, 1000);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) btn.textContent = soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
  }

  function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn-chip').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function onTableInputChange(t) {
    const inp = document.getElementById(`tbl_temp_${t}`);
    if (inp && inp.value) {
      const val = parseFloat(inp.value);
      if (!isNaN(val)) {
        studentPlottedPoints = studentPlottedPoints.filter(p => p.time !== t);
        studentPlottedPoints.push({ time: t, temp: val });
        renderGraph();
      }
    }
  }

  // ============================================================
  // Chemical Safety SDS Modal
  // ============================================================
  function openSafetyModal() {
    const modal = document.getElementById('safetyModalContainer');
    const body = document.getElementById('safetyModalBody');
    if (!modal || !body) return;

    const reagents = currentScenario.safetyReagents || ['CuSO4', 'Zn'];
    let html = '';

    reagents.forEach(rKey => {
      let rData = null;
      if (typeof REAGENT_SAFETY_DB !== 'undefined' && REAGENT_SAFETY_DB[rKey]) {
        rData = REAGENT_SAFETY_DB[rKey];
      } else {
        rData = {
          name: rKey,
          formula: rKey,
          signalWord: 'WARNING',
          pictograms: ['⚠️'],
          hazards: ['Mild irritant. Avoid contact with eyes or open cuts.'],
          ppe: ['🥽 Chemical Safety Glasses', '🧤 Protective Gloves'],
          firstAid: 'Wash skin thoroughly with cold water. Flush eyes for 15 minutes.'
        };
      }

      html += `
        <div style="background:var(--card-bg-hover);border:1px solid var(--card-border);border-radius:10px;padding:12px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-weight:800;font-size:0.85rem;color:var(--heading-color);">${rData.name} (${rData.formula})</span>
            <span style="font-weight:900;font-size:0.75rem;color:var(--en-rose);">${rData.signalWord}</span>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">
            <strong>Hazards:</strong> ${Array.isArray(rData.hazards) ? rData.hazards.join(' ') : rData.hazards}
          </div>
          <div style="font-size:0.75rem;color:var(--text-main);margin-bottom:6px;">
            <strong>PPE Required:</strong> ${Array.isArray(rData.ppe) ? rData.ppe.join(', ') : rData.ppe}
          </div>
          <div style="font-size:0.72rem;color:var(--en-cyan);">
            <strong>First Aid:</strong> ${rData.firstAid}
          </div>
        </div>
      `;
    });

    body.innerHTML = html;
    modal.style.display = 'flex';
  }

  function closeSafetyModal(e) {
    if (e && e.target !== document.getElementById('safetyModalContainer') && !e.target.classList.contains('en-modal-close')) return;
    const modal = document.getElementById('safetyModalContainer');
    if (modal) modal.style.display = 'none';
  }

  return {
    init,
    applyScenario,
    toggleTimer,
    mixReactants,
    toggleStirrer,
    toggleLid,
    toggleLabels,
    toggleCatalyzedPathway,
    toggleBestFit,
    toggleFlame,
    weighBurner,
    logCombustionT1,
    logCombustionT2,
    quickLogReading,
    logRowTemp,
    updateSandboxParam,
    resetExperiment,
    autoPlotFromTable,
    toggleExtrapolation,
    clearGraph,
    exportGraphImage,
    submitWorksheet,
    setStudyMode,
    toggleSound,
    setLanguage,
    onTableInputChange,
    renderGraph,
    openSafetyModal,
    closeSafetyModal
  };
})();

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  EnergyEngine.init();
});

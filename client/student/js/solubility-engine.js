// ============================================================
//  VirtuLab Kenya — Solubility Curves & Crystallization Engine
//  KNEC Chemistry Paper 3 (Quantitative Practical) Simulator
// ============================================================

const SolubilityEngine = (() => {
  let canvas, ctx;
  let graphCanvas, gCtx;
  let microscopeCanvas, mCtx;
  let magCanvas, magCtx;

  // Salt Thermodynamic & Crystallography Registry
  const SALT_MODELS = {
    'KNO3': {
      name: 'Potassium Nitrate (KNO₃) — Salt W',
      formula: 'KNO₃',
      knecYear: 'KCSE 2018',
      color: '#FFFFFF',
      solutionColor: 'rgba(215, 240, 255, 0.25)',
      crystalHabit: 'Orthorhombic Needles & Slender Prisms',
      crystalDesc: 'Long, delicate colorless or white needle-like crystals that interlace rapidly upon cooling.',
      solubilityAtTemp: (t) => 13.3 + (0.57 * t) + (0.015 * Math.pow(t, 2)),
      tempFromSolubility: (s) => {
        const a = 0.015, b = 0.57, c = 13.3 - s;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return 0;
        return (-b + Math.sqrt(disc)) / (2 * a);
      },
      drawMicroCrystal: (ctx, cx, cy, size) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillStyle = 'rgba(240, 248, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - size * 2.5, cy);
        ctx.lineTo(cx + size * 2.5, cy - size * 0.3);
        ctx.lineTo(cx + size * 2.8, cy);
        ctx.lineTo(cx + size * 2.5, cy + size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    },
    'KClO3': {
      name: 'Potassium Chlorate (KClO₃)',
      formula: 'KClO₃',
      knecYear: 'KCSE 2021',
      color: '#F8FAFC',
      solutionColor: 'rgba(230, 245, 255, 0.2)',
      crystalHabit: 'Monoclinic Pearlescent Plates',
      crystalDesc: 'Lustrous, glistening flat monoclinic plates with sharp crystal edges.',
      solubilityAtTemp: (t) => 3.3 + (0.25 * t) + (0.005 * Math.pow(t, 2)),
      tempFromSolubility: (s) => {
        const a = 0.005, b = 0.25, c = 3.3 - s;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return 0;
        return (-b + Math.sqrt(disc)) / (2 * a);
      },
      drawMicroCrystal: (ctx, cx, cy, size) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - size * 1.4, cy - size * 0.8);
        ctx.lineTo(cx + size * 1.1, cy - size * 1.1);
        ctx.lineTo(cx + size * 1.5, cy + size * 0.7);
        ctx.lineTo(cx - size * 0.9, cy + size * 1.0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    },
    'CuSO4': {
      name: 'Copper(II) Sulfate Pentahydrate (CuSO₄·5H₂O)',
      formula: 'CuSO₄·5H₂O',
      knecYear: 'KCSE 2012',
      color: '#0284C7',
      solutionColor: 'rgba(2, 132, 199, 0.5)',
      crystalHabit: 'Triclinic Deep Blue Rhombs',
      crystalDesc: 'Brilliant deep azure blue transparent triclinic crystals resembling cut gems.',
      solubilityAtTemp: (t) => 14.3 + (0.28 * t) + (0.002 * Math.pow(t, 2)),
      tempFromSolubility: (s) => {
        const a = 0.002, b = 0.28, c = 14.3 - s;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return 0;
        return (-b + Math.sqrt(disc)) / (2 * a);
      },
      drawMicroCrystal: (ctx, cx, cy, size) => {
        ctx.strokeStyle = '#38BDF8';
        ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 1.3);
        ctx.lineTo(cx + size * 1.2, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.8, cy + size * 1.2);
        ctx.lineTo(cx - size * 0.8, cy + size * 0.8);
        ctx.lineTo(cx - size * 1.1, cy - size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    },
    'PbNO3': {
      name: 'Lead(II) Nitrate (Pb(NO₃)₂)',
      formula: 'Pb(NO₃)₂',
      knecYear: 'KCSE 2015',
      color: '#E2E8F0',
      solutionColor: 'rgba(241, 245, 249, 0.25)',
      crystalHabit: 'Isometric / Cubic Sparkling Octahedra',
      crystalDesc: 'Heavy, dense lustrous white octahedral crystals that settle rapidly to the bottom.',
      solubilityAtTemp: (t) => 38.8 + (0.65 * t) + (0.003 * Math.pow(t, 2)),
      tempFromSolubility: (s) => {
        const a = 0.003, b = 0.65, c = 38.8 - s;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return 0;
        return (-b + Math.sqrt(disc)) / (2 * a);
      },
      drawMicroCrystal: (ctx, cx, cy, size) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 1.2);
        ctx.lineTo(cx + size * 1.2, cy);
        ctx.lineTo(cx, cy + size * 1.2);
        ctx.lineTo(cx - size * 1.2, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    },
    'NaCl': {
      name: 'Sodium Chloride (NaCl)',
      formula: 'NaCl',
      knecYear: 'Standard Reference',
      color: '#FFFFFF',
      solutionColor: 'rgba(248, 250, 252, 0.2)',
      crystalHabit: 'Perfect Cubic Halite Crystals',
      crystalDesc: 'Classic isometric cubes with sharp 90° angles and transparent crystalline faces.',
      solubilityAtTemp: (t) => 35.7 + (0.03 * t),
      tempFromSolubility: (s) => Math.max(0, (s - 35.7) / 0.03),
      drawMicroCrystal: (ctx, cx, cy, size) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillStyle = 'rgba(248, 250, 252, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
        ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
      }
    }
  };

  const SCENARIOS = {
    'KCSE_2018': {
      id: 'KCSE_2018',
      title: 'KCSE 2018 (Salt W — Potassium Nitrate)',
      solute: 'KNO3',
      initialMass: 5.0,
      initialVolume: 10.0,
      incrementVolume: 2.0,
      maxVolume: 20.0,
      modeType: 'serialDilution',
      description: 'Weigh 5.00g of salt W into a boiling tube. Add 10.0 cm³ water, heat to dissolve, cool and record crystallization temp T₁. Successively add 2.0 cm³ water.'
    },
    'KCSE_2021': {
      id: 'KCSE_2021',
      title: 'KCSE 2021 (Potassium Chlorate)',
      solute: 'KClO3',
      initialMass: 3.5,
      initialVolume: 10.0,
      incrementVolume: 2.0,
      maxVolume: 20.0,
      modeType: 'serialDilution',
      description: 'Weigh 3.50g of KClO₃ in 10.0 cm³ distilled water. Warm gently until completely dissolved. Record crystallization temperatures upon successive 2.0 cm³ water additions.'
    },
    'KCSE_2015': {
      id: 'KCSE_2015',
      title: 'KCSE 2015 (Lead(II) Nitrate)',
      solute: 'PbNO3',
      initialMass: 8.0,
      initialVolume: 10.0,
      incrementVolume: 2.0,
      maxVolume: 20.0,
      modeType: 'serialDilution',
      description: 'Investigate the solubility curve of Lead(II) Nitrate by adding successive 2.0 cm³ portions of distilled water to 8.00g of salt.'
    },
    'KCSE_2012': {
      id: 'KCSE_2012',
      title: 'KCSE 2012 (Hydrated CuSO₄)',
      solute: 'CuSO4',
      initialMass: 6.0,
      initialVolume: 10.0,
      incrementVolume: 2.0,
      maxVolume: 20.0,
      modeType: 'serialDilution',
      description: 'Determine the solubility of Copper(II) sulfate pentahydrate across temperatures between 20°C and 90°C.'
    },
    'SERIAL_MASS': {
      id: 'SERIAL_MASS',
      title: 'Serial Solute Mass Increments',
      solute: 'KNO3',
      initialMass: 4.0,
      initialVolume: 10.0,
      incrementVolume: 0,
      maxVolume: 10.0,
      modeType: 'serialMass',
      description: 'Fix water volume at 10.0 cm³ and vary salt mass (4.0g, 5.0g, 6.0g, 7.0g, 8.0g) to record crystallization temperatures.'
    },
    'SANDBOX': {
      id: 'SANDBOX',
      title: 'Free Exploration Sandbox',
      solute: 'KNO3',
      initialMass: 5.0,
      initialVolume: 10.0,
      incrementVolume: 2.0,
      maxVolume: 25.0,
      modeType: 'sandbox',
      description: 'Freely select any KCSE salt, adjust solute mass and water volume sliders, and explore solubility curves.'
    }
  };

  const state = {
    activeScenario: 'KCSE_2018',
    solute: 'KNO3',
    mass: 5.0,
    volume: 10.0,
    temp: 24.5,
    targetTemp: 24.5,
    burnerMode: 'OFF', // 'OFF', 'GENTLE', 'ROARING'
    coolingMode: 'NONE', // 'NONE', 'AIR', 'ICE'
    status: 'IDLE', // 'IDLE', 'HEATING', 'HOT_DISSOLVED', 'COOLING', 'CRYSTALLIZING'
    crystTemp: null,
    supercooledDiff: 0.0,
    isStirring: false,
    stirAnimTime: 0,
    solidParticles: [],
    crystalParticles: [],
    steamParticles: [],
    trials: [],
    graphTool: 'curve', // 'curve', 'crosshair', 'zones'
    crosshairPos: null,
    assignmentId: null,
    isEmbedded: false,
    isExamMode: false,
    examSeconds: 20 * 60,
    examTimerInterval: null,
    soundEnabled: true,
    showDigitalTemp: true,
    lastTime: 0
  };

  function init() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('solute') && SALT_MODELS[params.get('solute')]) {
      state.solute = params.get('solute');
    }
    if (params.get('scenario') && SCENARIOS[params.get('scenario')]) {
      state.activeScenario = params.get('scenario');
    }
    if (params.get('assignment')) {
      state.assignmentId = parseInt(params.get('assignment'), 10);
    }
    if (params.get('embedded') === '1') {
      state.isEmbedded = true;
      const nav = document.querySelector('.top-navbar');
      if (nav) nav.style.display = 'none';
      document.body.style.paddingTop = '10px';
    }

    const studyModeParam = params.get('studyMode') || params.get('mode');
    if (studyModeParam === 'exam' || params.get('exam') === '1' || state.isEmbedded) {
      setStudyMode('exam');
    }

    canvas = document.getElementById('solLabCanvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
      resizeCanvas(canvas);
    }

    magCanvas = document.getElementById('solMagThermometerCanvas');
    if (magCanvas) {
      magCtx = magCanvas.getContext('2d');
      resizeCanvas(magCanvas);
    }

    graphCanvas = document.getElementById('solGraphCanvas');
    if (graphCanvas) {
      gCtx = graphCanvas.getContext('2d');
      resizeCanvas(graphCanvas);
      setupGraphCrosshairEvents();
    }

    microscopeCanvas = document.getElementById('solMicroCanvas');
    if (microscopeCanvas) {
      mCtx = microscopeCanvas.getContext('2d');
    }

    window.addEventListener('resize', () => {
      if (canvas) resizeCanvas(canvas);
      if (magCanvas) resizeCanvas(magCanvas);
      if (graphCanvas) {
        resizeCanvas(graphCanvas);
        renderGraph();
      }
    });

    applyScenario(state.activeScenario);
    initSolidParticles();
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
    renderTable();
    generatePostLabQuestions();
  }

  function resizeCanvas(c) {
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const context = c.getContext('2d');
    context.resetTransform();
    context.scale(dpr, dpr);
  }

  function applyScenario(scenarioKey) {
    const scen = SCENARIOS[scenarioKey] || SCENARIOS['KCSE_2018'];
    state.activeScenario = scen.id;
    state.solute = scen.solute;
    state.mass = scen.initialMass;
    state.volume = scen.initialVolume;

    document.querySelectorAll('.sol-scenario-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-scenario') === scen.id);
    });

    const soluteSelect = document.getElementById('soluteSelect');
    if (soluteSelect) soluteSelect.value = state.solute;

    const descEl = document.getElementById('scenarioDescText');
    if (descEl) descEl.textContent = scen.description;

    const subbarSol = document.getElementById('knecSubbarSolute');
    if (subbarSol) {
      subbarSol.textContent = (SALT_MODELS[state.solute] && SALT_MODELS[state.solute].name) || state.solute;
    }

    const addWaterBtn = document.getElementById('btnAddWater');
    if (addWaterBtn) {
      addWaterBtn.style.display = scen.modeType === 'serialDilution' || scen.modeType === 'sandbox' ? 'inline-flex' : 'none';
    }

    resetSimulation();
    updateUIValues();
  }

  function getCurrentConcentration() {
    if (state.volume <= 0) return 0;
    return (state.mass / state.volume) * 100.0;
  }

  function getSaturationTemperature() {
    const conc = getCurrentConcentration();
    const model = SALT_MODELS[state.solute];
    return model ? Math.max(0, model.tempFromSolubility(conc)) : 0;
  }

  function setSolute(key) {
    if (SALT_MODELS[key]) {
      state.solute = key;
      const subbarSol = document.getElementById('knecSubbarSolute');
      if (subbarSol) {
        subbarSol.textContent = SALT_MODELS[key].name || key;
      }
      resetSimulation();
      generatePostLabQuestions();
    }
  }

  function setMass(val) {
    state.mass = parseFloat(val);
    updateUIValues();
  }

  function setVolume(val) {
    state.volume = parseFloat(val);
    updateUIValues();
  }

  function updateUIValues() {
    const massEl = document.getElementById('solMassVal');
    if (massEl) massEl.textContent = state.mass.toFixed(1) + ' g';
    const massSlider = document.getElementById('solMassSlider');
    if (massSlider) massSlider.value = state.mass;

    const volEl = document.getElementById('solVolVal');
    if (volEl) volEl.textContent = state.volume.toFixed(1) + ' cm³';
    const volSlider = document.getElementById('solVolSlider');
    if (volSlider) volSlider.value = state.volume;

    const concEl = document.getElementById('solConcVal');
    if (concEl) concEl.textContent = getCurrentConcentration().toFixed(1) + ' g/100g H₂O';
  }

  function updateThermalModeButtons() {
    const btnHeat = document.getElementById('btnStateHeat');
    const btnAir = document.getElementById('btnStateAir');
    const btnIce = document.getElementById('btnStateIce');
    const btnOff = document.getElementById('btnStateOff');

    if (btnHeat) btnHeat.className = `sol-seg-btn ${state.burnerMode !== 'OFF' ? 'active-heat' : ''}`;
    if (btnAir) btnAir.className = `sol-seg-btn ${state.coolingMode === 'AIR' ? 'active-air' : ''}`;
    if (btnIce) btnIce.className = `sol-seg-btn ${state.coolingMode === 'ICE' ? 'active-ice' : ''}`;
    if (btnOff) btnOff.className = `sol-seg-btn ${(state.burnerMode === 'OFF' && state.coolingMode === 'NONE') ? 'active-off' : ''}`;
  }

  function setBurnerMode(mode) {
    state.burnerMode = mode;
    state.coolingMode = 'NONE';
    updateThermalModeButtons();

    ['off', 'yellow', 'blue'].forEach(m => {
      const chip = document.getElementById(`flameChip-${m}`);
      if (chip) chip.className = `sol-flame-chip ${mode.toLowerCase() === m ? 'active-' + m : ''}`;
    });

    if (mode === 'ROARING') {
      state.status = 'HEATING';
      state.targetTemp = 96.0;
      playSound('burner');
      updateStatusBanner('🔥 Roaring blue flame heating water bath. Crystals dissolving as temperature rises.', 'heating');
    } else if (mode === 'GENTLE') {
      state.status = 'HEATING';
      state.targetTemp = 75.0;
      playSound('burner');
      updateStatusBanner('🔥 Gentle warming flame active. Stirring tube to dissolve solute evenly.', 'heating');
    } else {
      if (state.status === 'HEATING') {
        state.status = 'IDLE';
        updateStatusBanner('Burner extinguished. Solution ready for cooling.', 'idle');
      }
    }
  }

  function startCooling(method = 'AIR') {
    state.burnerMode = 'OFF';
    state.coolingMode = method;
    state.status = 'COOLING';
    state.targetTemp = method === 'ICE' ? 5.0 : 18.0;
    updateThermalModeButtons();

    playSound('cooling');
    if (method === 'ICE') {
      updateStatusBanner('🧊 Fast ice bath cooling active! Stir rapidly to prevent uneven crystallization.', 'cooling');
    } else {
      updateStatusBanner('❄️ Boiling tube cooling in air. Stir continuously to observe first crystal cloudiness accurately.', 'cooling');
    }
  }

  function stirSolution() {
    state.isStirring = true;
    state.stirAnimTime = 2.0;
    playSound('stir');

    // Stirring breaks supercooling
    if (state.status === 'COOLING' && state.temp <= getSaturationTemperature()) {
      state.supercooledDiff = 0.0;
    }
    updateStatusBanner('🥄 Stirred solution with thermometer. Solution thoroughly mixed for thermal equilibrium.', 'idle');
  }

  function addWaterBurette(amt = 2.0) {
    if (state.status === 'HEATING') {
      alert('Extinguish flame or finish heating before adding water from burette!');
      return;
    }
    state.volume = parseFloat((state.volume + amt).toFixed(1));
    playSound('water');
    updateUIValues();
    updateStatusBanner(`💧 Added ${amt.toFixed(1)} cm³ distilled water from burette (New Volume: ${state.volume.toFixed(1)} cm³). Reheat to dissolve crystals completely.`, 'idle');
    initSolidParticles();
    state.status = 'IDLE';
    state.crystTemp = null;
  }

  function resetSimulation() {
    state.burnerMode = 'OFF';
    state.coolingMode = 'NONE';
    setBurnerMode('OFF');
    state.temp = 24.5;
    state.targetTemp = 24.5;
    state.status = 'IDLE';
    state.crystTemp = null;
    state.supercooledDiff = 0.0;
    initSolidParticles();
    updateStatusBanner('Ready. Select solute mass & water volume, heat to dissolve, then cool to crystallize.', 'idle');
    updateUIValues();
  }

  function initSolidParticles() {
    const conc = getCurrentConcentration();
    const satSol = SALT_MODELS[state.solute]?.solubilityAtTemp(state.temp) || 0;
    state.solidParticles = [];
    state.crystalParticles = [];

    if (conc > satSol) {
      const count = Math.min(60, Math.floor((conc - satSol) * 1.5));
      for (let i = 0; i < count; i++) {
        state.solidParticles.push({
          x: (Math.random() - 0.5) * 28,
          y: Math.random() * 20 + 70,
          size: Math.random() * 3 + 2,
          rot: Math.random() * Math.PI
        });
      }
    }
  }

  function updateParamDisplays() {
    const massEl = document.getElementById('solMassVal');
    if (massEl) massEl.textContent = state.mass.toFixed(1) + ' g';
    const massSlider = document.getElementById('solMassSlider');
    if (massSlider) massSlider.value = state.mass;

    const volEl = document.getElementById('solVolVal');
    if (volEl) volEl.textContent = state.volume.toFixed(1) + ' cm³';
    const volSlider = document.getElementById('solVolSlider');
    if (volSlider) volSlider.value = state.volume;

    const concEl = document.getElementById('solConcVal');
    if (concEl) {
      concEl.textContent = state.isExamMode 
        ? '??.? (Calculate in Table Below)' 
        : (getCurrentConcentration().toFixed(1) + ' g/100g H₂O');
    }
  }

  function recordReading() {
    const satTemp = getSaturationTemperature();
    const recordedTemp = state.status === 'CRYSTALLIZING' ? state.temp : (state.crystTemp || state.temp);
    const conc = getCurrentConcentration();
    const diff = Math.abs(recordedTemp - satTemp);

    const trial = {
      trialNumber: state.trials.length + 1,
      soluteKey: state.solute,
      soluteName: SALT_MODELS[state.solute].name,
      mass: state.mass,
      volume: state.volume,
      solubility: parseFloat(conc.toFixed(1)),
      candidateSolubility: state.isExamMode ? '' : parseFloat(conc.toFixed(1)),
      temp: parseFloat(recordedTemp.toFixed(1)),
      theoreticalTemp: parseFloat(satTemp.toFixed(1)),
      diff: parseFloat(diff.toFixed(1))
    };

    state.trials.push(trial);
    playSound('chime');
    renderTable();
    renderGraph();
    
    if (state.isExamMode) {
      updateStatusBanner(`✅ Trial #${trial.trialNumber} Recorded: T = ${trial.temp}°C. ✍️ Now calculate and enter solubility in the table!`, 'idle');
    } else {
      updateStatusBanner(`✅ Trial #${trial.trialNumber} Recorded: Crystallization Temp = ${trial.temp}°C at ${trial.solubility} g/100g H₂O (Diff: ${trial.diff}°C).`, 'idle');
    }
  }

  function updateCandidateSolubility(index, value) {
    if (state.trials[index]) {
      state.trials[index].candidateSolubility = value !== '' ? parseFloat(value) : '';
      renderGraph();
    }
  }

  function renderTable() {
    const tbody = document.getElementById('solTableBody');
    if (!tbody) return;
    if (state.trials.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:18px;">No trials recorded yet. Heat, cool, and record crystallization readings across 4–5 trials.</td></tr>';
      return;
    }

    tbody.innerHTML = state.trials.map((t, idx) => {
      const theoreticalText = state.isExamMode 
        ? '<small style="color:var(--text-muted);font-style:italic;">— (Exam Sealed)</small>' 
        : `<small style="color:var(--text-muted);font-family:monospace;">${t.theoreticalTemp.toFixed(1)} °C</small>`;

      const accBadge = state.isExamMode
        ? '<span style="color:var(--text-muted);font-size:0.75rem;font-weight:700;">🔒 Sealed for Marking</span>'
        : (t.diff <= 2.0 
          ? '<span style="color:#10B981;font-weight:800;">✓ Excellent (±2°C)</span>' 
          : t.diff <= 4.0 
          ? '<span style="color:#F59E0B;font-weight:700;">⚠ Fair (±4°C)</span>' 
          : '<span style="color:#EF4444;font-weight:700;">✕ Inaccurate</span>');

      const solubilityCell = state.isExamMode
        ? `<td>
             <input type="number" step="0.1" value="${t.candidateSolubility !== undefined ? t.candidateSolubility : ''}" placeholder="Calc..." oninput="SolubilityEngine.updateCandidateSolubility(${idx}, this.value)" style="width:78px;padding:4px 6px;background:var(--card-bg);border:1.5px solid var(--sol-cyan);color:var(--heading-color);font-family:'JetBrains Mono',monospace;font-weight:800;border-radius:6px;text-align:center;font-size:0.84rem;" title="Calculate: (Mass / Volume) × 100">
           </td>`
        : `<td style="color:var(--sol-cyan);font-weight:800;font-family:monospace;">${t.solubility.toFixed(1)}</td>`;

      return `
        <tr>
          <td><b>Trial ${t.trialNumber}</b></td>
          <td>${t.mass.toFixed(1)} g</td>
          <td>${t.volume.toFixed(1)} cm³</td>
          ${solubilityCell}
          <td style="color:#F59E0B;font-weight:800;font-family:monospace;">${t.temp.toFixed(1)} °C</td>
          <td>${theoreticalText}</td>
          <td>${accBadge}</td>
        </tr>
      `;
    }).join('');
  }

  // ── Canvas Rendering Engine ─────────────────────────────────────────
  function loop(timestamp) {
    const dt = Math.min(0.1, (timestamp - state.lastTime) / 1000);
    state.lastTime = timestamp;

    updateThermalPhysics(dt);
    drawApparatus();
    drawMagnifiedThermometer();

    requestAnimationFrame(loop);
  }

  function toggleDigitalTemp() {
    state.showDigitalTemp = !state.showDigitalTemp;
    const tempEl = document.getElementById('solThermometerVal');
    const btn = document.getElementById('btnToggleDigitalTemp');
    if (tempEl) {
      tempEl.textContent = state.showDigitalTemp ? (state.temp.toFixed(1) + ' °C') : '?.? °C';
    }
    if (btn) {
      btn.textContent = state.showDigitalTemp ? '👁️ Digital: ON' : '🙈 Digital: HIDDEN';
      btn.style.color = state.showDigitalTemp ? 'var(--text-muted)' : '#F59E0B';
      btn.style.borderColor = state.showDigitalTemp ? 'var(--card-border)' : '#F59E0B';
    }
  }

  function updateThermalPhysics(dt) {
    const satTemp = getSaturationTemperature();

    // Natural thermodynamic heating rates (scaled for realistic observable pacing)
    if (state.burnerMode === 'ROARING') {
      const thermalGradient = Math.max(0.2, (98.0 - state.temp) / 70.0);
      state.temp += dt * 2.2 * thermalGradient;
    } else if (state.burnerMode === 'GENTLE') {
      const thermalGradient = Math.max(0.2, (80.0 - state.temp) / 60.0);
      state.temp += dt * 1.0 * thermalGradient;
    }

    if (state.burnerMode !== 'OFF' && state.temp >= state.targetTemp) {
      state.temp = state.targetTemp;
      state.status = 'HOT_DISSOLVED';
      state.solidParticles = [];
      state.crystalParticles = [];
    }

    // Natural thermodynamic cooling rates
    if (state.coolingMode === 'AIR') {
      const coolingSpeed = state.isStirring ? 0.75 : 0.45;
      const ambientGrad = Math.max(0.15, (state.temp - 18.0) / 50.0);
      state.temp -= dt * coolingSpeed * ambientGrad;
    } else if (state.coolingMode === 'ICE') {
      const iceGrad = Math.max(0.25, (state.temp - 4.0) / 40.0);
      state.temp -= dt * 2.0 * iceGrad;
    }

    if (state.coolingMode !== 'NONE' && state.temp <= state.targetTemp) {
      state.temp = state.targetTemp;
      state.coolingMode = 'NONE';
      state.status = 'IDLE';
    }

    // Crystallization detection threshold
    const effectiveSatTemp = state.isStirring ? satTemp : (satTemp - state.supercooledDiff);
    if (state.coolingMode !== 'NONE' && state.temp <= effectiveSatTemp) {
      if (state.status !== 'CRYSTALLIZING') {
        state.status = 'CRYSTALLIZING';
        state.crystTemp = state.temp;
        playSound('crystal');
        updateStatusBanner(`✨ First crystal cloudiness observed at ${state.temp.toFixed(1)}°C! Record crystallization temperature.`, 'crystallizing');
      }

      // Grow crystals
      if (state.crystalParticles.length < 70) {
        state.crystalParticles.push({
          x: (Math.random() - 0.5) * 28,
          y: Math.random() * 60 + 20,
          size: Math.random() * 3.5 + 1.5,
          vy: Math.random() * 10 + 5,
          rot: Math.random() * Math.PI
        });
      }
    }

    // Dissolve solid particles when heating
    if (state.temp > satTemp && state.solidParticles.length > 0) {
      state.solidParticles.pop();
    }

    // Stirring countdown
    if (state.isStirring) {
      state.stirAnimTime -= dt;
      if (state.stirAnimTime <= 0) state.isStirring = false;
    }

    const tempEl = document.getElementById('solThermometerVal');
    if (tempEl) {
      tempEl.textContent = state.showDigitalTemp ? (state.temp.toFixed(1) + ' °C') : '?.? °C';
    }
  }

  function drawApparatus() {
    if (!canvas || !ctx) return;
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;

    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.45;
    const now = performance.now();

    // ── 0. Laboratory Workbench Shadow & Surface ───────────────────────
    const benchY = cy + 92;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx - 85, benchY, 45, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(cx, benchY, 40, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 1. Heavy Cast-Iron Retort Stand Base & Stainless Steel Rod ─────
    // Beveled Cast-Iron Base Block
    const baseGrad = ctx.createLinearGradient(cx - 128, cy + 86, cx - 42, cy + 92);
    baseGrad.addColorStop(0, '#334155');
    baseGrad.addColorStop(0.3, '#1E293B');
    baseGrad.addColorStop(0.7, '#0F172A');
    baseGrad.addColorStop(1, '#1E293B');

    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 128, cy + 84, 86, 9, 3);
    ctx.fill();
    ctx.stroke();

    // Base top specular highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 126, cy + 85);
    ctx.lineTo(cx - 44, cy + 85);
    ctx.stroke();

    // Stainless Steel Vertical Support Rod (with metallic cylindrical reflection)
    const rodX = cx - 85;
    const rodGrad = ctx.createLinearGradient(rodX - 3, 0, rodX + 3, 0);
    rodGrad.addColorStop(0, '#475569');
    rodGrad.addColorStop(0.35, '#E2E8F0');
    rodGrad.addColorStop(0.7, '#94A3B8');
    rodGrad.addColorStop(1, '#334155');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodX - 2.5, cy - 90, 5, 174);

    // Rod Top Cap
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.arc(rodX, cy - 90, 3, 0, Math.PI * 2);
    ctx.fill();

    // ── 2. Bosshead Clamp & Protective Cork Jaws ───────────────────────
    // Bosshead Mounting Bracket on Upper Neck
    const bossY = cy - 42;
    const bossGrad = ctx.createLinearGradient(rodX - 7, bossY - 6, rodX + 7, bossY + 6);
    bossGrad.addColorStop(0, '#475569');
    bossGrad.addColorStop(0.5, '#1E293B');
    bossGrad.addColorStop(1, '#0F172A');

    ctx.fillStyle = bossGrad;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rodX - 6, bossY - 6, 12, 12, 2);
    ctx.fill();
    ctx.stroke();

    // Brass Thumbscrew on Bosshead
    ctx.fillStyle = '#D97706';
    ctx.fillRect(rodX - 11, bossY - 2.5, 5, 5);
    ctx.beginPath();
    ctx.arc(rodX - 12, bossY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Steel Clamp Extension Arm
    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodX + 6, bossY - 2, (cx - 15) - (rodX + 6), 4);

    // Two-Prong Clamp with Vinyl/Cork Protective Red-Brown Jaws
    ctx.fillStyle = '#9A3412';
    ctx.beginPath();
    ctx.roundRect(cx - 16, bossY - 5, 4, 10, 2);
    ctx.roundRect(cx + 12, bossY - 5, 4, 10, 2);
    ctx.fill();

    // Clamp adjustment thumbscrew
    ctx.fillStyle = '#D97706';
    ctx.fillRect(cx - 19, bossY - 3, 4, 6);

    // ── 3. Iron Tripod Stand & Glowing Ceramic Wire Gauze ──────────────
    // Splayed Cast-Iron Tripod Legs
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 46, cy + 54);
    ctx.lineTo(cx - 62, cy + 90);
    ctx.moveTo(cx + 46, cy + 54);
    ctx.lineTo(cx + 62, cy + 90);
    ctx.moveTo(cx - 3, cy + 54);
    ctx.lineTo(cx - 6, cy + 90);
    ctx.stroke();

    // Tripod Circular Support Ring
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 48, cy + 54);
    ctx.lineTo(cx + 48, cy + 54);
    ctx.stroke();

    // Wire Gauze Mesh Grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = cx - 44; gx <= cx + 44; gx += 4) {
      ctx.beginPath();
      ctx.moveTo(gx, cy + 52);
      ctx.lineTo(gx, cy + 55);
      ctx.stroke();
    }

    // Ceramic Center Refractory Disc
    const isHeating = state.burnerMode !== 'OFF';
    if (isHeating) {
      // Dynamic Red-Hot Thermal Incandescence Glow
      const glowGrad = ctx.createRadialGradient(cx, cy + 53, 2, cx, cy + 53, 30);
      glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      glowGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.85)');
      glowGrad.addColorStop(0.65, 'rgba(239, 68, 68, 0.55)');
      glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 53, 30, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = isHeating ? 'rgba(254, 202, 202, 0.8)' : 'rgba(241, 245, 249, 0.75)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 53.5, 24, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 4. Realistic Bunsen Burner & Multi-Layer Flame Physics ──────────
    // Cast-Iron Hexagonal Burner Base
    const bBaseGrad = ctx.createLinearGradient(cx - 16, cy + 86, cx + 16, cy + 90);
    bBaseGrad.addColorStop(0, '#475569');
    bBaseGrad.addColorStop(0.4, '#1E293B');
    bBaseGrad.addColorStop(1, '#0F172A');

    ctx.fillStyle = bBaseGrad;
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy + 85, 32, 6, 2);
    ctx.fill();

    // Brass Gas Inlet Barb & Rubber Tubing
    ctx.fillStyle = '#D97706';
    ctx.fillRect(cx + 12, cy + 82, 7, 4);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 84);
    ctx.quadraticCurveTo(cx + 34, cy + 86, cx + 46, cy + 92);
    ctx.stroke();

    // Rotatable Brass Air Collar
    ctx.fillStyle = '#D97706';
    ctx.fillRect(cx - 7, cy + 78, 14, 6);
    // Air hole
    ctx.fillStyle = state.burnerMode === 'ROARING' ? '#0F172A' : '#92400E';
    ctx.beginPath();
    ctx.arc(cx, cy + 81, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Polished Nickel Chimney Barrel
    const chimGrad = ctx.createLinearGradient(cx - 5, 0, cx + 5, 0);
    chimGrad.addColorStop(0, '#64748B');
    chimGrad.addColorStop(0.35, '#F1F5F9');
    chimGrad.addColorStop(0.7, '#94A3B8');
    chimGrad.addColorStop(1, '#334155');

    ctx.fillStyle = chimGrad;
    ctx.fillRect(cx - 4.5, cy + 62, 9, 17);

    // ── Dynamic Physics Flame Rendering ──────────────────────────────
    if (state.burnerMode !== 'OFF') {
      const isBlue = state.burnerMode === 'ROARING';
      const flutter = Math.sin(now * 0.02) * 1.5 + Math.cos(now * 0.035) * 0.8;
      const flutter2 = Math.sin(now * 0.045) * 1.2;

      if (isBlue) {
        // 🔥 ROARING NON-LUMINOUS BLUE FLAME (High-Heat Laboratory Flame)
        const flameH = 24 + Math.sin(now * 0.025) * 2;

        // Radiant Light Reflection onto Gauze
        const radGlow = ctx.createRadialGradient(cx, cy + 54, 2, cx, cy + 54, 22);
        radGlow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        radGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(cx, cy + 54, 22, 0, Math.PI * 2);
        ctx.fill();

        // 1. Outer Oxidizing Sheath (Faint Violet/Cyan Mantle)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + 62);
        ctx.quadraticCurveTo(cx + flutter * 0.7, cy + 62 - flameH, cx + 6, cy + 62);
        ctx.fill();

        // 2. Striking Bright Inner Strike Cone (Hottest Kinetic Zone)
        const innerH = flameH * 0.65;
        const innerGrad = ctx.createLinearGradient(0, cy + 62, 0, cy + 62 - innerH);
        innerGrad.addColorStop(0, '#0284C7');
        innerGrad.addColorStop(0.4, '#00F2FE');
        innerGrad.addColorStop(1, '#E0F2FE');

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 3.8, cy + 62);
        ctx.quadraticCurveTo(cx + flutter2, cy + 62 - innerH, cx + 3.8, cy + 62);
        ctx.fill();

        // 3. Dark Unburnt Gas Base Zone at Chimney Tip
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.beginPath();
        ctx.moveTo(cx - 3.5, cy + 62);
        ctx.lineTo(cx + 3.5, cy + 62);
        ctx.lineTo(cx, cy + 59);
        ctx.closePath();
        ctx.fill();

      } else {
        // 🔥 GENTLE LUMINOUS YELLOW FLAME (Warming Flame)
        const flameH = 18 + Math.sin(now * 0.015) * 1.5;

        // Outer Golden Glow
        ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy + 62);
        ctx.quadraticCurveTo(cx + flutter, cy + 62 - flameH - 3, cx + 7, cy + 62);
        ctx.fill();

        // Mid Flame (Orange-Yellow)
        const yelGrad = ctx.createLinearGradient(0, cy + 62, 0, cy + 62 - flameH);
        yelGrad.addColorStop(0, '#EA580C');
        yelGrad.addColorStop(0.45, '#F59E0B');
        yelGrad.addColorStop(0.85, '#FDE047');
        yelGrad.addColorStop(1, '#FEF08A');

        ctx.fillStyle = yelGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy + 62);
        ctx.quadraticCurveTo(cx + flutter * 0.8, cy + 62 - flameH, cx + 5, cy + 62);
        ctx.fill();

        // Bright Inner Core
        ctx.fillStyle = '#FFFBEB';
        ctx.beginPath();
        ctx.moveTo(cx - 2.5, cy + 62);
        ctx.quadraticCurveTo(cx + flutter * 0.4, cy + 62 - flameH * 0.55, cx + 2.5, cy + 62);
        ctx.fill();
      }
    }

    // ── 5. Large Borosilicate 250ml Glass Beaker & Generous Water Bath ──
    const bkW = 90;
    const bkH = 56;
    const bkX = cx - bkW / 2;
    const bkY = (cy + 52) - bkH; // cy - 4

    // Beaker Glass Outlines (Double refractive glass lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    // Spout lip left
    ctx.moveTo(bkX - 4, bkY);
    ctx.lineTo(bkX, bkY + 4);
    ctx.lineTo(bkX, bkY + bkH - 4);
    ctx.quadraticCurveTo(bkX, bkY + bkH, bkX + 6, bkY + bkH);
    ctx.lineTo(bkX + bkW - 6, bkY + bkH);
    ctx.quadraticCurveTo(bkX + bkW, bkY + bkH, bkX + bkW, bkY + bkH - 4);
    ctx.lineTo(bkX + bkW, bkY);
    ctx.stroke();

    // Etched White Volume Graduations on Beaker (50, 100, 150, 200, 250 ml)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    [12, 20, 28, 36, 44].forEach(gy => {
      ctx.beginPath();
      ctx.moveTo(bkX + 3, bkY + gy);
      ctx.lineTo(bkX + 10, bkY + gy);
      ctx.stroke();
    });

    // Deep Water Bath Liquid (~80% full)
    const isIce = state.coolingMode === 'ICE';
    const waterGrad = ctx.createLinearGradient(0, bkY + 10, 0, bkY + bkH);
    if (isIce) {
      waterGrad.addColorStop(0, 'rgba(186, 230, 253, 0.48)');
      waterGrad.addColorStop(1, 'rgba(125, 211, 252, 0.35)');
    } else {
      waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
      waterGrad.addColorStop(1, 'rgba(2, 132, 199, 0.22)');
    }

    ctx.fillStyle = waterGrad;
    ctx.fillRect(bkX + 1.5, bkY + 10, bkW - 3, bkH - 12);

    // Water Surface Meniscus
    ctx.strokeStyle = isIce ? 'rgba(224, 242, 254, 0.75)' : 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, bkY + 10, (bkW - 4) / 2, 2.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Dynamic Hot Water Boiling / Convection Bubbles
    if (state.temp > 50) {
      const bubbleCount = Math.min(10, Math.floor((state.temp - 45) / 5));
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let b = 0; b < bubbleCount; b++) {
        const bx = cx - 32 + (b * 7.5) + Math.sin(now * 0.006 + b) * 3;
        const by = (bkY + bkH - 4) - ((now * 0.04 + b * 12) % (bkH - 16));
        ctx.beginPath();
        ctx.arc(bx, by, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Floating Translucent Ice Cubes in Ice Bath Mode
    if (isIce) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.lineWidth = 1;
      [-24, -6, 14].forEach(ix => {
        ctx.beginPath();
        ctx.roundRect(cx + ix, bkY + 12, 10, 9, 1.5);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Glass Vertical Reflection Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(bkX + 4, bkY + 2, 3.5, bkH - 4);

    // ── 6. Pyrex Boiling Tube ($25 \times 150\text{mm}$) Deeply Immersed ──
    const tubeRadius = 12.5;
    const tubeTopY = cy - 70;
    const tubeBotY = cy + 46; // Dipped deep inside the water bath

    // Tube Glass Outline & Flanged Top Lip
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Top flanged lip
    ctx.ellipse(cx, tubeTopY, tubeRadius + 2.5, 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - tubeRadius, tubeTopY);
    ctx.lineTo(cx - tubeRadius, tubeBotY);
    ctx.arc(cx, tubeBotY, tubeRadius, Math.PI, 0, true);
    ctx.lineTo(cx + tubeRadius, tubeTopY);
    ctx.stroke();

    // Solution inside Boiling Tube (Completely immersed below water bath level)
    const model = SALT_MODELS[state.solute];
    const fillHeight = Math.min(42, 16 + state.volume * 1.1);
    const solColor = model ? model.solutionColor : 'rgba(215, 240, 255, 0.3)';

    ctx.fillStyle = solColor;
    ctx.beginPath();
    ctx.moveTo(cx - (tubeRadius - 1.5), tubeBotY + 1.5 - fillHeight);
    ctx.lineTo(cx - (tubeRadius - 1.5), tubeBotY);
    ctx.arc(cx, tubeBotY, tubeRadius - 1.5, Math.PI, 0, true);
    ctx.lineTo(cx + (tubeRadius - 1.5), tubeBotY + 1.5 - fillHeight);
    ctx.fill();

    // Solution Top Meniscus
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, tubeBotY + 1.5 - fillHeight, tubeRadius - 2, 1.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Undissolved Solid Salt Crystals (Faceted 3D Shading at bottom curve)
    if (state.solidParticles.length > 0) {
      const saltColor = model ? model.color : '#FFFFFF';
      state.solidParticles.forEach((p, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? saltColor : 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(cx + p.x * 0.26, tubeBotY + 2 + p.y * 0.08, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Floating Precipitating Crystals (Nucleation during crystallization)
    if (state.status === 'CRYSTALLIZING' || state.crystalParticles.length > 0) {
      const saltColor = model ? model.color : '#FFFFFF';
      state.crystalParticles.forEach((cp, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#FFF' : saltColor;
        ctx.beginPath();
        ctx.arc(cx + cp.x * 0.28, tubeBotY - fillHeight + 6 + cp.y * 0.45, cp.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Boiling Tube Glass Specular Reflection Streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(cx - tubeRadius + 2.5, tubeTopY + 2, 2.5, (tubeBotY - tubeTopY) + 6);

    // ── 7. Precision Laboratory Thermometer & Stirrer ──────────────────
    const stirOffset = state.isStirring ? Math.sin(now * 0.02) * 3.5 : 0;
    const thX = cx + stirOffset;
    const thTopY = cy - 86;
    const thBotY = cy + 44; // Bulb rests deep in the immersed solute solution

    // Thermometer Yellow Contrast Backing Stripe (Authentic Lab Thermometer)
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(thX - 1.2, thTopY, 2.4, thBotY - thTopY);

    // Degree Ticks on Glass Stem
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.lineWidth = 0.8;
    for (let ty = thTopY + 6; ty < thBotY - 6; ty += 5) {
      ctx.beginPath();
      ctx.moveTo(thX + 1.2, ty);
      ctx.lineTo(thX + 2.5, ty);
      ctx.stroke();
    }

    // Thermometer Outer Glass Stem
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(thX - 2, thTopY, 4, (thBotY - thTopY), 1.5);
    ctx.stroke();

    // Red Mercury/Alcohol Capillary Thread
    const mercuryHeight = Math.min((thBotY - thTopY) - 10, Math.max(3, (state.temp / 100) * ((thBotY - thTopY) - 12)));
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(thX - 0.7, thBotY - 2 - mercuryHeight, 1.4, mercuryHeight);

    // Thermometer Mercury Bulb at Bottom
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(thX, thBotY + 1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Specular Shine on Bulb
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(thX - 1, thBotY - 0.5, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Magnified Precision Thermometer Stem View ────────────────────────
  function drawMagnifiedThermometer() {
    if (!magCanvas || !magCtx) return;
    const w = magCanvas.getBoundingClientRect().width;
    const h = magCanvas.getBoundingClientRect().height;

    magCtx.clearRect(0, 0, w, h);

    const cx = w * 0.38;
    const cy = h * 0.50; // Sightline position at vertical center
    const zoomSpan = 5.0; // 5.0°C visible span across the height
    const pxPerDeg = (h * 0.82) / zoomSpan;

    // 1. Backing Glass Stem Cylinder with cylindrical lighting
    const tubeWidth = 28;
    const tubeGrad = magCtx.createLinearGradient(cx - tubeWidth / 2, 0, cx + tubeWidth / 2, 0);
    tubeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    tubeGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.05)');
    tubeGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    tubeGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)');
    tubeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.14)');

    magCtx.fillStyle = tubeGrad;
    magCtx.fillRect(cx - tubeWidth / 2, 0, tubeWidth, h);

    // Glass Edge Outlines
    magCtx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    magCtx.lineWidth = 1.5;
    magCtx.beginPath();
    magCtx.moveTo(cx - tubeWidth / 2, 0);
    magCtx.lineTo(cx - tubeWidth / 2, h);
    magCtx.moveTo(cx + tubeWidth / 2, 0);
    magCtx.lineTo(cx + tubeWidth / 2, h);
    magCtx.stroke();

    // 2. Capillary Channel (Bore)
    const boreWidth = 6;
    magCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    magCtx.fillRect(cx - boreWidth / 2, 0, boreWidth, h);

    // 3. Calibrated Graduations (Ticks) & Digits
    const minVisibleT = state.temp - (zoomSpan * 0.65);
    const maxVisibleT = state.temp + (zoomSpan * 0.65);
    const startTick = Math.floor(minVisibleT * 10) / 10;
    const endTick = Math.ceil(maxVisibleT * 10) / 10;

    magCtx.textAlign = 'left';
    magCtx.textBaseline = 'middle';

    for (let t = startTick; t <= endTick + 0.05; t = parseFloat((t + 0.1).toFixed(1))) {
      const y = cy - (t - state.temp) * pxPerDeg;
      if (y < 4 || y > h - 4) continue;

      const isWholeDegree = Math.abs(t - Math.round(t)) < 0.02;
      const isHalfDegree = !isWholeDegree && Math.abs(Math.round(t * 10) % 5) === 0;

      if (isWholeDegree) {
        // Major 1.0°C graduation mark
        magCtx.strokeStyle = '#38BDF8';
        magCtx.lineWidth = 2;
        magCtx.beginPath();
        magCtx.moveTo(cx + tubeWidth / 2, y);
        magCtx.lineTo(cx + tubeWidth / 2 + 14, y);
        magCtx.stroke();

        // Numerical temperature label
        magCtx.font = "bold 11px 'JetBrains Mono', monospace";
        magCtx.fillStyle = '#FFFFFF';
        magCtx.fillText(`${Math.round(t)}°`, cx + tubeWidth / 2 + 17, y);
      } else if (isHalfDegree) {
        // Medium 0.5°C graduation mark
        magCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        magCtx.lineWidth = 1.5;
        magCtx.beginPath();
        magCtx.moveTo(cx + tubeWidth / 2, y);
        magCtx.lineTo(cx + tubeWidth / 2 + 9, y);
        magCtx.stroke();

        // Dot indicator for 0.5°
        magCtx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        magCtx.beginPath();
        magCtx.arc(cx + tubeWidth / 2 + 13, y, 1.5, 0, Math.PI * 2);
        magCtx.fill();
      } else {
        // Minor 0.1°C graduation mark
        magCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        magCtx.lineWidth = 1;
        magCtx.beginPath();
        magCtx.moveTo(cx + tubeWidth / 2, y);
        magCtx.lineTo(cx + tubeWidth / 2 + 5, y);
        magCtx.stroke();
      }
    }

    // 4. Liquid Mercury/Alcohol Column
    const fluidGrad = magCtx.createLinearGradient(cx - boreWidth / 2, 0, cx + boreWidth / 2, 0);
    fluidGrad.addColorStop(0, '#991B1B');
    fluidGrad.addColorStop(0.3, '#EF4444');
    fluidGrad.addColorStop(0.7, '#F87171');
    fluidGrad.addColorStop(1, '#DC2626');

    magCtx.fillStyle = fluidGrad;
    magCtx.fillRect(cx - boreWidth / 2, cy, boreWidth, h - cy);

    // 5. Convex Meniscus Cap Dome
    magCtx.beginPath();
    magCtx.arc(cx, cy, boreWidth / 2, Math.PI, 0, false);
    magCtx.fillStyle = '#F87171';
    magCtx.fill();

    // 6. Realistic Glass Reflection Streak
    magCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    magCtx.fillRect(cx - tubeWidth / 2 + 4, 0, 2.5, h);

    // 7. Eye-Level Reading Alignment Pointer (Left side arrow)
    magCtx.fillStyle = '#38BDF8';
    magCtx.beginPath();
    magCtx.moveTo(cx - tubeWidth / 2 - 9, cy);
    magCtx.lineTo(cx - tubeWidth / 2 - 3, cy - 4);
    magCtx.lineTo(cx - tubeWidth / 2 - 3, cy + 4);
    magCtx.closePath();
    magCtx.fill();
  }

  // ── KNEC Graph Canvas & Analysis Engine ─────────────────────────────
  function setupGraphCrosshairEvents() {
    if (!graphCanvas) return;

    graphCanvas.addEventListener('mousemove', (e) => {
      const rect = graphCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const padL = 60, padR = 30, padT = 30, padB = 50;
      const gw = rect.width - padL - padR;
      const gh = rect.height - padT - padB;

      if (x >= padL && x <= padL + gw && y >= padT && y <= padT + gh) {
        const temp = ((x - padL) / gw) * 100.0;
        const sol = ((padT + gh - y) / gh) * 160.0;
        state.crosshairPos = { x, y, temp, sol };

        const readoutEl = document.getElementById('solCrosshairReadout');
        if (readoutEl) {
          readoutEl.style.display = 'block';
          readoutEl.textContent = `T = ${temp.toFixed(1)} °C | S = ${sol.toFixed(1)} g/100g`;
        }
      } else {
        state.crosshairPos = null;
        const readoutEl = document.getElementById('solCrosshairReadout');
        if (readoutEl) readoutEl.style.display = 'none';
      }
      renderGraph();
    });

    graphCanvas.addEventListener('mouseleave', () => {
      state.crosshairPos = null;
      const readoutEl = document.getElementById('solCrosshairReadout');
      if (readoutEl) readoutEl.style.display = 'none';
      renderGraph();
    });
  }

  function setGraphTool(tool) {
    state.graphTool = tool;
    ['curve', 'crosshair', 'zones'].forEach(t => {
      const btn = document.getElementById(`btnGraphTool-${t}`);
      if (btn) btn.classList.toggle('active', t === tool);
    });
    renderGraph();
  }

  function renderGraph() {
    if (!graphCanvas || !gCtx) return;
    const w = graphCanvas.getBoundingClientRect().width;
    const h = graphCanvas.getBoundingClientRect().height;

    gCtx.clearRect(0, 0, w, h);

    const padL = 60, padR = 30, padT = 30, padB = 50;
    const gw = w - padL - padR;
    const gh = h - padT - padB;

    // 1. Saturation Regions (if tool active)
    const model = SALT_MODELS[state.solute];
    if (state.graphTool === 'zones' && model) {
      // Unsaturated region fill (below curve)
      gCtx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      gCtx.beginPath();
      gCtx.moveTo(padL, padT + gh);
      for (let t = 0; t <= 100; t += 2) {
        const s = model.solubilityAtTemp(t);
        const px = padL + (t / 100) * gw;
        const py = padT + gh - Math.min(gh, (s / 160) * gh);
        gCtx.lineTo(px, py);
      }
      gCtx.lineTo(padL + gw, padT + gh);
      gCtx.closePath();
      gCtx.fill();

      // Supersaturated region fill (above curve)
      gCtx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      gCtx.beginPath();
      gCtx.moveTo(padL, padT);
      for (let t = 0; t <= 100; t += 2) {
        const s = model.solubilityAtTemp(t);
        const px = padL + (t / 100) * gw;
        const py = padT + gh - Math.min(gh, (s / 160) * gh);
        gCtx.lineTo(px, py);
      }
      gCtx.lineTo(padL + gw, padT);
      gCtx.closePath();
      gCtx.fill();
    }

    // 2. KNEC Graph Millimeter Grid
    gCtx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
    gCtx.lineWidth = 1;
    for (let x = 0; x <= 100; x += 5) {
      const px = padL + (x / 100) * gw;
      gCtx.beginPath();
      gCtx.moveTo(px, padT);
      gCtx.lineTo(px, padT + gh);
      gCtx.stroke();
    }
    for (let y = 0; y <= 160; y += 10) {
      const py = padT + gh - (y / 160) * gh;
      gCtx.beginPath();
      gCtx.moveTo(padL, py);
      gCtx.lineTo(padL + gw, py);
      gCtx.stroke();
    }

    // Major 10-unit grid lines
    gCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    for (let x = 0; x <= 100; x += 20) {
      const px = padL + (x / 100) * gw;
      gCtx.beginPath();
      gCtx.moveTo(px, padT);
      gCtx.lineTo(px, padT + gh);
      gCtx.stroke();
    }
    for (let y = 0; y <= 160; y += 40) {
      const py = padT + gh - (y / 160) * gh;
      gCtx.beginPath();
      gCtx.moveTo(padL, py);
      gCtx.lineTo(padL + gw, py);
      gCtx.stroke();
    }

    // 3. Axes
    gCtx.strokeStyle = '#94A3B8';
    gCtx.lineWidth = 2;
    gCtx.beginPath();
    gCtx.moveTo(padL, padT);
    gCtx.lineTo(padL, padT + gh);
    gCtx.lineTo(padL + gw, padT + gh);
    gCtx.stroke();

    // 4. Tick Labels
    gCtx.fillStyle = '#94A3B8';
    gCtx.font = '11px "JetBrains Mono", monospace';
    gCtx.textAlign = 'center';
    for (let x = 0; x <= 100; x += 20) {
      const px = padL + (x / 100) * gw;
      gCtx.fillText(x.toString(), px, padT + gh + 18);
    }
    gCtx.fillText('Temperature (°C) [KNEC X-Axis]', padL + gw / 2, padT + gh + 38);

    gCtx.textAlign = 'right';
    for (let y = 0; y <= 160; y += 40) {
      const py = padT + gh - (y / 160) * gh;
      gCtx.fillText(y.toString(), padL - 8, py + 4);
    }

    gCtx.save();
    gCtx.translate(16, padT + gh / 2);
    gCtx.rotate(-Math.PI / 2);
    gCtx.textAlign = 'center';
    gCtx.fillText('Solubility (g / 100g H₂O) [KNEC Y-Axis]', 0, 0);
    gCtx.restore();

    // 5. Theoretical Curve (Dashed)
    if (model) {
      gCtx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      gCtx.lineWidth = 2;
      gCtx.setLineDash([4, 4]);
      gCtx.beginPath();
      for (let t = 0; t <= 100; t += 2) {
        const s = model.solubilityAtTemp(t);
        const px = padL + (t / 100) * gw;
        const py = padT + gh - (s / 160) * gh;
        if (t === 0) gCtx.moveTo(px, py);
        else gCtx.lineTo(px, py);
      }
      gCtx.stroke();
      gCtx.setLineDash([]);
    }

    // 6. Student Plotted 'x' Markers & Best Fit Curve
    if (state.trials.length > 0) {
      gCtx.strokeStyle = '#10B981';
      gCtx.lineWidth = 2;
      state.trials.forEach(tr => {
        const sVal = (state.isExamMode && tr.candidateSolubility !== '' && !isNaN(tr.candidateSolubility))
          ? parseFloat(tr.candidateSolubility)
          : tr.solubility;

        if (isNaN(sVal)) return;

        const px = padL + (tr.temp / 100) * gw;
        const py = padT + gh - (sVal / 160) * gh;

        // Draw KNEC 'x' mark
        gCtx.beginPath();
        gCtx.moveTo(px - 5, py - 5);
        gCtx.lineTo(px + 5, py + 5);
        gCtx.moveTo(px + 5, py - 5);
        gCtx.lineTo(px - 5, py + 5);
        gCtx.stroke();
      });

      // Best Fit Smooth Curve
      const validTrials = state.trials.filter(tr => {
        const sVal = (state.isExamMode && tr.candidateSolubility !== '' && !isNaN(tr.candidateSolubility))
          ? parseFloat(tr.candidateSolubility)
          : tr.solubility;
        return !isNaN(sVal);
      });

      if (validTrials.length >= 2) {
        gCtx.strokeStyle = '#34D399';
        gCtx.lineWidth = 2.5;
        gCtx.beginPath();
        const sorted = [...validTrials].sort((a, b) => a.temp - b.temp);
        for (let i = 0; i < sorted.length; i++) {
          const sVal = (state.isExamMode && sorted[i].candidateSolubility !== '' && !isNaN(sorted[i].candidateSolubility))
            ? parseFloat(sorted[i].candidateSolubility)
            : sorted[i].solubility;

          const px = padL + (sorted[i].temp / 100) * gw;
          const py = padT + gh - (sVal / 160) * gh;
          if (i === 0) gCtx.moveTo(px, py);
          else {
            const prevSVal = (state.isExamMode && sorted[i - 1].candidateSolubility !== '' && !isNaN(sorted[i - 1].candidateSolubility))
              ? parseFloat(sorted[i - 1].candidateSolubility)
              : sorted[i - 1].solubility;

            const prevPx = padL + (sorted[i - 1].temp / 100) * gw;
            const prevPy = padT + gh - (prevSVal / 160) * gh;
            const cpX = (prevPx + px) / 2;
            gCtx.bezierCurveTo(cpX, prevPy, cpX, py, px, py);
          }
        }
        gCtx.stroke();
      }
    }

    // 7. Interactive Crosshair Probe Overlay
    if (state.crosshairPos && (state.graphTool === 'crosshair' || state.graphTool === 'curve')) {
      const { x, y } = state.crosshairPos;
      gCtx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      gCtx.lineWidth = 1;
      gCtx.setLineDash([3, 3]);

      // Vertical line to x-axis
      gCtx.beginPath();
      gCtx.moveTo(x, padT);
      gCtx.lineTo(x, padT + gh);
      gCtx.stroke();

      // Horizontal line to y-axis
      gCtx.beginPath();
      gCtx.moveTo(padL, y);
      gCtx.lineTo(padL + gw, y);
      gCtx.stroke();

      gCtx.setLineDash([]);

      // Point circle indicator
      gCtx.fillStyle = '#F59E0B';
      gCtx.beginPath();
      gCtx.arc(x, y, 4, 0, Math.PI * 2);
      gCtx.fill();
    }
  }

  // ── Microscope Crystal Habit Modal Viewer ──────────────────────────
  function openMicroscopeModal() {
    const modal = document.getElementById('solMicroscopeModal');
    if (!modal) return;
    modal.style.display = 'flex';

    const model = SALT_MODELS[state.solute];
    const nameEl = document.getElementById('microSaltName');
    if (nameEl) nameEl.textContent = model.name;

    const habitEl = document.getElementById('microHabitTitle');
    if (habitEl) habitEl.textContent = model.crystalHabit;

    const descEl = document.getElementById('microHabitDesc');
    if (descEl) descEl.textContent = model.crystalDesc;

    drawMicroscopeCrystals();
  }

  function closeMicroscopeModal() {
    const modal = document.getElementById('solMicroscopeModal');
    if (modal) modal.style.display = 'none';
  }

  function drawMicroscopeCrystals() {
    if (!microscopeCanvas || !mCtx) return;
    const w = microscopeCanvas.width = 400;
    const h = microscopeCanvas.height = 300;

    mCtx.clearRect(0, 0, w, h);

    // Dark circular microscope eyepiece field
    mCtx.fillStyle = '#0F172A';
    mCtx.fillRect(0, 0, w, h);

    mCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    mCtx.lineWidth = 4;
    mCtx.beginPath();
    mCtx.arc(w / 2, h / 2, 130, 0, Math.PI * 2);
    mCtx.stroke();

    const model = SALT_MODELS[state.solute];
    if (model && model.drawMicroCrystal) {
      // Cluster of crystals in center
      const positions = [
        { x: w / 2, y: h / 2, s: 24 },
        { x: w / 2 - 40, y: h / 2 - 25, s: 18 },
        { x: w / 2 + 35, y: h / 2 - 35, s: 20 },
        { x: w / 2 - 25, y: h / 2 + 35, s: 22 },
        { x: w / 2 + 45, y: h / 2 + 25, s: 16 }
      ];

      positions.forEach(p => {
        model.drawMicroCrystal(mCtx, p.x, p.y, p.s);
      });
    }
  }

  // ── Post-Practical KNEC Calculations Suite ──────────────────────────
  function generatePostLabQuestions() {
    const model = SALT_MODELS[state.solute];
    if (!model) return;

    const qContainer = document.getElementById('solQuestionsList');
    if (!qContainer) return;

    const s50 = model.solubilityAtTemp(50).toFixed(1);
    const s75 = model.solubilityAtTemp(75).toFixed(1);
    const s25 = model.solubilityAtTemp(25).toFixed(1);
    const yield100 = (model.solubilityAtTemp(75) - model.solubilityAtTemp(25)).toFixed(1);
    const yield50 = ((model.solubilityAtTemp(75) - model.solubilityAtTemp(25)) * 0.5).toFixed(1);

    qContainer.innerHTML = `
      <!-- Question 1 -->
      <div class="sol-question-card" id="qCard1">
        <div class="sol-question-header">
          <div class="sol-question-title">1. Solubility from Curve at 50.0 °C</div>
          <span class="sol-question-marks">1.0 Mark</span>
        </div>
        <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.45;">
          Using your plotted solubility curve, determine the solubility of <b>${model.name}</b> at <b>50.0 °C</b> in g / 100g H₂O.
        </div>
        <div class="sol-input-group">
          <label style="font-size:0.82rem;font-weight:700;">Solubility at 50°C:</label>
          <input type="number" step="0.1" id="ansQ1" class="sol-calc-input" placeholder="e.g. ${s50}">
          <span style="font-size:0.82rem;color:var(--text-muted);">g / 100g H₂O</span>
        </div>
        <div id="feedbackQ1" class="sol-calc-feedback"></div>
      </div>

      <!-- Question 2 -->
      <div class="sol-question-card" id="qCard2">
        <div class="sol-question-header">
          <div class="sol-question-title">2. Mass of Crystals Deposited on Cooling</div>
          <span class="sol-question-marks">2.0 Marks</span>
        </div>
        <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.45;">
          A saturated solution containing <b>50.0 g of water</b> at <b>75.0 °C</b> is cooled to <b>25.0 °C</b>. Calculate the mass of ${model.formula} crystals that separate out.
        </div>
        <div class="sol-input-group">
          <label style="font-size:0.82rem;font-weight:700;">Mass of crystals deposited:</label>
          <input type="number" step="0.1" id="ansQ2" class="sol-calc-input" placeholder="e.g. ${yield50}">
          <span style="font-size:0.82rem;color:var(--text-muted);">grams</span>
        </div>
        <div id="feedbackQ2" class="sol-calc-feedback"></div>
      </div>

      <!-- Question 3 -->
      <div class="sol-question-card" id="qCard3">
        <div class="sol-question-header">
          <div class="sol-question-title">3. Enthalpy & Dissolution Behavior</div>
          <span class="sol-question-marks">1.0 Mark</span>
        </div>
        <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.45;">
          State whether the dissolution of ${model.formula} is <b>endothermic</b> or <b>exothermic</b> based on the slope of your solubility curve.
        </div>
        <div class="sol-input-group">
          <select id="ansQ3" class="sol-calc-input" style="width:180px;">
            <option value="">Select process...</option>
            <option value="endothermic">Endothermic (ΔH > 0)</option>
            <option value="exothermic">Exothermic (ΔH < 0)</option>
          </select>
        </div>
        <div id="feedbackQ3" class="sol-calc-feedback"></div>
      </div>
    `;
  }

  function checkCalculations() {
    const model = SALT_MODELS[state.solute];
    if (!model) return;

    let score = 0.0;
    const s50 = model.solubilityAtTemp(50);
    const yield50 = (model.solubilityAtTemp(75) - model.solubilityAtTemp(25)) * 0.5;

    // Check Q1
    const val1 = parseFloat(document.getElementById('ansQ1')?.value);
    const fb1 = document.getElementById('feedbackQ1');
    if (!isNaN(val1) && Math.abs(val1 - s50) <= 2.5) {
      score += 1.0;
      if (fb1) {
        fb1.className = 'sol-calc-feedback correct';
        fb1.innerHTML = `✓ <b>Correct (1.0/1.0 Mark)</b>: Solubility at 50°C is ${s50.toFixed(1)} g/100g H₂O. Your reading of ${val1.toFixed(1)} is within KNEC tolerance (±2.5g).`;
      }
    } else {
      if (fb1) {
        fb1.className = 'sol-calc-feedback incorrect';
        fb1.innerHTML = `✕ <b>Incorrect (0.0/1.0 Mark)</b>: From the curve at 50°C, solubility is ${s50.toFixed(1)} g/100g H₂O. Verify your vertical intercept.`;
      }
    }

    // Check Q2
    const val2 = parseFloat(document.getElementById('ansQ2')?.value);
    const fb2 = document.getElementById('feedbackQ2');
    if (!isNaN(val2) && Math.abs(val2 - yield50) <= 2.0) {
      score += 2.0;
      if (fb2) {
        fb2.className = 'sol-calc-feedback correct';
        fb2.innerHTML = `✓ <b>Correct (2.0/2.0 Marks)</b>:<br>Mass deposited in 100g water = S(75°) - S(25°) = ${model.solubilityAtTemp(75).toFixed(1)} - ${model.solubilityAtTemp(25).toFixed(1)} = ${(model.solubilityAtTemp(75) - model.solubilityAtTemp(25)).toFixed(1)} g.<br>In 50g water = ${yield50.toFixed(1)} g crystals.`;
      }
    } else {
      if (fb2) {
        fb2.className = 'sol-calc-feedback incorrect';
        fb2.innerHTML = `✕ <b>Incorrect (0.0/2.0 Marks)</b>:<br>Working: In 100g water, crystal yield = S(75°) - S(25°) = ${(model.solubilityAtTemp(75) - model.solubilityAtTemp(25)).toFixed(1)} g.<br>For 50g water: Yield = 0.5 × ${(model.solubilityAtTemp(75) - model.solubilityAtTemp(25)).toFixed(1)} = ${yield50.toFixed(1)} g.`;
      }
    }

    // Check Q3
    const val3 = document.getElementById('ansQ3')?.value;
    const fb3 = document.getElementById('feedbackQ3');
    if (val3 === 'endothermic') {
      score += 1.0;
      if (fb3) {
        fb3.className = 'sol-calc-feedback correct';
        fb3.innerHTML = `✓ <b>Correct (1.0/1.0 Mark)</b>: Dissolution is <b>endothermic</b> because solubility increases with rising temperature (positive slope).`;
      }
    } else {
      if (fb3) {
        fb3.className = 'sol-calc-feedback incorrect';
        fb3.innerHTML = `✕ <b>Incorrect (0.0/1.0 Mark)</b>: Dissolution is <b>endothermic</b> (solubility increases with temperature).`;
      }
    }

    const scoreDisplay = document.getElementById('solCalcTotalScore');
    if (scoreDisplay) scoreDisplay.textContent = `${score.toFixed(1)} / 4.0 Marks`;
    playSound('chime');
  }

  // ── Audio Synthesis & Status Helpers ────────────────────────────────
  function playSound(type) {
    if (!state.soundEnabled) return;
    if (window.VLKAudio && typeof window.VLKAudio.play === 'function') {
      window.VLKAudio.play(type);
    }
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) btn.textContent = state.soundEnabled ? '🔊 Sound ON' : '🔇 Muted';
  }

  function updateStatusBanner(text, type) {
    const descEl = document.getElementById('scenarioDescText');
    if (descEl) {
      descEl.innerHTML = text;
    }
    const el = document.getElementById('solStatusBanner');
    if (el) {
      el.className = 'sol-status-banner sol-status-' + type;
      el.innerHTML = `<span>${text}</span>`;
    }
  }

  // ── Session Submission & Saving ─────────────────────────────────────
  async function submitSession() {
    if (state.trials.length === 0) {
      alert('Please perform at least one trial measurement before saving your practical session.');
      return;
    }

    const lastTrial = state.trials[state.trials.length - 1];
    const avgDiff = state.trials.reduce((acc, t) => acc + t.diff, 0) / state.trials.length;
    const accuracyScore = avgDiff <= 2.0 ? 2.0 : avgDiff <= 4.0 ? 1.0 : 0.0;
    const graphScore = state.trials.length >= 4 ? 3.0 : (state.trials.length * 0.75);

    try {
      const res = await apiRequest('POST', '/solubility', {
        assignment_id: state.assignmentId || undefined,
        solute_key: state.solute,
        solute_name: SALT_MODELS[state.solute].name,
        experiment_title: `Solubility Determination of ${SALT_MODELS[state.solute].name}`,
        solute_mass: lastTrial.mass,
        solvent_volume: lastTrial.volume,
        crystallization_temp: lastTrial.temp,
        accuracy_score: accuracyScore,
        graph_score: graphScore,
        trials_data: state.trials,
        mode: state.isEmbedded ? 'exam' : 'selfPaced'
      });

      const totalScore = res.analysis?.totalScore || (accuracyScore + graphScore);

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'PRACTICAL_EXAM_SUBMITTED',
          question: 'q1',
          score: Math.min(15.0, totalScore * 3.0)
        }, '*');
      }

      alert(`🎉 Solubility practical session saved successfully! (KNEC Score: ${totalScore.toFixed(1)} / 5.0)`);
    } catch (err) {
      alert('Saved locally in offline sync queue. Will synchronize when online.');
    }
  }

  // ── Examination Mode Controller & KNEC Scoring ─────────────────────
  function setStudyMode(mode) {
    state.isExamMode = (mode === 'exam');

    const btnPrac = document.getElementById('btnModePractice');
    const btnExam = document.getElementById('btnModeExam');
    if (btnPrac && btnExam) {
      btnPrac.className = `theme-btn-chip ${!state.isExamMode ? 'active' : ''}`;
      btnExam.className = `theme-btn-chip ${state.isExamMode ? 'active' : ''}`;
    }

    const proctorBanner = document.getElementById('solExamProctorBanner');
    const scenarioStrip = document.getElementById('solScenarioStrip');
    const btnToggleTemp = document.getElementById('btnToggleDigitalTemp');
    const soluteSel = document.getElementById('soluteSelect');
    const massSlider = document.getElementById('solMassSlider');
    const volSlider = document.getElementById('solVolSlider');
    const btnZones = document.getElementById('btnGraphTool-zones');

    if (state.isExamMode) {
      if (proctorBanner) proctorBanner.style.display = 'flex';
      if (scenarioStrip) scenarioStrip.style.display = 'none';

      // Lock to Solid W (KCSE standard unknown salt)
      applyScenario('KCSE_2018');

      // Lock digital temperature
      state.showDigitalTemp = false;
      if (btnToggleTemp) {
        btnToggleTemp.disabled = true;
        btnToggleTemp.textContent = '🔒 Digital: LOCKED';
        btnToggleTemp.style.opacity = '0.5';
        btnToggleTemp.style.cursor = 'not-allowed';
      }

      // Disable parameter sliders and selectors
      if (soluteSel) soluteSel.disabled = true;
      if (massSlider) massSlider.disabled = true;
      if (volSlider) volSlider.disabled = true;
      if (btnZones) btnZones.style.display = 'none';

      // Start 20-minute countdown timer
      state.examSeconds = 20 * 60;
      startExamTimer();

      // Lock AI tutor if active
      if (window.AITutor && typeof window.AITutor.setLocked === 'function') {
        window.AITutor.setLocked(true);
      }

      updateStatusBanner('📝 KNEC Exam Mode: Solid W (5.00g). Read temp from magnified stem, plot graph, & submit booklet.', 'idle');
    } else {
      if (proctorBanner) proctorBanner.style.display = 'none';
      if (scenarioStrip) scenarioStrip.style.display = 'flex';

      // Unlock digital temperature
      state.showDigitalTemp = true;
      if (btnToggleTemp) {
        btnToggleTemp.disabled = false;
        btnToggleTemp.textContent = '👁️ Digital: ON';
        btnToggleTemp.style.opacity = '1';
        btnToggleTemp.style.cursor = 'pointer';
      }

      // Enable parameter sliders and selectors
      if (soluteSel) soluteSel.disabled = false;
      if (massSlider) massSlider.disabled = false;
      if (volSlider) volSlider.disabled = false;
      if (btnZones) btnZones.style.display = 'inline-block';

      // Clear exam countdown timer
      if (state.examTimerInterval) {
        clearInterval(state.examTimerInterval);
        state.examTimerInterval = null;
      }

      // Unlock AI tutor
      if (window.AITutor && typeof window.AITutor.setLocked === 'function') {
        window.AITutor.setLocked(false);
      }

      updateStatusBanner('Ready. Select solute mass & water volume, heat to dissolve, then cool to crystallize.', 'idle');
    }

    renderTable();
    renderGraph();
  }

  function startExamTimer() {
    if (state.examTimerInterval) clearInterval(state.examTimerInterval);
    updateExamTimerBadge();

    state.examTimerInterval = setInterval(() => {
      state.examSeconds--;
      updateExamTimerBadge();

      if (state.examSeconds <= 0) {
        clearInterval(state.examTimerInterval);
        state.examTimerInterval = null;
        alert('⏰ Time is up! Submitting your official KNEC Solubility Examination Booklet...');
        submitExamBooklet();
      }
    }, 1000);
  }

  function updateExamTimerBadge() {
    const badge = document.getElementById('solExamTimerBadge');
    if (!badge) return;
    const m = Math.floor(state.examSeconds / 60);
    const s = state.examSeconds % 60;
    badge.textContent = `⏱️ ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    if (state.examSeconds <= 300) {
      badge.style.color = '#EF4444';
      badge.style.borderColor = '#EF4444';
    }
  }

  async function submitExamBooklet() {
    if (state.trials.length < 3) {
      if (!confirm(`⚠️ You have only recorded ${state.trials.length} trial(s). KNEC requires at least 4 readings to draw a valid solubility curve. Submit examination anyway?`)) {
        return;
      }
    }

    // 1. Table Marks (5.0 Marks Total)
    const completenessScore = state.trials.length >= 4 ? 1.0 : (state.trials.length >= 3 ? 0.5 : 0.0);
    const decimalScore = 1.0;
    
    // Evaluation of student's calculated solubility values (1.0m)
    let correctSolCount = 0;
    state.trials.forEach(tr => {
      const trueSol = (tr.mass / tr.volume) * 100;
      const candSol = parseFloat(tr.candidateSolubility);
      if (!isNaN(candSol) && Math.abs(candSol - trueSol) <= 0.6) {
        correctSolCount++;
      }
    });
    const solCalcScore = state.trials.length > 0 ? parseFloat(((correctSolCount / state.trials.length) * 1.0).toFixed(1)) : 0.0;

    let avgDiff = 99.0;
    if (state.trials.length > 0) {
      const sumDiff = state.trials.reduce((acc, t) => acc + (t.diff || 0), 0);
      avgDiff = sumDiff / state.trials.length;
    }
    const accuracyScore = avgDiff <= 2.0 ? 1.0 : (avgDiff <= 3.5 ? 0.8 : (avgDiff <= 5.0 ? 0.5 : 0.2));
    
    let isDecreasing = true;
    for (let i = 1; i < state.trials.length; i++) {
      if (state.trials[i].temp > state.trials[i - 1].temp + 1.5) isDecreasing = false;
    }
    const trendScore = (state.trials.length >= 3 && isDecreasing) ? 1.0 : 0.5;
    const tableTotal = completenessScore + decimalScore + solCalcScore + accuracyScore + trendScore;

    // 2. Graph Marks (5.0 Marks Total)
    const graphPointsScore = state.trials.length >= 4 ? 2.0 : (state.trials.length >= 2 ? 1.0 : 0.0);
    const graphScaleScore = 1.0;
    const graphCurveScore = 1.0;
    const graphLabelScore = 1.0;
    const graphTotal = graphPointsScore + graphScaleScore + graphCurveScore + graphLabelScore;

    // 3. Calculations Marks (5.0 Marks Total)
    let calcTotal = 0.0;
    const q1Input = document.getElementById('calcInput-q1');
    const q2Input = document.getElementById('calcInput-q2');
    const q3Sel = document.getElementById('calcInput-q3');

    const expSol50 = 85.5;
    if (q1Input && q1Input.value) {
      const userVal = parseFloat(q1Input.value);
      if (Math.abs(userVal - expSol50) <= 6.0) calcTotal += 2.0;
      else if (Math.abs(userVal - expSol50) <= 12.0) calcTotal += 1.0;
    }

    const expCrystMass = 25.0;
    if (q2Input && q2Input.value) {
      const userVal = parseFloat(q2Input.value);
      if (Math.abs(userVal - expCrystMass) <= 4.0) calcTotal += 2.0;
      else if (Math.abs(userVal - expCrystMass) <= 8.0) calcTotal += 1.0;
    }

    if (q3Sel && q3Sel.value === 'ENDOTHERMIC') {
      calcTotal += 1.0;
    }

    const grandTotal = Math.min(15.0, tableTotal + graphTotal + calcTotal);

    let grade = 'Grade E';
    if (grandTotal >= 13.0) grade = 'Grade A (Distinction)';
    else if (grandTotal >= 11.5) grade = 'Grade A- (Excellent)';
    else if (grandTotal >= 10.0) grade = 'Grade B+ (Very Good)';
    else if (grandTotal >= 8.5) grade = 'Grade B (Good)';
    else if (grandTotal >= 7.0) grade = 'Grade C+ (Satisfactory)';
    else if (grandTotal >= 5.5) grade = 'Grade C (Average)';
    else if (grandTotal >= 4.0) grade = 'Grade D (Pass)';

    const gradeEl = document.getElementById('solExamFinalGrade');
    const scoreEl = document.getElementById('solExamFinalScore');
    const tbody = document.getElementById('solExamBreakdownTableBody');
    const notesEl = document.getElementById('solExamFeedbackNotes');

    if (gradeEl) gradeEl.textContent = grade;
    if (scoreEl) scoreEl.textContent = `${grandTotal.toFixed(1)} / 15.0 Marks`;

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td><b>Table of Results:</b> Completeness (1m), Decimals (1m), Trend (1m)</td>
          <td style="text-align:center;">3.0</td>
          <td style="text-align:center;font-weight:800;color:#10B981;">${(completenessScore + decimalScore + trendScore).toFixed(1)}</td>
        </tr>
        <tr>
          <td><b>Solubility Calculations:</b> Calculated: (Mass / Volume) × 100</td>
          <td style="text-align:center;">1.0</td>
          <td style="text-align:center;font-weight:800;color:#10B981;">${solCalcScore.toFixed(1)}</td>
        </tr>
        <tr>
          <td><b>Temperature Accuracy:</b> Comparison to standard supervisor values (±2.0°C)</td>
          <td style="text-align:center;">1.0</td>
          <td style="text-align:center;font-weight:800;color:#10B981;">${accuracyScore.toFixed(1)}</td>
        </tr>
        <tr>
          <td><b>Graph Construction:</b> Scale (1m), Axes (1m), Points (2m), Smooth Curve (1m)</td>
          <td style="text-align:center;">5.0</td>
          <td style="text-align:center;font-weight:800;color:#10B981;">${graphTotal.toFixed(1)}</td>
        </tr>
        <tr>
          <td><b>Calculations & Questions:</b> Solubility interpolation, crystal mass, thermo</td>
          <td style="text-align:center;">5.0</td>
          <td style="text-align:center;font-weight:800;color:#10B981;">${calcTotal.toFixed(1)}</td>
        </tr>
        <tr style="border-top:2px solid var(--card-border);font-weight:800;">
          <td>Total Question 1 Score</td>
          <td style="text-align:center;">15.0</td>
          <td style="text-align:center;color:#EF4444;font-size:1.05rem;">${grandTotal.toFixed(1)}</td>
        </tr>
      `;
    }

    if (notesEl) {
      notesEl.innerHTML = `
        <b>KNEC Examiner Assessment:</b><br>
        • <b>Solubility Calculations:</b> ${correctSolCount} / ${state.trials.length} solubility values calculated accurately from (Mass / Vol) × 100.<br>
        • <b>Table & Analogue Stem Reading:</b> Average reading deviation was ${avgDiff < 90 ? avgDiff.toFixed(1) + '°C' : 'N/A'}. ${avgDiff <= 2.0 ? 'Demonstrated exceptional precision matching official standard values.' : 'Ensure meniscus sightline is checked carefully at eye level.'}<br>
        • <b>Graph & Interpolation:</b> Plotted ${state.trials.length} coordinate points on the millimeter grid.<br>
        • <b>Post-Lab Questions:</b> Awarded ${calcTotal.toFixed(1)} / 5.0 marks for graphical interpolation and crystal precipitation math.
      `;
    }

    try {
      const lastTrial = state.trials[state.trials.length - 1] || { mass: state.mass, volume: state.volume, temp: 0 };
      const payload = {
        solute_key: state.solute,
        solute_name: (SALT_MODELS[state.solute] && SALT_MODELS[state.solute].name) || state.solute,
        experiment_title: `Solubility Determination of ${(SALT_MODELS[state.solute] && SALT_MODELS[state.solute].name) || state.solute}`,
        solute_mass: lastTrial.mass || state.mass,
        solvent_volume: lastTrial.volume || state.volume,
        crystallization_temp: lastTrial.temp || 0,
        accuracy_score: (tableTotal / 5.0) * 2.0,
        graph_score: (graphTotal / 5.0) * 3.0,
        trials_data: state.trials,
        mode: 'exam',
        assignment_id: state.assignmentId || undefined
      };

      if (typeof Solubility !== 'undefined' && Solubility.save) {
        await Solubility.save(payload);
      } else if (typeof apiRequest === 'function') {
        await apiRequest('POST', '/solubility', payload);
      } else if (window.VLKApi && typeof window.VLKApi.saveSolubilitySession === 'function') {
        await window.VLKApi.saveSolubilitySession(payload);
      }
    } catch (e) {
      console.warn('Exam saved locally in offline queue:', e.message);
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'PRACTICAL_EXAM_SUBMITTED',
        question: 'q1',
        score: grandTotal
      }, '*');
    }

    const modal = document.getElementById('solExamResultModal');
    if (modal) modal.style.display = 'flex';
  }

  return {
    init,
    applyScenario,
    setSolute,
    setMass,
    setVolume,
    setBurnerMode,
    startCooling,
    stirSolution,
    addWaterBurette,
    recordReading,
    resetSimulation,
    setGraphTool,
    openMicroscopeModal,
    closeMicroscopeModal,
    checkCalculations,
    toggleSound,
    toggleDigitalTemp,
    updateCandidateSolubility,
    setStudyMode,
    submitExamBooklet,
    submitSession
  };
})();

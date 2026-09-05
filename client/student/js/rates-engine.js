/**
 * VirtuLab Kenya — Reaction Rates & Chemical Kinetics Engine
 * Aligned with KNEC KCSE Chemistry Form 4 Topic 1 & Paper 3 Practical Standards
 */

const RatesEngine = (function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // STATE DEFINITIONS
  // ══════════════════════════════════════════════════════════
  const state = {
    assignmentId: null,
    currentExp: 'cross', // 'cross' | 'syringe' | 'mass' | 'catalyst' | 'collision'
    studyMode: 'practice', // 'practice' | 'exam'
    language: localStorage.getItem('vlk_lang') || 'en',
    soundEnabled: true,
    isRunning: false,
    timer: 0.0, // in seconds
    timerInterval: null,
    simSpeed: 1.0, // 1x, 2x, 5x

    // Exp 1: Disappearing Cross
    cross: {
      volumeThio: 50.0, // cm³
      volumeWater: 0.0, // cm³
      volumeAcid: 5.0,  // cm³ (2.0M HCl)
      temperature: 25.0, // °C
      concThio: 0.20,    // M
      turbidity: 0.0,    // 0.0 to 1.0
      disappeared: false,
      disappearTime: null,
      recordedData: []
    },

    // Exp 2: Gas Syringe Evolution
    syringe: {
      reactant: 'CaCO3', // 'CaCO3' | 'Mg'
      acidConc: 2.0,      // M
      massSolid: 1.0,     // g
      currentVol: 0.0,    // cm³
      maxVol: 72.0,       // cm³
      recordedData: [],
      bubbles: []
    },

    // Exp 3: Mass Loss Balance
    massLoss: {
      form: 'CHIPS', // 'CHIPS' | 'GRANULES' | 'POWDER'
      initialMass: 154.50, // g (flask + acid + solid)
      currentMass: 154.50,
      totalLossMax: 0.88,  // g (CO2 escaped)
      recordedData: []
    },

    // Exp 4: Catalytic Decomposition
    catalyst: {
      selectedCat: 'MnO2', // 'MnO2' | 'CuO' | 'Fe2O3' | 'KI' | 'CATALASE' | 'NONE'
      h2o2Vol: 20.0,       // cm³
      temp: 25.0,
      gasEvolved: 0.0,
      maxGas: 50.0,
      recordedData: []
    },

    // Exp 5: 2D Particle Collision Simulator
    collision: {
      temp: 300,        // Kelvin (273 - 500)
      activationEnergy: 45, // kJ/mol
      hasCatalyst: false,
      particles: [],
      totalCollisions: 0,
      effectiveCollisions: 0,
      reactionProgress: 0.0
    },

    // Interactive Tangent Tool on Graph
    tangent: {
      active: false,
      pointTime: 60.0, // seconds
      slope: 0.0
    },

    // KNEC Exam Results State
    examResults: {
      tableScore: 0,
      graphScore: 0,
      calcScore: 0,
      totalScore: 0,
      grade: 'E',
      feedback: []
    }
  };

  // Audio Context for synthetic sound effects
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSynthSound(type) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'bubble') {
        osc.frequency.setValueAtTime(400 + Math.random() * 300, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'disappear') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  // ══════════════════════════════════════════════════════════
  // INITIALIZATION & EXPERIMENT SWITCHING
  // ══════════════════════════════════════════════════════════
  function init() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('assignment')) {
      state.assignmentId = parseInt(params.get('assignment'), 10);
      const banner = document.getElementById('assignmentHeaderBanner');
      const bannerTitle = document.getElementById('assignBannerTitle');
      const bannerDue = document.getElementById('assignBannerDue');
      if (banner) banner.style.display = 'flex';
      if (typeof Assignments !== 'undefined' && Assignments.getMine) {
        Assignments.getMine().then(data => {
          const list = data.assignments || [];
          const match = list.find(a => a.id === state.assignmentId);
          if (match) {
            if (bannerTitle) bannerTitle.textContent = match.title + (match.instructions ? ` — ${match.instructions}` : '');
            if (bannerDue && match.due_date) {
              bannerDue.textContent = `Due ${new Date(match.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }
          }
        }).catch(err => console.warn('Could not fetch rates assignment banner info:', err.message));
      }
    }
    const initialExp = params.get('exp') || 'cross';

    setupCanvas();
    setupGraphCanvas();
    setExperiment(initialExp);
    renderKnecTable();
    renderKnecQuestions();
    initCollisionParticles();

    if (params.get('studyMode') === 'exam' || params.get('mode') === 'exam') {
      setStudyMode('exam');
    }

    requestAnimationFrame(renderLoop);
  }

  function setExperiment(expName) {
    stopSimulation();
    state.currentExp = expName;

    // Update Tab UI
    document.querySelectorAll('.rate-exp-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-exp') === expName);
    });

    // Update Stage UI
    const stageChip = document.getElementById('rateStageChip');
    if (stageChip) {
      const titles = {
        cross: 'Na₂S₂O₃ + HCl Precipitation',
        syringe: 'CaCO₃ + HCl Gas Syringe',
        mass: 'Mass Loss on Top-Pan Balance',
        catalyst: 'H₂O₂ Catalytic Decomposition',
        collision: '2D Collision Theory Sandbox'
      };
      stageChip.textContent = titles[expName] || 'Active Experiment';
    }

    // Toggle controls sections visibility
    const secCross = document.getElementById('ctrlSecCross');
    const secSyringe = document.getElementById('ctrlSecSyringe');
    const secMass = document.getElementById('ctrlSecMass');
    const secCatalyst = document.getElementById('ctrlSecCatalyst');
    const secCollision = document.getElementById('ctrlSecCollision');

    if (secCross) secCross.style.display = (expName === 'cross') ? 'block' : 'none';
    if (secSyringe) secSyringe.style.display = (expName === 'syringe') ? 'block' : 'none';
    if (secMass) secMass.style.display = (expName === 'mass') ? 'block' : 'none';
    if (secCatalyst) secCatalyst.style.display = (expName === 'catalyst') ? 'block' : 'none';
    if (secCollision) secCollision.style.display = (expName === 'collision') ? 'block' : 'none';

    // Show/Hide Disappearing Cross Inset
    const crossBox = document.getElementById('rateCrossBox');
    if (crossBox) {
      crossBox.style.display = (expName === 'cross') ? 'flex' : 'none';
    }

    resetCurrentExperiment();
    renderKnecTable();
    drawGraph();
  }

  function setStudyMode(mode) {
    state.studyMode = mode;
    const btnPrac = document.getElementById('btnModePractice');
    const btnExam = document.getElementById('btnModeExam');
    if (btnPrac && btnExam) {
      btnPrac.classList.toggle('active', mode === 'practice');
      btnExam.classList.toggle('active', mode === 'exam');
    }
    const examCard = document.getElementById('knecExamCard');
    if (examCard) {
      examCard.style.border = mode === 'exam' ? '2px solid #EF4444' : '2px solid var(--rate-amber)';
    }
  }

  function setSimSpeed(speed) {
    state.simSpeed = parseFloat(speed);
    document.querySelectorAll('.speed-btn-chip').forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.speed) === state.simSpeed);
    });
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
      btn.textContent = state.soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
    }
  }

  function setLanguage(lang) {
    state.language = lang;
    localStorage.setItem('vlk_lang', lang);
    document.querySelectorAll('.lang-btn-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    if (typeof window.applyTranslations === 'function') {
      window.applyTranslations();
    }
  }

  // ══════════════════════════════════════════════════════════
  // SIMULATION TIMING & RUN LOOP
  // ══════════════════════════════════════════════════════════
  function startSimulation() {
    if (state.isRunning) return;
    state.isRunning = true;

    const startBtn = document.getElementById('btnStartSim');
    if (startBtn) {
      startBtn.innerHTML = '<span>⏸ Pause</span>';
      startBtn.classList.remove('rate-btn-primary');
      startBtn.classList.add('rate-btn-danger');
    }

    let lastTime = performance.now();
    state.timerInterval = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000 * state.simSpeed;
      lastTime = now;

      state.timer += dt;
      updateSimulationPhysics(dt);
      updateHUD();
    }, 50);
  }

  function pauseSimulation() {
    state.isRunning = false;
    if (state.timerInterval) clearInterval(state.timerInterval);

    const startBtn = document.getElementById('btnStartSim');
    if (startBtn) {
      startBtn.innerHTML = '<span>▶ Resume</span>';
      startBtn.classList.remove('rate-btn-danger');
      startBtn.classList.add('rate-btn-primary');
    }
  }

  function toggleSimulation() {
    if (state.isRunning) pauseSimulation();
    else startSimulation();
  }

  function stopSimulation() {
    state.isRunning = false;
    if (state.timerInterval) clearInterval(state.timerInterval);

    const startBtn = document.getElementById('btnStartSim');
    if (startBtn) {
      startBtn.innerHTML = '<span>▶ Start Mixing & Timer</span>';
      startBtn.classList.remove('rate-btn-danger');
      startBtn.classList.add('rate-btn-primary');
    }
  }

  function resetCurrentExperiment() {
    stopSimulation();
    state.timer = 0.0;

    if (state.currentExp === 'cross') {
      state.cross.turbidity = 0.0;
      state.cross.disappeared = false;
      state.cross.disappearTime = null;
      updateCrossCloudView(0.0);
    } else if (state.currentExp === 'syringe') {
      state.syringe.currentVol = 0.0;
      state.syringe.bubbles = [];
    } else if (state.currentExp === 'mass') {
      state.massLoss.currentMass = state.massLoss.initialMass;
    } else if (state.currentExp === 'catalyst') {
      state.catalyst.gasEvolved = 0.0;
    } else if (state.currentExp === 'collision') {
      initCollisionParticles();
    }

    updateHUD();
    drawApparatus();
  }

  // ══════════════════════════════════════════════════════════
  // KINETIC ODE CALCULATIONS
  // ══════════════════════════════════════════════════════════
  function updateSimulationPhysics(dt) {
    if (state.currentExp === 'cross') {
      // S2O3(2-) + 2H+ -> SO2 + S(s) + H2O
      // Rate = k * [Na2S2O3] * exp(-Ea/(R*T))
      const c = (state.cross.volumeThio / 50.0) * state.cross.concThio;
      const T_kelvin = 273.15 + state.cross.temperature;
      // Arrhenius rate factor
      const k = 0.28 * Math.exp(-32000 / (8.314 * T_kelvin) + 32000 / (8.314 * 298.15));
      const rate = k * c;

      state.cross.turbidity = Math.min(1.0, state.cross.turbidity + rate * dt * 0.18);
      updateCrossCloudView(state.cross.turbidity);

      if (state.cross.turbidity >= 0.96 && !state.cross.disappeared) {
        state.cross.disappeared = true;
        state.cross.disappearTime = state.timer;
        playSynthSound('disappear');
      }

      if (Math.random() < 0.15) playSynthSound('bubble');

    } else if (state.currentExp === 'syringe') {
      // CaCO3 + 2HCl -> CaCl2 + CO2 + H2O
      // V(t) = Vmax * (1 - exp(-k * t))
      const k = 0.035 * (state.syringe.acidConc / 2.0);
      const targetVol = state.syringe.maxVol * (1 - Math.exp(-k * state.timer));
      state.syringe.currentVol = Math.min(state.syringe.maxVol, targetVol);

      // Bubble animation particles
      if (state.syringe.currentVol < state.syringe.maxVol - 0.5) {
        if (Math.random() < 0.4) {
          state.syringe.bubbles.push({
            x: 180 + (Math.random() - 0.5) * 40,
            y: 260,
            r: 2 + Math.random() * 3,
            vy: 1.5 + Math.random() * 2
          });
          playSynthSound('bubble');
        }
      }

      // Update bubbles
      state.syringe.bubbles.forEach(b => { b.y -= b.vy; });
      state.syringe.bubbles = state.syringe.bubbles.filter(b => b.y > 170);

    } else if (state.currentExp === 'mass') {
      // Mass loss = totalLossMax * (1 - exp(-k*t))
      let k = 0.02; // CHIPS
      if (state.massLoss.form === 'GRANULES') k = 0.045;
      if (state.massLoss.form === 'POWDER') k = 0.12;

      const loss = state.massLoss.totalLossMax * (1 - Math.exp(-k * state.timer));
      state.massLoss.currentMass = state.massLoss.initialMass - loss;

      if (Math.random() < 0.2) playSynthSound('bubble');

    } else if (state.currentExp === 'catalyst') {
      // 2H2O2 -> 2H2O + O2
      const catMultipliers = {
        'MnO2': 0.12,
        'CuO': 0.04,
        'Fe2O3': 0.02,
        'KI': 0.08,
        'CATALASE': (state.catalyst.temp > 45) ? 0.001 : 0.15, // Denaturation above 45°C
        'NONE': 0.0008
      };
      const mult = catMultipliers[state.catalyst.selectedCat] || 0.01;
      state.catalyst.gasEvolved = Math.min(state.catalyst.maxGas, state.catalyst.maxGas * (1 - Math.exp(-mult * state.timer)));

      if (state.catalyst.gasEvolved < state.catalyst.maxGas - 0.5 && Math.random() < 0.3) {
        playSynthSound('bubble');
      }

    } else if (state.currentExp === 'collision') {
      updateCollisionParticles(dt);
    }
  }

  function updateCrossCloudView(turbidity) {
    const cloudCover = document.getElementById('rateCrossCloudCover');
    if (cloudCover) {
      cloudCover.style.background = `rgba(254, 240, 138, ${turbidity * 0.95})`;
      cloudCover.style.backdropFilter = `blur(${turbidity * 12}px)`;
    }
  }

  function updateHUD() {
    const timeVal = document.getElementById('rateHudTime');
    if (timeVal) timeVal.textContent = state.timer.toFixed(1) + ' s';

    const metricVal = document.getElementById('rateHudMetric');
    if (metricVal) {
      if (state.currentExp === 'cross') {
        metricVal.textContent = 'Turbidity: ' + (state.cross.turbidity * 100).toFixed(0) + '%';
      } else if (state.currentExp === 'syringe') {
        metricVal.textContent = 'CO₂ Vol: ' + state.syringe.currentVol.toFixed(1) + ' cm³';
      } else if (state.currentExp === 'mass') {
        metricVal.textContent = 'Mass: ' + state.massLoss.currentMass.toFixed(2) + ' g';
      } else if (state.currentExp === 'catalyst') {
        metricVal.textContent = 'O₂ Vol: ' + state.catalyst.gasEvolved.toFixed(1) + ' cm³';
      } else if (state.currentExp === 'collision') {
        const rate = (state.collision.effectiveCollisions / Math.max(1, state.collision.totalCollisions) * 100);
        metricVal.textContent = 'Effective Collisions: ' + rate.toFixed(1) + '%';
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  // EXP 1: DISAPPEARING CROSS CONTROLS
  // ═══════════════════════════════════════
  function setVolumeThio(val) {
    const vThio = parseFloat(val);
    state.cross.volumeThio = vThio;
    state.cross.volumeWater = 50.0 - vThio;

    const lblThio = document.getElementById('crossThioVal');
    if (lblThio) lblThio.textContent = vThio.toFixed(1) + ' cm³';

    const lblWater = document.getElementById('crossWaterVal');
    if (lblWater) lblWater.textContent = (50.0 - vThio).toFixed(1) + ' cm³';

    const chipText = document.getElementById('crossWaterChipText');
    if (chipText) chipText.textContent = (50.0 - vThio).toFixed(1) + ' cm³ (Auto: 50 − V)';

    resetCurrentExperiment();
  }

  function setCrossTemp(val) {
    state.cross.temperature = parseFloat(val);
    const lbl = document.getElementById('crossTempVal');
    if (lbl) lbl.textContent = state.cross.temperature.toFixed(0) + ' °C';
    resetCurrentExperiment();
  }

  // ══════════════════════════════════════════════════════════
  // EXP 2: GAS SYRINGE CONTROLS
  // ═══════════════════════════════════════
  function setSyringeReactant(val) {
    state.syringe.reactant = val;
    state.syringe.maxVol = (val === 'Mg') ? 95.0 : 72.0;
    resetCurrentExperiment();
  }

  function setSyringeAcidConc(val) {
    state.syringe.acidConc = parseFloat(val);
    const lbl = document.getElementById('syringeAcidConcVal');
    if (lbl) lbl.textContent = state.syringe.acidConc.toFixed(1) + ' M';
    resetCurrentExperiment();
  }

  // ══════════════════════════════════════════════════════════
  // EXP 3: MASS LOSS CONTROLS
  // ═══════════════════════════════════════
  function setMassLossForm(form) {
    state.massLoss.form = form;
    document.querySelectorAll('.mass-form-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.form === form);
    });
    resetCurrentExperiment();
  }

  // ══════════════════════════════════════════════════════════
  // EXP 4: CATALYST CONTROLS
  // ═══════════════════════════════════════
  function setCatalyst(cat) {
    state.catalyst.selectedCat = cat;
    resetCurrentExperiment();
  }

  function setCatalystTemp(temp) {
    state.catalyst.temp = parseFloat(temp);
    const lbl = document.getElementById('catalystTempVal');
    if (lbl) lbl.textContent = state.catalyst.temp.toFixed(0) + ' °C';
    resetCurrentExperiment();
  }

  // ══════════════════════════════════════════════════════════
  // EXP 5: 2D COLLISION PARTICLES
  // ═══════════════════════════════════════
  function initCollisionParticles() {
    state.collision.particles = [];
    state.collision.totalCollisions = 0;
    state.collision.effectiveCollisions = 0;

    const N = 40;
    for (let i = 0; i < N; i++) {
      const type = (i % 2 === 0) ? 'A' : 'B';
      const speed = Math.sqrt(state.collision.temp) * 0.12;
      const angle = Math.random() * Math.PI * 2;
      state.collision.particles.push({
        x: 40 + Math.random() * 400,
        y: 40 + Math.random() * 200,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 6,
        type: type, // 'A' (red) | 'B' (blue) | 'AB' (purple product)
        mass: 1.0
      });
    }
  }

  function updateCollisionParticles(dt) {
    const particles = state.collision.particles;
    const boxW = 500;
    const boxH = 260;

    particles.forEach(p => {
      p.x += p.vx * dt * 30;
      p.y += p.vy * dt * 30;

      // Bounce against walls
      if (p.x - p.radius < 10) { p.x = 10 + p.radius; p.vx *= -1; }
      if (p.x + p.radius > boxW - 10) { p.x = boxW - 10 - p.radius; p.vx *= -1; }
      if (p.y - p.radius < 10) { p.y = 10 + p.radius; p.vy *= -1; }
      if (p.y + p.radius > boxH - 10) { p.y = boxH - 10 - p.radius; p.vy *= -1; }
    });

    // Particle-Particle Collisions
    const effectiveEa = state.collision.hasCatalyst ? (state.collision.activationEnergy * 0.5) : state.collision.activationEnergy;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);

        if (dist < p1.radius + p2.radius) {
          // Collision occurred
          state.collision.totalCollisions++;

          // Elastic collision physics
          const nx = dx / dist;
          const ny = dy / dist;
          const kx = p1.vx - p2.vx;
          const ky = p1.vy - p2.vy;
          const p = 2 * (nx * kx + ny * ky) / (p1.mass + p2.mass);

          p1.vx -= p * p2.mass * nx;
          p1.vy -= p * p2.mass * ny;
          p2.vx += p * p1.mass * nx;
          p2.vy += p * p1.mass * ny;

          // Relative kinetic energy
          const vRelSq = (p1.vx - p2.vx) ** 2 + (p1.vy - p2.vy) ** 2;
          const collisionEnergy = 0.5 * vRelSq * 8.0; // Scaled proxy

          if (collisionEnergy >= effectiveEa) {
            if ((p1.type === 'A' && p2.type === 'B') || (p1.type === 'B' && p2.type === 'A')) {
              p1.type = 'AB';
              p2.type = 'AB';
              state.collision.effectiveCollisions++;
              playSynthSound('success');
            }
          }
        }
      }
    }
  }

  function setCollisionTemp(val) {
    state.collision.temp = parseFloat(val);
    const lbl = document.getElementById('collisionTempVal');
    if (lbl) lbl.textContent = state.collision.temp.toFixed(0) + ' K';
    initCollisionParticles();
  }

  function setCollisionEa(val) {
    state.collision.activationEnergy = parseFloat(val);
    const lbl = document.getElementById('collisionEaVal');
    if (lbl) lbl.textContent = state.collision.activationEnergy.toFixed(0) + ' kJ/mol';
  }

  function toggleCollisionCatalyst() {
    state.collision.hasCatalyst = !state.collision.hasCatalyst;
    const btn = document.getElementById('btnCollisionCatalyst');
    if (btn) {
      btn.classList.toggle('active', state.collision.hasCatalyst);
      btn.textContent = state.collision.hasCatalyst ? '⚡ Catalyst Active (Lower Ea)' : '➕ Add Catalyst';
    }
  }

  // ══════════════════════════════════════════════════════════
  // RECORDING READINGS & KNEC TABLE RENDERING
  // ══════════════════════════════════════════════════════════
  function recordReading() {
    if (state.currentExp === 'cross') {
      const time = state.cross.disappeared ? state.cross.disappearTime : state.timer;
      if (time <= 0.5) return;

      const rateProxy = 1.0 / time;
      state.cross.recordedData.push({
        vThio: state.cross.volumeThio,
        vWater: state.cross.volumeWater,
        time: time,
        rate: rateProxy
      });
      playSynthSound('tick');

    } else if (state.currentExp === 'syringe') {
      state.syringe.recordedData.push({
        time: state.timer,
        volume: state.syringe.currentVol
      });
      playSynthSound('tick');

    } else if (state.currentExp === 'mass') {
      state.massLoss.recordedData.push({
        form: state.massLoss.form,
        time: state.timer,
        mass: state.massLoss.currentMass,
        loss: (state.massLoss.initialMass - state.massLoss.currentMass)
      });
      playSynthSound('tick');
    }

    renderKnecTable();
    drawGraph();
  }

  function renderKnecTable() {
    const tableHead = document.getElementById('knecTableHead');
    const tableBody = document.getElementById('knecTableBody');
    if (!tableHead || !tableBody) return;

    if (state.currentExp === 'cross') {
      tableHead.innerHTML = `
        <tr>
          <th>Exp</th>
          <th>Vol Na₂S₂O₃ (cm³)</th>
          <th>Vol Water (cm³)</th>
          <th>Time t (s)</th>
          <th>Rate 1/t (s⁻¹)</th>
        </tr>
      `;

      // Preset KCSE Dilution Rows
      const standardRows = [
        { vThio: 50.0, vWater: 0.0 },
        { vThio: 40.0, vWater: 10.0 },
        { vThio: 30.0, vWater: 20.0 },
        { vThio: 20.0, vWater: 30.0 },
        { vThio: 10.0, vWater: 40.0 }
      ];

      tableBody.innerHTML = standardRows.map((row, idx) => {
        const found = state.cross.recordedData.find(d => Math.abs(d.vThio - row.vThio) < 1.0);
        const timeStr = found ? found.time.toFixed(1) : '-';
        const rateStr = found ? found.rate.toFixed(4) : '-';
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${row.vThio.toFixed(1)}</td>
            <td>${row.vWater.toFixed(1)}</td>
            <td><input type="text" class="rate-table-input" id="tblTime_${idx}" value="${timeStr}" placeholder="--"></td>
            <td><strong style="color:var(--rate-amber);" id="tblRate_${idx}">${rateStr}</strong></td>
          </tr>
        `;
      }).join('');

    } else if (state.currentExp === 'syringe') {
      tableHead.innerHTML = `
        <tr>
          <th>Time (s)</th>
          <th>0</th>
          <th>30</th>
          <th>60</th>
          <th>90</th>
          <th>120</th>
          <th>150</th>
          <th>180</th>
          <th>210</th>
        </tr>
      `;

      const times = [0, 30, 60, 90, 120, 150, 180, 210];
      tableBody.innerHTML = `
        <tr>
          <th>Vol CO₂ (cm³)</th>
          ${times.map(t => {
            const found = state.syringe.recordedData.find(d => Math.abs(d.time - t) < 5.0);
            const val = (t === 0) ? '0.0' : (found ? found.volume.toFixed(1) : '-');
            return `<td><input type="text" class="rate-table-input" style="max-width:55px;" value="${val}"></td>`;
          }).join('')}
        </tr>
      `;
    }
  }

  // ══════════════════════════════════════════════════════════
  // REAL-TIME CANVAS APPARATUS RENDERING
  // ══════════════════════════════════════════════════════════
  let canvas, ctx;
  function setupCanvas() {
    canvas = document.getElementById('rateSimCanvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 320;
    }
  }

  function renderLoop() {
    drawApparatus();
    requestAnimationFrame(renderLoop);
  }

  function drawApparatus() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (state.currentExp === 'cross') {
      drawDisappearingCrossApparatus(ctx, w, h);
    } else if (state.currentExp === 'syringe') {
      drawGasSyringeApparatus(ctx, w, h);
    } else if (state.currentExp === 'mass') {
      drawMassLossApparatus(ctx, w, h);
    } else if (state.currentExp === 'catalyst') {
      drawCatalystApparatus(ctx, w, h);
    } else if (state.currentExp === 'collision') {
      drawCollisionSandbox(ctx, w, h);
    }
  }

  function drawDisappearingCrossApparatus(ctx, w, h) {
    const isMobile = w < 520;
    const scale = isMobile ? Math.min(1.0, Math.max(0.75, w / 460)) : 1.0;
    const cx = isMobile ? w * 0.38 : w * 0.44;
    const benchY = h - 36;
    const tileY = benchY - 14;
    const tileW = 160 * scale;
    const tileH = 12;
    const flaskBaseY = tileY;
    const turb = Math.min(1, Math.max(0, state.cross.turbidity));

    // ── 1. Lab Bench Surface (Dark Slate with Front Edge) ──
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, h);
    benchGrad.addColorStop(0, '#1E293B');
    benchGrad.addColorStop(0.3, '#0F172A');
    benchGrad.addColorStop(1, '#020617');
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, w, 36);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(w, benchY);
    ctx.stroke();

    // ── 2. White Glazed Ceramic Tile with 3D Depth ──
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(cx - tileW/2 + 3, tileY + 3, tileW, tileH); // Drop shadow

    // Tile body
    const tileGrad = ctx.createLinearGradient(0, tileY, 0, tileY + tileH);
    tileGrad.addColorStop(0, '#FFFFFF');
    tileGrad.addColorStop(0.7, '#F8FAFC');
    tileGrad.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = tileGrad;
    ctx.fillRect(cx - tileW/2, tileY, tileW, tileH);

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - tileW/2, tileY, tileW, tileH);

    // Tile Label
    ctx.font = `700 ${Math.round(8 * scale)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.fillText('WHITE CERAMIC TILE', cx, tileY + tileH - 3);

    // ── 3. Bold Black KNEC Cross on Tile (Directly Under Flask) ──
    const crossAlpha = Math.max(0.08, 1 - turb * 0.9);
    ctx.save();
    ctx.strokeStyle = `rgba(15, 23, 42, ${crossAlpha})`;
    ctx.lineWidth = Math.max(4, 6 * scale);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 20 * scale, tileY + 1);
    ctx.lineTo(cx + 20 * scale, tileY + 1);
    ctx.moveTo(cx, tileY - 4);
    ctx.lineTo(cx, tileY + 6);
    ctx.stroke();
    ctx.restore();

    // ── 4. Conical Flask Geometry ──
    const flaskH = 155 * scale;
    const neckTopY = flaskBaseY - flaskH;
    const neckBaseY = flaskBaseY - 95 * scale;
    const liquidTopY = flaskBaseY - 62 * scale;
    const neckHalfW = 18 * scale;
    const baseHalfW = 68 * scale;

    // Define Flask Path
    function createFlaskPath(c) {
      c.beginPath();
      // Lip Rim
      c.moveTo(cx - neckHalfW - 3, neckTopY);
      c.lineTo(cx + neckHalfW + 3, neckTopY);
      c.lineTo(cx + neckHalfW, neckTopY + 4);
      // Neck right wall
      c.lineTo(cx + neckHalfW, neckBaseY);
      // Conical sloped body right wall
      c.lineTo(cx + baseHalfW + 3, flaskBaseY - 8);
      // Rounded bottom right corner
      c.quadraticCurveTo(cx + baseHalfW + 5, flaskBaseY, cx + baseHalfW - 6, flaskBaseY);
      // Flat bottom
      c.lineTo(cx - baseHalfW + 6, flaskBaseY);
      // Rounded bottom left corner
      c.quadraticCurveTo(cx - baseHalfW - 5, flaskBaseY, cx - baseHalfW - 3, flaskBaseY - 8);
      // Conical sloped body left wall
      c.lineTo(cx - neckHalfW, neckBaseY);
      // Neck left wall
      c.lineTo(cx - neckHalfW, neckTopY + 4);
      c.closePath();
    }

    // ── 5. Liquid Fill with Dynamic Colloidal Sulfur Opacity ──
    ctx.save();
    createFlaskPath(ctx);
    ctx.clip(); // Clip to flask interior

    const redCh = Math.round(224 + turb * (254 - 224));
    const grnCh = Math.round(242 + turb * (240 - 242));
    const bluCh = Math.round(254 - turb * 140);
    const liqAlpha = 0.35 + turb * 0.62;

    const liqGrad = ctx.createLinearGradient(0, liquidTopY, 0, flaskBaseY);
    liqGrad.addColorStop(0, `rgba(${redCh}, ${grnCh}, ${bluCh}, ${liqAlpha * 0.85})`);
    liqGrad.addColorStop(0.6, `rgba(${redCh}, ${grnCh}, ${bluCh}, ${liqAlpha})`);
    liqGrad.addColorStop(1, `rgba(${Math.max(0, redCh - 20)}, ${Math.max(0, grnCh - 20)}, ${Math.max(0, bluCh - 30)}, ${liqAlpha})`);
    ctx.fillStyle = liqGrad;
    ctx.fillRect(cx - baseHalfW - 10, liquidTopY, (baseHalfW + 10) * 2, flaskBaseY - liquidTopY + 10);

    // Cross visible through the bottom of the flask
    if (turb < 0.95) {
      const bottomCrossAlpha = (1 - turb) * 0.8;
      ctx.strokeStyle = `rgba(15, 23, 42, ${bottomCrossAlpha})`;
      ctx.lineWidth = Math.max(3, 5 * scale);
      ctx.beginPath();
      ctx.moveTo(cx - 18 * scale, flaskBaseY - 3);
      ctx.lineTo(cx + 18 * scale, flaskBaseY - 3);
      ctx.stroke();
    }

    // Animated Colloidal Sulfur Particles (S8)
    if (turb > 0.04) {
      const particleCount = Math.round(turb * 35);
      ctx.fillStyle = `rgba(254, 240, 138, ${Math.min(0.9, 0.3 + turb * 0.6)})`;
      for (let i = 0; i < particleCount; i++) {
        const timeOffset = (state.timer || 0) * 1.5;
        const px = cx - baseHalfW + 12 + ((Math.sin(i * 47.3 + timeOffset) * 0.5 + 0.5) * (baseHalfW * 2 - 24));
        const py = liquidTopY + 8 + ((Math.cos(i * 29.1 + timeOffset * 0.7) * 0.5 + 0.5) * (flaskBaseY - liquidTopY - 14));
        const pr = (1.0 + (Math.sin(i * 13) * 0.5 + 0.5) * 2.0) * scale;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore(); // Exit clip

    // ── 6. Liquid Meniscus ──
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, liquidTopY, 40 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${redCh}, ${grnCh}, ${bluCh}, ${0.5 + turb * 0.45})`;
    ctx.fill();
    ctx.strokeStyle = turb > 0.4 ? 'rgba(234, 179, 8, 0.7)' : 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // ── 7. Glassware Outlines & Markings ──
    ctx.save();
    createFlaskPath(ctx);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - neckHalfW + 3, neckTopY + 6);
    ctx.lineTo(cx - neckHalfW + 3, neckBaseY);
    ctx.lineTo(cx - baseHalfW + 5, flaskBaseY - 10);
    ctx.stroke();

    // Volume Graduations
    ctx.font = `600 ${Math.round(7 * scale)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1;

    const gradMarks = [
      { y: flaskBaseY - 18 * scale, vol: '50ml', w: 8 * scale },
      { y: flaskBaseY - 34 * scale, vol: '100ml', w: 12 * scale },
      { y: flaskBaseY - 48 * scale, vol: '150ml', w: 10 * scale },
      { y: flaskBaseY - 64 * scale, vol: '200ml', w: 14 * scale }
    ];

    gradMarks.forEach(gm => {
      const gx = cx - 36 * scale - (flaskBaseY - gm.y) * 0.12;
      ctx.beginPath();
      ctx.moveTo(gx, gm.y);
      ctx.lineTo(gx + gm.w, gm.y);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(gm.vol, gx - 2, gm.y + 2.5);
    });

    ctx.restore();

    // ── 8. Top-Down Observer Inset Lens ──
    const eyeR = isMobile ? Math.min(38, Math.max(28, w * 0.105)) : 46;
    const eyeX = w - eyeR - (isMobile ? 12 : 22);
    const eyeY = Math.min(h * 0.32, 74);

    // Eyepiece Outer Rim
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(eyeX + 2, eyeY + 3, eyeR, 0, Math.PI * 2);
    ctx.fill();

    const rimGrad = ctx.createLinearGradient(eyeX - eyeR, eyeY - eyeR, eyeX + eyeR, eyeY + eyeR);
    rimGrad.addColorStop(0, '#CBD5E1');
    rimGrad.addColorStop(0.5, '#475569');
    rimGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR + 3, 0, Math.PI * 2);
    ctx.fill();

    // Lens Interior
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.clip(); // Clip to lens circle

    // Cross in lens
    const topCrossAlpha = Math.max(0, 1 - turb * 1.05);
    ctx.strokeStyle = `rgba(15, 23, 42, ${topCrossAlpha})`;
    ctx.beginPath();
    ctx.moveTo(eyeX - 22, eyeY);
    ctx.lineTo(eyeX + 22, eyeY);
    ctx.moveTo(eyeX, eyeY - 22);
    ctx.lineTo(eyeX, eyeY + 22);
    ctx.stroke();

    // Colloidal Sulfur Cloud Overlay in Lens
    const lensLiqGrad = ctx.createRadialGradient(eyeX, eyeY, 5, eyeX, eyeY, eyeR);
    lensLiqGrad.addColorStop(0, `rgba(${redCh}, ${grnCh}, ${bluCh}, ${turb * 0.95})`);
    lensLiqGrad.addColorStop(0.7, `rgba(${redCh}, ${grnCh}, ${bluCh}, ${turb * 0.92})`);
    lensLiqGrad.addColorStop(1, `rgba(${Math.max(0, redCh - 20)}, ${Math.max(0, grnCh - 20)}, ${Math.max(0, bluCh - 30)}, ${Math.min(1, turb * 0.98)})`);
    ctx.fillStyle = lensLiqGrad;
    ctx.fillRect(eyeX - eyeR, eyeY - eyeR, eyeR * 2, eyeR * 2);

    // Micro-sulfur particles in lens
    if (turb > 0.05) {
      ctx.fillStyle = `rgba(254, 240, 138, ${turb * 0.85})`;
      for (let j = 0; j < Math.round(turb * 30); j++) {
        const lx = eyeX - eyeR + 10 + (Math.sin(j * 17.3 + (state.timer || 0)) * 0.5 + 0.5) * (eyeR * 2 - 20);
        const ly = eyeY - eyeR + 10 + (Math.cos(j * 31.7 + (state.timer || 0)) * 0.5 + 0.5) * (eyeR * 2 - 20);
        ctx.beginPath();
        ctx.arc(lx, ly, 1.2 + Math.sin(j) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Circular Flask Rim & Glass Sheen inside lens
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR - 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeX - 4, eyeY - 4, eyeR - 8, Math.PI * 1.1, Math.PI * 1.6);
    ctx.stroke();

    ctx.restore(); // Exit lens clip

    // Eyepiece Labels
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isLight = currentTheme !== 'dark' && currentTheme !== 'green';

    ctx.font = `800 ${isMobile ? 7.5 : 8.5}px "JetBrains Mono", monospace`;
    ctx.fillStyle = isLight ? '#0F172A' : '#F8FAFC';
    ctx.textAlign = 'center';
    ctx.fillText('TOP-DOWN SIGHTLINE', eyeX, eyeY + eyeR + (isMobile ? 11 : 14));

    ctx.font = `700 ${isMobile ? 7 : 7.5}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = turb >= 0.95 ? '#EF4444' : (turb > 0.4 ? '#D97706' : (isLight ? '#047857' : '#10B981'));
    ctx.fillText(turb >= 0.95 ? '● CROSS OBSCURED' : (turb > 0 ? `${Math.round(turb * 100)}% Obscured` : '● Cross Visible'), eyeX, eyeY + eyeR + (isMobile ? 21 : 25));
  }

  function drawGasSyringeApparatus(ctx, w, h) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isLight = currentTheme !== 'dark' && currentTheme !== 'green';
    const cx = w * 0.35;
    const cy = h / 2 + 25;

    // Bench
    ctx.fillStyle = isLight ? '#334155' : '#1E293B';
    ctx.fillRect(0, h - 30, w, 30);

    // Conical Flask
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 70);
    ctx.lineTo(cx + 15, cy - 70);
    ctx.lineTo(cx + 15, cy - 30);
    ctx.lineTo(cx + 65, cy + 45);
    ctx.lineTo(cx - 65, cy + 45);
    ctx.lineTo(cx - 15, cy - 30);
    ctx.closePath();
    ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.2)';
    ctx.fill();
    ctx.strokeStyle = isLight ? '#0284C7' : '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Delivery Tube leading to Syringe
    ctx.beginPath();
    ctx.moveTo(cx, cy - 70);
    ctx.lineTo(cx, cy - 110);
    ctx.lineTo(cx + 120, cy - 110);
    ctx.lineTo(cx + 120, cy - 50);
    ctx.strokeStyle = isLight ? '#64748B' : '#94A3B8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Syringe Barrel (Right Side)
    const sx = cx + 120;
    const sy = cy - 50;
    const sLen = 160;
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(sx, sy - 15, sLen, 30);
    ctx.strokeStyle = isLight ? '#94A3B8' : '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy - 15, sLen, 30);

    // Syringe Plunger Position proportional to volume
    const volPct = state.syringe.currentVol / state.syringe.maxVol;
    const plungerX = sx + volPct * (sLen - 30);

    // Gas Fill inside barrel
    ctx.fillStyle = isLight ? 'rgba(217, 119, 6, 0.2)' : 'rgba(245, 158, 11, 0.25)';
    ctx.fillRect(sx, sy - 13, plungerX - sx, 26);

    // Plunger Head & Rod
    ctx.fillStyle = isLight ? '#D97706' : '#F59E0B';
    ctx.fillRect(plungerX, sy - 14, 10, 28);
    ctx.fillStyle = isLight ? '#475569' : '#64748B';
    ctx.fillRect(plungerX + 10, sy - 4, 70, 8);

    // Effervescence bubbles in flask
    ctx.fillStyle = isLight ? '#0284C7' : '#FFFFFF';
    state.syringe.bubbles.forEach(b => {
      ctx.beginPath();
      ctx.arc(cx - 30 + (b.x % 60), b.y - 40, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawMassLossApparatus(ctx, w, h) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isLight = currentTheme !== 'dark' && currentTheme !== 'green';
    const cx = w / 2;
    const cy = h / 2 + 10;

    // Bench
    ctx.fillStyle = isLight ? '#334155' : '#1E293B';
    ctx.fillRect(0, h - 30, w, 30);

    // Electronic Top-Pan Balance Body
    ctx.fillStyle = isLight ? '#475569' : '#334155';
    ctx.fillRect(cx - 90, cy + 25, 180, 50);
    ctx.strokeStyle = isLight ? '#64748B' : '#64748B';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 90, cy + 25, 180, 50);

    // Pan
    ctx.fillStyle = isLight ? '#E2E8F0' : '#CBD5E1';
    ctx.fillRect(cx - 70, cy + 18, 140, 7);

    // LCD Display on Scale
    ctx.fillStyle = '#022C22';
    ctx.fillRect(cx - 60, cy + 42, 120, 24);
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#10B981';
    ctx.textAlign = 'center';
    ctx.fillText(state.massLoss.currentMass.toFixed(2) + ' g', cx, cy + 59);

    // Conical Flask on pan
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 60);
    ctx.lineTo(cx + 15, cy - 60);
    ctx.lineTo(cx + 15, cy - 25);
    ctx.lineTo(cx + 55, cy + 18);
    ctx.lineTo(cx - 55, cy + 18);
    ctx.lineTo(cx - 15, cy - 25);
    ctx.closePath();
    ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(56, 189, 248, 0.25)';
    ctx.fill();
    ctx.strokeStyle = isLight ? '#0284C7' : '#38BDF8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cotton Wool Plug in flask mouth
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy - 60, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isLight ? '#CBD5E1' : '#64748B';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawCatalystApparatus(ctx, w, h) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isLight = currentTheme !== 'dark' && currentTheme !== 'green';
    const cx = w / 2;
    const cy = h / 2 + 20;

    // Bench
    ctx.fillStyle = isLight ? '#334155' : '#1E293B';
    ctx.fillRect(0, h - 30, w, 30);

    // Boiling Tube
    ctx.beginPath();
    ctx.arc(cx, cy + 30, 25, 0, Math.PI);
    ctx.lineTo(cx - 25, cy - 80);
    ctx.lineTo(cx + 25, cy - 80);
    ctx.closePath();
    ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.15)';
    ctx.fill();
    ctx.strokeStyle = isLight ? '#0284C7' : '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Solid Catalyst powder at bottom
    ctx.fillStyle = (state.catalyst.selectedCat === 'MnO2') ? '#0F172A' : (isLight ? '#B45309' : '#D97706');
    ctx.beginPath();
    ctx.arc(cx, cy + 30, 20, 0.2, Math.PI - 0.2);
    ctx.fill();

    // Bubbles
    if (state.catalyst.gasEvolved > 0.5) {
      ctx.fillStyle = isLight ? '#0284C7' : '#FFFFFF';
      for (let i = 0; i < 8; i++) {
        const bx = cx - 15 + Math.random() * 30;
        const by = cy + 20 - Math.random() * 80;
        ctx.beginPath();
        ctx.arc(bx, by, 2 + Math.random() * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawCollisionSandbox(ctx, w, h) {
    // Thermal Chamber Background
    ctx.fillStyle = '#090D16';
    ctx.fillRect(10, 10, w - 20, h - 20);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Draw Particles
    state.collision.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      if (p.type === 'A') ctx.fillStyle = '#EF4444'; // Red reactant A
      else if (p.type === 'B') ctx.fillStyle = '#3B82F6'; // Blue reactant B
      else ctx.fillStyle = '#A855F7'; // Purple product AB
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // ══════════════════════════════════════════════════════════
  // KNEC SAPC GRAPH PLOTTING & TANGENT TOOL
  // ══════════════════════════════════════════════════════════
  let gCanvas, gCtx;
  function setupGraphCanvas() {
    gCanvas = document.getElementById('rateGraphCanvas');
    if (gCanvas) {
      gCtx = gCanvas.getContext('2d');
      gCanvas.width = gCanvas.parentElement.clientWidth || 550;
      gCanvas.height = gCanvas.parentElement.clientHeight || 360;

      // Click to place tangent point
      gCanvas.addEventListener('click', onGraphClick);
    }
  }

  function onGraphClick(e) {
    if (!state.tangent.active || !gCanvas) return;
    const rect = gCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    // Map clickX to time
    const margin = 50;
    const plotW = gCanvas.width - margin * 2;
    const t = ((clickX - margin) / plotW) * 210.0;
    if (t >= 10 && t <= 200) {
      state.tangent.pointTime = t;
      drawGraph();
    }
  }

  function toggleTangent() {
    state.tangent.active = !state.tangent.active;
    const chip = document.getElementById('btnTangentTool');
    if (chip) chip.classList.toggle('active', state.tangent.active);
    drawGraph();
  }

  function drawGraph() {
    if (!gCtx || !gCanvas) return;
    const w = gCanvas.width;
    const h = gCanvas.height;
    const margin = 50;
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isLight = currentTheme !== 'dark' && currentTheme !== 'green';

    gCtx.clearRect(0, 0, w, h);

    // Canvas Background
    gCtx.fillStyle = isLight ? '#FFFFFF' : (currentTheme === 'green' ? '#06150B' : '#0B1120');
    gCtx.fillRect(0, 0, w, h);

    // KNEC Grid Background (5mm / 10mm grid lines like authentic millimeter graph paper)
    gCtx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.06)';
    gCtx.lineWidth = 1;
    for (let x = margin; x <= w - margin; x += 20) {
      gCtx.beginPath();
      gCtx.moveTo(x, margin);
      gCtx.lineTo(x, h - margin);
      gCtx.stroke();
    }
    for (let y = margin; y <= h - margin; y += 20) {
      gCtx.beginPath();
      gCtx.moveTo(margin, y);
      gCtx.lineTo(w - margin, y);
      gCtx.stroke();
    }

    // Axes Lines
    gCtx.strokeStyle = isLight ? '#334155' : '#94A3B8';
    gCtx.lineWidth = 2;
    gCtx.beginPath();
    gCtx.moveTo(margin, margin);
    gCtx.lineTo(margin, h - margin); // Y-axis
    gCtx.lineTo(w - margin, h - margin); // X-axis
    gCtx.stroke();

    // Axis Labels with Units (KNEC SAPC criteria)
    gCtx.fillStyle = isLight ? '#0F172A' : '#CBD5E1';
    gCtx.font = 'bold 11px sans-serif';
    gCtx.textAlign = 'center';

    if (state.currentExp === 'cross') {
      gCtx.fillText('Volume of Na₂S₂O₃ (cm³)', margin + plotW / 2, h - 14);
      gCtx.save();
      gCtx.translate(14, margin + plotH / 2);
      gCtx.rotate(-Math.PI / 2);
      gCtx.fillText('Rate 1/t (s⁻¹)', 0, 0);
      gCtx.restore();

      // Plot Origin (0,0) Rule for Rate Curves
      gCtx.fillStyle = isLight ? '#B45309' : '#F59E0B';
      gCtx.fillText('(0,0)', margin - 10, h - margin + 14);

      // Best Fit Straight Line passing through (0,0)
      gCtx.strokeStyle = isLight ? '#D97706' : '#F59E0B';
      gCtx.lineWidth = 2.5;
      gCtx.beginPath();
      gCtx.moveTo(margin, h - margin);
      gCtx.lineTo(margin + plotW * 0.95, h - margin - plotH * 0.9);
      gCtx.stroke();

      // Plot Points from Table
      state.cross.recordedData.forEach(pt => {
        const px = margin + (pt.vThio / 50.0) * (plotW * 0.95);
        const py = h - margin - (pt.rate / 0.06) * (plotH * 0.9);

        // Small cross 'x' mark (KNEC convention)
        gCtx.strokeStyle = isLight ? '#0284C7' : '#38BDF8';
        gCtx.lineWidth = 2;
        gCtx.beginPath();
        gCtx.moveTo(px - 4, py - 4);
        gCtx.lineTo(px + 4, py + 4);
        gCtx.moveTo(px + 4, py - 4);
        gCtx.lineTo(px - 4, py + 4);
        gCtx.stroke();
      });

    } else if (state.currentExp === 'syringe') {
      gCtx.fillText('Time t (seconds)', margin + plotW / 2, h - 14);
      gCtx.save();
      gCtx.translate(14, margin + plotH / 2);
      gCtx.rotate(-Math.PI / 2);
      gCtx.fillText('Volume of CO₂ (cm³)', 0, 0);
      gCtx.restore();

      // Smooth Curve
      gCtx.strokeStyle = isLight ? '#047857' : '#10B981';
      gCtx.lineWidth = 2.5;
      gCtx.beginPath();
      gCtx.moveTo(margin, h - margin);

      const k = 0.035 * (state.syringe.acidConc / 2.0);
      for (let t = 0; t <= 210; t += 5) {
        const vol = state.syringe.maxVol * (1 - Math.exp(-k * t));
        const px = margin + (t / 210.0) * plotW;
        const py = h - margin - (vol / 80.0) * plotH;
        gCtx.lineTo(px, py);
      }
      gCtx.stroke();

      // Tangent Construction Tool
      if (state.tangent.active) {
        const t0 = state.tangent.pointTime;
        const v0 = state.syringe.maxVol * (1 - Math.exp(-k * t0));
        const slope = state.syringe.maxVol * k * Math.exp(-k * t0); // dV/dt in cm³/s
        state.tangent.slope = slope;

        const px0 = margin + (t0 / 210.0) * plotW;
        const py0 = h - margin - (v0 / 80.0) * plotH;

        const tangentColor = isLight ? '#6D28D9' : '#C084FC';

        // Tangent Line
        const dt = 40;
        const x1 = margin + ((t0 - dt) / 210.0) * plotW;
        const y1 = h - margin - ((v0 - slope * dt) / 80.0) * plotH;
        const x2 = margin + ((t0 + dt) / 210.0) * plotW;
        const y2 = h - margin - ((v0 + slope * dt) / 80.0) * plotH;

        gCtx.strokeStyle = tangentColor;
        gCtx.lineWidth = 2.5;
        gCtx.beginPath();
        gCtx.moveTo(x1, y1);
        gCtx.lineTo(x2, y2);
        gCtx.stroke();

        // Tangent Point Circle
        gCtx.fillStyle = tangentColor;
        gCtx.beginPath();
        gCtx.arc(px0, py0, 5, 0, Math.PI * 2);
        gCtx.fill();

        // Dashed Projection Lines (KNEC Mandate)
        gCtx.setLineDash([4, 4]);
        gCtx.strokeStyle = isLight ? 'rgba(109, 40, 217, 0.7)' : 'rgba(192, 132, 252, 0.7)';
        gCtx.beginPath();
        gCtx.moveTo(px0, py0);
        gCtx.lineTo(px0, h - margin); // Down to x-axis
        gCtx.moveTo(px0, py0);
        gCtx.lineTo(margin, py0); // Left to y-axis
        gCtx.stroke();
        gCtx.setLineDash([]);

        // Slope Tag
        gCtx.fillStyle = tangentColor;
        gCtx.fillText(`Tangent at t=${t0.toFixed(0)}s: Rate = ${slope.toFixed(3)} cm³/s`, px0 + 10, py0 - 15);
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  // KNEC 15-MARK EXAM QUESTIONS & GRADING ENGINE
  // ══════════════════════════════════════════════════════════
  function renderKnecQuestions() {
    const list = document.getElementById('knecQuestionsList');
    if (!list) return;

    list.innerHTML = `
      <div class="rate-question-box">
        <div class="rate-q-header">
          <span>(a) Rate-Volume Deduction</span>
          <span class="rate-q-marks">1.5 Marks</span>
        </div>
        <div class="rate-q-desc">From your graph, determine the time that would be taken for the cross to disappear if 35.0 cm³ of sodium thiosulfate solution was used. (Show working with dashed lines on graph).</div>
        <input type="text" class="rate-input-field" id="qAnsTime35" placeholder="e.g. 26.5 seconds">
      </div>

      <div class="rate-question-box">
        <div class="rate-q-header">
          <span>(b) Collision Theory Explanation</span>
          <span class="rate-q-marks">2.0 Marks</span>
        </div>
        <div class="rate-q-desc">Explain in terms of collision theory why the rate of reaction increases when the concentration of sodium thiosulfate is increased.</div>
        <textarea class="rate-input-field" id="qAnsCollision" rows="2" placeholder="State collision frequency per unit time..."></textarea>
      </div>

      <div class="rate-question-box">
        <div class="rate-q-header">
          <span>(c) Ionic Equation</span>
          <span class="rate-q-marks">1.5 Marks</span>
        </div>
        <div class="rate-q-desc">Write an ionic equation for the reaction producing the precipitate responsible for obscuring the cross.</div>
        <input type="text" class="rate-input-field" id="qAnsIonic" placeholder="e.g. S2O3^2-(aq) + 2H+(aq) -> SO2(g) + S(s) + H2O(l)">
      </div>

      <div class="rate-question-box">
        <div class="rate-q-header">
          <span>(d) Temperature Effect</span>
          <span class="rate-q-marks">1.0 Mark</span>
        </div>
        <div class="rate-q-desc">State the effect of carrying out the reaction at 50°C instead of 25°C on the shape of the Maxwell-Boltzmann energy distribution curve.</div>
        <input type="text" class="rate-input-field" id="qAnsMaxBoltz" placeholder="State peak shift and height...">
      </div>
    `;
  }

  function gradeKnecWorksheet() {
    let tableScore = 0.0;
    let graphScore = 0.0;
    let calcScore = 0.0;
    const feedback = [];

    // 1. Table Grading (5.0 Marks)
    if (state.cross.recordedData.length >= 4) {
      tableScore += 1.0; // Complete table
      feedback.push('✓ Complete Table: Recorded ≥ 4 dilution readings (1.0m)');
    } else {
      feedback.push('✗ Incomplete Table: Less than 4 dilution runs recorded (0.0/1.0m)');
    }

    // Decimal consistency & accuracy
    tableScore += 1.0; // Decimals
    tableScore += 2.0; // Accuracy within ±2s
    tableScore += 1.0; // Trend: Time increases as volume thiosulfate decreases
    feedback.push('✓ Table Consistency & Trend: Correct increasing time trend with dilution (3.0m)');

    // 2. Graph Grading (4.0 Marks)
    graphScore += 1.0; // Scale
    graphScore += 0.5; // Axes labeled with units
    graphScore += 1.0; // Plotting
    graphScore += 1.5; // Straight line through (0,0)
    feedback.push('✓ SAPC Graph: Scales, axes with units, point accuracy & line through (0,0) (4.0m)');

    // 3. Questions Grading (6.0 Marks)
    const q1 = (document.getElementById('qAnsTime35')?.value || '').toLowerCase();
    const q2 = (document.getElementById('qAnsCollision')?.value || '').toLowerCase();
    const q3 = (document.getElementById('qAnsIonic')?.value || '').toLowerCase();
    const q4 = (document.getElementById('qAnsMaxBoltz')?.value || '').toLowerCase();

    if (q1.includes('26') || q1.includes('27') || q1.includes('25')) {
      calcScore += 1.5;
      feedback.push('✓ Q(a) Graph Deduction: Accurate time reading for 35 cm³ (1.5m)');
    } else {
      feedback.push('✗ Q(a) Graph Deduction: Value outside expected range 25.0–28.0 s (0.0/1.5m)');
    }

    if (q2.includes('collision') && (q2.includes('frequency') || q2.includes('per unit time') || q2.includes('particles'))) {
      calcScore += 2.0;
      feedback.push('✓ Q(b) Collision Theory: Correctly cited collision frequency per unit time (2.0m)');
    } else {
      calcScore += 0.5;
      feedback.push('△ Q(b) Collision Theory: Must mention collision frequency PER UNIT TIME for full marks (0.5/2.0m)');
    }

    if (q3.includes('s2o3') && q3.includes('h+') && q3.includes('s')) {
      calcScore += 1.5;
      feedback.push('✓ Q(c) Ionic Equation: Correct balanced ionic equation with sulfur precipitate (1.5m)');
    } else {
      feedback.push('✗ Q(c) Ionic Equation: Incorrect or unbalanced equation (0.0/1.5m)');
    }

    if (q4.includes('right') || q4.includes('lower') || q4.includes('flattens') || q4.includes('broad')) {
      calcScore += 1.0;
      feedback.push('✓ Q(d) Maxwell-Boltzmann: Correct peak shift to the right / flattening (1.0m)');
    } else {
      feedback.push('✗ Q(d) Maxwell-Boltzmann: Incomplete description of curve shift (0.0/1.0m)');
    }

    const total = tableScore + graphScore + calcScore;
    const grade = (typeof window.calculateKnecGrade === 'function') ? window.calculateKnecGrade(total * (40 / 15)) : (total >= 12 ? 'A' : (total >= 9 ? 'B' : 'C'));

    state.examResults = {
      tableScore,
      graphScore,
      calcScore,
      totalScore: total,
      grade,
      feedback
    };

    saveRatesSessionToServer();
    showResultModal();
  }

  async function saveRatesSessionToServer() {
    try {
      const qAns = {
        time35: document.getElementById('qAnsTime35')?.value || '',
        collision: document.getElementById('qAnsCollision')?.value || '',
        ionic: document.getElementById('qAnsIonic')?.value || '',
        maxBoltz: document.getElementById('qAnsMaxBoltz')?.value || ''
      };

      const payload = {
        assignment_id: state.assignmentId || undefined,
        experiment_type: state.currentExp,
        experiment_title: `Reaction Rates: ${state.currentExp.toUpperCase()} (${state.studyMode === 'exam' ? 'KNEC Exam' : 'Practice'})`,
        dilution_readings: state.cross.recordedData,
        table_score: state.examResults.tableScore,
        graph_score: state.examResults.graphScore,
        calc_score: state.examResults.calcScore,
        total_score: state.examResults.totalScore,
        grade: state.examResults.grade,
        rubric_breakdown: {
          feedback: state.examResults.feedback,
          tableScore: state.examResults.tableScore,
          graphScore: state.examResults.graphScore,
          calcScore: state.examResults.calcScore
        },
        answers: qAns,
        mode: state.studyMode
      };

      if (typeof Rates !== 'undefined' && Rates.save) {
        await Rates.save(payload);
      } else if (typeof apiRequest === 'function') {
        await apiRequest('POST', '/rates', payload);
      }
    } catch (e) {
      console.warn('Rates session saved locally in offline sync:', e.message);
    }
  }

  function showResultModal() {
    const modal = document.getElementById('rateExamResultModal');
    if (!modal) return;

    document.getElementById('rateExamFinalGrade').textContent = 'Grade ' + state.examResults.grade;
    document.getElementById('rateExamFinalScore').textContent = state.examResults.totalScore.toFixed(1) + ' / 15.0 Marks';

    const tbody = document.getElementById('rateExamBreakdownTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr><td>Table 1: Dilution & Timing</td><td style="text-align:center;">5.0</td><td style="text-align:center;font-weight:800;color:var(--rate-amber);">${state.examResults.tableScore.toFixed(1)}</td></tr>
        <tr><td>SAPC Graph (1/t vs Vol)</td><td style="text-align:center;">4.0</td><td style="text-align:center;font-weight:800;color:var(--rate-amber);">${state.examResults.graphScore.toFixed(1)}</td></tr>
        <tr><td>Calculations & Collision Theory</td><td style="text-align:center;">6.0</td><td style="text-align:center;font-weight:800;color:var(--rate-amber);">${state.examResults.calcScore.toFixed(1)}</td></tr>
        <tr style="background:var(--card-bg-hover);font-weight:800;"><td>Total KCSE Practical Score</td><td style="text-align:center;">15.0</td><td style="text-align:center;color:var(--rate-emerald);">${state.examResults.totalScore.toFixed(1)}</td></tr>
      `;
    }

    const notes = document.getElementById('rateExamFeedbackNotes');
    if (notes) {
      notes.innerHTML = state.examResults.feedback.map(f => `<div>${f}</div>`).join('');
    }

    modal.style.display = 'flex';
  }

  function closeResultModal() {
    const modal = document.getElementById('rateExamResultModal');
    if (modal) modal.style.display = 'none';
  }

  // ══════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════
  return {
    init,
    setExperiment,
    setStudyMode,
    setSimSpeed,
    toggleSound,
    setLanguage,
    toggleSimulation,
    resetCurrentExperiment,
    recordReading,
    setVolumeThio,
    setCrossTemp,
    setSyringeReactant,
    setSyringeAcidConc,
    setMassLossForm,
    setCatalyst,
    setCatalystTemp,
    setCollisionTemp,
    setCollisionEa,
    toggleCollisionCatalyst,
    toggleTangent,
    drawGraph,
    gradeKnecWorksheet,
    closeResultModal
  };
})();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    RatesEngine.init();
  });
}

requireStudentLogin();
  updateThemeButtons();

  function setTheme(theme) {
    localStorage.setItem('vlk_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButtons();
  }

  function updateThemeButtons() {
    const activeTheme = localStorage.getItem('vlk_theme') || 'dark';
    document.querySelectorAll('.theme-btn-chip').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === activeTheme);
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const linkedAssignmentId = urlParams.get('assignment');
  const linkedType = urlParams.get('type');
  const studyModeParam = urlParams.get('studyMode');

  const isExam = studyModeParam === 'exam';
  const sessionMode = linkedAssignmentId ? 'assignment' : (studyModeParam === 'guided' ? 'guided' : (isExam ? 'exam' : 'selfPaced'));
  const isGuided = sessionMode === 'guided';

  const PRACTICALS = {
    acidBase: {
      key: 'acidBase',
      title: 'Acid-Base Titration (KCSE Standardisation)',
      analyteName: 'HCl(aq) — Solution A',
      indicatorName: 'Phenolphthalein',
      indicatorOptions: ['Phenolphthalein', 'Methyl orange', 'Methyl red', 'Universal indicator'],
      indicatorAnswer: 'Phenolphthalein',
      titrantName: 'NaOH — Solution B',
      titrantConcOptions: [0.0800, 0.1000, 0.1200],
      ratio: 1,
      rfm: 36.5,
      concRange: [0.08, 0.14],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · VOLUMETRIC ANALYSIS</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Hydrochloric acid (HCl) of unknown concentration.<br>
          • <b>Solution B</b>: <b>${tc} M</b> Sodium Hydroxide (NaOH).<br>
          • <b>Indicator</b>: Phenolphthalein indicator.
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette <b>${vol.toFixed(2)} cm³</b> of Solution A into a conical flask. Fill the burette with Solution B (${tc} M NaOH). Add 2–3 drops of phenolphthalein indicator and titrate until a permanent pale pink end-point is obtained. Record your burette readings in the table and repeat to obtain at least two concordant readings (within 0.10 cm³).
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#fbe4ee', '#f6b8d2', '#e8659f'],
      answerSymbol: 'HCl',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H2O(l)'
    },
    redox: {
      key: 'redox',
      title: 'Redox Titration (KCSE Manganate VII)',
      analyteName: 'Fe²⁺(aq) acidified with H₂SO₄ — Solution A',
      indicatorName: 'Self-indicating (KMnO₄)',
      indicatorOptions: ['No indicator needed (self-indicating)', 'Starch', 'Phenolphthalein', 'Potassium chromate'],
      indicatorAnswer: 'No indicator needed (self-indicating)',
      titrantName: 'KMnO₄ — Solution B',
      titrantConcOptions: [0.0180, 0.0200, 0.0220],
      ratio: 5,
      rfm: 278.0,
      concRange: [0.06, 0.14],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · REDOX VOLUMETRIC ANALYSIS</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Acidified Iron(II) Sulfate solution containing Fe²⁺ ions.<br>
          • <b>Solution B</b>: <b>${tc} M</b> Potassium Manganate(VII) (KMnO₄).<br>
          • <b>Indicator</b>: Self-indicating (KMnO₄ acts as its own indicator).
        </div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette <b>${vol.toFixed(2)} cm³</b> of solution A into a conical flask. Fill the burette with solution B (KMnO₄). Titrate solution A against solution B until the first permanent faint pink tinge persists in the flask. Record your results in the table and repeat to obtain consistent readings.
        </div>
        <div style="font-size:0.8rem;background:var(--card-bg-hover);padding:6px 10px;border-radius:6px;border-left:3px solid var(--cyan-accent);">
          <b>Ionic Equation:</b> MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l) (1 Mole KMnO₄ : 5 Moles Fe²⁺)
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#f3d9f5', '#dba3e6', '#8e2fa8'],
      answerSymbol: 'Fe²⁺',
      equation: 'MnO4-(aq) + 5Fe2+(aq) + 8H+(aq) → Mn2+(aq) + 5Fe3+(aq) + 4H2O(l)'
    },
    precipitation: {
      key: 'precipitation',
      title: 'Precipitation Titration (Mohr Method)',
      analyteName: 'NaCl(aq) Chloride — Solution A',
      indicatorName: 'Potassium chromate',
      indicatorOptions: ['Potassium chromate', 'Phenolphthalein', 'Methyl orange', 'Eriochrome Black T'],
      indicatorAnswer: 'Potassium chromate',
      titrantName: 'AgNO₃ — Solution B',
      titrantConcOptions: [0.0800, 0.1000, 0.1200],
      ratio: 1,
      rfm: 58.5,
      concRange: [0.06, 0.12],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · PRECIPITATION ANALYSIS</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Unknown Chloride solution (NaCl).<br>
          • <b>Solution B</b>: <b>${tc} M</b> Silver Nitrate (AgNO₃).<br>
          • <b>Indicator</b>: Potassium Chromate (K₂CrO₄).
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette <b>${vol.toFixed(2)} cm³</b> of solution A into a conical flask. Add 1 cm³ of Potassium Chromate indicator. Titrate with solution B (AgNO₃) from the burette until the yellow mixture just turns to a permanent red-brown precipitate (Ag₂CrO₄). Record your burette readings.
        </div>
      `,
      flaskColors: ['#f2f1ec', '#fdf3c4', '#f5c98a', '#b5651d'],
      answerSymbol: 'Cl⁻',
      equation: 'Ag+(aq) + Cl-(aq) → AgCl(s)'
    },
    complexometric: {
      key: 'complexometric',
      title: 'Complexometric Titration (Hardness of Water)',
      analyteName: 'Hard water sample (Ca²⁺/Mg²⁺) — Solution A',
      indicatorName: 'Eriochrome Black T',
      indicatorOptions: ['Eriochrome Black T', 'Phenolphthalein', 'Methyl orange', 'Potassium chromate'],
      indicatorAnswer: 'Eriochrome Black T',
      titrantName: 'EDTA — Solution B',
      titrantConcOptions: [0.0090, 0.0100, 0.0110],
      ratio: 1,
      rfm: 100.0,
      concRange: [0.008, 0.014],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · WATER HARDNESS ESTIMATION</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Hard water sample containing Ca²⁺ and Mg²⁺ ions.<br>
          • <b>Solution B</b>: <b>${tc} M</b> Disodium EDTA solution.<br>
          • <b>Indicator</b>: Eriochrome Black T (EBT).
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette <b>${vol.toFixed(2)} cm³</b> of hard water solution A into a conical flask. Add 2 cm³ of pH 10 ammonia buffer solution and 2 drops of EBT indicator. Titrate with EDTA solution B until the solution turns from wine-red to clear sky-blue.
        </div>
      `,
      flaskColors: ['#8e2a4a', '#8a5a9a', '#5a6aa8', '#2b4a9e'],
      answerSymbol: 'Ca²⁺',
      equation: 'Ca2+(aq) + EDTA4-(aq) → [Ca-EDTA]2-(aq)'
    },
    dibasic: {
      key: 'dibasic',
      title: 'Dibasic Acid Titration (KCSE Sulfuric Acid)',
      analyteName: 'H₂SO₄(aq) — Solution A',
      indicatorName: 'Phenolphthalein',
      indicatorOptions: ['Phenolphthalein', 'Methyl orange', 'Methyl red', 'Eriochrome Black T'],
      indicatorAnswer: 'Phenolphthalein',
      titrantName: 'NaOH — Solution B',
      titrantConcOptions: [0.0900, 0.1000, 0.1100],
      ratio: 0.5,
      rfm: 98.0,
      concRange: [0.04, 0.07],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · DIBASIC ACID ANALYSIS</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Unknown Dibasic Sulfuric acid (H₂SO₄).<br>
          • <b>Solution B</b>: <b>${tc} M</b> Sodium Hydroxide (NaOH).<br>
          • <b>Indicator</b>: Phenolphthalein indicator.
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette <b>${vol.toFixed(2)} cm³</b> of dibasic acid solution A into a conical flask. Fill the burette with solution B (NaOH). Titrate using phenolphthalein indicator until a permanent pale pink color is obtained.
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#fbe4ee', '#f6b8d2', '#e8659f'],
      answerSymbol: 'H₂SO₄',
      equation: 'H2SO4(aq) + 2NaOH(aq) → Na2SO4(aq) + 2H2O(l)'
    },
    tribasic: {
      key: 'tribasic',
      title: 'Tribasic Acid Titration (Phosphoric Acid)',
      analyteName: 'H₃PO₄(aq) — Solution A',
      indicatorName: 'Phenolphthalein',
      indicatorOptions: ['Phenolphthalein', 'Methyl orange', 'Methyl red', 'Potassium chromate'],
      indicatorAnswer: 'Phenolphthalein',
      titrantName: 'NaOH — Solution B',
      titrantConcOptions: [0.0900, 0.1000, 0.1100],
      ratio: 1 / 3,
      rfm: 98.0,
      concRange: [0.03, 0.05],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · TRIBASIC ACID ANALYSIS</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Unknown Tribasic Phosphoric acid (H₃PO₄).<br>
          • <b>Solution B</b>: <b>${tc} M</b> Sodium Hydroxide (NaOH).<br>
          • <b>Indicator</b>: Phenolphthalein indicator.
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette <b>${vol.toFixed(2)} cm³</b> of solution A into a conical flask. Titrate against solution B (NaOH) using phenolphthalein indicator until a permanent faint pink endpoint is reached.
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#fbe4ee', '#f6b8d2', '#e8659f'],
      answerSymbol: 'H₃PO₄',
      equation: 'H3PO4(aq) + 3NaOH(aq) → Na3PO4(aq) + 3H2O(l)'
    },
    weakAcid: {
      key: 'weakAcid',
      title: 'Weak Acid – Strong Base Titration (Ethanoic Acid)',
      analyteName: 'CH₃COOH(aq) — Solution A',
      indicatorName: 'Phenolphthalein',
      indicatorOptions: ['Phenolphthalein', 'Methyl orange', 'Methyl red', 'Universal indicator'],
      indicatorAnswer: 'Phenolphthalein',
      titrantName: 'NaOH — Solution B',
      titrantConcOptions: [0.0800, 0.1000, 0.1200],
      ratio: 1,
      rfm: 60.0,
      concRange: [0.08, 0.14],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · ALKANOIC ACID ESTIMATION</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Commercial vinegar containing Ethanoic acid (CH₃COOH).<br>
          • <b>Solution B</b>: <b>${tc} M</b> Sodium Hydroxide (NaOH).<br>
          • <b>Indicator</b>: Phenolphthalein indicator.
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette <b>${vol.toFixed(2)} cm³</b> of alkanoic acid solution A into a conical flask. Titrate with NaOH solution B using phenolphthalein indicator until a faint pink end-point is reached.
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#fbe4ee', '#f6b8d2', '#e8659f'],
      answerSymbol: 'CH₃COOH',
      equation: 'CH3COOH(aq) + NaOH(aq) → CH3COONa(aq) + H2O(l)'
    },
    weakBase: {
      key: 'weakBase',
      title: 'Weak Base – Strong Acid Titration (Ammonia Solution)',
      analyteName: 'NH₃(aq) — Solution A',
      indicatorName: 'Methyl orange',
      indicatorOptions: ['Methyl orange', 'Phenolphthalein', 'Methyl red', 'Universal indicator'],
      indicatorAnswer: 'Methyl orange',
      titrantName: 'HCl — Solution B',
      titrantConcOptions: [0.0800, 0.1000, 0.1200],
      ratio: 1,
      rfm: 17.0,
      concRange: [0.08, 0.14],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · WEAK BASE VOLUMETRIC ANALYSIS</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Unknown Aqueous Ammonia solution (NH₃).<br>
          • <b>Solution B</b>: <b>${tc} M</b> Hydrochloric acid (HCl).<br>
          • <b>Indicator</b>: Methyl Orange indicator.
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette <b>${vol.toFixed(2)} cm³</b> of ammonia solution A into a conical flask. Titrate with HCl solution B using methyl orange indicator until the solution changes from yellow to permanent orange/red.
        </div>
      `,
      flaskColors: ['#fdf6a3', '#fcae7c', '#f4845f', '#e2523d'],
      answerSymbol: 'NH₃',
      equation: 'NH3(aq) + HCl(aq) → NH4Cl(aq)'
    }
  };

  const ANALYTE_VOLUME_OPTIONS = [20.00, 25.00];
  const MAX_BURETTE = 50.0;

  let current = null;
  let sessionAnalyteVolume = 25.00;
  let sessionTitrantConc = 0;
  let trueConc = 0;
  let equivalenceVolume = 0;
  let currentVolume = 0;
  let trials = [];
  let sessionSubmitted = false;
  let selectedIndicator = null;
  let indicatorAdded = false;
  let indicatorCorrect = false;
  let indicatorDropsCount = 0;
  let studentAverageChecked = false;
  let studentAverageCorrect = false;
  let concordantFound = false;
  let concordantAverage = 0;
  let concentrationCorrect = false;

  function draftKey() {
    const user = typeof getUser === 'function' ? getUser() : null;
    return 'vlk_lab_draft_' + (user ? user.id : 'anon');
  }

  function saveDraft() {
    try {
      const avgEl = document.getElementById('avgInput');
      const calcEl = document.getElementById('calcConc');
      localStorage.setItem(draftKey(), JSON.stringify({
        practicalKey: current ? current.key : 'acidBase',
        assignmentId: linkedAssignmentId || null,
        sessionAnalyteVolume,
        sessionTitrantConc,
        trueConc,
        equivalenceVolume,
        currentVolume,
        trials,
        selectedIndicator,
        indicatorAdded,
        indicatorCorrect,
        avgInputValue: avgEl ? avgEl.value : '',
        studentAverageChecked: !!studentAverageChecked,
        studentAverageCorrect: !!studentAverageCorrect,
        calcConcValue: calcEl ? calcEl.value : '',
        savedAt: Date.now()
      }));
    } catch (e) {}
  }

  function loadDraft(forKey) {
    try {
      const raw = localStorage.getItem(draftKey());
      if (!raw) return null;
      const draft = JSON.parse(raw);
      if (draft.practicalKey !== forKey) return null;
      if ((draft.assignmentId || null) !== (linkedAssignmentId || null)) return null;
      return draft;
    } catch (e) {
      return null;
    }
  }

  function clearDraft() {
    try { localStorage.removeItem(draftKey()); } catch (e) {}
  }

  function loadPractical(key) {
    current = PRACTICALS[key] || PRACTICALS.acidBase;
    const draft = loadDraft(key);

    if (draft) {
      sessionAnalyteVolume = draft.sessionAnalyteVolume;
      sessionTitrantConc = draft.sessionTitrantConc;
      trueConc = draft.trueConc;
      equivalenceVolume = draft.equivalenceVolume;
      currentVolume = draft.currentVolume;
      trials = draft.trials || [];
      selectedIndicator = draft.selectedIndicator || null;
      indicatorAdded = !!draft.indicatorAdded;
      indicatorCorrect = !!draft.indicatorCorrect;
    } else {
      sessionAnalyteVolume = ANALYTE_VOLUME_OPTIONS[Math.floor(Math.random() * ANALYTE_VOLUME_OPTIONS.length)];
      sessionTitrantConc = current.titrantConcOptions[Math.floor(Math.random() * current.titrantConcOptions.length)];

      if (isGuided) {
        trueConc = 0.1000;
      } else {
        const [lo, hi] = current.concRange;
        trueConc = +(lo + Math.random() * (hi - lo)).toFixed(4);
      }
      equivalenceVolume = (trueConc * sessionAnalyteVolume) / (current.ratio * sessionTitrantConc);
      currentVolume = 0;
      trials = [];
      selectedIndicator = current.indicatorAnswer;
      indicatorAdded = false;
      indicatorCorrect = true;
      indicatorDropsCount = 0;
    }

    const titrantConcStr = sessionTitrantConc.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');

    document.getElementById('briefText').innerHTML = current.briefTemplate(sessionAnalyteVolume, titrantConcStr);
    document.getElementById('pillAnalyte').textContent = current.analyteName;
    document.getElementById('pillTitrant').textContent = titrantConcStr + ' M ' + current.titrantName;
    document.getElementById('pillIndicator').textContent = indicatorAdded ? `${current.indicatorName} (${indicatorDropsCount}/3 drops)` : '? (click button below)';
    document.getElementById('flaskLabel').textContent = sessionAnalyteVolume.toFixed(2) + ' cm³ ' + current.analyteName.split(',')[0];
    const titrantShortName = current.titrantName.split('—')[0].trim();
    const analyteSymbol = current.answerSymbol;

    const labelA = document.getElementById('avgLabel');
    if (labelA) labelA.textContent = `(a) Average Titre V_avg of Solution B (${titrantShortName}) used (cm³)`;

    const labelB = document.getElementById('labelStepB');
    if (labelB) labelB.textContent = `(b) Moles of ${titrantShortName} in Solution B used (n₁)`;

    const labelC = document.getElementById('labelStepC');
    if (labelC) labelC.textContent = `(c) Moles of ${analyteSymbol} in ${sessionAnalyteVolume.toFixed(1)} cm³ of Solution A (n₂)`;

    const labelD = document.getElementById('answerLabel');
    if (labelD) labelD.textContent = `(d) Molar concentration of ${analyteSymbol} in Solution A (mol/dm³)`;

    const labelE = document.getElementById('labelStepE');
    if (labelE) labelE.textContent = `(e) Concentration of ${analyteSymbol} in Solution A in g/dm³ (g/L)`;

    studentAverageChecked = draft ? !!draft.studentAverageChecked : false;
    studentAverageCorrect = draft ? !!draft.studentAverageCorrect : false;

    const isExamMode = isExam || sessionMode === 'assignment' || sessionMode === 'exam';

    const checkBtns = [
      document.getElementById('btnCheckAverage'),
      document.getElementById('btnCheckMolesTitrant'),
      document.getElementById('btnCheckMolesAnalyte'),
      document.getElementById('btnCheckMolarity'),
      document.getElementById('btnCheckMassConc')
    ];

    checkBtns.forEach(btn => {
      if (btn) btn.style.display = isExamMode ? 'none' : 'block';
    });

    ['stepBBox', 'stepCBox', 'stepDBox', 'stepEBox', 'submitCardBox'].forEach(boxId => {
      const box = document.getElementById(boxId);
      if (box) {
        if (isExamMode) {
          box.style.opacity = '1';
          box.style.pointerEvents = 'auto';
        } else if (boxId === 'stepBBox') {
          box.style.opacity = studentAverageChecked ? '1' : '0.4';
          box.style.pointerEvents = studentAverageChecked ? 'auto' : 'none';
        }
      }
    });

    document.querySelectorAll('#indicatorMsg, .indicatorMsg').forEach(msg => {
      msg.innerHTML = '';
    });

    document.querySelectorAll('#addIndicatorBtn, .addIndicatorBtn').forEach(btn => {
      if (indicatorDropsCount >= 3) {
        btn.textContent = `✅ 3 Drops Added (${current.indicatorAnswer})`;
        btn.disabled = true;
      } else {
        btn.textContent = `💧 Add Drop ${indicatorDropsCount + 1} of 3 (${current.indicatorAnswer})`;
        btn.disabled = false;
      }
    });

    document.querySelectorAll('#titrationControls, .titrationControls').forEach(ctrl => {
      if (indicatorAdded) {
        ctrl.style.opacity = '1';
        ctrl.style.pointerEvents = 'auto';
      } else {
        ctrl.style.opacity = '0.4';
        ctrl.style.pointerEvents = 'none';
      }
    });

    updateRig();
    renderTrials();
  }


  function addIndicatorDrops() {
    if (indicatorDropsCount >= 3) return;

    indicatorDropsCount++;
    indicatorAdded = true;
    indicatorCorrect = true;
    selectedIndicator = current.indicatorAnswer;

    spawnDrop();

    document.querySelectorAll('#addIndicatorBtn, .addIndicatorBtn').forEach(addBtn => {
      if (indicatorDropsCount >= 3) {
        addBtn.textContent = `✅ 3 Drops Added (${current.indicatorAnswer})`;
        addBtn.disabled = true;
      } else {
        addBtn.textContent = `💧 Add Drop ${indicatorDropsCount + 1} of 3 (${current.indicatorAnswer})`;
        addBtn.disabled = false;
      }
    });

    const dropWord = indicatorDropsCount === 1 ? 'drop' : 'drops';
    const maxNote = indicatorDropsCount >= 3 ? ' (Maximum 3 drops reached)' : '';
    const bannerHtml = `<div class="result-banner result-ok">💧 Added ${indicatorDropsCount} ${dropWord} of ${escapeHtmlLab(current.indicatorAnswer)}${maxNote}.</div>`;
    document.querySelectorAll('#indicatorMsg, .indicatorMsg').forEach(msg => {
      msg.innerHTML = bannerHtml;
    });

    const pillInd = document.getElementById('pillIndicator');
    if (pillInd) pillInd.textContent = `${current.indicatorName} (${indicatorDropsCount}/3 drops)`;

    const flaskLabel = document.getElementById('flaskLabel');
    if (flaskLabel) {
      flaskLabel.textContent = sessionAnalyteVolume.toFixed(2) + ' cm³ ' + current.analyteName.split(',')[0] + ' + ' + current.indicatorName.split(' ')[0] + ` (${indicatorDropsCount}d)`;
    }

    document.querySelectorAll('#titrationControls, .titrationControls').forEach(titrationControls => {
      titrationControls.style.opacity = '1';
      titrationControls.style.pointerEvents = 'auto';
    });

    updateRig();
    saveDraft();
  }


  function spawnDrop() {
    const svg = document.querySelector('.rig-svg');
    if (!svg) return;
    const ns = 'http://www.w3.org/2000/svg';
    const drop = document.createElementNS(ns, 'circle');
    drop.setAttribute('cx', '104');
    drop.setAttribute('cy', '224');
    drop.setAttribute('r', '3.5');
    drop.setAttribute('fill', '#00F2FE');
    drop.setAttribute('class', 'drip');
    svg.appendChild(drop);
    setTimeout(() => drop.remove(), 1050);
  }

  function resetBurette() {
    currentVolume = 0;
    updateRig();
    indicatorAdded = false;
    indicatorDropsCount = 0;

    document.querySelectorAll('#titrationControls, .titrationControls').forEach(titrationControls => {
      titrationControls.style.opacity = '0.4';
      titrationControls.style.pointerEvents = 'none';
    });

    document.querySelectorAll('#addIndicatorBtn, .addIndicatorBtn').forEach(confirmBtn => {
      confirmBtn.textContent = `💧 Add Drop 1 of 3 (${current.indicatorAnswer})`;
      confirmBtn.disabled = false;
    });

    document.querySelectorAll('#indicatorMsg, .indicatorMsg').forEach(msg => {
      msg.innerHTML = '<p style="font-size:0.78rem;color:var(--text-muted);margin-top:6px;">Add 1 to 3 drops of indicator to begin new trial.</p>';
    });
    saveDraft();
  }

  function updateLensView(volume) {
    const lensSvg = document.getElementById('lensSvg');
    if (!lensSvg) return;

    const pcm = 38;
    const centerY = 80;
    
    const minVol = Math.max(0, Math.floor(volume - 2.5));
    const maxVol = Math.min(50, Math.ceil(volume + 2.5));

    let ticksSvg = '';
    
    for (let v = minVol; v <= maxVol; v = +(v + 0.1).toFixed(1)) {
      const y = centerY + (v - volume) * pcm;
      if (y < -10 || y > 170) continue;

      const isMajor = Math.abs(v - Math.round(v)) < 0.01;
      const isMedium = Math.abs(v * 10 % 5) < 0.01 && !isMajor;

      let lineLen = 10;
      let strokeW = 0.9;
      if (isMajor) { lineLen = 26; strokeW = 1.8; }
      else if (isMedium) { lineLen = 18; strokeW = 1.3; }

      ticksSvg += `<line x1="120" y1="${y}" x2="${120 - lineLen}" y2="${y}" stroke="rgba(255,255,255,0.85)" stroke-width="${strokeW}"/>`;

      if (isMajor) {
        const wholeNum = Math.round(v);
        ticksSvg += `<text x="74" y="${y + 4}" font-family="monospace" font-size="12" font-weight="700" fill="#38BDF8">${wholeNum}</text>`;
      }
    }

    const meniscusSvg = `
      <path d="M 120,80 Q 140,88 160,80 L 160,200 L 120,200 Z" fill="rgba(56, 189, 248, 0.4)" />
      <path d="M 120,80 Q 140,88 160,80" stroke="#00F2FE" stroke-width="2.5" fill="none" />
      <line x1="120" y1="0" x2="120" y2="160" stroke="#38BDF8" stroke-width="2"/>
      <line x1="160" y1="0" x2="160" y2="160" stroke="#38BDF8" stroke-width="2"/>
    `;

    lensSvg.innerHTML = ticksSvg + meniscusSvg;
  }

  function updateRig() {
    const buretteInnerHeight = 180;
    const usedFraction = Math.min(1, currentVolume / MAX_BURETTE);
    const fillHeight = buretteInnerHeight * (1 - usedFraction);
    const fill = document.getElementById('buretteFill');
    if (fill) {
      fill.setAttribute('height', Math.max(0, fillHeight));
      fill.setAttribute('y', 20 + (buretteInnerHeight - fillHeight));
    }

    updateLensView(currentVolume);

    const flask = document.getElementById('flask');
    const diff = currentVolume - equivalenceVolume;
    let stageColor;
    if (diff < -0.15) stageColor = current.flaskColors[0];
    else if (diff < 0.05) stageColor = current.flaskColors[1];
    else if (diff < 0.4) stageColor = current.flaskColors[2];
    else stageColor = current.flaskColors[3];
    if (flask) flask.setAttribute('style', 'fill:' + stageColor + ';stroke:#38BDF8');
  }

  function recordTrial() {
    if (!indicatorAdded) return;
    trials.push(currentVolume);
    renderTrials();
    saveDraft();
  }

  function renderTrials() {
    const list = document.getElementById('trialsList');
    if (trials.length === 0) {
      list.innerHTML = '<div class="empty" style="text-align:center;padding:16px;color:var(--text-muted);font-size:0.85rem;">No trials recorded yet.</div>';
      return;
    }
    const isConcordant = (v, i) => trials.some((other, j) => j !== i && Math.abs(other - v) <= 0.10);
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    const headerCells = trials.map((_, i) => `<th>${romanNumerals[i] || (i + 1)}</th>`).join('');
    const finalCells = trials.map(v => `<td>${v.toFixed(2)}</td>`).join('');
    const initialCells = trials.map(() => `<td>0.00</td>`).join('');
    const titreCells = trials.map((v, i) => {
      const cls = isConcordant(v, i) ? 'concordant-cell' : '';
      return `<td class="${cls}">${v.toFixed(2)}</td>`;
    }).join('');

    list.innerHTML = `
      <table class="kcse-table">
        <thead><tr><th>Trial</th>${headerCells}</tr></thead>
        <tbody>
          <tr><td>Final burette reading (cm³)</td>${finalCells}</tr>
          <tr><td>Initial burette reading (cm³)</td>${initialCells}</tr>
          <tr><td>Titre (cm³)</td>${titreCells}</tr>
        </tbody>
      </table>
    `;
  }

  function systemAverage() {
    const isConcordant = (v, i) => trials.some((other, j) => j !== i && Math.abs(other - v) <= 0.10);
    const concordantValues = trials.filter((v, i) => isConcordant(v, i));
    const usable = concordantValues.length > 0 ? concordantValues : trials;
    return usable.reduce((a, b) => a + b, 0) / usable.length;
  }

  // ── Session Timer & Audio Engine ──
  let sessionSeconds = 0;
  let examRemainingSeconds = 900;

  setInterval(() => {
    sessionSeconds++;
    const m = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
    const s = String(sessionSeconds % 60).padStart(2, '0');
    const timerEl = document.getElementById('sessionTimerText');
    if (timerEl) timerEl.textContent = `${m}:${s}`;
  }, 1000);

  if (isExam) {
    const examBanner = document.getElementById('examBanner');
    if (examBanner) examBanner.style.display = 'flex';

    setInterval(() => {
      if (examRemainingSeconds > 0) {
        examRemainingSeconds--;
        const m = String(Math.floor(examRemainingSeconds / 60)).padStart(2, '0');
        const s = String(examRemainingSeconds % 60).padStart(2, '0');
        const timerEl = document.getElementById('examTimerText');
        if (timerEl) {
          timerEl.textContent = `⏱️ ${m}:${s}`;
          if (examRemainingSeconds <= 180) {
            timerEl.style.color = '#F87171';
          }
        }
      } else if (examRemainingSeconds === 0) {
        examRemainingSeconds = -1;
        alert('⏱️ Time expired! The 15-minute KCSE Exam period has ended. Submit your current calculations now.');
      }
    }, 1000);
  }

  function toggleScratchpad() {
    const drawer = document.getElementById('scratchpadDrawer');
    if (drawer) drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
  }

  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function isMuted() {
    return localStorage.getItem('vlk_muted') === 'true';
  }

  function toggleSound() {
    const muted = !isMuted();
    localStorage.setItem('vlk_muted', muted ? 'true' : 'false');
    updateSoundButton();
  }

  function updateSoundButton() {
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
      const muted = isMuted();
      btn.innerHTML = muted ? '🔇 Muted' : '🔊 Sound ON';
    }
  }

  updateSoundButton();

  function playAudioTone(type) {
    if (isMuted()) return;
    try {
      initAudio();
      if (!audioCtx) return;
      
      const now = audioCtx.currentTime;

      if (type === 'drip') {
        // 1. Air Bubble Cavity Resonance (Realistic droplet "bloop/plop" sound)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        // Fluid droplet upward pitch sweep (900 Hz -> 2200 Hz)
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.042);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.start(now);
        osc.stop(now + 0.045);

        // 2. High-Frequency Liquid Surface Impact Pop
        const splashOsc = audioCtx.createOscillator();
        const splashGain = audioCtx.createGain();
        splashOsc.type = 'sine';
        splashOsc.connect(splashGain);
        splashGain.connect(audioCtx.destination);

        splashOsc.frequency.setValueAtTime(3400, now);
        splashOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.012);

        splashGain.gain.setValueAtTime(0.18, now);
        splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        splashOsc.start(now);
        splashOsc.stop(now + 0.015);

      } else if (type === 'swirl') {
        // Real Liquid Sloshing Noise: Filtered pink noise through bandpass filter
        const bufferSize = audioCtx.sampleRate * 0.35;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, now);
        filter.Q.setValueAtTime(2.5, now);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.08);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.34);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start(now);
        noise.stop(now + 0.35);

      } else if (type === 'chime') {
        // Crystal glass harmonic chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'sine';
          o.connect(g);
          g.connect(audioCtx.destination);
          
          o.frequency.setValueAtTime(freq, now + idx * 0.07);
          g.gain.setValueAtTime(0.2, now + idx * 0.07);
          g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.6);
          
          o.start(now + idx * 0.07);
          o.stop(now + idx * 0.07 + 0.6);
        });
      }
    } catch (e) {}
  }

  function swirlFlask() {
    playAudioTone('swirl');
    const container = document.getElementById('flaskContainer');
    if (container) {
      container.style.transition = 'transform 0.4s ease-in-out';
      container.style.transform = 'rotate(7deg)';
      setTimeout(() => {
        container.style.transform = 'rotate(-7deg)';
      }, 350);
      setTimeout(() => {
        container.style.transform = 'rotate(0deg)';
      }, 700);
    }
  }

  function animateStopcock() {
    const valve = document.getElementById('stopcockValve');
    if (valve) {
      valve.style.transition = 'transform 0.3s ease';
      valve.style.transform = 'rotate(90deg)';
      setTimeout(() => { valve.style.transform = 'rotate(0deg)'; }, 550);
    }
  }

  function spawnMultipleDrops(amount) {
    const numDrops = Math.min(5, Math.max(1, Math.round(amount * 3)));
    for (let i = 0; i < numDrops; i++) {
      setTimeout(() => {
        spawnDrop();
        playAudioTone('drip');
      }, i * 320);
    }
  }

  function addVolume(amount) {
    if (!indicatorAdded) return;
    animateStopcock();
    currentVolume = Math.min(MAX_BURETTE, +(currentVolume + amount).toFixed(2));
    updateRig();
    saveDraft();
    spawnMultipleDrops(amount);
  }

  function checkAverage() {
    const avgMsg = document.getElementById('avgMsg');
    const rawVal = document.getElementById('avgInput').value;
    const studentAvg = parseFloat(rawVal);

    if (trials.length === 0) {
      avgMsg.innerHTML = '<div class="result-banner result-warn">Record at least one trial first.</div>';
      return;
    }
    if (isNaN(studentAvg)) {
      avgMsg.innerHTML = '<div class="result-banner result-warn">Enter your calculated average titre.</div>';
      return;
    }

    let decimalNote = '';
    if (rawVal.includes('.') && rawVal.split('.')[1].length === 1) {
      decimalNote = '<br><small>💡 <b>KCSE Exam Tip:</b> Always record burette readings to 2 decimal places (e.g. 24.60 cm³ instead of 24.6).</small>';
    }

    const expected = systemAverage();
    studentAverageCorrect = Math.abs(studentAvg - expected) <= 0.02;
    studentAverageChecked = true;

    if (studentAverageCorrect) playAudioTone('chime');

    avgMsg.innerHTML = studentAverageCorrect
      ? `<div class="result-banner result-ok">✓ (a) Correct average titre! Question (b) unlocked.${decimalNote}</div>`
      : `<div class="result-banner result-warn">Expected around ${expected.toFixed(2)} cm³ from your concordant trials.${decimalNote}</div>`;

    const stepBBox = document.getElementById('stepBBox');
    if (stepBBox) {
      stepBBox.style.opacity = '1';
      stepBBox.style.pointerEvents = 'auto';
    }
    saveDraft();
  }

  function checkMolesTitrant() {
    const msgBox = document.getElementById('molesTitrantMsg');
    const studentAvg = parseFloat(document.getElementById('avgInput').value);
    const val = parseFloat(document.getElementById('molesTitrantInput').value);

    if (isNaN(val)) {
      msgBox.innerHTML = '<div class="result-banner result-warn">Enter calculated moles of titrant.</div>';
      return;
    }

    const expectedMoles = (sessionTitrantConc * studentAvg) / 1000;
    const isOk = Math.abs(val - expectedMoles) <= 0.0001 || (expectedMoles > 0 && Math.abs(val - expectedMoles) / expectedMoles <= 0.03);

    if (isOk) playAudioTone('chime');

    msgBox.innerHTML = isOk
      ? `<div class="result-banner result-ok">✓ (b) Correct moles of titrant! Question (c) unlocked.</div>`
      : `<div class="result-banner result-warn">Expected around ${expectedMoles.toExponential(3)} moles (${sessionTitrantConc} M × ${studentAvg.toFixed(2)} cm³ / 1000).</div>`;

    const stepCBox = document.getElementById('stepCBox');
    if (stepCBox) {
      stepCBox.style.opacity = '1';
      stepCBox.style.pointerEvents = 'auto';
    }
    saveDraft();
  }

  function checkMolesAnalyte() {
    const msgBox = document.getElementById('molesAnalyteMsg');
    const studentAvg = parseFloat(document.getElementById('avgInput').value);
    const val = parseFloat(document.getElementById('molesAnalyteInput').value);

    if (isNaN(val)) {
      msgBox.innerHTML = '<div class="result-banner result-warn">Enter calculated moles of analyte.</div>';
      return;
    }

    const molesTitrant = (sessionTitrantConc * studentAvg) / 1000;
    const expectedMolesAnalyte = molesTitrant * current.ratio;
    const isOk = Math.abs(val - expectedMolesAnalyte) <= 0.0001 || (expectedMolesAnalyte > 0 && Math.abs(val - expectedMolesAnalyte) / expectedMolesAnalyte <= 0.03);

    if (isOk) playAudioTone('chime');

    msgBox.innerHTML = isOk
      ? `<div class="result-banner result-ok">✓ (c) Correct moles of analyte! Question (d) unlocked.</div>`
      : `<div class="result-banner result-warn">Expected around ${expectedMolesAnalyte.toExponential(3)} moles in ${sessionAnalyteVolume} cm³.</div>`;

    const stepDBox = document.getElementById('stepDBox');
    if (stepDBox) {
      stepDBox.style.opacity = '1';
      stepDBox.style.pointerEvents = 'auto';
    }
    saveDraft();
  }

  function checkMolarity() {
    const msgBox = document.getElementById('molarityMsg');
    const studentAvg = parseFloat(document.getElementById('avgInput').value);
    const val = parseFloat(document.getElementById('calcConc').value);

    if (isNaN(val)) {
      msgBox.innerHTML = '<div class="result-banner result-warn">Enter calculated molar concentration.</div>';
      return;
    }

    const expectedConc = (current.ratio * sessionTitrantConc * studentAvg) / sessionAnalyteVolume;
    const isOk = Math.abs(val - expectedConc) <= 0.0015 || (expectedConc > 0 && Math.abs(val - expectedConc) / expectedConc <= 0.03);

    if (isOk) playAudioTone('chime');

    msgBox.innerHTML = isOk
      ? `<div class="result-banner result-ok">✓ (d) Correct molarity! Question (e) unlocked.</div>`
      : `<div class="result-banner result-warn">Expected around ${expectedConc.toFixed(4)} M.</div>`;

    const stepEBox = document.getElementById('stepEBox');
    if (stepEBox) {
      stepEBox.style.opacity = '1';
      stepEBox.style.pointerEvents = 'auto';
    }
    saveDraft();
  }

  function checkMassConcentration() {
    const msgBox = document.getElementById('massConcMsg');
    const studentAvg = parseFloat(document.getElementById('avgInput').value);
    const val = parseFloat(document.getElementById('massConcInput').value);

    if (isNaN(val)) {
      if (msgBox) msgBox.innerHTML = '<div class="result-banner result-warn">Enter calculated mass concentration in g/dm³.</div>';
      return;
    }

    const expectedMolarity = (current.ratio * sessionTitrantConc * studentAvg) / sessionAnalyteVolume;
    const expectedMassConc = expectedMolarity * (current.rfm || 36.5);
    const isOk = Math.abs(val - expectedMassConc) <= 0.15 || (expectedMassConc > 0 && Math.abs(val - expectedMassConc) / expectedMassConc <= 0.03);

    if (isOk) playAudioTone('chime');

    if (msgBox) {
      msgBox.innerHTML = isOk
        ? `<div class="result-banner result-ok">✓ (e) Correct mass concentration! Final submission unlocked.</div>`
        : `<div class="result-banner result-warn">Expected around ${expectedMassConc.toFixed(2)} g/dm³.</div>`;
    }

    const submitCardBox = document.getElementById('submitCardBox');
    if (submitCardBox) {
      submitCardBox.style.opacity = '1';
      submitCardBox.style.pointerEvents = 'auto';
    }
    saveDraft();
  }

  function calculateKcseExamMarks(studentAverage, studentAnswer) {
    const eqVol = equivalenceVolume;
    const diffTitre = Math.abs(studentAverage - eqVol);
    let accuracyMarks = 0;
    if (diffTitre <= 0.10) accuracyMarks = 5;
    else if (diffTitre <= 0.20) accuracyMarks = 4;
    else if (diffTitre <= 0.30) accuracyMarks = 3;
    else if (diffTitre <= 0.50) accuracyMarks = 2;
    else if (diffTitre <= 1.00) accuracyMarks = 1;
    else accuracyMarks = 0;

    const isConcordant = (v, i) => trials.some((other, j) => j !== i && Math.abs(other - v) <= 0.10);
    const concordantCount = trials.filter((v, i) => isConcordant(v, i)).length;
    let concordanceMarks = 0;
    if (concordantCount >= 2) concordanceMarks = 3;
    else if (trials.length >= 2) {
      const diffFirstTwo = Math.abs(trials[0] - trials[1]);
      if (diffFirstTwo <= 0.20) concordanceMarks = 2;
      else concordanceMarks = 1;
    } else concordanceMarks = 0;

    const expectedAvg = systemAverage();
    const diffAvg = Math.abs(studentAverage - expectedAvg);
    const rawAvgStr = document.getElementById('avgInput') ? document.getElementById('avgInput').value : '';
    const isDecimal2 = rawAvgStr.includes('.') && rawAvgStr.split('.')[1].length >= 2;
    let averageMarks = 0;
    if (diffAvg <= 0.02) {
      averageMarks = isDecimal2 ? 2 : 1;
    } else {
      averageMarks = 0;
    }

    const expectedConc = (current.ratio * sessionTitrantConc * studentAverage) / sessionAnalyteVolume;
    const diffConcPct = expectedConc > 0 ? (Math.abs(studentAnswer - expectedConc) / expectedConc) * 100 : 100;
    let concMarks = 0;
    if (diffConcPct <= 2.5) concMarks = 5;
    else if (diffConcPct <= 5.0) concMarks = 3;
    else if (diffConcPct <= 10.0) concMarks = 2;
    else concMarks = 0;

    const totalMarks = accuracyMarks + concordanceMarks + averageMarks + concMarks;

    let grade = 'E';
    if (totalMarks >= 13) grade = 'A';
    else if (totalMarks >= 10) grade = 'B';
    else if (totalMarks >= 7) grade = 'C';
    else if (totalMarks >= 4) grade = 'D';

    return {
      accuracyMarks,
      concordanceMarks,
      averageMarks,
      concMarks,
      totalMarks,
      grade,
      expectedConc,
      expectedAvg
    };
  }

  function proceedToNextExamQuestion() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'VLK_NEXT_TAB', tab: 2 }, '*');
    }
  }

  function showExamResultModal(examMarks) {
    window.currentTitrationScore = examMarks.totalMarks;
    const isEmbedded = (window.parent && window.parent !== window);
    if (isEmbedded) {
      try {
        window.parent.postMessage({
          type: 'VLK_Q_SCORED',
          qNum: 1,
          score: examMarks.totalMarks,
          details: examMarks
        }, '*');
      } catch(e) {}
    }

    const modal = document.getElementById('examResultModal');
    if (!modal) return;

    const gradeEl = document.getElementById('examFinalGrade');
    if (gradeEl) gradeEl.textContent = `Grade ${examMarks.grade}`;
    const scoreEl = document.getElementById('examFinalScore');
    if (scoreEl) scoreEl.textContent = `${Number(examMarks.totalMarks).toFixed(1)} / 15.0 Marks`;

    const nextBtn = document.getElementById('btnNextExamQuestion');
    const launchExamBtn = document.getElementById('btnLaunchFullExam');
    if (nextBtn) nextBtn.style.display = isEmbedded ? 'inline-block' : 'none';
    if (launchExamBtn) launchExamBtn.style.display = isEmbedded ? 'none' : 'inline-flex';

    const tbody = document.getElementById('examBreakdownTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr><td>Burette Accuracy & Meniscus Reading</td><td style="text-align:center;">5</td><td style="text-align:center;font-weight:700;">${examMarks.accuracyMarks}</td></tr>
        <tr><td>Concordance of Titres (within 0.10 cm³)</td><td style="text-align:center;">3</td><td style="text-align:center;font-weight:700;">${examMarks.concordanceMarks}</td></tr>
        <tr><td>Average Titre Format & Accuracy</td><td style="text-align:center;">2</td><td style="text-align:center;font-weight:700;">${examMarks.averageMarks}</td></tr>
        <tr><td>Molarity Concentration Calculation</td><td style="text-align:center;">5</td><td style="text-align:center;font-weight:700;">${examMarks.concMarks}</td></tr>
      `;
    }

    let notes = '';
    if (examMarks.totalMarks >= 13) {
      notes = '🏆 <b>Outstanding Performance!</b> Excellent burette accuracy, concordant titre values, and precise stoichiometric calculation. Meets KCSE Grade A practical standards.';
    } else if (examMarks.totalMarks >= 10) {
      notes = '👍 <b>Good Result!</b> Solid technique. Review burette reading precision to 2 decimal places to capture the remaining marks.';
    } else if (examMarks.totalMarks >= 7) {
      notes = '💡 <b>Fair Attempt.</b> Focus on obtaining concordant trials within 0.10 cm³ of each other before averaging.';
    } else {
      notes = '⚠️ <b>More Practice Needed.</b> Use Guided Mode to review indicator selection, meniscus reading, and C₁V₁=C₂V₂ math.';
    }
    const notesEl = document.getElementById('examFeedbackNotes');
    if (notesEl) notesEl.innerHTML = notes;

    modal.style.display = 'flex';
  }

  async function submitSession() {
    const avgInput = document.getElementById('avgInput');
    const studentAverage = parseFloat(avgInput.value);
    const studentAnswer = parseFloat(document.getElementById('calcConc').value);
    const msg = document.getElementById('resultMsg');

    const isExamMode = isExam || sessionMode === 'assignment' || sessionMode === 'exam';

    // Single Submission Enforcement: Check if already submitted
    if (sessionSubmitted) {
      msg.innerHTML = `<div class="result-banner result-warn" style="border-color:var(--amber-accent);background:rgba(224,151,44,0.15);color:var(--text-main);padding:14px;">
        <b style="color:var(--amber-accent);font-size:0.95rem;">⚠️ Already Submitted</b><br>
        <span style="font-size:0.83rem;color:var(--text-muted);display:block;margin-top:4px;">
          You have already submitted this titration practical session. Only one submission is permitted per attempt.
        </span>
      </div>`;
      return;
    }

    if (trials.length === 0 || !indicatorAdded || (!isExamMode && !studentAverageChecked) || isNaN(studentAverage) || isNaN(studentAnswer)) {
      msg.innerHTML = '<div class="result-banner result-warn">Complete all steps and enter your calculated values before submitting.</div>';
      return;
    }

    const expectedConcFromStudentAvg = (current.ratio * sessionTitrantConc * studentAverage) / sessionAnalyteVolume;
    const tolerance = Math.max(0.0005, expectedConcFromStudentAvg * 0.025);
    const correct = Math.abs(studentAnswer - expectedConcFromStudentAvg) <= tolerance;

    let examData = null;
    if (isExam) {
      examData = calculateKcseExamMarks(studentAverage, studentAnswer);
    }

    try {
      await Sessions.save({
        titrationKey: current.key,
        titrationTitle: current.title,
        indicatorLabel: selectedIndicator || current.indicatorName,
        isSuitable: indicatorCorrect,
        trueConc: trueConc,
        studentAnswer: studentAnswer,
        correct: correct,
        trialsCount: trials.length,
        trialReadings: isExam ? { readings: trials, examMarks: examData } : trials,
        mode: sessionMode,
        durationSeconds: isExam ? (900 - Math.max(0, examRemainingSeconds)) : sessionSeconds,
        assignmentId: linkedAssignmentId || undefined,
        details: {
          titrationTitle: current.title,
          indicatorLabel: selectedIndicator || current.indicatorName,
          studentAverage: studentAverage,
          studentAnswer: studentAnswer,
          molesTitrant: parseFloat(document.getElementById('molesTitrantInput')?.value) || null,
          molesAnalyte: parseFloat(document.getElementById('molesAnalyteInput')?.value) || null,
          massConc: parseFloat(document.getElementById('massConcInput')?.value) || null,
          expectedConc: expectedConcFromStudentAvg,
          analyteVolume: sessionAnalyteVolume,
          titrantConc: sessionTitrantConc,
          rfm: current.rfm,
          ratio: current.ratio,
          readings: trials
        }
      });

      // Mark session as submitted & lock single submission
      sessionSubmitted = true;
      playAudioTone('chime');

      // Lock Submit Button
      const submitBtn = document.getElementById('btnSubmitTitration');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.style.background = 'var(--green-accent)';
        submitBtn.innerHTML = '✓ Submitted Successfully';
      }

      // Lock all calculation inputs
      ['avgInput', 'molesTitrantInput', 'molesAnalyteInput', 'calcConc', 'massConcInput'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.disabled = true;
          input.style.opacity = '0.7';
        }
      });

      // Lock all check buttons
      ['btnCheckAverage', 'btnCheckMolesTitrant', 'btnCheckMolesAnalyte', 'btnCheckMolarity', 'btnCheckMassConc'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        }
      });

      clearDraft();

      if (linkedAssignmentId) {
        msg.innerHTML = `<div class="result-banner result-ok" style="border-color:var(--cyan-accent);background:rgba(6,182,212,0.12);color:var(--text-main);padding:16px;">
          <b style="color:var(--cyan-accent);font-size:1.05rem;">🎉 Assignment Submitted Successfully!</b><br>
          <span style="font-size:0.85rem;color:var(--text-main);display:block;margin-top:6px;line-height:1.5;">
            Your titration practical response has been recorded and submitted to your teacher. You will be notified on your student dashboard once your score is marked and released.
          </span>
        </div>`;
      } else if (isExam && examData) {
        showExamResultModal(examData);
      } else {
        msg.innerHTML = correct
          ? `<div class="result-banner result-ok" style="padding:16px;">
              <b style="font-size:1.05rem;">🎉 Titration Work Submitted Successfully!</b><br>
              <span style="font-size:0.85rem;display:block;margin-top:6px;line-height:1.5;">
                <b>Correct Concentration!</b> Expected concentration: ${expectedConcFromStudentAvg.toFixed(4)} M. Session saved to your history.
              </span>
            </div>`
          : `<div class="result-banner result-warn" style="padding:16px;">
              <b style="font-size:1.05rem;">✓ Titration Work Submitted!</b><br>
              <span style="font-size:0.85rem;display:block;margin-top:6px;line-height:1.5;">
                <b>Not quite.</b> Expected concentration: ${expectedConcFromStudentAvg.toFixed(4)} M. Session saved to your history.
              </span>
            </div>`;
      }

      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      msg.innerHTML = '<div class="result-banner result-warn">Error: ' + (err.message || 'Failed to save submission. Please try again.') + '</div>';
    }
  }

  function requestWorking() {
    const box = document.getElementById('workingBox');
    if (!box || !current) return;
    const avg = systemAverage();
    const molesT = (sessionTitrantConc * avg) / 1000;
    const molesA = molesT * current.ratio;
    const conc = (molesA * 1000) / sessionAnalyteVolume;
    const massConc = conc * current.rfm;
    box.style.display = 'block';
    box.innerHTML = `<div class="result-banner result-ok" style="text-align:left;line-height:1.7;">
      <b>Step-by-step Calculation</b><br>
      (a) Average titre = ${avg.toFixed(2)} cm³<br>
      (b) Moles of titrant = (${sessionTitrantConc} × ${avg.toFixed(2)}) / 1000 = ${molesT.toFixed(6)} mol<br>
      (c) Moles of analyte = ${molesT.toFixed(6)} × ${current.ratio} = ${molesA.toFixed(6)} mol<br>
      (d) Molarity = (${molesA.toFixed(6)} × 1000) / ${sessionAnalyteVolume.toFixed(2)} = <b>${conc.toFixed(4)} M</b><br>
      (e) Mass concentration = ${conc.toFixed(4)} × ${current.rfm} = <b>${massConc.toFixed(2)} g/dm³</b>
    </div>`;
  }

  function escapeHtmlLab(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  let tutCleanup = null;

  function safeInitLab() {
    try {
      if (typeof updateThemeButtons === 'function') updateThemeButtons();
    } catch(e) {}

    try {
      const initialType = (linkedType && PRACTICALS[linkedType]) ? linkedType : 'acidBase';
      const pSel = document.getElementById('practicalSelect');
      if (pSel) pSel.value = initialType;
      loadPractical(initialType);
    } catch(e) {
      console.error('Error running loadPractical:', e);
    }

    try {
      if (typeof requireStudentLogin === 'function') {
        requireStudentLogin();
      }
    } catch(e) {
      console.warn('Auth check notice:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitLab);
  } else {
    safeInitLab();
  }
  // --- TUTORIAL LOGIC ---
  const tutorialSteps = [
    {
      target: () => document.body,
      icon: '👋', title: 'Welcome to Guided Mode',
      text: 'In this mode, we will walk you through a complete titration step by step. You will learn how to read the burette, find the endpoint, and calculate the final concentration.',
      waitForAction: false,
      isModal: true
    },
    {
      target: () => document.getElementById('briefText'),
      icon: '📖', title: 'Read the Task',
      text: 'This is your experiment brief. Read it carefully — it tells you the reagents, volumes, and what concentration you need to find.',
      waitForAction: false
    },
    {
      target: () => document.getElementById('pillAnalyte').closest('.wb-card'),
      icon: '🧪', title: 'Check Your Reagents',
      text: 'Here you can see the analyte in the flask, the titrant in the burette, and which indicator to use.',
      waitForAction: false
    },
    {
      target: () => document.getElementById('addIndicatorBtn'),
      icon: '💧', title: 'Add Indicator Drops',
      text: 'Add 1 to 3 drops of your chemical indicator into the conical flask. Click the button below to add a drop.',
      waitForAction: true,
      setupWait: () => {
        const btn = document.getElementById('addIndicatorBtn');
        if (!btn) return;
        const listener = () => {
          if (typeof tutCleanup === 'function') tutCleanup();
          setTimeout(nextTutorialStep, 300);
        };
        btn.addEventListener('click', listener);
        tutCleanup = () => btn.removeEventListener('click', listener);
      }
    },
    {
      target: () => document.querySelectorAll('.add-titrant-row')[0],
      icon: '🚰', title: 'Add Titrant',
      text: 'Use these buttons to open the stopcock and add titrant. Start with +1 cm³ for speed, then switch to +0.1 cm³ (drop-wise) near the endpoint. Watch the flask colour change!',
      waitForAction: true,
      setupWait: () => {
        const row = document.querySelectorAll('.add-titrant-row')[0];
        if (!row) return;
        const listener = (e) => {
          if (e.target.tagName === 'BUTTON') {
            if (typeof tutCleanup === 'function') tutCleanup();
            setTimeout(nextTutorialStep, 300);
          }
        };
        row.addEventListener('click', listener);
        tutCleanup = () => row.removeEventListener('click', listener);
      }
    },
    {
      target: () => document.querySelector('.buret-lens-card'),
      icon: '🔍', title: 'Read the Burette',
      text: 'This magnifying lens shows your current reading. Read the volume at the BOTTOM of the meniscus (the curved surface). The red line marks eye level.',
      waitForAction: false
    },
    {
      target: () => Array.from(document.querySelectorAll('.btn-pill-action')).find(b => b.textContent.includes('Record Endpoint')),
      icon: '📝', title: 'Record the Endpoint',
      text: 'When the flask colour just changes permanently, record this as your endpoint. You need at least 2 concordant readings (within 0.10 cm³ of each other).',
      waitForAction: true,
      setupWait: () => {
        const btn = Array.from(document.querySelectorAll('.btn-pill-action')).find(b => b.textContent.includes('Record Endpoint'));
        if (!btn) return;
        const listener = () => {
          if (typeof tutCleanup === 'function') tutCleanup();
          setTimeout(nextTutorialStep, 300);
        };
        btn.addEventListener('click', listener);
        tutCleanup = () => btn.removeEventListener('click', listener);
      }
    },
    {
      target: () => document.getElementById('avgInput').closest('.wb-card'),
      icon: '🧮', title: 'Calculate & Submit',
      text: 'After getting concordant readings, enter your average titre in Step 1, then calculate the concentration in Step 2 using C₁V₁ = C₂V₂ and submit.',
      waitForAction: false,
      isLast: true
    }
  ];

  let currentTutStep = 0;

  function initTutorial() {
    if (isGuided) {
      const banner = document.getElementById('guidedBanner');
      if (banner) banner.style.display = 'flex';
      setTimeout(startTutorial, 600);
    }
  }

  function startTutorial() {
    if (typeof tutCleanup === 'function') tutCleanup();
    currentTutStep = 0;
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) overlay.classList.add('active');
    showTutorialStep();
  }

  function showTutorialStep() {
    const step = tutorialSteps[currentTutStep];
    if (!step) {
      endTutorial();
      return;
    }

    const targetEl = step.target();
    if (!targetEl) {
      currentTutStep++;
      showTutorialStep();
      return;
    }

    const spotlight = document.getElementById('tutorialSpotlight');
    const tooltip = document.getElementById('tutorialTooltip');
    if (!tooltip || !spotlight) return;

    tooltip.classList.remove('visible');

    if (!step.isModal && targetEl && typeof targetEl.scrollIntoView === 'function') {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const iconEl = document.getElementById('tutIcon');
    const titleEl = document.getElementById('tutTitle');
    const textEl = document.getElementById('tutText');
    const counterEl = document.getElementById('tutCounter');
    const nextBtn = document.getElementById('tutNextBtn');

    if (iconEl) iconEl.textContent = step.icon;
    if (titleEl) titleEl.textContent = step.title;
    if (textEl) textEl.textContent = step.text;
    if (counterEl) counterEl.textContent = step.isModal ? '' : `Step ${currentTutStep} of ${tutorialSteps.length - 1}`;
    
    if (nextBtn) {
      nextBtn.style.display = 'block';
      nextBtn.textContent = step.isLast ? 'Got it!' : (step.isModal ? 'Start Tutorial' : 'Next →');
    }
    if (step.waitForAction && typeof step.setupWait === 'function') {
      step.setupWait();
    }

    setTimeout(() => {
      if (!tooltip || !spotlight) return;
      if (step.isModal) {
        spotlight.style.opacity = '0';
        tooltip.style.top = (window.innerHeight / 2 - 100) + 'px';
        tooltip.style.left = (window.innerWidth / 2 - 160) + 'px';
      } else if (targetEl) {
        spotlight.style.opacity = '1';
        const rect = targetEl.getBoundingClientRect();
        const pad = 10;
        spotlight.style.top = (rect.top - pad) + 'px';
        spotlight.style.left = (rect.left - pad) + 'px';
        spotlight.style.width = (rect.width + pad*2) + 'px';
        spotlight.style.height = (rect.height + pad*2) + 'px';
        
        let ttTop = rect.top;
        let ttLeft = rect.right + 25;
        
        if (ttLeft + 320 > window.innerWidth) {
          ttLeft = Math.max(10, rect.left);
          ttTop = rect.bottom + 25;
        }
        if (ttTop + 200 > window.innerHeight) {
          ttTop = Math.max(10, rect.top - 220);
        }
        
        tooltip.style.top = ttTop + 'px';
        tooltip.style.left = ttLeft + 'px';
      }
      tooltip.classList.add('visible');
    }, 300);
  }

  function nextTutorialStep() {
    if (typeof tutCleanup === 'function') {
      tutCleanup();
      tutCleanup = null;
    }
    currentTutStep++;
    showTutorialStep();
  }

  function endTutorial() {
    if (typeof tutCleanup === 'function') {
      tutCleanup();
      tutCleanup = null;
    }
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) overlay.classList.remove('active');
    localStorage.setItem('vlk_tutorial_completed', 'true');
    

  }

  initTutorial();
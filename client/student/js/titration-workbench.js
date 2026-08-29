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
      titrantRange: [0.0750, 0.1450],
      titrantConcOptions: [0.0800, 0.0920, 0.1000, 0.1150, 0.1280],
      ratio: 1,
      rfm: 36.5,
      concRange: [0.0700, 0.1450],
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
          Pipette an aliquot volume of <b>${vol.toFixed(2)} cm³</b> of Solution A into a conical flask. Fill the burette with Solution B (${tc} M NaOH). Add 2–3 drops of phenolphthalein indicator and titrate until a permanent pale pink end-point is obtained. Record your burette readings in the table and repeat to obtain at least two concordant readings (within 0.10 cm³).
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#fbe4ee', '#f6b8d2', '#e8659f'],
      answerSymbol: 'HCl',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H2O(l)',
      questions: [
        {
          letter: 'a',
          boxId: 'stepABox',
          inputId: 'avgInput',
          btnId: 'btnCheckAverage',
          msgId: 'avgMsg',
          label: '(a) Average Titre V_avg of Solution B (NaOH) (cm³)',
          buttonLabel: 'Check (a) Average Titre',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 24.60',
          calcExpected: (ctx) => systemAverage(),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.02,
          feedbackSuccess: (exp, ctx) => `Average titre = ${exp.toFixed(2)} cm³. Question (b) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} cm³ from your concordant trials.`,
          workingStep: (exp, ctx) => `<b>(a) Average Titre:</b> V_avg = <b>${exp.toFixed(2)} cm³</b>`
        },
        {
          letter: 'b',
          boxId: 'stepBBox',
          inputId: 'molesTitrantInput',
          btnId: 'btnCheckMolesTitrant',
          msgId: 'molesTitrantMsg',
          label: '(b) Moles of NaOH in average volume used (n₁)',
          buttonLabel: 'Check (b) Moles of NaOH',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00250',
          calcExpected: (ctx) => (ctx.sessionTitrantConc * ctx.studentAvg) / 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₁ = ${exp.toExponential(3)} moles. Question (c) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³ / 1000).`,
          workingStep: (exp, ctx) => `<b>(b) Moles of NaOH (n₁):</b> (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³) / 1000 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'c',
          boxId: 'stepCBox',
          inputId: 'molesAnalyteInput',
          btnId: 'btnCheckMolesAnalyte',
          msgId: 'molesAnalyteMsg',
          label: '(c) Moles of HCl in aliquot volume of Solution A (n₂)',
          buttonLabel: 'Check (c) Moles of HCl',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00250',
          calcExpected: (ctx) => ((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1.0,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! HCl : NaOH = 1 : 1, n₂ = ${exp.toExponential(3)} moles. Question (d) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles in ${ctx.sessionAnalyteVolume} cm³.`,
          workingStep: (exp, ctx) => `<b>(c) Moles of HCl in ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ (n₂):</b> Mole ratio HCl:NaOH = 1:1 → n₂ = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'd',
          boxId: 'stepDBox',
          inputId: 'calcConc',
          btnId: 'btnCheckMolarity',
          msgId: 'molarityMsg',
          label: '(d) Molar concentration of HCl in Solution A (mol/dm³)',
          buttonLabel: 'Check (d) Molarity',
          marks: '[2.0 Marks]',
          step: '0.0001',
          placeholder: 'e.g., 0.1000',
          calcExpected: (ctx) => (((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0015 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Molarity = ${exp.toFixed(4)} M. Question (e) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(4)} M (${ctx.studentAvg.toFixed(2)} cm³ × ${ctx.sessionTitrantConc} M / ${ctx.sessionAnalyteVolume} cm³).`,
          workingStep: (exp, ctx) => `<b>(d) Molarity of HCl:</b> (${exp * ctx.sessionAnalyteVolume / 1000} mol × 1000) / ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ = <b>${exp.toFixed(4)} M</b>`
        },
        {
          letter: 'e',
          boxId: 'stepEBox',
          inputId: 'massConcInput',
          btnId: 'btnCheckMassConc',
          msgId: 'massConcMsg',
          label: '(e) Mass concentration of HCl in Solution A in g/dm³ (H = 1.0, Cl = 35.5)',
          buttonLabel: 'Check (e) Mass Concentration',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 3.65',
          calcExpected: (ctx) => ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume) * 36.5,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.15 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Mass conc = ${exp.toFixed(2)} g/dm³. Full submission unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} g/dm³ (Molarity × RFM of HCl where H = 1.0, Cl = 35.5).`,
          workingStep: (exp, ctx) => `<b>(e) Mass Concentration of HCl:</b><br>RFM of HCl = (1.0 + 35.5) = 36.5 g/mol<br>Mass conc = Molarity × 36.5 = <b>${exp.toFixed(2)} g/dm³</b>`
        }
      ]
    },
    redox: {
      key: 'redox',
      title: 'Redox Titration (KCSE Manganate VII)',
      analyteName: 'Fe²⁺(aq) acidified with H₂SO₄ — Solution A',
      indicatorName: 'Self-indicating (KMnO₄)',
      indicatorOptions: ['No indicator needed (self-indicating)', 'Starch', 'Phenolphthalein', 'Potassium chromate'],
      indicatorAnswer: 'No indicator needed (self-indicating)',
      titrantName: 'KMnO₄ — Solution B',
      titrantRange: [0.0150, 0.0260],
      titrantConcOptions: [0.0180, 0.0200, 0.0220, 0.0240],
      ratio: 5,
      rfm: 56.0, // RAM of Iron (Fe) = 56.0 for Question (e)
      concRange: [0.0600, 0.1350],
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
          Pipette an aliquot volume of <b>${vol.toFixed(2)} cm³</b> of solution A into a conical flask. Fill the burette with solution B (KMnO₄). Titrate solution A against solution B until the first permanent faint pink tinge persists in the flask. Record your results in the table and repeat to obtain consistent readings.
        </div>
        <div style="font-size:0.8rem;background:var(--card-bg-hover);padding:6px 10px;border-radius:6px;border-left:3px solid var(--cyan-accent);">
          <b>Ionic Equation:</b> MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l) (1 Mole KMnO₄ : 5 Moles Fe²⁺)
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#f3d9f5', '#dba3e6', '#8e2fa8'],
      answerSymbol: 'Fe²⁺',
      equation: 'MnO4-(aq) + 5Fe2+(aq) + 8H+(aq) → Mn2+(aq) + 5Fe3+(aq) + 4H2O(l)',
      questions: [
        {
          letter: 'a',
          boxId: 'stepABox',
          inputId: 'avgInput',
          btnId: 'btnCheckAverage',
          msgId: 'avgMsg',
          label: '(a) Average Titre V_avg of Solution B (KMnO₄) (cm³)',
          buttonLabel: 'Check (a) Average Titre',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 22.40',
          calcExpected: (ctx) => systemAverage(),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.02,
          feedbackSuccess: (exp, ctx) => `Average titre = ${exp.toFixed(2)} cm³. Question (b) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} cm³ from your concordant trials.`,
          workingStep: (exp, ctx) => `<b>(a) Average Titre:</b> V_avg = <b>${exp.toFixed(2)} cm³</b>`
        },
        {
          letter: 'b',
          boxId: 'stepBBox',
          inputId: 'molesTitrantInput',
          btnId: 'btnCheckMolesTitrant',
          msgId: 'molesTitrantMsg',
          label: '(b) Moles of KMnO₄ in average volume used (n₁)',
          buttonLabel: 'Check (b) Moles of KMnO₄',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00045',
          calcExpected: (ctx) => (ctx.sessionTitrantConc * ctx.studentAvg) / 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.00005 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₁ = ${exp.toExponential(3)} moles. Question (c) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³ / 1000).`,
          workingStep: (exp, ctx) => `<b>(b) Moles of KMnO₄ (n₁):</b> (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³) / 1000 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'c',
          boxId: 'stepCBox',
          inputId: 'molesAnalyteInput',
          btnId: 'btnCheckMolesAnalyte',
          msgId: 'molesAnalyteMsg',
          label: '(c) Moles of Fe²⁺ in aliquot volume of Solution A (Mole ratio 1 KMnO₄ : 5 Fe²⁺)',
          buttonLabel: 'Check (c) Moles of Fe²⁺',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00225',
          calcExpected: (ctx) => ((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 5.0,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! 5 × n₁ = ${exp.toExponential(3)} moles. Question (d) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles (5 × moles of KMnO₄).`,
          workingStep: (exp, ctx) => `<b>(c) Moles of Fe²⁺ in ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ (n₂):</b> 5 × n₁ = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'd',
          boxId: 'stepDBox',
          inputId: 'calcConc',
          btnId: 'btnCheckMolarity',
          msgId: 'molarityMsg',
          label: '(d) Molar concentration of Fe²⁺ in Solution A (mol/dm³)',
          buttonLabel: 'Check (d) Fe²⁺ Molarity',
          marks: '[2.0 Marks]',
          step: '0.0001',
          placeholder: 'e.g., 0.0900',
          calcExpected: (ctx) => ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 5.0) * 1000) / ctx.sessionAnalyteVolume,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0015 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! [Fe²⁺] = ${exp.toFixed(4)} M. Question (e) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(4)} M (Moles of Fe²⁺ × 1000 / ${ctx.sessionAnalyteVolume} cm³).`,
          workingStep: (exp, ctx) => `<b>(d) Molarity of Fe²⁺:</b> (Moles of Fe²⁺ × 1000) / ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ = <b>${exp.toFixed(4)} M</b>`
        },
        {
          letter: 'e',
          boxId: 'stepEBox',
          inputId: 'massConcInput',
          btnId: 'btnCheckMassConc',
          msgId: 'massConcMsg',
          label: '(e) Mass of Iron (Fe) in 1.0 dm³ of Solution A in g (RAM: Fe = 56.0)',
          buttonLabel: 'Check (e) Mass of Iron',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 5.04',
          calcExpected: (ctx) => (((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 5.0) * 1000) / ctx.sessionAnalyteVolume) * 56.0,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.15 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Mass of Fe = ${exp.toFixed(2)} g/dm³. Full submission unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} g (Molarity of Fe²⁺ × RAM of Fe where Fe = 56.0).`,
          workingStep: (exp, ctx) => `<b>(e) Mass of Iron in 1 dm³:</b><br>RAM of Fe = 56.0 g/mol<br>Mass of Fe = [Fe²⁺] × 56.0 = <b>${exp.toFixed(2)} g/dm³</b>`
        }
      ]
    },
    precipitation: {
      key: 'precipitation',
      title: 'Precipitation Titration (Mohr Method)',
      analyteName: 'NaCl(aq) Chloride — Solution A',
      indicatorName: 'Potassium chromate',
      indicatorOptions: ['Potassium chromate', 'Phenolphthalein', 'Methyl orange', 'Eriochrome Black T'],
      indicatorAnswer: 'Potassium chromate',
      titrantName: 'AgNO₃ — Solution B',
      titrantRange: [0.0750, 0.1400],
      titrantConcOptions: [0.0800, 0.0950, 0.1050, 0.1200],
      ratio: 1,
      rfm: 58.5,
      concRange: [0.0650, 0.1350],
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
          Pipette an aliquot volume of <b>${vol.toFixed(2)} cm³</b> of solution A into a conical flask. Add 1 cm³ of Potassium Chromate indicator. Titrate with solution B (AgNO₃) from the burette until the yellow mixture just turns to a permanent red-brown precipitate (Ag₂CrO₄). Record your burette readings.
        </div>
      `,
      flaskColors: ['#f2f1ec', '#fdf3c4', '#f5c98a', '#b5651d'],
      answerSymbol: 'Cl⁻',
      equation: 'Ag+(aq) + Cl-(aq) → AgCl(s)',
      questions: [
        {
          letter: 'a',
          boxId: 'stepABox',
          inputId: 'avgInput',
          btnId: 'btnCheckAverage',
          msgId: 'avgMsg',
          label: '(a) Average Titre V_avg of Solution B (AgNO₃) (cm³)',
          buttonLabel: 'Check (a) Average Titre',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 21.30',
          calcExpected: (ctx) => systemAverage(),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.02,
          feedbackSuccess: (exp, ctx) => `Average titre = ${exp.toFixed(2)} cm³. Question (b) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} cm³ from your concordant trials.`,
          workingStep: (exp, ctx) => `<b>(a) Average Titre:</b> V_avg = <b>${exp.toFixed(2)} cm³</b>`
        },
        {
          letter: 'b',
          boxId: 'stepBBox',
          inputId: 'molesTitrantInput',
          btnId: 'btnCheckMolesTitrant',
          msgId: 'molesTitrantMsg',
          label: '(b) Moles of AgNO₃ in average volume used (n₁)',
          buttonLabel: 'Check (b) Moles of AgNO₃',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00213',
          calcExpected: (ctx) => (ctx.sessionTitrantConc * ctx.studentAvg) / 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₁ = ${exp.toExponential(3)} moles. Question (c) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³ / 1000).`,
          workingStep: (exp, ctx) => `<b>(b) Moles of AgNO₃ (n₁):</b> (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³) / 1000 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'c',
          boxId: 'stepCBox',
          inputId: 'molesAnalyteInput',
          btnId: 'btnCheckMolesAnalyte',
          msgId: 'molesAnalyteMsg',
          label: '(c) Moles of Cl⁻ ions in aliquot volume of Solution A (n₂)',
          buttonLabel: 'Check (c) Moles of Cl⁻',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00213',
          calcExpected: (ctx) => ((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1.0,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Ag⁺ : Cl⁻ = 1 : 1, n₂ = ${exp.toExponential(3)} moles. Question (d) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles in ${ctx.sessionAnalyteVolume} cm³.`,
          workingStep: (exp, ctx) => `<b>(c) Moles of Cl⁻ in ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ (n₂):</b> Mole ratio 1:1 → n₂ = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'd',
          boxId: 'stepDBox',
          inputId: 'calcConc',
          btnId: 'btnCheckMolarity',
          msgId: 'molarityMsg',
          label: '(d) Molar concentration of NaCl in Solution A (mol/dm³)',
          buttonLabel: 'Check (d) NaCl Molarity',
          marks: '[2.0 Marks]',
          step: '0.0001',
          placeholder: 'e.g., 0.0852',
          calcExpected: (ctx) => (((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0015 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! [NaCl] = ${exp.toFixed(4)} M. Question (e) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(4)} M.`,
          workingStep: (exp, ctx) => `<b>(d) Molarity of NaCl:</b> <b>${exp.toFixed(4)} M</b>`
        },
        {
          letter: 'e',
          boxId: 'stepEBox',
          inputId: 'massConcInput',
          btnId: 'btnCheckMassConc',
          msgId: 'massConcMsg',
          label: '(e) Mass of pure NaCl dissolved in 250.0 cm³ flask in g (Na = 23.0, Cl = 35.5)',
          buttonLabel: 'Check (e) Mass in 250 cm³',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 1.25',
          calcExpected: (ctx) => ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume) * (250 / 1000) * 58.5,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.10 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Mass in 250 cm³ = ${exp.toFixed(2)} g. Full submission unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} g (Molarity × 0.25 dm³ × RFM of NaCl where Na = 23.0, Cl = 35.5).`,
          workingStep: (exp, ctx) => `<b>(e) Mass of NaCl in 250 cm³:</b><br>RFM of NaCl = (23.0 + 35.5) = 58.5 g/mol<br>Mass in 250 cm³ = Molarity × (250/1000) × 58.5 = <b>${exp.toFixed(2)} g</b>`
        }
      ]
    },
    complexometric: {
      key: 'complexometric',
      title: 'Complexometric Titration (Hardness of Water)',
      analyteName: 'Hard water sample (Ca²⁺/Mg²⁺) — Solution A',
      indicatorName: 'Eriochrome Black T',
      indicatorOptions: ['Eriochrome Black T', 'Phenolphthalein', 'Methyl orange', 'Potassium chromate'],
      indicatorAnswer: 'Eriochrome Black T',
      titrantName: 'EDTA — Solution B',
      titrantRange: [0.0075, 0.0145],
      titrantConcOptions: [0.0090, 0.0100, 0.0115, 0.0130],
      ratio: 1,
      rfm: 100.0,
      concRange: [0.0075, 0.0145],
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
          Pipette an aliquot volume of <b>${vol.toFixed(2)} cm³</b> of hard water solution A into a conical flask. Add 2 cm³ of pH 10 ammonia buffer solution and 2 drops of EBT indicator. Titrate with EDTA solution B until the solution turns from wine-red to clear sky-blue.
        </div>
      `,
      flaskColors: ['#8e2a4a', '#8a5a9a', '#5a6aa8', '#2b4a9e'],
      answerSymbol: 'Ca²⁺',
      equation: 'Ca2+(aq) + EDTA4-(aq) → [Ca-EDTA]2-(aq)',
      questions: [
        {
          letter: 'a',
          boxId: 'stepABox',
          inputId: 'avgInput',
          btnId: 'btnCheckAverage',
          msgId: 'avgMsg',
          label: '(a) Average Titre V_avg of Solution B (EDTA) (cm³)',
          buttonLabel: 'Check (a) Average Titre',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 25.00',
          calcExpected: (ctx) => systemAverage(),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.02,
          feedbackSuccess: (exp, ctx) => `Average titre = ${exp.toFixed(2)} cm³. Question (b) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} cm³ from your concordant trials.`,
          workingStep: (exp, ctx) => `<b>(a) Average Titre:</b> V_avg = <b>${exp.toFixed(2)} cm³</b>`
        },
        {
          letter: 'b',
          boxId: 'stepBBox',
          inputId: 'molesTitrantInput',
          btnId: 'btnCheckMolesTitrant',
          msgId: 'molesTitrantMsg',
          label: '(b) Moles of EDTA in average volume used (n₁)',
          buttonLabel: 'Check (b) Moles of EDTA',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00025',
          calcExpected: (ctx) => (ctx.sessionTitrantConc * ctx.studentAvg) / 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.00005 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₁ = ${exp.toExponential(3)} moles. Question (c) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³ / 1000).`,
          workingStep: (exp, ctx) => `<b>(b) Moles of EDTA (n₁):</b> (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³) / 1000 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'c',
          boxId: 'stepCBox',
          inputId: 'molesAnalyteInput',
          btnId: 'btnCheckMolesAnalyte',
          msgId: 'molesAnalyteMsg',
          label: '(c) Moles of Ca²⁺/Mg²⁺ in aliquot volume (1:1 chelate ratio)',
          buttonLabel: 'Check (c) Moles of Ca²⁺',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00025',
          calcExpected: (ctx) => ((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1.0,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.00005 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! 1:1 Chelate ratio, n₂ = ${exp.toExponential(3)} moles. Question (d) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles in ${ctx.sessionAnalyteVolume} cm³.`,
          workingStep: (exp, ctx) => `<b>(c) Moles of Ca²⁺ in ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ (n₂):</b> 1:1 ratio → n₂ = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'd',
          boxId: 'stepDBox',
          inputId: 'calcConc',
          btnId: 'btnCheckMolarity',
          msgId: 'molarityMsg',
          label: '(d) Molar concentration of Ca²⁺ in water sample (mol/dm³)',
          buttonLabel: 'Check (d) Ca²⁺ Molarity',
          marks: '[2.0 Marks]',
          step: '0.0001',
          placeholder: 'e.g., 0.0100',
          calcExpected: (ctx) => (((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0005 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! [Ca²⁺] = ${exp.toFixed(4)} M. Question (e) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(4)} M.`,
          workingStep: (exp, ctx) => `<b>(d) Molarity of Ca²⁺:</b> <b>${exp.toFixed(4)} M</b>`
        },
        {
          letter: 'e',
          boxId: 'stepEBox',
          inputId: 'massConcInput',
          btnId: 'btnCheckMassConc',
          msgId: 'massConcMsg',
          label: '(e) Total Water Hardness as CaCO₃ in mg/dm³ (ppm) (Ca = 40.0, C = 12.0, O = 16.0)',
          buttonLabel: 'Check (e) Hardness (ppm)',
          marks: '[2.0 Marks]',
          step: '0.1',
          placeholder: 'e.g., 1000.0',
          calcExpected: (ctx) => ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume) * 100.0 * 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 15.0 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Total Hardness = ${exp.toFixed(1)} ppm CaCO₃. Full submission unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(1)} ppm (Molarity × RFM of CaCO₃ × 1000 mg/g where Ca = 40.0, C = 12.0, O = 16.0).`,
          workingStep: (exp, ctx) => `<b>(e) Hardness as CaCO₃ (ppm):</b><br>RFM of CaCO₃ = (40.0 + 12.0 + 3 × 16.0) = 100.0 g/mol<br>Hardness = Molarity × 100.0 × 1000 = <b>${exp.toFixed(1)} mg/dm³ (ppm)</b>`
        }
      ]
    },
    dibasic: {
      key: 'dibasic',
      title: 'Dibasic Acid Titration (KCSE Sulfuric Acid)',
      analyteName: 'H₂SO₄(aq) — Solution A',
      indicatorName: 'Phenolphthalein',
      indicatorOptions: ['Phenolphthalein', 'Methyl orange', 'Methyl red', 'Eriochrome Black T'],
      indicatorAnswer: 'Phenolphthalein',
      titrantName: 'NaOH — Solution B',
      titrantRange: [0.0750, 0.1350],
      titrantConcOptions: [0.0880, 0.0950, 0.1080, 0.1200],
      ratio: 0.5,
      rfm: 98.0,
      concRange: [0.0380, 0.0720],
      briefTemplate: (vol, tc, massConc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · DIBASIC ACID ANALYSIS</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Unknown Dibasic Sulfuric acid (H₂X) containing <b>${massConc || '4.90'} g/dm³</b>.<br>
          • <b>Solution B</b>: <b>${tc} M</b> Sodium Hydroxide (NaOH).<br>
          • <b>Indicator</b>: Phenolphthalein indicator.
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette an aliquot volume of <b>${vol.toFixed(2)} cm³</b> of dibasic acid solution A into a conical flask. Fill the burette with solution B (NaOH). Titrate using phenolphthalein indicator until a permanent pale pink color is obtained.
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#fbe4ee', '#f6b8d2', '#e8659f'],
      answerSymbol: 'H₂SO₄',
      equation: 'H2SO4(aq) + 2NaOH(aq) → Na2SO4(aq) + 2H2O(l)',
      questions: [
        {
          letter: 'a',
          boxId: 'stepABox',
          inputId: 'avgInput',
          btnId: 'btnCheckAverage',
          msgId: 'avgMsg',
          label: '(a) Average Titre V_avg of Solution B (NaOH) (cm³)',
          buttonLabel: 'Check (a) Average Titre',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 24.50',
          calcExpected: (ctx) => systemAverage(),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.02,
          feedbackSuccess: (exp, ctx) => `Average titre = ${exp.toFixed(2)} cm³. Question (b) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} cm³ from your concordant trials.`,
          workingStep: (exp, ctx) => `<b>(a) Average Titre:</b> V_avg = <b>${exp.toFixed(2)} cm³</b>`
        },
        {
          letter: 'b',
          boxId: 'stepBBox',
          inputId: 'molesTitrantInput',
          btnId: 'btnCheckMolesTitrant',
          msgId: 'molesTitrantMsg',
          label: '(b) Moles of NaOH in average volume used (n₁)',
          buttonLabel: 'Check (b) Moles of NaOH',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00245',
          calcExpected: (ctx) => (ctx.sessionTitrantConc * ctx.studentAvg) / 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₁ = ${exp.toExponential(3)} moles. Question (c) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³ / 1000).`,
          workingStep: (exp, ctx) => `<b>(b) Moles of NaOH (n₁):</b> (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³) / 1000 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'c',
          boxId: 'stepCBox',
          inputId: 'molesAnalyteInput',
          btnId: 'btnCheckMolesAnalyte',
          msgId: 'molesAnalyteMsg',
          label: '(c) Moles of dibasic acid H₂X in aliquot (Mole ratio 1 H₂X : 2 NaOH)',
          buttonLabel: 'Check (c) Moles of H₂X',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00123',
          calcExpected: (ctx) => ((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 0.5,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₂ = 0.5 × n₁ = ${exp.toExponential(3)} moles. Question (d) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles (0.5 × moles of NaOH).`,
          workingStep: (exp, ctx) => `<b>(c) Moles of H₂X in ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ (n₂):</b> 0.5 × n₁ = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'd',
          boxId: 'stepDBox',
          inputId: 'calcConc',
          btnId: 'btnCheckMolarity',
          msgId: 'molarityMsg',
          label: '(d) Molar concentration of dibasic acid Solution A (mol/dm³)',
          buttonLabel: 'Check (d) Acid Molarity',
          marks: '[2.0 Marks]',
          step: '0.0001',
          placeholder: 'e.g., 0.0490',
          calcExpected: (ctx) => ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 0.5) * 1000) / ctx.sessionAnalyteVolume,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0010 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Molarity = ${exp.toFixed(4)} M. Question (e) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(4)} M.`,
          workingStep: (exp, ctx) => `<b>(d) Molarity of H₂X:</b> <b>${exp.toFixed(4)} M</b>`
        },
        {
          letter: 'e',
          boxId: 'stepEBox',
          inputId: 'massConcInput',
          btnId: 'btnCheckMassConc',
          msgId: 'massConcMsg',
          label: (ctx) => `(e) Relative Formula Mass (RFM) of acid H₂X (Solution A contains ${(ctx && ctx.sessionMassConc ? ctx.sessionMassConc : 4.90).toFixed(2)} g/dm³)`,
          buttonLabel: 'Check (e) RFM of Acid',
          marks: '[2.0 Marks]',
          step: '0.1',
          placeholder: 'e.g., 98.0',
          calcExpected: (ctx) => {
            const molarity = ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 0.5) * 1000) / ctx.sessionAnalyteVolume;
            const mass = (ctx && ctx.sessionMassConc) ? ctx.sessionMassConc : 4.90;
            return molarity > 0 ? (mass / molarity) : 98.0;
          },
          checkOk: (val, exp) => Math.abs(val - exp) <= 4.0 || (exp > 0 && Math.abs(val - exp) / exp <= 0.04),
          feedbackSuccess: (exp, ctx) => `Correct! RFM of H₂X = ${exp.toFixed(1)} g/mol (consistent with H₂SO₄ = 98.0). Full submission unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(1)} (${((ctx && ctx.sessionMassConc) ? ctx.sessionMassConc : 4.90).toFixed(2)} g/dm³ / Molarity of H₂X).`,
          workingStep: (exp, ctx) => {
            const mass = (ctx && ctx.sessionMassConc) ? ctx.sessionMassConc : 4.90;
            const molarity = ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 0.5) * 1000 / ctx.sessionAnalyteVolume);
            return `<b>(e) Relative Formula Mass (RFM) of H₂X:</b><br>RFM = Mass conc / Molarity = ${mass.toFixed(2)} / ${molarity.toFixed(4)} = <b>${exp.toFixed(1)} g/mol</b>`;
          }
        }
      ]
    },
    tribasic: {
      key: 'tribasic',
      title: 'Tribasic Acid Titration (Phosphoric Acid)',
      analyteName: 'H₃PO₄(aq) — Solution A',
      indicatorName: 'Phenolphthalein',
      indicatorOptions: ['Phenolphthalein', 'Methyl orange', 'Methyl red', 'Potassium chromate'],
      indicatorAnswer: 'Phenolphthalein',
      titrantName: 'NaOH — Solution B',
      titrantRange: [0.0750, 0.1350],
      titrantConcOptions: [0.0880, 0.0950, 0.1080, 0.1200],
      ratio: 1 / 3,
      rfm: 98.0,
      concRange: [0.0260, 0.0520],
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
          Pipette an aliquot volume of <b>${vol.toFixed(2)} cm³</b> of solution A into a conical flask. Titrate against solution B (NaOH) using phenolphthalein indicator until a permanent faint pink endpoint is reached.
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#fbe4ee', '#f6b8d2', '#e8659f'],
      answerSymbol: 'H₃PO₄',
      equation: 'H3PO4(aq) + 3NaOH(aq) → Na3PO4(aq) + 3H2O(l)',
      questions: [
        {
          letter: 'a',
          boxId: 'stepABox',
          inputId: 'avgInput',
          btnId: 'btnCheckAverage',
          msgId: 'avgMsg',
          label: '(a) Average Titre V_avg of Solution B (NaOH) (cm³)',
          buttonLabel: 'Check (a) Average Titre',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 27.00',
          calcExpected: (ctx) => systemAverage(),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.02,
          feedbackSuccess: (exp, ctx) => `Average titre = ${exp.toFixed(2)} cm³. Question (b) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} cm³ from your concordant trials.`,
          workingStep: (exp, ctx) => `<b>(a) Average Titre:</b> V_avg = <b>${exp.toFixed(2)} cm³</b>`
        },
        {
          letter: 'b',
          boxId: 'stepBBox',
          inputId: 'molesTitrantInput',
          btnId: 'btnCheckMolesTitrant',
          msgId: 'molesTitrantMsg',
          label: '(b) Moles of NaOH in average volume used (n₁)',
          buttonLabel: 'Check (b) Moles of NaOH',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00270',
          calcExpected: (ctx) => (ctx.sessionTitrantConc * ctx.studentAvg) / 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₁ = ${exp.toExponential(3)} moles. Question (c) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles.`,
          workingStep: (exp, ctx) => `<b>(b) Moles of NaOH (n₁):</b> (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³) / 1000 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'c',
          boxId: 'stepCBox',
          inputId: 'molesAnalyteInput',
          btnId: 'btnCheckMolesAnalyte',
          msgId: 'molesAnalyteMsg',
          label: '(c) Moles of H₃PO₄ in aliquot (Mole ratio 1 H₃PO₄ : 3 NaOH)',
          buttonLabel: 'Check (c) Moles of H₃PO₄',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00090',
          calcExpected: (ctx) => ((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * (1 / 3),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₂ = n₁ / 3 = ${exp.toExponential(3)} moles. Question (d) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles (moles of NaOH / 3).`,
          workingStep: (exp, ctx) => `<b>(c) Moles of H₃PO₄ in ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ (n₂):</b> n₁ / 3 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'd',
          boxId: 'stepDBox',
          inputId: 'calcConc',
          btnId: 'btnCheckMolarity',
          msgId: 'molarityMsg',
          label: '(d) Molar concentration of H₃PO₄ in Solution A (mol/dm³)',
          buttonLabel: 'Check (d) H₃PO₄ Molarity',
          marks: '[2.0 Marks]',
          step: '0.0001',
          placeholder: 'e.g., 0.0360',
          calcExpected: (ctx) => ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * (1 / 3)) * 1000) / ctx.sessionAnalyteVolume,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0010 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! [H₃PO₄] = ${exp.toFixed(4)} M. Question (e) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(4)} M.`,
          workingStep: (exp, ctx) => `<b>(d) Molarity of H₃PO₄:</b> <b>${exp.toFixed(4)} M</b>`
        },
        {
          letter: 'e',
          boxId: 'stepEBox',
          inputId: 'massConcInput',
          btnId: 'btnCheckMassConc',
          msgId: 'massConcMsg',
          label: '(e) Mass of pure H₃PO₄ in 500.0 cm³ bottle in g (H = 1.0, P = 31.0, O = 16.0)',
          buttonLabel: 'Check (e) Mass in 500 cm³',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 1.76',
          calcExpected: (ctx) => ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * (1 / 3) * 1000) / ctx.sessionAnalyteVolume) * (500 / 1000) * 98.0,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.10 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Mass in 500 cm³ = ${exp.toFixed(2)} g. Full submission unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} g (Molarity × 0.50 dm³ × RFM of H₃PO₄ where H = 1.0, P = 31.0, O = 16.0).`,
          workingStep: (exp, ctx) => `<b>(e) Mass of H₃PO₄ in 500 cm³:</b><br>RFM of H₃PO₄ = (3 × 1.0 + 31.0 + 4 × 16.0) = 98.0 g/mol<br>Mass in 500 cm³ = Molarity × (500/1000) × 98.0 = <b>${exp.toFixed(2)} g</b>`
        }
      ]
    },
    weakAcid: {
      key: 'weakAcid',
      title: 'Weak Acid – Strong Base Titration (Ethanoic Acid)',
      analyteName: 'CH₃COOH(aq) — Solution A',
      indicatorName: 'Phenolphthalein',
      indicatorOptions: ['Phenolphthalein', 'Methyl orange', 'Methyl red', 'Universal indicator'],
      indicatorAnswer: 'Phenolphthalein',
      titrantName: 'NaOH — Solution B',
      titrantRange: [0.0750, 0.1450],
      titrantConcOptions: [0.0800, 0.0950, 0.1050, 0.1200],
      ratio: 1,
      rfm: 60.0,
      concRange: [0.0700, 0.1450],
      briefTemplate: (vol, tc) => `
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--cyan-accent);font-weight:800;margin-bottom:6px;">🇰🇪 KCSE CHEMISTRY PAPER 3 (PRACTICAL) · ALKANOIC ACID ESTIMATION</div>
        <div style="margin-bottom:8px;line-height:1.5;">
          <b>You are provided with:</b><br>
          • <b>Solution A</b>: Commercial vinegar sample diluted 10-fold containing Ethanoic acid (CH₃COOH).<br>
          • <b>Solution B</b>: <b>${tc} M</b> Sodium Hydroxide (NaOH).<br>
          • <b>Indicator</b>: Phenolphthalein indicator.
        </div>
        <div style="line-height:1.5;">
          <b>Procedure:</b><br>
          Pipette an aliquot volume of <b>${vol.toFixed(2)} cm³</b> of diluted alkanoic acid solution A into a conical flask. Titrate with NaOH solution B using phenolphthalein indicator until a faint pink end-point is reached.
        </div>
      `,
      flaskColors: ['var(--rig-body)', '#fbe4ee', '#f6b8d2', '#e8659f'],
      answerSymbol: 'CH₃COOH',
      equation: 'CH3COOH(aq) + NaOH(aq) → CH3COONa(aq) + H2O(l)',
      questions: [
        {
          letter: 'a',
          boxId: 'stepABox',
          inputId: 'avgInput',
          btnId: 'btnCheckAverage',
          msgId: 'avgMsg',
          label: '(a) Average Titre V_avg of Solution B (NaOH) (cm³)',
          buttonLabel: 'Check (a) Average Titre',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 25.00',
          calcExpected: (ctx) => systemAverage(),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.02,
          feedbackSuccess: (exp, ctx) => `Average titre = ${exp.toFixed(2)} cm³. Question (b) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} cm³ from your concordant trials.`,
          workingStep: (exp, ctx) => `<b>(a) Average Titre:</b> V_avg = <b>${exp.toFixed(2)} cm³</b>`
        },
        {
          letter: 'b',
          boxId: 'stepBBox',
          inputId: 'molesTitrantInput',
          btnId: 'btnCheckMolesTitrant',
          msgId: 'molesTitrantMsg',
          label: '(b) Moles of NaOH in average volume used (n₁)',
          buttonLabel: 'Check (b) Moles of NaOH',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00250',
          calcExpected: (ctx) => (ctx.sessionTitrantConc * ctx.studentAvg) / 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₁ = ${exp.toExponential(3)} moles. Question (c) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles.`,
          workingStep: (exp, ctx) => `<b>(b) Moles of NaOH (n₁):</b> (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³) / 1000 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'c',
          boxId: 'stepCBox',
          inputId: 'molesAnalyteInput',
          btnId: 'btnCheckMolesAnalyte',
          msgId: 'molesAnalyteMsg',
          label: '(c) Moles of CH₃COOH in aliquot of diluted Solution A (n₂)',
          buttonLabel: 'Check (c) Moles of CH₃COOH',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00250',
          calcExpected: (ctx) => ((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1.0,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! 1:1 Mole ratio, n₂ = ${exp.toExponential(3)} moles. Question (d) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles in ${ctx.sessionAnalyteVolume} cm³.`,
          workingStep: (exp, ctx) => `<b>(c) Moles of CH₃COOH in ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ (n₂):</b> 1:1 ratio → n₂ = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'd',
          boxId: 'stepDBox',
          inputId: 'calcConc',
          btnId: 'btnCheckMolarity',
          msgId: 'molarityMsg',
          label: '(d) Molar concentration of diluted vinegar Solution A (mol/dm³)',
          buttonLabel: 'Check (d) Diluted Molarity',
          marks: '[2.0 Marks]',
          step: '0.0001',
          placeholder: 'e.g., 0.1000',
          calcExpected: (ctx) => (((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0015 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Diluted Molarity = ${exp.toFixed(4)} M. Question (e) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(4)} M.`,
          workingStep: (exp, ctx) => `<b>(d) Molarity of Diluted Vinegar:</b> <b>${exp.toFixed(4)} M</b>`
        },
        {
          letter: 'e',
          boxId: 'stepEBox',
          inputId: 'massConcInput',
          btnId: 'btnCheckMassConc',
          msgId: 'massConcMsg',
          label: '(e) Percentage (% w/v) Acidity of original vinegar (10× diluted sample; C = 12.0, H = 1.0, O = 16.0)',
          buttonLabel: 'Check (e) % Acidity',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 6.00',
          calcExpected: (ctx) => {
            const dilutedMolarity = (((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume;
            const originalMolarity = dilutedMolarity * 10.0;
            return (originalMolarity * 60.0) / 10.0; // g/100mL = % w/v
          },
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.25 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Percentage Acidity = ${exp.toFixed(2)}% (w/v). Full submission unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)}% (Original Molarity × RFM of CH₃COOH / 10 where C = 12.0, H = 1.0, O = 16.0).`,
          workingStep: (exp, ctx) => `<b>(e) Percentage Acidity (% w/v):</b><br>RFM of CH₃COOH = (2 × 12.0 + 4 × 1.0 + 2 × 16.0) = 60.0 g/mol<br>Original Molarity (10×) × 60.0 / 10 = <b>${exp.toFixed(2)}%</b>`
        }
      ]
    },
    weakBase: {
      key: 'weakBase',
      title: 'Weak Base – Strong Acid Titration (Ammonia Solution)',
      analyteName: 'NH₃(aq) — Solution A',
      indicatorName: 'Methyl orange',
      indicatorOptions: ['Methyl orange', 'Phenolphthalein', 'Methyl red', 'Universal indicator'],
      indicatorAnswer: 'Methyl orange',
      titrantName: 'HCl — Solution B',
      titrantRange: [0.0750, 0.1450],
      titrantConcOptions: [0.0800, 0.0950, 0.1050, 0.1200],
      ratio: 1,
      rfm: 17.0,
      concRange: [0.0700, 0.1450],
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
          Pipette an aliquot volume of <b>${vol.toFixed(2)} cm³</b> of ammonia solution A into a conical flask. Titrate with HCl solution B using methyl orange indicator until the solution changes from yellow to permanent orange/red.
        </div>
      `,
      flaskColors: ['#fdf6a3', '#fcae7c', '#f4845f', '#e2523d'],
      answerSymbol: 'NH₃',
      equation: 'NH3(aq) + HCl(aq) → NH4Cl(aq)',
      questions: [
        {
          letter: 'a',
          boxId: 'stepABox',
          inputId: 'avgInput',
          btnId: 'btnCheckAverage',
          msgId: 'avgMsg',
          label: '(a) Average Titre V_avg of Solution B (HCl) (cm³)',
          buttonLabel: 'Check (a) Average Titre',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 23.80',
          calcExpected: (ctx) => systemAverage(),
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.02,
          feedbackSuccess: (exp, ctx) => `Average titre = ${exp.toFixed(2)} cm³. Question (b) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} cm³ from your concordant trials.`,
          workingStep: (exp, ctx) => `<b>(a) Average Titre:</b> V_avg = <b>${exp.toFixed(2)} cm³</b>`
        },
        {
          letter: 'b',
          boxId: 'stepBBox',
          inputId: 'molesTitrantInput',
          btnId: 'btnCheckMolesTitrant',
          msgId: 'molesTitrantMsg',
          label: '(b) Moles of HCl in average volume used (n₁)',
          buttonLabel: 'Check (b) Moles of HCl',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00238',
          calcExpected: (ctx) => (ctx.sessionTitrantConc * ctx.studentAvg) / 1000,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! n₁ = ${exp.toExponential(3)} moles. Question (c) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles.`,
          workingStep: (exp, ctx) => `<b>(b) Moles of HCl (n₁):</b> (${ctx.sessionTitrantConc} M × ${ctx.studentAvg.toFixed(2)} cm³) / 1000 = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'c',
          boxId: 'stepCBox',
          inputId: 'molesAnalyteInput',
          btnId: 'btnCheckMolesAnalyte',
          msgId: 'molesAnalyteMsg',
          label: '(c) Moles of NH₃ in aliquot volume of Solution A (n₂)',
          buttonLabel: 'Check (c) Moles of NH₃',
          marks: '[2.0 Marks]',
          step: '0.00001',
          placeholder: 'e.g., 0.00238',
          calcExpected: (ctx) => ((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1.0,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0001 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! NH₃ : HCl = 1 : 1, n₂ = ${exp.toExponential(3)} moles. Question (d) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toExponential(3)} moles in ${ctx.sessionAnalyteVolume} cm³.`,
          workingStep: (exp, ctx) => `<b>(c) Moles of NH₃ in ${ctx.sessionAnalyteVolume.toFixed(1)} cm³ (n₂):</b> 1:1 ratio → n₂ = <b>${exp.toExponential(4)} mol</b>`
        },
        {
          letter: 'd',
          boxId: 'stepDBox',
          inputId: 'calcConc',
          btnId: 'btnCheckMolarity',
          msgId: 'molarityMsg',
          label: '(d) Molar concentration of ammonia Solution A (mol/dm³)',
          buttonLabel: 'Check (d) NH₃ Molarity',
          marks: '[2.0 Marks]',
          step: '0.0001',
          placeholder: 'e.g., 0.0952',
          calcExpected: (ctx) => (((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.0015 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! [NH₃] = ${exp.toFixed(4)} M. Question (e) unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(4)} M.`,
          workingStep: (exp, ctx) => `<b>(d) Molarity of NH₃:</b> <b>${exp.toFixed(4)} M</b>`
        },
        {
          letter: 'e',
          boxId: 'stepEBox',
          inputId: 'massConcInput',
          btnId: 'btnCheckMassConc',
          msgId: 'massConcMsg',
          label: '(e) Volume of dry NH₃ gas at s.t.p. in 1.0 dm³ Solution A in dm³ (Molar gas volume at s.t.p. = 22.4 dm³)',
          buttonLabel: 'Check (e) Gas Volume at s.t.p.',
          marks: '[2.0 Marks]',
          step: '0.01',
          placeholder: 'e.g., 2.13',
          calcExpected: (ctx) => ((((ctx.sessionTitrantConc * ctx.studentAvg) / 1000) * 1000) / ctx.sessionAnalyteVolume) * 22.4,
          checkOk: (val, exp) => Math.abs(val - exp) <= 0.10 || (exp > 0 && Math.abs(val - exp) / exp <= 0.03),
          feedbackSuccess: (exp, ctx) => `Correct! Gas Volume = ${exp.toFixed(2)} dm³ at s.t.p. Full submission unlocked.`,
          feedbackFail: (exp, ctx) => `Expected around ${exp.toFixed(2)} dm³ (Molarity × 22.4 dm³/mol).`,
          workingStep: (exp, ctx) => `<b>(e) Volume of NH₃ Gas at s.t.p.:</b><br>Molarity of NH₃ × 22.4 dm³/mol = <b>${exp.toFixed(2)} dm³</b>`
        }
      ]
    }
  };

  const ANALYTE_VOLUME_OPTIONS = [20.00, 25.00];
  const MAX_BURETTE = 50.0;

  let current = null;
  let sessionAnalyteVolume = 25.00;
  let sessionTitrantConc = 0;
  let trueConc = 0;
  let sessionMassConc = 0;
  let equivalenceVolume = 0;
  let currentVolume = 0;
  trials = [];
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

  function isSelfIndicatingExp(exp) {
    if (!exp) return false;
    const name = (exp.indicatorName || '').toLowerCase();
    const ans = (exp.indicatorAnswer || '').toLowerCase();
    return name.includes('self-indicating') || ans.includes('no indicator') || ans.includes('self-indicating');
  }

  function saveDraft() {
    try {
      const avgEl = document.getElementById('avgInput');
      const molesTEl = document.getElementById('molesTitrantInput');
      const molesAEl = document.getElementById('molesAnalyteInput');
      const calcEl = document.getElementById('calcConc');
      const massEl = document.getElementById('massConcInput');
      localStorage.setItem(draftKey(), JSON.stringify({
        practicalKey: current ? current.key : 'acidBase',
        assignmentId: linkedAssignmentId || null,
        sessionAnalyteVolume,
        sessionTitrantConc,
        trueConc,
        sessionMassConc,
        equivalenceVolume,
        currentVolume,
        trials,
        selectedIndicator,
        indicatorAdded,
        indicatorCorrect,
        avgInputValue: avgEl ? avgEl.value : '',
        molesTitrantValue: molesTEl ? molesTEl.value : '',
        molesAnalyteValue: molesAEl ? molesAEl.value : '',
        calcConcValue: calcEl ? calcEl.value : '',
        massConcValue: massEl ? massEl.value : '',
        studentAverageChecked: !!studentAverageChecked,
        studentAverageCorrect: !!studentAverageCorrect,
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

  function loadPractical(key, forceFresh = false) {
    current = PRACTICALS[key] || PRACTICALS.acidBase;
    const draft = forceFresh ? null : loadDraft(key);

    // Reset submission lock and calculation states when loading fresh
    if (!draft) {
      sessionSubmitted = false;
      studentAverageChecked = false;
      studentAverageCorrect = false;
      concentrationCorrect = false;
      sessionSeconds = 0;
      examRemainingSeconds = 900;
    }

    if (draft) {
      sessionAnalyteVolume = draft.sessionAnalyteVolume;
      sessionTitrantConc = draft.sessionTitrantConc;
      trueConc = draft.trueConc;
      sessionMassConc = draft.sessionMassConc || +(trueConc * (current.rfm || 98.0)).toFixed(2);
      equivalenceVolume = draft.equivalenceVolume;
      currentVolume = draft.currentVolume;
      trials = draft.trials || [];
      selectedIndicator = draft.selectedIndicator || null;
      indicatorAdded = !!draft.indicatorAdded;
      indicatorCorrect = !!draft.indicatorCorrect;
      indicatorDropsCount = draft.indicatorAdded ? 3 : 0;
    } else {
      sessionAnalyteVolume = ANALYTE_VOLUME_OPTIONS[Math.floor(Math.random() * ANALYTE_VOLUME_OPTIONS.length)];
      
      // Dynamic continuous random titrant concentration (e.g. 0.0864 M, 0.1145 M, 0.0195 M)
      if (current.titrantRange) {
        const [tLo, tHi] = current.titrantRange;
        const rawT = tLo + Math.random() * (tHi - tLo);
        sessionTitrantConc = +(rawT.toFixed(4));
      } else if (current.titrantConcOptions && current.titrantConcOptions.length > 0) {
        sessionTitrantConc = current.titrantConcOptions[Math.floor(Math.random() * current.titrantConcOptions.length)];
      } else {
        sessionTitrantConc = 0.1000;
      }

      // Dynamic continuous random analyte concentration
      const [lo, hi] = current.concRange || [0.06, 0.14];
      const rawC = lo + Math.random() * (hi - lo);
      trueConc = +(rawC.toFixed(4));

      // Calculate equivalence volume and ensure it fits a realistic KCSE titre window (16.00 to 36.00 cm³)
      equivalenceVolume = (trueConc * sessionAnalyteVolume) / (current.ratio * sessionTitrantConc);
      if (equivalenceVolume < 16.0 || equivalenceVolume > 38.0) {
        const targetEq = +(18.0 + Math.random() * 16.0).toFixed(2);
        trueConc = +((targetEq * current.ratio * sessionTitrantConc) / sessionAnalyteVolume).toFixed(4);
        equivalenceVolume = (trueConc * sessionAnalyteVolume) / (current.ratio * sessionTitrantConc);
      }

      sessionMassConc = +(trueConc * (current.rfm || 98.0)).toFixed(2);
      currentVolume = 0;
      trials = [];
      selectedIndicator = current.indicatorAnswer;
      const selfInd = isSelfIndicatingExp(current);
      indicatorAdded = selfInd;
      indicatorCorrect = true;
      indicatorDropsCount = 0;
    }

    const titrantConcStr = sessionTitrantConc.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    const massConcStr = sessionMassConc ? sessionMassConc.toFixed(2) : '';

    const briefEl = document.getElementById('briefText');
    if (briefEl) briefEl.innerHTML = current.briefTemplate(sessionAnalyteVolume, titrantConcStr, massConcStr);
    const pillA = document.getElementById('pillAnalyte');
    if (pillA) pillA.textContent = current.analyteName;
    const pillT = document.getElementById('pillTitrant');
    if (pillT) pillT.textContent = titrantConcStr + ' M ' + current.titrantName;
    const selfInd = isSelfIndicatingExp(current);
    const pillI = document.getElementById('pillIndicator');
    if (pillI) {
      pillI.textContent = selfInd
        ? 'Self-indicating (KMnO₄)'
        : (indicatorAdded ? `${current.indicatorName} (${indicatorDropsCount}/3 drops)` : '? (click button below)');
    }
    const flaskLbl = document.getElementById('flaskLabel');
    if (flaskLbl) {
      flaskLbl.textContent = selfInd
        ? `${sessionAnalyteVolume.toFixed(2)} cm³ ${current.analyteName.split(',')[0]} · Self-indicating`
        : `${sessionAnalyteVolume.toFixed(2)} cm³ ${current.analyteName.split(',')[0]}`;
    }

    const titrantChip = document.getElementById('pillTitrantChip');
    if (titrantChip) {
      titrantChip.textContent = `Titrant: ${titrantConcStr} M ${current.titrantName.split('—')[0].split('(')[0]}`;
    }
    const indicatorChip = document.getElementById('pillIndicatorChip');
    if (indicatorChip) {
      indicatorChip.textContent = selfInd
        ? 'Indicator: Self-indicating'
        : (indicatorAdded ? `Indicator: ${current.indicatorName.split(' ')[0]} (${indicatorDropsCount}d)` : `Indicator: Unindicated`);
    }

    const aliquotEl = document.getElementById('knecSubbarAliquot');
    if (aliquotEl) {
      aliquotEl.textContent = `${sessionAnalyteVolume.toFixed(2)} cm³ Pipette`;
    }
    const pillAliquot = document.getElementById('pillAliquot');
    if (pillAliquot) {
      pillAliquot.textContent = `${sessionAnalyteVolume.toFixed(2)} cm³ Pipette`;
    }
    const apparatusEl = document.getElementById('knecSubbarApparatus');
    if (apparatusEl) {
      apparatusEl.textContent = `50.0 cm³ Burette · ${sessionAnalyteVolume.toFixed(2)} cm³ Aliquot Volume`;
    }

    // Dynamically render the 5 practical-specific questions
    renderQuestions();

    studentAverageChecked = draft ? !!draft.studentAverageChecked : false;
    studentAverageCorrect = draft ? !!draft.studentAverageCorrect : false;

    if (draft) {
      if (draft.avgInputValue) {
        const el = document.getElementById('avgInput');
        if (el) el.value = draft.avgInputValue;
      }
      if (draft.molesTitrantValue) {
        const el = document.getElementById('molesTitrantInput');
        if (el) el.value = draft.molesTitrantValue;
      }
      if (draft.molesAnalyteValue) {
        const el = document.getElementById('molesAnalyteInput');
        if (el) el.value = draft.molesAnalyteValue;
      }
      if (draft.calcConcValue) {
        const el = document.getElementById('calcConc');
        if (el) el.value = draft.calcConcValue;
      }
      if (draft.massConcValue) {
        const el = document.getElementById('massConcInput');
        if (el) el.value = draft.massConcValue;
      }
    } else {
      // Clean up previous practical inputs, validation feedback and unlock controls
      ['avgInput', 'molesTitrantInput', 'molesAnalyteInput', 'calcConc', 'massConcInput'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.value = '';
          input.disabled = false;
          input.style.opacity = '1';
        }
      });

      ['btnCheckAverage', 'btnCheckMolesTitrant', 'btnCheckMolesAnalyte', 'btnCheckMolarity', 'btnCheckMassConc'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      });

      ['resultMsg', 'workingBox', 'aiFeedbackBox', 'step1Msg', 'step2Msg', 'step3Msg', 'step4Msg', 'step5Msg'].forEach(id => {
        const box = document.getElementById(id);
        if (box) {
          box.innerHTML = '';
          box.style.display = 'none';
        }
      });

      const showWorkingBtn = document.getElementById('showWorkingBtn');
      if (showWorkingBtn) showWorkingBtn.style.display = 'none';

      // Restore and unlock submit button
      const submitBtn = document.getElementById('btnSubmitTitration');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.background = '';
        submitBtn.innerHTML = 'Submit Full KCSE Titration →';
      }

      const submitCardBox = document.getElementById('submitCardBox');
      if (submitCardBox) {
        const isExamMode = isExam || sessionMode === 'assignment' || sessionMode === 'exam';
        submitCardBox.style.opacity = isExamMode ? '1' : '0.4';
        submitCardBox.style.pointerEvents = isExamMode ? 'auto' : 'none';
      }
    }

    const isExamMode = isExam || sessionMode === 'assignment' || sessionMode === 'exam';

    if (studentAverageChecked) {
      unlockNextStep(1);
    }

    const selfIndControls = isSelfIndicatingExp(current);
    document.querySelectorAll('#indicatorMsg, .indicatorMsg').forEach(msg => {
      if (selfIndControls) {
        msg.innerHTML = `<div class="result-banner result-ok" style="font-size:0.78rem;">⚡ <b>Self-Indicating Titration:</b> KMnO₄ acts as its own indicator (first permanent faint pink is endpoint). No external drops needed!</div>`;
      } else if (indicatorDropsCount > 0) {
        const dropWord = indicatorDropsCount === 1 ? 'drop' : 'drops';
        const maxNote = indicatorDropsCount >= 3 ? ' (Maximum 3 drops reached)' : '';
        msg.innerHTML = `<div class="result-banner result-ok">💧 Added ${indicatorDropsCount} ${dropWord} of ${escapeHtmlLab(current.indicatorAnswer)}${maxNote}.</div>`;
      } else {
        msg.innerHTML = '';
      }
    });

    document.querySelectorAll('#addIndicatorBtn, .addIndicatorBtn').forEach(btn => {
      if (selfIndControls) {
        btn.textContent = `⚡ Self-Indicating (${current.indicatorName.split(' ')[0]})`;
        btn.disabled = true;
        btn.title = 'KMnO₄ acts as its own indicator.';
      } else if (indicatorDropsCount >= 3) {
        btn.textContent = `✅ 3 Drops Added (${current.indicatorAnswer})`;
        btn.disabled = true;
      } else {
        btn.textContent = `💧 Add Drop ${indicatorDropsCount + 1} of 3 (${current.indicatorAnswer})`;
        btn.disabled = false;
      }
    });

    document.querySelectorAll('#titrationControls, .titrationControls').forEach(ctrl => {
      if (indicatorAdded || selfIndControls) {
        ctrl.classList.remove('is-locked');
        ctrl.style.opacity = '1';
        ctrl.style.pointerEvents = 'auto';
      } else {
        ctrl.classList.add('is-locked');
        ctrl.style.opacity = '0.5';
        ctrl.style.pointerEvents = 'none';
      }
    });

    updateRig();
    renderTrials();

    if (trials.length >= 2) {
      updateStepProgress(3, 'Calculate Molarity & Mass');
    } else if (trials.length > 0) {
      updateStepProgress(2, 'Record Concordant Trials');
    } else if (indicatorAdded) {
      updateStepProgress(1, 'Add Titrant & Swirl');
    } else {
      updateStepProgress(0, 'Setup & Indicator');
    }
  }

  function updateStepProgress(step, text) {
    const badge = document.getElementById('labStepBadge');
    if (badge) badge.textContent = `Step ${step + 1} of 5: ${text}`;
    
    // Update interactive Practical Workflow Stepper & Breadcrumb
    const progressFill = document.getElementById('workflowProgressFill');
    if (progressFill) {
      const fillPercents = [10, 32, 55, 78, 100];
      progressFill.style.width = (fillPercents[step] || 10) + '%';
    }

    for (let i = 0; i < 5; i++) {
      const stepItem = document.getElementById(`wfStep${i}`);
      const stepNode = document.getElementById(`wfNode${i}`);
      if (!stepItem || !stepNode) continue;

      stepItem.classList.remove('active', 'completed', 'upcoming');
      stepItem.removeAttribute('aria-current');

      if (i < step) {
        stepItem.classList.add('completed');
        stepNode.innerHTML = '✓';
      } else if (i === step) {
        stepItem.classList.add('active');
        stepItem.setAttribute('aria-current', 'step');
        stepNode.innerHTML = `${i + 1}`;
      } else {
        stepItem.classList.add('upcoming');
        stepNode.innerHTML = `${i + 1}`;
      }
    }

    if (window.BrilliantUI) {
      window.BrilliantUI.renderSegmentedProgress('titrationStepProgress', 5, step);
    }
  }

  window.jumpToWorkflowStep = function(stepIndex) {
    let targetEl = null;
    if (stepIndex === 0) {
      targetEl = document.getElementById('apparatusCard') || document.getElementById('practicalSelect');
    } else if (stepIndex === 1) {
      targetEl = document.getElementById('apparatusCard');
    } else if (stepIndex === 2) {
      targetEl = document.querySelector('.buret-lens-card') || document.getElementById('apparatusCard');
    } else if (stepIndex === 3) {
      targetEl = document.getElementById('resultsTableCard') || document.querySelector('.card-results-table');
    } else if (stepIndex === 4) {
      targetEl = document.getElementById('kcseCalcCard') || document.querySelector('.card-calc');
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      targetEl.style.transition = 'box-shadow 0.3s ease';
      targetEl.style.boxShadow = '0 0 0 3px var(--cyan-accent)';
      setTimeout(() => {
        targetEl.style.boxShadow = '';
      }, 1400);
    }
  };

  window.toggleCalcHint = function(hintId, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const drawer = document.getElementById(hintId);
    if (!drawer) return;
    const isOpen = drawer.classList.toggle('open');
    const btn = e ? e.currentTarget : null;
    if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  function renderQuestions() {
    const grid = document.getElementById('questionsGrid');
    if (!grid || !current || !current.questions) return;

    const isExamMode = isExam || sessionMode === 'assignment' || sessionMode === 'exam';
    const studentAvg = parseFloat(document.getElementById('avgInput')?.value) || systemAverage();
    const ctx = {
      studentAvg,
      sessionTitrantConc,
      sessionAnalyteVolume,
      sessionMassConc,
      current,
      trueConc,
      equivalenceVolume
    };

    const formulaHints = {
      a: {
        title: 'Average Titre Calculation Guide',
        body: 'Only average your concordant trials (titres agreeing within ±0.10 cm³ of each other). Rough or overshoot trials must be excluded from this calculation.',
        formula: 'V_avg = (Titre₁ + Titre₂) / 2',
        hint: '💡 Units: cm³ · Record to 2 decimal places (e.g., 22.40)'
      },
      b: {
        title: 'Moles of Standard Titrant (Solution B)',
        body: `Calculate the moles of ${current.titrantName ? current.titrantName.split(' ')[0] : 'titrant'} delivered from the burette using molar concentration and average volume.`,
        formula: 'Moles (n₁) = (Molarity × Average Volume in cm³) / 1000',
        hint: '💡 Units: moles · Enter decimal moles (e.g., 0.00045)'
      },
      c: {
        title: 'Moles of Analyte in Pipetted Aliquot (Solution A)',
        body: `Use the balanced chemical equation (${escapeHtmlLab(current.equation || '')}) to apply the stoichiometric mole ratio.`,
        formula: 'Moles (n₂) = n₁ × (Analyte Mole Ratio / Titrant Mole Ratio)',
        hint: '💡 Units: moles · Based on balanced equation mole ratio'
      },
      d: {
        title: 'Molar Concentration (Molarity) of Solution A',
        body: `Scale up the number of moles in your pipette aliquot (${sessionAnalyteVolume.toFixed(2)} cm³) to 1000 cm³ (1.0 dm³).`,
        formula: `Molarity (M) = (Moles (n₂) × 1000) / Aliquot Volume (${sessionAnalyteVolume.toFixed(2)} cm³)`,
        hint: '💡 Units: mol/dm³ (M) · Accurate to 3–4 decimal places'
      },
      e: {
        title: 'Mass Concentration / Mass in 1.0 dm³',
        body: 'Convert the molar concentration to grams by multiplying by the relative formula/atomic mass (RAM or RMM).',
        formula: 'Mass (g) = Molarity (mol/dm³) × Formula Mass (g/mol)',
        hint: '💡 Units: grams (g) · Accurate to 2–3 decimal places'
      }
    };

    grid.innerHTML = current.questions.map((q, idx) => {
      const isStepA = idx === 0;
      const boxId = q.boxId;
      const inputId = q.inputId;
      const btnId = q.btnId;
      const msgId = q.msgId;
      const hintDrawerId = `calcHintDrawer_${idx}`;
      const isUnlocked = isStepA || isExamMode;
      const labelText = typeof q.label === 'function' ? q.label(ctx) : q.label;
      const letter = q.letter || String.fromCharCode(97 + idx);
      const prevLetter = String.fromCharCode(97 + idx - 1);
      const hintData = formulaHints[letter] || {
        title: `Question (${letter}) Stoichiometry Guide`,
        body: 'Follow the balanced reaction equation and apply stoichiometric principles.',
        formula: 'Moles = (Concentration × Volume) / 1000',
        hint: '💡 Enter your calculated numerical value'
      };

      return `
        <div class="calc-field-group ${isUnlocked ? '' : 'is-locked'}" id="${boxId}" style="background:var(--card-bg-hover);border:1.5px solid var(--card-border);border-radius:12px;padding:16px;" ${isUnlocked ? '' : 'aria-disabled="true"'}>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; gap:8px;">
            <div style="display:flex; align-items:flex-start; gap:8px;">
              <span class="calc-q-badge">(${letter})</span>
              <label for="${inputId}" id="${inputId}Label" style="font-weight:700;color:var(--heading-color);font-size:0.86rem;font-family:'Plus Jakarta Sans', sans-serif;line-height:1.4;">
                ${labelText}
              </label>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
              <span class="calc-marks-pill">${q.marks}</span>
              <span class="calc-lock-badge">🔒 Q(${prevLetter}) Required</span>
            </div>
          </div>

          <!-- Expandable Formula Guide & Concept Hint -->
          <div style="margin-bottom:8px;">
            <button type="button" class="calc-hint-btn" onclick="toggleCalcHint('${hintDrawerId}', event)" aria-expanded="false" aria-controls="${hintDrawerId}" title="Toggle mathematical formula and concept hint">
              <span>💡</span> Formula &amp; Working Guide
            </button>
            <div class="calc-hint-drawer" id="${hintDrawerId}">
              <div style="font-weight:800; color:var(--cyan-accent-strong); margin-bottom:4px;">${hintData.title}</div>
              <div style="font-size:0.76rem; color:var(--text-main); margin-bottom:6px;">${hintData.body}</div>
              <div class="calc-formula-badge">${hintData.formula}</div>
            </div>
          </div>

          <div class="calc-input-row" style="flex-direction:column;gap:8px;width:100%;margin-top:auto;">
            <input type="number" step="${q.step}" id="${inputId}" placeholder="${q.placeholder}" oninput="saveDraft()" ${isUnlocked ? '' : 'disabled'} aria-label="${labelText}" style="width:100%; font-family:'JetBrains Mono', monospace; font-size:0.88rem; padding:10px 12px;">
            <div class="calc-input-hint">${hintData.hint}</div>
            <button class="btn-cyan" id="${btnId}" onclick="checkQuestionStep(${idx})" style="width:100%;height:40px;font-weight:700;display:${isExamMode ? 'none' : 'block'};">${q.buttonLabel}</button>
          </div>
          <div id="${msgId}" style="margin-top:8px;"></div>
        </div>
      `;
    }).join('');
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

    const indicatorChip = document.getElementById('pillIndicatorChip');
    if (indicatorChip) {
      indicatorChip.textContent = `Indicator: ${current.indicatorName.split(' ')[0]} (${indicatorDropsCount}d)`;
    }

    const flaskLabel = document.getElementById('flaskLabel');
    if (flaskLabel) {
      flaskLabel.textContent = sessionAnalyteVolume.toFixed(2) + ' cm³ ' + current.analyteName.split(',')[0] + ' + ' + current.indicatorName.split(' ')[0] + ` (${indicatorDropsCount}d)`;
    }

    document.querySelectorAll('#titrationControls, .titrationControls').forEach(titrationControls => {
      titrationControls.classList.remove('is-locked');
      titrationControls.style.opacity = '1';
      titrationControls.style.pointerEvents = 'auto';
    });

    updateRig();
    updateStepProgress(1, 'Add Titrant & Swirl');
    saveDraft();
  }


  function spawnDrop() {
    const svg = document.querySelector('.rig-svg');
    if (!svg) return;
    const ns = 'http://www.w3.org/2000/svg';
    const drop = document.createElementNS(ns, 'circle');
    drop.setAttribute('cx', '129');
    drop.setAttribute('cy', '242');
    drop.setAttribute('r', '3.5');
    drop.setAttribute('fill', '#00F2FE');
    drop.setAttribute('class', 'drip');
    svg.appendChild(drop);
    setTimeout(() => drop.remove(), 750);
  }

  function resetBurette() {
    currentVolume = 0;
    const selfInd = isSelfIndicatingExp(current);
    indicatorAdded = selfInd;
    indicatorDropsCount = 0;

    document.querySelectorAll('#titrationControls, .titrationControls').forEach(titrationControls => {
      if (selfInd) {
        titrationControls.classList.remove('is-locked');
        titrationControls.style.opacity = '1';
        titrationControls.style.pointerEvents = 'auto';
      } else {
        titrationControls.classList.add('is-locked');
        titrationControls.style.opacity = '0.5';
        titrationControls.style.pointerEvents = 'none';
      }
    });

    document.querySelectorAll('#addIndicatorBtn, .addIndicatorBtn').forEach(confirmBtn => {
      if (selfInd) {
        confirmBtn.textContent = `⚡ Self-Indicating (${current.indicatorName.split(' ')[0]})`;
        confirmBtn.disabled = true;
      } else {
        confirmBtn.textContent = `💧 Add Drop 1 of 3 (${current.indicatorAnswer})`;
        confirmBtn.disabled = false;
      }
    });

    document.querySelectorAll('#indicatorMsg, .indicatorMsg').forEach(msg => {
      if (selfInd) {
        msg.innerHTML = '<div class="result-banner result-ok" style="font-size:0.78rem;">⚡ <b>Self-Indicating:</b> Burette refilled to 0.00 cm³. Ready to titrate next trial!</div>';
      } else {
        msg.innerHTML = '<p style="font-size:0.78rem;color:var(--text-muted);margin-top:6px;">Add 1 to 3 drops of indicator to begin new trial.</p>';
      }
    });

    updateRig();
    saveDraft();
  }

  function updateLensView(volume) {
    const lensSvg = document.getElementById('lensSvg');
    if (!lensSvg) return;

    const pcm = 60; // 60px per cm³ magnification
    const centerY = 90; // Centerline of 180px viewfinder (matches the red Eye Level line)
    
    const minVol = Math.max(0, Math.floor((volume - 1.4) * 10) / 10);
    const maxVol = Math.min(50, Math.ceil((volume + 1.4) * 10) / 10);

    const isKmno4 = current && current.titrantName && (current.titrantName.includes('KMnO4') || current.titrantName.includes('KMnO₄'));
    const liquidColor0 = isKmno4 ? '#c084fc' : '#38BDF8';
    const liquidColor1 = isKmno4 ? '#9333ea' : '#0284C7';
    const liquidColor2 = isKmno4 ? '#6b21a8' : '#0369A1';
    const liquidColor3 = isKmno4 ? '#3b0764' : '#0C4A6E';

    // High-contrast defs: White ceramic enamel backing + crystal clear glass highlights
    const defsSvg = `
      <defs>
        <!-- High-Contrast Schellbach White Ceramic Backing -->
        <linearGradient id="lensTubeCeramic" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="10%" stop-color="#FFFFFF"/>
          <stop offset="90%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </linearGradient>
        
        <!-- Crystal Clear Luminous Aqueous Solution with Glass Depth -->
        <linearGradient id="luminousLiquidFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${liquidColor0}" stop-opacity="0.95"/>
          <stop offset="15%" stop-color="${liquidColor1}" stop-opacity="0.92"/>
          <stop offset="60%" stop-color="${liquidColor2}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${liquidColor3}" stop-opacity="0.98"/>
        </linearGradient>

        <!-- Specular Highlight for Glass Walls -->
        <linearGradient id="tubeSpecularHighlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
          <stop offset="15%" stop-color="#FFFFFF" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0"/>
        </linearGradient>

        <filter id="lensBeadGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#EF4444" flood-opacity="0.9"/>
        </filter>
      </defs>
    `;

    // 1. Dry Upper Tube (Empty Burette Cylinder Above Meniscus: y = 0 to 180)
    const dryGlassTop = `
      <!-- White Ceramic Contrast Backing Plate -->
      <rect x="12" y="0" width="176" height="180" rx="6" fill="url(#lensTubeCeramic)"/>
      <!-- Blue Schellbach Central Vertical Guide Stripe -->
      <rect x="94" y="0" width="12" height="180" fill="#0284C7" opacity="0.25"/>
      <!-- Outer Glass Tube Refraction Borders -->
      <line x1="12" y1="0" x2="12" y2="180" stroke="#00F2FE" stroke-width="3" stroke-opacity="0.8"/>
      <line x1="188" y1="0" x2="188" y2="180" stroke="#00F2FE" stroke-width="3" stroke-opacity="0.8"/>
      <!-- Left Glass Glare Highlight -->
      <rect x="16" y="0" width="14" height="180" fill="url(#tubeSpecularHighlight)"/>
    `;

    // 2. Liquid Column (Below Meniscus: Bottom of concave meniscus touches centerY = 90)
    const liquidBody = `
      <path d="M 12 ${centerY - 10} Q 100 ${centerY} 188 ${centerY - 10} L 188 180 L 12 180 Z" fill="url(#luminousLiquidFill)"/>
      <rect x="16" y="${centerY}" width="14" height="${180 - centerY}" fill="url(#tubeSpecularHighlight)"/>
    `;

    // 3. High-Contrast Laser-Etched Graduation Ticks & Bold Numbers
    let ticksSvg = '';
    for (let v = minVol; v <= maxVol + 0.05; v += 0.1) {
      const vRounded = Math.round(v * 10) / 10;
      const y = centerY + (vRounded - volume) * pcm;
      if (y < -15 || y > 195) continue;

      const isMajor = Math.abs(vRounded - Math.round(vRounded)) < 0.01;
      const isMedium = !isMajor && Math.abs((vRounded * 10) % 5) < 0.01;

      if (isMajor) {
        // Longest high-contrast black tick mark with bold number
        ticksSvg += `<line x1="12" y1="${y}" x2="68" y2="${y}" stroke="#0F172A" stroke-width="2.6" stroke-linecap="round"/>`;
        ticksSvg += `<line x1="132" y1="${y}" x2="188" y2="${y}" stroke="#0F172A" stroke-width="2.6" stroke-linecap="round"/>`;
        ticksSvg += `<text x="76" y="${y + 5}" fill="#0F172A" font-size="14" font-family="'JetBrains Mono', monospace" font-weight="900">${Math.round(vRounded)}.0</text>`;
      } else if (isMedium) {
        // 0.5 cm³ half-way tick mark
        ticksSvg += `<line x1="12" y1="${y}" x2="52" y2="${y}" stroke="#1E293B" stroke-width="2.0" stroke-linecap="round"/>`;
        ticksSvg += `<line x1="148" y1="${y}" x2="188" y2="${y}" stroke="#1E293B" stroke-width="2.0" stroke-linecap="round"/>`;
      } else {
        // 0.1 cm³ millimeter tick mark
        ticksSvg += `<line x1="12" y1="${y}" x2="38" y2="${y}" stroke="#475569" stroke-width="1.3" stroke-linecap="round"/>`;
        ticksSvg += `<line x1="162" y1="${y}" x2="188" y2="${y}" stroke="#475569" stroke-width="1.3" stroke-linecap="round"/>`;
      }
    }

    // 4. Physical Curved Meniscus Boundary (Bottom touches centerY = 90 precisely)
    const meniscusSvg = `
      <!-- Meniscus refraction shadow band -->
      <path d="M 12 ${centerY - 11} Q 100 ${centerY - 1} 188 ${centerY - 11}" stroke="#032B44" stroke-width="3" fill="none" opacity="0.85"/>
      <!-- Luminous white surface arc -->
      <path d="M 12 ${centerY - 10} Q 100 ${centerY} 188 ${centerY - 10}" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <!-- Bottom of Meniscus Focal Target Bead (Red Glowing Marker) -->
      <circle cx="100" cy="${centerY}" r="5" fill="#EF4444" stroke="#FFFFFF" stroke-width="2" filter="url(#lensBeadGlow)"/>
    `;

    lensSvg.innerHTML = defsSvg + dryGlassTop + liquidBody + ticksSvg + meniscusSvg;

    const readoutPill = document.getElementById('lensReadoutPill');
    if (readoutPill) {
      readoutPill.innerHTML = `<span>🎯</span> ${volume.toFixed(2)} cm³`;
    }

    const lensSubtitle = document.querySelector('.lens-readout-sub');
    if (lensSubtitle) {
      lensSubtitle.textContent = isKmno4 ? 'Read at top of meniscus (opaque KMnO₄).' : 'Read at bottom of meniscus.';
    }
  }

  function updateRig() {
    const buretteInnerHeight = 196;
    const usedFraction = Math.min(1, currentVolume / MAX_BURETTE);
    const fillHeight = buretteInnerHeight * (1 - usedFraction);
    const fill = document.getElementById('buretteFill');
    const cap = document.getElementById('buretteMeniscusCap');
    const isKmno4 = current && current.titrantName && (current.titrantName.includes('KMnO4') || current.titrantName.includes('KMnO₄'));
    if (fill) {
      fill.setAttribute('height', Math.max(0, fillHeight));
      fill.setAttribute('y', 10 + (buretteInnerHeight - fillHeight));
      if (isKmno4) {
        fill.setAttribute('fill', '#7e22ce');
        fill.style.fill = '#7e22ce';
      } else {
        fill.setAttribute('fill', 'url(#liquidGradLab)');
        fill.style.fill = '';
      }
    }
    if (cap) {
      cap.setAttribute('cy', 10 + (buretteInnerHeight - fillHeight));
      if (isKmno4) {
        cap.setAttribute('fill', '#9333ea');
      } else {
        cap.setAttribute('fill', '#38BDF8');
      }
    }

    updateLensView(currentVolume);

    const flask = document.getElementById('flask');
    const surface = document.getElementById('flaskLiquidSurface');

    // Equivalence delta: delivered titrant volume minus target equivalence volume
    const eqVol = (typeof equivalenceVolume === 'number' && equivalenceVolume > 0) ? equivalenceVolume : 25.0;
    const diff = currentVolume - eqVol;

    let stageColor;
    if (!indicatorAdded && !isSelfIndicatingExp(current)) {
      // Clean, unindicated fresh analyte solution
      stageColor = 'rgba(56, 189, 248, 0.12)';
    } else if (diff < -0.25) {
      // Stage 0: Initial solution color before transition
      stageColor = (current && current.flaskColors && current.flaskColors[0] !== 'var(--rig-body)')
        ? current.flaskColors[0]
        : 'rgba(224, 242, 254, 0.28)';
    } else if (diff < 0.00) {
      // Stage 1: Approaching endpoint (within 0.25 cm³), transient color flashes
      stageColor = (current && current.flaskColors && current.flaskColors[1]) || '#fbe4ee';
    } else if (diff < 0.40) {
      // Stage 2: Permanent equivalence endpoint reached (0.00 to 0.40 cm³)
      stageColor = (current && current.flaskColors && current.flaskColors[2]) || '#f6b8d2';
    } else {
      // Stage 3: Over-titrated
      stageColor = (current && current.flaskColors && current.flaskColors[3]) || '#e8659f';
    }

    // Liquid volume modeled above half of the flask height (~55% to 65% height):
    // Analyte volume (sessionAnalyteVolume, ~25 cm³) + delivered titrant (0 to ~30 cm³)
    const totalFlaskVol = (sessionAnalyteVolume || 25.0) + currentVolume;
    // Map volume: starts comfortably above half-height at y = 298 (~58% flask height), rising to y = 290 (~69%)
    const yLiquid = Math.max(286, 298 - ((totalFlaskVol - 25.0) / 25.0) * 8);
    const t = Math.max(0, Math.min(1, (yLiquid - 268) / 66));
    const xLeft = 118 - t * 24;
    const xRight = 140 + t * 24;
    const rx = (xRight - xLeft) / 2;

    if (flask) {
      const d = `M ${xLeft.toFixed(1)},${yLiquid.toFixed(1)} L 94,334 Q 129,346 164,334 L ${xRight.toFixed(1)},${yLiquid.toFixed(1)} Q 129,${(yLiquid - 3).toFixed(1)} ${xLeft.toFixed(1)},${yLiquid.toFixed(1)} Z`;
      flask.setAttribute('d', d);
      flask.setAttribute('fill', stageColor);
      flask.style.fill = stageColor;
      flask.setAttribute('style', 'fill:' + stageColor + '; stroke:none; opacity:0.88; transition: fill 0.35s ease;');
    }
    if (surface) {
      surface.setAttribute('cy', yLiquid.toFixed(1));
      surface.setAttribute('rx', rx.toFixed(1));
      surface.setAttribute('fill', stageColor);
      surface.style.fill = stageColor;
      surface.setAttribute('opacity', '0.92');
    }

    const flaskLabel = document.getElementById('flaskLabel');
    if (flaskLabel && current) {
      const baseName = current.analyteName ? current.analyteName.split(',')[0].split('—')[0].trim() : 'Analyte';
      const indName = current.indicatorName ? current.indicatorName.split(' ')[0] : 'Indicator';
      if (diff >= 0.40) {
        flaskLabel.innerHTML = `<span style="color:#F43F5E;font-weight:700;">⚠️ Over-titrated</span> (${currentVolume.toFixed(2)} cm³) · Dark end`;
      } else if (diff >= 0.00) {
        flaskLabel.innerHTML = `<span style="color:#10B981;font-weight:700;">🎯 Endpoint Reached!</span> (${currentVolume.toFixed(2)} cm³) · Permanent`;
      } else if (diff >= -0.25) {
        flaskLabel.innerHTML = `<span style="color:#F59E0B;font-weight:700;">⏳ Near Endpoint</span> (${currentVolume.toFixed(2)} cm³) · Swirl to mix`;
      } else if (isSelfIndicatingExp(current)) {
        flaskLabel.textContent = `${sessionAnalyteVolume.toFixed(2)} cm³ ${baseName} · Self-indicating`;
      } else if (indicatorAdded) {
        flaskLabel.textContent = `${sessionAnalyteVolume.toFixed(2)} cm³ ${baseName} + ${indName} (${indicatorDropsCount}d)`;
      }
    }

    const statusEl = document.getElementById('statusText');
    if (statusEl) {
      if (!indicatorAdded && !isSelfIndicatingExp(current)) {
        statusEl.innerHTML = 'Add indicator to unlock burette.';
      } else if (currentVolume === 0) {
        statusEl.innerHTML = 'Burette at <b>0.00 cm³</b>. Click buttons to add titrant.';
      } else if (diff >= 0.40) {
        statusEl.innerHTML = `<span style="color:#F43F5E;font-weight:700;">⚠️ Over-titrated (${currentVolume.toFixed(2)} cm³)!</span> Click "Record Endpoint" or "Reset Burette".`;
      } else if (diff >= 0.00) {
        statusEl.innerHTML = `<span style="color:#10B981;font-weight:700;">🎯 Endpoint reached (${currentVolume.toFixed(2)} cm³)!</span> Click "Record Endpoint".`;
      } else if (diff >= -0.25) {
        statusEl.innerHTML = `<span style="color:#F59E0B;font-weight:700;">⏳ Near endpoint (${currentVolume.toFixed(2)} cm³).</span> Add drop-wise (+0.05 cm³) & swirl.`;
      } else {
        statusEl.innerHTML = `Delivered: <b>${currentVolume.toFixed(2)} cm³</b>. Keep adding titrant.`;
      }
    }
  }

  function recordTrial() {
    if (!indicatorAdded && !isSelfIndicatingExp(current)) return;
    trials.push(currentVolume);
    renderTrials();
    if (trials.length >= 2) {
      updateStepProgress(3, 'Calculate Molarity & Mass');
    } else {
      updateStepProgress(2, 'Record Concordant Trials');
    }
    const statusEl = document.getElementById('statusText');
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#10B981;font-weight:700;">✅ Trial ${trials.length} recorded (${currentVolume.toFixed(2)} cm³)!</span> Click "Reset Burette" to refill.`;
    }
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

    // In KCSE practical titration, swirling mixes localized drops:
    // If just before endpoint (within 0.25 cm³), transient tinge dissipates upon swirling
    const eqVol = (typeof equivalenceVolume === 'number' && equivalenceVolume > 0) ? equivalenceVolume : 25.0;
    const diff = currentVolume - eqVol;
    if (indicatorAdded && diff >= -0.25 && diff < 0.00) {
      const flask = document.getElementById('flask');
      const surface = document.getElementById('flaskLiquidSurface');
      const baseColor = (current && current.flaskColors && current.flaskColors[0] !== 'var(--rig-body)')
        ? current.flaskColors[0]
        : 'rgba(224, 242, 254, 0.28)';
      if (flask) {
        flask.setAttribute('fill', baseColor);
        flask.style.fill = baseColor;
      }
      if (surface) {
        surface.setAttribute('fill', baseColor);
        surface.style.fill = baseColor;
      }
      const flaskLabel = document.getElementById('flaskLabel');
      if (flaskLabel) {
        flaskLabel.innerHTML = `<span style="color:var(--cyan-accent);font-weight:700;">🌀 Swirled:</span> Transient tinge mixed away. Add next drop!`;
      }
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

  function checkQuestionStep(idx) {
    if (!current || !current.questions || !current.questions[idx]) return;
    const q = current.questions[idx];
    const input = document.getElementById(q.inputId);
    const msgBox = document.getElementById(q.msgId);
    const rawVal = input ? input.value : '';
    const val = parseFloat(rawVal);

    if (idx === 0) {
      if (trials.length === 0) {
        if (msgBox) msgBox.innerHTML = '<div class="result-banner result-warn">Record at least one trial first.</div>';
        return;
      }
      if (isNaN(val)) {
        if (msgBox) msgBox.innerHTML = '<div class="result-banner result-warn">Enter your calculated average titre.</div>';
        return;
      }
      let decimalNote = '';
      if (rawVal.includes('.') && rawVal.split('.')[1].length === 1) {
        decimalNote = '<br><small>💡 <b>KCSE Exam Tip:</b> Always record burette readings to 2 decimal places (e.g. 24.60 cm³ instead of 24.6).</small>';
      }
      const expected = systemAverage();
      studentAverageCorrect = Math.abs(val - expected) <= 0.02;
      studentAverageChecked = true;

      if (studentAverageCorrect) playAudioTone('chime');

      msgBox.innerHTML = studentAverageCorrect
        ? `<div class="result-banner result-ok">✓ <b>(a) Correct average titre!</b> Next question unlocked.${decimalNote}</div>`
        : `<div class="result-banner result-warn">✗ <b>(a) Not quite:</b> Expected around ${expected.toFixed(2)} cm³ from your concordant trials.${decimalNote}</div>`;

      unlockNextStep(1);
      updateStepProgress(4, 'Stoichiometry & Analysis');
      saveDraft();
      return;
    }

    if (isNaN(val)) {
      if (msgBox) msgBox.innerHTML = `<div class="result-banner result-warn">⚠️ Enter your calculated numerical value for question (${q.letter}).</div>`;
      return;
    }

    const studentAvg = parseFloat(document.getElementById('avgInput')?.value) || systemAverage();
    const ctx = {
      studentAvg,
      sessionTitrantConc,
      sessionAnalyteVolume,
      sessionMassConc,
      current,
      trueConc,
      equivalenceVolume
    };

    const expected = q.calcExpected(ctx);
    const isOk = q.checkOk(val, expected);

    if (isOk) playAudioTone('chime');

    if (msgBox) {
      msgBox.innerHTML = isOk
        ? `<div class="result-banner result-ok">✓ <b>(${q.letter}) Correct!</b> ${q.feedbackSuccess(expected, ctx)}</div>`
        : `<div class="result-banner result-warn">✗ <b>(${q.letter}) Incorrect:</b> ${q.feedbackFail(expected, ctx)}</div>`;
    }

    if (idx < current.questions.length - 1) {
      unlockNextStep(idx + 1);
    } else {
      const submitCardBox = document.getElementById('submitCardBox');
      if (submitCardBox) {
        submitCardBox.classList.remove('is-locked');
        submitCardBox.style.opacity = '1';
        submitCardBox.style.pointerEvents = 'auto';
      }
      updateStepProgress(4, 'Review & Submit KCSE Titration');
    }
    saveDraft();
  }

  function unlockNextStep(nextIdx) {
    if (!current || !current.questions || !current.questions[nextIdx]) return;
    const q = current.questions[nextIdx];
    const box = document.getElementById(q.boxId);
    if (box) {
      box.classList.remove('is-locked');
      box.removeAttribute('aria-disabled');
      box.style.opacity = '1';
      box.style.pointerEvents = 'auto';
      const input = document.getElementById(q.inputId);
      if (input) input.removeAttribute('disabled');
      const btn = document.getElementById(q.btnId);
      if (btn && !isExam) btn.style.display = 'block';
    }
  }

  function checkAverage() { checkQuestionStep(0); }
  function checkMolesTitrant() { checkQuestionStep(1); }
  function checkMolesAnalyte() { checkQuestionStep(2); }
  function checkMolarity() { checkQuestionStep(3); }
  function checkMassConcentration() { checkQuestionStep(4); }

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
          titrationKey: current.key,
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
          readings: trials,
          stepELabel: typeof current.questions[4].label === 'function' ? current.questions[4].label({ sessionMassConc }) : current.questions[4].label,
          stepEUnit: (current.key === 'complexometric') ? 'mg/dm³ (ppm)' : (current.key === 'dibasic' ? 'g/mol' : (current.key === 'weakAcid' ? '% (w/v)' : (current.key === 'weakBase' ? 'dm³' : 'g'))),
          expectedStepB: (sessionTitrantConc * studentAverage) / 1000,
          expectedStepC: ((sessionTitrantConc * studentAverage) / 1000) * current.ratio,
          expectedStepD: expectedConcFromStudentAvg,
          expectedStepE: current.questions[4].calcExpected({
            studentAvg: studentAverage,
            sessionTitrantConc,
            sessionAnalyteVolume,
            sessionMassConc,
            current
          })
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

      const practicalKeys = Object.keys(PRACTICALS);
      const currentIndex = practicalKeys.indexOf(current.key);
      const nextKey = practicalKeys[(currentIndex + 1) % practicalKeys.length];
      const nextPractical = PRACTICALS[nextKey];

      if (linkedAssignmentId) {
        msg.innerHTML = `<div class="result-banner result-ok" style="border-color:var(--cyan-accent);background:rgba(6,182,212,0.12);color:var(--text-main);padding:18px;border-radius:10px;">
          <b style="color:var(--cyan-accent);font-size:1.05rem;">🎉 Assignment Submitted Successfully!</b><br>
          <span style="font-size:0.86rem;color:var(--text-main);display:block;margin-top:6px;line-height:1.5;">
            Your titration practical response has been recorded and submitted to your teacher. You will be notified on your student dashboard once your score is marked and released.
          </span>
          <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:16px;">
            <button type="button" class="btn-cyan" onclick="window.location.href='/student/home.html'" style="flex:1; min-width:180px; height:42px; font-weight:800; font-size:0.85rem;">
              🏠 Return to Dashboard
            </button>
            <button type="button" class="btn-pill-action" onclick="requestWorking()" style="flex:1; min-width:160px; height:42px; font-weight:800; font-size:0.85rem;">
              🧮 View Examiner Working
            </button>
          </div>
        </div>`;
      } else if (isExam && examData) {
        showExamResultModal(examData);
      } else {
        const headerText = correct
          ? '🎉 Titration Work Submitted Successfully!'
          : '✓ Titration Work Submitted!';
        const bannerClass = correct ? 'result-ok' : 'result-warn';

        msg.innerHTML = `
          <div class="result-banner ${bannerClass}" style="padding:18px; border-radius:10px;">
            <b style="font-size:1.05rem;">${headerText}</b><br>
            <span style="font-size:0.86rem;display:block;margin-top:6px;line-height:1.5;">
              ${correct ? '<b>Excellent precision!</b> Your concentration matches the KNEC standard.' : '<b>Session saved.</b> Your calculated concentration deviated from the standard.'}
              Expected concentration: <b>${expectedConcFromStudentAvg.toFixed(4)} M</b>. Your practical session has been recorded.
            </span>

            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:16px;">
              <button type="button" class="btn-cyan" onclick="startNextPractical('${nextKey}')" style="flex:1.2; min-width:200px; height:44px; font-weight:800; font-size:0.88rem; display:flex; align-items:center; justify-content:center; gap:6px;">
                🧪 Next Practical: ${nextPractical ? nextPractical.title.split('(')[0] : 'Next'} →
              </button>
              <button type="button" class="btn-pill-action" onclick="resetWorkbench('${current.key}')" style="flex:1; min-width:160px; height:44px; font-weight:800; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:6px;">
                🔄 Clean Apparatus & Redo
              </button>
              <button type="button" class="btn-pill-action" onclick="requestWorking()" style="flex:1; min-width:160px; height:44px; font-weight:800; font-size:0.85rem;">
                🧮 Examiner Working
              </button>
            </div>
          </div>
        `;
      }

      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      msg.innerHTML = '<div class="result-banner result-warn">Error: ' + (err.message || 'Failed to save submission. Please try again.') + '</div>';
    }
  }

  function resetWorkbench(targetKey) {
    const key = targetKey || (current ? current.key : 'acidBase');
    clearDraft();
    const pSel = document.getElementById('practicalSelect');
    if (pSel) pSel.value = key;
    loadPractical(key, true);
    playAudioTone('pour');
  }

  function startNextPractical(nextKey) {
    resetWorkbench(nextKey);
    const topBar = document.querySelector('.wb-title-bar') || document.body;
    topBar.scrollIntoView({ behavior: 'smooth' });
  }

  function requestWorking() {
    const box = document.getElementById('workingBox');
    if (!box || !current || !current.questions) return;
    const avg = systemAverage();
    const ctx = {
      studentAvg: avg,
      sessionTitrantConc,
      sessionAnalyteVolume,
      sessionMassConc,
      current,
      trueConc,
      equivalenceVolume
    };

    const stepsHtml = current.questions.map((q) => {
      const exp = q.calcExpected(ctx);
      const stepText = q.workingStep ? q.workingStep(exp, ctx) : `<b>(${q.letter})</b> Calculated = ${exp}`;
      return `<div style="margin-bottom:8px;padding:8px 12px;background:var(--card-bg);border-radius:6px;border-left:3px solid var(--blue-accent);font-size:0.83rem;">
        ${stepText}
      </div>`;
    }).join('');

    box.style.display = 'block';
    box.innerHTML = `<div class="result-banner result-ok" style="text-align:left;line-height:1.6;padding:16px;">
      <div style="font-weight:800;font-family:'Cinzel', serif;margin-bottom:10px;font-size:0.95rem;color:var(--heading-color);">🧮 KCSE Step-by-Step Examiner Working · ${escapeHtmlLab(current.title)}</div>
      ${stepsHtml}
    </div>`;
  }

  function escapeHtmlLab(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/`/g, '&#96;');
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

    if (linkedAssignmentId) {
      const banner = document.getElementById('assignmentHeaderBanner');
      const bannerTitle = document.getElementById('assignBannerTitle');
      const bannerDue = document.getElementById('assignBannerDue');
      if (banner) banner.style.display = 'flex';
      if (typeof Assignments !== 'undefined' && Assignments.getMine) {
        Assignments.getMine().then(data => {
          const list = data.assignments || [];
          const aId = parseInt(linkedAssignmentId, 10);
          const match = list.find(a => a.id === aId);
          if (match) {
            if (bannerTitle) bannerTitle.textContent = match.title + (match.instructions ? ` — ${match.instructions}` : '');
            if (bannerDue && match.due_date) {
              bannerDue.textContent = `Due ${new Date(match.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }
          }
        }).catch(err => console.warn('Could not fetch assignment details for banner:', err.message));
      }
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

  // Explicit window exports for inline HTML event handlers
  if (typeof window !== 'undefined') {
    window.setTheme = setTheme;
    window.updateThemeButtons = updateThemeButtons;
    window.toggleScratchpad = toggleScratchpad;
    window.toggleSound = toggleSound;
    window.updateSoundButton = updateSoundButton;
    window.startTutorial = startTutorial;
    window.endTutorial = endTutorial;
    window.nextTutorialStep = nextTutorialStep;
    window.loadPractical = loadPractical;
    window.addIndicatorDrops = addIndicatorDrops;
    window.swirlFlask = swirlFlask;
    window.addVolume = addVolume;
    window.recordTrial = recordTrial;
    window.resetBurette = resetBurette;
    window.checkQuestionStep = checkQuestionStep;
    window.checkAverage = checkAverage;
    window.checkMolesTitrant = checkMolesTitrant;
    window.checkMolesAnalyte = checkMolesAnalyte;
    window.checkMolarity = checkMolarity;
    window.checkMassConcentration = checkMassConcentration;
    window.requestWorking = requestWorking;
    window.submitSession = submitSession;
    window.saveDraft = saveDraft;
    window.resetWorkbench = resetWorkbench;
    window.startNextPractical = startNextPractical;
  }

  initTutorial();
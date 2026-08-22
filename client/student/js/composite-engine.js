// ============================================================
//  VirtuLab Kenya — KCSE Composite Chemistry Practical Engine
//  KNEC Paper 3 (233/3) 40-Mark Standardized Examination Engine
// ============================================================

const COMPOSITE_EXAM_PRESETS = {
  // Preset A: National Mock Standard
  standard_1: {
    id: 'standard_1',
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 1',
    durationMinutes: 135,
    q1: {
      title: 'Question 1: Volumetric Analysis (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (HCl)',
      solutionB: 'Sodium Hydroxide (NaOH) containing 4.00 g/dm³',
      acidFormula: 'HCl',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.100,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 36.5,
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)'
    },
    q2: {
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      trueSaltKey: 'Pb(NO3)2',
      trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂',
      trueCation: 'Pb²⁺',
      trueAnion: 'NO₃⁻',
      tests: [
        {
          id: 'q2_appearance',
          prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.',
          correctObs: 'White crystalline solid; dissolves completely in water to form a colorless solution',
          correctInf: 'Soluble salt; absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺ absent)'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) To 2 cm³ of solution Y in a test tube, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess NaOH to form a colorless solution',
          correctInf: 'Pb²⁺, Zn²⁺, or Al³⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To 2 cm³ of solution Y in a test tube, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess aqueous NH₃',
          correctInf: 'Pb²⁺ or Al³⁺ present (Zn²⁺ absent)'
        },
        {
          id: 'q2_anion',
          prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by 3 drops of Ba(NO₃)₂ solution (or KI solution).',
          correctObs: 'No precipitate with Ba(NO₃)₂; yellow precipitate formed on addition of potassium iodide (KI)',
          correctInf: 'NO₃⁻ present (SO₄²⁻, SO₃²⁻, CO₃²⁻ absent); Pb²⁺ confirmed'
        }
      ]
    },
    q3: {
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      trueOrganicKey: 'Ethanol',
      trueOrganicName: 'Ethanol — C₂H₅OH',
      trueFunctionalGroup: 'Alkanol (—OH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; leaves no residue',
          correctInf: 'Saturated compound / low carbon-to-hydrogen ratio; alkanol present'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with blue and red litmus paper.',
          correctObs: 'Both red and blue litmus papers retain their color (neutral pH ~ 7)',
          correctInf: 'Neutral organic substance; carboxylic acid (—COOH) and amine absent'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z in a test tube, add 3 drops of acidified KMnO₄ and warm gently.',
          correctObs: 'Purple acidified KMnO₄ solution turns colorless (decolorized)',
          correctInf: 'Reducing organic compound / Primary or secondary alkanol (—OH) present'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end full of solid NaHCO₃.',
          correctObs: 'No effervescence / no gas evolved',
          correctInf: 'Carboxylic acid (—COOH) absent'
        }
      ]
    }
  },

  // Preset B: Alternative Salt & Organic
  standard_2: {
    id: 'standard_2',
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 2',
    durationMinutes: 135,
    q1: {
      title: 'Question 1: Volumetric Analysis (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (HCl)',
      solutionB: 'Sodium Carbonate (Na₂CO₃) containing 5.30 g/dm³',
      acidFormula: 'HCl',
      baseFormula: 'Na2CO3',
      indicator: 'Methyl Orange',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.100,
      trueBaseMolarity: 0.050,
      trueTitre: 25.00,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 36.5,
      equation: '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)'
    },
    q2: {
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      trueSaltKey: 'FeSO4',
      trueSaltName: 'Iron(II) Sulfate — FeSO₄',
      trueCation: 'Fe²⁺',
      trueAnion: 'SO₄²⁻',
      tests: [
        {
          id: 'q2_appearance',
          prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.',
          correctObs: 'Pale green crystalline solid; dissolves to give a pale green solution',
          correctInf: 'Soluble salt; Fe²⁺ present'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) To 2 cm³ of solution Y, add 2M NaOH dropwise until in excess.',
          correctObs: 'Dirty green precipitate formed, insoluble in excess NaOH; turns brown on surface exposure',
          correctInf: 'Fe²⁺ confirmed'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'Dirty green precipitate formed, insoluble in excess aqueous NH₃',
          correctInf: 'Fe²⁺ confirmed'
        },
        {
          id: 'q2_anion',
          prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by 3 drops of Ba(NO₃)₂ solution.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute HNO₃',
          correctInf: 'SO₄²⁻ confirmed present'
        }
      ]
    },
    q3: {
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      trueOrganicKey: 'Ethanoic Acid',
      trueOrganicName: 'Ethanoic Acid — CH₃COOH',
      trueFunctionalGroup: 'Carboxylic Acid (—COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; pungent vinegar odor',
          correctInf: 'Saturated organic compound / lower alkanoic acid'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (pH ~ 3)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z in a test tube, add 3 drops of acidified KMnO₄ and warm gently.',
          correctObs: 'Purple color remains unchanged (not decolorized)',
          correctInf: 'Alkenyl (>C=C<) and primary/secondary alkanol absent'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end full of solid NaHCO₃.',
          correctObs: 'Vigorous effervescence / bubbling of a colorless gas that forms a white precipitate with lime water',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  }
};

class CompositeExamEngine {
  constructor(config = null) {
    this.preset = COMPOSITE_EXAM_PRESETS.standard_1;
    if (config) this.applyConfig(config);

    // Q1 Workbench State
    this.q1BuretteReading = 0.00;
    this.q1ConicalVolume = 0.00;
    this.q1IsTitrating = false;
    this.q1ReachedEndpoint = false;
    this.q1Trials = [
      { trial: 1, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false },
      { trial: 2, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false },
      { trial: 3, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false }
    ];
    this.q1Answers = {
      avgTitre: '',
      molesB: '',
      molesA: '',
      molarityA: '',
      concGrams: ''
    };

    // Q2 Qualitative State
    this.q2Obs = {};
    this.q2Inf = {};
    this.q2CationChoice = '';
    this.q2AnionChoice = '';

    // Q3 Organic State
    this.q3Obs = {};
    this.q3Inf = {};
    this.q3FunctionalGroupChoice = '';

    this.startTime = Date.now();
  }

  applyConfig(config) {
    if (!config || typeof config !== 'object') return;
    if (config.presetKey && COMPOSITE_EXAM_PRESETS[config.presetKey]) {
      this.preset = JSON.parse(JSON.stringify(COMPOSITE_EXAM_PRESETS[config.presetKey]));
    }
    if (config.q1) Object.assign(this.preset.q1, config.q1);
    if (config.q2) Object.assign(this.preset.q2, config.q2);
    if (config.q3) Object.assign(this.preset.q3, config.q3);
  }

  // ── Q1 Titration Workbench Operations ────────────────────────────────
  recordTrial(trialIndex, finalVol, initVol = 0.00) {
    if (trialIndex < 1 || trialIndex > 3) return;
    const t = this.q1Trials[trialIndex - 1];
    t.initial = parseFloat(initVol) || 0.00;
    t.final = parseFloat(finalVol) || 0.00;
    t.used = parseFloat((t.final - t.initial).toFixed(2));
    t.recorded = true;
    return t;
  }

  setConcordant(trialIndex, isConcordant) {
    if (trialIndex < 1 || trialIndex > 3) return;
    this.q1Trials[trialIndex - 1].concordant = !!isConcordant;
  }

  setQ1Answer(field, value) {
    this.q1Answers[field] = value;
  }

  calculateQ1Score() {
    let tableScore = 0.0;
    let calcScore = 0.0;
    const rubric = [];

    // 1. Table 1 Completeness & Decimal Accuracy (5.0 Marks)
    const recordedTrials = this.q1Trials.filter(t => t.recorded && t.used > 0);
    if (recordedTrials.length >= 3) {
      tableScore += 2.0;
      rubric.push({ item: 'Table 1 Complete (3 trials recorded)', max: 2.0, mark: 2.0, pass: true });
    } else if (recordedTrials.length >= 2) {
      tableScore += 1.0;
      rubric.push({ item: 'Table 1 Partially Complete (2 trials recorded)', max: 2.0, mark: 1.0, pass: true });
    } else {
      rubric.push({ item: 'Table 1 Incomplete (less than 2 trials)', max: 2.0, mark: 0.0, pass: false });
    }

    // Accuracy vs True Value (3.0 Marks)
    const trueTitre = this.preset.q1.trueTitre || 25.00;
    const avgRecorded = recordedTrials.length > 0
      ? recordedTrials.reduce((acc, t) => acc + t.used, 0) / recordedTrials.length
      : 0;
    const diff = Math.abs(avgRecorded - trueTitre);

    if (diff <= 0.20 && recordedTrials.length >= 2) {
      tableScore += 3.0;
      rubric.push({ item: 'Burette Titre Accuracy (within ±0.20 cm³ of true value)', max: 3.0, mark: 3.0, pass: true });
    } else if (diff <= 0.50 && recordedTrials.length >= 2) {
      tableScore += 1.5;
      rubric.push({ item: 'Burette Titre Accuracy (within ±0.50 cm³ of true value)', max: 3.0, mark: 1.5, pass: true });
    } else {
      rubric.push({ item: 'Burette Titre Accuracy (>0.50 cm³ deviation)', max: 3.0, mark: 0.0, pass: false });
    }

    // 2. Calculations (10.0 Marks)
    // (a) Average Titre (1.0 Mark)
    const candidateAvg = parseFloat(this.q1Answers.avgTitre);
    if (!isNaN(candidateAvg) && Math.abs(candidateAvg - avgRecorded) <= 0.15) {
      calcScore += 1.0;
      rubric.push({ item: '(a) Average Titre Calculation (1.0 Mark)', max: 1.0, mark: 1.0, pass: true });
    } else {
      rubric.push({ item: '(a) Average Titre Calculation', max: 1.0, mark: 0.0, pass: false });
    }

    // (b) Moles of Base in 25.0 cm³ (2.0 Marks)
    const candidateMolesB = parseFloat(this.q1Answers.molesB);
    const expectedMolesB = (this.preset.q1.trueBaseMolarity * this.preset.q1.pipetteVolume) / 1000.0;
    if (!isNaN(candidateMolesB) && Math.abs(candidateMolesB - expectedMolesB) / expectedMolesB <= 0.08) {
      calcScore += 2.0;
      rubric.push({ item: '(b) Moles of Base in pipette volume (2.0 Marks)', max: 2.0, mark: 2.0, pass: true });
    } else {
      rubric.push({ item: '(b) Moles of Base in pipette volume', max: 2.0, mark: 0.0, pass: false });
    }

    // (c) Moles of Acid reacting (2.0 Marks)
    const candidateMolesA = parseFloat(this.q1Answers.molesA);
    const ratio = (this.preset.q1.moleRatioAcid || 1) / (this.preset.q1.moleRatioBase || 1);
    const expectedMolesA = expectedMolesB * ratio;
    if (!isNaN(candidateMolesA) && Math.abs(candidateMolesA - expectedMolesA) / expectedMolesA <= 0.08) {
      calcScore += 2.0;
      rubric.push({ item: '(c) Moles of Acid in average titre volume (2.0 Marks)', max: 2.0, mark: 2.0, pass: true });
    } else {
      rubric.push({ item: '(c) Moles of Acid in average titre volume', max: 2.0, mark: 0.0, pass: false });
    }

    // (d) Molar concentration of Solution A (3.0 Marks)
    const candidateMolarityA = parseFloat(this.q1Answers.molarityA);
    const expectedMolarityA = this.preset.q1.trueAcidMolarity || 0.100;
    if (!isNaN(candidateMolarityA) && Math.abs(candidateMolarityA - expectedMolarityA) / expectedMolarityA <= 0.08) {
      calcScore += 3.0;
      rubric.push({ item: '(d) Molar concentration of Acid (mol/dm³) (3.0 Marks)', max: 3.0, mark: 3.0, pass: true });
    } else {
      rubric.push({ item: '(d) Molar concentration of Acid (mol/dm³)', max: 3.0, mark: 0.0, pass: false });
    }

    // (e) Concentration in g/dm³ (2.0 Marks)
    const candidateConcG = parseFloat(this.q1Answers.concGrams);
    const expectedConcG = expectedMolarityA * (this.preset.q1.acidRfm || 36.5);
    if (!isNaN(candidateConcG) && Math.abs(candidateConcG - expectedConcG) / expectedConcG <= 0.08) {
      calcScore += 2.0;
      rubric.push({ item: '(e) Concentration in g/dm³ (2.0 Marks)', max: 2.0, mark: 2.0, pass: true });
    } else {
      rubric.push({ item: '(e) Concentration in g/dm³', max: 2.0, mark: 0.0, pass: false });
    }

    const total = parseFloat((tableScore + calcScore).toFixed(1));
    return {
      tableScore,
      calcScore,
      totalScore: Math.min(15.0, total),
      maxScore: 15.0,
      rubric
    };
  }

  // ── Q2 Qualitative Operations ────────────────────────────────────────
  setQ2Response(testId, obsText, infText) {
    this.q2Obs[testId] = obsText;
    this.q2Inf[testId] = infText;
  }

  setQ2Deduction(cation, anion) {
    this.q2CationChoice = cation;
    this.q2AnionChoice = anion;
  }

  calculateQ2Score() {
    let score = 0.0;
    const rubric = [];
    const tests = this.preset.q2.tests || [];

    tests.forEach((t, idx) => {
      const candidateObs = (this.q2Obs[t.id] || '').toLowerCase().trim();
      const candidateInf = (this.q2Inf[t.id] || '').toLowerCase().trim();
      let testMark = 0.0;

      // Check observation keywords
      const obsKeywords = (t.correctObs || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 3);
      const obsMatches = obsKeywords.filter(w => candidateObs.includes(w)).length;
      if (candidateObs.length > 5 && obsMatches >= 2) {
        testMark += 1.5;
      } else if (candidateObs.length > 3) {
        testMark += 0.5;
      }

      // Check inference keywords
      const infKeywords = (t.correctInf || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 2);
      const infMatches = infKeywords.filter(w => candidateInf.includes(w)).length;
      if (candidateInf.length > 3 && infMatches >= 1) {
        testMark += 1.5;
      } else if (candidateInf.length > 2) {
        testMark += 0.5;
      }

      score += testMark;
      rubric.push({
        item: `Test (${idx + 1}): ${t.prompt.substring(0, 45)}…`,
        max: 3.0,
        mark: testMark,
        pass: testMark >= 2.0
      });
    });

    // Cation & Anion Identification (3.0 Marks)
    const trueCation = (this.preset.q2.trueCation || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const candidateCation = (this.q2CationChoice || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cationCorrect = candidateCation.includes(trueCation) || trueCation.includes(candidateCation);
    if (cationCorrect && candidateCation.length > 0) {
      score += 1.5;
      rubric.push({ item: 'Cation Identification (Pb²⁺ / Fe²⁺ / Zn²⁺)', max: 1.5, mark: 1.5, pass: true });
    } else {
      rubric.push({ item: 'Cation Identification', max: 1.5, mark: 0.0, pass: false });
    }

    const trueAnion = (this.preset.q2.trueAnion || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const candidateAnion = (this.q2AnionChoice || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const anionCorrect = candidateAnion.includes(trueAnion) || trueAnion.includes(candidateAnion);
    if (anionCorrect && candidateAnion.length > 0) {
      score += 1.5;
      rubric.push({ item: 'Anion Identification (NO₃⁻ / SO₄²⁻ / Cl⁻)', max: 1.5, mark: 1.5, pass: true });
    } else {
      rubric.push({ item: 'Anion Identification', max: 1.5, mark: 0.0, pass: false });
    }

    return {
      totalScore: Math.min(15.0, parseFloat(score.toFixed(1))),
      maxScore: 15.0,
      rubric
    };
  }

  // ── Q3 Organic Operations ────────────────────────────────────────────
  setQ3Response(testId, obsText, infText) {
    this.q3Obs[testId] = obsText;
    this.q3Inf[testId] = infText;
  }

  setQ3Deduction(functionalGroup) {
    this.q3FunctionalGroupChoice = functionalGroup;
  }

  calculateQ3Score() {
    let score = 0.0;
    const rubric = [];
    const tests = this.preset.q3.tests || [];

    tests.forEach((t, idx) => {
      const candidateObs = (this.q3Obs[t.id] || '').toLowerCase().trim();
      const candidateInf = (this.q3Inf[t.id] || '').toLowerCase().trim();
      let testMark = 0.0;

      const obsKeywords = (t.correctObs || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 3);
      const obsMatches = obsKeywords.filter(w => candidateObs.includes(w)).length;
      if (candidateObs.length > 4 && obsMatches >= 1) {
        testMark += 1.0;
      }

      const infKeywords = (t.correctInf || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 2);
      const infMatches = infKeywords.filter(w => candidateInf.includes(w)).length;
      if (candidateInf.length > 3 && infMatches >= 1) {
        testMark += 1.0;
      }

      score += testMark;
      rubric.push({
        item: `Test (${idx + 1}): ${t.prompt.substring(0, 45)}…`,
        max: 2.0,
        mark: testMark,
        pass: testMark >= 1.5
      });
    });

    // Functional Group Deduction (2.0 Marks)
    const trueFG = (this.preset.q3.trueFunctionalGroup || '').toLowerCase().replace(/[^a-z]/g, '');
    const candidateFG = (this.q3FunctionalGroupChoice || '').toLowerCase().replace(/[^a-z]/g, '');
    const fgCorrect = candidateFG.includes(trueFG) || trueFG.includes(candidateFG);
    if (fgCorrect && candidateFG.length > 0) {
      score += 2.0;
      rubric.push({ item: 'Functional Group Identification (—OH / —COOH / >C=C<)', max: 2.0, mark: 2.0, pass: true });
    } else {
      rubric.push({ item: 'Functional Group Identification', max: 2.0, mark: 0.0, pass: false });
    }

    return {
      totalScore: Math.min(10.0, parseFloat(score.toFixed(1))),
      maxScore: 10.0,
      rubric
    };
  }

  // ── Comprehensive 40-Mark Examination Evaluation ────────────────────
  evaluateExam() {
    const q1Res = this.calculateQ1Score();
    const q2Res = this.calculateQ2Score();
    const q3Res = this.calculateQ3Score();

    const total = parseFloat((q1Res.totalScore + q2Res.totalScore + q3Res.totalScore).toFixed(1));
    const percentage = Math.round((total / 40.0) * 100);

    let grade = 'E';
    if (percentage >= 80) grade = 'A';
    else if (percentage >= 75) grade = 'A-';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 65) grade = 'B';
    else if (percentage >= 60) grade = 'B-';
    else if (percentage >= 55) grade = 'C+';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 45) grade = 'C-';
    else if (percentage >= 40) grade = 'D+';
    else if (percentage >= 35) grade = 'D';
    else if (percentage >= 30) grade = 'D-';

    return {
      examTitle: this.preset.title,
      q1Score: q1Res.totalScore,
      q2Score: q2Res.totalScore,
      q3Score: q3Res.totalScore,
      totalScore: total,
      maxScore: 40.0,
      percentage,
      grade,
      q1Details: q1Res,
      q2Details: q2Res,
      q3Details: q3Res,
      durationSeconds: Math.round((Date.now() - this.startTime) / 1000)
    };
  }

  buildSubmissionPayload(assignmentId = null) {
    const evalData = this.evaluateExam();
    return {
      assignment_id: assignmentId ? parseInt(assignmentId, 10) : null,
      exam_title: evalData.examTitle,
      q1_score: evalData.q1Score,
      q2_score: evalData.q2Score,
      q3_score: evalData.q3Score,
      total_score: evalData.totalScore,
      grade: evalData.grade,
      details: {
        percentage: evalData.percentage,
        q1: evalData.q1Details,
        q2: evalData.q2Details,
        q3: evalData.q3Details,
        candidateTrials: this.q1Trials,
        candidateQ1Answers: this.q1Answers,
        candidateQ2Obs: this.q2Obs,
        candidateQ2Inf: this.q2Inf,
        candidateQ2Deductions: { cation: this.q2CationChoice, anion: this.q2AnionChoice },
        candidateQ3Obs: this.q3Obs,
        candidateQ3Inf: this.q3Inf,
        candidateQ3Deduction: this.q3FunctionalGroupChoice
      },
      duration_seconds: evalData.durationSeconds
    };
  }
}

// Browser attachment
if (typeof window !== 'undefined') {
  window.COMPOSITE_EXAM_PRESETS = COMPOSITE_EXAM_PRESETS;
  window.CompositeExamEngine = CompositeExamEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPOSITE_EXAM_PRESETS, CompositeExamEngine };
}

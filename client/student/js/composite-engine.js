// ============================================================
//  VirtuLab Kenya — KCSE Composite Chemistry Practical Engine
//  KNEC Paper 3 (233/3) 40-Mark Standardized Examination Engine
//  Syllabus-Aligned with KNEC Table of Specifications & Bloom's Taxonomy
// ============================================================

/**
 * Helper to retrieve candidate answer by field key or step ID
 */
function getAnswerValue(answers, fieldKey, stepId) {
  if (!answers || typeof answers !== 'object') return undefined;
  if (fieldKey && answers[fieldKey] !== undefined && answers[fieldKey] !== '') {
    return answers[fieldKey];
  }
  if (stepId && answers[stepId] !== undefined && answers[stepId] !== '') {
    return answers[stepId];
  }
  return undefined;
}

/**
 * Sanitize Solution B (analyte) display text to prevent leaking answers being tested.
 * Follows KNEC Paper 3 standards: If molarity (molarityB) is asked, strip explicit molarity.
 * If concentration in g/dm³ (concGrams) is asked, strip mass concentrations like containing 4.00 g/dm³.
 */
function sanitizeAnalyteDisplay(name, questions = []) {
  if (!name || typeof name !== 'string') return name || '';
  let s = name;
  const qList = Array.isArray(questions) ? questions : [];

  const asksMolarity = qList.some(q => q.field === 'molarityB' || /molar(?:ity| concentration) .* (?:solution b|base|analyte)/i.test(q.label || ''));
  const asksConc = qList.some(q => q.field === 'concGrams' || /concentration of solution b in g\/(?:dm³|dm3|l)/i.test(q.label || ''));
  const hasBoth = /\b\d+(?:\.\d+)?\s*M\b/i.test(s) && /g\/(?:dm³|dm3|l)/i.test(s);

  if (asksMolarity || hasBoth) {
    s = s.replace(/(?:~\s*)?\b\d+(?:\.\d+)?\s*M\b/gi, '');
  }

  if (asksConc || hasBoth) {
    s = s.replace(/\s*containing\s+\d+(?:\.\d+)?\s*g\/(?:dm³|dm3|l|liter|litre)/gi, '')
         .replace(/\s*\(\s*\d+(?:\.\d+)?\s*g\/(?:dm³|dm3|l|liter|litre)\s*\)/gi, '');
  }

  s = s.trim().replace(/^[,;\-~ \t]+|[,;\-~ \t]+$/g, '').replace(/\s{2,}/g, ' ');
  if (s && !/solution|sample|containing/i.test(s)) {
    s += ' solution';
  }
  return s;
}

/**
 * Sanitize instructions text to avoid leaking Solution B concentration when tested.
 */
function sanitizeInstructions(text, questions = []) {
  if (!text || typeof text !== 'string') return text || '';
  let s = text;
  const qList = Array.isArray(questions) ? questions : [];
  const asksMolarity = qList.some(q => q.field === 'molarityB' || /molar(?:ity| concentration) .* (?:solution b|base|analyte)/i.test(q.label || ''));
  const asksConc = qList.some(q => q.field === 'concGrams' || /concentration of solution b in g\/(?:dm³|dm3|l)/i.test(q.label || ''));

  if (asksMolarity) {
    s = s.replace(/(?:~\s*)?\b\d+(?:\.\d+)?\s*M\s+(Sodium\s+Hydroxide|Solution\s+B|NaOH|Ammonium\s+Iron)/gi, '$1');
  }

  if (asksConc) {
    s = s.replace(/\s*containing\s+\d+(?:\.\d+)?\s*g\/(?:dm³|dm3|l|liter|litre)/gi, '')
         .replace(/\s*\(\s*\d+(?:\.\d+)?\s*g\/(?:dm³|dm3|l|liter|litre)\s*\)/gi, '');
  }

  return s;
}

/**
 * Standard KNEC Question 1 Calculation Schema Generators
 */
function createStandardTitrationQuestions(q1Config) {
  const rfmBase = q1Config.baseRfm || 40.0;
  return [
    {
      id: 'step_a',
      letter: 'a',
      field: 'avgTitre',
      label: 'Calculate the average volume of Solution A used, V₁',
      marks: 1.0,
      marksLabel: '(1.0 Mark)',
      placeholder: 'e.g. 25.00',
      step: '0.01',
      unit: 'cm³',
      calcTheoretical: (ctx) => ctx.trueTitre,
      calcEcf: (ctx) => ctx.expAvgFromTrials,
      check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
      feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
      feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
      working: (ctx) => `<b>(a) Average Titre:</b> V₁ = (${ctx.t1.toFixed(2)} + ${ctx.t2.toFixed(2)}) / 2 = <b>${ctx.v1.toFixed(2)} cm³</b>`
    },
    {
      id: 'step_b',
      letter: 'b',
      field: 'molesA',
      label: 'Calculate the number of moles of Solution A (acid) in the average volume V₁ used',
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00250',
      step: '0.0001',
      unit: 'moles of acid',
      calcTheoretical: (ctx) => (ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0,
      calcEcf: (ctx) => {
        const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
        return (ctx.trueAcidMolarity * v1) / 1000.0;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of acid.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Molarity of Acid × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
      working: (ctx) => `<b>(b) Moles of Acid in V₁:</b> (${ctx.trueAcidMolarity.toFixed(3)} × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((ctx.trueAcidMolarity * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
    },
    {
      id: 'step_c',
      letter: 'c',
      field: 'molesB',
      label: `Determine the number of moles of Solution B (base) in ${Number(q1Config.pipetteVolume || 25.0).toFixed(1)} cm³ of solution used`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00250',
      step: '0.0001',
      unit: 'moles of base',
      calcTheoretical: (ctx) => ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * (ctx.ratioB / ctx.ratioA),
      calcEcf: (ctx) => {
        const ma = parseFloat(getAnswerValue(ctx.answers, 'molesA', 'step_b')) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
        return ma * (ctx.ratioB / ctx.ratioA);
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of base.`,
      feedbackFail: (ctx, expTheo) => `Expected around ${expTheo.toFixed(5)} mol based on mole ratio ${ctx.ratioB}:${ctx.ratioA}.`,
      working: (ctx) => `<b>(c) Moles of Solution B in pipette:</b> Moles of Acid × (${ctx.ratioB}/${ctx.ratioA}) = <b>${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * (ctx.ratioB / ctx.ratioA)).toFixed(5)} mol</b>`
    },
    {
      id: 'step_d',
      letter: 'd',
      field: 'molarityB',
      label: 'Calculate the molar concentration (molarity) of Solution B in mol/dm³',
      marks: 3.0,
      marksLabel: '(3.0 Marks)',
      placeholder: 'e.g. 0.100',
      step: '0.001',
      unit: 'mol/dm³ (M)',
      calcTheoretical: (ctx) => ctx.trueBaseMolarity,
      calcEcf: (ctx) => {
        const mb = parseFloat(getAnswerValue(ctx.answers, 'molesB', 'step_c')) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * (ctx.ratioB / ctx.ratioA));
        return (mb * 1000.0) / (ctx.pipetteVol || 25.0);
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Molarity of Solution B = ${val} mol/dm³.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Moles of Base × 1000) / ${ctx.pipetteVol || 25.0} = ${expTheo.toFixed(3)} M.`,
      working: (ctx) => `<b>(d) Molar Concentration of Base:</b> (Moles of Base × 1000) / ${ctx.pipetteVol || 25.0} = <b>${ctx.trueBaseMolarity.toFixed(3)} mol/dm³</b>`
    },
    {
      id: 'step_e',
      letter: 'e',
      field: 'concGrams',
      label: `Calculate the concentration of Solution B in g/dm³ (RFM = ${rfmBase})`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 4.00',
      step: '0.01',
      unit: 'g/dm³',
      calcTheoretical: (ctx) => ctx.trueBaseMolarity * rfmBase,
      calcEcf: (ctx) => {
        const molarity = parseFloat(getAnswerValue(ctx.answers, 'molarityB', 'step_d')) || ctx.trueBaseMolarity;
        return molarity * rfmBase;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
      feedbackFail: (ctx, expTheo) => `Formula: Molarity × RFM (${rfmBase}) = ${expTheo.toFixed(2)} g/dm³.`,
      working: (ctx) => `<b>(e) Mass Concentration of Base:</b> ${ctx.trueBaseMolarity.toFixed(3)} M × ${rfmBase} = <b>${(ctx.trueBaseMolarity * rfmBase).toFixed(2)} g/dm³</b>`
    }
  ];
}

/**
 * Water of Crystallization Calculation Schema Generator (e.g. Na2CO3·xH2O)
 */
function createWaterOfCrystallizationQuestions(q1Config) {
  const soluteMass = q1Config.soluteMassPerLiter || 14.30;
  const anhydrousRfm = q1Config.anhydrousRfm || 106.0;
  const waterRfm = 18.0;

  return [
    {
      id: 'step_a',
      letter: 'a',
      field: 'avgTitre',
      label: 'Calculate the average volume of Solution A used, V₁',
      marks: 1.0,
      marksLabel: '(1.0 Mark)',
      placeholder: 'e.g. 25.00',
      step: '0.01',
      unit: 'cm³',
      calcTheoretical: (ctx) => ctx.trueTitre,
      calcEcf: (ctx) => ctx.expAvgFromTrials,
      check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
      feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
      feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
      working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
    },
    {
      id: 'step_b',
      letter: 'b',
      field: 'molesA',
      label: 'Calculate the number of moles of hydrochloric acid present in V₁',
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00250',
      step: '0.0001',
      unit: 'moles of HCl',
      calcTheoretical: (ctx) => (ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0,
      calcEcf: (ctx) => {
        const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
        return (ctx.trueAcidMolarity * v1) / 1000.0;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Molarity × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
      working: (ctx) => `<b>(b) Moles of Acid in V₁:</b> (${ctx.trueAcidMolarity.toFixed(3)} × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((ctx.trueAcidMolarity * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
    },
    {
      id: 'step_c',
      letter: 'c',
      field: 'molesB',
      label: `Calculate the number of moles of sodium carbonate in ${Number(q1Config.pipetteVolume || 25.0).toFixed(1)} cm³ of Solution B (Mole ratio Na₂CO₃:HCl = 1:2)`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00125',
      step: '0.0001',
      unit: 'moles of Na₂CO₃',
      calcTheoretical: (ctx) => ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5,
      calcEcf: (ctx) => {
        const ma = parseFloat(getAnswerValue(ctx.answers, 'molesA', 'step_b')) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
        return ma * 0.5;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of Na₂CO₃.`,
      feedbackFail: (ctx, expTheo) => `Formula: Moles of Acid / 2 = ${expTheo.toFixed(5)} mol.`,
      working: (ctx) => `<b>(c) Moles of Na₂CO₃ in pipette volume:</b> Moles of Acid / 2 = <b>${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5).toFixed(5)} mol</b>`
    },
    {
      id: 'step_d',
      letter: 'd',
      field: 'molarityB',
      label: 'Determine the molar concentration (molarity) of Solution B in mol/dm³',
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.050',
      step: '0.001',
      unit: 'mol/dm³ (M)',
      calcTheoretical: (ctx) => ctx.trueBaseMolarity,
      calcEcf: (ctx) => {
        const mb = parseFloat(getAnswerValue(ctx.answers, 'molesB', 'step_c')) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5);
        return (mb * 1000.0) / ctx.pipetteVol;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Molarity = ${val} mol/dm³.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Moles of Na₂CO₃ × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
      working: (ctx) => `<b>(d) Molar Concentration of Na₂CO₃:</b> (${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5).toFixed(5)} × 1000) / ${ctx.pipetteVol.toFixed(1)} = <b>${ctx.trueBaseMolarity.toFixed(3)} mol/dm³</b>`
    },
    {
      id: 'step_e',
      letter: 'e',
      field: 'rfmHydrated',
      label: `Calculate the relative formula mass (RFM) of hydrated sodium carbonate (contains ${soluteMass.toFixed(2)} g/dm³)`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 286.0',
      step: '0.1',
      unit: 'g/mol',
      calcTheoretical: (ctx) => soluteMass / ctx.trueBaseMolarity,
      calcEcf: (ctx) => {
        const molarity = parseFloat(getAnswerValue(ctx.answers, 'molarityB', 'step_d')) || ctx.trueBaseMolarity;
        return soluteMass / (molarity || 0.05);
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: RFM = ${val} g/mol.`,
      feedbackFail: (ctx, expTheo) => `Formula: Mass in 1 dm³ (${soluteMass}) / Molarity = ${expTheo.toFixed(1)} g/mol.`,
      working: (ctx) => `<b>(e) Formula Mass of Hydrated Salt:</b> ${soluteMass.toFixed(2)} g / ${ctx.trueBaseMolarity.toFixed(3)} M = <b>${(soluteMass / ctx.trueBaseMolarity).toFixed(1)} g/mol</b>`
    },
    {
      id: 'step_f',
      letter: 'f',
      field: 'waterOfCryst',
      label: `Determine the value of x in Na₂CO₃·xH₂O (Na=23.0, C=12.0, O=16.0, H=1.0)`,
      marks: 1.0,
      marksLabel: '(1.0 Mark)',
      placeholder: 'e.g. 10',
      step: '1',
      unit: 'moles of H₂O',
      calcTheoretical: (ctx) => Math.round(((soluteMass / ctx.trueBaseMolarity) - anhydrousRfm) / waterRfm),
      calcEcf: (ctx) => {
        const rfm = parseFloat(getAnswerValue(ctx.answers, 'rfmHydrated', 'step_e')) || (soluteMass / ctx.trueBaseMolarity);
        return Math.round((rfm - anhydrousRfm) / waterRfm);
      },
      check: (val, ctx, expTheo, expEcf) => Math.abs(val - expTheo) <= 0.5 || Math.abs(val - expEcf) <= 0.5,
      feedbackSuccess: (val) => `✓ Correct! Water of crystallization x = ${val}. Complete formula is Na₂CO₃·10H₂O (Washing Soda).`,
      feedbackFail: (ctx, expTheo) => `Formula: (RFM - ${anhydrousRfm}) / 18 = ${expTheo}.`,
      working: (ctx) => `<b>(f) Value of x:</b> (286.0 - 106.0) / 18.0 = 180.0 / 18.0 = <b>10</b> (Na₂CO₃·10H₂O)`
    }
  ];
}

/**
 * Percentage Purity Calculation Schema Generator
 */
function createPercentagePurityQuestions(q1Config) {
  const totalSampleMass = q1Config.impureMassPerLiter || 6.00;
  const pureRfm = q1Config.pureRfm || 106.0;
  const moleRatio = (q1Config.moleRatioAcid && q1Config.moleRatioBase)
    ? (Number(q1Config.moleRatioBase) / Number(q1Config.moleRatioAcid))
    : 0.5;
  const soluteName = q1Config.baseFormula ? q1Config.baseFormula : 'pure solute';

  return [
    {
      id: 'step_a',
      letter: 'a',
      field: 'avgTitre',
      label: 'Calculate the average volume of Solution A used, V₁',
      marks: 1.0,
      marksLabel: '(1.0 Mark)',
      placeholder: 'e.g. 26.20',
      step: '0.01',
      unit: 'cm³',
      calcTheoretical: (ctx) => ctx.trueTitre,
      calcEcf: (ctx) => ctx.expAvgFromTrials,
      check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
      feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
      feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
      working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
    },
    {
      id: 'step_b',
      letter: 'b',
      field: 'molesA',
      label: 'Calculate the number of moles of acid in the average volume V₁',
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00262',
      step: '0.0001',
      unit: 'moles of acid',
      calcTheoretical: (ctx) => (ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0,
      calcEcf: (ctx) => {
        const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
        return (ctx.trueAcidMolarity * v1) / 1000.0;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of acid.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Molarity × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
      working: (ctx) => `<b>(b) Moles of Acid in V₁:</b> (${ctx.trueAcidMolarity.toFixed(3)} × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((ctx.trueAcidMolarity * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
    },
    {
      id: 'step_c',
      letter: 'c',
      field: 'molesB',
      label: `Calculate the number of moles of pure ${soluteName} present in ${Number(q1Config.pipetteVolume || 25.0).toFixed(1)} cm³ of Solution B`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00131',
      step: '0.0001',
      unit: `moles of pure ${soluteName}`,
      calcTheoretical: (ctx) => ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * moleRatio,
      calcEcf: (ctx) => {
        const ma = parseFloat(getAnswerValue(ctx.answers, 'molesA', 'step_b')) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
        return ma * moleRatio;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of pure ${soluteName}.`,
      feedbackFail: (ctx, expTheo) => `Formula: Moles of Acid × ${moleRatio} = ${expTheo.toFixed(5)} mol.`,
      working: (ctx) => `<b>(c) Moles of pure ${soluteName}:</b> Moles of Acid × ${moleRatio} = <b>${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * moleRatio).toFixed(5)} mol</b>`
    },
    {
      id: 'step_d',
      letter: 'd',
      field: 'molarityB',
      label: `Determine the molar concentration of pure ${soluteName} in Solution B in mol/dm³`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.0524',
      step: '0.0001',
      unit: 'mol/dm³ (M)',
      calcTheoretical: (ctx) => (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * moleRatio * 1000.0) / ctx.pipetteVol,
      calcEcf: (ctx) => {
        const mb = parseFloat(getAnswerValue(ctx.answers, 'molesB', 'step_c')) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * moleRatio);
        return (mb * 1000.0) / ctx.pipetteVol;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Molarity = ${val} mol/dm³.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Moles of Base × 1000) / ${ctx.pipetteVol.toFixed(1)} = ${expTheo.toFixed(4)} M.`,
      working: (ctx) => `<b>(d) Molarity of pure ${soluteName}:</b> (${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * moleRatio).toFixed(5)} × 1000) / ${ctx.pipetteVol.toFixed(1)} = <b>${((((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * moleRatio * 1000.0) / ctx.pipetteVol).toFixed(4)} M</b>`
    },
    {
      id: 'step_e',
      letter: 'e',
      field: 'massPure',
      label: `Calculate the mass of pure ${soluteName} present in 1000 cm³ of Solution B (RFM = ${pureRfm})`,
      marks: 1.5,
      marksLabel: '(1.5 Marks)',
      placeholder: 'e.g. 5.55',
      step: '0.01',
      unit: 'g',
      calcTheoretical: (ctx) => ((((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * moleRatio * 1000.0) / ctx.pipetteVol) * pureRfm,
      calcEcf: (ctx) => {
        const molarity = parseFloat(getAnswerValue(ctx.answers, 'molarityB', 'step_d')) || ((((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * moleRatio * 1000.0) / ctx.pipetteVol);
        return molarity * pureRfm;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Pure mass = ${val} g.`,
      feedbackFail: (ctx, expTheo) => `Formula: Molarity × RFM (${pureRfm}) = ${expTheo.toFixed(2)} g.`,
      working: (ctx) => `<b>(e) Mass of pure ${soluteName} in 1 dm³:</b> Molarity × ${pureRfm.toFixed(1)} = <b>${(((((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * moleRatio * 1000.0) / ctx.pipetteVol) * pureRfm).toFixed(2)} g</b>`
    },
    {
      id: 'step_f',
      letter: 'f',
      field: 'percentagePurity',
      label: `Determine the percentage purity of the commercial sample (Sample mass = ${totalSampleMass.toFixed(2)} g)`,
      marks: 1.5,
      marksLabel: '(1.5 Marks)',
      placeholder: 'e.g. 92.6',
      step: '0.1',
      unit: '%',
      calcTheoretical: (ctx) => ((((((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * moleRatio * 1000.0) / ctx.pipetteVol) * pureRfm) / totalSampleMass) * 100.0,
      calcEcf: (ctx) => {
        const pureMass = parseFloat(getAnswerValue(ctx.answers, 'massPure', 'step_e')) || ((((((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * moleRatio * 1000.0) / ctx.pipetteVol) * pureRfm));
        return (pureMass / totalSampleMass) * 100.0;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) <= 1.2) || (Math.abs(val - expEcf) <= 1.2),
      feedbackSuccess: (val) => `✓ Correct! Percentage purity = ${val.toFixed(1)}%.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Mass of pure sample / Total sample mass ${totalSampleMass}) × 100% = ${expTheo.toFixed(1)}%.`,
      working: (ctx) => `<b>(f) Percentage Purity:</b> (Pure Mass / ${totalSampleMass.toFixed(2)} g) × 100% = <b>${(((((((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * moleRatio * 1000.0) / ctx.pipetteVol) * pureRfm) / totalSampleMass) * 100.0).toFixed(1)}%</b>`
    }
  ];
}

/**
 * Relative Atomic Mass Schema Generator (e.g. M2CO3)
 */
function createRamMetalQuestions(q1Config) {
  const soluteMass = q1Config.soluteMassPerLiter || 5.30;
  return [
    {
      id: 'step_a',
      letter: 'a',
      field: 'avgTitre',
      label: 'Calculate the average volume of Solution A used, V₁',
      marks: 1.0,
      marksLabel: '(1.0 Mark)',
      placeholder: 'e.g. 25.00',
      step: '0.01',
      unit: 'cm³',
      calcTheoretical: (ctx) => ctx.trueTitre,
      calcEcf: (ctx) => ctx.expAvgFromTrials,
      check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
      feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
      feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
      working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
    },
    {
      id: 'step_b',
      letter: 'b',
      field: 'molesA',
      label: 'Calculate the number of moles of nitric acid in the average volume V₁',
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00250',
      step: '0.0001',
      unit: 'moles of HNO₃',
      calcTheoretical: (ctx) => (ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0,
      calcEcf: (ctx) => {
        const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
        return (ctx.trueAcidMolarity * v1) / 1000.0;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of HNO₃.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Molarity × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
      working: (ctx) => `<b>(b) Moles of Acid in V₁:</b> (${ctx.trueAcidMolarity.toFixed(3)} × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((ctx.trueAcidMolarity * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
    },
    {
      id: 'step_c',
      letter: 'c',
      field: 'molesB',
      label: `Calculate the number of moles of metal carbonate M₂CO₃ in ${Number(q1Config.pipetteVolume || 25.0).toFixed(1)} cm³ of Solution B`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00125',
      step: '0.0001',
      unit: 'moles of M₂CO₃',
      calcTheoretical: (ctx) => ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5,
      calcEcf: (ctx) => {
        const ma = parseFloat(getAnswerValue(ctx.answers, 'molesA', 'step_b')) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
        return ma * 0.5;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of M₂CO₃.`,
      feedbackFail: (ctx, expTheo) => `Formula: Moles of Acid / 2 = ${expTheo.toFixed(5)} mol.`,
      working: (ctx) => `<b>(c) Moles of M₂CO₃:</b> Moles of Acid / 2 = <b>${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5).toFixed(5)} mol</b>`
    },
    {
      id: 'step_d',
      letter: 'd',
      field: 'molarityB',
      label: 'Determine the molar concentration of Solution B in mol/dm³',
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.050',
      step: '0.001',
      unit: 'mol/dm³ (M)',
      calcTheoretical: (ctx) => ctx.trueBaseMolarity,
      calcEcf: (ctx) => {
        const mb = parseFloat(getAnswerValue(ctx.answers, 'molesB', 'step_c')) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5);
        return (mb * 1000.0) / ctx.pipetteVol;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Molarity = ${val} mol/dm³.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Moles of M₂CO₃ × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
      working: (ctx) => `<b>(d) Molarity of M₂CO₃:</b> (${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5).toFixed(5)} × 1000) / ${ctx.pipetteVol.toFixed(1)} = <b>${ctx.trueBaseMolarity.toFixed(3)} mol/dm³</b>`
    },
    {
      id: 'step_e',
      letter: 'e',
      field: 'rfmCarbonate',
      label: `Calculate the relative formula mass (RFM) of metal carbonate M₂CO₃ (Dissolved mass = ${soluteMass.toFixed(2)} g/dm³)`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 106.0',
      step: '0.1',
      unit: 'g/mol',
      calcTheoretical: (ctx) => soluteMass / ctx.trueBaseMolarity,
      calcEcf: (ctx) => {
        const molarity = parseFloat(getAnswerValue(ctx.answers, 'molarityB', 'step_d')) || ctx.trueBaseMolarity;
        return soluteMass / (molarity || 0.05);
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: RFM = ${val} g/mol.`,
      feedbackFail: (ctx, expTheo) => `Formula: Mass in 1 dm³ (${soluteMass}) / Molarity = ${expTheo.toFixed(1)} g/mol.`,
      working: (ctx) => `<b>(e) Formula Mass of M₂CO₃:</b> ${soluteMass.toFixed(2)} g / ${ctx.trueBaseMolarity.toFixed(3)} M = <b>${(soluteMass / ctx.trueBaseMolarity).toFixed(1)} g/mol</b>`
    },
    {
      id: 'step_f',
      letter: 'f',
      field: 'ramMetal',
      label: `Determine the relative atomic mass (Ar) of metal M (C=12.0, O=16.0) and identify metal M`,
      marks: 1.0,
      marksLabel: '(1.0 Mark)',
      placeholder: 'e.g. 23.0',
      step: '0.1',
      unit: 'g/mol (RAM)',
      calcTheoretical: (ctx) => ((soluteMass / ctx.trueBaseMolarity) - 60.0) / 2.0,
      calcEcf: (ctx) => {
        const rfm = parseFloat(getAnswerValue(ctx.answers, 'rfmCarbonate', 'step_e')) || (soluteMass / ctx.trueBaseMolarity);
        return (rfm - 60.0) / 2.0;
      },
      check: (val, ctx, expTheo, expEcf) => Math.abs(val - expTheo) <= 1.0 || Math.abs(val - expEcf) <= 1.0,
      feedbackSuccess: (val) => `✓ Correct! RAM Ar = ${val.toFixed(1)}. Metal M is Sodium (Na, Ar = 23.0).`,
      feedbackFail: (ctx, expTheo) => `Formula: (RFM - 60) / 2 = ${expTheo.toFixed(1)}. Metal is Sodium (Na).`,
      working: (ctx) => `<b>(f) RAM of Metal M:</b> 2M + 12 + 48 = 106.0 → 2M = 46.0 → <b>M = 23.0 (Sodium, Na)</b>`
    }
  ];
}

const COMPOSITE_EXAM_PRESETS = {
  // ── Series 1: National Classic (Acid-Base Stoichiometry & Heavy Metals) ──
  series_1: {
    id: 'series_1',
    seriesKey: 'series_1',
    seriesNumber: 1,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 1',
    badgeText: 'National Standard · Acid-Base Stoichiometry & Heavy Metals',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (HCl)',
      solutionB: 'Sodium Hydroxide (NaOH) solution',
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
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution B into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution A until the pink color discharges sharply to colorless.',
      procedureSteps: [
              "Fill the burette with 0.100 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Hydroxide Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution turns deep pink).",
              "Titrate Solution B with Solution A with continuous swirling until the pink colour discharges sharply to colourless.",
              "Record initial and final burette readings to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ acidRfm: 36.5, pipetteVolume: 25.0 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A pure white inorganic crystalline salt containing one cation and one anion.',
      trueSaltKey: 'Pb(NO3)2',
      trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂',
      trueCation: 'Pb2+',
      trueAnion: 'NO3-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y strongly in a dry hard-glass test tube and test any gases with moist litmus and a glowing splint.',
          correctObs: 'Solid decrepitates; brown fumes of gas evolved that turn moist blue litmus red; gas rekindles a glowing splint; residue is reddish-brown when hot, yellow on cooling',
          correctInf: 'Decomposition of a hydrated or nitrate salt; NO₂ and O₂ gases evolved; Pb²⁺ and NO₃⁻ present'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve the remainder of Solid Y in about 10 cm³ of distilled water in a boiling tube. Divide into 3 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear, colorless solution',
          correctInf: 'Soluble salt; absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺ absent)'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess NaOH to form a clear colorless solution',
          correctInf: 'Pb²⁺, Zn²⁺, or Al³⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess aqueous NH₃',
          correctInf: 'Pb²⁺ or Al³⁺ present (Zn²⁺ absent)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of Potassium Iodide (KI) solution and warm gently, then allow to cool.',
          correctObs: 'Bright yellow precipitate formed; dissolves on boiling to colorless solution and recrystallizes as golden yellow spangles on cooling',
          correctInf: 'Pb²⁺ confirmed present (PbI₂ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A neutral, miscible organic liquid sample.',
      trueOrganicKey: 'Ethanol',
      trueOrganicName: 'Ethanol — C₂H₅OH',
      trueFunctionalGroup: 'Alkanol (-OH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; leaves no carbon residue',
          correctInf: 'Saturated aliphatic organic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
          correctObs: 'Both red and blue litmus papers retain their color (neutral pH ~ 7)',
          correctInf: 'Neutral organic substance; carboxylic acid (—COOH) and basic amine absent'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z in a test tube, add 3 drops of acidified KMnO₄ and warm gently in a water bath.',
          correctObs: 'Purple acidified KMnO₄ solution turns colorless (decolorized)',
          correctInf: 'Primary or secondary alkanol (—OH) present / readily oxidizable group'
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

  // ── Series 2: Stoichiometric Hydration (Water of Crystallization x) ──
  series_2: {
    id: 'series_2',
    seriesKey: 'series_2',
    seriesNumber: 2,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 2',
    badgeText: 'Stoichiometric Hydration · Water of Crystallization Determination',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'water_of_crystallization',
      title: 'Question 1: Volumetric Analysis — Water of Crystallization (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (HCl)',
      solutionB: 'Hydrated Sodium Carbonate (Na₂CO₃·xH₂O) containing 14.30 g/dm³',
      acidFormula: 'HCl',
      baseFormula: 'Na2CO3',
      indicator: 'Methyl Orange',
      pipetteVolume: 25.0,
      soluteMassPerLiter: 14.30,
      anhydrousRfm: 106.0,
      trueAcidMolarity: 0.100,
      trueBaseMolarity: 0.050,
      trueTitre: 25.00,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 286.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.3)',
      flaskIndicatorColor: 'rgba(245,158,11,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      equation: '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)',
      instructions: 'Titrate 25.0 cm³ of Solution B with Solution A using 3 drops of Methyl Orange indicator until the yellow solution turns orange/red.',
      procedureSteps: [
              "Fill the burette with 0.100 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Hydrated Sodium Carbonate Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution B with Solution A with continuous swirling until the yellow solution turns sharply to permanent orange-red.",
              "Record initial and final burette readings to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createWaterOfCrystallizationQuestions({ soluteMassPerLiter: 14.30, pipetteVolume: 25.0, anhydrousRfm: 106.0 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A pale green inorganic hydrated salt sample.',
      trueSaltKey: 'FeSO4',
      trueSaltName: 'Iron(II) Sulfate — FeSO₄',
      trueCation: 'Fe2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube gently, then strongly.',
          correctObs: 'Pale green solid loses luster, turns white then dirty brown; droplets of colorless liquid condense on upper cooler walls',
          correctInf: 'Hydrated crystalline salt; loses water of crystallization'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve the remainder of Solid Y in 10 cm³ of distilled water. Divide into 3 portions.',
          correctObs: 'Pale green crystalline solid dissolves to give a pale green solution',
          correctInf: 'Soluble transition metal salt; Fe²⁺ present'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'Dirty green gelatinous precipitate formed, insoluble in excess NaOH; turns reddish-brown on surface on standing',
          correctInf: 'Fe²⁺ present; slowly oxidizes to Fe³⁺ by atmospheric oxygen'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'Dirty green precipitate formed, insoluble in excess aqueous NH₃',
          correctInf: 'Fe²⁺ confirmed present'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of dilute HNO₃ followed by 3 drops of Ba(NO₃)₂ solution.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute HNO₃',
          correctInf: 'SO₄²⁻ confirmed present'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A pungent, water-soluble organic liquid sample.',
      trueOrganicKey: 'Ethanoic Acid',
      trueOrganicName: 'Ethanoic Acid — CH₃COOH',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; characteristic sharp vinegar odor',
          correctInf: 'Saturated organic compound / lower alkanoic acid'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (pH ~ 3)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
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
          correctObs: 'Vigorous effervescence of a colorless gas that forms a white precipitate with lime water',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 3: Percentage Purity Determination & Alkene Decolorization ──
  series_3: {
    id: 'series_3',
    seriesKey: 'series_3',
    seriesNumber: 3,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 3',
    badgeText: 'Industrial Purity Assay & Alkene Electrophilic Halogenation',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'percentage_purity',
      title: 'Question 1: Volumetric Analysis — Percentage Purity (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (HCl)',
      solutionB: 'Impure Commercial Sodium Carbonate (6.00 g/dm³ sample)',
      acidFormula: 'HCl',
      baseFormula: 'Na2CO3',
      indicator: 'Methyl Orange',
      pipetteVolume: 25.0,
      impureMassPerLiter: 6.00,
      pureRfm: 106.0,
      trueAcidMolarity: 0.100,
      trueBaseMolarity: 0.0524,
      trueTitre: 26.20,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 106.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.3)',
      flaskIndicatorColor: 'rgba(245,158,11,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      equation: '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)',
      instructions: 'Titrate 25.0 cm³ of impure Solution B with Solution A using Methyl Orange indicator until the solution turns permanently orange/red.',
      procedureSteps: [
              "Fill the burette with 0.100 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Impure Sodium Carbonate Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution B with Solution A with continuous swirling until the yellow solution turns sharply to permanent orange-red.",
              "Record initial and final burette readings to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createPercentagePurityQuestions({ impureMassPerLiter: 6.00, pipetteVolume: 25.0, pureRfm: 106.0 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A pure white inorganic crystalline salt.',
      trueSaltKey: 'ZnSO4',
      trueSaltName: 'Zinc Sulfate — ZnSO₄',
      trueCation: 'Zn2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a small portion of Solid Y strongly in a dry test tube.',
          correctObs: 'Solid turns yellow when hot and white on cooling (ZnO formation); colorless vapor condenses',
          correctInf: 'Compound of zinc; hydrated salt'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve the remainder of Solid Y in 10 cm³ of distilled water. Divide into 3 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear colorless solution',
          correctInf: 'Soluble salt; absence of colored transition metal ions'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess NaOH to give a clear colorless solution',
          correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves completely in excess aqueous NH₃ to give a colorless solution',
          correctInf: 'Zn²⁺ confirmed present (Al³⁺ and Pb²⁺ are insoluble in excess NH₃)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of dilute HNO₃ followed by 3 drops of Ba(NO₃)₂ solution.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A volatile, non-polar organic liquid.',
      trueOrganicKey: 'Cyclohexene',
      trueOrganicName: 'Cyclohexene — C₆H₁₀',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
          correctObs: 'Burns with a luminous, highly smoky and sooty yellow flame; black carbon residue left',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C< or —C≡C— present)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
          correctObs: 'No color change on either blue or red litmus paper (neutral)',
          correctInf: 'Neutral hydrocarbon / absence of carboxylic acid and amine'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and shake vigorously in the cold.',
          correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized (turns colorless)',
          correctInf: 'Unsaturated carbon-carbon double bond (>C=C<) present'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add 1 cm³ of Bromine water and shake in the dark.',
          correctObs: 'Reddish-brown / yellow bromine water is rapidly decolorized without effervescence',
          correctInf: 'Alkene (>C=C<) confirmed present by electrophilic addition'
        }
      ]
    }
  },

  // ── Series 4: Redox Stoichiometry & Transition Metals ─────────────
  series_4: {
    id: 'series_4',
    seriesKey: 'series_4',
    seriesNumber: 4,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 4',
    badgeText: 'Redox Volumetric Analysis & Transition Metal Complexation',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'redox_stoichiometry',
      title: 'Question 1: Volumetric Redox Analysis (15.0 Marks)',
      solutionA: '0.020 M Potassium Manganate(VII) (KMnO₄)',
      solutionB: 'Acidified Ammonium Iron(II) Sulfate [(NH₄)₂Fe(SO₄)₂·6H₂O] solution',
      acidFormula: 'KMnO4',
      baseFormula: 'Fe2+',
      indicator: 'Self-indicating (KMnO₄)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.020,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 5,
      acidRfm: 158.0,
      baseRfm: 392.0,
      titrantColor: '#A855F7',
      flaskBaseColor: 'rgba(16,185,129,0.18)',
      flaskIndicatorColor: 'rgba(16,185,129,0.18)',
      endpointColor: 'rgba(236,72,153,0.7)',
      equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      instructions: 'Titrate 25.0 cm³ of acidified Solution B with Solution A until the first permanent pale pink coloration persists for at least 30 seconds.',
      procedureSteps: [
              "Fill the burette with 0.020 M Acidified Potassium Manganate(VII) Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Iron(II) Sulfate Solution B into a clean 250 cm³ conical flask.",
              "Add about 10 cm³ of 1 M dilute sulfuric acid using a measuring cylinder.",
              "Titrate Solution B with Solution A with continuous swirling until the first permanent faint pink colour persists for at least 30 seconds.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ baseRfm: 392.0, pipetteVolume: 25.0 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A bright blue crystalline inorganic solid.',
      trueSaltKey: 'CuSO4',
      trueSaltName: 'Copper(II) Sulfate — CuSO₄',
      trueCation: 'Cu2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a spatula-end full of Solid Y gently in a dry test tube.',
          correctObs: 'Bright blue crystalline solid turns white; colorless liquid condenses on upper cooler walls',
          correctInf: 'Hydrated copper(II) salt; loses water of crystallization'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve the remainder of Solid Y in 10 cm³ of distilled water. Divide into 3 portions.',
          correctObs: 'Blue crystalline solid dissolves to form a clear blue solution',
          correctInf: 'Soluble transition metal salt; Cu²⁺ present'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'Pale blue precipitate formed, insoluble in excess NaOH',
          correctInf: 'Cu²⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'Pale blue precipitate formed with few drops, dissolves in excess aqueous NH₃ to give a royal deep blue solution',
          correctInf: 'Cu²⁺ confirmed present as [Cu(NH₃)₄]²⁺ complex ion'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of dilute HCl followed by 3 drops of BaCl₂ solution.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute hydrochloric acid',
          correctInf: 'SO₄²⁻ confirmed present'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A colorless organic liquid with a pleasant spirit odor.',
      trueOrganicKey: 'Propan-1-ol',
      trueOrganicName: 'Propan-1-ol — C₃H₇OH',
      trueFunctionalGroup: 'Alkanol (-OH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
          correctObs: 'Burns with a clean, pale blue non-sooty flame; leaves no residue',
          correctInf: 'Saturated aliphatic compound / lower alkanol'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
          correctObs: 'Both blue and red litmus papers remain unchanged in color',
          correctInf: 'Neutral organic liquid; absence of carboxylic acid'
        },
        {
          id: 'q3_dichromate',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified K₂Cr₂O₇ and warm gently in a water bath.',
          correctObs: 'Orange acidified K₂Cr₂O₇ turns green with characteristic pleasant fruity odor',
          correctInf: 'Primary or secondary alkanol (—OH) confirmed oxidized to aldehyde/acid'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end of solid anhydrous Sodium Carbonate.',
          correctObs: 'No effervescence / no gas evolved',
          correctInf: 'Carboxylic acid (—COOH) absent'
        }
      ]
    }
  },

  // ── Series 5: Relative Atomic Mass (Ar) & Two-Salt Mixture Separation ──
  series_5: {
    id: 'series_5',
    seriesKey: 'series_5',
    seriesNumber: 5,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 5',
    badgeText: 'Atomic Mass Deduction (Ar) & Periodic Element Identification',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'ram_metal',
      title: 'Question 1: Volumetric Analysis — Atomic Mass Determination (15.0 Marks)',
      solutionA: '0.100 M Nitric Acid (HNO₃)',
      solutionB: 'Unknown Monovalent Metal Carbonate (M₂CO₃) containing 5.30 g/dm³',
      acidFormula: 'HNO3',
      baseFormula: 'M2CO3',
      indicator: 'Methyl Orange',
      pipetteVolume: 25.0,
      soluteMassPerLiter: 5.30,
      trueAcidMolarity: 0.100,
      trueBaseMolarity: 0.050,
      trueTitre: 25.00,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 63.0,
      baseRfm: 106.0,
      titrantColor: '#06B6D4',
      flaskBaseColor: 'rgba(6,182,212,0.25)',
      flaskIndicatorColor: 'rgba(245,158,11,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      equation: 'M₂CO₃(aq) + 2HNO₃(aq) → 2MNO₃(aq) + CO₂(g) + H₂O(l)',
      instructions: 'Titrate 25.0 cm³ of Solution B with Solution A using Methyl Orange indicator until the yellow solution turns orange/red.',
      procedureSteps: [
              "Fill the burette with 0.020 M Acidified Potassium Manganate(VII) Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Hydrated Ethanedioic Acid Solution B into a clean 250 cm³ conical flask.",
              "Add about 10 cm³ of 1 M dilute sulfuric acid and warm the mixture gently on wire gauze to about 60 °C.",
              "Titrate hot Solution B with Solution A with continuous swirling until the first permanent pale pink colour persists for 30 seconds.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createRamMetalQuestions({ soluteMassPerLiter: 5.30, pipetteVolume: 25.0 })
    },
    q2: {
      type: 'qualitative_mixture',
      title: 'Question 2: Inorganic Two-Salt Mixture Analysis (15.0 Marks)',
      sampleName: 'Solid Mixture P',
      sampleDesc: 'A solid mixture containing two salts: one soluble in water and one insoluble in water.',
      trueSaltKey: 'ZnSO4 + BaSO4',
      trueSaltName: 'Zinc Sulfate + Barium Sulfate Mixture',
      trueCation: 'Zn2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_appearance',
          prompt: '(i) Place Solid Mixture P in a beaker, add 15 cm³ of distilled water, stir thoroughly and filter. Retain both filtrate and residue.',
          correctObs: 'White residue remains on filter paper; clear colorless filtrate collected in boiling tube',
          correctInf: 'Mixture consists of an insoluble salt (residue) and a soluble salt (filtrate)'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) To 2 cm³ of the filtrate, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess NaOH to form a colorless solution',
          correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present in filtrate'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To 2 cm³ of the filtrate, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves completely in excess aqueous NH₃',
          correctInf: 'Zn²⁺ confirmed present in filtrate (Al³⁺ and Pb²⁺ are insoluble in excess NH₃)'
        },
        {
          id: 'q2_anion',
          prompt: '(iv) To 2 cm³ of the filtrate, add 3 drops of dilute HNO₃ followed by Ba(NO₃)₂ solution.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present in filtrate'
        },
        {
          id: 'q2_residue',
          prompt: '(v) Transfer a half spatula of the residue into a test tube and add 2 cm³ of 2M dilute HCl.',
          correctObs: 'Residue remains completely insoluble in dilute hydrochloric acid; no effervescence',
          correctInf: 'Insoluble barium sulfate (BaSO₄) confirmed in residue; carbonate absent'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A pungent organic liquid possessing dual chemical properties.',
      trueOrganicKey: 'Methanoic Acid',
      trueOrganicName: 'Methanoic Acid (Formic Acid) — HCOOH',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a Bunsen flame.',
          correctObs: 'Burns with a non-sooty blue flame; sharp pungent fumes',
          correctInf: 'Lower saturated carboxylic acid / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red',
          correctInf: 'Strongly acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and warm gently.',
          correctObs: 'Purple acidified KMnO₄ solution turns colorless (decolorized) with gentle bubbling',
          correctInf: 'Methanoic acid reduces KMnO₄ due to the unique formyl (—CHO) hydrogen structure'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Rapid vigorous effervescence; gas turns calcium hydroxide solution milky',
          correctInf: 'Carboxylic acid (—COOH) confirmed; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 6: Dibasic Organic Acid & Ammonium Salt Sublimation ────
  series_6: {
    id: 'series_6',
    seriesKey: 'series_6',
    seriesNumber: 6,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 6',
    badgeText: 'Dibasic Acid Neutralization & Ammonium Sublimation Dynamics',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Dibasic Organic Acid (15.0 Marks)',
      solutionA: '0.050 M Ethanedioic Acid (H₂C₂O₄·2H₂O)',
      solutionB: 'Sodium Hydroxide (NaOH) solution',
      acidFormula: 'H2C2O4',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.050,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 2,
      acidRfm: 126.0,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      equation: 'H₂C₂O₄(aq) + 2NaOH(aq) → Na₂C₂O₄(aq) + 2H₂O(l)',
      instructions: 'Titrate 25.0 cm³ of Solution B with Solution A until the pink color turns permanently colorless.',
      procedureSteps: [
              "Fill the burette with 0.200 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Metal Carbonate M₂CO₃ Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution B with Solution A with continuous swirling until the yellow colour turns sharply to orange-red.",
              "Record initial and final burette readings to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ baseRfm: 40.0, pipetteVolume: 25.0 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A pure white inorganic solid containing one cation and one anion.',
      trueSaltKey: 'NH4Cl',
      trueSaltName: 'Ammonium Chloride — NH₄Cl',
      trueCation: 'NH4+',
      trueAnion: 'Cl-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube gently, then strongly.',
          correctObs: 'White crystalline solid sublimes; dense white fumes form and deposit on cooler upper walls of tube',
          correctInf: 'Sublimable salt; NH₄⁺ salt present'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) Dissolve the remainder of Solid Y in 10 cm³ water. To 2 cm³ of solution Y, add 2M NaOH and warm gently.',
          correctObs: 'No precipitate; colorless gas evolved with pungent choking smell, turns moist red litmus paper blue and gives dense white fumes with conc. HCl',
          correctInf: 'NH₃ gas evolved; NH₄⁺ confirmed present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'No precipitate formed with drops or excess aqueous NH₃',
          correctInf: 'Ammonium or alkali salt; transition metal ions absent'
        },
        {
          id: 'q2_anion',
          prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of lead(II) nitrate solution and warm the mixture.',
          correctObs: 'White precipitate formed, which dissolves on warming to form a colourless solution (reappears on cooling)',
          correctInf: 'Cl⁻ confirmed present (PbCl₂ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid Z',
      sampleDesc: 'A white crystalline solid organic compound.',
      trueOrganicKey: 'Benzoic Acid',
      trueOrganicName: 'Benzoic Acid — C₆H₅COOH',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place a small portion of Solid Z on a metallic spatula and ignite in a Bunsen flame.',
          correctObs: 'Melts and burns with a yellow, highly smoky sooty flame; leaves carbon residue',
          correctInf: 'Aromatic compound or high carbon:hydrogen ratio compound'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Shake Solid Z with 3 cm³ of warm water and test with moist blue and red litmus paper.',
          correctObs: 'Dissolves partially; moist blue litmus paper turns red; red litmus unchanged',
          correctInf: 'Acidic substance / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_bromine',
          prompt: '(iii) To 2 cm³ of the aqueous solution of Solid Z, add 3 drops of Bromine water.',
          correctObs: 'Bromine water color remains yellow/orange (not decolorized without catalyst)',
          correctInf: 'Aliphatic alkene / alkyne absent; stable aromatic benzene ring'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of the solution of Solid Z, add solid Sodium Hydrogen Carbonate.',
          correctObs: 'Vigorous effervescence of a colorless gas that turns lime water milky',
          correctInf: 'Carboxylic acid (—COOH) confirmed present'
        }
      ]
    }
  },

  // ── Series 2023: Official KCSE 2023 Standard Chemistry Practical (Paper 233/3) ──
  series_2023: {
    id: 'series_2023',
    seriesKey: 'series_2023',
    seriesNumber: 2023,
    title: 'KCSE 2023 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2023 Past National Paper · Ethanedioic Acid & Hexene Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis (15.0 Marks)',
      solutionA: '0.050 M Hydrated Ethanedioic Acid (H₂C₂O₄·2H₂O)',
      solutionB: 'Sodium Hydroxide (NaOH) solution',
      acidFormula: 'H2C2O4',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.050,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 2,
      acidRfm: 126.0,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      overtitratedColor: 'rgba(255,255,255,0.20)',
      equation: 'H₂C₂O₄(aq) + 2NaOH(aq) → Na₂C₂O₄(aq) + 2H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution B into a conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution A until the pink color discharges sharply to colorless.',
      procedureSteps: [
              "Fill the burette with 0.050 M Ethanedioic Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Hydroxide Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution turns deep pink).",
              "Titrate Solution B with Solution A with continuous swirling until the pink colour discharges sharply to colourless.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ acidRfm: 126.0, baseRfm: 40.0, pipetteVolume: 25.0, moleRatioAcid: 1, moleRatioBase: 2 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A pure white inorganic crystalline salt containing one cation and one anion.',
      trueSaltKey: 'Ca(NO3)2',
      trueSaltName: 'Calcium Nitrate — Ca(NO₃)₂',
      trueCation: 'Ca2+',
      trueAnion: 'NO3-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y strongly in a dry hard-glass test tube and test any gases evolved with moist litmus and a glowing splint.',
          correctObs: 'Solid decrepitates and melts; brown fumes evolved that turn moist blue litmus red; gas rekindles a glowing wooden splint; white residue remains',
          correctInf: 'Thermal decomposition of nitrate salt; NO₂ and O₂ gases evolved; NO₃⁻ present'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve the remainder of Solid Y in about 10 cm³ of distilled water in a boiling tube. Divide the resulting solution into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear, colorless solution',
          correctInf: 'Soluble salt; absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺ absent)'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Ca²⁺ or Mg²⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'No precipitate formed with drops or with excess aqueous ammonia',
          correctInf: 'Ca²⁺ confirmed present'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3–4 drops of dilute sulfuric acid (H₂SO₄).',
          correctObs: 'White precipitate formed (sparingly soluble CaSO₄)',
          correctInf: 'Ca²⁺ confirmed present'
        },
        {
          id: 'q2_flame',
          prompt: '(vi) Dip a clean glass rod into portion 4 and place it in the non-luminous flame of a Bunsen burner.',
          correctObs: 'Brick-red / orange-red flame',
          correctInf: 'Ca²⁺ confirmed present'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A clear, colorless, volatile organic liquid.',
      trueOrganicKey: 'Hex-1-ene',
      trueOrganicName: 'Hex-1-ene — C₆H₁₂',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Burns with a luminous, highly smoky and sooty yellow flame; leaves carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon:hydrogen ratio compound (>C=C< or -C≡C-)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Add 2 cm³ of distilled water to 2 cm³ of Liquid Z, shake, and test with moist red and blue litmus paper.',
          correctObs: 'Forms two immiscible layers with liquid Z floating on water; no color change on either blue or red litmus paper',
          correctInf: 'Neutral organic substance; insoluble non-polar hydrocarbon'
        },
        {
          id: 'q3_bromine',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of Bromine water in the dark and shake thoroughly.',
          correctObs: 'Reddish-brown bromine water is rapidly decolorized (turns colorless)',
          correctInf: 'Unsaturated compound / Alkene (>C=C<) present by electrophilic addition'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and shake.',
          correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized',
          correctInf: 'Alkene (>C=C<) confirmed present'
        }
      ]
    }
  },

  // ── Series 2025: Official KCSE 2025 Standard Chemistry Practical (Paper 233/3) ──
  series_2025: {
    id: 'series_2025',
    seriesKey: 'series_2025',
    seriesNumber: 2025,
    title: 'KCSE 2025 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2025 Past National Paper · Ammonium Iron(II) Sulfate vs KMnO₄ & Zinc Alum',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Iron(II) Redox Titration (15.0 Marks)',
      solutionA: '0.020 M Acidified Potassium Manganate(VII) Solution A',
      solutionB: 'Hydrated Ammonium Iron(II) Sulfate Solution B (39.20 g/dm³)',
      acidFormula: 'KMnO4',
      baseFormula: 'FeSO4',
      indicator: 'Potassium Manganate(VII)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.020,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 5,
      acidRfm: 158.0,
      baseRfm: 392.0,
      titrantColor: '#701A75',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(56,189,248,0.25)',
      endpointColor: 'rgba(244,114,182,0.65)',
      overtitratedColor: 'rgba(126,34,206,0.95)',
      equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution B into a clean conical flask. Add about 10 cm³ of 1M sulfuric acid. Fill the burette with 0.020 M acidified KMnO₄ Solution A. Titrate Solution B with Solution A until the first permanent pale pink colour persists for at least 30 seconds.',
      procedureSteps: [
              "Fill the burette with 0.020 M Acidified Potassium Manganate(VII) Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Ammonium Iron(II) Sulfate Solution B into a clean 250 cm³ conical flask.",
              "Add about 10 cm³ of 1 M dilute sulfuric acid using a measuring cylinder.",
              "Titrate Solution B with Solution A with continuous swirling until the first permanent pale pink colour persists for at least 30 seconds.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.020 M KMnO₄ Solution A used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesKMnO4',
          label: 'Calculate the number of moles of KMnO₄ present in average volume V₁ of Solution A (0.020 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00050',
          step: '0.00001',
          unit: 'moles of KMnO₄',
          calcTheoretical: (ctx) => (ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (ctx.trueAcidMolarity * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of KMnO₄.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.020 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of KMnO₄:</b> (0.020 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((ctx.trueAcidMolarity * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesFe',
          label: 'Determine the number of moles of Fe²⁺ in 25.0 cm³ of Solution B (Mole ratio MnO₄⁻ : Fe²⁺ = 1 : 5)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00250',
          step: '0.00001',
          unit: 'moles of Fe²⁺',
          calcTheoretical: (ctx) => ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 5.0,
          calcEcf: (ctx) => {
            const mk = parseFloat(getAnswerValue(ctx.answers, 'molesKMnO4', 'step_b')) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
            return mk * 5.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Fe²⁺ in 25.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of KMnO₄ × 5 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of Fe²⁺ in 25.0 cm³:</b> ${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0)).toFixed(5)} × 5 = <b>${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 5.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityFe',
          label: 'Calculate the molar concentration (molarity) of Solution B in mol/dm³',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.100',
          step: '0.001',
          unit: 'mol/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mf = parseFloat(getAnswerValue(ctx.answers, 'molesFe', 'step_c')) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 5.0);
            return (mf * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution B = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of Fe²⁺ × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution B:</b> (Moles × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(3)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'rfmMohr',
          label: 'Given that Solution B contains 39.20 g/dm³ of hydrated ammonium iron(II) sulfate, calculate its relative formula mass (RFM)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 392.0',
          step: '0.1',
          unit: 'g/mol',
          calcTheoretical: (ctx) => 39.20 / ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const molB = parseFloat(getAnswerValue(ctx.answers, 'molarityFe', 'step_d')) || ctx.trueBaseMolarity;
            return 39.20 / (molB || 0.100);
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: RFM = ${val} g/mol (Mohr's Salt).`,
          feedbackFail: (ctx, expTheo) => `Formula: 39.20 g/dm³ / Molarity = ${expTheo.toFixed(1)} g/mol.`,
          working: (ctx) => `<b>(e) Relative Formula Mass (RFM):</b> 39.20 / ${ctx.trueBaseMolarity.toFixed(3)} = <b>${(39.20 / ctx.trueBaseMolarity).toFixed(1)} g/mol</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid Y (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A white crystalline inorganic double salt containing two cations and one anion.',
      trueSaltKey: 'zincAmmoniumSulfate',
      trueSaltName: 'Ammonium Zinc Sulfate Alum — (NH₄)₂Zn(SO₄)₂·6H₂O',
      trueCation: 'Zn2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y in a dry hard-glass test tube strongly and test vapours with moist litmus papers.',
          correctObs: 'Water droplets condense on cooler walls; pungent alkaline gas evolved turning moist red litmus blue; white residue turns yellow hot and cools to white',
          correctInf: 'Hydrated salt; NH₄⁺ present (NH₃ gas); Zn²⁺ indicated (ZnO residue)'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid Y in about 10 cm³ of distilled water in a boiling tube. Divide into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear, colourless solution',
          correctInf: 'Soluble salt; absence of coloured transition metal ions'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess, then warm gently and test vapours with moist red litmus.',
          correctObs: 'White precipitate formed, dissolves in excess sodium hydroxide to form a clear colourless solution; on warming, pungent gas evolves turning moist red litmus blue',
          correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present; NH₄⁺ confirmed present (NH₃ gas)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess aqueous ammonia to form a clear colourless solution',
          correctInf: 'Zn²⁺ confirmed present ([Zn(NH₃)₄]²⁺ complex formed; Al³⁺ and Pb²⁺ absent)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of Barium Nitrate solution followed by dilute nitric acid.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Liquid Z (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A clear colourless organic liquid with a sharp, pungent odor.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Carboxylic Acid (Acrylic Acid)',
      trueFunctionalGroup: 'Unsaturated Carboxylic Acid (-COOH, >C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon:hydrogen ratio (>C=C<)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Add 2 cm³ of distilled water to Liquid Z and test with moist blue and red litmus paper.',
          correctObs: 'Dissolves completely; moist blue litmus paper turns red; red litmus unchanged (pH ~ 2.5)',
          correctInf: 'Acidic organic substance / contains ionizable H⁺ ions / carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of Liquid Z, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_bromine',
          prompt: '(iv) To 2 cm³ of Liquid Z, add 3–4 drops of Bromine water and shake gently.',
          correctObs: 'Reddish-brown colour of bromine water is rapidly decolorized to colourless',
          correctInf: 'Carbon-carbon double bond (>C=C<) confirmed present by electrophilic addition'
        },
        {
          id: 'q3_kmno4',
          prompt: '(v) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present'
        }
      ]
    }
  },

  // ── Series 2024: Official KCSE 2024 Standard Chemistry Practical (Paper 233/3) ──
  series_2024: {
    id: 'series_2024',
    seriesKey: 'series_2024',
    seriesNumber: 2024,
    title: 'KCSE 2024 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2024 Past National Paper · Percentage Purity & Alkanol Oxidation',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'percentage_purity',
      title: 'Question 1: Volumetric Analysis (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (HCl)',
      solutionB: 'Impure Sodium Hydrogen Carbonate (NaHCO₃) containing 10.00 g/dm³',
      acidFormula: 'HCl',
      baseFormula: 'NaHCO3',
      indicator: 'Methyl Orange',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.100,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 36.5,
      pureRfm: 84.0,
      impureMassPerLiter: 10.00,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.25)',
      flaskIndicatorColor: 'rgba(251,191,36,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      overtitratedColor: 'rgba(185,28,28,0.95)',
      equation: 'HCl(aq) + NaHCO₃(aq) → NaCl(aq) + H₂O(l) + CO₂(g)',
      instructions: 'Pipette 25.0 cm³ of Solution B into a conical flask. Add 2 drops of methyl orange indicator. Titrate with Solution A until the yellow solution turns sharply to orange-red.',
      procedureSteps: [
              "Fill the burette with 0.100 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Impure Sodium Hydrogen Carbonate Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution B with Solution A with continuous swirling until the yellow solution turns sharply to permanent orange-red.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createPercentagePurityQuestions({ impureMassPerLiter: 10.00, pureRfm: 84.0, pipetteVolume: 25.0, moleRatioAcid: 1, moleRatioBase: 1, baseFormula: 'NaHCO₃' })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A brownish-yellow crystalline inorganic salt containing one cation and one anion.',
      trueSaltKey: 'FeCl3',
      trueSaltName: 'Iron(III) Chloride — FeCl₃',
      trueCation: 'Fe3+',
      trueAnion: 'Cl-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube gently, then strongly.',
          correctObs: 'Brown crystalline solid melts and condenses as dark brown fumes on upper cooler walls; acidic fumes evolve that turn moist blue litmus red',
          correctInf: 'Hydrated transition metal halide; FeCl₃ sublimes and decomposes'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve the remainder of Solid Y in about 10 cm³ of distilled water in a boiling tube. Divide into 4 portions.',
          correctObs: 'Brown-yellow crystalline solid dissolves completely to form a yellow-brown solution',
          correctInf: 'Soluble transition metal salt; Fe³⁺ likely present'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'Reddish-brown precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Fe³⁺ present (Fe(OH)₃ formed)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia dropwise until in excess.',
          correctObs: 'Reddish-brown precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Fe³⁺ confirmed present'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of lead(II) nitrate solution and warm the mixture.',
          correctObs: 'White precipitate formed, which dissolves on warming to form a colourless solution (reappears on cooling)',
          correctInf: 'Cl⁻ confirmed present (PbCl₂ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A clear, colorless liquid with a characteristic sweet, pleasant spirituous odor.',
      trueOrganicKey: 'Butan-1-ol',
      trueOrganicName: 'Butan-1-ol — CH₃(CH₂)₃OH',
      trueFunctionalGroup: 'Alkanol (-OH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; no smoke',
          correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Add 2 cm³ of distilled water to 2 cm³ of Liquid Z, shake, and test with moist red and blue litmus paper.',
          correctObs: 'Dissolves partially; no color change on either blue or red litmus paper',
          correctInf: 'Neutral organic substance; absence of carboxylic acid and amine'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Dichromate(VI) (K₂Cr₂O₇) and warm gently in a water bath.',
          correctObs: 'Orange potassium dichromate(VI) turns green; a pleasant fruity pungent smell is produced',
          correctInf: 'Primary or secondary alkanol (—OH) present; Cr₂O₇²⁻ reduced to Cr³⁺'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'No effervescence / no bubbles of gas evolved',
          correctInf: 'Carboxylic acid (—COOH) absent; Alkanol (—OH) confirmed present'
        }
      ]
    }
  },

  // ── Series 2022: Official KCSE 2022 Standard Chemistry Practical (Paper 233/3) ──
  series_2022: {
    id: 'series_2022',
    seriesKey: 'series_2022',
    seriesNumber: 2022,
    title: 'KCSE 2022 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2022 Past National Paper · Sodium Carbonate, Magnesium & Carboxylic Acid',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (HCl)',
      solutionB: 'Sodium Carbonate (Na₂CO₃) solution',
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
      baseRfm: 106.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.25)',
      flaskIndicatorColor: 'rgba(251,191,36,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      overtitratedColor: 'rgba(185,28,28,0.95)',
      equation: '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution B into a clean conical flask. Add 2–3 drops of methyl orange indicator. Titrate with Solution A until the yellow color changes sharply to permanent orange-red.',
      procedureSteps: [
              "Fill the burette with 0.100 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Carbonate Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution B with Solution A with continuous swirling until the yellow colour changes sharply to permanent orange-red.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ baseRfm: 106.0, pipetteVolume: 25.0 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A white crystalline inorganic salt containing one cation and one anion.',
      trueSaltKey: 'MgSO4',
      trueSaltName: 'Magnesium Sulfate — MgSO₄',
      trueCation: 'Mg2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube gently, then strongly.',
          correctObs: 'White crystalline solid loses luster and decomposes slightly; droplets of colorless liquid condense on upper cooler walls; white residue remains',
          correctInf: 'Hydrated salt; loses water of crystallization'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve the remainder of Solid Y in about 10 cm³ of distilled water in a boiling tube. Divide into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear, colorless solution',
          correctInf: 'Soluble salt; absence of colored transition metal ions (Cu²⁺, Fe²⁺, Fe³⁺ absent)'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Mg²⁺, Ca²⁺, or Ba²⁺ present (Al³⁺, Pb²⁺, Zn²⁺ absent)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Mg²⁺ confirmed present (Ca²⁺ forms no precipitate with aqueous NH₃)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of Barium Nitrate solution followed by dilute nitric acid.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A colorless organic liquid with a pungent, vinegar-like odor.',
      trueOrganicKey: 'Propanoic Acid',
      trueOrganicName: 'Propanoic Acid — CH₃CH₂COOH',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; sharp pungent odor; leaves no carbon residue',
          correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Test 2 cm³ of Liquid Z with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (pH ~ 3)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and warm gently.',
          correctObs: 'Purple acidified KMnO₄ solution remains unchanged (purple color persists, not decolorized)',
          correctInf: 'Alkene (>C=C<) and primary/secondary alkanol absent'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colorless gas that forms a white precipitate with limewater',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 2021: Official KCSE 2021 Standard Chemistry Practical (Paper 233/3) ──
  series_2021: {
    id: 'series_2021',
    seriesKey: 'series_2021',
    seriesNumber: 2021,
    title: 'KCSE 2021 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2021 Past National Paper · KMnO₄ vs Ethanedioic Acid & Zinc Carbonate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Redox Titration of KMnO₄ (15.0 Marks)',
      solutionA: '0.020 M Acidified Potassium Manganate(VII) Solution A',
      solutionB: '0.050 M Hydrated Ethanedioic Acid Solution B (H₂C₂O₄·2H₂O)',
      acidFormula: 'KMnO4',
      baseFormula: 'H2C2O4',
      indicator: 'Self-indicating (KMnO₄ permanent faint pink end-point)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.020,
      trueBaseMolarity: 0.050,
      trueTitre: 25.00,
      moleRatioAcid: 2,
      moleRatioBase: 5,
      acidRfm: 158.0,
      baseRfm: 126.0,
      titrantColor: '#701A75',
      flaskBaseColor: 'rgba(255,255,255,0.25)',
      flaskIndicatorColor: 'rgba(255,255,255,0.25)',
      endpointColor: 'rgba(244,114,182,0.65)',
      overtitratedColor: 'rgba(126,34,206,0.95)',
      equation: '2MnO₄⁻(aq) + 5C₂O₄²⁻(aq) + 16H⁺(aq) → 2Mn²⁺(aq) + 10CO₂(g) + 8H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution B into a clean conical flask and warm gently to about 60°C. Fill the burette with 0.020 M acidified KMnO₄ Solution A. Titrate Solution B while hot until the first permanent pale pink colour persists for at least 30 seconds.',
      procedureSteps: [
              "Fill the burette with 0.020 M Acidified KMnO₄ Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Ethanedioic Acid Solution B into a clean 250 cm³ conical flask.",
              "Add about 10 cm³ of 1 M dilute sulfuric acid and warm the flask gently to about 60 °C.",
              "Titrate hot Solution B with Solution A with continuous swirling until the first permanent pale pink colour persists for 30 seconds.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.020 M KMnO₄ Solution A used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesKMnO4',
          label: 'Calculate the number of moles of KMnO₄ present in average volume V₁ of Solution A (0.020 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00050',
          step: '0.00001',
          unit: 'moles of KMnO₄',
          calcTheoretical: (ctx) => (0.020 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.020 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of KMnO₄.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.020 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of KMnO₄:</b> (0.020 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.020 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesAcid',
          label: 'Calculate the number of moles of ethanedioic acid in 25.0 cm³ of Solution B (Mole ratio MnO₄⁻ : C₂O₄²⁻ = 2 : 5)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00125',
          step: '0.00001',
          unit: 'moles of H₂C₂O₄',
          calcTheoretical: (ctx) => ((0.020 * ctx.trueTitre) / 1000.0) * (5.0 / 2.0),
          calcEcf: (ctx) => {
            const mMn = parseFloat(getAnswerValue(ctx.answers, 'molesKMnO4', 'step_b')) || ((0.020 * ctx.trueTitre) / 1000.0);
            return mMn * (5.0 / 2.0);
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of H₂C₂O₄.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles KMnO₄ × (5/2) = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of H₂C₂O₄:</b> <b>${(((0.020 * ctx.v1) / 1000.0) * 2.5).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityAcid',
          label: 'Calculate the molar concentration (molarity) of ethanedioic acid Solution B in mol/dm³',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 0.050',
          step: '0.001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molesAcid', 'step_c')) || (((0.020 * ctx.trueTitre) / 1000.0) * 2.5);
            return (mb * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution B = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of acid × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution B:</b> (Moles × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(4)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsAcid',
          label: 'Calculate the concentration of hydrated ethanedioic acid in Solution B in g/dm³ (RFM = 126.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 6.30',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 126.0,
          calcEcf: (ctx) => {
            const molB = parseFloat(getAnswerValue(ctx.answers, 'molarityAcid', 'step_d')) || ctx.trueBaseMolarity;
            return molB * 126.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 126.0 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration:</b> ${ctx.trueBaseMolarity.toFixed(4)} M × 126.0 = <b>${(ctx.trueBaseMolarity * 126.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid Y (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A pure white inorganic solid containing one cation and one anion.',
      trueSaltKey: 'ZnCO3',
      trueSaltName: 'Zinc Carbonate — ZnCO₃',
      trueCation: 'Zn2+',
      trueAnion: 'CO32-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube strongly.',
          correctObs: 'Residue turns yellow when hot and white on cooling; colourless gas evolved that forms white precipitate with limewater',
          correctInf: 'ZnO formed; CO₂ gas evolved; CO₃²⁻ present; Zn²⁺ suspected'
        },
        {
          id: 'q2_acid',
          prompt: '(ii) Add 5 cm³ of 2M dilute nitric acid (HNO₃) to Solid Y in a boiling tube and test any gas evolved with limewater.',
          correctObs: 'Brisk effervescence of a colourless odourless gas that forms white precipitate with calcium hydroxide (limewater); clear colourless solution formed',
          correctInf: 'CO₃²⁻ confirmed present (CO₂ gas evolved)'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To 2 cm³ of the solution from (ii), add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess sodium hydroxide to form a clear colourless solution',
          correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present (amphoteric hydroxide [Zn(OH)₄]²⁻)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To 2 cm³ of the solution from (ii), add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess aqueous ammonia to form a clear colourless solution',
          correctInf: 'Zn²⁺ confirmed present (forms soluble [Zn(NH₃)₄]²⁺ complex; Al³⁺ and Pb²⁺ absent)'
        },
        {
          id: 'q2_chloride',
          prompt: '(v) To 2 cm³ of the solution from (ii), add 3 drops of Barium Nitrate solution [Ba(NO₃)₂].',
          correctObs: 'No precipitate formed; clear colourless solution persists',
          correctInf: 'SO₄²⁻ and SO₃²⁻ absent'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Liquid Z (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A clear, volatile organic liquid.',
      trueOrganicKey: 'Cyclohexene',
      trueOrganicName: 'Cyclohexene — C₆H₁₀',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Burns with a luminous, highly smoky and sooty yellow flame; leaves carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C< or —C≡C—)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Add 2 cm³ of distilled water to 2 cm³ of Liquid Z, shake, and test with moist red and blue litmus paper.',
          correctObs: 'Forms two immiscible layers; no color change on either blue or red litmus paper',
          correctInf: 'Neutral organic hydrocarbon; insoluble in water'
        },
        {
          id: 'q3_bromine',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of Bromine water in the dark and shake thoroughly.',
          correctObs: 'Reddish-brown bromine water is rapidly decolorized (turns colorless)',
          correctInf: 'Alkene (>C=C<) confirmed present by electrophilic addition'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and shake.',
          correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present'
        }
      ]
    }
  },

  // ── Series 2020: Official KCSE 2020 Standard Chemistry Practical (Paper 233/3) ──
  series_2020: {
    id: 'series_2020',
    seriesKey: 'series_2020',
    seriesNumber: 2020,
    title: 'KCSE 2020 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2020 Past National Paper · Hydrochloric Acid Standardization & Aluminium Sulfate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Standardization of HCl (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (Solution A)',
      solutionB: 'Sodium Carbonate Solution B containing 5.30 g/dm³ (Na₂CO₃)',
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
      baseRfm: 106.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.25)',
      flaskIndicatorColor: 'rgba(251,191,36,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      overtitratedColor: 'rgba(185,28,28,0.95)',
      equation: '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution B into a conical flask. Add 2–3 drops of methyl orange indicator. Titrate with 0.100 M HCl Solution A until the yellow colour changes sharply to permanent orange-red.',
      procedureSteps: [
              "Fill the burette with 0.100 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Carbonate Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution B with Solution A with continuous swirling until the yellow colour changes sharply to permanent orange-red.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.100 M HCl Solution A used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesHCl',
          label: 'Calculate the number of moles of HCl present in the average volume V₁ of Solution A (0.100 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00250',
          step: '0.00001',
          unit: 'moles of HCl',
          calcTheoretical: (ctx) => (0.100 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.100 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.100 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of HCl:</b> (0.100 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.100 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesCarbonate',
          label: 'Determine the number of moles of Na₂CO₃ in 25.0 cm³ of Solution B (Mole ratio HCl : Na₂CO₃ = 2 : 1)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00125',
          step: '0.00001',
          unit: 'moles of Na₂CO₃',
          calcTheoretical: (ctx) => ((0.100 * ctx.trueTitre) / 1000.0) / 2.0,
          calcEcf: (ctx) => {
            const mAcid = parseFloat(getAnswerValue(ctx.answers, 'molesHCl', 'step_b')) || ((0.100 * ctx.trueTitre) / 1000.0);
            return mAcid / 2.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Na₂CO₃.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of HCl / 2 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of Na₂CO₃:</b> Moles HCl / 2 = <b>${(((0.100 * ctx.v1) / 1000.0) / 2.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityCarbonate',
          label: 'Calculate the molar concentration (molarity) of Na₂CO₃ Solution B in mol/dm³',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 0.050',
          step: '0.001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molesCarbonate', 'step_c')) || (((0.100 * ctx.trueTitre) / 1000.0) / 2.0);
            return (mb * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution B = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of Na₂CO₃ × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution B:</b> (Moles × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(4)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsCarbonate',
          label: 'Calculate the concentration of Na₂CO₃ in Solution B in g/dm³ (Na = 23.0, C = 12.0, O = 16.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 5.30',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 106.0,
          calcEcf: (ctx) => {
            const molB = parseFloat(getAnswerValue(ctx.answers, 'molarityCarbonate', 'step_d')) || ctx.trueBaseMolarity;
            return molB * 106.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 106.0 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration:</b> ${ctx.trueBaseMolarity.toFixed(4)} M × 106.0 = <b>${(ctx.trueBaseMolarity * 106.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid F (15.0 Marks)',
      sampleName: 'Solid F',
      sampleDesc: 'A pure white inorganic crystalline salt containing one cation and one anion.',
      trueSaltKey: 'Al2(SO4)3',
      trueSaltName: 'Aluminium Sulfate — Al₂(SO₄)₃',
      trueCation: 'Al3+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid F in a dry test tube strongly.',
          correctObs: 'White crystalline solid loses luster and decomposes slightly; droplets of colourless liquid condense on cooler walls; white residue persists',
          correctInf: 'Hydrated salt; loses water of crystallization'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid F in 10 cm³ of distilled water. Divide into 4 portions.',
          correctObs: 'White solid dissolves completely to form a clear, colourless solution',
          correctInf: 'Soluble salt; absence of coloured transition metal ions'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess sodium hydroxide to form a clear colourless solution',
          correctInf: 'Al³⁺, Pb²⁺, or Zn²⁺ present (amphoteric hydroxide [Al(OH)₄]⁻)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Al³⁺ or Pb²⁺ confirmed present (Zn²⁺ excluded as it dissolves in excess NH₃)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of Barium Nitrate solution [Ba(NO₃)₂] followed by dilute nitric acid.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Liquid G (10.0 Marks)',
      sampleName: 'Liquid G',
      sampleDesc: 'A clear, colourless volatile liquid with a characteristic pleasant spirituous odor.',
      trueOrganicKey: 'Ethanol',
      trueOrganicName: 'Ethanol — C₂H₅OH',
      trueFunctionalGroup: 'Alkanol (-OH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid G on a clean metallic spatula and ignite using a Bunsen burner flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; leaves no carbon residue',
          correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Add 2 cm³ of distilled water to Liquid G and test with moist blue and red litmus paper.',
          correctObs: 'Dissolves completely to form a neutral solution; no color change on either blue or red litmus paper',
          correctInf: 'Neutral organic substance; carboxylic acid and amine absent'
        },
        {
          id: 'q3_dichromate',
          prompt: '(iii) To 2 cm³ of Liquid G, add 3 drops of acidified Potassium Dichromate(VI) (K₂Cr₂O₇) and warm gently in a water bath.',
          correctObs: 'Orange potassium dichromate(VI) turns emerald green; characteristic fruity/ethanal aroma produced',
          correctInf: 'Primary or secondary alkanol (—OH) confirmed present; Cr₂O₇²⁻ reduced to Cr³⁺'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid G, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'No effervescence / no bubbles of gas evolved',
          correctInf: 'Carboxylic acid (—COOH) absent; Alkanol (—OH) confirmed present'
        }
      ]
    }
  },

  // ── Series 2019: Official KCSE 2019 Standard Chemistry Practical (Paper 233/3) ──
  series_2019: {
    id: 'series_2019',
    seriesKey: 'series_2019',
    seriesNumber: 2019,
    title: 'KCSE 2019 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2019 Past National Paper · KMnO₄ vs Iron(II) Salt & Lead(II) Nitrate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Iron(II) Redox Titration (15.0 Marks)',
      solutionA: '0.020 M Acidified Potassium Manganate(VII) Solution P',
      solutionB: 'Iron(II) Sulfate Solution Q (39.20 g/dm³ Mohr Salt)',
      acidFormula: 'KMnO4',
      baseFormula: 'FeSO4',
      indicator: 'Potassium Manganate(VII)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.020,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 5,
      acidRfm: 158.0,
      baseRfm: 392.0,
      titrantColor: '#701A75',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(56,189,248,0.25)',
      endpointColor: 'rgba(236,72,153,0.7)',
      overtitratedColor: 'rgba(192,38,211,0.95)',
      equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution Q into a clean conical flask. Fill the burette with 0.020 M KMnO₄ Solution P. Titrate Solution Q with Solution P until the first permanent faint pink colour persists for at least 30 seconds.',
      procedureSteps: [
              "Fill the burette with 0.020 M Acidified KMnO₄ Solution P and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Iron(II) Sulfate Solution Q into a clean 250 cm³ conical flask.",
              "Add about 10 cm³ of 1 M dilute sulfuric acid using a measuring cylinder.",
              "Titrate Solution Q with Solution P with continuous swirling until the first permanent faint pink colour persists for at least 30 seconds.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.020 M KMnO₄ Solution P used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesKMnO4',
          label: 'Calculate the number of moles of KMnO₄ present in average volume V₁ of Solution P (0.020 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00050',
          step: '0.00001',
          unit: 'moles of KMnO₄',
          calcTheoretical: (ctx) => (0.020 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.020 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of KMnO₄.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.020 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of KMnO₄:</b> (0.020 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.020 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesFe2',
          label: 'Calculate the number of moles of Fe²⁺ in 25.0 cm³ of Solution Q (Mole ratio MnO₄⁻ : Fe²⁺ = 1 : 5)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00250',
          step: '0.00001',
          unit: 'moles of Fe²⁺',
          calcTheoretical: (ctx) => ((0.020 * ctx.trueTitre) / 1000.0) * 5.0,
          calcEcf: (ctx) => {
            const mMn = parseFloat(getAnswerValue(ctx.answers, 'molesKMnO4', 'step_b')) || ((0.020 * ctx.trueTitre) / 1000.0);
            return mMn * 5.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Fe²⁺.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles KMnO₄ × 5 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of Fe²⁺:</b> <b>${(((0.020 * ctx.v1) / 1000.0) * 5.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityFe2',
          label: 'Calculate the molar concentration (molarity) of Fe²⁺ in Solution Q in mol/dm³',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 0.100',
          step: '0.001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mFe = parseFloat(getAnswerValue(ctx.answers, 'molesFe2', 'step_c')) || (((0.020 * ctx.trueTitre) / 1000.0) * 5.0);
            return (mFe * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution Q = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of Fe²⁺ × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution Q:</b> (Moles × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(4)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsFe2',
          label: 'Calculate the concentration of hydrated iron(II) salt in Solution Q in g/dm³ (RFM = 392.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 39.20',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 392.0,
          calcEcf: (ctx) => {
            const molQ = parseFloat(getAnswerValue(ctx.answers, 'molarityFe2', 'step_d')) || ctx.trueBaseMolarity;
            return molQ * 392.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 392.0 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration:</b> ${ctx.trueBaseMolarity.toFixed(4)} M × 392.0 = <b>${(ctx.trueBaseMolarity * 392.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid K (15.0 Marks)',
      sampleName: 'Solid K',
      sampleDesc: 'A pure white inorganic crystalline salt containing one cation and one anion.',
      trueSaltKey: 'Pb(NO3)2',
      trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂',
      trueCation: 'Pb2+',
      trueAnion: 'NO3-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid K in a dry test tube strongly.',
          correctObs: 'Solid decrepitates and melts; brown fumes evolved that turn moist blue litmus red; residue brown hot, yellow on cooling',
          correctInf: 'Thermal decomposition of nitrate salt; NO₂ evolved; Pb²⁺ suspected'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid K in 10 cm³ of distilled water. Divide into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear, colourless solution',
          correctInf: 'Soluble salt; absence of coloured transition metal ions'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess sodium hydroxide to form a clear colourless solution',
          correctInf: 'Pb²⁺, Al³⁺, or Zn²⁺ present (amphoteric hydroxide [Pb(OH)₄]²⁻)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Pb²⁺ or Al³⁺ present (Zn²⁺ excluded)'
        },
        {
          id: 'q2_iodide',
          prompt: '(v) To portion 3, add 3 drops of Potassium Iodide (KI) solution and warm gently.',
          correctObs: 'Bright yellow precipitate formed on addition; dissolves on warming to form a colourless solution and reappears as glittering golden spangles on cooling',
          correctInf: 'Pb²⁺ confirmed present (PbI₂ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Solid L (10.0 Marks)',
      sampleName: 'Solid L',
      sampleDesc: 'A pure white crystalline unsaturated organic solid.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Organic Acid (Maleic Acid)',
      trueFunctionalGroup: 'Unsaturated Carboxylic Acid (-COOH, >C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite one-third of Solid L on a clean metallic spatula in a non-luminous Bunsen burner flame.',
          correctObs: 'Melts and burns with a luminous, yellow smoky and sooty flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C< or —C≡C—)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve remainder of Solid L in 5 cm³ distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Dissolves to form clear colourless solution; blue litmus paper turns red; red litmus retains colour (pH ~ 2.5)',
          correctInf: 'Acidic organic compound / contains ionizable H⁺ ions / carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present'
        },
        {
          id: 'q3_bromine',
          prompt: '(iv) To 2 cm³ of solution, add 3–4 drops of Bromine water and shake gently.',
          correctObs: 'Reddish-brown / yellow colour of bromine water is rapidly decolorized to colourless',
          correctInf: 'Carbon-carbon double bond (>C=C<) confirmed present by electrophilic addition'
        }
      ]
    }
  },

  // ── Series 2018: Official KCSE 2018 Standard Chemistry Practical (Paper 233/3) ──
  series_2018: {
    id: 'series_2018',
    seriesKey: 'series_2018',
    seriesNumber: 2018,
    title: 'KCSE 2018 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2018 Past National Paper · Sodium Hydroxide vs Ethanedioic Acid & Copper(II) Sulfate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Standardization of NaOH (15.0 Marks)',
      solutionA: '0.100 M Sodium Hydroxide Solution A',
      solutionB: '0.050 M Hydrated Ethanedioic Acid Solution B (H₂C₂O₄·2H₂O)',
      acidFormula: 'NaOH',
      baseFormula: 'H2C2O4',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.100,
      trueBaseMolarity: 0.050,
      trueTitre: 25.00,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 40.0,
      baseRfm: 126.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.25)',
      flaskIndicatorColor: 'rgba(255,255,255,0.25)',
      endpointColor: 'rgba(236,72,153,0.5)',
      overtitratedColor: 'rgba(219,39,119,0.9)',
      equation: '2NaOH(aq) + H₂C₂O₄(aq) → Na₂C₂O₄(aq) + 2H₂O(l)',
      instructions: 'Fill the burette with 0.100 M Sodium Hydroxide Solution A. Pipette 25.0 cm³ of 0.050 M Ethanedioic Acid Solution B into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution A until the colourless solution turns to the first permanent faint pink colour.',
      procedureSteps: [
              "Fill the burette with 0.100 M Sodium Hydroxide Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of 0.050 M Ethanedioic Acid Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution remains colourless).",
              "Titrate Solution B with Solution A with continuous swirling until the first permanent faint pink colour appears.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.100 M NaOH Solution A used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesNaOH',
          label: 'Calculate the number of moles of NaOH present in the average volume V₁ of Solution A (0.100 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00250',
          step: '0.00001',
          unit: 'moles of NaOH',
          calcTheoretical: (ctx) => (0.100 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.100 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.100 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of NaOH:</b> (0.100 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.100 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesAcid',
          label: 'Determine the number of moles of ethanedioic acid in 25.0 cm³ of Solution B (Mole ratio NaOH : H₂C₂O₄ = 2 : 1)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00125',
          step: '0.00001',
          unit: 'moles of H₂C₂O₄',
          calcTheoretical: (ctx) => ((0.100 * ctx.trueTitre) / 1000.0) / 2.0,
          calcEcf: (ctx) => {
            const mNa = parseFloat(getAnswerValue(ctx.answers, 'molesNaOH', 'step_b')) || ((0.100 * ctx.trueTitre) / 1000.0);
            return mNa / 2.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of H₂C₂O₄.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of NaOH / 2 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of H₂C₂O₄:</b> Moles NaOH / 2 = <b>${(((0.100 * ctx.v1) / 1000.0) / 2.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityAcid',
          label: 'Calculate the molar concentration (molarity) of ethanedioic acid Solution B in mol/dm³',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 0.050',
          step: '0.001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molesAcid', 'step_c')) || (((0.100 * ctx.trueTitre) / 1000.0) / 2.0);
            return (mb * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution B = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of acid × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution B:</b> (Moles × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(4)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsAcid',
          label: 'Calculate the concentration of hydrated ethanedioic acid in Solution B in g/dm³ (RFM = 126.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 6.30',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 126.0,
          calcEcf: (ctx) => {
            const molB = parseFloat(getAnswerValue(ctx.answers, 'molarityAcid', 'step_d')) || ctx.trueBaseMolarity;
            return molB * 126.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 126.0 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration:</b> ${ctx.trueBaseMolarity.toFixed(4)} M × 126.0 = <b>${(ctx.trueBaseMolarity * 126.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid W (15.0 Marks)',
      sampleName: 'Solid W',
      sampleDesc: 'A bright blue crystalline inorganic salt containing one cation and one anion.',
      trueSaltKey: 'CuSO4',
      trueSaltName: 'Copper(II) Sulfate — CuSO₄',
      trueCation: 'Cu2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid W in a dry test tube strongly.',
          correctObs: 'Blue crystals turn white; droplets of colourless liquid condense on cooler walls; white residue persists',
          correctInf: 'Hydrated Cu²⁺ salt loses water of crystallization; anhydrous CuSO₄ formed'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid W in 10 cm³ of distilled water. Divide into 4 portions.',
          correctObs: 'Blue crystalline solid dissolves completely to form a clear sky-blue solution',
          correctInf: 'Soluble salt; Cu²⁺ present'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'Pale blue precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Cu²⁺ present (Cu(OH)₂ formed)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'Pale blue precipitate formed, dissolves in excess aqueous ammonia to form a deep royal blue solution',
          correctInf: 'Cu²⁺ confirmed present (forms soluble tetraammine copper(II) complex [Cu(NH₃)₄]²⁺)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of Barium Chloride (BaCl₂) followed by dilute hydrochloric acid.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute hydrochloric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Solid Q (10.0 Marks)',
      sampleName: 'Solid Q',
      sampleDesc: 'A pure white organic crystalline solid.',
      trueOrganicKey: 'org_benzoic_acid',
      trueOrganicName: 'Benzoic Acid — C₆H₅COOH',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite a small portion of Solid Q on a clean metallic spatula in a Bunsen burner flame.',
          correctObs: 'Melts and burns with a luminous, highly smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Aromatic compound / high carbon-to-hydrogen ratio present'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid Q in 5 cm³ warm distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper retains colour (pH ~ 3)',
          correctInf: 'Acidic organic substance / carboxylic acid (—COOH) / H⁺ ions present'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of solution, add 2–3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ solution persists / not decolorized',
          correctInf: 'Aliphatic alkene / alkyne absent; stable aromatic benzene ring'
        }
      ]
    }
  },

  // ── Series 2017: Official KCSE 2017 Standard Chemistry Practical (Paper 233/3) ──
  series_2017: {
    id: 'series_2017',
    seriesKey: 'series_2017',
    seriesNumber: 2017,
    title: 'KCSE 2017 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2017 Past National Paper · Hydrochloric Acid vs Sodium Carbonate & Iron(II) Sulfate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Acid-Base Standardization (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid Solution A',
      solutionB: '0.050 M Sodium Carbonate Solution B (5.30 g/dm³)',
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
      baseRfm: 106.0,
      titrantColor: '#EF4444',
      flaskBaseColor: 'rgba(255,255,255,0.25)',
      flaskIndicatorColor: 'rgba(250,204,21,0.7)',
      endpointColor: 'rgba(249,115,22,0.85)',
      overtitratedColor: 'rgba(239,68,68,0.95)',
      equation: '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)',
      instructions: 'Fill the burette with 0.100 M Hydrochloric Acid Solution A. Pipette 25.0 cm³ of Sodium Carbonate Solution B into a conical flask. Add 2–3 drops of methyl orange indicator. Titrate with Solution A until the yellow colour turns sharply to orange-red.',
      procedureSteps: [
              "Fill the burette with 0.100 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Carbonate Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution B with Solution A with continuous swirling until the yellow colour turns sharply to orange-red.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.100 M HCl Solution A used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesHCl',
          label: 'Calculate the number of moles of hydrochloric acid present in V₁',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00250',
          step: '0.0001',
          unit: 'moles of HCl',
          calcTheoretical: (ctx) => (ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (ctx.trueAcidMolarity * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Molarity × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of Acid in V₁:</b> (${ctx.trueAcidMolarity.toFixed(3)} × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((ctx.trueAcidMolarity * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesNa2CO3',
          label: 'Calculate the number of moles of sodium carbonate in 25.0 cm³ of Solution B (Mole ratio Na₂CO₃ : HCl = 1 : 2)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00125',
          step: '0.0001',
          unit: 'moles of Na₂CO₃',
          calcTheoretical: (ctx) => ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5,
          calcEcf: (ctx) => {
            const ma = parseFloat(getAnswerValue(ctx.answers, 'molesHCl', 'step_b')) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
            return ma * 0.5;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Na₂CO₃.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of Acid / 2 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of Na₂CO₃:</b> Moles of Acid / 2 = <b>${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityNa2CO3',
          label: 'Determine the molar concentration (molarity) of Solution B in mol/dm³',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.050',
          step: '0.001',
          unit: 'mol/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molesNa2CO3', 'step_c')) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5);
            return (mb * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration of Solution B = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of base × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution B:</b> (Moles × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(3)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsNa2CO3',
          label: 'Calculate the concentration of anhydrous sodium carbonate in Solution B in g/dm³ (RFM = 106.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 5.30',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 106.0,
          calcEcf: (ctx) => {
            const molB = parseFloat(getAnswerValue(ctx.answers, 'molarityNa2CO3', 'step_d')) || ctx.trueBaseMolarity;
            return molB * 106.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 106.0 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration of Base:</b> ${ctx.trueBaseMolarity.toFixed(3)} M × 106.0 = <b>${(ctx.trueBaseMolarity * 106.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid Y (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A pale-green crystalline inorganic salt containing one cation and one anion.',
      trueSaltKey: 'FeSO4',
      trueSaltName: 'Iron(II) Sulfate — FeSO₄',
      trueCation: 'Fe2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube strongly.',
          correctObs: 'Pale green crystals turn dirty brown; colourless droplets condense on cooler walls; choking gas evolved',
          correctInf: 'Hydrated salt; thermal decomposition of FeSO₄'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid Y in 10 cm³ of distilled water. Divide into 4 portions.',
          correctObs: 'Pale green crystalline solid dissolves completely to form a pale green solution',
          correctInf: 'Soluble salt; Fe²⁺ present'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'Dirty green precipitate formed, insoluble in excess sodium hydroxide; turns reddish-brown at surface on standing',
          correctInf: 'Fe²⁺ present (Fe(OH)₂ oxidized to Fe(OH)₃)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'Dirty green precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Fe²⁺ confirmed present'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of Barium Nitrate solution followed by dilute nitric acid.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Liquid Z (10.0 Marks)',
      sampleName: 'Liquid Z',
      sampleDesc: 'A clear, colourless, volatile organic liquid.',
      trueOrganicKey: 'Hex-1-ene',
      trueOrganicName: 'Hex-1-ene — C₆H₁₂',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Burns with a luminous, highly smoky and sooty yellow flame; leaves carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon:hydrogen ratio compound (>C=C< or —C≡C—)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Add 2 cm³ of distilled water to 2 cm³ of Liquid Z, shake, and test with moist red and blue litmus paper.',
          correctObs: 'Forms two immiscible layers with liquid Z floating on water; no color change on either blue or red litmus paper',
          correctInf: 'Neutral organic substance; insoluble non-polar hydrocarbon'
        },
        {
          id: 'q3_bromine',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of Bromine water in the dark and shake thoroughly.',
          correctObs: 'Reddish-brown bromine water is rapidly decolorized (turns colorless)',
          correctInf: 'Unsaturated compound / Alkene (>C=C<) present by electrophilic addition'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and shake.',
          correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized',
          correctInf: 'Alkene (>C=C<) confirmed present'
        }
      ]
    }
  },

  // ── Series 2016: Official KCSE 2016 Standard Chemistry Practical (Paper 233/3) ──
  series_2016: {
    id: 'series_2016',
    seriesKey: 'series_2016',
    seriesNumber: 2016,
    title: 'KCSE 2016 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2016 Past National Paper · NaOH Standardization vs HCl & Barium Chloride',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Acid-Base Standardization (15.0 Marks)',
      solutionA: '0.200 M Hydrochloric Acid Solution A',
      solutionB: 'Sodium Hydroxide Solution B (8.00 g/dm³)',
      acidFormula: 'HCl',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.200,
      trueBaseMolarity: 0.200,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.25)',
      flaskIndicatorColor: 'rgba(255,255,255,0.25)',
      endpointColor: 'rgba(236,72,153,0.5)',
      overtitratedColor: 'rgba(219,39,119,0.9)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of 0.200 M Hydrochloric Acid Solution A into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Sodium Hydroxide Solution B from the burette until the colourless solution turns to the first permanent faint pink colour.',
      procedureSteps: [
              "Fill the burette with 0.200 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Hydroxide Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution turns pink).",
              "Titrate Solution B with Solution A with continuous swirling until the pink colour discharges sharply to colourless.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of Sodium Hydroxide Solution B used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesHCl',
          label: 'Calculate the number of moles of hydrochloric acid in 25.0 cm³ of Solution A (0.200 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00500',
          step: '0.0001',
          unit: 'moles of HCl',
          calcTheoretical: (ctx) => (0.200 * 25.0) / 1000.0,
          calcEcf: () => (0.200 * 25.0) / 1000.0,
          check: (val) => Math.abs(val - 0.00500) <= 0.0004,
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl.`,
          feedbackFail: () => `Formula: (0.200 × 25.0) / 1000 = 0.00500 mol.`,
          working: () => `<b>(b) Moles of HCl in 25.0 cm³:</b> (0.200 × 25.0) / 1000 = <b>0.00500 mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesNaOH',
          label: 'Determine the number of moles of NaOH in average volume V₁ of Solution B (Mole ratio NaOH : HCl = 1 : 1)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00500',
          step: '0.0001',
          unit: 'moles of NaOH',
          calcTheoretical: (ctx) => (0.200 * 25.0) / 1000.0,
          calcEcf: (ctx) => parseFloat(getAnswerValue(ctx.answers, 'molesHCl', 'step_b')) || 0.00500,
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
          feedbackFail: (ctx, expTheo) => `Formula: 1 : 1 mole ratio = ${expTheo.toFixed(5)} mol.`,
          working: () => `<b>(c) Moles of NaOH in V₁:</b> 1 : 1 ratio = <b>0.00500 mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityNaOH',
          label: 'Calculate the molar concentration (molarity) of Sodium Hydroxide Solution B in mol/dm³',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.200',
          step: '0.001',
          unit: 'mol/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molesNaOH', 'step_c')) || 0.00500;
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (mb * 1000.0) / (v1 || 25.0);
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution B = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of NaOH × 1000) / V₁ = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution B:</b> (0.00500 × 1000) / ${ctx.v1.toFixed(2)} = <b>${ctx.trueBaseMolarity.toFixed(3)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsNaOH',
          label: 'Calculate the mass concentration of sodium hydroxide in Solution B in g/dm³ (RFM = 40.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 8.00',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 40.0,
          calcEcf: (ctx) => {
            const molB = parseFloat(getAnswerValue(ctx.answers, 'molarityNaOH', 'step_d')) || ctx.trueBaseMolarity;
            return molB * 40.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 40.0 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration of NaOH:</b> ${ctx.trueBaseMolarity.toFixed(3)} M × 40.0 = <b>${(ctx.trueBaseMolarity * 40.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid M (15.0 Marks)',
      sampleName: 'Solid M',
      sampleDesc: 'A white crystalline inorganic salt containing one cation and one anion.',
      trueSaltKey: 'BaCl2',
      trueSaltName: 'Barium Chloride — BaCl₂',
      trueCation: 'Ba2+',
      trueAnion: 'Cl-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid M in a dry test tube strongly.',
          correctObs: 'Solid decrepitates; colourless droplets condense on cooler walls; white residue persists',
          correctInf: 'Hydrated salt; loses water of crystallization'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid M in 10 cm³ of distilled water. Divide into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear colourless solution',
          correctInf: 'Soluble salt; absence of coloured transition metal ions'
        },
        {
          id: 'q2_flame',
          prompt: '(iii) Dip a clean nichrome wire into portion 1 and test in the non-luminous Bunsen flame.',
          correctObs: 'Apple-green / yellowish-green flame produced',
          correctInf: 'Ba²⁺ confirmed present'
        },
        {
          id: 'q2_sulfate',
          prompt: '(iv) To portion 2, add 4 drops of dilute sulfuric acid (H₂SO₄).',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'Ba²⁺ confirmed present (BaSO₄ formed)'
        },
        {
          id: 'q2_chloride',
          prompt: '(v) To portion 3, add 3 drops of lead(II) nitrate solution and warm the mixture.',
          correctObs: 'White precipitate formed, which dissolves on boiling to form a colourless solution (reappears on cooling)',
          correctInf: 'Cl⁻ confirmed present (PbCl₂ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Liquid N (10.0 Marks)',
      sampleName: 'Liquid N',
      sampleDesc: 'A clear colourless liquid with a sharp, vinegar-like odor.',
      trueOrganicKey: 'Ethanoic Acid',
      trueOrganicName: 'Ethanoic Acid — CH₃COOH',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid N on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; sharp vinegar smell; leaves no carbon residue',
          correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Test 2 cm³ of Liquid N with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (pH ~ 3)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of Liquid N, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms a white precipitate with limewater',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of Liquid N, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and warm gently.',
          correctObs: 'Purple acidified KMnO₄ solution remains unchanged (purple color persists, not decolorized)',
          correctInf: 'Alkene (>C=C<) and primary/secondary alkanol absent'
        }
      ]
    }
  },

  // ── Series 2015: Official KCSE 2015 Standard Chemistry Practical (Paper 233/3) ──
  series_2015: {
    id: 'series_2015',
    seriesKey: 'series_2015',
    seriesNumber: 2015,
    title: 'KCSE 2015 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2015 Past National Paper · Sodium Thiosulfate Redox vs Iodine & Zinc Sulfate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Iodometric Redox Titration (15.0 Marks)',
      solutionA: 'Solution A (0.025 M Liberated Iodine Solution)',
      solutionB: '0.050 M Sodium Thiosulfate Solution B (Na₂S₂O₃)',
      acidFormula: 'I2',
      baseFormula: 'Na2S2O3',
      indicator: 'Starch',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.025,
      trueBaseMolarity: 0.050,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 2,
      acidRfm: 254.0,
      baseRfm: 158.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(180,83,9,0.35)',
      flaskIndicatorColor: 'rgba(30,58,138,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      overtitratedColor: 'rgba(255,255,255,0.20)',
      equation: 'I₂(aq) + 2S₂O₃²⁻(aq) → 2I⁻(aq) + S₄O₆²⁻(aq)',
      instructions: 'Pipette 25.0 cm³ of Solution A (iodine solution) into a conical flask. Titrate with 0.050 M Sodium Thiosulfate Solution B until pale yellow. Add 1 cm³ starch indicator and continue titrating until the intense blue-black colour discharges sharply to colourless.',
      procedureSteps: [
              "Fill the burette with 0.050 M Sodium Thiosulfate Solution B and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of iodine Solution A into a clean 250 cm³ conical flask.",
              "Titrate with Solution B until the reddish-brown colour fades to pale yellow.",
              "Add 1 cm³ of starch indicator (solution turns intense blue-black).",
              "Continue titrating dropwise until the blue-black colour discharges sharply to colourless.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.050 M Sodium Thiosulfate Solution B used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesThio',
          label: 'Calculate the number of moles of sodium thiosulfate present in average volume V₁ of Solution B (0.050 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00125',
          step: '0.00001',
          unit: 'moles of Na₂S₂O₃',
          calcTheoretical: (ctx) => (0.050 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.050 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Na₂S₂O₃.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.050 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of Na₂S₂O₃ in V₁:</b> (0.050 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.050 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesI2',
          label: 'Determine the number of moles of iodine (I₂) in 25.0 cm³ of Solution A (Mole ratio I₂ : S₂O₃²⁻ = 1 : 2)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.000625',
          step: '0.000001',
          unit: 'moles of I₂',
          calcTheoretical: (ctx) => ((0.050 * ctx.trueTitre) / 1000.0) / 2.0,
          calcEcf: (ctx) => {
            const mt = parseFloat(getAnswerValue(ctx.answers, 'molesThio', 'step_b')) || ((0.050 * ctx.trueTitre) / 1000.0);
            return mt / 2.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of I₂.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of thiosulfate / 2 = ${expTheo.toFixed(6)} mol.`,
          working: (ctx) => `<b>(c) Moles of I₂ in 25.0 cm³:</b> Moles of Thiosulfate / 2 = <b>${(((0.050 * ctx.v1) / 1000.0) / 2.0).toFixed(6)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityI2',
          label: 'Calculate the molar concentration (molarity) of Solution A in mol/dm³',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.025',
          step: '0.001',
          unit: 'mol/dm³',
          calcTheoretical: (ctx) => ctx.trueAcidMolarity,
          calcEcf: (ctx) => {
            const mi = parseFloat(getAnswerValue(ctx.answers, 'molesI2', 'step_c')) || (((0.050 * ctx.trueTitre) / 1000.0) / 2.0);
            return (mi * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution A = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of I₂ × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution A:</b> (Moles × 1000) / 25.0 = <b>${ctx.trueAcidMolarity.toFixed(3)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsI2',
          label: 'Calculate the mass concentration of dissolved iodine in Solution A in g/dm³ (RFM = 254.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 6.35',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueAcidMolarity * 254.0,
          calcEcf: (ctx) => {
            const molA = parseFloat(getAnswerValue(ctx.answers, 'molarityI2', 'step_d')) || ctx.trueAcidMolarity;
            return molA * 254.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Mass Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 254.0 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration of Iodine:</b> ${ctx.trueAcidMolarity.toFixed(3)} M × 254.0 = <b>${(ctx.trueAcidMolarity * 254.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid P (15.0 Marks)',
      sampleName: 'Solid P',
      sampleDesc: 'A white crystalline inorganic salt containing one cation and one anion.',
      trueSaltKey: 'ZnSO4',
      trueSaltName: 'Zinc Sulfate — ZnSO₄',
      trueCation: 'Zn2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a spatula-end of Solid P in a dry test tube strongly.',
          correctObs: 'Solid decrepitates and loses luster; droplets of colourless liquid condense on cooler walls; residue yellow when hot, white on cooling',
          correctInf: 'Hydrated salt; loses water of crystallization; Zn²⁺ indicated (ZnO residue)'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid P in 10 cm³ of distilled water. Divide into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear colourless solution',
          correctInf: 'Soluble salt; absence of coloured transition metal ions'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess sodium hydroxide to form a clear colourless solution',
          correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present (amphoteric hydroxide [Zn(OH)₄]²⁻)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess aqueous ammonia to form a clear colourless solution',
          correctInf: 'Zn²⁺ confirmed present ([Zn(NH₃)₄]²⁺ complex formed)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of Barium Nitrate solution followed by dilute nitric acid.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Liquid Q (10.0 Marks)',
      sampleName: 'Liquid Q',
      sampleDesc: 'A clear, colourless liquid with a characteristic sweet, spirituous odor.',
      trueOrganicKey: 'Butan-1-ol',
      trueOrganicName: 'Butan-1-ol — CH₃(CH₂)₃OH',
      trueFunctionalGroup: 'Alkanol (-OH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid Q on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; no smoke',
          correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Add 2 cm³ of distilled water to 2 cm³ of Liquid Q, shake, and test with moist red and blue litmus paper.',
          correctObs: 'Dissolves partially; no color change on either blue or red litmus paper',
          correctInf: 'Neutral organic substance; absence of carboxylic acid and amine'
        },
        {
          id: 'q3_dichromate',
          prompt: '(iii) To 2 cm³ of Liquid Q, add 3 drops of acidified Potassium Dichromate(VI) (K₂Cr₂O₇) and warm gently in a water bath.',
          correctObs: 'Orange potassium dichromate(VI) turns green; a pleasant fruity pungent smell is produced',
          correctInf: 'Primary or secondary alkanol (—OH) present; Cr₂O₇²⁻ reduced to Cr³⁺'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Q, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'No effervescence / no bubbles of gas evolved',
          correctInf: 'Carboxylic acid (—COOH) absent; Alkanol (—OH) confirmed present'
        }
      ]
    }
  },

  // ── Series 2014: Official KCSE 2014 Standard Chemistry Practical (Paper 233/3) ──
  series_2014: {
    id: 'series_2014',
    seriesKey: 'series_2014',
    seriesNumber: 2014,
    title: 'KCSE 2014 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2014 Past National Paper · Hydrochloric Acid Neutralization & Calcium Nitrate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Acid-Base Neutralization (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid Solution A',
      solutionB: '0.100 M Sodium Hydroxide Solution B',
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
      baseRfm: 40.0,
      titrantColor: '#EF4444',
      flaskBaseColor: 'rgba(255,255,255,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      overtitratedColor: 'rgba(255,255,255,0.20)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Sodium Hydroxide Solution B (0.100 M) into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with 0.100 M Hydrochloric Acid Solution A from the burette until the pink colour discharges sharply to colourless.',
      procedureSteps: [
              "Fill the burette with 0.100 M Hydrochloric Acid Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Hydroxide Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution turns deep pink).",
              "Titrate Solution B with Solution A with continuous swirling until the pink colour discharges sharply to colourless.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.100 M HCl Solution A used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesHCl',
          label: 'Calculate the number of moles of hydrochloric acid present in average volume V₁ of Solution A (0.100 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00250',
          step: '0.0001',
          unit: 'moles of HCl',
          calcTheoretical: (ctx) => (0.100 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.100 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.100 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of HCl in V₁:</b> (0.100 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.100 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesNaOH',
          label: 'Determine the number of moles of NaOH in 25.0 cm³ of Solution B (Mole ratio HCl : NaOH = 1 : 1)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00250',
          step: '0.0001',
          unit: 'moles of NaOH',
          calcTheoretical: (ctx) => (0.100 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => parseFloat(getAnswerValue(ctx.answers, 'molesHCl', 'step_b')) || ((0.100 * ctx.trueTitre) / 1000.0),
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH in 25.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: 1 : 1 mole ratio = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of NaOH in 25.0 cm³:</b> 1 : 1 ratio = <b>${((0.100 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityNaOH',
          label: 'Calculate the molar concentration (molarity) of Sodium Hydroxide Solution B in mol/dm³',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.100',
          step: '0.001',
          unit: 'mol/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molesNaOH', 'step_c')) || ((0.100 * ctx.trueTitre) / 1000.0);
            return (mb * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution B = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of NaOH × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution B:</b> (Moles × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(3)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsNaOH',
          label: 'Calculate the mass concentration of sodium hydroxide in Solution B in g/dm³ (RFM = 40.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 4.00',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 40.0,
          calcEcf: (ctx) => {
            const molB = parseFloat(getAnswerValue(ctx.answers, 'molarityNaOH', 'step_d')) || ctx.trueBaseMolarity;
            return molB * 40.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Mass Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 40.0 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration of NaOH:</b> ${ctx.trueBaseMolarity.toFixed(3)} M × 40.0 = <b>${(ctx.trueBaseMolarity * 40.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis of Solid Q (15.0 Marks)',
      sampleName: 'Solid Q',
      sampleDesc: 'A pure white crystalline inorganic salt containing one cation and one anion.',
      trueSaltKey: 'Ca(NO3)2',
      trueSaltName: 'Calcium Nitrate — Ca(NO₃)₂',
      trueCation: 'Ca2+',
      trueAnion: 'NO3-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Q strongly in a dry hard-glass test tube and test gases with moist litmus and glowing splint.',
          correctObs: 'Solid decrepitates and melts; brown fumes evolved that turn moist blue litmus red; gas rekindles a glowing wooden splint; white residue remains',
          correctInf: 'Thermal decomposition of nitrate salt; NO₂ and O₂ gases evolved; NO₃⁻ present'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid Q in 10 cm³ of distilled water. Divide into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear colourless solution',
          correctInf: 'Soluble salt; absence of coloured transition metal ions'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Ca²⁺ or Mg²⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'No precipitate formed with drops or with excess aqueous ammonia',
          correctInf: 'Ca²⁺ confirmed present'
        },
        {
          id: 'q2_flame',
          prompt: '(v) Dip a clean nichrome wire into portion 3 and place in non-luminous Bunsen flame.',
          correctObs: 'Brick-red / orange-red flame produced',
          correctInf: 'Ca²⁺ confirmed present'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis of Solid R (10.0 Marks)',
      sampleName: 'Solid R',
      sampleDesc: 'A pure white crystalline unsaturated organic solid.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Carboxylic Acid (Maleic Acid)',
      trueFunctionalGroup: 'Unsaturated Carboxylic Acid (-COOH, >C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place a small portion of Solid R on a clean metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, highly smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C< or —C≡C—)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve remainder of Solid R in 5 cm³ distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Dissolves to form clear colourless solution; blue litmus paper turns red; red litmus retains colour (pH ~ 2.5)',
          correctInf: 'Acidic organic compound / contains ionizable H⁺ ions / carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present'
        },
        {
          id: 'q3_bromine',
          prompt: '(iv) To 2 cm³ of solution, add 3–4 drops of Bromine water and shake gently.',
          correctObs: 'Reddish-brown / yellow colour of bromine water is rapidly decolorized to colourless',
          correctInf: 'Carbon-carbon double bond (>C=C<) confirmed present by electrophilic addition'
        },
        {
          id: 'q3_kmno4',
          prompt: '(v) To 2 cm³ of solution, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present'
        }
      ]
    }
  },

  // ── Series 2013: Official KCSE 2013 Standard Chemistry Practical (Paper 233/3) ──
  series_2013: {
    id: 'series_2013',
    seriesKey: 'series_2013',
    seriesNumber: 2013,
    title: 'KCSE 2013 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2013 Past National Paper · Displacement Calorimetry, KMnO₄ Redox & Zinc',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — KMnO₄ Redox Titration (15.0 Marks)',
      solutionA: '0.020 M Acidified Potassium Manganate(VII) (KMnO₄)',
      solutionB: 'Solution D (Iron(II) Sulfate from displacement)',
      acidFormula: 'KMnO4',
      baseFormula: 'FeSO4',
      indicator: 'Potassium Manganate(VII)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.020,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 5,
      acidRfm: 158.0,
      baseRfm: 392.0,
      titrantColor: '#701A75',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(56,189,248,0.25)',
      endpointColor: 'rgba(236,72,153,0.7)',
      overtitratedColor: 'rgba(192,38,211,0.95)',
      equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution D into a clean conical flask. Titrate with 0.020 M KMnO₄ Solution A until the first permanent pale pink colour persists for at least 30 seconds.',
      procedureSteps: [
              "Fill the burette with 0.020 M Acidified Potassium Manganate(VII) Solution A and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Solution D into a clean 250 cm³ conical flask.",
              "Add about 10 cm³ of 1 M dilute sulfuric acid using a measuring cylinder.",
              "Titrate Solution D with Solution A with continuous swirling until the first permanent pale pink colour persists for at least 30 seconds.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ acidRfm: 158.0, baseRfm: 392.0, pipetteVolume: 25.0, moleRatioAcid: 1, moleRatioBase: 5 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid E',
      sampleDesc: 'A white inorganic solid containing zinc ions.',
      trueSaltKey: 'ZnSO4',
      trueSaltName: 'Zinc Sulfate — ZnSO₄',
      trueCation: 'Zn2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid E strongly in a dry test tube.',
          correctObs: 'Solid turns yellow when hot and white on cooling; colourless liquid droplets condense on upper cooler walls',
          correctInf: 'Compound of zinc / ZnO formed; hydrated salt'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve remainder of Solid E in 10 cm³ of distilled water. Divide into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear, colourless solution',
          correctInf: 'Soluble salt; colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺) absent'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess sodium hydroxide to form a clear colourless solution',
          correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present (zincate / aluminate / plumbite formed)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess aqueous ammonia to form a colourless solution',
          correctInf: 'Zn²⁺ confirmed present (forms soluble tetraamminezinc(II) complex)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops of barium chloride followed by dilute HCl.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute hydrochloric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid G',
      sampleDesc: 'A pure white organic crystalline solid.',
      trueOrganicKey: 'Maleic Acid',
      trueOrganicName: 'Maleic Acid — C₄H₄O₄',
      trueFunctionalGroup: 'Unsaturated Carboxylic Acid (-COOH, >C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place one-third of Solid G on a metallic spatula and burn in Bunsen flame.',
          correctObs: 'Melts to liquid; burns with a luminous, highly smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high C:H ratio (>C=C< or -C≡C-)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid G in distilled water. Test with blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (pH ~ 2)',
          correctInf: 'Acidic organic compound / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of solution, add 2–3 drops of acidified Potassium Manganate(VII).',
          correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) present by electrophilic oxidation'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of solution, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that turns limewater milky',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 2012: Official KCSE 2012 Standard Chemistry Practical (Paper 233/3) ──
  series_2012: {
    id: 'series_2012',
    seriesKey: 'series_2012',
    seriesNumber: 2012,
    title: 'KCSE 2012 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2012 Past National Paper · Iodometric Redox Titration & Devarda Reduction',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Iodometric Redox Titration (15.0 Marks)',
      solutionA: '0.050 M Sodium Thiosulphate (Na₂S₂O₃)',
      solutionB: 'Solution A (Liberated Iodine from Potassium Iodate)',
      acidFormula: 'Na2S2O3',
      baseFormula: 'I2',
      indicator: 'Starch Indicator',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.050,
      trueBaseMolarity: 0.02415,
      trueTitre: 24.15,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 158.0,
      baseRfm: 254.0,
      titrantColor: '#F8FAFC',
      flaskBaseColor: 'rgba(217,119,6,0.35)',
      flaskIndicatorColor: 'rgba(30,58,138,0.90)',
      endpointColor: 'rgba(255,255,255,0.35)',
      overtitratedColor: 'rgba(255,255,255,0.20)',
      equation: 'I₂(aq) + 2Na₂S₂O₃(aq) → 2NaI(aq) + Na₂S₄O₆(aq)',
      instructions: 'Pipette 25.0 cm³ of Solution A (liberated iodine) into a conical flask. Titrate with 0.050 M Sodium Thiosulphate until pale straw-yellow. Add 1 cm³ starch indicator (solution turns dark blue) and continue titrating dropwise until the blue color sharply discharges to colorless.',
      procedureSteps: [
              "Fill the burette with 0.050 M Sodium Thiosulphate Solution C and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of liberated iodine Solution A into a clean 250 cm³ conical flask.",
              "Titrate with Solution C from the burette until the reddish-brown iodine colour fades to pale straw-yellow.",
              "Add 1 cm³ of starch indicator (solution turns deep blue).",
              "Continue titrating dropwise with continuous swirling until the dark blue colour sharply discharges to colourless.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.050 M Sodium Thiosulphate used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 24.15',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesA',
          label: 'Calculate the number of moles of sodium thiosulphate in the average volume V₁ used',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00121',
          step: '0.00001',
          unit: 'moles of Na₂S₂O₃',
          calcTheoretical: (ctx) => (0.050 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.050 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Na₂S₂O₃.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.050 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of Na₂S₂O₃:</b> (0.050 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.050 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesB',
          label: 'Determine the number of moles of iodine (I₂) in 25.0 cm³ of Solution A (Mole ratio I₂:S₂O₃²⁻ = 1:2)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00060',
          step: '0.00001',
          unit: 'moles of I₂',
          calcTheoretical: (ctx) => ((0.050 * ctx.trueTitre) / 1000.0) / 2.0,
          calcEcf: (ctx) => {
            const ma = parseFloat(getAnswerValue(ctx.answers, 'molesA', 'step_b')) || ((0.050 * ctx.trueTitre) / 1000.0);
            return ma / 2.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of I₂.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of Na₂S₂O₃ / 2 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of I₂ in pipette:</b> Moles of Thiosulphate / 2 = <b>${(((0.050 * ctx.v1) / 1000.0) / 2.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityB',
          label: 'Calculate the molar concentration (molarity) of iodine in Solution A in mol/dm³',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 0.024',
          step: '0.001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molesB', 'step_c')) || (((0.050 * ctx.trueTitre) / 1000.0) / 2.0);
            return (mb * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution A = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of I₂ × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molar Concentration of Iodine:</b> (Moles of I₂ × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(4)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGrams',
          label: 'Calculate the concentration of iodine in Solution A in g/dm³ (I = 127.0, I₂ = 254.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 6.13',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 254.0,
          calcEcf: (ctx) => {
            const molarity = parseFloat(getAnswerValue(ctx.answers, 'molarityB', 'step_d')) || ctx.trueBaseMolarity;
            return molarity * 254.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × RFM (254.0) = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration of Iodine:</b> ${ctx.trueBaseMolarity.toFixed(4)} M × 254.0 = <b>${(ctx.trueBaseMolarity * 254.0).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid E',
      sampleDesc: 'A white crystalline inorganic salt containing lead(II) and nitrate ions.',
      trueSaltKey: 'leadNitrate',
      trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂',
      trueCation: 'Pb2+',
      trueAnion: 'NO3-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid E strongly in a dry hard-glass test tube.',
          correctObs: 'Solid decrepitates (crackles); brown fumes of NO₂ turn moist blue litmus red; glowing splint rekindles; yellow-brown residue when hot, yellow cold',
          correctInf: 'NO₃⁻ confirmed present; compound of lead (PbO formed)'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve rest of Solid E in 10 cm³ distilled water. Divide into 4 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear, colourless solution',
          correctInf: 'Soluble nitrate salt; transition metal cations (Fe²⁺, Fe³⁺, Cu²⁺) absent'
        },
        {
          id: 'q2_na2so4',
          prompt: '(iii) To portion 1, add 3 drops of aqueous sodium sulfate (Na₂SO₄).',
          correctObs: 'Dense white precipitate formed',
          correctInf: 'Pb²⁺, Ba²⁺, or Ca²⁺ present (insoluble sulfate formed)'
        },
        {
          id: 'q2_nacl',
          prompt: '(iv) To portion 2, add 5 drops aqueous sodium chloride (NaCl) and warm.',
          correctObs: 'White precipitate formed, dissolves on boiling to colourless solution, recrystallizes into white needles on cooling',
          correctInf: 'Pb²⁺ confirmed present (PbCl₂ dissolves in hot water)'
        },
        {
          id: 'q2_devarda',
          prompt: '(v) To portion 3, add 5 drops 2M NaOH and aluminium foil; warm gently and test gas with moist red litmus.',
          correctObs: 'Vigorous effervescence; pungent choking gas evolved that turns moist red litmus blue',
          correctInf: 'NO₃⁻ confirmed present; ammonia (NH₃) gas formed by alkaline reduction'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid F',
      sampleDesc: 'A pure white organic crystalline aromatic solid.',
      trueOrganicKey: 'Benzoic Acid',
      trueOrganicName: 'Benzoic Acid — C₆H₅COOH',
      trueFunctionalGroup: 'Aromatic Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place one-third of Solid F on a metallic spatula and burn in Bunsen flame.',
          correctObs: 'Melts then burns with a bright, smoky luminous yellow sooty flame; leaves black carbon soot',
          correctInf: 'Unsaturated or aromatic organic compound / high carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid F in 10 cm³ warm distilled water. Test with blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (pH ~ 3)',
          correctInf: 'Acidic organic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution of Solid F, add a half spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Vigorous effervescence of a colourless gas that forms a white precipitate with calcium hydroxide (lime water)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_bromine',
          prompt: '(iv) To 2 cm³ of solution of Solid F, add 3 drops of bromine water.',
          correctObs: 'Yellow-orange colour of bromine water persists (not decolorized)',
          correctInf: 'Aliphatic alkene (>C=C<) or alkyne absent; stable aromatic ring'
        }
      ]
    }
  },

  // ── Series 2011: Official KCSE 2011 Standard Chemistry Practical (Paper 233/3) ──
  series_2011: {
    id: 'series_2011',
    seriesKey: 'series_2011',
    seriesNumber: 2011,
    title: 'KCSE 2011 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2011 Past National Paper · Dibasic Acid Standardization & Fe²⁺ Redox Oxidation',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Standardization of NaOH (15.0 Marks)',
      solutionA: '0.051 M Hydrated Dibasic Acid (H₂X·2H₂O)',
      solutionB: 'Sodium Hydroxide (NaOH) Solution C',
      acidFormula: 'H2X',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.051,
      trueBaseMolarity: 0.100,
      trueTitre: 24.50,
      moleRatioAcid: 1,
      moleRatioBase: 2,
      acidRfm: 126.0,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      overtitratedColor: 'rgba(255,255,255,0.20)',
      equation: 'H₂X(aq) + 2NaOH(aq) → Na₂X(aq) + 2H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution C (NaOH) into a conical flask. Add 2 drops of phenolphthalein indicator. Titrate with Solution A until the pink colour discharges sharply to colourless.',
      procedureSteps: [
              "Fill the burette with 0.051 M Hydrated Dibasic Acid Solution A and adjust the meniscus precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Hydroxide Solution C into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution turns deep pink).",
              "Titrate with Solution A from the burette with continuous swirling until the pink colour discharges sharply to colourless.",
              "Record initial and final burette readings to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ acidRfm: 126.0, baseRfm: 40.0, pipetteVolume: 25.0, moleRatioAcid: 1, moleRatioBase: 2 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid D',
      sampleDesc: 'A pale green inorganic crystalline salt containing iron(II) ions.',
      trueSaltKey: 'FeSO4',
      trueSaltName: 'Iron(II) Sulfate — FeSO₄',
      trueCation: 'Fe2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid D in a dry test tube; test gases with litmus.',
          correctObs: 'Solid decrepitates and turns dirty brown; droplets of colourless liquid condense on cooler walls; choking fumes evolve',
          correctInf: 'Hydrated salt; contains water of crystallization; FeSO₄ thermal decomposition'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve Solid D in 10 cm³ of distilled water. Divide into 3 portions.',
          correctObs: 'Pale green crystalline solid dissolves completely to form a pale green solution',
          correctInf: 'Soluble transition metal salt; Fe²⁺ present'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 1 cm³ H₂O₂ followed by 2M NaOH dropwise until in excess.',
          correctObs: 'Solution turns yellow-brown; reddish-brown precipitate formed, insoluble in excess NaOH',
          correctInf: 'Fe²⁺ oxidized to Fe³⁺ by H₂O₂; Fe³⁺ confirmed present (Fe(OH)₃)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia dropwise until in excess.',
          correctObs: 'Dirty green gelatinous precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Fe²⁺ confirmed present'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops barium nitrate followed by dilute HNO₃.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid F',
      sampleDesc: 'A clear, colourless, neutral organic liquid.',
      trueOrganicKey: 'Ethanol',
      trueOrganicName: 'Ethanol — C₂H₅OH',
      trueFunctionalGroup: 'Alkanol (-OH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid F on a metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; leaves no carbon residue',
          correctInf: 'Saturated organic compound / low carbon:hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Add 2 cm³ water to 2 cm³ Liquid F; test with blue and red litmus paper.',
          correctObs: 'Dissolves completely to form a single clear layer; no effect on red or blue litmus paper',
          correctInf: 'Neutral polar organic substance; absence of carboxylic acid and amine'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid F, add 3 drops acidified Potassium Dichromate(VI) and warm gently.',
          correctObs: 'Orange potassium dichromate(VI) solution turns green; sweet fruity ester/aldehyde fragrance',
          correctInf: 'Primary alkanol (—OH) present; Cr₂O₇²⁻ reduced to Cr³⁺'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid F, add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'No effervescence / no bubbles of gas evolved',
          correctInf: 'Carboxylic acid (—COOH) absent; Alkanol (—OH) confirmed present'
        }
      ]
    }
  },

  // ── Series 2009: Official KCSE 2009 Standard Chemistry Practical (Paper 233/3) ──
  series_2009: {
    id: 'series_2009',
    seriesKey: 'series_2009',
    seriesNumber: 2009,
    title: 'KCSE 2009 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2009 Past National Paper · Carbonate Solubility & Hydrochloric Acid Standardization',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Standardization of Diluted HCl (15.0 Marks)',
      solutionA: '0.258 M Hydrochloric Acid (Solution D)',
      solutionB: '0.300 M Sodium Hydroxide (Solution C)',
      acidFormula: 'HCl',
      baseFormula: 'NaOH',
      indicator: 'Methyl Orange',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.258,
      trueBaseMolarity: 0.300,
      trueTitre: 21.50,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.25)',
      flaskIndicatorColor: 'rgba(245,158,11,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      overtitratedColor: 'rgba(185,28,28,0.95)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution D into a conical flask. Add 2 drops of methyl orange indicator. Titrate with 0.300 M NaOH Solution C until the colour changes sharply from red to orange-yellow.',
      procedureSteps: [
              "Fill the burette with 0.300 M Sodium Hydroxide Solution C and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Acid Solution D into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns red).",
              "Titrate Solution D with Solution C with continuous swirling until the colour changes sharply from red to orange-yellow.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ acidRfm: 36.5, baseRfm: 40.0, pipetteVolume: 25.0, moleRatioAcid: 1, moleRatioBase: 1 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid E',
      sampleDesc: 'A white crystalline inorganic salt containing ammonium and sulfate ions.',
      trueSaltKey: 'NH4Cl',
      trueSaltName: 'Ammonium Sulfate — (NH₄)₂SO₄',
      trueCation: 'NH4+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat half of Solid E strongly in dry test tube; test gas using HCl on glass rod.',
          correctObs: 'White solid sublimes forming white deposit on upper cooler walls; dense white fumes formed with HCl on glass rod',
          correctInf: 'NH₄⁺ confirmed present (ammonia reacts with HCl fumes to form NH₄Cl)'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve rest of Solid E in 10 cm³ distilled water. Divide into 3 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear colourless solution',
          correctInf: 'Soluble salt; coloured transition metal ions absent'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess and warm gently.',
          correctObs: 'No precipitate formed; pungent smelling gas evolved that turns moist red litmus blue',
          correctInf: 'NH₄⁺ confirmed present; alkaline NH₃ gas evolved'
        },
        {
          id: 'q2_anion',
          prompt: '(iv) To portion 2, add 3 drops barium nitrate followed by dilute HNO₃.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid F',
      sampleDesc: 'A pure white organic crystalline powder.',
      trueOrganicKey: 'Benzoic Acid',
      trueOrganicName: 'Benzoic Acid — C₆H₅COOH',
      trueFunctionalGroup: 'Aromatic Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place a small portion of Solid F on a metallic spatula and burn in Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, highly smoky and sooty yellow flame; leaves carbon residue',
          correctInf: 'Aromatic compound / unsaturated organic compound with high C:H ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid F in warm water; test with blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (pH ~ 3)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of warm solution, add 2 drops acidified KMnO₄.',
          correctObs: 'Purple colour persists / not decolorized',
          correctInf: 'Aliphatic alkene (>C=C<) absent; stable aromatic nucleus'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of solution, add solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of colourless gas that turns limewater milky',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 2008: Official KCSE 2008 Standard Chemistry Practical (Paper 233/3) ──
  series_2008: {
    id: 'series_2008',
    seriesKey: 'series_2008',
    seriesNumber: 2008,
    title: 'KCSE 2008 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2008 Past National Paper · Calorimetry Back-Titration & Basic Copper Carbonate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Residual Acid Back-Titration (15.0 Marks)',
      solutionA: '0.100 M Hydrochloric Acid (Solution C from Calorimetry)',
      solutionB: '0.100 M Sodium Hydroxide (Solution B)',
      acidFormula: 'HCl',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.0648,
      trueBaseMolarity: 0.100,
      trueTitre: 16.20,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      overtitratedColor: 'rgba(255,255,255,0.20)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution C into a conical flask. Add 2 drops of phenolphthalein indicator. Titrate with 0.100 M NaOH Solution B until the first permanent pale pink colour appears.',
      procedureSteps: [
              "Fill the burette with 0.100 M Sodium Hydroxide Solution B and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Acid Solution C into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution remains colourless).",
              "Titrate Solution C with Solution B with continuous swirling until the first permanent faint pink colour appears.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: createStandardTitrationQuestions({ acidRfm: 36.5, baseRfm: 40.0, pipetteVolume: 25.0, moleRatioAcid: 1, moleRatioBase: 1 })
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid D',
      sampleDesc: 'A green inorganic powder containing copper(II) carbonate.',
      trueSaltKey: 'CuCO3',
      trueSaltName: 'Basic Copper(II) Carbonate — CuCO₃',
      trueCation: 'Cu2+',
      trueAnion: 'CO32-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat Solid D strongly in a dry test tube; test gases with litmus and glowing splint.',
          correctObs: 'Green powder turns black; colourless gas evolved that extinguishes a burning splint and turns moist blue litmus red',
          correctInf: 'Hydrated carbonate salt; CO₂ gas evolved; CuO black residue formed'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Add 10 cm³ 2M HCl to black residue, shake for 3 minutes, and filter.',
          correctObs: 'Black residue dissolves to form a clear green / blue-green solution',
          correctInf: 'Basic oxide (CuO) dissolves in acid forming Cu²⁺ ions'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To 1 cm³ portion of filtrate, add aqueous ammonia dropwise until in excess.',
          correctObs: 'Pale blue precipitate formed, dissolves in excess aqueous ammonia to form a deep blue solution',
          correctInf: 'Cu²⁺ confirmed present (tetraamminecopper(II) complex formed)'
        },
        {
          id: 'q2_displacement',
          prompt: '(iv) To rest of filtrate, add Solid E (zinc dust) and shake.',
          correctObs: 'Effervescence; green solution turns colourless; reddish-brown solid deposited; test tube becomes warm',
          correctInf: 'Zinc displaces copper; Cu²⁺ reduced to copper metal (reddish-brown solid)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid F',
      sampleDesc: 'A white organic crystalline solid.',
      trueOrganicKey: 'Maleic Acid',
      trueOrganicName: 'Maleic Acid — C₄H₄O₄',
      trueFunctionalGroup: 'Unsaturated Carboxylic Acid (-COOH, >C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Burn one-third of Solid F on metallic spatula in Bunsen flame.',
          correctObs: 'Melts and burns with yellow smoky sooty flame; leaves carbon residue',
          correctInf: 'Unsaturated organic compound / high C:H ratio (>C=C<)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve rest of F in water; test with litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus unchanged (pH ~ 2)',
          correctInf: 'Acidic substance / carboxylic acid (—COOH) / H⁺ present'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of solution, add 2 drops acidified KMnO₄.',
          correctObs: 'Purple KMnO₄ solution is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of solution, add solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of colourless gas that turns limewater milky',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 2006: Official KCSE 2006 Standard Chemistry Practical (Paper 233/3) ──
  series_2006: {
    id: 'series_2006',
    seriesKey: 'series_2006',
    seriesNumber: 2006,
    title: 'KCSE 2006 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2006 Past National Paper · Hydrated Oxalic Acid KMnO₄ Redox Titration & Barium Salt',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'water_of_crystallization',
      title: 'Question 1: Volumetric Redox Analysis — Water of Crystallization by KMnO₄ Titration (15.0 Marks)',
      solutionA: '0.060 M Acidified Potassium Manganate(VII) Solution B',
      solutionB: 'Solution of Hydrated Acid D·xH₂O (4.50 g in 250 cm³) Solution A',
      acidFormula: 'KMnO4',
      baseFormula: 'H2C2O4',
      indicator: 'Self-indicating (KMnO₄ permanent faint pink end-point)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.0600,
      trueBaseMolarity: 0.1452,
      trueTitre: 24.20,
      moleRatioAcid: 2,
      moleRatioBase: 5,
      acidRfm: 158.0,
      baseRfm: 126.0,
      titrantColor: '#7C3AED',
      flaskBaseColor: 'rgba(248,250,252,0.2)',
      flaskIndicatorColor: 'rgba(248,250,252,0.2)',
      endpointColor: 'rgba(236,72,153,0.5)',
      overtitratedColor: 'rgba(126,34,206,0.9)',
      equation: '2KMnO₄(aq) + 5H₂C₂O₄(aq) + 3H₂SO₄(aq) → 2MnSO₄(aq) + K₂SO₄(aq) + 10CO₂(g) + 8H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution A (hydrated acid D·xH₂O) into a clean conical flask. Warm the solution gently to ~60 °C. Fill the burette with 0.060 M KMnO₄ Solution B. Titrate hot Solution A with Solution B until the first permanent faint pink colour persists for at least 30 seconds.',
      procedureSteps: [
              "Fill the burette with 0.060 M Potassium Manganate(VII) Solution B and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Hydrated Acid Solution A into a clean 250 cm³ conical flask.",
              "Add about 10 cm³ of 1 M dilute sulfuric acid and warm the mixture gently on a wire gauze to about 60 °C.",
              "Titrate hot Solution A with Solution B with continuous swirling until the first permanent faint pink colour persists for 30 seconds.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.060 M KMnO₄ Solution B used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 24.20',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesKmno4',
          label: 'Calculate the number of moles of KMnO₄ in the average volume of Solution B used',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00145',
          step: '0.00001',
          unit: 'moles of KMnO₄',
          calcTheoretical: (ctx) => (0.0600 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.0600 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of KMnO₄.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.060 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of KMnO₄:</b> (0.060 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.0600 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesAcid',
          label: 'Calculate the number of moles of acid D·xH₂O in 25.0 cm³ of Solution A (Mole ratio Acid : KMnO₄ = 5 : 2)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00363',
          step: '0.00001',
          unit: 'moles of Acid',
          calcTheoretical: (ctx) => ((0.0600 * ctx.trueTitre) / 1000.0) * 2.5,
          calcEcf: (ctx) => {
            const mK = parseFloat(getAnswerValue(ctx.answers, 'molesKmno4', 'step_b')) || ((0.0600 * ctx.trueTitre) / 1000.0);
            return mK * 2.5;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of acid in 25.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of KMnO₄ × (5 / 2) = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of Acid:</b> ${((0.0600 * ctx.v1) / 1000.0).toFixed(5)} × 2.5 = <b>${(((0.0600 * ctx.v1) / 1000.0) * 2.5).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'rfmAcid',
          label: 'Calculate the relative formula mass (RFM) of acid D·xH₂O (prepared by dissolving 4.50 g in 250 cm³)',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 124.0',
          step: '0.1',
          unit: 'g/mol',
          calcTheoretical: () => 124.0,
          calcEcf: (ctx) => {
            const mA25 = parseFloat(getAnswerValue(ctx.answers, 'molesAcid', 'step_c')) || 0.00363;
            const mA250 = mA25 * 10.0;
            return mA250 > 0 ? 4.50 / mA250 : 124.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: RFM = ${val} g/mol.`,
          feedbackFail: () => `Formula: Total moles in 250 cm³ = Moles in 25 cm³ × 10. RFM = 4.50 / Total moles (~124–126 g/mol).`,
          working: (ctx) => `<b>(d) RFM of Acid:</b> 4.50 / (0.00363 × 10) = <b>124.0 g/mol</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'valOfX',
          label: 'Given that the anhydrous formula of acid D has RFM = 90.0 and H₂O = 18.0, determine the value of x in D·xH₂O',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 2',
          step: '1',
          unit: '',
          calcTheoretical: () => 2,
          calcEcf: (ctx) => {
            const rfm = parseFloat(getAnswerValue(ctx.answers, 'rfmAcid', 'step_d')) || 124.0;
            const x = (rfm - 90.0) / 18.0;
            return Math.round(x);
          },
          check: (val) => Math.round(val) === 2,
          feedbackSuccess: (val) => `✓ Correct: x = ${val} (Acid is H₂C₂O₄·2H₂O).`,
          feedbackFail: () => `Formula: (RFM - 90.0) / 18.0 = 2.`,
          working: () => `<b>(e) Value of x:</b> (124.0 - 90.0) / 18.0 = 34 / 18 = 1.89 ≈ <b>2</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid E',
      sampleDesc: 'A white crystalline inorganic salt containing barium ions.',
      trueSaltKey: 'bariumChloride',
      trueSaltName: 'Hydrated Barium Salt — Ba²⁺',
      trueCation: 'Ba2+',
      trueAnion: 'Cl-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid E strongly in a dry hard-glass test tube.',
          correctObs: 'Colourless liquid droplets condense on cooler upper walls of test tube; white anhydrous residue remains',
          correctInf: 'Hydrated salt / contains water of crystallization'
        },
        {
          id: 'q2_dissolve',
          prompt: '(ii) Dissolve rest of Solid E in 10 cm³ distilled water. To portion 1, add 2 drops phenolphthalein indicator.',
          correctObs: 'Colourless solution; phenolphthalein remains colourless (neutral solution)',
          correctInf: 'Neutral salt solution; absence of free strong alkali OH⁻'
        },
        {
          id: 'q2_acid',
          prompt: '(iii) To portion 2, add 2 cm³ dilute hydrochloric acid (HCl).',
          correctObs: 'No effervescence / no bubbles of gas evolved; clear solution persists',
          correctInf: 'CO₃²⁻, HCO₃⁻, SO₃²⁻ absent'
        },
        {
          id: 'q2_sulfate',
          prompt: '(iv) To portion 3, add 1 cm³ aqueous Sodium Sulfate (Na₂SO₄).',
          correctObs: 'Dense white precipitate formed immediately',
          correctInf: 'Ba²⁺ confirmed present (BaSO₄ formed; Pb²⁺, Ca²⁺ also considered)'
        },
        {
          id: 'q2_flame',
          prompt: '(v) Perform flame test on Solid E using nichrome wire dipped in conc. HCl.',
          correctObs: 'Persistent apple-green / pale green flame coloration',
          correctInf: 'Ba²⁺ confirmed present'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid F',
      sampleDesc: 'A pure, white unsaturated organic crystalline solid.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Organic Acid (Maleic / Cinnamic Acid)',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite one-third of Solid F on a clean metallic spatula in a non-luminous flame.',
          correctObs: 'Melts and burns with a yellow luminous, smoky and sooty flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C< or —C≡C—)'
        },
        {
          id: 'q3_solubility',
          prompt: '(ii) Dissolve rest of Solid F in 4 cm³ distilled water. Test with blue and red litmus paper.',
          correctObs: 'Dissolves to form clear colourless solution; blue litmus paper turns red; red litmus retains colour',
          correctInf: 'Acidic organic compound / contains ionizable H⁺ ions / carboxylic acid (—COOH)'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To portion 1, add 2–3 drops of acidified Potassium Manganate(VII) (KMnO₄).',
          correctObs: 'Purple colour of acidified KMnO₄ solution is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present; reducing unsaturated linkage oxidized'
        },
        {
          id: 'q3_bromine',
          prompt: '(iv) To portion 2, add 3 drops of Bromine water and shake gently.',
          correctObs: 'Reddish-brown / yellow colour of bromine water is rapidly decolorized to colourless',
          correctInf: 'Carbon-carbon double bond (>C=C<) confirmed present by electrophilic halogen addition'
        }
      ]
    }
  },

  // ── Series 2007: Official KCSE 2007 Standard Chemistry Practical (Paper 233/3) ──
  series_2007: {
    id: 'series_2007',
    seriesKey: 'series_2007',
    seriesNumber: 2007,
    title: 'KCSE 2007 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2007 Past National Paper · Sulfuric Acid Standardization & Iron(III) Redox',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Standardization of Diluted H₂SO₄ (15.0 Marks)',
      solutionA: 'Diluted Sulfuric Acid (H₂SO₄) Solution D',
      solutionB: 'Sodium Carbonate (Na₂CO₃) containing 8.00 g/dm³',
      acidFormula: 'H2SO4',
      baseFormula: 'Na2CO3',
      indicator: 'Methyl Orange',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.0874,
      trueBaseMolarity: 0.0755,
      trueTitre: 21.60,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 98.0,
      baseRfm: 106.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.25)',
      flaskIndicatorColor: 'rgba(245,158,11,0.85)',
      endpointColor: 'rgba(239,68,68,0.75)',
      overtitratedColor: 'rgba(185,28,28,0.95)',
      equation: 'H₂SO₄(aq) + Na₂CO₃(aq) → Na₂SO₄(aq) + H₂O(l) + CO₂(g)',
      instructions: 'Pipette 25.0 cm³ of Solution B (sodium carbonate) into a clean conical flask. Add 2 drops of methyl orange indicator. Titrate with diluted H₂SO₄ Solution D until the yellow colour turns permanent orange-pink.',
      procedureSteps: [
              "Fill the burette with Diluted Sulfuric Acid Solution D and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Sodium Carbonate Solution B into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution B with Solution D with continuous swirling until the yellow colour turns permanent orange-pink.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of diluted H₂SO₄ Solution D used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 21.60',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molarityB',
          label: 'Calculate the concentration of Solution B (Na₂CO₃) in mol/dm³ (Na = 23.0, C = 12.0, O = 16.0)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.0755',
          step: '0.0001',
          unit: 'mol/dm³',
          calcTheoretical: () => 8.00 / 106.0,
          calcEcf: () => 8.00 / 106.0,
          check: (val) => Math.abs(val - (8.00 / 106.0)) <= 0.005,
          feedbackSuccess: (val) => `✓ Correct: Concentration of Solution B = ${val} mol/dm³.`,
          feedbackFail: () => `Formula: Mass (8.00 g/dm³) / RFM (106.0) = 0.0755 mol/dm³.`,
          working: () => `<b>(b) Molarity of Na₂CO₃:</b> 8.00 / 106.0 = <b>0.0755 mol/dm³</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesB',
          label: 'Calculate the number of moles of sodium carbonate in 25.0 cm³ of Solution B',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00189',
          step: '0.00001',
          unit: 'moles of Na₂CO₃',
          calcTheoretical: (ctx) => (ctx.trueBaseMolarity * 25.0) / 1000.0,
          calcEcf: (ctx) => {
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molarityB', 'step_b')) || ctx.trueBaseMolarity;
            return (mb * 25.0) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Na₂CO₃.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Molarity × 25.0) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of Na₂CO₃:</b> (0.0755 × 25.0) / 1000 = <b>${((0.0755 * 25.0) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityD',
          label: 'Calculate the molar concentration (molarity) of diluted sulfuric acid in Solution D (Mole ratio 1:1)',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 0.0874',
          step: '0.0001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => ctx.trueAcidMolarity,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            const mb = parseFloat(getAnswerValue(ctx.answers, 'molesB', 'step_c')) || ((0.0755 * 25.0) / 1000.0);
            return (mb * 1000.0) / v1;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution D = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of Acid × 1000) / V₁ = ${expTheo.toFixed(4)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution D:</b> (${((0.0755 * 25.0) / 1000.0).toFixed(5)} × 1000) / ${ctx.v1.toFixed(2)} = <b>${ctx.trueAcidMolarity.toFixed(4)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concOrigA',
          label: 'Calculate the concentration of original sulfuric acid Solution A before 1:10 dilution (25.0 cm³ to 250 cm³)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.874',
          step: '0.001',
          unit: 'mol/dm³',
          calcTheoretical: (ctx) => ctx.trueAcidMolarity * 10.0,
          calcEcf: (ctx) => {
            const md = parseFloat(getAnswerValue(ctx.answers, 'molarityD', 'step_d')) || ctx.trueAcidMolarity;
            return md * 10.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration of Solution A = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity D × 10 (dilution factor) = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(e) Original Concentration of Solution A:</b> ${ctx.trueAcidMolarity.toFixed(4)} M × 10 = <b>${(ctx.trueAcidMolarity * 10.0).toFixed(3)} mol/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid E',
      sampleDesc: 'A reddish-brown hydrated inorganic salt containing iron(III) ions.',
      trueSaltKey: 'ironChloride',
      trueSaltName: 'Iron(III) Salt — Fe³⁺',
      trueCation: 'Fe3+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid E strongly in a dry hard-glass test tube.',
          correctObs: 'Pungent acidic choking fumes of SO₂/SO₃ evolved; turns moist blue litmus red; colourless liquid droplets condense; solid turns dark reddish-brown',
          correctInf: 'Hydrated salt; acidic gas; Fe³⁺ oxide residue formed'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve rest of Solid E in 10 cm³ distilled water. Test pH with universal indicator.',
          correctObs: 'Reddish-brown clear solution; universal indicator paper turns red-orange (pH ~ 2)',
          correctInf: 'Strongly acidic salt solution resulting from cation hydrolysis [Fe(H₂O)₆]³⁺'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To portion 1, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'Reddish-brown gelatinous precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Fe³⁺ confirmed present (Fe(OH)₃ precipitate)'
        },
        {
          id: 'q2_ki',
          prompt: '(iv) To portion 2, add 5 drops of aqueous potassium iodide (KI).',
          correctObs: 'Yellow-brown solution turns dark brown; black solid particles of iodine (I₂) settle',
          correctInf: 'Fe³⁺ confirmed acting as an oxidizing agent; oxidizes I⁻ to elemental I₂'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops barium nitrate followed by dilute HNO₃.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Liquid F',
      sampleDesc: 'A pure, colourless and neutral organic liquid.',
      trueOrganicKey: 'Ethanol',
      trueOrganicName: 'Ethanol — C₂H₅OH',
      trueFunctionalGroup: 'Alkanol (-OH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place 2 drops of Liquid F on a metallic spatula and ignite in a non-luminous flame.',
          correctObs: 'Burns with a clean, non-sooty pale blue flame; leaves no carbon residue',
          correctInf: 'Saturated aliphatic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_solubility',
          prompt: '(ii) Mix 1 cm³ of Liquid F with 1 cm³ of distilled water. Test with blue and red litmus.',
          correctObs: 'Completely miscible; forms a single clear homogeneous liquid layer; both litmus papers retain colour',
          correctInf: 'Neutral polar organic substance; lower alkanol; absence of carboxylic acid'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of Liquid F, add a half spatula-end of solid Sodium Carbonate (Na₂CO₃).',
          correctObs: 'No effervescence / no bubbles of gas evolved',
          correctInf: 'Carboxylic acid (—COOH) absent; H⁺ ions absent'
        },
        {
          id: 'q3_dichromate',
          prompt: '(iv) To 2 cm³ of Liquid F, add 3 drops acidified Potassium Dichromate(VI) and warm gently.',
          correctObs: 'Orange potassium dichromate(VI) solution turns dark emerald green; characteristic fruity/ethanal aroma',
          correctInf: 'Primary or secondary alkanol (—OH) confirmed present'
        }
      ]
    }
  },

  // ── Series 2003: Official KCSE 2003 Standard Chemistry Practical (Paper 233/3) ──
  series_2003: {
    id: 'series_2003',
    seriesKey: 'series_2003',
    seriesNumber: 2003,
    title: 'KCSE 2003 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2003 Past National Paper · KMnO₄ Redox Stoichiometry & Sodium Sulfite Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'redox_stoichiometry',
      title: 'Question 1: Volumetric Redox Titration — Mole Ratio Determination (15.0 Marks)',
      solutionA: '0.020 M Acidified Potassium Manganate(VII) Solution P',
      solutionB: 'Solution of Solid Q containing 16.72 g/dm³ (Iron(II) Salt)',
      acidFormula: 'KMnO4',
      baseFormula: 'FeSO4',
      indicator: 'Self-indicating (KMnO₄ permanent faint pink end-point)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.0200,
      trueBaseMolarity: 0.0601,
      trueTitre: 15.00,
      moleRatioAcid: 1,
      moleRatioBase: 5,
      acidRfm: 158.0,
      baseRfm: 278.0,
      titrantColor: '#7C3AED',
      flaskBaseColor: 'rgba(236,253,245,0.4)',
      flaskIndicatorColor: 'rgba(236,253,245,0.4)',
      endpointColor: 'rgba(244,114,182,0.6)',
      overtitratedColor: 'rgba(126,34,206,0.95)',
      equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution Q into a clean conical flask. Fill the burette with 0.020 M acidified KMnO₄ Solution P. Titrate Solution Q with Solution P until the first permanent faint pink colour persists for at least 30 seconds.',
      procedureSteps: [
              "Fill the burette with 0.020 M Acidified Potassium Manganate(VII) Solution P and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Iron(II) Sulfate Solution Q into a clean 250 cm³ conical flask.",
              "Add about 10 cm³ of 1 M dilute sulfuric acid using a measuring cylinder.",
              "Titrate Solution Q with Solution P with continuous swirling until the first permanent faint pink colour persists for at least 30 seconds.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.020 M KMnO₄ Solution P used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 15.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesKmno4',
          label: 'Calculate the number of moles of KMnO₄ used in the average titre V₁',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00030',
          step: '0.00001',
          unit: 'moles of KMnO₄',
          calcTheoretical: (ctx) => (0.0200 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.0200 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of KMnO₄.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.020 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of KMnO₄:</b> (0.020 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.0200 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molarityQ',
          label: 'Calculate the concentration of Solution Q in mol/dm³ (RFM of Solid Q = 278.0, 4.18 g dissolved in 250 cm³)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.0601',
          step: '0.0001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: () => (4.18 * 4.0) / 278.0,
          calcEcf: () => (4.18 * 4.0) / 278.0,
          check: (val) => Math.abs(val - ((4.18 * 4.0) / 278.0)) <= 0.005,
          feedbackSuccess: (val) => `✓ Correct: Concentration of Solution Q = ${val} mol/dm³.`,
          feedbackFail: () => `Formula: Mass conc = (4.18 × 1000) / 250 = 16.72 g/dm³. Molarity = 16.72 / 278.0 = 0.0601 mol/dm³.`,
          working: () => `<b>(c) Molarity of Solution Q:</b> (4.18 × 4) / 278.0 = 16.72 / 278.0 = <b>0.0601 mol/dm³</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molesQ',
          label: 'Calculate the number of moles of Solid Q present in 25.0 cm³ of Solution Q',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00150',
          step: '0.00001',
          unit: 'moles of Q',
          calcTheoretical: () => (((4.18 * 4.0) / 278.0) * 25.0) / 1000.0,
          calcEcf: (ctx) => {
            const mq = parseFloat(getAnswerValue(ctx.answers, 'molarityQ', 'step_c')) || ((4.18 * 4.0) / 278.0);
            return (mq * 25.0) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Q in 25.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Molarity Q × 25.0) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(d) Moles of Q:</b> (0.0601 × 25.0) / 1000 = <b>0.00150 mol</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'moleRatio',
          label: 'Determine the mole ratio of Solid Q reacting with 1 mole of KMnO₄ (Moles of Q / Moles of KMnO₄)',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 5.0',
          step: '0.1',
          unit: '',
          calcTheoretical: () => 5.0,
          calcEcf: (ctx) => {
            const mQ = parseFloat(getAnswerValue(ctx.answers, 'molesQ', 'step_d')) || 0.00150;
            const mK = parseFloat(getAnswerValue(ctx.answers, 'molesKmno4', 'step_b')) || 0.00030;
            return mK > 0 ? parseFloat((mQ / mK).toFixed(1)) : 5.0;
          },
          check: (val) => Math.abs(val - 5.0) <= 0.4,
          feedbackSuccess: (val) => `✓ Correct: Mole ratio Q : KMnO₄ = ${val} : 1 (5 Fe²⁺ ions per 1 MnO₄⁻ ion).`,
          feedbackFail: () => `Formula: Moles of Q (0.00150) / Moles of KMnO₄ (0.00030) = 5.0.`,
          working: () => `<b>(e) Mole Ratio Q : KMnO₄:</b> 0.00150 / 0.00030 = <b>5 : 1</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid V',
      sampleDesc: 'A white water-soluble inorganic salt.',
      trueSaltKey: 'sodiumSulfite',
      trueSaltName: 'Sodium Sulfite — Na₂SO₃',
      trueCation: 'Na+',
      trueAnion: 'SO32-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_dissolve',
          prompt: '(i) Dissolve Solid V in 15 cm³ distilled water. To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'No precipitate formed; clear colourless solution remains',
          correctInf: 'Transition metal ions, Mg²⁺, Ca²⁺ absent; Na⁺, K⁺, NH₄⁺ suspected'
        },
        {
          id: 'q2_bacl2',
          prompt: '(ii) To portion 2, add 4 drops Barium Chloride (BaCl₂) solution.',
          correctObs: 'White precipitate formed',
          correctInf: 'SO₄²⁻, SO₃²⁻, or CO₃²⁻ present (BaSO₃ / BaSO₄ / BaCO₃)'
        },
        {
          id: 'q2_acid',
          prompt: '(iii) To the mixture from (ii), add 2 cm³ 2M dilute hydrochloric acid (HCl) and warm gently.',
          correctObs: 'White precipitate dissolves completely with effervescence of a choking pungent gas turning damp litmus red',
          correctInf: 'SO₃²⁻ confirmed present (SO₂ gas evolved; SO₄²⁻ absent)'
        },
        {
          id: 'q2_kmno4',
          prompt: '(iv) To portion 3, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄).',
          correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolorized to colourless',
          correctInf: 'SO₃²⁻ confirmed acting as a reducing agent'
        },
        {
          id: 'q2_dichromate',
          prompt: '(v) To portion 4, add 4 drops of acidified Potassium Dichromate(VI) (K₂Cr₂O₇).',
          correctObs: 'Orange potassium dichromate(VI) solution turns dark emerald green',
          correctInf: 'SO₃²⁻ confirmed present; Cr³⁺ ions formed'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid S',
      sampleDesc: 'A pure, white crystalline dibasic organic acid.',
      trueOrganicKey: 'org_acid',
      trueOrganicName: 'Organic Carboxylic Acid (Oxalic Acid)',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place a small portion of Solid S on a clean metallic spatula and ignite in flame.',
          correctObs: 'Melts and burns with a clear, non-sooty pale blue flame; leaves no carbon residue',
          correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve rest of Solid S in 5 cm³ distilled water. Test with blue and red litmus paper.',
          correctObs: 'Blue litmus paper turns red; red litmus retains colour (strongly acidic solution, pH ~ 2)',
          correctInf: 'Acidic substance / carboxylic acid (—COOH) / H⁺ ions present'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present'
        },
        {
          id: 'q3_dichromate',
          prompt: '(iv) To 2 cm³ of solution, add 3 drops acidified Potassium Dichromate(VI) and warm gently.',
          correctObs: 'Orange colour of potassium dichromate(VI) solution persists (not reduced)',
          correctInf: 'Alkanol (—OH) absent'
        }
      ]
    }
  },

  // ── Series 2002: Official KCSE 2002 Standard Chemistry Practical (Paper 233/3) ──
  series_2002: {
    id: 'series_2002',
    seriesKey: 'series_2002',
    seriesNumber: 2002,
    title: 'KCSE 2002 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2002 Past National Paper · Iodine Clock Kinetics / Iodometric Titration & Redox Displacement',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Iodometric Titration & Clock Kinetics (15.0 Marks)',
      solutionA: '0.050 M Sodium Thiosulphate (Na₂S₂O₃) Solution C',
      solutionB: 'Solution A (Liberated Iodine from Hydrogen Peroxide and Iodide)',
      acidFormula: 'Na2S2O3',
      baseFormula: 'H2O2',
      indicator: 'Starch Indicator',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.050,
      trueBaseMolarity: 0.025,
      trueTitre: 25.00,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 158.0,
      baseRfm: 34.0,
      titrantColor: '#F8FAFC',
      flaskBaseColor: 'rgba(217,119,6,0.35)',
      flaskIndicatorColor: 'rgba(30,58,138,0.90)',
      endpointColor: 'rgba(255,255,255,0.35)',
      overtitratedColor: 'rgba(255,255,255,0.20)',
      equation: 'H₂O₂(aq) + 2I⁻(aq) + 2H⁺(aq) → I₂(aq) + 2H₂O(l); I₂(aq) + 2Na₂S₂O₃(aq) → 2NaI(aq) + Na₂S₄O₆(aq)',
      instructions: 'Pipette 25.0 cm³ of Solution A (liberated iodine reaction mixture) into a clean conical flask. Titrate with 0.050 M Sodium Thiosulphate Solution C from the burette until the reddish-brown iodine turns pale straw-yellow. Add 1 cm³ starch indicator (solution turns deep blue) and continue titrating dropwise with continuous swirling until the dark blue colour sharply discharges to colourless.',
      procedureSteps: [
              "Fill the burette with 0.050 M Sodium Thiosulphate Solution C and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of liberated iodine Solution A into a clean 250 cm³ conical flask (mixture is reddish-brown).",
              "Titrate Solution A with Solution C until the reddish-brown colour fades to a pale straw-yellow.",
              "Add 1 cm³ of freshly prepared starch indicator (solution turns deep blue-black).",
              "Continue titrating dropwise with continuous swirling until the blue-black colour sharply discharges to colourless.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.050 M Sodium Thiosulphate Solution C used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesThiosulphate',
          label: 'Calculate the number of moles of sodium thiosulphate (Na₂S₂O₃) in the average volume V₁ used (0.050 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00125',
          step: '0.00001',
          unit: 'moles of Na₂S₂O₃',
          calcTheoretical: (ctx) => (0.050 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.050 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Na₂S₂O₃.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.050 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of Na₂S₂O₃:</b> (0.050 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.050 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesIodine',
          label: 'Determine the number of moles of iodine (I₂) in 25.0 cm³ of Solution A (Mole ratio I₂ : S₂O₃²⁻ = 1 : 2)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.000625',
          step: '0.000001',
          unit: 'moles of I₂',
          calcTheoretical: (ctx) => ((0.050 * ctx.trueTitre) / 1000.0) / 2.0,
          calcEcf: (ctx) => {
            const mThio = parseFloat(getAnswerValue(ctx.answers, 'molesThiosulphate', 'step_b')) || ((0.050 * ctx.trueTitre) / 1000.0);
            return mThio / 2.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of I₂.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of Na₂S₂O₃ / 2 = ${expTheo.toFixed(6)} mol.`,
          working: (ctx) => `<b>(c) Moles of I₂:</b> Moles of Thiosulphate / 2 = <b>${(((0.050 * ctx.v1) / 1000.0) / 2.0).toFixed(6)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molesH2O2',
          label: 'Determine the number of moles of hydrogen peroxide (H₂O₂) in 25.0 cm³ of Solution A (Mole ratio H₂O₂ : I₂ = 1 : 1)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.000625',
          step: '0.000001',
          unit: 'moles of H₂O₂',
          calcTheoretical: (ctx) => ((0.050 * ctx.trueTitre) / 1000.0) / 2.0,
          calcEcf: (ctx) => {
            const mI2 = parseFloat(getAnswerValue(ctx.answers, 'molesIodine', 'step_c')) || (((0.050 * ctx.trueTitre) / 1000.0) / 2.0);
            return mI2;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of H₂O₂ in 25.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: 1 : 1 stoichiometric ratio with I₂ = ${expTheo.toFixed(6)} mol.`,
          working: (ctx) => `<b>(d) Moles of H₂O₂ in 25.0 cm³:</b> <b>${(((0.050 * ctx.v1) / 1000.0) / 2.0).toFixed(6)} mol</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'molarityH2O2',
          label: 'Calculate the molar concentration (molarity) of hydrogen peroxide (H₂O₂) Solution A in mol/dm³',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 0.025',
          step: '0.001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mH2O2 = parseFloat(getAnswerValue(ctx.answers, 'molesH2O2', 'step_d')) || (((0.050 * ctx.trueTitre) / 1000.0) / 2.0);
            return (mH2O2 * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of H₂O₂ = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of H₂O₂ × 1000) / 25.0 = ${expTheo.toFixed(4)} M.`,
          working: (ctx) => `<b>(e) Molarity of H₂O₂:</b> (Moles of H₂O₂ × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(4)} mol/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Qualitative Analysis & Redox Displacement Bench (15.0 Marks)',
      sampleName: 'Solution F and Solid G',
      sampleDesc: 'Solution F is an aqueous solution of a heavy metal salt; Solid G is zinc metal granules (Zn).',
      trueSaltKey: 'leadNitrate',
      trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂ & Zinc Metal Displacement',
      trueCation: 'Pb2+',
      trueAnion: 'NO3-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_displacement',
          prompt: '(i) To 5 cm³ of Solution F in a test tube, add a spatula-end of Solid G (zinc granules), warm gently for 1 minute, shake for 3 minutes, and filter into a clean boiling tube.',
          correctObs: 'Shiny grey metal is coated with a dark grey/black deposit (lead sponge); effervescence ceases; colourless filtrate obtained',
          correctInf: 'Redox displacement occurred; Solid G (Zn) is more reactive than metal in F (Pb²⁺); Pb²⁺ reduced to Pb(s), Zn oxidized to Zn²⁺'
        },
        {
          id: 'q2_barium',
          prompt: '(ii) To 2 cm³ of the filtrate, add 4–5 drops of Barium Nitrate solution [Ba(NO₃)₂].',
          correctObs: 'No precipitate formed; clear colourless solution persists',
          correctInf: 'SO₄²⁻ and SO₃²⁻ absent'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To 2 cm³ of the filtrate, add 2M Sodium Hydroxide (NaOH) dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess sodium hydroxide to form a clear colourless solution',
          correctInf: 'Zn²⁺, Pb²⁺, or Al³⁺ present (amphoteric hydroxide)'
        },
        {
          id: 'q2_ammonia',
          prompt: '(iv) To 2 cm³ of the filtrate, add 2M aqueous ammonia (NH₃) dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess aqueous ammonia to give a clear colourless solution',
          correctInf: 'Zn²⁺ confirmed present in filtrate (forms soluble [Zn(NH₃)₄]²⁺ complex; Pb²⁺ and Al³⁺ absent)'
        },
        {
          id: 'q2_hcl',
          prompt: '(v) To 2 cm³ of the original Solution F (before displacement), add 4 drops of 2M dilute hydrochloric acid (HCl) and boil the mixture.',
          correctObs: 'White precipitate formed (PbCl₂), which dissolves on boiling to form a colourless solution and recrystallizes on cooling',
          correctInf: 'Pb²⁺ confirmed present in original Solution F'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid H',
      sampleDesc: 'A pure, white unsaturated organic crystalline solid.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Organic Acid (Maleic / Crotonic Acid)',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite one-third of Solid H on a clean metallic spatula in a non-luminous Bunsen burner flame.',
          correctObs: 'Melts and burns with a luminous, yellow smoky and sooty flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C< or —C≡C—)'
        },
        {
          id: 'q3_solubility',
          prompt: '(ii) Dissolve rest of Solid H in 5 cm³ distilled water. Test portion 1 with universal indicator solution (or paper).',
          correctObs: 'Dissolves to form clear colourless solution; turns orange-red; pH = 2.5 – 3.0',
          correctInf: 'Acidic organic compound / carboxylic acid (—COOH) group present / H⁺ ions present'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To portion 2, add 2–3 drops of acidified Potassium Manganate(VII) (KMnO₄) and shake.',
          correctObs: 'Purple colour of acidified KMnO₄ solution is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present; reducing unsaturated linkage oxidized'
        },
        {
          id: 'q3_bromine',
          prompt: '(iv) To portion 3, add 3–4 drops of Bromine water and shake gently.',
          correctObs: 'Reddish-brown / yellow colour of bromine water is rapidly decolorized to colourless',
          correctInf: 'Carbon-carbon double bond (>C=C<) confirmed present by electrophilic halogen addition'
        }
      ]
    }
  },

  // ── Series 2000: Official KCSE 2000 Standard Chemistry Practical (Paper 233/3) ──
  series_2000: {
    id: 'series_2000',
    seriesKey: 'series_2000',
    seriesNumber: 2000,
    title: 'KCSE 2000 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2000 Past National Paper · Double Indicator Volumetric Titration & Two-Cation Qualitative Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Double Indicator Titration (15.0 Marks)',
      hasMultipleProcedures: true,
      solutionA: '0.106 M Hydrochloric Acid (Solution M)',
      solutionB: 'Sodium Carbonate (Na₂CO₃) containing 5.60 g/dm³ (Solution L)',
      acidFormula: 'HCl',
      baseFormula: 'Na2CO3',
      indicator: 'Double Indicator (Phenolphthalein & Methyl Orange)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.1057,
      trueBaseMolarity: 0.0528,
      trueTitre: 12.50,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 106.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.3)',
      overtitratedColor: 'rgba(255,255,255,0.2)',
      equation: 'Stage 1: Na₂CO₃ + HCl → NaHCO₃ + NaCl; Stage 2: NaHCO₃ + HCl → NaCl + H₂O + CO₂',
      instructions: 'Procedure I: Pipette 25.0 cm³ of Solution L into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with 0.106 M HCl Solution M until the pink colour discharges sharply to colourless. Complete Table 1.',
      procedureSteps: [
        'Fill the burette with 0.106 M Hydrochloric Acid Solution M and adjust the meniscus level precisely to 0.00 cm³.',
        'Pipette exactly 25.0 cm³ of Sodium Carbonate Solution L into a clean 250 cm³ conical flask.',
        'Add 2–3 drops of phenolphthalein indicator (solution turns bright pink).',
        'Titrate with Solution M with continuous swirling until the pink colour is discharged sharply to colourless.',
        'Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³.'
      ],
      procedures: [
        {
          procedureIndex: 1,
          title: 'Procedure I: Phenolphthalein Stage (CO₃²⁻ + H⁺ → HCO₃⁻)',
          tableTitle: 'Table 1: Titration to Phenolphthalein Endpoint (V₁)',
          tableMarks: 4.0,
          solutionA: '0.106 M Hydrochloric Acid (Solution M)',
          solutionB: 'Sodium Carbonate Solution L (5.60 g/dm³)',
          indicator: 'Phenolphthalein',
          pipetteVolume: 25.0,
          trueTitre: 12.50,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.2)',
          endpointColor: 'rgba(255,255,255,0.3)',
          instructions: 'Fill the burette with 0.106 M HCl Solution M. Pipette 25.0 cm³ of Solution L into a conical flask. Add 2–3 drops of phenolphthalein indicator (turns pink). Titrate with Solution M until the pink colour discharges to colourless. Complete Table 1.',
          procedureSteps: [
            'Fill the burette with 0.106 M HCl Solution M and adjust the meniscus level precisely to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of Solution L (Na₂CO₃) into a clean 250 cm³ conical flask.',
            'Add 2–3 drops of phenolphthalein indicator (solution turns bright pink).',
            'Titrate with Solution M until the pink colour sharply discharges to colourless.',
            'Record initial and final readings to complete Table 1 with concordant titres within ±0.10 cm³.'
          ],
          questions: [
            {
              id: 'step_1a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of Solution M used to phenolphthalein endpoint, V₁',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 12.50',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: (ctx) => ctx.trueTitre,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₁:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_1b',
              letter: 'b',
              field: 'molesHclStage1',
              label: 'Calculate the number of moles of HCl reacting in Stage 1 in volume V₁ (0.106 M)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.00132',
              step: '0.00001',
              unit: 'moles of HCl',
              calcTheoretical: () => (0.106 * 12.50) / 1000.0,
              calcEcf: (ctx) => {
                const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a')) || 12.50;
                return (0.106 * v1) / 1000.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl in Stage 1.`,
              feedbackFail: (ctx, expTheo) => `Formula: (0.106 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
              working: (ctx) => `<b>(b) Moles of HCl in V₁:</b> (0.106 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.106 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
            }
          ]
        },
        {
          procedureIndex: 2,
          title: 'Procedure II: Methyl Orange Stage (Complete Neutralization to CO₂)',
          tableTitle: 'Table 2: Titration to Methyl Orange Endpoint (V₂)',
          tableMarks: 4.0,
          solutionA: '0.106 M Hydrochloric Acid (Solution M)',
          solutionB: 'Sodium Carbonate Solution L (5.60 g/dm³)',
          indicator: 'Methyl Orange',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(251,191,36,0.25)',
          endpointColor: 'rgba(239,68,68,0.7)',
          instructions: 'Pipette a fresh 25.0 cm³ of Solution L into a clean conical flask. Add 2–3 drops of methyl orange indicator (turns yellow). Titrate with Solution M until the yellow colour changes sharply to permanent orange-red. Complete Table 2.',
          procedureSteps: [
            'Fill the burette with Solution M and reset the meniscus level to 0.00 cm³.',
            'Pipette a fresh 25.0 cm³ aliquot of Solution L into a clean conical flask.',
            'Add 2–3 drops of methyl orange indicator (solution turns yellow).',
            'Titrate with Solution M until the yellow colour turns to distinct permanent orange-red.',
            'Record initial and final readings to complete Table 2 with concordant titres within ±0.10 cm³.'
          ],
          questions: [
            {
              id: 'step_2a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of Solution M used to methyl orange endpoint, V₂',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 25.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 25.00,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₂ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₂:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_2b',
              letter: 'b',
              field: 'molesLTotal',
              label: 'Determine total moles of Na₂CO₃ neutralized in 25.0 cm³ (Mole ratio HCl : Na₂CO₃ = 2 : 1 in complete neutralization)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.00132',
              step: '0.00001',
              unit: 'moles of Na₂CO₃',
              calcTheoretical: () => ((0.106 * 25.00) / 1000.0) / 2.0,
              calcEcf: (ctx) => {
                const v2 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_2a')) || 25.00;
                return ((0.106 * v2) / 1000.0) / 2.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of Na₂CO₃.`,
              feedbackFail: (ctx, expTheo) => `Formula: ((0.106 × V₂) / 1000) / 2 = ${expTheo.toFixed(5)} mol.`,
              working: () => `<b>(b) Total Moles of Na₂CO₃:</b> ((0.106 × 25.00) / 1000) / 2 = <b>0.00132 mol</b>`
            },
            {
              id: 'step_2c',
              letter: 'c',
              field: 'molarityLConfirmed',
              label: 'Determine the molar concentration of Solution L in mol/dm³',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.0528',
              step: '0.0001',
              unit: 'mol/dm³ (M)',
              calcTheoretical: () => (((0.106 * 25.00) / 1000.0) / 2.0) * (1000.0 / 25.0),
              calcEcf: (ctx) => {
                const mTotal = parseFloat(getAnswerValue(ctx.answers, 'molesLTotal', 'step_2b')) || 0.001325;
                return (mTotal * 1000.0) / 25.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Molarity of Solution L = ${val} mol/dm³.`,
              feedbackFail: () => `Formula: (Moles of Na₂CO₃ × 1000) / 25.0 = 0.0528 mol/dm³.`,
              working: () => `<b>(c) Molarity of Solution L:</b> (0.001325 × 1000) / 25.0 = <b>0.053 mol/dm³</b>`
            }
          ]
        }
      ]
    },
    q2: {
      type: 'qualitative_mixture',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solution P',
      sampleDesc: 'A clear pale-blue aqueous solution containing two cations and one anion.',
      trueSaltKey: 'copperSulfate',
      trueSaltName: 'Aqueous Mixture containing Copper(II) & Aluminum Sulfate',
      trueCation: 'Cu2+',
      trueAnion: 'SO42-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_naoh_sep',
          prompt: '(i) To 5 cm³ of Solution P in a boiling tube, add 2M NaOH dropwise until in excess and filter. Retain both residue and filtrate.',
          correctObs: 'Pale blue precipitate formed, insoluble in excess NaOH; clear colourless filtrate collected',
          correctInf: 'Cu²⁺ present in residue (Cu(OH)₂); Al³⁺, Pb²⁺, or Zn²⁺ present in filtrate as soluble complex ion'
        },
        {
          id: 'q2_filtrate_naoh',
          prompt: '(ii) To 2 cm³ of the filtrate, add 2M dilute HNO₃ dropwise until acidic, then add 2M NaOH dropwise to excess.',
          correctObs: 'White precipitate formed, dissolves in excess NaOH to form a clear colourless solution',
          correctInf: 'Al³⁺, Pb²⁺, or Zn²⁺ confirmed in filtrate'
        },
        {
          id: 'q2_filtrate_nh3',
          prompt: '(iii) To 2 cm³ of the filtrate, add 2M aqueous ammonia dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Al³⁺ or Pb²⁺ confirmed present; Zn²⁺ absent'
        },
        {
          id: 'q2_filtrate_ki',
          prompt: '(iv) To 2 cm³ of the filtrate, add 3 drops of potassium iodide (KI) solution.',
          correctObs: 'No yellow precipitate formed; solution remains clear and colourless',
          correctInf: 'Pb²⁺ absent; Al³⁺ confirmed present'
        },
        {
          id: 'q2_residue_nh3',
          prompt: '(v) Dissolve blue residue from (i) in 3 cm³ dilute HNO₃. Divide into two portions. To portion 1, add aqueous ammonia dropwise to excess.',
          correctObs: 'Pale blue precipitate dissolves in excess aqueous ammonia to form a deep blue solution',
          correctInf: 'Cu²⁺ confirmed present ([Cu(NH₃)₄]²⁺ complex formed)'
        },
        {
          id: 'q2_residue_ba',
          prompt: '(vi) To portion 2 of dissolved residue, add 3 drops barium nitrate solution followed by dilute HNO₃.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid H',
      sampleDesc: 'A pure, white crystalline organic compound.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Carboxylic Acid (Maleic Acid)',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite a small portion of Solid H on a clean metallic spatula in a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C<)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve remainder of Solid H in 5 cm³ of distilled water. Test with blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (strongly acidic, pH ~ 2)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of solution, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present'
        }
      ]
    }
  },

  // ── Series 1998: Official KCSE 1998 Standard Chemistry Practical (Paper 233/3) ──
  series_1998: {
    id: 'series_1998',
    seriesKey: 'series_1998',
    seriesNumber: 1998,
    title: 'KCSE 1998 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 1998 Past National Paper · Impure Carbonate Percentage Purity & Lead(II) Nitrate',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'percentage_purity',
      title: 'Question 1: Volumetric Analysis — Industrial Carbonate Percentage Purity (20.0 Marks)',
      hasMultipleProcedures: true,
      solutionA: '0.210 M Hydrochloric Acid (Solution M)',
      solutionB: 'Sodium Carbonate Solution N (8.8 g/dm³)',
      acidFormula: 'HCl',
      baseFormula: 'Na2CO3',
      indicator: 'Screened Methyl Orange',
      pipetteVolume: 25.0,
      impureMassPerLiter: 6.00,
      pureRfm: 106.0,
      trueAcidMolarity: 0.210,
      trueBaseMolarity: 0.105,
      trueTitre: 25.00,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 106.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.3)',
      flaskIndicatorColor: 'rgba(245,158,11,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      equation: '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)',
      instructions: 'Procedure I: Pipette 25.0 cm³ of HCl Solution M into a conical flask. Add 2–3 drops of screened methyl orange indicator. Titrate with Sodium Hydroxide Solution N from the burette until the colour changes sharply from green to pink. Complete Table 1.',
      procedureSteps: [
        'Fill the burette with 0.100 M Sodium Hydroxide Solution N and adjust the meniscus level precisely to 0.00 cm³.',
        'Pipette exactly 25.0 cm³ of Hydrochloric Acid Solution M into a clean 250 cm³ conical flask.',
        'Add 2–3 drops of screened methyl orange indicator (solution turns green).',
        'Titrate with Solution N with continuous swirling until the colour changes sharply to pink.',
        'Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³.'
      ],
      procedures: [
        {
          procedureIndex: 1,
          title: 'Procedure I: Standardization of Hydrochloric Acid (Solution M)',
          tableTitle: 'Table 1: Titration of Acid Solution M with Solution N',
          tableMarks: 4.0,
          solutionA: '0.100 M Sodium Hydroxide Solution N',
          solutionB: 'Hydrochloric Acid Solution M',
          indicator: 'Screened Methyl Orange',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(251,191,36,0.25)',
          endpointColor: 'rgba(239,68,68,0.7)',
          instructions: 'Fill the burette with Solution N. Pipette 25.0 cm³ of Solution M into a conical flask. Add screened methyl orange indicator. Titrate until the colour changes from green to pink. Complete Table 1.',
          procedureSteps: [
            'Fill the burette with Solution N and adjust the meniscus to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of Acid Solution M into a clean conical flask.',
            'Add 2–3 drops of screened methyl orange indicator.',
            'Titrate with Solution N until the colour changes sharply from green to pink.',
            'Record initial and final readings to complete Table 1 with concordant titres.'
          ],
          questions: [
            {
              id: 'step_1a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of Solution N used in Procedure I, V₁',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 25.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 25.00,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₁:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_1b',
              letter: 'b',
              field: 'molarityHclM',
              label: 'Calculate the molar concentration of Hydrochloric Acid Solution M in mol/dm³ (0.100 M NaOH N)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.100',
              step: '0.001',
              unit: 'mol/dm³ (M)',
              calcTheoretical: () => (0.100 * 25.00) / 25.0,
              calcEcf: (ctx) => {
                const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a')) || 25.00;
                return (0.100 * v1) / 25.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Molarity of Solution M = ${val} mol/dm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: (0.100 × V₁) / 25.0 = ${expTheo.toFixed(3)} mol/dm³.`,
              working: () => `<b>(b) Molarity of Solution M:</b> (0.100 × 25.00) / 25.0 = <b>0.100 mol/dm³</b>`
            }
          ]
        },
        {
          procedureIndex: 2,
          title: 'Procedure II: Back-Titration of Residual Acid Solution Q (Impure Carbonate)',
          tableTitle: 'Table 2: Back-Titration of Residual Acid Solution Q with Solution N',
          tableMarks: 4.0,
          solutionA: '0.100 M Sodium Hydroxide Solution N',
          solutionB: 'Residual Acid Solution Q (Impure Carbonate reaction mixture made to 250 cm³)',
          indicator: 'Screened Methyl Orange',
          pipetteVolume: 25.0,
          trueTitre: 12.50,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(251,191,36,0.25)',
          endpointColor: 'rgba(239,68,68,0.7)',
          instructions: 'Pipette 25.0 cm³ of Residual Acid Solution Q into a clean conical flask. Add 2–3 drops screened methyl orange indicator. Titrate with 0.100 M NaOH Solution N from the burette until the colour changes sharply from green to pink. Complete Table 2.',
          procedureSteps: [
            'Fill the burette with 0.100 M NaOH Solution N and adjust meniscus to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of Residual Acid Solution Q into a clean conical flask.',
            'Add 2–3 drops of screened methyl orange indicator.',
            'Titrate with Solution N until the colour changes sharply from green to pink.',
            'Record initial and final readings to complete Table 2 with concordant titres.'
          ],
          questions: [
            {
              id: 'step_2a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of Solution N used in Procedure II, V₂',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 12.50',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 12.50,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₂ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₂:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_2b',
              letter: 'b',
              field: 'molesUnreactedQ',
              label: 'Calculate total moles of unreacted HCl in 250 cm³ of Solution Q',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.0125',
              step: '0.0001',
              unit: 'moles of HCl',
              calcTheoretical: () => ((0.100 * 12.50) / 1000.0) * 10.0,
              calcEcf: (ctx) => {
                const v2 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_2a')) || 12.50;
                return ((0.100 * v2) / 1000.0) * 10.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of unreacted HCl in 250 cm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: ((0.100 × V₂) / 1000) × 10 = ${expTheo.toFixed(4)} mol.`,
              working: () => `<b>(b) Unreacted Moles of HCl:</b> ((0.100 × 12.50) / 1000) × 10 = <b>0.0125 mol</b>`
            },
            {
              id: 'step_2c',
              letter: 'c',
              field: 'purityCarbonate',
              label: 'Determine the percentage purity of the industrial carbonate sample (6.00 g/dm³ sample dissolved, RFM = 106.0)',
              marks: 2.5,
              marksLabel: '(2.5 Marks)',
              placeholder: 'e.g. 88.3',
              step: '0.1',
              unit: '%',
              calcTheoretical: () => 88.3,
              calcEcf: () => 88.3,
              check: (val) => Math.abs(val - 88.3) <= 4.0,
              feedbackSuccess: (val) => `✓ Correct: Percentage purity of carbonate = ${val}%.`,
              feedbackFail: () => `Expected around 88.3% purity based on reaction stoichiometry.`,
              working: () => `<b>(c) Percentage Purity:</b> (Pure Carbonate Mass / Impure Mass) × 100 = <b>88.3%</b>`
            }
          ]
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid S',
      sampleDesc: 'A heavy, white crystalline inorganic salt containing lead(II) ions.',
      trueSaltKey: 'Pb(NO3)2',
      trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂',
      trueCation: 'Pb2+',
      trueAnion: 'NO3-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat one-third of Solid S strongly in dry test tube; test gases with litmus.',
          correctObs: 'Solid decrepitates (cracking sound); brown fumes evolved that turn moist blue litmus red; relights glowing splint; residue is reddish-brown when hot, yellow on cooling',
          correctInf: 'NO₃⁻ confirmed present (NO₂ and O₂ evolved); Pb²⁺ present (PbO residue formed)'
        },
        {
          id: 'q2_appearance',
          prompt: '(ii) Dissolve rest of Solid S in 10 cm³ distilled water. Divide into 3 portions.',
          correctObs: 'White crystalline solid dissolves completely to form a clear colourless solution',
          correctInf: 'Soluble salt; absence of coloured transition metal ions'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, soluble in excess NaOH to form a clear colourless solution',
          correctInf: 'Pb²⁺, Al³⁺, or Zn²⁺ present (plumbite formed)'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Pb²⁺ or Al³⁺ present (Zn²⁺ absent)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops Potassium Iodide (KI) solution and warm gently.',
          correctObs: 'Bright golden-yellow precipitate formed; dissolves on heating to colourless solution and reappears on cooling as golden spangles',
          correctInf: 'Pb²⁺ confirmed present (PbI₂ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid L',
      sampleDesc: 'A white organic crystalline solid.',
      trueOrganicKey: 'Benzoic Acid',
      trueOrganicName: 'Benzoic Acid — C₆H₅COOH',
      trueFunctionalGroup: 'Aromatic Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Burn a small portion of Solid L on metallic spatula.',
          correctObs: 'Melts and burns with yellow luminous sooty flame; leaves carbon residue',
          correctInf: 'Aromatic compound / unsaturated organic compound with high C:H ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve in warm water; test with blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus unchanged (pH ~ 3)',
          correctInf: 'Acidic substance / carboxylic acid (—COOH) / H⁺ present'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of warm solution, add 2 drops acidified KMnO₄.',
          correctObs: 'Purple colour persists / not decolorized',
          correctInf: 'Aliphatic alkene (>C=C<) absent; stable aromatic ring'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of solution, add solid Sodium Carbonate (Na₂CO₃).',
          correctObs: 'Brisk effervescence of colourless gas that turns limewater milky',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 1996: Official KCSE 1996 Standard Chemistry Practical (Paper 233/3) ──
  series_1996: {
    id: 'series_1996',
    seriesKey: 'series_1996',
    seriesNumber: 1996,
    title: 'KCSE 1996 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 1996 Past National Paper · KMnO₄ Redox Standardization & MnO₂ Catalysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Two-Stage KMnO₄ Redox Titration (20.0 Marks)',
      hasMultipleProcedures: true,
      solutionA: '0.012 M Acidified Potassium Manganate(VII) (KMnO₄ Solution A)',
      solutionB: 'Ammonium Iron(II) Sulfate Solution B (23.5 g/dm³)',
      acidFormula: 'KMnO4',
      baseFormula: 'FeSO4',
      indicator: 'Potassium Manganate(VII)',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.012,
      trueBaseMolarity: 0.060,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 5,
      acidRfm: 158.0,
      baseRfm: 392.0,
      titrantColor: '#701A75',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(56,189,248,0.25)',
      endpointColor: 'rgba(236,72,153,0.7)',
      overtitratedColor: 'rgba(192,38,211,0.95)',
      equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      instructions: 'Procedure I: Pipette 25.0 cm³ of Solution B into a conical flask. Add about 10 cm³ of 1M sulfuric acid. Titrate with 0.012 M KMnO₄ Solution A until the first permanent pale pink colour persists for at least 30 seconds. Complete Table 1.',
      procedureSteps: [
        'Fill the burette with 0.012 M acidified KMnO₄ Solution A and adjust the upper meniscus precisely to 0.00 cm³.',
        'Pipette exactly 25.0 cm³ of Ammonium Iron(II) Sulfate Solution B into a clean conical flask.',
        'Add about 10 cm³ of 1M dilute sulfuric acid using a measuring cylinder.',
        'Titrate with Solution A with continuous swirling until the first permanent pale pink colour persists for 30 seconds.',
        'Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³.'
      ],
      procedures: [
        {
          procedureIndex: 1,
          title: 'Procedure I: Titration of Iron(II) Solution B with KMnO₄ Solution A',
          tableTitle: 'Table 1: Titration of Solution B with KMnO₄ Solution A',
          tableMarks: 4.0,
          solutionA: '0.012 M Acidified KMnO₄ Solution A',
          solutionB: 'Ammonium Iron(II) Sulfate Solution B',
          indicator: 'Self-indicating (KMnO₄)',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#701A75',
          flaskBaseColor: 'rgba(56,189,248,0.25)',
          endpointColor: 'rgba(236,72,153,0.7)',
          instructions: 'Fill the burette with Solution A. Pipette 25.0 cm³ of Solution B into a conical flask. Add 10 cm³ dilute sulfuric acid. Titrate with Solution A until the pale pink colour persists. Complete Table 1.',
          procedureSteps: [
            'Fill the burette with 0.012 M acidified KMnO₄ Solution A and adjust meniscus to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of Solution B into a conical flask.',
            'Add 10 cm³ of 1M dilute sulfuric acid.',
            'Titrate with Solution A until the first permanent pale pink colour persists.',
            'Record initial and final readings to complete Table 1 with concordant titres.'
          ],
          questions: [
            {
              id: 'step_1a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of KMnO₄ Solution A used in Procedure I, V₁',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 25.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 25.00,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₁:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_1b',
              letter: 'b',
              field: 'molesKmno4P1',
              label: 'Calculate the number of moles of KMnO₄ present in volume V₁ of Solution A (0.012 M)',
              marks: 1.5,
              marksLabel: '(1.5 Marks)',
              placeholder: 'e.g. 0.00030',
              step: '0.00001',
              unit: 'moles of KMnO₄',
              calcTheoretical: () => (0.012 * 25.00) / 1000.0,
              calcEcf: (ctx) => {
                const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a')) || 25.00;
                return (0.012 * v1) / 1000.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of KMnO₄.`,
              feedbackFail: (ctx, expTheo) => `Formula: (0.012 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
              working: () => `<b>(b) Moles of KMnO₄:</b> (0.012 × 25.00) / 1000 = <b>0.00030 mol</b>`
            },
            {
              id: 'step_1c',
              letter: 'c',
              field: 'molesFe2P1',
              label: 'Determine the number of moles of Fe²⁺ ions in 25.0 cm³ of Solution B (Mole ratio Fe²⁺ : MnO₄⁻ = 5 : 1)',
              marks: 1.5,
              marksLabel: '(1.5 Marks)',
              placeholder: 'e.g. 0.00150',
              step: '0.00001',
              unit: 'moles of Fe²⁺',
              calcTheoretical: () => ((0.012 * 25.00) / 1000.0) * 5.0,
              calcEcf: (ctx) => {
                const mK = parseFloat(getAnswerValue(ctx.answers, 'molesKmno4P1', 'step_1b')) || 0.00030;
                return mK * 5.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of Fe²⁺.`,
              feedbackFail: (ctx, expTheo) => `Formula: Moles of KMnO₄ × 5 = ${expTheo.toFixed(5)} mol.`,
              working: () => `<b>(c) Moles of Fe²⁺:</b> 0.00030 × 5 = <b>0.00150 mol</b>`
            },
            {
              id: 'step_1d',
              letter: 'd',
              field: 'molarityFe2',
              label: 'Calculate the molar concentration of Fe²⁺ in Solution B in mol/dm³',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.060',
              step: '0.001',
              unit: 'mol/dm³ (M)',
              calcTheoretical: () => (((0.012 * 25.00) / 1000.0) * 5.0 * 1000.0) / 25.0,
              calcEcf: (ctx) => {
                const mFe = parseFloat(getAnswerValue(ctx.answers, 'molesFe2P1', 'step_1c')) || 0.00150;
                return (mFe * 1000.0) / 25.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Molarity of Solution B = ${val} mol/dm³.`,
              feedbackFail: () => `Formula: (Moles of Fe²⁺ × 1000) / 25.0 = 0.060 mol/dm³.`,
              working: () => `<b>(d) Molarity of Solution B:</b> (0.00150 × 1000) / 25.0 = <b>0.060 mol/dm³</b>`
            }
          ]
        },
        {
          procedureIndex: 2,
          title: 'Procedure II: Titration of Warm Ethanedioic Acid (Solution C) with KMnO₄',
          tableTitle: 'Table 2: Titration of Hot Ethanedioic Acid with KMnO₄ Solution A',
          tableMarks: 4.0,
          solutionA: '0.012 M Acidified KMnO₄ Solution A',
          solutionB: '0.050 M Ethanedioic Acid (H₂C₂O₄·2H₂O) Solution C',
          indicator: 'Self-indicating (KMnO₄)',
          pipetteVolume: 25.0,
          trueTitre: 20.00,
          titrantColor: '#701A75',
          flaskBaseColor: 'rgba(255,255,255,0.2)',
          endpointColor: 'rgba(236,72,153,0.7)',
          instructions: 'Pipette 25.0 cm³ of Ethanedioic Acid Solution C into a conical flask. Add 10 cm³ of 1M dilute sulfuric acid. Warm gently to about 65°C. Titrate hot with Solution A until the first permanent faint pink colour persists. Complete Table 2.',
          procedureSteps: [
            'Fill the burette with Solution A and reset the meniscus to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of Ethanedioic Acid Solution C into a clean conical flask.',
            'Add 10 cm³ of 1M dilute sulfuric acid and warm the mixture gently to about 65°C.',
            'Titrate the hot mixture with Solution A until the first permanent faint pink colour persists.',
            'Record initial and final readings to complete Table 2 with concordant titres.'
          ],
          questions: [
            {
              id: 'step_2a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of KMnO₄ Solution A used in Procedure II, V₂',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 20.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 20.00,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₂ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₂:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_2b',
              letter: 'b',
              field: 'molesOxalicP2',
              label: 'Calculate the number of moles of ethanedioic acid in 25.0 cm³ of Solution C (0.050 M)',
              marks: 1.5,
              marksLabel: '(1.5 Marks)',
              placeholder: 'e.g. 0.00125',
              step: '0.00001',
              unit: 'moles of H₂C₂O₄',
              calcTheoretical: () => (0.050 * 25.0) / 1000.0,
              calcEcf: () => (0.050 * 25.0) / 1000.0,
              check: (val) => Math.abs(val - 0.00125) <= 0.00015,
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of ethanedioic acid.`,
              feedbackFail: () => `Formula: (0.050 × 25.0) / 1000 = 0.00125 mol.`,
              working: () => `<b>(b) Moles of Ethanedioic Acid:</b> (0.050 × 25.0) / 1000 = <b>0.00125 mol</b>`
            },
            {
              id: 'step_2c',
              letter: 'c',
              field: 'molesKmno4P2',
              label: 'Calculate the moles of KMnO₄ reacting in volume V₂ of Procedure II (0.012 M)',
              marks: 1.5,
              marksLabel: '(1.5 Marks)',
              placeholder: 'e.g. 0.00024',
              step: '0.00001',
              unit: 'moles of KMnO₄',
              calcTheoretical: () => (0.012 * 20.00) / 1000.0,
              calcEcf: (ctx) => {
                const v2 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_2a')) || 20.00;
                return (0.012 * v2) / 1000.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of KMnO₄ in V₂.`,
              feedbackFail: (ctx, expTheo) => `Formula: (0.012 × V₂) / 1000 = ${expTheo.toFixed(5)} mol.`,
              working: () => `<b>(c) Moles of KMnO₄ in V₂:</b> (0.012 × 20.00) / 1000 = <b>0.00024 mol</b>`
            },
            {
              id: 'step_2d',
              letter: 'd',
              field: 'moleRatioRedox',
              label: 'Determine the mole ratio in which ethanedioic acid reacts with potassium manganate(VII) (Moles H₂C₂O₄ / Moles KMnO₄)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 2.5',
              step: '0.1',
              unit: 'ratio (5 : 2)',
              calcTheoretical: () => 2.5,
              calcEcf: (ctx) => {
                const mOx = parseFloat(getAnswerValue(ctx.answers, 'molesOxalicP2', 'step_2b')) || 0.00125;
                const mK2 = parseFloat(getAnswerValue(ctx.answers, 'molesKmno4P2', 'step_2c')) || 0.00024;
                return mK2 > 0 ? parseFloat((mOx / mK2).toFixed(1)) : 2.5;
              },
              check: (val) => Math.abs(val - 2.5) <= 0.4,
              feedbackSuccess: (val) => `✓ Correct: Mole ratio = ${val} : 1 (5 C₂O₄²⁻ : 2 MnO₄⁻).`,
              feedbackFail: () => `Formula: Moles Ethanedioic Acid / Moles KMnO₄ = 2.5 (5 : 2).`,
              working: () => `<b>(d) Reaction Mole Ratio:</b> 0.00125 / 0.00024 = <b>2.5 (5 C₂O₄²⁻ : 2 MnO₄⁻)</b>`
            }
          ]
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Substance Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid D',
      sampleDesc: 'A dense black inorganic powder containing manganese(IV) oxide and iron.',
      trueSaltKey: 'MnO2',
      trueSaltName: 'Manganese(IV) Oxide — MnO₂',
      trueCation: 'Fe3+',
      trueAnion: 'Cl-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_acid_warm',
          prompt: '(i) To half of Solid D, add 1 cm³ 6M HCl and warm gently for 1 minute.',
          correctObs: 'Effervescence increases with heating; greenish-yellow gas evolved with pungent choking smell that bleaches moist blue litmus paper',
          correctInf: 'Chlorine gas evolved; Solid D is an oxidizing agent'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) Dilute mixture with water, filter, and add 2M NaOH dropwise until in excess.',
          correctObs: 'Reddish-brown precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Fe³⁺ confirmed present (Fe(OH)₃ formed)'
        },
        {
          id: 'q2_peroxide',
          prompt: '(iii) To remaining Solid D, add 1 cm³ 20-volume hydrogen peroxide (H₂O₂).',
          correctObs: 'Vigorous effervescence of a colourless gas that rekindles / relights a glowing wooden splint',
          correctInf: 'Oxygen gas evolved; Solid D acts as a catalyst (MnO₂)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid E',
      sampleDesc: 'A pure white crystalline organic solid.',
      trueOrganicKey: 'Maleic Acid',
      trueOrganicName: 'Maleic Acid — C₄H₄O₄',
      trueFunctionalGroup: 'Unsaturated Carboxylic Acid (-COOH, >C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite Solid E on clean metallic spatula using a Bunsen burner flame.',
          correctObs: 'Melts to colourless liquid; burns with a luminous, smoky and sooty yellow flame; leaves carbon residue',
          correctInf: 'Unsaturated organic compound / high C:H ratio (>C=C<)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid E in distilled water; test with blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns faint red/pink; red litmus unchanged (pH ~ 2)',
          correctInf: 'Acidic substance / carboxylic acid (—COOH) / H⁺ present'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of solution, add 2 drops acidified KMnO₄ and warm gently.',
          correctObs: 'Purple KMnO₄ solution is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of solution, add solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of colourless gas that turns limewater milky',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 1995: Official KCSE 1995 Standard Chemistry Practical (Paper 233/3) ──
  series_1995: {
    id: 'series_1995',
    seriesKey: 'series_1995',
    seriesNumber: 1995,
    title: 'KCSE 1995 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 1995 Past National Paper · Hess\'s Law Thermochemical Neutralization & Potassium Nitrate Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Thermochemical Acid-Base Neutralization (15.0 Marks)',
      solutionA: '0.200 M Sodium Hydroxide (Solution K)',
      solutionB: 'Hydrochloric Acid Solution J (Reaction of KHCO₃ with 2.0M HCl)',
      acidFormula: 'HCl',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.200,
      trueBaseMolarity: 0.200,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.2)',
      flaskIndicatorColor: 'rgba(255,255,255,0.2)',
      endpointColor: 'rgba(236,72,153,0.5)',
      overtitratedColor: 'rgba(219,39,119,0.9)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Fill the burette with 0.200 M Sodium Hydroxide Solution K. Pipette 25.0 cm³ of Hydrochloric Acid Solution J into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate Solution J with Solution K until the colourless solution turns to the first permanent faint pink colour.',
      procedureSteps: [
              "Fill the burette with 0.200 M Sodium Hydroxide Solution K and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Hydrochloric Acid Solution J into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution remains colourless).",
              "Titrate Solution J with Solution K with continuous swirling until the colourless solution turns to the first permanent faint pink colour.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.200 M NaOH Solution K used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesNaohK',
          label: 'Calculate the number of moles of NaOH present in the average volume V₁ of Solution K (0.200 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00500',
          step: '0.00001',
          unit: 'moles of NaOH',
          calcTheoretical: (ctx) => (0.200 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.200 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.200 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of NaOH in V₁:</b> (0.200 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.200 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesHclJ',
          label: 'Calculate the number of moles of HCl in 25.0 cm³ of Solution J (Mole ratio HCl : NaOH = 1 : 1)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00500',
          step: '0.00001',
          unit: 'moles of HCl',
          calcTheoretical: (ctx) => (0.200 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const mK = parseFloat(getAnswerValue(ctx.answers, 'molesNaohK', 'step_b')) || ((0.200 * ctx.trueTitre) / 1000.0);
            return mK;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl in 25.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of NaOH = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of HCl in 25.0 cm³:</b> <b>${((0.200 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityHclJ',
          label: 'Calculate the molar concentration (molarity) of HCl in Solution J in mol/dm³',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 0.200',
          step: '0.001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity,
          calcEcf: (ctx) => {
            const mJ = parseFloat(getAnswerValue(ctx.answers, 'molesHclJ', 'step_c')) || ((0.200 * ctx.trueTitre) / 1000.0);
            return (mJ * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution J = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of HCl × 1000) / 25.0 = ${expTheo.toFixed(3)} M.`,
          working: (ctx) => `<b>(d) Molarity of Solution J:</b> (Moles of HCl × 1000) / 25.0 = <b>${ctx.trueBaseMolarity.toFixed(4)} mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'concGramsHcl',
          label: 'Calculate the mass concentration of HCl in Solution J in g/dm³ (H = 1.0, Cl = 35.5)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 7.30',
          step: '0.01',
          unit: 'g/dm³',
          calcTheoretical: (ctx) => ctx.trueBaseMolarity * 36.5,
          calcEcf: (ctx) => {
            const molJ = parseFloat(getAnswerValue(ctx.answers, 'molarityHclJ', 'step_d')) || ctx.trueBaseMolarity;
            return molJ * 36.5;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Molarity × 36.5 = ${expTheo.toFixed(2)} g/dm³.`,
          working: (ctx) => `<b>(e) Mass Concentration of HCl:</b> ${ctx.trueBaseMolarity.toFixed(4)} M × 36.5 = <b>${(ctx.trueBaseMolarity * 36.5).toFixed(2)} g/dm³</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Metal Reactivity Qualitative Tests on Solid L (15.0 Marks)',
      sampleName: 'Solid L',
      sampleDesc: 'A silvery-grey lustrous flexible metal ribbon (Magnesium metal).',
      trueSaltKey: 'magnesium',
      trueSaltName: 'Magnesium Metal — Mg & Reactivity Bench',
      trueCation: 'Mg2+',
      trueAnion: 'Cl-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_appearance',
          prompt: '(i) Describe the physical appearance and flexibility of Solid L.',
          correctObs: 'Silvery-grey lustrous, shiny flexible metallic ribbon',
          correctInf: 'Metallic element; malleable and ductile metal'
        },
        {
          id: 'q2_heat',
          prompt: '(ii) Hold a piece of Solid L with a pair of crucible tongs and heat it strongly in a Bunsen burner flame.',
          correctObs: 'Burns with a brilliant dazzling white flame; leaves a white powdery ash (MgO)',
          correctInf: 'Highly reactive alkaline earth metal (Mg); oxidized to magnesium oxide'
        },
        {
          id: 'q2_water',
          prompt: '(iii) Place a small piece of Solid L in a test tube containing 3 cm³ distilled water and warm gently.',
          correctObs: 'Slow evolution of tiny gas bubbles on metal surface; gas gives a pop sound with burning splint',
          correctInf: 'Metal reacts slowly with warm water; hydrogen gas (H₂) evolved; metal is above hydrogen in reactivity series'
        },
        {
          id: 'q2_acid',
          prompt: '(iv) To a piece of Solid L in a test tube, add 3 cm³ 2M dilute hydrochloric acid (HCl); test gas with a burning splint.',
          correctObs: 'Rapid and vigorous effervescence; test tube becomes warm; gas burns with a sharp "pop" sound',
          correctInf: 'Hydrogen gas (H₂) evolved; Mg displaces H⁺ ions rapidly; exothermic reaction; Mg²⁺ formed'
        },
        {
          id: 'q2_displacement',
          prompt: '(v) Place a cleaned piece of Solid L into 3 cm³ Lead(II) Nitrate solution [Pb(NO₃)₂].',
          correctObs: 'Silvery metal is coated with a spongy dark grey/black deposit of metallic lead; solution remains colourless',
          correctInf: 'Redox displacement: Mg(s) + Pb²⁺(aq) → Mg²⁺(aq) + Pb(s); Mg is higher than Pb in electrochemical series'
        },
        {
          id: 'q2_naoh',
          prompt: '(vi) To 2 cm³ of the solution from reaction (iv) [Mg + HCl], add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Mg²⁺ confirmed present (Mg(OH)₂ formed; insoluble in excess alkali; distinct from Zn²⁺, Al³⁺, Pb²⁺)'
        }
      ]
    },
    q3: {
      type: 'qualitative_single',
      simulationType: 'qualitative',
      title: 'Question 3: Qualitative Analysis of Solid N (10.0 Marks)',
      sampleName: 'Solid N',
      sampleDesc: 'A pure, white crystalline inorganic potassium salt.',
      trueSaltKey: 'potassiumNitrate',
      trueSaltName: 'Potassium Nitrate — KNO₃',
      trueCation: 'K+',
      trueAnion: 'NO3-',
      hasDeduction: true,
      tests: [
        {
          id: 'q3_appearance',
          prompt: '(i) Describe the appearance of Solid N and dissolve half a spatula-end in 5 cm³ distilled water.',
          correctObs: 'White crystalline solid dissolves completely to form a clear colourless neutral solution',
          correctInf: 'Soluble salt; absence of coloured transition metal ions'
        },
        {
          id: 'q3_flame',
          prompt: '(ii) Perform a flame test on Solid N using a clean nichrome wire dipped in conc. HCl into a non-luminous Bunsen burner flame.',
          correctObs: 'Persistent lilac / purple flame coloration',
          correctInf: 'K⁺ confirmed present'
        },
        {
          id: 'q3_heat',
          prompt: '(iii) Heat a spatula-end of Solid N strongly in a dry test tube and test any gas evolved with a glowing wooden splint.',
          correctObs: 'Solid decrepitates and melts into a colourless liquid; gas evolved relights / rekindles a glowing splint',
          correctInf: 'Oxygen gas (O₂) evolved; thermal decomposition of nitrate: 2KNO₃(s) → 2KNO₂(s) + O₂(g); NO₃⁻ present'
        },
        {
          id: 'q3_reduction',
          prompt: '(iv) To 2 cm³ of the aqueous solution of Solid N, add 2 cm³ 2M NaOH, add a piece of aluminium foil, and warm gently; test gas with moist red litmus paper.',
          correctObs: 'Effervescence of a pungent choking alkaline gas that turns moist red litmus paper blue',
          correctInf: 'Ammonia gas (NH₃) evolved via Devarda-type aluminium reduction; NO₃⁻ confirmed present'
        }
      ]
    }
  },

  // ── Series 1994: Official KCSE 1994 Standard Chemistry Practical (Paper 233/3) ──
  series_1994: {
    id: 'series_1994',
    seriesKey: 'series_1994',
    seriesNumber: 1994,
    title: 'KCSE 1994 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 1994 Past National Paper · Acid Basicity Determination & Calcium Salt Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'acid_basicity',
      title: 'Question 1: Volumetric Analysis — Acid Basicity Determination (15.0 Marks)',
      solutionA: '0.300 M Sodium Hydroxide (Solution D)',
      solutionB: '0.100 M Polyprotic Carboxylic Acid HₙA (Solution E)',
      acidFormula: 'H3A',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.300,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 3,
      moleRatioBase: 1,
      acidRfm: 40.0,
      baseRfm: 192.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.25)',
      flaskIndicatorColor: 'rgba(255,255,255,0.25)',
      endpointColor: 'rgba(236,72,153,0.7)',
      overtitratedColor: 'rgba(219,39,119,0.95)',
      equation: 'H₃A(aq) + 3NaOH(aq) → Na₃A(aq) + 3H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution E (0.100 M Carboxylic Acid) into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with 0.300 M NaOH Solution D until the first permanent faint pink colour appears.',
      procedureSteps: [
              "Fill the burette with 0.300 M Sodium Hydroxide Solution D and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Carboxylic Acid Solution E into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of phenolphthalein indicator (solution remains colourless).",
              "Titrate Solution E with Solution D with continuous swirling until the first permanent faint pink colour appears.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.300 M NaOH Solution D used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesNaoh',
          label: 'Calculate the number of moles of NaOH present in the average titre V₁ of Solution D',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00750',
          step: '0.00001',
          unit: 'moles of NaOH',
          calcTheoretical: (ctx) => (0.300 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.300 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.300 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of NaOH:</b> (0.300 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.300 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesAcid',
          label: 'Calculate the number of moles of Carboxylic Acid in 25.0 cm³ of Solution E (0.100 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00250',
          step: '0.00001',
          unit: 'moles of Acid',
          calcTheoretical: () => (0.100 * 25.0) / 1000.0,
          calcEcf: () => (0.100 * 25.0) / 1000.0,
          check: (val) => Math.abs(val - ((0.100 * 25.0) / 1000.0)) <= 0.0002,
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of acid.`,
          feedbackFail: () => `Formula: (0.100 × 25.0) / 1000 = 0.00250 mol.`,
          working: () => `<b>(c) Moles of Acid in 25.0 cm³:</b> (0.100 × 25.0) / 1000 = <b>0.00250 mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'moleRatio',
          label: 'Determine the number of moles of NaOH reacting with 1 mole of Carboxylic Acid (Moles of NaOH / Moles of Acid)',
          marks: 3.0,
          marksLabel: '(3.0 Marks)',
          placeholder: 'e.g. 3.0',
          step: '0.1',
          unit: '',
          calcTheoretical: () => 3.0,
          calcEcf: (ctx) => {
            const mB = parseFloat(getAnswerValue(ctx.answers, 'molesNaoh', 'step_b')) || 0.00750;
            const mA = parseFloat(getAnswerValue(ctx.answers, 'molesAcid', 'step_c')) || 0.00250;
            return mA > 0 ? parseFloat((mB / mA).toFixed(1)) : 3.0;
          },
          check: (val) => Math.abs(val - 3.0) <= 0.3,
          feedbackSuccess: (val) => `✓ Correct: Mole ratio NaOH : Acid = ${val} : 1.`,
          feedbackFail: () => `Formula: Moles of NaOH (0.00750) / Moles of Acid (0.00250) = 3.0.`,
          working: () => `<b>(d) Mole Ratio NaOH : Acid:</b> 0.00750 / 0.00250 = <b>3.0 : 1</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'basicity',
          label: 'State the basicity (number of replaceable hydrogen ions per molecule, n) of the carboxylic acid',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 3',
          step: '1',
          unit: '',
          calcTheoretical: () => 3,
          calcEcf: () => 3,
          check: (val) => Number(val) === 3,
          feedbackSuccess: (val) => `✓ Correct: Basicity n = ${val} (Tribasic acid).`,
          feedbackFail: () => `Since 3 moles of NaOH react with 1 mole of acid, basicity n = 3 (Tribasic acid).`,
          working: () => `<b>(e) Basicity of Acid:</b> n = <b>3 (Tribasic)</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid H',
      sampleDesc: 'A white crystalline inorganic salt containing calcium.',
      trueSaltKey: 'calciumChloride',
      trueSaltName: 'Calcium Chloride Hydrate — CaCl₂·2H₂O',
      trueCation: 'Ca2+',
      trueAnion: 'Cl-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_flame',
          prompt: '(i) Perform a flame test on Solid H using a clean nichrome wire dipped in concentrated HCl.',
          correctObs: 'Persistent brick-red / orange-red flame coloration',
          correctInf: 'Ca²⁺ confirmed present'
        },
        {
          id: 'q2_heat',
          prompt: '(ii) Heat a half-spatula of Solid H strongly in a dry test tube.',
          correctObs: 'White crystalline solid decrepitates; colourless liquid droplets condense on upper cooler walls',
          correctInf: 'Hydrated salt / contains water of crystallization'
        },
        {
          id: 'q2_appearance',
          prompt: '(iii) Dissolve remaining Solid H in 10 cm³ distilled water. To portion 1, add 2M NaOH dropwise to excess.',
          correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Ca²⁺ or Mg²⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iv) To portion 2, add 2M aqueous ammonia dropwise until in excess.',
          correctObs: 'No precipitate formed with aqueous ammonia; solution remains clear and colourless',
          correctInf: 'Ca²⁺ confirmed present (Mg²⁺ is excluded as it forms a precipitate with aqueous ammonia)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops dilute HNO₃ followed by silver nitrate (AgNO₃) solution.',
          correctObs: 'Dense white precipitate formed, dissolves in aqueous ammonia to form a clear colourless solution',
          correctInf: 'Cl⁻ confirmed present (AgCl formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid G',
      sampleDesc: 'A pure white organic crystalline solid.',
      trueOrganicKey: 'org_acid',
      trueOrganicName: 'Saturated Carboxylic Acid (Citric Acid)',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite a small portion of Solid G on a clean metallic spatula in a Bunsen flame.',
          correctObs: 'Melts and burns with a clear, non-sooty pale blue flame; leaves no carbon residue',
          correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid G in 5 cm³ distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (pH ~ 2–3)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of solution, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ solution persists (not decolorized)',
          correctInf: 'Alkene (>C=C<) and primary/secondary alkanol absent'
        }
      ]
    }
  },

  // ── Series 1993: Official KCSE 1993 Standard Chemistry Practical (Paper 233/3) ──
  series_1993: {
    id: 'series_1993',
    seriesKey: 'series_1993',
    seriesNumber: 1993,
    title: 'KCSE 1993 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 1993 Past National Paper · Ammonium Salt Back-Titration & Sodium Sulfite Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'back_titration',
      title: 'Question 1: Volumetric Analysis — Ammonium Salt Back-Titration (15.0 Marks)',
      hasMultipleProcedures: true,
      solutionA: '0.080 M Hydrochloric Acid (Solution C)',
      solutionB: 'Diluted Sodium Hydroxide Solution D',
      acidFormula: 'HCl',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.080,
      trueBaseMolarity: 0.080,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.7)',
      endpointColor: 'rgba(255,255,255,0.25)',
      overtitratedColor: 'rgba(255,255,255,0.15)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Procedure I: Pipette 25.0 cm³ of Diluted Sodium Hydroxide Solution D into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with 0.080 M HCl Solution C until the pink colour is just discharged to colourless. Complete Table 1.',
      procedureSteps: [
        'Fill the burette with 0.080 M Hydrochloric Acid Solution C and adjust the meniscus to 0.00 cm³.',
        'Pipette exactly 25.0 cm³ of Diluted Sodium Hydroxide Solution D into a clean 250 cm³ conical flask.',
        'Add 2–3 drops of phenolphthalein indicator (solution turns pink).',
        'Titrate with Solution C until the pink colour discharges sharply to colourless.',
        'Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³.'
      ],
      procedures: [
        {
          procedureIndex: 1,
          title: 'Procedure I: Titration of Diluted Sodium Hydroxide (Solution D)',
          tableTitle: 'Table 1: Titration of Solution D with Acid Solution C',
          tableMarks: 4.0,
          solutionA: '0.080 M Hydrochloric Acid (Solution C)',
          solutionB: 'Diluted Sodium Hydroxide Solution D',
          indicator: 'Phenolphthalein',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.25)',
          endpointColor: 'rgba(255,255,255,0.25)',
          instructions: 'Fill the burette with 0.080 M HCl Solution C. Pipette 25.0 cm³ of Solution D into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution C until the pink colour is discharged. Complete Table 1.',
          procedureSteps: [
            'Fill the burette with 0.080 M Hydrochloric Acid Solution C and adjust meniscus to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of Solution D into a clean conical flask.',
            'Add 2–3 drops of phenolphthalein indicator.',
            'Titrate with Solution C until the pink colour discharges to colourless.',
            'Record initial and final readings to complete Table 1 with concordant titres.'
          ],
          questions: [
            {
              id: 'step_1a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of 0.080 M HCl Solution C used for Solution D, V₁',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 25.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 25.00,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₁:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_1b',
              letter: 'b',
              field: 'molesHclUsed',
              label: 'Calculate the number of moles of HCl present in the average titre V₁ of Solution C (0.080 M)',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 0.00200',
              step: '0.00001',
              unit: 'moles of HCl',
              calcTheoretical: (ctx) => (0.080 * (ctx.trueTitre || 25.00)) / 1000.0,
              calcEcf: (ctx) => {
                const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a')) || 25.00;
                return (0.080 * v1) / 1000.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl.`,
              feedbackFail: (ctx, expTheo) => `Formula: (0.080 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
              working: (ctx) => `<b>(b) Moles of HCl:</b> (0.080 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.080 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
            },
            {
              id: 'step_1c',
              letter: 'c',
              field: 'molarityNaohD',
              label: 'Calculate the molar concentration of Diluted Sodium Hydroxide Solution D in mol/dm³',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 0.080',
              step: '0.001',
              unit: 'mol/dm³ (M)',
              calcTheoretical: () => (0.080 * 25.00) / 25.0,
              calcEcf: (ctx) => {
                const mHcl = parseFloat(getAnswerValue(ctx.answers, 'molesHclUsed', 'step_1b')) || 0.00200;
                return (mHcl * 1000.0) / 25.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Molarity of Solution D = ${val} mol/dm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: (Moles of HCl × 1000) / 25.0 = ${expTheo.toFixed(3)} mol/dm³.`,
              working: (ctx) => `<b>(c) Molarity of Solution D:</b> (${((0.080 * ctx.v1) / 1000.0).toFixed(5)} × 1000) / 25.0 = <b>0.080 mol/dm³</b>`
            }
          ]
        },
        {
          procedureIndex: 2,
          title: 'Procedure II: Back-Titration of Residual Unreacted NaOH (Solution E)',
          tableTitle: 'Table 2: Titration of Residual NaOH Solution E with Solution C',
          tableMarks: 4.0,
          solutionA: '0.080 M Hydrochloric Acid (Solution C)',
          solutionB: 'Residual Sodium Hydroxide Solution E (from reaction with Solid B)',
          indicator: 'Phenolphthalein',
          pipetteVolume: 25.0,
          trueTitre: 15.60,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.25)',
          endpointColor: 'rgba(255,255,255,0.25)',
          instructions: 'Pipette 25.0 cm³ of Solution E (residual NaOH solution) into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with 0.080 M HCl Solution C until the pink colour is just discharged to colourless. Complete Table 2.',
          procedureSteps: [
            'Fill the burette with 0.080 M HCl Solution C and adjust meniscus to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of Solution E (residual NaOH reaction mixture) into a conical flask.',
            'Add 2–3 drops of phenolphthalein indicator (turns pink).',
            'Titrate with Solution C until the pink colour is just discharged to colourless.',
            'Record initial and final readings to complete Table 2 with concordant titres.'
          ],
          questions: [
            {
              id: 'step_2a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of 0.080 M HCl Solution C used for Solution E, V₂',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 15.60',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 15.60,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₂ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₂:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_2b',
              letter: 'b',
              field: 'molesHcl',
              label: 'Calculate the number of moles of HCl in the average titre V₂ of Solution C',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 0.00125',
              step: '0.00001',
              unit: 'moles of HCl',
              calcTheoretical: () => (0.080 * 15.60) / 1000.0,
              calcEcf: (ctx) => {
                const v2 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_2a')) || 15.60;
                return (0.080 * v2) / 1000.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl.`,
              feedbackFail: (ctx, expTheo) => `Formula: (0.080 × V₂) / 1000 = ${expTheo.toFixed(5)} mol.`,
              working: (ctx) => `<b>(b) Moles of HCl:</b> (0.080 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.080 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
            },
            {
              id: 'step_2c',
              letter: 'c',
              field: 'molesResidual',
              label: 'Calculate the total number of unreacted moles of NaOH present in the 100 cm³ of Solution E',
              marks: 1.5,
              marksLabel: '(1.5 Marks)',
              placeholder: 'e.g. 0.00500',
              step: '0.00001',
              unit: 'moles of NaOH',
              calcTheoretical: () => ((0.080 * 15.60) / 1000.0) * 4.0,
              calcEcf: (ctx) => {
                const mH = parseFloat(getAnswerValue(ctx.answers, 'molesHcl', 'step_2b')) || ((0.080 * 15.60) / 1000.0);
                return mH * 4.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} unreacted moles of NaOH in 100 cm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: Moles of HCl in 25 cm³ × (100 / 25) = ${expTheo.toFixed(5)} mol.`,
              working: (ctx) => `<b>(c) Unreacted Moles of NaOH in 100 cm³:</b> ${((0.080 * ctx.v1) / 1000.0).toFixed(5)} × 4 = <b>${(((0.080 * ctx.v1) / 1000.0) * 4.0).toFixed(5)} mol</b>`
            },
            {
              id: 'step_2d',
              letter: 'd',
              field: 'molesReacted',
              label: 'Calculate the moles of NaOH that reacted with 1.00 g of ammonium salt Solid B (Initial moles = 0.0237 mol)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.0187',
              step: '0.0001',
              unit: 'moles reacted',
              calcTheoretical: () => 0.0237 - (((0.080 * 15.60) / 1000.0) * 4.0),
              calcEcf: (ctx) => {
                const mRes = parseFloat(getAnswerValue(ctx.answers, 'molesResidual', 'step_2c')) || (((0.080 * 15.60) / 1000.0) * 4.0);
                return 0.0237 - mRes;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH reacted.`,
              feedbackFail: (ctx, expTheo) => `Formula: 0.0237 - Residual Moles = ${expTheo.toFixed(4)} mol.`,
              working: () => `<b>(d) Moles of NaOH Reacted:</b> 0.0237 - 0.0050 = <b>0.0187 mol</b>`
            },
            {
              id: 'step_2e',
              letter: 'e',
              field: 'rfmSalt',
              label: 'Given that 1 mole of NaOH reacts with 1 mole of Solid B, calculate the relative formula mass (RFM) of Solid B (1.00 g sample)',
              marks: 2.5,
              marksLabel: '(2.5 Marks)',
              placeholder: 'e.g. 53.5',
              step: '0.1',
              unit: 'g/mol',
              calcTheoretical: () => 53.5,
              calcEcf: (ctx) => {
                const mReacted = parseFloat(getAnswerValue(ctx.answers, 'molesReacted', 'step_2d')) || 0.0187;
                return mReacted > 0 ? parseFloat((1.00 / mReacted).toFixed(1)) : 53.5;
              },
              check: (val) => Math.abs(val - 53.5) <= 3.5,
              feedbackSuccess: (val) => `✓ Correct: RFM of Solid B = ${val} g/mol (Ammonium Chloride NH₄Cl).`,
              feedbackFail: () => `Formula: Mass (1.00 g) / Moles Reacted (0.0187) = 53.5 g/mol.`,
              working: () => `<b>(e) RFM of Solid B:</b> 1.00 / 0.0187 = <b>53.5 g/mol (NH₄Cl)</b>`
            }
          ]
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid F',
      sampleDesc: 'A white crystalline inorganic salt containing sulfite.',
      trueSaltKey: 'sodiumSulfite',
      trueSaltName: 'Sodium Sulfite — Na₂SO₃',
      trueCation: 'Na+',
      trueAnion: 'SO32-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_dissolve',
          prompt: '(i) Dissolve Solid F in 15 cm³ distilled water. To portion 1, add 2M NaOH dropwise to excess.',
          correctObs: 'No precipitate formed; clear colourless solution remains',
          correctInf: 'Transition metal ions, Mg²⁺, Ca²⁺ absent; Na⁺, K⁺, NH₄⁺ suspected'
        },
        {
          id: 'q2_bacl2',
          prompt: '(ii) To portion 2, add 4 drops Barium Chloride (BaCl₂) solution.',
          correctObs: 'White precipitate formed',
          correctInf: 'SO₄²⁻, SO₃²⁻, or CO₃²⁻ present (BaSO₃ / BaSO₄ / BaCO₃)'
        },
        {
          id: 'q2_acid_warm',
          prompt: '(iii) To the mixture from (ii), add 2 cm³ 2M dilute hydrochloric acid (HCl) and warm gently.',
          correctObs: 'White precipitate dissolves completely with effervescence of a choking pungent gas turning damp blue litmus red',
          correctInf: 'SO₃²⁻ confirmed present (SO₂ gas evolved; SO₄²⁻ absent)'
        },
        {
          id: 'q2_dichromate_paper',
          prompt: '(iv) Test the gas evolved in (iii) using filter paper moistened with acidified Potassium Dichromate(VI).',
          correctObs: 'Orange filter paper turns dark emerald green',
          correctInf: 'SO₂ gas confirmed (Cr³⁺ ions formed)'
        },
        {
          id: 'q2_iodine',
          prompt: '(v) To portion 3, add 3 drops of brown Iodine solution.',
          correctObs: 'Brown colour of iodine solution is rapidly decolorized to colourless',
          correctInf: 'SO₃²⁻ confirmed acting as a reducing agent (I₂ reduced to I⁻)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid G',
      sampleDesc: 'A pure white organic crystalline solid.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Carboxylic Acid (Maleic Acid)',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite a small portion of Solid G on a clean metallic spatula in a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C<)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid G in 5 cm³ distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (strongly acidic, pH ~ 2)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_bromine',
          prompt: '(iv) To 2 cm³ of solution, add 3 drops of Bromine water and shake gently.',
          correctObs: 'Reddish-brown colour of bromine water is rapidly decolorized to colourless',
          correctInf: 'Carbon-carbon double bond (>C=C<) confirmed present'
        }
      ]
    }
  },

  // ── Series 1992: Official KCSE 1992 Standard Chemistry Practical (Paper 233/3) ──
  series_1992: {
    id: 'series_1992',
    seriesKey: 'series_1992',
    seriesNumber: 1992,
    title: 'KCSE 1992 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 1992 Past National Paper · Borax Water of Crystallization & Barium Salt Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'water_of_crystallization',
      title: 'Question 1: Volumetric Analysis — Borax Water of Crystallization (15.0 Marks)',
      solutionA: '0.110 M Hydrochloric Acid (Solution C₅)',
      solutionB: 'Hydrated Sodium Tetraborate Na₂B₄O₇·nH₂O (19.20 g/dm³) Solution C₆',
      acidFormula: 'HCl',
      baseFormula: 'Na2B4O7',
      indicator: 'Methyl Orange',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.110,
      trueBaseMolarity: 0.0627,
      trueTitre: 28.50,
      moleRatioAcid: 2,
      moleRatioBase: 1,
      acidRfm: 36.5,
      baseRfm: 381.2,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.25)',
      flaskIndicatorColor: 'rgba(245,158,11,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      overtitratedColor: 'rgba(185,28,28,0.95)',
      equation: 'Na₂B₄O₇(aq) + 2HCl(aq) + 5H₂O(l) → 4H₃BO₃(aq) + 2NaCl(aq)',
      instructions: 'Pipette 25.0 cm³ of Solution C₆ (19.20 g/dm³ hydrated sodium tetraborate) into a clean conical flask. Add 2–3 drops of methyl orange indicator. Titrate with 0.110 M HCl Solution C₅ until the yellow colour changes sharply to permanent orange-red.',
      procedureSteps: [
              "Fill the burette with 0.110 M Hydrochloric Acid Solution C₅ and adjust the meniscus level precisely to 0.00 cm³.",
              "Pipette exactly 25.0 cm³ of Hydrated Sodium Tetraborate Solution C₆ into a clean 250 cm³ conical flask.",
              "Add 2–3 drops of methyl orange indicator (solution turns yellow).",
              "Titrate Solution C₆ with Solution C₅ with continuous swirling until the yellow solution turns sharply to permanent orange-red.",
              "Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³."
      ],
      questions: [
        {
          id: 'step_a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.110 M HCl Solution C₅ used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 28.50',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_b',
          letter: 'b',
          field: 'molesHcl',
          label: 'Calculate the number of moles of HCl present in the average titre V₁ of Solution C₅',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00314',
          step: '0.00001',
          unit: 'moles of HCl',
          calcTheoretical: (ctx) => (0.110 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_a')) || ctx.trueTitre;
            return (0.110 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of HCl.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.110 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of HCl:</b> (0.110 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.110 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_c',
          letter: 'c',
          field: 'molesBorax',
          label: 'Calculate the number of moles of sodium tetraborate in 25.0 cm³ of Solution C₆ (Mole ratio Acid : Base = 2 : 1)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00157',
          step: '0.00001',
          unit: 'moles of Borax',
          calcTheoretical: (ctx) => ((0.110 * ctx.trueTitre) / 1000.0) / 2.0,
          calcEcf: (ctx) => {
            const mH = parseFloat(getAnswerValue(ctx.answers, 'molesHcl', 'step_b')) || ((0.110 * ctx.trueTitre) / 1000.0);
            return mH / 2.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of sodium tetraborate in 25.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of HCl / 2 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of Borax in 25.0 cm³:</b> ${((0.110 * ctx.v1) / 1000.0).toFixed(5)} / 2 = <b>${(((0.110 * ctx.v1) / 1000.0) / 2.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_d',
          letter: 'd',
          field: 'molarityBorax',
          label: 'Calculate the molar concentration (molarity) of Solution C₆ in mol/dm³',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.0627',
          step: '0.0001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => (((0.110 * ctx.trueTitre) / 1000.0) / 2.0 * 1000.0) / 25.0,
          calcEcf: (ctx) => {
            const mB = parseFloat(getAnswerValue(ctx.answers, 'molesBorax', 'step_c')) || (((0.110 * ctx.trueTitre) / 1000.0) / 2.0);
            return (mB * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution C₆ = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of Borax × 1000) / 25.0 = ${expTheo.toFixed(4)} mol/dm³.`,
          working: (ctx) => `<b>(d) Molarity of Solution C₆:</b> (${(((0.110 * ctx.v1) / 1000.0) / 2.0).toFixed(5)} × 1000) / 25.0 = <b>0.0627 mol/dm³</b>`
        },
        {
          id: 'step_e',
          letter: 'e',
          field: 'rfmBorax',
          label: 'Calculate the relative formula mass (RFM) of hydrated sodium tetraborate (prepared with 19.20 g/dm³)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 306.2',
          step: '0.1',
          unit: 'g/mol',
          calcTheoretical: () => 306.2,
          calcEcf: (ctx) => {
            const mol = parseFloat(getAnswerValue(ctx.answers, 'molarityBorax', 'step_d')) || 0.0627;
            return mol > 0 ? parseFloat((19.20 / mol).toFixed(1)) : 306.2;
          },
          check: (val) => Math.abs(val - 306.2) <= 15.0,
          feedbackSuccess: (val) => `✓ Correct: RFM of hydrated borax = ${val} g/mol.`,
          feedbackFail: () => `Formula: Mass concentration (19.20 g/dm³) / Molarity (0.0627) = 306.2 g/mol.`,
          working: () => `<b>(e) RFM of Hydrated Borax:</b> 19.20 / 0.0627 = <b>306.2 g/mol</b>`
        },
        {
          id: 'step_f',
          letter: 'f',
          field: 'valueN',
          label: 'Determine the value of n in Na₂B₄O₇·nH₂O (Na = 23.0, B = 10.8, O = 16.0, H = 1.0; Anhydrous RFM = 201.2)',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 6',
          step: '1',
          unit: '',
          calcTheoretical: () => 6,
          calcEcf: (ctx) => {
            const rfm = parseFloat(getAnswerValue(ctx.answers, 'rfmBorax', 'step_e')) || 306.2;
            return Math.round((rfm - 201.2) / 18.0);
          },
          check: (val) => Number(val) === 6 || Number(val) === 10,
          feedbackSuccess: (val) => `✓ Correct: n = ${val} (Na₂B₄O₇·${val}H₂O).`,
          feedbackFail: () => `Formula: (306.2 - 201.2) / 18 = 105 / 18 ≈ 6.`,
          working: () => `<b>(f) Value of n:</b> (306.2 - 201.2) / 18.0 = 105.0 / 18.0 = <b>6</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid C₇',
      sampleDesc: 'A white crystalline inorganic salt containing barium.',
      trueSaltKey: 'bariumChloride',
      trueSaltName: 'Barium Chloride Hydrate — BaCl₂·2H₂O',
      trueCation: 'Ba2+',
      trueAnion: 'Cl-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_flame',
          prompt: '(i) Perform a flame test on Solid C₇ using a clean nichrome wire dipped in concentrated HCl.',
          correctObs: 'Persistent pale green / apple-green flame coloration',
          correctInf: 'Ba²⁺ confirmed present'
        },
        {
          id: 'q2_heat',
          prompt: '(ii) Heat a half-spatula of Solid C₇ gently in a dry test tube.',
          correctObs: 'White crystalline solid decrepitates; colourless liquid droplets condense on upper cooler walls',
          correctInf: 'Hydrated salt / contains water of crystallization'
        },
        {
          id: 'q2_sulfuric',
          prompt: '(iii) Dissolve remaining Solid C₇ in 10 cm³ distilled water. To portion 1, add 2M dilute sulfuric acid (H₂SO₄).',
          correctObs: 'Dense white precipitate formed, insoluble in dilute acids',
          correctInf: 'Ba²⁺ or Pb²⁺ present (BaSO₄ formed)'
        },
        {
          id: 'q2_naoh',
          prompt: '(iv) To portion 2, add 2M aqueous NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide',
          correctInf: 'Ba²⁺ confirmed present (Pb²⁺ is excluded as it dissolves in excess NaOH)'
        },
        {
          id: 'q2_anion',
          prompt: '(v) To portion 3, add 3 drops dilute HNO₃ followed by silver nitrate (AgNO₃) solution.',
          correctObs: 'Dense white precipitate formed, dissolves in aqueous ammonia to form a clear colourless solution',
          correctInf: 'Cl⁻ confirmed present (AgCl formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid C₈',
      sampleDesc: 'A pure white organic crystalline solid.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Carboxylic Acid (Maleic Acid)',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite a small portion of Solid C₈ on a clean metallic spatula in a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C<)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid C₈ in 5 cm³ distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (strongly acidic, pH ~ 2)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of solution, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present'
        }
      ]
    }
  },

  // ── Series 1990: Official KCSE 1990 Standard Chemistry Practical (Paper 233/3) ──
  series_1990: {
    id: 'series_1990',
    seriesKey: 'series_1990',
    seriesNumber: 1990,
    title: 'KCSE 1990 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 1990 Past National Paper · Acid-Base Volumetric Standardization & Organic Solubility',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Standardization of NaOH & Organic Acid Solubility Determination (15.0 Marks)',
      hasMultipleProcedures: true,
      solutionA: 'Sodium Hydroxide (NaOH) Solution S₁',
      solutionB: '0.010 M Dibasic Acid (H₂C₂O₄) Solution S₂',
      acidFormula: 'H2C2O4',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.010,
      trueBaseMolarity: 0.020,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 2,
      acidRfm: 90.0,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.2)',
      flaskIndicatorColor: 'rgba(255,255,255,0.2)',
      endpointColor: 'rgba(236,72,153,0.5)',
      overtitratedColor: 'rgba(219,39,119,0.9)',
      equation: 'H₂C₂O₄(aq) + 2NaOH(aq) → Na₂C₂O₄(aq) + 2H₂O(l)',
      instructions: 'Procedure I: Fill the burette with Sodium Hydroxide Solution S₁. Pipette 25.0 cm³ of 0.010 M Dibasic Acid Solution S₂ into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution S₁ until the colourless solution turns to the first permanent faint pink colour. Complete Table 1.',
      procedureSteps: [
        'Fill the burette with Sodium Hydroxide Solution S₁ and adjust the meniscus precisely to 0.00 cm³.',
        'Pipette exactly 25.0 cm³ of 0.010 M Dibasic Acid Solution S₂ into a clean 250 cm³ conical flask.',
        'Add 2–3 drops of phenolphthalein indicator (mixture remains colourless).',
        'Titrate with Solution S₁ with continuous swirling until the first permanent faint pink colour persists.',
        'Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³.'
      ],
      procedures: [
        {
          procedureIndex: 1,
          title: 'Procedure I: Standardization of NaOH (Solution S₁)',
          tableTitle: 'Table 1: Titration of Solution S₂ with Solution S₁',
          tableMarks: 4.0,
          solutionA: 'Sodium Hydroxide (NaOH) Solution S₁',
          solutionB: '0.010 M Dibasic Acid (H₂C₂O₄) Solution S₂',
          indicator: 'Phenolphthalein',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.2)',
          endpointColor: 'rgba(236,72,153,0.5)',
          instructions: 'Fill the burette with Sodium Hydroxide Solution S₁. Pipette 25.0 cm³ of 0.010 M Dibasic Acid Solution S₂ into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution S₁ until the colourless solution turns to the first permanent faint pink colour. Complete Table 1.',
          procedureSteps: [
            'Fill the burette with Sodium Hydroxide Solution S₁ and adjust the meniscus precisely to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of 0.010 M Dibasic Acid Solution S₂ into a clean 250 cm³ conical flask.',
            'Add 2–3 drops of phenolphthalein indicator.',
            'Titrate with Solution S₁ until the first permanent faint pink colour persists.',
            'Record initial and final readings to complete Table 1 with concordant titres within ±0.10 cm³.'
          ],
          questions: [
            {
              id: 'step_1a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of NaOH Solution S₁ used, V₁',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 25.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: (ctx) => ctx.trueTitre,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_1b',
              letter: 'b',
              field: 'molesAcid',
              label: 'Calculate the number of moles of dibasic acid present in 25.0 cm³ of Solution S₂ (0.010 M)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.00025',
              step: '0.00001',
              unit: 'moles of H₂A',
              calcTheoretical: () => 0.000250,
              calcEcf: () => 0.000250,
              check: (val) => Math.abs(val - 0.000250) <= 0.000025,
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of dibasic acid.`,
              feedbackFail: () => `Formula: (0.010 × 25.0) / 1000 = 0.00025 mol.`,
              working: () => `<b>(b) Moles of Dibasic Acid:</b> (0.010 × 25.0) / 1000 = <b>0.000250 mol</b>`
            },
            {
              id: 'step_1c',
              letter: 'c',
              field: 'molesNaoh',
              label: 'Calculate the number of moles of NaOH that reacted with 25.0 cm³ of Solution S₂ (Mole ratio H₂A : NaOH = 1 : 2)',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 0.00050',
              step: '0.00001',
              unit: 'moles of NaOH',
              calcTheoretical: () => 0.000500,
              calcEcf: (ctx) => {
                const mA = parseFloat(getAnswerValue(ctx.answers, 'molesAcid', 'step_1b', 'step_b')) || 0.000250;
                return mA * 2.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
              feedbackFail: (ctx, expTheo) => `Formula: Moles of acid × 2 = ${expTheo.toFixed(5)} mol.`,
              working: (ctx) => `<b>(c) Moles of NaOH in V₁:</b> 0.000250 × 2 = <b>0.000500 mol</b>`
            },
            {
              id: 'step_1d',
              letter: 'd',
              field: 'molarityNaoh',
              label: 'Calculate the molar concentration (molarity) of NaOH Solution S₁ in mol/dm³',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.020',
              step: '0.001',
              unit: 'mol/dm³ (M)',
              calcTheoretical: (ctx) => (0.000500 * 1000.0) / ctx.trueTitre,
              calcEcf: (ctx) => {
                const mB = parseFloat(getAnswerValue(ctx.answers, 'molesNaoh', 'step_1c', 'step_c')) || 0.000500;
                const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a', 'step_a')) || ctx.trueTitre;
                return (mB * 1000.0) / v1;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Molarity of Solution S₁ = ${val} mol/dm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: (Moles of NaOH × 1000) / V₁ = ${expTheo.toFixed(4)} mol/dm³.`,
              working: (ctx) => `<b>(d) Molarity of Solution S₁:</b> (0.000500 × 1000) / ${ctx.v1.toFixed(2)} = <b>0.0200 mol/dm³</b>`
            }
          ]
        },
        {
          procedureIndex: 2,
          title: 'Procedure II: Solubility of Saturated Organic Acid D',
          tableTitle: 'Table 2: Titration of Organic Acid D Filtrate with Solution S₁',
          tableMarks: 4.0,
          solutionA: 'Standardized NaOH Solution S₁',
          solutionB: 'Saturated Organic Acid D Filtrate',
          indicator: 'Phenolphthalein',
          pipetteVolume: 10.0,
          trueTitre: 18.20,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.2)',
          endpointColor: 'rgba(236,72,153,0.5)',
          instructions: 'Fill the burette with standardized NaOH Solution S₁. Pipette 10.0 cm³ of the saturated solution (filtrate) of Organic Acid D into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution S₁ until the colourless solution turns to the first permanent faint pink colour. Complete Table 2.',
          procedureSteps: [
            'Fill the burette with standardized NaOH Solution S₁ and adjust the meniscus precisely to 0.00 cm³.',
            'Pipette exactly 10.0 cm³ of the saturated Organic Acid D filtrate into a clean 250 cm³ conical flask.',
            'Add 2–3 drops of phenolphthalein indicator.',
            'Titrate with standardized Solution S₁ until the first permanent faint pink colour persists.',
            'Record initial and final readings to complete Table 2 with concordant titres within ±0.10 cm³.'
          ],
          questions: [
            {
              id: 'step_2a',
              letter: 'a',
              field: 'avgTitre2',
              label: 'Calculate the average volume of Solution S₁ used in Procedure II, V₂',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 18.20',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 18.20,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₂ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres in Table 2 (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₂:</b> V₂ = <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_2b',
              letter: 'b',
              field: 'molesAcid10',
              label: 'Calculate the number of moles of Acid D present in 10.0 cm³ of the saturated solution (filtrate) (Mole ratio Acid : NaOH = 1 : 1)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.000364',
              step: '0.000001',
              unit: 'moles in 10 cm³',
              calcTheoretical: () => (0.0200 * 18.20) / 1000.0,
              calcEcf: (ctx) => {
                const conc = parseFloat(getAnswerValue(ctx.answers, 'molarityNaoh', 'step_1d', 'step_d')) || 0.0200;
                const v2 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre2', 'step_2a')) || 18.20;
                return (conc * v2) / 1000.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of acid D in 10.0 cm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: (Molarity S₁ × V₂) / 1000 = ${expTheo.toFixed(6)} mol.`,
              working: () => `<b>(b) Moles of Acid D in 10.0 cm³:</b> (0.0200 × 18.20) / 1000 = <b>0.000364 mol</b>`
            },
            {
              id: 'step_2c',
              letter: 'c',
              field: 'molesAcid100',
              label: 'Calculate the number of moles of acid D present in 100 cm³ of the saturated solution',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 0.00364',
              step: '0.00001',
              unit: 'moles in 100 cm³',
              calcTheoretical: () => 0.00364,
              calcEcf: (ctx) => {
                const m10 = parseFloat(getAnswerValue(ctx.answers, 'molesAcid10', 'step_2b', 'step_e')) || 0.000364;
                return m10 * 10.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles in 100 cm³.`,
              feedbackFail: () => `Formula: Moles in 10 cm³ × (100 / 10) = 0.00364 mol.`,
              working: () => `<b>(c) Moles of Acid D in 100 cm³:</b> 0.000364 × 10 = <b>0.00364 mol</b>`
            },
            {
              id: 'step_2d',
              letter: 'd',
              field: 'solubilityAcid',
              label: 'Given that monobasic acid D has the molecular formula C₇H₆O₂ (C = 12.0, H = 1.0, O = 16.0; RFM = 122.0), calculate its solubility in g / 100 cm³ water',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.444',
              step: '0.001',
              unit: 'g / 100 cm³ water',
              calcTheoretical: () => 0.444,
              calcEcf: (ctx) => {
                const m100 = parseFloat(getAnswerValue(ctx.answers, 'molesAcid100', 'step_2c', 'step_f')) || 0.00364;
                return parseFloat((m100 * 122.0).toFixed(3));
              },
              check: (val) => Math.abs(val - 0.444) <= 0.04,
              feedbackSuccess: (val) => `✓ Correct: Solubility of Acid D = ${val} g / 100 cm³ water (Benzoic Acid).`,
              feedbackFail: () => `Formula: Moles in 100 cm³ (0.00364) × RFM (122.0) = 0.444 g / 100 cm³ water.`,
              working: () => `<b>(d) Solubility of Acid D:</b> 0.00364 mol × 122.0 g/mol = <b>0.444 g / 100 cm³ water</b>`
            }
          ]
        }
      ],
      questions: [
        {
          id: 'step_1a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of NaOH Solution S₁ used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_1b',
          letter: 'b',
          field: 'molesAcid',
          label: 'Calculate the number of moles of dibasic acid present in 25.0 cm³ of Solution S₂ (0.010 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00025',
          step: '0.00001',
          unit: 'moles of H₂A',
          calcTheoretical: () => 0.000250,
          calcEcf: () => 0.000250,
          check: (val) => Math.abs(val - 0.000250) <= 0.000025,
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of dibasic acid.`,
          feedbackFail: () => `Formula: (0.010 × 25.0) / 1000 = 0.00025 mol.`,
          working: () => `<b>(b) Moles of Dibasic Acid:</b> (0.010 × 25.0) / 1000 = <b>0.000250 mol</b>`
        },
        {
          id: 'step_1c',
          letter: 'c',
          field: 'molesNaoh',
          label: 'Calculate the number of moles of NaOH that reacted with 25.0 cm³ of Solution S₂ (Mole ratio H₂A : NaOH = 1 : 2)',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 0.00050',
          step: '0.00001',
          unit: 'moles of NaOH',
          calcTheoretical: () => 0.000500,
          calcEcf: (ctx) => {
            const mA = parseFloat(getAnswerValue(ctx.answers, 'molesAcid', 'step_1b', 'step_b')) || 0.000250;
            return mA * 2.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of acid × 2 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of NaOH in V₁:</b> 0.000250 × 2 = <b>0.000500 mol</b>`
        },
        {
          id: 'step_1d',
          letter: 'd',
          field: 'molarityNaoh',
          label: 'Calculate the molar concentration (molarity) of NaOH Solution S₁ in mol/dm³',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.020',
          step: '0.001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: (ctx) => (0.000500 * 1000.0) / ctx.trueTitre,
          calcEcf: (ctx) => {
            const mB = parseFloat(getAnswerValue(ctx.answers, 'molesNaoh', 'step_1c', 'step_c')) || 0.000500;
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a', 'step_a')) || ctx.trueTitre;
            return (mB * 1000.0) / v1;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Solution S₁ = ${val} mol/dm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Moles of NaOH × 1000) / V₁ = ${expTheo.toFixed(4)} mol/dm³.`,
          working: (ctx) => `<b>(d) Molarity of Solution S₁:</b> (0.000500 × 1000) / ${ctx.v1.toFixed(2)} = <b>0.0200 mol/dm³</b>`
        },
        {
          id: 'step_2a',
          letter: 'e',
          field: 'avgTitre2',
          label: 'Calculate the average volume of Solution S₁ used in Procedure II, V₂',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 18.20',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: () => 18.20,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₂ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres in Table 2 (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(e) Average Titre V₂:</b> V₂ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_2b',
          letter: 'f',
          field: 'molesAcid10',
          label: 'Calculate the number of moles of Acid D present in 10.0 cm³ of the saturated solution (filtrate) (Mole ratio Acid : NaOH = 1 : 1)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.000364',
          step: '0.000001',
          unit: 'moles in 10 cm³',
          calcTheoretical: () => (0.0200 * 18.20) / 1000.0,
          calcEcf: (ctx) => {
            const conc = parseFloat(getAnswerValue(ctx.answers, 'molarityNaoh', 'step_1d', 'step_d')) || 0.0200;
            const v2 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre2', 'step_2a')) || 18.20;
            return (conc * v2) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of acid D in 10.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: (Molarity S₁ × V₂) / 1000 = ${expTheo.toFixed(6)} mol.`,
          working: () => `<b>(f) Moles of Acid D in 10.0 cm³:</b> (0.0200 × 18.20) / 1000 = <b>0.000364 mol</b>`
        },
        {
          id: 'step_2c',
          letter: 'g',
          field: 'molesAcid100',
          label: 'Calculate the number of moles of acid D present in 100 cm³ of the saturated solution',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 0.00364',
          step: '0.00001',
          unit: 'moles in 100 cm³',
          calcTheoretical: () => 0.00364,
          calcEcf: (ctx) => {
            const m10 = parseFloat(getAnswerValue(ctx.answers, 'molesAcid10', 'step_2b', 'step_e')) || 0.000364;
            return m10 * 10.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles in 100 cm³.`,
          feedbackFail: () => `Formula: Moles in 10 cm³ × (100 / 10) = 0.00364 mol.`,
          working: () => `<b>(g) Moles of Acid D in 100 cm³:</b> 0.000364 × 10 = <b>0.00364 mol</b>`
        },
        {
          id: 'step_2d',
          letter: 'h',
          field: 'solubilityAcid',
          label: 'Given that monobasic acid D has the molecular formula C₇H₆O₂ (C = 12.0, H = 1.0, O = 16.0; RFM = 122.0), calculate its solubility in g / 100 cm³ water',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.444',
          step: '0.001',
          unit: 'g / 100 cm³ water',
          calcTheoretical: () => 0.444,
          calcEcf: (ctx) => {
            const m100 = parseFloat(getAnswerValue(ctx.answers, 'molesAcid100', 'step_2c', 'step_f')) || 0.00364;
            return parseFloat((m100 * 122.0).toFixed(3));
          },
          check: (val) => Math.abs(val - 0.444) <= 0.04,
          feedbackSuccess: (val) => `✓ Correct: Solubility of Acid D = ${val} g / 100 cm³ water (Benzoic Acid).`,
          feedbackFail: () => `Formula: Moles in 100 cm³ (0.00364) × RFM (122.0) = 0.444 g / 100 cm³ water.`,
          working: () => `<b>(h) Solubility of Acid D:</b> 0.00364 mol × 122.0 g/mol = <b>0.444 g / 100 cm³ water</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A white crystalline inorganic salt containing zinc and sulfate.',
      trueSaltKey: 'zincSulfate',
      trueSaltName: 'Zinc Sulfate Hydrate — ZnSO₄·7H₂O',
      trueCation: 'Zn2+',
      trueAnion: 'SO4^2-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a spatula end-full of Solid Y gently in a clean dry test tube, then strongly.',
          correctObs: 'Colourless liquid droplets condense on upper cooler walls; white crystalline residue turns yellow on heating and cools to white',
          correctInf: 'Hydrated salt / water of crystallization present; Zn²⁺ indicated (ZnO residue)'
        },
        {
          id: 'q2_acid',
          prompt: '(ii) Dissolve remaining Solid Y in 10 cm³ distilled water. To portion 1, add 2 cm³ 2M dilute hydrochloric acid (HCl).',
          correctObs: 'No effervescence / no bubbles formed; clear colourless solution persists',
          correctInf: 'CO₃²⁻, SO₃²⁻ absent'
        },
        {
          id: 'q2_naoh',
          prompt: '(iii) To portion 2, add 2M aqueous sodium hydroxide (NaOH) dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess sodium hydroxide to form a clear colourless solution',
          correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present ([Zn(OH)₄]²⁻ formed)'
        },
        {
          id: 'q2_ammonia',
          prompt: '(iv) To portion 3, add aqueous ammonia (NH₃(aq)) dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess aqueous ammonia to form a clear colourless solution',
          correctInf: 'Zn²⁺ confirmed present (forms soluble [Zn(NH₃)₄]²⁺ complex; Al³⁺, Pb²⁺ are insoluble in excess NH₃)'
        },
        {
          id: 'q2_barium',
          prompt: '(v) To portion 4, add 3 drops barium nitrate (Ba(NO₃)₂) solution followed by dilute nitric acid (HNO₃).',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid Q',
      sampleDesc: 'A pure white crystalline organic solid.',
      trueOrganicKey: 'org_benzoic_acid',
      trueOrganicName: 'Benzoic Acid — C₆H₅COOH',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite a small portion of Solid Q on a clean metallic spatula in a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, highly smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Aromatic compound / high carbon-to-hydrogen ratio present'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid Q in 5 cm³ distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper retains colour (acidic, pH ~ 2–3)',
          correctInf: 'Acidic organic substance / contains ionizable H⁺ ions / carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of solution, add 2–3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ solution persists / not decolorized',
          correctInf: 'Aliphatic alkene / alkyne (>C=C<) absent; stable benzene ring'
        },
        {
          id: 'q3_ester',
          prompt: '(v) To 2 cm³ of solution, add 3 cm³ ethanol and 2 drops concentrated sulfuric acid; warm gently and pour into cold water.',
          correctObs: 'Pleasant, sweet fruity fragrance produced (ethyl benzoate ester)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present'
        }
      ]
    }
  },

  // ── Series 1989: Official KCSE 1989 Standard Chemistry Practical (Paper 233/3) ──
  series_1989: {
    id: 'series_1989',
    seriesKey: 'series_1989',
    seriesNumber: 1989,
    title: 'KCSE 1989 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 1989 Past National Paper · NaOH Standardization, HCl Dilution & Mohr Salt Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — NaOH Standardization & HCl Dilution (18.0 Marks)',
      hasMultipleProcedures: true,
      solutionA: 'Sodium Hydroxide (NaOH) Solution W₁₂',
      solutionB: '0.050 M Dibasic Acid (H₂C₂O₄·2H₂O) Solution W₁₁',
      acidFormula: 'H2C2O4',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.050,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 2,
      acidRfm: 126.0,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.2)',
      flaskIndicatorColor: 'rgba(255,255,255,0.2)',
      endpointColor: 'rgba(236,72,153,0.5)',
      overtitratedColor: 'rgba(219,39,119,0.9)',
      equation: 'H₂C₂O₄(aq) + 2NaOH(aq) → Na₂C₂O₄(aq) + 2H₂O(l)',
      instructions: 'Part I: Pipette 25.0 cm³ of 0.050 M Dibasic Acid Solution W₁₁ into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Sodium Hydroxide Solution W₁₂ until a permanent faint pink colour appears. Complete Table 1.',
      procedureSteps: [
        'Fill the burette with Sodium Hydroxide Solution W₁₂ and adjust the meniscus precisely to 0.00 cm³.',
        'Pipette exactly 25.0 cm³ of 0.050 M Dibasic Acid Solution W₁₁ into a clean conical flask.',
        'Add 2–3 drops of phenolphthalein indicator (mixture remains colourless).',
        'Titrate with Solution W₁₂ with continuous swirling until the first permanent faint pink colour appears.',
        'Record readings and repeat to complete Table 1 with concordant titres.'
      ],
      procedures: [
        {
          procedureIndex: 1,
          title: 'Procedure I: Standardization of NaOH (Solution W₁₂)',
          tableTitle: 'Table 1: Titration of Solution W₁₁ with Solution W₁₂',
          tableMarks: 4.0,
          solutionA: 'Sodium Hydroxide (NaOH) Solution W₁₂',
          solutionB: '0.050 M Dibasic Acid (H₂C₂O₄·2H₂O) Solution W₁₁',
          indicator: 'Phenolphthalein',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.2)',
          endpointColor: 'rgba(236,72,153,0.5)',
          instructions: 'Fill the burette with Sodium Hydroxide Solution W₁₂. Pipette 25.0 cm³ of 0.050 M Dibasic Acid Solution W₁₁ into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution W₁₂ until the colourless solution turns to the first permanent faint pink colour. Complete Table 1.',
          procedureSteps: [
            'Fill the burette with Sodium Hydroxide Solution W₁₂ and adjust the meniscus precisely to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of 0.050 M Dibasic Acid Solution W₁₁ into a clean 250 cm³ conical flask.',
            'Add 2–3 drops of phenolphthalein indicator.',
            'Titrate with Solution W₁₂ until the first permanent faint pink colour persists.',
            'Record initial and final readings to complete Table 1 with concordant titres within ±0.10 cm³.'
          ],
          questions: [
            {
              id: 'step_1a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of NaOH Solution W₁₂ used, V₁',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 25.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: (ctx) => ctx.trueTitre,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_1b',
              letter: 'b',
              field: 'molarityW11',
              label: 'Calculate the molar concentration of dibasic acid Solution W₁₁ (6.30 g H₂C₂O₄·2H₂O per litre, RFM = 126.0)',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 0.050',
              step: '0.001',
              unit: 'mol/dm³',
              calcTheoretical: () => 0.050,
              calcEcf: () => 0.050,
              check: (val) => Math.abs(val - 0.050) <= 0.005,
              feedbackSuccess: (val) => `✓ Correct: Molarity of Solution W₁₁ = ${val} mol/dm³.`,
              feedbackFail: () => `Formula: Mass concentration (6.30 g/dm³) / RFM (126.0) = 0.050 mol/dm³.`,
              working: () => `<b>(b) Molarity of Solution W₁₁:</b> 6.30 / 126.0 = <b>0.050 mol/dm³</b>`
            },
            {
              id: 'step_1c',
              letter: 'c',
              field: 'molesNaohW12',
              label: 'Calculate the moles of NaOH in V₁ that reacted with 25.0 cm³ of Solution W₁₁ (Mole ratio 1 : 2)',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 0.00250',
              step: '0.00001',
              unit: 'moles of NaOH',
              calcTheoretical: () => 0.00250,
              calcEcf: (ctx) => {
                const mW = parseFloat(getAnswerValue(ctx.answers, 'molarityW11', 'step_1b')) || 0.050;
                return ((mW * 25.0) / 1000.0) * 2.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
              feedbackFail: (ctx, expTheo) => `Formula: ((Molarity W₁₁ × 25.0) / 1000) × 2 = ${expTheo.toFixed(5)} mol.`,
              working: () => `<b>(c) Moles of NaOH in V₁:</b> ((0.050 × 25.0) / 1000) × 2 = <b>0.00250 mol</b>`
            },
            {
              id: 'step_1d',
              letter: 'd',
              field: 'molarityNaohW12',
              label: 'Calculate the molar concentration (molarity) of NaOH Solution W₁₂ in mol/dm³',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.100',
              step: '0.001',
              unit: 'mol/dm³ (M)',
              calcTheoretical: (ctx) => (0.00250 * 1000.0) / ctx.trueTitre,
              calcEcf: (ctx) => {
                const mB = parseFloat(getAnswerValue(ctx.answers, 'molesNaohW12', 'step_1c')) || 0.00250;
                const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a')) || ctx.trueTitre;
                return (mB * 1000.0) / v1;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Molarity of Solution W₁₂ = ${val} mol/dm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: (Moles of NaOH × 1000) / V₁ = ${expTheo.toFixed(3)} mol/dm³.`,
              working: (ctx) => `<b>(d) Molarity of Solution W₁₂:</b> (0.00250 × 1000) / ${ctx.v1.toFixed(2)} = <b>0.100 mol/dm³</b>`
            }
          ]
        },
        {
          procedureIndex: 2,
          title: 'Procedure II: Titration of Standardized NaOH with Diluted HCl (Solution W₁₀)',
          tableTitle: 'Table 2: Titration of Standardized NaOH with Diluted HCl Solution W₁₀',
          tableMarks: 4.0,
          solutionA: 'Diluted Hydrochloric Acid Solution W₁₀',
          solutionB: 'Standardized Sodium Hydroxide Solution W₁₂',
          indicator: 'Methyl Orange',
          pipetteVolume: 25.0,
          trueTitre: 23.15,
          titrantColor: '#F8FAFC',
          flaskBaseColor: 'rgba(251,191,36,0.25)',
          endpointColor: 'rgba(239,68,68,0.7)',
          instructions: 'Fill the burette with Diluted Hydrochloric Acid Solution W₁₀. Pipette 25.0 cm³ of standardized NaOH Solution W₁₂ into a clean conical flask. Add 2–3 drops of methyl orange indicator. Titrate with Solution W₁₀ until the yellow colour turns sharply to orange-red. Complete Table 2.',
          procedureSteps: [
            'Rinse the burette and fill it with Diluted Hydrochloric Acid Solution W₁₀, adjusting the meniscus to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of standardized NaOH Solution W₁₂ into a clean 250 cm³ conical flask.',
            'Add 2–3 drops of methyl orange indicator (solution turns yellow).',
            'Titrate with Solution W₁₀ until the colour changes sharply from yellow to orange-red.',
            'Record readings to complete Table 2 with concordant titres within ±0.10 cm³.'
          ],
          questions: [
            {
              id: 'step_2a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of Diluted HCl Solution W₁₀ used, V₂',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 23.15',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: () => 23.15,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₂ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre V₂:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_2b',
              letter: 'b',
              field: 'molarityDilutedHcl',
              label: 'Calculate the molarity of diluted HCl Solution W₁₀ (Mole ratio NaOH : HCl = 1 : 1)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.108',
              step: '0.001',
              unit: 'mol/dm³',
              calcTheoretical: () => (0.100 * 25.0) / 23.15,
              calcEcf: (ctx) => {
                const mB = parseFloat(getAnswerValue(ctx.answers, 'molarityNaohW12', 'step_1d')) || 0.100;
                const v2 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_2a')) || 23.15;
                return (mB * 25.0) / v2;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Molarity of diluted HCl W₁₀ = ${val} mol/dm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: (Molarity W₁₂ × 25.0) / V₂ = ${expTheo.toFixed(3)} mol/dm³.`,
              working: () => `<b>(b) Molarity of Solution W₁₀:</b> (0.100 × 25.0) / 23.15 = <b>0.108 mol/dm³</b>`
            },
            {
              id: 'step_2c',
              letter: 'c',
              field: 'molarityConcHcl',
              label: 'Given that 10.0 cm³ of concentrated HCl Solution W₉ was diluted to 100 cm³ to make Solution W₁₀, calculate the molarity of original Solution W₉',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 1.08',
              step: '0.01',
              unit: 'mol/dm³',
              calcTheoretical: () => ((0.100 * 25.0) / 23.15) * 10.0,
              calcEcf: (ctx) => {
                const mDil = parseFloat(getAnswerValue(ctx.answers, 'molarityDilutedHcl', 'step_2b')) || 0.108;
                return mDil * 10.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Concentration of Solution W₉ = ${val} mol/dm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: Molarity of W₁₀ × (100 / 10) = ${expTheo.toFixed(2)} mol/dm³.`,
              working: () => `<b>(c) Concentration of original Solution W₉:</b> 0.108 × 10 = <b>1.08 mol/dm³</b>`
            }
          ]
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (15.0 Marks)',
      sampleName: 'Solid Y',
      sampleDesc: 'A pale-green crystalline inorganic double salt containing iron(II), ammonium, and sulfate.',
      trueSaltKey: 'ironSulfate',
      trueSaltName: "Mohr's Salt — Ammonium Iron(II) Sulfate Hydrate (NH₄)₂Fe(SO₄)₂·6H₂O",
      trueCation: 'Fe2+',
      trueAnion: 'SO4^2-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid Y in a clean dry hard-glass test tube, first gently then strongly. Test vapours with moist red and blue litmus papers.',
          correctObs: 'Colourless liquid droplets condense on upper cooler walls; pungent colourless gas evolved turning moist red litmus blue; white sublimation ring deposits on upper walls; residue turns reddish-brown',
          correctInf: 'Hydrated salt / water of crystallization present; basic gas (NH₃) evolved confirming NH₄⁺ present; Fe²⁺ oxidized to Fe³⁺'
        },
        {
          id: 'q2_acid',
          prompt: '(ii) Place a half-spatula of Solid Y in a test tube, add 2 cm³ of 2M dilute hydrochloric acid (HCl).',
          correctObs: 'Dissolves readily to form a clear pale-green solution; no effervescence / no bubbles of gas evolved',
          correctInf: 'CO₃²⁻, SO₃²⁻ absent; stable Fe²⁺ solution formed'
        },
        {
          id: 'q2_naoh_warm',
          prompt: '(iii) Dissolve the remaining Solid Y in 10 cm³ distilled water. To portion 1, add 2M sodium hydroxide (NaOH) dropwise until in excess, then warm gently and test vapours with moist red litmus paper.',
          correctObs: 'Dirty green precipitate formed, insoluble in excess NaOH, turns reddish-brown on standing at surface; on warming, a pungent gas is evolved that turns moist red litmus blue',
          correctInf: 'Fe²⁺ confirmed present (Fe(OH)₂ formed, oxidized by air to Fe(OH)₃); NH₄⁺ confirmed present (NH₃ gas evolved)'
        },
        {
          id: 'q2_ammonia',
          prompt: '(iv) To portion 2, add aqueous ammonia (NH₃(aq)) dropwise until in excess.',
          correctObs: 'Dirty green precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Fe²⁺ confirmed present (does not form soluble ammine complex)'
        },
        {
          id: 'q2_barium',
          prompt: '(v) To portion 3, add 3 drops barium nitrate (Ba(NO₃)₂) solution followed by 2 cm³ 2M dilute nitric acid (HNO₃).',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid Z',
      sampleDesc: 'A pure white organic crystalline solid.',
      trueOrganicKey: 'org_alkene',
      trueOrganicName: 'Unsaturated Carboxylic Acid (Maleic Acid)',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite a small portion of Solid Z on a clean metallic spatula in a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C<)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid Z in 5 cm³ distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red (strongly acidic, pH ~ 2)',
          correctInf: 'Acidic substance / H⁺ ions present / Carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of solution, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present'
        },
        {
          id: 'q3_bromine',
          prompt: '(v) To 2 cm³ of solution, add 3 drops of Bromine water and shake gently.',
          correctObs: 'Reddish-brown colour of bromine water is rapidly decolorized to colourless',
          correctInf: 'Carbon-carbon double bond (>C=C<) confirmed present by electrophilic halogen addition'
        }
      ]
    }
  },

  // ── Series 2004: Official KCSE 2004 Standard Chemistry Practical (Paper 233/3) ──
  series_2004: {
    id: 'series_2004',
    seriesKey: 'series_2004',
    seriesNumber: 2004,
    title: 'KCSE 2004 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2004 Past National Paper · Solid D Cooling Curve, Redox Stoichiometry & Organic Tests',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      simulationType: 'energy',
      scenarioKey: 'KCSE_2004_COOLING_CURVE',
      calcType: 'standard_molarity',
      title: 'Question 1: Thermometric Analysis & Volumetric Neutralization (20.0 Marks)',
      marks: 20.0,
      hasMultipleProcedures: true,
      solutionA: '0.100 M Sodium Hydroxide (Solution B)',
      solutionB: 'Dilute Hydrochloric Acid (Solution C)',
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
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.2)',
      flaskIndicatorColor: 'rgba(255,255,255,0.2)',
      endpointColor: 'rgba(236,72,153,0.5)',
      overtitratedColor: 'rgba(219,39,119,0.9)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Procedure I investigates the thermometric cooling curve of Solid D to determine its freezing point. Procedure II involves standardizing Solution C with 0.100 M NaOH Solution B using phenolphthalein indicator.',
      procedureSteps: [
        'Procedure I: Heat the boiling tube containing Solid D in a boiling water bath until fully melted at 85.0 °C. Remove from water bath, start stopwatch at t = 0s, stir gently with thermometer and record temperature every 30s in Table 1.',
        'Procedure II: Fill the burette with 0.100 M NaOH Solution B. Pipette 25.0 cm³ of Acid Solution C into a conical flask.',
        'Add 2–3 drops of phenolphthalein indicator.',
        'Titrate with Solution B until the first permanent faint pink colour persists.',
        'Record readings and repeat to complete Table 2 with concordant titres within ±0.10 cm³.'
      ],
      procedures: [
        {
          procedureIndex: 1,
          title: 'Procedure I: Cooling Curve & Freezing Point Determination of Solid D',
          tableTitle: 'Table 1: Temperature Readings for Cooling of Solid D',
          tableMarks: 4.0,
          marks: 10.0,
          simulationType: 'energy',
          scenarioKey: 'KCSE_2004_COOLING_CURVE',
          instructions: 'Heat the boiling tube containing Solid D in a water bath until completely melted. Remove the tube, start the clock, and record temperature every 30 seconds for 7.0 minutes as it cools in air. Complete Table 1.',
          questions: [
            {
              id: 'step_1a',
              letter: 'a',
              field: 'freezingPointD',
              label: 'From your cooling curve graph, determine the freezing point of Solid D in °C',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 69.0',
              step: '0.1',
              unit: '°C',
              calcTheoretical: () => 69.0,
              calcEcf: () => 69.0,
              check: (val) => Math.abs(val - 69.0) <= 1.5,
              feedbackSuccess: (val) => `✓ Correct: Freezing point of Solid D = ${val.toFixed(1)} °C.`,
              feedbackFail: () => `Expected around 69.0 °C (horizontal plateau region on cooling curve).`,
              working: () => `<b>(a) Freezing Point:</b> T_freezing = <b>69.0 °C</b>`
            },
            {
              id: 'step_1b',
              letter: 'b',
              field: 'plateauDuration',
              label: 'Calculate the duration of the solidification plateau (constant temperature region) in minutes',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 2.0',
              step: '0.1',
              unit: 'minutes',
              calcTheoretical: () => 2.0,
              calcEcf: () => 2.0,
              check: (val) => val >= 1.0 && val <= 3.5,
              feedbackSuccess: (val) => `✓ Correct: Solidification duration = ${val} min.`,
              feedbackFail: () => `Plateau lasts from approx t = 2.0 min to t = 4.0 min (duration ≈ 2.0 min).`,
              working: () => `<b>(b) Duration of Plateau:</b> 4.0 - 2.0 = <b>2.0 minutes</b>`
            },
            {
              id: 'step_1c',
              letter: 'c',
              field: 'latentHeatExplanation',
              label: 'Explain why the temperature remains constant between 2.0 minutes and 4.0 minutes',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. Latent heat of fusion released during solidification balances heat lost to the surroundings.',
              calcTheoretical: () => 1,
              calcEcf: () => 1,
              check: (val) => typeof val === 'string' && /(latent\s*heat|fusion|solidif|crystalliz|equilibrium|balances|offsets)/i.test(val),
              feedbackSuccess: () => `✓ Correct: Latent heat of fusion released during crystallization offsets cooling.`,
              feedbackFail: () => `State that latent heat of fusion released during phase change balances heat loss to surroundings.`,
              working: () => `<b>(c) Explanation:</b> Latent heat of fusion released during solidification offsets heat lost to the environment.`
            }
          ]
        },
        {
          procedureIndex: 2,
          title: 'Procedure II: Standardization Titration of Acid Solution C',
          tableTitle: 'Table 2: Titration of Acid Solution C with 0.100 M NaOH Solution B',
          tableMarks: 4.0,
          marks: 10.0,
          simulationType: 'titration',
          solutionA: '0.100 M Sodium Hydroxide (Solution B)',
          solutionB: 'Dilute Hydrochloric Acid (Solution C)',
          indicator: 'Phenolphthalein',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.2)',
          endpointColor: 'rgba(236,72,153,0.5)',
          instructions: 'Pipette 25.0 cm³ of Acid Solution C into a conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with 0.100 M NaOH Solution B until the colourless solution turns to permanent faint pink. Complete Table 2.',
          procedureSteps: [
            'Fill burette with 0.100 M NaOH Solution B to 0.00 cm³.',
            'Pipette 25.0 cm³ of Acid Solution C into a clean conical flask.',
            'Add 2–3 drops of phenolphthalein indicator.',
            'Titrate with Solution B until first permanent pink colour appears.',
            'Record initial and final readings and complete Table 2.'
          ],
          questions: [
            {
              id: 'step_2a',
              letter: 'd',
              field: 'avgTitre',
              label: 'Calculate the average volume of 0.100 M NaOH Solution B used, V₁',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 25.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: (ctx) => ctx.trueTitre,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(d) Average Titre V₁:</b> <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_2b',
              letter: 'e',
              field: 'molesNaohUsed',
              label: 'Calculate the moles of NaOH present in average volume V₁ of Solution B',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.00250',
              step: '0.00001',
              unit: 'moles of NaOH',
              calcTheoretical: (ctx) => (0.100 * ctx.trueTitre) / 1000.0,
              calcEcf: (ctx) => {
                const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_2a')) || ctx.trueTitre;
                return (0.100 * v1) / 1000.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
              feedbackFail: (ctx, expTheo) => `Formula: (0.100 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
              working: (ctx) => `<b>(e) Moles of NaOH in V₁:</b> (0.100 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.100 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
            },
            {
              id: 'step_2c',
              letter: 'f',
              field: 'molarityAcidC',
              label: 'Calculate the molar concentration (molarity) of Acid Solution C (Mole ratio NaOH : Acid = 1 : 1)',
              marks: 3.0,
              marksLabel: '(3.0 Marks)',
              placeholder: 'e.g. 0.100',
              step: '0.001',
              unit: 'mol/dm³',
              calcTheoretical: () => 0.100,
              calcEcf: (ctx) => {
                const mB = parseFloat(getAnswerValue(ctx.answers, 'molesNaohUsed', 'step_2b')) || 0.00250;
                return (mB * 1000.0) / 25.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Concentration of Acid C = ${val} mol/dm³.`,
              feedbackFail: () => `Formula: (Moles of Acid in 25 cm³ × 1000) / 25.0 = 0.100 mol/dm³.`,
              working: () => `<b>(f) Molarity of Acid C:</b> (0.00250 × 1000) / 25.0 = <b>0.100 mol/dm³</b>`
            }
          ]
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (10.0 Marks)',
      marks: 10.0,
      sampleName: 'Solid E',
      sampleDesc: 'A pale light-green crystalline inorganic double salt.',
      trueSaltKey: 'ferrousAmmoniumSulfate',
      trueSaltName: 'Hydrated Ammonium Iron(II) Sulfate (Mohr\'s Salt) — (NH₄)₂Fe(SO₄)₂·6H₂O',
      trueCation: 'Fe2+',
      trueAnion: 'SO4^2-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid E strongly in a dry test tube; test vapours with moist litmus papers.',
          correctObs: 'Colourless liquid droplets condense on upper walls; pungent gas evolves turning moist red litmus blue; solid residue turns reddish-brown',
          correctInf: 'Hydrated salt; basic gas (NH₃) evolved confirming NH₄⁺ present; iron oxide residue'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) Dissolve remaining Solid E in 10 cm³ distilled water. To portion 1, add 2M sodium hydroxide (NaOH) dropwise until in excess.',
          correctObs: 'Dirty-green precipitate formed, insoluble in excess sodium hydroxide; turns brown on standing at surface',
          correctInf: 'Fe²⁺ confirmed present (Fe(OH)₂ oxidized to Fe(OH)₃ by atmospheric oxygen)'
        },
        {
          id: 'q2_ammonia',
          prompt: '(iii) To portion 2, add aqueous ammonia (NH₃(aq)) dropwise until in excess.',
          correctObs: 'Dirty-green precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Fe²⁺ confirmed present'
        },
        {
          id: 'q2_barium',
          prompt: '(iv) To portion 3, add 3 drops barium nitrate (Ba(NO₃)₂) solution followed by 2 cm³ 2M dilute nitric acid (HNO₃).',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic_single',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      sampleName: 'Solid G',
      sampleDesc: 'A white organic crystalline solid.',
      trueCompoundKey: 'maleicAcid',
      trueCompoundName: 'Unsaturated Dicarboxylic Acid (Maleic Acid / HOOC-CH=CH-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Place a small amount of Solid G on a clean metallic spatula and ignite using a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, highly smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio present (>C=C<)'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid G in 5 cm³ distilled water. Test with moist blue and red litmus papers.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper retains colour (acidic, pH ~ 2–3)',
          correctInf: 'Acidic organic substance / contains ionizable H⁺ ions / carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of solution, add 2–3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ solution is rapidly decolorized to colourless',
          correctInf: 'Carbon-carbon double bond (>C=C<) confirmed present'
        },
        {
          id: 'q3_bromine',
          prompt: '(v) To 2 cm³ of solution, add 3–4 drops of bromine water and shake gently.',
          correctObs: 'Reddish-brown colour of bromine water is rapidly decolorized to colourless',
          correctInf: 'Alkene (>C=C<) confirmed present by addition reaction'
        }
      ]
    }
  },

  // ── Series 2005: Official KCSE 2005 Standard Chemistry Practical (Paper 233/3) ──
  series_2005: {
    id: 'series_2005',
    seriesKey: 'series_2005',
    seriesNumber: 2005,
    title: 'KCSE 2005 Standard Chemistry Practical Examination',
    badgeText: 'KCSE 2005 Past National Paper · Citric Acid Neutralization Enthalpy & Alum Analysis',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      calcType: 'standard_molarity',
      title: 'Question 1: Volumetric Analysis — Standardization & Neutralization Enthalpy of Acid L (20.0 Marks)',
      marks: 20.0,
      hasMultipleProcedures: true,
      solutionA: '0.3125 M Sodium Hydroxide (Solution K)',
      solutionB: 'Acid L containing 60.0 g/dm³ (Solution L)',
      acidFormula: 'C6H8O7',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.3125,
      trueBaseMolarity: 0.3125,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 192.0,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(255,255,255,0.2)',
      flaskIndicatorColor: 'rgba(255,255,255,0.2)',
      endpointColor: 'rgba(236,72,153,0.5)',
      overtitratedColor: 'rgba(219,39,119,0.9)',
      equation: 'C₆H₈O₇(aq) + NaOH(aq) → C₆H₇O₇Na(aq) + H₂O(l)',
      instructions: 'Procedure I: Fill the burette with 0.3125 M Sodium Hydroxide Solution K. Pipette 25.0 cm³ of Acid Solution L (containing 60.0 g/dm³ Acid L) into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution K until the colourless solution turns to the first permanent faint pink colour. Complete Table 1.',
      procedureSteps: [
        'Fill the burette with 0.3125 M Sodium Hydroxide Solution K and adjust the meniscus precisely to 0.00 cm³.',
        'Pipette exactly 25.0 cm³ of Acid Solution L into a clean 250 cm³ conical flask.',
        'Add 2–3 drops of phenolphthalein indicator (solution remains colourless).',
        'Titrate Solution L with Solution K until the first permanent faint pink colour appears.',
        'Record readings and repeat to complete Table 1 with concordant titres within ±0.10 cm³.'
      ],
      procedures: [
        {
          procedureIndex: 1,
          title: 'Procedure I: Titration of Acid L with NaOH Solution K',
          tableTitle: 'Table 1: Titration of Acid Solution L with Solution K',
          tableMarks: 4.0,
          marks: 12.0,
          simulationType: 'titration',
          solutionA: '0.3125 M Sodium Hydroxide (Solution K)',
          solutionB: 'Acid L containing 60.0 g/dm³ (Solution L)',
          indicator: 'Phenolphthalein',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.2)',
          endpointColor: 'rgba(236,72,153,0.5)',
          instructions: 'Fill the burette with 0.3125 M Sodium Hydroxide Solution K. Pipette 25.0 cm³ of Acid Solution L (containing 60.0 g/dm³ Acid L) into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution K until the colourless solution turns to the first permanent faint pink colour. Complete Table 1.',
          procedureSteps: [
            'Fill the burette with 0.3125 M Sodium Hydroxide Solution K and adjust the meniscus precisely to 0.00 cm³.',
            'Pipette exactly 25.0 cm³ of Acid Solution L into a clean 250 cm³ conical flask.',
            'Add 2–3 drops of phenolphthalein indicator.',
            'Titrate with Solution K until the first permanent faint pink colour persists.',
            'Record initial and final readings to complete Table 1 with concordant titres within ±0.10 cm³.'
          ],
          questions: [
            {
              id: 'step_1a',
              letter: 'a',
              field: 'avgTitre',
              label: 'Calculate the average volume of 0.3125 M NaOH Solution K used, V₁',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 25.00',
              step: '0.01',
              unit: 'cm³',
              calcTheoretical: (ctx) => ctx.trueTitre,
              calcEcf: (ctx) => ctx.expAvgFromTrials,
              check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
              feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
              feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
              working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
            },
            {
              id: 'step_1b',
              letter: 'b',
              field: 'molesNaohK',
              label: 'Calculate the number of moles of NaOH present in the average volume V₁ of Solution K (0.3125 M)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.00781',
              step: '0.00001',
              unit: 'moles of NaOH',
              calcTheoretical: (ctx) => (0.3125 * ctx.trueTitre) / 1000.0,
              calcEcf: (ctx) => {
                const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a', 'step_a')) || ctx.trueTitre;
                return (0.3125 * v1) / 1000.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
              feedbackFail: (ctx, expTheo) => `Formula: (0.3125 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
              working: (ctx) => `<b>(b) Moles of NaOH in V₁:</b> (0.3125 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.3125 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
            },
            {
              id: 'step_1c',
              letter: 'c',
              field: 'molesAcidL',
              label: 'Calculate the number of moles of Acid L in 25.0 cm³ of Solution L (Mole ratio Acid L : NaOH = 1 : 1)',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 0.00781',
              step: '0.00001',
              unit: 'moles of Acid L',
              calcTheoretical: (ctx) => (0.3125 * ctx.trueTitre) / 1000.0,
              calcEcf: (ctx) => {
                const mK = parseFloat(getAnswerValue(ctx.answers, 'molesNaohK', 'step_1b', 'step_b')) || ((0.3125 * ctx.trueTitre) / 1000.0);
                return mK;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: ${val} moles of Acid L in 25.0 cm³.`,
              feedbackFail: (ctx, expTheo) => `Formula: Moles of NaOH = ${expTheo.toFixed(5)} mol.`,
              working: (ctx) => `<b>(c) Moles of Acid L:</b> <b>${((0.3125 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
            },
            {
              id: 'step_1d',
              letter: 'd',
              field: 'molarityAcidL',
              label: 'Calculate the molar concentration (molarity) of Acid L in mol/dm³',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 0.3125',
              step: '0.0001',
              unit: 'mol/dm³ (M)',
              calcTheoretical: () => 0.3125,
              calcEcf: (ctx) => {
                const mL = parseFloat(getAnswerValue(ctx.answers, 'molesAcidL', 'step_1c', 'step_c')) || 0.00781;
                return (mL * 1000.0) / 25.0;
              },
              check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
              feedbackSuccess: (val) => `✓ Correct: Molarity of Acid L = ${val} mol/dm³.`,
              feedbackFail: () => `Formula: (Moles of Acid L × 1000) / 25.0 = 0.3125 mol/dm³.`,
              working: (ctx) => `<b>(d) Molarity of Acid L:</b> (${((0.3125 * ctx.v1) / 1000.0).toFixed(5)} × 1000) / 25.0 = <b>0.3125 mol/dm³</b>`
            },
            {
              id: 'step_1e',
              letter: 'e',
              field: 'rfmAcidL',
              label: 'Given that Solution L contains 60.0 g of Acid L per dm³, calculate the relative formula mass (RFM) of Acid L',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 192.0',
              step: '0.1',
              unit: 'g/mol',
              calcTheoretical: () => 192.0,
              calcEcf: (ctx) => {
                const mol = parseFloat(getAnswerValue(ctx.answers, 'molarityAcidL', 'step_1d', 'step_d')) || 0.3125;
                return mol > 0 ? parseFloat((60.0 / mol).toFixed(1)) : 192.0;
              },
              check: (val) => Math.abs(val - 192.0) <= 8.0,
              feedbackSuccess: (val) => `✓ Correct: RFM of Acid L = ${val} g/mol (Citric Acid Monohydrate C₆H₈O₇).`,
              feedbackFail: () => `Formula: Mass concentration (60.0 g/dm³) / Molarity (0.3125) = 192.0 g/mol.`,
              working: () => `<b>(e) RFM of Acid L:</b> 60.0 / 0.3125 = <b>192.0 g/mol</b>`
            }
          ]
        },
        {
          procedureIndex: 2,
          title: 'Procedure II: Thermometric Neutralization Enthalpy (ΔT)',
          tableTitle: 'Table 2: Temperature Changes on Neutralization',
          tableMarks: 3.0,
          marks: 8.0,
          simulationType: 'energy',
          scenarioKey: 'KCSE_2005_NEUTRALIZATION',
          solutionA: '0.3125 M Sodium Hydroxide Solution K',
          solutionB: 'Acid Solution L',
          indicator: 'Calorimeter / Thermometer',
          pipetteVolume: 25.0,
          trueTitre: 25.00,
          titrantColor: '#38BDF8',
          flaskBaseColor: 'rgba(255,255,255,0.2)',
          endpointColor: 'rgba(236,72,153,0.5)',
          instructions: 'Measure 25.0 cm³ of Acid Solution L into a clean 100 cm³ plastic beaker and record its steady initial temperature T₁. Measure 25.0 cm³ of 0.3125 M NaOH Solution K into a separate beaker and record its initial temperature T₂. Calculate mean initial temperature T₀ = (T₁ + T₂) / 2. Pour Solution K into Solution L in the plastic beaker, stir immediately with the thermometer, and record the highest temperature reached (T_max). Complete Table 2.',
          procedureSteps: [
            'Measure exactly 25.0 cm³ of Acid Solution L using a measuring cylinder and transfer into a clean 100 cm³ plastic beaker.',
            'Record the steady initial temperature of Solution L as T₁ in Table 2.',
            'Rinse the measuring cylinder and measure 25.0 cm³ of 0.3125 M NaOH Solution K into a separate beaker; record its initial temperature as T₂ in Table 2.',
            'Calculate the mean initial temperature T₀ = (T₁ + T₂) / 2.',
            'Carefully pour Solution K into Solution L in the plastic beaker, stir immediately with the thermometer, and record the highest temperature reached (T_max = 28.5 °C; ΔT = 5.0 °C) in Table 2.'
          ],
          questions: [
            {
              id: 'step_2a',
              letter: 'a',
              field: 'tempRise',
              label: 'Calculate the temperature rise ΔT = T_max - T₀ in °C',
              marks: 1.0,
              marksLabel: '(1.0 Mark)',
              placeholder: 'e.g. 5.0',
              step: '0.1',
              unit: '°C',
              calcTheoretical: () => 5.0,
              calcEcf: () => 5.0,
              check: (val) => Math.abs(val - 5.0) <= 0.5,
              feedbackSuccess: (val) => `✓ Correct: Temperature rise ΔT = ${val.toFixed(1)} °C.`,
              feedbackFail: () => `Expected ΔT = Highest temperature (28.5 °C) - Mean initial (23.5 °C) = 5.0 °C.`,
              working: () => `<b>(a) Temperature Rise:</b> ΔT = 28.5 - 23.5 = <b>5.0 °C</b>`
            },
            {
              id: 'step_2b',
              letter: 'b',
              field: 'heatNeutralization',
              label: 'In the thermometric neutralization step, mixing 25.0 cm³ of Solution K with 25.0 cm³ of Solution L produced a temperature rise of ΔT = 5.0 °C. Calculate the heat change ΔH (Mass = 50.0 g, c = 4.2 J/g/°C)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. 1050',
              step: '1',
              unit: 'Joules (J)',
              calcTheoretical: () => 1050.0,
              calcEcf: (ctx) => {
                const dt = parseFloat(getAnswerValue(ctx.answers, 'tempRise', 'step_2a')) || 5.0;
                return 50.0 * 4.2 * dt;
              },
              check: (val) => Math.abs(val - 1050.0) <= 50.0,
              feedbackSuccess: (val) => `✓ Correct: Heat change ΔH = ${val} J (1.05 kJ).`,
              feedbackFail: () => `Formula: 50.0 × 4.2 × 5.0 = 1050 Joules.`,
              working: () => `<b>(b) Heat change ΔH:</b> 50.0 × 4.2 × 5.0 = <b>1050 J (1.05 kJ)</b>`
            },
            {
              id: 'step_2c',
              letter: 'c',
              field: 'molarHeatNeut',
              label: 'Calculate the molar heat of neutralization of Acid L in kJ/mol (Heat change in kJ / moles of Acid L neutralized in 25.0 cm³)',
              marks: 2.0,
              marksLabel: '(2.0 Marks)',
              placeholder: 'e.g. -134.4',
              step: '0.1',
              unit: 'kJ/mol',
              calcTheoretical: () => -134.4,
              calcEcf: (ctx) => {
                const qJ = parseFloat(getAnswerValue(ctx.answers, 'heatNeutralization', 'step_2b', 'step_f')) || 1050.0;
                const mol = parseFloat(getAnswerValue(ctx.answers, 'molesAcidL', 'step_1c', 'step_c')) || 0.0078125;
                return mol > 0 ? parseFloat((-(qJ / 1000.0) / mol).toFixed(1)) : -134.4;
              },
              check: (val) => Math.abs(Math.abs(val) - 134.4) <= 10.0,
              feedbackSuccess: (val) => `✓ Correct: Molar heat of neutralization = ${val} kJ/mol.`,
              feedbackFail: () => `Formula: -(1.05 kJ / 0.0078125 mol) = -134.4 kJ/mol.`,
              working: () => `<b>(c) Molar Enthalpy of Neutralization:</b> -(1.05 / 0.0078125) = <b>-134.4 kJ/mol</b>`
            }
          ]
        }
      ],
      questions: [
        {
          id: 'step_1a',
          letter: 'a',
          field: 'avgTitre',
          label: 'Calculate the average volume of 0.3125 M NaOH Solution K used, V₁',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 25.00',
          step: '0.01',
          unit: 'cm³',
          calcTheoretical: (ctx) => ctx.trueTitre,
          calcEcf: (ctx) => ctx.expAvgFromTrials,
          check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.20,
          feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
          feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
          working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
        },
        {
          id: 'step_1b',
          letter: 'b',
          field: 'molesNaohK',
          label: 'Calculate the number of moles of NaOH present in the average volume V₁ of Solution K (0.3125 M)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.00781',
          step: '0.00001',
          unit: 'moles of NaOH',
          calcTheoretical: (ctx) => (0.3125 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const v1 = parseFloat(getAnswerValue(ctx.answers, 'avgTitre', 'step_1a', 'step_a')) || ctx.trueTitre;
            return (0.3125 * v1) / 1000.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of NaOH.`,
          feedbackFail: (ctx, expTheo) => `Formula: (0.3125 × V₁) / 1000 = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(b) Moles of NaOH in V₁:</b> (0.3125 × ${ctx.v1.toFixed(2)}) / 1000 = <b>${((0.3125 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_1c',
          letter: 'c',
          field: 'molesAcidL',
          label: 'Calculate the number of moles of Acid L in 25.0 cm³ of Solution L (Mole ratio Acid L : NaOH = 1 : 1)',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 0.00781',
          step: '0.00001',
          unit: 'moles of Acid L',
          calcTheoretical: (ctx) => (0.3125 * ctx.trueTitre) / 1000.0,
          calcEcf: (ctx) => {
            const mK = parseFloat(getAnswerValue(ctx.answers, 'molesNaohK', 'step_1b', 'step_b')) || ((0.3125 * ctx.trueTitre) / 1000.0);
            return mK;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: ${val} moles of Acid L in 25.0 cm³.`,
          feedbackFail: (ctx, expTheo) => `Formula: Moles of NaOH = ${expTheo.toFixed(5)} mol.`,
          working: (ctx) => `<b>(c) Moles of Acid L:</b> <b>${((0.3125 * ctx.v1) / 1000.0).toFixed(5)} mol</b>`
        },
        {
          id: 'step_1d',
          letter: 'd',
          field: 'molarityAcidL',
          label: 'Calculate the molar concentration (molarity) of Acid L in mol/dm³',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 0.3125',
          step: '0.0001',
          unit: 'mol/dm³ (M)',
          calcTheoretical: () => 0.3125,
          calcEcf: (ctx) => {
            const mL = parseFloat(getAnswerValue(ctx.answers, 'molesAcidL', 'step_1c', 'step_c')) || 0.00781;
            return (mL * 1000.0) / 25.0;
          },
          check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
          feedbackSuccess: (val) => `✓ Correct: Molarity of Acid L = ${val} mol/dm³.`,
          feedbackFail: () => `Formula: (Moles of Acid L × 1000) / 25.0 = 0.3125 mol/dm³.`,
          working: (ctx) => `<b>(d) Molarity of Acid L:</b> (${((0.3125 * ctx.v1) / 1000.0).toFixed(5)} × 1000) / 25.0 = <b>0.3125 mol/dm³</b>`
        },
        {
          id: 'step_1e',
          letter: 'e',
          field: 'rfmAcidL',
          label: 'Given that Solution L contains 60.0 g of Acid L per dm³, calculate the relative formula mass (RFM) of Acid L',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 192.0',
          step: '0.1',
          unit: 'g/mol',
          calcTheoretical: () => 192.0,
          calcEcf: (ctx) => {
            const mol = parseFloat(getAnswerValue(ctx.answers, 'molarityAcidL', 'step_1d', 'step_d')) || 0.3125;
            return mol > 0 ? parseFloat((60.0 / mol).toFixed(1)) : 192.0;
          },
          check: (val) => Math.abs(val - 192.0) <= 8.0,
          feedbackSuccess: (val) => `✓ Correct: RFM of Acid L = ${val} g/mol (Citric Acid Monohydrate C₆H₈O₇).`,
          feedbackFail: () => `Formula: Mass concentration (60.0 g/dm³) / Molarity (0.3125) = 192.0 g/mol.`,
          working: () => `<b>(e) RFM of Acid L:</b> 60.0 / 0.3125 = <b>192.0 g/mol</b>`
        },
        {
          id: 'step_2a',
          letter: 'f',
          field: 'tempRise',
          label: 'Calculate the temperature rise ΔT = T_max - T₀ in °C',
          marks: 1.0,
          marksLabel: '(1.0 Mark)',
          placeholder: 'e.g. 5.0',
          step: '0.1',
          unit: '°C',
          calcTheoretical: () => 5.0,
          calcEcf: () => 5.0,
          check: (val) => Math.abs(val - 5.0) <= 0.5,
          feedbackSuccess: (val) => `✓ Correct: Temperature rise ΔT = ${val.toFixed(1)} °C.`,
          feedbackFail: () => `Expected ΔT = Highest temperature (28.5 °C) - Mean initial (23.5 °C) = 5.0 °C.`,
          working: () => `<b>(f) Temperature Rise:</b> ΔT = 28.5 - 23.5 = <b>5.0 °C</b>`
        },
        {
          id: 'step_2b',
          letter: 'g',
          field: 'heatNeutralization',
          label: 'In the thermometric neutralization step, mixing 25.0 cm³ of Solution K with 25.0 cm³ of Solution L produced a temperature rise of ΔT = 5.0 °C. Calculate the heat change ΔH (Mass = 50.0 g, c = 4.2 J/g/°C)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. 1050',
          step: '1',
          unit: 'Joules (J)',
          calcTheoretical: () => 1050.0,
          calcEcf: (ctx) => {
            const dt = parseFloat(getAnswerValue(ctx.answers, 'tempRise', 'step_2a')) || 5.0;
            return 50.0 * 4.2 * dt;
          },
          check: (val) => Math.abs(val - 1050.0) <= 50.0,
          feedbackSuccess: (val) => `✓ Correct: Heat change ΔH = ${val} J (1.05 kJ).`,
          feedbackFail: () => `Formula: 50.0 × 4.2 × 5.0 = 1050 Joules.`,
          working: () => `<b>(g) Heat change ΔH:</b> 50.0 × 4.2 × 5.0 = <b>1050 J (1.05 kJ)</b>`
        },
        {
          id: 'step_2c',
          letter: 'h',
          field: 'molarHeatNeut',
          label: 'Calculate the molar heat of neutralization of Acid L in kJ/mol (Heat change in kJ / moles of Acid L neutralized in 25.0 cm³)',
          marks: 2.0,
          marksLabel: '(2.0 Marks)',
          placeholder: 'e.g. -134.4',
          step: '0.1',
          unit: 'kJ/mol',
          calcTheoretical: () => -134.4,
          calcEcf: (ctx) => {
            const qJ = parseFloat(getAnswerValue(ctx.answers, 'heatNeutralization', 'step_2b', 'step_f')) || 1050.0;
            const mol = parseFloat(getAnswerValue(ctx.answers, 'molesAcidL', 'step_1c', 'step_c')) || 0.0078125;
            return mol > 0 ? parseFloat((-(qJ / 1000.0) / mol).toFixed(1)) : -134.4;
          },
          check: (val) => Math.abs(Math.abs(val) - 134.4) <= 10.0,
          feedbackSuccess: (val) => `✓ Correct: Molar heat of neutralization = ${val} kJ/mol.`,
          feedbackFail: () => `Formula: -(1.05 kJ / 0.0078125 mol) = -134.4 kJ/mol.`,
          working: () => `<b>(h) Molar Enthalpy of Neutralization:</b> -(1.05 / 0.0078125) = <b>-134.4 kJ/mol</b>`
        }
      ]
    },
    q2: {
      type: 'qualitative_single',
      title: 'Question 2: Inorganic Salt Qualitative Analysis (10.0 Marks)',
      marks: 10.0,
      sampleName: 'Solid N',
      sampleDesc: 'A white crystalline inorganic double salt containing aluminum, ammonium, and sulfate.',
      trueSaltKey: 'ammoniumSulfate',
      trueSaltName: 'Ammonium Aluminum Sulfate Hydrate (Ammonium Alum) — NH₄Al(SO₄)₂·12H₂O',
      trueCation: 'NH4+',
      trueAnion: 'SO4^2-',
      hasDeduction: true,
      tests: [
        {
          id: 'q2_heat',
          prompt: '(i) Heat a half-spatula of Solid N gently in a clean dry test tube, then strongly; test vapours with moist red and blue litmus papers.',
          correctObs: 'Cracking sound; colourless liquid droplets condense on upper walls; pungent gas evolves turning moist red litmus blue; white sublimation ring deposits on upper walls',
          correctInf: 'Hydrated salt / water of crystallization present; basic gas (NH₃) evolved confirming NH₄⁺ present'
        },
        {
          id: 'q2_naoh_warm',
          prompt: '(ii) Dissolve remaining Solid N in 10 cm³ distilled water. To portion 1, add 2M sodium hydroxide (NaOH) dropwise until in excess, then warm gently and test vapours with moist red litmus paper.',
          correctObs: 'White precipitate formed, dissolves in excess NaOH to form a clear colourless solution; on warming, a pungent gas is evolved that turns moist red litmus blue',
          correctInf: 'Al³⁺, Pb²⁺, or Zn²⁺ present ([Al(OH)₄]⁻ formed); NH₄⁺ confirmed present'
        },
        {
          id: 'q2_ammonia',
          prompt: '(iii) To portion 2, add aqueous ammonia (NH₃(aq)) dropwise until in excess.',
          correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia',
          correctInf: 'Al³⁺ or Pb²⁺ confirmed present (Zn²⁺ is excluded as it dissolves in excess NH₃)'
        },
        {
          id: 'q2_ki',
          prompt: '(iv) To portion 3, add 3 drops potassium iodide (KI) solution.',
          correctObs: 'No yellow precipitate formed; clear colourless solution persists',
          correctInf: 'Pb²⁺ absent; Al³⁺ confirmed present'
        },
        {
          id: 'q2_barium',
          prompt: '(v) To portion 4, add 3 drops barium nitrate (Ba(NO₃)₂) solution followed by 2 cm³ 2M dilute nitric acid (HNO₃).',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO4²⁻ confirmed present (BaSO₄ formed)'
        }
      ]
    },
    q3: {
      type: 'organic',
      title: 'Question 3: Organic Functional Group Analysis (10.0 Marks)',
      marks: 10.0,
      sampleName: 'Solid Q',
      sampleDesc: 'A pure white organic crystalline solid.',
      trueOrganicKey: 'org_benzoic_acid',
      trueOrganicName: 'Benzoic Acid — C₆H₅COOH',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      tests: [
        {
          id: 'q3_ignition',
          prompt: '(i) Ignite a small portion of Solid Q on a clean metallic spatula in a Bunsen flame.',
          correctObs: 'Melts and burns with a luminous, highly smoky and sooty yellow flame; leaves black carbon residue',
          correctInf: 'Aromatic compound / high carbon-to-hydrogen ratio present'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) Dissolve Solid Q in 5 cm³ distilled water. Test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper retains colour (acidic, pH ~ 2–3)',
          correctInf: 'Acidic organic substance / contains ionizable H⁺ ions / carboxylic acid (—COOH)'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iii) To 2 cm³ of solution, add a half-spatula of solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Brisk effervescence of a colourless gas that forms white precipitate with limewater (CO₂)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iv) To 2 cm³ of solution, add 2–3 drops of acidified Potassium Manganate(VII) (KMnO₄) solution.',
          correctObs: 'Purple colour of acidified KMnO₄ solution persists / not decolorized',
          correctInf: 'Aliphatic alkene / alkyne (>C=C<) absent; stable benzene ring'
        },
        {
          id: 'q3_ester',
          prompt: '(v) To 2 cm³ of solution, add 3 cm³ ethanol and 2 drops concentrated sulfuric acid; warm gently and pour into cold water.',
          correctObs: 'Pleasant, sweet fruity fragrance produced (ethyl benzoate ester)',
          correctInf: 'Carboxylic acid (—COOH) confirmed present'
        }
      ]
    }
  }
};

// Aliases for backwards compatibility
COMPOSITE_EXAM_PRESETS.standard_1 = COMPOSITE_EXAM_PRESETS.series_1;
COMPOSITE_EXAM_PRESETS.standard_2 = COMPOSITE_EXAM_PRESETS.series_2;

// Automatically ensure all multi-procedure presets expose a unified questions array on q1
Object.keys(COMPOSITE_EXAM_PRESETS).forEach(key => {
  const p = COMPOSITE_EXAM_PRESETS[key];
  if (p && p.q1 && p.q1.hasMultipleProcedures && Array.isArray(p.q1.procedures)) {
    if (!p.q1.questions || p.q1.questions.length === 0) {
      p.q1.questions = p.q1.procedures.flatMap(proc => proc.questions || []);
    }
  }
});

/**
 * Generate a dynamic randomized KCSE Paper 3 practical exam
 */
function generateRandomCompositePreset() {
  const seriesKeys = [
    'series_1', 'series_2', 'series_3', 'series_4', 'series_5', 'series_6',
    'series_2025', 'series_2024', 'series_2023', 'series_2022',
    'series_2021', 'series_2020', 'series_2019', 'series_2018',
    'series_2017', 'series_2016', 'series_2015', 'series_2014',
    'series_2013', 'series_2012', 'series_2011', 'series_2009', 'series_2008',
    'series_2007', 'series_2006', 'series_2005', 'series_2004', 'series_2003', 'series_2002', 'series_2000',
    'series_1998', 'series_1996', 'series_1995', 'series_1994', 'series_1993', 'series_1992', 'series_1990', 'series_1989'
  ];
  const q1PickKey = seriesKeys[Math.floor(Math.random() * seriesKeys.length)];
  const q2PickKey = seriesKeys[Math.floor(Math.random() * seriesKeys.length)];
  const q3PickKey = seriesKeys[Math.floor(Math.random() * seriesKeys.length)];

  const q1Base = COMPOSITE_EXAM_PRESETS[q1PickKey].q1;
  const q2Base = COMPOSITE_EXAM_PRESETS[q2PickKey].q2;
  const q3Base = COMPOSITE_EXAM_PRESETS[q3PickKey].q3;

  // Slight jitter for realistic non-static titre
  const jitter = (Math.floor(Math.random() * 5) - 2) * 0.20; // -0.40 to +0.40
  const adjustedTitre = parseFloat((q1Base.trueTitre + jitter).toFixed(2));

  return {
    id: 'random_mock',
    seriesKey: 'random_mock',
    seriesNumber: 0,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — National Adaptive Series',
    badgeText: 'Adaptive National Mock · Dynamic Selection',
    durationMinutes: 135,
    q1: JSON.parse(JSON.stringify(Object.assign({}, q1Base, { trueTitre: adjustedTitre }))),
    q2: JSON.parse(JSON.stringify(q2Base)),
    q3: JSON.parse(JSON.stringify(q3Base))
  };
}

// ── Qualitative Analysis Presets Registries ─────────────────────────
function getSaltPresetDefinition(saltKey) {
  if (!saltKey) return null;
  const key = String(saltKey).toUpperCase();
  if (key.includes('ZN')) {
    return {
      trueSaltKey: 'ZnSO4',
      trueSaltName: 'Zinc Sulfate — ZnSO₄',
      trueCation: 'Zn2+',
      trueAnion: 'SO42-',
      sampleDesc: 'A pure white inorganic crystalline solid containing one cation and one anion.',
      tests: [
        { id: 'q2_heat', prompt: '(i) Heat a portion of Solid Y in a dry test tube.', correctObs: 'Yellow when hot, white on cooling; colorless vapor condenses', correctInf: 'Zinc compound; hydrated salt' },
        { id: 'q2_appearance', prompt: '(ii) Describe appearance and dissolve in 10 cm³ water.', correctObs: 'White crystalline solid dissolves to form a clear colorless solution', correctInf: 'Soluble salt; transition metal ions absent' },
        { id: 'q2_naoh', prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.', correctObs: 'White precipitate formed, dissolves in excess to give a colorless solution', correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present' },
        { id: 'q2_nh3', prompt: '(iv) To portion 2, add 2M aqueous NH₃ dropwise until in excess.', correctObs: 'White precipitate formed, dissolves in excess to give a clear colorless solution', correctInf: 'Zn²⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(v) To portion 3, add Ba(NO₃)₂ followed by dilute HNO₃.', correctObs: 'White precipitate formed, insoluble in dilute nitric acid', correctInf: 'SO₄²⁻ confirmed present' }
      ]
    };
  }
  if (key.includes('PB')) {
    return {
      trueSaltKey: 'Pb(NO3)2',
      trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂',
      trueCation: 'Pb2+',
      trueAnion: 'NO3-',
      sampleDesc: 'A pure white inorganic crystalline salt containing one cation and one anion.',
      tests: [
        { id: 'q2_heat', prompt: '(i) Heat a small portion of Solid Y in a dry test tube.', correctObs: 'Brown gas evolved, turns blue litmus red; residue brown hot, yellow cold', correctInf: 'NO₃⁻ present; Pb²⁺ present' },
        { id: 'q2_appearance', prompt: '(ii) Dissolve Solid Y in 10 cm³ of distilled water.', correctObs: 'White crystalline solid dissolves to form a clear colorless solution', correctInf: 'Soluble salt' },
        { id: 'q2_naoh', prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.', correctObs: 'White precipitate formed, soluble in excess to form a colorless solution', correctInf: 'Pb²⁺, Zn²⁺, or Al³⁺ present' },
        { id: 'q2_nh3', prompt: '(iv) To portion 2, add 2M aqueous NH₃ dropwise until in excess.', correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia', correctInf: 'Pb²⁺ or Al³⁺ present' },
        { id: 'q2_anion', prompt: '(v) To portion 3, add 3 drops of Potassium Iodide (KI) solution.', correctObs: 'Bright yellow precipitate formed on addition of potassium iodide', correctInf: 'Pb²⁺ confirmed present' }
      ]
    };
  }
  if (key.includes('CU')) {
    return {
      trueSaltKey: 'CuSO4',
      trueSaltName: 'Copper(II) Sulfate — CuSO₄',
      trueCation: 'Cu2+',
      trueAnion: 'SO42-',
      sampleDesc: 'A bright blue crystalline solid containing one cation and one anion.',
      tests: [
        { id: 'q2_heat', prompt: '(i) Heat a spatula-end of Solid Y in a dry test tube.', correctObs: 'Blue crystals turn white; colorless liquid condenses on tube walls', correctInf: 'Hydrated Cu²⁺ salt' },
        { id: 'q2_appearance', prompt: '(ii) Dissolve Solid Y in 10 cm³ of distilled water.', correctObs: 'Blue crystalline solid dissolves completely to give a blue solution', correctInf: 'Soluble salt; Cu²⁺ present' },
        { id: 'q2_naoh', prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.', correctObs: 'Pale blue precipitate formed, insoluble in excess sodium hydroxide', correctInf: 'Cu²⁺ present' },
        { id: 'q2_nh3', prompt: '(iv) To portion 2, add 2M aqueous NH₃ dropwise until in excess.', correctObs: 'Pale blue precipitate formed, dissolves in excess to give a deep royal blue solution', correctInf: 'Cu²⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(v) To portion 3, add BaCl₂ followed by dilute HCl.', correctObs: 'White precipitate formed, insoluble in dilute hydrochloric acid', correctInf: 'SO₄²⁻ confirmed present' }
      ]
    };
  }
  if (key.includes('FE') && (key.includes('SO4') || key.includes('2'))) {
    return {
      trueSaltKey: 'FeSO4',
      trueSaltName: 'Iron(II) Sulfate — FeSO₄',
      trueCation: 'Fe2+',
      trueAnion: 'SO42-',
      sampleDesc: 'A pale green inorganic hydrated salt sample.',
      tests: [
        { id: 'q2_heat', prompt: '(i) Heat Solid Y gently in a dry test tube.', correctObs: 'Pale green crystals turn white then dirty brown; water droplets form', correctInf: 'Hydrated salt' },
        { id: 'q2_appearance', prompt: '(ii) Dissolve in 10 cm³ distilled water.', correctObs: 'Pale green crystalline solid dissolves to give a pale green solution', correctInf: 'Soluble salt; Fe²⁺ present' },
        { id: 'q2_naoh', prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.', correctObs: 'Dirty green precipitate formed, insoluble in excess; turns brown at surface on standing', correctInf: 'Fe²⁺ present' },
        { id: 'q2_nh3', prompt: '(iv) To portion 2, add 2M aqueous NH₃ dropwise until in excess.', correctObs: 'Dirty green precipitate formed, insoluble in excess aqueous ammonia', correctInf: 'Fe²⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(v) To portion 3, add BaCl₂ followed by dilute HCl.', correctObs: 'White precipitate formed, insoluble in dilute hydrochloric acid', correctInf: 'SO₄²⁻ confirmed present' }
      ]
    };
  }
  if (key.includes('CA') || key.includes('CALCIUM')) {
    return {
      trueSaltKey: 'Ca(NO3)2',
      trueSaltName: 'Calcium Nitrate — Ca(NO₃)₂',
      trueCation: 'Ca2+',
      trueAnion: 'NO3-',
      sampleDesc: 'A pure white inorganic crystalline salt containing one cation and one anion.',
      tests: [
        { id: 'q2_heat', prompt: '(i) Heat a half-spatula of Solid Y strongly in a dry hard-glass test tube and test any gases evolved with moist litmus and a glowing splint.', correctObs: 'Solid decrepitates and melts; brown fumes evolved that turn moist blue litmus red; gas rekindles a glowing wooden splint; white residue remains', correctInf: 'Thermal decomposition of nitrate salt; NO₂ and O₂ gases evolved; NO₃⁻ present' },
        { id: 'q2_appearance', prompt: '(ii) Dissolve the remainder of Solid Y in about 10 cm³ of distilled water in a boiling tube. Divide the resulting solution into 4 portions.', correctObs: 'White crystalline solid dissolves completely to form a clear, colorless solution', correctInf: 'Soluble salt; absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺ absent)' },
        { id: 'q2_naoh', prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.', correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide', correctInf: 'Ca²⁺ or Mg²⁺ present' },
        { id: 'q2_nh3', prompt: '(iv) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess.', correctObs: 'No precipitate formed with drops or with excess aqueous ammonia', correctInf: 'Ca²⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(v) To portion 3, add 3–4 drops of dilute sulfuric acid (H₂SO₄).', correctObs: 'White precipitate formed (sparingly soluble CaSO₄)', correctInf: 'Ca²⁺ confirmed present' },
        { id: 'q2_flame', prompt: '(vi) Dip a clean glass rod into portion 4 and place it in the non-luminous flame of a Bunsen burner.', correctObs: 'Brick-red / orange-red flame', correctInf: 'Ca²⁺ confirmed present' }
      ]
    };
  }
  if (key.includes('FE') && (key.includes('CL') || key.includes('3'))) {
    return {
      trueSaltKey: 'FeCl3',
      trueSaltName: 'Iron(III) Chloride — FeCl₃',
      trueCation: 'Fe3+',
      trueAnion: 'Cl-',
      sampleDesc: 'A brownish-yellow crystalline inorganic salt containing one cation and one anion.',
      tests: [
        { id: 'q2_heat', prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube gently, then strongly.', correctObs: 'Brown crystalline solid melts and condenses as dark brown fumes on upper cooler walls; acidic fumes evolve that turn moist blue litmus red', correctInf: 'Hydrated transition metal halide; FeCl₃ sublimes and decomposes' },
        { id: 'q2_appearance', prompt: '(ii) Dissolve the remainder of Solid Y in about 10 cm³ of distilled water in a boiling tube. Divide into 4 portions.', correctObs: 'Brown-yellow crystalline solid dissolves completely to form a yellow-brown solution', correctInf: 'Soluble transition metal salt; Fe³⁺ likely present' },
        { id: 'q2_naoh', prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess.', correctObs: 'Reddish-brown precipitate formed, insoluble in excess sodium hydroxide', correctInf: 'Fe³⁺ present (Fe(OH)₃ formed)' },
        { id: 'q2_nh3', prompt: '(iv) To portion 2, add 2M aqueous ammonia dropwise until in excess.', correctObs: 'Reddish-brown precipitate formed, insoluble in excess aqueous ammonia', correctInf: 'Fe³⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(v) To portion 3, add 3 drops of lead(II) nitrate solution and warm the mixture.', correctObs: 'White precipitate formed, which dissolves on warming to form a colourless solution (reappears on cooling)', correctInf: 'Cl⁻ confirmed present (PbCl₂ formed)' }
      ]
    };
  }
  if (key.includes('NH4') || key.includes('AMMONIUM')) {
    return {
      trueSaltKey: 'NH4Cl',
      trueSaltName: 'Ammonium Chloride — NH₄Cl',
      trueCation: 'NH4+',
      trueAnion: 'Cl-',
      sampleDesc: 'A white crystalline inorganic solid.',
      tests: [
        { id: 'q2_heat', prompt: '(i) Heat Solid Y in a dry test tube.', correctObs: 'Sublimes; dense white fumes deposit on upper cooler walls', correctInf: 'Sublimable salt; NH₄⁺ present' },
        { id: 'q2_naoh', prompt: '(ii) Add 2M NaOH and warm gently.', correctObs: 'Pungent gas evolved, turns moist red litmus blue', correctInf: 'NH₃ gas evolved; NH₄⁺ confirmed' },
        { id: 'q2_nh3', prompt: '(iii) Add 2M aqueous ammonia.', correctObs: 'No precipitate formed', correctInf: 'Heavy metal cations absent' },
        { id: 'q2_anion', prompt: '(iv) To 2 cm³ of solution, add 3 drops of lead(II) nitrate solution and warm the mixture.', correctObs: 'White precipitate formed, dissolves on warming to form a colourless solution (reappears on cooling)', correctInf: 'Cl⁻ confirmed present (PbCl₂ formed)' }
      ]
    };
  }
  return {
    trueSaltKey: 'ZnSO4',
    trueSaltName: 'Zinc Sulfate — ZnSO₄',
    trueCation: 'Zn2+',
    trueAnion: 'SO42-',
    sampleDesc: 'A pure white inorganic crystalline solid.',
    tests: [
      { id: 'q2_appearance', prompt: '(i) Dissolve Solid Y in distilled water.', correctObs: 'Clear colorless solution formed', correctInf: 'Soluble salt' },
      { id: 'q2_naoh', prompt: '(ii) Add 2M NaOH dropwise until in excess.', correctObs: 'White precipitate formed, soluble in excess', correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present' },
      { id: 'q2_nh3', prompt: '(iii) Add 2M aqueous NH₃ dropwise until in excess.', correctObs: 'White precipitate formed, soluble in excess', correctInf: 'Zn²⁺ confirmed present' },
      { id: 'q2_anion', prompt: '(iv) Add Ba(NO₃)₂ followed by dilute HNO₃.', correctObs: 'White precipitate formed, insoluble in acid', correctInf: 'SO₄²⁻ confirmed present' }
    ]
  };
}

function getOrganicPresetDefinition(organicKey) {
  if (!organicKey) return null;
  const key = String(organicKey).toLowerCase();
  if (key.includes('acid') || key.includes('ethanoic') || key.includes('cooh')) {
    return {
      trueOrganicKey: 'Ethanoic Acid',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      sampleDesc: 'A clear colorless liquid with a sharp, pungent vinegar odor.',
      tests: [
        { id: 'q3_ignition', prompt: '(i) Place 2 drops on a spatula and ignite in a Bunsen flame.', correctObs: 'Burns with a clean, non-sooty pale blue flame; vinegar smell', correctInf: 'Lower saturated carboxylic acid' },
        { id: 'q3_litmus', prompt: '(ii) Test with moist blue and red litmus paper.', correctObs: 'Blue litmus paper turns red; red litmus unchanged', correctInf: 'Acidic substance / H⁺ ions present' },
        { id: 'q3_kmno4', prompt: '(iii) Add 3 drops of acidified KMnO₄ and warm gently.', correctObs: 'Purple color remains unchanged (not decolorized)', correctInf: 'Alkenyl and primary/secondary alkanol absent' },
        { id: 'q3_nahco3', prompt: '(iv) Add a half spatula-end of solid NaHCO₃.', correctObs: 'Vigorous effervescence of a gas that turns lime water milky', correctInf: 'Carboxylic acid (—COOH) confirmed present' }
      ]
    };
  }
  if (key.includes('hex') || key.includes('alkene') || key.includes('cyclohexene') || key.includes('unsaturated')) {
    const isHexene = key.includes('hex');
    return {
      trueOrganicKey: isHexene ? 'Hex-1-ene' : 'Cyclohexene',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      sampleDesc: 'A clear, volatile organic liquid.',
      tests: [
        { id: 'q3_ignition', prompt: '(i) Place 2 drops on a spatula and ignite in a Bunsen flame.', correctObs: 'Burns with a luminous, highly smoky and sooty yellow flame; leaves carbon residue', correctInf: 'Unsaturated compound / high carbon:hydrogen ratio' },
        { id: 'q3_litmus', prompt: '(ii) Test with moist blue and red litmus paper.', correctObs: 'No color change on either litmus paper', correctInf: 'Neutral hydrocarbon' },
        { id: 'q3_kmno4', prompt: '(iii) Add 3 drops of Bromine water in the dark.', correctObs: 'Reddish-brown bromine water is rapidly decolorized', correctInf: 'Alkene (>C=C<) confirmed present by addition' },
        { id: 'q3_nahco3', prompt: '(iv) Add 3 drops of acidified KMnO₄ and shake thoroughly.', correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized', correctInf: 'Alkene / unsaturation (>C=C<) present' }
      ]
    };
  }
  if (key.includes('butan')) {
    return {
      trueOrganicKey: 'Butan-1-ol',
      trueFunctionalGroup: 'Alkanol (-OH)',
      sampleDesc: 'A clear, colorless liquid with a characteristic sweet, pleasant spirituous odor.',
      tests: [
        { id: 'q3_ignition', prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite using a Bunsen flame.', correctObs: 'Burns with a clean, non-sooty pale blue flame; no smoke', correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio' },
        { id: 'q3_litmus', prompt: '(ii) Add 2 cm³ of distilled water, shake, and test with moist red and blue litmus paper.', correctObs: 'Dissolves partially; no color change on either blue or red litmus paper', correctInf: 'Neutral organic substance; absence of carboxylic acid and amine' },
        { id: 'q3_kmno4', prompt: '(iii) Add 3 drops of acidified Potassium Dichromate(VI) (K₂Cr₂O₇) and warm gently.', correctObs: 'Orange potassium dichromate(VI) turns green; a pleasant fruity pungent smell is produced', correctInf: 'Primary or secondary alkanol (—OH) present; Cr₂O₇²⁻ reduced to Cr³⁺' },
        { id: 'q3_nahco3', prompt: '(iv) Add a half spatula-end of solid Sodium Hydrogen Carbonate (NaHCO₃).', correctObs: 'No effervescence / no bubbles of gas evolved', correctInf: 'Carboxylic acid (—COOH) absent; Alkanol (—OH) confirmed present' }
      ]
    };
  }
  return {
    trueOrganicKey: 'Ethanol',
    trueFunctionalGroup: 'Alkanol (-OH)',
    sampleDesc: 'A clear, colorless volatile liquid with a characteristic pleasant alcoholic odor.',
    tests: [
      { id: 'q3_ignition', prompt: '(i) Place 2 drops on a clean metallic spatula and ignite.', correctObs: 'Burns with a clean, non-sooty pale blue flame', correctInf: 'Low carbon:hydrogen ratio / saturated organic compound' },
      { id: 'q3_litmus', prompt: '(ii) Test with moist blue and red litmus paper.', correctObs: 'No color change on either blue or red litmus paper', correctInf: 'Neutral organic substance' },
      { id: 'q3_kmno4', prompt: '(iii) Add 3 drops of acidified KMnO₄ and warm gently.', correctObs: 'Purple color turns colorless (decolorized)', correctInf: 'Primary or secondary alkanol (—OH) present' },
      { id: 'q3_nahco3', prompt: '(iv) Add a half spatula-end of solid NaHCO₃.', correctObs: 'No effervescence / no gas evolved', correctInf: 'Carboxylic acid (—COOH) absent' }
    ]
  };
}

function normalizeChemString(str) {
  return (str || '').toLowerCase()
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, m => ({ '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9' }[m]))
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, m => ({ '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' }[m]))
    .replace(/[⁺﹢]/g, '+')
    .replace(/[⁻﹣–—]/g, '-')
    .replace(/[()\[\],;:\/\\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

class CompositeExamEngine {
  constructor(config = null) {
    this.preset = JSON.parse(JSON.stringify(COMPOSITE_EXAM_PRESETS.series_1));
    if (!this.preset.q2.simulationType) this.preset.q2.simulationType = (this.preset.q2.type === 'organic') ? 'organic' : 'qualitative';
    if (!this.preset.q3.simulationType) this.preset.q3.simulationType = (this.preset.q3.type === 'qualitative' || this.preset.q3.type === 'qualitative_single') ? 'qualitative' : 'organic';
    this.mode = 'strict'; // 'strict' (135 min timed) or 'guided' (with hints)

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

    // Multi-procedure titration state (e.g. Procedure I standardization + Procedure II solubility)
    this.activeProcedureIndex = 0;
    this.procedureStates = [
      {
        trials: [
          { trial: 1, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false },
          { trial: 2, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false },
          { trial: 3, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false }
        ],
        answers: {}
      }
    ];

    // Generic answers repository (supports arbitrary sub-questions)
    this.q1Answers = {};

    // Q2 State (Qualitative or Organic)
    this.q2Obs = {};
    this.q2Inf = {};
    this.q2CationChoice = '';
    this.q2AnionChoice = '';
    this.q2FunctionalGroupChoice = '';

    // Q3 Organic State
    this.q3Obs = {};
    this.q3Inf = {};
    this.q3FunctionalGroupChoice = '';

    this.startTime = Date.now();

    if (config) this.applyConfig(config);
  }

  applyConfig(config) {
    if (!config || typeof config !== 'object') return;
    if (config.mode) this.mode = config.mode;

    const presetKey = config.presetKey || config.examConfig?.presetKey;
    if (presetKey === 'random' || presetKey === 'random_mock') {
      this.preset = generateRandomCompositePreset();
    } else if (presetKey && COMPOSITE_EXAM_PRESETS[presetKey]) {
      const basePreset = COMPOSITE_EXAM_PRESETS[presetKey];
      this.preset = {
        ...basePreset,
        q1: { ...basePreset.q1 },
        q2: { ...basePreset.q2 },
        q3: { ...basePreset.q3 }
      };
      if (basePreset.q1?.hasMultipleProcedures && Array.isArray(basePreset.q1?.procedures) && basePreset.q1.procedures.length > 1) {
        this.preset.q1.hasMultipleProcedures = true;
        this.preset.q1.procedures = basePreset.q1.procedures.map((proc, pIdx) => ({
          ...proc,
          procedureIndex: proc.procedureIndex || pIdx + 1,
          trueTitre: proc.trueTitre != null ? Number(proc.trueTitre) : Number(basePreset.q1.trueTitre || 25.00),
          questions: Array.isArray(proc.questions) ? proc.questions.slice() : []
        }));
        this.procedureStates = basePreset.q1.procedures.map(() => ({
          trials: [
            { trial: 1, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false },
            { trial: 2, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false },
            { trial: 3, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false }
          ],
          answers: {}
        }));
        if (!this.preset.q1.questions || this.preset.q1.questions.length === 0) {
          this.preset.q1.questions = this.preset.q1.procedures.flatMap(p => p.questions || []);
        }
      }
      if (!this.preset.q2.simulationType) {
        this.preset.q2.simulationType = (this.preset.q2.type === 'organic') ? 'organic' : 'qualitative';
      }
      if (!this.preset.q3.simulationType) {
        this.preset.q3.simulationType = (this.preset.q3.type === 'qualitative' || this.preset.q3.type === 'qualitative_single') ? 'qualitative' : 'organic';
      }
      if (!this.preset.q1.hasMultipleProcedures && (!this.preset.q1.questions || this.preset.q1.questions.length === 0)) {
        if (this.preset.q1.calcType === 'water_of_crystallization') {
          this.preset.q1.questions = createWaterOfCrystallizationQuestions(this.preset.q1);
        } else if (this.preset.q1.calcType === 'percentage_purity') {
          this.preset.q1.questions = createPercentagePurityQuestions(this.preset.q1);
        } else if (this.preset.q1.calcType === 'ram_metal') {
          this.preset.q1.questions = createRamMetalQuestions(this.preset.q1);
        } else {
          this.preset.q1.questions = createStandardTitrationQuestions(this.preset.q1);
        }
      }
    }

    // Support flexible unpacking from config.q1, config.examConfig.q1, or config.questions[i].config
    const q1Obj = Array.isArray(config.questions) ? (config.questions.find(q => q.number === 1 || q.simulationType === 'titration' || q.type === 'volumetric') || config.questions[0]) : null;
    const q1Cfg = config.q1 || config.examConfig?.q1 || q1Obj?.config || (q1Obj && (q1Obj.solutionA || q1Obj.trueTitre || q1Obj.calcType || q1Obj.acidMolarity) ? q1Obj : null);
    
    // Explicit question mapping by question number first, preventing Q2/Q3 cross-contamination
    const q2Obj = Array.isArray(config.questions) ? (config.questions.find(q => q.number === 2) || config.questions[1]) : null;
    const q2Cfg = config.q2 || config.examConfig?.q2 || q2Obj?.config || (q2Obj && (q2Obj.tests || q2Obj.simulationType || q2Obj.type || q2Obj.trueSaltKey || q2Obj.trueOrganicKey) ? q2Obj : null);

    const q3Obj = Array.isArray(config.questions) ? (config.questions.find(q => q.number === 3) || config.questions[2]) : null;
    const q3Cfg = config.q3 || config.examConfig?.q3 || q3Obj?.config || (q3Obj && (q3Obj.tests || q3Obj.simulationType || q3Obj.type || q3Obj.trueSaltKey || q3Obj.trueOrganicKey) ? q3Obj : null);

    if (q1Cfg) {
      Object.assign(this.preset.q1, q1Cfg);
      if (q1Cfg.trueTitre != null) {
        this.preset.q1.trueTitre = Number(q1Cfg.trueTitre);
      }

      // Support multi-procedure double titrations (e.g. Procedure I & Procedure II)
      if (Array.isArray(q1Cfg.procedures) && q1Cfg.procedures.length > 0) {
        this.preset.q1.hasMultipleProcedures = true;
        this.preset.q1.procedures = q1Cfg.procedures.map((proc, pIdx) => ({
          ...proc,
          procedureIndex: proc.procedureIndex || pIdx + 1,
          trueTitre: proc.trueTitre != null ? Number(proc.trueTitre) : Number(this.preset.q1.trueTitre || 25.00)
        }));
        this.procedureStates = q1Cfg.procedures.map((proc, pIdx) => ({
          trials: [
            { trial: 1, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false },
            { trial: 2, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false },
            { trial: 3, initial: 0.00, final: 0.00, used: 0.00, concordant: false, recorded: false }
          ],
          answers: {}
        }));
        if (!this.preset.q1.questions || this.preset.q1.questions.length === 0) {
          this.preset.q1.questions = this.preset.q1.procedures.flatMap(p => p.questions || []);
        }
      }

      if (q1Cfg.ratioA != null) this.preset.q1.moleRatioAcid = Number(q1Cfg.ratioA);
      if (q1Cfg.ratioB != null) this.preset.q1.moleRatioBase = Number(q1Cfg.ratioB);
      if (q1Cfg.acidRfm != null) {
        this.preset.q1.acidRfm = Number(q1Cfg.acidRfm);
      } else if (this.preset.q1.solutionA) {
        const solALower = this.preset.q1.solutionA.toLowerCase();
        if (solALower.includes('sulfuric') || solALower.includes('h₂so₄') || solALower.includes('h2so4')) {
          this.preset.q1.acidRfm = 98.0;
        } else if (solALower.includes('oxalic') || solALower.includes('ethanedioic')) {
          this.preset.q1.acidRfm = 126.0;
        } else if (solALower.includes('nitric') || solALower.includes('hno3') || solALower.includes('hno₃')) {
          this.preset.q1.acidRfm = 63.0;
        } else if (solALower.includes('hydrochloric') || solALower.includes('hcl')) {
          this.preset.q1.acidRfm = 36.5;
        }
      }
      if (q1Cfg.baseRfm != null) this.preset.q1.baseRfm = Number(q1Cfg.baseRfm);

      // Regenerate appropriate calculation questions with bound functions
      if (!this.preset.q1.hasMultipleProcedures && (!this.preset.q1.questions || this.preset.q1.questions.length === 0)) {
        if (this.preset.q1.calcType === 'water_of_crystallization') {
          this.preset.q1.questions = createWaterOfCrystallizationQuestions(this.preset.q1);
        } else if (this.preset.q1.calcType === 'percentage_purity') {
          this.preset.q1.questions = createPercentagePurityQuestions(this.preset.q1);
        } else if (this.preset.q1.calcType === 'ram_metal') {
          this.preset.q1.questions = createRamMetalQuestions(this.preset.q1);
        } else {
          this.preset.q1.questions = createStandardTitrationQuestions(this.preset.q1);
        }
      }
    }

    if (q2Cfg) {
      Object.assign(this.preset.q2, q2Cfg);
      const isQ2Organic = q2Cfg.simulationType === 'organic' || (
        q2Cfg.simulationType !== 'qualitative' && (
          Boolean(q2Cfg.trueOrganicKey) ||
          Boolean(q2Cfg.trueFunctionalGroup) ||
          (q2Cfg.sampleDesc && /organic/i.test(q2Cfg.sampleDesc)) ||
          (q2Cfg.tests && q2Cfg.tests.some(t => /spatula|flame|litmus|manganate|kmno4|nahco3|bromine/i.test(t.prompt || '')))
        )
      );

      if (isQ2Organic) {
        this.preset.q2.simulationType = 'organic';
        const orgKey = q2Cfg.trueOrganicKey || q2Cfg.organic;
        if (orgKey) this.preset.q2.trueOrganicKey = orgKey;
        if (!Array.isArray(q2Cfg.tests) || q2Cfg.tests.length === 0) {
          const registryOrg = getOrganicPresetDefinition(orgKey || 'Ethanol');
          if (registryOrg) {
            this.preset.q2.trueFunctionalGroup = registryOrg.trueFunctionalGroup;
            this.preset.q2.sampleDesc = registryOrg.sampleDesc;
            this.preset.q2.tests = registryOrg.tests;
          }
        }
      } else {
        this.preset.q2.simulationType = 'qualitative';
        const saltKey = q2Cfg.trueSaltKey || q2Cfg.salt;
        if (saltKey) this.preset.q2.trueSaltKey = saltKey;
        if (q2Cfg.hasDeduction !== undefined) {
          this.preset.q2.hasDeduction = Boolean(q2Cfg.hasDeduction);
        } else if (presetKey === 'custom' || !presetKey) {
          this.preset.q2.hasDeduction = Boolean(
            Array.isArray(q2Cfg.tests) && q2Cfg.tests.some(t => /final deduction|state the (cation|anion|identity)|write the formula/i.test(t.prompt || ''))
          );
        }
        if (!Array.isArray(q2Cfg.tests) || q2Cfg.tests.length === 0) {
          const registryTests = getSaltPresetDefinition(saltKey || 'Pb(NO3)2');
          if (registryTests) {
            this.preset.q2.trueCation = registryTests.trueCation;
            this.preset.q2.trueAnion = registryTests.trueAnion;
            this.preset.q2.trueSaltName = registryTests.trueSaltName;
            this.preset.q2.sampleDesc = registryTests.sampleDesc;
            this.preset.q2.tests = registryTests.tests;
          }
        }
      }
    }

    if (q3Cfg) {
      Object.assign(this.preset.q3, q3Cfg);
      const isQualitative = q3Cfg.simulationType === 'qualitative' || (
        q3Cfg.simulationType !== 'organic' && (
          Boolean(q3Cfg.trueSaltKey) ||
          Boolean(q3Cfg.trueCation) ||
          (q3Cfg.sampleName && /solid/i.test(q3Cfg.sampleName)) ||
          (q3Cfg.tests && q3Cfg.tests.some(t => /naoh|ammonia|nh3|precipitation|cation|anion|heat|dissolv/i.test(t.prompt || '')))
        )
      );
      if (isQualitative) {
        this.preset.q3.simulationType = 'qualitative';
        const saltKey = q3Cfg.trueSaltKey || q3Cfg.salt;
        if (saltKey) this.preset.q3.trueSaltKey = saltKey;
        if (!Array.isArray(q3Cfg.tests) || q3Cfg.tests.length === 0) {
          const registryTests = getSaltPresetDefinition(saltKey || 'Pb(NO3)2');
          if (registryTests) {
            this.preset.q3.trueCation = registryTests.trueCation;
            this.preset.q3.trueAnion = registryTests.trueAnion;
            this.preset.q3.trueSaltName = registryTests.trueSaltName;
            this.preset.q3.sampleDesc = registryTests.sampleDesc;
            this.preset.q3.tests = registryTests.tests;
          }
        }
      } else {
        this.preset.q3.simulationType = 'organic';
        const orgKey = q3Cfg.trueOrganicKey || q3Cfg.organic;
        if (orgKey) this.preset.q3.trueOrganicKey = orgKey;
        if (!Array.isArray(q3Cfg.tests) || q3Cfg.tests.length === 0) {
          const registryOrg = getOrganicPresetDefinition(orgKey);
          if (registryOrg) {
            this.preset.q3.trueFunctionalGroup = registryOrg.trueFunctionalGroup;
            this.preset.q3.sampleDesc = registryOrg.sampleDesc;
            this.preset.q3.tests = registryOrg.tests;
          }
        }
      }
    }
  }

  // ── Q1 Titration Workbench Operations ────────────────────────────────
  recordTrial(trialIndex, finalVol, initVol = 0.00, procIdx = null) {
    const pIndex = (procIdx != null) ? procIdx : (this.activeProcedureIndex || 0);
    if (this.procedureStates && this.procedureStates[pIndex]) {
      const pTrials = this.procedureStates[pIndex].trials;
      if (trialIndex >= 1 && trialIndex <= pTrials.length) {
        const pt = pTrials[trialIndex - 1];
        pt.initial = parseFloat(initVol) || 0.00;
        pt.final = parseFloat(finalVol) || 0.00;
        pt.used = parseFloat((pt.final - pt.initial).toFixed(2));
        pt.recorded = true;
      }
    }
    if (trialIndex < 1 || trialIndex > 3) return;
    const t = this.q1Trials[trialIndex - 1];
    t.initial = parseFloat(initVol) || 0.00;
    t.final = parseFloat(finalVol) || 0.00;
    t.used = parseFloat((t.final - t.initial).toFixed(2));
    t.recorded = true;
    return t;
  }

  setConcordant(trialIndex, isConcordant, procIdx = null) {
    const pIndex = (procIdx != null) ? procIdx : (this.activeProcedureIndex || 0);
    if (this.procedureStates && this.procedureStates[pIndex]) {
      const pTrials = this.procedureStates[pIndex].trials;
      if (trialIndex >= 1 && trialIndex <= pTrials.length) {
        pTrials[trialIndex - 1].concordant = !!isConcordant;
      }
    }
    if (trialIndex < 1 || trialIndex > 3) return;
    this.q1Trials[trialIndex - 1].concordant = !!isConcordant;
  }

  setQ1Answer(field, value, procIdx = null) {
    const pIndex = (procIdx != null) ? procIdx : (this.activeProcedureIndex || 0);
    if (this.procedureStates && this.procedureStates[pIndex]) {
      this.procedureStates[pIndex].answers[field] = value;
    }
    this.q1Answers[field] = value;
  }

  recordProcedureTrial(procIdx, trialIndex, finalVol, initVol = 0.00) {
    return this.recordTrial(trialIndex, finalVol, initVol, procIdx);
  }

  setProcedureConcordant(procIdx, trialIndex, isConcordant) {
    this.setConcordant(trialIndex, isConcordant, procIdx);
  }

  setProcedureAnswer(procIdx, field, value) {
    this.setQ1Answer(field, value, procIdx);
  }

  getProcedureTrials(procIdx) {
    return (this.procedureStates && this.procedureStates[procIdx] && this.procedureStates[procIdx].trials) || this.q1Trials;
  }

  getProcedureAnswers(procIdx) {
    return (this.procedureStates && this.procedureStates[procIdx] && this.procedureStates[procIdx].answers) || this.q1Answers;
  }

  // ── Modular Single Procedure Evaluator (KNEC Standards) ──────────────
  evaluateSingleTitrationProcedure(proc, trials, answers, prefix = 'Q1') {
    let tableScore = 0.0;
    let calcScore = 0.0;
    const rubric = [];
    const modelAnswers = {};

    const tableTitle = proc.tableTitle || `Table (${prefix})`;
    const maxTableMarks = proc.tableMarks != null ? Number(proc.tableMarks) : (proc.simulationType === 'energy' ? 3.0 : 5.0);
    const trueTitre = Number(proc.trueTitre) || 25.00;
    modelAnswers[`${prefix}_trueTitre`] = trueTitre;

    if (proc.simulationType === 'energy') {
      // ── Thermometric Table Evaluator (Neutralization Enthalpy or Cooling Curve) ──
      const isNeutralization = proc.scenarioKey === 'KCSE_2005_NEUTRALIZATION' || proc.tableType === 'neutralization_temp' || (proc.title && /neutralization|enthalpy/i.test(proc.title));
      if (isNeutralization) {
        const t1 = parseFloat(getAnswerValue(answers, 't1', 'p2_t1', 'initT1'));
        const t2 = parseFloat(getAnswerValue(answers, 't2', 'p2_t2', 'initT2'));
        const t0 = parseFloat(getAnswerValue(answers, 't0', 'p2_t0', 'meanT0'));
        const tMax = parseFloat(getAnswerValue(answers, 'tMax', 'p2_tMax', 'maxTemp'));
        const deltaT = parseFloat(getAnswerValue(answers, 'tempRise', 'step_2a', 'deltaT'));

        let ctMark = (!isNaN(t1) && !isNaN(t2) && !isNaN(tMax)) ? 1.0 : (!isNaN(tMax) || !isNaN(deltaT) ? 0.5 : 0.0);
        let dMark = ((!isNaN(t1) && String(t1).includes('.')) || (!isNaN(tMax) && String(tMax).includes('.')) || (!isNaN(deltaT) && String(deltaT).includes('.'))) ? 1.0 : 0.5;
        let acMark = ((!isNaN(deltaT) && Math.abs(deltaT - 5.0) <= 0.8) || (!isNaN(tMax) && Math.abs(tMax - 28.5) <= 1.5)) ? 1.0 : 0.5;
        tableScore = Math.min(maxTableMarks, ctMark + dMark + acMark);

        rubric.push({
          code: `${prefix}_CT`,
          item: `${tableTitle} Completeness (CT)`,
          max: 1.0,
          mark: ctMark,
          pass: ctMark >= 1.0,
          detail: ctMark >= 1.0 ? 'Full mark (1.0 Mk): Complete initial, highest, and mean temperature records.' : 'Incomplete temperature records in Table 2.'
        });
        rubric.push({
          code: `${prefix}_D`,
          item: `${tableTitle} Decimals (D)`,
          max: 1.0,
          mark: dMark,
          pass: dMark >= 1.0,
          detail: 'Consistent recording to 1 decimal place (.0 or .5).'
        });
        rubric.push({
          code: `${prefix}_AC`,
          item: `${tableTitle} Accuracy (AC)`,
          max: 1.0,
          mark: acMark,
          pass: acMark >= 1.0,
          detail: 'Neutralization temperature rise within expected experimental limits (ΔT ≈ 5.0 °C).'
        });
      } else {
        // Cooling curve (e.g. KCSE_2004_COOLING_CURVE Solid D)
        let filledCount = 0;
        const times = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0];
        times.forEach(tm => {
          const k = `temp_${String(tm).replace('.', '_')}`;
          const v = parseFloat(getAnswerValue(answers, k, `t_${tm}`));
          if (!isNaN(v) && v > 0) filledCount++;
        });
        let ctMark = filledCount >= 10 ? 2.0 : (filledCount >= 4 ? 1.0 : 0.0);
        let acMark = filledCount >= 10 ? 2.0 : (filledCount >= 4 ? 1.0 : 0.5);
        tableScore = Math.min(maxTableMarks, ctMark + acMark);

        rubric.push({
          code: `${prefix}_CT`,
          item: `${tableTitle} Completeness & Continuous Trend (CT)`,
          max: 2.0,
          mark: ctMark,
          pass: ctMark >= 2.0,
          detail: `Recorded ${filledCount} of 15 temperature readings at 30s intervals across 7.0 minutes.`
        });
        rubric.push({
          code: `${prefix}_AC`,
          item: `${tableTitle} Plateau Accuracy (AC)`,
          max: 2.0,
          mark: acMark,
          pass: acMark >= 1.5,
          detail: 'Clear horizontal solidification plateau observed around 69.0 °C.'
        });
      }
    } else {
      // ── Standard Titration Table Evaluator (CT, D, AC, PA, FA) ──
      const recordedTrials = (trials || []).filter(t => t.recorded && t.used > 0);

      // 1. Complete Table (CT) — 1.0 Mark
      let ctPenalty = 0.0;
      let hasInverted = false;
      let hasArithError = false;
      let hasImpossible = false;

      (trials || []).forEach(t => {
        if (t.recorded) {
          if (t.initial > t.final) hasInverted = true;
          const diff = Math.abs(t.used - Math.max(0, t.final - t.initial));
          if (diff > 0.02) hasArithError = true;
          if (t.final > 50.0 || t.used > 50.0 || t.used < 1.0) hasImpossible = true;
        }
      });

      if (hasInverted || hasArithError || hasImpossible) {
        ctPenalty = 0.5;
      }

      let ctMark = 0.0;
      let ctDetail = '';
      if (recordedTrials.length >= 3) {
        ctMark = Math.max(0.0, 1.0 - ctPenalty);
        ctDetail = ctPenalty > 0
          ? `Penalized (0.5 Mk): 3 trials recorded but detected ${hasInverted ? 'inverted readings' : (hasArithError ? 'subtraction arithmetic discrepancy' : 'unrealistic values')}.`
          : `Full mark (1.0 Mk): All 3 titration trials in ${tableTitle} completely recorded within realistic boundaries.`;
      } else if (recordedTrials.length === 2) {
        ctMark = Math.max(0.0, 0.5 - ctPenalty);
        ctDetail = `Partial mark (0.5 Mk): 2 trials recorded in ${tableTitle}.`;
      } else {
        ctMark = 0.0;
        ctDetail = `Incomplete (0.0 Mk): At least 2 titration trials are required in ${tableTitle}.`;
      }
      tableScore += ctMark;
      rubric.push({
        code: prefix === 'Q1' ? 'CT' : `${prefix}_CT`,
        item: `${tableTitle} Completeness (CT)`,
        max: 1.0,
        mark: ctMark,
        pass: ctMark >= 1.0,
        detail: ctDetail
      });

      // 2. Use of Decimals (D) — 1.0 Mark
      let decimalViolations = 0;
      let recordedCount = 0;
      (trials || []).forEach(t => {
        if (t.recorded) {
          recordedCount++;
          const finStr = Number(t.final).toFixed(2);
          const lastDigit = finStr.slice(-1);
          if (lastDigit !== '0' && lastDigit !== '5') {
            decimalViolations++;
          }
        }
      });

      let dMark = 0.0;
      let dDetail = '';
      if (recordedCount >= 2 && decimalViolations === 0) {
        dMark = 1.0;
        dDetail = `Full mark (1.0 Mk): All burette readings in ${tableTitle} consistently adhere to KNEC 2 d.p. convention ending in .00 or .05.`;
      } else if (recordedCount >= 2) {
        dMark = 0.0;
        dDetail = `0.0 Mark: ${decimalViolations} reading(s) in ${tableTitle} violated KNEC precision rule (2nd decimal must terminate strictly in .0 or .5).`;
      } else {
        dMark = 0.0;
        dDetail = `0.0 Mark: Incomplete titration trials in ${tableTitle}.`;
      }
      tableScore += dMark;
      rubric.push({
        code: prefix === 'Q1' ? 'D' : `${prefix}_D`,
        item: `${tableTitle} Decimals (D)`,
        max: 1.0,
        mark: dMark,
        pass: dMark === 1.0,
        detail: dDetail
      });

      // 3. Accuracy vs School Value (AC) — 1.0 Mark
      let minDiff = 999.0;
      recordedTrials.forEach(t => {
        const d = Math.abs(t.used - trueTitre);
        if (d < minDiff) minDiff = d;
      });

      let acMark = 0.0;
      let acDetail = '';
      if (recordedTrials.length >= 2 && minDiff <= 0.10) {
        acMark = 1.0;
        acDetail = `Full mark (1.0 Mk): At least one titre is within ±0.10 cm³ of School Value (deviation: ${minDiff.toFixed(2)} cm³, SV: ${trueTitre.toFixed(2)} cm³).`;
      } else if (recordedTrials.length >= 2 && minDiff <= 0.20) {
        acMark = 0.5;
        acDetail = `Partial mark (0.5 Mk): Closest titre is within ±0.20 cm³ of School Value (deviation: ${minDiff.toFixed(2)} cm³, SV: ${trueTitre.toFixed(2)} cm³).`;
      } else {
        acMark = 0.0;
        acDetail = `0.0 Mark: Titres deviated by > ±0.20 cm³ from School Value (closest deviation: ${minDiff < 900 ? minDiff.toFixed(2) + ' cm³' : 'N/A'}).`;
      }
      tableScore += acMark;
      rubric.push({
        code: prefix === 'Q1' ? 'AC' : `${prefix}_AC`,
        item: `${tableTitle} Accuracy (AC)`,
        max: 1.0,
        mark: acMark,
        pass: acMark === 1.0,
        detail: acDetail
      });

      // 4. Principles of Averaging (PA) — 1.0 Mark
      const checkedConcordant = (trials || []).filter(t => t.recorded && t.concordant && t.used > 0);
      const candidateAvgTitre = parseFloat(getAnswerValue(answers, 'avgTitre', 'step_a') || getAnswerValue(answers, `${prefix}_avgTitre`, `${prefix}_step_a`));
      
      let concordantSet = checkedConcordant.length >= 2 ? checkedConcordant : [];
      if (concordantSet.length === 0 && recordedTrials.length >= 2) {
        if (recordedTrials.length === 3) {
          const [a, b, c] = recordedTrials.map(t => t.used);
          const spreadAll = Math.max(a, b, c) - Math.min(a, b, c);
          if (spreadAll <= 0.20) {
            concordantSet = recordedTrials;
          } else if (Math.abs(a - b) <= 0.20) {
            concordantSet = [recordedTrials[0], recordedTrials[1]];
          } else if (Math.abs(b - c) <= 0.20) {
            concordantSet = [recordedTrials[1], recordedTrials[2]];
          } else if (Math.abs(a - c) <= 0.20) {
            concordantSet = [recordedTrials[0], recordedTrials[2]];
          }
        } else if (recordedTrials.length === 2 && Math.abs(recordedTrials[0].used - recordedTrials[1].used) <= 0.20) {
          concordantSet = recordedTrials;
        }
      }

      let paMark = 0.0;
      let paDetail = '';
      if (concordantSet.length >= 2) {
        const spread = Math.max(...concordantSet.map(t => t.used)) - Math.min(...concordantSet.map(t => t.used));
        const arithmeticAvg = concordantSet.reduce((acc, t) => acc + t.used, 0) / concordantSet.length;
        const arithCorrect = !isNaN(candidateAvgTitre) && Math.abs(candidateAvgTitre - arithmeticAvg) <= 0.02;

        let missedThirdConcordant = false;
        if (recordedTrials.length === 3) {
          const spreadAll = Math.max(...recordedTrials.map(t => t.used)) - Math.min(...recordedTrials.map(t => t.used));
          if (spreadAll <= 0.20 && concordantSet.length === 2) {
            missedThirdConcordant = true;
          }
        }

        if (spread <= 0.20 && arithCorrect) {
          if (missedThirdConcordant) {
            paMark = 0.5;
            paDetail = 'Partial mark (0.5 Mk): 3 consistent titres were available within ±0.20 cm³, but candidate averaged only 2.';
          } else {
            paMark = 1.0;
            paDetail = `Full mark (1.0 Mk): Concordant titres within ±0.20 cm³ selected and correctly averaged to ${candidateAvgTitre.toFixed(2)} cm³.`;
          }
        } else if (spread <= 0.20 && !isNaN(candidateAvgTitre)) {
          paMark = 0.5;
          paDetail = `Partial mark (0.5 Mk): Concordant titres selected, but arithmetic average error (Expected: ${arithmeticAvg.toFixed(2)} cm³, candidate: ${candidateAvgTitre.toFixed(2)} cm³).`;
        } else if (spread > 0.20) {
          paMark = 0.0;
          paDetail = `0.0 Mark: Selected titres are not concordant (spread: ${spread.toFixed(2)} cm³ > ±0.20 cm³).`;
        } else {
          paMark = 0.5;
          paDetail = 'Partial mark (0.5 Mk): Concordant values present.';
        }
      } else {
        paMark = 0.0;
        paDetail = '0.0 Mark: No concordant titres within ±0.20 cm³ identified.';
      }
      tableScore += paMark;
      rubric.push({
        code: prefix === 'Q1' ? 'PA' : `${prefix}_PA`,
        item: `${tableTitle} Principles of Averaging (PA)`,
        max: 1.0,
        mark: paMark,
        pass: paMark >= 1.0,
        detail: paDetail
      });

      const expAvgFromTrials = concordantSet.length > 0
        ? concordantSet.reduce((acc, b) => acc + b.used, 0) / concordantSet.length
        : (recordedTrials.length > 0 ? (recordedTrials.reduce((acc, b) => acc + b.used, 0) / recordedTrials.length) : trueTitre);

      // 5. Final Accuracy of Averaged Titre (FA) — 1.0 Mark (Standard single-titration KNEC rubric)
      if (maxTableMarks >= 5.0) {
        let faMark = 0.0;
        let faDetail = '';
        const finalTitreVal = !isNaN(candidateAvgTitre) ? candidateAvgTitre : expAvgFromTrials;
        const faDiff = Math.abs(finalTitreVal - trueTitre);
        if (faDiff <= 0.10) {
          faMark = 1.0;
          faDetail = `Full mark (1.0 Mk): Candidate final average titre (${finalTitreVal.toFixed(2)} cm³) is within ±0.10 cm³ of School Value (${trueTitre.toFixed(2)} cm³).`;
        } else if (faDiff <= 0.20) {
          faMark = 0.5;
          faDetail = `Partial mark (0.5 Mk): Candidate final average titre (${finalTitreVal.toFixed(2)} cm³) is within ±0.20 cm³ of School Value (${trueTitre.toFixed(2)} cm³).`;
        } else {
          faMark = 0.0;
          faDetail = `0.0 Mark: Candidate average titre (${finalTitreVal.toFixed(2)} cm³) deviated by > ±0.20 cm³ from School Value (${trueTitre.toFixed(2)} cm³).`;
        }
        tableScore += faMark;
        rubric.push({
          code: prefix === 'Q1' ? 'FA' : `${prefix}_FA`,
          item: `${tableTitle} Final Accuracy of Averaged Titre (FA)`,
          max: 1.0,
          mark: faMark,
          pass: faMark === 1.0,
          detail: faDetail
        });
      }

      tableScore = Math.min(maxTableMarks, tableScore);
    }

    // 6. Mathematical Sub-Questions with e.c.f.

    const questionsList = proc.questions || [];
    let calcMax = 0;

    const evalCtx = {
      trueTitre,
      expAvgFromTrials,
      trueAcidMolarity: Number(proc.trueAcidMolarity || this.preset.q1?.trueAcidMolarity) || 0.100,
      trueBaseMolarity: Number(proc.trueBaseMolarity || this.preset.q1?.trueBaseMolarity) || 0.100,
      pipetteVol: Number(proc.pipetteVolume || this.preset.q1?.pipetteVolume) || 25.0,
      ratioA: Number(proc.moleRatioAcid || proc.ratioA) || 1,
      ratioB: Number(proc.moleRatioBase || proc.ratioB) || 1,
      acidRfm: Number(proc.acidRfm || this.preset.q1?.acidRfm) || 36.5,
      baseRfm: Number(proc.baseRfm || this.preset.q1?.baseRfm) || 40.0,
      answers,
      t1: (trials && trials[0]?.used) || trueTitre,
      t2: (trials && trials[1]?.used) || trueTitre,
      v1: parseFloat(candidateAvgTitre) || expAvgFromTrials
    };

    questionsList.forEach(q => {
      const fieldKey = q.field || q.id;
      const qMarks = Number(q.marks) || 1.0;
      calcMax += qMarks;
      const rawAns = getAnswerValue(answers, fieldKey, q.id);
      const val = parseFloat(rawAns);

      const expTheo = typeof q.calcTheoretical === 'function' ? q.calcTheoretical(evalCtx) : (q.expectedValue != null ? Number(q.expectedValue) : null);
      const expEcf = typeof q.calcEcf === 'function' ? q.calcEcf(evalCtx) : expTheo;

      let isPassed = false;
      let awarded = 0.0;
      let usedEcf = false;

      if (!isNaN(val)) {
        if (typeof q.check === 'function') {
          isPassed = q.check(val, evalCtx, expTheo, expEcf);
          if (isPassed && expTheo != null && expEcf != null) {
            const diffTheo = Math.abs(val - expTheo) / (expTheo || 1);
            const diffEcf = Math.abs(val - expEcf) / (expEcf || 1);
            if (diffTheo > 0.05 && diffEcf <= 0.08) {
              usedEcf = true;
            }
          }
        } else if (expTheo != null) {
          isPassed = Math.abs(val - expTheo) / (expTheo || 1) <= 0.08;
          if (!isPassed && expEcf != null) {
            isPassed = Math.abs(val - expEcf) / (expEcf || 1) <= 0.08;
            if (isPassed) usedEcf = true;
          }
        } else {
          // If no custom validation formula provided, accept reasonable positive number
          isPassed = val > 0;
        }
      }

      if (isPassed) {
        awarded = qMarks;
        calcScore += awarded;
        rubric.push({
          code: `${prefix}_${(q.letter || q.id).toUpperCase()}`,
          item: `(${q.letter || q.id}) ${q.label} [${awarded.toFixed(1)} / ${qMarks.toFixed(1)} Marks]`,
          max: qMarks,
          mark: awarded,
          pass: true,
          detail: usedEcf
            ? `Correct via Error Carried Forward (e.c.f.): Candidate accurately used their prior calculated value (${val}).`
            : (typeof q.feedbackSuccess === 'function' ? q.feedbackSuccess(val) : `Correct: ${val} ${q.unit || ''}.`)
        });
      } else {
        rubric.push({
          code: `${prefix}_${(q.letter || q.id).toUpperCase()}`,
          item: `(${q.letter || q.id}) ${q.label} [0.0 / ${qMarks.toFixed(1)} Marks]`,
          max: qMarks,
          mark: 0.0,
          pass: false,
          detail: typeof q.feedbackFail === 'function' ? q.feedbackFail(evalCtx, expTheo) : `Expected around ${expTheo != null ? (typeof expTheo === 'number' ? expTheo.toFixed(4) : expTheo) : 'correct KNEC calculation'} ${q.unit || ''}.`
        });
      }

      modelAnswers[fieldKey] = expTheo;
    });

    const total = parseFloat((tableScore + calcScore).toFixed(1));
    const maxScore = proc.marks != null ? Number(proc.marks) : (maxTableMarks + calcMax);

    return {
      tableScore: parseFloat(tableScore.toFixed(1)),
      calcScore: parseFloat(calcScore.toFixed(1)),
      totalScore: parseFloat(total.toFixed(1)),
      maxScore,
      rubric,
      modelAnswers
    };
  }

  // ── KNEC Scoring Algorithm with Multi-Procedure Support ───────────────
  calculateQ1Score() {
    if (!this.preset || !this.preset.q1) {
      return { tableScore: 0, calcScore: 0, totalScore: 0, maxScore: 0, rubric: [], modelAnswers: {} };
    }
    if (this.preset.q1?.hasMultipleProcedures && Array.isArray(this.preset.q1.procedures) && this.preset.q1.procedures.length > 1) {
      let combinedTable = 0;
      let combinedCalc = 0;
      let combinedTotal = 0;
      let combinedMax = 0;
      const combinedRubric = [];
      const combinedModelAnswers = {};
      const procResults = [];

      this.preset.q1.procedures.forEach((proc, idx) => {
        const trials = (this.procedureStates && this.procedureStates[idx] && this.procedureStates[idx].trials) || (idx === 0 ? this.q1Trials : []);
        const answers = (this.procedureStates && this.procedureStates[idx] && this.procedureStates[idx].answers) || (idx === 0 ? this.q1Answers : {});
        const res = this.evaluateSingleTitrationProcedure(proc, trials, answers, `P${idx + 1}`);
        procResults.push(res);
        combinedTable += res.tableScore;
        combinedCalc += res.calcScore;
        combinedTotal += res.totalScore;
        combinedMax += res.maxScore;
        combinedRubric.push(...res.rubric);
        Object.assign(combinedModelAnswers, res.modelAnswers);
      });

      return {
        tableScore: parseFloat(combinedTable.toFixed(1)),
        calcScore: parseFloat(combinedCalc.toFixed(1)),
        totalScore: parseFloat(combinedTotal.toFixed(1)),
        maxScore: combinedMax || Number(this.preset.q1.marks) || 19.0,
        rubric: combinedRubric,
        modelAnswers: combinedModelAnswers,
        procedures: procResults
      };
    }

    // Single procedure (100% backward compatible)
    return this.evaluateSingleTitrationProcedure(this.preset.q1, this.q1Trials, this.q1Answers, 'Q1');
  }

  // ── Q2 Qualitative Operations & Ionic Charge Enforcement ─────────────
  setQ2Response(testId, obsText, infText) {
    this.q2Obs[testId] = obsText;
    this.q2Inf[testId] = infText;
  }

  setQ2Observation(testId, obsText) {
    this.q2Obs[testId] = obsText;
  }

  setQ2Inference(testId, infText) {
    this.q2Inf[testId] = infText;
  }

  setQ2Deduction(cation, anion) {
    this.q2CationChoice = cation;
    this.q2AnionChoice = anion;
  }

  setQ2OrganicDeduction(functionalGroup) {
    this.q2FunctionalGroupChoice = functionalGroup;
  }

  calculateQ2Score() {
    if (!this.preset || !this.preset.q2 || !Array.isArray(this.preset.q2.tests)) {
      return { totalScore: 0, maxScore: 0, rubric: [] };
    }
    let score = 0.0;
    const rubric = [];
    const tests = this.preset.q2.tests || [];
    const totalMarks = Number(this.preset.q2.marks) || 15.0;

    if (this.preset.q2.simulationType === 'organic') {
      const perTestMax = tests.length > 0 ? parseFloat((totalMarks / tests.length).toFixed(1)) : 2.5;
      const perHalfMax = parseFloat((perTestMax / 2.0).toFixed(1));
      const stopWords = ['with', 'from', 'form', 'forms', 'formed', 'solution', 'added', 'give', 'gives', 'given', 'there', 'when', 'that', 'this', 'remain', 'remains', 'test'];
      const infStopWords = ['the', 'and', 'ion', 'ions', 'may', 'present', 'absent', 'probable', 'suspected', 'confirmed', 'with', 'from', 'compound', 'substance'];

      tests.forEach((t, idx) => {
        const candidateObs = (this.q2Obs[t.id] || '').trim().toLowerCase();
        const candidateInf = (this.q2Inf[t.id] || '').trim().toLowerCase();
        let testMark = 0.0;
        let obsMark = 0.0;
        const obsKeywords = (t.correctObs || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 3 && !stopWords.includes(w));
        const obsMatches = obsKeywords.filter(w => candidateObs.includes(w)).length;
        if (candidateObs.length > 4 && obsMatches >= Math.min(2, obsKeywords.length) && obsKeywords.length > 0) {
          obsMark = perHalfMax;
        } else if (candidateObs.length > 4 && obsMatches >= 1) {
          obsMark = obsKeywords.length <= 2 ? perHalfMax : parseFloat((perHalfMax / 2).toFixed(1));
        }

        let infMark = 0.0;
        const infKeywords = (t.correctInf || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 2 && !infStopWords.includes(w));
        const infMatches = infKeywords.filter(w => candidateInf.includes(w)).length;
        if (candidateInf.length > 3 && infMatches >= Math.min(2, infKeywords.length) && infKeywords.length > 0) {
          infMark = perHalfMax;
        } else if (candidateInf.length > 3 && infMatches >= 1) {
          infMark = infKeywords.length <= 2 ? perHalfMax : parseFloat((perHalfMax / 2).toFixed(1));
        }
        testMark = parseFloat((obsMark + infMark).toFixed(1));
        score += testMark;
        rubric.push({
          code: `Q2_${String.fromCharCode(97 + idx)}`,
          item: `Organic Test (${String.fromCharCode(97 + idx)}): ${(t.prompt || '').substring(0, 45)}… [${testMark.toFixed(1)} / ${perTestMax.toFixed(1)} Mks]`,
          max: perTestMax,
          mark: testMark,
          pass: testMark >= (perTestMax * 0.6),
          detail: `Obs: [${obsMark.toFixed(1)}/${perHalfMax.toFixed(1)}] "${this.q2Obs[t.id] || 'None'}". Infs: [${infMark.toFixed(1)}/${perHalfMax.toFixed(1)}] "${this.q2Inf[t.id] || 'None'}".`
        });
      });

      if (this.q2FunctionalGroupChoice) {
        const fgCorrect = (this.preset.q2.trueFunctionalGroup && this.q2FunctionalGroupChoice.includes(this.preset.q2.trueFunctionalGroup.split(' ')[0]));
        const fgMark = fgCorrect ? 2.0 : 0.0;
        score += fgMark;
        rubric.push({
          code: 'Q2_FG',
          item: 'Functional Group Deduction',
          max: 2.0,
          mark: fgMark,
          pass: fgCorrect,
          detail: fgCorrect ? `Correct functional group identified (${this.preset.q2.trueFunctionalGroup}).` : `Expected: ${this.preset.q2.trueFunctionalGroup || 'Correct functional group'}`
        });
      }

      return {
        totalScore: Math.min(totalMarks, parseFloat(score.toFixed(1))),
        maxScore: totalMarks,
        rubric
      };
    }

    const hasDeduction = Boolean(this.preset.q2.hasDeduction === true);

    const perTestMax = hasDeduction
      ? 3.0
      : (tests.length > 0 ? parseFloat((totalMarks / tests.length).toFixed(1)) : 2.5);
    const perHalfMax = parseFloat((perTestMax / 2.0).toFixed(1));

    // Helper to extract chemical ions and keywords
    const extractIons = (text) => {
      const lower = normalizeChemString(text);
      const ions = [];
      if (lower.includes('pb') || lower.includes('lead')) ions.push('pb2+');
      if (lower.includes('al') || lower.includes('aluminium') || lower.includes('aluminum')) ions.push('al3+');
      if (lower.includes('zn') || lower.includes('zinc')) ions.push('zn2+');
      if (lower.includes('cu') || lower.includes('copper')) ions.push('cu2+');
      if (lower.includes('fe2') || lower.includes('iron(ii)') || lower.includes('iron (ii)') || lower.includes('fe 2')) ions.push('fe2+');
      if (lower.includes('fe3') || lower.includes('iron(iii)') || lower.includes('iron (iii)') || lower.includes('fe 3')) ions.push('fe3+');
      if (lower.includes('ca') || lower.includes('calcium')) ions.push('ca2+');
      if (lower.includes('mg') || lower.includes('magnesium')) ions.push('mg2+');
      if (lower.includes('ba') || lower.includes('barium')) ions.push('ba2+');
      if (lower.includes('so4') || lower.includes('sulphate') || lower.includes('sulfate')) ions.push('so42-');
      if (lower.includes('so3') || lower.includes('sulphite') || lower.includes('sulfite')) ions.push('so32-');
      if (lower.includes('co3') || lower.includes('carbonate')) ions.push('co32-');
      if (lower.includes('cl') || lower.includes('chloride')) ions.push('cl-');
      if (lower.includes('no3') || lower.includes('nitrate')) ions.push('no3-');
      if (lower.includes('i-') || lower.includes('iodide') || lower.includes('i -')) ions.push('i-');
      return ions;
    };

    tests.forEach((t, idx) => {
      const candidateObs = (this.q2Obs[t.id] || '').trim();
      const candidateInf = (this.q2Inf[t.id] || '').trim();
      const obsLower = candidateObs.toLowerCase();
      const infLower = candidateInf.toLowerCase();
      let testMark = 0.0;

      // 1. Observation Keyword Scoring
      let obsMark = 0.0;
      const hasPpt = obsLower.includes('ppt') || obsLower.includes('precipitate') || obsLower.includes('fumes') || obsLower.includes('residue') || obsLower.includes('decrepit');
      const expectedObsLower = (t.correctObs || '').toLowerCase();
      let matchesDropwise = false;
      let matchesExcess = false;

      if (expectedObsLower.includes('white precipitate') || expectedObsLower.includes('white ppt')) {
        matchesDropwise = obsLower.includes('white') && hasPpt;
      } else if (expectedObsLower.includes('yellow precipitate') || expectedObsLower.includes('yellow ppt')) {
        matchesDropwise = obsLower.includes('yellow') && hasPpt;
      } else if (expectedObsLower.includes('brown fumes') || expectedObsLower.includes('decrepit')) {
        matchesDropwise = obsLower.includes('brown') || obsLower.includes('decrepit') || obsLower.includes('rekindl');
      } else if (expectedObsLower.includes('no precipitate') || expectedObsLower.includes('no ppt')) {
        matchesDropwise = (obsLower.includes('no ppt') || obsLower.includes('no precipitate') || obsLower.includes('remains colorless') || obsLower.includes('colourless solution remains') || obsLower.includes('clear solution')) && !obsLower.includes('white ppt') && !obsLower.includes('white precipitate');
      } else {
        const obsStopWords = ['with', 'from', 'form', 'forms', 'formed', 'solution', 'added', 'give', 'gives', 'given', 'there', 'when', 'that', 'this', 'remain', 'remains'];
        const obsKeywords = expectedObsLower.split(/[,; ]+/).filter(w => w.length > 3 && !obsStopWords.includes(w));
        const obsMatches = obsKeywords.filter(w => obsLower.includes(w)).length;
        matchesDropwise = obsKeywords.length > 0 && obsMatches >= Math.min(2, obsKeywords.length);
      }

      if (t.id === 'q2_naoh' || t.id === 'q2_nh3') {
        if (expectedObsLower.includes('soluble in excess') || expectedObsLower.includes('dissolves in excess')) {
          matchesExcess = (obsLower.includes('soluble in excess') || obsLower.includes('dissolves in excess') || obsLower.includes('colorless solution') || obsLower.includes('colourless solution')) && !obsLower.includes('insoluble');
        } else if (expectedObsLower.includes('insoluble in excess')) {
          matchesExcess = obsLower.includes('insoluble in excess') || (obsLower.includes('insoluble') && !obsLower.includes('dissolves'));
        }
        
        if (matchesDropwise && matchesExcess) {
          obsMark = perHalfMax;
        } else if (matchesDropwise) {
          obsMark = parseFloat((perHalfMax * 0.4).toFixed(1));
        } else if (matchesExcess) {
          obsMark = parseFloat((perHalfMax * 0.6).toFixed(1));
        }
      } else {
        const obsStopWords = ['with', 'from', 'form', 'forms', 'formed', 'solution', 'added', 'give', 'gives', 'given', 'there', 'when', 'that', 'this', 'remain', 'remains'];
        const obsKeywords = (t.correctObs || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 3 && !obsStopWords.includes(w));
        const obsMatches = obsKeywords.filter(w => obsLower.includes(w)).length;
        if (obsMatches >= 2) {
          obsMark = perHalfMax;
        } else if (obsMatches >= 1 && obsKeywords.length <= 2) {
          obsMark = perHalfMax;
        } else if (obsMatches >= 1) {
          obsMark = parseFloat((perHalfMax * 0.5).toFixed(1));
        } else {
          obsMark = 0.0;
        }
      }

      if (obsLower.includes('dissolves') && obsLower.includes('insoluble in excess')) {
        obsMark = Math.max(0, obsMark - 0.5);
      }

      // Taboo scientific phrase penalty: "white solution" (-0.5 Mk)
      let tabooPenalty = 0.0;
      if (obsLower.includes('white solution')) {
        tabooPenalty = 0.5;
        obsMark = Math.max(0.0, obsMark - tabooPenalty);
      }
      testMark += obsMark;

      // 2. Inference Keyword Scoring
      let infMark = 0.0;
      const inferredIons = extractIons(candidateInf);

      if (t.id === 'q2_naoh') {
        const hasPb = inferredIons.includes('pb2+');
        const hasAl = inferredIons.includes('al3+');
        const hasZn = inferredIons.includes('zn2+');
        const countAmphoteric = [hasPb, hasAl, hasZn].filter(Boolean).length;
        
        if (countAmphoteric === 3) {
          infMark = perHalfMax;
        } else if (countAmphoteric === 2) {
          infMark = parseFloat((perHalfMax * 0.67).toFixed(1));
        } else if (countAmphoteric === 1) {
          infMark = parseFloat((perHalfMax * 0.33).toFixed(1));
        }
      } else if (t.id === 'q2_nh3') {
        const hasPb = inferredIons.includes('pb2+');
        const hasAl = inferredIons.includes('al3+');
        const hasZn = inferredIons.includes('zn2+');
        if (t.correctInf.includes('Pb') && (hasPb || hasAl) && !hasZn) {
          infMark = perHalfMax;
        } else if ((hasPb || hasAl) && hasZn) {
          infMark = parseFloat((perHalfMax * 0.67).toFixed(1));
        } else if (hasPb || hasAl) {
          infMark = parseFloat((perHalfMax * 0.67).toFixed(1));
        }
      } else {
        const infStopWords = ['the', 'and', 'ion', 'ions', 'may', 'present', 'absent', 'probable', 'suspected', 'confirmed', 'with', 'from'];
        const infKeywords = (t.correctInf || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 2 && !infStopWords.includes(w));
        const infMatches = infKeywords.filter(w => infLower.includes(w)).length;
        const cationMatched = t.trueCation && (inferredIons.includes(t.trueCation.toLowerCase().replace(/[^a-z0-9]/g, '')) || infLower.includes(t.trueCation.toLowerCase()));
        if (infMatches >= 2 || cationMatched) {
          infMark = perHalfMax;
        } else if (infMatches >= 1) {
          infMark = parseFloat((perHalfMax * 0.5).toFixed(1));
        } else {
          infMark = 0.0;
        }
      }

      // Contradictory Ion Penalty (-0.5 per contradictory ion, max 1.0)
      let contradictoryCount = 0;
      if (expectedObsLower.includes('white') && (inferredIons.includes('cu2+') || inferredIons.includes('fe2+') || inferredIons.includes('fe3+'))) {
        if (inferredIons.includes('cu2+')) contradictoryCount++;
        if (inferredIons.includes('fe2+')) contradictoryCount++;
        if (inferredIons.includes('fe3+')) contradictoryCount++;
      }
      if (t.id === 'q2_nh3' && expectedObsLower.includes('insoluble') && inferredIons.includes('zn2+')) {
        contradictoryCount++;
      }
      const ciPenalty = Math.min(1.0, contradictoryCount * 0.5);
      infMark = Math.max(0.0, infMark - ciPenalty);

      // Ionic Charge Penalty (-0.5 if letters written without charges)
      let chargePenalty = 0.0;
      const hasChargeSymbols = candidateInf.includes('+') || candidateInf.includes('-') || candidateInf.includes('²') || candidateInf.includes('³') || candidateInf.includes('ion');
      if (infMark > 0 && inferredIons.length > 0 && !hasChargeSymbols) {
        chargePenalty = 0.5;
        infMark = Math.max(0.0, infMark - chargePenalty);
      }

      testMark += infMark;
      score += testMark;

      rubric.push({
        code: `Q2_${String.fromCharCode(97 + idx)}`,
        item: `Test (${String.fromCharCode(97 + idx)}): ${t.prompt.substring(0, 45)}… [${testMark.toFixed(1)} / ${perTestMax.toFixed(1)} Mks]`,
        max: perTestMax,
        mark: parseFloat(testMark.toFixed(1)),
        pass: testMark >= (perTestMax * 0.6),
        detail: `Obs: [${obsMark.toFixed(1)}/${perHalfMax.toFixed(1)}] "${candidateObs || 'None'}" (Expected: "${t.correctObs}"). Infs: [${infMark.toFixed(1)}/${perHalfMax.toFixed(1)}] "${candidateInf || 'None'}" (Expected: "${t.correctInf}").${ciPenalty > 0 ? ` [CI Penalty: -${ciPenalty} Mk for contradictory ion(s)]` : ''}${chargePenalty > 0 ? ' [CP Penalty: -0.5 Mk for missing charge superscripts]' : ''}${tabooPenalty > 0 ? ' [Taboo Penalty: -0.5 Mk for writing "white solution"]' : ''}`
      });
    });

    // Cation & Anion Deductions (Only evaluated when hasDeduction is true)
    if (hasDeduction) {
      const catMax = 1.5;
      const aniMax = 1.5;
      const trueCation = (this.preset.q2.trueCation || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const candidateCation = (this.q2CationChoice || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cationCorrect = candidateCation.length > 0 && (candidateCation.includes(trueCation) || trueCation.includes(candidateCation));
      
      const hasCharge = this.q2CationChoice.includes('+') || this.q2CationChoice.includes('²') || this.q2CationChoice.includes('³') || this.q2CationChoice.toLowerCase().includes('ion');
      if (cationCorrect && hasCharge) {
        score += catMax;
        rubric.push({ code: 'Q2_CAT', item: `Cation Deduction (${this.preset.q2.trueCation})`, max: catMax, mark: catMax, pass: true, detail: 'Full mark (1.5 Mks): Correct cation with valid ionic charge.' });
      } else if (cationCorrect) {
        score += 1.0;
        rubric.push({ code: 'Q2_CAT', item: 'Cation Deduction (-0.5 Charge Penalty)', max: catMax, mark: 1.0, pass: false, detail: 'Element identified but missing ionic charge superscript.' });
      } else {
        rubric.push({ code: 'Q2_CAT', item: 'Cation Deduction', max: catMax, mark: 0.0, pass: false, detail: `Expected: ${this.preset.q2.trueCation}` });
      }

      const trueAnion = (this.preset.q2.trueAnion || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const candidateAnion = (this.q2AnionChoice || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const anionCorrect = candidateAnion.length > 0 && (candidateAnion.includes(trueAnion) || trueAnion.includes(candidateAnion));
      if (anionCorrect) {
        score += aniMax;
        rubric.push({ code: 'Q2_ANI', item: `Anion Deduction (${this.preset.q2.trueAnion})`, max: aniMax, mark: aniMax, pass: true, detail: 'Full mark (1.5 Mks): Correct anion identified.' });
      } else {
        rubric.push({ code: 'Q2_ANI', item: 'Anion Deduction', max: aniMax, mark: 0.0, pass: false, detail: `Expected: ${this.preset.q2.trueAnion}` });
      }
    }

    return {
      totalScore: Math.min(totalMarks, parseFloat(score.toFixed(1))),
      maxScore: totalMarks,
      rubric
    };
  }

  // ── Q3 Organic Operations ────────────────────────────────────────────
  setQ3Response(testId, obsText, infText) {
    this.q3Obs[testId] = obsText;
    this.q3Inf[testId] = infText;
  }

  setQ3Observation(testId, obsText) {
    this.q3Obs[testId] = obsText;
  }

  setQ3Inference(testId, infText) {
    this.q3Inf[testId] = infText;
  }

  setQ3Deduction(functionalGroup) {
    this.q3FunctionalGroupChoice = functionalGroup;
  }

  setQ3OrganicDeduction(functionalGroup) {
    this.setQ3Deduction(functionalGroup);
  }

  calculateQ3Score() {
    if (!this.preset || !this.preset.q3 || !Array.isArray(this.preset.q3.tests)) {
      return { totalScore: 0, maxScore: 0, rubric: [] };
    }
    let score = 0.0;
    const rubric = [];
    const tests = this.preset.q3.tests || [];
    const isQualitative = this.preset.q3.simulationType === 'qualitative' || this.preset.q3.trueSaltKey || (!this.preset.q3.trueFunctionalGroup && !this.preset.q3.trueOrganicKey);

    if (isQualitative) {
      // Qualitative Scoring for Question 3 (e.g. Solid P)
      const perTestMax = tests.length > 0 ? parseFloat((10.0 / tests.length).toFixed(1)) : 2.0;
      const perHalfMax = parseFloat((perTestMax / 2.0).toFixed(1));
      const obsStopWords = ['with', 'from', 'form', 'forms', 'formed', 'solution', 'added', 'give', 'gives', 'given', 'there', 'when', 'that', 'this', 'remain', 'remains'];
      const infStopWords = ['the', 'and', 'ion', 'ions', 'may', 'present', 'absent', 'probable', 'suspected', 'confirmed', 'with', 'from'];

      tests.forEach((t, idx) => {
        const candidateObs = normalizeChemString(this.q3Obs[t.id] || '');
        const candidateInf = normalizeChemString(this.q3Inf[t.id] || '');
        let testMark = 0.0;

        let obsMark = 0.0;
        const expectedObs = normalizeChemString(t.correctObs || t.observation || '');
        const obsKeywords = expectedObs.split(' ').filter(w => w.length > 2 && !obsStopWords.includes(w));
        const obsMatches = obsKeywords.filter(w => candidateObs.includes(w)).length;
        if (candidateObs.length > 4 && obsMatches >= Math.min(2, obsKeywords.length) && obsKeywords.length > 0) {
          obsMark = perHalfMax;
        } else if (candidateObs.length > 4 && obsMatches >= 1) {
          obsMark = obsKeywords.length <= 2 ? perHalfMax : parseFloat((perHalfMax / 2).toFixed(1));
        } else {
          obsMark = 0.0;
        }

        let infMark = 0.0;
        const expectedInf = normalizeChemString(t.correctInf || t.inference || '');
        const infKeywords = expectedInf.split(' ').filter(w => w.length > 1 && !infStopWords.includes(w));
        const infMatches = infKeywords.filter(w => candidateInf.includes(w)).length;
        if (candidateInf.length > 2 && infMatches >= Math.min(2, infKeywords.length) && infKeywords.length > 0) {
          infMark = perHalfMax;
        } else if (candidateInf.length > 2 && infMatches >= 1) {
          infMark = infKeywords.length <= 2 ? perHalfMax : parseFloat((perHalfMax / 2).toFixed(1));
        } else {
          infMark = 0.0;
        }

        testMark = parseFloat((obsMark + infMark).toFixed(1));
        score += testMark;

        rubric.push({
          code: `Q3_${String.fromCharCode(97 + idx)}`,
          item: `Inorganic Test (${String.fromCharCode(97 + idx)}): ${(t.prompt || '').substring(0, 45)}… [${testMark.toFixed(1)} / ${perTestMax.toFixed(1)} Mks]`,
          max: perTestMax,
          mark: testMark,
          pass: testMark >= (perTestMax * 0.7),
          detail: `Obs: [${obsMark.toFixed(1)}/${perHalfMax.toFixed(1)}] "${this.q3Obs[t.id] || 'None'}" (Expected: "${t.correctObs || t.observation || 'Valid observation'}"). Infs: [${infMark.toFixed(1)}/${perHalfMax.toFixed(1)}] "${this.q3Inf[t.id] || 'None'}" (Expected: "${t.correctInf || t.inference || 'Valid inference'}").`
        });
      });

      return {
        totalScore: Math.min(10.0, parseFloat(score.toFixed(1))),
        maxScore: 10.0,
        rubric
      };
    }

    // Standard Organic Scoring
    const orgObsStopWords = ['with', 'from', 'form', 'forms', 'formed', 'solution', 'added', 'give', 'gives', 'given', 'there', 'when', 'that', 'this', 'remain', 'remains', 'paper', 'papers'];
    const orgInfStopWords = ['the', 'and', 'ion', 'ions', 'may', 'probable', 'suspected', 'confirmed', 'with', 'from', 'compound', 'substance'];

    tests.forEach((t, idx) => {
      const candidateObs = normalizeChemString(this.q3Obs[t.id] || '');
      const candidateInf = normalizeChemString(this.q3Inf[t.id] || '');
      let testMark = 0.0;

      let obsMark = 0.0;
      const expectedObs = normalizeChemString(t.correctObs || '');
      const obsKeywords = expectedObs.split(' ').filter(w => w.length > 2 && !orgObsStopWords.includes(w));
      const obsMatches = obsKeywords.filter(w => candidateObs.includes(w)).length;

      const expectedHasNeutralLitmus = (expectedObs.includes('neutral') || expectedObs.includes('retain')) && expectedObs.includes('litmus');
      const candidateHasNeutralLitmus = (candidateObs.includes('no change') || candidateObs.includes('retains') || candidateObs.includes('retain') || candidateObs.includes('neutral')) && candidateObs.includes('litmus');

      const expectedHasNoEffervescence = expectedObs.includes('no effervesc') || expectedObs.includes('no gas');
      const candidateHasNoEffervescence = (candidateObs.includes('no effervesc') || candidateObs.includes('no gas') || candidateObs.includes('no bubbl')) && !candidateObs.includes('brisk');

      if (expectedHasNeutralLitmus && candidateHasNeutralLitmus) {
        obsMark = 1.0;
      } else if (expectedHasNeutralLitmus && !candidateHasNeutralLitmus) {
        obsMark = 0.0;
      } else if (expectedHasNoEffervescence && candidateHasNoEffervescence) {
        obsMark = 1.0;
      } else if (expectedHasNoEffervescence && !candidateHasNoEffervescence) {
        obsMark = 0.0;
      } else if (candidateObs.length > 4 && obsMatches >= Math.min(2, obsKeywords.length) && obsKeywords.length > 0) {
        obsMark = 1.0;
      } else if (candidateObs.length > 4 && obsMatches >= 2) {
        obsMark = 0.5;
      } else {
        obsMark = 0.0;
      }

      let infMark = 0.0;
      const expectedInf = normalizeChemString(t.correctInf || '');
      const infKeywords = expectedInf.split(' ').filter(w => w.length > 1 && !orgInfStopWords.includes(w));
      const infMatches = infKeywords.filter(w => candidateInf.includes(w)).length;

      const expectedHasNeutral = expectedInf.includes('neutral');
      const expectedHasAbsentAcid = (expectedInf.includes('carboxylic') || expectedInf.includes('cooh')) && expectedInf.includes('absent');
      const candidateHasAbsentAcid = (candidateInf.includes('carboxylic') || candidateInf.includes('cooh') || candidateInf.includes('acid')) && candidateInf.includes('absent');

      if (expectedHasNeutral && candidateInf.includes('neutral')) {
        infMark = 1.0;
      } else if (expectedHasAbsentAcid && candidateHasAbsentAcid) {
        infMark = 1.0;
      } else if (expectedHasNeutral && (candidateInf.includes('acid') || candidateInf.includes('base') || candidateInf.includes('alkali'))) {
        infMark = 0.0;
      } else if (expectedHasAbsentAcid && (candidateInf.includes('present') || candidateInf.includes('acid')) && !candidateInf.includes('absent')) {
        infMark = 0.0;
      } else if (candidateInf.length > 3 && infMatches >= Math.min(2, infKeywords.length) && infKeywords.length > 0) {
        infMark = 1.0;
      } else if (candidateInf.length > 3 && infMatches >= 2) {
        infMark = 0.5;
      } else {
        infMark = 0.0;
      }

      if (expectedObs.includes('no effervescence') && (candidateInf.includes('carboxylic acid present') || candidateInf.includes('cooh present') || candidateInf.includes('acid present'))) {
        infMark = 0.0;
      }

      testMark = obsMark + infMark;
      score += testMark;

      rubric.push({
        code: `Q3_${String.fromCharCode(97 + idx)}`,
        item: `Organic Test (${String.fromCharCode(97 + idx)}): ${(t.prompt || '').substring(0, 45)}… [${testMark.toFixed(1)} / 2.0 Mks]`,
        max: 2.0,
        mark: parseFloat(testMark.toFixed(1)),
        pass: testMark >= 1.5,
        detail: `Obs: [${obsMark.toFixed(1)}/1.0] (Expected: "${t.correctObs}"). Inf: [${infMark.toFixed(1)}/1.0] (Expected: "${t.correctInf}").`
      });
    });

    // Functional Group Deduction (2.0 Marks)
    const trueFG = (this.preset.q3.trueFunctionalGroup || '').toLowerCase();
    const candidateFG = (this.q3FunctionalGroupChoice || '').toLowerCase();
    
    let fgMark = 0.0;
    let fgDetail = '';
    const hasClass = (trueFG.includes('alkanol') && candidateFG.includes('alkanol')) ||
                     (trueFG.includes('carboxylic') && candidateFG.includes('carboxylic')) ||
                     (trueFG.includes('alkene') && candidateFG.includes('alkene'));
    const hasSymbol = (trueFG.includes('oh') && (candidateFG.includes('oh') || candidateFG.includes('—oh') || candidateFG.includes('-oh'))) ||
                      (trueFG.includes('cooh') && (candidateFG.includes('cooh') || candidateFG.includes('—cooh') || candidateFG.includes('-cooh'))) ||
                      (trueFG.includes('c=c') && candidateFG.includes('c=c'));

    if (hasClass && hasSymbol) {
      fgMark = 2.0;
      fgDetail = `Full mark (2.0 Mks): Both class name and functional group formula correctly identified (${this.preset.q3.trueFunctionalGroup}).`;
    } else if (hasClass || hasSymbol || candidateFG.includes(trueFG) || trueFG.includes(candidateFG)) {
      fgMark = 1.0;
      fgDetail = `Partial mark (1.0 Mk): Identified class or symbol but missing complete KNEC specification (${this.preset.q3.trueFunctionalGroup}).`;
    } else {
      fgMark = 0.0;
      fgDetail = `0.0 Mark: Expected ${this.preset.q3.trueFunctionalGroup}.`;
    }
    score += fgMark;
    rubric.push({
      code: 'Q3_FG',
      item: 'Final Functional Group Deduction (2.0 Marks)',
      max: 2.0,
      mark: fgMark,
      pass: fgMark === 2.0,
      detail: fgDetail
    });

    return {
      totalScore: Math.min(10.0, parseFloat(score.toFixed(1))),
      maxScore: 10.0,
      rubric
    };
  }

  // ── Step-by-Step Mathematical Worked Solution Model ──────────────────
  generateWorkedSolutions() {
    if (!this.preset || !this.preset.q1) return {};
    let questionsList = this.preset.q1.questions;
    if (!questionsList || questionsList.length === 0) {
      if (this.preset.q1.hasMultipleProcedures && Array.isArray(this.preset.q1.procedures)) {
        questionsList = this.preset.q1.procedures.flatMap(p => p.questions || []);
      }
      if (!questionsList || questionsList.length === 0) {
        questionsList = createStandardTitrationQuestions(this.preset.q1);
      }
    }
    const v1 = Number(this.preset.q1.trueTitre) || 25.00;

    const evalCtx = {
      trueTitre: v1,
      expAvgFromTrials: v1,
      trueAcidMolarity: Number(this.preset.q1.trueAcidMolarity) || 0.100,
      trueBaseMolarity: Number(this.preset.q1.trueBaseMolarity) || 0.100,
      pipetteVol: Number(this.preset.q1.pipetteVolume) || 25.0,
      ratioA: Number(this.preset.q1.moleRatioAcid || this.preset.q1.ratioA) || 1,
      ratioB: Number(this.preset.q1.moleRatioBase || this.preset.q1.ratioB) || 1,
      acidRfm: Number(this.preset.q1.acidRfm) || 36.5,
      baseRfm: Number(this.preset.q1.baseRfm) || 40.0,
      answers: {},
      t1: v1,
      t2: v1,
      v1: v1
    };

    const worked = {};
    questionsList.forEach((q, idx) => {
      const qKey = (q.letter || q.id || `q${idx + 1}`).toString();
      const stepKey = `step_${qKey}`;
      const camelKey = `step${qKey.toUpperCase()}`;
      let resultStr = '';
      if (typeof q.calcTheoretical === 'function') {
        const val = q.calcTheoretical(evalCtx);
        if (typeof val === 'number') {
          if (q.field === 'molesA' || q.field === 'molesB') {
            resultStr = `${val.toFixed(5)} mol`;
          } else if (q.field === 'avgTitre') {
            resultStr = `${val.toFixed(2)} cm³`;
          } else {
            resultStr = `${val.toFixed(3)} ${q.unit || ''}`.trim();
          }
        }
      }
      worked[stepKey] = {
        letter: q.letter,
        title: `(${q.letter}) ${q.label}`,
        result: resultStr,
        workingHtml: typeof q.working === 'function' ? q.working(evalCtx) : `Standard stoichiometric calculation.`
      };
      worked[camelKey] = worked[stepKey];
    });

    return worked;
  }

  // ── Comprehensive 40-Mark Evaluation & KNEC Examiner Diagnosis ──────
  evaluateExam() {
    const q1Res = this.calculateQ1Score();
    const q2Res = this.calculateQ2Score();
    const q3Res = this.calculateQ3Score();
    const workedSolutions = this.generateWorkedSolutions();

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

    // Formulate Chief Examiner Diagnostic Insights
    const diagnosticNotes = [];
    if (q1Res.totalScore < 10) {
      diagnosticNotes.push('Volumetric Stoichiometry: Review concordancy rules, method marks, and concentration relationships.');
    }
    if (q2Res.totalScore < 10) {
      diagnosticNotes.push('Qualitative Inferences: Master listing amphoteric cations (Pb²⁺, Al³⁺, Zn²⁺) in excess NaOH and observing confirmatory tests.');
    }
    if (q3Res.totalScore < 7) {
      diagnosticNotes.push('Organic Analysis: Master distinguishing saturated vs unsaturated hydrocarbons using Bromine water and acidified KMnO₄.');
    }

    const competencyMetrics = this.computeCompetencyMetrics({
      q1Score: q1Res.totalScore,
      q2Score: q2Res.totalScore,
      q3Score: q3Res.totalScore,
      q1Details: q1Res,
      q2Details: q2Res,
      q3Details: q3Res
    });

    return {
      examTitle: this.preset.title,
      seriesKey: this.preset.seriesKey || 'series_1',
      mode: this.mode,
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
      competencyMetrics,
      workedSolutions,
      diagnosticNotes,
      durationSeconds: Math.round((Date.now() - this.startTime) / 1000)
    };
  }

  // ── Multi-Axis KNEC Competency Radar & Diagnostic Analytics ───────────
  computeCompetencyMetrics(evalData = null) {
    const data = evalData || {
      q1Details: this.calculateQ1Score(),
      q2Details: this.calculateQ2Score(),
      q3Details: this.calculateQ3Score()
    };
    const q1Rubric = (data.q1Details && data.q1Details.rubric) || [];
    const q2Details = data.q2Details || {};
    const q3Details = data.q3Details || {};

    // 1. Titrimetric Accuracy (AC/FA)
    const acItems = q1Rubric.filter(r => r.code && (r.code === 'AC' || r.code === 'FA' || r.code.endsWith('_AC') || r.code.endsWith('_FA')));
    const acEarned = acItems.reduce((acc, r) => acc + (r.mark || 0), 0);
    const acMax = acItems.reduce((acc, r) => acc + (r.max || 0), 0) || 2.0;
    const acPct = Math.min(100, Math.round((acEarned / acMax) * 100));

    // 2. Decimal Precision (D)
    const dItems = q1Rubric.filter(r => r.code && (r.code === 'D' || r.code.endsWith('_D')));
    const dEarned = dItems.reduce((acc, r) => acc + (r.mark || 0), 0);
    const dMax = dItems.reduce((acc, r) => acc + (r.max || 0), 0) || 1.0;
    const dPct = Math.min(100, Math.round((dEarned / dMax) * 100));

    // 3. Principles of Averaging (PA)
    const paItems = q1Rubric.filter(r => r.code && (r.code === 'PA' || r.code.endsWith('_PA')));
    const paEarned = paItems.reduce((acc, r) => acc + (r.mark || 0), 0);
    const paMax = paItems.reduce((acc, r) => acc + (r.max || 0), 0) || 1.0;
    const paPct = Math.min(100, Math.round((paEarned / paMax) * 100));

    // 4. Inorganic Confirmatory Tests
    const isQ2Inorg = this.preset?.q2?.simulationType !== 'organic';
    const isQ3Inorg = this.preset?.q3?.simulationType === 'qualitative' || this.preset?.q3?.trueSaltKey || (this.preset?.q3?.sampleName && /solid/i.test(this.preset?.q3?.sampleName));

    let inorgEarned = 0;
    let inorgMax = 0;
    if (isQ2Inorg) {
      inorgEarned += Number(q2Details.totalScore) || 0;
      inorgMax += Number(q2Details.maxScore) || 15.0;
    }
    if (isQ3Inorg) {
      inorgEarned += Number(q3Details.totalScore) || 0;
      inorgMax += Number(q3Details.maxScore) || 10.0;
    }
    const inorgPct = inorgMax > 0 ? Math.min(100, Math.round((inorgEarned / inorgMax) * 100)) : 0;

    // 5. Organic Deductions & SSS
    let orgEarned = 0;
    let orgMax = 0;
    if (!isQ2Inorg) {
      orgEarned += Number(q2Details.totalScore) || 0;
      orgMax += Number(q2Details.maxScore) || 10.0;
    }
    if (!isQ3Inorg) {
      orgEarned += Number(q3Details.totalScore) || 0;
      orgMax += Number(q3Details.maxScore) || 10.0;
    }
    const orgPct = orgMax > 0 ? Math.min(100, Math.round((orgEarned / orgMax) * 100)) : 0;

    // National Cohort Benchmarks (KNEC historical mock standards)
    const cohortBenchmarks = {
      ac: 58,
      d: 72,
      pa: 64,
      inorg: 54,
      org: 46
    };

    const overallIndex = Math.round((acPct + dPct + paPct + inorgPct + orgPct) / 5);
    const cohortIndex = Math.round((cohortBenchmarks.ac + cohortBenchmarks.d + cohortBenchmarks.pa + cohortBenchmarks.inorg + cohortBenchmarks.org) / 5);

    return {
      labels: [
        'Accuracy (AC/FA)',
        'Decimals (D)',
        'Averaging (PA)',
        'Inorganic Tests',
        'Organic Deductions'
      ],
      candidateScores: [acPct, dPct, paPct, inorgPct, orgPct],
      cohortBenchmarks: [cohortBenchmarks.ac, cohortBenchmarks.d, cohortBenchmarks.pa, cohortBenchmarks.inorg, cohortBenchmarks.org],
      overallIndex,
      cohortIndex,
      delta: overallIndex - cohortIndex,
      metrics: {
        accuracy: {
          label: 'Titrimetric Accuracy (AC/FA)',
          code: 'AC/FA',
          candidate: acPct,
          cohort: cohortBenchmarks.ac,
          earned: acEarned,
          max: acMax,
          status: acPct >= 80 ? 'Mastery' : (acPct >= 50 ? 'Competent' : 'Needs Review'),
          feedback: acPct >= 80
            ? 'Exceptional burette precision within ±0.10 cm³ of school standard value.'
            : (acPct >= 50 ? 'Acceptable titre closeness (±0.20 cm³). Swirl continuously and add dropwise near endpoint.'
                           : 'Titre deviated > ±0.20 cm³. Eliminate meniscus parallax and avoid over-titrating past endpoint.')
        },
        decimals: {
          label: 'Decimal Precision (D)',
          code: 'D',
          candidate: dPct,
          cohort: cohortBenchmarks.d,
          earned: dEarned,
          max: dMax,
          status: dPct >= 80 ? 'Mastery' : 'Needs Review',
          feedback: dPct >= 80
            ? 'Flawless adherence to KNEC 2 d.p. convention terminating strictly in .00 or .05.'
            : 'KNEC penalizes readings not terminating in .00 or .05 (e.g. 24.3 cm³ or 24.32 cm³).'
        },
        averaging: {
          label: 'Principles of Averaging (PA)',
          code: 'PA',
          candidate: paPct,
          cohort: cohortBenchmarks.pa,
          earned: paEarned,
          max: paMax,
          status: paPct >= 80 ? 'Mastery' : (paPct >= 50 ? 'Competent' : 'Needs Review'),
          feedback: paPct >= 80
            ? 'Concordant titres correctly identified within ±0.20 cm³ and accurately averaged.'
            : 'Select only concordant titres within ±0.20 cm³ and show clear arithmetic average working.'
        },
        inorganic: {
          label: 'Inorganic Confirmatory Tests',
          code: 'INORG',
          candidate: inorgPct,
          cohort: cohortBenchmarks.inorg,
          earned: inorgEarned,
          max: inorgMax,
          status: inorgPct >= 80 ? 'Mastery' : (inorgPct >= 50 ? 'Competent' : 'Needs Review'),
          feedback: inorgPct >= 80
            ? 'Strong diagnostic mastery of precipitate formation, amphoteric solubility, and ionic deductions.'
            : (inorgPct >= 50 ? 'Good basic deductions. Consolidate confirmatory reagents (e.g. Ba(NO₃)₂ / acidified K₂Cr₂O₇).'
                              : 'Review cation/anion flowchart, precipitate color distinctions, and ionic charge notations.')
        },
        organic: {
          label: 'Organic Deductions & SSS',
          code: 'ORG',
          candidate: orgPct,
          cohort: cohortBenchmarks.org,
          earned: orgEarned,
          max: orgMax,
          status: orgPct >= 80 ? 'Mastery' : (orgPct >= 50 ? 'Competent' : 'Needs Review'),
          feedback: orgPct >= 80
            ? 'Exemplary identification of unsaturation (>C=C< / -C≡C-), carboxylic groups, and flame tests.'
            : (orgPct >= 50 ? 'Satisfactory. Distinguish decolourization with KMnO₄ vs effervescence with NaHCO₃.'
                            : 'Specify exact open bonds (>C=C<, -COOH) and burning smoke characteristics clearly.')
        }
      }
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
        seriesKey: evalData.seriesKey,
        mode: evalData.mode,
        percentage: evalData.percentage,
        q1: evalData.q1Details,
        q2: evalData.q2Details,
        q3: evalData.q3Details,
        competencyMetrics: evalData.competencyMetrics,
        workedSolutions: evalData.workedSolutions,
        diagnosticNotes: evalData.diagnosticNotes,
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
  window.generateRandomCompositePreset = generateRandomCompositePreset;
  window.createStandardTitrationQuestions = createStandardTitrationQuestions;
  window.createWaterOfCrystallizationQuestions = createWaterOfCrystallizationQuestions;
  window.createPercentagePurityQuestions = createPercentagePurityQuestions;
  window.createRamMetalQuestions = createRamMetalQuestions;
  window.getAnswerValue = getAnswerValue;
  window.sanitizeAnalyteDisplay = sanitizeAnalyteDisplay;
  window.sanitizeInstructions = sanitizeInstructions;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COMPOSITE_EXAM_PRESETS,
    CompositeExamEngine,
    generateRandomCompositePreset,
    createStandardTitrationQuestions,
    createWaterOfCrystallizationQuestions,
    createPercentagePurityQuestions,
    createRamMetalQuestions,
    getAnswerValue,
    sanitizeAnalyteDisplay,
    sanitizeInstructions
  };
}

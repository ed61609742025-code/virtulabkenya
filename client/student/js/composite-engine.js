// ============================================================
//  VirtuLab Kenya — KCSE Composite Chemistry Practical Engine
//  KNEC Paper 3 (233/3) 40-Mark Standardized Examination Engine
//  Syllabus-Aligned with KNEC Table of Specifications & Bloom's Taxonomy
// ============================================================

/**
 * Standard KNEC Question 1 Calculation Schema Generators
 */
function createStandardTitrationQuestions(q1Config) {
  const rfmAcid = q1Config.acidRfm || 36.5;
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
      check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.15,
      feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
      feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
      working: (ctx) => `<b>(a) Average Titre:</b> V₁ = (${ctx.t1.toFixed(2)} + ${ctx.t2.toFixed(2)}) / 2 = <b>${ctx.v1.toFixed(2)} cm³</b>`
    },
    {
      id: 'step_b',
      letter: 'b',
      field: 'molesB',
      label: `Calculate the number of moles of solute in ${Number(q1Config.pipetteVolume || 25.0).toFixed(1)} cm³ of Solution B`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00250',
      step: '0.0001',
      unit: 'moles',
      calcTheoretical: (ctx) => (ctx.trueBaseMolarity * ctx.pipetteVol) / 1000.0,
      calcEcf: (ctx) => (ctx.trueBaseMolarity * ctx.pipetteVol) / 1000.0,
      check: (val, ctx, exp) => Math.abs(val - exp) / (exp || 1) <= 0.08,
      feedbackSuccess: (val) => `✓ Correct: ${val} moles.`,
      feedbackFail: (ctx, exp) => `Formula: (Molarity of Base × Pipette Volume) / 1000 = ${exp.toFixed(5)} mol.`,
      working: (ctx) => `<b>(b) Moles of Solute in ${ctx.pipetteVol.toFixed(1)} cm³:</b> (${ctx.trueBaseMolarity.toFixed(3)} × ${ctx.pipetteVol.toFixed(1)}) / 1000 = <b>${((ctx.trueBaseMolarity * ctx.pipetteVol) / 1000.0).toFixed(5)} mol</b>`
    },
    {
      id: 'step_c',
      letter: 'c',
      field: 'molesA',
      label: `Chemical reaction stoichiometry and moles of Solution A reacted in V₁`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00250',
      step: '0.0001',
      unit: 'moles of Solution A',
      calcTheoretical: (ctx) => ((ctx.trueBaseMolarity * ctx.pipetteVol) / 1000.0) * (ctx.ratioA / ctx.ratioB),
      calcEcf: (ctx) => {
        const mb = parseFloat(ctx.answers.molesB) || ((ctx.trueBaseMolarity * ctx.pipetteVol) / 1000.0);
        return mb * (ctx.ratioA / ctx.ratioB);
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of Solution A.`,
      feedbackFail: (ctx, expTheo) => `Expected around ${expTheo.toFixed(5)} mol based on mole ratio ${ctx.ratioA}:${ctx.ratioB}.`,
      working: (ctx) => `<b>(c) Moles of Solution A:</b> Moles of B × (${ctx.ratioA}/${ctx.ratioB}) = <b>${(((ctx.trueBaseMolarity * ctx.pipetteVol) / 1000.0) * (ctx.ratioA / ctx.ratioB)).toFixed(5)} mol</b>`
    },
    {
      id: 'step_d',
      letter: 'd',
      field: 'molarityA',
      label: 'Calculate the molar concentration (molarity) of Solution A in mol/dm³',
      marks: 3.0,
      marksLabel: '(3.0 Marks)',
      placeholder: 'e.g. 0.100',
      step: '0.001',
      unit: 'mol/dm³ (M)',
      calcTheoretical: (ctx) => ctx.trueAcidMolarity,
      calcEcf: (ctx) => {
        const ma = parseFloat(ctx.answers.molesA) || (((ctx.trueBaseMolarity * ctx.pipetteVol) / 1000.0) * (ctx.ratioA / ctx.ratioB));
        const v1 = parseFloat(ctx.answers.avgTitre) || ctx.trueTitre;
        return (ma * 1000.0) / (v1 || 25.0);
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Molarity = ${val} mol/dm³.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Moles of Acid × 1000) / V₁ = ${expTheo.toFixed(3)} M.`,
      working: (ctx) => `<b>(d) Molar Concentration of Acid:</b> (Moles of Acid × 1000) / V₁ = <b>${ctx.trueAcidMolarity.toFixed(3)} mol/dm³</b>`
    },
    {
      id: 'step_e',
      letter: 'e',
      field: 'concGrams',
      label: `Calculate the concentration of Solution A in g/dm³ (RFM = ${rfmAcid})`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 3.65',
      step: '0.01',
      unit: 'g/dm³',
      calcTheoretical: (ctx) => ctx.trueAcidMolarity * rfmAcid,
      calcEcf: (ctx) => {
        const molarity = parseFloat(ctx.answers.molarityA) || ctx.trueAcidMolarity;
        return molarity * rfmAcid;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Concentration = ${val} g/dm³.`,
      feedbackFail: (ctx, expTheo) => `Formula: Molarity × RFM (${rfmAcid}) = ${expTheo.toFixed(2)} g/dm³.`,
      working: (ctx) => `<b>(e) Mass Concentration of Acid:</b> ${ctx.trueAcidMolarity.toFixed(3)} M × ${rfmAcid} = <b>${(ctx.trueAcidMolarity * rfmAcid).toFixed(2)} g/dm³</b>`
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
      check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.15,
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
        const v1 = parseFloat(ctx.answers.avgTitre) || ctx.trueTitre;
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
        const ma = parseFloat(ctx.answers.molesA) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
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
        const mb = parseFloat(ctx.answers.molesB) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5);
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
        const molarity = parseFloat(ctx.answers.molarityB) || ctx.trueBaseMolarity;
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
        const rfm = parseFloat(ctx.answers.rfmHydrated) || (soluteMass / ctx.trueBaseMolarity);
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
      check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.15,
      feedbackSuccess: (val) => `✓ Correct: V₁ = ${val.toFixed(2)} cm³.`,
      feedbackFail: (ctx) => `Check your average from concordant titres (expected around ${ctx.expAvgFromTrials.toFixed(2)} cm³).`,
      working: (ctx) => `<b>(a) Average Titre:</b> V₁ = <b>${ctx.v1.toFixed(2)} cm³</b>`
    },
    {
      id: 'step_b',
      letter: 'b',
      field: 'molesA',
      label: 'Calculate the number of moles of hydrochloric acid in the average volume V₁',
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00262',
      step: '0.0001',
      unit: 'moles of HCl',
      calcTheoretical: (ctx) => (ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0,
      calcEcf: (ctx) => {
        const v1 = parseFloat(ctx.answers.avgTitre) || ctx.trueTitre;
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
      label: `Calculate the number of moles of pure sodium carbonate present in ${Number(q1Config.pipetteVolume || 25.0).toFixed(1)} cm³ of Solution B`,
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.00131',
      step: '0.0001',
      unit: 'moles of pure Na₂CO₃',
      calcTheoretical: (ctx) => ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5,
      calcEcf: (ctx) => {
        const ma = parseFloat(ctx.answers.molesA) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
        return ma * 0.5;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: ${val} moles of pure Na₂CO₃.`,
      feedbackFail: (ctx, expTheo) => `Formula: Moles of Acid / 2 = ${expTheo.toFixed(5)} mol.`,
      working: (ctx) => `<b>(c) Moles of pure Na₂CO₃:</b> Moles of Acid / 2 = <b>${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5).toFixed(5)} mol</b>`
    },
    {
      id: 'step_d',
      letter: 'd',
      field: 'molarityB',
      label: 'Determine the molar concentration of pure sodium carbonate in Solution B in mol/dm³',
      marks: 2.0,
      marksLabel: '(2.0 Marks)',
      placeholder: 'e.g. 0.0524',
      step: '0.0001',
      unit: 'mol/dm³ (M)',
      calcTheoretical: (ctx) => (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5 * 1000.0) / ctx.pipetteVol,
      calcEcf: (ctx) => {
        const mb = parseFloat(ctx.answers.molesB) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5);
        return (mb * 1000.0) / ctx.pipetteVol;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Molarity = ${val} mol/dm³.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Moles of Na₂CO₃ × 1000) / 25.0 = ${expTheo.toFixed(4)} M.`,
      working: (ctx) => `<b>(d) Molarity of pure Na₂CO₃:</b> (${(((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5).toFixed(5)} × 1000) / ${ctx.pipetteVol.toFixed(1)} = <b>${((((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5 * 1000.0) / ctx.pipetteVol).toFixed(4)} M</b>`
    },
    {
      id: 'step_e',
      letter: 'e',
      field: 'massPure',
      label: `Calculate the mass of pure sodium carbonate present in 1000 cm³ of Solution B (RFM = ${pureRfm})`,
      marks: 1.5,
      marksLabel: '(1.5 Marks)',
      placeholder: 'e.g. 5.55',
      step: '0.01',
      unit: 'g',
      calcTheoretical: (ctx) => ((((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5 * 1000.0) / ctx.pipetteVol) * pureRfm,
      calcEcf: (ctx) => {
        const molarity = parseFloat(ctx.answers.molarityB) || ((((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5 * 1000.0) / ctx.pipetteVol);
        return molarity * pureRfm;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) / (expTheo || 1) <= 0.08) || (Math.abs(val - expEcf) / (expEcf || 1) <= 0.08),
      feedbackSuccess: (val) => `✓ Correct: Pure mass = ${val} g.`,
      feedbackFail: (ctx, expTheo) => `Formula: Molarity × RFM (${pureRfm}) = ${expTheo.toFixed(2)} g.`,
      working: (ctx) => `<b>(e) Mass of pure Na₂CO₃ in 1 dm³:</b> Molarity × 106.0 = <b>${(((((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5 * 1000.0) / ctx.pipetteVol) * pureRfm).toFixed(2)} g</b>`
    },
    {
      id: 'step_f',
      letter: 'f',
      field: 'percentagePurity',
      label: `Determine the percentage purity of the commercial sodium carbonate sample (Sample mass = ${totalSampleMass.toFixed(2)} g)`,
      marks: 1.5,
      marksLabel: '(1.5 Marks)',
      placeholder: 'e.g. 92.6',
      step: '0.1',
      unit: '%',
      calcTheoretical: (ctx) => ((((((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5 * 1000.0) / ctx.pipetteVol) * pureRfm) / totalSampleMass) * 100.0,
      calcEcf: (ctx) => {
        const pureMass = parseFloat(ctx.answers.massPure) || ((((((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5 * 1000.0) / ctx.pipetteVol) * pureRfm));
        return (pureMass / totalSampleMass) * 100.0;
      },
      check: (val, ctx, expTheo, expEcf) => (Math.abs(val - expTheo) <= 1.2) || (Math.abs(val - expEcf) <= 1.2),
      feedbackSuccess: (val) => `✓ Correct! Percentage purity = ${val.toFixed(1)}%.`,
      feedbackFail: (ctx, expTheo) => `Formula: (Mass of pure sample / Total sample mass ${totalSampleMass}) × 100% = ${expTheo.toFixed(1)}%.`,
      working: (ctx) => `<b>(f) Percentage Purity:</b> (Pure Mass / ${totalSampleMass.toFixed(2)} g) × 100% = <b>${(((((((ctx.trueAcidMolarity * ctx.v1) / 1000.0) * 0.5 * 1000.0) / ctx.pipetteVol) * pureRfm) / totalSampleMass) * 100.0).toFixed(1)}%</b>`
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
      check: (val, ctx) => Math.abs(val - ctx.expAvgFromTrials) <= 0.15,
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
        const v1 = parseFloat(ctx.answers.avgTitre) || ctx.trueTitre;
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
        const ma = parseFloat(ctx.answers.molesA) || ((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0);
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
        const mb = parseFloat(ctx.answers.molesB) || (((ctx.trueAcidMolarity * ctx.trueTitre) / 1000.0) * 0.5);
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
        const molarity = parseFloat(ctx.answers.molarityB) || ctx.trueBaseMolarity;
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
        const rfm = parseFloat(ctx.answers.rfmCarbonate) || (soluteMass / ctx.trueBaseMolarity);
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
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      instructions: 'Pipette 25.0 cm³ of Solution B into a clean conical flask. Add 2–3 drops of phenolphthalein indicator. Titrate with Solution A until the pink color discharges sharply to colorless.',
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
      solutionB: 'Acidified Ammonium Iron(II) Sulfate [(NH₄)₂Fe(SO₄)₂·6H₂O] (39.2 g/dm³)',
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
      questions: createStandardTitrationQuestions({ acidRfm: 392.0, pipetteVolume: 25.0 })
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
          id: 'q3_kmno4',
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
      solutionB: '0.100 M Sodium Hydroxide (NaOH) containing 4.00 g/dm³',
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
      questions: createStandardTitrationQuestions({ acidRfm: 126.0, pipetteVolume: 25.0 })
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
          prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by AgNO₃ solution.',
          correctObs: 'White precipitate formed, dissolves readily upon addition of aqueous ammonia',
          correctInf: 'Cl⁻ confirmed present (AgCl formed)'
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
          id: 'q3_kmno4',
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
  }
};

// Aliases for backwards compatibility
COMPOSITE_EXAM_PRESETS.standard_1 = COMPOSITE_EXAM_PRESETS.series_1;
COMPOSITE_EXAM_PRESETS.standard_2 = COMPOSITE_EXAM_PRESETS.series_2;

/**
 * Generate a dynamic randomized KCSE Paper 3 practical exam
 */
function generateRandomCompositePreset() {
  const seriesKeys = ['series_1', 'series_2', 'series_3', 'series_4', 'series_5', 'series_6'];
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
        { id: 'q2_anion', prompt: '(iv) Add AgNO₃ followed by dilute HNO₃.', correctObs: 'White precipitate formed, soluble in aqueous ammonia', correctInf: 'Cl⁻ confirmed present' }
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
  if (key.includes('alkene') || key.includes('cyclohexene') || key.includes('unsaturated')) {
    return {
      trueOrganicKey: 'Cyclohexene',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      sampleDesc: 'A clear, volatile organic liquid.',
      tests: [
        { id: 'q3_ignition', prompt: '(i) Place 2 drops on a spatula and ignite in a Bunsen flame.', correctObs: 'Burns with a luminous, highly smoky and sooty yellow flame', correctInf: 'Unsaturated compound / high carbon:hydrogen ratio' },
        { id: 'q3_litmus', prompt: '(ii) Test with moist blue and red litmus paper.', correctObs: 'No color change on either litmus paper', correctInf: 'Neutral hydrocarbon' },
        { id: 'q3_kmno4', prompt: '(iii) Add 3 drops of acidified KMnO₄ and shake thoroughly.', correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized', correctInf: 'Alkene / unsaturation (>C=C<) present' },
        { id: 'q3_nahco3', prompt: '(iv) Add 1 cm³ of Bromine water in the dark.', correctObs: 'Reddish-brown bromine water is rapidly decolorized', correctInf: 'Alkene (>C=C<) confirmed present by addition' }
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

class CompositeExamEngine {
  constructor(config = null) {
    this.preset = COMPOSITE_EXAM_PRESETS.series_1;
    this.mode = 'strict'; // 'strict' (135 min timed) or 'guided' (with hints)
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

    // Generic answers repository (supports arbitrary sub-questions)
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
    if (config.mode) this.mode = config.mode;

    if (config.presetKey === 'random' || config.presetKey === 'random_mock') {
      this.preset = generateRandomCompositePreset();
    } else if (config.presetKey && COMPOSITE_EXAM_PRESETS[config.presetKey]) {
      const basePreset = COMPOSITE_EXAM_PRESETS[config.presetKey];
      this.preset = {
        ...basePreset,
        q1: { ...basePreset.q1 },
        q2: { ...basePreset.q2 },
        q3: { ...basePreset.q3 }
      };
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

    if (config.q1) {
      Object.assign(this.preset.q1, config.q1);
      if (config.q1.ratioA != null) this.preset.q1.moleRatioAcid = Number(config.q1.ratioA);
      if (config.q1.ratioB != null) this.preset.q1.moleRatioBase = Number(config.q1.ratioB);
      if (config.q1.acidRfm != null) this.preset.q1.acidRfm = Number(config.q1.acidRfm);
      if (config.q1.baseRfm != null) this.preset.q1.baseRfm = Number(config.q1.baseRfm);

      // Regenerate appropriate calculation questions with bound functions
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

    if (config.q2) {
      Object.assign(this.preset.q2, config.q2);
      const saltKey = config.q2.trueSaltKey || config.q2.salt;
      if (saltKey) this.preset.q2.trueSaltKey = saltKey;
      if (!Array.isArray(config.q2.tests) || config.q2.tests.length === 0) {
        const registryTests = getSaltPresetDefinition(saltKey);
        if (registryTests) {
          this.preset.q2.trueCation = registryTests.trueCation;
          this.preset.q2.trueAnion = registryTests.trueAnion;
          this.preset.q2.trueSaltName = registryTests.trueSaltName;
          this.preset.q2.sampleDesc = registryTests.sampleDesc;
          this.preset.q2.tests = registryTests.tests;
        }
      }
    }

    if (config.q3) {
      Object.assign(this.preset.q3, config.q3);
      const orgKey = config.q3.trueOrganicKey || config.q3.organic;
      if (orgKey) this.preset.q3.trueOrganicKey = orgKey;
      if (!Array.isArray(config.q3.tests) || config.q3.tests.length === 0) {
        const registryOrg = getOrganicPresetDefinition(orgKey);
        if (registryOrg) {
          this.preset.q3.trueFunctionalGroup = registryOrg.trueFunctionalGroup;
          this.preset.q3.sampleDesc = registryOrg.sampleDesc;
          this.preset.q3.tests = registryOrg.tests;
        }
      }
    }
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

  // ── KNEC Scoring Algorithm with Error Carried Forward (e.c.f.) ─────────
  calculateQ1Score() {
    let tableScore = 0.0;
    let calcScore = 0.0;
    const rubric = [];
    const modelAnswers = {};

    const recordedTrials = this.q1Trials.filter(t => t.recorded && t.used > 0);

    // 1. Table 1 Completeness (1.0 Mark)
    if (recordedTrials.length >= 3) {
      tableScore += 1.0;
      rubric.push({ item: 'Table 1 Completeness (CT - 3 trials recorded)', max: 1.0, mark: 1.0, pass: true, detail: 'Candidate completed all 3 titration trials within realistic boundaries.' });
    } else if (recordedTrials.length >= 2) {
      tableScore += 0.5;
      rubric.push({ item: 'Table 1 Completeness (CT - 2 trials recorded)', max: 1.0, mark: 0.5, pass: true, detail: 'Candidate completed 2 trials.' });
    } else {
      rubric.push({ item: 'Table 1 Completeness (CT)', max: 1.0, mark: 0.0, pass: false, detail: 'Incomplete: At least 2 trials are required for KNEC mark.' });
    }

    // 2. Decimal Place Precision Penalty (1.0 Mark)
    // KNEC Rule: Readings must be recorded to 2 decimal places ending in .00 or .50 / .05
    let decimalViolations = 0;
    this.q1Trials.forEach(t => {
      if (t.recorded) {
        const finStr = t.final.toFixed(2);
        const lastDigit = finStr.slice(-1);
        if (lastDigit !== '0' && lastDigit !== '5') {
          decimalViolations++;
        }
      }
    });

    if (decimalViolations === 0 && recordedTrials.length >= 2) {
      tableScore += 1.0;
      rubric.push({ item: 'Decimal Place Precision (D - 2 d.p. ending in .00 or .05)', max: 1.0, mark: 1.0, pass: true, detail: 'Full mark: All burette readings follow KNEC 2 d.p. convention (.00 or .05).' });
    } else if (recordedTrials.length >= 2) {
      tableScore += 0.5;
      rubric.push({ item: 'Decimal Place Penalty (D - 0.5 Mark)', max: 1.0, mark: 0.5, pass: false, detail: 'Penalized: Readings did not adhere strictly to .00 or .05 precision standard.' });
    } else {
      rubric.push({ item: 'Decimal Place Precision (D)', max: 1.0, mark: 0.0, pass: false, detail: 'Incomplete titration data.' });
    }

    // 3. Accuracy vs True Value (3.0 Marks)
    const trueTitre = this.preset.q1.trueTitre || 25.00;
    modelAnswers.trueTitre = trueTitre;

    const avgRecorded = recordedTrials.length > 0
      ? recordedTrials.reduce((acc, t) => acc + t.used, 0) / recordedTrials.length
      : 0;
    const diff = Math.abs(avgRecorded - trueTitre);

    if (diff <= 0.15 && recordedTrials.length >= 2) {
      tableScore += 3.0;
      rubric.push({ item: 'Burette Titre Accuracy (A - within ±0.15 cm³ of true value)', max: 3.0, mark: 3.0, pass: true, detail: `Excellent: Deviation is ${diff.toFixed(2)} cm³ (Target: ${trueTitre.toFixed(2)} cm³).` });
    } else if (diff <= 0.30 && recordedTrials.length >= 2) {
      tableScore += 2.0;
      rubric.push({ item: 'Burette Titre Accuracy (A - within ±0.30 cm³ of true value)', max: 3.0, mark: 2.0, pass: true, detail: `Competent: Deviation is ${diff.toFixed(2)} cm³ (Target: ${trueTitre.toFixed(2)} cm³).` });
    } else if (diff <= 0.50 && recordedTrials.length >= 2) {
      tableScore += 1.0;
      rubric.push({ item: 'Burette Titre Accuracy (A - within ±0.50 cm³ of true value)', max: 3.0, mark: 1.0, pass: true, detail: `Pass: Deviation is ${diff.toFixed(2)} cm³ (Target: ${trueTitre.toFixed(2)} cm³).` });
    } else {
      rubric.push({ item: 'Burette Titre Accuracy (A - >0.50 cm³ deviation)', max: 3.0, mark: 0.0, pass: false, detail: `Titre deviated by ${diff.toFixed(2)} cm³ from true value (${trueTitre.toFixed(2)} cm³).` });
    }

    // 4. Calculations (10.0 Marks Total) with Error Carried Forward (e.c.f.)
    const checkedConcordant = this.q1Trials.filter(t => t.recorded && t.concordant && t.used > 0);
    const expAvgFromTrials = checkedConcordant.length > 0
      ? checkedConcordant.reduce((a, b) => a + b.used, 0) / checkedConcordant.length
      : (recordedTrials.length > 0 ? avgRecorded : trueTitre);

    const questionsList = this.preset.q1.questions || createStandardTitrationQuestions(this.preset.q1);
    
    // Evaluation Context passed to each sub-question
    const evalCtx = {
      trueTitre,
      expAvgFromTrials,
      trueAcidMolarity: Number(this.preset.q1.trueAcidMolarity) || 0.100,
      trueBaseMolarity: Number(this.preset.q1.trueBaseMolarity) || 0.100,
      pipetteVol: Number(this.preset.q1.pipetteVolume) || 25.0,
      ratioA: Number(this.preset.q1.moleRatioAcid || this.preset.q1.ratioA) || 1,
      ratioB: Number(this.preset.q1.moleRatioBase || this.preset.q1.ratioB) || 1,
      acidRfm: Number(this.preset.q1.acidRfm) || 36.5,
      baseRfm: Number(this.preset.q1.baseRfm) || 40.0,
      answers: this.q1Answers,
      t1: this.q1Trials[0]?.used || trueTitre,
      t2: this.q1Trials[1]?.used || trueTitre,
      v1: parseFloat(this.q1Answers.avgTitre || this.q1Answers.step_a) || expAvgFromTrials
    };

    questionsList.forEach(q => {
      const fieldKey = q.field || q.id;
      const rawAns = this.q1Answers[fieldKey] !== undefined ? this.q1Answers[fieldKey] : this.q1Answers[q.id];
      const val = parseFloat(rawAns);

      const expTheo = typeof q.calcTheoretical === 'function' ? q.calcTheoretical(evalCtx) : null;
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
        }
      }

      if (isPassed) {
        awarded = q.marks;
        calcScore += awarded;
        rubric.push({
          item: `(${q.letter}) ${q.label} [${awarded.toFixed(1)} / ${q.marks.toFixed(1)} Marks]`,
          max: q.marks,
          mark: awarded,
          pass: true,
          detail: usedEcf
            ? `Correct via Error Carried Forward (e.c.f.): Candidate accurately used their prior calculated value (${val}).`
            : (typeof q.feedbackSuccess === 'function' ? q.feedbackSuccess(val) : `Correct: ${val} ${q.unit || ''}.`)
        });
      } else {
        rubric.push({
          item: `(${q.letter}) ${q.label} [0.0 / ${q.marks.toFixed(1)} Marks]`,
          max: q.marks,
          mark: 0.0,
          pass: false,
          detail: typeof q.feedbackFail === 'function' ? q.feedbackFail(evalCtx, expTheo) : `Expected around ${expTheo != null ? (typeof expTheo === 'number' ? expTheo.toFixed(4) : expTheo) : ''} ${q.unit || ''}.`
        });
      }

      modelAnswers[fieldKey] = expTheo;
    });

    const total = parseFloat((tableScore + calcScore).toFixed(1));
    return {
      tableScore: parseFloat(tableScore.toFixed(1)),
      calcScore: parseFloat(calcScore.toFixed(1)),
      totalScore: Math.min(15.0, total),
      maxScore: 15.0,
      rubric,
      modelAnswers
    };
  }

  // ── Q2 Qualitative Operations & Ionic Charge Enforcement ─────────────
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

      // 1. Observation Keyword Scoring (1.5 Marks)
      const obsKeywords = (t.correctObs || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 3);
      const obsMatches = obsKeywords.filter(w => candidateObs.includes(w)).length;
      if (candidateObs.length > 5 && obsMatches >= 2) {
        testMark += 1.5;
      } else if (candidateObs.length > 3) {
        testMark += 0.5;
      }

      // 2. Inference Keyword & Multiple Ion Grouping (1.5 Marks)
      // KNEC Rule: Amphoteric test with NaOH requires listing Pb2+, Al3+, Zn2+
      const infKeywords = (t.correctInf || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 2);
      const infMatches = infKeywords.filter(w => candidateInf.includes(w)).length;
      if (candidateInf.length > 3 && infMatches >= 1) {
        testMark += 1.5;
      } else if (candidateInf.length > 2) {
        testMark += 0.5;
      }

      // 3. Contradictory inference penalty check (-0.5)
      if (candidateObs.includes('insoluble') && (candidateInf.includes('zn') || candidateInf.includes('zinc') || candidateInf.includes('soluble'))) {
        testMark = Math.max(0, testMark - 0.5);
      }

      score += testMark;
      rubric.push({
        item: `Test (${String.fromCharCode(97 + idx)}): ${t.prompt.substring(0, 50)}…`,
        max: 3.0,
        mark: testMark,
        pass: testMark >= 2.0,
        detail: `Expected Obs: "${t.correctObs}" | Infs: "${t.correctInf}"`
      });
    });

    // Cation & Anion Deductions (3.0 Marks)
    const trueCation = (this.preset.q2.trueCation || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const candidateCation = (this.q2CationChoice || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cationCorrect = candidateCation.length > 0 && (candidateCation.includes(trueCation) || trueCation.includes(candidateCation));
    
    // Check if ionic charge is present in choice
    const hasCharge = this.q2CationChoice.includes('+') || this.q2CationChoice.includes('²') || this.q2CationChoice.includes('³');
    if (cationCorrect && hasCharge) {
      score += 1.5;
      rubric.push({ item: `Cation Deduction (${this.preset.q2.trueCation})`, max: 1.5, mark: 1.5, pass: true, detail: 'Correct cation with valid ionic charge.' });
    } else if (cationCorrect) {
      score += 1.0;
      rubric.push({ item: 'Cation Deduction (-0.5 Charge Penalty)', max: 1.5, mark: 1.0, pass: false, detail: 'Element identified but missing ionic charge superscript.' });
    } else {
      rubric.push({ item: 'Cation Deduction', max: 1.5, mark: 0.0, pass: false, detail: `Expected: ${this.preset.q2.trueCation}` });
    }

    const trueAnion = (this.preset.q2.trueAnion || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const candidateAnion = (this.q2AnionChoice || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const anionCorrect = candidateAnion.length > 0 && (candidateAnion.includes(trueAnion) || trueAnion.includes(candidateAnion));
    if (anionCorrect) {
      score += 1.5;
      rubric.push({ item: `Anion Deduction (${this.preset.q2.trueAnion})`, max: 1.5, mark: 1.5, pass: true, detail: 'Correct anion identified.' });
    } else {
      rubric.push({ item: 'Anion Deduction', max: 1.5, mark: 0.0, pass: false, detail: `Expected: ${this.preset.q2.trueAnion}` });
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
        item: `Test (${String.fromCharCode(97 + idx)}): ${t.prompt.substring(0, 50)}…`,
        max: 2.0,
        mark: testMark,
        pass: testMark >= 1.5,
        detail: `Expected Obs: "${t.correctObs}" | Infs: "${t.correctInf}"`
      });
    });

    // Functional Group Deduction (2.0 Marks)
    const trueFG = (this.preset.q3.trueFunctionalGroup || '').toLowerCase().replace(/[^a-z]/g, '');
    const candidateFG = (this.q3FunctionalGroupChoice || '').toLowerCase().replace(/[^a-z]/g, '');
    const fgCorrect = candidateFG.length > 0 && (candidateFG.includes(trueFG) || trueFG.includes(candidateFG));
    if (fgCorrect) {
      score += 2.0;
      rubric.push({ item: `Functional Group Deduction (${this.preset.q3.trueFunctionalGroup})`, max: 2.0, mark: 2.0, pass: true, detail: 'Correct functional group deduced.' });
    } else {
      rubric.push({ item: 'Functional Group Deduction', max: 2.0, mark: 0.0, pass: false, detail: `Expected: ${this.preset.q3.trueFunctionalGroup}` });
    }

    return {
      totalScore: Math.min(10.0, parseFloat(score.toFixed(1))),
      maxScore: 10.0,
      rubric
    };
  }

  // ── Step-by-Step Mathematical Worked Solution Model ──────────────────
  generateWorkedSolutions() {
    const questionsList = this.preset.q1.questions || createStandardTitrationQuestions(this.preset.q1);
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
      const stepKey = `step_${q.letter}`;
      worked[stepKey] = {
        letter: q.letter,
        title: `(${q.letter}) ${q.label}`,
        workingHtml: typeof q.working === 'function' ? q.working(evalCtx) : `Standard stoichiometric calculation.`
      };
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
      workedSolutions,
      diagnosticNotes,
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
        seriesKey: evalData.seriesKey,
        mode: evalData.mode,
        percentage: evalData.percentage,
        q1: evalData.q1Details,
        q2: evalData.q2Details,
        q3: evalData.q3Details,
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
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COMPOSITE_EXAM_PRESETS,
    CompositeExamEngine,
    generateRandomCompositePreset,
    createStandardTitrationQuestions,
    createWaterOfCrystallizationQuestions,
    createPercentagePurityQuestions,
    createRamMetalQuestions
  };
}

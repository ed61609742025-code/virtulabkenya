// ============================================================
//  VirtuLab Kenya — KCSE Composite Chemistry Practical Engine
//  KNEC Paper 3 (233/3) 40-Mark Standardized Examination Engine
// ============================================================

const COMPOSITE_EXAM_PRESETS = {
  // ── Series 1: National Classic (Form 4 Term 1 Standard) ───────────
  series_1: {
    id: 'series_1',
    seriesKey: 'series_1',
    seriesNumber: 1,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 1',
    badgeText: 'National Standard · Acid-Base & Heavy Metals',
    durationMinutes: 135,
    q1: {
      type: 'titration',
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
      instructions: 'Titrate Solution B with Solution A until the pink color just disappears (colorless endpoint).'
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
          id: 'q2_appearance',
          prompt: '(i) Describe the appearance of Solid Y and test its solubility in about 10 cm³ of distilled water.',
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
          prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by 3 drops of Potassium Iodide (KI) solution.',
          correctObs: 'Bright yellow precipitate formed on addition of potassium iodide (KI)',
          correctInf: 'Pb²⁺ confirmed; NO₃⁻ inferred present'
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
          correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio; alkanol present'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
          correctObs: 'Both red and blue litmus papers retain their color (neutral pH ~ 7)',
          correctInf: 'Neutral organic substance; carboxylic acid (—COOH) and amine absent'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z in a test tube, add 3 drops of acidified KMnO₄ and warm gently in a water bath.',
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

  // ── Series 2: Carbonate Stoichiometry (Form 4 Term 2 Standard) ────
  series_2: {
    id: 'series_2',
    seriesKey: 'series_2',
    seriesNumber: 2,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 2',
    badgeText: 'Carbonate Stoichiometry & Iron(II) Vitriol',
    durationMinutes: 135,
    q1: {
      type: 'titration',
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
      baseRfm: 106.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(251,191,36,0.3)',
      flaskIndicatorColor: 'rgba(245,158,11,0.85)',
      endpointColor: 'rgba(239,68,68,0.7)',
      equation: '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)',
      instructions: 'Titrate Solution B with Solution A until the yellow solution turns orange/red (acidic endpoint).'
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
          id: 'q2_appearance',
          prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.',
          correctObs: 'Pale green crystalline solid; dissolves to give a pale green solution',
          correctInf: 'Soluble salt; Fe²⁺ present'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) To 2 cm³ of solution Y, add 2M NaOH dropwise until in excess.',
          correctObs: 'Dirty green precipitate formed, insoluble in excess NaOH; turns reddish-brown on surface',
          correctInf: 'Fe²⁺ confirmed; oxidizes slowly to Fe³⁺'
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
          correctObs: 'Burns with a clean, non-sooty pale blue flame; characteristic vinegar smell',
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
          correctObs: 'Vigorous effervescence / bubbling of a colorless gas that forms a white precipitate with lime water',
          correctInf: 'Carboxylic acid (—COOH) confirmed present; CO₂ gas evolved'
        }
      ]
    }
  },

  // ── Series 3: Redox Titration & Unsaturated Hydrocarbon ───────────
  series_3: {
    id: 'series_3',
    seriesKey: 'series_3',
    seriesNumber: 3,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 3',
    badgeText: 'Redox Volumetric Analysis & Alkene Decolorization',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      title: 'Question 1: Volumetric Redox Analysis (15.0 Marks)',
      solutionA: '0.020 M Potassium Manganate(VII) (KMnO₄)',
      solutionB: 'Acidified Iron(II) Ammonium Sulfate [(NH₄)₂Fe(SO₄)₂·6H₂O] (39.2 g/dm³)',
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
      instructions: 'Titrate acidified Solution B with Solution A until a permanent pale pink color persists for 30 seconds.'
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
          id: 'q2_appearance',
          prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.',
          correctObs: 'White crystalline solid; dissolves readily to form a clear colorless solution',
          correctInf: 'Soluble salt; absence of colored transition metal ions'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) To 2 cm³ of solution Y, add 2M NaOH dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves in excess NaOH to give a colorless solution',
          correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'White precipitate formed, dissolves completely in excess aqueous NH₃ to give a colorless solution',
          correctInf: 'Zn²⁺ confirmed present (Al³⁺ and Pb²⁺ absent)'
        },
        {
          id: 'q2_anion',
          prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by 3 drops of Ba(NO₃)₂ solution.',
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
          correctObs: 'Burns with a luminous, smoky and highly sooty yellow flame; black carbon residue left',
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
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and shake vigorously.',
          correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized (turns colorless)',
          correctInf: 'Unsaturated carbon-carbon double bond (>C=C<) confirmed present'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add 1 cm³ of Bromine water and shake.',
          correctObs: 'Reddish-brown / yellow bromine water is rapidly decolorized in the dark',
          correctInf: 'Alkene (>C=C<) confirmed present by addition halogenation'
        }
      ]
    }
  },

  // ── Series 4: Thermochemistry & Energetics Practical ─────────────
  series_4: {
    id: 'series_4',
    seriesKey: 'series_4',
    seriesNumber: 4,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 4',
    badgeText: 'Thermochemistry Enthalpy & Transition Metals',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      title: 'Question 1: Volumetric & Thermochemical Analysis (15.0 Marks)',
      solutionA: '1.00 M Nitric Acid (HNO₃)',
      solutionB: '1.00 M Potassium Hydroxide (KOH) containing 56.0 g/dm³',
      acidFormula: 'HNO3',
      baseFormula: 'KOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 1.00,
      trueBaseMolarity: 1.00,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 1,
      acidRfm: 63.0,
      baseRfm: 56.1,
      titrantColor: '#06B6D4',
      flaskBaseColor: 'rgba(6,182,212,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      equation: 'HNO₃(aq) + KOH(aq) → KNO₃(aq) + H₂O(l) + Heat (ΔH = -57.1 kJ/mol)',
      instructions: 'Titrate Solution B with Solution A until the pink color completely discharges.'
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
          id: 'q2_appearance',
          prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.',
          correctObs: 'Blue crystalline solid; dissolves to form a clear blue solution',
          correctInf: 'Soluble transition metal salt; Cu²⁺ present'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) To 2 cm³ of solution Y, add 2M NaOH dropwise until in excess.',
          correctObs: 'Pale blue precipitate formed, insoluble in excess NaOH',
          correctInf: 'Cu²⁺ present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'Pale blue precipitate formed with few drops, dissolves in excess aqueous NH₃ to give a royal deep blue solution',
          correctInf: 'Cu²⁺ confirmed present as [Cu(NH₃)₄]²⁺ complex'
        },
        {
          id: 'q2_anion',
          prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HCl followed by 3 drops of BaCl₂ solution.',
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
          correctInf: 'Saturated organic compound / lower alkanol'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
          correctObs: 'Both blue and red litmus papers remain unchanged in color',
          correctInf: 'Neutral organic liquid; absence of carboxylic acid'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified K₂Cr₂O₇ (or KMnO₄) and warm.',
          correctObs: 'Orange acidified K₂Cr₂O₇ turns green (or purple KMnO₄ turns colorless) with fruity/pungent smell',
          correctInf: 'Primary/secondary alkanol (—OH) confirmed oxidized to aldehyde/acid'
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

  // ── Series 5: Two-Salt Mixture Separation & Analysis ──────────────
  series_5: {
    id: 'series_5',
    seriesKey: 'series_5',
    seriesNumber: 5,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 5',
    badgeText: 'Dibasic Volumetric & Two-Salt Mixture Separation',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      title: 'Question 1: Volumetric Analysis (15.0 Marks)',
      solutionA: '0.050 M Sulfuric Acid (H₂SO₄)',
      solutionB: '0.100 M Sodium Hydroxide (NaOH) containing 4.00 g/dm³',
      acidFormula: 'H2SO4',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.050,
      trueBaseMolarity: 0.100,
      trueTitre: 25.00,
      moleRatioAcid: 1,
      moleRatioBase: 2,
      acidRfm: 98.0,
      baseRfm: 40.0,
      titrantColor: '#38BDF8',
      flaskBaseColor: 'rgba(56,189,248,0.25)',
      flaskIndicatorColor: 'rgba(236,72,153,0.85)',
      endpointColor: 'rgba(255,255,255,0.35)',
      equation: 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l)',
      instructions: 'Titrate Solution B with Solution A until the pink color discharges sharply.'
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
          prompt: '(i) Place Solid Mixture P in a beaker, add 15 cm³ of distilled water, stir vigorously and filter into a boiling tube. Retain both filtrate and residue.',
          correctObs: 'White residue remains on filter paper; clear colorless filtrate collected',
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
          correctInf: 'Zn²⁺ confirmed present in filtrate'
        },
        {
          id: 'q2_anion',
          prompt: '(iv) To 2 cm³ of the filtrate, add 3 drops of dilute HNO₃ followed by Ba(NO₃)₂ solution.',
          correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid',
          correctInf: 'SO₄²⁻ confirmed present in filtrate'
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
          correctInf: 'Lower saturated carboxylic acid'
        },
        {
          id: 'q3_litmus',
          prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
          correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red',
          correctInf: 'Strongly acidic substance / H⁺ ions present'
        },
        {
          id: 'q3_kmno4',
          prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and warm gently.',
          correctObs: 'Purple acidified KMnO₄ solution turns colorless (decolorized) with gentle bubbling',
          correctInf: 'Methanoic acid reduces KMnO₄ due to formyl (—CHO) hydrogen structure'
        },
        {
          id: 'q3_nahco3',
          prompt: '(iv) To 2 cm³ of Liquid Z, add solid Sodium Hydrogen Carbonate (NaHCO₃).',
          correctObs: 'Rapid vigorous effervescence; gas turns calcium hydroxide solution milky',
          correctInf: 'Carboxylic acid (—COOH) confirmed; CO₂ evolved'
        }
      ]
    }
  },

  // ── Series 6: Reaction Kinetics & Ammonium Salt ───────────────────
  series_6: {
    id: 'series_6',
    seriesKey: 'series_6',
    seriesNumber: 6,
    title: 'KCSE Chemistry Paper 3 Mock Practical Exam — Series 6',
    badgeText: 'Reaction Kinetics & Ammonium Sublimation',
    durationMinutes: 135,
    q1: {
      type: 'titration',
      title: 'Question 1: Volumetric Analysis (15.0 Marks)',
      solutionA: '0.100 M Ethanedioic Acid (H₂C₂O₄·2H₂O)',
      solutionB: '0.200 M Sodium Hydroxide (NaOH) containing 8.00 g/dm³',
      acidFormula: 'H2C2O4',
      baseFormula: 'NaOH',
      indicator: 'Phenolphthalein',
      pipetteVolume: 25.0,
      trueAcidMolarity: 0.100,
      trueBaseMolarity: 0.200,
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
      instructions: 'Titrate Solution B with Solution A until the pink color turns colorless.'
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
          id: 'q2_appearance',
          prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube gently, then strongly.',
          correctObs: 'White crystalline solid sublimes; white dense fumes form on cooler upper walls of tube',
          correctInf: 'Sublimable salt; NH₄⁺ salt present'
        },
        {
          id: 'q2_naoh',
          prompt: '(ii) Dissolve the remainder of Solid Y in 10 cm³ water. To 2 cm³ of solution Y, add 2M NaOH and warm gently.',
          correctObs: 'No precipitate; colorless gas evolved with pungent choking smell, turns moist red litmus paper blue',
          correctInf: 'NH₃ gas evolved; NH₄⁺ confirmed present'
        },
        {
          id: 'q2_nh3',
          prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
          correctObs: 'No precipitate formed with drops or excess aqueous NH₃',
          correctInf: 'Group II / alkali / ammonium salt; heavy metal cations absent'
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
          correctInf: 'Aromatic or high carbon:hydrogen ratio compound'
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
          correctInf: 'Aliphatic alkene / alkyne absent; stable aromatic ring'
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
        { id: 'q2_appearance', prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.', correctObs: 'White crystalline solid dissolves completely to form a colorless solution', correctInf: 'Soluble salt; transition metal ions absent' },
        { id: 'q2_naoh', prompt: '(ii) To 2 cm³ of solution Y, add 2M sodium hydroxide dropwise until in excess.', correctObs: 'White precipitate formed, dissolves in excess to give a colorless solution', correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present' },
        { id: 'q2_nh3', prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous ammonia dropwise until in excess.', correctObs: 'White precipitate formed, dissolves in excess to give a clear colorless solution', correctInf: 'Zn²⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of Barium Nitrate solution followed by 2 cm³ dilute HNO₃.', correctObs: 'White precipitate formed, insoluble in dilute nitric acid', correctInf: 'SO₄²⁻ confirmed present' }
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
        { id: 'q2_appearance', prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.', correctObs: 'White crystalline solid dissolves to form a clear colorless solution', correctInf: 'Soluble salt' },
        { id: 'q2_naoh', prompt: '(ii) To 2 cm³ of solution Y, add 2M sodium hydroxide dropwise until in excess.', correctObs: 'White precipitate formed, soluble in excess to form a colorless solution', correctInf: 'Pb²⁺, Zn²⁺, or Al³⁺ present' },
        { id: 'q2_nh3', prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous ammonia dropwise until in excess.', correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia', correctInf: 'Pb²⁺ or Al³⁺ present' },
        { id: 'q2_anion', prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of Potassium Iodide (KI) solution.', correctObs: 'Bright yellow precipitate formed on addition of potassium iodide', correctInf: 'Pb²⁺ confirmed present' }
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
        { id: 'q2_appearance', prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.', correctObs: 'Blue crystalline solid dissolves completely to give a blue solution', correctInf: 'Soluble salt; Cu²⁺ present' },
        { id: 'q2_naoh', prompt: '(ii) To 2 cm³ of solution Y, add 2M sodium hydroxide dropwise until in excess.', correctObs: 'Pale blue precipitate formed, insoluble in excess sodium hydroxide', correctInf: 'Cu²⁺ present' },
        { id: 'q2_nh3', prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous ammonia dropwise until in excess.', correctObs: 'Pale blue precipitate formed, dissolves in excess to give a deep royal blue solution', correctInf: 'Cu²⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of Barium Chloride followed by dilute HCl.', correctObs: 'White precipitate formed, insoluble in dilute hydrochloric acid', correctInf: 'SO₄²⁻ confirmed present' }
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
        { id: 'q2_appearance', prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.', correctObs: 'Pale green crystalline solid dissolves to give a pale green solution', correctInf: 'Soluble salt; Fe²⁺ present' },
        { id: 'q2_naoh', prompt: '(ii) To 2 cm³ of solution Y, add 2M sodium hydroxide dropwise until in excess.', correctObs: 'Dirty green precipitate formed, insoluble in excess; turns brown at surface on standing', correctInf: 'Fe²⁺ present' },
        { id: 'q2_nh3', prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous ammonia dropwise until in excess.', correctObs: 'Dirty green precipitate formed, insoluble in excess aqueous ammonia', correctInf: 'Fe²⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of Barium Chloride followed by dilute HCl.', correctObs: 'White precipitate formed, insoluble in dilute hydrochloric acid', correctInf: 'SO₄²⁻ confirmed present' }
      ]
    };
  }
  if (key.includes('FE') && (key.includes('CL') || key.includes('3'))) {
    return {
      trueSaltKey: 'FeCl3',
      trueSaltName: 'Iron(III) Chloride — FeCl₃',
      trueCation: 'Fe3+',
      trueAnion: 'Cl-',
      sampleDesc: 'A dark brown / reddish-brown solid.',
      tests: [
        { id: 'q2_appearance', prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.', correctObs: 'Brown crystalline solid dissolves to give a yellow-brown solution', correctInf: 'Soluble salt; Fe³⁺ present' },
        { id: 'q2_naoh', prompt: '(ii) To 2 cm³ of solution Y, add 2M sodium hydroxide dropwise until in excess.', correctObs: 'Red-brown precipitate formed, insoluble in excess sodium hydroxide', correctInf: 'Fe³⁺ confirmed present' },
        { id: 'q2_nh3', prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous ammonia dropwise until in excess.', correctObs: 'Red-brown precipitate formed, insoluble in excess aqueous ammonia', correctInf: 'Fe³⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of Silver Nitrate followed by dilute HNO₃.', correctObs: 'White precipitate formed, insoluble in dilute nitric acid; dissolves in aqueous ammonia', correctInf: 'Cl⁻ confirmed present' }
      ]
    };
  }
  if (key.includes('CA')) {
    return {
      trueSaltKey: 'CaCl2',
      trueSaltName: 'Calcium Chloride — CaCl₂',
      trueCation: 'Ca2+',
      trueAnion: 'Cl-',
      sampleDesc: 'A pure white granular inorganic salt sample.',
      tests: [
        { id: 'q2_appearance', prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.', correctObs: 'White solid dissolves readily with noticeable evolution of heat to give a colorless solution', correctInf: 'Soluble salt' },
        { id: 'q2_naoh', prompt: '(ii) To 2 cm³ of solution Y, add 2M sodium hydroxide dropwise until in excess.', correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide', correctInf: 'Ca²⁺ or Mg²⁺ present' },
        { id: 'q2_nh3', prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous ammonia dropwise until in excess.', correctObs: 'No precipitate formed with aqueous ammonia', correctInf: 'Ca²⁺ present (or group 1/2)' },
        { id: 'q2_anion', prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of Silver Nitrate followed by dilute HNO₃.', correctObs: 'White precipitate formed, insoluble in dilute nitric acid', correctInf: 'Cl⁻ confirmed present' }
      ]
    };
  }
  if (key.includes('NH4')) {
    return {
      trueSaltKey: 'NH4Cl',
      trueSaltName: 'Ammonium Chloride — NH₄Cl',
      trueCation: 'NH4+',
      trueAnion: 'Cl-',
      sampleDesc: 'A pure white inorganic solid containing one cation and one anion.',
      tests: [
        { id: 'q2_appearance', prompt: '(i) Heat a half-spatula of Solid Y in a dry test tube gently, then strongly.', correctObs: 'White crystalline solid sublimes; white dense fumes form on cooler upper walls', correctInf: 'Sublimable salt; NH₄⁺ salt present' },
        { id: 'q2_naoh', prompt: '(ii) Dissolve remainder in 10 cm³ water. To 2 cm³, add 2M NaOH and warm gently.', correctObs: 'No precipitate; colorless gas with choking smell turns moist red litmus blue', correctInf: 'NH₃ gas evolved; NH₄⁺ confirmed present' },
        { id: 'q2_anion', prompt: '(iii) To 2 cm³ of solution Y, add 3 drops of Silver Nitrate followed by dilute HNO₃.', correctObs: 'White precipitate formed, insoluble in dilute nitric acid', correctInf: 'Cl⁻ confirmed present' }
      ]
    };
  }
  return null;
}

function getOrganicPresetDefinition(orgKey) {
  if (!orgKey) return null;
  const key = String(orgKey).toLowerCase();
  if (key.includes('ethanoic') || key.includes('acetic') || key.includes('acid') || key.includes('cooh')) {
    return {
      trueOrganicKey: 'Ethanoic Acid',
      trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
      sampleDesc: 'A clear colorless liquid with a sharp, pungent vinegar-like odor.',
      tests: [
        { id: 'q3_ignition', prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a Bunsen flame.', correctObs: 'Burns with a clear, non-sooty pale blue flame; pungent fumes', correctInf: 'Lower saturated carboxylic acid / high H:C ratio' },
        { id: 'q3_litmus', prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.', correctObs: 'Moist blue litmus paper turns red; red litmus paper remains red', correctInf: 'Acidic substance / H⁺ ions present' },
        { id: 'q3_nahco3', prompt: '(iii) To 2 cm³ of Liquid Z, add solid Sodium Hydrogen Carbonate (NaHCO₃).', correctObs: 'Rapid vigorous effervescence of colorless gas that turns lime water milky', correctInf: 'Carboxylic acid (—COOH) confirmed present' },
        { id: 'q3_kmno4', prompt: '(iv) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and warm gently.', correctObs: 'Purple acidified KMnO₄ solution remains purple (not decolorized)', correctInf: 'Resistant to mild oxidation; primary carboxylic acid' }
      ]
    };
  }
  if (key.includes('cyclohex') || key.includes('alkene') || key.includes('ene')) {
    return {
      trueOrganicKey: 'Cyclohexene',
      trueFunctionalGroup: 'Alkene (>C=C<)',
      sampleDesc: 'A clear colorless, volatile organic liquid with a distinctive petroleum odor.',
      tests: [
        { id: 'q3_ignition', prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a Bunsen flame.', correctObs: 'Burns with a yellow, highly luminous smoky/sooty flame', correctInf: 'Unsaturated organic compound / high C:H ratio' },
        { id: 'q3_litmus', prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.', correctObs: 'No color change on either blue or red litmus paper', correctInf: 'Neutral organic substance' },
        { id: 'q3_kmno4', prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and shake thoroughly.', correctObs: 'Purple color of acidified KMnO₄ solution is rapidly decolorized (turns colorless)', correctInf: 'Alkene / unsaturation (>C=C<) confirmed present' },
        { id: 'q3_nahco3', prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end of solid NaHCO₃.', correctObs: 'No effervescence / no gas evolved', correctInf: 'Carboxylic acid (—COOH) absent' }
      ]
    };
  }
  if (key.includes('hexan') || key.includes('alkan') || key.includes('saturated')) {
    return {
      trueOrganicKey: 'Hexane',
      trueFunctionalGroup: 'Alkane (C-C)',
      sampleDesc: 'A clear colorless liquid with a mild petroleum hydrocarbon odor.',
      tests: [
        { id: 'q3_ignition', prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a Bunsen flame.', correctObs: 'Burns with a moderately smoky flame', correctInf: 'Saturated aliphatic hydrocarbon' },
        { id: 'q3_litmus', prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.', correctObs: 'No change on both litmus papers', correctInf: 'Neutral substance' },
        { id: 'q3_kmno4', prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and shake.', correctObs: 'Purple color remains unchanged (not decolorized)', correctInf: 'Saturated hydrocarbon / unreactive to KMnO₄' },
        { id: 'q3_nahco3', prompt: '(iv) To 2 cm³ of Liquid Z, add solid NaHCO₃.', correctObs: 'No effervescence observed', correctInf: 'Carboxylic acid absent' }
      ]
    };
  }
  return {
    trueOrganicKey: 'Ethanol',
    trueFunctionalGroup: 'Alkanol (-OH)',
    sampleDesc: 'A clear, colorless volatile liquid with a characteristic pleasant alcoholic odor.',
    tests: [
      { id: 'q3_ignition', prompt: '(i) Place 2 drops of Liquid Z on a clean metallic spatula and ignite in a Bunsen flame.', correctObs: 'Burns with a clean, non-sooty pale blue flame', correctInf: 'Low carbon:hydrogen ratio / saturated organic compound' },
      { id: 'q3_litmus', prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.', correctObs: 'No color change on either blue or red litmus paper', correctInf: 'Neutral organic substance' },
      { id: 'q3_kmno4', prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified potassium manganate(VII) and warm gently.', correctObs: 'Purple color turns colorless / acidified potassium dichromate(VI) turns green', correctInf: 'Primary or secondary alkanol (—OH) oxidized' },
      { id: 'q3_nahco3', prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end full of solid NaHCO₃.', correctObs: 'No effervescence / no gas evolved', correctInf: 'Carboxylic acid (—COOH) absent' }
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
      this.preset = JSON.parse(JSON.stringify(COMPOSITE_EXAM_PRESETS[config.presetKey]));
    }

    if (config.q1) {
      Object.assign(this.preset.q1, config.q1);
      // Map AI assistant / teacher studio ratio fields to engine scoring fields:
      if (config.q1.ratioA != null) this.preset.q1.moleRatioAcid = Number(config.q1.ratioA);
      if (config.q1.ratioB != null) this.preset.q1.moleRatioBase = Number(config.q1.ratioB);
      if (config.q1.acidRfm != null) {
        this.preset.q1.acidRfm = Number(config.q1.acidRfm);
      } else {
        const solA = String(config.q1.solutionA || this.preset.q1.solutionA || '').toLowerCase();
        if (solA.includes('sulfuric') || solA.includes('h2so4')) this.preset.q1.acidRfm = 98.0;
        else if (solA.includes('nitric') || solA.includes('hno3')) this.preset.q1.acidRfm = 63.0;
        else if (solA.includes('ethanedioic') || solA.includes('oxalic') || solA.includes('h2c2o4')) this.preset.q1.acidRfm = 126.0;
        else if (solA.includes('permanganate') || solA.includes('kmno4')) this.preset.q1.acidRfm = 158.0;
        else if (solA.includes('hydrochloric') || solA.includes('hcl')) this.preset.q1.acidRfm = 36.5;
        else if (!this.preset.q1.acidRfm) this.preset.q1.acidRfm = 36.5;
      }
      if (config.q1.baseRfm != null) {
        this.preset.q1.baseRfm = Number(config.q1.baseRfm);
      } else {
        const solB = String(config.q1.solutionB || this.preset.q1.solutionB || '').toLowerCase();
        if (solB.includes('carbonate') || solB.includes('na2co3')) this.preset.q1.baseRfm = 106.0;
        else if (solB.includes('hydroxide') || solB.includes('naoh')) this.preset.q1.baseRfm = 40.0;
      }
    }

    if (config.q2) {
      Object.assign(this.preset.q2, config.q2);
      const saltKey = config.q2.trueSaltKey || config.q2.salt;
      if (saltKey) this.preset.q2.trueSaltKey = saltKey;
      // If tests are missing or need backfilling for this salt:
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
      // If tests are missing or need backfilling for this organic:
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

  // ── KNEC Scoring Algorithm with Technical Penalties ───────────────────
  calculateQ1Score() {
    let tableScore = 0.0;
    let calcScore = 0.0;
    const rubric = [];
    const modelAnswers = {};

    const recordedTrials = this.q1Trials.filter(t => t.recorded && t.used > 0);

    // 1. Table 1 Completeness (1.0 Mark)
    if (recordedTrials.length >= 3) {
      tableScore += 1.0;
      rubric.push({ item: 'Table 1 Completeness (3 trials recorded)', max: 1.0, mark: 1.0, pass: true, detail: 'Candidate completed all 3 titration trials.' });
    } else if (recordedTrials.length >= 2) {
      tableScore += 0.5;
      rubric.push({ item: 'Table 1 Completeness (2 trials recorded)', max: 1.0, mark: 0.5, pass: true, detail: 'Candidate completed 2 trials.' });
    } else {
      rubric.push({ item: 'Table 1 Completeness', max: 1.0, mark: 0.0, pass: false, detail: 'Incomplete: At least 2 trials are required for KNEC mark.' });
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
      rubric.push({ item: 'Decimal Place Precision (consistent to 2 d.p. ending in .00 or .05)', max: 1.0, mark: 1.0, pass: true, detail: 'Full mark: All burette readings follow KNEC 2 d.p. rule.' });
    } else if (recordedTrials.length >= 2) {
      tableScore += 0.5;
      rubric.push({ item: 'Decimal Place Penalty (-0.5 Mark)', max: 1.0, mark: 0.5, pass: false, detail: 'Penalized: Readings did not adhere strictly to .00 or .05 precision standard.' });
    } else {
      rubric.push({ item: 'Decimal Place Precision', max: 1.0, mark: 0.0, pass: false, detail: 'Incomplete titration data.' });
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
      rubric.push({ item: 'Burette Titre Accuracy (within ±0.15 cm³ of true value)', max: 3.0, mark: 3.0, pass: true, detail: `Excellent: Deviation is ${diff.toFixed(2)} cm³ (Target: ${trueTitre.toFixed(2)} cm³).` });
    } else if (diff <= 0.30 && recordedTrials.length >= 2) {
      tableScore += 2.0;
      rubric.push({ item: 'Burette Titre Accuracy (within ±0.30 cm³ of true value)', max: 3.0, mark: 2.0, pass: true, detail: `Competent: Deviation is ${diff.toFixed(2)} cm³ (Target: ${trueTitre.toFixed(2)} cm³).` });
    } else if (diff <= 0.50 && recordedTrials.length >= 2) {
      tableScore += 1.0;
      rubric.push({ item: 'Burette Titre Accuracy (within ±0.50 cm³ of true value)', max: 3.0, mark: 1.0, pass: true, detail: `Pass: Deviation is ${diff.toFixed(2)} cm³ (Target: ${trueTitre.toFixed(2)} cm³).` });
    } else {
      rubric.push({ item: 'Burette Titre Accuracy (>0.50 cm³ deviation)', max: 3.0, mark: 0.0, pass: false, detail: `Titre deviated by ${diff.toFixed(2)} cm³ from true value (${trueTitre.toFixed(2)} cm³).` });
    }

    // 4. Calculations (10.0 Marks)
    // (a) Average Titre & Concordance Penalty (1.0 Mark)
    const candidateAvg = parseFloat(this.q1Answers.avgTitre);
    const checkedConcordant = this.q1Trials.filter(t => t.recorded && t.concordant && t.used > 0);
    
    // Check if candidate checked non-concordant titres (>0.20 cm³ apart)
    let nonConcordantChecked = false;
    if (checkedConcordant.length >= 2) {
      const vols = checkedConcordant.map(t => t.used);
      const spread = Math.max(...vols) - Math.min(...vols);
      if (spread > 0.20) nonConcordantChecked = true;
    }

    const expAvg = checkedConcordant.length > 0
      ? checkedConcordant.reduce((a, b) => a + b.used, 0) / checkedConcordant.length
      : (recordedTrials.length > 0 ? avgRecorded : trueTitre);
    modelAnswers.avgTitre = parseFloat(expAvg.toFixed(2));

    if (!isNaN(candidateAvg) && Math.abs(candidateAvg - expAvg) <= 0.15) {
      if (nonConcordantChecked) {
        calcScore += 0.5;
        rubric.push({ item: '(a) Average Titre V₁ (-0.5 Non-Concordant Penalty)', max: 1.0, mark: 0.5, pass: false, detail: 'Averaged titres that deviate by more than ±0.20 cm³ from each other.' });
      } else {
        calcScore += 1.0;
        rubric.push({ item: '(a) Average Titre Calculation V₁ (1.0 Mark)', max: 1.0, mark: 1.0, pass: true, detail: `Correct: V₁ = ${candidateAvg.toFixed(2)} cm³.` });
      }
    } else {
      rubric.push({ item: '(a) Average Titre Calculation V₁', max: 1.0, mark: 0.0, pass: false, detail: `Expected ${expAvg.toFixed(2)} cm³ from candidate trials.` });
    }

    // (b) Moles of Base in pipette volume (2.0 Marks)
    const candidateMolesB = parseFloat(this.q1Answers.molesB);
    const baseMolarity = Number(this.preset.q1.trueBaseMolarity) || 0.100;
    const pipetteVol = Number(this.preset.q1.pipetteVolume) || 25.0;
    const expectedMolesB = (baseMolarity * pipetteVol) / 1000.0;
    modelAnswers.molesB = expectedMolesB;

    if (!isNaN(candidateMolesB) && Math.abs(candidateMolesB - expectedMolesB) / (expectedMolesB || 1) <= 0.08) {
      calcScore += 2.0;
      rubric.push({ item: '(b) Moles of Solution B in pipette volume (2.0 Marks)', max: 2.0, mark: 2.0, pass: true, detail: `Correct: ${candidateMolesB} moles.` });
    } else {
      rubric.push({ item: '(b) Moles of Solution B in pipette volume', max: 2.0, mark: 0.0, pass: false, detail: `Formula: (${baseMolarity.toFixed(3)} × ${pipetteVol.toFixed(1)})/1000 = ${expectedMolesB.toFixed(5)} mol.` });
    }

    // (c) Moles of Acid reacting (2.0 Marks)
    const candidateMolesA = parseFloat(this.q1Answers.molesA);
    const ratioA = Number(this.preset.q1.moleRatioAcid || this.preset.q1.ratioA) || 1;
    const ratioB = Number(this.preset.q1.moleRatioBase || this.preset.q1.ratioB) || 1;
    const moleRatio = ratioA / (ratioB || 1);
    const expectedMolesA = expectedMolesB * moleRatio;
    modelAnswers.molesA = expectedMolesA;

    if (!isNaN(candidateMolesA) && Math.abs(candidateMolesA - expectedMolesA) / (expectedMolesA || 1) <= 0.08) {
      calcScore += 2.0;
      rubric.push({ item: '(c) Moles of Solution A in average titre (2.0 Marks)', max: 2.0, mark: 2.0, pass: true, detail: `Correct stoichiometry: ${candidateMolesA} moles.` });
    } else {
      rubric.push({ item: '(c) Moles of Solution A in average titre', max: 2.0, mark: 0.0, pass: false, detail: `Expected ${expectedMolesA.toFixed(5)} mol based on mole ratio ${ratioA}:${ratioB}.` });
    }

    // (d) Molar concentration of Solution A (3.0 Marks)
    const candidateMolarityA = parseFloat(this.q1Answers.molarityA);
    const expectedMolarityA = Number(this.preset.q1.trueAcidMolarity) || 0.100;
    modelAnswers.molarityA = expectedMolarityA;

    if (!isNaN(candidateMolarityA) && Math.abs(candidateMolarityA - expectedMolarityA) / (expectedMolarityA || 1) <= 0.08) {
      calcScore += 3.0;
      rubric.push({ item: '(d) Molar concentration of Acid (mol/dm³) (3.0 Marks)', max: 3.0, mark: 3.0, pass: true, detail: `Correct: ${candidateMolarityA} mol/dm³.` });
    } else {
      rubric.push({ item: '(d) Molar concentration of Acid (mol/dm³)', max: 3.0, mark: 0.0, pass: false, detail: `Formula: (Moles of Acid × 1000) / Average Titre = ${expectedMolarityA.toFixed(3)} M.` });
    }

    // (e) Concentration in g/dm³ (2.0 Marks)
    const candidateConcG = parseFloat(this.q1Answers.concGrams);
    const acidRfm = Number(this.preset.q1.acidRfm) || 36.5;
    const expectedConcG = expectedMolarityA * acidRfm;
    modelAnswers.concGrams = parseFloat(expectedConcG.toFixed(2));

    if (!isNaN(candidateConcG) && Math.abs(candidateConcG - expectedConcG) / (expectedConcG || 1) <= 0.08) {
      calcScore += 2.0;
      rubric.push({ item: '(e) Concentration of Acid in g/dm³ (2.0 Marks)', max: 2.0, mark: 2.0, pass: true, detail: `Correct: ${candidateConcG} g/dm³.` });
    } else {
      rubric.push({ item: '(e) Concentration of Acid in g/dm³', max: 2.0, mark: 0.0, pass: false, detail: `Formula: Molarity × RFM (${acidRfm}) = ${expectedConcG.toFixed(2)} g/dm³.` });
    }

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

      // Observation keywords check
      const obsKeywords = (t.correctObs || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 3);
      const obsMatches = obsKeywords.filter(w => candidateObs.includes(w)).length;
      if (candidateObs.length > 5 && obsMatches >= 2) {
        testMark += 1.5;
      } else if (candidateObs.length > 3) {
        testMark += 0.5;
      }

      // Inference keywords & charge check
      const infKeywords = (t.correctInf || '').toLowerCase().split(/[,; ]+/).filter(w => w.length > 2);
      const infMatches = infKeywords.filter(w => candidateInf.includes(w)).length;
      if (candidateInf.length > 3 && infMatches >= 1) {
        testMark += 1.5;
      } else if (candidateInf.length > 2) {
        testMark += 0.5;
      }

      // Contradictory inference penalty check
      if (candidateObs.includes('insoluble in excess') && (candidateInf.includes('zn') || candidateInf.includes('zinc'))) {
        testMark = Math.max(0, testMark - 0.5);
      }

      score += testMark;
      rubric.push({
        item: `Test (${String.fromCharCode(97 + idx)}): ${t.prompt.substring(0, 45)}…`,
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
        item: `Test (${String.fromCharCode(97 + idx)}): ${t.prompt.substring(0, 45)}…`,
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
    const p = this.preset?.q1 || {};
    const v1 = Number(p.trueTitre) || 25.00;
    const baseMolarity = Number(p.trueBaseMolarity) || 0.100;
    const pipetteVol = Number(p.pipetteVolume) || 25.0;
    const molesB = (baseMolarity * pipetteVol) / 1000.0;
    const ratioA = Number(p.moleRatioAcid || p.ratioA) || 1;
    const ratioB = Number(p.moleRatioBase || p.ratioB) || 1;
    const molesA = molesB * (ratioA / (ratioB || 1));
    const molarityA = Number(p.trueAcidMolarity) || 0.100;
    const acidRfm = Number(p.acidRfm) || 36.5;
    const concG = molarityA * acidRfm;

    return {
      stepA: {
        title: '(a) Average Titre V₁',
        formula: 'V₁ = (Titre II + Titre III) / 2',
        substitution: `(${v1.toFixed(2)} + ${v1.toFixed(2)}) / 2`,
        result: `${v1.toFixed(2)} cm³`
      },
      stepB: {
        title: '(b) Moles of Solute in Pipette Volume (Solution B)',
        formula: 'Moles = (Molarity × Pipette Volume) / 1000',
        substitution: `(${baseMolarity.toFixed(3)} × ${pipetteVol.toFixed(1)}) / 1000`,
        result: `${molesB.toFixed(5)} mol`
      },
      stepC: {
        title: '(c) Reaction Stoichiometry & Moles of Acid (Solution A)',
        formula: `Moles of Acid = Moles of Base × (${ratioA}/${ratioB})`,
        substitution: `${molesB.toFixed(5)} × (${ratioA}/${ratioB})`,
        result: `${molesA.toFixed(5)} mol`
      },
      stepD: {
        title: '(d) Molar Concentration of Solution A (M)',
        formula: 'Molarity = (Moles of Acid × 1000) / Average Titre V₁',
        substitution: `(${molesA.toFixed(5)} × 1000) / ${(v1 || 25.00).toFixed(2)}`,
        result: `${molarityA.toFixed(3)} mol/dm³`
      },
      stepE: {
        title: '(e) Concentration in g/dm³',
        formula: 'Concentration = Molarity × Relative Formula Mass (RFM)',
        substitution: `${molarityA.toFixed(3)} × ${acidRfm}`,
        result: `${concG.toFixed(2)} g/dm³`
      }
    };
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
      diagnosticNotes.push('Volumetric Stoichiometry: Review mole ratio calculation and concentration formulas (M × RFM).');
    }
    if (q2Res.totalScore < 10) {
      diagnosticNotes.push('Qualitative Inferences: Ensure you state specific cations (e.g. Pb²⁺, Al³⁺, Zn²⁺) and test behavior with excess NH₃.');
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
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPOSITE_EXAM_PRESETS, CompositeExamEngine, generateRandomCompositePreset };
}

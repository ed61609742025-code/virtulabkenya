// ============================================================
//  VirtuLab Kenya — Chemistry Practical Competency Achievement Test (CPCAT)
//  KNEC KCSE Chemistry Paper 3 Standardized Assessment Engine (40 Marks)
// ============================================================

const CPCAT_ITEMS = [
  // ── SECTION A: Volumetric Analysis & Stoichiometric Calculations (14 Marks) ──
  {
    id: 'a1_concordance',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    marks: 3,
    prompt: 'A student recorded the following burette readings in a titration of 0.100 M NaOH with unknown HCl:\n• Trial I: 21.40 cm³\n• Trial II: 21.20 cm³\n• Trial III: 21.30 cm³\n• Trial IV: 21.90 cm³\nAccording to KNEC Paper 3 marking principles (concordancy within ±0.10 cm³), which titres must be averaged?',
    options: [
      'Trials I, II, and III (21.40, 21.20, 21.30 cm³ — range = 0.20 cm³, within ±0.10 cm³ of mean)',
      'Trials I and IV (21.40 and 21.90 cm³)',
      'All four trials (I, II, III, and IV)',
      'Trial IV only because it is the largest titre'
    ],
    correctIndex: 0,
    explanation: 'KNEC marking rubric dictates averaging titres that are within ±0.10 cm³ or ±0.20 cm³ window. Trial IV (21.90 cm³) is non-concordant and discarded.'
  },
  {
    id: 'a2_average_titre',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    marks: 2,
    prompt: 'Calculate the correct average titre for the selected concordant trials (21.40, 21.20, and 21.30 cm³):',
    options: [
      '21.30 cm³ (expressed to 2 decimal places)',
      '21.3 cm³ (expressed to 1 decimal place)',
      '21.45 cm³',
      '21.00 cm³'
    ],
    correctIndex: 0,
    explanation: 'Average = (21.40 + 21.20 + 21.30) / 3 = 21.30 cm³. KNEC strictly penalizes failing to record to 2 decimal places.'
  },
  {
    id: 'a3_moles_pipette',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    marks: 3,
    prompt: 'If 25.0 cm³ of 0.100 M NaOH was pipetted into the conical flask, calculate the number of moles of NaOH present:',
    options: [
      '0.00250 moles [Moles = (0.100 × 25.0) / 1000]',
      '0.0250 moles',
      '0.00025 moles',
      '0.250 moles'
    ],
    correctIndex: 0,
    explanation: 'Moles = Molarity × Volume(dm³) = (0.100 mol/dm³ × 25.0 cm³) / 1000 = 0.00250 mol.'
  },
  {
    id: 'a4_acid_molarity',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    marks: 4,
    prompt: 'Given the equation: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) (mole ratio 1:1), and an average titre of 21.30 cm³ of HCl, calculate the molar concentration of the hydrochloric acid solution:',
    options: [
      '0.1174 M [Molarity = (0.00250 × 1000) / 21.30]',
      '0.0852 M',
      '0.2348 M',
      '0.0053 M'
    ],
    correctIndex: 0,
    explanation: 'Moles HCl = Moles NaOH = 0.00250 mol. Concentration = (0.00250 × 1000) / 21.30 cm³ = 0.1174 mol/dm³.'
  },
  {
    id: 'a5_indicator_choice',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    marks: 2,
    prompt: 'Which indicator and endpoint color change is suitable for titrating a Weak Acid (Ethanoic Acid, CH₃COOH) with a Strong Base (Sodium Hydroxide, NaOH)?',
    options: [
      'Phenolphthalein: Colorless to faint pink endpoint (pH range 8.3–10.0)',
      'Methyl Orange: Pink to yellow endpoint (pH range 3.1–4.4)',
      'Universal Indicator: Red to purple',
      'No indicator is needed because the system is self-indicating'
    ],
    correctIndex: 0,
    explanation: 'Weak acid - strong base titrations produce basic salt hydrolysis (pH > 7 at equivalence), requiring Phenolphthalein.'
  },

  // ── SECTION B: Qualitative Inorganic Analysis & Deductions (10 Marks) ──
  {
    id: 'b1_cation_fe2',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    marks: 3,
    prompt: 'Addition of 2M Sodium Hydroxide (NaOH) dropwise to unknown Salt Solution X yields a dirty green precipitate that remains INSOLUBLE in excess NaOH. What cation is confirmed?',
    options: [
      'Iron(II) ion [Fe²⁺]',
      'Iron(III) ion [Fe³⁺]',
      'Copper(II) ion [Cu²⁺]',
      'Aluminium ion [Al³⁺]'
    ],
    correctIndex: 0,
    explanation: 'Fe²⁺ forms a dirty green precipitate of Fe(OH)₂(s) insoluble in excess NaOH, which slowly oxidizes to brown Fe(OH)₃ on exposure to air.'
  },
  {
    id: 'b2_anion_so4',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    marks: 3,
    prompt: 'To a solution of Salt Y, Barium Nitrate solution [Ba(NO₃)₂] is added followed by dilute Nitric Acid [HNO₃]. A white precipitate forms and DOES NOT dissolve in dilute HNO₃. Identify the anion:',
    options: [
      'Sulphate ion [SO₄²⁻]',
      'Sulphite ion [SO₃²⁻]',
      'Carbonate ion [CO₃²⁻]',
      'Chloride ion [Cl⁻]'
    ],
    correctIndex: 0,
    explanation: 'BaSO₄ is completely insoluble in dilute HNO₃, confirming SO₄²⁻. BaSO₃ and BaCO₃ dissolve with effervescence.'
  },
  {
    id: 'b3_flame_k',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    marks: 2,
    prompt: 'During a flame test using a clean glass rod in a non-luminous Bunsen flame, solid Salt Z produces a persistent LILAC / PURPLE flame. What metal cation is present?',
    options: [
      'Potassium ion [K⁺]',
      'Sodium ion [Na⁺]',
      'Calcium ion [Ca²⁺]',
      'Copper(II) ion [Cu²⁺]'
    ],
    correctIndex: 0,
    explanation: 'Potassium (K⁺) emits a characteristic lilac/purple flame spectrum.'
  },
  {
    id: 'b4_nh3_gas_test',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    marks: 2,
    prompt: 'During heating of an ammonium salt with slaked lime, a gas is evolved that turns moist red litmus paper BLUE and gives dense white fumes with concentrated HCl vapor. Identify the gas:',
    options: [
      'Ammonia gas [NH₃]',
      'Carbon dioxide [CO₂]',
      'Sulphur dioxide [SO₂]',
      'Chlorine gas [Cl₂]'
    ],
    correctIndex: 0,
    explanation: 'Ammonia is the only common alkaline gas; it forms white fumes of NH₄Cl with HCl vapor.'
  },

  // ── SECTION C: Reaction Kinetics & Thermochemistry (10 Marks) ──
  {
    id: 'c1_disappearing_cross',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    marks: 3,
    prompt: 'In the disappearing cross reaction between Sodium Thiosulphate (Na₂S₂O₃) and dilute HCl, what causes the cross drawn on white paper beneath the flask to disappear?',
    options: [
      'Precipitation of fine insoluble colloidal Sulphur particles [S(s)]',
      'Evolution of dense white sulphur trioxide vapor',
      'Absorption of light by dark green iron salts',
      'Rapid evaporation of the solvent water'
    ],
    correctIndex: 0,
    explanation: 'Reaction: Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + SO₂(g) + S(s) + H₂O(l). Colloidal yellow sulphur precipitates.'
  },
  {
    id: 'c2_rate_expression',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    marks: 2,
    prompt: 'If the time taken for the cross to disappear is t = 25.0 seconds, calculate the rate of reaction expressed as 1/t (in s⁻¹):',
    options: [
      '0.040 s⁻¹ [1 / 25.0 = 0.040]',
      '25.0 s⁻¹',
      '0.400 s⁻¹',
      '0.004 s⁻¹'
    ],
    correctIndex: 0,
    explanation: 'Rate is proportional to 1/t = 1 / 25.0 s = 0.040 s⁻¹.'
  },
  {
    id: 'c3_enthalpy_calc',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    marks: 3,
    prompt: 'When 50.0 cm³ of 1.0 M HCl is mixed with 50.0 cm³ of 1.0 M NaOH (total volume = 100.0 cm³, density = 1.0 g/cm³, specific heat capacity c = 4.2 J/g·K), the temperature rises by ΔT = 6.5 °C. Calculate the heat released (q = mcΔT):',
    options: [
      '2,730 Joules (2.73 kJ) [q = 100.0 g × 4.2 J/g·K × 6.5 K]',
      '1,365 Joules (1.37 kJ)',
      '5,460 Joules (5.46 kJ)',
      '273 Joules (0.27 kJ)'
    ],
    correctIndex: 0,
    explanation: 'q = m × c × ΔT = 100 g × 4.2 J/g·°C × 6.5 °C = 2730 J = 2.73 kJ.'
  },
  {
    id: 'c4_molar_enthalpy',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    marks: 2,
    prompt: 'Based on the previous question, since 0.050 moles of water were formed, what is the molar enthalpy of neutralization (ΔH_neut = -q / moles):',
    options: [
      '-54.6 kJ/mol [ΔH = -2.73 kJ / 0.050 mol]',
      '-27.3 kJ/mol',
      '-109.2 kJ/mol',
      '+54.6 kJ/mol (endothermic)'
    ],
    correctIndex: 0,
    explanation: 'ΔH = -2.73 kJ / 0.050 mol = -54.6 kJ/mol (exothermic, close to theoretical -57.3 kJ/mol).'
  },

  // ── SECTION D: Organic Chemistry Qualitative Deductions & Safety (6 Marks) ──
  {
    id: 'd1_unsaturation',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    marks: 2,
    prompt: 'Organic Liquid W decolourizes Bromine Water (orange to colorless) rapidly in the dark without bubbling. What deduction is justified?',
    options: [
      'Compound contains a carbon-carbon double (C=C) or triple (C≡C) bond (unsaturated hydrocarbon)',
      'Compound is an alkane (saturated)',
      'Compound is a carboxylic acid',
      'Compound is an inorganic mineral acid'
    ],
    correctIndex: 0,
    explanation: 'Decolourization of bromine water by electrophilic addition across the multiple bond confirms unsaturation.'
  },
  {
    id: 'd2_carboxylic_acid',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    marks: 2,
    prompt: 'Addition of solid Sodium Carbonate (Na₂CO₃) to an organic liquid yields effervescence of a colorless gas that turns lime water milky. What functional group is present?',
    options: [
      'Carboxylic acid group [—COOH]',
      'Alkanol / Alcohol group [—OH]',
      'Ester group [—COO—]',
      'Alkyl halide group [—X]'
    ],
    correctIndex: 0,
    explanation: 'Reaction of carboxylic acids with carbonates liberates CO₂(g): 2RCOOH + Na₂CO₃ → 2RCOONa + H₂O + CO₂.'
  },
  {
    id: 'd3_ghs_safety',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    marks: 2,
    prompt: 'A reagent bottle displays the GHS pictogram showing a test tube pouring liquid eroding a metallic bar and a human hand. What hazard is indicated?',
    options: [
      'Corrosive (causes severe skin burns and eye/glass damage)',
      'Flammable liquid',
      'Oxidizing agent',
      'Explosive substance'
    ],
    correctIndex: 0,
    explanation: 'The GHS Corrosive pictogram indicates corrosive acids/bases that destroy skin tissue and metals.'
  }
];

class CPCATEngine {
  constructor(mode = 'pre_test') {
    this.assessmentType = mode; // 'pre_test' or 'post_test'
    this.title = mode === 'pre_test' ? 'CPCAT Baseline Pre-Test' : 'CPCAT Post-Intervention Test';
    this.items = [...CPCAT_ITEMS];
    this.userAnswers = {};
    this.startTime = Date.now();
    this.timeLimitSeconds = 45 * 60; // 45 minutes
  }

  recordAnswer(itemId, optionIndex) {
    this.userAnswers[itemId] = parseInt(optionIndex, 10);
    return this.userAnswers[itemId];
  }

  calculateScore() {
    let sA = 0, sB = 0, sC = 0, sD = 0;
    const maxA = 14, maxB = 10, maxC = 10, maxD = 6;
    const breakdown = {};

    this.items.forEach(item => {
      const selected = this.userAnswers[item.id];
      const isCorrect = selected === item.correctIndex;
      const awarded = isCorrect ? item.marks : 0;

      if (item.section === 'A') sA += awarded;
      else if (item.section === 'B') sB += awarded;
      else if (item.section === 'C') sC += awarded;
      else if (item.section === 'D') sD += awarded;

      breakdown[item.id] = {
        section: item.section,
        marksAwarded: awarded,
        maxMarks: item.marks,
        selectedOption: selected,
        correctOption: item.correctIndex,
        isCorrect
      };
    });

    const total = parseFloat((sA + sB + sC + sD).toFixed(2));
    const percentage = parseFloat(((total / 40.0) * 100).toFixed(2));

    return {
      sectionA: sA,
      sectionB: sB,
      sectionC: sC,
      sectionD: sD,
      totalScore: total,
      maxScore: 40.0,
      percentage,
      breakdown,
      durationSeconds: Math.round((Date.now() - this.startTime) / 1000)
    };
  }

  buildPayload() {
    const score = this.calculateScore();
    return {
      assessment_type: this.assessmentType,
      title: this.title,
      section_a_score: score.sectionA,
      section_b_score: score.sectionB,
      section_c_score: score.sectionC,
      section_d_score: score.sectionD,
      total_score: score.totalScore,
      max_score: score.maxScore,
      percentage: score.percentage,
      answers: this.userAnswers,
      rubric_breakdown: score.breakdown,
      duration_seconds: score.durationSeconds
    };
  }
}

// Browser attachment
if (typeof window !== 'undefined') {
  window.CPCAT_ITEMS = CPCAT_ITEMS;
  window.CPCATEngine = CPCATEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CPCAT_ITEMS, CPCATEngine };
}

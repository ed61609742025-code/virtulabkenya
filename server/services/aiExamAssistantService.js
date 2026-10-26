// ============================================================
//  VirtuLab Kenya — AI Teacher Exam Assistant Service
//  Multimodal Exam Paper Parsing & Idea-to-Exam Generation (Gemini)
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const config = require('../config');

const DEFAULT_MODEL = config.gemini?.defaultModel || 'gemini-2.5-flash';
const EXAM_MAX_TOKENS = config.gemini?.examAssistantMaxTokens || 8192;

/**
 * Standard KNEC Paper 3 Presets for Fallback / Offline / Test mode
 */
const FALLBACK_PRESETS = {
  redox: {
    title: 'KCSE Chemistry Paper 3 Mock — Redox Analysis & Transition Metals',
    titrationType: 'kcseComposite',
    instructions: 'You are provided with 0.020 M Potassium Manganate(VII) (Solution A), Ammonium Iron(II) Sulfate (Solution B), Solid Y, and Liquid Z. Follow all KNEC laboratory instructions carefully.',
    durationMinutes: 135,
    examConfig: {
      presetKey: 'series_4',
      q1: {
        calcType: 'redox_stoichiometry',
        solutionA: '0.020 M Potassium Manganate(VII) (KMnO₄)',
        solutionB: 'Acidified Ammonium Iron(II) Sulfate [(NH₄)₂Fe(SO₄)₂·6H₂O] solution',
        ratioA: 1,
        ratioB: 5,
        pipetteVolume: 25.0,
        indicator: 'none',
        equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
        trueAcidMolarity: 0.020,
        trueBaseMolarity: 0.100,
        trueTitre: 25.00,
        marks: 15,
        instructions: 'Titrate Solution B with Solution A until the first permanent pale pink coloration persists for at least 30 seconds.'
      },
      q2: {
        sampleName: 'Solid Y',
        sampleDesc: 'A white crystalline inorganic salt containing one cation and one anion.',
        trueSaltKey: 'ZnSO4',
        trueSaltName: 'Zinc Sulfate — ZnSO₄',
        trueCation: 'Zn2+',
        trueAnion: 'SO42-',
        marks: 15,
        tests: [
          {
            id: 'q2_solubility',
            prompt: '(i) Describe the appearance of Solid Y and dissolve it in about 10 cm³ of distilled water.',
            correctObs: 'White crystalline solid dissolves completely to give a clear colorless solution',
            correctInf: 'Soluble salt; absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺ absent)'
          },
          {
            id: 'q2_naoh',
            prompt: '(ii) To 2 cm³ of solution Y, add 2M NaOH dropwise until in excess.',
            correctObs: 'White precipitate formed, soluble in excess NaOH to form a colorless solution',
            correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present'
          },
          {
            id: 'q2_nh3',
            prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
            correctObs: 'White precipitate formed, soluble in excess aqueous NH₃ to form a colorless solution',
            correctInf: 'Zn²⁺ confirmed present (Al³⁺ and Pb²⁺ are insoluble in excess NH₃)'
          },
          {
            id: 'q2_anion',
            prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by 3 drops of Ba(NO₃)₂ solution.',
            correctObs: 'Dense white precipitate formed, insoluble on addition of dilute nitric acid',
            correctInf: 'SO₄²⁻ confirmed present'
          }
        ]
      },
      q3: {
        sampleName: 'Liquid Z',
        sampleDesc: 'A clear, flammable organic liquid with a pleasant scent.',
        trueOrganicKey: 'Cyclohexene',
        trueOrganicName: 'Cyclohexene — C₆H₁₀',
        trueFunctionalGroup: 'Unsaturated Hydrocarbon (Alkene >C=C<)',
        marks: 10,
        tests: [
          {
            id: 'q3_ignition',
            prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
            correctObs: 'Burns with a luminous, smoky/sooty yellow flame with black soot deposition',
            correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C< or >C≡C<)'
          },
          {
            id: 'q3_litmus',
            prompt: '(ii) To 2 cm³ of Liquid Z, test with moist red and blue litmus papers.',
            correctObs: 'Both red and blue litmus papers retain their color; neutral pH ~ 7',
            correctInf: 'Neutral organic liquid; carboxylic acid (—COOH) and amine absent'
          },
          {
            id: 'q3_kmno4',
            prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and warm gently.',
            correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized (turns colorless)',
            correctInf: 'Unsaturated carbon-carbon double bond (>C=C<) or reducing group present'
          },
          {
            id: 'q3_nahco3',
            prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end of solid NaHCO₃.',
            correctObs: 'No effervescence / no gas bubbles observed',
            correctInf: 'Carboxylic acid (—COOH) absent'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme & Scoring Rubric
- **Question 1: Titration Analysis (15 Marks)**
  - Table of readings: 5.0 Marks (Complete table, decimal point consistency to 2 d.p., accuracy within ±0.20 cm³).
  - Average titre calculation: 1.0 Mark (Concordant values averaged to 2 d.p.).
  - Moles of Solution A ($MnO_4^-$): 2.0 Marks.
  - Moles of Solution B ($Fe^{2+}$): 3.0 Marks ($1:5$ stoichiometry applied).
  - Concentration of $Fe^{2+}$ in $mol/dm^3$: 2.0 Marks.
  - Concentration in $g/dm^3$ or RFM determination: 2.0 Marks.
- **Question 2: Qualitative Salt Analysis (15 Marks)**
  - Appearance & Solubility: 2.0 Marks (1 mk Obs, 1 mk Inf).
  - NaOH dropwise & excess: 3.0 Marks (1 mk Obs, 2 mk Inf: $Zn^{2+}, Al^{3+}, Pb^{2+}$).
  - $NH_3(aq)$ dropwise & excess: 4.0 Marks (2 mk Obs, 2 mk Inf: confirms $Zn^{2+}$).
  - $Ba(NO_3)_2$ + $HNO_3$: 4.0 Marks (2 mk Obs, 2 mk Inf: confirms $SO_4^{2-}$).
  - Final Deduction: 2.0 Marks (Cation: $Zn^{2+}$, Anion: $SO_4^{2-}$).
- **Question 3: Organic Functional Group (10 Marks)**
  - Ignition flame: 2.5 Marks (Sooty flame $\\rightarrow$ high $C:H$ ratio).
  - Litmus test: 2.5 Marks (Neutral $\\rightarrow$ neither acid nor base).
  - Acidified $KMnO_4$: 3.0 Marks (Decolorized $\\rightarrow$ $>C=C<$ confirmed).
  - $NaHCO_3$: 2.0 Marks (No effervescence $\\rightarrow$ $-COOH$ absent).`,
    confidentialPrepGuide: `### Confidential Instructions to School Science Laboratory Technicians
**1. Volumetric Reagents per Candidate:**
- $150\\text{ cm}^3$ of $0.020\\text{ M Potassium Manganate(VII)}$ ($KMnO_4$) labeled **Solution A**.
  - *Preparation:* Dissolve $3.16\\text{ g of } KMnO_4$ in $1\\text{ dm}^3$ of distilled water containing $50\\text{ cm}^3$ of concentrated $H_2SO_4$.
- $150\\text{ cm}^3$ of $0.100\\text{ M Ammonium Iron(II) Sulfate}$ labeled **Solution B**.
  - *Preparation:* Dissolve $39.2\\text{ g of } (NH_4)_2Fe(SO_4)_2\\cdot 6H_2O$ in $1\\text{ dm}^3$ of $1.0\\text{ M } H_2SO_4$.
- $50\\text{ cm}^3$ Burette, $25\\text{ cm}^3$ Pipette, pipette filler, 2 conical flasks ($250\\text{ cm}^3$), white tile, wash bottle with distilled water.

**2. Qualitative Analysis Reagents per Candidate:**
- About $2.0\\text{ g of Zinc Sulfate}$ crystals in a stoppered boiling tube labeled **Solid Y**.
- Access to: $2\\text{ M } NaOH$, $2\\text{ M aqueous } NH_3$, $0.5\\text{ M } Ba(NO_3)_2$, $2\\text{ M } HNO_3$, test tubes (5), test tube rack and holder.

**3. Organic Analysis Reagents per Candidate:**
- About $10\\text{ cm}^3$ of Cyclohexene in a small stoppered vial labeled **Liquid Z**.
- Access to: Metallic spatula, red and blue litmus paper, acidified $KMnO_4$, solid $NaHCO_3$, Bunsen burner.`
  },

  classic: {
    title: 'KCSE Chemistry Paper 3 Mock — Neutralization & Heavy Metal Halides',
    titrationType: 'kcseComposite',
    instructions: 'You are provided with 0.100 M Hydrochloric acid (Solution A), Sodium hydroxide (Solution B), Solid Y, and Liquid Z. Perform the experiments and record your findings.',
    durationMinutes: 135,
    examConfig: {
      presetKey: 'series_1',
      q1: {
        calcType: 'standard_molarity',
        solutionA: '0.100 M Hydrochloric Acid (HCl)',
        solutionB: 'Sodium Hydroxide (NaOH) solution',
        ratioA: 1,
        ratioB: 1,
        pipetteVolume: 25.0,
        indicator: 'phenolphthalein',
        equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
        trueAcidMolarity: 0.100,
        trueBaseMolarity: 0.100,
        trueTitre: 25.00,
        marks: 15,
        instructions: 'Titrate Solution B with Solution A using 3 drops of phenolphthalein indicator until the pink color just turns colorless.'
      },
      q2: {
        sampleName: 'Solid Y',
        sampleDesc: 'A pure white inorganic crystalline salt.',
        trueSaltKey: 'Pb(NO3)2',
        trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂',
        trueCation: 'Pb2+',
        trueAnion: 'NO3-',
        marks: 15,
        tests: [
          {
            id: 'q2_appearance',
            prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.',
            correctObs: 'White crystalline solid; dissolves completely in water to form a colorless solution',
            correctInf: 'Soluble salt; absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺ absent)'
          },
          {
            id: 'q2_naoh',
            prompt: '(ii) To 2 cm³ of solution Y, add 2M NaOH dropwise until in excess.',
            correctObs: 'White precipitate formed, dissolves in excess NaOH to form a colorless solution',
            correctInf: 'Pb²⁺, Zn²⁺, or Al³⁺ present'
          },
          {
            id: 'q2_nh3',
            prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
            correctObs: 'White precipitate formed, insoluble in excess aqueous NH₃',
            correctInf: 'Pb²⁺ or Al³⁺ present (Zn²⁺ absent)'
          },
          {
            id: 'q2_anion',
            prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by 3 drops of Potassium Iodide (KI) solution.',
            correctObs: 'Bright yellow precipitate formed on addition of potassium iodide',
            correctInf: 'Pb²⁺ confirmed present'
          }
        ]
      },
      q3: {
        sampleName: 'Liquid Z',
        sampleDesc: 'A neutral, miscible organic liquid sample.',
        trueOrganicKey: 'Ethanol',
        trueOrganicName: 'Ethanol — C₂H₅OH',
        trueFunctionalGroup: 'Alkanol (-OH)',
        marks: 10,
        tests: [
          {
            id: 'q3_ignition',
            prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
            correctObs: 'Burns with a clean, non-sooty pale blue flame; leaves no carbon residue',
            correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
          },
          {
            id: 'q3_litmus',
            prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
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
            prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end of solid NaHCO₃.',
            correctObs: 'No effervescence / no gas evolved',
            correctInf: 'Carboxylic acid (—COOH) absent'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme
- **Q1 Volumetric (15M):** Titration table (5M), Concordant average titre (1M), Moles of NaOH (2M), Moles of HCl (2M), Molarity calculation (3M), Accuracy comparison (2M).
- **Q2 Qualitative Analysis (15M):** Solubility (2M), NaOH amphoteric test (3M), NH3 confirmation (4M), KI confirmatory test (4M), Final identification of Pb(NO3)2 (2M).
- **Q3 Organic Tests (10M):** Clean blue flame (2.5M), Neutral litmus (2.5M), Decolorization of KMnO4 on warming (3M), NaHCO3 negative test (2M).`,
    confidentialPrepGuide: `### Confidential Instructions to Laboratory Technicians
- **Solution A:** 0.100 M HCl (prepared from 8.6 cm³ concentrated 36% HCl diluted to 1000 cm³).
- **Solution B:** 0.100 M NaOH (prepared by dissolving 4.00 g NaOH pellets in 1000 cm³ distilled water).
- **Solid Y:** 2.0 g Lead(II) Nitrate per student.
- **Liquid Z:** 10 cm³ Ethanol (95% methylated spirit or absolute alcohol) per student.`
  },

  energy: {
    title: 'KCSE Chemistry Practical Mock — Thermochemistry & Enthalpy of Neutralization',
    formLevel: 'Form 3',
    titrationType: 'energy',
    instructions: 'You are provided with 1.0 M Hydrochloric acid (Solution A), 1.0 M Sodium hydroxide (Solution B), and Solid C. Determine the molar enthalpy of neutralization and carry out qualitative tests on Solid C.',
    durationMinutes: 90,
    examConfig: {
      presetKey: 'energy_neutralization',
      q1: {
        simulationType: 'energy',
        calcType: 'molar_enthalpy_neutralization',
        solutionA: '1.0 M Hydrochloric Acid (HCl)',
        solutionB: '1.0 M Sodium Hydroxide (NaOH)',
        volumeA: 50.0,
        volumeB: 50.0,
        initialTempA: 22.0,
        initialTempB: 22.0,
        meanInitialTemp: 22.0,
        maxTemp: 28.5,
        deltaT: 6.5,
        heatEvolvedJoules: 2730,
        molesWater: 0.050,
        molarEnthalpyKj: -54.6,
        marks: 15,
        instructions: 'Measure 50 cm³ of Solution A into a plastic cup and record its initial temperature T₁. Measure 50 cm³ of Solution B into a clean measuring cylinder and record its initial temperature T₂. Add Solution B to Solution A, stir with thermometer and record highest temperature T₃.'
      },
      q2: {
        sampleName: 'Solid C',
        sampleDesc: 'A green inorganic basic carbonate powder.',
        trueSaltKey: 'CuCO3',
        trueSaltName: 'Copper(II) Carbonate — CuCO₃',
        trueCation: 'Cu2+',
        trueAnion: 'CO32-',
        marks: 15,
        tests: [
          {
            id: 'c1_heat',
            prompt: '(i) Heat a half-spatula of Solid C strongly in a dry test tube and test the gas evolved with calcium hydroxide solution (lime water).',
            correctObs: 'Green powder turns into a black residue; colorless odorless gas evolved forms a white precipitate in lime water.',
            correctInf: 'CO₃²⁻ present / thermal decomposition to black copper(II) oxide (CuO); Cu²⁺ present.'
          },
          {
            id: 'c2_acid',
            prompt: '(ii) Add 5 cm³ of 2M dilute HNO₃ to the black residue after cooling.',
            correctObs: 'Black residue dissolves with effervescence to form a clear sky-blue solution.',
            correctInf: 'Cu²⁺ confirmed present (formation of Cu(NO₃)₂ solution).'
          },
          {
            id: 'c3_naoh',
            prompt: '(iii) To 2 cm³ of the blue solution, add 2M NaOH dropwise until in excess.',
            correctObs: 'Pale blue precipitate formed, insoluble in excess sodium hydroxide.',
            correctInf: 'Cu²⁺ confirmed present (Cu(OH)₂ formed, insoluble in excess NaOH).'
          },
          {
            id: 'c4_nh3',
            prompt: '(iv) To 2 cm³ of the blue solution, add 2M aqueous NH₃ dropwise until in excess.',
            correctObs: 'Pale blue precipitate formed, dissolves in excess aqueous ammonia to give a deep royal blue solution.',
            correctInf: 'Cu²⁺ confirmed (formation of tetraamminecopper(II) complex [Cu(NH₃)₄]²⁺).'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme & Scoring Rubric
- **Question 1: Thermochemistry (15 Marks)**
  - Table of temperature readings: 5.0 Marks (CT: Complete table 1M, D: Temperatures to 1 d.p. ending in .0 or .5 1M, A: Accuracy of T₃ within ±1.0°C 1M, Mean T₀ calculation 1M, ΔT calculation 1M).
  - Temperature rise ΔT: 1.0 Mark (ΔT = T₃ - T₀ = 28.5 - 22.0 = 6.5°C).
  - Heat evolved Q = mcΔT: 3.0 Marks (Substitution: 100 g × 4.2 J/g/K × 6.5 K = 2,730 J / 2.73 kJ).
  - Moles of water formed: 2.0 Marks (Moles = (1.0 × 50)/1000 = 0.050 mol).
  - Molar enthalpy of neutralization: 4.0 Marks (ΔH = -(2.73 kJ / 0.050 mol) = -54.6 kJ/mol. Deduct 1/2 mark if negative sign is omitted; deduct 1/2 mark for incorrect units).
- **Question 2: Qualitative Basic Carbonate (15 Marks)**
  - Action of heat: 4.0 Marks (2 mk Obs: green solid turns black, lime water milky; 2 mk Inf: CO₃²⁻ present).
  - Addition of dilute HNO₃: 3.0 Marks (1 mk Obs: black solid dissolves to blue solution; 2 mk Inf: Cu²⁺ present).
  - NaOH dropwise & excess: 4.0 Marks (2 mk Obs: pale blue ppt insoluble; 2 mk Inf: Cu²⁺ confirmed).
  - Aqueous NH₃ dropwise & excess: 4.0 Marks (2 mk Obs: pale blue ppt soluble to deep blue solution; 2 mk Inf: Cu²⁺ confirmed).`,
    confidentialPrepGuide: `### Confidential Instructions to School Science Laboratory Technicians
**1. Thermochemistry Reagents per Candidate:**
- 100 cm³ of 1.0 M Hydrochloric acid (HCl) labeled **Solution A**.
- 100 cm³ of 1.0 M Sodium hydroxide (NaOH) labeled **Solution B**.
- 1 × Plastic beaker / calorimeter (150-250 cm³).
- 1 × Thermometer (0–100°C graduated to 0.5°C or 1.0°C).
- 1 × 50 cm³ or 100 cm³ measuring cylinder.
**2. Qualitative Reagents per Candidate:**
- About 2.0 g of Copper(II) carbonate in a stoppered tube labeled **Solid C**.
- Access to: 2M dilute HNO₃, 2M NaOH, 2M aqueous NH₃, lime water in a dropper bottle, Bunsen burner, test tubes (5), and test tube holder.`
  },

  rates: {
    title: 'KCSE Chemistry Practical Mock — Reaction Kinetics (Disappearing Cross Practical)',
    formLevel: 'Form 3',
    titrationType: 'rates',
    instructions: 'You are provided with 0.20 M Sodium thiosulfate (Solution A), 2.0 M Hydrochloric acid (Solution B), and Solid D. You are required to investigate the effect of concentration on reaction rate and identify Solid D.',
    durationMinutes: 90,
    examConfig: {
      presetKey: 'rates_disappearing_cross',
      q1: {
        simulationType: 'rates',
        reactionType: 'disappearing_cross',
        solutionA: '0.20 M Sodium Thiosulfate (Na₂S₂O₃)',
        solutionB: '2.0 M Hydrochloric Acid (HCl)',
        dataPoints: [
          { exp: 1, volThio: 50, volWater: 0, timeSec: 18.0, rate: 0.056 },
          { exp: 2, volThio: 40, volWater: 10, timeSec: 23.0, rate: 0.043 },
          { exp: 3, volThio: 30, volWater: 20, timeSec: 32.0, rate: 0.031 },
          { exp: 4, volThio: 20, volWater: 30, timeSec: 49.0, rate: 0.020 },
          { exp: 5, volThio: 10, volWater: 40, timeSec: 102.0, rate: 0.010 }
        ],
        marks: 15,
        instructions: 'Measure the indicated volumes of Solution A and water into a 100 cm³ beaker placed on top of a white card marked with a black cross. Add 10 cm³ of Solution B, swirl and start the stopwatch. Record the time taken for the cross to be completely obscured.'
      },
      q2: {
        sampleName: 'Solid D',
        sampleDesc: 'A pure white crystalline inorganic chloride salt.',
        trueSaltKey: 'BaCl2',
        trueSaltName: 'Barium Chloride — BaCl₂',
        trueCation: 'Ba2+',
        trueAnion: 'Cl-',
        marks: 15,
        tests: [
          {
            id: 'd1_sol',
            prompt: '(i) Describe the appearance of Solid D and dissolve in about 10 cm³ of distilled water.',
            correctObs: 'White crystalline solid dissolves completely to give a clear colorless solution.',
            correctInf: 'Soluble salt; absence of colored transition metal ions.'
          },
          {
            id: 'd2_flame',
            prompt: '(ii) Clean a glass rod or nichrome wire with conc. HCl and perform a flame test on the solution.',
            correctObs: 'Pale apple-green persistent flame coloration observed.',
            correctInf: 'Ba²⁺ confirmed present.'
          },
          {
            id: 'd3_sulfate',
            prompt: '(iii) To 2 cm³ of solution D, add 3 drops of dilute H₂SO₄ or Na₂SO₄ solution.',
            correctObs: 'Dense white precipitate formed, insoluble in dilute HCl or HNO₃.',
            correctInf: 'Ba²⁺ confirmed (formation of insoluble BaSO₄).'
          },
          {
            id: 'd4_chloride',
            prompt: '(iv) To 2 cm³ of solution D, add 3 drops of dilute HNO₃ followed by 3 drops of AgNO₃ solution.',
            correctObs: 'White precipitate formed, soluble in excess aqueous ammonia.',
            correctInf: 'Cl⁻ confirmed present (formation of AgCl).'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme & Scoring Rubric
- **Question 1: Reaction Rates Table & Graph (15 Marks)**
  - Table of results (5 Marks): CT: Complete table 1M, D: Time in whole seconds or to 1 d.p. 1M, A: Trend accuracy (time increases as thiosulfate volume decreases) 1M, Reciprocal 1/t computed to 3 decimal places 2M.
  - Graph of 1/t against Volume of Na₂S₂O₃ (5 Marks):
    - Scale (S - 1 Mark): Uniform scale on both axes covering at least 50% of the grid.
    - Axes (A - 1 Mark): Correctly labeled with quantity and units [Volume (cm³), 1/t (s⁻¹)].
    - Plotting (P - 2 Marks): All 5 points accurately plotted within 1/2 of a small square.
    - Curve / Line (C - 1 Mark): Smooth straight line passing through the origin (0,0).
  - Rate deductions (5 Marks):
    - Explaining trend (2 Marks): Rate of reaction is directly proportional to concentration of sodium thiosulfate.
    - Reading from graph (2 Marks): Value read correctly from candidate's graph for specified volume.
    - Time calculation (1 Mark): Reciprocal t = 1 / (rate from graph).
- **Question 2: Qualitative Salt Analysis (15 Marks)**
  - Physical appearance & solubility: 2.0 Marks (1 mk Obs, 1 mk Inf).
  - Flame test: 4.0 Marks (2 mk Obs: apple-green flame; 2 mk Inf: Ba²⁺ confirmed).
  - Dilute H₂SO₄ test: 4.0 Marks (2 mk Obs: dense white ppt; 2 mk Inf: Ba²⁺ confirmed).
  - AgNO₃ + HNO₃ test: 5.0 Marks (2 mk Obs: white ppt; 3 mk Inf: Cl⁻ confirmed).`,
    confidentialPrepGuide: `### Confidential Instructions to School Science Laboratory Technicians
**1. Reaction Rates Reagents per Candidate:**
- 200 cm³ of 0.20 M Sodium thiosulfate (Na₂S₂O₃) labeled **Solution A** (prepared by dissolving 31.6 g of Na₂S₂O₃·5H₂O in 1 dm³ of distilled water).
- 100 cm³ of 2.0 M Hydrochloric acid (HCl) labeled **Solution B**.
- 1 × White card or paper marked with a distinct black cross (X) with 0.5 mm ballpoint or marker pen.
- 1 × 100 cm³ glass beaker (must have clean, clear, unetched flat bottom).
- 1 × Stopwatch or stop clock readable to 0.1 second.
- 1 × 50 cm³ measuring cylinder and 1 × 10 cm³ measuring cylinder.
**2. Qualitative Reagents per Candidate:**
- About 2.0 g of Barium chloride crystals in a stoppered tube labeled **Solid D**.
- Access to: Dilute 2M H₂SO₄, 0.1M AgNO₃, 2M dilute HNO₃, concentrated HCl for cleaning wire, nichrome wire / glass rod, Bunsen burner.`
  },

  gas: {
    title: 'KCSE Chemistry Practical Mock — Gas Preparation, Purification & Chemical Properties',
    formLevel: 'Form 2',
    titrationType: 'gas',
    instructions: 'You are provided with marble chips (Solid E), 2.0 M Hydrochloric acid (Solution F), and testing reagents. You are required to prepare carbon(IV) oxide gas and examine its physical and chemical properties.',
    durationMinutes: 60,
    examConfig: {
      presetKey: 'gas_co2',
      q1: {
        simulationType: 'gas',
        gasKey: 'CO2',
        gasName: 'Carbon(IV) Oxide — CO₂',
        reagentSolid: 'Calcium Carbonate (CaCO₃) marble chips',
        reagentLiquid: '2.0 M Hydrochloric Acid (HCl)',
        dryingAgent: 'Concentrated Sulfuric(VI) Acid (H₂SO₄)',
        collectionMethod: 'Downward delivery (upward displacement of air)',
        marks: 15,
        instructions: 'Assemble the gas generation apparatus using the flat-bottomed flask and thistle funnel. Add Solid E into the flask, run Solution F through the thistle funnel, pass the gas through the drying agent, and collect two gas jars of dry gas.'
      },
      q2: {
        sampleName: 'Solution E',
        sampleDesc: 'Clear colorless solution remaining in the reaction flask after reaction ceases.',
        trueSaltKey: 'CaCl2',
        trueSaltName: 'Calcium Chloride — CaCl₂',
        trueCation: 'Ca2+',
        trueAnion: 'Cl-',
        marks: 15,
        tests: [
          {
            id: 'e1_litmus',
            prompt: '(i) Test 2 cm³ of Solution E with red and blue litmus paper.',
            correctObs: 'Both red and blue litmus paper remain unchanged / neutral pH ~ 6-7.',
            correctInf: 'Neutral salt solution formed.'
          },
          {
            id: 'e2_naoh',
            prompt: '(ii) To 2 cm³ of Solution E, add 2M NaOH dropwise until in excess.',
            correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide.',
            correctInf: 'Ca²⁺ or Mg²⁺ present (Ca(OH)₂ formed).'
          },
          {
            id: 'e3_nh3',
            prompt: '(iii) To 2 cm³ of Solution E, add 2M aqueous ammonia dropwise until in excess.',
            correctObs: 'No precipitate formed with aqueous ammonia in drops or excess.',
            correctInf: 'Ca²⁺ confirmed present (Mg²⁺ gives white precipitate with NH₃).'
          },
          {
            id: 'e4_chloride',
            prompt: '(iv) To 2 cm³ of Solution E, add 3 drops of dilute HNO₃ followed by 3 drops of AgNO₃.',
            correctObs: 'White precipitate formed, dissolves readily in aqueous ammonia.',
            correctInf: 'Cl⁻ confirmed present.'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme & Scoring Rubric
- **Question 1: Gas Preparation & Properties (15 Marks)**
  - Balanced equation: 2.0 Marks (CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g). Deduct 1/2 mark for missing state symbols).
  - Drying agent selection: 2.0 Marks (Concentrated H₂SO₄ or anhydrous CaCl₂; Calcium oxide (CaO) cannot be used because CaO is a basic oxide that reacts with acidic CO₂ to form CaCO₃).
  - Method of collection: 2.0 Marks (Downward delivery / upward displacement of air because CO₂ is denser than air).
  - Confirmatory test 1 (Lime water): 3.0 Marks (White precipitate formed due to insoluble CaCO₃; with excess CO₂, precipitate dissolves to give a colorless solution due to soluble Ca(HCO₃)₂).
  - Confirmatory test 2 (Burning splint): 2.0 Marks (Flame extinguished / burning splint goes off because CO₂ does not support combustion).
  - Acidic property (Moist litmus): 2.0 Marks (Moist blue litmus paper turns red because CO₂ dissolves to form weak carbonic acid H₂CO₃).
  - Diagram labeling & setup: 2.0 Marks (Airtight thistle funnel dipping below liquid level, delivery tube correctly aligned).
- **Question 2: Qualitative Salt Analysis (15 Marks)**
  - Litmus test: 2.0 Marks (1 mk Obs, 1 mk Inf).
  - 2M NaOH test: 4.0 Marks (2 mk Obs: white ppt insoluble; 2 mk Inf: Ca²⁺/Mg²⁺ present).
  - Aqueous NH₃ test: 4.0 Marks (2 mk Obs: no ppt; 2 mk Inf: Ca²⁺ confirmed).
  - AgNO₃ + HNO₃ test: 5.0 Marks (2 mk Obs: white ppt; 3 mk Inf: Cl⁻ confirmed).`,
    confidentialPrepGuide: `### Confidential Instructions to School Science Laboratory Technicians
**1. Gas Chemistry Apparatus per Candidate:**
- 1 × Flat-bottomed flask (250 cm³) with 2-hole rubber bung.
- 1 × Thistle funnel and glass delivery tubes.
- 1 × Gas wash bottle containing 50 cm³ concentrated H₂SO₄ (or U-tube with anhydrous CaCl₂).
- 2 × Clean gas jars with cover slips.
- 100 cm³ of 2.0 M Hydrochloric acid labeled **Solution F**.
- About 20 g of marble chips (CaCO₃) labeled **Solid E**.
- Access to: Calcium hydroxide solution (lime water) in dropper bottle, wooden splints, Bunsen burner, red and blue litmus paper.
**2. Qualitative Analysis Reagents per Candidate:**
- Access to: 2M NaOH, 2M aqueous NH₃, 0.1M AgNO₃, 2M dilute HNO₃, test tubes and rack.`
  },

  solubility: {
    title: 'KCSE Chemistry Practical Mock — Solubility Curve & Crystallization of Potassium Salts',
    formLevel: 'Form 3',
    titrationType: 'solubility',
    instructions: 'You are provided with 5.00 g of Potassium chlorate (Solid G), boiling tube, thermometer, and distilled water. You are required to determine the crystallization temperature with varying water volumes and plot a solubility curve.',
    durationMinutes: 90,
    examConfig: {
      presetKey: 'solubility_kclo3',
      q1: {
        simulationType: 'solubility',
        soluteName: 'Potassium Chlorate (KClO₃)',
        soluteMassGrams: 5.00,
        dataPoints: [
          { volWater: 10.0, tempCryst: 82.0, solubilityGramsPer100g: 50.0 },
          { volWater: 14.0, tempCryst: 68.0, solubilityGramsPer100g: 35.7 },
          { volWater: 18.0, tempCryst: 56.0, solubilityGramsPer100g: 27.8 },
          { volWater: 22.0, tempCryst: 44.0, solubilityGramsPer100g: 22.7 }
        ],
        marks: 15,
        instructions: 'Place 5.00 g of Solid G in a clean boiling tube. Add 10.0 cm³ of distilled water from a burette. Warm the mixture gently with stirring until all crystals dissolve. Allow to cool while stirring with the thermometer and record the exact temperature at which the first crystals appear. Add 4.0 cm³ more water and repeat.'
      },
      q2: {
        sampleName: 'Solid G',
        sampleDesc: 'A pure white crystalline inorganic potassium salt.',
        trueSaltKey: 'KClO3',
        trueSaltName: 'Potassium Chlorate — KClO₃',
        trueCation: 'K+',
        trueAnion: 'ClO3-',
        marks: 15,
        tests: [
          {
            id: 'g1_flame',
            prompt: '(i) Clean a nichrome wire with conc. HCl and perform a flame test on Solid G, viewing through cobalt blue glass.',
            correctObs: 'Lilac / purple flame coloration observed clearly through cobalt blue glass.',
            correctInf: 'K⁺ confirmed present.'
          },
          {
            id: 'g2_heat',
            prompt: '(ii) Heat a half-spatula of Solid G in a dry test tube and test the gas evolved with a glowing splint.',
            correctObs: 'Solid decrepitates and melts; colorless odorless gas evolved rekindles / relights a glowing splint.',
            correctInf: 'O₂ gas evolved; chlorate salt decomposes to chloride and oxygen (ClO₃⁻ present).'
          },
          {
            id: 'g3_residue_chloride',
            prompt: '(iii) Dissolve the residue from (ii) in 5 cm³ distilled water, add 3 drops of dilute HNO₃ followed by 3 drops of AgNO₃.',
            correctObs: 'Dense white precipitate formed on addition of silver nitrate.',
            correctInf: 'Cl⁻ confirmed present (formed from decomposition of chlorate KClO₃ → KCl + 1.5 O₂).'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme & Scoring Rubric
- **Question 1: Solubility Curve & Calculations (15 Marks)**
  - Table of crystallization temperatures (5 Marks): CT: Complete table 1M, D: Temperatures recorded to 1 d.p. 1M, A: Trend accuracy (crystallization temp drops with increasing water volume) 1M, Solubility in g/100g water correctly calculated 2M.
  - Graph of Solubility against Temperature (5 Marks):
    - Scale (S - 1 Mark): Uniform scale on both axes covering >= 50% grid.
    - Axes (A - 1 Mark): Correctly labeled with units [Temperature (°C), Solubility (g/100g water)].
    - Plotting (P - 2 Marks): All points plotted accurately within 1/2 of a small square.
    - Curve (C - 1 Mark): Smooth curve drawn through plotted points.
  - Deductions from graph (5 Marks):
    - Solubility from graph at specified temp (2 Marks): Value read with showing on graph.
    - Calculation of crystal yield (3 Marks): Yield = Solubility at T_high - Solubility at T_low.
- **Question 2: Qualitative Analysis (15 Marks)**
  - Flame test: 5.0 Marks (2 mk Obs: lilac flame through cobalt glass; 3 mk Inf: K⁺ confirmed).
  - Thermal decomposition: 5.0 Marks (2 mk Obs: glowing splint relit; 3 mk Inf: O₂ evolved / chlorate present).
  - Confirmatory chloride test on residue: 5.0 Marks (2 mk Obs: white ppt with AgNO₃; 3 mk Inf: Cl⁻ confirmed).`,
    confidentialPrepGuide: `### Confidential Instructions to School Science Laboratory Technicians
**1. Solubility Reagents per Candidate:**
- Exactly 5.00 g of Potassium chlorate (KClO₃) crystals weighed into a dry boiling tube labeled **Solid G**.
- 1 × Clean boiling tube (25 × 150 mm) with clamp and retort stand.
- 1 × Thermometer (-10 to 110°C graduated to 0.5°C or 1.0°C).
- 1 × 50 cm³ burette filled with distilled water for accurate aliquot dispensing.
- 1 × 400 cm³ beaker for hot water bath and Bunsen burner with tripod and wire gauze.
**2. Qualitative Analysis Reagents per Candidate:**
- Access to: Nichrome wire, cobalt blue glass, concentrated HCl, wooden splints, 0.1M AgNO₃, 2M dilute HNO₃.`
  },

  twosalt: {
    title: 'KCSE Chemistry Paper 3 Mock — Advanced Two-Salt Mixture Separation (Merit Challenge)',
    formLevel: 'Form 4',
    titrationType: 'kcseComposite',
    instructions: 'You are provided with 0.050 M Sulfuric(VI) acid (Solution A), 0.100 M Sodium hydroxide (Solution B), Solid Mixture P (containing two salts), and Liquid Q. Complete all experiments according to KNEC instructions.',
    durationMinutes: 135,
    examConfig: {
      presetKey: 'merit_twosalt',
      q1: {
        calcType: 'dibasic_acid',
        solutionA: '0.050 M Sulfuric(VI) Acid (H₂SO₄)',
        solutionB: '0.100 M Sodium Hydroxide (NaOH)',
        ratioA: 1,
        ratioB: 2,
        pipetteVolume: 25.0,
        indicator: 'phenolphthalein',
        equation: 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l)',
        trueAcidMolarity: 0.050,
        trueBaseMolarity: 0.100,
        trueTitre: 25.00,
        marks: 15,
        instructions: 'Pipette 25.0 cm³ of Solution B into a conical flask, add 2 drops of phenolphthalein indicator, and titrate with Solution A from the burette.'
      },
      q2: {
        sampleName: 'Solid Mixture P',
        sampleDesc: 'White crystalline solid mixture containing one soluble and one insoluble salt.',
        trueSaltKey: 'ZnSO4 + BaSO4',
        trueSaltName: 'Zinc Sulfate + Barium Sulfate Mixture',
        trueCation: 'Zn2+, Ba2+',
        trueAnion: 'SO42-',
        marks: 15,
        tests: [
          {
            id: 'm1_sep',
            prompt: '(i) Place Solid Mixture P in a 100 cm³ beaker, add 15 cm³ distilled water, stir thoroughly and filter. Retain both filtrate and residue.',
            correctObs: 'White residue remains on the filter paper; clear colorless filtrate collected in the boiling tube.',
            correctInf: 'Mixture contains an insoluble salt (residue) and a soluble salt (filtrate).'
          },
          {
            id: 'm2_naoh_filtrate',
            prompt: '(ii) To 2 cm³ of the filtrate, add 2M NaOH dropwise until in excess.',
            correctObs: 'White precipitate formed, dissolves in excess NaOH to form a colorless solution.',
            correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present in filtrate.'
          },
          {
            id: 'm3_nh3_filtrate',
            prompt: '(iii) To 2 cm³ of the filtrate, add 2M aqueous NH₃ dropwise until in excess.',
            correctObs: 'White precipitate formed, dissolves completely in excess aqueous NH₃.',
            correctInf: 'Zn²⁺ confirmed present in filtrate (Al³⁺ and Pb²⁺ are insoluble in excess NH₃).'
          },
          {
            id: 'm4_anion_filtrate',
            prompt: '(iv) To 2 cm³ of the filtrate, add 3 drops of dilute HNO₃ followed by 3 drops of Ba(NO₃)₂ solution.',
            correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid.',
            correctInf: 'SO₄²⁻ confirmed present in filtrate.'
          },
          {
            id: 'm5_residue_acid',
            prompt: '(v) Transfer a half-spatula of the residue into a test tube and add 2 cm³ of 2M dilute HCl.',
            correctObs: 'Residue remains completely insoluble in dilute hydrochloric acid; no effervescence observed.',
            correctInf: 'Insoluble barium sulfate (BaSO₄) confirmed in residue; carbonate absent.'
          }
        ]
      },
      q3: {
        sampleName: 'Liquid Q',
        sampleDesc: 'A clear colorless pungent organic liquid.',
        trueOrganicKey: 'Ethanoic Acid',
        trueOrganicName: 'Ethanoic Acid — CH₃COOH',
        trueFunctionalGroup: 'Carboxylic Acid (-COOH)',
        marks: 10,
        tests: [
          {
            id: 'q3_litmus',
            prompt: '(a) Place 2 cm³ of Liquid Q in a test tube and test with red and blue litmus paper.',
            correctObs: 'Blue litmus paper turns red; red litmus paper remains red.',
            correctInf: 'Acidic organic compound / contains H⁺ ions / -COOH group.'
          },
          {
            id: 'q3_nahco3',
            prompt: '(b) To 2 cm³ of Liquid Q, add half a spatula of solid NaHCO₃.',
            correctObs: 'Rapid effervescence / bubbling of a colorless gas that turns lime water milky.',
            correctInf: '-COOH / Carboxylic acid group confirmed.'
          },
          {
            id: 'q3_kmno4',
            prompt: '(c) To 2 cm³ of Liquid Q, add 3 drops of acidified KMnO₄ and warm gently.',
            correctObs: 'Purple color of acidified KMnO₄ persists / is not decolorized.',
            correctInf: 'Absence of easily oxidizable -OH group / unsaturation.'
          },
          {
            id: 'q3_ignition',
            prompt: '(d) Ignite 3 drops of Liquid Q on a clean metallic spatula in a Bunsen burner flame.',
            correctObs: 'Burns with a non-luminous, clear blue flame without smoke.',
            correctInf: 'Short-chain saturated aliphatic compound with low carbon-to-hydrogen ratio.'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme & Scoring Rubric
- **Question 1: Dibasic Acid Neutralization (15 Marks)**
  - Table of readings: 5.0 Marks (CT 1M, D 1M, A within ±0.20 cm³ 1M, PA 1M, FA 1M).
  - Average titre calculation: 1.0 Mark.
  - Moles of NaOH pipetted: 2.0 Marks (Moles = (0.100 × 25.0)/1000 = 0.00250 mol).
  - Stoichiometry & mole ratio: 2.0 Marks (Mole ratio H₂SO₄ : NaOH = 1 : 2).
  - Moles of H₂SO₄ reacting: 2.0 Marks (Moles = 0.00250 / 2 = 0.00125 mol).
  - Concentration / Molarity of H₂SO₄: 3.0 Marks (M = (0.00125 × 1000) / 25.00 = 0.050 M).
- **Question 2: Two-Salt Separation & Identification (15 Marks)**
  - Separation procedure: 2.0 Marks (Residue + filtrate identified).
  - NaOH test on filtrate: 3.0 Marks (Zn²⁺, Al³⁺, Pb²⁺ present).
  - NH₃ test on filtrate: 4.0 Marks (Zn²⁺ confirmed).
  - Ba(NO₃)₂ test on filtrate: 3.0 Marks (SO₄²⁻ confirmed).
  - Insoluble residue test: 3.0 Marks (BaSO₄ confirmed).
- **Question 3: Organic Functional Group (10 Marks)**
  - Litmus test: 2.5 Marks (Turns blue litmus red -> acidic / -COOH).
  - NaHCO₃ effervescence: 3.0 Marks (CO₂ gas evolved -> -COOH confirmed).
  - KMnO₄ test: 2.0 Marks (Color persists -> saturated).
  - Spatula flame: 2.5 Marks (Clean blue flame -> low C:H ratio).`,
    confidentialPrepGuide: `### Confidential Instructions to School Science Laboratory Technicians
**1. Volumetric Reagents per Candidate:**
- 150 cm³ of 0.050 M Sulfuric(VI) acid labeled **Solution A**.
- 150 cm³ of 0.100 M Sodium hydroxide labeled **Solution B**.
- Phenolphthalein indicator, burette (50 cm³), pipette (25 cm³), 2 conical flasks (250 cm³).
**2. Qualitative Analysis Reagents per Candidate:**
- 2.0 g of a homogeneous 1:1 mixture of Zinc sulfate and Barium sulfate labeled **Solid Mixture P**.
- Filter funnel and 2 filter papers, 100 cm³ beaker, wash bottle with distilled water.
- Access to: 2M NaOH, 2M aqueous NH₃, 0.5M Ba(NO₃)₂, 2M dilute HNO₃, 2M dilute HCl.
**3. Organic Analysis Reagents per Candidate:**
- 10 cm³ of glacial / pure Ethanoic acid labeled **Liquid Q**.
- Access to: Red and blue litmus paper, solid NaHCO₃, acidified KMnO₄, Bunsen burner, metallic spatula.`
  }
};

/**
 * Supported simulation types for flexible exam paper parsing.
 * 'written' is the catch-all for question types without an existing interactive simulation.
 */
const SUPPORTED_SIMULATION_TYPES = [
  'titration',    // acid-base / redox / back-titration volumetric analysis
  'qualitative',  // inorganic salt identification
  'organic',      // organic functional group identification
  'energy',       // thermochemistry / enthalpy
  'rates',        // reaction kinetics / clock reactions
  'gas',          // gas preparation and collection
  'solubility',   // solubility curve / crystallization
  'written'       // any other question type → structured written response
];

/**
 * Converts legacy q1/q2/q3 examConfig format to new flexible questions[] array,
 * or passes through an existing questions[] array with validation.
 * Maintains full backward compatibility.
 */
function normalizeQuestionsArray(parsed) {
  // If already has questions array, validate and return it
  if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
    return parsed.questions.map((q, i) => {
      const simType = SUPPORTED_SIMULATION_TYPES.includes(q.simulationType) ? q.simulationType : 'written';
      let cfg = q.config ? { ...q.config } : null;

      if (simType === 'titration' && cfg) {
        if (cfg.trueTitre != null) {
          cfg.trueTitre = Number(cfg.trueTitre);
        } else if (cfg.trueAcidMolarity && cfg.trueBaseMolarity) {
          const rA = Number(cfg.ratioA || 1);
          const rB = Number(cfg.ratioB || 1);
          const pVol = Number(cfg.pipetteVolume || 25.0);
          cfg.trueTitre = parseFloat(((rA * Number(cfg.trueBaseMolarity) * pVol) / (rB * Number(cfg.trueAcidMolarity))).toFixed(2));
        }

        if (Array.isArray(cfg.procedures) && cfg.procedures.length > 0) {
          cfg.hasMultipleProcedures = true;
          cfg.procedures = cfg.procedures.map((proc, pIdx) => {
            let pTitre = proc.trueTitre != null ? Number(proc.trueTitre) : null;
            if (!pTitre && proc.trueAcidMolarity && proc.trueBaseMolarity) {
              const rA = Number(proc.ratioA || 1);
              const rB = Number(proc.ratioB || 1);
              const pVol = Number(proc.pipetteVolume || 25.0);
              pTitre = parseFloat(((rA * Number(proc.trueBaseMolarity) * pVol) / (rB * Number(proc.trueAcidMolarity))).toFixed(2));
            }
            return {
              procedureIndex: proc.procedureIndex || pIdx + 1,
              title: proc.title || `Procedure ${pIdx === 0 ? 'I' : (pIdx === 1 ? 'II' : pIdx + 1)}`,
              instructions: proc.instructions || '',
              solutionA: proc.solutionA || cfg.solutionA || 'Solution A',
              solutionB: proc.solutionB || cfg.solutionB || 'Solution B',
              pipetteVolume: Number(proc.pipetteVolume) || 25.0,
              indicator: proc.indicator || 'Phenolphthalein',
              indicatorStartColor: proc.indicatorStartColor || (proc.indicator && proc.indicator.toLowerCase().includes('methyl') ? '#FBBF24' : '#F472B6'),
              indicatorEndColor: proc.indicatorEndColor || (proc.indicator && proc.indicator.toLowerCase().includes('methyl') ? '#FB7185' : 'transparent'),
              trueTitre: pTitre || Number(cfg.trueTitre) || 25.0,
              tableTitle: proc.tableTitle || `Table ${pIdx + 1}: Titration Results`,
              tableMarks: Number(proc.tableMarks) || 4.0,
              questions: Array.isArray(proc.questions) ? proc.questions : []
            };
          });

          // Backfill top-level solutionA/solutionB/indicator from Procedure I if omitted at root
          if (!cfg.solutionA && cfg.procedures[0]?.solutionA) cfg.solutionA = cfg.procedures[0].solutionA;
          if (!cfg.solutionB && cfg.procedures[0]?.solutionB) cfg.solutionB = cfg.procedures[0].solutionB;
          if (!cfg.indicator && cfg.procedures[0]?.indicator) cfg.indicator = cfg.procedures[0].indicator;
          if (!cfg.trueTitre && cfg.procedures[0]?.trueTitre) cfg.trueTitre = cfg.procedures[0].trueTitre;
        }
      }

      if (simType === 'qualitative') {
        if (!cfg) {
          cfg = {
            sampleName: (q.title && q.title.match(/Solid\s+[A-Z]/i) ? q.title.match(/Solid\s+[A-Z]/i)[0] : (q.number === 2 ? 'Solid Q' : 'Solid P')),
            sampleDesc: q.prompt || 'An inorganic salt sample.',
            marks: Number(q.marks) || 10,
            tests: []
          };
        }
        cfg.sampleName = cfg.sampleName || (q.title && q.title.match(/Solid\s+[A-Z]/i) ? q.title.match(/Solid\s+[A-Z]/i)[0] : (q.number === 2 ? 'Solid Q' : 'Solid P'));
        
        if (Array.isArray(cfg.tests) && cfg.tests.length > 0) {
          cfg.tests = cfg.tests.map((t, tIdx) => ({
            id: t.id || `test_${tIdx + 1}`,
            prompt: t.prompt || t.test || t.procedure || t.text || t.instruction || (typeof t === 'string' ? t : `Test ${tIdx + 1}`),
            correctObs: t.correctObs || t.observation || t.expectedObservation || t.modelAnswer || '',
            correctInf: t.correctInf || t.inference || t.expectedInference || '',
            marks: Number(t.marks) || 1.0
          }));
        } else if (Array.isArray(q.subQuestions) && q.subQuestions.length > 0) {
          cfg.tests = q.subQuestions.map((sq, sqIdx) => ({
            id: sq.id || `test_${sqIdx + 1}`,
            prompt: sq.text || sq.prompt || `(${sq.id || String.fromCharCode(97 + sqIdx)}) Carry out test procedure`,
            correctObs: sq.modelAnswer || '',
            correctInf: '',
            marks: Number(sq.marks) || 1.0
          }));
        }

        const explicitDeductionInSubQuestions = Array.isArray(q.subQuestions) && q.subQuestions.some(sq =>
          /cation.*anion|anion.*cation|identity of (the )?salt|formula of (the )?(cation|anion|salt)|final deduction/i.test(sq.text || sq.prompt || '')
        );
        const explicitDeductionInTests = Array.isArray(cfg.tests) && cfg.tests.some(t =>
          /final deduction|state the (cation|anion|identity)|write the formula of (the )?(cation|anion|salt)/i.test(t.prompt || '')
        );
        cfg.hasDeduction = Boolean(
          cfg.hasDeduction === true ||
          explicitDeductionInSubQuestions ||
          explicitDeductionInTests
        );
      } else if (simType === 'organic') {
        if (cfg && Array.isArray(cfg.tests) && cfg.tests.length > 0) {
          cfg.tests = cfg.tests.map((t, tIdx) => ({
            id: t.id || `test_${tIdx + 1}`,
            prompt: t.prompt || t.test || t.procedure || t.text || t.instruction || (typeof t === 'string' ? t : `Test ${tIdx + 1}`),
            correctObs: t.correctObs || t.observation || t.expectedObservation || t.modelAnswer || '',
            correctInf: t.correctInf || t.inference || t.expectedInference || '',
            marks: Number(t.marks) || 1.0
          }));
        } else if (Array.isArray(q.subQuestions) && q.subQuestions.length > 0) {
          if (!cfg) cfg = { sampleName: 'Liquid Z', marks: Number(q.marks) || 10, tests: [] };
          cfg.tests = q.subQuestions.map((sq, sqIdx) => ({
            id: sq.id || `test_${sqIdx + 1}`,
            prompt: sq.text || sq.prompt || `(${sq.id || String.fromCharCode(97 + sqIdx)}) Carry out test procedure`,
            correctObs: sq.modelAnswer || '',
            correctInf: '',
            marks: Number(sq.marks) || 1.0
          }));
        }
      }

      return {
        number: q.number || i + 1,
        title: q.title || `Question ${i + 1}`,
        simulationType: simType,
        marks: Number(q.marks) || 10,
        config: cfg,
        prompt: q.prompt || '',
        subQuestions: Array.isArray(q.subQuestions) ? q.subQuestions : []
      };
    });
  }

  // Legacy: convert q1/q2/q3 to questions[]
  const questions = [];
  const cfg = parsed.examConfig || {};

  if (cfg.q1) {
    questions.push({
      number: 1,
      title: cfg.q1.title || 'Volumetric Analysis',
      simulationType: (() => {
        const type = parsed.titrationType || '';
        if (type === 'qualitative') return 'qualitative';
        if (type === 'organic') return 'organic';
        if (type === 'energy' || type === 'displacement' || type === 'neutralization') return 'energy';
        if (type === 'rates' || type === 'kinetics') return 'rates';
        if (type === 'gas') return 'gas';
        if (type === 'solubility') return 'solubility';
        return 'titration';
      })(),
      marks: Number(cfg.q1.marks) || 15,
      config: cfg.q1,
      prompt: '',
      subQuestions: []
    });
  }
  if (cfg.q2) {
    questions.push({
      number: 2,
      title: cfg.q2.title || 'Qualitative Salt Analysis',
      simulationType: 'qualitative',
      marks: Number(cfg.q2.marks) || 15,
      config: cfg.q2,
      prompt: '',
      subQuestions: []
    });
  }
  if (cfg.q3) {
    const isQ3Inorganic = Boolean(
      cfg.q3.trueSaltKey ||
      cfg.q3.trueCation ||
      (cfg.q3.sampleName && /solid/i.test(cfg.q3.sampleName)) ||
      (cfg.q3.tests && cfg.q3.tests.some(t => /naoh|ammonia|nh3|precipitation|cation|anion/i.test(t.prompt || '')))
    );
    questions.push({
      number: 3,
      title: cfg.q3.title || (isQ3Inorganic ? 'Inorganic Qualitative Analysis' : 'Organic Functional Group Analysis'),
      simulationType: isQ3Inorganic ? 'qualitative' : 'organic',
      marks: Number(cfg.q3.marks) || 10,
      config: cfg.q3,
      prompt: '',
      subQuestions: []
    });
  }

  return questions;
}

// Pre-populate questions[] array on all fallback presets
Object.keys(FALLBACK_PRESETS).forEach(key => {
  FALLBACK_PRESETS[key].questions = normalizeQuestionsArray(FALLBACK_PRESETS[key]);
});

/**
 * Call Gemini REST API with optional multimodal parts (base64 documents / images).
 * Supports both single fileData and multiple documents in files array.
 */
async function callGeminiAssistant({ prompt, files = [], fileData = null, mimeType = null, maxTokens = EXAM_MAX_TOKENS }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const parts = [{ text: prompt }];

  const docList = Array.isArray(files) && files.length > 0
    ? files
    : (fileData ? [{ dataUrl: fileData, type: mimeType, name: 'document', role: 'question_paper' }] : []);

  for (let i = 0; i < docList.length; i++) {
    const doc = docList[i];
    const rawData = doc.dataUrl || doc.fileData;
    if (!rawData || typeof rawData !== 'string') continue;

    // Normalize mimeType: Gemini requires standard MIME types like application/pdf, image/png, image/jpeg, etc.
    let resolvedMime = (doc.type || doc.mimeType || '').trim().toLowerCase();
    if (!resolvedMime || resolvedMime === 'application/octet-stream' || resolvedMime === 'application/x-pdf') {
      resolvedMime = 'application/pdf';
    }

    // Strip data URL header efficiently without creating multiple multi-megabyte copies in V8
    let cleanBase64 = rawData;
    const commaIdx = rawData.indexOf('base64,');
    if (commaIdx !== -1) {
      cleanBase64 = rawData.substring(commaIdx + 7);
    }
    cleanBase64 = cleanBase64.trim();

    if (docList.length > 1 || doc.role) {
      const docLabel = doc.name ? `Attached File: ${doc.name}` : `Attached Document ${i + 1}`;
      const roleLabel = doc.role ? ` (Role: ${doc.role})` : '';
      parts.push({ text: `=== ${docLabel}${roleLabel} ===` });
    }

    parts.push({
      inlineData: {
        mimeType: resolvedMime,
        data: cleanBase64
      }
    });
  }

  // Timeout configurable via GEMINI_TIMEOUT_MS, default 75s for multimodal PDF exam paper synthesis
  const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 75000;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        maxOutputTokens: Math.min(maxTokens || EXAM_MAX_TOKENS, 8192),
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Gemini Exam Assistant Error]:', response.status, errText);
    let detailedMsg = `GEMINI_API_ERROR (${response.status})`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error && errJson.error.message) {
        detailedMsg = errJson.error.message;
      }
    } catch (_) {}
    throw new Error(detailedMsg);
  }

  const data = await response.json();
  const candidate = data.candidates && data.candidates[0];
  const text = candidate && candidate.content && candidate.content.parts
    ? candidate.content.parts.map(p => p.text || '').join('').trim()
    : '';

  if (!text) {
    throw new Error('GEMINI_EMPTY_RESPONSE');
  }

  return text;
}

/**
 * Clean and parse JSON safely from Gemini output with resilient truncation repair.
 */
function cleanAndParseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return {};
  let cleaned = rawText.trim();

  // 1. Direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // 2. Extract from markdown code fences if wrapped
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
    try {
      return JSON.parse(cleaned);
    } catch (_) {}
  } else {
    // If there's leading conversational text before the root object, slice from first '{'
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
      try {
        return JSON.parse(cleaned);
      } catch (_) {}
    }
  }

  // 3. Remove trailing commas before closing braces/brackets
  let sanitized = cleaned.replace(/,\s*([\}\]])/g, '$1');
  try {
    return JSON.parse(sanitized);
  } catch (_) {}

  // 4. Resilient repair for truncated output (e.g. token limits reached)
  let inString = false;
  let escaped = false;
  const stack = [];
  let s = '';

  for (let i = 0; i < sanitized.length; i++) {
    const ch = sanitized[i];
    s += ch;
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
    } else {
      if (ch === '"') {
        inString = true;
      } else if (ch === '{') {
        stack.push('}');
      } else if (ch === '[') {
        stack.push(']');
      } else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }
  }

  // If stopped mid-string, close the string
  if (inString) {
    s += '"';
  }

  // Clean trailing comma or dangling colon before closing containers
  s = s.replace(/,\s*$/, '');
  s = s.replace(/:\s*$/, ': null');

  // Pop all unclosed braces/brackets in LIFO order
  while (stack.length > 0) {
    const closer = stack.pop();
    s = s.replace(/,\s*$/, '');
    s += closer;
  }

  // Clean trailing commas after closing
  s = s.replace(/,\s*([\}\]])/g, '$1');

  try {
    return JSON.parse(s);
  } catch (e2) {
    // 5. Handle unescaped control characters inside strings
    try {
      const fixedControls = s.replace(/[\u0000-\u001F]+/g, (m) => (m === '\n' ? '\\n' : m === '\r' ? '\\r' : m === '\t' ? '\\t' : ''));
      return JSON.parse(fixedControls);
    } catch (_) {
      throw new Error(`Invalid JSON from AI model: ${e2.message}`);
    }
  }
}

/**
 * Normalize and validate exam structure to conform to VirtuLab Kenya standards.
 */
function normalizeExamStructure(parsed, sourceMeta = {}) {
  const isComposite = parsed.titrationType === 'kcseComposite' || (!parsed.titrationType && parsed.examConfig?.q1);

  const normalized = {
    title: parsed.title || 'KCSE Chemistry Practical Examination',
    formLevel: parsed.formLevel || 'Form 4',
    titrationType: isComposite ? 'kcseComposite' : (parsed.titrationType || 'acidBase'),
    instructions: parsed.instructions || 'Follow all KNEC secondary chemistry laboratory instructions carefully.',
    durationMinutes: Number(parsed.durationMinutes) || (isComposite ? 135 : 60),
    examConfig: parsed.examConfig || {},
    markingScheme: parsed.markingScheme || '',
    confidentialPrepGuide: parsed.confidentialPrepGuide || ''
  };

  const metaObj = {
    generatedAt: new Date().toISOString(),
    source: sourceMeta.source || 'ai_generated',
    ...sourceMeta
  };
  normalized.meta = metaObj;
  normalized._meta = metaObj;

  // Build flexible questions[] array (new format) first
  normalized.questions = normalizeQuestionsArray(parsed);

  // Sync questions configuration to examConfig for composite exams
  if (Array.isArray(normalized.questions) && normalized.questions.length > 0) {
    const q1Obj = normalized.questions.find(q => q.number === 1 || q.simulationType === 'titration');
    if (q1Obj && q1Obj.config) {
      normalized.examConfig.q1 = {
        ...(normalized.examConfig.q1 || {}),
        ...q1Obj.config,
        simulationType: q1Obj.simulationType,
        marks: Number(q1Obj.marks) || normalized.examConfig.q1?.marks || 15
      };

      // Determine canonical trueTitre
      let titre = q1Obj.config.trueTitre != null ? Number(q1Obj.config.trueTitre) : (normalized.examConfig.q1.trueTitre != null ? Number(normalized.examConfig.q1.trueTitre) : null);
      if (!titre && normalized.examConfig.q1.trueAcidMolarity && normalized.examConfig.q1.trueBaseMolarity) {
        const rA = Number(normalized.examConfig.q1.ratioA || 1);
        const rB = Number(normalized.examConfig.q1.ratioB || 1);
        const pVol = Number(normalized.examConfig.q1.pipetteVolume || 25.0);
        titre = parseFloat(((rA * Number(normalized.examConfig.q1.trueBaseMolarity) * pVol) / (rB * Number(normalized.examConfig.q1.trueAcidMolarity))).toFixed(2));
      }
      if (titre) {
        normalized.examConfig.q1.trueTitre = titre;
        q1Obj.config.trueTitre = titre;
      }

      if (q1Obj.config.hasMultipleProcedures && Array.isArray(q1Obj.config.procedures)) {
        normalized.examConfig.q1.hasMultipleProcedures = true;
        normalized.examConfig.q1.procedures = q1Obj.config.procedures;
      }
    }

    const q2Obj = normalized.questions.find(q => q.number === 2);
    if (q2Obj && q2Obj.config) {
      normalized.examConfig.q2 = {
        ...(normalized.examConfig.q2 || {}),
        ...q2Obj.config,
        simulationType: q2Obj.simulationType,
        hasDeduction: Boolean(q2Obj.config.hasDeduction),
        marks: Number(q2Obj.marks) || normalized.examConfig.q2?.marks || 15
      };
    }

    const q3Obj = normalized.questions.find(q => q.number === 3);
    if (q3Obj && q3Obj.config) {
      normalized.examConfig.q3 = {
        ...(normalized.examConfig.q3 || {}),
        ...q3Obj.config,
        simulationType: q3Obj.simulationType,
        hasDeduction: Boolean(q3Obj.config.hasDeduction),
        marks: Number(q3Obj.marks) || normalized.examConfig.q3?.marks || 10
      };
    }
  }

  // Ensure examConfig has proper defaults for composite exams
  if (isComposite) {
    normalized.examConfig.presetKey = normalized.examConfig.presetKey || 'custom';
    if (!normalized.examConfig.q1) normalized.examConfig.q1 = { ...FALLBACK_PRESETS.classic.examConfig.q1 };
    if (!normalized.examConfig.q2) normalized.examConfig.q2 = { ...FALLBACK_PRESETS.classic.examConfig.q2 };
    if (!normalized.examConfig.q3) normalized.examConfig.q3 = { ...FALLBACK_PRESETS.classic.examConfig.q3 };

    normalized.examConfig.q1.marks = Number(normalized.examConfig.q1.marks) || 15;
    normalized.examConfig.q2.marks = Number(normalized.examConfig.q2.marks) || 15;
    normalized.examConfig.q3.marks = Number(normalized.examConfig.q3.marks) || 10;

    // Preserve or infer authentic KNEC calcType
    if (!normalized.examConfig.q1.calcType) {
      const q1Title = (normalized.examConfig.q1.title || '').toLowerCase();
      const q1Instr = (normalized.examConfig.q1.instructions || '').toLowerCase();
      const solA = (normalized.examConfig.q1.solutionA || '').toLowerCase();
      if (q1Title.includes('water of crystallization') || q1Instr.includes('water of crystallization') || q1Instr.includes('hydrate')) {
        normalized.examConfig.q1.calcType = 'water_of_crystallization';
      } else if (q1Title.includes('percentage purity') || q1Instr.includes('purity') || q1Instr.includes('impure')) {
        normalized.examConfig.q1.calcType = 'percentage_purity';
      } else if (q1Title.includes('atomic mass') || q1Instr.includes('atomic mass') || q1Instr.includes('relative atomic mass')) {
        normalized.examConfig.q1.calcType = 'ram_metal';
      } else if (solA.includes('kmno4') || q1Instr.includes('redox') || solA.includes('manganate')) {
        normalized.examConfig.q1.calcType = 'redox_stoichiometry';
      } else {
        normalized.examConfig.q1.calcType = 'standard_molarity';
      }
    }
  }

  return normalized;
}

/**
 * 1. Parse uploaded exam paper (PDF, Image photo, or plain text)
 * Supports multiple documents simultaneously (Question Paper + Confidential Guide + Marking Scheme).
 */
async function parseExamPaper({ files = [], fileData = null, mimeType = null, textContent = '', teacherNotes = '' }) {
  // Normalize single fileData into files array if files is empty
  let normalizedFiles = Array.isArray(files) && files.length > 0 ? [...files] : [];
  if (normalizedFiles.length === 0 && fileData) {
    normalizedFiles = [{
      name: 'Uploaded Document',
      type: mimeType || 'application/pdf',
      dataUrl: fileData,
      role: 'question_paper'
    }];
  }

  // Extract text from all uploaded PDF files using pdf-parse
  const extractedSections = [];
  for (let i = 0; i < normalizedFiles.length; i++) {
    const f = normalizedFiles[i];
    const rawData = f.dataUrl || f.fileData;
    const fType = f.type || f.mimeType || '';
    if (rawData && (fType === 'application/pdf' || rawData.startsWith('data:application/pdf') || rawData.includes('JVBERi0'))) {
      try {
        let b64 = rawData;
        const commaIdx = rawData.indexOf('base64,');
        if (commaIdx !== -1) b64 = rawData.substring(commaIdx + 7);
        const pdfBuf = Buffer.from(b64.trim(), 'base64');
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: pdfBuf });
        const extracted = await parser.getText();
        await parser.destroy();
        if (extracted && extracted.text && extracted.text.trim()) {
          const docRole = (f.role || 'question_paper').toUpperCase();
          const docName = f.name || `Document ${i + 1}`;
          extractedSections.push(`=== ATTACHED DOCUMENT: ${docName} [ROLE: ${docRole}] ===\n${extracted.text.trim()}`);
        }
      } catch (pdfErr) {
        console.warn(`[parseExamPaper] pdf-parse extraction note for "${f.name || i}":`, pdfErr.message);
      }
    }
  }

  if (extractedSections.length > 0) {
    const combinedExtracted = extractedSections.join('\n\n');
    textContent = textContent ? `${textContent}\n\n${combinedExtracted}` : combinedExtracted;
  }

  const prompt = `You are a Senior Kenya National Examinations Council (KNEC) Chief Chemistry Practical Examiner & Curriculum Specialist.
Analyze this uploaded chemistry exam paper document/photo and extract all practical experiments, questions, reagent configurations, and marking rubrics according to authentic KNEC KCSE Paper 3 (233/3) standards.

KNEC Examination Setting Standards to Enforce:
1. Cognitive Taxonomy: Balance questions across Recall (State, Name, Define), Comprehension (Describe, Explain, Account for), Application (Calculate, Determine), and Analysis (Deduce, Compare, Distinguish).
2. MULTI-DOCUMENT CROSS-REFERENCING (CRITICAL):
   - If BOTH a Question Paper and Confidential Instructions/Lab Technician Guide are provided:
     * Faithfully cross-reference the Question Paper with the Confidential Instructions!
     * Use the Question Paper to extract the question structure, student instructions, sub-question prompts, marks, and tables.
     * Use the Confidential Preparation Guide to identify the TRUE chemicals, reagents, concentrations, and recipes:
       - If Question 2 in the paper says "You are provided with Solid Y", and the Confidential Guide specifies that Solid Y is "Zinc Sulfate (ZnSO4)", then configure Question 2 with trueSaltKey: "ZnSO4", trueSaltName: "Zinc Sulfate", trueCation: "Zn2+", trueAnion: "SO42-".
       - If Question 1 uses Solution A and Solution B, extract the exact true concentrations (e.g. 0.02M KMnO4, 0.1M Fe2+) and preparation notes from the confidential instructions and configure trueAcidMolarity and trueBaseMolarity accordingly.
       - If Question 3 tests Liquid Z, match it to the organic substance specified in the confidential guide (e.g. Ethanol, Cyclohexene).
       - If a mixture of chemicals is specified in the confidential instructions (e.g. Solid Y is a mixture of BaSO4 and ZnSO4), configure the simulation accordingly (e.g. trueSaltKey: "ZnSO4 + BaSO4").
     * If a Marking Scheme is provided, align mark allocations, accepted observations, inferences, and scoring criteria with the official marking guide.
3. Question 1 (Volumetric Analysis - 15 to 20 Marks):
   - Accurately identify the calculation framework ("calcType"): 'standard_molarity', 'water_of_crystallization', 'percentage_purity', 'ram_metal', 'redox_stoichiometry', or 'dibasic_acid'.
   - Generate the sequential sub-questions (a) through (e)/(f) with clear method marks (M) and accuracy marks (A).
   - If Question 1 has TWO titrations (Procedure I and Procedure II with Table 1 and Table 2), configure it as a multi-stage titration (see schema below).
3. Question 2 (Inorganic Qualitative Analysis - 10 to 15 Marks):
   - Structured experimental procedures (e.g. heating solid in dry tube, dissolving, portioning, adding 2M NaOH and 2M aqueous NH3 dropwise until in excess, anion confirmatory tests).
   - Inferences must strictly enforce KNEC grouping notation (e.g. "Pb²⁺, Al³⁺, or Zn²⁺ present" in excess NaOH; "Pb²⁺ or Al³⁺ present" in excess NH3) with correct ionic charges.
   - FINAL DEDUCTION RULE: Set "hasDeduction": true ONLY if the uploaded paper explicitly has a separate question or blank lines asking for the final deduction / identity of cation and anion (e.g. "Cation: _____ | Anion: _____"). If the paper only has test steps with observations and inferences, set "hasDeduction": false. NEVER include final deduction by default.
4. Question 3 (Organic OR Second Inorganic Qualitative Analysis - 10 Marks):
   - If the exam has a second inorganic qualitative analysis (e.g. Solid P with dry heating, dissolving, NaOH, Aqueous Ammonia with H2O2, dilute HNO3, Ba(NO3)2 tests):
     - Set "simulationType": "qualitative".
     - Set "hasDeduction": true ONLY if there is an explicit final deduction sub-question in the paper, otherwise false.
     - In "config", populate: { "sampleName": "Solid P", "sampleDesc": "An inorganic salt sample", "marks": 10, "hasDeduction": false, "tests": [ { "id": "t1", "prompt": "<exact procedure text from paper, e.g. (a) Place half of solid P in a dry test tube. Heat gently.>", "correctObs": "<expected observation>", "correctInf": "<expected inference>", "marks": 2.0 } ] }.
     - Also populate "subQuestions" with each sub-question with id, text, marks, modelAnswer.
   - If the exam has organic functional group analysis (e.g. Liquid Z):
     - Set "simulationType": "organic".
     - In "config", populate: { "sampleName": "Liquid Z", "trueOrganicKey": "Ethanol", "sampleDesc": "Clear volatile organic liquid", "marks": 10, "tests": [ ... ] }.
5. Marking Scheme:
   - Provide a rigorous marking guide with point-by-point breakdown and explicit instructions on applying Error Carried Forward (e.c.f.) on calculation steps.
6. CRITICAL TITRATION STOICHIOMETRIC CONSISTENCY:
   - If the uploaded document, confidential preparation guide, or marking scheme mentions an expected average titre (e.g. 18.50 cm³ or 24.50 cm³), you MUST set "trueTitre" to that exact number in "config" and in "examConfig.q1" (and in "procedures[i].trueTitre" if multi-stage). The student simulation endpoint will trigger at this exact value, and the calculation steps in the marking scheme must be mathematically consistent with this trueTitre.

Teacher's Additional Instructions: "${teacherNotes || 'None'}"

Strict Requirement: Map the paper into an executable digital simulation structure for the VirtuLab Kenya platform.
Produce a strict JSON object with this exact schema:
{
  "title": "<Exam paper title, e.g. 'KCSE Chemistry Paper 3 Term 2 Joint Mock'>",
  "formLevel": "<'Form 3' or 'Form 4'>",
  "titrationType": "<keep for backward compat: 'kcseComposite' if 3 questions, or specific module like 'acidBase', 'redox', 'qualitative', 'organic', 'energy', 'rates', 'gas'>",
  "instructions": "<General candidate instructions>",
  "durationMinutes": <number, e.g. 135 for composite or 60 for single topic>,
  "questions": [
    {
      "number": <integer starting at 1>,
      "title": "<question title, e.g. 'Volumetric Analysis'>",
      "simulationType": "<one of: titration, qualitative, organic, energy, rates, gas, solubility, written>",
      "marks": <number>,
      "config": {
        <for single titration: { solutionA, solutionB, indicator, pipetteVolume, trueTitre, questions: [...] }>
        <for MULTI-STAGE TITRATION (Procedure I + Procedure II with Table 1 and Table 2):
          "hasMultipleProcedures": true,
          "procedures": [
            {
              "procedureIndex": 1,
              "title": "<e.g. Procedure I: Standardization of Solution B>",
              "instructions": "<instructions text for procedure 1>",
              "solutionA": "<titrant in burette>",
              "solutionB": "<analyte in flask>",
              "pipetteVolume": 25.0,
              "indicator": "<e.g. Phenolphthalein>",
              "trueTitre": 25.00,
              "tableTitle": "Table 1: Titration Results",
              "tableMarks": 4.0,
              "questions": [ { "id": "step_1a", "letter": "a", "label": "...", "marks": 1.0, "unit": "..." } ]
            },
            {
              "procedureIndex": 2,
              "title": "<e.g. Procedure II: Solubility of Solid C in Water>",
              "instructions": "<instructions text for procedure 2>",
              "solutionA": "<titrant in burette>",
              "solutionB": "<analyte in flask>",
              "pipetteVolume": 25.0,
              "indicator": "<e.g. Methyl Orange>",
              "trueTitre": 18.50,
              "tableTitle": "Table 2: Titration Results",
              "tableMarks": 4.0,
              "questions": [ { "id": "step_2a", "letter": "a", "label": "...", "marks": 1.0, "unit": "..." } ]
            }
          ]
        >
        <for qualitative or organic: tests[], sampleName, sampleDesc, etc.>
        <for 'written' type: set config to null>
      },
      "prompt": "<for 'written' type: full question text including all sub-parts; empty string for simulated types>",
      "subQuestions": [
        {
          "id": "<e.g. 'a', 'b', 'i', 'ii'>",
          "text": "<sub-question text>",
          "marks": <number>,
          "modelAnswer": "<detailed model answer a KNEC examiner would accept>"
        }
      ]
    }
  ],
  "examConfig": {
    "presetKey": "custom",
    "q1": { <copy of questions[0].config for backward compat; required if questions[0] is a simulated type> },
    "q2": { <copy of questions[1].config if qualitative> },
    "q3": { <copy of questions[2].config if simulated, whether qualitative salt analysis or organic functional group analysis> }
  },
  "markingScheme": "<Concise Markdown formatted teacher marking guide with point-by-point method marks (M), accuracy marks (A), and Error Carried Forward (e.c.f.) notes>",
  "confidentialPrepGuide": "<Concise Markdown formatted instructions for the school laboratory technician detailing reagent preparation recipes, molarities, volumes per candidate, and apparatus checklist>"
}

CRITICAL JSON RULES:
- Output 100% valid RFC 8259 JSON only. Escape all double quotes and newlines inside string properties.
- Keep markingScheme and confidentialPrepGuide concise to guarantee complete JSON generation without hitting length limits.

CRITICAL INSTRUCTIONS FOR simulationType:
- Use 'titration' for any volumetric/burette experiment (acid-base, redox, back-titration, or multi-procedure double titrations)
- Use 'qualitative' for inorganic salt identification with NaOH/NH3 tests
- Use 'organic' for organic functional group identification
- Use 'energy' for thermochemistry/enthalpy/temperature change experiments
- Use 'rates' for reaction rate/kinetics experiments
- Use 'gas' for gas preparation and collection experiments
- Use 'solubility' for solubility curve/crystallization experiments
- Use 'written' for ANYTHING ELSE: paper chromatography, electrolysis, food tests,
  flame tests, plant experiments, graph-reading, data analysis, diagram labelling, etc.
  For 'written' type, set config to null and populate prompt + subQuestions with
  complete question text and detailed model answers.

For simulated types (titration/qualitative/organic/energy/rates/gas/solubility), the config field must contain
the same fields as the old q1/q2/q3 format (calcType, solutionA, trueSaltKey, trueOrganicKey, etc.).

${textContent ? `Extracted Paper Text:\n${textContent}` : ''}`;

  try {
    const rawResult = await callGeminiAssistant({
      prompt,
      files: normalizedFiles,
      fileData: normalizedFiles[0]?.dataUrl || fileData,
      mimeType: normalizedFiles[0]?.type || mimeType || 'application/pdf',
      maxTokens: EXAM_MAX_TOKENS
    });

    const parsed = cleanAndParseJson(rawResult);
    return normalizeExamStructure(parsed, { source: 'document_upload' });
  } catch (err) {
    console.warn('[parseExamPaper] AI parsing failed or not configured, using smart fallback preset:', err.message);
    const combined = `${teacherNotes || ''} ${textContent || ''}`.toLowerCase();
    let fallbackKey = 'classic';

    if (combined.includes('enthalpy') || combined.includes('thermochem') || combined.includes('temperature rise') || combined.includes('calorimeter') || combined.includes('heat of')) {
      fallbackKey = 'energy';
    } else if (combined.includes('kinetics') || combined.includes('disappearing cross') || combined.includes('rate of reaction') || combined.includes('rates')) {
      fallbackKey = 'rates';
    } else if (combined.includes('gas') && (combined.includes('preparation') || combined.includes('collection') || combined.includes('carbon(iv) oxide') || combined.includes('co2'))) {
      fallbackKey = 'gas';
    } else if (combined.includes('solubility') || combined.includes('crystalliz')) {
      fallbackKey = 'solubility';
    } else if (combined.includes('two-salt') || combined.includes('mixture') || combined.includes('residue and filtrate') || combined.includes('separation')) {
      fallbackKey = 'twosalt';
    } else if (combined.includes('redox') || combined.includes('manganate') || combined.includes('iron') || combined.includes('kmno4')) {
      fallbackKey = 'redox';
    }

    const fallback = FALLBACK_PRESETS[fallbackKey] || FALLBACK_PRESETS.classic;

    const isNotConfigured = err.message === 'AI_NOT_CONFIGURED';
    const warning = isNotConfigured
      ? 'Gemini API key is not configured in server/.env (GEMINI_API_KEY). VirtuLab loaded a standard KNEC-aligned examination blueprint.'
      : `AI cloud parsing was unavailable (${err.message}). VirtuLab loaded a standard KNEC-aligned examination blueprint.`;

    return normalizeExamStructure(fallback, {
      source: 'smart_fallback',
      isFallback: true,
      errorReason: err.message,
      warning
    });
  }
}

/**
 * 2. Generate complete exam from an idea / prompt
 */
async function generateExamFromIdea({ prompt, formLevel = 'Form 4', moduleType = 'kcseComposite', difficulty = 'standard', durationMinutes = 135 }) {
  // Build domain-specific KNEC syllabus guidelines based on target module
  let moduleSpecificGuidelines = '';
  const mTypeLower = (moduleType || '').toLowerCase();

  if (mTypeLower === 'energy') {
    moduleSpecificGuidelines = `
KNEC Thermochemistry (Energy Changes in Chemical & Physical Processes) Standards:
- Focus: Calorimetry, Heat of Neutralization, Displacement, or Solution.
- Candidate must record initial temperatures (T₁ of acid, T₂ of alkali, calculate mean T₀) and maximum temperature T₃ to determine temperature rise ΔT = T₃ - T₀.
- Calculations must follow KNEC specifications: Heat evolved Q = mcΔT (c = 4.2 J/g/K, density = 1.0 g/cm³, total volume in cm³ = mass in g), moles of limiting reagent/water formed, and molar enthalpy ΔH = -(Q / moles) in kJ/mol with mandatory negative sign for exothermic processes.
- Question 2: Accompanying inorganic qualitative salt analysis or thermal decomposition (e.g. basic carbonate or hydrated salt).`;
  } else if (mTypeLower === 'rates') {
    moduleSpecificGuidelines = `
KNEC Reaction Kinetics & Rates Standards:
- Focus: Effect of concentration or temperature on reaction rate (e.g. disappearing cross with sodium thiosulfate and HCl, or gas evolution volume with Mg ribbon and acid).
- Systematic data table: 4–5 runs with varied concentrations/volumes, recorded time (t in seconds), and reciprocal (1/t in s⁻¹).
- Graph plotting criteria: Scale (S - 1mk, >=50% grid area), Axes (A - 1mk, quantity and units), Plotting (P - 2mk, within 1/2 small square), Curve/Line (C - 1mk, smooth line through origin).
- Kinetic deduction: Explaining proportionality between concentration and rate (1/t), and reading values from graph.
- Question 2: Accompanying qualitative analysis of sulfur/halide salts.`;
  } else if (mTypeLower === 'gas') {
    moduleSpecificGuidelines = `
KNEC Gas Chemistry Practical Standards:
- Focus: Laboratory preparation, drying, and collection of a gas (e.g. CO₂, SO₂, O₂, NH₃, or H₂).
- Balanced chemical equation with state symbols, identification of suitable drying agent (e.g. why CaO cannot dry acidic gases like CO₂/SO₂), collection method (downward delivery / displacement of water) justified by gas density and solubility.
- Chemical confirmatory tests with observations and inferences (e.g. lime water, acidified K₂Cr₂O₇/KMnO₄, burning/glowing splint).
- Question 2: Qualitative analysis of reaction residue/filtrate.`;
  } else if (mTypeLower === 'solubility') {
    moduleSpecificGuidelines = `
KNEC Solubility & Crystallization Practical Standards:
- Focus: Solubility curve determination (e.g. KClO₃ or KNO₃) with temperature measurement on cooling.
- Table: Volume of water, crystallization temperature (°C), and calculated solubility (g solute / 100 g water).
- Graph plotting criteria: Solubility vs Temperature smooth curve.
- Deductions: Reading solubility at a target temperature (e.g. 50°C), and calculating mass of crystals deposited upon cooling from T_high to T_low.
- Question 2: Qualitative flame test (lilac for K⁺) and anion confirmatory test.`;
  } else if (mTypeLower === 'qualitative') {
    moduleSpecificGuidelines = `
KNEC Inorganic Qualitative Analysis Standards:
- Pure 15–20 mark systematic inorganic salt analysis with Solid/Solution P and Q.
- Steps: physical appearance, action of heat, solubility, reaction with 2M NaOH (dropwise and excess), 2M aqueous NH₃ (dropwise and excess), confirmatory cation tests (KI, H₂SO₄, flame), and confirmatory anion tests (Ba(NO₃)₂ + HNO₃, AgNO₃ + HNO₃).
- Strict KNEC grouping notation in inferences: (Pb²⁺, Al³⁺, or Zn²⁺ present in excess NaOH; Pb²⁺ or Al³⁺ present in excess NH₃; Zn²⁺ confirmed in excess NH₃).`;
  } else if (mTypeLower === 'organic') {
    moduleSpecificGuidelines = `
KNEC Organic Qualitative Analysis Standards:
- Pure systematic identification of organic functional groups with Liquid/Solid Z.
- Steps: Metallic spatula ignition (sooty/luminous vs clean blue flame -> C:H ratio / unsaturation), litmus test (neutral, acidic, basic), unsaturation test (bromine water, acidified KMnO₄), carboxylic acid test (solid NaHCO₃ effervescence).`;
  } else {
    moduleSpecificGuidelines = `
KNEC Composite Mock Standards (40 Marks Total):
1. Question 1 (Volumetric Analysis - 15 Marks):
   - Calculation framework ('standard_molarity', 'water_of_crystallization', 'percentage_purity', 'ram_metal', 'redox_stoichiometry', or 'dibasic_acid').
   - Realistic stoichiometric parameters, molar concentrations, and balanced equations with state symbols.
2. Question 2 (Inorganic Qualitative Analysis - 15 Marks):
   - Multi-step experimental sequence (appearance, dissolving, portioning, 2M NaOH & 2M aqueous NH₃ dropwise until in excess, anion confirmatory test).
   - Inferences must strictly enforce KNEC grouping notation (e.g. "Pb²⁺, Al³⁺, or Zn²⁺ present" in excess NaOH; "Pb²⁺ or Al³⁺ present" in excess NH₃).
3. Question 3 (Organic Qualitative Analysis - 10 Marks):
   - Sequence: Spatula ignition flame test, litmus test, unsaturation/redox test (acidified KMnO₄ or Bromine water), and carbonate/hydrogen carbonate effervescence.`;
  }

  const aiPrompt = `You are a Senior KNEC Chemistry Chief Examiner & Curriculum Specialist designing a secondary school chemistry practical exam for Kenyan learners.

Teacher's Idea / Request:
"${prompt}"

Form Level: ${formLevel}
Exam Module: ${moduleType}
Target Difficulty: ${difficulty}
Allotted Time: ${durationMinutes} minutes

${moduleSpecificGuidelines}

KNEC Setting & Pedagogical Standards to Enforce:
1. Cognitive Taxonomy: Balance across Recall, Comprehension, Application, and Analysis. Use authentic KNEC command words (State, Name, Determine, Calculate, Deduce, Explain).
2. KNEC Official Scoring Rubrics to Enforce in "markingScheme":
   - Use authentic KNEC examiner award codes:
     - CT (Complete Table - 1.0 Mark): Awarded if all required trials/readings are filled realistically.
     - D (Decimals - 1.0 Mark): Consistency to 1 or 2 d.p. throughout the table. Burette readings must terminate in .0 or .5.
     - A (Accuracy - 1.0 Mark): Comparison with teacher/standard value. Within ±0.10 cm³ (1 mk), within ±0.20 cm³ (1/2 mk), beyond (0 mk).
     - PA (Principles of Averaging - 1.0 Mark): Candidate averages concordant values within ±0.20 cm³. Correct working must be shown.
     - FA (Final Accuracy - 1.0 Mark): Average computed correctly to 2 d.p.
   - For calculations: Award Method marks (M) and Accuracy marks (A), with explicit Error Carried Forward (e.c.f.) rules. Deduct 1/2 mark for missing or incorrect units.
   - For qualitative tables: Strict 2-column format (Observations | Inferences) using authentic KNEC ionic formulas. Contradictory ions written in the inference column lose marks.

Strict Response JSON Schema:
{
  "title": "<Concise official title, e.g. Form 4 Chemistry Paper 3 Term 2 Mock Practical>",
  "formLevel": "${formLevel}",
  "titrationType": "${moduleType === 'kcseComposite' ? 'kcseComposite' : moduleType}",
  "instructions": "<Standard KNEC examination laboratory instructions>",
  "durationMinutes": ${durationMinutes},
  "questions": [
    {
      "number": <integer starting at 1>,
      "title": "<question title, e.g. 'Volumetric Analysis' or 'Thermochemistry'>",
      "simulationType": "<one of: titration, qualitative, organic, energy, rates, gas, solubility, written>",
      "marks": <number>,
      "config": { <for simulated types: include appropriate parameters for titration, qualitative, organic, energy, rates, gas, or solubility. For 'written' set to null.> },
      "prompt": "<for 'written' type: full question text; empty string for simulated types>",
      "subQuestions": [
        {
          "id": "<e.g. 'a', 'b', 'i', 'ii'>",
          "text": "<sub-question text>",
          "marks": <number>,
          "modelAnswer": "<detailed model answer>"
        }
      ]
    }
  ],
  "examConfig": {
    "presetKey": "custom",
    "q1": { <copy of questions[0].config — required for backward compat with simulation engine> },
    "q2": { <copy of questions[1].config if present> },
    "q3": { <copy of questions[2].config if present> }
  },
  "markingScheme": "<Markdown KNEC marking scheme with CT/D/A/PA/FA rubrics, M and A marks, and e.c.f. instructions>",
  "confidentialPrepGuide": "<Markdown Lab Technician preparation instructions detailing reagents, concentrations, volumes per candidate, and apparatus checklist>"
}`;

  try {
    const rawResult = await callGeminiAssistant({ prompt: aiPrompt, maxTokens: EXAM_MAX_TOKENS });
    const parsed = cleanAndParseJson(rawResult);
    return normalizeExamStructure(parsed, { source: 'idea_prompt', promptText: prompt });
  } catch (err) {
    console.warn('[generateExamFromIdea] AI generation failed or not configured, using smart fallback preset:', err.message);
    
    // Domain-aware fallback resolution
    let fallbackKey = 'classic';
    const lowerPrompt = (prompt || '').toLowerCase();
    const mType = (moduleType || '').toLowerCase();

    if (mType === 'energy' || lowerPrompt.includes('enthalpy') || lowerPrompt.includes('thermochem') || lowerPrompt.includes('heat of') || lowerPrompt.includes('calorimeter')) {
      fallbackKey = 'energy';
    } else if (mType === 'rates' || lowerPrompt.includes('rates') || lowerPrompt.includes('kinetics') || lowerPrompt.includes('disappearing cross')) {
      fallbackKey = 'rates';
    } else if (mType === 'gas' || lowerPrompt.includes('gas prep') || lowerPrompt.includes('collection of gas') || lowerPrompt.includes('carbon(iv) oxide') || lowerPrompt.includes('co2')) {
      fallbackKey = 'gas';
    } else if (mType === 'solubility' || lowerPrompt.includes('solubility') || lowerPrompt.includes('crystalliz')) {
      fallbackKey = 'solubility';
    } else if (lowerPrompt.includes('two-salt') || lowerPrompt.includes('mixture') || lowerPrompt.includes('separation') || mType === 'twosalt') {
      fallbackKey = 'twosalt';
    } else if (lowerPrompt.includes('redox') || lowerPrompt.includes('manganate') || lowerPrompt.includes('iron') || lowerPrompt.includes('kmno4')) {
      fallbackKey = 'redox';
    }

    const fallback = FALLBACK_PRESETS[fallbackKey] || FALLBACK_PRESETS.classic;

    const modified = JSON.parse(JSON.stringify(fallback));
    modified.formLevel = formLevel;
    modified.durationMinutes = durationMinutes;
    if (prompt) modified.title = `${fallback.title.split('—')[0]}— ${prompt.slice(0, 45)}...`;

    const isNotConfigured = err.message === 'AI_NOT_CONFIGURED';
    const warning = isNotConfigured
      ? 'Gemini API key is not configured in server/.env (GEMINI_API_KEY). VirtuLab generated a standard KNEC-aligned examination blueprint.'
      : `AI cloud synthesis was unavailable (${err.message}). VirtuLab generated a standard KNEC-aligned examination blueprint.`;

    return normalizeExamStructure(modified, {
      source: 'smart_fallback',
      isFallback: true,
      promptText: prompt,
      errorReason: err.message,
      warning
    });
  }
}

/**
 * Diagnostic procedures generator for unknown inorganic salts
 */
function getSaltTestSequence(saltKey) {
  switch (saltKey) {
    case 'ZnSO4':
      return [
        { id: 't1', prompt: '(i) Describe the physical appearance of Solid Y', correctObs: 'White crystalline solid', correctInf: 'Absence of transition metal ions (Cu²⁺, Fe²⁺, Fe³⁺)' },
        { id: 't2', prompt: '(ii) Dissolve 1 spatula of Solid Y in 10 cm³ distilled water, divide into 4 portions. Test portion 1 with litmus paper', correctObs: 'Both blue and red litmus papers remain unchanged / neutral', correctInf: 'Neutral aqueous solution' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate formed, soluble in excess to form a colourless solution', correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present' },
        { id: 't4', prompt: '(iv) To portion 3, add 2M Aqueous Ammonia (NH₃) dropwise until in excess', correctObs: 'White precipitate formed, soluble in excess aqueous ammonia to form a colourless solution', correctInf: 'Zn²⁺ confirmed' },
        { id: 't5', prompt: '(v) To portion 4, add 3 drops of Ba(NO₃)₂ solution followed by dilute HNO₃', correctObs: 'White precipitate formed, insoluble in dilute HNO₃', correctInf: 'SO₄²⁻ confirmed' }
      ];
    case 'Pb(NO3)2':
      return [
        { id: 't1', prompt: '(i) Describe the physical appearance of Solid Y', correctObs: 'White crystalline solid / powder', correctInf: 'Absence of coloured transition ions' },
        { id: 't2', prompt: '(ii) Dissolve 1 spatula in 10 cm³ water and divide into 4 portions. Test portion 1 with litmus', correctObs: 'Faintly acidic pH 5–6', correctInf: 'Salt of weak base/strong acid' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate, soluble in excess NaOH to form colourless solution', correctInf: 'Pb²⁺, Al³⁺, or Zn²⁺ present' },
        { id: 't4', prompt: '(iv) To portion 3, add 2M NH₃ dropwise until in excess', correctObs: 'White precipitate, insoluble in excess aqueous ammonia', correctInf: 'Pb²⁺ or Al³⁺ present' },
        { id: 't5', prompt: '(v) To portion 4, add 3 drops of potassium iodide (KI) solution and warm gently', correctObs: 'Bright yellow precipitate of PbI₂ formed, dissolves on boiling and recrystallizes as golden spangles on cooling', correctInf: 'Pb²⁺ confirmed' }
      ];
    case 'CuSO4':
      return [
        { id: 't1', prompt: '(i) Describe the physical appearance of Solid Y', correctObs: 'Blue crystalline solid / powder', correctInf: 'Hydrated Cu²⁺ ion present' },
        { id: 't2', prompt: '(ii) Dissolve 1 spatula in water and divide into 3 portions', correctObs: 'Forms a clear blue solution', correctInf: 'Soluble Cu²⁺ salt' },
        { id: 't3', prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess', correctObs: 'Pale blue precipitate, insoluble in excess NaOH', correctInf: 'Cu²⁺ present' },
        { id: 't4', prompt: '(iv) To portion 2, add 2M NH₃ dropwise until in excess', correctObs: 'Pale blue precipitate, dissolves in excess to form a deep royal blue solution', correctInf: 'Cu²⁺ confirmed' },
        { id: 't5', prompt: '(v) To portion 3, add Ba(NO₃)₂ followed by dilute HNO₃', correctObs: 'White precipitate, insoluble in dilute HNO₃', correctInf: 'SO₄²⁻ confirmed' }
      ];
    case 'FeSO4':
      return [
        { id: 't1', prompt: '(i) Describe the physical appearance of Solid Y', correctObs: 'Pale green crystalline solid', correctInf: 'Hydrated Fe²⁺ ion present' },
        { id: 't2', prompt: '(ii) To portion 1, add 2M NaOH dropwise until in excess', correctObs: 'Dirty-green gelatinous precipitate, insoluble in excess, turns brown at surface on standing', correctInf: 'Fe²⁺ present' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NH₃ dropwise until in excess', correctObs: 'Dirty-green precipitate, insoluble in excess', correctInf: 'Fe²⁺ confirmed' },
        { id: 't4', prompt: '(iv) To portion 3, add Ba(NO₃)₂ followed by dilute HNO₃', correctObs: 'White precipitate, insoluble in dilute acid', correctInf: 'SO₄²⁻ confirmed' }
      ];
    case 'FeCl3':
      return [
        { id: 't1', prompt: '(i) Describe physical appearance of Solid Y', correctObs: 'Yellow-brown / reddish crystalline solid', correctInf: 'Fe³⁺ ion present' },
        { id: 't2', prompt: '(ii) Dissolve in water, add 2M NaOH dropwise until in excess', correctObs: 'Red-brown / rust-brown precipitate, insoluble in excess', correctInf: 'Fe³⁺ confirmed' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NH₃ dropwise until in excess', correctObs: 'Red-brown precipitate, insoluble in excess', correctInf: 'Fe³⁺ confirmed' },
        { id: 't4', prompt: '(iv) To portion 3, add 2–3 drops of lead(II) nitrate solution and warm the mixture', correctObs: 'White precipitate formed, dissolves on warming to form a colourless solution (reappears on cooling)', correctInf: 'Cl⁻ confirmed' }
      ];
    case 'CaCl2':
      return [
        { id: 't1', prompt: '(i) Describe physical appearance of Solid Y', correctObs: 'White deliquescent solid / crystals', correctInf: 'Non-transition metal salt' },
        { id: 't2', prompt: '(ii) Dissolve in water, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate, insoluble in excess NaOH', correctInf: 'Ca²⁺ or Mg²⁺ present' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NH₃ dropwise until in excess', correctObs: 'No precipitate formed with aqueous ammonia', correctInf: 'Ca²⁺ present (or group 1/2; transition metal ions absent)' },
        { id: 't4', prompt: '(iv) Dip a clean glass rod into the solution and place it in the non-luminous flame', correctObs: 'Brick-red / orange-red flame', correctInf: 'Ca²⁺ confirmed' },
        { id: 't5', prompt: '(v) To portion 3, add 2–3 drops of lead(II) nitrate solution and warm the mixture', correctObs: 'White precipitate formed, dissolves on warming to form a colourless solution (reappears on cooling)', correctInf: 'Cl⁻ confirmed' }
      ];
    case 'Ca(NO3)2':
      return [
        { id: 't1', prompt: '(i) Heat a half-spatula of Solid Y strongly in a dry hard-glass test tube', correctObs: 'Solid decrepitates and melts; brown fumes evolved that turn moist blue litmus red; rekindles glowing splint', correctInf: 'Thermal decomposition of nitrate salt; NO₂ and O₂ gases evolved; NO₃⁻ present' },
        { id: 't2', prompt: '(ii) Dissolve remainder in 10 cm³ distilled water, divide into 4 portions. Test portion 1 with litmus', correctObs: 'Clear colorless solution; neutral to litmus', correctInf: 'Soluble neutral salt' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate formed, insoluble in excess sodium hydroxide', correctInf: 'Ca²⁺ or Mg²⁺ present' },
        { id: 't4', prompt: '(iv) To portion 3, add 2M aqueous ammonia (NH₃) dropwise until in excess', correctObs: 'No precipitate formed with drops or with excess aqueous ammonia', correctInf: 'Ca²⁺ confirmed present' },
        { id: 't5', prompt: '(v) To portion 4, add 3-4 drops of dilute sulfuric acid (H₂SO₄)', correctObs: 'White precipitate formed (sparingly soluble CaSO₄)', correctInf: 'Ca²⁺ confirmed present' }
      ];
    case 'NH4Cl':
      return [
        { id: 't1', prompt: '(i) Heat Solid Y in a dry test tube gently, then strongly', correctObs: 'Sublimes; dense white fumes deposit on upper cooler walls of test tube', correctInf: 'Sublimable salt; NH₄⁺ present' },
        { id: 't2', prompt: '(ii) Dissolve remainder in distilled water, add 2M NaOH and warm gently', correctObs: 'Colorless gas with pungent choking smell evolved; turns moist red litmus blue', correctInf: 'Alkaline ammonia (NH₃) gas evolved; NH₄⁺ confirmed' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M aqueous ammonia dropwise until in excess', correctObs: 'No precipitate formed with drops or excess', correctInf: 'Heavy transition metal ions absent' },
        { id: 't4', prompt: '(iv) To portion 3, add 2–3 drops of lead(II) nitrate solution and warm the mixture', correctObs: 'White precipitate formed, dissolves on warming to form a colourless solution (reappears on cooling)', correctInf: 'Cl⁻ confirmed present' }
      ];
    case 'Al2(SO4)3':
      return [
        { id: 't1', prompt: '(i) Describe physical appearance of Solid Y and dissolve in 10 cm³ distilled water', correctObs: 'White crystalline solid dissolves completely to form a clear colorless solution', correctInf: 'Soluble salt; absence of colored transition metal ions' },
        { id: 't2', prompt: '(ii) To portion 1, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate formed, soluble in excess NaOH to give a colorless solution', correctInf: 'Al³⁺, Pb²⁺, or Zn²⁺ present' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M aqueous ammonia (NH₃) dropwise until in excess', correctObs: 'White precipitate formed, insoluble in excess aqueous ammonia', correctInf: 'Al³⁺ or Pb²⁺ present (Zn²⁺ absent)' },
        { id: 't4', prompt: '(iv) To portion 3, add 3 drops of potassium iodide (KI) solution', correctObs: 'No precipitate formed (solution remains clear)', correctInf: 'Al³⁺ confirmed present (Pb²⁺ absent)' },
        { id: 't5', prompt: '(v) To portion 4, add Ba(NO₃)₂ followed by dilute HNO₃', correctObs: 'White precipitate formed, insoluble in dilute nitric acid', correctInf: 'SO₄²⁻ confirmed present' }
      ];
    case 'BaCl2':
      return [
        { id: 't1', prompt: '(i) Describe appearance and dissolve in 10 cm³ distilled water', correctObs: 'White crystalline solid dissolves completely to give a clear colorless solution', correctInf: 'Soluble non-transition metal salt' },
        { id: 't2', prompt: '(ii) Dip a clean glass rod into the solution and place it in the non-luminous flame', correctObs: 'Pale apple-green flame', correctInf: 'Ba²⁺ present' },
        { id: 't3', prompt: '(iii) To portion 1, add dilute H₂SO₄ or Na₂SO₄ solution', correctObs: 'Dense white precipitate formed, insoluble in dilute HCl/HNO₃', correctInf: 'Ba²⁺ confirmed present (BaSO₄ formed)' },
        { id: 't4', prompt: '(iv) To portion 2, add 2–3 drops of lead(II) nitrate solution and warm the mixture', correctObs: 'White precipitate formed, dissolves on warming to form a colourless solution (reappears on cooling)', correctInf: 'Cl⁻ confirmed present' }
      ];
    case 'ZnSO4 + BaSO4':
      return [
        { id: 't1', prompt: '(i) Place Solid Mixture P in a beaker, add 15 cm³ distilled water, stir thoroughly and filter. Retain both filtrate and residue', correctObs: 'White residue remains on filter paper; clear colorless filtrate collected in boiling tube', correctInf: 'Mixture consists of an insoluble salt (residue) and a soluble salt (filtrate)' },
        { id: 't2', prompt: '(ii) To 2 cm³ of the filtrate, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate formed, dissolves in excess NaOH to form a colorless solution', correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present in filtrate' },
        { id: 't3', prompt: '(iii) To 2 cm³ of the filtrate, add 2M aqueous NH₃ dropwise until in excess', correctObs: 'White precipitate formed, dissolves completely in excess aqueous NH₃', correctInf: 'Zn²⁺ confirmed present in filtrate (Al³⁺ and Pb²⁺ are insoluble in excess NH₃)' },
        { id: 't4', prompt: '(iv) To 2 cm³ of the filtrate, add dilute HNO₃ followed by Ba(NO₃)₂ solution', correctObs: 'Dense white precipitate formed, insoluble in dilute nitric acid', correctInf: 'SO₄²⁻ confirmed present in filtrate' },
        { id: 't5', prompt: '(v) Transfer a half spatula of the residue into a test tube and add 2 cm³ of 2M dilute HCl', correctObs: 'Residue remains completely insoluble in dilute hydrochloric acid; no effervescence', correctInf: 'Insoluble barium sulfate (BaSO₄) confirmed in residue; carbonate absent' }
      ];
    default:
      return [
        { id: 't1', prompt: '(i) Physical appearance of Solid Y', correctObs: 'White solid', correctInf: 'Non-transition metal compound' },
        { id: 't2', prompt: '(ii) Add 2M NaOH dropwise until in excess', correctObs: 'White precipitate formed, soluble in excess', correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present' },
        { id: 't3', prompt: '(iii) Add 2M aqueous ammonia dropwise until in excess', correctObs: 'White precipitate formed', correctInf: 'Cation confirmed' },
        { id: 't4', prompt: '(iv) Add Ba(NO₃)₂ followed by dilute acid', correctObs: 'White precipitate formed', correctInf: 'Anion confirmed' }
      ];
  }
}

/**
 * Organic functional group test sequence generator
 */
function getOrganicTestSequence(organicKey) {
  switch (organicKey) {
    case 'Ethanoic Acid':
      return [
        { id: 'o1', prompt: '(a) Place 2 cm³ of Liquid Z in a test tube and test with both red and blue litmus paper', correctObs: 'Blue litmus paper turns red; red litmus paper remains red', correctInf: 'Liquid Z is acidic / contains H⁺ ions / -COOH group' },
        { id: 'o2', prompt: '(b) To 2 cm³ of Liquid Z, add half a spatula of solid Sodium Hydrogen Carbonate (NaHCO₃)', correctObs: 'Rapid effervescence / bubbling of a colourless gas that turns lime water cloudy', correctInf: '-COOH / Carboxylic acid group confirmed' },
        { id: 'o3', prompt: '(c) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and warm gently', correctObs: 'Purple colour of acidified KMnO₄ persists / does not decolourise', correctInf: 'Absence of readily oxidisable -OH group / unsaturation' },
        { id: 'o4', prompt: '(d) Ignite 3 drops of Liquid Z on a clean metallic spatula using a Bunsen burner flame', correctObs: 'Burns with a non-luminous, clear blue flame without smoke', correctInf: 'Short-chain saturated aliphatic compound with low carbon-to-hydrogen ratio' }
      ];
    case 'Cyclohexene':
      return [
        { id: 'o1', prompt: '(a) Test 2 cm³ of Liquid Z with red and blue litmus paper', correctObs: 'Both red and blue litmus papers remain unchanged', correctInf: 'Neutral organic substance' },
        { id: 'o2', prompt: '(b) To 2 cm³ of Liquid Z, add 3 drops of Bromine Water and shake vigorously', correctObs: 'Red-brown / yellow colour of bromine water is rapidly decolourised', correctInf: 'Unsaturated organic compound containing >C=C< or -C≡C- bond' },
        { id: 'o3', prompt: '(c) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄)', correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolourised to colourless', correctInf: '>C=C< alkene group confirmed' },
        { id: 'o4', prompt: '(d) Ignite 3 drops of Liquid Z on a metallic spatula in a Bunsen flame', correctObs: 'Burns with a smoky, yellow, luminous, sooty flame', correctInf: 'High carbon-to-hydrogen ratio / unsaturated compound' }
      ];
    case 'Hexane':
      return [
        { id: 'o1', prompt: '(a) Test Liquid Z with moist litmus paper', correctObs: 'No colour change on red or blue litmus', correctInf: 'Neutral hydrocarbon' },
        { id: 'o2', prompt: '(b) Add 3 drops of Bromine Water in the absence of direct sunlight', correctObs: 'Red-brown colour of bromine water persists / is not decolourised', correctInf: 'Saturated hydrocarbon / alkane' },
        { id: 'o3', prompt: '(c) Add 3 drops of acidified KMnO₄', correctObs: 'Purple colour persists / no decolourisation', correctInf: 'Resistant to mild oxidation / alkane' },
        { id: 'o4', prompt: '(d) Ignite 3 drops on a spatula', correctObs: 'Burns with a slightly luminous flame with minimal soot', correctInf: 'Saturated alkane' }
      ];
    case 'Ethanol':
    default:
      return [
        { id: 'o1', prompt: '(a) Place 2 cm³ of Liquid Z in a test tube and test with both red and blue litmus paper', correctObs: 'Both red and blue litmus paper remain unchanged / neutral', correctInf: 'Neutral organic substance; absence of -COOH or basic amine' },
        { id: 'o2', prompt: '(b) To 2 cm³ of Liquid Z, add half a spatula of solid Sodium Hydrogen Carbonate (NaHCO₃)', correctObs: 'No effervescence / no bubbles formed', correctInf: 'Absence of -COOH / carboxylic acid' },
        { id: 'o3', prompt: '(c) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and warm gently', correctObs: 'Purple colour of acidified KMnO₄ is decolourised to colourless', correctInf: 'Primary or secondary alkanol (-OH group) present / easily oxidised' },
        { id: 'o4', prompt: '(d) Ignite 3 drops of Liquid Z on a clean metallic spatula using a Bunsen burner flame', correctObs: 'Burns with a clear, non-sooty, pale-blue flame', correctInf: 'Short-chain saturated aliphatic compound with low carbon ratio (Alkanol)' }
      ];
  }
}

/**
 * Synchronize markdown marking scheme with updated exam parameters
 */
function generateSynchronizedMarkingScheme(exam) {
  const cfg = exam.examConfig || {};
  const q1 = cfg.q1 || {};
  const q2 = cfg.q2 || {};
  const q3 = cfg.q3 || {};

  // 1. Thermochemistry (Energy Changes) Marking Scheme
  if (q1.simulationType === 'energy' || exam.titrationType === 'energy') {
    const deltaT = Number(q1.deltaT || (Number(q1.maxTemp || 28.5) - Number(q1.meanInitialTemp || 22.0))).toFixed(1);
    const heatJ = Number(q1.heatEvolvedJoules || 2730);
    const moles = Number(q1.molesWater || 0.05);
    const molarH = Number(q1.molarEnthalpyKj || -54.6).toFixed(1);

    return `# KNEC KCSE CHEMISTRY PRACTICAL MARKING SCHEME (233/3)
**Paper Title:** ${exam.title || 'KCSE Chemistry Practical Mock — Thermochemistry'}  
**Target Level:** ${exam.formLevel || 'Form 3'} · **Time:** ${exam.durationMinutes || 90} Minutes  

---

### QUESTION 1: THERMOCHEMISTRY & ENTHALPY OF NEUTRALIZATION (15 MARKS)
- **Reagents:** ${q1.solutionA || '1.0 M Hydrochloric Acid'} vs ${q1.solutionB || '1.0 M Sodium Hydroxide'}
- **Volume Ratio:** ${q1.volumeA || 50} cm³ Solution A + ${q1.volumeB || 50} cm³ Solution B
- **Expected ΔT:** **${deltaT} °C** · **Molar Enthalpy ΔH:** **${molarH} kJ/mol**

#### 1. Table 1 Scoring Criteria (5 Marks):
| Parameter | Mark Breakdown |
|---|---|
| Complete Table | 1 Mark (Initial temperatures T₁, T₂ and highest temperature T₃ recorded) |
| Decimals | 1 Mark (All thermometer readings consistently to 1 d.p. ending in .0 or .5) |
| Accuracy | 1 Mark (T₃ within ±1.0 °C of teacher's value / standard: **${Number(q1.maxTemp || 28.5).toFixed(1)} °C**) |
| Mean Initial Temp T₀ | 1 Mark (Correct average T₀ = (T₁ + T₂) / 2) |
| Temperature Rise ΔT | 1 Mark (Correct calculation ΔT = T₃ - T₀) |

#### 2. Calculations (10 Marks):
- **(a) Heat evolved, Q = mcΔT:**
  $$Q = 100\\text{ g} \\times 4.2\\text{ J/g/K} \\times ${deltaT}\\text{ K} = ${heatJ}\\text{ Joules (${(heatJ/1000).toFixed(2)} kJ)}$$  (3 Marks: Substitution 2M, Accuracy 1M)
- **(b) Moles of water formed in reaction:**
  $$\\text{Moles} = \\frac{1.0\\text{ M} \\times 50\\text{ cm}^3}{1000} = ${moles.toFixed(3)}\\text{ moles}$$  (2 Marks)
- **(c) Molar enthalpy of neutralization, ΔH_neut:**
  $$\\Delta H_{neut} = -\\frac{${(heatJ/1000).toFixed(2)}\\text{ kJ}}{${moles.toFixed(3)}\\text{ mol}} = ${molarH}\\text{ kJ/mol}$$  (5 Marks: Working 3M, Sign and units 2M. **Deduct 1/2 mark if negative sign is omitted; deduct 1/2 mark if units missing.**)

---

### QUESTION 2: INORGANIC QUALITATIVE SALT ANALYSIS (15 MARKS)
**Sample:** ${q2.sampleName || 'Solid C'} (${q2.trueSaltName || 'Copper(II) Carbonate — CuCO₃'})  
**Confirmed Cation:** \`${q2.trueCation || 'Cu²⁺'}\` · **Confirmed Anion:** \`${q2.trueAnion || 'CO₃²⁻'}\`  

| Step & Procedure | Expected Observation | Deduction / Inference | Marks |
|---|---|---|:---:|
${(q2.tests || []).map(t => `| ${t.prompt} | ${t.correctObs} | ${t.correctInf} | 2-3 Marks |`).join('\n')}
`;
  }

  // 2. Reaction Rates & Kinetics Marking Scheme
  if (q1.simulationType === 'rates' || exam.titrationType === 'rates') {
    return `# KNEC KCSE CHEMISTRY PRACTICAL MARKING SCHEME (233/3)
**Paper Title:** ${exam.title || 'KCSE Chemistry Practical Mock — Reaction Kinetics'}  
**Target Level:** ${exam.formLevel || 'Form 3'} · **Time:** ${exam.durationMinutes || 90} Minutes  

---

### QUESTION 1: REACTION KINETICS & RATES OF REACTION (15 MARKS)
- **Investigation:** Effect of concentration on rate of reaction (Disappearing Cross)
- **Reagents:** ${q1.solutionA || '0.20 M Sodium Thiosulfate'} + ${q1.solutionB || '2.0 M Hydrochloric Acid'}

#### 1. Table 1 Scoring Criteria (5 Marks):
| Parameter | Mark Breakdown |
|---|---|
| Complete Table | 1 Mark (All 5 experimental runs recorded) |
| Decimals | 1 Mark (Time recorded in whole seconds or consistent 1 d.p.) |
| Accuracy | 1 Mark (Trend accuracy: time increases as thiosulfate volume decreases) |
| Reciprocal Calculation | 2 Marks (All 1/t values calculated correctly to 3 d.p.) |

#### 2. Graph & Deductions (10 Marks):
- **Graph of 1/t against Volume of Na₂S₂O₃ (5 Marks):**
  - **Scale (S - 1 Mark):** Uniform scale on both axes covering at least 50% grid.
  - **Axes (A - 1 Mark):** Correctly labeled with units [Volume (cm³), 1/t (s⁻¹)].
  - **Plotting (P - 2 Marks):** Points accurately plotted within 1/2 small square.
  - **Line / Curve (C - 1 Mark):** Smooth straight line drawn through origin (0,0).
- **Deductions & Interpretation (5 Marks):**
  - Relationship: Rate of reaction (1/t) is directly proportional to concentration of thiosulfate (2 Marks).
  - Graph value reading with construction lines (2 Marks).
  - Reaction time calculation t = 1 / rate (1 Mark).

---

### QUESTION 2: INORGANIC QUALITATIVE SALT ANALYSIS (15 MARKS)
**Sample:** ${q2.sampleName || 'Solid D'} (${q2.trueSaltName || 'Barium Chloride — BaCl₂'})  
**Confirmed Cation:** \`${q2.trueCation || 'Ba²⁺'}\` · **Confirmed Anion:** \`${q2.trueAnion || 'Cl⁻'}\`  

| Step & Procedure | Expected Observation | Deduction / Inference | Marks |
|---|---|---|:---:|
${(q2.tests || []).map(t => `| ${t.prompt} | ${t.correctObs} | ${t.correctInf} | 2-3 Marks |`).join('\n')}
`;
  }

  // 3. Gas Preparation & Identification Marking Scheme
  if (q1.simulationType === 'gas' || exam.titrationType === 'gas') {
    return `# KNEC KCSE CHEMISTRY PRACTICAL MARKING SCHEME (233/3)
**Paper Title:** ${exam.title || 'KCSE Chemistry Practical Mock — Gas Chemistry'}  
**Target Level:** ${exam.formLevel || 'Form 2'} · **Time:** ${exam.durationMinutes || 60} Minutes  

---

### QUESTION 1: GAS PREPARATION, PURIFICATION & IDENTIFICATION (15 MARKS)
- **Target Gas:** ${q1.gasName || 'Carbon(IV) Oxide — CO₂'}
- **Reagents:** ${q1.reagentSolid || 'Calcium Carbonate'} + ${q1.reagentLiquid || '2.0 M Hydrochloric Acid'}
- **Drying Agent:** ${q1.dryingAgent || 'Concentrated H₂SO₄'} · **Collection:** ${q1.collectionMethod || 'Downward delivery'}

#### Scoring Breakdown (15 Marks):
- **(a) Balanced chemical equation:** 2 Marks (\`CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)\`. Deduct 1/2 mark for missing state symbols).
- **(b) Drying agent rationale:** 2 Marks (Concentrated H₂SO₄ or anhydrous CaCl₂; CaO cannot be used as it is basic and reacts with acidic CO₂).
- **(c) Method of collection:** 2 Marks (Downward delivery / upward displacement of air because CO₂ is denser than air).
- **(d) Confirmatory test with lime water:** 3 Marks (Forms white precipitate of insoluble CaCO₃; dissolves in excess to form colorless Ca(HCO₃)₂).
- **(e) Combustion & litmus test:** 3 Marks (Extinguishes burning splint; moist blue litmus turns red due to weak carbonic acid).
- **(f) Apparatus diagram & setup:** 3 Marks (Airtight thistle funnel dipping below liquid level, delivery tube correctly aligned).

---

### QUESTION 2: INORGANIC QUALITATIVE SALT ANALYSIS (15 MARKS)
**Sample:** ${q2.sampleName || 'Solution E'} (${q2.trueSaltName || 'Calcium Chloride — CaCl₂'})  
**Confirmed Cation:** \`${q2.trueCation || 'Ca²⁺'}\` · **Confirmed Anion:** \`${q2.trueAnion || 'Cl⁻'}\`  

| Step & Procedure | Expected Observation | Deduction / Inference | Marks |
|---|---|---|:---:|
${(q2.tests || []).map(t => `| ${t.prompt} | ${t.correctObs} | ${t.correctInf} | 2-3 Marks |`).join('\n')}
`;
  }

  // 4. Solubility Curve Marking Scheme
  if (q1.simulationType === 'solubility' || exam.titrationType === 'solubility') {
    return `# KNEC KCSE CHEMISTRY PRACTICAL MARKING SCHEME (233/3)
**Paper Title:** ${exam.title || 'KCSE Chemistry Practical Mock — Solubility Curve'}  
**Target Level:** ${exam.formLevel || 'Form 3'} · **Time:** ${exam.durationMinutes || 90} Minutes  

---

### QUESTION 1: SOLUBILITY CURVE & CRYSTALLIZATION (15 MARKS)
- **Solute:** ${q1.soluteName || 'Potassium Chlorate (KClO₃)'} (${q1.soluteMassGrams || 5.0} g)
- **Investigation:** Crystallization temperature vs volume of water

#### 1. Table 1 Scoring Criteria (5 Marks):
| Parameter | Mark Breakdown |
|---|---|
| Complete Table | 1 Mark (All 4 dilution runs recorded) |
| Decimals | 1 Mark (Temperatures recorded consistently to 1 d.p.) |
| Accuracy | 1 Mark (Trend: crystallization temperature decreases with water volume) |
| Solubility Calculation | 2 Marks (Solubility in g/100g water calculated correctly) |

#### 2. Graph & Yield Calculation (10 Marks):
- **Graph of Solubility against Temperature (5 Marks):**
  - **Scale (S - 1 Mark):** Uniform scale on both axes covering >= 50% grid.
  - **Axes (A - 1 Mark):** Labeled with units [Temperature (°C), Solubility (g/100g water)].
  - **Plotting (P - 2 Marks):** Points accurately plotted within 1/2 small square.
  - **Curve (C - 1 Mark):** Smooth curve drawn through plotted points.
- **Deductions (5 Marks):**
  - Solubility read from graph at specified temperature (2 Marks).
  - Crystal yield calculation: Yield = Solubility at T_high - Solubility at T_low (3 Marks).

---

### QUESTION 2: INORGANIC QUALITATIVE SALT ANALYSIS (15 MARKS)
**Sample:** ${q2.sampleName || 'Solid G'} (${q2.trueSaltName || 'Potassium Chlorate — KClO₃'})  
**Confirmed Cation:** \`${q2.trueCation || 'K⁺'}\` · **Confirmed Anion:** \`${q2.trueAnion || 'ClO₃⁻'}\`  

| Step & Procedure | Expected Observation | Deduction / Inference | Marks |
|---|---|---|:---:|
${(q2.tests || []).map(t => `| ${t.prompt} | ${t.correctObs} | ${t.correctInf} | 2-3 Marks |`).join('\n')}
`;
  }

  // 5. Classic / Composite Volumetric Titration Marking Scheme
  const molesB = (Number(q1.trueBaseMolarity || 0.1) * Number(q1.pipetteVolume || 25.0)) / 1000;
  const molesA = molesB * (Number(q1.ratioA || 1) / Number(q1.ratioB || 1));

  return `# KNEC KCSE CHEMISTRY PRACTICAL MARKING SCHEME (233/3)
**Paper Title:** ${exam.title || 'KCSE Chemistry Practical Mock'}  
**Target Level:** ${exam.formLevel || 'Form 4'} · **Time:** ${exam.durationMinutes || 135} Minutes  

---

### QUESTION 1: VOLUMETRIC ANALYSIS (15 MARKS)
- **Reagents:** ${q1.solutionA || 'Solution A'} (Burette) vs ${q1.solutionB || 'Solution B'} (Conical Flask)
- **Pipette Volume:** ${Number(q1.pipetteVolume || 25.0).toFixed(1)} cm³ · **Indicator:** ${q1.indicator || 'phenolphthalein'}
- **Expected Concordant Titre:** **${Number(q1.trueTitre || 25.0).toFixed(2)} cm³**

#### 1. Table 1 Scoring Criteria (5 Marks):
| Parameter | Mark Breakdown |
|---|---|
| Complete Table (CT) | 1 Mark (3 trials completed within realistic volume boundaries) |
| Use of Decimals (D) | 1 Mark (Readings recorded consistently to 1 or 2 decimal places) |
| Accuracy (A) | 1 Mark (Within $\\pm 0.20\\text{ cm}^3$ of teacher / theoretical titre: **${Number(q1.trueTitre || 25.0).toFixed(2)} cm³**) |
| Concordancy / PA | 1 Mark (Student selects concordant readings within $\\pm 0.20\\text{ cm}^3$) |
| Final Accuracy (FA) | 1 Mark (Correct algebraic average calculation shown to 2 d.p.) |

#### 2. Calculations (10 Marks):
- **(a) Moles of Solution B pipetted:**
  $$\\text{Moles of B} = \\frac{${Number(q1.trueBaseMolarity || 0.1).toFixed(3)}\\text{ M} \\times ${Number(q1.pipetteVolume || 25.0).toFixed(1)}\\text{ cm}^3}{1000} = ${molesB.toExponential(3)}\\text{ moles}$$  (2 Marks)
- **(b) Reaction Stoichiometry & Balanced Equation:**
  \`${q1.equation || 'Acid + Base -> Salt + Water'}\`
  - Mole ratio Solution A : Solution B = **${q1.ratioA || 1} : ${q1.ratioB || 1}**  (1 Mark)
- **(c) Moles of Solution A used:**
  $$\\text{Moles of A} = \\text{Moles of B} \\times \\frac{${q1.ratioA || 1}}{${q1.ratioB || 1}} = ${molesA.toExponential(3)}\\text{ moles}$$  (2 Marks)
- **(d) Concentration / Molarity of Solution A:**
  $$\\text{Molarity of A} = \\frac{\\text{Moles of A} \\times 1000}{\\text{Average Titre (${Number(q1.trueTitre || 25.0).toFixed(2)} cm³)}} = ${Number(q1.trueAcidMolarity || 0.1).toFixed(3)}\\text{ M}$$  (3 Marks)
- **(e) Units Penalty Note:** Deduct 1/2 mark for missing or incorrect units.

---

### QUESTION 2: INORGANIC QUALITATIVE SALT ANALYSIS (15 MARKS)
**Sample:** ${q2.sampleName || 'Solid Y'} (${q2.trueSaltName || 'Unknown Salt'})  
**Confirmed Cation:** \`${q2.trueCation || 'Zn²⁺'}\` · **Confirmed Anion:** \`${q2.trueAnion || 'SO₄²⁻'}\`  

| Step & Procedure | Expected Observation | Deduction / Inference | Marks |
|---|---|---|:---:|
${(q2.tests || []).map(t => `| ${t.prompt} | ${t.correctObs} | ${t.correctInf} | 2-3 Marks |`).join('\n')}

---

### QUESTION 3: ORGANIC CHEMISTRY TESTING (10 MARKS)
**Sample:** ${q3.sampleName || 'Liquid Z'} (${q3.trueOrganicName || 'Ethanol'})  
**Functional Group:** \`${q3.trueFunctionalGroup || 'Alkanol (-OH)'}\`  

| Step & Procedure | Expected Observation | Deduction / Inference | Marks |
|---|---|---|:---:|
${(q3.tests || []).map(t => `| ${t.prompt} | ${t.correctObs} | ${t.correctInf} | 2-3 Marks |`).join('\n')}
`;
}

/**
 * Synchronize laboratory technician confidential instructions with updated exam parameters
 */
function generateSynchronizedPrepGuide(exam) {
  const cfg = exam.examConfig || {};
  const q1 = cfg.q1 || {};
  const q2 = cfg.q2 || {};
  const q3 = cfg.q3 || {};

  // 1. Thermochemistry Prep Guide
  if (q1.simulationType === 'energy' || exam.titrationType === 'energy') {
    return `# CONFIDENTIAL INSTRUCTIONS TO LABORATORY TECHNICIANS
**Paper:** ${exam.title || 'KCSE Chemistry Paper 3 Mock — Thermochemistry'}  
**Target Level:** ${exam.formLevel || 'Form 3'} · **Time:** ${exam.durationMinutes || 90} Minutes  

> **CONFIDENTIAL:** These instructions must not fall into candidate hands prior to examination commencement.

---

### 1. QUESTION 1 PREPARATIONS (THERMOCHEMISTRY)
- **Solution A (${q1.solutionA || '1.0 M HCl'}):**
  - Allocate **100 cm³** per candidate in a clean reagent bottle labeled "SOLUTION A".
  - Prepared at **1.000 M**.
- **Solution B (${q1.solutionB || '1.0 M NaOH'}):**
  - Allocate **100 cm³** per candidate in a bottle labeled "SOLUTION B".
  - Prepared at **1.000 M**.
- **Apparatus:** 1 × plastic beaker / calorimeter (150–250 cm³), 1 × thermometer (0–100 °C graduated to 0.5 °C), 1 × 50 cm³ measuring cylinder.
- **Expected ΔT Range:** **6.0 °C to 7.0 °C**.

### 2. QUESTION 2 PREPARATIONS (SALT ANALYSIS)
- **Target Substance:** ${q2.trueSaltName || 'Copper(II) Carbonate'} (${q2.trueSaltKey || 'CuCO3'})
- **Quantity per candidate:** **2.0 g** of ${q2.sampleName || 'Solid C'} in a dry stoppered tube.
- **Bench reagents:** 2M dilute HNO₃, 2M NaOH, 2M aqueous NH₃, lime water in dropper bottle, Bunsen burner, test tubes (5), and test tube holder.
`;
  }

  // 2. Reaction Rates Prep Guide
  if (q1.simulationType === 'rates' || exam.titrationType === 'rates') {
    return `# CONFIDENTIAL INSTRUCTIONS TO LABORATORY TECHNICIANS
**Paper:** ${exam.title || 'KCSE Chemistry Paper 3 Mock — Reaction Kinetics'}  
**Target Level:** ${exam.formLevel || 'Form 3'} · **Time:** ${exam.durationMinutes || 90} Minutes  

> **CONFIDENTIAL:** These instructions must not fall into candidate hands prior to examination commencement.

---

### 1. QUESTION 1 PREPARATIONS (REACTION RATES)
- **Solution A (${q1.solutionA || '0.20 M Sodium thiosulfate'}):**
  - Allocate **200 cm³** per candidate (prepared by dissolving 31.6 g of Na₂S₂O₃·5H₂O in 1 dm³ distilled water).
- **Solution B (${q1.solutionB || '2.0 M Hydrochloric acid'}):**
  - Allocate **100 cm³** per candidate.
- **Apparatus:** 1 × white paper card with printed 0.5 mm black cross (X), 1 × 100 cm³ flat-bottom glass beaker, 1 × stopwatch readable to 0.1s, 1 × 50 cm³ measuring cylinder, 1 × 10 cm³ measuring cylinder.

### 2. QUESTION 2 PREPARATIONS (SALT ANALYSIS)
- **Target Substance:** ${q2.trueSaltName || 'Barium Chloride'} (${q2.trueSaltKey || 'BaCl2'})
- **Quantity per candidate:** **2.0 g** of ${q2.sampleName || 'Solid D'} in a dry stoppered tube.
- **Bench reagents:** 2M dilute H₂SO₄, 0.1M AgNO₃, 2M dilute HNO₃, concentrated HCl for wire cleaning, nichrome wire / glass rod, Bunsen burner.
`;
  }

  // 3. Gas Preparation Prep Guide
  if (q1.simulationType === 'gas' || exam.titrationType === 'gas') {
    return `# CONFIDENTIAL INSTRUCTIONS TO LABORATORY TECHNICIANS
**Paper:** ${exam.title || 'KCSE Chemistry Paper 3 Mock — Gas Chemistry'}  
**Target Level:** ${exam.formLevel || 'Form 2'} · **Time:** ${exam.durationMinutes || 60} Minutes  

> **CONFIDENTIAL:** These instructions must not fall into candidate hands prior to examination commencement.

---

### 1. QUESTION 1 PREPARATIONS (GAS PREPARATION)
- **Apparatus per workstation:** 1 × flat-bottomed flask (250 cm³) with 2-hole bung, thistle funnel, delivery tubes, wash bottle with conc. H₂SO₄, 2 × clean gas jars with cover slips.
- **Reagents:** 20 g of marble chips (CaCO₃) labeled "SOLID E", 100 cm³ of 2.0 M HCl labeled "SOLUTION F".
- **Testing:** Lime water in dropper bottle, wooden splints, Bunsen burner.

### 2. QUESTION 2 PREPARATIONS (SALT ANALYSIS)
- **Target Substance:** ${q2.trueSaltName || 'Calcium Chloride'} (${q2.trueSaltKey || 'CaCl2'})
- **Bench reagents:** 2M NaOH, 2M aqueous NH₃, 0.1M AgNO₃, 2M dilute HNO₃, test tubes and rack.
`;
  }

  // 4. Solubility Prep Guide
  if (q1.simulationType === 'solubility' || exam.titrationType === 'solubility') {
    return `# CONFIDENTIAL INSTRUCTIONS TO LABORATORY TECHNICIANS
**Paper:** ${exam.title || 'KCSE Chemistry Paper 3 Mock — Solubility Curve'}  
**Target Level:** ${exam.formLevel || 'Form 3'} · **Time:** ${exam.durationMinutes || 90} Minutes  

> **CONFIDENTIAL:** These instructions must not fall into candidate hands prior to examination commencement.

---

### 1. QUESTION 1 PREPARATIONS (SOLUBILITY)
- **Substance:** Exactly **5.00 g** of Potassium chlorate (KClO₃) weighed into a dry boiling tube labeled "SOLID G".
- **Apparatus:** 1 × clean boiling tube with clamp and stand, 1 × thermometer (-10 to 110 °C graduated to 0.5 °C), 1 × 50 cm³ burette filled with distilled water, 1 × 400 cm³ beaker for water bath, tripod, wire gauze, Bunsen burner.

### 2. QUESTION 2 PREPARATIONS (SALT ANALYSIS)
- **Target Substance:** ${q2.trueSaltName || 'Potassium Chlorate'} (${q2.trueSaltKey || 'KClO3'})
- **Bench reagents:** Nichrome wire, cobalt blue glass, concentrated HCl, wooden splints, 0.1M AgNO₃, 2M dilute HNO₃.
`;
  }

  // 5. Classic / Composite Volumetric Prep Guide
  return `# CONFIDENTIAL INSTRUCTIONS TO LABORATORY TECHNICIANS
**Paper:** ${exam.title || 'KCSE Chemistry Paper 3 Mock'}  
**Target Level:** ${exam.formLevel || 'Form 4'} · **Time:** ${exam.durationMinutes || 135} Minutes  

> **CONFIDENTIAL:** These instructions must not fall into candidate hands prior to examination commencement.

---

### 1. QUESTION 1 PREPARATIONS (VOLUMETRIC ANALYSIS)
- **Solution A (${q1.solutionA}):**
  - Allocate **150 cm³** per candidate in a clean, dry plastic or glass reagent bottle labelled "SOLUTION A".
  - Prepared at **${Number(q1.trueAcidMolarity || 0.1).toFixed(3)} M**.
- **Solution B (${q1.solutionB}):**
  - Allocate **150 cm³** per candidate in a bottle labelled "SOLUTION B".
  - Prepared at **${Number(q1.trueBaseMolarity || 0.1).toFixed(3)} M**.
- **Indicator:** ${q1.indicator || 'phenolphthalein'} indicator supplied with dropper.
- **Expected Titre Range:** **${(Number(q1.trueTitre || 25.0) - 0.2).toFixed(2)} cm³ to ${(Number(q1.trueTitre || 25.0) + 0.2).toFixed(2)} cm³**.

### 2. QUESTION 2 PREPARATIONS (SALT ANALYSIS)
- **Target Substance:** ${q2.trueSaltName || 'Unknown Salt'} (${q2.trueSaltKey})
- **Quantity per candidate:** **2.0 g** of ${q2.sampleName || 'Solid Y'} in a dry stoppered container.
- **Reagents on bench:** 2M NaOH, 2M Aqueous Ammonia (NH₃), Ba(NO₃)₂ solution, Pb(NO₃)₂ solution, dilute HNO₃, distilled water wash bottle.

### 3. QUESTION 3 PREPARATIONS (ORGANIC ANALYSIS)
- **Target Substance:** ${q3.trueOrganicName || 'Ethanol'} (${q3.trueFunctionalGroup})
- **Quantity per candidate:** **10 cm³** of ${q3.sampleName || 'Liquid Z'} in a small specimen bottle.
- **Reagents on bench:** Red & blue litmus paper, solid NaHCO₃, acidified KMnO₄ (0.01M in 1M H₂SO₄), Bunsen burner, metallic spatula.

### 4. APPARATUS CHECKLIST PER CANDIDATE
- 1 × Burette (50 cm³) with retort stand and clamp
- 1 × Pipette (${Number(q1.pipetteVolume || 25.0).toFixed(0)} cm³) and pipette filler
- 2 × Conical flasks (250 cm³)
- 1 × White tile and 100 cm³ beaker
- 6 × Clean, dry test tubes in a test tube rack
- 1 × Test tube holder and Bunsen burner
`;
}

/**
 * Intelligent Smart Refinement Engine (Offline & Fallback Resilience)
 * Reliably processes all teacher instructions including:
 * - Concentration & molarity (Solution A, Solution B, specific numbers)
 * - Pipette volumes (20, 25, 10 cm³)
 * - Indicator choices
 * - Acid/base types and stoichiometry ratios
 * - Unknown inorganic salts with full diagnostic test sequences
 * - Organic functional groups with testing sequences
 * - Title, duration, form level, and recalculates concordant titre
 */
function applySmartRefinement(currentDraft, instruction) {
  const updated = JSON.parse(JSON.stringify(currentDraft));
  const raw = instruction || '';
  const lower = raw.toLowerCase();

  if (!updated.examConfig) updated.examConfig = {};
  if (!updated.examConfig.q1) updated.examConfig.q1 = {};
  if (!updated.examConfig.q2) updated.examConfig.q2 = {};
  if (!updated.examConfig.q3) updated.examConfig.q3 = {};

  const q1 = updated.examConfig.q1;
  const q2 = updated.examConfig.q2;
  const q3 = updated.examConfig.q3;

  const changes = [];

  // ============================================================
  // 1. CONCENTRATION & MOLARITY ADJUSTMENTS
  // ============================================================
  const solAPattern = /(?:solution\s*a|acid|burette|titrant|hcl|kmno4|h2so4)[^0-9\n]*?(\d+(?:\.\d+)?)\s*(?:m\b|molar|mol\/dm|mol\/l)?/i;
  const solBPattern = /(?:solution\s*b|base|flask|analyte|naoh|alkali|carbonate)[^0-9\n]*?(\d+(?:\.\d+)?)\s*(?:m\b|molar|mol\/dm|mol\/l)?/i;

  let newConcA = null;
  let newConcB = null;

  if (solAPattern.test(lower)) {
    const match = lower.match(solAPattern);
    if (match && match[1]) newConcA = parseFloat(match[1]);
  }
  if (solBPattern.test(lower)) {
    const match = lower.match(solBPattern);
    if (match && match[1]) newConcB = parseFloat(match[1]);
  }

  // General concentration pattern: e.g. "change the concentration to 0.05M", "change concentration to 0.05", "set concentration 0.05"
  if (newConcA === null && newConcB === null) {
    const generalMatch = lower.match(/(?:concentration|conc|molarity|molar|to|make it|is|=|set to)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:m\b|molar|mol\/dm|mol\/l)?/i)
                      || lower.match(/(\d+(?:\.\d+)?)\s*(?:m\b|molar|mol\/dm3|mol\/l)/i);
    if (generalMatch && generalMatch[1]) {
      const val = parseFloat(generalMatch[1]);
      if (lower.includes('solution b') || lower.includes('base') || lower.includes('flask') || lower.includes('naoh')) {
        newConcB = val;
      } else {
        newConcA = val;
      }
    }
  }

  if (newConcA !== null && !isNaN(newConcA) && newConcA > 0) {
    q1.trueAcidMolarity = newConcA;
    const formattedA = newConcA.toFixed(3) + ' M';
    if (q1.solutionA && /\d+(?:\.\d+)?\s*M/i.test(q1.solutionA)) {
      q1.solutionA = q1.solutionA.replace(/\d+(?:\.\d+)?\s*M/i, formattedA);
    } else {
      q1.solutionA = `${formattedA} ${q1.solutionA || 'Hydrochloric Acid (HCl)'}`;
    }
    changes.push(`Solution A concentration updated to ${formattedA}`);
  }

  if (newConcB !== null && !isNaN(newConcB) && newConcB > 0) {
    q1.trueBaseMolarity = newConcB;
    const formattedB = newConcB.toFixed(3) + ' M';
    if (q1.solutionB && /\d+(?:\.\d+)?\s*M/i.test(q1.solutionB)) {
      q1.solutionB = q1.solutionB.replace(/\d+(?:\.\d+)?\s*M/i, formattedB);
    } else {
      q1.solutionB = `${formattedB} ${q1.solutionB || 'Sodium Hydroxide (NaOH)'}`;
    }
    changes.push(`Solution B concentration updated to ${formattedB}`);
  }

  // ============================================================
  // 2. PIPETTE VOLUME
  // ============================================================
  if (lower.includes('20') && (lower.includes('pipette') || lower.includes('cm') || lower.includes('volume') || lower.includes('aliquot'))) {
    q1.pipetteVolume = 20.0;
    changes.push('Pipette volume set to 20.0 cm³');
  } else if (lower.includes('25') && (lower.includes('pipette') || lower.includes('cm') || lower.includes('volume') || lower.includes('aliquot'))) {
    q1.pipetteVolume = 25.0;
    changes.push('Pipette volume set to 25.0 cm³');
  } else if (lower.includes('10') && (lower.includes('pipette') || lower.includes('cm') || lower.includes('volume') || lower.includes('aliquot'))) {
    q1.pipetteVolume = 10.0;
    changes.push('Pipette volume set to 10.0 cm³');
  }

  // ============================================================
  // 3. INDICATOR
  // ============================================================
  if (lower.includes('screened methyl orange')) {
    q1.indicator = 'screenedMethylOrange';
    changes.push('Indicator changed to Screened Methyl Orange');
  } else if (lower.includes('methyl orange')) {
    q1.indicator = 'methylOrange';
    changes.push('Indicator changed to Methyl Orange');
  } else if (lower.includes('phenolphthalein') || lower.includes('pop')) {
    q1.indicator = 'phenolphthalein';
    changes.push('Indicator changed to Phenolphthalein');
  } else if (lower.includes('starch')) {
    q1.indicator = 'starch';
    changes.push('Indicator changed to Starch');
  }

  // ============================================================
  // 4. REAGENT / REACTION TYPE (ACIDS & BASES)
  // ============================================================
  if (lower.includes('sulfuric') || lower.includes('h2so4') || lower.includes('dibasic')) {
    q1.ratioA = 1;
    q1.ratioB = 2;
    q1.acidRfm = 98.0;
    q1.equation = 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l)';
    const concMatch = (q1.solutionA || '').match(/\d+(?:\.\d+)?\s*M/i);
    const conc = concMatch ? concMatch[0] : `${(q1.trueAcidMolarity || 0.050).toFixed(3)} M`;
    q1.solutionA = `${conc} Sulfuric(VI) Acid (H₂SO₄)`;
    changes.push('Titration configured as dibasic Sulfuric Acid (1:2 mole ratio)');
  } else if (lower.includes('carbonate') || lower.includes('na2co3')) {
    q1.ratioA = 2;
    q1.ratioB = 1;
    q1.baseRfm = 106.0;
    q1.equation = '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)';
    const concMatch = (q1.solutionB || '').match(/\d+(?:\.\d+)?\s*M/i);
    const conc = concMatch ? concMatch[0] : `${(q1.trueBaseMolarity || 0.050).toFixed(3)} M`;
    q1.solutionB = `${conc} Sodium Carbonate (Na₂CO₃)`;
    changes.push('Titration configured as Sodium Carbonate neutralization (2:1 mole ratio)');
  }

  // Recalculate concordant titre with updated concentrations / stoichiometry / pipette
  const nA = Number(q1.ratioA) || 1;
  const nB = Number(q1.ratioB) || 1;
  const cA = Number(q1.trueAcidMolarity) || 0.100;
  const cB = Number(q1.trueBaseMolarity) || 0.100;
  const vB = Number(q1.pipetteVolume) || 25.0;
  if (nB > 0 && cA > 0) {
    q1.trueTitre = Number(((nA * cB * vB) / (nB * cA)).toFixed(2));
  } else {
    q1.trueTitre = 25.00;
  }
  if (newConcA !== null || newConcB !== null) {
    changes.push(`Target concordant titre recalculated: ${q1.trueTitre.toFixed(2)} cm³`);
  }

  // ============================================================
  // 5. UNKNOWN INORGANIC SALT (QUESTION 2)
  // ============================================================
  let matchedSaltKey = null;
  if (lower.includes('mixture') || (lower.includes('barium') && lower.includes('zinc'))) {
    matchedSaltKey = 'ZnSO4 + BaSO4';
    q2.trueSaltKey = 'ZnSO4 + BaSO4';
    q2.trueSaltName = 'Zinc Sulfate + Barium Sulfate Mixture';
    q2.trueCation = 'Zn2+, Ba2+';
    q2.trueAnion = 'SO42-';
    q2.sampleDesc = 'White solid mixture containing one soluble salt and one insoluble salt';
  } else if (lower.includes('ammonium') || lower.includes('nh4')) {
    matchedSaltKey = 'NH4Cl';
    q2.trueSaltKey = 'NH4Cl';
    q2.trueSaltName = 'Ammonium Chloride — NH₄Cl';
    q2.trueCation = 'NH4+';
    q2.trueAnion = 'Cl-';
    q2.sampleDesc = 'White crystalline solid, sublimes on heating';
  } else if (lower.includes('calcium nitrate') || (lower.includes('calcium') && lower.includes('nitrate'))) {
    matchedSaltKey = 'Ca(NO3)2';
    q2.trueSaltKey = 'Ca(NO3)2';
    q2.trueSaltName = 'Calcium Nitrate — Ca(NO₃)₂';
    q2.trueCation = 'Ca2+';
    q2.trueAnion = 'NO3-';
    q2.sampleDesc = 'Pure white inorganic crystalline salt';
  } else if (lower.includes('aluminium') || lower.includes('aluminum')) {
    matchedSaltKey = 'Al2(SO4)3';
    q2.trueSaltKey = 'Al2(SO4)3';
    q2.trueSaltName = 'Aluminium Sulfate — Al₂(SO₄)₃';
    q2.trueCation = 'Al3+';
    q2.trueAnion = 'SO42-';
    q2.sampleDesc = 'White crystalline solid / powder';
  } else if (lower.includes('barium') && (lower.includes('chloride') || lower.includes('bacl2'))) {
    matchedSaltKey = 'BaCl2';
    q2.trueSaltKey = 'BaCl2';
    q2.trueSaltName = 'Barium Chloride — BaCl₂';
    q2.trueCation = 'Ba2+';
    q2.trueAnion = 'Cl-';
    q2.sampleDesc = 'White crystalline solid';
  } else if (lower.includes('zinc') || lower.includes('zn')) {
    matchedSaltKey = 'ZnSO4';
    q2.trueSaltKey = 'ZnSO4';
    q2.trueSaltName = 'Zinc Sulfate — ZnSO₄';
    q2.trueCation = 'Zn2+';
    q2.trueAnion = 'SO42-';
    q2.sampleDesc = 'Pure white inorganic crystalline salt';
  } else if (lower.includes('lead') || lower.includes('pb')) {
    matchedSaltKey = 'Pb(NO3)2';
    q2.trueSaltKey = 'Pb(NO3)2';
    q2.trueSaltName = 'Lead(II) Nitrate — Pb(NO₃)₂';
    q2.trueCation = 'Pb2+';
    q2.trueAnion = 'NO3-';
    q2.sampleDesc = 'White crystalline solid, soluble in cold water';
  } else if (lower.includes('copper') || lower.includes('cu')) {
    matchedSaltKey = 'CuSO4';
    q2.trueSaltKey = 'CuSO4';
    q2.trueSaltName = 'Copper(II) Sulfate — CuSO₄';
    q2.trueCation = 'Cu2+';
    q2.trueAnion = 'SO42-';
    q2.sampleDesc = 'Blue crystalline solid / powder';
  } else if (lower.includes('iron(ii)') || lower.includes('iron 2') || lower.includes('feso4') || (lower.includes('iron') && lower.includes('green'))) {
    matchedSaltKey = 'FeSO4';
    q2.trueSaltKey = 'FeSO4';
    q2.trueSaltName = 'Iron(II) Sulfate — FeSO₄';
    q2.trueCation = 'Fe2+';
    q2.trueAnion = 'SO42-';
    q2.sampleDesc = 'Pale green crystalline solid';
  } else if (lower.includes('iron(iii)') || lower.includes('iron 3') || lower.includes('fecl3') || (lower.includes('iron') && lower.includes('brown'))) {
    matchedSaltKey = 'FeCl3';
    q2.trueSaltKey = 'FeCl3';
    q2.trueSaltName = 'Iron(III) Chloride — FeCl₃';
    q2.trueCation = 'Fe3+';
    q2.trueAnion = 'Cl-';
    q2.sampleDesc = 'Reddish-brown crystalline deliquescent solid';
  } else if (lower.includes('calcium') || lower.includes('cacl2')) {
    matchedSaltKey = 'CaCl2';
    q2.trueSaltKey = 'CaCl2';
    q2.trueSaltName = 'Calcium Chloride — CaCl₂';
    q2.trueCation = 'Ca2+';
    q2.trueAnion = 'Cl-';
    q2.sampleDesc = 'White deliquescent crystals';
  }

  if (matchedSaltKey) {
    q2.tests = getSaltTestSequence(matchedSaltKey);
    changes.push(`Unknown salt set to ${q2.trueSaltName} with updated KNEC test procedures`);
  }

  // ============================================================
  // 6. ORGANIC COMPOUND (QUESTION 3)
  // ============================================================
  let matchedOrganicKey = null;
  if (lower.includes('ethanoic') || lower.includes('acetic') || lower.includes('carboxylic')) {
    matchedOrganicKey = 'Ethanoic Acid';
    q3.trueOrganicKey = 'Ethanoic Acid';
    q3.trueOrganicName = 'Ethanoic Acid — CH₃COOH';
    q3.trueFunctionalGroup = 'Carboxylic Acid (-COOH)';
    q3.sampleDesc = 'Colourless liquid with sharp pungent vinegar odour';
  } else if (lower.includes('cyclohexene') || lower.includes('alkene') || lower.includes('unsaturated') || lower.includes('double bond')) {
    matchedOrganicKey = 'Cyclohexene';
    q3.trueOrganicKey = 'Cyclohexene';
    q3.trueOrganicName = 'Cyclohexene — C₆H₁₀';
    q3.trueFunctionalGroup = 'Alkene (>C=C<)';
    q3.sampleDesc = 'Clear volatile organic liquid with hydrocarbon odour';
  } else if (lower.includes('hexane') || lower.includes('alkane') || lower.includes('saturated')) {
    matchedOrganicKey = 'Hexane';
    q3.trueOrganicKey = 'Hexane';
    q3.trueOrganicName = 'Hexane — C₆H₁₄';
    q3.trueFunctionalGroup = 'Saturated Alkane';
    q3.sampleDesc = 'Colourless neutral liquid, immiscible with water';
  } else if (lower.includes('ethanol') || lower.includes('alcohol') || lower.includes('alkanol')) {
    matchedOrganicKey = 'Ethanol';
    q3.trueOrganicKey = 'Ethanol';
    q3.trueOrganicName = 'Ethanol — C₂H₅OH';
    q3.trueFunctionalGroup = 'Alkanol (-OH)';
    q3.sampleDesc = 'Clear neutral volatile liquid with characteristic sweet odour';
  }

  if (matchedOrganicKey) {
    q3.tests = getOrganicTestSequence(matchedOrganicKey);
    changes.push(`Organic sample set to ${q3.trueOrganicName} with updated functional group tests`);
  }

  // ============================================================
  // 7. EXAM TITLE, FORM LEVEL, DURATION
  // ============================================================
  const titleMatch = raw.match(/(?:title to|rename to|call it)\s*[:=]?\s*["']?([^"'\n,]+)["']?/i);
  if (titleMatch && titleMatch[1]) {
    updated.title = titleMatch[1].trim();
    changes.push(`Title updated to "${updated.title}"`);
  }

  if (lower.includes('form 3')) updated.formLevel = 'Form 3';
  if (lower.includes('form 4')) updated.formLevel = 'Form 4';
  if (lower.includes('form 2')) updated.formLevel = 'Form 2';
  if (lower.includes('form 1')) updated.formLevel = 'Form 1';

  const durationMatch = lower.match(/(?:duration|time|mins?|minutes?)\s*[:=]?\s*(\d+)/i);
  if (durationMatch && durationMatch[1]) {
    updated.durationMinutes = parseInt(durationMatch[1], 10);
    changes.push(`Duration set to ${updated.durationMinutes} minutes`);
  }

  // ============================================================
  // 8. SYNCHRONIZE MARKING SCHEME & TECHNICIAN GUIDE
  // ============================================================
  const cleanSolBInst = (q1.solutionB || 'Solution B')
    .replace(/(?:~\s*)?\b\d+(?:\.\d+)?\s*M\b/gi, '')
    .replace(/\s*containing\s+\d+(?:\.\d+)?\s*g\/(?:dm³|dm3|l|liter|litre)/gi, '')
    .replace(/\s*\(\s*\d+(?:\.\d+)?\s*g\/(?:dm³|dm3|l|liter|litre)\s*\)/gi, '')
    .trim()
    .replace(/^[,;\-~ \t]+|[,;\-~ \t]+$/g, '')
    .replace(/\s{2,}/g, ' ');
  const solBInstructionName = cleanSolBInst && !/solution|sample/i.test(cleanSolBInst) ? `${cleanSolBInst} solution` : (cleanSolBInst || 'Solution B');
  q1.instructions = `You are provided with ${q1.solutionA} and ${solBInstructionName}. Pipette ${Number(q1.pipetteVolume || 25.0).toFixed(1)} cm³ of Solution B into a conical flask and titrate with Solution A using ${q1.indicator} indicator.`;
  updated.markingScheme = generateSynchronizedMarkingScheme(updated);
  updated.confidentialPrepGuide = generateSynchronizedPrepGuide(updated);

  // ============================================================
  // 9. REBUILD questions[] ARRAY (keeps both formats in sync)
  // Patch the questions[] array to reflect any examConfig changes
  // so the flexible format stays consistent with legacy examConfig.
  // ============================================================
  if (Array.isArray(updated.questions) && updated.questions.length > 0) {
    updated.questions = updated.questions.map(q => {
      // For simulated type questions, sync config from examConfig
      const legacyKey = q.number === 1 ? 'q1' : q.number === 2 ? 'q2' : q.number === 3 ? 'q3' : null;
      if (legacyKey && updated.examConfig[legacyKey] && q.simulationType !== 'written') {
        return { ...q, config: updated.examConfig[legacyKey] };
      }
      return q;
    });
  } else {
    // No questions[] yet — build it now from the updated examConfig
    updated.questions = normalizeQuestionsArray(updated);
  }

  return { updated, changes };
}

/**
 * 3. Conversational Refinement of an existing exam draft
 */
async function refineExamDraft({ currentDraft, instruction }) {
  if (!currentDraft || typeof currentDraft !== 'object') {
    throw new Error('CURRENT_DRAFT_REQUIRED');
  }

  const prompt = `You are a Senior KNEC Chemistry Practical Examiner assisting a secondary school teacher who wants to adjust an existing exam draft.

Teacher's Instruction / Change Request:
"${instruction}"

Current Exam Draft:
${JSON.stringify(currentDraft, null, 2)}

STRICT REQUIREMENTS FOR ADJUSTMENTS:
1. Carefully inspect the teacher's instruction and update all affected fields in the exam JSON.
2. CONCENTRATION & MOLARITY:
   If the teacher asks to change concentration (e.g. "change the concentration to 0.05M", "make Solution A 0.2M", "change molarity"):
   - Update q1.solutionA and/or q1.solutionB with the exact new concentration string (e.g. "0.050 M Hydrochloric Acid (HCl)").
   - Update q1.trueAcidMolarity and/or q1.trueBaseMolarity to the numeric value.
   - Recalculate trueTitre accurately based on stoichiometry: trueTitre = (ratioA * trueBaseMolarity * pipetteVolume) / (ratioB * trueAcidMolarity).
   - Update the markingScheme calculation steps and confidentialPrepGuide with the new concentration!
3. PIPETTE, INDICATOR, UNKNOWN SALTS, ORGANIC SAMPLES, TITLE, DURATION:
   Update all corresponding fields in examConfig, markingScheme, and confidentialPrepGuide.
4. Respond with ONLY the updated valid JSON object matching the exact schema:
{
  "title": "<updated or preserved title>",
  "formLevel": "<form level>",
  "titrationType": "<titration type>",
  "instructions": "<updated or preserved instructions>",
  "durationMinutes": <number>,
  "examConfig": { ... updated simulation config ... },
  "markingScheme": "<updated markdown marking scheme>",
  "confidentialPrepGuide": "<updated markdown lab technician guide>"
}`;

  try {
    const rawResult = await callGeminiAssistant({ prompt, maxTokens: EXAM_MAX_TOKENS });
    const parsed = cleanAndParseJson(rawResult);
    
    // Double-check if the instruction requested a concentration/salt change that Gemini might have omitted
    const smartCheck = applySmartRefinement(parsed, instruction);
    const finalDraft = smartCheck.changes.length > 0 ? smartCheck.updated : parsed;
    const appliedChanges = smartCheck.changes;

    return normalizeExamStructure(finalDraft, {
      source: 'ai_refinement',
      lastInstruction: instruction,
      appliedChanges
    });
  } catch (err) {
    console.warn('[refineExamDraft] AI refinement failed or not configured, applying smart heuristic engine:', err.message);
    const { updated, changes } = applySmartRefinement(currentDraft, instruction);
    return normalizeExamStructure(updated, {
      source: 'smart_fallback',
      lastInstruction: instruction,
      appliedChanges: changes,
      errorReason: err.message
    });
  }
}

function isAiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
}

function getAiStatus() {
  const configured = isAiConfigured();
  return {
    configured,
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    message: configured
      ? 'Google Gemini AI engine is ready for multimodal paper parsing and exam synthesis.'
      : 'GEMINI_API_KEY is not configured in server/.env. Add your Gemini API key to enable live AI multimodal paper parsing.'
  };
}

module.exports = {
  parseExamPaper,
  generateExamFromIdea,
  refineExamDraft,
  normalizeExamStructure,
  normalizeQuestionsArray,
  SUPPORTED_SIMULATION_TYPES,
  isAiConfigured,
  getAiStatus,
  cleanAndParseJson,
  callGeminiAssistant,
  FALLBACK_PRESETS
};

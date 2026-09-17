// ============================================================
//  VirtuLab Kenya — KNEC KCSE Past Practical Papers Archive (1989–2016)
//  Syllabus-Aligned with KNEC Paper 3 (233/3) Examination Specifications
//  Source: Chemistry Practical Study Pack 1989 - 2016
// ============================================================

const KCSE_LEAD_NOTES = {
  title: 'Lead Notes: Quantitative & Qualitative Analysis',
  quantitative: {
    overview: 'Quantitative analysis mainly involves volumetric analysis (titrations) and thermochemistry (energy changes) to estimate quantities of substances by analytical measurement.',
    apparatus: ['Thermometer', 'Stop-watch / stop-clock', 'Burette (0.10 cm³ precision)', 'Pipette (25.0 cm³)', 'Measuring cylinders (10 cm³, 100 cm³)', 'Calorimetric beakers'],
    commonErrors: [
      'Errors made during weighing of solid reagents by lab technician or candidate',
      'Contaminated solutions due to unrinsed burettes, pipettes, or beakers',
      'Parallax errors or failure to read stopwatch and thermometer at calibrated eye level',
      'Inaccurate identification of titration end-point (e.g., over-titrating past permanent colour discharge)'
    ],
    graphPlottingRules: [
      'Scale (Sc): Must cover at least half of the grid provided (>= 4.5 x 3.5 big squares) with uniform scale intervals',
      'Labeling (L): Both axes must be correctly labelled with physical quantity and unit (e.g., Temperature / °C, Volume / cm³)',
      'Plotting (Pt): Points plotted to within 1/2 of a small square; penalty for inverted axes',
      'Lines & Extrapolation (ext): Straight line of best fit or smooth curve; extrapolations must extend cleanly to target time or volume mark'
    ]
  },
  qualitative: {
    overview: 'Qualitative analysis requires systematic detection of inorganic cations, anions, and organic functional groups with precise scientific terminology.',
    cationTests: [
      { reagent: 'NaOH (aq) dropwise then excess', ions: 'White ppt soluble in excess: Pb²⁺, Al³⁺, Zn²⁺; White ppt insoluble: Ca²⁺, Mg²⁺; Green ppt insoluble: Fe²⁺; Brown ppt insoluble: Fe³⁺; Blue ppt insoluble: Cu²⁺' },
      { reagent: 'NH₃ (aq) dropwise then excess', ions: 'White ppt soluble in excess: Zn²⁺; White ppt insoluble in excess: Al³⁺, Pb²⁺, Mg²⁺; Pale blue ppt soluble to deep blue: Cu²⁺; Green ppt: Fe²⁺; Brown ppt: Fe³⁺; No ppt: Ca²⁺, Na⁺, K⁺' },
      { reagent: 'Flame Test', ions: 'Lilac/purple: K⁺; Golden yellow: Na⁺; Crimson: Li⁺; Brick-red: Ca²⁺; Blue-green: Cu²⁺' }
    ],
    anionTests: [
      { reagent: 'Dilute acid (HCl / HNO₃)', obs: 'Effervescence of colourless gas', inference: 'CO₃²⁻, HCO₃⁻ (turns limewater milky), or SO₃²⁻ (choking gas, turns acidified KMnO₄ colourless)' },
      { reagent: 'Ba(NO₃)₂ or BaCl₂ followed by dilute acid', obs: 'White precipitate insoluble in dilute acid', inference: 'SO₄²⁻ confirmed (BaSO₄ formed)' },
      { reagent: 'Ba(NO₃)₂ or BaCl₂ followed by dilute acid', obs: 'White precipitate dissolves on adding acid', inference: 'SO₃²⁻ or CO₃²⁻ present' },
      { reagent: 'Acidified Pb(NO₃)₂', obs: 'White precipitate dissolving on boiling and reappearing on cooling', inference: 'Cl⁻ confirmed (PbCl₂)' },
      { reagent: 'Cold FeSO₄ + conc. H₂SO₄ (Brown ring test)', obs: 'Brown ring at liquid junction', inference: 'NO₃⁻ confirmed' }
    ],
    organicTests: [
      { test: 'Ignition on spatula / flame', obs: 'Burns with clean pale blue non-sooty flame: Saturated compound / low C:H ratio; Yellow smoky sooty flame: Unsaturated compound (>C=C< or -C≡C-) / high C:H ratio' },
      { test: 'Moist litmus paper', obs: 'Blue turns red: Acidic substance / carboxylic acid (-COOH) / H⁺ ions; Red stays red, blue stays blue: Neutral substance' },
      { test: 'Solid NaHCO₃ / Na₂CO₃', obs: 'Brisk effervescence with gas turning limewater milky: Carboxylic acid (-COOH) confirmed; No effervescence: -COOH absent' },
      { test: 'Acidified KMnO₄ or Bromine water', obs: 'Decolorized rapidly: Alkene (>C=C<) / primary or secondary alkanol; Color persists: Saturated compound' },
      { test: 'Acidified K₂Cr₂O₇ + warm', obs: 'Orange turns green: Primary or secondary alkanol (-OH); Orange color persists: Alcohol absent' }
    ]
  }
};

const KCSE_PAST_PAPERS_ARCHIVE = [
  // ── KCSE 2013 ──
  {
    id: 'kcse_2013',
    year: 2013,
    title: 'KCSE 2013 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Displacement Calorimetry, KMnO₄ Redox & Zincate',
    topics: ['Thermochemistry', 'Redox Volumetric Analysis', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: 'series_2013',
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Molar heat of displacement of copper by iron powder, followed by redox back-titration of unoxidized Fe²⁺ with 0.02M acidified KMnO₄. Qualitative testing of Solid E (zinc carbonate & zinc ions) and Solid G (unsaturated carboxylic acid).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Thermochemistry & Redox Titration (20.0 Marks)',
        procedure: 'Measure 50.0 cm³ of Solution A (aqueous copper(II) sulphate) into a 100 ml beaker. Record initial temperature. Add all of Solid B (iron powder) at once, start stopwatch, stir continuously, and record temperature every 1 minute up to 7 minutes. Decant mixture into 250 ml volumetric flask, rinse residue with distilled water, add 50 cm³ of 2M H₂SO₄, and dilute to 250.0 cm³ mark (Solution D). Titrate 25.0 cm³ portions of Solution D with Solution C (0.02M acidified KMnO₄) until the first permanent pink colour.',
        table1: {
          title: 'Table I: Temperature vs Time for Displacement',
          headers: ['Time (min)', '0', '1', '2', '3', '4', '5', '6', '7'],
          sampleValues: ['21.0', '26.0', '31.5', '35.0', '37.0', '36.5', '36.0', '35.5']
        },
        table2: {
          title: 'Table 2: Titration of Solution D against Solution C (0.02M KMnO₄)',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 18.50', 'Final: 36.90', 'Final: 18.40', 'Initial: 0.00', 'Initial: 18.50', 'Initial: 0.00', 'Titre: 18.50', 'Titre: 18.40', 'Titre: 18.40']
        },
        calculations: [
          '(a) (i) Plot graph of temperature against time. (3 Mks)',
          '(a) (ii) Determine highest temperature change ΔT and time for reaction completion. (1.5 Mks)',
          '(a) (iii) Calculate heat change for the reaction: Heat = 50 × 4.2 × ΔT. (2 Mks)',
          '(b) (i) Calculate average volume of Solution C used. (1 Mk)',
          '(b) (ii) Calculate moles of KMnO₄ used and moles of Fe²⁺ in 250 cm³ (Mole ratio Fe²⁺:MnO₄⁻ = 5:1). (2 Mks)',
          '(c) Calculate molar heat of displacement of copper by iron. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid E (10.0 Marks)',
        preamble: 'Solid E is a mixture of zinc carbonate and zinc sulphate.',
        tests: [
          { step: '(a) (i)', prompt: 'Transfer half of dry residue from Q1 into dry test-tube. Heat strongly and test gas with burning splint.', obs: 'Brown residue turns yellow on heating, turns white on cooling; colourless odourless gas that extinguishes burning splint', inf: 'CO₃²⁻ present; ZnO formed' },
          { step: '(a) (ii)', prompt: 'Place rest of residue in test tube, add 4 cm³ of 2M HCl.', obs: 'Effervescence of colourless gas; forms colourless solution', inf: 'CO₃²⁻ confirmed; Zn²⁺ present' },
          { step: '(a) (iii)', prompt: 'To 2 cm³ of solution from (a)(ii), add aqueous ammonia dropwise until excess.', obs: 'White precipitate soluble in excess aqueous ammonia to form colourless solution', inf: 'Zn²⁺ confirmed present (tetraamminezinc formed)' },
          { step: '(b) (i)', prompt: 'To 2 cm³ of filtrate from Q1, add aqueous ammonia in excess.', obs: 'Pale blue precipitate dissolves in excess NH₃ to form deep blue solution', inf: 'Cu²⁺ confirmed present' },
          { step: '(b) (ii)', prompt: 'To 2 cm³ of filtrate, add 2M HCl followed by Ba(NO₃)₂ solution.', obs: 'Dense white precipitate insoluble in dilute HCl', inf: 'SO₄²⁻ confirmed present' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Functional Group Analysis of Solid G (10.0 Marks)',
        preamble: 'Solid G is an organic compound.',
        tests: [
          { step: '(a)', prompt: 'Place one-third of Solid G on a metallic spatula and burn in a Bunsen burner flame.', obs: 'Melts and burns with a yellow smoky / luminous sooty flame', inf: 'Unsaturated organic compound / high C:H ratio (>C=C< or -C≡C-)' },
          { step: '(b) (i)', prompt: 'Dissolve remaining Solid G in 10 cm³ distilled water. To 2 cm³, add 2 drops acidified KMnO₄.', obs: 'Purple KMnO₄ solution is rapidly decolorized / turns colourless', inf: 'Alkene (>C=C<) or reducing group present' },
          { step: '(b) (ii)', prompt: 'To 2 cm³ of solution, add solid sodium hydrogen carbonate (NaHCO₃).', obs: 'Brisk effervescence of colourless gas that turns limewater milky', inf: 'Carboxylic acid (-COOH) confirmed present' },
          { step: '(c)', prompt: 'Determine pH of solution using universal indicator paper and chart.', obs: 'Paper turns orange-red; pH = 1 – 3', inf: 'Strongly / moderately acidic carboxylic acid' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Graph plotting', marks: '3.0 Mks', rubric: 'Scale (Sc) 0.5 Mk, Labelling (L) 0.5 Mk, Plotting (Pt) 1.0 Mk, Extrapolation curve (ext) 1.0 Mk.' },
        { item: 'ΔT determination', marks: '1.0 Mk', rubric: 'Correct reading from extrapolated plateau minus initial temperature. Accept ±0.5 °C.' },
        { item: 'Heat change (ΔH)', marks: '2.0 Mks', rubric: 'ΔH = 50.0 × 4.2 × ΔT Joules. Must include negative sign for exothermic displacement (-ΔH).' },
        { item: 'Titre averaging', marks: '1.0 Mk', rubric: 'Average of concordant titres within ±0.20 cm³. Correct decimal representation to 2 d.p.' },
        { item: 'Moles of KMnO₄ & Fe²⁺', marks: '2.0 Mks', rubric: 'Moles MnO₄⁻ = (0.02 × V) / 1000. Moles Fe²⁺ in 250 cm³ = (Moles MnO₄⁻ × 5) × (250 / 25).' },
        { item: 'Molar heat of displacement', marks: '2.0 Mks', rubric: 'ΔH_disp = -(Heat evolved / Moles of Cu²⁺/Fe reacted). Accept -150 to -215 kJ/mol.' }
      ],
      qualitativeObservations: 'See detailed step-by-step rubrics above. Penalize 0.5 Mk for contradictory ions or missing charges on ions.',
      confidentialPrep: 'Solution A: 125.2 g CuSO₄·5H₂O in 1 L (0.50 M). Solid B: 1.60 g iron powder per student. Solution C: 3.16 g KMnO₄ in 1 L 0.5 M H₂SO₄ (0.02 M). Solid E: 0.5 g ZnCO₃ + 0.5 g ZnSO₄. Solid G: Maleic acid or cinnamic acid.'
    }
  },

  // ── KCSE 2012 ──
  {
    id: 'kcse_2012',
    year: 2012,
    title: 'KCSE 2012 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Iodometric Titration, Clock Kinetics & Halide Testing',
    topics: ['Redox Volumetric Analysis', 'Chemical Kinetics', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Iodometric redox titration of unknown oxidizing agent Solution A with 0.05M sodium thiosulphate (Solution B) using starch indicator. Procedure II investigates reaction rate kinetics (1/t vs volume). Qualitative testing of Solid E (lead/barium nitrate) and Solid F (carboxylic acid).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Iodometric Titration & Reaction Rates (20.0 Marks)',
        procedure: 'Procedure 1: Pipette 25.0 cm³ of Solution A (oxidizing agent) into conical flask. Add 10 cm³ aqueous KI and 10 cm³ of 2M H₂SO₄. Titrate liberated iodine with 0.05M sodium thiosulphate (Solution B) until pale yellow; add 2 cm³ starch solution D (turns dark blue), and continue titrating until blue colour just discharges colourless.\nProcedure 2: In 6 test tubes, prepare dilutions of Solution A (10, 8, 7, 5, 4, 3 cm³) with distilled water. In a 100 ml beaker, place 5 cm³ of reducing agent C and 5 cm³ starch. Add test tube 1, immediately start stopwatch, swirl, and record time taken for sudden blue colour to appear.',
        table1: {
          title: 'Table 1: Titration of Liberated Iodine with Thiosulphate',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 24.20', 'Final: 48.30', 'Final: 24.10', 'Initial: 0.00', 'Initial: 24.20', 'Initial: 0.00', 'Titre: 24.20', 'Titre: 24.10', 'Titre: 24.10']
        },
        table2: {
          title: 'Table 2: Clock Kinetics Dilution Series',
          headers: ['Test Tube', '1', '2', '3', '4', '5', '6'],
          sampleValues: ['Vol Water: 0', '2', '3', '5', '6', '7', 'Vol A (cm³): 10', '8', '7', '5', '4', '3', 'Time (s): 18', '23', '29', '44', '60', '91', 'Rate (1/s): 0.056', '0.043', '0.034', '0.023', '0.017', '0.011']
        },
        calculations: [
          '(a) Determine average volume of Solution B used. (1 Mk)',
          '(b) Calculate moles of sodium thiosulphate: (0.05 × Titre) / 1000. (1 Mk)',
          '(c) Given 1 mole of A reacts with 6 moles of thiosulphate, calculate moles of A in 25 cm³ and concentration of A in mol/dm³. (3 Mks)',
          '(d) Plot graph of rate (1/time, s⁻¹) against volume of Solution A. (3 Mks)',
          '(e) Determine time taken if 6.0 cm³ of A and 4.0 cm³ water were used. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid E (10.0 Marks)',
        preamble: 'Solid E contains one cation and one anion.',
        tests: [
          { step: '(i) Test I', prompt: 'To 2 cm³ of Solution E, add 2 drops aqueous sodium sulphate (Na₂SO₄).', obs: 'Dense white precipitate formed', inf: 'Pb²⁺, Ba²⁺, or Ca²⁺ present' },
          { step: '(i) Test II', prompt: 'To 2 cm³ of Solution E, add 5 drops aqueous sodium chloride (NaCl).', obs: 'White precipitate formed, which dissolves on boiling and reappears on cooling', inf: 'Pb²⁺ confirmed present (PbCl₂)' },
          { step: '(i) Test III', prompt: 'To 2 cm³ of Solution E, add 2 drops barium nitrate solution.', obs: 'No white precipitate formed', inf: 'SO₄²⁻ absent' },
          { step: '(ii)', prompt: 'To 2 cm³ Solution E, add 5 drops 2M NaOH and aluminium foil; warm gently and test gas with moist red litmus.', obs: 'Effervescence; pungent gas evolved that turns moist red litmus blue', inf: 'NO₃⁻ confirmed present; NH₃ gas evolved by reduction with Al/NaOH' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Analysis of Solid F (10.0 Marks)',
        preamble: 'Solid F is a white organic solid.',
        tests: [
          { step: '(a)', prompt: 'Dissolve Solid F in 20 cm³ water. To 2 cm³, add solid sodium hydrogen carbonate (NaHCO₃).', obs: 'Brisk effervescence of colourless gas that turns limewater milky', inf: 'Carboxylic acid (-COOH) confirmed present' },
          { step: '(b) (i)', prompt: 'Add 10 cm³ dilute HCl to rest of F, filter, wash residue, dry, and burn a portion on spatula.', obs: 'Burns with a smoky, yellow sooty flame', inf: 'Unsaturated / aromatic carboxylic acid' },
          { step: '(c) (ii)', prompt: 'To second portion of residue suspension, add 2 drops bromine water.', obs: 'Yellow/orange colour of bromine water persists (not decolorized)', inf: 'Aliphatic C=C double bond absent; aromatic ring or saturated chain' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Average Titre', marks: '1.0 Mk', rubric: 'Concordant titres within ±0.20 cm³.' },
        { item: 'Moles of thiosulphate', marks: '1.0 Mk', rubric: 'Moles = (0.05 × Titre) / 1000.' },
        { item: 'Molarity of Solution A', marks: '3.0 Mks', rubric: 'Moles A = Moles Thiosulphate / 6. Molarity A = (Moles A × 1000) / 25.' },
        { item: 'Rate graph', marks: '3.0 Mks', rubric: 'Axes correctly labeled (1/t on y-axis, Volume on x-axis); smooth straight line through origin.' },
        { item: 'Interpolation of time', marks: '2.0 Mks', rubric: 'Read 1/t at 6.0 cm³, take reciprocal t = 1 / (1/t). Must state units in seconds.' }
      ],
      qualitativeObservations: 'Full marks awarded for correct observation and corresponding inference. Taboo penalties apply for unscientific descriptions.',
      confidentialPrep: 'Solution A: 1.20 g KIO₃ per litre. Solution B: 12.40 g Na₂S₂O₃·5H₂O per litre (0.05 M). Solution C: 0.40 g NaHSO₃ per litre. Solid E: Lead(II) nitrate Pb(NO₃)₂. Solid F: Benzoic acid.'
    }
  },

  // ── KCSE 2011 ──
  {
    id: 'kcse_2011',
    year: 2011,
    title: 'KCSE 2011 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Dibasic Acid Standardization, Ammonium Salt Back-Titration',
    topics: ['Volumetric Back-Titration', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: 'series_2011',
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Preparation of standard solution of dibasic acid Solid A (H₂X·2H₂O), standardization of NaOH Solution C, and back-titration to determine the relative formula mass of ammonium Salt B. Qualitative analysis of Solid D (Fe²⁺/Fe³⁺ oxidation) and Solution E (sulfite SO₃²⁻).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Volumetric Analysis & Back-Titration (20.0 Marks)',
        procedure: 'Procedure I: Add 25.0 cm³ of Salt B solution to 25.0 cm³ of NaOH Solution C in two conical flasks. Boil for 5 minutes to expel ammonia gas; allow to cool.\nProcedure II: Dissolve 1.60 g of dibasic acid Solid A in 250 ml volumetric flask. Titrate 25.0 cm³ portions of NaOH Solution C with Solution A using phenolphthalein indicator.\nProcedure III: Titrate the cooled boiled reaction mixture from Procedure I with Solution A using phenolphthalein to determine unreacted excess NaOH.',
        table1: {
          title: 'Table 1: Standardization of NaOH Solution C with Dibasic Acid A',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 29.70', 'Final: 29.40', 'Final: 29.30', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 0.00', 'Titre: 29.70', 'Titre: 29.40', 'Titre: 29.30']
        },
        table2: {
          title: 'Table 2: Titration of Residual Excess NaOH in Salt B Mixture',
          headers: ['Titration', '1st Flask', '2nd Flask'],
          sampleValues: ['Final: 21.20', 'Final: 32.60', 'Initial: 9.70', 'Initial: 21.20', 'Titre: 11.50', 'Titre: 11.40']
        },
        calculations: [
          '(i) Calculate average volume of Solution A used in Table 1. (0.5 Mk)',
          '(ii) Calculate molar concentration of dibasic acid Solution A (RFM = 126.0). (2 Mks)',
          '(iii) Calculate moles of dibasic acid and moles of NaOH in 25.0 cm³ of Solution C. (2 Mks)',
          '(iv) Calculate concentration of NaOH Solution C in mol/dm³. (2 Mks)',
          '(v) Calculate average volume of Solution A in Table 2. (0.5 Mk)',
          '(vi) Calculate moles of NaOH that reacted with 25.0 cm³ of Salt B. (2 Mks)',
          '(vii) Given 1 mole of Salt B reacts with 2 moles of NaOH, calculate relative molecular mass of Salt B (contains 4.75 g/L). (3 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid D and Solution E (10.0 Marks)',
        preamble: 'Solid D and Solution E contain inorganic ions.',
        tests: [
          { step: '(a) (i)', prompt: 'Heat Solid D in dry test-tube; test gas with moist litmus papers.', obs: 'Pungent gas evolved that turns moist red litmus blue; colourless liquid droplets condense; white sublimes', inf: 'NH₄⁺ present; hydrated salt' },
          { step: '(a) (ii)', prompt: 'Dissolve Solid D in water, add 1 cm³ H₂O₂ followed by aqueous NaOH dropwise to excess.', obs: 'Solution turns yellow-brown; reddish-brown precipitate formed, insoluble in excess NaOH', inf: 'Fe²⁺ oxidized to Fe³⁺ by H₂O₂; Fe³⁺ confirmed present' },
          { step: '(b) (i)', prompt: 'To Solution E, add 3 drops barium nitrate solution.', obs: 'White precipitate formed', inf: 'SO₄²⁻, SO₃²⁻, or CO₃²⁻ present' },
          { step: '(b) (ii)', prompt: 'To the mixture, add 5 cm³ 2M nitric(V) acid.', obs: 'White precipitate dissolves completely with effervescence of choking gas', inf: 'SO₃²⁻ confirmed present (SO₂ evolved)' },
          { step: '(b) (iii)', prompt: 'To another portion of Solution E, add 2 drops acidified K₂Cr₂O₇.', obs: 'Orange solution turns green', inf: 'SO₃²⁻ confirmed reducing agent' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Functional Group Analysis of Liquid F (10.0 Marks)',
        preamble: 'Liquid F is an organic liquid.',
        tests: [
          { step: '(a)', prompt: 'Ignite 2 drops of Liquid F on metallic spatula.', obs: 'Burns with a non-luminous, clean pale blue flame; no soot', inf: 'Saturated organic compound / low carbon:hydrogen ratio' },
          { step: '(b)', prompt: 'Add solid NaHCO₃ to 2 cm³ of Liquid F.', obs: 'No effervescence / no bubbles formed', inf: 'Carboxylic acid (-COOH) absent' },
          { step: '(c)', prompt: 'To 2 cm³ of Liquid F, add 3 drops acidified K₂Cr₂O₇ and warm gently.', obs: 'Orange solution turns green; sweet fruity ester/aldehyde smell', inf: 'Primary or secondary alkanol (-OH) confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Molarity of Solution A', marks: '2.0 Mks', rubric: 'Conc A = (1.60 × 4) / 126 = 0.0508 M (accept 0.051 M).' },
        { item: 'Molarity of NaOH Solution C', marks: '2.0 Mks', rubric: 'Moles acid = Conc A × V₁ / 1000. Moles NaOH = Moles acid × 2. Molarity = (Moles NaOH × 1000) / 25.0 ≈ 0.10 M.' },
        { item: 'Moles NaOH reacted with Salt B', marks: '2.0 Mks', rubric: 'Initial moles NaOH in 25 cm³ minus residual moles NaOH titrated in Table 2.' },
        { item: 'RFM of Salt B', marks: '3.0 Mks', rubric: 'Moles Salt B = Moles NaOH reacted / 2. Molarity Salt B = (Moles × 1000) / 25. RFM = 4.75 / Molarity Salt B. Expected RFM = 132 (Ammonium sulphate).' }
      ],
      qualitativeObservations: 'Full credit for tied observations and deductions. Fe²⁺ oxidation must note colour change to brown.',
      confidentialPrep: 'Solid A: 1.60 g hydrated oxalic acid H₂C₂O₄·2H₂O. Solution B: 4.75 g (NH₄)₂SO₄ in 1 L. Solution C: 8.0 g NaOH in 1 L (diluted 1:1 to 0.10M). Solid D: Ammonium iron(II) sulfate. Solution E: Sodium sulphite Na₂SO₃. Liquid F: Absolute ethanol.'
    }
  },

  // ── KCSE 2009 ──
  {
    id: 'kcse_2009',
    year: 2009,
    title: 'KCSE 2009 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Metal Carbonate Solubility & Volumetric Double Titration',
    topics: ['Solubility Determination', 'Acid-Base Volumetric Analysis', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: 'series_2009',
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Determination of the solubility of an unknown metal carbonate M₂CO₃ (Solid A) in water via preparation of a saturated solution, followed by two-stage titration using standardized hydrochloric acid (Solution D) against 0.3M NaOH (Solution C). Qualitative analysis of Solid E and Solid F.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Carbonate Solubility & Volumetric Titration (20.0 Marks)',
        procedure: 'Step 1: Place all Solid A in 250 ml beaker, add 100 cm³ distilled water, stir thoroughly for 2 minutes, and leave to stand.\nStep 2: Dilute 25.0 cm³ of concentrated HCl Solution B to 250 ml in volumetric flask (Solution D).\nStep 3: Titrate 25.0 cm³ portions of Solution D with 0.3M NaOH Solution C using methyl orange indicator.\nStep 4: Filter the saturated mixture of Solid A from Step 1 into dry conical flask.\nStep 5: Titrate 25.0 cm³ of the clear filtrate (Solution A) with Solution D using methyl orange indicator.',
        table1: {
          title: 'Table 1: Titration of Diluted HCl Solution D with 0.3M NaOH Solution C',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 22.20', 'Final: 21.50', 'Final: 22.50', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 1.00', 'Titre: 21.50', 'Titre: 21.50', 'Titre: 21.50']
        },
        table2: {
          title: 'Table 2: Titration of Saturated Carbonate Filtrate with Solution D',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 21.50', 'Final: 20.90', 'Final: 20.90', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 0.00', 'Titre: 21.50', 'Titre: 20.90', 'Titre: 20.90']
        },
        calculations: [
          '(a) Calculate average volume of Solution C and molarity of Solution D. (3 Mks)',
          '(b) Calculate average volume of Solution D used in Table 2. (1 Mk)',
          '(c) Calculate moles of HCl in average volume of Solution D. (1 Mk)',
          '(d) Calculate moles of metal carbonate in 25.0 cm³ of filtrate (Mole ratio HCl:M₂CO₃ = 2:1). (1 Mk)',
          '(e) Calculate solubility of metal carbonate in g/100g of water (RFM of M₂CO₃ = 74.0, density = 1.0 g/cm³). (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid E (10.0 Marks)',
        preamble: 'Solid E is an inorganic salt.',
        tests: [
          { step: '(a)', prompt: 'Heat half of Solid E strongly in dry test tube; test gas using HCl on glass rod.', obs: 'White solid sublimes forming white deposit on cool walls; dense white fumes with HCl on rod', inf: 'NH₄⁺ confirmed present (forms NH₄Cl dense fumes)' },
          { step: '(b) (i)', prompt: 'Dissolve rest of Solid E in water. To portion 1, add aqueous ammonia dropwise to excess.', obs: 'White precipitate formed, insoluble in excess aqueous ammonia', inf: 'Al³⁺ or Pb²⁺ present (Zn²⁺ absent)' },
          { step: '(b) (ii)', prompt: 'To portion 2, add 1 cm³ dilute HCl.', obs: 'No white precipitate formed; solution remains clear', inf: 'Pb²⁺ absent; Al³⁺ confirmed present' },
          { step: '(b) (iii)', prompt: 'To portion 3, add 2 drops aqueous lead(II) nitrate and boil.', obs: 'Dense white precipitate formed, which does not dissolve on boiling', inf: 'SO₄²⁻ confirmed present (PbSO₄)' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Functional Group Analysis of Solid F (10.0 Marks)',
        preamble: 'Solid F is an organic substance.',
        tests: [
          { step: '(a) (i)', prompt: 'Add ethanol to Solid F. Determine pH using universal indicator paper.', obs: 'pH = 7 (neutral)', inf: 'Neutral non-polar organic compound' },
          { step: '(a) (ii)', prompt: 'To mixture, add solid sodium hydrogen carbonate (NaHCO₃).', obs: 'No effervescence / no bubbles formed', inf: 'Carboxylic acid (-COOH) absent; H⁺ absent' },
          { step: '(b) (ii)', prompt: 'Dissolve in water, warm, and add acidified K₂Cr₂O₇.', obs: 'Orange colour of K₂Cr₂O₇ persists (does not turn green)', inf: 'Primary / secondary alkanol (-OH) absent' },
          { step: '(b) (iii)', prompt: 'To another portion, add 5 drops bromine water.', obs: 'Reddish-brown bromine water remains unchanged / not decolorized', inf: 'Alkene (>C=C<) absent; saturated organic compound' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Molarity of Solution D (HCl)', marks: '3.0 Mks', rubric: 'Moles NaOH = (0.3 × V_c) / 1000. Molarity D = (Moles NaOH × 1000) / 25.0 ≈ 0.258 M.' },
        { item: 'Moles of M₂CO₃ in 25 cm³', marks: '1.0 Mk', rubric: 'Moles M₂CO₃ = 0.5 × (Molarity D × V_d / 1000) = 0.0027 mol.' },
        { item: 'Solubility calculation', marks: '2.0 Mks', rubric: 'Mass in 25 cm³ = 0.0027 × 74.0 = 0.1998 g. Solubility = (0.1998 / 25) × 100 = 0.799 g/100g water.' }
      ],
      qualitativeObservations: 'Full marks for unambiguous chemical wording: "White precipitate insoluble in excess".',
      confidentialPrep: 'Solid A: 1.8 g lithium carbonate Li₂CO₃ (RFM = 73.9 ≈ 74). Solution B: 215 cm³ conc. HCl in 1 L. Solution C: 12.0 g NaOH in 1 L (0.30 M). Solid E: (NH₄)₂Al(SO₄)₂ (Ammonium alum). Solid F: Pure saturated ester or amide.'
    }
  },

  // ── KCSE 2008 ──
  {
    id: 'kcse_2008',
    year: 2008,
    title: 'KCSE 2008 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Enthalpy of Neutralization & Back-Titration, Copper Carbonate',
    topics: ['Thermochemistry', 'Volumetric Back-Titration', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: 'series_2008',
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Measurement of the temperature change ΔT when Solid A reacts with excess 2.0M HCl (Solution B), followed by volumetric back-titration of the unreacted acid against 0.1M NaOH (Solution C) to determine molar enthalpy ΔH. Qualitative analysis of Solid D (CuCO₃) and Solid F (unsaturated carboxylic acid).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Thermochemistry & Back-Titration (20.0 Marks)',
        procedure: 'Procedure A: Place 20.0 cm³ of 2.0M HCl Solution B in 100 ml beaker. Measure temperature every 30 seconds for 2 minutes. At exactly 2.5 minutes, add all of Solid A, stir continuously, and record temperature every 30 seconds up to 5 minutes.\nProcedure B: Transfer all contents of beaker into 250 ml volumetric flask, dilute to mark (Solution C). Titrate 25.0 cm³ portions of Solution C with 0.1M NaOH using phenolphthalein indicator.',
        table1: {
          title: 'Table 1: Temperature vs Time for Reaction of Solid A with HCl',
          headers: ['Time (min)', '0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'],
          sampleValues: ['18.0', '18.0', '18.0', '18.0', '18.0', 'X', '13.0', '13.0', '13.5', '13.5', '14.0']
        },
        table2: {
          title: 'Table 2: Titration of Residual Acid Solution C with 0.1M NaOH',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 16.50', 'Final: 32.20', 'Final: 32.20', 'Initial: 0.00', 'Initial: 16.00', 'Initial: 16.00', 'Titre: 16.50', 'Titre: 16.20', 'Titre: 16.20']
        },
        calculations: [
          '(a) (i) Plot graph of temperature against time and determine ΔT. (4 Mks)',
          '(a) (ii) Calculate heat change: ΔH = 20.0 × 4.2 × ΔT Joules. (2 Mks)',
          '(b) (i) Calculate average volume of NaOH used. (1 Mk)',
          '(b) (ii) Calculate moles of NaOH used and moles of unreacted HCl in 250 cm³. (2 Mks)',
          '(b) (iii) Calculate initial moles of HCl in 20.0 cm³ of Solution B (2.0 × 20 / 1000 = 0.040 mol). (1 Mk)',
          '(b) (iv) Calculate moles of HCl that reacted with Solid A. (1 Mk)',
          '(c) Calculate molar enthalpy of reaction between Solid A and 1 mole of HCl (include sign). (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid D (10.0 Marks)',
        preamble: 'Solid D is a green inorganic solid.',
        tests: [
          { step: '(a)', prompt: 'Heat Solid D strongly in dry test-tube; test gases with moist litmus.', obs: 'Green solid turns black; colourless liquid condenses on cool walls; moist blue litmus turns red', inf: 'Hydrated salt; acidic gas (CO₂) evolved; CuCO₃ decomposed to CuO' },
          { step: '(b)', prompt: 'Add 10 cm³ 2M HCl to black residue, shake for 3 minutes.', obs: 'Black residue dissolves to form a clear green / blue-green solution', inf: 'Basic oxide / CuO dissolved in acid forming Cu²⁺ ions' },
          { step: '(c) (i)', prompt: 'To 1 cm³ portion, add aqueous ammonia dropwise until excess.', obs: 'Pale blue precipitate formed, dissolves in excess NH₃ to form deep blue solution', inf: 'Cu²⁺ confirmed present (tetraamminecopper(II) complex)' },
          { step: '(c) (ii)', prompt: 'To rest of mixture, add Solid E (zinc powder) and shake.', obs: 'Effervescence; green solution turns colourless; reddish-brown solid deposited; test tube becomes warm', inf: 'Metal E (Zn) is higher than Cu in electrochemical series; Cu²⁺ displaced to metallic copper' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Functional Group Analysis of Solid F (10.0 Marks)',
        preamble: 'Solid F is an organic solid.',
        tests: [
          { step: '(a)', prompt: 'Burn one-third of Solid F on spatula.', obs: 'Melts and burns with yellow smoky sooty flame', inf: 'Unsaturated organic compound / high C:H ratio (>C=C<)' },
          { step: '(b)', prompt: 'Dissolve rest of F in water. To 2 cm³, add solid NaHCO₃.', obs: 'Brisk effervescence of colourless gas that turns limewater milky', inf: 'Carboxylic acid (-COOH) confirmed present' },
          { step: '(c) (i)', prompt: 'To 1 cm³ of solution, add acidified K₂Cr₂O₇ and warm.', obs: 'Orange colour of K₂Cr₂O₇ persists (not reduced)', inf: 'Alkanol (-OH) absent' },
          { step: '(c) (ii)', prompt: 'To 2 cm³ of solution, add 2 drops acidified KMnO₄.', obs: 'Purple KMnO₄ solution is rapidly decolorized to colourless', inf: 'Alkene (>C=C<) confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Temperature drop ΔT', marks: '1.0 Mk', rubric: 'ΔT = Initial Temp (18.0) - Minimum extrapolated Temp (12.0) = 6.0 °C. Reaction is endothermic.' },
        { item: 'Heat change ΔH', marks: '2.0 Mks', rubric: 'Heat = 20 × 4.2 × 6.0 = 504 Joules.' },
        { item: 'Moles of unreacted HCl', marks: '2.0 Mks', rubric: 'Moles NaOH = (0.1 × 16.20) / 1000 = 0.00162 mol. Unreacted HCl in 250 cm³ = 0.00162 × 10 = 0.0162 mol.' },
        { item: 'Moles of HCl reacted', marks: '1.0 Mk', rubric: 'Moles reacted = 0.0400 - 0.0162 = 0.0238 mol.' },
        { item: 'Molar enthalpy', marks: '2.0 Mks', rubric: 'ΔH = +(504 / 0.0238) = +21.18 kJ/mol. Sign MUST be positive (+) for endothermic process.' }
      ],
      qualitativeObservations: 'Observe displacement reactions carefully: brown solid deposit indicates Cu metal.',
      confidentialPrep: 'Solid A: 2.1 g potassium hydrogen carbonate KHCO₃. Solution B: 2.0 M HCl (172 cm³ conc. HCl in 1 L). Solution C: 0.1 M NaOH. Solid D: Basic copper(II) carbonate CuCO₃·Cu(OH)₂. Solid E: Zinc dust/powder. Solid F: Maleic acid.'
    }
  },

  // ── KCSE 2007 ──
  {
    id: 'kcse_2007',
    year: 2007,
    title: 'KCSE 2007 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Sulfuric Acid Titration & Thermometric Enthalpy Neutralization',
    topics: ['Thermochemistry', 'Volumetric Analysis', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Standardization of diluted sulfuric acid Solution D against 8.0 g/L sodium carbonate (Solution B), followed by thermometric enthalpy titration of acid A with alkali C. Qualitative analysis of Solid E (Fe³⁺/I⁻) and Liquid F (alkanol).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Volumetric & Thermometric Neutralization (20.0 Marks)',
        procedure: 'Part A: Dilute 25.0 cm³ of H₂SO₄ Solution A to 250 ml (Solution D). Titrate 25.0 cm³ portions of 8.0 g/L Na₂CO₃ Solution B with Solution D using methyl orange indicator.\nPart B: In 6 test tubes, place varying volumes of Solution A (2, 4, 6, 8, 10, 12 cm³). In a boiling tube, measure corresponding volumes of Solution C (14, 12, 10, 8, 6, 4 cm³), record initial temperature, mix, and record highest temperature reached.',
        table1: {
          title: 'Table 1: Titration of Na₂CO₃ with Diluted H₂SO₄ Solution D',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 21.80', 'Final: 21.60', 'Final: 43.60', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 22.00', 'Titre: 21.80', 'Titre: 21.60', 'Titre: 21.60']
        },
        table2: {
          title: 'Table 2: Thermometric Titration Volumes and Temperatures',
          headers: ['Test Tube', '1', '2', '3', '4', '5', '6'],
          sampleValues: ['Vol A (cm³): 2', '4', '6', '8', '10', '12', 'Vol C (cm³): 14', '12', '10', '8', '6', '4', 'Initial Temp: 20.5', '20.5', '20.5', '20.5', '20.5', '20.5', 'Highest Temp: 23.0', '25.5', '28.0', '29.5', '26.5', '24.5', 'ΔT (°C): 2.5', '5.0', '7.5', '9.0', '6.0', '4.0']
        },
        calculations: [
          '(a) Calculate average volume of Solution D and molarity of Na₂CO₃ (RFM = 106.0). (2 Mks)',
          '(b) Calculate concentration of H₂SO₄ in Solution D and original Solution A. (3 Mks)',
          '(c) Plot graph of ΔT against volume of Solution A. (3 Mks)',
          '(d) From graph, determine maximum ΔT and volume of Solution A at neutralization. (2 Mks)',
          '(e) Calculate molar enthalpy of neutralization between H₂SO₄ and Substance C. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid E (10.0 Marks)',
        preamble: 'Solid E contains one cation and one anion.',
        tests: [
          { step: '(a)', prompt: 'Heat half of Solid E strongly in dry test tube; test gases with litmus.', obs: 'Pungent acidic gas evolved turning moist blue litmus red; colourless liquid droplets condense; solid turns reddish-brown', inf: 'Hydrated salt; acidic gas; Fe³⁺ oxide residue' },
          { step: '(b) (i)', prompt: 'Dissolve rest in water. Test pH with universal indicator.', obs: 'Reddish-brown solution; pH = 1 – 3', inf: 'Strongly acidic solution (hydrolysis of Fe³⁺)' },
          { step: '(b) (ii)', prompt: 'To 1 cm³ portion, add aqueous ammonia dropwise to excess.', obs: 'Reddish-brown precipitate insoluble in excess aqueous ammonia', inf: 'Fe³⁺ confirmed present' },
          { step: '(b) (iii)', prompt: 'To 2 cm³ portion, add aqueous potassium iodide (KI).', obs: 'Colour changes from yellow to dark brown; black iodine precipitate settles', inf: 'Fe³⁺ acts as oxidizing agent reducing I⁻ to I₂' },
          { step: '(b) (iv)', prompt: 'To 1 cm³ portion, add barium nitrate followed by dilute HNO₃.', obs: 'White precipitate formed, insoluble in dilute nitric acid', inf: 'SO₄²⁻ confirmed present' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Functional Group Analysis of Liquid F (10.0 Marks)',
        preamble: 'Liquid F is an organic liquid.',
        tests: [
          { step: '(a)', prompt: 'Ignite 3–4 drops of Liquid F on watch glass.', obs: 'Burns with a clean, non-sooty pale blue flame', inf: 'Saturated low carbon organic compound' },
          { step: '(b)', prompt: 'Add 1 cm³ distilled water to 1 cm³ Liquid F and shake.', obs: 'Miscible; forms a single clear homogeneous layer', inf: 'Polar organic compound / low molecular mass alkanol' },
          { step: '(c)', prompt: 'Add solid sodium carbonate to 1 cm³ Liquid F.', obs: 'No effervescence / no bubbles formed', inf: 'Carboxylic acid (-COOH) absent; H⁺ absent' },
          { step: '(d)', prompt: 'To 2 cm³ Liquid F, add acidified K₂Cr₂O₇ and warm.', obs: 'Orange solution turns green; pungent fruity aroma', inf: 'Primary or secondary alkanol (-OH) confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Molarity of Na₂CO₃', marks: '1.0 Mk', rubric: 'M = 8.0 / 106 = 0.0755 M.' },
        { item: 'Molarity of Solution A', marks: '3.0 Mks', rubric: 'Moles Na₂CO₃ = (0.0755 × 25) / 1000 = 0.00189 mol. Conc D = 0.00189 × 1000 / 21.60 = 0.0874 M. Conc A = 0.0874 × 10 = 0.874 M.' },
        { item: 'Thermometric graph', marks: '3.0 Mks', rubric: 'Two straight lines intersecting at maximum ΔT (~9.5 °C, Volume A ~ 7.6 cm³).' },
        { item: 'Molar enthalpy', marks: '2.0 Mks', rubric: 'Heat = 16 × 4.2 × 9.5 = 638.4 J. Moles acid = (7.6 × 0.874) / 1000 = 0.00664 mol. ΔH = -(638.4 / 0.00664) = -96.1 kJ/mol.' }
      ],
      qualitativeObservations: 'Fe³⁺ reduction by KI must mention brown iodine colour.',
      confidentialPrep: 'Solution A: 50.0 cm³ conc. H₂SO₄ in 1 L (0.90 M). Solution B: 8.0 g Na₂CO₃ in 1 L. Solution C: 60.0 g NaOH in 1 L (1.50 M). Solid E: Iron(III) sulfate Fe₂(SO₄)₃. Liquid F: Ethanol.'
    }
  },

  // ── KCSE 2006 ──
  {
    id: 'kcse_2006',
    year: 2006,
    title: 'KCSE 2006 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Solubility Curve & Water of Crystallization by KMnO₄ Titration',
    topics: ['Solubility Curves', 'Redox Volumetric Analysis', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Determination of the solubility curve of Solid A at different temperatures, followed by hot redox titration with 0.06M acidified KMnO₄ (Solution B) to deduce the water of crystallization x in D·xH₂O. Qualitative analysis of Solid E and Solid F.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Solubility Curve & Water of Crystallization (20.0 Marks)',
        procedure: 'Procedure (a)-(d): Add 4 cm³ water to 4.5 g Solid A in boiling tube, heat to ~70 °C until dissolved, allow to cool while stirring with thermometer, note temperature at which first crystals appear. Add 2 cm³ portions of water repeatedly (total 6, 8, 10 cm³), heating and cooling each time to record crystallization temperatures.\nProcedure (e): Transfer contents of boiling tube into 250 ml volumetric flask, dilute to mark (Solution A). Pipette 25.0 cm³ of Solution A, warm to ~60 °C, and titrate hot with 0.06M acidified KMnO₄ Solution B until permanent pink.',
        table1: {
          title: 'Table 1: Crystallization Temperature vs Volume of Water',
          headers: ['Volume of Water (cm³)', '4', '6', '8', '10'],
          sampleValues: ['Cryst Temp (°C): 66.5', '56.5', '49.5', '44.5', 'Solubility (g/100g): 112.5', '75.0', '56.2', '45.0']
        },
        table2: {
          title: 'Table 2: Hot Redox Titration with KMnO₄ Solution B',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 24.40', 'Final: 48.60', 'Final: 26.20', 'Initial: 0.00', 'Initial: 24.40', 'Initial: 2.00', 'Titre: 24.40', 'Titre: 24.20', 'Titre: 24.20']
        },
        calculations: [
          '(i) Complete Table 1 calculating solubility in g/100g water. (2 Mks)',
          '(ii) Plot graph of solubility against temperature. (3 Mks)',
          '(iii) Determine temperature at which 100 g of Solid A dissolves in 100 g water. (1 Mk)',
          '(iv) Calculate average volume of Solution B used. (1 Mk)',
          '(v) Calculate moles of KMnO₄ used and moles of A in 25.0 cm³ (Mole ratio A:KMnO₄ = 5:2). (2 Mks)',
          '(vi) Calculate relative formula mass of A (from 4.5 g in 250 ml). (1 Mk)',
          '(vii) Formula of A is D·xH₂O (RFM of D = 90.0). Determine x. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid E (10.0 Marks)',
        preamble: 'Solid E is a white inorganic powder.',
        tests: [
          { step: '(a)', prompt: 'Heat one-third of Solid E in dry test tube.', obs: 'Colourless liquid condenses on cooler walls; white solid residue remains', inf: 'Hydrated salt / contains water of crystallization' },
          { step: '(b) (i)', prompt: 'Dissolve rest in water, filter. To filtrate, add 2 drops phenolphthalein.', obs: 'Solution turns intense pink', inf: 'Basic solution / OH⁻ present' },
          { step: '(b) (ii)', prompt: 'To portion 2, add 2 cm³ dilute HCl.', obs: 'No effervescence / no bubbles formed', inf: 'CO₃²⁻, HCO₃⁻, SO₃²⁻ absent' },
          { step: '(b) (iii)', prompt: 'To portion 3, add 5 cm³ aqueous sodium sulphate (Na₂SO₄).', obs: 'White precipitate formed', inf: 'Ba²⁺, Pb²⁺, or Ca²⁺ present' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Functional Group Analysis of Solid F (10.0 Marks)',
        preamble: 'Solid F is an organic solid.',
        tests: [
          { step: '(a)', prompt: 'Ignite one-third of Solid F on metallic spatula.', obs: 'Burns with a luminous, yellow smoky/sooty flame', inf: 'Unsaturated organic compound / high C:H ratio (>C=C<)' },
          { step: '(b) (i)', prompt: 'Dissolve in water. To portion 1, add 2–3 drops acidified KMnO₄ Solution B.', obs: 'Purple KMnO₄ solution is rapidly decolorized to colourless', inf: 'Alkene (>C=C<) or reducing group present' },
          { step: '(b) (ii)', prompt: 'To portion 2, add 2–3 drops bromine water and warm.', obs: 'Reddish-brown bromine water is decolorized', inf: 'Alkene (>C=C<) confirmed present by addition reaction' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Solubility values', marks: '2.0 Mks', rubric: 'Solubility = (4.5 / Vol) × 100. At 4 cm³ = 112.5; 6 cm³ = 75.0; 8 cm³ = 56.2; 10 cm³ = 45.0.' },
        { item: 'Solubility curve', marks: '3.0 Mks', rubric: 'Smooth upward curve. Reading at 100 g/100g water = 63 ± 0.5 °C.' },
        { item: 'Moles of A', marks: '2.0 Mks', rubric: 'Moles KMnO₄ = (0.06 × 24.20) / 1000 = 0.00145 mol. Moles A in 25 cm³ = 0.00145 × (5/2) = 0.00363 mol.' },
        { item: 'Value of x in D·xH₂O', marks: '2.0 Mks', rubric: 'Total moles in 250 cm³ = 0.0363 mol. RFM = 4.5 / 0.0363 = 124.0. 90 + 18x = 124 => 18x = 34 => x = 1.9 ≈ 2 (H₂C₂O₄·2H₂O).' }
      ],
      qualitativeObservations: 'Full credit for tied observations and inferences.',
      confidentialPrep: 'Solid A: 4.5 g pure hydrated oxalic acid H₂C₂O₄·2H₂O. Solution B: 9.48 g KMnO₄ in 1 L 1.0 M H₂SO₄ (0.06 M). Solid E: Calcium hydroxide Ca(OH)₂ / Barium hydroxide. Solid F: Cinnamic acid or fumaric acid.'
    }
  },

  // ── KCSE 2005 ──
  {
    id: 'kcse_2005',
    year: 2005,
    title: 'KCSE 2005 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Cooling Curve / Freezing Point & Thermometric Enthalpy Neutralization',
    topics: ['Freezing Point / Cooling Curves', 'Thermochemistry', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Cooling curve of Solid M in water bath to determine freezing point, followed by thermometric enthalpy of neutralization of Acid L with NaOH Solution K to find relative formula mass. Qualitative tests on Solid N and Solid Q.',
    questions: [
      {
        num: 1,
        title: 'Question 1 & 2: Cooling Curve & Enthalpy of Neutralization (20.0 Marks)',
        procedure: 'Question 1: Melt Solid M in test tube immersed in hot water bath until completely liquefied (~85 °C). Remove test tube, insert thermometer, start stopwatch, and record temperature every 30 seconds for 3.5 minutes as it solidifies.\nQuestion 2: Measure 25.0 cm³ Solution K (NaOH) into beaker, record temp T₁. Measure 25.0 cm³ Solution L (60.0 g/L Acid L) into another beaker, record temp T₂. Mix, stir, and record maximum temperature T₃.',
        table1: {
          title: 'Table 1: Cooling Curve Data for Solid M',
          headers: ['Time (min)', '0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5'],
          sampleValues: ['82.0', '73.0', '69.0', '68.0', '68.0', '68.0', '66.0', '65.0']
        },
        table2: {
          title: 'Table 2: Thermometric Neutralization Data',
          headers: ['Trial', 'I', 'II'],
          sampleValues: ['Initial Temp K (T₁): 26.0', '26.0', 'Initial Temp L (T₂): 25.0', '26.0', 'Highest Temp (T₃): 30.5', '31.0', 'Average Initial: 25.5', '26.0', 'ΔT (°C): 5.0', '5.0']
        },
        calculations: [
          '(a) Plot cooling curve (time on x-axis, temperature on y-axis) and state freezing point of Solid M. (4 Mks)',
          '(b) Calculate heat change for reaction: Heat = 50.0 × 4.2 × ΔT Joules. (2 Mks)',
          '(c) Given molar heat of neutralization is 134.4 kJ/mol, calculate moles of Acid L used. (2 Mks)',
          '(d) Calculate concentration of Acid L in mol/dm³. (2 Mks)',
          '(e) Calculate relative formula mass of Acid L (contains 60.0 g/L). (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 3: Qualitative Analysis of Solid N and Solid Q (10.0 Marks)',
        preamble: 'Solid N and Solid Q are unknown compounds.',
        tests: [
          { step: '(a) (i)', prompt: 'Heat one-third of Solid N in dry test tube; test gases with litmus.', obs: 'Cracking sound; colourless liquid droplets condense; pungent gas evolves turning moist red litmus blue', inf: 'Hydrated salt; basic gas (NH₃); NH₄⁺ present' },
          { step: '(a) (ii)', prompt: 'Dissolve Solid N in water. To portion I, add aqueous ammonia dropwise to excess.', obs: 'White precipitate formed, insoluble in excess aqueous ammonia', inf: 'Al³⁺, Pb²⁺, or Mg²⁺ present' },
          { step: '(a) (iii)', prompt: 'To portion III, add barium nitrate followed by dilute HCl.', obs: 'Dense white precipitate insoluble in dilute HCl', inf: 'SO₄²⁻ confirmed present' },
          { step: '(b) (ii)', prompt: 'Dissolve Solid Q in water. To 2 cm³, add solid NaHCO₃.', obs: 'Brisk effervescence of colourless gas turning limewater milky', inf: 'Carboxylic acid (-COOH) confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Freezing Point of M', marks: '1.0 Mk', rubric: 'Horizontal plateau temperature = 68.0 °C (accept 67.5 – 68.5 °C).' },
        { item: 'Heat change', marks: '2.0 Mks', rubric: 'Heat = 50 × 4.2 × 5.0 = 1050 Joules (1.05 kJ).' },
        { item: 'Moles of Acid L', marks: '2.0 Mks', rubric: 'Moles = 1.05 / 134.4 = 0.00781 mol.' },
        { item: 'Molarity & RFM', marks: '4.0 Mks', rubric: 'Molarity = (0.00781 × 1000) / 25.0 = 0.3125 M. RFM = 60.0 / 0.3125 = 192.0 (Citric acid monohydrate).' }
      ],
      qualitativeObservations: 'Freezing plateau must show at least 3 constant temperature readings.',
      confidentialPrep: 'Solid M: Stearic acid or naphthalene (melting point ~68 °C). Solution K: 37.32 g NaOH in 1 L (0.93 M). Solution L: 60.0 g citric acid monohydrate in 1 L. Solid N: Ammonium aluminium sulphate (Ammonium alum). Solid Q: Benzoic acid.'
    }
  },

  // ── KCSE 2003 ──
  {
    id: 'kcse_2003',
    year: 2003,
    title: 'KCSE 2003 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · KMnO₄ Redox Stoichiometry & Enthalpy of Solution/Neutralization',
    topics: ['Redox Volumetric Analysis', 'Thermochemistry & Hess Law', 'Qualitative Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Titration of 0.02M KMnO₄ (Solution P) against Solid Q solution to deduce redox mole ratio. Procedure 2 investigates enthalpy of solution of dibasic acid Solid S and its enthalpy of neutralization with NaOH. Qualitative analysis of Solid V (sulfite).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Redox Titration Stoichiometry (15.0 Marks)',
        procedure: 'Solution Q was prepared by dissolving 4.18 g of Solid Q in 250 cm³ water. Titrate 25.0 cm³ portions of Solution Q with 0.02M acidified KMnO₄ Solution P until the first permanent pink colour.',
        table1: {
          title: 'Table 1: Titration of Solution Q against 0.02M KMnO₄',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 15.00', 'Final: 30.00', 'Final: 15.00', 'Initial: 0.00', 'Initial: 15.00', 'Initial: 0.00', 'Titre: 15.00', 'Titre: 15.00', 'Titre: 15.00']
        },
        calculations: [
          '(a) Calculate average volume of Solution P used. (1 Mk)',
          '(b) Calculate moles of KMnO₄ used: (0.02 × 15.0) / 1000 = 0.00030 mol. (2 Mks)',
          '(c) Calculate concentration of Solution Q in g/dm³ and mol/dm³ (RFM = 278.0). (2 Mks)',
          '(d) Calculate moles of Q in 25.0 cm³ and mole ratio of Q reacting with 1 mole of KMnO₄. (3 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Thermochemistry Enthalpy Cycles (15.0 Marks)',
        procedure: 'Procedure I: Add 1.9 g Solid S (dibasic acid H₂A) to 30 cm³ water, measure initial and final temperature (ΔT₁).\nProcedure II: Mix 30 cm³ of 0.5M H₂A Solution T with 30 cm³ NaOH Solution R, measure temperature change (ΔT₂).',
        table1: {
          title: 'Table 2: Temperature Changes for Enthalpy Steps',
          headers: ['Parameter', 'Procedure I (Solution)', 'Procedure II (Neutralization)'],
          sampleValues: ['Initial Temp (°C): 20.0', '21.0', 'Final Temp (°C): 17.5', '27.5', 'ΔT (°C): -2.5', '+6.5']
        },
        calculations: [
          '(a) Calculate molar heat of solution ΔH₁ of Solid H₂A (RFM = 126.0). (4 Mks)',
          '(b) Calculate molar heat of neutralization ΔH₂ of H₂A with NaOH. (4 Mks)',
          '(c) Using Hess\'s Law, calculate ΔH₃ for H₂A(s) + 2OH⁻(aq) → 2H₂O(l) + A²⁻(aq). (2 Mks)'
        ]
      },
      {
        num: 3,
        title: 'Question 3: Qualitative Analysis of Solid V (10.0 Marks)',
        preamble: 'Solid V is a soluble white salt.',
        tests: [
          { step: '(a)', prompt: 'Dissolve Solid V in 20 cm³ water. To portion 1, add 5 drops 2M NaOH.', obs: 'No precipitate formed', inf: 'Transition metal ions and Mg²⁺, Ca²⁺ absent' },
          { step: '(b)', prompt: 'To portion 3, add BaCl₂ solution followed by 2M HCl.', obs: 'White precipitate dissolves with effervescence of choking gas', inf: 'SO₃²⁻ or CO₃²⁻ present' },
          { step: '(c)', prompt: 'To portion 4, add 3 drops acidified KMnO₄ Solution P.', obs: 'Purple KMnO₄ solution is decolorized to colourless', inf: 'SO₃²⁻ confirmed reducing agent' },
          { step: '(d)', prompt: 'To portion 5, add 5 drops acidified K₂Cr₂O₇.', obs: 'Orange solution turns green', inf: 'SO₃²⁻ confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Moles of Q in 25 cm³', marks: '2.0 Mks', rubric: 'Mass conc = (4.18 × 1000) / 250 = 16.72 g/L. Molarity Q = 16.72 / 278 = 0.0601 M. Moles in 25 cm³ = 0.00150 mol.' },
        { item: 'Mole ratio Q:KMnO₄', marks: '1.0 Mk', rubric: 'Ratio = 0.00150 / 0.00030 = 5:1 (5 moles Fe²⁺ react with 1 mole MnO₄⁻).' },
        { item: 'Hess Law cycle', marks: '2.0 Mks', rubric: 'ΔH₃ = ΔH_solution + ΔH_neutralization. Ensure correct signs (+ for solution, - for neutralization).' }
      ],
      qualitativeObservations: 'SO₃²⁻ reduction of both KMnO₄ and K₂Cr₂O₇ confirms reducing anion.',
      confidentialPrep: 'Solution P: 3.2 g KMnO₄ in 1 L 1.0 M H₂SO₄ (0.02 M). Solid Q: 16.7 g hydrated iron(II) ammonium sulfate in 1 L 1.0 M H₂SO₄. Solid S: Hydrated oxalic acid. Solution T: 63 g oxalic acid in 1 L. Solution R: 40 g NaOH in 1 L. Solid V: Sodium sulphite Na₂SO₃.'
    }
  },

  // ── KCSE 2002 ──
  {
    id: 'kcse_2002',
    year: 2002,
    title: 'KCSE 2002 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Hydrogen Peroxide / Iodide Clock Kinetics & Displacement Bench',
    topics: ['Chemical Kinetics / Clock Reaction', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Kinetics of the reaction between hydrogen peroxide (Solution A) and potassium iodide (Solution D) in the presence of sodium thiosulphate and starch indicator. Qualitative displacement testing of Solution F with Solid G, and organic testing of Solid H.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Iodine Clock Kinetics (20.0 Marks)',
        procedure: 'In Beaker 1: Measure varying volumes of Solution A (H₂O₂: 25, 20, 15, 10, 5 cm³), 20 cm³ 2M H₂SO₄, and water (0, 5, 10, 15, 20 cm³).\nIn Beaker 2: Measure 5 cm³ 0.05M sodium thiosulphate Solution C, 5 cm³ potassium iodide Solution D, and 2 cm³ starch Solution E.\nPour contents of Beaker 2 into Beaker 1, start stopwatch immediately, swirl, and record time taken for sharp blue colour to appear.',
        table1: {
          title: 'Table 1: Clock Reaction Volumes and Times',
          headers: ['Exp', '1', '2', '3', '4', '5'],
          sampleValues: ['Vol H₂O₂ (cm³): 25', '20', '15', '10', '5', 'Vol Water (cm³): 0', '5', '10', '15', '20', 'Time (s): 18.0', '22.5', '29.0', '43.5', '90.5', '1/t (s⁻¹): 0.056', '0.044', '0.034', '0.023', '0.011']
        },
        calculations: [
          '(a) Complete Table 1 by computing 1/time (s⁻¹). (7.5 Mks)',
          '(b) Plot graph of (1/time) against volume of hydrogen peroxide used. (4 Mks)',
          '(c) From graph, determine time taken if 7.5 cm³ of Solution A and 17.5 cm³ water were used. (2 Mks)',
          '(d) Explain how the rate of reaction varies with concentration of hydrogen peroxide. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis & Displacement (10.0 Marks)',
        preamble: 'Solution F, Solid G, and sodium sulphate solution.',
        tests: [
          { step: '(a)', prompt: 'Add Solid G to Solution F, warm for 1 min, shake for 5 min, and filter.', obs: 'Shiny grey metal is coated with black/grey deposit; colourless filtrate obtained', inf: 'Metal G is more reactive than metal in F; redox displacement occurred' },
          { step: '(b)', prompt: 'To 2 cm³ filtrate, add 5 drops barium nitrate.', obs: 'No white precipitate formed', inf: 'SO₄²⁻ absent' },
          { step: '(c)', prompt: 'To 2 cm³ filtrate, add aqueous NaOH dropwise to excess.', obs: 'White precipitate formed, soluble in excess NaOH to form colourless solution', inf: 'Pb²⁺, Al³⁺, or Zn²⁺ present' },
          { step: '(d)', prompt: 'To 2 cm³ filtrate, add 2M HCl and warm to boil.', obs: 'White precipitate formed, dissolves on boiling and reappears on cooling', inf: 'Pb²⁺ confirmed present (PbCl₂)' },
          { step: '(f)', prompt: 'To remaining filtrate, add aqueous ammonia dropwise to excess.', obs: 'White precipitate soluble in excess aqueous ammonia', inf: 'Zn²⁺ confirmed present' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Functional Group Analysis of Solid H (10.0 Marks)',
        preamble: 'Solid H is an organic compound.',
        tests: [
          { step: '(a)', prompt: 'Burn one-third of Solid H in Bunsen flame.', obs: 'Melts and burns with yellow sooty flame', inf: 'Unsaturated organic compound / long chain hydrocarbon' },
          { step: '(b) (i)', prompt: 'Dissolve in water. To portion 1, add acidified KMnO₄.', obs: 'Purple KMnO₄ solution is decolorized to colourless', inf: 'Alkene (>C=C<) or primary/secondary alkanol present' },
          { step: '(b) (ii)', prompt: 'To portion 2, add 2 drops bromine water.', obs: 'Brown bromine water is decolorized to colourless', inf: 'Alkene (>C=C<) confirmed present' },
          { step: '(b) (iii)', prompt: 'Determine pH of portion 3 with universal indicator.', obs: 'Turns orange; pH = 5', inf: 'Weakly acidic organic compound' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: '1/time computation', marks: '7.5 Mks', rubric: 'All 5 reciprocal values calculated correctly to 2 significant figures.' },
        { item: 'Kinetics graph', marks: '4.0 Mks', rubric: 'Straight line passing through the origin. Scale covers >= half grid.' },
        { item: 'Interpolation', marks: '2.0 Mks', rubric: 'Reading 1/t at 7.5 cm³ ≈ 0.017 s⁻¹. Time = 1 / 0.017 ≈ 58.8 seconds.' },
        { item: 'Deduction', marks: '2.0 Mks', rubric: 'Rate of reaction is directly proportional to concentration of hydrogen peroxide (first-order kinetics).' }
      ],
      qualitativeObservations: 'Displacement requires explicit observation of colourless filtrate and dark metallic deposit.',
      confidentialPrep: 'Solution A: 200 cm³ fresh 20-volume H₂O₂ diluted to 1 L. Solution B: 2.0 M H₂SO₄. Solution C: 12 g Na₂S₂O₃·5H₂O in 1 L. Solution D: 10 g KI in 1 L. Solution E: 10 g soluble starch paste in 1 L. Solution F: Lead(II) nitrate. Solid G: Zinc granules. Solid H: Crotonic or maleic acid.'
    }
  },

  // ── KCSE 2000 ──
  {
    id: 'kcse_2000',
    year: 2000,
    title: 'KCSE 2000 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Double Indicator Volumetric Titration & Enthalpy of Solution',
    topics: ['Double Indicator Titration', 'Thermochemistry', 'Qualitative Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Two-stage double indicator titration of 5.6 g/L sodium carbonate (Solution L) with hydrochloric acid (Solution M) using phenolphthalein then methyl orange to determine molar concentration. Determination of enthalpy of solution of Solid G (KNO₃). Qualitative analysis of two-cation mixture Solution P.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Double Indicator Titration (15.0 Marks)',
        procedure: 'Pipette 25.0 cm³ of Solution L (5.6 g/L Na₂CO₃) into conical flask. Add 3 drops phenolphthalein indicator, titrate with Solution M (HCl) until pink color turns colourless (Titre t₁). Without emptying, add 3 drops methyl orange indicator and continue titrating until yellow colour turns permanent orange-red (Titre t₂). Total volume used = t₁ + t₂.',
        table1: {
          title: 'Table 1: Phenolphthalein Stage (Na₂CO₃ to NaHCO₃)',
          headers: ['Titration', '1st', '2nd'],
          sampleValues: ['Final: 12.50', 'Final: 12.50', 'Initial: 0.00', 'Initial: 0.00', 'Titre t₁: 12.50', 'Titre t₁: 12.50']
        },
        table2: {
          title: 'Table 2: Methyl Orange Stage (NaHCO₃ to NaCl + CO₂)',
          headers: ['Titration', '1st', '2nd'],
          sampleValues: ['Final: 25.00', 'Final: 25.00', 'Initial: 12.50', 'Initial: 12.50', 'Titre t₂: 12.50', 'Titre t₂: 12.50']
        },
        calculations: [
          '(i) Calculate concentration of Na₂CO₃ Solution L in mol/dm³ (RFM = 106.0). (2 Mks)',
          '(ii) Calculate moles of Na₂CO₃ in 25.0 cm³ of solution. (1 Mk)',
          '(iii) Total volume of HCl used = t₁ + t₂. Write equation for complete neutralization. (1 Mk)',
          '(iv) Calculate moles of HCl in total volume and molarity of HCl Solution M. (3 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Enthalpy of Solution of KNO₃ (15.0 Marks)',
        procedure: 'Measure 30 cm³ distilled water into 100 ml beaker, record temperature every 30 seconds for 2 minutes. At exactly 2 minutes, add all 3.0 g Solid G (KNO₃), stir continuously, and record temperature every 30 seconds up to 4 minutes.',
        table1: {
          title: 'Table 3: Temperature vs Time for Dissolution of Solid G',
          headers: ['Time (min)', '0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0'],
          sampleValues: ['22.0', '22.0', '22.0', '22.0', 'X', '16.0', '16.5', '17.0', '17.5']
        },
        calculations: [
          '(a) Plot graph of temperature against time and determine fall in temperature ΔT. (4 Mks)',
          '(b) Calculate moles of Solid G used (K=39, N=14, O=16, RFM = 101.0). (1 Mk)',
          '(c) Calculate enthalpy of solution ΔH_soln in kJ/mol (show sign). (3 Mks)'
        ]
      },
      {
        num: 3,
        title: 'Question 3: Qualitative Analysis of Solution P (10.0 Marks)',
        preamble: 'Solution P contains two cations and one anion.',
        tests: [
          { step: '(a)', prompt: 'Add 20 cm³ 2M NaOH to Solution P, shake, and filter. Retain filtrate and residue.', obs: 'Blue residue / solid precipitate; colourless filtrate obtained', inf: 'Cu²⁺ confirmed present in residue; amphoteric cation in filtrate' },
          { step: '(b) (i)', prompt: 'To 2 cm³ filtrate, add 2M HNO₃ until excess.', obs: 'White precipitate forms which dissolves in excess acid to colourless solution', inf: 'Al³⁺ or Pb²⁺ present' },
          { step: '(b) (ii)', prompt: 'To portion 1, add 2M NaOH dropwise to excess.', obs: 'White precipitate formed, soluble in excess NaOH', inf: 'Al³⁺ or Pb²⁺ present' },
          { step: '(b) (iii)', prompt: 'To portion 2, add aqueous ammonia dropwise to excess.', obs: 'White precipitate formed, insoluble in excess aqueous ammonia', inf: 'Al³⁺ or Pb²⁺ confirmed present (Zn²⁺ absent)' },
          { step: '(c)', prompt: 'To 2 cm³ filtrate, add 2M HCl.', obs: 'No white precipitate formed', inf: 'Pb²⁺ absent; Al³⁺ confirmed present' },
          { step: '(d)', prompt: 'To residue from (a), add dilute HNO₃, then barium nitrate.', obs: 'Dense white precipitate formed', inf: 'SO₄²⁻ confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Molarity of Na₂CO₃', marks: '2.0 Mks', rubric: '5.6 / 106 = 0.0528 M.' },
        { item: 'Moles in 25 cm³', marks: '1.0 Mk', rubric: '0.0528 × 25 / 1000 = 0.00132 mol.' },
        { item: 'Molarity of HCl', marks: '3.0 Mks', rubric: 'Moles HCl = 0.00132 × 2 = 0.00264 mol. Total titre = 12.5 + 12.5 = 25.0 cm³. Molarity = (0.00264 × 1000) / 25.0 = 0.106 M.' },
        { item: 'Enthalpy of solution', marks: '4.0 Mks', rubric: 'ΔT = 22.0 - 15.0 = 7.0 °C. Heat = 30 × 4.2 × 7.0 = 882 J. Moles KNO₃ = 3.0 / 101 = 0.0297 mol. ΔH = +(882 / 0.0297) = +29.7 kJ/mol (endothermic).' }
      ],
      qualitativeObservations: 'Filtrate contains Al³⁺; residue contains Cu²⁺.',
      confidentialPrep: 'Solution L: 5.6 g anhydrous Na₂CO₃ in 1 L. Solution M: 9.0 cm³ conc. HCl in 1 L (0.10 M). Solid G: 3.0 g potassium nitrate KNO₃. Solution P: Mixture of 80 g Al₂(SO₄)₃ and 20 g CuSO₄ in 1 L.'
    }
  },

  // ── KCSE 1998 ──
  {
    id: 'kcse_1998',
    year: 1998,
    title: 'KCSE 1998 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Industrial Carbonate Percentage Purity Back-Titration',
    topics: ['Volumetric Back-Titration', 'Percentage Purity', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: 'series_1998',
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Standardization of 8.8 g/L NaOH (Solution N) with HCl (Solution M), followed by reacting 0.50 g of an impure carbonate Solid P with excess HCl and back-titrating residual acid to calculate percentage purity. Qualitative analysis of Solid S (Pb(NO₃)₂) and Solid L (ammonium salt & carboxylic acid).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Industrial Carbonate Percentage Purity (20.0 Marks)',
        procedure: 'Procedure I: Pipette 25.0 cm³ HCl Solution M into conical flask, add 2–3 drops screened methyl orange, titrate with NaOH Solution N (8.8 g/L) from pink to green.\nProcedure II: Place 100 cm³ HCl Solution M in beaker, add all 0.50 g impure carbonate Solid P, swirl for 4 minutes until reaction ceases. Pipette 25.0 cm³ of reaction mixture (Solution Q), titrate with Solution N using screened methyl orange.',
        table1: {
          title: 'Table 1: Standardization of HCl Solution M with NaOH Solution N',
          headers: ['Titration', '1', '2', '3'],
          sampleValues: ['Final: 25.40', 'Final: 48.00', 'Final: 24.40', 'Initial: 1.30', 'Initial: 24.10', 'Initial: 0.40', 'Titre: 24.10', 'Titre: 23.90', 'Titre: 24.00']
        },
        table2: {
          title: 'Table 2: Back-Titration of Residual Acid Solution Q',
          headers: ['Titration', '1', '2', '3'],
          sampleValues: ['Final: 12.50', 'Final: 12.50', 'Final: 29.40', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 17.00', 'Titre: 12.50', 'Titre: 12.50', 'Titre: 12.40']
        },
        calculations: [
          '(a) Calculate concentration of NaOH Solution N in mol/dm³ (RFM = 40.0). (1 Mk)',
          '(b) Calculate concentration of HCl Solution M in mol/dm³. (1 Mk)',
          '(c) Calculate moles of HCl in 25.0 cm³ and in 100 cm³ of Solution Q. (3 Mks)',
          '(d) Calculate initial moles of HCl in 100 cm³ of Solution M and moles of HCl reacted with Solid P. (2 Mks)',
          '(e) Given RFM of carbonate is 72.0, calculate mass of pure carbonate reacted and percentage purity of Solid P. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid S (10.0 Marks)',
        preamble: 'Solid S is an inorganic crystalline salt.',
        tests: [
          { step: '(a)', prompt: 'Heat one-third of Solid S strongly in dry test tube; test gases with litmus.', obs: 'Decrepitation (cracking sound); brown fumes evolved that turn moist blue litmus red; relights glowing splint; residue yellow cold, brown hot', inf: 'NO₃⁻ confirmed present (NO₂ and O₂ evolved); Pb²⁺ likely present (PbO formed)' },
          { step: '(b) (i)', prompt: 'Dissolve rest in water. To portion 1, add aqueous NaOH dropwise to excess.', obs: 'White precipitate formed, soluble in excess NaOH to form colourless solution', inf: 'Pb²⁺, Al³⁺, or Zn²⁺ present' },
          { step: '(b) (ii)', prompt: 'To portion 2, add aqueous ammonia dropwise to excess.', obs: 'White precipitate formed, insoluble in excess aqueous ammonia', inf: 'Pb²⁺ or Al³⁺ present (Zn²⁺ absent)' },
          { step: '(b) (iv)', prompt: 'To portion 4, add 1 cm³ aqueous lead(II) nitrate.', obs: 'No precipitate / no reaction', inf: 'SO₄²⁻, Cl⁻ absent' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Qualitative Analysis of Solid L (10.0 Marks)',
        preamble: 'Solid L is an unknown compound.',
        tests: [
          { step: '(a)', prompt: 'Heat half of Solid L strongly in dry test tube; test gases with litmus.', obs: 'White fumes with choking smell; turns moist red litmus blue; white sublimes', inf: 'NH₄⁺ confirmed present' },
          { step: '(b) (i)', prompt: 'Dissolve rest in water. Find pH with universal indicator.', obs: 'Turns green-yellow / orange; pH = 5 – 6', inf: 'Weakly acidic substance' },
          { step: '(b) (ii)', prompt: 'Add 2M HCl dropwise to solution, filter, retain residue.', obs: 'White precipitate formed', inf: 'Insoluble organic acid precipitated' },
          { step: '(c)', prompt: 'Transfer residue to boiling tube, warm with water, add solid Na₂CO₃.', obs: 'Brisk effervescence of colourless gas that turns limewater milky', inf: 'Carboxylic acid (-COOH) confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Molarity of Solution N (NaOH)', marks: '1.0 Mk', rubric: '8.8 / 40.0 = 0.22 M.' },
        { item: 'Molarity of Solution M (HCl)', marks: '1.0 Mk', rubric: '(24.00 × 0.22) / 25.0 = 0.211 M (accept 0.21 M).' },
        { item: 'Moles unreacted HCl', marks: '3.0 Mks', rubric: 'Moles in 25 cm³ Q = (12.47 × 0.22) / 1000 = 0.00274 mol. Moles in 100 cm³ = 0.00274 × 4 = 0.01096 mol.' },
        { item: 'Moles HCl reacted', marks: '2.0 Mks', rubric: 'Initial moles in 100 cm³ = (0.211 × 100) / 1000 = 0.0211 mol. Moles reacted = 0.0211 - 0.01096 = 0.0101 mol.' },
        { item: 'Percentage purity of P', marks: '2.0 Mks', rubric: 'Moles carbonate = 0.0101 / 2 = 0.00505 mol. Mass reacted = 0.00505 × 72.0 = 0.364 g. % Purity = (0.364 / 0.50) × 100 = 72.8% (accept 72 - 74%).' }
      ],
      qualitativeObservations: 'Decrepitation and brown fumes are definitive for Pb(NO₃)₂.',
      confidentialPrep: 'Solution M: 18.0 cm³ conc. HCl in 1 L (0.21 M). Solution N: 8.80 g NaOH in 1 L (0.22 M). Solid P: 0.50 g mixture of 72% MgCO₃ and 28% NaCl. Solid S: Lead(II) nitrate Pb(NO₃)₂. Solid L: Mixture of ammonium chloride and benzoic acid.'
    }
  },

  // ── KCSE 1996 ──
  {
    id: 'kcse_1996',
    year: 1996,
    title: 'KCSE 1996 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Two-Stage KMnO₄ Redox Titration & Transition Catalyst',
    topics: ['Redox Volumetric Analysis', 'Qualitative Analysis', 'Organic Analysis'],
    playablePresetKey: 'series_1996',
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Two-stage redox titration of acidified KMnO₄ (Solution A): first standardized against ammonium iron(II) sulfate (Solution B), then titrated against hot dibasic acid H₂X·2H₂O (Solution C) to determine the relative formula mass of X. Qualitative analysis of Solid D (MnO₂) and Solid E (unsaturated carboxylic acid).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Two-Stage KMnO₄ Redox Titration (20.0 Marks)',
        procedure: 'Procedure I: Fill burette with Solution A (acidified KMnO₄). Pipette 25.0 cm³ of Solution B (23.5 g/L (NH₄)₂Fe(SO₄)₂·6H₂O) into conical flask. Titrate with Solution A until first permanent pink colour.\nProcedure II: Pipette 25.0 cm³ of Solution C (5.0 g/L dibasic acid H₂X·2H₂O) into conical flask. Heat to ~70 °C and titrate hot with Solution A until permanent pink colour persists.',
        table1: {
          title: 'Table 1: Titration of Ammonium Iron(II) Sulfate with Solution A',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 25.00', 'Final: 50.00', 'Final: 25.00', 'Initial: 0.00', 'Initial: 25.00', 'Initial: 0.00', 'Titre: 25.00', 'Titre: 25.00', 'Titre: 25.00']
        },
        table2: {
          title: 'Table 2: Titration of Hot Dibasic Acid H₂X·2H₂O with Solution A',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 20.00', 'Final: 40.00', 'Final: 20.00', 'Initial: 0.00', 'Initial: 20.00', 'Initial: 0.00', 'Titre: 20.00', 'Titre: 20.00', 'Titre: 20.00']
        },
        calculations: [
          '(a) Calculate concentration of Solution B in mol/dm³ (RFM = 392.0). (1 Mk)',
          '(b) Calculate moles of Fe²⁺ in 25.0 cm³ of Solution B. (1 Mk)',
          '(c) Given MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O, calculate molarity of KMnO₄ Solution A. (2 Mks)',
          '(d) Calculate moles of KMnO₄ in average volume V₂ from Table 2. (1 Mk)',
          '(e) Given 2 moles of MnO₄⁻ react with 5 moles of H₂X·2H₂O, calculate moles and molarity of Solution C. (3 Mks)',
          '(f) Calculate relative formula mass of H₂X·2H₂O and the atomic mass of X. (3 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid D (8.0 Marks)',
        preamble: 'Solid D is a black inorganic substance.',
        tests: [
          { step: '(a) (i)', prompt: 'Add 1 cm³ 6M HCl to Solid D in dry test tube and warm gently for 1 minute.', obs: 'Effervescence increases with heating; greenish-yellow gas evolved with pungent choking smell that bleaches moist blue litmus paper', inf: 'Chlorine gas evolved; Solid D is an oxidizing agent' },
          { step: '(a) (ii)', prompt: 'Dilute with water, filter, add 2M NaOH dropwise to excess.', obs: 'Reddish-brown precipitate formed, insoluble in excess NaOH', inf: 'Fe³⁺ ions present' },
          { step: '(b)', prompt: 'Add 1 cm³ 20-volume hydrogen peroxide (H₂O₂) to Solid D.', obs: 'Vigorous effervescence of colourless gas that relights a glowing wooden splint', inf: 'Oxygen gas evolved; Solid D acts as catalyst (MnO₂)' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Organic Functional Group Analysis of Solid E (12.0 Marks)',
        preamble: 'Solid E is an organic crystalline solid.',
        tests: [
          { step: '(a)', prompt: 'Ignite Solid E on clean metallic spatula.', obs: 'Melts to colourless liquid; burns with a luminous, smoky/sooty yellow flame', inf: 'Unsaturated organic compound / high C:H ratio (>C=C<)' },
          { step: '(b)', prompt: 'Dissolve in water; test with blue and red litmus paper.', obs: 'Moist blue litmus turns faint red/pink; red litmus unchanged', inf: 'Organic acid / carboxylic acid (-COOH) / H⁺ present' },
          { step: '(c)', prompt: 'Add 2M NaOH to Solid E.', obs: 'Solid dissolves readily to form a clear colourless solution', inf: 'Acidic substance reacts with base to form soluble salt' },
          { step: '(d) (i)', prompt: 'Heat in boiling tube with water; add solid NaHCO₃.', obs: 'Brisk effervescence of colourless gas that turns limewater milky', inf: 'Carboxylic acid (-COOH) confirmed present' },
          { step: '(d) (ii)', prompt: 'To another portion, add 2–3 drops conc. H₂SO₄ and 1 cm³ ethanol; warm gently.', obs: 'A sweet, pleasant fruity smell is produced', inf: 'Ester formed; confirms carboxylic acid (-COOH)' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Molarity of Solution B', marks: '1.0 Mk', rubric: '23.5 / 392.0 = 0.05995 M (accept 0.060 M).' },
        { item: 'Moles Fe²⁺', marks: '1.0 Mk', rubric: '0.05995 × 25 / 1000 = 0.00150 mol.' },
        { item: 'Molarity of KMnO₄ Solution A', marks: '2.0 Mks', rubric: 'Moles MnO₄⁻ = 0.00150 / 5 = 0.00030 mol. Molarity A = (0.00030 × 1000) / 25.00 = 0.0120 M.' },
        { item: 'Moles of dibasic acid C', marks: '3.0 Mks', rubric: 'Moles MnO₄⁻ in V₂ = (0.0120 × 20.0) / 1000 = 0.00024 mol. Moles H₂X in 25 cm³ = 0.00024 × (5/2) = 0.00060 mol. Molarity C = (0.00060 × 1000) / 25 = 0.0240 M.' },
        { item: 'RFM and atomic mass of X', marks: '3.0 Mks', rubric: 'RFM = 5.0 / 0.0240 = 208.3. H₂X·2H₂O = 2(1) + X + 2(18) = X + 38 = 208.3 => X = 170.3 (or 88-90 if anhydrous oxalic acid).' }
      ],
      qualitativeObservations: 'MnO₂ acts as catalyst in H₂O₂ and oxidizing agent in conc. HCl.',
      confidentialPrep: 'Solution A: 3.16 g KMnO₄ in 1 L 0.5 M H₂SO₄. Solution B: 23.5 g (NH₄)₂Fe(SO₄)₂·6H₂O in 1 L 0.5 M H₂SO₄. Solution C: 5.0 g hydrated oxalic acid in 1 L. Solid D: Manganese(IV) oxide MnO₂ mixed with trace iron(III) salt. Solid E: Maleic acid.'
    }
  },

  // ── KCSE 1995 ──
  {
    id: 'kcse_1995',
    year: 1995,
    title: 'KCSE 1995 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Hess\'s Law Thermochemical Cycle & Metal Reactivity',
    topics: ['Thermochemistry & Hess Law', 'Qualitative Analysis', 'Flame Tests'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Determination of enthalpy change for reactions of KHCO₃ and MgCO₃ with 2.0M HCl, and applying Hess\'s Law to determine the enthalpy of formation of MgCO₃. Qualitative identification of metal reactivity with Solid L and thermal decomposition of Solid N (KNO₃).',
    questions: [
      {
        num: 1,
        title: 'Question 1: Hess\'s Law Thermochemical Calorimetry (22.0 Marks)',
        procedure: 'Procedure I: Measure 15.0 cm³ of 2.0M HCl into 100 ml beaker. Take temperature every 30 seconds for 2 minutes. At exactly 2.5 minutes, add 2.0 g potassium hydrogen carbonate Solid J (KHCO₃), stir, and take temperature every 30 seconds up to 5 minutes.\nProcedure II: Repeat using 1.0 g magnesium carbonate Solid K (MgCO₃) with 15.0 cm³ of 2.0M HCl.',
        table1: {
          title: 'Table 1: Temperature vs Time for Reaction of KHCO₃ with HCl',
          headers: ['Time (min)', '0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'],
          sampleValues: ['23.5', '23.5', '23.5', '23.5', '23.5', 'X', '15.5', '16.0', '16.5', '17.0', '17.5']
        },
        calculations: [
          '(a) Plot graph of temperature against time for Procedure I and determine fall in temperature ΔT₁. (4 Mks)',
          '(b) Calculate moles of KHCO₃ (n₁) and enthalpy change ΔH₁: ΔH₁ = (15 × 4.2 × ΔT₁) / (n₁ × 1000) kJ/mol. (3 Mks)',
          '(c) Plot graph for Procedure II and calculate enthalpy change ΔH₂ for MgCO₃ + 2HCl. (3 Mks)',
          '(d) Given enthalpy of solution of KHCO₃ is +121 kJ/mol (ΔH₃), use expression ΔH₄ = 2ΔH₁ - ΔH₂ - 2ΔH₃ to calculate ΔH₄. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Metal Reactivity Qualitative Tests on Solid L (9.0 Marks)',
        preamble: 'Solid L is a silvery metal.',
        tests: [
          { step: '(a)', prompt: 'Describe appearance of Solid L.', obs: 'Silvery-grey metallic lustre / shining flexible metal', inf: 'Metallic element' },
          { step: '(b)', prompt: 'Heat Solid L strongly in dry test tube.', obs: 'Silvery metal turns white/grey powder on surface', inf: 'Metal reacts with oxygen to form metallic oxide' },
          { step: '(c)', prompt: 'Add 2 cm³ water to Solid L and warm gently.', obs: 'Effervescence of colourless gas that burns with a "pop" sound', inf: 'Metal is above hydrogen in reactivity series; H₂ gas evolved' },
          { step: '(d)', prompt: 'Add 2 cm³ dilute HCl to Solid L.', obs: 'Rapid effervescence of gas that burns with a "pop" sound', inf: 'Metal is above hydrogen in reactivity series' },
          { step: '(e)', prompt: 'Add Solid L to 2 cm³ lead(II) nitrate solution.', obs: 'Black/grey coating deposited on metal; lead displaced', inf: 'Metal L is above lead in electrochemical series' }
        ]
      },
      {
        num: 3,
        title: 'Question 3: Qualitative Analysis of Solid N (9.0 Marks)',
        preamble: 'Solid N is an inorganic compound.',
        tests: [
          { step: '(a)', prompt: 'Describe appearance of Solid N.', obs: 'White crystalline solid', inf: 'Hydrated or anhydrous ionic salt' },
          { step: '(b)', prompt: 'Burn Solid N on clean metallic spatula in Bunsen flame.', obs: 'Burns with a lilac / purple flame', inf: 'K⁺ confirmed present' },
          { step: '(c)', prompt: 'Heat Solid N strongly in dry test tube; test gas with glowing splint.', obs: 'Solid melts into colourless liquid; gas evolved relights glowing splint', inf: 'Oxygen (O₂) gas evolved; nitrate of potassium (KNO₃)' },
          { step: '(d) (iv)', prompt: 'Dissolve in water, add dilute NaOH and aluminium foil; warm.', obs: 'Effervescence of choking gas that turns moist red litmus blue', inf: 'NO₃⁻ confirmed present (NH₃ evolved)' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Fall in temperature ΔT₁', marks: '1.0 Mk', rubric: 'ΔT₁ = 15.0 - 23.5 = -8.5 °C (endothermic reaction).' },
        { item: 'Moles of KHCO₃ (n₁)', marks: '1.0 Mk', rubric: 'n₁ = 2.0 / 100.0 = 0.020 mol.' },
        { item: 'Enthalpy ΔH₁', marks: '2.0 Mks', rubric: 'ΔH₁ = +(15 × 4.2 × 8.5) / (0.020 × 1000) = +26.8 kJ/mol.' },
        { item: 'Enthalpy ΔH₂ for MgCO₃', marks: '3.0 Mks', rubric: 'Exothermic temperature rise ΔT₂. ΔH₂ = -(Mass × 4.2 × ΔT₂) / (n₂ × 1000) ≈ -43.8 kJ/mol.' },
        { item: 'Hess Law Cycle ΔH₄', marks: '2.0 Mks', rubric: 'ΔH₄ = 2(26.8) - (-43.8) - 2(121) = 53.6 + 43.8 - 242 = -144.6 kJ/mol.' }
      ],
      qualitativeObservations: 'Lilac flame strictly ties to K⁺; oxygen rekindling glowing splint confirms nitrate decomposition.',
      confidentialPrep: 'Solid J: 2.0 g KHCO₃ accurately weighed. Solid K: 1.0 g MgCO₃ accurately weighed. Acid: 2.0 M HCl. Solid L: Magnesium ribbon / turnings. Solid N: Potassium nitrate KNO₃.'
    }
  },

  // ── KCSE 1994 ──
  {
    id: 'kcse_1994',
    year: 1994,
    title: 'KCSE 1994 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Polyprotic Acid Basicity Determination & Enthalpy Neutralization',
    topics: ['Volumetric Titration / Basicity', 'Thermochemistry', 'Flame Tests', 'Qualitative Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Titration of 0.2M NaOH against 0.1M carboxylic acid C₃H₅O(COOH)ₙ to deduce the basicity n. Determination of molar heat of neutralization of 1.0M NaOH with 0.63M Acid G. Flame tests on NaCl, KCl, CaCl₂, and Solid H.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Acid Basicity Determination (15.0 Marks)',
        procedure: 'Pipette 25.0 cm³ of 0.1M carboxylic acid Solution E (C₃H₅O(COOH)ₙ) into conical flask. Titrate with 0.2M NaOH Solution D using phenolphthalein indicator until permanent pink.',
        table1: {
          title: 'Table 1: Titration of Carboxylic Acid E with NaOH Solution D',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 37.50', 'Final: 37.50', 'Final: 37.50', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 0.00', 'Titre: 37.50', 'Titre: 37.50', 'Titre: 37.50']
        },
        calculations: [
          '(a) Calculate average volume of Solution D used. (1 Mk)',
          '(b) Calculate moles of NaOH used: (0.2 × 37.5) / 1000 = 0.0075 mol. (2 Mks)',
          '(c) Calculate moles of Acid E in 25.0 cm³: (0.1 × 25) / 1000 = 0.0025 mol. (2 Mks)',
          '(d) Calculate moles of NaOH reacting with 1 mole of acid and state basicity value n. (4 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Thermometric Enthalpy of Neutralization (15.0 Marks)',
        procedure: 'Measure 25.0 cm³ 1.0M NaOH Solution F into beaker, record temperature. Add 5 cm³ portions of 0.63M Acid G from test tubes every 30 seconds, recording highest temperature after each addition up to 30 cm³.',
        table1: {
          title: 'Table 2: Temperature vs Volume of Acid G Added',
          headers: ['Volume G (cm³)', '0', '5', '10', '15', '20', '25', '30'],
          sampleValues: ['Temp (°C): 20.0', '23.0', '26.0', '28.5', '29.0', '27.5', '26.0']
        },
        calculations: [
          '(a) Plot graph of temperature against volume of Acid G added. (4 Mks)',
          '(b) From graph, determine volume of Acid G required for complete neutralization and maximum ΔT. (2 Mks)',
          '(c) Calculate heat change and molar heat of neutralization. (4 Mks)'
        ]
      },
      {
        num: 3,
        title: 'Question 3: Flame Tests and Qualitative Analysis of Solid H (10.0 Marks)',
        preamble: 'Flame tests on metallic chlorides and analysis of Solid H.',
        tests: [
          { step: '(a)', prompt: 'Perform flame tests on clean spatula for NaCl, KCl, CaCl₂, and Solid H.', obs: 'NaCl: Golden yellow flame; KCl: Lilac flame; CaCl₂: Brick-red flame; Solid H: Brick-red flame', inf: 'Solid H contains Ca²⁺ ions' },
          { step: '(b) (i)', prompt: 'Heat Solid H strongly in dry test tube.', obs: 'White crystalline solid decrepitates; colourless droplets condense', inf: 'Hydrated salt' },
          { step: '(b) (ii)', prompt: 'Dissolve in water, add aqueous NaOH dropwise to excess.', obs: 'White precipitate formed, insoluble in excess NaOH', inf: 'Ca²⁺ confirmed present' },
          { step: '(b) (iii)', prompt: 'To another portion, add aqueous ammonia dropwise to excess.', obs: 'No precipitate formed with aqueous ammonia', inf: 'Ca²⁺ confirmed present (Mg²⁺ forms precipitate)' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Mole ratio & basicity', marks: '4.0 Mks', rubric: 'Ratio = 0.0075 mol NaOH / 0.0025 mol Acid E = 3. Value of n = 3 (Tribasic acid, citric acid).' },
        { item: 'Thermometric neutralization', marks: '4.0 Mks', rubric: 'Intersection of two lines yields equivalence volume (~20 cm³) and maximum ΔT (~9.0 °C).' }
      ],
      qualitativeObservations: 'Brick-red flame and insoluble NaOH precipitate with no NH₃ precipitate confirms Ca²⁺.',
      confidentialPrep: 'Solution D: 0.2 M NaOH (8.0 g/L). Solution E: 19.2 g citric acid in 1 L (0.10 M tribasic). Solution F: 1.0 M NaOH (40.0 g/L). Solution G: 0.63 M HCl (52 cm³ conc. HCl in 1 L). Solid H: Calcium chloride hydrate CaCl₂·2H₂O.'
    }
  },

  // ── KCSE 1993 ──
  {
    id: 'kcse_1993',
    year: 1993,
    title: 'KCSE 1993 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Ammonium Salt Distillation & Back-Titration RFM Determination',
    topics: ['Volumetric Back-Titration', 'Qualitative Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Standardization of diluted NaOH Solution D with 0.01M monobasic acid Solution C. Boiling 1.0 g ammonium salt Solid B with known excess NaOH to expel ammonia, followed by back-titrating residual alkali to find RFM. Qualitative tests on Solid F.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Ammonium Salt Back-Titration (26.0 Marks)',
        procedure: 'Procedure I: Dilute 25 cm³ NaOH Solution A with 175 cm³ water (Solution D). Titrate 25 cm³ Solution D with 0.01M monobasic acid Solution C using phenolphthalein.\nProcedure II: Dissolve 1.0 g ammonium salt Solid B in 25 cm³ NaOH Solution A in conical flask. Boil gently for 10 minutes to expel ammonia gas completely. Cool, transfer to 100 ml volumetric flask, dilute to mark (Solution E). Titrate 25 cm³ portions of Solution E with Solution C.',
        table1: {
          title: 'Table 1: Titration of Diluted NaOH Solution D with Acid C',
          headers: ['Titration', '1st', '2nd', '3rd'],
          sampleValues: ['Final: 25.00', 'Final: 50.00', 'Final: 25.00', 'Initial: 0.00', 'Initial: 25.00', 'Initial: 0.00', 'Titre: 25.00', 'Titre: 25.00', 'Titre: 25.00']
        },
        table2: {
          title: 'Table 2: Titration of Residual NaOH Solution E',
          headers: ['Titration', '1st', '2nd', '3rd'],
          sampleValues: ['Final: 15.60', 'Final: 31.20', 'Final: 15.60', 'Initial: 0.00', 'Initial: 15.60', 'Initial: 0.00', 'Titre: 15.60', 'Titre: 15.60', 'Titre: 15.60']
        },
        calculations: [
          '(a) Calculate average volume of Solution C used in Table 1 and concentration of NaOH in Solution D and Solution A. (3 Mks)',
          '(b) Calculate moles of monobasic acid used in Table 2 and residual moles of NaOH in 100 cm³ of Solution E. (4 Mks)',
          '(c) Calculate initial moles of NaOH added to Solid B and moles of NaOH that reacted with Solid B. (4 Mks)',
          '(d) Given 1 mole of NaOH reacts with 1 mole of ammonium salt, calculate RFM of Solid B. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid F (14.0 Marks)',
        preamble: 'Solid F is an inorganic salt.',
        tests: [
          { step: '(a)', prompt: 'Dissolve Solid F in boiling tube half-full with water. To portion 1, add NaOH dropwise to excess.', obs: 'No precipitate formed', inf: 'Transition metals and Mg²⁺, Ca²⁺ absent' },
          { step: '(b)', prompt: 'To portion 2, add 6 drops barium chloride solution.', obs: 'White precipitate formed', inf: 'SO₄²⁻, SO₃²⁻, or CO₃²⁻ present' },
          { step: '(c)', prompt: 'To portion 3, add 3 drops iodine solution.', obs: 'Brown colour of iodine is decolorized to colourless', inf: 'Reducing agent present (SO₃²⁻)' },
          { step: '(d)', prompt: 'To portion 4, add dilute HCl, warm gently, test vapours with filter paper dipped in K₂Cr₂O₇.', obs: 'Effervescence of choking gas; orange paper turns green', inf: 'SO₂ gas evolved; SO₃²⁻ confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Concentration of NaOH', marks: '3.0 Mks', rubric: 'Conc D = (0.01 × 25.0) / 25.0 = 0.010 M. Conc A = 0.010 × (200 / 25) = 0.080 M.' },
        { item: 'Moles NaOH reacted', marks: '4.0 Mks', rubric: 'Initial moles in 25 cm³ A = 0.080 × 25 / 1000 = 0.0020 mol. Residual moles in 100 cm³ E = 4 × (0.01 × 15.6 / 1000) = 0.000624 mol. Moles reacted = 0.0020 - 0.000624 = 0.001376 mol.' },
        { item: 'RFM of Ammonium Salt B', marks: '2.0 Mks', rubric: 'RFM = 1.0 g / 0.001376 mol = 726 / 53.5 depending on salt (NH₄Cl = 53.5).' }
      ],
      qualitativeObservations: 'SO₂ gas decolorizes iodine and turns K₂Cr₂O₇ green.',
      confidentialPrep: 'Solution A: 40 g NaOH in 1 L (1.0 M diluted to ~0.08M). Solution C: 0.01 M HCl. Solid B: 1.0 g NH₄Cl. Solid F: Sodium sulphite Na₂SO₃.'
    }
  },

  // ── KCSE 1992 ──
  {
    id: 'kcse_1992',
    year: 1992,
    title: 'KCSE 1992 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Iodate/Sulphite Kinetics & Borax Crystallization Water',
    topics: ['Chemical Kinetics', 'Volumetric Analysis', 'Qualitative Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Reaction rates of potassium iodate C₂ with acidified sodium hydrogen sulphite C₃. Question 2 involves titrating basic sodium tetraborate Na₂B₄O₇·nH₂O with 0.11M HCl to deduce the hydration coefficient n. Qualitative tests on Solid C₇.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Reaction Rates of Potassium Iodate (15.0 Marks)',
        procedure: 'In 6 test tubes, prepare dilutions of potassium iodate Solution C₂ (10, 8, 6, 4, 3, 2 cm³) with water. In a 100 ml beaker, place 10 cm³ Solution C₃ and 3 drops starch C₄. Add test tube 1, start stopwatch, swirl, and record time taken for blue complex to appear.',
        table1: {
          title: 'Table 1: Volume of Iodate vs Reaction Time',
          headers: ['Tube', 'i', 'ii', 'iii', 'iv', 'v', 'vi'],
          sampleValues: ['Vol C₂ (cm³): 10', '8', '6', '4', '3', '2', 'Vol Water (cm³): 0', '2', '4', '6', '7', '8', 'Time (s): 15', '20', '28', '46', '65', '110']
        },
        calculations: [
          '(a) Plot graph of volume of Solution C₂ used (vertical axis) versus time. (5 Mks)',
          '(b) From graph, determine time taken if 7 cm³ of C₂ and 3 cm³ water were used. (2 Mks)',
          '(c) Explain how concentration of potassium iodate affects the reaction rate. (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Borax Water of Crystallization Determination (15.0 Marks)',
        procedure: 'Titrate 25.0 cm³ portions of 19.2 g/L basic compound Na₂B₄O₇·nH₂O (Solution C₆) with 0.11M HCl (Solution C₅) using methyl orange indicator until colour changes from yellow to orange.\nIonic equation: B₄O₇²⁻(aq) + 2H⁺(aq) + 5H₂O(l) → 4H₃BO₃(aq). (1 mole base reacts with 2 moles acid).',
        table1: {
          title: 'Table 3: Titration of Solution C₆ with 0.11M HCl',
          headers: ['Titration', 'I', 'II', 'III'],
          sampleValues: ['Final: 28.50', 'Final: 28.50', 'Final: 28.50', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 0.00', 'Titre: 28.50', 'Titre: 28.50', 'Titre: 28.50']
        },
        calculations: [
          '(a) Calculate average volume of 0.11M HCl used. (1 Mk)',
          '(b) Calculate concentration of Solution C₆ in mol/dm³. (4 Mks)',
          '(c) Calculate relative molecular mass of Na₂B₄O₇·nH₂O. (2 Mks)',
          '(d) Calculate value of n in Na₂B₄O₇·nH₂O (B=10.8, H=1.0, Na=23.0, O=16.0). (3 Mks)'
        ]
      },
      {
        num: 3,
        title: 'Question 3: Qualitative Analysis of Solid C₇ (10.0 Marks)',
        preamble: 'Solid C₇ is an inorganic salt.',
        tests: [
          { step: '(a)', prompt: 'Heat Solid C₇ gently in dry test tube.', obs: 'Colourless liquid droplets condense on upper cooler walls', inf: 'Hydrated salt' },
          { step: '(b) (i)', prompt: 'Dissolve in water. To portion 1, add dilute H₂SO₄.', obs: 'Dense white precipitate formed', inf: 'Ba²⁺ or Pb²⁺ present' },
          { step: '(b) (ii)', prompt: 'To portion 2, add aqueous NaOH dropwise to excess.', obs: 'White precipitate formed, insoluble in excess NaOH', inf: 'Ba²⁺ confirmed present (Pb²⁺ dissolves in excess)' },
          { step: '(b) (iv)', prompt: 'To portion 4, add barium chloride solution.', obs: 'No precipitate formed', inf: 'SO₄²⁻ absent; Cl⁻ likely present (BaCl₂)' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Kinetics curve', marks: '5.0 Mks', rubric: 'Smooth hyperbolic curve. Higher volume = shorter time.' },
        { item: 'Molarity of Borax C₆', marks: '4.0 Mks', rubric: 'Moles HCl = (0.11 × 28.5) / 1000 = 0.003135 mol. Moles Borax in 25 cm³ = 0.003135 / 2 = 0.001568 mol. Molarity = (0.001568 × 1000) / 25.0 = 0.0627 M.' },
        { item: 'RFM and value of n', marks: '5.0 Mks', rubric: 'RFM = 19.2 / 0.0627 = 306.2. Anhydrous Na₂B₄O₇ = 2(23) + 4(10.8) + 7(16) = 46 + 43.2 + 112 = 201.2. 18n = 306.2 - 201.2 = 105 => n = 5.8 ≈ 6 (or 10 for decahydrate).' }
      ],
      qualitativeObservations: 'Ba²⁺ insoluble in excess NaOH distinguishes from amphoteric Pb²⁺.',
      confidentialPrep: 'Solution C₂: 2.0 g KIO₃ in 1 L. Solution C₃: 0.40 g NaHSO₃ in 1 L with 20 cm³ 1M H₂SO₄. Solution C₄: 1% starch paste. Solution C₅: 0.11 M HCl. Solution C₆: 19.2 g sodium tetraborate in 1 L. Solid C₇: Barium chloride BaCl₂·2H₂O.'
    }
  },

  // ── KCSE 1990 ──
  {
    id: 'kcse_1990',
    year: 1990,
    title: 'KCSE 1990 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Organic Acid Solubility & Standardization Titration',
    topics: ['Solubility Determination', 'Acid-Base Volumetric Analysis', 'Organic Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Preparation of saturated solution of monobasic organic Solid D, standardization of NaOH Solution S₁ with dibasic acid Solution S₂, and titration of dissolved acid D to determine its solubility in g/100g water. Qualitative organic testing of Solid Q.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Solubility & Volumetric Standardization (24.0 Marks)',
        procedure: 'Procedure A: Place Solid D in dry conical flask, add 100 cm³ distilled water, shake thoroughly, and leave to stand.\nProcedure B: Pipette 25.0 cm³ of 0.01M dibasic acid Solution S₂ into conical flask. Titrate with NaOH Solution S₁ using phenolphthalein indicator.\nProcedure C: Filter saturated solution of Solid D into dry flask. Pipette 10.0 cm³ of filtrate, add 25 cm³ water, and titrate with standardized NaOH Solution S₁.',
        table1: {
          title: 'Table A: Standardization of NaOH Solution S₁ with Dibasic Acid S₂',
          headers: ['Titration', '1st', '2nd', '3rd'],
          sampleValues: ['Final: 25.00', 'Final: 25.00', 'Final: 25.00', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 0.00', 'Titre: 25.00', 'Titre: 25.00', 'Titre: 25.00']
        },
        table2: {
          title: 'Table B: Titration of Saturated Acid D Filtrate with Solution S₁',
          headers: ['Titration', '1st', '2nd', '3rd'],
          sampleValues: ['Final: 18.20', 'Final: 18.20', 'Final: 18.20', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 0.00', 'Titre: 18.20', 'Titre: 18.20', 'Titre: 18.20']
        },
        calculations: [
          '(i) Write equation for dibasic acid H₂A with NaOH: H₂A + 2NaOH → Na₂A + 2H₂O. (1 Mk)',
          '(ii) Calculate concentration of NaOH Solution S₁ in mol/dm³. (3 Mks)',
          '(iii) Calculate moles of monobasic Acid D in 10 cm³ of filtrate and in 100 cm³ saturated solution. (2 Mks)',
          '(iv) Given molecular formula of Acid D is C₇H₆O₂, calculate solubility in g/100 cm³ water (RFM = 122.0). (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Organic Functional Group Analysis of Solid Q (16.0 Marks)',
        preamble: 'Solid Q is an organic solid.',
        tests: [
          { step: '(a) (i)', prompt: 'Dissolve in water; test with pH paper.', obs: 'pH paper turns orange-red; pH = 2 – 3', inf: 'Acidic substance / carboxylic acid / H⁺ present' },
          { step: '(a) (ii)', prompt: 'Add solid sodium hydrogen carbonate (NaHCO₃).', obs: 'Brisk effervescence of colourless gas that turns limewater milky', inf: 'Carboxylic acid (-COOH) confirmed present' },
          { step: '(a) (iii)', prompt: 'Add 2 drops potassium manganate(VII).', obs: 'Purple KMnO₄ colour persists / not decolorized', inf: 'Alkene (>C=C<) absent' },
          { step: '(b)', prompt: 'Ignite a little Solid Q on metallic spatula.', obs: 'Melts and burns with yellow luminous sooty flame', inf: 'Aromatic carboxylic acid / high carbon ratio' },
          { step: '(c)', prompt: 'Add 4 cm³ ethanol and 2 drops conc. H₂SO₄; warm gently and pour into cold water.', obs: 'Pleasant, sweet fruity fragrance produced', inf: 'Ester formed; confirms carboxylic acid (-COOH)' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Molarity of NaOH S₁', marks: '3.0 Mks', rubric: 'Moles H₂A = (0.01 × 25) / 1000 = 0.00025 mol. Moles NaOH = 0.00050 mol. Molarity S₁ = (0.00050 × 1000) / 25.0 = 0.020 M.' },
        { item: 'Solubility of Acid D', marks: '4.0 Mks', rubric: 'Moles D in 10 cm³ = (0.020 × 18.2) / 1000 = 0.000364 mol. Moles in 100 cm³ = 0.00364 mol. Mass = 0.00364 × 122.0 = 0.444 g/100 cm³ water (Benzoic acid).' }
      ],
      qualitativeObservations: 'Benzoic acid burns with sooty flame and produces ethyl benzoate pleasant fruity ester.',
      confidentialPrep: 'Solid D: Benzoic acid C₇H₆O₂. Solution S₁: 4.0 g NaOH in 1 L diluted 1:5 to 0.02 M. Solution S₂: 0.01 M oxalic acid. Solid Q: Benzoic acid.'
    }
  },

  // ── KCSE 1989 ──
  {
    id: 'kcse_1989',
    year: 1989,
    title: 'KCSE 1989 Chemistry Paper 3 Practical (233/3)',
    badgeText: 'Official KNEC Paper · Standardizing NaOH, Dilution & Metal Calorimetry Mass per Unit Length',
    topics: ['Volumetric Analysis', 'Thermochemistry', 'Qualitative Analysis'],
    playablePresetKey: null,
    totalMarks: 40.0,
    durationMinutes: 135,
    summary: 'Standardization of NaOH Solution W₁₂ with dibasic acid Solution W₁₁ (6.3 g/L H₂C₂O₄·2H₂O). Dilution of conc. HCl Solution W₉ and calorimetric reaction with magnesium ribbon metal M to determine its mass per unit length. Qualitative tests on Solid Y.',
    questions: [
      {
        num: 1,
        title: 'Question 1: Volumetric Analysis & Metal Calorimetry (30.0 Marks)',
        procedure: 'Part I: Titrate 25.0 cm³ NaOH Solution W₁₂ with dibasic acid Solution W₁₁ (6.3 g/L H₂C₂O₄·2H₂O) using phenolphthalein.\nPart II: Dilute 10 cm³ conc. HCl Solution W₉ with 90 cm³ water (Solution W₁₀). Titrate 25 cm³ NaOH Solution W₁₂ with Solution W₁₀.\nPart III: Measure 10 cm³ conc. HCl Solution W₉ into boiling tube wrapped in tissue. Cut three 2 cm pieces of Metal M (magnesium ribbon). Measure initial temp, add 2 cm piece of M, and record highest temperature reached.',
        table1: {
          title: 'Table A: Standardization of NaOH Solution W₁₂ with Dibasic Acid W₁₁',
          headers: ['Titration', '1st', '2nd', '3rd'],
          sampleValues: ['Final: 25.00', 'Final: 25.00', 'Final: 25.00', 'Initial: 0.00', 'Initial: 0.00', 'Initial: 0.00', 'Titre: 25.00', 'Titre: 25.00', 'Titre: 25.00']
        },
        table2: {
          title: 'Table C: Temperature Rise of Metal M with HCl',
          headers: ['Piece of Metal M (2 cm)', '1st', '2nd', '3rd'],
          sampleValues: ['Highest Temp (°C): 44.0', '44.0', '44.5', 'Initial Temp (°C): 22.0', '22.0', '22.0', 'Change ΔT (°C): 22.0', '22.0', '22.5']
        },
        calculations: [
          '(i) Calculate concentration of dibasic acid Solution W₁₁ in mol/dm³ (RFM = 126.0). (1 Mk)',
          '(ii) Calculate concentration of NaOH Solution W₁₂ in mol/dm³. (2 Mks)',
          '(iii) Calculate concentration of original conc. HCl Solution W₉. (3 Mks)',
          '(iv) Calculate heat of reaction: Heat = 42 × ΔT Joules. (1 Mk)',
          '(v) Given molar heat of reaction is 440 kJ/mol of M, calculate moles of M used in 2 cm piece. (2 Mks)',
          '(vi) Calculate mass per unit length of Metal M (M = 24.0 g/mol). (2 Mks)'
        ]
      },
      {
        num: 2,
        title: 'Question 2: Qualitative Analysis of Solid Y (10.0 Marks)',
        preamble: 'Solid Y is an inorganic salt.',
        tests: [
          { step: '(a)', prompt: 'Heat half-spatula of Solid Y in dry test tube gently then strongly.', obs: 'Pungent gas evolved turning moist red litmus blue; white sublimes', inf: 'NH₄⁺ present' },
          { step: '(b)', prompt: 'Add 1 cm³ dilute HCl to half-spatula of Solid Y.', obs: 'No effervescence; solid dissolves', inf: 'CO₃²⁻ absent' },
          { step: '(c) (i)', prompt: 'Dissolve in water. Add dilute NaOH dropwise to excess; warm gently.', obs: 'Green precipitate formed, insoluble in excess NaOH; turns brown on surface; pungent gas evolved turning red litmus blue', inf: 'Fe²⁺ present; NH₄⁺ confirmed present' },
          { step: '(c) (ii)', prompt: 'To portion 2, add aqueous ammonia dropwise to excess.', obs: 'Green precipitate formed, insoluble in excess aqueous ammonia', inf: 'Fe²⁺ confirmed present' }
        ]
      }
    ],
    markScheme: {
      q1Calculations: [
        { item: 'Molarity of dibasic acid W₁₁', marks: '1.0 Mk', rubric: '6.30 / 126.0 = 0.050 M.' },
        { item: 'Molarity of NaOH W₁₂', marks: '2.0 Mks', rubric: '(0.050 × 25.0 × 2) / 25.0 = 0.100 M.' },
        { item: 'Heat of reaction', marks: '1.0 Mk', rubric: 'Heat = 42 × 22.0 = 924 Joules (0.924 kJ).' },
        { item: 'Moles & Mass per unit length', marks: '4.0 Mks', rubric: 'Moles M = 0.924 / 440 = 0.0021 mol. Mass of 2 cm = 0.0021 × 24.0 = 0.0504 g. Mass per cm = 0.0504 / 2 = 0.0252 g/cm.' }
      ],
      qualitativeObservations: 'Ammonium iron(II) sulfate shows both Fe²⁺ green precipitate and NH₄⁺ gas evolution with warm NaOH.',
      confidentialPrep: 'Solution W₉: 90 cm³ conc. HCl in 1 L (~1.08 M). Solution W₁₁: 6.30 g oxalic acid in 1 L (0.05 M). Solution W₁₂: 3.20 g NaOH pellets in 1 L (0.08 M). Metal M: Clean magnesium ribbon. Solid Y: Mohr\'s salt (NH₄)₂Fe(SO₄)₂·6H₂O.'
    }
  }
];

// Helper to filter past papers by topic, decade, or keyword
function filterPastPapers(options = {}) {
  let list = KCSE_PAST_PAPERS_ARCHIVE.slice();
  if (options.decade) {
    if (options.decade === '1980s-1990s') list = list.filter(p => p.year >= 1989 && p.year <= 1999);
    else if (options.decade === '2000s') list = list.filter(p => p.year >= 2000 && p.year <= 2009);
    else if (options.decade === '2010s') list = list.filter(p => p.year >= 2010 && p.year <= 2024);
  }
  if (options.topic && options.topic !== 'all') {
    list = list.filter(p => p.topics.some(t => t.toLowerCase().includes(options.topic.toLowerCase())));
  }
  if (options.keyword && options.keyword.trim()) {
    const q = options.keyword.toLowerCase().trim();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.badgeText.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.year.toString().includes(q) ||
      p.topics.some(t => t.toLowerCase().includes(q))
    );
  }
  return list;
}

// Export for browser and node testing environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    KCSE_LEAD_NOTES,
    KCSE_PAST_PAPERS_ARCHIVE,
    filterPastPapers
  };
}

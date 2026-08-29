// ============================================================
//  VirtuLab Kenya — Chemistry Practical Competency Achievement Test (CPCAT)
//  KNEC KCSE Chemistry Paper 3 Standardized Assessment Engine (40 Marks)
//  Aligned with KNEC Table of Specifications & Bloom's Cognitive Taxonomy
// ============================================================

const CPCAT_ITEMS = [
  // ── SECTION A: Volumetric Analysis & Stoichiometric Calculations (10 Marks) ──
  {
    id: 'a1_concordance',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Analysis',
    marks: 1,
    prompt: 'A candidate obtains the following burette readings in an acid-base titration:\n• Trial I: 21.40 cm³\n• Trial II: 21.20 cm³\n• Trial III: 21.30 cm³\n• Trial IV: 21.85 cm³\nAccording to official KNEC Paper 3 marking principles (concordancy within ±0.20 cm³), which titres MUST be averaged to determine V₁?',
    options: [
      'Trials I and IV (21.40 and 21.85 cm³)',
      'Trials I, II, and III (range = 0.20 cm³, concordant within ±0.10 cm³ of mean)',
      'All four trials (I, II, III, and IV)',
      'Trial IV only because it represents the highest volume'
    ],
    correctIndex: 1,
    explanation: 'KNEC marking rubric dictates averaging titres that are concordant within ±0.20 cm³ of each other. Trials I, II, and III span 21.20 to 21.40 cm³ (spread = 0.20 cm³). Trial IV (21.85 cm³) is an outlier (>0.40 cm³ away) and must be discarded.'
  },
  {
    id: 'a2_precision_dp',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'According to KNEC Paper 3 Table 1 rules for the Use of Decimals (D), how must burette readings be consistently recorded?',
    options: [
      'To 2 decimal places with the second digit strictly ending in 0 or 5 (e.g. 21.40 or 21.45 cm³)',
      'To 1 decimal place only to minimize experimental error',
      'As whole integers rounded up to the nearest cm³',
      'To 3 decimal places using digital micrometer readings'
    ],
    correctIndex: 0,
    explanation: 'KNEC standard burettes are graduated in 0.1 cm³ divisions. Readings can be estimated to half a division (0.05 cm³), meaning all readings must be to 2 decimal places ending in .00 or .05 (or .50). Violations incur a -0.5 to -1.0 mark penalty.'
  },
  {
    id: 'a3_primary_standard',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Recall',
    marks: 1,
    prompt: 'Which of the following substances is used as a primary standard in secondary school volumetric analysis because it is obtainable in high purity, has a known formula, does not absorb atmospheric moisture, and does not effloresce?',
    options: [
      'Sodium hydroxide (NaOH)',
      'Concentrated sulfuric acid (H₂SO₄)',
      'Anhydrous sodium carbonate (Na₂CO₃)',
      'Potassium manganate(VII) (KMnO₄)'
    ],
    correctIndex: 2,
    explanation: 'Anhydrous sodium carbonate (Na₂CO₃) and ethanedioic acid crystals are stable primary standards. NaOH is hygroscopic/deliquescent and absorbs atmospheric CO₂, while KMnO₄ decomposes in sunlight.'
  },
  {
    id: 'a4_mole_pipette',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'If 25.0 cm³ of 0.100 M Sodium Carbonate (Na₂CO₃) solution is pipetted into a conical flask, what is the exact number of moles of Na₂CO₃ present?',
    options: [
      '0.0250 mol',
      '0.250 mol',
      '0.00025 mol',
      '0.00250 mol'
    ],
    correctIndex: 3,
    explanation: 'Moles = (Molarity × Volume in cm³) / 1000 = (0.100 mol/dm³ × 25.0 cm³) / 1000 = 0.00250 mol.'
  },
  {
    id: 'a5_stoichiometry_ratio',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'In a titration, 25.0 cm³ of 0.050 M Na₂CO₃ required 25.0 cm³ of hydrochloric acid solution for complete neutralization: Na₂CO₃(aq) + 2HCl(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l). What is the molarity of the hydrochloric acid?',
    options: [
      '0.100 M',
      '0.050 M',
      '0.025 M',
      '0.200 M'
    ],
    correctIndex: 0,
    explanation: 'Moles of Na₂CO₃ = (0.050 × 25) / 1000 = 0.00125 mol. Mole ratio Na₂CO₃:HCl = 1:2. Moles HCl = 0.00125 × 2 = 0.00250 mol. Molarity = (0.00250 × 1000) / 25.0 = 0.100 M.'
  },
  {
    id: 'a6_indicator_ph',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'When titrating a weak acid (such as ethanoic acid, CH₃COOH) with a strong base (such as 0.100 M NaOH), which indicator should be used and why?',
    options: [
      'Methyl Orange, because the equivalence point is acidic (pH < 7)',
      'Phenolphthalein, because the resulting salt undergoes basic hydrolysis yielding an equivalence pH between 8.3 and 10.0',
      'Universal Indicator, because it changes color continuously across the titration',
      'Litmus solution, because it transitions at exactly pH 7.00'
    ],
    correctIndex: 1,
    explanation: 'At the equivalence point of a weak acid and strong base, the conjugate base (ethanoate ion, CH₃COO⁻) hydrolyzes in water to produce OH⁻ ions, creating a mildly basic solution (pH ~ 8.5–9.0). Phenolphthalein (pH 8.3–10.0) is the correct indicator.'
  },
  {
    id: 'a7_water_of_crystallization',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Analysis',
    marks: 1,
    prompt: '14.30 g of hydrated sodium carbonate (Na₂CO₃·xH₂O) was dissolved in distilled water to make 1.0 dm³ of solution. In a titration, 25.0 cm³ of this solution reacted completely with 25.0 cm³ of 0.100 M HCl (mole ratio 1:2). Determine the value of x (Na=23, C=12, O=16, H=1):',
    options: [
      'x = 2 (Na₂CO₃·2H₂O)',
      'x = 5 (Na₂CO₃·5H₂O)',
      'x = 10 (Na₂CO₃·10H₂O)',
      'x = 7 (Na₂CO₃·7H₂O)'
    ],
    correctIndex: 2,
    explanation: 'Moles HCl = (0.100 × 25)/1000 = 0.0025 mol. Moles Na₂CO₃ in 25 cm³ = 0.00125 mol. Molarity = 0.050 M. RFM = 14.30 / 0.050 = 286 g/mol. RFM of Na₂CO₃ = 106. 18x = 286 - 106 = 180 → x = 10.'
  },
  {
    id: 'a8_percentage_purity',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Analysis',
    marks: 1,
    prompt: 'A 6.00 g sample of impure anhydrous sodium carbonate was dissolved to make 1.0 dm³ of solution. Titration established that the true concentration of pure Na₂CO₃ in the solution was 5.55 g/dm³. What is the percentage purity of the commercial sample?',
    options: [
      '84.5%',
      '90.0%',
      '98.2%',
      '92.5%'
    ],
    correctIndex: 3,
    explanation: 'Percentage Purity = (Mass of pure substance / Total mass of impure sample) × 100% = (5.55 g / 6.00 g) × 100% = 92.5%.'
  },
  {
    id: 'a9_redox_mole_ratio',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'Potassium manganate(VII) oxidizes acidified iron(II) ions according to the ionic equation: MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l). If 20.0 cm³ of 0.020 M KMnO₄ is consumed, how many moles of Fe²⁺ reacted?',
    options: [
      '0.00200 mol',
      '0.00040 mol',
      '0.01000 mol',
      '0.00008 mol'
    ],
    correctIndex: 0,
    explanation: 'Moles of MnO₄⁻ = (0.020 mol/dm³ × 20.0 cm³) / 1000 = 0.00040 mol. Mole ratio MnO₄⁻ : Fe²⁺ = 1 : 5. Moles of Fe²⁺ = 0.00040 × 5 = 0.00200 mol.'
  },
  {
    id: 'a10_technique_error',
    section: 'A',
    sectionTitle: 'Section A: Volumetric Analysis',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'Before commencing a titration, a candidate rinsed the burette with distilled water and immediately filled it with the titrant acid without rinsing with the acid itself. What effect does this procedural error have on the recorded titre?',
    options: [
      'The titre volume will be lower than the true value because the acid is concentrated',
      'The titre volume will be higher than the true value because residual water dilutes the acid',
      'The titre volume remains unchanged because water is neutral',
      'The indicator will fail to change color at the endpoint'
    ],
    correctIndex: 1,
    explanation: 'Residual water inside the burette dilutes the standard acid solution. Consequently, a greater volume of the diluted acid is required to neutralize the fixed moles of base, resulting in an artificially inflated titre volume.'
  },

  // ── SECTION B: Qualitative Inorganic Analysis & Deductions (10 Marks) ──
  {
    id: 'b1_amphoteric_naoh',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Recall',
    marks: 1,
    prompt: 'Addition of 2M Sodium Hydroxide (NaOH) dropwise until in excess to an unknown salt solution produces a white precipitate that dissolves completely in excess to form a colorless solution. Which group of cations is suspected?',
    options: [
      'Ca²⁺, Ba²⁺, or Mg²⁺',
      'Fe²⁺, Fe³⁺, or Cu²⁺',
      'Pb²⁺, Al³⁺, or Zn²⁺',
      'Na⁺, K⁺, or NH₄⁺'
    ],
    correctIndex: 2,
    explanation: 'In KNEC qualitative analysis, Pb²⁺, Al³⁺, and Zn²⁺ form white amphoteric hydroxide precipitates that dissolve in excess NaOH to form tetrahydroxoplumbate(II), tetrahydroxoaluminate, and tetrahydroxozincate complex ions.'
  },
  {
    id: 'b2_differentiate_nh3',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'To distinguish between Pb²⁺, Al³⁺, and Zn²⁺ in solution, aqueous ammonia (NH₃(aq)) is added dropwise until in excess. What observation confirms the presence of Zn²⁺?',
    options: [
      'White precipitate insoluble in excess NH₃(aq)',
      'Blue precipitate turning deep blue in excess NH₃(aq)',
      'Dirty green precipitate turning brown on standing',
      'White precipitate that dissolves in excess NH₃(aq) to form a clear colorless solution'
    ],
    correctIndex: 3,
    explanation: 'Both Pb(OH)₂ and Al(OH)₃ are insoluble in excess aqueous ammonia. However, Zn(OH)₂ dissolves in excess NH₃(aq) to form the soluble tetraamminezinc(II) complex ion, [Zn(NH₃)₄]²⁺.'
  },
  {
    id: 'b3_transition_complex',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'When aqueous ammonia (NH₃) is added dropwise to a solution of Copper(II) Sulfate (CuSO₄), a pale blue precipitate forms initially. On adding excess ammonia, what happens and why?',
    options: [
      'The precipitate dissolves to form a royal deep blue solution due to the formation of the complex ion [Cu(NH₃)₄]²⁺',
      'The precipitate turns black due to formation of copper(II) oxide',
      'The precipitate remains completely insoluble because copper(II) hydroxide is a strong base',
      'Effervescence occurs and ammonia gas is liberated'
    ],
    correctIndex: 0,
    explanation: 'Pale blue Cu(OH)₂(s) dissolves in excess aqueous ammonia to form the soluble tetraamminecopper(II) complex cation [Cu(NH₃)₄]²⁺, producing a characteristic royal deep blue solution.'
  },
  {
    id: 'b4_heat_lead_nitrate',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Analysis',
    marks: 1,
    prompt: 'When a white crystalline salt is heated strongly in a dry test tube, it crackles (decrepitates), yields a brown pungent gas that turns moist blue litmus red, a gas that relights a glowing splint, and leaves a residue that is reddish-brown when hot and yellow when cold. What is the salt?',
    options: [
      'Zinc Carbonate (ZnCO₃)',
      'Lead(II) Nitrate (Pb(NO₃)₂)',
      'Copper(II) Sulfate hydrated (CuSO₄·5H₂O)',
      'Ammonium Chloride (NH₄Cl)'
    ],
    correctIndex: 1,
    explanation: 'Thermal decomposition of Lead(II) Nitrate: 2Pb(NO₃)₂(s) → 2PbO(s) + 4NO₂(g) + O₂(g). NO₂ is acidic brown gas; O₂ relights splint; PbO is reddish-brown hot and yellow cold.'
  },
  {
    id: 'b5_carbonate_test',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'Treatment of an unknown solid with dilute hydrochloric acid produces effervescence of a colorless, odorless gas that forms a white precipitate when bubbled through calcium hydroxide solution (lime water). What anion is present?',
    options: [
      'Sulfate (SO₄²⁻)',
      'Chloride (Cl⁻)',
      'Carbonate (CO₃²⁻) or Hydrogen carbonate (HCO₃⁻)',
      'Nitrate (NO₃⁻)'
    ],
    correctIndex: 2,
    explanation: 'Carbonates (CO₃²⁻) and hydrogen carbonates (HCO₃⁻) react with dilute acids to evolve carbon dioxide gas, CO₂(g): CO₂(g) + Ca(OH)₂(aq) → CaCO₃(s) + H₂O(l).'
  },
  {
    id: 'b6_sulfate_confirmatory',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'Which reagent combination provides an unambiguous confirmatory test for Sulfate ions (SO₄²⁻) in aqueous solution?',
    options: [
      'Silver nitrate (AgNO₃) followed by dilute aqueous ammonia',
      'Potassium iodide (KI) followed by warming',
      'Sodium carbonate (Na₂CO₃) followed by universal indicator',
      'Barium nitrate (Ba(NO₃)₂) or Barium chloride (BaCl₂) acidified with dilute nitric or hydrochloric acid'
    ],
    correctIndex: 3,
    explanation: 'Acidifying with dilute HNO₃ or HCl eliminates carbonates and sulfites (which decompose and dissolve). Barium ions then precipitate with sulfate ions to form dense white insoluble Barium Sulfate: Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s).'
  },
  {
    id: 'b7_chloride_confirmatory',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'Addition of acidified silver nitrate solution to a colorless salt solution gives a white precipitate. What is the identity of this precipitate and what is its behavior in aqueous ammonia?',
    options: [
      'Silver chloride (AgCl), which dissolves readily in aqueous ammonia',
      'Silver iodide (AgI), which is insoluble in aqueous ammonia',
      'Lead chloride (PbCl₂), which dissolves only upon boiling in water',
      'Silver sulfate (Ag₂SO₄), which turns black on exposure to air'
    ],
    correctIndex: 0,
    explanation: 'Cl⁻(aq) + Ag⁺(aq) → AgCl(s) (white precipitate). Silver chloride readily dissolves in dilute aqueous ammonia due to the formation of the diamminesilver(I) complex: AgCl(s) + 2NH₃(aq) → [Ag(NH₃)₂]⁺(aq) + Cl⁻(aq).'
  },
  {
    id: 'b8_sulfite_vs_sulfate',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Analysis',
    marks: 1,
    prompt: 'A student adds Barium chloride solution to two unknown solutions, X and Y. Both form white precipitates. On adding dilute hydrochloric acid, the precipitate in X dissolves with effervescence of a suffocating gas that turns acidified K₂Cr₂O₇ from orange to green, while the precipitate in Y remains completely insoluble. What ions are in X and Y?',
    options: [
      'X contains SO₄²⁻ and Y contains SO₃²⁻',
      'X contains Sulfite (SO₃²⁻) and Y contains Sulfate (SO₄²⁻)',
      'X contains CO₃²⁻ and Y contains Cl⁻',
      'Both X and Y contain Nitrate (NO₃⁻)'
    ],
    correctIndex: 1,
    explanation: 'BaSO₃(s) dissolves in HCl evolving SO₂(g) (which reduces Cr₂O₇²⁻ to green Cr³⁺), confirming Sulfite in X. BaSO₄(s) is completely insoluble in dilute HCl, confirming Sulfate in Y.'
  },
  {
    id: 'b9_lead_ki_test',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Recall',
    marks: 1,
    prompt: 'When Potassium Iodide (KI) solution is added to a solution containing Pb²⁺ ions, what characteristic observation is recorded?',
    options: [
      'A dense white precipitate insoluble upon heating',
      'A blood-red solution of complex ions',
      'A bright yellow precipitate (PbI₂) that dissolves on boiling to form a colorless solution and recrystallizes as golden spangles on cooling',
      'A dark brown precipitate that dissolves in excess KI'
    ],
    correctIndex: 2,
    explanation: 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s) (bright canary yellow precipitate). PbI₂ has retrograde solubility: it dissolves in boiling water to a colorless solution and recrystallizes as shimmering golden spangles (golden rain) upon cooling.'
  },
  {
    id: 'b10_ammonium_sublimation',
    section: 'B',
    sectionTitle: 'Section B: Qualitative Analysis',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'A white solid is warmed with 2M Sodium Hydroxide solution. A colorless gas is evolved that turns moist red litmus paper blue and produces dense white fumes when brought near a glass rod dipped in concentrated hydrochloric acid. What ion is confirmed?',
    options: [
      'Sodium ion (Na⁺)',
      'Calcium ion (Ca²⁺)',
      'Nitrate ion (NO₃⁻)',
      'Ammonium ion (NH₄⁺)'
    ],
    correctIndex: 3,
    explanation: 'NH₄⁺(aq) + OH⁻(aq) → NH₃(g) + H₂O(l). Ammonia gas is basic (turns moist red litmus blue) and reacts with gaseous HCl to form dense white airborne crystals of ammonium chloride: NH₃(g) + HCl(g) → NH₄Cl(s).'
  },

  // ── SECTION C: Thermochemistry & Reaction Kinetics (10 Marks) ───────────
  {
    id: 'c1_disappearing_cross',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Recall',
    marks: 1,
    prompt: 'In the classic kinetics experiment where dilute hydrochloric acid is mixed with sodium thiosulfate (Na₂S₂O₃) solution, what causes the black cross placed underneath the reaction flask to become invisible?',
    options: [
      'Precipitation of fine colloidal sulfur particles [S(s)] that scatter light',
      'Rapid formation of dense brown nitrogen dioxide fumes',
      'Evolution of colorless sulfur dioxide gas creating bubbles',
      'Complete absorption of light by dark green iron complexes'
    ],
    correctIndex: 0,
    explanation: 'Reaction: Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + SO₂(g) + S(s) + H₂O(l). Fine colloidal sulfur particles precipitate suspended in solution, opacifying the mixture until the cross is obscured.'
  },
  {
    id: 'c2_rate_expression',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'In a reaction kinetics experiment at 40 °C, the time taken for a fixed amount of precipitate to form is t = 20.0 seconds. What is the rate of the reaction expressed as 1/t?',
    options: [
      '20.0 s⁻¹',
      '0.050 s⁻¹',
      '0.500 s⁻¹',
      '0.005 s⁻¹'
    ],
    correctIndex: 1,
    explanation: 'Reaction rate is inversely proportional to reaction time: Rate ∝ 1/t = 1 / 20.0 s = 0.050 s⁻¹.'
  },
  {
    id: 'c3_heat_energy_q',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Application',
    marks: 1,
    prompt: '50.0 cm³ of 1.0 M HCl is mixed with 50.0 cm³ of 1.0 M NaOH in a plastic cup calorimeter (total volume = 100.0 cm³, density = 1.0 g/cm³, specific heat capacity c = 4.2 J/g·K). The temperature rises from 21.0 °C to 27.5 °C (ΔT = 6.5 K). Calculate the heat energy released (q = mcΔT):',
    options: [
      '1,365 J',
      '5,460 J',
      '2,730 J (2.73 kJ)',
      '273 J'
    ],
    correctIndex: 2,
    explanation: 'Mass m = 100.0 cm³ × 1.0 g/cm³ = 100.0 g. Heat q = m × c × ΔT = 100.0 g × 4.2 J/g·K × 6.5 K = 2,730 Joules (2.73 kJ).'
  },
  {
    id: 'c4_molar_neutralization',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'In the previous neutralization reaction where 2.73 kJ of heat was released, 0.050 moles of water were formed: H⁺(aq) + OH⁻(aq) → H₂O(l). What is the molar enthalpy of neutralization (ΔH_neut)?',
    options: [
      '+54.6 kJ/mol (endothermic)',
      '-27.3 kJ/mol',
      '-109.2 kJ/mol',
      '-54.6 kJ/mol (exothermic)'
    ],
    correctIndex: 3,
    explanation: 'ΔH = -q / moles = -2.73 kJ / 0.050 mol = -54.6 kJ/mol. Neutralization is an exothermic process (negative sign is mandatory in KNEC marking).'
  },
  {
    id: 'c5_displacement_calorimetry',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Analysis',
    marks: 1,
    prompt: 'When excess zinc powder is added to 50.0 cm³ of 0.200 M Copper(II) Sulfate solution, why must a polystyrene (plastic) cup be used rather than a copper or glass beaker?',
    options: [
      'Polystyrene is a good thermal insulator with negligible heat capacity, minimizing heat loss to surroundings',
      'Polystyrene catalyzes the displacement reaction and speeds up equilibrium',
      'Copper beakers would dissolve in the copper sulfate solution',
      'Glass beakers react with zinc powder to produce silicate precipitates'
    ],
    correctIndex: 0,
    explanation: 'Polystyrene has a very low thermal conductivity and negligible heat capacity, ensuring almost all heat evolved remains within the aqueous solution for accurate ΔT measurement.'
  },
  {
    id: 'c6_concentration_collision',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'According to the Collision Theory, why does increasing the concentration of reactants increase the rate of a chemical reaction?',
    options: [
      'It lowers the activation energy barrier of the reaction',
      'It increases the number of reacting particles per unit volume, leading to a higher frequency of effective collisions',
      'It increases the average kinetic energy and velocity of every molecule',
      'It changes the reaction pathway to make it more exothermic'
    ],
    correctIndex: 1,
    explanation: 'Higher concentration increases particle density per unit volume. This increases the collision frequency between reactant particles, resulting in more effective collisions per unit time.'
  },
  {
    id: 'c7_temperature_maxwell',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'Why does a modest 10 °C rise in temperature approximately double the rate of many chemical reactions?',
    options: [
      'It doubles the total number of molecular collisions per second',
      'It decreases the enthalpy change (ΔH) of the reaction significantly',
      'It dramatically increases the fraction of molecules possessing energy equal to or greater than the activation energy (E ≥ E_a)',
      'It completely eliminates the activation energy barrier'
    ],
    correctIndex: 2,
    explanation: 'According to the Maxwell-Boltzmann distribution, temperature shifts the curve to higher energies, exponentially increasing the proportion of molecules with kinetic energy exceeding the activation energy threshold.'
  },
  {
    id: 'c8_catalyst_mechanism',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Recall',
    marks: 1,
    prompt: 'How does a positive catalyst increase the rate of a chemical reaction without being consumed?',
    options: [
      'By shifting the chemical equilibrium position toward products',
      'By supplying extra thermal energy to reacting molecules',
      'By increasing the overall enthalpy of reaction (ΔH)',
      'By providing an alternative reaction pathway with a lower activation energy'
    ],
    correctIndex: 3,
    explanation: 'A catalyst offers an alternate reaction mechanism with lower activation energy (E_a). A larger fraction of colliding particles now have sufficient energy to react.'
  },
  {
    id: 'c9_surface_area_rates',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'Equal masses (5.00 g) of marble chips (calcium carbonate) and marble powder are reacted separately with excess 2.0 M hydrochloric acid at 25 °C. Which statement is correct?',
    options: [
      'The powdered marble reacts at a faster initial rate because of greater surface area, but both produce the same total volume of CO₂ gas',
      'The marble chips produce a larger total volume of CO₂ because they take longer to react',
      'The powder reacts slower because the particles pack tightly together',
      'The reaction with marble chips has a lower activation energy'
    ],
    correctIndex: 0,
    explanation: 'Subdividing marble into powder creates a vastly larger surface area exposed to acid collisions, greatly accelerating the reaction rate. Because stoichiometry and limiting reagent mass are identical, the final volume of CO₂ produced is the same.'
  },
  {
    id: 'c10_cooling_curve_extrapolate',
    section: 'C',
    sectionTitle: 'Section C: Kinetics & Energetics',
    taxonomy: 'Analysis',
    marks: 1,
    prompt: 'In thermochemical experiments measuring the temperature change of displacement reactions, why do examiners require temperature readings to be recorded every 30 seconds before mixing, and for several minutes after mixing, followed by extrapolation on a graph?',
    options: [
      'To calculate the rate constant of the reaction',
      'To compensate for heat loss to the surroundings and determine the theoretical maximum temperature rise (ΔT) at the time of mixing',
      'To verify that the thermometer calibration is linear',
      'To ensure that all water solvent evaporates completely'
    ],
    correctIndex: 1,
    explanation: 'Extrapolating cooling curve slopes back to the exact minute of reagent addition corrects for cooling losses occurring during the reaction, providing the true theoretical ΔT.'
  },

  // ── SECTION D: Organic Chemistry Qualitative Deductions & Safety (10 Marks) ──
  {
    id: 'd1_flame_test_soot',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'When an unknown organic liquid is ignited on a clean metallic spatula, it burns with a luminous, highly smoky and sooty yellow flame, leaving a black residue. What deduction is most appropriate?',
    options: [
      'The compound is a lower saturated alkanol such as methanol',
      'The compound is a lower alkane with high hydrogen-to-carbon ratio',
      'The compound is unsaturated (contains C=C, C≡C) or aromatic, possessing a high carbon-to-hydrogen ratio',
      'The compound is an inorganic ammonium salt'
    ],
    correctIndex: 2,
    explanation: 'Unsaturated compounds (alkenes, alkynes) and aromatic compounds have a high carbon-to-hydrogen ratio. Incomplete combustion leaves unburnt carbon particles (soot) that glow yellow.'
  },
  {
    id: 'd2_bromine_water_addition',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Recall',
    marks: 1,
    prompt: 'Organic Liquid X rapidly decolorizes reddish-brown Bromine water in the dark without bubbling or evolution of hydrogen bromide fumes. What type of reaction and functional group does this indicate?',
    options: [
      'Free-radical substitution of an alkane',
      'Condensation of an alkanoic acid',
      'Acid-base neutralization of an organic amine',
      'Electrophilic addition across a carbon-carbon double bond (>C=C<) in an alkene'
    ],
    correctIndex: 3,
    explanation: 'Alkenes undergo rapid electrophilic addition across the double bond (C=C) in the dark without needing UV light or catalyst: R—CH=CH—R + Br₂ → R—CHBr—CHBr—R.'
  },
  {
    id: 'd3_kmno4_decolorization',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'Addition of acidified Potassium Manganate(VII) (KMnO₄) to an organic liquid results in rapid discharge of the purple color in the cold. Which of the following functional groups can account for this observation?',
    options: [
      'An alkene (>C=C<) or a primary/secondary alkanol (—OH)',
      'A saturated alkane (C—C)',
      'An ester (—COO—)',
      'A tertiary alkanol that resists oxidation'
    ],
    correctIndex: 0,
    explanation: 'Acidified KMnO₄ is a powerful oxidizing agent. It oxidizes alkenes (to diols) and primary/secondary alkanols (to aldehydes/acids/ketones), during which purple MnO₄⁻ is reduced to colorless Mn²⁺.'
  },
  {
    id: 'd4_dichromate_oxidation',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Recall',
    marks: 1,
    prompt: 'When acidified Potassium Dichromate(VI) (K₂Cr₂O₇) is heated with propan-1-ol in a water bath, what color change is observed and what species is formed?',
    options: [
      'Purple turns colorless due to formation of Mn²⁺',
      'Orange turns green due to reduction of Cr₂O₇²⁻ to Cr³⁺ ions',
      'Green turns yellow due to formation of chromate ions',
      'Blue turns colorless due to precipitation of copper'
    ],
    correctIndex: 1,
    explanation: 'Orange dichromate(VI) ions (Cr₂O₇²⁻) oxidize the alkanol to propanoic acid while being reduced to green chromium(III) ions (Cr³⁺).'
  },
  {
    id: 'd5_nahco3_effervescence',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'An organic liquid produces vigorous effervescence when mixed with solid Sodium Hydrogen Carbonate (NaHCO₃). The gas evolved forms a white precipitate with calcium hydroxide solution. Which functional group is confirmed?',
    options: [
      'Alkanol (—OH)',
      'Alkene (>C=C<)',
      'Carboxylic acid (—COOH)',
      'Alkyl halide (—X)'
    ],
    correctIndex: 2,
    explanation: 'Carboxylic acids (R—COOH) are acidic enough to decompose hydrogen carbonates, liberating carbon dioxide gas: R—COOH + NaHCO₃ → R—COONa + H₂O + CO₂(g).'
  },
  {
    id: 'd6_esterification',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'When ethanoic acid is warmed gently with ethanol in the presence of a few drops of concentrated sulfuric acid and poured into a beaker of cold sodium carbonate solution, a pleasant fruity fragrance is detected. What type of compound was synthesized?',
    options: [
      'An ether',
      'A soap (detergent)',
      'A haloalkane',
      'An ester (ethyl ethanoate)'
    ],
    correctIndex: 3,
    explanation: 'Esterification: CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O. Concentrated H₂SO₄ serves as acid catalyst and dehydrating agent. Esters possess characteristic pleasant, fruity aromas.'
  },
  {
    id: 'd7_ghs_corrosive',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Recall',
    marks: 1,
    prompt: 'A reagent bottle in the chemistry laboratory displays a GHS hazard pictogram showing two test tubes pouring liquid onto a metal surface and a human hand, causing erosion. What does this symbol warn?',
    options: [
      'Corrosive: Causes severe chemical skin burns and serious eye and metal damage',
      'Flammable: Ignites readily in presence of sparks or open flame',
      'Explosive: Unstable substance prone to blast hazards',
      'Toxic: Acute lethal poison if swallowed or inhaled'
    ],
    correctIndex: 0,
    explanation: 'The GHS Corrosive pictogram indicates caustic chemicals (concentrated mineral acids like H₂SO₄, HNO₃, HCl and strong alkalis like NaOH) that destroy living skin tissue and corrode metals.'
  },
  {
    id: 'd8_bunsen_burner_zones',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'Which part of the Bunsen burner flame is the hottest and recommended for heating test tubes and crucibles in practical examinations?',
    options: [
      'The bright yellow luminous tip of the safety flame',
      'The tip of the pale blue inner cone of the non-luminous flame (reaching ~1500 °C)',
      'The dark unburnt gas zone directly above the chimney',
      'The outer blue mantle at the very base near the air hole'
    ],
    correctIndex: 1,
    explanation: 'With the air hole fully open, the roaring non-luminous flame achieves complete combustion. The hottest region is the tip of the pale blue inner cone (~1500 °C).'
  },
  {
    id: 'd9_acid_spill_safety',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Application',
    marks: 1,
    prompt: 'If concentrated sulfuric acid is accidentally spilled on a candidate\'s skin during a laboratory examination, what is the immediate first aid protocol?',
    options: [
      'Neutralize immediately with concentrated sodium hydroxide solution',
      'Cover the area with a dry cloth and wait for medical personnel',
      'Flush the affected skin immediately with copious amounts of running water for at least 15 minutes, then apply sodium hydrogen carbonate solution',
      'Rub the skin vigorously with ethanol to dissolve the acid'
    ],
    correctIndex: 2,
    explanation: 'Immediate copious flushing with running water dissipates heat of hydration and removes acid. A dilute weak base (sodium hydrogen carbonate) can then be safely applied.'
  },
  {
    id: 'd10_heavy_metal_disposal',
    section: 'D',
    sectionTitle: 'Section D: Organic & Safety',
    taxonomy: 'Comprehension',
    marks: 1,
    prompt: 'Why must laboratory wastes containing Lead(II) (Pb²⁺) and Barium (Ba²⁺) ions NEVER be disposed of by pouring them directly down the standard laboratory sink?',
    options: [
      'They react violently with PVC plumbing pipes causing explosions',
      'They immediately evaporate into toxic atmospheric gases',
      'They neutralize the municipal water pH too rapidly',
      'They are toxic heavy metals that accumulate in ecosystems and water supplies; they must be precipitated and collected in dedicated chemical waste containers'
    ],
    correctIndex: 3,
    explanation: 'Lead and barium are non-biodegradable, bioaccumulative heavy metal toxins that contaminate municipal groundwater and aquatic wildlife. They must be precipitated as insoluble carbonates or sulfates and sequestered in designated chemical waste jars.'
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
    let maxA = 0, maxB = 0, maxC = 0, maxD = 0;
    const breakdown = {};

    this.items.forEach(item => {
      const selected = this.userAnswers[item.id];
      const isCorrect = selected === item.correctIndex;
      const awarded = isCorrect ? item.marks : 0;

      if (item.section === 'A') { sA += awarded; maxA += item.marks; }
      else if (item.section === 'B') { sB += awarded; maxB += item.marks; }
      else if (item.section === 'C') { sC += awarded; maxC += item.marks; }
      else if (item.section === 'D') { sD += awarded; maxD += item.marks; }

      breakdown[item.id] = {
        section: item.section,
        taxonomy: item.taxonomy,
        marksAwarded: awarded,
        maxMarks: item.marks,
        selectedOption: selected,
        correctOption: item.correctIndex,
        isCorrect,
        explanation: item.explanation
      };
    });

    const total = parseFloat((sA + sB + sC + sD).toFixed(2));
    const totalMax = maxA + maxB + maxC + maxD || 40.0;
    const percentage = parseFloat(((total / totalMax) * 100).toFixed(2));

    return {
      sectionA: sA,
      sectionB: sB,
      sectionC: sC,
      sectionD: sD,
      maxA: maxA || 10,
      maxB: maxB || 10,
      maxC: maxC || 10,
      maxD: maxD || 10,
      totalScore: total,
      maxScore: totalMax,
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

// ============================================================
//  VirtuLab Kenya — Interactive Step-by-Step Tutorial Engine
//  Brilliant-style guided practice, prediction checkpoints & spotlights
// ============================================================

(function () {
  'use strict';

  // ── TUTORIAL DATA PER DISCIPLINE ───────────────────────────
  const TUTORIALS = {
    titration: {
      id: 'titration',
      title: 'Acid-Base Volumetric Standardisation Tutorial',
      badge: 'KCSE Question 1 · Volumetric Standardisation',
      steps: [
        {
          title: 'Step 1: Inspect Burette & Fill to Zero Mark',
          instruction: 'Observe the 50.0 cm³ glass burette. Ensure the stopcock is closed and fill with standardized Hydrochloric Acid (0.10 M HCl) until the bottom of the curved meniscus sits exactly on the 0.00 cm³ line.',
          targetSelector: '#buretContainer, .burette-viewport, #fillBuretteBtn',
          checkpoint: {
            question: 'Where must you position your eye when reading the burette volume?',
            options: [
              { text: 'Directly level with the bottom of the liquid meniscus', correct: true },
              { text: 'Slightly above the liquid level to see the numbers clearly', correct: false },
              { text: 'Directly level with the top curve of the liquid edges', correct: false }
            ],
            explanation: 'In KCSE volumetric analysis, parallax error is avoided by aligning your eye horizontally with the lowest point of the concave meniscus.'
          },
          hint: 'Click the "Fill Burette" button to prepare your standard acid.'
        },
        {
          title: 'Step 2: Pipette 25.0 cm³ of NaOH & Add Indicator',
          instruction: 'Transfer exactly 25.00 cm³ of unknown Sodium Hydroxide (NaOH) into a clean 250 cm³ conical flask. Add 2–3 drops of Phenolphthalein indicator.',
          targetSelector: '#btnPipetteAliquot, #indicatorSelect',
          checkpoint: {
            question: 'What color does Phenolphthalein turn in alkaline NaOH solution?',
            options: [
              { text: 'Deep Pink / Magenta', correct: true },
              { text: 'Colourless', correct: false },
              { text: 'Orange / Red', correct: false }
            ],
            explanation: 'Phenolphthalein is pink in basic medium (pH > 8.2) and transitions to colourless at the exact neutral equivalence point.'
          },
          hint: 'Select Phenolphthalein from the indicator menu and ensure 2–3 drops are added to the conical flask.'
        },
        {
          title: 'Step 3: Perform Coarse (Rough) Titration Run',
          instruction: 'Open the stopcock to deliver acid steadily while swirling the conical flask continuously. Stop immediately when the pink color just disappears permanently.',
          targetSelector: '#flowControlGroup, #btnOpenStopcock, #btnDropWise',
          checkpoint: {
            question: 'Why is a rough trial titration performed before accurate runs?',
            options: [
              { text: 'To estimate the approximate endpoint volume within ~1 cm³', correct: true },
              { text: 'To warm up the glassware before actual measurements', correct: false },
              { text: 'Because KNEC averages all trials including the rough trial', correct: false }
            ],
            explanation: 'A coarse run gives an approximation so you can deliver rapid stream until 1–2 cm³ before the endpoint during subsequent concordant trials.'
          },
          hint: 'Hold down the Stopcock / Titrate button until the solution transitions from pink to clear.'
        },
        {
          title: 'Step 4: Execute Concordant Accurate Trials',
          instruction: 'Perform Trials 1, 2, and 3 using drop-wise additions near the endpoint. Record your initial and final burette readings to 2 decimal places (ending in .00 or .50).',
          targetSelector: '#titrationTable, #trial1Final',
          checkpoint: {
            question: 'What is the maximum allowed difference between concordant titres in KCSE?',
            options: [
              { text: 'Within ±0.10 cm³ of each other', correct: true },
              { text: 'Within ±1.00 cm³ of each other', correct: false },
              { text: 'Within ±0.50 cm³ of each other', correct: false }
            ],
            explanation: 'KNEC awards full accuracy marks only if selected candidate titres are concordant within ±0.10 cm³.'
          },
          hint: 'Select the concordant trials with ticks to compute your official average titre.'
        },
        {
          title: 'Step 5: Stoichiometric Calculation Walkthrough',
          instruction: 'Use the balanced equation HCl + NaOH → NaCl + H₂O (1:1 molar ratio) to calculate the moles of acid reacted, and determine the exact molarity of the NaOH solution.',
          targetSelector: '#calcSection, #inputMolarity, #btnSubmitLab',
          checkpoint: {
            question: 'If 25.0 cm³ of NaOH reacts with 20.0 cm³ of 0.10 M HCl, what is the molarity of NaOH?',
            options: [
              { text: '0.080 M', correct: true },
              { text: '0.125 M', correct: false },
              { text: '0.050 M', correct: false }
            ],
            explanation: 'Moles of HCl = (0.10 × 20.0)/1000 = 0.0020 mol. Since ratio is 1:1, Moles of NaOH = 0.0020. Molarity = (0.0020 × 1000)/25.0 = 0.080 M.'
          },
          hint: 'Enter your computed molarity and mass concentration into the calculation fields and click Submit for official KNEC grading.'
        }
      ]
    },

    qualitative: {
      id: 'qualitative',
      title: 'Qualitative Inorganic Salt Analysis Tutorial',
      badge: 'KCSE Question 2 · Systematic Salt Deduction',
      steps: [
        {
          title: 'Step 1: Solid Appearance & Water Solubility Test',
          instruction: 'Examine the physical appearance of solid Salt X (crystal form, color). Add 5.0 cm³ of distilled water and shake thoroughly to observe solubility.',
          targetSelector: '#solidAppearanceCard, #btnDissolveSample, .reagent-bench',
          checkpoint: {
            question: 'What does a white crystalline solid that dissolves readily in water to form a colorless solution indicate?',
            options: [
              { text: 'Absence of colored transition metal ions (Cu²⁺, Fe²⁺, Fe³⁺)', correct: true },
              { text: 'Definite presence of Copper(II) ions', correct: false },
              { text: 'The salt is an insoluble carbonate precipitate', correct: false }
            ],
            explanation: 'Colorless solutions typically contain main group metal cations (Zn²⁺, Al³⁺, Pb²⁺, Mg²⁺, Ca²⁺, Na⁺, K⁺, NH₄⁺) rather than transition elements.'
          },
          hint: 'Click "Add Distilled Water" to prepare your aqueous test solution.'
        },
        {
          title: 'Step 2: Flame Emission Test with Nichrome Loop',
          instruction: 'Dip a clean nichrome wire loop into concentrated HCl, touch the solid salt, and place it directly into the non-luminous zone of the Bunsen burner flame.',
          targetSelector: '#btnFlameTest, #flameVisualizer',
          checkpoint: {
            question: 'Which characteristic flame color confirms the presence of Calcium (Ca²⁺) ions?',
            options: [
              { text: 'Brick-red / Orange-red flame', correct: true },
              { text: 'Golden yellow flame', correct: false },
              { text: 'Lilac / Pale violet flame', correct: false },
              { text: 'Apple-green flame', correct: false }
            ],
            explanation: 'Ca²⁺ emits a characteristic brick-red flame, Na⁺ emits golden yellow, K⁺ emits lilac, and Ba²⁺ emits apple-green.'
          },
          hint: 'Select the Flame Test tool to observe the thermal excitation emission color.'
        },
        {
          title: 'Step 3: Drop-wise Aqueous Sodium Hydroxide (NaOH)',
          instruction: 'Add 2–3 drops of aqueous NaOH to the solution, observe precipitate color, then add excess NaOH until the test tube is half full.',
          targetSelector: '#btnReagentNaOH, #testTubeContainer',
          checkpoint: {
            question: 'A white precipitate that dissolves in excess NaOH to form a colorless solution indicates which group of cations?',
            options: [
              { text: 'Zn²⁺, Al³⁺, or Pb²⁺ (Amphoteric hydroxides)', correct: true },
              { text: 'Mg²⁺, Ca²⁺, or Ba²⁺', correct: false },
              { text: 'Fe²⁺ and Fe³⁺', correct: false }
            ],
            explanation: 'Hydroxides of Zn²⁺, Al³⁺, and Pb²⁺ are amphoteric and form soluble complex hydroxo-aluminate, zincate, and plumbate ions in excess strong base.'
          },
          hint: 'Add NaOH dropwise first to observe the precipitate, then click excess to test amphoteric solubility.'
        },
        {
          title: 'Step 4: Confirmatory Aqueous Ammonia (NH₃)',
          instruction: 'To a fresh portion of the salt solution, add aqueous ammonia (NH₃) drop-wise until in excess. This differentiates between Zn²⁺, Al³⁺, and Pb²⁺.',
          targetSelector: '#btnReagentNH3',
          checkpoint: {
            question: 'How do you distinguish Zn²⁺ from Al³⁺ and Pb²⁺ using aqueous ammonia?',
            options: [
              { text: 'Zn(OH)₂ dissolves in excess NH₃ forming [Zn(NH₃)₄]²⁺; Al(OH)₃ and Pb(OH)₂ remain insoluble', correct: true },
              { text: 'Al(OH)₃ dissolves in excess NH₃ while Zn(OH)₂ does not', correct: false },
              { text: 'All three cations form precipitates that remain insoluble in excess NH₃', correct: false }
            ],
            explanation: 'Zinc forms the soluble tetraamminezinc(II) complex [Zn(NH₃)₄]²⁺ in excess ammonia, whereas Al³⁺ and Pb²⁺ hydroxides do not dissolve.'
          },
          hint: 'Add NH₃ to a fresh sample to confirm the exact cation identity.'
        },
        {
          title: 'Step 5: Anion Confirmatory Testing & Final Deduction',
          instruction: 'Acidify a fresh portion with dilute HNO₃, then add aqueous Barium Nitrate (Ba(NO₃)₂) or Silver Nitrate (AgNO₃) to confirm sulfate (SO₄²⁻), sulfite (SO₃²⁻), or chloride (Cl⁻).',
          targetSelector: '#btnReagentBaNO3, #btnReagentAgNO3, #deductionSelect',
          checkpoint: {
            question: 'Which observation confirms the presence of Sulfate (SO₄²⁻) ions with Ba(NO₃)₂?',
            options: [
              { text: 'White precipitate insoluble in dilute nitric acid', correct: true },
              { text: 'White precipitate that dissolves with effervescence in acid', correct: false },
              { text: 'Yellow precipitate soluble in ammonia', correct: false }
            ],
            explanation: 'BaSO₄ is insoluble in dilute HNO₃/HCl, distinguishing it from BaSO₃ and BaCO₃ which dissolve in acid.'
          },
          hint: 'Select your deduced cation and anion in the deduction box and record candidate observations.'
        }
      ]
    },

    rates: {
      id: 'rates',
      title: 'Chemical Kinetics & Reaction Rates Tutorial',
      badge: 'KCSE Practical · Effect of Concentration on Rate',
      steps: [
        {
          title: 'Step 1: Formulate Kinetics Hypothesis',
          instruction: 'In this experiment, Sodium Thiosulphate (Na₂S₂O₃) reacts with Hydrochloric Acid (HCl) to produce colloidal sulfur precipitate: Na₂S₂O₃ + 2HCl → 2NaCl + SO₂ + S(s) + H₂O.',
          targetSelector: '#expSelect, #reagentVolCard',
          checkpoint: {
            question: 'How does increasing the concentration of Na₂S₂O₃ affect the rate of reaction according to Collision Theory?',
            options: [
              { text: 'Increases number of reacting particles per unit volume, leading to higher effective collision frequency', correct: true },
              { text: 'Decreases the activation energy needed for reactant molecules', correct: false },
              { text: 'Increases the average kinetic energy of the reacting particles', correct: false }
            ],
            explanation: 'Higher concentration means more particles in a given volume, increasing the frequency of successful collisions per second.'
          },
          hint: 'Review the chemical equation and concentration variations.'
        },
        {
          title: 'Step 2: Prepare Dilution Series in Conical Flask',
          instruction: 'Measure 50.0 cm³ of Sodium Thiosulphate solution and place the conical flask directly over the white paper with a bold black cross (X) mark.',
          targetSelector: '#flaskContainer, #crossMarkTarget, #btnSetVolume',
          checkpoint: {
            question: 'Why is distilled water added to maintain a constant total volume (e.g. 50 cm³) across different trials?',
            options: [
              { text: 'To ensure the depth of the liquid in the flask remains identical for viewing the cross', correct: true },
              { text: 'To prevent the flask from heating up during the reaction', correct: false },
              { text: 'To stop the reaction from proceeding too quickly', correct: false }
            ],
            explanation: 'Maintaining a constant total volume ensures the light path length from the top to the cross mark remains constant for uniform visual cutoff.'
          },
          hint: 'Place the flask over the cross mark on the workbench.'
        },
        {
          title: 'Step 3: Add Acid & Start Stopwatch Concurrently',
          instruction: 'Add 5.0 cm³ of 2.0 M HCl to the flask, swirl once gently, and immediately start the digital stopwatch. Look vertically downward through the liquid.',
          targetSelector: '#btnStartReaction, #stopwatchDisplay, #btnStopTimer',
          checkpoint: {
            question: 'When should you stop the stopwatch?',
            options: [
              { text: 'The exact instant the black cross is completely obscured by the yellow sulfur precipitate', correct: true },
              { text: 'When gas bubbles stop forming at the surface', correct: false },
              { text: 'After a fixed interval of 60 seconds', correct: false }
            ],
            explanation: 'The endpoint is reached when a fixed amount of sulfur precipitate has formed, completely blocking visibility of the cross mark.'
          },
          hint: 'Click "Start Reaction & Timer" and watch the cross mark gradually fade.'
        },
        {
          title: 'Step 4: Compute Reciprocal Time (1/t) for Rates',
          instruction: 'Record the elapsed time (t in seconds) and compute the reaction rate proxy (1/t in s⁻¹) for each concentration trial.',
          targetSelector: '#ratesTable, #reciprocalCol',
          checkpoint: {
            question: 'If a reaction takes 25 seconds for the cross to disappear, what is the rate (1/t)?',
            options: [
              { text: '0.040 s⁻¹', correct: true },
              { text: '0.250 s⁻¹', correct: false },
              { text: '0.004 s⁻¹', correct: false }
            ],
            explanation: 'Rate = 1/25 = 0.0400 s⁻¹. Higher 1/t values signify a faster reaction rate.'
          },
          hint: 'Log your trial times and inspect the auto-computed 1/t values.'
        },
        {
          title: 'Step 5: Plot Concentration vs 1/t Graph & Deduce Order',
          instruction: 'Plot a graph of 1/t (y-axis) against Volume of Thiosulphate (x-axis). Draw the best straight line through the origin (0,0).',
          targetSelector: '#ratesGraphContainer, #btnSubmitRates',
          checkpoint: {
            question: 'What does a straight-line graph passing through the origin indicate about the reaction order with respect to Thiosulphate?',
            options: [
              { text: 'The reaction is First Order with respect to Thiosulphate (Rate ∝ [Na₂S₂O₃])', correct: true },
              { text: 'The reaction is Zero Order (Rate is independent of concentration)', correct: false },
              { text: 'The reaction is Second Order (Rate ∝ [Na₂S₂O₃]²)', correct: false }
            ],
            explanation: 'A direct linear relationship passing through the origin proves that rate is directly proportional to concentration (First Order).'
          },
          hint: 'Submit your kinetics experiment for automated KNEC marking.'
        }
      ]
    },

    energy: {
      id: 'energy',
      title: 'Thermochemistry & Energy Changes Tutorial',
      badge: 'KCSE Practical · Heat of Neutralization & Displacement',
      steps: [
        {
          title: 'Step 1: Record Steady Initial Temperature (T₁)',
          instruction: 'Transfer 25.0 cm³ of 2.0 M Hydrochloric acid into a plastic calorimeter cup. Place the thermometer and log the temperature every 30 seconds until steady.',
          targetSelector: '#calorimeterCup, #thermometerDisplay, #btnLogT1',
          checkpoint: {
            question: 'Why are plastic polystyrene cups used in thermochemistry experiments instead of glass beakers?',
            options: [
              { text: 'Plastic is a poor conductor of heat, minimizing heat loss to the surroundings', correct: true },
              { text: 'Glass beakers react chemically with hydrochloric acid', correct: false },
              { text: 'Polystyrene cups increase the temperature change of the reaction', correct: false }
            ],
            explanation: 'Plastic cups have low thermal conductivity and negligible heat capacity, preventing heat loss during measurements.'
          },
          hint: 'Record the baseline temperature T₁ before adding the second reagent.'
        },
        {
          title: 'Step 2: Add Reagent & Stir Continuously',
          instruction: 'Add 25.0 cm³ of 2.0 M Sodium Hydroxide (NaOH) or metal powder to the calorimeter, immediately replace the lid, and stir smoothly.',
          targetSelector: '#btnAddReagent, #stirrerControl',
          checkpoint: {
            question: 'Why must the reaction mixture be stirred continuously after mixing?',
            options: [
              { text: 'To ensure uniform temperature distribution throughout the solution', correct: true },
              { text: 'To introduce oxygen from the air into the solution', correct: false },
              { text: 'To prevent the thermometer from touching the bottom', correct: false }
            ],
            explanation: 'Stirring ensures homogeneous heat dissipation so the thermometer records the true maximum bulk temperature.'
          },
          hint: 'Mix the reagents and observe the live temperature graph rise.'
        },
        {
          title: 'Step 3: Determine Maximum Temperature (T₂) & Temperature Rise (ΔT)',
          instruction: 'Observe the digital thermometer until it reaches its highest peak (T₂) before cooling down. Calculate ΔT = T₂ - T₁.',
          targetSelector: '#tempGraphContainer, #inputDeltaT',
          checkpoint: {
            question: 'If T₁ = 22.0°C and peak T₂ = 35.5°C, what is ΔT and what type of reaction is this?',
            options: [
              { text: 'ΔT = +13.5°C; Exothermic reaction (heat released to surroundings)', correct: true },
              { text: 'ΔT = -13.5°C; Endothermic reaction (heat absorbed)', correct: false },
              { text: 'ΔT = +13.5°C; Endothermic reaction', correct: false }
            ],
            explanation: 'A temperature increase (ΔT > 0) indicates heat has been given out to the solution, meaning the chemical reaction is Exothermic.'
          },
          hint: 'Identify the highest point on the temperature-time curve.'
        },
        {
          title: 'Step 4: Calculate Heat Energy Released (q = mcΔT)',
          instruction: 'Calculate heat evolved q = m × c × ΔT, assuming solution density = 1.0 g/cm³ and specific heat capacity c = 4.2 J g⁻¹ K⁻¹.',
          targetSelector: '#calcSectionEnergy, #inputHeatQ',
          checkpoint: {
            question: 'For a total volume of 50.0 cm³ (mass = 50.0 g) and ΔT = 13.5°C, what is the heat released in Joules?',
            options: [
              { text: '2,835 Joules (2.835 kJ)', correct: true },
              { text: '675 Joules (0.675 kJ)', correct: false },
              { text: '5,670 Joules (5.670 kJ)', correct: false }
            ],
            explanation: 'q = m × c × ΔT = 50.0 g × 4.2 J/(g·°C) × 13.5°C = 2835 J = 2.835 kJ.'
          },
          hint: 'Multiply total mass (g) × 4.2 × ΔT.'
        },
        {
          title: 'Step 5: Compute Molar Enthalpy of Neutralization (ΔH)',
          instruction: 'Calculate moles of water formed from reacting volumes, and compute molar enthalpy ΔH = -q / n in kJ/mol with the negative sign for exothermic reaction.',
          targetSelector: '#inputMolarEnthalpy, #btnSubmitEnergy',
          checkpoint: {
            question: 'If 0.050 moles of water are produced releasing 2.835 kJ of heat, what is the molar enthalpy of neutralization ΔH?',
            options: [
              { text: '-56.7 kJ/mol', correct: true },
              { text: '+56.7 kJ/mol', correct: false },
              { text: '-141.75 kJ/mol', correct: false }
            ],
            explanation: 'ΔH = - (2.835 kJ / 0.050 mol) = -56.7 kJ/mol. The standard molar enthalpy of neutralization for strong acid-strong base is approximately -57 kJ/mol.'
          },
          hint: 'Remember to prefix the final value with a minus (-) sign for exothermic enthalpy.'
        }
      ]
    },

    organic: {
      id: 'organic',
      title: 'Organic Chemistry Qualitative Analysis Tutorial',
      badge: 'KCSE Question 3 · Organic Functional Groups',
      steps: [
        {
          title: 'Step 1: Flame Combustion & Ignition Test',
          instruction: 'Place 2–3 drops of organic Liquid Y on a clean metallic spatula and ignite in a Bunsen flame. Observe flame sootiness and residue.',
          targetSelector: '#btnIgnitionTest, #spatulaContainer',
          checkpoint: {
            question: 'What does a yellow, intensely smoky / sooty flame with black residue suggest?',
            options: [
              { text: 'High carbon-to-hydrogen ratio, indicative of unsaturated compounds (alkenes/alkynes) or aromatic structures', correct: true },
              { text: 'A saturated lower alkane like methane or ethane', correct: false },
              { text: 'A completely incombustible carboxylic acid salt', correct: false }
            ],
            explanation: 'Unsaturated and aromatic compounds have a high C:H ratio, leading to incomplete combustion and unburnt carbon soot particles.'
          },
          hint: 'Observe the smoke particles above the ignited spatula.'
        },
        {
          title: 'Step 2: Unsaturation Test with Bromine Water',
          instruction: 'Add 2–3 drops of orange-brown Bromine water (Br₂ / H₂O) to 1.0 cm³ of the organic substance in a dry test tube and shake gently.',
          targetSelector: '#btnReagentBromine, #organicTestTube',
          checkpoint: {
            question: 'What observation confirms the presence of a Carbon-Carbon double bond (C=C)?',
            options: [
              { text: 'Bromine water is rapidly decolored from orange-brown to colorless in the dark', correct: true },
              { text: 'Bromine water turns from orange to deep purple', correct: false },
              { text: 'Dense white fumes of HCl are evolved', correct: false }
            ],
            explanation: 'Alkenes undergo rapid electrophilic addition across the C=C bond to form colorless dibromoalkanes without needing UV light.'
          },
          hint: 'Add bromine water and observe whether the brown color is discharged.'
        },
        {
          title: 'Step 3: Confirmatory Acidified KMnO₄ Test',
          instruction: 'Add 2 drops of purple Acidified Potassium Manganate(VII) (KMnO₄/H⁺) to a fresh portion of the liquid and shake.',
          targetSelector: '#btnReagentKMnO4',
          checkpoint: {
            question: 'What is the color change when acidified KMnO₄ oxidizes an alkene or primary alkanol?',
            options: [
              { text: 'Purple solution turns colorless (decolorized)', correct: true },
              { text: 'Purple solution turns bright yellow', correct: false },
              { text: 'Purple solution turns green precipitate', correct: false }
            ],
            explanation: 'MnO₄⁻ (purple) is reduced to Mn²⁺ (colorless in dilute acidic solution) as it oxidizes unsaturated bonds or primary/secondary alkanols.'
          },
          hint: 'Confirm unsaturation with KMnO₄.'
        },
        {
          title: 'Step 4: Sodium Carbonate (Na₂CO₃) Acidity Test',
          instruction: 'Add a small spatula end of solid Sodium Hydrogen Carbonate (NaHCO₃) or aqueous Na₂CO₃ to test for carboxylic acid (-COOH).',
          targetSelector: '#btnReagentNa2CO3',
          checkpoint: {
            question: 'What observation confirms the presence of an organic Carboxylic Acid (-COOH group)?',
            options: [
              { text: 'Effervescence / bubbling of a colorless gas that forms a white precipitate with lime water (CO₂)', correct: true },
              { text: 'Evolution of a gas that relights a glowing splint', correct: false },
              { text: 'Formation of a blue precipitate', correct: false }
            ],
            explanation: 'Carboxylic acids liberate Carbon(IV) oxide gas when reacted with carbonates: R-COOH + NaHCO₃ → R-COONa + H₂O + CO₂(g).'
          },
          hint: 'Test for effervescence of CO₂ gas.'
        },
        {
          title: 'Step 5: Esterification Test & Sweet-Smelling Odor',
          instruction: 'Warm the organic substance with glacial ethanoic acid and 2 drops of concentrated H₂SO₄, then pour into a beaker of sodium carbonate solution.',
          targetSelector: '#btnEsterification, #deductionCardOrganic',
          checkpoint: {
            question: 'What distinct physical observation confirms the formation of an Ester?',
            options: [
              { text: 'A sweet, pleasant fruity fragrance / perfume scent', correct: true },
              { text: 'A pungent, choking bleach-like odor', correct: false },
              { text: 'Rotten egg smell of hydrogen sulfide', correct: false }
            ],
            explanation: 'Esters have characteristic sweet fruity smells (used as flavorings and perfumes).'
          },
          hint: 'Deduce the final organic family and submit for grading.'
        }
      ]
    },

    gas_prep: {
      id: 'gas_prep',
      title: 'Gas Preparation & Collection Tutorial',
      badge: 'KCSE Form 2–4 Chemistry Practical Skills',
      steps: [
        {
          title: 'Step 1: Choose Reactants & Generator Setup',
          instruction: 'Select suitable solid and liquid reactants in the round-bottom or thistle-funnel generator flask (e.g. CaCO₃ + dilute HCl to prepare Carbon Dioxide, CO₂).',
          targetSelector: '#gasSelect, #generatorCard',
          checkpoint: {
            question: 'Why is dilute Sulfuric acid (H₂SO₄) NOT recommended for preparing CO₂ from Calcium Carbonate chips (CaCO₃)?',
            options: [
              { text: 'Insoluble Calcium Sulfate (CaSO₄) forms an impervious crust over the marble chips, stopping the reaction prematurely', correct: true },
              { text: 'Sulfuric acid reacts too violently and shatters glassware', correct: false },
              { text: 'Sulfuric acid does not react with carbonates', correct: false }
            ],
            explanation: 'CaSO₄ is sparingly soluble and coats the unreacted CaCO₃ chips, preventing further acid contact.'
          },
          hint: 'Select the target gas and review the generator apparatus.'
        },
        {
          title: 'Step 2: Select Appropriate Drying Agent',
          instruction: 'Pass the evolved gas through a suitable wash bottle or U-tube drying agent (Concentrated H₂SO₄, Anhydrous CaCl₂, or Quicklime CaO).',
          targetSelector: '#dryingAgentSelect, #dryingBottleVisual',
          checkpoint: {
            question: 'Which drying agent must NEVER be used to dry basic Ammonia gas (NH₃)?',
            options: [
              { text: 'Concentrated H₂SO₄ or Anhydrous CaCl₂ (because they react chemically with NH₃)', correct: true },
              { text: 'Quicklime / Calcium oxide (CaO)', correct: false },
              { text: 'Fused silica gel', correct: false }
            ],
            explanation: 'Acidic H₂SO₄ neutralizes basic NH₃ to form (NH₄)₂SO₄, and CaCl₂ forms a complex CaCl₂·8NH₃. NH₃ must be dried using basic Calcium Oxide (CaO).'
          },
          hint: 'Match the drying agent chemistry with your gas (acidic/neutral/basic).'
        },
        {
          title: 'Step 3: Select Collection Method',
          instruction: 'Choose the correct delivery method (Downward delivery / upward displacement of air, Downward displacement of air, or Over water).',
          targetSelector: '#collectionSelect, #gasJarContainer',
          checkpoint: {
            question: 'Which method is suitable for collecting Hydrogen gas (H₂)?',
            options: [
              { text: 'Upward delivery (downward displacement of air) or over water, because H₂ is less dense than air and insoluble in water', correct: true },
              { text: 'Downward delivery (upward displacement of air)', correct: false },
              { text: 'Liquefaction under pressure only', correct: false }
            ],
            explanation: 'Hydrogen is the lightest gas (density << air) and practically insoluble in water, making upward delivery or water displacement ideal.'
          },
          hint: 'Select collection method based on density relative to air (28.8 g/mol) and solubility.'
        },
        {
          title: 'Step 4: Execute Confirmatory Chemical Test',
          instruction: 'Test the collected gas in the gas jar using a burning splint, glowing splint, damp litmus paper, or calcium hydroxide (lime water).',
          targetSelector: '#btnTestGas, #gasTestResults',
          checkpoint: {
            question: 'What is the confirmatory test for Oxygen gas (O₂)?',
            options: [
              { text: 'Relights a glowing wooden splint', correct: true },
              { text: 'Extinguishes a burning splint with a "pop" sound', correct: false },
              { text: 'Turns damp blue litmus paper red', correct: false }
            ],
            explanation: 'Oxygen supports combustion and rekindles a glowing splint into flame.'
          },
          hint: 'Apply the gas test and observe the reaction in the gas jar.'
        }
      ]
    },

    solubility: {
      id: 'solubility',
      title: 'Solubility Curves & Crystallization Tutorial',
      badge: 'KCSE Form 4 · Solubility & Fractional Crystallization',
      steps: [
        {
          title: 'Step 1: Weigh Solute & Add Measured Water',
          instruction: 'Weigh 4.00 g of Potassium Chlorate (KClO₃) into a clean, dry boiling tube. Add exactly 20.0 cm³ of distilled water using a burette.',
          targetSelector: '#weighingCard, #btnAddSolute, #inputWaterVol',
          checkpoint: {
            question: 'What is the definition of solubility in chemistry?',
            options: [
              { text: 'Maximum mass of solute in grams that saturates 100 g of solvent at a specific temperature', correct: true },
              { text: 'Total volume of liquid required to dissolve 1 mole of salt', correct: false },
              { text: 'Rate at which crystals dissolve per minute', correct: false }
            ],
            explanation: 'Solubility is expressed as grams of solute per 100 grams of water (g/100g H₂O) at a given temperature.'
          },
          hint: 'Add the initial solute mass and 20 cm³ of water to the tube.'
        },
        {
          title: 'Step 2: Heat Boiling Tube until Solid Completely Dissolves',
          instruction: 'Place the boiling tube in a hot water bath and stir with the thermometer until every trace of solute crystals has completely dissolved.',
          targetSelector: '#btnHeatSample, #waterBathVisual, #tempReadout',
          checkpoint: {
            question: 'Why is a water bath used instead of direct heating with a Bunsen flame?',
            options: [
              { text: 'To ensure uniform, gentle heating and avoid water loss through rapid boiling or tube cracking', correct: true },
              { text: 'Because direct heating changes the chemical formula of potassium chlorate', correct: false },
              { text: 'Because thermometer mercury boils at low temperatures', correct: false }
            ],
            explanation: 'Water bath provides controlled heating without evaporating water, which would alter solvent volume and distort solubility calculations.'
          },
          hint: 'Heat the tube until the solution becomes completely clear.'
        },
        {
          title: 'Step 3: Controlled Cooling & Crystallization Temperature (T_crys)',
          instruction: 'Remove the tube from the water bath and allow it to cool slowly in air while stirring gently. Record the exact temperature at which the first tiny sparkling crystals appear.',
          targetSelector: '#btnCoolSample, #crystallizationAlert, #btnRecordTcrys',
          checkpoint: {
            question: 'What thermodynamic state is reached at the exact crystallization temperature (T_crys)?',
            options: [
              { text: 'The solution is saturated (equilibrium between dissolved ions and solid crystals)', correct: true },
              { text: 'The solution is unsaturated', correct: false },
              { text: 'The solution has completely frozen into ice', correct: false }
            ],
            explanation: 'At T_crys, the solution is saturated with that specific mass of solute dissolved in 20.0 cm³ water.'
          },
          hint: 'Watch for the first appearance of crystal glimmer and record the temperature.'
        },
        {
          title: 'Step 4: Compute Solubility (g / 100 g H₂O) & Repeat',
          instruction: 'Convert mass dissolved in 20.0 cm³ of water to solubility in g / 100 g water: Solubility = (Mass of solute / 20.0) × 100. Repeat for 4 different solute masses.',
          targetSelector: '#solubilityTable, #btnNextTrial',
          checkpoint: {
            question: 'If 5.0 g of salt saturates 20.0 g of water at 60°C, what is its solubility at 60°C?',
            options: [
              { text: '25.0 g / 100 g H₂O', correct: true },
              { text: '10.0 g / 100 g H₂O', correct: false },
              { text: '100.0 g / 100 g H₂O', correct: false }
            ],
            explanation: 'Solubility = (5.0 g / 20.0 g) × 100 = 25.0 g per 100 g of water.'
          },
          hint: 'Add more solute to record the next crystallization point.'
        },
        {
          title: 'Step 5: Plot Solubility Curve & Compute Fractional Crystallization',
          instruction: 'Plot Solubility (g/100g water) on y-axis vs Temperature (°C) on x-axis. Use the curve to determine mass of crystals deposited when a saturated solution is cooled from 80°C to 25°C.',
          targetSelector: '#solubilityGraph, #btnSubmitSolubility',
          checkpoint: {
            question: 'If solubility is 45 g/100g water at 80°C and 15 g/100g water at 25°C, how much solid crystallizes out from 100 g water on cooling from 80°C to 25°C?',
            options: [
              { text: '30 g of crystals', correct: true },
              { text: '60 g of crystals', correct: false },
              { text: '15 g of crystals', correct: false }
            ],
            explanation: 'Mass of crystals deposited = Solubility at T_high - Solubility at T_low = 45 g - 15 g = 30 g.'
          },
          hint: 'Submit your plotted solubility curve for automated KNEC marking.'
        }
      ]
    }
  };

  // ── ENGINE STATE ───────────────────────────────────────────
  let currentDiscipline = 'titration';
  let currentStepIndex = 0;
  let isGuidedMode = false;
  let activeTutorial = null;
  let onStepChangeCallback = null;
  let containerEl = null;

  // ── SOUND & HAPTIC HELPERS ─────────────────────────────────
  function playSuccess() {
    if (window.BrilliantUI && window.BrilliantUI.audio) {
      window.BrilliantUI.audio.playSuccess();
    }
  }

  function playIncorrect() {
    if (window.BrilliantUI && window.BrilliantUI.audio) {
      window.BrilliantUI.audio.playIncorrect();
    }
  }

  function playClick() {
    if (window.BrilliantUI && window.BrilliantUI.audio) {
      window.BrilliantUI.audio.playClick();
    }
  }

  function triggerHaptic(ms = 10) {
    if (window.BrilliantUI && window.BrilliantUI.vibrate) {
      window.BrilliantUI.vibrate(ms);
    }
  }

  // ── SPOTLIGHT HIGHLIGHTING ─────────────────────────────────
  function updateSpotlight(targetSelector) {
    // Remove existing spotlights
    document.querySelectorAll('.tut-spotlight-target').forEach((el) => {
      el.classList.remove('tut-spotlight-target');
    });

    if (!targetSelector) return;

    const selectors = targetSelector.split(',').map((s) => s.trim());
    for (const sel of selectors) {
      const target = document.querySelector(sel);
      if (target && target.offsetParent !== null) {
        target.classList.add('tut-spotlight-target');
        // Smoothly scroll target into view if needed
        try {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
        break;
      }
    }
  }

  // ── RENDER CURRENT STEP ────────────────────────────────────
  function renderStep() {
    if (!containerEl || !activeTutorial) return;

    const totalSteps = activeTutorial.steps.length;
    const step = activeTutorial.steps[currentStepIndex];

    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === totalSteps - 1;

    let checkpointHTML = '';
    if (step.checkpoint) {
      const cp = step.checkpoint;
      const choiceButtons = cp.options.map((opt, idx) => `
        <button type="button" class="tut-choice-btn" data-correct="${opt.correct}" onclick="TutorialEngine.handleChoiceClick(this, ${idx})">
          <span style="font-weight:700; color:var(--b-primary, #0284C7);">${String.fromCharCode(65 + idx)}.</span>
          <span style="flex:1;">${opt.text}</span>
        </button>
      `).join('');

      checkpointHTML = `
        <div class="tut-checkpoint-card">
          <div class="tut-checkpoint-q">
            <span>🤔</span>
            <span>${cp.question}</span>
          </div>
          <div class="tut-choice-grid">
            ${choiceButtons}
          </div>
          <div class="tut-feedback-box" id="tutFeedbackBox"></div>
        </div>
      `;
    }

    containerEl.innerHTML = `
      <div class="tut-banner-wrap">
        <div class="tut-header-row">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="tut-badge-pill">🧭 Guided Tutorial</span>
            <span style="font-size:0.75rem; color:var(--b-text-muted);">${activeTutorial.badge}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="tut-step-counter">Step ${currentStepIndex + 1} of ${totalSteps}</span>
            <button type="button" class="btn-tactile btn-tactile-surface btn-tactile-sm" onclick="TutorialEngine.closeTutorial()" style="padding:4px 10px; font-size:0.75rem;">✕ Exit Guide</button>
          </div>
        </div>

        <!-- Segmented Progress Track -->
        <div id="tutSegmentedProgress" style="margin-bottom:14px;"></div>

        <h3 class="tut-step-title">${step.title}</h3>
        <p class="tut-step-instruction">${step.instruction}</p>

        ${checkpointHTML}

        <div class="tut-actions-row">
          <button type="button" class="tut-hint-btn" onclick="TutorialEngine.toggleHint()">
            <span>💡</span> <span>Need a Hint?</span>
          </button>

          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="btn-tactile btn-tactile-surface btn-tactile-sm" onclick="TutorialEngine.prevStep()" ${isFirst ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
              ← Previous
            </button>
            <button type="button" class="btn-tactile btn-tactile-primary btn-tactile-sm" onclick="TutorialEngine.nextStep()">
              ${isLast ? 'Complete Practical 🎉' : 'Next Step →'}
            </button>
          </div>
        </div>

        <div class="tut-hint-text" id="tutHintText">${step.hint || 'Follow the instructions on screen.'}</div>
      </div>
    `;

    // Render segmented progress bar
    if (window.BrilliantUI && window.BrilliantUI.renderSegmentedProgress) {
      window.BrilliantUI.renderSegmentedProgress('tutSegmentedProgress', totalSteps, currentStepIndex);
    }

    // Apply spotlight
    updateSpotlight(step.targetSelector);

    // Trigger callback if defined
    if (typeof onStepChangeCallback === 'function') {
      onStepChangeCallback(currentStepIndex, step);
    }
  }

  // ── CELEBRATION MODAL ──────────────────────────────────────
  function showCompletionModal() {
    // Remove spotlights
    updateSpotlight(null);

    let modal = document.getElementById('tutCompletionModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tutCompletionModal';
      modal.className = 'tut-modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="tut-modal-card">
        <div style="font-size:2.8rem; margin-bottom:4px;">🧪🏆</div>
        <h2 style="font-family:'Cinzel', serif; font-size:1.4rem; color:var(--b-text, #0F172A); margin:0;">Tutorial Complete!</h2>
        <div class="tut-stars-row">⭐⭐⭐</div>
        <p style="font-size:0.88rem; color:var(--b-text-secondary, #334155); line-height:1.55; margin:10px 0 18px 0;">
          Excellent! You have mastered the core technique and KNEC criteria for <b>${activeTutorial.title}</b>.
        </p>
        <div style="background:rgba(2,132,199,0.08); border-radius:10px; padding:10px 14px; font-size:0.8rem; color:var(--b-primary, #0284C7); font-weight:700; margin-bottom:20px;">
          ✓ Practical skills logged to your Student Mastery Profile
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button type="button" class="btn-tactile btn-tactile-success btn-tactile-full btn-tactile-lg" onclick="TutorialEngine.closeModalAndPractice()">
            Try in Self-Paced Mode 🚀
          </button>
          <a href="home.html" class="btn-tactile btn-tactile-surface btn-tactile-full btn-tactile-sm" style="text-decoration:none; padding:8px 0;">
            ← Return to Student Workstation
          </a>
        </div>
      </div>
    `;

    modal.classList.add('active');
    playSuccess();
    triggerHaptic([30, 60, 30]);

    // Save completion flag in localStorage
    try {
      localStorage.setItem(`vlk_tutorial_${currentDiscipline}_completed`, 'true');
    } catch (e) {}
  }

  // ── PUBLIC API ─────────────────────────────────────────────
  const TutorialEngine = {
    init(options = {}) {
      currentDiscipline = options.discipline || 'titration';
      activeTutorial = TUTORIALS[currentDiscipline] || TUTORIALS.titration;
      onStepChangeCallback = options.onStepChange || null;

      const containerId = options.containerId || 'tutorialDrawer';
      containerEl = document.getElementById(containerId);

      // Check query parameter or explicit guided mode
      const urlParams = new URLSearchParams(window.location.search);
      const studyMode = urlParams.get('studyMode') || urlParams.get('mode');
      isGuidedMode = studyMode === 'guided' || urlParams.get('tutorial') === '1' || options.forceGuided === true;

      if (isGuidedMode && containerEl) {
        containerEl.style.display = 'block';
        currentStepIndex = 0;
        renderStep();
      }
    },

    start(discipline) {
      if (discipline && TUTORIALS[discipline]) {
        currentDiscipline = discipline;
        activeTutorial = TUTORIALS[discipline];
      }
      isGuidedMode = true;
      currentStepIndex = 0;
      if (containerEl) {
        containerEl.style.display = 'block';
        renderStep();
        containerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    isGuided() {
      return isGuidedMode;
    },

    getCurrentStep() {
      return currentStepIndex;
    },

    nextStep() {
      playClick();
      triggerHaptic(10);
      if (!activeTutorial) return;
      if (currentStepIndex < activeTutorial.steps.length - 1) {
        currentStepIndex++;
        renderStep();
      } else {
        showCompletionModal();
      }
    },

    prevStep() {
      playClick();
      triggerHaptic(10);
      if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep();
      }
    },

    setStep(index) {
      if (!activeTutorial) return;
      if (index >= 0 && index < activeTutorial.steps.length) {
        currentStepIndex = index;
        renderStep();
      }
    },

    advanceStep(expectedStepIndex) {
      if (!isGuidedMode) return;
      if (currentStepIndex === expectedStepIndex) {
        playSuccess();
        triggerHaptic([15, 30, 15]);
        this.nextStep();
      }
    },

    handleChoiceClick(btn, choiceIdx) {
      const isCorrect = btn.dataset.correct === 'true';
      const parentCard = btn.closest('.tut-checkpoint-card');
      const allBtns = parentCard.querySelectorAll('.tut-choice-btn');
      const feedbackBox = parentCard.querySelector('#tutFeedbackBox');

      allBtns.forEach((b) => {
        b.disabled = true;
        if (b.dataset.correct === 'true') {
          b.classList.add('correct');
        }
      });

      if (!isCorrect) {
        btn.classList.add('incorrect');
        playIncorrect();
        triggerHaptic(20);
      } else {
        playSuccess();
        triggerHaptic(10);
      }

      if (feedbackBox && activeTutorial.steps[currentStepIndex].checkpoint) {
        const cp = activeTutorial.steps[currentStepIndex].checkpoint;
        feedbackBox.className = `tut-feedback-box show ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackBox.innerHTML = `
          <strong>${isCorrect ? '✓ Correct!' : '✕ Not quite.'}</strong> ${cp.explanation}
        `;
      }
    },

    toggleHint() {
      playClick();
      const hintEl = document.getElementById('tutHintText');
      if (hintEl) {
        hintEl.style.display = hintEl.style.display === 'block' ? 'none' : 'block';
      }
    },

    closeTutorial() {
      playClick();
      isGuidedMode = false;
      updateSpotlight(null);
      if (containerEl) {
        containerEl.style.display = 'none';
      }
    },

    closeModalAndPractice() {
      const modal = document.getElementById('tutCompletionModal');
      if (modal) modal.classList.remove('active');
      this.closeTutorial();
    }
  };

  window.TutorialEngine = TutorialEngine;
})();

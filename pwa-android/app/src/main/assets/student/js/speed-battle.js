// ============================================================
//  VirtuLab Kenya — Chemical Speed Battle & Diagnostic Arena Engine
//  Modern Arcade Gamification, Rich Web Audio FX, Haptics & Precision Timers
// ============================================================

(function() {
  'use strict';

  /* ══════════════════════════════════════
     KCSE CHEMISTRY QUESTIONS POOL (80 HIGH-YIELD KNEC DIAGNOSTIC QUESTIONS)
  ══════════════════════════════════════ */
  const QUESTIONS_POOL = [
    // --- CATION QUALITATIVE ANALYSIS ---
    {
      category: "🔬 Cation Separation",
      q: "Which reagent gives a DEEP BLUE solution with Cu²⁺ ions in excess?",
      options: ["Sodium Hydroxide (NaOH)", "Aqueous Ammonia (NH₃)", "Barium Nitrate (Ba(NO₃)₂)", "Dilute Nitric Acid"],
      ans: 1,
      exp: "Cu²⁺ reacts with excess NH₃(aq) to form the deep blue [Cu(NH₃)₄]²⁺ complex."
    },
    {
      category: "🔬 Cation Separation",
      q: "Al³⁺ and Pb²⁺ both form white precipitates in NaOH soluble in excess. Which reagent distinguishes Pb²⁺ by forming a YELLOW precipitate?",
      options: ["Potassium Iodide (KI)", "Dilute HCl", "Ammonia", "Sodium Sulfate"],
      ans: 0,
      exp: "Pb²⁺ + 2I⁻ → PbI₂ (golden yellow precipitate)."
    },
    {
      category: "🔬 Cation Separation",
      q: "Which cation forms a DIRTY GREEN precipitate with NaOH that turns BROWN on exposure to air?",
      options: ["Iron(II) (Fe²⁺)", "Iron(III) (Fe³⁺)", "Copper(II) (Cu²⁺)", "Chromium(III) (Cr³⁺)"],
      ans: 0,
      exp: "Fe²⁺ forms green Fe(OH)₂, which oxidizes in atmospheric oxygen to brown Fe(OH)₃."
    },
    {
      category: "🔬 Cation Separation",
      q: "Which cation forms a white precipitate with NaOH that is INSOLUBLE in excess, but gives NO precipitate with aqueous NH₃?",
      options: ["Magnesium (Mg²⁺)", "Calcium (Ca²⁺)", "Zinc (Zn²⁺)", "Aluminium (Al³⁺)"],
      ans: 1,
      exp: "Ca²⁺ forms white Ca(OH)₂ with NaOH (insoluble in excess), but does not precipitate with NH₃(aq)."
    },
    {
      category: "🔬 Cation Separation",
      q: "Which amphoteric cation forms a white precipitate with both NaOH and NH₃(aq) that DISSOLVES in excess of BOTH reagents?",
      options: ["Aluminium (Al³⁺)", "Lead(II) (Pb²⁺)", "Zinc (Zn²⁺)", "Magnesium (Mg²⁺)"],
      ans: 2,
      exp: "Zn²⁺ dissolves in excess NaOH as zincate [Zn(OH)₄]²⁻ and in excess NH₃ as [Zn(NH₃)₄]²⁺."
    },
    {
      category: "🔬 Cation Separation",
      q: "What is the color of the precipitate formed when NaOH(aq) is added to a solution containing Fe³⁺ ions?",
      options: ["Dirty green", "Red-brown / Rust-brown", "Pale blue", "Chalky white"],
      ans: 1,
      exp: "Fe³⁺ + 3OH⁻ → Fe(OH)₃(s) red-brown precipitate insoluble in excess NaOH."
    },

    // --- ANIONS & GAS IDENTIFICATION ---
    {
      category: "🧪 Anion Identification",
      q: "A white precipitate insoluble in dilute HNO₃ after adding Ba(NO₃)₂ confirms which anion?",
      options: ["Carbonate (CO₃²⁻)", "Sulfate (SO₄²⁻)", "Chloride (Cl⁻)", "Nitrate (NO₃⁻)"],
      ans: 1,
      exp: "Ba²⁺ + SO₄²⁻ → BaSO₄(s) white precipitate insoluble in dilute HNO₃."
    },
    {
      category: "🧪 Anion Identification",
      q: "Adding AgNO₃ followed by dilute HNO₃ gives a white precipitate. Which ion is confirmed?",
      options: ["Sulfate (SO₄²⁻)", "Chloride (Cl⁻)", "Sulfite (SO₃²⁻)", "Carbonate (CO₃²⁻)"],
      ans: 1,
      exp: "Ag⁺ + Cl⁻ → AgCl(s) white precipitate insoluble in dilute HNO₃."
    },
    {
      category: "🧪 Anion Identification",
      q: "Which anion produces a gas that turns acidified potassium dichromate(VI) from ORANGE to GREEN without a precipitate with Ba(NO₃)₂ in acid?",
      options: ["Sulfite (SO₃²⁻)", "Sulfate (SO₄²⁻)", "Chloride (Cl⁻)", "Nitrate (NO₃⁻)"],
      ans: 0,
      exp: "SO₃²⁻ reacts with acid to release SO₂ gas, which reduces orange Cr₂O₇²⁻ to green Cr³⁺."
    },
    {
      category: "🧪 Anion Identification",
      q: "The 'Brown Ring Test' using concentrated H₂SO₄ and fresh FeSO₄ solution is specific for which ion?",
      options: ["Chloride (Cl⁻)", "Nitrate (NO₃⁻)", "Sulfate (SO₄²⁻)", "Carbonate (CO₃²⁻)"],
      ans: 1,
      exp: "Nitrates form a brown ring of [Fe(H₂O)₅(NO)]SO₄ at the junction of two liquid layers."
    },
    {
      category: "🔥 Gas Identification",
      q: "Which gas turns moist RED litmus paper BLUE?",
      options: ["Carbon Dioxide (CO₂)", "Sulfur Dioxide (SO₂)", "Ammonia Gas (NH₃)", "Chlorine (Cl₂)"],
      ans: 2,
      exp: "Ammonia (NH₃) is the only common alkaline gas tested in KCSE chemistry."
    },
    {
      category: "🔥 Gas Identification",
      q: "Which gas BLEACHES moist colored litmus paper after initially turning blue litmus red?",
      options: ["Carbon Dioxide (CO₂)", "Chlorine Gas (Cl₂)", "Ammonia (NH₃)", "Hydrogen (H₂)"],
      ans: 1,
      exp: "Chlorine forms hypochlorous acid (HOCl) in water, which acts as a powerful bleaching agent."
    },
    {
      category: "🔥 Gas Identification",
      q: "A colorless gas that forms a white precipitate with calcium hydroxide (lime water) is:",
      options: ["Carbon Dioxide (CO₂)", "Oxygen (O₂)", "Nitrogen Dioxide (NO₂)", "Sulfur Dioxide (SO₂)"],
      ans: 0,
      exp: "CO₂ + Ca(OH)₂ → CaCO₃(s) white precipitate + H₂O."
    },
    {
      category: "🔥 Gas Identification",
      q: "Which gas burns with a characteristic 'POP' sound when a burning splint is introduced?",
      options: ["Oxygen (O₂)", "Hydrogen Gas (H₂)", "Carbon Monoxide (CO)", "Methane (CH₄)"],
      ans: 1,
      exp: "Hydrogen gas rapidly combusts in air with a small explosive pop sound."
    },
    {
      category: "🔥 Gas Identification",
      q: "Which gas RELIGHTS a glowing wooden splint?",
      options: ["Nitrogen (N₂)", "Oxygen Gas (O₂)", "Carbon Dioxide (CO₂)", "Ammonia (NH₃)"],
      ans: 1,
      exp: "Oxygen supports combustion vigorously and relights a glowing wooden splint."
    },

    // --- FLAME TESTS ---
    {
      category: "🔥 Flame Emission Tests",
      q: "What characteristic flame color is produced by Potassium (K⁺) ions in a non-luminous flame?",
      options: ["Golden yellow", "Lilac / Purple", "Brick red", "Apple green"],
      ans: 1,
      exp: "Potassium ions emit a characteristic lilac / pale purple flame."
    },
    {
      category: "🔥 Flame Emission Tests",
      q: "What characteristic flame color confirms the presence of Sodium (Na⁺) ions?",
      options: ["Persistent Golden Yellow", "Lilac", "Crimson Red", "Blue-Green"],
      ans: 0,
      exp: "Sodium ions emit an intense, persistent golden yellow flame."
    },
    {
      category: "🔥 Flame Emission Tests",
      q: "Which cation gives a BRICK-RED flame in a non-luminous Bunsen burner flame?",
      options: ["Calcium (Ca²⁺)", "Barium (Ba²⁺)", "Copper (Cu²⁺)", "Sodium (Na⁺)"],
      ans: 0,
      exp: "Calcium ions emit a distinct brick-red / orange-red flame."
    },
    {
      category: "🔥 Flame Emission Tests",
      q: "Which metal ion produces an APPLE-GREEN flame when introduced to a Bunsen flame?",
      options: ["Copper (Cu²⁺)", "Barium (Ba²⁺)", "Potassium (K⁺)", "Lead (Pb²⁺)"],
      ans: 1,
      exp: "Barium compounds produce a characteristic apple-green flame."
    },
    {
      category: "🔥 Flame Emission Tests",
      q: "Which acid is used to clean the glass rod / apparatus before performing a flame test?",
      options: ["Dilute Sulfuric Acid", "Concentrated Hydrochloric Acid (HCl)", "Dilute Nitric Acid", "Acetic Acid"],
      ans: 1,
      exp: "Concentrated HCl converts metallic impurities into volatile metal chlorides that burn off cleanly."
    },

    // --- VOLUMETRIC ANALYSIS (TITRATION) ---
    {
      category: "⚖️ Volumetric Titration",
      q: "Which indicator turns PINK/MAGENTA in basic solution (pH > 8.3)?",
      options: ["Methyl Orange", "Phenolphthalein", "Litmus Paper", "Universal Indicator"],
      ans: 1,
      exp: "Phenolphthalein is colorless in acid and intense pink in alkaline solution."
    },
    {
      category: "⚖️ Volumetric Titration",
      q: "What is the color transition of Methyl Orange at the endpoint when titrating acid into a base?",
      options: ["Yellow to Orange/Pink", "Pink to Colorless", "Blue to Red", "Colorless to Yellow"],
      ans: 0,
      exp: "Methyl orange changes from yellow in base to an orange/pink endpoint in acid."
    },
    {
      category: "⚖️ Volumetric Precision",
      q: "What observation indicates concordant titres in KCSE Volumetric Analysis?",
      options: ["Readings within ±0.20 cm³ of each other", "Readings with exact same indicator color", "Readings taking 5 minutes each", "Readings with 50 cm³ total volume"],
      ans: 0,
      exp: "KNEC rules require concordant titre values to fall strictly within ±0.20 cm³."
    },
    {
      category: "⚖️ Volumetric Titration",
      q: "How should burette readings be recorded according to KNEC KCSE examination standards?",
      options: ["To 1 decimal place", "To 2 decimal places (ending in .00 or .05 / .0 / .5)", "To nearest whole number", "To 3 decimal places"],
      ans: 1,
      exp: "Burette readings in KCSE must be recorded to 2 decimal places with the second digit being 0 or 5."
    },
    {
      category: "⚖️ Volumetric Titration",
      q: "Which apparatus is designed to deliver an EXACT, fixed volume of liquid (e.g. 25.0 cm³)?",
      options: ["Measuring Cylinder", "Volumetric Pipette", "Conical Flask", "Beaker"],
      ans: 1,
      exp: "A volumetric pipette is calibrated to accurately deliver a single fixed volume (e.g. 25.0 cm³)."
    },
    {
      category: "⚖️ Volumetric Titration",
      q: "Which compound is widely used as a primary standard base because it can be obtained in high purity and is non-deliquescent?",
      options: ["Sodium Hydroxide (NaOH)", "Anhydrous Sodium Carbonate (Na₂CO₃)", "Potassium Hydroxide (KOH)", "Aqueous Ammonia"],
      ans: 1,
      exp: "Anhydrous Na₂CO₃ is stable, pure, and not hygroscopic, making it an ideal primary standard."
    },
    {
      category: "⚖️ Volumetric Titration",
      q: "Why should you NEVER rinse a burette with distilled water just before filling it with acid?",
      options: ["It causes an explosion", "It dilutes the acid and alters concentration", "It breaks the glass barrel", "It changes the indicator color"],
      ans: 1,
      exp: "Water droplets inside the burette dilute the titrant solution, giving inaccurate higher titres."
    },

    // --- ORGANIC QUALITATIVE CHEMISTRY ---
    {
      category: "⚗️ Organic Chemistry",
      q: "Which reagent decolorizes RAPIDLY from reddish-brown to colorless with Alkenes without heating?",
      options: ["Bromine Water (Br₂(aq))", "Sodium Carbonate", "Barium Chloride", "Silver Nitrate"],
      ans: 0,
      exp: "Bromine water undergoes rapid electrophilic addition across the C=C double bond."
    },
    {
      category: "⚗️ Organic Chemistry",
      q: "Adding Sodium Carbonate (Na₂CO₃) to an organic liquid produces effervescence. What functional group is present?",
      options: ["Alkanol (-OH)", "Carboxylic Acid (-COOH)", "Alkene (C=C)", "Ester (-COOR)"],
      ans: 1,
      exp: "Carboxylic acids (-COOH) react with carbonates to liberate CO₂ gas."
    },
    {
      category: "⚗️ Organic Oxidation",
      q: "What color shift occurs when Acidified Potassium Dichromate(VI) oxidizes a Primary Alcohol?",
      options: ["Purple to Colorless", "Orange to Green", "Blue to Pink", "Yellow to Brown"],
      ans: 1,
      exp: "K₂Cr₂O₇/H⁺ shifts from orange (Cr₂O₇²⁻) to emerald green (Cr³⁺)."
    },
    {
      category: "⚗️ Organic Chemistry",
      q: "What type of flame indicates a high carbon-to-hydrogen (C:H) ratio such as in unsaturated alkenes or arenes?",
      options: ["Clear blue non-luminous flame", "Luminous yellow sooty / smoky flame", "Green roaring flame", "Colorless invisible flame"],
      ans: 1,
      exp: "High C:H ratio leads to incomplete combustion and unburnt carbon particles glowing as soot."
    },
    {
      category: "⚗️ Organic Chemistry",
      q: "Warming an alkanol with ethanoic acid in the presence of concentrated H₂SO₄ produces a sweet fruity smell. This reaction is:",
      options: ["Saponification", "Esterification", "Neutralization", "Polymerization"],
      ans: 1,
      exp: "Alkanol + Carboxylic Acid ⇌ Ester + Water in the presence of concentrated H₂SO₄ catalyst."
    },
    {
      category: "⚗️ Organic Chemistry",
      q: "Which reagent is decolourized from PURPLE to COLORLESS by unsaturated hydrocarbons (alkenes/alkynes)?",
      options: ["Acidified Potassium Manganate(VII) (KMnO₄)", "Sodium Chloride", "Copper(II) Sulfate", "Iron(III) Chloride"],
      ans: 0,
      exp: "Acidified KMnO₄ oxidizes C=C double bonds while MnO₄⁻ is reduced to colorless Mn²⁺."
    },
    {
      category: "⚗️ Organic Chemistry",
      q: "Why is a water bath used when warming organic liquids like ethanol during esterification?",
      options: ["Ethanol is non-polar", "Ethanol is highly flammable", "Water dissolves the ester", "Bunsen burners do not produce heat"],
      ans: 1,
      exp: "Ethanol has a low boiling point and is highly flammable; heating directly over flame is a fire hazard."
    },

    // --- THERMOCHEMISTRY & ENERGY CHANGES ---
    {
      category: "🌡️ Energy Changes",
      q: "In calculating heat change (ΔH = mcΔT), what does 'c' represent in KCSE practical calculations?",
      options: ["Concentration of acid", "Specific heat capacity of water (4.2 J g⁻¹ K⁻¹)", "Calorimeter constant", "Combustion coefficient"],
      ans: 1,
      exp: "c is the specific heat capacity of the aqueous solution, taken as 4.2 J g⁻¹ °C⁻¹."
    },
    {
      category: "🌡️ Energy Changes",
      q: "Why are polystyrene (plastic) cups used as calorimeters instead of glass beakers in thermochemistry?",
      options: ["Plastic does not melt", "Plastic is a good thermal insulator with negligible heat capacity", "Plastic reflects light", "Plastic reacts with acid"],
      ans: 1,
      exp: "Polystyrene minimizes heat loss to surroundings and absorbs negligible heat from the reaction."
    },
    {
      category: "🌡️ Energy Changes",
      q: "What is the theoretical value for the enthalpy of neutralization of ANY strong acid with ANY strong base?",
      options: ["-28.5 kJ/mol", "-57.1 kJ/mol (or ~ -57.2 kJ/mol)", "-114.2 kJ/mol", "+57.1 kJ/mol"],
      ans: 1,
      exp: "Strong acid-strong base neutralization is essentially H⁺(aq) + OH⁻(aq) → H₂O(l) with ΔH ≈ -57.1 kJ/mol."
    },
    {
      category: "🌡️ Energy Changes",
      q: "On a temperature-time cooling curve in displacement reactions, why is the curve extrapolated backwards?",
      options: ["To find boiling point", "To correct for heat lost to surroundings before maximum temperature is reached", "To calculate activation energy", "To find reaction rate"],
      ans: 1,
      exp: "Extrapolation compensates for heat lost to the surroundings during mixing."
    },
    {
      category: "🌡️ Energy Changes",
      q: "Adding zinc powder to copper(II) sulfate causes the temperature to rise, a brown solid to deposit, and:",
      options: ["The blue color of the solution to fade/disappear", "A green solution to form", "A gas to be evolved", "A yellow precipitate to form"],
      ans: 0,
      exp: "Zn displaces Cu²⁺ ions; as blue Cu²⁺ ions are reduced to brown Cu(s), the blue solution turns colorless."
    },

    // --- RATES OF REACTION (CHEMICAL KINETICS) ---
    {
      category: "⏱️ Reaction Rates",
      q: "In the sodium thiosulfate (Na₂S₂O₃) and HCl reaction, what causes the black cross to disappear?",
      options: ["Formation of a dark solution", "Precipitation of fine yellow solid sulfur (S(s))", "Evolution of dense black smoke", "Formation of NaCl precipitate"],
      ans: 1,
      exp: "Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl + H₂O + SO₂ + S(s); the colloidal yellow sulfur obscures the cross."
    },
    {
      category: "⏱️ Reaction Rates",
      q: "How is the rate of reaction related to the time (t) taken for a reaction to complete?",
      options: ["Rate is directly proportional to time (t)", "Rate is inversely proportional to time (Rate ∝ 1/t)", "Rate = t²", "Rate has no relationship with time"],
      ans: 1,
      exp: "The shorter the time taken, the faster the reaction; therefore Rate ∝ 1/t."
    },
    {
      category: "⏱️ Reaction Rates",
      q: "Which catalyst is used to accelerate the decomposition of hydrogen peroxide (H₂O₂) to produce oxygen gas?",
      options: ["Manganese(IV) Oxide (MnO₂)", "Vanadium(V) Oxide (V₂O₅)", "Iron fillings", "Copper powder"],
      ans: 0,
      exp: "Black MnO₂ powder catalyzes 2H₂O₂ → 2H₂O + O₂ rapidly at room temperature."
    },
    {
      category: "⏱️ Reaction Rates",
      q: "Why does increasing the surface area (e.g. using powder instead of marble chips) increase reaction rate?",
      options: ["It lowers activation energy", "It increases frequency of effective collisions between reactant particles", "It raises temperature", "It increases mass of reactants"],
      ans: 1,
      exp: "More surface area exposes more particles for collision per unit time."
    },
    {
      category: "⏱️ Reaction Rates",
      q: "Which apparatus is most accurate for measuring the volume of gas evolved over time in a kinetics experiment?",
      options: ["Gas Syringe", "Conical Flask", "Beaker", "Boiling Tube"],
      ans: 0,
      exp: "A graduated gas syringe allows precise reading of gas volume collected at regular time intervals."
    },

    // --- INDUSTRIAL PROCESSES ---
    {
      category: "🏭 Industrial Processes",
      q: "Which catalyst and optimum conditions are employed in the industrial Haber Process for synthesizing Ammonia (N₂ + 3H₂ ⇌ 2NH₃)?",
      options: ["Finely divided Iron, 450–500 °C, 200 atm", "Vanadium(V) Oxide, 450 °C, 1 atm", "Platinum gauze, 900 °C, 5 atm", "Nickel catalyst, 150 °C, 10 atm"],
      ans: 0,
      exp: "The Haber process uses finely divided iron catalyst at 450–500 °C and ~200 atmospheres pressure to balance reaction rate and exothermic equilibrium yield."
    },
    {
      category: "🏭 Industrial Processes",
      q: "In the Contact Process for sulfuric acid manufacture, what catalyst facilitates the oxidation of SO₂ to SO₃ (2SO₂ + O₂ ⇌ 2SO₃)?",
      options: ["Manganese(IV) oxide (MnO₂)", "Vanadium(V) oxide (V₂O₅)", "Platinized asbestos", "Iron filings"],
      ans: 1,
      exp: "Vanadium(V) oxide (V₂O₅) is the catalyst operated at 450 °C and 1–2 atmospheres."
    },
    {
      category: "🏭 Industrial Processes",
      q: "Which three primary raw materials are fed into the Solvay Tower for the industrial manufacture of Sodium Carbonate?",
      options: ["Brine (NaCl), Limestone (CaCO₃), Ammonia (NH₃)", "Sodium hydroxide, Carbon dioxide, Sand", "Sulfur, Air, Water", "Gypsum, Coal, Nitric acid"],
      ans: 0,
      exp: "Solvay process raw materials are ammoniated brine (NaCl + NH₃) and carbon dioxide generated by thermally decomposing limestone (CaCO₃)."
    },
    {
      category: "🏭 Industrial Processes",
      q: "In the Hall-Héroult electrolytic extraction of aluminium, why is molten Cryolite (Na₃AlF₆) added to purified bauxite (Al₂O₃)?",
      options: ["To act as a reducing agent", "To lower the melting point from ~2050 °C to ~950 °C and improve electrical conductivity", "To prevent the carbon anodes from burning", "To react with iron impurities to form slag"],
      ans: 1,
      exp: "Pure Al₂O₃ melts at over 2050 °C. Dissolving it in molten cryolite lowers the operating temperature to ~950 °C, drastically reducing energy costs."
    },
    {
      category: "🏭 Industrial Processes",
      q: "What is the primary role of Limestone (CaCO₃) added into the blast furnace during the smelting of iron ore?",
      options: ["To serve as the main reducing fuel", "To remove acidic silica (SiO₂) impurities by forming molten calcium silicate slag (CaSiO₃)", "To oxidize iron to iron(III) oxide", "To lower the temperature of the blast furnace"],
      ans: 1,
      exp: "CaCO₃ decomposes to CaO, which acts as a basic flux reacting with acidic sand impurities: CaO(s) + SiO₂(s) → CaSiO₃(l) (slag)."
    },
    {
      category: "🏭 Industrial Processes",
      q: "In the Frasch process for underground sulfur mining, what is the role of superheated water pumped at 170 °C under 10 atm pressure?",
      options: ["To oxidize sulfur to sulfur dioxide", "To dissolve sulfur to form hydrosulfuric acid", "To melt the underground sulfur deposit (m.p. ~115 °C)", "To cool the drill pipes"],
      ans: 2,
      exp: "Sulfur has a low melting point (~115 °C) and is insoluble in water. Superheated water (170 °C) melts the sulfur, which is then forced up by compressed air."
    },

    // --- ELECTROCHEMISTRY & REDOX ---
    {
      category: "⚡ Electrochemistry",
      q: "During the electrolysis of concentrated sodium chloride solution (brine) using inert carbon electrodes, what gas is liberated at the ANODE?",
      options: ["Hydrogen gas (H₂)", "Oxygen gas (O₂)", "Chlorine gas (Cl₂)", "Sodium vapor"],
      ans: 2,
      exp: "At the anode, chloride ions (Cl⁻) are oxidized in preference to hydroxide ions due to high concentration: 2Cl⁻(aq) → Cl₂(g) + 2e⁻."
    },
    {
      category: "⚡ Electrochemistry",
      q: "In the electrolytic refining of blister copper, which setup correctly produces high-purity cathode copper?",
      options: ["Anode: Pure copper; Cathode: Impure copper; Electrolyte: Dilute HCl", "Anode: Impure blister copper; Cathode: Pure copper strip; Electrolyte: Aqueous CuSO₄", "Anode: Graphite; Cathode: Impure copper; Electrolyte: Molten NaCl", "Anode: Pure copper; Cathode: Platinum; Electrolyte: Water"],
      ans: 1,
      exp: "Impure copper anode oxidizes (Cu → Cu²⁺ + 2e⁻) and dissolves; pure copper cations reduce onto the pure copper cathode (Cu²⁺ + 2e⁻ → Cu)."
    },
    {
      category: "⚡ Electrochemistry",
      q: "Given the standard electrode potentials: Zn²⁺/Zn = -0.76 V and Cu²⁺/Cu = +0.34 V. What is the standard electromotive force (E°_cell) of the Daniell cell?",
      options: ["+1.10 V [E° = +0.34 - (-0.76)]", "-0.42 V", "+0.42 V", "-1.10 V"],
      ans: 0,
      exp: "E°_cell = E°_reduction(cathode) - E°_reduction(anode) = +0.34 V - (-0.76 V) = +1.10 V."
    },
    {
      category: "⚡ Electrochemistry",
      q: "Why are underground iron oil pipelines connected at intervals to buried blocks of Magnesium metal (sacrificial protection)?",
      options: ["Magnesium is less reactive and insulates the iron", "Magnesium has a more negative electrode potential, so it oxidizes preferentially, protecting the iron", "Magnesium forms a magnetic shield around the pipe", "Magnesium absorbs all moisture from the surrounding soil"],
      ans: 1,
      exp: "Magnesium is more electropositive than iron (Mg²⁺/Mg = -2.37 V vs Fe²⁺/Fe = -0.44 V) and corrodes sacrifices itself to supply electrons to the iron pipe."
    },
    {
      category: "⚡ Electrochemistry",
      q: "What is the oxidation state of Chromium in the dichromate ion (Cr₂O₇²⁻)?",
      options: ["+3", "+7", "+6", "+12"],
      ans: 2,
      exp: "2(Cr) + 7(-2) = -2 → 2Cr - 14 = -2 → 2Cr = +12 → Cr = +6."
    },
    {
      category: "⚡ Electrochemistry",
      q: "Which two conditions are simultaneously required for the atmospheric rusting of iron to occur?",
      options: ["Oxygen and Carbon dioxide", "Water (moisture) and Oxygen (air)", "Nitrogen and Sunlight", "Acidic fumes and Hydrogen gas"],
      ans: 1,
      exp: "Rusting requires both water (moisture) and oxygen (air) to form hydrated iron(III) oxide: 4Fe + 3O₂ + 2xH₂O → 2Fe₂O₃·xH₂O."
    },

    // --- CHEMICAL EQUILIBRIUM ---
    {
      category: "⚖️ Equilibrium",
      q: "Consider the Haber equilibrium: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH = -92 kJ/mol). What effect does INCREASING pressure have on the equilibrium position?",
      options: ["Shifts to the right (forward), increasing ammonia yield", "Shifts to the left (reverse), decreasing ammonia yield", "No effect because pressure only alters reaction rate", "Decreases the equilibrium constant K_c"],
      ans: 0,
      exp: "According to Le Chatelier's principle, increasing pressure shifts equilibrium toward the side with fewer moles of gas (4 moles on left → 2 moles on right)."
    },
    {
      category: "⚖️ Equilibrium",
      q: "In the exothermic Contact stage: 2SO₂(g) + O₂(g) ⇌ 2SO₃(g) (ΔH = -197 kJ/mol), why is the reaction operated at 450 °C rather than 200 °C?",
      options: ["To shift the equilibrium further to the right", "As a compromise: lower temperatures favor higher equilibrium yield but make the reaction rate uneconomically slow", "Because V₂O₅ catalyst is destroyed below 400 °C", "To decompose unwanted SO₃ gas"],
      ans: 1,
      exp: "While lower temperatures favor exothermic yield, 450 °C is an optimum compromise to achieve a rapid commercial rate of reaction with the catalyst."
    },
    {
      category: "⚖️ Equilibrium",
      q: "What effect does adding a positive catalyst have on the position of a reversible chemical equilibrium and its equilibrium constant (K_c)?",
      options: ["Shifts equilibrium to the products and increases K_c", "Shifts equilibrium to reactants and decreases K_c", "It does not alter the equilibrium position or K_c; it only accelerates the rate of reaching equilibrium", "Doubles the equilibrium constant K_c"],
      ans: 2,
      exp: "A catalyst speeds up both forward and backward reaction rates equally by lowering the activation energy barrier for both pathways."
    },
    {
      category: "⚖️ Equilibrium",
      q: "In the chromate-dichromate equilibrium: 2CrO₄²⁻(aq) [yellow] + 2H⁺(aq) ⇌ Cr₂O₇²⁻(aq) [orange] + H₂O(l), what color change is observed when dilute sodium hydroxide (NaOH) is added?",
      options: ["Orange turns to yellow", "Yellow turns to orange", "Solution turns dark green", "A white precipitate forms"],
      ans: 0,
      exp: "Added OH⁻ reacts with and removes H⁺ ions, shifting the equilibrium to the left to replace H⁺, turning orange dichromate into yellow chromate."
    },

    // --- GAS PREPARATION & DRYING ---
    {
      category: "💨 Gas Preparation",
      q: "Which drying agent MUST be used to dry Ammonia gas (NH₃) in the laboratory?",
      options: ["Concentrated Sulfuric Acid (H₂SO₄)", "Anhydrous Calcium Chloride (CaCl₂)", "Quicklime / Calcium Oxide (CaO)", "Phosphorus(V) Oxide (P₄O₁₀)"],
      ans: 2,
      exp: "Ammonia is a basic gas. It reacts with acidic conc. H₂SO₄ to form (NH₄)₂SO₄ and forms a complex CaCl₂·8NH₃ with CaCl₂. Quicklime (CaO) is basic and dries NH₃ without reacting."
    },
    {
      category: "💨 Gas Preparation",
      q: "Which drying agent is universally employed for drying moist Chlorine gas (Cl₂)?",
      options: ["Concentrated Sulfuric Acid (H₂SO₄)", "Calcium Oxide (CaO)", "Aqueous Sodium Hydroxide", "Iron filings"],
      ans: 0,
      exp: "Chlorine is an acidic gas and is dried by bubbling through concentrated sulfuric acid. CaO and NaOH would neutralize and absorb the chlorine."
    },
    {
      category: "💨 Gas Preparation",
      q: "How is Carbon(II) Oxide (CO) prepared in the laboratory by dehydration?",
      options: ["Dehydration of methanoic acid (HCOOH) using concentrated H₂SO₄", "Burning carbon in excess air", "Reacting calcium carbonate with dilute nitric acid", "Electrolysis of aqueous sodium carbonate"],
      ans: 0,
      exp: "HCOOH(l) + conc. H₂SO₄ → CO(g) + H₂O(absorbed by acid). The acid removes water from methanoic acid."
    },
    {
      category: "💨 Gas Preparation",
      q: "Why is dilute NITRIC acid (HNO₃) NEVER used in the laboratory preparation of Hydrogen gas by reacting with zinc metal?",
      options: ["Nitric acid does not react with zinc", "Nitric acid is a powerful oxidizing agent that oxidizes hydrogen gas to water (H₂O) while forming oxides of nitrogen", "Nitric acid forms an insoluble passivating coat of zinc nitrate", "The reaction is too violent and causes immediate explosion"],
      ans: 1,
      exp: "Dilute HNO₃ oxidizes liberated hydrogen to water and is itself reduced to nitrogen monoxide (NO) or nitrogen dioxide (NO₂)."
    },
    {
      category: "💨 Gas Preparation",
      q: "What characteristic test confirms the presence of poisonous Hydrogen Sulfide gas (H₂S)?",
      options: ["Relights a glowing splint", "Turns moist red litmus blue", "Rotten-egg odor and turns moist lead(II) ethanoate paper shiny black (PbS)", "Forms a white precipitate with calcium hydroxide"],
      ans: 2,
      exp: "H₂S has a pungent rotten egg smell and reacts with Pb²⁺ on lead(II) ethanoate paper: Pb²⁺(aq) + H₂S(g) → PbS(s) (black precipitate) + 2H⁺(aq)."
    },

    // --- PERIODIC TABLE & TRENDS ---
    {
      category: "📊 Periodic Trends",
      q: "Across Period 3 of the Periodic Table from Sodium to Chlorine, what happens to the atomic radius and why?",
      options: ["Increases, because more electron energy levels are being added", "Decreases, because nuclear charge (number of protons) increases while electron shielding remains constant", "Remains unchanged across the period", "Decreases then increases sharply at silicon"],
      ans: 1,
      exp: "Across Period 3, protons increase from 11 (Na) to 17 (Cl) while electrons are added to the same 3rd energy level, pulling electron shells closer to the nucleus."
    },
    {
      category: "📊 Periodic Trends",
      q: "Why does the first ionization energy generally DECREASE down Group 2 (Alkaline Earth Metals)?",
      options: ["Nuclear charge decreases down the group", "Atomic radius increases and electron shielding by inner shells increases, weakening nuclear attraction on valence electrons", "Valence electrons become more paired", "The elements become non-metals down the group"],
      ans: 1,
      exp: "Down Group 2, each successive element has an additional energy level. The valence electrons are further from the nucleus and heavily shielded, requiring less ionization energy to remove."
    },
    {
      category: "📊 Periodic Trends",
      q: "Which of the following oxides is AMPHOTERIC (reacts with both dilute acids and strong bases)?",
      options: ["Sodium Oxide (Na₂O)", "Magnesium Oxide (MgO)", "Aluminium Oxide (Al₂O₃)", "Sulfur Dioxide (SO₂)"],
      ans: 2,
      exp: "Al₂O₃, PbO, and ZnO are amphoteric oxides. Al₂O₃ dissolves in HCl to form AlCl₃ and in NaOH to form sodium aluminate, Na[Al(OH)₄]."
    },
    {
      category: "📊 Periodic Trends",
      q: "Why does the chemical reactivity of the Halogens (Group 7) DECREASE down the group from Fluorine to Iodine?",
      options: ["Atomic size increases, making it harder for the nucleus to attract and gain an electron into the valence shell", "Melting points decrease down the group", "Electronegativity increases down the group", "The halogens lose electrons more readily down the group"],
      ans: 0,
      exp: "Halogens react by gaining one electron to complete their octet. As atomic radius and shielding increase down Group 7, electrostatic attraction for an incoming electron weakens."
    },

    // --- WATER HARDNESS & RADIOACTIVITY ---
    {
      category: "💧 Water & Nuclear",
      q: "What dissolved chemical compound causes TEMPORARY hardness in water?",
      options: ["Calcium sulfate (CaSO₄)", "Calcium hydrogen carbonate [Ca(HCO₃)₂]", "Magnesium chloride (MgCl₂)", "Sodium hydrogen carbonate (NaHCO₃)"],
      ans: 1,
      exp: "Temporary hardness is caused by dissolved calcium or magnesium hydrogen carbonate [Ca(HCO₃)₂ or Mg(HCO₃)₂], formed when rainwater containing CO₂ percolates through limestone."
    },
    {
      category: "💧 Water & Nuclear",
      q: "Why does simple BOILING remove temporary hardness from water?",
      options: ["It evaporates the calcium ions into steam", "It decomposes soluble Ca(HCO₃)₂ into insoluble CaCO₃ precipitate (limescale): Ca(HCO₃)₂ → CaCO₃(s) + CO₂ + H₂O", "It increases water acidity and dissolves all ions", "It reduces water surface tension permanently"],
      ans: 1,
      exp: "Thermal decomposition: Ca(HCO₃)₂(aq) → CaCO₃(s) + CO₂(g) + H₂O(l). The precipitated calcium carbonate can be filtered out or settles as kettle fur."
    },
    {
      category: "💧 Water & Nuclear",
      q: "Which chemical reagent can be added to water to remove BOTH temporary and permanent hardness simultaneously?",
      options: ["Sodium carbonate (Washing Soda, Na₂CO₃)", "Sodium chloride (Table Salt)", "Dilute hydrochloric acid", "Calcium hydroxide in large excess"],
      ans: 0,
      exp: "Sodium carbonate precipitates soluble Ca²⁺ and Mg²⁺ ions as insoluble carbonates: Ca²⁺(aq) + CO₃²⁻(aq) → CaCO₃(s)."
    },
    {
      category: "💧 Water & Nuclear",
      q: "What is an Alpha (α) particle in radioactive nuclear transformations?",
      options: ["A fast-moving electron of negligible mass", "A high-frequency electromagnetic radiation bundle", "A Helium nucleus consisting of 2 protons and 2 neutrons (⁴₂He) with a +2 charge", "An uncharged high-speed neutron"],
      ans: 2,
      exp: "An alpha particle is a helium-4 nucleus (⁴₂He²⁺). It has high ionizing power and low penetration, stopped by a sheet of paper."
    },
    {
      category: "💧 Water & Nuclear",
      q: "A radioactive isotope has a mass of 16.0 grams and a half-life of 10 days. What mass of the isotope will remain after 40 days?",
      options: ["4.0 grams", "2.0 grams", "1.0 gram [16 → 8 → 4 → 2 → 1 g]", "0.5 grams"],
      ans: 2,
      exp: "Number of half-lives n = 40 days / 10 days = 4 half-lives. 16.0 g → 8.0 g (1) → 4.0 g (2) → 2.0 g (3) → 1.0 g (4)."
    },
    {
      category: "🏭 Industrial Processes",
      q: "In the Haber process, why are unreacted Nitrogen and Hydrogen gases recycled back into the catalyst chamber?",
      options: ["To cool down the reaction vessel", "To increase the overall efficiency and percentage conversion of raw materials to over 95%", "To prevent iron catalyst poisoning", "To dilute the ammonia product"],
      ans: 1,
      exp: "A single pass converts only ~15% of gases to ammonia. Recycling unreacted N₂ and H₂ raises the overall commercial conversion efficiency above 95%."
    },
    {
      category: "⚡ Electrochemistry",
      q: "During the electrolysis of dilute sulfuric acid using platinum electrodes, what is the ratio of gas volume collected at the Cathode to that at the Anode?",
      options: ["1 : 1", "2 : 1 (2 volumes H₂ : 1 volume O₂)", "1 : 2", "4 : 1"],
      ans: 1,
      exp: "Overall decomposition of water: 2H₂O(l) → 2H₂(g) [cathode] + O₂(g) [anode]. The volume ratio of H₂ : O₂ is 2 : 1 according to Avogadro's law."
    },
    {
      category: "⚖️ Equilibrium",
      q: "For the endothermic decomposition: CaCO₃(s) ⇌ CaO(s) + CO₂(g) (ΔH = +178 kJ/mol), which change will increase the equilibrium yield of CO₂?",
      options: ["Increasing the total pressure", "Adding more solid CaCO₃ powder", "Increasing the reaction temperature", "Adding a powdered catalyst"],
      ans: 2,
      exp: "Because the forward reaction is endothermic, increasing temperature shifts equilibrium to the right to absorb heat, generating more CO₂ gas."
    },
    {
      category: "💨 Gas Preparation",
      q: "How is Nitrogen(I) Oxide (N₂O, laughing gas) prepared in the laboratory by thermal decomposition?",
      options: ["Gently heating Ammonium Nitrate crystals (NH₄NO₃): NH₄NO₃(s) → N₂O(g) + 2H₂O(g)", "Heating Lead(II) nitrate strongly", "Reacting copper with concentrated nitric acid", "Dehydrating ammonia gas with sulfuric acid"],
      ans: 0,
      exp: "Gentle heating of ammonium nitrate decomposes it into nitrogen(I) oxide and steam: NH₄NO₃(s) → N₂O(g) + 2H₂O(g). Strong heating can cause violent explosion."
    },
    {
      category: "📊 Periodic Trends",
      q: "Why does Silicon have an exceptionally high melting point (1414 °C) compared to Phosphorus (44 °C) in Period 3?",
      options: ["Silicon is a metal while phosphorus is a noble gas", "Silicon has a giant 3D covalent network requiring immense energy to break covalent bonds, whereas phosphorus has simple P₄ molecules held by weak van der Waals forces", "Silicon has ionic bonds between its atoms", "Silicon has more protons than phosphorus"],
      ans: 1,
      exp: "Silicon forms a giant diamond-like covalent tetrahedral network, whereas white phosphorus consists of discrete P₄ tetrahedral molecules held by weak intermolecular forces."
    },
    {
      category: "💧 Water & Nuclear",
      q: "Which type of radioactive decay does NOT alter the atomic number (Z) or the mass number (A) of the parent radioisotope?",
      options: ["Alpha (α) decay", "Beta (β⁻) decay", "Gamma (γ) ray emission", "Positron emission"],
      ans: 2,
      exp: "Gamma emission involves the release of excess nuclear energy as high-frequency electromagnetic photons from an excited nucleus; Z and A remain unchanged."
    }
  ];

  /* ══════════════════════════════════════
     GAME MODES CONFIGURATION
  ══════════════════════════════════════ */
  const GAME_MODES = {
    'blitz': {
      key: 'blitz',
      name: 'Comprehensive Review',
      icon: '📚',
      duration: 60,
      isSurvival: false,
      filter: () => true
    },
    'survival': {
      key: 'survival',
      name: 'Sudden Death',
      icon: '🎯',
      duration: 15,
      isSurvival: true,
      filter: () => true
    },
    'qualitative': {
      key: 'qualitative',
      name: 'Qualitative Analysis',
      icon: '🔬',
      duration: 45,
      isSurvival: false,
      filter: (q) => q.category.includes('Cation') || q.category.includes('Anion') || q.category.includes('Flame') || q.category.includes('Gas')
    },
    'organic': {
      key: 'organic',
      name: 'Organic Chemistry',
      icon: '⚗️',
      duration: 45,
      isSurvival: false,
      filter: (q) => q.category.includes('Organic')
    },
    'titration': {
      key: 'titration',
      name: 'Volumetric Titrations',
      icon: '⚖️',
      duration: 45,
      isSurvival: false,
      filter: (q) => q.category.includes('Volumetric')
    },
    'energy': {
      key: 'energy',
      name: 'Kinetics & Energetics',
      icon: '🌡️',
      duration: 45,
      isSurvival: false,
      filter: (q) => q.category.includes('Energy') || q.category.includes('Rates')
    },
    'daily_bite': {
      key: 'daily_bite',
      name: 'Daily Chemistry Bite',
      icon: '🔥',
      duration: 40,
      isSurvival: false,
      filter: () => true
    }
  };

  /* ══════════════════════════════════════
     GAME STATE VARIABLES
  ══════════════════════════════════════ */
  let currentModeKey = 'blitz';
  let currentScore = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let totalAnswered = 0;
  let correctCount = 0;
  let timeLeft = 60;
  let timerInterval = null;
  let currentQIndex = 0;
  let shuffledQuestions = [];
  let isAnswerLocked = false;
  let isSoundEnabled = localStorage.getItem('virtulab_battle_sound') !== 'muted';
  let targetWorkbenchUrl = null;

  /* ══════════════════════════════════════
     ENHANCED WEB AUDIO SYNTHESIZER
  ══════════════════════════════════════ */
  let audioCtx = null;
  function getAudioContext() {
    try {
      if (!audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          audioCtx = new AudioCtxClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    } catch(e) {
      return null;
    }
  }

  function playTone(freq, type, duration, gainLevel = 0.12) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  function playClickSound() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch(e) {}
  }

  function playCorrectSound(streak = 1) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Cheerful multi-note chime arpeggio (C5 -> E5 -> G5 -> C6)
      const baseFreq = 523.25; // C5
      const notes = [
        baseFreq,
        baseFreq * 1.25, // E5
        baseFreq * 1.5,  // G5
        baseFreq * 2.0   // C6
      ];

      if (streak >= 3) {
        notes.push(baseFreq * 2.5); // High E6 sparkle
      }

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);
        gain.gain.setValueAtTime(0.12, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.045 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.22);
      });
    } catch(e) {}
  }

  function playErrorSound() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.32);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch(e) {}
  }

  function playStreakPowerup(tier = 1) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const baseFreq = tier >= 4 ? 880 : (tier >= 3 ? 659.25 : 523.25);
      const chords = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
      chords.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + i * 0.06 + 0.25);
        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    } catch(e) {}
  }

  function playTickSound(isUrgent = false) {
    if (!isSoundEnabled) return;
    playTone(isUrgent ? 950 : 750, 'sine', 0.04, isUrgent ? 0.08 : 0.04);
  }

  function playFanfare() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Majestic 5-note brass fanfare
      const notes = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.5, d: 0.18 }, // C6
        { f: 1318.5, d: 0.45 }  // E6 triumphant hold
      ];
      let offset = 0;
      notes.forEach((item) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now + offset);
        gain.gain.setValueAtTime(0.14, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + item.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + item.d);
        offset += item.d * 0.75;
      });
    } catch(e) {}
  }

  function playTallyTick() {
    if (!isSoundEnabled) return;
    playTone(850, 'sine', 0.025, 0.03);
  }

  window.toggleBattleSound = function() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('virtulab_battle_sound', isSoundEnabled ? 'active' : 'muted');
    updateSoundButtonUI();
    if (isSoundEnabled) {
      playCorrectSound(1);
    }
  };

  function updateSoundButtonUI() {
    const icon = document.getElementById('soundIcon');
    const text = document.getElementById('soundText');
    if (icon) icon.textContent = isSoundEnabled ? '🔊' : '🔇';
    if (text) text.textContent = isSoundEnabled ? 'Sound ON' : 'Sound OFF';
  }

  /* ══════════════════════════════════════
     THEME SWITCHING & PERSISTENCE
  ══════════════════════════════════════ */
  window.setAppTheme = function(theme) {
    playClickSound();
    if (window.setTheme) {
      window.setTheme(theme);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('vlk_theme', theme);
      } catch(e) {}
    }
  };

  /* ══════════════════════════════════════
     TOPIC MODAL CONTROLS
  ══════════════════════════════════════ */
  window.openTopicModal = function() {
    playClickSound();
    const modal = document.getElementById('battleTopicModal');
    if (modal) modal.style.display = 'flex';
    
    // Highlight currently active mode in modal
    Object.keys(GAME_MODES).forEach(k => {
      const card = document.getElementById(`modeCard_${k}`);
      if (card) {
        if (k === currentModeKey) card.classList.add('active');
        else card.classList.remove('active');
      }
    });
  };

  window.closeTopicModal = function() {
    playClickSound();
    const modal = document.getElementById('battleTopicModal');
    if (modal) modal.style.display = 'none';
  };

  window.selectAndStartMode = function(modeKey) {
    if (!GAME_MODES[modeKey]) return;
    currentModeKey = modeKey;
    closeTopicModal();
    startChemicalSpeedBattle();
  };

  /* ══════════════════════════════════════
     FLOATING POINTS ANIMATION
  ══════════════════════════════════════ */
  function spawnFloatingPoints(targetElem, text, isBonus, isPenalty) {
    if (!targetElem) return;
    const rect = targetElem.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = `floating-points ${isBonus ? 'bonus' : (isPenalty ? 'penalty' : '')}`;
    popup.textContent = text;
    popup.style.left = `${rect.left + rect.width / 2 - 40}px`;
    popup.style.top = `${rect.top - 10}px`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 900);
  }

  /* ══════════════════════════════════════
     CONFETTI CELEBRATION ENGINE
  ══════════════════════════════════════ */
  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';

    const particles = [];
    const colors = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#38BDF8', '#F472B6'];

    for (let i = 0; i < 95; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        velX: (Math.random() - 0.5) * 6,
        velY: Math.random() * 4 + 3.5,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 7
      });
    }

    let frames = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.velX;
        p.y += p.velY;
        p.rot += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      frames++;
      if (frames < 150) {
        requestAnimationFrame(render);
      } else {
        canvas.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(render);
  }

  /* ══════════════════════════════════════
     GAME LIFECYCLE
  ══════════════════════════════════════ */
  window.startChemicalSpeedBattle = function() {
    const modeConfig = GAME_MODES[currentModeKey] || GAME_MODES['blitz'];
    currentScore = 0;
    currentStreak = 0;
    maxStreak = 0;
    totalAnswered = 0;
    correctCount = 0;
    timeLeft = modeConfig.duration;
    isAnswerLocked = false;

    // Filter questions based on mode
    const modeQuestions = QUESTIONS_POOL.filter(modeConfig.filter);
    shuffledQuestions = [...(modeQuestions.length > 0 ? modeQuestions : QUESTIONS_POOL)].sort(() => Math.random() - 0.5);
    currentQIndex = 0;

    const overCard = document.getElementById('battleGameOverCard');
    if (overCard) overCard.style.display = 'none';
    const arenaCard = document.getElementById('battleArenaCard');
    if (arenaCard) arenaCard.style.display = 'block';

    // Update Nav bar mode name & icon
    const navModeIcon = document.getElementById('navModeIcon');
    const navModeName = document.getElementById('navModeName');
    if (navModeIcon) navModeIcon.textContent = modeConfig.icon;
    if (navModeName) navModeName.textContent = modeConfig.name;

    const timerLabel = document.getElementById('hudTimerLabel');
    if (timerLabel) {
      timerLabel.textContent = modeConfig.isSurvival ? 'SURVIVAL CLOCK' : 'TIME LEFT';
    }

    // Hide any explanation fact strip from previous games
    const factStrip = document.getElementById('battleFactStrip');
    if (factStrip) factStrip.style.display = 'none';

    updateBattleHUD();
    renderQuestion();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      updateBattleTimer();
      if (timeLeft <= 5 && timeLeft > 0) {
        playTickSound(timeLeft <= 3);
      }
      if (timeLeft <= 0) {
        endChemicalSpeedBattle(modeConfig.isSurvival ? 'Time expired in Sudden Death!' : 'Time up!');
      }
    }, 1000);
  };

  function updateBattleTimer() {
    const modeConfig = GAME_MODES[currentModeKey] || GAME_MODES['blitz'];
    const timeDisp = document.getElementById('battleTimeDisplay');
    const timerBar = document.getElementById('battleTimerBar');
    
    if (timeDisp) {
      timeDisp.textContent = timeLeft + 's';
      if (timeLeft <= 5) {
        timeDisp.classList.add('urgent');
      } else {
        timeDisp.classList.remove('urgent');
      }
    }

    if (timerBar) {
      const pct = Math.max(0, (timeLeft / modeConfig.duration) * 100);
      timerBar.style.width = pct + '%';
      if (timeLeft <= (modeConfig.isSurvival ? 4 : 10)) {
        timerBar.className = 'timer-fill critical';
      } else if (timeLeft <= (modeConfig.isSurvival ? 7 : 22)) {
        timerBar.className = 'timer-fill warning';
      } else {
        timerBar.className = 'timer-fill';
      }
    }
  }

  function updateBattleHUD() {
    const scoreDisp = document.getElementById('battleScoreDisplay');
    if (scoreDisp) {
      scoreDisp.textContent = currentScore.toLocaleString();
    }

    const streakBadge = document.getElementById('battleStreakBadge');
    const streakIcon = document.getElementById('battleStreakIcon');
    const streakText = document.getElementById('battleStreakText');

    if (streakBadge && streakIcon && streakText) {
      const tier = Math.min(currentStreak, 5);
      streakBadge.className = `combo-badge tier-${tier}`;

      if (tier === 0) {
        streakIcon.textContent = '⚡';
        streakText.textContent = '0x Normal';
      } else if (tier === 1) {
        streakIcon.textContent = '⚡';
        streakText.textContent = '1x Streak';
      } else if (tier === 2) {
        streakIcon.textContent = '⚡';
        streakText.textContent = '2x Spark 🔥';
      } else if (tier === 3) {
        streakIcon.textContent = '🔥';
        streakText.textContent = '3x Blaze 🔥🔥';
      } else if (tier === 4) {
        streakIcon.textContent = '🔥🔥';
        streakText.textContent = '4x Inferno!';
      } else {
        streakIcon.textContent = '👑';
        streakText.textContent = '5x ULTRA COMBO!';
      }
    }
  }

  function renderQuestion() {
    isAnswerLocked = false;
    const modeConfig = GAME_MODES[currentModeKey] || GAME_MODES['blitz'];

    if (currentQIndex >= shuffledQuestions.length) {
      const modeQuestions = QUESTIONS_POOL.filter(modeConfig.filter);
      shuffledQuestions = [...(modeQuestions.length > 0 ? modeQuestions : QUESTIONS_POOL)].sort(() => Math.random() - 0.5);
      currentQIndex = 0;
    }

    const qData = shuffledQuestions[currentQIndex];
    const catBadge = document.getElementById('battleCatBadge');
    if (catBadge) catBadge.textContent = qData.category || '🔬 Qualitative Analysis';

    const qCounter = document.getElementById('battleQCounter');
    if (qCounter) qCounter.textContent = `Question ${totalAnswered + 1}`;

    const qText = document.getElementById('battleQuestionText');
    if (qText) qText.textContent = qData.q;

    // Reset explanation fact strip
    const factStrip = document.getElementById('battleFactStrip');
    if (factStrip) factStrip.style.display = 'none';

    const optionsBox = document.getElementById('battleOptionsBox');
    if (!optionsBox) return;
    optionsBox.innerHTML = '';

    const badgeClasses = ['badge-a', 'badge-b', 'badge-c', 'badge-d'];

    qData.options.forEach((optText, idx) => {
      const keyLetter = String.fromCharCode(65 + idx); // A, B, C, D
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-game-opt';
      btn.setAttribute('data-idx', idx);
      btn.innerHTML = `
        <div class="opt-main">
          <span class="opt-badge ${badgeClasses[idx] || 'badge-a'}">${keyLetter}</span>
          <span>${optText}</span>
        </div>
        <span class="opt-enter-icon">↵</span>
      `;
      btn.onclick = () => handleAnswerClick(idx, qData, btn);
      optionsBox.appendChild(btn);
    });
  }

  function handleAnswerClick(selectedIdx, qData, clickedBtn) {
    if (isAnswerLocked || timeLeft <= 0) return;
    isAnswerLocked = true;
    totalAnswered++;

    const modeConfig = GAME_MODES[currentModeKey] || GAME_MODES['blitz'];
    const isCorrect = selectedIdx === qData.ans;
    const scoreDisp = document.getElementById('battleScoreDisplay');
    const factStrip = document.getElementById('battleFactStrip');
    const factText = document.getElementById('factText');
    const factIcon = document.getElementById('factIcon');

    // Show micro-learning explanation
    if (factStrip && factText && qData.exp) {
      factText.textContent = qData.exp;
      if (factIcon) factIcon.textContent = isCorrect ? '✨' : '💡';
      factStrip.style.display = 'flex';
    }

    if (isCorrect) {
      correctCount++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;

      const multiplier = Math.min(currentStreak, 5);
      const points = 100 * multiplier;
      currentScore += points;

      if (clickedBtn) {
        clickedBtn.classList.add('correct');
        spawnFloatingPoints(clickedBtn, `+${points} ${multiplier > 1 ? '🔥 ' + multiplier + 'x' : ''}`, multiplier >= 3, false);
      }

      if (scoreDisp) {
        scoreDisp.classList.add('pop');
        setTimeout(() => scoreDisp.classList.remove('pop'), 200);
      }

      playCorrectSound(currentStreak);

      if (currentStreak === 3 || currentStreak === 5 || currentStreak === 10) {
        playStreakPowerup(Math.min(5, currentStreak));
      }

      // In Sudden Death mode, reset question clock on each correct answer
      if (modeConfig.isSurvival) {
        timeLeft = modeConfig.duration;
        updateBattleTimer();
      }

      updateBattleHUD();
      currentQIndex++;
      setTimeout(() => {
        if (timeLeft > 0) renderQuestion();
      }, 380);

    } else {
      // Wrong Answer
      currentStreak = 0;
      if (clickedBtn) {
        clickedBtn.classList.add('incorrect');
        spawnFloatingPoints(clickedBtn, modeConfig.isSurvival ? '💀 ELIMINATED!' : 'INCORRECT', false, true);
      }

      // Highlight the correct answer in green
      const allBtns = document.querySelectorAll('.btn-game-opt');
      allBtns.forEach(b => {
        if (parseInt(b.getAttribute('data-idx'), 10) === qData.ans) {
          b.classList.add('correct');
        }
      });

      playErrorSound();
      updateBattleHUD();

      if (modeConfig.isSurvival) {
        // Sudden death elimination
        setTimeout(() => {
          endChemicalSpeedBattle('Eliminated by incorrect deduction in Sudden Death!');
        }, 750);
      } else {
        currentQIndex++;
        setTimeout(() => {
          if (timeLeft > 0) renderQuestion();
        }, 700);
      }
    }
  }

  /* ══════════════════════════════════════
     KEYBOARD CONTROLS LISTENER
  ══════════════════════════════════════ */
  document.addEventListener('keydown', (e) => {
    const arenaCard = document.getElementById('battleArenaCard');
    if (!arenaCard || arenaCard.style.display === 'none') return;
    if (isAnswerLocked || timeLeft <= 0) return;

    let selectedIdx = -1;
    const key = e.key.toUpperCase();

    if (key === 'A' || key === '1') selectedIdx = 0;
    else if (key === 'B' || key === '2') selectedIdx = 1;
    else if (key === 'C' || key === '3') selectedIdx = 2;
    else if (key === 'D' || key === '4') selectedIdx = 3;

    if (selectedIdx >= 0) {
      const qData = shuffledQuestions[currentQIndex];
      const allBtns = document.querySelectorAll('.btn-game-opt');
      const targetBtn = allBtns[selectedIdx];
      if (qData && targetBtn) {
        handleAnswerClick(selectedIdx, qData, targetBtn);
      }
    }
  });

  /* ══════════════════════════════════════
     GAME OVER & SCORING SUMMARY
  ══════════════════════════════════════ */
  function endChemicalSpeedBattle(reason) {
    if (timerInterval) clearInterval(timerInterval);
    const modeConfig = GAME_MODES[currentModeKey] || GAME_MODES['blitz'];

    const arenaCard = document.getElementById('battleArenaCard');
    if (arenaCard) arenaCard.style.display = 'none';
    const overCard = document.getElementById('battleGameOverCard');
    if (overCard) overCard.style.display = 'block';

    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const avgSpeed = totalAnswered > 0 ? ((modeConfig.duration - Math.max(0, timeLeft)) / totalAnswered).toFixed(1) : '0.0';

    // Update Star Rating (1, 2, or 3 stars)
    const starElems = document.querySelectorAll('#resultsStarRating .star');
    let starsEarned = 1;
    if (accuracy >= 80 && currentScore >= 1500) {
      starsEarned = 3;
    } else if (accuracy >= 50 || currentScore >= 800) {
      starsEarned = 2;
    }

    starElems.forEach((st, i) => {
      if (i < starsEarned) st.classList.add('filled');
      else st.classList.remove('filled');
    });

    const subtitleElem = document.getElementById('gameOverSubtitle');
    if (subtitleElem && reason) {
      subtitleElem.innerHTML = `<b>${reason}</b> (${modeConfig.name} evaluation recorded)`;
    }

    const headingElem = document.getElementById('gameOverHeading');
    const trophyElem = document.getElementById('resultsTrophy');
    if (modeConfig.isSurvival && correctCount < 4) {
      if (headingElem) headingElem.textContent = 'Eliminated!';
      if (trophyElem) trophyElem.textContent = '💀';
    } else {
      if (headingElem) headingElem.textContent = 'Diagnostic Assessment Complete';
      if (trophyElem) trophyElem.textContent = starsEarned === 3 ? '👑' : (starsEarned === 2 ? '🏆' : '⭐');
    }

    // Rolling score tally counter animation
    const finalScoreElem = document.getElementById('finalScoreDisplay');
    if (finalScoreElem) {
      let currentVal = 0;
      const targetVal = currentScore;
      const step = Math.max(15, Math.floor(targetVal / 25));
      const tallyInterval = setInterval(() => {
        currentVal += step;
        if (currentVal >= targetVal) {
          currentVal = targetVal;
          clearInterval(tallyInterval);
        }
        finalScoreElem.textContent = currentVal.toLocaleString();
        playTallyTick();
      }, 30);
    }

    const statAcc = document.getElementById('statAccuracy');
    const statStrk = document.getElementById('statMaxStreak');
    const statSpd = document.getElementById('statAvgSpeed');
    const statXP = document.getElementById('statXPEarned');

    const xpEarned = Math.max(25, Math.round(currentScore / 10) + (correctCount * 5));

    if (statAcc) statAcc.textContent = `${accuracy}%`;
    if (statStrk) statStrk.textContent = `${maxStreak}x`;
    if (statSpd) statSpd.textContent = `${Math.abs(avgSpeed)}s`;
    if (statXP) statXP.textContent = `+${xpEarned} XP`;

    // Ranking Tier Evaluation
    let rank = '🧪 Foundational: Practical Learner (Grade C)';
    let isHighRank = false;

    if (currentScore >= 3000 || (modeConfig.isSurvival && maxStreak >= 8)) {
      rank = '👑 Distinction: Master KCSE Chemist (Grade A)';
      isHighRank = true;
    } else if (currentScore >= 1800 || (modeConfig.isSurvival && maxStreak >= 5)) {
      rank = '🌟 Merit: Senior Analytical Chemist (Grade A-)';
      isHighRank = true;
    } else if (currentScore >= 1000 || (modeConfig.isSurvival && maxStreak >= 3)) {
      rank = '🎯 Proficient: Practical Analyst (Grade B+)';
    } else if (currentScore >= 500 || (modeConfig.isSurvival && maxStreak >= 2)) {
      rank = '⚗️ Developing: Chemistry Apprentice (Grade B)';
    }

    const rankElem = document.getElementById('finalRankDisplay');
    if (rankElem) rankElem.textContent = rank;

    // Mode-specific High Score Persistence
    const storageKey = `virtulab_battle_best_${currentModeKey}`;
    const prevBest = parseInt(localStorage.getItem(storageKey) || '0', 10);
    const newNotice = document.getElementById('newHighScoreNotice');

    if (currentScore > prevBest && currentScore > 0) {
      localStorage.setItem(storageKey, currentScore.toString());
      localStorage.setItem(`${storageKey}_rank`, rank);
      if (newNotice) newNotice.style.display = 'inline-block';
    } else {
      if (newNotice) newNotice.style.display = 'none';
    }

    // Record warm-up completion timestamp for today & session mode warmup
    try {
      localStorage.setItem('virtulab_warmup_completed_date', new Date().toDateString());
      sessionStorage.setItem(`virtulab_warmed_up_${currentModeKey}`, 'true');
    } catch(e) {}

    // Gamification XP & Streak Logging
    if (window.GamificationEngine) {
      window.GamificationEngine.logActivity();
      if (currentModeKey === 'daily_bite') {
        window.GamificationEngine.completeDailyChallenge();
      } else {
        window.GamificationEngine.addXP(xpEarned, `${modeConfig.name} Drill`);
      }
    }

    // Update the proceed button target if launched from a workbench
    const proceedBtn = document.getElementById('gameOverProceedBtn');
    if (proceedBtn) {
      if (targetWorkbenchUrl) {
        proceedBtn.href = targetWorkbenchUrl;
        proceedBtn.innerHTML = `<span>🧪 Enter ${modeConfig.name} Workbench</span> <span class="btn-arrow">→</span>`;
      } else {
        proceedBtn.href = 'home.html';
        proceedBtn.innerHTML = `<span>🧪 Proceed to Laboratory Workbench</span> <span class="btn-arrow">→</span>`;
      }
    }

    if (isHighRank || starsEarned >= 2) {
      playFanfare();
      launchConfetti();
    } else {
      playTone(523.25, 'triangle', 0.4);
    }
  }

  /* ══════════════════════════════════════
     INITIALIZATION
  ══════════════════════════════════════ */
  function init() {
    updateSoundButtonUI();

    if (window.GamificationEngine) {
      const streak = window.GamificationEngine.getStreak();
      const streakEl = document.getElementById('navStreakText');
      if (streakEl) streakEl.textContent = `${streak.count}-Day Streak`;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const targetParam = urlParams.get('target');

    if (modeParam && GAME_MODES[modeParam]) {
      currentModeKey = modeParam;
    } else {
      currentModeKey = 'blitz';
    }

    if (targetParam) {
      try {
        targetWorkbenchUrl = decodeURIComponent(targetParam);
      } catch(e) {
        targetWorkbenchUrl = targetParam;
      }

      const banner = document.getElementById('battleAssignmentBanner');
      const skipBtn = document.getElementById('battleSkipToTargetBtn');
      if (banner && skipBtn && targetWorkbenchUrl) {
        skipBtn.href = targetWorkbenchUrl;
        banner.style.display = 'flex';
      }
    }

    // Direct auto-start drill questions
    startChemicalSpeedBattle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

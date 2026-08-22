// ============================================================
//  VirtuLab Kenya — Chemical Speed Battle Arena Engine
//  Modern Arcade HUD, Precision Timers, Audio FX & Keyboard Shortcuts
// ============================================================

(function() {
  'use strict';

  /* ══════════════════════════════════════
     KCSE PRACTICAL QUESTIONS POOL (45 HIGH-YIELD QUESTIONS)
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
    }
  ];

  /* ══════════════════════════════════════
     GAME MODES CONFIGURATION (ACADEMIC DOMAINS)
  ══════════════════════════════════════ */
  const GAME_MODES = {
    'blitz': {
      key: 'blitz',
      name: 'Comprehensive Review',
      icon: '📚',
      duration: 60,
      isSurvival: false,
      launchText: '🚀 Begin Comprehensive Diagnostic (60s) →',
      filter: () => true
    },
    'survival': {
      key: 'survival',
      name: 'High-Precision Drill',
      icon: '🎯',
      duration: 15,
      isSurvival: true,
      launchText: '🎯 Begin High-Precision Drill (Zero-Error) →',
      filter: () => true
    },
    'qualitative': {
      key: 'qualitative',
      name: 'Qualitative Salt Analysis',
      icon: '🔬',
      duration: 45,
      isSurvival: false,
      launchText: '🔬 Begin Qualitative Diagnostic (45s) →',
      filter: (q) => q.category.includes('Cation') || q.category.includes('Anion') || q.category.includes('Flame') || q.category.includes('Gas')
    },
    'organic': {
      key: 'organic',
      name: 'Organic Functional Groups',
      icon: '⚗️',
      duration: 45,
      isSurvival: false,
      launchText: '⚗️ Begin Organic Diagnostic (45s) →',
      filter: (q) => q.category.includes('Organic')
    },
    'titration': {
      key: 'titration',
      name: 'Volumetric Titrations',
      icon: '⚖️',
      duration: 45,
      isSurvival: false,
      launchText: '⚖️ Begin Volumetric Titration Drill (45s) →',
      filter: (q) => q.category.includes('Volumetric')
    },
    'energy': {
      key: 'energy',
      name: 'Kinetics & Energetics',
      icon: '🌡️',
      duration: 45,
      isSurvival: false,
      launchText: '🌡️ Begin Kinetics & Energetics Drill (45s) →',
      filter: (q) => q.category.includes('Energy') || q.category.includes('Rates')
    },
    'daily_bite': {
      key: 'daily_bite',
      name: 'Daily Chemistry Bite',
      icon: '🔥',
      duration: 40,
      isSurvival: false,
      launchText: '🔥 Begin Daily Chemistry Bite (40s) →',
      filter: (q) => true
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

  /* ══════════════════════════════════════
     MODE SELECTOR HANDLER
  ══════════════════════════════════════ */
  window.selectGameMode = function(modeKey) {
    if (!GAME_MODES[modeKey]) return;
    currentModeKey = modeKey;

    // Update active mode cards UI
    Object.keys(GAME_MODES).forEach(k => {
      const card = document.getElementById(`modeCard_${k}`);
      if (card) {
        if (k === modeKey) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      }
    });

    // Update launch button text
    const launchBtn = document.getElementById('launchBattleBtn');
    if (launchBtn) {
      launchBtn.textContent = GAME_MODES[modeKey].launchText;
    }

    updateStartCardBest();
    playTone(680, 'sine', 0.08);
  };

  window.backToModeSelect = function() {
    if (timerInterval) clearInterval(timerInterval);
    window.location.href = 'home.html';
  };

  /* ══════════════════════════════════════
     WEB AUDIO SYNTHESIZER SOUND FX
  ══════════════════════════════════════ */
  function getAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      return AudioCtx ? new AudioCtx() : null;
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

  function playCorrectSound(streak) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const baseFreq = 523.25; // C5
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * (1 + streak * 0.2)];
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.18);
      });
    } catch(e) {}
  }

  function playErrorSound() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch(e) {}
  }

  function playTickSound() {
    if (!isSoundEnabled) return;
    playTone(800, 'sine', 0.04, 0.05);
  }

  function playFanfare() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C6
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
      });
    } catch(e) {}
  }

  window.toggleBattleSound = function() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('virtulab_battle_sound', isSoundEnabled ? 'active' : 'muted');
    updateSoundButtonUI();
    if (isSoundEnabled) playTone(600, 'sine', 0.1);
  };

  function updateSoundButtonUI() {
    const icon = document.getElementById('soundIcon');
    const text = document.getElementById('soundText');
    if (icon && text) {
      icon.textContent = isSoundEnabled ? '🔊' : '🔇';
      text.textContent = isSoundEnabled ? 'Sound ON' : 'Sound OFF';
    }
  }

  /* ══════════════════════════════════════
     FLOATING POINTS ANIMATION
  ══════════════════════════════════════ */
  function spawnFloatingPoints(targetElem, text, isBonus) {
    if (!targetElem) return;
    const rect = targetElem.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = `floating-points ${isBonus ? 'bonus' : ''}`;
    popup.textContent = text;
    popup.style.left = `${rect.left + rect.width / 2 - 30}px`;
    popup.style.top = `${rect.top}px`;
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
    const colors = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#38BDF8'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        velX: (Math.random() - 0.5) * 5,
        velY: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6
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
      if (frames < 140) {
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
    const startCard = document.getElementById('battleStartCard');
    if (startCard) startCard.style.display = 'none';
    const overCard = document.getElementById('battleGameOverCard');
    if (overCard) overCard.style.display = 'none';
    const arenaCard = document.getElementById('battleArenaCard');
    if (arenaCard) arenaCard.style.display = 'block';

    // Update active mode pill in HUD
    const modePill = document.getElementById('arenaActiveModePill');
    if (modePill) {
      modePill.textContent = `${modeConfig.icon} ${modeConfig.name}`;
      if (modeConfig.isSurvival) {
        modePill.className = 'mode-badge-pill survival';
      } else {
        modePill.className = 'mode-badge-pill';
      }
    }

    const timerLabel = document.getElementById('hudTimerLabel');
    if (timerLabel) {
      timerLabel.textContent = modeConfig.isSurvival ? 'Question Clock' : 'Remaining Time';
    }

    updateBattleHUD();
    renderQuestion();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      updateBattleTimer();
      if (timeLeft <= 5 && timeLeft > 0) {
        playTickSound();
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
      if (timeLeft <= (modeConfig.isSurvival ? 4 : 12)) {
        timerBar.className = 'timer-bar-fill critical';
      } else if (timeLeft <= (modeConfig.isSurvival ? 8 : 25)) {
        timerBar.className = 'timer-bar-fill warning';
      } else {
        timerBar.className = 'timer-bar-fill';
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
      streakBadge.className = `streak-badge streak-tier-${tier}`;

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

    const qText = document.getElementById('battleQuestionText');
    if (qText) qText.textContent = qData.q;

    const optionsBox = document.getElementById('battleOptionsBox');
    if (!optionsBox) return;
    optionsBox.innerHTML = '';

    qData.options.forEach((optText, idx) => {
      const keyLetter = String.fromCharCode(65 + idx); // A, B, C, D
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'battle-option-btn';
      btn.setAttribute('data-idx', idx);
      btn.innerHTML = `
        <div class="battle-opt-left">
          <span class="keycap-badge">${keyLetter}</span>
          <span>${optText}</span>
        </div>
        <span style="font-size:0.8rem; opacity:0.35;">↵</span>
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

    if (isCorrect) {
      correctCount++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;

      const multiplier = Math.min(currentStreak, 5);
      const points = 100 * multiplier;
      currentScore += points;

      if (clickedBtn) {
        clickedBtn.classList.add('correct');
        spawnFloatingPoints(clickedBtn, `+${points} ${multiplier > 1 ? '🔥 ' + multiplier + 'x' : ''}`, multiplier >= 3);
      }

      if (scoreDisp) {
        scoreDisp.classList.add('pop');
        setTimeout(() => scoreDisp.classList.remove('pop'), 200);
      }

      playCorrectSound(currentStreak);

      // Trigger escalating gamification streak sound cues
      if (window.GamificationEngine && window.GamificationEngine.audio) {
        if (currentStreak === 3) {
          window.GamificationEngine.audio.playStreakMultiplier(1);
        } else if (currentStreak === 5) {
          window.GamificationEngine.audio.playStreakMultiplier(2);
        } else if (currentStreak >= 10 && currentStreak % 5 === 0) {
          window.GamificationEngine.audio.playStreakMultiplier(3);
        }
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
      }, 240);

    } else {
      // Wrong Answer
      currentStreak = 0;
      if (clickedBtn) {
        clickedBtn.classList.add('incorrect');
        spawnFloatingPoints(clickedBtn, modeConfig.isSurvival ? '💀 ELIMINATED!' : 'MISS!', false);
      }

      // Highlight the correct answer
      const allBtns = document.querySelectorAll('.battle-option-btn');
      allBtns.forEach(b => {
        if (parseInt(b.getAttribute('data-idx'), 10) === qData.ans) {
          b.classList.add('correct');
        }
      });

      playErrorSound();
      updateBattleHUD();

      if (modeConfig.isSurvival) {
        // Instant elimination in sudden death mode
        setTimeout(() => {
          endChemicalSpeedBattle('Eliminated by incorrect deduction!');
        }, 550);
      } else {
        currentQIndex++;
        setTimeout(() => {
          if (timeLeft > 0) renderQuestion();
        }, 480);
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
      const allBtns = document.querySelectorAll('.battle-option-btn');
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

    const finalScoreElem = document.getElementById('finalScoreDisplay');
    if (finalScoreElem) finalScoreElem.textContent = currentScore.toLocaleString();

    const modeDisplay = document.getElementById('finalModeDisplay');
    if (modeDisplay) modeDisplay.textContent = `${modeConfig.icon} ${modeConfig.name}`;

    const subtitleElem = document.getElementById('gameOverSubtitle');
    if (subtitleElem && reason) {
      subtitleElem.innerHTML = `<b>${reason}</b> (${modeConfig.name} challenge ended)`;
    }

    const headingElem = document.getElementById('gameOverHeading');
    const iconElem = document.getElementById('gameOverIcon');
    if (modeConfig.isSurvival && correctCount < 5) {
      if (headingElem) headingElem.textContent = 'Eliminated!';
      if (iconElem) iconElem.textContent = '💀';
    } else {
      if (headingElem) headingElem.textContent = 'Speed Battle Finished!';
      if (iconElem) iconElem.textContent = '🏆';
    }

    // Accuracy Calculation
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const avgSpeed = totalAnswered > 0 ? ((modeConfig.duration - Math.max(0, timeLeft)) / totalAnswered).toFixed(1) : '0.0';

    const statAns = document.getElementById('statAnswered');
    const statAcc = document.getElementById('statAccuracy');
    const statStrk = document.getElementById('statMaxStreak');
    const statSpd = document.getElementById('statAvgSpeed');

    if (statAns) statAns.textContent = `${correctCount}/${totalAnswered}`;
    if (statAcc) statAcc.textContent = `${accuracy}%`;
    if (statStrk) statStrk.textContent = `${maxStreak}x`;
    if (statSpd) statSpd.textContent = `${Math.abs(avgSpeed)}s`;

    // Ranking Tier Evaluation (Academic KNEC Practical Performance Standards)
    let rank = '🧪 Foundational: Practical Learner (Grade C)';
    let isHighRank = false;

    if (currentScore >= 3500 || (modeConfig.isSurvival && maxStreak >= 10)) {
      rank = '👑 Distinction: Master KCSE Chemist (Grade A)';
      isHighRank = true;
    } else if (currentScore >= 2200 || (modeConfig.isSurvival && maxStreak >= 7)) {
      rank = '🌟 Merit: Senior Analytical Chemist (Grade A-)';
      isHighRank = true;
    } else if (currentScore >= 1200 || (modeConfig.isSurvival && maxStreak >= 4)) {
      rank = '🎯 Proficient: Practical Analyst (Grade B+)';
    } else if (currentScore >= 600 || (modeConfig.isSurvival && maxStreak >= 2)) {
      rank = '⚗️ Developing: Chemistry Apprentice (Grade B)';
    }

    const rankElem = document.getElementById('finalRankDisplay');
    if (rankElem) rankElem.textContent = rank;

    // Mode-specific High Score Persistence
    const storageKey = `virtulab_battle_best_${currentModeKey}`;
    const prevBest = parseInt(localStorage.getItem(storageKey) || '0', 10);
    const newNotice = document.getElementById('newHighScoreNotice');

    if (currentScore > prevBest) {
      localStorage.setItem(storageKey, currentScore.toString());
      localStorage.setItem(`${storageKey}_rank`, rank);
      if (newNotice) newNotice.style.display = 'block';
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
      const xpEarned = Math.max(15, Math.round(currentScore / 10) + (correctCount * 5));
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
        proceedBtn.innerHTML = `🚀 Enter ${modeConfig.name} Workbench →`;
      } else {
        proceedBtn.href = 'home.html';
        proceedBtn.innerHTML = `🚀 Enter Laboratory Workstation →`;
      }
    }

    updateStartCardBest();

    if (isHighRank) {
      playFanfare();
      launchConfetti();
    } else {
      playTone(523.25, 'sine', 0.4);
    }
  }

  function updateStartCardBest() {
    const modeConfig = GAME_MODES[currentModeKey] || GAME_MODES['blitz'];
    const storageKey = `virtulab_battle_best_${currentModeKey}`;
    const best = parseInt(localStorage.getItem(storageKey) || '0', 10);
    const bestRank = localStorage.getItem(`${storageKey}_rank`) || 'Novice';
    
    const banner = document.getElementById('highScoreBanner');
    const bestModeLabel = document.getElementById('startBestModeLabel');
    const bestScoreText = document.getElementById('startBestScore');
    const bestRankText = document.getElementById('startBestRank');

    if (bestModeLabel) bestModeLabel.textContent = `${modeConfig.icon} ${modeConfig.name}`;

    if (best > 0 && banner && bestScoreText && bestRankText) {
      banner.style.display = 'block';
      bestScoreText.textContent = `${best.toLocaleString()} pts`;
      bestRankText.textContent = bestRank;
    } else if (banner) {
      banner.style.display = 'none';
    }
  }

  /* ══════════════════════════════════════
     INITIALIZATION
  ══════════════════════════════════════ */
  let targetWorkbenchUrl = null;

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

    const modeConfig = GAME_MODES[currentModeKey] || GAME_MODES['blitz'];

    const navTitle = document.querySelector('.nav-title');
    if (navTitle) {
      navTitle.textContent = `${modeConfig.icon} ${modeConfig.name} Drill`;
    }

    if (targetParam) {
      try {
        targetWorkbenchUrl = decodeURIComponent(targetParam);
      } catch(e) {
        targetWorkbenchUrl = targetParam;
      }
    }

    // Direct auto-start of drill questions on dedicated screen
    startChemicalSpeedBattle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

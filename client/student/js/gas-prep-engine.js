// ============================================================
//  VirtuLab Kenya — Gas Preparation & Collection Engine
//  KNEC KCSE Chemistry Paper 3 Inorganic Practical Module
// ============================================================

const GAS_DATABASE = {
  O2: {
    key: 'O2',
    name: 'Oxygen Gas',
    formula: 'O₂',
    equation: '2H₂O₂(aq)  —[MnO₂]→  2H₂O(l) + O₂(g)',
    reactants: 'Hydrogen Peroxide (H₂O₂) + Manganese(IV) Oxide (MnO₂ catalyst)',
    heatingRequired: false,
    densityVsAir: 'Slightly denser than air (approx 1.1x)',
    solubilityInWater: 'Slightly soluble in water',
    compatibleDrying: ['concH2SO4', 'anhydrousCaCl2'],
    dryingExplanations: {
      concH2SO4: 'Suitable: Neutral gas does not react with concentrated H₂SO₄.',
      anhydrousCaCl2: 'Suitable: Neutral gas does not react with fused CaCl₂.',
      quicklimeCaO: 'Suitable, but conc H₂SO₄ or CaCl₂ is preferred in laboratory practice.'
    },
    compatibleCollection: ['overWater', 'downwardDelivery'],
    collectionExplanations: {
      overWater: 'Optimal: Oxygen is only slightly soluble in water, giving pure gas.',
      downwardDelivery: 'Acceptable: Oxygen is slightly denser than air, though over water is purer.',
      upwardDelivery: 'Incorrect: Oxygen is denser than air and will sink out of the inverted jar.'
    },
    tests: {
      glowingSplint: {
        result: 'The glowing wooden splint relights immediately with a bright flame.',
        inference: 'Supports combustion; confirms Oxygen (O₂) gas.',
        status: 'success'
      },
      burningSplint: {
        result: 'Burns with a significantly brighter, more intense flame.',
        inference: 'Supports combustion; characteristic of Oxygen (O₂).',
        status: 'success'
      },
      dampLitmus: {
        result: 'Both moist red and blue litmus papers remain unchanged in color.',
        inference: 'Neutral gas; neither acidic nor basic.',
        status: 'success'
      },
      limeWater: {
        result: 'No change observed; lime water remains clear.',
        inference: 'Not an acidic carbon oxide.',
        status: 'neutral'
      },
      dichromate: {
        result: 'Acidified K₂Cr₂O₇ remains orange; no reduction occurs.',
        inference: 'Not a reducing gas.',
        status: 'neutral'
      },
      starchIodide: {
        result: 'Moist starch-iodide paper remains white.',
        inference: 'No oxidation of iodide ions.',
        status: 'neutral'
      },
      hclRod: {
        result: 'No dense white fumes formed.',
        inference: 'Not an alkaline amine/ammonia gas.',
        status: 'neutral'
      }
    },
    questions: [
      {
        id: 'q_o2_role',
        prompt: 'State the role of Manganese(IV) Oxide in this reaction:',
        options: [
          'Catalyst that lowers activation energy without being consumed',
          'Primary oxidizing reagent',
          'Drying agent for evolved oxygen',
          'Indicator for reaction completion'
        ],
        correctIndex: 0
      },
      {
        id: 'q_o2_coll',
        prompt: 'Why is collection over water preferred over downward delivery for Oxygen?',
        options: [
          'Because oxygen is only slightly soluble in water and collected gas is free from air contamination',
          'Because oxygen reacts with nitrogen in dry air',
          'Because oxygen is less dense than water vapor',
          'Because oxygen liquefies at room temperature in air'
        ],
        correctIndex: 0
      }
    ]
  },

  CO2: {
    key: 'CO2',
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    equation: 'CaCO₃(s) + 2HCl(aq)  →  CaCl₂(aq) + H₂O(l) + CO₂(g)',
    reactants: 'Calcium Carbonate (CaCO₃ marble chips) + Dilute Hydrochloric Acid (HCl)',
    heatingRequired: false,
    densityVsAir: 'Denser than air (approx 1.5x)',
    solubilityInWater: 'Fairly soluble in cold water; insoluble in warm water',
    compatibleDrying: ['concH2SO4', 'anhydrousCaCl2'],
    dryingExplanations: {
      concH2SO4: 'Suitable: Acidic gas does not react with acidic concentrated H₂SO₄.',
      anhydrousCaCl2: 'Suitable: Neutral drying agent does not react with CO₂.',
      quicklimeCaO: 'Incorrect: Quicklime (CaO) is basic and reacts with CO₂ to form CaCO₃: CaO + CO₂ → CaCO₃!'
    },
    compatibleCollection: ['downwardDelivery'],
    collectionExplanations: {
      downwardDelivery: 'Optimal: CO₂ is 1.5x denser than air and displaces air upwards.',
      overWater: 'Acceptable only if water is warm or acidified, as CO₂ dissolves in cold water.',
      upwardDelivery: 'Incorrect: CO₂ is much denser than air and will sink immediately out of the jar.'
    },
    tests: {
      limeWater: {
        result: 'Lime water (calcium hydroxide solution) turns milky with a white precipitate of CaCO₃.',
        inference: 'Acidic oxide forming insoluble carbonate; confirms Carbon Dioxide (CO₂).',
        status: 'success'
      },
      burningSplint: {
        result: 'The burning wooden splint is extinguished immediately.',
        inference: 'Does not support combustion; characteristic of CO₂.',
        status: 'success'
      },
      dampLitmus: {
        result: 'Moist blue litmus paper turns red; red litmus paper remains red.',
        inference: 'Acidic gas (forms carbonic acid, H₂CO₃).',
        status: 'success'
      },
      glowingSplint: {
        result: 'Glowing splint is extinguished immediately.',
        inference: 'Non-supporter of combustion.',
        status: 'neutral'
      },
      dichromate: {
        result: 'Acidified K₂Cr₂O₇ remains orange.',
        inference: 'Not a reducing gas.',
        status: 'neutral'
      },
      starchIodide: {
        result: 'Moist starch-iodide paper remains white.',
        inference: 'No oxidation of iodide ions.',
        status: 'neutral'
      },
      hclRod: {
        result: 'No reaction observed.',
        inference: 'Not an alkaline gas.',
        status: 'neutral'
      }
    },
    questions: [
      {
        id: 'q_co2_lime',
        prompt: 'What chemical equation explains why lime water turns milky in the presence of CO₂?',
        options: [
          'Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s) + H₂O(l)',
          'CaCl₂(aq) + CO₂(g) + H₂O(l) → CaCO₃(s) + 2HCl(aq)',
          'CaO(s) + CO₂(g) → CaCO₃(s)',
          'Ca(HCO₃)₂(aq) → CaCO₃(s) + CO₂(g) + H₂O(l)'
        ],
        correctIndex: 0
      },
      {
        id: 'q_co2_excess',
        prompt: 'What happens when excess CO₂ gas is bubbled into the milky lime water for a prolonged time?',
        options: [
          'The white precipitate dissolves to form a clear solution of soluble Calcium Hydrogen Carbonate [Ca(HCO₃)₂]',
          'The solution turns deep yellow due to chlorine contamination',
          'A permanent dense black precipitate of carbon forms',
          'The solution becomes intensely alkaline and boils vigorously'
        ],
        correctIndex: 0
      }
    ]
  },

  Cl2: {
    key: 'Cl2',
    name: 'Chlorine Gas',
    formula: 'Cl₂',
    equation: 'MnO₂(s) + 4HCl(conc)  —[Δ]→  MnCl₂(aq) + 2H₂O(l) + Cl₂(g)',
    reactants: 'Manganese(IV) Oxide (MnO₂) + Concentrated Hydrochloric Acid (HCl)',
    heatingRequired: true,
    densityVsAir: 'Denser than air (approx 2.5x)',
    solubilityInWater: 'Soluble in water (forms chlorine water / HOCl)',
    compatibleDrying: ['concH2SO4'],
    dryingExplanations: {
      concH2SO4: 'Optimal: Concentrated H₂SO₄ is the standard drying agent for dry Chlorine.',
      anhydrousCaCl2: 'Not recommended: Can absorb small amounts of chlorine.',
      quicklimeCaO: 'Incorrect: Quicklime is basic and reacts vigorously with acidic Cl₂: 2CaO + 2Cl₂ → CaCl₂ + Ca(OCl)₂!'
    },
    compatibleCollection: ['downwardDelivery'],
    collectionExplanations: {
      downwardDelivery: 'Optimal: Chlorine is 2.5x denser than air and displaces air upwards in a fume cupboard.',
      overWater: 'Incorrect: Chlorine dissolves readily in water to form chlorine water.',
      upwardDelivery: 'Incorrect: Chlorine is much denser than air and sinks rapidly.'
    },
    tests: {
      dampLitmus: {
        result: 'Moist blue litmus paper turns red, and is then rapidly bleached WHITE.',
        inference: 'Acidic and powerful bleaching agent due to formation of chloric(I) acid (HOCl); confirms Chlorine (Cl₂).',
        status: 'success'
      },
      starchIodide: {
        result: 'Moist starch-iodide paper turns intensely BLUE-BLACK.',
        inference: 'Strong oxidizing agent; oxidizes 2I⁻ to I₂ which complexes with starch: Cl₂ + 2I⁻ → 2Cl⁻ + I₂; confirms Chlorine (Cl₂).',
        status: 'success'
      },
      burningSplint: {
        result: 'The burning splint is extinguished, leaving dense sooty fumes.',
        inference: 'Does not support wood combustion.',
        status: 'neutral'
      },
      glowingSplint: {
        result: 'Extinguished immediately.',
        inference: 'Non-combustion supporter.',
        status: 'neutral'
      },
      limeWater: {
        result: 'No milky precipitate; solution slowly decolourizes indicators.',
        inference: 'Not carbon dioxide.',
        status: 'neutral'
      },
      dichromate: {
        result: 'Remains orange (Chlorine is an oxidizer, not a reducer).',
        inference: 'Not a reducing gas.',
        status: 'neutral'
      },
      hclRod: {
        result: 'No dense white fumes formed.',
        inference: 'Not ammonia.',
        status: 'neutral'
      }
    },
    questions: [
      {
        id: 'q_cl2_bleach',
        prompt: 'Why does moist blue litmus paper turn red before turning white in Chlorine gas?',
        options: [
          'Cl₂ reacts with water to form acidic HCl (turns red) and bleaching HOCl (bleaches white)',
          'Cl₂ is basic initially and turns acidic when heated',
          'Litmus dye decomposes thermally due to heat of reaction',
          'Chlorine extracts moisture from paper, crystallizing the dye'
        ],
        correctIndex: 0
      },
      {
        id: 'q_cl2_safety',
        prompt: 'Why must Chlorine preparation be conducted strictly inside a functional fume chamber?',
        options: [
          'Chlorine gas is highly toxic, choking, and causes severe pulmonary irritation upon inhalation',
          'Chlorine gas is highly flammable and spontaneously explodes in room air',
          'Chlorine gas liquefies and freezes glassware on contact',
          'Chlorine emits radioactive gamma rays during heating'
        ],
        correctIndex: 0
      }
    ]
  },

  NH3: {
    key: 'NH3',
    name: 'Ammonia Gas',
    formula: 'NH₃',
    equation: '2NH₄Cl(s) + Ca(OH)₂(s)  —[Δ]→  CaCl₂(s) + 2H₂O(l) + 2NH₃(g)',
    reactants: 'Ammonium Chloride (NH₄Cl) + Calcium Hydroxide (Ca(OH)₂ / Slaked Lime)',
    heatingRequired: true,
    densityVsAir: 'Less dense than air (approx 0.6x)',
    solubilityInWater: 'Extremely soluble in water (approx 700 vol per vol water at STP)',
    compatibleDrying: ['quicklimeCaO'],
    dryingExplanations: {
      quicklimeCaO: 'Optimal: Calcium Oxide (CaO) is basic and does NOT react with basic Ammonia.',
      concH2SO4: 'FATAL ERROR: Concentrated H₂SO₄ is acidic and reacts violently with NH₃ to form (NH₄)₂SO₄: 2NH₃ + H₂SO₄ → (NH₄)₂SO₄!',
      anhydrousCaCl2: 'FATAL ERROR: Fused CaCl₂ reacts with NH₃ to form an addition complex: CaCl₂ + 8NH₃ → CaCl₂·8NH₃!'
    },
    compatibleCollection: ['upwardDelivery'],
    collectionExplanations: {
      upwardDelivery: 'Optimal: Ammonia is less dense than air and displaces air downwards.',
      overWater: 'FATAL ERROR: Ammonia is extremely soluble in water (fountain effect) and cannot be collected over water.',
      downwardDelivery: 'Incorrect: Ammonia is lighter than air and escapes into the room.'
    },
    tests: {
      dampLitmus: {
        result: 'Moist red litmus paper turns distinctly BLUE; blue litmus remains blue.',
        inference: 'The only common alkaline gas; confirms Ammonia (NH₃).',
        status: 'success'
      },
      hclRod: {
        result: 'A glass rod dipped in concentrated HCl produces DENSE WHITE FUMES of Ammonium Chloride (NH₄Cl).',
        inference: 'Reaction: NH₃(g) + HCl(g) → NH₄Cl(s); definitive confirmatory test for Ammonia (NH₃).',
        status: 'success'
      },
      burningSplint: {
        result: 'Extinguished immediately; does not support combustion in air.',
        inference: 'Non-supporter of combustion in air.',
        status: 'neutral'
      },
      glowingSplint: {
        result: 'Extinguished immediately.',
        inference: 'Non-supporter.',
        status: 'neutral'
      },
      limeWater: {
        result: 'Remains clear; no milky precipitate.',
        inference: 'Not an acidic carbonate former.',
        status: 'neutral'
      },
      dichromate: {
        result: 'Remains orange.',
        inference: 'Not a reducing gas.',
        status: 'neutral'
      },
      starchIodide: {
        result: 'Remains white.',
        inference: 'No oxidation.',
        status: 'neutral'
      }
    },
    questions: [
      {
        id: 'q_nh3_dry',
        prompt: 'Why CANNOT concentrated Sulphuric Acid be used to dry Ammonia gas?',
        options: [
          'Because Ammonia is basic and reacts with Sulphuric Acid to form Ammonium Sulphate [(NH₄)₂SO₄]',
          'Because Sulphuric Acid reduces Ammonia to toxic Hydrazine',
          'Because Sulphuric Acid solidifies at room temperature in Ammonia',
          'Because Ammonia decomposes Sulphuric Acid into Sulphur Trioxide'
        ],
        correctIndex: 0
      },
      {
        id: 'q_nh3_fume',
        prompt: 'What constitutes the dense white fumes formed when Ammonia meets concentrated Hydrochloric Acid vapor?',
        options: [
          'Tiny solid micro-crystals of Ammonium Chloride [NH₄Cl(s)] suspended in air',
          'Condensation of pure liquid water droplets',
          'Aerosolized chlorine gas bubbles',
          'Precipitated calcium chloride dust'
        ],
        correctIndex: 0
      }
    ]
  },

  SO2: {
    key: 'SO2',
    name: 'Sulphur Dioxide',
    formula: 'SO₂',
    equation: 'Na₂SO₃(s) + H₂SO₄(aq)  →  Na₂SO₄(aq) + H₂O(l) + SO₂(g)',
    reactants: 'Sodium Sulphite (Na₂SO₃) + Dilute Sulphuric Acid (H₂SO₄)',
    heatingRequired: false,
    densityVsAir: 'Denser than air (approx 2.2x)',
    solubilityInWater: 'Highly soluble in water (forms sulphurous acid, H₂SO₃)',
    compatibleDrying: ['concH2SO4', 'anhydrousCaCl2'],
    dryingExplanations: {
      concH2SO4: 'Optimal: Acidic gas does not react with concentrated H₂SO₄.',
      anhydrousCaCl2: 'Suitable: Neutral drying agent does not react with SO₂.',
      quicklimeCaO: 'Incorrect: Quicklime is basic and reacts with acidic SO₂: CaO + SO₂ → CaSO₃!'
    },
    compatibleCollection: ['downwardDelivery'],
    collectionExplanations: {
      downwardDelivery: 'Optimal: SO₂ is 2.2x denser than air and displaces air upwards.',
      overWater: 'Incorrect: SO₂ is very soluble in water, forming sulphurous acid (H₂SO₃).',
      upwardDelivery: 'Incorrect: SO₂ is much denser than air and falls rapidly.'
    },
    tests: {
      dichromate: {
        result: 'Filter paper soaked in acidified Potassium Dichromate(VI) turns from ORANGE to GREEN (Cr³⁺ ions formed).',
        inference: 'Reducing agent: SO₂ is oxidized to SO₄²⁻ while Cr₂O₇²⁻ is reduced to green Cr³⁺; confirms Sulphur Dioxide (SO₂).',
        status: 'success'
      },
      dampLitmus: {
        result: 'Moist blue litmus paper turns RED, then slowly bleaches to faint white.',
        inference: 'Acidic gas and bleaching agent by reduction; characteristic of SO₂.',
        status: 'success'
      },
      burningSplint: {
        result: 'Extinguished immediately with a pungent choking smell of burning sulfur.',
        inference: 'Does not support combustion.',
        status: 'neutral'
      },
      glowingSplint: {
        result: 'Extinguished immediately.',
        inference: 'Non-supporter.',
        status: 'neutral'
      },
      limeWater: {
        result: 'Turns faintly milky (CaSO₃ precipitate), then clears upon bubbling.',
        inference: 'Acidic gas forming insoluble sulphite.',
        status: 'neutral'
      },
      starchIodide: {
        result: 'Remains white.',
        inference: 'Not an oxidizing halogen.',
        status: 'neutral'
      },
      hclRod: {
        result: 'No dense white fumes.',
        inference: 'Not ammonia.',
        status: 'neutral'
      }
    },
    questions: [
      {
        id: 'q_so2_dichromate',
        prompt: 'What ionic species is responsible for the green color when SO₂ reacts with acidified K₂Cr₂O₇?',
        options: [
          'Chromium(III) ions [Cr³⁺(aq)]',
          'Sulphate ions [SO₄²⁻(aq)]',
          'Potassium ions [K⁺(aq)]',
          'Manganese(II) ions [Mn²⁺(aq)]'
        ],
        correctIndex: 0
      },
      {
        id: 'q_so2_bleach_diff',
        prompt: 'How does the bleaching action of SO₂ differ fundamentally from that of Cl₂?',
        options: [
          'SO₂ bleaches by reduction (removes oxygen; reversible upon air exposure), whereas Cl₂ bleaches by oxidation (permanent)',
          'SO₂ bleaches permanently by oxidation, whereas Cl₂ bleaches reversibly',
          'SO₂ only bleaches inorganic minerals, whereas Cl₂ bleaches fabrics',
          'There is no chemical difference in their bleaching mechanisms'
        ],
        correctIndex: 0
      }
    ]
  },

  H2: {
    key: 'H2',
    name: 'Hydrogen Gas',
    formula: 'H₂',
    equation: 'Zn(s) + 2HCl(aq)  →  ZnCl₂(aq) + H₂(g)',
    reactants: 'Zinc Granules (Zn) + Dilute Hydrochloric Acid (HCl)',
    heatingRequired: false,
    densityVsAir: 'Least dense gas known (approx 0.07x density of air)',
    solubilityInWater: 'Virtually insoluble in water',
    compatibleDrying: ['concH2SO4', 'anhydrousCaCl2', 'quicklimeCaO'],
    dryingExplanations: {
      concH2SO4: 'Suitable: Neutral unreactive gas does not react with conc H₂SO₄.',
      anhydrousCaCl2: 'Suitable: Neutral unreactive gas.',
      quicklimeCaO: 'Suitable: Unreactive gas does not react with CaO.'
    },
    compatibleCollection: ['overWater', 'upwardDelivery'],
    collectionExplanations: {
      overWater: 'Optimal: Hydrogen is insoluble in water, allowing clean visible collection.',
      upwardDelivery: 'Suitable: Hydrogen is much lighter than air and rises rapidly.',
      downwardDelivery: 'Incorrect: Hydrogen is extremely light and will rise out of the jar immediately.'
    },
    tests: {
      burningSplint: {
        result: 'Burns with a faint pale-blue flame and a distinct sharp "POP" sound.',
        inference: 'Explosive combustion forming water: 2H₂ + O₂ → 2H₂O; definitive confirmatory test for Hydrogen (H₂).',
        status: 'success'
      },
      glowingSplint: {
        result: 'Extinguished immediately; does not support combustion itself without a spark/flame.',
        inference: 'Does not support combustion.',
        status: 'neutral'
      },
      dampLitmus: {
        result: 'Moist red and blue litmus papers both remain completely unaffected.',
        inference: 'Neutral gas; neither acidic nor basic.',
        status: 'success'
      },
      limeWater: {
        result: 'Remains clear.',
        inference: 'Not an acidic oxide.',
        status: 'neutral'
      },
      dichromate: {
        result: 'Remains orange.',
        inference: 'No redox color change at room temperature.',
        status: 'neutral'
      },
      starchIodide: {
        result: 'Remains white.',
        inference: 'No oxidation.',
        status: 'neutral'
      },
      hclRod: {
        result: 'No dense white fumes.',
        inference: 'Not ammonia.',
        status: 'neutral'
      }
    },
    questions: [
      {
        id: 'q_h2_pop',
        prompt: 'What causes the characteristic "pop" sound when a burning splint is introduced to Hydrogen gas?',
        options: [
          'Rapid exothermic combustion of Hydrogen with atmospheric Oxygen to form steam: 2H₂ + O₂ → 2H₂O',
          'Sudden cracking of the glass jar under extreme vacuum',
          'Decomposition of Hydrogen into atomic protons and electrons',
          'Instant condensation of hydrogen into liquid droplet shockwaves'
        ],
        correctIndex: 0
      },
      {
        id: 'q_h2_safety',
        prompt: 'Why is Copper(II) Sulphate (CuSO₄) crystal sometimes added as a catalyst in the Zn + HCl preparation of Hydrogen?',
        options: [
          'Cu²⁺ is displaced to form a Cu/Zn galvanic couple that significantly accelerates the reaction rate',
          'To impart a distinctive blue color to the evolved gas',
          'To act as an internal indicator for acid depletion',
          'To prevent the generation of toxic carbon monoxide impurities'
        ],
        correctIndex: 0
      }
    ]
  }
};

class GasPrepEngine {
  constructor() {
    this.currentGasKey = 'O2';
    this.currentGas = GAS_DATABASE.O2;
    this.selectedDrying = 'concH2SO4';
    this.selectedCollection = 'overWater';
    this.heatingEnabled = false;
    this.isReacting = false;
    this.gasGenerated = false;
    this.startTime = Date.now();
    this.testObservations = {};
    this.userAnswers = {};
    this.testsPerformed = 0;
    this.testsCorrect = 0;
  }

  selectGas(gasKey) {
    if (!GAS_DATABASE[gasKey]) return;
    this.currentGasKey = gasKey;
    this.currentGas = GAS_DATABASE[gasKey];
    this.gasGenerated = false;
    this.isReacting = false;
    this.testObservations = {};
    this.userAnswers = {};
    this.testsPerformed = 0;
    this.testsCorrect = 0;
    this.startTime = Date.now();

    // Default drying and collection selection
    if (this.currentGasKey === 'NH3') {
      this.selectedDrying = 'quicklimeCaO';
      this.selectedCollection = 'upwardDelivery';
    } else if (this.currentGasKey === 'CO2' || this.currentGasKey === 'Cl2' || this.currentGasKey === 'SO2') {
      this.selectedDrying = 'concH2SO4';
      this.selectedCollection = 'downwardDelivery';
    } else {
      this.selectedDrying = 'concH2SO4';
      this.selectedCollection = 'overWater';
    }

    this.heatingEnabled = this.currentGas.heatingRequired;
    return this.currentGas;
  }

  setDryingAgent(agentKey) {
    this.selectedDrying = agentKey;
    this.gasGenerated = false;
    return this.selectedDrying;
  }

  setCollectionMethod(methodKey) {
    this.selectedCollection = methodKey;
    this.gasGenerated = false;
    return this.selectedCollection;
  }

  toggleHeating() {
    this.heatingEnabled = !this.heatingEnabled;
    return this.heatingEnabled;
  }

  validateConfiguration() {
    const isDryingCorrect = this.currentGas.compatibleDrying.includes(this.selectedDrying);
    const isCollectionCorrect = this.currentGas.compatibleCollection.includes(this.selectedCollection);
    const heatingMatch = this.heatingEnabled === this.currentGas.heatingRequired;

    const dryingExpl = this.currentGas.dryingExplanations[this.selectedDrying] || 'Incompatible drying agent.';
    const collectionExpl = this.currentGas.collectionExplanations[this.selectedCollection] || 'Incompatible collection method.';

    return {
      isDryingCorrect,
      isCollectionCorrect,
      heatingMatch,
      dryingExpl,
      collectionExpl,
      isFullyCorrect: isDryingCorrect && isCollectionCorrect && heatingMatch
    };
  }

  runReaction() {
    const validation = this.validateConfiguration();
    this.isReacting = true;
    this.gasGenerated = true;
    return {
      success: true,
      validation,
      gas: this.currentGas
    };
  }

  performTest(testKey) {
    if (!this.gasGenerated) {
      return {
        error: 'Please generate and collect the gas first before testing.'
      };
    }

    const testDef = this.currentGas.tests[testKey];
    if (!testDef) {
      return {
        error: 'Unknown confirmatory test.'
      };
    }

    this.testsPerformed++;
    if (testDef.status === 'success') {
      this.testsCorrect++;
    }

    this.testObservations[testKey] = {
      timestamp: new Date().toLocaleTimeString(),
      result: testDef.result,
      inference: testDef.inference,
      status: testDef.status
    };

    return {
      success: true,
      testKey,
      observation: this.testObservations[testKey]
    };
  }

  answerQuestion(questionId, optionIndex) {
    this.userAnswers[questionId] = parseInt(optionIndex, 10);
    return this.userAnswers[questionId];
  }

  calculateRubric() {
    const validation = this.validateConfiguration();
    const qList = this.currentGas.questions || [];
    let qCorrect = 0;
    qList.forEach(q => {
      if (this.userAnswers[q.id] === q.correctIndex) {
        qCorrect++;
      }
    });

    const setupScore = (validation.isDryingCorrect ? 2.5 : 0) + (validation.isCollectionCorrect ? 2.5 : 0);
    const testScore = Math.min(3.0, (this.testsCorrect / Math.max(1, Object.keys(this.currentGas.tests).length)) * 3.0);
    const theoryScore = qList.length > 0 ? (qCorrect / qList.length) * 2.0 : 2.0;

    const totalScore = parseFloat((setupScore + testScore + theoryScore).toFixed(2));
    const maxScore = 10.0;
    const isPassing = totalScore >= 6.5;

    return {
      setupScore,
      testScore,
      theoryScore,
      totalScore,
      maxScore,
      qCorrect,
      qTotal: qList.length,
      isDryingCorrect: validation.isDryingCorrect,
      isCollectionCorrect: validation.isCollectionCorrect,
      isPassing,
      durationSeconds: Math.round((Date.now() - this.startTime) / 1000)
    };
  }

  buildSessionPayload(assignmentId = null, mode = 'selfPaced') {
    const rubric = this.calculateRubric();
    const validation = this.validateConfiguration();

    return {
      assignment_id: assignmentId,
      gas_key: this.currentGasKey,
      gas_name: `${this.currentGas.name} (${this.currentGas.formula})`,
      reactants: this.currentGas.reactants,
      drying_agent: this.selectedDrying,
      collection_method: this.selectedCollection,
      drying_correct: validation.isDryingCorrect,
      collection_correct: validation.isCollectionCorrect,
      tests_performed: this.testsPerformed,
      tests_correct: this.testsCorrect,
      test_observations: this.testObservations,
      questions_score: rubric.theoryScore,
      total_score: rubric.totalScore,
      rubric_breakdown: rubric,
      correct: rubric.isPassing,
      mode: mode,
      duration_seconds: rubric.durationSeconds
    };
  }
}

// Attach to window for browser execution
if (typeof window !== 'undefined') {
  window.GAS_DATABASE = GAS_DATABASE;
  window.GasPrepEngine = GasPrepEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GAS_DATABASE, GasPrepEngine };
}

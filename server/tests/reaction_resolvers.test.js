// ============================================================
//  VirtuLab Kenya — Simulation Reaction Resolvers Test Suite
//  Automated verification of qualitative inorganic reaction physics,
//  organic functional group reactions, and apparatus SVG dispatching.
// ============================================================

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const QualitativeBenchCore = require(path.join(rootDir, 'client', 'shared', 'qualitative-bench-core.js'));
const OrganicBenchCore = require(path.join(rootDir, 'client', 'shared', 'organic-bench-core.js'));

describe('Qualitative Bench Core (Inorganic Reactions)', () => {

  it('should export all required registry objects and resolver methods', () => {
    assert.ok(QualitativeBenchCore.SALTS, 'SALTS dictionary must exist');
    assert.ok(Object.keys(QualitativeBenchCore.SALTS).length >= 10, 'Must have at least 10 salt presets');
    assert.strictEqual(typeof QualitativeBenchCore.resolveSalt, 'function');
    assert.strictEqual(typeof QualitativeBenchCore.resolveReactionState, 'function');
    assert.strictEqual(typeof QualitativeBenchCore.renderApparatusSvg, 'function');
    assert.strictEqual(typeof QualitativeBenchCore.getMultiStageActions, 'function');
  });

  describe('Cation Precipitation with NaOH and NH₃', () => {
    // Copper (Cu2+)
    it('Cu²⁺: pale blue ppt with dropwise NaOH/NH₃; insoluble in excess NaOH, soluble in excess NH₃ to deep blue solution', () => {
      // With dropwise NaOH
      const naohDrops = QualitativeBenchCore.resolveReactionState('copperSulfate', 'q2_naoh', 'few_drops', 'Add 2M NaOH dropwise');
      assert.strictEqual(naohDrops.ppt, true, 'Cu2+ must form ppt with dropwise NaOH');
      assert.strictEqual(naohDrops.pptColor, '#38BDF8', 'Pale blue precipitate color');

      // With excess NaOH -> insoluble
      const naohExcess = QualitativeBenchCore.resolveReactionState('copperSulfate', 'q2_naoh', 'excess', 'Add 2M NaOH dropwise until in excess');
      assert.strictEqual(naohExcess.ppt, true, 'Cu2+ ppt must persist in excess NaOH');
      assert.strictEqual(naohExcess.pptDissolved, false, 'Cu(OH)2 is insoluble in excess NaOH');

      // With dropwise NH3 -> pale blue ppt
      const nh3Drops = QualitativeBenchCore.resolveReactionState('copperSulfate', 'q2_nh3', 'few_drops', 'Add 2M aqueous ammonia dropwise');
      assert.strictEqual(nh3Drops.ppt, true, 'Cu2+ must form pale blue ppt with dropwise NH3');

      // With excess NH3 -> dissolves to form deep blue tetraamminecopper(II)
      const nh3Excess = QualitativeBenchCore.resolveReactionState('copperSulfate', 'q2_nh3', 'excess', 'Add 2M aqueous ammonia dropwise until in excess');
      assert.strictEqual(nh3Excess.pptDissolved, true, 'Cu2+ ppt must dissolve in excess NH3');
      assert.strictEqual(nh3Excess.complexDeepBlue, true, 'Must form deep blue complex solution');
    });

    // Zinc (Zn2+)
    it('Zn²⁺: white ppt soluble in both excess NaOH and excess NH₃ (amphoteric & forms zincate / tetraamminezinc)', () => {
      // NaOH dropwise -> white ppt
      const naohDrops = QualitativeBenchCore.resolveReactionState('zincSulfate', 'q2_naoh', 'few_drops', 'Add NaOH dropwise');
      assert.strictEqual(naohDrops.ppt, true);
      assert.strictEqual(naohDrops.pptColor, '#FFFFFF');

      // NaOH excess -> dissolves
      const naohExcess = QualitativeBenchCore.resolveReactionState('zincSulfate', 'q2_naoh', 'excess', 'Add NaOH in excess');
      assert.strictEqual(naohExcess.pptDissolved, true, 'Zn(OH)2 dissolves in excess NaOH');

      // NH3 dropwise -> white ppt
      const nh3Drops = QualitativeBenchCore.resolveReactionState('zincSulfate', 'q2_nh3', 'few_drops', 'Add NH3 dropwise');
      assert.strictEqual(nh3Drops.ppt, true);

      // NH3 excess -> dissolves
      const nh3Excess = QualitativeBenchCore.resolveReactionState('zincSulfate', 'q2_nh3', 'excess', 'Add NH3 in excess');
      assert.strictEqual(nh3Excess.pptDissolved, true, 'Zn(OH)2 dissolves in excess NH3');
    });

    // Lead (Pb2+) vs Aluminium (Al3+) differentiation with NH3
    it('Pb²⁺ / Al³⁺: white ppt soluble in excess NaOH, but INSOLUBLE in excess NH₃', () => {
      ['leadNitrate', 'aluminumNitrate'].forEach(saltKey => {
        // Dropwise NaOH -> white ppt
        const naohDrops = QualitativeBenchCore.resolveReactionState(saltKey, 'q2_naoh', 'few_drops', 'Add NaOH dropwise');
        assert.strictEqual(naohDrops.ppt, true, `${saltKey} forms white ppt with NaOH drops`);

        // Excess NaOH -> soluble
        const naohExcess = QualitativeBenchCore.resolveReactionState(saltKey, 'q2_naoh', 'excess', 'Add NaOH in excess');
        assert.strictEqual(naohExcess.pptDissolved, true, `${saltKey} dissolves in excess NaOH`);

        // Excess NH3 -> insoluble
        const nh3Excess = QualitativeBenchCore.resolveReactionState(saltKey, 'q2_nh3', 'excess', 'Add aqueous ammonia in excess');
        assert.strictEqual(nh3Excess.ppt, true, `${saltKey} ppt persists in excess NH3`);
        assert.strictEqual(nh3Excess.pptDissolved, false, `${saltKey} must NOT dissolve in excess NH3`);
      });
    });

    // Iron (Fe2+ and Fe3+)
    it('Fe²⁺ / Fe³⁺: green vs brown ppt, insoluble in excess of both reagents', () => {
      // Fe2+ -> dirty green ppt
      const fe2 = QualitativeBenchCore.resolveReactionState('ironSulfate', 'q2_naoh', 'few_drops', 'Add NaOH dropwise');
      assert.strictEqual(fe2.ppt, true);
      assert.strictEqual(fe2.pptColor, '#15803D');

      // Fe3+ -> brown ppt
      const fe3 = QualitativeBenchCore.resolveReactionState('ironChloride', 'q2_naoh', 'few_drops', 'Add NaOH dropwise');
      assert.strictEqual(fe3.ppt, true);
      assert.strictEqual(fe3.pptColor, '#991B1B');
    });

    // Calcium (Ca2+)
    it('Ca²⁺: white ppt with NaOH (insoluble in excess), NO ppt with aqueous NH₃', () => {
      const caNaoh = QualitativeBenchCore.resolveReactionState('calciumChloride', 'q2_naoh', 'few_drops', 'Add NaOH dropwise');
      assert.strictEqual(caNaoh.ppt, true, 'Ca2+ gives white ppt with NaOH');

      const caNh3 = QualitativeBenchCore.resolveReactionState('calciumChloride', 'q2_nh3', 'few_drops', 'Add NH3 dropwise');
      assert.strictEqual(caNh3.ppt, false, 'Ca2+ does not give ppt with aqueous NH3 (Ca(OH)2 is sparingly soluble and NH3 is weak base)');
    });
  });

  describe('Anion Precipitation & Acid Solubilities', () => {
    // Sulfate (SO4^2-)
    it('SO₄²⁻: dense white ppt with BaCl₂/Ba(NO₃)₂, INSOLUBLE in dilute acid', () => {
      const res = QualitativeBenchCore.resolveReactionState('zincSulfate', 'q2_anion', 'stage1', 'Add dilute HNO3 followed by Ba(NO3)2');
      assert.strictEqual(res.ppt, true, 'BaSO4 white ppt must form');
      assert.strictEqual(res.pptColor, '#FFFFFF');
      assert.strictEqual(res.pptDissolved, false, 'BaSO4 is insoluble in dilute acid');
    });

    // Sulfite (SO3^2-) with obsStr
    it('SO₃²⁻: white ppt with BaCl₂, dissolves in dilute acid', () => {
      const res = QualitativeBenchCore.resolveReactionState('sodiumSulfite', 'q2_anion', 'excess', 'Add BaCl2 followed by dilute HCl', 'white precipitate dissolves in dilute acid');
      assert.strictEqual(res.ppt, true);
      assert.strictEqual(res.pptDissolved, true, 'Precipitate dissolves in acid');
    });

    // Carbonate (CO3^2-)
    it('CO₃²⁻: effervescence with dilute acids', () => {
      const res = QualitativeBenchCore.resolveReactionState('sodiumCarbonate', 'q2_acid', 'done', 'To the solid add dilute HCl');
      assert.strictEqual(res.bubbling, true, 'Must exhibit bubbling/effervescence (CO2 gas)');
    });

    // Hydrogen Carbonate (HCO3-)
    it('HCO₃⁻: effervescence with dilute acids', () => {
      const res = QualitativeBenchCore.resolveReactionState('sodiumHydrogenCarbonate', 'q2_acid', 'done', 'To the solid add dilute HCl');
      assert.strictEqual(res.bubbling, true, 'Must exhibit bubbling/effervescence (CO2 gas)');
    });

    // Chloride (Cl-)
    it('Cl⁻: white ppt with AgNO₃, insoluble in HNO₃', () => {
      const res = QualitativeBenchCore.resolveReactionState('ironChloride', 'q2_anion', 'stage1', 'Add dilute HNO3 followed by AgNO3 solution');
      assert.strictEqual(res.ppt, true, 'AgCl white ppt forms');
      assert.strictEqual(res.pptColor, '#FFFFFF');
    });

    // Chloride (Cl-) with Lead(II) Nitrate (KNEC Standard Practical Method)
    it('Cl⁻: white ppt with Pb(NO₃)₂, dissolves on warming, reappears on cooling', () => {
      // Step 1: Cold addition
      const step1 = QualitativeBenchCore.resolveReactionState('ironChloride', 'pb_no3', 'few_drops', 'Add 2–3 drops of Pb(NO3)2 solution');
      assert.strictEqual(step1.ppt, true, 'PbCl2 white ppt forms in cold');
      assert.strictEqual(step1.pptColor, '#FFFFFF');
      assert.strictEqual(step1.isPbNO3, true);

      // Step 2: Warm mixture
      const step2 = QualitativeBenchCore.resolveReactionState('ironChloride', 'pb_no3', 'heated', 'Warm the mixture gently');
      assert.strictEqual(step2.ppt, false, 'PbCl2 precipitate must dissolve on warming');
      assert.strictEqual(step2.pptDissolved, true, 'Precipitate is dissolved');

      // Step 3: Cool under tap
      const step3 = QualitativeBenchCore.resolveReactionState('ironChloride', 'pb_no3', 'cooled', 'Cool under tap water');
      assert.strictEqual(step3.ppt, true, 'PbCl2 white crystals must recrystallize on cooling');
    });

    it('SO₄²⁻: white ppt with Pb(NO₃)₂, remains insoluble on boiling', () => {
      // Step 1: Cold addition
      const step1 = QualitativeBenchCore.resolveReactionState('zincSulfate', 'pb_no3', 'few_drops', 'Add 2–3 drops of Pb(NO3)2 solution');
      assert.strictEqual(step1.ppt, true, 'PbSO4 white ppt forms');

      // Step 2: Warm mixture
      const step2 = QualitativeBenchCore.resolveReactionState('zincSulfate', 'pb_no3', 'heated', 'Warm the mixture gently');
      assert.strictEqual(step2.ppt, true, 'PbSO4 white ppt must remain insoluble on warming');
      assert.strictEqual(step2.pptDissolved, false, 'PbSO4 does not dissolve');
    });

    // Bromide (Br-)
    it('Br⁻: pale cream ppt with AgNO₃, sparingly soluble in dilute NH₃', () => {
      const step2 = QualitativeBenchCore.resolveReactionState('potassiumBromide', 'agno3', 'step2_agno3', 'Add dilute HNO3 followed by AgNO3');
      assert.strictEqual(step2.ppt, true, 'AgBr pale cream ppt forms');
      assert.strictEqual(step2.pptColor, '#FEF08A', 'AgBr pale cream color');

      const step3 = QualitativeBenchCore.resolveReactionState('potassiumBromide', 'agno3', 'step3_nh3', 'Test precipitate with aqueous NH3');
      assert.strictEqual(step3.ppt, true, 'AgBr is sparingly soluble / persists in dilute NH3');
      assert.strictEqual(step3.pptDissolved, false);
    });

    // Iodide (I-)
    it('I⁻: bright yellow ppt with AgNO₃, completely insoluble in aqueous NH₃', () => {
      const step2 = QualitativeBenchCore.resolveReactionState('sodiumIodide', 'agno3', 'step2_agno3', 'Add dilute HNO3 followed by AgNO3');
      assert.strictEqual(step2.ppt, true, 'AgI bright yellow ppt forms');
      assert.strictEqual(step2.pptColor, '#FACC15', 'AgI bright yellow color');

      const step3 = QualitativeBenchCore.resolveReactionState('sodiumIodide', 'agno3', 'step3_nh3', 'Test precipitate with aqueous NH3');
      assert.strictEqual(step3.ppt, true, 'AgI is completely insoluble in aqueous NH3');
      assert.strictEqual(step3.pptDissolved, false);
    });

    // Sulfite (SO3^2-) with acid effervescence of SO2
    it('SO₃²⁻: effervescence of choking SO₂ gas with dilute HCl', () => {
      const res = QualitativeBenchCore.resolveReactionState('sodiumSulfite', 'hcl', 'step1_hcl', 'Add 2M HCl to solid');
      assert.strictEqual(res.bubbling, true, 'Effervescence of SO2 must occur');
    });

    // Regression check for isStep1 bug: single-step anion tests with stage === 'stage1' must form ppt
    it('REGRESSION: single-step stage === "stage1" tests must form precipitate', () => {
      const testCases = [
        { salt: 'zincSulfate', prompt: 'Add 3 drops of BaCl2 solution' },
        { salt: 'ironChloride', prompt: 'Add 3 drops of AgNO3 solution' },
        { salt: 'ironChloride', prompt: 'Add 3 drops of Pb(NO3)2 solution' },
        { salt: 'copperSulfate', prompt: 'Add 3 drops of Ba(NO3)2 solution' }
      ];
      testCases.forEach(tc => {
        const state = QualitativeBenchCore.resolveReactionState(tc.salt, 'q2_anion', 'stage1', tc.prompt);
        assert.strictEqual(state.ppt, true, `Precipitate must form for prompt: "${tc.prompt}" on ${tc.salt}`);
      });
    });
  });

  describe('Dry Thermal Heating of Solid in Hard-Glass Tube', () => {
    it('NH₄Cl: white solid sublimes directly with dense white fumes depositing on upper cooler walls', () => {
      const res = QualitativeBenchCore.resolveReactionState('ammoniumChloride', 'heat_solid', 'step1_heat', 'Heat solid strongly in hard-glass tube');
      assert.strictEqual(res.sublimes, true, 'NH4Cl must undergo sublimation');
      assert.strictEqual(res.gasType, 'sublimate_deposit', 'Deposits on cooler tube walls');
    });

    it('CuSO₄·5H₂O: blue hydrated crystals turn white anhydrous powder with condensed water droplets', () => {
      const res = QualitativeBenchCore.resolveReactionState('copperSulfate', 'heat_solid', 'step1_heat', 'Heat solid in hard-glass tube');
      assert.strictEqual(res.waterCondenses, true, 'Water droplets must condense');
      assert.strictEqual(res.residueColor, '#F1F5F9', 'Residue turns white anhydrous CuSO4');
    });

    it('Pb(NO₃)₂: dense brown fumes of NO₂ and residue yellow cold, brown hot', () => {
      const res = QualitativeBenchCore.resolveReactionState('leadNitrate', 'heat_solid', 'step1_heat', 'Heat dry solid');
      assert.strictEqual(res.gasType, 'no2_brown', 'NO2 brown fumes evolved');
      assert.strictEqual(res.gasColor, '#78350F');
      assert.strictEqual(res.residueColor, '#CA8A04');
    });

    it('ZnSO₄: residue turns yellow when hot, white on cooling (ZnO formation)', () => {
      const res = QualitativeBenchCore.resolveReactionState('zincSulfate', 'heat_solid', 'step1_heat', 'Heat dry solid strongly');
      assert.strictEqual(res.residueColor, '#FACC15', 'Hot ZnO residue is yellow');
      assert.strictEqual(res.waterCondenses, true, 'Water of crystallization condenses');

      const cooled = QualitativeBenchCore.resolveReactionState('zincSulfate', 'heat_solid', 'cooled', 'Heat dry solid');
      assert.strictEqual(cooled.residueColor, '#FFFFFF', 'Cooled ZnO residue reverts to white');
    });

    it('Pb(NO₃)₂: decrepitation, hot/cold residue (#CA8A04 hot -> #FACC15 cold), and O₂ evolution', () => {
      const res = QualitativeBenchCore.resolveReactionState('leadNitrate', 'heat_solid', 'step1_heat', 'Heat strongly');
      assert.strictEqual(res.decrepitates, true, 'Pb(NO3)2 crackles/decrepitates on heating');
      assert.strictEqual(res.evolvesO2, true, 'Oxygen gas evolved');
      assert.strictEqual(res.evolvesNO2, true, 'NO2 gas evolved');
      assert.strictEqual(res.residueColor, '#CA8A04', 'Hot PbO is reddish-brown/orange');

      const cooled = QualitativeBenchCore.resolveReactionState('leadNitrate', 'heat_solid', 'cooled', 'Heat dry solid');
      assert.strictEqual(cooled.residueColor, '#FACC15', 'Cooled PbO is bright canary yellow');
    });

    it('(NH₄)₂CO₃: decomposes completely leaving NO residue, evolves alkaline NH₃ and acidic CO₂', () => {
      const res = QualitativeBenchCore.resolveReactionState('ammoniumCarbonate', 'heat_solid', 'step1_heat', 'Heat strongly');
      assert.strictEqual(res.decomposesCompletely, true, 'Leaves no residue in tube');
      assert.strictEqual(res.residueColor, null, 'No solid remains');
      assert.strictEqual(res.evolvesNH3, true, 'Ammonia evolved');
      assert.strictEqual(res.evolvesCO2, true, 'CO2 evolved');
    });

    it('NaHCO₃: decomposes to evolve CO₂ (limewater milky), condenses water droplets, leaving white residue', () => {
      const res = QualitativeBenchCore.resolveReactionState('sodiumHydrogenCarbonate', 'heat_solid', 'step1_heat', 'Heat dry solid strongly');
      assert.strictEqual(res.waterCondenses, true, 'Water droplets must condense on upper cooler walls');
      assert.strictEqual(res.evolvesCO2, true, 'CO2 gas must be evolved');
      assert.strictEqual(res.residueColor, '#FFFFFF', 'White Na2CO3 residue remains');
      assert.strictEqual(res.decomposesCompletely, false, 'White residue does not disappear completely');

      const cooled = QualitativeBenchCore.resolveReactionState('sodiumHydrogenCarbonate', 'heat_solid', 'cooled', 'Heat dry solid');
      assert.strictEqual(cooled.residueColor, '#FFFFFF', 'White residue remains on cooling');
    });

    it('NaHCO₃: renders hard-glass tube SVG with water droplets and milky limewater test probe', () => {
      const svg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'sodiumHydrogenCarbonate',
        testId: 'heat_solid',
        stage: 'step2_gas_test',
        prompt: 'Heat solid in hard-glass tube and test gas with limewater'
      });
      assert.ok(svg.includes('LIMEWATER: TURNED MILKY (CO₂)'), 'Must show milky limewater probe for NaHCO3');
      assert.ok(svg.includes('Condensed Water Droplets'), 'Must show condensed water droplets for NaHCO3 decomposition');
    });

    it('should generate multi-stage actions: heated at idle, step2_gas_test at heated, and cooled at gas_test', () => {
      const idleActions = QualitativeBenchCore.getMultiStageActions('heat_solid', 'Heat solid in hard-glass tube', 'idle');
      assert.strictEqual(idleActions.length, 1);
      assert.ok(idleActions[0].stage === 'heated' || idleActions[0].stage === 'step1_heat');
      assert.ok(idleActions[0].label.includes('Heat'));

      const heatActions = QualitativeBenchCore.getMultiStageActions('heat_solid', 'Heat solid in hard-glass tube', 'heated');
      assert.strictEqual(heatActions.length, 2);
      assert.strictEqual(heatActions[0].stage, 'step2_gas_test');
      assert.ok(heatActions[1].isRedo || heatActions[1].stage === 'idle');

      const gasActions = QualitativeBenchCore.getMultiStageActions('heat_solid', 'Heat solid in hard-glass tube', 'step2_gas_test');
      assert.strictEqual(gasActions[0].stage, 'cooled');
      assert.ok(gasActions[0].label.includes('Cool'));
    });

    it('should render valid hard-glass tube SVG with 35° tilt, Bunsen flame, and interactive probes', () => {
      const svg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'leadNitrate',
        testId: 'heat_solid',
        stage: 'step1_heat',
        prompt: 'Heat solid in hard-glass tube',
        obsStr: 'Brown fumes of NO2'
      });
      assert.ok(svg.includes('<svg'), 'Output must be an SVG element');
      assert.ok(svg.includes('rotate(-35'), 'Hard-glass tube must be tilted at 35 degrees');
      assert.ok(svg.includes('heatWave'), 'Bunsen heating waves must be rendered');
      assert.ok(svg.includes('anim-decrepitate'), 'Pb(NO3)2 must show decrepitation animation');

      // Test Glowing Splint rekindling on Nitrate
      const splintSvg = QualitativeBenchCore.renderDryHeatingApparatusSvg({
        saltKey: 'leadNitrate',
        stage: 'test_splint',
        probe: 'glowing_splint'
      });
      assert.ok(splintSvg.includes('SPLINT REKINDLES'), 'Glowing splint rekindles in O2');

      // Test Blue Litmus turning red on Nitrate
      const litmusSvg = QualitativeBenchCore.renderDryHeatingApparatusSvg({
        saltKey: 'leadNitrate',
        stage: 'test_gas_blue_litmus',
        probe: 'blue_litmus'
      });
      assert.ok(litmusSvg.includes('TURNED RED'), 'Moist blue litmus turns red with NO2');

      // Test Red Litmus turning blue on Ammonium Carbonate
      const redLitmusSvg = QualitativeBenchCore.renderDryHeatingApparatusSvg({
        saltKey: 'ammoniumCarbonate',
        stage: 'test_gas_red_litmus',
        probe: 'red_litmus'
      });
      assert.ok(redLitmusSvg.includes('TURNED BLUE'), 'Moist red litmus turns blue with NH3');

      // Test Cooling State
      const cooledSvg = QualitativeBenchCore.renderDryHeatingApparatusSvg({
        saltKey: 'leadNitrate',
        stage: 'cooled'
      });
      assert.ok(cooledSvg.includes('COOLED'), 'Cooling status badge is rendered');
    });
  });

  describe('Clean Glass Rod Flame Emission Tests (KNEC Standard)', () => {
    it('should resolve flame test when prompt dips clean glass rod into solution', () => {
      const res = QualitativeBenchCore.resolveReactionState('calciumChloride', 'q2_flame', 'stage1', 'Dip a clean glass rod into the solution and place it in the non-luminous flame');
      assert.strictEqual(res.isFlameTest, true, 'Must identify flame test with glass rod');
      assert.ok(res.statusLabel.includes('Brick-red'), 'Ca²⁺ emits brick-red flame');

      const kRes = QualitativeBenchCore.resolveReactionState('potassiumChloride', 'q2_flame', 'stage1', 'Dip a clean glass rod into the solution and place it in the non-luminous flame');
      assert.strictEqual(kRes.isFlameTest, true);
      assert.ok(kRes.statusLabel.includes('lilac'), 'K⁺ emits lilac flame');
    });

    it('should render clean borosilicate glass rod in flame test SVG', () => {
      const svg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'calciumChloride',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip a clean glass rod into the solution and place it in the non-luminous flame'
      });
      assert.ok(svg.includes('Glass Rod'), 'Must render glass rod in flame apparatus');
      assert.ok(!svg.includes('Nichrome Wire'), 'Must not render legacy nichrome wire');
    });

    it('should provide action button to place glass rod into flame', () => {
      const actions = QualitativeBenchCore.getMultiStageActions('q2_flame', 'Dip a clean glass rod into the solution and place it in the non-luminous flame', 'idle');
      assert.strictEqual(actions.length, 1);
      assert.strictEqual(actions[0].stage, 'flame_tested');
      assert.ok(actions[0].label.includes('Glass Rod'));
    });

    it('should correctly handle Cobalt Blue Glass optical absorption for Na+ and transmission for K+', () => {
      // 1. Unfiltered Flame Test (Sodium vs Potassium)
      const naSvgUnfiltered = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'sodiumCarbonate',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip a clean glass rod into the solution and place it in the non-luminous flame',
        isCobaltGlass: false
      });
      assert.ok(naSvgUnfiltered.includes('#FACC15'), 'Unfiltered sodium flame must be intense golden yellow');
      assert.ok(!naSvgUnfiltered.includes('COBALT GLASS'), 'Unfiltered SVG must not have cobalt glass plate');

      const kSvgUnfiltered = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'potassiumChloride',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip a clean glass rod into the solution and place it in the non-luminous flame',
        isCobaltGlass: false
      });
      assert.ok(kSvgUnfiltered.includes('#C084FC'), 'Unfiltered potassium flame must be lilac');

      // 2. Filtered through Cobalt Blue Glass
      const naSvgFiltered = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'sodiumCarbonate',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip a clean glass rod into the solution and place it in the non-luminous flame',
        isCobaltGlass: true
      });
      assert.ok(naSvgFiltered.includes('COBALT GLASS'), 'Filtered SVG must render the COBALT GLASS plate overlay');
      assert.ok(naSvgFiltered.includes('rgba(148, 163, 184, 0.22)'), 'Sodium golden yellow must be absorbed through cobalt glass');

      const kSvgFiltered = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'potassiumChloride',
        testId: 'q2_flame',
        stage: 'done',
        prompt: 'Dip a clean glass rod into the solution and place it in the non-luminous flame',
        isCobaltGlass: true
      });
      assert.ok(kSvgFiltered.includes('COBALT GLASS'), 'Filtered SVG must render the COBALT GLASS plate overlay');
      assert.ok(kSvgFiltered.includes('#F472B6') || kSvgFiltered.includes('#C084FC'), 'Potassium lilac/violet must transmit through cobalt glass');

      // 3. Reaction State Status Label with Cobalt Glass
      const naStateFiltered = QualitativeBenchCore.resolveReactionState('sodiumCarbonate', 'q2_flame', 'done', 'Dip a clean glass rod into flame', '', { isCobaltGlass: true });
      assert.ok(naStateFiltered.statusLabel.includes('completely absorbed'), 'Sodium emission absorbed through cobalt glass');

      const kStateFiltered = QualitativeBenchCore.resolveReactionState('potassiumChloride', 'q2_flame', 'done', 'Dip a clean glass rod into flame', '', { isCobaltGlass: true });
      assert.ok(kStateFiltered.statusLabel.includes('Pale lilac') || kStateFiltered.statusLabel.includes('purple'), 'Potassium lilac emission shines through cobalt glass');
    });
  });

  describe('Multi-Stage Action Controls', () => {
    it('should generate dropwise at idle, excess at few_drops, and single button for non-staged tests', () => {
      // At idle: Step 1 (Dropwise)
      const naohIdle = QualitativeBenchCore.getMultiStageActions('q2_naoh', 'Add 2M NaOH dropwise until in excess', 'idle');
      assert.strictEqual(naohIdle.length, 1);
      assert.strictEqual(naohIdle[0].stage, 'few_drops');
      assert.ok(naohIdle[0].label.includes('Dropwise'));

      // At few_drops: Step 2 (Excess) + Redo
      const naohDrops = QualitativeBenchCore.getMultiStageActions('q2_naoh', 'Add 2M NaOH dropwise until in excess', 'few_drops');
      assert.strictEqual(naohDrops.length, 2);
      assert.strictEqual(naohDrops[0].stage, 'excess');
      assert.ok(naohDrops[0].label.includes('Excess'));

      // NH3 at idle
      const nh3Idle = QualitativeBenchCore.getMultiStageActions('q2_nh3', 'Add 2M aqueous ammonia dropwise until in excess', 'idle');
      assert.strictEqual(nh3Idle.length, 1);
      assert.strictEqual(nh3Idle[0].stage, 'few_drops');
      assert.ok(nh3Idle[0].label.includes('NH₃'));

      // Standard single-step test at idle
      const singleActions = QualitativeBenchCore.getMultiStageActions('q2_anion', 'Add 3 drops of Ba(NO3)2', 'idle');
      assert.strictEqual(singleActions.length, 1, 'Standard single-step test should have 1 action button');
    });

    it('Lead(II) nitrate anion test: generates 3-stage sequence (add -> warm -> cool -> done)', () => {
      const prompt = '(iv) To 2 cm³ of solution Y, add 3 drops of lead(II) nitrate solution and warm the mixture, then allow to cool.';
      
      // Stage 1: idle -> Step 1 (few_drops)
      const idleActs = QualitativeBenchCore.getMultiStageActions('q2_anion', prompt, 'idle');
      assert.strictEqual(idleActs.length, 1);
      assert.strictEqual(idleActs[0].stage, 'few_drops');
      assert.ok(idleActs[0].label.includes('Lead(II) Nitrate'));

      // Stage 2: few_drops -> Step 2 (warm/heat)
      const dropsActs = QualitativeBenchCore.getMultiStageActions('q2_anion', prompt, 'few_drops');
      assert.strictEqual(dropsActs.length, 2);
      assert.strictEqual(dropsActs[0].stage, 'heated');
      assert.ok(dropsActs[0].label.includes('Warm'));

      // Stage 3: heated -> Step 3 (cool)
      const heatActs = QualitativeBenchCore.getMultiStageActions('q2_anion', prompt, 'heated');
      assert.strictEqual(heatActs.length, 2);
      assert.strictEqual(heatActs[0].stage, 'cooled');
      assert.ok(heatActs[0].label.includes('Cool'));

      // Complete: cooled -> done
      const coolActs = QualitativeBenchCore.getMultiStageActions('q2_anion', prompt, 'cooled');
      assert.strictEqual(coolActs[0].stage, 'done');
      assert.strictEqual(coolActs[0].disabled, true);
      assert.ok(coolActs[1].isRedo);
    });

    it('Prevents premature cooling or heating at Step 1 (few_drops) for multi-stage KI and Pb(NO3)2 prompts', () => {
      const kiPrompt = '(v) To portion 3, add 3 drops of Potassium Iodide (KI) solution and warm gently, then allow to cool.';
      const kiStep1 = QualitativeBenchCore.resolveReactionState('leadNitrate', 'test_ki', 'few_drops', kiPrompt);
      assert.strictEqual(kiStep1.isCooled, false, 'Step 1 must not prematurely set isCooled=true');
      assert.strictEqual(kiStep1.isHeated, false, 'Step 1 must not prematurely set isHeated=true');
      assert.strictEqual(kiStep1.ppt, true, 'PbI2 yellow precipitate forms in the cold');
      assert.ok(kiStep1.statusLabel.includes('Few Drops'), 'Shows Step 1 few drops observation');

      const pbPrompt = '(iv) To 2 cm³ of solution Y, add 3 drops of lead(II) nitrate solution and warm the mixture, then cool.';
      const pbStep1 = QualitativeBenchCore.resolveReactionState('ammoniumChloride', 'q2_anion', 'few_drops', pbPrompt);
      assert.strictEqual(pbStep1.isCooled, false, 'Step 1 must not prematurely set isCooled=true');
      assert.strictEqual(pbStep1.isHeated, false, 'Step 1 must not prematurely set isHeated=true');
      assert.strictEqual(pbStep1.ppt, true, 'PbCl2 white precipitate forms in the cold');
      assert.strictEqual(pbStep1.pptDissolved, false, 'Precipitate is NOT dissolved yet');
    });

    it('Renders convection heat waves on warming and glistening needle crystals on cooling in renderTubeSvg', () => {
      // Warmed state
      const warmSvg = QualitativeBenchCore.renderTubeSvg({
        saltKey: 'ammoniumChloride',
        testId: 'q2_anion',
        stage: 'heated',
        prompt: 'To solution add Pb(NO3)2 and warm'
      });
      assert.ok(warmSvg.includes('anim-heat-wave'), 'Must render anim-heat-wave on warming');
      assert.ok(warmSvg.includes('anim-ppt-dissolve'), 'Must render dissolved transition');

      // Cooled state
      const coolSvg = QualitativeBenchCore.renderTubeSvg({
        saltKey: 'ammoniumChloride',
        testId: 'q2_anion',
        stage: 'cooled',
        prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of lead(II) nitrate solution and warm the mixture, then allow to cool.'
      });
      assert.ok(coolSvg.includes('Glistening White Needle-Like Crystals of PbCl2'), 'Must render glistening needle crystals on cooling');
      assert.ok(coolSvg.includes('anim-spangle'), 'Must render sparkling spangles for needle crystals');
    });
  });
});

describe('Organic Bench Core (Carbon Compound Reactions)', () => {

  it('should export all required organic sample profiles and resolver methods', () => {
    assert.ok(OrganicBenchCore.SAMPLES, 'SAMPLES dictionary must exist');
    assert.ok(Object.keys(OrganicBenchCore.SAMPLES).length >= 5, 'Must have at least 5 organic profiles');
    assert.strictEqual(typeof OrganicBenchCore.resolveSample, 'function');
    assert.strictEqual(typeof OrganicBenchCore.resolveOrganicReactionState, 'function');
    assert.strictEqual(typeof OrganicBenchCore.renderApparatusSvg, 'function');
  });

  describe('Sample Identification Logic & Substring Collision Prevention', () => {
    it('REGRESSION: "METHANOIC ACID" must resolve to org_methanoic_acid, NOT org_acid (Ethanoic acid)', () => {
      const sample = OrganicBenchCore.resolveSample('METHANOIC ACID');
      assert.strictEqual(sample.key, 'org_methanoic_acid', 'Methanoic acid must not be confused with Ethanoic acid');
      assert.strictEqual(sample.kmno4?.isDecolorized, true, 'Methanoic acid reduces KMnO4');
    });

    it('"BENZOIC ACID" must resolve to org_benzoic_acid with sooty combustion and stable bromine water', () => {
      const sample = OrganicBenchCore.resolveSample('BENZOIC ACID');
      assert.strictEqual(sample.key, 'org_benzoic_acid');
      assert.strictEqual(sample.ignition?.isSooty, true, 'Benzoic acid has high C:H ratio, burns with smoky flame');
      assert.strictEqual(sample.bromine?.isDecolorized, false, 'Benzoic acid does not decolorize bromine water without catalyst');
    });

    it('"CYCLOHEXENE" must resolve to org_alkene', () => {
      const sample = OrganicBenchCore.resolveSample('Cyclohexene');
      assert.strictEqual(sample.key, 'org_alkene');
      assert.strictEqual(sample.bromine?.isDecolorized, true, 'Alkene decolorizes bromine');
      assert.strictEqual(sample.kmno4?.isDecolorized, true, 'Alkene decolorizes KMnO4');
      assert.strictEqual(sample.ignition?.isSooty, true, 'Alkene burns with smoky flame');
    });

    it('"ETHANOL" / "PROPAN-1-OL" must resolve to org_alcohol', () => {
      const sample = OrganicBenchCore.resolveSample('Ethanol');
      assert.strictEqual(sample.key, 'org_alcohol');
      assert.strictEqual(sample.bromine?.isDecolorized, false, 'Alcohol does not decolorize bromine water');
      assert.strictEqual(sample.litmus?.isAcidic, false, 'Alcohol is neutral to litmus');
    });
  });

  describe('Organic Functional Group Reactions', () => {
    // Alkenes
    it('Alkene: smoky flame, neutral to litmus, rapidly decolorizes bromine water and acidified KMnO₄', () => {
      const alkene = OrganicBenchCore.resolveSample('org_alkene');
      assert.strictEqual(alkene.ignition?.isSooty, true);
      assert.strictEqual(alkene.bromine?.isDecolorized, true);
      assert.strictEqual(alkene.litmus?.isAcidic, false);

      const brSvg = OrganicBenchCore.renderApparatusSvg({
        sampleKey: 'org_alkene',
        testId: 'q3_bromine',
        prompt: 'Add 3 drops of Bromine water and shake',
        performed: true
      });
      assert.ok(brSvg.includes('240, 249, 255') || brSvg.includes('Schlieren') || brSvg.includes('colorless'), 'Bromine water must be decolorized for alkene');
    });

    // Carboxylic acids
    it('Carboxylic Acid: turns blue litmus red, effervescence with NaHCO₃, does not decolorize bromine water', () => {
      const acid = OrganicBenchCore.resolveSample('org_acid');
      assert.strictEqual(acid.litmus?.isAcidic, true);
      assert.strictEqual(acid.bromine?.isDecolorized, false);

      const state = OrganicBenchCore.resolveOrganicReactionState('org_acid', 'q3_nahco3', true, 'Add a spatula end of solid NaHCO3');
      assert.strictEqual(state.soundType, 'effervescence', 'Must trigger effervescence sound');
      assert.ok(state.statusLabel.toLowerCase().includes('effervescence') || state.statusLabel.toLowerCase().includes('bubbles'));
    });

    // Methanoic acid (Formic acid)
    it('Methanoic Acid: unique reducing acid that both reacts with NaHCO₃ AND decolorizes KMnO₄ with bubbling', () => {
      const kmno4State = OrganicBenchCore.resolveOrganicReactionState('org_methanoic_acid', 'q3_kmno4', true, 'Add 3 drops of acidified KMnO4');
      const labelLower = kmno4State.statusLabel.toLowerCase();
      assert.ok(labelLower.includes('decolorized') || labelLower.includes('decolourized'), 'Methanoic acid reduces KMnO4');
      assert.strictEqual(kmno4State.soundType, 'effervescence', 'CO2 release during KMnO4 oxidation triggers bubbling sound');
    });

    // Alcohols
    it('Alcohol: neutral to litmus, no effervescence with NaHCO₃, turns acidified K₂Cr₂O₇ from orange to green', () => {
      const dichromateSvg = OrganicBenchCore.renderApparatusSvg({
        sampleKey: 'org_alcohol',
        testId: 'q3_dichromate',
        prompt: 'Add 3 drops of acidified K2Cr2O7 and warm',
        performed: true
      });
      assert.ok(dichromateSvg.includes('green') || dichromateSvg.includes('#10B981') || dichromateSvg.includes('#059669'), 'Acidified dichromate must turn green with alcohol');
    });

    // Water Solubility & Miscibility
    it('Water Solubility & Miscibility: Alkene forms 2 immiscible layers while Alkanol dissolves completely', () => {
      const alkeneSvg = OrganicBenchCore.renderApparatusSvg({
        sampleKey: 'org_alkene',
        testId: 'solubility',
        prompt: 'To 2 cm³ of the sample in a clean dry test tube, add 2 cm³ of distilled water and shake the mixture thoroughly.',
        performed: true
      });
      assert.ok(alkeneSvg.includes('Water Solubility & Miscibility'), 'Must render Water Solubility apparatus');
      assert.ok(alkeneSvg.includes('Organic') && alkeneSvg.includes('Aqueous'), 'Must show two distinct labeled layers for alkene');
      assert.ok(alkeneSvg.includes('245, 158, 11'), 'Must render upper hydrocarbon amber layer');

      const alcoholSvg = OrganicBenchCore.renderApparatusSvg({
        sampleKey: 'org_alcohol',
        testId: 'solubility',
        prompt: 'To 2 cm³ of the sample in a clean dry test tube, add 2 cm³ of distilled water and shake the mixture thoroughly.',
        performed: true
      });
      assert.ok(alcoholSvg.includes('Single Clear Homogeneous Solution'), 'Must render single homogeneous layer for miscible alcohol');

      const alkeneState = OrganicBenchCore.resolveOrganicReactionState('org_alkene', 'solubility', true, 'Add 2 cm3 distilled water');
      assert.ok(alkeneState.statusLabel.includes('Immiscible') || alkeneState.statusLabel.includes('2 Separate Layers'), 'Reaction state must report immiscible layers');
    });
  });

  describe('Apparatus Dispatch Robustness', () => {
    it('REGRESSION: Prompt keywords must take priority over testId to prevent wrong apparatus rendering', () => {
      // Series 2023 prompt was Bromine water but ID was q3_kmno4
      const svg = OrganicBenchCore.renderApparatusSvg({
        sampleKey: 'org_alkene',
        testId: 'q3_kmno4', // Mismatched ID
        prompt: 'To about 2 cm³ of Liquid F, add 3 drops of bromine water and shake.',
        performed: true
      });
      assert.ok(svg.includes('Bromine Water') || svg.includes('Br₂'), 'Must render Bromine Water apparatus because prompt specifies bromine water');
    });

    it('REGRESSION: Solubility testId fallback must dispatch to Water Solubility even when prompt is empty', () => {
      const svg = OrganicBenchCore.renderApparatusSvg({
        sampleKey: 'org_alkene',
        testId: 'solubility',
        prompt: '',
        performed: true
      });
      assert.ok(svg.includes('Water Solubility & Miscibility'), 'Must dispatch to Water Solubility apparatus via testId fallback');
      assert.ok(svg.includes('Organic') && svg.includes('Aqueous'), 'Must render 2 immiscible layers');
    });

    it('REGRESSION: Dichromate test with water bath in prompt must render Dichromate apparatus, NOT Esterification', () => {
      const svg = OrganicBenchCore.renderApparatusSvg({
        sampleKey: 'org_alcohol',
        testId: 'dichromate',
        prompt: 'To 2 cm³ of the sample, add 1 cm³ of acidified potassium dichromate(VI) (K₂Cr₂O₇/H₂SO₄) and heat in a boiling water bath for 2 minutes.',
        performed: true
      });
      assert.ok(svg.includes('K₂Cr₂O₇') || svg.includes('Heat'), 'Must render Dichromate test apparatus');
      assert.ok(!svg.includes('Ester Aroma'), 'Must NOT display Sweet Fruity Ester Aroma badge');
      assert.ok(!svg.includes('Water Bath Esterification'), 'Must NOT display Water Bath Esterification label');
    });
  });

  describe('Unbounded Dynamic Simulation Engine — Extended Inorganic Registries & First-Principles Synthesis', () => {
    it('should resolve newly added KNEC salts correctly (e.g., magnesiumSulfate, potassiumIodide, copperChloride)', () => {
      const mg = QualitativeBenchCore.resolveSalt('magnesiumSulfate');
      assert.strictEqual(mg.cation, 'Mg2+');
      assert.strictEqual(mg.anion, 'SO4^2-');

      // Regression fix: KI must resolve to potassiumIodide, NOT potassiumChloride
      const ki = QualitativeBenchCore.resolveSalt('KI');
      assert.strictEqual(ki.cation, 'K+');
      assert.strictEqual(ki.anion, 'I-');
      assert.strictEqual(ki.formula, 'KI');

      const cuCl2 = QualitativeBenchCore.resolveSalt('copperChloride');
      assert.strictEqual(cuCl2.cation, 'Cu2+');
      assert.strictEqual(cuCl2.anion, 'Cl-');
    });

    it('Mg²⁺: white precipitate with NaOH & NH₃, insoluble in excess of both reagents', () => {
      const naohFew = QualitativeBenchCore.resolveReactionState('magnesiumSulfate', 'q2_naoh', 'few_drops', 'Add NaOH dropwise');
      assert.strictEqual(naohFew.ppt, true);
      assert.strictEqual(naohFew.pptColor, '#FFFFFF');

      const naohExcess = QualitativeBenchCore.resolveReactionState('magnesiumSulfate', 'q2_naoh', 'excess', 'Add NaOH in excess');
      assert.strictEqual(naohExcess.ppt, true);
      assert.strictEqual(naohExcess.pptDissolved, false, 'Mg(OH)2 is insoluble in excess NaOH');

      const nh3Few = QualitativeBenchCore.resolveReactionState('magnesiumSulfate', 'q2_nh3', 'few_drops', 'Add NH3 dropwise');
      assert.strictEqual(nh3Few.ppt, true);

      const nh3Excess = QualitativeBenchCore.resolveReactionState('magnesiumSulfate', 'q2_nh3', 'excess', 'Add NH3 in excess');
      assert.strictEqual(nh3Excess.ppt, true);
      assert.strictEqual(nh3Excess.pptDissolved, false, 'Mg(OH)2 is insoluble in excess aqueous ammonia');
    });

    it('Dynamic First-Principles Salt Synthesis: unlisted teacher practical salt "Magnesium Bromide"', () => {
      const dynSalt = QualitativeBenchCore.resolveSalt('Magnesium Bromide');
      assert.ok(dynSalt, 'Must synthesize dynamic salt');
      assert.strictEqual(dynSalt.cation, 'Mg2+');
      assert.strictEqual(dynSalt.anion, 'Br-');

      // Test with AgNO3
      const agno3State = QualitativeBenchCore.resolveReactionState(dynSalt.key, 'q2_agno3', 'step2_agno3', 'Add AgNO3 to solution of sample');
      assert.strictEqual(agno3State.ppt, true);
      assert.strictEqual(agno3State.pptColor, '#FEF08A', 'Must produce pale cream precipitate of AgBr');
    });

    it('Dynamic First-Principles Salt Synthesis: unlisted formula "BaI2"', () => {
      const dynSalt = QualitativeBenchCore.resolveSalt('BaI2');
      assert.ok(dynSalt, 'Must synthesize BaI2');
      assert.strictEqual(dynSalt.cation, 'Ba2+');
      assert.strictEqual(dynSalt.anion, 'I-');

      // Test flame reaction
      const flame = QualitativeBenchCore.resolveReactionState(dynSalt.key, 'flame', 'stage1', 'Dip glass rod in solution and place in flame');
      assert.ok(flame.statusLabel.includes('Apple-green flame'), 'Ba2+ must exhibit apple-green flame');

      // Test AgNO3 reaction
      const agno3State = QualitativeBenchCore.resolveReactionState(dynSalt.key, 'q2_agno3', 'step2_agno3', 'Add AgNO3 solution');
      assert.strictEqual(agno3State.ppt, true);
      assert.strictEqual(agno3State.pptColor, '#FACC15', 'Iodide must produce bright yellow precipitate of AgI');
    });
  });

  describe('Unbounded Dynamic Simulation Engine — Extended Organic Registries & IUPAC Suffix Synthesis', () => {
    it('should resolve newly added KNEC organic compounds (propene, methanol, propanoic acid, pentane)', () => {
      const propene = OrganicBenchCore.resolveSample('propene');
      assert.strictEqual(propene.fgKey, 'alkene');

      const methanol = OrganicBenchCore.resolveSample('methanol');
      assert.strictEqual(methanol.fgKey, 'alkanol');

      const propAcid = OrganicBenchCore.resolveSample('propanoic acid');
      assert.strictEqual(propAcid.fgKey, 'alkanoic_acid');

      const pentane = OrganicBenchCore.resolveSample('pentane');
      assert.strictEqual(pentane.fgKey, 'alkane');
    });

    it('Dynamic Functional Group Synthesis: unlisted alkene "Oct-1-ene"', () => {
      const octene = OrganicBenchCore.resolveSample('Oct-1-ene');
      assert.ok(octene, 'Must synthesize Oct-1-ene');
      assert.strictEqual(octene.fgKey, 'alkene');
      assert.strictEqual(octene.bromine.isDecolorized, true, 'Octene must decolorize bromine water');
      assert.strictEqual(octene.kmno4.isDecolorized, true, 'Octene must decolorize KMnO4');
      assert.strictEqual(octene.ignition.isSooty, true, 'Octene must burn with sooty flame');
    });

    it('Dynamic Functional Group Synthesis: unlisted carboxylic acid "Hexanoic acid"', () => {
      const hexAcid = OrganicBenchCore.resolveSample('Hexanoic acid');
      assert.ok(hexAcid, 'Must synthesize Hexanoic acid');
      assert.strictEqual(hexAcid.fgKey, 'alkanoic_acid');
      assert.strictEqual(hexAcid.litmus.isAcidic, true, 'Hexanoic acid must turn blue litmus red');
      assert.strictEqual(hexAcid.carbonate.hasEffervescence, true, 'Hexanoic acid must produce CO2 effervescence');
      assert.strictEqual(hexAcid.bromine.isDecolorized, false, 'Saturated acid does not decolorize bromine');
    });

    it('Dynamic Functional Group Synthesis: unlisted alkanol "Pentan-1-ol"', () => {
      const pentanol = OrganicBenchCore.resolveSample('Pentan-1-ol');
      assert.ok(pentanol, 'Must synthesize Pentan-1-ol');
      assert.strictEqual(pentanol.fgKey, 'alkanol');
      assert.strictEqual(pentanol.dichromate.turnsGreen, true, 'Pentan-1-ol must turn acidified dichromate green');
      assert.strictEqual(pentanol.esterification.isFruity, true, 'Pentan-1-ol must produce fruity ester aroma');
    });
  });

  describe('Hydrogen Peroxide (H₂O₂) Dynamic Simulation & Catalytic Decomposition', () => {
    it('should resolve manganeseDioxide (MnO2) as a black catalytic solid', () => {
      const mno2 = QualitativeBenchCore.resolveSalt('MnO2');
      assert.ok(mno2, 'Must resolve MnO2');
      assert.strictEqual(mno2.cation, 'Mn4+');
      assert.strictEqual(mno2.anion, 'O2-');
      assert.strictEqual(mno2.crystalColor, '#1E293B', 'Must have dark charcoal/black appearance');
    });

    it('should simulate catalytic decomposition: "To remaining Solid D, add 1 cm³ 20-volume hydrogen peroxide (H₂O₂)"', () => {
      const prompt = '(iii) To remaining Solid D, add 1 cm³ 20-volume hydrogen peroxide (H₂O₂).';
      const obs = 'Vigorous effervescence of a colourless gas that rekindles / relights a glowing wooden splint';

      // Step 1: Add H2O2
      const step1 = QualitativeBenchCore.resolveReactionState('MnO2', 'q2_peroxide', 'added_h2o2', prompt, obs);
      assert.strictEqual(step1.bubbling, true, 'Must have vigorous bubbling / effervescence');
      assert.strictEqual(step1.evolvesO2, true, 'Must evolve oxygen gas');
      assert.strictEqual(step1.soundType, 'effervescence', 'Sound must be effervescence on addition');
      assert.strictEqual(step1.ppt, true, 'Black solid catalyst remains present at bottom');
      assert.strictEqual(step1.pptColor, '#1E293B', 'Solid catalyst must be black');

      // Step 2: Glowing Splint
      const step2 = QualitativeBenchCore.resolveReactionState('MnO2', 'q2_peroxide', 'splint_test', prompt, obs);
      assert.strictEqual(step2.bubbling, true, 'Bubbling persists during splint test');
      assert.strictEqual(step2.evolvesO2, true, 'Oxygen gas present');
      assert.strictEqual(step2.soundType, 'splint', 'Sound must be splint ignition pop');
      assert.ok(step2.statusLabel.includes('Rekindles into bright flame'), 'Status must indicate splint rekindling');
    });

    it('should generate multi-stage actions for H₂O₂ testing with glowing splint', () => {
      const prompt = '(iii) To remaining Solid D, add 1 cm³ 20-volume hydrogen peroxide (H₂O₂).';

      // Stage idle -> Step 1
      const idleActions = QualitativeBenchCore.getMultiStageActions('q2_peroxide', prompt, 'idle');
      assert.strictEqual(idleActions.length, 1);
      assert.strictEqual(idleActions[0].stage, 'added_h2o2');
      assert.ok(idleActions[0].label.includes('Step 1: Add 1 cm³ Hydrogen Peroxide'));

      // Stage added_h2o2 -> Step 2 (Glowing Splint)
      const step1Actions = QualitativeBenchCore.getMultiStageActions('q2_peroxide', prompt, 'added_h2o2');
      assert.strictEqual(step1Actions.length, 2);
      assert.strictEqual(step1Actions[0].stage, 'splint_test');
      assert.ok(step1Actions[0].label.includes('Step 2: Test Gas with Glowing Splint'));
      assert.strictEqual(step1Actions[1].stage, 'idle'); // Redo button

      // Stage splint_test -> Done
      const doneActions = QualitativeBenchCore.getMultiStageActions('q2_peroxide', prompt, 'splint_test');
      assert.strictEqual(doneActions[0].stage, 'done');
      assert.strictEqual(doneActions[0].disabled, true);
    });

    it('should simulate Fe²⁺ oxidation to reddish-brown Fe(OH)₃ when H₂O₂ is added', () => {
      const r = QualitativeBenchCore.resolveReactionState('ironSulfate', 't_peroxide', 'added_h2o2', 'To green solid, add 1 cm3 hydrogen peroxide', '');
      assert.strictEqual(r.ppt, true, 'Must form precipitate');
      assert.strictEqual(r.pptColor, '#991B1B', 'Must turn reddish-brown');
      assert.ok(r.statusLabel.includes('reddish-brown Fe(OH)₃'), 'Status must confirm Fe(OH)3 oxidation');
    });

    it('should simulate I⁻ oxidation to dark brown iodine solution when H₂O₂ is added', () => {
      const r = QualitativeBenchCore.resolveReactionState('potassiumIodide', 't_peroxide', 'added_h2o2', 'Add 1 cm3 hydrogen peroxide to solution', '');
      assert.strictEqual(r.liquidColor, '#78350F', 'Must turn dark brown from liberated iodine');
      assert.ok(r.statusLabel.includes('dark brown'), 'Status must confirm iodine liberation');
    });
  });

  describe('Solid Sodium Hydrogen Carbonate (NaHCO₃) Inorganic Diagnostic Simulation', () => {
    it('should simulate vigorous effervescence of CO₂ when solid NaHCO₃ is added to an acid', () => {
      const r = QualitativeBenchCore.resolveReactionState(
        'hydrochloricAcid',
        'q2_carbonate',
        'added_nahco3',
        'To portion 2, add a spatula-end of solid sodium hydrogen carbonate',
        ''
      );
      assert.strictEqual(r.bubbling, true, 'Acid + NaHCO3 must trigger bubbling');
      assert.strictEqual(r.evolvesCO2, true, 'Must evolve CO2');
      assert.strictEqual(r.soundType, 'effervescence', 'Must trigger effervescence sound');
      assert.ok(r.statusLabel.includes('Vigorous effervescence') && r.statusLabel.includes('limewater milky'), 'Status must describe CO2 effervescence');
    });

    it('should simulate limewater test in multi-stage NaHCO₃ workflow', () => {
      const r = QualitativeBenchCore.resolveReactionState(
        'nitricAcid',
        'q2_carbonate',
        'limewater_test',
        'To portion 2, add solid sodium hydrogen carbonate and bubble gas through limewater',
        ''
      );
      assert.strictEqual(r.bubbling, true);
      assert.ok(r.statusLabel.includes('Limewater turned milky') || r.statusLabel.includes('White precipitate'), 'Must confirm limewater milky test');
    });

    it('should simulate neutral salt with no effervescence and solid settling at tube base', () => {
      const r = QualitativeBenchCore.resolveReactionState(
        'copperSulfate',
        'q2_carbonate',
        'added_nahco3',
        'To portion 2, add solid sodium hydrogen carbonate',
        ''
      );
      assert.strictEqual(r.bubbling, false, 'Neutral salt must NOT produce effervescence');
      assert.strictEqual(r.soundType, 'drop', 'Must not trigger effervescence audio');
      assert.ok(r.statusLabel.includes('No effervescence observed'), 'Observation must state no effervescence');
    });

    it('should simulate hydrolyzing cation Fe³⁺ effervescence with reddish-brown Fe(OH)₃ ppt', () => {
      const r = QualitativeBenchCore.resolveReactionState(
        'ironChloride',
        'q2_carbonate',
        'added_nahco3',
        'To portion 2, add solid sodium hydrogen carbonate',
        ''
      );
      assert.strictEqual(r.bubbling, true, 'Fe3+ hydrolysis must produce effervescence');
      assert.strictEqual(r.ppt, true, 'Fe3+ + NaHCO3 must form insoluble hydroxide ppt');
      assert.strictEqual(r.pptColor, '#991B1B', 'Fe(OH)3 must be reddish-brown');
    });

    it('should generate multi-stage actions: idle -> added_nahco3 -> limewater_test -> done', () => {
      const prompt = 'To portion 2, add solid sodium hydrogen carbonate and test the gas evolved with limewater';
      const idleActions = QualitativeBenchCore.getMultiStageActions('q2_carb', prompt, 'idle');
      assert.strictEqual(idleActions[0].stage, 'added_nahco3');
      assert.ok(idleActions[0].label.includes('Add Spatula-End of Solid NaHCO₃'));

      const step1Actions = QualitativeBenchCore.getMultiStageActions('q2_carb', prompt, 'added_nahco3');
      assert.strictEqual(step1Actions[0].stage, 'limewater_test');
      assert.ok(step1Actions[0].label.includes('Test Gas with Limewater'));
      assert.strictEqual(step1Actions[1].stage, 'idle');

      const doneActions = QualitativeBenchCore.getMultiStageActions('q2_carb', prompt, 'limewater_test');
      assert.strictEqual(doneActions[0].stage, 'done');
      assert.strictEqual(doneActions[0].disabled, true);
    });

    it('should dynamically synthesize unlisted acid formulas (e.g., dilute nitric acid, H2SO4)', () => {
      const acid1 = QualitativeBenchCore.resolveSalt('dilute nitric acid');
      assert.strictEqual(acid1.cation, 'H+');
      assert.strictEqual(acid1.isAcid, true);

      const acid2 = QualitativeBenchCore.resolveSalt('H2SO4');
      assert.strictEqual(acid2.cation, 'H+');
      assert.strictEqual(acid2.isAcid, true);
    });

    it('should render spatula delivering powder and white sediment in SVG apparatus', () => {
      const svg = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'hydrochloricAcid',
        testId: 'q2_carb',
        prompt: 'To portion 2, add solid sodium hydrogen carbonate',
        stage: 'added_nahco3'
      });
      assert.ok(svg.includes('spatulaMetal_'), 'SVG must include spatula metal gradient');
      assert.ok(svg.includes('anim-qual-froth'), 'Acid effervescence must render froth head in SVG');
    });
  });

  describe('Exam Hub Qualitative Fidelity & Historical KCSE Scenarios', () => {
    it('should form dense white BaSO₄ precipitate in single-step barium nitrate tests (KCSE 2022/2013)', () => {
      const r = QualitativeBenchCore.resolveReactionState(
        'magnesiumSulfate',
        'q2_anion',
        'few_drops',
        '(v) To portion 3, add 3 drops of Barium Nitrate solution followed by dilute nitric acid.',
        'Dense white precipitate formed, insoluble in dilute nitric acid'
      );
      assert.strictEqual(r.ppt, true, 'BaSO4 precipitate must form');
      assert.strictEqual(r.pptColor, '#FFFFFF', 'BaSO4 must be white');
      assert.ok(r.statusLabel.includes('BaSO₄') && r.statusLabel.includes('insoluble in dilute acid'));
    });

    it('should simulate zinc dust displacement of Cu²⁺ to reddish-brown copper metal (KCSE 2008)', () => {
      const r = QualitativeBenchCore.resolveReactionState(
        'copperCarbonate',
        'q2_displacement',
        'few_drops',
        '(iv) To rest of filtrate, add Solid E (zinc dust) and shake.',
        'Effervescence; green solution turns colourless; reddish-brown solid deposited; test tube becomes warm'
      );
      assert.strictEqual(r.ppt, true, 'Copper metal precipitate must form');
      assert.strictEqual(r.pptColor, '#B45309', 'Copper deposit must be reddish-brown');
      assert.strictEqual(r.bubbling, true, 'Must produce effervescence');
      assert.strictEqual(r.soundType, 'effervescence');
      assert.ok(r.statusLabel.includes('Zinc Dust') && r.statusLabel.includes('reddish-brown'));
    });

    it('should simulate MnO₂ oxidation of 6M HCl evolving greenish-yellow Cl₂ gas on warming (KCSE 1996)', () => {
      const r = QualitativeBenchCore.resolveReactionState(
        'manganeseDioxide',
        'q2_acid_warm',
        'few_drops',
        '(i) To half of Solid D, add 1 cm³ 6M HCl and warm gently for 1 minute.',
        'Effervescence increases with heating; greenish-yellow gas evolved with pungent choking smell that bleaches moist blue litmus paper'
      );
      assert.strictEqual(r.bubbling, true, 'Must bubble on warming');
      assert.strictEqual(r.soundType, 'effervescence');
      assert.strictEqual(r.gasColor, '#D9F99D', 'Cl2 must be pale greenish-yellow');
      assert.ok(r.statusLabel.includes('greenish-yellow Cl₂ gas'));
    });

    it('should simulate Mn²⁺ precipitate in NaOH darkening to reddish-brown in air (KCSE 1996)', () => {
      const r = QualitativeBenchCore.resolveReactionState(
        'manganeseDioxide',
        'q2_naoh',
        'few_drops',
        '(ii) Dilute mixture with water, filter, and add 2M NaOH dropwise until in excess.',
        'Reddish-brown precipitate formed, insoluble in excess sodium hydroxide'
      );
      assert.strictEqual(r.ppt, true, 'Must form precipitate');
      assert.strictEqual(r.pptColor, '#991B1B', 'Mn(OH)2 oxidizes to reddish-brown');
      assert.ok(r.statusLabel.includes('reddish-brown'));
    });
  });
});





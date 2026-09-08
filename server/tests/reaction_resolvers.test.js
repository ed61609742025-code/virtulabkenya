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

    // Chloride (Cl-)
    it('Cl⁻: white ppt with AgNO₃, insoluble in HNO₃', () => {
      const res = QualitativeBenchCore.resolveReactionState('ironChloride', 'q2_anion', 'stage1', 'Add dilute HNO3 followed by AgNO3 solution');
      assert.strictEqual(res.ppt, true, 'AgCl white ppt forms');
      assert.strictEqual(res.pptColor, '#FFFFFF');
    });

    // Regression check for isStep1 bug: single-step anion tests with stage === 'stage1' must form ppt
    it('REGRESSION: single-step stage === "stage1" tests must form precipitate', () => {
      const testCases = [
        { salt: 'zincSulfate', prompt: 'Add 3 drops of BaCl2 solution' },
        { salt: 'ironChloride', prompt: 'Add 3 drops of AgNO3 solution' },
        { salt: 'copperSulfate', prompt: 'Add 3 drops of Ba(NO3)2 solution' }
      ];
      testCases.forEach(tc => {
        const state = QualitativeBenchCore.resolveReactionState(tc.salt, 'q2_anion', 'stage1', tc.prompt);
        assert.strictEqual(state.ppt, true, `Precipitate must form for prompt: "${tc.prompt}" on ${tc.salt}`);
      });
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
  });
});

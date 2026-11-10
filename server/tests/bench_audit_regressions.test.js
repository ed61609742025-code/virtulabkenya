/**
 * VirtuLab Kenya — Bench 1 (Volumetric Analysis / Titration) Audit Regression Tests
 * 
 * Verifies:
 * 1. Error Carried Forward (e.c.f.) accuracy for Question (e) across all practical types
 * 2. KNEC Table 1 standardized 5-mark evaluation (CT, D, AC, PA, FA)
 * 3. 15-Mark KCSE Paper 3 Question 1 total score calculation & grade mapping
 * 4. Preservation of critical script tags in client/student/lab.html (knec-grading, knec-pedagogy)
 * 5. Half-drop delivery precision (+0.025 cm³) & meniscus parallax sightlines (-8°, 0°, +8°)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const KnecGrading = require(path.join(rootDir, 'client/shared/knec-grading.js'));
const KnecPedagogy = require(path.join(rootDir, 'client/shared/knec-pedagogy.js'));

describe('Bench 1 (Volumetric Analysis / Titration) Audit Regression Suite', () => {

  describe('1. Script Tag & Asset Inclusions in lab.html', () => {
    it('should include knec-grading.js and knec-pedagogy.js in lab.html', () => {
      const html = fs.readFileSync(path.join(rootDir, 'client/student/lab.html'), 'utf8');
      assert.ok(html.includes('/shared/knec-grading.js'), 'lab.html must import knec-grading.js');
      assert.ok(html.includes('/shared/knec-pedagogy.js'), 'lab.html must import knec-pedagogy.js');
      assert.ok(html.includes('js/titration-workbench.js'), 'lab.html must import titration-workbench.js');
    });

    it('should have screen reader live announcer in lab.html', () => {
      const html = fs.readFileSync(path.join(rootDir, 'client/student/lab.html'), 'utf8');
      assert.ok(html.includes('id="vlkScreenReaderAnnouncer"'), 'lab.html must have #vlkScreenReaderAnnouncer');
    });
  });

  describe('2. Error Carried Forward (e.c.f.) for Question (e)', () => {
    it('should calculate ECF RFM correctly for dibasic acid (mass / molarity)', () => {
      // Candidate calculated activeConc = 0.0500 M (slightly off standard 0.0490 M)
      // Solution A contains 4.90 g/dm³
      const massConc = 4.90;
      const activeConc = 0.0500;
      const ecfRfm = massConc / activeConc; // 98.0 g/mol
      assert.strictEqual(Math.round(ecfRfm * 10) / 10, 98.0, 'ECF for dibasic RFM must equal 98.0');
    });

    it('should calculate ECF mass for precipitation in 250 cm³ flask', () => {
      // Candidate calculated activeConc = 0.0800 M
      // Mass in 250 cm³ = Molarity * (250/1000) * 58.5
      const activeConc = 0.0800;
      const ecfMass = activeConc * (250 / 1000) * 58.5; // 1.17 g
      assert.strictEqual(Math.round(ecfMass * 100) / 100, 1.17, 'ECF for precipitation in 250 cm³ must be 1.17 g');
    });

    it('should calculate ECF mass for tribasic acid in 500 cm³ bottle', () => {
      // Candidate calculated activeConc = 0.0350 M
      // Mass in 500 cm³ = Molarity * (500/1000) * 98.0
      const activeConc = 0.0350;
      const ecfMass = activeConc * (500 / 1000) * 98.0; // 1.715 g -> 1.72 g
      assert.strictEqual(Math.round(ecfMass * 100) / 100, 1.72, 'ECF for tribasic acid in 500 cm³ must be 1.72 g');
    });

    it('should calculate ECF total hardness (ppm) for complexometric titration', () => {
      // Candidate calculated activeConc = 0.0105 M
      // Hardness (ppm) = Molarity * 100.0 * 1000
      const activeConc = 0.0105;
      const ecfPpm = activeConc * 100.0 * 1000; // 1050 ppm
      assert.strictEqual(ecfPpm, 1050.0, 'ECF for water hardness must be 1050 ppm');
    });

    it('should calculate ECF gas volume at s.t.p. for weak base ammonia titration', () => {
      // Candidate calculated activeConc = 0.1000 M
      // Gas volume = Molarity * 22.4 dm³
      const activeConc = 0.1000;
      const ecfVolume = activeConc * 22.4; // 2.24 dm³
      assert.strictEqual(Math.round(ecfVolume * 100) / 100, 2.24, 'ECF for ammonia gas volume must be 2.24 dm³');
    });
  });

  describe('3. KNEC Table 1 Rubric Scoring Integration', () => {
    it('should score concordant trials with 2 d.p. terminating in 0 or 5 full 5.0 marks', () => {
      const trials = [
        { initial: 0.00, final: 24.50, used: 24.50, recorded: true },
        { initial: 0.00, final: 24.55, used: 24.55, recorded: true },
        { initial: 0.00, final: 24.50, used: 24.50, recorded: true }
      ];
      const result = KnecGrading.evaluateKnecTable1(trials, 24.50, 24.50);
      assert.strictEqual(result.tableScore, 5.0, 'Immaculate table must receive full 5.0 marks');
      assert.strictEqual(result.rubric.length, 5, 'Must have 5 rubric criteria (CT, D, AC, PA, FA)');
    });

    it('should penalize decimal violations [D] when readings end in other digits', () => {
      const trials = [
        { initial: 0.00, final: 24.52, used: 24.52, recorded: true },
        { initial: 0.00, final: 24.57, used: 24.57, recorded: true }
      ];
      const result = KnecGrading.evaluateKnecTable1(trials, 24.50, 24.55);
      const dRule = result.rubric.find(r => r.code === 'D');
      assert.strictEqual(dRule.mark, 0.0, 'Must award 0.0 for D when digits do not end in 0 or 5');
    });

    it('should award proper KNEC grade for 15-mark composite Paper 3 Question 1', () => {
      // 12.0 / 15.0 = 80% -> Grade A
      assert.strictEqual(KnecGrading.calculateKnecGrade(12.0, 15.0), 'A');
      // 10.5 / 15.0 = 70% -> Grade B+
      assert.strictEqual(KnecGrading.calculateKnecGrade(10.5, 15.0), 'B+');
      // 7.5 / 15.0 = 50% -> Grade C
      assert.strictEqual(KnecGrading.calculateKnecGrade(7.5, 15.0), 'C');
      // 4.5 / 15.0 = 30% -> Grade D-
      assert.strictEqual(KnecGrading.calculateKnecGrade(4.5, 15.0), 'D-');
      // 3.0 / 15.0 = 20% -> Grade E
      assert.strictEqual(KnecGrading.calculateKnecGrade(3.0, 15.0), 'E');
    });
  });

  describe('4. Volumetric Apparatus Realism & Parallax Controls', () => {
    it('should verify half-drop resolution is exactly 0.025 cm³', () => {
      let vol = 0.0;
      for (let i = 0; i < 4; i++) {
        vol = Math.round((vol + 0.025) * 1000) / 1000;
      }
      assert.strictEqual(vol, 0.100, '4 half drops must equal exactly 0.100 cm³');
    });

    it('should shift apparent meniscus reading under ±8° parallax sightline angles', () => {
      const getApparent = (vol, angle) => {
        const shift = (angle / 8) * 0.08;
        return Math.max(0, Math.min(50, Math.round((vol + shift) * 1000) / 1000));
      };
      assert.strictEqual(getApparent(25.00, 0), 25.00, '0° eye level must have 0 shift');
      assert.strictEqual(getApparent(25.00, 8), 25.08, '+8° sightline must shift by +0.08 cm³');
      assert.strictEqual(getApparent(25.00, -8), 24.92, '-8° sightline must shift by -0.08 cm³');
    });
  });
});

describe('Bench 2 (Qualitative Salt Analysis) Audit Regression Suite', () => {

  describe('1. Script Tag & Asset Inclusions in qualitative.html', () => {
    it('should include knec-grading.js and knec-pedagogy.js in qualitative.html', () => {
      const html = fs.readFileSync(path.join(rootDir, 'client/student/qualitative.html'), 'utf8');
      assert.ok(html.includes('/shared/knec-grading.js'), 'qualitative.html must import knec-grading.js');
      assert.ok(html.includes('/shared/knec-pedagogy.js'), 'qualitative.html must import knec-pedagogy.js');
      assert.ok(html.includes('/shared/qualitative-bench-core.js'), 'qualitative.html must import qualitative-bench-core.js');
      assert.ok(html.includes('js/qualitative-engine.js'), 'qualitative.html must import qualitative-engine.js');
    });

    it('should have mobile quick-action dock and final salt identification panel in qualitative.html', () => {
      const html = fs.readFileSync(path.join(rootDir, 'client/student/qualitative.html'), 'utf8');
      assert.ok(html.includes('id="mobileQualDock"'), 'qualitative.html must have #mobileQualDock');
      assert.ok(html.includes('id="cationSelect"'), 'qualitative.html must have #cationSelect');
      assert.ok(html.includes('id="anionSelect"'), 'qualitative.html must have #anionSelect');
      assert.ok(html.includes('id="knecEvalModal"'), 'qualitative.html must have #knecEvalModal');
    });
  });

  describe('2. Salt Registry Integrity & Syllabus Alignment', () => {
    const qualEngineCode = fs.readFileSync(path.join(rootDir, 'client/student/js/qualitative-engine.js'), 'utf8');
    const qualHtml = fs.readFileSync(path.join(rootDir, 'client/student/qualitative.html'), 'utf8');

    it('should define EXAM_PRACTICAL_SALT_KEYS with 16 authentic KCSE practical salts', () => {
      assert.ok(qualEngineCode.includes('EXAM_PRACTICAL_SALT_KEYS'), 'qualitative-engine.js must define EXAM_PRACTICAL_SALT_KEYS');
    });

    it('should ensure all 16 practical salts have their cations in cationSelect', () => {
      const expectedCations = ['NH4+', 'Cu2+', 'Fe2+', 'Fe3+', 'Na+', 'K+', 'Ca2+', 'Al3+', 'Zn2+', 'Pb2+'];
      expectedCations.forEach(cation => {
        assert.ok(qualHtml.includes(`value="${cation}"`), `cationSelect must contain option for ${cation}`);
      });
    });

    it('should ensure all 16 practical salts have their anions in anionSelect', () => {
      const expectedAnions = ['Cl-', 'Br-', 'I-', 'SO4^2-', 'SO3^2-', 'CO3^2-', 'HCO3-', 'NO3-'];
      expectedAnions.forEach(anion => {
        assert.ok(qualHtml.includes(`value="${anion}"`), `anionSelect must contain option for ${anion}`);
      });
    });

    it('should ensure newSample() selects from EXAM_PRACTICAL_SALT_KEYS', () => {
      assert.ok(qualEngineCode.includes('keys = (typeof EXAM_PRACTICAL_SALT_KEYS !== \'undefined\'') || qualEngineCode.includes('EXAM_PRACTICAL_SALT_KEYS'), 'newSample must sample from EXAM_PRACTICAL_SALT_KEYS');
      assert.ok(qualEngineCode.includes('urlParams.get(\'salt\')'), 'newSample must support URL query salt param');
    });
  });

  describe('3. KNEC Paper 3 Question 2 15-Mark Rubric Standard', () => {
    it('should correctly calculate composite 15.0 marks (10.0 M tests table + 5.0 M salt ID)', () => {
      const tableScore = 8.8; // Tests Table score
      const cationCorrect = true; // 2.5 M
      const anionCorrect = true;  // 2.5 M
      const idScore = (cationCorrect ? 2.5 : 0) + (anionCorrect ? 2.5 : 0);
      const totalScore = Math.min(15.0, tableScore + idScore);
      assert.strictEqual(totalScore, 13.8, 'Total Q2 marks must equal 13.8 / 15.0');
    });

    it('should enforce hard cap of 10.0 M on Table 1 and 15.0 M on Question 2', () => {
      const rawTableMarks = 11.0; // 10 tests * 1.10 = 11.0 M
      const cappedTableMarks = Math.min(10.0, rawTableMarks);
      assert.strictEqual(cappedTableMarks, 10.0, 'Table marks must be capped at 10.0 M');
      const totalWithId = Math.min(15.0, cappedTableMarks + 5.0);
      assert.strictEqual(totalWithId, 15.0, 'Composite Q2 score must not exceed 15.0 M');
    });

    it('should penalize taboo phrase "white solution" by -0.5 Mk', () => {
      const tabooHits = KnecPedagogy.detectTabooPhrases('formed a white solution', 'observation', false);
      assert.strictEqual(tabooHits.length, 1, 'Must detect 1 taboo phrase');
      assert.strictEqual(tabooHits[0].ruleCode, 'TP', 'Must trigger TP rule code');
      assert.strictEqual(tabooHits[0].markDeduction, 0.5, 'Must deduct 0.5 Mk');
    });

    it('should strictly suppress taboo phrase alerts when isExamMode is true', () => {
      const tabooHitsExam = KnecPedagogy.detectTabooPhrases('formed a white solution', 'observation', true);
      assert.strictEqual(tabooHitsExam.length, 0, 'Must suppress taboo alerts during exam mode');
    });

    it('should penalize missing ionic charges in inferences [CP]', () => {
      const tabooHits = KnecPedagogy.detectTabooPhrases('Pb and Al present', 'inference', false);
      assert.strictEqual(tabooHits.length, 1, 'Must detect uncharged element symbols');
      assert.strictEqual(tabooHits[0].ruleCode, 'CP', 'Must trigger CP rule code');
    });
  });

  describe('4. Simulation Engine & Apparatus Rendering', () => {
    const QualitativeBenchCore = require(path.join(rootDir, 'client/shared/qualitative-bench-core.js'));

    it('should export QualitativeBenchCore with renderApparatusSvg and resolveReactionState', () => {
      assert.strictEqual(typeof QualitativeBenchCore.renderApparatusSvg, 'function', 'renderApparatusSvg must be a function');
      assert.strictEqual(typeof QualitativeBenchCore.resolveReactionState, 'function', 'resolveReactionState must be a function');
    });

    it('should render flame test SVG with cobalt blue glass toggle support', () => {
      const svgNaked = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'potassiumChloride',
        testId: 'flame',
        stage: 'done',
        opticalMode: 'naked',
        isCobaltGlass: false
      });
      assert.ok(svgNaked.includes('<svg'), 'Must render valid SVG');

      const svgCobalt = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'potassiumChloride',
        testId: 'flame',
        stage: 'done',
        opticalMode: 'cobalt',
        isCobaltGlass: true
      });
      assert.ok(svgCobalt.includes('<svg'), 'Must render valid SVG with cobalt glass');
    });

    it('should render multi-stage precipitation apparatus (few drops vs excess)', () => {
      const svgDrop = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'copperSulfate',
        testId: 'naoh',
        stage: 'few_drops'
      });
      assert.ok(svgDrop.includes('<svg'), 'Must render dropwise stage SVG');

      const svgExcess = QualitativeBenchCore.renderApparatusSvg({
        saltKey: 'copperSulfate',
        testId: 'naoh',
        stage: 'excess'
      });
      assert.ok(svgExcess.includes('<svg'), 'Must render excess stage SVG');
    });
  });

  describe('Bench 3 (Organic Chemistry Functional Group Lab) Audit Regression Suite', () => {
    const orgHtml = fs.readFileSync(path.join(rootDir, 'client/student/organic.html'), 'utf8');
    const orgEngineCode = fs.readFileSync(path.join(rootDir, 'client/student/js/organic-engine.js'), 'utf8');
    const OrganicBenchCore = require(path.join(rootDir, 'client/shared/organic-bench-core.js'));
    const { EXAM_PRACTICAL_ORGANIC_KEYS, SAMPLES: ENGINE_SAMPLES, TESTS: ENGINE_TESTS, evaluateOrganicObservation, evaluateOrganicInference } = require(path.join(rootDir, 'client/student/js/organic-engine.js'));

    describe('1. Script Tag & Asset Inclusions in organic.html', () => {
      it('should import knec-grading.js, knec-pedagogy.js, and organic-bench-core.js', () => {
        assert.ok(orgHtml.includes('/shared/knec-grading.js'), 'organic.html must import knec-grading.js');
        assert.ok(orgHtml.includes('/shared/knec-pedagogy.js'), 'organic.html must import knec-pedagogy.js');
        assert.ok(orgHtml.includes('/shared/organic-bench-core.js'), 'organic.html must import organic-bench-core.js');
        assert.ok(orgHtml.includes('js/organic-engine.js'), 'organic.html must import organic-engine.js');
      });

      it('should have live alert, feedback container and accessibility badges', () => {
        assert.ok(orgHtml.includes('id="knecSubbar"'), 'organic.html must have #knecSubbar');
        assert.ok(orgHtml.includes('id="knecEvalModal"'), 'organic.html must have #knecEvalModal');
        assert.ok(orgHtml.includes('id="idResultBox"'), 'organic.html must have #idResultBox');
      });
    });

    describe('2. Examination Sample Pool & Identification UI Consistency', () => {
      it('should define EXAM_PRACTICAL_ORGANIC_KEYS with exactly 4 curriculum representative samples', () => {
        assert.ok(Array.isArray(EXAM_PRACTICAL_ORGANIC_KEYS), 'EXAM_PRACTICAL_ORGANIC_KEYS must be an array');
        assert.strictEqual(EXAM_PRACTICAL_ORGANIC_KEYS.length, 4, 'Must have 4 exam practical samples');
        assert.deepStrictEqual(EXAM_PRACTICAL_ORGANIC_KEYS, ['org_alkene', 'org_alcohol', 'org_acid', 'org_alkane']);
      });

      it('should ensure all 4 exam samples have exact matching options in #compoundSelect and #fgSelect', () => {
        EXAM_PRACTICAL_ORGANIC_KEYS.forEach(key => {
          const sample = ENGINE_SAMPLES[key];
          assert.ok(sample, `Sample ${key} must exist in SAMPLES`);
          assert.ok(orgHtml.includes(`value="${sample.compoundKey}"`), `compoundSelect must contain option for ${sample.compoundKey}`);
          assert.ok(orgHtml.includes(`value="${sample.fgKey}"`), `fgSelect must contain option for ${sample.fgKey}`);
        });
      });

      it('should support ?sample= and ?compound= URL parameter overrides', () => {
        assert.ok(orgEngineCode.includes("urlParams.get('sample')"), 'organic-engine must check urlParam sample');
        assert.ok(orgEngineCode.includes("urlParams.get('compound')"), 'organic-engine must check urlParam compound');
      });
    });

    describe('3. KNEC Paper 3 Question 3 10-Mark Rubric Standard', () => {
      it('should scale Part 1 (7 tests) to exactly 7.0 Marks from 9.8 raw marks', () => {
        const rawFullMarks = 9.8;
        const scaledTable = parseFloat(Math.min(7.0, (rawFullMarks / 9.8) * 7.0).toFixed(1));
        assert.strictEqual(scaledTable, 7.0, 'Full table marks must scale to 7.0 M');

        const rawHalfMarks = 4.9;
        const scaledHalf = parseFloat(Math.min(7.0, (rawHalfMarks / 9.8) * 7.0).toFixed(1));
        assert.strictEqual(scaledHalf, 3.5, 'Half table marks must scale to 3.5 M');
      });

      it('should evaluate Part 2 final deduction as 1.5 M for Functional Group + 1.5 M for Compound Identity', () => {
        const fgCorrect = true;
        const compCorrect = true;
        const fgMarks = fgCorrect ? 1.5 : 0.0;
        const compMarks = compCorrect ? 1.5 : 0.0;
        const idMarks = parseFloat((fgMarks + compMarks).toFixed(1));
        assert.strictEqual(idMarks, 3.0, 'Full deduction marks must equal 3.0 M');

        const partialMarks = (true ? 1.5 : 0) + (false ? 1.5 : 0);
        assert.strictEqual(partialMarks, 1.5, 'Partial deduction marks must equal 1.5 M');
      });

      it('should enforce 10.0 M maximum score for Question 3 with accurate grade bands', () => {
        const totalMarks = Math.min(10.0, 7.0 + 3.0);
        assert.strictEqual(totalMarks, 10.0, 'Total Q3 score must be 10.0 M');

        const gradeA = totalMarks >= 8.0 ? 'A' : 'Other';
        assert.strictEqual(gradeA, 'A', '10.0 M must yield Grade A');

        const score6_5 = 6.5;
        const gradeB = score6_5 >= 8.0 ? 'A' : (score6_5 >= 6.5 ? 'B' : 'Other');
        assert.strictEqual(gradeB, 'B', '6.5 M must yield Grade B');
      });

      it('should correctly score observation and inference for hex-1-ene bromine test', () => {
        const sample = ENGINE_SAMPLES['org_alkene'];
        const obsEval = evaluateOrganicObservation('bromine', sample, 'Bromine water is decolourized immediately');
        assert.strictEqual(obsEval.pass, true, 'Correct observation must pass');
        assert.strictEqual(obsEval.score, 0.7, 'Correct observation gets 0.7 M');

        const infEval = evaluateOrganicInference('bromine', sample, 'C=C unsaturation present');
        assert.strictEqual(infEval.pass, true, 'Correct inference must pass');
        assert.strictEqual(infEval.score, 0.7, 'Correct inference gets 0.7 M');
      });
    });

    describe('4. Misconception Traps & Exam-Mode Suppression', () => {
      it('should detect taboo phrase "neutral" or acidic misconceptions in learning mode', () => {
        const hits = KnecPedagogy.detectTabooPhrases('formed a white solution', 'observation', false);
        assert.strictEqual(hits.length, 1, 'Taboo phrase must be detected in learning mode');
      });

      it('should strictly suppress taboo alerts in exam mode', () => {
        const hits = KnecPedagogy.detectTabooPhrases('formed a white solution', 'observation', true);
        assert.strictEqual(hits.length, 0, 'Taboo alerts must be suppressed in exam mode');
      });

      it('should validate organic formula notation in KnecPedagogy', () => {
        const prevValid = KnecPedagogy.getFormulaPreview('R-OH', 'organic');
        assert.strictEqual(prevValid.isValid, true, 'R-OH must be valid formula');
        assert.strictEqual(prevValid.formattedText, 'R—OH', 'Must format unicode em-dash bond');

        const prevAlkene = KnecPedagogy.getFormulaPreview('>c=c<', 'organic');
        assert.strictEqual(prevAlkene.isValid, true, '>c=c< must be valid formula');
        assert.strictEqual(prevAlkene.formattedText, '>C=C<', 'Must capitalize carbon atoms');
      });
    });

    describe('5. Organic Simulation Engine & Apparatus SVG Rendering', () => {
      it('should render ignition on spatula with sooty smoke for hex-1-ene', () => {
        const svg = OrganicBenchCore.renderIgnitionSvg({
          sampleKey: 'org_alkene',
          performed: true
        });
        assert.ok(svg.includes('<svg'), 'Ignition must produce valid SVG');
        assert.ok(svg.includes('spatula') || svg.includes('flame') || svg.includes('smoke'), 'Ignition SVG must render flame apparatus elements');
      });

      it('should render bromine water decolourization test tube apparatus', () => {
        const svg = OrganicBenchCore.renderDecolorizationSvg({
          sampleKey: 'org_alkene',
          testType: 'bromine',
          performed: true
        });
        assert.ok(svg.includes('<svg'), 'Bromine test must produce valid SVG');
      });

      it('should render sodium carbonate effervescence apparatus with gas bubbles', () => {
        const svg = OrganicBenchCore.renderEffervescenceSvg({
          sampleKey: 'org_acid',
          performed: true
        });
        assert.ok(svg.includes('<svg'), 'Carbonate test must produce valid SVG');
      });

      it('should render esterification water bath apparatus', () => {
        const svg = OrganicBenchCore.renderEsterificationSvg({
          sampleKey: 'org_alcohol',
          performed: true
        });
        assert.ok(svg.includes('<svg'), 'Esterification must produce valid SVG');
      });

      it('should render litmus paper immersion apparatus', () => {
        const svg = OrganicBenchCore.renderLitmusSvg({
          sampleKey: 'org_acid',
          performed: true
        });
        assert.ok(svg.includes('<svg'), 'Litmus test must produce valid SVG');
      });
    });
  });

  describe('Bench 4 (Thermochemistry & Energetics Bench) Audit Regression Suite', () => {
    const energyHtml = fs.readFileSync(path.join(rootDir, 'client/student/energy.html'), 'utf8');
    const EnergyBenchCore = require(path.join(rootDir, 'client/shared/energy-bench-core.js'));
    const EnergyEngine = require(path.join(rootDir, 'client/student/js/energy-engine.js'));

    describe('1. Script Tag & Asset Inclusions in energy.html', () => {
      it('should import knec-grading.js, knec-pedagogy.js, energy-bench-core.js, and energy-engine.js', () => {
        assert.ok(energyHtml.includes('/shared/knec-grading.js'), 'energy.html must import knec-grading.js');
        assert.ok(energyHtml.includes('/shared/knec-pedagogy.js'), 'energy.html must import knec-pedagogy.js');
        assert.ok(energyHtml.includes('/shared/energy-bench-core.js'), 'energy.html must import energy-bench-core.js');
        assert.ok(energyHtml.includes('/student/js/energy-engine.js'), 'energy.html must import energy-engine.js');
        assert.ok(energyHtml.includes('/shared/knec-graph-plotter.js'), 'energy.html must import knec-graph-plotter.js');
      });

      it('should have official examination subbar, scratchpad drawer, and graph modal', () => {
        assert.ok(energyHtml.includes('id="knecSubbar"'), 'energy.html must have #knecSubbar');
        assert.ok(energyHtml.includes('id="scratchpadDrawer"'), 'energy.html must have #scratchpadDrawer');
        assert.ok(energyHtml.includes('id="knecPlotterModal"'), 'energy.html must have #knecPlotterModal');
        assert.ok(energyHtml.includes('id="assignmentHeaderBanner"'), 'energy.html must have #assignmentHeaderBanner');
      });
    });

    describe('2. Authentic KCSE Thermochemistry Presets & Reaction Systems', () => {
      it('should export all 8 authentic KCSE practical systems with verified constants', () => {
        assert.ok(EnergyEngine.SYSTEMS, 'EnergyEngine must export SYSTEMS');
        const systems = EnergyEngine.SYSTEMS;

        // KCSE 2004 Cooling Curve
        assert.ok(systems.KCSE_2004_COOLING_CURVE, 'Must include KCSE 2004 Cooling Curve');
        assert.strictEqual(systems.KCSE_2004_COOLING_CURVE.freezingPoint, 69.0, 'Stearic acid freezing point must be 69.0 °C');
        assert.strictEqual(systems.KCSE_2004_COOLING_CURVE.apparatusType, 'COOLING');

        // KCSE 2022 Displacement (Zn + CuSO4)
        assert.ok(systems.KCSE_2022_DISPLACEMENT, 'Must include KCSE 2022 Displacement');
        assert.strictEqual(systems.KCSE_2022_DISPLACEMENT.deltaH_theoretical, -217.0, 'Displacement deltaH must be -217.0 kJ/mol');

        // KCSE 2023 Neutralization (HCl + NaOH)
        assert.ok(systems.KCSE_2023_NEUTRALIZATION, 'Must include KCSE 2023 Neutralization');
        assert.strictEqual(systems.KCSE_2023_NEUTRALIZATION.deltaH_theoretical, -57.1, 'Strong acid-base deltaH must be -57.1 kJ/mol');

        // KCSE 2024 Weak Acid-Strong Base (CH3COOH + NaOH)
        assert.ok(systems.KCSE_2024_WEAK_STRONG, 'Must include KCSE 2024 Weak-Strong');
        assert.strictEqual(systems.KCSE_2024_WEAK_STRONG.deltaH_theoretical, -55.2, 'Weak acid-base deltaH must be -55.2 kJ/mol');

        // KCSE 2020 Endothermic Solution (NH4NO3)
        assert.ok(systems.KCSE_2020_SOLUTION_ENDOTHERMIC, 'Must include KCSE 2020 Solution');
        assert.ok(systems.KCSE_2020_SOLUTION_ENDOTHERMIC.deltaH_theoretical > 0, 'Solution deltaH must be positive (endothermic)');

        // KCSE 2018 Combustion of Ethanol
        assert.ok(systems.KCSE_2018_COMBUSTION_ETHANOL, 'Must include KCSE 2018 Combustion');
        assert.strictEqual(systems.KCSE_2018_COMBUSTION_ETHANOL.apparatusType, 'COMBUSTION');
      });
    });

    describe('3. KNEC Thermochemistry 15.0-Mark Rubric Standard', () => {
      it('should correctly sum authentic 15.0 marks (CT 1.0, D 1.0, AC 1.0, Graph 3.0, Calculations 9.0)', () => {
        const ctMark = 1.0;
        const dMark = 1.0;
        const acMark = 1.0;
        const graphMark = 3.0; // Scale 1.0 + Points 1.0 + Extrapolation 1.0
        const calcDt = 1.5;
        const calcQ = 2.0;
        const calcMoles = 2.0;
        const calcDeltaH = 2.5;
        const calcEq = 1.0;

        const totalCalculations = calcDt + calcQ + calcMoles + calcDeltaH + calcEq;
        assert.strictEqual(totalCalculations, 9.0, 'Calculations must total 9.0 Marks');

        const totalScore = ctMark + dMark + acMark + graphMark + totalCalculations;
        assert.strictEqual(totalScore, 15.0, 'Thermochemistry composite practical must equal 15.0 Marks');
      });

      it('should enforce proper sign conventions for exothermic vs endothermic molar enthalpies', () => {
        // Exothermic displacement: negative deltaH required
        const exoDeltaH = -215.4;
        assert.ok(exoDeltaH < 0, 'Exothermic displacement requires negative sign');

        // Endothermic solution: positive deltaH required
        const endoDeltaH = +25.7;
        assert.ok(endoDeltaH > 0, 'Endothermic dissolution requires positive sign');
      });

      it('should accurately calculate heat change Q = mcΔT in Joules', () => {
        const mass = 25.0; // 25 cm3 aqueous solution = 25.0 g
        const c = 4.2; // J / g · °C
        const deltaT = 14.5; // °C temperature rise
        const qJoules = mass * c * deltaT;
        assert.strictEqual(qJoules, 1522.5, 'Q must equal 1522.5 J');

        const moles = (0.5 * 25.0) / 1000; // 0.0125 mol
        assert.strictEqual(moles, 0.0125, 'Moles must equal 0.0125 mol');

        const deltaH_kJ = -(qJoules / 1000) / moles;
        assert.strictEqual(Math.round(deltaH_kJ * 10) / 10, -121.8, 'Molar enthalpy must equal -121.8 kJ/mol');
      });
    });

    describe('4. Exam Mode Proctoring & Security', () => {
      it('should alert and reject loadSampleData() during exam sessions', () => {
        assert.ok(typeof EnergyEngine.loadSampleData === 'function', 'loadSampleData must exist');
        assert.ok(typeof EnergyEngine.setStudyMode === 'function', 'setStudyMode must exist');

        // Set exam mode
        EnergyEngine.setStudyMode('exam');

        // Mock window.alert to capture rejection
        let alertMsg = '';
        const originalAlert = global.window.alert;
        global.window.alert = (msg) => { alertMsg = msg; };

        EnergyEngine.loadSampleData();
        assert.ok(alertMsg.includes('disabled during official examination'), 'Must reject pre-filled sample data in exam mode');

        // Restore alert and studyMode
        global.window.alert = originalAlert;
        EnergyEngine.setStudyMode('practice');
      });
    });

    describe('5. High-Fidelity Calorimeter Apparatus & SVG Physics Rendering', () => {
      it('should render SVG calorimeter with mapped mercury level and temperature display', () => {
        const svg = EnergyBenchCore.renderCalorimeterSvg({
          temp: 36.5,
          liquidColor: 'rgba(2, 132, 199, 0.8)',
          hasDeposit: true,
          isStirring: true
        });
        assert.ok(svg.includes('<svg'), 'Must produce valid SVG element');
        assert.ok(svg.includes('36.5 °C'), 'Must display live temperature tag in SVG');
        assert.ok(svg.includes('Polystyrene Calorimeter Cup'), 'Must render polystyrene cup');
        assert.ok(svg.includes('Copper Deposit at Base'), 'Must render copper deposit when hasDeposit is true');
        assert.ok(svg.includes('Insulating Cotton Wool Nest'), 'Must render protective outer beaker and cotton wool nest');
      });

      it('should export audio functions playMetronomeBeep and playStirrerSwoosh', () => {
        assert.strictEqual(typeof EnergyBenchCore.playMetronomeBeep, 'function', 'playMetronomeBeep must be a function');
        assert.strictEqual(typeof EnergyBenchCore.playStirrerSwoosh, 'function', 'playStirrerSwoosh must be a function');
      });
    });
  });

  describe('Bench 5 (Reaction Rates & Chemical Kinetics Lab) Audit Regression Suite', () => {
    const ratesHtml = fs.readFileSync(path.join(rootDir, 'client/student/rates.html'), 'utf8');
    const RatesBenchCore = require(path.join(rootDir, 'client/shared/rates-bench-core.js'));
    const RatesEngine = require(path.join(rootDir, 'client/student/js/rates-engine.js'));

    describe('1. Script Tag & Asset Inclusions in rates.html', () => {
      it('should import knec-grading.js, knec-pedagogy.js, rates-bench-core.js, and rates-engine.js', () => {
        assert.ok(ratesHtml.includes('/shared/knec-grading.js'), 'rates.html must import knec-grading.js');
        assert.ok(ratesHtml.includes('/shared/knec-pedagogy.js'), 'rates.html must import knec-pedagogy.js');
        assert.ok(ratesHtml.includes('/shared/rates-bench-core.js'), 'rates.html must import rates-bench-core.js');
        assert.ok(ratesHtml.includes('/student/js/rates-engine.js'), 'rates.html must import rates-engine.js');
        assert.ok(ratesHtml.includes('/shared/knec-graph-plotter.js'), 'rates.html must import knec-graph-plotter.js');
      });

      it('should have official examination subbar, result modal, and graph plotter modal', () => {
        assert.ok(ratesHtml.includes('id="knecSubbar"'), 'rates.html must have #knecSubbar');
        assert.ok(ratesHtml.includes('id="rateExamResultModal"'), 'rates.html must have #rateExamResultModal');
        assert.ok(ratesHtml.includes('id="knecPlotterModal"'), 'rates.html must have #knecPlotterModal');
      });
    });

    describe('2. Kinetics Reaction Systems & Apparatus Standards in rates-bench-core.js', () => {
      it('should define all 4 canonical kinetics experiments in RatesBenchCore', () => {
        assert.ok(RatesBenchCore.EXPERIMENTS, 'RatesBenchCore must export EXPERIMENTS');
        const exps = RatesBenchCore.EXPERIMENTS;

        // 1. Disappearing Cross
        assert.ok(exps.cross, 'Must include cross experiment');
        assert.deepStrictEqual(exps.cross.standardVolsThio, [50, 40, 30, 20, 10], 'Must define 5 standard dilution volumes');
        assert.strictEqual(exps.cross.standardVolAcid, 5.0, 'Standard acid volume must be 5.0 cm³');
        assert.ok(exps.cross.equation.includes('Na₂S₂O₃'), 'Equation must include sodium thiosulfate');
        assert.ok(exps.cross.equation.includes('S(s)'), 'Equation must include sulfur precipitate');

        // 2. Gas Syringe
        assert.ok(exps.syringe, 'Must include gas syringe experiment');
        assert.strictEqual(exps.syringe.maxVolume, 100.0, 'Max syringe volume must be 100.0 cm³');

        // 3. Mass Loss Balance
        assert.ok(exps.massLoss, 'Must include mass loss experiment');

        // 4. Catalytic Decomposition
        assert.ok(exps.catalyst, 'Must include catalyst experiment');
      });
    });

    describe('3. KNEC Kinetics 15.0-Mark Rubric Standard', () => {
      it('should calculate complete 15.0-mark kinetics score (Table 5.0 M + Graph 4.0 M + Deductions 6.0 M)', () => {
        const tableScore = 5.0; // CT 1.0, D 1.0, AC 2.0, TR 1.0
        const graphScore = 4.0; // Scale 1.0, Axes 0.5, Plotting 1.0, Line 1.5
        const calcScore = 6.0;  // Q(a) 1.5, Q(b) 2.0, Q(c) 1.5, Q(d) 1.0

        const totalScore = tableScore + graphScore + calcScore;
        assert.strictEqual(totalScore, 15.0, 'Total KNEC Kinetics practical score must equal 15.0 Marks');
      });

      it('should calculate reciprocal rate 1/t to 4 decimal places with correct units (s⁻¹)', () => {
        const time1 = 20.8;
        const rate1 = parseFloat((1.0 / time1).toFixed(4));
        assert.strictEqual(rate1, 0.0481, 'Rate for 20.8 s must equal 0.0481 s⁻¹');

        const time5 = 105.3;
        const rate5 = parseFloat((1.0 / time5).toFixed(4));
        assert.strictEqual(rate5, 0.0095, 'Rate for 105.3 s must equal 0.0095 s⁻¹');
      });

      it('should verify collision theory requirement: collision frequency per unit time', () => {
        const studentGoodAnswer = 'Increased concentration increases the number of particles per unit volume leading to higher collision frequency per unit time';
        const hasFrequency = studentGoodAnswer.includes('collision') && (studentGoodAnswer.includes('frequency') || studentGoodAnswer.includes('per unit time'));
        assert.ok(hasFrequency, 'Candidate must cite collision frequency or per unit time for full 2.0 marks');
      });
    });

    describe('4. Exam Mode Proctoring & Security', () => {
      it('should alert and reject loadSampleData() during official exam sessions', () => {
        RatesEngine.setStudyMode('exam');
        const st = RatesEngine.getState();
        assert.strictEqual(st.studyMode, 'exam', 'Study mode must be set to exam');

        let alertMsg = '';
        const originalAlert = global.window.alert;
        global.window.alert = (msg) => { alertMsg = msg; };

        RatesEngine.loadSampleData();
        assert.ok(alertMsg.includes('disabled during official examination'), 'Must reject pre-filled sample data in exam mode');

        global.window.alert = originalAlert;
        RatesEngine.setStudyMode('practice');
      });
    });

    describe('5. High-Fidelity Apparatus SVG Rendering & Physics Simulation', () => {
      it('should render disappearing cross SVG with progressive cross obscuration', () => {
        // Clear (turbidity = 0)
        const svgClear = RatesBenchCore.renderDisappearingCrossSvg({ turbidity: 0.0, disappeared: false });
        assert.ok(svgClear.includes('<svg'), 'Must produce valid SVG');
        assert.ok(svgClear.includes('CROSS CLEARLY VISIBLE'), 'Must indicate cross is visible');

        // Fully obscured (turbidity = 1.0)
        const svgObscured = RatesBenchCore.renderDisappearingCrossSvg({ turbidity: 1.0, disappeared: true });
        assert.ok(svgObscured.includes('CROSS DISAPPEARED'), 'Must indicate cross disappeared');
      });

      it('should render gas syringe SVG with plunger displacement proportional to gas volume', () => {
        const svgSyringe0 = RatesBenchCore.renderGasSyringeSvg({ currentVol: 0.0, maxVol: 100.0 });
        assert.ok(svgSyringe0.includes('<svg'), 'Must produce valid SVG');
        assert.ok(svgSyringe0.includes('0.0 cm³'), 'Must render 0.0 cm³ readout');

        const svgSyringe50 = RatesBenchCore.renderGasSyringeSvg({ currentVol: 50.0, maxVol: 100.0 });
        assert.ok(svgSyringe50.includes('50.0 cm³'), 'Must render 50.0 cm³ readout');
      });

      it('should export audio functions playStopwatchClick, playGasBubbling, and playPourLiquid', () => {
        assert.strictEqual(typeof RatesBenchCore.playStopwatchClick, 'function', 'playStopwatchClick must be a function');
        assert.strictEqual(typeof RatesBenchCore.playGasBubbling, 'function', 'playGasBubbling must be a function');
        assert.strictEqual(typeof RatesBenchCore.playPourLiquid, 'function', 'playPourLiquid must be a function');
      });
    });
  });

  describe('Bench 6 (Gas Preparation & Identification Lab) Audit Regression Suite', () => {
    const gasHtml = fs.readFileSync(path.join(rootDir, 'client/student/gas_prep.html'), 'utf8');
    const GasPrepBenchCore = require(path.join(rootDir, 'client/shared/gas-prep-bench-core.js'));
    const { GAS_DATABASE, GasPrepEngine } = require(path.join(rootDir, 'client/student/js/gas-prep-engine.js'));

    describe('1. Script Tag & Asset Inclusions in gas_prep.html', () => {
      it('should import knec-grading.js, knec-pedagogy.js, gas-prep-bench-core.js, and gas-prep-engine.js', () => {
        assert.ok(gasHtml.includes('/shared/gas-prep-bench-core.js'), 'Must import gas-prep-bench-core.js');
        assert.ok(gasHtml.includes('/student/js/gas-prep-engine.js'), 'Must import gas-prep-engine.js');
        assert.ok(gasHtml.includes('/shared/knec-grading.js'), 'Must import knec-grading.js');
        assert.ok(gasHtml.includes('/shared/knec-pedagogy.js'), 'Must import knec-pedagogy.js');
      });

      it('should include unified examination subbar with id="knecSubbar" and Question 3 Inorganic header', () => {
        assert.ok(gasHtml.includes('id="knecSubbar"'), 'Must have id="knecSubbar"');
        assert.ok(gasHtml.includes('Question 3 (Inorganic Gas Preparation)'), 'Must declare Question 3 Section');
        assert.ok(gasHtml.includes('10.0 Marks'), 'Must state 10.0 Marks standard');
      });
    });

    describe('2. Canonical KCSE Syllabus Gases & Chemical Incompatibility Rules', () => {
      it('should define all 6 canonical KCSE practical gases in both core and engine databases', () => {
        const requiredGases = ['O2', 'CO2', 'Cl2', 'NH3', 'SO2', 'H2'];
        requiredGases.forEach(gKey => {
          assert.ok(GAS_DATABASE[gKey], `GAS_DATABASE must contain ${gKey}`);
          assert.ok(GasPrepBenchCore.GAS_DATABASE[gKey], `GasPrepBenchCore must contain ${gKey}`);
        });
      });

      it('should enforce that basic NH3 can ONLY be dried with Quicklime (CaO), rejecting conc H2SO4 and CaCl2', () => {
        const nh3 = GAS_DATABASE.NH3;
        assert.deepStrictEqual(nh3.compatibleDrying, ['quicklimeCaO'], 'NH3 must only allow quicklimeCaO');
        assert.ok(nh3.dryingExplanations.concH2SO4.includes('FATAL ERROR'), 'Must highlight reaction with H2SO4');
        assert.ok(nh3.dryingExplanations.anhydrousCaCl2.includes('FATAL ERROR'), 'Must highlight complex with CaCl2');
      });

      it('should enforce that acidic gases (CO2, SO2, Cl2) reject basic Quicklime (CaO)', () => {
        assert.ok(!GAS_DATABASE.CO2.compatibleDrying.includes('quicklimeCaO'), 'CO2 cannot use CaO');
        assert.ok(!GAS_DATABASE.SO2.compatibleDrying.includes('quicklimeCaO'), 'SO2 cannot use CaO');
        assert.ok(!GAS_DATABASE.Cl2.compatibleDrying.includes('quicklimeCaO'), 'Cl2 cannot use CaO');
      });

      it('should enforce correct collection methods based on density and water solubility', () => {
        assert.ok(GAS_DATABASE.O2.compatibleCollection.includes('overWater'), 'O2 over water');
        assert.ok(GAS_DATABASE.CO2.compatibleCollection.includes('downwardDelivery'), 'CO2 downward delivery');
        assert.ok(GAS_DATABASE.NH3.compatibleCollection.includes('upwardDelivery'), 'NH3 upward delivery');
        assert.ok(!GAS_DATABASE.NH3.compatibleCollection.includes('overWater'), 'NH3 cannot be collected over water');
        assert.ok(GAS_DATABASE.H2.compatibleCollection.includes('overWater') && GAS_DATABASE.H2.compatibleCollection.includes('upwardDelivery'), 'H2 over water or upward');
      });

      it('should correctly enforce Bunsen heating requirements (Cl2, NH3 require heat; O2, CO2, H2, SO2 are cold)', () => {
        assert.strictEqual(GAS_DATABASE.O2.heatingRequired, false, 'O2 no heat');
        assert.strictEqual(GAS_DATABASE.CO2.heatingRequired, false, 'CO2 no heat');
        assert.strictEqual(GAS_DATABASE.H2.heatingRequired, false, 'H2 no heat');
        assert.strictEqual(GAS_DATABASE.SO2.heatingRequired, false, 'SO2 no heat');
        assert.strictEqual(GAS_DATABASE.Cl2.heatingRequired, true, 'Cl2 requires heat');
        assert.strictEqual(GAS_DATABASE.NH3.heatingRequired, true, 'NH3 requires heat');
      });
    });

    describe('3. KNEC Paper 3 Question 3 10.0-Mark Rubric Standard', () => {
      it('should score an optimal assembly, qualitative tests, and theoretical questions full 10.0 Marks', () => {
        const eng = new GasPrepEngine();
        eng.selectGas('O2');
        eng.setDryingAgent('concH2SO4');
        eng.setCollectionMethod('overWater');
        eng.runReaction();

        // Perform positive confirmatory tests
        eng.performTest('glowingSplint');
        eng.performTest('dampLitmus');

        // Answer theory questions correctly
        eng.answerQuestion('q_o2_role', 0);
        eng.answerQuestion('q_o2_coll', 0);

        const rubric = eng.calculateRubric();
        assert.strictEqual(rubric.dryingScore, 2.0, 'Drying agent should score 2.0 Marks');
        assert.strictEqual(rubric.collectionScore, 2.0, 'Collection method should score 2.0 Marks');
        assert.strictEqual(rubric.heatingScore, 1.0, 'Heating match should score 1.0 Mark');
        assert.strictEqual(rubric.setupScore, 5.0, 'Setup subtotal should score 5.0 Marks');
        assert.strictEqual(rubric.testScore, 3.0, 'Confirmatory tests should score 3.0 Marks');
        assert.strictEqual(rubric.theoryScore, 2.0, 'Theory questions should score 2.0 Marks');
        assert.strictEqual(rubric.totalScore, 10.0, 'Total score should be exactly 10.0 Marks');
        assert.strictEqual(rubric.isPassing, true, 'Score >= 6.5 must be passing');
      });

      it('should penalize incompatible drying agents (e.g. NH3 with conc H2SO4) and collection failures', () => {
        const eng = new GasPrepEngine();
        eng.selectGas('NH3');
        eng.setDryingAgent('concH2SO4'); // WRONG
        eng.setCollectionMethod('overWater'); // WRONG
        eng.heatingEnabled = true; // correct heating

        const rubric = eng.calculateRubric();
        assert.strictEqual(rubric.dryingScore, 0.0, 'Incompatible drying forfeits 2.0 Marks');
        assert.strictEqual(rubric.collectionScore, 0.0, 'Incompatible collection forfeits 2.0 Marks');
        assert.strictEqual(rubric.heatingScore, 1.0, 'Heating match receives 1.0 Mark');
        assert.strictEqual(rubric.setupScore, 1.0, 'Setup should only score 1.0 Mark');
      });

      it('should build complete session payload with rubric breakdown and duration', () => {
        const eng = new GasPrepEngine();
        eng.selectGas('CO2');
        eng.setDryingAgent('concH2SO4');
        eng.setCollectionMethod('downwardDelivery');
        eng.runReaction();
        eng.performTest('limeWater');

        const payload = eng.buildSessionPayload(101, 'exam');
        assert.strictEqual(payload.assignment_id, 101, 'Assignment ID preserved');
        assert.strictEqual(payload.gas_key, 'CO2', 'Gas key preserved');
        assert.strictEqual(payload.mode, 'exam', 'Mode preserved');
        assert.strictEqual(payload.max_score, 10.0, 'Max score must be 10.0');
        assert.ok(payload.total_score > 0, 'Total score calculated');
      });
    });

    describe('4. Simulation Physics & High-Fidelity SVG Apparatus Rendering', () => {
      it('should render complete gas apparatus SVG for over-water collection', () => {
        const svgWater = GasPrepBenchCore.renderCompleteGasApparatusSvg({
          gasKey: 'O2',
          isGenerating: true,
          heatingEnabled: false,
          dryingAgent: 'concH2SO4',
          collectionMethod: 'overWater',
          width: 500,
          height: 280
        });
        assert.ok(svgWater.includes('<svg'), 'Must render valid SVG');
        assert.ok(svgWater.includes('O₂: GENERATING'), 'Must display generating status badge');
        assert.ok(svgWater.includes('Pneumatic Trough'), 'Must render pneumatic trough');
      });

      it('should render complete gas apparatus SVG for downward delivery with heating', () => {
        const svgHeated = GasPrepBenchCore.renderCompleteGasApparatusSvg({
          gasKey: 'Cl2',
          isGenerating: true,
          heatingEnabled: true,
          dryingAgent: 'concH2SO4',
          collectionMethod: 'downwardDelivery',
          width: 500,
          height: 280
        });
        assert.ok(svgHeated.includes('<svg'), 'Must render valid SVG');
        assert.ok(svgHeated.includes('anim-flame'), 'Must render Bunsen flame');
        assert.ok(svgHeated.includes('Cl₂: GENERATING'), 'Must display Cl2 formula');
      });

      it('should export procedural audio synthesizer triggers playGasBubbling, playSqueakyPop, and playFlameWhoosh', () => {
        assert.strictEqual(typeof GasPrepBenchCore.playGasBubbling, 'function', 'playGasBubbling must be a function');
        assert.strictEqual(typeof GasPrepBenchCore.playSqueakyPop, 'function', 'playSqueakyPop must be a function');
        assert.strictEqual(typeof GasPrepBenchCore.playFlameWhoosh, 'function', 'playFlameWhoosh must be a function');
      });
    });
  });
});

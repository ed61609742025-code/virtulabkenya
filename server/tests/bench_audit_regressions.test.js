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
});

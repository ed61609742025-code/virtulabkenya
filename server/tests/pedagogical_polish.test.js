/**
 * VirtuLab Kenya — Category 1: Pedagogical & Grading Polish Suite Tests
 * 
 * Validates:
 * 1. Chemical Formula Auto-Formatting & Unicode Normalization (Cations, Anions, Organic Bonds/Groups)
 * 2. Live Formula Preview & Chemical Species Extraction
 * 3. Real-Time Taboo Phrase & Misconception Guardrails (Practice Mode vs. Exam Mode Suppression)
 * 4. Chief Examiner Diagnostic Rationale Generation across Volumetric, Inorganic, and Organic Rubrics
 * 5. PWA Cache v111 and Cross-Bench HTML/CSS Asset Integration
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const KnecPedagogy = require('../../client/shared/knec-pedagogy.js');

describe('Category 1: Pedagogical & Grading Polish Tests', () => {

  describe('1. Chemical Formula Auto-Formatting & Normalization', () => {
    it('should correctly format single cations with unicode superscripts', () => {
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('pb2+'), 'Pb²⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('Al3+'), 'Al³⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('zn2+'), 'Zn²⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('fe2+'), 'Fe²⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('fe3+'), 'Fe³⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('cu2+'), 'Cu²⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('ca2+'), 'Ca²⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('ba2+'), 'Ba²⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('mg2+'), 'Mg²⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('nh4+'), 'NH₄⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('na+'), 'Na⁺');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('k+'), 'K⁺');
    });

    it('should correctly format single anions with unicode subscripts & superscripts', () => {
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('so42-'), 'SO₄²⁻');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('so32-'), 'SO₃²⁻');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('co32-'), 'CO₃²⁻');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('no3-'), 'NO₃⁻');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('cl-'), 'Cl⁻');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('oh-'), 'OH⁻');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('i-'), 'I⁻');
    });

    it('should correctly format organic functional groups and bonds', () => {
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('>c=c<'), '>C=C<');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('-c=c-'), '—C=C—');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('c#c'), '—C≡C—');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('r-oh'), 'R—OH');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('r-cooh'), 'R—COOH');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('-oh'), '—OH');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('-cooh'), '—COOH');
    });

    it('should seamlessly format mixed candidate inference sentences', () => {
      const input = 'Pb2+, Al3+ and Zn2+ present; SO42- or Cl- suspected with R-OH';
      const expected = 'Pb²⁺, Al³⁺ and Zn²⁺ present; SO₄²⁻ or Cl⁻ suspected with R—OH';
      assert.strictEqual(KnecPedagogy.formatChemicalFormula(input), expected);
    });

    it('should handle edge-case inputs gracefully without throwing', () => {
      assert.strictEqual(KnecPedagogy.formatChemicalFormula(''), '');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula(null), '');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula(undefined), '');
      assert.strictEqual(KnecPedagogy.formatChemicalFormula('White precipitate insoluble in excess'), 'White precipitate insoluble in excess');
    });
  });

  describe('2. Live Formula Preview & Species Extraction', () => {
    it('should extract recognized inorganic species and generate preview badges', () => {
      const prev = KnecPedagogy.getFormulaPreview('Pb2+, Al3+ and SO42- present', 'inorganic');
      assert.strictEqual(prev.isValid, true);
      assert.deepStrictEqual(prev.recognizedSpecies, ['Pb²⁺', 'Al³⁺', 'SO₄²⁻']);
      assert.ok(prev.message.includes('Pb²⁺, Al³⁺, SO₄²⁻'));
    });

    it('should extract recognized organic groups and bonds', () => {
      const prev = KnecPedagogy.getFormulaPreview('>c=c< or c#c with r-cooh', 'organic');
      assert.strictEqual(prev.isValid, true);
      assert.ok(prev.recognizedSpecies.includes('>C=C<'));
      assert.ok(prev.recognizedSpecies.includes('—C≡C—'));
      assert.ok(prev.recognizedSpecies.includes('R—COOH'));
    });

    it('should return isValid = false for non-chemical inputs', () => {
      const prev = KnecPedagogy.getFormulaPreview('Dissolves quickly in water', 'inorganic');
      assert.strictEqual(prev.isValid, false);
      assert.strictEqual(prev.recognizedSpecies.length, 0);
      assert.strictEqual(prev.message, '');
    });
  });

  describe('3. Real-Time Taboo Phrase & Misconception Guardrails', () => {
    it('should detect taboo "white solution" and flag 0.5 Mk penalty', () => {
      const hits = KnecPedagogy.detectTabooPhrases('White solution formed upon addition of water', 'observation');
      assert.strictEqual(hits.length, 1);
      assert.strictEqual(hits[0].id, 'white_solution');
      assert.strictEqual(hits[0].severity, 'penalty');
      assert.strictEqual(hits[0].markDeduction, 0.5);
      assert.strictEqual(hits[0].ruleCode, 'TP');
      assert.ok(hits[0].alert.includes('Solutions are transparent & colourless'));
    });

    it('should detect ambiguous "clear solution" when colour is omitted', () => {
      const hits = KnecPedagogy.detectTabooPhrases('Clear solution observed', 'observation');
      assert.strictEqual(hits.length, 1);
      assert.strictEqual(hits[0].id, 'clear_ambiguity');
      assert.strictEqual(hits[0].severity, 'warning');
      assert.strictEqual(hits[0].markDeduction, 0.0);
    });

    it('should not flag "clear solution" if "colourless" is explicitly specified', () => {
      const hits = KnecPedagogy.detectTabooPhrases('Clear colourless solution formed', 'observation');
      assert.strictEqual(hits.length, 0);
    });

    it('should detect carbonate reaction gas error if hydrogen is recorded', () => {
      const hits = KnecPedagogy.detectTabooPhrases('Effervescence of hydrogen gas evolved', 'carbonate');
      assert.strictEqual(hits.length, 1);
      assert.strictEqual(hits[0].id, 'carbonate_hydrogen');
      assert.strictEqual(hits[0].severity, 'penalty');
      assert.ok(hits[0].alert.includes('CO₂'));
    });

    it('should detect alkanol litmus misconception if acidic is recorded', () => {
      const hits = KnecPedagogy.detectTabooPhrases('Acidic substance / turns blue litmus red', 'organic_neutral');
      assert.strictEqual(hits.length, 1);
      assert.strictEqual(hits[0].id, 'alkanol_acidic');
      assert.strictEqual(hits[0].severity, 'penalty');
      assert.ok(hits[0].alert.includes('Alkanols (alcohols) are neutral'));
    });

    it('should detect unsaturated combustion misconception if blue flame is recorded', () => {
      const hits = KnecPedagogy.detectTabooPhrases('Burns with a pale blue flame', 'organic_unsaturated');
      assert.strictEqual(hits.length, 1);
      assert.strictEqual(hits[0].id, 'unsaturated_blue_flame');
      assert.strictEqual(hits[0].severity, 'warning');
      assert.ok(hits[0].alert.includes('luminous, smoky/sooty yellow flame'));
    });

    it('should detect bare ion symbol without formal charge in inference context', () => {
      const hits = KnecPedagogy.detectTabooPhrases('Pb and Al present', 'inference');
      assert.strictEqual(hits.length, 1);
      assert.strictEqual(hits[0].id, 'missing_ionic_charge');
      assert.strictEqual(hits[0].ruleCode, 'CP');
      assert.strictEqual(hits[0].markDeduction, 0.5);
    });

    it('should NOT flag charges when valid superscripts or charges are present', () => {
      const hits = KnecPedagogy.detectTabooPhrases('Pb²⁺, Al³⁺ present', 'inference');
      assert.strictEqual(hits.length, 0);
    });

    it('should STRICTLY SUPPRESS all real-time alerts when isExamMode is true', () => {
      const hitsExam = KnecPedagogy.detectTabooPhrases('White solution formed with Pb and Al', 'observation', true);
      assert.strictEqual(hitsExam.length, 0, 'No alerts should leak into an active formal exam');
    });
  });

  describe('4. Chief Examiner Diagnostic Rationale Generation', () => {
    it('should return full marks satisfaction status when item passes completely', () => {
      const rat = KnecPedagogy.getExaminerRationale({
        testLabel: 'Addition of Aqueous NaOH',
        score: 1.5,
        maxScore: 1.5,
        candidateText: 'White ppt soluble in excess',
        expectedText: 'White ppt soluble in excess'
      });
      assert.strictEqual(rat.isFullMark, true);
      assert.strictEqual(rat.knecClause, 'Criterion Satisfied');
      assert.ok(rat.summary.includes('Full marks awarded'));
    });

    it('should generate Chief Examiner rationale for taboo "white solution"', () => {
      const rat = KnecPedagogy.getExaminerRationale({
        score: 0.5,
        maxScore: 1.5,
        candidateText: 'White solution formed',
        penalties: { tabooPenalty: true }
      });
      assert.strictEqual(rat.isFullMark, false);
      assert.strictEqual(rat.knecClause, '[TP] Taboo Scientific Phrase Penalty');
      assert.ok(rat.rationale.includes('white solution'));
      assert.ok(rat.pedagogicalTip.includes('colourless solution formed'));
    });

    it('should generate Chief Examiner rationale for missing charge superscripts [CP]', () => {
      const rat = KnecPedagogy.getExaminerRationale({
        score: 0.5,
        maxScore: 1.5,
        candidateText: 'Pb or Al present',
        penalties: { chargePenalty: true }
      });
      assert.strictEqual(rat.isFullMark, false);
      assert.strictEqual(rat.knecClause, '[CP] Ionic Charge Superscript Penalty');
      assert.ok(rat.rationale.includes('formal ionic superscripts'));
      assert.ok(rat.pedagogicalTip.includes('Scientific Notation Keypad'));
    });

    it('should generate Chief Examiner rationale for contradictory ions [CI]', () => {
      const rat = KnecPedagogy.getExaminerRationale({
        score: 0.0,
        maxScore: 1.5,
        candidateText: 'Cu²⁺ present on white ppt',
        penalties: { ciPenalty: 0.5 }
      });
      assert.strictEqual(rat.isFullMark, false);
      assert.strictEqual(rat.knecClause, '[CI] Contradictory Ion Deduction');
      assert.ok(rat.rationale.includes('contradictory ions'));
      assert.ok(rat.pedagogicalTip.includes('White precipitates eliminate coloured transition ions'));
    });

    it('should generate Chief Examiner rationale for non-concordant titres [PA]', () => {
      const rat = KnecPedagogy.getExaminerRationale({
        score: 1.0,
        maxScore: 3.0,
        ruleCode: 'PA',
        penalties: { nonConcordant: true },
        type: 'volumetric'
      });
      assert.strictEqual(rat.isFullMark, false);
      assert.strictEqual(rat.knecClause, '[PA] Concordant Titre Principle');
      assert.ok(rat.rationale.includes('±0.20 cm³'));
    });

    it('should generate Chief Examiner rationale for burette decimal precision [D]', () => {
      const rat = KnecPedagogy.getExaminerRationale({
        score: 1.0,
        maxScore: 2.0,
        ruleCode: 'D',
        penalties: { decimalPlaces: true },
        type: 'volumetric'
      });
      assert.strictEqual(rat.isFullMark, false);
      assert.strictEqual(rat.knecClause, '[D] Burette Decimal Precision');
      assert.ok(rat.rationale.includes('2 decimal places'));
    });
  });

  describe('5. PWA Cache v111 & Cross-Bench HTML/CSS Asset Integrity', () => {
    it('should have sw.js configured with cache version virtulab-kenya-v111 or higher', () => {
      const swPath = path.resolve(__dirname, '../../client/sw.js');
      const swCode = fs.readFileSync(swPath, 'utf8');
      assert.ok(/const CACHE_NAME = 'virtulab-kenya-v11[1-9]';/.test(swCode), 'sw.js must be bumped to virtulab-kenya-v111 or higher');
      assert.ok(swCode.includes("'/shared/knec-pedagogy.js'"), 'sw.js PRECACHE_ASSETS must include /shared/knec-pedagogy.js');
    });

    it('should have knec-pedagogy.js included in all relevant student bench HTML files', () => {
      const files = ['qualitative.html', 'organic.html', 'composite_exam.html', 'lab.html'];
      files.forEach(f => {
        const filePath = path.resolve(__dirname, `../../client/student/${f}`);
        const code = fs.readFileSync(filePath, 'utf8');
        assert.ok(code.includes('knec-pedagogy.js'), `${f} must include knec-pedagogy.js`);
      });
    });

    it('should have pedagogy CSS styling in shared/style.css', () => {
      const stylePath = path.resolve(__dirname, '../../client/shared/style.css');
      const styleCode = fs.readFileSync(stylePath, 'utf8');
      assert.ok(styleCode.includes('.chem-preview-box'), 'style.css must define .chem-preview-box');
      assert.ok(styleCode.includes('.taboo-nudge-alert'), 'style.css must define .taboo-nudge-alert');
      assert.ok(styleCode.includes('.examiner-rationale-box'), 'style.css must define .examiner-rationale-box');
    });
  });
});

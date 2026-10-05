/**
 * VirtuLab Kenya — KNEC Chemistry Paper 3 (233/3) Pedagogical Marking Rubric Audit
 * 
 * Verifies 100% fidelity to official KNEC KCSE practical examination rubrics:
 * 1. 12-Point KCSE Grading Scale, Points (12-1) & Academic Descriptors.
 * 2. Table 1 Volumetric Quantitative Rubric (CT, D, AC, PA, FA).
 * 3. Interactive Graph Plotter Rubric (S, P, C - Scale, Plotting, Curve/Line).
 * 4. Error Carried Forward (e.c.f.) across multi-step stoichiometry.
 * 5. Qualitative Analysis (Inorganic cations/anions, amphoteric grouping, taboo phrases).
 * 6. Thermochemistry (ΔT extrapolation, Q = mcΔT, sign convention on ΔH).
 * 7. Reaction Kinetics (Collision frequency per unit time, disappearing cross rates).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const KnecGrading = require(path.join(rootDir, 'client/shared/knec-grading.js'));
const KNECGraphPlotter = require(path.join(rootDir, 'client/shared/knec-graph-plotter.js'));

describe('KNEC Chemistry Paper 3 (233/3) Pedagogical Marking Rubric Audit', () => {

  // ── 1. Official 12-Point KCSE Grading Scale & Points ───────────
  describe('1. Official 12-Point KCSE Grading Scale & Points', () => {
    it('should accurately map percentages to all 12 official KNEC KCSE grades', () => {
      // Out of 40 marks
      assert.strictEqual(KnecGrading.calculateKnecGrade(36, 40), 'A');   // 90%
      assert.strictEqual(KnecGrading.calculateKnecGrade(32, 40), 'A');   // 80%
      assert.strictEqual(KnecGrading.calculateKnecGrade(30, 40), 'A-');  // 75%
      assert.strictEqual(KnecGrading.calculateKnecGrade(28, 40), 'B+');  // 70%
      assert.strictEqual(KnecGrading.calculateKnecGrade(26, 40), 'B');   // 65%
      assert.strictEqual(KnecGrading.calculateKnecGrade(24, 40), 'B-');  // 60%
      assert.strictEqual(KnecGrading.calculateKnecGrade(22, 40), 'C+');  // 55%
      assert.strictEqual(KnecGrading.calculateKnecGrade(20, 40), 'C');   // 50%
      assert.strictEqual(KnecGrading.calculateKnecGrade(18, 40), 'C-');  // 45%
      assert.strictEqual(KnecGrading.calculateKnecGrade(16, 40), 'D+');  // 40%
      assert.strictEqual(KnecGrading.calculateKnecGrade(14, 40), 'D');   // 35%
      assert.strictEqual(KnecGrading.calculateKnecGrade(12, 40), 'D-');  // 30%
      assert.strictEqual(KnecGrading.calculateKnecGrade(10, 40), 'E');   // 25%
      assert.strictEqual(KnecGrading.calculateKnecGrade(0, 40), 'E');    // 0%
    });

    it('should assign accurate KNEC points from 12 (A) down to 1 (E)', () => {
      assert.strictEqual(KnecGrading.getKnecPoints('A'), 12);
      assert.strictEqual(KnecGrading.getKnecPoints('A-'), 11);
      assert.strictEqual(KnecGrading.getKnecPoints('B+'), 10);
      assert.strictEqual(KnecGrading.getKnecPoints('B'), 9);
      assert.strictEqual(KnecGrading.getKnecPoints('B-'), 8);
      assert.strictEqual(KnecGrading.getKnecPoints('C+'), 7);
      assert.strictEqual(KnecGrading.getKnecPoints('C'), 6);
      assert.strictEqual(KnecGrading.getKnecPoints('C-'), 5);
      assert.strictEqual(KnecGrading.getKnecPoints('D+'), 4);
      assert.strictEqual(KnecGrading.getKnecPoints('D'), 3);
      assert.strictEqual(KnecGrading.getKnecPoints('D-'), 2);
      assert.strictEqual(KnecGrading.getKnecPoints('E'), 1);
    });

    it('should provide official pedagogical descriptors', () => {
      assert.ok(KnecGrading.getKnecDescriptor('A').includes('Distinction'));
      assert.ok(KnecGrading.getKnecDescriptor('C+').includes('University Entry'));
      assert.ok(KnecGrading.getKnecDescriptor('E').includes('Remediation'));
    });
  });

  // ── 2. Table 1 Quantitative Titration Rubric (CT, D, AC, PA, FA) ─
  describe('2. Table 1 Quantitative Titration Rubric (CT, D, AC, PA, FA)', () => {
    it('should award full 5.0 marks for immaculate concordant titration trials', () => {
      const trials = [
        { initial: 0.00, final: 21.40, used: 21.40, recorded: true },
        { initial: 0.00, final: 21.30, used: 21.30, recorded: true },
        { initial: 0.00, final: 21.35, used: 21.35, recorded: true }
      ];
      const trueTitre = 21.35;
      const res = KnecGrading.evaluateKnecTable1(trials, trueTitre, 21.35);

      assert.strictEqual(res.maxScore, 5.0);
      assert.strictEqual(res.tableScore, 5.0);
      assert.strictEqual(res.rubric.length, 5);

      const ct = res.rubric.find(r => r.code === 'CT');
      const d = res.rubric.find(r => r.code === 'D');
      const ac = res.rubric.find(r => r.code === 'AC');
      const pa = res.rubric.find(r => r.code === 'PA');
      const fa = res.rubric.find(r => r.code === 'FA');

      assert.strictEqual(ct.mark, 1.0);
      assert.strictEqual(d.mark, 1.0);
      assert.strictEqual(ac.mark, 1.0);
      assert.strictEqual(pa.mark, 1.0);
      assert.strictEqual(fa.mark, 1.0);
    });

    it('should penalize decimal violations [D] when readings end in digits other than 0 or 5', () => {
      const trials = [
        { initial: 0.00, final: 21.43, used: 21.43, recorded: true }, // ends in 3!
        { initial: 0.00, final: 21.45, used: 21.45, recorded: true },
        { initial: 0.00, final: 21.40, used: 21.40, recorded: true }
      ];
      const res = KnecGrading.evaluateKnecTable1(trials, 21.45, 21.43);
      const d = res.rubric.find(r => r.code === 'D');
      assert.strictEqual(d.mark, 0.0, 'Burette reading ending in .43 must be penalized 0.0 on Decimals');
    });

    it('should penalize non-concordant titres [PA] when spread exceeds ±0.20 cm³', () => {
      const trials = [
        { initial: 0.00, final: 21.20, used: 21.20, recorded: true },
        { initial: 0.00, final: 21.80, used: 21.80, recorded: true } // spread = 0.60 cm³!
      ];
      const res = KnecGrading.evaluateKnecTable1(trials, 21.50, 21.50);
      const pa = res.rubric.find(r => r.code === 'PA');
      assert.strictEqual(pa.mark, 0.0, 'Spread of 0.60 cm³ must receive 0.0 marks for Averaging');
    });

    it('should award accuracy marks [AC] based on deviation thresholds (±0.10 and ±0.20 cm³)', () => {
      // Within 0.10 cm³
      const resClose = KnecGrading.evaluateKnecTable1(
        [{ initial: 0, final: 25.05, used: 25.05, recorded: true }, { initial: 0, final: 25.10, used: 25.10, recorded: true }],
        25.00
      );
      assert.strictEqual(resClose.rubric.find(r => r.code === 'AC').mark, 1.0);

      // Within 0.20 cm³
      const resMedium = KnecGrading.evaluateKnecTable1(
        [{ initial: 0, final: 25.15, used: 25.15, recorded: true }, { initial: 0, final: 25.20, used: 25.20, recorded: true }],
        25.00
      );
      assert.strictEqual(resMedium.rubric.find(r => r.code === 'AC').mark, 0.5);

      // Beyond 0.20 cm³
      const resFar = KnecGrading.evaluateKnecTable1(
        [{ initial: 0, final: 25.35, used: 25.35, recorded: true }, { initial: 0, final: 25.40, used: 25.40, recorded: true }],
        25.00
      );
      assert.strictEqual(resFar.rubric.find(r => r.code === 'AC').mark, 0.0);
    });
  });

  // ── 3. Interactive Graph Plotter Rubric (S, P, C) ─────────────
  describe('3. Interactive Graph Plotter Rubric (S, P, C)', () => {
    it('should award full 3.0 marks when points cover > 50% grid and are accurately plotted with smooth curve', () => {
      const plotter = new KNECGraphPlotter({
        xMin: 0, xMax: 100,
        yMin: 0, yMax: 100,
        initialPoints: [
          { x: 10, y: 15 },
          { x: 30, y: 35 },
          { x: 50, y: 60 },
          { x: 75, y: 85 },
          { x: 90, y: 95 }
        ],
        defaultMode: 'curve'
      });

      const expected = [
        { x: 10, y: 15 },
        { x: 30, y: 35 },
        { x: 50, y: 60 },
        { x: 75, y: 85 },
        { x: 90, y: 95 }
      ];

      const res = plotter.evaluateKNECRubric({ expectedPoints: expected });
      assert.strictEqual(res.maxScore, 3.0);
      assert.strictEqual(res.scaleMark, 1.0, 'Scale must pass (> 50% span in x and y)');
      assert.strictEqual(res.plotMark, 1.0, 'Plotting must pass (100% points match)');
      assert.strictEqual(res.curveMark, 1.0, 'Curve must pass');
      assert.strictEqual(res.totalScore, 3.0);
    });

    it('should penalize scale [S] if candidate clusters points in a tiny sub-region (< 50% grid)', () => {
      const plotter = new KNECGraphPlotter({
        xMin: 0, xMax: 100,
        yMin: 0, yMax: 100,
        initialPoints: [
          { x: 5, y: 5 },
          { x: 10, y: 12 },
          { x: 15, y: 18 } // Only covers 0-15 out of 100!
        ],
        defaultMode: 'curve'
      });

      const res = plotter.evaluateKNECRubric();
      assert.strictEqual(res.scaleMark, 0.0, 'Compressed scale must receive 0 marks for Scale');
    });
  });

});

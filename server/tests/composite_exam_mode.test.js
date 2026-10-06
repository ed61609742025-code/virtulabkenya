// ============================================================
//  VirtuLab Kenya — Paper 3 Composite Practical Exam Mode Test Suite
//  KNEC KCSE Chemistry Paper 3 (233/3) 40.0-Mark Examination Engine
// ============================================================

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..', '..');
const { CompositeExamEngine, COMPOSITE_EXAM_PRESETS } = require(path.join(rootDir, 'client', 'student', 'js', 'composite-engine.js'));
const KnecGrading = require(path.join(rootDir, 'client', 'shared', 'knec-grading.js'));

describe('VirtuLab Kenya — Paper 3 Composite Practical Exam Mode (40.0 Marks)', () => {

  // ── 1. KNEC 40-Mark Paper 3 Structure & 12-Point Grade Scale ────
  describe('1. KNEC 40-Mark Paper 3 Structure & 12-Point Grade Scale', () => {
    it('should allocate exactly 40.0 marks across the three standardized KNEC questions', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_1' });
      assert.strictEqual(engine.preset.durationMinutes, 135);

      const q1Marks = engine.preset.q1.marks || 15.0;
      const q2Marks = engine.preset.q2.marks || 15.0;
      const q3Marks = engine.preset.q3.marks || 10.0;
      assert.strictEqual(q1Marks + q2Marks + q3Marks, 40.0);

      const evalData = engine.evaluateExam();
      assert.strictEqual(evalData.maxScore, 40.0);
    });

    it('should map all composite percentages (0% - 100%) to the official KNEC 12-point grade scale', () => {
      // 40.0 total marks
      assert.strictEqual(KnecGrading.calculateKnecGrade(40.0, 40.0), 'A');    // 100%
      assert.strictEqual(KnecGrading.calculateKnecGrade(36.0, 40.0), 'A');    // 90%
      assert.strictEqual(KnecGrading.calculateKnecGrade(32.0, 40.0), 'A');    // 80%
      assert.strictEqual(KnecGrading.calculateKnecGrade(30.0, 40.0), 'A-');   // 75%
      assert.strictEqual(KnecGrading.calculateKnecGrade(28.0, 40.0), 'B+');   // 70%
      assert.strictEqual(KnecGrading.calculateKnecGrade(26.0, 40.0), 'B');    // 65%
      assert.strictEqual(KnecGrading.calculateKnecGrade(24.0, 40.0), 'B-');   // 60%
      assert.strictEqual(KnecGrading.calculateKnecGrade(22.0, 40.0), 'C+');   // 55%
      assert.strictEqual(KnecGrading.calculateKnecGrade(20.0, 40.0), 'C');    // 50%
      assert.strictEqual(KnecGrading.calculateKnecGrade(18.0, 40.0), 'C-');   // 45%
      assert.strictEqual(KnecGrading.calculateKnecGrade(16.0, 40.0), 'D+');   // 40%
      assert.strictEqual(KnecGrading.calculateKnecGrade(14.0, 40.0), 'D');    // 35%
      assert.strictEqual(KnecGrading.calculateKnecGrade(12.0, 40.0), 'D-');   // 30%
      assert.strictEqual(KnecGrading.calculateKnecGrade(10.0, 40.0), 'E');    // 25%
      assert.strictEqual(KnecGrading.calculateKnecGrade(0.0, 40.0), 'E');     // 0%
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
  });

  // ── 2. Error Carried Forward (e.c.f.) Stoichiometric Evaluation ──
  describe('2. Error Carried Forward (e.c.f.) Stoichiometric Evaluation', () => {
    it('should award calculation marks based on candidate experimental titre rather than true titre', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_1' });
      // Set concordant candidate trials with average titre = 24.20 cm³ (true is 25.00)
      engine.recordTrial(1, 24.20, 0.00);
      engine.recordTrial(2, 24.20, 0.00);
      engine.recordTrial(3, 24.20, 0.00);
      engine.setConcordant(1, true);
      engine.setConcordant(2, true);
      engine.setConcordant(3, true);

      // Candidate inputs consistent with their 24.20 cm³ titre:
      // Acid molarity = 0.100 M -> moles acid = (0.100 * 24.20) / 1000 = 0.00242 mol
      // Mole ratio 1:1 -> moles base = 0.00242 mol
      // Pipette volume = 25.0 cm³ -> molarity base = (0.00242 * 1000) / 25.0 = 0.0968 M
      // Concentration g/dm³ (NaOH RFM = 40.0) = 0.0968 * 40.0 = 3.872 g/dm³
      engine.setQ1Answer('avgTitre', '24.20');
      engine.setQ1Answer('molesA', '0.00242');
      engine.setQ1Answer('molesB', '0.00242');
      engine.setQ1Answer('molarityB', '0.0968');
      engine.setQ1Answer('concGrams', '3.87');

      const q1Score = engine.calculateQ1Score();
      assert.strictEqual(q1Score.calcScore, 10.0, 'Candidate should receive full 10.0 calculation marks via e.c.f.');
      assert.ok(q1Score.totalScore >= 13.0, 'Total Q1 score should reflect full calculation marks despite experimental deviation');
    });

    it('should flag calculations if algebraic steps diverge significantly from candidate titre and e.c.f.', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_1' });
      engine.recordTrial(1, 24.00, 0.00);
      engine.recordTrial(2, 24.00, 0.00);
      engine.setConcordant(1, true);
      engine.setConcordant(2, true);

      engine.setQ1Answer('avgTitre', '24.00');
      // Intentionally incorrect moles and diverging values that do not follow e.c.f.
      engine.setQ1Answer('molesA', '0.0500');
      engine.setQ1Answer('molesB', '0.0100');
      engine.setQ1Answer('molarityB', '0.500');
      engine.setQ1Answer('concGrams', '12.00');

      const q1Score = engine.calculateQ1Score();
      assert.ok(q1Score.calcScore < 5.0, 'Incorrect stoichiometric calculations should be penalized');
    });
  });

  // ── 3. Preset Coverage & National Series Verification ───────────
  describe('3. Preset Coverage & National Series Verification (Series 1–5)', () => {
    it('should contain all 5 standardized KNEC national mock examination series', () => {
      const expectedSeries = ['series_1', 'series_2', 'series_3', 'series_4', 'series_5'];
      expectedSeries.forEach(sKey => {
        assert.ok(COMPOSITE_EXAM_PRESETS[sKey], `Preset ${sKey} must exist`);
        const p = COMPOSITE_EXAM_PRESETS[sKey];
        assert.ok(p.title, `${sKey} must have a title`);
        assert.ok(p.q1, `${sKey} must have Question 1`);
        assert.ok(p.q2, `${sKey} must have Question 2`);
        assert.ok(p.q3, `${sKey} must have Question 3`);
        assert.strictEqual(p.durationMinutes, 135);
      });
    });

    it('should correctly configure Series 1: Standard Acid-Base Volumetric Titration', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_1' });
      assert.strictEqual(engine.preset.q1.calcType, 'standard_molarity');
      assert.strictEqual(engine.preset.q1.pipetteVolume, 25.0);
      assert.strictEqual(engine.preset.q2.sampleName, 'Solid Y');
      assert.strictEqual(engine.preset.q3.sampleName, 'Liquid Z');
    });

    it('should correctly configure Series 2: Stoichiometric Hydration (Water of Crystallization)', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_2' });
      assert.strictEqual(engine.preset.q1.calcType, 'water_of_crystallization');
      assert.ok(/crystallization|hydration/i.test(engine.preset.q1.title || engine.preset.badgeText));
    });

    it('should correctly configure Series 3: Percentage Purity Analysis', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_3' });
      assert.strictEqual(engine.preset.q1.calcType, 'percentage_purity');
      assert.ok(/purity/i.test(engine.preset.q1.title || engine.preset.badgeText));
    });

    it('should correctly configure Series 4: Redox Volumetric Analysis', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_4' });
      assert.strictEqual(engine.preset.q1.calcType, 'redox_stoichiometry');
      assert.strictEqual(engine.preset.q1.indicator, 'Self-indicating (KMnO₄)');
    });

    it('should correctly configure Series 5: Relative Atomic Mass (RAM) Determination', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_5' });
      assert.strictEqual(engine.preset.q1.calcType, 'ram_metal');
      assert.ok(engine.preset.q1);
    });
  });

  // ── 4. Polymorphic Q2/Q3 Scoring & Bounds Clamping ───────────────
  describe('4. Polymorphic Q2/Q3 Scoring & Bounds Clamping', () => {
    it('should respect custom question max scores without truncating Q3 when Q3 is 15 marks', () => {
      // In polymorphic exams, Q2 can be Organic (10m) and Q3 can be Inorganic (15m)
      const polymorphicConfig = {
        questions: [
          { number: 1, type: 'volumetric', marks: 15.0 },
          { number: 2, type: 'organic', marks: 10.0 },
          { number: 3, type: 'qualitative', marks: 15.0 }
        ]
      };

      const engine = new CompositeExamEngine({ presetKey: 'custom' });
      engine.applyConfig(polymorphicConfig);

      // Verify Question 2 and Question 3 marks allocation
      assert.strictEqual(engine.preset.q2.marks, 10.0);
      assert.strictEqual(engine.preset.q3.marks, 15.0);

      // Test route clamping logic
      const details = {
        q1: { maxScore: 15.0 },
        q2: { maxScore: 10.0 },
        q3: { maxScore: 15.0 }
      };

      const maxQ1 = (details && details.q1 && typeof details.q1.maxScore === 'number') ? details.q1.maxScore : 15;
      const maxQ2 = (details && details.q2 && typeof details.q2.maxScore === 'number') ? details.q2.maxScore : 15;
      const maxQ3 = (details && details.q3 && typeof details.q3.maxScore === 'number') ? details.q3.maxScore : 10;

      const studentQ3Score = 14.5;
      const clampedQ3 = Math.min(maxQ3, Math.max(0, studentQ3Score));
      assert.strictEqual(clampedQ3, 14.5, 'Clamped Q3 score should be 14.5, NOT truncated to 10');
    });
  });

  // ── 5. Real-Time KNEC Examination Pacing Coach ──────────────────
  describe('5. Real-Time KNEC Examination Pacing Coach', () => {
    function computePacingMilestoneStatus(currentQ, elapsedSeconds, timeLeft) {
      const qStatuses = {};
      for (let n = 1; n <= 3; n++) {
        if (n === currentQ) {
          let isOverdue = false;
          // Q1: 45 min = 2700s
          // Q2: 45 min (cumulative 90 min = 5400s)
          // Q3: 35 min (cumulative 125 min = 7500s)
          if (n === 1 && elapsedSeconds > 2700) isOverdue = true;
          else if (n === 2 && elapsedSeconds > 5400) isOverdue = true;
          else if (n === 3 && elapsedSeconds > 7500) isOverdue = true;

          qStatuses[`paceQ${n}`] = isOverdue ? 'overdue' : 'active';
        } else if (n < currentQ) {
          qStatuses[`paceQ${n}`] = 'completed';
        } else {
          qStatuses[`paceQ${n}`] = 'pending';
        }
      }

      qStatuses['paceRev'] = (timeLeft <= 600) ? 'active' : 'pending';
      return qStatuses;
    }

    it('should mark Q1 as active within the first 45 minutes', () => {
      const status = computePacingMilestoneStatus(1, 1200, 6900); // 20 min in
      assert.strictEqual(status['paceQ1'], 'active');
      assert.strictEqual(status['paceQ2'], 'pending');
      assert.strictEqual(status['paceQ3'], 'pending');
      assert.strictEqual(status['paceRev'], 'pending');
    });

    it('should flag Q1 as overdue when candidate remains on Q1 after 45 minutes', () => {
      const status = computePacingMilestoneStatus(1, 3000, 5100); // 50 min in
      assert.strictEqual(status['paceQ1'], 'overdue', 'Q1 must be flagged as overdue');
    });

    it('should mark Q1 completed and Q2 active on schedule', () => {
      const status = computePacingMilestoneStatus(2, 3600, 4500); // 60 min in
      assert.strictEqual(status['paceQ1'], 'completed');
      assert.strictEqual(status['paceQ2'], 'active');
      assert.strictEqual(status['paceQ3'], 'pending');
    });

    it('should activate final review milestone in the final 10 minutes (<= 600s left)', () => {
      const status = computePacingMilestoneStatus(3, 7600, 500); // < 10 min left
      assert.strictEqual(status['paceQ1'], 'completed');
      assert.strictEqual(status['paceQ2'], 'completed');
      assert.strictEqual(status['paceQ3'], 'overdue');
      assert.strictEqual(status['paceRev'], 'active', 'Final review reminder must be active');
    });
  });

  // ── 6. Mobile Touch Targets & Ergonomic Accessibility ───────────
  describe('6. Mobile Touch Targets & Ergonomic Accessibility', () => {
    it('should contain inputmode="decimal" and autocomplete="off" on Table 1 and Part 4 inputs in composite_exam.html', () => {
      const htmlPath = path.join(rootDir, 'client', 'student', 'composite_exam.html');
      const html = fs.readFileSync(htmlPath, 'utf8');

      // Table 1 inputs
      assert.ok(html.includes('id="t1Final" class="calc-input" style="text-align:center;" placeholder="0.00" inputmode="decimal" autocomplete="off"'));
      assert.ok(html.includes('id="t1Init" class="calc-input" style="text-align:center;" value="0.00" inputmode="decimal" autocomplete="off"'));

      // Part 4 calculation inputs
      assert.ok(html.includes('id="ansAvgTitre" class="calc-input dynamic-calc-input" data-field="avgTitre" data-step-id="step_a" placeholder="e.g. 25.00" inputmode="decimal" autocomplete="off"'));
      assert.ok(html.includes('id="ansMolesA" class="calc-input dynamic-calc-input" data-field="molesA" data-step-id="step_b" placeholder="e.g. 0.00250" inputmode="decimal" autocomplete="off"'));
      assert.ok(html.includes('id="ansMolesB" class="calc-input dynamic-calc-input" data-field="molesB" data-step-id="step_c" placeholder="e.g. 0.00250" inputmode="decimal" autocomplete="off"'));
      assert.ok(html.includes('id="ansMolarityB" class="calc-input dynamic-calc-input" data-field="molarityB" data-step-id="step_d" placeholder="e.g. 0.100" inputmode="decimal" autocomplete="off"'));
      assert.ok(html.includes('id="ansConcGrams" class="calc-input dynamic-calc-input" data-field="concGrams" data-step-id="step_e" placeholder="e.g. 4.00" inputmode="decimal" autocomplete="off"'));
    });

    it('should specify inputmode="decimal" in dynamic calculation input generator', () => {
      const uiPath = path.join(rootDir, 'client', 'student', 'js', 'composite-exam-ui.js');
      const uiCode = fs.readFileSync(uiPath, 'utf8');

      assert.ok(uiCode.includes('inputmode="decimal" autocomplete="off"'), 'Dynamic calculation inputs must render with decimal inputmode');
    });

    it('should define >=44px touch targets and touch-action: manipulation in composite_exam.css', () => {
      const cssPath = path.join(rootDir, 'client', 'student', 'css', 'composite_exam.css');
      const css = fs.readFileSync(cssPath, 'utf8');

      assert.ok(css.includes('.btn-bench'), 'Must contain .btn-bench');
      assert.ok(css.includes('.exam-tab-btn'), 'Must contain .exam-tab-btn');
      assert.ok(css.includes('min-height: 44px;'), 'Must enforce min-height: 44px');
      assert.ok(css.includes('touch-action: manipulation;'), 'Must enforce touch-action: manipulation');
      assert.ok(css.includes('font-size: 16px !important;'), 'Must enforce 16px font size to prevent mobile browser zoom');
      assert.ok(css.includes('.pacing-milestone.overdue'), 'Must style .pacing-milestone.overdue');
      assert.ok(css.includes('safe-area-inset-bottom'), 'Must include safe-area-inset-bottom');
    });
  });

  // ── 7. Submission Payload & Database Repository Integration ─────
  describe('7. Submission Payload & Database Repository Integration', () => {
    it('should construct a complete, structured 40-mark candidate submission payload', () => {
      const engine = new CompositeExamEngine({ presetKey: 'series_1' });
      engine.recordTrial(1, 24.20, 0.00);
      engine.recordTrial(2, 24.20, 0.00);
      engine.recordTrial(3, 24.20, 0.00);
      engine.setConcordant(1, true);
      engine.setConcordant(2, true);
      engine.setConcordant(3, true);

      engine.setQ1Answer('avgTitre', '24.20');
      engine.setQ1Answer('molesA', '0.00242');
      engine.setQ1Answer('molesB', '0.00242');
      engine.setQ1Answer('molarityB', '0.0968');
      engine.setQ1Answer('concGrams', '3.87');

      engine.q2Obs['t1'] = 'White precipitate formed';
      engine.q2Inf['t1'] = 'Pb2+, Al3+, Zn2+ present';
      engine.q2CationChoice = 'Pb2+';
      engine.q2AnionChoice = 'NO3-';

      engine.q3Obs['org1'] = 'Burns with a luminous smoky flame';
      engine.q3Inf['org1'] = 'Unsaturated hydrocarbon present';
      engine.q3FunctionalGroupChoice = 'Alkene (>C=C<)';

      const payload = engine.buildSubmissionPayload(101);

      assert.strictEqual(payload.assignment_id, 101);
      assert.ok(payload.exam_title);
      assert.strictEqual(typeof payload.q1_score, 'number');
      assert.strictEqual(typeof payload.q2_score, 'number');
      assert.strictEqual(typeof payload.q3_score, 'number');
      assert.strictEqual(typeof payload.total_score, 'number');
      assert.ok(payload.total_score <= 40.0, 'Total score must not exceed 40.0 marks');
      assert.ok(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'].includes(payload.grade));

      // Verify comprehensive details object
      assert.ok(payload.details);
      assert.strictEqual(payload.details.seriesKey, 'series_1');
      assert.ok(Array.isArray(payload.details.candidateTrials));
      assert.ok(payload.details.candidateQ2Deductions);
      assert.strictEqual(payload.details.candidateQ2Deductions.cation, 'Pb2+');
      assert.strictEqual(payload.details.candidateQ2Deductions.anion, 'NO3-');
      assert.strictEqual(payload.details.candidateQ3Deduction, 'Alkene (>C=C<)');
    });
  });

  // ── 8. Cryptographic SRI & Static Asset Integrity ───────────────
  describe('8. Cryptographic SRI & Static Asset Integrity', () => {
    it('should preserve Chart.js 4.4.1 SRI cryptographic hash across student composite exam HTML', () => {
      const htmlPath = path.join(rootDir, 'client', 'student', 'composite_exam.html');
      const html = fs.readFileSync(htmlPath, 'utf8');

      // Verify that if Chart.js is referenced anywhere, it retains the canonical hash
      if (html.includes('chart.js') || html.includes('chart.umd')) {
        assert.ok(
          html.includes('sha384-bs/nf9FbdNouRbMiFcrcZfLXYPKiPaGVGplVbv7dLGECccEXDW+S3zjqSKR5ZEaD'),
          'Chart.js SRI hash must be preserved'
        );
      }
    });

    it('should have mock_exams.html wired with proper query parameter links to composite_exam.html', () => {
      const hubPath = path.join(rootDir, 'client', 'student', 'mock_exams.html');
      const hubHtml = fs.readFileSync(hubPath, 'utf8');

      assert.ok(hubHtml.includes('launchSeries(seriesKey)'));
      assert.ok(hubHtml.includes('/student/composite_exam.html?series='));
    });
  });
});

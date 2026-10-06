const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const remediationDrillService = require('../services/remediationDrillService');
const feedbackRouter = require('../routes/feedback');

describe('VirtuLab Kenya — KNEC Competency Remediation Drills Test Suite', () => {
  describe('1. Drill Catalog Integrity & 5-Axis Coverage', () => {
    it('should have micro-drills for all 5 official KNEC competency axes', () => {
      const catalog = remediationDrillService.getDrillCatalog();
      const expectedCodes = ['D', 'PA', 'AC/FA', 'INORG', 'ORG'];

      for (const code of expectedCodes) {
        assert.ok(catalog[code], `Missing drills for code ${code}`);
        assert.ok(catalog[code].length >= 1, `Code ${code} must have at least 1 drill`);

        const drill = catalog[code][0];
        assert.ok(drill.id, 'Drill must have an id');
        assert.ok(drill.title, 'Drill must have a title');
        assert.strictEqual(drill.competencyCode, code);
        assert.ok(drill.durationSeconds > 0, 'Duration must be positive');
        assert.ok(drill.questionCount >= 3, 'Must have at least 3 practice challenges');
      }
    });

    it('should retrieve drill by competency code or specific drill ID', () => {
      const drillByCode = remediationDrillService.getRemediationDrill('INORG');
      assert.ok(drillByCode);
      assert.strictEqual(drillByCode.competencyCode, 'INORG');

      const drillById = remediationDrillService.getRemediationDrill('INORG', 'drill_inorg_01');
      assert.ok(drillById);
      assert.strictEqual(drillById.id, 'drill_inorg_01');

      const nonExistent = remediationDrillService.getRemediationDrill('NON_EXISTENT');
      assert.strictEqual(nonExistent, null);
    });
  });

  describe('2. Deterministic Grading for All 5 Competencies', () => {
    it('should grade Decimals (D) drill with perfect, partial, and failing marks', () => {
      // 100% Mastery
      const perfect = remediationDrillService.gradeDrillSubmission('D', 'drill_d_01', {
        q1: ['A', 'C', 'E'],
        q2: '0.00, 24.60',
        q3: 'B'
      });
      assert.strictEqual(perfect.percentage, 100);
      assert.strictEqual(perfect.isMastery, true);
      assert.strictEqual(perfect.status, 'Mastery Achieved');
      assert.ok(perfect.competencyBoost >= 20);

      // Partially correct (< 80% mastery threshold)
      const partial = remediationDrillService.gradeDrillSubmission('D', 'drill_d_01', {
        q1: ['A', 'C'], // missed E (5 pts)
        q2: 'invalid',  // 0 pts
        q3: 'B'         // 10 pts -> Total 15/30 = 50%
      });
      assert.strictEqual(partial.isMastery, false);
      assert.strictEqual(partial.percentage, 50);

      // Completely incorrect
      const zero = remediationDrillService.gradeDrillSubmission('D', 'drill_d_01', {
        q1: ['B', 'D'],
        q2: 'invalid',
        q3: 'A'
      });
      assert.strictEqual(zero.totalScore, 0);
      assert.strictEqual(zero.percentage, 0);
      assert.strictEqual(zero.status, 'Needs Practice');
    });

    it('should grade Principles of Averaging (PA) concordancy selection and working', () => {
      const res = remediationDrillService.gradeDrillSubmission('PA', 'drill_pa_01', {
        q1: ['2', '3', '4'],
        q2: '23.45',
        q3: 'B'
      });
      assert.strictEqual(res.totalScore, 30);
      assert.strictEqual(res.isMastery, true);
      assert.ok(res.itemizedReview.every(r => r.isCorrect));
    });

    it('should grade Accuracy (AC/FA) optical parallax & air bubble physics', () => {
      const res = remediationDrillService.gradeDrillSubmission('AC/FA', 'drill_ac_01', {
        q1: 'B', // Bottom of concave meniscus at eye level
        q2: 'A', // Bubble expels -> recorded titre higher than true volume
        q3: 'B'  // Permanent discharge lasting 30s
      });
      assert.strictEqual(res.totalScore, 30);
      assert.strictEqual(res.percentage, 100);
      assert.strictEqual(res.isMastery, true);
    });

    it('should grade Inorganic (INORG) qualitative amphoteric differentiation & anion confirmation', () => {
      const res = remediationDrillService.gradeDrillSubmission('INORG', 'drill_inorg_01', {
        q1: 'B', // Al3+ or Pb2+
        q2: 'yellow precipitate', // PbI2
        q3: 'B'  // BaSO4 insoluble in HNO3
      });
      assert.strictEqual(res.totalScore, 30);
      assert.strictEqual(res.percentage, 100);
      assert.strictEqual(res.isMastery, true);
    });

    it('should grade Organic (ORG) unsaturation, acidity, and alkanol oxidation', () => {
      const res = remediationDrillService.gradeDrillSubmission('ORG', 'drill_org_01', {
        q1: 'B', // >C=C< or -C≡C-
        q2: 'B', // R-COOH (effervescence of CO2)
        q3: 'orange to green' // K2Cr2O7 reduction
      });
      assert.strictEqual(res.totalScore, 30);
      assert.strictEqual(res.percentage, 100);
      assert.strictEqual(res.isMastery, true);
    });
  });

  describe('3. Route Registration & Endpoint Security', () => {
    it('should register all 4 drill endpoints on the feedback router', () => {
      const routes = feedbackRouter.stack.map(layer => ({
        path: layer.route?.path,
        methods: layer.route ? Object.keys(layer.route.methods) : []
      })).filter(r => r.path);

      const catalogRoute = routes.find(r => r.path === '/drill-catalog');
      assert.ok(catalogRoute, 'Must register GET /drill-catalog');
      assert.ok(catalogRoute.methods.includes('get'));

      const fetchRoute = routes.find(r => r.path === '/remediation-drill');
      assert.ok(fetchRoute, 'Must register POST /remediation-drill');
      assert.ok(fetchRoute.methods.includes('post'));

      const gradeRoute = routes.find(r => r.path === '/grade-drill');
      assert.ok(gradeRoute, 'Must register POST /grade-drill');
      assert.ok(gradeRoute.methods.includes('post'));

      const hintRoute = routes.find(r => r.path === '/drill-hint');
      assert.ok(hintRoute, 'Must register POST /drill-hint');
      assert.ok(hintRoute.methods.includes('post'));
    });
  });

  describe('4. Client-Side Offline Engine Parity', () => {
    it('should have knec-remediation-drills.js with complete catalog and offline grader', () => {
      const clientFilePath = path.join(__dirname, '..', '..', 'client', 'shared', 'knec-remediation-drills.js');
      assert.ok(fs.existsSync(clientFilePath), 'knec-remediation-drills.js must exist');
      const fileCode = fs.readFileSync(clientFilePath, 'utf8');

      assert.ok(fileCode.includes('window.KnecRemediation = {'), 'Must export window.KnecRemediation');
      assert.ok(fileCode.includes('drill_d_01'), 'Must contain drill_d_01');
      assert.ok(fileCode.includes('drill_pa_01'), 'Must contain drill_pa_01');
      assert.ok(fileCode.includes('drill_ac_01'), 'Must contain drill_ac_01');
      assert.ok(fileCode.includes('drill_inorg_01'), 'Must contain drill_inorg_01');
      assert.ok(fileCode.includes('drill_org_01'), 'Must contain drill_org_01');
      assert.ok(fileCode.includes('gradeDrill'), 'Must export offline gradeDrill method');
    });
  });
});

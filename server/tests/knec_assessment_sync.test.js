// ============================================================
//  Test Suite: KNEC Practical Assessment & Marking Scheme Sync
//  Standardized KCSE Paper 3 (233/3) Rubrics, Supervisor Calibration, Dual-Role RBAC & Score Sync
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const jwt = require('jsonwebtoken');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_knec_assessment_sync_112233';

const app = require('../index');
const pool = require('../db/pool');
const compositeRepo = require('../repositories/compositeRepo');
const authMiddleware = require('../middleware/auth');
const knecGrading = require(path.join(__dirname, '../../client/shared/knec-grading.js'));

let server;
let port = 0;

function url(subpath) {
  return `http://127.0.0.1:${port}${subpath}`;
}

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('KNEC Practical Assessment & Marking Scheme Sync Suite', () => {
  before((_, done) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      done();
    });
  });

  after((_, done) => {
    if (server) server.close(done);
    else done();
  });

  // ──────────────────────────────────────────────────────────
  // 1. KNEC 12-Point Academic Scale & Table 1 Rubrics
  // ──────────────────────────────────────────────────────────
  describe('KNEC KCSE 233/3 Academic Scale & Quantitative Rubrics', () => {
    it('should accurately convert scores to official KNEC 12-point letter grades', () => {
      assert.equal(knecGrading.calculateKnecGrade(36, 40), 'A');    // 90%
      assert.equal(knecGrading.calculateKnecGrade(32, 40), 'A');    // 80%
      assert.equal(knecGrading.calculateKnecGrade(30, 40), 'A-');   // 75%
      assert.equal(knecGrading.calculateKnecGrade(28, 40), 'B+');   // 70%
      assert.equal(knecGrading.calculateKnecGrade(26, 40), 'B');    // 65%
      assert.equal(knecGrading.calculateKnecGrade(24, 40), 'B-');   // 60%
      assert.equal(knecGrading.calculateKnecGrade(22, 40), 'C+');   // 55%
      assert.equal(knecGrading.calculateKnecGrade(20, 40), 'C');    // 50%
      assert.equal(knecGrading.calculateKnecGrade(18, 40), 'C-');   // 45%
      assert.equal(knecGrading.calculateKnecGrade(16, 40), 'D+');   // 40%
      assert.equal(knecGrading.calculateKnecGrade(14, 40), 'D');    // 35%
      assert.equal(knecGrading.calculateKnecGrade(12, 40), 'D-');   // 30%
      assert.equal(knecGrading.calculateKnecGrade(10, 40), 'E');    // 25%
    });

    it('should map grades to KCSE 12-point academic points correctly', () => {
      assert.equal(knecGrading.getKnecPoints('A'), 12);
      assert.equal(knecGrading.getKnecPoints('A-'), 11);
      assert.equal(knecGrading.getKnecPoints('B+'), 10);
      assert.equal(knecGrading.getKnecPoints('B'), 9);
      assert.equal(knecGrading.getKnecPoints('C+'), 7);
      assert.equal(knecGrading.getKnecPoints('C'), 6);
      assert.equal(knecGrading.getKnecPoints('D+'), 4);
      assert.equal(knecGrading.getKnecPoints('D-'), 2);
      assert.equal(knecGrading.getKnecPoints('E'), 1);
    });

    it('should award 5.0/5.0 marks for Table 1 with concordant titres matching supervisor value', () => {
      const supervisorTitre = 21.40;
      const trials = [
        { initial: 0.00, final: 21.40, used: 21.40, recorded: true },
        { initial: 0.00, final: 21.45, used: 21.45, recorded: true },
        { initial: 0.00, final: 21.40, used: 21.40, recorded: true }
      ];

      const result = knecGrading.evaluateKnecTable1(trials, supervisorTitre, 21.42);
      assert.equal(result.maxScore, 5.0);
      assert.equal(result.tableScore, 5.0);

      const codes = result.rubric.map(r => r.code);
      assert.deepEqual(codes, ['CT', 'D', 'AC', 'PA', 'FA']);

      const ct = result.rubric.find(r => r.code === 'CT');
      assert.equal(ct.mark, 1.0);
      assert.equal(ct.pass, true);

      const d = result.rubric.find(r => r.code === 'D');
      assert.equal(d.mark, 1.0);
      assert.equal(d.pass, true);

      const ac = result.rubric.find(r => r.code === 'AC');
      assert.equal(ac.mark, 1.0);
      assert.equal(ac.pass, true);

      const pa = result.rubric.find(r => r.code === 'PA');
      assert.equal(pa.mark, 1.0);
      assert.equal(pa.pass, true);

      const fa = result.rubric.find(r => r.code === 'FA');
      assert.equal(fa.mark, 1.0);
      assert.equal(fa.pass, true);
    });

    it('should penalize Table 1 when decimals violate strict 2 d.p. (.00 or .05)', () => {
      const supervisorTitre = 20.00;
      const trials = [
        { initial: 0.00, final: 20.12, used: 20.12, recorded: true }, // ends in .12, not .0 or .5
        { initial: 0.00, final: 20.13, used: 20.13, recorded: true }
      ];

      const result = knecGrading.evaluateKnecTable1(trials, supervisorTitre);
      const d = result.rubric.find(r => r.code === 'D');
      assert.equal(d.mark, 0.0);
      assert.equal(d.pass, false);
    });

    it('should award partial mark (0.5) for accuracy when deviation is between 0.10 and 0.20 cm³', () => {
      const supervisorTitre = 20.00;
      const trials = [
        { initial: 0.00, final: 20.15, used: 20.15, recorded: true }, // deviation = 0.15 cm³
        { initial: 0.00, final: 20.15, used: 20.15, recorded: true }
      ];

      const result = knecGrading.evaluateKnecTable1(trials, supervisorTitre);
      const ac = result.rubric.find(r => r.code === 'AC');
      assert.equal(ac.mark, 0.5);
      assert.equal(ac.pass, false);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 2. National Benchmarks Standard
  // ──────────────────────────────────────────────────────────
  describe('KNEC Paper 3 National Competency Benchmarks', () => {
    it('should return complete benchmark specification matching KCSE standards', () => {
      const b = compositeRepo.getNationalBenchmarks();
      assert.equal(b.knecExamCode, '233/3');
      assert.equal(b.maxScore, 40.0);
      assert.equal(b.nationalBaselinePercentage, 59.0);
      assert.equal(b.competencyBaselines.accuracy, 58);
      assert.equal(b.competencyBaselines.decimals, 72);
      assert.equal(b.competencyBaselines.averaging, 64);
      assert.equal(b.competencyBaselines.inorganic, 54);
      assert.equal(b.competencyBaselines.organic, 46);
      assert.equal(b.gradeCutoffs.length, 12);
      assert.equal(b.gradeCutoffs[0].grade, 'A');
      assert.equal(b.gradeCutoffs[0].points, 12);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 3. Dual-Role RBAC Authorization & Security
  // ──────────────────────────────────────────────────────────
  describe('Dual-Role Authorization (Teacher & Admin)', () => {
    const studentToken = makeToken({ id: 101, role: 'student', name: 'Baraza Juma' });
    const teacherToken = makeToken({ id: 201, role: 'teacher', name: 'Mrs. Chebet' });
    const adminToken = makeToken({ id: 301, role: 'admin', name: 'Dr. Kamau' });

    it('should reject unauthenticated access with 401', async () => {
      const endpoints = [
        '/api/composite/teacher',
        '/api/composite/teacher/summary',
        '/api/composite/benchmarks',
        '/api/composite/calibrate/1'
      ];
      for (const ep of endpoints) {
        const res = await fetch(url(ep));
        assert.equal(res.status, 401, `Endpoint ${ep} should require auth`);
      }
    });

    it('should reject student role on teacher/admin endpoints with 403', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/composite/teacher' },
        { method: 'GET', path: '/api/composite/teacher/summary' },
        { method: 'POST', path: '/api/composite/calibrate', body: JSON.stringify({ assignmentId: 1 }) },
        { method: 'POST', path: '/api/composite/sync-scores', body: JSON.stringify({ assignmentId: 1 }) },
        { method: 'GET', path: '/api/composite/export/1' }
      ];

      for (const ep of endpoints) {
        const res = await fetch(url(ep.path), {
          method: ep.method,
          headers: {
            'Authorization': `Bearer ${studentToken}`,
            'Content-Type': 'application/json'
          },
          body: ep.body
        });
        assert.equal(res.status, 403, `Endpoint ${ep.method} ${ep.path} should reject student role`);
      }
    });

    it('should allow both teacher and admin tokens past requireRole guard', () => {
      const guard = authMiddleware.requireRole(['teacher', 'admin']);
      let teacherNext = false;
      let adminNext = false;

      guard({ user: { id: 201, role: 'teacher' } }, {}, () => { teacherNext = true; });
      guard({ user: { id: 301, role: 'admin' } }, {}, () => { adminNext = true; });

      assert.equal(teacherNext, true, 'Teacher role should pass guard');
      assert.equal(adminNext, true, 'Admin role should pass guard');
    });

    it('should return 200 and benchmarks for authenticated teacher or admin', async () => {
      const resTeacher = await fetch(url('/api/composite/benchmarks'), {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
      });
      assert.equal(resTeacher.status, 200);
      const dataTeacher = await resTeacher.json();
      assert.ok(dataTeacher.benchmarks);
      assert.equal(dataTeacher.benchmarks.knecExamCode, '233/3');

      const resAdmin = await fetch(url('/api/composite/benchmarks'), {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      assert.equal(resAdmin.status, 200);
      const dataAdmin = await resAdmin.json();
      assert.ok(dataAdmin.benchmarks);
      assert.equal(dataAdmin.benchmarks.knecExamCode, '233/3');
    });
  });

  // ──────────────────────────────────────────────────────────
  // 4. Calibration Storage & Score Synchronization Logic
  // ──────────────────────────────────────────────────────────
  describe('Supervisor Titre Calibration & Cohort Recalculation', () => {
    it('should correctly format and save teacher calibration query', async () => {
      const origQuery = pool.query;
      let executedSql = '';
      let executedParams = [];

      pool.query = async (sql, params) => {
        executedSql = sql;
        executedParams = params;
        return {
          rows: [{
            id: 1,
            assignment_id: params[0],
            teacher_id: params[1],
            supervisor_titre: params[2],
            tolerance: params[3],
            true_cation: params[4],
            true_anion: params[5],
            true_functional_group: params[6],
            notes: params[7]
          }]
        };
      };

      try {
        const calib = await compositeRepo.saveCalibration(201, 'teacher', {
          assignmentId: 5,
          supervisorTitre: 21.60,
          tolerance: 0.10,
          trueCation: 'Al3+',
          trueAnion: 'SO4 2-',
          trueFunctionalGroup: 'Carboxylic Acid',
          notes: 'Standard morning titre'
        });

        assert.ok(executedSql.includes('INSERT INTO teacher_calibrations'));
        assert.ok(executedSql.includes('ON CONFLICT (assignment_id)'));
        assert.equal(calib.assignment_id, 5);
        assert.equal(calib.supervisor_titre, 21.60);
        assert.equal(calib.tolerance, 0.10);
        assert.equal(calib.true_cation, 'Al3+');
        assert.equal(calib.true_anion, 'SO4 2-');
        assert.equal(calib.true_functional_group, 'Carboxylic Acid');
      } finally {
        pool.query = origQuery;
      }
    });

    it('should synchronize candidate scores against supervisor titre calibration', async () => {
      const origQuery = pool.query;
      const updateQueries = [];

      pool.query = async (sql, params) => {
        if (sql.includes('SELECT * FROM teacher_calibrations')) {
          return {
            rows: [{
              assignment_id: 12,
              supervisor_titre: 22.00,
              tolerance: 0.20
            }]
          };
        }
        if (sql.includes('SELECT * FROM composite_sessions WHERE assignment_id = $1')) {
          return {
            rows: [
              {
                id: 501,
                student_id: 101,
                assignment_id: 12,
                q1_score: '8.00',
                q2_score: '12.00',
                q3_score: '8.00',
                total_score: '28.00',
                grade: 'B+',
                details: {
                  q1: {
                    tableScore: 3.0,
                    trials: [
                      { initial: 0.00, final: 22.00, used: 22.00, recorded: true },
                      { initial: 0.00, final: 22.05, used: 22.05, recorded: true },
                      { initial: 0.00, final: 22.00, used: 22.00, recorded: true }
                    ]
                  }
                }
              }
            ]
          };
        }
        if (sql.includes('UPDATE composite_sessions')) {
          updateQueries.push({ sql, params });
          return { rows: [] };
        }
        return { rows: [] };
      };

      try {
        const syncResult = await compositeRepo.syncCohortScores(12);
        assert.equal(syncResult.assignmentId, 12);
        assert.equal(syncResult.supervisorTitre, 22.00);
        assert.equal(syncResult.updatedCount, 1);
        assert.equal(updateQueries.length, 1);

        const update = updateQueries[0];
        const [newQ1, newTotal, newGrade, detailsJson, sessionId] = update.params;
        assert.equal(sessionId, 501);
        // Table 1 was evaluated to 5.0 marks, written was 8.0 - 3.0 = 5.0 => new Q1 = 10.0
        assert.equal(newQ1, 10.0);
        // new Total = 10.0 + 12.0 + 8.0 = 30.0
        assert.equal(newTotal, 30.0);
        // 30.0 / 40.0 = 75% => Grade A-
        assert.equal(newGrade, 'A-');
      } finally {
        pool.query = origQuery;
      }
    });
  });
});

// ============================================================
//  VirtuLab Kenya — Real-Time Laboratory Telemetry Test Suite
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_realtime_telemetry_key_7766';

const app = require('../index');
const pool = require('../db/pool');
const telemetryRepo = require('../repositories/telemetryRepo');
const authMiddleware = require('../middleware/auth');

let server;
let port = 0;

function url(subpath) {
  return `http://127.0.0.1:${port}${subpath}`;
}

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('Real-Time Laboratory Activity & Telemetry Monitor Suite', () => {
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
  // 1. Route Access & Authorization
  // ──────────────────────────────────────────────────────────
  describe('Telemetry Route Authentication & Role Guards', () => {
    const studentToken = makeToken({ id: 101, role: 'student', name: 'Wanjiku Mwangi' });
    const teacherToken = makeToken({ id: 201, role: 'teacher', name: 'Mwalimu Otieno' });
    const adminToken = makeToken({ id: 301, role: 'admin', name: 'Curriculum Director' });

    it('should reject unauthenticated requests with 401', async () => {
      const res = await fetch(url('/api/telemetry/live'));
      assert.equal(res.status, 401);
    });

    it('should reject student tokens on teacher live monitoring with 403', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/telemetry/live' },
        { method: 'POST', path: '/api/telemetry/intervene', body: JSON.stringify({ studentId: 101, message: 'Slow down' }) },
        { method: 'POST', path: '/api/telemetry/simulate-feed' }
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
        assert.equal(res.status, 403, `Endpoint ${ep.path} should reject student role`);
      }
    });

    it('should allow both teacher and admin tokens past requireRole guard', () => {
      const guard = authMiddleware.requireRole(['teacher', 'admin']);
      let teacherAllowed = false;
      let adminAllowed = false;
      let studentRejected = false;

      const reqTeacher = { user: { id: 201, role: 'teacher' } };
      const reqAdmin = { user: { id: 301, role: 'admin' } };
      const reqStudent = { user: { id: 101, role: 'student' } };

      const resMock = {
        status: (code) => {
          if (code === 403) studentRejected = true;
          return { json: () => {} };
        }
      };

      guard(reqTeacher, resMock, () => { teacherAllowed = true; });
      guard(reqAdmin, resMock, () => { adminAllowed = true; });
      guard(reqStudent, resMock, () => {});

      assert.equal(teacherAllowed, true);
      assert.equal(adminAllowed, true);
      assert.equal(studentRejected, true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 2. Repository Logic: Telemetry Heartbeats & State Tracking
  // ──────────────────────────────────────────────────────────
  describe('telemetryRepo: Heartbeat & Apparatus State Persistence', () => {
    it('should upsert apparatus state and return pending teacher interventions', async () => {
      const originalQuery = pool.query;
      let recordedHeartbeatSql = '';
      let recordedParams = [];

      pool.query = async (sql, params) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('SELECT teacher_id, school_id FROM students')) {
          return { rows: [{ teacher_id: 201, school_id: 5 }] };
        }
        if (sql.includes('INSERT INTO live_lab_telemetry')) {
          recordedHeartbeatSql = sql;
          recordedParams = params;
          return {
            rows: [{
              id: 1,
              student_id: params[0],
              practical_type: params[4],
              bench_name: params[5],
              apparatus_state: JSON.parse(params[6]),
              safety_alerts: JSON.parse(params[7]),
              status: params[8]
            }]
          };
        }
        if (sql.includes('FROM teacher_lab_interventions')) {
          return {
            rows: [{
              id: 42,
              teacher_id: 201,
              message: 'Slow down stopcock — add dropwise near endpoint!',
              intervention_type: 'guidance',
              created_at: new Date()
            }]
          };
        }
        if (sql.includes('UPDATE teacher_lab_interventions SET is_read = TRUE')) {
          return { rowCount: 1 };
        }
        return { rows: [] };
      };

      try {
        const result = await telemetryRepo.recordHeartbeat(101, {
          practicalType: 'titration',
          benchName: 'Bench 1: Burette Station',
          apparatusState: {
            buretteVolumeDispensed: 19.80,
            currentPH: 5.20,
            dropRateDps: 1.5,
            flaskColor: 'Faint pink'
          },
          safetyAlerts: [],
          status: 'active'
        });

        assert.ok(result.telemetry);
        assert.equal(result.telemetry.student_id, 101);
        assert.equal(result.telemetry.practical_type, 'titration');
        assert.equal(result.telemetry.apparatus_state.buretteVolumeDispensed, 19.80);
        assert.equal(result.interventions.length, 1);
        assert.equal(result.interventions[0].id, 42);
        assert.ok(result.interventions[0].message.includes('Slow down'));
      } finally {
        pool.query = originalQuery;
      }
    });

    it('should log high-severity safety alerts to lab_safety_incidents', async () => {
      const originalQuery = pool.query;
      let incidentLogged = false;

      pool.query = async (sql, params) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('SELECT teacher_id, school_id FROM students')) {
          return { rows: [{ teacher_id: 201, school_id: 5 }] };
        }
        if (sql.includes('INSERT INTO live_lab_telemetry')) {
          return { rows: [{ id: 1, student_id: params[0] }] };
        }
        if (sql.includes('INSERT INTO lab_safety_incidents')) {
          incidentLogged = true;
          return { rows: [{ id: 99 }] };
        }
        if (sql.includes('FROM teacher_lab_interventions')) {
          return { rows: [] };
        }
        return { rows: [] };
      };

      try {
        await telemetryRepo.recordHeartbeat(101, {
          practicalType: 'energy',
          benchName: 'Bench 4: Calorimeter Rig',
          apparatusState: { currentTempLive: 78.5, deltaT: 55.0 },
          safetyAlerts: [
            { code: 'THERMAL_RUNAWAY', severity: 'danger', title: 'Temperature Surge', message: 'Exceeded 75°C without cooling' }
          ]
        });

        assert.equal(incidentLogged, true, 'High severity danger alert must be logged to safety incidents');
      } finally {
        pool.query = originalQuery;
      }
    });
  });

  // ──────────────────────────────────────────────────────────
  // 3. Repository Logic: Live Stream Aggregation & Interventions
  // ──────────────────────────────────────────────────────────
  describe('telemetryRepo: Live Stream & Teacher Interventions', () => {
    it('should compute active benches, safety counts, and protocol compliance rate', async () => {
      const originalQuery = pool.query;

      const dummyBenches = [
        {
          id: 1,
          student_id: 101,
          student_name: 'Wanjiku Mwangi',
          form: 'Form 4',
          practical_type: 'titration',
          bench_name: 'Bench 1',
          effective_bench_name: 'Bench 1',
          apparatus_state: { buretteVolumeDispensed: 18.2 },
          safety_alerts: [],
          status: 'active',
          elapsed_seconds: 140
        },
        {
          id: 2,
          student_id: 102,
          student_name: 'Brian Koech',
          form: 'Form 4',
          practical_type: 'energy',
          bench_name: 'Bench 2',
          effective_bench_name: 'Bench 2',
          apparatus_state: { currentTempLive: 62.0 },
          safety_alerts: [{ severity: 'warning', title: 'Temp alert' }],
          status: 'active',
          elapsed_seconds: 220
        }
      ];

      pool.query = async (sql) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('FROM live_lab_telemetry')) {
          return { rows: dummyBenches };
        }
        if (sql.includes('FROM lab_safety_incidents')) {
          return { rows: [{ id: 1, title: 'Sample incident' }] };
        }
        return { rows: [] };
      };

      try {
        const live = await telemetryRepo.getLiveTelemetry(201, 'teacher');
        assert.equal(live.metrics.activeStudents, 2);
        assert.equal(live.metrics.activeBenches, 2);
        assert.equal(live.metrics.safetyAlertCount, 1);
        assert.equal(live.metrics.protocolCompliancePct, 50);
        assert.equal(live.benches.length, 2);
        assert.equal(live.recentIncidents.length, 1);
      } finally {
        pool.query = originalQuery;
      }
    });

    it('should record teacher interventions with delivery target', async () => {
      const originalQuery = pool.query;

      pool.query = async (sql, params) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('INSERT INTO teacher_lab_interventions')) {
          return {
            rows: [{
              id: 88,
              teacher_id: params[0],
              student_id: params[1],
              message: params[2],
              intervention_type: params[3],
              created_at: new Date()
            }]
          };
        }
        return { rows: [] };
      };

      try {
        const res = await telemetryRepo.createIntervention(201, {
          studentId: 101,
          message: 'Check your burette meniscus at eye level.',
          interventionType: 'guidance'
        });

        assert.equal(res.id, 88);
        assert.equal(res.student_id, 101);
        assert.equal(res.teacher_id, 201);
        assert.ok(res.message.includes('meniscus'));
      } finally {
        pool.query = originalQuery;
      }
    });
  });
});

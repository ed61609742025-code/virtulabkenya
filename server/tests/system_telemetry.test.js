// ============================================================
//  VirtuLab Kenya — System Telemetry & Cluster Diagnostics Tests
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_telemetry_key_9876';

const app = require('../index');
const pool = require('../db/pool');
const originalQuery = pool.query;

let server;
let port = 0;
let adminToken;
let studentToken;

function url(subpath) {
  return `http://127.0.0.1:${port}${subpath}`;
}

describe('VirtuLab Kenya — System Telemetry & Health Diagnostics Suite', () => {

  before(async () => {
    adminToken = jwt.sign(
      { id: 1, role: 'admin', adminRole: 'superadmin', email: 'admin@virtulab.ke', name: 'Super Admin' },
      process.env.JWT_SECRET
    );
    studentToken = jwt.sign(
      { id: 42, role: 'student', email: 'student42@virtulab.ke', name: 'Wanjiku Student' },
      process.env.JWT_SECRET
    );

    pool.query = async (text, params) => {
      const q = String(text || '');

      // Mock SELECT 1 ping
      if (q.includes('SELECT 1')) {
        return { rows: [{ '?column?': 1 }], rowCount: 1 };
      }

      // Mock Table entity counts
      if (q.includes('SELECT COUNT(*) FROM schools') || q.includes('countsRes')) {
        return {
          rows: [{
            schools: 12,
            teachers: 35,
            students: 450,
            sessions: 1280
          }],
          rowCount: 1
        };
      }

      // Mock pg_database_size & pg_stat_activity
      if (q.includes('pg_size_pretty') || q.includes('pg_stat_activity')) {
        return {
          rows: [{
            size_pretty: '34.2 MB',
            size_bytes: '35861299',
            active_backends: 4
          }],
          rowCount: 1
        };
      }

      // Mock push_subscriptions aggregation
      if (q.includes('FROM push_subscriptions')) {
        return {
          rows: [{
            total_subscriptions: 25,
            student_subs: 18,
            teacher_subs: 5,
            admin_subs: 2,
            active_last_24h: 14,
            active_last_7d: 22,
            android_devices: 16,
            ios_devices: 4,
            windows_desktops: 3,
            mac_desktops: 1
          }],
          rowCount: 1
        };
      }

      return { rows: [], rowCount: 0 };
    };

    server = http.createServer(app);
    await new Promise(resolve => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    pool.query = originalQuery;
    if (server && server.listening) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('1. GET /api/admin/system/health rejects unauthorized / non-admin requests', async () => {
    // No token
    const resNoAuth = await fetch(url('/api/admin/system/health'));
    assert.strictEqual(resNoAuth.status, 401, 'Unauthenticated request should return 401');

    // Student token
    const resStudent = await fetch(url('/api/admin/system/health'), {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(resStudent.status, 403, 'Student token should return 403 Forbidden');
  });

  it('2. GET /api/admin/system/health returns complete cluster diagnostics for admin', async () => {
    const res = await fetch(url('/api/admin/system/health'), {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200, 'Admin request should succeed with 200');

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.timestamp, 'Timestamp should be present');

    // Verify database telemetry
    assert.ok(data.database, 'database object required');
    assert.strictEqual(data.database.status, 'healthy');
    assert.ok(typeof data.database.latencyMs === 'number');
    assert.ok(data.database.provider);
    assert.strictEqual(data.database.sizePretty, '34.2 MB');
    assert.strictEqual(data.database.activeBackends, 4);

    // Verify connection pool metrics
    assert.ok(data.database.pool, 'pool metrics required');
    assert.ok(typeof data.database.pool.total === 'number');
    assert.ok(typeof data.database.pool.idle === 'number');
    assert.ok(typeof data.database.pool.active === 'number');
    assert.ok(typeof data.database.pool.waiting === 'number');
    assert.ok(typeof data.database.pool.max === 'number');
    assert.ok(typeof data.database.pool.saturationPct === 'number');

    // Verify entity counts
    assert.strictEqual(data.database.counts.schools, 12);
    assert.strictEqual(data.database.counts.teachers, 35);
    assert.strictEqual(data.database.counts.students, 450);
    assert.strictEqual(data.database.counts.sessions, 1280);

    // Verify server & node runtime telemetry
    assert.ok(data.server, 'server telemetry required');
    assert.ok(typeof data.server.uptimeSeconds === 'number');
    assert.ok(data.server.uptimeFormatted);
    assert.ok(data.server.nodeVersion);
    assert.ok(data.server.memory, 'memory stats required');
    assert.ok(data.server.memory.rss);
    assert.ok(data.server.memory.heapUsed);
    assert.ok(data.server.memory.heapTotal);
    assert.ok(data.server.memory.external);
    assert.ok(typeof data.server.memory.heapUtilizationPct === 'number');

    // Verify OS metrics
    assert.ok(data.server.os, 'os metrics required');
    assert.ok(data.server.os.platform);
    assert.ok(data.server.os.arch);
    assert.ok(typeof data.server.os.cpus === 'number');
    assert.ok(data.server.os.totalMem);
    assert.ok(data.server.os.freeMem);
    assert.ok(typeof data.server.os.memUtilizationPct === 'number');
    assert.ok(Array.isArray(data.server.os.loadAvg));

    // Verify Gemini AI config
    assert.ok(data.gemini);
    assert.ok(data.gemini.status);
    assert.ok(data.gemini.model);

    // Verify Web Push & VAPID telemetry
    assert.ok(data.vapid, 'vapid telemetry required');
    assert.strictEqual(data.vapid.protocol, 'Web Push (RFC 8292)');
    assert.ok(data.vapid.subscribers, 'subscribers telemetry required');
    assert.strictEqual(data.vapid.subscribers.totalSubscriptions, 25);
    assert.strictEqual(data.vapid.subscribers.students, 18);
    assert.strictEqual(data.vapid.subscribers.teachers, 5);
    assert.strictEqual(data.vapid.subscribers.admins, 2);
    assert.strictEqual(data.vapid.subscribers.activeLast24h, 14);
    assert.strictEqual(data.vapid.subscribers.activeLast7d, 22);

    // Verify Device breakdown
    assert.ok(data.vapid.subscribers.devices, 'device breakdown required');
    assert.strictEqual(data.vapid.subscribers.devices.android, 16);
    assert.strictEqual(data.vapid.subscribers.devices.ios, 4);
    assert.strictEqual(data.vapid.subscribers.devices.windows, 3);
    assert.strictEqual(data.vapid.subscribers.devices.mac, 1);
    assert.strictEqual(data.vapid.subscribers.devices.linuxOther, 1); // 25 - (16+4+3+1) = 1
  });

  it('3. GET /api/admin/system/health handles database query failure gracefully', async () => {
    // Force DB failure
    pool.query = async (text) => {
      const q = String(text || '');
      if (q.includes('SELECT 1')) {
        throw new Error('Connection timeout to PostgreSQL cluster');
      }
      return { rows: [], rowCount: 0 };
    };

    const res = await fetch(url('/api/admin/system/health'), {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200, 'Should return 200 even with degraded DB');
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.database.status, 'degraded');
  });

});

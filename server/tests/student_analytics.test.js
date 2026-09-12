// ============================================================
//  VirtuLab Kenya — Student Progress Analytics Test Suite
// ============================================================

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_analytics_verification_12345';

const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const analyticsRepo = require('../repositories/analyticsRepo');
const analyticsRouter = require('../routes/analytics');
const pool = require('../db/pool');

after(async () => {
  await pool.end().catch(() => {});
});

describe('1. Analytics Repository Exports & Structure', () => {
  it('should export getStudentAnalytics function', () => {
    assert.strictEqual(typeof analyticsRepo.getStudentAnalytics, 'function');
  });

  it('should export getClassAnalytics function', () => {
    assert.strictEqual(typeof analyticsRepo.getClassAnalytics, 'function');
  });
});

describe('2. Analytics Router Configuration', () => {
  it('should be an Express router with registered routes', () => {
    assert.ok(analyticsRouter);
    assert.strictEqual(typeof analyticsRouter, 'function');
    
    // Inspect router stack
    const routes = analyticsRouter.stack
      .filter(layer => layer.route)
      .map(layer => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      }));

    const paths = routes.map(r => r.path);
    assert.ok(paths.includes('/class'), 'Router should register /class');
    assert.ok(paths.includes('/mine'), 'Router should register /mine');
  });
});

describe('3. Student Analytics Safe Fallback & Schema Verification', () => {
  it('should return valid structured data even on unseeded or non-existent student IDs', async () => {
    // Calling with a dummy ID (e.g. 999999) triggers the query or safe fallback gracefully
    const result = await analyticsRepo.getStudentAnalytics(999999);
    
    assert.ok(result, 'Result should not be null or undefined');
    assert.ok(result.summary, 'Result should contain summary object');
    assert.strictEqual(typeof result.summary.totalSessions, 'number');
    assert.strictEqual(typeof result.summary.overallAccuracyPct, 'number');
    assert.strictEqual(typeof result.summary.weeklySessions, 'number');
    assert.ok(result.summary.topDiscipline, 'Summary should contain topDiscipline string');

    assert.ok(Array.isArray(result.accuracyOverTime), 'accuracyOverTime must be an array');
    assert.ok(Array.isArray(result.byType), 'byType must be an array');
    assert.ok(Array.isArray(result.weeklyVelocity), 'weeklyVelocity must be an array');
    assert.strictEqual(result.weeklyVelocity.length, 4, 'weeklyVelocity must have 4 weeks');
  });
});

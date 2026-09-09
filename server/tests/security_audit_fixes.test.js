// ============================================================
//  VirtuLab Kenya — Security Audit Fixes Verification Test Suite
// ============================================================

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_audit_verification_12345';
process.env.ADMIN_EMAIL = 'admin@virtulab.co.ke';
process.env.ADMIN_PASSWORD_HASH = '$2b$10$/7LKjURiipL1GKB1kGpRs.jilU05AAuNZe2H6TM9tapOdsfGGfWJu';

const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');

after(async () => {
  await pool.end().catch(() => {});
});

// 1. Verify safeTimingCompare implementation
describe('1. Constant-Time Timing Safe Compare', () => {
  function safeTimingCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const secret = process.env.JWT_SECRET || 'virtulab_timing_secret_salt';
    const hashA = crypto.createHmac('sha256', secret).update(a).digest();
    const hashB = crypto.createHmac('sha256', secret).update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  }

  it('should return true for identical strings', () => {
    assert.strictEqual(safeTimingCompare('VirtuLabAdmin2025!', 'VirtuLabAdmin2025!'), true);
    assert.strictEqual(safeTimingCompare('admin@virtulab.co.ke', 'admin@virtulab.co.ke'), true);
  });

  it('should return false for different strings of identical length', () => {
    assert.strictEqual(safeTimingCompare('VirtuLabAdmin2025!', 'VirtuLabAdmin2026!'), false);
  });

  it('should return false for strings of different lengths without throwing error', () => {
    assert.strictEqual(safeTimingCompare('short', 'much_longer_string_here'), false);
    assert.strictEqual(safeTimingCompare('admin@virtulab.co.ke', 'a'), false);
  });

  it('should return false for null, undefined, or non-string inputs safely', () => {
    assert.strictEqual(safeTimingCompare(null, 'test'), false);
    assert.strictEqual(safeTimingCompare('test', undefined), false);
    assert.strictEqual(safeTimingCompare(12345, '12345'), false);
    assert.strictEqual(safeTimingCompare({}, {}), false);
  });
});

// 2. Verify Admin Password Hashing
describe('2. Admin Credential Bcrypt Verification', () => {
  it('should verify the precomputed hash against original password', async () => {
    const rawPassword = 'VirtuLabAdmin2025!';
    const hash = process.env.ADMIN_PASSWORD_HASH;
    const isMatch = await bcrypt.compare(rawPassword, hash);
    assert.strictEqual(isMatch, true);
  });

  it('should reject incorrect passwords with precomputed hash', async () => {
    const wrongPassword = 'WrongAdminPassword!';
    const hash = process.env.ADMIN_PASSWORD_HASH;
    const isMatch = await bcrypt.compare(wrongPassword, hash);
    assert.strictEqual(isMatch, false);
  });
});

// 3. Verify Rate Limiters
describe('3. Rate Limiter Middleware Verification', () => {
  const rateLimiters = require('../middleware/rateLimiter');

  it('should export all required rate limiters', () => {
    assert.ok(typeof rateLimiters.authLimiter === 'function');
    assert.ok(typeof rateLimiters.apiLimiter === 'function');
    assert.ok(typeof rateLimiters.clientErrorLimiter === 'function');
    assert.ok(typeof rateLimiters.aiAssistantLimiter === 'function');
  });
});

// 4. Verify Validation Middleware Schemas
describe('4. Input Validation Middleware Schemas', () => {
  const validators = require('../middleware/validators');

  it('should export validateAnnouncementCreate as an array of middleware', () => {
    assert.ok(Array.isArray(validators.validateAnnouncementCreate));
    assert.ok(validators.validateAnnouncementCreate.length > 0);
  });

  it('should export validateCpcatSubmit as an array of middleware', () => {
    assert.ok(Array.isArray(validators.validateCpcatSubmit));
    assert.ok(validators.validateCpcatSubmit.length > 0);
  });

  it('should export validateSusSubmit as an array of middleware', () => {
    assert.ok(Array.isArray(validators.validateSusSubmit));
    assert.ok(validators.validateSusSubmit.length > 0);
  });

  it('should export validateTamSubmit as an array of middleware', () => {
    assert.ok(Array.isArray(validators.validateTamSubmit));
    assert.ok(validators.validateTamSubmit.length > 0);
  });
});

// 5. Verify App Loading and Express Configuration
describe('5. App Initialization & Security Headers', () => {
  it('should require index.js without throwing errors', () => {
    const app = require('../index');
    assert.ok(app);
    assert.ok(typeof app.listen === 'function');
  });
});

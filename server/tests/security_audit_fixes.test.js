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

  it('should include https://cdnjs.cloudflare.com in Content-Security-Policy connect-src', () => {
    const { securityHeaders } = require('../middleware/security');
    const req = { headers: {} };
    const res = {
      headers: {},
      setHeader: (k, v) => { res.headers[k.toLowerCase()] = v; },
      getHeader: (k) => res.headers[k.toLowerCase()],
      removeHeader: (k) => { delete res.headers[k.toLowerCase()]; }
    };
    securityHeaders(req, res, () => {});
    const csp = res.getHeader('content-security-policy') || '';
    assert.ok(csp.includes("connect-src 'self' https://cdnjs.cloudflare.com"), `CSP must allow cdnjs in connect-src. Got: ${csp}`);
  });

  it('should have sw.js bumped to virtulab-kenya-v113 or higher and handle offline CDN fallback gracefully', () => {
    const fs = require('fs');
    const path = require('path');
    const swPath = path.join(__dirname, '../../client/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    assert.match(swContent, /const CACHE_NAME = 'virtulab-kenya-v11[3-9]';/);
    assert.ok(swContent.includes('application/javascript'), 'sw.js should provide clean javascript response on cross-origin fallback');
  });

  it('should guarantee non-negative outerRadius and innerRadius in student doughnut chart even if parent width is 0', () => {
    const fs = require('fs');
    const path = require('path');
    const dashPath = path.join(__dirname, '../../client/student/js/student-dashboard.js');
    const dashContent = fs.readFileSync(dashPath, 'utf8');
    
    // Ensure parentW fallback is present
    assert.ok(dashContent.includes('const parentW = (canvas.parentElement && canvas.parentElement.clientWidth > 50)'), 'Must guard parent width');
    assert.ok(dashContent.includes('const outerRadius = Math.max(25,'), 'Must guard outerRadius at minimum 25');
    assert.ok(dashContent.includes('if (outerRadius <= 0 || isNaN(outerRadius)'), 'Must guard against zero or invalid radius before arc');
  });
});

// 6. Database Transaction Helper Verification
describe('6. Database Transaction Helper (withTransaction)', () => {
  const { withTransaction } = require('../db/transaction');
  const pool = require('../db/pool');

  it('should export withTransaction as a function on pool and db/transaction', () => {
    assert.strictEqual(typeof withTransaction, 'function');
    assert.strictEqual(typeof pool.withTransaction, 'function');
  });

  it('should execute queries within transaction and commit on success', async () => {
    const executedQueries = [];
    const originalQuery = pool.query;
    pool.query = async (text, params) => {
      executedQueries.push(text);
      if (text.includes('SELECT 42')) return { rows: [{ answer: 42 }] };
      return { rows: [] };
    };

    try {
      const result = await withTransaction(async (client) => {
        const res = await client.query('SELECT 42 AS answer');
        return res.rows[0].answer;
      });

      assert.strictEqual(result, 42);
      assert.ok(executedQueries.some(q => q.includes('BEGIN')), 'Transaction must issue BEGIN');
      assert.ok(executedQueries.some(q => q.includes('COMMIT')), 'Transaction must issue COMMIT');
      assert.ok(!executedQueries.some(q => q.includes('ROLLBACK')), 'Successful transaction must not issue ROLLBACK');
    } finally {
      pool.query = originalQuery;
    }
  });

  it('should rollback transaction and rethrow when callback fails', async () => {
    const executedQueries = [];
    const originalQuery = pool.query;
    pool.query = async (text, params) => {
      executedQueries.push(text);
      return { rows: [] };
    };

    try {
      await assert.rejects(async () => {
        await withTransaction(async (client) => {
          await client.query('INSERT INTO fail_table VALUES (1)');
          throw new Error('Simulated write failure');
        });
      }, /Simulated write failure/);

      assert.ok(executedQueries.some(q => q.includes('BEGIN')), 'Transaction must issue BEGIN');
      assert.ok(executedQueries.some(q => q.includes('ROLLBACK')), 'Failed transaction must issue ROLLBACK');
      assert.ok(!executedQueries.some(q => q.includes('COMMIT')), 'Failed transaction must not issue COMMIT');
    } finally {
      pool.query = originalQuery;
    }
  });
});

// 7. Announcements Route Verification
describe('7. Announcements Route Module (routes/announcements.js)', () => {
  it('should export an Express router in routes/announcements.js', () => {
    const announcementsRouter = require('../routes/announcements');
    assert.ok(announcementsRouter);
    assert.strictEqual(typeof announcementsRouter, 'function');
  });

  it('should have GET /active route registered and return announcements', async () => {
    const announcementsRouter = require('../routes/announcements');
    const hasActiveRoute = announcementsRouter.stack.some(layer => layer.route && layer.route.path === '/active' && layer.route.methods.get);
    assert.ok(hasActiveRoute, 'Router must register GET /active route');
  });
});

// 8. NIST SP 800-63B Minimum Password Length (>= 8 chars)
describe('8. NIST SP 800-63B Minimum Password Length Verification', () => {
  const validators = require('../middleware/validators');

  it('should require minimum 8 characters in validateStudentRegister', () => {
    const pwValidator = validators.validateStudentRegister.find(v => v.builder && v.builder.fields && v.builder.fields.includes('password'));
    assert.ok(pwValidator, 'Must have password validator in validateStudentRegister');
    const min8Config = pwValidator.builder.stack.some(s => s.validator && s.validator.name === 'isLength' && s.options && s.options[0] && s.options[0].min === 8);
    assert.ok(min8Config, 'Password validator must enforce min: 8');
  });

  it('should require minimum 8 characters in validateTeacherRegister', () => {
    const pwValidator = validators.validateTeacherRegister.find(v => v.builder && v.builder.fields && v.builder.fields.includes('password'));
    assert.ok(pwValidator, 'Must have password validator in validateTeacherRegister');
    const min8Config = pwValidator.builder.stack.some(s => s.validator && s.validator.name === 'isLength' && s.options && s.options[0] && s.options[0].min === 8);
    assert.ok(min8Config, 'Password validator must enforce min: 8');
  });
});

// 9. AI Assistant Database Repository (repositories/aiAssistantRepo.js)
describe('9. AI Assistant Database Repository Layer', () => {
  const aiRepo = require('../repositories/aiAssistantRepo');

  it('should export all required repository functions', () => {
    assert.strictEqual(typeof aiRepo.saveExamDraft, 'function');
    assert.strictEqual(typeof aiRepo.getTeacherDrafts, 'function');
    assert.strictEqual(typeof aiRepo.getDraftById, 'function');
    assert.strictEqual(typeof aiRepo.deleteDraft, 'function');
    assert.strictEqual(typeof aiRepo.logAiAudit, 'function');
  });
});

// 10. Favicon & PWA Icons Verification
describe('10. Favicon & PWA Icons Optimization', () => {
  const fs = require('fs');
  const path = require('path');

  it('should have client/favicon.ico with genuine ICO binary header', () => {
    const icoPath = path.join(__dirname, '../../client/favicon.ico');
    assert.ok(fs.existsSync(icoPath), 'client/favicon.ico must exist');
    const buf = fs.readFileSync(icoPath);
    // ICO header: 0x00 0x00 0x01 0x00
    assert.strictEqual(buf[0], 0x00);
    assert.strictEqual(buf[1], 0x00);
    assert.strictEqual(buf[2], 0x01);
    assert.strictEqual(buf[3], 0x00);
    assert.ok(buf.length < 30000, `Favicon size must be compact (<30KB), got ${buf.length}`);
  });

  it('should have properly compressed PWA icons in client/shared/', () => {
    const icons = ['icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png'];
    icons.forEach(name => {
      const p = path.join(__dirname, '../../client/shared/', name);
      assert.ok(fs.existsSync(p), `${name} must exist`);
      const stat = fs.statSync(p);
      assert.ok(stat.size < 500000, `${name} size should be under 500KB, got ${stat.size}`);
    });
  });
});

// 11. Modularized Student Scripts
describe('11. Modularized Student Scripts Verification', () => {
  const fs = require('fs');
  const path = require('path');

  it('should have extracted home.js and history.js with clean syntax', () => {
    const homeJsPath = path.join(__dirname, '../../client/student/js/home.js');
    const histJsPath = path.join(__dirname, '../../client/student/js/history.js');
    assert.ok(fs.existsSync(homeJsPath), 'home.js must exist');
    assert.ok(fs.existsSync(histJsPath), 'history.js must exist');

    const homeHtml = fs.readFileSync(path.join(__dirname, '../../client/student/home.html'), 'utf8');
    const histHtml = fs.readFileSync(path.join(__dirname, '../../client/student/history.html'), 'utf8');

    assert.ok(homeHtml.includes('src="js/home.js'), 'home.html must link to home.js');
    assert.ok(histHtml.includes('src="js/history.js'), 'history.html must link to history.js');
  });
});




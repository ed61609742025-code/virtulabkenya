// ============================================================
//  VirtuLab Kenya — Student Google Authentication Test Suite
// ============================================================

process.env.NODE_ENV = 'test';

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../index');
const pool = require('../db/pool');

let server;
let port = 0;

function url(p) {
  return `http://127.0.0.1:${port}${p}`;
}

// Generates a mock JWT payload for test authentication
function createMockGoogleCredential(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'test_signature';
  return `${header}.${body}.${signature}`;
}

describe('Student Google Authentication (OAuth2 / GIS)', () => {
  before(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_google_test';
    server = http.createServer(app);
    await new Promise(resolve => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  const originalQuery = pool.query;

  beforeEach(() => {
    pool.query = originalQuery;
  });

  after(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('GET /api/auth/config — should return public client auth config', async () => {
    const res = await fetch(url('/api/auth/config'));
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok('googleClientId' in body);
  });

  it('POST /api/auth/student/google — should return 400 when credential is missing', async () => {
    const res = await fetch(url('/api/auth/student/google'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'Google credential token is required.');
  });

  it('POST /api/auth/student/google — should log in existing student by Google ID or Email', async () => {
    const credential = createMockGoogleCredential({
      email: 'student.amina@school.ac.ke',
      name: 'Amina Hassan',
      sub: 'google_123456789'
    });

    pool.query = async (text, params) => {
      if (text.includes('FROM students s')) {
        return {
          rows: [{
            id: 1,
            name: 'Amina Hassan',
            email: 'student.amina@school.ac.ke',
            form: 'Form 4',
            school_id: 10,
            school_name: 'Alliance High School',
            school_code: 'KCS-ALLIANCE-001',
            status: 'active',
            google_id: 'google_123456789'
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/auth/student/google'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.token);
    assert.strictEqual(body.user.email, 'student.amina@school.ac.ke');
    assert.strictEqual(body.user.role, 'student');
  });

  it('POST /api/auth/student/google — should prompt for profile completion when student is new', async () => {
    const credential = createMockGoogleCredential({
      email: 'new.learner@school.ac.ke',
      name: 'Brian Omondi',
      sub: 'google_987654321'
    });

    pool.query = async () => ({ rows: [] });

    const res = await fetch(url('/api/auth/student/google'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.needsProfileCompletion, true);
    assert.strictEqual(body.email, 'new.learner@school.ac.ke');
    assert.strictEqual(body.name, 'Brian Omondi');
  });

  it('POST /api/auth/student/google — should complete registration for new student with schoolCode and form', async () => {
    const credential = createMockGoogleCredential({
      email: 'new.learner@school.ac.ke',
      name: 'Brian Omondi',
      sub: 'google_987654321'
    });

    pool.query = async (text, params) => {
      if (text.includes('FROM students s')) {
        return { rows: [] }; // not found yet
      }
      if (text.includes('SELECT id, name, admin_code FROM schools')) {
        return { rows: [{ id: 10, name: 'Alliance High School', admin_code: 'KCS-ALLIANCE-001' }] };
      }
      if (text.includes('INSERT INTO students')) {
        return {
          rows: [{
            id: 25,
            name: 'Brian Omondi',
            email: 'new.learner@school.ac.ke',
            form: 'Form 3'
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/auth/student/google'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential,
        form: 'Form 3',
        schoolCode: 'KCS-ALLIANCE-001'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.token);
    assert.strictEqual(body.user.name, 'Brian Omondi');
    assert.strictEqual(body.user.schoolName, 'Alliance High School');
  });
});

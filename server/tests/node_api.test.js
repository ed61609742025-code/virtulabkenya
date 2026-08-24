// ============================================================
//  VirtuLab Kenya — Zero-Dependency Native API Test Suite
// ============================================================

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

const pool = require('../db/pool');
const originalQuery = pool.query;
const app = require('../index');

let server;
let port = 0;
let studentToken;
let teacherToken;
let adminToken;

function url(path) {
  return `http://127.0.0.1:${port}${path}`;
}

describe('VirtuLab Kenya — Backend API Test Suite', () => {

  before(async () => {
    process.env.JWT_SECRET = 'test_secret_key_12345';
    process.env.ADMIN_EMAIL = 'admin@virtulab.co.ke';
    process.env.ADMIN_PASSWORD = 'VirtuLabAdmin2025!';

    studentToken = jwt.sign({ id: 1, role: 'student', name: 'Test Student', email: 'student@example.com' }, process.env.JWT_SECRET);
    teacherToken = jwt.sign({ id: 1, role: 'teacher', name: 'Test Teacher', email: 'teacher@example.com' }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ id: 0, role: 'admin', name: 'System Administrator', email: 'admin@virtulab.co.ke' }, process.env.JWT_SECRET);

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end().catch(() => {});
    setTimeout(() => process.exit(0), 200).unref();
  });

  beforeEach(() => {
    pool.query = originalQuery;
  });

  /* 1. HEALTH CHECK ENDPOINT */
  it('GET /api/health — should return 200 OK with server project metadata', async () => {
    const res = await fetch(url('/api/health'));
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.project, 'VirtuLab Kenya');
    assert.strictEqual(body.version, '1.0.0');
  });

  /* 2. AUTHENTICATION ENDPOINTS */
  it('POST /api/auth/student/register — should return 400 if required fields missing', async () => {
    const res = await fetch(url('/api/auth/student/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Student' })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.error, 'All fields are required.');
  });

  it('POST /api/auth/student/register — should return 400 if password < 6 chars', async () => {
    const res = await fetch(url('/api/auth/student/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Student One',
        email: 'student@example.com',
        password: '123',
        form: 'Form 3',
        schoolCode: 'SCH001'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.error, 'Password must be at least 6 characters.');
  });

  it('POST /api/auth/student/register — should return 400 if school code invalid', async () => {
    pool.query = async () => ({ rows: [] });

    const res = await fetch(url('/api/auth/student/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Student One',
        email: 'student@example.com',
        password: 'password123',
        form: 'Form 3',
        schoolCode: 'INVALID_CODE'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.error, 'Invalid school registration code.');
  });

  it('POST /api/auth/student/login — should return 400 if credentials missing', async () => {
    const res = await fetch(url('/api/auth/student/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com' })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.error, 'Email and password are required.');
  });

  it('POST /api/auth/student/login — should return 401 if credentials incorrect', async () => {
    pool.query = async () => ({ rows: [] });

    const res = await fetch(url('/api/auth/student/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.error, 'Invalid email or password.');
  });

  it('POST /api/auth/student/login — should return 403 if student account is suspended', async () => {
    pool.query = async () => ({
      rows: [{
        id: 99,
        name: 'Suspended Student',
        email: 'suspended@example.com',
        password_hash: '$2b$10$xyz',
        status: 'suspended'
      }]
    });

    const res = await fetch(url('/api/auth/student/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'suspended@example.com',
        password: 'password123'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.error, 'Your account is suspended. Please contact your school administrator.');
  });

  it('POST /api/auth/teacher/login — should return 403 if teacher account is suspended', async () => {
    pool.query = async () => ({
      rows: [{
        id: 98,
        name: 'Suspended Teacher',
        email: 'suspended.teacher@example.com',
        password_hash: '$2b$10$xyz',
        status: 'suspended'
      }]
    });

    const res = await fetch(url('/api/auth/teacher/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'suspended.teacher@example.com',
        password: 'password123'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.error, 'Your account is suspended. Please contact the platform administrator.');
  });

  it('POST /api/auth/teacher/login — should return 400 if payload empty', async () => {
    const res = await fetch(url('/api/auth/teacher/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.error, 'Email and password are required.');
  });

  it('POST /api/auth/teacher/register — should return 400 if required fields missing', async () => {
    const res = await fetch(url('/api/auth/teacher/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Teacher One' })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.error, 'All fields are required.');
  });

  it('POST /api/auth/teacher/register — should return 400 if school code invalid', async () => {
    pool.query = async () => ({ rows: [] }); // mock invalid school

    const res = await fetch(url('/api/auth/teacher/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Teacher One',
        email: 'teacher@example.com',
        password: 'password123',
        schoolCode: 'INVALID_CODE'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.error, 'Invalid school registration code.');
  });

  it('POST /api/auth/admin/login — should return token on valid admin credentials', async () => {
    const res = await fetch(url('/api/auth/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@virtulab.co.ke',
        password: 'VirtuLabAdmin2025!'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(body.token);
    assert.strictEqual(body.user.role, 'admin');
    assert.strictEqual(body.user.email, 'admin@virtulab.co.ke');
  });

  it('POST /api/auth/admin/login — should return 401 on invalid admin password', async () => {
    const res = await fetch(url('/api/auth/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@virtulab.co.ke',
        password: 'WrongPassword999!'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.error, 'Invalid admin credentials.');
  });

  it('POST /api/auth/admin/login — should verify against ADMIN_PASSWORD_HASH when set', async () => {
    const bcrypt = require('bcrypt');
    const prevHash = process.env.ADMIN_PASSWORD_HASH;
    const prevPass = process.env.ADMIN_PASSWORD;

    delete process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('CustomHashedPass2026!', 10);

    try {
      const res = await fetch(url('/api/auth/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@virtulab.co.ke',
          password: 'CustomHashedPass2026!'
        })
      });
      const body = await res.json();

      assert.strictEqual(res.status, 200);
      assert.ok(body.token);
      assert.strictEqual(body.user.role, 'admin');
    } finally {
      process.env.ADMIN_PASSWORD = prevPass;
      if (prevHash) process.env.ADMIN_PASSWORD_HASH = prevHash;
      else delete process.env.ADMIN_PASSWORD_HASH;
    }
  });

  it('GET /api/students/:id/drilldown — should return student performance drilldown for teacher', async () => {
    const token = jwt.sign({ id: 1, role: 'teacher' }, process.env.JWT_SECRET);

    pool.query = async (text) => {
      if (text.includes('FROM students WHERE id =')) {
        return { rows: [{ id: 10, name: 'Sample Student', email: 'student@school.ac.ke', form: 'Form 4' }] };
      }
      if (text.includes('FROM practical_sessions')) {
        return { rows: [{ titration_type: 'acidBase', correct: true, duration_seconds: 120, created_at: new Date().toISOString() }] };
      }
      if (text.includes('FROM qualitative_sessions')) {
        return { rows: [{ salt_key: 'saltA', salt_name: 'Hydrated Copper Sulfate', student_cation: 'Cu2+', student_anion: 'SO4^2-', correct: true, created_at: new Date().toISOString() }] };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/students/10/drilldown'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.student.name, 'Sample Student');
    assert.strictEqual(body.metrics.totalSessions, 2);
    assert.strictEqual(body.metrics.overallAccuracy, 100);
    assert.strictEqual(body.titrationSessions.length, 1);
    assert.strictEqual(body.qualitativeSessions.length, 1);
  });

  /* 3. PROTECTED SESSIONS ENDPOINTS */
  it('GET /api/sessions/mine — should return 401 Unauthorized without Bearer token', async () => {
    const res = await fetch(url('/api/sessions/mine'));
    const body = await res.json();

    assert.strictEqual(res.status, 401);
    assert.ok(body.error);
  });

  it('GET /api/sessions/mine — should return sessions with valid JWT', async () => {
    const token = jwt.sign({ id: 1, role: 'student', form: 'Form 4' }, process.env.JWT_SECRET);

    let callCount = 0;
    pool.query = async () => {
      callCount++;
      if (callCount === 1) return { rows: [{ count: '2' }] };
      return {
        rows: [
          { id: 101, titration_type: 'acidBase', is_concordant: true, student_conc: 0.1 },
          { id: 102, titration_type: 'redox', is_concordant: false, student_conc: 0.25 }
        ]
      };
    };

    const res = await fetch(url('/api/sessions/mine'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(body.sessions));
    assert.strictEqual(body.sessions.length, 2);
    assert.strictEqual(body.pagination.totalCount, 2);
  });

  it('POST /api/sessions — should save a lab session for authenticated student', async () => {
    const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);

    pool.query = async () => {
      return { rows: [{ id: 501, titration_type: 'acidBase' }] };
    };

    const res = await fetch(url('/api/sessions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        titrationKey: 'acidBase',
        titrationTitle: 'Standard Acid-Base Titration',
        indicatorLabel: 'Phenolphthalein',
        isSuitable: true,
        trueConc: 0.1,
        studentAnswer: 0.1,
        correct: true,
        trialsCount: 3,
        concordantFound: true,
        trialReadings: [12.5, 12.5, 12.5],
        mode: 'selfPaced',
        durationSeconds: 180
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.ok(body.session);
  });

  /* 4. ASSIGNMENTS ENDPOINTS */
  it('GET /api/assignments/mine — should return student assignments', async () => {
    const token = jwt.sign({ id: 1, role: 'student', teacher_id: 2 }, process.env.JWT_SECRET);

    pool.query = async () => ({
      rows: [{ id: 10, title: 'Acid-Base Assignment 1', submitted: false }]
    });

    const res = await fetch(url('/api/assignments/mine'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(body.assignments));
    assert.strictEqual(body.assignments.length, 1);
  });

  it('GET /api/assignments/submissions/all — should return teacher assignment submissions list', async () => {
    pool.query = async (text) => {
      if (text.includes('SELECT COUNT')) return { rows: [{ count: '1' }] };
      return {
        rows: [{
          sub_key: '10_1',
          submission_id: 101,
          assignment_id: 10,
          student_id: 1,
          submission_status: 'submitted',
          student_name: 'Jane Doe',
          assignment_title: 'Titration Lab 1'
        }]
      };
    };

    const res = await fetch(url('/api/assignments/submissions/all'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(body.submissions));
    assert.strictEqual(body.submissions.length, 1);
    assert.strictEqual(body.total, 1);
  });

  it('POST /api/assignments/submissions/:id/mark — should mark submission by submission ID', async () => {
    pool.query = async (text) => {
      if (text.includes('UPDATE assignment_submissions')) {
        return { rows: [{ id: 101, status: 'marked', teacher_feedback: 'Excellent titration curve!' }] };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/assignments/submissions/101/mark'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({ teacherFeedback: 'Excellent titration curve!' })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.submission.status, 'marked');
    assert.strictEqual(body.submission.teacher_feedback, 'Excellent titration curve!');
  });

  it('POST /api/assignments/submissions/:id/mark — should mark submission by session fallback', async () => {
    pool.query = async (text) => {
      if (text.includes('SELECT assignment_id, student_id FROM practical_sessions')) {
        return { rows: [{ assignment_id: 10, student_id: 1 }] };
      }
      if (text.includes('INSERT INTO assignment_submissions')) {
        return { rows: [{ id: 105, assignment_id: 10, student_id: 1, status: 'marked', teacher_feedback: 'Well done' }] };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/assignments/submissions/501/mark'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({ teacherFeedback: 'Well done' })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.submission.status, 'marked');
  });

  /* 5. QUALITATIVE & ORGANIC ANALYSIS ENDPOINTS */
  it('POST /api/qualitative — should compute correctness from server salts registry', async () => {
    let savedRow = null;
    pool.query = async (text, params) => {
      savedRow = { id: 201, salt_name: 'Copper(II) Sulfate', correct: params[13] };
      return { rows: [savedRow] };
    };

    const res = await fetch(url('/api/qualitative'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        saltKey: 'copperSulfate',
        studentCation: 'Cu2+',
        studentAnion: 'SO4^2-',
        testsPerformed: 6,
        testsCorrect: 6,
        observations: []
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.ok(body.session);
    assert.strictEqual(body.session.correct, true);
  });

  it('POST /api/qualitative — should reject forged true values and score correctly on server', async () => {
    let savedRow = null;
    pool.query = async (text, params) => {
      savedRow = { id: 202, salt_name: 'Ammonium Chloride', correct: params[13] };
      return { rows: [savedRow] };
    };

    // Client falsely claims Pb2+ is correct for ammoniumChloride
    const res = await fetch(url('/api/qualitative'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        saltKey: 'ammoniumChloride',
        trueCation: 'Pb2+',
        studentCation: 'Pb2+',
        trueAnion: 'Cl-',
        studentAnion: 'Cl-'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.ok(body.session);
    // Server must detect that ammoniumChloride is NH4+, so student answer Pb2+ is incorrect!
    assert.strictEqual(body.session.correct, false);
  });

  it('POST /api/organic — should save organic chemistry functional group session with server validation', async () => {
    let savedRow = null;
    pool.query = async (text, params) => {
      savedRow = { id: 301, compound_name: 'Hex-1-ene (C₆H₁₂)', overall_correct: true };
      return { rows: [savedRow] };
    };

    const res = await fetch(url('/api/organic'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        compound_key: 'org_alkene',
        student_functional_group: 'Alkene',
        tests_performed: 5,
        tests_correct: 5,
        observations: []
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.ok(body.session);
  });

  it('POST /api/solubility — should compute KNEC accuracy and graph score on server', async () => {
    let savedRow = null;
    pool.query = async (text, params) => {
      savedRow = {
        id: 401,
        solute_key: 'KNO3',
        solute_name: 'Potassium Nitrate (KNO₃)',
        solute_mass: 5.0,
        solvent_volume: 10.0,
        crystallization_temp: 35.0,
        theoretical_temp: 35.0,
        temp_difference: 0.0,
        accuracy_score: 2.0,
        graph_score: 3.0,
        total_score: 5.0
      };
      return { rows: [savedRow] };
    };

    const res = await fetch(url('/api/solubility'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        solute_key: 'KNO3',
        solute_mass: 5.0,
        solvent_volume: 10.0,
        crystallization_temp: 35.0,
        graph_score: 3.0,
        trials_data: [{ mass: 5.0, volume: 10.0, temp: 35.0 }]
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.ok(body.session);
    assert.strictEqual(body.analysis.solubility100g, 50.0);
    assert.strictEqual(body.analysis.accuracyScore, 2.0);
    assert.strictEqual(body.analysis.totalScore, 5.0);
  });

  it('GET /api/solubility/mine — should return student solubility practical history', async () => {
    pool.query = async () => ({
      rows: [{ id: 401, solute_key: 'KNO3', solute_name: 'Potassium Nitrate (KNO₃)', total_score: 5.0 }]
    });

    const res = await fetch(url('/api/solubility/mine'), {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.sessions));
    assert.strictEqual(body.sessions.length, 1);
  });

  /* REACTION RATES & CHEMICAL KINETICS ENDPOINTS */
  it('POST /api/rates — should save Reaction Rates practical session and compute totals & grade', async () => {
    let savedRow = null;
    pool.query = async (text, params) => {
      savedRow = {
        id: 501,
        student_id: 1,
        experiment_type: 'cross',
        experiment_title: 'Reaction Rates: CROSS',
        table_score: 5.0,
        graph_score: 4.0,
        calc_score: 5.5,
        total_score: 14.5,
        grade: 'A'
      };
      return { rows: [savedRow] };
    };

    const res = await fetch(url('/api/rates'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        experiment_type: 'cross',
        experiment_title: 'Reaction Rates: Disappearing Cross',
        dilution_readings: [
          { volThio: 50, volWater: 0, volAcid: 5, time: 20.5, rate: 0.0488 },
          { volThio: 40, volWater: 10, volAcid: 5, time: 25.6, rate: 0.0391 }
        ],
        table_score: 5.0,
        graph_score: 4.0,
        calc_score: 5.5,
        total_score: 14.5,
        answers: {
          time35: '29.2s',
          collision: 'Higher concentration increases frequency of effective collisions per unit time',
          ionic: 'S2O3 2- + 2H+ -> S + SO2 + H2O',
          maxBoltz: 'Peak shifts to the right and flattens'
        }
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.ok(body.session);
    assert.strictEqual(body.analysis.tableScore, 5.0);
    assert.strictEqual(body.analysis.graphScore, 4.0);
    assert.strictEqual(body.analysis.calcScore, 5.5);
    assert.strictEqual(body.analysis.totalScore, 14.5);
    assert.strictEqual(body.analysis.grade, 'A');
  });

  it('GET /api/rates/mine — should return student reaction rates practical history', async () => {
    pool.query = async () => ({
      rows: [{ id: 501, experiment_type: 'cross', total_score: 14.5, grade: 'A' }]
    });

    const res = await fetch(url('/api/rates/mine'), {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.sessions));
    assert.strictEqual(body.sessions.length, 1);
  });

  it('GET /api/rates/class — should allow teacher to fetch all class reaction rates sessions', async () => {
    pool.query = async () => ({
      rows: [
        { id: 501, student_id: 1, student_name: 'Grace Hopper', experiment_type: 'cross', total_score: 14.5, grade: 'A' }
      ]
    });

    const res = await fetch(url('/api/rates/class'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.sessions));
    assert.strictEqual(body.sessions[0].student_name, 'Grace Hopper');
  });

  it('GET /api/rates/class — should return 403 Forbidden if accessed by student', async () => {
    const res = await fetch(url('/api/rates/class'), {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.error, 'Access forbidden. Teachers only.');
  });

  /* 6. ROUTE 404 HANDLER */
  it('GET /api/unknown-endpoint — should return 404', async () => {
    const res = await fetch(url('/api/unknown-endpoint'));
    const body = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(body.error, 'Endpoint not found');
  });

  /* 7. ERROR TRACKING ENDPOINTS */
  it('POST /api/errors/client — should log client-side exception telemetry', async () => {
    const res = await fetch(url('/api/errors/client'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Uncaught TypeError: Cannot read properties of undefined',
        stack: 'TypeError: Cannot read properties of undefined\n at lab.html:120',
        url: 'http://localhost:3000/student/lab.html',
        line: 120,
        col: 15
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.status, 'logged');
    assert.ok(body.eventId);
  });

  /* 8. AI TUTOR & KCSE GRADING ENDPOINTS */
  it('POST /api/feedback/tutor-hint — should return 403 Forbidden during assignment or exam mode', async () => {
    const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);

    const res = await fetch(url('/api/feedback/tutor-hint'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        experimentType: 'Titration Practical',
        studyMode: 'assignment',
        studentQuery: 'Give me the correct answer'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.error, 'AI Assistant is disabled during formal assignments and exams.');
  });

  it('POST /api/feedback/tutor-hint — should respond with 503 if Gemini API key not configured or return Socratic hint', async () => {
    const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);

    const res = await fetch(url('/api/feedback/tutor-hint'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        experimentType: 'Qualitative Salt Analysis',
        studyMode: 'guided',
        studentQuery: 'How do I test for sulfate ions?'
      })
    });
    const body = await res.json();

    assert.ok([200, 503].includes(res.status));
    if (res.status === 200) {
      assert.ok(body.hint);
    } else {
      assert.ok(body.error);
    }
  });

  it('POST /api/feedback/grade-kcse — should evaluate student free-text observation or return 503 fallback', async () => {
    const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);

    const res = await fetch(url('/api/feedback/grade-kcse'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        testTitle: 'Barium Nitrate Test',
        studentObservation: 'White precipitate formed which dissolved when excess dilute nitric acid was added',
        expectedObservation: 'White precipitate insoluble in excess dilute nitric acid',
        expectedInference: 'SO4^2- absent, CO3^2- or SO3^2- present'
      })
    });
    const body = await res.json();

    assert.ok([200, 503].includes(res.status));
    if (res.status === 200) {
      assert.ok(body.evaluation);
    } else {
      assert.ok(body.error);
    }
  });

  it('GET /api/errors/recent — should return recent errors for teacher', async () => {
    const token = jwt.sign({ id: 1, role: 'teacher' }, process.env.JWT_SECRET);

    const res = await fetch(url('/api/errors/recent'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.count >= 1);
  });

  /* 8. ADMIN PORTAL ENDPOINTS */
  it('GET /api/admin/overview — should return 401 Unauthorized without admin token', async () => {
    const res = await fetch(url('/api/admin/overview'));
    const body = await res.json();

    assert.strictEqual(res.status, 401);
    assert.ok(body.error);
  });

  it('GET /api/admin/overview — should return 403 Forbidden with student token', async () => {
    const res = await fetch(url('/api/admin/overview'), {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 403);
    assert.ok(body.error);
  });

  it('GET /api/admin/overview — should return platform metrics summary with admin token', async () => {
    pool.query = async (text) => {
      if (text.includes('FROM schools')) return { rows: [{ count: '12' }] };
      if (text.includes('FROM teachers')) return { rows: [{ count: '24' }] };
      if (text.includes('FROM students')) return { rows: [{ count: '450' }] };
      if (text.includes('FROM practical_sessions')) return { rows: [{ total: '300', correct_cnt: '270' }] };
      if (text.includes('FROM qualitative_sessions')) return { rows: [{ total: '150', correct_cnt: '130' }] };
      if (text.includes('FROM organic_sessions')) return { rows: [{ total: '100', correct_cnt: '85' }] };
      return { rows: [] };
    };

    const res = await fetch(url('/api/admin/overview'), {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.metrics.totalSchools, 12);
    assert.strictEqual(body.metrics.totalTeachers, 24);
    assert.strictEqual(body.metrics.totalStudents, 450);
  });

  it('POST /api/admin/schools — should register a new school when authenticated as admin', async () => {
    pool.query = async (text) => {
      if (text.includes('SELECT id FROM schools')) return { rows: [] };
      return { rows: [{ id: 99, name: 'Alliance High School', county: 'Kiambu', admin_code: 'SCH-ALN-999' }] };
    };

    const res = await fetch(url('/api/admin/schools'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Alliance High School',
        county: 'Kiambu',
        adminCode: 'SCH-ALN-999'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.school.name, 'Alliance High School');
  });

  it('GET /api/admin/audit-logs — should return audit log history when authenticated as admin', async () => {
    pool.query = async () => {
      return {
        rows: [
          { id: 1, admin_email: 'admin@virtulab.co.ke', action: 'REGISTER_SCHOOL', details: 'Registered Alliance High', created_at: new Date().toISOString() }
        ]
      };
    };

    const res = await fetch(url('/api/admin/audit-logs'), {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.logs));
    assert.strictEqual(body.logs.length, 1);
  });

  /* 9. BROADCAST ANNOUNCEMENTS ENDPOINTS */
  it('POST /api/admin/announcements — should create system broadcast announcement when authenticated as admin', async () => {
    pool.query = async () => {
      return { rows: [{ id: 1, title: 'KCSE Chemistry Mock Notice', message: 'Mock starts Monday', type: 'exam', is_active: true }] };
    };

    const res = await fetch(url('/api/admin/announcements'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'KCSE Chemistry Mock Notice',
        message: 'Mock starts Monday',
        type: 'exam'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.announcement.title, 'KCSE Chemistry Mock Notice');
  });

  it('GET /api/announcements/active — should return active system broadcasts', async () => {
    pool.query = async () => {
      return { rows: [{ id: 1, title: 'KCSE Chemistry Mock Notice', message: 'Mock starts Monday', type: 'exam', is_active: true }] };
    };

    const res = await fetch(url('/api/announcements/active'));
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.announcements));
    assert.strictEqual(body.announcements.length, 1);
  });

  /* 10. REPORT EXPORT ENDPOINTS */
  it('GET /api/admin/export/schools — should download CSV report of schools when authenticated as admin', async () => {
    pool.query = async () => {
      return { rows: [{ id: 1, name: 'Alliance High', county: 'Kiambu', admin_code: 'SCH-ALN-001', teacher_count: 5, student_count: 120, created_at: new Date().toISOString() }] };
    };

    const res = await fetch(url('/api/admin/export/schools'), {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const text = await res.text();

    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('text/csv'));
    assert.ok(text.includes('School Name'));
    assert.ok(text.includes('Alliance High'));
  });

  it('GET /api/admin/export/users — should download CSV report of platform users when authenticated as admin', async () => {
    pool.query = async (text) => {
      if (text.includes('FROM teachers')) {
        return { rows: [{ id: 1, name: 'Teacher Jane', email: 'jane@school.ac.ke', role: 'Teacher', status: 'active', school_name: 'Alliance High', county: 'Kiambu', form: '', created_at: new Date().toISOString() }] };
      }
      return { rows: [{ id: 2, name: 'Student John', email: 'john@school.ac.ke', role: 'Student', status: 'active', school_name: 'Alliance High', county: 'Kiambu', form: 'Form 4', created_at: new Date().toISOString() }] };
    };

    const res = await fetch(url('/api/admin/export/users'), {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const text = await res.text();

    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type').includes('text/csv'));
    assert.ok(text.includes('Teacher Jane'));
    assert.ok(text.includes('Student John'));
  });

  /* 11. SCHOOL CRUD ENDPOINTS */
  it('PUT /api/admin/schools/:id — should update school details when authenticated as admin', async () => {
    pool.query = async (text) => {
      if (text.includes('SELECT id FROM schools')) return { rows: [] };
      return { rows: [{ id: 1, name: 'Alliance Girls High', county: 'Kiambu', admin_code: 'SCH-ALN-001' }] };
    };

    const res = await fetch(url('/api/admin/schools/1'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Alliance Girls High',
        county: 'Kiambu',
        adminCode: 'SCH-ALN-001'
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.school.name, 'Alliance Girls High');
  });

  it('DELETE /api/admin/schools/:id — should remove a school when authenticated as admin', async () => {
    pool.query = async () => {
      return { rows: [] };
    };

    const res = await fetch(url('/api/admin/schools/1'), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
  });

  /* 12. COMPOSITE PRACTICAL EXAM ENDPOINTS (40 MARKS TOTAL) */
  it('POST /api/composite — should save a 40-mark composite practical exam session', async () => {
    const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);

    pool.query = async (text) => {
      if (text.includes('INSERT INTO composite_sessions')) {
        return {
          rows: [{
            id: 801,
            student_id: 1,
            exam_title: 'KCSE Chemistry Paper 3 Composite Exam',
            q1_score: 15.0,
            q2_score: 15.0,
            q3_score: 10.0,
            total_score: 40.0,
            grade: 'A'
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/composite'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        exam_title: 'KCSE Chemistry Paper 3 Composite Exam',
        q1_score: 15.0,
        q2_score: 15.0,
        q3_score: 10.0,
        total_score: 40.0,
        duration_seconds: 2700
      })
    });
    const body = await res.json();

    assert.strictEqual(res.status, 201);
    assert.ok(body.session);
    assert.strictEqual(body.session.total_score, 40.0);
    assert.strictEqual(body.session.grade, 'A');
  });

  it('GET /api/composite/mine — should return student composite exam sessions', async () => {
    const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);

    pool.query = async () => ({
      rows: [
        { id: 801, exam_title: 'KCSE Chemistry Paper 3 Composite Exam', total_score: 40.0, grade: 'A' }
      ]
    });

    const res = await fetch(url('/api/composite/mine'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(body.sessions));
    assert.strictEqual(body.sessions.length, 1);
  });

  /* 13. FULL END-TO-END COMPOSITE EXAM WORKFLOW TEST */
  it('E2E Workflow — Teacher creates custom composite exam & student completes 40-mark booklet', async () => {
    const teacherToken = jwt.sign({ id: 99, role: 'teacher', school_id: 1 }, process.env.JWT_SECRET);
    const studentToken = jwt.sign({ id: 1, role: 'student', school_id: 1 }, process.env.JWT_SECRET);

    // Step 1: Teacher creates composite assignment with custom exam_config
    pool.query = async (text, params) => {
      if (text.includes('SELECT school_id FROM teachers')) {
        return { rows: [{ school_id: 1 }] };
      }
      if (text.includes('INSERT INTO assignments')) {
        return {
          rows: [{
            id: 901,
            teacher_id: 99,
            title: 'Form 4 KCSE Mock Practical Exam',
            titration_type: 'kcseComposite',
            exam_config: params[6]
          }]
        };
      }
      return { rows: [] };
    };

    const createRes = await fetch(url('/api/assignments'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        title: 'Form 4 KCSE Mock Practical Exam',
        titrationType: 'kcseComposite',
        targetConcentration: 0.1,
        dueDate: '2026-09-30',
        examConfig: {
          q1: { solutionA: 'H2SO4', solutionB: 'NaOH', ratioA: 1, ratioB: 2, pipetteVolume: 25.0, indicator: 'Phenolphthalein' },
          q2: { salt: 'Pb(NO3)2' },
          q3: { organic: 'Ethanol' }
        }
      })
    });
    const createBody = await createRes.json();
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createBody.assignment.titration_type, 'kcseComposite');

    // Step 2: Student submits completed 40-mark composite exam booklet
    pool.query = async (text) => {
      if (text.includes('INSERT INTO composite_sessions')) {
        return {
          rows: [{
            id: 902,
            student_id: 1,
            assignment_id: 901,
            exam_title: 'Form 4 KCSE Mock Practical Exam',
            q1_score: 15.0,
            q2_score: 15.0,
            q3_score: 10.0,
            total_score: 40.0,
            grade: 'A'
          }]
        };
      }
      return { rows: [] };
    };

    const submitRes = await fetch(url('/api/composite'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        assignment_id: 901,
        exam_title: 'Form 4 KCSE Mock Practical Exam',
        q1_score: 15.0,
        q2_score: 15.0,
        q3_score: 10.0,
        total_score: 40.0,
        duration_seconds: 2400
      })
    });
    const submitBody = await submitRes.json();
    assert.strictEqual(submitRes.status, 201);
    assert.strictEqual(submitBody.session.total_score, 40.0);
    assert.strictEqual(submitBody.session.grade, 'A');
  });

  it('CompositeExamEngine — should instantiate all 6 national series and evaluate 40-mark KNEC scoring correctly', () => {
    const { COMPOSITE_EXAM_PRESETS, CompositeExamEngine, generateRandomCompositePreset } = require('../../client/student/js/composite-engine');

    // 1. Verify all 6 series exist with Q1, Q2, Q3
    const seriesKeys = ['series_1', 'series_2', 'series_3', 'series_4', 'series_5', 'series_6'];
    seriesKeys.forEach(k => {
      assert.ok(COMPOSITE_EXAM_PRESETS[k], `Series ${k} must exist`);
      assert.ok(COMPOSITE_EXAM_PRESETS[k].q1, `Series ${k} Q1 must exist`);
      assert.ok(COMPOSITE_EXAM_PRESETS[k].q2, `Series ${k} Q2 must exist`);
      assert.ok(COMPOSITE_EXAM_PRESETS[k].q3, `Series ${k} Q3 must exist`);
    });

    // 2. Verify randomized paper generator
    const randomPaper = generateRandomCompositePreset();
    assert.ok(randomPaper);
    assert.strictEqual(randomPaper.durationMinutes, 135);
    assert.ok(randomPaper.q1 && randomPaper.q2 && randomPaper.q3);

    // 3. Test Series 3 (Redox Titration) engine evaluation
    const engine = new CompositeExamEngine({ presetKey: 'series_3' });
    
    // Simulate candidate recording 3 concordant trials
    engine.recordTrial(1, 25.00, 0.00);
    engine.recordTrial(2, 25.00, 0.00);
    engine.recordTrial(3, 25.00, 0.00);
    engine.setConcordant(1, true);
    engine.setConcordant(2, true);
    engine.setConcordant(3, true);

    engine.setQ1Answer('avgTitre', '25.00');
    engine.setQ1Answer('molesB', '0.00250');
    engine.setQ1Answer('molesA', '0.00050');
    engine.setQ1Answer('molarityA', '0.020');
    engine.setQ1Answer('concGrams', '3.16');

    // Simulate candidate Q2 deductions
    engine.setQ2Response('q2_appearance', 'White crystalline solid, dissolves to clear solution', 'Soluble salt');
    engine.setQ2Response('q2_naoh', 'White precipitate formed, dissolves in excess', 'Zn2+ or Al3+ present');
    engine.setQ2Response('q2_nh3', 'White precipitate formed, dissolves completely in excess aqueous ammonia', 'Zn2+ confirmed');
    engine.setQ2Response('q2_anion', 'Dense white precipitate insoluble in nitric acid', 'SO42- confirmed');
    engine.setQ2Deduction('Zn2+', 'SO42-');

    // Simulate candidate Q3 deductions
    engine.setQ3Response('q3_ignition', 'Burns with luminous smoky yellow sooty flame', 'Unsaturated compound');
    engine.setQ3Response('q3_litmus', 'No change on litmus paper', 'Neutral hydrocarbon');
    engine.setQ3Response('q3_kmno4', 'Purple KMnO4 solution rapidly decolorized', 'Alkene present');
    engine.setQ3Response('q3_nahco3', 'Bromine water rapidly decolorized in dark', 'Double bond confirmed');
    engine.setQ3Deduction('Alkene (>C=C<)');

    const evaluation = engine.evaluateExam();
    assert.strictEqual(evaluation.grade, 'A');
    assert.ok(evaluation.totalScore >= 35.0, `Evaluation total score was ${evaluation.totalScore}`);
    assert.strictEqual(evaluation.maxScore, 40.0);
    assert.ok(evaluation.q1Details.rubric.length > 0);
    assert.ok(evaluation.q2Details.rubric.length > 0);
    assert.ok(evaluation.q3Details.rubric.length > 0);
    assert.ok(evaluation.workedSolutions.stepA);
    assert.ok(evaluation.workedSolutions.stepB);
    assert.ok(evaluation.workedSolutions.stepC);
    assert.ok(evaluation.workedSolutions.stepD);
    assert.ok(evaluation.workedSolutions.stepE);
  });

  it('CompositeExamEngine — should correctly enforce KNEC technical penalty rules', () => {
    const { CompositeExamEngine } = require('../../client/student/js/composite-engine');
    const engine = new CompositeExamEngine({ presetKey: 'series_1' });

    // 1. Decimal place precision violation (.33 instead of .00 or .50/.05)
    engine.recordTrial(1, 24.33, 0.00);
    engine.recordTrial(2, 24.37, 0.00);
    const q1Res1 = engine.calculateQ1Score();
    const decimalPenalty = q1Res1.rubric.find(r => r.item.includes('Decimal Place Penalty'));
    assert.ok(decimalPenalty, 'Must detect and penalize decimal place precision violation');
    assert.strictEqual(decimalPenalty.mark, 0.5);

    // 2. Non-concordant averaging penalty (averaging 24.00 and 25.50 which is >0.20 cm³ apart)
    engine.recordTrial(1, 24.00, 0.00);
    engine.recordTrial(2, 25.50, 0.00);
    engine.setConcordant(1, true);
    engine.setConcordant(2, true);
    engine.setQ1Answer('avgTitre', '24.75');
    const q1Res2 = engine.calculateQ1Score();
    const concPenalty = q1Res2.rubric.find(r => r.item.includes('Non-Concordant Penalty'));
    assert.ok(concPenalty, 'Must detect and penalize non-concordant averaging');

    // 3. Missing ionic charge penalty (deducing plain 'Pb' instead of 'Pb2+')
    engine.setQ2Deduction('Pb', 'NO3-');
    const q2Res = engine.calculateQ2Score();
    const chargePenalty = q2Res.rubric.find(r => r.item.includes('Charge Penalty'));
    assert.ok(chargePenalty, 'Must detect and penalize missing charge superscripts');
  });

  /* 23. SOLUBILITY CURVES & TEACHER CLASS VIEW */
  it('GET /api/solubility/class — should allow teacher to view class solubility sessions', async () => {
    pool.query = async (queryText) => {
      if (typeof queryText === 'string' && queryText.includes('solubility_sessions')) {
        return {
          rows: [{
            id: 1,
            student_id: 1,
            student_name: 'Test Student',
            solute_key: 'KClO3',
            solute_name: 'Potassium Chlorate (V)',
            crystallization_temp: 58.5,
            theoretical_temp: 59.0,
            temp_difference: 0.5,
            total_score: 5.0
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/solubility/class'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.sessions.length, 1);
    assert.strictEqual(body.sessions[0].solute_key, 'KClO3');
  });

  /* 24. THERMOCHEMISTRY / ENERGY CHANGES PRACTICALS */
  it('POST /api/energy & GET /api/energy/class — should record and allow teacher to view energy changes sessions', async () => {
    pool.query = async (queryText) => {
      if (typeof queryText === 'string' && queryText.includes('INSERT INTO energy_sessions')) {
        return {
          rows: [{
            id: 101,
            student_id: 1,
            system_id: 'KCSE_2022_DISPLACEMENT',
            system_name: 'Displacement Enthalpy: Zn + CuSO₄',
            temp_change: 28.5,
            heat_quantity: 5956.5,
            moles: 0.025,
            molar_enthalpy: -238.3,
            total_score: 15.0
          }]
        };
      }
      if (typeof queryText === 'string' && queryText.includes('FROM energy_sessions')) {
        return {
          rows: [{
            id: 101,
            student_id: 1,
            student_name: 'Test Student',
            system_id: 'KCSE_2022_DISPLACEMENT',
            total_score: 15.0
          }]
        };
      }
      return { rows: [] };
    };

    const postRes = await fetch(url('/api/energy'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        system_id: 'KCSE_2022_DISPLACEMENT',
        system_name: 'Displacement Enthalpy: Zn + CuSO₄',
        initial_temp: 21.5,
        final_temp: 50.0,
        temp_change: 28.5,
        heat_quantity: 5956.5,
        moles: 0.025,
        molar_enthalpy: -238.3,
        total_score: 15.0,
        rubric_breakdown: [{ item: 'Table Reading', mark: '5.0 / 5.0', pass: true }]
      })
    });
    const postBody = await postRes.json();
    assert.strictEqual(postRes.status, 201);
    assert.strictEqual(postBody.session.total_score, 15.0);

    const getRes = await fetch(url('/api/energy/class'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const getBody = await getRes.json();
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getBody.success, true);
    assert.strictEqual(getBody.sessions.length, 1);
  });

  /* 13. SECURITY REGRESSION TESTS */
  it('CSV Sanitizer — should neutralize formula injection characters (=, +, -, @, \\t, \\r)', () => {
    const { escapeCsv } = require('../utils/csv');
    assert.strictEqual(escapeCsv('=SUM(A1:A10)'), "'=SUM(A1:A10)");
    assert.strictEqual(escapeCsv('+cmd|calc!A0'), "'+cmd|calc!A0");
    assert.strictEqual(escapeCsv('-123'), "'-123");
    assert.strictEqual(escapeCsv('@SUM(1)'), "'@SUM(1)");
    assert.strictEqual(escapeCsv('Normal text, with comma'), '"Normal text, with comma"');
  });

  /* 14. GAS PREPARATION & COLLECTION MODULE TESTS */
  it('POST & GET /api/gas — should record and fetch gas preparation sessions', async () => {
    pool.query = async (queryText, values) => {
      const q = typeof queryText === 'string' ? queryText.replace(/\s+/g, ' ') : '';
      if (q.includes('INSERT INTO gas_sessions')) {
        return {
          rows: [{
            id: 201,
            student_id: 1,
            gas_key: 'O2',
            gas_name: 'Oxygen Gas (O2)',
            drying_agent: 'concH2SO4',
            collection_method: 'overWater',
            drying_correct: true,
            collection_correct: true,
            total_score: 9.5,
            correct: true
          }]
        };
      }
      if (q.includes('FROM gas_sessions gs')) {
        return {
          rows: [{
            id: 201,
            student_id: 1,
            student_name: 'Test Student',
            gas_key: 'O2',
            total_score: 9.5
          }]
        };
      }
      if (q.includes('FROM gas_sessions WHERE student_id')) {
        return {
          rows: [{
            id: 201,
            student_id: 1,
            gas_key: 'O2',
            total_score: 9.5
          }]
        };
      }
      return { rows: [] };
    };

    const postRes = await fetch(url('/api/gas'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        gas_key: 'O2',
        gas_name: 'Oxygen Gas (O2)',
        drying_agent: 'concH2SO4',
        collection_method: 'overWater',
        drying_correct: true,
        collection_correct: true,
        tests_performed: 2,
        tests_correct: 2,
        total_score: 9.5,
        correct: true
      })
    });
    const postBody = await postRes.json();
    assert.strictEqual(postRes.status, 201);
    assert.strictEqual(postBody.session.gas_key, 'O2');
    assert.strictEqual(postBody.session.total_score, 9.5);

    const getMineRes = await fetch(url('/api/gas/mine'), {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const getMineBody = await getMineRes.json();
    assert.strictEqual(getMineRes.status, 200);
    assert.strictEqual(getMineBody.sessions.length, 1);

    const getClassRes = await fetch(url('/api/gas/class'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const getClassBody = await getClassRes.json();
    assert.strictEqual(getClassRes.status, 200);
    assert.strictEqual(getClassBody.sessions.length, 1);
  });

  /* 15. ACADEMIC RESEARCH SUITE (CPCAT, SUS, TAM & STATS) */
  it('POST & GET /api/research — should record CPCAT, SUS, TAM and return research summary', async () => {
    pool.query = async (queryText, values) => {
      const q = typeof queryText === 'string' ? queryText.replace(/\s+/g, ' ') : '';
      if (q.includes('INSERT INTO research_assessments')) {
        return {
          rows: [{
            id: 301,
            student_id: 1,
            assessment_type: 'pre_test',
            total_score: 28.0,
            percentage: 70.0
          }]
        };
      }
      if (q.includes('FROM research_assessments WHERE student_id')) {
        return {
          rows: [
            { id: 301, student_id: 1, assessment_type: 'pre_test', total_score: 20.0, percentage: 50.0 },
            { id: 302, student_id: 1, assessment_type: 'post_test', total_score: 34.0, percentage: 85.0 }
          ]
        };
      }
      if (q.includes('INSERT INTO research_surveys')) {
        return {
          rows: [{
            id: 401,
            user_id: 1,
            survey_type: values[3] || 'SUS',
            score: 85.0
          }]
        };
      }
      if (q.includes('pre.assessment_type = \'pre_test\'')) {
        return {
          rows: [{
            student_id: 1,
            student_name: 'Test Student',
            student_form: 'Form 4',
            school_name: 'Alliance High School',
            pre_score: 20.0,
            pre_percentage: 50.0,
            post_score: 34.0,
            post_percentage: 85.0
          }]
        };
      }
      if (q.includes('FROM research_surveys WHERE survey_type = $1')) {
        if (values[0] === 'SUS') {
          return { rows: [{ id: 401, user_id: 1, score: 85.0 }] };
        }
        if (values[0] === 'TAM') {
          return { rows: [{ id: 402, user_id: 1, construct_scores: { PU: 4.5, PEOU: 4.5, FC: 4.0, BI: 4.8 } }] };
        }
      }
      return { rows: [] };
    };

    // 1. Submit CPCAT
    const cpcatRes = await fetch(url('/api/research/cpcat/submit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        assessment_type: 'pre_test',
        section_a_score: 10,
        section_b_score: 8,
        section_c_score: 6,
        section_d_score: 4,
        total_score: 28.0
      })
    });
    const cpcatBody = await cpcatRes.json();
    assert.strictEqual(cpcatRes.status, 201);
    assert.strictEqual(cpcatBody.assessment.total_score, 28.0);

    // 2. Check CPCAT Status
    const statusRes = await fetch(url('/api/research/cpcat/status'), {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const statusBody = await statusRes.json();
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusBody.hasPreTest, true);
    assert.strictEqual(statusBody.hasPostTest, true);
    assert.strictEqual(statusBody.hakesGain.g, 0.7);

    // 3. Submit SUS Survey
    const susRes = await fetch(url('/api/research/sus/submit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        responses: [5, 1, 5, 1, 5, 1, 5, 1, 5, 1], // Perfect 100 score
        feedback_text: 'Excellent virtual chemistry platform.'
      })
    });
    const susBody = await susRes.json();
    assert.strictEqual(susRes.status, 201);
    assert.strictEqual(susBody.susScore.score, 100);

    // 4. Submit TAM Survey
    const tamRes = await fetch(url('/api/research/tam/submit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        responses: { PU: [5, 5, 5, 5], PEOU: [4, 4, 4, 4], FC: [4, 4, 4], BI: [5, 5, 5] },
        feedback_text: 'Highly recommended for all sub-county schools.'
      })
    });
    const tamBody = await tamRes.json();
    assert.strictEqual(tamRes.status, 201);
    assert.strictEqual(tamBody.constructScores.PU, 5.0);

    // 5. Research Summary & Analytics
    const summaryRes = await fetch(url('/api/research/analytics/summary'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const summaryBody = await summaryRes.json();
    assert.strictEqual(summaryRes.status, 200);
    assert.strictEqual(summaryBody.summary.pairedCount, 1);

    // 6. Research CSV Export
    const csvRes = await fetch(url('/api/research/export/csv'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    assert.strictEqual(csvRes.status, 200);
    const csvText = await csvRes.text();
    assert.ok(csvText.includes('Student_ID,School_Name,Form_Level'));
    assert.ok(csvText.includes('STU-0001'));
  });

  /* 23. TEACHER-STUDENT COMPREHENSIVE LINKAGE TESTS */
  it('GET /api/auth/me — should return teacher_code and school info for teacher', async () => {
    pool.query = async (q) => {
      if (q.includes('FROM teachers t')) {
        return {
          rows: [{
            id: 1,
            name: 'Mwalimu Maina',
            email: 'maina@school.ke',
            teacher_code: 'TCH8X2',
            school_id: 1,
            school_name: 'Alliance High School',
            school_code: 'ALL001'
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/auth/me'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.user.teacherCode, 'TCH8X2');
    assert.strictEqual(body.user.schoolName, 'Alliance High School');
  });

  it('POST /api/students/link-teacher — should link student to teacher using valid teacher code', async () => {
    pool.query = async (q, params) => {
      if (q.includes('WHERE UPPER(t.teacher_code) = $1')) {
        return {
          rows: [{
            id: 2,
            name: 'Madam Wanjiku',
            email: 'wanjiku@school.ke',
            teacher_code: 'TCH999',
            school_id: 1,
            school_name: 'Nairobi Academy'
          }]
        };
      }
      if (q.includes('UPDATE students')) {
        return {
          rows: [{
            id: 1,
            name: 'Test Student',
            email: 'student@example.com',
            form: 'Form 4',
            school_id: 1,
            teacher_id: 2
          }]
        };
      }
      if (q.includes('INSERT INTO student_notifications')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/students/link-teacher'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ teacherCode: 'TCH999' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.student.teacherName, 'Madam Wanjiku');
    assert.strictEqual(body.student.teacherCode, 'TCH999');
  });

  it('POST /api/students/link-teacher — should return 404 for non-existent teacher code', async () => {
    pool.query = async () => ({ rows: [] });

    const res = await fetch(url('/api/students/link-teacher'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ teacherCode: 'NONEXISTENT' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 404);
    assert.ok(body.error.includes('No teacher found with code'));
  });

  it('GET /api/students/profile — should return student profile with linked teacher', async () => {
    pool.query = async (q) => {
      if (q.includes('FROM students s')) {
        return {
          rows: [{
            id: 1,
            name: 'Test Student',
            email: 'student@example.com',
            form: 'Form 4',
            school_id: 1,
            teacher_id: 2,
            school_name: 'Nairobi Academy',
            teacher_name: 'Madam Wanjiku',
            teacher_code: 'TCH999'
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/students/profile'), {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.student.name, 'Test Student');
    assert.strictEqual(body.student.teacher_name, 'Madam Wanjiku');
    assert.strictEqual(body.student.teacher_code, 'TCH999');
  });

  it('POST /api/assignments/:id/remind — should dispatch notifications to unsubmitted students', async () => {
    pool.query = async (q) => {
      if (q.includes('FROM assignments WHERE id =')) {
        return {
          rows: [{
            id: 10,
            title: 'KCSE Mock Exam Paper 3',
            due_date: new Date(Date.now() + 86400000).toISOString()
          }]
        };
      }
      if (q.includes('FROM students s')) {
        return {
          rows: [
            { id: 1, name: 'Student 1' },
            { id: 2, name: 'Student 2' }
          ]
        };
      }
      if (q.includes('INSERT INTO student_notifications')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/assignments/10/remind'), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.notifiedCount, 2);
  });

  it('GET /api/assignments/:id/export — should return formatted CSV for qualitative assignment', async () => {
    pool.query = async (q) => {
      if (q.includes('SELECT id, title, titration_type FROM assignments')) {
        return {
          rows: [{
            id: 12,
            title: 'Qualitative Analysis Assessment',
            titration_type: 'qualitative'
          }]
        };
      }
      if (q.includes('SELECT DISTINCT ON (s.id)')) {
        return {
          rows: [{
            student_id: 1,
            student_name: 'Tecla Rice',
            student_email: 'tecla@virtulab.ke',
            student_form: 'Form 4',
            submission_status: 'submitted',
            teacher_feedback: 'Well done',
            submitted_at: new Date().toISOString(),
            salt_key: 'pb_no3',
            salt_name: 'Lead(II) Nitrate',
            student_cation: 'Pb2+',
            student_anion: 'NO3-',
            cation_correct: true,
            anion_correct: true,
            q_tests_performed: 4,
            q_tests_correct: 4,
            correct: true
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/assignments/12/export'), {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    assert.strictEqual(res.status, 200);
    const csv = await res.text();
    assert.ok(csv.includes('Salt Key'));
    assert.ok(csv.includes('Lead(II) Nitrate'));
    assert.ok(csv.includes('Tecla Rice'));
  });

});



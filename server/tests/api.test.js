// ============================================================
//  VirtuLab Kenya — Automated API Tests (Jest + Supertest)
// ============================================================

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock pool.query before importing app
jest.mock('../db/pool', () => ({
  query: jest.fn(),
  on: jest.fn()
}));

const pool = require('../db/pool');
const app = require('../index');

describe('VirtuLab Kenya — API Endpoints', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret_key_12345';
  });

  /* ──────────────────────────────────────────────────────────
     1. HEALTH CHECK ENDPOINT
  ────────────────────────────────────────────────────────── */
  describe('GET /api/health', () => {
    it('should return 200 OK with server metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('project', 'VirtuLab Kenya');
      expect(res.body).toHaveProperty('version', '1.0.0');
    });
  });

  /* ──────────────────────────────────────────────────────────
     2. AUTHENTICATION ENDPOINTS
  ────────────────────────────────────────────────────────── */
  describe('POST /api/auth/student/register', () => {
    it('should return 400 if required registration fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/student/register')
        .send({ name: 'Test Student' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'All fields are required.');
    });

    it('should return 400 if password is less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/student/register')
        .send({
          name: 'Student One',
          email: 'student@example.com',
          password: '123',
          form: 'Form 3',
          schoolCode: 'SCH001'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Password must be at least 6 characters.');
    });

    it('should return 400 if school registration code is invalid', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // School not found

      const res = await request(app)
        .post('/api/auth/student/register')
        .send({
          name: 'Student One',
          email: 'student@example.com',
          password: 'password123',
          form: 'Form 3',
          schoolCode: 'INVALID_CODE'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid school registration code.');
    });
  });

  describe('POST /api/auth/student/login', () => {
    it('should return 400 if email or password missing', async () => {
      const res = await request(app)
        .post('/api/auth/student/login')
        .send({ email: 'student@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email and password are required.');
    });

    it('should return 401 if student credentials do not match', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // User not found

      const res = await request(app)
        .post('/api/auth/student/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials.');
    });
  });

  describe('POST /api/auth/teacher/login', () => {
    it('should return 400 if credentials missing', async () => {
      const res = await request(app)
        .post('/api/auth/teacher/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email and password are required.');
    });
  });

  /* ──────────────────────────────────────────────────────────
     3. PROTECTED SESSIONS ENDPOINTS
  ────────────────────────────────────────────────────────── */
  describe('GET /api/sessions/mine', () => {
    it('should return 401 Unauthorized if no Bearer token provided', async () => {
      const res = await request(app).get('/api/sessions/mine');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should return student sessions when valid token is supplied', async () => {
      const token = jwt.sign({ id: 1, role: 'student', form: 'Form 4' }, process.env.JWT_SECRET);

      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // total query
        .mockResolvedValueOnce({ rows: [                  // data query
          { id: 101, titration_type: 'acidBase', is_concordant: true, student_conc: 0.1 },
          { id: 102, titration_type: 'redox', is_concordant: false, student_conc: 0.25 }
        ]});

      const res = await request(app)
        .get('/api/sessions/mine')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('sessions');
      expect(res.body.sessions).toHaveLength(2);
      expect(res.body).toHaveProperty('total', 2);
    });
  });

  describe('POST /api/sessions', () => {
    it('should save a valid lab session for an authenticated student', async () => {
      const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // student check
        .mockResolvedValueOnce({ rows: [{ id: 501, titration_type: 'acidBase' }] }); // insert result

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titrationType: 'acidBase',
          titer1: 12.5,
          titer2: 12.5,
          titer3: 12.6,
          avgTiter: 12.5,
          studentConc: 0.1,
          expectedConc: 0.1,
          concErrorPercent: 0,
          isConcordant: true
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Session saved successfully.');
      expect(res.body).toHaveProperty('session');
    });
  });

  /* ──────────────────────────────────────────────────────────
     4. ASSIGNMENTS ENDPOINTS
  ────────────────────────────────────────────────────────── */
  describe('GET /api/assignments/mine', () => {
    it('should return assignments for logged in student', async () => {
      const token = jwt.sign({ id: 1, role: 'student', teacher_id: 2 }, process.env.JWT_SECRET);

      pool.query.mockResolvedValueOnce({ rows: [
        { id: 10, title: 'Acid-Base Practical Assignment 1', submitted: false }
      ]});

      const res = await request(app)
        .get('/api/assignments/mine')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('assignments');
      expect(res.body.assignments).toHaveLength(1);
    });
  });

  /* ──────────────────────────────────────────────────────────
     5. QUALITATIVE ANALYSIS ENDPOINTS
  ────────────────────────────────────────────────────────── */
  describe('POST /api/qualitative', () => {
    it('should save a qualitative salt identification session', async () => {
      const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);

      pool.query.mockResolvedValueOnce({ rows: [{ id: 201, salt_name: 'Copper(II) Sulfate' }] });

      const res = await request(app)
        .post('/api/qualitative')
        .set('Authorization', `Bearer ${token}`)
        .send({
          saltKey: 'copperSulfate',
          saltName: 'Copper(II) Sulfate',
          trueCation: 'Cu2+',
          trueAnion: 'SO4^2-',
          studentCation: 'Cu2+',
          studentAnion: 'SO4^2-',
          cationCorrect: true,
          anionCorrect: true,
          testsPerformed: 6,
          testsCorrect: 6,
          observations: []
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Qualitative session saved successfully.');
      expect(res.body).toHaveProperty('session');
    });
  });

  /* ──────────────────────────────────────────────────────────
     6. ROUTE 404 HANDLER
  ────────────────────────────────────────────────────────── */
  describe('GET /api/unknown-endpoint', () => {
    it('should return 404 for nonexistent endpoints', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Endpoint not found');
    });
  });

});

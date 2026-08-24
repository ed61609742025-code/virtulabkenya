// ============================================================
//  VirtuLab Kenya — Authentication Routes
//  Phase 1, Week 3
// ============================================================
//
// POST /api/auth/student/register
// POST /api/auth/student/login
// POST /api/auth/teacher/login
// GET  /api/auth/me            (protected — any logged-in user)

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateStudentRegister, validateTeacherRegister, validateLogin } = require('../middleware/validators');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

const router = express.Router();

const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function safeTimingCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function generateSecureString(length, chars) {
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, chars.length);
    result += chars[idx];
  }
  return result;
}

// ── POST /api/auth/student/register ────────────────────────────
router.post('/student/register', authLimiter, validateStudentRegister, asyncHandler(async (req, res) => {
  const { name, email, password, form, schoolCode, teacherCode } = req.body;

  if (!name || !email || !password || !form || !schoolCode) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const schoolResult = await pool.query(
    'SELECT id FROM schools WHERE admin_code = $1',
    [schoolCode]
  );
  if (schoolResult.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid school registration code.' });
  }
  const schoolId = schoolResult.rows[0].id;

  // teacherCode is optional. If given, it must belong to a teacher
  // at the same school — otherwise reject so a student can't
  // accidentally (or deliberately) attach to the wrong class.
  let teacherId = null;
  if (teacherCode) {
    const teacherResult = await pool.query(
      'SELECT id FROM teachers WHERE teacher_code = $1 AND school_id = $2',
      [teacherCode, schoolId]
    );
    if (teacherResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid teacher code for this school.' });
    }
    teacherId = teacherResult.rows[0].id;
  }

  const existing = await pool.query('SELECT id FROM students WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const insertResult = await pool.query(
    `INSERT INTO students (school_id, teacher_id, name, email, password_hash, form)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, form`,
    [schoolId, teacherId, name, email, passwordHash, form]
  );

  return res.status(201).json({ user: insertResult.rows[0] });
}));

// ── POST /api/auth/teacher/register ────────────────────────────
router.post('/teacher/register', authLimiter, validateTeacherRegister, asyncHandler(async (req, res) => {
  const { name, email, password, schoolCode } = req.body;

  if (!name || !email || !password || !schoolCode) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const schoolResult = await pool.query(
    'SELECT id FROM schools WHERE admin_code = $1',
    [schoolCode]
  );
  if (schoolResult.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid school registration code.' });
  }
  const schoolId = schoolResult.rows[0].id;

  const existing = await pool.query('SELECT id FROM teachers WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate cryptographically secure unique teacher code (e.g. TCH8X2)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const teacherCode = 'TCH' + generateSecureString(4, chars);

  const insertResult = await pool.query(
    `INSERT INTO teachers (school_id, name, email, password_hash, teacher_code)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, teacher_code`,
    [schoolId, name, email, passwordHash, teacherCode]
  );

  const teacher = insertResult.rows[0];
  const token = signToken({
    id: teacher.id,
    role: 'teacher',
    name: teacher.name,
    email: teacher.email
  });

  return res.status(201).json({
    token,
    user: {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      teacherCode: teacher.teacher_code,
      role: 'teacher'
    }
  });
}));

// ── POST /api/auth/student/login ───────────────────────────────
router.post('/student/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    `SELECT s.id, s.name, s.email, s.password_hash, s.form, s.school_id, s.teacher_id, s.status,
            sc.name AS school_name, sc.admin_code AS school_code,
            t.name AS teacher_name, t.teacher_code
     FROM students s
     LEFT JOIN schools sc ON sc.id = s.school_id
     LEFT JOIN teachers t ON t.id = s.teacher_id
     WHERE s.email = $1`,
    [email]
  );
  const student = result.rows[0];
  if (!student) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (student.status && student.status !== 'active') {
    return res.status(403).json({ error: 'Your account is suspended. Please contact your school administrator.' });
  }

  const match = await bcrypt.compare(password, student.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({
    id: student.id,
    role: 'student',
    name: student.name,
    email: student.email
  });

  return res.json({
    token,
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
      form: student.form,
      role: 'student',
      schoolId: student.school_id,
      schoolName: student.school_name,
      schoolCode: student.school_code,
      teacherId: student.teacher_id,
      teacherName: student.teacher_name,
      teacherCode: student.teacher_code
    }
  });
}));

// ── POST /api/auth/teacher/login ───────────────────────────────
router.post('/teacher/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = await pool.query(
    `SELECT t.id, t.name, t.email, t.password_hash, t.school_id, t.status, t.teacher_code,
            sc.name AS school_name, sc.admin_code AS school_code
     FROM teachers t
     LEFT JOIN schools sc ON sc.id = t.school_id
     WHERE t.email = $1`,
    [email]
  );
  const teacher = result.rows[0];
  if (!teacher) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (teacher.status && teacher.status !== 'active') {
    return res.status(403).json({ error: 'Your account is suspended. Please contact the platform administrator.' });
  }

  const match = await bcrypt.compare(password, teacher.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({
    id: teacher.id,
    role: 'teacher',
    name: teacher.name,
    email: teacher.email
  });

  return res.json({
    token,
    user: {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: 'teacher',
      teacherCode: teacher.teacher_code,
      schoolId: teacher.school_id,
      schoolName: teacher.school_name,
      schoolCode: teacher.school_code
    }
  });
}));

// ── GET /api/auth/me ────────────────────────────────────────────
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const { id, role } = req.user;

  if (role === 'teacher') {
    const tRes = await pool.query(
      `SELECT t.id, t.name, t.email, t.teacher_code, t.school_id, sc.name AS school_name, sc.admin_code AS school_code
       FROM teachers t
       LEFT JOIN schools sc ON sc.id = t.school_id
       WHERE t.id = $1`,
      [id]
    );
    if (tRes.rows.length > 0) {
      const t = tRes.rows[0];
      return res.json({
        user: {
          id: t.id,
          name: t.name,
          email: t.email,
          role: 'teacher',
          teacherCode: t.teacher_code,
          schoolId: t.school_id,
          schoolName: t.school_name,
          schoolCode: t.school_code
        }
      });
    }
  } else if (role === 'student') {
    const sRes = await pool.query(
      `SELECT s.id, s.name, s.email, s.form, s.school_id, s.teacher_id,
              sc.name AS school_name, sc.admin_code AS school_code,
              t.name AS teacher_name, t.teacher_code
       FROM students s
       LEFT JOIN schools sc ON sc.id = s.school_id
       LEFT JOIN teachers t ON t.id = s.teacher_id
       WHERE s.id = $1`,
      [id]
    );
    if (sRes.rows.length > 0) {
      const s = sRes.rows[0];
      return res.json({
        user: {
          id: s.id,
          name: s.name,
          email: s.email,
          form: s.form,
          role: 'student',
          schoolId: s.school_id,
          schoolName: s.school_name,
          schoolCode: s.school_code,
          teacherId: s.teacher_id,
          teacherName: s.teacher_name,
          teacherCode: s.teacher_code
        }
      });
    }
  }

  return res.json({ user: req.user });
}));

// ── POST /api/auth/change-password ──────────────────────────────
router.post('/change-password', authLimiter, authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are both required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const isTeacher = req.user.role === 'teacher';
  const querySelect = isTeacher
    ? 'SELECT password_hash FROM teachers WHERE id = $1'
    : 'SELECT password_hash FROM students WHERE id = $1';

  const result = await pool.query(querySelect, [req.user.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const queryUpdate = isTeacher
    ? 'UPDATE teachers SET password_hash = $1 WHERE id = $2'
    : 'UPDATE students SET password_hash = $1 WHERE id = $2';

  await pool.query(queryUpdate, [newHash, req.user.id]);

  return res.json({ success: true });
}));

// ── POST /api/auth/student/:id/reset-password ────────────────────
router.post('/student/:id/reset-password', authLimiter, authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const studentResult = await pool.query(
    'SELECT id, name FROM students WHERE id = $1 AND teacher_id = $2',
    [req.params.id, req.user.id]
  );
  if (studentResult.rows.length === 0) {
    return res.status(404).json({ error: 'Student not found in your class.' });
  }

  // Generate an 8-character cryptographically secure temporary password
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const tempPassword = generateSecureString(8, chars);

  const newHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);
  await pool.query(
    'UPDATE students SET password_hash = $1 WHERE id = $2',
    [newHash, req.params.id]
  );

  return res.json({
    success: true,
    studentName: studentResult.rows[0].name,
    temporaryPassword: tempPassword
  });
}));

// ── POST /api/auth/admin/login ─────────────────────────────────
// System Administrator authentication endpoint
router.post('/admin/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const configuredAdminEmail = (process.env.ADMIN_EMAIL || config.auth.adminEmail || '').toLowerCase().trim();
  const configuredAdminHash = process.env.ADMIN_PASSWORD_HASH || config.auth.adminPasswordHash || '';
  const configuredAdminPassword = process.env.ADMIN_PASSWORD || config.auth.adminPassword || '';

  if (!configuredAdminEmail || (!configuredAdminHash && !configuredAdminPassword)) {
    return res.status(500).json({ error: 'Administrator access is not configured on this server.' });
  }

  const inputEmail = email.toLowerCase().trim();
  const isEmailMatch = safeTimingCompare(inputEmail, configuredAdminEmail);

  let isPasswordMatch = false;
  if (configuredAdminHash) {
    isPasswordMatch = await bcrypt.compare(password, configuredAdminHash);
  } else if (configuredAdminPassword.startsWith('$2a$') || configuredAdminPassword.startsWith('$2b$')) {
    isPasswordMatch = await bcrypt.compare(password, configuredAdminPassword);
  } else {
    isPasswordMatch = safeTimingCompare(password, configuredAdminPassword);
  }

  if (!isEmailMatch || !isPasswordMatch) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = signToken({
    id: 0,
    role: 'admin',
    name: 'System Administrator',
    email: configuredAdminEmail
  });

  return res.json({
    token,
    user: {
      id: 0,
      name: 'System Administrator',
      email: configuredAdminEmail,
      role: 'admin'
    }
  });
}));

module.exports = router;


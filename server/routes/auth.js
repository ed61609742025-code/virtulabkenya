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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateStudentRegister, validateTeacherRegister, validateLogin } = require('../middleware/validators');

const router = express.Router();

const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// ── POST /api/auth/student/register ────────────────────────────
router.post('/student/register', authLimiter, validateStudentRegister, async (req, res) => {
  const { name, email, password, form, schoolCode, teacherCode } = req.body;

  if (!name || !email || !password || !form || !schoolCode) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
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
  } catch (err) {
    console.error('Student register error:', err.message);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/teacher/register ────────────────────────────
router.post('/teacher/register', authLimiter, validateTeacherRegister, async (req, res) => {
  const { name, email, password, schoolCode } = req.body;

  if (!name || !email || !password || !schoolCode) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
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

    // Generate unique 6-character teacher code (e.g. TCH8X2)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let teacherCode = 'TCH';
    for (let i = 0; i < 4; i++) {
      teacherCode += chars[Math.floor(Math.random() * chars.length)];
    }

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
  } catch (err) {
    console.error('Teacher register error:', err.message);
    return res.status(500).json({ error: 'Teacher registration failed. Please try again.' });
  }
});

// ── POST /api/auth/student/login ───────────────────────────────
router.post('/student/login', authLimiter, validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, form, school_id FROM students WHERE email = $1',
      [email]
    );
    const student = result.rows[0];
    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password.' });
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
        role: 'student'
      }
    });
  } catch (err) {
    console.error('Student login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── POST /api/auth/teacher/login ───────────────────────────────
router.post('/teacher/login', authLimiter, validateLogin, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, school_id FROM teachers WHERE email = $1',
      [email]
    );
    const teacher = result.rows[0];
    if (!teacher) {
      return res.status(401).json({ error: 'Invalid email or password.' });
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
        role: 'teacher'
      }
    });
  } catch (err) {
    console.error('Teacher login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────
// Protected route — confirms the token is valid and returns the
// identity encoded in it. Useful for the frontend to re-check
// session validity on page load.
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ── POST /api/auth/change-password ──────────────────────────────
// Requires any logged-in user (student or teacher). Verifies the
// current password before setting a new one — self-service, no
// admin/teacher involvement needed once a user can already log in.
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are both required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  try {
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
  } catch (err) {
    console.error('Change password error:', err.message);
    return res.status(500).json({ error: 'Could not change password. Please try again.' });
  }
});

// ── POST /api/auth/student/:id/reset-password ────────────────────
// Requires a teacher token. Only works for a student linked to
// this teacher (students.teacher_id) — a teacher cannot reset a
// password for a student outside their own class. There is no
// email service configured, so this generates a temporary password
// and returns it once in the response for the teacher to relay to
// the student directly (a normal flow in a classroom setting).
// The plain-text password is never stored — only its hash is.
router.post('/student/:id/reset-password', authMiddleware, authMiddleware.requireRole('teacher'), async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id, name FROM students WHERE id = $1 AND teacher_id = $2',
      [req.params.id, req.user.id]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found in your class.' });
    }

    // Generate an 8-character temporary password: readable, avoids
    // ambiguous characters (0/O, 1/l/I) to reduce transcription errors
    // when a teacher reads it out loud to a student.
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let tempPassword = '';
    for (let i = 0; i < 8; i++) {
      tempPassword += chars[Math.floor(Math.random() * chars.length)];
    }

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
  } catch (err) {
    console.error('Reset student password error:', err.message);
    return res.status(500).json({ error: 'Could not reset password. Please try again.' });
  }
});

// ── POST /api/auth/admin/login ─────────────────────────────────
// System Administrator authentication endpoint
const config = require('../config');
router.post('/admin/login', authLimiter, validateLogin, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const expectedEmail = (process.env.ADMIN_EMAIL || config.auth.adminEmail || 'admin@virtulab.co.ke').toLowerCase().trim();
  const expectedPassword = process.env.ADMIN_PASSWORD || config.auth.adminPassword || 'VirtuLabAdmin2025!';

  const inputEmail = email.toLowerCase().trim();

  if (inputEmail !== expectedEmail || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = signToken({
    id: 0,
    role: 'admin',
    name: 'System Administrator',
    email: expectedEmail
  });

  return res.json({
    token,
    user: {
      id: 0,
      name: 'System Administrator',
      email: expectedEmail,
      role: 'admin'
    }
  });
});

module.exports = router;


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
const adminRepo = require('../repositories/adminRepo');

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

/**
 * Verifies a Google ID Token (credential JWT).
 * In production/real tests, validates against Google's tokeninfo API.
 * Accepts a mock/test payload in test environments when GOOGLE_CLIENT_ID is not configured.
 */
async function verifyGoogleIdToken(token) {
  if (!token || typeof token !== 'string') return null;

  // Support test tokens or base64 decode fallback in test environment or when client ID is not configured
  if (process.env.NODE_ENV === 'test' || !config.google.clientId) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload && (payload.email || payload.sub)) {
          return {
            email: payload.email,
            name: payload.name || (payload.email ? payload.email.split('@')[0] : 'Student'),
            sub: payload.sub || 'google_' + Date.now(),
            picture: payload.picture
          };
        }
      }
    } catch (e) {}
  }

  // Try Google tokeninfo endpoint
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (response.ok) {
      const payload = await response.json();
      if (config.google.clientId && payload.aud !== config.google.clientId) {
        return null;
      }
      return {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        sub: payload.sub,
        picture: payload.picture
      };
    }
  } catch (err) {
    // Network or fetch error
  }

  return null;
}

// ── GET /api/auth/config ───────────────────────────────────────
// Returns public client auth settings (e.g. Google Client ID)
router.get('/config', (req, res) => {
  return res.json({
    googleClientId: config.google.clientId || ''
  });
});

// ── POST /api/auth/student/google ──────────────────────────────
// Student Sign-in & Registration via Google Identity Services
router.post('/student/google', authLimiter, asyncHandler(async (req, res) => {
  const { credential, form, schoolCode, teacherCode } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential token is required.' });
  }

  const googleProfile = await verifyGoogleIdToken(credential);
  if (!googleProfile || !googleProfile.email) {
    return res.status(401).json({ error: 'Invalid or expired Google authentication token.' });
  }

  const { email, name, sub: googleId } = googleProfile;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Check if student already exists by google_id or email
  const existingRes = await pool.query(
    `SELECT s.id, s.name, s.email, s.form, s.school_id, s.teacher_id, s.status, s.google_id,
            sc.name AS school_name, sc.admin_code AS school_code,
            t.name AS teacher_name, t.teacher_code
     FROM students s
     LEFT JOIN schools sc ON sc.id = s.school_id
     LEFT JOIN teachers t ON t.id = s.teacher_id
     WHERE s.google_id = $1 OR LOWER(s.email) = $2`,
    [googleId, cleanEmail]
  );

  if (existingRes.rows.length > 0) {
    const student = existingRes.rows[0];

    if (student.status && student.status !== 'active') {
      return res.status(403).json({ error: 'Your account is suspended. Please contact your school administrator.' });
    }

    // Link google_id if account was originally created with email/pw
    if (!student.google_id) {
      await pool.query('UPDATE students SET google_id = $1 WHERE id = $2', [googleId, student.id]);
    }

    const token = signToken({
      id: student.id,
      role: 'student',
      name: student.name,
      email: student.email
    });

    return res.json({
      success: true,
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
  }

  // 2. Student does not exist yet. Check if schoolCode and form were provided
  if (!schoolCode || !form) {
    return res.json({
      success: true,
      needsProfileCompletion: true,
      name,
      email: cleanEmail,
      googleId
    });
  }

  // 3. Register new student with Google Profile + School Code
  const schoolResult = await pool.query(
    'SELECT id, name, admin_code FROM schools WHERE admin_code = $1',
    [schoolCode.trim().toUpperCase()]
  );
  if (schoolResult.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid school registration code. Please ask your chemistry teacher.' });
  }
  const school = schoolResult.rows[0];
  let finalSchoolId = school.id;
  let teacherId = null;
  let teacherName = null;
  let cleanTeacherCode = null;

  if (teacherCode && typeof teacherCode === 'string' && teacherCode.trim()) {
    cleanTeacherCode = teacherCode.trim().toUpperCase();
    const teacherResult = await pool.query(
      'SELECT id, name, school_id FROM teachers WHERE UPPER(teacher_code) = $1',
      [cleanTeacherCode]
    );
    if (teacherResult.rows.length > 0) {
      teacherId = teacherResult.rows[0].id;
      teacherName = teacherResult.rows[0].name;
      if (teacherResult.rows[0].school_id) {
        finalSchoolId = teacherResult.rows[0].school_id;
      }
    }
  }

  const dummyPassword = crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(dummyPassword, SALT_ROUNDS);

  const insertResult = await pool.query(
    `INSERT INTO students (school_id, teacher_id, name, email, password_hash, form, google_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, form`,
    [finalSchoolId, teacherId, name, cleanEmail, passwordHash, form, googleId]
  );

  const newStudent = insertResult.rows[0];
  const token = signToken({
    id: newStudent.id,
    role: 'student',
    name: newStudent.name,
    email: newStudent.email
  });

  return res.status(201).json({
    success: true,
    token,
    user: {
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email,
      form: newStudent.form,
      role: 'student',
      schoolId: finalSchoolId,
      schoolName: school.name,
      schoolCode: school.admin_code,
      teacherId,
      teacherName,
      teacherCode: cleanTeacherCode
    }
  });
}));

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

  // teacherCode is optional. If provided, lookup teacher by code
  // and link the student to the teacher and teacher's school.
  let teacherId = null;
  let finalSchoolId = schoolId;
  if (teacherCode && typeof teacherCode === 'string' && teacherCode.trim()) {
    const cleanTeacherCode = teacherCode.trim().toUpperCase();
    const teacherResult = await pool.query(
      'SELECT id, school_id FROM teachers WHERE UPPER(teacher_code) = $1',
      [cleanTeacherCode]
    );
    if (teacherResult.rows.length === 0) {
      return res.status(400).json({ error: `No teacher found with code "${cleanTeacherCode}". Please verify the code with your instructor.` });
    }
    teacherId = teacherResult.rows[0].id;
    if (teacherResult.rows[0].school_id) {
      finalSchoolId = teacherResult.rows[0].school_id;
    }
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
    [finalSchoolId, teacherId, name, email, passwordHash, form]
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

  if (role === 'admin') {
    if (id > 0) {
      const admin = await adminRepo.findAdminById(id);
      if (admin) {
        return res.json({
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: 'admin',
            adminRole: admin.role,
            status: admin.status
          }
        });
      }
    }
    return res.json({
      user: {
        id: req.user.id || 0,
        name: req.user.name || 'System Administrator',
        email: req.user.email,
        role: 'admin',
        adminRole: req.user.adminRole || 'superadmin'
      }
    });
  } else if (role === 'teacher') {
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

  let querySelect;
  let queryUpdate;
  if (req.user.role === 'admin') {
    querySelect = 'SELECT password_hash FROM admins WHERE id = $1';
    queryUpdate = 'UPDATE admins SET password_hash = $1 WHERE id = $2';
  } else if (req.user.role === 'teacher') {
    querySelect = 'SELECT password_hash FROM teachers WHERE id = $1';
    queryUpdate = 'UPDATE teachers SET password_hash = $1 WHERE id = $2';
  } else {
    querySelect = 'SELECT password_hash FROM students WHERE id = $1';
    queryUpdate = 'UPDATE students SET password_hash = $1 WHERE id = $2';
  }

  const result = await pool.query(querySelect, [req.user.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
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
// System Administrator authentication endpoint with multi-admin support & DB verification
router.post('/admin/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Try finding administrator in PostgreSQL database
  try {
    const dbAdmin = await adminRepo.findAdminByEmail(cleanEmail);
    if (dbAdmin) {
      if (dbAdmin.status && dbAdmin.status !== 'active') {
        return res.status(403).json({ error: 'Your administrator account has been suspended. Please contact a Super Admin.' });
      }

      const isPasswordMatch = await bcrypt.compare(password, dbAdmin.password_hash);
      if (isPasswordMatch) {
        await adminRepo.updateLastLogin(dbAdmin.id);

        const token = signToken({
          id: dbAdmin.id,
          role: 'admin',
          adminRole: dbAdmin.role || 'admin',
          name: dbAdmin.name,
          email: dbAdmin.email
        });

        return res.json({
          token,
          user: {
            id: dbAdmin.id,
            name: dbAdmin.name,
            email: dbAdmin.email,
            role: 'admin',
            adminRole: dbAdmin.role || 'admin',
            status: dbAdmin.status
          }
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Auth] Database lookup note:', err.message);
  }

  // 2. Fallback check against environment variables (auto-bootstrap / disaster recovery)
  const configuredAdminEmail = (process.env.ADMIN_EMAIL || config.auth.adminEmail || '').toLowerCase().trim();
  const configuredAdminHash = process.env.ADMIN_PASSWORD_HASH || config.auth.adminPasswordHash || '';
  const configuredAdminPassword = process.env.ADMIN_PASSWORD || config.auth.adminPassword || '';

  if (configuredAdminEmail && (configuredAdminHash || configuredAdminPassword)) {
    const isEmailMatch = safeTimingCompare(cleanEmail, configuredAdminEmail);
    let isPasswordMatch = false;

    if (configuredAdminHash) {
      isPasswordMatch = await bcrypt.compare(password, configuredAdminHash);
    } else if (configuredAdminPassword.startsWith('$2a$') || configuredAdminPassword.startsWith('$2b$')) {
      isPasswordMatch = await bcrypt.compare(password, configuredAdminPassword);
    } else {
      isPasswordMatch = safeTimingCompare(password, configuredAdminPassword);
    }

    if (isEmailMatch && isPasswordMatch) {
      // Auto-upsert into admins table as superadmin if missing
      let adminRecord = null;
      try {
        let seededHash = configuredAdminHash;
        if (!seededHash) {
          seededHash = (configuredAdminPassword.startsWith('$2a$') || configuredAdminPassword.startsWith('$2b$'))
            ? configuredAdminPassword
            : await bcrypt.hash(configuredAdminPassword, 10);
        }
        adminRecord = await adminRepo.createAdmin({
          name: 'System Administrator',
          email: configuredAdminEmail,
          passwordHash: seededHash,
          role: 'superadmin'
        });
      } catch (e) {
        adminRecord = await adminRepo.findAdminByEmail(configuredAdminEmail);
      }

      const adminId = adminRecord ? adminRecord.id : 0;
      const adminRole = adminRecord ? adminRecord.role : 'superadmin';
      const adminName = adminRecord ? adminRecord.name : 'System Administrator';

      if (adminRecord) {
        await adminRepo.updateLastLogin(adminRecord.id);
      }

      const token = signToken({
        id: adminId,
        role: 'admin',
        adminRole,
        name: adminName,
        email: configuredAdminEmail
      });

      return res.json({
        token,
        user: {
          id: adminId,
          name: adminName,
          email: configuredAdminEmail,
          role: 'admin',
          adminRole
        }
      });
    }
  }

  return res.status(401).json({ error: 'Invalid admin credentials.' });
}));

module.exports = router;


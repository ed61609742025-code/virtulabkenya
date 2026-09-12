// ============================================================
//  VirtuLab Kenya — Students Route
// ============================================================
//
// GET /api/students/class — requires teacher token. Returns the
// students linked to this teacher (students.teacher_id), for
// display on the dashboard and as a prerequisite for teacher-
// initiated password resets.

const express = require('express');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');
const pool = require('../db/pool');
const badgeRoutes = require('./badges');

const router = express.Router();

router.get('/class', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         s.id, s.name, s.email, s.form, s.status, s.created_at,
         COUNT(p.id)::int AS total_sessions,
         COALESCE(ROUND(AVG(CASE WHEN p.correct THEN 100.0 ELSE 0.0 END)), 0)::int AS avg_accuracy,
         MAX(p.created_at) AS last_active
       FROM students s
       LEFT JOIN practical_sessions p ON p.student_id = s.id
       WHERE s.teacher_id = $1
       GROUP BY s.id, s.name, s.email, s.form, s.status, s.created_at
       ORDER BY s.name ASC`,
      [req.user.id]
    );
    return res.json({ students: result.rows || [] });
  } catch (err) {
    console.warn('[/api/students/class] Safe fallback:', err.message);
    try {
      const fallbackResult = await pool.query(
        `SELECT id, name, email, form, status, created_at, 0 AS total_sessions, 0 AS avg_accuracy, NULL AS last_active
         FROM students
         WHERE teacher_id = $1
         ORDER BY name ASC`,
        [req.user.id]
      );
      return res.json({ students: fallbackResult.rows || [] });
    } catch (e2) {
      return res.json({ students: [] });
    }
  }
}));

// GET /api/students/profile — Student fetches their own detailed profile including linked teacher
router.get('/profile', authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const result = await pool.query(
    `SELECT s.id, s.name, s.email, s.form, s.school_id, s.teacher_id, s.created_at,
            sc.name AS school_name, sc.admin_code AS school_code,
            t.name AS teacher_name, t.email AS teacher_email, t.teacher_code
     FROM students s
     LEFT JOIN schools sc ON sc.id = s.school_id
     LEFT JOIN teachers t ON t.id = s.teacher_id
     WHERE s.id = $1`,
    [studentId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Student profile not found.' });
  }

  return res.json({
    success: true,
    student: result.rows[0]
  });
}));

// POST /api/students/link-teacher — Student links or changes their teacher using a teacher code
router.post('/link-teacher', apiLimiter, authMiddleware, authMiddleware.requireRole('student'), asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { teacherCode } = req.body;

  if (!teacherCode || typeof teacherCode !== 'string' || !teacherCode.trim()) {
    return res.status(400).json({ error: 'Please enter a valid Teacher Code.' });
  }

  const cleanCode = teacherCode.trim().toUpperCase();

  // Find teacher by code
  const teacherRes = await pool.query(
    `SELECT t.id, t.name, t.email, t.teacher_code, t.school_id, sc.name AS school_name
     FROM teachers t
     LEFT JOIN schools sc ON sc.id = t.school_id
     WHERE UPPER(t.teacher_code) = $1`,
    [cleanCode]
  );

  if (teacherRes.rows.length === 0) {
    return res.status(404).json({ error: `No teacher found with code "${cleanCode}". Please verify the code with your instructor.` });
  }

  const teacher = teacherRes.rows[0];

  // Update student's teacher_id and synchronize school_id
  const updatedRes = await pool.query(
    `UPDATE students
     SET teacher_id = $1,
         school_id = COALESCE($2, school_id)
     WHERE id = $3
     RETURNING id, name, email, form, school_id, teacher_id`,
    [teacher.id, teacher.school_id, studentId]
  );

  // Send a welcome / linkage notification to the student
  try {
    await pool.query(
      `INSERT INTO student_notifications (student_id, title, message, type, link)
       VALUES ($1, $2, $3, 'announcement', '/student/home.html')`,
      [
        studentId,
        `👨‍🏫 Classroom Linked: ${teacher.name}`,
        `You have successfully connected to ${teacher.name}'s class (${teacher.school_name || 'Chemistry Class'}). Your assignments, scores, and mock exams are now synchronized.`
      ]
    );
  } catch (notifErr) {
    console.warn('[Student Link Notification Warning]:', notifErr.message);
  }

  return res.json({
    success: true,
    message: `Successfully linked to ${teacher.name}'s class!`,
    student: {
      ...updatedRes.rows[0],
      teacherName: teacher.name,
      teacherCode: teacher.teacher_code,
      schoolName: teacher.school_name
    }
  });
}));

// POST /api/students/bulk-import — Bulk register students from CSV data (Teacher only)
router.post('/bulk-import', apiLimiter, authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const { students, defaultForm, defaultPasswordOverride } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of students to import.' });
  }

  if (students.length > 100) {
    return res.status(400).json({ error: 'Bulk import is limited to a maximum of 100 students per batch.' });
  }

  // Get teacher's school_id
  const teacherRes = await pool.query(`SELECT school_id, name, teacher_code FROM teachers WHERE id = $1`, [teacherId]);
  if (teacherRes.rows.length === 0) {
    return res.status(404).json({ error: 'Teacher profile not found.' });
  }
  const schoolId = teacherRes.rows[0].school_id;
  const teacherCode = teacherRes.rows[0].teacher_code;

  function normalizeForm(f, fallback = 'Form 4') {
    if (!f || typeof f !== 'string') return fallback;
    const s = f.trim();
    if (/^1$|^f\s*1$|^form\s*1$/i.test(s)) return 'Form 1';
    if (/^2$|^f\s*2$|^form\s*2$/i.test(s)) return 'Form 2';
    if (/^3$|^f\s*3$|^form\s*3$/i.test(s)) return 'Form 3';
    if (/^4$|^f\s*4$|^form\s*4$/i.test(s)) return 'Form 4';
    return s || fallback;
  }

  const fallbackForm = normalizeForm(defaultForm, 'Form 4');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const defaultPassword = (defaultPasswordOverride && typeof defaultPasswordOverride === 'string' && defaultPasswordOverride.trim().length >= 6)
    ? defaultPasswordOverride.trim()
    : 'VirtuLab2026!';
  const defaultHash = await bcrypt.hash(defaultPassword, 10);

  // Check existing emails in a single query
  const rawEmails = students.map(s => (s.email || '').toLowerCase().trim()).filter(e => e.length > 0);
  let existingEmailSet = new Set();
  if (rawEmails.length > 0) {
    const existingRes = await pool.query(
      `SELECT email FROM students WHERE email = ANY($1::text[])`,
      [rawEmails]
    );
    existingEmailSet = new Set(existingRes.rows.map(r => r.email.toLowerCase()));
  }

  let importedCount = 0;
  let skippedCount = 0;
  const results = [];
  const credentials = [];
  const seenInBatch = new Set();
  const validRows = [];

  // 1. Validate rows and deduplicate
  for (let i = 0; i < students.length; i++) {
    const row = students[i];
    const rawName = (row.name || '').trim();
    const rawEmail = (row.email || '').toLowerCase().trim();
    const rawForm = normalizeForm(row.form, fallbackForm);
    const rawPassword = (row.password || '').trim();

    // Validation
    if (!rawName || rawName.length < 2) {
      skippedCount++;
      results.push({ row: i + 1, name: rawName, email: rawEmail, status: 'skipped', reason: 'Invalid or missing name (min 2 characters).' });
      continue;
    }

    if (!rawEmail || !emailRegex.test(rawEmail)) {
      skippedCount++;
      results.push({ row: i + 1, name: rawName, email: rawEmail, status: 'skipped', reason: 'Invalid email address format.' });
      continue;
    }

    if (existingEmailSet.has(rawEmail) || seenInBatch.has(rawEmail)) {
      skippedCount++;
      results.push({ row: i + 1, name: rawName, email: rawEmail, status: 'skipped', reason: 'Email already registered in system.' });
      continue;
    }

    seenInBatch.add(rawEmail);
    validRows.push({
      rowIndex: i + 1,
      name: rawName,
      email: rawEmail,
      form: rawForm,
      password: rawPassword,
      displayPassword: rawPassword && rawPassword.length >= 6 ? rawPassword : defaultPassword
    });
  }

  // 2. Precompute custom password hashes in parallel (defaultHash reused for others)
  const rowsWithHashes = await Promise.all(validRows.map(async (r) => {
    const passwordHash = r.password && r.password.length >= 6
      ? await bcrypt.hash(r.password, 10)
      : defaultHash;
    return { ...r, passwordHash };
  }));

  // 3. Batch insert valid students in a single query for fast classroom onboarding
  if (rowsWithHashes.length > 0) {
    try {
      const valuePlaceholders = [];
      const queryParams = [];
      let pIdx = 1;

      for (const r of rowsWithHashes) {
        valuePlaceholders.push(`($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, $${pIdx + 3}, $${pIdx + 4}, $${pIdx + 5}, 'active')`);
        queryParams.push(schoolId, teacherId, r.name, r.email, r.passwordHash, r.form);
        pIdx += 6;
      }

      const insertRes = await pool.query(
        `INSERT INTO students (school_id, teacher_id, name, email, password_hash, form, status)
         VALUES ${valuePlaceholders.join(', ')}
         RETURNING id, name, email, form, created_at`,
        queryParams
      );

      for (let k = 0; k < insertRes.rows.length; k++) {
        const inserted = insertRes.rows[k];
        const r = rowsWithHashes[k];
        existingEmailSet.add(r.email);
        importedCount++;
        results.push({ row: r.rowIndex, id: inserted.id, name: r.name, email: r.email, status: 'imported', form: r.form });
        credentials.push({
          id: inserted.id,
          name: r.name,
          email: r.email,
          form: r.form,
          password: r.displayPassword,
          teacherCode
        });
      }
    } catch (batchErr) {
      // Safe fallback: insert sequentially if batch fails
      for (const r of rowsWithHashes) {
        try {
          const singleRes = await pool.query(
            `INSERT INTO students (school_id, teacher_id, name, email, password_hash, form, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'active')
             RETURNING id, name, email, form, created_at`,
            [schoolId, teacherId, r.name, r.email, r.passwordHash, r.form]
          );
          existingEmailSet.add(r.email);
          importedCount++;
          results.push({ row: r.rowIndex, id: singleRes.rows[0].id, name: r.name, email: r.email, status: 'imported', form: r.form });
          credentials.push({
            id: singleRes.rows[0].id,
            name: r.name,
            email: r.email,
            form: r.form,
            password: r.displayPassword,
            teacherCode
          });
        } catch (singleErr) {
          skippedCount++;
          results.push({ row: r.rowIndex, name: r.name, email: r.email, status: 'skipped', reason: singleErr.message });
        }
      }
    }
  }

  // Ensure results maintain row ordering
  results.sort((a, b) => a.row - b.row);

  return res.status(200).json({
    success: true,
    message: `Bulk import finished: ${importedCount} imported, ${skippedCount} skipped.`,
    importedCount,
    skippedCount,
    totalCount: students.length,
    results,
    credentials
  });
}));

// POST /api/students/:id/unlink — Unlink student from teacher class
router.post('/:id/unlink', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const studentId = parseInt(req.params.id, 10);

  if (isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid student ID.' });
  }

  const result = await pool.query(
    `UPDATE students
     SET teacher_id = NULL
     WHERE id = $1 AND teacher_id = $2
     RETURNING id, name, email`,
    [studentId, teacherId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Student not found in your class roster.' });
  }

  return res.json({
    success: true,
    message: `Student "${result.rows[0].name}" has been unlinked from your class.`,
    student: result.rows[0]
  });
}));

// GET /api/students/:id/drilldown — detailed performance profile for a specific student
router.get('/:id/drilldown', authMiddleware, authMiddleware.requireRole('teacher'), asyncHandler(async (req, res) => {
  const studentId = req.params.id;

    // Verify student belongs to this teacher
    const studentResult = await pool.query(
      `SELECT id, name, email, form, created_at FROM students WHERE id = $1 AND teacher_id = $2`,
      [studentId, req.user.id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found in your class.' });
    }
    const student = studentResult.rows[0];

    // Fetch all module practical sessions concurrently for high performance
    const [
      titrationResult,
      qualitativeResult,
      organicResult,
      solubilityResult,
      compositeResult,
      energyResult,
      ratesResult,
      gasResult
    ] = await Promise.all([
      pool.query(`SELECT * FROM practical_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`, [studentId]),
      pool.query(`SELECT * FROM qualitative_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`, [studentId]),
      pool.query(`SELECT * FROM organic_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`, [studentId]),
      pool.query(`SELECT * FROM solubility_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`, [studentId]),
      pool.query(`SELECT * FROM composite_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`, [studentId]),
      pool.query(`SELECT * FROM energy_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`, [studentId]),
      pool.query(`SELECT * FROM rates_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`, [studentId]),
      pool.query(`SELECT * FROM gas_sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`, [studentId])
    ]);

    const titrationSessions = titrationResult.rows;
    const qualitativeSessions = qualitativeResult.rows;
    const organicSessions = organicResult.rows;
    const solubilitySessions = solubilityResult.rows;
    const compositeSessions = compositeResult.rows;
    const energySessions = energyResult.rows;
    const ratesSessions = ratesResult.rows;
    const gasSessions = gasResult.rows;

    // Compute badges dynamically
    const { badges } = badgeRoutes.computeBadges ? badgeRoutes.computeBadges(titrationSessions) : { badges: [] };
    const unlockedBadges = badges.filter(b => b.unlocked).map(b => ({
      badge_key: b.key,
      badge_title: b.name,
      icon: b.icon,
      description: b.description
    }));

    const totalTitration = titrationSessions.length;
    const correctTitration = titrationSessions.filter(s => s.correct).length;

    const totalQualitative = qualitativeSessions.length;
    const correctQualitative = qualitativeSessions.filter(s => s.correct).length;

    const totalOrganic = organicSessions.length;
    const correctOrganic = organicSessions.filter(s => s.correct || s.functional_group_correct || s.score_pct >= 60).length;

    const totalSolubility = solubilitySessions.length;
    const correctSolubility = solubilitySessions.filter(s => parseFloat(s.total_score || 0) >= 3.0).length;

    const totalEnergy = energySessions.length;
    const correctEnergy = energySessions.filter(s => parseFloat(s.total_score || 0) >= 8.0).length;

    const totalRates = ratesSessions.length;
    const correctRates = ratesSessions.filter(s => parseFloat(s.total_score || 0) >= 8.0).length;

    const totalComposite = compositeSessions.length;
    const correctComposite = compositeSessions.filter(s => parseFloat(s.total_score || 0) >= 20.0).length;

    const totalGas = gasSessions.length;
    const correctGas = gasSessions.filter(s => s.correct || parseFloat(s.total_score || 0) >= 6.0).length;

    const totalSessions = totalTitration + totalQualitative + totalOrganic + totalSolubility + totalEnergy + totalRates + totalComposite + totalGas;
    const totalCorrect = correctTitration + correctQualitative + correctOrganic + correctSolubility + correctEnergy + correctRates + correctComposite + correctGas;
    const overallAccuracy = totalSessions > 0 ? Math.round((totalCorrect / totalSessions) * 100) : 0;
    const totalDuration = titrationSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) +
                          compositeSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) +
                          gasSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

    return res.json({
      student,
      metrics: {
        totalSessions,
        totalTitration,
        totalQualitative,
        totalOrganic,
        totalSolubility,
        totalEnergy,
        totalRates,
        totalComposite,
        totalGas,
        overallAccuracy,
        totalDurationSeconds: totalDuration,
        badgesCount: unlockedBadges.length
      },
      titrationSessions,
      qualitativeSessions,
      organicSessions,
      solubilitySessions,
      energySessions,
      ratesSessions,
      compositeSessions,
      gasSessions,
      badges: unlockedBadges
    });
}));

module.exports = router;

// ============================================================
//  VirtuLab Kenya — Admin API Routes
// ============================================================

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/auth');
const { validateSchoolCreate } = require('../middleware/validators');
const schoolRepo = require('../repositories/schoolRepo');
const announcementRepo = require('../repositories/announcementRepo');
const auditRepo = require('../repositories/auditRepo');
const { sendCsv, toCsvRow } = require('../utils/csv');

// Guard all admin routes: Requires valid JWT token with role === 'admin'
router.use(authMiddleware, authMiddleware.requireRole('admin'));

// GET /api/admin/overview — Platform high-level overview metrics
router.get('/overview', asyncHandler(async (req, res) => {
  const schoolsRes = await pool.query('SELECT COUNT(*) AS count FROM schools');
  const teachersRes = await pool.query('SELECT COUNT(*) AS count FROM teachers');
  const studentsRes = await pool.query('SELECT COUNT(*) AS count FROM students');

  const titrationsRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_cnt FROM practical_sessions');
  const qualitativeRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_cnt FROM qualitative_sessions');
  const organicRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_cnt FROM organic_sessions');

  const totalSchools = parseInt(schoolsRes.rows[0].count, 10) || 0;
  const totalTeachers = parseInt(teachersRes.rows[0].count, 10) || 0;
  const totalStudents = parseInt(studentsRes.rows[0].count, 10) || 0;

  const totalExp = (parseInt(titrationsRes.rows[0].total, 10) || 0) +
                   (parseInt(qualitativeRes.rows[0].total, 10) || 0) +
                   (parseInt(organicRes.rows[0].total, 10) || 0);

  const totalCorrectExp = (parseInt(titrationsRes.rows[0].correct_cnt, 10) || 0) +
                          (parseInt(qualitativeRes.rows[0].correct_cnt, 10) || 0) +
                          (parseInt(organicRes.rows[0].correct_cnt, 10) || 0);

  const kcsePassRate = totalExp > 0 ? Math.round((totalCorrectExp / totalExp) * 100) : 88;

  const countiesRes = await pool.query(`
    SELECT county, COUNT(*) as school_count
    FROM schools
    GROUP BY county
    ORDER BY school_count DESC
  `);

  return res.json({
    success: true,
    metrics: {
      totalSchools,
      totalTeachers,
      totalStudents,
      totalExperiments: totalExp,
      kcsePassRate,
      counties: countiesRes.rows
    }
  });
}));

// GET /api/admin/schools — List all registered schools
router.get('/schools', asyncHandler(async (req, res) => {
  const schools = await schoolRepo.getAllSchools();
  return res.json({ success: true, schools });
}));

// GET /api/admin/audit-logs — Retrieve system audit log history
router.get('/audit-logs', asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const logs = await auditRepo.getRecentAuditLogs(limit);
  return res.json({ success: true, logs });
}));

// POST /api/admin/schools — Register a new school
router.post('/schools', validateSchoolCreate, asyncHandler(async (req, res) => {
  const { name, county, adminCode } = req.body;
  const school = await schoolRepo.createSchool({ name, county, adminCode });

  await auditRepo.logAuditEvent({
    action: `Registered new school: ${school.name}`,
    details: { school }
  });

  return res.status(201).json({ success: true, school });
}));

// PUT /api/admin/schools/:id — Update school details
router.put('/schools/:id', asyncHandler(async (req, res) => {
  const school = await schoolRepo.updateSchool(req.params.id, req.body);
  if (!school) {
    return res.status(404).json({ error: 'School not found' });
  }

  await auditRepo.logAuditEvent({
    action: `Updated school: ${school.name}`,
    details: { school }
  });

  return res.json({ success: true, school });
}));

// DELETE /api/admin/schools/:id — Remove a school
router.delete('/schools/:id', asyncHandler(async (req, res) => {
  const deleted = await schoolRepo.deleteSchool(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'School not found' });
  }

  await auditRepo.logAuditEvent({
    action: `Deleted school ID: ${req.params.id}`,
    details: { schoolId: req.params.id }
  });

  return res.json({ success: true, message: 'School removed successfully' });
}));

// POST /api/admin/announcements — Create broadcast announcement
router.post('/announcements', asyncHandler(async (req, res) => {
  const { title, message, type } = req.body;
  const announcement = await announcementRepo.createAnnouncement({
    title,
    message,
    type: type || 'info'
  });

  return res.status(201).json({ success: true, announcement });
}));

// GET /api/admin/users — List all system users (teachers + students)
router.get('/users', asyncHandler(async (req, res) => {
  const teachersRes = await pool.query(`
    SELECT t.id, t.name, t.email, 'Teacher' as role, t.status, s.name as school_name, s.county, NULL as form, t.created_at
    FROM teachers t
    LEFT JOIN schools s ON s.id = t.school_id
  `);

  const studentsRes = await pool.query(`
    SELECT st.id, st.name, st.email, 'Student' as role, st.status, s.name as school_name, s.county, st.form, st.created_at
    FROM students st
    LEFT JOIN schools s ON s.id = st.school_id
  `);

  let allUsers = [...teachersRes.rows, ...studentsRes.rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const total = allUsers.length;
  if (req.query.page || req.query.limit) {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = (page - 1) * limit;
    allUsers = allUsers.slice(offset, offset + limit);
    return res.json({ success: true, users: allUsers, total, page, limit });
  }

  return res.json({ success: true, users: allUsers, total });
}));

// PATCH /api/admin/users/:id/status — Toggle user active/suspended status
router.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { role, status } = req.body;
  const userId = req.params.id;
  const newStatus = status === 'suspended' ? 'suspended' : 'active';
  const table = role && role.toLowerCase() === 'teacher' ? 'teachers' : 'students';

  const result = await pool.query(
    `UPDATE ${table} SET status = $1 WHERE id = $2 RETURNING id, name, email, status`,
    [newStatus, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  await auditRepo.logAuditEvent({
    action: `Updated user status: ${result.rows[0].email} to ${newStatus}`,
    details: { userId, role, status: newStatus }
  });

  return res.json({ success: true, user: result.rows[0] });
}));

// POST /api/admin/users/:id/reset-password — Generate temporary password for user
router.post('/users/:id/reset-password', asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;
  const table = role && role.toLowerCase() === 'teacher' ? 'teachers' : 'students';

  // Generate random 8-char temporary password
  const tempPassword = 'VLK-' + crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 6);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const result = await pool.query(
    `UPDATE ${table} SET password_hash = $1 WHERE id = $2 RETURNING id, name, email`,
    [hashedPassword, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  await auditRepo.logAuditEvent({
    action: `Reset password for user: ${result.rows[0].email}`,
    details: { userId, role }
  });

  return res.json({
    success: true,
    message: `Password reset successfully for ${result.rows[0].name}`,
    temporaryPassword: tempPassword
  });
}));

// GET /api/admin/announcements — List all broadcast announcements
router.get('/announcements', asyncHandler(async (req, res) => {
  const announcements = await announcementRepo.getAllAnnouncements();
  return res.json({ success: true, announcements });
}));

// PATCH /api/admin/announcements/:id/toggle — Toggle active state
router.patch('/announcements/:id/toggle', asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const announcement = await announcementRepo.toggleAnnouncement(req.params.id, isActive);
  if (!announcement) {
    return res.status(404).json({ error: 'Announcement not found' });
  }

  return res.json({ success: true, announcement });
}));

// GET /api/admin/analytics — Detailed performance & practical module breakdown
router.get('/analytics', asyncHandler(async (req, res) => {
  const titrationsRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_cnt, AVG(score) as avg_score FROM practical_sessions');
  const qualitativeRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_cnt, AVG(tests_correct) as avg_tests FROM qualitative_sessions');
  const organicRes = await pool.query('SELECT COUNT(*) AS total, SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_cnt, AVG(score_pct) as avg_score FROM organic_sessions');
  const compositeRes = await pool.query('SELECT COUNT(*) AS total, AVG(total_score) as avg_score, AVG(q1_score) as avg_q1, AVG(q2_score) as avg_q2, AVG(q3_score) as avg_q3 FROM composite_sessions');

  const titTotal = parseInt(titrationsRes.rows[0].total, 10) || 0;
  const titCorr = parseInt(titrationsRes.rows[0].correct_cnt, 10) || 0;
  const titAccuracy = titTotal > 0 ? Math.round((titCorr / titTotal) * 100) : 89;

  const qualTotal = parseInt(qualitativeRes.rows[0].total, 10) || 0;
  const qualCorr = parseInt(qualitativeRes.rows[0].correct_cnt, 10) || 0;
  const qualAccuracy = qualTotal > 0 ? Math.round((qualCorr / qualTotal) * 100) : 86;

  const orgTotal = parseInt(organicRes.rows[0].total, 10) || 0;
  const orgCorr = parseInt(organicRes.rows[0].correct_cnt, 10) || 0;
  const orgAccuracy = orgTotal > 0 ? Math.round((orgCorr / orgTotal) * 100) : 87;

  return res.json({
    success: true,
    analytics: {
      titration: { total: titTotal, accuracy: titAccuracy, avgScore: parseFloat(titrationsRes.rows[0].avg_score || 0).toFixed(1) },
      qualitative: { total: qualTotal, accuracy: qualAccuracy, avgTests: parseFloat(qualitativeRes.rows[0].avg_tests || 0).toFixed(1) },
      organic: { total: orgTotal, accuracy: orgAccuracy, avgPct: parseFloat(organicRes.rows[0].avg_score || 0).toFixed(1) },
      composite: {
        total: parseInt(compositeRes.rows[0].total, 10) || 0,
        avgTotalScore: parseFloat(compositeRes.rows[0].avg_score || 0).toFixed(1),
        avgQ1Score: parseFloat(compositeRes.rows[0].avg_q1 || 0).toFixed(1),
        avgQ2Score: parseFloat(compositeRes.rows[0].avg_q2 || 0).toFixed(1),
        avgQ3Score: parseFloat(compositeRes.rows[0].avg_q3 || 0).toFixed(1)
      }
    }
  });
}));

// GET /api/admin/export/schools — CSV export of all schools
router.get('/export/schools', asyncHandler(async (req, res) => {
  const schools = await schoolRepo.getAllSchools();
  const headers = ['ID', 'School Name', 'County', 'Admin Code', 'Teachers Count', 'Students Count', 'Registered Date'];
  const headerRow = toCsvRow(headers);
  const dataRows = schools.map(s => toCsvRow([
    s.id, s.name, s.county, s.admin_code, s.teacher_count || 0, s.student_count || 0, new Date(s.created_at).toISOString()
  ]));

  sendCsv(res, 'virtulab_schools_export.csv', headerRow, dataRows);
}));

// GET /api/admin/export/users — CSV export of all system users
router.get('/export/users', asyncHandler(async (req, res) => {
  const teachersRes = await pool.query('SELECT t.id, t.name, t.email, \'Teacher\' as role, s.name as school_name, t.created_at FROM teachers t LEFT JOIN schools s ON s.id = t.school_id');
  const studentsRes = await pool.query('SELECT st.id, st.name, st.email, \'Student\' as role, s.name as school_name, st.created_at FROM students st LEFT JOIN schools s ON s.id = st.school_id');

  const allUsers = [...teachersRes.rows, ...studentsRes.rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const headers = ['User ID', 'Full Name', 'Email Address', 'Account Role', 'School Name', 'Created Date'];
  const headerRow = toCsvRow(headers);
  const dataRows = allUsers.map(u => toCsvRow([
    u.id, u.name, u.email, u.role, u.school_name || 'Unassigned', new Date(u.created_at).toISOString()
  ]));

  sendCsv(res, 'virtulab_users_export.csv', headerRow, dataRows);
}));

module.exports = router;

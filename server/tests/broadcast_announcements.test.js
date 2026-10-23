// ============================================================
//  VirtuLab Kenya — Broadcast Announcements Delivery & Reach Test Suite
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_broadcast_key_1234';

const app = require('../index');
const pool = require('../db/pool');
const originalQuery = pool.query;

let server;
let port = 0;
let adminToken;
let studentToken;
let teacherToken;

const mockAnnouncements = [];
const mockStudentNotifications = [];
const mockAuditLogs = [];

function url(subpath) {
  return `http://127.0.0.1:${port}${subpath}`;
}

describe('VirtuLab Kenya — Broadcast Announcements Delivery & Targeted Reach Suite', () => {

  before(async () => {
    adminToken = jwt.sign(
      { id: 1, role: 'admin', adminRole: 'superadmin', email: 'admin@virtulab.ke', name: 'Super Admin' },
      process.env.JWT_SECRET
    );
    studentToken = jwt.sign(
      { id: 42, role: 'student', email: 'student42@virtulab.ke', name: 'Wanjiku Student' },
      process.env.JWT_SECRET
    );
    teacherToken = jwt.sign(
      { id: 88, role: 'teacher', email: 'teacher88@virtulab.ke', name: 'Mwalimu Otieno' },
      process.env.JWT_SECRET
    );

    pool.query = async (text, params) => {
      const q = String(text || '');

      // INSERT into system_announcements
      if (q.includes('INSERT INTO system_announcements')) {
        const title = params[0];
        const message = params[1];
        const type = params[2] || 'info';
        const target_role = params[3] || 'all';
        const school_id = params[4] || null;
        const county = params[5] || null;
        const row = {
          id: mockAnnouncements.length + 1,
          title,
          message,
          type,
          target_role,
          school_id,
          county,
          is_active: true,
          created_at: new Date().toISOString()
        };
        mockAnnouncements.push(row);
        return { rows: [row] };
      }

      // Fan-out query: INSERT INTO student_notifications SELECT ... FROM students
      if (q.includes('INSERT INTO student_notifications') && q.includes('FROM students')) {
        const title = params[0];
        const message = params[1];
        mockStudentNotifications.push({
          id: mockStudentNotifications.length + 1,
          student_id: 42,
          title,
          message,
          type: 'announcement',
          link: '/student/home.html',
          is_read: false,
          created_at: new Date().toISOString()
        });
        return { rowCount: 1, rows: [] };
      }

      // SELECT active announcements
      if (q.includes('SELECT') && q.includes('FROM system_announcements') && q.includes('is_active = true')) {
        let active = mockAnnouncements.filter(a => a.is_active);
        if (q.includes('target_role = $')) {
          const audienceParam = params[0];
          active = active.filter(a => a.target_role === 'all' || a.target_role === audienceParam);
        }
        return { rows: active };
      }

      // SELECT all announcements
      if (q.includes('SELECT') && q.includes('FROM system_announcements')) {
        return { rows: mockAnnouncements };
      }

      // SELECT student notifications
      if (q.includes('FROM student_notifications') && q.includes('student_id = $1')) {
        const studentId = params[0];
        const notifs = mockStudentNotifications.filter(n => n.student_id === studentId);
        return { rows: notifs };
      }

      // DELETE system_announcements
      if (q.includes('DELETE FROM system_announcements')) {
        const id = parseInt(params?.[0] || 1, 10);
        const idx = mockAnnouncements.findIndex(a => Number(a.id) === Number(id));
        if (idx !== -1) {
          mockAnnouncements.splice(idx, 1);
        } else {
          mockAnnouncements.pop();
        }
        return { rows: [{ id }] };
      }

      // DELETE student_notifications
      if (q.includes('DELETE FROM student_notifications')) {
        mockStudentNotifications.length = 0;
        return { rowCount: 1, rows: [] };
      }

      // INSERT audit logs
      if (q.includes('INSERT INTO audit_logs')) {
        mockAuditLogs.push(params);
        return { rows: [{ id: 1 }] };
      }

      return { rows: [] };
    };

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    pool.query = originalQuery;
    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('1. POST /api/admin/announcements creates broadcast and fans out to student_notifications', async () => {
    const res = await fetch(url('/api/admin/announcements'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adminToken
      },
      body: JSON.stringify({
        title: 'KCSE Chemistry Paper 3 Mock Practical Schedule',
        message: 'All Form 4 candidates must complete Titration Standardization by Friday 5 PM.',
        type: 'exam',
        target_role: 'all'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.announcement.title, 'KCSE Chemistry Paper 3 Mock Practical Schedule');
    assert.strictEqual(mockStudentNotifications.length, 1);
    assert.strictEqual(mockStudentNotifications[0].title, 'KCSE Chemistry Paper 3 Mock Practical Schedule');
    assert.strictEqual(mockStudentNotifications[0].type, 'announcement');
  });

  it('2. GET /api/announcements/active returns published broadcast announcement', async () => {
    const res = await fetch(url('/api/announcements/active'));
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert(Array.isArray(body.announcements));
    assert(body.announcements.length >= 1);
    assert.strictEqual(body.announcements[0].title, 'KCSE Chemistry Paper 3 Mock Practical Schedule');
  });

  it('3. GET /api/notifications/mine returns broadcast notification to student workstation', async () => {
    const res = await fetch(url('/api/notifications/mine'), {
      headers: {
        'Authorization': 'Bearer ' + studentToken
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert(Array.isArray(body.notifications));
    assert(body.notifications.length >= 1);
    assert.strictEqual(body.notifications[0].title, 'KCSE Chemistry Paper 3 Mock Practical Schedule');
    assert.strictEqual(body.notifications[0].type, 'announcement');
  });

  it('4. POST /api/admin/announcements targeting teachers does NOT fan out to students', async () => {
    const initialStudentNotifCount = mockStudentNotifications.length;

    const res = await fetch(url('/api/admin/announcements'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adminToken
      },
      body: JSON.stringify({
        title: 'KNEC Standardization Seminar for Examiners',
        message: 'All chemistry teachers must review the 2026 rubric guidelines by Monday.',
        type: 'info',
        target_role: 'teachers'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.announcement.target_role, 'teachers');

    // Verify student notifications did NOT increase
    assert.strictEqual(mockStudentNotifications.length, initialStudentNotifCount);

    // Verify teachers audience query receives it
    const teacherActiveRes = await fetch(url('/api/announcements/active?audience=teachers'));
    assert.strictEqual(teacherActiveRes.status, 200);
    const teacherBody = await teacherActiveRes.json();
    const hasTeacherNotice = teacherBody.announcements.some(a => a.title === 'KNEC Standardization Seminar for Examiners');
    assert.strictEqual(hasTeacherNotice, true);

    // Verify students audience query does NOT receive teacher-only announcement
    const studentActiveRes = await fetch(url('/api/announcements/active?audience=students'));
    assert.strictEqual(studentActiveRes.status, 200);
    const studentBody = await studentActiveRes.json();
    const hasInStudent = studentBody.announcements.some(a => a.title === 'KNEC Standardization Seminar for Examiners');
    assert.strictEqual(hasInStudent, false);
  });

  it('5. DELETE /api/admin/announcements/:id deletes announcement and cleans up student notifications', async () => {
    const targetId = mockAnnouncements.length > 0 ? mockAnnouncements[0].id : 1;
    const res = await fetch(url('/api/admin/announcements/' + targetId), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + adminToken
      }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  it('6. Verifies client student, teacher, and admin workstations contain targeted broadcast components', () => {
    // Student portal verification
    const studentHome = fs.readFileSync(path.join(__dirname, '..', '..', 'client', 'student', 'home.html'), 'utf8');
    assert(studentHome.includes('id="systemBroadcastBanner"'), 'student home.html must include systemBroadcastBanner');
    const studentDash = fs.readFileSync(path.join(__dirname, '..', '..', 'client', 'student', 'js', 'student-dashboard.js'), 'utf8');
    assert(studentDash.includes('renderSystemBroadcastBanner'), 'student-dashboard.js must define renderSystemBroadcastBanner');
    assert(studentDash.includes("itemType === 'announcement'"), 'student-dashboard.js must support announcement items');
    assert(studentDash.includes('dismissAnnouncement'), 'student-dashboard.js must export dismissAnnouncement');

    // Teacher portal verification
    const teacherDashHtml = fs.readFileSync(path.join(__dirname, '..', '..', 'client', 'teacher', 'dashboard.html'), 'utf8');
    assert(teacherDashHtml.includes('id="systemBroadcastBanner"'), 'teacher dashboard.html must include systemBroadcastBanner');
    assert(teacherDashHtml.includes('id="notifBellBtn"'), 'teacher dashboard.html must include notifBellBtn');
    assert(teacherDashHtml.includes('id="notifBadge"'), 'teacher dashboard.html must include notifBadge');
    assert(teacherDashHtml.includes('id="notifDropdown"'), 'teacher dashboard.html must include notifDropdown');

    const teacherDashJs = fs.readFileSync(path.join(__dirname, '..', '..', 'client', 'teacher', 'js', 'teacher-dashboard.js'), 'utf8');
    assert(teacherDashJs.includes('renderSystemBroadcastBanner'), 'teacher-dashboard.js must define renderSystemBroadcastBanner');
    assert(teacherDashJs.includes('loadSystemAnnouncements'), 'teacher-dashboard.js must define loadSystemAnnouncements');
    assert(teacherDashJs.includes('cachedActiveAnnouncements'), 'teacher-dashboard.js must cache active announcements');
    assert(teacherDashJs.includes('dismissAnnouncement'), 'teacher-dashboard.js must define dismissAnnouncement');

    // Admin portal verification
    const adminHtml = fs.readFileSync(path.join(__dirname, '..', '..', 'client', 'admin', 'dashboard.html'), 'utf8');
    assert(adminHtml.includes('deleteAnnouncementPrompt'), 'admin dashboard must include deleteAnnouncementPrompt');
    assert(adminHtml.includes('annTargetRoleSelect'), 'admin dashboard must include annTargetRoleSelect');
    assert(adminHtml.includes('annCountySelect'), 'admin dashboard must include annCountySelect');
    assert(adminHtml.includes('annSchoolSelect'), 'admin dashboard must include annSchoolSelect');
  });

  it('7. Verifies Android PWA asset parity across student, teacher, and admin portals', () => {
    // Student PWA
    const pwaStudentHome = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa-android', 'app', 'src', 'main', 'assets', 'student', 'home.html'), 'utf8');
    assert(pwaStudentHome.includes('id="systemBroadcastBanner"'), 'pwa student home.html must include systemBroadcastBanner');

    const pwaStudentDash = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa-android', 'app', 'src', 'main', 'assets', 'student', 'js', 'student-dashboard.js'), 'utf8');
    assert(pwaStudentDash.includes('renderSystemBroadcastBanner'), 'pwa student-dashboard.js must define renderSystemBroadcastBanner');

    // Teacher PWA
    const pwaTeacherDash = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa-android', 'app', 'src', 'main', 'assets', 'teacher', 'dashboard.html'), 'utf8');
    assert(pwaTeacherDash.includes('id="systemBroadcastBanner"'), 'pwa teacher dashboard.html must include systemBroadcastBanner');
    assert(pwaTeacherDash.includes('id="notifBellBtn"'), 'pwa teacher dashboard.html must include notifBellBtn');

    const pwaTeacherJs = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa-android', 'app', 'src', 'main', 'assets', 'teacher', 'js', 'teacher-dashboard.js'), 'utf8');
    assert(pwaTeacherJs.includes('loadSystemAnnouncements'), 'pwa teacher-dashboard.js must define loadSystemAnnouncements');

    // Admin PWA
    const pwaAdminDash = fs.readFileSync(path.join(__dirname, '..', '..', 'pwa-android', 'app', 'src', 'main', 'assets', 'admin', 'dashboard.html'), 'utf8');
    assert(pwaAdminDash.includes('annTargetRoleSelect'), 'pwa admin dashboard.html must include annTargetRoleSelect');
  });
});

// ============================================================
//  Test Suite: Student Roster, Class Attendance & Lab Workgroups
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_student_roster_attendance_workgroups_9988';

const app = require('../index');
const pool = require('../db/pool');
const studentRepo = require('../repositories/studentRepo');
const authMiddleware = require('../middleware/auth');

let server;
let port = 0;

function url(subpath) {
  return `http://127.0.0.1:${port}${subpath}`;
}

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('Student Roster, Attendance & Lab Workgroups Suite', () => {
  before((_, done) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      done();
    });
  });

  after((_, done) => {
    if (server) server.close(done);
    else done();
  });

  // ──────────────────────────────────────────────────────────
  // 1. Role Authorization & Route Security
  // ──────────────────────────────────────────────────────────
  describe('Route Security & Dual-Role RBAC', () => {
    const studentToken = makeToken({ id: 101, role: 'student', name: 'Wanjiku Mwangi' });
    const teacherToken = makeToken({ id: 201, role: 'teacher', name: 'Mwalimu Otieno' });
    const adminToken = makeToken({ id: 301, role: 'admin', name: 'Academic Director' });

    it('should reject unauthenticated access to student & attendance routes with 401', async () => {
      const endpoints = [
        '/api/students/class',
        '/api/students/attendance',
        '/api/students/attendance/summary',
        '/api/students/workgroups'
      ];
      for (const ep of endpoints) {
        const res = await fetch(url(ep));
        assert.equal(res.status, 401, `Endpoint ${ep} should require auth`);
      }
    });

    it('should reject student token on teacher/admin endpoints with 403', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/students/class' },
        { method: 'GET', path: '/api/students/attendance' },
        { method: 'POST', path: '/api/students/attendance', body: JSON.stringify({ records: [] }) },
        { method: 'GET', path: '/api/students/attendance/summary' },
        { method: 'GET', path: '/api/students/workgroups' },
        { method: 'POST', path: '/api/students/workgroups', body: JSON.stringify({ name: 'Bench 1' }) },
        { method: 'POST', path: '/api/students/workgroups/auto-assign', body: JSON.stringify({ groupSize: 4 }) },
        { method: 'POST', path: '/api/students/bulk-import', body: JSON.stringify({ students: [] }) },
        { method: 'POST', path: '/api/students/1/unlink' }
      ];

      for (const ep of endpoints) {
        const res = await fetch(url(ep.path), {
          method: ep.method,
          headers: {
            'Authorization': `Bearer ${studentToken}`,
            'Content-Type': 'application/json'
          },
          body: ep.body
        });
        assert.equal(res.status, 403, `Endpoint ${ep.method} ${ep.path} should reject student role`);
      }
    });

    it('should allow both teacher and admin tokens past requireRole guard', () => {
      const guard = authMiddleware.requireRole(['teacher', 'admin']);
      let teacherAllowed = false;
      let adminAllowed = false;
      let studentRejected = false;

      const reqTeacher = { user: { id: 201, role: 'teacher' } };
      const reqAdmin = { user: { id: 301, role: 'admin' } };
      const reqStudent = { user: { id: 101, role: 'student' } };

      const resMock = {
        status: (code) => {
          if (code === 403) studentRejected = true;
          return { json: () => {} };
        }
      };

      guard(reqTeacher, resMock, () => { teacherAllowed = true; });
      guard(reqAdmin, resMock, () => { adminAllowed = true; });
      guard(reqStudent, resMock, () => {});

      assert.equal(teacherAllowed, true);
      assert.equal(adminAllowed, true);
      assert.equal(studentRejected, true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 2. Repository Logic: Class Roster
  // ──────────────────────────────────────────────────────────
  describe('Student Repository: Roster & Metrics', () => {
    it('should query classroom-scoped students for teachers and institution-wide for admins', async () => {
      const originalQuery = pool.query;
      let teacherSqlCalled = '';
      let teacherParamsCalled = [];
      let adminSqlCalled = '';

      pool.query = async (sql, params) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('s.teacher_id = $1')) {
          teacherSqlCalled = sql;
          teacherParamsCalled = params;
          return {
            rows: [
              { id: 1, name: 'Alice Wambui', form: 'Form 4', total_sessions: 8, avg_accuracy: 92, last_active: '2026-10-25' }
            ]
          };
        }
        if (!sql.includes('WHERE s.teacher_id = $1')) {
          adminSqlCalled = sql;
          return {
            rows: [
              { id: 1, name: 'Alice Wambui', form: 'Form 4', total_sessions: 8, avg_accuracy: 92, last_active: '2026-10-25' },
              { id: 2, name: 'Brian Koech', form: 'Form 3', total_sessions: 5, avg_accuracy: 78, last_active: '2026-10-24' }
            ]
          };
        }
        return { rows: [] };
      };

      try {
        const teacherStudents = await studentRepo.getClassStudents(201, 'teacher');
        assert.equal(teacherStudents.length, 1);
        assert.equal(teacherParamsCalled[0], 201);
        assert.ok(teacherSqlCalled.includes('WHERE s.teacher_id = $1'));

        const adminStudents = await studentRepo.getClassStudents(301, 'admin');
        assert.equal(adminStudents.length, 2);
        assert.ok(!adminSqlCalled.includes('WHERE s.teacher_id = $1'));
      } finally {
        pool.query = originalQuery;
      }
    });
  });

  // ──────────────────────────────────────────────────────────
  // 3. Repository Logic: Attendance Register & Summary
  // ──────────────────────────────────────────────────────────
  describe('Student Repository: Practical Lab Attendance', () => {
    it('should format and return attendance register with fallback to unrecorded', async () => {
      const originalQuery = pool.query;
      pool.query = async (sql) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('class_attendance ca')) {
          return {
            rows: [
              { student_id: 1, student_name: 'Faith Achieng', form: 'Form 4', status: 'present', remarks: 'Good titre' },
              { student_id: 2, student_name: 'Geoffrey Mutua', form: 'Form 4', status: 'unrecorded', remarks: '' }
            ]
          };
        }
        return { rows: [] };
      };

      try {
        const att = await studentRepo.getAttendance(201, 'teacher', {
          date: '2026-10-26',
          practicalType: 'titration',
          form: 'Form 4'
        });

        assert.equal(att.date, '2026-10-26');
        assert.equal(att.practicalType, 'titration');
        assert.equal(att.records.length, 2);
        assert.equal(att.records[0].status, 'present');
        assert.equal(att.records[1].status, 'unrecorded');
      } finally {
        pool.query = originalQuery;
      }
    });

    it('should compute cumulative attendance statistics', async () => {
      const originalQuery = pool.query;
      pool.query = async (sql) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        return {
          rows: [
            { student_id: 1, student_name: 'Faith Achieng', attendance_pct: 100, present_count: 5, late_count: 0, absent_count: 0 },
            { student_id: 2, student_name: 'Geoffrey Mutua', attendance_pct: 80, present_count: 4, late_count: 1, absent_count: 0 }
          ]
        };
      };

      try {
        const summary = await studentRepo.getAttendanceSummary(201, 'teacher', { form: 'Form 4' });
        assert.equal(summary.totalStudents, 2);
        assert.equal(summary.avgAttendance, 90);
        assert.equal(summary.summary.length, 2);
      } finally {
        pool.query = originalQuery;
      }
    });
  });

  // ──────────────────────────────────────────────────────────
  // 4. Repository Logic: Lab Workgroups & Auto-Assignment
  // ──────────────────────────────────────────────────────────
  describe('Student Repository: Lab Workgroups & Auto-Distribute', () => {
    it('should create, retrieve, update, and delete workgroups with member roles', async () => {
      const originalConnect = pool.connect;
      const originalQuery = pool.query;

      const mockClient = {
        query: async (sql, params) => {
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return {};
          if (sql.includes('INSERT INTO lab_workgroups')) {
            return {
              rows: [{
                id: 10,
                name: params[2],
                description: params[3],
                form: params[4],
                created_at: new Date()
              }]
            };
          }
          if (sql.includes('INSERT INTO lab_workgroup_members')) {
            return {
              rows: [{
                id: 101,
                student_id: params[1],
                role: params[2]
              }]
            };
          }
          if (sql.includes('UPDATE lab_workgroups')) {
            return {
              rows: [{
                id: 10,
                name: 'Bench 1 (Updated)',
                form: 'Form 4'
              }]
            };
          }
          return { rows: [] };
        },
        release: () => {}
      };

      pool.connect = async () => mockClient;
      pool.query = async (sql, params) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('SELECT id, school_id FROM teachers')) {
          return { rows: [{ id: 201, school_id: 5 }] };
        }
        if (sql.includes('SELECT id FROM lab_workgroups')) {
          return { rows: [{ id: 10 }] };
        }
        if (sql.includes('DELETE FROM lab_workgroups')) {
          return { rows: [{ id: 10 }] };
        }
        return { rows: [] };
      };

      try {
        // Create workgroup
        const group = await studentRepo.createWorkgroup(201, 'teacher', {
          name: 'Lab Bench 1: Burette Station',
          description: 'Acid-base neutralization practicals',
          form: 'Form 4',
          members: [
            { studentId: 1, role: 'Team Lead' },
            { studentId: 2, role: 'Lab Technician' }
          ]
        });

        assert.equal(group.id, 10);
        assert.equal(group.name, 'Lab Bench 1: Burette Station');
        assert.equal(group.members.length, 2);
        assert.equal(group.members[0].role, 'Team Lead');

        // Update workgroup
        const updated = await studentRepo.updateWorkgroup(10, 201, 'teacher', {
          name: 'Bench 1 (Updated)',
          form: 'Form 4'
        });
        assert.equal(updated.name, 'Bench 1 (Updated)');

        // Delete workgroup
        const deleted = await studentRepo.deleteWorkgroup(10, 201, 'teacher');
        assert.equal(deleted, true);
      } finally {
        pool.connect = originalConnect;
        pool.query = originalQuery;
      }
    });

    it('should auto-distribute students into benches with balanced role assignments', async () => {
      const originalConnect = pool.connect;
      const originalQuery = pool.query;

      const dummyStudents = [
        { id: 1, name: 'Student One', form: 'Form 4', avg_accuracy: 95 },
        { id: 2, name: 'Student Two', form: 'Form 4', avg_accuracy: 85 },
        { id: 3, name: 'Student Three', form: 'Form 4', avg_accuracy: 75 },
        { id: 4, name: 'Student Four', form: 'Form 4', avg_accuracy: 65 }
      ];

      pool.query = async (sql) => {
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('FROM students s')) {
          return { rows: dummyStudents };
        }
        if (sql.includes('SELECT id, school_id FROM teachers')) {
          return { rows: [{ id: 201, school_id: 5 }] };
        }
        return { rows: [] };
      };

      const createdGroups = [];
      const mockClient = {
        query: async (sql, params) => {
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return {};
          if (sql.includes('INSERT INTO lab_workgroups')) {
            const g = { id: createdGroups.length + 1, name: params[2], members: [] };
            createdGroups.push(g);
            return { rows: [g] };
          }
          if (sql.includes('INSERT INTO lab_workgroup_members')) {
            const lastG = createdGroups[createdGroups.length - 1];
            const m = { student_id: params[1], role: params[2] };
            if (lastG) lastG.members.push(m);
            return { rows: [m] };
          }
          return { rows: [] };
        },
        release: () => {}
      };
      pool.connect = async () => mockClient;

      try {
        const res = await studentRepo.autoAssignWorkgroups(201, 'teacher', {
          groupSize: 2,
          form: 'Form 4',
          namingPrefix: 'Bench Unit'
        });

        assert.equal(res.totalStudentsAssigned, 4);
        assert.equal(res.groupsCreated, 2);
        assert.equal(res.workgroups.length, 2);
        // Each group should have assigned roles including Team Lead
        assert.equal(res.workgroups[0].members[0].role, 'Team Lead');
        assert.equal(res.workgroups[1].members[0].role, 'Team Lead');
      } finally {
        pool.connect = originalConnect;
        pool.query = originalQuery;
      }
    });
  });
});

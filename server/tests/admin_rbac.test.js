// ============================================================
//  VirtuLab Kenya — Advanced Admin RBAC Test Suite
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_rbac_key_9988';

const rbac = require('../config/rbac');
const app = require('../index');
const pool = require('../db/pool');
const originalQuery = pool.query;

let server;
let port = 0;

function url(subpath) {
  return `http://127.0.0.1:${port}${subpath}`;
}

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('VirtuLab Kenya — Admin RBAC & Granular Permissions', () => {

  // ──────────────────────────────────────────────────────────
  // 1. RBAC Unit Tests
  // ──────────────────────────────────────────────────────────
  describe('RBAC Definitions & Permission Evaluation', () => {
    it('should correctly normalize role strings', () => {
      assert.strictEqual(rbac.normalizeRole('SUPERADMIN'), 'superadmin');
      assert.strictEqual(rbac.normalizeRole('  School_Registrar '), 'school_registrar');
      assert.strictEqual(rbac.normalizeRole('registrar'), 'school_registrar');
      assert.strictEqual(rbac.normalizeRole('inspector'), 'curriculum_inspector');
      assert.strictEqual(rbac.normalizeRole('support'), 'support_admin');
      assert.strictEqual(rbac.normalizeRole('unknown_role'), 'admin');
      assert.strictEqual(rbac.normalizeRole(null), 'admin');
    });

    it('should grant superadmin unrestricted access to any permission', () => {
      assert.strictEqual(rbac.hasPermission('superadmin', [], rbac.PERMISSIONS.SCHOOLS_DELETE), true);
      assert.strictEqual(rbac.hasPermission('superadmin', [], rbac.PERMISSIONS.TEAM_MANAGE), true);
      assert.strictEqual(rbac.hasPermission('superadmin', [], 'any:future:permission'), true);
    });

    it('should correctly resolve School Registrar permissions', () => {
      const perms = rbac.getEffectivePermissions(rbac.ROLES.SCHOOL_REGISTRAR);
      assert.ok(perms.includes(rbac.PERMISSIONS.SCHOOLS_READ));
      assert.ok(perms.includes(rbac.PERMISSIONS.SCHOOLS_WRITE));
      assert.ok(perms.includes(rbac.PERMISSIONS.USERS_READ));
      assert.strictEqual(perms.includes(rbac.PERMISSIONS.SCHOOLS_DELETE), false);
      assert.strictEqual(perms.includes(rbac.PERMISSIONS.TEAM_MANAGE), false);

      assert.strictEqual(rbac.hasPermission(rbac.ROLES.SCHOOL_REGISTRAR, [], rbac.PERMISSIONS.SCHOOLS_WRITE), true);
      assert.strictEqual(rbac.hasPermission(rbac.ROLES.SCHOOL_REGISTRAR, [], rbac.PERMISSIONS.SCHOOLS_DELETE), false);
      assert.strictEqual(rbac.hasPermission(rbac.ROLES.SCHOOL_REGISTRAR, [], rbac.PERMISSIONS.USERS_STATUS), false);
    });

    it('should correctly resolve Curriculum Inspector permissions', () => {
      const perms = rbac.getEffectivePermissions(rbac.ROLES.CURRICULUM_INSPECTOR);
      assert.ok(perms.includes(rbac.PERMISSIONS.ANALYTICS_READ));
      assert.ok(perms.includes(rbac.PERMISSIONS.TELEMETRY_READ));
      assert.ok(perms.includes(rbac.PERMISSIONS.SCHOOLS_READ));
      assert.strictEqual(perms.includes(rbac.PERMISSIONS.SCHOOLS_WRITE), false);
      assert.strictEqual(perms.includes(rbac.PERMISSIONS.USERS_STATUS), false);

      assert.strictEqual(rbac.hasPermission(rbac.ROLES.CURRICULUM_INSPECTOR, [], rbac.PERMISSIONS.ANALYTICS_READ), true);
      assert.strictEqual(rbac.hasPermission(rbac.ROLES.CURRICULUM_INSPECTOR, [], rbac.PERMISSIONS.USERS_RESET_PASSWORD), false);
    });

    it('should correctly resolve Support Admin permissions', () => {
      const perms = rbac.getEffectivePermissions(rbac.ROLES.SUPPORT_ADMIN);
      assert.ok(perms.includes(rbac.PERMISSIONS.USERS_READ));
      assert.ok(perms.includes(rbac.PERMISSIONS.USERS_STATUS));
      assert.ok(perms.includes(rbac.PERMISSIONS.USERS_RESET_PASSWORD));
      assert.ok(perms.includes(rbac.PERMISSIONS.ANNOUNCEMENTS_WRITE));
      assert.strictEqual(perms.includes(rbac.PERMISSIONS.SCHOOLS_DELETE), false);
      assert.strictEqual(perms.includes(rbac.PERMISSIONS.LICENSING_MANAGE), false);
      assert.strictEqual(perms.includes(rbac.PERMISSIONS.TEAM_MANAGE), false);

      assert.strictEqual(rbac.hasPermission(rbac.ROLES.SUPPORT_ADMIN, [], rbac.PERMISSIONS.USERS_STATUS), true);
      assert.strictEqual(rbac.hasPermission(rbac.ROLES.SUPPORT_ADMIN, [], rbac.PERMISSIONS.USERS_RESET_PASSWORD), true);
      assert.strictEqual(rbac.hasPermission(rbac.ROLES.SUPPORT_ADMIN, [], rbac.PERMISSIONS.LICENSING_MANAGE), false);
    });

    it('should respect custom granular permissions overrides for an administrator', () => {
      const customPerms = [rbac.PERMISSIONS.SCHOOLS_READ, rbac.PERMISSIONS.LICENSING_MANAGE];
      assert.strictEqual(rbac.hasPermission(rbac.ROLES.ADMIN, customPerms, rbac.PERMISSIONS.LICENSING_MANAGE), true);
      assert.strictEqual(rbac.hasPermission(rbac.ROLES.ADMIN, customPerms, rbac.PERMISSIONS.SCHOOLS_WRITE), false);
    });
  });

  // ──────────────────────────────────────────────────────────
  // 2. Integration / HTTP Route Guarding Tests
  // ──────────────────────────────────────────────────────────
  describe('Admin HTTP API Granular Permission Enforcement', () => {
    let mockAdmins = [];
    let mockSchools = [];
    let mockAuditLogs = [];

    before(async () => {
      mockAdmins = [
        {
          id: 1,
          name: 'Super Director',
          email: 'super@virtulab.co.ke',
          role: 'superadmin',
          permissions: [],
          status: 'active',
          password_hash: '$2b$10$xyz',
          last_login: new Date()
        },
        {
          id: 2,
          name: 'Registrar Jane',
          email: 'registrar@virtulab.co.ke',
          role: 'school_registrar',
          permissions: ['schools:read', 'schools:write', 'users:read'],
          status: 'active',
          password_hash: '$2b$10$xyz',
          last_login: new Date()
        },
        {
          id: 3,
          name: 'Inspector Mwangi',
          email: 'inspector@virtulab.co.ke',
          role: 'curriculum_inspector',
          permissions: ['schools:read', 'users:read', 'analytics:read', 'telemetry:read'],
          status: 'active',
          password_hash: '$2b$10$xyz',
          last_login: new Date()
        },
        {
          id: 4,
          name: 'Support Faith',
          email: 'support@virtulab.co.ke',
          role: 'support_admin',
          permissions: ['users:read', 'users:status', 'users:reset_password', 'announcements:write'],
          status: 'active',
          password_hash: '$2b$10$xyz',
          last_login: new Date()
        }
      ];

      mockSchools = [
        {
          id: 10,
          name: 'Alliance High School',
          county: 'Kiambu',
          admin_code: 'ALLI-2026'
        }
      ];

      pool.query = async (text, params) => {
        const sql = (typeof text === 'string' ? text : text.text || '').trim();

        // 1. Roles catalog or metadata
        if (sql.includes('SELECT') && sql.includes('admins') && sql.includes('WHERE id = $1')) {
          const admin = mockAdmins.find(a => a.id === params[0]);
          return { rows: admin ? [admin] : [] };
        }

        // Count active superadmins (for countSuperAdmins: SELECT COUNT(*) AS cnt ...)
        if (sql.includes('COUNT(*)') && sql.includes("role = 'superadmin'")) {
          const count = mockAdmins.filter(a => a.role === 'superadmin' && a.status === 'active').length;
          return { rows: [{ cnt: count, count: String(count) }] };
        }

        // Team list
        if (sql.includes('SELECT') && sql.includes('admins') && sql.includes('ORDER BY')) {
          return { rows: mockAdmins };
        }

        // Update role
        if (sql.includes('UPDATE admins') && sql.includes('role = $1')) {
          const adminId = params[params.length - 1];
          const admin = mockAdmins.find(a => a.id === adminId);
          if (admin) {
            admin.role = params[0];
            if (params.length === 3) admin.permissions = params[1] || [];
            return { rows: [admin] };
          }
          return { rows: [] };
        }

        // Schools
        if (sql.includes('SELECT') && sql.includes('schools')) {
          return { rows: mockSchools };
        }
        if (sql.includes('DELETE FROM schools')) {
          return { rowCount: 1, rows: [] };
        }

        // Audit log insert
        if (sql.includes('INSERT INTO audit_logs')) {
          mockAuditLogs.push({ text: sql, params });
          return { rows: [{ id: mockAuditLogs.length }] };
        }

        // Fallback default
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
      if (server && server.listening) {
        await new Promise((resolve) => server.close(resolve));
      }
      await pool.end().catch(() => {});
    });

    it('GET /api/admin/roles should return full role catalog and permission definitions', async () => {
      const token = makeToken({ id: 1, role: 'admin', adminRole: 'superadmin' });
      const res = await fetch(url('/api/admin/roles'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.roles);
      assert.ok(data.definitions);
      assert.ok(data.permissions);
      assert.ok(data.definitions.school_registrar);
      assert.ok(data.definitions.curriculum_inspector);
      assert.ok(data.definitions.support_admin);
    });

    it('School Registrar should be blocked from deleting schools (403 Forbidden)', async () => {
      const token = makeToken({
        id: 2,
        role: 'admin',
        adminRole: 'school_registrar',
        permissions: ['schools:read', 'schools:write', 'users:read']
      });

      const res = await fetch(url('/api/admin/schools/10'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      assert.strictEqual(res.status, 403);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.requiredPermission, 'schools:delete');
    });

    it('Curriculum Inspector should be blocked from managing team roles (403 Forbidden)', async () => {
      const token = makeToken({
        id: 3,
        role: 'admin',
        adminRole: 'curriculum_inspector',
        permissions: ['schools:read', 'users:read', 'analytics:read', 'telemetry:read']
      });

      const res = await fetch(url('/api/admin/team/4/role'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'admin' })
      });

      assert.strictEqual(res.status, 403);
      const body = await res.json();
      assert.strictEqual(body.requiredPermission, 'team:manage');
    });

    it('Support Admin should be blocked from managing subscriptions/licensing (403 Forbidden)', async () => {
      const token = makeToken({
        id: 4,
        role: 'admin',
        adminRole: 'support_admin',
        permissions: ['users:read', 'users:status', 'users:reset_password', 'announcements:write']
      });

      const res = await fetch(url('/api/subscriptions/admin/overview'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      assert.strictEqual(res.status, 403);
      const body = await res.json();
      assert.strictEqual(body.requiredPermission, 'licensing:manage');
    });

    it('Superadmin should be able to update administrator roles and permissions', async () => {
      const token = makeToken({ id: 1, role: 'admin', adminRole: 'superadmin' });

      const res = await fetch(url('/api/admin/team/4/role'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          role: 'curriculum_inspector',
          permissions: ['schools:read', 'users:read', 'analytics:read', 'telemetry:read']
        })
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.admin.role, 'curriculum_inspector');
    });

    it('Superadmin should be prevented from demoting the last active superadmin', async () => {
      const token = makeToken({ id: 1, role: 'admin', adminRole: 'superadmin' });

      const res = await fetch(url('/api/admin/team/1/role'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'admin' })
      });

      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.match(body.error, /Cannot demote the only remaining active (Super Administrator|superadmin)/i);
    });
  });
});

const pool = require('../db/pool');

async function findAdminByEmail(email) {
  if (!email) return null;
  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, COALESCE(permissions, \'{}\') AS permissions, status, created_by, last_login, created_at FROM admins WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    return result.rows[0] || null;
  } catch (err) {
    // Graceful fallback if permissions column not yet migrated
    const result = await pool.query(
      'SELECT * FROM admins WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    if (result.rows[0] && !result.rows[0].permissions) {
      result.rows[0].permissions = [];
    }
    return result.rows[0] || null;
  }
}

async function findAdminById(id) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, COALESCE(permissions, \'{}\') AS permissions, status, created_by, last_login, created_at FROM admins WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (err) {
    const result = await pool.query(
      'SELECT id, name, email, role, status, created_by, last_login, created_at FROM admins WHERE id = $1',
      [id]
    );
    if (result.rows[0]) {
      result.rows[0].permissions = [];
    }
    return result.rows[0] || null;
  }
}

async function getAllAdmins() {
  try {
    const result = await pool.query(`
      SELECT a.id, a.name, a.email, a.role, COALESCE(a.permissions, '{}') AS permissions,
             a.status, a.last_login, a.created_at,
             creator.name AS created_by_name
      FROM admins a
      LEFT JOIN admins creator ON creator.id = a.created_by
      ORDER BY a.created_at ASC
    `);
    return result.rows;
  } catch (err) {
    const result = await pool.query(`
      SELECT a.id, a.name, a.email, a.role, a.status, a.last_login, a.created_at,
             creator.name AS created_by_name
      FROM admins a
      LEFT JOIN admins creator ON creator.id = a.created_by
      ORDER BY a.created_at ASC
    `);
    return result.rows.map(a => ({ ...a, permissions: [] }));
  }
}

async function createAdmin({ name, email, passwordHash, role = 'admin', permissions = [], createdBy = null }) {
  try {
    await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}'");
  } catch (_) {}

  try {
    const result = await pool.query(
      `INSERT INTO admins (name, email, password_hash, role, permissions, status, created_by)
       VALUES ($1, $2, $3, $4, $5, 'active', $6)
       RETURNING id, name, email, role, COALESCE(permissions, '{}') AS permissions, status, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, role, permissions || [], createdBy]
    );
    return result.rows[0];
  } catch (err) {
    // If permissions array column fails, fallback to standard insert
    const result = await pool.query(
      `INSERT INTO admins (name, email, password_hash, role, status, created_by)
       VALUES ($1, $2, $3, $4, 'active', $5)
       RETURNING id, name, email, role, status, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, role, createdBy]
    );
    return { ...result.rows[0], permissions: permissions || [] };
  }
}

async function updateAdminRoleAndPermissions(id, { role, permissions = [] }) {
  try {
    await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}'");
  } catch (_) {}

  try {
    const result = await pool.query(
      `UPDATE admins
       SET role = $1, permissions = $2
       WHERE id = $3
       RETURNING id, name, email, role, COALESCE(permissions, '{}') AS permissions, status`,
      [role, permissions || [], id]
    );
    return result.rows[0] || null;
  } catch (err) {
    const result = await pool.query(
      `UPDATE admins
       SET role = $1
       WHERE id = $2
       RETURNING id, name, email, role, status`,
      [role, id]
    );
    return result.rows[0] ? { ...result.rows[0], permissions: permissions || [] } : null;
  }
}

async function updateAdminStatus(id, status) {
  const result = await pool.query(
    `UPDATE admins
     SET status = $1
     WHERE id = $2
     RETURNING id, name, email, role, status`,
    [status, id]
  );
  return result.rows[0] || null;
}

async function updateAdminPassword(id, passwordHash) {
  const result = await pool.query(
    `UPDATE admins
     SET password_hash = $1
     WHERE id = $2
     RETURNING id, name, email`,
    [passwordHash, id]
  );
  return result.rows[0] || null;
}

async function updateLastLogin(id) {
  await pool.query(
    'UPDATE admins SET last_login = NOW() WHERE id = $1',
    [id]
  );
}

async function countAdmins() {
  const result = await pool.query('SELECT COUNT(*) AS cnt FROM admins');
  return parseInt(result.rows[0]?.cnt, 10) || 0;
}

async function countSuperAdmins() {
  const result = await pool.query("SELECT COUNT(*) AS cnt FROM admins WHERE role = 'superadmin' AND status = 'active'");
  return parseInt(result.rows[0]?.cnt, 10) || 0;
}

module.exports = {
  findAdminByEmail,
  findAdminById,
  getAllAdmins,
  createAdmin,
  updateAdminRoleAndPermissions,
  updateAdminStatus,
  updateAdminPassword,
  updateLastLogin,
  countAdmins,
  countSuperAdmins
};

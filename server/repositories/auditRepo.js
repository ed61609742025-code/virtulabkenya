const pool = require('../db/pool');

async function logAuditEvent({ adminEmail = 'admin@virtulab.co.ke', action, details = {}, ipAddress = '127.0.0.1', ip = null }) {
  try {
    const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
    const ipVal = ipAddress || ip || '127.0.0.1';
    const result = await pool.query(
      `INSERT INTO audit_logs (admin_email, action, details, ip_address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [adminEmail, action, detailsStr, ipVal]
    );
    return result.rows[0];
  } catch (err) {
    console.warn('Failed to record audit log:', err.message);
    return null;
  }
}

async function getRecentAuditLogs(limit = 100) {
  const result = await pool.query(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows;
}

module.exports = {
  logAuditEvent,
  getRecentAuditLogs
};

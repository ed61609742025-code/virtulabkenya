const pool = require('../db/pool');

async function createAnnouncement({ title, message, content, type = 'info', target, targetRole, target_role, schoolId, school_id, county }) {
  const msgText = message || content || '';
  const annType = type || target || 'info';
  const role = target_role || targetRole || 'all';
  const school = (school_id !== undefined && school_id !== null && school_id !== '') ? parseInt(school_id, 10) : ((schoolId !== undefined && schoolId !== null && schoolId !== '') ? parseInt(schoolId, 10) : null);
  const countyVal = (county && county !== 'all') ? county.trim() : null;

  const result = await pool.query(
    `INSERT INTO system_announcements (title, message, type, target_role, school_id, county, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING *`,
    [title, msgText, annType, role, isNaN(school) ? null : school, countyVal]
  );
  return result.rows[0];
}

async function getActiveAnnouncements(audience = 'all', options = {}) {
  const { schoolId = null, county = null } = options;
  let query = `
    SELECT * FROM system_announcements
    WHERE is_active = true
  `;
  const params = [];

  if (audience && audience !== 'all') {
    params.push(audience);
    query += ` AND (target_role = 'all' OR target_role = $${params.length})`;
  }

  if (schoolId) {
    params.push(parseInt(schoolId, 10));
    query += ` AND (school_id IS NULL OR school_id = $${params.length})`;
  }

  if (county && county !== 'all') {
    params.push(county.trim());
    query += ` AND (county IS NULL OR county = $${params.length})`;
  }

  query += ` ORDER BY created_at DESC`;
  const result = await pool.query(query, params);
  return result.rows;
}

async function getAllAnnouncements() {
  const result = await pool.query(`
    SELECT sa.*, s.name AS school_name
    FROM system_announcements sa
    LEFT JOIN schools s ON s.id = sa.school_id
    ORDER BY sa.created_at DESC
  `);
  return result.rows;
}

async function toggleAnnouncement(id, isActive) {
  const result = await pool.query(
    'UPDATE system_announcements SET is_active = $1 WHERE id = $2 RETURNING *',
    [isActive, id]
  );
  return result.rows[0];
}

async function deleteAnnouncement(id) {
  const result = await pool.query('DELETE FROM system_announcements WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}

module.exports = {
  createAnnouncement,
  getActiveAnnouncements,
  getAllAnnouncements,
  toggleAnnouncement,
  deleteAnnouncement
};

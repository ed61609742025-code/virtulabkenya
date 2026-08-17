const pool = require('../db/pool');

async function createAnnouncement({ title, message, content, type = 'info', target, targetRole }) {
  const msgText = message || content || '';
  const annType = type || target || 'info';
  const result = await pool.query(
    `INSERT INTO system_announcements (title, message, type, is_active)
     VALUES ($1, $2, $3, true)
     RETURNING *`,
    [title, msgText, annType]
  );
  return result.rows[0];
}

async function getActiveAnnouncements() {
  const query = `
    SELECT * FROM system_announcements
    WHERE is_active = true
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function getAllAnnouncements() {
  const result = await pool.query('SELECT * FROM system_announcements ORDER BY created_at DESC');
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

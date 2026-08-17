const pool = require('../db/pool');

async function createSchool({ name, county, adminCode }) {
  const result = await pool.query(
    `INSERT INTO schools (name, county, admin_code)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, county || 'Nairobi', adminCode]
  );
  return result.rows[0];
}

async function getAllSchools() {
  const result = await pool.query(
    `SELECT s.*,
            COUNT(DISTINCT st.id)::int AS student_count,
            COUNT(DISTINCT t.id)::int AS teacher_count
     FROM schools s
     LEFT JOIN students st ON st.school_id = s.id
     LEFT JOIN teachers t ON t.school_id = s.id
     GROUP BY s.id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
}

async function getSchoolById(schoolId) {
  const result = await pool.query('SELECT * FROM schools WHERE id = $1', [schoolId]);
  return result.rows[0] || null;
}

async function getSchoolByAdminCode(adminCode) {
  const result = await pool.query('SELECT * FROM schools WHERE admin_code = $1', [adminCode]);
  return result.rows[0] || null;
}

async function updateSchool(schoolId, { name, county, adminCode }) {
  const result = await pool.query(
    `UPDATE schools
     SET name = COALESCE($1, name),
         county = COALESCE($2, county),
         admin_code = COALESCE($3, admin_code)
     WHERE id = $4
     RETURNING *`,
    [name, county, adminCode, schoolId]
  );
  return result.rows[0] || null;
}

async function deleteSchool(schoolId) {
  await pool.query('DELETE FROM schools WHERE id = $1', [schoolId]);
  return true;
}

module.exports = {
  createSchool,
  getAllSchools,
  getSchoolById,
  getSchoolByAdminCode,
  updateSchool,
  deleteSchool
};

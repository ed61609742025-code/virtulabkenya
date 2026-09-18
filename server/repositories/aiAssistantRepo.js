// ============================================================
//  VirtuLab Kenya — AI Exam Assistant Repository Layer
// ============================================================

const pool = require('../db/pool');

let tablesEnsured = false;
async function ensureTables() {
  if (tablesEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_exam_drafts (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        module_type VARCHAR(50) DEFAULT 'kcseComposite',
        exam_config JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_audit_logs (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        model VARCHAR(100),
        tokens_used INTEGER DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    tablesEnsured = true;
  } catch (err) {
    console.warn('[aiAssistantRepo] Table init note:', err.message);
  }
}

async function saveExamDraft(teacherId, examData) {
  await ensureTables();
  const { title, moduleType, examConfig } = examData;
  const res = await pool.query(
    `INSERT INTO ai_exam_drafts (teacher_id, title, module_type, exam_config)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [teacherId, title || 'Untitled Exam Draft', moduleType || 'kcseComposite', JSON.stringify(examConfig || {})]
  );
  return res.rows[0];
}

async function getTeacherDrafts(teacherId) {
  await ensureTables();
  const res = await pool.query(
    `SELECT id, teacher_id, title, module_type, exam_config, created_at, updated_at
     FROM ai_exam_drafts
     WHERE teacher_id = $1
     ORDER BY updated_at DESC`,
    [teacherId]
  );
  return res.rows;
}

async function getDraftById(draftId, teacherId) {
  await ensureTables();
  const res = await pool.query(
    `SELECT * FROM ai_exam_drafts WHERE id = $1 AND (teacher_id = $2 OR teacher_id IS NULL)`,
    [draftId, teacherId]
  );
  return res.rows[0] || null;
}

async function deleteDraft(draftId, teacherId) {
  await ensureTables();
  const res = await pool.query(
    `DELETE FROM ai_exam_drafts WHERE id = $1 AND teacher_id = $2 RETURNING id`,
    [draftId, teacherId]
  );
  return res.rows.length > 0;
}

async function logAiAudit(teacherId, action, metadata = {}) {
  await ensureTables();
  try {
    await pool.query(
      `INSERT INTO ai_audit_logs (teacher_id, action, metadata)
       VALUES ($1, $2, $3)`,
      [teacherId || null, action, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.warn('[aiAssistantRepo] Audit log note:', err.message);
  }
}

module.exports = {
  saveExamDraft,
  getTeacherDrafts,
  getDraftById,
  deleteDraft,
  logAiAudit
};

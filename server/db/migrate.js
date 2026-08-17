// ============================================================
//  VirtuLab Kenya — Database Migration Script
//  Run: node server/db/migrate.js
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Pool } = require('pg');

const migrations = [
  // Add exam_config to assignments if missing
  `ALTER TABLE assignments
     ADD COLUMN IF NOT EXISTS exam_config JSONB`,
  // Add assignment_id to qualitative_sessions if missing
  `ALTER TABLE qualitative_sessions
     ADD COLUMN IF NOT EXISTS assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL`,
  // Add missing columns to practical_sessions if missing (type, true_conc, difference, score, details, assignment_id)
  `ALTER TABLE practical_sessions
     ADD COLUMN IF NOT EXISTS type VARCHAR(50),
     ADD COLUMN IF NOT EXISTS true_conc DECIMAL(10,4),
     ADD COLUMN IF NOT EXISTS difference DECIMAL(10,4),
     ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
     ADD COLUMN IF NOT EXISTS details JSONB,
     ADD COLUMN IF NOT EXISTS assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL`,
  // Add organic scoring fields so assignment views can return full organic results
  `ALTER TABLE organic_sessions
     ADD COLUMN IF NOT EXISTS questions_total INTEGER DEFAULT 4,
     ADD COLUMN IF NOT EXISTS questions_correct INTEGER DEFAULT 0,
     ADD COLUMN IF NOT EXISTS score_pct INTEGER DEFAULT 0`,
  // Ensure composite_sessions exists for KCSE composite assignment history
  `CREATE TABLE IF NOT EXISTS composite_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
     exam_title VARCHAR(200) DEFAULT 'KCSE Chemistry Paper 3 Practical Exam',
     q1_score DECIMAL(5,2) DEFAULT 0.0,
     q2_score DECIMAL(5,2) DEFAULT 0.0,
     q3_score DECIMAL(5,2) DEFAULT 0.0,
     total_score DECIMAL(5,2) DEFAULT 0.0,
     grade VARCHAR(10) DEFAULT 'E',
     details JSONB,
     duration_seconds INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  // Ensure audit_logs exists
  `CREATE TABLE IF NOT EXISTS audit_logs (
     id SERIAL PRIMARY KEY,
     admin_email VARCHAR(200),
     action VARCHAR(100) NOT NULL,
     details TEXT,
     ip_address VARCHAR(45),
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  // Ensure system_announcements exists
  `CREATE TABLE IF NOT EXISTS system_announcements (
     id SERIAL PRIMARY KEY,
     title VARCHAR(200) NOT NULL,
     message TEXT NOT NULL,
     type VARCHAR(50) DEFAULT 'info',
     is_active BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  // Ensure teacher status exists
  `ALTER TABLE teachers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`,
  // Ensure student status exists
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`,
  // Ensure solubility_sessions exists for KCSE solubility curve experiments
  `CREATE TABLE IF NOT EXISTS solubility_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
     solute_key VARCHAR(50) NOT NULL,
     solute_name VARCHAR(150),
     experiment_title VARCHAR(200),
     solute_mass DECIMAL(6,2),
     solvent_volume DECIMAL(6,2),
     crystallization_temp DECIMAL(6,2),
     theoretical_temp DECIMAL(6,2),
     temp_difference DECIMAL(6,2),
     accuracy_score DECIMAL(5,2) DEFAULT 0.0,
     graph_score DECIMAL(5,2) DEFAULT 0.0,
     total_score DECIMAL(5,2) DEFAULT 0.0,
     trials_data JSONB,
     mode VARCHAR(20) DEFAULT 'selfPaced',
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  // Ensure energy_sessions exists for Thermochemistry & Energy changes experiments
  `CREATE TABLE IF NOT EXISTS energy_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
     system_id VARCHAR(100) NOT NULL,
     system_name VARCHAR(200),
     reaction_category VARCHAR(50),
     initial_temp DECIMAL(6,2),
     final_temp DECIMAL(6,2),
     temp_change DECIMAL(6,2),
     heat_quantity DECIMAL(10,2),
     moles DECIMAL(10,4),
     molar_enthalpy DECIMAL(10,2),
     theoretical_enthalpy DECIMAL(10,2),
     total_score DECIMAL(5,2) DEFAULT 0.0,
     rubric_breakdown JSONB,
     readings_data JSONB,
     equation_text TEXT,
     mode VARCHAR(20) DEFAULT 'practice',
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS rates_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
     experiment_type VARCHAR(50) NOT NULL,
     experiment_title VARCHAR(200),
     dilution_readings JSONB,
     table_score DECIMAL(5,2) DEFAULT 0.0,
     graph_score DECIMAL(5,2) DEFAULT 0.0,
     calc_score DECIMAL(5,2) DEFAULT 0.0,
     total_score DECIMAL(5,2) DEFAULT 0.0,
     grade VARCHAR(20),
     rubric_breakdown JSONB,
     answers JSONB,
     mode VARCHAR(20) DEFAULT 'practice',
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  // Ensure student_notifications exists for assignment notifications and due date reminders
  `CREATE TABLE IF NOT EXISTS student_notifications (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     title VARCHAR(200) NOT NULL,
     message TEXT NOT NULL,
     type VARCHAR(50) DEFAULT 'assignment',
     link VARCHAR(255),
     is_read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW()
   )`
];

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  for (const sql of migrations) {
    try {
      await pool.query(sql);
      console.log('✓', sql.substring(0, 60).trim(), '...');
    } catch (err) {
      console.error('✗ Migration failed:', err.message);
      console.error('  SQL:', sql);
      process.exitCode = 1;
    }
  }

  await pool.end();
  console.log('Migration complete.');
}

async function runMigrationsAsync(poolInstance) {
  const targetPool = poolInstance || require('./pool');
  for (const sql of migrations) {
    try {
      await targetPool.query(sql);
    } catch (err) {
      console.warn('[Migrate] Boot step note:', err.message);
    }
  }
}

if (require.main === module) {
  migrate().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}

module.exports = { migrate, runMigrationsAsync };


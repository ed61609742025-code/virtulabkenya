// ============================================================
//  VirtuLab Kenya — Database Migration Script
//  Run: node server/db/migrate.js
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Pool } = require('pg');

const migrations = [
  // Base Tables (Idempotent creation for fresh databases)
  `CREATE TABLE IF NOT EXISTS schools (
     id SERIAL PRIMARY KEY,
     name VARCHAR(200) NOT NULL,
     county VARCHAR(100),
     admin_code VARCHAR(20) UNIQUE NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS teachers (
     id SERIAL PRIMARY KEY,
     school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
     name VARCHAR(150) NOT NULL,
     email VARCHAR(200) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     teacher_code VARCHAR(20) UNIQUE,
     status VARCHAR(20) DEFAULT 'active',
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS students (
     id SERIAL PRIMARY KEY,
     school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
     teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
     name VARCHAR(150) NOT NULL,
     email VARCHAR(200) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     form VARCHAR(10),
     status VARCHAR(20) DEFAULT 'active',
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS assignments (
     id SERIAL PRIMARY KEY,
     teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
     school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
     title VARCHAR(200) NOT NULL,
     titration_type VARCHAR(50),
     instructions TEXT,
     due_date TIMESTAMP,
     exam_config JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS practical_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
     titration_type VARCHAR(50),
     titration_title VARCHAR(150),
     indicator_used VARCHAR(100),
     indicator_correct BOOLEAN,
     trials_count INTEGER DEFAULT 0,
     concordant_found BOOLEAN DEFAULT FALSE,
     trial_readings JSONB,
     student_answer DECIMAL(10,4),
     true_conc DECIMAL(10,4),
     difference DECIMAL(10,4),
     score INTEGER DEFAULT 0,
     details JSONB,
     mode VARCHAR(20) DEFAULT 'free',
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS qualitative_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     salt_key VARCHAR(50) NOT NULL,
     salt_name VARCHAR(100),
     true_cation VARCHAR(20) NOT NULL,
     true_anion VARCHAR(20) NOT NULL,
     student_cation VARCHAR(20),
     student_anion VARCHAR(20),
     cation_correct BOOLEAN DEFAULT false,
     anion_correct BOOLEAN DEFAULT false,
     tests_performed INTEGER DEFAULT 0,
     tests_correct INTEGER DEFAULT 0,
     observations JSONB,
     correct BOOLEAN DEFAULT false,
     mode VARCHAR(20) DEFAULT 'practice',
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS organic_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     compound_key VARCHAR(50) NOT NULL,
     compound_name VARCHAR(100),
     true_functional_group VARCHAR(50) NOT NULL,
     student_functional_group VARCHAR(50),
     functional_group_correct BOOLEAN DEFAULT false,
     tests_performed INTEGER DEFAULT 0,
     tests_correct INTEGER DEFAULT 0,
     observations JSONB,
     correct BOOLEAN DEFAULT false,
     mode VARCHAR(20) DEFAULT 'practice',
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
     questions_total INTEGER DEFAULT 4,
     questions_correct INTEGER DEFAULT 0,
     score_pct INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS assignment_submissions (
     id SERIAL PRIMARY KEY,
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     session_id INTEGER REFERENCES practical_sessions(id) ON DELETE SET NULL,
     qualitative_session_id INTEGER REFERENCES qualitative_sessions(id) ON DELETE SET NULL,
     organic_session_id INTEGER REFERENCES organic_sessions(id) ON DELETE SET NULL,
     composite_session_id INTEGER REFERENCES composite_sessions(id) ON DELETE SET NULL,
     solubility_session_id INTEGER REFERENCES solubility_sessions(id) ON DELETE SET NULL,
     energy_session_id INTEGER REFERENCES energy_sessions(id) ON DELETE SET NULL,
     rates_session_id INTEGER REFERENCES rates_sessions(id) ON DELETE SET NULL,
     gas_session_id INTEGER REFERENCES gas_sessions(id) ON DELETE SET NULL,
     status VARCHAR(20) DEFAULT 'submitted',
     teacher_feedback TEXT,
     submitted_at TIMESTAMP DEFAULT NOW(),
     marked_at TIMESTAMP,
     UNIQUE(assignment_id, student_id)
   )`,
  // Default Pilot Schools Seeding
  `INSERT INTO schools (name, county, admin_code) VALUES
     ('Alliance High School', 'Kiambu', 'KCS-ALLIANCE-001'),
     ('The Kenya High School', 'Nairobi', 'KCS-KENYAHI-002'),
     ('Nairobi School', 'Nairobi', 'KCS-NAIROBI-003'),
     ('Mang''u High School', 'Kiambu', 'KCS-MANGU-004'),
     ('Machakos Boys Secondary', 'Machakos', 'KCS-MACHAKOS-005')
   ON CONFLICT (admin_code) DO NOTHING`,
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
   )`,
  // Ensure gas_sessions exists for Gas Preparation and Collection practicals
  `CREATE TABLE IF NOT EXISTS gas_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
     gas_key VARCHAR(50) NOT NULL,
     gas_name VARCHAR(150),
     reactants VARCHAR(200),
     drying_agent VARCHAR(100),
     collection_method VARCHAR(100),
     drying_correct BOOLEAN DEFAULT FALSE,
     collection_correct BOOLEAN DEFAULT FALSE,
     tests_performed INTEGER DEFAULT 0,
     tests_correct INTEGER DEFAULT 0,
     test_observations JSONB,
     questions_score DECIMAL(5,2) DEFAULT 0.0,
     total_score DECIMAL(5,2) DEFAULT 0.0,
     rubric_breakdown JSONB,
     correct BOOLEAN DEFAULT FALSE,
     mode VARCHAR(20) DEFAULT 'selfPaced',
     duration_seconds INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  // Ensure research_assessments exists for CPCAT Pre/Post assessments
  `CREATE TABLE IF NOT EXISTS research_assessments (
     id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
     assessment_type VARCHAR(20) NOT NULL,
     title VARCHAR(200) DEFAULT 'Chemistry Practical Competency Achievement Test (CPCAT)',
     section_a_score DECIMAL(5,2) DEFAULT 0.0,
     section_b_score DECIMAL(5,2) DEFAULT 0.0,
     section_c_score DECIMAL(5,2) DEFAULT 0.0,
     section_d_score DECIMAL(5,2) DEFAULT 0.0,
     total_score DECIMAL(5,2) DEFAULT 0.0,
     max_score DECIMAL(5,2) DEFAULT 40.0,
     percentage DECIMAL(5,2) DEFAULT 0.0,
     answers JSONB,
     rubric_breakdown JSONB,
     duration_seconds INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  // Ensure research_surveys exists for SUS & TAM 3 instruments
  `CREATE TABLE IF NOT EXISTS research_surveys (
     id SERIAL PRIMARY KEY,
     user_id INTEGER,
     user_role VARCHAR(20) NOT NULL,
     school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
     survey_type VARCHAR(20) NOT NULL,
     responses JSONB NOT NULL,
     score DECIMAL(5,2),
     construct_scores JSONB,
     feedback_text TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   )`,
  // Ensure performance indexes exist
  `CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id)`,
  `CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id)`,
  `CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id)`,
  `CREATE INDEX IF NOT EXISTS idx_practical_sessions_student_id ON practical_sessions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_practical_sessions_created_at ON practical_sessions(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_qualitative_sessions_student_id ON qualitative_sessions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_organic_sessions_student_id ON organic_sessions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_composite_sessions_student_id ON composite_sessions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_solubility_sessions_student_id ON solubility_sessions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_energy_sessions_student_id ON energy_sessions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_rates_sessions_student_id ON rates_sessions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_gas_sessions_student_id ON gas_sessions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_gas_sessions_gas_key ON gas_sessions(gas_key)`,
  `CREATE INDEX IF NOT EXISTS idx_research_assessments_student_id ON research_assessments(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_research_assessments_type ON research_assessments(assessment_type)`,
  `CREATE INDEX IF NOT EXISTS idx_research_surveys_type ON research_surveys(survey_type)`,
  `CREATE INDEX IF NOT EXISTS idx_research_surveys_user_role ON research_surveys(user_role)`,
  `CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assignments_school_id ON assignments(school_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)`
];

async function migrate() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isCloudDb = dbUrl.includes('.neon.tech') || dbUrl.includes('.supabase.co') || dbUrl.includes('.pooler.supabase.com') || dbUrl.includes('render.com') || dbUrl.includes('railway.app') || (process.env.NODE_ENV === 'production' && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'));

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isCloudDb ? { rejectUnauthorized: false } : false
  });

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
  const fs = require('fs');
  const path = require('path');

  // Step 1: Execute complete base schema
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await targetPool.query(schemaSql);
    console.log('[Migrate] Base schema.sql synchronized successfully.');
  } catch (err) {
    console.warn('[Migrate] Base schema note:', err.message);
  }

  // Step 2: Execute incremental column migrations and seed updates
  for (const sql of migrations) {
    try {
      await targetPool.query(sql);
    } catch (err) {
      console.warn('[Migrate] Step note:', err.message);
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


-- ============================================================
--  VirtuLab Kenya — Safe Incremental Migration Script
--  Run this on Render (or any existing DB) to bring the schema
--  up to date without losing any existing data.
--  Every statement uses IF NOT EXISTS / IF EXISTS guards.
-- ============================================================

-- 1. New session tables

CREATE TABLE IF NOT EXISTS solubility_sessions (
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
);

CREATE TABLE IF NOT EXISTS energy_sessions (
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
);

CREATE TABLE IF NOT EXISTS rates_sessions (
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
);

CREATE TABLE IF NOT EXISTS gas_sessions (
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
);

CREATE TABLE IF NOT EXISTS student_notifications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'assignment',
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_assessments (
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
);

CREATE TABLE IF NOT EXISTS research_surveys (
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
);

-- 2. New columns on assignment_submissions
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS qualitative_session_id INTEGER REFERENCES qualitative_sessions(id) ON DELETE SET NULL;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS organic_session_id INTEGER REFERENCES organic_sessions(id) ON DELETE SET NULL;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS composite_session_id INTEGER REFERENCES composite_sessions(id) ON DELETE SET NULL;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS solubility_session_id INTEGER REFERENCES solubility_sessions(id) ON DELETE SET NULL;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS energy_session_id INTEGER REFERENCES energy_sessions(id) ON DELETE SET NULL;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS rates_session_id INTEGER REFERENCES rates_sessions(id) ON DELETE SET NULL;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS gas_session_id INTEGER REFERENCES gas_sessions(id) ON DELETE SET NULL;

-- 3. Other missing columns
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS exam_config JSONB;

-- 4. Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_solubility_sessions_student_id ON solubility_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_energy_sessions_student_id ON energy_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_rates_sessions_student_id ON rates_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_gas_sessions_student_id ON gas_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_gas_sessions_gas_key ON gas_sessions(gas_key);
CREATE INDEX IF NOT EXISTS idx_research_assessments_student_id ON research_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_research_assessments_type ON research_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_research_surveys_type ON research_surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_research_surveys_user_role ON research_surveys(user_role);
CREATE INDEX IF NOT EXISTS idx_student_notifications_student_id ON student_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_is_read ON student_notifications(is_read);

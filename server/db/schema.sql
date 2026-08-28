-- ============================================================
--  VirtuLab Kenya — Database Schema
--  Run this file once to set up the database
-- ============================================================

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  county VARCHAR(100),
  admin_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  teacher_code VARCHAR(20) UNIQUE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  form VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- System administrators table for multi-admin support & RBAC
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',        -- 'superadmin' | 'admin'
  status VARCHAR(20) DEFAULT 'active',     -- 'active' | 'suspended'
  created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assignments table (created before sessions to satisfy foreign key references)
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  titration_type VARCHAR(50),
  instructions TEXT,
  due_date TIMESTAMP,
  exam_config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Practical sessions table
CREATE TABLE IF NOT EXISTS practical_sessions (
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
  true_value DECIMAL(10,4),
  type VARCHAR(50),
  true_conc DECIMAL(10,4),
  difference DECIMAL(10,4),
  correct BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  mode VARCHAR(20) DEFAULT 'free',
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES practical_sessions(id),
  status VARCHAR(20) DEFAULT 'pending',
  teacher_feedback TEXT,
  marked_at TIMESTAMP,
  submitted_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_student_assignment UNIQUE (assignment_id, student_id)
);

-- Qualitative analysis sessions table
-- Separate from practical_sessions (titrations) since the data shape
-- is genuinely different — no burette readings or concentration
-- math, just observations against a set of standard tests plus a
-- final cation/anion identification.
CREATE TABLE IF NOT EXISTS qualitative_sessions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  salt_key VARCHAR(50) NOT NULL,
  salt_name VARCHAR(150),
  true_cation VARCHAR(20),
  true_anion VARCHAR(20),
  student_cation VARCHAR(20),
  student_anion VARCHAR(20),
  cation_correct BOOLEAN DEFAULT FALSE,
  anion_correct BOOLEAN DEFAULT FALSE,
  tests_performed INTEGER DEFAULT 0,
  tests_correct INTEGER DEFAULT 0,
  observations JSONB,
  correct BOOLEAN DEFAULT FALSE,
  mode VARCHAR(20) DEFAULT 'selfPaced',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organic chemistry sessions table
CREATE TABLE IF NOT EXISTS organic_sessions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  compound_key VARCHAR(50) NOT NULL,
  compound_name VARCHAR(150),
  true_functional_group VARCHAR(50),
  student_functional_group VARCHAR(50),
  functional_group_correct BOOLEAN DEFAULT FALSE,
  tests_performed INTEGER DEFAULT 0,
  tests_correct INTEGER DEFAULT 0,
  questions_total INTEGER DEFAULT 4,
  questions_correct INTEGER DEFAULT 0,
  score_pct INTEGER DEFAULT 0,
  observations JSONB,
  correct BOOLEAN DEFAULT FALSE,
  mode VARCHAR(20) DEFAULT 'selfPaced',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Composite practical exam sessions table (40 Marks total)
CREATE TABLE IF NOT EXISTS composite_sessions (
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
);

-- Audit logs table for security activity tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_email VARCHAR(200),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- System announcements table for broadcast alerts
CREATE TABLE IF NOT EXISTS system_announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Solubility curve and crystallization practical sessions table
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

-- Thermochemistry and energy changes in reactions practical sessions table
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

-- Reaction rates & chemical kinetics practical sessions table
CREATE TABLE IF NOT EXISTS rates_sessions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  experiment_type VARCHAR(50) NOT NULL, -- 'cross' | 'syringe' | 'mass' | 'catalyst' | 'collision'
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

-- Student assignment notifications and reminder alerts table
CREATE TABLE IF NOT EXISTS student_notifications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'assignment', -- 'assignment', 'due_soon', 'feedback', 'announcement'
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gas preparation and collection practical sessions table (KCSE Paper 3)
CREATE TABLE IF NOT EXISTS gas_sessions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  gas_key VARCHAR(50) NOT NULL, -- 'O2', 'CO2', 'Cl2', 'NH3', 'SO2', 'H2'
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

-- Standardized Chemistry Practical Competency Achievement Test (CPCAT Pre/Post) assessments table
CREATE TABLE IF NOT EXISTS research_assessments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  assessment_type VARCHAR(20) NOT NULL, -- 'pre_test' | 'post_test'
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

-- Usability & Technology Acceptance Research Surveys table (SUS & TAM 3)
CREATE TABLE IF NOT EXISTS research_surveys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_role VARCHAR(20) NOT NULL, -- 'student' | 'teacher'
  school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
  survey_type VARCHAR(20) NOT NULL, -- 'SUS' | 'TAM'
  responses JSONB NOT NULL,
  score DECIMAL(5,2),
  construct_scores JSONB,
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Performance Indexes ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_practical_sessions_student_id ON practical_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_practical_sessions_created_at ON practical_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qualitative_sessions_student_id ON qualitative_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_organic_sessions_student_id ON organic_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_composite_sessions_student_id ON composite_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_solubility_sessions_student_id ON solubility_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_energy_sessions_student_id ON energy_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_rates_sessions_student_id ON rates_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_gas_sessions_student_id ON gas_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_gas_sessions_gas_key ON gas_sessions(gas_key);
CREATE INDEX IF NOT EXISTS idx_research_assessments_student_id ON research_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_research_assessments_type ON research_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_research_surveys_type ON research_surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_research_surveys_user_role ON research_surveys(user_role);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_school_id ON assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);


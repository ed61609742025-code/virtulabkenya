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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Practical sessions table
CREATE TABLE IF NOT EXISTS practical_sessions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  titration_type VARCHAR(50) NOT NULL,
  titration_title VARCHAR(150),
  indicator_used VARCHAR(100),
  indicator_correct BOOLEAN,
  trials_count INTEGER DEFAULT 0,
  concordant_found BOOLEAN DEFAULT FALSE,
  student_answer DECIMAL(10,4),
  true_value DECIMAL(10,4),
  correct BOOLEAN DEFAULT FALSE,
  duration_seconds INTEGER,
  mode VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  titration_type VARCHAR(50),
  instructions TEXT,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES practical_sessions(id),
  submitted_at TIMESTAMP DEFAULT NOW()
);

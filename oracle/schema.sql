-- Klarity AI — Oracle ATP Schema (run as klarity_app)
-- Run drop-schema.sql first if objects already exist.

-- Profiles (id = Supabase auth user id)
CREATE TABLE profiles (
  id VARCHAR2(36) PRIMARY KEY,
  email VARCHAR2(255),
  display_name VARCHAR2(255),
  avatar_url VARCHAR2(500),
  oci_credly_username VARCHAR2(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE customers (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR2(255) NOT NULL,
  slug VARCHAR2(255),
  notes CLOB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notes
CREATE TABLE notes (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id VARCHAR2(36) REFERENCES customers(id) ON DELETE SET NULL,
  title VARCHAR2(500) NOT NULL,
  body CLOB,
  source VARCHAR2(50) DEFAULT 'manual',
  transcript CLOB,
  audio_url VARCHAR2(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Certification catalog
CREATE TABLE certification_catalog (
  id VARCHAR2(36) PRIMARY KEY,
  external_id VARCHAR2(255) UNIQUE,
  name VARCHAR2(255) NOT NULL,
  cert_level VARCHAR2(100),
  description CLOB,
  exam_url VARCHAR2(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Badge catalog
CREATE TABLE badge_catalog (
  id VARCHAR2(36) PRIMARY KEY,
  external_id VARCHAR2(255) UNIQUE,
  name VARCHAR2(255) NOT NULL,
  image_url VARCHAR2(500),
  description CLOB,
  badge_source VARCHAR2(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements
CREATE TABLE achievements (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR2(50) NOT NULL,
  certification_id VARCHAR2(36) REFERENCES certification_catalog(id) ON DELETE SET NULL,
  badge_id VARCHAR2(36) REFERENCES badge_catalog(id) ON DELETE SET NULL,
  custom_title VARCHAR2(500),
  custom_description CLOB,
  earned_at DATE NOT NULL,
  credential_url VARCHAR2(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning progress
CREATE TABLE learning_progress (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lp_source VARCHAR2(100) NOT NULL,
  title VARCHAR2(500) NOT NULL,
  external_url VARCHAR2(500),
  progress_percent NUMBER(3) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_progress_pct CHECK (progress_percent >= 0 AND progress_percent <= 100)
);

-- Goals
CREATE TABLE goals (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR2(500) NOT NULL,
  target_date DATE,
  linked_certification_id VARCHAR2(36) REFERENCES certification_catalog(id) ON DELETE SET NULL,
  status VARCHAR2(50) DEFAULT 'active',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily plans
CREATE TABLE daily_plans (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  content CLOB,
  notes CLOB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT daily_plans_user_date_uq UNIQUE (user_id, plan_date)
);

-- Work logs
CREATE TABLE work_logs (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  summary VARCHAR2(2000) NOT NULL,
  customer_id VARCHAR2(36) REFERENCES customers(id) ON DELETE SET NULL,
  minutes NUMBER(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review entries (app provides period_type, e.g. 'weekly')
CREATE TABLE review_entries (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content CLOB NOT NULL,
  period_type VARCHAR2(50) NOT NULL,
  period_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional indexes (skip if ORA-01408; PK/UNIQUE already create indexes)
-- Run these only if needed for performance:
-- CREATE INDEX idx_achievements_user ON achievements(user_id);
-- CREATE INDEX idx_work_logs_user ON work_logs(user_id);
-- CREATE INDEX idx_work_logs_date ON work_logs(user_id, log_date DESC);

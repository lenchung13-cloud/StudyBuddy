-- Supabase Migration Script for StudyBuddy
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools Table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  year_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters Table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  chapter_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
  full_name VARCHAR(255),
  age INTEGER,
  grade_level INTEGER,
  avatar_url TEXT,
  privacy_alias VARCHAR(100),
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Logs Table
CREATE TABLE IF NOT EXISTS study_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  minutes INTEGER NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Grades Table
CREATE TABLE IF NOT EXISTS daily_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  grade VARCHAR(1),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly Progress Table
CREATE TABLE IF NOT EXISTS weekly_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  days_completed INTEGER DEFAULT 0,
  average_grade DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges Table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id VARCHAR(100) NOT NULL,
  badge_name VARCHAR(255) NOT NULL,
  badge_icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(100) NOT NULL,
  badge_name VARCHAR(255) NOT NULL,
  badge_icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id VARCHAR(100) NOT NULL,
  reward_name VARCHAR(255) NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  cost INTEGER NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unlocked Rewards Table
CREATE TABLE IF NOT EXISTS unlocked_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  reward_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reward_type, reward_id)
);

-- Tests Table
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  level INTEGER,
  title VARCHAR(255) NOT NULL,
  questions JSONB,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  action TEXT,
  priority VARCHAR(20),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  privacy_alias VARCHAR(100),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Certificate Awards Table
CREATE TABLE IF NOT EXISTS certificate_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  certificate_template_id VARCHAR(100) NOT NULL,
  certificate_name VARCHAR(255) NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, certificate_template_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_academic_years_school ON academic_years(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_school ON student_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_academic_year ON student_profiles(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_user ON study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_date ON study_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_grades_user ON daily_grades(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_user ON weekly_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_rewards_user ON unlocked_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_school ON leaderboard(school_id);
CREATE INDEX IF NOT EXISTS idx_certificate_awards_user ON certificate_awards(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_years_updated_at ON academic_years;
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_logs_updated_at ON study_logs;
CREATE TRIGGER update_study_logs_updated_at BEFORE UPDATE ON study_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_grades_updated_at ON daily_grades;
CREATE TRIGGER update_daily_grades_updated_at BEFORE UPDATE ON daily_grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_progress_updated_at ON weekly_progress;
CREATE TRIGGER update_weekly_progress_updated_at BEFORE UPDATE ON weekly_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tests_updated_at ON tests;
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard;
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample school data
INSERT INTO schools (name, location, contact_email) VALUES
  ('Refugee Community School KL', 'Kuala Lumpur', 'contact@refugeeschool.edu'),
  ('International Learning Center', 'Penang', 'info@ilc.edu')
ON CONFLICT DO NOTHING;

-- Insert sample academic year data
INSERT INTO academic_years (school_id, year_name, start_date, end_date) VALUES
  ((SELECT id FROM schools WHERE name = 'Refugee Community School KL' LIMIT 1), '2025/2026', '2025-03-01', '2025-11-30')
ON CONFLICT DO NOTHING;

-- Insert sample subject data
INSERT INTO subjects (school_id, name, description) VALUES
  ((SELECT id FROM schools WHERE name = 'Refugee Community School KL' LIMIT 1), 'Mathematics', 'Basic and advanced mathematics'),
  ((SELECT id FROM schools WHERE name = 'Refugee Community School KL' LIMIT 1), 'English', 'English language and literature'),
  ((SELECT id FROM schools WHERE name = 'Refugee Community School KL' LIMIT 1), 'Science', 'General science curriculum'),
  ((SELECT id FROM schools WHERE name = 'Refugee Community School KL' LIMIT 1), 'History', 'World and local history')
ON CONFLICT DO NOTHING;

-- Insert sample badge data
INSERT INTO badges (badge_id, badge_name, badge_icon, description) VALUES
  ('first_study', 'First Steps', '🚀', 'Complete your first study session'),
  ('week_warrior', 'Week Warrior', '⚔️', 'Study for 7 consecutive days'),
  ('chapter_master', 'Chapter Master', '📚', 'Complete 10 chapters'),
  ('streak_champion', 'Streak Champion', '🔥', 'Maintain a 14-day streak')
ON CONFLICT DO NOTHING;

-- Insert sample reward data
INSERT INTO rewards (reward_id, reward_name, reward_type, cost, icon, description) VALUES
  ('avatar_1', 'Explorer', 'avatar', 500, '🧭', 'Explorer avatar theme'),
  ('avatar_2', 'Scholar', 'avatar', 750, '🎓', 'Scholar avatar theme'),
  ('frame_1', 'Bronze Frame', 'frame', 300, '🟤', 'Bronze profile frame'),
  ('frame_2', 'Silver Frame', 'frame', 500, '⚪', 'Silver profile frame'),
  ('theme_1', 'Ocean Blue', 'theme', 400, '🌊', 'Ocean blue theme')
ON CONFLICT DO NOTHING;

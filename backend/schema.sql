-- StudyBuddy Production Database Schema
-- PostgreSQL Database Schema with 11+ tables

-- 1.1 Schools Table
CREATE TABLE IF NOT EXISTS schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) NOT NULL,
    year_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Subjects Table (custom per school)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Chapters Table (custom per subject)
CREATE TABLE IF NOT EXISTS chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    chapter_number INTEGER,
    chapter_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (for authentication - replacing auth.users reference)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Student Profiles (extended)
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID REFERENCES users(id) PRIMARY KEY,
    school_id UUID REFERENCES schools(id),
    full_name TEXT,
    age INTEGER,
    grade_level INTEGER,
    avatar_url TEXT,
    privacy_alias TEXT UNIQUE,
    current_level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_study_date DATE,
    academic_year_id UUID REFERENCES academic_years(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Study Logs (enhanced)
CREATE TABLE IF NOT EXISTS study_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES student_profiles(id) NOT NULL,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    chapter_id UUID REFERENCES chapters(id),
    minutes INTEGER CHECK (minutes >= 0),
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 Grades & Progress
CREATE TABLE IF NOT EXISTS daily_grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES student_profiles(id) NOT NULL,
    date DATE NOT NULL,
    grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    points_earned INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES student_profiles(id) NOT NULL,
    week_start DATE,
    week_end DATE,
    total_minutes INTEGER,
    days_completed INTEGER,
    average_grade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 Badges & Rewards
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points_required INTEGER,
    category TEXT CHECK (category IN ('Streak', 'Mastery', 'Consistency', 'Achievement')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_id UUID REFERENCES student_profiles(id),
    badge_id UUID REFERENCES badges(id),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- Unlocked Rewards (cosmetic items)
CREATE TABLE IF NOT EXISTS unlocked_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES student_profiles(id) NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    reward_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, reward_type, reward_id)
);

-- 1.9 Tests & Evaluations
CREATE TABLE IF NOT EXISTS tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    level INTEGER NOT NULL,
    title TEXT NOT NULL,
    questions JSONB,
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES student_profiles(id) NOT NULL,
    test_id UUID REFERENCES tests(id) NOT NULL,
    score INTEGER,
    passed BOOLEAN,
    taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES student_profiles(id) NOT NULL,
    message TEXT,
    category TEXT CHECK (category IN ('Improvement', 'Motivation', 'Challenge', 'Review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

-- 1.11 Admin Roles
CREATE TABLE IF NOT EXISTS admins (
    id UUID REFERENCES users(id) PRIMARY KEY,
    school_id UUID REFERENCES schools(id),
    role TEXT CHECK (role IN ('SuperAdmin', 'SchoolAdmin', 'Teacher')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard table (for gamification)
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES student_profiles(id) NOT NULL,
    privacy_alias TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    school_id UUID REFERENCES schools(id),
    rank INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Certificate Awards table
CREATE TABLE IF NOT EXISTS certificate_awards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES student_profiles(id) NOT NULL,
    certificate_template_id VARCHAR(50) NOT NULL,
    certificate_name TEXT NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, certificate_template_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_academic_years_school_id ON academic_years(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_school_id ON student_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_academic_year_id ON student_profiles(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_id ON study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_date ON study_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_grades_user_id ON daily_grades(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_user_id ON weekly_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_subject_id ON tests(subject_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_school_id ON admins(school_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard(xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

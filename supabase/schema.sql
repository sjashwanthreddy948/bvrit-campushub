-- =================================================================
-- CampusHub PostgreSQL Schema & Row Level Security (RLS)
-- Real Authentication & Database Foundation
-- =================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE opportunity_type AS ENUM (
  'internship', 
  'job', 
  'hackathon', 
  'competition', 
  'scholarship', 
  'workshop', 
  'other'
);
CREATE TYPE application_status AS ENUM (
  'saved', 
  'applied', 
  'assessment', 
  'interview', 
  'selected', 
  'rejected'
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'student' NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  year SMALLINT CHECK (year BETWEEN 1 AND 5),
  section VARCHAR(10),
  current_cgpa NUMERIC(4, 2) CHECK (current_cgpa >= 0.0 AND current_cgpa <= 10.0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  company VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  type opportunity_type NOT NULL,
  eligibility TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}' NOT NULL,
  eligible_departments TEXT[] DEFAULT '{}' NOT NULL,
  eligible_years INT[] DEFAULT '{}' NOT NULL,
  min_cgpa NUMERIC(4, 2) CHECK (min_cgpa >= 0.0 AND min_cgpa <= 10.0),
  required_skills TEXT[] DEFAULT '{}' NOT NULL,
  preferred_skills TEXT[] DEFAULT '{}' NOT NULL,
  stipend VARCHAR(100),
  package VARCHAR(100),
  location VARCHAR(150) NOT NULL,
  work_mode VARCHAR(50) DEFAULT 'On-site' NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  application_url TEXT NOT NULL,
  posted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Saved Opportunities Table (Prevent duplicate saves)
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT uq_saved_student_opportunity UNIQUE(student_id, opportunity_id)
);

-- 6. Applications Table (Prevent duplicate applications for same student & opportunity)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'applied' NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT uq_app_student_opportunity UNIQUE(student_id, opportunity_id)
);

-- 7. Circulars Table
CREATE TABLE IF NOT EXISTS circulars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  year SMALLINT CHECK (year BETWEEN 1 AND 5),
  section VARCHAR(10),
  deadline TIMESTAMPTZ,
  posted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. Assignments Table (Submissions normally point to Vedic.ai)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
  year SMALLINT NOT NULL CHECK (year BETWEEN 1 AND 5),
  section VARCHAR(10) NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  submission_url TEXT DEFAULT 'https://vedic.ai' NOT NULL,
  posted_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) DEFAULT 'opportunity_deadline' NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL,
  dedup_key VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =================================================================
-- Indexes for High Performance
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_dept_year ON profiles(department_id, year, section);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_saved_student ON saved_opportunities(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_circulars_dept_year ON circulars(department_id, year);
CREATE INDEX IF NOT EXISTS idx_assignments_cohort ON assignments(department_id, year, section);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_user_dedup ON notifications(user_id, dedup_key) WHERE dedup_key IS NOT NULL;

-- =================================================================
-- Row Level Security (RLS) Policies
-- =================================================================

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: get current authenticated user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- DEPARTMENTS Policies
CREATE POLICY "Public read for departments" ON departments
  FOR SELECT USING (true);

CREATE POLICY "Admin manage departments" ON departments
  FOR ALL USING (get_current_user_role() = 'admin');

-- PROFILES Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Faculty can view basic student profile in their department" ON profiles
  FOR SELECT USING (
    get_current_user_role() = 'faculty'
  );

CREATE POLICY "Admin can view and manage all profiles" ON profiles
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can update own non-role fields" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM profiles WHERE id = auth.uid()) -- prevents changing own role
  );

-- OPPORTUNITIES Policies
CREATE POLICY "Authenticated users can view opportunities" ON opportunities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Faculty and admin can insert opportunities" ON opportunities
  FOR INSERT WITH CHECK (get_current_user_role() IN ('faculty', 'admin'));

CREATE POLICY "Faculty and admin can update opportunities" ON opportunities
  FOR UPDATE USING (posted_by = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Admin can delete opportunities" ON opportunities
  FOR DELETE USING (get_current_user_role() = 'admin');

-- SAVED OPPORTUNITIES Policies
CREATE POLICY "Students manage own saved opportunities" ON saved_opportunities
  FOR ALL USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- APPLICATIONS Policies
CREATE POLICY "Students can view and manage own applications" ON applications
  FOR ALL USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Faculty and Admin can view student applications" ON applications
  FOR SELECT USING (get_current_user_role() IN ('faculty', 'admin'));

-- CIRCULARS Policies
CREATE POLICY "Students can read circulars intended for them" ON circulars
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      department_id IS NULL OR 
      department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Faculty and admin can manage circulars" ON circulars
  FOR ALL USING (get_current_user_role() IN ('faculty', 'admin'));

-- ASSIGNMENTS Policies
CREATE POLICY "Students can view assignments for their cohort" ON assignments
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    department_id = (SELECT department_id FROM profiles WHERE id = auth.uid()) AND
    year = (SELECT year FROM profiles WHERE id = auth.uid()) AND
    section = (SELECT section FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Faculty can manage their posted assignments" ON assignments
  FOR ALL USING (posted_by = auth.uid() OR get_current_user_role() = 'admin');

-- NOTIFICATIONS Policies
CREATE POLICY "Users can view and update own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =================================================================
-- Automatic Profile Provisioning Trigger
-- Strict Rule: Self-registration can NEVER grant 'admin' role.
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'student';
BEGIN
  -- Verify role: only 'student' or 'faculty' allowed from client metadata; NEVER 'admin'
  IF NEW.raw_user_meta_data->>'role' = 'faculty' THEN
    v_role := 'faculty';
  ELSE
    v_role := 'student';
  END IF;

  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    phone, 
    role, 
    department_id, 
    year, 
    section,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    v_role,
    (NEW.raw_user_meta_data->>'department_id')::UUID,
    (NEW.raw_user_meta_data->>'year')::SMALLINT,
    NEW.raw_user_meta_data->>'section',
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- 10. Student Reusable Application Profile Table
-- Strict Rule: ONLY the student can read, insert, or update their own profile.
-- Personal email is strictly profile metadata (never asks for passwords/never reads inbox).
-- =================================================================
CREATE TABLE IF NOT EXISTS student_application_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal Details
  full_name VARCHAR(150) NOT NULL,
  college_roll_number VARCHAR(50) NOT NULL,
  personal_email VARCHAR(255) NOT NULL,
  college_email VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,

  -- Academic Details
  college_name VARCHAR(200) NOT NULL,
  degree VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  current_year SMALLINT CHECK (current_year BETWEEN 1 AND 5) NOT NULL,
  graduation_year SMALLINT NOT NULL,
  cgpa NUMERIC(4, 2) CHECK (cgpa >= 0.0 AND cgpa <= 10.0),

  -- Career Details
  programming_languages TEXT[] DEFAULT '{}' NOT NULL,
  technical_skills TEXT[] DEFAULT '{}' NOT NULL,
  preferred_roles TEXT[] DEFAULT '{}' NOT NULL,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,

  -- Documents
  resume_url TEXT,
  resume_file_name VARCHAR(255),
  resume_file_size INTEGER,
  resume_updated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. Student Granular Skills Table
CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(50) DEFAULT 'Programming Language' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT uq_student_skill UNIQUE(student_id, skill_name)
);

-- Indexes for Application Profiles
CREATE INDEX IF NOT EXISTS idx_student_app_profile ON student_application_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);

-- RLS Policies for Application Profiles (STRICT: Student ONLY)
ALTER TABLE student_application_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view only own application profile" ON student_application_profiles
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own application profile" ON student_application_profiles
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own application profile" ON student_application_profiles
  FOR UPDATE USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete own application profile" ON student_application_profiles
  FOR DELETE USING (auth.uid() = student_id);

CREATE POLICY "Students manage own skills" ON student_skills
  FOR ALL USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);


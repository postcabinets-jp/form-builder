-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self" ON profiles FOR ALL USING (auth.uid() = id);

-- Forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{"mode":"conversational","brandColor":"#111111","showProgressBar":true,"thankYouMessage":"Thank you for your response!"}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forms_owner" ON forms FOR ALL USING (auth.uid() = user_id);

-- Index for slug lookups (used on public form pages)
CREATE INDEX idx_forms_slug ON forms (slug);
CREATE INDEX idx_forms_user_id ON forms (user_id);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text','email','number','select','multi_select','rating','date','file')),
  title TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]',
  logic JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_owner" ON questions FOR ALL
  USING (form_id IN (SELECT id FROM forms WHERE user_id = auth.uid()));

-- Allow public read for questions of published forms
CREATE POLICY "questions_public_read" ON questions FOR SELECT
  USING (form_id IN (SELECT id FROM forms WHERE is_published = true));

CREATE INDEX idx_questions_form_id ON questions (form_id, sort_order);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms ON DELETE CASCADE NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submissions_owner" ON submissions FOR SELECT
  USING (form_id IN (SELECT id FROM forms WHERE user_id = auth.uid()));
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "submissions_update_own" ON submissions FOR UPDATE USING (true);

CREATE INDEX idx_submissions_form_id ON submissions (form_id);
CREATE INDEX idx_submissions_completed ON submissions (form_id, is_complete, completed_at);

-- Answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions ON DELETE CASCADE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers_owner" ON answers FOR SELECT
  USING (submission_id IN (
    SELECT s.id FROM submissions s
    JOIN forms f ON f.id = s.form_id
    WHERE f.user_id = auth.uid()
  ));
CREATE POLICY "answers_insert" ON answers FOR INSERT WITH CHECK (true);

CREATE INDEX idx_answers_submission_id ON answers (submission_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

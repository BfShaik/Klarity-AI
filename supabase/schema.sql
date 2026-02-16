-- Klarity AI — Full schema. Run in Supabase SQL Editor (Dashboard > SQL Editor).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  oci_credly_username TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notes
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  source TEXT DEFAULT 'manual',
  transcript TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Certification catalog (reference)
CREATE TABLE public.certification_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  level TEXT,
  description TEXT,
  exam_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Badge catalog (reference)
CREATE TABLE public.badge_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  certification_id UUID REFERENCES public.certification_catalog(id) ON DELETE SET NULL,
  badge_id UUID REFERENCES public.badge_catalog(id) ON DELETE SET NULL,
  custom_title TEXT,
  custom_description TEXT,
  earned_at DATE NOT NULL,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX achievements_user_cert_unique ON public.achievements(user_id, certification_id) WHERE certification_id IS NOT NULL;
CREATE UNIQUE INDEX achievements_user_badge_unique ON public.achievements(user_id, badge_id) WHERE badge_id IS NOT NULL;

-- Learning progress
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  external_url TEXT,
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE,
  linked_certification_id UUID REFERENCES public.certification_catalog(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily plans
CREATE TABLE public.daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Work logs
CREATE TABLE public.work_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  minutes INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_earned_at ON public.achievements(earned_at DESC);
CREATE INDEX idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_customer_id ON public.notes(customer_id);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_daily_plans_user_id ON public.daily_plans(user_id);
CREATE INDEX idx_daily_plans_user_date ON public.daily_plans(user_id, date);
CREATE INDEX idx_work_logs_user_id ON public.work_logs(user_id);
CREATE INDEX idx_work_logs_user_date ON public.work_logs(user_id, date DESC);

-- RLS: enable on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Catalogs: read for authenticated
CREATE POLICY "cert_catalog_read" ON public.certification_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "badge_catalog_read" ON public.badge_catalog FOR SELECT TO authenticated USING (true);

-- User-scoped tables: CRUD own rows
CREATE POLICY "customers_all_own" ON public.customers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notes_all_own" ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "achievements_all_own" ON public.achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "learning_progress_all_own" ON public.learning_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goals_all_own" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_plans_all_own" ON public.daily_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "work_logs_all_own" ON public.work_logs FOR ALL USING (auth.uid() = user_id);

-- Profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- One-time backfill: if you see error 23503 when adding a customer, your user may have no profile.
-- Run this once in Supabase SQL Editor to create profiles for existing auth users:
--   INSERT INTO public.profiles (id, email)
--   SELECT id, email FROM auth.users
--   ON CONFLICT (id) DO NOTHING;

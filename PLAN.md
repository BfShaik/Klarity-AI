# Klarity AI — Project Plan

A Next.js app that helps you **track your work**: achievements (certifications, badges, milestones), learning paths and goals, **customer work notes** with **voice recording and speech-to-text**, a **daily planner**, **work log**, and **manager review** summaries (weekly / monthly / quarterly / annual). It uses **AI** for summary and report generation, for creating and refining notes from your input (with approval before storage in a consistent format), and **semantic and keyword search** across all content so you can pull the information you need when you search.

---

## Requirements Summary (One-Pager)

**What it is** — Klarity AI is a personal work ledger: a Next.js web app that helps you track your work, plan your days, log what you did, and turn that into summaries for manager reviews (weekly, monthly, quarterly, annual). It uses **AI** for summary and report generation, for creating and refining notes from your input (with approval before storage), and for **semantic and keyword search** so you can find all relevant information quickly.

**Features** — Auth & profile; achievements (certifications, badges, milestones); learning & goals; customer work notes (typed or voice-to-text); **AI note creation & approval** (create from input, AI suggests edits, review and approve, store in a consistent format); daily planner; work log; **AI summary & reports** from plans, work log, and notes; manager review with **AI-assisted summary**; **semantic and keyword search** across notes, work log, plans, and achievements; dashboard; settings.

**Tech** — Next.js 14+ (App Router), Supabase (PostgreSQL, Auth, optional Storage), TypeScript, Tailwind, Shadcn-style UI. AI for summarization, note refinement, and report generation; semantic + keyword search (e.g. embeddings + full-text). Single-user; all data scoped to the signed-in user.

---

## 1. Next.js Folder Structure (App Router)

```
klarity-ai/
├── app/
│   ├── layout.tsx                 # Root layout (fonts, providers)
│   ├── page.tsx                   # Home / dashboard
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts            # Supabase auth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Dashboard shell (nav, sidebar)
│   │   ├── achievements/
│   │   │   ├── page.tsx           # List / grid of achievements
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Single achievement detail
│   │   ├── certifications/
│   │   │   ├── page.tsx           # OCI certifications list
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Certification detail + progress
│   │   ├── badges/
│   │   │   └── page.tsx           # OCI badges (digital credentials)
│   │   ├── learning/
│   │   │   └── page.tsx           # Learning paths / courses progress
│   │   ├── goals/
│   │   │   └── page.tsx           # Goals & milestones
│   │   ├── notes/
│   │   │   ├── page.tsx           # Notes list (filter by customer)
│   │   │   ├── new/
│   │   │   │   └── page.tsx       # New note (with voice record)
│   │   │   └── [id]/
│   │   │       └── page.tsx       # View / edit note
│   │   ├── planner/
│   │   │   └── page.tsx           # Daily planner (today or pick date)
│   │   ├── work-log/
│   │   │   └── page.tsx           # Work log list + add/edit entry
│   │   ├── reviews/
│   │   │   └── page.tsx           # Manager review (weekly/monthly/quarterly/annual)
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       ├── achievements/
│       │   └── route.ts
│       ├── certifications/
│       │   └── route.ts
│       ├── notes/
│       │   └── route.ts
│       ├── planner/
│       │   └── route.ts           # or api/daily-plans/
│       ├── work-logs/
│       │   └── route.ts
│       ├── transcribe/
│       │   └── route.ts           # Voice file → text (e.g. Whisper)
│       ├── ai/
│       │   └── route.ts           # Summarize, refine note, generate report
│       ├── search/
│       │   └── route.ts           # Semantic + keyword search
│       └── webhooks/
│           └── route.ts           # Optional: external webhooks
├── components/
│   ├── ui/                        # Shadcn-style primitives
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── DashboardShell.tsx
│   ├── achievements/
│   │   ├── AchievementCard.tsx
│   │   ├── AchievementGrid.tsx
│   │   └── AchievementProgress.tsx
│   ├── certifications/
│   │   ├── CertificationCard.tsx
│   │   └── CertificationProgress.tsx
│   ├── badges/
│   │   └── BadgeDisplay.tsx
│   ├── notes/
│   │   ├── NoteCard.tsx
│   │   ├── NoteEditor.tsx
│   │   ├── NoteList.tsx
│   │   ├── NoteAIRefine.tsx       # AI suggest edits, approve, save in nice format
│   │   └── CustomerSelect.tsx     # Link note to customer
│   ├── voice/
│   │   ├── VoiceRecorder.tsx      # Record in browser, optional upload
│   │   ├── VoiceRecordButton.tsx  # Start/stop + waveform or timer
│   │   └── TranscriptionPreview.tsx  # Show transcript before saving
│   ├── planner/
│   │   ├── DailyPlanForm.tsx
│   │   ├── PlanDayPicker.tsx
│   │   └── PlanItemList.tsx
│   ├── work-log/
│   │   ├── WorkLogEntryForm.tsx
│   │   ├── WorkLogList.tsx
│   │   └── WorkLogFilters.tsx
│   ├── reviews/
│   │   ├── ReviewPeriodSelector.tsx
│   │   └── ReviewSummary.tsx     # Renders plan + work log for chosen range
│   ├── search/
│   │   └── UnifiedSearch.tsx     # Semantic + keyword search across notes, work log, plans, achievements
│   └── shared/
│       ├── StatCard.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Auth middleware
│   ├── db/
│   │   └── types.ts               # Generated or hand-written DB types
│   ├── oci/
│   │   └── constants.ts           # OCI certification/badge catalog (static or fetched)
│   ├── voice/
│   │   └── transcription.ts      # Client: MediaRecorder + upload; or Web Speech API
│   └── utils.ts
├── hooks/
│   ├── useAchievements.ts
│   ├── useCertifications.ts
│   ├── useUserProfile.ts
│   ├── useNotes.ts
│   ├── useVoiceRecorder.ts        # MediaRecorder state, start/stop, blob
│   ├── useDailyPlan.ts
│   └── useWorkLogs.ts
├── types/
│   └── index.ts                   # App-level types
├── public/
├── .env.local                     # SUPABASE_URL, SUPABASE_ANON_KEY, etc.
├── next.config.js
├── tailwind.config.ts
├── package.json
└── PLAN.md                        # This file
```

**Notes:**
- Use **Route Groups** `(auth)` and `(dashboard)` to separate layouts without changing URLs.
- API routes under `app/api/` for server-side Supabase or server actions; prefer **Server Actions** in forms where possible.
- `lib/oci/constants.ts` can hold a static list of known OCI certs/badges until you add an external OCI API (if available).

---

## 2. Supabase Database Schema

### 2.1 Core Tables

| Table | Purpose |
|-------|--------|
| `profiles` | Extended user profile (linked to `auth.users`) |
| `customers` | Customer/accounts you do work for (for linking notes) |
| `notes` | Customer work notes (manual or from voice → text) |
| `achievements` | User-earned achievements (certifications, badges, milestones) |
| `certification_catalog` | Reference list of OCI certifications (name, level, link) |
| `badge_catalog` | Reference list of OCI badges |
| `learning_progress` | Progress on learning paths / courses |
| `goals` | User-defined goals (e.g. “Get OCI Architect Professional by Q2”) |
| `daily_plans` | One plan per day (tasks, focus areas) for the daily planner |
| `work_logs` | Log what you did (feeds weekly/monthly/quarterly/annual reviews) |

### 2.2 Schema (SQL)

```sql
-- Enable UUID extension (usually already on in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles: one per user (synced from auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  oci_credly_username TEXT,        -- optional: for badge verification
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers: accounts/companies you do work for (optional link for notes)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notes: customer work notes (typed or from voice → text)
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  source TEXT DEFAULT 'manual',    -- 'manual' | 'voice'
  transcript TEXT,                 -- original voice transcript (if source = 'voice')
  audio_url TEXT,                  -- optional: stored recording URL (Supabase Storage)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Catalog of OCI certifications (reference data)
CREATE TABLE public.certification_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE,         -- e.g. Oracle exam code
  name TEXT NOT NULL,
  level TEXT,                      -- e.g. 'Foundations', 'Associate', 'Professional', 'Specialty'
  description TEXT,
  exam_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Catalog of OCI badges (reference data)
CREATE TABLE public.badge_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  source TEXT,                     -- e.g. 'certification', 'lab', 'event'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User-earned achievements (certifications + badges + custom)
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,              -- 'certification' | 'badge' | 'milestone'
  certification_id UUID REFERENCES public.certification_catalog(id) ON DELETE SET NULL,
  badge_id UUID REFERENCES public.badge_catalog(id) ON DELETE SET NULL,
  custom_title TEXT,               -- for type = 'milestone'
  custom_description TEXT,
  earned_at DATE NOT NULL,
  credential_url TEXT,             -- e.g. Credly / Oracle link
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, certification_id) WHERE certification_id IS NOT NULL,
  UNIQUE(user_id, badge_id) WHERE badge_id IS NOT NULL
);

-- Learning path / course progress
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL,            -- e.g. 'Oracle Learning', 'YouTube'
  title TEXT NOT NULL,
  external_url TEXT,
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE,
  linked_certification_id UUID REFERENCES public.certification_catalog(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',    -- 'active' | 'completed' | 'cancelled'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily plans: one row per user per day (tasks, focus areas)
CREATE TABLE public.daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT,                    -- list of plan items (plain text or JSON)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Work logs: what you did (feeds manager review summaries)
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

-- Indexes for common queries
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
```

### 2.3 Row Level Security (RLS)

- **profiles**: Users can read/update their own row; insert on signup via trigger or app logic.
- **certification_catalog**, **badge_catalog**: Read-only for authenticated users (or public read).
- **achievements**, **learning_progress**, **goals**, **notes**, **customers**, **daily_plans**, **work_logs**: Users can only CRUD their own rows (`user_id = auth.uid()`).

### 2.4 Optional: Profile creation trigger

```sql
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
```

---

## 3. Core Features

### 3.1 Authentication & Profile
- **Sign up / Login** via Supabase Auth (email+password or OAuth).
- **Profile**: Display name, avatar, optional Credly/OCI identifier for future verification.
- **Auth callback** and middleware to protect dashboard routes.

### 3.2 Achievements Hub
- **Unified view** of all achievements: certifications, badges, and custom milestones.
- **Filter** by type (certification / badge / milestone) and date.
- **Add achievement**: link to catalog cert/badge or add custom milestone with title, description, date, optional URL.
- **Detail page** per achievement with edit/delete (own data only).

### 3.3 Certifications
- **List** of OCI certifications from `certification_catalog` with user’s earned status.
- **Mark as earned**: create `achievements` row with `certification_id`, `earned_at`, optional `credential_url`.
- **Progress**: count of earned vs total (e.g. “3 of 8 certifications”) and optional progress bar by level (Foundations, Associate, Professional, Specialty).

### 3.4 Badges
- **List** of OCI badges from `badge_catalog` with earned status.
- **Add badge**: select from catalog or add custom (name, image URL, date, link).
- **Grid or list** view with badge images and earned dates.

### 3.5 Learning Progress
- **List** of learning items (courses, paths) with progress % and completion date.
- **Add / edit** item: source, title, URL, progress, completed date.
- **Simple progress** (e.g. 0–100% slider or “Completed” toggle).

### 3.6 Goals
- **Goals list**: e.g. “Get OCI Architect Professional by June 2025”.
- **Link** to a certification from catalog (optional).
- **Status**: active / completed / cancelled; target date and completed date.
- **Dashboard widget**: upcoming goals and recent completions.

### 3.7 Dashboard (Home)
- **Summary stats**: total certifications, total badges, active goals, learning in progress.
- **Recent achievements** (last 5–10).
- **Next goals** or “what’s next” suggestions.

### 3.8 Settings
- **Profile** edit (display name, avatar, optional OCI/Credly username).
- **Theme** (light/dark) if desired.
- **Data export** (optional later): export achievements as JSON/CSV.

### 3.9 Customer Work Notes
- **Customers list**: Add and manage customers/accounts you work with (name, optional slug, notes).
- **Notes list**: All notes with filter by customer and date; **semantic and keyword search** (see 3.14).
- **New note**: Create a note with title and body; optionally link to a customer. Support both **typed** and **voice-origin** notes.
- **Note detail**: View and edit note; show source (manual vs voice) and optional audio link; preserve transcript for voice notes.
- **AI note creation & approval**: Create notes from user input; **AI suggests edits** (rewrites, structure, clarity); user reviews and approves before saving; store in a **consistent, readable format**.

### 3.10 Voice to Text
- **Record in browser**: Use **VoiceRecorder** (MediaRecorder API) to record audio; optional **VoiceRecordButton** with start/stop and simple timer/waveform.
- **Convert to text**: Either (1) **client-side**: Web Speech API (browser speech recognition) for live or one-shot transcript, or (2) **server-side**: Upload recording to `api/transcribe` and use a speech-to-text service (e.g. **OpenAI Whisper**, **AssemblyAI**, or **Supabase Edge + Whisper**) to return transcript.
- **Flow**: User records → optional playback → “Convert to text” → transcript shown in **TranscriptionPreview** → user can edit and save as note body (and optionally keep `audio_url` in Supabase Storage).
- **Storage**: Optionally store the recording in Supabase Storage and set `notes.audio_url` and `notes.transcript` when saving the note.

### 3.11 Daily planner
- View and edit **today’s plan** (or select another date). Add/check off/remove plan items. Optional notes for the day. One plan per day.

### 3.12 Work log
- Add work log entries: date, short summary of what you did, optional link to customer, optional time spent. List and filter by date range. Edit/delete own entries.

### 3.13 Manager review (weekly / monthly / quarterly / annual)
- **Weekly**: Summary of daily plans and work log entries for the last 7 days (or chosen week). Use in weekly 1:1.
- **Monthly**: Same structure for the selected month.
- **Quarterly**: Selected quarter — plans + work log aggregated for quarterly review.
- **Annual**: Full year — high-level summary for annual review.
- Single **Reviews** page with a period selector (Weekly / Monthly / Quarterly / Annual) and a clear, copy-friendly or export-friendly summary so you can paste or share with your manager.
- **AI summary & reports**: **AI-generated summaries and reports** from plans, work log, and notes (e.g. weekly/monthly/quarterly/annual review drafts); AI-assisted summary on the Reviews page.

### 3.14 Search (semantic and keyword)
- **Unified search** across notes, work log, daily plans, and achievements.
- **Keyword search**: Full-text search (e.g. Supabase `ilike`/`textsearch` or pg_trgm) on title, body, summary, content.
- **Semantic search**: Embeddings (e.g. from note/plan/work-log text) and vector similarity so natural-language queries pull all relevant information even when wording differs.
- Combined **semantic + keyword** results so users can find everything needed when they search for anything.

---

## 4. Tech Stack Summary

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS |
| UI components | Shadcn/ui or similar (recommended) |
| Language | TypeScript |
| Voice recording | Browser MediaRecorder API |
| Speech-to-text | Web Speech API (client) and/or Whisper/AssemblyAI (server) |
| File storage | Supabase Storage (optional audio for notes) |
| AI (summaries, reports, note refinement) | LLM e.g. OpenAI / Claude for summarization, note rewriting, report generation |
| Search | Semantic (embeddings + vector similarity) + keyword (full-text) |
| Deployment | Vercel (or any Node host); Supabase hosted |

---

## 5. Suggested Build Order

1. **Scaffold** Next.js app, Tailwind, Supabase client/env.
2. **Database**: Create Supabase project, run schema + RLS + trigger.
3. **Auth**: Login/signup/callback and profile creation.
4. **Dashboard layout** and home page with placeholder stats.
5. **Certification catalog** (seed with main OCI certs) and certifications list + “mark as earned”.
6. **Achievements** list and add/edit (cert + badge + custom).
7. **Badges** catalog and UI.
8. **Learning progress** and **Goals**.
9. **Customers** CRUD and **Notes** list/detail/create (manual only).
10. **Voice**: recorder component, upload + `api/transcribe` (e.g. Whisper), save note with transcript and optional audio URL.
11. **Daily planner**: schema, CRUD, planner page (today + date picker).
12. **Work log**: schema, CRUD, work-log page (list + add/edit).
13. **Manager review**: reviews page with date-range queries and period selector (Weekly / Monthly / Quarterly / Annual); render combined planner + work log for chosen period.
14. **AI**: `api/ai` for note refinement (suggest edits, approve, store in consistent format) and for summary/report generation; wire into note flow and Reviews page.
15. **Search**: semantic (embeddings + vector store) + keyword (full-text) search; `api/search` and UnifiedSearch component across notes, work log, plans, achievements.
16. **Polish**: empty states, loading, error handling, settings.

---

## 6. Out of Scope (for later)

- **OCI / Credly API integration** for automatic badge pull (optional enhancement).
- **Public profile / share page** (optional).
- **Notifications** or reminders for goals.
- **Multi-user / teams** (current scope: single user tracking).
- **Real-time streaming transcription** (e.g. live captions while recording); initial scope is record → then convert to text.

---

## 7. Keeping PLAN.md and REQUIREMENTS.md in sync

- **PLAN.md** is the main source for *what* we build and *how* (structure, schema, features, build order). **REQUIREMENTS.md** is the formal requirements document (FR/NFR, priorities) derived from the plan for stakeholders and traceability.
- **When you change the plan:** Add, remove, or rename a feature in §3 (Core Features), schema in §2, or routes in §1 → update [REQUIREMENTS.md](REQUIREMENTS.md) so the Product Summary, Functional Requirements (§2), and Out of Scope match. Update the Data Requirements table if tables change.
- **When you change requirements:** Add or change a requirement in REQUIREMENTS.md → reflect it in PLAN.md (Core Features, and schema/folder structure if needed). Keep the same Out of Scope list in both files.
- **Quick check:** New feature in PLAN → new or updated FR in REQUIREMENTS. New FR in REQUIREMENTS → new or updated feature bullet in PLAN §3 and any new schema/routes.

---

You can review this plan and adjust folder names, table design, or features before implementation. Once you’re happy, we can start with scaffolding the Next.js app and Supabase setup.

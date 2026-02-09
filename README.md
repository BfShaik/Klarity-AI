# Klarity AI

Personal work ledger: track your work, daily planner, work log, notes, and manager review summaries (weekly / monthly / quarterly / annual).

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **UI** | [React 18](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Backend / DB** | [Supabase](https://supabase.com/) (PostgreSQL, Auth) |
| **API** | Next.js Route Handlers (`app/api/*`) |
| **Package manager** | npm |

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In Dashboard → Project Settings → API, copy **Project URL** and **anon** (or publishable) key.
   - Create `.env.local` with:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```
   - In Supabase SQL Editor, run the full script in **`supabase/schema.sql`** (tables, indexes, RLS, profile trigger).

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Sign up at `/signup`, then sign in at `/login`.

## What’s included

- **Auth** — Sign up, sign in, sign out; protected dashboard; profile creation via trigger.
- **Dashboard** — Counts for achievements, goals, notes, work log.
- **Achievements** — List and detail (certifications, badges, milestones).
- **Certifications & badges** — Catalog views (seed `certification_catalog` and `badge_catalog` in Supabase for data).
- **Learning & goals** — Learning progress and goals list.
- **Customers** — List of customers (for linking notes).
- **Notes** — List, new note (with optional customer), and detail view.
- **Planner** — Daily plan for today (plan items + notes); save/update via API.
- **Work log** — Add entries (date, summary, optional minutes); list recent entries.
- **Reviews** — Manager review page with period selector (Weekly / Monthly / Quarterly / Annual); shows plans + work log for the range.
- **Settings** — Profile/settings placeholder.
- **API stubs** — `/api/planner`, `/api/work-logs`, `/api/transcribe`, `/api/ai`, `/api/search` (search is keyword-only for now).

See **PLAN.md** and **REQUIREMENTS.md** for full scope and future work (voice-to-text, AI refinement, semantic search).

## 📚 Documentation

- **ARCHITECTURE.md** - Complete code structure, directory layout, and architecture overview
- **CONTROL-FLOW.md** - Visual diagrams showing data flow and control flow patterns
- **API-TESTING-SUMMARY.md** - Backend API documentation and testing results
- **UI-IMPROVEMENTS-SUMMARY.md** - UI component improvements and functionality

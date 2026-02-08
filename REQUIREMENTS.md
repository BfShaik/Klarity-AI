# Klarity AI — Requirements Document

**Product:** Klarity AI  
**Version:** 1.0  
**Last updated:** 2025

---

## 1. Product Summary

Klarity AI is a **personal work ledger**: a web application that helps you track your work, plan your days, log what you did, and turn that information into summaries for manager reviews (weekly, monthly, quarterly, and annual).

The app supports:

- **Work tracking** — Achievements (certifications, badges, milestones), learning paths, and goals.
- **Customer work notes** — Notes linked to customers, with support for typed content and **voice-to-text** (record in browser, convert to text, edit and save).
- **Daily planner** — One plan per day with tasks and optional notes.
- **Work log** — Log what you did with date, summary, optional customer and time spent.
- **Manager review** — A single Reviews experience with period selector (Weekly / Monthly / Quarterly / Annual) that aggregates plans and work log into a copy- or export-friendly summary for 1:1s and formal reviews.
- **AI** — Summary and report generation; note creation and refinement from user input with approval before storage in a consistent format.
- **Search** — Semantic and keyword search across notes, work log, plans, and achievements so you can find all relevant information when you search.

**Tech overview:** Next.js 14+ (App Router), Supabase (PostgreSQL, Auth, optional Storage), TypeScript, Tailwind CSS, Shadcn-style UI. Single-user; all data scoped to the signed-in user.

---

## 2. Functional Requirements

### 2.1 Authentication & Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | User can sign up and log in via Supabase Auth (email + password or OAuth). | Must |
| FR-1.2 | User has a profile with display name, avatar, and optional identifiers (e.g. Credly/OCI). | Must |
| FR-1.3 | Auth callback and middleware protect dashboard routes; unauthenticated users are redirected to login. | Must |

### 2.2 Achievements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | User can view a unified list of achievements (certifications, badges, custom milestones). | Must |
| FR-2.2 | User can filter achievements by type and date. | Should |
| FR-2.3 | User can add an achievement by linking to a certification/badge from catalog or by adding a custom milestone (title, description, date, optional URL). | Must |
| FR-2.4 | User can view, edit, and delete a single achievement (own data only). | Must |
| FR-2.5 | User can see progress (e.g. count of earned vs total certifications) and optional progress by level. | Should |

### 2.3 Certifications & Badges

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | User can view a list of certifications from a catalog with earned status. | Must |
| FR-3.2 | User can mark a certification as earned (date, optional credential URL). | Must |
| FR-3.3 | User can view a list of badges from a catalog with earned status; add from catalog or add custom (name, image URL, date, link). | Must |
| FR-3.4 | User can view certifications and badges in list or grid form. | Should |

### 2.4 Learning & Goals

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | User can list learning items (courses, paths) with progress % and completion date. | Must |
| FR-4.2 | User can add and edit a learning item (source, title, URL, progress, completed date). | Must |
| FR-4.3 | User can create and manage goals (title, target date, optional link to certification, status: active / completed / cancelled). | Must |
| FR-4.4 | Dashboard shows upcoming goals and recent completions. | Should |

### 2.5 Customer Work Notes

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | User can maintain a list of customers (name, optional slug, notes). | Must |
| FR-5.2 | User can create a note with title and body and optionally link it to a customer. | Must |
| FR-5.3 | User can create notes by typing or from voice (see Voice to Text). | Must |
| FR-5.4 | User can list notes with filter by customer and date, and search (semantic and keyword). | Must |
| FR-5.5 | User can view and edit a note; for voice-origin notes, show source and optional audio link and preserve transcript. | Must |
| FR-5.6 | **AI note creation & approval:** User can create a note from free-form input; AI suggests edits (rewrites, structure, clarity); user reviews and approves before saving; saved notes are stored in a consistent, readable format. | Must |

### 2.6 Voice to Text

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | User can record audio in the browser (MediaRecorder API). | Must |
| FR-6.2 | User can convert the recording to text via client-side (Web Speech API) or server-side (e.g. Whisper, AssemblyAI) and see a transcript to edit before saving. | Must |
| FR-6.3 | User can save the transcript as note body and optionally store the recording (e.g. Supabase Storage) and link it from the note. | Should |

### 2.7 Daily Planner

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7.1 | User can view and edit a plan for a given day (default: today); one plan per day. | Must |
| FR-7.2 | User can add, check off, and remove plan items and add optional notes for the day. | Must |
| FR-7.3 | User can select another date to view or edit that day’s plan. | Must |

### 2.8 Work Log

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-8.1 | User can add a work log entry (date, summary, optional customer, optional time spent). | Must |
| FR-8.2 | User can list work log entries and filter by date range. | Must |
| FR-8.3 | User can edit and delete own work log entries. | Must |

### 2.9 Manager Review

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-9.1 | User can open a single Reviews page with a period selector: Weekly, Monthly, Quarterly, Annual. | Must |
| FR-9.2 | For the selected period, the app shows aggregated daily plans and work log entries in a clear, copy-friendly or export-friendly format. | Must |
| FR-9.3 | User can use this summary for weekly 1:1s and for monthly, quarterly, and annual reviews. | Must |
| FR-9.4 | **AI summary & reports:** User can generate AI-generated summaries and reports from plans, work log, and notes (e.g. weekly/monthly/quarterly/annual drafts); Reviews page supports AI-assisted summary. | Must |

### 2.10 Search

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-10.1 | User can search across notes, work log, daily plans, and achievements from one search experience. | Must |
| FR-10.2 | Search supports **keyword** (full-text) matching on title, body, summary, and plan content. | Must |
| FR-10.3 | Search supports **semantic** matching (e.g. embeddings + vector similarity) so natural-language queries return relevant results even when wording differs. | Must |
| FR-10.4 | Results combine semantic and keyword matches so the user can find all needed information. | Must |

### 2.11 Dashboard & Settings

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11.1 | Dashboard shows summary stats (e.g. certifications, badges, active goals, learning in progress), recent achievements, and next goals. | Must |
| FR-11.2 | User can edit profile (display name, avatar, optional identifiers) and theme (light/dark). | Must |
| FR-11.3 | Optional: user can export data (e.g. achievements, notes) in a standard format (e.g. JSON/CSV). | Could |

---

## 3. Non-Functional Requirements

### 3.1 Technical

| ID | Requirement |
|----|-------------|
| NFR-1 | Application is built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, and Shadcn-style UI components. |
| NFR-2 | Data and auth are backed by Supabase (PostgreSQL, Auth, optional Storage). |
| NFR-3 | Voice recording uses the browser MediaRecorder API; speech-to-text uses Web Speech API and/or a server-side service (e.g. Whisper, AssemblyAI). |
| NFR-4 | AI features (summaries, reports, note refinement) use an LLM (e.g. OpenAI, Claude). |
| NFR-5 | Search uses semantic search (embeddings + vector similarity) and keyword (full-text) search. |
| NFR-6 | Application is deployable to Vercel or another Node-compatible host. |

### 3.2 Security & Data

| ID | Requirement |
|----|-------------|
| NFR-7 | All user data is scoped to the signed-in user; Row Level Security (RLS) or equivalent ensures users can only access their own data. |
| NFR-8 | Authentication is required for all dashboard and API access; session is managed via Supabase Auth. |
| NFR-9 | Scope is single-user; no multi-tenant or team data sharing in the initial release. |

### 3.3 Usability

| ID | Requirement |
|----|-------------|
| NFR-10 | Manager review output is easy to copy or export for use in 1:1s and formal reviews. |
| NFR-11 | AI-suggested note edits are presented for explicit user approval before saving. |

---

## 4. Data Requirements (Summary)

The application persists the following core entities (see [PLAN.md](PLAN.md) for full schema):

- **profiles** — User profile (linked to auth).
- **customers** — Customer/accounts for linking notes.
- **notes** — Work notes (manual or voice-origin), with optional transcript and audio URL.
- **daily_plans** — One plan per user per day (content, notes).
- **work_logs** — Work log entries (date, summary, optional customer, optional time).
- **achievements** — Certifications, badges, custom milestones.
- **certification_catalog** / **badge_catalog** — Reference data for certifications and badges.
- **learning_progress** — Learning items with progress and completion.
- **goals** — User goals with target date and status.

Search may require additional storage for embeddings/vectors (e.g. in Supabase with pgvector or a dedicated vector store).

---

## 5. Out of Scope (Current Release)

- OCI / Credly API integration for automatic badge pull.
- Public profile or shareable page.
- Notifications or reminders for goals.
- Multi-user or team features.
- Real-time streaming transcription (record then convert is in scope).

---

## 6. References & sync with PLAN.md

- **Project plan (structure, schema, build order):** [PLAN.md](PLAN.md)
- **Keeping in sync:** PLAN.md is the primary source for features and structure. When you update PLAN (§1–3, §6), update this document so the Product Summary, Functional Requirements, Data Requirements, and Out of Scope stay aligned. When you add or change a requirement here, update PLAN.md §3 (Core Features) and schema/routes if needed. Keep Out of Scope identical in both files. See PLAN.md §7 for sync rules.

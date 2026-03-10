# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run dev:restart  # Kill ports, clear .next cache, restart dev server
npm run build        # Production build
npm run lint         # ESLint via Next.js

# Database
npm run db:migrate          # Run Supabase migrations
npm run oracle:setup        # Set up Oracle ATP schema

# Testing
npm run test:chat      # Test chat API (scripts/test-chat.mjs)
npm run test:backends  # Test both DB backends (scripts/test-backends.mjs)
```

## Architecture

**Klarity AI** is a Next.js 14 (App Router) personal productivity dashboard for tracking work logs, notes, goals, achievements, plans, and manager reviews. It has an AI chat assistant and voice transcription.

### Dual-Database Architecture

The most important architectural decision: **Supabase handles auth always; app data can use either Supabase or Oracle ATP.**

The flag `useOracle` in `lib/db/index.ts` toggles which backend handles data. It is `true` when `process.env.ORACLE_USER` is set.

- **`lib/supabase/`** — Supabase client (browser, server, middleware)
- **`lib/oracle/db.ts`** — Oracle ATP connection pool (`oracledb` package, TLS wallet)
- **`lib/oracle/tables/`** — 12 typed table modules (notes, work-logs, goals, daily-plans, achievements, customers, profiles, etc.) with raw parameterized SQL
- **`lib/db/`** — DB abstraction layer that routes to the correct backend

There is no ORM — all queries are raw SQL with parameterized binds.

### App Structure

- **`app/(dashboard)/`** — Protected dashboard routes. Each feature folder has:
  - `page.tsx` — Server component (fetches data, renders UI)
  - `actions.ts` — Server Actions for mutations (create, update, delete)
- **`app/api/`** — REST API routes (used by client components and external scripts)
  - `chat/` — OCI GenAI chat with tool calls (can create notes, log work, search, list)
  - `ai/` — Content refinement (`refine`) and review summarization (`summarize`)
  - `search/` — Full-text search across all entity types
  - `work-logs/`, `planner/`, `profile/`, `export/`, `transcribe/`, `health/`
- **`components/`** — Shared UI (`ChatBot`, `VoiceRecorder`, `Header`, `ActionButtons`, OAuth buttons)
- **`lib/`** — Utilities: `ensure-profile.ts` (auto-creates profile row on first login), `errors.ts`, `oci-genai.ts`

### Auth Flow

Supabase Auth (email/password + Google/GitHub OAuth). All protected routes go through `middleware.ts` → `lib/supabase/middleware.ts`. Supabase connection errors redirect to `/service-unavailable`. The `ensureProfile()` utility in `lib/ensure-profile.ts` creates a profile record in the data DB when a user first authenticates.

### AI Integration

OCI Generative AI (Oracle Cloud) is the primary AI provider (`lib/oci-genai.ts`). The chat assistant at `/api/chat/route.ts` uses tool calling to interact with the database. Voice transcription uses OpenAI Whisper (`/api/transcribe`).

## Required Environment Variables

```
# Always required
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Oracle ATP (optional — enables Oracle data backend)
ORACLE_USER
ORACLE_PASSWORD
TNS_ADMIN                  # Path to wallet directory
ORACLE_TNS_ALIAS           # TNS alias from tnsnames.ora
ORACLE_WALLET_PASSWORD

# OCI Generative AI (optional — enables AI features)
OCI_GENAI_API_KEY
OCI_GENAI_REGION
OCI_GENAI_COMPARTMENT_ID
OCI_GENAI_MODEL            # e.g. meta.llama-3.3-70b-instruct

# OpenAI (optional — enables voice transcription)
OPENAI_API_KEY
```

## Key Conventions

- **TypeScript strict mode** throughout
- **Path alias**: `@/*` maps to project root
- **Styling**: Tailwind CSS, dark theme, red accent `#ef4444`
- **No ORM**: Use parameterized SQL directly; never string-interpolate user input into queries
- **Server Actions** for mutations in dashboard pages; REST API routes for client-side or external access
- **`next.config.mjs`** sets `output: "standalone"` for Docker deployment

# Supabase-Only Components

Klarity AI uses **Oracle ATP** for all application data when configured. Supabase is used **only** for the following:

## 1. Authentication

- **Login / Sign up / Sign out** — `app/auth/*`
- **OAuth providers** — Google, GitHub, etc.
- **Auth callback** — `app/auth/callback/route.ts`
- **Session management** — `supabase.auth.getUser()`, cookies

All auth flows (email/password, OAuth) go through Supabase Auth. There is no Oracle-based auth.

## 2. Profile linkage

- **`profiles.id`** — Matches Supabase auth user id. Oracle tables use this id for all foreign keys (`user_id`).
- **`ensureProfile`** — When a user signs in, a row is created in Oracle `profiles` (when `useOracle` is true) so that FKs from notes, goals, etc. are valid.

## Summary

| Area              | Data source |
|-------------------|-------------|
| Auth (login, OAuth, session) | Supabase |
| Profiles, notes, goals, achievements, etc. | Oracle ATP (when configured) |

## Enabling Oracle

Set these in `.env.local`:

- `ORACLE_USER`
- `ORACLE_PASSWORD`
- `TNS_ADMIN` (wallet directory)
- `ORACLE_TNS_ALIAS`
- `ORACLE_WALLET_PASSWORD`

When both `ORACLE_USER` and `ORACLE_PASSWORD` are set, `useOracle` is true and all data reads/writes use Oracle instead of Supabase.

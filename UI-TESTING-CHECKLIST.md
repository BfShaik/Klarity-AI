# UI Testing Checklist

Use this checklist to manually test the Klarity AI UI. Ensure `.env.local` is set and Supabase schema is applied.

## Prerequisites
- [ ] `npm install` done
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase `schema.sql` has been run
- [ ] Dev server running: `npm run dev` (usually http://localhost:3000)

---

## 1. Auth
- [ ] **Visit /** → Redirects to `/login` when not signed in
- [ ] **Login** → Enter email/password → Redirects to dashboard
- [ ] **Sign out** → Header "Sign out" → Redirects to `/login`
- [ ] **Sign up** → `/signup` → Create account → Check email message or sign in
- [ ] **Wrong password** → Error message shown

---

## 2. Dashboard (/)
- [ ] Stats cards show (Achievements, Goals, Notes, Work log)
- [ ] Clicking each card goes to correct page
- [ ] Sidebar and header visible
- [ ] Background/layout looks correct (no broken CSS)

---

## 3. Customers (/customers)
- [ ] "Add customer" form visible
- [ ] Submit with name → Success message, customer appears in list
- [ ] Submit with empty name → Error message
- [ ] List shows existing customers

---

## 4. Goals (/goals)
- [ ] "Add goal" form visible
- [ ] Submit with title → Success message, goal appears in list
- [ ] Optional target date works
- [ ] Status badge shows (active/completed/cancelled)

---

## 5. Learning (/learning)
- [ ] "Add learning item" form visible
- [ ] Submit with title + source → Success, item appears
- [ ] Progress bar displays correctly
- [ ] Optional URL and progress % work

---

## 6. Notes (/notes)
- [ ] List of notes (or empty state)
- [ ] "New note" button goes to `/notes/new`
- [ ] **New note** → Title, body, optional customer
- [ ] Voice recorder shows (or "not supported" message)
- [ ] "Refine with AI" updates body (placeholder)
- [ ] Save note → Redirects to `/notes`, new note in list
- [ ] Click a note → Detail page shows title, body, date

---

## 7. Planner (/planner)
- [ ] Today's date shown
- [ ] Plan items textarea and Notes field
- [ ] Save plan → Success message, page refreshes
- [ ] Edit and save again → Success (update)

---

## 8. Work Log (/work-log)
- [ ] "Add entry" form with date, summary, minutes
- [ ] Submit → Success message, entry in "Recent entries"
- [ ] Date picker works
- [ ] Minutes optional

---

## 9. Reviews (/reviews)
- [ ] Period tabs: Weekly, Monthly, Quarterly, Annual
- [ ] Switching period updates date range and content
- [ ] Daily plans and work log entries shown for range
- [ ] Empty state when no data

---

## 10. Achievements, Certifications, Badges
- [ ] **Achievements** → List (or empty)
- [ ] **Certifications** → Catalog list; "Mark as earned" if catalog seeded
- [ ] **Badges** → Catalog list; "Mark as earned" if catalog seeded
- [ ] Achievement detail page opens from list

---

## 11. Settings (/settings)
- [ ] Email and display name shown (or placeholders)

---

## 12. General
- [ ] No console errors (F12 → Console)
- [ ] No broken layout or missing styles
- [ ] Sidebar links work
- [ ] Header shows user email and Sign out

---

**Build status:** Run `npm run build` — should complete with no errors.  
**Lint:** Run `npm run lint` — should report no errors.

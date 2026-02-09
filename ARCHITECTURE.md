# Klarity AI - Architecture & Code Structure Documentation

## 📁 Directory Structure

```
klarity-ai/
├── app/                          # Next.js App Router (main application)
│   ├── layout.tsx               # Root layout (HTML structure, global styles)
│   ├── page.tsx                 # Root page (redirects to dashboard)
│   ├── globals.css              # Global Tailwind CSS styles
│   │
│   ├── (dashboard)/             # Route group - all dashboard pages
│   │   ├── layout.tsx           # Dashboard layout (Sidebar + Header wrapper)
│   │   ├── page.tsx            # Dashboard home (stats overview)
│   │   │
│   │   ├── achievements/        # Achievements feature
│   │   │   ├── page.tsx        # List all achievements
│   │   │   └── [id]/           # Dynamic route for single achievement
│   │   │       └── page.tsx
│   │   │
│   │   ├── certifications/      # Certifications feature
│   │   │   ├── page.tsx        # List certifications catalog
│   │   │   └── actions.ts      # Server actions (mark as earned)
│   │   │
│   │   ├── badges/              # Badges feature
│   │   │   ├── page.tsx        # List badges catalog
│   │   │   └── actions.ts      # Server actions
│   │   │
│   │   ├── learning/            # Learning progress
│   │   │   ├── page.tsx        # List learning items
│   │   │   ├── actions.ts      # Server actions
│   │   │   └── LearningForm.tsx # Client form component
│   │   │
│   │   ├── goals/               # Goals tracking
│   │   │   ├── page.tsx        # List goals
│   │   │   ├── actions.ts      # Server actions
│   │   │   └── GoalForm.tsx    # Client form component
│   │   │
│   │   ├── customers/           # Customer management
│   │   │   ├── page.tsx        # List customers
│   │   │   ├── actions.ts      # Server actions
│   │   │   └── CustomerForm.tsx # Client form component
│   │   │
│   │   ├── notes/               # Notes feature
│   │   │   ├── page.tsx        # List notes
│   │   │   ├── new/            # Create new note
│   │   │   │   ├── page.tsx    # Server component (fetches customers)
│   │   │   │   └── NoteForm.tsx # Client form with voice recorder
│   │   │   └── [id]/           # View single note
│   │   │       └── page.tsx
│   │   │
│   │   ├── planner/             # Daily planner
│   │   │   ├── page.tsx        # Server component (fetches today's plan)
│   │   │   └── PlannerForm.tsx # Client form component
│   │   │
│   │   ├── work-log/            # Work log entries
│   │   │   ├── page.tsx        # Server component (lists entries)
│   │   │   └── WorkLogForm.tsx # Client form component
│   │   │
│   │   ├── reviews/             # Manager reviews
│   │   │   ├── page.tsx        # Server component (fetches data)
│   │   │   └── ReviewSummary.tsx # Client component (displays summary)
│   │   │
│   │   └── settings/            # User settings
│   │       └── page.tsx
│   │
│   ├── api/                      # API Routes (backend endpoints)
│   │   ├── planner/             # Daily planner API
│   │   │   └── route.ts        # POST - create/update plan
│   │   ├── work-logs/           # Work log API
│   │   │   └── route.ts        # POST - create entry
│   │   ├── transcribe/          # Voice transcription API
│   │   │   └── route.ts        # POST - transcribe audio
│   │   ├── ai/                  # AI features API
│   │   │   └── route.ts        # POST - refine notes, summarize
│   │   └── search/              # Search API
│   │       └── route.ts        # GET - keyword search
│   │
│   ├── auth/                    # Authentication routes
│   │   ├── callback/           # Supabase auth callback
│   │   │   └── route.ts        # Handles OAuth redirects
│   │   └── signout/            # Sign out route
│   │       └── route.ts        # POST - sign out user
│   │
│   ├── login/                   # Login page
│   │   └── page.tsx            # Client component
│   │
│   └── signup/                  # Sign up page
│       └── page.tsx            # Client component
│
├── components/                   # Reusable React components
│   ├── layout/
│   │   ├── Sidebar.tsx          # Navigation sidebar (Server Component)
│   │   └── Header.tsx          # Top header with user info (Server Component)
│   └── voice/
│       └── VoiceRecorder.tsx    # Voice recording component (Client Component)
│
├── lib/                          # Utility libraries
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       ├── server.ts            # Server Supabase client
│       └── middleware.ts        # Auth middleware logic
│
├── types/                        # TypeScript type definitions
│   └── db.ts                    # Database type interfaces
│
├── supabase/                     # Database schema
│   └── schema.sql               # Complete database schema (tables, RLS, triggers)
│
├── middleware.ts                 # Next.js middleware (runs on every request)
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🔄 Control Flow & Architecture

### 1. **Application Entry Point**

```
User Request → middleware.ts → Next.js Router → Page Component
```

#### Middleware (`middleware.ts`)
- **Purpose**: Runs on every request before the page loads
- **Function**: Authentication check and session refresh
- **Flow**:
  1. Intercepts all requests (except static assets)
  2. Calls `updateSession()` from `lib/supabase/middleware.ts`
  3. Refreshes Supabase session if needed
  4. Checks if user is authenticated
  5. Redirects unauthenticated users to `/login`
  6. Redirects authenticated users away from auth pages

### 2. **Authentication Flow**

```
┌─────────────────┐
│  User visits /  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │ ── Checks auth status
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌────────┐
│ Not  │  │  Auth  │
│ Auth │  │  User  │
└──┬───┘  └───┬────┘
   │          │
   ▼          ▼
┌──────┐  ┌──────────┐
│/login│  │ Dashboard│
└──┬───┘  └──────────┘
   │
   │ User signs in
   │
   ▼
┌──────────────┐
│ Supabase Auth│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Auth Callback│ ── /auth/callback
└──────┬───────┘
       │
       │ Creates session
       │
       ▼
┌──────────────┐
│  Redirect to │
│   Dashboard  │
└──────────────┘
```

#### Key Files:
- **`app/login/page.tsx`**: Client component for login form
- **`app/signup/page.tsx`**: Client component for signup form
- **`app/auth/callback/route.ts`**: Handles OAuth redirects, exchanges code for session
- **`lib/supabase/client.ts`**: Browser-side Supabase client (for login/signup)
- **`lib/supabase/server.ts`**: Server-side Supabase client (for protected pages)

### 3. **Data Flow Patterns**

#### Pattern A: Server Component → Database → Render
```
Page Component (Server)
    ↓
createClient() from lib/supabase/server.ts
    ↓
Supabase Query (with RLS)
    ↓
Database (PostgreSQL)
    ↓
Return Data
    ↓
Render HTML
```

**Example**: `app/(dashboard)/page.tsx` (Dashboard)
```typescript
// Server Component - runs on server
export default async function DashboardPage() {
  const supabase = await createClient(); // Server client
  const counts = await getCounts(supabase); // Query database
  return <div>...</div>; // Render HTML
}
```

#### Pattern B: Client Component → API Route → Database
```
Client Component
    ↓
User Action (form submit, button click)
    ↓
fetch('/api/endpoint')
    ↓
API Route Handler
    ↓
createClient() from lib/supabase/server.ts
    ↓
Database Operation
    ↓
Return JSON Response
    ↓
Update UI
```

**Example**: `app/(dashboard)/planner/PlannerForm.tsx`
```typescript
// Client Component
async function handleSubmit(e: React.FormEvent) {
  const res = await fetch("/api/planner", {
    method: "POST",
    body: JSON.stringify({ date, content, notes })
  });
  // Handle response, update UI
}
```

#### Pattern C: Server Action → Database → Revalidate
```
Client Component
    ↓
Form Submit with Server Action
    ↓
Server Action (marked with "use server")
    ↓
createClient() from lib/supabase/server.ts
    ↓
Database Operation
    ↓
revalidatePath()
    ↓
Page Refreshes with New Data
```

**Example**: `app/(dashboard)/goals/actions.ts`
```typescript
// Server Action
export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("goals").insert({...});
  revalidatePath("/goals"); // Refresh the page
}
```

### 4. **Component Types**

#### Server Components (Default)
- **Location**: `app/**/page.tsx` (most pages)
- **Characteristics**:
  - Run on server only
  - Can directly access database
  - Cannot use browser APIs
  - Cannot use React hooks (`useState`, `useEffect`)
- **Use Cases**: Data fetching, initial page render

#### Client Components (`"use client"`)
- **Location**: Form components, interactive components
- **Characteristics**:
  - Run in browser
  - Can use React hooks
  - Can use browser APIs
  - Cannot directly access database
- **Use Cases**: Forms, interactive UI, browser APIs (MediaRecorder)

### 5. **Database Architecture**

#### Supabase Setup
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Row Level Security (RLS)**: Enabled on all tables
- **Schema**: Defined in `supabase/schema.sql`

#### Key Tables:
1. **`profiles`**: User profile data
2. **`customers`**: Customer list
3. **`notes`**: User notes
4. **`certification_catalog`**: Available certifications
5. **`badge_catalog`**: Available badges
6. **`achievements`**: User's earned achievements
7. **`learning_progress`**: Learning items and progress
8. **`goals`**: User goals
9. **`daily_plans`**: Daily planner entries
10. **`work_logs`**: Work log entries

#### RLS Policies:
- All tables have policies ensuring users can only access their own data
- Example: `auth.uid() = user_id` for personal data
- Catalog tables (`certification_catalog`, `badge_catalog`) are readable by all

### 6. **Request Flow Examples**

#### Example 1: Viewing Dashboard
```
1. User navigates to /
   ↓
2. Middleware checks authentication
   ↓
3. If authenticated → app/(dashboard)/page.tsx
   ↓
4. Server Component runs:
   - Creates Supabase server client
   - Queries database for counts
   - Renders HTML with data
   ↓
5. HTML sent to browser
   ↓
6. Client-side hydration (if needed)
```

#### Example 2: Creating a Work Log Entry
```
1. User fills form in WorkLogForm.tsx (Client Component)
   ↓
2. User clicks "Add entry"
   ↓
3. handleSubmit() runs:
   - Calls fetch('/api/work-logs', { method: 'POST', body: ... })
   ↓
4. API Route Handler (app/api/work-logs/route.ts):
   - Creates Supabase server client
   - Checks authentication
   - Validates input
   - Inserts into database
   - Returns JSON response
   ↓
5. Client Component receives response:
   - Shows success/error message
   - Resets form
   - Calls router.refresh() to reload page
   ↓
6. Page reloads, shows new entry
```

#### Example 3: Creating a Goal (Server Action)
```
1. User fills form in GoalForm.tsx (Client Component)
   ↓
2. Form submits with action={createGoal}
   ↓
3. Server Action (app/(dashboard)/goals/actions.ts) runs:
   - Creates Supabase server client
   - Checks authentication
   - Validates input
   - Inserts into database
   - Calls revalidatePath("/goals")
   ↓
4. Next.js automatically refreshes /goals page
   ↓
5. Page shows new goal
```

### 7. **Key Libraries & Utilities**

#### Supabase Clients

**`lib/supabase/client.ts`** (Browser)
- Used in Client Components
- Handles authentication in browser
- Used for login/signup

**`lib/supabase/server.ts`** (Server)
- Used in Server Components and API routes
- Handles cookies for SSR
- Used for protected data access

**`lib/supabase/middleware.ts`**
- Used by Next.js middleware
- Refreshes sessions
- Manages cookie handling

### 8. **Error Handling Flow**

```
User Action
    ↓
Try Operation
    ↓
┌───────────┐
│  Success? │
└─────┬─────┘
      │
  ┌───┴───┐
  │       │
  Yes     No
  │       │
  ▼       ▼
Success  Error
Message  Message
         │
         ▼
    Display to
      User
```

**Error Handling Locations:**
- **API Routes**: Try/catch blocks, return error responses
- **Server Actions**: Try/catch blocks, throw errors
- **Client Components**: Try/catch blocks, display error messages
- **Forms**: Error state management, display error messages

### 9. **Styling Architecture**

- **Framework**: Tailwind CSS
- **Configuration**: `tailwind.config.ts`
- **Global Styles**: `app/globals.css`
- **Approach**: Utility-first CSS classes
- **Components**: Styled with Tailwind classes directly

### 10. **Type Safety**

- **TypeScript**: Full type safety throughout
- **Database Types**: `types/db.ts` defines interfaces
- **Type Inference**: Supabase client provides type inference
- **Form Data**: Typed FormData handling in server actions

---

## 🔑 Key Concepts

### Route Groups
- `(dashboard)`: Route group that doesn't affect URL structure
- All dashboard pages share the same layout (`layout.tsx`)

### Dynamic Routes
- `[id]`: Dynamic segment (e.g., `/notes/[id]` → `/notes/123`)
- Access via `params` prop in page components

### Server Actions
- Functions marked with `"use server"`
- Can be called directly from forms
- Run on server, can access database
- Automatically handle form data

### API Routes
- RESTful endpoints in `app/api/**/route.ts`
- Export `GET`, `POST`, etc. functions
- Return `NextResponse` objects

### Middleware
- Runs before every request
- Can modify request/response
- Used for authentication checks

---

## 🚀 Development Workflow

1. **Start Dev Server**: `npm run dev`
2. **Make Changes**: Edit files in `app/` or `components/`
3. **Hot Reload**: Changes automatically refresh
4. **Build**: `npm run build` (production build)
5. **Type Check**: TypeScript validates on build

---

## 📝 Best Practices Used

1. **Server Components by Default**: Use Server Components unless you need interactivity
2. **Client Components When Needed**: Only use `"use client"` for forms, hooks, browser APIs
3. **Error Handling**: Comprehensive error handling at all levels
4. **Type Safety**: Full TypeScript coverage
5. **RLS**: Database security via Row Level Security
6. **Revalidation**: Use `revalidatePath()` after mutations
7. **User Feedback**: Success/error messages for all operations

---

This architecture provides a scalable, secure, and maintainable foundation for the Klarity AI application.

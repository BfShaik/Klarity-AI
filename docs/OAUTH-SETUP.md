# OAuth Setup (Google & GitHub)

This guide configures Google and GitHub sign-in for Klarity AI using Supabase Auth.

---

## Prerequisites

- Supabase project created
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 1. Supabase URL Configuration

In **Supabase Dashboard** → **Authentication** → **URL Configuration**:

| Setting | Local dev | Production |
|---------|-----------|------------|
| **Site URL** | `http://localhost:3000` | `https://your-domain.com` |
| **Redirect URLs** | Add: `http://localhost:3000/auth/callback` | Add: `https://your-domain.com/auth/callback` |

For both environments, add the exact URLs. Supabase will reject redirects to URLs not in this list.

---

## 2. Google OAuth

### 2.1 Create OAuth credentials (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
4. Application type: **Web application**
5. Name: e.g. `Klarity AI`
6. **Authorized redirect URIs** — add:
   ```
   https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   Replace `<YOUR_PROJECT_REF>` with your Supabase project ref (the subdomain of your Supabase URL, e.g. `jdmxoflfvdydnumppkid`).
7. **Authorized JavaScript origins** (optional, for popup flow):
   - `http://localhost:3000`
   - `https://your-domain.com`
8. Create and copy **Client ID** and **Client Secret**

### 2.2 Enable in Supabase

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Google**
3. Paste **Client ID** and **Client Secret**
4. Save

---

## 3. GitHub OAuth

### 3.1 Create OAuth App (GitHub)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. **Application name:** `Klarity AI` (or your app name)
3. **Homepage URL:** `http://localhost:3000` (or your production URL)
4. **Authorization callback URL:**
   ```
   https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   Use the same Supabase project ref as for Google.
5. Register application
6. Copy **Client ID**
7. Generate **Client Secret**

### 3.2 Enable in Supabase

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **GitHub**
3. Paste **Client ID** and **Client Secret**
4. Save

---

## 4. Verify Setup

1. Run the app: `npm run dev`
2. Open `http://localhost:3000/login`
3. Click **Google** or **GitHub** — you should be redirected to the provider and back to the dashboard on success
4. If you see "Sign-in was cancelled or failed", check:
   - Redirect URLs in Supabase include `http://localhost:3000/auth/callback`
   - Provider callback URL matches exactly: `https://<ref>.supabase.co/auth/v1/callback`
   - Client ID and Secret are correct in Supabase

---

## Security Notes

- Never commit Client Secrets to git
- Regenerate secrets if they are exposed
- For production, use your production domain in Site URL and Redirect URLs

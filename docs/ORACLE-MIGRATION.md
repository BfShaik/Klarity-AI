# Oracle ATP Migration Guide

Migrate Klarity AI from Supabase (PostgreSQL) to Oracle Autonomous Transaction Processing (ATP).

## Prerequisites

- Oracle ATP instance provisioned
- Admin credentials
- Node.js with `oracledb` package

## 1. Connection Details

Your ATP connect descriptor:
```
(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=g4454520bba5b2f_f0ljc79hji9s7az9_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))
```

## 2. Create App User

Run the setup script (connects as admin, creates `klarity_app` user, runs schema):

```bash
export ORACLE_ADMIN_USER=admin
export ORACLE_ADMIN_PASSWORD=BabaLeander@2025
export ORACLE_CONNECT_STRING="(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=g4454520bba5b2f_f0ljc79hji9s7az9_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
export ORACLE_APP_PASSWORD=KlarityApp2025!

node scripts/oracle-setup.mjs
```

Or run manually in SQL Worksheet:
1. Connect as **admin**, run `oracle/01-create-user.sql`
2. Connect as **admin**, run `oracle/02-enable-ords.sql` (enables SQL Worksheet login for klarity_app)
3. Connect as **klarity_app**, run `oracle/drop-schema.sql` (if re-running)
4. Connect as **klarity_app**, run `oracle/schema.sql`

**If you get "Invalid credentials" when logging in as klarity_app:**
- Run `oracle/02-enable-ords.sql` as **admin** first (enables ORDS for the schema)
- Or try the direct URL: `https://<your-atp-host>/ords/klarity_app/_sdw/?nav=worksheet`

## 3. Environment Variables

Add to `.env.local`:

```env
# Oracle ATP (when set, app uses Oracle instead of Supabase for data)
# REQUIRED: TNS_ADMIN must point to extracted wallet directory
TNS_ADMIN=/path/to/extracted/wallet
ORACLE_USER=klarity_app
ORACLE_PASSWORD=KlarityApp2025!
ORACLE_CONNECT_STRING=(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=g4454520bba5b2f_f0ljc79hji9s7az9_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))
```

**Keep Supabase for auth** — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are still required for login/signup.

## 4. Schema Notes

- **UUIDs**: Stored as `VARCHAR2(36)`. App uses `crypto.randomUUID()`.
- **Column names**: `daily_plans.plan_date`, `work_logs.log_date` (avoid reserved `date`). `certification_catalog.cert_level`, `badge_catalog.badge_source`, `learning_progress.lp_source` (avoid reserved `level`/`source`).
- **Auth**: Supabase Auth remains for login. `profiles.id` = Supabase user id.
- **RLS**: Oracle has no RLS; row-level security is enforced in application code via `user_id` filters.

## 5. Migration Status

| Component | Oracle | Supabase |
|-----------|--------|----------|
| Auth (login/signup) | — | ✓ |
| Profiles | ✓ | ✓ |
| Work logs (API) | ✓ | ✓ |
| Other tables | Pending | ✓ |

When `ORACLE_USER` and `ORACLE_PASSWORD` are set, the app uses Oracle for data. Tables are migrated incrementally.

## 6. Oracle Wallet (Required for ATP)

**NJS-040 / connection timeout:** Oracle ATP uses mTLS. Node-oracledb Thin mode needs the wallet with `configDir`, `walletLocation`, and `walletPassword`.

1. **Download wallet:** OCI Console → your ATP database → **DB Connection** → **Download Wallet** (set a password when prompted)
2. **Extract** the zip to a directory, e.g. `~/oracle-wallet`
3. **Ensure ewallet.pem exists** — the wallet may include it. If not, convert: `openssl pkcs12 -in ewallet.p12 -out ewallet.pem -nodes`
4. **Add to `.env.local`**:
   ```env
   TNS_ADMIN=/full/path/to/oracle-wallet
   ORACLE_TNS_ALIAS=f0ljc79hji9s7az9_high
   ORACLE_WALLET_PASSWORD=your_wallet_password
   ```
   The TNS alias is in `tnsnames.ora` (e.g. `f0ljc79hji9s7az9_high`). The wallet password is the one you set when downloading.

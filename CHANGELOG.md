# Changelog — PaisaWise

All notable changes to this project will be documented in this file.

## [3.4.0] — 2026-07-28 — Accounts, budgets, custom categories, recurring, PWA

Feature concepts studied from the Paisa Flutter expense manager
(github.com/codezinfinity/Paisa). That project is **GPLv3** and this one is MIT,
so no code was copied — these are independent implementations against our own
schema.

### Added — accounts
- `accounts` table (cash / bank / upi / card / wallet) and `expenses.account_id`.
  Every expense can now record where the money came from.
- Balances are computed in SQL as income minus expenses rather than stored, so
  they cannot drift from the transactions they summarise.
- `ON DELETE SET NULL` on the expense link: deleting an account never deletes
  its history.
- Account ownership is re-verified server-side on every write, so a forged id
  cannot attach an expense to another user's account.

### Added — budgets
- `budgets` table with one monthly cap per category, upserted case-insensitively.
- Progress is computed with a `LEFT JOIN LATERAL` against this month's spend —
  one round trip, one row per budget, regardless of expense volume.
- Complements the existing leak detection: budgets warn before overspend,
  leak detection reports after.

### Added — custom categories
- `categories` table with per-user names, emoji and colour, seeded with the
  original seven on signup.
- **`expenses.category` deliberately stays TEXT rather than becoming a foreign
  key.** The AI parser and receipt scanner emit category *names*, and keeping
  the value denormalised means renaming or deleting a category never rewrites
  or orphans historical expenses.
- Built-in categories cannot be deleted.

### Added — recurring transactions
- `recurring` table with daily / weekly / monthly cadence.
- **Catch-up runs on app load, not on a cron** — Render's free tier has no
  scheduler. Due rules are materialised when the user opens the app.
- Idempotent by construction: rules are selected only while
  `next_run <= CURRENT_DATE`, and the same transaction advances `next_run` past
  today. `FOR UPDATE SKIP LOCKED` prevents concurrent requests double-posting.
- Catch-up is capped at 12 entries per rule. Verified: a rule dormant for five
  years on a daily cadence produces 12 rows, not 1,800.

### Added — installable PWA
- `manifest.webmanifest` with standalone display, maskable icons and an
  "Add expense" shortcut. Generated 192/512 icons plus an Apple touch icon.
- Service worker with a deliberately conservative strategy: **API responses are
  never cached**, because showing a stale balance as if it were current is worse
  than showing nothing. Hashed build assets are cache-first; navigations are
  network-first with an offline fallback page.
- iOS meta tags so Safari can install it to the home screen.

### Verified
12 SQL assertions against a real Postgres engine: schema applies, duplicate
account names blocked case-insensitively, balances compute correctly
(₹5000 − ₹700 = ₹4300), cross-user account access denied, deleting an account
preserves expenses while nulling the link, budget/spend LATERAL join, budget
upsert, a three-month-overdue rule catching up, re-running producing nothing,
`next_run` advancing, the runaway guard capping at 12, and full cascade on
account deletion. Plus clean typecheck, successful build, and all six PWA assets
serving with correct content types.

## [3.3.0] — 2026-07-28 — Dark mode + manual expense entry

### Added
- **Dark mode toggle** in both the app and landing headers. The `.dark` token
  set already existed in `styles.css` but nothing switched it. Choice persists
  to localStorage and falls back to the OS preference. A blocking script in
  `<head>` applies the theme before first paint — doing it in a React effect
  would flash white on every load for dark-mode users.
- **Manual Add Expense form** — title, amount, date, a toggle button per
  category (no dropdown), optional note, and an expense/income switch. Lives in
  a new "Add" tab beside Dashboard and History. Category and date persist
  between submissions since people log several in a row.
- **Custom dates on expenses.** `POST /api/expenses` now accepts `occurredAt`.
  Validated server-side: unparseable values, future dates and pre-2000 dates are
  rejected, because a bad date would silently land the expense outside the
  current month and corrupt both the monthly totals and the quota count.

### Changed
- **Dashboard shows the category list and both charts together** instead of a
  bar/pie toggle. Category rows show amount, percentage and a colour-matched
  progress bar; the bar chart and donut follow, sharing the same colour scale.

### Fixed
- **README pointed at a stranger's deployment.** The placeholder
  `paisawise.onrender.com` resolves to an unrelated project. Replaced with a
  note and a commented template until the real Render URL exists.

### Verified
9 SQL assertions against a real Postgres engine covering the new date column:
mixed explicit/null dates in one bulk insert, explicit dates honoured, null
defaulting to `now()`, backdated expenses correctly excluded from the monthly
quota, and all four date-validation rejection paths. Plus clean typecheck,
successful build, and confirmation that the theme script and toggle render in
the SSR output.

## [3.2.2] — 2026-07-28 — Fix Render build failure

### Fixed
- **`npm ci` failed on Render with ERESOLVE.** An earlier
  `npm install --legacy-peer-deps` had bumped `eslint` to `^10.8.0`, which
  `eslint-plugin-react-hooks@5.2.0` does not support (it peers on `eslint ^9`).
  Local installs kept passing because they reused that flag; `npm ci` resolves
  strictly and rejected it. Pinned `eslint` to `^9.39.5` and regenerated
  `package-lock.json` with a strict install.
- **Node version was unpinned.** `engines` said `>=20`, so Render selected
  Node 26.5.0 — far newer than anything this was tested on. Pinned to `22.x`
  in `engines` and `NODE_VERSION` in `render.yaml`.

### Verified
`npm ci` runs clean from the regenerated lockfile in an isolated directory (the
exact command Render runs), then lint (0 errors), typecheck, build, and a
runtime check of the built server all pass on Node 22.

## [3.2.1] — 2026-07-28

### Added
- **CI workflow** (`.github/workflows/ci.yml`) — lint, typecheck and build on
  every push and pull request. Replaces the Neon PR-branch workflow, which was
  committed to `.github/workflows.yml` (a file, not the required directory) and
  therefore would never have run.
- `typecheck` npm script.

### Changed
- Formatted the entire source tree to match the project's Prettier config.
  309 lint errors, all from code added in 3.0–3.2. Lint is now clean, so CI
  passes on the first run.

## [3.2.0] — 2026-07-28 — Freemium + security fixes

### Security — three confirmed bugs fixed

1. **IP rate limiting was bypassable.** `clientIp()` read the *leftmost*
   `X-Forwarded-For` entry, which is whatever the client sent. An attacker could
   rotate a fake IP per request and reset every IP-based limit, defeating login
   brute-force protection. Now counts back from the right by
   `TRUSTED_PROXY_HOPS` (default 1), reading only entries our own proxy appended.
   Verified against 6 header-spoofing scenarios.
2. **CSRF middleware never covered the API routes.** TanStack's built-in
   protection filters on `handlerType === "serverFn"`, so every REST endpoint
   relied solely on `SameSite=Lax`. Added a `Sec-Fetch-Site` check (with
   Origin/Host fallback) to `apiRoute`, applied to all state-changing methods.
   Verified: cross-site POST → 403, same-origin → passes, GET unaffected,
   non-browser clients unaffected.
3. **Database TLS was encrypted but not authenticated.**
   `rejectUnauthorized: false` let anything on the network path present its own
   certificate. Now verifies against the public CA store for Neon and Supabase,
   supports a pinned CA via `DATABASE_CA_CERT`, and logs a loud warning when it
   must fall back.

### Added — freemium
- **Plans** (`src/server/plans.server.ts`) — Free (50 expenses/month, 5 AI
  messages/day, 3 receipt scans/month, 90-day history) and Pro (unlimited plus
  monthly AI insights).
- **Metered usage** — new `usage_events` table indexed on
  `(user_id, kind, occurred_at)`. Expense counts read from the `expenses` table
  rather than a counter, so they cannot drift when rows are deleted.
- **Quota enforcement** returning HTTP 402 on `/api/expenses`, `/api/chat` and
  `/api/receipt`.
- **`/api/billing`** — plans, live usage, and plan switching.
- **Usage meter UI** in the sidebar with per-quota progress bars that turn amber
  at 80% and red when exhausted.
- **`users.plan` / `users.plan_since`** via `ALTER TABLE ... IF NOT EXISTS`, safe
  to re-run against databases created by earlier versions.

### Added — deployment
- **`render.yaml`** for free Render deploys, with `TRUSTED_PROXY_HOPS=1` and a
  reduced `PG_POOL_MAX` suited to free-tier connection limits.
- **DEPLOYMENT.md** rewritten for Neon + Render, including why Render's own free
  Postgres is unsuitable (deleted after 30 days) and why not to keep-alive ping.

### Notes
No payment provider is integrated. `POST /api/billing` sets the plan column
directly and is gated behind `ALLOW_DEMO_UPGRADE`, so visitors can toggle Pro to
see quota behaviour. Real billing means replacing that one handler with a
gateway webhook; no other code changes.

### Verified
14 SQL assertions against a real Postgres engine: schema applies and re-applies
idempotently, new users default to Free, monthly expense counts correctly exclude
income and prior months, daily AI counts exclude yesterday, monthly scan counts
exclude last month, quota arithmetic allows and blocks at the right boundaries,
upgrade sets the plan, and `usage_events` cascades on account deletion. Plus
clean typecheck, successful build, and 6 CSRF/IP scenarios exercised over HTTP.

## [3.1.0] — 2026-07-28

### Added
- **Receipt scanning** — photograph a bill and a vision model extracts each line
  item, categorises it, and skips tax/discount/subtotal rows. Images are
  downscaled client-side to 1600px before upload. Results are returned as an
  editable draft: nothing is written to the ledger until the user confirms, and
  low-confidence reads are flagged. Limited to 15 scans per user per 10 minutes.
  `POST /api/receipt`.
- **Expense history** — a History tab beside the dashboard listing every expense
  with inline editing and per-row delete, using the existing keyset pagination.
  `PATCH` and `DELETE /api/expenses/:id`.
- **README illustrations** — five hand-authored SVGs in `docs/` using the app's
  real design tokens: landing page, chat + dashboard, bar/pie charts, the
  receipt scanning flow, and expense history.
- **README example prompts** — a table mapping messy real-world input to the
  parsed result, plus analysis-style prompts.
- **COMMIT.md** — cleanup and git push instructions.

### Security
- Single-expense edit and delete filter on `user_id` inside the `WHERE` clause
  rather than a separate ownership lookup, so there is no window between the
  check and the write. Verified: a second user cannot edit or delete another
  user's expense even with a valid ID.

### Verified
8 further SQL assertions against a real Postgres engine covering the new
endpoints: owner can edit and delete, non-owner is blocked on both, the row is
provably unchanged after an attacker's attempt, deleting a nonexistent ID
returns nothing, and partial updates touch only the supplied fields.

## [3.0.1] — 2026-07-28

### Fixed
- **Bulk expense insert was broken** — Postgres cannot infer parameter types
  inside a `VALUES`-derived table and defaulted them all to `text`, so every
  insert failed with `column "amount" is of type numeric but expression is of
  type text`. Added explicit casts. Found by running the real SQL against an
  embedded Postgres; this would have failed on the first expense saved.
- **"Request failed (500)"** — thrown errors escaped the route handlers and
  returned an HTML error page, so the UI showed a bare status code. Added
  `apiRoute()`, an error boundary wrapping every endpoint. A missing or
  unreachable `DATABASE_URL` now returns 503 with a message saying exactly
  what to set, instead of an opaque 500.
- **Signup swallowed database errors** — its `catch` turned every failure into
  "Could not create account." Now only unique-violation is handled there;
  everything else propagates to the error boundary.

### Added
- `DIST_DIR` env var on `serve.js` to run an alternate build output.
- Client surfaces the server's `hint` field so config problems are actionable.

### Verified
17 SQL assertions run against a real Postgres engine (PGlite): migrations are
idempotent, unique email enforced, scrypt verify accepts correct and rejects
wrong passwords, sessions resolve and expire, bulk insert works, aggregates
compute correctly (₹420 total with income excluded), keyset pagination returns
non-overlapping pages, CHECK constraints block negative amounts and invalid
kinds, chat upsert works, and `ON DELETE CASCADE` removes all child rows.

## [3.0.0] — 2026-07-28 — Real SaaS

Breaking: browser storage is gone. All data now lives in Postgres. Any
accounts created in earlier versions existed only in one browser and do
not carry over.

### Added
- **PostgreSQL backend** (`src/server/db.server.ts`) — bounded connection pool,
  idempotent migrations that run on boot under an advisory lock (safe with
  multiple instances), 15s statement timeout, hourly expired-session sweep,
  graceful pool drain on SIGTERM.
- **Server-side auth** (`src/server/auth.server.ts`) — scrypt password hashing
  with per-user random salt, constant-time comparison, opaque 256-bit session
  tokens stored only as SHA-256, httpOnly + SameSite=Lax + Secure cookies.
- **REST API** — `/api/auth/{signup,login,logout,me}`, `/api/profile`
  (PATCH/PUT/DELETE), `/api/expenses` (GET/POST/DELETE), `/api/stats`,
  `/api/chat-history`, `/api/health`.
- **Rate limiting** (`src/server/rate-limit.server.ts`) — sliding window with a
  bounded key map. Signup 5/IP/hr, login 20/IP and 10/account per 15min,
  AI chat 30/user/10min, expense writes 120/user/min.
- **Account deletion** — removes all data via ON DELETE CASCADE.
- **Production server** (`serve.js`) — Hono + @hono/node-server adapter that
  serves the client build and forwards streaming SSR/API responses.
- **Railway config** — `railway.json` with `/api/health` healthcheck.
- **DEPLOYMENT.md** — git push steps, Railway setup, scale notes.

### Changed
- Frontend talks to the server via `src/lib/api.ts`; IndexedDB removed.
- Dashboard totals come from SQL `SUM/GROUP BY`, not client-side computation.
- Expense list uses keyset pagination instead of OFFSET.
- Minimum password length raised 6 → 8.
- Landing copy no longer claims data stays in the browser.
- `src/lib/db.ts` and `src/lib/auth-store.ts` now throw on import; delete them.

### Scale
- Dashboard response size is constant regardless of row count — the browser
  never downloads expense rows.
- `(user_id, occurred_at DESC, id DESC)` index means queries touch only one
  user's rows; a 10GB shared table does not slow an individual user down.
- Bulk insert capped at 500 rows / 512KB per request; the client chunks larger
  imports and each chunk is one transaction.
- Chat transcripts capped at 60 messages / 256KB per user.

### Verified
Build succeeds; production server boots and serves SSR (200) and static assets.
Health returns 503 when Postgres is unreachable so bad deploys fail their
healthcheck. All protected endpoints return 401 without a session. Validation
returns 400, database failure returns a graceful 500, and the process stays up
through every error path.

## [2.1.0] — 2026-07-28

### Fixed
- **Vite config** — added missing `@vitejs/plugin-react` that TanStack Start requires for React Refresh in dev mode.
- **Auth flow** — completely rewrote to use async IndexedDB instead of synchronous localStorage. SSR no longer breaks hydration.

### Changed
- **Database layer** — all user data (accounts, sessions, expenses, chat messages) moved from localStorage to IndexedDB (`db.ts`). Data is structured in 4 object stores: `users`, `sessions`, `ledger`, `messages`. Indexed by user email.
- **ChatWindow** — now accepts `userEmail` prop and reads/writes all data through IndexedDB. No more global localStorage keys.
- **paisawise-store.ts** — stripped to pure types, constants, and parsing utilities. No more storage code.

### Added
- **User profile system** — avatar with initials (color-coded by email hash), profile dropdown with name, email, bio, member-since date.
- **Profile settings modal** — change name, bio, gender. Change password with current-password verification.
- **UserMenu component** — dropdown in app header showing profile, settings, and sign out.
- **Per-user random salt** — each account gets a unique 16-byte `crypto.getRandomValues()` salt for password hashing.

### Security
- Passwords hashed with per-user random salt (not a shared hardcoded string)
- IndexedDB is same-origin isolated — other sites cannot read PaisaWise data
- Session auto-expires after 7 days
- Rate limiter on auth form (5 attempts / 60 seconds)
- Generic "Invalid email or password" error prevents user enumeration

## [2.0.1] — 2026-07-28

### Fixed
- **Auth page dead buttons** — `localStorage` and `crypto.subtle` calls in `auth-store.ts` crashed during TanStack Start's SSR pass, breaking React hydration so event handlers never attached. Added `isBrowser()` guards to every function.
- **SSR guard on app.tsx** — `getSession()` call in useEffect now checks for browser context first.

### Security Fixes (3 major bugs)
1. **User enumeration attack** — `signIn()` previously returned different error messages for "email not found" vs "wrong password", letting attackers confirm which emails have accounts. Now returns generic "Invalid email or password." for both cases.
2. **Hardcoded password salt** — all users shared a single salt (`"paisawise-salt-2024"`) baked into the source code. Replaced with `crypto.getRandomValues()` per-user random salt stored alongside the hash. Rainbow table attacks now require per-user effort.
3. **Immortal sessions** — sessions in localStorage never expired, giving permanent access to anyone who touches the browser once. Added 7-day TTL; `getSession()` now auto-purges expired sessions.

### Added
- Client-side rate limiter on auth form — max 5 attempts per 60 seconds to block brute force.
- Name field is now `required` in signup mode.

## [2.0.0] — 2026-07-27

### Removed
- **Lovable dependency** — removed `@lovable.dev/vite-tanstack-config`, Lovable AI gateway, Lovable error reporting, `.lovable/` directory, and all Lovable branding
- Lovable preview image URLs from OG meta tags

### Added
- **Author attribution** — "Built by Sujay Gopal" in footer, meta tags, README
- **User authentication** — `/auth` route with email + password sign-up/sign-in, SHA-256 hashed passwords, per-user data namespacing in localStorage
- **Recharts bar chart** — horizontal bar chart showing category-wise spending
- **Recharts pie chart** — donut chart with percentage labels, toggle between bar/pie views
- **Money leak detection** — automatic warnings when a category exceeds 35% of total spend, medium warnings at 20%+
- **Monthly AI insights** — "Get Monthly Insights" button sends expense data to AI, returns top 3 leaks, 3 saving tips, 1 habit to change (with local fallback when AI is unavailable)
- **Client-side expense parser** — `expense-parser.ts` auto-categorises typed expenses instantly (supports ₹, Rs, k-notation, Indian merchants/UPI apps)
- **Auto-save on input** — expenses are parsed and saved to the ledger immediately on send, before the AI responds
- **`.env.example`** — template for API key configuration
- **CHANGELOG.md** — this file

### Changed
- **AI backend** — replaced Lovable AI gateway with direct OpenAI-compatible provider (defaults to Google Gemini free tier); configurable via `AI_API_KEY`, `AI_PROVIDER_BASE_URL`, `AI_MODEL` env vars
- **Vite config** — standalone TanStack Start config instead of `@lovable.dev/vite-tanstack-config`
- **Landing page CTA** — buttons now route to `/auth` instead of `/app`
- **FAQ** — updated to reflect new auth requirement
- **Storage** — all expense data namespaced per user email
- **README** — rewritten with setup instructions, tech stack, and repo public steps

### Security
- Payload size limit (1MB) on `/api/chat` endpoint
- CSRF middleware active on all server functions
- API keys only used server-side, never exposed to client
- Password hashing with SHA-256 + salt
- All localStorage operations wrapped in try/catch
- No `dangerouslySetInnerHTML` with user input
- `.env` added to `.gitignore`

## [1.0.0] — Initial Release (Lovable)

- Original PaisaWise built with Lovable
- Chat-based expense tracking
- AI-powered categorisation
- Local storage persistence
- Landing page with feature showcase

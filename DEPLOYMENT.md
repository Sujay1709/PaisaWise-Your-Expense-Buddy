# Deploying PaisaWise — free

Total cost: **₹0**. Neon for Postgres, Render for the web service, Gemini free
tier for AI.

---

## 1. Database — Neon

Neon's free tier is permanent (not a trial): 0.5 GB storage, 100 CU-hours per
month, no card required.

1. Sign up at <https://neon.tech> → **Create project** (pick the region nearest
   your users — Singapore or Mumbai for India).
2. Copy the **connection string** from the dashboard. It looks like:
   ```
   postgresql://user:pass@ep-something-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

Neon uses publicly trusted certificates, so the app verifies them properly —
no `rejectUnauthorized: false` weakening on this path.

**Scale-to-zero is mandatory on free.** The database sleeps when idle and takes
a few hundred ms to wake. Fine for a portfolio demo.

---

## 2. Web service — Render

1. Sign up at <https://render.com> → **New → Web Service** → connect your repo.
2. Render reads `render.yaml` automatically. If configuring manually:
   - Runtime **Node**, Plan **Free**, Region **Singapore**
   - Build: `npm ci && npm run build`
   - Start: `npm run start`
   - Health check path: `/api/health`
3. Add the two secret env vars in the dashboard (the rest come from `render.yaml`):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string |
   | `AI_API_KEY` | your key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

4. Deploy. Watch for `[db] schema ready` in the logs — migrations run on boot.

**Do not use Render's free Postgres.** It is deleted after 30 days. Neon's is not.

### The cold start

Render's free web service spins down after ~15 minutes idle. The next visitor
waits roughly a minute for it to wake. Say so in your README rather than letting
a recruiter conclude the project is broken:

```markdown
### [🔗 Live demo](https://paisawise.onrender.com)
*Free tier — the first load after inactivity takes ~60s while the server wakes.*
```

Do **not** add a cron job to ping the service and keep it warm. It burns your
Neon compute hours, and Render's terms discourage it.

---

## 3. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `AI_API_KEY` | yes | Gemini key; AI features return 503 without it |
| `AI_PROVIDER_BASE_URL` | no | Defaults to Gemini's OpenAI-compatible endpoint |
| `AI_MODEL` | no | Defaults to `gemini-2.0-flash`. **Must support vision** for receipt scanning |
| `NODE_ENV` | yes | `production` — enables the `Secure` cookie flag |
| `TRUSTED_PROXY_HOPS` | no | Proxies in front of the app. `1` for Render. See below |
| `PG_POOL_MAX` | no | Max DB connections per instance (default 10; use 5 on free tiers) |
| `DATABASE_CA_CERT` | no | CA certificate for full TLS verification |
| `ALLOW_DEMO_UPGRADE` | no | `true` lets visitors toggle Pro without payment |

### `TRUSTED_PROXY_HOPS` matters for security

Rate limiting keys on client IP, read from `X-Forwarded-For`. That header is a
list each proxy **appends** to, so the leftmost entry is whatever the client
sent — attacker-controlled. Reading it lets an attacker rotate a fake IP per
request and bypass every IP-based limit, including login brute-force protection.

The app counts back from the right by `TRUSTED_PROXY_HOPS`. Set it to the number
of proxies **you** control:

- Render, Railway, Fly (direct): `1`
- Behind Cloudflare as well: `2`

Too high and you read a client-supplied value again; too low and everyone shares
a rate-limit bucket.

---

## 4. Local development

```sh
cp .env.example .env    # fill in DATABASE_URL and AI_API_KEY
npm install
npm run dev
```

Point `DATABASE_URL` at either your Neon database or a local Postgres:

```sh
docker run --name paisawise-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=paisawise -p 5432:5432 -d postgres:16
```

Local connections skip TLS automatically.

**Using Neon for local dev means dev and production share one database** —
test signups appear in your live demo. Create a second free Neon project, or use
Neon's branching, to separate them.

---

## 5. Freemium tiers

| | Free | Pro (₹99/mo) |
|---|---|---|
| Expenses | 50/month | Unlimited |
| AI messages | 5/day | Unlimited |
| Receipt scans | 3/month | Unlimited |
| Monthly AI insights | — | ✓ |

Limits live in `src/server/plans.server.ts`. Quotas are enforced server-side and
return **HTTP 402 Payment Required**, which the UI turns into an upgrade prompt.

The two metered actions — AI chat and receipt scanning — are the only ones that
cost real money per use, which is why they carry the tightest caps. Expense
counts are read from the `expenses` table rather than a counter, so they cannot
drift when rows are deleted.

**No real payments are processed.** `POST /api/billing` switches the plan column
directly and is gated behind `ALLOW_DEMO_UPGRADE`. Charging money in India needs
a payment gateway, a registered business, KYC and GST — none of which exist here.
To go live, replace that one handler with a Razorpay webhook that sets the same
column. Nothing else in the codebase changes.

---

## 6. Scale and reliability

**Why data volume doesn't degrade the app.** `/api/stats` runs
`SUM(...) GROUP BY category` in Postgres against the `(user_id, occurred_at)`
index and returns about ten numbers. The browser never receives raw expense
rows, so response size and query time are effectively constant whether a user
has 50 expenses or 5 million.

**Keyset pagination, not OFFSET.** `/api/expenses?cursor=...` seeks on
`(occurred_at, id)`. With `OFFSET`, page 5000 forces Postgres to walk and discard
everything before it; keyset makes every page cost the same.

**Bounded writes.** Bulk insert caps at 500 rows and 512KB per request; the
client chunks larger imports and each chunk is one transaction. Chat transcripts
cap at 60 messages / 256KB per user — the one table that could otherwise grow
without limit, since AI replies are long.

**Bounded connections.** `PG_POOL_MAX` with a 15s `statement_timeout`, and the
pool drains on `SIGTERM` so redeploys don't sever in-flight transactions.

**Rate limits** are per-instance and in-memory:

| Action | Limit |
|---|---|
| Signup | 5 per IP per hour |
| Login | 20 per IP, 10 per account, per 15 min |
| AI chat | 30 per user per 10 min |
| Receipt scan | 15 per user per 10 min |
| Expense writes | 120 per user per minute |

Scaling past one instance means each replica keeps its own counters, so the
effective limit multiplies. Move to Redis if you need a hard global cap.

---

## 7. Known gaps before real users

These are deliberate omissions, not oversights:

- **No password reset.** Forgotten password means permanent lockout. Needs an
  email provider.
- **No email verification.** Anyone can register with anyone's address.
- **Receipts are sent to Google.** Receipt images can contain names, card
  last-4, addresses. India's DPDP Act requires explicit consent and a privacy
  policy, and Gemini's free tier may use submitted data for training — the wrong
  tier for financial documents.
- **No backups.** Neon free has no point-in-time recovery.
- **Unverified TLS on some providers.** Neon and Supabase verify properly; other
  hosts fall back to encrypted-but-unauthenticated unless you set
  `DATABASE_CA_CERT`. The app logs a warning when this happens.

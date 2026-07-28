# Deploying PaisaWise

## 1. Push this code to GitHub

Your existing repo was created by Lovable. This folder is **not** a git repo yet
(it is the extracted zip), so you have two options.

### Option A — replace the Lovable repo contents (keeps the repo, history, stars)

```sh
cd /Users/sujaygopal/paisa-savvy-student-main

git init
git remote add origin https://github.com/Sujay1709/paisa-savvy-student.git
git fetch origin

# Start from the remote branch, then swap in this code
git checkout -b main origin/main

# Remove every tracked file, then re-add the current folder contents
git rm -r --cached . > /dev/null
git add -A
git commit -m "Rebuild as a real SaaS: Postgres backend, server auth, Railway deploy

- Remove all Lovable dependencies, branding, and config
- Replace browser storage with Postgres (users, sessions, expenses, chat)
- Server-side auth: scrypt hashing, httpOnly session cookies
- SQL-aggregated dashboard so data volume does not affect load time
- Keyset pagination, bulk insert caps, rate limiting, health checks"

git push origin main
```

If the push is rejected because histories differ, force it — this is the
intended outcome, you are replacing the Lovable code:

```sh
git push --force origin main
```

### Option B — fresh repo

```sh
cd /Users/sujaygopal/paisa-savvy-student-main
git init
git add -A
git commit -m "PaisaWise — initial commit"
git branch -M main
git remote add origin https://github.com/Sujay1709/paisawise.git
git push -u origin main
```

### Delete the leftover Lovable folder first

The sandbox could not remove these. Run this before committing:

```sh
rm -rf .lovable
rm -f src/lib/db.ts src/lib/auth-store.ts
```

Both `db.ts` and `auth-store.ts` are dead files from the old browser-storage
version. They now throw on import so a stale reference fails loudly rather
than silently using removed code.

### Verify no secrets are committed

```sh
git log --all -p | grep -iE "AI_API_KEY=|DATABASE_URL=postgres" | grep -v example
```

Should print nothing. `.env` is gitignored; `.env.example` holds only placeholders.

## 2. Deploy on Railway

1. **New Project → Deploy from GitHub repo**, pick your repo.
2. **Add a database**: *New → Database → Add PostgreSQL*. Railway provisions it
   and exposes `DATABASE_URL` on the Postgres service.
3. **Set variables** on the *app* service (Variables tab):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` — reference, do not paste the literal string |
   | `AI_API_KEY` | your Gemini key from https://aistudio.google.com/apikey |
   | `AI_PROVIDER_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai` |
   | `AI_MODEL` | `gemini-2.0-flash` |
   | `NODE_ENV` | `production` |

   Do **not** set `PORT` — Railway injects it and the server binds to it.

4. **Generate a domain**: Settings → Networking → Generate Domain.
5. Watch the deploy logs. You should see `[db] schema ready` — migrations run
   automatically on boot, so there is no manual migration step.

The healthcheck at `/api/health` verifies Postgres is reachable, so a deploy
with a bad `DATABASE_URL` fails the healthcheck instead of serving broken pages.

## 3. Local development

```sh
cp .env.example .env      # then fill in real values
npm install
npm run dev
```

You need a local Postgres. Quickest path:

```sh
docker run --name paisawise-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=paisawise -p 5432:5432 -d postgres:16
```

## 4. Scale and reliability notes

**Why data volume does not degrade the app.** The dashboard never downloads
expense rows. `/api/stats` runs `SUM(...) GROUP BY category` in Postgres against
the `(user_id, occurred_at)` index and returns roughly 10 numbers. Response size
and query time are effectively constant whether a user has 50 expenses or
5 million — the index means Postgres only touches that user's rows.

**Pagination uses keyset, not OFFSET.** `/api/expenses?cursor=...` seeks on
`(occurred_at, id)`. With `OFFSET`, page 5000 would force Postgres to walk and
discard the preceding rows; keyset makes every page cost the same.

**Write path is bounded.** Bulk insert is capped at 500 rows per request and
512KB per payload; the client chunks larger imports automatically. Each chunk is
one transaction, so a failure mid-import cannot leave half-written rows.

**Chat transcripts are capped** at 60 messages / 256KB per user. This is the one
table that could otherwise grow unbounded, since AI replies are long.

**Connection pool is bounded** (`PG_POOL_MAX`, default 10) with a 15s
`statement_timeout`. A slow query cannot pin a connection indefinitely, and
traffic spikes queue rather than exhausting Postgres connection slots.

**Graceful shutdown.** On `SIGTERM` (every Railway redeploy) the pool drains so
in-flight transactions complete instead of being cut mid-write.

**Rate limits** are per-instance and in-memory:

| Action | Limit |
|---|---|
| Signup | 5 per IP per hour |
| Login | 20 per IP and 10 per account per 15 min |
| AI chat | 30 per user per 10 min |
| Expense writes | 120 per user per minute |

If you scale past one replica, each replica keeps its own counters, so the
effective limit multiplies. Move these to Redis if you need a hard global cap.

### When you outgrow this

- **Multiple replicas**: raise `numReplicas` in `railway.json`. Sessions live in
  Postgres, so any replica can serve any user — no sticky sessions needed. Move
  rate limiting to Redis at that point.
- **Very large tables**: if `expenses` passes ~50M rows, partition by month
  (`PARTITION BY RANGE (occurred_at)`) so old data can be dropped cheaply.
- **Dashboard caching**: if `/api/stats` ever becomes hot, cache per user for
  30–60s or maintain a rollup table updated on write.

## 5. Security summary

- Passwords hashed with scrypt (memory-hard, per-user random salt), compared in
  constant time.
- Session tokens are 256-bit random; only their SHA-256 is stored, so a database
  dump does not yield usable sessions.
- Cookies are `httpOnly` (XSS cannot read them), `SameSite=Lax` (blocks CSRF),
  and `Secure` in production.
- Login timing is equalised so response time does not reveal whether an account
  exists; errors are generic to prevent user enumeration.
- Changing a password invalidates every other session.
- All SQL uses bound parameters — no string interpolation anywhere.
- `ON DELETE CASCADE` means account deletion removes all associated data.
- AI endpoint requires authentication so anonymous traffic cannot burn API credits.

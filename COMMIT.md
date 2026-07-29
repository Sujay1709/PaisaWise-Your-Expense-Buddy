# Commit and deploy — v3.4.0

Everything below is verified locally: **0 lint errors, typecheck clean, build
succeeds, 12 SQL assertions passing, all PWA assets serving.**

I cannot run `git` or trigger the Render deploy from here — the sandbox blocks
writes to `.git` and has no access to your accounts. Run these on your Mac.

---

## 1. Clean up and commit

```sh
cd /Users/sujaygopal/paisa-savvy-student-main

# My test scripts and extra build dirs (all gitignored except sslcheck.mjs)
git rm --cached sslcheck.mjs 2>/dev/null
rm -f sslcheck.mjs sqltest*.mjs iptest.mjs
rm -rf dist dist2 dist3 dist4 dist5 dist6 dist7 dist8 dist9 dist10 dist11

git add -A
git commit -m "Add accounts, budgets, custom categories, recurring, dark mode and PWA

Features studied from the Paisa Flutter expense manager (GPLv3) and
implemented independently against our own schema — no code copied.

Accounts:
- accounts table (cash/bank/upi/card/wallet) and expenses.account_id
- balances computed in SQL, never stored, so they cannot drift
- ON DELETE SET NULL keeps history when an account is removed
- ownership re-verified server-side on every write

Budgets:
- one monthly cap per category, LEFT JOIN LATERAL against month spend
- warns before overspend; leak detection still reports after

Custom categories:
- per-user categories seeded with the original seven on signup
- expenses.category stays TEXT, not a FK: the AI parser and receipt
  scanner emit names, and denormalising means renaming or deleting a
  category never rewrites history

Recurring:
- daily/weekly/monthly rules materialised on app load (Render free has
  no cron)
- idempotent: rules selected only while next_run <= CURRENT_DATE and the
  same transaction advances it; FOR UPDATE SKIP LOCKED prevents
  concurrent double-posting
- catch-up capped at 12 per rule (a 5-year dormant daily rule creates 12
  rows, not 1800)

Dark mode:
- toggle in both headers, persisted, falls back to OS preference
- blocking script in <head> applies it before paint, avoiding a white
  flash on every load

Manual entry:
- Add tab with title, amount, date, per-category toggles, expense/income
- POST /api/expenses accepts occurredAt, validated against future and
  pre-2000 dates which would corrupt monthly totals and quota counts

PWA:
- manifest, maskable icons, iOS meta tags, offline page
- service worker never caches API responses: a stale balance shown as
  current is worse than showing none

Verified: 12 SQL assertions on a real Postgres engine, 0 lint errors,
clean typecheck, successful build, all PWA assets serving."

git push origin main
```

Check the **Actions** tab — CI (lint, typecheck, build) should go green.

---

## 2. Deploy to Render

If the service already exists, the push above auto-deploys. Otherwise:

1. <https://render.com> → **New → Web Service** → pick
   `PaisaWise-Your-Expense-Buddy`
2. Render reads `render.yaml`. Confirm Node runtime, Free plan, Singapore.
3. Under **Environment**, add the two secrets:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string |
   | `AI_API_KEY` | your Gemini key |

4. **Create Web Service**

Watch for:

```
==> Using Node.js version 22.x
added 695 packages
✓ built in ...
[db] schema ready          ← migrations ran, new tables created
[server] PaisaWise listening on http://0.0.0.0:10000
==> Your service is live 🎉
```

**The new tables are created automatically.** Migrations use
`CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, so
this deploy adds accounts, categories, budgets and recurring to your existing
Neon database without touching the data already in it.

---

## 3. After it goes live

```sh
# Replace with your real Render URL
sed -i '' 's|<!--$|### [🔗 Live demo](https://YOUR-URL.onrender.com)|' README.md
```

Simpler: open `README.md`, find the commented block near the top, and replace it
with your real URL. **Do not use `paisawise.onrender.com`** — that belongs to an
unrelated project.

Then set the repo's **About** website field (⚙️ beside "About") to the same URL.
It still points at Lovable.

---

## 4. Smoke test

- [ ] Sign up — should also create Cash / Bank / UPI accounts and 7 categories
- [ ] `340 swiggy, 30 auto, 50 coffee` → three expenses, ₹420
- [ ] Dark mode toggle works and survives a refresh
- [ ] **Add** tab: title, amount, backdated date, category toggle → saves
- [ ] Dashboard shows category list + bar chart + donut together
- [ ] History tab: edit and delete a row
- [ ] Usage meter shows quotas; Upgrade to Pro flips them to Unlimited
- [ ] On your phone: Share → **Add to Home Screen** → opens full-screen with
      the ₹ icon and no browser chrome
- [ ] Turn on airplane mode and reopen → offline page, not a browser error
- [ ] Private window → cannot see the first account's data

---

## Known gap

The four new features have **working, tested APIs but no UI yet**. There is no
screen to create an account, set a budget, add a custom category or create a
recurring rule — `GET /api/ledger` returns all of it, and the Add form does not
yet show the account selector. That is the next piece of work.

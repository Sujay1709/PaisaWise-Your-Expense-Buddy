# Commit and redeploy — v3.5.0

Verified locally: **0 lint errors, typecheck clean, build succeeds, all 4
timeline ranges register and auth-gate correctly, 10 SQL assertions pass on a
real Postgres engine.**

I cannot run `git` or trigger the deploy from here — the sandbox blocks `.git`
writes and has no access to your accounts. Run these on your Mac.

---

## 1. Push

```sh
cd /Users/sujaygopal/paisa-savvy-student-main

# Test artifacts — all gitignored except sslcheck.mjs (still tracked from earlier)
git rm --cached sslcheck.mjs 2>/dev/null
rm -f sslcheck.mjs sqltest*.mjs iptest.mjs t5.mjs t6.mjs
rm -rf dist dist2 dist3 dist4 dist5 dist6 dist7 dist8 dist9 dist10 dist11 dist12

git add -A
git commit -m "Add timeline insights (day/5-day/week/month)

- GET /api/timeline?range=... returns SQL-aggregated daily buckets plus
  summary numbers (total spent, per-day average, peak day) and the top
  categories for the window
- generate_series zero-fills empty days so a missing bar reads as 'no
  data' rather than 'no spend'
- Income excluded from spend buckets, matching /api/stats
- Timeline UI shows the toggle, three stat tiles and a filled area chart

Response size is bounded by days (1/5/7/30), not by expense volume, so
scale properties from earlier versions still hold.

Verified: 10 SQL assertions on real Postgres, 0 lint errors, clean
typecheck, successful build, all 4 range routes auth-gate correctly."

git push origin main
```

Render auto-deploys on push. Check the **Actions** tab for a green CI run and
the Render dashboard for the deploy log.

---

## 2. What to watch for in the deploy log

```
==> Using Node.js version 22.x
added 695 packages
✓ built in ...
[db] schema ready
[server] PaisaWise listening on http://0.0.0.0:10000
==> Your service is live 🎉
```

The timeline is a read-only feature — **no new tables, no migrations**. It
queries the existing `expenses` table with `generate_series`. If v3.4.0
deployed cleanly, this one will too.

---

## 3. Smoke test

- [ ] Open the dashboard — the Timeline widget appears above "By category"
- [ ] Toggle Today / 5 days / Week / Month
      - Bar count matches: 1 / 5 / 7 / 30
      - Days with no spend show as flat sections, not gaps
      - "Peak day" highlights the biggest single day in that window
- [ ] Log a `500 zomato` right now → Timeline updates on next tab switch
- [ ] "Per day" average matches your intuition (total ÷ days)
- [ ] Log an `earned 5000` income → total does NOT include it
- [ ] On mobile in the installed PWA → the toggle still works and the chart
      remains readable

---

## What's still not built

Same as v3.4.0: accounts, budgets, custom categories and recurring rules have
working, tested APIs (`/api/ledger`) but **no UI screens yet**. Next piece of
work if you want it.

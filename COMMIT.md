# Commit and redeploy — v3.5.1

This bundles the Timeline feature (v3.5.0, if you haven't pushed it yet) with
a fix for the bleeding toggle and the misleading "per day" number you
screenshotted. Nothing has been pushed from any of my previous turns —
that only happens when you run these commands yourself.

Verified locally: **0 lint errors, typecheck clean, build succeeds.**

---

## 1. Push

```sh
cd /Users/sujaygopal/paisa-savvy-student-main

# Clean up local test artifacts before committing
git rm --cached sslcheck.mjs 2>/dev/null
rm -f sslcheck.mjs sqltest*.mjs iptest.mjs t5.mjs t6.mjs t7.mjs
rm -rf dist dist2 dist3 dist4 dist5 dist6 dist7 dist8 dist9 dist10 dist11 dist12 dist13 dist14

git add -A
git commit -m "Fix timeline toggle bleeding and per-day average

- Range labels changed from variable-width text to fixed 2-char tokens
  (1D/5D/1W/1M) with w-9 + whitespace-nowrap + shrink-0, so the toggle
  row can never wrap and push into the Peak day tile below it
- avgPerDay now computed as total / days instead of AVG(spent) over
  active days only — fixes Spent/Per day/Peak day showing identical
  values for a month with a single expense
- Renamed CTE alias day -> bucket_day (bare 'day' alias caused a
  Postgres syntax error), quoted AS \"count\"

Verified: typecheck clean, 0 lint errors, build succeeds, PGlite check
confirms correct per-day averages across all 4 ranges."

git push origin main
```

Render auto-deploys on push. Watch the Render dashboard's deploy log, and
after it says "Your service is live," **hard-refresh** the page
(Cmd+Shift+R) — otherwise your browser may serve the old cached JS bundle
and it'll look unfixed even though the new build is live.

---

## 2. Smoke test after deploy

- [ ] Dashboard → Timeline widget → toggle shows `1D 5D 1W 1M`, all on one
      line, no overlap with the stat tiles below
- [ ] Switch to Month with only one expense logged → "Per day" is now
      total ÷ 30, not equal to "Spent"
- [ ] Resize the browser narrower (or check on mobile) → toggle still
      doesn't wrap

---

## What's still not built

Same as before: accounts, budgets, custom categories and recurring rules
have working, tested APIs (`/api/ledger`) but no UI screens yet.

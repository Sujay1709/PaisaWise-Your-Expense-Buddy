# Commit & push — run these on your Mac

I initialised a git repo but the sandbox filesystem blocked git from writing its
index (`Operation not permitted` on `.git/index.lock`), so the commit has to be
made from your machine. **Start by removing the half-created repo.**

## 1. Clean up

```sh
cd /Users/sujaygopal/paisa-savvy-student-main

rm -rf .git                              # remove the broken repo I created
rm -f src/lib/lovable-error-reporting.ts # last Lovable-named file, nothing imports it
rm -rf dist dist2 dist3 dist4            # build output + my test builds
rm -f sqltest.mjs sqltest2.mjs           # my SQL test scripts
```

Verify nothing is left behind:

```sh
grep -ril lovable src/ ; echo "^ should print nothing"
```

## 2. Commit

### Option A — replace the Lovable repo's contents (keeps the repo and its history)

```sh
git init
git remote add origin https://github.com/Sujay1709/paisa-savvy-student.git
git fetch origin
git checkout -b main origin/main

git rm -r --cached . > /dev/null   # untrack everything Lovable committed
git add -A
git commit -m "Rebuild as a production SaaS: Postgres, server auth, receipt scanning

Remove all Lovable dependencies, branding and config.

Backend:
- PostgreSQL (users, sessions, expenses, chat) replacing browser storage
- scrypt password hashing with per-user salts; httpOnly session cookies
- Migrations run on boot under an advisory lock; bounded pool; graceful drain
- Per-route error boundary returning actionable JSON instead of HTML 500s
- Rate limiting on auth, AI and write endpoints

Features:
- Receipt scanning: photograph a bill, vision model extracts line items,
  user confirms before anything is saved
- Expense history with inline edit and per-row delete
- Bar and pie charts, money leak detection, monthly AI insights

Scale:
- Dashboard totals aggregated in SQL; browser never downloads raw rows
- Keyset pagination instead of OFFSET
- Bulk insert capped and chunked; chat transcripts capped

Verified: 25 SQL assertions against a real Postgres engine, clean typecheck,
successful production build, all endpoints auth-gated."

git push origin main
```

If the push is rejected because the histories differ, force it — replacing the
Lovable code is the intent:

```sh
git push --force origin main
```

### Option B — fresh repo

```sh
git init
git add -A
git commit -m "PaisaWise — initial commit"
git branch -M main
git remote add origin https://github.com/Sujay1709/paisawise.git
git push -u origin main
```

## 3. Confirm no secrets were committed

```sh
git log --all -p | grep -iE "AI_API_KEY=|DATABASE_URL=postgres" | grep -v example
```

Should print nothing. `.env` is gitignored; only `.env.example` (placeholders) is tracked.

## 4. Check the README renders

Open the repo on GitHub. The five SVGs in `docs/` should display inline. If any
appear broken, confirm the `docs/` folder was committed:

```sh
git ls-files docs/
```

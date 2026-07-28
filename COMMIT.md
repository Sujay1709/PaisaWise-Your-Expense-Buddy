# Ship it — cleanup, push, deploy

## 1. Close the Neon PR

Go to [PR #2](https://github.com/Sujay1709/PaisaWise-Your-Expense-Buddy/pull/2)
and click **Close pull request**.

It creates a throwaway Neon database branch per PR — useful for a team, not for
a solo project. It also would never have run: the file is at
`.github/workflows.yml`, but GitHub only reads workflows inside the
`.github/workflows/` **directory**. And without `NEON_API_KEY` and
`NEON_PROJECT_ID` set, every future PR would show a red ❌.

A working lint/typecheck/build workflow has been added instead.

## 2. Clean up and push

```sh
cd /Users/sujaygopal/paisa-savvy-student-main

# Remove my test scripts (sslcheck.mjs is tracked, the rest are not)
git rm --cached sslcheck.mjs 2>/dev/null
rm -f sslcheck.mjs sqltest.mjs sqltest2.mjs sqltest3.mjs iptest.mjs
rm -rf dist dist2 dist3 dist4 dist5 dist6

git add -A
git commit -m "Add CI workflow and format source to Prettier config

- .github/workflows/ci.yml runs lint, typecheck and build on every push
  and PR. Replaces Neon's PR-branch workflow, which sat at
  .github/workflows.yml (a file, not the required directory) and would
  never have run.
- Formatted the source tree: 309 Prettier errors, all from code added in
  3.0-3.2. Lint is now clean so CI is green on the first run.
- Added a typecheck npm script.
- Removed test scripts from version control."

git push origin main
```

Check the **Actions** tab — the CI run should go green. (Verified locally:
0 lint errors, typecheck clean, build succeeds.)

## 3. Deploy to Render

1. <https://render.com> → sign up with GitHub
2. **New → Web Service** → select `PaisaWise-Your-Expense-Buddy`
3. Render detects `render.yaml`. Confirm:
   - Runtime **Node**, Plan **Free**, Region **Singapore**
   - Build `npm ci && npm run build`, Start `npm run start`
   - Health check `/api/health`
4. Add the two secrets under **Environment** (everything else comes from
   `render.yaml`):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string — the same one in your local `.env` |
   | `AI_API_KEY` | your Gemini key |

5. **Create Web Service**

Watch the deploy log for:

```
[db] schema ready
[server] PaisaWise listening on http://0.0.0.0:10000
```

Then the health check turns green and the service goes Live.

### If the name is taken

`render.yaml` requests the service name `paisawise`, which gives
`paisawise.onrender.com`. That name is global across Render — if it is taken,
Render will assign something like `paisawise-a1b2`. Whatever URL you get, use it
in the next step.

## 4. Point everything at the live URL

Once you have the real URL:

```sh
# Replace with your actual Render URL
sed -i '' 's|https://paisawise.onrender.com|https://YOUR-URL.onrender.com|' README.md
git commit -am "Update live demo link" && git push
```

Then fix the repo's **About** field — it still points at Lovable
(`preview--paisa-savvy-student.lovable.app`), which is the last visible trace of
it. Click the ⚙️ beside "About" on the repo homepage and set the website to your
Render URL.

## 5. Smoke test the live site

- [ ] Sign up works (8+ character password)
- [ ] `340 swiggy, 30 auto, 50 coffee` → three expenses, ₹420 total
- [ ] Bar ↔ Pie toggle works; money-leak warning appears
- [ ] Usage meter reads 3/50 expenses, 1/5 AI messages
- [ ] History tab: edit an amount, delete a row
- [ ] Receipt scan reads a photo and asks for confirmation
- [ ] Upgrade to Pro → limits show Unlimited
- [ ] Sign out, sign back in → data persists
- [ ] Open in a private window → cannot see the first account's data

The last one matters most: it proves per-user isolation actually works in
production, not just in the SQL tests.

## Cold start

Render's free tier sleeps after ~15 minutes idle; the next visit takes roughly a
minute. The README already says so. Don't add a keep-alive cron — it burns Neon
compute hours and Render discourages it.

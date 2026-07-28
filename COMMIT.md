# Commit & deploy — v3.2.0

## 1. Clean up test artifacts

```sh
cd /Users/sujaygopal/paisa-savvy-student-main
rm -rf dist dist2 dist3 dist4 dist5
rm -f sqltest.mjs sqltest2.mjs sqltest3.mjs iptest.mjs
```

## 2. Commit

```sh
git add -A
git commit -m "Add freemium tiers and fix three security bugs

Security:
- Rate limiter read the leftmost X-Forwarded-For entry, which is
  client-controlled; an attacker could rotate a fake IP per request and
  bypass login brute-force protection. Now reads from the right by
  TRUSTED_PROXY_HOPS.
- TanStack's CSRF middleware only covers server functions, leaving every
  REST route protected by SameSite alone. Added a Sec-Fetch-Site check
  with Origin/Host fallback to all state-changing methods.
- Database TLS was encrypted but unauthenticated. Now verifies against
  the public CA store on Neon/Supabase, supports DATABASE_CA_CERT, and
  warns loudly when it must fall back.

Freemium:
- Free (50 expenses/mo, 5 AI msgs/day, 3 scans/mo) and Pro (unlimited)
- usage_events table, quota enforcement returning HTTP 402
- Usage meter UI; /api/billing for plans, usage and plan switching
- No payment provider: plan switching is a demo toggle behind
  ALLOW_DEMO_UPGRADE

Deployment:
- render.yaml for free Render + Neon hosting

Verified: 14 SQL assertions against a real Postgres engine, 6 IP-spoofing
scenarios, 5 CSRF scenarios over HTTP, clean typecheck, successful build."

git push origin main
```

## 3. Deploy

Follow **[DEPLOYMENT.md](./DEPLOYMENT.md)**. Short version:

1. **Neon** → create project → copy connection string
2. **Render** → New Web Service → connect repo (reads `render.yaml`)
3. Set `DATABASE_URL` and `AI_API_KEY` in the Render dashboard
4. Deploy, watch for `[db] schema ready`

## 4. Update the demo link

`render.yaml` names the service `paisawise`, so the URL will be
`https://paisawise.onrender.com` unless Render appends a suffix for uniqueness.
Check the real URL in the dashboard and fix line 11 of `README.md` if it differs.

## 5. Smoke test the live site

- [ ] Sign up works
- [ ] `340 swiggy, 30 auto, 50 coffee` logs three expenses (₹420 total)
- [ ] Charts render; bar/pie toggle works
- [ ] History tab lists expenses; edit and delete work
- [ ] Usage meter shows 3/50 expenses, 1/5 AI messages
- [ ] Receipt scan reads a photo and asks for confirmation
- [ ] "Upgrade to Pro" flips limits to Unlimited
- [ ] Sign out, sign back in, data is still there

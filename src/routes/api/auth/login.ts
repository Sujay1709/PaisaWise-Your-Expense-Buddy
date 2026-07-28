import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import { query } from "@/server/db.server";
import { createSession, json, sessionCookie, verifyPassword } from "@/server/auth.server";
import { clientIp, rateLimit, tooManyRequests } from "@/server/rate-limit.server";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: apiRoute(async ({ request }) => {
        let body: { email?: unknown; password?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        const email = String(body.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(body.password ?? "");

        // Two limiters: per-IP stops spraying, per-account stops targeting
        // one user from many IPs.
        const ipLimit = rateLimit(`login:ip:${clientIp(request)}`, 20, 900_000);
        if (!ipLimit.allowed) return tooManyRequests(ipLimit.retryAfterSeconds);

        if (email) {
          const acctLimit = rateLimit(`login:acct:${email}`, 10, 900_000);
          if (!acctLimit.allowed) return tooManyRequests(acctLimit.retryAfterSeconds);
        }

        if (!email || !password)
          return json({ error: "Email and password are required." }, { status: 400 });

        const rows = await query<{
          id: string;
          password_hash: string;
          password_salt: string;
        }>("SELECT id, password_hash, password_salt FROM users WHERE email = $1 LIMIT 1", [email]);

        const user = rows[0];

        // Always run a verification so the response time does not reveal
        // whether the account exists.
        const valid = user
          ? await verifyPassword(password, user.password_hash, user.password_salt)
          : await verifyPassword(password, "00".repeat(64), "decoy");

        if (!user || !valid) {
          return json({ error: "Invalid email or password." }, { status: 401 });
        }

        const token = await createSession(user.id);
        return json({ ok: true }, { headers: { "set-cookie": sessionCookie(token) } });
      }),
    },
  },
});

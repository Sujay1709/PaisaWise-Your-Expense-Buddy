import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import { query } from "@/server/db.server";
import {
  createSession,
  hashPassword,
  json,
  sessionCookie,
} from "@/server/auth.server";
import { clientIp, rateLimit, tooManyRequests } from "@/server/rate-limit.server";

const AVATAR_COLORS = [
  "#e8a838", "#4ade80", "#6366f1", "#f87171",
  "#a78bfa", "#38bdf8", "#fb923c", "#f472b6",
];

function pickColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const Route = createFileRoute("/api/auth/signup")({
  server: {
    handlers: {
      POST: apiRoute(async ({ request }) => {
        // 5 signups per IP per hour — stops scripted account farming.
        const limit = rateLimit(`signup:${clientIp(request)}`, 5, 3_600_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        let body: { email?: unknown; name?: unknown; password?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        const email = String(body.email ?? "").trim().toLowerCase();
        const name = String(body.name ?? "").trim();
        const password = String(body.password ?? "");

        if (!email || !name || !password)
          return json({ error: "All fields are required." }, { status: 400 });
        if (name.length > 80)
          return json({ error: "Name is too long." }, { status: 400 });
        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          return json({ error: "Please enter a valid email." }, { status: 400 });
        if (password.length < 8)
          return json({ error: "Password must be at least 8 characters." }, { status: 400 });
        if (password.length > 200)
          return json({ error: "Password is too long." }, { status: 400 });

        const { hash, salt } = await hashPassword(password);

        let userId: string;
        try {
          const rows = await query<{ id: string }>(
            `INSERT INTO users (email, name, password_hash, password_salt, avatar_color)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [email, name, hash, salt, pickColor(email)],
          );
          userId = rows[0].id;
        } catch (error) {
          // 23505 = unique_violation on users_email_key — the only case we
          // handle here. Everything else (including "database unreachable")
          // is re-thrown so apiRoute can return an accurate, actionable error.
          if ((error as { code?: string }).code === "23505") {
            return json(
              { error: "An account with this email already exists." },
              { status: 409 },
            );
          }
          throw error;
        }

        const token = await createSession(userId);
        return json({ ok: true }, { headers: { "set-cookie": sessionCookie(token) } });
      }),
    },
  },
});

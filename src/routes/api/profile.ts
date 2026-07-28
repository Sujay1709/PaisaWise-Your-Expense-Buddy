import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import { query } from "@/server/db.server";
import {
  SESSION_COOKIE,
  createSession,
  destroyAllSessions,
  hashPassword,
  json,
  requireUser,
  sessionCookie,
  unauthorized,
  verifyPassword,
} from "@/server/auth.server";
import { rateLimit, tooManyRequests } from "@/server/rate-limit.server";

const GENDERS = new Set(["", "male", "female", "non-binary", "prefer-not-to-say"]);

export const Route = createFileRoute("/api/profile")({
  server: {
    handlers: {
      /** Update name / bio / gender. */
      PATCH: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`profile:${user.id}`, 30, 60_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        let body: { name?: unknown; bio?: unknown; gender?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        const name = body.name === undefined ? user.name : String(body.name).trim();
        const bio = body.bio === undefined ? user.bio : String(body.bio);
        const gender = body.gender === undefined ? user.gender : String(body.gender);

        if (!name) return json({ error: "Name cannot be empty." }, { status: 400 });
        if (name.length > 80) return json({ error: "Name is too long." }, { status: 400 });
        if (bio.length > 200) return json({ error: "Bio is too long." }, { status: 400 });
        if (!GENDERS.has(gender))
          return json({ error: "Invalid gender value." }, { status: 400 });

        await query(
          `UPDATE users SET name = $1, bio = $2, gender = $3, updated_at = now()
            WHERE id = $4`,
          [name, bio, gender, user.id],
        );

        return json({ ok: true, user: { ...user, name, bio, gender } });
      }),

      /** Change password. Rotates every session. */
      PUT: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`pwchange:${user.id}`, 5, 900_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        let body: { currentPassword?: unknown; newPassword?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        const currentPassword = String(body.currentPassword ?? "");
        const newPassword = String(body.newPassword ?? "");

        if (newPassword.length < 8)
          return json({ error: "New password must be at least 8 characters." }, { status: 400 });
        if (newPassword.length > 200)
          return json({ error: "Password is too long." }, { status: 400 });

        const rows = await query<{ password_hash: string; password_salt: string }>(
          "SELECT password_hash, password_salt FROM users WHERE id = $1",
          [user.id],
        );
        const record = rows[0];
        if (!record) return unauthorized();

        const valid = await verifyPassword(
          currentPassword,
          record.password_hash,
          record.password_salt,
        );
        if (!valid)
          return json({ error: "Current password is incorrect." }, { status: 403 });

        const { hash, salt } = await hashPassword(newPassword);
        await query(
          `UPDATE users SET password_hash = $1, password_salt = $2, updated_at = now()
            WHERE id = $3`,
          [hash, salt, user.id],
        );

        // Invalidate everything, then re-issue for this device only.
        await destroyAllSessions(user.id);
        const token = await createSession(user.id);

        return json(
          { ok: true },
          { headers: { "set-cookie": sessionCookie(token) } },
        );
      }),

      /** Delete account and all data. */
      DELETE: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        // ON DELETE CASCADE clears sessions, expenses, and chat.
        await query("DELETE FROM users WHERE id = $1", [user.id]);
        return json(
          { ok: true },
          {
            headers: {
              "set-cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
            },
          },
        );
      }),
    },
  },
});

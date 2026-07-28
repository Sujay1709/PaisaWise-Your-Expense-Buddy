import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import { query } from "@/server/db.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";

/**
 * Chat transcript storage.
 *
 * Capped deliberately: chat history is the one table that could balloon
 * without limit (AI replies are long). We keep only the most recent
 * messages and reject oversized payloads, so a user's transcript can
 * never grow past a few hundred KB.
 */
const MAX_MESSAGES = 60;
const MAX_BYTES = 256_000;

export const Route = createFileRoute("/api/chat-history")({
  server: {
    handlers: {
      GET: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const rows = await query<{ messages: unknown }>(
          "SELECT messages FROM user_chats WHERE user_id = $1",
          [user.id],
        );

        return json({ messages: rows[0]?.messages ?? [] });
      }),

      PUT: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const contentLength = request.headers.get("content-length");
        if (contentLength && Number(contentLength) > MAX_BYTES) {
          return json({ error: "Transcript too large." }, { status: 413 });
        }

        let body: { messages?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        if (!Array.isArray(body.messages))
          return json({ error: "messages must be an array." }, { status: 400 });

        // Keep only the newest slice.
        const trimmed = body.messages.slice(-MAX_MESSAGES);
        const serialized = JSON.stringify(trimmed);
        if (serialized.length > MAX_BYTES) {
          return json({ error: "Transcript too large." }, { status: 413 });
        }

        await query(
          `INSERT INTO user_chats (user_id, messages, updated_at)
           VALUES ($1, $2::jsonb, now())
           ON CONFLICT (user_id)
           DO UPDATE SET messages = EXCLUDED.messages, updated_at = now()`,
          [user.id, serialized],
        );

        return json({ ok: true });
      }),

      DELETE: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();
        await query("DELETE FROM user_chats WHERE user_id = $1", [user.id]);
        return json({ ok: true });
      }),
    },
  },
});

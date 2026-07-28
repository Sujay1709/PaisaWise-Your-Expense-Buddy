import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import { query, transaction } from "@/server/db.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";
import { rateLimit, tooManyRequests } from "@/server/rate-limit.server";
import { checkExpenseQuota, quotaResponse } from "@/server/plans.server";

const CATEGORIES = new Set([
  "Food", "Travel", "Education", "Entertainment", "Shopping", "Bills", "Other",
]);

/** Hard cap per request. Bigger imports are chunked by the client. */
const MAX_BATCH = 500;
const MAX_PAGE = 100;

type IncomingEntry = {
  amount?: unknown;
  category?: unknown;
  merchant?: unknown;
  note?: unknown;
  type?: unknown;
};

export const Route = createFileRoute("/api/expenses")({
  server: {
    handlers: {
      /**
       * Keyset pagination — never OFFSET.
       *
       * OFFSET makes page N cost O(N): at 10GB, page 5000 would scan
       * millions of rows. Seeking on (occurred_at, id) uses the index
       * directly, so page 5000 costs exactly what page 1 costs.
       */
      GET: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const url = new URL(request.url);
        const limit = Math.min(
          Math.max(Number(url.searchParams.get("limit") ?? 50), 1),
          MAX_PAGE,
        );
        const cursor = url.searchParams.get("cursor");

        let rows;
        if (cursor) {
          // cursor = "<iso timestamp>|<id>"
          const [ts, id] = cursor.split("|");
          if (!ts || !id) return json({ error: "Bad cursor." }, { status: 400 });
          rows = await query(
            `SELECT id, amount, category, merchant, note, kind, occurred_at
               FROM expenses
              WHERE user_id = $1 AND (occurred_at, id) < ($2::timestamptz, $3::bigint)
              ORDER BY occurred_at DESC, id DESC
              LIMIT $4`,
            [user.id, ts, id, limit],
          );
        } else {
          rows = await query(
            `SELECT id, amount, category, merchant, note, kind, occurred_at
               FROM expenses
              WHERE user_id = $1
              ORDER BY occurred_at DESC, id DESC
              LIMIT $2`,
            [user.id, limit],
          );
        }

        const entries = (rows as Array<{
          id: string;
          amount: string;
          category: string;
          merchant: string | null;
          note: string;
          kind: string;
          occurred_at: Date;
        }>).map((r) => ({
          id: String(r.id),
          amount: Number(r.amount),
          category: r.category,
          merchant: r.merchant,
          note: r.note,
          type: r.kind,
          occurredAt: r.occurred_at.toISOString(),
        }));

        const last = entries[entries.length - 1];
        const nextCursor =
          entries.length === limit && last ? `${last.occurredAt}|${last.id}` : null;

        return json({ entries, nextCursor });
      }),

      /** Bulk insert. One transaction, one parameterised statement. */
      POST: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`expenses:write:${user.id}`, 120, 60_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        const contentLength = request.headers.get("content-length");
        if (contentLength && Number(contentLength) > 512_000) {
          return json({ error: "Payload too large." }, { status: 413 });
        }

        let body: { entries?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        if (!Array.isArray(body.entries))
          return json({ error: "entries must be an array." }, { status: 400 });
        if (body.entries.length === 0) return json({ inserted: 0 });
        if (body.entries.length > MAX_BATCH)
          return json(
            { error: `Send at most ${MAX_BATCH} entries per request.` },
            { status: 400 },
          );

        const clean: {
          amount: number;
          category: string;
          merchant: string | null;
          note: string;
          kind: string;
        }[] = [];

        for (const raw of body.entries as IncomingEntry[]) {
          if (!raw || typeof raw !== "object") continue;
          const amount = Number(raw.amount);
          if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999) continue;

          const category = CATEGORIES.has(String(raw.category))
            ? String(raw.category)
            : "Other";
          const merchantRaw = raw.merchant == null ? null : String(raw.merchant).slice(0, 80);
          const note = String(raw.note ?? "").slice(0, 280);
          const kind = raw.type === "income" ? "income" : "expense";

          clean.push({
            amount: Math.round(amount * 100) / 100,
            category,
            merchant: merchantRaw || null,
            note,
            kind,
          });
        }

        if (clean.length === 0) return json({ inserted: 0 });

        // Free plan caps expenses per calendar month.
        const overQuota = await checkExpenseQuota(user.id, user.plan, clean.length);
        if (overQuota) return quotaResponse(overQuota);

        // Build a single multi-row INSERT with bound parameters.
        const values: unknown[] = [];
        const tuples = clean.map((entry, i) => {
          const base = i * 5;
          values.push(entry.amount, entry.category, entry.merchant, entry.note, entry.kind);
          return `($${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
        });

        // Explicit casts are required: Postgres cannot infer parameter types
        // inside a VALUES-derived table and defaults them all to text, which
        // fails against the numeric `amount` column.
        await transaction(async (client) => {
          await client.query(
            `INSERT INTO expenses (user_id, amount, category, merchant, note, kind)
             SELECT $1::uuid,
                    v.amount::numeric,
                    v.category::text,
                    v.merchant::text,
                    v.note::text,
                    v.kind::text
               FROM (VALUES ${tuples.join(", ")})
                 AS v(amount, category, merchant, note, kind)`,
            [user.id, ...values],
          );
        });

        return json({ inserted: clean.length });
      }),

      /** Clear this user's ledger. */
      DELETE: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`expenses:clear:${user.id}`, 5, 60_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        await query("DELETE FROM expenses WHERE user_id = $1", [user.id]);
        return json({ ok: true });
      }),
    },
  },
});

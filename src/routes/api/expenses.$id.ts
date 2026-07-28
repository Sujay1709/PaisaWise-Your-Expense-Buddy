import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";
import { query } from "@/server/db.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";
import { rateLimit, tooManyRequests } from "@/server/rate-limit.server";

const CATEGORIES = new Set([
  "Food",
  "Travel",
  "Education",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
]);

/** Pulls the trailing path segment: /api/expenses/123 -> "123". */
function expenseIdFrom(request: Request): string {
  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1));
}

/**
 * Single-expense operations.
 *
 * Every statement filters on user_id as well as id, so a user cannot edit
 * or delete another user's row even if they guess the id. Ownership is
 * enforced in the WHERE clause rather than a separate lookup — one query,
 * no race between the check and the write.
 */
export const Route = createFileRoute("/api/expenses/$id")({
  server: {
    handlers: {
      PATCH: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`expense:edit:${user.id}`, 60, 60_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        const id = expenseIdFrom(request);
        if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });

        let body: {
          amount?: unknown;
          category?: unknown;
          merchant?: unknown;
          note?: unknown;
          type?: unknown;
        };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        // Build a partial update — only the fields actually supplied.
        const sets: string[] = [];
        const values: unknown[] = [];

        if (body.amount !== undefined) {
          const amount = Number(body.amount);
          if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999) {
            return json({ error: "Amount must be between 1 and 99,999,999." }, { status: 400 });
          }
          values.push(Math.round(amount * 100) / 100);
          sets.push(`amount = $${values.length}`);
        }

        if (body.category !== undefined) {
          const category = String(body.category);
          if (!CATEGORIES.has(category)) {
            return json({ error: "Unknown category." }, { status: 400 });
          }
          values.push(category);
          sets.push(`category = $${values.length}`);
        }

        if (body.merchant !== undefined) {
          const merchant = body.merchant === null ? null : String(body.merchant).slice(0, 80);
          values.push(merchant || null);
          sets.push(`merchant = $${values.length}`);
        }

        if (body.note !== undefined) {
          values.push(String(body.note).slice(0, 280));
          sets.push(`note = $${values.length}`);
        }

        if (body.type !== undefined) {
          const kind = body.type === "income" ? "income" : "expense";
          values.push(kind);
          sets.push(`kind = $${values.length}`);
        }

        if (sets.length === 0) return json({ error: "Nothing to update." }, { status: 400 });

        values.push(id, user.id);
        const rows = await query<{ id: string }>(
          `UPDATE expenses SET ${sets.join(", ")}
            WHERE id = $${values.length - 1}::bigint AND user_id = $${values.length}::uuid
            RETURNING id`,
          values,
        );

        if (rows.length === 0) return json({ error: "Expense not found." }, { status: 404 });
        return json({ ok: true });
      }),

      DELETE: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`expense:del:${user.id}`, 60, 60_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        const id = expenseIdFrom(request);
        if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });

        const rows = await query<{ id: string }>(
          `DELETE FROM expenses
            WHERE id = $1::bigint AND user_id = $2::uuid
            RETURNING id`,
          [id, user.id],
        );

        if (rows.length === 0) return json({ error: "Expense not found." }, { status: 404 });
        return json({ ok: true });
      }),
    },
  },
});

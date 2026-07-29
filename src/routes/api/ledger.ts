import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";
import { rateLimit, tooManyRequests } from "@/server/rate-limit.server";
import {
  CADENCES,
  createAccount,
  createCategory,
  deleteBudget,
  deleteCategory,
  listAccounts,
  listBudgets,
  listCategories,
  listRecurring,
  ownedAccountId,
  runDueRecurring,
  seedDefaults,
  setBudget,
} from "@/server/ledger.server";
import { query } from "@/server/db.server";

/**
 * Combined endpoint for accounts, categories, budgets and recurring rules.
 *
 * One route rather than four keeps the initial page load to a single request —
 * the sidebar needs all of it at once, and on a cold Render instance every
 * saved round trip is noticeable.
 */
export const Route = createFileRoute("/api/ledger")({
  server: {
    handlers: {
      GET: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        // Lazily seed: covers accounts created before this feature shipped.
        const existing = await listCategories(user.id);
        if (existing.length === 0) await seedDefaults(user.id);

        // Catch up anything due while the user was away.
        const materialised = await runDueRecurring(user.id);

        const [accounts, categories, budgets, recurring] = await Promise.all([
          listAccounts(user.id),
          listCategories(user.id),
          listBudgets(user.id),
          listRecurring(user.id),
        ]);

        return json({ accounts, categories, budgets, recurring, materialised });
      }),

      POST: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`ledger:write:${user.id}`, 60, 60_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        const action = String(body.action ?? "");

        switch (action) {
          case "createAccount": {
            const result = await createAccount(
              user.id,
              String(body.name ?? ""),
              String(body.kind ?? "cash"),
              String(body.color ?? "#e8a838"),
            );
            if (!result.ok) return json({ error: result.error }, { status: 400 });
            return json({ ok: true, id: result.id });
          }

          case "archiveAccount": {
            const id = await ownedAccountId(user.id, body.id);
            if (!id) return json({ error: "Account not found." }, { status: 404 });
            await query("UPDATE accounts SET archived = NOT archived WHERE id = $1::bigint", [id]);
            return json({ ok: true });
          }

          case "createCategory": {
            const result = await createCategory(
              user.id,
              String(body.name ?? ""),
              String(body.emoji ?? "📦"),
              String(body.color ?? "#e8a838"),
            );
            if (!result.ok) return json({ error: result.error }, { status: 400 });
            return json({ ok: true, id: result.id });
          }

          case "deleteCategory": {
            const id = String(body.id ?? "");
            if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });
            const result = await deleteCategory(user.id, id);
            if (!result.ok) return json({ error: result.error }, { status: 400 });
            return json({ ok: true });
          }

          case "setBudget": {
            const amount = Number(body.amount);
            const category = String(body.category ?? "").trim();
            if (!category) return json({ error: "Pick a category." }, { status: 400 });
            if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999) {
              return json({ error: "Enter a valid budget amount." }, { status: 400 });
            }
            await setBudget(user.id, category, Math.round(amount * 100) / 100);
            return json({ ok: true });
          }

          case "deleteBudget": {
            await deleteBudget(user.id, String(body.category ?? ""));
            return json({ ok: true });
          }

          case "createRecurring": {
            const amount = Number(body.amount);
            const cadence = String(body.cadence ?? "monthly");
            const category = String(body.category ?? "Other").slice(0, 30);

            if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999) {
              return json({ error: "Enter a valid amount." }, { status: 400 });
            }
            if (!CADENCES.has(cadence)) {
              return json({ error: "Cadence must be daily, weekly or monthly." }, { status: 400 });
            }

            const accountId = await ownedAccountId(user.id, body.accountId);
            // Start tomorrow so creating a rule never immediately double-posts
            // something the user just logged by hand.
            const start = new Date();
            start.setDate(start.getDate() + 1);

            await query(
              `INSERT INTO recurring
                 (user_id, amount, category, merchant, note, kind, account_id, cadence, next_run)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
              [
                user.id,
                Math.round(amount * 100) / 100,
                category,
                String(body.merchant ?? "").slice(0, 80) || null,
                String(body.note ?? "").slice(0, 280),
                body.type === "income" ? "income" : "expense",
                accountId,
                cadence,
                start.toISOString().slice(0, 10),
              ],
            );
            return json({ ok: true });
          }

          case "toggleRecurring": {
            const id = String(body.id ?? "");
            if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });
            const rows = await query<{ id: string }>(
              `UPDATE recurring SET active = NOT active
                WHERE id = $1::bigint AND user_id = $2::uuid RETURNING id`,
              [id, user.id],
            );
            if (rows.length === 0) return json({ error: "Not found." }, { status: 404 });
            return json({ ok: true });
          }

          case "deleteRecurring": {
            const id = String(body.id ?? "");
            if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });
            await query("DELETE FROM recurring WHERE id = $1::bigint AND user_id = $2::uuid", [
              id,
              user.id,
            ]);
            return json({ ok: true });
          }

          default:
            return json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
      }),
    },
  },
});

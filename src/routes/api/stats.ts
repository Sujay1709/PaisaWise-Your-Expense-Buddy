import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import { query } from "@/server/db.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";

/**
 * Dashboard aggregates.
 *
 * This is the route that makes 10GB survivable. The browser never receives
 * raw rows — Postgres does the SUM/GROUP BY against the
 * (user_id, occurred_at) index and returns at most 7 rows plus 4 scalars.
 * Response size is constant no matter how many expenses the user has.
 */
export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const [totalsRows, categoryRows] = await Promise.all([
          query<{
            total_spent: string | null;
            week_spent: string | null;
            month_spent: string | null;
            total_income: string | null;
            expense_count: string;
          }>(
            `SELECT
               COALESCE(SUM(amount) FILTER (WHERE kind = 'expense'), 0)::text AS total_spent,
               COALESCE(SUM(amount) FILTER (WHERE kind = 'expense'
                 AND occurred_at >= now() - interval '7 days'), 0)::text AS week_spent,
               COALESCE(SUM(amount) FILTER (WHERE kind = 'expense'
                 AND occurred_at >= date_trunc('month', now())), 0)::text AS month_spent,
               COALESCE(SUM(amount) FILTER (WHERE kind = 'income'), 0)::text AS total_income,
               COUNT(*) FILTER (WHERE kind = 'expense')::text AS expense_count
             FROM expenses
             WHERE user_id = $1`,
            [user.id],
          ),
          query<{ category: string; amount: string }>(
            `SELECT category, SUM(amount)::text AS amount
               FROM expenses
              WHERE user_id = $1 AND kind = 'expense'
              GROUP BY category
              ORDER BY SUM(amount) DESC`,
            [user.id],
          ),
        ]);

        const totals = totalsRows[0];
        const totalSpent = Number(totals?.total_spent ?? 0);

        const byCategory = categoryRows.map((row) => {
          const amount = Number(row.amount);
          return {
            category: row.category,
            amount,
            pct: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
          };
        });

        return json({
          totalSpent,
          weekSpent: Number(totals?.week_spent ?? 0),
          monthSpent: Number(totals?.month_spent ?? 0),
          totalIncome: Number(totals?.total_income ?? 0),
          expenseCount: Number(totals?.expense_count ?? 0),
          byCategory,
        });
      }),
    },
  },
});

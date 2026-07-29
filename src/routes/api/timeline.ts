import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";
import { query } from "@/server/db.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";

/**
 * Timeline: spend bucketed by day, for one of four ranges.
 *
 * Uses `generate_series` for the x-axis so days with no spend still appear as
 * zero bars — a jagged missing-day chart would misread as "you spent nothing
 * that day was a good day" when it just means no data.
 *
 * All aggregation is in SQL. Response size is bounded by `days`, not by the
 * expense table, so a user with 5 million expenses gets the same payload as
 * a user with 5.
 */
const RANGES = {
  day: 1,
  "5day": 5,
  week: 7,
  month: 30,
} as const;

type RangeId = keyof typeof RANGES;

function parseRange(value: string | null): RangeId {
  return value && value in RANGES ? (value as RangeId) : "week";
}

export const Route = createFileRoute("/api/timeline")({
  server: {
    handlers: {
      GET: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const url = new URL(request.url);
        const range = parseRange(url.searchParams.get("range"));
        const days = RANGES[range];

        // date_trunc('day', ...) buckets into the user's local day when the
        // Postgres session TZ matches. Neon defaults to UTC, which is close
        // enough for a demo; a real product would pass the user's TZ here.
        const [buckets, byCategory, [totals]] = await Promise.all([
          query<{ day: Date; amount: string }>(
            `WITH series AS (
               SELECT generate_series(
                 date_trunc('day', now()) - ($1::int - 1) * interval '1 day',
                 date_trunc('day', now()),
                 interval '1 day'
               )::date AS day
             )
             SELECT s.day,
                    COALESCE(SUM(e.amount) FILTER (WHERE e.kind = 'expense'), 0)::text AS amount
               FROM series s
               LEFT JOIN expenses e
                 ON e.user_id = $2
                AND e.occurred_at >= s.day
                AND e.occurred_at <  s.day + interval '1 day'
              GROUP BY s.day
              ORDER BY s.day`,
            [days, user.id],
          ),

          query<{ category: string; amount: string }>(
            `SELECT category, SUM(amount)::text AS amount
               FROM expenses
              WHERE user_id = $1
                AND kind = 'expense'
                AND occurred_at >= date_trunc('day', now()) - ($2::int - 1) * interval '1 day'
              GROUP BY category
              ORDER BY SUM(amount) DESC`,
            [user.id, days],
          ),

          query<{
            total: string;
            income: string;
            count: string;
            avg_day: string;
            peak_day: Date | null;
            peak: string;
          }>(
            `WITH daily AS (
               SELECT date_trunc('day', occurred_at) AS day,
                      SUM(amount) FILTER (WHERE kind = 'expense') AS spent
                 FROM expenses
                WHERE user_id = $1
                  AND occurred_at >= date_trunc('day', now()) - ($2::int - 1) * interval '1 day'
                GROUP BY 1
             )
             SELECT
               COALESCE((SELECT SUM(amount)::text FROM expenses
                          WHERE user_id = $1 AND kind = 'expense'
                            AND occurred_at >= date_trunc('day', now()) - ($2::int - 1) * interval '1 day'), '0') AS total,
               COALESCE((SELECT SUM(amount)::text FROM expenses
                          WHERE user_id = $1 AND kind = 'income'
                            AND occurred_at >= date_trunc('day', now()) - ($2::int - 1) * interval '1 day'), '0') AS income,
               COALESCE((SELECT count(*)::text FROM expenses
                          WHERE user_id = $1 AND kind = 'expense'
                            AND occurred_at >= date_trunc('day', now()) - ($2::int - 1) * interval '1 day'), '0') AS count,
               COALESCE((SELECT AVG(spent)::text FROM daily WHERE spent IS NOT NULL), '0') AS avg_day,
               (SELECT day FROM daily WHERE spent IS NOT NULL ORDER BY spent DESC LIMIT 1) AS peak_day,
               COALESCE((SELECT MAX(spent)::text FROM daily), '0') AS peak`,
            [user.id, days],
          ),
        ]);

        const total = Number(totals?.total ?? 0);

        return json({
          range,
          days,
          total,
          income: Number(totals?.income ?? 0),
          count: Number(totals?.count ?? 0),
          avgPerDay: Number(totals?.avg_day ?? 0),
          peakAmount: Number(totals?.peak ?? 0),
          peakDay: totals?.peak_day ? new Date(totals.peak_day).toISOString() : null,
          buckets: buckets.map((b) => ({
            date: new Date(b.day).toISOString(),
            amount: Number(b.amount),
          })),
          byCategory: byCategory.map((c) => {
            const amount = Number(c.amount);
            return {
              category: c.category,
              amount,
              pct: total > 0 ? Math.round((amount / total) * 100) : 0,
            };
          }),
        });
      }),
    },
  },
});

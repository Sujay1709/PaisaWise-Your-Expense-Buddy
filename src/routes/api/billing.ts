import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";
import { query } from "@/server/db.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";
import { rateLimit, tooManyRequests } from "@/server/rate-limit.server";
import { PLANS, getUsage } from "@/server/plans.server";

/**
 * Plans, current usage, and plan switching.
 *
 * IMPORTANT — no real payments happen here.
 *
 * Accepting money in India requires a payment gateway (Razorpay/Stripe), a
 * registered business entity, KYC, and GST registration. None of that exists
 * for this project, so `POST` switches the plan directly and is gated behind
 * ALLOW_DEMO_UPGRADE.
 *
 * What this demonstrates is the part that actually matters architecturally:
 * plan state, metered usage, and quota enforcement at the API boundary. Wiring
 * a gateway later means replacing this one handler with a webhook that sets the
 * same column — nothing else in the codebase changes.
 */
export const Route = createFileRoute("/api/billing")({
  server: {
    handlers: {
      GET: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const usage = await getUsage(user.id, user.plan);

        return json({
          plan: user.plan,
          plans: PLANS,
          usage: {
            expensesThisMonth: usage.expensesThisMonth,
            aiChatsToday: usage.aiChatsToday,
            receiptScansThisMonth: usage.receiptScansThisMonth,
          },
          limits: usage.limits,
          demoMode: process.env.ALLOW_DEMO_UPGRADE === "true",
        });
      }),

      POST: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        const limit = rateLimit(`billing:${user.id}`, 10, 3_600_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        if (process.env.ALLOW_DEMO_UPGRADE !== "true") {
          return json(
            {
              error: "Billing is not enabled.",
              hint:
                "This deployment has no payment provider configured. Set " +
                "ALLOW_DEMO_UPGRADE=true to allow plan switching for demos.",
            },
            { status: 501 },
          );
        }

        let body: { plan?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        const plan = body.plan === "pro" ? "pro" : "free";

        await query(
          `UPDATE users
              SET plan = $1,
                  plan_since = CASE WHEN $1 = 'pro' THEN now() ELSE NULL END,
                  updated_at = now()
            WHERE id = $2`,
          [plan, user.id],
        );

        return json({ ok: true, plan, demo: true });
      }),
    },
  },
});

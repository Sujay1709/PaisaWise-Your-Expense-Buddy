/**
 * Freemium plan definitions and quota enforcement.
 *
 * Two plans. Limits are chosen so the free tier is genuinely usable for a
 * student logging a few expenses a day, while the metered costs — AI calls and
 * receipt vision — stay bounded, since those are the only operations that cost
 * real money per use.
 */

import { query } from "./db.server";

export type PlanId = "free" | "pro";

export type PlanLimits = {
  /** Expenses per calendar month. null = unlimited. */
  expensesPerMonth: number | null;
  /** AI chat messages per day. null = unlimited. */
  aiChatsPerDay: number | null;
  /** Receipt scans per calendar month. null = unlimited. */
  receiptScansPerMonth: number | null;
  /** Monthly AI insights report. */
  monthlyInsights: boolean;
  /** Retain and query history older than this many days. null = forever. */
  historyDays: number | null;
};

export const PLANS: Record<PlanId, { name: string; price: string; limits: PlanLimits }> = {
  free: {
    name: "Free",
    price: "₹0",
    limits: {
      expensesPerMonth: 50,
      aiChatsPerDay: 5,
      receiptScansPerMonth: 3,
      monthlyInsights: false,
      historyDays: 90,
    },
  },
  pro: {
    name: "Pro",
    price: "₹99/month",
    limits: {
      expensesPerMonth: null,
      aiChatsPerDay: null,
      receiptScansPerMonth: null,
      monthlyInsights: true,
      historyDays: null,
    },
  },
};

export function planOf(value: unknown): PlanId {
  return value === "pro" ? "pro" : "free";
}

export function limitsFor(plan: PlanId): PlanLimits {
  return PLANS[plan].limits;
}

// ─── Usage counting ─────────────────────────────────────────────

export type UsageSnapshot = {
  plan: PlanId;
  expensesThisMonth: number;
  aiChatsToday: number;
  receiptScansThisMonth: number;
  limits: PlanLimits;
};

/**
 * Current usage for a user.
 *
 * Expense count comes from the expenses table (already indexed on
 * user_id, occurred_at) rather than a duplicate counter, so it cannot drift
 * out of sync with reality when rows are deleted.
 */
export async function getUsage(userId: string, plan: PlanId): Promise<UsageSnapshot> {
  const [expenseRows, usageRows] = await Promise.all([
    query<{ n: string }>(
      `SELECT count(*)::text AS n
         FROM expenses
        WHERE user_id = $1
          AND kind = 'expense'
          AND occurred_at >= date_trunc('month', now())`,
      [userId],
    ),
    query<{ kind: string; n: string }>(
      `SELECT kind, count(*)::text AS n
         FROM usage_events
        WHERE user_id = $1
          AND (
            (kind = 'ai_chat'      AND occurred_at >= date_trunc('day', now()))
         OR (kind = 'receipt_scan' AND occurred_at >= date_trunc('month', now()))
          )
        GROUP BY kind`,
      [userId],
    ),
  ]);

  const byKind = new Map(usageRows.map((row) => [row.kind, Number(row.n)]));

  return {
    plan,
    expensesThisMonth: Number(expenseRows[0]?.n ?? 0),
    aiChatsToday: byKind.get("ai_chat") ?? 0,
    receiptScansThisMonth: byKind.get("receipt_scan") ?? 0,
    limits: limitsFor(plan),
  };
}

export async function recordUsage(userId: string, kind: "ai_chat" | "receipt_scan") {
  await query("INSERT INTO usage_events (user_id, kind) VALUES ($1, $2)", [
    userId,
    kind,
  ]);
}

// ─── Quota checks ───────────────────────────────────────────────

export type QuotaDenial = {
  error: string;
  hint: string;
  limit: number;
  used: number;
  upgradeTo: "pro";
};

function denial(
  what: string,
  used: number,
  limit: number,
  period: string,
): QuotaDenial {
  return {
    error: `You've used all ${limit} ${what} on the Free plan this ${period}.`,
    hint: "Upgrade to Pro for unlimited usage, or wait for the next period.",
    limit,
    used,
    upgradeTo: "pro",
  };
}

export async function checkExpenseQuota(
  userId: string,
  plan: PlanId,
  adding: number,
): Promise<QuotaDenial | null> {
  const limit = limitsFor(plan).expensesPerMonth;
  if (limit === null) return null;

  const usage = await getUsage(userId, plan);
  if (usage.expensesThisMonth + adding > limit) {
    return denial("expenses", usage.expensesThisMonth, limit, "month");
  }
  return null;
}

export async function checkAiQuota(
  userId: string,
  plan: PlanId,
): Promise<QuotaDenial | null> {
  const limit = limitsFor(plan).aiChatsPerDay;
  if (limit === null) return null;

  const usage = await getUsage(userId, plan);
  if (usage.aiChatsToday >= limit) {
    return denial("AI messages", usage.aiChatsToday, limit, "day");
  }
  return null;
}

export async function checkReceiptQuota(
  userId: string,
  plan: PlanId,
): Promise<QuotaDenial | null> {
  const limit = limitsFor(plan).receiptScansPerMonth;
  if (limit === null) return null;

  const usage = await getUsage(userId, plan);
  if (usage.receiptScansThisMonth >= limit) {
    return denial("receipt scans", usage.receiptScansThisMonth, limit, "month");
  }
  return null;
}

/** 402 Payment Required — the semantically correct status for a quota block. */
export function quotaResponse(denialInfo: QuotaDenial): Response {
  return new Response(JSON.stringify(denialInfo), {
    status: 402,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

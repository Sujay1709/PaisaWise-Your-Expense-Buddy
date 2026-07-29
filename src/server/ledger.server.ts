/**
 * Accounts, custom categories, budgets, and recurring transactions.
 *
 * Design notes borrowed conceptually (not in code) from mature expense
 * managers: money needs a *source* (account), categories should be the
 * user's own, budgets should warn before overspend rather than after, and
 * fixed costs should log themselves.
 */

import { query, transaction } from "./db.server";

// ─── Defaults ───────────────────────────────────────────────────

export const DEFAULT_CATEGORIES = [
  { name: "Food", emoji: "🍕", color: "#e8a838" },
  { name: "Travel", emoji: "🚗", color: "#4ade80" },
  { name: "Education", emoji: "📚", color: "#6366f1" },
  { name: "Entertainment", emoji: "🎬", color: "#f87171" },
  { name: "Shopping", emoji: "🛍️", color: "#a78bfa" },
  { name: "Bills", emoji: "📱", color: "#38bdf8" },
  { name: "Other", emoji: "📦", color: "#fb923c" },
] as const;

export const DEFAULT_ACCOUNTS = [
  { name: "Cash", kind: "cash", color: "#4ade80" },
  { name: "Bank", kind: "bank", color: "#6366f1" },
  { name: "UPI", kind: "upi", color: "#e8a838" },
] as const;

export const ACCOUNT_KINDS = new Set(["cash", "bank", "upi", "card", "wallet"]);

/**
 * Creates the starter accounts and categories for a new user.
 *
 * ON CONFLICT DO NOTHING makes this safe to call more than once, so it can
 * also act as a lazy backfill for accounts created before this feature.
 */
export async function seedDefaults(userId: string): Promise<void> {
  await transaction(async (client) => {
    for (const c of DEFAULT_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (user_id, name, emoji, color, is_default)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT DO NOTHING`,
        [userId, c.name, c.emoji, c.color],
      );
    }
    for (const a of DEFAULT_ACCOUNTS) {
      await client.query(
        `INSERT INTO accounts (user_id, name, kind, color)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [userId, a.name, a.kind, a.color],
      );
    }
  });
}

// ─── Accounts ───────────────────────────────────────────────────

export type Account = {
  id: string;
  name: string;
  kind: string;
  color: string;
  archived: boolean;
  balance: number;
  txCount: number;
};

/**
 * Accounts with their running balance.
 *
 * Balance is computed as income minus expenses in SQL rather than stored,
 * so it can never drift from the transactions it summarises.
 */
export async function listAccounts(userId: string): Promise<Account[]> {
  const rows = await query<{
    id: string;
    name: string;
    kind: string;
    color: string;
    archived: boolean;
    balance: string;
    tx_count: string;
  }>(
    `SELECT a.id, a.name, a.kind, a.color, a.archived,
            COALESCE(SUM(
              CASE WHEN e.kind = 'income' THEN e.amount ELSE -e.amount END
            ), 0)::text AS balance,
            COUNT(e.id)::text AS tx_count
       FROM accounts a
       LEFT JOIN expenses e ON e.account_id = a.id AND e.user_id = a.user_id
      WHERE a.user_id = $1
      GROUP BY a.id
      ORDER BY a.archived, a.created_at`,
    [userId],
  );

  return rows.map((r) => ({
    id: String(r.id),
    name: r.name,
    kind: r.kind,
    color: r.color,
    archived: r.archived,
    balance: Number(r.balance),
    txCount: Number(r.tx_count),
  }));
}

export async function createAccount(
  userId: string,
  name: string,
  kind: string,
  color: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const cleanName = name.trim().slice(0, 40);
  if (!cleanName) return { ok: false, error: "Account needs a name." };
  if (!ACCOUNT_KINDS.has(kind)) return { ok: false, error: "Unknown account type." };

  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO accounts (user_id, name, kind, color)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, cleanName, kind, color],
    );
    return { ok: true, id: String(rows[0].id) };
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: "You already have an account with that name." };
    }
    throw error;
  }
}

/** Verifies an account belongs to the user. Returns null if not. */
export async function ownedAccountId(userId: string, accountId: unknown): Promise<string | null> {
  if (accountId === undefined || accountId === null || accountId === "") return null;
  const id = String(accountId);
  if (!/^\d+$/.test(id)) return null;

  const rows = await query<{ id: string }>(
    "SELECT id FROM accounts WHERE id = $1::bigint AND user_id = $2::uuid",
    [id, userId],
  );
  return rows[0] ? String(rows[0].id) : null;
}

// ─── Categories ─────────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isDefault: boolean;
};

export async function listCategories(userId: string): Promise<Category[]> {
  const rows = await query<{
    id: string;
    name: string;
    emoji: string;
    color: string;
    is_default: boolean;
  }>(
    `SELECT id, name, emoji, color, is_default
       FROM categories WHERE user_id = $1
      ORDER BY is_default DESC, name`,
    [userId],
  );

  return rows.map((r) => ({
    id: String(r.id),
    name: r.name,
    emoji: r.emoji,
    color: r.color,
    isDefault: r.is_default,
  }));
}

export async function createCategory(
  userId: string,
  name: string,
  emoji: string,
  color: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const cleanName = name.trim().slice(0, 30);
  if (!cleanName) return { ok: false, error: "Category needs a name." };

  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO categories (user_id, name, emoji, color)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      // Emoji can be multi-codepoint; slice generously rather than by 1.
      [userId, cleanName, emoji.slice(0, 8) || "📦", color],
    );
    return { ok: true, id: String(rows[0].id) };
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: "That category already exists." };
    }
    throw error;
  }
}

/**
 * Deletes a custom category. Past expenses keep their category text, so
 * history is never rewritten by a rename or delete.
 */
export async function deleteCategory(
  userId: string,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const rows = await query<{ is_default: boolean }>(
    "SELECT is_default FROM categories WHERE id = $1::bigint AND user_id = $2::uuid",
    [id, userId],
  );
  if (!rows[0]) return { ok: false, error: "Category not found." };
  if (rows[0].is_default) {
    return { ok: false, error: "Built-in categories cannot be deleted." };
  }

  await query("DELETE FROM categories WHERE id = $1::bigint AND user_id = $2::uuid", [id, userId]);
  return { ok: true };
}

// ─── Budgets ────────────────────────────────────────────────────

export type BudgetRow = {
  category: string;
  budget: number;
  spent: number;
  pct: number;
  remaining: number;
  over: boolean;
};

/**
 * Budgets joined to this month's spend, aggregated in SQL.
 *
 * LEFT JOIN LATERAL keeps it to one round trip and one row per budget,
 * regardless of how many expenses exist.
 */
export async function listBudgets(userId: string): Promise<BudgetRow[]> {
  const rows = await query<{ category: string; amount: string; spent: string }>(
    `SELECT b.category,
            b.amount::text AS amount,
            COALESCE(s.spent, 0)::text AS spent
       FROM budgets b
       LEFT JOIN LATERAL (
         SELECT SUM(e.amount) AS spent
           FROM expenses e
          WHERE e.user_id = b.user_id
            AND e.kind = 'expense'
            AND lower(e.category) = lower(b.category)
            AND e.occurred_at >= date_trunc('month', now())
       ) s ON true
      WHERE b.user_id = $1
      ORDER BY b.category`,
    [userId],
  );

  return rows.map((r) => {
    const budget = Number(r.amount);
    const spent = Number(r.spent);
    return {
      category: r.category,
      budget,
      spent,
      pct: budget > 0 ? Math.round((spent / budget) * 100) : 0,
      remaining: Math.max(0, budget - spent),
      over: spent > budget,
    };
  });
}

export async function setBudget(userId: string, category: string, amount: number): Promise<void> {
  await query(
    `INSERT INTO budgets (user_id, category, amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, lower(category))
     DO UPDATE SET amount = EXCLUDED.amount, updated_at = now()`,
    [userId, category.trim().slice(0, 30), amount],
  );
}

export async function deleteBudget(userId: string, category: string): Promise<void> {
  await query("DELETE FROM budgets WHERE user_id = $1 AND lower(category) = lower($2)", [
    userId,
    category,
  ]);
}

// ─── Recurring ──────────────────────────────────────────────────

export type Recurring = {
  id: string;
  amount: number;
  category: string;
  merchant: string | null;
  note: string;
  type: string;
  cadence: string;
  nextRun: string;
  active: boolean;
  accountId: string | null;
};

export const CADENCES = new Set(["daily", "weekly", "monthly"]);

export async function listRecurring(userId: string): Promise<Recurring[]> {
  const rows = await query<{
    id: string;
    amount: string;
    category: string;
    merchant: string | null;
    note: string;
    kind: string;
    cadence: string;
    next_run: Date;
    active: boolean;
    account_id: string | null;
  }>(
    `SELECT id, amount, category, merchant, note, kind, cadence,
            next_run, active, account_id
       FROM recurring WHERE user_id = $1
      ORDER BY active DESC, next_run`,
    [userId],
  );

  return rows.map((r) => ({
    id: String(r.id),
    amount: Number(r.amount),
    category: r.category,
    merchant: r.merchant,
    note: r.note,
    type: r.kind,
    cadence: r.cadence,
    nextRun: new Date(r.next_run).toISOString().slice(0, 10),
    active: r.active,
    accountId: r.account_id ? String(r.account_id) : null,
  }));
}

/**
 * Materialises every recurring transaction that is due.
 *
 * Render's free tier has no cron, so instead of a scheduler this runs when
 * the user opens the app and catches up anything missed while they were away.
 *
 * Idempotency comes from the WHERE clause: a row is only picked up while
 * next_run <= today, and the same statement advances next_run past today.
 * Two concurrent requests cannot double-post because the UPDATE ... RETURNING
 * locks the row, and the second sees the already-advanced date.
 *
 * The loop is bounded so a rule left dormant for years cannot generate
 * thousands of rows in one request.
 */
export async function runDueRecurring(userId: string): Promise<number> {
  const MAX_CATCHUP_PER_RULE = 12;
  let created = 0;

  await transaction(async (client) => {
    const { rows: due } = await client.query(
      `SELECT id, amount, category, merchant, note, kind, cadence, next_run, account_id
         FROM recurring
        WHERE user_id = $1 AND active AND next_run <= CURRENT_DATE
        FOR UPDATE SKIP LOCKED`,
      [userId],
    );

    for (const rule of due) {
      let cursor = new Date(rule.next_run);
      let guard = 0;

      while (cursor <= new Date() && guard < MAX_CATCHUP_PER_RULE) {
        await client.query(
          `INSERT INTO expenses
             (user_id, amount, category, merchant, note, kind, account_id, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userId,
            rule.amount,
            rule.category,
            rule.merchant,
            rule.note,
            rule.kind,
            rule.account_id,
            cursor,
          ],
        );
        created += 1;
        guard += 1;

        const next = new Date(cursor);
        if (rule.cadence === "daily") next.setDate(next.getDate() + 1);
        else if (rule.cadence === "weekly") next.setDate(next.getDate() + 7);
        else next.setMonth(next.getMonth() + 1);
        cursor = next;
      }

      await client.query(
        "UPDATE recurring SET next_run = $1, last_run = CURRENT_DATE WHERE id = $2",
        [cursor.toISOString().slice(0, 10), rule.id],
      );
    }
  });

  return created;
}

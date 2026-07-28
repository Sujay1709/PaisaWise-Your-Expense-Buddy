/**
 * PaisaWise shared types, constants, and parsing utilities.
 *
 * Data persistence has moved to db.ts (IndexedDB).
 * This file is kept for types, category constants, and the ledger-block parser.
 */

export const PW_CATEGORIES = [
  "Food",
  "Travel",
  "Education",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type PwCategory = (typeof PW_CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<PwCategory, string> = {
  Food: "🍕",
  Travel: "🚗",
  Education: "📚",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Bills: "📱",
  Other: "📦",
};

export type LedgerEntry = {
  amount: number;
  category: PwCategory;
  merchant: string | null;
  note: string;
  type: "expense" | "income";
  ts: number;
};

export const LEDGER_BLOCK_REGEX = /<!--\s*PAISAWISE[\s\S]*?-->/g;

/** Removes the hidden machine-readable ledger block from assistant text. */
export function stripLedgerBlock(text: string): string {
  return text.replace(LEDGER_BLOCK_REGEX, "").trimEnd();
}

function isCategory(value: unknown): value is PwCategory {
  return typeof value === "string" && (PW_CATEGORIES as readonly string[]).includes(value);
}

/** Parses the hidden ledger block out of an assistant message's text. */
export function parseLedgerEntries(text: string): Omit<LedgerEntry, "ts">[] {
  const matches = text.match(LEDGER_BLOCK_REGEX);
  if (!matches) return [];

  const out: Omit<LedgerEntry, "ts">[] = [];
  for (const raw of matches) {
    const json = raw
      .replace(/^<!--\s*PAISAWISE/, "")
      .replace(/-->$/, "")
      .trim();
    try {
      const parsed = JSON.parse(json) as { entries?: unknown };
      if (!Array.isArray(parsed.entries)) continue;
      for (const item of parsed.entries) {
        if (!item || typeof item !== "object") continue;
        const entry = item as Record<string, unknown>;
        const amount =
          typeof entry.amount === "number" && Number.isFinite(entry.amount)
            ? entry.amount
            : 0;
        if (amount <= 0) continue;
        out.push({
          amount,
          category: isCategory(entry.category) ? entry.category : "Other",
          merchant:
            typeof entry.merchant === "string" && entry.merchant.trim()
              ? entry.merchant
              : null,
          note: typeof entry.note === "string" ? entry.note : "",
          type: entry.type === "income" ? "income" : "expense",
        });
      }
    } catch {
      // Malformed block — ignore rather than break the chat.
    }
  }
  return out;
}

// Aggregation now happens in SQL — see /api/stats. Computing totals in the
// browser would require downloading every row, which does not survive scale.

export function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

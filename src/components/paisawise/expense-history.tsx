import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteExpense, listExpenses, updateExpense, type ExpenseEntry } from "@/lib/api";
import {
  CATEGORY_EMOJI,
  formatRupees,
  PW_CATEGORIES,
  type PwCategory,
} from "@/lib/paisawise-store";

function emojiFor(category: string) {
  return CATEGORY_EMOJI[category as PwCategory] ?? "📦";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function ExpenseHistory({ onChanged }: { onChanged: () => void }) {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listExpenses(undefined, 25);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setEntries(result.data.entries);
    setCursor(result.data.nextCursor);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const result = await listExpenses(cursor, 25);
    setLoadingMore(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    // Append — keyset pagination guarantees no overlap with what we have.
    setEntries((current) => [...current, ...result.data.entries]);
    setCursor(result.data.nextCursor);
  }, [cursor, loadingMore]);

  const handleDelete = useCallback(
    async (id: string) => {
      setBusyId(id);
      const result = await deleteExpense(id);
      setBusyId(null);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEntries((current) => current.filter((e) => e.id !== id));
      onChanged();
      toast.success("Deleted.");
    },
    [onChanged],
  );

  const handleSave = useCallback(
    async (id: string, patch: Partial<ExpenseEntry>) => {
      setBusyId(id);
      const result = await updateExpense(id, patch);
      setBusyId(null);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEntries((current) => current.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      setEditingId(null);
      onChanged();
      toast.success("Updated.");
    },
    [onChanged],
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        No expenses yet. Type one in the chat or scan a receipt.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) =>
        editingId === entry.id ? (
          <EditRow
            key={entry.id}
            entry={entry}
            busy={busyId === entry.id}
            onCancel={() => setEditingId(null)}
            onSave={(patch) => handleSave(entry.id, patch)}
          />
        ) : (
          <div
            key={entry.id}
            className="group flex items-center gap-2 rounded-xl border bg-background px-3 py-2"
          >
            <span className="text-sm" aria-hidden>
              {emojiFor(entry.category)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {entry.merchant || entry.note || entry.category}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.category} · {formatDate(entry.occurredAt)}
                {entry.merchant && entry.note ? ` · ${entry.note}` : ""}
              </p>
            </div>

            <span
              className={`shrink-0 text-sm font-semibold tabular-nums ${
                entry.type === "income" ? "text-mint" : ""
              }`}
            >
              {entry.type === "income" ? "+" : ""}
              {formatRupees(entry.amount)}
            </span>

            <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                onClick={() => setEditingId(entry.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                title="Edit"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                disabled={busyId === entry.id}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete"
              >
                {busyId === entry.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        ),
      )}

      {cursor && (
        <Button
          variant="outline"
          size="sm"
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full gap-1.5"
        >
          {loadingMore && <Loader2 className="size-3.5 animate-spin" />}
          {loadingMore ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}

function EditRow({
  entry,
  busy,
  onCancel,
  onSave,
}: {
  entry: ExpenseEntry;
  busy: boolean;
  onCancel: () => void;
  onSave: (patch: Partial<ExpenseEntry>) => void;
}) {
  const [amount, setAmount] = useState(String(entry.amount));
  const [category, setCategory] = useState(entry.category);
  const [note, setNote] = useState(entry.note);
  const [merchant, setMerchant] = useState(entry.merchant ?? "");

  const submit = () => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    onSave({
      amount: Math.round(parsed * 100) / 100,
      category,
      note,
      merchant: merchant.trim() || null,
    });
  };

  return (
    <div className="rounded-xl border border-brand bg-background p-2.5">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={amount}
          min={1}
          step="0.01"
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 rounded-md border bg-card px-2 py-1 text-sm tabular-nums outline-none focus:border-brand"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand"
        >
          {PW_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="ml-auto flex gap-0.5">
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-md p-1.5 text-mint hover:bg-mint/10"
            title="Save"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            title="Cancel"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex gap-2">
        <input
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="Merchant"
          maxLength={80}
          className="w-1/3 rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note"
          maxLength={280}
          className="flex-1 rounded-md border bg-card px-2 py-1 text-xs outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}

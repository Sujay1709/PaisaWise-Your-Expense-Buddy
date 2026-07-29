import { useCallback, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addExpenses } from "@/lib/api";
import { CATEGORY_EMOJI, PW_CATEGORIES, type PwCategory } from "@/lib/paisawise-store";

/** Today in the local timezone, formatted for <input type="date">. */
function todayLocal(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function AddExpenseForm({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayLocal);
  const [category, setCategory] = useState<PwCategory>("Food");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [saving, setSaving] = useState(false);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const parsed = Number(amount);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        toast.error("Enter an amount greater than zero.");
        return;
      }
      if (!title.trim()) {
        toast.error("Give it a title so you recognise it later.");
        return;
      }

      setSaving(true);
      const result = await addExpenses([
        {
          amount: Math.round(parsed * 100) / 100,
          category,
          merchant: title.trim().slice(0, 80),
          note: note.trim(),
          type: kind,
          // Sent as a date-only string; the server defaults to now() when empty.
          occurredAt: date || undefined,
        },
      ]);
      setSaving(false);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `${kind === "income" ? "Income" : "Expense"} added — ₹${Math.round(parsed).toLocaleString("en-IN")} · ${category}`,
      );

      // Keep category and date: people usually log several in a row.
      setTitle("");
      setAmount("");
      setNote("");
      onAdded();
    },
    [amount, title, note, category, date, kind, onAdded],
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label
          htmlFor="ae-title"
          className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          Title
        </label>
        <input
          id="ae-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Lunch at the mess"
          maxLength={80}
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="ae-amount"
            className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Amount (₹)
          </label>
          <input
            id="ae-amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm tabular-nums outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label
            htmlFor="ae-date"
            className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Date
          </label>
          <input
            id="ae-date"
            type="date"
            value={date}
            max={todayLocal()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* One toggle per category — no dropdown hunting. */}
      <div>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Category
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PW_CATEGORIES.map((option) => {
            const active = category === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand bg-brand-soft text-brand-foreground"
                    : "bg-background text-muted-foreground hover:border-brand/50 hover:text-foreground"
                }`}
              >
                <span aria-hidden>{CATEGORY_EMOJI[option]}</span>
                <span className="truncate">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="ae-note"
          className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          Note <span className="font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="ae-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any details..."
          maxLength={280}
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {/* Income is excluded from spending totals, so it needs its own switch. */}
      <div className="flex gap-2">
        {(["expense", "income"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            aria-pressed={kind === option}
            className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              kind === option
                ? option === "income"
                  ? "border-mint bg-mint-soft text-mint-foreground"
                  : "border-brand bg-brand-soft text-brand-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <Button type="submit" disabled={saving} size="lg" className="w-full gap-2">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {saving ? "Adding..." : `Add ${kind}`}
      </Button>
    </form>
  );
}

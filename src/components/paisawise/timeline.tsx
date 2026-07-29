import { useCallback, useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarClock, Loader2, TrendingUp } from "lucide-react";

import { formatRupees } from "@/lib/paisawise-store";

type RangeId = "day" | "5day" | "week" | "month";

type Timeline = {
  range: RangeId;
  days: number;
  total: number;
  income: number;
  count: number;
  avgPerDay: number;
  peakAmount: number;
  peakDay: string | null;
  buckets: { date: string; amount: number }[];
  byCategory: { category: string; amount: number; pct: number }[];
};

const RANGES: { id: RangeId; label: string }[] = [
  { id: "day", label: "Today" },
  { id: "5day", label: "5 days" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

function shortDay(iso: string, range: RangeId): string {
  const date = new Date(iso);
  if (range === "day") return "Today";
  if (range === "month") return date.toLocaleDateString("en-IN", { day: "numeric" });
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function fullDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function Timeline({ refreshKey }: { refreshKey: number }) {
  const [range, setRange] = useState<RangeId>("week");
  const [data, setData] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (r: RangeId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timeline?range=${r}`, { credentials: "same-origin" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [load, range, refreshKey]);

  const chartData = (data?.buckets ?? []).map((b) => ({
    day: shortDay(b.date, range),
    amount: b.amount,
    date: b.date,
  }));

  const isEmpty = data && data.total === 0;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
          <CalendarClock className="size-3.5" />
          Timeline
        </h2>
        <div className="flex gap-0.5 rounded-lg bg-secondary p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                range === r.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="grid h-48 place-items-center text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : isEmpty ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          No expenses in this window yet.
        </p>
      ) : (
        <>
          {/* Summary numbers first — the chart is context, these are the answer. */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <Stat label="Spent" value={formatRupees(data?.total ?? 0)} accent />
            <Stat
              label={range === "day" ? "Entries" : "Per day"}
              value={
                range === "day" ? String(data?.count ?? 0) : formatRupees(data?.avgPerDay ?? 0)
              }
            />
            <Stat
              label="Peak day"
              value={data?.peakAmount && data.peakAmount > 0 ? formatRupees(data.peakAmount) : "—"}
              hint={data?.peakDay ? fullDay(data.peakDay) : undefined}
            />
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tl-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8a838" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#e8a838" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  interval={range === "month" ? 4 : 0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: "#e8a838", strokeOpacity: 0.35 }}
                  formatter={(v: number) => [formatRupees(v), "Spent"]}
                  labelFormatter={(_, payload) => {
                    const iso = payload?.[0]?.payload?.date as string | undefined;
                    return iso ? fullDay(iso) : "";
                  }}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#e8a838"
                  strokeWidth={2}
                  fill="url(#tl-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {(data?.byCategory ?? []).length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <TrendingUp className="size-3" />
                Where it went
              </p>
              <div className="space-y-1">
                {data!.byCategory.slice(0, 4).map((row) => (
                  <div key={row.category} className="flex items-center gap-2 text-xs">
                    <span className="flex-1 truncate text-muted-foreground">{row.category}</span>
                    <span className="tabular-nums font-semibold">{formatRupees(row.amount)}</span>
                    <span className="w-8 text-right tabular-nums text-muted-foreground">
                      {row.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-2.5 ${
        accent ? "bg-brand-soft border-brand/40" : "bg-background"
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 font-display text-base font-extrabold tabular-nums ${
          accent ? "text-brand-foreground" : ""
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

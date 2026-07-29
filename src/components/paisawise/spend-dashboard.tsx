import { useCallback, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  PieChartIcon,
  RotateCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { CATEGORY_EMOJI, formatRupees, type PwCategory } from "@/lib/paisawise-store";
import { Button } from "@/components/ui/button";
import type { Stats } from "@/lib/api";
import { ExpenseHistory } from "@/components/paisawise/expense-history";
import { UsageMeter } from "@/components/paisawise/usage-meter";
import { AddExpenseForm } from "@/components/paisawise/add-expense-form";

/** Category emoji lookup that tolerates unknown categories from the server. */
function emojiFor(category: string): string {
  return CATEGORY_EMOJI[category as PwCategory] ?? "📦";
}

const CHART_COLORS = [
  "#e8a838", // brand / saffron
  "#4ade80", // mint
  "#6366f1", // indigo
  "#f87171", // coral
  "#a78bfa", // purple
  "#38bdf8", // sky
  "#fb923c", // orange
];

type Tab = "add" | "dashboard" | "history";

type MonthlyInsight = {
  leaks: string[];
  tips: string[];
  habit: string;
};

function SidebarHeader({
  tab,
  onTab,
  onReset,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex gap-1 rounded-lg bg-secondary p-0.5">
        {(["add", "dashboard", "history"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
              tab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {id}
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
      >
        <RotateCcw className="size-3.5" />
        Reset
      </Button>
    </div>
  );
}

export function SpendDashboard({
  stats,
  onReset,
  onDataChanged,
  usageKey,
}: {
  stats: Stats;
  onReset: () => void;
  onDataChanged: () => void;
  usageKey: number;
}) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [insight, setInsight] = useState<MonthlyInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const chartData = stats.byCategory.map((row) => ({
    name: `${emojiFor(row.category)} ${row.category}`,
    shortName: row.category,
    amount: row.amount,
    pct: row.pct,
  }));

  // Detect money leaks — categories that are disproportionately high
  const leaks = stats.byCategory.filter((row) => row.pct >= 35);
  const mediumLeaks = stats.byCategory.filter((row) => row.pct >= 20 && row.pct < 35);

  const fetchMonthlyInsight = useCallback(async () => {
    if (stats.expenseCount === 0) {
      toast.error("Log some expenses first!");
      return;
    }
    setInsightLoading(true);
    try {
      const summaryLines = stats.byCategory
        .map((row) => `${row.category}: ₹${row.amount} (${row.pct}%)`)
        .join(", ");

      const prompt = `Analyse these expenses of an Indian college student. Total: ₹${stats.totalSpent}. Breakdown: ${summaryLines}. This week: ₹${stats.weekSpent}. Give: top 3 money leaks, 3 realistic saving tips, and a one-line habit to change. Keep it short, friendly, in Indian English. Format as JSON: {"leaks":["..."],"tips":["..."],"habit":"..."}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: "insight-req",
              role: "user",
              content: prompt,
              parts: [{ type: "text", text: prompt }],
            },
          ],
        }),
      });

      if (!res.ok) {
        setInsight(generateLocalInsights(stats));
        return;
      }

      const text = await res.text();
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*?"leaks"[\s\S]*?"tips"[\s\S]*?"habit"[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as MonthlyInsight;
        setInsight(parsed);
      } else {
        // Fallback: generate client-side insights
        setInsight(generateLocalInsights(stats));
      }
    } catch {
      // Fallback to local insights on error
      setInsight(generateLocalInsights(stats));
    } finally {
      setInsightLoading(false);
    }
  }, [stats]);

  if (tab === "add") {
    return (
      <aside className="flex h-full flex-col gap-4 overflow-y-auto rounded-2xl border bg-card p-5">
        <SidebarHeader tab={tab} onTab={setTab} onReset={onReset} />
        <AddExpenseForm
          onAdded={() => {
            onDataChanged();
            setTab("dashboard");
          }}
        />
      </aside>
    );
  }

  if (tab === "history") {
    return (
      <aside className="flex h-full flex-col gap-4 overflow-y-auto rounded-2xl border bg-card p-5">
        <SidebarHeader tab={tab} onTab={setTab} onReset={onReset} />
        <ExpenseHistory onChanged={onDataChanged} />
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto rounded-2xl border bg-card p-5">
      <SidebarHeader tab={tab} onTab={setTab} onReset={onReset} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-brand-soft p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-brand-foreground/70">
            <Wallet className="size-3.5" /> All time
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-foreground">
            {formatRupees(stats.totalSpent)}
          </p>
        </div>
        <div className="rounded-xl border bg-mint-soft p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-mint-foreground/70">
            <TrendingUp className="size-3.5" /> This week
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-mint-foreground">
            {formatRupees(stats.weekSpent)}
          </p>
        </div>
      </div>

      {/* Money leak warnings */}
      {leaks.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-destructive">
            <AlertTriangle className="size-3.5" /> Money Leaks Detected
          </p>
          {leaks.map((leak) => (
            <p key={leak.category} className="mt-1 text-sm text-destructive/80">
              {emojiFor(leak.category)} {leak.category} is eating{" "}
              <span className="font-bold">{leak.pct}%</span> of your budget (
              {formatRupees(leak.amount)})
            </p>
          ))}
        </div>
      )}
      {mediumLeaks.length > 0 && leaks.length === 0 && (
        <div className="rounded-xl border border-brand/30 bg-brand-soft/50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-brand-foreground">
            <AlertTriangle className="size-3.5" /> Watch These
          </p>
          {mediumLeaks.map((ml) => (
            <p key={ml.category} className="mt-1 text-sm text-brand-foreground/80">
              {emojiFor(ml.category)} {ml.category}: {ml.pct}% ({formatRupees(ml.amount)})
            </p>
          ))}
        </div>
      )}

      {/* By category — list, then both charts together */}
      {stats.byCategory.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Log your first expense and your category breakdown builds up here.
        </p>
      ) : (
        <>
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              By category
            </h3>
            <div className="space-y-2">
              {stats.byCategory.map((row, i) => (
                <div key={row.category}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">
                      <span aria-hidden>{emojiFor(row.category)}</span> {row.category}
                    </span>
                    <span className="tabular-nums">
                      <span className="font-semibold">{formatRupees(row.amount)}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">{row.pct}%</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(3, row.pct)}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <BarChart3 className="size-3.5" /> Spend by category
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="shortName" width={72} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [formatRupees(value), "Spent"]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={`bar-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <PieChartIcon className="size-3.5" /> Share of spend
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="shortName"
                    cx="50%"
                    cy="50%"
                    outerRadius={68}
                    innerRadius={34}
                    paddingAngle={2}
                    label={({ pct }) => `${pct}%`}
                    labelLine={false}
                    style={{ fontSize: 10 }}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={`pie-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatRupees(value), "Spent"]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Plan usage */}
      <UsageMeter refreshKey={usageKey} />

      {/* Monthly AI Insights */}
      <div className="border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMonthlyInsight}
          disabled={insightLoading || stats.expenseCount === 0}
          className="w-full gap-1.5"
        >
          <Brain className="size-3.5" />
          {insightLoading ? "Analysing..." : "Get Monthly Insights"}
        </Button>

        {insight && (
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-xs font-bold text-destructive">Top Money Leaks</p>
              {insight.leaks.map((leak, i) => (
                <p key={i} className="mt-1 text-xs text-foreground">
                  {i + 1}. {leak}
                </p>
              ))}
            </div>
            <div className="rounded-xl border border-mint/30 bg-mint-soft p-3">
              <p className="text-xs font-bold text-mint-foreground">Saving Tips</p>
              {insight.tips.map((tip, i) => (
                <p key={i} className="mt-1 text-xs text-foreground">
                  {i + 1}. {tip}
                </p>
              ))}
            </div>
            <div className="rounded-xl border bg-brand-soft p-3">
              <p className="text-xs font-bold text-brand-foreground">Habit to Change</p>
              <p className="mt-1 text-xs text-foreground">{insight.habit}</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="mt-auto grid grid-cols-2 gap-3 border-t pt-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Expenses logged</p>
          <p className="font-display text-lg font-bold tabular-nums">{stats.expenseCount}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Income logged</p>
          <p className="font-display text-lg font-bold tabular-nums text-mint">
            {formatRupees(stats.totalIncome)}
          </p>
        </div>
      </div>
    </aside>
  );
}

/** Fallback insights when AI is unavailable */
function generateLocalInsights(stats: Stats): MonthlyInsight {
  const sorted = [...stats.byCategory].sort((a, b) => b.amount - a.amount);
  const leaks = sorted
    .slice(0, 3)
    .map(
      (row) =>
        `${emojiFor(row.category)} ${row.category} at ${row.pct}% (${formatRupees(row.amount)}) — consider cutting by 20%`,
    );
  const tips = [
    sorted[0]
      ? `Cook one more meal at home per week to save ~₹${Math.round(sorted[0].amount * 0.15)} on ${sorted[0].category}`
      : "Track every expense for a week to spot patterns",
    "Use student discounts on Amazon, Flipkart and Zomato Pro",
    "Start a ₹100/month SIP on Groww — builds the investing habit",
  ];
  const habit = sorted[0]
    ? `Before every ${sorted[0].category.toLowerCase()} purchase, ask: "Do I need this or do I want this?"`
    : "Track before you spend — awareness alone cuts costs by 10%.";

  return { leaks, tips, habit };
}

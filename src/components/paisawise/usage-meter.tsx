import { useCallback, useEffect, useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getBilling, setPlan, type BillingInfo } from "@/lib/api";

function Bar({
  label,
  used,
  limit,
  period,
}: {
  label: string;
  used: number;
  limit: number | null;
  period: string;
}) {
  if (limit === null) {
    return (
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-mint">Unlimited</span>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((used / limit) * 100));
  const exhausted = used >= limit;
  const nearly = pct >= 80;

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={`tabular-nums font-medium ${
            exhausted ? "text-destructive" : nearly ? "text-brand-foreground" : ""
          }`}
        >
          {used}/{limit}
          <span className="ml-1 text-muted-foreground">/{period}</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            exhausted ? "bg-destructive" : nearly ? "bg-brand" : "bg-mint"
          }`}
          style={{ width: `${Math.max(3, pct)}%` }}
        />
      </div>
    </div>
  );
}

export function UsageMeter({ refreshKey }: { refreshKey: number }) {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [switching, setSwitching] = useState(false);

  const load = useCallback(() => {
    getBilling().then((result) => {
      if (result.ok) setBilling(result.data);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const changePlan = useCallback(
    async (plan: "free" | "pro") => {
      setSwitching(true);
      const result = await setPlan(plan);
      setSwitching(false);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(plan === "pro" ? "Switched to Pro." : "Switched to Free.");
      load();
    },
    [load],
  );

  if (!billing) return null;

  const isPro = billing.plan === "pro";

  return (
    <div
      className={`rounded-xl border p-3 ${
        isPro ? "border-brand/40 bg-brand-soft/40" : "bg-background"
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isPro ? (
            <Sparkles className="size-3.5 text-brand" />
          ) : (
            <Zap className="size-3.5 text-muted-foreground" />
          )}
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {billing.plans[billing.plan].name} plan
          </span>
        </div>
        {!isPro && (
          <span className="text-[10px] text-muted-foreground">{billing.plans.pro.price}</span>
        )}
      </div>

      <div className="space-y-2.5">
        <Bar
          label="Expenses"
          used={billing.usage.expensesThisMonth}
          limit={billing.limits.expensesPerMonth}
          period="mo"
        />
        <Bar
          label="AI messages"
          used={billing.usage.aiChatsToday}
          limit={billing.limits.aiChatsPerDay}
          period="day"
        />
        <Bar
          label="Receipt scans"
          used={billing.usage.receiptScansThisMonth}
          limit={billing.limits.receiptScansPerMonth}
          period="mo"
        />
      </div>

      {billing.demoMode ? (
        <>
          <Button
            size="sm"
            variant={isPro ? "outline" : "default"}
            disabled={switching}
            onClick={() => changePlan(isPro ? "free" : "pro")}
            className="mt-3 w-full gap-1.5 text-xs"
          >
            <Sparkles className="size-3" />
            {switching ? "Switching..." : isPro ? "Switch back to Free" : "Upgrade to Pro"}
          </Button>
          <p className="mt-1.5 text-center text-[10px] leading-tight text-muted-foreground">
            Demo mode — no payment is taken. Switch freely to see how quotas behave.
          </p>
        </>
      ) : (
        <p className="mt-3 text-[10px] leading-tight text-muted-foreground">
          Billing is not enabled on this deployment.
        </p>
      )}
    </div>
  );
}

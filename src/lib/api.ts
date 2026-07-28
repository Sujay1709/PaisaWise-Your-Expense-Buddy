/**
 * Browser API client.
 *
 * Replaces the old IndexedDB layer. The session lives in an httpOnly
 * cookie the browser attaches automatically, so there is no token for
 * page scripts to read or leak.
 */

export type PlanId = "free" | "pro";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  bio: string;
  gender: string;
  avatarColor: string;
  createdAt: string;
  plan: PlanId;
};

export type PlanLimits = {
  expensesPerMonth: number | null;
  aiChatsPerDay: number | null;
  receiptScansPerMonth: number | null;
  monthlyInsights: boolean;
  historyDays: number | null;
};

export type BillingInfo = {
  plan: PlanId;
  plans: Record<PlanId, { name: string; price: string; limits: PlanLimits }>;
  usage: {
    expensesThisMonth: number;
    aiChatsToday: number;
    receiptScansThisMonth: number;
  };
  limits: PlanLimits;
  demoMode: boolean;
};

export type ExpenseEntry = {
  id: string;
  amount: number;
  category: string;
  merchant: string | null;
  note: string;
  type: "expense" | "income";
  occurredAt: string;
};

export type Stats = {
  totalSpent: number;
  weekSpent: number;
  monthSpent: number;
  totalIncome: number;
  expenseCount: number;
  byCategory: { category: string; amount: number; pct: number }[];
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<Result<T>> {
  try {
    const response = await fetch(path, {
      credentials: "same-origin",
      headers: init.body ? { "content-type": "application/json" } : undefined,
      ...init,
    });

    const text = await response.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const body = payload as { error?: string; hint?: string } | null;

      // Server sends a `hint` for operator-fixable problems (e.g. a missing
      // DATABASE_URL). Show it rather than a bare status code.
      const error = body?.error
        ? body.hint
          ? `${body.error} ${body.hint}`
          : body.error
        : response.status >= 500
          ? `Server error (${response.status}). Check the server logs.`
          : `Request failed (${response.status})`;

      return { ok: false, error };
    }

    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, error: "Network error. Check your connection." };
  }
}

// ─── Auth ───────────────────────────────────────────────────────

export function signUp(email: string, name: string, password: string) {
  return request<{ ok: true }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, name, password }),
  });
}

export function signIn(email: string, password: string) {
  return request<{ ok: true }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signOut() {
  return request<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const result = await request<{ user: AuthUser }>("/api/auth/me");
  return result.ok ? result.data.user : null;
}

// ─── Profile ────────────────────────────────────────────────────

export function updateProfile(updates: {
  name?: string;
  bio?: string;
  gender?: string;
}) {
  return request<{ ok: true; user: AuthUser }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<{ ok: true }>("/api/profile", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function deleteAccount() {
  return request<{ ok: true }>("/api/profile", { method: "DELETE" });
}

// ─── Expenses ───────────────────────────────────────────────────

const BATCH_SIZE = 500;

/**
 * Adds entries, chunked so a huge paste never exceeds the server's
 * per-request cap. Chunks run sequentially to avoid hammering the pool.
 */
export async function addExpenses(
  entries: Omit<ExpenseEntry, "id" | "occurredAt">[],
): Promise<Result<{ inserted: number }>> {
  let inserted = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const chunk = entries.slice(i, i + BATCH_SIZE);
    const result = await request<{ inserted: number }>("/api/expenses", {
      method: "POST",
      body: JSON.stringify({ entries: chunk }),
    });
    if (!result.ok) return result;
    inserted += result.data.inserted;
  }

  return { ok: true, data: { inserted } };
}

export function listExpenses(cursor?: string, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return request<{ entries: ExpenseEntry[]; nextCursor: string | null }>(
    `/api/expenses?${params}`,
  );
}

export function clearExpenses() {
  return request<{ ok: true }>("/api/expenses", { method: "DELETE" });
}

export function updateExpense(
  id: string,
  updates: Partial<Pick<ExpenseEntry, "amount" | "category" | "merchant" | "note" | "type">>,
) {
  return request<{ ok: true }>(`/api/expenses/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteExpense(id: string) {
  return request<{ ok: true }>(`/api/expenses/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ─── Receipt scanning ───────────────────────────────────────────

export type ScannedItem = {
  amount: number;
  category: string;
  merchant: string | null;
  note: string;
  type: "expense";
};

export type ScanResult = {
  items: ScannedItem[];
  merchant: string | null;
  confidence: "high" | "medium" | "low";
  total?: number;
  message?: string;
};

/**
 * Shrinks a photo before upload.
 *
 * Phone cameras produce 5-12MB images. Sending those raw is slow on mobile
 * data and often exceeds the request cap, so we downscale to a width the
 * model can still read text from and re-encode as JPEG.
 */
export function compressImage(file: File, maxDimension = 1600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not a readable image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process that image."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function scanReceipt(imageDataUrl: string) {
  return request<ScanResult>("/api/receipt", {
    method: "POST",
    body: JSON.stringify({ image: imageDataUrl }),
  });
}

// ─── Billing ────────────────────────────────────────────────────

export function getBilling() {
  return request<BillingInfo>("/api/billing");
}

export function setPlan(plan: PlanId) {
  return request<{ ok: true; plan: PlanId; demo: boolean }>("/api/billing", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}

/** True when a failed request was a quota block (HTTP 402) rather than an error. */
export function isQuotaError(message: string): boolean {
  return /You've used all|Upgrade to Pro/.test(message);
}

export async function getStats(): Promise<Stats> {
  const result = await request<Stats>("/api/stats");
  return result.ok
    ? result.data
    : {
        totalSpent: 0,
        weekSpent: 0,
        monthSpent: 0,
        totalIncome: 0,
        expenseCount: 0,
        byCategory: [],
      };
}

// ─── Chat history ───────────────────────────────────────────────

export async function getChatHistory(): Promise<unknown[]> {
  const result = await request<{ messages: unknown[] }>("/api/chat-history");
  return result.ok && Array.isArray(result.data.messages)
    ? result.data.messages
    : [];
}

export function saveChatHistory(messages: unknown[]) {
  return request<{ ok: true }>("/api/chat-history", {
    method: "PUT",
    body: JSON.stringify({ messages }),
  });
}

export function clearChatHistory() {
  return request<{ ok: true }>("/api/chat-history", { method: "DELETE" });
}

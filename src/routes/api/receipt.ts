import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";

import { apiRoute } from "@/server/handler.server";
import { createAIProvider, getModelId } from "@/lib/ai-gateway.server";
import { json, requireUser, unauthorized } from "@/server/auth.server";
import { rateLimit, tooManyRequests } from "@/server/rate-limit.server";

const CATEGORIES = [
  "Food", "Travel", "Education", "Entertainment", "Shopping", "Bills", "Other",
] as const;

/** Images are large; the client downscales, but enforce a ceiling anyway. */
const MAX_IMAGE_BYTES = 6_000_000;

const RECEIPT_PROMPT = `You are reading a photo of a receipt or bill belonging to an Indian college student.

Extract every purchased line item you can read. Return ONLY a JSON object, no prose, no code fences:

{"merchant":"<shop name or null>","currency":"INR","items":[{"amount":<number>,"category":"<one of Food|Travel|Education|Entertainment|Shopping|Bills|Other>","note":"<short item description>"}],"total":<number or null>,"confidence":"high"|"medium"|"low"}

Rules:
- amount is a plain number in rupees. No symbols, no commas.
- Skip tax/discount/subtotal lines. Capture only real purchased items.
- If individual line items are unreadable but the total is clear, return a single item using the total, with note "receipt total" and confidence "low".
- Categorise the way an Indian student would: restaurant/grocery/cafe -> Food; cab, auto, fuel, metro -> Travel; stationery, books, printouts -> Education; cinema, games -> Entertainment; clothes, electronics -> Shopping; recharge, rent, utilities -> Bills; anything unclear -> Other.
- If the image is not a receipt or nothing is legible, return {"merchant":null,"currency":"INR","items":[],"total":null,"confidence":"low"}.`;

type ParsedItem = { amount: number; category: string; note: string };

function extractJson(text: string): Record<string, unknown> | null {
  // Model may wrap output in fences or add stray prose despite instructions.
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/receipt")({
  server: {
    handlers: {
      POST: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();

        // Vision calls are the most expensive thing here — limit tightly.
        const limit = rateLimit(`receipt:${user.id}`, 15, 600_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        if (!process.env.AI_API_KEY) {
          return json(
            { error: "Receipt scanning is unavailable.", hint: "AI_API_KEY is not set." },
            { status: 503 },
          );
        }

        const contentLength = request.headers.get("content-length");
        if (contentLength && Number(contentLength) > MAX_IMAGE_BYTES) {
          return json(
            { error: "Image is too large. Try a smaller photo." },
            { status: 413 },
          );
        }

        let body: { image?: unknown };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, { status: 400 });
        }

        const image = String(body.image ?? "");
        if (!image.startsWith("data:image/")) {
          return json({ error: "Send a base64 data URL image." }, { status: 400 });
        }
        if (image.length > MAX_IMAGE_BYTES) {
          return json({ error: "Image is too large. Try a smaller photo." }, { status: 413 });
        }

        const provider = createAIProvider();

        let raw: string;
        try {
          const result = await generateText({
            model: provider(getModelId()),
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: RECEIPT_PROMPT },
                  { type: "image", image: new URL(image) },
                ],
              },
            ],
          });
          raw = result.text;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("[receipt] vision call failed", message);

          if (message.includes("429")) {
            return json({ error: "Too many requests. Wait a moment and retry." }, { status: 429 });
          }
          if (message.includes("401") || message.includes("403")) {
            return json(
              { error: "AI credentials are invalid.", hint: "Check AI_API_KEY." },
              { status: 502 },
            );
          }
          return json(
            {
              error: "Could not read that receipt.",
              hint: "The model may not support images. Check AI_MODEL supports vision.",
            },
            { status: 502 },
          );
        }

        const parsed = extractJson(raw);
        if (!parsed) {
          return json(
            { error: "Could not read that receipt. Try a clearer photo." },
            { status: 422 },
          );
        }

        // Validate hard — this came from a model, not a form.
        const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
        const items: ParsedItem[] = [];

        for (const entry of rawItems.slice(0, 50)) {
          if (!entry || typeof entry !== "object") continue;
          const row = entry as Record<string, unknown>;

          const amount = Number(row.amount);
          if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999_999) continue;

          const category = CATEGORIES.includes(row.category as (typeof CATEGORIES)[number])
            ? String(row.category)
            : "Other";

          items.push({
            amount: Math.round(amount * 100) / 100,
            category,
            note: String(row.note ?? "").slice(0, 280) || "receipt item",
          });
        }

        const merchant =
          typeof parsed.merchant === "string" && parsed.merchant.trim()
            ? parsed.merchant.trim().slice(0, 80)
            : null;

        const confidence = ["high", "medium", "low"].includes(String(parsed.confidence))
          ? String(parsed.confidence)
          : "low";

        if (items.length === 0) {
          return json({
            items: [],
            merchant,
            confidence: "low",
            message: "No expenses found in that image. Try a clearer photo of the receipt.",
          });
        }

        // Deliberately does NOT save. The user confirms first — a
        // misread amount should never land in the ledger silently.
        return json({
          items: items.map((item) => ({ ...item, merchant, type: "expense" as const })),
          merchant,
          confidence,
          total: items.reduce((sum, item) => sum + item.amount, 0),
        });
      }),
    },
  },
});

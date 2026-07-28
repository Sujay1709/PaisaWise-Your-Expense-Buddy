import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { createAIProvider, getModelId } from "@/lib/ai-gateway.server";
import { PAISAWISE_SYSTEM_PROMPT } from "@/lib/paisawise-prompt.server";
import { requireUser } from "@/server/auth.server";
import { rateLimit, tooManyRequests } from "@/server/rate-limit.server";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: apiRoute(async ({ request }) => {
        // Auth-gated: AI tokens cost money, so anonymous traffic cannot burn them.
        const user = await requireUser(request);
        if (!user) {
          return new Response(JSON.stringify({ error: "Not signed in." }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        // 30 AI calls per user per 10 minutes.
        const limit = rateLimit(`chat:${user.id}`, 30, 600_000);
        if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

        const contentLength = request.headers.get("content-length");
        if (contentLength && Number(contentLength) > 512_000) {
          return new Response("Payload too large", { status: 413 });
        }

        let body: ChatRequestBody;
        try {
          body = (await request.json()) as ChatRequestBody;
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }
        if (messages.length > 100) {
          return new Response("Conversation too long", { status: 400 });
        }

        if (!process.env.AI_API_KEY) {
          return new Response("AI is not configured. Set AI_API_KEY.", { status: 503 });
        }

        const provider = createAIProvider();

        const result = streamText({
          model: provider(getModelId()),
          system: PAISAWISE_SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
          onError: ({ error }) => {
            console.error("[chat] stream error", error);
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (error) => {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("429"))
              return "Too many requests — wait a few seconds and try again.";
            if (message.includes("401") || message.includes("403"))
              return "AI credentials are invalid. Check AI_API_KEY.";
            return "Something went wrong. Try sending that again?";
          },
        });
      }),
    },
  },
});

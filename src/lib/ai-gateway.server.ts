import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Creates an AI provider from environment variables.
 *
 * Supported env vars:
 *   AI_PROVIDER_BASE_URL  – e.g. "https://generativelanguage.googleapis.com/v1beta/openai"
 *   AI_API_KEY            – your API key for the provider
 *   AI_MODEL              – model identifier, e.g. "gemini-2.0-flash" (default)
 */
export function createAIProvider() {
  const baseURL =
    process.env.AI_PROVIDER_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
  const apiKey = process.env.AI_API_KEY || "";

  return createOpenAICompatible({
    name: "paisawise-ai",
    baseURL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export function getModelId(): string {
  return process.env.AI_MODEL || "gemini-2.0-flash";
}

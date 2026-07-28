/**
 * Shared API error boundary.
 *
 * Without this, any thrown error (a missing DATABASE_URL, Postgres being
 * down, a bad query) escapes the route and the client receives an opaque
 * HTML 500 — which surfaced in the UI as the useless "Request failed (500)".
 *
 * Every API route is wrapped so failures come back as JSON with a message
 * that tells you what to actually do about it.
 */

export type ApiHandler = (ctx: { request: Request }) => Promise<Response> | Response;

function jsonError(message: string, status: number, hint?: string): Response {
  return new Response(JSON.stringify({ error: message, ...(hint ? { hint } : {}) }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** Recognises "the database isn't usable" as distinct from a real bug. */
function describeDbFailure(error: unknown): { message: string; hint: string } | null {
  const err = error as { message?: string; code?: string };
  const message = err?.message ?? "";
  const code = err?.code ?? "";

  if (message.includes("DATABASE_URL is not set")) {
    return {
      message: "The database is not configured.",
      hint: "Set DATABASE_URL in your .env file (local) or in Railway variables (production), then restart the server.",
    };
  }

  // Postgres / socket level failures
  const connectionCodes = new Set([
    "ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "EHOSTUNREACH",
    "ECONNRESET", "EPIPE",
    "28P01", // invalid_password
    "3D000", // invalid_catalog_name (database does not exist)
    "57P03", // cannot_connect_now
    "53300", // too_many_connections
  ]);

  if (connectionCodes.has(code)) {
    return {
      message: "Could not reach the database.",
      hint: `Postgres refused the connection (${code}). Check that it is running and that DATABASE_URL is correct.`,
    };
  }

  if (/connect|ECONNREFUSED|timeout|terminated/i.test(message) && !code) {
    return {
      message: "Could not reach the database.",
      hint: "Check that Postgres is running and DATABASE_URL points at it.",
    };
  }

  return null;
}

export function apiRoute(handler: ApiHandler): ApiHandler {
  return async (ctx) => {
    try {
      return await handler(ctx);
    } catch (error) {
      const dbFailure = describeDbFailure(error);

      if (dbFailure) {
        console.error("[api] database unavailable:", (error as Error)?.message);
        // 503, not 500 — this is "try again once infra is fixed", not a bug.
        return jsonError(dbFailure.message, 503, dbFailure.hint);
      }

      console.error("[api] unhandled error", error);

      // Never leak internals to the browser in production.
      const detail =
        process.env.NODE_ENV === "production"
          ? undefined
          : ((error as Error)?.message ?? String(error));

      return jsonError("Something went wrong on the server.", 500, detail);
    }
  };
}

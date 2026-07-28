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

/** Methods that change state and therefore need CSRF protection. */
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Rejects cross-site state-changing requests.
 *
 * SECURITY: TanStack's built-in CSRF middleware only covers server functions
 * (`handlerType === "serverFn"`), so these REST routes were relying solely on
 * the session cookie's SameSite=Lax attribute. That does block cross-site POST
 * in current browsers, but it is a single layer with known edge cases — older
 * browsers ignore SameSite, and Chrome's "Lax + POST" grace period exempts
 * cookies set in the last two minutes.
 *
 * Sec-Fetch-Site is set by the browser and cannot be forged by page script.
 * Where it is unavailable we fall back to comparing Origin against Host.
 */
function csrfViolation(request: Request): Response | null {
  if (!UNSAFE_METHODS.has(request.method)) return null;

  const site = request.headers.get("sec-fetch-site");
  if (site) {
    if (site === "same-origin" || site === "none") return null;
    return new Response(
      JSON.stringify({ error: "Cross-site requests are not allowed." }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  }

  // Older browser, or a non-browser client such as curl.
  const origin = request.headers.get("origin");
  if (!origin) return null; // No Origin means no browser-driven CSRF vector.

  try {
    const originHost = new URL(origin).host;
    const target = request.headers.get("host") ?? new URL(request.url).host;
    if (originHost === target) return null;
  } catch {
    // Unparseable Origin — treat as hostile.
  }

  return new Response(
    JSON.stringify({ error: "Cross-site requests are not allowed." }),
    { status: 403, headers: { "content-type": "application/json" } },
  );
}

export function apiRoute(handler: ApiHandler): ApiHandler {
  return async (ctx) => {
    try {
      const blocked = csrfViolation(ctx.request);
      if (blocked) return blocked;

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

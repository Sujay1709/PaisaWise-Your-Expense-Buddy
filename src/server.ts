import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { closePool, ensureMigrated, purgeExpiredSessions } from "./server/db.server";

// Run migrations at boot so the first request never pays for them, and a
// bad DATABASE_URL surfaces in deploy logs instead of as a user-facing 500.
if (process.env.DATABASE_URL) {
  ensureMigrated()
    .then(() => purgeExpiredSessions())
    .then((purged) => {
      if (purged > 0) console.log(`[db] purged ${purged} expired sessions`);
    })
    .catch((error) => console.error("[db] startup migration failed", error));

  // Hourly sweep so the sessions table stays small.
  const sweep = setInterval(
    () => {
      purgeExpiredSessions().catch((error) =>
        console.error("[db] session purge failed", error),
      );
    },
    60 * 60 * 1000,
  );
  sweep.unref?.();
} else {
  console.warn("[db] DATABASE_URL is not set — API routes will return errors.");
}

// Railway sends SIGTERM on redeploy; drain the pool so in-flight
// transactions finish instead of being severed mid-write.
let shuttingDown = false;
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server] ${signal} received, closing database pool`);
    closePool()
      .catch((error) => console.error("[server] pool close failed", error))
      .finally(() => process.exit(0));
  });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

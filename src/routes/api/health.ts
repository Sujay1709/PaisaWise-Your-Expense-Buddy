import { createFileRoute } from "@tanstack/react-router";

import { getPool } from "@/server/db.server";

/**
 * Railway healthcheck target.
 * Verifies the process is up AND that Postgres is reachable, so a
 * deploy with a broken DATABASE_URL fails the healthcheck instead of
 * serving 500s to users.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await getPool().query("SELECT 1");
          return new Response(
            JSON.stringify({ status: "ok", db: "up", time: new Date().toISOString() }),
            { headers: { "content-type": "application/json", "cache-control": "no-store" } },
          );
        } catch (error) {
          console.error("[health] db unreachable", error);
          return new Response(
            JSON.stringify({ status: "degraded", db: "down" }),
            {
              status: 503,
              headers: { "content-type": "application/json", "cache-control": "no-store" },
            },
          );
        }
      },
    },
  },
});

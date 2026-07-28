/**
 * Production HTTP server.
 *
 * `vite build` emits a fetch handler (dist/server/server.js), not a
 * listening server. This wraps it in a real Node HTTP server that also
 * serves the built client assets — which is what Railway runs.
 *
 * Hono is used for the adapter because it forwards streaming Responses
 * correctly; the AI chat endpoint streams its reply token by token.
 */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

// Defaults to ./dist. Override with DIST_DIR when testing an alternate build.
const DIST = process.env.DIST_DIR ?? "./dist";

const { default: ssrHandler } = await import(`${DIST}/server/server.js`);

const app = new Hono();

// Hashed build assets are immutable — cache them hard.
app.use(
  "/assets/*",
  serveStatic({
    root: `${DIST}/client`,
    onFound: (_path, c) => {
      c.header("cache-control", "public, max-age=31536000, immutable");
    },
  }),
);

// Everything else in the client build (favicon, robots.txt, images).
app.use("/*", serveStatic({ root: `${DIST}/client` }));

// Anything not matched by a static file goes to SSR / API routes.
// executionCtx is a Cloudflare Workers concept and throws on Node, so we
// pass a minimal stand-in instead of touching c.executionCtx.
const nodeExecutionCtx = {
  waitUntil: (promise) => {
    if (promise && typeof promise.catch === "function") {
      promise.catch((error) =>
        console.error("[server] background task failed", error),
      );
    }
  },
  passThroughOnException: () => {},
};

app.all("*", async (c) => {
  try {
    return await ssrHandler.fetch(c.req.raw, process.env, nodeExecutionCtx);
  } catch (error) {
    console.error("[server] unhandled request error", error);
    return c.text("Internal Server Error", 500);
  }
});

const port = Number(process.env.PORT) || 3000;

const server = serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`[server] PaisaWise listening on http://0.0.0.0:${info.port}`);
});

// Stop accepting new connections on redeploy; db.server.ts drains the pool.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close());
}

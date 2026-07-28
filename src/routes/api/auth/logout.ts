import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import {
  SESSION_COOKIE,
  clearCookie,
  destroySession,
  json,
  readCookie,
} from "@/server/auth.server";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: apiRoute(async ({ request }) => {
        await destroySession(readCookie(request, SESSION_COOKIE));
        return json({ ok: true }, { headers: { "set-cookie": clearCookie() } });
      }),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

import { apiRoute } from "@/server/handler.server";

import { json, requireUser, unauthorized } from "@/server/auth.server";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: apiRoute(async ({ request }) => {
        const user = await requireUser(request);
        if (!user) return unauthorized();
        return json({ user });
      }),
    },
  },
});

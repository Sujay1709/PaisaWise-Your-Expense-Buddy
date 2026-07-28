import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";

import { PaisaWiseWordmark } from "@/components/paisawise/brand";
import { UserMenu } from "@/components/paisawise/user-menu";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser, signOut, type AuthUser } from "@/lib/api";

const ChatWindow = lazy(() =>
  import("@/components/paisawise/chat-window").then((m) => ({ default: m.ChatWindow })),
);

export const Route = createFileRoute("/app")({
  component: AppPage,
  head: () => ({
    meta: [
      { title: "PaisaWise Assistant — Log Expenses in Plain English" },
      {
        name: "description",
        content:
          "Type expenses the way you talk and PaisaWise turns them into flashcards, a spending snapshot and savings tips.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/app" }],
  }),
});

function ChatFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-4">
      <div className="h-full min-h-[60vh] animate-pulse rounded-2xl border bg-card" />
    </div>
  );
}

function AppPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        void navigate({ to: "/auth" });
      } else {
        setUser(u);
      }
      setChecked(true);
    });
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    void navigate({ to: "/auth" });
  }, [navigate]);

  if (!checked || !user) return null;

  return (
    <div className="flex h-svh flex-col pw-grain">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <PaisaWiseWordmark markSize={28} eager />
        <UserMenu user={user} onUserChange={setUser} onSignOut={handleSignOut} />
      </header>
      <Suspense fallback={<ChatFallback />}>
        <ChatWindow />
      </Suspense>
      <Toaster />
    </div>
  );
}

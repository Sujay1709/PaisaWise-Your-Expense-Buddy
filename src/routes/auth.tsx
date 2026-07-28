import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { PaisaWiseWordmark } from "@/components/paisawise/brand";
import { Button } from "@/components/ui/button";
import { getCurrentUser, signIn, signUp } from "@/lib/api";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign In — PaisaWise" },
      { name: "description", content: "Sign in to PaisaWise to track your expenses." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) void navigate({ to: "/app" });
    });
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const result =
        mode === "signup"
          ? await signUp(email, name, password)
          : await signIn(email, password);

      setLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      void navigate({ to: "/app" });
    },
    [mode, email, name, password, navigate],
  );

  return (
    <div className="flex min-h-svh items-center justify-center pw-grain px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <PaisaWiseWordmark markSize={36} eager />
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-warm">
          <h1 className="font-display text-2xl font-extrabold text-center">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            {mode === "signin"
              ? "Sign in to access your expenses"
              : "Start tracking your spending today"}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="auth-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sujay"
                  autoComplete="name"
                  required
                  maxLength={80}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="font-semibold text-brand hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(""); }}
                  className="font-semibold text-brand hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

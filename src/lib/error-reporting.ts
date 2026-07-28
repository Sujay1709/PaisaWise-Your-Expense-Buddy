/**
 * Client-side error reporter.
 * Logs to the console; swap in Sentry or similar when you need real telemetry.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[PaisaWise]", {
    error,
    route: window.location.pathname,
    ...context,
  });
}

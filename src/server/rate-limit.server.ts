/**
 * In-memory sliding-window rate limiter.
 *
 * Scope note: this is per-instance. On a single Railway container it is
 * exact; if you scale to multiple replicas each holds its own counter, so
 * the effective limit is (limit x replicas). That is fine for abuse
 * control at this size. Move to Redis if you scale horizontally and need
 * a hard global cap.
 *
 * The map is swept periodically so it cannot grow without bound.
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 50_000;

let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  // Hard cap on distinct keys — under a flood we shed rather than OOM.
  if (!buckets.has(key) && buckets.size >= MAX_KEYS) {
    return { allowed: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Client IP, resistant to header spoofing.
 *
 * SECURITY: `X-Forwarded-For` is a list that each proxy *appends* to, so the
 * LEFTMOST entry is whatever the client sent — fully attacker-controlled.
 * Reading it means an attacker rotates a fake IP per request and every
 * IP-based limit resets, defeating brute-force protection entirely.
 *
 * Only the entries your own infrastructure appended can be trusted. With one
 * proxy in front (Render, Railway, Fly, Cloudflare), the real client IP is the
 * LAST entry. Set TRUSTED_PROXY_HOPS if you add more proxies in the chain.
 */
export function clientIp(request: Request): string {
  const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS ?? 1));
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const chain = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (chain.length > 0) {
      // Count back from the right by the number of proxies we control.
      const index = Math.max(0, chain.length - hops);
      return chain[index];
    }
  }

  // Set by the proxy itself, not forwarded from the client.
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({ error: `Too many requests. Try again in ${retryAfterSeconds}s.` }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfterSeconds),
      },
    },
  );
}

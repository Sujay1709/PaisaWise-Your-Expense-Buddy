/**
 * Server-side authentication.
 *
 * Password hashing uses Node's built-in scrypt — memory-hard, no native
 * dependencies to break a Railway build, and constant-time compared.
 *
 * Sessions are opaque 256-bit random tokens. Only the SHA-256 of the token
 * is stored, so a database leak does not hand an attacker live sessions.
 * The token travels in an httpOnly + Secure + SameSite=Lax cookie, so
 * JavaScript on the page can never read it (XSS cannot steal the session)
 * and it is not sent on cross-site requests (blocks CSRF).
 */

import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  createHash,
  type ScryptOptions,
} from "node:crypto";
import { promisify } from "node:util";

import { query } from "./db.server";

// promisify picks the 3-argument overload; we need the one that takes options.
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTIONS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const SESSION_COOKIE = "pw_session";
const SESSION_TTL_DAYS = 30;

// ─── Passwords ──────────────────────────────────────────────────

export async function hashPassword(
  password: string,
): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS);
  return { hash: derived.toString("hex"), salt };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  try {
    const derived = await scryptAsync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS);
    const expected = Buffer.from(hash, "hex");
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

// ─── Sessions ───────────────────────────────────────────────────

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  bio: string;
  gender: string;
  avatarColor: string;
  createdAt: string;
  plan: "free" | "pro";
};

/** Creates a session row and returns the raw token for the cookie. */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);

  await query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [hashToken(token), userId, expiresAt],
  );

  return token;
}

/** Resolves a raw cookie token to a user, or null. */
export async function getUserFromToken(
  token: string | undefined,
): Promise<AuthUser | null> {
  if (!token) return null;

  const rows = await query<{
    id: string;
    email: string;
    name: string;
    bio: string;
    gender: string;
    avatar_color: string;
    created_at: Date;
    plan: string;
  }>(
    `SELECT u.id, u.email, u.name, u.bio, u.gender, u.avatar_color, u.created_at, u.plan
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()
      LIMIT 1`,
    [hashToken(token)],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    bio: row.bio,
    gender: row.gender,
    avatarColor: row.avatar_color,
    createdAt: row.created_at.toISOString(),
    plan: row.plan === "pro" ? "pro" : "free",
  };
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
}

/** Invalidates every session for a user (used after a password change). */
export async function destroyAllSessions(userId: string): Promise<void> {
  await query("DELETE FROM sessions WHERE user_id = $1", [userId]);
}

// ─── Cookies ────────────────────────────────────────────────────

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_DAYS * 86_400}`,
  ].join("; ") + secure;
}

export function clearCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

// ─── Request helper ─────────────────────────────────────────────

/** Returns the authenticated user for a request, or null. */
export async function requireUser(request: Request): Promise<AuthUser | null> {
  return getUserFromToken(readCookie(request, SESSION_COOKIE));
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

export function unauthorized(): Response {
  return json({ error: "Not signed in." }, { status: 401 });
}

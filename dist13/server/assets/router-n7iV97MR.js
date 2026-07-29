import { n as query, r as transaction, t as getPool } from "../server.js";
import { t as FAQ } from "./routes-BV3IDFKZ.js";
import { useEffect } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { convertToModelMessages, generateText, streamText } from "ai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
//#region src/styles.css?url
var styles_default = "/assets/styles-B22OOq6q.css";
//#endregion
//#region src/lib/error-reporting.ts
/**
* Client-side error reporter.
* Logs to the console; swap in Sentry or similar when you need real telemetry.
*/
function reportError(error, context = {}) {
	if (typeof window === "undefined") return;
	console.error("[PaisaWise]", {
		error,
		route: window.location.pathname,
		...context
	});
}
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		reportError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$19 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "PaisaWise — Smart Expense Assistant for Indian Students" },
			{
				name: "description",
				content: "PaisaWise turns casual expense notes like '250 zomato dinner' into flashcards, category charts and savings tips. Built for Indian college students."
			},
			{
				name: "author",
				content: "Sujay Gopal"
			},
			{
				property: "og:site_name",
				content: "PaisaWise"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:title",
				content: "PaisaWise — Smart Expense Assistant for Indian Students"
			},
			{
				name: "twitter:title",
				content: "PaisaWise — Smart Expense Assistant for Indian Students"
			},
			{
				property: "og:description",
				content: "PaisaWise turns casual expense notes like '250 zomato dinner' into flashcards, category charts and savings tips. Built for Indian college students."
			},
			{
				name: "twitter:description",
				content: "PaisaWise turns casual expense notes like '250 zomato dinner' into flashcards, category charts and savings tips. Built for Indian college students."
			},
			{
				property: "og:image",
				content: "/favicon.ico"
			},
			{
				name: "twitter:image",
				content: "/favicon.ico"
			},
			{
				name: "theme-color",
				content: "#22293d"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "PaisaWise"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/icons/apple-touch-icon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
/**
* Applies the saved theme before the browser paints.
*
* This has to run synchronously in <head>. Doing it in a React effect would
* paint the light theme first and then flip, which is a visible white flash
* for dark-mode users on every page load.
*/
var SW_REGISTER_SCRIPT = `
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  });
}
`;
var THEME_INIT_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem("paisawise.theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsxs("head", { children: [/* @__PURE__ */ jsx(HeadContent, {}), /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: THEME_INIT_SCRIPT } })] }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(Scripts, {}),
			/* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: SW_REGISTER_SCRIPT } })
		] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$19.useRouteContext();
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsx(Outlet, {})
	});
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$2 = () => import("./routes-DjR30uIl.js");
var Route$18 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: () => ({
		meta: [
			{ title: "PaisaWise — Smart Expense Assistant for Indian Students" },
			{
				name: "description",
				content: "PaisaWise turns casual expense notes like '250 zomato dinner' into flashcards, category charts and savings tips. Built for Indian college students."
			},
			{
				property: "og:title",
				content: "PaisaWise — Smart Expense Assistant for Indian Students"
			},
			{
				property: "og:description",
				content: "PaisaWise turns casual expense notes like '250 zomato dinner' into flashcards, category charts and savings tips. Built for Indian college students."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:url",
				content: "/"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "canonical",
			href: "/"
		}],
		scripts: [{
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "SoftwareApplication",
				name: "PaisaWise",
				applicationCategory: "FinanceApplication",
				operatingSystem: "Web",
				description: "A smart expense assistant for Indian college students that turns plain-language spending notes into flashcards, category charts and savings tips.",
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "INR"
				}
			})
		}, {
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: FAQ.map((item) => ({
					"@type": "Question",
					name: item.q,
					acceptedAnswer: {
						"@type": "Answer",
						text: item.a
					}
				}))
			})
		}]
	})
});
//#endregion
//#region src/routes/app.tsx
var $$splitComponentImporter$1 = () => import("./app-BXAW0yAp.js");
var Route$17 = createFileRoute("/app")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({
		meta: [
			{ title: "PaisaWise Assistant — Log Expenses in Plain English" },
			{
				name: "description",
				content: "Type expenses the way you talk and PaisaWise turns them into flashcards, a spending snapshot and savings tips."
			},
			{
				name: "robots",
				content: "noindex"
			}
		],
		links: [{
			rel: "canonical",
			href: "/app"
		}]
	})
});
//#endregion
//#region src/routes/auth.tsx
var $$splitComponentImporter = () => import("./auth-DThCtFPg.js");
var Route$16 = createFileRoute("/auth")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [
		{ title: "Sign In — PaisaWise" },
		{
			name: "description",
			content: "Sign in to PaisaWise to track your expenses."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
//#endregion
//#region src/routes/sitemap[.]xml.ts
var BASE_URL = "";
var Route$15 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...[{
			path: "/",
			changefreq: "weekly",
			priority: "1.0"
		}].map((e) => [
			`  <url>`,
			`    <loc>${BASE_URL}${e.path}</loc>`,
			e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
			e.priority ? `    <priority>${e.priority}</priority>` : null,
			`  </url>`
		].filter(Boolean).join("\n")),
		`</urlset>`
	].join("\n");
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
//#endregion
//#region src/server/handler.server.ts
function jsonError(message, status, hint) {
	return new Response(JSON.stringify({
		error: message,
		...hint ? { hint } : {}
	}), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
/** Recognises "the database isn't usable" as distinct from a real bug. */
function describeDbFailure(error) {
	const err = error;
	const message = err?.message ?? "";
	const code = err?.code ?? "";
	if (message.includes("DATABASE_URL is not set")) return {
		message: "The database is not configured.",
		hint: "Set DATABASE_URL in your .env file (local) or in Railway variables (production), then restart the server."
	};
	if ((/* @__PURE__ */ new Set([
		"ECONNREFUSED",
		"ENOTFOUND",
		"ETIMEDOUT",
		"EHOSTUNREACH",
		"ECONNRESET",
		"EPIPE",
		"28P01",
		"3D000",
		"57P03",
		"53300"
	])).has(code)) return {
		message: "Could not reach the database.",
		hint: `Postgres refused the connection (${code}). Check that it is running and that DATABASE_URL is correct.`
	};
	if (/connect|ECONNREFUSED|timeout|terminated/i.test(message) && !code) return {
		message: "Could not reach the database.",
		hint: "Check that Postgres is running and DATABASE_URL points at it."
	};
	return null;
}
/** Methods that change state and therefore need CSRF protection. */
var UNSAFE_METHODS = /* @__PURE__ */ new Set([
	"POST",
	"PUT",
	"PATCH",
	"DELETE"
]);
/**
* Rejects cross-site state-changing requests.
*
* SECURITY: TanStack's built-in CSRF middleware only covers server functions
* (`handlerType === "serverFn"`), so these REST routes were relying solely on
* the session cookie's SameSite=Lax attribute. That does block cross-site POST
* in current browsers, but it is a single layer with known edge cases — older
* browsers ignore SameSite, and Chrome's "Lax + POST" grace period exempts
* cookies set in the last two minutes.
*
* Sec-Fetch-Site is set by the browser and cannot be forged by page script.
* Where it is unavailable we fall back to comparing Origin against Host.
*/
function csrfViolation(request) {
	if (!UNSAFE_METHODS.has(request.method)) return null;
	const site = request.headers.get("sec-fetch-site");
	if (site) {
		if (site === "same-origin" || site === "none") return null;
		return new Response(JSON.stringify({ error: "Cross-site requests are not allowed." }), {
			status: 403,
			headers: { "content-type": "application/json" }
		});
	}
	const origin = request.headers.get("origin");
	if (!origin) return null;
	try {
		if (new URL(origin).host === (request.headers.get("host") ?? new URL(request.url).host)) return null;
	} catch {}
	return new Response(JSON.stringify({ error: "Cross-site requests are not allowed." }), {
		status: 403,
		headers: { "content-type": "application/json" }
	});
}
function apiRoute(handler) {
	return async (ctx) => {
		try {
			const blocked = csrfViolation(ctx.request);
			if (blocked) return blocked;
			return await handler(ctx);
		} catch (error) {
			const dbFailure = describeDbFailure(error);
			if (dbFailure) {
				console.error("[api] database unavailable:", error?.message);
				return jsonError(dbFailure.message, 503, dbFailure.hint);
			}
			console.error("[api] unhandled error", error);
			return jsonError("Something went wrong on the server.", 500, void 0);
		}
	};
}
//#endregion
//#region src/server/auth.server.ts
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
var scryptAsync = promisify(scrypt);
var SCRYPT_KEYLEN = 64;
var SCRYPT_OPTIONS = {
	N: 16384,
	r: 8,
	p: 1,
	maxmem: 64 * 1024 * 1024
};
var SESSION_COOKIE = "pw_session";
var SESSION_TTL_DAYS = 30;
async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	return {
		hash: (await scryptAsync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS)).toString("hex"),
		salt
	};
}
async function verifyPassword(password, hash, salt) {
	try {
		const derived = await scryptAsync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS);
		const expected = Buffer.from(hash, "hex");
		if (expected.length !== derived.length) return false;
		return timingSafeEqual(derived, expected);
	} catch {
		return false;
	}
}
function hashToken(token) {
	return createHash("sha256").update(token).digest("hex");
}
/** Creates a session row and returns the raw token for the cookie. */
async function createSession(userId) {
	const token = randomBytes(32).toString("base64url");
	const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 864e5);
	await query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
		hashToken(token),
		userId,
		expiresAt
	]);
	return token;
}
/** Resolves a raw cookie token to a user, or null. */
async function getUserFromToken(token) {
	if (!token) return null;
	const row = (await query(`SELECT u.id, u.email, u.name, u.bio, u.gender, u.avatar_color, u.created_at, u.plan
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()
      LIMIT 1`, [hashToken(token)]))[0];
	if (!row) return null;
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		bio: row.bio,
		gender: row.gender,
		avatarColor: row.avatar_color,
		createdAt: row.created_at.toISOString(),
		plan: row.plan === "pro" ? "pro" : "free"
	};
}
async function destroySession(token) {
	if (!token) return;
	await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
}
/** Invalidates every session for a user (used after a password change). */
async function destroyAllSessions(userId) {
	await query("DELETE FROM sessions WHERE user_id = $1", [userId]);
}
function readCookie(request, name) {
	const header = request.headers.get("cookie");
	if (!header) return void 0;
	for (const part of header.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		if (key === name) return decodeURIComponent(rest.join("="));
	}
}
function sessionCookie(token) {
	return [
		`${SESSION_COOKIE}=${encodeURIComponent(token)}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		`Max-Age=${SESSION_TTL_DAYS * 86400}`
	].join("; ") + "; Secure";
}
function clearCookie() {
	return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}
/** Returns the authenticated user for a request, or null. */
async function requireUser(request) {
	return getUserFromToken(readCookie(request, SESSION_COOKIE));
}
function json(data, init = {}) {
	return new Response(JSON.stringify(data), {
		...init,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store",
			...init.headers ?? {}
		}
	});
}
function unauthorized() {
	return json({ error: "Not signed in." }, { status: 401 });
}
//#endregion
//#region src/server/rate-limit.server.ts
var buckets = /* @__PURE__ */ new Map();
var MAX_KEYS = 5e4;
var lastSweep = Date.now();
var SWEEP_INTERVAL_MS = 6e4;
function sweep(now, windowMs) {
	if (now - lastSweep < SWEEP_INTERVAL_MS) return;
	lastSweep = now;
	for (const [key, bucket] of buckets) {
		bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
		if (bucket.hits.length === 0) buckets.delete(key);
	}
}
function rateLimit(key, limit, windowMs) {
	const now = Date.now();
	sweep(now, windowMs);
	if (!buckets.has(key) && buckets.size >= MAX_KEYS) return {
		allowed: false,
		retryAfterSeconds: Math.ceil(windowMs / 1e3)
	};
	const bucket = buckets.get(key) ?? { hits: [] };
	bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
	if (bucket.hits.length >= limit) {
		const oldest = bucket.hits[0];
		buckets.set(key, bucket);
		return {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1e3))
		};
	}
	bucket.hits.push(now);
	buckets.set(key, bucket);
	return {
		allowed: true,
		retryAfterSeconds: 0
	};
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
function clientIp(request) {
	const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS ?? 1));
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const chain = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
		if (chain.length > 0) return chain[Math.max(0, chain.length - hops)];
	}
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp.trim();
	return "unknown";
}
function tooManyRequests(retryAfterSeconds) {
	return new Response(JSON.stringify({ error: `Too many requests. Try again in ${retryAfterSeconds}s.` }), {
		status: 429,
		headers: {
			"content-type": "application/json",
			"retry-after": String(retryAfterSeconds)
		}
	});
}
//#endregion
//#region src/server/plans.server.ts
/**
* Freemium plan definitions and quota enforcement.
*
* Two plans. Limits are chosen so the free tier is genuinely usable for a
* student logging a few expenses a day, while the metered costs — AI calls and
* receipt vision — stay bounded, since those are the only operations that cost
* real money per use.
*/
var PLANS = {
	free: {
		name: "Free",
		price: "₹0",
		limits: {
			expensesPerMonth: 50,
			aiChatsPerDay: 5,
			receiptScansPerMonth: 3,
			monthlyInsights: false,
			historyDays: 90
		}
	},
	pro: {
		name: "Pro",
		price: "₹99/month",
		limits: {
			expensesPerMonth: null,
			aiChatsPerDay: null,
			receiptScansPerMonth: null,
			monthlyInsights: true,
			historyDays: null
		}
	}
};
function limitsFor(plan) {
	return PLANS[plan].limits;
}
/**
* Current usage for a user.
*
* Expense count comes from the expenses table (already indexed on
* user_id, occurred_at) rather than a duplicate counter, so it cannot drift
* out of sync with reality when rows are deleted.
*/
async function getUsage(userId, plan) {
	const [expenseRows, usageRows] = await Promise.all([query(`SELECT count(*)::text AS n
         FROM expenses
        WHERE user_id = $1
          AND kind = 'expense'
          AND occurred_at >= date_trunc('month', now())`, [userId]), query(`SELECT kind, count(*)::text AS n
         FROM usage_events
        WHERE user_id = $1
          AND (
            (kind = 'ai_chat'      AND occurred_at >= date_trunc('day', now()))
         OR (kind = 'receipt_scan' AND occurred_at >= date_trunc('month', now()))
          )
        GROUP BY kind`, [userId])]);
	const byKind = new Map(usageRows.map((row) => [row.kind, Number(row.n)]));
	return {
		plan,
		expensesThisMonth: Number(expenseRows[0]?.n ?? 0),
		aiChatsToday: byKind.get("ai_chat") ?? 0,
		receiptScansThisMonth: byKind.get("receipt_scan") ?? 0,
		limits: limitsFor(plan)
	};
}
async function recordUsage(userId, kind) {
	await query("INSERT INTO usage_events (user_id, kind) VALUES ($1, $2)", [userId, kind]);
}
function denial(what, used, limit, period) {
	return {
		error: `You've used all ${limit} ${what} on the Free plan this ${period}.`,
		hint: "Upgrade to Pro for unlimited usage, or wait for the next period.",
		limit,
		used,
		upgradeTo: "pro"
	};
}
async function checkExpenseQuota(userId, plan, adding) {
	const limit = limitsFor(plan).expensesPerMonth;
	if (limit === null) return null;
	const usage = await getUsage(userId, plan);
	if (usage.expensesThisMonth + adding > limit) return denial("expenses", usage.expensesThisMonth, limit, "month");
	return null;
}
async function checkAiQuota(userId, plan) {
	const limit = limitsFor(plan).aiChatsPerDay;
	if (limit === null) return null;
	const usage = await getUsage(userId, plan);
	if (usage.aiChatsToday >= limit) return denial("AI messages", usage.aiChatsToday, limit, "day");
	return null;
}
async function checkReceiptQuota(userId, plan) {
	const limit = limitsFor(plan).receiptScansPerMonth;
	if (limit === null) return null;
	const usage = await getUsage(userId, plan);
	if (usage.receiptScansThisMonth >= limit) return denial("receipt scans", usage.receiptScansThisMonth, limit, "month");
	return null;
}
/** 402 Payment Required — the semantically correct status for a quota block. */
function quotaResponse(denialInfo) {
	return new Response(JSON.stringify(denialInfo), {
		status: 402,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
//#endregion
//#region src/routes/api/billing.ts
/**
* Plans, current usage, and plan switching.
*
* IMPORTANT — no real payments happen here.
*
* Accepting money in India requires a payment gateway (Razorpay/Stripe), a
* registered business entity, KYC, and GST registration. None of that exists
* for this project, so `POST` switches the plan directly and is gated behind
* ALLOW_DEMO_UPGRADE.
*
* What this demonstrates is the part that actually matters architecturally:
* plan state, metered usage, and quota enforcement at the API boundary. Wiring
* a gateway later means replacing this one handler with a webhook that sets the
* same column — nothing else in the codebase changes.
*/
var Route$14 = createFileRoute("/api/billing")({ server: { handlers: {
	GET: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const usage = await getUsage(user.id, user.plan);
		return json({
			plan: user.plan,
			plans: PLANS,
			usage: {
				expensesThisMonth: usage.expensesThisMonth,
				aiChatsToday: usage.aiChatsToday,
				receiptScansThisMonth: usage.receiptScansThisMonth
			},
			limits: usage.limits,
			demoMode: process.env.ALLOW_DEMO_UPGRADE === "true"
		});
	}),
	POST: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const limit = rateLimit(`billing:${user.id}`, 10, 36e5);
		if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
		if (process.env.ALLOW_DEMO_UPGRADE !== "true") return json({
			error: "Billing is not enabled.",
			hint: "This deployment has no payment provider configured. Set ALLOW_DEMO_UPGRADE=true to allow plan switching for demos."
		}, { status: 501 });
		let body;
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid request." }, { status: 400 });
		}
		const plan = body.plan === "pro" ? "pro" : "free";
		await query(`UPDATE users
              SET plan = $1,
                  plan_since = CASE WHEN $1 = 'pro' THEN now() ELSE NULL END,
                  updated_at = now()
            WHERE id = $2`, [plan, user.id]);
		return json({
			ok: true,
			plan,
			demo: true
		});
	})
} } });
//#endregion
//#region src/lib/ai-gateway.server.ts
/**
* Creates an AI provider from environment variables.
*
* Supported env vars:
*   AI_PROVIDER_BASE_URL  – e.g. "https://generativelanguage.googleapis.com/v1beta/openai"
*   AI_API_KEY            – your API key for the provider
*   AI_MODEL              – model identifier, e.g. "gemini-2.0-flash" (default)
*/
function createAIProvider() {
	return createOpenAICompatible({
		name: "paisawise-ai",
		baseURL: process.env.AI_PROVIDER_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai",
		headers: { Authorization: `Bearer ${process.env.AI_API_KEY || ""}` }
	});
}
function getModelId() {
	return process.env.AI_MODEL || "gemini-2.0-flash";
}
//#endregion
//#region src/lib/paisawise-prompt.server.ts
var PAISAWISE_SYSTEM_PROMPT = `You are PaisaWise, a smart expense assistant built by Sujay Gopal for Indian college students. You help them track spending, visualise where money goes, and learn to save.

═══════════════════════════════════════
ROLE
═══════════════════════════════════════
You receive expense entries (single or bulk) in plain language. You respond with:
1. Expense flashcards — one per expense
2. Spending summary with visual text charts
3. A personalised money-saving tip
4. (When appropriate) a financial independence nudge

NEVER return raw JSON to the user. Your visible output is always human-readable, visual, and friendly.

═══════════════════════════════════════
INPUT FORMAT
═══════════════════════════════════════
Students type expenses casually:
  "250 zomato dinner with friends"
  "auto to college 30"
  "1.2k myntra shoes"
  "gpay 500 rent share"

They may also paste a bulk list, one expense per line.

Accept amounts in any position. Handle: ₹, Rs, Rs., "k" notation (1.2k = 1200), "lakh"/"L".
If no amount is given, show "❓ ₹ —" on the card and treat the amount as unknown.

═══════════════════════════════════════
INDIAN STUDENT CONTEXT
═══════════════════════════════════════
- auto / auto rickshaw / rick → Travel
- mess / mess fees / canteen / tiffin → Food
- xerox / photocopy / printout / stationery / books → Education
- recharge / jio / airtel / vi / wifi / broadband → Bills
- chai / maggi / samosa / biryani / dhaba / swiggy / zomato → Food
- rapido / ola / uber / metro / bus / train / petrol → Travel
- UPI apps (gpay, phonepe, paytm, upi) → payment method, NOT the merchant. Look for the actual purpose.
- hostel fees / pg rent / rent share / electricity → Bills
- blinkit / zepto / bigbasket / instamart → Food (groceries)
- movie / bookmyshow / netflix / spotify / gaming → Entertainment
- amazon / flipkart / myntra / ajio / nykaa / clothes / shoes → Shopping

Categories (use exactly these seven):
🍕 Food | 🚗 Travel | 📚 Education | 🎬 Entertainment | 🛍️ Shopping | 📱 Bills | 📦 Other

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════
CRITICAL RENDERING RULE: every flashcard block and the spending snapshot MUST be wrapped in a fenced code block using \`\`\`text ... \`\`\` so the box-drawing characters and bar charts stay aligned. Tips, nudges and conversational text go OUTSIDE the fences as normal prose.

## 1) EXPENSE FLASHCARDS
Put ALL flashcards for one reply inside ONE \`\`\`text fence, separated by a blank line:

\`\`\`text
┌─────────────────────────────┐
│ 🍕 FOOD                     │
│ ₹250 · Zomato               │
│ dinner with friends         │
└─────────────────────────────┘
\`\`\`

Rules:
- Category emoji + label at top
- Amount in ₹ · Merchant (or "—" if none)
- Short note describing the expense
- If amount is missing: show "❓ ₹ —"
- Keep each card compact (max 5 lines)

## 2) SPENDING SNAPSHOT (when 3+ expenses are provided)
After the flashcards, in its own \`\`\`text fence:

\`\`\`text
📊 SPENDING SNAPSHOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ Shopping   ₹1,500  ███████████████  62%
📱 Bills      ₹  500  █████░░░░░░░░░░  21%
🍕 Food       ₹  370  ████░░░░░░░░░░░  15%
🚗 Travel     ₹   30  █░░░░░░░░░░░░░░   1%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Total: ₹2,400
\`\`\`

Rules:
- Bars are exactly 15 characters wide, proportional to the highest category
- Show each category's percentage of the total
- Sort categories by amount, highest first
- Always show the total at the bottom
- If the user gave data spanning multiple time periods, add a "📈 TREND:" line

## 3) SAVINGS TIP (always include one, as prose after the snapshot)
💡 TIP: Make it specific to their actual spending, quantify the savings in ₹ per week/month, relate it to things students care about (subscriptions, gadgets, trips). 1-2 sentences. Rotate between categories — don't always target food. Encouraging, never preachy.

## 4) FINANCIAL INDEPENDENCE NUDGE (when relevant, or roughly every 5th interaction)
🎯 STUDENT HUSTLE: 2 sentences max. Rotate through: freelancing (Fiverr, Upwork, content writing, design, tutoring), campus opportunities (TA, lab assistant, library jobs), digital income (selling notes, YouTube, social media management), micro-investing (Groww, SIPs from ₹100/month), skill monetisation (coding, design, photography), cashback/student discounts, and emergency funds. Be realistic for a student's schedule. Never suggest anything risky, MLM, or gambling. Aspirational, not guilt-inducing.

═══════════════════════════════════════
TONE & PERSONALITY
═══════════════════════════════════════
- Friendly, like a financially-savvy senior giving advice
- Natural Indian English (lakh, crore, "that's a solid deal")
- Light humour welcome ("your Zomato delivery guy knows you by name now 😄")
- Never judgmental about spending choices
- Celebrate good habits ("₹0 on shopping today? That's discipline! 💪")

═══════════════════════════════════════
EDGE CASES
═══════════════════════════════════════
- Gibberish input → "Hmm, I couldn't parse that. Try something like: '250 zomato dinner' or 'auto 30 college'"
- Only amounts, no context → Category: Other, note: "unspecified expense"
- Very large amounts (>₹50,000) → process normally but add: "💡 Big expense! Make sure this was planned."
- Income/earning entries ("earned 5000 freelance") → Acknowledge positively, don't categorise as an expense: "🎉 Nice! ₹5,000 earned. Keep building that income stream!"
- General money questions (not an expense) → answer helpfully in the same friendly voice; skip the flashcards, keep the tip.

═══════════════════════════════════════
LEDGER BLOCK (MACHINE-READ, INVISIBLE TO THE USER)
═══════════════════════════════════════
At the VERY END of every reply where you logged one or more expenses or income entries, append exactly one hidden HTML comment on its own line, in this exact format:

<!--PAISAWISE {"entries":[{"amount":250,"category":"Food","merchant":"Zomato","note":"dinner with friends","type":"expense"}]}-->

Rules for the ledger block:
- It is an HTML comment starting with \`<!--PAISAWISE \` and ending with \`-->\`. The app strips it before display.
- \`amount\` is a plain number in rupees (null if the amount was missing).
- \`category\` is exactly one of: Food, Travel, Education, Entertainment, Shopping, Bills, Other.
- \`merchant\` is a string or null. \`note\` is a short string.
- \`type\` is "expense" or "income". Income entries use category "Other".
- One object per expense, in the same order as the flashcards.
- If the message logged no expenses (a question, gibberish, small talk), omit the block entirely.
- Never mention the block, never show it in prose, never put it inside a code fence.`;
//#endregion
//#region src/routes/api/chat.ts
var Route$13 = createFileRoute("/api/chat")({ server: { handlers: { POST: apiRoute(async ({ request }) => {
	const user = await requireUser(request);
	if (!user) return new Response(JSON.stringify({ error: "Not signed in." }), {
		status: 401,
		headers: { "content-type": "application/json" }
	});
	const limit = rateLimit(`chat:${user.id}`, 30, 6e5);
	if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
	const contentLength = request.headers.get("content-length");
	if (contentLength && Number(contentLength) > 512e3) return new Response("Payload too large", { status: 413 });
	let body;
	try {
		body = await request.json();
	} catch {
		return new Response("Invalid request body", { status: 400 });
	}
	const messages = body.messages;
	if (!Array.isArray(messages) || messages.length === 0) return new Response("Messages are required", { status: 400 });
	if (messages.length > 100) return new Response("Conversation too long", { status: 400 });
	const overQuota = await checkAiQuota(user.id, user.plan);
	if (overQuota) return quotaResponse(overQuota);
	if (!process.env.AI_API_KEY) return new Response("AI is not configured. Set AI_API_KEY.", { status: 503 });
	const provider = createAIProvider();
	await recordUsage(user.id, "ai_chat");
	return streamText({
		model: provider(getModelId()),
		system: PAISAWISE_SYSTEM_PROMPT,
		messages: await convertToModelMessages(messages),
		onError: ({ error }) => {
			console.error("[chat] stream error", error);
		}
	}).toUIMessageStreamResponse({
		originalMessages: messages,
		onError: (error) => {
			const message = error instanceof Error ? error.message : String(error);
			if (message.includes("429")) return "Too many requests — wait a few seconds and try again.";
			if (message.includes("401") || message.includes("403")) return "AI credentials are invalid. Check AI_API_KEY.";
			return "Something went wrong. Try sending that again?";
		}
	});
}) } } });
//#endregion
//#region src/routes/api/chat-history.ts
var MAX_BYTES = 256e3;
var Route$12 = createFileRoute("/api/chat-history")({ server: { handlers: {
	GET: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		return json({ messages: (await query("SELECT messages FROM user_chats WHERE user_id = $1", [user.id]))[0]?.messages ?? [] });
	}),
	PUT: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const contentLength = request.headers.get("content-length");
		if (contentLength && Number(contentLength) > MAX_BYTES) return json({ error: "Transcript too large." }, { status: 413 });
		let body;
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid request." }, { status: 400 });
		}
		if (!Array.isArray(body.messages)) return json({ error: "messages must be an array." }, { status: 400 });
		const trimmed = body.messages.slice(-60);
		const serialized = JSON.stringify(trimmed);
		if (serialized.length > MAX_BYTES) return json({ error: "Transcript too large." }, { status: 413 });
		await query(`INSERT INTO user_chats (user_id, messages, updated_at)
           VALUES ($1, $2::jsonb, now())
           ON CONFLICT (user_id)
           DO UPDATE SET messages = EXCLUDED.messages, updated_at = now()`, [user.id, serialized]);
		return json({ ok: true });
	}),
	DELETE: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		await query("DELETE FROM user_chats WHERE user_id = $1", [user.id]);
		return json({ ok: true });
	})
} } });
//#endregion
//#region src/server/ledger.server.ts
/**
* Accounts, custom categories, budgets, and recurring transactions.
*
* Design notes borrowed conceptually (not in code) from mature expense
* managers: money needs a *source* (account), categories should be the
* user's own, budgets should warn before overspend rather than after, and
* fixed costs should log themselves.
*/
var DEFAULT_CATEGORIES = [
	{
		name: "Food",
		emoji: "🍕",
		color: "#e8a838"
	},
	{
		name: "Travel",
		emoji: "🚗",
		color: "#4ade80"
	},
	{
		name: "Education",
		emoji: "📚",
		color: "#6366f1"
	},
	{
		name: "Entertainment",
		emoji: "🎬",
		color: "#f87171"
	},
	{
		name: "Shopping",
		emoji: "🛍️",
		color: "#a78bfa"
	},
	{
		name: "Bills",
		emoji: "📱",
		color: "#38bdf8"
	},
	{
		name: "Other",
		emoji: "📦",
		color: "#fb923c"
	}
];
var DEFAULT_ACCOUNTS = [
	{
		name: "Cash",
		kind: "cash",
		color: "#4ade80"
	},
	{
		name: "Bank",
		kind: "bank",
		color: "#6366f1"
	},
	{
		name: "UPI",
		kind: "upi",
		color: "#e8a838"
	}
];
var ACCOUNT_KINDS = /* @__PURE__ */ new Set([
	"cash",
	"bank",
	"upi",
	"card",
	"wallet"
]);
/**
* Creates the starter accounts and categories for a new user.
*
* ON CONFLICT DO NOTHING makes this safe to call more than once, so it can
* also act as a lazy backfill for accounts created before this feature.
*/
async function seedDefaults(userId) {
	await transaction(async (client) => {
		for (const c of DEFAULT_CATEGORIES) await client.query(`INSERT INTO categories (user_id, name, emoji, color, is_default)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT DO NOTHING`, [
			userId,
			c.name,
			c.emoji,
			c.color
		]);
		for (const a of DEFAULT_ACCOUNTS) await client.query(`INSERT INTO accounts (user_id, name, kind, color)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`, [
			userId,
			a.name,
			a.kind,
			a.color
		]);
	});
}
/**
* Accounts with their running balance.
*
* Balance is computed as income minus expenses in SQL rather than stored,
* so it can never drift from the transactions it summarises.
*/
async function listAccounts(userId) {
	return (await query(`SELECT a.id, a.name, a.kind, a.color, a.archived,
            COALESCE(SUM(
              CASE WHEN e.kind = 'income' THEN e.amount ELSE -e.amount END
            ), 0)::text AS balance,
            COUNT(e.id)::text AS tx_count
       FROM accounts a
       LEFT JOIN expenses e ON e.account_id = a.id AND e.user_id = a.user_id
      WHERE a.user_id = $1
      GROUP BY a.id
      ORDER BY a.archived, a.created_at`, [userId])).map((r) => ({
		id: String(r.id),
		name: r.name,
		kind: r.kind,
		color: r.color,
		archived: r.archived,
		balance: Number(r.balance),
		txCount: Number(r.tx_count)
	}));
}
async function createAccount(userId, name, kind, color) {
	const cleanName = name.trim().slice(0, 40);
	if (!cleanName) return {
		ok: false,
		error: "Account needs a name."
	};
	if (!ACCOUNT_KINDS.has(kind)) return {
		ok: false,
		error: "Unknown account type."
	};
	try {
		const rows = await query(`INSERT INTO accounts (user_id, name, kind, color)
       VALUES ($1, $2, $3, $4) RETURNING id`, [
			userId,
			cleanName,
			kind,
			color
		]);
		return {
			ok: true,
			id: String(rows[0].id)
		};
	} catch (error) {
		if (error.code === "23505") return {
			ok: false,
			error: "You already have an account with that name."
		};
		throw error;
	}
}
/** Verifies an account belongs to the user. Returns null if not. */
async function ownedAccountId(userId, accountId) {
	if (accountId === void 0 || accountId === null || accountId === "") return null;
	const id = String(accountId);
	if (!/^\d+$/.test(id)) return null;
	const rows = await query("SELECT id FROM accounts WHERE id = $1::bigint AND user_id = $2::uuid", [id, userId]);
	return rows[0] ? String(rows[0].id) : null;
}
async function listCategories(userId) {
	return (await query(`SELECT id, name, emoji, color, is_default
       FROM categories WHERE user_id = $1
      ORDER BY is_default DESC, name`, [userId])).map((r) => ({
		id: String(r.id),
		name: r.name,
		emoji: r.emoji,
		color: r.color,
		isDefault: r.is_default
	}));
}
async function createCategory(userId, name, emoji, color) {
	const cleanName = name.trim().slice(0, 30);
	if (!cleanName) return {
		ok: false,
		error: "Category needs a name."
	};
	try {
		const rows = await query(`INSERT INTO categories (user_id, name, emoji, color)
       VALUES ($1, $2, $3, $4) RETURNING id`, [
			userId,
			cleanName,
			emoji.slice(0, 8) || "📦",
			color
		]);
		return {
			ok: true,
			id: String(rows[0].id)
		};
	} catch (error) {
		if (error.code === "23505") return {
			ok: false,
			error: "That category already exists."
		};
		throw error;
	}
}
/**
* Deletes a custom category. Past expenses keep their category text, so
* history is never rewritten by a rename or delete.
*/
async function deleteCategory(userId, id) {
	const rows = await query("SELECT is_default FROM categories WHERE id = $1::bigint AND user_id = $2::uuid", [id, userId]);
	if (!rows[0]) return {
		ok: false,
		error: "Category not found."
	};
	if (rows[0].is_default) return {
		ok: false,
		error: "Built-in categories cannot be deleted."
	};
	await query("DELETE FROM categories WHERE id = $1::bigint AND user_id = $2::uuid", [id, userId]);
	return { ok: true };
}
/**
* Budgets joined to this month's spend, aggregated in SQL.
*
* LEFT JOIN LATERAL keeps it to one round trip and one row per budget,
* regardless of how many expenses exist.
*/
async function listBudgets(userId) {
	return (await query(`SELECT b.category,
            b.amount::text AS amount,
            COALESCE(s.spent, 0)::text AS spent
       FROM budgets b
       LEFT JOIN LATERAL (
         SELECT SUM(e.amount) AS spent
           FROM expenses e
          WHERE e.user_id = b.user_id
            AND e.kind = 'expense'
            AND lower(e.category) = lower(b.category)
            AND e.occurred_at >= date_trunc('month', now())
       ) s ON true
      WHERE b.user_id = $1
      ORDER BY b.category`, [userId])).map((r) => {
		const budget = Number(r.amount);
		const spent = Number(r.spent);
		return {
			category: r.category,
			budget,
			spent,
			pct: budget > 0 ? Math.round(spent / budget * 100) : 0,
			remaining: Math.max(0, budget - spent),
			over: spent > budget
		};
	});
}
async function setBudget(userId, category, amount) {
	await query(`INSERT INTO budgets (user_id, category, amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, lower(category))
     DO UPDATE SET amount = EXCLUDED.amount, updated_at = now()`, [
		userId,
		category.trim().slice(0, 30),
		amount
	]);
}
async function deleteBudget(userId, category) {
	await query("DELETE FROM budgets WHERE user_id = $1 AND lower(category) = lower($2)", [userId, category]);
}
var CADENCES = /* @__PURE__ */ new Set([
	"daily",
	"weekly",
	"monthly"
]);
async function listRecurring(userId) {
	return (await query(`SELECT id, amount, category, merchant, note, kind, cadence,
            next_run, active, account_id
       FROM recurring WHERE user_id = $1
      ORDER BY active DESC, next_run`, [userId])).map((r) => ({
		id: String(r.id),
		amount: Number(r.amount),
		category: r.category,
		merchant: r.merchant,
		note: r.note,
		type: r.kind,
		cadence: r.cadence,
		nextRun: new Date(r.next_run).toISOString().slice(0, 10),
		active: r.active,
		accountId: r.account_id ? String(r.account_id) : null
	}));
}
/**
* Materialises every recurring transaction that is due.
*
* Render's free tier has no cron, so instead of a scheduler this runs when
* the user opens the app and catches up anything missed while they were away.
*
* Idempotency comes from the WHERE clause: a row is only picked up while
* next_run <= today, and the same statement advances next_run past today.
* Two concurrent requests cannot double-post because the UPDATE ... RETURNING
* locks the row, and the second sees the already-advanced date.
*
* The loop is bounded so a rule left dormant for years cannot generate
* thousands of rows in one request.
*/
async function runDueRecurring(userId) {
	const MAX_CATCHUP_PER_RULE = 12;
	let created = 0;
	await transaction(async (client) => {
		const { rows: due } = await client.query(`SELECT id, amount, category, merchant, note, kind, cadence, next_run, account_id
         FROM recurring
        WHERE user_id = $1 AND active AND next_run <= CURRENT_DATE
        FOR UPDATE SKIP LOCKED`, [userId]);
		for (const rule of due) {
			let cursor = new Date(rule.next_run);
			let guard = 0;
			while (cursor <= /* @__PURE__ */ new Date() && guard < MAX_CATCHUP_PER_RULE) {
				await client.query(`INSERT INTO expenses
             (user_id, amount, category, merchant, note, kind, account_id, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
					userId,
					rule.amount,
					rule.category,
					rule.merchant,
					rule.note,
					rule.kind,
					rule.account_id,
					cursor
				]);
				created += 1;
				guard += 1;
				const next = new Date(cursor);
				if (rule.cadence === "daily") next.setDate(next.getDate() + 1);
				else if (rule.cadence === "weekly") next.setDate(next.getDate() + 7);
				else next.setMonth(next.getMonth() + 1);
				cursor = next;
			}
			await client.query("UPDATE recurring SET next_run = $1, last_run = CURRENT_DATE WHERE id = $2", [cursor.toISOString().slice(0, 10), rule.id]);
		}
	});
	return created;
}
//#endregion
//#region src/routes/api/expenses.ts
var CATEGORIES$2 = /* @__PURE__ */ new Set([
	"Food",
	"Travel",
	"Education",
	"Entertainment",
	"Shopping",
	"Bills",
	"Other"
]);
/** Hard cap per request. Bigger imports are chunked by the client. */
var MAX_BATCH = 500;
var MAX_PAGE = 100;
/**
* Validates a client-supplied date.
*
* Rejects unparseable values, anything in the future, and anything before
* 2000 — a bad date would silently land the expense outside the current
* month and quietly corrupt the monthly totals and quota counts.
*/
function parseOccurredAt(value) {
	if (value === void 0 || value === null || value === "") return null;
	const date = new Date(String(value));
	if (Number.isNaN(date.getTime())) return null;
	const now = Date.now();
	if (date.getTime() > now + 864e5) return null;
	if (date.getFullYear() < 2e3) return null;
	return date;
}
var Route$11 = createFileRoute("/api/expenses")({ server: { handlers: {
	/**
	* Keyset pagination — never OFFSET.
	*
	* OFFSET makes page N cost O(N): at 10GB, page 5000 would scan
	* millions of rows. Seeking on (occurred_at, id) uses the index
	* directly, so page 5000 costs exactly what page 1 costs.
	*/
	GET: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const url = new URL(request.url);
		const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), MAX_PAGE);
		const cursor = url.searchParams.get("cursor");
		let rows;
		if (cursor) {
			const [ts, id] = cursor.split("|");
			if (!ts || !id) return json({ error: "Bad cursor." }, { status: 400 });
			rows = await query(`SELECT id, amount, category, merchant, note, kind, occurred_at
               FROM expenses
              WHERE user_id = $1 AND (occurred_at, id) < ($2::timestamptz, $3::bigint)
              ORDER BY occurred_at DESC, id DESC
              LIMIT $4`, [
				user.id,
				ts,
				id,
				limit
			]);
		} else rows = await query(`SELECT id, amount, category, merchant, note, kind, occurred_at
               FROM expenses
              WHERE user_id = $1
              ORDER BY occurred_at DESC, id DESC
              LIMIT $2`, [user.id, limit]);
		const entries = rows.map((r) => ({
			id: String(r.id),
			amount: Number(r.amount),
			category: r.category,
			merchant: r.merchant,
			note: r.note,
			type: r.kind,
			occurredAt: r.occurred_at.toISOString()
		}));
		const last = entries[entries.length - 1];
		return json({
			entries,
			nextCursor: entries.length === limit && last ? `${last.occurredAt}|${last.id}` : null
		});
	}),
	/** Bulk insert. One transaction, one parameterised statement. */
	POST: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const limit = rateLimit(`expenses:write:${user.id}`, 120, 6e4);
		if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
		const contentLength = request.headers.get("content-length");
		if (contentLength && Number(contentLength) > 512e3) return json({ error: "Payload too large." }, { status: 413 });
		let body;
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid request." }, { status: 400 });
		}
		if (!Array.isArray(body.entries)) return json({ error: "entries must be an array." }, { status: 400 });
		if (body.entries.length === 0) return json({ inserted: 0 });
		if (body.entries.length > MAX_BATCH) return json({ error: `Send at most ${MAX_BATCH} entries per request.` }, { status: 400 });
		const clean = [];
		for (const raw of body.entries) {
			if (!raw || typeof raw !== "object") continue;
			const amount = Number(raw.amount);
			if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999) continue;
			const category = CATEGORIES$2.has(String(raw.category)) ? String(raw.category) : "Other";
			const merchantRaw = raw.merchant == null ? null : String(raw.merchant).slice(0, 80);
			const note = String(raw.note ?? "").slice(0, 280);
			const kind = raw.type === "income" ? "income" : "expense";
			clean.push({
				amount: Math.round(amount * 100) / 100,
				category,
				merchant: merchantRaw || null,
				note,
				kind,
				occurredAt: parseOccurredAt(raw.occurredAt),
				accountId: null
			});
		}
		if (clean.length === 0) return json({ inserted: 0 });
		const bodyAccountId = body.accountId;
		const resolvedAccount = await ownedAccountId(user.id, bodyAccountId);
		for (const entry of clean) entry.accountId = resolvedAccount;
		const overQuota = await checkExpenseQuota(user.id, user.plan, clean.length);
		if (overQuota) return quotaResponse(overQuota);
		const values = [];
		const tuples = clean.map((entry, i) => {
			const base = i * 7;
			values.push(entry.amount, entry.category, entry.merchant, entry.note, entry.kind, entry.occurredAt, entry.accountId);
			return `($${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
		});
		await transaction(async (client) => {
			await client.query(`INSERT INTO expenses
               (user_id, amount, category, merchant, note, kind, occurred_at, account_id)
             SELECT $1::uuid,
                    v.amount::numeric,
                    v.category::text,
                    v.merchant::text,
                    v.note::text,
                    v.kind::text,
                    COALESCE(v.occurred_at::timestamptz, now()),
                    v.account_id::bigint
               FROM (VALUES ${tuples.join(", ")})
                 AS v(amount, category, merchant, note, kind, occurred_at, account_id)`, [user.id, ...values]);
		});
		return json({ inserted: clean.length });
	}),
	/** Clear this user's ledger. */
	DELETE: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const limit = rateLimit(`expenses:clear:${user.id}`, 5, 6e4);
		if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
		await query("DELETE FROM expenses WHERE user_id = $1", [user.id]);
		return json({ ok: true });
	})
} } });
//#endregion
//#region src/routes/api/health.ts
/**
* Railway healthcheck target.
* Verifies the process is up AND that Postgres is reachable, so a
* deploy with a broken DATABASE_URL fails the healthcheck instead of
* serving 500s to users.
*/
var Route$10 = createFileRoute("/api/health")({ server: { handlers: { GET: async () => {
	try {
		await getPool().query("SELECT 1");
		return new Response(JSON.stringify({
			status: "ok",
			db: "up",
			time: (/* @__PURE__ */ new Date()).toISOString()
		}), { headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		} });
	} catch (error) {
		console.error("[health] db unreachable", error);
		return new Response(JSON.stringify({
			status: "degraded",
			db: "down"
		}), {
			status: 503,
			headers: {
				"content-type": "application/json",
				"cache-control": "no-store"
			}
		});
	}
} } } });
//#endregion
//#region src/routes/api/ledger.ts
/**
* Combined endpoint for accounts, categories, budgets and recurring rules.
*
* One route rather than four keeps the initial page load to a single request —
* the sidebar needs all of it at once, and on a cold Render instance every
* saved round trip is noticeable.
*/
var Route$9 = createFileRoute("/api/ledger")({ server: { handlers: {
	GET: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		if ((await listCategories(user.id)).length === 0) await seedDefaults(user.id);
		const materialised = await runDueRecurring(user.id);
		const [accounts, categories, budgets, recurring] = await Promise.all([
			listAccounts(user.id),
			listCategories(user.id),
			listBudgets(user.id),
			listRecurring(user.id)
		]);
		return json({
			accounts,
			categories,
			budgets,
			recurring,
			materialised
		});
	}),
	POST: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const limit = rateLimit(`ledger:write:${user.id}`, 60, 6e4);
		if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
		let body;
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid request." }, { status: 400 });
		}
		const action = String(body.action ?? "");
		switch (action) {
			case "createAccount": {
				const result = await createAccount(user.id, String(body.name ?? ""), String(body.kind ?? "cash"), String(body.color ?? "#e8a838"));
				if (!result.ok) return json({ error: result.error }, { status: 400 });
				return json({
					ok: true,
					id: result.id
				});
			}
			case "archiveAccount": {
				const id = await ownedAccountId(user.id, body.id);
				if (!id) return json({ error: "Account not found." }, { status: 404 });
				await query("UPDATE accounts SET archived = NOT archived WHERE id = $1::bigint", [id]);
				return json({ ok: true });
			}
			case "createCategory": {
				const result = await createCategory(user.id, String(body.name ?? ""), String(body.emoji ?? "📦"), String(body.color ?? "#e8a838"));
				if (!result.ok) return json({ error: result.error }, { status: 400 });
				return json({
					ok: true,
					id: result.id
				});
			}
			case "deleteCategory": {
				const id = String(body.id ?? "");
				if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });
				const result = await deleteCategory(user.id, id);
				if (!result.ok) return json({ error: result.error }, { status: 400 });
				return json({ ok: true });
			}
			case "setBudget": {
				const amount = Number(body.amount);
				const category = String(body.category ?? "").trim();
				if (!category) return json({ error: "Pick a category." }, { status: 400 });
				if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999) return json({ error: "Enter a valid budget amount." }, { status: 400 });
				await setBudget(user.id, category, Math.round(amount * 100) / 100);
				return json({ ok: true });
			}
			case "deleteBudget":
				await deleteBudget(user.id, String(body.category ?? ""));
				return json({ ok: true });
			case "createRecurring": {
				const amount = Number(body.amount);
				const cadence = String(body.cadence ?? "monthly");
				const category = String(body.category ?? "Other").slice(0, 30);
				if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999) return json({ error: "Enter a valid amount." }, { status: 400 });
				if (!CADENCES.has(cadence)) return json({ error: "Cadence must be daily, weekly or monthly." }, { status: 400 });
				const accountId = await ownedAccountId(user.id, body.accountId);
				const start = /* @__PURE__ */ new Date();
				start.setDate(start.getDate() + 1);
				await query(`INSERT INTO recurring
                 (user_id, amount, category, merchant, note, kind, account_id, cadence, next_run)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
					user.id,
					Math.round(amount * 100) / 100,
					category,
					String(body.merchant ?? "").slice(0, 80) || null,
					String(body.note ?? "").slice(0, 280),
					body.type === "income" ? "income" : "expense",
					accountId,
					cadence,
					start.toISOString().slice(0, 10)
				]);
				return json({ ok: true });
			}
			case "toggleRecurring": {
				const id = String(body.id ?? "");
				if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });
				if ((await query(`UPDATE recurring SET active = NOT active
                WHERE id = $1::bigint AND user_id = $2::uuid RETURNING id`, [id, user.id])).length === 0) return json({ error: "Not found." }, { status: 404 });
				return json({ ok: true });
			}
			case "deleteRecurring": {
				const id = String(body.id ?? "");
				if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });
				await query("DELETE FROM recurring WHERE id = $1::bigint AND user_id = $2::uuid", [id, user.id]);
				return json({ ok: true });
			}
			default: return json({ error: `Unknown action: ${action}` }, { status: 400 });
		}
	})
} } });
//#endregion
//#region src/routes/api/profile.ts
var GENDERS = /* @__PURE__ */ new Set([
	"",
	"male",
	"female",
	"non-binary",
	"prefer-not-to-say"
]);
var Route$8 = createFileRoute("/api/profile")({ server: { handlers: {
	/** Update name / bio / gender. */
	PATCH: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const limit = rateLimit(`profile:${user.id}`, 30, 6e4);
		if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
		let body;
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid request." }, { status: 400 });
		}
		const name = body.name === void 0 ? user.name : String(body.name).trim();
		const bio = body.bio === void 0 ? user.bio : String(body.bio);
		const gender = body.gender === void 0 ? user.gender : String(body.gender);
		if (!name) return json({ error: "Name cannot be empty." }, { status: 400 });
		if (name.length > 80) return json({ error: "Name is too long." }, { status: 400 });
		if (bio.length > 200) return json({ error: "Bio is too long." }, { status: 400 });
		if (!GENDERS.has(gender)) return json({ error: "Invalid gender value." }, { status: 400 });
		await query(`UPDATE users SET name = $1, bio = $2, gender = $3, updated_at = now()
            WHERE id = $4`, [
			name,
			bio,
			gender,
			user.id
		]);
		return json({
			ok: true,
			user: {
				...user,
				name,
				bio,
				gender
			}
		});
	}),
	/** Change password. Rotates every session. */
	PUT: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const limit = rateLimit(`pwchange:${user.id}`, 5, 9e5);
		if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
		let body;
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid request." }, { status: 400 });
		}
		const currentPassword = String(body.currentPassword ?? "");
		const newPassword = String(body.newPassword ?? "");
		if (newPassword.length < 8) return json({ error: "New password must be at least 8 characters." }, { status: 400 });
		if (newPassword.length > 200) return json({ error: "Password is too long." }, { status: 400 });
		const record = (await query("SELECT password_hash, password_salt FROM users WHERE id = $1", [user.id]))[0];
		if (!record) return unauthorized();
		if (!await verifyPassword(currentPassword, record.password_hash, record.password_salt)) return json({ error: "Current password is incorrect." }, { status: 403 });
		const { hash, salt } = await hashPassword(newPassword);
		await query(`UPDATE users SET password_hash = $1, password_salt = $2, updated_at = now()
            WHERE id = $3`, [
			hash,
			salt,
			user.id
		]);
		await destroyAllSessions(user.id);
		return json({ ok: true }, { headers: { "set-cookie": sessionCookie(await createSession(user.id)) } });
	}),
	/** Delete account and all data. */
	DELETE: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		await query("DELETE FROM users WHERE id = $1", [user.id]);
		return json({ ok: true }, { headers: { "set-cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` } });
	})
} } });
//#endregion
//#region src/routes/api/receipt.ts
var CATEGORIES$1 = [
	"Food",
	"Travel",
	"Education",
	"Entertainment",
	"Shopping",
	"Bills",
	"Other"
];
/** Images are large; the client downscales, but enforce a ceiling anyway. */
var MAX_IMAGE_BYTES = 6e6;
var RECEIPT_PROMPT = `You are reading a photo of a receipt or bill belonging to an Indian college student.

Extract every purchased line item you can read. Return ONLY a JSON object, no prose, no code fences:

{"merchant":"<shop name or null>","currency":"INR","items":[{"amount":<number>,"category":"<one of Food|Travel|Education|Entertainment|Shopping|Bills|Other>","note":"<short item description>"}],"total":<number or null>,"confidence":"high"|"medium"|"low"}

Rules:
- amount is a plain number in rupees. No symbols, no commas.
- Skip tax/discount/subtotal lines. Capture only real purchased items.
- If individual line items are unreadable but the total is clear, return a single item using the total, with note "receipt total" and confidence "low".
- Categorise the way an Indian student would: restaurant/grocery/cafe -> Food; cab, auto, fuel, metro -> Travel; stationery, books, printouts -> Education; cinema, games -> Entertainment; clothes, electronics -> Shopping; recharge, rent, utilities -> Bills; anything unclear -> Other.
- If the image is not a receipt or nothing is legible, return {"merchant":null,"currency":"INR","items":[],"total":null,"confidence":"low"}.`;
function extractJson(text) {
	const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
	const start = cleaned.indexOf("{");
	const end = cleaned.lastIndexOf("}");
	if (start === -1 || end <= start) return null;
	try {
		return JSON.parse(cleaned.slice(start, end + 1));
	} catch {
		return null;
	}
}
var Route$7 = createFileRoute("/api/receipt")({ server: { handlers: { POST: apiRoute(async ({ request }) => {
	const user = await requireUser(request);
	if (!user) return unauthorized();
	const limit = rateLimit(`receipt:${user.id}`, 15, 6e5);
	if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
	const overQuota = await checkReceiptQuota(user.id, user.plan);
	if (overQuota) return quotaResponse(overQuota);
	if (!process.env.AI_API_KEY) return json({
		error: "Receipt scanning is unavailable.",
		hint: "AI_API_KEY is not set."
	}, { status: 503 });
	const contentLength = request.headers.get("content-length");
	if (contentLength && Number(contentLength) > MAX_IMAGE_BYTES) return json({ error: "Image is too large. Try a smaller photo." }, { status: 413 });
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "Invalid request." }, { status: 400 });
	}
	const image = String(body.image ?? "");
	if (!image.startsWith("data:image/")) return json({ error: "Send a base64 data URL image." }, { status: 400 });
	if (image.length > MAX_IMAGE_BYTES) return json({ error: "Image is too large. Try a smaller photo." }, { status: 413 });
	const provider = createAIProvider();
	await recordUsage(user.id, "receipt_scan");
	let raw;
	try {
		raw = (await generateText({
			model: provider(getModelId()),
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text: RECEIPT_PROMPT
				}, {
					type: "image",
					image: new URL(image)
				}]
			}]
		})).text;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("[receipt] vision call failed", message);
		if (message.includes("429")) return json({ error: "Too many requests. Wait a moment and retry." }, { status: 429 });
		if (message.includes("401") || message.includes("403")) return json({
			error: "AI credentials are invalid.",
			hint: "Check AI_API_KEY."
		}, { status: 502 });
		return json({
			error: "Could not read that receipt.",
			hint: "The model may not support images. Check AI_MODEL supports vision."
		}, { status: 502 });
	}
	const parsed = extractJson(raw);
	if (!parsed) return json({ error: "Could not read that receipt. Try a clearer photo." }, { status: 422 });
	const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
	const items = [];
	for (const entry of rawItems.slice(0, 50)) {
		if (!entry || typeof entry !== "object") continue;
		const row = entry;
		const amount = Number(row.amount);
		if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999) continue;
		const category = CATEGORIES$1.includes(row.category) ? String(row.category) : "Other";
		items.push({
			amount: Math.round(amount * 100) / 100,
			category,
			note: String(row.note ?? "").slice(0, 280) || "receipt item"
		});
	}
	const merchant = typeof parsed.merchant === "string" && parsed.merchant.trim() ? parsed.merchant.trim().slice(0, 80) : null;
	const confidence = [
		"high",
		"medium",
		"low"
	].includes(String(parsed.confidence)) ? String(parsed.confidence) : "low";
	if (items.length === 0) return json({
		items: [],
		merchant,
		confidence: "low",
		message: "No expenses found in that image. Try a clearer photo of the receipt."
	});
	return json({
		items: items.map((item) => ({
			...item,
			merchant,
			type: "expense"
		})),
		merchant,
		confidence,
		total: items.reduce((sum, item) => sum + item.amount, 0)
	});
}) } } });
//#endregion
//#region src/routes/api/stats.ts
/**
* Dashboard aggregates.
*
* This is the route that makes 10GB survivable. The browser never receives
* raw rows — Postgres does the SUM/GROUP BY against the
* (user_id, occurred_at) index and returns at most 7 rows plus 4 scalars.
* Response size is constant no matter how many expenses the user has.
*/
var Route$6 = createFileRoute("/api/stats")({ server: { handlers: { GET: apiRoute(async ({ request }) => {
	const user = await requireUser(request);
	if (!user) return unauthorized();
	const [totalsRows, categoryRows] = await Promise.all([query(`SELECT
               COALESCE(SUM(amount) FILTER (WHERE kind = 'expense'), 0)::text AS total_spent,
               COALESCE(SUM(amount) FILTER (WHERE kind = 'expense'
                 AND occurred_at >= now() - interval '7 days'), 0)::text AS week_spent,
               COALESCE(SUM(amount) FILTER (WHERE kind = 'expense'
                 AND occurred_at >= date_trunc('month', now())), 0)::text AS month_spent,
               COALESCE(SUM(amount) FILTER (WHERE kind = 'income'), 0)::text AS total_income,
               COUNT(*) FILTER (WHERE kind = 'expense')::text AS expense_count
             FROM expenses
             WHERE user_id = $1`, [user.id]), query(`SELECT category, SUM(amount)::text AS amount
               FROM expenses
              WHERE user_id = $1 AND kind = 'expense'
              GROUP BY category
              ORDER BY SUM(amount) DESC`, [user.id])]);
	const totals = totalsRows[0];
	const totalSpent = Number(totals?.total_spent ?? 0);
	const byCategory = categoryRows.map((row) => {
		const amount = Number(row.amount);
		return {
			category: row.category,
			amount,
			pct: totalSpent > 0 ? Math.round(amount / totalSpent * 100) : 0
		};
	});
	return json({
		totalSpent,
		weekSpent: Number(totals?.week_spent ?? 0),
		monthSpent: Number(totals?.month_spent ?? 0),
		totalIncome: Number(totals?.total_income ?? 0),
		expenseCount: Number(totals?.expense_count ?? 0),
		byCategory
	});
}) } } });
//#endregion
//#region src/routes/api/timeline.ts
/**
* Timeline: spend bucketed by day, for one of four ranges.
*
* Uses `generate_series` for the x-axis so days with no spend still appear as
* zero bars — a jagged missing-day chart would misread as "you spent nothing
* that day was a good day" when it just means no data.
*
* All aggregation is in SQL. Response size is bounded by `days`, not by the
* expense table, so a user with 5 million expenses gets the same payload as
* a user with 5.
*/
var RANGES = {
	day: 1,
	"5day": 5,
	week: 7,
	month: 30
};
function parseRange(value) {
	return value && value in RANGES ? value : "week";
}
var Route$5 = createFileRoute("/api/timeline")({ server: { handlers: { GET: apiRoute(async ({ request }) => {
	const user = await requireUser(request);
	if (!user) return unauthorized();
	const range = parseRange(new URL(request.url).searchParams.get("range"));
	const days = RANGES[range];
	const [buckets, byCategory, [totals]] = await Promise.all([
		query(`WITH series AS (
               SELECT generate_series(
                 date_trunc('day', now()) - ($1::int - 1) * interval '1 day',
                 date_trunc('day', now()),
                 interval '1 day'
               )::date AS day
             )
             SELECT s.day,
                    COALESCE(SUM(e.amount) FILTER (WHERE e.kind = 'expense'), 0)::text AS amount
               FROM series s
               LEFT JOIN expenses e
                 ON e.user_id = $2
                AND e.occurred_at >= s.day
                AND e.occurred_at <  s.day + interval '1 day'
              GROUP BY s.day
              ORDER BY s.day`, [days, user.id]),
		query(`SELECT category, SUM(amount)::text AS amount
               FROM expenses
              WHERE user_id = $1
                AND kind = 'expense'
                AND occurred_at >= date_trunc('day', now()) - ($2::int - 1) * interval '1 day'
              GROUP BY category
              ORDER BY SUM(amount) DESC`, [user.id, days]),
		query(`WITH win AS (
               SELECT amount, kind, date_trunc('day', occurred_at) AS day
                 FROM expenses
                WHERE user_id = $1
                  AND occurred_at >= date_trunc('day', now()) - ($2::int - 1) * interval '1 day'
             ),
             daily AS (
               SELECT day, SUM(amount) FILTER (WHERE kind = 'expense') AS spent
                 FROM win GROUP BY day
             )
             SELECT
               COALESCE((SELECT SUM(amount) FROM win WHERE kind = 'expense'), 0)::text AS total,
               COALESCE((SELECT SUM(amount) FROM win WHERE kind = 'income'),  0)::text AS income,
               COALESCE((SELECT count(*)  FROM win WHERE kind = 'expense'),   0)::text AS count,
               (SELECT day FROM daily WHERE spent IS NOT NULL ORDER BY spent DESC LIMIT 1) AS peak_day,
               COALESCE((SELECT MAX(spent) FROM daily), 0)::text AS peak`, [user.id, days])
	]);
	const total = Number(totals?.total ?? 0);
	return json({
		range,
		days,
		total,
		income: Number(totals?.income ?? 0),
		count: Number(totals?.count ?? 0),
		avgPerDay: days > 0 ? Math.round(total / days * 100) / 100 : 0,
		peakAmount: Number(totals?.peak ?? 0),
		peakDay: totals?.peak_day ? new Date(totals.peak_day).toISOString() : null,
		buckets: buckets.map((b) => ({
			date: new Date(b.day).toISOString(),
			amount: Number(b.amount)
		})),
		byCategory: byCategory.map((c) => {
			const amount = Number(c.amount);
			return {
				category: c.category,
				amount,
				pct: total > 0 ? Math.round(amount / total * 100) : 0
			};
		})
	});
}) } } });
//#endregion
//#region src/routes/api/auth/login.ts
var Route$4 = createFileRoute("/api/auth/login")({ server: { handlers: { POST: apiRoute(async ({ request }) => {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "Invalid request." }, { status: 400 });
	}
	const email = String(body.email ?? "").trim().toLowerCase();
	const password = String(body.password ?? "");
	const ipLimit = rateLimit(`login:ip:${clientIp(request)}`, 20, 9e5);
	if (!ipLimit.allowed) return tooManyRequests(ipLimit.retryAfterSeconds);
	if (email) {
		const acctLimit = rateLimit(`login:acct:${email}`, 10, 9e5);
		if (!acctLimit.allowed) return tooManyRequests(acctLimit.retryAfterSeconds);
	}
	if (!email || !password) return json({ error: "Email and password are required." }, { status: 400 });
	const user = (await query("SELECT id, password_hash, password_salt FROM users WHERE email = $1 LIMIT 1", [email]))[0];
	const valid = user ? await verifyPassword(password, user.password_hash, user.password_salt) : await verifyPassword(password, "00".repeat(64), "decoy");
	if (!user || !valid) return json({ error: "Invalid email or password." }, { status: 401 });
	return json({ ok: true }, { headers: { "set-cookie": sessionCookie(await createSession(user.id)) } });
}) } } });
//#endregion
//#region src/routes/api/auth/logout.ts
var Route$3 = createFileRoute("/api/auth/logout")({ server: { handlers: { POST: apiRoute(async ({ request }) => {
	await destroySession(readCookie(request, SESSION_COOKIE));
	return json({ ok: true }, { headers: { "set-cookie": clearCookie() } });
}) } } });
//#endregion
//#region src/routes/api/auth/me.ts
var Route$2 = createFileRoute("/api/auth/me")({ server: { handlers: { GET: apiRoute(async ({ request }) => {
	const user = await requireUser(request);
	if (!user) return unauthorized();
	return json({ user });
}) } } });
//#endregion
//#region src/routes/api/auth/signup.ts
var AVATAR_COLORS = [
	"#e8a838",
	"#4ade80",
	"#6366f1",
	"#f87171",
	"#a78bfa",
	"#38bdf8",
	"#fb923c",
	"#f472b6"
];
function pickColor(email) {
	let hash = 0;
	for (let i = 0; i < email.length; i++) hash = hash * 31 + email.charCodeAt(i) | 0;
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
var Route$1 = createFileRoute("/api/auth/signup")({ server: { handlers: { POST: apiRoute(async ({ request }) => {
	const limit = rateLimit(`signup:${clientIp(request)}`, 5, 36e5);
	if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "Invalid request." }, { status: 400 });
	}
	const email = String(body.email ?? "").trim().toLowerCase();
	const name = String(body.name ?? "").trim();
	const password = String(body.password ?? "");
	if (!email || !name || !password) return json({ error: "All fields are required." }, { status: 400 });
	if (name.length > 80) return json({ error: "Name is too long." }, { status: 400 });
	if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Please enter a valid email." }, { status: 400 });
	if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, { status: 400 });
	if (password.length > 200) return json({ error: "Password is too long." }, { status: 400 });
	const { hash, salt } = await hashPassword(password);
	let userId;
	try {
		userId = (await query(`INSERT INTO users (email, name, password_hash, password_salt, avatar_color)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`, [
			email,
			name,
			hash,
			salt,
			pickColor(email)
		]))[0].id;
	} catch (error) {
		if (error.code === "23505") return json({ error: "An account with this email already exists." }, { status: 409 });
		throw error;
	}
	await seedDefaults(userId);
	return json({ ok: true }, { headers: { "set-cookie": sessionCookie(await createSession(userId)) } });
}) } } });
//#endregion
//#region src/routes/api/expenses.$id.ts
var CATEGORIES = /* @__PURE__ */ new Set([
	"Food",
	"Travel",
	"Education",
	"Entertainment",
	"Shopping",
	"Bills",
	"Other"
]);
/** Pulls the trailing path segment: /api/expenses/123 -> "123". */
function expenseIdFrom(request) {
	const path = new URL(request.url).pathname.replace(/\/+$/, "");
	return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1));
}
/**
* Single-expense operations.
*
* Every statement filters on user_id as well as id, so a user cannot edit
* or delete another user's row even if they guess the id. Ownership is
* enforced in the WHERE clause rather than a separate lookup — one query,
* no race between the check and the write.
*/
var Route = createFileRoute("/api/expenses/$id")({ server: { handlers: {
	PATCH: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const limit = rateLimit(`expense:edit:${user.id}`, 60, 6e4);
		if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
		const id = expenseIdFrom(request);
		if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });
		let body;
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid request." }, { status: 400 });
		}
		const sets = [];
		const values = [];
		if (body.amount !== void 0) {
			const amount = Number(body.amount);
			if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999) return json({ error: "Amount must be between 1 and 99,999,999." }, { status: 400 });
			values.push(Math.round(amount * 100) / 100);
			sets.push(`amount = $${values.length}`);
		}
		if (body.category !== void 0) {
			const category = String(body.category);
			if (!CATEGORIES.has(category)) return json({ error: "Unknown category." }, { status: 400 });
			values.push(category);
			sets.push(`category = $${values.length}`);
		}
		if (body.merchant !== void 0) {
			const merchant = body.merchant === null ? null : String(body.merchant).slice(0, 80);
			values.push(merchant || null);
			sets.push(`merchant = $${values.length}`);
		}
		if (body.note !== void 0) {
			values.push(String(body.note).slice(0, 280));
			sets.push(`note = $${values.length}`);
		}
		if (body.type !== void 0) {
			const kind = body.type === "income" ? "income" : "expense";
			values.push(kind);
			sets.push(`kind = $${values.length}`);
		}
		if (sets.length === 0) return json({ error: "Nothing to update." }, { status: 400 });
		values.push(id, user.id);
		if ((await query(`UPDATE expenses SET ${sets.join(", ")}
            WHERE id = $${values.length - 1}::bigint AND user_id = $${values.length}::uuid
            RETURNING id`, values)).length === 0) return json({ error: "Expense not found." }, { status: 404 });
		return json({ ok: true });
	}),
	DELETE: apiRoute(async ({ request }) => {
		const user = await requireUser(request);
		if (!user) return unauthorized();
		const limit = rateLimit(`expense:del:${user.id}`, 60, 6e4);
		if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);
		const id = expenseIdFrom(request);
		if (!/^\d+$/.test(id)) return json({ error: "Bad id." }, { status: 400 });
		if ((await query(`DELETE FROM expenses
            WHERE id = $1::bigint AND user_id = $2::uuid
            RETURNING id`, [id, user.id])).length === 0) return json({ error: "Expense not found." }, { status: 404 });
		return json({ ok: true });
	})
} } });
//#endregion
//#region src/routeTree.gen.ts
var IndexRoute = Route$18.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$19
});
var AppRoute = Route$17.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => Route$19
});
var AuthRoute = Route$16.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$19
});
var SitemapDotxmlRoute = Route$15.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$19
});
var ApiBillingRoute = Route$14.update({
	id: "/api/billing",
	path: "/api/billing",
	getParentRoute: () => Route$19
});
var ApiChatRoute = Route$13.update({
	id: "/api/chat",
	path: "/api/chat",
	getParentRoute: () => Route$19
});
var ApiChatHistoryRoute = Route$12.update({
	id: "/api/chat-history",
	path: "/api/chat-history",
	getParentRoute: () => Route$19
});
var ApiExpensesRoute = Route$11.update({
	id: "/api/expenses",
	path: "/api/expenses",
	getParentRoute: () => Route$19
});
var ApiHealthRoute = Route$10.update({
	id: "/api/health",
	path: "/api/health",
	getParentRoute: () => Route$19
});
var ApiLedgerRoute = Route$9.update({
	id: "/api/ledger",
	path: "/api/ledger",
	getParentRoute: () => Route$19
});
var ApiProfileRoute = Route$8.update({
	id: "/api/profile",
	path: "/api/profile",
	getParentRoute: () => Route$19
});
var ApiReceiptRoute = Route$7.update({
	id: "/api/receipt",
	path: "/api/receipt",
	getParentRoute: () => Route$19
});
var ApiStatsRoute = Route$6.update({
	id: "/api/stats",
	path: "/api/stats",
	getParentRoute: () => Route$19
});
var ApiTimelineRoute = Route$5.update({
	id: "/api/timeline",
	path: "/api/timeline",
	getParentRoute: () => Route$19
});
var ApiAuthLoginRoute = Route$4.update({
	id: "/api/auth/login",
	path: "/api/auth/login",
	getParentRoute: () => Route$19
});
var ApiAuthLogoutRoute = Route$3.update({
	id: "/api/auth/logout",
	path: "/api/auth/logout",
	getParentRoute: () => Route$19
});
var ApiAuthMeRoute = Route$2.update({
	id: "/api/auth/me",
	path: "/api/auth/me",
	getParentRoute: () => Route$19
});
var ApiAuthSignupRoute = Route$1.update({
	id: "/api/auth/signup",
	path: "/api/auth/signup",
	getParentRoute: () => Route$19
});
var ApiExpensesRouteChildren = { ApiExpensesIdRoute: Route.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ApiExpensesRoute
}) };
var rootRouteChildren = {
	IndexRoute,
	AppRoute,
	AuthRoute,
	SitemapDotxmlRoute,
	ApiBillingRoute,
	ApiChatRoute,
	ApiChatHistoryRoute,
	ApiExpensesRoute: ApiExpensesRoute._addFileChildren(ApiExpensesRouteChildren),
	ApiHealthRoute,
	ApiLedgerRoute,
	ApiProfileRoute,
	ApiReceiptRoute,
	ApiStatsRoute,
	ApiTimelineRoute,
	ApiAuthLoginRoute,
	ApiAuthLogoutRoute,
	ApiAuthMeRoute,
	ApiAuthSignupRoute
};
var routeTree = Route$19._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };

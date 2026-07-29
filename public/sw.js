/**
 * PaisaWise service worker.
 *
 * Deliberately conservative. This app's value is accurate financial data, so
 * the one thing that must never happen is showing stale balances as if they
 * were current.
 *
 * Strategy:
 *   - API requests: network only. Never cached, never served stale.
 *   - Build assets (/assets/*, hashed filenames): cache first, they are immutable.
 *   - Navigations: network first, falling back to a cached offline page.
 *
 * The Render free tier sleeps after inactivity, so the cached shell also
 * covers the ~60s cold start with something better than a blank tab.
 */

const VERSION = "paisawise-v1";
const ASSET_CACHE = `${VERSION}-assets`;
const SHELL_CACHE = `${VERSION}-shell`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Financial data is never served from cache.
  if (url.pathname.startsWith("/api/")) return;

  // Hashed build output is immutable — cache first.
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Page navigations: try the network, fall back to the offline shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((hit) => hit || new Response("Offline", { status: 503 })),
      ),
    );
  }
});

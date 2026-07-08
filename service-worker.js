const CACHE_NAME = "africke-koprivy-pwa-v20260630-171";
const APP_SHELL = [
  "./",
  "./index.html",
  "./mobile.html",
  "./styles.css",
  "./mobile-app.css",
  "./app.js",
  "./mobile-app.js",
  "./brand-logo-data.js",
  "./seed-data.js",
  "./manifest.webmanifest",
  "./manifest-desktop.webmanifest",
  "./assets/brand-africke-koprivy.jpg",
  "./assets/brand-africke-koprivy.ico",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./vendor/lzma1-browser-setup.js",
  "./vendor/lzma.js",
  "./vendor/lzma1-browser-expose.js",
  "./vendor/pay-by-square.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return caches.match(requestUrl.pathname.endsWith("mobile.html") ? "./mobile.html" : "./index.html");
        })
      )
  );
});

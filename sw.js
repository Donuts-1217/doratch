const CACHE = "doratch-app-v1";
const SHELL = [
  "./app.html",
  "./doratch-mobile-shell.js",
  "./doratch-mobile-shell.css",
  "./manifest.json",
  "./icons/icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./responsive-global.css"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      const fetchPromise = fetch(e.request)
        .then(function (res) {
          if (res && res.status === 200 && (url.pathname.endsWith(".js") || url.pathname.endsWith(".css"))) {
            const copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          }
          return res;
        })
        .catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});

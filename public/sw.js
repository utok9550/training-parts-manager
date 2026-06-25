const CACHE_NAME = "training-parts-manager-v4";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

function fetchAndCache(request) {
  return fetch(request).then((response) => {
    const responseClone = response.clone();
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, responseClone);
    });
    return response;
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetchAndCache(event.request)
        .catch(() => caches.match("./")),
    );
    return;
  }

  event.respondWith(
    fetchAndCache(event.request).catch(() => caches.match(event.request)),
  );
});

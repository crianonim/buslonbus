const version="191112.1";
const cacheName = "bus";
const files = [
  "/",
  "/index.html",
  "/index.js",
  "/elements.js",
  "/style.css",
  "/storage.js",
  "/service.js",
  "/dom.js",
  "/img/cancel.svg",
  "/img/gps.svg",
  "/img/dial.svg",
  "/img/star.svg",
  "/img/update.svg"

];

self.addEventListener("install", e => {
  console.log("[ServiceWorker] Install");
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log("[ServiceWorker] Caching app shell");
      return cache.addAll(files);
    })
  );
});

self.addEventListener("activate", event => {
    console.log("Activate")
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    console.log("FETCH",event)
    event.respondWith(
      caches.match(event.request, {ignoreSearch:true}).then(response => {
          console.log("RESPONDING WITH",response,"OR",event.request)
        return response || fetch(event.request);
      })
    );
  });
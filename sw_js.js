// تغيير رقم الإصدار لإجبار المتصفح على مسح الكاش القديم فوراً
const CACHE_NAME = 'josour-live-v4-force-update';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// الاعتماد دائماً على الشبكة أولاً للحصول على أحدث ملف من GitHub
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, clone);
          }
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
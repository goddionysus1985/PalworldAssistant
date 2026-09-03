// ============================================================
//  PALWORLD ASSISTANT — Service Worker (PWA Offline Cache)
// ============================================================

const CACHE_NAME = 'pal-assistant-v1.4.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './favicon.svg',
  './manifest.json',
  './data.js',
  './data_extended.js',
  './pal_images.js',
  './app.js',
  './app_extended.js',
  './pal_modal.js',
  './merchants_data.js',
  './base_analyzer.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Для сетевых запросов используем стратегию Stale-While-Revalidate
  // Исключаем iframe карты MapGenie от принудительного кэширования
  if (e.request.url.includes('mapgenie.io')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Фоновое обновление кэша
        fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Офлайн фоллбэк
        return caches.match('./index.html');
      });
    })
  );
});

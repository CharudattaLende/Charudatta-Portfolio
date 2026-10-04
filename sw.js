/**
 * Charudatta Lende Portfolio - Service Worker
 * Enables Progressive Web App (PWA) installability, instant loading, and offline caching
 */

const CACHE_NAME = 'charudatta-portfolio-v1.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/portfolio-data.js',
  '/lenis.min.js',
  '/manifest.webmanifest',
  '/assets/icon.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/ezgif-frame-001.webp',
  '/ezgif-frame-001.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache partial fail:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Ignore non-GET requests or external analytics
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);

  // Network-first for HTML pages so changes on GitHub/Vercel reflect immediately
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first with network fallback for images and static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and refresh in background
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for offline images
        if (request.destination === 'image') {
          return caches.match('/assets/icon-192.png');
        }
      });
    })
  );
});

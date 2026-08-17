// ============================================================
//  VirtuLab Kenya — Progressive Web App (PWA) Service Worker
//  Feature #1: Offline Support, Smart Caching & Sync
// ============================================================

const CACHE_NAME = 'virtulab-kenya-v13';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/shared/style.css',
  '/shared/auth.css',
  '/shared/pwa-installer.css',
  '/shared/pwa-installer.js',
  '/shared/api.js',
  '/shared/auth-forms.js',
  '/shared/modal.js',
  '/shared/i18n.js',
  '/shared/theme.js',
  '/shared/timer.js',
  '/shared/chemical-safety.js',
  '/shared/knec-grading.js',
  '/shared/audio-synth.js',
  '/shared/notifications-engine.js',
  '/shared/ai-tutor.css',
  '/shared/ai-tutor.js',
  '/shared/icon-192.png',
  '/shared/icon-512.png',
  '/shared/icon-512-maskable.png',
  '/shared/apple-touch-icon.png',
  '/student/home.html',
  '/student/lab.html',
  '/student/qualitative.html',
  '/student/organic.html',
  '/student/solubility.html',
  '/student/history.html',
  '/student/login.html',
  '/student/register.html',
  '/student/composite_exam.html',
  '/student/certificate.html',
  '/student/speed_battle.html',
  '/student/css/lab.css',
  '/student/css/dashboard.css',
  '/student/css/organic.css',
  '/student/css/qualitative.css',
  '/student/css/speed-battle.css',
  '/student/css/solubility.css',
  '/student/js/titration-workbench.js',
  '/student/js/qualitative-engine.js',
  '/student/js/organic-engine.js',
  '/student/js/solubility-engine.js',
  '/student/js/student-dashboard.js',
  '/student/js/speed-battle.js',
  '/teacher/login.html',
  '/teacher/register.html',
  '/teacher/dashboard.html',
  '/teacher/css/dashboard.css',
  '/teacher/js/teacher-dashboard.js',
  '/admin/dashboard.html'
];

// Install Event — precache core offline assets with individual error tolerance
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Precaching core assets for offline usage...');
      const results = await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[Service Worker] Warning: Precache skipped for ${url}:`, err.message);
          })
        )
      );
      return results;
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — cleanup old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Cache-First for static assets, Network-First for API requests with offline fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for API calls (/api/*) — try network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Offline Mode: Your submission will be synchronized when connection is restored.',
            offline: true
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 503 }
        );
      })
    );
    return;
  }

  // Cache-first strategy for HTML, CSS, JS, and image static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset, update cache silently in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // If asset is not in cache, fetch over network, then cache
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for navigation HTML requests when completely offline
        if (event.request.mode === 'navigate') {
          return caches.match('/student/home.html');
        }
      });
    })
  );
});


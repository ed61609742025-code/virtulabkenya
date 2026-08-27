// ============================================================
//  VirtuLab Kenya — Progressive Web App (PWA) Service Worker
//  Feature #1: Offline Support, Smart Caching & Sync
// ============================================================

const CACHE_NAME = 'virtulab-kenya-v55';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/shared/style.css',
  '/shared/brilliant-theme.css',
  '/shared/brilliant-ui.js',
  '/shared/tutorial-engine.css',
  '/shared/tutorial-engine.js',
  '/shared/gamification-engine.css',
  '/shared/gamification-engine.js',
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
  '/shared/survey-tam.js',
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
  '/student/energy.html',
  '/student/energy_theory.html',
  '/student/rates.html',
  '/student/rates_theory.html',
  '/student/gas_prep.html',
  '/student/cpcat_assessment.html',
  '/student/survey_sus.html',
  '/student/survey_tam.html',
  '/student/history.html',
  '/student/login.html',
  '/student/register.html',
  '/student/composite_exam.html',
  '/student/mock_exams.html',
  '/student/certificate.html',
  '/student/speed_battle.html',
  '/student/css/lab.css',
  '/student/css/dashboard.css',
  '/student/css/skill-tree.css',
  '/student/css/organic.css',
  '/student/css/qualitative.css',
  '/student/css/solubility.css',
  '/student/css/energy.css',
  '/student/css/rates.css',
  '/student/css/gas-prep.css',
  '/student/css/composite_exam.css',
  '/student/css/speed-battle.css',
  '/shared/page-transitions.js',
  '/student/js/skill-tree.js',
  '/student/js/titration-workbench.js',
  '/student/js/qualitative-engine.js',
  '/student/js/organic-engine.js',
  '/student/js/solubility-engine.js',
  '/student/js/energy-engine.js',
  '/student/js/rates-engine.js',
  '/student/js/gas-prep-engine.js',
  '/student/js/cpcat-engine.js',
  '/student/js/composite-engine.js',
  '/student/js/survey-sus.js',
  '/student/js/student-dashboard.js',
  '/student/js/speed-battle.js',
  '/teacher/login.html',
  '/teacher/register.html',
  '/teacher/dashboard.html',
  '/teacher/research_portal.html',
  '/teacher/survey_tam.html',
  '/teacher/css/dashboard.css',
  '/teacher/js/teacher-dashboard.js',
  '/teacher/js/research-portal.js',
  '/admin/dashboard.html',
  '/admin/css/admin.css'
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

// Trim cache if it exceeds maximum allowable items
const MAX_DYNAMIC_CACHE_ITEMS = 120;
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

// Fetch Event — Cache-First for static assets, Network-First for API requests with offline fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for non-GET requests and API calls (/api/*)
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
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
    }
    return;
  }

  // Only handle same-origin static assets
  if (url.origin !== self.location.origin) {
    return;
  }

  const isHtmlOrScript = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if (isHtmlOrScript) {
    // Network-First Strategy for HTML, JS and CSS (always fresh online, fallback to cache when offline)
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
            trimCache(CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS).catch(() => {});
          });
        }
        return networkResponse;
      }).catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          const reqPath = url.pathname.toLowerCase();
          if (reqPath.startsWith('/teacher/')) {
            return (await caches.match('/teacher/dashboard.html')) || (await caches.match('/teacher/login.html'));
          }
          if (reqPath.startsWith('/admin/')) {
            return await caches.match('/admin/dashboard.html');
          }
          if (reqPath.startsWith('/student/')) {
            return await caches.match('/student/home.html');
          }
          return (await caches.match('/index.html')) || (await caches.match('/student/home.html'));
        }
      })
    );
  } else {
    // Cache-First Strategy for static media/fonts/icons
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                trimCache(CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS).catch(() => {});
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              trimCache(CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS).catch(() => {});
            });
          }
          return networkResponse;
        });
      })
    );
  }
});


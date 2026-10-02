// ============================================================
//  VirtuLab Kenya — Progressive Web App (PWA) Service Worker
//  Feature #1: Offline Support, Smart Caching & Sync
// ============================================================

const CACHE_NAME = 'virtulab-kenya-v125';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/terms.html',
  '/privacy.html',
  '/manifest.json',
  '/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  '/shared/auth-guard.js',
  '/shared/style.css',
  '/shared/knec-graph-plotter.css',
  '/shared/knec-graph-plotter.js',
  '/shared/knec-pedagogy.js',
  '/shared/qualitative-bench-core.js',
  '/shared/organic-bench-core.js',
  '/shared/rates-bench-core.js',
  '/shared/energy-bench-core.js',
  '/shared/solubility-bench-core.js',
  '/shared/gas-prep-bench-core.js',
  '/shared/brilliant-theme.css',
  '/shared/brilliant-ui.js',
  '/shared/tutorial-engine.css',
  '/shared/tutorial-engine.js',
  '/shared/gamification-engine.css',
  '/shared/gamification-engine.js',
  '/shared/auth.css',
  '/shared/pwa-installer.css',
  '/shared/pwa-installer.js',
  '/shared/subscription-ui.css',
  '/shared/subscription-ui.js',
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
  '/shared/push-manager.js',
  '/shared/survey-tam.js',
  '/shared/ai-tutor.css',
  '/shared/ai-tutor.js',
  '/shared/virtulab-logo.svg',
  '/shared/virtulab-logo.png',
  '/shared/chemistry_hero_badge.jpg',
  '/shared/config.js',
  '/shared/icon-192.png',
  '/shared/icon-512.png',
  '/shared/icon-512-maskable.png',
  '/shared/apple-touch-icon.png',
  '/student/home.html',
  '/student/lab.html',
  '/student/titration_theory.html',
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
  '/student/css/mobile.css',
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
  '/student/js/kcse-past-papers-data.js',
  '/student/js/exam-offline-manager.js',
  '/student/js/composite-exam-ui.js',
  '/student/js/survey-sus.js',
  '/student/js/student-dashboard.js',
  '/student/js/speed-battle.js',
  '/student/js/home.js',
  '/student/js/history.js',
  '/teacher/login.html',
  '/teacher/register.html',
  '/teacher/dashboard.html',
  '/teacher/research_portal.html',
  '/teacher/survey_tam.html',
  '/teacher/css/dashboard.css',
  '/teacher/js/teacher-dashboard.js',
  '/teacher/js/research-portal.js',
  '/teacher/js/ai-exam-assistant.js',
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
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      const excess = keys.slice(0, keys.length - maxItems);
      await Promise.all(excess.map(key => cache.delete(key)));
    }
  } catch (err) {
    console.warn('[Service Worker] trimCache note:', err.message);
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

  // Precached cross-origin assets (e.g. Chart.js CDN for offline graphs)
  if (url.origin !== self.location.origin) {
    if (url.hostname.includes('cdnjs.cloudflare.com') || PRECACHE_ASSETS.includes(event.request.url)) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          }).catch(() => {
            return new Response('/* Offline fallback for cross-origin CDN asset */', {
              status: 200,
              headers: { 'Content-Type': 'application/javascript' }
            });
          });
        })
      );
    }
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

// ============================================================
//  Feature #2: Web Push Notifications & Click Navigation
// ============================================================

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'VirtuLab Kenya', body: event.data.text() };
    }
  }

  const title = data.title || 'VirtuLab Kenya Alert';
  const isHighUrgency = data.urgency === 'high' || data.priority === 'high';
  const renotify = typeof data.renotify === 'boolean' ? data.renotify : isHighUrgency;
  const vibratePattern = data.silent ? [] : (data.vibrate || (isHighUrgency ? [200, 100, 200, 100, 200] : [150, 80, 150]));

  const options = {
    body: data.body || 'You have a new update in your laboratory.',
    icon: data.icon || '/shared/icon-192.png',
    badge: data.badge || '/shared/icon-192.png',
    image: data.image || null,
    data: data.data || { url: '/student/home.html' },
    tag: data.tag || (isHighUrgency ? 'vlk-push-urgent-' + Date.now() : 'vlk-push-general'),
    renotify: renotify,
    silent: !!data.silent,
    vibrate: vibratePattern,
    actions: data.actions || [
      { action: 'open', title: 'Open Lab' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || '/student/home.html';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Broadcast to open clients that notification was clicked
      clientList.forEach((client) => {
        try {
          client.postMessage({ type: 'VLK_PUSH_CLICKED', url: targetUrl, data: notifData });
        } catch (e) {}
      });

      for (const client of clientList) {
        if (client.url && client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clientList.length > 0 && 'focus' in clientList[0] && 'navigate' in clientList[0]) {
        return clientList[0].focus().then(() => clientList[0].navigate(targetUrl));
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  const notifData = (event.notification && event.notification.data) || {};
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      clientList.forEach((client) => {
        try {
          client.postMessage({ type: 'VLK_PUSH_DISMISSED', data: notifData });
        } catch (e) {}
      });
    }).catch(() => {})
  );
});




---
name: pwa-and-offline-architecture
description: >-
  Comprehensive guide for Progressive Web Apps (PWA) and offline-first architectures. Use when implementing or debugging Service Workers, precaching, cache invalidation strategies, web app manifests, background sync, offline fallback UI, or mobile PWA install prompts.
---

# Progressive Web Apps (PWA) & Offline-First Engineering

You are an expert in Progressive Web App (PWA) architecture, service workers, and client-side offline storage.

## Core Directives

1. **Unbreakable Offline Resilience**: Core educational content, simulations, and UI shells must remain functional without an active internet connection.
2. **Deterministic Caching**: Avoid unbounded cache growth. Cache versions must be explicitly hashed or versioned, and stale caches purged upon activation.
3. **Graceful Network Degradation**: Distinguish between static assets, volatile API data, and student progress mutations.

---

## 1. Caching Strategies & Implementation

### A. Cache-First (Fastest for Immutable / Static Assets)
Use for: Core application shell (`index.html`, app CSS, JavaScript bundles, simulation SVG apparatus assets, local fonts).
```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin && isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  }
});
```

### B. Network-First with Offline Fallback (For Dynamic APIs)
Use for: KCSE exam scores, student roster, live assignments.
```javascript
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ 
      offline: true, 
      message: 'You are currently offline. Local offline mode is active.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### C. Stale-While-Revalidate (For Semi-Static Curriculum Data)
Use for: Chemistry reference tables, indicator pH color scales, titration standard constants. Returns cached data instantly for zero latency, while silently refreshing the cache in the background.

---

## 2. Service Worker Lifecycle & Invalidation

### Installation & Precaching
```javascript
const CACHE_VERSION = 'virtulab-v2.4.0';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/client/student/index.html',
        '/client/shared/css/design-system.css',
        '/client/shared/js/api.js',
        '/manifest.json',
        '/favicon.ico'
      ]);
    }).then(() => self.skipWaiting())
  );
});
```

### Activation & Purging Obsolete Caches
```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('static-') && name !== STATIC_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});
```

---

## 3. Web App Manifest Standards

Ensure `manifest.json` provides complete metadata for mobile installation (Add to Home Screen / PWA):
```json
{
  "name": "VirtuLab Kenya",
  "short_name": "VirtuLab",
  "description": "Virtual Chemistry Laboratory for KCSE Practical Science",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#2563eb",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 4. Offline UX & Connectivity Indicators

- Always display a non-intrusive offline pill/banner when `!navigator.onLine`.
- Store pending experiment submissions or offline exam answers in `IndexedDB`.
- Listen to `window.addEventListener('online', syncPendingSubmissions)` to replay queued actions seamlessly once connectivity resumes.

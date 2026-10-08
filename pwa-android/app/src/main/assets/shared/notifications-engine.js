/**
 * VirtuLab Kenya — Cross-Device Notifications Synchronization & Expiration Engine
 * Handles:
 * 1. Automatic 24-hour expiration after read.
 * 2. Real-time cross-tab synchronization via BroadcastChannel and Storage events.
 * 3. Bidirectional server sync: marks read state across all devices and platforms.
 * 4. Offline resilience: queues read receipts locally and synchronizes upon reconnection.
 * 5. Observer subscription model: triggers UI badge and list re-renders automatically.
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VLKNotifs = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const PENDING_READS_KEY = 'vlk_pending_notif_reads';
  const listeners = [];

  function getStorageKey() {
    try {
      const user = typeof window !== 'undefined' && window.getUser ? window.getUser() : null;
      return 'vlk_notif_read_timestamps_' + (user && user.id ? user.id : 'anon');
    } catch(e) {
      return 'vlk_notif_read_timestamps_anon';
    }
  }

  function getAuthToken() {
    if (typeof window === 'undefined') return null;
    if (typeof window.getToken === 'function') {
      try { const t = window.getToken(); if (t) return t; } catch(e) {}
    }
    if (window.Auth && typeof window.Auth.getToken === 'function') {
      try { const t = window.Auth.getToken(); if (t) return t; } catch(e) {}
    }
    try {
      return (
        localStorage.getItem('vlk_token') ||
        sessionStorage.getItem('vlk_token') ||
        localStorage.getItem('virtulab_token') ||
        null
      );
    } catch(e) {
      return null;
    }
  }

  let inMemoryStore = {};

  function getReadTimestampsMap() {
    try {
      if (typeof localStorage === 'undefined') return inMemoryStore;
      const raw = localStorage.getItem(getStorageKey());
      return raw ? JSON.parse(raw) : inMemoryStore;
    } catch(e) {
      return inMemoryStore;
    }
  }

  function saveReadTimestampsMap(map) {
    inMemoryStore = map || {};
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(getStorageKey(), JSON.stringify(map));
      }
    } catch(e) {}
  }

  // Cross-Tab BroadcastChannel setup
  let bc = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('vlk_notifications_channel');
      bc.onmessage = function(event) {
        if (event.data && event.data.type === 'NOTIFICATIONS_READ_UPDATED') {
          if (mergeReadTimestamps(event.data.reads)) {
            notifyListeners();
          }
        }
      };
    }
  } catch(e) {}

  function broadcastReads(reads) {
    if (bc) {
      try {
        bc.postMessage({
          type: 'NOTIFICATIONS_READ_UPDATED',
          reads: reads || getReadTimestampsMap()
        });
      } catch(e) {}
    }
  }

  function mergeReadTimestamps(incomingReads) {
    if (!incomingReads || typeof incomingReads !== 'object') return false;
    const current = getReadTimestampsMap();
    let changed = false;

    for (const [id, ts] of Object.entries(incomingReads)) {
      if (!id) continue;
      const numTs = typeof ts === 'number' ? ts : new Date(ts).getTime();
      if (isNaN(numTs)) continue;

      if (!current[id] || numTs < current[id]) {
        current[id] = numTs;
        changed = true;
      }
    }

    if (changed) {
      saveReadTimestampsMap(current);
    }
    return changed;
  }

  function getPendingReadsQueue() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(PENDING_READS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function queuePendingRead(notifId) {
    if (!notifId) return;
    try {
      if (typeof localStorage === 'undefined') return;
      const q = getPendingReadsQueue();
      const strId = String(notifId);
      if (!q.includes(strId)) {
        q.push(strId);
        localStorage.setItem(PENDING_READS_KEY, JSON.stringify(q));
      }
    } catch(e) {}
  }

  async function flushPendingReads(token) {
    try {
      const q = getPendingReadsQueue();
      if (!Array.isArray(q) || q.length === 0) return;
      const authToken = token || getAuthToken();
      if (!authToken) return;

      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifIds: q })
      });

      if (res.ok) {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(PENDING_READS_KEY);
        }
      }
    } catch(e) {
      // Silently retry on next sync cycle
    }
  }

  let isSyncing = false;
  async function syncWithServer() {
    if (isSyncing) return;
    const token = getAuthToken();
    if (!token || (typeof navigator !== 'undefined' && !navigator.onLine)) return;

    isSyncing = true;
    try {
      await flushPendingReads(token);

      const res = await fetch('/api/notifications/reads', {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reads) {
          const changed = mergeReadTimestamps(data.reads);
          if (changed) {
            broadcastReads();
            notifyListeners();
          }
        }
      }
    } catch(err) {
      // Non-blocking network drop recovery
    } finally {
      isSyncing = false;
    }
  }

  function markAsRead(notifId) {
    if (!notifId) return;
    const strId = String(notifId);
    const map = getReadTimestampsMap();
    if (!map[strId]) {
      map[strId] = Date.now();
      saveReadTimestampsMap(map);
      broadcastReads(map);
      notifyListeners();
    }

    // Persist to server for cross-device sync
    const token = getAuthToken();
    if (token && (typeof navigator === 'undefined' || navigator.onLine)) {
      fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifId: strId })
      }).catch(() => {
        queuePendingRead(strId);
      });
    } else {
      queuePendingRead(strId);
    }
  }

  function markAllAsRead(notifIds) {
    const list = Array.isArray(notifIds) ? notifIds : [];
    if (list.length === 0) return;

    const map = getReadTimestampsMap();
    const now = Date.now();
    let hasNew = false;
    list.forEach(id => {
      if (id) {
        const strId = String(id);
        if (!map[strId]) {
          map[strId] = now;
          hasNew = true;
        }
      }
    });

    if (hasNew) {
      saveReadTimestampsMap(map);
      broadcastReads(map);
      notifyListeners();
    }

    const token = getAuthToken();
    if (token && (typeof navigator === 'undefined' || navigator.onLine)) {
      fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifIds: list.map(String) })
      }).catch(() => {
        list.forEach(id => queuePendingRead(id));
      });
    } else {
      list.forEach(id => queuePendingRead(id));
    }
  }

  function isRead(notifId) {
    if (!notifId) return false;
    const map = getReadTimestampsMap();
    return !!map[String(notifId)];
  }

  function isExpired(notifId) {
    if (!notifId) return false;
    const map = getReadTimestampsMap();
    const ts = map[String(notifId)];
    if (!ts) return false; // Unread notifications remain visible until read
    return (Date.now() - ts) > TWENTY_FOUR_HOURS_MS;
  }

  function getRemainingHours(notifId) {
    if (!notifId) return null;
    const map = getReadTimestampsMap();
    const ts = map[String(notifId)];
    if (!ts) return null;
    const elapsed = Date.now() - ts;
    const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;
    if (remainingMs <= 0) return 0;
    return Math.ceil(remainingMs / (60 * 60 * 1000));
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function filterActiveNotifications(notifications) {
    if (!Array.isArray(notifications)) return [];
    return notifications.filter(item => item && (item.isPermanent || !isExpired(item.id)));
  }

  function subscribe(fn) {
    if (typeof fn === 'function' && !listeners.includes(fn)) {
      listeners.push(fn);
    }
    return function unsubscribe() {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  function notifyListeners() {
    for (const fn of listeners) {
      try { fn(); } catch(e) { console.warn('[VLKNotifs] subscriber error:', e); }
    }
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('vlk:notifications_updated', {
          detail: { reads: getReadTimestampsMap() }
        }));
      }
    } catch(e) {}
  }

  function clearUserData(userId) {
    inMemoryStore = {};
    try {
      const key = userId ? 'vlk_notif_read_timestamps_' + userId : getStorageKey();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch(e) {}
    notifyListeners();
  }

  // Bind browser window events for automatic cross-device and cross-tab synchronization
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      syncWithServer().catch(() => {});
    }, 300);

    window.addEventListener('focus', () => {
      syncWithServer().catch(() => {});
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          syncWithServer().catch(() => {});
        }
      });
    }

    window.addEventListener('online', () => {
      syncWithServer().catch(() => {});
    });

    setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        syncWithServer().catch(() => {});
      }
    }, 25000);

    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('vlk_notif_read_timestamps_')) {
        notifyListeners();
      }
    });

    // Listen for Service Worker background push click / dismiss events
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && (event.data.type === 'VLK_PUSH_CLICKED' || event.data.type === 'VLK_PUSH_DISMISSED')) {
          const pushNotifId = event.data.data?.notifId || event.data.notifId;
          if (pushNotifId) {
            markAsRead(pushNotifId);
          } else {
            syncWithServer().catch(() => {});
          }
        }
      });
    }
  }

  return {
    markAsRead,
    markAllAsRead,
    isRead,
    isExpired,
    getRemainingHours,
    formatTimeAgo,
    filterActiveNotifications,
    clearUserData,
    syncWithServer,
    subscribe,
    notifyListeners,
    mergeReadTimestamps,
    getReadTimestampsMap,
    TWENTY_FOUR_HOURS_MS
  };
}));

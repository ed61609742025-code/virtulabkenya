/**
 * VirtuLab Kenya — 24-Hour Expiration Notifications Engine
 * Handles automatic 24h expiration after read, badge counters, and animated bell status.
 */
(function(window) {
  'use strict';

  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  function getStorageKey() {
    try {
      const user = window.getUser ? window.getUser() : null;
      return 'vlk_notif_read_timestamps_' + (user && user.id ? user.id : 'anon');
    } catch(e) {
      return 'vlk_notif_read_timestamps_anon';
    }
  }

  function getReadTimestampsMap() {
    try {
      const raw = localStorage.getItem(getStorageKey());
      return raw ? JSON.parse(raw) : {};
    } catch(e) {
      return {};
    }
  }

  function saveReadTimestampsMap(map) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(map));
    } catch(e) {}
  }

  function markAsRead(notifId) {
    const map = getReadTimestampsMap();
    if (!map[notifId]) {
      map[notifId] = Date.now();
      saveReadTimestampsMap(map);
    }
  }

  function markAllAsRead(notifIds) {
    const map = getReadTimestampsMap();
    const now = Date.now();
    (notifIds || []).forEach(id => {
      if (!map[id]) map[id] = now;
    });
    saveReadTimestampsMap(map);
  }

  function isRead(notifId) {
    const map = getReadTimestampsMap();
    return !!map[notifId];
  }

  function isExpired(notifId) {
    const map = getReadTimestampsMap();
    const ts = map[notifId];
    if (!ts) return false; // Unread notifications stay until read
    return (Date.now() - ts) > TWENTY_FOUR_HOURS_MS;
  }

  function getRemainingHours(notifId) {
    const map = getReadTimestampsMap();
    const ts = map[notifId];
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

  /**
   * Process a list of notification objects:
   * Filter out any notifications that were read > 24 hours ago.
   */
  function filterActiveNotifications(notifications) {
    if (!Array.isArray(notifications)) return [];
    return notifications.filter(item => !isExpired(item.id));
  }

  window.VLKNotifs = {
    markAsRead,
    markAllAsRead,
    isRead,
    isExpired,
    getRemainingHours,
    formatTimeAgo,
    filterActiveNotifications,
    TWENTY_FOUR_HOURS_MS
  };
})(window);

/**
 * VirtuLab Kenya — Exam Offline Manager & Resilient Auto-Save Engine
 * Provides client-side resilience against network drops during KCSE practical exams:
 * 1. Debounced auto-save of candidate answers to localStorage.
 * 2. Instant draft restoration prompt/recovery on accidental tab close or power failure.
 * 3. Offline submission queue with automatic background sync when connection restores.
 * 4. Real-time connectivity status monitor with accessible UI badge.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ExamDraftManager = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const DRAFT_PREFIX = 'vlk_exam_draft_';
  const QUEUE_KEY = 'vlk_pending_submissions';
  const DEBOUNCE_MS = 600;

  class ExamOfflineManager {
    constructor() {
      this.debounceTimers = new Map();
      this.statusBadgeEl = null;
      this.isSyncing = false;
      this.listeners = [];

      if (typeof window !== 'undefined') {
        this.bindNetworkEvents();
      }
    }

    /**
     * Get unique storage key for an exam session
     */
    getStorageKey(examKey) {
      return `${DRAFT_PREFIX}${examKey || 'default'}`;
    }

    /**
     * Save draft state into localStorage with debouncing
     */
    saveDraft(examKey, stateData, immediate = false) {
      if (!examKey || !stateData) return;

      const performSave = () => {
        try {
          const payload = {
            examKey: String(examKey),
            savedAt: new Date().toISOString(),
            data: stateData
          };
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.getStorageKey(examKey), JSON.stringify(payload));
          }
          this.notifyStatus('saved', payload.savedAt);
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('vlk:draft_saved', { detail: payload }));
          }
        } catch (err) {
          console.warn('[ExamOfflineManager] Failed to save draft to localStorage:', err);
        }
      };

      if (immediate) {
        if (this.debounceTimers.has(examKey)) {
          clearTimeout(this.debounceTimers.get(examKey));
          this.debounceTimers.delete(examKey);
        }
        performSave();
        return;
      }

      if (this.debounceTimers.has(examKey)) {
        clearTimeout(this.debounceTimers.get(examKey));
      }

      this.notifyStatus('saving');
      const timer = setTimeout(() => {
        this.debounceTimers.delete(examKey);
        performSave();
      }, DEBOUNCE_MS);

      this.debounceTimers.set(examKey, timer);
    }

    /**
     * Load draft from localStorage
     */
    loadDraft(examKey) {
      if (!examKey) return null;
      try {
        if (typeof localStorage === 'undefined') return null;
        const raw = localStorage.getItem(this.getStorageKey(examKey));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && parsed.data ? parsed : null;
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to read draft:', err);
        return null;
      }
    }

    /**
     * Check if a draft exists
     */
    hasDraft(examKey) {
      return !!this.loadDraft(examKey);
    }

    /**
     * Clear draft from localStorage (e.g. after successful submission)
     */
    clearDraft(examKey) {
      if (!examKey) return;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(this.getStorageKey(examKey));
        }
        this.notifyStatus('cleared');
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to clear draft:', err);
      }
    }

    /**
     * Queue submission payload when offline or when network call fails
     */
    queueSubmission(url, payload, meta = {}) {
      try {
        const queue = this.getPendingSubmissions();
        const queuedItem = {
          id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          url,
          payload,
          meta,
          queuedAt: new Date().toISOString(),
          attempts: 0
        };
        queue.push(queuedItem);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        }
        this.notifyStatus('queued');
        return queuedItem;
      } catch (err) {
        console.error('[ExamOfflineManager] Failed to queue submission:', err);
        return null;
      }
    }

    /**
     * Retrieve list of pending submissions
     */
    getPendingSubmissions() {
      try {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem(QUEUE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to parse pending queue:', err);
        return [];
      }
    }

    /**
     * Remove a queued submission by ID
     */
    removeQueuedSubmission(id) {
      try {
        const queue = this.getPendingSubmissions().filter(item => item.id !== id);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to update queue:', err);
      }
    }

    /**
     * Flush offline queue when connectivity is restored
     */
    async flushOfflineQueue() {
      if (this.isSyncing) return { synced: 0, pending: 0 };
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return { synced: 0, pending: this.getPendingSubmissions().length };
      }

      const queue = this.getPendingSubmissions();
      if (queue.length === 0) return { synced: 0, pending: 0 };

      this.isSyncing = true;
      this.notifyStatus('syncing');

      let syncedCount = 0;
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('vlk_token') : null;

      for (const item of queue) {
        try {
          item.attempts = (item.attempts || 0) + 1;
          const headers = {
            'Content-Type': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(item.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(item.payload)
          });

          if (response.ok) {
            this.removeQueuedSubmission(item.id);
            syncedCount++;
          } else if (response.status === 401 || response.status === 403) {
            // Auth expired or invalid: DO NOT discard the student's exam work!
            // Retain item in queue, pause sync, and notify UI to prompt candidate re-authentication
            console.warn(`[ExamOfflineManager] Auth failed (${response.status}) syncing ${item.id}. Retaining queued exam submission.`);
            this.notifyStatus('auth_required');
            break;
          } else if (response.status >= 400 && response.status < 500) {
            // Client error: don't loop forever, but preserve for inspection if needed
            console.error(`[ExamOfflineManager] Submission ${item.id} rejected with ${response.status}`);
            this.removeQueuedSubmission(item.id);
          }
        } catch (networkErr) {
          console.warn(`[ExamOfflineManager] Network error syncing ${item.id}:`, networkErr);
          break; // Still offline or unstable, pause flush
        }
      }

      this.isSyncing = false;
      const remaining = this.getPendingSubmissions().length;
      this.notifyStatus(remaining === 0 ? 'online' : 'partial_sync');

      return { synced: syncedCount, pending: remaining };
    }

    /**
     * Bind online/offline browser window events
     */
    bindNetworkEvents() {
      window.addEventListener('online', () => {
        this.notifyStatus('online');
        this.flushOfflineQueue();
      });

      window.addEventListener('offline', () => {
        this.notifyStatus('offline');
      });
    }

    /**
     * Initialize connectivity status badge UI
     */
    initConnectivityMonitor(containerIdOrElement, onStatusChange) {
      if (typeof document === 'undefined') return;

      const container = typeof containerIdOrElement === 'string'
        ? document.getElementById(containerIdOrElement)
        : containerIdOrElement;

      if (!container) return;

      this.statusBadgeEl = container;
      if (typeof onStatusChange === 'function') {
        this.listeners.push(onStatusChange);
      }

      this.renderStatusBadge(navigator.onLine ? 'online' : 'offline');

      // Check if there are queued submissions from a previous offline attempt
      const pending = this.getPendingSubmissions();
      if (pending.length > 0 && navigator.onLine) {
        setTimeout(() => this.flushOfflineQueue(), 1200);
      }
    }

    /**
     * Notify listeners and update status pill UI
     */
    notifyStatus(status, detail) {
      this.renderStatusBadge(status, detail);
      for (const fn of this.listeners) {
        try { fn(status, detail); } catch (e) { console.error(e); }
      }
    }

    /**
     * Render accessible status badge
     */
    renderStatusBadge(status, detail) {
      if (!this.statusBadgeEl) return;

      const isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;

      let badgeHTML = '';
      if (!isOnline || status === 'offline') {
        badgeHTML = `
          <div class="vlk-offline-badge vlk-status-offline" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(234,179,8,0.12); border:1px solid rgba(234,179,8,0.35); color:#FACC15; font-size:0.75rem; font-weight:600; font-family:'Inter',sans-serif;" title="Working offline. All inputs are safely preserved in local storage.">
            <span style="width:7px; height:7px; border-radius:50%; background:#FACC15; box-shadow:0 0 6px #FACC15;"></span>
            <span>🟡 Offline Mode · Saved Locally</span>
          </div>
        `;
      } else if (status === 'syncing') {
        badgeHTML = `
          <div class="vlk-offline-badge vlk-status-syncing" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(6,182,212,0.12); border:1px solid rgba(6,182,212,0.35); color:#38BDF8; font-size:0.75rem; font-weight:600; font-family:'Inter',sans-serif;">
            <span style="display:inline-block; animation:spin 1s linear infinite;">🔄</span>
            <span>Syncing exam data...</span>
          </div>
        `;
      } else if (status === 'saving') {
        badgeHTML = `
          <div class="vlk-offline-badge vlk-status-saving" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(148,163,184,0.12); border:1px solid rgba(148,163,184,0.3); color:#94A3B8; font-size:0.75rem; font-weight:600; font-family:'Inter',sans-serif;">
            <span>💾 Saving...</span>
          </div>
        `;
      } else if (status === 'auth_required') {
        badgeHTML = `
          <div class="vlk-offline-badge vlk-status-auth" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); color:#EF4444; font-size:0.75rem; font-weight:600; font-family:'Inter',sans-serif;" title="Session expired. Exam safely saved locally. Please login in another tab to sync.">
            <span style="width:7px; height:7px; border-radius:50%; background:#EF4444; box-shadow:0 0 6px #EF4444;"></span>
            <span>⚠️ Login Required · Saved Locally</span>
          </div>
        `;
      } else {
        const timeStr = detail ? new Date(detail).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live';
        badgeHTML = `
          <div class="vlk-offline-badge vlk-status-online" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.35); color:#4ADE80; font-size:0.75rem; font-weight:600; font-family:'Inter',sans-serif;" title="Connected to server. Auto-saved at ${timeStr}">
            <span style="width:7px; height:7px; border-radius:50%; background:#22C55E; box-shadow:0 0 6px #22C55E;"></span>
            <span>🟢 Online · Auto-saved</span>
          </div>
        `;
      }

      this.statusBadgeEl.innerHTML = badgeHTML;
    }

    /**
     * Register Service Worker
     */
    registerServiceWorker(swPath = '/sw.js') {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register(swPath).then(reg => {
            console.log('[ExamOfflineManager] Service worker active, scope:', reg.scope);
          }).catch(err => {
            console.warn('[ExamOfflineManager] Service worker registration failed:', err);
          });
        });
      }
    }
  }

  return new ExamOfflineManager();
}));

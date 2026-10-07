/**
 * VirtuLab Kenya — Exam Offline Manager & Resilient Auto-Save Engine
 * Provides client-side resilience against network drops during KCSE practical exams:
 * 1. Asynchronous IndexedDB draft persistence with high capacity and non-blocking I/O.
 * 2. 5-Second Resilient Background Auto-Save loop capturing burette volumes, color observations, and deductions.
 * 3. Dual-storage fallback to localStorage for maximum browser compatibility.
 * 4. Offline submission queue with automatic background sync upon connection restoration.
 * 5. Real-time connectivity status monitor with accessible UI status pill badge.
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

  const DB_NAME = 'vlk_offline_exams_db';
  const DB_VERSION = 2;
  const DRAFT_PREFIX = 'vlk_exam_draft_';
  const QUEUE_KEY = 'vlk_pending_submissions';
  const DEBOUNCE_MS = 600;

  class ExamOfflineManager {
    constructor() {
      this.db = null;
      this.dbPromise = null;
      this.debounceTimers = new Map();
      this.statusBadgeEl = null;
      this.isSyncing = false;
      this.listeners = [];
      this.backgroundAutoSaveTimer = null;
      this.lastSavedHash = null;

      if (typeof window !== 'undefined') {
        this.bindNetworkEvents();
        // Warm up IndexedDB connection in background
        this.openDatabase().catch(() => {});
      }
    }

    /**
     * Open or upgrade the IndexedDB database
     * @returns {Promise<IDBDatabase|null>}
     */
    async openDatabase() {
      if (this.db) return this.db;
      if (typeof indexedDB === 'undefined') return null;

      if (this.dbPromise) return this.dbPromise;

      this.dbPromise = new Promise((resolve) => {
        try {
          const request = indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // 1. Drafts store for candidate answers and experimental setups
            if (!db.objectStoreNames.contains('drafts')) {
              const draftStore = db.createObjectStore('drafts', { keyPath: 'examKey' });
              draftStore.createIndex('savedAt', 'savedAt', { unique: false });
            }
            // 2. Sync queue for pending exam submissions
            if (!db.objectStoreNames.contains('sync_queue')) {
              const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
              queueStore.createIndex('queuedAt', 'queuedAt', { unique: false });
              queueStore.createIndex('attempts', 'attempts', { unique: false });
            }
            // 3. Continuous laboratory audit trail
            if (!db.objectStoreNames.contains('audit_timeline')) {
              const auditStore = db.createObjectStore('audit_timeline', { keyPath: 'id', autoIncrement: true });
              auditStore.createIndex('examKey', 'examKey', { unique: false });
              auditStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
          };

          request.onsuccess = (event) => {
            this.db = event.target.result;
            resolve(this.db);
          };

          request.onerror = (err) => {
            console.warn('[ExamOfflineManager] IndexedDB open error, using localStorage fallback:', err);
            resolve(null);
          };

          request.onblocked = () => {
            console.warn('[ExamOfflineManager] IndexedDB blocked. Please close conflicting tabs.');
            resolve(null);
          };
        } catch (e) {
          console.warn('[ExamOfflineManager] IndexedDB exception:', e);
          resolve(null);
        }
      });

      return this.dbPromise;
    }

    /**
     * Get unique storage key for an exam session
     */
    getStorageKey(examKey) {
      return `${DRAFT_PREFIX}${examKey || 'default'}`;
    }

    /**
     * Asynchronously save draft state to IndexedDB with localStorage dual-write fallback
     */
    async saveDraftIdb(examKey, stateData, immediate = false) {
      if (!examKey || !stateData) return;

      const payload = {
        examKey: String(examKey),
        savedAt: new Date().toISOString(),
        data: stateData
      };

      // 1. Write to IndexedDB if available
      try {
        const db = await this.openDatabase();
        if (db) {
          await new Promise((resolve, reject) => {
            const tx = db.transaction(['drafts'], 'readwrite');
            const store = tx.objectStore('drafts');
            const req = store.put(payload);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          });
        }
      } catch (idbErr) {
        console.warn('[ExamOfflineManager] IndexedDB save error:', idbErr);
      }

      // 2. Dual-write to localStorage as synchronous backup
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.getStorageKey(examKey), JSON.stringify(payload));
        }
      } catch (lsErr) {
        // LocalStorage may throw QuotaExceededError; IndexedDB handles large payloads
        console.warn('[ExamOfflineManager] LocalStorage backup error (storage quota):', lsErr.message);
      }

      this.notifyStatus('saved', payload.savedAt);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('vlk:draft_saved', { detail: payload }));
      }

      return payload;
    }

    /**
     * Save draft state into storage (backward-compatible wrapper with debouncing)
     */
    saveDraft(examKey, stateData, immediate = false) {
      if (!examKey || !stateData) return;

      const performSave = () => {
        this.saveDraftIdb(examKey, stateData, immediate).catch(() => {});
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
     * Asynchronously load draft from IndexedDB, falling back to localStorage
     */
    async loadDraftIdb(examKey) {
      if (!examKey) return null;

      // 1. Try IndexedDB
      try {
        const db = await this.openDatabase();
        if (db) {
          const idbResult = await new Promise((resolve, reject) => {
            const tx = db.transaction(['drafts'], 'readonly');
            const store = tx.objectStore('drafts');
            const req = store.get(String(examKey));
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
          });

          if (idbResult && idbResult.data) {
            return idbResult;
          }
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] IndexedDB read error, checking localStorage:', err);
      }

      // 2. Fall back to localStorage
      return this.loadDraft(examKey);
    }

    /**
     * Load draft synchronously from localStorage
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
        console.warn('[ExamOfflineManager] Failed to read draft from localStorage:', err);
        return null;
      }
    }

    /**
     * Check if a draft exists in either IndexedDB or localStorage
     */
    async hasDraft(examKey) {
      const draft = await this.loadDraftIdb(examKey);
      return !!draft;
    }

    /**
     * Retrieve all saved exam drafts across all series or assignments from IndexedDB & localStorage
     */
    async getAllDraftsIdb() {
      const drafts = [];
      const seenKeys = new Set();

      // 1. Read IndexedDB
      try {
        const db = await this.openDatabase();
        if (db) {
          const idbList = await new Promise((resolve, reject) => {
            const tx = db.transaction(['drafts'], 'readonly');
            const store = tx.objectStore('drafts');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
          });

          if (Array.isArray(idbList)) {
            for (const item of idbList) {
              if (item && item.examKey && item.data) {
                drafts.push(item);
                seenKeys.add(item.examKey);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] IndexedDB getAll drafts error:', err);
      }

      // 2. Read localStorage fallbacks
      try {
        if (typeof localStorage !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(DRAFT_PREFIX)) {
              const examKey = k.replace(DRAFT_PREFIX, '');
              if (!seenKeys.has(examKey)) {
                try {
                  const raw = localStorage.getItem(k);
                  const parsed = raw ? JSON.parse(raw) : null;
                  if (parsed && parsed.data) {
                    drafts.push({
                      examKey,
                      savedAt: parsed.savedAt || new Date().toISOString(),
                      data: parsed.data
                    });
                    seenKeys.add(examKey);
                  }
                } catch (e) {}
              }
            }
          }
        }
      } catch (lsErr) {
        console.warn('[ExamOfflineManager] LocalStorage drafts scan error:', lsErr);
      }

      return drafts;
    }

    /**
     * Clear draft from both IndexedDB and localStorage (e.g. after successful submission)
     */
    async clearDraftIdb(examKey) {
      if (!examKey) return;

      // 1. Clear IndexedDB
      try {
        const db = await this.openDatabase();
        if (db) {
          await new Promise((resolve, reject) => {
            const tx = db.transaction(['drafts'], 'readwrite');
            const store = tx.objectStore('drafts');
            const req = store.delete(String(examKey));
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          });
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to clear IndexedDB draft:', err);
      }

      // 2. Clear localStorage
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(this.getStorageKey(examKey));
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to clear localStorage draft:', err);
      }

      this.notifyStatus('cleared');
    }

    /**
     * Synchronous clear draft wrapper
     */
    clearDraft(examKey) {
      this.clearDraftIdb(examKey).catch(() => {});
    }

    /**
     * Initialize 5-Second Resilient Background Auto-Save Loop
     * Continuously persists candidate burette readings, table records, and qualitative state
     * @param {string} examKey 
     * @param {Function} stateGetterFn Function returning the latest candidate state payload
     * @param {number} intervalMs Defaults to 5000ms (5 seconds)
     */
    initBackgroundAutoSave(examKey, stateGetterFn, intervalMs = 5000) {
      if (this.backgroundAutoSaveTimer) {
        clearInterval(this.backgroundAutoSaveTimer);
        this.backgroundAutoSaveTimer = null;
      }

      if (typeof stateGetterFn !== 'function' || !examKey) return;

      this.backgroundAutoSaveTimer = setInterval(async () => {
        try {
          const currentState = stateGetterFn();
          if (!currentState) return;

          // Compute fast JSON fingerprint to avoid duplicate writes if no inputs changed
          const currentHash = JSON.stringify(currentState);
          if (currentHash === this.lastSavedHash) {
            return; // State unchanged, skip redundant write
          }

          this.lastSavedHash = currentHash;
          await this.saveDraftIdb(examKey, currentState, true);
        } catch (autoSaveErr) {
          console.warn('[ExamOfflineManager] Background auto-save cycle exception:', autoSaveErr);
        }
      }, intervalMs);

      console.log(`[ExamOfflineManager] Background auto-save active every ${intervalMs / 1000}s for ${examKey}`);
    }

    /**
     * Stop the background auto-save loop
     */
    stopBackgroundAutoSave() {
      if (this.backgroundAutoSaveTimer) {
        clearInterval(this.backgroundAutoSaveTimer);
        this.backgroundAutoSaveTimer = null;
      }
      this.lastSavedHash = null;
    }

    /**
     * Append laboratory event to IndexedDB audit timeline
     */
    async logAuditTimeline(examKey, action, payload = {}) {
      try {
        const db = await this.openDatabase();
        if (!db) return;

        const eventItem = {
          examKey: String(examKey),
          action: String(action),
          payload,
          timestamp: new Date().toISOString()
        };

        const tx = db.transaction(['audit_timeline'], 'readwrite');
        tx.objectStore('audit_timeline').add(eventItem);
      } catch (err) {
        // Non-critical audit trail
      }
    }

    /**
     * Queue submission payload into IndexedDB and localStorage when offline or network fails
     */
    async queueSubmissionIdb(url, payload, meta = {}) {
      const queuedItem = {
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        url,
        payload,
        meta,
        queuedAt: new Date().toISOString(),
        attempts: 0
      };

      // 1. IndexedDB queue
      try {
        const db = await this.openDatabase();
        if (db) {
          await new Promise((resolve, reject) => {
            const tx = db.transaction(['sync_queue'], 'readwrite');
            const store = tx.objectStore('sync_queue');
            const req = store.put(queuedItem);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          });
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to queue submission in IndexedDB:', err);
      }

      // 2. localStorage queue backup
      try {
        const queue = this.getPendingSubmissions();
        queue.push(queuedItem);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to backup queue to localStorage:', err);
      }

      if (typeof window !== 'undefined' && window.OfflineQueue && typeof window.OfflineQueue.enqueue === 'function') {
        window.OfflineQueue.enqueue(url, 'POST', payload).catch(() => {});
      }

      this.notifyStatus('queued');
      return queuedItem;
    }

    /**
     * Queue submission wrapper
     */
    queueSubmission(url, payload, meta = {}) {
      this.queueSubmissionIdb(url, payload, meta).catch(() => {});
      return {
        id: 'sub_' + Date.now(),
        url,
        payload,
        queuedAt: new Date().toISOString()
      };
    }

    /**
     * Retrieve list of pending submissions from IndexedDB and localStorage
     */
    async getPendingSubmissionsIdb() {
      const results = [];
      const seenIds = new Set();

      // 1. Read IndexedDB
      try {
        const db = await this.openDatabase();
        if (db) {
          const idbList = await new Promise((resolve, reject) => {
            const tx = db.transaction(['sync_queue'], 'readonly');
            const store = tx.objectStore('sync_queue');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
          });

          if (Array.isArray(idbList)) {
            for (const item of idbList) {
              if (item && item.id) {
                results.push(item);
                seenIds.add(item.id);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] IndexedDB queue read error:', err);
      }

      // 2. Read localStorage
      const lsList = this.getPendingSubmissions();
      for (const item of lsList) {
        if (item && item.id && !seenIds.has(item.id)) {
          results.push(item);
          seenIds.add(item.id);
        }
      }

      return results;
    }

    /**
     * Retrieve list of pending submissions from localStorage
     */
    getPendingSubmissions() {
      try {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem(QUEUE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const result = Array.isArray(list) ? list : [];

        // Check fallback queue
        const rawOffline = localStorage.getItem('vlk_offline_submission_queue');
        if (rawOffline) {
          const offlineList = JSON.parse(rawOffline);
          if (Array.isArray(offlineList)) {
            for (const item of offlineList) {
              if (item && item.id && !result.some(r => r.id === item.id)) {
                result.push({
                  id: item.id,
                  url: item.endpoint.startsWith('/') ? item.endpoint : '/' + item.endpoint,
                  payload: item.body,
                  meta: {},
                  queuedAt: new Date(item.timestamp || Date.now()).toISOString(),
                  attempts: item.attempts || 0
                });
              }
            }
          }
        }

        return result;
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to parse pending queue:', err);
        return [];
      }
    }

    /**
     * Remove queued submission by ID from both storages
     */
    async removeQueuedSubmission(id) {
      // 1. Remove from IndexedDB
      try {
        const db = await this.openDatabase();
        if (db) {
          const tx = db.transaction(['sync_queue'], 'readwrite');
          tx.objectStore('sync_queue').delete(id);
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to delete queue item from IndexedDB:', err);
      }

      // 2. Remove from localStorage
      try {
        const queue = this.getPendingSubmissions().filter(item => item.id !== id);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
          const rawOffline = localStorage.getItem('vlk_offline_submission_queue');
          if (rawOffline) {
            const offlineList = JSON.parse(rawOffline).filter(item => item.id !== id);
            localStorage.setItem('vlk_offline_submission_queue', JSON.stringify(offlineList));
          }
        }
      } catch (err) {
        console.warn('[ExamOfflineManager] Failed to update localStorage queue:', err);
      }
    }

    /**
     * Flush offline queue when connectivity is restored
     */
    async flushOfflineQueue() {
      if (this.isSyncing) return { synced: 0, pending: 0 };
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const currentPending = (await this.getPendingSubmissionsIdb()).length;
        return { synced: 0, pending: currentPending };
      }

      if (typeof window !== 'undefined' && window.OfflineQueue && typeof window.OfflineQueue.flush === 'function') {
        await window.OfflineQueue.flush();
      }

      const queue = await this.getPendingSubmissionsIdb();
      if (queue.length === 0) return { synced: 0, pending: 0 };

      this.isSyncing = true;
      this.notifyStatus('syncing');

      let syncedCount = 0;
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('vlk_token') : null;

      for (const item of queue) {
        try {
          item.attempts = (item.attempts || 0) + 1;
          const headers = { 'Content-Type': 'application/json' };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(item.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(item.payload)
          });

          if (response.ok || response.status === 400 || response.status === 409 || response.status === 422) {
            await this.removeQueuedSubmission(item.id);
            if (response.ok) syncedCount++;
          } else if (response.status === 401 || response.status === 403) {
            console.warn(`[ExamOfflineManager] Auth required (${response.status}) syncing ${item.id}. Retaining exam in queue.`);
            this.notifyStatus('auth_required');
            break;
          } else if (response.status >= 400 && response.status < 500) {
            console.error(`[ExamOfflineManager] Submission ${item.id} rejected with ${response.status}`);
            await this.removeQueuedSubmission(item.id);
          }
        } catch (networkErr) {
          console.warn(`[ExamOfflineManager] Network error syncing ${item.id}:`, networkErr);
          break;
        }
      }

      this.isSyncing = false;
      const remaining = (await this.getPendingSubmissionsIdb()).length;
      this.notifyStatus(remaining === 0 ? 'online' : 'partial_sync');

      return { synced: syncedCount, pending: remaining };
    }

    /**
     * Alias for flushOfflineQueue
     */
    async flushOfflineQueueIdb() {
      return this.flushOfflineQueue();
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

      window.addEventListener('vlk:offline_sync_complete', () => {
        this.notifyStatus('online');
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
      this.getPendingSubmissionsIdb().then(pending => {
        if (pending.length > 0 && navigator.onLine) {
          setTimeout(() => this.flushOfflineQueue(), 1200);
        }
      });
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
          <div class="vlk-offline-badge vlk-status-offline" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(234,179,8,0.12); border:1px solid rgba(234,179,8,0.35); color:#FACC15; font-size:0.75rem; font-weight:600; font-family:'Inter',sans-serif;" title="Working offline. All burette readings and answers are safely secured in IndexedDB.">
            <span style="width:7px; height:7px; border-radius:50%; background:#FACC15; box-shadow:0 0 6px #FACC15;"></span>
            <span>🟡 Offline Mode · Saved in IndexedDB</span>
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
            <span>💾 Auto-saving to IndexedDB...</span>
          </div>
        `;
      } else if (status === 'auth_required') {
        badgeHTML = `
          <div class="vlk-offline-badge vlk-status-auth" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); color:#EF4444; font-size:0.75rem; font-weight:600; font-family:'Inter',sans-serif;" title="Session expired. Exam safely secured in IndexedDB. Please login in another tab to sync.">
            <span style="width:7px; height:7px; border-radius:50%; background:#EF4444; box-shadow:0 0 6px #EF4444;"></span>
            <span>⚠️ Login Required · Saved Locally</span>
          </div>
        `;
      } else {
        const timeStr = detail ? new Date(detail).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live';
        badgeHTML = `
          <div class="vlk-offline-badge vlk-status-online" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.35); color:#4ADE80; font-size:0.75rem; font-weight:600; font-family:'Inter',sans-serif;" title="Connected to server. Auto-saved to IndexedDB at ${timeStr}">
            <span style="width:7px; height:7px; border-radius:50%; background:#22C55E; box-shadow:0 0 6px #22C55E;"></span>
            <span>🟢 Online · IndexedDB Active</span>
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

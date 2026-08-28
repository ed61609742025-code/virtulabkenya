// ============================================================
//  VirtuLab Kenya — Shared API Utility
//  All API calls go through this file
// ============================================================

const API_BASE = '/api';


// ── Token helpers (localStorage with sessionStorage fallback) ─────────────
function getStorage() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('__vlk_test', '1');
      localStorage.removeItem('__vlk_test');
      return localStorage;
    }
  } catch (e) {}
  return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
}

function getToken() {
  const store = getStorage();
  if (!store) return null;
  return store.getItem('vlk_token') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('vlk_token') : null);
}
function setToken(token) {
  const store = getStorage();
  if (store) store.setItem('vlk_token', token);
  try { sessionStorage.setItem('vlk_token', token); } catch(e) {}
}
function clearToken() {
  const store = getStorage();
  if (store) {
    store.removeItem('vlk_token');
    store.removeItem('vlk_user');
  }
  try {
    sessionStorage.removeItem('vlk_token');
    sessionStorage.removeItem('vlk_user');
  } catch(e) {}
}
function decodeTokenPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function getUser() {
  const store = getStorage();
  let user = null;
  if (store) {
    try {
      const raw = store.getItem('vlk_user') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('vlk_user') : null);
      user = raw ? JSON.parse(raw) : null;
    } catch(e) {}
  }
  const token = getToken();
  if (token) {
    const payload = decodeTokenPayload(token);
    if (payload && payload.role) {
      if (!user) {
        user = { id: payload.id, role: payload.role, name: payload.name, email: payload.email };
      } else {
        user.role = payload.role; // Always trust the signed token role
      }
    }
  }
  return user;
}
function setUser(user) {
  const store = getStorage();
  const serialized = JSON.stringify(user);
  if (store) store.setItem('vlk_user', serialized);
  try { sessionStorage.setItem('vlk_user', serialized); } catch(e) {}
}
function isLoggedIn() {
  return !!getToken();
}

// ── Theme helpers ───────────────────────────────────────────────
function applyStoredTheme() {
  const theme = localStorage.getItem('vlk_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeButtons();
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('vlk_theme', theme);
  updateThemeButtons();
}
function updateThemeButtons() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  document.querySelectorAll('.theme-btn, .theme-btn-chip[data-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === current || btn.getAttribute('data-theme') === current);
  });
}
if (typeof window !== 'undefined') {
  window.setTheme = setTheme;
  window.applyStoredTheme = applyStoredTheme;
  window.updateThemeButtons = updateThemeButtons;
}

// ── HTML Escaping Helper (XSS Mitigation) ──────────────────────
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;');
}
if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
}

// ── Core fetch wrapper ────────────────────────────────────────
async function downloadFile(endpoint, filename) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + endpoint, { headers });
  if (!res.ok) {
    let message = 'Download failed';
    try { const data = await res.json(); message = data.error || message; } catch (e) {}
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── IndexedDB Offline Queue & Auto-Sync ─────────────────────────
const DB_NAME = 'virtulab_offline_db';
const DB_VERSION = 1;
const QUEUE_STORE = 'submission_queue';

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const OfflineQueue = {
  async enqueue(endpoint, method, body, token) {
    try {
      const db = await openOfflineDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);
        const item = {
          endpoint,
          method,
          body,
          token: token || getToken(),
          timestamp: Date.now()
        };
        const req = store.add(item);
        req.onsuccess = () => {
          OfflineQueue.updateBadge();
          resolve(req.result);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[OfflineQueue] Fallback local storage enqueue:', err.message);
    }
  },

  async count() {
    try {
      const db = await openOfflineDB();
      return new Promise((resolve) => {
        const tx = db.transaction(QUEUE_STORE, 'readonly');
        const store = tx.objectStore(QUEUE_STORE);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      });
    } catch (e) {
      return 0;
    }
  },

  async getAll() {
    try {
      const db = await openOfflineDB();
      return new Promise((resolve) => {
        const tx = db.transaction(QUEUE_STORE, 'readonly');
        const store = tx.objectStore(QUEUE_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  },

  async remove(id) {
    try {
      const db = await openOfflineDB();
      return new Promise((resolve) => {
        const tx = db.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  },

  async flush() {
    if (!isOnline()) return;
    const items = await OfflineQueue.getAll();
    if (!items || items.length === 0) {
      OfflineQueue.updateBadge();
      return;
    }

    console.log(`[OfflineQueue] Replaying ${items.length} queued offline submissions...`);
    const currentToken = getToken();
    for (const item of items) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        const tokenToUse = currentToken || item.token;
        if (tokenToUse) headers['Authorization'] = 'Bearer ' + tokenToUse;
        const res = await fetch(API_BASE + item.endpoint, {
          method: item.method || 'POST',
          headers,
          body: item.body ? JSON.stringify(item.body) : undefined
        });
        if (res.ok || res.status === 400 || res.status === 409 || res.status === 422) {
          // If saved or rejected as duplicate/invalid, remove from queue
          await OfflineQueue.remove(item.id);
        } else if (res.status === 401) {
          // Token expired or unauthenticated
          if (!currentToken) {
            console.warn('[OfflineQueue] Awaiting user login before flushing queued items.');
            break;
          } else {
            // Even current token was rejected, remove stale item
            await OfflineQueue.remove(item.id);
          }
        }
      } catch (err) {
        console.warn(`[OfflineQueue] Sync failed for item ${item.id}, will retry:`, err.message);
        break; // Network still disconnected, stop flushing
      }
    }
    await OfflineQueue.updateBadge();
  },

  async updateBadge() {
    if (typeof document === 'undefined') return;
    const count = await OfflineQueue.count();
    let banner = document.getElementById('vlk-offline-banner');
    if (count > 0) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'vlk-offline-banner';
        document.body.appendChild(banner);
      }
      banner.setAttribute('style', 'position:fixed;bottom:16px;right:16px;z-index:99999;background:#D97706;color:#FFF;padding:10px 18px;border-radius:10px;font-family:sans-serif;font-size:0.85rem;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;');
      banner.innerHTML = `<span>📦 ${count} experiment(s) saved offline. Synchronizing...</span>`;
      banner.style.display = 'flex';
    } else if (banner && isOnline()) {
      banner.style.display = 'none';
    }
  }
};

// ── Network Resilience & Offline Banner ─────────────────────────
function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function updateOfflineBanner(online) {
  if (typeof document === 'undefined') return;
  let banner = document.getElementById('vlk-offline-banner');
  if (!online) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'vlk-offline-banner';
      banner.setAttribute('style', 'position:fixed;bottom:16px;right:16px;z-index:99999;background:#DC2626;color:#FFF;padding:10px 18px;border-radius:10px;font-family:sans-serif;font-size:0.85rem;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;');
      document.body.appendChild(banner);
    }
    banner.innerHTML = '<span>⚠️ You are offline. Experiments are saved locally and will sync when reconnected.</span>';
    banner.style.display = 'flex';
  } else {
    OfflineQueue.flush();
    if (banner) {
      banner.style.display = 'none';
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => updateOfflineBanner(true));
  window.addEventListener('offline', () => updateOfflineBanner(false));
  window.addEventListener('load', () => {
    if (isOnline()) OfflineQueue.flush();
    else OfflineQueue.updateBadge();
  });
}

function isOfflineQueueable(endpoint, method) {
  if (method !== 'POST' && method !== 'PUT') return false;
  const queueable = ['/sessions', '/qualitative', '/organic', '/composite', '/solubility', '/energy', '/rates', '/gas', '/research', '/errors/client'];
  return queueable.some(p => endpoint.startsWith(p));
}

async function apiRequest(method, endpoint, body, retries = 2) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let attempt = 0;
  while (attempt <= retries) {
    try {
      if (!isOnline() && attempt === 0) {
        updateOfflineBanner(false);
        if (isOfflineQueueable(endpoint, method)) {
          await OfflineQueue.enqueue(endpoint, method, body, token);
          return {
            success: true,
            offlineQueued: true,
            message: 'Saved offline. Your practical attempt has been queued and will synchronize automatically.'
          };
        }
      }
      const res = await fetch(API_BASE + endpoint, options);
      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          data = { error: 'Invalid JSON response from server' };
        }
      } else {
        const text = await res.text();
        data = { error: text || `HTTP ${res.status} ${res.statusText}` };
      }

      if (!res.ok) {
        // If 401 Unauthorized, clear stale token
        if (res.status === 401) {
          clearToken();
          const path = (window.location.pathname || '').toLowerCase();
          if (path.includes('/student/') && !path.endsWith('login.html')) {
            window.location.href = '/student/login.html';
          } else if (path.includes('/teacher/') && !path.endsWith('login.html')) {
            window.location.href = '/teacher/login.html';
          } else if (path.includes('/admin/')) {
            window.location.href = '/teacher/login.html';
          }
          throw new Error(data.error || 'Session expired. Please log in again.');
        }

        // If 429 Too Many Requests, do not spam retries
        if (res.status === 429) {
          throw new Error(data.error || 'Server rate limit reached. Please wait a few moments before refreshing.');
        }

        // If 5xx server error and we have retries left, retry with backoff
        if (res.status >= 500 && attempt < retries) {
          attempt++;
          await new Promise(r => setTimeout(r, attempt * 500));
          continue;
        }
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      updateOfflineBanner(true);
      return data;
    } catch (err) {
      if (attempt < retries && err.message && err.message.includes('fetch')) {
        attempt++;
        await new Promise(r => setTimeout(r, attempt * 500));
        continue;
      }
      // If network offline or fetch failed completely on a queueable mutation
      if (isOfflineQueueable(endpoint, method)) {
        await OfflineQueue.enqueue(endpoint, method, body, token);
        updateOfflineBanner(false);
        return {
          success: true,
          offlineQueued: true,
          message: 'Saved offline. Your practical attempt has been queued and will synchronize automatically.'
        };
      }
      console.error('API error:', err.message);
      throw err;
    }
  }
}

// ── Auth endpoints ────────────────────────────────────────────
const Auth = {
  async studentRegister(name, email, password, studentClass, schoolCode, teacherCode) {
    return apiRequest('POST', '/auth/student/register',
      { name, email, password, form: studentClass, schoolCode, teacherCode });
  },
  async studentLogin(email, password) {
    const data = await apiRequest('POST', '/auth/student/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  },
  async teacherRegister(name, email, password, schoolCode) {
    const data = await apiRequest('POST', '/auth/teacher/register', { name, email, password, schoolCode });
    setToken(data.token);
    setUser(data.user);
    return data;
  },
  async teacherLogin(email, password) {
    const data = await apiRequest('POST', '/auth/teacher/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  },
  async adminLogin(email, password) {
    const data = await apiRequest('POST', '/auth/admin/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  },
  logout() {
    const role = getUser()?.role;
    clearToken();
    if (role === 'teacher') {
      window.location.href = '/teacher/login.html';
    } else if (role === 'admin') {
      window.location.reload();
    } else {
      window.location.href = '/student/login.html';
    }
  },
  async changePassword(currentPassword, newPassword) {
    return apiRequest('POST', '/auth/change-password', { currentPassword, newPassword });
  },
  async me() {
    return apiRequest('GET', '/auth/me');
  },
  async resetStudentPassword(studentId) {
    return apiRequest('POST', '/auth/student/' + studentId + '/reset-password');
  }
};

// ── Session endpoints ─────────────────────────────────────────
const Sessions = {
  async save(sessionData) {
    return apiRequest('POST', '/sessions', sessionData);
  },
  async getMine(params = {}) {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return apiRequest('GET', '/sessions/mine' + (qs ? '?' + qs : ''));
  },
  async getClass(params = {}) {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.class) query.set('class', params.class);
    if (params.from) query.set('from', params.from);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return apiRequest('GET', '/sessions/class' + (qs ? '?' + qs : ''));
  }
};

// ── Assignment endpoints ────────────────────────────────────────
const Assignments = {
  async create(data) {
    return apiRequest('POST', '/assignments', data);
  },
  async getMine() {
    return apiRequest('GET', '/assignments/mine');
  },
  async getTeacherList() {
    return apiRequest('GET', '/assignments/teacher');
  },
  async update(id, data) {
    return apiRequest('PUT', '/assignments/' + id, data);
  },
  async remove(id) {
    return apiRequest('DELETE', '/assignments/' + id);
  },
  async remind(id) {
    return apiRequest('POST', '/assignments/' + id + '/remind');
  },
  async markSubmission(submissionId, teacherFeedback) {
    return apiRequest('POST', '/assignments/submissions/' + submissionId + '/mark', { teacherFeedback });
  },
  async getAllSubmissions(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return apiRequest('GET', '/assignments/submissions/all' + (qs ? '?' + qs : ''));
  },
  async exportCsv(id, filename) {
    return downloadFile('/assignments/' + id + '/export', filename);
  }
};

// ── Badge endpoints ──────────────────────────────────────────────
const Badges = {
  async getMine() {
    return apiRequest('GET', '/badges/mine');
  },
  async getClass() {
    return apiRequest('GET', '/badges/class');
  }
};

// ── Leaderboard endpoints ─────────────────────────────────────────
const Leaderboard = {
  async getClass() {
    return apiRequest('GET', '/leaderboard/class');
  }
};

// ── Students endpoints ─────────────────────────────────────────────
const Students = {
  async getClass() {
    return apiRequest('GET', '/students/class');
  },
  async getDrilldown(id) {
    return apiRequest('GET', '/students/' + id + '/drilldown');
  },
  async linkTeacher(teacherCode) {
    return apiRequest('POST', '/students/link-teacher', { teacherCode });
  },
  async getProfile() {
    return apiRequest('GET', '/students/profile');
  }
};

// ── Analytics endpoints ─────────────────────────────────────────────
const Analytics = {
  async getClass() {
    return apiRequest('GET', '/analytics/class');
  }
};

// ── AI feedback endpoints ───────────────────────────────────────────
const AiFeedback = {
  async explain(data) {
    return apiRequest('POST', '/feedback/explain', data);
  }
};

// ── Qualitative analysis endpoints ──────────────────────────────
const Qualitative = {
  async save(data) {
    return apiRequest('POST', '/qualitative', data);
  },
  async getMine(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return apiRequest('GET', '/qualitative/mine' + (qs ? '?' + qs : ''));
  },
  async getClass() {
    return apiRequest('GET', '/qualitative/class');
  }
};

// ── Organic Chemistry Lab API ────────────────────────────────
const Organic = {
  async save(data) {
    return apiRequest('POST', '/organic', data);
  },
  async getMine() {
    return apiRequest('GET', '/organic/mine');
  },
  async getClass() {
    return apiRequest('GET', '/organic/class');
  }
};

// ── Solubility Curves & Crystallization API ───────────────────
const Solubility = {
  async save(data) {
    return apiRequest('POST', '/solubility', data);
  },
  async getMine() {
    return apiRequest('GET', '/solubility/mine');
  },
  async getClass() {
    return apiRequest('GET', '/solubility/class');
  }
};

// ── Thermochemistry / Energy Changes API ──────────────────────
const Energy = {
  async save(data) {
    return apiRequest('POST', '/energy', data);
  },
  async getMine() {
    return apiRequest('GET', '/energy/mine');
  },
  async getClass() {
    return apiRequest('GET', '/energy/class');
  }
};

// ── Reaction Rates & Chemical Kinetics API ───────────────────
const Rates = {
  async save(data) {
    return apiRequest('POST', '/rates', data);
  },
  async getMine() {
    return apiRequest('GET', '/rates/mine');
  },
  async getClass() {
    return apiRequest('GET', '/rates/class');
  }
};

// ── Gas Preparation & Collection API ─────────────────────────
const Gas = {
  async save(data) {
    return apiRequest('POST', '/gas', data);
  },
  async getMine() {
    return apiRequest('GET', '/gas/mine');
  },
  async getClass() {
    return apiRequest('GET', '/gas/class');
  }
};

// ── Academic Research, CPCAT & Usability Suite API ───────────
const Research = {
  async submitCPCAT(data) {
    return apiRequest('POST', '/research/cpcat/submit', data);
  },
  async getCPCATStatus() {
    return apiRequest('GET', '/research/cpcat/status');
  },
  async getCPCATMine() {
    return apiRequest('GET', '/research/cpcat/mine');
  },
  async submitSUS(data) {
    return apiRequest('POST', '/research/sus/submit', data);
  },
  async submitTAM(data) {
    return apiRequest('POST', '/research/tam/submit', data);
  },
  async getSummary() {
    return apiRequest('GET', '/research/analytics/summary');
  },
  exportCSV() {
    return downloadFile('/research/export/csv', 'virtulab_kenya_research_dataset.csv');
  }
};

// Top-level API convenience object
const API = {
  saveGasSession: (data) => Gas.save(data),
  getMyGasSessions: () => Gas.getMine(),
  submitCPCAT: (data) => Research.submitCPCAT(data),
  getCPCATStatus: () => Research.getCPCATStatus(),
  submitSUS: (data) => Research.submitSUS(data),
  submitTAM: (data) => Research.submitTAM(data),
  getResearchSummary: () => Research.getSummary(),
  exportResearchCSV: () => Research.exportCSV()
};
if (typeof window !== 'undefined') {
  window.Gas = Gas;
  window.Research = Research;
  window.API = API;
}

// ── System Admin Portal API ─────────────────────────────────
const Admin = {
  async getOverview() {
    return apiRequest('GET', '/admin/overview');
  },
  async getSchools() {
    return apiRequest('GET', '/admin/schools');
  },
  async createSchool(name, county, adminCode) {
    return apiRequest('POST', '/admin/schools', { name, county, adminCode });
  },
  async updateSchool(id, name, county, adminCode) {
    return apiRequest('PUT', '/admin/schools/' + id, { name, county, adminCode });
  },
  async deleteSchool(id) {
    return apiRequest('DELETE', '/admin/schools/' + id);
  },
  async getUsers() {
    return apiRequest('GET', '/admin/users');
  },
  async updateUserStatus(userId, role, status) {
    return apiRequest('PATCH', '/admin/users/' + userId + '/status', { role, status });
  },
  async resetUserPassword(userId, role) {
    return apiRequest('POST', '/admin/users/' + userId + '/reset-password', { role });
  },
  async getAuditLogs() {
    return apiRequest('GET', '/admin/audit-logs');
  },
  async getAnnouncements() {
    return apiRequest('GET', '/admin/announcements');
  },
  async createAnnouncement(title, message, type) {
    return apiRequest('POST', '/admin/announcements', { title, message, type });
  },
  async toggleAnnouncement(id, isActive) {
    return apiRequest('PATCH', '/admin/announcements/' + id + '/toggle', { isActive });
  },
  async getAnalytics() {
    return apiRequest('GET', '/admin/analytics');
  },
  async getTeam() {
    return apiRequest('GET', '/admin/team');
  },
  async createAdmin(data) {
    return apiRequest('POST', '/admin/team', data);
  },
  async updateAdminStatus(adminId, status) {
    return apiRequest('PATCH', '/admin/team/' + adminId + '/status', { status });
  },
  async resetAdminPassword(adminId) {
    return apiRequest('POST', '/admin/team/' + adminId + '/reset-password');
  },
  exportSchoolsReport() {
    return downloadFile('/admin/export/schools', 'virtulab_schools_report.csv');
  },
  exportUsersReport() {
    return downloadFile('/admin/export/users', 'virtulab_users_report.csv');
  }
};

const Announcements = {
  async getActive() {
    return apiRequest('GET', '/announcements/active');
  }
};

const Composite = {
  async save(data) {
    return apiRequest('POST', '/composite', data);
  },
  async getMine() {
    return apiRequest('GET', '/composite/mine');
  },
  async getTeacherList() {
    return apiRequest('GET', '/composite/teacher');
  },
  async exportCsv(assignmentId, filename) {
    return downloadFile('/composite/export/' + assignmentId, filename);
  }
};

// ── Error Tracker (Client-Side Telemetry) ──────────────────────
const ErrorTracker = {
  async logClientError(message, stack = '', line = 0, col = 0) {
    try {
      await fetch(API_BASE + '/errors/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          stack,
          line,
          col,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      });
    } catch (e) { /* ignore telemetry network errors */ }
  },
  async getRecentErrors() {
    return apiRequest('GET', '/errors/recent');
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message) {
      ErrorTracker.logClientError(e.message, e.error ? e.error.stack : '', e.lineno, e.colno);
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    const msg = reason ? (reason.message || String(reason)) : 'Unhandled Promise Rejection';
    ErrorTracker.logClientError(msg, reason ? reason.stack : '');
  });
}

// ── Guard: redirect to login if not authenticated ─────────────
function requireStudentLogin() {
  const user = getUser();
  const token = getToken();
  const payload = decodeTokenPayload(token);
  const role = payload?.role || user?.role;
  if (!isLoggedIn() || role !== 'student') {
    clearToken();
    const path = (window.location.pathname || '').toLowerCase();
    if (!path.endsWith('/student/login.html') && !path.endsWith('login.html')) {
      const qs = role ? `?mismatch=${encodeURIComponent(role)}` : '';
      window.location.href = '/student/login.html' + qs;
    }
  }
}
function requireTeacherLogin() {
  const user = getUser();
  const token = getToken();
  const payload = decodeTokenPayload(token);
  const role = payload?.role || user?.role;
  if (!isLoggedIn() || role !== 'teacher') {
    clearToken();
    const path = (window.location.pathname || '').toLowerCase();
    if (!path.endsWith('/teacher/login.html') && !path.endsWith('login.html')) {
      const qs = role ? `?mismatch=${encodeURIComponent(role)}` : '';
      window.location.href = '/teacher/login.html' + qs;
    }
  }
}
function requireAdminLogin(onSuccess) {
  const user = getUser();
  if (!isLoggedIn() || user?.role !== 'admin') {
    clearToken();
    return false;
  }
  if (typeof onSuccess === 'function') onSuccess(user);
  return true;
}

// ── PWA Service Worker Registration ───────────────────────────
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[VirtuLab PWA] Service worker registered successfully:', reg.scope);
    }).catch((err) => {
      console.log('[VirtuLab PWA] Service worker registration failed:', err);
    });
  });
}

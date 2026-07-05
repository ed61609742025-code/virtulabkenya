// ============================================================
//  VirtuLab Kenya — Shared API Utility
//  All API calls go through this file
// ============================================================

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api'; // same domain in production

// ── Token helpers ─────────────────────────────────────────────
function getToken() {
  return sessionStorage.getItem('vlk_token');
}
function setToken(token) {
  sessionStorage.setItem('vlk_token', token);
}
function clearToken() {
  sessionStorage.removeItem('vlk_token');
  sessionStorage.removeItem('vlk_user');
}
function getUser() {
  try { return JSON.parse(sessionStorage.getItem('vlk_user')); }
  catch(e) { return null; }
}
function setUser(user) {
  sessionStorage.setItem('vlk_user', JSON.stringify(user));
}
function isLoggedIn() {
  return !!getToken();
}

// ── Core fetch wrapper ────────────────────────────────────────
async function apiRequest(method, endpoint, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(API_BASE + endpoint, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('API error:', err.message);
    throw err;
  }
}

// ── Auth endpoints ────────────────────────────────────────────
const Auth = {
  async studentRegister(name, email, password, studentClass, schoolCode) {
    return apiRequest('POST', '/auth/student/register',
      { name, email, password, form: studentClass, schoolCode });
  },
  async studentLogin(email, password) {
    const data = await apiRequest('POST', '/auth/student/login', { email, password });
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
  logout() {
    clearToken();
    window.location.href = '/client/student/login.html';
  }
};

// ── Session endpoints ─────────────────────────────────────────
const Sessions = {
  async save(sessionData) {
    return apiRequest('POST', '/sessions', sessionData);
  },
  async getMine() {
    return apiRequest('GET', '/sessions/mine');
  },
  async getClass() {
    return apiRequest('GET', '/sessions/class');
  }
};

// ── Guard: redirect to login if not authenticated ─────────────
function requireStudentLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/client/student/login.html';
  }
}
function requireTeacherLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/client/teacher/login.html';
  }
}

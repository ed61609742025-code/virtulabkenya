// ============================================================
//  VirtuLab Kenya — Universal Head Auth Guard & Anti-FOUC Engine
//  Executes synchronously in <head> to eliminate page flash &
//  ensure seamless leads between home page and practical portals.
// ============================================================

(function(window) {
  'use strict';

  function getStoredToken() {
    try {
      if (typeof localStorage !== 'undefined') {
        var tok = localStorage.getItem('vlk_token');
        if (tok) return tok;
      }
    } catch (e) {}
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem('vlk_token');
      }
    } catch (e) {}
    return null;
  }

  function parseJwtPayload(token) {
    if (!token) return null;
    try {
      var parts = token.split('.');
      if (parts.length < 2) return null;
      var base64Url = parts[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  function clearAuthTokens() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('vlk_token');
        localStorage.removeItem('vlk_user');
      }
    } catch (e) {}
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('vlk_token');
        sessionStorage.removeItem('vlk_user');
      }
    } catch (e) {}
  }

  /**
   * Guards protected pages (student or teacher) synchronously in <head>.
   * If unauthenticated, expired, or role-mismatched, immediately redirects
   * using location.replace() before the <body> is painted (Zero FOUC).
   */
  function guardPage(requiredRole) {
    var token = getStoredToken();
    var currentPath = window.location.pathname + window.location.search + window.location.hash;
    var targetLogin = requiredRole === 'teacher' ? '/teacher/login.html' : '/student/login.html';
    var returnUrlParam = encodeURIComponent(currentPath);

    if (!token) {
      window.location.replace(targetLogin + '?returnUrl=' + returnUrlParam);
      return false;
    }

    var payload = parseJwtPayload(token);
    if (!payload) {
      clearAuthTokens();
      window.location.replace(targetLogin + '?returnUrl=' + returnUrlParam);
      return false;
    }

    // Check expiration (exp is in seconds)
    if (payload.exp && (payload.exp * 1000) < Date.now()) {
      clearAuthTokens();
      window.location.replace(targetLogin + '?expired=1&returnUrl=' + returnUrlParam);
      return false;
    }

    // Check role mismatch (teacher on student page or vice versa)
    if (requiredRole && payload.role !== requiredRole && payload.role !== 'admin') {
      window.location.replace(targetLogin + '?mismatch=' + encodeURIComponent(payload.role || 'unknown') + '&returnUrl=' + returnUrlParam);
      return false;
    }

    return true;
  }

  /**
   * Guards login pages in <head>. If user is already authenticated with a valid token,
   * immediately bypasses login form and routes directly to destination or returnUrl.
   */
  function guardLoginPage(role) {
    var token = getStoredToken();
    if (!token) return;

    var payload = parseJwtPayload(token);
    if (!payload) {
      clearAuthTokens();
      return;
    }

    if (payload.exp && (payload.exp * 1000) < Date.now()) {
      clearAuthTokens();
      return;
    }

    if (payload.role === role || payload.role === 'admin') {
      var params = new URLSearchParams(window.location.search);
      var returnUrl = params.get('returnUrl');
      if (returnUrl && returnUrl.startsWith('/') && !returnUrl.includes('login.html')) {
        window.location.replace(returnUrl);
      } else if (role === 'teacher') {
        window.location.replace('/teacher/dashboard.html');
      } else {
        window.location.replace('/student/home.html');
      }
    }
  }

  /**
   * Helper to check current login state without redirecting.
   */
  function getAuthState() {
    var token = getStoredToken();
    if (!token) return { isLoggedIn: false, role: null, user: null };
    var payload = parseJwtPayload(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      clearAuthTokens();
      return { isLoggedIn: false, role: null, user: null };
    }
    return {
      isLoggedIn: true,
      role: payload.role,
      user: payload
    };
  }

  window.VLKAuthGuard = {
    guardPage: guardPage,
    guardLoginPage: guardLoginPage,
    getAuthState: getAuthState,
    clearAuthTokens: clearAuthTokens
  };

})(typeof window !== 'undefined' ? window : this);

// ============================================================
//  VirtuLab Kenya — Shared Theme Management Module
// ============================================================

const THEME_ICONS = {
  light: '<svg class="theme-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
  dark: '<svg class="theme-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
  green: '<svg class="theme-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0"></path><line x1="6" y1="16" x2="18" y2="16"></line></svg>'
};

const THEME_LABELS = {
  light: 'Theme: Light (Tap to switch)',
  dark: 'Theme: Dark (Tap to switch)',
  green: 'Theme: Lab (Tap to switch)'
};

function getStoredTheme() {
  return localStorage.getItem('vlk_theme') || 'light';
}

function initTheme() {
  const theme = getStoredTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeButtons();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('vlk_theme', theme);
  updateThemeButtons();
}

function cycleTheme() {
  const themes = ['light', 'dark', 'green'];
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const idx = themes.indexOf(current);
  const next = themes[(idx + 1) % themes.length];
  setTheme(next);
  return next;
}

function updateThemeButtons() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';

  // Multi-button chips (desktop)
  document.querySelectorAll('.theme-btn, .theme-chip, .theme-btn-chip').forEach(btn => {
    const themeVal = btn.dataset.theme || btn.dataset.themeVal || btn.getAttribute('data-theme') || btn.getAttribute('data-theme-val');
    if (themeVal) {
      btn.classList.toggle('active', themeVal === current);
    }
  });

  // Single toggle button (mobile / small screens)
  document.querySelectorAll('.theme-single-toggle-btn').forEach(btn => {
    btn.setAttribute('data-current-theme', current);
    btn.innerHTML = THEME_ICONS[current] || THEME_ICONS.light;
    const label = THEME_LABELS[current] || THEME_LABELS.light;
    btn.setAttribute('title', label);
    btn.setAttribute('aria-label', label);
    if (btn.hasAttribute('data-tooltip')) {
      btn.setAttribute('data-tooltip', label);
    }
  });
}

if (typeof window !== 'undefined') {
  window.getStoredTheme = getStoredTheme;
  window.initTheme = initTheme;
  window.setTheme = setTheme;
  window.cycleTheme = cycleTheme;
  window.toggleTheme = cycleTheme;
  window.updateThemeButtons = updateThemeButtons;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
}

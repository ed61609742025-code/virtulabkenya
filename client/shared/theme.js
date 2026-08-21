// ============================================================
//  VirtuLab Kenya — Shared Theme Management Module
// ============================================================

function getStoredTheme() {
  return localStorage.getItem('vlk_theme') || 'dark';
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

function updateThemeButtons() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  document.querySelectorAll('.theme-btn, .theme-chip, .theme-btn-chip').forEach(btn => {
    const themeVal = btn.dataset.theme || btn.dataset.themeVal || btn.getAttribute('data-theme') || btn.getAttribute('data-theme-val');
    btn.classList.toggle('active', themeVal === current);
  });
}

if (typeof window !== 'undefined') {
  window.getStoredTheme = getStoredTheme;
  window.initTheme = initTheme;
  window.setTheme = setTheme;
  window.updateThemeButtons = updateThemeButtons;

  document.addEventListener('DOMContentLoaded', initTheme);
}

// ============================================================
//  VirtuLab Kenya — Shared Auth Forms Helper
//  Provides key listeners and helper utilities for login/registration
// ============================================================

function setupFormKeyListeners(formId, submitFunction) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitFunction();
      }
    });
  });
}

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
  window.setupFormKeyListeners = setupFormKeyListeners;
  window.escapeHtml = escapeHtml;
}

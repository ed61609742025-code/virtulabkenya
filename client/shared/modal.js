// ============================================================
//  VirtuLab Kenya — Shared Modal UI Utility
// ============================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

function initModalBackdropClicks() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-backdrop')) {
      e.target.style.display = 'none';
    }
  });
}

if (typeof window !== 'undefined') {
  window.openModal = openModal;
  window.closeModal = closeModal;
  document.addEventListener('DOMContentLoaded', initModalBackdropClicks);
}

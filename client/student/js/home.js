/**
 * VirtuLab Kenya — Student Home Workstation Script
 */

// Tab switching handler
function switchStudentSubTab(tabId, isUserGesture = true) {
  if (tabId === 'reference') {
    window.location.href = 'reference.html';
    return;
  }
  if (tabId === 'achievements') {
    window.location.href = 'history.html';
    return;
  }
  const tabs = ['benches', 'research'];
  if (!tabs.includes(tabId)) tabId = 'benches';

  if (isUserGesture && window.BrilliantUI) {
    window.BrilliantUI.audio.playClick();
    window.BrilliantUI.vibrate(10);
  }

  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn_${t}`);
    const mBtn = document.getElementById(`mTabBtn_${t}`);
    const panel = document.getElementById(`panel_${t}`);

    const isActive = (t === tabId);
    if (btn) {
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    if (mBtn) {
      mBtn.classList.toggle('active', isActive);
      mBtn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    if (panel) panel.classList.toggle('active', isActive);
  });

  // Auto-scroll active subtab button into view on mobile
  const activeBtn = document.getElementById(`tabBtn_${tabId}`);
  if (activeBtn && typeof activeBtn.scrollIntoView === 'function' && window.innerWidth <= 768) {
    try {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } catch (err) {}
  }

  // Update URL hash without jumping
  history.replaceState(null, null, `#${tabId}`);
}

// Redirect helpers for Profile & Settings
function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  window.location.href = 'profile.html';
}

function closeUserDropdown() {}

function togglePasswordPanel() {
  window.location.href = 'profile.html#securitySection';
}

function toggleTeacherLinkPanel() {
  window.location.href = 'profile.html#classroomSection';
}

// Focus assignments section helper
function focusAssignmentsSection(e) {
  if (e) e.preventDefault();
  switchStudentSubTab('benches', !!e);
  const targetEl = document.getElementById('zone_assignments');
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  history.replaceState(null, null, '#assignments');
}

// Handle initial tab hash on page load
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'assignments') {
    focusAssignmentsSection();
  } else if (hash === 'reference') {
    window.location.href = 'reference.html';
  } else if (hash === 'achievements') {
    window.location.href = 'history.html';
  } else if (hash && ['benches', 'research'].includes(hash)) {
    switchStudentSubTab(hash, false);
  }

  // Smooth scroll for quick-jump navigation
  document.querySelectorAll('.quick-jump-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const targetId = chip.getAttribute('href');
      if (targetId === '#assignments') {
        focusAssignmentsSection(e);
      } else if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
});

// Ensure globally accessible for inline HTML onclick handlers
window.switchStudentSubTab = switchStudentSubTab;
window.toggleUserDropdown = toggleUserDropdown;
window.closeUserDropdown = closeUserDropdown;
window.togglePasswordPanel = togglePasswordPanel;
window.toggleTeacherLinkPanel = toggleTeacherLinkPanel;
window.focusAssignmentsSection = focusAssignmentsSection;

function dismissStudyTip() {
  const card = document.getElementById('studyTipCard');
  const restoreWrap = document.getElementById('studyTipRestoreWrap');
  if (card) {
    card.classList.add('tip-card-dismissing');
    setTimeout(() => {
      card.style.display = 'none';
      card.classList.remove('tip-card-dismissing');
      if (restoreWrap) restoreWrap.style.display = 'block';
    }, 220);
    document.documentElement.classList.add('vlk-tip-dismissed');
    try { localStorage.setItem('vlk_study_tip_dismissed', 'true'); } catch(e) {}
  }
}

function restoreStudyTip() {
  const card = document.getElementById('studyTipCard');
  const restoreWrap = document.getElementById('studyTipRestoreWrap');
  document.documentElement.classList.remove('vlk-tip-dismissed');
  const earlyStyle = document.getElementById('vlkStudyTipEarlyStyle');
  if (earlyStyle) earlyStyle.remove();
  if (card) {
    card.style.display = 'block';
    card.style.opacity = '0';
    card.style.transform = 'translateY(-6px)';
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }
  if (restoreWrap) restoreWrap.style.display = 'none';
  try { localStorage.removeItem('vlk_study_tip_dismissed'); } catch(e) {}
}

window.VLK = window.VLK || {};
window.VLK.switchStudentSubTab = window.switchStudentSubTab = switchStudentSubTab;
window.VLK.toggleUserDropdown = window.toggleUserDropdown = toggleUserDropdown;
window.VLK.dismissStudyTip = window.dismissStudyTip = dismissStudyTip;
window.VLK.restoreStudyTip = window.restoreStudyTip = restoreStudyTip;

function initStudyTipState() {
  try {
    if (localStorage.getItem('vlk_study_tip_dismissed') === 'true') {
      const card = document.getElementById('studyTipCard');
      const restoreWrap = document.getElementById('studyTipRestoreWrap');
      if (card) card.style.display = 'none';
      if (restoreWrap) restoreWrap.style.display = 'block';
    }
  } catch(e) {}
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initStudyTipState);
} else {
  initStudyTipState();
}

// Highlight active bottom nav item based on current page
(function() {
  const page = window.location.pathname.split('/').pop() || 'home.html';
  const map = {
    'home.html': 'bnav-home',
    'lab.html': 'bnav-lab',
    'mock_exams.html': 'bnav-exams',
    'composite_exam.html': 'bnav-exams',
    'reference.html': 'bnav-reference',
    'history.html': 'bnav-history',
    'profile.html': 'bnav-profile'
  };
  const activeId = map[page];
  if (activeId) {
    document.querySelectorAll('.vlk-bottom-nav-item').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(activeId);
    if (el) el.classList.add('active');
  }
})();

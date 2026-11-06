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


// Dropdown and Mobile Navigation Drawer controls
function toggleLabBenchesDropdown(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const dd = document.getElementById('labBenchesDropdown');
  const trigger = document.getElementById('labBenchesTrigger');
  if (!dd) return;
  const isOpen = dd.classList.toggle('open');
  if (trigger) trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeLabBenchesDropdown() {
  const dd = document.getElementById('labBenchesDropdown');
  const trigger = document.getElementById('labBenchesTrigger');
  if (dd) dd.classList.remove('open');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function toggleMobileNavDrawer(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const drawer = document.getElementById('vlkMobileDrawer');
  const backdrop = document.getElementById('vlkMobileDrawerBackdrop');
  const toggleBtn = document.getElementById('mobileNavToggleBtn');
  if (!drawer) return;

  const isActive = drawer.classList.toggle('active');
  if (backdrop) backdrop.classList.toggle('active', isActive);
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  drawer.setAttribute('aria-hidden', isActive ? 'false' : 'true');

  if (isActive) {
    document.body.style.overflow = 'hidden';
    try {
      const rawUser = localStorage.getItem('vlk_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const nameEl = document.getElementById('drawerStudentName');
        const avatarEl = document.getElementById('drawerStudentAvatar');
        if (nameEl && u.name) nameEl.textContent = u.name;
        if (avatarEl && window.__studentInitials) avatarEl.textContent = window.__studentInitials;
      }
    } catch (err) {}
  } else {
    document.body.style.overflow = '';
  }
}

function closeMobileNavDrawer() {
  const drawer = document.getElementById('vlkMobileDrawer');
  const backdrop = document.getElementById('vlkMobileDrawerBackdrop');
  const toggleBtn = document.getElementById('mobileNavToggleBtn');
  if (drawer) {
    drawer.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
  }
  if (backdrop) backdrop.classList.remove('active');
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  const dd = document.getElementById('labBenchesDropdown');
  if (dd && !dd.contains(e.target)) {
    closeLabBenchesDropdown();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLabBenchesDropdown();
    closeMobileNavDrawer();
  }
});

window.toggleLabBenchesDropdown = toggleLabBenchesDropdown;
window.closeLabBenchesDropdown = closeLabBenchesDropdown;
window.toggleMobileNavDrawer = toggleMobileNavDrawer;
window.closeMobileNavDrawer = closeMobileNavDrawer;
if (window.VLK) {
  window.VLK.toggleLabBenchesDropdown = toggleLabBenchesDropdown;
  window.VLK.toggleMobileNavDrawer = toggleMobileNavDrawer;
}

// ── Mobile Student Home Workstation Enhancements ──
function initMobileStudentWorkstation() {
  // 1. Personalized Greeting & School Identity
  try {
    const rawUser = localStorage.getItem('vlk_user') || sessionStorage.getItem('vlk_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u) {
        const greetingEl = document.getElementById('studentGreetingName');
        if (greetingEl && u.name) {
          const firstName = u.name.trim().split(/\s+/)[0];
          greetingEl.textContent = firstName || u.name;
        }

        const schoolEl = document.getElementById('candidateSchoolBadge');
        if (schoolEl) {
          const schoolName = u.school_name || u.school_code || (u.admission_number ? `Adm: ${u.admission_number}` : 'VirtuLab KCSE Candidate');
          schoolEl.textContent = schoolName;
        }

        const formEl = document.getElementById('candidateFormBadge');
        if (formEl) {
          const formName = u.grade || u.form || 'Form 4 Candidate';
          formEl.textContent = formName.toString().toLowerCase().includes('form') ? formName : `Form ${formName} Candidate`;
        }
      }
    }
  } catch (err) {}

  // 2. Real-time Online / Offline PWA Connectivity Watcher
  function updateNetworkState() {
    const isOnline = navigator.onLine;
    const netPill = document.getElementById('heroNetPill');
    const netDot = document.getElementById('netDot');
    const netText = document.getElementById('heroNetText');

    if (netPill && netDot && netText) {
      if (isOnline) {
        netPill.classList.remove('offline');
        netDot.className = 'net-dot online';
        netText.textContent = 'Online';
      } else {
        netPill.classList.add('offline');
        netDot.className = 'net-dot offline';
        netText.textContent = 'Offline Ready';
      }
    }
  }

  window.addEventListener('online', updateNetworkState);
  window.addEventListener('offline', updateNetworkState);
  updateNetworkState();

  // 3. Synchronize Big 4 "Resume Lab" Action with Active Bench Registry
  function syncResumeActionCard() {
    try {
      const resumeCard = document.getElementById('mqaResumeCard');
      const resumeTitle = document.getElementById('mqaResumeTitle');
      const resumeSub = document.getElementById('mqaResumeSub');
      const mainResumeTitle = document.getElementById('resumeTitle');
      const mainResumeLaunchBtn = document.getElementById('resumeLaunchBtn');

      if (mainResumeTitle && resumeTitle && mainResumeTitle.textContent.trim()) {
        const t = mainResumeTitle.textContent.trim();
        resumeTitle.textContent = t.length > 28 ? t.substring(0, 26) + '…' : t;
      }
      if (mainResumeLaunchBtn && resumeCard && mainResumeLaunchBtn.getAttribute('href')) {
        resumeCard.setAttribute('href', mainResumeLaunchBtn.getAttribute('href'));
      }
    } catch (e) {}
  }

  // Poll once shortly after dashboard data loads
  setTimeout(syncResumeActionCard, 800);
  setTimeout(syncResumeActionCard, 2400);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initMobileStudentWorkstation);
} else {
  initMobileStudentWorkstation();
}
}

/**
 * VirtuLab Kenya — Student Home Workstation Script
 */
// Tab switching handler
    function switchStudentSubTab(tabId, isUserGesture = true) {
      const tabs = ['benches', 'reference', 'achievements', 'research'];
      if (!tabs.includes(tabId)) tabId = 'benches';

      if (isUserGesture && window.BrilliantUI) {
        window.BrilliantUI.audio.playClick();
        window.BrilliantUI.vibrate(10);
      }

      tabs.forEach(t => {
        const btn = document.getElementById(`tabBtn_${t}`);
        const mBtn = document.getElementById(`mTabBtn_${t}`);
        const panel = document.getElementById(`panel_${t}`);

        if (btn) btn.classList.toggle('active', t === tabId);
        if (mBtn) mBtn.classList.toggle('active', t === tabId);
        if (panel) panel.classList.toggle('active', t === tabId);
      });

      // Update URL hash without jumping
      history.replaceState(null, null, `#${tabId}`);

      // Resize and re-align charts if switching to achievements tab
      if (tabId === 'achievements') {
        if (typeof window.resizeStudentCharts === 'function') {
          setTimeout(window.resizeStudentCharts, 60);
        }
      }
    }

    // Toggle user dropdown
    function toggleUserDropdown(e) {
      if (e) e.stopPropagation();
      const dropdown = document.getElementById('userDropdown');
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      }
    }

    // Toggle password update panel
    function togglePasswordPanel() {
      const wrap = document.getElementById('passwordPanelWrap');
      if (wrap) {
        wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
        if (wrap.style.display === 'block') {
          wrap.scrollIntoView({ behavior: 'smooth' });
          // Populate hidden username field from JWT so the browser password
          // manager knows which account this credential change belongs to.
          try {
            const tok = localStorage.getItem('vlk_token') || sessionStorage.getItem('vlk_token');
            if (tok) {
              const payload = JSON.parse(atob(tok.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
              const emailField = document.getElementById('pwUsername');
              if (emailField && payload.email) emailField.value = payload.email;
            }
          } catch (e) { /* non-fatal */ }
        }
      }
      const dropdown = document.getElementById('userDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }

    // Close user dropdown on outer click
    document.addEventListener('click', (e) => {
      const userDropdown = document.getElementById('userDropdown');
      const userMenuBtn = document.getElementById('userMenuBtn');
      if (userDropdown && userDropdown.style.display === 'block') {
        if (!userDropdown.contains(e.target) && (!userMenuBtn || !userMenuBtn.contains(e.target))) {
          userDropdown.style.display = 'none';
        }
      }
    });

    // Focus assignments section helper
    function focusAssignmentsSection(e) {
      if (e) e.preventDefault();
      switchStudentSubTab('benches', !!e);
      const targetEl = document.getElementById('zone_assignments');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const dropdown = document.getElementById('userDropdown');
      if (dropdown) dropdown.style.display = 'none';
      history.replaceState(null, null, '#assignments');
    }
    window.focusAssignmentsSection = focusAssignmentsSection;

    // Handle initial tab hash on page load
    window.addEventListener('DOMContentLoaded', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'assignments') {
        focusAssignmentsSection();
      } else if (hash && ['benches', 'reference', 'achievements', 'research'].includes(hash)) {
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
window.togglePasswordPanel = togglePasswordPanel;
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
    try { localStorage.setItem('vlk_study_tip_dismissed', 'true'); } catch(e) {}
  }
}
window.dismissStudyTip = dismissStudyTip;

function restoreStudyTip() {
  const card = document.getElementById('studyTipCard');
  const restoreWrap = document.getElementById('studyTipRestoreWrap');
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
window.restoreStudyTip = restoreStudyTip;

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
        'history.html': 'bnav-history'
      };
      const activeId = map[page];
      if (activeId) {
        document.querySelectorAll('.vlk-bottom-nav-item').forEach(el => el.classList.remove('active'));
        const el = document.getElementById(activeId);
        if (el) el.classList.add('active');
      }
    })();

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

      // Resize and re-align charts if switching to achievements tab
      if (tabId === 'achievements') {
        if (typeof window.ensureChartJs === 'function') {
          window.ensureChartJs(() => {
            if (typeof window.resizeStudentCharts === 'function') {
              setTimeout(window.resizeStudentCharts, 60);
            }
          });
        } else if (typeof window.resizeStudentCharts === 'function') {
          setTimeout(window.resizeStudentCharts, 60);
        }
      }
    }

    // Toggle user profile dropdown / mobile bottom sheet
    function toggleUserDropdown(e) {
      if (e) e.stopPropagation();
      const dropdown = document.getElementById('userDropdown');
      const backdrop = document.getElementById('userBackdrop');
      if (dropdown) {
        const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
        dropdown.style.display = isHidden ? 'block' : 'none';
        if (backdrop) {
          backdrop.style.display = isHidden ? 'block' : 'none';
        }
        // Sync avatar initials into sheet
        const mainAvatar = document.getElementById('heroStudentAvatar');
        const sheetAvatar = document.getElementById('sheetStudentAvatar');
        if (mainAvatar && sheetAvatar) {
          sheetAvatar.textContent = mainAvatar.textContent || 'ST';
        }
        if (isHidden && window.innerWidth <= 768) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    }

    function closeUserDropdown() {
      const dropdown = document.getElementById('userDropdown');
      const backdrop = document.getElementById('userBackdrop');
      if (dropdown) dropdown.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
      document.body.style.overflow = '';
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
      closeUserDropdown();
    }

    // Close user dropdown on outer click
    document.addEventListener('click', (e) => {
      const userDropdown = document.getElementById('userDropdown');
      const userMenuBtn = document.getElementById('userMenuBtn');
      const bnavProfile = document.getElementById('bnav-profile');
      if (userDropdown && userDropdown.style.display === 'block') {
        const clickedInside = userDropdown.contains(e.target) || 
                              (userMenuBtn && userMenuBtn.contains(e.target)) ||
                              (bnavProfile && bnavProfile.contains(e.target));
        if (!clickedInside) {
          closeUserDropdown();
        }
      }
    });

    // Close overlays on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeUserDropdown();
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
window.closeUserDropdown = closeUserDropdown;
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
        'history.html': 'bnav-history'
      };
      const activeId = map[page];
      if (activeId) {
        document.querySelectorAll('.vlk-bottom-nav-item').forEach(el => el.classList.remove('active'));
        const el = document.getElementById(activeId);
        if (el) el.classList.add('active');
      }
    })();

// ══════════════════════════════════════════════════════════════════
//  PRACTICAL DIAGNOSTIC DRILLS & KNEC MICRO-DRILLS CONTROLLER
// ══════════════════════════════════════════════════════════════════
(function() {
  'use strict';

  let _activeHomeDrill = null;
  let _homeDrillTimerInterval = null;

  function initDiagnosticDrills() {
    try {
      // 1. Hydrate Personal Best Scores from Speed Battle localStorage
      const modes = ['blitz', 'qualitative', 'titration', 'organic', 'energy', 'survival'];
      let topScore = 0;

      modes.forEach(m => {
        const key = 'virtulab_speed_battle_best_' + m;
        const val = parseInt(localStorage.getItem(key) || '0', 10);
        const scoreEl = document.getElementById(`bestScore_${m}`);
        if (scoreEl) {
          if (val > 0) {
            scoreEl.textContent = `⭐ Best: ${val} pts`;
            scoreEl.classList.add('has-score');
            if (val > topScore) topScore = val;
          } else {
            scoreEl.textContent = '⭐ Untested';
            scoreEl.classList.remove('has-score');
          }
        }
      });

      const topScoreValEl = document.getElementById('drillTopScoreVal');
      if (topScoreValEl) {
        topScoreValEl.textContent = topScore > 0 ? topScore : '0';
      }

      // 2. Hydrate Warmup CTA State
      const completedDate = localStorage.getItem('virtulab_warmup_completed_date');
      const todayStr = new Date().toDateString();
      const warmupTextEl = document.getElementById('drillWarmupCtaText');
      if (warmupTextEl && completedDate === todayStr) {
        warmupTextEl.textContent = '✓ Warmup Completed (Replay) →';
      }

      // 3. Hydrate KNEC Deduction Rule Mastery Badges
      const knecCodes = ['D', 'PA', 'AC', 'INORG', 'ORG'];
      knecCodes.forEach(code => {
        const rawScore = localStorage.getItem('vlk_knec_drill_mastery_' + code);
        const badgeEl = document.getElementById(`knecStatusBadge_${code}`);
        if (badgeEl && rawScore !== null) {
          const numScore = parseInt(rawScore, 10);
          if (numScore >= 24) {
            badgeEl.innerHTML = `✓ Mastered (${numScore}/30)`;
            badgeEl.classList.add('is-mastered');
          } else {
            badgeEl.textContent = `Score: ${numScore}/30`;
          }
        }
      });
    } catch (err) {
      console.warn('[Diagnostic Drills] Error hydrating stats:', err);
    }
  }

  function filterDiagnosticDrills(filter) {
    const chips = document.querySelectorAll('.drill-filter-chip');
    chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-filter') === filter));

    const knecPanel = document.getElementById('knecDeductionPanel');
    const cardsGrid = document.getElementById('drillCardGrid');
    const cards = document.querySelectorAll('.drill-item-card-upgraded');

    if (filter === 'knec_rules') {
      if (knecPanel) knecPanel.style.display = 'block';
      if (cardsGrid) cardsGrid.style.display = 'none';
      if (knecPanel) knecPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (filter === 'speed') {
      if (knecPanel) knecPanel.style.display = 'none';
      if (cardsGrid) cardsGrid.style.display = 'grid';
      cards.forEach(c => c.style.display = 'flex');
    } else if (filter === 'paper3') {
      if (knecPanel) knecPanel.style.display = 'block';
      if (cardsGrid) cardsGrid.style.display = 'grid';
      cards.forEach(c => {
        const cat = c.getAttribute('data-category') || '';
        c.style.display = cat.includes('paper3') ? 'flex' : 'none';
      });
    } else {
      // 'all'
      if (knecPanel) knecPanel.style.display = 'block';
      if (cardsGrid) cardsGrid.style.display = 'grid';
      cards.forEach(c => c.style.display = 'flex');
    }
  }

  function openHomeRemediationDrill(code) {
    const lookupCode = (code === 'AC') ? 'AC/FA' : code;
    if (!window.KnecRemediation || typeof window.KnecRemediation.getDrill !== 'function') {
      alert('Remediation Drill Engine is initializing. Please wait a moment and try again.');
      return;
    }

    const drill = window.KnecRemediation.getDrill(lookupCode);
    if (!drill) {
      alert(`Drill for competency "${code}" could not be loaded.`);
      return;
    }

    _activeHomeDrill = {
      code,
      lookupCode,
      drill,
      timeLeft: drill.durationSeconds || 300
    };

    const modal = document.getElementById('homeRemediationDrillModal');
    const titleEl = document.getElementById('homeDrillHeaderTitle');
    const iconEl = document.getElementById('homeDrillHeaderIcon');
    const ruleEl = document.getElementById('homeDrillExaminerRuleText');
    const timerDisplay = document.getElementById('homeDrillTimerDisplay');
    const qList = document.getElementById('homeDrillQuestionsList');
    const activeStage = document.getElementById('homeDrillActiveStage');
    const resultStage = document.getElementById('homeDrillResultStage');

    if (!modal) return;

    const iconMap = { 'D': '📏', 'PA': '⚖️', 'AC': '🎯', 'AC/FA': '🎯', 'INORG': '🧂', 'ORG': '🧫' };
    if (iconEl) iconEl.textContent = iconMap[code] || '⚡';
    if (titleEl) titleEl.textContent = drill.title || 'KNEC Practical Drill';
    if (ruleEl) ruleEl.textContent = drill.examinerRule || 'Apply KNEC official criteria strictly.';
    if (timerDisplay) timerDisplay.textContent = '05:00';

    if (activeStage) activeStage.style.display = 'block';
    if (resultStage) resultStage.style.display = 'none';

    // Populate Questions
    if (qList) {
      qList.innerHTML = (drill.questions || []).map((q, idx) => {
        let inputHtml = '';
        if (q.type === 'single_choice' && q.options) {
          inputHtml = `
            <div class="drill-options-grid">
              ${q.options.map(opt => `
                <label class="drill-option-row">
                  <input type="radio" name="q_${q.id}" value="${opt.id}" required>
                  <span><b>(${opt.id})</b> ${opt.text}</span>
                </label>
              `).join('')}
            </div>
          `;
        } else if (q.type === 'multi_select' && q.options) {
          inputHtml = `
            <div class="drill-options-grid">
              ${q.options.map(opt => `
                <label class="drill-option-row">
                  <input type="checkbox" name="q_${q.id}" value="${opt.id}">
                  <span><b>(${opt.id})</b> ${opt.text}</span>
                </label>
              `).join('')}
            </div>
          `;
        } else if (q.type === 'text_input') {
          inputHtml = `
            <div style="margin-top:10px;">
              <input type="text" name="q_${q.id}" class="kcse-input" placeholder="${q.placeholder || 'Type your answer...'}" style="width:100%; padding:10px 14px; font-size:0.9rem; border-radius:8px; border:1px solid var(--card-border); background:var(--card-bg); color:var(--text-main);" required autocomplete="off">
            </div>
          `;
        }

        return `
          <div style="background:var(--card-bg-hover); border:1px solid var(--card-border); border-radius:12px; padding:14px 16px;">
            <div style="font-size:0.75rem; text-transform:uppercase; font-weight:800; color:var(--cyan-accent); margin-bottom:4px;">
              Question ${idx + 1} of ${drill.questions.length}
            </div>
            <div style="font-weight:700; font-size:0.9rem; color:var(--heading-color); line-height:1.45;">
              ${q.prompt}
            </div>
            ${inputHtml}
          </div>
        `;
      }).join('');
    }

    // Start 5-minute countdown
    if (_homeDrillTimerInterval) clearInterval(_homeDrillTimerInterval);
    _homeDrillTimerInterval = setInterval(() => {
      if (!_activeHomeDrill) return;
      _activeHomeDrill.timeLeft--;
      if (timerDisplay) {
        const m = String(Math.floor(_activeHomeDrill.timeLeft / 60)).padStart(2, '0');
        const s = String(_activeHomeDrill.timeLeft % 60).padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;
      }
      if (_activeHomeDrill.timeLeft <= 0) {
        clearInterval(_homeDrillTimerInterval);
        submitHomeRemediationDrill();
      }
    }, 1000);

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeHomeRemediationDrill() {
    if (_homeDrillTimerInterval) {
      clearInterval(_homeDrillTimerInterval);
      _homeDrillTimerInterval = null;
    }
    _activeHomeDrill = null;
    const modal = document.getElementById('homeRemediationDrillModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function submitHomeRemediationDrill() {
    if (!_activeHomeDrill || !window.KnecRemediation) return;
    if (_homeDrillTimerInterval) {
      clearInterval(_homeDrillTimerInterval);
      _homeDrillTimerInterval = null;
    }

    const { code, lookupCode, drill } = _activeHomeDrill;
    const form = document.getElementById('homeRemediationDrillForm');
    const answers = {};

    (drill.questions || []).forEach(q => {
      if (q.type === 'single_choice') {
        const selected = form ? form.querySelector(`input[name="q_${q.id}"]:checked`) : null;
        answers[q.id] = selected ? selected.value : '';
      } else if (q.type === 'multi_select') {
        const checks = form ? form.querySelectorAll(`input[name="q_${q.id}"]:checked`) : [];
        answers[q.id] = Array.from(checks).map(c => c.value);
      } else if (q.type === 'text_input') {
        const input = form ? form.querySelector(`input[name="q_${q.id}"]`) : null;
        answers[q.id] = input ? input.value.trim() : '';
      }
    });

    const evalResult = window.KnecRemediation.gradeDrill(lookupCode, drill.id, answers);

    // Save Score to localStorage
    try {
      localStorage.setItem('vlk_knec_drill_mastery_' + code, evalResult.totalScore.toString());
    } catch(e) {}

    // Update Dashboard Badge
    const badgeEl = document.getElementById(`knecStatusBadge_${code}`);
    if (badgeEl) {
      if (evalResult.isMastery) {
        badgeEl.innerHTML = `✓ Mastered (${evalResult.totalScore}/${evalResult.maxScore})`;
        badgeEl.classList.add('is-mastered');
      } else {
        badgeEl.textContent = `Score: ${evalResult.totalScore}/${evalResult.maxScore}`;
        badgeEl.classList.remove('is-mastered');
      }
    }

    // Render Results in Modal
    const activeStage = document.getElementById('homeDrillActiveStage');
    const resultStage = document.getElementById('homeDrillResultStage');
    const trophyEl = document.getElementById('homeDrillResultTrophy');
    const statusEl = document.getElementById('homeDrillResultStatus');
    const summaryEl = document.getElementById('homeDrillResultSummary');
    const scoreEl = document.getElementById('homeDrillResultScore');
    const badgeResEl = document.getElementById('homeDrillResultBadge');
    const breakdownEl = document.getElementById('homeDrillResultBreakdown');

    if (activeStage) activeStage.style.display = 'none';
    if (resultStage) resultStage.style.display = 'block';

    if (trophyEl) trophyEl.textContent = evalResult.isMastery ? '🏆' : '🎯';
    if (statusEl) statusEl.textContent = evalResult.status;
    if (summaryEl) summaryEl.textContent = evalResult.chiefExaminerAdvice;
    if (scoreEl) scoreEl.textContent = `${evalResult.totalScore} / ${evalResult.maxScore}`;
    if (badgeResEl) {
      badgeResEl.textContent = evalResult.isMastery ? 'Mastery Attained' : 'Needs Practice';
      badgeResEl.style.color = evalResult.isMastery ? '#10B981' : '#F59E0B';
    }

    if (breakdownEl) {
      breakdownEl.innerHTML = (evalResult.itemizedReview || []).map((item, idx) => `
        <div style="background:var(--card-bg); border-left:3px solid ${item.isCorrect ? '#10B981' : '#EF4444'}; border-radius:6px; padding:10px 12px;">
          <div style="font-weight:700; color:var(--heading-color); margin-bottom:2px;">
            Q${idx + 1}: ${item.prompt}
          </div>
          <div style="color:${item.isCorrect ? '#10B981' : '#EF4444'}; font-weight:700; font-size:0.78rem;">
            ${item.feedback}
          </div>
        </div>
      `).join('');
    }

    if (window.BrilliantUI) {
      if (evalResult.isMastery) {
        window.BrilliantUI.audio.playSuccess();
        window.BrilliantUI.celebrate();
      } else {
        window.BrilliantUI.audio.playClick();
      }
    }
  }

  // Export globally
  window.initDiagnosticDrills = initDiagnosticDrills;
  window.filterDiagnosticDrills = filterDiagnosticDrills;
  window.openHomeRemediationDrill = openHomeRemediationDrill;
  window.closeHomeRemediationDrill = closeHomeRemediationDrill;
  window.submitHomeRemediationDrill = submitHomeRemediationDrill;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiagnosticDrills);
  } else {
    initDiagnosticDrills();
  }
})();


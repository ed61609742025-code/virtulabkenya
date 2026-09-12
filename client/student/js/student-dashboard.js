requireStudentLogin();
  updateThemeButtons();

  function switchKnecRefTab(tabNum) {
    [1, 2, 3].forEach(n => {
      const content = document.getElementById(`knecRefContent${n}`);
      const btn = document.getElementById(`btnRefTab${n}`);
      if (content) content.style.display = n === tabNum ? 'block' : 'none';
      if (btn) btn.className = n === tabNum ? 'knec-ref-tab active' : 'knec-ref-tab';
    });
  }

  function setTheme(theme) {
    localStorage.setItem('vlk_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButtons();
    if (typeof renderStudentCharts === 'function' && (cachedStudentSessions || cachedStudentAnalytics)) {
      renderStudentCharts(cachedStudentSessions, cachedStudentAnalytics);
    }
  }
  
  // Set current formatted date
  const today = new Date();
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = 'Today: ' + today.toLocaleDateString('en-US', options);
  ['todayDate', 'todayDateMobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = dateStr;
  });

  let currentStudentUser = getUser();

  function updateStudentTeacherUI(user) {
    if (!user) return;
    const nameDisplay = document.getElementById('studentTeacherNameDisplay');
    const linkBtn = document.getElementById('linkTeacherBtn');
    const statusName = document.getElementById('linkedTeacherStatusName');
    const schoolName = document.getElementById('linkedTeacherSchoolName');
    const codeBadge = document.getElementById('linkedTeacherCodeBadge');
    const codeVal = document.getElementById('linkedTeacherCodeVal');

    if (user.teacherName) {
      if (nameDisplay) nameDisplay.textContent = 'Instructor: ' + user.teacherName;
      if (linkBtn) linkBtn.textContent = 'Change';
      if (statusName) statusName.textContent = user.teacherName + (user.teacherCode ? ` (${user.teacherCode})` : '');
      if (schoolName) schoolName.textContent = user.schoolName ? `School: ${user.schoolName}` : '';
      if (codeBadge) codeBadge.style.display = user.teacherCode ? 'block' : 'none';
      if (codeVal) codeVal.textContent = user.teacherCode || '—';
    } else {
      if (nameDisplay) nameDisplay.textContent = 'Instructor: Not linked';
      if (linkBtn) linkBtn.textContent = 'Link Code';
      if (statusName) statusName.textContent = 'None (Independent Candidate)';
      if (schoolName) schoolName.textContent = user.schoolName ? `School: ${user.schoolName}` : 'Enter your teacher code below to connect.';
      if (codeBadge) codeBadge.style.display = 'none';
    }
  }

  function updateStudentAvatar(name) {
    if (!name || typeof name !== 'string') return;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    let initials = 'ST';
    if (parts.length === 1) {
      initials = parts[0].substring(0, 2).toUpperCase();
    } else if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    const avatarEl = document.getElementById('heroStudentAvatar');
    if (avatarEl) avatarEl.textContent = initials;
  }

  async function initStudentProfile() {
    if (currentStudentUser) {
      ['studentName', 'studentNameMobile'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentStudentUser.name;
      });
      updateStudentAvatar(currentStudentUser.name);
      updateStudentTeacherUI(currentStudentUser);
    }
    try {
      const res = (typeof Auth !== 'undefined' && typeof Auth.me === 'function')
        ? await Auth.me()
        : (typeof apiRequest === 'function' ? await apiRequest('GET', '/auth/me') : null);
      if (res && res.user) {
        currentStudentUser = res.user;
        setUser(currentStudentUser);
        ['studentName', 'studentNameMobile'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = currentStudentUser.name;
        });
        updateStudentAvatar(currentStudentUser.name);
        updateStudentTeacherUI(currentStudentUser);
      }
    } catch (e) {
      console.warn('Could not refresh student profile from server:', e);
    }
  }
  initStudentProfile();

  function toggleTeacherLinkPanel() {
    const wrap = document.getElementById('teacherLinkPanelWrap');
    if (!wrap) return;
    const isHidden = wrap.style.display === 'none';
    wrap.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      const input = document.getElementById('studentTeacherCodeInput');
      if (input) input.focus();
      const msg = document.getElementById('teacherLinkMsg');
      if (msg) msg.innerHTML = '';
    }
  }
  window.toggleTeacherLinkPanel = toggleTeacherLinkPanel;

  async function submitLinkTeacher() {
    const input = document.getElementById('studentTeacherCodeInput');
    const msg = document.getElementById('teacherLinkMsg');
    if (!input || !msg) return;

    const teacherCode = input.value.trim();
    if (!teacherCode) {
      msg.innerHTML = '<span style="color:var(--red-accent);">Please enter your Teacher Code (e.g. TCH8X2).</span>';
      return;
    }

    msg.innerHTML = '<span style="color:var(--cyan-accent);">Connecting to teacher…</span>';

    try {
      const data = await Students.linkTeacher(teacherCode);
      msg.innerHTML = `<span style="color:var(--green-accent);">✓ ${escapeHtml(data.message || 'Successfully linked to teacher!')}</span>`;
      input.value = '';
      
      if (data.student) {
        currentStudentUser = { ...currentStudentUser, ...data.student };
        setUser(currentStudentUser);
        updateStudentTeacherUI(currentStudentUser);
      }

      if (typeof loadAssignments === 'function') loadAssignments();
      if (typeof loadStudentNotifications === 'function') loadStudentNotifications();
    } catch (err) {
      msg.innerHTML = `<span style="color:var(--red-accent);">✗ ${escapeHtml(err.message || 'Failed to link teacher. Check code and try again.')}</span>`;
    }
  }
  window.submitLinkTeacher = submitLinkTeacher;

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

  function formatDate(dateStr) {
    if (!dateStr) return 'No due date';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  let studentNotificationsList = [];

  function toggleNotifDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }

  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const bellBtn = document.getElementById('notifBellBtn');
    if (dropdown && dropdown.style.display === 'block') {
      if (!dropdown.contains(e.target) && (!bellBtn || !bellBtn.contains(e.target))) {
        dropdown.style.display = 'none';
      }
    }
  });

  function getAssignmentTargetUrl(a) {
    let targetUrl = `lab.html?assignment=${a.id}&type=${encodeURIComponent(a.titration_type || 'acidBase')}`;
    let battleMode = 'titration';

    if (a.titration_type === 'qualitative') {
      targetUrl = `qualitative.html?assignment=${a.id}`;
      battleMode = 'qualitative';
    } else if (a.titration_type === 'organic') {
      targetUrl = `organic.html?assignment=${a.id}`;
      battleMode = 'organic';
    } else if (a.titration_type === 'solubility') {
      targetUrl = `solubility.html?assignment=${a.id}`;
      battleMode = 'titration';
    } else if (a.titration_type === 'energy' || a.titration_type === 'displacement' || a.titration_type === 'neutralization' || a.titration_type === 'solution' || a.titration_type === 'combustion') {
      targetUrl = `energy.html?assignment=${a.id}`;
      battleMode = 'energy';
    } else if (a.titration_type === 'rates' || a.titration_type === 'kinetics') {
      targetUrl = `rates.html?assignment=${a.id}`;
      battleMode = 'energy';
    } else if (a.titration_type === 'gas' || a.titration_type === 'gasPrep') {
      targetUrl = `gas_prep.html?assignment=${a.id}`;
      battleMode = 'qualitative';
    } else if (a.titration_type === 'kcseComposite') {
      targetUrl = `composite_exam.html?assignment=${a.id}`;
      battleMode = 'blitz';
    }
    return { targetUrl, battleMode };
  }

  function updateNotificationsUI(assignments) {
    let rawList = [];

    // 1. Pending Prescribed Continuous Assessments
    (assignments || []).filter(a => !a.submitted).forEach(a => {
      const { targetUrl } = getAssignmentTargetUrl(a);
      const dueText = a.due_date ? `Due ${formatDate(a.due_date)}` : 'No set deadline';
      rawList.push({
        id: 'asgn_pending_' + a.id,
        assignmentId: a.id,
        title: '📝 Prescribed Assignment: ' + (a.title || 'Continuous Assessment'),
        message: `${dueText} — ${a.instructions || 'Click to open practical workbench and submit responses.'}`,
        timestamp: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
        type: 'pending_assignment',
        targetUrl,
        rawAssignment: a
      });
    });

    // 2. Marked / Evaluated Assignments
    (assignments || []).filter(a => a.submitted && a.submission_status === 'marked').forEach(a => {
      const score = a.score || (a.evaluation && a.evaluation.score) || a.cs_total_score || a.gas_total_score || a.en_total_score || a.rate_total_score || a.sol_total_score;
      const scoreText = typeof score === 'number' ? `Grade: ${score.toFixed(1)} marks. ` : '';
      rawList.push({
        id: 'asgn_marked_' + a.id,
        assignmentId: a.id,
        title: '🏆 Graded: ' + (a.title || 'Practical Assignment Marked'),
        message: `${scoreText}Your teacher marked this session. Click to view feedback & rubric.`,
        timestamp: a.marked_at ? new Date(a.marked_at).getTime() : Date.now(),
        type: 'marked_assignment',
        targetUrl: null,
        rawAssignment: a
      });
    });

    // 3. Add milestone notification if streak >= 1
    const streakEl = document.getElementById('streakCountMobile') || document.getElementById('streakCount');
    const streakVal = streakEl ? parseInt(streakEl.textContent, 10) : 1;
    if (streakVal > 0) {
      rawList.push({
        id: 'notif_streak_active',
        assignmentId: null,
        title: '🔥 Active Practice Streak',
        message: `${streakVal}-Day Lab Practice Streak active! Keep up the momentum for KCSE Paper 3.`,
        timestamp: Date.now() - 3600000,
        type: 'streak',
        targetUrl: null
      });
    }

    studentNotificationsList = rawList;

    // Filter out notifications read > 24 hours ago
    const activeNotifs = window.VLKNotifs ? window.VLKNotifs.filterActiveNotifications(rawList) : rawList;
    const unreadNotifs = activeNotifs.filter(n => !window.VLKNotifs || !window.VLKNotifs.isRead(n.id));

    const badge = document.getElementById('notifBadge') || document.getElementById('notifCount');
    const bellBtn = document.getElementById('notifBellBtn');
    const list = document.getElementById('notifList');

    if (badge) {
      if (unreadNotifs.length > 0) {
        badge.textContent = unreadNotifs.length;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    if (bellBtn) {
      bellBtn.classList.toggle('has-unread', unreadNotifs.length > 0);
    }

    if (list) {
      if (activeNotifs.length === 0) {
        list.innerHTML = `
          <div style="text-align:center; padding:20px 12px; color:var(--text-muted);">
            <div style="font-size:1.8rem; margin-bottom:6px;">✨</div>
            <div style="font-size:0.84rem; font-weight:700; color:var(--heading-color);">All Caught Up!</div>
            <div style="font-size:0.75rem; margin-top:2px; line-height:1.4;">No active notifications. Read notices automatically disappear after 24 hours.</div>
          </div>
        `;
        return;
      }

      list.innerHTML = activeNotifs.map(n => {
        const isRead = window.VLKNotifs ? window.VLKNotifs.isRead(n.id) : false;
        const hoursLeft = window.VLKNotifs ? window.VLKNotifs.getRemainingHours(n.id) : null;
        const timeAgo = window.VLKNotifs ? window.VLKNotifs.formatTimeAgo(n.timestamp) : '';

        return `
          <div class="notif-item ${isRead ? 'read-active' : 'unread'}" onclick="clickNotifItem('${n.id}', ${n.assignmentId ? n.assignmentId : 'null'})">
            <div style="font-size:0.84rem; font-weight:800; color:var(--heading-color); display:flex; align-items:center; justify-content:space-between; margin-bottom:3px;">
              <span>${isRead ? '📜' : (n.type === 'pending_assignment' ? '📝' : '🟢')} ${escapeHtml(n.title)}</span>
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">${timeAgo}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
              ${escapeHtml(n.message)}
            </div>
            ${n.targetUrl ? `
              <div style="margin-top:6px;">
                <a href="${n.targetUrl}" style="font-size:0.75rem; font-weight:800; color:var(--cyan-accent); text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                  Open Assignment Practical →
                </a>
              </div>
            ` : ''}
            ${isRead && hoursLeft != null ? `
              <div class="notif-expire-tag">
                ⏳ Read — Disappears in ${hoursLeft}h
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }

  function clickNotifItem(notifId, assignmentId) {
    if (window.VLKNotifs) window.VLKNotifs.markAsRead(notifId);
    if (assignmentId && studentNotificationsList) {
      const match = studentNotificationsList.find(item => item.assignmentId === assignmentId && item.id === notifId) ||
                    studentNotificationsList.find(item => item.assignmentId === assignmentId);
      if (match) {
        if (match.type === 'pending_assignment' && match.targetUrl) {
          window.location.href = match.targetUrl;
          return;
        } else if (match.rawAssignment && match.rawAssignment.submitted) {
          openAssignmentFeedbackModal(match.rawAssignment);
        }
      }
    }
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.style.display = 'none';
    loadAssignments();
  }

  function markAllNotificationsRead() {
    const activeNotifs = window.VLKNotifs ? window.VLKNotifs.filterActiveNotifications(studentNotificationsList) : [];
    if (window.VLKNotifs) {
      window.VLKNotifs.markAllAsRead(activeNotifs.map(n => n.id));
    }
    loadAssignments();
  }

  async function loadAssignments() {
    const box = document.getElementById('assignmentsList');
    if (!box) return;
    try {
      const data = await Assignments.getMine();
      const rawAssignments = data.assignments || [];
      const seen = new Set();
      const assignments = [];
      for (const item of rawAssignments) {
        if (item && item.id != null) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            assignments.push(item);
          }
        }
      }
      window._vlk_student_assignments = assignments;

      updateNotificationsUI(assignments);

      const progressHeader = document.getElementById('caProgressHeader');

      if (assignments.length === 0) {
        if (progressHeader) progressHeader.style.display = 'none';
        const hasTeacher = !!(currentStudentUser && (currentStudentUser.teacherName || currentStudentUser.teacherId || currentStudentUser.teacherCode));
        if (!hasTeacher) {
          box.innerHTML = `
            <div class="empty-box-celebrate" style="border-style: solid; border-color: rgba(2, 132, 199, 0.3);">
              <div class="empty-celebrate-badge" style="background: linear-gradient(135deg, #0284C7 0%, #2563EB 100%);" aria-hidden="true">🔗</div>
              <div style="font-weight: 800; font-size: 1.05rem; color: var(--heading-color);">Connect Your Chemistry Teacher</div>
              <div style="font-size: 0.84rem; max-width: 400px; line-height: 1.45; color: var(--text-muted);">
                Link your teacher's code to automatically receive continuous assessment practicals, KCSE mock exams, and teacher evaluations.
              </div>
              <button type="button" class="hero-warmup-btn" onclick="toggleTeacherLinkPanel()" style="padding: 8px 20px; font-size: 0.84rem; min-height: 38px; border-radius: 10px; cursor: pointer; border: none;">
                🔗 Enter Teacher Code →
              </button>
            </div>
          `;
        } else {
          box.innerHTML = `
            <div class="empty-box-celebrate">
              <div class="empty-celebrate-badge" aria-hidden="true">🎉</div>
              <div style="font-weight: 800; font-size: 1.05rem; color: var(--heading-color);">All Caught Up! Zero Backlog</div>
              <div style="font-size: 0.85rem; line-height: 1.5; max-width: 360px; color: var(--text-muted);">
                Superb work! You've cleared every practical prescribed by <strong>${escapeHtml(currentStudentUser?.teacherName || 'your instructor')}</strong>. Keep your winning momentum alive!
              </div>
              <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 4px;">
                <a href="#skillTreeContainer" class="hero-warmup-btn" style="padding: 8px 20px; font-size: 0.84rem; min-height: 38px; border-radius: 10px;">
                  🧪 Practice Free Lab Benches →
                </a>
              </div>
            </div>
          `;
        }
        return;
      }

      // Calculate Continuous Assessment Task Completion Statistics
      const totalCount = assignments.length;
      let markedCount = 0;
      let reviewCount = 0;
      let pendingCount = 0;

      assignments.forEach(a => {
        const isSubmitted = !!a.submitted;
        const score = a.score || (a.evaluation && a.evaluation.score) || a.cs_total_score || a.gas_total_score || a.en_total_score || a.rate_total_score || a.sol_total_score;
        const isGraded = typeof score === 'number' || a.submission_status === 'marked' || a.marked_at != null || a.status === 'marked';
        if (isSubmitted) {
          if (isGraded) markedCount++;
          else reviewCount++;
        } else {
          pendingCount++;
        }
      });

      const submittedCount = markedCount + reviewCount;
      const percentComplete = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

      // Update Continuous Assessment Progress Header
      if (progressHeader) {
        progressHeader.style.display = 'flex';
      }
      const progressFill = document.getElementById('caProgressFill');
      const progressBadge = document.getElementById('caProgressPercentBadge');
      const statMarked = document.getElementById('statChipMarked');
      const statReview = document.getElementById('statChipReview');
      const statPending = document.getElementById('statChipPending');

      if (progressFill) {
        progressFill.style.width = percentComplete + '%';
      }
      if (progressBadge) {
        progressBadge.textContent = `${percentComplete}% Complete (${submittedCount} / ${totalCount} Submitted)`;
        if (percentComplete === 100) {
          progressBadge.className = 'dash-section-badge badge-green';
        } else if (percentComplete > 0) {
          progressBadge.className = 'dash-section-badge badge-blue';
        } else {
          progressBadge.className = 'dash-section-badge badge-amber';
        }
      }
      if (statMarked) statMarked.innerHTML = `<b>${markedCount}</b> Graded`;
      if (statReview) statReview.innerHTML = `<b>${reviewCount}</b> Under Review`;
      if (statPending) statPending.innerHTML = `<b>${pendingCount}</b> Pending`;

      box.innerHTML = assignments.map(a => {
        const isSubmitted = !!a.submitted;
        const score = a.score || (a.evaluation && a.evaluation.score) || a.cs_total_score || a.gas_total_score || a.en_total_score || a.rate_total_score || a.sol_total_score;
        const isGraded = typeof score === 'number' || a.submission_status === 'marked' || a.marked_at != null || a.status === 'marked';
        const isPastDue = !isSubmitted && a.due_date && (new Date(a.due_date).setHours(23, 59, 59, 999) < Date.now());

        const { targetUrl, battleMode } = getAssignmentTargetUrl(a);
        const warmupUrl = `speed_battle.html?mode=${battleMode}&target=${encodeURIComponent(targetUrl)}`;

        let statusChipHtml = '';
        let statusHtml = '';
        if (isSubmitted) {
          if (isGraded) {
            statusChipHtml = `<span class="assign-status-chip is-marked">Graded</span>`;
            statusHtml = `
              <button type="button" class="submitted-pill" onclick="openAssignmentFeedbackModalById(${a.id})">
                View Feedback &amp; Rubric
              </button>
            `;
          } else {
            statusChipHtml = `<span class="assign-status-chip is-review">Under Review</span>`;
            statusHtml = `
              <button type="button" class="submitted-pill is-review" onclick="openAssignmentFeedbackModalById(${a.id})">
                Under Teacher Marking
              </button>
            `;
          }
        } else if (isPastDue) {
          statusChipHtml = `<span class="assign-status-chip is-overdue">Overdue</span>`;
          statusHtml = `
            <div class="assign-actions-row">
              <a href="${targetUrl}" class="pending-pill-btn is-overdue-btn" aria-label="Complete overdue assignment: ${escapeHtml(a.title)}">
                Complete Now →
              </a>
              <a href="${warmupUrl}" class="assign-warmup-icon-btn" title="Take optional 45s pre-lab warmup" aria-label="Warmup Drill">
                ⚡ Warmup
              </a>
            </div>
          `;
        } else {
          statusChipHtml = `<span class="assign-status-chip is-pending">Pending</span>`;
          statusHtml = `
            <div class="assign-actions-row">
              <a href="${targetUrl}" class="pending-pill-btn" aria-label="Start assignment: ${escapeHtml(a.title)}">
                Start Assignment →
              </a>
              <a href="${warmupUrl}" class="assign-warmup-icon-btn" title="Take optional 45s pre-lab warmup" aria-label="Warmup Drill">
                ⚡ Warmup
              </a>
            </div>
          `;
        }

        const dueBase = a.due_date ? `Due ${formatDate(a.due_date)}` : 'No deadline';
        const dueLabel = isPastDue ? `<span style="color:#DC2626; font-weight:700;">⚠️ ${dueBase}</span>` : dueBase;

        return `
          <div class="assignment-card-box">
            <div class="assign-card-top">
              ${statusChipHtml}
              <span class="assign-card-due">${dueLabel}</span>
            </div>
            <div class="assign-card-title">${escapeHtml(a.title)}</div>
            ${statusHtml}
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('Could not load assignments dynamically:', err);
      if (box) {
        box.innerHTML = `
          <div class="empty-box" style="grid-column: 1 / -1; padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; border: 1.5px dashed var(--card-border); border-radius: 8px;">
            <div style="font-size: 1.3rem; margin-bottom: 6px;">⚠️</div>
            <div style="font-weight: 700; color: var(--heading-color); margin-bottom: 4px;">Unable to load assignments right now</div>
            <div style="font-size: 0.78rem; margin-bottom: 12px;">${escapeHtml(err.message || 'Please check your connection or link your teacher code.')}</div>
            <button class="btn btn-secondary" onclick="loadAssignments()" style="padding: 6px 16px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; cursor: pointer;">🔄 Retry</button>
          </div>
        `;
      }
    }
  }

  function openAssignmentFeedbackModalById(id) {
    const list = window._vlk_student_assignments || [];
    const match = list.find(item => item.id == id);
    if (match) {
      openAssignmentFeedbackModal(match);
    }
  }
  window.openAssignmentFeedbackModalById = openAssignmentFeedbackModalById;

  function closeFeedbackModal() {
    const modal = document.getElementById('assignmentFeedbackModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  window.closeFeedbackModal = closeFeedbackModal;
  window.loadAssignments = loadAssignments;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('assignmentFeedbackModal');
      if (modal && modal.style.display !== 'none') {
        closeFeedbackModal();
      }
    }
  });

  function openAssignmentFeedbackModal(a) {
    const modal = document.getElementById('assignmentFeedbackModal');
    if (!modal) return;

    document.getElementById('afTitle').textContent = a.title || 'Assignment Results';
    document.getElementById('afDate').textContent = a.marked_at ? new Date(a.marked_at).toLocaleDateString() : 'Recently';

    const isCorrect = !!a.correct;
    document.getElementById('afStatus').innerHTML = isCorrect
      ? '<span class="pill pill-ok" style="font-size:1.1rem;padding:6px 14px;">✓ Correct (Pass)</span>'
      : '<span class="pill pill-warn" style="font-size:1.1rem;padding:6px 14px;">✗ Review Needed</span>';

    // Polymorphic details object
    let d = {};
    try {
      if (a.details && typeof a.details === 'object') d = a.details;
      else if (typeof a.details === 'string') d = JSON.parse(a.details);
      else if (a.ps_details && typeof a.ps_details === 'object') d = a.ps_details;
      else if (typeof a.ps_details === 'string') d = JSON.parse(a.ps_details);
    } catch (e) {}

    // Polymorphic answer and benchmark formatting
    let sAns = '—';
    let tVal = '—';

    if (a.cs_total_score != null || a.q1_score != null || a.composite_total_score != null) {
      sAns = Number(a.cs_total_score || a.composite_total_score || a.total_score || a.student_answer || 0).toFixed(1) + ' / 40.0 Marks' + (a.cs_grade || a.grade ? ` (${a.cs_grade || a.grade})` : '');
      tVal = '40.0 Marks (Passing: 20.0)';
    } else if (a.gas_total_score != null || a.gas_key) {
      sAns = Number(a.gas_total_score != null ? a.gas_total_score : (a.student_answer || 0)).toFixed(1) + ' / 10.0 Marks';
      tVal = '10.0 Marks (Passing: 6.0)';
    } else if (a.en_total_score != null || a.en_system_id) {
      sAns = Number(a.en_total_score != null ? a.en_total_score : (a.student_answer || 0)).toFixed(1) + ' / 15.0 Marks';
      tVal = '15.0 Marks (Passing: 8.0)';
    } else if (a.rate_total_score != null || a.rate_exp_type) {
      sAns = Number(a.rate_total_score != null ? a.rate_total_score : (a.student_answer || 0)).toFixed(1) + ' / 15.0 Marks' + (a.rate_grade ? ` (${a.rate_grade})` : '');
      tVal = '15.0 Marks (Passing: 8.0)';
    } else if (a.sol_total_score != null || a.solute_key) {
      sAns = Number(a.sol_total_score != null ? a.sol_total_score : (a.student_answer || 0)).toFixed(1) + ' / 5.0 Marks';
      tVal = '5.0 Marks (Passing: 3.0)';
    } else if (a.salt_key || a.true_cation || a.student_cation) {
      sAns = `${escapeHtml(a.student_cation || '—')} / ${escapeHtml(a.student_anion || '—')}`;
      tVal = a.true_cation ? `${escapeHtml(a.true_cation)} / ${escapeHtml(a.true_anion)}` : 'Standard Salt Confirmation';
    } else if (a.compound_key || a.true_functional_group || a.student_functional_group) {
      sAns = `${escapeHtml(a.student_functional_group || '—')}`;
      tVal = a.true_functional_group ? `${escapeHtml(a.true_functional_group)}` : 'Standard Functional Group';
    } else {
      const studentMolarity = a.student_answer ?? a.ps_student_answer ?? d.studentAnswer;
      const targetMolarity = a.true_value ?? a.ps_true_value ?? d.expectedConc;
      sAns = studentMolarity != null ? Number(studentMolarity).toFixed(4) + ' mol/dm³' : '—';
      tVal = targetMolarity != null ? Number(targetMolarity).toFixed(4) + ' mol/dm³' : '—';
    }

    document.getElementById('afStudentAns').textContent = sAns;
    document.getElementById('afTrueVal').textContent = tVal;

    const details = [];

    // 1. Composite Exam
    if (a.q1_score != null || a.q2_score != null || a.q3_score != null || a.cs_total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">📋 KCSE Paper 3 Composite Exam Mark Breakdown</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.84rem;margin-bottom:8px;">
          <div>Q1 Volumetric Titration: <b>${a.q1_score != null ? Number(a.q1_score).toFixed(1) + ' / 15' : '—'}</b></div>
          <div>Q2 Qualitative Salt ID: <b>${a.q2_score != null ? Number(a.q2_score).toFixed(1) + ' / 15' : '—'}</b></div>
          <div>Q3 Organic Chemistry ID: <b>${a.q3_score != null ? Number(a.q3_score).toFixed(1) + ' / 10' : '—'}</b></div>
          <div>KNEC Score: <b>${Number(a.cs_total_score || a.total_score || 0).toFixed(1)} / 40 (${escapeHtml(a.cs_grade || a.grade || '—')})</b></div>
        </div>
      `);
    }

    // 2. Volumetric Titrations
    if (a.ps_titration_type || a.titration_type || a.trial_readings || d.titrationKey || d.studentAnswer != null) {
      const trialReadings = a.trial_readings || d.readings || [];
      const readingsArray = Array.isArray(trialReadings)
        ? trialReadings
        : (trialReadings && Array.isArray(trialReadings.readings) ? trialReadings.readings : []);
      const readings = readingsArray.length > 0
        ? readingsArray.map(r => Number(r).toFixed(2)).join(', ')
        : (d.studentAverage ? Number(d.studentAverage).toFixed(2) : '—');
      const examMarks = trialReadings && trialReadings.examMarks ? trialReadings.examMarks : null;

      const titType = a.ps_titration_type || a.titration_type || d.titrationKey || 'acidBase';
      const titTitle = a.ps_titration_title || a.titration_title || d.titrationTitle || (
        titType === 'redox' ? 'Redox Titration (KMnO₄ vs Fe²⁺)' :
        titType === 'precipitation' ? 'Precipitation Titration (Mohr Method)' :
        titType === 'complexometric' ? 'Complexometric Titration (EDTA Water Hardness)' :
        titType === 'dibasic' ? 'Standardisation of Dibasic Acid (H₂X)' :
        titType === 'tribasic' ? 'Standardisation of Phosphoric Acid (H₃PO₄)' :
        titType === 'weakAcid' ? 'Standardisation of Commercial Vinegar' :
        titType === 'weakBase' ? 'Back Titration of Aqueous Ammonia' : 'Acid-Base Titration (HCl vs NaOH)'
      );

      const indUsed = a.indicator_used || d.indicatorLabel || (
        titType === 'redox' ? 'No indicator needed (self-indicating KMnO₄)' :
        titType === 'precipitation' ? 'Potassium Chromate (K₂CrO₄)' :
        titType === 'complexometric' ? 'Erichrome Black T (EBT)' : 'Phenolphthalein'
      );

      const trialsCount = a.trials_count ?? (readingsArray.length || (d.studentAverage ? 1 : '—'));
      const avgTitre = d.studentAverage ? Number(d.studentAverage).toFixed(2) + ' cm³' : (readingsArray.length > 0 ? Number(readingsArray[0]).toFixed(2) + ' cm³' : '—');

      const studentMolarity = a.student_answer ?? a.ps_student_answer ?? d.studentAnswer;
      const targetMolarity = a.true_value ?? a.ps_true_value ?? d.expectedConc;

      // Question E Step Calculation
      let stepELabel = d.stepELabel;
      let stepEUnit = d.stepEUnit || 'g/dm³';
      let stepEVal = d.massConc;

      if (!stepELabel) {
        if (titType === 'redox') {
          stepELabel = 'Mass of Iron (Fe) in 1.0 dm³ of Solution A (RAM: Fe = 56.0)';
          stepEUnit = 'g';
          if (stepEVal == null && studentMolarity != null) stepEVal = (Number(studentMolarity) * 56.0).toFixed(4);
        } else if (titType === 'precipitation') {
          stepELabel = 'Mass of pure NaCl in 250.0 cm³ flask';
          stepEUnit = 'g';
          if (stepEVal == null && studentMolarity != null) stepEVal = (Number(studentMolarity) * 0.25 * 58.5).toFixed(4);
        } else if (titType === 'complexometric') {
          stepELabel = 'Total Water Hardness as CaCO₃';
          stepEUnit = 'mg/dm³ (ppm)';
          if (stepEVal == null && studentMolarity != null) stepEVal = (Number(studentMolarity) * 100.0 * 1000).toFixed(1);
        } else if (titType === 'dibasic') {
          stepELabel = 'Relative Formula Mass (RFM) of acid H₂X';
          stepEUnit = 'g/mol';
        } else if (titType === 'tribasic') {
          stepELabel = 'Mass of pure H₃PO₄ in 500.0 cm³ bottle';
          stepEUnit = 'g';
          if (stepEVal == null && studentMolarity != null) stepEVal = (Number(studentMolarity) * 0.50 * 98.0).toFixed(4);
        } else if (titType === 'weakAcid') {
          stepELabel = 'Percentage (% w/v) Acidity of Vinegar';
          stepEUnit = '% (w/v)';
        } else if (titType === 'weakBase') {
          stepELabel = 'Volume of dry NH₃ gas at s.t.p.';
          stepEUnit = 'dm³';
          if (stepEVal == null && studentMolarity != null) stepEVal = (Number(studentMolarity) * 22.4).toFixed(3);
        } else {
          stepELabel = 'Mass Concentration of HCl in Solution A';
          stepEUnit = 'g/dm³';
          if (stepEVal == null && studentMolarity != null) stepEVal = (Number(studentMolarity) * 36.5).toFixed(4);
        }
      }

      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">🧪 Volumetric Analysis Details</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.83rem;margin-bottom:10px;background:var(--card-bg);padding:8px 10px;border-radius:8px;border:1px solid var(--card-border);">
          <div>Practical: <b>${escapeHtml(titTitle)}</b></div>
          <div>Indicator: <b>${escapeHtml(indUsed)}</b></div>
          <div>Trials Conducted: <b>${trialsCount}</b> (${readings} cm³)</div>
          <div>Average Titre: <b>${avgTitre}</b></div>
        </div>

        <div style="margin:10px 0;background:var(--card-bg);padding:10px 12px;border-radius:8px;border:1px solid var(--card-border);font-size:0.82rem;line-height:1.65;">
          <div style="font-weight:800;margin-bottom:6px;color:var(--heading-color);">📊 KCSE Volumetric Calculations Breakdown:</div>
          ${d.molesTitrant != null ? `<div>• (b) Moles of titrant in average titre: <b>${Number(d.molesTitrant).toExponential(4)} mol</b></div>` : ''}
          ${d.molesAnalyte != null ? `<div>• (c) Moles of analyte reacted: <b>${Number(d.molesAnalyte).toExponential(4)} mol</b></div>` : ''}
          <div>• (d) Molar concentration: <b>${studentMolarity != null ? Number(studentMolarity).toFixed(4) + ' mol/dm³' : '—'}</b> ${targetMolarity != null ? `<span style="color:var(--text-muted);font-size:0.76rem;">(Standard: ${Number(targetMolarity).toFixed(4)} M)</span>` : ''}</div>
          ${stepEVal != null ? `<div>• (e) ${escapeHtml(stepELabel)}: <b>${stepEVal} ${escapeHtml(stepEUnit)}</b></div>` : ''}
        </div>
      `);

      if (examMarks) {
        details.push(`
          <div style="margin:10px 0;background:var(--card-bg);padding:10px;border-radius:8px;border:1px solid var(--card-border);">
            <div style="font-weight:800;margin-bottom:6px;"><b>Official 15-Mark Examination Breakdown:</b></div>
            <div>• Burette Accuracy (±0.10 cm³): <b>${examMarks.accuracyMarks ?? '—'} / 5</b></div>
            <div>• Concordance of Titres (±0.20 cm³): <b>${examMarks.concordanceMarks ?? '—'} / 3</b></div>
            <div>• Average Titre Computation: <b>${examMarks.averageMarks ?? '—'} / 2</b></div>
            <div>• Molar/Mass Concentration Calculation: <b>${examMarks.concMarks ?? '—'} / 5</b></div>
            <div style="margin-top:4px;color:var(--cyan-accent);font-weight:800;">Total Practical Mark: ${examMarks.totalMarks ?? '—'} / 15</div>
          </div>
        `);
      }
    }

    // 3. Qualitative Salt Analysis
    if (a.salt_key || a.cation_correct != null || a.anion_correct != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">🧫 Qualitative Salt Analysis Details</div>
        <div>Salt Analyzed: <b>${escapeHtml(a.salt_name || a.salt_key || '—')}</b></div>
        <div>Cation Identified: <b>${escapeHtml(a.student_cation || '—')}</b> (${a.cation_correct ? '✓ Correct' : '✗ Incorrect'})</div>
        <div>Anion Identified: <b>${escapeHtml(a.student_anion || '—')}</b> (${a.anion_correct ? '✓ Correct' : '✗ Incorrect'})</div>
        <div>Observations Performed: <b>${a.q_tests_performed ?? '—'} tests (${a.q_tests_correct ?? '—'} accurate)</b></div>
      `);
    }

    // 4. Organic Chemistry
    if (a.compound_key || a.functional_group_correct != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">⚗️ Organic Chemistry Identification</div>
        <div>Organic Sample: <b>${escapeHtml(a.compound_name || a.compound_key || '—')}</b></div>
        <div>Identified Functional Group: <b>${escapeHtml(a.student_functional_group || '—')}</b> (${a.functional_group_correct ? '✓ Correct' : '✗ Mismatch'})</div>
        <div>Confirmatory Tests: <b>${a.o_tests_performed ?? '—'} performed (${a.o_tests_correct ?? '—'} correct)</b></div>
      `);
    }

    // 5. Solubility Curves
    if (a.solute_key || a.sol_total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">🌡️ Solubility Curves & Crystallization</div>
        <div>Target Solute: <b>${escapeHtml(a.solute_name || a.solute_key || '—')}</b></div>
        <div>Crystallization Temp: <b>${a.crystallization_temp != null ? a.crystallization_temp + ' °C' : '—'}</b> (Theoretical: ${a.theoretical_temp != null ? a.theoretical_temp + ' °C' : '—'}, Δ ${a.temp_difference != null ? a.temp_difference + ' °C' : '—'})</div>
        <div>Mark Breakdown: Accuracy <b>${a.sol_accuracy_score ?? 0}/2.0</b> · Graph <b>${a.sol_graph_score ?? 0}/3.0</b> · Total: <b>${Number(a.sol_total_score || 0).toFixed(1)} / 5.0 Marks</b></div>
      `);
    }

    // 6. Thermochemistry Energy Changes
    if (a.en_system_id || a.en_total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">🔥 Thermochemistry & Energy Changes</div>
        <div>Reaction System: <b>${escapeHtml(a.en_system_name || a.en_system_id || '—')}</b></div>
        <div>Temp Change (ΔT): <b>${a.en_temp_change != null ? a.en_temp_change + ' °C' : '—'}</b> (Initial: ${a.en_initial_temp || 0}°C → Peak: ${a.en_final_temp || 0}°C)</div>
        <div>Heat Energy Q: <b>${a.en_heat_quantity != null ? a.en_heat_quantity + ' J' : '—'}</b> · Moles: <b>${a.en_moles != null ? a.en_moles + ' mol' : '—'}</b></div>
        <div>Molar Enthalpy (ΔH): <b>${a.en_molar_enthalpy != null ? a.en_molar_enthalpy + ' kJ/mol' : '—'}</b></div>
        <div>Total Score: <b>${Number(a.en_total_score || 0).toFixed(1)} / 15.0 Marks</b></div>
      `);
    }

    // 7. Reaction Rates & Kinetics
    if (a.rate_exp_type || a.rate_total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">⚡ Reaction Rates & Chemical Kinetics</div>
        <div>Experiment: <b>${escapeHtml(a.rate_exp_title || a.rate_exp_type || '—')}</b></div>
        <div>Dilution Table 1: <b>${Number(a.rate_table_score || 0).toFixed(1)} / 5.0</b> · Rate Graph: <b>${Number(a.rate_graph_score || 0).toFixed(1)} / 4.0</b> · Calculations: <b>${Number(a.rate_calc_score || 0).toFixed(1)} / 6.0</b></div>
        <div>Total Score: <b>${Number(a.rate_total_score || 0).toFixed(1)} / 15.0 Marks (${escapeHtml(a.rate_grade || '—')})</b></div>
      `);
    }

    // 8. Gas Preparation
    if (a.gas_key || a.gas_total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">💨 Gas Preparation & Confirmatory Testing</div>
        <div>Gas Synthesized: <b>${escapeHtml(a.gas_name || a.gas_key || '—')}</b></div>
        <div>Drying Agent: <b>${escapeHtml(a.gas_drying_agent || '—')}</b> (${a.gas_drying_correct ? '✓ Correct' : '✗ Incorrect'})</div>
        <div>Collection Method: <b>${escapeHtml(a.gas_collection_method || '—')}</b> (${a.gas_collection_correct ? '✓ Correct' : '✗ Incorrect'})</div>
        <div>Tests Performed: <b>${a.gas_tests_performed ?? 0} (${a.gas_tests_correct ?? 0} correct)</b> · Total: <b>${Number(a.gas_total_score || 0).toFixed(1)} / 10.0 Marks</b></div>
      `);
    }

    document.getElementById('afDetails').innerHTML = details.length > 0
      ? details.join('')
      : '<i>No additional session details available.</i>';

    const commentEl = document.getElementById('afComments');
    if (commentEl) {
      const comment = a.teacher_feedback
        ? `💬 <b>Teacher Comments & Guidance:</b><br>"${escapeHtml(a.teacher_feedback)}"`
        : '<i>No written comments added by teacher.</i>';
      commentEl.innerHTML = comment;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function updateMwalimuAdvice(sessions) {
    const msgEl = document.getElementById('mwalimuMessage');
    if (!msgEl) return;

    if (!sessions || sessions.length === 0) {
      const welcomeTips = [
        "Jambo! Welcome to VirtuLab Kenya. Start your first Acid-Base titration in Guided Practice mode — I'll guide you step-by-step to master KCSE Paper 3!",
        "Karibu! Begin with Volumetric Titration or Qualitative Analysis. I will analyze your observations in real-time and provide KNEC examiner tips as you practice!",
        "Habari! Ready to boost your KCSE Paper 3 score? Practice Acid-Base or Organic Chemistry and I'll give you customized tips based on your accuracy!"
      ];
      msgEl.textContent = welcomeTips[Math.floor(Math.random() * welcomeTips.length)];
      return;
    }

    const lastSession = sessions[0];
    const incorrectSessions = sessions.filter(s => !s.correct);
    const recentCorrectCount = sessions.slice(0, 5).filter(s => s.correct).length;
    const isStreak = recentCorrectCount >= 3;

    // Helper to get dynamic item from array based on session ID or rotational seed
    const pickTip = (arr, seed = 0) => arr[(Math.abs(seed) + Math.floor(Date.now() / 60000)) % arr.length];

    if (incorrectSessions.length > 0 && (!isStreak || !lastSession.correct)) {
      const recentError = incorrectSessions[0];
      const typeStr = (recentError.titration_title || recentError.titration_type || recentError.salt_key || recentError.compound_name || '').toLowerCase();
      const seed = recentError.id || recentError.session_id || Date.now();

      if (typeStr.includes('redox') || typeStr.includes('kmno4')) {
        const tips = [
          "Tip on Redox Titration (KMnO₄): Potassium permanganate is self-indicating! Stop adding KMnO₄ at the very first permanent faint pink color in the conical flask.",
          "Redox Tip: Always titrate against warm oxalic acid or Fe²⁺ solution. Ensure you read the top of the dark KMnO₄ meniscus accurately!",
          "KNEC Redox Mark: Remember that KMnO₄ acts as its own indicator. Adding excess KMnO₄ turns the solution deep purple and forfeits accuracy marks!"
        ];
        msgEl.textContent = pickTip(tips, seed);
      } else if (typeStr.includes('dibasic') || typeStr.includes('h2so4') || typeStr.includes('sulfuric')) {
        const tips = [
          "Tip on Dibasic Acid Titration: Sulfuric acid (H₂SO₄) reacts in a 1:2 mole ratio with NaOH. Always multiply acid volume by 2 when calculating molarity!",
          "Dibasic Acid Tip: Pay close attention near the endpoint. Add titrant drop-by-drop near color transition to ensure ±0.05 mL accuracy for full KCSE marks!",
          "KNEC Titration Rule: Record all burette readings to 2 decimal places ending strictly in .00 or .50 (e.g. 23.50 cm³, not 23.5 cm)!"
        ];
        msgEl.textContent = pickTip(tips, seed);
      } else if (typeStr.includes('qualitative') || recentError.salt_key || recentError.student_cation) {
        const tips = [
          "Tip on Qualitative Salt ID: Zn²⁺, Al³⁺, and Pb²⁺ all form white ppts soluble in excess NaOH. Use excess NH₃(aq) to confirm Zn²⁺ (soluble) vs Al³⁺/Pb²⁺ (insoluble)!",
          "Salt Analysis Tip: To distinguish Pb²⁺ from Al³⁺, add dilute KI(aq). Pb²⁺ forms a bright yellow precipitate of PbI₂, while Al³⁺ gives no precipitate!",
          "KNEC Observation Rule: Write full descriptive observations (e.g. 'White precipitate soluble in excess to form a colorless solution') to earn maximum KCSE marks!"
        ];
        msgEl.textContent = pickTip(tips, seed);
      } else if (typeStr.includes('organic') || recentError.compound_name || recentError.student_functional_group) {
        const tips = [
          "Tip on Organic Chemistry: Alkenes decolorise bromine water immediately without sunlight. Alkanes require UV light for substitution to occur!",
          "Organic Tip: Carboxylic acids (-COOH) react with NaHCO₃ to produce effervescence of CO₂ gas that turns lime water milky. This is the official KNEC test!",
          "Organic Functional Groups: Warm primary alcohols with acidified K₂Cr₂O₇ — orange dichromate turns green as Cr³⁺ ions are formed."
        ];
        msgEl.textContent = pickTip(tips, seed);
      } else if (typeStr.includes('precipit') || typeStr.includes('mohr')) {
        const tips = [
          "Tip on Mohr's Method (Precipitation Titration): Potassium chromate forms a reddish-brown precipitate of Ag₂CrO₄ at the endpoint. Stop at the first permanent reddish-brown tint!",
          "Precipitation Titration Tip: Vigorous shaking during titration ensures complete precipitation of silver chloride before the endpoint color change."
        ];
        msgEl.textContent = pickTip(tips, seed);
      } else {
        const tips = [
          "Tip on Volumetric Analysis: Always discard your first trial (rough) and average only concordant titres that differ by no more than ±0.10 cm³!",
          "Burette Reading Tip: Ensure eye level is directly horizontal with the lower meniscus of colorless liquids to prevent parallax error!",
          "KNEC Marking Tip: Always state units clearly (e.g. cm³, mol/dm³, g/dm³) in your final calculation steps to avoid penalty marks!"
        ];
        msgEl.textContent = pickTip(tips, seed);
      }
    } else if (isStreak) {
      const streakTips = [
        `Hongera! 🎯 Excellent accuracy streak (${recentCorrectCount}/5 recent correct)! You are building solid paper 3 practical precision. Try KCSE Exam Mode next!`,
        `Superb work! 🌟 You've maintained high accuracy across your recent sessions. Challenge your speed in the 15-minute KCSE Exam Mode!`,
        `Mastery streak active! 🔥 Your observations and calculations are highly accurate. Explore Qualitative or Organic Chemistry to cover the full KCSE Paper 3 syllabus!`
      ];
      msgEl.textContent = pickTip(streakTips, sessions.length);
    } else {
      const generalTips = [
        "Hongera! Your recent session was accurate. Keep practicing different titrations and salt IDs to build complete KCSE Paper 3 mastery!",
        "Great job! Remember: KNEC Paper 3 evaluates burette accuracy (±0.05 cm³), concordant titres, and standard observation terminology.",
        "Solid progress! Try testing your knowledge in Qualitative Salt Analysis or Organic Functional Groups to earn your Chemistry Prodigy badge!"
      ];
      msgEl.textContent = pickTip(generalTips, sessions.length);
    }
  }

  function updateReadinessScore(sessions) {
    const topicCounts = {
      acidBase: 0,
      redox: 0,
      precipitation: 0,
      complexometric: 0,
      qualitative: 0,
      organic: 0,
      solubility: 0,
      energy: 0,
      rates: 0,
      gas: 0
    };

    let correctCount = 0;

    sessions.forEach(s => {
      const type = (s.titration_title || s.titration_type || s.titrationKey || s.salt_key || s.compound_name || s.solute_key || s.experiment_title || s.gas_key || '').toLowerCase();
      if (type.includes('redox')) topicCounts.redox++;
      else if (type.includes('precipit')) topicCounts.precipitation++;
      else if (type.includes('complex')) topicCounts.complexometric++;
      else if (type.includes('qualitative') || s.salt_key) topicCounts.qualitative++;
      else if (type.includes('organic') || s.compound_name) topicCounts.organic++;
      else if (type.includes('solubility') || s.solute_key) topicCounts.solubility++;
      else if (type.includes('energy') || s.system_id || s.reaction_category) topicCounts.energy++;
      else if (type.includes('rate') || s.experiment_type) topicCounts.rates++;
      else if (type.includes('gas') || s.gas_key) topicCounts.gas++;
      else topicCounts.acidBase++;

      if (s.correct || (s.total_score != null && s.total_score >= 3.0) || (s.score_pct != null && s.score_pct >= 50)) correctCount++;
    });

    const coveredTopics = Object.values(topicCounts).filter(cnt => cnt > 0).length;
    const topicScore = (coveredTopics / 10) * 50;
    const accuracyPct = sessions.length > 0 ? (correctCount / sessions.length) * 100 : 0;
    const accuracyScore = (accuracyPct / 100) * 30;
    const volumeScore = Math.min(sessions.length, 10) * 2;

    const totalReadiness = Math.min(100, Math.round(topicScore + accuracyScore + volumeScore));

    const scoreNum = document.getElementById('readinessScoreNum');
    const barFill = document.getElementById('readinessBarFill');
    const statusEl = document.getElementById('readinessStatus');
    const certBtn = document.getElementById('certClaimBtn');

    if (scoreNum) scoreNum.textContent = totalReadiness + '%';
    if (barFill) barFill.style.width = totalReadiness + '%';
    if (certBtn) certBtn.style.display = (totalReadiness >= 20 || sessions.length > 0) ? 'inline-block' : 'none';

    let statusText = 'Novice 🔰';
    if (totalReadiness >= 85) statusText = 'KCSE Ready 🎯';
    else if (totalReadiness >= 70) statusText = 'Competent 🧪';
    else if (totalReadiness >= 40) statusText = 'Developing 📈';
    if (statusEl) statusEl.textContent = statusText;

    for (const [key, count] of Object.entries(topicCounts)) {
      const el = document.getElementById('topicStatus-' + key);
      const item = document.querySelector(`.topic-item[data-topic="${key}"]`);
      if (el) {
        el.textContent = count > 0 ? `${count} session${count > 1 ? 's' : ''} ✓` : 'Not started';
      }
      if (item) {
        if (count > 0) item.classList.add('mastered');
        else item.classList.remove('mastered');
      }
    }

    // Dynamic Daily Lab Streak Calculation
    updateLabStreak(sessions);
  }

  function updateLabStreak(sessions) {
    const streakEl = document.getElementById('streakCount');
    const streakElMobile = document.getElementById('streakCountMobile');
    if (!streakEl && !streakElMobile) return;

    const setStreak = (val) => {
      if (streakEl) streakEl.textContent = val;
      if (streakElMobile) streakElMobile.textContent = val;
    };

    if (!sessions || sessions.length === 0) {
      setStreak('1');
      return;
    }

    // Extract unique session dates (YYYY-MM-DD)
    const dates = Array.from(new Set(sessions.map(s => {
      if (!s.created_at) return null;
      const d = new Date(s.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }).filter(Boolean))).sort().reverse();

    if (dates.length === 0) {
      setStreak('1');
      return;
    }

    let streak = 1;
    let curr = new Date(dates[0]);

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
        curr = prev;
      } else if (diffDays > 1) {
        break;
      }
    }

    setStreak(Math.max(1, streak));
  }

  function computeAdaptiveRecommendation(sessions) {
    const topics = {
      acidBase: { key: 'acidBase', title: 'Acid-Base Titration (HCl vs NaOH)', icon: '🧪', url: 'lab.html?type=acidBase', total: 0, correct: 0, lastTime: 0 },
      redox: { key: 'redox', title: 'Redox Titration (Fe²⁺ vs KMnO₄)', icon: '⚗️', url: 'lab.html?type=redox', total: 0, correct: 0, lastTime: 0 },
      precipitation: { key: 'precipitation', title: 'Precipitation Titration (Mohr\'s Method)', icon: '💧', url: 'lab.html?type=precipitation', total: 0, correct: 0, lastTime: 0 },
      complexometric: { key: 'complexometric', title: 'Complexometric Titration (EDTA)', icon: '🧬', url: 'lab.html?type=complexometric', total: 0, correct: 0, lastTime: 0 },
      qualitative: { key: 'qualitative', title: 'Qualitative Salt Analysis', icon: '🧫', url: 'qualitative.html', total: 0, correct: 0, lastTime: 0 }
    };

    const now = Date.now();

    (sessions || []).forEach(s => {
      const rawType = (s.titration_title || s.titration_type || s.titrationKey || '').toLowerCase();
      let topicKey = 'acidBase';

      if (rawType.includes('redox')) topicKey = 'redox';
      else if (rawType.includes('precipit')) topicKey = 'precipitation';
      else if (rawType.includes('complex')) topicKey = 'complexometric';
      else if (rawType.includes('qualitative')) topicKey = 'qualitative';
      else topicKey = 'acidBase';

      const t = topics[topicKey];
      t.total++;
      if (s.correct) t.correct++;
      const sTime = new Date(s.created_at || s.submitted_at || 0).getTime();
      if (sTime > t.lastTime) t.lastTime = sTime;
    });

    const topicList = Object.values(topics);

    // 1. Check for Unexplored topics (total === 0)
    const unexplored = topicList.filter(t => t.total === 0);
    if (unexplored.length > 0) {
      const rec = unexplored[0];
      return {
        topic: rec,
        reasonBadge: '🆕 New Syllabus Topic',
        badgeColor: '#3B82F6',
        badgeBg: 'rgba(59,130,246,0.2)',
        desc: `You haven't practiced ${rec.title} yet. Explore this topic to build balanced KCSE Paper 3 coverage!`
      };
    }

    // 2. Check for Weakest Topic (accuracy < 70%)
    const scored = topicList.map(t => ({
      ...t,
      accuracy: t.total > 0 ? (t.correct / t.total) * 100 : 100
    })).sort((a, b) => a.accuracy - b.accuracy);

    const weakest = scored[0];
    if (weakest.accuracy < 70) {
      return {
        topic: weakest,
        reasonBadge: `⚠️ Weak Spot (${weakest.accuracy.toFixed(0)}% Accuracy)`,
        badgeColor: '#EF4444',
        badgeBg: 'rgba(239,68,68,0.2)',
        desc: `Your accuracy in ${weakest.title} is currently ${weakest.accuracy.toFixed(0)}% across ${weakest.total} attempt(s). Run a targeted session to boost precision.`
      };
    }

    // 3. Spaced Repetition check (> 3 days since last practice)
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const stale = topicList.filter(t => t.lastTime > 0 && (now - t.lastTime) > THREE_DAYS_MS)
      .sort((a, b) => a.lastTime - b.lastTime);

    if (stale.length > 0) {
      const rec = stale[0];
      const daysAgo = Math.max(1, Math.floor((now - rec.lastTime) / (24 * 60 * 60 * 1000)));
      return {
        topic: rec,
        reasonBadge: `📅 Spaced Refresher (${daysAgo}d ago)`,
        badgeColor: '#EAB308',
        badgeBg: 'rgba(234,179,8,0.2)',
        desc: `It's been ${daysAgo} day(s) since your last ${rec.title} session. Run a quick refresher to keep your memory sharp!`
      };
    }

    // 4. Mastery Challenge: High accuracy across all topics -> Recommend KCSE Exam Mode
    return {
      topic: {
        key: 'exam',
        title: 'KCSE Exam Mode (Paper 3 Simulation)',
        icon: '⏱️',
        url: 'lab.html?studyMode=exam'
      },
      reasonBadge: '🏆 High Mastery (Exam Ready)',
      badgeColor: '#10B981',
      badgeBg: 'rgba(16,185,129,0.2)',
      desc: 'Outstanding job! You have achieved high accuracy across all syllabus topics. Challenge your speed in the 15-minute KCSE Exam Mode!'
    };
  }

  function renderAdaptiveRecommendation(sessions) {
    const card = document.getElementById('adaptiveRecCard');
    if (!card) return;

    const rec = computeAdaptiveRecommendation(sessions);
    if (!rec || !rec.topic) return;

    const recIconEl = document.getElementById('recIcon');
    if (recIconEl) recIconEl.textContent = rec.topic.icon || '🎯';
    document.getElementById('recTitle').textContent = rec.topic.title;
    document.getElementById('recDesc').textContent = rec.desc;
    
    const badge = document.getElementById('recReasonBadge');
    if (badge) {
      badge.textContent = rec.reasonBadge;
      badge.style.color = rec.badgeColor;
      badge.style.background = rec.badgeBg;
    }

    const actionBtn = document.getElementById('recActionBtn');
    if (actionBtn) {
      actionBtn.href = rec.topic.url;
    }

    card.style.display = 'block';
  }

  let studentTrendChartInstance = null;
  let studentTypeChartInstance = null;
  let studentVelocityChartInstance = null;
  let currentStudentChartMode = 'mastery';
  let cachedStudentAnalytics = null;
  let cachedStudentSessions = null;

  function getThemeChartColors() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    if (theme === 'dark') {
      return {
        text: '#CBD5E1',
        textMuted: '#94A3B8',
        grid: 'rgba(255, 255, 255, 0.08)',
        tooltipBg: 'rgba(15, 26, 46, 0.95)',
        accent: '#10B981',
        accentBg: 'rgba(16, 185, 129, 0.15)',
        cyan: '#38BDF8',
        amber: '#F59E0B'
      };
    } else if (theme === 'green') {
      return {
        text: '#A7F3D0',
        textMuted: '#6EE7B7',
        grid: 'rgba(52, 211, 153, 0.12)',
        tooltipBg: 'rgba(6, 20, 11, 0.95)',
        accent: '#34D399',
        accentBg: 'rgba(52, 211, 153, 0.18)',
        cyan: '#38BDF8',
        amber: '#FBBF24'
      };
    } else {
      return {
        text: '#334155',
        textMuted: '#475569',
        grid: 'rgba(0, 0, 0, 0.06)',
        tooltipBg: 'rgba(15, 23, 42, 0.95)',
        accent: '#059669',
        accentBg: 'rgba(5, 150, 105, 0.12)',
        cyan: '#0284C7',
        amber: '#D97706'
      };
    }
  }

  window.switchStudentChartMode = function(mode) {
    currentStudentChartMode = mode;
    const btnMastery = document.getElementById('btnToggleMastery');
    const btnVelocity = document.getElementById('btnToggleVelocity');
    const typeCanvas = document.getElementById('studentTypeChart');
    const velocityCanvas = document.getElementById('studentVelocityChart');
    const title = document.getElementById('secondaryChartTitle');
    const subtitle = document.getElementById('secondaryChartSubtitle');

    if (mode === 'mastery') {
      if (btnMastery) btnMastery.classList.add('active');
      if (btnVelocity) btnVelocity.classList.remove('active');
      if (typeCanvas) typeCanvas.style.display = 'block';
      if (velocityCanvas) velocityCanvas.style.display = 'none';
      if (title) title.textContent = '🔬 Syllabus Discipline Mastery';
      if (subtitle) subtitle.textContent = 'Distribution of practical sessions by chemistry domain';
      if (studentTypeChartInstance) studentTypeChartInstance.resize();
    } else {
      if (btnMastery) btnMastery.classList.remove('active');
      if (btnVelocity) btnVelocity.classList.add('active');
      if (typeCanvas) typeCanvas.style.display = 'none';
      if (velocityCanvas) velocityCanvas.style.display = 'block';
      if (title) title.textContent = '⚡ 4-Week Practice Velocity';
      if (subtitle) subtitle.textContent = 'Completed practicals per week vs KNEC target pace (3+/wk)';
      if (studentVelocityChartInstance) {
        studentVelocityChartInstance.resize();
      } else if (cachedStudentAnalytics && cachedStudentAnalytics.weeklyVelocity) {
        renderVelocityChart(cachedStudentAnalytics.weeklyVelocity);
      }
    }
  };

  window.resizeStudentCharts = function() {
    if (studentTrendChartInstance) studentTrendChartInstance.resize();
    if (studentTypeChartInstance && currentStudentChartMode === 'mastery') studentTypeChartInstance.resize();
    if (studentVelocityChartInstance && currentStudentChartMode === 'velocity') studentVelocityChartInstance.resize();
  };

  function drawNativeLineChart(canvas, labels, accuracyData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : (canvas.clientWidth || 340);
    const height = 200;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const tc = getThemeChartColors();

    // Background Grid & Axis Labels
    ctx.strokeStyle = tc.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = 20 + i * (height - 45) / 4;
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(width - 15, y);
      ctx.stroke();
      
      ctx.fillStyle = tc.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${100 - i * 25}%`, 30, y + 3);
    }

    // Benchmark Guideline: 80% Distinction
    const y80 = 20 + (1 - 0.8) * (height - 45);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(35, y80);
    ctx.lineTo(width - 15, y80);
    ctx.stroke();
    ctx.setLineDash([]);

    const validIndices = accuracyData.map((v, i) => v !== null ? i : -1).filter(i => i !== -1);
    
    if (validIndices.length === 0) {
      ctx.fillStyle = tc.textMuted;
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No session telemetry yet — complete practicals to view accuracy trend', width / 2, height / 2);
      return;
    }

    const points = validIndices.map(idx => {
      const x = 40 + (idx / Math.max(1, labels.length - 1)) * (width - 60);
      const y = 20 + (1 - accuracyData[idx] / 100) * (height - 45);
      return { x, y, val: accuracyData[idx] };
    });

    if (points.length > 1) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, tc.accentBg);
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length - 1].x, height - 25);
      ctx.lineTo(points[0].x, height - 25);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = tc.accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = tc.accent;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  function drawNativeDoughnutChart(canvas, typeCounts) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : (canvas.clientWidth || 340);
    const height = 200;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const tc = getThemeChartColors();
    const colors = ['#10B981', '#8B5CF6', '#0284C7', '#F59E0B', '#6366F1', '#F43F5E', '#EA580C', '#EF4444', '#EAB308', '#06B6D4'];
    const labels = Object.keys(typeCounts);
    const values = Object.values(typeCounts);
    const total = values.reduce((a, b) => a + b, 0);

    const centerX = width * 0.32;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX - 10, height / 2 - 15);
    const innerRadius = Math.max(10, outerRadius * 0.58);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
      ctx.fillStyle = tc.grid;
      ctx.fill();

      ctx.fillStyle = tc.textMuted;
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('0 Sessions', centerX, centerY + 3);
      return;
    }

    let startAngle = -Math.PI / 2;
    values.forEach((val, i) => {
      if (val === 0) return;
      const sliceAngle = (val / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      startAngle = endAngle;
    });

    let legY = 16;
    labels.forEach((lbl, i) => {
      if (values[i] === 0 && labels.length > 5) return;
      if (legY > height - 16) return;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(width * 0.62, legY, 8, 8);
      ctx.fillStyle = tc.text;
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${lbl} (${values[i]})`, width * 0.62 + 13, legY + 8);
      legY += 18;
    });
  }

  function drawNativeBarChart(canvas, velocityData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : (canvas.clientWidth || 340);
    const height = 200;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const tc = getThemeChartColors();
    const items = velocityData || [
      { label: '3 Wks Ago', count: 0, target: 3 },
      { label: '2 Wks Ago', count: 0, target: 3 },
      { label: 'Last Week', count: 0, target: 3 },
      { label: 'This Week', count: 0, target: 3 }
    ];

    const maxCount = Math.max(5, ...items.map(it => it.count));
    const padX = 40;
    const padY = 25;
    const barWidth = Math.min(36, (width - padX * 2) / (items.length * 1.8));
    const stepX = (width - padX * 2) / items.length;

    // Grid lines
    ctx.strokeStyle = tc.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padY + (i / 4) * (height - padY * 2);
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();

      ctx.fillStyle = tc.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxCount * (1 - i / 4)), padX - 6, y + 3);
    }

    // Target Line (3 sessions)
    const targetY = padY + (1 - 3 / maxCount) * (height - padY * 2);
    ctx.strokeStyle = '#F59E0B';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padX, targetY);
    ctx.lineTo(width - 20, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#F59E0B';
    ctx.font = '9px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Target (3/wk)', width - 24, targetY - 4);

    // Draw Bars
    items.forEach((item, idx) => {
      const x = padX + idx * stepX + (stepX - barWidth) / 2;
      const barH = (item.count / maxCount) * (height - padY * 2);
      const y = (height - padY) - barH;

      const grad = ctx.createLinearGradient(0, y, 0, height - padY);
      grad.addColorStop(0, '#0284C7');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0.4)');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);

      // Count above bar
      if (item.count > 0) {
        ctx.fillStyle = tc.text;
        ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.count, x + barWidth / 2, y - 4);
      }

      // Label below bar
      ctx.fillStyle = tc.textMuted;
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - padY + 14);
    });
  }

  function renderVelocityChart(weeklyVelocity) {
    const velocityCanvas = document.getElementById('studentVelocityChart');
    if (!velocityCanvas) return;
    const tc = getThemeChartColors();

    const vData = weeklyVelocity || [
      { label: '3 Wks Ago', count: 0, target: 3 },
      { label: '2 Wks Ago', count: 0, target: 3 },
      { label: 'Last Week', count: 0, target: 3 },
      { label: 'This Week', count: 0, target: 3 }
    ];

    const vLabels = vData.map(v => v.label);
    const vCounts = vData.map(v => v.count);

    if (typeof Chart !== 'undefined') {
      try {
        if (studentVelocityChartInstance) studentVelocityChartInstance.destroy();
        studentVelocityChartInstance = new Chart(velocityCanvas, {
          type: 'bar',
          data: {
            labels: vLabels,
            datasets: [{
              label: 'Completed Practicals',
              data: vCounts,
              backgroundColor: 'rgba(2, 132, 199, 0.8)',
              borderColor: '#0284C7',
              borderWidth: 1.5,
              borderRadius: 6,
              maxBarThickness: 38
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: tc.tooltipBg,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
                bodyFont: { family: "'JetBrains Mono', monospace" },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (ctx) => ` ${ctx.raw} practical session${ctx.raw === 1 ? '' : 's'}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: 5,
                ticks: { stepSize: 1, color: tc.textMuted, font: { size: 10, family: "'JetBrains Mono', monospace" } },
                grid: { color: tc.grid }
              },
              x: {
                ticks: { color: tc.textMuted, font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" } },
                grid: { display: false }
              }
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Chart.js velocity render error, using canvas fallback:', err);
      }
    }

    drawNativeBarChart(velocityCanvas, vData);
  }

  function renderStudentCharts(sessions, analyticsOverride) {
    const trendCanvas = document.getElementById('studentTrendChart');
    const typeCanvas = document.getElementById('studentTypeChart');
    const velocityCanvas = document.getElementById('studentVelocityChart');
    if (!trendCanvas && !typeCanvas) return;

    const analytics = analyticsOverride || cachedStudentAnalytics;
    const tc = getThemeChartColors();

    // ── 1. Populate KPI Summary Ribbon ──
    const overallAcc = analytics?.summary?.overallAccuracyPct != null
      ? analytics.summary.overallAccuracyPct
      : (sessions?.length ? Math.round((sessions.filter(s => s.correct).length / sessions.length) * 100) : 0);
    const totalSessions = analytics?.summary?.totalSessions != null
      ? analytics.summary.totalSessions
      : (sessions?.length || 0);
    const weeklySessions = analytics?.summary?.weeklySessions != null
      ? analytics.summary.weeklySessions
      : (sessions ? sessions.filter(s => new Date(s.created_at) >= new Date(Date.now() - 7 * 86400000)).length : 0);
    const topDiscipline = analytics?.summary?.topDiscipline || (sessions?.length ? (sessions[0].titration_title || sessions[0].titration_type || 'Volumetric') : 'None yet');

    const kpiAccEl = document.getElementById('kpiAccuracyVal');
    if (kpiAccEl) kpiAccEl.textContent = overallAcc + '%';
    const heroAccEl = document.getElementById('heroAccuracyVal');
    if (heroAccEl) heroAccEl.textContent = overallAcc + '%';

    const kpiTotalEl = document.getElementById('kpiTotalSessions');
    if (kpiTotalEl) kpiTotalEl.textContent = totalSessions;

    const kpiWeeklyEl = document.getElementById('kpiWeeklySessions');
    if (kpiWeeklyEl) kpiWeeklyEl.textContent = weeklySessions;

    const kpiTopEl = document.getElementById('kpiTopDiscipline');
    if (kpiTopEl) kpiTopEl.textContent = topDiscipline;

    const statusBadge = document.getElementById('analyticsReadinessStatusText');
    if (statusBadge) {
      if (overallAcc >= 80) statusBadge.textContent = 'Distinction Pace (A/B)';
      else if (overallAcc >= 50) statusBadge.textContent = 'Satisfactory Pace (C)';
      else if (totalSessions > 0) statusBadge.textContent = 'Review Suggested';
      else statusBadge.textContent = 'Ready for First Lab';
    }

    // ── 2. Format 30-Day Accuracy Trend Data ──
    let trendLabels = [];
    let trendAccuracy = [];

    if (analytics && Array.isArray(analytics.accuracyOverTime) && analytics.accuracyOverTime.length > 0) {
      trendLabels = analytics.accuracyOverTime.map(r => {
        const d = new Date(r.day);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      trendAccuracy = analytics.accuracyOverTime.map(r => r.accuracyPct);

      // Trend gain indicator
      const gainEl = document.getElementById('trendGainSubtitle');
      if (gainEl && trendAccuracy.length >= 2) {
        const diff = trendAccuracy[trendAccuracy.length - 1] - trendAccuracy[0];
        gainEl.textContent = diff >= 0 
          ? `▲ +${diff.toFixed(1)}% improvement across recent sessions` 
          : `▼ ${diff.toFixed(1)}% concordance variation (review suggested)`;
      }
    } else {
      // Fallback: build progressive accuracy from sessions array
      const now = new Date();
      const daysMap = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        daysMap[key] = { total: 0, correct: 0 };
      }

      (sessions || []).forEach(s => {
        if (!s.created_at) return;
        const key = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (daysMap[key]) {
          daysMap[key].total++;
          if (s.correct || (s.score != null && s.score >= 50) || (s.total_score != null && s.total_score >= 10)) {
            daysMap[key].correct++;
          }
        }
      });

      const allDates = Object.keys(daysMap);
      const activeDates = allDates.filter(k => daysMap[k].total > 0);

      if (activeDates.length >= 1) {
        trendLabels = activeDates;
        let runningTotal = 0;
        let runningCorrect = 0;
        trendAccuracy = activeDates.map(k => {
          runningTotal += daysMap[k].total;
          runningCorrect += daysMap[k].correct;
          return Math.round((runningCorrect / runningTotal) * 100);
        });
      } else {
        trendLabels = [allDates[0], allDates[7], allDates[14], allDates[21], allDates[29]];
        trendAccuracy = [null, null, null, null, null];
      }
    }

    // ── 3. Format Topic Mastery Data ──
    let chartLabels = [];
    let chartData = [];
    const typeCounts = {
      'Acid-Base': 0,
      'Redox': 0,
      'Precipitation': 0,
      'Complexometric': 0,
      'Qualitative': 0,
      'Organic': 0,
      'Solubility': 0,
      'Energy': 0,
      'Rates': 0,
      'Gas Prep': 0
    };

    if (analytics && Array.isArray(analytics.byType) && analytics.byType.length > 0) {
      analytics.byType.forEach(t => {
        const lbl = t.label || t.practicalType;
        if (t.totalSessions > 0) {
          chartLabels.push(lbl);
          chartData.push(t.totalSessions);
        }
        if (typeCounts[lbl] !== undefined) typeCounts[lbl] = t.totalSessions;
      });
    }

    if (chartLabels.length === 0) {
      (sessions || []).forEach(s => {
        const type = (s.titration_title || s.titration_type || s.type || s.salt_name || s.compound_name || s.solute_name || s.gas_name || s.method || '').toLowerCase();
        if (type.includes('redox')) typeCounts['Redox']++;
        else if (type.includes('precipit')) typeCounts['Precipitation']++;
        else if (type.includes('complex')) typeCounts['Complexometric']++;
        else if (type.includes('qualitative') || s.salt_key || s.salt_name) typeCounts['Qualitative']++;
        else if (type.includes('organic') || s.compound_name) typeCounts['Organic']++;
        else if (type.includes('solubility') || s.solute_key || s.solute_name) typeCounts['Solubility']++;
        else if (type.includes('energy') || s.system_name || s.system_id) typeCounts['Energy']++;
        else if (type.includes('rate') || s.method) typeCounts['Rates']++;
        else if (type.includes('gas') || s.gas_key || s.gas_name) typeCounts['Gas Prep']++;
        else typeCounts['Acid-Base']++;
      });
      const activeEntries = Object.entries(typeCounts).filter(([_, v]) => v > 0);
      chartLabels = activeEntries.length > 0 ? activeEntries.map(([k]) => k) : ['No Sessions'];
      chartData = activeEntries.length > 0 ? activeEntries.map(([_, v]) => v) : [1];
    }

    const colorPalette = {
      'Acid-Base': '#10B981',
      'Redox': '#8B5CF6',
      'Precipitation': '#0284C7',
      'Complexometric': '#F59E0B',
      'Qualitative Analysis': '#6366F1',
      'Qualitative': '#6366F1',
      'Organic Chemistry': '#F43F5E',
      'Organic': '#F43F5E',
      'Solubility Curves': '#EA580C',
      'Solubility': '#EA580C',
      'Thermochemistry': '#EF4444',
      'Energy': '#EF4444',
      'Reaction Rates': '#EAB308',
      'Rates': '#EAB308',
      'Gas Preparation': '#06B6D4',
      'Gas Prep': '#06B6D4',
      'KCSE Mock Exam': '#EC4899',
      'No Sessions': '#475569'
    };
    const chartColors = chartLabels.map(l => colorPalette[l] || '#3B82F6');

    // ── 4. Render with Chart.js if available ──
    if (typeof Chart !== 'undefined') {
      try {
        if (studentTrendChartInstance) studentTrendChartInstance.destroy();
        studentTrendChartInstance = new Chart(trendCanvas, {
          type: 'line',
          data: {
            labels: trendLabels,
            datasets: [{
              label: 'Accuracy (%)',
              data: trendAccuracy,
              borderColor: tc.accent,
              backgroundColor: tc.accentBg,
              borderWidth: 2.5,
              pointBackgroundColor: tc.accent,
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 1.5,
              pointRadius: trendAccuracy.length === 1 ? 6 : 4,
              pointHoverRadius: 6,
              fill: true,
              tension: 0.35,
              spanGaps: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: tc.tooltipBg,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
                bodyFont: { family: "'JetBrains Mono', monospace" },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (ctx) => `Accuracy: ${ctx.parsed.y}%`
                }
              }
            },
            scales: {
              y: {
                min: 0,
                max: 100,
                ticks: { callback: v => v + '%', color: tc.textMuted, font: { size: 10, family: "'JetBrains Mono', monospace" } },
                grid: { color: tc.grid }
              },
              x: {
                ticks: { maxTicksLimit: 6, color: tc.textMuted, font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" } },
                grid: { display: false }
              }
            }
          }
        });

        if (studentTypeChartInstance) studentTypeChartInstance.destroy();
        studentTypeChartInstance = new Chart(typeCanvas, {
          type: 'doughnut',
          data: {
            labels: chartLabels,
            datasets: [{
              data: chartData,
              backgroundColor: chartColors,
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  padding: 8,
                  font: { size: 10, family: "'Plus Jakarta Sans', sans-serif", weight: '600' },
                  color: tc.text
                }
              },
              tooltip: {
                backgroundColor: tc.tooltipBg,
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${ctx.raw} session${ctx.raw === 1 ? '' : 's'}`
                }
              }
            }
          }
        });

        // Also render weekly velocity chart
        if (velocityCanvas) {
          renderVelocityChart(analytics?.weeklyVelocity);
        }
        return;
      } catch (err) {
        console.warn('Chart.js render error, using native canvas fallback:', err);
      }
    }

    // Native HTML5 2D Canvas Fallback
    drawNativeLineChart(trendCanvas, trendLabels, trendAccuracy);
    drawNativeDoughnutChart(typeCanvas, typeCounts);
    if (velocityCanvas) {
      drawNativeBarChart(velocityCanvas, analytics?.weeklyVelocity);
    }
  }

  async function loadSessions() {
    const box = document.getElementById('sessionsList');
    try {
      // Parallel fetch: session history + full analytics telemetry
      const [sessionsData, analyticsData] = await Promise.allSettled([
        Sessions.getMine({ limit: 20 }),
        (typeof Analytics !== 'undefined' && typeof Analytics.getMine === 'function')
          ? Analytics.getMine()
          : Promise.resolve(null)
      ]);

      const sessions = (sessionsData.status === 'fulfilled' && sessionsData.value) ? (sessionsData.value.sessions || []) : [];
      const analytics = (analyticsData.status === 'fulfilled' && analyticsData.value) ? analyticsData.value : null;

      cachedStudentSessions = sessions;
      cachedStudentAnalytics = analytics;

      updateReadinessScore(sessions);
      updateMwalimuAdvice(sessions);
      renderAdaptiveRecommendation(sessions);
      renderStudentCharts(sessions, analytics);
      if (typeof updateProfileStatsUI === 'function') updateProfileStatsUI();

      // Sync sessions with SkillTree & cache
      try {
        localStorage.setItem('vlk_cached_sessions', JSON.stringify(sessions));
      } catch (e) {}
      if (window.SkillTree && typeof window.SkillTree.render === 'function') {
        window.SkillTree.render(sessions);
      }

      if (!box) return;

      if (sessions.length === 0) {
        box.innerHTML = '<div class="empty-box" style="grid-column:1/-1;">No sessions recorded yet</div>';
        return;
      }

      const displaySessions = sessions.slice(0, 3);
      box.innerHTML = displaySessions.map(s => `
        <div class="session-card-item" data-tooltip="${s.correct ? 'Verified practical passing standard on official rubric' : 'Review suggested to improve concordance / observations'}" data-tooltip-pos="top">
          <div style="min-width:0;">
            <div class="session-info-title">${escapeHtml(s.titration_title || s.titration_type || 'Lab Session')}</div>
            <div class="session-info-meta">${new Date(s.created_at).toLocaleDateString()} &bull; ${s.trials_count ?? 0} trial(s)</div>
          </div>
          <span class="${s.correct ? 'pill-correct' : 'pill-incorrect'}">${s.correct ? 'Correct' : 'Incorrect'}</span>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Could not load sessions dynamically, rendering fallback data:', err);
      const fallbackSessions = [
        { titration_title: 'Standardisation of HCl with Na2CO3', created_at: new Date().toISOString(), trials_count: 3, concordant_found: true, correct: true },
        { titration_title: 'Redox Titration of Fe2+ with KMnO4', created_at: new Date(Date.now() - 86400000).toISOString(), trials_count: 3, concordant_found: true, correct: true }
      ];
      cachedStudentSessions = fallbackSessions;
      updateReadinessScore(fallbackSessions);
      renderStudentCharts(fallbackSessions, null);
      try {
        localStorage.setItem('vlk_cached_sessions', JSON.stringify(fallbackSessions));
      } catch (e) {}
      if (window.SkillTree && typeof window.SkillTree.render === 'function') {
        window.SkillTree.render(fallbackSessions);
      }
      if (box) {
        box.innerHTML = fallbackSessions.map(s => `
          <div class="session-card-item" data-tooltip="${s.correct ? 'Verified practical passing standard on official rubric' : 'Review suggested to improve concordance / observations'}" data-tooltip-pos="top">
            <div style="min-width:0;">
              <div class="session-info-title">${escapeHtml(s.titration_title || 'Lab Session')}</div>
              <div class="session-info-meta">${new Date(s.created_at).toLocaleDateString()} &bull; ${s.trials_count ?? 0} trial(s)</div>
            </div>
            <span class="${s.correct ? 'pill-correct' : 'pill-incorrect'}">${s.correct ? 'Correct' : 'Incorrect'}</span>
          </div>
        `).join('');
      }
    }
  }

  async function loadBadges() {
    const grid = document.getElementById('badgeGrid');
    if (!grid) return;

    const DEFAULT_KCSE_BADGES = [
      { id: 'b_burette', name: 'Burette Accuracy Master', icon: '⚖️', desc: 'Titre concordancy within ±0.10 cm³', progress: 'In Progress', progress_pct: 65, colorClass: 'teal' },
      { id: 'b_flame', name: 'Flame Emission Specialist', icon: '🔥', desc: 'Identify 5 metal cations by flame color', progress: 'In Progress', progress_pct: 40, colorClass: 'fire' },
      { id: 'b_cation', name: 'Cation Qualitative Sleuth', icon: '🔬', desc: 'Systematic NaOH & NH₃ precipitation', progress: 'In Progress', progress_pct: 50, colorClass: 'blue' },
      { id: 'b_kinetics', name: 'Reaction Rates & Kinetics Ace', icon: '⚡', desc: 'Disappearing cross & rate tangents', progress: 'In Progress', progress_pct: 35, colorClass: 'orange' },
      { id: 'b_organic', name: 'Organic Functional Group Pro', icon: '⚗️', desc: 'Bromine water & alkanol oxidation', progress: 'In Progress', progress_pct: 20, colorClass: 'purple' },
      { id: 'b_precision', name: 'Zero-Error KCSE Champion', icon: '🎯', desc: 'Score 100% on Paper 3 composite test', progress: 'Locked', progress_pct: 10, colorClass: 'silver' }
    ];

    try {
      const data = await Badges.getMine();
      let badges = data && Array.isArray(data.badges) && data.badges.length > 0 ? data.badges : DEFAULT_KCSE_BADGES;

      const neonClasses = ['teal', 'orange', 'blue', 'purple', 'fire', 'silver'];

      grid.innerHTML = badges.map((b, idx) => {
        const colorClass = b.colorClass || neonClasses[idx % neonClasses.length];
        const isUnlocked = !!b.unlocked;
        const progressPct = isUnlocked ? 100 : (b.progress_pct != null ? b.progress_pct : 45);

        return `
          <div class="badge-card" data-tooltip="${escapeHtml(b.desc || b.name)}" data-tooltip-pos="top">
            <div class="badge-icon-box ${colorClass}">${b.icon || '🎯'}</div>
            <div style="flex:1; min-width:0;">
              <div class="badge-title-text">${escapeHtml(b.name)}</div>
              <div class="badge-progress-text">${escapeHtml(b.unlocked ? 'Achieved ★' : (b.progress || b.desc || 'In Progress'))}</div>
              <div class="badge-progress-bar-track">
                <div class="badge-progress-bar-fill ${colorClass}" style="width: ${progressPct}%;"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('Using offline default badges:', err);
      grid.innerHTML = DEFAULT_KCSE_BADGES.map((b) => `
        <div class="badge-card" data-tooltip="${escapeHtml(b.desc || b.name)}" data-tooltip-pos="top">
          <div class="badge-icon-box ${b.colorClass}">${b.icon}</div>
          <div style="flex:1; min-width:0;">
            <div class="badge-title-text">${escapeHtml(b.name)}</div>
            <div class="badge-progress-text">${escapeHtml(b.desc)}</div>
            <div class="badge-progress-bar-track">
              <div class="badge-progress-bar-fill ${b.colorClass}" style="width: ${b.progress_pct}%;"></div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  async function loadLeaderboard() {
    const box = document.getElementById('leaderboardBox');
    if (!box) return;
    try {
      const data = await Leaderboard.getClass();

      if (data.message) {
        box.innerHTML = '<div class="empty-box" style="padding:16px;text-align:center;font-size:0.8rem;color:var(--text-muted);">' + escapeHtml(data.message) + '</div>';
        return;
      }

      const list = data.top || data.ranked || [];

      if (!list || list.length === 0) {
        box.innerHTML = `<div class="empty-box" style="padding:16px;text-align:center;font-size:0.8rem;color:var(--text-muted);">No class rankings yet.<br><small>(Minimum 3 completed practicals required to rank)</small></div>`;
        return;
      }

      const medals = ['🥇', '🥈', '🥉'];
      const items = list.slice(0, 6).map((r, i) => {
        const isYou = data.you && r.studentId === data.you.studentId;
        const rankDisplay = i < 3 ? medals[i] : `#${r.rank || (i + 1)}`;
        const initials = (r.name || 'Student').trim().split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase();

        return `
          <div class="lb-rank-card ${isYou ? 'is-you' : ''}">
            <div class="lb-rank-left">
              <span class="lb-medal">${rankDisplay}</span>
              <div class="lb-avatar">${initials}</div>
              <div class="lb-info">
                <div class="lb-name">${escapeHtml(r.name)}${isYou ? ' <span class="lb-you-chip">YOU</span>' : ''}</div>
                <div class="lb-meta">${escapeHtml(r.form || 'Form 4')} · ${r.totalSessions || 0} lab${r.totalSessions === 1 ? '' : 's'}</div>
              </div>
            </div>
            <div class="lb-score-pill">
              <span class="lb-acc">${r.accuracyPct}%</span>
            </div>
          </div>
        `;
      }).join('');

      box.innerHTML = `<div class="lb-list-wrap">${items}</div>`;
    } catch (err) {
      box.innerHTML = '<div class="empty-box" style="padding:14px;text-align:center;font-size:0.8rem;color:var(--text-muted);">Could not load leaderboard</div>';
    }
  }

  let currentPracticeFilter = 'all';

  function setPracticeFilter(filter) {
    currentPracticeFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-filter') === filter);
    });
    filterPractices();
  }

  function filterPractices() {
    const query = (document.getElementById('experimentSearchInput')?.value || '').toLowerCase();
    const cards = document.querySelectorAll('.practice-banner-card');

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const type = card.getAttribute('data-type') || '';

      const matchesQuery = !query || text.includes(query);
      const matchesFilter = currentPracticeFilter === 'all' || type === currentPracticeFilter;

      card.style.display = (matchesQuery && matchesFilter) ? 'flex' : 'none';
    });
  }

  window.updateProfileStatsUI = async function() {
    const sessEl = document.getElementById('profStatSessions');
    const accEl = document.getElementById('profStatAccuracy');
    const streakEl = document.getElementById('profStatStreak');
    const badgesEl = document.getElementById('profStatBadges');

    try {
      // Parallel fetch across all student modules for complete performance aggregation
      const [titrationRes, qualRes, organicRes, solubilityRes, energyRes, ratesRes, gasRes, compositeRes, badgesRes] = await Promise.allSettled([
        typeof Sessions !== 'undefined' ? Sessions.getMine({ limit: 100 }) : Promise.resolve({ sessions: [] }),
        typeof Qualitative !== 'undefined' ? Qualitative.getMine({ limit: 100 }) : Promise.resolve({ sessions: [] }),
        typeof Organic !== 'undefined' ? Organic.getMine() : Promise.resolve({ sessions: [] }),
        typeof Solubility !== 'undefined' ? Solubility.getMine() : Promise.resolve({ sessions: [] }),
        typeof Energy !== 'undefined' ? Energy.getMine() : Promise.resolve({ sessions: [] }),
        typeof Rates !== 'undefined' ? Rates.getMine() : Promise.resolve({ sessions: [] }),
        typeof Gas !== 'undefined' ? Gas.getMine() : Promise.resolve({ sessions: [] }),
        typeof Composite !== 'undefined' ? Composite.getMine() : Promise.resolve({ sessions: [] }),
        typeof Badges !== 'undefined' ? Badges.getMine() : Promise.resolve({ badges: [] })
      ]);

      const titrationSessions = titrationRes.status === 'fulfilled' ? (titrationRes.value?.sessions || []) : [];
      const qualSessions = qualRes.status === 'fulfilled' ? (qualRes.value?.sessions || qualRes.value?.history || []) : [];
      const organicSessions = organicRes.status === 'fulfilled' ? (organicRes.value?.sessions || []) : [];
      const solubilitySessions = solubilityRes.status === 'fulfilled' ? (solubilityRes.value?.sessions || []) : [];
      const energySessions = energyRes.status === 'fulfilled' ? (energyRes.value?.sessions || []) : [];
      const ratesSessions = ratesRes.status === 'fulfilled' ? (ratesRes.value?.sessions || []) : [];
      const gasSessions = gasRes.status === 'fulfilled' ? (gasRes.value?.sessions || []) : [];
      const compositeSessions = compositeRes.status === 'fulfilled' ? (compositeRes.value?.sessions || []) : [];

      const allSessions = [...titrationSessions, ...qualSessions, ...organicSessions, ...solubilitySessions, ...energySessions, ...ratesSessions, ...gasSessions, ...compositeSessions];
      window.latestSessions = allSessions;

      const totalCount = allSessions.length;
      let correctCount = 0;

      allSessions.forEach(s => {
        if (s.correct === true || s.correct === 1) {
          correctCount++;
        } else if (s.score_pct != null && s.score_pct >= 50) {
          correctCount++;
        } else if (s.questions_correct != null && s.questions_correct > 0) {
          correctCount++;
        }
      });

      const accuracyPct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      // Badges calculation
      let unlockedCount = 0;
      let totalBadgesCount = 6;
      if (badgesRes.status === 'fulfilled' && badgesRes.value?.badges) {
        const badgesArr = badgesRes.value.badges;
        totalBadgesCount = badgesArr.length || 6;
        unlockedCount = badgesArr.filter(b => b.unlocked).length;
      }

      // Streak calculation
      const streakText = (document.getElementById('streakCountMobile') || document.getElementById('streakCount'))?.textContent || '1';
      const formattedStreak = streakText.includes('Day') ? streakText : (streakText + ' Day' + (streakText === '1' ? '' : 's'));

      if (sessEl) sessEl.textContent = totalCount;
      if (accEl) accEl.textContent = accuracyPct + '%';
      if (streakEl) streakEl.textContent = formattedStreak;
      if (badgesEl) badgesEl.textContent = `${unlockedCount} / ${totalBadgesCount}`;

      // Dynamically determine Top Skill from successful practical sessions
      const skillStats = {
        'Volumetric Analysis': titrationSessions.filter(s => s.correct).length,
        'Qualitative Analysis': qualSessions.filter(s => s.correct).length,
        'Organic Analysis': organicSessions.filter(s => s.overall_correct || s.correct).length,
        'Thermochemistry': energySessions.filter(s => (s.total_score || 0) >= 10).length,
        'Reaction Rates': ratesSessions.filter(s => (s.total_score || 0) >= 10).length,
        'Solubility Curves': solubilitySessions.filter(s => (s.total_score || 0) >= 3).length,
        'Gas Preparation': gasSessions.filter(s => s.correct).length,
        'Mock Exam Mastery': compositeSessions.filter(s => (s.total || 0) >= 20).length
      };

      let bestSkill = 'Volumetric Analysis';
      let maxSkillCount = -1;
      for (const [skill, count] of Object.entries(skillStats)) {
        if (count > maxSkillCount) {
          maxSkillCount = count;
          bestSkill = skill;
        }
      }
      if (maxSkillCount <= 0) {
        bestSkill = totalCount > 0 ? 'General Chemistry' : 'Volumetric Analysis';
      }

      // Populate history.html "My Achievements" Widget with dynamic milestone targets
      const achieveCompleted = document.getElementById('achieveCompletedLabs');
      const achieveBadges = document.getElementById('achieveBadgesEarned');
      const achieveSkill = document.getElementById('achieveTopSkill');

      let targetMilestone = 10;
      if (totalCount >= 50) targetMilestone = Math.ceil((totalCount + 1) / 25) * 25;
      else if (totalCount >= 30) targetMilestone = 50;
      else if (totalCount >= 20) targetMilestone = 30;
      else if (totalCount >= 10) targetMilestone = 20;

      if (achieveCompleted) achieveCompleted.textContent = `${totalCount} / ${targetMilestone}`;
      if (achieveBadges) achieveBadges.textContent = `${unlockedCount} / ${totalBadgesCount} Badges`;
      if (achieveSkill) achieveSkill.textContent = bestSkill;

    } catch (err) {
      console.warn('Could not calculate full student profile stats:', err);
    }
  };

  window.openProfileModal = function() {
    const user = getUser() || {};
    const modal = document.getElementById('profileSettingsModal');
    if (!modal) return;

    const nameEl = document.getElementById('profHeaderName');
    const emailEl = document.getElementById('profHeaderEmail');
    const roleEl = document.getElementById('profHeaderRole');

    if (nameEl) nameEl.textContent = user.name || 'Student Candidate';
    if (emailEl) emailEl.textContent = user.email || 'student@virtulab.ke';
    if (roleEl) roleEl.textContent = user.role === 'teacher' ? '👨‍🏫 Teacher Instructor' : '🎓 KCSE Candidate Student';

    const inputName = document.getElementById('profInputName');
    const inputEmail = document.getElementById('profInputEmail');
    const inputForm = document.getElementById('profInputForm');
    const inputSchool = document.getElementById('profInputSchool');

    if (inputName) inputName.value = user.name || '';
    if (inputEmail) inputEmail.value = user.email || '';
    if (inputForm && user.form) inputForm.value = user.form;
    if (inputSchool && user.schoolCode) inputSchool.value = user.schoolCode;

    // Immediately trigger live multi-module stats calculation
    updateProfileStatsUI();

    switchProfTab('details');
    modal.style.display = 'flex';
  };

  window.closeProfileModal = function() {
    const modal = document.getElementById('profileSettingsModal');
    if (modal) modal.style.display = 'none';
  };

  window.switchProfTab = function(tabName) {
    ['details', 'security', 'prefs'].forEach(t => {
      const pane = document.getElementById('profPane' + t.charAt(0).toUpperCase() + t.slice(1));
      const btn = document.getElementById('tabProf' + t.charAt(0).toUpperCase() + t.slice(1));
      if (pane) pane.style.display = t === tabName ? 'block' : 'none';
      if (btn) btn.classList.toggle('active', t === tabName);
    });
  };

  window.togglePasswordPanel = function() {
    openProfileModal();
  };

  window.saveProfileDetails = function() {
    const newName = (document.getElementById('profInputName')?.value || '').trim();
    const newForm = document.getElementById('profInputForm')?.value || 'Form 4';
    const newSchool = (document.getElementById('profInputSchool')?.value || '').trim();
    const msg = document.getElementById('profDetailsMsg');

    if (!newName) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">Full Name cannot be empty.</div>';
      return;
    }

    const user = getUser() || {};
    user.name = newName;
    user.form = newForm;
    user.schoolCode = newSchool;
    setUser(user);

    ['studentName', 'studentNameMobile', 'profHeaderName'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = newName;
    });
    updateStudentAvatar(newName);

    if (msg) msg.innerHTML = '<div class="msg msg-ok">✓ Profile details updated successfully!</div>';
  };

  window.exportLabHistoryCSV = function() {
    const sessions = window.latestSessions || [];
    if (sessions.length === 0) {
      alert('No session history available to export.');
      return;
    }

    const headers = ['Session ID', 'Topic/Type', 'Student Answer', 'True Target Value', 'Status', 'Date'];
    const rows = sessions.map(s => [
      s.id,
      `"${s.titration_title || s.titration_type || s.salt_key || 'Practical'}"`,
      `"${s.student_answer || ''}"`,
      `"${s.true_value || ''}"`,
      s.correct ? 'PASSED' : 'RETRY',
      `"${new Date(s.created_at).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `virtulab_practical_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function submitChangePassword() {
    const currentPassword = document.getElementById('pwCurrent')?.value;
    const newPassword = document.getElementById('pwNew')?.value;
    const confirmPassword = document.getElementById('pwConfirm')?.value;
    const msg = document.getElementById('pwMsg');
    if (msg) msg.innerHTML = '';

    if (!currentPassword || !newPassword) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">Current and new password are required.</div>';
      return;
    }
    if (confirmPassword !== undefined && confirmPassword !== newPassword) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">New password and confirmation do not match.</div>';
      return;
    }
    if (newPassword.length < 6) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">New password must be at least 6 characters long.</div>';
      return;
    }
    try {
      await Auth.changePassword(currentPassword, newPassword);
      if (msg) msg.innerHTML = '<div class="msg msg-ok">✓ Security password updated successfully!</div>';
      if (document.getElementById('pwCurrent')) document.getElementById('pwCurrent').value = '';
      if (document.getElementById('pwNew')) document.getElementById('pwNew').value = '';
      if (document.getElementById('pwConfirm')) document.getElementById('pwConfirm').value = '';
    } catch (err) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">' + escapeHtml(err.message) + '</div>';
    }
  }

  async function loadSystemAnnouncements() {
    try {
      const res = await Announcements.getActive();
      if (res.success && res.announcements && res.announcements.length > 0) {
        const activeAlerts = res.announcements.filter(a => !sessionStorage.getItem('vlk_dismiss_ann_' + a.id));
        const banner = document.getElementById('systemBroadcastBanner');
        if (banner && activeAlerts.length > 0) {
          banner.style.display = 'block';
          banner.innerHTML = activeAlerts.map(a => `
            <div id="ann-card-${a.id}" style="background:linear-gradient(135deg, rgba(6,182,212,0.15), rgba(245,158,11,0.15));border:1.5px solid var(--amber-accent, #F59E0B);border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <div style="font-size:1.4rem;">📢</div>
                <div>
                  <div style="font-weight:800;font-size:0.95rem;color:var(--heading-color);">${escapeHtml(a.title)}</div>
                  <div style="font-size:0.84rem;color:var(--text-main);margin-top:2px;">${escapeHtml(a.message)}</div>
                </div>
              </div>
              <button onclick="dismissAnnouncement(${a.id})" style="background:transparent;border:none;color:var(--text-muted);font-weight:800;font-size:1.1rem;cursor:pointer;padding:0 4px;" title="Dismiss notice">✕</button>
            </div>
          `).join('');
        }
      }
    } catch (e) {
      console.warn('Could not load announcements:', e);
    }
  }

  function dismissAnnouncement(id) {
    sessionStorage.setItem('vlk_dismiss_ann_' + id, 'true');
    const el = document.getElementById('ann-card-' + id);
    if (el) el.remove();
  }

  // Explicit window exports for inline HTML event handlers
  if (typeof window !== 'undefined') {
    window.setTheme = setTheme;
    window.toggleNotifDropdown = toggleNotifDropdown;
    window.markAllNotificationsRead = markAllNotificationsRead;
    window.switchKnecRefTab = switchKnecRefTab;
    window.saveProfileDetails = saveProfileDetails;
    window.submitChangePassword = submitChangePassword;
    window.exportLabHistoryCSV = exportLabHistoryCSV;
    window.dismissAnnouncement = dismissAnnouncement;
    window.updateGamificationDashboardUI = updateGamificationDashboardUI;
  }

  function updateGamificationDashboardUI() {
    if (!window.GamificationEngine) return;
    
    // 1. Streak
    const streak = window.GamificationEngine.getStreak();
    const streakCountEl = document.getElementById('streakCount');
    const streakCountMobileEl = document.getElementById('streakCountMobile');
    if (streakCountEl) streakCountEl.textContent = streak.count;
    if (streakCountMobileEl) streakCountMobileEl.textContent = streak.count;
    
    // 2. XP & Level
    const xp = window.GamificationEngine.getXP();
    const levelTitleEl = document.getElementById('heroLevelTitle');
    const xpTextEl = document.getElementById('heroXPText');
    const xpBarEl = document.getElementById('heroXPBar');
    const tierNameEl = document.getElementById('heroTierName');
    const levelIconEl = document.getElementById('heroLevelIcon');
    
    if (levelTitleEl) levelTitleEl.textContent = `Level ${xp.level}: ${xp.title}`;
    if (xpTextEl) xpTextEl.textContent = `${xp.totalXP} / ${xp.nextLevelXP} XP`;
    if (xpBarEl) xpBarEl.style.width = `${xp.progressPercent}%`;
    if (tierNameEl) tierNameEl.textContent = xp.title.replace('Form ', 'F').replace('KCSE ', '');
    if (levelIconEl) levelIconEl.textContent = xp.icon;

    // 3. Daily Challenge Card
    const daily = window.GamificationEngine.getDailyChallenge();
    const dailyCard = document.getElementById('dailyChallengeCard');
    const dailyTitle = document.getElementById('dailyChallengeTitle');
    const dailyDesc = document.getElementById('dailyChallengeDesc');
    const dailyXP = document.getElementById('dailyChallengeXP');
    const launchBtn = document.getElementById('dailyChallengeLaunchBtn');

    if (dailyTitle) dailyTitle.textContent = daily.title;
    if (dailyDesc) dailyDesc.textContent = `${daily.description} (${daily.topic})`;
    if (dailyXP) dailyXP.textContent = `+${daily.xpReward} XP`;

    if (daily.isCompleted) {
      if (dailyCard) dailyCard.classList.add('completed');
      if (launchBtn) {
        launchBtn.innerHTML = `Daily Challenge Completed!`;
        launchBtn.style.background = '#10B981';
        launchBtn.style.borderColor = '#10B981';
      }
    }
  }

  loadBadges();
  loadLeaderboard();
  loadAssignments();
  loadSessions();
  loadSystemAnnouncements();
  updateGamificationDashboardUI();
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
    ['heroStudentAvatar', 'navAvatarInitials'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = initials;
    });
  }

  async function initStudentProfile() {
    if (currentStudentUser) {
      ['studentName', 'studentNameMobile', 'profHeaderName'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentStudentUser.name;
      });
      const nameInp = document.getElementById('profInputName');
      if (nameInp && !nameInp.value) nameInp.value = currentStudentUser.name || '';
      const emailH = document.getElementById('profHeaderEmail');
      if (emailH && currentStudentUser.email) emailH.textContent = currentStudentUser.email;
      const emailInp = document.getElementById('profInputEmail');
      if (emailInp && currentStudentUser.email) emailInp.value = currentStudentUser.email;
      const formInp = document.getElementById('profInputForm');
      if (formInp && currentStudentUser.form) formInp.value = currentStudentUser.form;
      const schoolInp = document.getElementById('profInputSchool');
      if (schoolInp && (currentStudentUser.schoolName || currentStudentUser.schoolCode)) {
        schoolInp.value = currentStudentUser.schoolName || currentStudentUser.schoolCode;
      }
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
      msg.innerHTML = `<span style="color:var(--green-accent);display:inline-flex;align-items:center;gap:6px;"><svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> ${escapeHtml(data.message || 'Successfully linked to teacher!')}</span>`;
      input.value = '';
      
      if (data.student) {
        currentStudentUser = { ...currentStudentUser, ...data.student };
        setUser(currentStudentUser);
        updateStudentTeacherUI(currentStudentUser);
      }

      if (typeof loadAssignments === 'function') loadAssignments();
      if (typeof loadStudentNotifications === 'function') loadStudentNotifications();
    } catch (err) {
      msg.innerHTML = `<span style="color:var(--red-accent);display:inline-flex;align-items:center;gap:6px;"><svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ${escapeHtml(err.message || 'Failed to link teacher. Check code and try again.')}</span>`;
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
  let cachedActiveAnnouncements = [];

  function toggleNotifDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('notifDropdown');
    const backdrop = document.getElementById('notifBackdrop');
    if (!dropdown) return;
    const isShowing = dropdown.style.display !== 'none';
    dropdown.style.display = isShowing ? 'none' : 'flex';
    if (backdrop) backdrop.style.display = isShowing ? 'none' : 'block';
    if (!isShowing) {
      if (window.VLKNotifs && typeof window.VLKNotifs.syncWithServer === 'function') {
        window.VLKNotifs.syncWithServer().catch(() => {});
      }
      if (window.VLKPush && typeof window.VLKPush.syncUI === 'function') {
        window.VLKPush.syncUI();
      }
    }
  }

  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const backdrop = document.getElementById('notifBackdrop');
    const bellBtn = document.getElementById('notifBellBtn');
    if (dropdown && dropdown.style.display !== 'none') {
      if (!dropdown.contains(e.target) && (!bellBtn || !bellBtn.contains(e.target))) {
        dropdown.style.display = 'none';
        if (backdrop) backdrop.style.display = 'none';
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dropdown = document.getElementById('notifDropdown');
      const backdrop = document.getElementById('notifBackdrop');
      if (dropdown && dropdown.style.display !== 'none') {
        dropdown.style.display = 'none';
        if (backdrop) backdrop.style.display = 'none';
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

    // 0. Active System Broadcast Announcements (Top Priority)
    (cachedActiveAnnouncements || []).forEach(a => {
      const cat = a.type || 'info';
      const catLabels = { info: 'System Notice', exam: 'Exam Practical Alert', warning: 'Urgent Bulletin' };
      rawList.push({
        id: 'ann_' + a.id,
        announcementId: a.id,
        title: (cat === 'exam' ? '📋 ' : cat === 'warning' ? '⚠️ ' : '📢 ') + (a.title || 'Broadcast Notice'),
        message: a.message || '',
        timestamp: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
        type: 'announcement',
        category: cat,
        categoryLabel: catLabels[cat] || 'System Notice',
        targetUrl: null,
        isPermanent: false
      });
    });

    // 1. Pending Prescribed Continuous Assessments
    (assignments || []).filter(a => !a.submitted).forEach(a => {
      const { targetUrl } = getAssignmentTargetUrl(a);
      const dueText = a.due_date ? `Due ${formatDate(a.due_date)}` : 'No set deadline';
      rawList.push({
        id: 'asgn_pending_' + a.id,
        assignmentId: a.id,
        title: 'Prescribed Assignment: ' + (a.title || 'Continuous Assessment'),
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
        title: 'Graded: ' + (a.title || 'Practical Assignment Marked'),
        message: `${scoreText}Your teacher marked this session. Click to view feedback & rubric.`,
        timestamp: a.marked_at ? new Date(a.marked_at).getTime() : Date.now(),
        type: 'marked_assignment',
        isPermanent: true,
        targetUrl: null,
        rawAssignment: a
      });
    });

    // 3. Add milestone notification if streak >= 1
    const streakEl = document.getElementById('streakCountMobile') || document.getElementById('streakCount');
    const streakVal = streakEl ? parseInt(streakEl.textContent, 10) : 1;
    if (streakVal > 0) {
      rawList.push({
        id: 'notif_streak_' + streakVal,
        assignmentId: null,
        title: 'Active Practice Streak',
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

    // In Native Android App: Trigger real system drawer notifications for unread assignments
    if (window.VirtuLabNative && typeof window.VirtuLabNative.showNotification === 'function') {
      try {
        if (localStorage.getItem('vlk_native_push_disabled') !== 'true') {
          const rawSeen = localStorage.getItem('vlk_native_notified_ids');
          const seen = rawSeen ? JSON.parse(rawSeen) : {};
          let hasNew = false;
          unreadNotifs.forEach(n => {
            if (n && n.id && !seen[n.id] && (n.type === 'pending_assignment' || n.type === 'marked_assignment')) {
              seen[n.id] = Date.now();
              hasNew = true;
              const cleanTitle = (n.title || 'VirtuLab Kenya').replace(/^[^\w\s]+/, '').trim();
              window.VirtuLabNative.showNotification(cleanTitle, n.message || '', n.targetUrl || '/student/home.html');
            }
          });
          if (hasNew) {
            localStorage.setItem('vlk_native_notified_ids', JSON.stringify(seen));
          }
        }
      } catch (e) {
        console.warn('[VirtuLabNative] notification dispatch error:', e);
      }
    }

    const badge = document.getElementById('notifBadge') || document.getElementById('notifCount');
    const bellBtn = document.getElementById('notifBellBtn');
    const list = document.getElementById('notifList');
    const unreadLabel = document.getElementById('notifUnreadLabel');

    if (unreadLabel) {
      unreadLabel.textContent = `${unreadNotifs.length} new`;
    }

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
          <div class="notif-empty-state">
            <div class="notif-empty-icon" aria-hidden="true"><svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <div class="notif-empty-title">All Caught Up!</div>
            <div class="notif-empty-sub">No unread lab notices or prescribed tasks. Read notices automatically expire after 24 hours.</div>
          </div>
        `;
        return;
      }

      list.innerHTML = activeNotifs.map(n => {
        const isRead = window.VLKNotifs ? window.VLKNotifs.isRead(n.id) : false;
        const hoursLeft = window.VLKNotifs ? window.VLKNotifs.getRemainingHours(n.id) : null;
        const timeAgo = window.VLKNotifs ? window.VLKNotifs.formatTimeAgo(n.timestamp) : '';
        const itemType = n.type || 'general';

        let iconSvg = '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
        if (itemType === 'announcement') {
          iconSvg = '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>';
        } else if (itemType === 'pending_assignment') {
          iconSvg = '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>';
        } else if (itemType === 'marked_assignment') {
          iconSvg = '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.48 12.89L17 22l-5-3-5 3 1.52-9.11"/></svg>';
        } else if (itemType === 'streak') {
          iconSvg = '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-2-1.5-3.5-2.5-5-.5-1-1-2.5-1-3.5 0 0-2.5 2.5-2.5 5 0 1-.5 1.5-1 2.5z"/><path d="M12 2c5 4.5 7 9 7 13a7 7 0 1 1-14 0c0-4 3-7.5 7-13z"/></svg>';
        }

        return `
          <div class="notif-card-item ${isRead ? 'read' : 'unread'} notif-type-${itemType}" onclick="clickNotifItem('${n.id}', ${n.assignmentId ? n.assignmentId : 'null'})">
            <div class="notif-item-icon-box" aria-hidden="true">
              <span>${iconSvg}</span>
            </div>
            <div class="notif-item-content">
              <div class="notif-item-top">
                <span class="notif-item-title">${escapeHtml(n.title)}</span>
                <span class="notif-item-time">${timeAgo}</span>
              </div>
              <div class="notif-item-body">
                ${escapeHtml(n.message)}
              </div>
              <div class="notif-item-footer">
                ${itemType === 'announcement' ? `
                  <span class="notif-action-chip notif-chip-ann">
                    <span>${escapeHtml(n.categoryLabel || 'Official Notice')}</span>
                  </span>
                ` : n.targetUrl ? `
                  <span class="notif-action-chip">
                    <span>Open Practical</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                ` : (n.rawAssignment && n.rawAssignment.submitted ? `
                  <span class="notif-action-chip notif-chip-rubric">
                    <span>View Rubric Feedback</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                ` : '')}
                ${n.isPermanent ? `
                  <span class="notif-perm-pill">Record</span>
                ` : (isRead && hoursLeft != null ? `
                  <span class="notif-expiry-pill">Expires in ${hoursLeft}h</span>
                ` : '')}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function clickNotifItem(notifId, assignmentId) {
    if (window.VLKNotifs) window.VLKNotifs.markAsRead(notifId);
    if (notifId && String(notifId).startsWith('ann_')) {
      const annId = String(notifId).replace(/^ann_/, '');
      try {
        localStorage.setItem('vlk_dismiss_ann_' + annId, 'true');
        sessionStorage.setItem('vlk_dismiss_ann_' + annId, 'true');
      } catch(e) {}
      const card = document.getElementById('ann-card-' + annId);
      if (card) {
        card.style.opacity = '0';
        setTimeout(() => {
          card.remove();
          const banner = document.getElementById('systemBroadcastBanner');
          if (banner && banner.querySelectorAll('.system-announcement-card').length === 0) {
            banner.style.display = 'none';
          }
        }, 200);
      }
    }
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
    const backdrop = document.getElementById('notifBackdrop');
    if (dropdown) dropdown.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
    loadAssignments();
  }

  function markAllNotificationsRead() {
    const activeNotifs = window.VLKNotifs ? window.VLKNotifs.filterActiveNotifications(studentNotificationsList) : [];
    if (window.VLKNotifs) {
      window.VLKNotifs.markAllAsRead(activeNotifs.map(n => n.id));
    }
    (cachedActiveAnnouncements || []).forEach(a => {
      try {
        localStorage.setItem('vlk_dismiss_ann_' + a.id, 'true');
        sessionStorage.setItem('vlk_dismiss_ann_' + a.id, 'true');
      } catch(e) {}
    });
    const banner = document.getElementById('systemBroadcastBanner');
    if (banner) banner.style.display = 'none';

    updateNotificationsUI(window._vlk_student_assignments || []);
    if (typeof loadAssignments === 'function') loadAssignments();
  }

  // Listen for Service Worker background push click / dismiss events to sync in-app notifications
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && (event.data.type === 'VLK_PUSH_CLICKED' || event.data.type === 'VLK_PUSH_DISMISSED')) {
        if (typeof loadAssignments === 'function') {
          loadAssignments();
        }
      }
    });
  }

  // Subscribe to real-time cross-device and cross-tab notification updates
  if (typeof window !== 'undefined' && window.VLKNotifs && typeof window.VLKNotifs.subscribe === 'function') {
    window.VLKNotifs.subscribe(() => {
      if (studentNotificationsList && studentNotificationsList.length > 0) {
        updateNotificationsUI(studentNotificationsList);
      } else if (typeof loadAssignments === 'function') {
        loadAssignments();
      }
    });
  }

  let currentAssignmentStatusFilter = 'all';

  function getAssignmentDisciplineMeta(a) {
    const t = (a.titration_type || a.type || a.title || '').toLowerCase();
    if (t.includes('kcsecomposite') || t.includes('composite') || t.includes('mock')) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>', label: 'KCSE Paper 3 Mock · 40m', accent: '#D97706', bg: 'rgba(245, 158, 11, 0.12)' };
    }
    if (t.includes('qualitative') || a.salt_key) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/></svg>', label: 'Qualitative Salt ID · Q2 (14m)', accent: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' };
    }
    if (t.includes('organic') || a.compound_key) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>', label: 'Organic Analysis · Q3 (8m)', accent: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
    }
    if (t.includes('solubility') || a.solute_key) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="20" y1="7" x2="4" y2="17"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="12" y1="6" x2="15" y2="3"/><line x1="12" y1="6" x2="9" y2="3"/><line x1="12" y1="18" x2="15" y2="21"/><line x1="12" y1="18" x2="9" y2="21"/></svg>', label: 'Solubility Curves · Q1b (10m)', accent: '#0284C7', bg: 'rgba(2, 132, 199, 0.12)' };
    }
    if (t.includes('energy') || t.includes('enthalpy') || t.includes('neutralization') || t.includes('displacement') || t.includes('solution') || a.en_system_id) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/><circle cx="11.5" cy="17.5" r="1.5" fill="currentColor"/></svg>', label: 'Thermochemistry (ΔH) · Q1b (12m)', accent: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' };
    }
    if (t.includes('rate') || t.includes('kinetic') || a.rate_exp_type) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', label: 'Reaction Rates · Q1b (12m)', accent: '#EAB308', bg: 'rgba(234, 179, 8, 0.12)' };
    }
    if (t.includes('gas') || a.gas_key) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>', label: 'Gas Preparation · Q2b (10m)', accent: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' };
    }
    if (t.includes('redox')) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.75 18.1A2 2 0 0 0 6.47 21h11.06a2 2 0 0 0 1.72-2.9L14 9.31V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>', label: 'Redox Titration · Q1 (15m)', accent: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' };
    }
    if (t.includes('precipit') || t.includes('mohr')) {
      return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>', label: 'Precipitation Titration · Q1 (12m)', accent: '#0284C7', bg: 'rgba(2, 132, 199, 0.12)' };
    }
    return { icon: '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M9.5 12h5"/></svg>', label: 'Volumetric Titration · Q1 (15m)', accent: '#059669', bg: 'rgba(16, 185, 129, 0.12)' };
  }

  function filterTeacherAssignments(statusFilter) {
    currentAssignmentStatusFilter = statusFilter || 'all';
    ['all', 'pending', 'review', 'marked'].forEach(key => {
      const btnId = 'statChip' + key.charAt(0).toUpperCase() + key.slice(1);
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.toggle('active', key === currentAssignmentStatusFilter);
    });

    const cards = document.querySelectorAll('#assignmentsList .assignment-card-box');
    let visibleCount = 0;
    cards.forEach(card => {
      const st = card.getAttribute('data-assign-status') || 'pending';
      const show = currentAssignmentStatusFilter === 'all' ||
        (currentAssignmentStatusFilter === 'pending' && (st === 'pending' || st === 'overdue')) ||
        (currentAssignmentStatusFilter === st);
      card.style.display = show ? 'flex' : 'none';
      if (show) visibleCount++;
    });

    const filterEmptyEl = document.getElementById('caFilterEmptyNotice');
    if (filterEmptyEl) {
      filterEmptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }
  window.filterTeacherAssignments = filterTeacherAssignments;

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
      const hasTeacher = !!(currentStudentUser && (currentStudentUser.teacherName || currentStudentUser.teacherId || currentStudentUser.teacherCode));

      if (assignments.length === 0) {
        const alertStrip = document.getElementById('assignmentAlertStrip');
        if (alertStrip) alertStrip.style.display = 'none';
        if (progressHeader) progressHeader.style.display = 'none';

        const progressBadge = document.getElementById('caProgressPercentBadge');
        if (progressBadge) {
          progressBadge.textContent = hasTeacher ? 'All Caught Up' : 'Not Connected';
          progressBadge.className = hasTeacher ? 'dash-section-badge badge-green' : 'dash-section-badge badge-cyan';
        }

        if (!hasTeacher) {
          box.innerHTML = `
            <div class="ca-empty-showcase is-unlinked">
              <div class="ca-empty-icon-ring is-blue" aria-hidden="true">
                <svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div class="ca-empty-content">
                <h4 class="ca-empty-title">Connect Your Chemistry Instructor</h4>
                <p class="ca-empty-desc">
                  Link your teacher's class code to automatically receive prescribed KCSE Paper 3 practical assessments, timed mocks, and official rubric evaluations.
                </p>
                <div class="ca-empty-features">
                  <span class="ca-feature-pill">Prescribed Practicals</span>
                  <span class="ca-feature-pill">Teacher Rubric Grading</span>
                  <span class="ca-feature-pill">Class Leaderboard</span>
                </div>
              </div>
              <button type="button" class="ca-empty-cta-btn" onclick="toggleTeacherLinkPanel()">
                Enter Teacher Code &rarr;
              </button>
            </div>
          `;
        } else {
          box.innerHTML = `
            <div class="ca-empty-showcase is-celebrate">
              <div class="ca-empty-icon-ring is-emerald" aria-hidden="true">
                <svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="ca-empty-content">
                <h4 class="ca-empty-title">All Caught Up! Zero Assignment Backlog</h4>
                <p class="ca-empty-desc">
                  Outstanding work! You have completed every prescribed practical assessment. Keep sharpening your skills on the free benches!
                </p>
                <div class="ca-empty-features">
                  <span class="ca-feature-pill">100% Submitted</span>
                  <span class="ca-feature-pill">Ready for Next Lab</span>
                </div>
              </div>
              <a href="#skillTreeContainer" class="ca-empty-cta-btn is-emerald">
                Practice Free Lab Benches &rarr;
              </a>
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
      const progressFraction = document.getElementById('caProgressFractionText');
      const statAll = document.getElementById('statChipAll');
      const statMarked = document.getElementById('statChipMarked');
      const statReview = document.getElementById('statChipReview');
      const statPending = document.getElementById('statChipPending');

      if (progressFill) {
        progressFill.style.width = percentComplete + '%';
      }
      if (progressFraction) {
        progressFraction.textContent = `${submittedCount} of ${totalCount} Submitted (${percentComplete}%)`;
      }
      if (progressBadge) {
        progressBadge.textContent = `${percentComplete}% Complete`;
        if (percentComplete === 100) {
          progressBadge.className = 'dash-section-badge badge-green';
        } else if (percentComplete > 0) {
          progressBadge.className = 'dash-section-badge badge-blue';
        } else {
          progressBadge.className = 'dash-section-badge badge-amber';
        }
      }
      if (statAll) statAll.innerHTML = `All <b>(${totalCount})</b>`;
      if (statMarked) statMarked.innerHTML = `<b>${markedCount}</b> Graded`;
      if (statReview) statReview.innerHTML = `<b>${reviewCount}</b> Under Review`;
      if (statPending) statPending.innerHTML = `<b>${pendingCount}</b> Pending`;

      const alertStrip = document.getElementById('assignmentAlertStrip');
      const aasText = document.getElementById('aasText');
      const aasBtn = document.getElementById('aasBtn');
      if (alertStrip && aasText) {
        if (pendingCount > 0) {
          alertStrip.style.display = 'flex';
          aasText.innerHTML = `<strong>${pendingCount} Pending Teacher Assignment${pendingCount > 1 ? 's' : ''}</strong>`;
          if (aasBtn) aasBtn.textContent = 'View →';
        } else if (markedCount > 0) {
          alertStrip.style.display = 'flex';
          aasText.innerHTML = `<strong>${markedCount} Graded Teacher Assignment${markedCount > 1 ? 's' : ''}</strong> available`;
          if (aasBtn) aasBtn.textContent = 'View Feedback →';
        } else {
          alertStrip.style.display = 'none';
        }
      }

      const cardsHtml = assignments.map(a => {
        const isSubmitted = !!a.submitted;
        const score = a.score ?? (a.evaluation && a.evaluation.score) ?? a.cs_total_score ?? a.gas_total_score ?? a.en_total_score ?? a.rate_total_score ?? a.sol_total_score;
        const isGraded = typeof score === 'number' || a.submission_status === 'marked' || a.marked_at != null || a.status === 'marked';
        const isPastDue = !isSubmitted && a.due_date && (new Date(a.due_date).setHours(23, 59, 59, 999) < Date.now());

        const { targetUrl, battleMode } = getAssignmentTargetUrl(a);
        const warmupUrl = `speed_battle.html?mode=${battleMode}&target=${encodeURIComponent(targetUrl)}`;
        const disc = getAssignmentDisciplineMeta(a);

        let statusType = 'pending';
        let statusChipHtml = '';
        let scoreBadgeHtml = '';
        let statusHtml = '';

        if (isSubmitted) {
          if (isGraded) {
            statusType = 'marked';
            statusChipHtml = `<span class="assign-status-chip is-marked">Graded</span>`;
            if (typeof score === 'number') {
              scoreBadgeHtml = `<span class="assign-score-pill">${Number(score).toFixed(1)} Marks</span>`;
            } else if (a.correct != null) {
              scoreBadgeHtml = `<span class="assign-score-pill ${a.correct ? 'is-pass' : 'is-retry'}">${a.correct ? 'Pass' : 'Review'}</span>`;
            }
            statusHtml = `
              <button type="button" class="submitted-pill" onclick="openAssignmentFeedbackModalById(${a.id})">
                <span>View Feedback &amp; Rubric &rarr;</span>
              </button>
            `;
          } else {
            statusType = 'review';
            statusChipHtml = `<span class="assign-status-chip is-review">Under Review</span>`;
            statusHtml = `
              <button type="button" class="submitted-pill is-review" onclick="openAssignmentFeedbackModalById(${a.id})">
                <span>Submitted · View Details &rarr;</span>
              </button>
            `;
          }
        } else if (isPastDue) {
          statusType = 'overdue';
          statusChipHtml = `<span class="assign-status-chip is-overdue">Overdue</span>`;
          statusHtml = `
            <div class="assign-actions-row">
              <a href="${targetUrl}" class="pending-pill-btn is-overdue-btn" aria-label="Complete overdue assignment: ${escapeHtml(a.title)}">
                Complete Overdue Lab &rarr;
              </a>
              <a href="${warmupUrl}" class="assign-warmup-icon-btn" title="Take optional 45s pre-lab warmup" aria-label="Warmup Drill">
                45s Warmup
              </a>
            </div>
          `;
        } else {
          statusType = 'pending';
          statusChipHtml = `<span class="assign-status-chip is-pending">Pending</span>`;
          statusHtml = `
            <div class="assign-actions-row">
              <a href="${targetUrl}" class="pending-pill-btn" aria-label="Start assignment: ${escapeHtml(a.title)}">
                Start Practical &rarr;
              </a>
              <a href="${warmupUrl}" class="assign-warmup-icon-btn" title="Take optional 45s pre-lab warmup" aria-label="Warmup Drill">
                45s Warmup
              </a>
            </div>
          `;
        }

        const dueBase = a.due_date ? `Due ${formatDate(a.due_date)}` : 'Flexible deadline';
        const dueLabel = isPastDue
          ? `<span class="assign-due-badge is-overdue">${dueBase}</span>`
          : `<span class="assign-due-badge">${dueBase}</span>`;

        const instructionsSnippet = a.instructions
          ? escapeHtml(a.instructions)
          : (isSubmitted
              ? 'Practical session recorded and linked to your Continuous Assessment ledger.'
              : 'Complete the practical workbench table and submit your findings for KNEC rubric grading.');

        return `
          <div class="assignment-card-box status-${statusType}" data-assign-status="${statusType}">
            <div>
              <div class="assign-card-top">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  ${statusChipHtml}
                  ${scoreBadgeHtml}
                </div>
                ${dueLabel}
              </div>

              <div class="assign-card-main-row">
                <div class="assign-disc-icon" style="background:${disc.bg}; color:${disc.accent};" aria-hidden="true">
                  ${disc.icon}
                </div>
                <div style="min-width:0; flex:1;">
                  <div class="assign-disc-tag" style="color:${disc.accent};">${escapeHtml(disc.label)}</div>
                  <h4 class="assign-card-title">${escapeHtml(a.title || 'Prescribed Practical')}</h4>
                </div>
              </div>

              <p class="assign-card-desc">${instructionsSnippet}</p>
            </div>

            <div class="assign-card-footer">
              ${statusHtml}
            </div>
          </div>
        `;
      }).join('');

      box.innerHTML = cardsHtml + `
        <div id="caFilterEmptyNotice" class="empty-box" style="display:none; grid-column: 1 / -1; padding: 20px; text-align:center;">
          No assignments match the selected filter. <button type="button" onclick="filterTeacherAssignments('all')" style="background:none; border:none; color:var(--cyan-accent); font-weight:800; cursor:pointer; text-decoration:underline;">Show All (${totalCount})</button>
        </div>
      `;

      if (currentAssignmentStatusFilter !== 'all') {
        filterTeacherAssignments(currentAssignmentStatusFilter);
      }
    } catch (err) {
      console.warn('Could not load assignments dynamically:', err);
      if (box) {
        box.innerHTML = `
          <div class="empty-box" style="grid-column: 1 / -1; padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; border: 1.5px dashed var(--card-border); border-radius: 12px;">
            <div style="display:flex; justify-content:center; margin-bottom: 8px;">
              <svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;color:#F59E0B;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style="font-weight: 700; color: var(--heading-color); margin-bottom: 4px;">Unable to load assignments right now</div>
            <div style="font-size: 0.78rem; margin-bottom: 12px;">${escapeHtml(err.message || 'Please check your connection or link your teacher code.')}</div>
            <button class="btn btn-secondary" onclick="loadAssignments()" style="padding: 6px 16px; font-size: 0.78rem; font-weight: 700; border-radius: 8px; cursor: pointer;">Retry</button>
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
      ? '<span class="pill pill-ok" style="font-size:1.1rem;padding:6px 14px;display:inline-flex;align-items:center;gap:6px;"><svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"/></svg> Pass (Concordant)</span>'
      : '<span class="pill pill-warn" style="font-size:1.1rem;padding:6px 14px;display:inline-flex;align-items:center;gap:6px;"><svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Needs Revision</span>';

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
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">KCSE Paper 3 Composite Exam Mark Breakdown</div>
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
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">Volumetric Analysis Details</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.83rem;margin-bottom:10px;background:var(--card-bg);padding:8px 10px;border-radius:8px;border:1px solid var(--card-border);">
          <div>Practical: <b>${escapeHtml(titTitle)}</b></div>
          <div>Indicator: <b>${escapeHtml(indUsed)}</b></div>
          <div>Trials Conducted: <b>${trialsCount}</b> (${readings} cm³)</div>
          <div>Average Titre: <b>${avgTitre}</b></div>
        </div>

        <div style="margin:10px 0;background:var(--card-bg);padding:10px 12px;border-radius:8px;border:1px solid var(--card-border);font-size:0.82rem;line-height:1.65;">
          <div style="font-weight:800;margin-bottom:6px;color:var(--heading-color);">KCSE Volumetric Calculations Breakdown:</div>
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
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">Qualitative Salt Analysis Details</div>
        <div>Salt Analyzed: <b>${escapeHtml(a.salt_name || a.salt_key || '—')}</b></div>
        <div>Cation Identified: <b>${escapeHtml(a.student_cation || '—')}</b> (${a.cation_correct ? 'Correct' : 'Incorrect'})</div>
        <div>Anion Identified: <b>${escapeHtml(a.student_anion || '—')}</b> (${a.anion_correct ? 'Correct' : 'Incorrect'})</div>
        <div>Observations Performed: <b>${a.q_tests_performed ?? '—'} tests (${a.q_tests_correct ?? '—'} accurate)</b></div>
      `);
    }

    // 4. Organic Chemistry
    if (a.compound_key || a.functional_group_correct != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">Organic Chemistry Identification</div>
        <div>Organic Sample: <b>${escapeHtml(a.compound_name || a.compound_key || '—')}</b></div>
        <div>Identified Functional Group: <b>${escapeHtml(a.student_functional_group || '—')}</b> (${a.functional_group_correct ? 'Correct' : 'Mismatch'})</div>
        <div>Confirmatory Tests: <b>${a.o_tests_performed ?? '—'} performed (${a.o_tests_correct ?? '—'} correct)</b></div>
      `);
    }

    // 5. Solubility Curves
    if (a.solute_key || a.sol_total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">Solubility Curves &amp; Crystallization</div>
        <div>Target Solute: <b>${escapeHtml(a.solute_name || a.solute_key || '—')}</b></div>
        <div>Crystallization Temp: <b>${a.crystallization_temp != null ? a.crystallization_temp + ' °C' : '—'}</b> (Theoretical: ${a.theoretical_temp != null ? a.theoretical_temp + ' °C' : '—'}, Δ ${a.temp_difference != null ? a.temp_difference + ' °C' : '—'})</div>
        <div>Mark Breakdown: Accuracy <b>${a.sol_accuracy_score ?? 0}/2.0</b> · Graph <b>${a.sol_graph_score ?? 0}/3.0</b> · Total: <b>${Number(a.sol_total_score || 0).toFixed(1)} / 5.0 Marks</b></div>
      `);
    }

    // 6. Thermochemistry Energy Changes
    if (a.en_system_id || a.en_total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">Thermochemistry &amp; Energy Changes</div>
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
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">Reaction Rates &amp; Chemical Kinetics</div>
        <div>Experiment: <b>${escapeHtml(a.rate_exp_title || a.rate_exp_type || '—')}</b></div>
        <div>Dilution Table 1: <b>${Number(a.rate_table_score || 0).toFixed(1)} / 5.0</b> · Rate Graph: <b>${Number(a.rate_graph_score || 0).toFixed(1)} / 4.0</b> · Calculations: <b>${Number(a.rate_calc_score || 0).toFixed(1)} / 6.0</b></div>
        <div>Total Score: <b>${Number(a.rate_total_score || 0).toFixed(1)} / 15.0 Marks (${escapeHtml(a.rate_grade || '—')})</b></div>
      `);
    }

    // 8. Gas Preparation
    if (a.gas_key || a.gas_total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;font-weight:800;color:var(--heading-color);">Gas Preparation &amp; Confirmatory Testing</div>
        <div>Gas Synthesized: <b>${escapeHtml(a.gas_name || a.gas_key || '—')}</b></div>
        <div>Drying Agent: <b>${escapeHtml(a.gas_drying_agent || '—')}</b> (${a.gas_drying_correct ? 'Correct' : 'Incorrect'})</div>
        <div>Collection Method: <b>${escapeHtml(a.gas_collection_method || '—')}</b> (${a.gas_collection_correct ? 'Correct' : 'Incorrect'})</div>
        <div>Tests Performed: <b>${a.gas_tests_performed ?? 0} (${a.gas_tests_correct ?? 0} correct)</b> · Total: <b>${Number(a.gas_total_score || 0).toFixed(1)} / 10.0 Marks</b></div>
      `);
    }

    document.getElementById('afDetails').innerHTML = details.length > 0
      ? details.join('')
      : '<i>No additional session details available.</i>';

    const commentEl = document.getElementById('afComments');
    if (commentEl) {
      const comment = a.teacher_feedback
        ? `<b>Teacher Evaluation &amp; Guidance:</b><br>"${escapeHtml(a.teacher_feedback)}"`
        : '<i>No written comments added by teacher.</i>';
      commentEl.innerHTML = comment;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // ── INTERACTIVE EXAMINER STUDY TIPS & ACTIVE RECALL ENGINE ──
  const STUDY_TIPS_LIBRARY = [
    {
      id: 'tip-burette-decimals',
      topic: 'volumetric',
      category: 'KNEC MARKING TRAP',
      badgeClass: 'badge-danger',
      title: 'Burette Reading Precision (Table 1)',
      body: 'KNEC Paper 3 penalizes any burette reading recorded to only 1 decimal place. Always record initial and final titres to 2 decimal places ending strictly in .00 or .50 (e.g. 24.50 cm³, not 24.5 cm³).',
      actionText: 'Practice Titration Bench →',
      actionUrl: 'lab.html?type=acidBase&studyMode=guided',
      quickCheck: {
        question: 'Which burette reading forfeits accuracy marks on KCSE Table 1?',
        options: [
          { text: 'A) 22.50 cm³', correct: false, explanation: 'Valid! Recorded to 2 decimal places ending in .50.' },
          { text: 'B) 18.4 cm³', correct: true, explanation: 'Correct! Recording to 1 decimal place loses the Table 1 decimal precision mark.' },
          { text: 'C) 0.00 cm³', correct: false, explanation: 'Valid! Initial zero reading properly formatted to 2 decimal places.' }
        ]
      }
    },
    {
      id: 'tip-concordancy-rule',
      topic: 'volumetric',
      category: 'TECHNIQUE & ACCURACY',
      badgeClass: 'badge-info',
      title: 'Averaging Concordant Titres (±0.10 cm³)',
      body: 'Never include your rough (first) trial in the final average! Only average 2 or 3 consecutive titres that differ by no more than ±0.10 cm³ to earn full concordancy marks.',
      actionText: 'Practice Concordancy Run →',
      actionUrl: 'lab.html?type=acidBase',
      quickCheck: {
        question: 'Given titres: Trial 1 (Rough) = 24.50, Trial 2 = 23.80, Trial 3 = 23.90 cm³. Which values should be averaged?',
        options: [
          { text: 'A) Trials 2 & 3 only (23.80 + 23.90)', correct: true, explanation: 'Correct! They are within ±0.10 cm³ and exclude the rough trial.' },
          { text: 'B) All three trials (24.50 + 23.80 + 23.90)', correct: false, explanation: 'Never include the rough trial or values differing by >0.20 cm³!' }
        ]
      }
    },
    {
      id: 'tip-redox-kmno4',
      topic: 'redox',
      category: 'TECHNIQUE & ACCURACY',
      badgeClass: 'badge-info',
      title: 'Redox Self-Indicating KMnO₄ Endpoint',
      body: 'Potassium permanganate (KMnO₄) is self-indicating! Stop adding titrant at the very first permanent faint pink tint. Also read the top of the dark KMnO₄ meniscus in the burette.',
      actionText: 'Practice Redox Titration →',
      actionUrl: 'lab.html?type=redox',
      quickCheck: {
        question: 'What indicates the equivalence point when titrating Fe²⁺ against acidified KMnO₄?',
        options: [
          { text: 'A) First permanent faint pink color', correct: true, explanation: 'Correct! One drop of excess MnO₄⁻ imparts a permanent pale pink tint.' },
          { text: 'B) Deep dark purple coloration', correct: false, explanation: 'Over-titrated! Deep purple means excess KMnO₄ was added beyond endpoint.' }
        ]
      }
    },
    {
      id: 'tip-dibasic-ratio',
      topic: 'dibasic',
      category: 'FORMULA & CALCULATION',
      badgeClass: 'badge-success',
      title: 'Dibasic Acid 1:2 Mole Ratio Rule',
      body: 'Sulfuric acid (H₂SO₄) and oxalic acid (H₂C₂O₄) react with NaOH in a 1:2 stoichiometric ratio (H₂X + 2NaOH → Na₂X + 2H₂O). Always divide moles of NaOH by 2 to find moles of acid!',
      actionText: 'Practice Dibasic Acid Lab →',
      actionUrl: 'lab.html?type=dibasic',
      quickCheck: {
        question: 'If 0.0040 moles of NaOH neutralized H₂SO₄, how many moles of H₂SO₄ reacted?',
        options: [
          { text: 'A) 0.0020 moles', correct: true, explanation: 'Correct! Since 1 mole of H₂SO₄ reacts with 2 moles of NaOH, moles of acid = 0.0040 / 2.' },
          { text: 'B) 0.0080 moles', correct: false, explanation: 'Multiplying by 2 reverses the stoichiometric ratio.' }
        ]
      }
    },
    {
      id: 'tip-al-pb-distinction',
      topic: 'qualitative',
      category: 'EXACT OBSERVATION',
      badgeClass: 'badge-purple',
      title: 'Distinguishing Al³⁺ from Pb²⁺ in Question 2',
      body: 'Both Al³⁺ and Pb²⁺ form white precipitates soluble in excess NaOH and insoluble in excess NH₃. Add aqueous Potassium Iodide (KI): Pb²⁺ forms a bright yellow precipitate (PbI₂), while Al³⁺ gives no precipitate!',
      actionText: 'Practice Qualitative Salts →',
      actionUrl: 'qualitative.html',
      quickCheck: {
        question: 'Which reagent confirms Pb²⁺ over Al³⁺ after both form white precipitates in NH₃(aq)?',
        options: [
          { text: 'A) Aqueous Potassium Iodide (KI)', correct: true, explanation: 'Correct! Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s) bright yellow precipitate.' },
          { text: 'B) Excess dilute Nitric Acid', correct: false, explanation: 'Nitric acid does not precipitate either cation.' }
        ]
      }
    },
    {
      id: 'tip-zn-excess-nh3',
      topic: 'qualitative',
      category: 'EXACT OBSERVATION',
      badgeClass: 'badge-purple',
      title: 'Confirming Zn²⁺ with Aqueous Ammonia',
      body: 'Zn²⁺, Al³⁺, and Pb²⁺ all dissolve in excess NaOH. However, in excess aqueous ammonia (NH₃), only Zn²⁺ dissolves to form a colorless complex ion [Zn(NH₃)₄]²⁺!',
      actionText: 'Test Cation Separations →',
      actionUrl: 'qualitative.html',
      quickCheck: {
        question: 'A solution gives a white precipitate soluble in both excess NaOH(aq) and excess NH₃(aq). Which ion is present?',
        options: [
          { text: 'A) Zn²⁺', correct: true, explanation: 'Correct! Only Zn²⁺ forms soluble ammine complexes in excess ammonia.' },
          { text: 'B) Pb²⁺', correct: false, explanation: 'Pb(OH)₂ is insoluble in excess aqueous ammonia.' }
        ]
      }
    },
    {
      id: 'tip-so3-so4-distinction',
      topic: 'qualitative',
      category: 'EXACT OBSERVATION',
      badgeClass: 'badge-purple',
      title: 'Sulfite (SO₃²⁻) vs Sulfate (SO₄²⁻) Anion Test',
      body: 'Both anions form white precipitates with Ba(NO₃)₂ or BaCl₂. Adding dilute HCl or HNO₃ dissolves white BaSO₃ precipitate with effervescence, whereas BaSO₄ remains insoluble!',
      actionText: 'Practice Anion Identification →',
      actionUrl: 'qualitative.html',
      quickCheck: {
        question: 'After adding BaCl₂(aq), a white precipitate dissolves upon adding dilute HCl. What is the anion?',
        options: [
          { text: 'A) Sulfite (SO₃²⁻) or Carbonate (CO₃²⁻)', correct: true, explanation: 'Correct! BaSO₃ and BaCO₃ dissolve in dilute acid; BaSO₄ does not.' },
          { text: 'B) Sulfate (SO₄²⁻)', correct: false, explanation: 'Barium sulfate (BaSO₄) is insoluble in dilute HCl.' }
        ]
      }
    },
    {
      id: 'tip-br2-organic-keyword',
      topic: 'organic',
      category: 'KNEC MARKING TRAP',
      badgeClass: 'badge-danger',
      title: 'Organic Unsaturation Keyword Rule (Question 3)',
      body: 'When testing alkenes/alkynes with bromine water or acidified KMnO₄, never write "turns clear". Always write: "Yellow/orange bromine water is decolorized immediately."',
      actionText: 'Practice Organic Lab →',
      actionUrl: 'organic.html',
      quickCheck: {
        question: 'Why does writing "Bromine water turns clear" lose marks in KCSE Paper 3?',
        options: [
          { text: 'A) "Clear" describes transparency, not color ("colorless" or "decolorized" is required)', correct: true, explanation: 'Correct! Colored solutions can also be clear (transparent). Use "decolorized".' },
          { text: 'B) Bromine water turns green instead', correct: false, explanation: 'Acidified K₂Cr₂O₇ turns green; bromine water turns colorless.' }
        ]
      }
    },
    {
      id: 'tip-enthalpy-cooling-curve',
      topic: 'energy',
      category: 'FORMULA & CALCULATION',
      badgeClass: 'badge-success',
      title: 'Thermochemistry ΔT Cooling Extrapolation',
      body: 'In enthalpy experiments (ΔH = -mcΔT / n), always extrapolate the cooling line back to the vertical line at the time of mixing to find the true peak ΔT corrected for heat loss!',
      actionText: 'Practice Calorimetry →',
      actionUrl: 'energy.html',
      quickCheck: {
        question: 'In ΔH calculations, what must always be included with the final numerical value?',
        options: [
          { text: 'A) Explicit + or - sign and kJ/mol units (e.g. -57.2 kJ/mol)', correct: true, explanation: 'Correct! Omitting the negative sign for exothermic reactions forfeits half the mark.' },
          { text: 'B) Only the positive number in Joules', correct: false, explanation: 'Molar enthalpy requires kJ/mol and an explicit sign.' }
        ]
      }
    },
    {
      id: 'tip-rates-disappearing-cross',
      topic: 'rates',
      category: 'FORMULA & CALCULATION',
      badgeClass: 'badge-info',
      title: 'Reaction Rates & Reciprocal Time (1/t)',
      body: 'In the sodium thiosulfate disappearing cross practical, rate of reaction is represented by 1/t (s⁻¹). Plotting 1/t against concentration yields a straight line through the origin!',
      actionText: 'Practice Reaction Rates →',
      actionUrl: 'rates.html',
      quickCheck: {
        question: 'If the cross disappears in 20 seconds, what is the rate (1/t) value recorded in the table?',
        options: [
          { text: 'A) 0.050 s⁻¹', correct: true, explanation: 'Correct! 1 / 20 = 0.050 s⁻¹.' },
          { text: 'B) 20.0 s⁻¹', correct: false, explanation: '20 s is the time t, not the reciprocal 1/t.' }
        ]
      }
    },
    {
      id: 'tip-ammonia-drying',
      topic: 'gas',
      category: 'KNEC MARKING TRAP',
      badgeClass: 'badge-danger',
      title: 'Drying Ammonia Gas (Calcium Oxide Only)',
      body: 'Ammonia (NH₃) is the only common alkaline gas. Never dry it with conc. H₂SO₄ (reacts to form ammonium sulfate) or anhydrous CaCl₂ (forms CaCl₂·8NH₃ adduct). Always use Calcium Oxide (CaO)!',
      actionText: 'Practice Gas Preparation →',
      actionUrl: 'gas_prep.html',
      quickCheck: {
        question: 'How is dry ammonia gas collected in the laboratory?',
        options: [
          { text: 'A) Upward delivery (downward displacement of air)', correct: true, explanation: 'Correct! Ammonia is less dense than air and very soluble in water.' },
          { text: 'B) Over water', correct: false, explanation: 'Ammonia is extremely soluble in water and cannot be collected over water.' }
        ]
      }
    },
    {
      id: 'tip-table1-units',
      topic: 'general',
      category: 'KNEC MARKING TRAP',
      badgeClass: 'badge-warning',
      title: 'Mandatory Units & Working Steps',
      body: 'Never write bare numbers in Paper 3 calculations! Always state clear working steps and attach units: cm³ for volume, mol/dm³ (or M) for molarity, and g/dm³ for mass concentration.',
      actionText: 'Explore KNEC Rubric Guide →',
      actionUrl: 'titration_theory.html',
      quickCheck: {
        question: 'How do you convert molarity (mol/dm³) into mass concentration (g/dm³)?',
        options: [
          { text: 'A) Multiply Molarity by Relative Formula Mass (Molarity × RFM)', correct: true, explanation: 'Correct! Mass conc (g/dm³) = Molarity (mol/dm³) × Molar Mass (g/mol).' },
          { text: 'B) Divide Molarity by 1000', correct: false, explanation: 'Dividing by 1000 converts dm³ to cm³, not to grams.' }
        ]
      }
    }
  ];

  let currentTipIndex = 0;

  function getSavedTipIds() {
    try {
      const raw = localStorage.getItem('vlk_saved_tips');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function getAnsweredQuizIds() {
    try {
      const raw = localStorage.getItem('vlk_answered_tip_quizzes');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function renderStudyTipByIndex(idx) {
    if (!STUDY_TIPS_LIBRARY.length) return;
    currentTipIndex = ((idx % STUDY_TIPS_LIBRARY.length) + STUDY_TIPS_LIBRARY.length) % STUDY_TIPS_LIBRARY.length;
    const tip = STUDY_TIPS_LIBRARY[currentTipIndex];

    const badgeEl = document.getElementById('stCategoryBadge');
    const counterEl = document.getElementById('stCounter');
    const titleEl = document.getElementById('stTitle');
    const msgEl = document.getElementById('mwalimuMessage');
    const actionBtn = document.getElementById('stActionBtn');
    const actionText = document.getElementById('stActionText');
    const saveBtn = document.getElementById('stSaveBtn');
    const saveIcon = document.getElementById('stSaveIcon');

    if (badgeEl) {
      badgeEl.textContent = tip.category;
      badgeEl.className = `tip-category-badge ${tip.badgeClass || 'badge-warning'}`;
    }
    if (counterEl) {
      counterEl.textContent = `Tip ${currentTipIndex + 1}/${STUDY_TIPS_LIBRARY.length}`;
    }
    if (titleEl) {
      titleEl.textContent = tip.title;
    }
    if (msgEl) {
      msgEl.textContent = tip.body;
    }
    if (actionBtn) {
      actionBtn.href = tip.actionUrl || 'lab.html';
    }
    if (actionText) {
      actionText.textContent = (tip.actionText || 'Practice Now →').replace(/&rarr;/g, '→');
    }

    const savedIds = getSavedTipIds();
    const isSaved = savedIds.includes(tip.id);
    if (saveBtn) {
      saveBtn.classList.toggle('is-saved', isSaved);
      saveBtn.title = isSaved ? 'Saved in Exam Pocket (Click to remove)' : 'Save to Exam Pocket';
    }
    if (saveIcon) {
      saveIcon.innerHTML = isSaved
        ? '<svg class="vlk-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.75" style="width:14px;height:14px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        : '<svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="width:14px;height:14px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }

    // Populate Quick Recall Quiz
    const qBox = document.getElementById('stQuizBox');
    const qQuestion = document.getElementById('stQuizQuestion');
    const qOptions = document.getElementById('stQuizOptions');
    const qFeedback = document.getElementById('stQuizFeedback');
    const qBtnLabel = document.getElementById('stQuizBtnLabel');

    if (qBox && tip.quickCheck) {
      qBox.style.display = 'block';
      const answeredIds = getAnsweredQuizIds();
      const alreadyDone = answeredIds.includes(tip.id);

      if (qBtnLabel) {
        qBtnLabel.textContent = alreadyDone ? 'Quick Recall Completed' : 'Quick Recall Test (+10 XP)';
      }
      if (qQuestion) {
        qQuestion.textContent = tip.quickCheck.question;
      }
      if (qFeedback) {
        qFeedback.style.display = 'none';
        qFeedback.textContent = '';
      }
      if (qOptions) {
        qOptions.innerHTML = tip.quickCheck.options.map((opt, oIdx) => `
          <button type="button" class="quiz-opt-btn" onclick="answerTipQuiz('${tip.id}', ${oIdx})">
            ${escapeHtml(opt.text)}
          </button>
        `).join('');
      }
    } else if (qBox) {
      qBox.style.display = 'none';
    }
  }

  function cycleStudyTip(delta = 1) {
    if (window.BrilliantUI && window.BrilliantUI.audio) {
      window.BrilliantUI.audio.playClick();
    }
    renderStudyTipByIndex(currentTipIndex + delta);
  }

  function toggleTipQuiz() {
    const content = document.getElementById('stQuizContent');
    const chevron = document.getElementById('stQuizChevron');
    if (!content) return;
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'block' : 'none';
    if (chevron) chevron.classList.toggle('open', isHidden);
  }

  function answerTipQuiz(tipId, optIdx) {
    const tip = (tipId === 'diagnostic' && currentDiagnosticAdvice)
      ? currentDiagnosticAdvice
      : STUDY_TIPS_LIBRARY.find(t => t.id === tipId);
    if (!tip || !tip.quickCheck) return;

    const chosen = tip.quickCheck.options[optIdx];
    if (!chosen) return;

    const qOptions = document.getElementById('stQuizOptions');
    const qFeedback = document.getElementById('stQuizFeedback');
    const qBtnLabel = document.getElementById('stQuizBtnLabel');

    if (qOptions) {
      const btns = qOptions.querySelectorAll('.quiz-opt-btn');
      btns.forEach((btn, i) => {
        const opt = tip.quickCheck.options[i];
        if (opt && opt.correct) {
          btn.classList.add('is-correct');
        } else if (i === optIdx && !chosen.correct) {
          btn.classList.add('is-wrong');
        }
      });
    }

    if (qFeedback) {
      qFeedback.style.display = 'block';
      qFeedback.className = `quiz-feedback ${chosen.correct ? 'fb-ok' : 'fb-err'}`;
      qFeedback.textContent = chosen.explanation;
    }

    if (chosen.correct) {
      const answeredIds = getAnsweredQuizIds();
      if (!answeredIds.includes(tipId)) {
        answeredIds.push(tipId);
        try {
          localStorage.setItem('vlk_answered_tip_quizzes', JSON.stringify(answeredIds));
        } catch (e) {}

        if (window.GamificationEngine && typeof window.GamificationEngine.addXP === 'function') {
          window.GamificationEngine.addXP(10, 'Examiner Tip Quick Recall');
          if (typeof updateGamificationDashboardUI === 'function') {
            updateGamificationDashboardUI();
          }
        }
      }
      if (qBtnLabel) {
        qBtnLabel.textContent = 'Quick Recall Mastered (+10 XP)';
      }
      if (window.BrilliantUI && window.BrilliantUI.audio) {
        window.BrilliantUI.audio.playClick();
      }
    }
  }

  function toggleSaveCurrentTip() {
    const tip = STUDY_TIPS_LIBRARY[currentTipIndex];
    if (!tip) return;

    let savedIds = getSavedTipIds();
    const exists = savedIds.includes(tip.id);
    if (exists) {
      savedIds = savedIds.filter(id => id !== tip.id);
    } else {
      savedIds.push(tip.id);
    }

    try {
      localStorage.setItem('vlk_saved_tips', JSON.stringify(savedIds));
    } catch (e) {}

    renderStudyTipByIndex(currentTipIndex);
    renderSavedTipsPocket();
  }

  function removeSavedTip(tipId) {
    let savedIds = getSavedTipIds().filter(id => id !== tipId);
    try {
      localStorage.setItem('vlk_saved_tips', JSON.stringify(savedIds));
    } catch (e) {}
    renderStudyTipByIndex(currentTipIndex);
    renderSavedTipsPocket();
  }

  function toggleSavedTipsPocket() {
    const body = document.getElementById('savedTipsBody');
    const chevron = document.getElementById('savedTipsChevron');
    if (!body) return;
    const isHidden = body.style.display === 'none';
    body.style.display = isHidden ? 'block' : 'none';
    if (chevron) chevron.classList.toggle('open', isHidden);
  }

  function renderSavedTipsPocket() {
    const countChip = document.getElementById('savedTipsCountChip');
    const container = document.getElementById('savedTipsListContainer');
    const savedIds = getSavedTipIds();

    if (countChip) {
      countChip.textContent = `${savedIds.length} Saved`;
    }
    if (!container) return;

    const savedTips = STUDY_TIPS_LIBRARY.filter(t => savedIds.includes(t.id));
    if (savedTips.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 18px 12px; color: var(--text-muted); font-size: 0.82rem;">
          No tips bookmarked yet. Click the <b>Save</b> button on any Examiner Study Tip card on your workbench to build your personal KCSE Paper 3 morning revision sheet!
        </div>
      `;
      return;
    }

    container.innerHTML = savedTips.map(tip => `
      <div class="saved-tip-pocket-item">
        <div>
          <div class="saved-tip-pocket-top">
            <span class="tip-category-badge ${tip.badgeClass || 'badge-warning'}">${escapeHtml(tip.category)}</span>
            <button type="button" onclick="removeSavedTip('${tip.id}')" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; line-height:1;" title="Remove from pocket">&times;</button>
          </div>
          <h4 class="saved-tip-pocket-title" style="margin-top:6px;">${escapeHtml(tip.title)}</h4>
          <p class="saved-tip-pocket-text" style="margin-top:4px;">${escapeHtml(tip.body)}</p>
        </div>
        <div class="saved-tip-pocket-actions">
          <a href="${escapeHtml(tip.actionUrl)}" style="font-size:0.76rem; font-weight:800; color:var(--cyan-accent); text-decoration:none;">${escapeHtml(tip.actionText)}</a>
        </div>
      </div>
    `).join('');
  }

  window.cycleStudyTip = cycleStudyTip;
  window.toggleTipQuiz = toggleTipQuiz;
  window.answerTipQuiz = answerTipQuiz;
  window.toggleSaveCurrentTip = toggleSaveCurrentTip;
  window.removeSavedTip = removeSavedTip;
  window.toggleSavedTipsPocket = toggleSavedTipsPocket;

  let currentDiagnosticAdvice = null;

  function renderCustomDiagnosticAdvice(advice) {
    currentDiagnosticAdvice = advice;
    const catBadge = document.getElementById('stCategoryBadge');
    const counterEl = document.getElementById('stCounter');
    const titleEl = document.getElementById('stTitle');
    const bodyEl = document.getElementById('mwalimuMessage');
    const actionBtn = document.getElementById('stActionBtn');
    const actionText = document.getElementById('stActionText');
    const scanNotice = document.getElementById('mwalimuDiagnosticText');
    const sourceLine = document.getElementById('mwalimuSourceLine');

    if (catBadge) {
      catBadge.textContent = advice.category;
      catBadge.className = 'tip-category-badge ' + (advice.badgeClass || 'badge-danger');
    }
    if (counterEl) {
      counterEl.textContent = 'Diagnostic Scan';
    }
    if (titleEl) titleEl.textContent = advice.title;
    if (bodyEl) bodyEl.textContent = advice.body;
    if (actionBtn) {
      actionBtn.href = advice.actionUrl;
      actionBtn.setAttribute('data-tooltip', 'Launch targeted diagnostic drill now');
    }
    if (actionText) actionText.textContent = advice.actionText;
    if (scanNotice && advice.sourceNotice) {
      scanNotice.innerHTML = advice.sourceNotice;
    }
    if (sourceLine) {
      sourceLine.textContent = 'AI Diagnostic Scanner · Active Misconception';
    }

    // Active Recall Quiz integration
    const quizQuestionEl = document.getElementById('stQuizQuestion');
    const quizOptionsEl = document.getElementById('stQuizOptions');
    const quizFeedbackEl = document.getElementById('stQuizFeedback');

    if (quizQuestionEl && quizOptionsEl && advice.quickCheck) {
      advice.id = 'diagnostic';
      quizQuestionEl.textContent = advice.quickCheck.question;
      quizOptionsEl.innerHTML = advice.quickCheck.options.map((opt, optIdx) => `
        <button type="button" class="quiz-opt-btn" onclick="answerTipQuiz('diagnostic', ${optIdx})">
          ${escapeHtml(opt.text)}
        </button>
      `).join('');
      if (quizFeedbackEl) {
        quizFeedbackEl.style.display = 'none';
        quizFeedbackEl.className = 'quiz-feedback';
        quizFeedbackEl.textContent = '';
      }
    }
  }

  function updateMwalimuAdvice(sessions) {
    renderSavedTipsPocket();

    const sessionList = (Array.isArray(sessions) && sessions.length > 0)
      ? sessions
      : (cachedStudentSessions || []);

    const scanNotice = document.getElementById('mwalimuDiagnosticText');
    const sourceLine = document.getElementById('mwalimuSourceLine');

    // 1. New Student (0 sessions)
    if (sessionList.length === 0) {
      if (scanNotice) {
        scanNotice.innerHTML = '✨ <strong>Diagnostic Tutor Active:</strong> Complete your first lab practical to begin AI error diagnostics.';
      }
      if (sourceLine) sourceLine.textContent = 'Diagnostic Lab Guidance · New Student';
      renderStudyTipByIndex(0);
      return;
    }

    // Analyze session history for specific error patterns
    const recentSessions = sessionList.slice(0, 8);
    const recentAccuracy = Math.round((recentSessions.filter(s => s.correct || (s.score_pct != null && s.score_pct >= 60)).length / recentSessions.length) * 100);

    let diagnosticAdvice = null;

    // A. Check for Cation Test Tube Confusion (Al³⁺ vs Pb²⁺ or Zn²⁺)
    const cationErrSession = sessionList.find(s => {
      const saltStr = (s.salt_key || s.compound_name || s.practical_key || '').toLowerCase();
      const stdCation = (s.student_cation || '').toLowerCase();
      const trueCation = (s.true_cation || '').toLowerCase();
      const isQual = saltStr.includes('qualitative') || saltStr.includes('salt') || s.cation_correct === false || stdCation !== '';
      return isQual && (!s.correct || s.cation_correct === false || (stdCation && trueCation && stdCation !== trueCation));
    });

    if (cationErrSession) {
      const stdC = (cationErrSession.student_cation || '').toUpperCase();
      const trueC = (cationErrSession.true_cation || '').toUpperCase();
      if ((stdC.includes('AL') && trueC.includes('PB')) || (stdC.includes('PB') && trueC.includes('AL')) || cationErrSession.salt_key?.includes('Pb') || cationErrSession.salt_key?.includes('Al')) {
        diagnosticAdvice = {
          category: '⚠️ CATION MISCONCEPTION',
          badgeClass: 'badge-danger',
          sourceNotice: '✨ <strong>Error Detected:</strong> Al³⁺ vs Pb²⁺ precipitate confusion in recent salt analysis',
          title: 'Cation Trap: Al³⁺ vs Pb²⁺ Confirmatory Test',
          body: 'You recently confused Al³⁺ and Pb²⁺. Both produce white precipitates that dissolve in excess NaOH. However, adding potassium iodide (KI) produces a diagnostic bright canary-yellow precipitate of PbI₂ strictly with Pb²⁺, whereas Al³⁺ gives no change. Always confirm with KI before concluding!',
          actionText: 'Practice Pb²⁺ vs Al³⁺ Confirmation Drill →',
          actionUrl: 'lab.html?type=qualitative&bench=cations',
          quickCheck: {
            question: 'Which reagent distinguishes Al³⁺(aq) from Pb²⁺(aq) when both dissolve in excess NaOH?',
            options: [
              { text: 'A) Dilute HCl', correct: false, explanation: 'Incorrect! Both give white precipitates or no sharp contrast.' },
              { text: 'B) Potassium Iodide (KI)', correct: true, explanation: 'Correct! KI yields a bright canary-yellow precipitate of PbI₂ with Pb²⁺ only.' },
              { text: 'C) Excess Ammonia solution', correct: false, explanation: 'Incorrect! Both form white precipitates that do NOT dissolve in excess ammonia.' }
            ]
          }
        };
      } else if (stdC.includes('ZN') || trueC.includes('ZN') || cationErrSession.salt_key?.includes('Zn')) {
        diagnosticAdvice = {
          category: '⚠️ AMPHOTERIC CATION TRAP',
          badgeClass: 'badge-warning',
          sourceNotice: '✨ <strong>Error Detected:</strong> Incomplete separation in excess aqueous ammonia',
          title: 'Amphoteric Trap: Zn²⁺ vs Al³⁺ in Excess NH₃(aq)',
          body: 'In your qualitative analysis, you lost marks on aqueous ammonia. While both cations form white precipitates with a few drops of NH₃(aq), only Zn²⁺ dissolves in excess aqueous ammonia to form a colorless tetraammine complex [Zn(NH₃)₄]²⁺. Al³⁺ precipitate remains insoluble.',
          actionText: 'Practice Aqueous Ammonia Separation Drill →',
          actionUrl: 'lab.html?type=qualitative&bench=cations',
          quickCheck: {
            question: 'What is observed when excess aqueous ammonia is added to Zn²⁺ vs Al³⁺?',
            options: [
              { text: 'A) Both precipitates dissolve', correct: false, explanation: 'Incorrect! Al(OH)₃ remains insoluble in excess ammonia.' },
              { text: 'B) Only Zn²⁺ white precipitate dissolves', correct: true, explanation: 'Correct! Zn(OH)₂ dissolves in excess NH₃ to form [Zn(NH₃)₄]²⁺.' },
              { text: 'C) Neither precipitate dissolves', correct: false, explanation: 'Incorrect! Zn²⁺ dissolves.' }
            ]
          }
        };
      }
    }

    // B. Check for Titration Concordancy or Precision Errors
    if (!diagnosticAdvice) {
      const titrErrSession = sessionList.find(s => {
        const tTitle = (s.titration_title || s.titration_type || '').toLowerCase();
        const isTitr = tTitle.includes('titration') || tTitle.includes('acid') || tTitle.includes('redox') || tTitle.includes('volumetric');
        return isTitr && (!s.correct || s.concordant === false || (s.spread != null && s.spread > 0.20));
      });

      if (titrErrSession) {
        diagnosticAdvice = {
          category: '⚠️ TITRE CONCORDANCY PENALTY',
          badgeClass: 'badge-danger',
          sourceNotice: '✨ <strong>Titre Spread Alert:</strong> Values exceeded KNEC ±0.20 cm³ concordancy margin',
          title: 'Titre Concordancy Warning (KNEC Table 1)',
          body: 'In your recent titration, titres differed by more than 0.20 cm³. Paper 3 examiners penalize averaging non-concordant values: you forfeit all 4 calculation marks! If Trial 1 is 24.10 cm³ and Trial 2 is 24.50 cm³, you must perform a 3rd trial to achieve concordancy within ±0.20 cm³ before calculating the mean titre.',
          actionText: 'Practice Concordant Burette Swirling →',
          actionUrl: 'lab.html?type=acidBase&studyMode=guided',
          quickCheck: {
            question: 'Given titres of 21.30 cm³, 21.70 cm³, and 21.40 cm³, which should be averaged?',
            options: [
              { text: 'A) All three: (21.30 + 21.70 + 21.40) ÷ 3', correct: false, explanation: 'Penalty! 21.70 cm³ is non-concordant (spread 0.40 cm³).' },
              { text: 'B) 21.30 cm³ and 21.40 cm³ only', correct: true, explanation: 'Correct! Spread is only 0.10 cm³ (within ±0.20 cm³ concordancy window).' },
              { text: 'C) The two highest readings', correct: false, explanation: 'Incorrect! You must only average readings within ±0.20 cm³.' }
            ]
          }
        };
      }
    }

    // C. Check for Anion Acidification Errors (SO₃²⁻ vs SO₄²⁻)
    if (!diagnosticAdvice) {
      const anionErrSession = sessionList.find(s => s.anion_correct === false || (s.salt_key && (s.salt_key.includes('SO3') || s.salt_key.includes('SO4')) && !s.correct));
      if (anionErrSession) {
        diagnosticAdvice = {
          category: '⚠️ ANION DISTINCTION',
          badgeClass: 'badge-warning',
          sourceNotice: '✨ <strong>Error Detected:</strong> Confusion between Sulfite (SO₃²⁻) and Sulfate (SO₄²⁻)',
          title: 'Sulfite vs Sulfate: The Acidification Test',
          body: 'You lost marks distinguishing SO₃²⁻ and SO₄²⁻. Both form a white precipitate with BaCl₂(aq) or Ba(NO₃)₂(aq). However, BaSO₃ dissolves in dilute nitric acid with effervescence of SO₂ gas (which turns acidified K₂Cr₂O₇ green), while BaSO₄ is completely insoluble in dilute acid. Never forget the dilute acid step!',
          actionText: 'Drill Acidified Barium Nitrate Test →',
          actionUrl: 'lab.html?type=qualitative&bench=anions',
          quickCheck: {
            question: 'What occurs when dilute HNO₃ is added to barium sulfite (BaSO₃) precipitate?',
            options: [
              { text: 'A) Precipitate remains insoluble', correct: false, explanation: 'Incorrect! That is BaSO₄ (sulfate).' },
              { text: 'B) Precipitate dissolves with effervescence of SO₂ gas', correct: true, explanation: 'Correct! BaSO₃ reacts with acid producing sulfur dioxide gas.' },
              { text: 'C) Mixture turns bright yellow', correct: false, explanation: 'Incorrect.' }
            ]
          }
        };
      }
    }

    // D. Check for Energetics / Cooling Curve Errors
    if (!diagnosticAdvice) {
      const energyErr = sessionList.find(s => (s.system_id || s.experiment_type || '').includes('energy') && !s.correct);
      if (energyErr) {
        diagnosticAdvice = {
          category: '⚠️ THERMOCHEMISTRY TRAP',
          badgeClass: 'badge-info',
          sourceNotice: '✨ <strong>Thermochemistry Trap:</strong> Inaccurate temperature rise ΔT extrapolation',
          title: 'Calorimetry: Theoretical Maximum ΔT Extrapolation',
          body: 'Do not simply take the highest recorded thermometer value! Environmental cooling begins immediately upon mixing. You must extrapolate the linear cooling line back to the minute of mixing to obtain the true theoretical maximum temperature for enthalpy calculations (ΔH = mcΔT).',
          actionText: 'Practice Cooling Curve Extrapolation →',
          actionUrl: 'lab.html?type=energy',
          quickCheck: {
            question: 'Why do examiners require extrapolating temperature back to the mixing minute?',
            options: [
              { text: 'A) To account for heat loss to surroundings before max reading', correct: true, explanation: 'Correct! Cooling begins immediately, so extrapolation finds true ΔT.' },
              { text: 'B) Because thermometer calibration is always off by 2°C', correct: false, explanation: 'Incorrect.' },
              { text: 'C) To increase the volume of the reaction mixture', correct: false, explanation: 'Incorrect.' }
            ]
          }
        };
      }
    }

    // E. High Accuracy Streak Praise
    if (!diagnosticAdvice && recentAccuracy >= 80 && recentSessions.length >= 3) {
      diagnosticAdvice = {
        category: '🏆 DISTINCTION STREAK',
        badgeClass: 'badge-success',
        sourceNotice: `✨ <strong>Distinction Track:</strong> Outstanding ${recentAccuracy}% accuracy across your last ${recentSessions.length} sessions!`,
        title: 'Mwalimu Commendation: Top Chemist Trajectory',
        body: 'Superb work! You have mastered foundational titration concordancy and cation identification. To lock in your grade A on the national KCSE exam, practice full 40-mark composite mock practicals under strict 45-minute timed constraints.',
        actionText: 'Attempt 40-Mark Mock Practical →',
        actionUrl: 'composite_exam.html',
        quickCheck: {
          question: 'In standard volumetric analysis, what is the maximum acceptable titre deviation between concordant runs?',
          options: [
            { text: 'A) ±0.50 cm³', correct: false, explanation: 'Too large! Deductions apply.' },
            { text: 'B) ±0.20 cm³', correct: true, explanation: 'Correct! KNEC concordancy standard is strictly ±0.20 cm³.' },
            { text: 'C) ±1.00 cm³', correct: false, explanation: 'Gross error!' }
          ]
        }
      };
    }

    // Render diagnostic advice or fallback to library
    if (diagnosticAdvice) {
      renderCustomDiagnosticAdvice(diagnosticAdvice);
    } else {
      const idx = sessionList.length % STUDY_TIPS_LIBRARY.length;
      if (scanNotice) {
        scanNotice.innerHTML = `✨ <strong>Examiner Study Focus:</strong> High-yield tip #${idx + 1} of ${STUDY_TIPS_LIBRARY.length}`;
      }
      if (sourceLine) {
        sourceLine.textContent = 'Curated KCSE Marking Scheme Drills';
      }
      renderStudyTipByIndex(idx);
    }
  }

  function generateWeeklyTrajectorySvg(sessions) {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ dateStr, dayLabel, count: 0, passed: 0 });
    }

    if (Array.isArray(sessions)) {
      sessions.forEach(s => {
        const sDate = (s.created_at || s.timestamp || '').split('T')[0];
        const match = days.find(d => d.dateStr === sDate);
        if (match) {
          match.count++;
          if (s.correct || (s.score_pct != null && s.score_pct >= 50)) match.passed++;
        }
      });
    }

    const totalWeekly = days.reduce((sum, d) => sum + d.count, 0);
    const summaryEl = document.getElementById('trajectorySummaryText');
    if (summaryEl) {
      summaryEl.textContent = `${totalWeekly} practical session${totalWeekly === 1 ? '' : 's'} completed over the last 7 days`;
    }

    const maxCount = Math.max(3, ...days.map(d => d.count));
    const svgWidth = 460;
    const svgHeight = 110;
    const paddingX = 30;
    const paddingY = 20;
    const chartW = svgWidth - (paddingX * 2);
    const chartH = svgHeight - (paddingY * 2);

    const stepX = chartW / 6;
    const points = days.map((d, i) => {
      const x = paddingX + (i * stepX);
      const y = (paddingY + chartH) - ((d.count / maxCount) * chartH);
      return { x: Math.round(x), y: Math.round(y), ...d };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`;

    const pointsSvg = points.map(p => `
      <g class="trajectory-point-group" tabindex="0">
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#0284C7" stroke="#FFFFFF" stroke-width="2"/>
        <text x="${p.x}" y="${svgHeight - 4}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="10" fill="var(--text-muted)" font-weight="700">${p.dayLabel}</text>
        <title>${p.dayLabel} (${p.dateStr}): ${p.count} session${p.count === 1 ? '' : 's'}</title>
      </g>
    `).join('');

    return `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="trajectory-svg" aria-label="7-Day Activity Trajectory">
        <defs>
          <linearGradient id="trajGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284C7" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="#0284C7" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <line x1="${paddingX}" y1="${paddingY + chartH}" x2="${svgWidth - paddingX}" y2="${paddingY + chartH}" stroke="rgba(148,163,184,0.2)" stroke-width="1"/>
        <path d="${areaD}" fill="url(#trajGradient)"/>
        <path d="${pathD}" fill="none" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/>
        ${pointsSvg}
      </svg>
    `;
  }

  function renderMasteryModalData(data) {
    const { totalReadiness, coveredTopics, accuracyPct, totalSessions, discStats, sessions } = data;

    // 1. Large Circular Radial Gauge (C = 163.36)
    const modalRadialFill = document.getElementById('modalReadinessRadialFill');
    const modalScoreVal = document.getElementById('modalReadinessScoreVal');
    const modalBadge = document.getElementById('modalMasteryBadge');

    if (modalScoreVal) modalScoreVal.textContent = totalReadiness + '%';
    if (modalRadialFill) {
      const circumference = 163.36;
      const offset = Math.max(0, circumference - (circumference * totalReadiness / 100));
      modalRadialFill.style.strokeDashoffset = offset;
      if (totalReadiness >= 80) modalRadialFill.style.stroke = '#10B981';
      else if (totalReadiness >= 50) modalRadialFill.style.stroke = '#F59E0B';
      else modalRadialFill.style.stroke = '#EF4444';
    }

    if (modalBadge) {
      if (totalReadiness >= 80) modalBadge.textContent = '🟢 Mastered (80–100%)';
      else if (totalReadiness >= 50) modalBadge.textContent = '🟡 Improving (50–79%)';
      else modalBadge.textContent = '🔴 Needs Practice (<50%)';
    }

    // 2. Foundation Cards
    const topicsVal = document.getElementById('modalTopicsCoveredVal');
    const topicsFill = document.getElementById('modalTopicsProgressFill');
    const topicsFoot = document.getElementById('modalTopicsFoot');
    if (topicsVal) topicsVal.textContent = `${coveredTopics} / 10`;
    if (topicsFill) topicsFill.style.width = `${(coveredTopics / 10) * 100}%`;
    if (topicsFoot) topicsFoot.textContent = `${Math.round((coveredTopics / 10) * 100)}% of 40-mark syllabus covered`;

    const accVal = document.getElementById('modalAccuracyRateVal');
    const accFill = document.getElementById('modalAccuracyProgressFill');
    const accFoot = document.getElementById('modalAccuracyFoot');
    if (accVal) accVal.textContent = accuracyPct + '%';
    if (accFill) accFill.style.width = accuracyPct + '%';
    if (accFoot) accFoot.textContent = `Across ${totalSessions} total practical attempts`;

    // 3. Discipline Mastery Bars
    const discListEl = document.getElementById('disciplineMasteryList');
    if (discListEl) {
      const DISC_ITEMS = [
        { key: 'volumetric', title: 'Volumetric Analysis', paper: 'Paper 3 · Q1 (15 Marks)', icon: '🧪', count: data.topicCounts.acidBase + data.topicCounts.redox + data.topicCounts.precipitation, benchUrl: 'lab.html?type=acidBase' },
        { key: 'qualitative', title: 'Qualitative Salt Analysis', paper: 'Paper 3 · Q2 (15 Marks)', icon: '🧂', count: data.topicCounts.qualitative, benchUrl: 'lab.html?type=qualitative' },
        { key: 'rates', title: 'Reaction Rates & Kinetics', paper: 'Paper 3 · Q1/Q3 (12 Marks)', icon: '⚡', count: data.topicCounts.rates, benchUrl: 'lab.html?type=rates' },
        { key: 'energy', title: 'Energetics & Thermochemistry', paper: 'Paper 3 · Q1/Q3 (10 Marks)', icon: '🔥', count: data.topicCounts.energy, benchUrl: 'lab.html?type=energy' },
        { key: 'organic', title: 'Organic & Gas Evolution', paper: 'Paper 3 · Q3 (8 Marks)', icon: '🌿', count: data.topicCounts.organic + data.topicCounts.gas, benchUrl: 'lab.html?type=organic' }
      ];

      discListEl.innerHTML = DISC_ITEMS.map(item => {
        const pct = discStats[item.key] || 0;
        let badgeHtml = '<span class="pulse-mastery-chip chip-practice" style="font-size:0.65rem;">🔴 Needs Practice</span>';
        let barColor = 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)';
        if (pct >= 80) {
          badgeHtml = '<span class="pulse-mastery-chip chip-mastered" style="font-size:0.65rem;">🟢 Mastered</span>';
          barColor = 'linear-gradient(90deg, #10B981 0%, #059669 100%)';
        } else if (pct >= 50) {
          badgeHtml = '<span class="pulse-mastery-chip chip-improving" style="font-size:0.65rem;">🟡 Improving</span>';
          barColor = 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)';
        }

        return `
          <div class="discipline-mastery-item">
            <div class="discipline-item-top">
              <div class="discipline-item-name-row">
                <span class="discipline-item-icon">${item.icon}</span>
                <span class="discipline-item-title">${item.title}</span>
                <span class="discipline-paper-badge">${item.paper}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:800; color:var(--heading-color);">${pct}%</span>
                ${badgeHtml}
              </div>
            </div>
            <div class="discipline-bar-wrap">
              <div class="discipline-bar-fill" style="width: ${pct}%; background: ${barColor};"></div>
            </div>
            <div class="discipline-item-bottom">
              <span>${item.count} sessions completed</span>
              <a href="${item.benchUrl}" style="color:var(--cyan-accent); text-decoration:none;">Practice Bench &rarr;</a>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. 7-Day Trajectory Area Graph
    const trajWrap = document.getElementById('trajectorySvgWrap');
    if (trajWrap) {
      trajWrap.innerHTML = generateWeeklyTrajectorySvg(sessions);
    }

    // 5. Coach Verdict
    const verdictEl = document.getElementById('masteryCoachVerdictText');
    if (verdictEl) {
      if (totalReadiness >= 80) {
        verdictEl.innerHTML = '<strong>Distinction Ready (Grade A Trajectory):</strong> You have demonstrated consistent proficiency across all KNEC Paper 3 disciplines. Prioritize timed composite past paper exams (40 marks) to optimize speed and burette swirling under pressure.';
      } else if (totalReadiness >= 50) {
        verdictEl.innerHTML = '<strong>Solid Foundation (Grade B+ Trajectory):</strong> Good mastery of standard acid-base titration. Focus your next 3 sessions on <em>Qualitative Salt confirmation tests (KI for Pb²⁺, BaCl₂ for SO₄²⁻)</em> to push your readiness past the 80% mark.';
      } else {
        verdictEl.innerHTML = '<strong>Developing Stage:</strong> Jumpstart your score by completing the Guided Volumetric Analysis practical and recording initial burette readings to 2 decimal places.';
      }
    }
  }

  function updateReadinessScore(sessions) {
    const sessionList = (Array.isArray(sessions) && sessions.length > 0)
      ? sessions
      : (cachedStudentSessions || []);

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

    sessionList.forEach(s => {
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
    const accuracyPct = sessionList.length > 0 ? (correctCount / sessionList.length) * 100 : 0;
    const accuracyScore = (accuracyPct / 100) * 30;
    const volumeScore = Math.min(sessionList.length, 10) * 2;

    const totalReadiness = Math.min(100, Math.round(topicScore + accuracyScore + volumeScore));

    const scoreNum = document.getElementById('readinessScoreNum');
    const barFill = document.getElementById('readinessBarFill');
    const statusEl = document.getElementById('readinessStatus');
    const certBtn = document.getElementById('certClaimBtn');

    if (scoreNum) scoreNum.textContent = totalReadiness + '%';
    if (barFill) barFill.style.width = totalReadiness + '%';
    if (certBtn) certBtn.style.display = (totalReadiness >= 20 || sessionList.length > 0) ? 'inline-block' : 'none';

    let statusText = 'Novice';
    if (totalReadiness >= 85) statusText = 'Distinction Ready';
    else if (totalReadiness >= 70) statusText = 'Competent';
    else if (totalReadiness >= 40) statusText = 'Developing';
    if (statusEl) statusEl.textContent = statusText;

    // Update Pulse Strip: KCSE Readiness
    const pulseReadinessVal = document.getElementById('pulseReadinessVal');
    const pulseReadinessBarFill = document.getElementById('pulseReadinessBarFill');
    const pulseReadinessSub = document.getElementById('pulseReadinessSub');
    const pulseMasteryBadge = document.getElementById('pulseMasteryBadge');
    const pulseRadialFill = document.getElementById('pulseRadialFill');

    if (pulseReadinessVal) pulseReadinessVal.textContent = totalReadiness + '%';
    if (pulseReadinessBarFill) pulseReadinessBarFill.style.width = totalReadiness + '%';
    if (pulseReadinessSub) {
      pulseReadinessSub.textContent = `${coveredTopics} / 10 practical topics covered`;
    }

    // Circular SVG Radial Gauge on Card (Circumference = 131.95)
    if (pulseRadialFill) {
      const circumference = 131.95;
      const offset = Math.max(0, circumference - (circumference * totalReadiness / 100));
      pulseRadialFill.style.strokeDashoffset = offset;
      if (totalReadiness >= 80) pulseRadialFill.style.stroke = '#10B981';
      else if (totalReadiness >= 50) pulseRadialFill.style.stroke = '#F59E0B';
      else pulseRadialFill.style.stroke = '#EF4444';
    }

    if (pulseMasteryBadge) {
      pulseMasteryBadge.classList.remove('chip-mastered', 'chip-improving', 'chip-practice');
      if (totalReadiness >= 80) {
        pulseMasteryBadge.classList.add('chip-mastered');
        pulseMasteryBadge.textContent = '🟢 Mastered';
      } else if (totalReadiness >= 50) {
        pulseMasteryBadge.classList.add('chip-improving');
        pulseMasteryBadge.textContent = '🟡 Improving';
      } else {
        pulseMasteryBadge.classList.add('chip-practice');
        pulseMasteryBadge.textContent = '🔴 Needs Practice';
      }
    }

    // 5 Mini Discipline Bars on Card 3
    const discStats = {
      volumetric: Math.min(100, Math.round(((topicCounts.acidBase + topicCounts.redox + topicCounts.precipitation + topicCounts.complexometric) / 4) * 100)),
      qualitative: Math.min(100, Math.round((topicCounts.qualitative / 3) * 100)),
      rates: Math.min(100, Math.round((topicCounts.rates / 2) * 100)),
      energy: Math.min(100, Math.round((topicCounts.energy / 2) * 100)),
      organic: Math.min(100, Math.round(((topicCounts.organic + topicCounts.gas) / 2) * 100))
    };

    ['volumetric', 'qualitative', 'rates', 'energy', 'organic'].forEach(key => {
      const el = document.getElementById('miniDisc_' + key);
      if (el) el.style.height = `${Math.max(6, discStats[key])}%`;
    });

    for (const [key, count] of Object.entries(topicCounts)) {
      const el = document.getElementById('topicStatus-' + key);
      const item = document.querySelector(`.topic-item[data-topic="${key}"]`);
      if (el) {
        el.textContent = count > 0 ? `${count} session${count > 1 ? 's' : ''}` : 'Not started';
      }
      if (item) {
        if (count > 0) item.classList.add('mastered');
        else item.classList.remove('mastered');
      }
    }

    // Render detailed modal data
    renderMasteryModalData({
      totalReadiness,
      coveredTopics,
      accuracyPct: Math.round(accuracyPct),
      totalSessions: sessionList.length,
      topicCounts,
      discStats,
      sessions: sessionList
    });

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

  let adaptiveRecQueue = [];
  let currentRecIndex = 0;

  function buildAdaptiveRecommendationsQueue(sessions) {
    const topics = {
      acidBase: {
        key: 'acidBase',
        title: 'Acid-Base Titration (HCl vs NaOH)',
        iconName: 'burette',
        url: 'lab.html?type=acidBase',
        warmupMode: 'acidBase',
        paperTag: 'Paper 3 · Q1 (15 Marks)',
        timeTag: '~15 mins',
        xpTag: '+50 XP',
        focusHint: 'Master 2 decimal place burette readings (.00 or .05) and ±0.20 cm³ concordancy.',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      redox: {
        key: 'redox',
        title: 'Redox Titration (Fe²⁺ vs KMnO₄)',
        iconName: 'flask',
        url: 'lab.html?type=redox',
        warmupMode: 'redox',
        paperTag: 'Paper 3 · Q1 (15 Marks)',
        timeTag: '~15 mins',
        xpTag: '+55 XP',
        focusHint: 'Practice self-indicating KMnO₄ endpoints (first permanent pale pink tint) and 5:1 Fe²⁺:MnO₄⁻ stoichiometric ratios.',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      dibasic: {
        key: 'dibasic',
        title: 'Dibasic Acid Standardisation (H₂X)',
        iconName: 'burette',
        url: 'lab.html?type=dibasic',
        warmupMode: 'acidBase',
        paperTag: 'Paper 3 · Q1 (15 Marks)',
        timeTag: '~15 mins',
        xpTag: '+55 XP',
        focusHint: 'Master 1:2 acid-to-NaOH stoichiometric mole ratios and Relative Formula Mass (RFM) calculations.',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      precipitation: {
        key: 'precipitation',
        title: "Precipitation Titration (Mohr's Method)",
        iconName: 'droplet',
        url: 'lab.html?type=precipitation',
        warmupMode: 'precipitation',
        paperTag: 'Paper 3 · Q1 (12 Marks)',
        timeTag: '~12 mins',
        xpTag: '+50 XP',
        focusHint: 'Detect the brick-red Ag₂CrO₄ endpoint precipitate using K₂CrO₄ indicator.',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      qualitative: {
        key: 'qualitative',
        title: 'Qualitative Inorganic Salt Analysis',
        iconName: 'test-tube',
        url: 'qualitative.html',
        warmupMode: 'qualitative',
        paperTag: 'Paper 3 · Q2 (14 Marks)',
        timeTag: '~15 mins',
        xpTag: '+60 XP',
        focusHint: 'Identify unknown cations and anions using dropwise/excess NaOH, aqueous NH₃, and Ba(NO₃)₂.',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      organic: {
        key: 'organic',
        title: 'Organic Functional Group Identification',
        iconName: 'leaf',
        url: 'organic.html',
        warmupMode: 'organic',
        paperTag: 'Paper 3 · Q3 (8 Marks)',
        timeTag: '~10 mins',
        xpTag: '+50 XP',
        focusHint: 'Distinguish alkenes, alkanols, and carboxylic acids using Br₂ water, acidified H⁺/KMnO₄, and NaHCO₃.',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      energy: {
        key: 'energy',
        title: 'Thermochemistry & Enthalpy (ΔH)',
        iconName: 'flame',
        url: 'energy.html',
        warmupMode: 'energy',
        paperTag: 'Paper 3 · Q1b (12 Marks)',
        timeTag: '~12 mins',
        xpTag: '+55 XP',
        focusHint: 'Extrapolate cooling curves for ΔT and compute molar enthalpy ΔH = -mcΔT / (1000 × n) with mandatory +/- sign.',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      rates: {
        key: 'rates',
        title: 'Reaction Rates & Chemical Kinetics',
        iconName: 'timer',
        url: 'rates.html',
        warmupMode: 'rates',
        paperTag: 'Paper 3 · Q1b (12 Marks)',
        timeTag: '~12 mins',
        xpTag: '+55 XP',
        focusHint: 'Plot disappearing cross (Na₂S₂O₃ + HCl) 1/t vs concentration graphs and evaluate rate tangents.',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      solubility: {
        key: 'solubility',
        title: 'Solubility Curves & Crystallization',
        iconName: 'thermometer',
        url: 'solubility.html',
        warmupMode: 'solubility',
        paperTag: 'Paper 3 · Q1b (10 Marks)',
        timeTag: '~10 mins',
        xpTag: '+45 XP',
        focusHint: 'Record crystallization temperatures and plot smooth solubility curves (g / 100g water vs °C).',
        total: 0,
        correct: 0,
        lastTime: 0
      },
      gas: {
        key: 'gas',
        title: 'Gas Preparation & Confirmatory Tests',
        iconName: 'wind',
        url: 'gas_prep.html',
        warmupMode: 'gas',
        paperTag: 'Paper 3 · Q2b (10 Marks)',
        timeTag: '~10 mins',
        xpTag: '+50 XP',
        focusHint: 'Select appropriate drying agents (CaO for NH₃ vs conc. H₂SO₄) and gas collection methods.',
        total: 0,
        correct: 0,
        lastTime: 0
      }
    };

    const now = Date.now();
    const allSessions = (Array.isArray(window.latestSessions) && window.latestSessions.length > 0)
      ? window.latestSessions
      : (sessions || []);

    allSessions.forEach(s => {
      const rawType = (
        s.titration_title ||
        s.titration_type ||
        s.titrationKey ||
        s.salt_key ||
        s.salt_name ||
        s.compound_name ||
        s.compound_key ||
        s.solute_key ||
        s.solute_name ||
        s.system_id ||
        s.en_system_id ||
        s.experiment_type ||
        s.rate_exp_type ||
        s.gas_key ||
        s.gas_name ||
        ''
      ).toLowerCase();

      let topicKey = 'acidBase';
      if (rawType.includes('redox') || rawType.includes('kmno4')) topicKey = 'redox';
      else if (rawType.includes('dibasic') || rawType.includes('h2x') || rawType.includes('h2so4') || rawType.includes('oxalic')) topicKey = 'dibasic';
      else if (rawType.includes('precipit') || rawType.includes('mohr')) topicKey = 'precipitation';
      else if (rawType.includes('qualitative') || s.salt_key || s.salt_name || s.student_cation) topicKey = 'qualitative';
      else if (rawType.includes('organic') || s.compound_name || s.compound_key || s.student_functional_group) topicKey = 'organic';
      else if (rawType.includes('solubility') || s.solute_key || s.solute_name || s.crystallization_temp != null) topicKey = 'solubility';
      else if (rawType.includes('energy') || rawType.includes('enthalpy') || s.system_id || s.en_system_id) topicKey = 'energy';
      else if (rawType.includes('rate') || rawType.includes('kinetic') || s.experiment_type || s.rate_exp_type || s.method) topicKey = 'rates';
      else if (rawType.includes('gas') || s.gas_key || s.gas_name) topicKey = 'gas';
      else topicKey = 'acidBase';

      const t = topics[topicKey];
      if (!t) return;
      t.total++;

      const passed = !!(
        s.correct === true ||
        s.correct === 1 ||
        s.overall_correct === true ||
        (s.score_pct != null && s.score_pct >= 50) ||
        (s.total_score != null && s.total_score >= 6) ||
        (s.sol_total_score != null && s.sol_total_score >= 3) ||
        (s.en_total_score != null && s.en_total_score >= 8) ||
        (s.rate_total_score != null && s.rate_total_score >= 8) ||
        (s.gas_total_score != null && s.gas_total_score >= 6)
      );
      if (passed) t.correct++;

      const sTime = new Date(s.created_at || s.submitted_at || 0).getTime();
      if (sTime > t.lastTime) t.lastTime = sTime;
    });

    const topicList = Object.values(topics).map(t => ({
      ...t,
      accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0
    }));

    const queue = [];

    // ── Priority 1: Weak Spots (Attempted topics with < 75% accuracy) ──
    const weakTopics = topicList
      .filter(t => t.total > 0 && t.accuracy < 75)
      .sort((a, b) => a.accuracy - b.accuracy);

    weakTopics.slice(0, 2).forEach(t => {
      queue.push({
        topic: t,
        reasonBadge: `Focus Area: ${t.accuracy}% Accuracy`,
        badgeColor: '#EF4444',
        badgeBg: 'rgba(239, 68, 68, 0.18)',
        desc: `Your accuracy in ${t.title} is ${t.accuracy}% across ${t.total} run${t.total === 1 ? '' : 's'}. ${t.focusHint}`,
        masteryLabel: `Current Mastery: ${t.accuracy}% (${t.total} run${t.total === 1 ? '' : 's'})`,
        masteryGoal: 'Goal: &ge;80% (Distinction)',
        masteryPct: Math.max(12, t.accuracy),
        actionText: 'Fix Weak Spot →'
      });
    });

    // ── Priority 3: Unexplored Syllabus Topics (0 attempts) ──
    const unexplored = topicList.filter(t => t.total === 0);
    // Prioritize diverse KCSE Paper 3 coverage (Redox, Qualitative, Organic, Energy, etc.)
    const preferredOrder = ['redox', 'qualitative', 'organic', 'energy', 'rates', 'dibasic', 'solubility', 'gas', 'precipitation', 'acidBase'];
    unexplored.sort((a, b) => preferredOrder.indexOf(a.key) - preferredOrder.indexOf(b.key));

    unexplored.slice(0, 3).forEach(t => {
      queue.push({
        topic: t,
        reasonBadge: 'Unexplored Syllabus Topic',
        badgeColor: '#3B82F6',
        badgeBg: 'rgba(59, 130, 246, 0.18)',
        desc: `You haven't practiced ${t.title} yet. ${t.focusHint}`,
        masteryLabel: 'Current Mastery: Not Started (0 runs)',
        masteryGoal: 'Goal: &ge;80% (Distinction)',
        masteryPct: 8,
        actionText: 'Start Practical →'
      });
    });

    // ── Priority 4: Spaced Repetition Refreshers (> 3 days since last practice) ──
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const stale = topicList
      .filter(t => t.total > 0 && t.lastTime > 0 && (now - t.lastTime) > THREE_DAYS_MS)
      .sort((a, b) => a.lastTime - b.lastTime);

    stale.slice(0, 2).forEach(t => {
      const daysAgo = Math.max(1, Math.floor((now - t.lastTime) / (24 * 60 * 60 * 1000)));
      queue.push({
        topic: t,
        reasonBadge: `Spaced Refresher (${daysAgo}d ago)`,
        badgeColor: '#EAB308',
        badgeBg: 'rgba(234, 179, 8, 0.18)',
        desc: `It's been ${daysAgo} day${daysAgo === 1 ? '' : 's'} since your last ${t.title} session. ${t.focusHint}`,
        masteryLabel: `Current Mastery: ${t.accuracy}% (${t.total} run${t.total === 1 ? '' : 's'})`,
        masteryGoal: 'Goal: Maintain Distinction (&ge;85%)',
        masteryPct: Math.max(15, t.accuracy),
        actionText: 'Run Refresher →'
      });
    });

    // ── Priority 5: 40-Mark KCSE Paper 3 Composite Mock Capstone ──
    const coveredCount = topicList.filter(t => t.total > 0).length;
    const coveragePct = Math.round((coveredCount / topicList.length) * 100);
    queue.push({
      topic: {
        key: 'compositeExam',
        title: 'KCSE Paper 3 Full Composite Mock (Q1 + Q2 + Q3)',
        iconName: 'trophy',
        url: 'composite_exam.html',
        warmupMode: 'acidBase',
        paperTag: 'Full Paper 3 · 40 Marks',
        timeTag: '2¼ Hours Timed',
        xpTag: '+120 XP',
        total: coveredCount,
        accuracy: coveragePct
      },
      reasonBadge: coveredCount >= 6 ? 'Distinction Capstone Ready' : 'National Exam Simulation',
      badgeColor: '#10B981',
      badgeBg: 'rgba(16, 185, 129, 0.18)',
      desc: 'Challenge yourself under real KNEC examination conditions combining Q1 Volumetric Titration (15m), Q2 Qualitative Salt Analysis (15m), and Q3 Organic Functional ID (10m).',
      masteryLabel: `Syllabus Coverage: ${coveredCount}/10 Benches Practiced`,
      masteryGoal: 'Pass Mark: 20/40 (Distinction: 32+)',
      masteryPct: Math.max(12, coveragePct),
      actionText: 'Launch 40-Mark Mock →'
    });

    return queue.slice(0, 5);
  }

  function computeAdaptiveRecommendation(sessions) {
    adaptiveRecQueue = buildAdaptiveRecommendationsQueue(sessions);
    if (currentRecIndex >= adaptiveRecQueue.length) {
      currentRecIndex = 0;
    }
    return adaptiveRecQueue[currentRecIndex] || adaptiveRecQueue[0];
  }

  function renderAdaptiveRecommendationByIndex(idx) {
    const card = document.getElementById('adaptiveRecCard');
    if (!card || !adaptiveRecQueue || adaptiveRecQueue.length === 0) return;

    const total = adaptiveRecQueue.length;
    currentRecIndex = ((idx % total) + total) % total;
    const rec = adaptiveRecQueue[currentRecIndex];
    if (!rec || !rec.topic) return;

    const recIconEl = document.getElementById('recIcon');
    if (recIconEl) {
      const iconKey = rec.topic.iconName || 'target';
      if (window.VLKIcons && typeof window.VLKIcons.svg === 'function') {
        recIconEl.innerHTML = window.VLKIcons.svg(iconKey, { size: 28, strokeWidth: 1.75 });
      } else {
        recIconEl.textContent = '';
      }
    }

    const titleEl = document.getElementById('recTitle');
    if (titleEl) titleEl.textContent = rec.topic.title;

    const descEl = document.getElementById('recDesc');
    if (descEl) descEl.textContent = rec.desc;

    const badge = document.getElementById('recReasonBadge');
    if (badge) {
      badge.textContent = rec.reasonBadge;
      badge.style.color = rec.badgeColor;
      badge.style.background = rec.badgeBg;
    }

    const counterEl = document.getElementById('recCounter');
    if (counterEl) {
      counterEl.textContent = `${currentRecIndex + 1}/${total}`;
    }

    const paperTagEl = document.getElementById('recPaperTag');
    if (paperTagEl && rec.topic.paperTag) paperTagEl.textContent = rec.topic.paperTag;

    const timeTagEl = document.getElementById('recTimeTag');
    if (timeTagEl && rec.topic.timeTag) timeTagEl.textContent = rec.topic.timeTag;

    const xpTagEl = document.getElementById('recXpTag');
    if (xpTagEl && rec.topic.xpTag) xpTagEl.textContent = rec.topic.xpTag;

    const masteryLabelEl = document.getElementById('recMasteryLabel');
    if (masteryLabelEl && rec.masteryLabel) masteryLabelEl.textContent = rec.masteryLabel;

    const masteryGoalEl = document.getElementById('recMasteryGoal');
    if (masteryGoalEl && rec.masteryGoal) masteryGoalEl.textContent = rec.masteryGoal;

    const masteryFillEl = document.getElementById('recMasteryFill');
    if (masteryFillEl) {
      masteryFillEl.style.width = `${Math.min(100, Math.max(6, rec.masteryPct || 10))}%`;
    }

    const actionBtn = document.getElementById('recActionBtn');
    if (actionBtn) {
      actionBtn.href = rec.topic.url;
    }

    const actionTextEl = document.getElementById('recActionText');
    if (actionTextEl && rec.actionText) {
      actionTextEl.textContent = (rec.actionText || '').replace(/&rarr;/g, '→');
    }

    const warmupBtn = document.getElementById('recWarmupBtn');
    if (warmupBtn) {
      const mode = rec.topic.warmupMode || 'acidBase';
      warmupBtn.href = `speed_battle.html?mode=${encodeURIComponent(mode)}&target=${encodeURIComponent(rec.topic.url)}`;
    }

    card.style.display = 'block';
  }

  function renderAdaptiveRecommendation(sessions) {
    adaptiveRecQueue = buildAdaptiveRecommendationsQueue(sessions);
    currentRecIndex = 0;
    renderAdaptiveRecommendationByIndex(0);
  }

  function cycleRecommendedPractical(delta) {
    if (!adaptiveRecQueue || adaptiveRecQueue.length === 0) {
      adaptiveRecQueue = buildAdaptiveRecommendationsQueue(window.latestSessions || cachedStudentSessions || []);
    }
    renderAdaptiveRecommendationByIndex(currentRecIndex + (delta || 1));
    if (window.BrilliantUI && window.BrilliantUI.audio) {
      window.BrilliantUI.audio.playClick();
    }
  }
  window.cycleRecommendedPractical = cycleRecommendedPractical;

  let studentTrendChartInstance = null;
  let studentTypeChartInstance = null;
  let studentVelocityChartInstance = null;
  let currentStudentChartMode = 'mastery';
  let cachedStudentAnalytics = null;
  let cachedStudentSessions = null;

  // On-demand lazy loader for Chart.js (prevents 250KB from blocking initial page LCP)
  let chartJsLoading = false;
  let chartJsCallbacks = [];
  function ensureChartJs(callback) {
    if (typeof Chart !== 'undefined') {
      if (callback) callback();
      return;
    }
    if (callback) chartJsCallbacks.push(callback);
    if (chartJsLoading) return;
    chartJsLoading = true;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    script.integrity = 'sha384-bs/nf9FbdNouRbMiFcrcZfLXYPKiPaGVGplVbv7dLGECccEXDW+S3zjqSKR5ZEaD sha512-CQBWl4fJHWbryGE+Pc7UAxWMUMNMWzWxF4SQo9CgkJIN1kx6djDQZjh3Y8SZ1d+6I+1zze6Z7kHXO7q3UyZAWw==';
    script.crossOrigin = 'anonymous';
    script.defer = true;
    script.onload = () => {
      chartJsLoading = false;
      const cbs = chartJsCallbacks;
      chartJsCallbacks = [];
      cbs.forEach(cb => { try { cb(); } catch(e){} });
      if (typeof renderStudentCharts === 'function' && cachedStudentSessions) {
        renderStudentCharts(cachedStudentSessions, cachedStudentAnalytics);
      }
    };
    script.onerror = () => {
      chartJsLoading = false;
      chartJsCallbacks = [];
    };
    document.head.appendChild(script);
  }
  window.ensureChartJs = ensureChartJs;

  // Idle prefetch: load Chart.js only when browser has finished all critical paints
  if (typeof window !== 'undefined') {
    const scheduleIdleChartLoad = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => ensureChartJs(), { timeout: 6000 });
      } else {
        setTimeout(() => ensureChartJs(), 4000);
      }
    };
    if (document.readyState === 'complete') {
      scheduleIdleChartLoad();
    } else {
      window.addEventListener('load', scheduleIdleChartLoad, { once: true });
    }
  }

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
      if (title) title.textContent = 'Syllabus Discipline Mastery';
      if (subtitle) subtitle.textContent = 'Distribution of practical sessions by chemistry domain';
      if (studentTypeChartInstance) studentTypeChartInstance.resize();
    } else {
      if (btnMastery) btnMastery.classList.remove('active');
      if (btnVelocity) btnVelocity.classList.add('active');
      if (typeCanvas) typeCanvas.style.display = 'none';
      if (velocityCanvas) velocityCanvas.style.display = 'block';
      if (title) title.textContent = '4-Week Practice Velocity';
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

    // If Chart.js instances do not exist, re-render native charts to adapt to visible container
    if (!studentTrendChartInstance && typeof renderStudentCharts === 'function' && cachedStudentSessions) {
      try {
        renderStudentCharts(cachedStudentSessions, cachedStudentAnalytics);
      } catch (e) {
        console.warn('Resize native charts error:', e);
      }
    }
  };

  function drawNativeLineChart(canvas, labels, accuracyData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const parentW = (canvas.parentElement && canvas.parentElement.clientWidth > 50)
      ? canvas.parentElement.clientWidth
      : (canvas.clientWidth > 50 ? canvas.clientWidth : 340);
    const width = Math.max(parentW, 240);
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
    const parentW = (canvas.parentElement && canvas.parentElement.clientWidth > 50)
      ? canvas.parentElement.clientWidth
      : (canvas.clientWidth > 50 ? canvas.clientWidth : 340);
    const width = Math.max(parentW, 240);
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

    const centerX = Math.max(width * 0.32, 50);
    const centerY = height / 2;
    const outerRadius = Math.max(25, Math.min(centerX - 10, height / 2 - 15));
    const innerRadius = Math.max(10, Math.min(outerRadius - 8, outerRadius * 0.58));

    if (outerRadius <= 0 || isNaN(outerRadius) || innerRadius <= 0 || innerRadius >= outerRadius) return;

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
    const parentW = (canvas.parentElement && canvas.parentElement.clientWidth > 50)
      ? canvas.parentElement.clientWidth
      : (canvas.clientWidth > 50 ? canvas.clientWidth : 340);
    const width = Math.max(parentW, 240);
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
    const availableW = Math.max(width - padX * 2, 100);
    const barWidth = Math.max(8, Math.min(36, availableW / (items.length * 1.8)));
    const stepX = availableW / items.length;

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
    try {
      if (trendCanvas) drawNativeLineChart(trendCanvas, trendLabels, trendAccuracy);
      if (typeCanvas) drawNativeDoughnutChart(typeCanvas, typeCounts);
      if (velocityCanvas) {
        drawNativeBarChart(velocityCanvas, analytics?.weeklyVelocity);
      }
    } catch (fallbackErr) {
      console.warn('Native canvas chart fallback error:', fallbackErr);
    }
  }

  const BENCH_REGISTRY = {
    'acidBase': {
      id: 'acidBase',
      title: 'Volumetric Analysis Workbench',
      guidedTitle: 'Guided Volumetric Analysis (Acid-Base Standardisation)',
      url: 'lab.html?type=acidBase',
      guidedUrl: 'lab.html?studyMode=guided',
      topic: 'Volumetric Analysis',
      paperTag: 'Paper 3 · Q1 (15 Marks)',
      desc: 'Master burette reading precision (.00 or .05 cm³), concordant titres within ±0.20 cm³, and stoichiometry.',
      iconKey: 'burette'
    },
    'redox': {
      id: 'redox',
      title: 'Redox Titration (Fe²⁺ vs KMnO₄)',
      url: 'lab.html?type=redox',
      topic: 'Redox Volumetric',
      paperTag: 'Paper 3 · Q1 (15 Marks)',
      desc: 'Master self-indicating permanganate endpoints and 5:1 Fe²⁺:MnO₄⁻ stoichiometric ratios.',
      iconKey: 'flask'
    },
    'qualitative': {
      id: 'qualitative',
      title: 'Systematic Qualitative Analysis',
      url: 'qualitative.html',
      topic: 'Qualitative Salts',
      paperTag: 'Paper 3 · Q2 (15 Marks)',
      desc: 'Identify unknown cations and anions via aqueous NaOH, NH₃, Ba(NO₃)₂, AgNO₃, and flame tests.',
      iconKey: 'microscope'
    },
    'rates': {
      id: 'rates',
      title: 'Reaction Rates & Kinetics',
      url: 'rates.html',
      topic: 'Reaction Kinetics',
      paperTag: 'Paper 3 · Q1/Q3 (12 Marks)',
      desc: 'Disappearing cross experiment, Na₂S₂O₃ vs HCl rate curves (1/t vs conc), and activation energy.',
      iconKey: 'timer'
    },
    'energy': {
      id: 'energy',
      title: 'Thermochemistry & Energy Changes',
      url: 'energy.html',
      topic: 'Thermochemistry',
      paperTag: 'Paper 3 · Q1/Q3 (15 Marks)',
      desc: 'Calorimetric cooling curve extrapolation and molar enthalpies of solution, neutralisation & displacement.',
      iconKey: 'flame'
    },
    'solubility': {
      id: 'solubility',
      title: 'Solubility Curves & Crystallization',
      url: 'solubility.html',
      topic: 'Solubility Curves',
      paperTag: 'Paper 3 · Q1/Q3 (12 Marks)',
      desc: 'Determine crystallization inception temperatures for KCSE salt curves and solubility calculations.',
      iconKey: 'target'
    },
    'organic': {
      id: 'organic',
      title: 'Organic Chemistry & Functional Groups',
      url: 'organic.html',
      topic: 'Organic Chemistry',
      paperTag: 'Paper 3 · Q3 (10 Marks)',
      desc: 'Unsaturation tests with Br₂(aq) & acidified KMnO₄, acidified K₂Cr₂O₇ oxidation, and esterification.',
      iconKey: 'flask'
    },
    'gas': {
      id: 'gas',
      title: 'Gas Preparation & Analysis',
      url: 'gas_prep.html',
      topic: 'Inorganic Gases',
      paperTag: 'Paper 3 · Qualitative (10 Marks)',
      desc: 'Laboratory generation, drying methods, and confirmatory tests for H₂, O₂, CO₂, Cl₂, NH₃, SO₂.',
      iconKey: 'flask'
    }
  };

  function initResumeExperimentHero(sessions) {
    const heroCard = document.getElementById('resumeHeroCard');
    if (!heroCard) return;

    let targetBench = null;
    let badgeText = 'Continue Learning';
    let statusText = 'In Progress';
    let progressPct = 0;

    // 1. Check local storage for explicitly saved last active bench
    try {
      const stored = localStorage.getItem('vlk_last_active_bench');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.url || parsed.id)) {
          targetBench = parsed;
          badgeText = 'Resume Last Lab';
        }
      }
    } catch (e) {}

    // 2. If no explicit last active bench, inspect the most recent session
    const sessionList = (Array.isArray(sessions) && sessions.length > 0)
      ? sessions
      : (cachedStudentSessions || []);

    if (!targetBench && sessionList.length > 0) {
      const lastSession = sessionList[0];
      const rawType = (
        lastSession.titration_title ||
        lastSession.titration_type ||
        lastSession.titrationKey ||
        lastSession.salt_key ||
        lastSession.salt_name ||
        lastSession.compound_name ||
        lastSession.solute_key ||
        lastSession.solute_name ||
        lastSession.system_id ||
        lastSession.experiment_type ||
        lastSession.gas_key ||
        ''
      ).toLowerCase();

      let detectedKey = 'acidBase';
      if (rawType.includes('redox') || rawType.includes('kmno4')) detectedKey = 'redox';
      else if (rawType.includes('qualitative') || lastSession.salt_key || lastSession.salt_name) detectedKey = 'qualitative';
      else if (rawType.includes('rate') || lastSession.experiment_type) detectedKey = 'rates';
      else if (rawType.includes('energy') || lastSession.system_id) detectedKey = 'energy';
      else if (rawType.includes('solubility') || lastSession.solute_key) detectedKey = 'solubility';
      else if (rawType.includes('organic') || lastSession.compound_name) detectedKey = 'organic';
      else if (rawType.includes('gas') || lastSession.gas_key) detectedKey = 'gas';

      const registryItem = BENCH_REGISTRY[detectedKey];
      if (registryItem) {
        targetBench = {
          id: registryItem.id,
          url: registryItem.url,
          title: lastSession.titration_title || lastSession.salt_name || registryItem.title,
          topic: registryItem.topic,
          paperTag: registryItem.paperTag,
          desc: registryItem.desc,
          iconKey: registryItem.iconKey
        };
        badgeText = 'Resume Practical';
      }
    }

    // 3. Fallback for new students or clean state: Guided Volumetric Analysis
    if (!targetBench) {
      const defaultItem = BENCH_REGISTRY['acidBase'];
      targetBench = {
        id: 'guidedAcidBase',
        url: defaultItem.guidedUrl,
        title: defaultItem.guidedTitle,
        topic: defaultItem.topic,
        paperTag: defaultItem.paperTag,
        desc: defaultItem.desc,
        iconKey: defaultItem.iconKey
      };
      badgeText = 'Recommended Next Lab';
      statusText = 'Start Here';
      progressPct = 0;
    } else {
      // Calculate bench mastery from sessions
      if (sessionList.length > 0) {
        const matchingSessions = sessionList.filter(s => {
          const sText = JSON.stringify(s).toLowerCase();
          return sText.includes((targetBench.id || '').toLowerCase()) || sText.includes((targetBench.topic || '').toLowerCase().slice(0, 5));
        });
        if (matchingSessions.length > 0) {
          const correct = matchingSessions.filter(s => s.correct || (s.score_pct != null && s.score_pct >= 50)).length;
          progressPct = Math.round((correct / matchingSessions.length) * 100);
          statusText = progressPct >= 80 ? 'Mastered' : (progressPct >= 50 ? 'Improving' : 'Practicing');
        } else {
          progressPct = 35;
        }
      } else {
        progressPct = 25;
      }
    }

    // Update DOM
    const badgeTextEl = document.getElementById('resumeBadgeText');
    const paperTagEl = document.getElementById('resumePaperTag');
    const topicPillEl = document.getElementById('resumeTopicPill');
    const titleEl = document.getElementById('resumeTitle');
    const descEl = document.getElementById('resumeDesc');
    const statusHighlightEl = document.getElementById('resumeStatusHighlight');
    const progressPctEl = document.getElementById('resumeProgressPct');
    const progressFillEl = document.getElementById('resumeProgressFill');
    const launchBtnEl = document.getElementById('resumeLaunchBtn');
    const launchBtnTextEl = document.getElementById('resumeLaunchBtnText');
    const iconBadgeEl = document.getElementById('resumeIconBadge');

    if (badgeTextEl) badgeTextEl.textContent = badgeText;
    if (paperTagEl && targetBench.paperTag) paperTagEl.textContent = targetBench.paperTag;
    if (topicPillEl && targetBench.topic) topicPillEl.textContent = targetBench.topic;
    if (titleEl && targetBench.title) titleEl.textContent = targetBench.title;
    if (descEl && targetBench.desc) descEl.textContent = targetBench.desc;
    if (statusHighlightEl) statusHighlightEl.textContent = statusText;
    if (progressPctEl) progressPctEl.textContent = progressPct + '%';
    if (progressFillEl) progressFillEl.style.width = progressPct + '%';
    if (launchBtnEl && targetBench.url) launchBtnEl.href = targetBench.url;
    if (launchBtnTextEl) {
      launchBtnTextEl.textContent = sessionList.length > 0 ? 'Resume Lab Session' : 'Start First Practical';
    }

    if (iconBadgeEl && targetBench.iconKey && window.VLKIcons && typeof window.VLKIcons.svg === 'function') {
      iconBadgeEl.innerHTML = window.VLKIcons.svg(targetBench.iconKey, { size: 28, strokeWidth: 1.75 });
    }
  }

  function initBenchCardClickTracker() {
    document.querySelectorAll('.practice-banner-card').forEach(card => {
      card.addEventListener('click', () => {
        try {
          const href = card.getAttribute('href');
          const titleEl = card.querySelector('.practice-text-title');
          const descEl = card.querySelector('.practice-text-desc');
          const type = card.getAttribute('data-type') || 'acidBase';
          const regItem = BENCH_REGISTRY[type] || {};

          const benchData = {
            id: type,
            url: href,
            title: titleEl ? titleEl.textContent.trim() : regItem.title || 'Practical Lab',
            desc: descEl ? descEl.textContent.trim() : regItem.desc || '',
            topic: regItem.topic || 'Chemistry Practical',
            paperTag: regItem.paperTag || 'Paper 3 (KCSE)',
            iconKey: regItem.iconKey || 'flask',
            timestamp: Date.now()
          };
          localStorage.setItem('vlk_last_active_bench', JSON.stringify(benchData));
        } catch (e) {}
      });
    });
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
      initResumeExperimentHero(sessions);
      try {
        renderStudentCharts(sessions, analytics);
      } catch (chartErr) {
        console.warn('Non-fatal chart rendering error:', chartErr);
      }
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
      updateMwalimuAdvice(fallbackSessions);
      initResumeExperimentHero(fallbackSessions);
      try {
        renderStudentCharts(fallbackSessions, null);
      } catch (chartErr) {
        console.warn('Non-fatal fallback chart rendering error:', chartErr);
      }
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
      { id: 'b_burette', name: 'Burette Accuracy Master', iconName: 'burette', desc: 'Titre concordancy within ±0.10 cm³', progress: 'In Progress', progress_pct: 65, colorClass: 'teal' },
      { id: 'b_flame', name: 'Flame Emission Specialist', iconName: 'flame', desc: 'Identify 5 metal cations by flame color', progress: 'In Progress', progress_pct: 40, colorClass: 'fire' },
      { id: 'b_cation', name: 'Cation Qualitative Sleuth', iconName: 'microscope', desc: 'Systematic NaOH & NH₃ precipitation', progress: 'In Progress', progress_pct: 50, colorClass: 'blue' },
      { id: 'b_kinetics', name: 'Reaction Rates & Kinetics Ace', iconName: 'timer', desc: 'Disappearing cross & rate tangents', progress: 'In Progress', progress_pct: 35, colorClass: 'orange' },
      { id: 'b_organic', name: 'Organic Functional Group Pro', iconName: 'flask', desc: 'Bromine water & alkanol oxidation', progress: 'In Progress', progress_pct: 20, colorClass: 'purple' },
      { id: 'b_precision', name: 'Zero-Error KCSE Champion', iconName: 'target', desc: 'Score 100% on Paper 3 composite test', progress: 'Locked', progress_pct: 10, colorClass: 'silver' }
    ];

    const getBadgeIconHtml = (b) => {
      const map = {
        'b_burette': 'burette',
        'b_flame': 'flame',
        'b_cation': 'microscope',
        'b_kinetics': 'timer',
        'b_organic': 'flask',
        'b_precision': 'target'
      };
      const key = b.iconName || map[b.id] || 'award';
      if (window.VLKIcons && typeof window.VLKIcons.svg === 'function') {
        return window.VLKIcons.svg(key, { size: 18, strokeWidth: 1.75 });
      }
      return '';
    };

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
            <div class="badge-icon-box ${colorClass}">${getBadgeIconHtml(b)}</div>
            <div style="flex:1; min-width:0;">
              <div class="badge-title-text">${escapeHtml(b.name)}</div>
              <div class="badge-progress-text">${escapeHtml(b.unlocked ? 'Achieved' : (b.progress || b.desc || 'In Progress'))}</div>
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
          <div class="badge-icon-box ${b.colorClass}">${getBadgeIconHtml(b)}</div>
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

      const medals = ['1st', '2nd', '3rd'];
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
      if (typeof renderAdaptiveRecommendation === 'function') {
        renderAdaptiveRecommendation(allSessions);
      }

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
      let streakCount = 1;
      if (window.GamificationEngine && typeof window.GamificationEngine.getStreak === 'function') {
        const sData = window.GamificationEngine.getStreak();
        streakCount = (sData && sData.count) ? sData.count : 1;
      } else {
        const sEl = document.getElementById('streakCountMobile') || document.getElementById('streakCount');
        if (sEl) streakCount = parseInt(sEl.textContent, 10) || 1;
      }
      const formattedStreak = `${streakCount} Day${streakCount === 1 ? '' : 's'}`;

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
    if (roleEl) roleEl.textContent = user.role === 'teacher' ? 'Teacher Instructor' : 'KCSE Candidate Student';

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

  window.saveProfileDetails = async function() {
    const newName = (document.getElementById('profInputName')?.value || '').trim();
    const newForm = document.getElementById('profInputForm')?.value || 'Form 4';
    const newSchool = (document.getElementById('profInputSchool')?.value || '').trim();
    const msg = document.getElementById('profDetailsMsg');

    if (!newName) {
      if (msg) msg.innerHTML = '<div class="msg msg-err" style="color:var(--red-accent);">Full Name cannot be empty.</div>';
      return;
    }

    if (msg) msg.innerHTML = '<div class="msg" style="color:var(--cyan-accent);">Saving changes…</div>';

    // 1. Optimistic local update
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

    // 2. Persist to server
    try {
      if (typeof Students !== 'undefined' && typeof Students.updateProfile === 'function') {
        const res = await Students.updateProfile({ name: newName, form: newForm });
        if (res && res.student) {
          const fresh = { ...user, ...res.student };
          setUser(fresh);
        }
      }
      if (msg) msg.innerHTML = '<div class="msg msg-ok" style="color:var(--green-accent);">✓ Profile details updated and saved successfully!</div>';
    } catch (err) {
      console.warn('Could not sync profile update to server:', err);
      if (msg) msg.innerHTML = '<div class="msg msg-ok" style="color:var(--green-accent);">✓ Saved locally (will sync to cloud when connected).</div>';
    }
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
      if (msg) msg.innerHTML = '<div class="msg msg-ok">Security password updated successfully!</div>';
      if (document.getElementById('pwCurrent')) document.getElementById('pwCurrent').value = '';
      if (document.getElementById('pwNew')) document.getElementById('pwNew').value = '';
      if (document.getElementById('pwConfirm')) document.getElementById('pwConfirm').value = '';
    } catch (err) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">' + escapeHtml(err.message) + '</div>';
    }
  }

  async function loadSystemAnnouncements() {
    try {
      const res = await Announcements.getActive('students');
      if (res && res.success && Array.isArray(res.announcements)) {
        cachedActiveAnnouncements = res.announcements;
        renderSystemBroadcastBanner();
        updateNotificationsUI(window._vlk_student_assignments || []);
      }
    } catch (e) {
      console.warn('[Broadcasts] Could not load system announcements:', e);
    }
  }

  function renderSystemBroadcastBanner() {
    const banner = document.getElementById('systemBroadcastBanner');
    if (!banner) return;

    const activeAlerts = (cachedActiveAnnouncements || []).filter(a => {
      const isDismissed = localStorage.getItem('vlk_dismiss_ann_' + a.id) || sessionStorage.getItem('vlk_dismiss_ann_' + a.id);
      const isRead = window.VLKNotifs && window.VLKNotifs.isRead('ann_' + a.id);
      return !isDismissed && !isRead;
    });

    if (activeAlerts.length === 0) {
      banner.style.display = 'none';
      banner.innerHTML = '';
      return;
    }

    banner.style.display = 'flex';
    banner.innerHTML = activeAlerts.map(a => {
      const cat = a.type || 'info';
      const catLabel = cat === 'exam' ? 'Practical Mock Notice' : (cat === 'warning' ? 'Urgent Alert' : 'National Notice');
      const timeStr = a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today';

      return `
        <div id="ann-card-${a.id}" class="system-announcement-card type-${cat}">
          <div class="ann-icon-box" aria-hidden="true">
            <svg class="vlk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
          </div>
          <div class="ann-content-wrap">
            <div class="ann-tag-row">
              <span class="ann-pill">${catLabel}</span>
              <span style="font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:var(--text-muted);">${timeStr}</span>
            </div>
            <div class="ann-title">${escapeHtml(a.title)}</div>
            <div class="ann-message">${escapeHtml(a.message)}</div>
          </div>
          <button type="button" class="ann-dismiss-btn" onclick="dismissAnnouncement(${a.id})" title="Dismiss notice" aria-label="Dismiss notice">&times;</button>
        </div>
      `;
    }).join('');
  }

  function dismissAnnouncement(id) {
    try {
      localStorage.setItem('vlk_dismiss_ann_' + id, 'true');
      sessionStorage.setItem('vlk_dismiss_ann_' + id, 'true');
    } catch(e) {}
    if (window.VLKNotifs && typeof window.VLKNotifs.markAsRead === 'function') {
      window.VLKNotifs.markAsRead('ann_' + id);
    }
    const el = document.getElementById('ann-card-' + id);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-6px)';
      setTimeout(() => {
        el.remove();
        const banner = document.getElementById('systemBroadcastBanner');
        if (banner && banner.querySelectorAll('.system-announcement-card').length === 0) {
          banner.style.display = 'none';
        }
      }, 250);
    }
    updateNotificationsUI(window._vlk_student_assignments || []);
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
    window.initResumeExperimentHero = initResumeExperimentHero;
    window.openXPPerksModal = openXPPerksModal;
    window.closeXPPerksModal = closeXPPerksModal;
    window.openMasteryChartsModal = openMasteryChartsModal;
    window.closeMasteryChartsModal = closeMasteryChartsModal;
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
    const shortLevelEl = document.getElementById('heroLevelTitleShort');
    if (shortLevelEl) shortLevelEl.textContent = `Level ${xp.level}`;
    if (xpTextEl) xpTextEl.textContent = `${xp.totalXP} / ${xp.nextLevelXP} XP`;
    if (xpBarEl) xpBarEl.style.width = `${xp.progressPercent}%`;
    if (tierNameEl) tierNameEl.textContent = xp.title.replace('Form ', 'F').replace('KCSE ', '');
    if (levelIconEl) {
      const tierIconMap = { 1: 'flask', 2: 'microscope', 3: 'burette', 4: 'zap', 5: 'award' };
      const iconKey = tierIconMap[xp.level] || 'flask';
      if (window.VLKIcons && typeof window.VLKIcons.svg === 'function') {
        levelIconEl.innerHTML = window.VLKIcons.svg(iconKey, { size: 18, strokeWidth: 1.75 });
      } else {
        levelIconEl.textContent = '';
      }
    }

    // Update Pulse Strip: Streak
    const pulseStreakVal = document.getElementById('pulseStreakVal');
    if (pulseStreakVal) pulseStreakVal.textContent = streak.count;

    // Update Pulse Strip: Rank & XP
    const pulseRankTitle = document.getElementById('pulseRankTitle');
    const pulseXPBarFill = document.getElementById('pulseXPBarFill');
    const pulseXPVal = document.getElementById('pulseXPVal');
    const pulseNextXPVal = document.getElementById('pulseNextXPVal');
    const pulseXPSub = document.getElementById('pulseXPSub');

    if (pulseRankTitle) pulseRankTitle.textContent = `Level ${xp.level}: ${xp.title.replace('Form ', 'F').replace('KCSE ', '')}`;
    if (pulseXPBarFill) pulseXPBarFill.style.width = `${xp.progressPercent}%`;
    if (pulseXPVal) pulseXPVal.textContent = xp.totalXP.toLocaleString();
    if (pulseNextXPVal) pulseNextXPVal.textContent = xp.nextLevelXP.toLocaleString();
    if (pulseXPSub) {
      const remainingXP = Math.max(0, xp.nextLevelXP - xp.totalXP);
      pulseXPSub.innerHTML = `<span>${xp.totalXP.toLocaleString()} / ${xp.nextLevelXP.toLocaleString()} XP</span> <span style="opacity:0.75;">(${remainingXP} XP to Level ${xp.level + 1})</span>`;
    }

    const pulseRewardText = document.getElementById('pulseXPRewardText');
    if (pulseRewardText) {
      const nextTier = LEVEL_TIER_PERKS.find(t => t.level === xp.level + 1);
      if (nextTier) {
        pulseRewardText.innerHTML = `Next Unlock: <strong>${nextTier.unlocks}</strong> at Level ${nextTier.level}`;
      } else {
        pulseRewardText.innerHTML = '🏆 <strong>Top Rank:</strong> All Practical Benches & Examiner Rubrics Unlocked';
      }
    }

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
        const isSw = typeof window !== 'undefined' && typeof window.getLanguage === 'function' && window.getLanguage() === 'sw';
        launchBtn.innerHTML = isSw ? 'Umekamilisha Changamoto ya Leo!' : 'Daily Challenge Completed!';
        launchBtn.style.background = '#10B981';
        launchBtn.style.borderColor = '#10B981';
      }
    }
  }

  // ── 4. CANDIDATE LEVEL PERKS & XP BREAKDOWN MODAL ──────────
  const LEVEL_TIER_PERKS = [
    {
      level: 1,
      title: 'Form 1 Apprentice',
      iconName: 'flask',
      minXP: 0,
      maxXP: 250,
      rewardBadge: 'Safety First',
      unlocks: 'Acid-Base Standardisation & Burette Calibration',
      perks: 'Basic apparatus calibration, lab safety drills & volumetric pipetting.'
    },
    {
      level: 2,
      title: 'Form 2 Experimenter',
      iconName: 'microscope',
      minXP: 250,
      maxXP: 700,
      rewardBadge: 'Meniscus Master',
      unlocks: 'Solubility Curves & Advanced Indicator Transitions',
      perks: 'Acid-base indicator transition endpoints, solubility curves & dissolution bench.'
    },
    {
      level: 3,
      title: 'Form 3 Analytical Chemist',
      iconName: 'burette',
      minXP: 700,
      maxXP: 1600,
      rewardBadge: 'Redox Specialist',
      unlocks: 'KMnO₄ Redox Titration & Thermochemistry Calorimetry Bench',
      perks: 'Precision volumetric burette concordancy (Table 1), redox titrations & enthalpy calorimetry.'
    },
    {
      level: 4,
      title: 'Form 4 Master Chemist',
      iconName: 'zap',
      minXP: 1600,
      maxXP: 3200,
      rewardBadge: 'Qualitative Sleuth',
      unlocks: 'Qualitative Salt Analysis Bench & Organic Reagents Kit',
      perks: 'Qualitative inorganic cation/anion precipitation benches, gas tests & organic functional deductions.'
    },
    {
      level: 5,
      title: 'KCSE Distinction Scholar',
      iconName: 'award',
      minXP: 3200,
      maxXP: 6000,
      rewardBadge: 'National Examiner Challenge',
      unlocks: '40-Mark Mock Practical Exam & Official KNEC Rubric Mode',
      perks: 'Full 40-mark national mock capstone, gold certificate eligibility & examiner marking rubric access.'
    }
  ];

  function openXPPerksModal() {
    if (!window.GamificationEngine) return;
    const xp = window.GamificationEngine.getXP();
    const modal = document.getElementById('xpPerksModal');
    if (!modal) return;

    // Audio chime if available
    if (window.GamificationEngine.audio && typeof window.GamificationEngine.audio.playStreakMultiplier === 'function') {
      window.GamificationEngine.audio.playStreakMultiplier(2);
    }

    // Populate HUD elements
    const iconEl = document.getElementById('xpModalIcon');
    const badgeEl = document.getElementById('xpHudLevelBadge');
    const titleEl = document.getElementById('xpHudLevelTitle');
    const currentXpEl = document.getElementById('xpHudCurrentXP');
    const targetXpEl = document.getElementById('xpHudTargetXP');
    const barFillEl = document.getElementById('xpHudBarFill');
    const remainingEl = document.getElementById('xpHudRemainingText');
    const percentEl = document.getElementById('xpHudPercentText');

    if (iconEl) {
      const currentTier = LEVEL_TIER_PERKS.find(t => t.level === xp.level) || LEVEL_TIER_PERKS[0];
      if (window.VLKIcons && typeof window.VLKIcons.svg === 'function') {
        iconEl.innerHTML = window.VLKIcons.svg(currentTier.iconName || 'flask', { size: 28, strokeWidth: 1.75 });
      } else {
        iconEl.textContent = '';
      }
    }
    if (badgeEl) badgeEl.textContent = `Level ${xp.level}`;
    if (titleEl) titleEl.textContent = xp.title;
    if (currentXpEl) currentXpEl.textContent = (xp.totalXP || 0).toLocaleString();
    if (targetXpEl) targetXpEl.textContent = `/ ${(xp.nextLevelXP || 0).toLocaleString()} XP`;
    if (barFillEl) barFillEl.style.width = `${xp.progressPercent}%`;
    if (percentEl) percentEl.textContent = `${xp.progressPercent}% to Rank`;

    const remainingXP = Math.max(0, (xp.nextLevelXP || 0) - (xp.totalXP || 0));
    const nextTier = LEVEL_TIER_PERKS.find(t => t.level === xp.level + 1);

    if (remainingEl) {
      if (nextTier) {
        remainingEl.innerHTML = `<strong>${remainingXP.toLocaleString()} XP</strong> needed to reach Level ${nextTier.level}: ${nextTier.title}`;
      } else {
        remainingEl.innerHTML = `<strong>Top Academic Rank Achieved!</strong> You have reached distinction level.`;
      }
    }

    // Populate 5-tier roadmap
    const tiersListEl = document.getElementById('xpTiersList');
    if (tiersListEl) {
      tiersListEl.innerHTML = LEVEL_TIER_PERKS.map(tier => {
        let statusCls = 'tier-locked';
        let statusBadge = '<span class="xp-status-chip is-locked">Locked</span>';

        if (xp.level > tier.level) {
          statusCls = 'tier-completed';
          statusBadge = '<span class="xp-status-chip is-unlocked">Unlocked</span>';
        } else if (xp.level === tier.level) {
          statusCls = 'tier-active';
          statusBadge = '<span class="xp-status-chip is-active">Current Rank</span>';
        }

        const tierIconSvg = (window.VLKIcons && typeof window.VLKIcons.svg === 'function')
          ? window.VLKIcons.svg(tier.iconName || 'flask', { size: 18, strokeWidth: 1.75 })
          : '';

        return `
          <div class="xp-tier-card ${statusCls}">
            <div class="xp-tier-top">
              <div class="xp-tier-name-row">
                <span class="xp-tier-icon">${tierIconSvg}</span>
                <span class="xp-tier-title">Level ${tier.level}: ${tier.title}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-family:'JetBrains Mono',monospace; font-size:0.7rem; font-weight:700; color:var(--text-muted);">${tier.minXP.toLocaleString()} – ${tier.maxXP.toLocaleString()} XP</span>
                <span class="xp-tier-status-chip">${statusBadge}</span>
              </div>
            </div>
            <div class="xp-tier-perks">
              <strong>Syllabus Scope:</strong> ${tier.perks}
            </div>
            <div class="xp-tier-reward-highlight">
              <span>🎁 <strong>Unlocked Feature:</strong> ${tier.unlocks}</span>
              <span style="margin-left:auto; font-family:'JetBrains Mono',monospace; font-size:0.7rem;">🏅 ${tier.rewardBadge}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Show modal & disable background scroll
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Trap Escape key
    if (!window.__xpModalEscHandler) {
      window.__xpModalEscHandler = function(e) {
        if (e.key === 'Escape') closeXPPerksModal();
      };
      window.addEventListener('keydown', window.__xpModalEscHandler);
    }
  }

  function openMasteryChartsModal() {
    const modal = document.getElementById('masteryChartsModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Play subtle chime
    if (window.BrilliantUI && window.BrilliantUI.audio) {
      window.BrilliantUI.audio.playClick();
    }

    if (!window.__masteryModalEscHandler) {
      window.__masteryModalEscHandler = function(e) {
        if (e.key === 'Escape') closeMasteryChartsModal();
      };
      window.addEventListener('keydown', window.__masteryModalEscHandler);
    }
  }

  function closeMasteryChartsModal() {
    const modal = document.getElementById('masteryChartsModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    if (window.__masteryModalEscHandler) {
      window.removeEventListener('keydown', window.__masteryModalEscHandler);
      window.__masteryModalEscHandler = null;
    }
  }

  function closeXPPerksModal() {
    const modal = document.getElementById('xpPerksModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    if (window.__xpModalEscHandler) {
      window.removeEventListener('keydown', window.__xpModalEscHandler);
      window.__xpModalEscHandler = null;
    }
  }

  renderStudyTipByIndex(0);
  renderSavedTipsPocket();
  renderAdaptiveRecommendation([]);
  initResumeExperimentHero([]);
  initBenchCardClickTracker();
  loadBadges();
  loadLeaderboard();
  loadAssignments();
  loadSessions();
  loadSystemAnnouncements();
  updateGamificationDashboardUI();
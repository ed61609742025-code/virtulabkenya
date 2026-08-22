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
  }
  
  // Set current formatted date
  const today = new Date();
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = 'Today: ' + today.toLocaleDateString('en-US', options);
  ['todayDate', 'todayDateMobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = dateStr;
  });

  const user = getUser();
  if (user) {
    ['studentName', 'studentNameMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = user.name;
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

  function updateNotificationsUI(assignments) {
    let rawList = (assignments || []).filter(a => a.submitted && a.submission_status === 'marked').map(a => ({
      id: 'asgn_' + a.id,
      assignmentId: a.id,
      title: a.title || 'Practical Assignment Marked',
      message: a.score != null ? `Grade: ${a.score}/15. Click to view teacher comments.` : 'Assignment evaluated by teacher.',
      timestamp: a.marked_at || Date.now(),
      type: 'assignment',
      rawAssignment: a
    }));

    // Add milestone notification if streak >= 1
    const streakEl = document.getElementById('streakCountMobile') || document.getElementById('streakCount');
    const streakVal = streakEl ? parseInt(streakEl.textContent, 10) : 1;
    if (streakVal > 0) {
      rawList.push({
        id: 'notif_streak_active',
        assignmentId: null,
        title: '🔥 Active Practice Streak',
        message: `${streakVal}-Day Lab Practice Streak active! Keep up the momentum for KCSE Paper 3.`,
        timestamp: Date.now() - 3600000,
        type: 'streak'
      });
    }

    studentNotificationsList = rawList;

    // Filter out notifications read > 24 hours ago
    const activeNotifs = window.VLKNotifs ? window.VLKNotifs.filterActiveNotifications(rawList) : rawList;
    const unreadNotifs = activeNotifs.filter(n => !window.VLKNotifs || !window.VLKNotifs.isRead(n.id));

    const badge = document.getElementById('notifBadge');
    const bellBtn = document.getElementById('notifBellBtn');
    const list = document.getElementById('notifList');

    if (badge) {
      if (unreadNotifs.length > 0) {
        badge.textContent = unreadNotifs.length;
        badge.style.display = 'inline-block';
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
              <span>${isRead ? '📜' : '🟢'} ${escapeHtml(n.title)}</span>
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">${timeAgo}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
              ${escapeHtml(n.message)}
            </div>
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
      const match = studentNotificationsList.find(item => item.assignmentId === assignmentId);
      if (match && match.rawAssignment) {
        openAssignmentFeedbackModal(match.rawAssignment);
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
      const assignments = data.assignments || [];

      updateNotificationsUI(assignments);

      if (assignments.length === 0) {
        box.innerHTML = `
          <div class="empty-box" style="width: 100%; flex: 1 1 100%; padding: 24px 16px; text-align: center; border-radius: 8px; border: 1.5px dashed var(--card-border); color: var(--text-muted);">
            <div style="font-size: 1.4rem; margin-bottom: 6px;">📝</div>
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--heading-color); margin-bottom: 4px;">No Pending Assignments</div>
            <div style="font-size: 0.76rem;">You're all caught up! Prescribed lab assignments from your teacher will appear here.</div>
          </div>
        `;
        return;
      }

      const displayAssignments = assignments.slice(0, 2);
      box.innerHTML = displayAssignments.map(a => {
        const isSubmitted = !!a.submitted;
        const score = a.score || (a.evaluation && a.evaluation.score);
        const isGraded = typeof score === 'number';

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
        } else if (a.titration_type === 'kcseComposite') {
          targetUrl = `composite_exam.html?assignment=${a.id}`;
          battleMode = 'blitz';
        }

        const warmupUrl = a.titration_type === 'kcseComposite' ? targetUrl : `speed_battle.html?mode=${battleMode}&target=${encodeURIComponent(targetUrl)}`;

        let statusHtml = '';
        if (isSubmitted) {
          if (isGraded) {
            statusHtml = `<span class="submitted-pill" style="cursor:pointer; background:var(--green-bg); color:var(--green-accent); border:1px solid var(--green-accent); justify-content:center; width:100%;" onclick='openAssignmentFeedbackModal(${JSON.stringify(a).replace(/'/g, "&apos;")})'>🟢 Marked (View Grade)</span>`;
          } else {
            statusHtml = `<span class="submitted-pill" style="cursor:pointer; background:rgba(245, 158, 11, 0.15); color:#F59E0B; border:1px solid #F59E0B; justify-content:center; width:100%;" onclick='openAssignmentFeedbackModal(${JSON.stringify(a).replace(/'/g, "&apos;")})'>🟡 Under Review</span>`;
          }
        } else {
          statusHtml = `<a href="${warmupUrl}" class="pending-pill-btn" style="text-align:center; width:100%;">Start Practical →</a>`;
        }

        const dueLabel = a.due_date ? `Due ${formatDate(a.due_date)}` : 'No set deadline';

        return `
          <div class="assignment-card-box" style="flex: 1 1 240px; display:flex; flex-direction:column; justify-content:space-between; min-height:165px;">
            <div>
              <div class="assign-card-title">${escapeHtml(a.title)}</div>
              <div class="assign-card-desc" style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px; line-height:1.3; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                ${escapeHtml(a.description || a.instructions || 'No instructions provided.')}
              </div>
              <div class="assign-card-due" style="font-size:0.75rem; color:var(--text-muted); margin-bottom:12px;">
                ${dueLabel}
              </div>
            </div>
            ${statusHtml}
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('Could not load assignments dynamically:', err);
      if (box) {
        box.innerHTML = `
          <div class="empty-box" style="grid-column: 1 / -1; padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
            Unable to load assignments right now.
          </div>
        `;
      }
    }
  }

  function openAssignmentFeedbackModal(a) {
    const modal = document.getElementById('assignmentFeedbackModal');
    if (!modal) return;

    document.getElementById('afTitle').textContent = a.title || 'Assignment Results';
    document.getElementById('afDate').textContent = a.marked_at ? new Date(a.marked_at).toLocaleDateString() : 'Recently';

    const isCorrect = !!a.correct;
    document.getElementById('afStatus').innerHTML = isCorrect
      ? '<span class="pill pill-ok" style="font-size:1.1rem;padding:6px 14px;">✓ Correct (Pass)</span>'
      : '<span class="pill pill-warn" style="font-size:1.1rem;padding:6px 14px;">✗ Incorrect (Review Needed)</span>';

    const sAns = a.student_answer != null ? Number(a.student_answer).toFixed(4) + ' mol/dm³' : '—';
    const tVal = a.true_value != null ? Number(a.true_value).toFixed(4) + ' mol/dm³' : '—';
    document.getElementById('afStudentAns').textContent = sAns;
    document.getElementById('afTrueVal').textContent = tVal;

    const details = [];
    if (a.q1_score != null || a.q2_score != null || a.q3_score != null || a.total_score != null) {
      details.push(`
        <div style="margin-bottom:10px;"><b>KCSE Composite Exam Breakdown</b></div>
        <div>Q1: <b>${a.q1_score != null ? Number(a.q1_score).toFixed(1) + ' / 15' : '—'}</b></div>
        <div>Q2: <b>${a.q2_score != null ? Number(a.q2_score).toFixed(1) + ' / 15' : '—'}</b></div>
        <div>Q3: <b>${a.q3_score != null ? Number(a.q3_score).toFixed(1) + ' / 10' : '—'}</b></div>
        <div>Total: <b>${a.total_score != null ? Number(a.total_score).toFixed(1) + ' / 40' : '—'}</b></div>
        <div>Grade: <b>${escapeHtml(a.grade || '—')}</b></div>
      `);
    }

    if (a.titration_type) {
      const trialReadings = a.trial_readings;
      const readingsArray = Array.isArray(trialReadings)
        ? trialReadings
        : (trialReadings && Array.isArray(trialReadings.readings) ? trialReadings.readings : []);
      const readings = readingsArray.map(r => Number(r).toFixed(2)).join(', ');
      const examMarks = trialReadings && trialReadings.examMarks ? trialReadings.examMarks : null;

      details.push(`
        <div style="margin-bottom:10px;"><b>Practical Session Details</b></div>
        <div>Practical type: <b>${escapeHtml(a.titration_type)}</b></div>
        <div>Title: <b>${escapeHtml(a.titration_title || '—')}</b></div>
        <div>Your answer: <b>${sAns}</b></div>
        <div>True value: <b>${tVal}</b></div>
        <div>Indicator used: <b>${escapeHtml(a.indicator_used || '—')}</b></div>
        <div>Trials count: <b>${a.trials_count ?? '—'}</b></div>
        <div>Trial readings: <b>${readings || '—'}</b></div>
        <div>Mode: <b>${escapeHtml(a.practical_mode || a.mode || '—')}</b></div>
      `);

      if (examMarks) {
        details.push(`
          <div style="margin-bottom:10px;"><b>Practical Question Marks</b></div>
          <div>1) Burette Accuracy & Meniscus: <b>${examMarks.accuracyMarks ?? '—'} / 5</b></div>
          <div>2) Concordance of Titres: <b>${examMarks.concordanceMarks ?? '—'} / 3</b></div>
          <div>3) Average Titre Accuracy: <b>${examMarks.averageMarks ?? '—'} / 2</b></div>
          <div>4) Concentration Calculation: <b>${examMarks.concMarks ?? '—'} / 5</b></div>
          <div>Total Practical Marks: <b>${examMarks.totalMarks ?? '—'} / 15</b></div>
          <div>Expected Average Titre: <b>${examMarks.expectedAvg != null ? Number(examMarks.expectedAvg).toFixed(2) + ' cm³' : '—'}</b></div>
          <div>Expected Concentration: <b>${examMarks.expectedConc != null ? Number(examMarks.expectedConc).toFixed(4) + ' mol/dm³' : '—'}</b></div>
        `);
      }
    }

    if (a.salt_key || a.cation_correct != null || a.anion_correct != null) {
      details.push(`
        <div style="margin-bottom:10px;"><b>Qualitative Analysis Details</b></div>
        <div>Salt key: <b>${escapeHtml(a.salt_key || '—')}</b></div>
        <div>Cation: <b>${escapeHtml(a.student_cation || '—')}</b> (${a.cation_correct ? 'Correct' : 'Incorrect'})</div>
        <div>Anion: <b>${escapeHtml(a.student_anion || '—')}</b> (${a.anion_correct ? 'Correct' : 'Incorrect'})</div>
        <div>Tests performed: <b>${a.q_tests_performed ?? '—'}</b></div>
        <div>Tests correct: <b>${a.q_tests_correct ?? '—'}</b></div>
      `);
    }

    if (a.compound_key || a.functional_group_correct != null) {
      details.push(`
        <div style="margin-bottom:10px;"><b>Organic Chemistry Details</b></div>
        <div>Organic sample: <b>${escapeHtml(a.compound_name || a.compound_key || '—')}</b></div>
        <div>True functional group: <b>${escapeHtml(a.true_functional_group || '—')}</b></div>
        <div>Your group: <b>${escapeHtml(a.student_functional_group || '—')}</b></div>
        <div>Correct: <b>${a.functional_group_correct ? 'Yes' : 'No'}</b></div>
        <div>Tests performed: <b>${a.o_tests_performed ?? '—'}</b></div>
        <div>Tests correct: <b>${a.o_tests_correct ?? '—'}</b></div>
      `);
    }

    document.getElementById('afDetails').innerHTML = details.length > 0
      ? details.join('')
      : '<i>No additional session details available.</i>';

    const comment = a.teacher_feedback
      ? `💬 <b>Teacher Comments:</b><br>"${escapeHtml(a.teacher_feedback)}"`
      : '<i>No written comments added by teacher.</i>';
    document.getElementById('afComments').innerHTML = comment;

    modal.style.display = 'flex';
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
      solubility: 0
    };

    let correctCount = 0;

    sessions.forEach(s => {
      const type = (s.titration_title || s.titration_type || s.titrationKey || s.salt_key || s.compound_name || s.solute_key || s.experiment_title || '').toLowerCase();
      if (type.includes('redox')) topicCounts.redox++;
      else if (type.includes('precipit')) topicCounts.precipitation++;
      else if (type.includes('complex')) topicCounts.complexometric++;
      else if (type.includes('qualitative') || s.salt_key) topicCounts.qualitative++;
      else if (type.includes('organic') || s.compound_name) topicCounts.organic++;
      else if (type.includes('solubility') || s.solute_key) topicCounts.solubility++;
      else topicCounts.acidBase++;

      if (s.correct || (s.total_score != null && s.total_score >= 3.0)) correctCount++;
    });

    const coveredTopics = Object.values(topicCounts).filter(cnt => cnt > 0).length;
    const topicScore = (coveredTopics / 7) * 50;
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

    let statusText = 'Novice';
    if (totalReadiness >= 80) statusText = 'KCSE Ready 🎯';
    else if (totalReadiness >= 50) statusText = 'Proficient 📈';
    else if (totalReadiness >= 20) statusText = 'Developing 🧪';
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

  function drawNativeLineChart(canvas, labels, accuracyData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : (canvas.clientWidth || 300);
    const height = 180;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = 20 + i * (height - 40) / 4;
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(width - 15, y);
      ctx.stroke();
      
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${100 - i * 25}%`, 30, y + 3);
    }

    const validIndices = accuracyData.map((v, i) => v !== null ? i : -1).filter(i => i !== -1);
    
    if (validIndices.length === 0) {
      // Empty state placeholder baseline
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(40, height / 2);
      ctx.lineTo(width - 20, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No session history yet — complete a practical to view trend', width / 2, height / 2 - 8);
      return;
    }

    const points = validIndices.map(idx => {
      const x = 40 + (idx / (labels.length - 1)) * (width - 60);
      const y = 20 + (1 - accuracyData[idx] / 100) * (height - 40);
      return { x, y, val: accuracyData[idx] };
    });

    if (points.length > 1) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length - 1].x, height - 20);
      ctx.lineTo(points[0].x, height - 20);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
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
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : (canvas.clientWidth || 300);
    const height = 180;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const colors = ['#059669', '#3B82F6', '#0284C7', '#7C3AED', '#06B6D4', '#8B5CF6'];
    const labels = Object.keys(typeCounts);
    const values = Object.values(typeCounts);
    const total = values.reduce((a, b) => a + b, 0);

    const centerX = width * 0.3;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX - 10, height / 2 - 15);
    const innerRadius = Math.max(10, outerRadius * 0.55);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('0 Sessions', centerX, centerY + 3);

      let legY = 20;
      labels.forEach((lbl, i) => {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(width * 0.55, legY, 8, 8);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${lbl} (0)`, width * 0.55 + 14, legY + 8);
        legY += 22;
      });
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

    let legY = 20;
    labels.forEach((lbl, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(width * 0.55, legY, 8, 8);
      ctx.fillStyle = '#F1F5F9';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${lbl} (${values[i]})`, width * 0.55 + 14, legY + 8);
      legY += 22;
    });
  }

  function renderStudentCharts(sessions) {
    const trendCanvas = document.getElementById('studentTrendChart');
    const typeCanvas = document.getElementById('studentTypeChart');
    if (!trendCanvas || !typeCanvas) return;

    // 1. Group 30-Day Trend
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
        if (s.correct) daysMap[key].correct++;
      }
    });

    const labels = Object.keys(daysMap);
    const accuracyData = labels.map(lbl => {
      const d = daysMap[lbl];
      return d.total > 0 ? Math.round((d.correct / d.total) * 100) : null;
    });

    // 2. Group by Practical Type
    const typeCounts = {
      'Acid-Base': 0,
      'Redox': 0,
      'Precipitation': 0,
      'Complexometric': 0,
      'Qualitative': 0,
      'Organic': 0,
      'Solubility': 0
    };

    (sessions || []).forEach(s => {
      const type = (s.titration_title || s.titration_type || s.titrationKey || s.salt_key || s.compound_name || s.solute_key || s.experiment_title || '').toLowerCase();
      if (type.includes('redox')) typeCounts['Redox']++;
      else if (type.includes('precipit')) typeCounts['Precipitation']++;
      else if (type.includes('complex')) typeCounts['Complexometric']++;
      else if (type.includes('qualitative') || s.salt_key) typeCounts['Qualitative']++;
      else if (type.includes('organic') || s.compound_name) typeCounts['Organic']++;
      else if (type.includes('solubility') || s.solute_key) typeCounts['Solubility']++;
      else typeCounts['Acid-Base']++;
    });

    // If Chart.js is present, use Chart.js, otherwise use fallback native 2D canvas engine
    if (typeof Chart !== 'undefined') {
      try {
        if (studentTrendChartInstance) studentTrendChartInstance.destroy();
        studentTrendChartInstance = new Chart(trendCanvas, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Accuracy (%)',
              data: accuracyData,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              fill: true,
              tension: 0.35,
              spanGaps: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { min: 0, max: 100, ticks: { callback: v => v + '%' } },
              x: { ticks: { maxTicksLimit: 7 } }
            }
          }
        });

        if (studentTypeChartInstance) studentTypeChartInstance.destroy();
        studentTypeChartInstance = new Chart(typeCanvas, {
          type: 'doughnut',
          data: {
            labels: Object.keys(typeCounts),
            datasets: [{
              data: Object.values(typeCounts),
              backgroundColor: ['#059669', '#3B82F6', '#0284C7', '#7C3AED', '#06B6D4', '#8B5CF6'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Chart.js render error, using native canvas fallback:', err);
      }
    }

    // Native HTML5 2D Canvas Fallback
    drawNativeLineChart(trendCanvas, labels, accuracyData);
    drawNativeDoughnutChart(typeCanvas, typeCounts);
  }

  async function loadSessions() {
    const box = document.getElementById('sessionsList');
    try {
      const data = await Sessions.getMine({ limit: 15 });
      const sessions = data.sessions || [];

      updateReadinessScore(sessions);
      updateMwalimuAdvice(sessions);
      renderAdaptiveRecommendation(sessions);
      renderStudentCharts(sessions);
      if (typeof updateProfileStatsUI === 'function') updateProfileStatsUI();

      if (!box) return;

      if (sessions.length === 0) {
        box.innerHTML = '<div class="empty-box" style="grid-column:1/-1;">No sessions recorded yet</div>';
        return;
      }

      const displaySessions = sessions.slice(0, 2);
      box.innerHTML = displaySessions.map(s => `
        <div class="session-card-item">
          <div style="min-width:0;">
            <div class="session-info-title">${escapeHtml(s.titration_title || s.titration_type || 'Lab Session')}</div>
            <div class="session-info-meta">${new Date(s.created_at).toLocaleDateString()} - ${s.trials_count ?? 0} trial(s)</div>
          </div>
          <span class="${s.correct ? 'pill-correct' : 'pill-incorrect'}">${s.correct ? 'Correct' : 'Incorrect'}</span>
        </div>
      `).join('');
    } catch (err) {
      if (box) {
        box.innerHTML = '<div class="empty-box" style="grid-column:1/-1;">Could not load sessions</div>';
      }
    }
  }

  async function loadBadges() {
    const grid = document.getElementById('badgeGrid');
    if (!grid) return;
    try {
      const data = await Badges.getMine();
      const badges = data.badges || [];

      if (badges.length === 0) return; // Keep fallback pre-rendered mockup badges if no backend data

      const neonClasses = ['teal', 'orange', 'blue', 'purple', 'fire', 'silver'];

      grid.innerHTML = badges.map((b, idx) => {
        const colorClass = neonClasses[idx % neonClasses.length];
        const isUnlocked = !!b.unlocked;
        const progressPct = isUnlocked ? 100 : (b.progress_pct || 50);

        return `
          <div class="badge-card">
            <div class="badge-icon-box ${colorClass}">${b.icon || '🎯'}</div>
            <div class="badge-title-text">${escapeHtml(b.name)}</div>
            <div class="badge-progress-text">${escapeHtml(b.unlocked ? 'Achieved' : (b.progress || 'In Progress'))}</div>
            <div class="badge-progress-bar-track">
              <div class="badge-progress-bar-fill ${colorClass}" style="width: ${progressPct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('Could not load badges dynamically:', err);
    }
  }

  async function loadLeaderboard() {
    const box = document.getElementById('leaderboardBox');
    if (!box) return;
    try {
      const data = await Leaderboard.getClass();

      if (data.message) {
        box.innerHTML = '<div class="empty-box">' + escapeHtml(data.message) + '</div>';
        return;
      }

      const list = data.top || data.ranked || [];

      if (!list || list.length === 0) {
        box.innerHTML = `<div class="empty-box">No rankings yet. (Minimum 3 completed practicals required to rank)</div>`;
        return;
      }

      const rows = list.map(r => {
        const isYou = data.you && r.studentId === data.you.studentId;
        return `
          <tr class="${isYou ? 'lb-row-you' : ''}">
            <td style="padding:8px 6px;">#${r.rank || 1}${isYou ? ' 🎯' : ''}</td>
            <td style="padding:8px 6px;font-weight:700;">${escapeHtml(r.name)}${isYou ? ' (you)' : ''}</td>
            <td style="padding:8px 6px;">${escapeHtml(r.form || 'Form 3')}</td>
            <td style="padding:8px 6px;color:var(--green-accent);font-weight:800;">${r.accuracyPct}%</td>
            <td style="padding:8px 6px;">${r.totalSessions}</td>
          </tr>
        `;
      }).join('');

      box.innerHTML = `
        <table class="lb-table-custom" style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead>
            <tr style="border-bottom:1px solid var(--card-border);text-align:left;color:var(--text-muted);">
              <th style="padding:6px;">Rank</th>
              <th style="padding:6px;">Student</th>
              <th style="padding:6px;">Form</th>
              <th style="padding:6px;">Accuracy</th>
              <th style="padding:6px;">Sessions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty-box">Could not load leaderboard</div>';
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
      const [titrationRes, qualRes, organicRes, solubilityRes, compositeRes, badgesRes] = await Promise.allSettled([
        typeof Sessions !== 'undefined' ? Sessions.getMine({ limit: 100 }) : Promise.resolve({ sessions: [] }),
        typeof Qualitative !== 'undefined' ? Qualitative.getMine({ limit: 100 }) : Promise.resolve({ sessions: [] }),
        typeof Organic !== 'undefined' ? Organic.getMine() : Promise.resolve({ sessions: [] }),
        typeof Solubility !== 'undefined' ? Solubility.getMine() : Promise.resolve({ sessions: [] }),
        typeof Composite !== 'undefined' ? Composite.getMine() : Promise.resolve({ sessions: [] }),
        typeof Badges !== 'undefined' ? Badges.getMine() : Promise.resolve({ badges: [] })
      ]);

      const titrationSessions = titrationRes.status === 'fulfilled' ? (titrationRes.value?.sessions || []) : [];
      const qualSessions = qualRes.status === 'fulfilled' ? (qualRes.value?.sessions || qualRes.value?.history || []) : [];
      const organicSessions = organicRes.status === 'fulfilled' ? (organicRes.value?.sessions || []) : [];
      const solubilitySessions = solubilityRes.status === 'fulfilled' ? (solubilityRes.value?.sessions || []) : [];
      const compositeSessions = compositeRes.status === 'fulfilled' ? (compositeRes.value?.sessions || []) : [];

      const allSessions = [...titrationSessions, ...qualSessions, ...organicSessions, ...solubilitySessions, ...compositeSessions];
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

    if (dailyTitle) dailyTitle.textContent = `${daily.icon} ${daily.title}`;
    if (dailyDesc) dailyDesc.textContent = `${daily.description} (${daily.topic})`;
    if (dailyXP) dailyXP.textContent = `+${daily.xpReward} Bonus XP`;

    if (daily.isCompleted) {
      if (dailyCard) dailyCard.classList.add('completed');
      if (launchBtn) {
        launchBtn.innerHTML = `<span>✅</span> Daily Challenge Completed!`;
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
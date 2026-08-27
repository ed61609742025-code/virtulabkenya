requireTeacherLogin();
updateThemeButtons();
let currentUser = getUser();

function updateTeacherCodeElements(code) {
  const p1 = document.getElementById('teacherCodePill');
  const p2 = document.getElementById('teacherCodeRosterPill');
  if (p1) p1.textContent = code || '—';
  if (p2) p2.textContent = code || '—';
}

function copyTeacherCode() {
  const code = (currentUser && currentUser.teacherCode) || (document.getElementById('teacherCodePill') && document.getElementById('teacherCodePill').textContent);
  if (!code || code === '—') return alert('No teacher code available yet.');
  navigator.clipboard.writeText(code).then(() => {
    alert('✓ Teacher Code "' + code + '" copied to clipboard! Share this code with your students so they can join your class.');
  }).catch(() => {
    prompt('Copy your Teacher Code:', code);
  });
}
window.copyTeacherCode = copyTeacherCode;

async function initTeacherProfile() {
  if (currentUser) {
    if (currentUser.role && currentUser.role !== 'teacher') {
      clearToken();
      window.location.href = `/teacher/login.html?mismatch=${encodeURIComponent(currentUser.role)}`;
      return;
    }
    if (currentUser.name) document.getElementById('teacherName').textContent = currentUser.name;
    if (currentUser.teacherCode) updateTeacherCodeElements(currentUser.teacherCode);
  }
  try {
    const res = (typeof Auth !== 'undefined' && typeof Auth.me === 'function')
      ? await Auth.me()
      : (typeof apiRequest === 'function' ? await apiRequest('GET', '/auth/me') : null);
    if (res && res.user) {
      if (res.user.role && res.user.role !== 'teacher') {
        clearToken();
        window.location.href = `/teacher/login.html?mismatch=${encodeURIComponent(res.user.role)}`;
        return;
      }
      currentUser = res.user;
      setUser(currentUser);
      if (currentUser.name) document.getElementById('teacherName').textContent = currentUser.name;
      if (currentUser.teacherCode) updateTeacherCodeElements(currentUser.teacherCode);
    }
  } catch (e) {
    console.warn('Could not refresh teacher profile:', e);
  }
}
initTeacherProfile();

let currentPage = 1;

  function applyFilters() {
    currentPage = 1;
    loadSessions();
  }

  function goToPage(page) {
    currentPage = page;
    loadSessions();
  }

  async function loadSessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty">Loading sessions…</div>';
    pagBox.innerHTML = '';
    try {
      const type = document.getElementById('filterType').value;
      const form = document.getElementById('filterClass').value.trim();

      const data = await Sessions.getClass({ type, class: form, page: currentPage, limit: 20 });
      const sessions = data.sessions || [];
      const pagination = data.pagination || { page: 1, totalPages: 1, totalCount: sessions.length };

      if (sessions.length === 0) {
        box.innerHTML = '<div class="empty">No titration sessions match yet. Once students complete practicals, they\'ll show up here.</div>';
        return;
      }

      let rows = sessions.map(s => {
        const trueVal = parseFloat(s.true_value);
        const studentVal = parseFloat(s.student_answer);
        const hasValues = !isNaN(trueVal) && !isNaN(studentVal);
        const delta = hasValues ? (studentVal - trueVal) : null;
        const deltaPct = hasValues && trueVal !== 0 ? (Math.abs(delta) / trueVal) * 100 : null;
        const readings = Array.isArray(s.trial_readings) ? s.trial_readings : null;

        const readingsHtml = readings && readings.length > 0
          ? `<div style="margin-top:8px;"><b style="font-size:0.78rem;">Trial readings (cm³):</b> ${readings.map(r => Number(r).toFixed(2)).join(', ')}</div>`
          : '';

        const detailHtml = `
          <tr id="detail-${s.id}" style="display:none;">
            <td colspan="8" style="background:var(--panel2);">
              <div style="padding:10px 6px;font-size:0.82rem;line-height:1.7;">
                <div><b>True concentration:</b> ${hasValues ? trueVal.toFixed(4) : '—'} mol/dm³ &nbsp;·&nbsp; <b>Student's answer:</b> ${hasValues ? studentVal.toFixed(4) : '—'} mol/dm³</div>
                ${hasValues ? `<div><b>Difference:</b> ${delta >= 0 ? '+' : ''}${delta.toFixed(4)} mol/dm³ (${deltaPct.toFixed(1)}% off)</div>` : ''}
                <div><b>Indicator used:</b> ${escapeHtml(s.indicator_used || '—')} &nbsp;·&nbsp; <b>Mode:</b> ${escapeHtml(s.mode || '—')}</div>
                ${readingsHtml}
              </div>
            </td>
          </tr>
        `;

        return `
          <tr>
            <td>${escapeHtml(s.student_name || '—')}</td>
            <td>${escapeHtml(s.student_form || '—')}</td>
            <td>${escapeHtml(s.titration_title || s.titration_type)}</td>
            <td>${s.trials_count ?? 0}</td>
            <td>${s.concordant_found ? '<span class="pill pill-ok">Yes</span>' : '<span class="pill pill-warn">No</span>'}</td>
            <td>${s.correct ? '<span class="pill pill-ok">Correct</span>' : '<span class="pill pill-warn">Incorrect</span>'}</td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td><button class="btn" onclick="toggleDetail(${s.id})" style="padding:4px 10px;font-size:0.76rem;">Details</button></td>
          </tr>
          ${detailHtml}
        `;
      }).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr><th>Student</th><th>Form</th><th>Practical</th><th>Trials</th><th>Concordant</th><th>Result</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;

      const p = pagination;
      const startItem = (p.page - 1) * p.limit + 1;
      const endItem = Math.min(p.page * p.limit, p.totalCount);
      pagBox.innerHTML = `
        <button class="btn" ${p.page <= 1 ? 'disabled' : ''} onclick="goToPage(${p.page - 1})">← Prev</button>
        <span style="font-size:0.82rem;color:var(--ink-soft);">
          Showing ${startItem}–${endItem} of ${p.totalCount} · page ${p.page} of ${p.totalPages}
        </span>
        <button class="btn" ${p.page >= p.totalPages ? 'disabled' : ''} onclick="goToPage(${p.page + 1})">Next →</button>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load sessions: ' + escapeHtml(err.message) + '</div>';
    }
  }

  // ── Qualitative Analysis Sessions ─────────────────────────────
  async function loadQualitativeSessions() {
    const box = document.getElementById('qualSessionsBox');
    box.innerHTML = '<div class="empty">Loading…</div>';
    try {
      const data = await Qualitative.getClass();
      const sessions = data.sessions || [];

      if (sessions.length === 0) {
        box.innerHTML = '<div class="empty">No qualitative sessions yet. Once students complete an unknown salt identification, they will appear here.</div>';
        return;
      }

      const rows = sessions.map(s => {
        const ionDetail = `
          <tr id="qdetail-${s.id}" style="display:none;">
            <td colspan="8" style="background:var(--card-bg-hover);">
              <div style="padding:12px 14px;font-size:0.84rem;line-height:1.8;">
                <div><b>Salt ID:</b> ${escapeHtml(s.salt_key)} &nbsp;·&nbsp; <b>Full name:</b> ${escapeHtml(s.salt_name || '—')}</div>
                <div><b>True ions:</b> Cation = ${escapeHtml(s.true_cation || '—')} &nbsp;·&nbsp; Anion = ${escapeHtml(s.true_anion || '—')}</div>
                <div><b>Student identified:</b> Cation = <span style="color:${s.cation_correct ? 'var(--green-accent)' : 'var(--red-accent)'}">${escapeHtml(s.student_cation || '—')}</span> &nbsp;·&nbsp; Anion = <span style="color:${s.anion_correct ? 'var(--green-accent)' : 'var(--red-accent)'}">${escapeHtml(s.student_anion || '—')}</span></div>
                <div><b>Tests performed:</b> ${s.tests_performed ?? 0} &nbsp;·&nbsp; <b>Tests correct:</b> ${s.tests_correct ?? 0}</div>
                <div><b>Mode:</b> ${escapeHtml(s.mode || '—')}</div>
              </div>
            </td>
          </tr>`;

        return `
          <tr>
            <td><b>${escapeHtml(s.student_name || '—')}</b></td>
            <td>${escapeHtml(s.student_form || '—')}</td>
            <td>${escapeHtml(s.salt_key || '—')}</td>
            <td>${s.cation_correct ? '<span class="pill pill-ok">✓</span>' : '<span class="pill pill-warn">✗</span>'}</td>
            <td>${s.anion_correct ? '<span class="pill pill-ok">✓</span>' : '<span class="pill pill-warn">✗</span>'}</td>
            <td>${s.correct ? '<span class="pill pill-ok">Correct</span>' : '<span class="pill pill-warn">Incorrect</span>'}</td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td><button class="btn" onclick="toggleQualDetail(${s.id})" style="padding:6px 12px;font-size:0.78rem;font-weight:700;">Details</button></td>
          </tr>
          ${ionDetail}
        `;
      }).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr><th>Student</th><th>Form</th><th>Salt</th><th>Cation ✓</th><th>Anion ✓</th><th>Overall</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load qualitative sessions: ' + escapeHtml(err.message) + '</div>';
    }
  }

  function toggleQualDetail(sessionId) {
    const row = document.getElementById('qdetail-' + sessionId);
    if (row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  }

  // ── Organic Chemistry Sessions ─────────────────────────────────
  let organicSessionsStore = [];

  async function loadOrganicSessions() {
    const box = document.getElementById('organicSessionsBox');
    box.innerHTML = '<div class="empty">Loading…</div>';
    try {
      const data = await Organic.getClass();
      organicSessionsStore = data.sessions || [];

      if (organicSessionsStore.length === 0) {
        box.innerHTML = '<div class="empty">No organic chemistry assignment submissions yet.</div>';
        return;
      }

      const rows = organicSessionsStore.map((s, idx) => {
        const obs = Array.isArray(s.observations) ? s.observations : [];
        const isMulti = s.compound_key === 'organic_assignment_set' || obs.length > 0;
        
        const scoreDisplay = s.score_pct != null
          ? `${s.questions_correct ?? s.tests_correct}/${s.questions_total ?? 4} (${s.score_pct}%)`
          : (s.correct ? '1/1 (100%)' : '0/1 (0%)');

        const isGood = (s.score_pct == null && s.correct) || (s.score_pct >= 75);
        const scoreBadge = `<span class="pill ${isGood ? 'pill-ok' : 'pill-warn'}">${scoreDisplay}</span>`;

        return `
          <tr>
            <td><b>${escapeHtml(s.student_name || '—')}</b></td>
            <td>${escapeHtml(s.student_form || 'Form 4')}</td>
            <td>${escapeHtml(s.compound_name || 'Organic Practical Assignment')}</td>
            <td>${scoreBadge}</td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-primary" style="padding:6px 14px;font-size:0.8rem;font-weight:700;" onclick="viewOrganicCard(${idx})">
                👁️ View Card
              </button>
            </td>
          </tr>
        `;
      }).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr><th>Student</th><th>Form</th><th>Assignment Set</th><th>Score</th><th>Submitted Date</th><th>Action</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load organic sessions: ' + escapeHtml(err.message) + '</div>';
    }
  }

  /* Helper functions for KNEC keyword grading */
  function cleanAndNormalize(text) {
    if (!text) return '';
    return text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
      .replace(/\s+/g," ")
      .trim();
  }

  function checkKeywords(studentText, expectedKeywords) {
    const cleaned = cleanAndNormalize(studentText);
    if (!cleaned) return false;
    return expectedKeywords.every(kw => cleaned.includes(kw));
  }

  function gradeSingleTest(testType, trueCompoundFg, obs, inf) {
    const isAlkene = trueCompoundFg === 'Alkene';
    const isAlcohol = trueCompoundFg === 'Primary Alcohol';
    const isAcid = trueCompoundFg === 'Carboxylic Acid';
    
    let isObsCorrect = false;
    let isInfCorrect = false;
    
    if (testType === 'solubility') {
      if (isAlcohol || isAcid) {
        isObsCorrect = checkKeywords(obs, ['miscible']) || checkKeywords(obs, ['one layer']) || checkKeywords(obs, ['single layer']) || (checkKeywords(obs, ['soluble']) && !checkKeywords(obs, ['insoluble']));
        isInfCorrect = checkKeywords(inf, ['polar']) || checkKeywords(inf, ['alcohol']) || checkKeywords(inf, ['carboxylic']) || checkKeywords(inf, ['alkanol']) || checkKeywords(inf, ['acid']);
      } else {
        isObsCorrect = checkKeywords(obs, ['immiscible']) || checkKeywords(obs, ['two layer']) || checkKeywords(obs, ['insoluble']) || checkKeywords(obs, ['floats']) || checkKeywords(obs, ['dont mix']) || checkKeywords(obs, ['do not mix']);
        isInfCorrect = checkKeywords(inf, ['nonpolar']) || checkKeywords(inf, ['hydrocarbon']) || checkKeywords(inf, ['alkene']) || checkKeywords(inf, ['alkane']);
      }
    }
    else if (testType === 'ignition') {
      if (isAlkene) {
        isObsCorrect = checkKeywords(obs, ['soot']) || checkKeywords(obs, ['smok']) || checkKeywords(obs, ['sooty']) || checkKeywords(obs, ['smoky']);
        isInfCorrect = checkKeywords(inf, ['unsat']) || checkKeywords(inf, ['cc']) || checkKeywords(inf, ['c=c']) || checkKeywords(inf, ['high']);
      } else {
        isObsCorrect = checkKeywords(obs, ['blue']) || checkKeywords(obs, ['clear']) || checkKeywords(obs, ['nonsoot']) || checkKeywords(obs, ['nonsmok']) || checkKeywords(obs, ['not soot']) || checkKeywords(obs, ['not smok']) || checkKeywords(obs, ['no soot']) || checkKeywords(obs, ['no smoke']);
        isInfCorrect = checkKeywords(inf, ['saturat']) || checkKeywords(inf, ['low']);
      }
    }
    else if (testType === 'bromine') {
      if (isAlkene) {
        isObsCorrect = checkKeywords(obs, ['colorless']) || checkKeywords(obs, ['colourless']) || checkKeywords(obs, ['decolor']) || checkKeywords(obs, ['decolour']);
        isInfCorrect = checkKeywords(inf, ['unsat']) || checkKeywords(inf, ['cc']) || checkKeywords(inf, ['c=c']);
      } else {
        isObsCorrect = checkKeywords(obs, ['remain']) || checkKeywords(obs, ['persist']) || checkKeywords(obs, ['no change']) || checkKeywords(obs, ['no decol']) || checkKeywords(obs, ['not decol']) || checkKeywords(obs, ['red']) || checkKeywords(obs, ['brown']);
        isInfCorrect = checkKeywords(inf, ['saturat']) || checkKeywords(inf, ['absent']) || checkKeywords(inf, ['no cc']) || checkKeywords(inf, ['no c=c']) || checkKeywords(inf, ['alkene absent']);
      }
    }
    else if (testType === 'dichromate') {
      if (isAlcohol) {
        isObsCorrect = checkKeywords(obs, ['green']) || checkKeywords(obs, ['emerald']);
        isInfCorrect = (checkKeywords(inf, ['alcohol']) || checkKeywords(inf, ['alkanol']) || checkKeywords(inf, ['roh'])) && !checkKeywords(inf, ['absent']);
      } else {
        isObsCorrect = checkKeywords(obs, ['orange']) || checkKeywords(obs, ['remain']) || checkKeywords(obs, ['persist']) || checkKeywords(obs, ['no change']) || checkKeywords(obs, ['no color']) || checkKeywords(obs, ['no colour']);
        isInfCorrect = checkKeywords(inf, ['absent']) || checkKeywords(inf, ['no alcohol']) || checkKeywords(inf, ['no alkanol']) || checkKeywords(inf, ['roh absent']);
      }
    }
    else if (testType === 'carbonate') {
      if (isAcid) {
        isObsCorrect = checkKeywords(obs, ['effervescence']) || checkKeywords(obs, ['bubble']) || checkKeywords(obs, ['fizz']) || checkKeywords(obs, ['gas']);
        isInfCorrect = checkKeywords(inf, ['carboxylic']) || checkKeywords(inf, ['rcooh']) || checkKeywords(inf, ['r-cooh']) || checkKeywords(inf, ['h+']) || checkKeywords(inf, ['h3o']) || checkKeywords(inf, ['acid present']);
      } else {
        isObsCorrect = checkKeywords(obs, ['no effervescence']) || checkKeywords(obs, ['no bubble']) || checkKeywords(obs, ['no gas']) || checkKeywords(obs, ['no change']) || checkKeywords(obs, ['remain']) || checkKeywords(obs, ['nothing']) || checkKeywords(obs, ['no reaction']);
        isInfCorrect = checkKeywords(inf, ['absent']) || checkKeywords(inf, ['no acid']) || checkKeywords(inf, ['not acidic']) || checkKeywords(inf, ['rcooh absent']) || checkKeywords(inf, ['r-cooh absent']) || checkKeywords(inf, ['neutral']);
      }
    }
    else if (testType === 'esterification') {
      if (isAlcohol) {
        isObsCorrect = (checkKeywords(obs, ['sweet']) || checkKeywords(obs, ['fruity']) || checkKeywords(obs, ['pleasant']) || checkKeywords(obs, ['aroma'])) && !checkKeywords(obs, ['no sweet']) && !checkKeywords(obs, ['no fruity']);
        isInfCorrect = (checkKeywords(inf, ['ester']) || checkKeywords(inf, ['alcohol']) || checkKeywords(inf, ['alkanol']) || checkKeywords(inf, ['roh'])) && !checkKeywords(inf, ['absent']);
      } else {
        isObsCorrect = checkKeywords(obs, ['pungent']) || checkKeywords(obs, ['remain']) || checkKeywords(obs, ['persist']) || checkKeywords(obs, ['no sweet']) || checkKeywords(obs, ['no fruity']) || checkKeywords(obs, ['ethanoic']);
        isInfCorrect = checkKeywords(inf, ['absent']) || checkKeywords(inf, ['no alcohol']) || checkKeywords(inf, ['no alkanol']) || checkKeywords(inf, ['roh absent']);
      }
    }
    else if (testType === 'litmus') {
      if (isAcid) {
        isObsCorrect = (checkKeywords(obs, ['blue']) && checkKeywords(obs, ['red'])) || checkKeywords(obs, ['ph 3']) || checkKeywords(obs, ['ph 1']) || checkKeywords(obs, ['ph 2']) || checkKeywords(obs, ['ph 4']) || checkKeywords(obs, ['ph 5']) || checkKeywords(obs, ['ph 6']);
        isInfCorrect = checkKeywords(inf, ['acid']) || checkKeywords(inf, ['h+']) || checkKeywords(inf, ['h3o']) || checkKeywords(inf, ['rcooh']) || checkKeywords(inf, ['r-cooh']);
      } else {
        isObsCorrect = checkKeywords(obs, ['remain']) || checkKeywords(obs, ['unchange']) || checkKeywords(obs, ['ph 7']) || (checkKeywords(obs, ['no change']) && checkKeywords(obs, ['litmus']));
        isInfCorrect = checkKeywords(inf, ['neutral']);
      }
    }
    
    return { obsCorrect: isObsCorrect, infCorrect: isInfCorrect };
  }

  function viewOrganicCard(index) {
    const s = organicSessionsStore[index];
    if (!s) return;

    let modal = document.getElementById('organicCardModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'organicCardModal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }

    const obsList = Array.isArray(s.observations) ? s.observations : [];
    let questionsHtml = '';
    let totalMarksEarned = 0;
    let totalPossibleMarks = 0;
    let correctQuestionsCount = 0;

    if (obsList.length > 0 && obsList[0].sampleLabel) {
      // KCSE Paper 3 Multi-Question Examination Format
      questionsHtml = obsList.map(q => {
        const tableSel = q.tableSelections || {};
        const expected = q.expectedData || {};
        const testKeys = [
          { key: 'solubility', label: '(a) Solubility Test', obsPts: 0.7, infPts: 0.7 },
          { key: 'ignition', label: '(b) Spatula Ignition', obsPts: 0.7, infPts: 0.7 },
          { key: 'bromine', label: '(c) Bromine Water Test', obsPts: 0.7, infPts: 0.7 },
          { key: 'dichromate', label: '(d) Acidified K₂Cr₂O₇', obsPts: 0.8, infPts: 0.8 },
          { key: 'carbonate', label: '(e) NaHCO₃ Carbonate Test', obsPts: 0.8, infPts: 0.8 },
          { key: 'esterification', label: '(f) Esterification Test', obsPts: 0.7, infPts: 0.7 },
          { key: 'litmus', label: '(g) Litmus & pH Test', obsPts: 0.7, infPts: 0.7 }
        ];

        let qTableMarks = 0;
        const testRows = testKeys.map(t => {
          const sObs = (tableSel[t.key] && tableSel[t.key].obs) || '—';
          const sInf = (tableSel[t.key] && tableSel[t.key].inf) || '—';
          const expObs = (expected[t.key] && expected[t.key].obs) || '';
          const expInf = (expected[t.key] && expected[t.key].inf) || '';

          const grading = gradeSingleTest(t.key, q.trueFg, sObs, sInf);
          const isObsOk = grading.obsCorrect;
          const isInfOk = grading.infCorrect;

          if (isObsOk) qTableMarks += t.obsPts;
          if (isInfOk) qTableMarks += t.infPts;

          return `
            <tr>
              <td><b>${t.label}</b></td>
              <td>
                <span style="color:${isObsOk ? 'var(--green-accent)' : 'var(--red-accent)'};font-weight:600;">
                  ${isObsOk ? '✓ ' : '✗ '}${escapeHtml(sObs)}
                </span>
                ${!isObsOk && expObs ? `<div style="font-size:0.73rem;color:var(--text-muted);margin-top:2px;">Expected: "${escapeHtml(expObs)}"</div>` : ''}
              </td>
              <td>
                <span style="color:${isInfOk ? 'var(--green-accent)' : 'var(--red-accent)'};font-weight:600;">
                  ${isInfOk ? '✓ ' : '✗ '}${escapeHtml(sInf)}
                </span>
                ${!isInfOk && expInf ? `<div style="font-size:0.73rem;color:var(--text-muted);margin-top:2px;">Expected: "${escapeHtml(expInf)}"</div>` : ''}
              </td>
            </tr>
          `;
        }).join('');

        const fgChoiceCorrect = (q.studentFg && q.trueFg && q.studentFg.toLowerCase() === q.trueFg.toLowerCase()) || q.isCorrect;
        const fgMarks = fgChoiceCorrect ? 4 : 0;
        const qTotalEarned = Math.min(12, Math.round((qTableMarks + fgMarks) * 10) / 10);
        
        totalMarksEarned += qTotalEarned;
        totalPossibleMarks += 12;
        if (qTotalEarned >= 8.5 || fgChoiceCorrect) correctQuestionsCount++;

        return `
          <div style="background:var(--card-bg-hover);border:1.5px solid ${qTotalEarned >= 8.5 ? 'var(--green-accent)' : 'var(--card-border)'};border-radius:14px;padding:20px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid var(--card-border);padding-bottom:10px;">
              <div style="font-size:1rem;font-weight:800;color:var(--heading-color);">
                📝 Question ${q.questionNum}: ${escapeHtml(q.sampleLabel)} — ${escapeHtml(q.compoundName)}
              </div>
              <span class="pill ${qTotalEarned >= 8.5 ? 'pill-ok' : 'pill-warn'}" style="font-size:0.88rem;font-weight:800;">
                Score: ${qTotalEarned} / 12 Marks
              </span>
            </div>

            <!-- KCSE Examination Table -->
            <div style="font-size:0.82rem;font-weight:700;color:var(--heading-color);margin-bottom:6px;">
              KCSE Paper 3 Table Breakdown (Observations & Inferences):
            </div>
            <div class="table-responsive">
              <table class="kcse-table" style="width:100%;font-size:0.84rem;margin-bottom:14px;">
                <thead>
                  <tr style="background:var(--card-bg);">
                    <th style="width:30%;">Test / Procedure</th>
                    <th style="width:35%;">Student Observation</th>
                    <th style="width:35%;">Student Inference / Deduction</th>
                  </tr>
                </thead>
                <tbody>${testRows}</tbody>
              </table>
            </div>

            <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px 16px;font-size:0.86rem;line-height:1.5;">
              <b>(f) Final Functional Group Identification:</b> True FG = <b style="color:var(--green-accent);">${escapeHtml(q.trueFg)}</b> &nbsp;·&nbsp; 
              Student Choice = <b style="color:${fgChoiceCorrect ? 'var(--green-accent)' : 'var(--red-accent)'};">${escapeHtml(q.studentFg || 'None Selected')}</b> 
              (${fgChoiceCorrect ? '✓ Correct [+4 Marks]' : '✗ Incorrect [0 Marks]'})
            </div>
          </div>
        `;
      }).join('');
    } else {
      // Single question format fallback
      questionsHtml = `
        <div style="background:var(--card-bg-hover);border:1px solid var(--card-border);border-radius:12px;padding:18px;">
          <div style="font-size:0.95rem;font-weight:800;color:var(--heading-color);margin-bottom:8px;">
            Sample: ${escapeHtml(s.compound_name || s.compound_key)}
          </div>
          <div style="font-size:0.85rem;margin-bottom:10px;">
            True FG: <b>${escapeHtml(s.true_functional_group || '—')}</b> &nbsp;·&nbsp;
            Student Choice: <b>${escapeHtml(s.student_functional_group || '—')}</b>
          </div>
        </div>
      `;
      totalMarksEarned = s.correct ? 12 : 4;
      totalPossibleMarks = 12;
      correctQuestionsCount = s.correct ? 1 : 0;
    }

    const calculatedScorePct = totalPossibleMarks > 0 ? Math.round((totalMarksEarned / totalPossibleMarks) * 100) : (s.score_pct ?? (s.correct ? 100 : 0));
    const finalQuestionsCorrect = obsList.length > 0 ? correctQuestionsCount : (s.questions_correct ?? (s.correct ? 1 : 0));
    const finalQuestionsTotal = obsList.length > 0 ? obsList.length : (s.questions_total ?? 4);

    modal.innerHTML = `
      <div class="modal-card" style="max-width:900px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--card-border);padding-bottom:14px;margin-bottom:20px;">
          <div>
            <h2 style="font-size:1.25rem;margin:0 0 4px 0;color:var(--heading-color);font-family:var(--font-heading);font-weight:800;">🧫 Submitted Organic Chemistry Assignment Booklet</h2>
            <div style="font-size:0.84rem;color:var(--text-muted);">
              Student: <b>${escapeHtml(s.student_name || 'Student')}</b> (${escapeHtml(s.student_form || 'Form 4')}) &nbsp;·&nbsp; Submitted: ${new Date(s.created_at).toLocaleString()}
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn" onclick="window.print()" style="padding:8px 16px;font-weight:700;background:var(--card-bg-hover);border:1px solid var(--card-border);color:var(--text-main);">🖨️ Print Booklet</button>
            <button class="btn" onclick="document.getElementById('organicCardModal').style.display='none'" style="padding:8px 16px;font-weight:700;">✕ Close</button>
          </div>
        </div>

        <div style="background:linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(56,189,248,0.12) 100%);border:1.5px solid var(--green-accent);border-radius:14px;padding:18px 22px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <div>
            <div style="font-size:0.82rem;color:var(--text-muted);text-transform:uppercase;font-weight:800;letter-spacing:0.04em;">Overall KCSE Practical Performance</div>
            <div style="font-size:1.4rem;font-weight:800;color:var(--green-accent);margin-top:4px;font-family:var(--font-heading);">
              ${totalMarksEarned.toFixed(1)} / ${totalPossibleMarks || 48} Marks (${calculatedScorePct}%) &nbsp;·&nbsp; <span style="font-size:1.05rem;color:var(--heading-color);">${finalQuestionsCorrect} / ${finalQuestionsTotal} Questions Passed</span>
            </div>
          </div>
          <span class="pill ${calculatedScorePct >= 75 ? 'pill-ok' : 'pill-warn'}" style="font-size:0.92rem;padding:8px 18px;font-weight:800;">
            ${calculatedScorePct >= 75 ? '🌟 High Distinction' : (calculatedScorePct >= 50 ? '✅ Credit Pass' : '⚠️ Revision Required')}
          </span>
        </div>

        <h3 style="font-size:1rem;font-weight:800;color:var(--heading-color);margin-bottom:16px;font-family:var(--font-heading);">Detailed KCSE Question & Practical Table Breakdown:</h3>
        ${questionsHtml}
      </div>
    `;

    modal.style.display = 'flex';
  }

  // ── Solubility Curves & Crystallization Sessions ───────────────
  let solubilitySessionsStore = [];
  async function loadSolubilitySessions() {
    const box = document.getElementById('solubilitySessionsBox');
    if (!box) return;
    box.innerHTML = '<div class="empty">Loading solubility sessions…</div>';
    try {
      const data = await Solubility.getClass();
      solubilitySessionsStore = data.sessions || [];

      if (solubilitySessionsStore.length === 0) {
        box.innerHTML = '<div class="empty">No solubility sessions recorded yet.</div>';
        return;
      }

      const rows = solubilitySessionsStore.map((s, idx) => {
        const cTemp = s.crystallization_temp != null ? Number(s.crystallization_temp).toFixed(1) + ' °C' : '—';
        const tTemp = s.theoretical_temp != null ? Number(s.theoretical_temp).toFixed(1) + ' °C' : '—';
        const delta = s.temp_difference != null ? Number(s.temp_difference).toFixed(1) + ' °C' : '—';
        const score = s.total_score != null ? Number(s.total_score).toFixed(1) + ' / 5.0' : '—';
        const isGood = parseFloat(s.total_score || 0) >= 3.0;

        return `
          <tr>
            <td><b>${escapeHtml(s.student_name || '—')}</b></td>
            <td>${escapeHtml(s.student_form || 'Form 4')}</td>
            <td>${escapeHtml(s.solute_name || s.solute_key)}</td>
            <td>${cTemp} (Expected: ${tTemp})</td>
            <td><span style="color:${parseFloat(s.temp_difference || 99) <= 2.0 ? 'var(--green-accent)' : 'var(--amber-accent)'};font-weight:700;">${delta}</span></td>
            <td><span class="pill ${isGood ? 'pill-ok' : 'pill-warn'}">${score}</span></td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-primary" style="padding:6px 14px;font-size:0.8rem;font-weight:700;" onclick="viewSolubilityCard(${idx})">
                👁️ View Card
              </button>
            </td>
          </tr>
        `;
      }).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr><th>Student</th><th>Form</th><th>Target Solute</th><th>Cryst. Temp</th><th>Temp Delta</th><th>KNEC Score</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load solubility sessions: ' + escapeHtml(err.message) + '</div>';
    }
  }

  function viewSolubilityCard(idx) {
    const s = solubilitySessionsStore[idx];
    if (!s) return;

    let modal = document.getElementById('solubilityCardModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'solubilityCardModal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }

    let trials = s.trials_data;
    if (typeof trials === 'string') {
      try { trials = JSON.parse(trials); } catch (e) { trials = []; }
    }
    if (!Array.isArray(trials)) trials = [];

    const trialsHtml = trials.length > 0 ? `
      <div style="margin-top:14px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;">
        <div style="font-weight:800;font-size:0.88rem;color:var(--heading-color);margin-bottom:8px;">📊 Student Dilution & Crystallization Readings:</div>
        <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--card-bg-hover);color:var(--text-muted);text-align:center;">
              <th style="padding:6px;">Trial</th>
              <th style="padding:6px;">Solute Mass (g)</th>
              <th style="padding:6px;">Water Vol (cm³)</th>
              <th style="padding:6px;">Solubility (g/100g)</th>
              <th style="padding:6px;">Observed Temp (°C)</th>
            </tr>
          </thead>
          <tbody>
            ${trials.map((tr, i) => `
              <tr style="border-bottom:1px solid var(--card-border);text-align:center;">
                <td style="padding:6px;font-weight:700;">#${i + 1}</td>
                <td style="padding:6px;">${tr.mass || s.solute_mass || '—'}g</td>
                <td style="padding:6px;">${tr.volume || s.solvent_volume || '—'} cm³</td>
                <td style="padding:6px;color:var(--cyan-accent);font-weight:700;">${tr.candidateSolubility || ((tr.mass / tr.volume) * 100).toFixed(1)}</td>
                <td style="padding:6px;font-weight:800;">${tr.temp || tr.crystallization_temp || '—'} °C</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    modal.innerHTML = `
      <div class="modal-card" style="max-width:750px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--card-border);padding-bottom:12px;margin-bottom:16px;">
          <div>
            <h2 style="font-size:1.15rem;margin:0;color:var(--heading-color);font-family:var(--font-heading);font-weight:800;">🌡️ Solubility Practical Candidate Card</h2>
            <div style="font-size:0.82rem;color:var(--text-muted);">
              Student: <b>${escapeHtml(s.student_name || 'Student')}</b> (${escapeHtml(s.student_form || 'Form 4')}) &nbsp;·&nbsp; Date: ${new Date(s.created_at).toLocaleString()}
            </div>
          </div>
          <button class="btn" onclick="document.getElementById('solubilityCardModal').style.display='none'" style="padding:4px 12px;">✕ Close</button>
        </div>

        <div style="background:var(--card-bg-hover);border:1.5px solid var(--amber-accent);border-radius:12px;padding:16px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;font-weight:800;">Experiment Target</div>
            <div style="font-size:1.2rem;font-weight:900;color:var(--heading-color);margin-top:2px;">${escapeHtml(s.solute_name || s.solute_key)}</div>
          </div>
          <div>
            <span class="pill pill-ok" style="font-size:0.95rem;padding:6px 16px;font-weight:800;">
              Total Score: ${Number(s.total_score || 0).toFixed(1)} / 5.0 Marks
            </span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:16px;">
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Crystallization Temp</div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--cyan-accent);margin-top:4px;">${s.crystallization_temp || 0} °C</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">Expected: ${s.theoretical_temp || 0} °C</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Temperature Accuracy</div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--green-accent);margin-top:4px;">${s.accuracy_score || 0} / 2.0 Marks</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">Deviation: ±${s.temp_difference || 0} °C</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">KNEC Graph Plotting</div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--amber-accent);margin-top:4px;">${s.graph_score || 0} / 3.0 Marks</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">Curve & Extrapolation</div>
          </div>
        </div>

        ${trialsHtml}
      </div>
    `;

    modal.style.display = 'flex';
  }

  // ── Thermochemistry & Energy Changes Sessions ───────────────────
  let energySessionsStore = [];
  async function loadEnergySessions() {
    const box = document.getElementById('energySessionsBox');
    if (!box) return;
    box.innerHTML = '<div class="empty">Loading energy sessions…</div>';
    try {
      const data = await Energy.getClass();
      energySessionsStore = data.sessions || [];

      if (energySessionsStore.length === 0) {
        box.innerHTML = '<div class="empty">No thermochemistry practical sessions recorded yet.</div>';
        return;
      }

      const rows = energySessionsStore.map((s, idx) => {
        const dt = s.temp_change != null ? (s.temp_change >= 0 ? '+' : '') + Number(s.temp_change).toFixed(1) + ' °C' : '—';
        const qVal = s.heat_quantity != null ? Number(s.heat_quantity).toFixed(0) + ' J' : '—';
        const dH = s.molar_enthalpy != null ? Number(s.molar_enthalpy).toFixed(1) + ' kJ/mol' : '—';
        const score = s.total_score != null ? Number(s.total_score).toFixed(1) + ' / 15.0' : '—';
        const isGood = parseFloat(s.total_score || 0) >= 10.0;

        return `
          <tr>
            <td><b>${escapeHtml(s.student_name || '—')}</b></td>
            <td>${escapeHtml(s.student_form || 'Form 4')}</td>
            <td>${escapeHtml(s.system_name || s.system_id)}</td>
            <td><span style="font-weight:700;color:var(--cyan-accent);">${dt}</span></td>
            <td>${qVal}</td>
            <td><span style="font-weight:800;color:var(--heading-color);">${dH}</span></td>
            <td><span class="pill ${isGood ? 'pill-ok' : 'pill-warn'}">${score}</span></td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-primary" style="padding:6px 14px;font-size:0.8rem;font-weight:700;" onclick="viewEnergyCard(${idx})">
                👁️ View Card
              </button>
            </td>
          </tr>
        `;
      }).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr><th>Student</th><th>Form</th><th>Reaction System</th><th>Temp ΔT</th><th>Heat Q</th><th>Molar ΔH</th><th>Score</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load energy sessions: ' + escapeHtml(err.message) + '</div>';
    }
  }

  function viewEnergyCard(idx) {
    const s = energySessionsStore[idx];
    if (!s) return;

    let modal = document.getElementById('energyCardModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'energyCardModal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }

    let rubrics = s.rubric_breakdown;
    if (typeof rubrics === 'string') {
      try { rubrics = JSON.parse(rubrics); } catch (e) { rubrics = []; }
    }
    if (!Array.isArray(rubrics)) rubrics = [];

    const rubricsHtml = rubrics.length > 0 ? `
      <div style="margin-top:14px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:14px;">
        <div style="font-weight:800;font-size:0.88rem;color:var(--heading-color);margin-bottom:10px;">📋 KNEC Paper 3 15-Mark Evaluation Rubric Breakdown:</div>
        <div style="display:grid;grid-template-columns:1fr;gap:6px;">
          ${rubrics.map(r => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--card-bg-hover);border-radius:6px;font-size:0.82rem;">
              <span style="font-weight:600;color:${r.pass ? 'var(--text-main)' : 'var(--text-muted)'};">${escapeHtml(r.item)}</span>
              <span style="font-family:var(--font-mono);font-weight:800;color:${r.pass ? 'var(--green-accent)' : 'var(--red-accent)'};">${escapeHtml(r.mark)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    modal.innerHTML = `
      <div class="modal-card" style="max-width:800px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--card-border);padding-bottom:12px;margin-bottom:16px;">
          <div>
            <h2 style="font-size:1.15rem;margin:0;color:var(--heading-color);font-family:var(--font-heading);font-weight:800;">🔥 Thermochemistry Candidate Worksheet Card</h2>
            <div style="font-size:0.82rem;color:var(--text-muted);">
              Student: <b>${escapeHtml(s.student_name || 'Student')}</b> (${escapeHtml(s.student_form || 'Form 4')}) &nbsp;·&nbsp; Submitted: ${new Date(s.created_at).toLocaleString()}
            </div>
          </div>
          <button class="btn" onclick="document.getElementById('energyCardModal').style.display='none'" style="padding:4px 12px;">✕ Close</button>
        </div>

        <div style="background:var(--card-bg-hover);border:1.5px solid #EA580C;border-radius:12px;padding:16px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;font-weight:800;">Reaction System</div>
            <div style="font-size:1.2rem;font-weight:900;color:var(--heading-color);margin-top:2px;">${escapeHtml(s.system_name || s.system_id)}</div>
          </div>
          <div>
            <span class="pill pill-ok" style="font-size:0.95rem;padding:6px 16px;font-weight:800;">
              Total Score: ${Number(s.total_score || 0).toFixed(1)} / 15.0 Marks
            </span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:16px;">
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Initial Temp T₁</div>
            <div style="font-size:1.05rem;font-weight:800;color:var(--heading-color);margin-top:2px;">${s.initial_temp || 0} °C</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Max/Min Temp T₂</div>
            <div style="font-size:1.05rem;font-weight:800;color:var(--heading-color);margin-top:2px;">${s.final_temp || 0} °C</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Heat Energy Q</div>
            <div style="font-size:1.05rem;font-weight:800;color:var(--cyan-accent);margin-top:2px;">${s.heat_quantity || 0} J</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Molar Enthalpy ΔH</div>
            <div style="font-size:1.05rem;font-weight:800;color:#EA580C;margin-top:2px;">${s.molar_enthalpy || 0} kJ/mol</div>
          </div>
        </div>

        ${s.equation_text ? `
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px 14px;font-size:0.84rem;margin-bottom:12px;">
            <b>Thermochemical Equation:</b> <code style="font-weight:700;color:var(--green-accent);">${escapeHtml(s.equation_text)}</code>
          </div>
        ` : ''}

        ${rubricsHtml}
      </div>
    `;

    modal.style.display = 'flex';
  }

  // ── Reaction Rates & Chemical Kinetics Sessions ───────────────────
  let ratesSessionsStore = [];
  async function loadRatesSessions() {
    const box = document.getElementById('ratesSessionsBox');
    if (!box) return;
    box.innerHTML = '<div class="empty">Loading reaction rates sessions…</div>';
    try {
      const data = await Rates.getClass();
      ratesSessionsStore = data.sessions || [];

      if (ratesSessionsStore.length === 0) {
        box.innerHTML = '<div class="empty">No reaction rates practical sessions recorded yet.</div>';
        return;
      }

      const rows = ratesSessionsStore.map((s, idx) => {
        const tScore = s.table_score != null ? Number(s.table_score).toFixed(1) + ' / 5.0' : '—';
        const gScore = s.graph_score != null ? Number(s.graph_score).toFixed(1) + ' / 4.0' : '—';
        const cScore = s.calc_score != null ? Number(s.calc_score).toFixed(1) + ' / 6.0' : '—';
        const total = s.total_score != null ? Number(s.total_score).toFixed(1) + ' / 15.0' : '—';
        const grade = s.grade || '—';
        const isGood = parseFloat(s.total_score || 0) >= 9.5;

        return `
          <tr>
            <td><b>${escapeHtml(s.student_name || '—')}</b></td>
            <td>${escapeHtml(s.student_form || 'Form 4')}</td>
            <td>${escapeHtml(s.experiment_title || s.experiment_type || 'Reaction Rates')}</td>
            <td>${tScore}</td>
            <td>${gScore}</td>
            <td>${cScore}</td>
            <td><span class="pill ${isGood ? 'pill-ok' : 'pill-warn'}">${total} (${escapeHtml(grade)})</span></td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-primary" style="padding:6px 14px;font-size:0.8rem;font-weight:700;" onclick="viewRatesCard(${idx})">
                👁️ View Card
              </button>
            </td>
          </tr>
        `;
      }).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr><th>Student</th><th>Form</th><th>Experiment</th><th>Table 1 (5m)</th><th>Graph (4m)</th><th>Calcs (6m)</th><th>KNEC Total</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load reaction rates sessions: ' + escapeHtml(err.message) + '</div>';
    }
  }

  function viewRatesCard(idx) {
    const s = ratesSessionsStore[idx];
    if (!s) return;

    let modal = document.getElementById('ratesCardModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ratesCardModal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }

    let readings = s.dilution_readings;
    if (typeof readings === 'string') {
      try { readings = JSON.parse(readings); } catch (e) { readings = []; }
    }
    if (!Array.isArray(readings)) readings = [];

    let answers = s.answers;
    if (typeof answers === 'string') {
      try { answers = JSON.parse(answers); } catch (e) { answers = {}; }
    }
    if (!answers || typeof answers !== 'object') answers = {};

    let rubrics = s.rubric_breakdown;
    if (typeof rubrics === 'string') {
      try { rubrics = JSON.parse(rubrics); } catch (e) { rubrics = {}; }
    }
    if (!rubrics || typeof rubrics !== 'object') rubrics = {};

    const readingsHtml = readings.length > 0 ? `
      <div style="margin-top:14px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;">
        <div style="font-weight:800;font-size:0.88rem;color:var(--heading-color);margin-bottom:8px;">📊 Table 1: Dilution & Reaction Timing Observations</div>
        <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--card-bg-hover);color:var(--text-muted);text-align:center;">
              <th style="padding:6px;">Flask</th>
              <th style="padding:6px;">Vol Na₂S₂O₃ (cm³)</th>
              <th style="padding:6px;">Vol H₂O (cm³)</th>
              <th style="padding:6px;">Vol HCl (cm³)</th>
              <th style="padding:6px;">Time (s)</th>
              <th style="padding:6px;">Rate 1/t (s⁻¹)</th>
            </tr>
          </thead>
          <tbody>
            ${readings.map((r, i) => `
              <tr style="border-bottom:1px solid var(--card-border);text-align:center;">
                <td style="padding:6px;font-weight:700;">#${i + 1}</td>
                <td style="padding:6px;">${r.volThio != null ? Number(r.volThio).toFixed(1) : (r.volumeThio != null ? Number(r.volumeThio).toFixed(1) : '—')}</td>
                <td style="padding:6px;">${r.volWater != null ? Number(r.volWater).toFixed(1) : (r.volumeWater != null ? Number(r.volumeWater).toFixed(1) : '—')}</td>
                <td style="padding:6px;">${r.volAcid != null ? Number(r.volAcid).toFixed(1) : (r.volumeAcid != null ? Number(r.volumeAcid).toFixed(1) : '5.0')}</td>
                <td style="padding:6px;font-weight:700;color:var(--amber-accent);">${r.time != null ? Number(r.time).toFixed(1) : (r.timeTaken != null ? Number(r.timeTaken).toFixed(1) : '—')}s</td>
                <td style="padding:6px;font-weight:800;color:var(--cyan-accent);">${r.rate != null ? Number(r.rate).toFixed(4) : (r.reciprocalTime != null ? Number(r.reciprocalTime).toFixed(4) : '—')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    const answersHtml = `
      <div style="margin-top:14px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;">
        <div style="font-weight:800;font-size:0.88rem;color:var(--heading-color);margin-bottom:8px;">📝 Post-Practical Calculations & Collision Theory Questions</div>
        <div style="font-size:0.82rem;line-height:1.6;display:flex;flex-direction:column;gap:8px;">
          <div><b>(a) Time from Graph at 35 cm³ Thiosulfate:</b> <span style="color:var(--heading-color);">${escapeHtml(answers.time35 || 'Not answered')}</span></div>
          <div><b>(b) Collision Theory Explanation (Rate vs Concentration):</b> <span style="color:var(--heading-color);">${escapeHtml(answers.collision || 'Not answered')}</span></div>
          <div><b>(c) Balanced Ionic Equation:</b> <code style="background:var(--card-bg-hover);padding:2px 6px;border-radius:4px;">${escapeHtml(answers.ionic || 'Not answered')}</code></div>
          <div><b>(d) Maxwell-Boltzmann Distribution at Higher Temp:</b> <span style="color:var(--heading-color);">${escapeHtml(answers.maxBoltz || 'Not answered')}</span></div>
        </div>
      </div>
    `;

    modal.innerHTML = `
      <div class="modal-card" style="max-width:800px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--card-border);padding-bottom:12px;margin-bottom:16px;">
          <div>
            <h2 style="font-size:1.15rem;margin:0;color:var(--heading-color);font-family:var(--font-heading);font-weight:800;">⚡ Reaction Rates & Kinetics Candidate Card</h2>
            <div style="font-size:0.82rem;color:var(--text-muted);">
              Student: <b>${escapeHtml(s.student_name || 'Student')}</b> (${escapeHtml(s.student_form || 'Form 4')}) &nbsp;·&nbsp; Submitted: ${new Date(s.created_at).toLocaleString()}
            </div>
          </div>
          <button class="btn" onclick="document.getElementById('ratesCardModal').style.display='none'" style="padding:4px 12px;">✕ Close</button>
        </div>

        <div style="background:var(--card-bg-hover);border:1.5px solid #F59E0B;border-radius:12px;padding:16px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;font-weight:800;">Experiment Title</div>
            <div style="font-size:1.2rem;font-weight:900;color:var(--heading-color);margin-top:2px;">${escapeHtml(s.experiment_title || s.experiment_type)}</div>
          </div>
          <div>
            <span class="pill pill-ok" style="font-size:0.95rem;padding:6px 16px;font-weight:800;">
              Total Score: ${Number(s.total_score || 0).toFixed(1)} / 15.0 Marks (${escapeHtml(s.grade || '—')})
            </span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:16px;">
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Table 1 Dilution & Timing</div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--cyan-accent);margin-top:4px;">${s.table_score || 0} / 5.0 Marks</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">Completeness, Decimals & Trend</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">SAPC Rate Graph (1/t vs Vol)</div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--amber-accent);margin-top:4px;">${s.graph_score || 0} / 4.0 Marks</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">Scale, Axes, Plotting & Origin Line</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Collision Theory & Calcs</div>
            <div style="font-size:1.15rem;font-weight:800;color:var(--green-accent);margin-top:4px;">${s.calc_score || 0} / 6.0 Marks</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">Frequency per unit time & Ionic Eq</div>
          </div>
        </div>

        ${readingsHtml}
        ${answersHtml}
      </div>
    `;

    modal.style.display = 'flex';
  }
  window.viewRatesCard = viewRatesCard;
  window.loadRatesSessions = loadRatesSessions;

  // ── Gas Preparation & Collection Sessions ───────────────────────────
  let gasSessionsStore = [];
  async function loadGasSessions() {
    const box = document.getElementById('gasSessionsBox');
    if (!box) return;
    box.innerHTML = '<div class="empty">Loading gas preparation sessions…</div>';
    try {
      const data = typeof Gas !== 'undefined' ? await Gas.getClass() : (await apiRequest('GET', '/gas/class'));
      gasSessionsStore = data.sessions || [];

      if (gasSessionsStore.length === 0) {
        box.innerHTML = '<div class="empty">No gas preparation practical sessions recorded yet.</div>';
        return;
      }

      const rows = gasSessionsStore.map((s, idx) => {
        const gasName = s.gas_name || s.gas_key || '—';
        const drying = s.drying_agent || '—';
        const collection = s.collection_method || '—';
        const score = s.total_score != null ? Number(s.total_score).toFixed(1) + ' / 10.0' : '—';
        const isGood = parseFloat(s.total_score || 0) >= 7.0;

        return `
          <tr>
            <td><b>${escapeHtml(s.student_name || '—')}</b></td>
            <td>${escapeHtml(s.student_form || 'Form 4')}</td>
            <td><span style="font-weight:700;color:var(--heading-color);">${escapeHtml(gasName)}</span></td>
            <td>${escapeHtml(drying)} ${s.drying_correct ? '✅' : '❌'}</td>
            <td>${escapeHtml(collection)} ${s.collection_correct ? '✅' : '❌'}</td>
            <td><span class="pill ${isGood ? 'pill-ok' : 'pill-warn'}">${score}</span></td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-primary" style="padding:6px 14px;font-size:0.8rem;font-weight:700;" onclick="viewGasCard(${idx})">
                👁️ View Card
              </button>
            </td>
          </tr>
        `;
      }).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr><th>Student</th><th>Form</th><th>Gas Synthesized</th><th>Drying Agent</th><th>Collection Method</th><th>Score</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load gas preparation sessions: ' + escapeHtml(err.message) + '</div>';
    }
  }

  function viewGasCard(idx) {
    const s = gasSessionsStore[idx];
    if (!s) return;

    let modal = document.getElementById('gasCardModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'gasCardModal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }

    let rubrics = s.rubric_breakdown;
    if (typeof rubrics === 'string') {
      try { rubrics = JSON.parse(rubrics); } catch (e) { rubrics = {}; }
    }
    if (!rubrics || typeof rubrics !== 'object') rubrics = {};

    let observations = s.test_observations;
    if (typeof observations === 'string') {
      try { observations = JSON.parse(observations); } catch (e) { observations = []; }
    }
    if (!Array.isArray(observations)) observations = [];

    const rubricsHtml = Object.keys(rubrics).length > 0 ? `
      <div style="margin-top:14px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:14px;">
        <div style="font-weight:800;font-size:0.88rem;color:var(--heading-color);margin-bottom:10px;">📋 KNEC Paper 3 10-Mark Rubric Breakdown:</div>
        <div style="display:grid;grid-template-columns:1fr;gap:6px;">
          ${Object.entries(rubrics).map(([k, v]) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--card-bg-hover);border-radius:6px;font-size:0.82rem;">
              <span style="font-weight:600;text-transform:capitalize;">${escapeHtml(k.replace(/([A-Z])/g, ' $1'))}</span>
              <span style="font-family:var(--font-mono);font-weight:800;color:${v > 0 ? 'var(--green-accent)' : 'var(--red-accent)'};">${v} pts</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    modal.innerHTML = `
      <div class="modal-card" style="max-width:800px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--card-border);padding-bottom:12px;margin-bottom:16px;">
          <div>
            <h2 style="font-size:1.15rem;margin:0;color:var(--heading-color);font-family:var(--font-heading);font-weight:800;">💨 Gas Preparation & Confirmatory Testing Candidate Card</h2>
            <div style="font-size:0.82rem;color:var(--text-muted);">
              Student: <b>${escapeHtml(s.student_name || 'Student')}</b> (${escapeHtml(s.student_form || 'Form 4')}) &nbsp;·&nbsp; Submitted: ${new Date(s.created_at).toLocaleString()}
            </div>
          </div>
          <button class="btn" onclick="document.getElementById('gasCardModal').style.display='none'" style="padding:4px 12px;">✕ Close</button>
        </div>

        <div style="background:var(--card-bg-hover);border:1.5px solid var(--cyan-accent);border-radius:12px;padding:16px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;font-weight:800;">Gas Synthesized</div>
            <div style="font-size:1.2rem;font-weight:900;color:var(--heading-color);margin-top:2px;">${escapeHtml(s.gas_name || s.gas_key)}</div>
          </div>
          <div>
            <span class="pill pill-ok" style="font-size:0.95rem;padding:6px 16px;font-weight:800;">
              Total Score: ${Number(s.total_score || 0).toFixed(1)} / 10.0 Marks
            </span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:16px;">
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Drying Agent Choice</div>
            <div style="font-size:1rem;font-weight:800;color:${s.drying_correct ? 'var(--green-accent)' : 'var(--red-accent)'};margin-top:4px;">
              ${escapeHtml(s.drying_agent || 'None')} ${s.drying_correct ? '✓' : '✗'}
            </div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Collection Method</div>
            <div style="font-size:1rem;font-weight:800;color:${s.collection_correct ? 'var(--green-accent)' : 'var(--red-accent)'};margin-top:4px;">
              ${escapeHtml(s.collection_method || 'None')} ${s.collection_correct ? '✓' : '✗'}
            </div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Confirmatory Tests</div>
            <div style="font-size:1rem;font-weight:800;color:var(--cyan-accent);margin-top:4px;">
              ${s.tests_correct || 0} / ${s.tests_performed || 0} Correct
            </div>
          </div>
        </div>

        ${rubricsHtml}
      </div>
    `;

    modal.style.display = 'flex';
  }
  window.viewGasCard = viewGasCard;
  window.loadGasSessions = loadGasSessions;

  function toggleDetail(sessionId) {
    const row = document.getElementById('detail-' + sessionId);
    if (row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  }

  async function loadTeacherAssignments() {
    const box = document.getElementById('assignmentsManageList');
    try {
      const data = await Assignments.getTeacherList();
      const assignments = data.assignments || [];

      const elTotalAssn = document.getElementById('statAssignmentsCount');
      if (elTotalAssn) elTotalAssn.textContent = assignments.length;

      if (assignments.length === 0) {
        box.innerHTML = '<div class="empty">No assignments created yet. Use the authoring studio below to publish your first KCSE practical.</div>';
        return;
      }

      const typeLabels = {
        kcseComposite: '🏆 KCSE Paper 3 (40m)',
        acidBase: 'Acid-Base Titration',
        redox: 'Redox Titration',
        precipitation: 'Precipitation Titration',
        complexometric: 'Complexometric',
        dibasic: 'Dibasic Acid (H₂SO₄)',
        tribasic: 'Tribasic Acid (H₃PO₄)',
        weakAcid: 'Weak Acid – Strong Base',
        weakBase: 'Weak Base – Strong Acid',
        qualitative: '🧪 Qualitative Salt ID',
        organic: '🧫 Organic Chemistry',
        solubility: '🌡️ Solubility Curves',
        energy: '🔥 Energy Changes',
        rates: '⚡ Reaction Rates',
        gas: '💨 Gas Preparation'
      };

      const cardsHtml = assignments.map(a => {
        const total = Number(a.total_students) || 0;
        const submitted = Number(a.submitted_count) || 0;
        const pct = total > 0 ? Math.min(100, Math.round((submitted / total) * 100)) : 0;

        let dueDateText = 'No deadline set';
        let isPastDue = false;
        if (a.due_date) {
          const d = new Date(a.due_date);
          dueDateText = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          if (d.getTime() < Date.now()) {
            isPastDue = true;
          }
        }

        const typeBadge = typeLabels[a.titration_type] || a.titration_type || 'Practical';

        return `
          <div class="assign-item">
            <div>
              <div class="assign-card-header">
                <div class="assign-card-title">${escapeHtml(a.title)}</div>
                <span class="assign-type-pill">${escapeHtml(typeBadge)}</span>
              </div>
              
              ${a.instructions ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;line-height:1.4;">${escapeHtml(a.instructions)}</div>` : ''}

              <div class="assign-progress-box">
                <div class="assign-progress-label">
                  <span>Student Submissions</span>
                  <b style="color:var(--heading-color);">${submitted} / ${total} submitted (${pct}%)</b>
                </div>
                <div class="assign-progress-track">
                  <div class="assign-progress-bar" style="width: ${pct}%;"></div>
                </div>
              </div>

              <div class="assign-card-meta">
                <span>📅 <b>Due Date:</b> ${dueDateText}</span>
                ${isPastDue ? '<span class="pill pill-danger" style="font-size:0.68rem;padding:1px 6px;">Overdue</span>' : '<span class="pill pill-ok" style="font-size:0.68rem;padding:1px 6px;">Active</span>'}
              </div>
            </div>

            <div class="assign-actions-bar">
              <button class="btn btn-sm btn-secondary" onclick="sendAssignmentReminder(${a.id}, '${escapeHtml(a.title).replace(/'/g, "\\'")}')" title="Send due date notification to unsubmitted students">⏱️ Remind</button>
              <button class="btn btn-sm btn-secondary" onclick="exportAssignmentCsv(${a.id}, '${escapeHtml(a.title).replace(/'/g, "\\'")}')" title="Download CSV scorecard">📊 CSV</button>
              <button class="btn btn-sm btn-primary" onclick='editAssignment(${JSON.stringify(a).replace(/'/g, "&apos;")})'>✏️ Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteAssignment(${a.id}, '${escapeHtml(a.title).replace(/'/g, "\\'")}')" style="margin-left:auto;">🗑️ Delete</button>
            </div>
          </div>
        `;
      }).join('');

      box.innerHTML = `<div class="assignments-desktop-grid">${cardsHtml}</div>`;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load assignments: ' + escapeHtml(err.message) + '</div>';
    }
  }

  async function sendAssignmentReminder(id, title) {
    if (!confirm('Send a due date reminder notification to all students who have not yet submitted "' + title + '"?')) {
      return;
    }
    try {
      const res = await Assignments.remind(id);
      alert(res.message || '✓ Due date reminder sent to unsubmitted students!');
    } catch (err) {
      alert('Could not send reminder: ' + (err.message || 'unknown error'));
    }
  }
  window.sendAssignmentReminder = sendAssignmentReminder;

  async function exportAssignmentCsv(id, title) {
    const safeName = title.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    try {
      await Assignments.exportCsv(id, safeName + '_results.csv');
    } catch (err) {
      alert('Could not download results: ' + (err.message || 'unknown error'));
    }
  }

  function editAssignment(a) {
    document.getElementById('aEditingId').value = a.id;
    document.getElementById('aTitle').value = a.title;
    document.getElementById('aType').value = a.titration_type || 'acidBase';
    document.getElementById('aInstructions').value = a.instructions || '';
    document.getElementById('aDue').value = a.due_date ? a.due_date.slice(0, 10) : '';
    document.getElementById('formHeading').textContent = 'Edit Practical Assignment';
    document.getElementById('aSaveBtn').innerHTML = '<span>💾 Update Assignment</span>';
    
    const cancelBtn = document.getElementById('aCancelBtn');
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';

    const modeBadge = document.getElementById('studioModeBadge');
    if (modeBadge) {
      modeBadge.textContent = 'Editing Mode';
      modeBadge.style.background = 'var(--amber-bg)';
      modeBadge.style.color = 'var(--amber-accent)';
      modeBadge.style.borderColor = 'var(--amber-border)';
    }

    if (typeof toggleCompositeConfigPanel === 'function') {
      toggleCompositeConfigPanel();
    }

    if (a.titration_type === 'kcseComposite' && a.exam_config) {
      try {
        const cfg = typeof a.exam_config === 'string' ? JSON.parse(a.exam_config) : a.exam_config;
        if (cfg.presetKey && document.getElementById('cfgSeriesPreset')) {
          document.getElementById('cfgSeriesPreset').value = cfg.presetKey;
        }
        if (cfg.q1) {
          if (cfg.q1.solutionA && document.getElementById('cfgQ1SolA')) document.getElementById('cfgQ1SolA').value = cfg.q1.solutionA;
          if (cfg.q1.solutionB && document.getElementById('cfgQ1SolB')) document.getElementById('cfgQ1SolB').value = cfg.q1.solutionB;
          if (cfg.q1.ratioA && document.getElementById('cfgQ1RatioA')) document.getElementById('cfgQ1RatioA').value = cfg.q1.ratioA;
          if (cfg.q1.ratioB && document.getElementById('cfgQ1RatioB')) document.getElementById('cfgQ1RatioB').value = cfg.q1.ratioB;
          if (cfg.q1.pipetteVolume && document.getElementById('cfgQ1Pipette')) document.getElementById('cfgQ1Pipette').value = String(cfg.q1.pipetteVolume);
          if (cfg.q1.indicator && document.getElementById('cfgQ1Indicator')) document.getElementById('cfgQ1Indicator').value = cfg.q1.indicator;
        }
        if (cfg.q2 && cfg.q2.salt && document.getElementById('cfgQ2Salt')) {
          document.getElementById('cfgQ2Salt').value = cfg.q2.salt;
        }
        if (cfg.q3 && cfg.q3.organic && document.getElementById('cfgQ3Organic')) {
          document.getElementById('cfgQ3Organic').value = cfg.q3.organic;
        }
      } catch (e) {}
    }

    document.getElementById('assignMsg').innerHTML = '';
    const studio = document.getElementById('assignmentStudioCard') || document.querySelector('.assign-form');
    if (studio) studio.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelEdit() {
    document.getElementById('aEditingId').value = '';
    document.getElementById('aTitle').value = '';
    document.getElementById('aInstructions').value = '';
    document.getElementById('aDue').value = '';
    document.getElementById('formHeading').textContent = 'Create Practical Assignment';
    document.getElementById('aSaveBtn').innerHTML = '<span>🚀 Publish Practical Assignment</span>';
    
    const cancelBtn = document.getElementById('aCancelBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';

    const modeBadge = document.getElementById('studioModeBadge');
    if (modeBadge) {
      modeBadge.textContent = 'Authoring Mode';
      modeBadge.style.background = 'var(--blue-bg)';
      modeBadge.style.color = 'var(--blue-accent)';
      modeBadge.style.borderColor = 'var(--blue-border)';
    }

    document.getElementById('assignMsg').innerHTML = '';
  }

  window.scrollToCreateAssignment = function() {
    cancelEdit();
    const el = document.getElementById('assignmentStudioCard') || document.querySelector('.assign-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  async function deleteAssignment(id, title) {
    if (!confirm('Delete "' + title + '"? This cannot be undone. Students\' completed session data will not be affected.')) {
      return;
    }
    try {
      await Assignments.remove(id);
      loadTeacherAssignments();
      loadSubmittedAssignments();
    } catch (err) {
      alert('Could not delete assignment: ' + (err.message || 'unknown error'));
    }
  }

  async function loadSubmittedAssignments() {
    const box = document.getElementById('submittedAssignmentsList');
    try {
      const data = await Assignments.getAllSubmissions({ limit: 100 });
      const submissions = data.submissions || [];
      window._allTeacherSubmissions = submissions;

      const pendingCount = submissions.filter(s => s.submission_status !== 'marked').length;
      const markedCount = submissions.length - pendingCount;
      const badge = document.getElementById('ungradedBadge');
      if (badge) {
        badge.textContent = pendingCount;
        badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
      }

      const elPending = document.getElementById('statPendingCount');
      if (elPending) elPending.textContent = pendingCount;
      const elMarked = document.getElementById('statMarkedCount');
      if (elMarked) elMarked.textContent = markedCount;
      const elTotalSubs = document.getElementById('statSubmissionsTotal');
      if (elTotalSubs) elTotalSubs.textContent = submissions.length;

      renderFilteredSubmissions(window._activeSubmissionsFilter || 'all');
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load submitted assignments: ' + escapeHtml(err.message) + '</div>';
    }
  }

  window.filterSubmissionsTab = function(filter, btnEl) {
    if (btnEl) {
      document.querySelectorAll('#submissionFilterTabs .filter-pill-btn').forEach(b => b.classList.remove('active'));
      btnEl.classList.add('active');
    }
    window._activeSubmissionsFilter = filter;
    renderFilteredSubmissions(filter);
  };

  function renderFilteredSubmissions(filter) {
    const box = document.getElementById('submittedAssignmentsList');
    const allSubs = window._allTeacherSubmissions || [];
    let submissions = allSubs;
    if (filter === 'pending') {
      submissions = allSubs.filter(s => s.submission_status !== 'marked');
    } else if (filter === 'marked') {
      submissions = allSubs.filter(s => s.submission_status === 'marked');
    }

    if (submissions.length === 0) {
      const emptyText = filter === 'pending'
        ? '🎉 All student practical submissions have been marked and released!'
        : (filter === 'marked'
          ? 'No student submissions have been approved & released yet.'
          : 'No student assignment submissions yet.');
      box.innerHTML = `<div class="empty">${emptyText}</div>`;
      return;
    }

    const rows = submissions.flatMap(sub => {
        const isMarked = sub.submission_status === 'marked';
        const statusBadge = isMarked
          ? '<span class="pill pill-ok">🟢 Marked & Released</span>'
          : '<span class="pill pill-warn">🟡 Pending Approval</span>';

        const actionBtn = isMarked
          ? `<span style="font-size:0.75rem;color:var(--text-muted);margin-right:8px;">${sub.marked_at ? new Date(sub.marked_at).toLocaleDateString() : 'Released'}</span>`
          : `<button class="btn btn-primary" onclick="markStudentSubmission(${sub.submission_id}, '${escapeHtml(sub.student_name).replace(/'/g, "\\'")}')" style="padding:4px 12px;font-size:0.76rem;">Approve & Release Marks</button>`;

        const feedbackText = sub.teacher_feedback
          ? `<div style="font-size:0.75rem;color:var(--cyan-accent);margin-top:4px;"><b>Teacher Comment:</b> "${escapeHtml(sub.teacher_feedback)}"</div>`
          : '';

        let answerText = '—';
        if (sub.composite_total_score != null || sub.q1_score != null) {
          answerText = (sub.composite_total_score != null ? Number(sub.composite_total_score).toFixed(1) : Number(sub.total_score || 0).toFixed(1)) + ' / 40';
        } else if (sub.gas_total_score != null) {
          answerText = Number(sub.gas_total_score).toFixed(1) + ' / 10';
        } else if (sub.en_total_score != null) {
          answerText = Number(sub.en_total_score).toFixed(1) + ' / 15';
        } else if (sub.rate_total_score != null) {
          answerText = Number(sub.rate_total_score).toFixed(1) + ' / 15';
        } else if (sub.sol_total_score != null) {
          answerText = Number(sub.sol_total_score).toFixed(1) + ' / 5';
        } else if (sub.salt_key) {
          answerText = escapeHtml(sub.student_cation || '—') + ' / ' + escapeHtml(sub.student_anion || '—');
        } else if (sub.compound_key) {
          answerText = escapeHtml(sub.student_functional_group || '—');
        } else if (sub.student_answer != null) {
          answerText = Number(sub.student_answer).toFixed(4) + ' M';
        }

        const resultText = sub.correct === true
          ? '<span class="pill pill-ok">Correct</span>'
          : sub.correct === false
            ? '<span class="pill pill-warn">Incorrect</span>'
            : '<span class="pill pill-warn">Pending</span>';

        const detailBlocks = [];

        if (sub.q1_score != null || sub.q2_score != null || sub.q3_score != null || sub.total_score != null) {
          detailBlocks.push(`
            <div style="margin-bottom:8px;"><b>KCSE Composite Exam Breakdown:</b></div>
            <div>Q1 Titration: <b>${sub.q1_score != null ? Number(sub.q1_score).toFixed(1) + ' / 15' : '—'}</b></div>
            <div>Q2 Salt Analysis: <b>${sub.q2_score != null ? Number(sub.q2_score).toFixed(1) + ' / 15' : '—'}</b></div>
            <div>Q3 Organic ID: <b>${sub.q3_score != null ? Number(sub.q3_score).toFixed(1) + ' / 10' : '—'}</b></div>
            <div>Total Score: <b>${sub.total_score != null ? Number(sub.total_score).toFixed(1) + ' / 40' : '—'}</b></div>
            <div>Grade: <b>${escapeHtml(sub.grade || '—')}</b></div>
          `);
        }

        if (sub.titration_type || sub.trial_readings) {
          let trialReadings = sub.trial_readings;
          if (typeof trialReadings === 'string') {
            try { trialReadings = JSON.parse(trialReadings); } catch (e) {}
          }

          const readingsArray = Array.isArray(trialReadings)
            ? trialReadings
            : (trialReadings && Array.isArray(trialReadings.readings) ? trialReadings.readings : []);
          
          let detailsObj = {};
          try {
            if (sub.details && typeof sub.details === 'object') {
              detailsObj = sub.details;
            } else if (typeof sub.details === 'string') {
              detailsObj = JSON.parse(sub.details) || {};
            } else if (trialReadings && typeof trialReadings === 'object' && !Array.isArray(trialReadings)) {
              detailsObj = trialReadings;
            }
          } catch (e) {
            detailsObj = {};
          }
          if (!detailsObj || typeof detailsObj !== 'object') detailsObj = {};
          
          const studentAvg = detailsObj.studentAverage != null ? parseFloat(detailsObj.studentAverage) : null;
          const studentMolesT = detailsObj.molesTitrant != null ? parseFloat(detailsObj.molesTitrant) : null;
          const studentMolesA = detailsObj.molesAnalyte != null ? parseFloat(detailsObj.molesAnalyte) : null;
          const studentMolarity = sub.student_answer != null ? parseFloat(sub.student_answer) : null;
          const studentMassConc = detailsObj.massConc != null ? parseFloat(detailsObj.massConc) : null;

          const trueConcVal = sub.true_value != null ? parseFloat(sub.true_value) : (detailsObj.expectedConc != null ? parseFloat(detailsObj.expectedConc) : null);
          const rfm = detailsObj.rfm || 40;

          const titrKey = detailsObj.titrationKey || sub.titration_type || (sub.assignment_type && sub.assignment_type !== 'titration' ? sub.assignment_type : 'acidBase');
          
          const TITRATION_SPECS = {
            acidBase: {
              titrantLabel: 'NaOH (Solution B)',
              analyteLabel: 'HCl (Solution A)',
              ratio: 1,
              stepBLabel: '(b) Moles of NaOH in Solution B (n₁):',
              stepCLabel: '(c) Moles of HCl in flask aliquot (n₂ = n₁):',
              stepDLabel: '(d) Molar concentration of HCl in Solution A (mol/dm³):',
              stepELabel: '(e) Mass concentration of HCl in Solution A (H = 1.0, Cl = 35.5):',
              stepEUnit: 'g/dm³',
              calcStepE: (m) => m * 36.5
            },
            redox: {
              titrantLabel: 'KMnO₄ (Solution B)',
              analyteLabel: 'Fe²⁺ (Solution A)',
              ratio: 5,
              stepBLabel: '(b) Moles of KMnO₄ in Solution B (n₁):',
              stepCLabel: '(c) Moles of Fe²⁺ in flask aliquot (Mole ratio 1 KMnO₄ : 5 Fe²⁺, n₂ = 5 × n₁):',
              stepDLabel: '(d) Molar concentration of Fe²⁺ in Solution A (mol/dm³):',
              stepELabel: '(e) Mass of Iron (Fe) in 1.0 dm³ of Solution A in g (RAM: Fe = 56.0):',
              stepEUnit: 'g',
              calcStepE: (m) => m * 56.0
            },
            precipitation: {
              titrantLabel: 'AgNO₃ (Solution B)',
              analyteLabel: 'NaCl (Solution A)',
              ratio: 1,
              stepBLabel: '(b) Moles of AgNO₃ in Solution B (n₁):',
              stepCLabel: '(c) Moles of NaCl in flask aliquot (n₂ = n₁):',
              stepDLabel: '(d) Molar concentration of NaCl in Solution A (mol/dm³):',
              stepELabel: '(e) Mass of pure NaCl dissolved in 250.0 cm³ flask in g (Na = 23.0, Cl = 35.5):',
              stepEUnit: 'g',
              calcStepE: (m) => m * (250 / 1000) * 58.5
            },
            complexometric: {
              titrantLabel: 'EDTA (Solution B)',
              analyteLabel: 'Hard water Ca²⁺ (Solution A)',
              ratio: 1,
              stepBLabel: '(b) Moles of EDTA in Solution B (n₁):',
              stepCLabel: '(c) Moles of Ca²⁺ in flask aliquot (n₂ = n₁):',
              stepDLabel: '(d) Molar concentration of Ca²⁺ in Solution A (mol/dm³):',
              stepELabel: '(e) Total Water Hardness as CaCO₃ in mg/dm³ (ppm) (Ca = 40.0, C = 12.0, O = 16.0):',
              stepEUnit: 'mg/dm³ (ppm)',
              calcStepE: (m) => m * 100.0 * 1000
            },
            dibasic: {
              titrantLabel: 'NaOH (Solution B)',
              analyteLabel: 'H₂X (Solution A)',
              ratio: 0.5,
              stepBLabel: '(b) Moles of NaOH in Solution B (n₁):',
              stepCLabel: '(c) Moles of H₂X in flask aliquot (Mole ratio 2 NaOH : 1 H₂X, n₂ = 0.5 × n₁):',
              stepDLabel: '(d) Molar concentration of acid H₂X in Solution A (mol/dm³):',
              stepELabel: '(e) Relative Formula Mass (RFM) of acid H₂X (Solution A):',
              stepEUnit: 'g/mol',
              calcStepE: (m) => m > 0 ? ((detailsObj.massConc || 4.90) / m) : 98.0
            },
            tribasic: {
              titrantLabel: 'NaOH (Solution B)',
              analyteLabel: 'H₃PO₄ (Solution A)',
              ratio: 1 / 3,
              stepBLabel: '(b) Moles of NaOH in Solution B (n₁):',
              stepCLabel: '(c) Moles of H₃PO₄ in flask aliquot (Mole ratio 3 NaOH : 1 H₃PO₄, n₂ = 1/3 × n₁):',
              stepDLabel: '(d) Molar concentration of H₃PO₄ in Solution A (mol/dm³):',
              stepELabel: '(e) Mass of pure H₃PO₄ in 500.0 cm³ bottle in g (H = 1.0, P = 31.0, O = 16.0):',
              stepEUnit: 'g',
              calcStepE: (m) => m * (500 / 1000) * 98.0
            },
            weakAcid: {
              titrantLabel: 'NaOH (Solution B)',
              analyteLabel: 'Diluted vinegar (Solution A)',
              ratio: 1,
              stepBLabel: '(b) Moles of NaOH in Solution B (n₁):',
              stepCLabel: '(c) Moles of CH₃COOH in flask aliquot (n₂ = n₁):',
              stepDLabel: '(d) Molar concentration of diluted vinegar in Solution A (mol/dm³):',
              stepELabel: '(e) Percentage (% w/v) Acidity of original vinegar (10× diluted sample; C = 12.0, H = 1.0, O = 16.0):',
              stepEUnit: '% (w/v)',
              calcStepE: (m) => (m * 10.0 * 60.0) / 10.0
            },
            weakBase: {
              titrantLabel: 'HCl (Solution B)',
              analyteLabel: 'NH₃ (Solution A)',
              ratio: 1,
              stepBLabel: '(b) Moles of HCl in Solution B (n₁):',
              stepCLabel: '(c) Moles of NH₃ in flask aliquot (n₂ = n₁):',
              stepDLabel: '(d) Molar concentration of NH₃ in Solution A (mol/dm³):',
              stepELabel: '(e) Volume of dry NH₃ gas at s.t.p. in 1.0 dm³ Solution A in dm³ (Molar vol = 22.4 dm³):',
              stepEUnit: 'dm³',
              calcStepE: (m) => m * 22.4
            }
          };

          const spec = TITRATION_SPECS[titrKey] || TITRATION_SPECS.acidBase;
          const ratio = (detailsObj.ratio != null) ? detailsObj.ratio : spec.ratio;
          const analyteVol = detailsObj.analyteVolume || 25.0;
          const titrantConc = detailsObj.titrantConc || 0.1;

          // Determine student's average titre V_avg
          let expectedAvg = null;
          if (readingsArray.length > 0) {
            let concordantReadings = [];
            for (let i = 0; i < readingsArray.length; i++) {
              for (let j = i + 1; j < readingsArray.length; j++) {
                if (Math.abs(readingsArray[i] - readingsArray[j]) <= 0.20) {
                  if (!concordantReadings.includes(readingsArray[i])) concordantReadings.push(readingsArray[i]);
                  if (!concordantReadings.includes(readingsArray[j])) concordantReadings.push(readingsArray[j]);
                }
              }
            }
            if (concordantReadings.length === 0) concordantReadings = readingsArray;
            expectedAvg = concordantReadings.reduce((a, b) => a + b, 0) / concordantReadings.length;
          } else if (studentAvg != null) {
            expectedAvg = studentAvg;
          }

          // Consequential base average
          const baseAvg = (studentAvg != null && !isNaN(studentAvg)) ? studentAvg : expectedAvg;

          // Calculate expected values based on student's own average titre
          let expectedMolesT = null;
          let expectedMolesA = null;
          let expectedMolarityFromAvg = null;
          let expectedStepEFromAvg = null;

          if (baseAvg != null) {
            expectedMolesT = (titrantConc * baseAvg) / 1000;
            expectedMolesA = expectedMolesT * ratio;
            expectedMolarityFromAvg = (expectedMolesA * 1000) / analyteVol;
            expectedStepEFromAvg = spec.calcStepE(expectedMolarityFromAvg);
          }

          // True benchmark values from database (if available)
          const benchmarkMolarity = trueConcVal != null ? trueConcVal : (detailsObj.expectedConc != null ? parseFloat(detailsObj.expectedConc) : expectedMolarityFromAvg);
          const benchmarkStepE = (detailsObj.expectedStepE != null) ? parseFloat(detailsObj.expectedStepE) : (benchmarkMolarity != null ? spec.calcStepE(benchmarkMolarity) : null);

          // Values to display as primary expected
          const displayExpectedMolesT = (detailsObj.expectedStepB != null) ? parseFloat(detailsObj.expectedStepB) : expectedMolesT;
          const displayExpectedMolesA = (detailsObj.expectedStepC != null) ? parseFloat(detailsObj.expectedStepC) : expectedMolesA;
          const displayExpectedMolarity = (detailsObj.expectedStepD != null) ? parseFloat(detailsObj.expectedStepD) : (benchmarkMolarity || expectedMolarityFromAvg);
          const displayExpectedStepE = (detailsObj.expectedStepE != null) ? parseFloat(detailsObj.expectedStepE) : (benchmarkStepE || expectedStepEFromAvg);

          // Consequential expected values from student's OWN preceding input
          const conseqMolesA = (studentMolesT != null && !isNaN(studentMolesT)) ? studentMolesT * ratio : null;
          const conseqMolarity = (studentMolesA != null && !isNaN(studentMolesA)) ? (studentMolesA * 1000) / analyteVol : ((conseqMolesA != null) ? (conseqMolesA * 1000) / analyteVol : null);
          const conseqStepE = (studentMolarity != null && !isNaN(studentMolarity)) ? spec.calcStepE(studentMolarity) : null;

          const stepELabel = detailsObj.stepELabel || spec.stepELabel;
          const stepEUnit = detailsObj.stepEUnit || spec.stepEUnit;

          // Build Titration Readings Table
          let tableRowsHtml = '';
          if (readingsArray.length > 0) {
            tableRowsHtml = readingsArray.map((v, i) => {
              const initV = (0.0).toFixed(2);
              const finalV = Number(v).toFixed(2);
              const titreV = Number(v).toFixed(2);
              const isConc = readingsArray.some((otherV, idx) => idx !== i && Math.abs(v - otherV) <= 0.20);
              return `
                <tr style="border-bottom:1px solid var(--card-border);text-align:center;">
                  <td style="padding:6px 10px;font-weight:700;">Trial ${i + 1}</td>
                  <td style="padding:6px 10px;">${initV}</td>
                  <td style="padding:6px 10px;">${finalV}</td>
                  <td style="padding:6px 10px;font-weight:800;color:var(--cyan-accent);">${titreV}</td>
                  <td style="padding:6px 10px;">${isConc ? '<span class="pill pill-ok" style="font-size:0.72rem;padding:2px 8px;">✓ Concordant</span>' : '<span style="color:var(--text-muted);">—</span>'}</td>
                </tr>
              `;
            }).join('');
          }

          const tableContainerHtml = tableRowsHtml ? `
            <div style="margin:12px 0 16px 0;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;">
              <div style="font-size:0.85rem;font-weight:800;color:var(--heading-color);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
                <span>📊 Student Titration Results Table</span>
                <span style="font-size:0.75rem;color:var(--text-muted);font-weight:normal;">Total Trials: ${readingsArray.length}</span>
              </div>
              <div style="overflow-x:auto;">
                <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
                  <thead>
                    <tr style="background:var(--card-bg-hover);color:var(--text-muted);">
                      <th style="padding:6px 10px;">Titration Trial</th>
                      <th style="padding:6px 10px;">Initial Reading (cm³)</th>
                      <th style="padding:6px 10px;">Final Reading (cm³)</th>
                      <th style="padding:6px 10px;">Titre Used (cm³)</th>
                      <th style="padding:6px 10px;">Concordant?</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRowsHtml}
                  </tbody>
                </table>
              </div>
            </div>
          ` : '';

          // Helper function for marking student answers with consequential marking support
          function markAnswer(studentVal, expectedVal, unit = '', tolPct = 0.03, absTol = 0.20, consequentialVal = null) {
            if (studentVal == null || isNaN(studentVal)) {
              return '<span class="pill pill-warn" style="font-size:0.74rem;">⚠️ Not Answered</span>';
            }
            if (expectedVal == null || isNaN(expectedVal)) {
              return `<b style="color:var(--heading-color);">${studentVal} ${unit}</b>`;
            }
            const diffPrimary = Math.abs(studentVal - expectedVal);
            const isPrimaryOk = unit === 'cm³' ? diffPrimary <= absTol : diffPrimary <= Math.max(0.0005, expectedVal * tolPct);
            
            let isConsequentialOk = false;
            if (!isPrimaryOk && consequentialVal != null && !isNaN(consequentialVal) && consequentialVal > 0) {
              const diffConseq = Math.abs(studentVal - consequentialVal);
              isConsequentialOk = diffConseq <= Math.max(0.0005, consequentialVal * tolPct);
            }

            const isOk = isPrimaryOk || isConsequentialOk;
            const badgeClass = isOk ? 'pill-ok' : 'pill-warn';
            const icon = isPrimaryOk ? '✓ Correct' : (isConsequentialOk ? '✓ Consequential Mark' : '✗ Incorrect');
            const color = isOk ? 'var(--green-accent)' : 'var(--red-accent)';

            const decimals = unit === 'cm³' ? 2 : (unit === 'mol' ? 6 : (unit === 'mg/dm³ (ppm)' ? 1 : 4));
            const expFormatted = expectedVal.toFixed(decimals);

            let extraNote = `(Expected: ${expFormatted} ${unit})`;
            if (isConsequentialOk) {
              extraNote = `(Consequential credit from previous step: ${consequentialVal.toFixed(decimals)} ${unit} · Benchmark: ${expFormatted} ${unit})`;
            }

            return `
              <div style="display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <b style="font-size:0.88rem;color:${color};">${studentVal} ${unit}</b>
                <span class="pill ${badgeClass}" style="font-size:0.72rem;padding:2px 8px;font-weight:700;">${icon}</span>
                <span style="font-size:0.75rem;color:var(--text-muted);">${extraNote}</span>
              </div>
            `;
          }

          const examMarks = trialReadings && trialReadings.examMarks ? trialReadings.examMarks : null;

          detailBlocks.push(`
            <div style="background:var(--card-bg-hover);border:1px solid var(--card-border);border-radius:12px;padding:16px;margin-top:8px;">
              <div style="font-size:0.95rem;font-weight:800;color:var(--heading-color);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
                <span>🧪 Practical Session & Calculations Breakdown</span>
                <span class="pill ${sub.correct ? 'pill-ok' : 'pill-warn'}" style="font-size:0.8rem;padding:4px 12px;font-weight:800;">
                  ${sub.correct ? '✓ Overall Passed' : '✗ Review Required'}
                </span>
              </div>

              ${tableContainerHtml}

              <div style="font-size:0.83rem;line-height:1.8;display:grid;grid-template-columns:1fr;gap:8px;">
                <div style="background:var(--card-bg);padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);">
                  <span style="color:var(--text-muted);font-weight:600;">(a) Average Titre V_avg:</span> &nbsp;
                  ${markAnswer(studentAvg, expectedAvg, 'cm³', 0, 0.20)}
                </div>

                <div style="background:var(--card-bg);padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);">
                  <span style="color:var(--text-muted);font-weight:600;">${spec.stepBLabel}</span> &nbsp;
                  ${markAnswer(studentMolesT, displayExpectedMolesT, 'mol')}
                </div>

                <div style="background:var(--card-bg);padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);">
                  <span style="color:var(--text-muted);font-weight:600;">${spec.stepCLabel}</span> &nbsp;
                  ${markAnswer(studentMolesA, displayExpectedMolesA, 'mol', 0.03, 0.20, conseqMolesA)}
                </div>

                <div style="background:var(--card-bg);padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);">
                  <span style="color:var(--text-muted);font-weight:600;">${spec.stepDLabel}</span> &nbsp;
                  ${markAnswer(studentMolarity, displayExpectedMolarity, 'M', 0.03, 0.20, conseqMolarity)}
                </div>

                <div style="background:var(--card-bg);padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);">
                  <span style="color:var(--text-muted);font-weight:600;">${stepELabel}</span> &nbsp;
                  ${markAnswer(studentMassConc, displayExpectedStepE, stepEUnit, 0.03, 0.20, conseqStepE)}
                </div>

                <div style="margin-top:6px;font-size:0.78rem;color:var(--text-muted);display:flex;gap:16px;">
                  <span><b>Indicator Used:</b> ${escapeHtml(sub.indicator_used || '—')}</span>
                  <span><b>Mode:</b> ${escapeHtml(sub.practical_mode || 'assignment')}</span>
                  <span><b>Titration Type:</b> ${escapeHtml(sub.titration_type || '—')}</span>
                </div>
              </div>
            </div>
          `);
          if (examMarks) {
            detailBlocks.push(`
              <div style="margin-top:12px;background:var(--card-bg);padding:12px;border-radius:10px;border:1px solid var(--card-border);">
                <div style="margin-bottom:8px;font-weight:800;color:var(--heading-color);"><b>KCSE Practical Question Mark Breakdown:</b></div>
                <div>1) Burette Accuracy & Meniscus: <b>${examMarks.accuracyMarks ?? '—'} / 5</b></div>
                <div>2) Concordance of Titres: <b>${examMarks.concordanceMarks ?? '—'} / 3</b></div>
                <div>3) Average Titre Accuracy: <b>${examMarks.averageMarks ?? '—'} / 2</b></div>
                <div>4) Concentration Calculation: <b>${examMarks.concMarks ?? '—'} / 5</b></div>
                <div style="margin-top:4px;color:var(--cyan-accent);font-weight:800;">Total Practical Marks: <b>${examMarks.totalMarks ?? '—'} / 15</b></div>
              </div>
            `);
          }
        }

        if (sub.salt_key || sub.cation_correct != null || sub.anion_correct != null) {
          detailBlocks.push(`
            <div style="margin-bottom:8px;"><b>Qualitative Analysis Details:</b></div>
            <div>Salt Key: <b>${escapeHtml(sub.salt_key || '—')}</b></div>
            <div>Cation Identified: <b>${escapeHtml(sub.student_cation || '—')}</b> (${sub.cation_correct ? 'Correct' : 'Incorrect'})</div>
            <div>Anion Identified: <b>${escapeHtml(sub.student_anion || '—')}</b> (${sub.anion_correct ? 'Correct' : 'Incorrect'})</div>
            <div>Tests Performed: <b>${sub.q_tests_performed ?? '—'}</b></div>
            <div>Tests Correct: <b>${sub.q_tests_correct ?? '—'}</b></div>
          `);
        }

        if (sub.compound_key || sub.functional_group_correct != null) {
          detailBlocks.push(`
            <div style="margin-bottom:8px;"><b>Organic Chemistry Details:</b></div>
            <div>Sample: <b>${escapeHtml(sub.compound_name || sub.compound_key || '—')}</b></div>
            <div>True Functional Group: <b>${escapeHtml(sub.true_functional_group || '—')}</b></div>
            <div>Student Functional Group: <b>${escapeHtml(sub.student_functional_group || '—')}</b></div>
            <div>Correct Match: <b>${sub.functional_group_correct ? 'Yes' : 'No'}</b></div>
            <div>Tests Performed: <b>${sub.o_tests_performed ?? '—'}</b></div>
            <div>Tests Correct: <b>${sub.o_tests_correct ?? '—'}</b></div>
          `);
        }

        if (sub.solute_key || sub.sol_total_score != null) {
          detailBlocks.push(`
            <div style="margin-bottom:8px;font-weight:800;color:var(--heading-color);"><b>Solubility Curve & Crystallization Details:</b></div>
            <div>Target Solute: <b>${escapeHtml(sub.solute_name || sub.solute_key || '—')}</b></div>
            <div>Crystallization Temp: <b>${sub.crystallization_temp != null ? sub.crystallization_temp + ' °C' : '—'}</b> (Theoretical: ${sub.theoretical_temp != null ? sub.theoretical_temp + ' °C' : '—'}, Diff: ${sub.temp_difference != null ? sub.temp_difference + ' °C' : '—'})</div>
            <div>Accuracy Mark: <b>${sub.sol_accuracy_score != null ? sub.sol_accuracy_score + ' / 2.0' : '—'}</b> &nbsp;·&nbsp; Graph Mark: <b>${sub.sol_graph_score != null ? sub.sol_graph_score + ' / 3.0' : '—'}</b></div>
            <div style="margin-top:4px;color:var(--cyan-accent);font-weight:800;">Total Score: <b>${sub.sol_total_score != null ? Number(sub.sol_total_score).toFixed(1) + ' / 5.0 Marks' : '—'}</b></div>
          `);
        }

        if (sub.en_system_id || sub.en_total_score != null) {
          detailBlocks.push(`
            <div style="margin-bottom:8px;font-weight:800;color:var(--heading-color);"><b>Thermochemistry / Energy Changes Details:</b></div>
            <div>Reaction System: <b>${escapeHtml(sub.en_system_name || sub.en_system_id || '—')}</b> (Category: ${escapeHtml(sub.en_category || 'thermochemistry')})</div>
            <div>Temp Change (ΔT): <b>${sub.en_temp_change != null ? sub.en_temp_change + ' °C' : '—'}</b> (Initial: ${sub.en_initial_temp || 0}°C → Max/Min: ${sub.en_final_temp || 0}°C)</div>
            <div>Heat Quantity (Q): <b>${sub.en_heat_quantity != null ? sub.en_heat_quantity + ' J' : '—'}</b> &nbsp;·&nbsp; Moles: <b>${sub.en_moles != null ? sub.en_moles + ' mol' : '—'}</b></div>
            <div>Molar Enthalpy (ΔH): <b>${sub.en_molar_enthalpy != null ? sub.en_molar_enthalpy + ' kJ/mol' : '—'}</b> (Theoretical: ${sub.en_theoretical_enthalpy || '—'} kJ/mol)</div>
            ${sub.en_equation ? `<div>Equation: <code style="background:var(--card-bg);padding:2px 6px;border-radius:4px;">${escapeHtml(sub.en_equation)}</code></div>` : ''}
            <div style="margin-top:4px;color:var(--cyan-accent);font-weight:800;">Total Score: <b>${sub.en_total_score != null ? Number(sub.en_total_score).toFixed(1) + ' / 15.0 Marks' : '—'}</b></div>
          `);
        }

        if (sub.rate_exp_type || sub.rate_total_score != null) {
          detailBlocks.push(`
            <div style="margin-bottom:8px;font-weight:800;color:var(--heading-color);"><b>Reaction Rates & Chemical Kinetics Details:</b></div>
            <div>Experiment: <b>${escapeHtml(sub.rate_exp_title || sub.rate_exp_type || '—')}</b></div>
            <div>Table 1 Dilution Score: <b>${sub.rate_table_score != null ? Number(sub.rate_table_score).toFixed(1) + ' / 5.0' : '—'}</b></div>
            <div>SAPC Graph Score: <b>${sub.rate_graph_score != null ? Number(sub.rate_graph_score).toFixed(1) + ' / 4.0' : '—'}</b></div>
            <div>Collision Theory & Calcs: <b>${sub.rate_calc_score != null ? Number(sub.rate_calc_score).toFixed(1) + ' / 6.0' : '—'}</b></div>
            <div style="margin-top:4px;color:var(--cyan-accent);font-weight:800;">Total Score: <b>${sub.rate_total_score != null ? Number(sub.rate_total_score).toFixed(1) + ' / 15.0 Marks' : '—'} (Grade: ${escapeHtml(sub.rate_grade || '—')})</b></div>
          `);
        }

        if (sub.gas_key || sub.gas_total_score != null) {
          detailBlocks.push(`
            <div style="margin-bottom:8px;font-weight:800;color:var(--heading-color);"><b>Gas Preparation & Confirmatory Testing Details:</b></div>
            <div>Gas Synthesized: <b>${escapeHtml(sub.gas_name || sub.gas_key || '—')}</b></div>
            <div>Drying Agent: <b>${escapeHtml(sub.gas_drying_agent || '—')}</b> (${sub.gas_drying_correct ? '✓ Correct' : '✗ Incorrect'})</div>
            <div>Collection Method: <b>${escapeHtml(sub.gas_collection_method || '—')}</b> (${sub.gas_collection_correct ? '✓ Correct' : '✗ Incorrect'})</div>
            <div>Tests Performed: <b>${sub.gas_tests_performed ?? '—'}</b> &nbsp;·&nbsp; Tests Correct: <b>${sub.gas_tests_correct ?? '—'}</b></div>
            <div style="margin-top:4px;color:var(--cyan-accent);font-weight:800;">Total Score: <b>${sub.gas_total_score != null ? Number(sub.gas_total_score).toFixed(1) + ' / 10.0 Marks' : '—'}</b></div>
          `);
        }

        const detailsHtml = detailBlocks.length > 0
          ? detailBlocks.join('')
          : '<div style="color:var(--text-muted);font-size:0.85rem;">No additional session details available for this submission.</div>';

        return [
          `
            <tr>
              <td><b>${escapeHtml(sub.student_name)}</b> (${escapeHtml(sub.student_form || '—')})</td>
              <td>${escapeHtml(sub.assignment_title || '—')}</td>
              <td>${statusBadge}</td>
              <td>${answerText}</td>
              <td>${resultText}</td>
              <td>${new Date(sub.submitted_at).toLocaleDateString()}</td>
              <td>
                ${actionBtn}
                <button class="btn" onclick="toggleSubmissionDetail(${sub.submission_id})" style="margin-left:6px;padding:4px 10px;font-size:0.76rem;">Details</button>
                ${feedbackText}
              </td>
            </tr>
          `,
          `
            <tr id="submission-detail-${sub.submission_id}" style="display:none;">
              <td colspan="8" style="background:var(--card-bg-hover);">
                <div style="padding:12px 14px;font-size:0.84rem;line-height:1.7;">${detailsHtml}</div>
              </td>
            </tr>
          `
        ];
      }).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th style="width:20%;">Student & Form</th>
                <th style="width:22%;">Assignment Title</th>
                <th style="width:14%;">Status</th>
                <th style="width:14%;">Student Score / Answer</th>
                <th style="width:10%;">Result</th>
                <th style="width:10%;">Submitted</th>
                <th style="width:10%;">Actions</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
  }

  async function markStudentSubmission(submissionId, studentName) {
    const feedback = prompt(`Approve and release marks for ${studentName}?\nEnter optional feedback for student (or leave blank):`, 'Good effort!');
    if (feedback === null) return;
    try {
      await Assignments.markSubmission(submissionId, feedback);
      alert(`✓ Submission marked and released to ${studentName}! The student can now view their grade on their dashboard.`);
      loadSubmittedAssignments();
    } catch (err) {
      alert('Could not mark submission: ' + (err.message || 'unknown error'));
    }
  }

  function toggleSubmissionDetail(submissionId) {
    const row = document.getElementById('submission-detail-' + submissionId);
    if (!row) return;
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  }

  function applyQ1Preset() {
    const preset = document.getElementById('cfgQ1Preset').value;
    const solA = document.getElementById('cfgQ1SolA');
    const solB = document.getElementById('cfgQ1SolB');
    const indicator = document.getElementById('cfgQ1Indicator');
    const ratioA = document.getElementById('cfgQ1RatioA');
    const ratioB = document.getElementById('cfgQ1RatioB');

    if (preset === 'acidBase_dibasic') {
      solA.value = '0.05M Sulfuric Acid (H₂SO₄)';
      solB.value = 'Sodium Hydroxide (NaOH) approx 0.10M';
      indicator.value = 'phenolphthalein';
      ratioA.value = 1; ratioB.value = 2;
    } else if (preset === 'acidBase_tribasic') {
      solA.value = '0.033M Phosphoric Acid (H₃PO₄)';
      solB.value = 'Sodium Hydroxide (NaOH) approx 0.10M';
      indicator.value = 'phenolphthalein';
      ratioA.value = 1; ratioB.value = 3;
    } else if (preset === 'weakAcid') {
      solA.value = '0.10M Ethanoic Acid (CH₃COOH)';
      solB.value = 'Sodium Hydroxide (NaOH) approx 0.10M';
      indicator.value = 'phenolphthalein';
      ratioA.value = 1; ratioB.value = 1;
    } else if (preset === 'weakBase') {
      solA.value = '0.10M Hydrochloric Acid (HCl)';
      solB.value = 'Ammonia Solution (NH₃ aq) approx 0.10M';
      indicator.value = 'methylOrange';
      ratioA.value = 1; ratioB.value = 1;
    } else if (preset === 'carbonate') {
      solA.value = '0.10M Hydrochloric Acid (HCl)';
      solB.value = 'Sodium Carbonate (Na₂CO₃) approx 0.05M';
      indicator.value = 'methylOrange';
      ratioA.value = 2; ratioB.value = 1;
    } else if (preset === 'redox_kmnO4') {
      solA.value = '0.02M Potassium Manganate(VII) (KMnO₄)';
      solB.value = 'Iron(II) Sulfate (FeSO₄) approx 0.10M';
      indicator.value = 'phenolphthalein';
      ratioA.value = 1; ratioB.value = 5;
    } else {
      solA.value = '0.10M Hydrochloric Acid (HCl)';
      solB.value = 'Sodium Hydroxide (NaOH) approx 0.10M';
      indicator.value = 'phenolphthalein';
      ratioA.value = 1; ratioB.value = 1;
    }
  }

  function toggleCompositeConfigPanel() {
    const type = document.getElementById('aType').value;
    const panel = document.getElementById('kcseCompositeConfigPanel');
    if (panel) {
      panel.style.display = (type === 'kcseComposite') ? 'block' : 'none';
    }
  }

  function applySeriesPreset() {
    const sel = document.getElementById('cfgSeriesPreset').value;
    if (sel === 'series_1') {
      document.getElementById('cfgQ1SolA').value = '0.100 M Hydrochloric Acid (HCl)';
      document.getElementById('cfgQ1SolB').value = 'Sodium Hydroxide (NaOH) 4.00 g/dm³';
      document.getElementById('cfgQ1RatioA').value = 1;
      document.getElementById('cfgQ1RatioB').value = 1;
      document.getElementById('cfgQ1Indicator').value = 'phenolphthalein';
      document.getElementById('cfgQ2Salt').value = 'Pb(NO3)2';
      document.getElementById('cfgQ3Organic').value = 'Ethanol';
    } else if (sel === 'series_2') {
      document.getElementById('cfgQ1SolA').value = '0.100 M Hydrochloric Acid (HCl)';
      document.getElementById('cfgQ1SolB').value = 'Sodium Carbonate (Na₂CO₃) 5.30 g/dm³';
      document.getElementById('cfgQ1RatioA').value = 2;
      document.getElementById('cfgQ1RatioB').value = 1;
      document.getElementById('cfgQ1Indicator').value = 'methylOrange';
      document.getElementById('cfgQ2Salt').value = 'FeSO4';
      document.getElementById('cfgQ3Organic').value = 'Ethanoic Acid';
    } else if (sel === 'series_3') {
      document.getElementById('cfgQ1SolA').value = '0.020 M Potassium Manganate(VII) (KMnO₄)';
      document.getElementById('cfgQ1SolB').value = 'Acidified Iron(II) Sulfate 39.2 g/dm³';
      document.getElementById('cfgQ1RatioA').value = 1;
      document.getElementById('cfgQ1RatioB').value = 5;
      document.getElementById('cfgQ1Indicator').value = 'phenolphthalein';
      document.getElementById('cfgQ2Salt').value = 'ZnSO4';
      document.getElementById('cfgQ3Organic').value = 'Ethanol';
    } else if (sel === 'series_4') {
      document.getElementById('cfgQ1SolA').value = '1.00 M Nitric Acid (HNO₃)';
      document.getElementById('cfgQ1SolB').value = '1.00 M Potassium Hydroxide (KOH)';
      document.getElementById('cfgQ1RatioA').value = 1;
      document.getElementById('cfgQ1RatioB').value = 1;
      document.getElementById('cfgQ1Indicator').value = 'phenolphthalein';
      document.getElementById('cfgQ2Salt').value = 'CuSO4';
      document.getElementById('cfgQ3Organic').value = 'Ethanol';
    } else if (sel === 'series_5') {
      document.getElementById('cfgQ1SolA').value = '0.050 M Sulfuric Acid (H₂SO₄)';
      document.getElementById('cfgQ1SolB').value = '0.100 M Sodium Hydroxide (NaOH)';
      document.getElementById('cfgQ1RatioA').value = 1;
      document.getElementById('cfgQ1RatioB').value = 2;
      document.getElementById('cfgQ1Indicator').value = 'phenolphthalein';
      document.getElementById('cfgQ2Salt').value = 'ZnSO4';
      document.getElementById('cfgQ3Organic').value = 'Ethanoic Acid';
    } else if (sel === 'series_6') {
      document.getElementById('cfgQ1SolA').value = '0.100 M Ethanedioic Acid (H₂C₂O₄)';
      document.getElementById('cfgQ1SolB').value = '0.200 M Sodium Hydroxide (NaOH)';
      document.getElementById('cfgQ1RatioA').value = 1;
      document.getElementById('cfgQ1RatioB').value = 2;
      document.getElementById('cfgQ1Indicator').value = 'phenolphthalein';
      document.getElementById('cfgQ2Salt').value = 'CaCl2';
      document.getElementById('cfgQ3Organic').value = 'Ethanoic Acid';
    }
  }

  async function saveAssignment() {
    const editingId = document.getElementById('aEditingId').value;
    const title = document.getElementById('aTitle').value.trim();
    const titrationType = document.getElementById('aType').value;
    const instructions = document.getElementById('aInstructions').value.trim();
    const dueDate = document.getElementById('aDue').value;
    const msg = document.getElementById('assignMsg');
    msg.innerHTML = '';

    if (!title) {
      msg.innerHTML = '<div class="msg msg-err">Please enter a title.</div>';
      return;
    }

    let examConfig = null;
    if (titrationType === 'kcseComposite') {
      const seriesSelect = document.getElementById('cfgSeriesPreset');
      examConfig = {
        presetKey: seriesSelect ? seriesSelect.value : 'series_1',
        q1: {
          solutionA: document.getElementById('cfgQ1SolA').value,
          solutionB: document.getElementById('cfgQ1SolB').value,
          ratioA: parseInt(document.getElementById('cfgQ1RatioA').value, 10) || 1,
          ratioB: parseInt(document.getElementById('cfgQ1RatioB').value, 10) || 1,
          pipetteVolume: parseFloat(document.getElementById('cfgQ1Pipette').value) || 25.0,
          indicator: document.getElementById('cfgQ1Indicator').value
        },
        q2: {
          salt: document.getElementById('cfgQ2Salt').value
        },
        q3: {
          organic: document.getElementById('cfgQ3Organic').value
        }
      };
    }

    const payload = {
      title,
      titrationType,
      instructions,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      examConfig
    };
    try {
      msg.innerHTML = '<div class="msg">' + (editingId ? 'Updating…' : 'Creating…') + '</div>';
      if (editingId) {
        await Assignments.update(editingId, payload);
        msg.innerHTML = '<div class="msg msg-ok">Assignment updated.</div>';
      } else {
        await Assignments.create(payload);
        msg.innerHTML = '<div class="msg msg-ok">Assignment created.</div>';
      }
      cancelEdit();
      loadTeacherAssignments();
      loadSubmittedAssignments();
    } catch (err) {
      if (err.message && err.message.includes('requires a teacher account')) {
        msg.innerHTML = `
          <div class="msg msg-err" style="display:flex; flex-direction:column; gap:8px; padding:12px 14px; text-align:left;">
            <div>❌ <b>Session Mismatch:</b> Your browser currently has a <b>Student</b> session active.</div>
            <div style="font-size:0.84rem; color:var(--text-muted);">Please log out and sign in with your <b>Teacher</b> account credentials to create practical assignments.</div>
            <button type="button" class="btn" style="background:var(--blue-bg); color:var(--blue-accent); border:1px solid var(--blue-border); font-weight:700; width:fit-content; margin-top:4px;" onclick="Auth.logout()">Log out &amp; Open Teacher Login →</button>
          </div>
        `;
        return;
      }
      msg.innerHTML = '<div class="msg msg-err">' + escapeHtml(err.message || 'Could not save assignment.') + '</div>';
    }
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

  async function loadLeaderboard() {
    const box = document.getElementById('leaderboardBox');
    try {
      const data = await Leaderboard.getClass();
      const ranked = data.ranked || [];

      if (ranked.length === 0) {
        box.innerHTML = `<div class="empty">No students have reached ${data.minSessionsRequired}+ sessions yet.</div>`;
        return;
      }

      const rows = ranked.map(r => `
        <tr>
          <td class="lb-rank">#${r.rank}</td>
          <td>${escapeHtml(r.name)}</td>
          <td>${escapeHtml(r.form || '—')}</td>
          <td>${r.accuracyPct}%</td>
          <td>${r.totalSessions}</td>
        </tr>
      `).join('');

      box.innerHTML = `
        <div class="table-responsive">
          <table>
            <thead><tr><th>Rank</th><th>Student</th><th>Form</th><th>Accuracy</th><th>Sessions</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load leaderboard: ' + escapeHtml(err.message) + '</div>';
    }
  }

  loadSessions();
  async function loadStudents() {
    const box = document.getElementById('studentsList');
    try {
      const data = await Students.getClass();
      const students = data.students || [];

      if (students.length === 0) {
        box.innerHTML = '<div class="empty">No students linked yet. Share your teacher code so students can link their accounts at registration.</div>';
        return;
      }

      box.innerHTML = students.map(s => `
        <div class="student-item" style="cursor:pointer;" onclick="openStudentDrilldown(${s.id})">
          <div class="info">
            <div class="s-name" style="color:var(--heading-color);">📊 ${escapeHtml(s.name)}</div>
            <div class="s-meta">${escapeHtml(s.email)} · ${escapeHtml(s.form || '—')}</div>
          </div>
          <div style="display:flex;gap:8px;" onclick="event.stopPropagation()">
            <button class="btn" onclick="openStudentDrilldown(${s.id})">👁️ View Performance</button>
            <button class="btn" onclick="resetStudentPw(${s.id}, '${escapeHtml(s.name).replace(/'/g, "\\'")}')">Reset Password</button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load students: ' + escapeHtml(err.message) + '</div>';
    }
  }

  /* ── Student Performance Drill-Down Modal ── */
  async function openStudentDrilldown(studentId) {
    let modal = document.getElementById('studentDrilldownModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'studentDrilldownModal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-card">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--card-border);padding-bottom:12px;margin-bottom:16px;">
          <h2 style="font-size:1.15rem;margin:0;color:var(--heading-color);">📊 Student Performance Drill-Down</h2>
          <button class="btn" onclick="closeStudentDrilldown()" style="padding:4px 10px;">✕ Close</button>
        </div>
        <div id="drilldownContent"><div class="empty">Loading student history…</div></div>
      </div>
    `;

    try {
      const data = await Students.getDrilldown(studentId);
      const student = data.student;
      const metrics = data.metrics;
      const titrations = data.titrationSessions || [];
      const qualitative = data.qualitativeSessions || [];
      const organic = data.organicSessions || [];
      const solubility = data.solubilitySessions || [];
      const energy = data.energySessions || [];
      const rates = data.ratesSessions || [];
      const gas = data.gasSessions || [];
      const composite = data.compositeSessions || [];
      const badges = data.badges || [];
      const durationMins = Math.round(metrics.totalDurationSeconds / 60);

      document.getElementById('drilldownContent').innerHTML = `
        <div style="background:var(--card-bg-hover);border:1px solid var(--card-border);border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="font-size:1.1rem;font-weight:700;color:var(--heading-color);">${escapeHtml(student.name)}</div>
          <div style="font-size:0.83rem;color:var(--text-muted);margin-top:2px;">${escapeHtml(student.email)} · ${escapeHtml(student.form || 'Form —')}</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
          <div style="background:var(--blue-bg);border:1px solid var(--blue-accent);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:800;color:var(--blue-accent);">${metrics.totalSessions}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">Total Practicals</div>
          </div>
          <div style="background:var(--green-bg);border:1px solid var(--green-accent);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:800;color:var(--green-accent);">${metrics.overallAccuracy}%</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">Overall Accuracy</div>
          </div>
          <div style="background:var(--card-bg-hover);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:800;color:var(--heading-color);">${durationMins} m</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">Time Spent</div>
          </div>
          <div style="background:var(--card-bg-hover);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:800;color:var(--heading-color);">${metrics.badgesCount}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">Badges Unlocked</div>
          </div>
        </div>

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">🧪 Titration Practicals (${titrations.length})</h3>
        ${titrations.length === 0 ? '<div class="empty" style="padding:12px;">No titration sessions recorded</div>' : `
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--card-border);border-radius:10px;margin-bottom:20px;">
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
              <thead><tr style="background:var(--card-bg-hover);text-align:left;"><th style="padding:8px 12px;">Type</th><th style="padding:8px 12px;">Mode</th><th style="padding:8px 12px;">Result</th><th style="padding:8px 12px;">Date</th></tr></thead>
              <tbody>
                ${titrations.map(t => `
                  <tr style="border-bottom:1px solid var(--card-border);">
                    <td style="padding:8px 12px;">${escapeHtml(t.titration_type)}</td>
                    <td style="padding:8px 12px;">${escapeHtml(t.mode || 'free')}</td>
                    <td style="padding:8px 12px;color:${t.correct ? 'var(--green-accent)' : 'var(--red-accent)'};">${t.correct ? '✓ Correct' : '✗ Incorrect'}</td>
                    <td style="padding:8px 12px;">${new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">🧫 Qualitative Salt Practicals (${qualitative.length})</h3>
        ${qualitative.length === 0 ? '<div class="empty" style="padding:12px;">No qualitative sessions recorded</div>' : `
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--card-border);border-radius:10px;margin-bottom:20px;">
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
              <thead><tr style="background:var(--card-bg-hover);text-align:left;"><th style="padding:8px 12px;">Salt</th><th style="padding:8px 12px;">Student Cation/Anion</th><th style="padding:8px 12px;">Result</th><th style="padding:8px 12px;">Date</th></tr></thead>
              <tbody>
                ${qualitative.map(q => `
                  <tr style="border-bottom:1px solid var(--card-border);">
                    <td style="padding:8px 12px;">${escapeHtml(q.salt_name || q.salt_key)}</td>
                    <td style="padding:8px 12px;">${escapeHtml(q.student_cation)} / ${escapeHtml(q.student_anion)}</td>
                    <td style="padding:8px 12px;color:${q.correct ? 'var(--green-accent)' : 'var(--red-accent)'};">${q.correct ? '✓ Identified' : '✗ Incorrect'}</td>
                    <td style="padding:8px 12px;">${new Date(q.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">⚗️ Organic Chemistry Practicals (${organic.length})</h3>
        ${organic.length === 0 ? '<div class="empty" style="padding:12px;">No organic chemistry sessions recorded</div>' : `
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--card-border);border-radius:10px;margin-bottom:20px;">
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
              <thead><tr style="background:var(--card-bg-hover);text-align:left;"><th style="padding:8px 12px;">Compound</th><th style="padding:8px 12px;">Functional Group</th><th style="padding:8px 12px;">Score</th><th style="padding:8px 12px;">Date</th></tr></thead>
              <tbody>
                ${organic.map(o => `
                  <tr style="border-bottom:1px solid var(--card-border);">
                    <td style="padding:8px 12px;">${escapeHtml(o.compound_name || o.compound_key)}</td>
                    <td style="padding:8px 12px;">${escapeHtml(o.student_functional_group || '—')}</td>
                    <td style="padding:8px 12px;color:${o.functional_group_correct ? 'var(--green-accent)' : 'var(--red-accent)'};">${o.functional_group_correct ? '✓ Match' : '✗ Mismatch'}</td>
                    <td style="padding:8px 12px;">${new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">🌡️ Solubility Curves Practicals (${solubility.length})</h3>
        ${solubility.length === 0 ? '<div class="empty" style="padding:12px;">No solubility sessions recorded</div>' : `
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--card-border);border-radius:10px;margin-bottom:20px;">
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
              <thead><tr style="background:var(--card-bg-hover);text-align:left;"><th style="padding:8px 12px;">Solute</th><th style="padding:8px 12px;">Cryst. Temp</th><th style="padding:8px 12px;">Score (5m)</th><th style="padding:8px 12px;">Date</th></tr></thead>
              <tbody>
                ${solubility.map(s => `
                  <tr style="border-bottom:1px solid var(--card-border);">
                    <td style="padding:8px 12px;">${escapeHtml(s.solute_name || s.solute_key)}</td>
                    <td style="padding:8px 12px;">${s.crystallization_temp || 0} °C (Δ ${s.temp_difference || 0}°C)</td>
                    <td style="padding:8px 12px;font-weight:700;color:${parseFloat(s.total_score || 0) >= 3 ? 'var(--green-accent)' : 'var(--amber-accent)'};">${Number(s.total_score || 0).toFixed(1)} / 5.0</td>
                    <td style="padding:8px 12px;">${new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">🔥 Energy Changes Practicals (${energy.length})</h3>
        ${energy.length === 0 ? '<div class="empty" style="padding:12px;">No energy changes sessions recorded</div>' : `
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--card-border);border-radius:10px;margin-bottom:20px;">
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
              <thead><tr style="background:var(--card-bg-hover);text-align:left;"><th style="padding:8px 12px;">System</th><th style="padding:8px 12px;">Molar ΔH</th><th style="padding:8px 12px;">Score (15m)</th><th style="padding:8px 12px;">Date</th></tr></thead>
              <tbody>
                ${energy.map(e => `
                  <tr style="border-bottom:1px solid var(--card-border);">
                    <td style="padding:8px 12px;">${escapeHtml(e.system_name || e.system_id)}</td>
                    <td style="padding:8px 12px;">${e.molar_enthalpy || 0} kJ/mol</td>
                    <td style="padding:8px 12px;font-weight:700;color:${parseFloat(e.total_score || 0) >= 8 ? 'var(--green-accent)' : 'var(--red-accent)'};">${Number(e.total_score || 0).toFixed(1)} / 15.0</td>
                    <td style="padding:8px 12px;">${new Date(e.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">⚡ Reaction Rates & Kinetics (${rates.length})</h3>
        ${rates.length === 0 ? '<div class="empty" style="padding:12px;">No reaction rates sessions recorded</div>' : `
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--card-border);border-radius:10px;margin-bottom:20px;">
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
              <thead><tr style="background:var(--card-bg-hover);text-align:left;"><th style="padding:8px 12px;">Experiment</th><th style="padding:8px 12px;">Score Breakdown</th><th style="padding:8px 12px;">Score (15m)</th><th style="padding:8px 12px;">Date</th></tr></thead>
              <tbody>
                ${rates.map(r => `
                  <tr style="border-bottom:1px solid var(--card-border);">
                    <td style="padding:8px 12px;">${escapeHtml(r.experiment_title || r.experiment_type)}</td>
                    <td style="padding:8px 12px;font-size:0.75rem;">Table: ${Number(r.table_score || 0).toFixed(1)}/5 · Graph: ${Number(r.graph_score || 0).toFixed(1)}/4 · Calc: ${Number(r.calc_score || 0).toFixed(1)}/6</td>
                    <td style="padding:8px 12px;font-weight:700;color:${parseFloat(r.total_score || 0) >= 8 ? 'var(--green-accent)' : 'var(--red-accent)'};">${Number(r.total_score || 0).toFixed(1)} / 15.0 (${escapeHtml(r.grade || '—')})</td>
                    <td style="padding:8px 12px;">${new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">💨 Gas Preparation & Confirmatory Practicals (${gas.length})</h3>
        ${gas.length === 0 ? '<div class="empty" style="padding:12px;">No gas preparation sessions recorded</div>' : `
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--card-border);border-radius:10px;margin-bottom:20px;">
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
              <thead><tr style="background:var(--card-bg-hover);text-align:left;"><th style="padding:8px 12px;">Gas Synthesized</th><th style="padding:8px 12px;">Drying / Collection</th><th style="padding:8px 12px;">Score (10m)</th><th style="padding:8px 12px;">Date</th></tr></thead>
              <tbody>
                ${gas.map(g => `
                  <tr style="border-bottom:1px solid var(--card-border);">
                    <td style="padding:8px 12px;font-weight:700;">${escapeHtml(g.gas_name || g.gas_key || '—')}</td>
                    <td style="padding:8px 12px;font-size:0.75rem;">Drying: ${escapeHtml(g.drying_agent || '—')} (${g.drying_correct ? '✓' : '✗'}) · Coll: ${escapeHtml(g.collection_method || '—')} (${g.collection_correct ? '✓' : '✗'})</td>
                    <td style="padding:8px 12px;font-weight:700;color:${parseFloat(g.total_score || 0) >= 6 ? 'var(--green-accent)' : 'var(--red-accent)'};">${Number(g.total_score || 0).toFixed(1)} / 10.0</td>
                    <td style="padding:8px 12px;">${new Date(g.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">📋 Composite Practical Exams (${composite.length})</h3>
        ${composite.length === 0 ? '<div class="empty" style="padding:12px;">No composite exams completed</div>' : `
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--card-border);border-radius:10px;margin-bottom:20px;">
            <table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
              <thead><tr style="background:var(--card-bg-hover);text-align:left;"><th style="padding:8px 12px;">Exam</th><th style="padding:8px 12px;">Score Breakdown</th><th style="padding:8px 12px;">Total (40m)</th><th style="padding:8px 12px;">Date</th></tr></thead>
              <tbody>
                ${composite.map(c => `
                  <tr style="border-bottom:1px solid var(--card-border);">
                    <td style="padding:8px 12px;">${escapeHtml(c.exam_title || 'KCSE Mock Exam')}</td>
                    <td style="padding:8px 12px;font-size:0.75rem;">Q1: ${c.q1_score || 0}/15 · Q2: ${c.q2_score || 0}/15 · Q3: ${c.q3_score || 0}/10</td>
                    <td style="padding:8px 12px;font-weight:800;color:${parseFloat(c.total_score || 0) >= 20 ? 'var(--green-accent)' : 'var(--red-accent)'};">${Number(c.total_score || 0).toFixed(1)} (${c.grade || '—'})</td>
                    <td style="padding:8px 12px;">${new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <h3 style="font-size:0.95rem;color:var(--heading-color);margin:16px 0 10px;">🏆 Badges Earned</h3>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          ${badges.length === 0 ? '<div class="empty" style="padding:12px;width:100%;">No badges earned yet</div>' : badges.map(b => `
            <div style="display:flex;align-items:center;gap:8px;background:var(--card-bg-hover);border:1px solid var(--card-border);border-radius:8px;padding:6px 12px;font-size:0.8rem;">
              <span>${b.icon || '🏅'}</span>
              <b>${escapeHtml(b.badge_title)}</b>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      document.getElementById('drilldownContent').innerHTML = '<div class="empty">Could not load student profile: ' + escapeHtml(err.message) + '</div>';
    }
  }

  function closeStudentDrilldown() {
    const modal = document.getElementById('studentDrilldownModal');
    if (modal) modal.style.display = 'none';
  }

  async function resetStudentPw(studentId, studentName) {
    if (!confirm('Reset the password for ' + studentName + '? Their old password will stop working immediately.')) {
      return;
    }
    try {
      const result = await Auth.resetStudentPassword(studentId);
      alert(
        'Password reset for ' + result.studentName + '.\n\n' +
        'Temporary password: ' + result.temporaryPassword + '\n\n' +
        'Give this to the student directly. They can change it themselves after logging in.'
      );
    } catch (err) {
      alert('Could not reset password: ' + (err.message || 'unknown error'));
    }
  }

  // Password panel is now inside the Settings tab — accessed via switchTeacherTab('paneSettings')

  async function submitChangePassword() {
    const currentPassword = document.getElementById('pwCurrent').value;
    const newPassword = document.getElementById('pwNew').value;
    const msg = document.getElementById('pwMsg');
    msg.innerHTML = '';

    if (!currentPassword || !newPassword) {
      msg.innerHTML = '<div class="msg msg-err">Both fields are required.</div>';
      return;
    }
    try {
      msg.innerHTML = '<div class="msg">Updating…</div>';
      await Auth.changePassword(currentPassword, newPassword);
      msg.innerHTML = '<div class="msg msg-ok">Password updated.</div>';
      document.getElementById('pwCurrent').value = '';
      document.getElementById('pwNew').value = '';
    } catch (err) {
      msg.innerHTML = '<div class="msg msg-err">' + escapeHtml(err.message || 'Could not update password.') + '</div>';
    }
  }

  async function loadClassBadges() {
    const box = document.getElementById('classBadgesList');
    if (!box) return;
    try {
      const data = await Badges.getClass();
      const classBadges = data.students || data.classBadges || [];

      if (classBadges.length === 0) {
        box.innerHTML = '<div class="empty">No students linked yet. Share your teacher code so students can link their accounts at registration.</div>';
        return;
      }

      box.innerHTML = classBadges.map(c => {
        const studentName = c.student ? c.student.name : (c.name || 'Student');
        const unlockedBadges = (c.badges || []).filter(b => b.unlocked);
        const tooltip = unlockedBadges.map(b => b.name).join(', ') || 'No badges unlocked yet';

        return `
          <div class="cb-row" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--card-border);">
            <div class="cb-name" style="font-weight:700;color:var(--heading-color);">${escapeHtml(studentName)}</div>
            <div class="cb-icons" title="${escapeHtml(tooltip)}" style="display:flex;gap:6px;font-size:1.1rem;">
              ${(c.badges || []).map(b => `<span class="${b.unlocked ? 'unlocked' : ''}" style="opacity:${b.unlocked ? '1' : '0.25'}">${b.icon}</span>`).join('')}
            </div>
            <div class="cb-count" style="font-weight:800;font-size:0.85rem;color:var(--cyan-accent);">${c.unlockedCount ?? 0}/${c.totalBadges ?? 6}</div>
          </div>
        `;
      }).join('');
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load class badges: ' + escapeHtml(err.message) + '</div>';
    }
  }

  loadStudents();
  let trendChartInstance = null;
  let typeChartInstance = null;
  let lastAnalyticsData = null;

  // Reads current theme's actual colors from CSS variables so chart
  // colors match whichever of the three themes is active, rather
  // than hardcoding one palette that would look wrong in dark/green.
  function themeColor(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  async function loadAnalytics() {
    const statStrip = document.getElementById('statStrip');
    try {
      const data = await Analytics.getClass();
      lastAnalyticsData = data;

      const s = data.summary;
      statStrip.innerHTML = `
        <div class="stat-card"><div class="stat-value">${s.totalSessions}</div><div class="stat-label">Total sessions</div></div>
        <div class="stat-card"><div class="stat-value">${s.overallAccuracyPct}%</div><div class="stat-label">Overall accuracy</div></div>
        <div class="stat-card"><div class="stat-value">${s.activeStudents}</div><div class="stat-label">Active students</div></div>
      `;

      renderTrendChart(data.accuracyOverTime);
      renderTypeChart(data.byType);
    } catch (err) {
      statStrip.innerHTML = '<div class="empty">Could not load analytics: ' + escapeHtml(err.message) + '</div>';
    }
  }

  function renderTrendChart(accuracyOverTime) {
    const wrap = document.getElementById('trendChartWrap');
    if (trendChartInstance) { trendChartInstance.destroy(); trendChartInstance = null; }

    if (!accuracyOverTime || accuracyOverTime.length === 0) {
      wrap.innerHTML = '<div class="empty">No sessions in the last 30 days yet.</div>';
      return;
    }
    if (!wrap.querySelector('canvas')) {
      wrap.innerHTML = '<canvas id="trendChart"></canvas>';
    }

    const ink = themeColor('--ink-soft');
    const line = themeColor('--line');
    const teal = themeColor('--teal');

    const ctx = document.getElementById('trendChart').getContext('2d');
    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: accuracyOverTime.map(d => new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Accuracy %',
          data: accuracyOverTime.map(d => d.accuracyPct),
          borderColor: teal,
          backgroundColor: teal + '33',
          fill: true,
          tension: 0.3,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, ticks: { color: ink }, grid: { color: line } },
          x: { ticks: { color: ink }, grid: { color: line } }
        }
      }
    });
  }

  function renderTypeChart(byType) {
    const wrap = document.getElementById('typeChartWrap');
    if (typeChartInstance) { typeChartInstance.destroy(); typeChartInstance = null; }

    if (!byType || byType.length === 0) {
      wrap.innerHTML = '<div class="empty">No sessions recorded yet.</div>';
      return;
    }
    if (!wrap.querySelector('canvas')) {
      wrap.innerHTML = '<canvas id="typeChart"></canvas>';
    }

    const typeLabels = {
      acidBase: 'Acid-Base',
      redox: 'Redox',
      precipitation: 'Precipitation',
      complexometric: 'Complexometric',
      dibasic: 'Dibasic Acid',
      tribasic: 'Tribasic Acid',
      weakAcid: 'Weak Acid',
      weakBase: 'Weak Base'
    };

    const ink = themeColor('--ink-soft');
    const line = themeColor('--line');
    const teal = themeColor('--teal');
    const amber = themeColor('--amber');

    const ctx = document.getElementById('typeChart').getContext('2d');
    typeChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: byType.map(d => typeLabels[d.titrationType] || d.titrationType),
        datasets: [
          {
            label: 'Sessions',
            data: byType.map(d => d.totalSessions),
            backgroundColor: teal,
            yAxisID: 'y'
          },
          {
            label: 'Accuracy %',
            data: byType.map(d => d.accuracyPct),
            backgroundColor: amber,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: ink } } },
        scales: {
          y: { position: 'left', beginAtZero: true, ticks: { color: ink }, grid: { color: line } },
          y1: { position: 'right', beginAtZero: true, max: 100, ticks: { color: ink }, grid: { display: false } },
          x: { ticks: { color: ink }, grid: { display: false } }
        }
      }
    });
  }

  function reRenderCharts() {
    // Called after a theme switch. Colors are read fresh from CSS
    // variables, so this just needs to re-run the render functions
    // with the data already fetched — no need to re-hit the API.
    if (lastAnalyticsData) {
      renderTrendChart(lastAnalyticsData.accuracyOverTime);
      renderTypeChart(lastAnalyticsData.byType);
    }
  }

  loadAnalytics();
  loadClassBadges();
  loadLeaderboard();
  loadTeacherAssignments();
  loadSubmittedAssignments();
  loadQualitativeSessions();
  loadOrganicSessions();
  loadCompositeSessions();

  let compositeSessionsStore = [];
  async function loadCompositeSessions() {
    const box = document.getElementById('compositeSessionsBox');
    if (!box) return;
    try {
      const res = await Composite.getTeacherList();
      compositeSessionsStore = res.sessions || [];

      if (compositeSessionsStore.length === 0) {
        box.innerHTML = '<div class="empty">No KCSE composite practical exams submitted yet.</div>';
        return;
      }

      // Compute class analytics across all submitted composite exams
      const totalCount = compositeSessionsStore.length;
      let sumQ1 = 0, sumQ2 = 0, sumQ3 = 0, sumTotal = 0;
      let gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };

      compositeSessionsStore.forEach(s => {
        const q1 = Number(s.q1_score) || 0;
        const q2 = Number(s.q2_score) || 0;
        const q3 = Number(s.q3_score) || 0;
        const tot = Number(s.total_score) || 0;

        sumQ1 += q1;
        sumQ2 += q2;
        sumQ3 += q3;
        sumTotal += tot;

        const pct = (tot / 40.0) * 100;
        if (pct >= 70) gradeCounts.A++;
        else if (pct >= 55) gradeCounts.B++;
        else if (pct >= 45) gradeCounts.C++;
        else if (pct >= 35) gradeCounts.D++;
        else gradeCounts.E++;
      });

      const avgQ1 = (sumQ1 / totalCount).toFixed(1);
      const avgQ2 = (sumQ2 / totalCount).toFixed(1);
      const avgQ3 = (sumQ3 / totalCount).toFixed(1);
      const avgTotal = (sumTotal / totalCount).toFixed(1);
      const avgPct = Math.round((sumTotal / totalCount / 40.0) * 100);

      const analyticsBanner = `
        <div style="background:var(--card-bg-hover);border:1.5px solid var(--gold-accent);border-radius:14px;padding:16px 20px;margin-bottom:16px;">
          <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:1.0rem;color:var(--gold-accent);margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
            <span>📊 KCSE Paper 3 Class Performance Summary (${totalCount} Candidates)</span>
            <span style="font-size:0.9rem;color:var(--heading-color);">Class Average: <b>${avgTotal} / 40.0 Marks (${avgPct}%)</b></span>
          </div>

          <!-- Question Averages Row -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;margin-bottom:12px;">
            <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px;text-align:center;">
              <div style="font-size:0.75rem;color:var(--text-muted);">Q1 Titration Avg</div>
              <div style="font-size:1.15rem;font-weight:800;color:var(--blue-accent);">${avgQ1} / 15.0 Marks</div>
            </div>
            <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px;text-align:center;">
              <div style="font-size:0.75rem;color:var(--text-muted);">Q2 Salt Analysis Avg</div>
              <div style="font-size:1.15rem;font-weight:800;color:var(--green-accent);">${avgQ2} / 15.0 Marks</div>
            </div>
            <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px;text-align:center;">
              <div style="font-size:0.75rem;color:var(--text-muted);">Q3 Organic Analysis Avg</div>
              <div style="font-size:1.15rem;font-weight:800;color:var(--gold-accent);">${avgQ3} / 10.0 Marks</div>
            </div>
          </div>

          <!-- Grade Distribution Badges -->
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:0.8rem;">
            <span style="font-weight:700;color:var(--text-muted);">Grade Distribution:</span>
            <span class="pill pill-ok" style="font-weight:800;">Grade A: ${gradeCounts.A}</span>
            <span class="pill" style="border:1px solid var(--blue-accent);color:var(--blue-accent);font-weight:800;">Grade B: ${gradeCounts.B}</span>
            <span class="pill" style="border:1px solid var(--gold-accent);color:var(--gold-accent);font-weight:800;">Grade C: ${gradeCounts.C}</span>
            <span class="pill pill-warn" style="font-weight:800;">Grade D: ${gradeCounts.D}</span>
            <span class="pill" style="border:1px solid var(--red-accent);color:var(--red-accent);font-weight:800;">Grade E: ${gradeCounts.E}</span>
          </div>
        </div>
      `;

      const rows = compositeSessionsStore.map((s, idx) => {
        const q1 = Number(s.q1_score).toFixed(1);
        const q2 = Number(s.q2_score).toFixed(1);
        const q3 = Number(s.q3_score).toFixed(1);
        const tot = Number(s.total_score).toFixed(1);
        const pct = Math.round((Number(s.total_score) / 40.0) * 100);
        const gradeColor = pct >= 70 ? 'var(--green-accent)' : pct >= 55 ? 'var(--blue-accent)' : pct >= 45 ? 'var(--gold-accent)' : 'var(--red-accent)';

        return `
          <tr>
            <td><b>${escapeHtml(s.student_name || '—')}</b></td>
            <td>${escapeHtml(s.student_form || 'Form 4')}</td>
            <td>${escapeHtml(s.exam_title || 'KCSE Paper 3 Practical Exam')}</td>
            <td><span style="font-weight:700;color:var(--text-main);">${q1} / 15.0</span></td>
            <td><span style="font-weight:700;color:var(--text-main);">${q2} / 15.0</span></td>
            <td><span style="font-weight:700;color:var(--text-main);">${q3} / 10.0</span></td>
            <td>
              <span class="pill" style="border:1px solid ${gradeColor};color:${gradeColor};font-weight:800;font-family:var(--font-heading);">
                ${tot} / 40.0 (${pct}% Grade ${s.grade || 'A'})
              </span>
            </td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-primary" style="padding:4px 10px;font-size:0.78rem;font-weight:700;" onclick="viewTeacherCompositeBooklet(${idx})">
                👁️ Booklet
              </button>
            </td>
          </tr>
        `;
      }).join('');

      box.innerHTML = `
        ${analyticsBanner}
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Form</th>
                <th>Exam Title</th>
                <th>Q1 Titration</th>
                <th>Q2 Salt ID</th>
                <th>Q3 Organic ID</th>
                <th>Total Score (40m)</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (err) {
      box.innerHTML = '<div class="empty">Could not load composite sessions: ' + escapeHtml(err.message) + '</div>';
    }
  }

  function viewTeacherCompositeBooklet(idx) {
    const s = compositeSessionsStore[idx];
    if (!s) return;

    let modal = document.getElementById('compositeBookletModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'compositeBookletModal';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }

    const q1 = Number(s.q1_score).toFixed(1);
    const q2 = Number(s.q2_score).toFixed(1);
    const q3 = Number(s.q3_score).toFixed(1);
    const tot = Number(s.total_score).toFixed(1);
    const pct = Math.round((Number(s.total_score) / 40.0) * 100);

    modal.innerHTML = `
      <div class="modal-card" style="max-width:850px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--card-border);padding-bottom:12px;margin-bottom:16px;">
          <div>
            <h2 style="font-size:1.15rem;margin:0 0 4px 0;color:var(--heading-color);font-family:var(--font-heading);font-weight:800;">🇰🇪 KCSE Chemistry Paper 3 Candidate Booklet</h2>
            <div style="font-size:0.82rem;color:var(--text-muted);">
              Candidate: <b>${escapeHtml(s.student_name || 'Student')}</b> (${escapeHtml(s.student_form || 'Form 4')}) &nbsp;·&nbsp; Exam: ${escapeHtml(s.exam_title || 'Mock Practical Exam')}
            </div>
          </div>
          <button class="btn" onclick="document.getElementById('compositeBookletModal').style.display='none'" style="padding:4px 12px;">✕ Close</button>
        </div>

        <div style="background:var(--card-bg-hover);border:1.5px solid var(--gold-accent);border-radius:12px;padding:16px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Final Mark Allocation</div>
            <div style="font-size:1.4rem;font-weight:900;color:var(--gold-accent);font-family:var(--font-heading);">
              ${tot} / 40.0 Marks (${pct}% — Grade ${s.grade || 'A'})
            </div>
          </div>
          <span class="pill pill-ok" style="font-size:0.9rem;padding:6px 16px;font-weight:800;">KCSE Paper 3 Verified</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:18px;">
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.78rem;color:var(--text-muted);">Q1 Volumetric Titration</div>
            <div style="font-size:1.2rem;font-weight:800;color:var(--blue-accent);margin-top:4px;">${q1} / 15.0 Marks</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.78rem;color:var(--text-muted);">Q2 Inorganic Salt Analysis</div>
            <div style="font-size:1.2rem;font-weight:800;color:var(--green-accent);margin-top:4px;">${q2} / 15.0 Marks</div>
          </div>
          <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px;text-align:center;">
            <div style="font-size:0.78rem;color:var(--text-muted);">Q3 Organic Functional Group</div>
            <div style="font-size:1.2rem;font-weight:800;color:var(--gold-accent);margin-top:4px;">${q3} / 10.0 Marks</div>
          </div>
        </div>

        <div style="font-size:0.83rem;color:var(--text-muted);line-height:1.5;">
          ✓ Session completed in <b>${s.duration_seconds ? Math.round(s.duration_seconds / 60) + ' minutes' : '45 minutes (standard time limit)'}</b>.<br>
          ✓ Exam submission archived and synced to student performance records.
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  // ── Auto-initialize Dashboard Sections ──────────────────────────
  loadSessions();
  loadStudents();
  loadClassBadges();
  loadTeacherAssignments();
  loadSubmittedAssignments();
  loadQualitativeSessions();
  loadOrganicSessions();
  loadSolubilitySessions();
  loadEnergySessions();
  loadRatesSessions();
  loadGasSessions();
  loadCompositeSessions();
  loadLeaderboard();
  loadAnalytics();

  // ── TEACHER NOTIFICATIONS ENGINE (24-Hour Expiration) ─────────────
  let teacherNotificationsList = [];

  window.toggleTeacherNotifDropdown = function(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  };

  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const bellBtn = document.getElementById('notifBellBtn');
    if (dropdown && dropdown.style.display === 'block') {
      if (!dropdown.contains(e.target) && (!bellBtn || !bellBtn.contains(e.target))) {
        dropdown.style.display = 'none';
      }
    }
  });

  window.updateTeacherNotificationsUI = function(submissions) {
    let rawList = (submissions || []).map(s => ({
      id: 'teacher_sub_' + (s.id || s.submission_id),
      studentName: s.student_name || 'Student',
      title: '📥 New Assignment Submission',
      message: `${s.student_name || 'Student'} submitted "${s.assignment_title || s.title || 'Practical Assignment'}".`,
      timestamp: s.submitted_at || s.created_at || Date.now(),
      raw: s
    }));

    teacherNotificationsList = rawList;

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
            <div style="font-size:0.84rem; font-weight:700; color:var(--heading-color);">No Active Notifications</div>
            <div style="font-size:0.75rem; margin-top:2px; line-height:1.4;">Read notices automatically expire after 24 hours.</div>
          </div>
        `;
        return;
      }

      list.innerHTML = activeNotifs.map(n => {
        const isRead = window.VLKNotifs ? window.VLKNotifs.isRead(n.id) : false;
        const hoursLeft = window.VLKNotifs ? window.VLKNotifs.getRemainingHours(n.id) : null;
        const timeAgo = window.VLKNotifs ? window.VLKNotifs.formatTimeAgo(n.timestamp) : '';

        return `
          <div class="notif-item ${isRead ? 'read-active' : 'unread'}" onclick="clickTeacherNotifItem('${n.id}')">
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
  };

  window.clickTeacherNotifItem = function(notifId) {
    if (window.VLKNotifs) window.VLKNotifs.markAsRead(notifId);
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.style.display = 'none';
    if (typeof switchTeacherTab === 'function') switchTeacherTab('paneAssignments');
    loadSubmittedAssignments();
  };

  window.markAllTeacherNotificationsRead = function() {
    const activeNotifs = window.VLKNotifs ? window.VLKNotifs.filterActiveNotifications(teacherNotificationsList) : [];
    if (window.VLKNotifs) {
      window.VLKNotifs.markAllAsRead(activeNotifs.map(n => n.id));
    }
    loadSubmittedAssignments();
  };

  // ── TEACHER PROFILE & ACCOUNT SETTINGS MANAGEMENT ────────────
  function loadTeacherProfile() {
    const user = getUser() || {};
    const nameEl = document.getElementById('tProfHeaderName');
    const emailEl = document.getElementById('tProfHeaderEmail');
    const inputName = document.getElementById('tProfInputName');
    const inputSchool = document.getElementById('tProfInputSchool');

    if (nameEl) nameEl.textContent = user.name || 'Teacher Instructor';
    if (emailEl) emailEl.textContent = user.email || 'teacher@virtulab.ke';
    if (inputName) inputName.value = user.name || '';
    if (inputSchool && user.schoolCode) inputSchool.value = user.schoolCode;
  }

  window.saveTeacherProfileDetails = function() {
    const newName = (document.getElementById('tProfInputName')?.value || '').trim();
    const newSchool = (document.getElementById('tProfInputSchool')?.value || '').trim();
    const msg = document.getElementById('tProfMsg');

    if (!newName) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">Full Name cannot be empty.</div>';
      return;
    }

    const user = getUser() || {};
    user.name = newName;
    user.schoolCode = newSchool;
    setUser(user);

    loadTeacherProfile();
    if (msg) msg.innerHTML = '<div class="msg msg-ok">✓ Instructor profile details updated successfully!</div>';
  };

  window.exportTeacherClassReportCSV = function() {
    const students = window.studentsStore || [];
    if (students.length === 0) {
      alert('No student roster data available to export.');
      return;
    }

    const headers = ['Student ID', 'Full Name', 'Form', 'Completed Sessions', 'Average Accuracy Score (%)'];
    const rows = students.map(s => [
      s.id || '—',
      `"${s.name || 'Student'}"`,
      `"${s.form || 'Form 4'}"`,
      s.sessions_count ?? 0,
      `"${s.avg_accuracy != null ? Math.round(s.avg_accuracy) + '%' : '0%'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `virtulab_class_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window.submitChangePassword = async function() {
    const currentPassword = document.getElementById('pwCurrent')?.value;
    const newPassword = document.getElementById('pwNew')?.value;
    const msg = document.getElementById('pwMsg');
    if (msg) msg.innerHTML = '';

    if (!currentPassword || !newPassword) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">Both fields required.</div>';
      return;
    }
    try {
      await Auth.changePassword(currentPassword, newPassword);
      if (msg) msg.innerHTML = '<div class="msg msg-ok">✓ Security password updated successfully.</div>';
    } catch (err) {
      if (msg) msg.innerHTML = '<div class="msg msg-err">' + escapeHtml(err.message) + '</div>';
    }
  };

  loadTeacherProfile();
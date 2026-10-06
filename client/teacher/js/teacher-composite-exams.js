// ============================================================
//  VirtuLab Kenya — Teacher Composite Mock Exam Manager Controller
//  Full 40-Mark KCSE Paper 3 booklet reviews, cohort analytics & radar diagnostics
// ============================================================

(function() {
  let allCompositeSessions = [];
  let compositeSummary = null;
  let gradeChartInstance = null;
  let radarChartInstance = null;
  let modalCandidateRadarInstance = null;
  let currentReviewSession = null;

  async function loadTeacherCompositeSessions() {
    const box = document.getElementById('compositeSessionsBox');
    if (box) {
      box.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);"><div class="spinner" style="margin:0 auto 10px;"></div>Loading composite exam submissions &amp; class analytics…</div>';
    }

    try {
      const [sessionsRes, summaryRes] = await Promise.all([
        window.apiRequest ? window.apiRequest('GET', '/composite/teacher') : fetchWithAuth('/api/composite/teacher'),
        window.apiRequest ? window.apiRequest('GET', '/composite/teacher/summary') : fetchWithAuth('/api/composite/teacher/summary')
      ]);

      allCompositeSessions = (sessionsRes && sessionsRes.sessions) ? sessionsRes.sessions : [];
      compositeSummary = (summaryRes && summaryRes.summary) ? summaryRes.summary : null;

      renderKpiStats(compositeSummary, allCompositeSessions);
      renderGradeDistributionChart(compositeSummary ? compositeSummary.gradeDistribution : null);
      renderClassRadarChart(compositeSummary ? compositeSummary.classCompetencyAverages : null, compositeSummary ? compositeSummary.cohortBenchmarks : null);
      filterTeacherCompositeSessions();
    } catch (err) {
      console.error('[TeacherComposite] Error loading composite sessions:', err);
      if (box) {
        box.innerHTML = `
          <div style="padding:24px; text-align:center; color:var(--red-accent);">
            <div style="font-size:1.4rem; margin-bottom:6px;">⚠️</div>
            <b>Could not load composite exam records.</b>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${escapeHtml(err.message || 'Network error')}</div>
            <button type="button" class="btn btn-secondary" onclick="loadTeacherCompositeSessions()" style="margin-top:12px; font-size:0.8rem;">Retry</button>
          </div>
        `;
      }
    }
  }

  function fetchWithAuth(url) {
    const token = (typeof localStorage !== 'undefined' && localStorage.getItem('vlk_token')) || '';
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  function renderKpiStats(summary, sessions) {
    const totalEl = document.getElementById('compStatTotal');
    const meanScoreEl = document.getElementById('compStatMeanScore');
    const meanPctEl = document.getElementById('compStatMeanPct');
    const meanGradeEl = document.getElementById('compStatMeanGrade');
    const indexEl = document.getElementById('compStatCompetencyIndex');
    const deltaEl = document.getElementById('compStatCohortDelta');
    const uniqueEl = document.getElementById('compStatUniqueStudents');

    if (!summary || summary.totalAttempts === 0) {
      if (totalEl) totalEl.textContent = '0';
      if (meanScoreEl) meanScoreEl.textContent = '—';
      if (meanPctEl) meanPctEl.textContent = 'out of 40.0 Marks';
      if (meanGradeEl) meanGradeEl.textContent = '—';
      if (indexEl) indexEl.textContent = '—';
      if (deltaEl) deltaEl.textContent = 'vs 59% National Baseline';
      if (uniqueEl) uniqueEl.textContent = '0 Candidates Sat';
      return;
    }

    if (totalEl) totalEl.textContent = summary.totalAttempts.toString();

    const uniqueStudents = new Set(sessions.map(s => s.student_id)).size;
    if (uniqueEl) uniqueEl.textContent = `${uniqueStudents} Candidate${uniqueStudents === 1 ? '' : 's'} Sat`;

    if (meanScoreEl) meanScoreEl.textContent = `${summary.averageScore.toFixed(1)} / 40.0`;
    if (meanPctEl) meanPctEl.textContent = `${summary.averagePercentage}% Class Average`;

    // Calculate mean grade from score
    let meanGrade = 'E';
    const pct = summary.averagePercentage;
    if (pct >= 80) meanGrade = 'A';
    else if (pct >= 75) meanGrade = 'A-';
    else if (pct >= 70) meanGrade = 'B+';
    else if (pct >= 65) meanGrade = 'B';
    else if (pct >= 60) meanGrade = 'B-';
    else if (pct >= 55) meanGrade = 'C+';
    else if (pct >= 50) meanGrade = 'C';
    else if (pct >= 45) meanGrade = 'C-';
    else if (pct >= 40) meanGrade = 'D+';
    else if (pct >= 35) meanGrade = 'D';
    else if (pct >= 30) meanGrade = 'D-';

    if (meanGradeEl) meanGradeEl.textContent = `Grade ${meanGrade}`;

    const classComp = summary.classCompetencyAverages || {};
    const classIdx = classComp.overall || 0;
    if (indexEl) indexEl.textContent = `${classIdx}%`;

    const delta = classIdx - 59;
    if (deltaEl) {
      const isPos = delta >= 0;
      deltaEl.textContent = `${isPos ? '+' : ''}${delta}% vs 59% National Baseline`;
      deltaEl.style.color = isPos ? 'var(--green-accent)' : 'var(--red-accent)';
    }
  }

  function renderGradeDistributionChart(gradeDist) {
    const canvas = document.getElementById('teacherCompositeGradeChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (gradeChartInstance) {
      gradeChartInstance.destroy();
      gradeChartInstance = null;
    }

    const labels = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
    const dist = gradeDist || {};
    const counts = labels.map(g => dist[g] || 0);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    // Color gradient based on grade bands
    const bgColors = labels.map(g => {
      if (g.startsWith('A')) return '#10B981';
      if (g.startsWith('B')) return '#0284C7';
      if (g.startsWith('C')) return '#F59E0B';
      if (g.startsWith('D')) return '#F97316';
      return '#EF4444';
    });

    const ctx = canvas.getContext('2d');
    gradeChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Candidate Count',
          data: counts,
          backgroundColor: bgColors,
          borderRadius: 6,
          maxBarThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.raw} Student${ctx.raw === 1 ? '' : 's'}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { family: "'JetBrains Mono', monospace", size: 10, weight: '700' }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              color: textColor,
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  function renderClassRadarChart(compAverages, cohortBenchmarks) {
    const canvas = document.getElementById('teacherCompositeRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (radarChartInstance) {
      radarChartInstance.destroy();
      radarChartInstance = null;
    }

    const c = compAverages || {};
    const candidateData = [
      c.accuracy || 0,
      c.decimals || 0,
      c.averaging || 0,
      c.inorganic || 0,
      c.organic || 0
    ];
    const benchmarkData = cohortBenchmarks || [58, 72, 64, 54, 46];

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)';
    const pointLabelColor = isDark ? '#E2E8F0' : '#1E293B';
    const tickColor = isDark ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.55)';

    const ctx = canvas.getContext('2d');
    radarChartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'Accuracy (AC/FA)',
          'Decimals (D)',
          'Averaging (PA)',
          'Inorganic Tests',
          'Organic Deductions'
        ],
        datasets: [
          {
            label: 'Class Average Mastery (%)',
            data: candidateData,
            backgroundColor: 'rgba(56, 189, 248, 0.25)',
            borderColor: '#0284C7',
            pointBackgroundColor: '#38BDF8',
            pointBorderColor: '#FFFFFF',
            pointRadius: 4,
            borderWidth: 2
          },
          {
            label: 'KNEC National Benchmark (%)',
            data: benchmarkData,
            backgroundColor: 'rgba(245, 158, 11, 0.10)',
            borderColor: '#F59E0B',
            borderDash: [5, 5],
            pointBackgroundColor: '#F59E0B',
            pointBorderColor: '#FFFFFF',
            pointRadius: 3,
            borderWidth: 1.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" },
              color: pointLabelColor
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              color: tickColor,
              backdropColor: 'transparent',
              font: { size: 9, family: "'JetBrains Mono', monospace" }
            },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: {
              color: pointLabelColor,
              font: { size: 10, weight: '700', family: "'Plus Jakarta Sans', sans-serif" }
            }
          }
        }
      }
    });
  }

  function filterTeacherCompositeSessions() {
    const qSearch = (document.getElementById('teacherCompSearchInput')?.value || '').toLowerCase().trim();
    const qGrade = (document.getElementById('teacherCompGradeFilter')?.value || '').toUpperCase().trim();
    const qSeries = (document.getElementById('teacherCompSeriesFilter')?.value || '').toLowerCase().trim();

    let filtered = allCompositeSessions.slice();

    if (qSearch) {
      filtered = filtered.filter(s => {
        const name = (s.student_name || '').toLowerCase();
        const email = (s.student_email || '').toLowerCase();
        const title = (s.exam_title || '').toLowerCase();
        const form = (s.student_form || '').toLowerCase();
        return name.includes(qSearch) || email.includes(qSearch) || title.includes(qSearch) || form.includes(qSearch);
      });
    }

    if (qGrade) {
      filtered = filtered.filter(s => {
        const g = (s.grade || '').toUpperCase();
        return g.startsWith(qGrade);
      });
    }

    if (qSeries) {
      filtered = filtered.filter(s => {
        const details = typeof s.details === 'string' ? JSON.parse(s.details) : (s.details || {});
        return (details.seriesKey || '').toLowerCase() === qSeries;
      });
    }

    renderSessionsTable(filtered);
  }

  function renderSessionsTable(sessions) {
    const box = document.getElementById('compositeSessionsBox');
    if (!box) return;

    if (!sessions || sessions.length === 0) {
      box.innerHTML = `
        <div style="background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; padding:32px; text-align:center; color:var(--text-muted);">
          <div style="font-size:2rem; margin-bottom:8px;">📋</div>
          <div style="font-weight:700; color:var(--heading-color); margin-bottom:4px;">No Composite Mock Exam Submissions Found</div>
          <div style="font-size:0.8rem; max-width:440px; margin:0 auto;">
            When students complete the 40-mark Paper 3 examination, their marked booklets, ECF calculations, and competency radar diagrams will appear here.
          </div>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <div style="background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; overflow-x:auto;">
        <table class="table" style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
          <thead>
            <tr style="border-bottom:1px solid var(--card-border); background:var(--card-bg-hover);">
              <th style="padding:10px 14px;">Candidate</th>
              <th style="padding:10px 14px;">Paper 3 Examination Series</th>
              <th style="padding:10px 14px; text-align:center;">Q1 Titr. (/15)</th>
              <th style="padding:10px 14px; text-align:center;">Q2 Inorg. (/15)</th>
              <th style="padding:10px 14px; text-align:center;">Q3 Org. (/10)</th>
              <th style="padding:10px 14px; text-align:center;">Total (/40)</th>
              <th style="padding:10px 14px; text-align:center;">Grade</th>
              <th style="padding:10px 14px; text-align:center;">Duration</th>
              <th style="padding:10px 14px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.map(s => {
              const details = typeof s.details === 'string' ? JSON.parse(s.details) : (s.details || {});
              const durMin = Math.round((s.duration_seconds || 0) / 60);
              const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';
              const seriesBadge = details.seriesKey ? `<span style="font-size:0.68rem; font-family:var(--font-mono); background:rgba(56,189,248,0.12); color:#0284C7; padding:2px 6px; border-radius:4px; font-weight:700;">${escapeHtml(details.seriesKey.toUpperCase().replace('_', ' '))}</span>` : '';
              
              const gradeClass = (s.grade || 'E').startsWith('A') ? 'badge-success' : ((s.grade || '').startsWith('B') ? 'badge-primary' : ((s.grade || '').startsWith('C') ? 'badge-warning' : 'badge-danger'));

              return `
                <tr style="border-bottom:1px solid var(--card-border);">
                  <td style="padding:10px 14px;">
                    <div style="font-weight:700; color:var(--heading-color);">${escapeHtml(s.student_name || 'Candidate Student')}</div>
                    <div style="font-size:0.72rem; color:var(--text-muted);">${escapeHtml(s.student_email || '')} ${s.student_form ? `&bull; Form ${escapeHtml(s.student_form)}` : ''}</div>
                  </td>
                  <td style="padding:10px 14px;">
                    <div style="font-weight:600;">${escapeHtml(s.exam_title || 'KCSE Chemistry Paper 3 Mock')}</div>
                    <div style="margin-top:2px;">${seriesBadge} <span style="font-size:0.72rem; color:var(--text-muted);">&bull; ${dateStr}</span></div>
                  </td>
                  <td style="padding:10px 14px; text-align:center; font-family:var(--font-mono); font-weight:700;">${Number(s.q1_score || 0).toFixed(1)}</td>
                  <td style="padding:10px 14px; text-align:center; font-family:var(--font-mono); font-weight:700;">${Number(s.q2_score || 0).toFixed(1)}</td>
                  <td style="padding:10px 14px; text-align:center; font-family:var(--font-mono); font-weight:700;">${Number(s.q3_score || 0).toFixed(1)}</td>
                  <td style="padding:10px 14px; text-align:center; font-family:var(--font-mono); font-weight:800; font-size:0.95rem; color:var(--cyan-accent);">${Number(s.total_score || 0).toFixed(1)}</td>
                  <td style="padding:10px 14px; text-align:center;">
                    <span class="badge ${gradeClass}" style="font-weight:800; font-size:0.78rem;">${escapeHtml(s.grade || 'E')}</span>
                  </td>
                  <td style="padding:10px 14px; text-align:center; font-size:0.75rem; color:var(--text-muted);">${durMin} min</td>
                  <td style="padding:10px 14px; text-align:right; white-space:nowrap;">
                    <button type="button" class="btn btn-secondary" onclick="reviewTeacherScript(${s.id})" style="font-size:0.75rem; padding:4px 9px;" title="Inspect Candidate Marked Script">
                      🔍 Script
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="printTeacherScript(${s.id})" style="font-size:0.75rem; padding:4px 9px;" title="Print Official KNEC Marked Booklet">
                      🖨️
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function reviewTeacherScript(sessionId) {
    const session = allCompositeSessions.find(s => s.id === sessionId);
    if (!session) return;
    currentReviewSession = session;

    const modal = document.getElementById('teacherScriptModal');
    if (!modal) return;

    const nameEl = document.getElementById('scriptModalStudentName');
    const examEl = document.getElementById('scriptModalExamTitle');
    const scoreEl = document.getElementById('scriptModalTotalScore');
    const gradeEl = document.getElementById('scriptModalGradeBadge');
    const contentEl = document.getElementById('scriptModalContent');

    if (nameEl) nameEl.textContent = `${session.student_name || 'Candidate Student'} (${session.student_form ? `Form ${session.student_form}` : session.student_email || ''})`;
    if (examEl) examEl.textContent = `${session.exam_title || 'KCSE Paper 3 Mock Practical Examination'} · Attempt #${session.id}`;
    if (scoreEl) scoreEl.textContent = `${Number(session.total_score || 0).toFixed(1)} / 40.0 Marks (${Math.round((Number(session.total_score || 0) / 40) * 100)}%)`;
    if (gradeEl) gradeEl.textContent = `Grade ${session.grade || 'E'}`;

    const details = typeof session.details === 'string' ? JSON.parse(session.details) : (session.details || {});
    const cm = details.competencyMetrics;

    let html = '';

    // 1. Radar Diagnostic Stage in Modal
    if (cm) {
      html += `
        <div style="background:var(--bg-dark, #090E17); border:1px solid var(--card-border); border-radius:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div>
              <div style="font-weight:800; font-size:0.9rem; color:var(--heading-color);">🎯 Candidate 5-Axis Competency Diagnostic</div>
              <div style="font-size:0.74rem; color:var(--text-muted);">Comparing candidate against the KNEC National Mock Cohort Baseline</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Competency Index:</span>
              <span style="font-weight:800; font-family:var(--font-mono); color:var(--cyan-accent); font-size:1.1rem; margin-left:4px;">${cm.overallIndex}%</span>
            </div>
          </div>
          <div style="position:relative; width:100%; max-width:440px; height:240px; margin:0 auto;">
            <canvas id="modalCandidateRadarChart"></canvas>
          </div>
        </div>
      `;
    }

    // 2. Question-by-Question Scores & Deductions
    html += `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
        <div style="background:var(--card-bg-hover); border:1px solid var(--card-border); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">Q1 VOLUMETRIC</div>
          <div style="font-size:1.25rem; font-weight:800; color:var(--cyan-accent); font-family:var(--font-mono);">${Number(session.q1_score || 0).toFixed(1)} / 15.0</div>
        </div>
        <div style="background:var(--card-bg-hover); border:1px solid var(--card-border); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">Q2 INORGANIC</div>
          <div style="font-size:1.25rem; font-weight:800; color:var(--cyan-accent); font-family:var(--font-mono);">${Number(session.q2_score || 0).toFixed(1)} / 15.0</div>
        </div>
        <div style="background:var(--card-bg-hover); border:1px solid var(--card-border); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">Q3 ORGANIC</div>
          <div style="font-size:1.25rem; font-weight:800; color:var(--cyan-accent); font-family:var(--font-mono);">${Number(session.q3_score || 0).toFixed(1)} / 10.0</div>
        </div>
      </div>
    `;

    // 3. Itemized Rubric Breakdown
    const q1Rubric = (details.q1 && details.q1.rubric) || [];
    const q2Rubric = (details.q2 && details.q2.rubric) || [];
    const q3Rubric = (details.q3 && details.q3.rubric) || [];

    html += `
      <div style="background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:14px; font-size:0.8rem;">
        <div style="font-weight:800; color:var(--heading-color); margin-bottom:8px;">📋 Detailed Item-by-Item Marking Rubric &amp; Examiner Deductions:</div>
        <div style="display:flex; flex-direction:column; gap:6px; max-height:300px; overflow-y:auto; padding-right:4px;">
          ${[...q1Rubric, ...q2Rubric, ...q3Rubric].map(r => `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--card-border); padding-bottom:6px; gap:8px;">
              <div>
                <span>${r.pass ? '✅' : '❌'}</span>
                <span style="font-weight:700; color:var(--heading-color);">${escapeHtml(r.item || '')}</span>
                ${r.detail ? `<div style="font-size:0.73rem; color:var(--text-muted); margin-left:18px;">${escapeHtml(r.detail)}</div>` : ''}
              </div>
              <span style="font-family:var(--font-mono); font-weight:700; color:${r.pass ? 'var(--green-accent)' : 'var(--red-accent)'}; flex-shrink:0;">
                ${Number(r.mark || 0).toFixed(1)} / ${Number(r.max || 0).toFixed(1)}
              </span>
            </div>
          `).join('') || '<div style="color:var(--text-muted);">No rubric items recorded.</div>'}
        </div>
      </div>
    `;

    // 4. Chief Examiner Diagnostic Notes
    if (details.diagnosticNotes && details.diagnosticNotes.length > 0) {
      html += `
        <div style="background:rgba(245,158,11,0.08); border-left:4px solid var(--amber-accent); border-radius:6px; padding:10px 14px; font-size:0.8rem;">
          <div style="font-weight:800; color:var(--amber-accent); margin-bottom:4px;">👨‍🏫 Chief Examiner Remedial Critique:</div>
          <ul style="margin:0 0 0 16px; padding:0;">
            ${details.diagnosticNotes.map(n => `<li>${escapeHtml(n)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (contentEl) contentEl.innerHTML = html;
    modal.style.display = 'flex';

    // Render candidate radar chart inside modal if canvas exists
    if (cm) {
      setTimeout(() => {
        const modalCanvas = document.getElementById('modalCandidateRadarChart');
        if (modalCanvas && typeof Chart !== 'undefined') {
          if (modalCandidateRadarInstance) {
            modalCandidateRadarInstance.destroy();
            modalCandidateRadarInstance = null;
          }
          const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
          const gridColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)';
          const textColor = isDark ? '#E2E8F0' : '#1E293B';

          modalCandidateRadarInstance = new Chart(modalCanvas.getContext('2d'), {
            type: 'radar',
            data: {
              labels: cm.labels || ['Accuracy (AC/FA)', 'Decimals (D)', 'Averaging (PA)', 'Inorganic Tests', 'Organic Deductions'],
              datasets: [
                {
                  label: 'Candidate Mastery (%)',
                  data: cm.candidateScores || [0, 0, 0, 0, 0],
                  backgroundColor: 'rgba(56, 189, 248, 0.25)',
                  borderColor: '#0284C7',
                  pointBackgroundColor: '#38BDF8',
                  pointBorderColor: '#FFFFFF',
                  pointRadius: 4,
                  borderWidth: 2
                },
                {
                  label: 'National Baseline (%)',
                  data: cm.cohortBenchmarks || [58, 72, 64, 54, 46],
                  backgroundColor: 'rgba(245, 158, 11, 0.10)',
                  borderColor: '#F59E0B',
                  borderDash: [4, 4],
                  pointBackgroundColor: '#F59E0B',
                  pointBorderColor: '#FFFFFF',
                  pointRadius: 3,
                  borderWidth: 1.5
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                r: {
                  min: 0,
                  max: 100,
                  ticks: { stepSize: 25, display: false },
                  grid: { color: gridColor },
                  angleLines: { color: gridColor },
                  pointLabels: { color: textColor, font: { size: 9, weight: '700' } }
                }
              }
            }
          });
        }
      }, 50);
    }
  }

  function closeTeacherScriptModal() {
    const modal = document.getElementById('teacherScriptModal');
    if (modal) modal.style.display = 'none';
    if (modalCandidateRadarInstance) {
      modalCandidateRadarInstance.destroy();
      modalCandidateRadarInstance = null;
    }
    currentReviewSession = null;
  }

  function printCandidateScriptFromModal() {
    if (!currentReviewSession) return;
    printTeacherScript(currentReviewSession.id);
  }

  function printTeacherScript(sessionId) {
    const session = allCompositeSessions.find(s => s.id === sessionId);
    if (!session) return;

    let printArea = document.getElementById('teacherKnecPrintArea');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'teacherKnecPrintArea';
      document.body.appendChild(printArea);
    }

    const details = typeof session.details === 'string' ? JSON.parse(session.details) : (session.details || {});
    const dateStr = session.created_at ? new Date(session.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    printArea.innerHTML = `
      <div style="font-family:'Times New Roman', serif; padding:20px; color:#000; background:#fff;">
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:16px;">
          <h2 style="margin:0; font-size:16pt; font-weight:bold; letter-spacing:1px;">REPUBLIC OF KENYA</h2>
          <h3 style="margin:4px 0; font-size:13pt; font-weight:bold;">THE KENYA NATIONAL EXAMINATIONS COUNCIL</h3>
          <h4 style="margin:2px 0; font-size:12pt; font-weight:bold;">KCSE CHEMISTRY PRACTICAL — PAPER 3 (233/3)</h4>
          <div style="font-size:10pt; margin-top:4px;">OFFICIAL CANDIDATE MARKED SCRIPT &bull; 40.0 MARKS TOTAL</div>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:10pt;">
          <tr>
            <td style="padding:4px;"><b>Candidate Name:</b> ${escapeHtml(session.student_name || 'Candidate Student')}</td>
            <td style="padding:4px; text-align:right;"><b>Form / Class:</b> ${escapeHtml(session.student_form ? `Form ${session.student_form}` : 'Form 4')}</td>
          </tr>
          <tr>
            <td style="padding:4px;"><b>Email / Index:</b> ${escapeHtml(session.student_email || '—')}</td>
            <td style="padding:4px; text-align:right;"><b>Date:</b> ${dateStr}</td>
          </tr>
        </table>

        <table style="width:100%; border:2px solid #000; border-collapse:collapse; margin-bottom:20px; text-align:center; font-size:10pt;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:1px solid #000;">
              <th style="padding:6px; border-right:1px solid #000;">Question 1 (Volumetric)</th>
              <th style="padding:6px; border-right:1px solid #000;">Question 2 (Inorganic)</th>
              <th style="padding:6px; border-right:1px solid #000;">Question 3 (Organic)</th>
              <th style="padding:6px; border-right:1px solid #000;">TOTAL SCORE</th>
              <th style="padding:6px;">KNEC GRADE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:8px; border-right:1px solid #000; font-weight:bold;">${Number(session.q1_score || 0).toFixed(1)} / 15.0</td>
              <td style="padding:8px; border-right:1px solid #000; font-weight:bold;">${Number(session.q2_score || 0).toFixed(1)} / 15.0</td>
              <td style="padding:8px; border-right:1px solid #000; font-weight:bold;">${Number(session.q3_score || 0).toFixed(1)} / 10.0</td>
              <td style="padding:8px; border-right:1px solid #000; font-size:12pt; font-weight:bold; color:#b91c1c;">${Number(session.total_score || 0).toFixed(1)} / 40.0</td>
              <td style="padding:8px; font-size:13pt; font-weight:bold;">${escapeHtml(session.grade || 'E')}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-weight:bold; margin-bottom:6px; border-bottom:1px solid #000; font-size:11pt;">EXAMINER RUBRIC &amp; CANDIDATE RESPONSES:</div>
        <div style="font-size:9.5pt; margin-bottom:16px;">
          ${[...(details.q1?.rubric || []), ...(details.q2?.rubric || []), ...(details.q3?.rubric || [])].map(r => `
            <div style="margin-bottom:4px;">
              <b>[${r.pass ? '✓' : '✗'}] ${escapeHtml(r.item || '')}:</b>
              <span>${Number(r.mark || 0).toFixed(1)} / ${Number(r.max || 0).toFixed(1)} Marks</span>
              ${r.detail ? `<div style="font-style:italic; margin-left:14px; font-size:9pt; color:#444;">${escapeHtml(r.detail)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        ${details.diagnosticNotes && details.diagnosticNotes.length > 0 ? `
          <div style="border-top:1px solid #000; padding-top:8px; font-size:9pt;">
            <b>CHIEF EXAMINER REMARKS:</b>
            <ul style="margin:4px 0 0 16px;">
              ${details.diagnosticNotes.map(n => `<li>${escapeHtml(n)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;

    printArea.style.display = 'block';
    window.print();
    printArea.style.display = 'none';
  }

  function exportTeacherCompositeCsv() {
    if (!allCompositeSessions || allCompositeSessions.length === 0) {
      alert('No composite exam submissions available to export.');
      return;
    }

    const headers = ['Student Name', 'Email', 'Form', 'Exam Title', 'Series', 'Q1 Score (15)', 'Q2 Score (15)', 'Q3 Score (10)', 'Total Score (40)', 'KNEC Grade', 'Duration (min)', 'Submitted At'];
    const rows = allCompositeSessions.map(s => {
      const details = typeof s.details === 'string' ? JSON.parse(s.details) : (s.details || {});
      return [
        `"${(s.student_name || '').replace(/"/g, '""')}"`,
        `"${(s.student_email || '').replace(/"/g, '""')}"`,
        `"${(s.student_form || '').replace(/"/g, '""')}"`,
        `"${(s.exam_title || '').replace(/"/g, '""')}"`,
        `"${(details.seriesKey || '').replace(/"/g, '""')}"`,
        Number(s.q1_score || 0).toFixed(1),
        Number(s.q2_score || 0).toFixed(1),
        Number(s.q3_score || 0).toFixed(1),
        Number(s.total_score || 0).toFixed(1),
        `"${(s.grade || 'E').replace(/"/g, '""')}"`,
        Math.round((s.duration_seconds || 0) / 60),
        `"${new Date(s.created_at || Date.now()).toISOString()}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `knec_composite_class_results_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return str || '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Export functions to global scope
  window.loadTeacherCompositeSessions = loadTeacherCompositeSessions;
  window.filterTeacherCompositeSessions = filterTeacherCompositeSessions;
  window.reviewTeacherScript = reviewTeacherScript;
  window.closeTeacherScriptModal = closeTeacherScriptModal;
  window.printCandidateScriptFromModal = printCandidateScriptFromModal;
  window.printTeacherScript = printTeacherScript;
  window.exportTeacherCompositeCsv = exportTeacherCompositeCsv;
})();

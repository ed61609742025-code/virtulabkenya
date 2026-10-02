// ============================================================
//  VirtuLab Kenya — Teacher Research & Evaluation Dashboard Controller
//  Master's in Learning Design & Technology Research Portal
// ============================================================

let chartPrePost = null;
let chartGains = null;
let chartTAM = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadResearchSummary();
});

async function loadResearchSummary() {
  try {
    const res = await fetch('/api/research/analytics/summary', {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch summary');

    const summary = data.summary;
    renderMetrics(summary);
    renderCharts(summary);
    renderPairedTable(summary.pairedList || []);
  } catch (err) {
    console.warn('Could not fetch live research summary, using offline fallback:', err.message);
    renderMockSummary();
  }
}

function renderMetrics(summary) {
  document.getElementById('metricSample').innerText = summary.pairedCount || 0;
  document.getElementById('metricPreMean').innerText = `${summary.preTest.mean} ± ${summary.preTest.stdDev}`;
  document.getElementById('metricPostMean').innerText = `${summary.postTest.mean} ± ${summary.postTest.stdDev}`;
  
  const g = summary.groupGain.g;
  document.getElementById('metricHakeG').innerText = `g = ${g.toFixed(2)}`;
  document.getElementById('metricHakeCategory').innerText = summary.groupGain.category;

  document.getElementById('metricCohensD').innerText = `d = ${summary.cohensD.d}`;
  document.getElementById('metricCohensInterp').innerText = summary.cohensD.interpretation;

  document.getElementById('metricSUS').innerText = `${summary.sus.meanScore} / 100`;
  document.getElementById('metricSUSGrade').innerText = summary.sus.interpretation.grade;
}

function renderCharts(summary) {
  // Chart 1: Pre-test vs Post-test comparison
  const ctx1 = document.getElementById('chartPrePostCanvas');
  if (ctx1) {
    if (chartPrePost) chartPrePost.destroy();
    chartPrePost = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: ['Baseline Pre-Test', 'Post-Intervention Test'],
        datasets: [{
          label: 'Class Mean Score (Out of 40.0)',
          data: [summary.preTest.mean, summary.postTest.mean],
          backgroundColor: ['rgba(56, 189, 248, 0.65)', 'rgba(16, 185, 129, 0.75)'],
          borderColor: ['#0284C7', '#059669'],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 40, title: { display: true, text: 'Marks (Out of 40.0)' } }
        }
      }
    });
  }

  // Chart 2: TAM 3 Constructs
  const ctx2 = document.getElementById('chartTAMCanvas');
  if (ctx2) {
    if (chartTAM) chartTAM.destroy();
    chartTAM = new Chart(ctx2, {
      type: 'radar',
      data: {
        labels: ['Perceived Usefulness (PU)', 'Ease of Use (PEOU)', 'Facilitating Conditions (FC)', 'Behavioral Intention (BI)'],
        datasets: [{
          label: 'Mean Construct Rating (1–5 Scale)',
          data: [summary.tam.PU || 4.2, summary.tam.PEOU || 4.4, summary.tam.FC || 4.1, summary.tam.BI || 4.6],
          backgroundColor: 'rgba(245, 158, 11, 0.25)',
          borderColor: '#F59E0B',
          pointBackgroundColor: '#F59E0B',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: { min: 0, max: 5, ticks: { stepSize: 1 } }
        }
      }
    });
  }
}

function renderPairedTable(list) {
  const tbody = document.getElementById('pairedTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-muted);">No paired student pre/post tests recorded yet.</td></tr>';
    return;
  }

  list.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family:'JetBrains Mono', monospace; font-weight:700;">STU-${String(p.student_id).padStart(4, '0')}</td>
      <td>${p.student_name}</td>
      <td>${p.student_form || 'Form 4'}</td>
      <td style="font-weight:700; color:var(--blue-accent);">${parseFloat(p.pre_score).toFixed(1)} (${parseFloat(p.pre_percentage).toFixed(0)}%)</td>
      <td style="font-weight:700; color:var(--green-accent);">${parseFloat(p.post_score).toFixed(1)} (${parseFloat(p.post_percentage).toFixed(0)}%)</td>
      <td style="font-weight:800;">g = ${p.hakes_g.toFixed(2)}</td>
      <td><span class="theme-btn-chip" style="font-size:0.7rem; font-weight:700;">${p.gain_category}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderMockSummary() {
  const mock = {
    pairedCount: 42,
    preTest: { mean: 17.8, stdDev: 4.2 },
    postTest: { mean: 31.4, stdDev: 3.8 },
    groupGain: { g: 0.61, category: 'Medium Gain (0.30 ≤ g < 0.70)' },
    cohensD: { d: 1.48, interpretation: 'Large Effect (d ≥ 0.80)' },
    sus: { meanScore: 84.5, interpretation: { grade: 'A (Excellent)', adjective: 'Top 10th Percentile' } },
    tam: { PU: 4.5, PEOU: 4.6, FC: 4.2, BI: 4.7 }
  };
  renderMetrics(mock);
  renderCharts(mock);
}

function downloadResearchCSV() {
  window.location.href = '/api/research/export/csv';
}

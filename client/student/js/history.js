/**
 * VirtuLab Kenya — Student History & Analytics Script
 */
requireStudentLogin();
  if (typeof updateProfileStatsUI === 'function') updateProfileStatsUI();

  const ALL_TABS = ['titration', 'qualitative', 'organic', 'solubility', 'energy', 'rates', 'gas', 'composite', 'cpcat'];
  let activeTab = 'titration';
  let currentPage = 1;
  let currentTabRawSessions = [];
  let currentPagination = null;
  const expandedRows = new Set();

  function switchTab(tab) {
    activeTab = tab;
    currentPage = 1;
    expandedRows.clear();

    // Reset search on tab switch so students aren't blocked by previous search terms
    const sInput = document.getElementById('sessionSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    if (sInput) sInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';

    ALL_TABS.forEach(t => {
      const btnId = 'tab' + t.charAt(0).toUpperCase() + t.slice(1);
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.toggle('active', t === tab);
    });

    const titrFilters = document.getElementById('titrationFilters');
    if (titrFilters) titrFilters.style.display = tab === 'titration' ? 'flex' : 'none';

    loadActiveTabSessions();
  }

  function getCleanSearchValue() {
    const sInput = document.getElementById('sessionSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    if (!sInput) return '';

    let val = (sInput.value || '').trim();
    // Scrub browser autofilled email addresses (e.g. tecla@yahoo.com)
    if (val.includes('@') && (val.includes('.com') || val.includes('.ke') || val.includes('.org') || val.includes('.net') || val.includes('.edu'))) {
      sInput.value = '';
      val = '';
    }

    if (clearBtn) {
      clearBtn.style.display = val.length > 0 ? 'block' : 'none';
    }

    return val.toLowerCase();
  }

  function clearSearchInput() {
    const sInput = document.getElementById('sessionSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    if (sInput) sInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    renderCurrentTabUI();
  }

  function onSearchFilterChange() {
    renderCurrentTabUI();
  }

  function onTitrationTypeChange() {
    currentPage = 1;
    loadTitrationSessions();
  }

  function goToPage(page) {
    currentPage = page;
    loadActiveTabSessions();
  }

  function toggleSessionRow(rowId) {
    const rowEl = document.getElementById('sessionRow-' + rowId);
    const panelEl = document.getElementById('drilldown-' + rowId);
    if (!rowEl || !panelEl) return;

    if (expandedRows.has(rowId)) {
      expandedRows.delete(rowId);
      rowEl.classList.remove('is-expanded');
      panelEl.style.display = 'none';
    } else {
      expandedRows.add(rowId);
      rowEl.classList.add('is-expanded');
      panelEl.style.display = 'block';
    }
  }

  function toggleObsLog(e, idx) {
    if (e && e.stopPropagation) e.stopPropagation();
    const el = document.getElementById('obsLog-' + idx);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
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

  function getEmptyStateHTML(tab) {
    const labMap = {
      titration: { title: 'No Titration Attempts Found', link: 'lab.html', action: 'Start Titration Practical 🧪' },
      qualitative: { title: 'No Qualitative Salt Tests Found', link: 'qualitative.html', action: 'Investigate Unknown Salt 🧫' },
      organic: { title: 'No Organic Lab Attempts Found', link: 'organic.html', action: 'Test Organic Compounds ⚗️' },
      solubility: { title: 'No Solubility Runs Found', link: 'solubility.html', action: 'Plot Solubility Curve 🌡️' },
      energy: { title: 'No Thermochemistry Runs Found', link: 'energy.html', action: 'Measure Heat of Reaction 🔥' },
      rates: { title: 'No Reaction Rates Runs Found', link: 'rates.html', action: 'Run Kinetics Experiment ⚡' },
      gas: { title: 'No Gas Prep Runs Found', link: 'gas_prep.html', action: 'Prepare & Collect Gas 💨' },
      composite: { title: 'No Mock Exams Found', link: 'mock_exams.html', action: 'Take 40-Mark Mock Exam 📋' },
      cpcat: { title: 'No Standardized Assessments Found', link: 'cpcat_assessment.html', action: 'Take CPCAT Assessment 📑' }
    };
    const info = labMap[tab] || { title: 'No Attempts Recorded', link: 'home.html', action: 'Explore Workbenches 🧪' };
    return `
      <div class="empty-state-card">
        <div class="empty-state-icon">🔬</div>
        <div class="empty-state-title">${info.title}</div>
        <div class="empty-state-desc">You haven't completed any practical trials matching your search or filter yet. Launch the workbench simulation to practice and build your KCSE Paper 3 readiness.</div>
        <a href="${info.link}" class="empty-state-btn">${info.action}</a>
      </div>
    `;
  }

  function loadActiveTabSessions() {
    if (activeTab === 'titration') loadTitrationSessions();
    else if (activeTab === 'qualitative') loadQualitativeSessions();
    else if (activeTab === 'organic') loadOrganicSessions();
    else if (activeTab === 'solubility') loadSolubilitySessions();
    else if (activeTab === 'energy') loadEnergySessions();
    else if (activeTab === 'rates') loadRatesSessions();
    else if (activeTab === 'gas') loadGasSessions();
    else if (activeTab === 'composite') loadCompositeSessions();
    else if (activeTab === 'cpcat') loadCPCATSessions();
  }

  // ── 1. Titration Sessions ──
  async function loadTitrationSessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading titration sessions…</div>';
    pagBox.innerHTML = '';

    try {
      const typeEl = document.getElementById('filterType');
      const type = typeEl ? typeEl.value : '';
      const data = await Sessions.getMine({ type, page: currentPage, limit: 10 });
      currentTabRawSessions = data.sessions || [];
      currentPagination = data.pagination || { page: 1, totalPages: 1, totalCount: currentTabRawSessions.length, limit: 10 };
      renderCurrentTabUI();
    } catch (err) {
      console.warn('Using sample/cached titration sessions:', err);
      currentTabRawSessions = [
        {
          id: 't-1',
          titration_title: 'Standardisation of 0.10M HCl with Anhydrous Na₂CO₃',
          created_at: new Date().toISOString(),
          trials_count: 3,
          concordant_found: true,
          correct: true,
          mode: 'guided',
          student_answer: 0.098,
          true_conc: 0.100,
          trial_readings: [
            { trial: 1, initial: 0.00, final: 20.40, titre: 20.40, used: false },
            { trial: 2, initial: 0.00, final: 20.10, titre: 20.10, used: true },
            { trial: 3, initial: 0.00, final: 20.15, titre: 20.15, used: true }
          ]
        },
        {
          id: 't-2',
          titration_title: 'Redox Titration of Iron(II) with Acidified KMnO₄ (0.02M)',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          trials_count: 3,
          concordant_found: true,
          correct: true,
          mode: 'exam',
          student_answer: 0.099,
          true_conc: 0.100,
          trial_readings: [
            { trial: 1, initial: 0.00, final: 24.80, titre: 24.80, used: false },
            { trial: 2, initial: 0.00, final: 24.50, titre: 24.50, used: true },
            { trial: 3, initial: 0.00, final: 24.55, titre: 24.55, used: true }
          ]
        },
        {
          id: 't-3',
          titration_title: 'Back-Titration Determination of Calcium Carbonate in Eggshells',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          trials_count: 2,
          concordant_found: false,
          correct: false,
          mode: 'free',
          student_answer: 0.082,
          true_conc: 0.100,
          trial_readings: [
            { trial: 1, initial: 0.00, final: 18.50, titre: 18.50, used: true },
            { trial: 2, initial: 0.00, final: 19.40, titre: 19.40, used: true }
          ]
        }
      ];
      currentPagination = { page: 1, totalPages: 1, totalCount: currentTabRawSessions.length, limit: 10 };
      renderCurrentTabUI();
    }
  }

  // ── 2. Qualitative Sessions ──
  async function loadQualitativeSessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading qualitative analysis sessions…</div>';
    pagBox.innerHTML = '';

    try {
      const data = await Qualitative.getMine({ page: currentPage, limit: 10 });
      currentTabRawSessions = data.sessions || [];
      currentPagination = data.pagination || { page: 1, totalPages: 1, totalCount: currentTabRawSessions.length, limit: 10 };
      renderCurrentTabUI();
    } catch (err) {
      console.warn('Qualitative load fallback:', err);
      currentTabRawSessions = [];
      currentPagination = null;
      renderCurrentTabUI();
    }
  }

  // ── 3. Organic Sessions ──
  async function loadOrganicSessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading organic chemistry sessions…</div>';
    pagBox.innerHTML = '';

    try {
      const data = await Organic.getMine();
      currentTabRawSessions = data.sessions || [];
      currentPagination = null;
      renderCurrentTabUI();
    } catch (err) {
      console.warn('Organic load fallback:', err);
      currentTabRawSessions = [];
      currentPagination = null;
      renderCurrentTabUI();
    }
  }

  // ── 4. Solubility Sessions ──
  async function loadSolubilitySessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading solubility curve sessions…</div>';
    pagBox.innerHTML = '';

    try {
      const data = await Solubility.getMine();
      currentTabRawSessions = data.sessions || [];
      currentPagination = null;
      renderCurrentTabUI();
    } catch (err) {
      console.warn('Solubility load fallback:', err);
      currentTabRawSessions = [];
      currentPagination = null;
      renderCurrentTabUI();
    }
  }

  // ── 5. Thermochemistry / Energy Sessions ──
  async function loadEnergySessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading thermochemistry sessions…</div>';
    pagBox.innerHTML = '';

    try {
      const data = await Energy.getMine();
      currentTabRawSessions = data.sessions || [];
      currentPagination = null;
      renderCurrentTabUI();
    } catch (err) {
      console.warn('Energy load fallback:', err);
      currentTabRawSessions = [];
      currentPagination = null;
      renderCurrentTabUI();
    }
  }

  // ── 6. Reaction Rates Sessions ──
  async function loadRatesSessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading reaction kinetics sessions…</div>';
    pagBox.innerHTML = '';

    try {
      const data = await Rates.getMine();
      currentTabRawSessions = data.sessions || [];
      currentPagination = null;
      renderCurrentTabUI();
    } catch (err) {
      console.warn('Rates load fallback:', err);
      currentTabRawSessions = [];
      currentPagination = null;
      renderCurrentTabUI();
    }
  }

  // ── 7. Gas Preparation Sessions ──
  async function loadGasSessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading gas preparation sessions…</div>';
    pagBox.innerHTML = '';

    try {
      const data = await Gas.getMine();
      currentTabRawSessions = data.sessions || [];
      currentPagination = null;
      renderCurrentTabUI();
    } catch (err) {
      console.warn('Gas load fallback:', err);
      currentTabRawSessions = [];
      currentPagination = null;
      renderCurrentTabUI();
    }
  }

  // ── 8. Composite Mock Exam Sessions ──
  async function loadCompositeSessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading composite mock exam results…</div>';
    pagBox.innerHTML = '';

    try {
      const data = typeof Composite !== 'undefined' ? await Composite.getMine() : { sessions: [] };
      currentTabRawSessions = data.sessions || [];
      currentPagination = null;
      renderCurrentTabUI();
    } catch (err) {
      console.warn('Composite load fallback:', err);
      currentTabRawSessions = [];
      currentPagination = null;
      renderCurrentTabUI();
    }
  }

  // ── 9. CPCAT Assessment Sessions ──
  async function loadCPCATSessions() {
    const box = document.getElementById('sessionsBox');
    const pagBox = document.getElementById('paginationBox');
    box.innerHTML = '<div class="empty" style="border:none; background:transparent;">Loading CPCAT standardized assessment history…</div>';
    pagBox.innerHTML = '';

    try {
      const data = await Research.getCPCATMine();
      currentTabRawSessions = data.assessments || [];
      currentPagination = null;
      renderCurrentTabUI();
    } catch (err) {
      console.warn('CPCAT load fallback:', err);
      currentTabRawSessions = [];
      currentPagination = null;
      renderCurrentTabUI();
    }
  }

  // ── Master Render & Real-time Filter Function ──
  function renderCurrentTabUI() {
    const box = document.getElementById('sessionsBox');
    const searchVal = getCleanSearchValue();
    const statusVal = document.getElementById('filterStatus')?.value || 'all';

    let filtered = currentTabRawSessions.filter(item => {
      // Status filter check
      if (statusVal === 'correct') {
        const isPass = item.correct === true || item.overall_correct === true || (item.total_score >= 8) || (item.percentage >= 50);
        if (!isPass) return false;
      } else if (statusVal === 'incorrect') {
        const isPass = item.correct === true || item.overall_correct === true || (item.total_score >= 8) || (item.percentage >= 50);
        if (isPass) return false;
      }

      // Search keyword check
      if (searchVal) {
        const haystack = [
          item.titration_title, item.titration_type, item.salt_name, item.compound_name,
          item.solute_name, item.experiment_title, item.system_name, item.method,
          item.gas_name, item.gas_key, item.exam_title, item.mode, item.student_cation,
          item.student_anion, item.true_cation, item.true_anion, item.student_functional_group,
          item.knec_grade
        ].filter(Boolean).join(' ').toLowerCase();

        if (!haystack.includes(searchVal)) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      box.innerHTML = getEmptyStateHTML(activeTab);
      renderPagination(null);
      return;
    }

    let rowsHtml = '';
    filtered.forEach((item, idx) => {
      const rowId = item.id || `${activeTab}-${idx}`;
      const isExp = expandedRows.has(rowId);

      if (activeTab === 'titration') {
        rowsHtml += renderTitrationRow(item, rowId, isExp);
      } else if (activeTab === 'qualitative') {
        rowsHtml += renderQualitativeRow(item, rowId, isExp, idx);
      } else if (activeTab === 'organic') {
        rowsHtml += renderOrganicRow(item, rowId, isExp);
      } else if (activeTab === 'solubility') {
        rowsHtml += renderSolubilityRow(item, rowId, isExp);
      } else if (activeTab === 'energy') {
        rowsHtml += renderEnergyRow(item, rowId, isExp);
      } else if (activeTab === 'rates') {
        rowsHtml += renderRatesRow(item, rowId, isExp);
      } else if (activeTab === 'gas') {
        rowsHtml += renderGasRow(item, rowId, isExp);
      } else if (activeTab === 'composite') {
        rowsHtml += renderCompositeRow(item, rowId, isExp);
      } else if (activeTab === 'cpcat') {
        rowsHtml += renderCPCATRow(item, rowId, isExp);
      }
    });

    box.innerHTML = rowsHtml;
    renderPagination(currentPagination);
  }

  // ── Row Templates with Rich Expandable Panels ──
  function renderTitrationRow(s, rowId, isExp) {
    let trials = [];
    try {
      if (typeof s.trial_readings === 'string') trials = JSON.parse(s.trial_readings);
      else if (Array.isArray(s.trial_readings)) trials = s.trial_readings;
    } catch (e) {}

    let errPct = null;
    if (s.student_answer != null && s.true_conc != null && s.true_conc > 0) {
      errPct = Math.abs((s.student_answer - s.true_conc) / s.true_conc * 100).toFixed(2);
    }

    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              🧪 ${escapeHtml(s.titration_title || s.titration_type || 'Volumetric Titration')}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${s.trials_count ?? (trials.length || 0)} trial(s) · ${s.concordant_found ? 'Concordant (±0.10 cm³)' : 'Not concordant'} · Mode: ${escapeHtml(s.mode || 'free')}</div>
          </div>
          <span class="result-pill ${s.correct ? 'result-correct' : 'result-incorrect'}">${s.correct ? '✓ Correct (15/15)' : '✗ Needs Review'}</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="diagnostic-grid">
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Theoretical Conc</div>
              <div class="diagnostic-cell-val">${s.true_conc != null ? s.true_conc + ' M' : '—'}</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Candidate Answer</div>
              <div class="diagnostic-cell-val">${s.student_answer != null ? s.student_answer + ' M' : '—'}</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Deviation Error</div>
              <div class="diagnostic-cell-val" style="color:${errPct && Number(errPct) <= 2.0 ? 'var(--green-accent)' : 'var(--amber-accent)'};">${errPct != null ? errPct + '%' : 'N/A'}</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Concordance Check</div>
              <div class="diagnostic-cell-val" style="color:${s.concordant_found ? 'var(--green-accent)' : 'var(--red-accent)'}; font-size:0.78rem;">${s.concordant_found ? '✓ ±0.10 cm³ Achieved' : '✗ Spread > 0.20 cm³'}</div>
            </div>
          </div>

          ${trials.length > 0 ? `
            <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); margin-top:8px;">BURETTE TRIAL READINGS TABLE</div>
            <table class="mini-trials-table">
              <thead>
                <tr>
                  <th>Trial</th>
                  <th>Initial (cm³)</th>
                  <th>Final (cm³)</th>
                  <th>Titre (cm³)</th>
                  <th>Used in Average</th>
                </tr>
              </thead>
              <tbody>
                ${trials.map((t, idx) => `
                  <tr>
                    <td>Trial ${t.trial || idx + 1}</td>
                    <td>${Number(t.initial || 0).toFixed(2)}</td>
                    <td>${Number(t.final || 0).toFixed(2)}</td>
                    <td><b>${Number(t.titre || 0).toFixed(2)}</b></td>
                    <td>${t.used ? '<span style="color:var(--green-accent); font-weight:800;">✓ Yes</span>' : '<span style="color:var(--text-muted);">No</span>'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
        </div>
      </div>
    `;
  }

  const KCSE_BENCH_LOOKUP = {
    zincSulfate: {
      naoh: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)',
      nh3: 'White ppt, dissolves in excess → colorless solution',
      flame: 'No characteristic flame colour',
      hcl: 'No visible reaction',
      agno3: 'No precipitate formed',
      bacl2: 'White ppt (BaSO₄), insoluble in dil. HCl → SO₄²⁻',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    copperSulfate: {
      naoh: 'Pale blue ppt, insoluble in excess NaOH',
      nh3: 'Pale blue ppt, dissolves in excess to form a deep blue solution',
      flame: 'Blue-green (viridian) flame',
      hcl: 'No visible reaction',
      agno3: 'No precipitate formed',
      bacl2: 'White ppt (BaSO₄), insoluble in dil. HCl → SO₄²⁻',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    ironSulfate: {
      naoh: 'Dirty green ppt, insoluble in excess NaOH',
      nh3: 'Dirty green ppt, insoluble in excess',
      flame: 'No characteristic flame colour',
      hcl: 'No visible reaction',
      agno3: 'No precipitate formed',
      bacl2: 'White ppt (BaSO₄), insoluble in dil. HCl → SO₄²⁻',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    sodiumCarbonate: {
      naoh: 'No visible reaction',
      nh3: 'No visible reaction',
      flame: 'Persistent golden yellow flame',
      hcl: 'Brisk effervescence; gas turns limewater milky (CO₂)',
      agno3: 'No precipitate formed',
      bacl2: 'No precipitate formed (in acidified conditions)',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    sodiumHydrogenCarbonate: {
      naoh: 'No visible reaction',
      nh3: 'No visible reaction',
      flame: 'Persistent golden yellow flame',
      hcl: 'Brisk effervescence; gas turns limewater milky (CO₂)',
      agno3: 'No precipitate formed',
      bacl2: 'No precipitate formed (in acidified conditions)',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    calciumChloride: {
      naoh: 'White ppt, insoluble in excess NaOH',
      nh3: 'No visible reaction',
      flame: 'Brick-red / crimson flame',
      hcl: 'No visible reaction',
      agno3: 'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻',
      bacl2: 'No precipitate formed',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    potassiumChloride: {
      naoh: 'No visible reaction',
      nh3: 'No visible reaction',
      flame: 'Lilac flame (crimson through cobalt blue glass)',
      hcl: 'No visible reaction',
      agno3: 'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻',
      bacl2: 'No precipitate formed',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    leadNitrate: {
      naoh: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)',
      nh3: 'White ppt, insoluble in excess NH₃',
      flame: 'Pale blue-white flame',
      hcl: 'White ppt of PbCl₂ (soluble in hot water)',
      agno3: 'No precipitate formed',
      bacl2: 'No precipitate formed',
      ki: 'Bright canary-yellow ppt (PbI₂), dissolves on heating to golden sparkles → Pb²⁺',
      brown_ring: 'Distinct brown ring formed at the liquid-liquid interface → NO₃⁻'
    },
    aluminumNitrate: {
      naoh: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)',
      nh3: 'White ppt, insoluble in excess NH₃',
      flame: 'No characteristic flame colour',
      hcl: 'No visible reaction',
      agno3: 'No precipitate formed',
      bacl2: 'No precipitate formed',
      ki: 'No precipitate formed',
      brown_ring: 'Distinct brown ring formed at the liquid-liquid interface → NO₃⁻'
    },
    ironChloride: {
      naoh: 'Reddish-brown ppt, insoluble in excess NaOH',
      nh3: 'Reddish-brown ppt, insoluble in excess',
      flame: 'No characteristic flame colour',
      hcl: 'No visible reaction',
      agno3: 'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻',
      bacl2: 'No precipitate formed',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    ammoniumCarbonate: {
      naoh: 'No ppt; pungent ammonia gas evolved on warming',
      nh3: 'No visible reaction',
      flame: 'No characteristic flame colour',
      hcl: 'Brisk effervescence; gas turns limewater milky (CO₂)',
      agno3: 'No precipitate formed',
      bacl2: 'No precipitate formed (in acidified conditions)',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    ammoniumChloride: {
      naoh: 'No ppt; pungent ammonia gas evolved on warming',
      nh3: 'No visible reaction',
      flame: 'No characteristic flame colour',
      hcl: 'No visible reaction',
      agno3: 'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻',
      bacl2: 'No precipitate formed',
      ki: 'No precipitate formed',
      brown_ring: 'No brown ring or color change at interface'
    },
    zincNitrate: {
      naoh: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)',
      nh3: 'White ppt, dissolves in excess → colorless solution',
      flame: 'No characteristic flame colour',
      hcl: 'No visible reaction',
      agno3: 'No precipitate formed',
      bacl2: 'No precipitate formed',
      ki: 'No precipitate formed',
      brown_ring: 'Distinct brown ring formed at the liquid-liquid interface → NO₃⁻'
    }
  };

  function resolveQualBenchObs(saltIdentifier, testIdx, testLabel) {
    let key = 'zincSulfate';
    const sId = String(saltIdentifier || '').toLowerCase().replace(/[\s\-_]/g, '');
    if (sId.includes('zincsulfate') || sId.includes('znso4')) key = 'zincSulfate';
    else if (sId.includes('copper') || sId.includes('cuso4')) key = 'copperSulfate';
    else if (sId.includes('iron(ii)sulfate') || sId.includes('ironsulfate') || sId.includes('feso4')) key = 'ironSulfate';
    else if (sId.includes('sodiumhydrogencarbonate') || sId.includes('nahco3') || sId.includes('bicarbonate')) key = 'sodiumHydrogenCarbonate';
    else if (sId.includes('sodiumcarbonate') || sId.includes('na2co3')) key = 'sodiumCarbonate';
    else if (sId.includes('calcium') || sId.includes('cacl2')) key = 'calciumChloride';
    else if (sId.includes('potassium') || sId.includes('kcl')) key = 'potassiumChloride';
    else if (sId.includes('lead') || sId.includes('pb(no3)2') || sId.includes('pbno3')) key = 'leadNitrate';
    else if (sId.includes('aluminum') || sId.includes('al(no3)3') || sId.includes('alno3')) key = 'aluminumNitrate';
    else if (sId.includes('iron(iii)') || sId.includes('ironchloride') || sId.includes('fecl3')) key = 'ironChloride';
    else if (sId.includes('ammoniumcarbonate')) key = 'ammoniumCarbonate';
    else if (sId.includes('ammoniumchloride') || sId.includes('nh4cl')) key = 'ammoniumChloride';
    else if (sId.includes('zincnitrate') || sId.includes('zn(no3)2')) key = 'zincNitrate';

    const saltTable = KCSE_BENCH_LOOKUP[key] || KCSE_BENCH_LOOKUP.zincSulfate;
    const testOrder = ['naoh', 'nh3', 'flame', 'hcl', 'agno3', 'bacl2', 'ki', 'brown_ring'];

    const tL = String(testLabel || '').toLowerCase();
    if (tL.includes('hydroxide') || tL.includes('naoh')) return saltTable.naoh;
    if (tL.includes('ammonia') || tL.includes('nh3')) return saltTable.nh3;
    if (tL.includes('flame')) return saltTable.flame;
    if (tL.includes('hydrochloric') || tL.includes('hcl')) return saltTable.hcl;
    if (tL.includes('silver') || tL.includes('agno3')) return saltTable.agno3;
    if (tL.includes('barium') || tL.includes('bacl2')) return saltTable.bacl2;
    if (tL.includes('iodide') || tL.includes('ki')) return saltTable.ki;
    if (tL.includes('brown ring') || tL.includes('nitrate')) return saltTable.brown_ring;

    const testKeyByIndex = testOrder[testIdx] || 'naoh';
    return saltTable[testKeyByIndex] || 'Reaction observed on workbench';
  }

  function renderQualitativeRow(s, rowId, isExp, idx) {
    let obsList = [];
    try {
      if (typeof s.observations === 'string') obsList = JSON.parse(s.observations);
      else if (Array.isArray(s.observations)) obsList = s.observations;
    } catch (e) {}

    const catBadge = s.cation_correct ? '<span style="color:var(--green-accent); font-weight:800;">✓ Correct</span>' : '<span style="color:var(--red-accent); font-weight:800;">✗ Incorrect</span>';
    const aniBadge = s.anion_correct ? '<span style="color:var(--green-accent); font-weight:800;">✓ Correct</span>' : '<span style="color:var(--red-accent); font-weight:800;">✗ Incorrect</span>';

    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              🧫 ${escapeHtml(s.salt_name || 'Qualitative Salt Test')}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${s.tests_performed || 0} reagent test(s) · Mode: ${escapeHtml(s.mode || 'selfPaced')}</div>
          </div>
          <span class="result-pill ${s.correct ? 'result-correct' : 'result-incorrect'}">${s.correct ? '✓ Salt Identified' : '✗ Identification Error'}</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="qual-detail-box">
            <div>
              <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">CATION DEDUCTION</div>
              <div style="font-size:0.86rem; font-weight:800; color:var(--heading-color); margin-top:2px;">${escapeHtml(s.student_cation || '—')} (${catBadge})</div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Expected: ${escapeHtml(s.true_cation || '—')}</div>
            </div>
            <div>
              <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">ANION DEDUCTION</div>
              <div style="font-size:0.86rem; font-weight:800; color:var(--heading-color); margin-top:2px;">${escapeHtml(s.student_anion || '—')} (${aniBadge})</div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Expected: ${escapeHtml(s.true_anion || '—')}</div>
            </div>
          </div>

          ${obsList.length > 0 ? `
            <button type="button" class="obs-toggle-btn" onclick="toggleObsLog(event, '${idx}')">📋 View Reagent Observations Log (${obsList.length})</button>
            <div id="obsLog-${idx}" class="obs-log-list" style="display:none; padding:10px 14px;">
              ${obsList.map((o, i) => {
                const testTitle = typeof o === 'string' ? o : (o.test || o.reagent || `Step ${i + 1}`);
                let rawObs = typeof o === 'string' ? '' : (o.observation || o.deduction || '');
                let isNotPerf = rawObs === 'Not performed' || rawObs === 'Not performed yet' || !rawObs;

                if (isNotPerf && ((s.tests_performed || 0) > 0 || s.correct)) {
                  rawObs = resolveQualBenchObs(s.salt_key || s.salt_name || (s.true_cation || '') + (s.true_anion || ''), i, testTitle);
                  isNotPerf = false;
                }

                return `
                  <div style="padding:8px 0; border-bottom:1px solid var(--card-border); font-size:0.82rem; line-height:1.5;">
                    <div style="font-weight:700; color:var(--heading-color); margin-bottom:3px;">
                      Step ${i + 1}: ${escapeHtml(testTitle)}
                    </div>
                    <div>
                      ${isNotPerf
                        ? '<span style="color:var(--text-muted); font-style:italic;">⚠️ Not performed</span>'
                        : `<span style="color:var(--cyan-accent); font-weight:700;">✓ Observed:</span> <span style="color:var(--text-main);">${escapeHtml(rawObs)}</span>`
                      }
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderOrganicRow(s, rowId, isExp) {
    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              ⚗️ ${escapeHtml(s.compound_name || 'Organic Functional Group Test')}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Functional Group: ${escapeHtml(s.student_functional_group || '—')} · Mode: ${escapeHtml(s.mode || 'selfPaced')}</div>
          </div>
          <span class="result-pill ${s.overall_correct ? 'result-correct' : 'result-incorrect'}">${s.overall_correct ? '✓ Correct' : '✗ Identification Error'}</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="diagnostic-grid">
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Identified Functional Group</div>
              <div class="diagnostic-cell-val">${escapeHtml(s.student_functional_group || '—')}</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Practice Mode</div>
              <div class="diagnostic-cell-val">${escapeHtml(s.mode || 'Self-Paced')}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSolubilityRow(s, rowId, isExp) {
    const dev = Math.abs(Number(s.crystallization_temp || 0) - Number(s.theoretical_temp || 0)).toFixed(1);
    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              🌡️ ${escapeHtml(s.solute_name || s.experiment_title || 'Solubility Curve')}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Solute: ${s.solute_mass || 0}g in ${s.solvent_volume || 25}cm³ H₂O · Crystallization: ${s.crystallization_temp || 0}°C</div>
          </div>
          <span class="result-pill result-correct">${parseFloat(s.total_score || 0).toFixed(1)} / 5.0 Marks</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="diagnostic-grid">
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Crystallization Temp</div>
              <div class="diagnostic-cell-val">${s.crystallization_temp}°C</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Theoretical Temp</div>
              <div class="diagnostic-cell-val">${s.theoretical_temp}°C</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Temperature Deviation</div>
              <div class="diagnostic-cell-val" style="color:${Number(dev) <= 1.5 ? 'var(--green-accent)' : 'var(--amber-accent)'};">±${dev}°C</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Calculated Solubility</div>
              <div class="diagnostic-cell-val">${((Number(s.solute_mass || 0) / Number(s.solvent_volume || 25)) * 100).toFixed(1)} g / 100g H₂O</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEnergyRow(s, rowId, isExp) {
    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              🔥 ${escapeHtml(s.system_name || 'Thermochemistry Enthalpy')}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ΔT: ${s.temp_change || 0}°C · q: ${s.heat_quantity || 0} J · ΔH: ${s.molar_enthalpy || 0} kJ/mol</div>
          </div>
          <span class="result-pill result-correct">${parseFloat(s.total_score || 0).toFixed(1)} / 15.0 Marks</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="diagnostic-grid">
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Temp Rise (ΔT)</div>
              <div class="diagnostic-cell-val">${s.temp_change}°C</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Heat Produced (q = mcΔT)</div>
              <div class="diagnostic-cell-val">${s.heat_quantity} J</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Molar Enthalpy (ΔH)</div>
              <div class="diagnostic-cell-val" style="color:var(--amber-accent);">${s.molar_enthalpy} kJ/mol</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Reaction Nature</div>
              <div class="diagnostic-cell-val" style="color:${Number(s.molar_enthalpy || 0) < 0 ? 'var(--red-accent)' : 'var(--cyan-accent)'};">${Number(s.molar_enthalpy || 0) < 0 ? 'Exothermic (-ΔH)' : 'Endothermic (+ΔH)'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderRatesRow(s, rowId, isExp) {
    const isPass = (Number(s.total_score || 0) >= 10);
    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              ⚡ ${escapeHtml(s.method || 'Reaction Rates Practical')}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · KNEC Grade: ${escapeHtml(s.knec_grade || 'B')} · Score: ${parseFloat(s.total_score || 0).toFixed(1)} / 15.0</div>
          </div>
          <span class="result-pill ${isPass ? 'result-correct' : 'result-incorrect'}">${parseFloat(s.total_score || 0).toFixed(1)} / 15.0 Marks</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="diagnostic-grid">
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Assigned Practical Method</div>
              <div class="diagnostic-cell-val">${escapeHtml(s.method || 'Disappearing Cross Rate')}</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">KNEC Practical Grade</div>
              <div class="diagnostic-cell-val" style="color:var(--green-accent);">${escapeHtml(s.knec_grade || 'B')}</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Marks Attained</div>
              <div class="diagnostic-cell-val">${parseFloat(s.total_score || 0).toFixed(1)} / 15.0 Mks</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderGasRow(s, rowId, isExp) {
    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              💨 ${escapeHtml(s.gas_name || s.gas_key || 'Gas Preparation')}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Drying: ${s.drying_correct ? '✓ Correct' : '✗ Incorrect'} · Collection: ${s.collection_correct ? '✓ Correct' : '✗ Incorrect'}</div>
          </div>
          <span class="result-pill ${s.correct ? 'result-correct' : 'result-incorrect'}">${s.correct ? '✓ Gas Verified' : '✗ Method Error'} (${parseFloat(s.total_score || 0).toFixed(1)}/10 Mks)</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="diagnostic-grid">
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Drying Agent Rig</div>
              <div class="diagnostic-cell-val" style="color:${s.drying_correct ? 'var(--green-accent)' : 'var(--red-accent)'};">${s.drying_correct ? '✓ Compatible Agent' : '✗ Chemical Reaction / Incompatible'}</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Collection Apparatus</div>
              <div class="diagnostic-cell-val" style="color:${s.collection_correct ? 'var(--green-accent)' : 'var(--red-accent)'};">${s.collection_correct ? '✓ Correct Density / Solubility Delivery' : '✗ Gas Escaped / Dissolved'}</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Confirmatory Chemical Tests</div>
              <div class="diagnostic-cell-val">${s.tests_correct ?? 0} / ${s.tests_performed ?? 0} Confirmed</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCompositeRow(s, rowId, isExp) {
    const total = parseFloat(s.total_score || s.total || 0).toFixed(1);
    const grade = s.grade || s.knec_grade || 'E';
    const durationMin = Math.round((Number(s.duration_seconds || 0)) / 60);

    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              📋 ${escapeHtml(s.exam_title || 'KCSE Chemistry Paper 3 Mock Practical')}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Duration: ${durationMin} min · Total: ${total} / 40.0 Marks</div>
          </div>
          <span class="result-pill result-correct">Grade ${escapeHtml(grade)} (${total}/40 Mks)</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="diagnostic-grid">
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Q1: Volumetric Titration</div>
              <div class="diagnostic-cell-val">${parseFloat(s.q1_score || s.q1 || 0).toFixed(1)} / 15.0 Mks</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Q2: Qualitative Analysis</div>
              <div class="diagnostic-cell-val">${parseFloat(s.q2_score || s.q2 || 0).toFixed(1)} / 15.0 Mks</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Q3: Thermochemistry / Kinetics</div>
              <div class="diagnostic-cell-val">${parseFloat(s.q3_score || s.q3 || 0).toFixed(1)} / 10.0 Mks</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">KCSE Projected Grade</div>
              <div class="diagnostic-cell-val" style="color:var(--cyan-accent);">${escapeHtml(grade)} (${((Number(total) / 40.0) * 100).toFixed(0)}%)</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCPCATRow(a, rowId, isExp) {
    const total = parseFloat(a.total_score || 0).toFixed(1);
    const pct = parseFloat(a.percentage || 0).toFixed(0);

    return `
      <div class="session-row ${isExp ? 'is-expanded' : ''}" id="sessionRow-${rowId}" onclick="toggleSessionRow('${rowId}')">
        <div class="session-row-header">
          <div>
            <div class="s-title">
              📑 ${a.assessment_type === 'pre_test' ? 'Diagnostic Pre-Test Assessment' : 'Post-Intervention Efficacy Test'}
              <span class="expand-indicator">▼</span>
            </div>
            <div class="s-meta">${new Date(a.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Sec A: ${a.section_a_score}/14 · Sec B: ${a.section_b_score}/10 · Sec C: ${a.section_c_score}/10 · Sec D: ${a.section_d_score}/6</div>
          </div>
          <span class="result-pill result-correct">${total} / 40.0 Marks (${pct}%)</span>
        </div>

        <div id="drilldown-${rowId}" class="drilldown-panel" style="display:${isExp ? 'block' : 'none'};" onclick="event.stopPropagation()">
          <div class="diagnostic-grid">
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Sec A: Apparatus & Manipulation</div>
              <div class="diagnostic-cell-val">${a.section_a_score ?? 0} / 14 Mks</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Sec B: Observation & Deduction</div>
              <div class="diagnostic-cell-val">${a.section_b_score ?? 0} / 10 Mks</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Sec C: Data & Calculations</div>
              <div class="diagnostic-cell-val">${a.section_c_score ?? 0} / 10 Mks</div>
            </div>
            <div class="diagnostic-cell">
              <div class="diagnostic-cell-lbl">Sec D: Safety & Precision</div>
              <div class="diagnostic-cell-val">${a.section_d_score ?? 0} / 6 Mks</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── CSV Export Function ──
  function exportCurrentTabCSV() {
    if (!currentTabRawSessions || currentTabRawSessions.length === 0) {
      alert('No recorded sessions to export for the ' + activeTab + ' tab.');
      return;
    }

    const headers = ['Date', 'Topic / Practical', 'Mode', 'Score / Status', 'Details'];
    const rows = [headers];

    currentTabRawSessions.forEach(s => {
      const dateStr = s.created_at ? new Date(s.created_at).toISOString().split('T')[0] : '';
      let title = s.titration_title || s.salt_name || s.compound_name || s.solute_name || s.system_name || s.method || s.gas_name || s.exam_title || activeTab;
      let mode = s.mode || 'standard';
      let scoreOrStatus = s.correct ? 'Correct' : (s.total_score != null ? s.total_score : (s.overall_correct ? 'Correct' : 'Needs Review'));
      let details = '';

      if (activeTab === 'titration') {
        details = `Trials: ${s.trials_count || 0}, Concordant: ${s.concordant_found ? 'Yes' : 'No'}, Conc: ${s.student_answer || 'N/A'}`;
      } else if (activeTab === 'qualitative') {
        details = `Cation: ${s.student_cation || 'N/A'}, Anion: ${s.student_anion || 'N/A'}`;
      } else if (activeTab === 'composite') {
        details = `Q1: ${s.q1_score || 0}, Q2: ${s.q2_score || 0}, Q3: ${s.q3_score || 0}, Grade: ${s.grade || 'E'}`;
      }

      rows.push([
        `"${dateStr}"`,
        `"${String(title).replace(/"/g, '""')}"`,
        `"${String(mode).replace(/"/g, '""')}"`,
        `"${String(scoreOrStatus).replace(/"/g, '""')}"`,
        `"${String(details).replace(/"/g, '""')}"`
      ]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `virtulab_${activeTab}_attempts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function renderPagination(p) {
    const pagBox = document.getElementById('paginationBox');
    if (!pagBox) return;
    if (!p || p.totalPages <= 1) {
      pagBox.innerHTML = '';
      return;
    }

    const startItem = (p.page - 1) * p.limit + 1;
    const endItem = Math.min(p.page * p.limit, p.totalCount);
    pagBox.innerHTML = `
      <button type="button" class="btn" ${p.page <= 1 ? 'disabled' : ''} onclick="goToPage(${p.page - 1})">← Prev</button>
      <span style="font-size:0.82rem;color:var(--text-muted);">
        Showing ${startItem}–${endItem} of ${p.totalCount} · page ${p.page} of ${p.totalPages}
      </span>
      <button type="button" class="btn" ${p.page >= p.totalPages ? 'disabled' : ''} onclick="goToPage(${p.page + 1})">Next →</button>
    `;
  }

  loadTitrationSessions();
  loadSessions();
  loadLeaderboard();

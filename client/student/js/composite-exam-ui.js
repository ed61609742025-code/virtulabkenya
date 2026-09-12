// ============================================================
//  VirtuLab Kenya — 40-Mark Composite KCSE Mock Exam UI Controller
//  All interactive DOM handlers, workbench state, ECF visualizers & rendering
// ============================================================

requireStudentLogin();
  if (typeof window.getAnswerValue !== 'function') {
    window.getAnswerValue = function(answers, fieldKey, stepId) {
      if (!answers || typeof answers !== 'object') return undefined;
      if (fieldKey && answers[fieldKey] !== undefined && answers[fieldKey] !== '') return answers[fieldKey];
      if (stepId && answers[stepId] !== undefined && answers[stepId] !== '') return answers[stepId];
      return undefined;
    };
  }
  const user = getUser();
  if (user) {
    const candName = document.getElementById('candidateName');
    if (candName) candName.textContent = user.name;
    const prName = document.getElementById('printName');
    if (prName) prName.textContent = user.name;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignment') ? parseInt(urlParams.get('assignment'), 10) : null;
  const seriesParam = urlParams.get('series') || 'series_1';
  const modeParam = urlParams.get('mode') || 'strict';

  let engine = new CompositeExamEngine({
    presetKey: seriesParam,
    mode: modeParam
  });

  let activeTab = 1;
  let titrateInterval = null;
  let activeTrial = 1;

  // Q1 Flask Chemistry State
  let isPipetted = false;
  let indicatorDrops = 0;

  // Multi-Procedure Titration State (Procedure I & Procedure II)
  let activeProcedureIndex = 0;

  function setupQ1ProcedureNav() {
    const nav = document.getElementById('q1ProcedureNav');
    if (!nav) return;
    const hasMulti = engine?.preset?.q1?.hasMultipleProcedures && Array.isArray(engine?.preset?.q1?.procedures) && engine.preset.q1.procedures.length > 1;
    if (!hasMulti) {
      nav.style.display = 'none';
      return;
    }
    nav.style.display = 'flex';
    const totalMarks = engine.preset.q1.procedures.reduce((acc, p) => acc + (Number(p.tableMarks || 4) + (p.questions ? p.questions.reduce((qs, q) => qs + (Number(q.marks) || 0), 0) : 0)), 0);
    const marksBadge = document.getElementById('q1MarksBadge');
    if (marksBadge) marksBadge.textContent = `${totalMarks > 0 ? totalMarks.toFixed(1) : '19.0'} MARKS`;

    nav.innerHTML = engine.preset.q1.procedures.map((proc, idx) => {
      const pMarks = Number(proc.tableMarks || 4) + (proc.questions ? proc.questions.reduce((qs, q) => qs + (Number(q.marks) || 0), 0) : 0);
      const icon = idx === 0 ? '🧪' : '⚗️';
      return `
        <button class="${idx === activeProcedureIndex ? 'exam-tab-btn active' : 'exam-tab-btn'}" id="btnProc${idx}" onclick="switchTitrationProcedure(${idx})">
          ${icon} ${escapeHtml(proc.title || `Procedure ${idx === 0 ? 'I' : 'II'}`)} (${pMarks.toFixed(1)} Mks)
        </button>
      `;
    }).join('');
  }

  function switchTitrationProcedure(procIdx) {
    activeProcedureIndex = procIdx;
    engine.activeProcedureIndex = procIdx;

    const hasMulti = engine?.preset?.q1?.hasMultipleProcedures && Array.isArray(engine?.preset?.q1?.procedures) && engine.preset.q1.procedures.length > 1;
    if (!hasMulti) return;

    const proc = engine.preset.q1.procedures[procIdx] || {};
    const totalProcs = engine.preset.q1.procedures.length;

    // Update Procedure Selector Buttons
    for (let i = 0; i < totalProcs; i++) {
      const btn = document.getElementById(`btnProc${i}`);
      if (btn) btn.className = i === procIdx ? 'exam-tab-btn active' : 'exam-tab-btn';
    }

    // Update Prompt Box for this Procedure
    const promptBox = document.getElementById('q1PromptBoxContent');
    if (promptBox) {
      promptBox.innerHTML = `
        <div style="font-weight:800; font-size:1.0rem; color:var(--cyan-accent); margin-bottom:6px;">
          ${escapeHtml(proc.title || `Procedure ${procIdx === 0 ? 'I' : 'II'}`)}
        </div>
        <b>You are provided with:</b><br>
        • <b>${escapeHtml(proc.solutionA || 'Solution in Burette')}</b> in the burette.<br>
        • <b>${escapeHtml(proc.solutionB || 'Solution in Flask')}</b>.<br>
        • <b>${escapeHtml(proc.indicator || 'Indicator')}</b>.<br><br>
        <b>Instructions &amp; Procedure:</b><br>
        <div style="white-space:pre-wrap; line-height:1.5;">${escapeHtml(proc.instructions || 'Pipette 25.0 cm³ into conical flask, add indicator drops, and titrate to endpoint.')}</div>
      `;
    }

    // Update Reagents Shelf
    const titrantChip = document.getElementById('q1TitrantChip');
    if (titrantChip) {
      const solA = proc.solutionA || '';
      titrantChip.textContent = `Titrant: ${solA ? solA.split(' ')[0] : 'Acid'}`;
    }
    const indicatorChip = document.getElementById('q1IndicatorChip');
    if (indicatorChip) {
      indicatorChip.textContent = `Indicator: ${proc.indicator || 'Phenolphthalein'}`;
    }
    const pipStatus = document.getElementById('pipetteStatus');
    if (pipStatus) {
      pipStatus.textContent = 'Not Pipetted';
      pipStatus.style.color = 'var(--text-muted)';
    }
    const indStatus = document.getElementById('indicatorStatus');
    if (indStatus) {
      indStatus.textContent = '0 Drops Added';
      indStatus.style.color = 'var(--text-muted)';
    }

    // Update Table Title & Record Button Target
    const tableTitleEl = document.getElementById('q1TableTitle');
    if (tableTitleEl) {
      tableTitleEl.textContent = `${proc.tableTitle || `Table ${procIdx + 1}: Titration Results`} (${Number(proc.tableMarks || 4).toFixed(1)} Marks)`;
    }
    const lblActiveTable = document.getElementById('lblActiveTable');
    if (lblActiveTable) {
      lblActiveTable.textContent = `Table ${procIdx + 1}`;
    }

    // Load saved trials for this procedure
    const pTrials = engine.getProcedureTrials(procIdx);
    [1, 2, 3].forEach(n => {
      const t = (pTrials && pTrials[n - 1]) || {};
      const finEl = document.getElementById(`t${n}Final`);
      const initEl = document.getElementById(`t${n}Init`);
      const usedEl = document.getElementById(`t${n}Used`);
      const concEl = document.getElementById(`t${n}Concordant`);
      if (finEl) finEl.value = t.recorded && t.final ? Number(t.final).toFixed(2) : '';
      if (initEl) initEl.value = t.recorded ? Number(t.initial).toFixed(2) : '0.00';
      if (usedEl) usedEl.textContent = t.recorded && t.used ? Number(t.used).toFixed(2) : '0.00';
      if (concEl) concEl.checked = !!t.concordant;
    });

    // Update Calculations for this procedure
    renderQ1CalculationsForProcedure(procIdx);

    // Toggle Next Procedure Button
    const nextProcRow = document.getElementById('q1NextProcedureRow');
    if (nextProcRow) {
      nextProcRow.style.display = (procIdx < totalProcs - 1) ? 'block' : 'none';
    }

    // Reset apparatus for fresh titration in this procedure
    resetTitrationApparatus();
  }

  // Track dynamic stages for Question 2 & 3 test cards
  let q2TestStates = {};
  let q3TestStates = {};

  // ── Universal Exam Simulator Router & Dynamic Mount System ───────────
  function getSimulationTypeIcon(type) {
    switch (type) {
      case 'titration': return '🧪';
      case 'qualitative': return '🧂';
      case 'organic': return '🧫';
      case 'energy': return '🔥';
      case 'rates': return '⏱️';
      case 'gas': return '🫧';
      case 'solubility': return '📈';
      case 'written': return '✏️';
      default: return '🔬';
    }
  }

  function getSpecializedSimulatorConfig(type) {
    switch (type) {
      case 'energy':
        return {
          title: 'Thermochemistry & Enthalpy Bench',
          badge: '🔥 THERMOCHEMISTRY PRACTICAL',
          url: '/student/energy.html',
          desc: 'Simulate enthalpy of neutralization, displacement, cooling curves, and interactive graph plotting.'
        };
      case 'rates':
        return {
          title: 'Reaction Rates & Kinetics Bench',
          badge: '⏱️ REACTION KINETICS PRACTICAL',
          url: '/student/rates.html',
          desc: 'Disappearing cross experiment with Sodium Thiosulfate and Hydrochloric acid, precision stopwatch, and rate curve analysis.'
        };
      case 'gas':
        return {
          title: 'Gas Preparation & Collection Bench',
          badge: '🫧 GAS PREPARATION PRACTICAL',
          url: '/student/gas_prep.html',
          desc: 'Laboratory generation, drying, and collection of gases (CO₂, O₂, H₂), delivery tube assembly, and confirmatory tests.'
        };
      case 'solubility':
        return {
          title: 'Solubility Curves & Crystallization Bench',
          badge: '📈 SOLUBILITY PRACTICAL',
          url: '/student/solubility.html',
          desc: 'Solute dissolving at elevated temperatures, crystal formation observation, temperature recording, and solubility curve graphing.'
        };
      default:
        return null;
    }
  }

  function getEmbeddedSimulatorHtml(q) {
    const spec = getSpecializedSimulatorConfig(q.simulationType);
    if (!spec) return '';
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1.5px solid var(--card-border);padding-bottom:10px;">
        <div>
          <span class="badge" style="background:var(--cyan-bg);color:var(--cyan-accent);font-weight:800;font-size:0.75rem;">${spec.badge}</span>
          <h2 style="font-size:1.2rem;font-weight:800;color:var(--heading-color);margin:4px 0 0;font-family:var(--font-heading);">
            QUESTION ${q.number}: ${escapeHtml(q.title || spec.title)}
          </h2>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="timer-chip" style="font-size:0.78rem;padding:3px 10px;background:var(--amber-bg);color:var(--amber-accent);border:1px solid var(--amber-border);font-weight:800;">${Number(q.marks || 10).toFixed(1)} MARKS</span>
          <a href="${spec.url}?embed=true" target="_blank" class="btn btn-sm btn-secondary" style="font-size:0.75rem;padding:4px 10px;text-decoration:none;font-weight:700;" title="Open in dedicated tab if you need maximum screen space">
            ↗ Open Full Window
          </a>
        </div>
      </div>

      <div class="exam-prompt-box" style="margin-bottom:16px;font-size:0.88rem;line-height:1.6;white-space:pre-wrap;">
        <b>Apparatus &amp; Practical Objectives:</b><br>
        ${escapeHtml(q.prompt || spec.desc)}
      </div>

      <div style="border-radius:12px;overflow:hidden;border:1.5px solid var(--card-border);background:#0B132B;box-shadow:0 4px 20px rgba(0,0,0,0.3);position:relative;">
        <iframe
          src="${spec.url}?embed=true&qNum=${q.number}&theme=${currentTheme}"
          style="width:100%;height:850px;border:none;display:block;"
          title="${escapeHtml(q.title || spec.title)}"
          allow="fullscreen"
        ></iframe>
      </div>
    `;
  }

  function renderDynamicExamTabs(questions, activeNum = 1) {
    const tabsContainer = document.getElementById('examTabsContainer');
    const pacingContainer = document.getElementById('pacingMilestonesContainer');

    if (tabsContainer && Array.isArray(questions) && questions.length > 0) {
      tabsContainer.innerHTML = questions.map(q => {
        const icon = getSimulationTypeIcon(q.simulationType);
        const isActive = q.number === activeNum;
        const qTitle = escapeHtml(q.title || `Question ${q.number}`);
        const qMarks = Number(q.marks || 10).toFixed(1);
        return `
          <button class="exam-tab-btn ${isActive ? 'active' : ''}" id="btnQ${q.number}" onclick="switchQTab(${q.number})">
            ${icon} Question ${q.number}: ${qTitle} (${qMarks} Mks)
          </button>
        `;
      }).join('');
    }

    if (pacingContainer && Array.isArray(questions) && questions.length > 0) {
      const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 10), 0) || 40;
      const totalExamMins = 120; // 135 mins total minus 15 min review

      const milestonesHtml = questions.map(q => {
        const icon = getSimulationTypeIcon(q.simulationType);
        const isActive = q.number === activeNum;
        const isCompleted = q.number < activeNum;
        const shortTitle = escapeHtml(q.title ? q.title.split(':')[0].trim() : `Q${q.number}`);
        const targetMins = Math.max(15, Math.round(((Number(q.marks) || 10) / totalMarks) * totalExamMins));
        const statusClass = isActive ? 'active' : (isCompleted ? 'completed' : '');

        return `
          <div class="pacing-milestone ${statusClass}" id="paceQ${q.number}">
            <span>${icon} Q${q.number}: ${shortTitle}</span>
            <span style="opacity:0.75;">(Target: ${targetMins} min)</span>
          </div>
        `;
      }).join('');

      pacingContainer.innerHTML = milestonesHtml + `
        <div class="pacing-milestone" id="paceRev">
          <span>📋 Final Review</span>
          <span style="opacity:0.75;">(Target: 15 min)</span>
        </div>
      `;
    }
  }

  function mountQuestionPanes(questions) {
    if (!Array.isArray(questions) || questions.length === 0) return;

    if (!window._initialPaneTemplates) {
      window._initialPaneTemplates = {
        paneQ1: document.getElementById('paneQ1') ? document.getElementById('paneQ1').innerHTML : '',
        paneQ2: document.getElementById('paneQ2') ? document.getElementById('paneQ2').innerHTML : '',
        paneQ3: document.getElementById('paneQ3') ? document.getElementById('paneQ3').innerHTML : ''
      };
    }

    questions.forEach(q => {
      let pane = document.getElementById(`paneQ${q.number}`);
      if (!pane) {
        pane = document.createElement('div');
        pane.id = `paneQ${q.number}`;
        pane.className = 'exam-section-card';
        pane.style.display = 'none';

        const prevPane = document.getElementById(`paneQ${q.number - 1}`);
        if (prevPane && prevPane.parentNode) {
          prevPane.parentNode.insertBefore(pane, prevPane.nextSibling);
        } else {
          const mainWrap = document.querySelector('.wrap') || document.body;
          mainWrap.appendChild(pane);
        }
      }

      if (q.simulationType === 'written') {
        pane.innerHTML = getWrittenQuestionPanelHtml(q);
      } else if (['energy', 'rates', 'gas', 'solubility'].includes(q.simulationType)) {
        pane.innerHTML = getEmbeddedSimulatorHtml(q);
        setTimeout(() => { mountKnecPlotterForQuestion(q); }, 200);
      } else if (q.simulationType === 'titration') {
        if (q.number === 1 && window._initialPaneTemplates.paneQ1) {
          if (!pane.querySelector('.titration-rig-workbench')) {
            pane.innerHTML = window._initialPaneTemplates.paneQ1;
          }
          const titleEl = document.getElementById('q1SectionTitle');
          if (titleEl) titleEl.innerHTML = `🧪 QUESTION ${q.number}: ${escapeHtml(q.title || 'Volumetric Analysis')}`;
          const badgeEl = document.getElementById('q1MarksBadge');
          if (badgeEl) badgeEl.textContent = `${Number(q.marks || 15).toFixed(1)} MARKS`;

          if (q.config?.hasMultipleProcedures && Array.isArray(q.config.procedures) && q.config.procedures.length > 1) {
            setupQ1ProcedureNav();
            switchTitrationProcedure(0);
          } else {
            renderQ1Calculations();
          }
        }
      } else if (q.simulationType === 'qualitative') {
        if (q.number === 2 && window._initialPaneTemplates.paneQ2) {
          if (!pane.querySelector('#q2ReagentShelf')) {
            pane.innerHTML = window._initialPaneTemplates.paneQ2;
          }
          const h2 = document.getElementById('q2HeadingTitle');
          if (h2) h2.innerHTML = `🧂 QUESTION ${q.number}: ${escapeHtml(q.title || 'Inorganic Qualitative Analysis')}`;
          const mBadge = document.getElementById('q2MarksBadge');
          if (mBadge) mBadge.textContent = `${Number(q.marks || 15).toFixed(1)} MARKS`;
          renderQ2TestsGrid();
        } else if (q.number === 3 && window._initialPaneTemplates.paneQ3) {
          renderQ3TestsGrid();
        }
      } else if (q.simulationType === 'organic') {
        if (q.number === 2 && window._initialPaneTemplates.paneQ2) {
          renderQ2TestsGrid();
        } else if (q.number === 3 && window._initialPaneTemplates.paneQ3) {
          renderQ3TestsGrid();
        }
      }
    });
  }

  function setupUniversalExamRouter(cfg) {
    let questions = [];
    if (Array.isArray(cfg?.questions) && cfg.questions.length > 0) {
      questions = cfg.questions;
    } else {
      const isQ2Org = Boolean(
        cfg?.examConfig?.q2?.simulationType === 'organic' ||
        cfg?.q2?.simulationType === 'organic' ||
        cfg?.examConfig?.q2?.trueOrganicKey ||
        cfg?.q2?.trueOrganicKey
      );
      const isQ3Qual = Boolean(
        cfg?.examConfig?.q3?.simulationType === 'qualitative' ||
        cfg?.q3?.simulationType === 'qualitative' ||
        cfg?.examConfig?.q3?.trueSaltKey ||
        cfg?.q3?.trueSaltKey
      );
      questions = [
        {
          number: 1,
          title: cfg?.examConfig?.q1?.title || cfg?.q1?.title || 'Volumetric Analysis',
          simulationType: 'titration',
          marks: Number(cfg?.examConfig?.q1?.marks || cfg?.q1?.marks || 15),
          config: cfg?.examConfig?.q1 || cfg?.q1 || {}
        },
        {
          number: 2,
          title: cfg?.examConfig?.q2?.title || cfg?.q2?.title || (isQ2Org ? 'Organic Functional Group Analysis' : 'Qualitative Inorganic Analysis'),
          simulationType: isQ2Org ? 'organic' : 'qualitative',
          marks: Number(cfg?.examConfig?.q2?.marks || cfg?.q2?.marks || (isQ2Org ? 10 : 15)),
          config: cfg?.examConfig?.q2 || cfg?.q2 || {}
        },
        {
          number: 3,
          title: cfg?.examConfig?.q3?.title || cfg?.q3?.title || (isQ3Qual ? 'Inorganic Qualitative Analysis' : 'Organic Functional Group Analysis'),
          simulationType: isQ3Qual ? 'qualitative' : 'organic',
          marks: Number(cfg?.examConfig?.q3?.marks || cfg?.q3?.marks || 10),
          config: cfg?.examConfig?.q3 || cfg?.q3 || {}
        }
      ];
    }

    window._examQuestionsList = questions;
    renderDynamicExamTabs(questions, (typeof activeTab !== 'undefined' && activeTab) ? activeTab : 1);
    mountQuestionPanes(questions);
  }

  // ── Client-Side Resilient Auto-Save & Draft Restoration Engine ──
  function getExamSessionKey() {
    return assignmentId ? `assign_${assignmentId}` : `${seriesParam}_${modeParam}`;
  }

  function saveExamDraft(immediate = false) {
    if (!window.ExamDraftManager) return;
    try {
      // Gather Q1 Table Data
      const tableData = [];
      [1, 2, 3].forEach(n => {
        const fin = document.getElementById(`t${n}Final`);
        const init = document.getElementById(`t${n}Init`);
        const used = document.getElementById(`t${n}Used`);
        const conc = document.getElementById(`t${n}Concordant`);
        tableData.push({
          final: fin ? fin.value : '',
          initial: init ? init.value : '',
          used: used ? used.textContent : '',
          concordant: conc ? conc.checked : false
        });
      });

      // Gather Dynamic Calculation Inputs
      const calcAnswers = {};
      document.querySelectorAll('.dynamic-calc-input').forEach(input => {
        if (input.id && input.value !== '') {
          calcAnswers[input.id] = input.value;
        }
      });

      // Gather Written Question Responses
      const writtenAnswers = {};
      document.querySelectorAll('textarea[id^="written_input_"]').forEach(el => {
        if (el.value) writtenAnswers[el.id] = el.value;
      });

      const draftPayload = {
        assignmentId: assignmentId || null,
        seriesParam,
        modeParam,
        activeTab: (typeof activeTab !== 'undefined') ? activeTab : 1,
        activeProcedureIndex: (typeof activeProcedureIndex !== 'undefined') ? activeProcedureIndex : 0,
        tableData,
        calcAnswers,
        writtenAnswers,
        q1Trials: engine?.q1Trials || [],
        q1Answers: engine?.q1Answers || {},
        procedureTrials: engine?.procedureTrials || {},
        procedureAnswers: engine?.procedureAnswers || {},
        q2Obs: engine?.q2Obs || {},
        q2Inf: engine?.q2Inf || {},
        q2CationChoice: engine?.q2CationChoice || '',
        q2AnionChoice: engine?.q2AnionChoice || '',
        q2FunctionalGroupChoice: engine?.q2FunctionalGroupChoice || '',
        q2TestStates: (typeof q2TestStates !== 'undefined') ? q2TestStates : {},
        q3Obs: engine?.q3Obs || {},
        q3Inf: engine?.q3Inf || {},
        q3FunctionalGroupChoice: engine?.q3FunctionalGroupChoice || '',
        q3TestStates: (typeof q3TestStates !== 'undefined') ? q3TestStates : {},
        timeLeft: (typeof timeLeft !== 'undefined') ? timeLeft : 135 * 60,
        savedAt: Date.now()
      };

      ExamDraftManager.saveDraft(getExamSessionKey(), draftPayload, immediate);
    } catch (err) {
      console.warn('[ExamOfflineManager] Error saving exam draft:', err);
    }
  }

  function triggerDraftAutoSave(immediate = false) {
    saveExamDraft(immediate);
  }

  function checkAndRestoreDraft() {
    if (!window.ExamDraftManager) return;
    try {
      const sessionKey = getExamSessionKey();
      const draftWrapper = ExamDraftManager.loadDraft(sessionKey);
      if (!draftWrapper || !draftWrapper.data) return;

      const d = draftWrapper.data;

      // 1. Restore Q1 Table Data & Trials
      if (Array.isArray(d.tableData)) {
        d.tableData.forEach((t, idx) => {
          const n = idx + 1;
          const fin = document.getElementById(`t${n}Final`);
          const init = document.getElementById(`t${n}Init`);
          const used = document.getElementById(`t${n}Used`);
          const conc = document.getElementById(`t${n}Concordant`);
          if (fin && t.final !== undefined && t.final !== '') fin.value = t.final;
          if (init && t.initial !== undefined && t.initial !== '') init.value = t.initial;
          if (used && t.used !== undefined && t.used !== '') used.textContent = t.used;
          if (conc && t.concordant !== undefined) conc.checked = Boolean(t.concordant);
          if (t.final && !isNaN(parseFloat(t.final))) {
            engine.recordTrial(n, parseFloat(t.final) || 0, parseFloat(t.initial) || 0, d.activeProcedureIndex || 0);
            if (t.concordant) {
              engine.setConcordant(n, true, d.activeProcedureIndex || 0);
            }
          }
        });
      }

      if (Array.isArray(d.q1Trials) && d.q1Trials.length > 0) {
        engine.q1Trials = d.q1Trials;
      }
      if (d.procedureTrials) engine.procedureTrials = d.procedureTrials;
      if (d.procedureAnswers) engine.procedureAnswers = d.procedureAnswers;

      // 2. Restore Q1 Calculation Inputs
      if (d.q1Answers && typeof d.q1Answers === 'object') {
        engine.q1Answers = { ...engine.q1Answers, ...d.q1Answers };
      }
      if (d.calcAnswers && typeof d.calcAnswers === 'object') {
        Object.keys(d.calcAnswers).forEach(id => {
          const el = document.getElementById(id);
          if (el && d.calcAnswers[id] !== undefined) el.value = d.calcAnswers[id];
        });
      }
      if (d.q1Answers) {
        Object.keys(d.q1Answers).forEach(field => {
          const val = d.q1Answers[field];
          const el = document.getElementById(`ans_${field}`) || document.getElementById(`q1StepInput_${field}`) || document.getElementById(field === 'avgTitre' ? 'ansAvgTitre' : (field === 'molesB' ? 'ansMolesB' : (field === 'molesA' ? 'ansMolesA' : (field === 'molarityA' ? 'ansMolarityA' : (field === 'concGrams' ? 'ansConcGrams' : `ans_${field}`)))));
          if (el && val !== undefined && val !== '') el.value = val;
        });
      }

      // 3. Restore Q2 Qualitative State
      if (d.q2Obs && typeof d.q2Obs === 'object') {
        engine.q2Obs = { ...engine.q2Obs, ...d.q2Obs };
        Object.keys(d.q2Obs).forEach(testId => {
          const el = document.getElementById(`q2Obs_${testId}`);
          if (el && d.q2Obs[testId]) el.value = d.q2Obs[testId];
        });
      }
      if (d.q2Inf && typeof d.q2Inf === 'object') {
        engine.q2Inf = { ...engine.q2Inf, ...d.q2Inf };
        Object.keys(d.q2Inf).forEach(testId => {
          const el = document.getElementById(`q2Inf_${testId}`);
          if (el && d.q2Inf[testId]) el.value = d.q2Inf[testId];
        });
      }
      if (d.q2CationChoice) {
        engine.q2CationChoice = d.q2CationChoice;
        const cat = document.getElementById('q2CationSelect');
        if (cat) cat.value = d.q2CationChoice;
      }
      if (d.q2AnionChoice) {
        engine.q2AnionChoice = d.q2AnionChoice;
        const ani = document.getElementById('q2AnionSelect');
        if (ani) ani.value = d.q2AnionChoice;
      }
      if (d.q2FunctionalGroupChoice) {
        engine.q2FunctionalGroupChoice = d.q2FunctionalGroupChoice;
        const q2fg = document.getElementById('q2FGSelect');
        if (q2fg) q2fg.value = d.q2FunctionalGroupChoice;
      }
      if (d.q2TestStates && typeof d.q2TestStates === 'object') {
        q2TestStates = { ...q2TestStates, ...d.q2TestStates };
        renderQ2TestsGrid();
      }

      // 4. Restore Q3 Qualitative/Organic State
      if (d.q3Obs && typeof d.q3Obs === 'object') {
        engine.q3Obs = { ...engine.q3Obs, ...d.q3Obs };
        Object.keys(d.q3Obs).forEach(testId => {
          const el = document.getElementById(`q3Obs_${testId}`);
          if (el && d.q3Obs[testId]) el.value = d.q3Obs[testId];
        });
      }
      if (d.q3Inf && typeof d.q3Inf === 'object') {
        engine.q3Inf = { ...engine.q3Inf, ...d.q3Inf };
        Object.keys(d.q3Inf).forEach(testId => {
          const el = document.getElementById(`q3Inf_${testId}`);
          if (el && d.q3Inf[testId]) el.value = d.q3Inf[testId];
        });
      }
      if (d.q3FunctionalGroupChoice) {
        engine.q3FunctionalGroupChoice = d.q3FunctionalGroupChoice;
        const fg = document.getElementById('q3FGSelect');
        if (fg) fg.value = d.q3FunctionalGroupChoice;
      }
      if (d.q3TestStates && typeof d.q3TestStates === 'object') {
        q3TestStates = { ...q3TestStates, ...d.q3TestStates };
        renderQ3TestsGrid();
      }

      // 5. Restore Written Question Textareas
      if (d.writtenAnswers && typeof d.writtenAnswers === 'object') {
        Object.keys(d.writtenAnswers).forEach(id => {
          const el = document.getElementById(id);
          if (el && d.writtenAnswers[id]) el.value = d.writtenAnswers[id];
        });
      }

      // 6. Restore Active Tab & Procedure
      if (typeof d.activeProcedureIndex === 'number' && d.activeProcedureIndex > 0) {
        switchTitrationProcedure(d.activeProcedureIndex);
      }
      if (typeof d.activeTab === 'number' && d.activeTab > 1) {
        switchQTab(d.activeTab);
      }

      // 7. Restore Remaining Time if valid
      if (typeof d.timeLeft === 'number' && d.timeLeft > 10 && d.timeLeft < 135 * 60) {
        timeLeft = d.timeLeft;
      }

      updateLiveScoreDisplay();
      ExamDraftManager.notifyStatus('saved', draftWrapper.savedAt);
      console.log('[ExamOfflineManager] Candidate draft restored successfully for', sessionKey);
    } catch (err) {
      console.warn('[ExamOfflineManager] Could not restore draft:', err);
    }
  }

  window.saveExamDraft = saveExamDraft;
  window.triggerDraftAutoSave = triggerDraftAutoSave;
  window.checkAndRestoreDraft = checkAndRestoreDraft;

  function initExamUI() {
    const p = engine.preset;
    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setElemText('examSubTitle', p.title + ' — Code 233/3');
    setElemText('printExamTitle', p.title.toUpperCase());
    setElemText('modeIndicator', (engine.mode === 'strict') ? 'Official Timed (135m)' : 'Guided Practice');

    // Hide or adjust step check buttons in strict exam mode
    if (engine.mode === 'strict') {
      document.querySelectorAll('.btn-check-step').forEach(btn => btn.style.display = 'none');
    }

    setElemText('q1SolAName', 'Solution A: ' + (p.q1?.solutionA || ''));
    setElemText('q1SolBName', 'Solution B: ' + (p.q1?.solutionB || ''));
    setElemText('q1IndicatorName', p.q1?.indicator || 'Phenolphthalein Indicator');
    setElemText('q1EquationDisplay', p.q1?.equation || '');
    const eqRow = document.getElementById('q1EquationRow');
    if (eqRow) eqRow.style.display = p.q1?.equation ? 'inline-block' : 'none';
    setElemText('q1RfmDisplay', p.q1?.acidRfm || 36.5);

    // Fixed integrity leak: Never expose true salt name or organic formula in candidate prompt!
    setElemText('q2SampleName', p.q2?.sampleName || 'Solid Y');
    setElemText('q2SampleDescText', p.q2?.sampleDesc || 'An inorganic salt sample.');
    setElemText('q3SampleName', p.q3?.sampleName || 'Liquid Z');
    setElemText('q3SampleDescText', p.q3?.sampleDesc || 'An organic sample.');

    // Update apparatus fill colors based on titrant
    if (p.q1?.titrantColor) {
      const stop1 = document.getElementById('gradStop1');
      const stop2 = document.getElementById('gradStop2');
      if (stop1 && stop2) {
        stop1.setAttribute('stop-color', p.q1.titrantColor);
        stop2.setAttribute('stop-color', p.q1.titrantColor);
      }
      const cap = document.getElementById('buretteMeniscusCap');
      if (cap) {
        cap.setAttribute('fill', p.q1.titrantColor);
      }
    }

    setupQ1ProcedureNav();
    if (p.q1?.hasMultipleProcedures && Array.isArray(p.q1.procedures) && p.q1.procedures.length > 1) {
      switchTitrationProcedure(0);
    } else {
      try { renderQ1Calculations(); } catch(e) { console.error('renderQ1Calculations error:', e); }
    }

    try { renderQ2TestsGrid(); } catch(e) { console.error('renderQ2TestsGrid error:', e); }
    const hasQ2Ded = Boolean(p.q2?.hasDeduction === true);
    const q2Card = document.getElementById('q2DeductionCard');
    if (q2Card) q2Card.style.display = hasQ2Ded ? 'block' : 'none';
    try { renderQ3TestsGrid(); } catch(e) { console.error('renderQ3TestsGrid error:', e); }
    try { drawLens(); } catch(e) { console.error('drawLens error:', e); }
    try { updateLiveScoreDisplay(); } catch(e) { console.error('updateLiveScoreDisplay error:', e); }

    // Reagents shelf initialization
    const titrantChip = document.getElementById('q1TitrantChip');
    if (titrantChip) {
      const solA = p.q1?.solutionA || '';
      titrantChip.textContent = `Titrant: Sol. A (${solA ? solA.split(' ')[0] : 'Acid'})`;
    }
    const indicatorChip = document.getElementById('q1IndicatorChip');
    if (indicatorChip) indicatorChip.textContent = `Indicator: ${p.q1?.indicator || 'Phenolphthalein'}`;

    // Universal Exam Simulator Router for standard practice preset
    setupUniversalExamRouter(engine.preset);
    if (window.ExamDraftManager) {
      ExamDraftManager.initConnectivityMonitor('offlineStatusBadge');
      ExamDraftManager.registerServiceWorker('/sw.js');
      setTimeout(() => { checkAndRestoreDraft(); }, 500);
    }

    // Handle Linked Assignment Header Banner
    if (assignmentId) {
      const banner = document.getElementById('assignmentHeaderBanner');
      const bannerTitle = document.getElementById('assignBannerTitle');
      const bannerDue = document.getElementById('assignBannerDue');
      if (banner) {
        banner.style.display = 'flex';
      }
      if (typeof Assignments !== 'undefined' && Assignments.getMine) {
        Assignments.getMine().then(data => {
          const list = data.assignments || [];
          const match = list.find(a => a.id === assignmentId);
          if (match) {
            if (bannerTitle) bannerTitle.textContent = match.title + (match.instructions ? ` — ${match.instructions}` : '');
            if (bannerDue && match.due_date) {
              bannerDue.textContent = `Due ${new Date(match.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }

            if (match.exam_config) {
              try {
                const cfg = typeof match.exam_config === 'string' ? JSON.parse(match.exam_config) : match.exam_config;
                engine.applyConfig(cfg);
                const pCustom = engine.preset;
                if (document.getElementById('examSubTitle')) document.getElementById('examSubTitle').textContent = match.title + ' — Code 233/3';
                if (document.getElementById('printExamTitle')) document.getElementById('printExamTitle').textContent = match.title.toUpperCase();
                if (document.getElementById('q1SolAName')) document.getElementById('q1SolAName').textContent = 'Solution A: ' + (pCustom.q1?.solutionA || '');
                if (document.getElementById('q1SolBName')) document.getElementById('q1SolBName').textContent = 'Solution B: ' + (pCustom.q1?.solutionB || '');
                if (document.getElementById('q1IndicatorName')) document.getElementById('q1IndicatorName').textContent = pCustom.q1?.indicator || 'Phenolphthalein Indicator';
                if (document.getElementById('q1EquationDisplay')) document.getElementById('q1EquationDisplay').textContent = pCustom.q1?.equation || '';
                if (document.getElementById('q1EquationRow')) document.getElementById('q1EquationRow').style.display = pCustom.q1?.equation ? 'inline-block' : 'none';
                if (document.getElementById('q1IndicatorChip')) document.getElementById('q1IndicatorChip').textContent = `Indicator: ${pCustom.q1?.indicator || 'Phenolphthalein'}`;
                if (document.getElementById('q1TitrantChip')) {
                  const solACust = pCustom.q1?.solutionA || '';
                  document.getElementById('q1TitrantChip').textContent = `Titrant: Sol. A (${solACust ? solACust.split(' ')[0] : 'Acid'})`;
                }

                // Hydrate Q2 & Q3 sample labels
                if (document.getElementById('q2SampleName') && pCustom.q2?.sampleName) {
                  document.getElementById('q2SampleName').textContent = pCustom.q2.sampleName;
                }
                if (document.getElementById('q2SampleDescText') && pCustom.q2?.sampleDesc) {
                  document.getElementById('q2SampleDescText').textContent = pCustom.q2.sampleDesc;
                }
                if (document.getElementById('q3SampleName') && pCustom.q3?.sampleName) {
                  document.getElementById('q3SampleName').textContent = pCustom.q3.sampleName;
                }
                if (document.getElementById('q3SampleDescText') && pCustom.q3?.sampleDesc) {
                  document.getElementById('q3SampleDescText').textContent = pCustom.q3.sampleDesc;
                }

                const isQ2Organic = Boolean(
                  pCustom.q2?.simulationType === 'organic' ||
                  pCustom.q2?.trueOrganicKey ||
                  pCustom.q2?.trueFunctionalGroup ||
                  (pCustom.q2?.sampleDesc && /organic/i.test(pCustom.q2.sampleDesc)) ||
                  (cfg.questions && cfg.questions.some(q => q.number === 2 && q.simulationType === 'organic'))
                );
                if (isQ2Organic) {
                  const sName = pCustom.q2?.sampleName || 'Liquid N';
                  const pace2 = document.getElementById('paceQ2');
                  if (pace2) pace2.innerHTML = `<span>🧫 Q2: Organic</span>`;
                  const btn2 = document.getElementById('btnQ2');
                  if (btn2) btn2.innerHTML = `🧫 Question 2: Organic Functional Group (${escapeHtml(sName)}) (${Number(pCustom.q2?.marks || 10).toFixed(1)} Mks)`;
                  const h2 = document.getElementById('q2HeadingTitle');
                  if (h2) h2.innerHTML = `🧫 QUESTION 2: Organic Functional Group Analysis · ${escapeHtml(sName)}`;
                  const mBadge = document.getElementById('q2MarksBadge');
                  if (mBadge) mBadge.textContent = `${Number(pCustom.q2?.marks || 10).toFixed(1)} MARKS`;
                  const rLine = document.getElementById('q2ReagentsLine');
                  if (rLine) rLine.innerHTML = `• <b>Reagents:</b> Metallic spatula &amp; Bunsen burner, Blue and Red litmus paper, Acidified Potassium Manganate(VII) (KMnO₄) / Bromine water, and Solid Sodium Hydrogen Carbonate (NaHCO₃).`;
                  const iText = document.getElementById('q2InstructionsText');
                  if (iText) iText.innerHTML = `<b>Instructions:</b> Carry out the systematic organic tests below on <b>${escapeHtml(sName)}</b> and record your observations and inferences in the spaces provided.`;
                  const q2Card = document.getElementById('q2DeductionCard');
                  if (q2Card) q2Card.style.display = 'none';
                  const q2OrgCard = document.getElementById('q2OrganicDeductionCard');
                  if (q2OrgCard) q2OrgCard.style.display = 'block';
                }

                const isQ3Qualitative = Boolean(
                  pCustom.q3?.simulationType === 'qualitative' ||
                  pCustom.q3?.trueSaltKey ||
                  pCustom.q3?.trueCation ||
                  (pCustom.q3?.sampleName && /solid/i.test(pCustom.q3.sampleName)) ||
                  (cfg.questions && cfg.questions.some(q => q.number === 3 && q.simulationType === 'qualitative'))
                );
                if (isQ3Qualitative) {
                  const sName = pCustom.q3?.sampleName || 'Solid P';
                  const sDesc = pCustom.q3?.sampleDesc || 'An inorganic salt sample.';
                  const pace3 = document.getElementById('paceQ3');
                  if (pace3) pace3.innerHTML = `<span>🧂 Q3: Qualitative</span>`;
                  const btn3 = document.getElementById('btnQ3');
                  if (btn3) btn3.innerHTML = `🧂 Question 3: Inorganic Qualitative Analysis (${escapeHtml(sName)}) (${Number(pCustom.q3?.marks || 10).toFixed(1)} Mks)`;
                  const h3 = document.getElementById('q3HeadingTitle');
                  if (h3) h3.innerHTML = `🧂 QUESTION 3: Inorganic Qualitative Analysis · ${escapeHtml(sName)}`;
                  const mBadge = document.getElementById('q3MarksBadge');
                  if (mBadge) mBadge.textContent = `${Number(pCustom.q3?.marks || 10).toFixed(1)} MARKS`;
                  const rLine = document.getElementById('q3ReagentsLine');
                  if (rLine) rLine.innerHTML = `• Reagents: Distilled water, 2M Sodium Hydroxide (NaOH), 2M Aqueous Ammonia (NH₃), Test tubes & holder, Bunsen burner, Confirmatory reagents.`;
                  const iText = document.getElementById('q3InstructionsText');
                  if (iText) iText.innerHTML = `<b>Instructions:</b> Carry out the systematic inorganic tests below on <b>${escapeHtml(sName)}</b> and record your observations and inferences in the spaces provided.`;
                  const dedCard = document.getElementById('q3DeductionCard');
                  if (dedCard) dedCard.style.display = 'none';
                }

                const hasQ2DedCust = Boolean(pCustom.q2?.hasDeduction === true);
                const q2CardCust = document.getElementById('q2DeductionCard');
                if (q2CardCust) q2CardCust.style.display = hasQ2DedCust ? 'block' : 'none';

                if (pCustom.q1?.hasMultipleProcedures && Array.isArray(pCustom.q1.procedures) && pCustom.q1.procedures.length > 1) {
                  setupQ1ProcedureNav();
                  switchTitrationProcedure(0);
                } else {
                  renderQ1Calculations();
                }
                renderQ2TestsGrid();
                renderQ3TestsGrid();

                // Universal Exam Simulator Router for custom assigned exam
                setupUniversalExamRouter(cfg);
                setTimeout(() => { checkAndRestoreDraft(); }, 100);
              } catch (cfgErr) {
                console.warn('[Composite Exam] Could not hydrate assignment exam_config:', cfgErr);
              }
            }
          }
        }).catch(err => console.warn('Could not fetch assignment details for exam banner:', err.message));
      }
    }
  }

  // ── Written Question Panel Component & Submission ────────────────────
  function getWrittenQuestionPanelHtml(q) {
    const subQs = Array.isArray(q.subQuestions) ? q.subQuestions : [];
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1.5px solid var(--card-border);padding-bottom:10px;">
        <div>
          <span class="badge" style="background:var(--amber-bg);color:var(--amber-accent);font-weight:800;font-size:0.75rem;">✏️ WRITTEN PRACTICAL QUESTION</span>
          <h2 style="font-size:1.2rem;font-weight:800;color:var(--heading-color);margin:4px 0 0;font-family:var(--font-heading);">
            QUESTION ${q.number}: ${escapeHtml(q.title || 'Structured Practical Assessment')}
          </h2>
        </div>
        <span class="timer-chip" style="font-size:0.78rem;padding:3px 10px;background:var(--amber-bg);color:var(--amber-accent);border:1px solid var(--amber-border);font-weight:800;">${Number(q.marks || 10).toFixed(1)} MARKS</span>
      </div>

      <div class="exam-prompt-box" style="margin-bottom:18px;font-size:0.88rem;line-height:1.6;white-space:pre-wrap;">
        ${escapeHtml(q.prompt || 'Read the instructions and answer the structured sub-questions below based on standard KNEC laboratory criteria.')}
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;">
        ${subQs.map(sq => `
          <div class="calc-step-card" style="margin-bottom:0;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div style="font-weight:800;font-size:0.88rem;color:var(--heading-color);">
                <span style="color:var(--cyan-accent);margin-right:6px;">(${escapeHtml(sq.id)})</span>
                ${escapeHtml(sq.text)}
              </div>
              <span class="step-marks-badge" style="font-size:0.75rem;padding:2px 8px;background:var(--blue-bg);color:var(--blue-accent);border-radius:4px;font-weight:700;white-space:nowrap;">${sq.marks} Mark${sq.marks > 1 ? 's' : ''}</span>
            </div>
            <textarea
              class="kcse-input"
              id="written_input_${q.number}_${sq.id}" oninput="triggerDraftAutoSave()"
              placeholder="Record your observation, deduction, or calculation here..."
              rows="3"
              style="width:100%;font-size:0.86rem;padding:10px;resize:vertical;line-height:1.5;margin-top:6px;box-sizing:border-box;"
            ></textarea>
            <div id="written_feedback_${q.number}_${sq.id}" style="display:none;margin-top:8px;padding:8px 12px;border-radius:6px;font-size:0.8rem;"></div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:12px 16px;">
        <div id="written_status_${q.number}" style="font-size:0.82rem;color:var(--text-muted);flex:1;min-width:260px;">
          Answers are scored with AI assistance against the KNEC marking scheme and recorded for your teacher's review.
        </div>
        <button
          type="button"
          class="btn-submit-exam"
          id="btnSubmitWritten_${q.number}"
          onclick="submitWrittenAnswersForQuestion(${q.number})"
          style="padding:10px 22px;font-size:0.88rem;font-weight:800;border-radius:8px;"
        >
          💾 Save &amp; Score Question ${q.number} Answers
        </button>
      </div>
    `;
  }
  window.getWrittenQuestionPanelHtml = getWrittenQuestionPanelHtml;

  async function submitWrittenAnswersForQuestion(qNum) {
    if (!assignmentId) {
      alert('This exam is in practice mode. To save written question scores, access it through an assigned task.');
      return;
    }

    const q = window._examQuestionsList && window._examQuestionsList.find(x => x.number === qNum);
    if (!q) return;

    const btn = document.getElementById(`btnSubmitWritten_${qNum}`);
    const statusEl = document.getElementById(`written_status_${qNum}`);

    const answersPayload = (q.subQuestions || []).map(sq => {
      const input = document.getElementById(`written_input_${qNum}_${sq.id}`);
      return {
        subQuestionId: sq.id,
        questionText: sq.text,
        modelAnswer: sq.modelAnswer || '',
        maxMarks: sq.marks || 2,
        answerText: input ? input.value.trim() : ''
      };
    });

    const filledCount = answersPayload.filter(a => a.answerText).length;
    if (filledCount === 0) {
      alert('Please enter your response to at least one sub-question before saving.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Scoring with AI…';
    }
    if (statusEl) {
      statusEl.textContent = 'Analyzing responses against KNEC marking criteria…';
      statusEl.style.color = 'var(--cyan-accent)';
    }

    try {
      const token = typeof getToken === 'function' ? getToken() : localStorage.getItem('vlk_token');
      const res = await fetch('/api/written-questions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          assignmentId,
          questionNumber: qNum,
          answers: answersPayload
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit answers.');

      let totalAwarded = 0;

      (data.responses || []).forEach(r => {
        const fbEl = document.getElementById(`written_feedback_${qNum}_${r.subQuestionId}`);
        if (fbEl) {
          fbEl.style.display = 'block';
          if (r.aiScore != null) {
            totalAwarded += Number(r.aiScore);
            fbEl.style.background = 'rgba(16,185,129,0.1)';
            fbEl.style.border = '1px solid rgba(16,185,129,0.3)';
            fbEl.style.color = 'var(--green-accent)';
            fbEl.innerHTML = `<b>✓ AI Draft Score: ${Number(r.aiScore).toFixed(1)} / ${r.maxMarks} Marks</b><br><span style="color:var(--text-main);font-size:0.78rem;">${escapeHtml(r.aiFeedback || '')}</span>`;
          } else {
            fbEl.style.background = 'rgba(245,158,11,0.1)';
            fbEl.style.border = '1px solid rgba(245,158,11,0.3)';
            fbEl.style.color = 'var(--amber-accent)';
            fbEl.innerHTML = `<b>⏳ Saved: Pending Teacher Marking</b>`;
          }
        }
      });

      if (btn) {
        btn.disabled = false;
        btn.textContent = '✓ Answers Saved & Scored';
        btn.style.background = 'var(--green-accent)';
        setTimeout(() => {
          btn.textContent = `💾 Re-save Question ${qNum} Answers`;
          btn.style.background = '';
        }, 2500);
      }

      if (statusEl) {
        statusEl.textContent = `✅ Saved! Draft score: ${totalAwarded.toFixed(1)}/${q.marks} Marks. Subject to teacher review.`;
        statusEl.style.color = 'var(--green-accent)';
      }

    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = `💾 Save & Score Question ${qNum} Answers`;
      }
      if (statusEl) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.style.color = 'var(--red-accent)';
      }
      alert('Submission note: ' + err.message);
    }
  }
  window.submitWrittenAnswersForQuestion = submitWrittenAnswersForQuestion;

  // ── Q1 Titration Workbench Interactive Actions ───────────────────────
  function pipetteSolutionB() {
    isPipetted = true;
    const pipEl = document.getElementById('pipetteStatus');
    if (pipEl) {
      pipEl.textContent = '25.0 cm³ Pipetted ✓';
      pipEl.style.color = '#10B981';
      pipEl.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      pipEl.style.background = 'rgba(16, 185, 129, 0.12)';
    }
    updateFlaskAppearance();
  }

  function addIndicatorDrop() {
    if (!isPipetted) {
      alert('Pipette 25.0 cm³ of Solution B into the conical flask first!');
      return;
    }
    if (indicatorDrops < 3) {
      indicatorDrops++;
      const btnInd = document.getElementById('btnAddIndicator');
      if (btnInd) btnInd.textContent = `💧 Add Indicator (${indicatorDrops}/3)`;
      const indEl = document.getElementById('indicatorStatus');
      if (indEl) {
        indEl.textContent = `${indicatorDrops} of 3 Drops Added`;
        indEl.style.color = '#38BDF8';
        indEl.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        indEl.style.background = 'rgba(56, 189, 248, 0.12)';
      }
      
      const indicatorChip = document.getElementById('q1IndicatorChip');
      if (indicatorChip) {
        const indName = engine.preset.q1.indicator ? engine.preset.q1.indicator.split(' ')[0] : 'Indicator';
        indicatorChip.textContent = `${indName} (${indicatorDrops}d)`;
      }

      updateFlaskAppearance();
    }
  }

  function updateFlaskAppearance() {
    const flask = document.getElementById('flaskRigBody');
    const surface = document.getElementById('flaskLiquidSurface');
    const label = document.getElementById('flaskContentsLabel');
    const p = engine.preset.q1;
    if (!flask) return;

    if (!isPipetted) {
      flask.style.display = 'none';
      if (surface) surface.style.display = 'none';
      if (label) label.textContent = 'Flask: Empty';
      return;
    }

    flask.style.display = 'block';
    if (surface) surface.style.display = 'block';

    const buretteVol = engine.q1BuretteReading || 0;
    const totalVol = 25.0 + buretteVol;
    // Map volume: starts comfortably above half-height at y = 298 (~58% flask height), rising to y = 290 (~69%)
    const yLiquid = Math.max(286, 298 - ((totalVol - 25.0) / 25.0) * 8);
    const t = Math.max(0, Math.min(1, (yLiquid - 268) / 66));
    const xLeft = 118 - t * 24;
    const xRight = 140 + t * 24;
    const rx = (xRight - xLeft) / 2;

    const d = `M ${xLeft.toFixed(1)},${yLiquid.toFixed(1)} L 94,334 Q 129,346 164,334 L ${xRight.toFixed(1)},${yLiquid.toFixed(1)} Q 129,${(yLiquid - 3).toFixed(1)} ${xLeft.toFixed(1)},${yLiquid.toFixed(1)} Z`;
    flask.setAttribute('d', d);
    if (surface) {
      surface.setAttribute('cy', yLiquid.toFixed(1));
      surface.setAttribute('rx', rx.toFixed(1));
    }

    const activeProc = (engine?.preset?.q1?.hasMultipleProcedures && engine?.preset?.q1?.procedures && engine.preset.q1.procedures[activeProcedureIndex])
      ? engine.preset.q1.procedures[activeProcedureIndex]
      : (engine?.preset?.q1 || {});
    const solA = (activeProc.solutionA || '').toLowerCase();
    const solB = (activeProc.solutionB || '').toLowerCase();
    const indName = (activeProc.indicator || '').toLowerCase();
    const trueTitre = Number(activeProc.trueTitre) || 25.00;

    const isKmno4 = indName.includes('kmno') || indName.includes('manganate') || solA.includes('kmno') || solA.includes('manganate');
    const isMethyl = indName.includes('methyl');

    // Identify whether base or acid is in conical flask (Solution B)
    const isBaseInFlask = solB.includes('naoh') || solB.includes('base') || solB.includes('hydroxide') || solB.includes('carbonate') || solB.includes('na2co3') || solB.includes('alkali');
    const isAcidInFlask = solB.includes('acid') || solB.includes('hcl') || solB.includes('h2so4') || solB.includes('hno3') || solB.includes('ethanedioic') || solB.includes('oxalic');
    const isFe2InFlask = solB.includes('iron(ii)') || solB.includes('iron (ii)') || solB.includes('fe2') || solB.includes('ferrous');

    let fillColor;
    const reading = engine.q1BuretteReading || 0;

    if (indicatorDrops === 0 && !isKmno4) {
      fillColor = isFe2InFlask ? 'rgba(16, 185, 129, 0.25)' : (activeProc.flaskBaseColor || 'rgba(224, 242, 254, 0.35)');
      if (label) label.textContent = `Flask: 25.0 cm³ ${activeProc.solutionB ? activeProc.solutionB.split(' ')[0] : 'Sample'} (Add Indicator!)`;
    } else if (reading >= (trueTitre + 0.30)) {
      // PAST ENDPOINT (Excess titrant)
      if (isKmno4) {
        fillColor = activeProc.excessColor || 'rgba(126, 34, 206, 0.95)'; // Deep purple
      } else if (isMethyl) {
        fillColor = isAcidInFlask ? 'rgba(251, 191, 36, 0.90)' : 'rgba(239, 68, 68, 0.95)'; // Red in excess acid
      } else {
        // Phenolphthalein
        if (isAcidInFlask && !isBaseInFlask) {
          fillColor = 'rgba(190, 24, 93, 0.95)'; // Dark pink in excess base
        } else {
          fillColor = activeProc.endpointColor || 'rgba(241, 245, 249, 0.25)'; // Discharged colorless in excess acid
        }
      }
      if (label) label.textContent = 'Flask: Over-titrated! (Past Endpoint)';
    } else if (reading >= trueTitre) {
      // AT ENDPOINT (Neutralization reached)
      if (isKmno4) {
        fillColor = activeProc.endpointColor || 'rgba(244, 114, 182, 0.75)'; // Faint permanent pink
      } else if (isMethyl) {
        fillColor = activeProc.endpointColor || 'rgba(249, 115, 22, 0.90)'; // Distinct orange
      } else {
        // Phenolphthalein
        if (isAcidInFlask && !isBaseInFlask) {
          fillColor = activeProc.endpointColor || 'rgba(244, 114, 182, 0.75)'; // Faint permanent pink
        } else {
          fillColor = activeProc.endpointColor || 'rgba(241, 245, 249, 0.25)'; // Discharged colorless
        }
      }
      if (label) label.textContent = 'Flask: Endpoint Reached!';
    } else {
      // BEFORE ENDPOINT
      if (isKmno4) {
        fillColor = isFe2InFlask ? 'rgba(16, 185, 129, 0.22)' : 'rgba(241, 245, 249, 0.25)'; // Colorless / pale green
      } else if (isMethyl) {
        fillColor = isAcidInFlask ? 'rgba(239, 68, 68, 0.85)' : 'rgba(251, 191, 36, 0.85)'; // Yellow in base, Red in acid
      } else {
        // Phenolphthalein
        if (isAcidInFlask && !isBaseInFlask) {
          fillColor = 'rgba(241, 245, 249, 0.25)'; // Colorless in acid
        } else {
          fillColor = 'rgba(236, 72, 153, 0.85)'; // Pink in base
        }
      }
      if (label) label.textContent = `Flask: ${activeProc.solutionB ? activeProc.solutionB.split(' ')[0] : 'Sample'} + Indicator`;
    }

    flask.setAttribute('fill', fillColor);
    flask.style.fill = fillColor;
    flask.setAttribute('opacity', '0.88');
    if (surface) {
      surface.setAttribute('fill', fillColor);
      surface.style.fill = fillColor;
      surface.setAttribute('opacity', '0.92');
    }
  }

  function addTitrantDirect(vol) {
    if (!isPipetted) {
      alert('Please pipette Solution B into the conical flask before titrating!');
      return;
    }
    const stopcock = document.getElementById('stopcockValve');
    if (stopcock) {
      stopcock.style.transform = 'rotate(90deg)';
      setTimeout(() => { stopcock.style.transform = 'rotate(0deg)'; }, 400);
    }
    const drip = document.getElementById('rigDrip');
    if (drip) {
      drip.style.display = 'block';
      setTimeout(() => { drip.style.display = 'none'; }, 400);
    }
    engine.q1BuretteReading = Math.min(50.0, parseFloat((engine.q1BuretteReading + vol).toFixed(2)));
    updateBuretteRig();
  }

  function startContinuousTitration() {
    if (!isPipetted) {
      alert('Please pipette Solution B into the conical flask before titrating!');
      return;
    }
    stopTitrate();
    const drip = document.getElementById('rigDrip');
    if (drip) drip.style.display = 'block';
    const stopcock = document.getElementById('stopcockValve');
    if (stopcock) stopcock.style.transform = 'rotate(90deg)';

    const activeProc = (engine?.preset?.q1?.hasMultipleProcedures && engine?.preset?.q1?.procedures && engine.preset.q1.procedures[activeProcedureIndex])
      ? engine.preset.q1.procedures[activeProcedureIndex]
      : (engine?.preset?.q1 || {});
    const trueTitre = Number(activeProc.trueTitre) || 25.00;

    titrateInterval = setInterval(() => {
      // Snap to trueTitre if approaching within one tick to prevent latency overshoot
      if (engine.q1BuretteReading < trueTitre && (engine.q1BuretteReading + 0.20) >= trueTitre) {
        engine.q1BuretteReading = trueTitre;
        stopTitrate();
        updateBuretteRig();
        return;
      }

      engine.q1BuretteReading += 0.20;
      if (engine.q1BuretteReading >= 50.0) {
        engine.q1BuretteReading = 50.0;
        stopTitrate();
      }
      updateBuretteRig();
    }, 100);
  }

  function stopTitrate() {
    if (titrateInterval) {
      clearInterval(titrateInterval);
      titrateInterval = null;
    }
    const drip = document.getElementById('rigDrip');
    if (drip) drip.style.display = 'none';
    const stopcock = document.getElementById('stopcockValve');
    if (stopcock) stopcock.style.transform = 'rotate(0deg)';
  }

  function updateBuretteRig() {
    const reading = engine.q1BuretteReading;
    document.getElementById('lensDigitalReadout').textContent = reading.toFixed(2) + ' cm³';

    const bHeight = Math.max(0, 196 - (reading / 50.0) * 196);
    const bFill = document.getElementById('buretteFill');
    const cap = document.getElementById('buretteMeniscusCap');
    if (bFill) {
      bFill.setAttribute('y', 10 + (196 - bHeight));
      bFill.setAttribute('height', bHeight);
    }
    if (cap) {
      cap.setAttribute('cy', 10 + (196 - bHeight));
      cap.setAttribute('fill', engine.preset?.q1?.titrantColor || '#7DD3FC');
    }

    updateFlaskAppearance();
    drawLens();
  }

  function swirlFlask() {
    const flask = document.getElementById('flaskContainer');
    if (!flask) return;
    flask.style.transform = 'rotate(-8deg)';
    setTimeout(() => { flask.style.transform = 'rotate(8deg)'; }, 150);
    setTimeout(() => { flask.style.transform = 'rotate(0deg)'; }, 300);
  }

  function resetTitrationApparatus() {
    stopTitrate();
    engine.q1BuretteReading = 0.00;
    isPipetted = false;
    indicatorDrops = 0;
    const pipEl = document.getElementById('pipetteStatus');
    if (pipEl) {
      pipEl.textContent = 'Not Pipetted';
      pipEl.style.color = 'var(--text-muted)';
      pipEl.style.borderColor = 'var(--card-border)';
      pipEl.style.background = 'var(--bg-dark)';
    }
    const btnInd = document.getElementById('btnAddIndicator');
    if (btnInd) btnInd.textContent = '💧 Add Indicator (0/3)';
    const indEl = document.getElementById('indicatorStatus');
    if (indEl) {
      indEl.textContent = '0 Drops Added';
      indEl.style.color = 'var(--text-muted)';
      indEl.style.borderColor = 'var(--card-border)';
      indEl.style.background = 'var(--bg-dark)';
    }
    updateBuretteRig();
  }

  function transferReadingToTable() {
    const reading = parseFloat(engine.q1BuretteReading.toFixed(2));
    if (reading === 0) {
      alert('Please perform titration before recording reading in table!');
      return;
    }
    const targetInput = document.getElementById(`t${activeTrial}Final`);
    if (targetInput) targetInput.value = reading.toFixed(2);
    onTableInputChanged();
    const tableName = engine?.preset?.q1?.hasMultipleProcedures ? `Table ${activeProcedureIndex + 1}` : 'Table 1';
    alert(`Trial ${activeTrial} reading (${reading.toFixed(2)} cm³) transferred to ${tableName}!`);

    activeTrial = activeTrial < 3 ? activeTrial + 1 : 1;
    document.getElementById('lblActiveTrial').textContent = activeTrial;
    resetTitrationApparatus();
  }

  function drawLens() {
    const lensSvg = document.getElementById('lensSvg');
    if (!lensSvg) return;
    const volume = typeof engine?.q1BuretteReading === 'number' ? engine.q1BuretteReading : 0.00;
    const pcm = 60; // 60px per cm³ magnification
    const centerY = 90; // Centerline of 180px viewbox

    const minVol = Math.max(0, Math.floor((volume - 1.4) * 10) / 10);
    const maxVol = Math.min(50, Math.ceil((volume + 1.4) * 10) / 10);

    const solAStr = (engine?.preset?.q1?.solutionA || '').toLowerCase();
    const titrantColor = engine?.preset?.q1?.titrantColor || '';
    const isKmno4 = solAStr.includes('kmno') || titrantColor === '#7C3AED' || titrantColor === '#A855F7';
    const isDark = isKmno4;
    const isAmber = titrantColor === '#F59E0B' || titrantColor === '#D97706' || solAStr.includes('dichromate') || solAStr.includes('iodine');

    let liquidColor0, liquidColor1, liquidColor2, liquidColor3;
    if (isKmno4) {
      liquidColor0 = '#A855F7';
      liquidColor1 = '#7E22CE';
      liquidColor2 = '#581C87';
      liquidColor3 = '#3B0764';
    } else if (isAmber) {
      liquidColor0 = '#FDE68A';
      liquidColor1 = '#F59E0B';
      liquidColor2 = '#D97706';
      liquidColor3 = '#B45309';
    } else if (titrantColor && titrantColor !== '#38BDF8' && titrantColor !== '#7DD3FC') {
      liquidColor0 = titrantColor;
      liquidColor1 = titrantColor;
      liquidColor2 = '#0284C7';
      liquidColor3 = '#0369A1';
    } else {
      liquidColor0 = '#BAE6FD';
      liquidColor1 = '#38BDF8';
      liquidColor2 = '#0284C7';
      liquidColor3 = '#0369A1';
    }

    const defsSvg = `
      <defs>
        <!-- Porcelain Enamel Backing Plate Gradient -->
        <linearGradient id="lensTubeCeramicExam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="8%" stop-color="#FFFFFF"/>
          <stop offset="92%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </linearGradient>

        <!-- Volumetric Solution Fill Gradient -->
        <linearGradient id="luminousLiquidFillExam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${liquidColor0}" stop-opacity="${isKmno4 ? '0.96' : '0.45'}"/>
          <stop offset="15%" stop-color="${liquidColor1}" stop-opacity="${isKmno4 ? '0.96' : '0.65'}"/>
          <stop offset="55%" stop-color="${liquidColor2}" stop-opacity="${isKmno4 ? '0.98' : '0.80'}"/>
          <stop offset="100%" stop-color="${liquidColor3}" stop-opacity="${isKmno4 ? '1.0' : '0.90'}"/>
        </linearGradient>

        <!-- Glass Cylinder Outer Wall Shadow (Left) -->
        <linearGradient id="glassWallLeftExam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#94A3B8" stop-opacity="0.6"/>
          <stop offset="40%" stop-color="#FFFFFF" stop-opacity="0.8"/>
          <stop offset="80%" stop-color="#CBD5E1" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#0F172A" stop-opacity="0.1"/>
        </linearGradient>

        <!-- Glass Cylinder Outer Wall Shadow (Right) -->
        <linearGradient id="glassWallRightExam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0F172A" stop-opacity="0.1"/>
          <stop offset="20%" stop-color="#CBD5E1" stop-opacity="0.2"/>
          <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.6"/>
        </linearGradient>

        <!-- Internal Cylindrical Shadow on Bore -->
        <linearGradient id="boreInnerShadowExam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0F172A" stop-opacity="0.18"/>
          <stop offset="6%" stop-color="#0F172A" stop-opacity="0.0"/>
          <stop offset="94%" stop-color="#0F172A" stop-opacity="0.0"/>
          <stop offset="100%" stop-color="#0F172A" stop-opacity="0.18"/>
        </linearGradient>
      </defs>
    `;

    // 1. Physical Glass Cylinder & Schellbach Contrast Stripe
    const tubeGeometry = `
      <!-- Porcelain Milk-Glass White Background for Scale Contrast -->
      <rect x="38" y="0" width="124" height="180" fill="url(#lensTubeCeramicExam)"/>

      <!-- Authentic Schellbach Backing Band (White Enamel) -->
      <rect x="86" y="0" width="28" height="180" fill="#F8FAFC" opacity="0.9"/>
      <!-- Schellbach Central Cobalt Blue Guide Line -->
      <rect x="97" y="0" width="6" height="${isKmno4 ? 180 : Math.max(0, centerY - 12)}" fill="#0284C7" opacity="${isKmno4 ? '0.2' : '0.85'}"/>

      ${!isKmno4 ? `
        <!-- Schellbach Optical Pointer Convergence at Meniscus -->
        <path d="M 97 ${Math.max(0, centerY - 12)} L 103 ${Math.max(0, centerY - 12)} L 100 ${centerY} Z" fill="#0284C7"/>
        <path d="M 100 ${centerY} L 103 ${centerY + 14} L 97 ${centerY + 14} Z" fill="#0369A1"/>
        <rect x="97" y="${centerY + 14}" width="6" height="${Math.max(0, 180 - (centerY + 14))}" fill="#0369A1" opacity="0.7"/>
      ` : ''}

      <!-- Inner Bore Cylindrical Depth Shadow -->
      <rect x="38" y="0" width="124" height="180" fill="url(#boreInnerShadowExam)" pointer-events="none"/>
    `;

    // 2. Liquid Column & Realistic Meniscus Arc
    let liquidBody = '';
    let meniscusArc = '';

    if (isKmno4) {
      liquidBody = `
        <path d="M 38 ${centerY + 10} Q 100 ${centerY - 10} 162 ${centerY + 10} L 162 180 L 38 180 Z" fill="url(#luminousLiquidFillExam)"/>
      `;
      meniscusArc = `
        <path d="M 38 ${centerY + 10} Q 100 ${centerY - 10} 162 ${centerY + 10}" stroke="#C084FC" stroke-width="2.4" fill="none" opacity="0.95"/>
        <path d="M 38 ${centerY + 9} Q 100 ${centerY - 9} 162 ${centerY + 9}" stroke="#FFFFFF" stroke-width="1.4" fill="none" opacity="0.8" stroke-dasharray="4,6"/>
        <circle cx="100" cy="${centerY}" r="3.5" fill="#FDE047" stroke="#000000" stroke-width="1.2" pointer-events="none"/>
      `;
    } else {
      liquidBody = `
        <path d="M 38 ${centerY - 10} Q 100 ${centerY + 10} 162 ${centerY - 10} L 162 180 L 38 180 Z" fill="url(#luminousLiquidFillExam)"/>
      `;
      meniscusArc = `
        <path d="M 38 ${centerY - 11} Q 100 ${centerY + 9} 162 ${centerY - 11}" stroke="#0F172A" stroke-width="3.2" fill="none" opacity="0.85"/>
        <path d="M 38 ${centerY - 10} Q 100 ${centerY + 10} 162 ${centerY - 10}" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.95"/>
        <path d="M 52 ${centerY - 5} Q 100 ${centerY + 5} 148 ${centerY - 5}" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none"/>
        <circle cx="100" cy="${centerY}" r="3.5" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5" filter="url(#lensBeadGlowExam)" pointer-events="none"/>
      `;
    }

    // 3. Laser-Etched Graduation Scale Marks & Side Numbers
    let ticksSvg = '';
    for (let v = minVol; v <= maxVol + 0.05; v += 0.1) {
      const vRounded = Math.round(v * 10) / 10;
      const y = centerY + (vRounded - volume) * pcm;
      if (y < -12 || y > 192) continue;

      const isMajor = Math.abs(vRounded - Math.round(vRounded)) < 0.01;
      const isMedium = !isMajor && Math.abs((vRounded * 10) % 5) < 0.01;

      if (isMajor) {
        ticksSvg += `<line x1="38" y1="${y}" x2="78" y2="${y}" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/>`;
        ticksSvg += `<line x1="122" y1="${y}" x2="162" y2="${y}" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/>`;
        ticksSvg += `<text x="142" y="${y + 4}" fill="#0F172A" font-size="11.5" font-family="'JetBrains Mono', monospace" font-weight="900" text-anchor="middle" paint-order="stroke" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round">${Math.round(vRounded)}</text>`;
      } else if (isMedium) {
        ticksSvg += `<line x1="38" y1="${y}" x2="66" y2="${y}" stroke="#1E293B" stroke-width="1.6" stroke-linecap="round"/>`;
        ticksSvg += `<line x1="134" y1="${y}" x2="162" y2="${y}" stroke="#1E293B" stroke-width="1.6" stroke-linecap="round"/>`;
      } else {
        ticksSvg += `<line x1="38" y1="${y}" x2="52" y2="${y}" stroke="#475569" stroke-width="1.1" stroke-linecap="round"/>`;
        ticksSvg += `<line x1="148" y1="${y}" x2="162" y2="${y}" stroke="#475569" stroke-width="1.1" stroke-linecap="round"/>`;
      }
    }

    // 4. Glass Cylinder Walls & Specular Reflections
    const glassOverlays = `
      <!-- Left Glass Cylinder Wall -->
      <rect x="28" y="0" width="10" height="180" fill="url(#glassWallLeftExam)"/>
      <line x1="28" y1="0" x2="28" y2="180" stroke="#94A3B8" stroke-width="1.5" stroke-opacity="0.8"/>
      <line x1="38" y1="0" x2="38" y2="180" stroke="#64748B" stroke-width="1.2" stroke-opacity="0.7"/>

      <!-- Right Glass Cylinder Wall -->
      <rect x="162" y="0" width="10" height="180" fill="url(#glassWallRightExam)"/>
      <line x1="162" y1="0" x2="162" y2="180" stroke="#64748B" stroke-width="1.2" stroke-opacity="0.7"/>
      <line x1="172" y1="0" x2="172" y2="180" stroke="#94A3B8" stroke-width="1.5" stroke-opacity="0.8"/>

      <!-- Specular Highlight Stripe on Left of Bore -->
      <rect x="42" y="0" width="5" height="180" fill="#FFFFFF" opacity="0.35"/>

      <!-- Optical Reticle Precision Center Notch & Eye-Level Horizontal Crosshairs -->
      <line x1="28" y1="${centerY}" x2="48" y2="${centerY}" stroke="${isDark ? '#FDE047' : '#EF4444'}" stroke-width="2" stroke-linecap="round"/>
      <line x1="152" y1="${centerY}" x2="172" y2="${centerY}" stroke="${isDark ? '#FDE047' : '#EF4444'}" stroke-width="2" stroke-linecap="round"/>
      <line x1="96" y1="${centerY - 5}" x2="96" y2="${centerY + 5}" stroke="${isDark ? '#FDE047' : '#EF4444'}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="104" y1="${centerY - 5}" x2="104" y2="${centerY + 5}" stroke="${isDark ? '#FDE047' : '#EF4444'}" stroke-width="1.5" stroke-linecap="round"/>
    `;

    lensSvg.innerHTML = defsSvg + tubeGeometry + liquidBody + ticksSvg + meniscusArc + glassOverlays;

    const readout = document.getElementById('lensDigitalReadout');
    if (readout) readout.innerHTML = `<span>🎯</span> ${volume.toFixed(2)} cm³`;

    const subText = document.getElementById('lensReadoutSubText');
    if (subText) {
      subText.innerHTML = isKmno4 ? 'Read at <b>top of meniscus</b> (opaque KMnO₄).' : 'Read at <b>bottom of meniscus</b>.';
    }
  }

  function onTableInputChanged() {
    [1, 2, 3].forEach(n => {
      const fin = parseFloat(document.getElementById(`t${n}Final`).value) || 0;
      const init = parseFloat(document.getElementById(`t${n}Init`).value) || 0;
      const used = parseFloat(Math.max(0, fin - init).toFixed(2));
      document.getElementById(`t${n}Used`).textContent = used.toFixed(2);
      engine.recordTrial(n, fin, init, activeProcedureIndex);
    });

    const pTrials = engine.getProcedureTrials(activeProcedureIndex);
    const t1 = pTrials[0]?.used || 0;
    const t2 = pTrials[1]?.used || 0;
    const t3 = pTrials[2]?.used || 0;
    const valid = [t1, t2, t3].filter(v => v > 0);
    const avgInput = document.getElementById('ansAvgTitre') || document.getElementById('ans_avgTitre') || document.getElementById(`ans_proc_${activeProcedureIndex}_avgTitre`) || document.getElementById(`ans_proc_${activeProcedureIndex}_step_1a`) || document.getElementById(`ans_proc_${activeProcedureIndex}_step_2a`) || document.getElementById(`ans_proc_${activeProcedureIndex}_step_a`);
    if (valid.length >= 2 && avgInput && !avgInput.value) {
      const avg = (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);
      avgInput.value = avg;
      engine.setQ1Answer('avgTitre', avg, activeProcedureIndex);
      engine.setQ1Answer('step_a', avg, activeProcedureIndex);
      engine.setQ1Answer(`step_${activeProcedureIndex + 1}a`, avg, activeProcedureIndex);
    }
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  function onConcordantChanged() {
    [1, 2, 3].forEach(n => {
      const cb = document.getElementById(`t${n}Concordant`);
      engine.setConcordant(n, cb ? cb.checked : false, activeProcedureIndex);
    });
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  function getQ1CalculationQuestions() {
    if (Array.isArray(engine?.preset?.q1?.questions) && engine.preset.q1.questions.length > 0) {
      return engine.preset.q1.questions;
    }
    const q1 = engine?.preset?.q1 || {};
    const calcType = q1.calcType || 'standard_molarity';
    if (typeof createWaterOfCrystallizationQuestions === 'function' && calcType === 'water_of_crystallization') {
      return createWaterOfCrystallizationQuestions(q1);
    }
    if (typeof createPercentagePurityQuestions === 'function' && calcType === 'percentage_purity') {
      return createPercentagePurityQuestions(q1);
    }
    if (typeof createRamMetalQuestions === 'function' && calcType === 'ram_metal') {
      return createRamMetalQuestions(q1);
    }
    if (typeof createStandardTitrationQuestions === 'function') {
      return createStandardTitrationQuestions(q1);
    }
    // Hardcoded bulletproof KNEC fallback questions
    return [
      { id: 'step_a', letter: 'a', field: 'avgTitre', label: 'Calculate the average volume of Solution A used, V₁', marks: 1.0, marksLabel: '(1.0 Mark)', placeholder: 'e.g. 25.00', step: '0.01', unit: 'cm³' },
      { id: 'step_b', letter: 'b', field: 'molesA', label: 'Calculate the number of moles of Solution A (acid) in the average volume V₁ used', marks: 2.0, marksLabel: '(2.0 Marks)', placeholder: 'e.g. 0.00250', step: '0.0001', unit: 'moles of acid' },
      { id: 'step_c', letter: 'c', field: 'molesB', label: `Determine the number of moles of Solution B (base) in ${Number(q1?.pipetteVolume || 25.0).toFixed(1)} cm³ of solution used`, marks: 2.0, marksLabel: '(2.0 Marks)', placeholder: 'e.g. 0.00250', step: '0.0001', unit: 'moles of base' },
      { id: 'step_d', letter: 'd', field: 'molarityB', label: 'Calculate the molar concentration (molarity) of Solution B in mol/dm³', marks: 3.0, marksLabel: '(3.0 Marks)', placeholder: 'e.g. 0.100', step: '0.001', unit: 'mol/dm³ (M)' },
      { id: 'step_e', letter: 'e', field: 'concGrams', label: `Calculate the concentration of Solution B in g/dm³ (RFM = ${q1?.baseRfm || 40.0})`, marks: 2.0, marksLabel: '(2.0 Marks)', placeholder: 'e.g. 4.00', step: '0.01', unit: 'g/dm³' }
    ];
  }

  function renderQ1Calculations() {
    renderQ1CalculationsForProcedure(activeProcedureIndex);
  }

  function renderQ1CalculationsForProcedure(procIdx = 0) {
    const container = document.getElementById('q1CalculationsContainer');
    if (!container) return;

    const hasMulti = engine?.preset?.q1?.hasMultipleProcedures && Array.isArray(engine?.preset?.q1?.procedures) && engine.preset.q1.procedures.length > 1;
    let questions = [];

    if (hasMulti) {
      const proc = engine.preset.q1.procedures[procIdx] || {};
      questions = Array.isArray(proc.questions) && proc.questions.length > 0 ? proc.questions : [];
      const calcSectionTitle = document.getElementById('q1CalcSectionTitle');
      if (calcSectionTitle) {
        const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
        calcSectionTitle.textContent = `${proc.title || `Procedure ${procIdx === 0 ? 'I' : 'II'}`} Calculations (${totalMarks.toFixed(1)} Marks)`;
      }
    } else {
      questions = getQ1CalculationQuestions();
      if (engine?.preset?.q1 && (!engine.preset.q1.questions || engine.preset.q1.questions.length === 0)) {
        engine.preset.q1.questions = questions;
      }
    }

    const isStrict = engine?.mode === 'strict';
    const procAnswers = hasMulti ? engine.getProcedureAnswers(procIdx) : engine.q1Answers;

    container.innerHTML = questions.map(q => {
      const fieldId = q.field || q.id;
      const inputId = hasMulti ? `ans_proc_${procIdx}_${fieldId}` : (fieldId === 'avgTitre' ? 'ansAvgTitre' : (fieldId === 'molesB' ? 'ansMolesB' : (fieldId === 'molesA' ? 'ansMolesA' : (fieldId === 'molarityA' ? 'ansMolarityA' : (fieldId === 'concGrams' ? 'ansConcGrams' : `ans_${fieldId}`)))));
      const currentVal = typeof window.getAnswerValue === 'function'
        ? (window.getAnswerValue(procAnswers, fieldId, q.id) || '')
        : ((procAnswers && procAnswers[fieldId] !== undefined) ? procAnswers[fieldId] : (procAnswers ? procAnswers[q.id] || '' : ''));

      return `
        <div class="calc-step-card" id="card_${fieldId}">
          <div style="font-weight:700;font-size:0.86rem;color:var(--text-main);margin-bottom:8px;">
            (${escapeHtml(q.letter || q.id)}) ${escapeHtml(q.label || '')} <span style="color:var(--cyan-accent);">${q.marksLabel || (q.marks ? `(${Number(q.marks).toFixed(1)} Marks)` : '')}</span>
          </div>
          <div class="calc-input-row" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <input type="number" step="${q.step || 'any'}" id="${inputId}" class="calc-input dynamic-calc-input" data-field="${fieldId}" data-step-id="${q.id}" placeholder="${q.placeholder || ''}" value="${currentVal}" oninput="onDynamicQ1CalculationChanged('${fieldId}', this.value, ${procIdx})">
            <span class="calc-unit-badge" style="font-weight:700;color:var(--text-muted);">${escapeHtml(q.unit || '')}</span>
            ${!isStrict ? `<button type="button" class="btn-perform-test btn-check-step" style="padding:6px 14px;font-size:0.78rem;" onclick="checkDynamicQ1Step('${q.id}', ${procIdx})">Check (${escapeHtml(q.letter || q.id)})</button>` : ''}
          </div>
          <div id="stepFeedback_${q.id}" class="step-feedback-msg"></div>
        </div>
      `;
    }).join('');
  }

  function onDynamicQ1CalculationChanged(field, value, procIdx = null) {
    const pIdx = (procIdx != null) ? procIdx : activeProcedureIndex;
    engine.setQ1Answer(field, value, pIdx);
    if (field === 'avgTitre') {
      engine.setQ1Answer('step_a', value, pIdx);
      engine.setQ1Answer(`step_${pIdx + 1}a`, value, pIdx);
    }
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  function checkDynamicQ1Step(stepId) {
    const questions = getQ1CalculationQuestions();
    const q = questions.find(item => item.id === stepId || item.letter === stepId);
    if (!q) return;

    const fb = document.getElementById(`stepFeedback_${q.id}`) || document.getElementById(`stepFeedback_${q.letter}`);
    if (!fb) return;

    const fieldId = q.field || q.id;
    const inputId = fieldId === 'avgTitre' ? 'ansAvgTitre' : (fieldId === 'molesB' ? 'ansMolesB' : (fieldId === 'molesA' ? 'ansMolesA' : (fieldId === 'molarityA' ? 'ansMolarityA' : (fieldId === 'concGrams' ? 'ansConcGrams' : `ans_${fieldId}`))));
    const el = document.getElementById(inputId);
    const ansVal = typeof window.getAnswerValue === 'function' ? window.getAnswerValue(engine.q1Answers, fieldId, q.id) : engine.q1Answers[fieldId];
    const val = parseFloat(el && el.value !== '' ? el.value : ansVal);

    const p = engine.preset.q1;
    const recordedTrials = engine.q1Trials.filter(t => t.recorded && t.used > 0);
    const checkedConcordant = engine.q1Trials.filter(t => t.recorded && t.concordant && t.used > 0);
    const avgRecorded = recordedTrials.length > 0 ? recordedTrials.reduce((a, b) => a + b.used, 0) / recordedTrials.length : p.trueTitre;
    const expAvgFromTrials = checkedConcordant.length > 0 ? checkedConcordant.reduce((a, b) => a + b.used, 0) / checkedConcordant.length : avgRecorded;

    const evalCtx = {
      trueTitre: p.trueTitre || 25.00,
      expAvgFromTrials,
      trueAcidMolarity: Number(p.trueAcidMolarity) || 0.100,
      trueBaseMolarity: Number(p.trueBaseMolarity) || 0.100,
      pipetteVol: Number(p.pipetteVolume) || 25.0,
      ratioA: Number(p.moleRatioAcid || p.ratioA) || 1,
      ratioB: Number(p.moleRatioBase || p.ratioB) || 1,
      acidRfm: Number(p.acidRfm) || 36.5,
      baseRfm: Number(p.baseRfm) || 40.0,
      answers: engine.q1Answers,
      t1: engine.q1Trials[0]?.used || p.trueTitre,
      t2: engine.q1Trials[1]?.used || p.trueTitre,
      v1: parseFloat(typeof window.getAnswerValue === 'function' ? window.getAnswerValue(engine.q1Answers, 'avgTitre', 'step_a') : (engine.q1Answers.avgTitre || engine.q1Answers.step_a)) || expAvgFromTrials
    };

    const expTheo = typeof q.calcTheoretical === 'function' ? q.calcTheoretical(evalCtx) : null;
    const expEcf = typeof q.calcEcf === 'function' ? q.calcEcf(evalCtx) : expTheo;

    let isPassed = false;
    let usedEcf = false;

    if (!isNaN(val)) {
      if (typeof q.check === 'function') {
        isPassed = q.check(val, evalCtx, expTheo, expEcf);
      } else if (expTheo != null) {
        isPassed = Math.abs(val - expTheo) / (expTheo || 1) <= 0.08;
        if (!isPassed && expEcf != null) {
          isPassed = Math.abs(val - expEcf) / (expEcf || 1) <= 0.08;
          if (isPassed) usedEcf = true;
        }
      }
    }

    if (isPassed) {
      fb.className = 'step-feedback-msg step-feedback-success';
      fb.textContent = usedEcf
        ? `✓ Correct via Error Carried Forward (e.c.f.)! Accurately derived from your prior step.`
        : (typeof q.feedbackSuccess === 'function' ? q.feedbackSuccess(val) : `✓ Correct!`);
    } else {
      fb.className = 'step-feedback-msg step-feedback-fail';
      fb.textContent = typeof q.feedbackFail === 'function' ? q.feedbackFail(evalCtx, expTheo) : `Please recheck your calculation.`;
    }
  }

  function checkQ1Step(letter) {
    checkDynamicQ1Step(`step_${letter}`);
  }

  function onQ1CalculationsChanged() {
    const inputs = document.querySelectorAll('.dynamic-calc-input');
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      if (field) engine.setQ1Answer(field, input.value);
    });
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  // ── Test Prompt Title Clean Helper (Prevents Naive Slicing on Parentheses) ──
  function getCleanTestPromptTitle(prompt, fallbackLetter = 'a') {
    if (!prompt || typeof prompt !== 'string') return `Test Procedure (${fallbackLetter})`;
    const clean = prompt.replace(/^\s*(?:\([a-zA-Z0-9ivxLCDM]+\)|[a-zA-Z0-9ivxLCDM]+[\.\)])\s*/i, '').trim();
    return clean || `Test Procedure (${fallbackLetter})`;
  }

  // ── Render Q2 Question Cards (Polymorphic: Inorganic Qualitative or Organic) ───────────
  function renderQ2TestsGrid() {
    const p = engine?.preset?.q2 || {};
    const grid = document.getElementById('q2TestsGrid');
    if (!grid) return;

    const isOrganic = Boolean(
      p.simulationType === 'organic' ||
      p.trueOrganicKey ||
      p.trueFunctionalGroup ||
      (p.sampleName && /liquid|organic|substance\s+[a-z]|solid\s+n/i.test(p.sampleName))
    );

    // Toggle deduction cards
    const deductionCard = document.getElementById('q2DeductionCard');
    const organicDeductionCard = document.getElementById('q2OrganicDeductionCard');
    if (isOrganic) {
      if (deductionCard) deductionCard.style.display = 'none';
      if (organicDeductionCard) {
        organicDeductionCard.style.display = 'block';
        const fgSelect = document.getElementById('q2FGSelect');
        if (fgSelect && engine.q2FunctionalGroupChoice) {
          fgSelect.value = engine.q2FunctionalGroupChoice;
        }
      }
    } else {
      if (deductionCard) deductionCard.style.display = 'block';
      if (organicDeductionCard) organicDeductionCard.style.display = 'none';
    }

    // Render Watch Glass and Sample Appearance
    const saltKey = String(p.trueSaltKey || 'Pb(NO3)2');
    const watchGlassCont = document.getElementById('q2WatchglassContainer');
    if (watchGlassCont) {
      if (isOrganic) {
        watchGlassCont.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:120px; color:var(--text-muted); background:var(--card-bg-subtle, rgba(255,255,255,0.03)); border-radius:8px; border:1px dashed var(--card-border);">
            <span style="font-size:2.2rem;">🧪</span>
            <span style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:6px;">${escapeHtml(p.sampleName || 'Sample N')}</span>
            <span style="font-size:0.7rem; color:var(--text-muted);">Organic Test Specimen</span>
          </div>
        `;
      } else if (window.QualitativeBenchCore) {
        watchGlassCont.innerHTML = QualitativeBenchCore.renderWatchGlassSvg(saltKey);
      }
    }
    const appEl = document.getElementById('q2SampleAppearanceText');
    if (appEl) {
      if (isOrganic) {
        appEl.textContent = p.sampleAppearance || 'Organic test sample (solid/liquid)';
      } else if (window.QualitativeBenchCore) {
        const saltObj = QualitativeBenchCore.resolveSalt(saltKey);
        if (saltObj && saltObj.appearance) {
          appEl.textContent = saltObj.appearance;
        }
      }
    }

    const tests = Array.isArray(p.tests) ? p.tests : [];
    if (!tests.length) {
      grid.innerHTML = `<div style="padding:20px; color:var(--text-muted); text-align:center;">No ${isOrganic ? 'organic' : 'qualitative'} tests configured for this sample.</div>`;
      return;
    }

    if (isOrganic) {
      // ── Organic Branch for Question 2 ──
      const perTestMarks = parseFloat(((Number(p.marks) || 10.0) / tests.length).toFixed(1));
      const halfMark = parseFloat((perTestMarks / 2.0).toFixed(1));

      grid.innerHTML = tests.map((t, idx) => {
        const st = q2TestStates[t.id] || { performed: false, stage: 'idle' };
        const letter = String.fromCharCode(97 + idx);
        const promptTitle = getCleanTestPromptTitle(t?.prompt, letter);

        const actionBtn = !st.performed
          ? `<button class="btn-perform-test" onclick="performQ2OrganicTest('${t.id}')">🧪 Perform Organic Test</button>`
          : `<button class="btn-perform-test done" disabled>✅ Test Observed</button><button class="btn-redo-test" onclick="redoQ2OrganicTest('${t.id}')">↺ Redo</button>`;

        return `
          <div class="kcse-question-block">
            <div class="test-card-top">
              <div class="test-header-left">
                <span class="test-step-badge">(${letter})</span>
                <h3 class="test-title-text">${escapeHtml(promptTitle)}</h3>
              </div>
              <span class="timer-chip" style="font-size:0.75rem; padding:2px 8px;">${perTestMarks} Marks</span>
            </div>

            <div class="test-layout-grid">
              <div class="apparatus-stage">
                <div class="apparatus-view">
                  ${getOrganicVisualHtml(t.id, st, t.prompt, 'q2')}
                </div>
                <div class="apparatus-status-tag" id="status_q2_org_${t.id}">
                  ${!st.performed ? 'Ready to Test' : (st.statusLabel || 'Reaction Recorded')}
                </div>
              </div>

              <div>
                <div style="font-size:0.84rem; color:var(--text-main); line-height:1.5; margin-bottom:12px; background:var(--bg-dark); padding:10px 14px; border-radius:8px; border-left:3px solid var(--blue-accent); border:1px solid var(--card-border); border-left-width:3px;">
                  <span style="font-weight:800; color:var(--heading-color); display:flex; align-items:center; gap:6px; margin-bottom:3px;">📋 Procedure:</span>
                  <span>${escapeHtml(t.prompt)}</span>
                </div>

                <div class="action-buttons-row">
                  ${actionBtn}
                </div>

                <!-- Organic Scientific Quick-Palette -->
                <div class="chem-palette-box">
                  <div class="chem-palette-header">
                    <span>⚡ Organic Functional Group Palette</span>
                    <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">(Tap to insert token into observation or inference)</span>
                  </div>
                  <div style="margin-bottom:5px;">
                    <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Functional Groups: </span>
                    <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', '>C=C<')">&gt;C=C&lt;</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', '—OH')">—OH</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', '—COOH')">—COOH</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', '—C≡C—')">—C≡C—</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Saturated organic compound')">Saturated</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Unsaturated compound')">Unsaturated</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Alkanol (—OH) present')">Alkanol</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Carboxylic acid (—COOH) confirmed')">Carboxylic acid</span>
                  </div>
                  <div>
                    <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Observations: </span>
                    <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Burns with luminous smoky sooty flame')">Sooty flame</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Burns with clean non-sooty pale blue flame')">Non-sooty flame</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Purple acidified KMnO₄ is decolorized')">KMnO₄ decolorized</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Bromine water is rapidly decolorized')">Bromine decolorized</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Orange K₂Cr₂O₇ turns green')">Orange K₂Cr₂O₇ turns green</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Moist blue litmus paper turns red')">Blue litmus turns red</span>
                    <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Vigorous effervescence of gas that turns lime water milky')">Effervescence (CO₂)</span>
                  </div>
                </div>

                <table class="knec-table">
                  <thead>
                    <tr>
                      <th style="width:50%;">Observations (${halfMark} Marks)</th>
                      <th style="width:50%;">Inferences / Deductions (${halfMark} Marks)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <textarea class="kcse-input" id="q2Obs_${t.id}" placeholder="Record observations..." oninput="onQ2TextChange('${t.id}')">${engine.q2Obs[t.id] || ''}</textarea>
                      </td>
                      <td>
                        <textarea class="kcse-input" id="q2Inf_${t.id}" placeholder="Write inferences..." oninput="onQ2TextChange('${t.id}')">${engine.q2Inf[t.id] || ''}</textarea>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }).join('');
      return;
    }

    // ── Inorganic Qualitative Branch for Question 2 ──
    grid.innerHTML = tests.map((t, idx) => {
      const st = q2TestStates[t.id] || { performed: false, stage: 'idle' };
      const letter = String.fromCharCode(97 + idx);
      const promptTitle = getCleanTestPromptTitle(t?.prompt, letter);
      const promptStr = (t.prompt || '').toLowerCase();

      const isPhysicalAppearance =
        promptStr.includes('physical appearance') ||
        promptStr.includes('appearance of solid') ||
        promptStr.includes('describe solid') ||
        promptStr.includes('appearance of sample') ||
        (promptStr.includes('appearance') && !promptStr.includes('dissolv') && !promptStr.includes('water')) ||
        (t.id.includes('appearance') && !promptStr.includes('water')) ||
        (t.id === 't1' && promptStr.includes('describe') && promptStr.includes('solid'));

      const isHeat =
        (promptStr.includes('heat') && (promptStr.includes('dry') || promptStr.includes('strongly') || promptStr.includes('solid') || promptStr.includes('spatula'))) ||
        t.id.includes('heat') ||
        t.id.includes('ignit');

      const isDissolving = !isPhysicalAppearance && (
        promptStr.includes('dissolv') ||
        (promptStr.includes('water') && (promptStr.includes('solid') || promptStr.includes('spatula') || promptStr.includes('portion')))
      );

      let defaultStatus = 'Awaiting Reagent';
      if (isPhysicalAppearance) defaultStatus = 'Awaiting Inspection';
      else if (isHeat) defaultStatus = 'Awaiting Bunsen Flame';
      else if (isDissolving) defaultStatus = 'Awaiting Distilled Water';

      const actions = window.QualitativeBenchCore
        ? QualitativeBenchCore.getMultiStageActions(t.id, t.prompt, st.stage)
        : [];

      let actionBtn = '';
      if (actions.length > 0) {
        actionBtn = actions.map(act => {
          if (act.disabled) return `<button class="${act.cls}" disabled>${act.label}</button>`;
          if (act.isRedo) return `<button class="${act.cls}" onclick="redoQ2Test('${t.id}')">${act.label}</button>`;
          return `<button class="${act.cls}" onclick="performQ2TestStage('${t.id}', '${act.stage}')">${act.label}</button>`;
        }).join(' ');
      } else {
        if (!st.performed) {
          actionBtn = `<button class="btn-perform-test" onclick="performQ2TestStage('${t.id}', 'stage1')">🧪 Add Reagent &amp; Perform Test</button>`;
        } else if (st.stage === 'stage1' && (t.id === 'q2_naoh' || t.id === 'q2_nh3')) {
          actionBtn = `
            <button class="btn-perform-test btn-step-excess" onclick="performQ2TestStage('${t.id}', 'excess')">💧 Add in Excess</button>
            <button class="btn-redo-test" onclick="redoQ2Test('${t.id}')">↺ Redo</button>
          `;
        } else {
          actionBtn = `
            <button class="btn-perform-test done" disabled>✅ Test Completed</button>
            <button class="btn-redo-test" onclick="redoQ2Test('${t.id}')">↺ Redo</button>
          `;
        }
      }

      let paletteHtml = '';
      if (isPhysicalAppearance) {
        paletteHtml = `
          <div class="chem-palette-box">
            <div class="chem-palette-header">
              <span>⚡ Physical Appearance Quick-Palette</span>
              <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">(Tap to insert token into observation or inference)</span>
            </div>
            <div style="margin-bottom:5px;">
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Inferences / Deductions: </span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Absence of transition metal ions (Cu²⁺, Fe²⁺, Fe³⁺ absent)')">Transition metals absent</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Absence of coloured transition ions')">Coloured ions absent</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Hydrated Cu²⁺ ion present')">Hydrated Cu²⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Hydrated Fe²⁺ ion present')">Hydrated Fe²⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Fe³⁺ ion present')">Fe³⁺ present</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Non-transition metal salt present')">Non-transition salt</span>
            </div>
            <div>
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Observations: </span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'White crystalline solid')">White crystalline solid</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'White crystalline powder')">White powder</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Blue crystalline solid')">Blue crystalline solid</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Pale green crystalline solid')">Pale green solid</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Yellow-brown crystalline solid')">Yellow-brown solid</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'White deliquescent crystals')">Deliquescent solid</span>
            </div>
          </div>
        `;
      } else if (isHeat) {
        paletteHtml = `
          <div class="chem-palette-box">
            <div class="chem-palette-header">
              <span>⚡ Thermal Decomposition Quick-Palette</span>
              <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">(Tap to insert token into observation or inference)</span>
            </div>
            <div style="margin-bottom:5px;">
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Inferences / Deductions: </span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Decomposition of hydrated or nitrate salt; NO₂ and O₂ gases evolved; NO₃⁻ present')">NO₃⁻ present</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Decomposition of hydrated salt; water of crystallization evolved')">Hydrated salt</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Zn²⁺ present (ZnO formed)')">Zn²⁺ present</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Pb²⁺ present (PbO residue formed)')">Pb²⁺ present</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'CO₂ gas evolved; CO₃²⁻ present')">CO₃²⁻ present</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'NH₄⁺ salt present (sublimation occurs)')">NH₄⁺ present</span>
            </div>
            <div>
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Observations: </span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Solid decrepitates; brown fumes of gas evolved that turn moist blue litmus red')">Brown fumes (NO₂)</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Gas rekindles a glowing splint (O₂)')">Relights splint (O₂)</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Droplets of colorless liquid condense on cooler upper walls')">Liquid droplets</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Solid decrepitates / crackles strongly')">Decrepitates</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Solid turns yellow when hot, white on cooling')">Yellow hot, white cold</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Residue is reddish-brown when hot, yellow on cooling')">Brown hot, yellow cold</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Sublimes; white fumes deposit on upper cooler walls')">Sublimes</span>
            </div>
          </div>
        `;
      } else {
        paletteHtml = `
          <div class="chem-palette-box">
            <div class="chem-palette-header">
              <span>⚡ Quick Scientific Token Palette</span>
              <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">(Tap to insert token into observation or inference)</span>
            </div>
            <div style="margin-bottom:5px;">
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Ions &amp; Charges: </span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Pb²⁺')">Pb²⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Al³⁺')">Al³⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Zn²⁺')">Zn²⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Fe²⁺')">Fe²⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Fe³⁺')">Fe³⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Cu²⁺')">Cu²⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Ca²⁺')">Ca²⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'NH₄⁺')">NH₄⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Ba²⁺')">Ba²⁺</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'SO₄²⁻')">SO₄²⁻</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'SO₃²⁻')">SO₃²⁻</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'CO₃²⁻')">CO₃²⁻</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'Cl⁻')">Cl⁻</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'NO₃⁻')">NO₃⁻</span>
              <span class="chem-token-chip" onclick="insertToken('q2Inf_${t.id}', 'I⁻')">I⁻</span>
            </div>
            <div>
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Observations: </span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'White precipitate formed')">White ppt</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'dissolves in excess to form colorless solution')">Soluble in excess</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'insoluble in excess')">Insoluble in excess</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Reddish-brown precipitate formed')">Reddish-brown ppt</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Dirty green precipitate formed')">Dirty green ppt</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Pale blue precipitate formed')">Pale blue ppt</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'dissolves to form royal deep blue solution')">Deep blue soln</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'No precipitate formed')">No ppt</span>
              <span class="chem-token-chip" onclick="insertToken('q2Obs_${t.id}', 'Effervescence of colorless gas')">Effervescence</span>
            </div>
          </div>
        `;
      }

      return `
        <div class="kcse-question-block">
          <div class="test-card-top">
            <div class="test-header-left">
              <span class="test-step-badge">(${letter})</span>
              <h3 class="test-title-text">${escapeHtml(promptTitle)}</h3>
            </div>
            <span class="timer-chip" style="font-size:0.75rem; padding:2px 8px;">3.0 Marks</span>
          </div>

          <div class="test-layout-grid">
            <div class="apparatus-stage">
              <div class="apparatus-view">
                ${getTubeVisualHtml(t.id, st, 'q2')}
              </div>
              <div class="apparatus-status-tag" id="status_${t.id}">
                ${!st.performed ? defaultStatus : (st.statusLabel || 'Reaction Observed')}
              </div>
            </div>

            <div>
              <div style="font-size:0.84rem; color:var(--text-main); line-height:1.5; margin-bottom:12px; background:var(--bg-dark); padding:10px 14px; border-radius:8px; border-left:3px solid var(--blue-accent); border:1px solid var(--card-border); border-left-width:3px;">
                <span style="font-weight:800; color:var(--heading-color); display:flex; align-items:center; gap:6px; margin-bottom:3px;">📋 Procedure:</span>
                <span>${escapeHtml(t.prompt)}</span>
              </div>

              <div class="action-buttons-row">
                ${actionBtn}
              </div>

              ${paletteHtml}

              <table class="knec-table">
                <thead>
                  <tr>
                    <th style="width:50%;">Observations (1.5 Marks)</th>
                    <th style="width:50%;">Inferences / Deductions (1.5 Marks)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <textarea class="kcse-input" id="q2Obs_${t.id}" placeholder="Write exact observations..." oninput="onQ2TextChange('${t.id}')">${engine.q2Obs[t.id] || ''}</textarea>
                    </td>
                    <td>
                      <textarea class="kcse-input" id="q2Inf_${t.id}" placeholder="Write deductions / inferences with ionic superscripts (e.g. Pb²⁺, Zn²⁺)..." oninput="onQ2TextChange('${t.id}')">${engine.q2Inf[t.id] || ''}</textarea>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getTubeVisualHtml(testId, st, qKey = 'q2') {
    const p = engine.preset?.[qKey] || {};
    const saltKey = String(p.trueSaltKey || (qKey === 'q3' ? 'ZnSO4' : 'Pb(NO3)2'));
    const tests = Array.isArray(p.tests) ? p.tests : [];
    const t = tests.find(x => x.id === testId) || {};
    const stage = st ? (st.stage || (st.performed ? 'done' : 'idle')) : 'idle';

    if (window.QualitativeBenchCore) {
      if (typeof QualitativeBenchCore.renderApparatusSvg === 'function') {
        return QualitativeBenchCore.renderApparatusSvg({
          saltKey,
          testId,
          stage,
          prompt: t.prompt || '',
          obsStr: t.correctObs || t.observation || t.obs || '',
          tubeId: `${qKey}_${testId}`
        });
      }
      return QualitativeBenchCore.renderTubeSvg({
        saltKey,
        testId,
        stage,
        prompt: t.prompt || '',
        obsStr: t.correctObs || t.observation || t.obs || '',
        tubeId: `${qKey}_${testId}`
      });
    }

    const performed = st && st.performed;
    return `
      <svg width="160" height="230" viewBox="0 0 160 230" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
        <rect x="53" y="27" width="54" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M 57,32 L 57,186 Q 57,208 80,208 Q 103,208 103,186 L 103,32 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.6"/>
        ${performed ? `<path d="M 58,138 L 58,186 Q 58,206 80,206 Q 102,206 102,186 L 102,138 Z" fill="rgba(56, 189, 248, 0.4)"/>` : ''}
        <line x1="62" y1="36" x2="62" y2="186" stroke="#FFFFFF" stroke-width="1.8" opacity="0.32" stroke-linecap="round"/>
        <line x1="98" y1="36" x2="98" y2="186" stroke="#FFFFFF" stroke-width="1.2" opacity="0.18" stroke-linecap="round"/>
      </svg>
    `;
  }

  function performQ2TestStage(testId, stage) {
    if (!q2TestStates[testId]) q2TestStates[testId] = {};
    const st = q2TestStates[testId];
    st.performed = true;
    st.stage = stage;

    const p = engine.preset?.q2 || {};
    const saltKey = String(p.trueSaltKey || 'Pb(NO3)2');

    // Find test definition
    const tests = Array.isArray(p.tests) ? p.tests : [];
    const t = tests.find(item => item.id === testId) || {};
    const prompt = t.prompt || '';
    const obsStr = t.correctObs || t.observation || '';

    if (window.QualitativeBenchCore) {
      const r = QualitativeBenchCore.resolveReactionState(saltKey, testId, stage, prompt, obsStr);
      st.statusLabel = r.statusLabel;
      QualitativeBenchCore.playReactionSound(r);
    } else {
      st.statusLabel = obsStr ? `Observed: ${obsStr.slice(0, 60)}` : 'Test Completed: Reaction Observed';
    }

    renderQ2TestsGrid();
    updateLiveScoreDisplay();
    saveExamDraft(true);
  }

  function redoQ2Test(testId) {
    q2TestStates[testId] = { performed: false, stage: 'idle' };
    renderQ2TestsGrid();
    saveExamDraft(true);
  }

  function onQ2TextChange(testId) {
    const obs = document.getElementById(`q2Obs_${testId}`)?.value || '';
    const inf = document.getElementById(`q2Inf_${testId}`)?.value || '';
    engine.setQ2Response(testId, obs, inf);
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  function onQ2DeductionsChanged() {
    const cat = document.getElementById('q2CationSelect')?.value || '';
    const ani = document.getElementById('q2AnionSelect')?.value || '';
    engine.setQ2Deduction(cat, ani);
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  function performQ2OrganicTest(testId) {
    if (!q2TestStates[testId]) q2TestStates[testId] = {};
    const st = q2TestStates[testId];
    st.performed = true;
    st.stage = 'done';
    const p = engine?.preset?.q2 || {};
    const orgKey = String(p.trueOrganicKey || 'Ethanol');
    const tests = Array.isArray(p.tests) ? p.tests : [];
    const t = tests.find(item => item.id === testId) || {};
    const prompt = t.prompt || '';

    if (window.OrganicBenchCore) {
      const r = OrganicBenchCore.resolveOrganicReactionState(orgKey, testId, true, prompt);
      st.statusLabel = r.statusLabel;
      OrganicBenchCore.playOrganicSound(r.soundType);
    } else {
      st.statusLabel = 'Reaction Observed: Result Recorded';
    }

    renderQ2TestsGrid();
    updateLiveScoreDisplay();
    saveExamDraft(true);
  }

  function redoQ2OrganicTest(testId) {
    q2TestStates[testId] = { performed: false, stage: 'idle' };
    renderQ2TestsGrid();
    saveExamDraft(true);
  }

  function onQ2OrganicDeductionChanged() {
    const fg = document.getElementById('q2FGSelect')?.value || '';
    engine.setQ2OrganicDeduction(fg);
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  window.performQ2OrganicTest = performQ2OrganicTest;
  window.redoQ2OrganicTest = redoQ2OrganicTest;
  window.onQ2OrganicDeductionChanged = onQ2OrganicDeductionChanged;
  window.performQ2TestStage = performQ2TestStage;
  window.redoQ2Test = redoQ2Test;
  window.onQ2DeductionsChanged = onQ2DeductionsChanged;
  window.onQ2TextChange = onQ2TextChange;

  // ── Render Q3 Question Cards with Organic Quick-Palette ──────────────
  function renderQ3TestsGrid() {
    const p = engine?.preset?.q3 || {};
    const grid = document.getElementById('q3TestsGrid');
    if (!grid) return;

    const isQualitative = Boolean(
      p.simulationType === 'qualitative' ||
      p.trueSaltKey ||
      (!p.trueFunctionalGroup && !p.trueOrganicKey) ||
      (p.sampleName && /solid/i.test(p.sampleName))
    );

    const tests = Array.isArray(p.tests) ? p.tests : [];
    if (!tests.length) {
      grid.innerHTML = `<div style="padding:20px; color:var(--text-muted); text-align:center;">No ${isQualitative ? 'qualitative' : 'organic'} tests configured for this sample.</div>`;
      return;
    }

    if (isQualitative) {
      // ── Render Qualitative Inorganic Question 3 Cards ──
      const perTestMarks = parseFloat((10.0 / tests.length).toFixed(1));
      grid.innerHTML = tests.map((t, idx) => {
        const st = q3TestStates[t.id] || { performed: false, stage: 'idle' };
        const letter = String.fromCharCode(97 + idx);
        const promptTitle = getCleanTestPromptTitle(t?.prompt, letter);

        const actions = window.QualitativeBenchCore
          ? QualitativeBenchCore.getMultiStageActions(t.id, t.prompt, st.stage)
          : [];

        let actionBtn = '';
        if (actions.length > 0) {
          actionBtn = actions.map(act => {
            if (act.disabled) return `<button class="${act.cls}" disabled>${act.label}</button>`;
            if (act.isRedo) return `<button class="${act.cls}" onclick="redoQ3Test('${t.id}')">${act.label}</button>`;
            return `<button class="${act.cls}" onclick="performQ3Test('${t.id}', '${act.stage}')">${act.label}</button>`;
          }).join(' ');
        } else {
          actionBtn = !st.performed
            ? `<button class="btn-perform-test" onclick="performQ3Test('${t.id}', 'stage1')">🧪 Perform Qualitative Test</button>`
            : `<button class="btn-perform-test done" disabled>✅ Test Observed</button><button class="btn-redo-test" onclick="redoQ3Test('${t.id}')">↺ Redo</button>`;
        }

        return `
          <div class="kcse-question-block">
            <div class="test-card-top">
              <div class="test-header-left">
                <span class="test-step-badge">(${letter})</span>
                <h3 class="test-title-text">${escapeHtml(promptTitle)}</h3>
              </div>
              <span class="timer-chip" style="font-size:0.75rem; padding:2px 8px;">${perTestMarks} Marks</span>
            </div>

            <div class="test-layout-grid">
              <div class="apparatus-stage">
                <div class="apparatus-view">
                  ${getTubeVisualHtml(t.id, st, 'q3')}
                </div>
                <div class="apparatus-status-tag" id="status_q3_${t.id}">
                  ${!st.performed ? 'Ready to Test' : (st.statusLabel || 'Reaction Recorded')}
                </div>
              </div>

              <div>
                <div style="font-size:0.84rem; color:var(--text-main); line-height:1.5; margin-bottom:12px; background:var(--bg-dark); padding:10px 14px; border-radius:8px; border-left:3px solid var(--blue-accent); border:1px solid var(--card-border); border-left-width:3px;">
                  <span style="font-weight:800; color:var(--heading-color); display:flex; align-items:center; gap:6px; margin-bottom:3px;">📋 Procedure:</span>
                  <span>${escapeHtml(t.prompt)}</span>
                </div>

                <div class="action-buttons-row">
                  ${actionBtn}
                </div>

                <!-- Inorganic Qualitative Scientific Quick-Palette -->
                <div class="chem-palette-box">
                  <div class="chem-palette-header">
                    <span>⚡ Inorganic Scientific Quick-Palette</span>
                    <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">(Tap to insert token into observation or inference)</span>
                  </div>
                  <div style="margin-bottom:5px;">
                    <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Ions: </span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Pb²⁺')">Pb²⁺</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Al³⁺')">Al³⁺</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Zn²⁺')">Zn²⁺</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Fe²⁺')">Fe²⁺</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Fe³⁺')">Fe³⁺</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Cu²⁺')">Cu²⁺</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Ca²⁺')">Ca²⁺</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Ba²⁺')">Ba²⁺</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'SO₄²⁻')">SO₄²⁻</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'SO₃²⁻')">SO₃²⁻</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'CO₃²⁻')">CO₃²⁻</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Cl⁻')">Cl⁻</span>
                  </div>
                  <div>
                    <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Observations: </span>
                    <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'White precipitate formed')">White ppt</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Precipitate dissolves in excess to form colorless solution')">Dissolves in excess</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Precipitate insoluble in excess')">Insoluble in excess</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'No precipitate formed')">No ppt</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Effervescence of colorless gas that turns lime water milky')">Effervescence (CO₂)</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Colorless gas with pungent choking smell that turns moist red litmus blue')">Choking gas (NH₃)</span>
                    <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Brown fumes of nitrogen dioxide evolved')">Brown fumes (NO₂)</span>
                  </div>
                </div>

                <table class="knec-table">
                  <thead>
                    <tr>
                      <th style="width:50%;">Observations [${(perTestMarks/2).toFixed(1)} Mark]</th>
                      <th style="width:50%;">Inferences / Deductions [${(perTestMarks/2).toFixed(1)} Mark]</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <textarea class="kcse-input" id="q3Obs_${t.id}" placeholder="Record observations..." oninput="onQ3TextChange('${t.id}')">${engine.q3Obs[t.id] || ''}</textarea>
                      </td>
                      <td>
                        <textarea class="kcse-input" id="q3Inf_${t.id}" placeholder="Write deductions / inferences (e.g. Pb²⁺, Al³⁺, Zn²⁺)..." oninput="onQ3TextChange('${t.id}')">${engine.q3Inf[t.id] || ''}</textarea>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }).join('');
      return;
    }

    grid.innerHTML = tests.map((t, idx) => {
      const st = q3TestStates[t.id] || { performed: false };
      const letter = String.fromCharCode(97 + idx);
      const promptTitle = getCleanTestPromptTitle(t?.prompt, letter);

      let actionBtn = !st.performed
        ? `<button class="btn-perform-test" onclick="performQ3Test('${t.id}')">🧪 Perform Organic Test</button>`
        : `<button class="btn-perform-test done" disabled>✅ Test Observed</button><button class="btn-redo-test" onclick="redoQ3Test('${t.id}')">↺ Redo</button>`;

      return `
        <div class="kcse-question-block">
          <div class="test-card-top">
            <div class="test-header-left">
              <span class="test-step-badge">(${letter})</span>
              <h3 class="test-title-text">${escapeHtml(promptTitle)}</h3>
            </div>
            <span class="timer-chip" style="font-size:0.75rem; padding:2px 8px;">2.0 Marks</span>
          </div>

          <div class="test-layout-grid">
            <div class="apparatus-stage">
              <div class="apparatus-view">
                ${getOrganicVisualHtml(t.id, st, t.prompt, 'q3')}
              </div>
              <div class="apparatus-status-tag" id="status_org_${t.id}">
                ${!st.performed ? 'Ready to Test' : (st.statusLabel || 'Reaction Recorded')}
              </div>
            </div>

            <div>
              <div style="font-size:0.84rem; color:var(--text-main); line-height:1.5; margin-bottom:12px; background:var(--bg-dark); padding:10px 14px; border-radius:8px; border-left:3px solid var(--blue-accent); border:1px solid var(--card-border); border-left-width:3px;">
                <span style="font-weight:800; color:var(--heading-color); display:flex; align-items:center; gap:6px; margin-bottom:3px;">📋 Procedure:</span>
                <span>${escapeHtml(t.prompt)}</span>
              </div>

              <div class="action-buttons-row">
                ${actionBtn}
              </div>

              <!-- Organic Scientific Quick-Palette -->
              <div class="chem-palette-box">
                <div class="chem-palette-header">
                  <span>⚡ Organic Functional Group Palette</span>
                  <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">(Tap to insert token into observation or inference)</span>
                </div>
                <div style="margin-bottom:5px;">
                  <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Functional Groups: </span>
                  <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', '>C=C<')">&gt;C=C&lt;</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', '—OH')">—OH</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', '—COOH')">—COOH</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', '—C≡C—')">—C≡C—</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Saturated organic compound')">Saturated</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Unsaturated compound')">Unsaturated</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Alkanol (—OH) present')">Alkanol</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Inf_${t.id}', 'Carboxylic acid (—COOH) confirmed')">Carboxylic acid</span>
                </div>
                <div>
                  <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Observations: </span>
                  <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Burns with luminous smoky sooty flame')">Sooty flame</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Burns with clean non-sooty pale blue flame')">Non-sooty flame</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Purple acidified KMnO₄ is decolorized')">KMnO₄ decolorized</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Bromine water is rapidly decolorized')">Bromine decolorized</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Orange K₂Cr₂O₇ turns green')">Orange K₂Cr₂O₇ turns green</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Moist blue litmus paper turns red')">Blue litmus turns red</span>
                  <span class="chem-token-chip" onclick="insertToken('q3Obs_${t.id}', 'Vigorous effervescence of gas that turns lime water milky')">Effervescence (CO₂)</span>
                </div>
              </div>

              <table class="knec-table">
                <thead>
                  <tr>
                    <th style="width:50%;">Observations (1.0 Mark)</th>
                    <th style="width:50%;">Inferences / Deductions (1.0 Mark)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <textarea class="kcse-input" id="q3Obs_${t.id}" placeholder="Record observations..." oninput="onQ3TextChange('${t.id}')">${engine.q3Obs[t.id] || ''}</textarea>
                    </td>
                    <td>
                      <textarea class="kcse-input" id="q3Inf_${t.id}" placeholder="Write inferences..." oninput="onQ3TextChange('${t.id}')">${engine.q3Inf[t.id] || ''}</textarea>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getOrganicVisualHtml(testId, st, prompt = '', qKey = 'q3') {
    const performed = Boolean(st && st.performed);
    const p = engine.preset?.[qKey] || engine.preset?.q3 || {};
    const orgKey = String(p.trueOrganicKey || 'Ethanol');

    if (window.OrganicBenchCore) {
      return window.OrganicBenchCore.renderApparatusSvg({
        testId,
        sampleKey: orgKey,
        performed,
        prompt,
        tubeId: `${qKey}_${testId}`
      });
    }

    const isSooty = orgKey.includes('Cyclo') || orgKey.includes('Benzoic') || orgKey.includes('Hex') || orgKey.includes('Alkene');
    const isButanol = orgKey.includes('Butan');
    const isHexene = orgKey.includes('Hex');
    const isIgnition = testId === 'q3_ignition' || testId.includes('ignit') || (prompt && (prompt.toLowerCase().includes('burn') || prompt.toLowerCase().includes('spatula') || prompt.toLowerCase().includes('flame')));

    if (isIgnition) {
      return `
        <svg width="100" height="136" viewBox="0 0 100 136">
          <rect x="10" y="80" width="80" height="8" rx="2" fill="#94A3B8" />
          <polygon points="75,78 95,84 75,90" fill="#CBD5E1" />
          ${performed ? `
            <path d="M 85,80 C 80,60 82,45 85,45 C 88,45 90,60 85,80 Z" fill="${isSooty ? '#F59E0B' : '#38BDF8'}" class="anim-flame"/>
          ` : '<circle cx="85" cy="82" r="3" fill="#38BDF8"/>'}
        </svg>
      `;
    }

    const isSolubility = testId.includes('solub') || testId.includes('miscib') || (prompt && (prompt.toLowerCase().includes('water') || prompt.toLowerCase().includes('solub') || prompt.toLowerCase().includes('miscib')));

    if (isSolubility) {
      const isMiscible = orgKey.includes('Ethanol') || orgKey.includes('Alcohol') || (orgKey.includes('Acid') && !orgKey.includes('Benzoic'));
      return `
        <svg width="86" height="136" viewBox="0 0 86 136">
          <rect x="23" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
          <path d="M 26,36 L 26,112 Q 26,130 43,130 Q 60,130 60,112 L 60,36 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>
          ${performed ? (isMiscible ? `
            <!-- Single Homogeneous Layer -->
            <path d="M 27,70 L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,70 Z" fill="rgba(56, 189, 248, 0.38)"/>
            <ellipse cx="43" cy="70" rx="16" ry="3.5" fill="rgba(255,255,255,0.4)"/>
          ` : `
            <!-- Lower Aqueous Layer -->
            <path d="M 27,92 L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,92 Z" fill="rgba(56, 189, 248, 0.45)"/>
            <ellipse cx="43" cy="92" rx="16" ry="3.2" fill="rgba(255,255,255,0.65)"/>
            <!-- Upper Non-Polar Layer -->
            <path d="M 27,70 L 27,92 L 59,92 L 59,70 Z" fill="rgba(245, 158, 11, 0.5)"/>
            <ellipse cx="43" cy="70" rx="16" ry="3.5" fill="rgba(245, 158, 11, 0.7)"/>
          `) : `
            <path d="M 27,100 L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,100 Z" fill="rgba(56, 189, 248, 0.25)"/>
          `}
        </svg>
      `;
    }

    let tubeFillColor = 'rgba(56,189,248,0.35)';
    if (performed) {
      if (testId === 'q3_kmno4') {
        if (isButanol) {
          // Cr2O7(2-) reduced to Cr(3+) green
          tubeFillColor = 'rgba(16, 185, 129, 0.7)';
        } else if (isHexene || orgKey.includes('Cyclo') || orgKey.includes('Ethanol')) {
          // Decolorized
          tubeFillColor = 'rgba(255, 255, 255, 0.25)';
        } else if (orgKey.includes('Acid')) {
          tubeFillColor = orgKey.includes('Methanoic') ? 'rgba(255, 255, 255, 0.25)' : 'rgba(168, 85, 247, 0.7)';
        }
      } else if (testId === 'q3_nahco3') {
        if (isHexene) {
          // KMnO4 decolorized in test 4 of Hex-1-ene
          tubeFillColor = 'rgba(255, 255, 255, 0.25)';
        } else if (orgKey.includes('Acid')) {
          tubeFillColor = 'rgba(56, 189, 248, 0.35)';
        }
      }
    }

    return `
      <svg width="86" height="136" viewBox="0 0 86 136">
        <rect x="23" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M 26,36 L 26,112 Q 26,130 43,130 Q 60,130 60,112 L 60,36 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>
        ${performed ? `
          <path d="M 27,70 L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,70 Z" fill="${tubeFillColor}"/>
          <ellipse cx="43" cy="70" rx="16" ry="3.5" fill="rgba(255,255,255,0.4)"/>
        ` : ''}
      </svg>
    `;
  }

  function performQ3Test(testId, stage = 'stage1') {
    if (!q3TestStates[testId]) q3TestStates[testId] = {};
    const st = q3TestStates[testId];
    st.performed = true;
    st.stage = stage;
    const p = engine?.preset?.q3 || {};
    const isQualitative = Boolean(
      p.simulationType === 'qualitative' ||
      p.trueSaltKey ||
      (!p.trueFunctionalGroup && !p.trueOrganicKey) ||
      (p.sampleName && /solid/i.test(p.sampleName))
    );

    if (isQualitative) {
      const tests = Array.isArray(p.tests) ? p.tests : [];
      const t = tests.find(item => item.id === testId) || {};
      const saltKey = String(p.trueSaltKey || 'ZnSO4');
      const prompt = t.prompt || '';
      const obs = t.correctObs || t.observation || '';

      if (window.QualitativeBenchCore) {
        const r = QualitativeBenchCore.resolveReactionState(saltKey, testId, stage, prompt, obs);
        st.statusLabel = r.statusLabel;
        QualitativeBenchCore.playReactionSound(r);
      } else {
        st.statusLabel = obs ? `Observed: ${obs.slice(0, 65)}` : 'Test Performed: Reaction Recorded';
      }
      renderQ3TestsGrid();
      updateLiveScoreDisplay();
      saveExamDraft(true);
      return;
    }

    const orgKey = String(p.trueOrganicKey || '');
    const tests = Array.isArray(p.tests) ? p.tests : [];
    const t = tests.find(item => item.id === testId) || {};
    const prompt = t.prompt || '';

    if (window.OrganicBenchCore) {
      const r = OrganicBenchCore.resolveOrganicReactionState(orgKey, testId, true, prompt);
      st.statusLabel = r.statusLabel;
      OrganicBenchCore.playOrganicSound(r.soundType);
    } else {
      const isButanol = orgKey.includes('Butan');
      const isHexene = orgKey.includes('Hex');
      const isSooty = orgKey.includes('Cyclo') || orgKey.includes('Benzoic') || isHexene || orgKey.includes('Alkene');

      if (testId === 'q3_ignition') {
        st.statusLabel = isSooty ? 'Ignition: Smoky sooty yellow flame' : 'Ignition: Clear non-sooty pale blue flame';
        if (window.QualitativeBenchCore) QualitativeBenchCore.playFlameSound();
      } else if (testId === 'q3_litmus') {
        st.statusLabel = orgKey.includes('Acid') ? 'Litmus: Turns moist blue litmus red' : 'Litmus: Neutral, no color change';
        if (window.QualitativeBenchCore) QualitativeBenchCore.playDropSplashSound();
      } else if (testId === 'q3_kmno4') {
        if (isButanol) {
          st.statusLabel = 'K₂Cr₂O₇: Orange turns green; pleasant fruity odor';
        } else if (isHexene) {
          st.statusLabel = 'Bromine Water: Reddish-brown rapidly decolorized';
        } else if (orgKey.includes('Acid')) {
          st.statusLabel = orgKey.includes('Methanoic')
            ? 'KMnO₄: Purple acidified KMnO₄ rapidly decolorized with gentle bubbling'
            : 'KMnO₄: Purple color remains unchanged';
        } else {
          st.statusLabel = 'Reaction: Decolorization observed';
        }
        if (window.QualitativeBenchCore) QualitativeBenchCore.playDropSplashSound();
      } else if (testId === 'q3_nahco3') {
        if (isHexene) {
          st.statusLabel = 'KMnO₄: Purple acidified KMnO₄ rapidly decolorized';
          if (window.QualitativeBenchCore) QualitativeBenchCore.playDropSplashSound();
        } else if (orgKey.includes('Acid')) {
          st.statusLabel = 'NaHCO₃: Vigorous effervescence of CO₂';
          if (window.QualitativeBenchCore) QualitativeBenchCore.playEffervescenceSound();
        } else {
          st.statusLabel = 'NaHCO₃: No effervescence observed';
          if (window.QualitativeBenchCore) QualitativeBenchCore.playDropSplashSound();
        }
      }
    }

    renderQ3TestsGrid();
    updateLiveScoreDisplay();
    saveExamDraft(true);
  }

  function redoQ3Test(testId) {
    q3TestStates[testId] = { performed: false, stage: 'idle' };
    renderQ3TestsGrid();
    saveExamDraft(true);
  }

  function onQ3TextChange(testId) {
    const obs = document.getElementById(`q3Obs_${testId}`)?.value || '';
    const inf = document.getElementById(`q3Inf_${testId}`)?.value || '';
    engine.setQ3Response(testId, obs, inf);
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  function onQ3DeductionChanged() {
    const fg = document.getElementById('q3FGSelect')?.value || '';
    engine.setQ3Deduction(fg);
    updateLiveScoreDisplay();
    saveExamDraft();
  }

  window.performQ3Test = performQ3Test;
  window.redoQ3Test = redoQ3Test;
  window.onQ3DeductionChanged = onQ3DeductionChanged;
  window.onQ3TextChange = onQ3TextChange;

  function insertToken(targetId, token) {
    const el = document.getElementById(targetId);
    if (!el) return;
    const start = el.selectionStart || el.value.length;
    const end = el.selectionEnd || el.value.length;
    const text = el.value;
    const prefix = (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\n') ? ' ' : '';
    const suffix = (end < text.length && text[end] !== ' ' && text[end] !== '\n') ? ' ' : '';
    el.value = text.substring(0, start) + prefix + token + suffix + text.substring(end);
    el.selectionStart = el.selectionEnd = start + prefix.length + token.length + suffix.length;
    el.focus();
    el.dispatchEvent(new Event('input'));
  }

  // ── Tab Navigation & Pacing Coach Update ────────────────────────────
  function switchQTab(qNum) {
    activeTab = qNum;
    const questions = window._examQuestionsList || [];
    const totalTabs = Math.max(3, questions.length);

    for (let n = 1; n <= totalTabs; n++) {
      const pane = document.getElementById(`paneQ${n}`);
      const btn = document.getElementById(`btnQ${n}`);
      if (pane) pane.style.display = n === qNum ? 'block' : 'none';
      if (btn) btn.className = n === qNum ? 'exam-tab-btn active' : 'exam-tab-btn';
    }

    // Update Pacing Coach Indicators
    for (let n = 1; n <= totalTabs; n++) {
      const paceEl = document.getElementById(`paceQ${n}`);
      if (paceEl) {
        paceEl.className = n === qNum ? 'pacing-milestone active' : (n < qNum ? 'pacing-milestone completed' : 'pacing-milestone');
      }
    }
    const prev = document.getElementById('paceRev');
    if (prev) prev.className = 'pacing-milestone';

    const prevBtn = document.getElementById('btnPrevQ');
    const nextBtn = document.getElementById('btnNextQ');
    const progText = document.getElementById('qProgressText');

    if (prevBtn) prevBtn.style.visibility = (qNum === 1) ? 'hidden' : 'visible';

    const currentQ = questions.find(x => x.number === qNum);
    const qTitle = currentQ ? (currentQ.title || `Question ${qNum}`) : (qNum === 1 ? 'Volumetric Titration Analysis' : (qNum === 2 ? 'Qualitative Inorganic Analysis' : 'Organic Functional Group Analysis'));
    const qMarks = currentQ ? Number(currentQ.marks).toFixed(1) : (qNum === 3 ? '10.0' : '15.0');

    if (progText) progText.textContent = `Question ${qNum} of ${totalTabs}: ${qTitle} (${qMarks} Marks)`;

    if (nextBtn) {
      if (qNum < totalTabs) {
        nextBtn.textContent = `Next Question: Q${qNum + 1} →`;
        nextBtn.onclick = () => nextQTab();
        nextBtn.className = 'btn-next-step';
      } else {
        nextBtn.textContent = '🚀 Submit Complete KCSE Exam Booklet';
        nextBtn.onclick = () => submitCompositeExam();
        nextBtn.className = 'btn-submit-exam';
      }
    }
    saveExamDraft();
  }

  function switchReportTab(tab) {
    const paneRubric = document.getElementById('reportPaneRubric');
    const paneWorked = document.getElementById('reportPaneWorked');
    const btnRubric = document.getElementById('btnReportRubric');
    const btnWorked = document.getElementById('btnReportWorked');

    if (tab === 'rubric') {
      if (paneRubric) paneRubric.style.display = 'block';
      if (paneWorked) paneWorked.style.display = 'none';
      if (btnRubric) btnRubric.className = 'examiner-tab-btn active';
      if (btnWorked) btnWorked.className = 'examiner-tab-btn';
    } else if (tab === 'worked') {
      if (paneRubric) paneRubric.style.display = 'none';
      if (paneWorked) paneWorked.style.display = 'block';
      if (btnRubric) btnRubric.className = 'examiner-tab-btn';
      if (btnWorked) btnWorked.className = 'examiner-tab-btn active';
    }
  }

  function nextQTab() {
    const totalTabs = Math.max(3, (window._examQuestionsList || []).length);
    if (activeTab < totalTabs) {
      switchQTab(activeTab + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      submitCompositeExam();
    }
  }

  function prevQTab() {
    if (activeTab > 1) {
      switchQTab(activeTab - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updateLiveScoreDisplay() {
    const evaluation = engine.evaluateExam();
    const badge = document.getElementById('compositeMarkCounter');
    if (badge) {
      badge.textContent = `${evaluation.totalScore.toFixed(1)} / 40.0 Marks (Q1: ${evaluation.q1Score.toFixed(1)} | Q2: ${evaluation.q2Score.toFixed(1)} | Q3: ${evaluation.q3Score.toFixed(1)})`;
    }
  }

  // 135-minute Countdown Timer
  let timeLeft = 135 * 60;
  const timerEl = document.getElementById('examTimerDisplay');
  const timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (timerEl) timerEl.textContent = '⏱️ 00:00 (Time Up)';
      submitCompositeExam(true);
      return;
    }
    timeLeft--;
    const hrs = Math.floor(timeLeft / 3600);
    const mins = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;
    if (timerEl) {
      timerEl.textContent = `⏱️ ${hrs > 0 ? hrs + ':' : ''}${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      if (timeLeft < 900) {
        timerEl.style.color = 'var(--red-accent)';
        timerEl.style.borderColor = 'var(--red-border)';
      }
    }
    if (timeLeft > 0 && timeLeft % 30 === 0) {
      saveExamDraft();
    }
  }, 1000);

  // ── Exam Submission & Chief Examiner Interactive Review ─────────────
  async function submitCompositeExam(isAutoSubmit = false) {
    if (!isAutoSubmit) {
      const confirmed = confirm('Are you sure you want to submit your complete KCSE Paper 3 Exam Booklet? Once submitted, your scores will be finalized.');
      if (!confirmed) return;
    }
    clearInterval(timerInterval);
    const evalData = engine.evaluateExam();

    const setElem = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setElem('modalExamTitle', evalData.examTitle);
    setElem('modalCompositeGrade', `Grade ${evalData.grade}`);
    setElem('modalCompositeScore', `${evalData.totalScore.toFixed(1)} / 40.0 Marks (${evalData.percentage}%)`);
    setElem('modalScoreQ1', evalData.q1Score.toFixed(1));
    setElem('modalScoreQ2', evalData.q2Score.toFixed(1));
    setElem('modalScoreQ3', evalData.q3Score.toFixed(1));
    setElem('modalScoreTotal', evalData.totalScore.toFixed(1));

    const isQ3Qual = Boolean(
      engine.preset?.q3?.simulationType === 'qualitative' ||
      engine.preset?.q3?.trueSaltKey ||
      (engine.preset?.q3?.sampleName && /solid/i.test(engine.preset?.q3?.sampleName))
    );
    const modalQ3Title = document.getElementById('modalRowQ3Title');
    if (modalQ3Title) {
      modalQ3Title.innerHTML = isQ3Qual
        ? `🧂 <b>Question 3:</b> Inorganic Qualitative Analysis (${escapeHtml(engine.preset?.q3?.sampleName || 'Solid P')})`
        : '🧫 <b>Question 3:</b> Organic Functional Group Analysis';
    }

    const feedbackEl = document.getElementById('modalCompositeFeedback');
    let summaryMsg = '';
    if (evalData.percentage >= 75) {
      summaryMsg = `<b>🏆 Exemplary KCSE Paper 3 Performance!</b> You demonstrated excellent procedural rigor across volumetric analysis, qualitative ledger inferences, and ${isQ3Qual ? 'systematic salt analysis' : 'organic functional group identification'}.`;
    } else if (evalData.percentage >= 50) {
      summaryMsg = `<b>👍 Competent KCSE Practical Performance!</b> Good understanding of fundamental techniques. Review titrimetric indicator accuracy, concordant titre rules, and ${isQ3Qual ? 'confirmatory precipitation reactions' : 'confirming tests for functional groups'}.`;
    } else {
      summaryMsg = `<b>📖 Intensive Practical Revision Recommended.</b> Focus on recording observations to 2 decimal places, mastering the cation/anion solubility table, and ${isQ3Qual ? 'inorganic qualitative test sequences' : 'confirming tests with acidified KMnO₄ and NaHCO₃'}.`;
    }

    if (evalData.diagnosticNotes && evalData.diagnosticNotes.length > 0) {
      summaryMsg += '<div style="margin-top:8px; font-weight:700; color:var(--amber-accent);">Chief Examiner Diagnostic Advice:</div><ul style="margin:4px 0 0 16px; padding:0;">' +
        evalData.diagnosticNotes.map(n => `<li>${n}</li>`).join('') + '</ul>';
    }
    if (feedbackEl) feedbackEl.innerHTML = summaryMsg;

    // Populate Detailed Item-by-Item Rubric Box
    const rubricBox = document.getElementById('modalDetailedRubricBox');
    if (rubricBox) {
      const q1Rubric = evalData.q1Details?.rubric || [];
      const q2Rubric = evalData.q2Details?.rubric || [];
      const q3Rubric = evalData.q3Details?.rubric || [];

      let rubricHtml = '';
      if (q1Rubric.length > 0) {
        rubricHtml += '<div style="font-weight:800; color:var(--cyan-accent); margin-top:4px;">🧪 Q1 Volumetric Analysis (15.0 Marks):</div>';
        rubricHtml += q1Rubric.map(r => `
          <div style="border-bottom:1px solid var(--border-subtle, rgba(255,255,255,0.06)); padding:6px 0;">
            <div class="rubric-item-row">
              <span>${r.pass ? '✅' : '❌'} ${r.code ? `<b>[${r.code}]</b> ` : ''}${r.item}</span>
              <span style="font-family:var(--font-mono); font-weight:700; color:${r.pass ? 'var(--green-accent)' : 'var(--red-accent)'};">${r.mark.toFixed(1)} / ${r.max.toFixed(1)}</span>
            </div>
            ${r.detail ? `<div style="font-size:0.75rem; color:var(--text-muted); padding-left:22px; margin-top:2px;">${r.detail}</div>` : ''}
          </div>
        `).join('');
      }

      if (q2Rubric.length > 0) {
        rubricHtml += '<div style="font-weight:800; color:var(--cyan-accent); margin-top:12px;">🧂 Q2 Qualitative Inorganic Analysis (15.0 Marks):</div>';
        rubricHtml += q2Rubric.map(r => `
          <div style="border-bottom:1px solid var(--border-subtle, rgba(255,255,255,0.06)); padding:6px 0;">
            <div class="rubric-item-row">
              <span>${r.pass ? '✅' : '❌'} ${r.code ? `<b>[${r.code}]</b> ` : ''}${r.item}</span>
              <span style="font-family:var(--font-mono); font-weight:700; color:${r.pass ? 'var(--green-accent)' : 'var(--red-accent)'};">${r.mark.toFixed(1)} / ${r.max.toFixed(1)}</span>
            </div>
            ${r.detail ? `<div style="font-size:0.75rem; color:var(--text-muted); padding-left:22px; margin-top:2px;">${r.detail}</div>` : ''}
          </div>
        `).join('');
      }

      if (q3Rubric.length > 0) {
        const q3SectionHeader = isQ3Qual
          ? `🧂 Q3 Qualitative Inorganic Analysis · ${escapeHtml(engine.preset?.q3?.sampleName || 'Solid P')} (10.0 Marks):`
          : '🧫 Q3 Qualitative Organic Analysis (10.0 Marks):';
        rubricHtml += `<div style="font-weight:800; color:var(--cyan-accent); margin-top:12px;">${q3SectionHeader}</div>`;
        rubricHtml += q3Rubric.map(r => `
          <div style="border-bottom:1px solid var(--border-subtle, rgba(255,255,255,0.06)); padding:6px 0;">
            <div class="rubric-item-row">
              <span>${r.pass ? '✅' : '❌'} ${r.code ? `<b>[${r.code}]</b> ` : ''}${r.item}</span>
              <span style="font-family:var(--font-mono); font-weight:700; color:${r.pass ? 'var(--green-accent)' : 'var(--red-accent)'};">${r.mark.toFixed(1)} / ${r.max.toFixed(1)}</span>
            </div>
            ${r.detail ? `<div style="font-size:0.75rem; color:var(--text-muted); padding-left:22px; margin-top:2px;">${r.detail}</div>` : ''}
          </div>
        `).join('');
      }

      // Add written questions and specialized simulation status if any
      const extraQuestions = (window._examQuestionsList || []).filter(q => q.simulationType === 'written' || ['energy', 'rates', 'gas', 'solubility'].includes(q.simulationType));
      extraQuestions.forEach(eq => {
        const isW = eq.simulationType === 'written';
        const icon = isW ? '✏️' : '🔬';
        rubricHtml += `<div style="font-weight:800; color:var(--cyan-accent); margin-top:12px;">${icon} Q${eq.number}: ${escapeHtml(eq.title || 'Question ' + eq.number)} (${Number(eq.marks || 10).toFixed(1)} Marks):</div>`;
        rubricHtml += `
          <div style="border-bottom:1px solid var(--border-subtle, rgba(255,255,255,0.06)); padding:6px 0;">
            <div class="rubric-item-row">
              <span>${isW ? '📝 Structured Theory/Practical Responses' : '💻 Interactive Virtual Experiment'}</span>
              <span style="font-family:var(--font-mono); font-weight:700; color:var(--amber-accent);">${isW ? 'Saved & Submitted' : 'Recorded'}</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); padding-left:22px; margin-top:2px;">
              ${isW ? 'Candidate answers recorded for instant AI appraisal and teacher evaluation.' : 'Laboratory experiment executed in dedicated workbench simulator.'}
            </div>
          </div>
        `;
      });

      rubricBox.innerHTML = rubricHtml || '<div style="padding:10px; color:var(--text-muted);">Evaluation completed successfully.</div>';
    }

    // Populate Worked Mathematical Model Solutions List
    const workedBox = document.getElementById('modalWorkedSolutionsList');
    if (workedBox && evalData.workedSolutions) {
      const ws = evalData.workedSolutions;
      const steps = Object.values(ws);
      workedBox.innerHTML = steps.map(s => `
        <div style="background:var(--card-bg); border:1px solid var(--card-border); border-radius:8px; padding:12px 14px;">
          <div style="font-weight:800; font-size:0.84rem; color:var(--heading-color); margin-bottom:4px;">${s.title}</div>
          <div style="font-size:0.82rem; color:var(--text-main); font-family:var(--font-mono); margin-top:4px;">${s.workingHtml || ''}</div>
        </div>
      `).join('');
    }

    const modalEl = document.getElementById('compositeResultModal');
    if (modalEl) modalEl.style.display = 'flex';

    // Populate Print Booklet summary scores
    setElem('printTotalScore', `${evalData.totalScore.toFixed(1)} / 40.0 Marks`);
    setElem('pScoreQ1', `${evalData.q1Score.toFixed(1)} / 15.0`);
    setElem('pScoreQ2', `${evalData.q2Score.toFixed(1)} / 15.0`);
    setElem('pScoreQ3', `${evalData.q3Score.toFixed(1)} / 10.0`);
    setElem('pGrade', `${evalData.grade} (${evalData.totalScore.toFixed(1)} / 40.0 Marks)`);

    const payload = engine.buildSubmissionPayload(assignmentId);
    try {
      if (window.Composite && Composite.save) {
        await Composite.save(payload);
      } else if (window.API) {
        await apiRequest('POST', '/composite', payload);
      }
      localStorage.setItem('vlk_last_composite_session', JSON.stringify(payload));
    } catch(e) {
      console.warn('Could not post composite exam to server:', e);
      localStorage.setItem('vlk_last_composite_session', JSON.stringify(payload));
    }

    try {
      if (window.ExamDraftManager) {
        ExamDraftManager.clearDraft(getExamSessionKey());
      }
    } catch (clearErr) {
      console.warn('Could not clear exam draft on submission:', clearErr);
    }
  }

  function printKCSEBooklet() {
    const evalData = engine.evaluateExam();
    const p = engine.preset;

    // Populate Q1 Print Table (supports multi-procedure titrations)
    let q1Html = '';
    if (p.q1?.hasMultipleProcedures && Array.isArray(p.q1.procedures) && p.q1.procedures.length > 1) {
      p.q1.procedures.forEach((proc, pIdx) => {
        const pTrials = engine.getProcedureTrials(pIdx);
        const pAnswers = engine.getProcedureAnswers(pIdx);
        q1Html += `
          <div style="margin-top:${pIdx > 0 ? '12px' : '0'}; margin-bottom:6px; font-weight:bold;">
            ${escapeHtml(proc.title || `Procedure ${pIdx === 0 ? 'I' : 'II'}`)} — ${escapeHtml(proc.tableTitle || `Table ${pIdx + 1}`)} (${Number(proc.tableMarks || 4).toFixed(1)} Marks)
          </div>
          <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:0.8rem;">
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #000; padding:4px;">Titration Trial</th>
              <th style="border:1px solid #000; padding:4px;">I</th>
              <th style="border:1px solid #000; padding:4px;">II</th>
              <th style="border:1px solid #000; padding:4px;">III</th>
            </tr>
            <tr>
              <td style="border:1px solid #000; padding:4px;">Final Reading (cm³)</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[0]?.final || 0).toFixed(2)}</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[1]?.final || 0).toFixed(2)}</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[2]?.final || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000; padding:4px;">Initial Reading (cm³)</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[0]?.initial || 0).toFixed(2)}</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[1]?.initial || 0).toFixed(2)}</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[2]?.initial || 0).toFixed(2)}</td>
            </tr>
            <tr style="font-weight:bold;">
              <td style="border:1px solid #000; padding:4px;">Volume of Titrant Used (cm³)</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[0]?.used || 0).toFixed(2)}</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[1]?.used || 0).toFixed(2)}</td>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${(pTrials[2]?.used || 0).toFixed(2)}</td>
            </tr>
          </table>
          ${(proc.questions || []).map(q => {
            const fieldKey = q.field || q.id;
            const ans = pAnswers[fieldKey] !== undefined ? pAnswers[fieldKey] : (pAnswers[q.id] || '—');
            return `<div>(${escapeHtml(q.letter || q.id)}) ${escapeHtml(q.label)}: <b>${ans} ${escapeHtml(q.unit || '')}</b></div>`;
          }).join('')}
        `;
      });
    } else if (p.q1 && engine.q1Trials) {
      q1Html = `
        <div style="margin-bottom:8px;"><b>Table 1: Titration Results</b></div>
        <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:0.8rem;">
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #000; padding:4px;">Titration Trial</th>
            <th style="border:1px solid #000; padding:4px;">I</th>
            <th style="border:1px solid #000; padding:4px;">II</th>
            <th style="border:1px solid #000; padding:4px;">III</th>
          </tr>
          <tr>
            <td style="border:1px solid #000; padding:4px;">Final Burette Reading (cm³)</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[0]?.final || 0).toFixed(2)}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[1]?.final || 0).toFixed(2)}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[2]?.final || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000; padding:4px;">Initial Burette Reading (cm³)</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[0]?.initial || 0).toFixed(2)}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[1]?.initial || 0).toFixed(2)}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[2]?.initial || 0).toFixed(2)}</td>
          </tr>
          <tr style="font-weight:bold;">
            <td style="border:1px solid #000; padding:4px;">Volume of Solution A Used (cm³)</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[0]?.used || 0).toFixed(2)}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[1]?.used || 0).toFixed(2)}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${(engine.q1Trials[2]?.used || 0).toFixed(2)}</td>
          </tr>
        </table>
        ${((p.q1?.questions) || []).map(q => {
          const fieldKey = q.field || q.id;
          const ans = engine.q1Answers[fieldKey] !== undefined ? engine.q1Answers[fieldKey] : (engine.q1Answers[q.id] || '—');
          return `<div>(${q.letter || ''}) ${q.label || ''}: <b>${ans} ${q.unit || ''}</b></div>`;
        }).join('')}
      `;
    }
    const printQ1El = document.getElementById('printQ1Content');
    if (printQ1El && q1Html) printQ1El.innerHTML = q1Html;

    // Populate Q2 Print Table
    let q2Html = '';
    if (p.q2 && Array.isArray(p.q2.tests) && p.q2.tests.length > 0) {
      q2Html = `
      <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:0.8rem;">
        <tr style="background:#f1f5f9;">
          <th style="border:1px solid #000; padding:4px; width:45%;">Test / Procedure</th>
          <th style="border:1px solid #000; padding:4px; width:30%;">Candidate Observations</th>
          <th style="border:1px solid #000; padding:4px; width:25%;">Candidate Inferences</th>
        </tr>
        ${p.q2.tests.map(t => `
          <tr>
            <td style="border:1px solid #000; padding:4px;">${t.prompt}</td>
            <td style="border:1px solid #000; padding:4px;">${engine.q2Obs[t.id] || '—'}</td>
            <td style="border:1px solid #000; padding:4px;">${engine.q2Inf[t.id] || '—'}</td>
          </tr>
        `).join('')}
      </table>
      ${p.q2?.hasDeduction ? `<div><b>Final Deductions:</b> Cation: <u>${engine.q2CationChoice || '—'}</u> &nbsp;|&nbsp; Anion: <u>${engine.q2AnionChoice || '—'}</u></div>` : ''}
    `;
    }
    const printQ2El = document.getElementById('printQ2Content');
    if (printQ2El && q2Html) printQ2El.innerHTML = q2Html;

    // Populate Q3 Print Table
    const q3TestsList = (Array.isArray(p.q3?.tests) && p.q3.tests.length > 0) ? p.q3.tests : [];
    const isQ3Qual = p.q3?.simulationType === 'qualitative' || p.q3?.trueSaltKey || (p.q3?.sampleName && /solid/i.test(p.q3.sampleName));
    let q3Html = '';
    if (q3TestsList.length > 0) {
      q3Html = `
      <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:0.8rem;">
        <tr style="background:#f1f5f9;">
          <th style="border:1px solid #000; padding:4px; width:45%;">Test / Procedure</th>
          <th style="border:1px solid #000; padding:4px; width:30%;">Candidate Observations</th>
          <th style="border:1px solid #000; padding:4px; width:25%;">Candidate Inferences</th>
        </tr>
        ${q3TestsList.map(t => `
          <tr>
            <td style="border:1px solid #000; padding:4px;">${t.prompt}</td>
            <td style="border:1px solid #000; padding:4px;">${engine.q3Obs[t.id] || '—'}</td>
            <td style="border:1px solid #000; padding:4px;">${engine.q3Inf[t.id] || '—'}</td>
          </tr>
        `).join('')}
      </table>
      ${!isQ3Qual && engine.q3FunctionalGroupChoice ? `<div><b>Functional Group Deduction:</b> <u>${engine.q3FunctionalGroupChoice || '—'}</u></div>` : ''}
    `;
    }
    const printQ3El = document.getElementById('printQ3Content');
    if (printQ3El && q3Html) printQ3El.innerHTML = q3Html;

    // Format any written questions or specialized simulator questions
    const questionsList = window._examQuestionsList || [];
    questionsList.forEach(q => {
      const targetPrintEl = document.getElementById(`printQ${q.number}Content`);
      if (q.simulationType === 'written' && targetPrintEl) {
        const subQs = Array.isArray(q.subQuestions) ? q.subQuestions : [];
        let wHtml = `
          <div style="margin-bottom:6px;"><b>${escapeHtml(q.title || 'Written Question')}</b> (${Number(q.marks || 10).toFixed(1)} Marks)</div>
          ${q.prompt ? `<div style="margin-bottom:8px; font-style:italic;">${escapeHtml(q.prompt)}</div>` : ''}
        `;
        if (subQs.length > 0) {
          wHtml += subQs.map(sq => {
            const ansInput = document.getElementById(`writtenAnswer_${q.number}_${sq.id}`);
            const ans = ansInput ? (ansInput.value.trim() || '—') : '—';
            return `
              <div style="margin-bottom:8px;">
                <div><b>(${escapeHtml(sq.id)})</b> ${escapeHtml(sq.text || '')} [${Number(sq.marks || 1).toFixed(1)} Mks]</div>
                <div style="padding:4px 8px; border:1px solid #94a3b8; background:#f8fafc; margin-top:2px;">
                  Candidate Answer: <b>${escapeHtml(ans)}</b>
                </div>
              </div>
            `;
          }).join('');
        }
        targetPrintEl.innerHTML = wHtml;
      } else if (['energy', 'rates', 'gas', 'solubility'].includes(q.simulationType) && targetPrintEl) {
        targetPrintEl.innerHTML = `
          <div style="padding:8px 12px; border:1px solid #cbd5e1; background:#f8fafc; border-radius:4px;">
            <b>${escapeHtml(q.title || 'Specialized Simulation')}</b> (${Number(q.marks || 15).toFixed(1)} Marks)<br>
            <span style="font-size:0.8rem; color:#475569;">Interactive laboratory workbench session logged and saved.</span>
          </div>
        `;
      }
    });

    // Embed candidate plotted KNEC graph sheets
    if (window.knecPlotters) {
      Object.keys(window.knecPlotters).forEach(k => {
        const plotter = window.knecPlotters[k];
        if (plotter && Array.isArray(plotter.points) && plotter.points.length > 0) {
          const qNumStr = k.replace('q', '');
          const targetPrintEl = document.getElementById(`printQ${qNumStr}Content`);
          if (targetPrintEl) {
            const imgData = plotter.toDataURL();
            targetPrintEl.innerHTML += `
              <div style="margin-top:14px; page-break-inside:avoid;">
                <div style="font-weight:bold; font-size:0.85rem; margin-bottom:4px;">KNEC Examination Graph Sheet (Candidate Plotted):</div>
                <img src="${imgData}" style="max-width:100%; height:auto; border:1px solid #000; display:block; margin:0 auto;" alt="KNEC Plotted Graph">
              </div>
            `;
          }
        }
      });
    }

    window.print();
  }

  function toggleBenchSettings(e) {
    if (e) e.stopPropagation();
    const dd = document.getElementById('benchSettingsDropdown');
    if (dd) dd.style.display = dd.style.display === 'none' ? 'flex' : 'none';
  }

  function setTheme(theme) {
    localStorage.setItem('vlk_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn-chip').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
  }

  document.addEventListener('click', (e) => {
    const dd = document.getElementById('benchSettingsDropdown');
    if (dd && dd.style.display === 'flex' && !dd.contains(e.target)) {
      dd.style.display = 'none';
    }
  });

  initExamUI();

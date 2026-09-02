// ============================================================
//  VirtuLab Kenya — Visual Skill Tree & Learning Pathway Engine
//  Interactive KCSE Chemistry Node-based Progression Map
// ============================================================

(function () {
  'use strict';

  const PATHWAY_DATA = [
    {
      id: 'branch-volumetric',
      title: '1. Volumetric Analysis',
      tag: 'Paper 3 · Question 1 (15 Marks)',
      description: 'Master burette reading precision, concordancy, indicator transitions, and stoichiometric calculations.',
      nodes: [
        {
          id: 'node-acid-base',
          title: 'Acid-Base Standardisation',
          sublabel: 'HCl vs NaOH',
          icon: '🧪',
          url: 'lab.html?type=acidBase',
          syllabus: 'KNEC Form 4 Volumetric Standardisation',
          skills: ['Meniscus viewfinder alignment (0.10 cm³ precision)', 'Drop-wise stopcock manipulation', 'Titre concordancy within ±0.10 cm³', 'Molarity & mass concentration stoichiometry'],
          sessionKey: 'acidBase',
          maxMarks: 15
        },
        {
          id: 'node-redox',
          title: 'Redox Titration',
          sublabel: 'Fe²⁺ vs KMnO₄',
          icon: '🔮',
          url: 'lab.html?type=redox',
          syllabus: 'KNEC Form 4 Redox & Transition Elements',
          skills: ['Self-indicating KMnO₄ end-point recognition', 'Sulfuric acid acidification', 'Molar ratio stoichiometry (5 Fe²⁺ : 1 MnO₄⁻)', 'Redox equivalence detection'],
          sessionKey: 'redox',
          maxMarks: 15
        },
        {
          id: 'node-polyprotic',
          title: 'Polyprotic & Weak Acids',
          sublabel: 'H₂SO₄ / CH₃COOH',
          icon: '⚖️',
          url: 'lab.html?type=dibasic',
          syllabus: 'KNEC Form 4 Basicity & Mole Concept',
          skills: ['Dibasic and tribasic neutralization ratios (1:2 and 1:3)', 'Weak acid partial dissociation', 'Phenolphthalein end-point stability', 'Relative Formula Mass (RFM) determination'],
          sessionKey: 'dibasic',
          maxMarks: 15
        },
        {
          id: 'node-precipitation',
          title: 'Precipitation & Complexometry',
          sublabel: 'AgNO₃ / EDTA',
          icon: '💎',
          url: 'lab.html?type=precipitation',
          syllabus: 'KNEC Form 4 Mohr\'s & Hardness Titration',
          skills: ['Mohr\'s chromate indicator end-point', 'EDTA chelation of Ca²⁺ and Mg²⁺', 'Water hardness quantification', 'Silver halide precipitation'],
          sessionKey: 'precipitation',
          maxMarks: 15
        }
      ]
    },
    {
      id: 'branch-qualitative',
      title: '2. Qualitative Salt Analysis',
      tag: 'Paper 3 · Question 2 (15 Marks)',
      description: 'Systematic identification of unknown cations and anions through reagent precipitate testing and flame emissions.',
      nodes: [
        {
          id: 'node-cations',
          title: 'Cation Precipitation Bench',
          sublabel: 'NaOH & NH₃ Tests',
          icon: '🔬',
          url: 'qualitative.html',
          syllabus: 'KNEC Form 4 Qualitative Inorganic Chemistry',
          skills: ['Differential precipitate color observation', 'Amphoteric hydroxide solubility in excess reagent (Zn²⁺, Al³⁺, Pb²⁺)', 'Complex ion amine formation ([Cu(NH₃)₄]²⁺)', 'Oxidation state transitions (Fe²⁺ → Fe³⁺)'],
          sessionKey: 'qualitative',
          maxMarks: 15
        },
        {
          id: 'node-anions',
          title: 'Anion & Gas Evolution',
          sublabel: 'CO₃²⁻, SO₄²⁻, Cl⁻',
          icon: '⚗️',
          url: 'qualitative.html',
          syllabus: 'KNEC Form 4 Anion Confirmatory Testing',
          skills: ['Effervescence & lime water testing for CO₃²⁻', 'Ba(NO₃)₂ precipitation of SO₄²⁻ and SO₃²⁻', 'AgNO₃ confirmation of Cl⁻ / Br⁻ halides', 'Nitrate reduction to NH₃ gas'],
          sessionKey: 'qualitative_anions',
          maxMarks: 15
        },
        {
          id: 'node-flame',
          title: 'Flame Emission Spectroscopy',
          sublabel: 'Wire Loop Bench',
          icon: '🔥',
          url: 'qualitative.html',
          syllabus: 'KNEC Flame Test Cation Identification',
          skills: ['Nichrome wire loop cleaning in conc. HCl', 'Non-luminous Bunsen flame positioning', 'Characteristic emission spectra (Na⁺ Golden, K⁺ Lilac, Ca²⁺ Brick Red, Cu²⁺ Green)', 'Flame interference elimination'],
          sessionKey: 'qualitative_flame',
          maxMarks: 15
        }
      ]
    },
    {
      id: 'branch-kinetics',
      title: '3. Kinetics & Energetics',
      tag: 'Paper 3 · Q3 Focus',
      description: 'Quantify reaction rates, activation energies, enthalpy changes, and solubility crystallization curves.',
      nodes: [
        {
          id: 'node-rates',
          title: 'Reaction Rates & Kinetics',
          sublabel: 'Disappearing Cross',
          icon: '⚡',
          url: 'rates.html',
          syllabus: 'KNEC Form 4 Rates of Reaction & Equilibrium',
          skills: ['Disappearing cross optical extinction timing', 'Concentration and temperature coefficient calculation', 'Rate curves ($1/t$ vs concentration plotting)', 'Collision theory & activation energy dynamics'],
          sessionKey: 'rates',
          maxMarks: 10
        },
        {
          id: 'node-energy',
          title: 'Thermochemistry & Enthalpies',
          sublabel: 'Calorimetry ΔH',
          icon: '🌡️',
          url: 'energy.html',
          syllabus: 'KNEC Form 4 Energy Changes in Chemical Reactions',
          skills: ['Polystyrene cup calorimetry insulation', 'Neutralization, solution & displacement temperature extrapolation', 'Enthalpy calculation ($\Delta H = -mc\Delta T / n$)', 'Energy level diagrams & thermochemical equations'],
          sessionKey: 'energy',
          maxMarks: 10
        },
        {
          id: 'node-solubility',
          title: 'Solubility & Crystallization',
          sublabel: 'Solute Curves',
          icon: '❄️',
          url: 'solubility.html',
          syllabus: 'KNEC Form 3 Topic 4: Solubility of Salts',
          skills: ['Serial water dilution technique', 'First crystallization temperature detection', 'Solubility curve extrapolation (g solute / 100g H₂O)', 'Fractional crystallization yield calculation'],
          sessionKey: 'solubility',
          maxMarks: 10
        }
      ]
    },
    {
      id: 'branch-organic-gas',
      title: '4. Organic & Gas Chemistry',
      tag: 'Paper 3 · Question 3 Focus',
      description: 'Prepare, dry, collect, and test essential inorganic gases and distinguish organic functional groups.',
      nodes: [
        {
          id: 'node-gas-prep',
          title: 'Gas Preparation Lab',
          sublabel: 'O₂, CO₂, Cl₂, NH₃',
          icon: '💨',
          url: 'gas_prep.html',
          syllabus: 'KNEC Form 2 & 3 Inorganic Gas Practicals',
          skills: ['Reactant combination selection (e.g. MnO₂ + H₂O₂)', 'Appropriate drying agent matching (CaO, H₂SO₄, CaCl₂)', 'Collection method choice based on density & solubility', 'Confirmatory gas tests (splint, litmus, starch-iodide)'],
          sessionKey: 'gas',
          maxMarks: 10
        },
        {
          id: 'node-organic',
          title: 'Organic Functional Groups',
          sublabel: 'Br₂, KMnO₄, NaHCO₃',
          icon: '🌿',
          url: 'organic.html',
          syllabus: 'KNEC Form 4 Organic Chemistry II (Paper 3 Q3)',
          skills: ['Combustion flame sooty vs luminous observation', 'Bromine water & acidified KMnO₄ unsaturation testing', 'Sodium hydrogen carbonate effervescence (—COOH)', 'Acidified K₂Cr₂O₇ oxidation of alkanols'],
          sessionKey: 'organic',
          maxMarks: 10
        }
      ]
    },
    {
      id: 'branch-capstone',
      title: '5. Capstone Mock Exam',
      tag: '40-Mark National Mock',
      isCapstone: true,
      description: 'Complete all 3 comprehensive practical questions under timed exam conditions for official KNEC KCSE grading (A–E).',
      nodes: [
        {
          id: 'node-composite-exam',
          title: '40-Mark KCSE Mock Exam',
          sublabel: 'Q1 + Q2 + Q3 Timed',
          icon: '🏆',
          url: 'composite_exam.html',
          syllabus: 'Official KNEC KCSE Chemistry Practical (233/3)',
          skills: ['40-Minute full examination timing', 'Question 1: Volumetric Titration (15 Marks)', 'Question 2: Qualitative Salt Analysis (15 Marks)', 'Question 3: Organic Functional Groups (10 Marks)'],
          sessionKey: 'composite',
          maxMarks: 40,
          isCapstone: true
        }
      ]
    }
  ];

  // ── 1. Progress & Score Evaluator ──────────────────────────────
  function getNodeProgress(node, sessions) {
    // Check locally stored session results and server logs
    let maxScore = 0;
    let attempts = 0;

    const storedKey = 'vlk_best_' + node.sessionKey;
    const localBest = parseFloat(localStorage.getItem(storedKey) || '0');
    if (localBest > maxScore) maxScore = localBest;

    if (Array.isArray(sessions) && sessions.length > 0) {
      sessions.forEach(s => {
        const sType = (s.experiment_type || s.titration_type || s.type || s.practical_key || '').toLowerCase();
        const sTitle = (s.titration_title || s.title || '').toLowerCase();
        
        let match = false;
        if (node.sessionKey === 'acidBase' && (sType.includes('acid') || sType.includes('base') || sTitle.includes('acid') || sTitle.includes('hcl') || sTitle.includes('naoh'))) match = true;
        else if (node.sessionKey === 'redox' && (sType.includes('redox') || sTitle.includes('redox') || sTitle.includes('kmno4') || sTitle.includes('fe2+'))) match = true;
        else if (node.sessionKey === 'dibasic' && (sType.includes('dibasic') || sType.includes('polyprotic') || sTitle.includes('h2so4') || sTitle.includes('dibasic'))) match = true;
        else if (node.sessionKey === 'precipitation' && (sType.includes('precipit') || sTitle.includes('agno3') || sTitle.includes('edta') || sTitle.includes('mohr'))) match = true;
        else if (node.sessionKey === 'qualitative' && (sType.includes('qual') || sType.includes('cation') || sTitle.includes('cation') || s.student_cation)) match = true;
        else if (node.sessionKey === 'qualitative_anions' && (sType.includes('anion') || sTitle.includes('anion') || s.student_anion)) match = true;
        else if (node.sessionKey === 'qualitative_flame' && (sType.includes('flame') || sTitle.includes('flame'))) match = true;
        else if (node.sessionKey === 'rates' && (sType.includes('rate') || sType.includes('kinetic') || sTitle.includes('disappearing') || sTitle.includes('rate'))) match = true;
        else if (node.sessionKey === 'energy' && (sType.includes('energy') || sType.includes('thermo') || sTitle.includes('enthalpy') || sTitle.includes('heat'))) match = true;
        else if (node.sessionKey === 'solubility' && (sType.includes('solub') || sTitle.includes('solub') || sTitle.includes('crystal'))) match = true;
        else if (node.sessionKey === 'gas' && (sType.includes('gas') || sTitle.includes('gas'))) match = true;
        else if (node.sessionKey === 'organic' && (sType.includes('organic') || sTitle.includes('organic') || sTitle.includes('alkene') || sTitle.includes('alkanol'))) match = true;
        else if (node.sessionKey === 'composite' && (sType.includes('composite') || sType.includes('mock') || sTitle.includes('mock') || sTitle.includes('paper 3'))) match = true;
        else if (sType === node.sessionKey.toLowerCase()) match = true;

        if (match) {
          attempts++;
          const score = parseFloat(s.total_score || s.score || (s.correct ? node.maxMarks : 0) || 0);
          if (score > maxScore) maxScore = score;
        }
      });
    }

    const pct = node.maxMarks > 0 ? (maxScore / node.maxMarks) : 0;
    let stars = 0;
    if (pct >= 0.82) stars = 3;
    else if (pct >= 0.55) stars = 2;
    else if (attempts > 0 || maxScore > 0) stars = 1;

    return {
      maxScore,
      attempts,
      pct,
      stars,
      completed: stars >= 1
    };
  }

  // ── 2. Render Skill Tree HTML ─────────────────────────────────
  function renderSkillTree(sessionsParam) {
    const container = document.getElementById('skillTreeContainer');
    if (!container) return;

    let sessions = Array.isArray(sessionsParam) ? sessionsParam : [];
    if (!sessions.length) {
      try {
        const raw = localStorage.getItem('vlk_cached_sessions');
        if (raw) sessions = JSON.parse(raw);
      } catch (e) {}
    }

    let totalEarnedStars = 0;
    let totalPossibleStars = 0;
    let totalCompletedNodes = 0;
    let totalNodesCount = 0;
    let activeNodeFound = false;

    // Count and evaluate nodes
    PATHWAY_DATA.forEach(branch => {
      branch.nodes.forEach(node => {
        totalNodesCount++;
        totalPossibleStars += 3;
        const prog = getNodeProgress(node, sessions);
        node.progress = prog;
        totalEarnedStars += prog.stars;
        if (prog.completed) totalCompletedNodes++;
      });
    });

    const syllabusPct = Math.round((totalCompletedNodes / totalNodesCount) * 100);

    let html = `
      <!-- Compact Pathway Stats Banner -->
      <div class="st-stats-banner">
        <div class="st-stats-row-compact">
          <div class="st-stats-chips-group">
            <span class="st-stat-pill"><b>${totalCompletedNodes}/${totalNodesCount}</b> Practicals</span>
            <span class="st-stat-pill st-stat-stars"><b>${totalEarnedStars}/${totalPossibleStars}</b> Stars</span>
          </div>
          <div class="st-stat-progress-compact">
            <div class="st-progress-label-row">
              <span>Syllabus Mastery</span>
              <b style="color:var(--green-accent);">${syllabusPct}%</b>
            </div>
            <div class="st-progress-track">
              <div class="st-progress-fill" style="width:${syllabusPct}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="skill-tree-pathway">
    `;

    PATHWAY_DATA.forEach((branch) => {
      const isCapstoneBranch = !!branch.isCapstone;
      const nodeCount = branch.nodes.length;
      html += `
        <section class="st-branch ${isCapstoneBranch ? 'st-capstone-branch' : ''}" id="${branch.id}">
            <div class="st-branch-header">
              <div class="st-branch-title">
                <span>${branch.title}</span>
              </div>
              <span class="st-branch-tag">${branch.tag}</span>
            </div>

            <div class="st-nodes-track track-count-${nodeCount}" style="--node-count: ${nodeCount};">
        `;

      branch.nodes.forEach((node) => {
        const prog = node.progress;
        let stateClass = '';
        let isNodeActive = false;

        if (prog.completed) {
          stateClass = 'completed';
        } else if (!activeNodeFound) {
          stateClass = 'active';
          isNodeActive = true;
          activeNodeFound = true; // First uncompleted is marked active
        } else {
          stateClass = 'unlocked';
        }

        if (node.isCapstone) {
          stateClass += ' capstone';
        }

        // Render 3 stars
        let starsHtml = '';
        for (let s = 1; s <= 3; s++) {
          starsHtml += `<span class="${s <= prog.stars ? '' : 'st-star-empty'}">★</span>`;
        }

        html += `
          <div class="st-node-wrapper ${stateClass}" onclick="SkillTree.openModal('${node.id}')" role="button" tabindex="0" aria-label="${node.title}">
            ${isNodeActive ? '<span class="st-node-beacon">Next Up 🔥</span>' : ''}
            <div class="st-node-circle">
              <span>${node.icon}</span>
            </div>
            <div class="st-node-stars">
              ${starsHtml}
            </div>
            <div class="st-node-label">${node.title}</div>
            <div class="st-node-sublabel">${node.sublabel}</div>
          </div>
        `;
      });

      html += `
          </div>
        </section>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  // ── 3. Interactive Node Details Popover / Modal ───────────────
  function openNodeModal(nodeId) {
    let foundNode = null;
    PATHWAY_DATA.forEach(b => {
      b.nodes.forEach(n => {
        if (n.id === nodeId) foundNode = n;
      });
    });

    if (!foundNode) return;

    if (window.BrilliantUI) {
      window.BrilliantUI.audio.playClick();
      window.BrilliantUI.vibrate(12);
    }

    const modal = document.getElementById('skillTreeModal');
    if (!modal) return;

    const prog = foundNode.progress || { maxScore: 0, stars: 0, attempts: 0 };
    const starsStr = '★'.repeat(prog.stars) + '☆'.repeat(3 - prog.stars);

    document.getElementById('stModalIcon').textContent = foundNode.icon;
    document.getElementById('stModalTitle').textContent = foundNode.title;
    document.getElementById('stModalSyllabus').textContent = foundNode.syllabus;
    document.getElementById('stModalDesc').textContent = `Target question mapped to KCSE Chemistry Practical. Master key precision techniques and earn up to ${foundNode.maxMarks} marks.`;

    const skillsContainer = document.getElementById('stModalSkillsList');
    if (skillsContainer && foundNode.skills) {
      skillsContainer.innerHTML = `
        <strong>🎯 Core Practical Competencies:</strong>
        <ul>
          ${foundNode.skills.map(s => `<li>${s}</li>`).join('')}
        </ul>
      `;
    }

    const statsRow = document.getElementById('stModalStatsRow');
    if (statsRow) {
      statsRow.innerHTML = `
        <div>
          <span style="color:var(--b-text-muted); font-size:0.75rem; display:block;">PERSONAL BEST</span>
          <strong style="font-size:0.95rem; font-family:'JetBrains Mono',monospace; color:var(--b-emerald);">${prog.maxScore > 0 ? prog.maxScore.toFixed(1) : '0.0'} / ${foundNode.maxMarks} Mks</strong>
        </div>
        <div style="text-align:right;">
          <span style="color:var(--b-text-muted); font-size:0.75rem; display:block;">MASTERY RATING</span>
          <strong style="font-size:0.95rem; color:var(--b-amber);">${starsStr}</strong>
        </div>
      `;
    }

    const launchBtn = document.getElementById('stModalLaunchBtn');
    if (launchBtn) {
      launchBtn.href = foundNode.url;
      launchBtn.textContent = prog.completed ? 'Launch Experiment (Practice Again) →' : 'Start Practical Experiment →';
    }

    modal.classList.add('open');
  }

  function closeNodeModal() {
    const modal = document.getElementById('skillTreeModal');
    if (modal) modal.classList.remove('open');
  }

  // ── 4. View Switcher (Pathway vs Grid) ────────────────────────
  function switchPathwayView(view) {
    const isTree = view === 'tree';
    localStorage.setItem('vlk_benches_view', view);

    const stWrap = document.getElementById('skillTreeContainer');
    const gridWrap = document.getElementById('practiceGridWrap');
    const btnTree = document.getElementById('btnViewTree');
    const btnGrid = document.getElementById('btnViewGrid');

    if (stWrap) stWrap.style.display = isTree ? 'block' : 'none';
    if (gridWrap) gridWrap.style.display = isTree ? 'none' : 'block';

    if (btnTree) btnTree.classList.toggle('active', isTree);
    if (btnGrid) btnGrid.classList.toggle('active', !isTree);

    if (isTree) {
      renderSkillTree();
    }
  }

  // ── Public API ───────────────────────────────────────────────
  window.SkillTree = {
    render: renderSkillTree,
    renderSkillTree: renderSkillTree,
    openModal: openNodeModal,
    closeModal: closeNodeModal,
    switchView: switchPathwayView,
    data: PATHWAY_DATA
  };

  document.addEventListener('DOMContentLoaded', () => {
    const savedView = localStorage.getItem('vlk_benches_view') || 'tree';
    switchPathwayView(savedView);
  });
})();

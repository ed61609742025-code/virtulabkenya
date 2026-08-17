requireStudentLogin();
  updateThemeChips();

  /* ── Theme ── */
  function setTheme(theme) {
    localStorage.setItem('vlk_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeChips();
  }
  function updateThemeChips() {
    const cur = localStorage.getItem('vlk_theme') || 'dark';
    document.querySelectorAll('.theme-btn-chip').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === cur);
    });
  }
  updateThemeChips();

  /* ── Sound Toggle ── */
  function isMuted() {
    return localStorage.getItem('vlk_muted') === 'true';
  }
  function toggleSound() {
    const muted = !isMuted();
    localStorage.setItem('vlk_muted', muted ? 'true' : 'false');
    updateSoundButton();
  }
  function updateSoundButton() {
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
      const muted = isMuted();
      btn.innerHTML = muted ? '🔇 Muted' : '🔊 Sound ON';
    }
  }
  updateSoundButton();

  /* ── Notifications ── */
  const user = getUser();

  function toggleNotifDropdown(e) {
    e.stopPropagation();
    const dd = document.getElementById('notifDropdown');
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
  }
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('notifDropdown');
    const bell = document.getElementById('notifBellBtn');
    if (dd && dd.style.display === 'block' && !dd.contains(e.target) && !bell.contains(e.target)) {
      dd.style.display = 'none';
    }
  });

  function getReadNotifIds() {
    try { return JSON.parse(localStorage.getItem('vlk_read_notifs_' + (user ? user.id : 'anon')) || '[]'); }
    catch (e) { return []; }
  }
  function saveReadNotifIds(ids) {
    try { localStorage.setItem('vlk_read_notifs_' + (user ? user.id : 'anon'), JSON.stringify(ids)); }
    catch (e) {}
  }

  async function loadNotifications() {
    try {
      const data = await Assignments.getMine();
      const assignments = data.assignments || [];
      const readIds = getReadNotifIds();
      const marked = assignments.filter(a => a.submitted && a.submission_status === 'marked');
      const unread = marked.filter(a => !readIds.includes(a.id));

      const badge = document.getElementById('notifBadge');
      badge.textContent = unread.length;
      badge.style.display = unread.length > 0 ? 'inline-block' : 'none';

      const list = document.getElementById('notifList');
      if (marked.length === 0) {
        list.innerHTML = '<div style="font-size:0.8rem;color:var(--text-muted);text-align:center;padding:12px;">No notifications yet</div>';
      } else {
        list.innerHTML = marked.map(a => {
          const isRead = readIds.includes(a.id);
          return `<div style="padding:10px 12px;border-bottom:1px solid var(--card-border);background:${isRead ? 'transparent' : 'rgba(16,185,129,0.12)'};border-radius:8px;margin-bottom:6px;">
            <div style="font-size:0.82rem;font-weight:700;color:var(--heading-color);display:flex;align-items:center;justify-content:space-between;">
              <span>${isRead ? '📜' : '🟢'} ${esc(a.title)}</span>
              <span style="font-size:0.7rem;color:var(--text-muted);">${a.marked_at ? new Date(a.marked_at).toLocaleDateString() : ''}</span>
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">Assignment marked by teacher! View grade on Dashboard.</div>
          </div>`;
        }).join('');
      }
    } catch (err) { /* notifications optional */ }
  }

  function markAllNotificationsRead() {
    Assignments.getMine().then(data => {
      const ids = (data.assignments || []).filter(a => a.submitted && a.submission_status === 'marked').map(a => a.id);
      saveReadNotifIds(ids);
      loadNotifications();
    }).catch(() => {});
  }

  loadNotifications();

  /* ══════════════════════════════════════
     SALT & TEST DATA BANK
  ══════════════════════════════════════ */
  /* ══════════════════════════════════════
     SALT & TEST DATA BANK
  ══════════════════════════════════════ */
  const SALTS = {
    ammoniumChloride:  { name:'Ammonium Chloride',    formula:'NH₄Cl',        cation:'NH4+',  anion:'Cl-',    cationDisplay:'NH₄⁺', anionDisplay:'Cl⁻'    },
    copperSulfate:     { name:'Copper(II) Sulfate',   formula:'CuSO₄',        cation:'Cu2+',  anion:'SO4^2-', cationDisplay:'Cu²⁺', anionDisplay:'SO₄²⁻'  },
    ironSulfate:       { name:'Iron(II) Sulfate',     formula:'FeSO₄',        cation:'Fe2+',  anion:'SO4^2-', cationDisplay:'Fe²⁺', anionDisplay:'SO₄²⁻'  },
    sodiumCarbonate:   { name:'Sodium Carbonate',     formula:'Na₂CO₃',       cation:'Na+',   anion:'CO3^2-', cationDisplay:'Na⁺',  anionDisplay:'CO₃²⁻'  },
    calciumChloride:   { name:'Calcium Chloride',     formula:'CaCl₂',        cation:'Ca2+',  anion:'Cl-',    cationDisplay:'Ca²⁺', anionDisplay:'Cl⁻'    },
    potassiumChloride: { name:'Potassium Chloride',   formula:'KCl',          cation:'K+',    anion:'Cl-',    cationDisplay:'K⁺',   anionDisplay:'Cl⁻'    },
    leadNitrate:       { name:'Lead(II) Nitrate',     formula:'Pb(NO₃)₂',     cation:'Pb2+',  anion:'NO3-',   cationDisplay:'Pb²⁺', anionDisplay:'NO₃⁻'   },
    zincSulfate:       { name:'Zinc Sulfate',         formula:'ZnSO₄',        cation:'Zn2+',  anion:'SO4^2-', cationDisplay:'Zn²⁺', anionDisplay:'SO₄²⁻'  },
    aluminumNitrate:   { name:'Aluminum Nitrate',     formula:'Al(NO₃)₃',     cation:'Al3+',  anion:'NO3-',   cationDisplay:'Al³⁺', anionDisplay:'NO₃⁻'   },
    ironChloride:      { name:'Iron(III) Chloride',   formula:'FeCl₃',        cation:'Fe3+',  anion:'Cl-',    cationDisplay:'Fe³⁺', anionDisplay:'Cl⁻'    },
    ammoniumCarbonate: { name:'Ammonium Carbonate',   formula:'(NH₄)₂CO₃',   cation:'NH4+',  anion:'CO3^2-', cationDisplay:'NH₄⁺', anionDisplay:'CO₃²⁻'  },
    zincNitrate:       { name:'Zinc Nitrate',         formula:'Zn(NO₃)₂',     cation:'Zn2+',  anion:'NO3-',   cationDisplay:'Zn²⁺', anionDisplay:'NO₃⁻'   }
  };

  const TESTS = [
    {
      key:'naoh',
      label:'Test with 2M Sodium Hydroxide Solution (NaOH)',
      icon:'🧴',
      reagent:'2M NaOH(aq)',
      procedure:'To about 2 cm³ of the aqueous solution of the unknown salt in a clean test tube, add 2M sodium hydroxide solution dropwise (2–3 drops) until in excess (approx. 5 cm³), shaking the test tube gently after each addition. Observe whether a precipitate forms and whether it dissolves in excess.',
      options: [
        { key:'A', text:'White ppt, insoluble in excess NaOH', color:'#E2E8F0' },
        { key:'B', text:'Blue ppt, insoluble in excess', color:'#38BDF8' },
        { key:'C', text:'Green ppt, insoluble in excess', color:'#10B981' },
        { key:'D', text:'No ppt; pungent ammonia gas evolved', color:'#94A3B8', bubble:true },
        { key:'E', text:'No visible change', color:'#475569' },
        { key:'F', text:'White ppt, dissolves in excess to form a colorless solution (amphoteric)', color:'#CBD5E1' },
        { key:'G', text:'Reddish-brown ppt, insoluble in excess', color:'#B45309' }
      ],
      correct: {
        ammoniumChloride:'D', copperSulfate:'B', ironSulfate:'C', sodiumCarbonate:'E', calciumChloride:'A', potassiumChloride:'E', leadNitrate:'F',
        zincSulfate:'F', aluminumNitrate:'F', ironChloride:'G', ammoniumCarbonate:'D', zincNitrate:'F'
      }
    },
    {
      key:'nh3',
      label:'Test with 2M Aqueous Ammonia [NH₃(aq)]',
      icon:'🫧',
      reagent:'2M NH₃(aq)',
      procedure:'To about 2 cm³ of the aqueous solution of the unknown salt in a clean test tube, add 2M aqueous ammonia dropwise (2–3 drops) until in excess (approx. 5 cm³), shaking thoroughly after each addition. Observe if any precipitate dissolves to form a complex ion.',
      options: [
        { key:'A', text:'Deep blue solution (Cu-tetramine complex)', color:'#1D4ED8' },
        { key:'B', text:'Blue ppt, dissolves in excess → deep blue solution', color:'#2563EB' },
        { key:'C', text:'Green ppt, insoluble in excess', color:'#10B981' },
        { key:'D', text:'White ppt, insoluble in excess', color:'#E2E8F0' },
        { key:'E', text:'No visible change', color:'#475569' },
        { key:'F', text:'White ppt, dissolves in excess → colorless solution', color:'#CBD5E1' },
        { key:'G', text:'Reddish-brown ppt, insoluble in excess', color:'#B45309' }
      ],
      correct: {
        ammoniumChloride:'E', copperSulfate:'B', ironSulfate:'C', sodiumCarbonate:'E', calciumChloride:'E', potassiumChloride:'E', leadNitrate:'D',
        zincSulfate:'F', aluminumNitrate:'D', ironChloride:'G', ammoniumCarbonate:'E', zincNitrate:'F'
      }
    },
    {
      key:'flame',
      label:'Platinum Wire Flame Emission Test',
      icon:'🔥',
      reagent:'Pt loop + conc. HCl',
      isFlame:true,
      procedure:'Clean a platinum wire loop in concentrated hydrochloric acid and heat it in a non-luminous Bunsen flame until no colour is imparted. Dip the clean wire into the solid salt sample, introduce it into the non-luminous Bunsen flame, and observe the characteristic flame emission colour (and through cobalt blue glass).',
      options: [
        { key:'A', text:'Golden yellow flame', color:'#F59E0B' },
        { key:'B', text:'Lilac / pale violet flame', color:'#A855F7' },
        { key:'C', text:'Brick-red / crimson flame', color:'#EF4444' },
        { key:'D', text:'Blue-green (viridian) flame', color:'#10B981' },
        { key:'E', text:'No characteristic colour', color:'#64748B' },
        { key:'F', text:'Pale blue-white flame', color:'#BFDBFE' }
      ],
      correct: {
        ammoniumChloride:'E', copperSulfate:'D', ironSulfate:'E', sodiumCarbonate:'A', calciumChloride:'C', potassiumChloride:'B', leadNitrate:'F',
        zincSulfate:'E', aluminumNitrate:'E', ironChloride:'E', ammoniumCarbonate:'E', zincNitrate:'E'
      }
    },
    {
      key:'hcl',
      label:'Test with Dilute Hydrochloric Acid [2M HCl(aq)]',
      icon:'⚗️',
      reagent:'2M HCl(aq)',
      procedure:'To about 2 cm³ of the aqueous solution of the unknown salt in a clean test tube, add 3–4 drops of 2M hydrochloric acid. Warm gently if necessary and test any evolved gas with calcium hydroxide solution (limewater) or moist litmus papers.',
      options: [
        { key:'A', text:'Brisk effervescence; gas turns limewater milky (CO₂)', color:'#CBD5E1', bubble:true },
        { key:'B', text:'No visible reaction', color:'#334155' },
        { key:'C', text:'White ppt of PbCl₂ (soluble in hot water)', color:'#E2E8F0' },
        { key:'D', text:'Pungent gas (NH₃) evolved', color:'#94A3B8', bubble:true }
      ],
      correct: {
        ammoniumChloride:'B', copperSulfate:'B', ironSulfate:'B', sodiumCarbonate:'A', calciumChloride:'B', potassiumChloride:'B', leadNitrate:'C',
        zincSulfate:'B', aluminumNitrate:'B', ironChloride:'B', ammoniumCarbonate:'A', zincNitrate:'B'
      }
    },
    {
      key:'agno3',
      label:'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]',
      icon:'🔬',
      reagent:'Dil. HNO₃ + AgNO₃(aq)',
      procedure:'To about 2 cm³ of the aqueous solution of the unknown salt in a clean test tube, add 3–4 drops of dilute nitric(V) acid, followed by 3–4 drops of silver nitrate solution. If a precipitate forms, test its solubility with dilute aqueous ammonia.',
      options: [
        { key:'A', text:'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻', color:'#F8FAFC' },
        { key:'B', text:'Cream ppt (AgBr), partly soluble in conc. NH₃', color:'#FEF08A' },
        { key:'C', text:'Yellow ppt (AgI), insoluble in NH₃', color:'#F59E0B' },
        { key:'D', text:'No precipitate formed', color:'#334155' }
      ],
      correct: {
        ammoniumChloride:'A', copperSulfate:'D', ironSulfate:'D', sodiumCarbonate:'D', calciumChloride:'A', potassiumChloride:'A', leadNitrate:'D',
        zincSulfate:'D', aluminumNitrate:'D', ironChloride:'A', ammoniumCarbonate:'D', zincNitrate:'D'
      }
    },
    {
      key:'bacl2',
      label:'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]',
      icon:'🧫',
      reagent:'Dil. HCl + BaCl₂(aq)',
      procedure:'To about 2 cm³ of the aqueous solution of the unknown salt in a clean test tube, add 3–4 drops of dilute hydrochloric acid, followed by 3–4 drops of barium chloride solution. Observe whether a dense, acid-insoluble white precipitate forms.',
      options: [
        { key:'A', text:'White ppt (BaSO₄), insoluble in dil. HCl → SO₄²⁻', color:'#F8FAFC' },
        { key:'B', text:'No precipitate formed', color:'#334155' },
        { key:'C', text:'White ppt, dissolves in dil. HCl', color:'#E2E8F0' },
        { key:'D', text:'White ppt, insoluble; effervescence with HCl', color:'#CBD5E1', bubble:true }
      ],
      correct: {
        ammoniumChloride:'B', copperSulfate:'A', ironSulfate:'A', sodiumCarbonate:'B', calciumChloride:'B', potassiumChloride:'B', leadNitrate:'B',
        zincSulfate:'A', aluminumNitrate:'B', ironChloride:'B', ammoniumCarbonate:'B', zincNitrate:'B'
      }
    },
    {
      key:'ki',
      label:'Test with Potassium Iodide Solution [1M KI(aq)]',
      icon:'🟡',
      reagent:'1M KI(aq)',
      procedure:'To about 2 cm³ of the aqueous solution of the unknown salt in a clean test tube, add 3–4 drops of 1M potassium iodide solution. Heat the mixture gently in a water bath, then allow it to cool under tap water to observe golden spangles.',
      options: [
        { key:'A', text:'Bright canary-yellow ppt (PbI₂), dissolves on heating to golden sparkles → Pb²⁺', color:'#EAB308' },
        { key:'B', text:'No precipitate formed', color:'#334155' },
        { key:'C', text:'White precipitate formed', color:'#E2E8F0' }
      ],
      correct: {
        ammoniumChloride:'B', copperSulfate:'B', ironSulfate:'B', sodiumCarbonate:'B', calciumChloride:'B', potassiumChloride:'B', leadNitrate:'A',
        zincSulfate:'B', aluminumNitrate:'B', ironChloride:'B', ammoniumCarbonate:'B', zincNitrate:'B'
      }
    },
    {
      key:'brown_ring',
      label:'Brown Ring Test for Nitrates [NO₃⁻]',
      icon:'🟤',
      reagent:'FeSO₄(aq) + conc. H₂SO₄',
      isBrownRing:true,
      procedure:'To about 2 cm³ of the aqueous solution of the unknown salt in a clean test tube, add 2 cm³ of freshly prepared iron(II) sulfate solution. Slant the test tube at 45°, and carefully trickle concentrated sulfuric(VI) acid down the inside wall of the tube without shaking.',
      options: [
        { key:'A', text:'Distinct brown ring formed at the liquid-liquid interface → NO₃⁻', color:'#78350F' },
        { key:'B', text:'No brown ring or color change at interface', color:'#334155' }
      ],
      correct: {
        ammoniumChloride:'B', copperSulfate:'B', ironSulfate:'B', sodiumCarbonate:'B', calciumChloride:'B', potassiumChloride:'B', leadNitrate:'A',
        zincSulfate:'B', aluminumNitrate:'A', ironChloride:'B', ammoniumCarbonate:'B', zincNitrate:'A'
      }
    }
  ];

  /* ══════════════════════════════════════
     STATE
  ══════════════════════════════════════ */
  let currentSaltKey = '';
  let sampleCounter = 0;
  const testStates = {};
  let sessionSaved = false;
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignment');

  /* ══════════════════════════════════════
     INIT
  ══════════════════════════════════════ */
  function newSample() {
    const keys = Object.keys(SALTS);
    currentSaltKey = keys[Math.floor(Math.random() * keys.length)];
    sampleCounter++;
    Object.keys(testStates).forEach(k => delete testStates[k]);
    sessionSaved = false;

    const saltBadge = document.getElementById('saltBadge');
    if (saltBadge) saltBadge.textContent = `Sample ${sampleCounter}`;
    const cationSelect = document.getElementById('cationSelect');
    if (cationSelect) cationSelect.value = '';
    const anionSelect = document.getElementById('anionSelect');
    if (anionSelect) anionSelect.value = '';
    const submitBtn = document.getElementById('submitIdBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Submit Identification';
    }
    const idResultBox = document.getElementById('idResultBox');
    if (idResultBox) idResultBox.style.display = 'none';

    renderAll();
  }

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  function renderAll() {
    renderGrid();
    updateProgress();
  }

  function updateProgress() {
    const totalTests = TESTS.length;
    const performedCount = Object.keys(testStates).filter(k => testStates[k].performed).length;
    const filledCount = Object.keys(testStates).filter(k => (testStates[k].obsText || '').trim() && (testStates[k].infText || '').trim()).length;
    const pct = Math.round((performedCount / totalTests) * 100);

    const fill = document.getElementById('qualProgressFill');
    const txt = document.getElementById('qualProgressCount');
    if (fill) fill.style.width = `${pct}%`;
    if (txt) txt.textContent = `${performedCount} / ${totalTests} Tests Performed (${filledCount} Recorded)`;
  }

  function getObsSuggestionChips(testKey) {
    const suggestions = {
      flame: ['Golden yellow flame', 'Lilac / pale violet flame', 'Brick-red flame', 'Blue-green flame', 'No characteristic flame color'],
      naoh: ['White ppt, soluble in excess NaOH to form a colorless solution', 'White ppt, insoluble in excess NaOH', 'Blue ppt, insoluble in excess NaOH', 'Green ppt, insoluble in excess NaOH', 'Reddish-brown ppt, insoluble in excess', 'No ppt; pungent ammonia gas evolved'],
      nh3: ['Deep blue solution formed in excess NH₃', 'Blue ppt, soluble in excess NH₃ to form deep blue solution', 'White ppt, soluble in excess NH₃', 'White ppt, insoluble in excess NH₃', 'Green ppt, insoluble in excess NH₃', 'Reddish-brown ppt, insoluble in excess'],
      hcl: ['Effervescence of a colorless gas turning limewater milky (CO₂)', 'No effervescence or visible change', 'White ppt formed'],
      agno3: ['White ppt (AgCl), insoluble in dilute HNO₃', 'No precipitate formed'],
      bacl2: ['White ppt (BaSO₄), insoluble in dilute HCl', 'White ppt, soluble in dilute HCl with effervescence', 'No precipitate formed'],
      ki: ['Bright canary-yellow ppt formed (PbI₂)', 'Yellow ppt dissolves on heating to form golden sparkles', 'No precipitate formed'],
      brown_ring: ['Brown ring formed at liquid-liquid junction', 'No brown ring formed at junction']
    };
    const chips = suggestions[testKey] || [];
    return chips.map(c => `
      <button type="button" class="suggestion-chip" onclick="insertSuggestion('obs_${testKey}', '${c.replace(/'/g, "\\'")}')">+ ${c}</button>
    `).join('');
  }

  function getInfSuggestionChips(testKey) {
    const suggestions = {
      flame: ['Na⁺ present', 'K⁺ present', 'Ca²⁺ present', 'Cu²⁺ present', 'Na⁺, K⁺ absent'],
      naoh: ['Zn²⁺, Al³⁺, Pb²⁺ present', 'Ca²⁺, Mg²⁺ present', 'Cu²⁺ present', 'Fe²⁺ present', 'Fe³⁺ present', 'NH₄⁺ present'],
      nh3: ['Cu²⁺ present', 'Zn²⁺ present', 'Pb²⁺, Al³⁺ present', 'Fe²⁺ present', 'Fe³⁺ present'],
      hcl: ['CO₃²⁻ present', 'CO₃²⁻ absent'],
      agno3: ['Cl⁻ present', 'Cl⁻ absent'],
      bacl2: ['SO₄²⁻ present', 'CO₃²⁻ present', 'SO₄²⁻ absent'],
      ki: ['Pb²⁺ present', 'Pb²⁺ absent'],
      brown_ring: ['NO₃⁻ present', 'NO₃⁻ absent']
    };
    const chips = suggestions[testKey] || [];
    return chips.map(c => `
      <button type="button" class="suggestion-chip" onclick="insertSuggestion('inf_${testKey}', '${c.replace(/'/g, "\\'")}')">+ ${c}</button>
    `).join('');
  }

  window.insertSuggestion = function(elemId, text) {
    const elem = document.getElementById(elemId);
    if (elem) {
      elem.value = text;
      const parts = elemId.split('_');
      const testKey = parts[1];
      saveTextState(testKey);
    }
  };

  function saveTextState(testKey) {
    const obsElem = document.getElementById(`obs_${testKey}`);
    const infElem = document.getElementById(`inf_${testKey}`);
    if (!testStates[testKey]) testStates[testKey] = { performed: true };
    if (obsElem) testStates[testKey].obsText = obsElem.value;
    if (infElem) testStates[testKey].infText = infElem.value;
    updateProgress();
  }

  function renderGrid() {
    const grid = document.getElementById('testGrid');
    grid.innerHTML = TESTS.map((test, idx) => {
      const st = testStates[test.key] || { performed: false, stage: 'idle' };
      const testLetter = String.fromCharCode(97 + idx); // a, b, c, d, e, f, g, h
      const isMultiStage = test.key === 'naoh' || test.key === 'nh3' || test.key === 'ki';

      let actionButtonsHtml = '';
      if (test.key === 'naoh' || test.key === 'nh3') {
        if (!st.performed || st.stage === 'idle') {
          actionButtonsHtml = `
            <button class="btn-perform-test" onclick="performTestStage('${test.key}', 'few_drops')">
              💧 Step 1: Add Few Drops (2–3 drops)
            </button>`;
        } else if (st.stage === 'few_drops') {
          actionButtonsHtml = `
            <button class="btn-perform-test btn-step-excess" onclick="performTestStage('${test.key}', 'excess')">
              🧪 Step 2: Add in Excess (~5 cm³)
            </button>
            <button class="btn-redo-test" onclick="redoTest('${test.key}')" title="Wash test tube and redo test">
              <span class="redo-icon">↺</span> Redo Test
            </button>`;
        } else {
          actionButtonsHtml = `
            <button class="btn-perform-test done" disabled>
              ✅ Test Completed
            </button>
            <button class="btn-redo-test" onclick="redoTest('${test.key}')" title="Wash test tube and redo test">
              <span class="redo-icon">↺</span> Redo Test
            </button>`;
        }
      } else if (test.key === 'ki') {
        if (!st.performed || st.stage === 'idle') {
          actionButtonsHtml = `
            <button class="btn-perform-test" onclick="performTestStage('ki', 'few_drops')">
              💧 Step 1: Add KI Solution
            </button>`;
        } else if (st.stage === 'few_drops') {
          actionButtonsHtml = `
            <button class="btn-perform-test btn-step-heat" onclick="performTestStage('ki', 'heated')">
              🔥 Step 2: Warm Gently in Water Bath
            </button>
            <button class="btn-redo-test" onclick="redoTest('ki')" title="Wash tube and redo test">
              <span class="redo-icon">↺</span> Redo Test
            </button>`;
        } else if (st.stage === 'heated') {
          actionButtonsHtml = `
            <button class="btn-perform-test btn-step-cool" onclick="performTestStage('ki', 'cooled')">
              ❄️ Step 3: Cool under Tap Water
            </button>
            <button class="btn-redo-test" onclick="redoTest('ki')" title="Wash tube and redo test">
              <span class="redo-icon">↺</span> Redo Test
            </button>`;
        } else {
          actionButtonsHtml = `
            <button class="btn-perform-test done" disabled>
              ✅ Test Completed
            </button>
            <button class="btn-redo-test" onclick="redoTest('ki')" title="Wash tube and redo test">
              <span class="redo-icon">↺</span> Redo Test
            </button>`;
        }
      } else if (test.key === 'flame') {
        if (!st.performed) {
          actionButtonsHtml = `
            <button class="btn-perform-test flame-btn" onclick="performTest('flame')">
              🔥 Perform Flame Test
            </button>`;
        } else {
          actionButtonsHtml = `
            <button class="btn-perform-test flame-btn done" onclick="performTest('flame')">
              🔥 Re-open Flame Test
            </button>
            <button class="btn-redo-test" onclick="redoTest('flame')" title="Clean wire loop and redo test">
              <span class="redo-icon">↺</span> Redo Test
            </button>`;
        }
      } else {
        if (!st.performed) {
          actionButtonsHtml = `
            <button class="btn-perform-test" onclick="performTest('${test.key}')">
              ▶ Add Reagent & Perform Test
            </button>`;
        } else {
          actionButtonsHtml = `
            <button class="btn-perform-test done" disabled>
              ✅ Reagent Added — Result Observed
            </button>
            <button class="btn-redo-test" onclick="redoTest('${test.key}')" title="Wash tube and redo test">
              <span class="redo-icon">↺</span> Redo Test
            </button>`;
        }
      }

      return `
        <div class="kcse-question-block" style="display: grid; grid-template-columns: 140px 1fr; gap: 20px; margin-bottom: 28px; border-bottom: 1px dashed var(--card-border); padding-bottom: 24px; align-items: start;">
          <!-- Left Column: Tube / Flame Visualizer -->
          <div style="background: var(--bg-dark); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 185px; position: relative;">
            ${test.key === 'flame' ? getFlameVisual(st) : getTubeVisual(test, st)}
            <div id="status_${test.key}" style="font-size: 0.7rem; font-weight: 800; color: ${st.performed ? 'var(--green-accent)' : 'var(--text-muted)'}; margin-top: 6px; text-align: center; max-width: 130px; line-height: 1.2;">
              ${!st.performed ? 'Awaiting Test' : (st.statusLabel || 'Test Performed')}
            </div>
          </div>

          <!-- Right Column: Procedure & 2-Column KCSE Table -->
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="font-family:var(--font-heading); font-size:1.05rem; font-weight:800; color:var(--heading-color);">
                (${testLetter}) ${test.label}
              </div>
              <span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--purple-accent); background:var(--blue-bg); padding:2px 8px; border-radius:100px;">1.4 Marks</span>
            </div>

            <!-- Official KCSE Procedure / Question Callout Box -->
            <div style="font-size:0.84rem; color:var(--text-main); line-height:1.55; margin-bottom:12px; background:var(--bg-dark); padding:10px 14px; border-radius:8px; border-left:3.5px solid var(--violet-accent); border:1px solid var(--card-border);">
              <span style="font-weight:800; color:var(--heading-color); display:flex; align-items:center; gap:6px; margin-bottom:3px;">
                📋 Procedure / Instructions:
              </span>
              <span>${test.procedure}</span>
            </div>

            <!-- Action Buttons with Multi-Step Transition & Redo -->
            <div class="action-buttons-row">
              ${actionButtonsHtml}
            </div>

            <!-- KCSE Observation & Inference Table -->
            <table class="kcse-table" style="width:100%; border-collapse:collapse; font-size:0.84rem;">
              <thead>
                <tr>
                  <th style="width:50%; background:var(--card-bg-hover); padding:10px 14px; font-family:var(--font-heading); font-weight:800; border-bottom:1.5px solid var(--card-border);">
                    <span class="sci-tooltip">Observations <span class="sci-tip-text">Observations: Record sharp visual changes — color, effervescence, precipitate formation, or dissolving in excess.</span></span> (0.7 Mark)
                  </th>
                  <th style="width:50%; background:var(--card-bg-hover); padding:10px 14px; font-family:var(--font-heading); font-weight:800; border-bottom:1.5px solid var(--card-border);">
                    <span class="sci-tooltip">Inferences <span class="sci-tip-text">Inferences: Deduce present/absent ions (e.g. Cu²⁺, Fe²⁺, Fe³⁺, Al³⁺, Zn²⁺, Pb²⁺, SO₄²⁻, CO₃²⁻, Cl⁻, NO₃⁻).</span></span> (0.7 Mark)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:10px; border-bottom:1px solid var(--card-border); vertical-align:top;">
                    <textarea class="kcse-input" id="obs_${test.key}" placeholder="Write exact observations (e.g. White ppt soluble in excess NaOH)..." oninput="saveTextState('${test.key}')">${st.obsText || ''}</textarea>
                    
                    <!-- Suggestion Chips -->
                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
                      ${getObsSuggestionChips(test.key)}
                    </div>
                  </td>

                  <td style="padding:10px; border-bottom:1px solid var(--card-border); vertical-align:top;">
                    <textarea class="kcse-input" id="inf_${test.key}" placeholder="Write deductions (e.g. Zn²⁺, Al³⁺, Pb²⁺ present)..." oninput="saveTextState('${test.key}')">${st.infText || ''}</textarea>
                    
                    <!-- Suggestion Chips -->
                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
                      ${getInfSuggestionChips(test.key)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>`;
    }).join('');
  }

  /* ══════════════════════════════════════
     SVG VISUALS (Dropper Test Tube & Flame Loop)
  ══════════════════════════════════════ */
  function getTubeVisual(test, st) {
    const performed = st && st.performed;
    const stage = st ? (st.stage || 'idle') : 'idle';
    const isExcess = stage === 'excess';
    const isFewDrops = stage === 'few_drops';
    const isHeated = stage === 'heated';
    const isCooled = stage === 'cooled';
    
    // Liquid level: low (y=80) for few drops, higher (y=54) for excess or standard tests
    const liquidTopY = isFewDrops ? 80 : 54;
    const liquid = performed ? (st.color || 'rgba(56, 189, 248, 0.4)') : 'transparent';
    const bubbles = performed && st.bubbling;
    const isBrownRing = test.isBrownRing;
    const isKI = test.key === 'ki';
    const salt = SALTS[currentSaltKey] || {};
    const testKey = test.key;

    // Special Case 1: Brown Ring Test (NO3- with FeSO4 + conc H2SO4)
    if (performed && isBrownRing) {
      const hasBrownRing = salt.anion === 'NO3-';
      return `<svg width="86" height="136" viewBox="0 0 86 136">
        <defs>
          <linearGradient id="h2so4Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(241, 245, 249, 0.85)"/>
            <stop offset="100%" stop-color="rgba(203, 213, 225, 0.95)"/>
          </linearGradient>
          <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#451A03" stop-opacity="1"/>
            <stop offset="70%" stop-color="#78350F" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#92400E" stop-opacity="0.2"/>
          </radialGradient>
        </defs>
        
        <!-- Wooden Test Tube Clamp -->
        <g transform="translate(0, 48)">
          <rect x="2" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <rect x="60" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="7" r="2.5" fill="#64748B"/>
          <circle cx="72" cy="7" r="2.5" fill="#64748B"/>
        </g>

        <!-- Glass Test Tube Body & Lip -->
        <rect x="23" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M 26,36 L 26,112 Q 26,130 43,130 Q 60,130 60,112 L 60,36 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>

        <!-- Lower Dense Layer (Conc. H2SO4) -->
        <path d="M 27,94 L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,94 Z" fill="url(#h2so4Grad)"/>
        <ellipse cx="43" cy="94" rx="16" ry="3.5" fill="rgba(203, 213, 225, 0.95)"/>

        <!-- Upper Layer (Fresh FeSO4 Solution - pale green) -->
        <path d="M 27,66 L 27,94 L 59,94 L 59,66 Z" fill="rgba(16, 185, 129, 0.22)"/>
        <ellipse cx="43" cy="66" rx="16" ry="3.5" fill="rgba(16, 185, 129, 0.35)"/>

        <!-- Brown Ring [Fe(H2O)5(NO)]2+ Interface -->
        ${hasBrownRing ? `
          <g class="anim-brown-ring">
            <ellipse cx="43" cy="94" rx="15.8" ry="4.5" fill="url(#ringGlow)" stroke="#B45309" stroke-width="1.5"/>
            <ellipse cx="43" cy="94" rx="12" ry="2.5" fill="#290E02"/>
          </g>
        ` : ''}

        <!-- Glass Reflection Specular Highlight -->
        <path d="M 29,38 L 29,112 Q 29,126 43,126" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
      </svg>`;
    }

    // Special Case 2: Potassium Iodide Test for Lead (Pb2+ + 2I- -> PbI2 Yellow Precipitate with Heat/Spangles)
    if (performed && isKI) {
      const isLead = salt.cation === 'Pb2+';
      return `<svg width="86" height="136" viewBox="0 0 86 136">
        <!-- Wooden Test Tube Clamp -->
        <g transform="translate(0, 48)">
          <rect x="2" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <rect x="60" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
          <circle cx="14" cy="7" r="2.5" fill="#64748B"/>
          <circle cx="72" cy="7" r="2.5" fill="#64748B"/>
        </g>

        <!-- Glass Body & Lip -->
        <rect x="23" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M 26,36 L 26,112 Q 26,130 43,130 Q 60,130 60,112 L 60,36 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>

        <!-- Liquid Phase -->
        <path class="${isExcess ? 'anim-liquid-rise' : ''}" d="M 27,${liquidTopY} L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,${liquidTopY} Z" fill="${isLead ? (isHeated ? 'rgba(250, 204, 21, 0.45)' : 'rgba(234, 179, 8, 0.35)') : 'rgba(56, 189, 248, 0.18)'}"/>
        <ellipse cx="43" cy="${liquidTopY}" rx="16" ry="3.5" fill="${isLead ? 'rgba(250, 204, 21, 0.65)' : 'rgba(56, 189, 248, 0.3)'}"/>

        <!-- Heat Waves when warmed -->
        ${isLead && isHeated ? `
          <g class="anim-heat-wave">
            <path d="M 36,46 Q 40,40 44,46" stroke="rgba(245, 158, 11, 0.7)" stroke-width="1.5" fill="none"/>
            <path d="M 44,42 Q 48,36 52,42" stroke="rgba(245, 158, 11, 0.6)" stroke-width="1.5" fill="none"/>
          </g>
        ` : ''}

        <!-- PbI2 Golden Precipitate and Shimmering Spangles -->
        ${isLead && (isFewDrops || isCooled) ? `
          <ellipse cx="43" cy="120" rx="14" ry="7" fill="#EAB308" opacity="0.9" class="anim-ppt-form"/>
          <circle cx="34" cy="116" r="3" fill="#FACC15"/>
          <circle cx="48" cy="118" r="3.2" fill="#CA8A04"/>
          <circle cx="42" cy="112" r="2.5" fill="#FEF08A"/>
          <circle cx="38" cy="122" r="2.8" fill="#FACC15"/>
        ` : ''}

        <!-- Sparkling Golden Spangles (Crystalline Flakes upon cooling) -->
        ${isLead && isCooled ? `
          <g class="anim-spangle" style="animation-delay: 0s;">
            <polygon points="43,84 45,88 49,89 45,90 43,94 41,90 37,89 41,88" fill="#FEF08A"/>
          </g>
          <g class="anim-spangle" style="animation-delay: 0.4s;">
            <polygon points="34,74 35.5,77 39,78 35.5,79 34,82 32.5,79 29,78 32.5,77" fill="#FDE047"/>
          </g>
          <g class="anim-spangle" style="animation-delay: 0.8s;">
            <polygon points="52,98 53.5,101 57,102 53.5,103 52,106 50.5,103 47,102 50.5,101" fill="#FEF08A"/>
          </g>
        ` : ''}

        <!-- Glass Reflection Specular Highlight -->
        <path d="M 29,38 L 29,112 Q 29,126 43,126" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
      </svg>`;
    }

    // Standard Qualitative Reagent Test Tube (NaOH, NH3, HCl, AgNO3, BaCl2)
    const isPpt = performed && st.ppt;
    const isPptDissolved = performed && st.pptDissolved;
    const isDeepBlue = performed && st.complexDeepBlue;

    return `<svg width="86" height="136" viewBox="0 0 86 136">
      <defs>
        <radialGradient id="liquidGlow_${testKey}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${isDeepBlue ? '#1D4ED8' : liquid}" stop-opacity="${isDeepBlue ? '1' : '0.9'}"/>
          <stop offset="100%" stop-color="${isDeepBlue ? '#1E40AF' : liquid}" stop-opacity="${isDeepBlue ? '0.9' : '0.7'}"/>
        </radialGradient>
      </defs>

      <!-- Precision Reagent Dropper Pipette (Top Right) -->
      <g class="${performed ? 'anim-dropper' : ''}" opacity="${performed ? '1' : '0.45'}" transform="translate(18, 0)">
        <path d="M 38,4 L 46,4 L 44,14 L 40,14 Z" fill="#EF4444" rx="2"/>
        <rect x="40.5" y="14" width="3" height="16" fill="rgba(255,255,255,0.7)" stroke="#94A3B8" stroke-width="0.8"/>
        <path d="M 40.5,30 L 43.5,30 L 42,38 Z" fill="rgba(255,255,255,0.7)" stroke="#94A3B8" stroke-width="0.8"/>
        ${performed ? `
          <circle cx="42" cy="46" r="2.6" fill="${st.color || '#38BDF8'}" opacity="0.9"/>
        ` : ''}
      </g>

      <!-- Wooden Test Tube Clamp -->
      <g transform="translate(0, 48)">
        <rect x="2" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
        <rect x="60" y="3" width="24" height="8" rx="2" fill="#78350F" stroke="#451A03" stroke-width="0.8"/>
        <circle cx="14" cy="7" r="2.5" fill="#64748B"/>
        <circle cx="72" cy="7" r="2.5" fill="#64748B"/>
      </g>

      <!-- Glass Test Tube Body & Lip -->
      <rect x="23" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,0.18)" stroke="#94A3B8" stroke-width="1.2"/>
      <path d="M 26,36 L 26,112 Q 26,130 43,130 Q 60,130 60,112 L 60,36 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.5"/>

      <!-- Liquid Column with Volume Rise -->
      ${performed ? `
        <path class="${isExcess ? 'anim-liquid-rise' : ''}" d="M 27,${liquidTopY} L 27,112 Q 27,128 43,128 Q 59,128 59,112 L 59,${liquidTopY} Z" fill="url(#liquidGlow_${testKey})" opacity="0.9"/>
        <ellipse cx="43" cy="${liquidTopY}" rx="16" ry="3.5" fill="${isDeepBlue ? '#1E40AF' : liquid}" opacity="0.95"/>
      ` : ''}

      <!-- Precipitate Curd Mass at Base -->
      ${performed && isPpt && !bubbles ? `
        <g class="anim-ppt-form">
          <ellipse cx="43" cy="120" rx="14.5" ry="7" fill="${liquid}" opacity="0.95" filter="brightness(0.9)"/>
          <circle cx="34" cy="116" r="2.8" fill="${liquid}" filter="brightness(1.15)"/>
          <circle cx="48" cy="118" r="3.2" fill="${liquid}" filter="brightness(0.85)"/>
          <circle cx="41" cy="113" r="2.5" fill="${liquid}" filter="brightness(1.1)"/>
          <circle cx="38" cy="122" r="2.8" fill="${liquid}" filter="brightness(0.9)"/>
          <circle cx="46" cy="122" r="2.6" fill="${liquid}" filter="brightness(1.05)"/>
        </g>
      ` : ''}

      <!-- Dissolving Precipitate (Transition Effect in Excess) -->
      ${performed && isPptDissolved ? `
        <g class="anim-ppt-dissolve">
          <ellipse cx="43" cy="120" rx="12" ry="5" fill="#E2E8F0" opacity="0.4"/>
          <circle cx="38" cy="118" r="2" fill="#E2E8F0" opacity="0.4"/>
          <circle cx="46" cy="119" r="2" fill="#E2E8F0" opacity="0.4"/>
        </g>
      ` : ''}

      <!-- Bubbles & Froth Header for Acid Effervescence -->
      ${bubbles ? `
        <g class="anim-qual-froth">
          <ellipse cx="43" cy="${liquidTopY}" rx="15" ry="3.5" fill="#FFF" opacity="0.8"/>
        </g>
        <circle cx="36" cy="112" r="2.4" fill="#FFF" opacity="0.8" class="bubble anim-qual-bubble"/>
        <circle cx="46" cy="104" r="2.8" fill="#FFF" opacity="0.9" class="bubble anim-qual-bubble" style="animation-delay: 0.25s;"/>
        <circle cx="40" cy="94" r="2.2" fill="#FFF" opacity="0.75" class="bubble anim-qual-bubble" style="animation-delay: 0.5s;"/>
        <circle cx="48" cy="84" r="2.6" fill="#FFF" opacity="0.85" class="bubble anim-qual-bubble" style="animation-delay: 0.75s;"/>
        <circle cx="34" cy="74" r="2.4" fill="#FFF" opacity="0.8" class="bubble anim-qual-bubble" style="animation-delay: 0.35s;"/>
      ` : ''}

      <!-- Glass Specular Highlight Curve -->
      <path d="M 29,38 L 29,112 Q 29,126 43,126" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
    </svg>`;
  }

  function getFlameVisual(st) {
    const performed = st && st.performed;
    const salt = SALTS[currentSaltKey] || {};
    const flameColors = {
      'Na+': '#F59E0B',
      'K+': '#A855F7',
      'Ca2+': '#EF4444',
      'Cu2+': '#10B981',
      'Ba2+': '#84CC16',
      'Pb2+': '#93C5FD'
    };
    const fc = performed ? (flameColors[salt.cation] || 'rgba(56, 189, 248, 0.85)') : '#475569';
    const lit = performed;

    return `<svg width="100" height="136" viewBox="0 0 100 136">
      <defs>
        <radialGradient id="fg_${currentSaltKey}" cx="50%" cy="65%" r="60%">
          <stop offset="0%" stop-color="${fc}" stop-opacity="${lit ? '0.9' : '0'}"/>
          <stop offset="60%" stop-color="${fc}" stop-opacity="${lit ? '0.45' : '0'}"/>
          <stop offset="100%" stop-color="${fc}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="metalGradQual" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="50%" stop-color="#64748B"/>
          <stop offset="100%" stop-color="#1E293B"/>
        </linearGradient>
      </defs>

      <!-- Bunsen Burner Apparatus -->
      <!-- Heavy Cast Iron Base -->
      <path d="M 28,132 L 72,132 L 66,118 L 34,118 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1"/>
      <rect x="34" y="115" width="32" height="4" rx="1" fill="#475569"/>

      <!-- Metallic Barrel -->
      <rect x="44" y="68" width="12" height="48" fill="url(#metalGradQual)"/>
      
      <!-- Air Intake Collar -->
      <rect x="42" y="98" width="16" height="10" rx="1" fill="#64748B" stroke="#334155" stroke-width="0.8"/>
      <circle cx="50" cy="103" r="2.5" fill="#0F172A"/>

      <!-- Burner Orifice Tip -->
      <ellipse cx="50" cy="68" rx="6" ry="2" fill="#0F172A"/>
      
      <!-- Flame Radial Glow -->
      <circle cx="50" cy="42" r="42" fill="url(#fg_${currentSaltKey})"/>
      
      <!-- Bunsen Outer Emission Flame -->
      <path class="${lit ? 'anim-flame-ion' : ''}" d="M 50,10 C 26,34 32,68 50,68 C 68,68 74,34 50,10 Z" fill="${fc}" opacity="${lit ? '0.92' : '0.12'}"/>
      
      <!-- Flame Inner Core Cone -->
      <path class="${lit ? 'anim-flame-inner' : ''}" d="M 50,34 C 40,46 43,68 50,68 C 57,68 60,46 50,34 Z" fill="#E0F2FE" opacity="${lit ? '0.95' : '0.05'}"/>

      <!-- Platinum Wire Loop with Incandescent Sample -->
      ${performed ? `
        <g transform="translate(18, 42)">
          <rect x="-16" y="14" width="16" height="3" rx="1" fill="#78350F"/>
          <path d="M 0,15.5 L 30,15.5" stroke="#CBD5E1" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="31" cy="15.5" r="3.2" fill="none" stroke="#E2E8F0" stroke-width="1.6"/>
          <circle cx="31" cy="15.5" r="2.2" fill="${fc}" class="anim-spangle"/>
        </g>
      ` : ''}
    </svg>`;
  }

  /* ══════════════════════════════════════
     ACTIONS (Stepwise Perform & Redo)
  ══════════════════════════════════════ */
  window.redoTest = function(testKey) {
    if (testStates[testKey]) {
      const prevObs = testStates[testKey].obsText || '';
      const prevInf = testStates[testKey].infText || '';
      delete testStates[testKey];
      testStates[testKey] = {
        performed: false,
        stage: 'idle',
        obsText: prevObs,
        infText: prevInf
      };
    }
    renderAll();
  };

  window.performTestStage = function(testKey, targetStage) {
    const salt = SALTS[currentSaltKey] || {};
    const test = TESTS.find(t => t.key === testKey);
    if (!testStates[testKey]) testStates[testKey] = {};
    const st = testStates[testKey];

    st.performed = true;
    st.stage = targetStage;

    if (testKey === 'naoh') {
      playDropSplashSound();
      if (targetStage === 'few_drops') {
        if (['Zn2+', 'Al3+', 'Pb2+', 'Ca2+'].includes(salt.cation)) {
          st.ppt = true;
          st.pptDissolved = false;
          st.color = '#F1F5F9';
          st.statusLabel = 'Few Drops: White ppt formed';
        } else if (salt.cation === 'Cu2+') {
          st.ppt = true;
          st.pptDissolved = false;
          st.color = '#38BDF8';
          st.statusLabel = 'Few Drops: Pale blue ppt formed';
        } else if (salt.cation === 'Fe2+') {
          st.ppt = true;
          st.pptDissolved = false;
          st.color = '#10B981';
          st.statusLabel = 'Few Drops: Dirty green ppt formed';
        } else if (salt.cation === 'Fe3+') {
          st.ppt = true;
          st.pptDissolved = false;
          st.color = '#B45309';
          st.statusLabel = 'Few Drops: Reddish-brown ppt';
        } else if (salt.cation === 'NH4+') {
          st.ppt = false;
          st.color = '#475569';
          st.statusLabel = 'Few Drops: No precipitate';
        } else {
          st.ppt = false;
          st.color = '#475569';
          st.statusLabel = 'Few Drops: No precipitate';
        }
      } else if (targetStage === 'excess') {
        if (['Zn2+', 'Al3+', 'Pb2+'].includes(salt.cation)) {
          st.ppt = false;
          st.pptDissolved = true; // Soluble in excess NaOH!
          st.color = 'rgba(56, 189, 248, 0.18)';
          st.statusLabel = 'In Excess: White ppt dissolves (Colorless solution)';
        } else if (salt.cation === 'Ca2+') {
          st.ppt = true;
          st.pptDissolved = false;
          st.color = '#F1F5F9';
          st.statusLabel = 'In Excess: White ppt remains insoluble';
        } else if (salt.cation === 'Cu2+') {
          st.ppt = true;
          st.color = '#38BDF8';
          st.statusLabel = 'In Excess: Pale blue ppt insoluble';
        } else if (salt.cation === 'Fe2+') {
          st.ppt = true;
          st.color = '#10B981';
          st.statusLabel = 'In Excess: Dirty green ppt insoluble';
        } else if (salt.cation === 'Fe3+') {
          st.ppt = true;
          st.color = '#B45309';
          st.statusLabel = 'In Excess: Reddish-brown ppt insoluble';
        } else if (salt.cation === 'NH4+') {
          st.ppt = false;
          st.bubbling = true;
          st.color = '#94A3B8';
          st.statusLabel = 'In Excess: Pungent NH₃ gas evolved';
        } else {
          st.ppt = false;
          st.color = '#475569';
          st.statusLabel = 'In Excess: No precipitate';
        }
      }
    } else if (testKey === 'nh3') {
      playDropSplashSound();
      if (targetStage === 'few_drops') {
        if (salt.cation === 'Cu2+') {
          st.ppt = true;
          st.complexDeepBlue = false;
          st.color = '#38BDF8';
          st.statusLabel = 'Few Drops: Pale blue ppt formed';
        } else if (['Zn2+', 'Al3+', 'Pb2+'].includes(salt.cation)) {
          st.ppt = true;
          st.pptDissolved = false;
          st.color = '#F1F5F9';
          st.statusLabel = 'Few Drops: White ppt formed';
        } else if (salt.cation === 'Fe2+') {
          st.ppt = true;
          st.color = '#10B981';
          st.statusLabel = 'Few Drops: Dirty green ppt formed';
        } else if (salt.cation === 'Fe3+') {
          st.ppt = true;
          st.color = '#B45309';
          st.statusLabel = 'Few Drops: Reddish-brown ppt';
        } else {
          st.ppt = false;
          st.color = '#475569';
          st.statusLabel = 'Few Drops: No precipitate';
        }
      } else if (targetStage === 'excess') {
        if (salt.cation === 'Cu2+') {
          st.ppt = false;
          st.complexDeepBlue = true; // Tetraamminecopper(II) deep blue!
          st.color = '#1D4ED8';
          st.statusLabel = 'In Excess: Dissolves to form Deep Royal Blue solution';
        } else if (salt.cation === 'Zn2+') {
          st.ppt = false;
          st.pptDissolved = true; // Tetraamminezinc(II) soluble!
          st.color = 'rgba(56, 189, 248, 0.18)';
          st.statusLabel = 'In Excess: White ppt dissolves (Colorless solution)';
        } else if (['Al3+', 'Pb2+'].includes(salt.cation)) {
          st.ppt = true;
          st.pptDissolved = false;
          st.color = '#F1F5F9';
          st.statusLabel = 'In Excess: White ppt remains insoluble';
        } else if (salt.cation === 'Fe2+') {
          st.ppt = true;
          st.color = '#10B981';
          st.statusLabel = 'In Excess: Green ppt insoluble';
        } else if (salt.cation === 'Fe3+') {
          st.ppt = true;
          st.color = '#B45309';
          st.statusLabel = 'In Excess: Reddish-brown ppt insoluble';
        } else {
          st.ppt = false;
          st.color = '#475569';
          st.statusLabel = 'In Excess: No precipitate';
        }
      }
    } else if (testKey === 'ki') {
      if (targetStage === 'few_drops') {
        playDropSplashSound();
        if (salt.cation === 'Pb2+') {
          st.ppt = true;
          st.color = '#EAB308';
          st.statusLabel = 'KI Added: Bright canary-yellow ppt';
        } else {
          st.ppt = false;
          st.color = '#334155';
          st.statusLabel = 'KI Added: No precipitate';
        }
      } else if (targetStage === 'heated') {
        playFlameSound();
        if (salt.cation === 'Pb2+') {
          st.ppt = false;
          st.heated = true;
          st.color = 'rgba(234, 179, 8, 0.45)';
          st.statusLabel = 'Warmed: Yellow ppt dissolves in hot water';
        } else {
          st.heated = true;
          st.statusLabel = 'Warmed: No change';
        }
      } else if (targetStage === 'cooled') {
        playDropSplashSound();
        if (salt.cation === 'Pb2+') {
          st.spangles = true;
          st.color = '#EAB308';
          st.statusLabel = 'Cooled: Golden spangles sparkle!';
        } else {
          st.statusLabel = 'Cooled: No precipitate';
        }
      }
    }

    const correctKey = test.correct[currentSaltKey];
    st.correctKey = correctKey;
    renderAll();
  };

  window.performTest = function(testKey) {
    if (testKey === 'flame') {
      playFlameSound();
      openFlameModal();
      return;
    }
    const test = TESTS.find(t => t.key === testKey);
    const correctKey = test.correct[currentSaltKey];
    const correctOpt = test.options.find(o => o.key === correctKey);

    if (testKey === 'hcl' && correctOpt && correctOpt.bubble) {
      playEffervescenceSound();
    } else {
      playDropSplashSound();
    }

    if (!testStates[testKey]) testStates[testKey] = {};
    testStates[testKey].performed = true;
    testStates[testKey].stage = 'done';
    testStates[testKey].color = correctOpt ? correctOpt.color : '#38BDF8';
    testStates[testKey].bubbling = correctOpt ? !!correctOpt.bubble : false;
    testStates[testKey].ppt = correctOpt ? (correctOpt.text.toLowerCase().includes('ppt') || correctOpt.text.toLowerCase().includes('precipitate')) : false;
    testStates[testKey].correctKey = correctKey;
    testStates[testKey].statusLabel = 'Reagent Added — Observed';

    renderAll();
  };

  function selectObs(testKey, optKey) {
    const st = testStates[testKey];
    if (!st || st.selectedKey) return;
    st.selectedKey = optKey;
    renderAll();
  }

  /* ══════════════════════════════════════
     FLAME TEST MODAL & COBALT GLASS FILTER
  ══════════════════════════════════════ */
  let flamePhase = 'idle';
  let isCobaltGlassActive = false;

  window.toggleCobaltGlass = function() {
    isCobaltGlassActive = !isCobaltGlassActive;
    const btn = document.getElementById('btnCobaltGlass');
    if (btn) {
      btn.innerHTML = isCobaltGlassActive ? '🟦 Cobalt Blue Glass Filter: ON' : '🟦 Cobalt Blue Glass Filter: OFF';
      btn.classList.toggle('btn-primary-solid', isCobaltGlassActive);
      btn.classList.toggle('btn-secondary', !isCobaltGlassActive);
    }
    const salt = SALTS[currentSaltKey] || {};
    if (flamePhase === 'burning' || flamePhase === 'done') {
      const fTest = TESTS.find(t => t.key === 'flame');
      const correctKey = fTest.correct[currentSaltKey];
      const correctOpt = fTest.options.find(o => o.key === correctKey);
      let flameColor = correctOpt ? correctOpt.color : '#38BDF8';

      // KCSE Cobalt Glass Physics: Absorbs Na+ yellow, reveals K+ lilac/crimson
      if (isCobaltGlassActive) {
        if (salt.cation === 'Na+') flameColor = 'rgba(100, 116, 139, 0.2)'; // Yellow absorbed
        else if (salt.cation === 'K+') flameColor = '#C084FC'; // Lilac shines through
      }
      setFlameColor(flameColor, true);
    }
  };

  function openFlameModal() {
    flamePhase = 'idle';
    isCobaltGlassActive = false;
    const btn = document.getElementById('btnCobaltGlass');
    if (btn) {
      btn.innerHTML = '🟦 Cobalt Blue Glass Filter: OFF';
      btn.className = 'btn-secondary';
    }
    document.getElementById('flameModal').style.display = 'flex';
    resetFlameSteps();
  }
  function closeFlameModal() { document.getElementById('flameModal').style.display = 'none'; }

  function resetFlameSteps() {
    setFlameStep(1);
    document.getElementById('wireGroup').style.transform = 'translate(-60px, 95px)';
    document.getElementById('wireDeposit').style.display = 'none';
    document.getElementById('flameDoneBanner').style.display = 'none';
    const chip = document.getElementById('flameObsChip');
    chip.className = 'flame-obs-chip';
    chip.textContent = 'Awaiting flame test result…';
    setFlameColor('#38BDF8', false);
    setBenchActive('HCl');
    flamePhase = 'idle';
  }

  function setFlameStep(active) {
    [1,2,3].forEach(n => {
      const el = document.getElementById(`flameStep${n}`);
      el.className = n < active ? 'step-item done' : n === active ? 'step-item active' : 'step-item';
      el.querySelector('.step-num').textContent = n < active ? '✓' : n;
    });
  }
  function setBenchActive(name) {
    ['HCl','Salt'].forEach(n => {
      const el = document.getElementById('bench' + n);
      if (el) { el.classList.toggle('active-step', n === name); el.classList.toggle('disabled', n !== name); }
    });
  }

  function setFlameColor(color, intense) {
    const o = document.getElementById('flameOuterPath');
    const i = document.getElementById('flameInnerPath');
    const g = document.getElementById('flameGlow');
    o.setAttribute('fill', color);
    o.setAttribute('opacity', intense ? '0.95' : '0.65');
    if (intense) o.setAttribute('d', 'M90,5 C40,40 50,110 90,110 C130,110 140,40 90,5 Z');
    else o.setAttribute('d', 'M90,18 C55,50 62,110 90,110 C118,110 125,50 90,18 Z');
    i.setAttribute('opacity', intense ? '0.95' : '0.85');
    g.setAttribute('fill', color === '#38BDF8' ? 'url(#glowGrad)' : color);
    g.setAttribute('opacity', intense ? '0.5' : '0.3');
  }

  function flameDipHCl() {
    if (flamePhase !== 'idle') return;
    flamePhase = 'cleaning';
    setBenchActive(null);
    const wire = document.getElementById('wireGroup');
    wire.style.transform = 'translate(-100px, 150px)';
    setTimeout(() => {
      wire.style.transform = 'translate(20px, 55px)';
      setFlameColor('#F59E0B', true);
      setTimeout(() => {
        setFlameColor('#38BDF8', false);
        wire.style.transform = 'translate(-60px, 95px)';
        flamePhase = 'cleaned';
        setFlameStep(2);
        setBenchActive('Salt');
      }, 900);
    }, 900);
  }

  function flameDipSalt() {
    if (flamePhase !== 'cleaned') return;
    flamePhase = 'sampling';
    setBenchActive(null);
    const wire = document.getElementById('wireGroup');
    wire.style.transform = 'translate(30px, 150px)';
    setTimeout(() => {
      document.getElementById('wireDeposit').style.display = 'block';
      wire.style.transform = 'translate(-60px, 95px)';
      flamePhase = 'sampled';
      setFlameStep(3);
      setBenchActive(null);
    }, 900);
  }

  function flameIgnite() {
    if (flamePhase !== 'sampled') return;
    flamePhase = 'burning';
    document.getElementById('flameTapHint').style.display = 'none';
    const wire = document.getElementById('wireGroup');
    wire.style.transform = 'translate(20px, 55px)';
    setTimeout(() => {
      const fTest = TESTS.find(t => t.key === 'flame');
      const correctKey = fTest.correct[currentSaltKey];
      const correctOpt = fTest.options.find(o => o.key === correctKey);
      let flameColor = correctOpt ? correctOpt.color : '#38BDF8';
      const salt = SALTS[currentSaltKey] || {};

      if (isCobaltGlassActive) {
        if (salt.cation === 'Na+') flameColor = 'rgba(100, 116, 139, 0.2)';
        else if (salt.cation === 'K+') flameColor = '#C084FC';
      }

      setFlameColor(flameColor, true);
      document.getElementById('wireDeposit').style.display = 'none';
      setTimeout(() => {
        wire.style.transform = 'translate(-60px, 95px)';
        setFlameColor('#38BDF8', false);
        flamePhase = 'done';
        const chip = document.getElementById('flameObsChip');
        chip.textContent = `🔥 Observed: ${correctOpt?.text || 'No colour'}`;
        chip.className = 'flame-obs-chip observed';
        document.getElementById('flameDoneBanner').style.display = 'block';
        testStates['flame'] = { performed:true, color:flameColor, bubbling:false, correctKey, selectedKey:null };
        renderAll();
      }, 1800);
    }, 850);
  }

  /* ══════════════════════════════════════
     SUBMIT IDENTIFICATION
  ══════════════════════════════════════ */
  async function submitIdentification() {
    if (sessionSaved) return;
    const cation = document.getElementById('cationSelect').value;
    const anion  = document.getElementById('anionSelect').value;
    if (!cation || !anion) { alert('Please select both a cation and an anion.'); return; }

    const salt = SALTS[currentSaltKey];
    const cationCorrect = cation === salt.cation;
    const anionCorrect  = anion === salt.anion;
    const fullyCorrect  = cationCorrect && anionCorrect;

    const box = document.getElementById('idResultBox');
    box.style.display = 'block';
    box.innerHTML = `<div class="id-result-card" style="background:var(--blue-bg);border:1px solid var(--blue-accent);">
      <div class="id-result-icon">⏳</div>
      <div class="id-result-text"><h3>Saving…</h3></div>
    </div>`;

    try {
      const observations = TESTS.map(test => {
        const st = testStates[test.key];
        return { test: test.label, observation: st?.selectedKey ? (test.options.find(o => o.key === st.selectedKey)?.text || '') : 'Not performed' };
      });

      await Qualitative.save({
        saltKey: currentSaltKey, saltName: salt.name,
        trueCation: salt.cation, trueAnion: salt.anion,
        studentCation: cation, studentAnion: anion,
        cationCorrect, anionCorrect,
        testsPerformed: Object.keys(testStates).filter(k => testStates[k].performed).length,
        testsCorrect: Object.values(testStates).filter(s => s.selectedKey && s.selectedKey === s.correctKey).length,
        observations,
        mode: assignmentId ? 'assignment' : 'selfPaced',
        assignmentId: assignmentId ? parseInt(assignmentId, 10) : null
      });

      sessionSaved = true;
      document.getElementById('submitIdBtn').textContent = '✅ Submitted';
      document.getElementById('submitIdBtn').disabled = true;

      box.innerHTML = `
        <div class="id-result-card ${fullyCorrect ? 'correct' : 'incorrect'}">
          <div class="id-result-icon">${fullyCorrect ? '🎉' : '⚠️'}</div>
          <div class="id-result-text">
            <h3>${fullyCorrect ? 'Correct Identification!' : 'Incorrect Identification'}</h3>
            <p>The salt was <b>${esc(salt.name)} (${esc(salt.formula)})</b>. Cation: <b>${esc(salt.cationDisplay)}</b>  Anion: <b>${esc(salt.anionDisplay)}</b>.</p>
            ${!cationCorrect ? `<p style="color:var(--red-accent);margin-top:4px;">✗ Your cation (${esc(cation)}) was incorrect.</p>` : ''}
            ${!anionCorrect  ? `<p style="color:var(--red-accent);margin-top:4px;">✗ Your anion (${esc(anion)}) was incorrect.</p>` : ''}
          </div>
        </div>`;
    } catch (err) {
      box.innerHTML = `<div class="id-result-card incorrect">
        <div class="id-result-icon">❌</div>
        <div class="id-result-text"><h3>Save Error</h3><p>${esc(err.message)}</p></div>
      </div>`;
    }
  }

  /* ══════════════════════════════════════
     UTILS
  ══════════════════════════════════════ */
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  /* ══════════════════════════════════════
     INORGANIC EXAMINER TIPS & TIMER HANDLERS
  ══════════════════════════════════════ */
  window.openExaminerTipsModal = function() {
    const modal = document.getElementById('examinerTipsModal');
    if (modal) modal.style.display = 'flex';
  };
  window.closeExaminerTipsModal = function() {
    const modal = document.getElementById('examinerTipsModal');
    if (modal) modal.style.display = 'none';
  };

  /* 45-Minute KCSE Exam Countdown Timer */
  let timerInterval = null;
  let timerSeconds = 45 * 60;
  let isTimerRunning = false;

  window.toggleExamTimer = function() {
    const btn = document.getElementById('examTimerBtn');
    const display = document.getElementById('timerDisplay');

    if (isTimerRunning) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      if (btn) btn.innerHTML = '⏱️ Resume 45-Min Timer';
      if (display) display.style.color = 'var(--text-muted)';
    } else {
      isTimerRunning = true;
      if (btn) btn.innerHTML = '⏸️ Pause Exam Timer';
      
      timerInterval = setInterval(() => {
        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          isTimerRunning = false;
          alert('⏰ KCSE 45-Minute Exam Time is UP! Submitting your examination booklet now...');
          submitIdentification();
          return;
        }

        timerSeconds--;
        const mins = Math.floor(timerSeconds / 60);
        const secs = timerSeconds % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (display) {
          display.textContent = `⏱️ ${formatted}`;
          if (timerSeconds < 300) {
            display.style.color = 'var(--red-accent)';
            display.style.fontWeight = '800';
          } else {
            display.style.color = 'var(--purple-accent)';
          }
        }
      }, 1000);
    }
  };

  /* Web Audio Synthesizers for Inorganic Reactions */
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  window.toggleSound = function() {
    isSoundEnabled = !isSoundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) btn.innerHTML = isSoundEnabled ? '🔊 Sound ON' : '🔇 Mute';
  };

  function playFlameSound() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.8;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.25));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.7);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.75);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch(e) {}
  }

  function playEffervescenceSound() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 1.2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.sin(i / 120));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, audioCtx.currentTime);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.1);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch(e) {}
  }

  function playDropSplashSound() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
  }

  /* Systematic Flowchart Handler */
  let currentFlowTab = 'cations';
  window.openFlowchartModal = function() {
    document.getElementById('flowchartModal').style.display = 'flex';
    renderFlowchart(currentFlowTab);
  };
  window.closeFlowchartModal = function() {
    document.getElementById('flowchartModal').style.display = 'none';
  };
  window.switchFlowTab = function(tab) {
    currentFlowTab = tab;
    const btnCations = document.getElementById('tabFlowCations');
    const btnAnions = document.getElementById('tabFlowAnions');
    if (btnCations) btnCations.style.background = tab === 'cations' ? 'var(--blue-bg)' : 'transparent';
    if (btnAnions) btnAnions.style.background = tab === 'anions' ? 'var(--blue-bg)' : 'transparent';
    renderFlowchart(tab);
  };

  function renderFlowchart(tab) {
    const container = document.getElementById('flowchartContent');
    if (!container) return;
    if (tab === 'cations') {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div style="background:var(--card-bg); padding:14px 18px; border-radius:12px; border-left:4px solid var(--blue-accent);">
            <b style="color:var(--blue-accent); font-size:0.95rem;">Step 1: Add 2M NaOH(aq) dropwise, then in excess</b>
            <div style="margin-top:8px; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px;">
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:var(--amber-accent); font-weight:700;">No ppt + Heat:</span> Pungent gas turns damp red litmus blue → <b>NH₄⁺</b>
              </div>
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:var(--blue-accent); font-weight:700;">Blue ppt:</span> Insoluble in excess → <b>Cu²⁺</b>
              </div>
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:var(--green-accent); font-weight:700;">Green ppt:</span> Insoluble in excess → <b>Fe²⁺</b>
              </div>
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:#B45309; font-weight:700;">Red-Brown ppt:</span> Insoluble in excess → <b>Fe³⁺</b>
              </div>
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:var(--text-main); font-weight:700;">White ppt (insoluble in excess):</span> → <b>Ca²⁺</b>
              </div>
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border); grid-column:span 2;">
                <span style="color:var(--purple-accent); font-weight:700;">White ppt SOLUBLE in excess (Amphoteric):</span> → Suspect <b>Zn²⁺, Al³⁺, Pb²⁺</b>
              </div>
            </div>
          </div>

          <div style="background:var(--card-bg); padding:14px 18px; border-radius:12px; border-left:4px solid var(--purple-accent);">
            <b style="color:var(--purple-accent); font-size:0.95rem;">Step 2: Differentiate Amphoteric Cations (Zn²⁺, Al³⁺, Pb²⁺) using Dilute NH₃(aq)</b>
            <div style="margin-top:8px; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:var(--green-accent); font-weight:700;">White ppt SOLUBLE in excess NH₃:</span> Confirms <b>Zn²⁺</b>
              </div>
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:var(--red-accent); font-weight:700;">White ppt INSOLUBLE in excess NH₃:</span> Suspect <b>Al³⁺</b> or <b>Pb²⁺</b>
              </div>
            </div>
          </div>

          <div style="background:var(--card-bg); padding:14px 18px; border-radius:12px; border-left:4px solid var(--amber-accent);">
            <b style="color:var(--amber-accent); font-size:0.95rem;">Step 3: Confirmatory Test for Pb²⁺ vs Al³⁺ using KI(aq) or HCl(aq)</b>
            <div style="margin-top:8px; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:var(--amber-accent); font-weight:700;">Add KI(aq):</span> Bright canary-yellow ppt (PbI₂) dissolving on heating to golden sparkles → Confirms <b>Pb²⁺</b>
              </div>
              <div style="background:var(--bg-dark); padding:10px; border-radius:8px; border:1px solid var(--card-border);">
                <span style="color:var(--text-muted); font-weight:700;">Add KI(aq):</span> No precipitate formed → Confirms <b>Al³⁺</b>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div style="background:var(--card-bg); padding:14px 18px; border-radius:12px; border-left:4px solid var(--blue-accent);">
            <b style="color:var(--blue-accent); font-size:0.95rem;">Test A: Carbonate Ion (CO₃²⁻)</b>
            <p style="margin:4px 0 0 0; font-size:0.84rem; color:var(--text-muted);">Add dilute HCl: Effervescence of a colorless gas turning limewater milky confirms <b>CO₃²⁻</b>.</p>
          </div>
          <div style="background:var(--card-bg); padding:14px 18px; border-radius:12px; border-left:4px solid var(--green-accent);">
            <b style="color:var(--green-accent); font-size:0.95rem;">Test B: Sulfate Ion (SO₄²⁻)</b>
            <p style="margin:4px 0 0 0; font-size:0.84rem; color:var(--text-muted);">Acidify with dilute HCl, then add BaCl₂(aq): White precipitate of BaSO₄ insoluble in dilute HCl confirms <b>SO₄²⁻</b>.</p>
          </div>
          <div style="background:var(--card-bg); padding:14px 18px; border-radius:12px; border-left:4px solid var(--purple-accent);">
            <b style="color:var(--purple-accent); font-size:0.95rem;">Test C: Chloride Ion (Cl⁻)</b>
            <p style="margin:4px 0 0 0; font-size:0.84rem; color:var(--text-muted);">Acidify with dilute HNO₃, then add AgNO₃(aq): White precipitate of AgCl soluble in aqueous NH₃ confirms <b>Cl⁻</b>.</p>
          </div>
          <div style="background:var(--card-bg); padding:14px 18px; border-radius:12px; border-left:4px solid var(--amber-accent);">
            <b style="color:var(--amber-accent); font-size:0.95rem;">Test D: Nitrate Ion (NO₃⁻) — Brown Ring Test</b>
            <p style="margin:4px 0 0 0; font-size:0.84rem; color:var(--text-muted);">Add fresh FeSO₄(aq), slant tube, and carefully pour conc. H₂SO₄ down the side: A brown ring at the interface layer confirms <b>NO₃⁻</b>.</p>
          </div>
        </div>
      `;
    }
  }

  /* KNEC Auto-Marking Evaluator Handler */
  window.evaluateKnecMarking = function() {
    let totalScore = 0;
    const feedbackItems = [];

    TESTS.forEach((test, idx) => {
      const st = testStates[test.key] || {};
      const obsText = (st.obsText || '').trim();
      const infText = (st.infText || '').trim();

      let itemScore = 0;
      const notes = [];

      if (!st.performed) {
        notes.push('⚠️ Test not performed yet.');
      } else {
        if (!obsText) {
          notes.push('❌ Observation area left blank.');
        } else {
          if (/white solution/i.test(obsText)) {
            notes.push('🚨 KNEC Penalty: Never write "white solution" (-0.5). Use "white precipitate" or "colorless solution".');
            itemScore = Math.max(0, itemScore - 0.5);
          }
          if (/gas (evolved|produced|given off)/i.test(obsText) && !/(effervescence|limewater|litmus|ammonia|pungent)/i.test(obsText)) {
            notes.push('⚠️ KNEC Warning: State specific gas properties (e.g. effervescence, turns limewater milky).');
          }
          if (/(precipitate|ppt)/i.test(obsText) && !/(excess|soluble|insoluble)/i.test(obsText) && ['naoh','nh3'].includes(test.key)) {
            notes.push('⚠️ KNEC Warning: Always specify excess reagent behavior (soluble/insoluble in excess).');
          }
          itemScore += 0.7;
          notes.push('✅ Observation recorded accurately (+0.7 mark).');
        }

        if (!infText) {
          notes.push('❌ Inference area left blank.');
        } else {
          itemScore += 0.7;
          notes.push('✅ Inference recorded accurately (+0.7 mark).');
        }
      }

      totalScore += itemScore;
      feedbackItems.push({
        testLabel: test.label,
        score: itemScore,
        maxItemScore: 1.4,
        notes
      });
    });

    const finalScore = Math.min(10.0, Math.max(0, totalScore)).toFixed(1);
    openKnecEvalModal(finalScore, feedbackItems);
  };

  function openKnecEvalModal(finalScore, feedbackItems) {
    const q2Score = Math.min(15.0, Math.round((parseFloat(finalScore) * 1.5) * 10) / 10);
    window.currentQualScore = q2Score;
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          type: 'VLK_Q_SCORED',
          qNum: 2,
          score: q2Score,
          details: { finalScore, feedbackItems }
        }, '*');
      } catch(e) {}
    }

    document.getElementById('knecEvalModal').style.display = 'flex';
    const resBox = document.getElementById('knecEvalResults');
    if (!resBox) return;

    const grade = finalScore >= 8.5 ? 'A (Excellent KCSE Standard)' : finalScore >= 6.5 ? 'B (Good Practical Record)' : finalScore >= 4.5 ? 'C (Passable)' : 'D (Needs Revision)';
    const gradeColor = finalScore >= 8.5 ? 'var(--green-accent)' : finalScore >= 6.5 ? 'var(--blue-accent)' : 'var(--amber-accent)';

    resBox.innerHTML = `
      <div style="background:var(--card-bg-hover); border:1px solid var(--card-border); border-radius:14px; padding:18px; margin-bottom:20px; text-align:center;">
        <div style="font-size:0.82rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; font-weight:700;">Total Practical Performance Score</div>
        <div style="font-family:var(--font-heading); font-size:2.4rem; font-weight:800; color:${gradeColor}; margin:4px 0;">${finalScore} / 10.0</div>
        <div style="font-size:0.9rem; font-weight:700; color:${gradeColor};">${grade}</div>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        ${feedbackItems.map(item => `
          <div style="background:var(--bg-dark); border:1px solid var(--card-border); border-radius:10px; padding:12px 16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <b style="color:var(--heading-color); font-size:0.88rem;">${item.testLabel}</b>
              <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:var(--blue-accent);">${item.score.toFixed(1)} / ${item.maxItemScore} Marks</span>
            </div>
            <ul style="margin:4px 0 0 16px; padding:0; font-size:0.8rem; color:var(--text-muted);">
              ${item.notes.map(n => `<li style="margin-bottom:3px;">${n}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  }

  window.closeKnecEvalModal = function() {
    document.getElementById('knecEvalModal').style.display = 'none';
  };

  /* Boot */
  newSample();
/* ============================================================
   VirtuLab Kenya — Apparatus Gallery & Quiz Module
   apparatus-gallery.js  (IIFE, no bundler required)
   Exposes: window.ApparatusGallery
   LocalStorage key: 'vlk_apparatus_certified'
   ============================================================ */
(function (root) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1.  APPARATUS DATA  (18 items)
     ═══════════════════════════════════════════════════════════ */
  var APPARATUS_DATA = [
    {
      id: 'burette',
      name: 'Burette (50 cm³)',
      category: 'Measurement',
      viewBox: '0 0 60 220',
      svgPath: 'M20 8 L20 2 L40 2 L40 8 M18 8 L42 8 L42 170 L38 170 L38 178 Q38 184 30 184 Q22 184 22 178 L22 170 L18 170 Z M25 170 L35 170 M20 30 L18 30 M20 50 L18 50 M20 70 L18 70 M20 90 L18 90 M20 110 L18 110 M20 130 L18 130 M20 150 L18 150',
      primaryUse: 'Delivers variable, precise volumes of titrant solution during titration',
      labContext: 'Used in Question 1 (Volumetric Analysis) — always held vertically in a retort stand',
      safetyNote: 'Handle carefully — glass stopcock can jam. Never invert when full.',
      funFact: 'The word "burette" is French, meaning a small jug!',
      quizDistractors: ['Measuring Cylinder', 'Bulb Pipette', 'Graduated Syringe'],
      useDistractors: ['Measures fixed 25 cm³ aliquots', 'Holds reagents for heating', 'Separates precipitates']
    },
    {
      id: 'bulb-pipette',
      name: 'Bulb Pipette (25 cm³)',
      category: 'Measurement',
      viewBox: '0 0 30 180',
      svgPath: 'M15 4 L15 60 Q15 60 8 90 Q4 108 4 118 Q4 140 15 148 Q26 140 26 118 Q26 108 22 90 L15 60 M8 90 Q15 86 22 90 M15 148 L15 174 L14 176 L16 176 L15 174',
      primaryUse: 'Delivers a fixed, precise volume (25 cm³) of analyte solution into a conical flask',
      labContext: 'Used in Question 1 to transfer exact aliquots of analyte — requires a pipette filler',
      safetyNote: 'Never pipette by mouth. Use a rubber bulb or pipette filler at all times.',
      funFact: 'The central bulb acts as a volume reservoir — the glass is precisely calibrated at manufacture.',
      quizDistractors: ['Burette', 'Measuring Cylinder', 'Dropping Pipette'],
      useDistractors: ['Delivers variable volumes', 'Transfers solids precisely', 'Measures 100 cm³ liquids']
    },
    {
      id: 'conical-flask',
      name: 'Conical Flask (250 cm³)',
      category: 'Glassware',
      viewBox: '0 0 100 110',
      svgPath: 'M38 8 L38 2 L62 2 L62 8 M38 8 L38 28 Q38 28 10 80 Q4 92 4 100 L96 100 Q96 92 90 80 L62 28 L62 8 M10 80 L90 80',
      primaryUse: 'Holds the analyte solution during titration; swirled to mix contents',
      labContext: 'Placed on a white tile below the burette tip during volumetric analysis',
      safetyNote: 'Swirl gently — do not stopper and shake when hot or when producing gas.',
      funFact: 'Named after Emil Erlenmeyer who designed it in 1861 — also called an Erlenmeyer flask!',
      quizDistractors: ['Beaker', 'Round-Bottom Flask', 'Boiling Tube'],
      useDistractors: ['Holds solutions being heated directly', 'Measures liquid volume', 'Separates immiscible liquids']
    },
    {
      id: 'beaker',
      name: 'Beaker (250 cm³)',
      category: 'Glassware',
      viewBox: '0 0 80 90',
      svgPath: 'M10 4 L70 4 Q74 4 74 8 L70 82 Q70 86 66 86 L14 86 Q10 86 10 82 L6 8 Q6 4 10 4 M6 8 L74 8 M68 4 Q76 4 78 12 L78 24 M20 60 L18 60 M20 40 L18 40 M20 20 L18 20',
      primaryUse: 'General-purpose container for holding, heating, and mixing solutions',
      labContext: 'Used to prepare solutions, collect distillate, or as a water bath vessel',
      safetyNote: 'Not designed for precise volume measurement — use only as a rough guide.',
      funFact: 'The pour spout (lip) is designed to make pouring precise without dribbling!',
      quizDistractors: ['Conical Flask', 'Measuring Cylinder', 'Boiling Tube'],
      useDistractors: ['Delivers exact 25 cm³ volumes', 'Measures precise volumes', 'Collects gas over water']
    },
    {
      id: 'measuring-cylinder',
      name: 'Measuring Cylinder (100 cm³)',
      category: 'Measurement',
      viewBox: '0 0 50 130',
      svgPath: 'M12 10 L12 4 Q12 2 25 2 Q38 2 38 4 L38 10 M12 10 L12 118 Q12 124 25 124 Q38 124 38 118 L38 10 M12 118 Q12 124 25 124 Q38 124 38 118 M12 30 L10 30 M12 50 L10 50 M12 70 L10 70 M12 90 L10 90 M12 110 L10 110',
      primaryUse: 'Measures approximate liquid volumes for general lab use',
      labContext: 'Used to measure reagent volumes before preparing standard solutions',
      safetyNote: 'Read the meniscus at eye level from the bottom of the curved surface.',
      funFact: 'Graduated cylinders are more accurate than beakers but less accurate than volumetric glassware!',
      quizDistractors: ['Burette', 'Bulb Pipette', 'Boiling Tube'],
      useDistractors: ['Delivers precise titrant drops', 'Holds the analyte during titration', 'Heats reagents directly']
    },
    {
      id: 'test-tube',
      name: 'Test Tube',
      category: 'Glassware',
      viewBox: '0 0 40 120',
      svgPath: 'M12 4 L12 90 Q12 108 20 108 Q28 108 28 90 L28 4 M12 4 L28 4',
      primaryUse: 'Holds small volumes of liquids for reactions, heating, or qualitative tests',
      labContext: 'Used in salt analysis and qualitative inorganic chemistry practicals',
      safetyNote: 'Point the open end away from yourself and others when heating.',
      funFact: 'Test tubes were invented in the early 19th century and revolutionised small-scale chemistry!',
      quizDistractors: ['Boiling Tube', 'Burette', 'Dropping Pipette'],
      useDistractors: ['Measures 10 cm³ volumes precisely', 'Holds titration analyte', 'Separates mixture by density']
    },
    {
      id: 'boiling-tube',
      name: 'Boiling Tube',
      category: 'Glassware',
      viewBox: '0 0 46 140',
      svgPath: 'M12 4 L12 112 Q12 132 23 132 Q34 132 34 112 L34 4 M12 4 L34 4',
      primaryUse: 'Holds larger volumes than a test tube; used for heating reactions and gas collection',
      labContext: 'Used to heat solids or liquids and to collect gas by downward or upward displacement',
      safetyNote: 'Clamp boiling tubes when heating — do not hold with bare hands.',
      funFact: 'Its wider diameter allows more vigorous boiling without bumping!',
      quizDistractors: ['Test Tube', 'Measuring Cylinder', 'Conical Flask'],
      useDistractors: ['Delivers titrant precisely', 'Measures volumes of liquids', 'Filters precipitates']
    },
    {
      id: 'thermometer',
      name: 'Thermometer (0–110 °C)',
      category: 'Measurement',
      viewBox: '0 0 30 160',
      svgPath: 'M15 148 Q6 148 6 155 Q6 162 15 162 Q24 162 24 155 Q24 148 15 148 L15 10 M12 10 L18 10 M12 148 L18 148 Q22 148 22 155 Q22 160 15 160 Q8 160 8 155 Q8 148 12 148 M11 30 L9 30 M11 50 L9 50 M11 70 L9 70 M11 90 L9 90 M11 110 L9 110 M11 130 L9 130',
      primaryUse: 'Measures the temperature of solutions and reaction mixtures',
      labContext: 'Used in thermal chemistry practicals to record temperature changes',
      safetyNote: 'Mercury thermometers are hazardous if broken — use digital or alcohol types where possible.',
      funFact: 'Galileo invented the first thermoscope (ancestor of the thermometer) in 1593!',
      quizDistractors: ['Burette', 'Graduated Pipette', 'Measuring Cylinder'],
      useDistractors: ['Measures liquid volumes', 'Controls liquid flow rate', 'Records gas pressure']
    },
    {
      id: 'tripod-stand',
      name: 'Tripod Stand',
      category: 'Heating',
      viewBox: '0 0 100 110',
      svgPath: 'M50 10 L50 50 M50 50 L10 100 M50 50 L90 100 M50 50 L50 100 M20 100 L80 100 M15 85 Q50 75 85 85',
      primaryUse: 'Supports the wire gauze and vessel (beaker/flask) over the Bunsen burner flame',
      labContext: 'Central to any heating setup — always positioned over the Bunsen burner',
      safetyNote: 'Ensure the tripod is stable on a flat surface before placing any vessel on it.',
      funFact: 'The three-legged design is inherently stable — a tripod cannot wobble on an uneven surface!',
      quizDistractors: ['Retort Stand', 'Wire Gauze', 'Bunsen Burner'],
      useDistractors: ['Holds burette vertically', 'Distributes heat evenly', 'Provides gas flame for heating']
    },
    {
      id: 'wire-gauze',
      name: 'Wire Gauze',
      category: 'Heating',
      viewBox: '0 0 100 80',
      svgPath: 'M5 20 L95 20 L95 60 L5 60 Z M5 30 L95 30 M5 40 L95 40 M5 50 L95 50 M20 20 L20 60 M35 20 L35 60 M50 20 L50 60 M65 20 L65 60 M80 20 L80 60 M38 36 Q50 32 62 36 Q50 44 38 36Z',
      primaryUse: 'Distributes Bunsen burner heat evenly; prevents glassware from cracking directly over flame',
      labContext: 'Placed on tripod stand between the flame and the glass vessel being heated',
      safetyNote: 'Allow to cool before touching — the ceramic centre retains heat for several minutes.',
      funFact: 'The white ceramic centre acts as a heat diffuser; some have asbestos-free ceramic padding!',
      quizDistractors: ['Tripod Stand', 'Heat Mat', 'Crucible'],
      useDistractors: ['Holds clamp and burette', 'Provides gas flame', 'Filters solid from liquid']
    },
    {
      id: 'bunsen-burner',
      name: 'Bunsen Burner',
      category: 'Heating',
      viewBox: '0 0 80 130',
      svgPath: 'M28 130 L28 80 L52 80 L52 130 Z M24 80 L56 80 M28 90 L52 90 M22 90 Q16 90 16 96 L16 100 M58 90 Q64 90 64 96 L64 100 M22 70 L22 40 Q22 20 40 20 Q58 20 58 40 L58 70 M22 70 L58 70 M30 20 Q30 10 40 8 Q50 10 50 20',
      primaryUse: 'Provides a controllable gas flame for heating laboratory substances',
      labContext: 'Used for heating solutions, evaporation, and thermal chemistry experiments',
      safetyNote: 'Never leave a lit Bunsen unattended. Keep hair and loose clothing tied back.',
      funFact: 'Robert Bunsen did not actually invent the Bunsen burner — his lab assistant Peter Desaga designed it in 1854!',
      quizDistractors: ['Tripod Stand', 'Spirit Lamp', 'Heating Mantle'],
      useDistractors: ['Supports glassware above flame', 'Distributes heat evenly', 'Measures flame temperature']
    },
    {
      id: 'retort-stand',
      name: 'Retort Stand & Clamp',
      category: 'Heating',
      viewBox: '0 0 100 200',
      svgPath: 'M10 190 L90 190 L90 184 L10 184 Z M50 184 L50 10 M50 100 L80 100 M80 100 L80 95 Q84 95 84 100 Q84 105 80 105 L80 100 M68 97 L80 97 M68 103 L80 103',
      primaryUse: 'Holds and positions burettes, condensers, and other apparatus at the required height',
      labContext: 'Burette is clamped vertically to the retort stand during titration in Question 1',
      safetyNote: 'Tighten all clamps securely before loading with heavy apparatus.',
      funFact: 'The word "retort" comes from medieval Latin for a flask with a bent neck — the stand was designed to hold them!',
      quizDistractors: ['Tripod Stand', 'Bench Vice', 'Wire Gauze'],
      useDistractors: ['Provides heat for reactions', 'Distributes flame heat', 'Holds reagent solutions']
    },
    {
      id: 'watch-glass',
      name: 'Watch Glass',
      category: 'Glassware',
      viewBox: '0 0 100 50',
      svgPath: 'M5 40 Q5 10 50 8 Q95 10 95 40 M5 40 Q5 44 50 46 Q95 44 95 40',
      primaryUse: 'Covers beakers to reduce evaporation; used as a surface for small-scale reactions or weighing',
      labContext: 'Used as a lid for beakers during heating or as a surface when observing colour changes',
      safetyNote: 'Thin glass — handle with care and avoid sudden temperature changes.',
      funFact: 'Named for its resemblance to the glass cover on a pocket watch!',
      quizDistractors: ['Petri Dish', 'Evaporating Basin', 'Crucible'],
      useDistractors: ['Separates liquids', 'Measures small volumes', 'Provides controlled flame']
    },
    {
      id: 'dropping-pipette',
      name: 'Dropping / Pasteur Pipette',
      category: 'Transfer',
      viewBox: '0 0 40 150',
      svgPath: 'M15 4 Q10 4 8 8 Q4 14 4 20 Q4 32 10 36 Q6 36 6 42 Q6 48 10 50 L10 100 Q10 108 20 115 Q20 130 20 144 L19 148 L21 148 M10 50 L30 50 L30 100 Q30 108 20 115 M14 20 Q14 10 20 8 Q26 10 26 20 Q26 32 20 36 Q14 32 14 20Z',
      primaryUse: 'Transfers small volumes of liquids dropwise; used for adding reagents drop by drop',
      labContext: 'Used to add indicator solutions to titration flasks and to transfer reagents in salt analysis',
      safetyNote: 'Squeeze the bulb before immersing; never release the bulb inside a reagent bottle.',
      funFact: 'Named after Louis Pasteur who used similar pipettes in his germ theory experiments!',
      quizDistractors: ['Bulb Pipette', 'Burette', 'Measuring Cylinder'],
      useDistractors: ['Delivers exact 25 cm³', 'Measures 50 cm³ of titrant', 'Heats reagents by convection']
    },
    {
      id: 'spatula',
      name: 'Spatula',
      category: 'Transfer',
      viewBox: '0 0 160 30',
      svgPath: 'M6 15 L100 15 M100 10 L100 20 Q110 20 118 15 Q110 10 100 10 M118 15 L150 15',
      primaryUse: 'Transfers solid reagents and chemicals from containers to vessels',
      labContext: 'Used to transfer powdered reagents and to stir mixtures in salt analysis',
      safetyNote: 'Use separate spatulas for different chemicals to avoid cross-contamination.',
      funFact: 'The word "spatula" comes from Latin meaning "broad, flat piece" — the same root as "spade"!',
      quizDistractors: ['Dropping Pipette', 'Glass Rod', 'Wash Bottle'],
      useDistractors: ['Delivers liquid dropwise', 'Measures small liquid volumes', 'Rinses glassware with solvent']
    },
    {
      id: 'filter-funnel',
      name: 'Filter Funnel & Filter Paper',
      category: 'Transfer',
      viewBox: '0 0 100 130',
      svgPath: 'M8 10 L92 10 L58 70 L58 120 L42 120 L42 70 Z M8 10 Q50 20 92 10 M36 95 Q50 90 64 95 M20 30 Q50 38 80 30 M32 50 Q50 56 68 50',
      primaryUse: 'Separates solid precipitates from liquids by filtration',
      labContext: 'Used when a precipitate forms during salt analysis or preparation reactions',
      safetyNote: 'Always fold filter paper correctly and ensure it seats properly in the funnel.',
      funFact: 'Filter paper is made from pure cotton fibres — it has precisely controlled pore sizes!',
      quizDistractors: ['Dropping Pipette', 'Separating Funnel', 'Wash Bottle'],
      useDistractors: ['Transfers liquids dropwise', 'Separates immiscible liquids', 'Rinses precipitates with solvent']
    },
    {
      id: 'wash-bottle',
      name: 'Wash Bottle',
      category: 'Transfer',
      viewBox: '0 0 80 130',
      svgPath: 'M28 10 L28 4 L52 4 L52 10 M28 10 Q22 10 22 16 L22 90 Q22 108 40 112 Q58 108 58 90 L58 16 Q58 10 52 10 M38 4 Q40 2 42 4 M22 60 L14 60 Q8 62 6 68 L6 50 Q6 44 14 44 L22 44 M22 44 L22 60',
      primaryUse: 'Delivers a controlled stream of distilled water or solvent for rinsing glassware',
      labContext: 'Used to rinse burette tips, wash precipitates on filter paper, and rinse glassware',
      safetyNote: 'Only fill with distilled water (or stated solvent) — never with concentrated acids or bases.',
      funFact: 'Squeezing the bottle increases pressure, forcing liquid up the internal tube and out the nozzle!',
      quizDistractors: ['Dropping Pipette', 'Boiling Tube', 'Separating Funnel'],
      useDistractors: ['Transfers solid reagents', 'Measures 100 cm³ volumes', 'Provides flame for heating']
    },
    {
      id: 'safety-goggles',
      name: 'Safety Goggles',
      category: 'Safety',
      viewBox: '0 0 120 60',
      svgPath: 'M10 30 Q10 14 26 14 L46 14 Q54 14 60 22 Q66 14 74 14 L94 14 Q110 14 110 30 Q110 46 94 46 L74 46 Q66 46 60 38 Q54 46 46 46 L26 46 Q10 46 10 30Z M46 14 L74 14 M4 26 L10 28 M4 34 L10 32 M116 26 L110 28 M116 34 L110 32 M26 30 Q26 22 36 22 Q46 22 46 30 Q46 38 36 38 Q26 38 26 30Z M74 30 Q74 22 84 22 Q94 22 94 30 Q94 38 84 38 Q74 38 74 30Z',
      primaryUse: 'Protects the eyes from chemical splashes, fumes, and broken glass',
      labContext: 'Mandatory PPE — must be worn at ALL TIMES in the laboratory, no exceptions',
      safetyNote: 'Always wear goggles before handling any chemicals. Never remove them mid-experiment.',
      funFact: 'Modern polycarbonate lenses can withstand 12 joules of impact energy — stronger than most glass!',
      quizDistractors: ['Lab Coat', 'Fume Hood', 'Heat-Resistant Gloves'],
      useDistractors: ['Measures chemical volumes', 'Filters solid from liquid', 'Provides regulated heat source']
    }
  ];

  /* ═══════════════════════════════════════════════════════════
     2.  INTERNAL STATE
     ═══════════════════════════════════════════════════════════ */
  var _state = {
    isOpen: false,
    mode: 'gallery',         // 'gallery' | 'quiz' | 'intro' | 'detail'
    required: false,
    currentCategory: 'All',
    detailIndex: 0,
    quizQuestions: [],
    quizCurrent: 0,
    quizScore: 0,
    quizMissed: [],
    answered: false,
    onComplete: null,
    overlayEl: null,
    modalEl: null
  };

  var LS_KEY = 'vlk_apparatus_certified';

  /* ═══════════════════════════════════════════════════════════
     3.  HELPERS
     ═══════════════════════════════════════════════════════════ */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function badgeClass(cat) {
    return 'vlk-ag-badge vlk-ag-badge-' + cat.toLowerCase().replace(/[^a-z]/g, '');
  }

  function makeSVG(ap, w, h) {
    var vb = ap.viewBox || '0 0 60 120';
    var sw = w ? 'width="' + w + '" ' : '';
    var sh = h ? 'height="' + h + '" ' : '';
    return '<svg ' + sw + sh + 'viewBox="' + esc(vb) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="' + esc(ap.name) + '" role="img"><path d="' + esc(ap.svgPath) + '"/></svg>';
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pick(arr, n) {
    return shuffle(arr).slice(0, n);
  }

  function getFiltered(cat) {
    if (cat === 'All') return APPARATUS_DATA;
    return APPARATUS_DATA.filter(function (a) { return a.category === cat; });
  }

  function isQuizPassed() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      return !!(d && d.passed);
    } catch (e) { return false; }
  }

  /* ═══════════════════════════════════════════════════════════
     4.  DOM CREATION
     ═══════════════════════════════════════════════════════════ */
  function ensureModal() {
    if (_state.overlayEl) return;

    var overlay = document.createElement('div');
    overlay.className = 'vlk-apparatus-overlay';
    overlay.style.display = 'none';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Lab Apparatus Guide');

    var modal = document.createElement('div');
    modal.id = 'vlkApparatusModal';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on backdrop click (only when not required)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay && !_state.required) {
        ApparatusGallery.close();
      }
    });

    // ESC key
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && _state.isOpen && !_state.required) {
        ApparatusGallery.close();
      }
    });

    _state.overlayEl = overlay;
    _state.modalEl = modal;
  }

  /* ── render: Header ── */
  function renderHeader(titleExtra) {
    var showClose = !_state.required;
    return '<div class="vlk-ag-header">' +
      '<div class="vlk-ag-header-left">' +
        '<span class="vlk-ag-header-icon">🔬</span>' +
        '<div>' +
          '<h2 class="vlk-ag-title">Lab Apparatus Guide' + (titleExtra ? ' <span style="font-weight:500;color:var(--ag-text-muted);">' + esc(titleExtra) + '</span>' : '') + '</h2>' +
          '<div class="vlk-ag-subtitle">KCSE Chemistry Paper 3 — 18 Apparatus</div>' +
        '</div>' +
      '</div>' +
      (showClose ? '<button class="vlk-ag-close-btn" onclick="window.ApparatusGallery.close()" aria-label="Close apparatus guide" title="Close">✕</button>' : '') +
    '</div>';
  }

  /* ── render: Filter Tabs ── */
  var CATEGORIES = ['All', 'Glassware', 'Measurement', 'Heating', 'Transfer', 'Safety'];

  function renderFilters() {
    return '<div class="vlk-ag-filters" role="tablist" aria-label="Filter by category">' +
      CATEGORIES.map(function (cat) {
        var active = _state.currentCategory === cat ? ' active' : '';
        return '<button class="vlk-ag-filter-btn' + active + '" role="tab" aria-selected="' + (active ? 'true' : 'false') + '" onclick="window._vlkAG._filterTo(\'' + esc(cat) + '\')">' + esc(cat) + '</button>';
      }).join('') +
    '</div>';
  }

  /* ── render: Card Grid ── */
  function renderGrid() {
    var items = getFiltered(_state.currentCategory);
    if (!items.length) {
      return '<div class="vlk-ag-body"><div class="vlk-ag-empty"><div class="vlk-ag-empty-icon">🔭</div><div class="vlk-ag-empty-text">No apparatus in this category</div></div></div>';
    }
    return '<div class="vlk-ag-body"><div class="vlk-ag-grid" role="list">' +
      items.map(function (ap, idx) {
        var realIdx = APPARATUS_DATA.indexOf(ap);
        return '<div class="vlk-ag-card" role="listitem" tabindex="0" onclick="window._vlkAG._openDetail(' + realIdx + ')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){window._vlkAG._openDetail(' + realIdx + ')}" aria-label="' + esc(ap.name) + '">' +
          '<div class="vlk-ag-card-svg">' + makeSVG(ap) + '</div>' +
          '<div class="vlk-ag-card-name">' + esc(ap.name) + '</div>' +
          '<span class="' + badgeClass(ap.category) + '">' + esc(ap.category) + '</span>' +
        '</div>';
      }).join('') +
    '</div></div>';
  }

  /* ── render: Gallery Screen ── */
  function renderGallery() {
    return renderHeader() + renderFilters() + renderGrid() +
      '<div style="display:flex;align-items:center;justify-content:flex-end;padding:14px 24px;border-top:1px solid var(--ag-card-border);flex-shrink:0;">' +
        '<button class="vlk-ag-btn-primary" onclick="window._vlkAG._startQuizFlow()">🧪 Take the Quiz →</button>' +
      '</div>';
  }

  /* ── render: Detail Panel ── */
  function renderDetail(idx) {
    var ap = APPARATUS_DATA[idx];
    var allItems = getFiltered(_state.currentCategory);
    var localIdx = allItems.indexOf(ap);
    var hasPrev = localIdx > 0;
    var hasNext = localIdx < allItems.length - 1;

    return '<div class="vlk-ag-detail">' +
      '<div class="vlk-ag-detail-header">' +
        '<button class="vlk-ag-back-btn" onclick="window._vlkAG._backToGallery()">← Back to Gallery</button>' +
        '<div class="vlk-ag-detail-nav">' +
          '<button class="vlk-ag-nav-btn" ' + (hasPrev ? '' : 'disabled') + ' onclick="window._vlkAG._openDetail(' + (hasPrev ? APPARATUS_DATA.indexOf(allItems[localIdx - 1]) : 0) + ')">← Prev</button>' +
          '<button class="vlk-ag-nav-btn" ' + (hasNext ? '' : 'disabled') + ' onclick="window._vlkAG._openDetail(' + (hasNext ? APPARATUS_DATA.indexOf(allItems[localIdx + 1]) : 0) + ')">Next →</button>' +
        '</div>' +
      '</div>' +
      '<div class="vlk-ag-detail-body">' +
        '<div class="vlk-ag-detail-diagram">' + makeSVG(ap, null, 180) + '</div>' +
        '<div class="vlk-ag-detail-heading-row">' +
          '<h2 class="vlk-ag-detail-name">' + esc(ap.name) + '</h2>' +
          '<span class="' + badgeClass(ap.category) + '" style="font-size:0.72rem;padding:5px 12px;">' + esc(ap.category) + '</span>' +
        '</div>' +
        '<div class="vlk-ag-info-grid">' +
          '<div class="vlk-ag-info-card vlk-ag-info-card-primary">' +
            '<div class="vlk-ag-info-label">🔬 Primary Use</div>' +
            '<p class="vlk-ag-info-text">' + esc(ap.primaryUse) + '</p>' +
          '</div>' +
          '<div class="vlk-ag-info-card">' +
            '<div class="vlk-ag-info-label">🧪 In the Lab</div>' +
            '<p class="vlk-ag-info-text">' + esc(ap.labContext) + '</p>' +
          '</div>' +
          '<div class="vlk-ag-info-card vlk-ag-info-card-safety">' +
            '<div class="vlk-ag-info-label">⚠️ Safety Note</div>' +
            '<p class="vlk-ag-info-text">' + esc(ap.safetyNote) + '</p>' +
          '</div>' +
          '<div class="vlk-ag-info-card vlk-ag-info-card-fun">' +
            '<div class="vlk-ag-info-label">💡 Fun Fact</div>' +
            '<p class="vlk-ag-info-text">' + esc(ap.funFact) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="vlk-ag-detail-footer">' +
        '<button class="vlk-ag-btn-primary" onclick="window._vlkAG._startQuizFlow()">🧪 Take the Quiz →</button>' +
      '</div>' +
    '</div>';
  }

  /* ═══════════════════════════════════════════════════════════
     5.  QUIZ ENGINE
     ═══════════════════════════════════════════════════════════ */
  var QUESTION_TYPES = ['name-it', 'whats-it-for', 'pick-the-tool'];

  var TASK_DESCRIPTIONS = [
    { task: 'You need to add exactly 25 cm³ of sodium hydroxide solution to a flask.', answer: 'bulb-pipette' },
    { task: 'You need to control the precise amount of acid dripped into a flask during titration.', answer: 'burette' },
    { task: 'You need to protect your eyes from a chemical splash.', answer: 'safety-goggles' },
    { task: 'You need to heat a beaker of water evenly without cracking the glass.', answer: 'wire-gauze' },
    { task: 'You need to hold a burette upright and steady during an experiment.', answer: 'retort-stand' },
    { task: 'You need to transfer a spatula tip of copper sulfate crystals into a test tube.', answer: 'spatula' },
    { task: 'You need to add three drops of phenolphthalein indicator to a flask.', answer: 'dropping-pipette' },
    { task: 'You need to separate a precipitate from a solution after a reaction.', answer: 'filter-funnel' },
    { task: 'You need to rinse the inside of a burette with distilled water.', answer: 'wash-bottle' },
    { task: 'You need to record the temperature of a reaction mixture.', answer: 'thermometer' }
  ];

  function buildQuizQuestions() {
    var pool = shuffle(APPARATUS_DATA).slice(0, 10);
    var questions = [];
    var taskPool = shuffle(TASK_DESCRIPTIONS);
    var taskUsed = 0;

    for (var i = 0; i < 5; i++) {
      var type = QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];
      var ap = pool[i];
      var q = null;

      if (type === 'name-it') {
        // Show SVG → pick correct name
        var opts = [ap.name].concat(pick(ap.quizDistractors, 3));
        opts = shuffle(opts);
        q = { type: 'name-it', ap: ap, question: 'What apparatus is shown?', options: opts, correct: ap.name };

      } else if (type === 'whats-it-for') {
        // Show name → pick correct use
        var opts2 = [ap.primaryUse].concat(pick(ap.useDistractors, 3));
        opts2 = shuffle(opts2);
        q = { type: 'whats-it-for', ap: ap, question: 'What is a ' + ap.name + ' used for?', options: opts2, correct: ap.primaryUse };

      } else {
        // Pick the right tool — use a task description
        var task = taskPool[taskUsed % taskPool.length];
        taskUsed++;
        var targetAp = APPARATUS_DATA.filter(function (x) { return x.id === task.answer; })[0] || ap;
        var distractors = shuffle(APPARATUS_DATA.filter(function (x) { return x.id !== targetAp.id; })).slice(0, 3).map(function (x) { return x.name; });
        var opts3 = shuffle([targetAp.name].concat(distractors));
        q = { type: 'pick-the-tool', ap: null, question: task.task, options: opts3, correct: targetAp.name, targetAp: targetAp };
      }
      questions.push(q);
    }
    return questions;
  }

  function typeLabel(type) {
    if (type === 'name-it') return '🔍 Name It';
    if (type === 'whats-it-for') return '🔬 What\'s It For?';
    return '🛠 Pick the Right Tool';
  }

  /* ── render: Quiz Screen ── */
  function renderQuiz() {
    var q = _state.quizQuestions[_state.quizCurrent];
    var total = _state.quizQuestions.length;
    var pct = (_state.quizCurrent / total * 100).toFixed(0);

    var diagramHtml = '';
    if (q.type === 'name-it') {
      diagramHtml = '<div class="vlk-ag-quiz-diagram">' + makeSVG(q.ap, null, 140) + '</div>';
    } else if (q.type === 'pick-the-tool' && q.targetAp) {
      // No diagram for pick-the-tool (task description shown instead)
      diagramHtml = '';
    }

    var optionsHtml = '<div class="vlk-ag-options">' +
      q.options.map(function (opt, i) {
        var key = String.fromCharCode(65 + i);
        return '<button class="vlk-ag-option-btn" data-answer="' + esc(opt) + '" onclick="window._vlkAG._answerQuiz(this, \'' + esc(opt).replace(/'/g, '&#39;') + '\')">' +
          '<span class="vlk-ag-option-key">' + key + '</span>' +
          '<span>' + esc(opt) + '</span>' +
        '</button>';
      }).join('') +
    '</div>';

    return renderHeader('— Quiz (' + (_state.quizCurrent + 1) + '/' + total + ')') +
      '<div class="vlk-ag-quiz-wrap" style="flex:1;overflow:hidden;display:flex;flex-direction:column;">' +
        '<div class="vlk-ag-quiz-progress-bar-wrap">' +
          '<div class="vlk-ag-quiz-progress-label"><span>' + typeLabel(q.type) + '</span><span style="color:var(--ag-cyan);">' + (_state.quizCurrent + 1) + ' / ' + total + '</span></div>' +
          '<div class="vlk-ag-progress-track"><div class="vlk-ag-progress-fill" id="vlkAgProgressFill" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<div class="vlk-ag-quiz-body" id="vlkAgQuizBody">' +
          diagramHtml +
          '<p class="vlk-ag-question-text">' + esc(q.question) + '</p>' +
          optionsHtml +
          '<div id="vlkAgFeedback" style="display:none;"></div>' +
        '</div>' +
      '</div>';
  }

  /* ── render: Results Screen ── */
  function renderResults() {
    var score = _state.quizScore;
    var total = _state.quizQuestions.length;
    var passed = score >= 4;

    if (passed) {
      return renderHeader('— Quiz Results') +
        '<div class="vlk-ag-quiz-wrap" style="flex:1;overflow:auto;">' +
          '<div class="vlk-ag-results">' +
            '<div class="vlk-ag-results-trophy">🏆</div>' +
            '<h2 class="vlk-ag-results-title">Lab Ready!</h2>' +
            '<div class="vlk-ag-results-score">Score: ' + score + ' / ' + total + '</div>' +
            '<div class="vlk-ag-badge-earned">🎖 Apparatus Badge Earned — KCSE Ready</div>' +
            '<p style="font-family:\'Plus Jakarta Sans\',sans-serif;font-size:0.85rem;color:var(--ag-text-muted);max-width:360px;line-height:1.6;margin:0;">You\'ve demonstrated mastery of KCSE Chemistry Paper 3 apparatus. The lab bench is now unlocked.</p>' +
            '<div class="vlk-ag-results-actions">' +
              '<button class="vlk-ag-btn-primary" onclick="window.ApparatusGallery.close()">▶ Continue to Lab</button>' +
              '<button class="vlk-ag-btn-secondary" onclick="window._vlkAG._backToGallery()">Review Apparatus</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    } else {
      var missedHtml = '';
      if (_state.quizMissed.length) {
        missedHtml = '<p style="font-family:\'Plus Jakarta Sans\',sans-serif;font-size:0.82rem;color:var(--ag-text-muted);margin:0;">Review these before retrying: <strong style="color:var(--ag-text);">' + _state.quizMissed.map(function(ap){return ap.name;}).join(', ') + '</strong></p>';
      }
      return renderHeader('— Quiz Results') +
        '<div class="vlk-ag-quiz-wrap" style="flex:1;overflow:auto;">' +
          '<div class="vlk-ag-results">' +
            '<div class="vlk-ag-results-trophy">📚</div>' +
            '<h2 class="vlk-ag-results-title">Keep Studying!</h2>' +
            '<div class="vlk-ag-results-score">Score: ' + score + ' / ' + total + ' — Need 4/5 to pass</div>' +
            missedHtml +
            '<div class="vlk-ag-results-actions">' +
              '<button class="vlk-ag-btn-primary" onclick="window._vlkAG._backToGallery(true)">📖 Review Missed Apparatus</button>' +
              '<button class="vlk-ag-btn-secondary" onclick="window._vlkAG._startQuizFlow()">🔄 Retry Quiz</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
  }

  /* ── render: Intro / Welcome Screen ── */
  function renderIntro() {
    return renderHeader() +
      '<div style="flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;">' +
        '<div class="vlk-ag-intro">' +
          '<div class="vlk-ag-intro-emoji">👋</div>' +
          '<h2 class="vlk-ag-intro-title">Welcome to VirtuLab!</h2>' +
          '<p class="vlk-ag-intro-desc">Before you start, let\'s meet your lab apparatus.<br>This quick 2-minute tour will show you all the tools used in <strong>KCSE Chemistry Paper 3</strong> practicals.</p>' +
          '<div class="vlk-ag-intro-actions">' +
            '<button class="vlk-ag-btn-primary" style="width:100%;justify-content:center;" onclick="window._vlkAG._showGallery()">🔬 Start Apparatus Tour</button>' +
            '<button class="vlk-ag-btn-secondary" style="width:100%;justify-content:center;" onclick="window._vlkAG._startQuizFlow()">⚡ I already know my apparatus → Take the Quiz</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ═══════════════════════════════════════════════════════════
     6.  INTERNAL CONTROLLER (exposed as window._vlkAG)
     ═══════════════════════════════════════════════════════════ */
  var _internal = {
    _filterTo: function (cat) {
      _state.currentCategory = cat;
      _render('gallery');
    },
    _openDetail: function (idx) {
      _state.detailIndex = idx;
      _state.mode = 'detail';
      // Inject detail panel into existing modal without full re-render
      var existingDetail = _state.modalEl.querySelector('.vlk-ag-detail');
      if (existingDetail) existingDetail.parentNode.removeChild(existingDetail);
      var temp = document.createElement('div');
      temp.innerHTML = renderDetail(idx);
      while (temp.firstChild) {
        _state.modalEl.appendChild(temp.firstChild);
      }
    },
    _backToGallery: function (filterMissed) {
      if (filterMissed && _state.quizMissed.length) {
        // Filter to first missed apparatus category or just show all
        _state.currentCategory = 'All';
      }
      _render('gallery');
    },
    _showGallery: function () {
      _render('gallery');
    },
    _startQuizFlow: function () {
      _state.quizQuestions = buildQuizQuestions();
      _state.quizCurrent = 0;
      _state.quizScore = 0;
      _state.quizMissed = [];
      _state.answered = false;
      _render('quiz');
    },
    _answerQuiz: function (btn, chosen) {
      if (_state.answered) return;
      _state.answered = true;

      var q = _state.quizQuestions[_state.quizCurrent];
      var correct = q.correct;
      var isCorrect = chosen === correct;

      // Disable all buttons
      var body = document.getElementById('vlkAgQuizBody');
      if (!body) return;
      var btns = body.querySelectorAll('.vlk-ag-option-btn');
      for (var i = 0; i < btns.length; i++) {
        btns[i].disabled = true;
        if (btns[i].getAttribute('data-answer') === correct) {
          btns[i].classList.add('ag-correct');
        }
      }

      if (isCorrect) {
        _state.quizScore++;
        btn.classList.add('ag-correct');
      } else {
        btn.classList.add('ag-wrong');
        // Track missed
        var apToTrack = q.targetAp || q.ap;
        if (apToTrack && _state.quizMissed.indexOf(apToTrack) === -1) {
          _state.quizMissed.push(apToTrack);
        }
      }

      // Show feedback
      var feedbackEl = document.getElementById('vlkAgFeedback');
      if (feedbackEl) {
        var ap = q.targetAp || q.ap;
        var explanation = ap ? (isCorrect ? '✓ Correct! ' + ap.primaryUse : '✗ The correct answer is: <strong>' + esc(correct) + '</strong>. ' + (ap ? esc(ap.primaryUse) : '')) : (isCorrect ? '✓ Correct!' : '✗ The correct answer is: <strong>' + esc(correct) + '</strong>.');
        feedbackEl.className = 'vlk-ag-feedback ' + (isCorrect ? 'vlk-ag-feedback-correct' : 'vlk-ag-feedback-wrong');
        feedbackEl.innerHTML = explanation;
        feedbackEl.style.display = 'block';
      }

      // Add Next button
      var nextHtml = '<button class="vlk-ag-btn-primary vlk-ag-quiz-next-btn" onclick="window._vlkAG._nextQuestion()" style="margin-top:12px;">' +
        (_state.quizCurrent + 1 < _state.quizQuestions.length ? 'Next Question →' : 'See Results 🏆') +
      '</button>';
      if (feedbackEl && feedbackEl.parentNode) {
        var nb = document.createElement('div');
        nb.style.cssText = 'display:flex;justify-content:flex-end;';
        nb.innerHTML = nextHtml;
        feedbackEl.parentNode.insertBefore(nb, feedbackEl.nextSibling);
      }
    },
    _nextQuestion: function () {
      _state.quizCurrent++;
      _state.answered = false;
      if (_state.quizCurrent >= _state.quizQuestions.length) {
        // Quiz done — save result if passed
        var passed = _state.quizScore >= 4;
        if (passed) {
          try {
            localStorage.setItem(LS_KEY, JSON.stringify({
              passed: true,
              date: new Date().toISOString(),
              score: _state.quizScore
            }));
          } catch (e) {}
        }
        _render('results');
      } else {
        _render('quiz');
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════
     7.  RENDER ROUTER
     ═══════════════════════════════════════════════════════════ */
  function _render(screen) {
    _state.mode = screen;
    var el = _state.modalEl;
    if (!el) return;

    var html = '';
    switch (screen) {
      case 'intro':   html = renderIntro();   break;
      case 'gallery': html = renderGallery(); break;
      case 'quiz':    html = renderQuiz();    break;
      case 'results': html = renderResults(); break;
      default:        html = renderGallery(); break;
    }
    el.innerHTML = html;

    // After quiz render, animate progress bar
    if (screen === 'quiz') {
      var fill = document.getElementById('vlkAgProgressFill');
      if (fill) {
        var pct = ((_state.quizCurrent + 1) / _state.quizQuestions.length * 100).toFixed(0);
        fill.style.width = pct + '%';
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     8.  PUBLIC API
     ═══════════════════════════════════════════════════════════ */
  var ApparatusGallery = {
    APPARATUS_DATA: APPARATUS_DATA,

    open: function (options) {
      options = options || {};
      _state.mode = options.mode || 'gallery';
      _state.required = !!options.required;
      _state.onComplete = options.onComplete || null;
      _state.currentCategory = 'All';

      ensureModal();
      _state.overlayEl.style.display = 'flex';
      _state.isOpen = true;

      // Focus trap — save previous focus
      _state._prevFocus = document.activeElement;
      _state.modalEl.setAttribute('tabindex', '-1');
      setTimeout(function () { _state.modalEl.focus(); }, 50);

      _render(_state.mode);
    },

    close: function () {
      if (!_state.overlayEl) return;
      _state.overlayEl.style.display = 'none';
      _state.isOpen = false;
      _state.required = false;

      // Restore focus
      if (_state._prevFocus && _state._prevFocus.focus) {
        try { _state._prevFocus.focus(); } catch (e) {}
      }

      if (typeof _state.onComplete === 'function') {
        _state.onComplete({ passed: isQuizPassed() });
      }
    },

    startQuiz: function () {
      if (!_state.isOpen) {
        this.open({ mode: 'quiz' });
      } else {
        _internal._startQuizFlow();
      }
    },

    isQuizPassed: function () {
      return isQuizPassed();
    },

    resetProgress: function () {
      try { localStorage.removeItem(LS_KEY); } catch (e) {}
    }
  };

  /* ═══════════════════════════════════════════════════════════
     9.  EXPORT
     ═══════════════════════════════════════════════════════════ */
  root.ApparatusGallery = ApparatusGallery;
  root._vlkAG = _internal;

  /* CommonJS compat (for Node.js syntax check) */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApparatusGallery;
  }

}(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this)));

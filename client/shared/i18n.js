// ============================================================
//  VirtuLab Kenya — Internationalization (i18n) Engine
//  Feature #2: English / Kiswahili Language Translation
// ============================================================

const translations = {
  en: {
    brand_title: "VirtuLab Kenya",
    welcome: "Welcome back",
    your_badges: "Your Badges",
    your_assignments: "Your Assignments",
    leaderboard: "Class Leaderboard",
    recent_sessions: "Recent Practical Sessions",
    readiness_title: "🎯 KCSE Paper 3 Readiness Score",
    readiness_sub: "Calculated from lab accuracy, concordant titres, and syllabus coverage.",
    practice_title: "Choose Practice Mode",
    guided_mode_title: "Guided Practice Mode",
    guided_mode_desc: "Step-by-step interactive walkthrough with instant hints.",
    self_paced_title: "Self-Paced Practice",
    self_paced_desc: "Perform practicals independently with auto-scoring.",
    exam_mode_title: "KCSE Exam Mode (Paper 3)",
    exam_mode_desc: "15-minute timed exam scored out of 15 KCSE marks.",
    qualitative_title: "Qualitative Analysis Practice",
    qualitative_desc: "Identify unknown cations & anions using chemical tests.",

    // Lab Workbench
    select_experiment: "Step 1: Select Practical",
    your_task: "Your Task Brief",
    reagents: "Reagents Provided",
    choose_indicator: "Step 0: Choose Indicator",
    add_indicator_drops: "Add 2-3 Drops of Indicator",
    add_titrant: "Add Titrant (Burette Volume)",
    trial_actions: "Trial Actions",
    swirl_flask: "Swirl Flask",
    record_endpoint: "Record Endpoint",
    reset_burette: "Reset Burette",
    calc_step1: "Step 1: Average Titre",
    calc_step2: "Step 2: Concentration",
    submit_titration: "Submit Titration",
    results_table_title: "Results Table (KCSE format)",

    // Qualitative Lab
    flame_test_btn: "🔥 Perform Flame Test",
    submit_id_btn: "✅ Submit Identification",
    cation_select_label: "Cation Present",
    anion_select_label: "Anion Present",

    // Organic Chemistry Lab
    organic_lab_title: "Organic Chemistry Lab",
    organic_select_fg: "Identify Functional Group",
    bromine_test: "Bromine Water Test",
    dichromate_test: "Acidified Dichromate Test",
    carbonate_test: "Carbonate Effervescence Test",
    sodium_test: "Sodium Metal Test",
    esterification_test: "Esterification Test",

    // Solubility Lab
    solubility_lab_title: "Solubility Curves & Crystallization Lab",
    heat_to_dissolve: "🔥 Heat to Dissolve",
    cool_to_crystallize: "❄️ Cool to Crystallize",
    record_point: "📝 Record Point",
    add_water_burette: "💧 Add 2.0 cm³ Water (Burette)",
    stir_solution: "🥄 Stir Gently",
    inspect_crystals: "🔬 Inspect Crystals",
    calculated_solubility: "Calculated Solubility",
    cryst_temp: "Crystallization Temp",

    // Reaction Rates & Kinetics
    rates_lab_title: "Rates of Reaction & Chemical Kinetics",
    disappearing_cross: "Disappearing Cross",
    gas_syringe: "Gas Syringe Evolution",
    mass_loss: "Loss in Mass on Balance",
    catalysts: "Catalytic Decomposition",
    collision_theory: "Collision Theory Sandbox",
    draw_tangent: "Draw Tangent (dy/dx)",

    // Gas Preparation & Collection
    gas_lab_title: "Gas Preparation & Collection Lab",
    generate_gas: "⚡ Generate & Collect Gas",
    dry_agent: "Drying Agent",
    collect_method: "Collection Method",
    test_station: "Gas Testing Station",

    // Research & Standardized Assessment
    cpcat_title: "Chemistry Practical Competency Achievement Test (CPCAT)",
    sus_title: "System Usability Evaluation",
    tam_title: "Technology Acceptance Survey",

    // Student Hub Specific Translations
    candidate_ledger: "CANDIDATE PRACTICAL LEDGER",
    pre_lab_drill: "⚡ Pre-Lab Diagnostic Drill →",
    tab_benches: "🧪 Laboratory Benches",
    tab_reference: "📚 KCSE Revision & Reference Guide",
    tab_achievements: "🏆 Badges & Performance Ledger",
    tab_research: "🔬 Academic Research Suite",
    m_workbenches: "Workbenches",
    m_revision: "Revision",
    m_badges: "Badges",
    m_research: "Research",
    daily_bite_tag: "🌟 Daily Chemistry Bite",
    daily_bite_bonus: "+100 Bonus XP",
    daily_bite_timer: "Resets at midnight",
    daily_bite_title: "Daily Practical Diagnostic Sprint",
    daily_bite_desc: "3-question timed reflex drill on observation speed and KNEC calculations.",
    daily_bite_launch: "⚡ Start Daily Bite →",
    drills_title: "KCSE Practical Diagnostic Drills",
    drills_sub: "Choose a topic for a fast-paced timed assessment on observation reflexes:",
    drills_badge: "Formative Reflex Drills",
    drill_comp_title: "Comprehensive Review",
    drill_comp_desc: "All 45 practical competencies",
    drill_qual_title: "Qualitative Salts (Q2)",
    drill_qual_desc: "Cations, anions & flame tests",
    drill_vol_title: "Volumetric Titration (Q1)",
    drill_vol_desc: "Indicators & concordancy",
    drill_org_title: "Organic Groups (Q3)",
    drill_org_desc: "Unsaturation & alcohols",
    drill_kin_title: "Kinetics & Energetics",
    drill_kin_desc: "ΔH, rate & cooling curves",
    drill_surv_title: "Zero-Error Precision",
    drill_surv_desc: "15s sudden-death clock",
    prescribed_ca: "Prescribed Continuous Assessment",
    knec_paper3_target: "KNEC Paper 3 Target",
    mwalimu_diag_title: "Mwalimu Socratic Diagnostic",
    pedagogical_hint: "Pedagogical Hint",
    prescribed_practical: "Prescribed Practical",
    syllabus_focus: "Syllabus Focus",
    launch_prescribed: "Launch Prescribed Session →",
    pathway_heading: "KCSE Practical Chemistry Learning Pathway",
    pathway_sub: "Follow the guided mastery pathway or explore individual laboratory benches:",
    btn_learning_pathway: "Learning Pathway",
    btn_discipline_grid: "Discipline Grid",
    syllabus_mastery: "SYLLABUS MASTERY",
    ref_title: "KNEC KCSE Practical Reference Standards",
    ref_sub: "Authoritative KNEC Paper 3 observational criteria, endpoint color standards, and ion deduction reference tables.",
    ind_title: "Acid-Base Indicators Ledger",
    gas_title: "Gas Confirmatory Tests",
    cation_title: "Systematic Cation Identification & Separation",
    flame_title: "KNEC Flame Emission Spectroscopy & Cation Confirmatory Tests",
    anion_title: "Systematic Anion Identification Ledger",
    org_title: "Organic Chemistry Functional Group Reactions",
    phys_title: "Physical Chemistry Formulae & Volumetric Concordancy Rubric",
    achieve_title: "Candidate Achievements & Historical Ledger",
    achieve_sub: "Review your earned competency honors, class leaderboard standing, and complete practical examination records.",
    honors_title: "★ ACADEMIC HONORS ★",
    prodigy_title: "Chemistry Prodigy",
    prodigy_desc: "Attained for achieving ≥80% KCSE Paper 3 practical accuracy across all syllabus disciplines.",
    badges_title: "Practical Competency Badges",
    leaderboard_title: "Institutional Standings",
    recent_title: "Recent Practical Sessions",
    research_heading: "Chemistry Practical Competency Assessment & Research Suite",
    research_sub: "Standardized psychometric instruments and diagnostic evaluations for empirical efficacy measurement.",
    btn_pre_test: "📋 Take CPCAT Pre-Test",
    btn_post_test: "🏆 Take CPCAT Post-Test",
    btn_sus: "⭐ System Usability Survey (SUS)",
    btn_tam: "📊 Student TAM 3 Survey",

    // Common Buttons & Topbar
    logout: "Log out",
    scratchpad: "📝 Scratchpad",
    sound_on: "🔊 Sound ON",
    sound_muted: "🔇 Muted",
    dark_theme: "🌙 Dark",
    light_theme: "☀️ Light",
    lab_theme: "🧪 Lab",
    back: "← Back"
  },
  sw: {
    brand_title: "VirtuLab Kenya",
    welcome: "Karibu tena",
    your_badges: "Nishani Zako",
    your_assignments: "Kazi Zako za Nyumbani",
    leaderboard: "Bao la Wanafunzi Bora",
    recent_sessions: "Masomo ya Hivi Karibuni",
    readiness_title: "🎯 Usahihi wa Mtihani wa KCSE Paper 3",
    readiness_sub: "Imehesabiwa kutoka kwa usahihi wa maabara na chanjo ya mada.",
    practice_title: "Chagua Hali ya Mazoezi",
    guided_mode_title: "Mazoezi Yaliyoelekezwa",
    guided_mode_desc: "Mwongozo wa hatua kwa hatua wenye vidokezo vya papo hapo.",
    self_paced_title: "Mazoezi ya Kujitegemea",
    self_paced_desc: "Fanya majaribio peke yako na upate alama kiotomatiki.",
    exam_mode_title: "Hali ya Mtihani wa KCSE (Paper 3)",
    exam_mode_desc: "Mtihani wa dakika 15 uliopimwa kwa alama 15 za KCSE.",
    qualitative_title: "Mazoezi ya Uchunguzi wa Chumvi",
    qualitative_desc: "Tambua cation na anion zisizojulikana kwa vipimo vya kemikali.",

    // Lab Workbench
    select_experiment: "Hatua 1: Chagua Jaribio",
    your_task: "Muhtasari wa Kazi Yako",
    reagents: "Kemikali Zilizotolewa",
    choose_indicator: "Hatua 0: Chagua Indicator",
    add_indicator_drops: "Weka Matone 2-3 ya Indicator",
    add_titrant: "Ongeza Titrant (Kipimo cha Burette)",
    trial_actions: "Vitendo vya Jaribio",
    swirl_flask: "Zungusha Flask",
    record_endpoint: "Nakili Kipimo cha Mwisho",
    reset_burette: "Safi Burette",
    calc_step1: "Hatua 1: Wastani wa Titre",
    calc_step2: "Hatua 2: Ukolezi (Concentration)",
    submit_titration: "Wasilisha Titration",
    results_table_title: "Jedwali la Matokeo (Mfumo wa KCSE)",

    // Qualitative Lab
    flame_test_btn: "🔥 Fanya Jaribio la Moto",
    submit_id_btn: "✅ Wasilisha Majibu",
    cation_select_label: "Cation Iliyopo",
    anion_select_label: "Anion Iliyopo",

    // Organic Chemistry Lab
    organic_lab_title: "Maabara ya Kemia Hai",
    organic_select_fg: "Tambua Kundi la Kazi",
    bromine_test: "Jaribio la Maji ya Bromini",
    dichromate_test: "Jaribio la Dikromati yenye Asidi",
    carbonate_test: "Jaribio la Kabonati (Povu)",
    sodium_test: "Jaribio la Chuma cha Sodiamu",
    esterification_test: "Jaribio la Estifikesheni",

    // Solubility Lab
    solubility_lab_title: "Maabara ya Michoro ya Mumunyiko",
    heat_to_dissolve: "🔥 Pasha Moto Kuyeyusha",
    cool_to_crystallize: "❄️ Poza Ili Fuwele Zijitokeze",
    record_point: "📝 Nakili Halijoto ya Fuwele",
    add_water_burette: "💧 Ongeza 2.0 cm³ Maji (Burette)",
    stir_solution: "🥄 Koroga Polepole",
    inspect_crystals: "🔬 Kagua Fuwele",
    calculated_solubility: "Kiwango cha Mumunyiko",
    cryst_temp: "Halijoto ya Fuwele",

    // Reaction Rates & Kinetics
    rates_lab_title: "Kasi ya Mmenyuko na Kinetiki za Kemikali",
    disappearing_cross: "Msalaba Unaotoweka",
    gas_syringe: "Mkusanyiko wa Gesi kwenye Sindano",
    mass_loss: "Kupungua kwa Uzito kwenye Mizani",
    catalysts: "Uchachushaji wa Vichocheo",
    collision_theory: "Nadharia ya Mgongano wa Chembe",
    draw_tangent: "Chora Mstari Mguso (dy/dx)",

    // Gas Preparation & Collection
    gas_lab_title: "Maabara ya Kutengeneza na Kukusanya Gesi",
    generate_gas: "⚡ Tengeneza na Kusanya Gesi",
    dry_agent: "Dawa ya Kukaushia Gesi",
    collect_method: "Njia ya Kukusanyia",
    test_station: "Kituo cha Kupimia Gesi",

    // Research & Standardized Assessment
    cpcat_title: "Mtihani wa Umahiri wa Vitendo vya Kemia (CPCAT)",
    sus_title: "Tathmini ya Utumiaji wa Mfumo (SUS)",
    tam_title: "Utafiti wa Kukubalika kwa Teknolojia (TAM)",

    // Student Hub Specific Translations
    candidate_ledger: "DAFTARI LA VITENDO LA MTAHINIWA",
    pre_lab_drill: "⚡ Mazoezi ya Awali ya Utambuzi →",
    tab_benches: "🧪 Benchi za Maabara",
    tab_reference: "📚 Mwongozo wa Marejeleo wa KCSE",
    tab_achievements: "🏆 Nishani na Daftari la Matokeo",
    tab_research: "🔬 Mfumo wa Utafiti wa Kitaaluma",
    m_workbenches: "Maabara",
    m_revision: "Marejeleo",
    m_badges: "Nishani",
    m_research: "Utafiti",
    daily_bite_tag: "🌟 Changamoto ya Kila Siku ya Kemia",
    daily_bite_bonus: "+100 Alama za Bonasi za XP",
    daily_bite_timer: "Inaanza upya usiku wa manane",
    daily_bite_title: "Mbio za Kila Siku za Utambuzi wa Vitendo",
    daily_bite_desc: "Mazoezi ya sekunde chache yenye maswali 3 kuhusu kasi ya utambuzi na hesabu za KNEC.",
    daily_bite_launch: "⚡ Anza Changamoto →",
    drills_title: "Mazoezi ya Haraka ya Utambuzi wa KCSE",
    drills_sub: "Chagua mada kwa ajili ya mtihani wa haraka wa kupima umakini wako:",
    drills_badge: "Mazoezi ya Kuimarisha Uelewa",
    drill_comp_title: "Mapitio ya Jumla",
    drill_comp_desc: "Ujuzi wote 45 wa vitendo",
    drill_qual_title: "Uchunguzi wa Chumvi (Q2)",
    drill_qual_desc: "Cation, anion na vipimo vya moto",
    drill_vol_title: "Titration ya Kiasi (Q1)",
    drill_vol_desc: "Viashiria na usawa wa vipimo",
    drill_org_title: "Kemia Hai (Q3)",
    drill_org_desc: "Ugunduzi wa viungo vya kaboni na alkoholi",
    drill_kin_title: "Kinetiki na Nishati ya Kemikali",
    drill_kin_desc: "ΔH, kasi na michoro ya kupoa",
    drill_surv_title: "Kiwango cha Zero-Hitilafu",
    drill_surv_desc: "Saa ya sekunde 15 ya kukata na shoka",
    prescribed_ca: "Kazi Zilizopangwa za Tathmini Endelevu",
    knec_paper3_target: "Lengo la KNEC Paper 3",
    mwalimu_diag_title: "Tathmini ya Kisaikolojia ya Mwalimu",
    pedagogical_hint: "Kidokezo cha Kufundishia",
    prescribed_practical: "Jaribio Lililopendekezwa",
    syllabus_focus: "Mkazo wa Silabasi",
    launch_prescribed: "Anza Jaribio Lililopendekezwa →",
    pathway_heading: "Mwelekeo wa Kujifunza Vitendo vya Kemia vya KCSE",
    pathway_sub: "Fuata njia elekezi ya umahiri au chunguza benchi mahususi za maabara:",
    btn_learning_pathway: "Mwelekeo wa Kujifunza",
    btn_discipline_grid: "Orodha ya Benchi",
    syllabus_mastery: "UMAHIRI WA SILABASI",
    ref_title: "Viwango Rasmi vya Marejeleo ya Vitendo vya KNEC KCSE",
    ref_sub: "Vigezo vya uchunguzi vya KNEC Paper 3, viwango vya rangi ya mwisho, na majedwali ya utambuzi wa ioni.",
    ind_title: "Jedwali la Viashiria vya Asidi na Besi",
    gas_title: "Vipimo vya Kuthibitisha Gesi",
    cation_title: "Utambuzi wa Kitaratibu na Utengano wa Cation",
    flame_title: "Mawimbi ya Mwangaza wa Moto wa KNEC na Vipimo vya Cation",
    anion_title: "Jedwali la Utambuzi wa Anion",
    org_title: "Mienendo ya Vikundi vya Kazi vya Kemia Hai",
    phys_title: "Mifumo ya Kemia ya Kimwili na Mwongozo wa Usawa wa Titration",
    achieve_title: "Mafanikio ya Mtahiniwa na Kumbukumbu za Nyuma",
    achieve_sub: "Kagua nishani ulizoshinda, nafasi yako darasani, na rekodi kamili za mitihani ya vitendo.",
    honors_title: "★ NISHANI ZA KITAALUMA ★",
    prodigy_title: "Bingwa wa Kemia",
    prodigy_desc: "Imetolewa kwa kufikisha usahihi wa ≥80% katika majaribio yote ya silabasi ya KCSE Paper 3.",
    badges_title: "Nishani za Umahiri wa Vitendo",
    leaderboard_title: "Nafasi ya Shule na Darasa",
    recent_title: "Majaribio ya Hivi Karibuni ya Maabara",
    research_heading: "Mfumo wa Kutathmini Umahiri wa Vitendo na Utafiti",
    research_sub: "Zana zilizoidhinishwa za kisaikometri na tathmini za upimaji wa matokeo ya kielimu.",
    btn_pre_test: "📋 Fanya Mtihani wa Awali wa CPCAT",
    btn_post_test: "🏆 Fanya Mtihani Mkuu wa CPCAT",
    btn_sus: "⭐ Utafiti wa Utumiaji wa Mfumo (SUS)",
    btn_tam: "📊 Utafiti wa Wanafunzi wa TAM 3",

    // Common Buttons & Topbar
    logout: "Ondoka",
    scratchpad: "📝 Karatasi ya Kazi",
    sound_on: "🔊 Sauti IPO",
    sound_muted: "🔇 Kimya",
    dark_theme: "🌙 Giza",
    light_theme: "☀️ Nuru",
    lab_theme: "🧪 Maabara",
    back: "← Rudi"
  }
};

function getLanguage() {
  return localStorage.getItem('vlk_lang') || 'en';
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'sw') lang = 'en';
  localStorage.setItem('vlk_lang', lang);
  applyTranslations();
  updateLanguageButtons();
}

function t(key) {
  const lang = getLanguage();
  return (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
}

function applyTranslations() {
  const lang = getLanguage();
  const dict = translations[lang] || translations['en'];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder) el.placeholder = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });
}

function updateLanguageButtons() {
  const currentLang = getLanguage();
  document.querySelectorAll('.lang-btn-chip').forEach(btn => {
    const lang = btn.getAttribute('data-lang') || (btn.id === 'btnLangSW' ? 'sw' : 'en');
    btn.classList.toggle('active', lang === currentLang);
  });
}

// Auto-apply on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  updateLanguageButtons();
});

if (typeof window !== 'undefined') {
  window.setLanguage = setLanguage;
  window.getLanguage = getLanguage;
  window.t = t;
  window.applyTranslations = applyTranslations;
  window.updateLanguageButtons = updateLanguageButtons;
}

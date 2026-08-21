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

// ============================================================
//  VirtuLab Kenya — Canonical Qualitative Laboratory Core Module
//  High-Fidelity SVG Apparatus, Multi-Stage State Machine & Web Audio Synthesizer
//  Shared between Standalone Bench (qualitative.html) and Composite Mock Exam (composite_exam.html)
// ============================================================

(function(global) {
  'use strict';

  // ── 1. Canonical Salts Registry & Crystal Visuals ──────────────
  const SALTS = {
    ammoniumChloride: {
      key: 'ammoniumChloride',
      altKeys: ['NH4CL', 'AMMONIUM CHLORIDE', 'AMMONIUM_CHLORIDE'],
      name: 'Ammonium Chloride',
      formula: 'NH₄Cl',
      cation: 'NH4+',
      anion: 'Cl-',
      cationDisplay: 'NH₄⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White crystalline solid',
      solubility: 'Readily soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    copperSulfate: {
      key: 'copperSulfate',
      altKeys: ['CUSO4', 'COPPER SULFATE', 'COPPER(II) SULFATE', 'COPPER_SULFATE'],
      name: 'Copper(II) Sulfate',
      formula: 'CuSO₄',
      cation: 'Cu2+',
      anion: 'SO4^2-',
      cationDisplay: 'Cu²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'Blue hydrated crystalline solid (rhombic crystals)',
      solubility: 'Readily soluble in water; forms a clear sky-blue stock solution.',
      crystalColor: '#38BDF8',
      crystalSecondary: '#1D4ED8',
      crystalHighlight: '#BAE6FD'
    },
    ironSulfate: {
      key: 'ironSulfate',
      altKeys: ['FESO4', 'IRON SULFATE', 'IRON(II) SULFATE', 'IRON_SULFATE'],
      name: 'Iron(II) Sulfate',
      formula: 'FeSO₄',
      cation: 'Fe2+',
      anion: 'SO4^2-',
      cationDisplay: 'Fe²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'Pale-green crystalline solid',
      solubility: 'Readily soluble in water; forms a pale-green stock solution.',
      crystalColor: '#34D399',
      crystalSecondary: '#059669',
      crystalHighlight: '#A7F3D0'
    },
    ironChloride: {
      key: 'ironChloride',
      altKeys: ['FECL3', 'IRON CHLORIDE', 'IRON(III) CHLORIDE', 'IRON_CHLORIDE'],
      name: 'Iron(III) Chloride',
      formula: 'FeCl₃',
      cation: 'Fe3+',
      anion: 'Cl-',
      cationDisplay: 'Fe³⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'Brownish-yellow crystalline deliquescent solid',
      solubility: 'Readily soluble in water; forms a yellow-brown acidic solution.',
      crystalColor: '#F59E0B',
      crystalSecondary: '#B45309',
      crystalHighlight: '#FDE68A'
    },
    sodiumCarbonate: {
      key: 'sodiumCarbonate',
      altKeys: ['NA2CO3', 'SODIUM CARBONATE', 'SODIUM_CARBONATE'],
      name: 'Sodium Carbonate',
      formula: 'Na₂CO₃',
      cation: 'Na+',
      anion: 'CO3^2-',
      cationDisplay: 'Na⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White crystalline solid / powder',
      solubility: 'Readily soluble in water; forms a clear, alkaline stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    sodiumHydrogenCarbonate: {
      key: 'sodiumHydrogenCarbonate',
      altKeys: ['NAHCO3', 'SODIUM HYDROGEN CARBONATE', 'SODIUM_HYDROGEN_CARBONATE', 'SODIUM BICARBONATE', 'BICARBONATE', 'SODIUM_BICARBONATE'],
      name: 'Sodium Hydrogen Carbonate',
      formula: 'NaHCO₃',
      cation: 'Na+',
      anion: 'HCO3-',
      cationDisplay: 'Na⁺',
      anionDisplay: 'HCO₃⁻',
      appearance: 'White crystalline powder',
      solubility: 'Readily soluble in water; forms a clear, slightly alkaline stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    sodiumSulfite: {
      key: 'sodiumSulfite',
      altKeys: ['NA2SO3', 'SODIUM SULFITE', 'SODIUM SULPHITE', 'SODIUM_SULFITE'],
      name: 'Sodium Sulfite',
      formula: 'Na₂SO₃',
      cation: 'Na+',
      anion: 'SO3^2-',
      cationDisplay: 'Na⁺',
      anionDisplay: 'SO₃²⁻',
      appearance: 'White crystalline powder',
      solubility: 'Soluble in water; forms a clear, alkaline stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    calciumChloride: {
      key: 'calciumChloride',
      altKeys: ['CACL2', 'CALCIUM CHLORIDE', 'CALCIUM_CHLORIDE'],
      name: 'Calcium Chloride',
      formula: 'CaCl₂',
      cation: 'Ca2+',
      anion: 'Cl-',
      cationDisplay: 'Ca²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White deliquescent crystalline solid',
      solubility: 'Highly soluble in water with slight heat evolution; forms a clear stock solution.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    calciumNitrate: {
      key: 'calciumNitrate',
      altKeys: ['CA(NO3)2', 'CANO32', 'CALCIUM NITRATE', 'CALCIUM_NITRATE'],
      name: 'Calcium Nitrate',
      formula: 'Ca(NO₃)₂',
      cation: 'Ca2+',
      anion: 'NO3-',
      cationDisplay: 'Ca²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline deliquescent granules',
      solubility: 'Very soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    potassiumChloride: {
      key: 'potassiumChloride',
      altKeys: ['KCL', 'POTASSIUM CHLORIDE', 'POTASSIUM_CHLORIDE'],
      name: 'Potassium Chloride',
      formula: 'KCl',
      cation: 'K+',
      anion: 'Cl-',
      cationDisplay: 'K⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White crystalline solid (cubic granules)',
      solubility: 'Readily soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    leadNitrate: {
      key: 'leadNitrate',
      altKeys: ['PB(NO3)2', 'PBNO32', 'LEAD NITRATE', 'LEAD(II) NITRATE', 'LEAD_NITRATE'],
      name: 'Lead(II) Nitrate',
      formula: 'Pb(NO₃)₂',
      cation: 'Pb2+',
      anion: 'NO3-',
      cationDisplay: 'Pb²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White / colorless sparkling crystalline solid',
      solubility: 'Soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#94A3B8',
      crystalHighlight: '#FFFFFF'
    },
    zincSulfate: {
      key: 'zincSulfate',
      altKeys: ['ZNSO4', 'ZINC SULFATE', 'ZINC_SULFATE'],
      name: 'Zinc Sulfate',
      formula: 'ZnSO₄',
      cation: 'Zn2+',
      anion: 'SO4^2-',
      cationDisplay: 'Zn²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'White crystalline solid',
      solubility: 'Readily soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    zincNitrate: {
      key: 'zincNitrate',
      altKeys: ['ZN(NO3)2', 'ZNNO32', 'ZINC NITRATE', 'ZINC_NITRATE'],
      name: 'Zinc Nitrate',
      formula: 'Zn(NO₃)₂',
      cation: 'Zn2+',
      anion: 'NO3-',
      cationDisplay: 'Zn²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline solid (needle-like granules)',
      solubility: 'Very soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    aluminumNitrate: {
      key: 'aluminumNitrate',
      altKeys: ['AL(NO3)3', 'ALNO33', 'ALUMINUM NITRATE', 'ALUMINIUM NITRATE', 'ALUMINUM_NITRATE'],
      name: 'Aluminum Nitrate',
      formula: 'Al(NO₃)₃',
      cation: 'Al3+',
      anion: 'NO3-',
      cationDisplay: 'Al³⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline deliquescent solid',
      solubility: 'Very soluble in water; forms a clear, acidic stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    ammoniumCarbonate: {
      key: 'ammoniumCarbonate',
      altKeys: ['(NH4)2CO3', 'NH42CO3', 'AMMONIUM CARBONATE', 'AMMONIUM_CARBONATE'],
      name: 'Ammonium Carbonate',
      formula: '(NH₄)₂CO₃',
      cation: 'NH4+',
      anion: 'CO3^2-',
      cationDisplay: 'NH₄⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White translucent crystalline powder with faint ammonia odor',
      solubility: 'Readily soluble in water; forms an alkaline stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    bariumChloride: {
      key: 'bariumChloride',
      altKeys: ['BACL2', 'BARIUM CHLORIDE', 'BARIUM_CHLORIDE'],
      name: 'Barium Chloride',
      formula: 'BaCl₂',
      cation: 'Ba2+',
      anion: 'Cl-',
      cationDisplay: 'Ba²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White crystalline plates / granules',
      solubility: 'Soluble in water; forms a clear, colorless stock solution.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    potassiumBromide: {
      key: 'potassiumBromide',
      altKeys: ['KBR', 'POTASSIUM BROMIDE', 'POTASSIUM_BROMIDE'],
      name: 'Potassium Bromide',
      formula: 'KBr',
      cation: 'K+',
      anion: 'Br-',
      cationDisplay: 'K⁺',
      anionDisplay: 'Br⁻',
      appearance: 'White crystalline solid (cubic granules)',
      solubility: 'Readily soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    sodiumIodide: {
      key: 'sodiumIodide',
      altKeys: ['NAI', 'SODIUM IODIDE', 'SODIUM_IODIDE'],
      name: 'Sodium Iodide',
      formula: 'NaI',
      cation: 'Na+',
      anion: 'I-',
      cationDisplay: 'Na⁺',
      anionDisplay: 'I⁻',
      appearance: 'White deliquescent crystalline powder',
      solubility: 'Highly soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    potassiumPermanganate: {
      key: 'potassiumPermanganate',
      altKeys: ['KMNO4', 'POTASSIUM PERMANGANATE', 'POTASSIUM MANGANATE(VII)', 'POTASSIUM_PERMANGANATE', 'MANGANATE'],
      name: 'Potassium Permanganate',
      formula: 'KMnO₄',
      cation: 'K+',
      anion: 'MnO4-',
      cationDisplay: 'K⁺',
      anionDisplay: 'MnO₄⁻',
      appearance: 'Dark purple / bronze-black lustrous crystals',
      solubility: 'Readily soluble in water; forms an intense deep-purple stock solution.',
      crystalColor: '#3B0764',
      crystalSecondary: '#1E1B4B',
      crystalHighlight: '#581C87'
    },
    potassiumDichromate: {
      key: 'potassiumDichromate',
      altKeys: ['K2CR2O7', 'POTASSIUM DICHROMATE', 'POTASSIUM DICHROMATE(VI)', 'POTASSIUM_DICHROMATE'],
      name: 'Potassium Dichromate',
      formula: 'K₂Cr₂O₇',
      cation: 'K+',
      anion: 'Cr2O7^2-',
      cationDisplay: 'K⁺',
      anionDisplay: 'Cr₂O₇²⁻',
      appearance: 'Bright orange-red crystalline solid',
      solubility: 'Soluble in water; forms a clear bright-orange stock solution.',
      crystalColor: '#EA580C',
      crystalSecondary: '#C2410C',
      crystalHighlight: '#FB923C'
    },
    // ── Extended KNEC Syllabus Salts ──────────────────────────────
    magnesiumSulfate: {
      key: 'magnesiumSulfate',
      altKeys: ['MGSO4', 'MAGNESIUM SULFATE', 'MAGNESIUM SULPHATE', 'MAGNESIUM_SULFATE', 'EPSOM_SALT'],
      name: 'Magnesium Sulfate',
      formula: 'MgSO₄',
      cation: 'Mg2+',
      anion: 'SO4^2-',
      cationDisplay: 'Mg²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'White crystalline solid (hydrated prismatic crystals)',
      solubility: 'Readily soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    magnesiumChloride: {
      key: 'magnesiumChloride',
      altKeys: ['MGCL2', 'MAGNESIUM CHLORIDE', 'MAGNESIUM_CHLORIDE'],
      name: 'Magnesium Chloride',
      formula: 'MgCl₂',
      cation: 'Mg2+',
      anion: 'Cl-',
      cationDisplay: 'Mg²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White deliquescent crystalline flakes',
      solubility: 'Very soluble in water; forms a clear stock solution.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    magnesiumNitrate: {
      key: 'magnesiumNitrate',
      altKeys: ['MG(NO3)2', 'MGNO32', 'MAGNESIUM NITRATE', 'MAGNESIUM_NITRATE'],
      name: 'Magnesium Nitrate',
      formula: 'Mg(NO₃)₂',
      cation: 'Mg2+',
      anion: 'NO3-',
      cationDisplay: 'Mg²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline deliquescent solid',
      solubility: 'Readily soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    magnesiumCarbonate: {
      key: 'magnesiumCarbonate',
      altKeys: ['MGCO3', 'MAGNESIUM CARBONATE', 'MAGNESIUM_CARBONATE'],
      name: 'Magnesium Carbonate',
      formula: 'MgCO₃',
      cation: 'Mg2+',
      anion: 'CO3^2-',
      cationDisplay: 'Mg²⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White light bulky powder',
      solubility: 'Insoluble in water; dissolves in dilute acids with effervescence of CO₂.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    potassiumIodide: {
      key: 'potassiumIodide',
      altKeys: ['KI', 'POTASSIUM IODIDE', 'POTASSIUM_IODIDE'],
      name: 'Potassium Iodide',
      formula: 'KI',
      cation: 'K+',
      anion: 'I-',
      cationDisplay: 'K⁺',
      anionDisplay: 'I⁻',
      appearance: 'White crystalline solid (cubic granules)',
      solubility: 'Readily soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    potassiumNitrate: {
      key: 'potassiumNitrate',
      altKeys: ['KNO3', 'POTASSIUM NITRATE', 'POTASSIUM_NITRATE', 'SALTPETRE'],
      name: 'Potassium Nitrate',
      formula: 'KNO₃',
      cation: 'K+',
      anion: 'NO3-',
      cationDisplay: 'K⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline prism solid',
      solubility: 'Soluble in water; forms a clear, neutral solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    potassiumSulfate: {
      key: 'potassiumSulfate',
      altKeys: ['K2SO4', 'POTASSIUM SULFATE', 'POTASSIUM SULPHATE', 'POTASSIUM_SULFATE'],
      name: 'Potassium Sulfate',
      formula: 'K₂SO₄',
      cation: 'K+',
      anion: 'SO4^2-',
      cationDisplay: 'K⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'White crystalline solid / powder',
      solubility: 'Soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    potassiumCarbonate: {
      key: 'potassiumCarbonate',
      altKeys: ['K2CO3', 'POTASSIUM CARBONATE', 'POTASSIUM_CARBONATE'],
      name: 'Potassium Carbonate',
      formula: 'K₂CO₃',
      cation: 'K+',
      anion: 'CO3^2-',
      cationDisplay: 'K⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White deliquescent powder',
      solubility: 'Readily soluble in water; forms an alkaline stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    sodiumChloride: {
      key: 'sodiumChloride',
      altKeys: ['NACL', 'SODIUM CHLORIDE', 'SODIUM_CHLORIDE', 'TABLE_SALT'],
      name: 'Sodium Chloride',
      formula: 'NaCl',
      cation: 'Na+',
      anion: 'Cl-',
      cationDisplay: 'Na⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White crystalline solid (cubic crystals)',
      solubility: 'Readily soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    sodiumSulfate: {
      key: 'sodiumSulfate',
      altKeys: ['NA2SO4', 'SODIUM SULFATE', 'SODIUM SULPHATE', 'SODIUM_SULFATE'],
      name: 'Sodium Sulfate',
      formula: 'Na₂SO₄',
      cation: 'Na+',
      anion: 'SO4^2-',
      cationDisplay: 'Na⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'White crystalline powder',
      solubility: 'Soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    sodiumNitrate: {
      key: 'sodiumNitrate',
      altKeys: ['NANO3', 'SODIUM NITRATE', 'SODIUM_NITRATE', 'CHILE_SALTPETRE'],
      name: 'Sodium Nitrate',
      formula: 'NaNO₃',
      cation: 'Na+',
      anion: 'NO3-',
      cationDisplay: 'Na⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline granules',
      solubility: 'Very soluble in water; forms a clear stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    copperChloride: {
      key: 'copperChloride',
      altKeys: ['CUCL2', 'COPPER CHLORIDE', 'COPPER(II) CHLORIDE', 'COPPER_CHLORIDE'],
      name: 'Copper(II) Chloride',
      formula: 'CuCl₂',
      cation: 'Cu2+',
      anion: 'Cl-',
      cationDisplay: 'Cu²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'Blue-green deliquescent crystalline solid',
      solubility: 'Very soluble in water; forms a clear bright blue-green solution.',
      crystalColor: '#0EA5E9',
      crystalSecondary: '#0284C7',
      crystalHighlight: '#7DD3FC'
    },
    copperNitrate: {
      key: 'copperNitrate',
      altKeys: ['CU(NO3)2', 'CUNO32', 'COPPER NITRATE', 'COPPER(II) NITRATE', 'COPPER_NITRATE'],
      name: 'Copper(II) Nitrate',
      formula: 'Cu(NO₃)₂',
      cation: 'Cu2+',
      anion: 'NO3-',
      cationDisplay: 'Cu²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'Deep blue hydrated crystalline solid',
      solubility: 'Very soluble in water; forms a deep blue acidic solution.',
      crystalColor: '#2563EB',
      crystalSecondary: '#1D4ED8',
      crystalHighlight: '#93C5FD'
    },
    copperCarbonate: {
      key: 'copperCarbonate',
      altKeys: ['CUCO3', 'COPPER CARBONATE', 'COPPER(II) CARBONATE', 'COPPER_CARBONATE', 'MALACHITE'],
      name: 'Copper(II) Carbonate',
      formula: 'CuCO₃',
      cation: 'Cu2+',
      anion: 'CO3^2-',
      cationDisplay: 'Cu²⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'Fine green powder (basic copper carbonate)',
      solubility: 'Insoluble in water; dissolves in dilute acids with effervescence to form a blue solution.',
      crystalColor: '#10B981',
      crystalSecondary: '#059669',
      crystalHighlight: '#6EE7B7'
    },
    zincChloride: {
      key: 'zincChloride',
      altKeys: ['ZNCL2', 'ZINC CHLORIDE', 'ZINC_CHLORIDE'],
      name: 'Zinc Chloride',
      formula: 'ZnCl₂',
      cation: 'Zn2+',
      anion: 'Cl-',
      cationDisplay: 'Zn²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White highly deliquescent granules',
      solubility: 'Very soluble in water; forms a clear slightly acidic solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    zincCarbonate: {
      key: 'zincCarbonate',
      altKeys: ['ZNCO3', 'ZINC CARBONATE', 'ZINC_CARBONATE', 'CALAMINE'],
      name: 'Zinc Carbonate',
      formula: 'ZnCO₃',
      cation: 'Zn2+',
      anion: 'CO3^2-',
      cationDisplay: 'Zn²⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White fine amorphous powder',
      solubility: 'Insoluble in water; dissolves in dilute acids with effervescence.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    ironChlorideFe2: {
      key: 'ironChlorideFe2',
      altKeys: ['FECL2', 'IRON(II) CHLORIDE', 'FERROUS CHLORIDE', 'IRON_II_CHLORIDE'],
      name: 'Iron(II) Chloride',
      formula: 'FeCl₂',
      cation: 'Fe2+',
      anion: 'Cl-',
      cationDisplay: 'Fe²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'Pale green-yellow crystalline solid',
      solubility: 'Soluble in water; forms a pale green solution.',
      crystalColor: '#34D399',
      crystalSecondary: '#059669',
      crystalHighlight: '#A7F3D0'
    },
    ironNitrate: {
      key: 'ironNitrate',
      altKeys: ['FE(NO3)3', 'FENO33', 'IRON(III) NITRATE', 'FERRIC NITRATE', 'IRON_NITRATE'],
      name: 'Iron(III) Nitrate',
      formula: 'Fe(NO₃)₃',
      cation: 'Fe3+',
      anion: 'NO3-',
      cationDisplay: 'Fe³⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'Pale violet / brownish-yellow deliquescent crystals',
      solubility: 'Readily soluble in water; forms a brownish-yellow acidic solution.',
      crystalColor: '#D97706',
      crystalSecondary: '#B45309',
      crystalHighlight: '#FDE68A'
    },
    leadChloride: {
      key: 'leadChloride',
      altKeys: ['PBCL2', 'LEAD CHLORIDE', 'LEAD(II) CHLORIDE', 'LEAD_CHLORIDE'],
      name: 'Lead(II) Chloride',
      formula: 'PbCl₂',
      cation: 'Pb2+',
      anion: 'Cl-',
      cationDisplay: 'Pb²⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White crystalline needle-like powder',
      solubility: 'Sparingly soluble in cold water; dissolves readily in boiling water and recrystallizes on cooling.',
      crystalColor: '#F1F5F9',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    leadSulfate: {
      key: 'leadSulfate',
      altKeys: ['PBSO4', 'LEAD SULFATE', 'LEAD SULPHATE', 'LEAD(II) SULFATE', 'LEAD_SULFATE'],
      name: 'Lead(II) Sulfate',
      formula: 'PbSO₄',
      cation: 'Pb2+',
      anion: 'SO4^2-',
      cationDisplay: 'Pb²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'Dense white heavy powder',
      solubility: 'Insoluble in water and dilute acids.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    leadCarbonate: {
      key: 'leadCarbonate',
      altKeys: ['PBCO3', 'LEAD CARBONATE', 'LEAD(II) CARBONATE', 'LEAD_CARBONATE'],
      name: 'Lead(II) Carbonate',
      formula: 'PbCO₃',
      cation: 'Pb2+',
      anion: 'CO3^2-',
      cationDisplay: 'Pb²⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White heavy crystalline powder',
      solubility: 'Insoluble in water; dissolves in dilute HNO₃ with effervescence of CO₂.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    bariumNitrate: {
      key: 'bariumNitrate',
      altKeys: ['BA(NO3)2', 'BANO32', 'BARIUM NITRATE', 'BARIUM_NITRATE'],
      name: 'Barium Nitrate',
      formula: 'Ba(NO₃)₂',
      cation: 'Ba2+',
      anion: 'NO3-',
      cationDisplay: 'Ba²⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White sparkling crystalline granules',
      solubility: 'Soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    bariumSulfate: {
      key: 'bariumSulfate',
      altKeys: ['BASO4', 'BARIUM SULFATE', 'BARIUM SULPHATE', 'BARIUM_SULFATE'],
      name: 'Barium Sulfate',
      formula: 'BaSO₄',
      cation: 'Ba2+',
      anion: 'SO4^2-',
      cationDisplay: 'Ba²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'Dense white heavy powder',
      solubility: 'Completely insoluble in water and all dilute mineral acids.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    calciumCarbonate: {
      key: 'calciumCarbonate',
      altKeys: ['CACO3', 'CALCIUM CARBONATE', 'CALCIUM_CARBONATE', 'MARBLE_CHIPS', 'CHALK'],
      name: 'Calcium Carbonate',
      formula: 'CaCO₃',
      cation: 'Ca2+',
      anion: 'CO3^2-',
      cationDisplay: 'Ca²⁺',
      anionDisplay: 'CO₃²⁻',
      appearance: 'White chalky crystalline powder / chips',
      solubility: 'Insoluble in water; dissolves vigorously in dilute acids with effervescence.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    calciumSulfate: {
      key: 'calciumSulfate',
      altKeys: ['CASO4', 'CALCIUM SULFATE', 'CALCIUM SULPHATE', 'CALCIUM_SULFATE', 'GYPSUM'],
      name: 'Calcium Sulfate',
      formula: 'CaSO₄',
      cation: 'Ca2+',
      anion: 'SO4^2-',
      cationDisplay: 'Ca²⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'White crystalline solid (gypsum powder)',
      solubility: 'Sparingly soluble in water; forms a cloudy suspension.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    aluminumSulfate: {
      key: 'aluminumSulfate',
      altKeys: ['AL2(SO4)3', 'AL2SO43', 'ALUMINUM SULFATE', 'ALUMINIUM SULFATE', 'ALUMINUM_SULFATE'],
      name: 'Aluminum Sulfate',
      formula: 'Al₂(SO₄)₃',
      cation: 'Al3+',
      anion: 'SO4^2-',
      cationDisplay: 'Al³⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'White lustrous crystalline solid / powder',
      solubility: 'Readily soluble in water; forms a clear, acidic stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    aluminumChloride: {
      key: 'aluminumChloride',
      altKeys: ['ALCL3', 'ALUMINUM CHLORIDE', 'ALUMINIUM CHLORIDE', 'ALUMINUM_CHLORIDE'],
      name: 'Aluminum Chloride',
      formula: 'AlCl₃',
      cation: 'Al3+',
      anion: 'Cl-',
      cationDisplay: 'Al³⁺',
      anionDisplay: 'Cl⁻',
      appearance: 'White to yellowish crystalline powder (fumes in moist air)',
      solubility: 'Very soluble in water with slight hiss and heat evolution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF'
    },
    ammoniumNitrate: {
      key: 'ammoniumNitrate',
      altKeys: ['NH4NO3', 'AMMONIUM NITRATE', 'AMMONIUM_NITRATE'],
      name: 'Ammonium Nitrate',
      formula: 'NH₄NO₃',
      cation: 'NH4+',
      anion: 'NO3-',
      cationDisplay: 'NH₄⁺',
      anionDisplay: 'NO₃⁻',
      appearance: 'White crystalline deliquescent solid',
      solubility: 'Extremely soluble in water with marked temperature drop.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    ammoniumSulfate: {
      key: 'ammoniumSulfate',
      altKeys: ['(NH4)2SO4', 'NH42SO4', 'AMMONIUM SULFATE', 'AMMONIUM SULPHATE', 'AMMONIUM_SULFATE'],
      name: 'Ammonium Sulfate',
      formula: '(NH₄)₂SO₄',
      cation: 'NH4+',
      anion: 'SO4^2-',
      cationDisplay: 'NH₄⁺',
      anionDisplay: 'SO₄²⁻',
      appearance: 'White crystalline granules / solid',
      solubility: 'Very soluble in water; forms a clear, neutral stock solution.',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#CBD5E1',
      crystalHighlight: '#FFFFFF'
    },
    manganeseDioxide: {
      key: 'manganeseDioxide',
      altKeys: ['MNO2', 'MANGANESE DIOXIDE', 'MANGANESE_DIOXIDE', 'MANGANESE(IV) OXIDE', 'MANGANESE OXIDE', 'SOLID D', 'SOLID_D'],
      name: 'Manganese(IV) Oxide',
      formula: 'MnO₂',
      cation: 'Mn4+',
      anion: 'O2-',
      cationDisplay: 'Mn⁴⁺',
      anionDisplay: 'O²⁻',
      appearance: 'Dense black inorganic powder / granules',
      solubility: 'Insoluble in water; forms a black suspension (catalytic solid).',
      crystalColor: '#1E293B',
      crystalSecondary: '#0F172A',
      crystalHighlight: '#334155'
    },
    hydrochloricAcid: {
      key: 'hydrochloricAcid',
      altKeys: ['HCL', 'HYDROCHLORIC ACID', 'DILUTE HCL', 'DILUTE HYDROCHLORIC ACID', 'ACID'],
      name: 'Dilute Hydrochloric Acid (HCl)',
      formula: 'HCl',
      cation: 'H+',
      anion: 'Cl-',
      cationDisplay: 'H⁺',
      anionDisplay: 'Cl⁻',
      isAcid: true,
      appearance: 'Clear colourless acidic solution',
      solubility: 'Miscible in all proportions with water; turns blue litmus red.',
      liquidColor: 'rgba(255, 255, 255, 0.2)',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF',
      flameColor: null,
      flameSvgColor: null
    },
    nitricAcid: {
      key: 'nitricAcid',
      altKeys: ['HNO3', 'NITRIC ACID', 'DILUTE HNO3', 'DILUTE NITRIC ACID'],
      name: 'Dilute Nitric Acid (HNO₃)',
      formula: 'HNO₃',
      cation: 'H+',
      anion: 'NO3-',
      cationDisplay: 'H⁺',
      anionDisplay: 'NO₃⁻',
      isAcid: true,
      appearance: 'Clear colourless acidic solution',
      solubility: 'Miscible in all proportions with water; turns blue litmus red.',
      liquidColor: 'rgba(255, 255, 255, 0.2)',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF',
      flameColor: null,
      flameSvgColor: null
    },
    sulfuricAcid: {
      key: 'sulfuricAcid',
      altKeys: ['H2SO4', 'SULFURIC ACID', 'DILUTE H2SO4', 'DILUTE SULFURIC ACID'],
      name: 'Dilute Sulfuric Acid (H₂SO₄)',
      formula: 'H₂SO₄',
      cation: 'H+',
      anion: 'SO4^2-',
      cationDisplay: 'H⁺',
      anionDisplay: 'SO₄²⁻',
      isAcid: true,
      appearance: 'Clear colourless acidic solution',
      solubility: 'Miscible in all proportions with water; turns blue litmus red.',
      liquidColor: 'rgba(255, 255, 255, 0.2)',
      crystalColor: '#F8FAFC',
      crystalSecondary: '#E2E8F0',
      crystalHighlight: '#FFFFFF',
      flameColor: null,
      flameSvgColor: null
    }
  };

  /**
   * ── Dynamic Chemical Formula & Name Parser ─────────────────────
   * Parses arbitrary teacher queries into fundamental Cation + Anion pairs,
   * synthesizing complete reaction profiles dynamically on the fly.
   */
  function parseAndSynthesizeSalt(query) {
    if (!query) return null;
    const raw = String(query).trim();
    const up = raw.toUpperCase().replace(/[\s\-_]/g, '');

    // 1. Detect Cation
    let cation = null;
    let cationDisplay = '';
    let cationName = '';

    if (up.includes('PB') || up.includes('LEAD') || up.includes('PLUMB')) {
      cation = 'Pb2+'; cationDisplay = 'Pb²⁺'; cationName = 'Lead(II)';
    } else if (up.includes('CU') || up.includes('COPPER') || up.includes('CUPR')) {
      cation = 'Cu2+'; cationDisplay = 'Cu²⁺'; cationName = 'Copper(II)';
    } else if (up.includes('FE3') || up.includes('FEIII') || up.includes('IRON3') || up.includes('IRON(III)') || up.includes('FERRIC') || (up.includes('FE') && (up.includes('CL3') || up.includes('NO33')))) {
      cation = 'Fe3+'; cationDisplay = 'Fe³⁺'; cationName = 'Iron(III)';
    } else if (up.includes('FE2') || up.includes('FEII') || up.includes('IRON2') || up.includes('IRON(II)') || up.includes('FERROUS') || up.includes('FE')) {
      cation = 'Fe2+'; cationDisplay = 'Fe²⁺'; cationName = 'Iron(II)';
    } else if (up.includes('AL') || up.includes('ALUMIN')) {
      cation = 'Al3+'; cationDisplay = 'Al³⁺'; cationName = 'Aluminum';
    } else if (up.includes('ZN') || up.includes('ZINC')) {
      cation = 'Zn2+'; cationDisplay = 'Zn²⁺'; cationName = 'Zinc';
    } else if (up.includes('CA') || up.includes('CALCI')) {
      cation = 'Ca2+'; cationDisplay = 'Ca²⁺'; cationName = 'Calcium';
    } else if (up.includes('MG') || up.includes('MAGNESI')) {
      cation = 'Mg2+'; cationDisplay = 'Mg²⁺'; cationName = 'Magnesium';
    } else if (up.includes('BA') || up.includes('BARI')) {
      cation = 'Ba2+'; cationDisplay = 'Ba²⁺'; cationName = 'Barium';
    } else if (up.includes('NH4') || up.includes('AMMONI')) {
      cation = 'NH4+'; cationDisplay = 'NH₄⁺'; cationName = 'Ammonium';
    } else if (up.includes('NA') || up.includes('SODI')) {
      cation = 'Na+'; cationDisplay = 'Na⁺'; cationName = 'Sodium';
    } else if (up.includes('POTASSI') || (up.startsWith('K') && up.length <= 4) || up.includes('KNO3') || up.includes('KCL') || up.includes('KBR') || up.includes('KI') || up.includes('K2SO4') || up.includes('K2CO3')) {
      cation = 'K+'; cationDisplay = 'K⁺'; cationName = 'Potassium';
    } else if (up.includes('MN4') || up.includes('MANGANESE4') || up.includes('MANGANESE(IV)') || up.includes('MNO2')) {
      cation = 'Mn4+'; cationDisplay = 'Mn⁴⁺'; cationName = 'Manganese(IV)';
    } else if (up.includes('MN') || up.includes('MANGAN')) {
      cation = 'Mn2+'; cationDisplay = 'Mn²⁺'; cationName = 'Manganese(II)';
    } else if (up.includes('HCL') || up.includes('HNO3') || up.includes('H2SO4') || up.includes('HYDROCHLORIC') || up.includes('NITRIC') || up.includes('SULFURIC') || up.startsWith('H+') || up === 'ACID' || up.includes('DILUTEACID')) {
      cation = 'H+'; cationDisplay = 'H⁺'; cationName = 'Hydrogen (Acid)';
    }

    // 2. Detect Anion
    let anion = null;
    let anionDisplay = '';
    let anionName = '';

    if (up.includes('HCO3') || up.includes('HYDROGENCARBONAT') || up.includes('BICARBONAT')) {
      anion = 'HCO3-'; anionDisplay = 'HCO₃⁻'; anionName = 'Hydrogen Carbonate';
    } else if (up.includes('CO3') || up.includes('CARBONAT')) {
      anion = 'CO3^2-'; anionDisplay = 'CO₃²⁻'; anionName = 'Carbonate';
    } else if (up.includes('SO3') || up.includes('SULFIT') || up.includes('SULPHIT')) {
      anion = 'SO3^2-'; anionDisplay = 'SO₃²⁻'; anionName = 'Sulfite';
    } else if (up.includes('SO4') || up.includes('SULFAT') || up.includes('SULPHAT')) {
      anion = 'SO4^2-'; anionDisplay = 'SO₄²⁻'; anionName = 'Sulfate';
    } else if (up.includes('NO3') || up.includes('NITRAT')) {
      anion = 'NO3-'; anionDisplay = 'NO₃⁻'; anionName = 'Nitrate';
    } else if (up.includes('CL') || up.includes('CHLORI')) {
      anion = 'Cl-'; anionDisplay = 'Cl⁻'; anionName = 'Chloride';
    } else if (up.includes('BR') || up.includes('BROMI')) {
      anion = 'Br-'; anionDisplay = 'Br⁻'; anionName = 'Bromide';
    } else if (up.includes('IODI') || up.includes('NAI') || up.includes('KI') || up.includes('I2') || up.includes('I3') || /I\d*$/.test(up)) {
      anion = 'I-'; anionDisplay = 'I⁻'; anionName = 'Iodide';
    } else if (up.includes('OXIDE') || up.includes('O2') || /O\d*$/.test(up)) {
      anion = 'O2-'; anionDisplay = 'O²⁻'; anionName = 'Oxide';
    }

    if (!cation && !anion) return null;

    // Fallbacks if one was detected but not the other
    if (!cation) { cation = 'Na+'; cationDisplay = 'Na⁺'; cationName = 'Sodium'; }
    if (!anion) { anion = 'NO3-'; anionDisplay = 'NO₃⁻'; anionName = 'Nitrate'; }

    const key = (cationName.toLowerCase().replace(/[^a-z0-9]/g, '') + anionName.replace(/[^a-z0-9]/gi, ''));
    const name = (cation === 'H+') ? `Dilute ${anionName === 'Chloride' ? 'Hydrochloric' : anionName === 'Nitrate' ? 'Nitric' : anionName === 'Sulfate' ? 'Sulfuric' : anionName} Acid` : `${cationName} ${anionName}`;

    // Compute Appearance & Crystal Colors based on inorganic transition chemistry
    let crystalColor = '#F8FAFC';
    let crystalSecondary = '#CBD5E1';
    let crystalHighlight = '#FFFFFF';
    let appearance = 'White crystalline solid / powder';

    if (cation === 'H+') {
      appearance = 'Clear colourless acidic solution';
    } else if (cation === 'Mn4+' || up.includes('MNO2')) {
      crystalColor = '#1E293B'; crystalSecondary = '#0F172A'; crystalHighlight = '#334155';
      appearance = 'Dense black inorganic powder / granules (catalytic solid)';
    } else if (cation === 'Cu2+') {
      crystalColor = '#38BDF8'; crystalSecondary = '#0284C7'; crystalHighlight = '#BAE6FD';
      appearance = (anion === 'CO3^2-') ? 'Fine green powder (basic carbonate)' : 'Blue/green crystalline solid';
    } else if (cation === 'Fe2+') {
      crystalColor = '#34D399'; crystalSecondary = '#059669'; crystalHighlight = '#A7F3D0';
      appearance = 'Pale green crystalline solid';
    } else if (cation === 'Fe3+') {
      crystalColor = '#F59E0B'; crystalSecondary = '#B45309'; crystalHighlight = '#FDE68A';
      appearance = 'Yellow-brown / reddish-brown crystalline solid';
    }

    // Compute Solubility according to KNEC Qualitative rules
    let solubility = 'Readily soluble in water; forms a clear stock solution.';
    if (cation === 'H+') {
      solubility = 'Miscible completely in water; turns blue litmus red.';
    } else if (cation === 'Mn4+' || anion === 'O2-') {
      solubility = 'Insoluble in water; forms an insoluble black solid / catalyst.';
    } else if (anion === 'CO3^2-') {
      if (cation === 'Na+' || cation === 'K+' || cation === 'NH4+') {
        solubility = 'Readily soluble in water; forms an alkaline stock solution.';
      } else {
        solubility = 'Insoluble in water; dissolves in dilute mineral acids with effervescence of CO₂.';
      }
    } else if (anion === 'SO4^2-') {
      if (cation === 'Ba2+' || cation === 'Pb2+') {
        solubility = 'Insoluble in water and dilute acids.';
      } else if (cation === 'Ca2+') {
        solubility = 'Sparingly soluble in water; forms a cloudy suspension.';
      }
    } else if (anion === 'Cl-') {
      if (cation === 'Pb2+') {
        solubility = 'Sparingly soluble in cold water; dissolves readily in hot water and recrystallizes on cooling.';
      }
    }

    const dynamicSalt = {
      key,
      altKeys: [raw.toUpperCase(), up, name.toUpperCase()],
      name,
      formula: `${cationDisplay}${anionDisplay}`,
      cation,
      anion,
      cationDisplay,
      anionDisplay,
      appearance,
      solubility,
      crystalColor,
      crystalSecondary,
      crystalHighlight,
      isAcid: cation === 'H+',
      isDynamic: true
    };

    SALTS[key] = dynamicSalt;
    return dynamicSalt;
  }

  function resolveSalt(saltKey) {
    if (!saltKey) return SALTS.leadNitrate;
    if (SALTS[saltKey]) return SALTS[saltKey];
    const raw = String(saltKey).toUpperCase().replace(/[\s\-_]/g, '');
    const norm = raw.startsWith('SALT') && raw.length > 4 ? raw.slice(4) : raw;
    for (const key in SALTS) {
      const salt = SALTS[key];
      if (salt.key.toUpperCase() === norm || salt.key.toUpperCase() === raw) return salt;
      if (salt.formula && salt.formula.toUpperCase().replace(/[\s\-_()]/g, '') === norm.replace(/[()]/g, '')) return salt;
      if (salt.altKeys && salt.altKeys.some(k => {
        const alt = k.toUpperCase().replace(/[\s\-_()]/g, '');
        return alt === norm || alt === raw;
      })) return salt;
    }

    // Dynamic first-principles synthesis before fallback
    const synthesized = parseAndSynthesizeSalt(saltKey);
    if (synthesized) return synthesized;

    // Fuzzy matching fallback
    if (norm.includes('ZN')) return SALTS.zincSulfate;
    if (norm.includes('PB')) return SALTS.leadNitrate;
    if (norm.includes('CU')) return SALTS.copperSulfate;
    if (norm.includes('FE') && (norm.includes('3') || norm.includes('CL'))) return SALTS.ironChloride;
    if (norm.includes('FE')) return SALTS.ironSulfate;
    if (norm.includes('CA') && norm.includes('NO3')) return SALTS.calciumNitrate;
    if (norm.includes('CA')) return SALTS.calciumChloride;
    if (norm.includes('MG')) return SALTS.magnesiumSulfate;
    if (norm.includes('NH4') && norm.includes('CO3')) return SALTS.ammoniumCarbonate;
    if (norm.includes('NH4')) return SALTS.ammoniumChloride;
    if (norm.includes('BA')) return SALTS.bariumChloride;
    if (norm.includes('AL')) return SALTS.aluminumNitrate;
    if (norm.includes('SO3') || norm.includes('SULFITE') || norm.includes('SULPHITE')) return SALTS.sodiumSulfite;
    if (norm.includes('BR') || norm.includes('BROMIDE')) return SALTS.potassiumBromide;
    if (norm.includes('NAI') || (norm.includes('IODIDE') && norm.includes('NA'))) return SALTS.sodiumIodide;
    if (norm.includes('KI') || norm.includes('POTASSIUMIODIDE')) return SALTS.potassiumIodide;
    return SALTS.leadNitrate;
  }

  // ── 2. Procedural Web Audio API Synthesizer ────────────────────
  let audioCtx = null;

  function isAudioMuted() {
    return localStorage.getItem('vlk_muted') === 'true';
  }

  function getAudioContext() {
    if (isAudioMuted()) return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playDropSplashSound(isExcess = false) {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // 1. Subtle pipette bulb squeeze click at t=0
    try {
      const now = ctx.currentTime;
      const squeezeOsc = ctx.createOscillator();
      const squeezeGain = ctx.createGain();
      squeezeOsc.type = 'sine';
      squeezeOsc.frequency.setValueAtTime(360, now);
      squeezeOsc.frequency.exponentialRampToValueAtTime(180, now + 0.035);
      squeezeGain.gain.setValueAtTime(0.04, now);
      squeezeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
      squeezeOsc.connect(squeezeGain);
      squeezeGain.connect(ctx.destination);
      squeezeOsc.start(now);
      squeezeOsc.stop(now + 0.04);
    } catch(e) {}

    // 2. High-fidelity acoustic liquid droplet impact synthesis
    function triggerSingleDropSplash(pitchBase = 780, volume = 0.28) {
      try {
        const t = ctx.currentTime;
        // Minnaert bubble cavity resonance
        const bubbleOsc = ctx.createOscillator();
        const bubbleGain = ctx.createGain();
        bubbleOsc.type = 'sine';
        bubbleOsc.frequency.setValueAtTime(pitchBase, t);
        bubbleOsc.frequency.exponentialRampToValueAtTime(pitchBase * 2.35, t + 0.046);
        bubbleGain.gain.setValueAtTime(volume, t);
        bubbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.054);
        bubbleOsc.connect(bubbleGain);
        bubbleGain.connect(ctx.destination);
        bubbleOsc.start(t);
        bubbleOsc.stop(t + 0.058);

        // Surface tension rupture transient pop
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(3200, t);
        popOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.012);
        popGain.gain.setValueAtTime(volume * 0.5, t);
        popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(t);
        popOsc.stop(t + 0.018);

        // Glass vessel body resonance
        const glassOsc = ctx.createOscillator();
        const glassGain = ctx.createGain();
        glassOsc.type = 'sine';
        glassOsc.frequency.setValueAtTime(1550, t);
        glassGain.gain.setValueAtTime(volume * 0.16, t);
        glassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        glassOsc.connect(glassGain);
        glassGain.connect(ctx.destination);
        glassOsc.start(t);
        glassOsc.stop(t + 0.075);
      } catch(e) {}
    }

    // Schedule droplet impact at 350ms (synchronously matches 0.36s visual drop impact)
    setTimeout(() => {
      triggerSingleDropSplash(780, 0.28);
    }, 350);

    // If excess reagent added, schedule secondary and tertiary trailing droplets
    if (isExcess) {
      setTimeout(() => { triggerSingleDropSplash(920, 0.22); }, 480);
      setTimeout(() => { triggerSingleDropSplash(1060, 0.16); }, 590);
    }
  }

  function playEffervescenceSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.sin(i / 120));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  function playFlameSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.7);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.75);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  function playCrystalInspectSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch(e) {}
  }

  function playDecrepitationSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      // Violent crystalline decrepitation: burst of randomized sharp snapping pops & clicks
      const now = ctx.currentTime;
      const popsCount = 10;
      for (let i = 0; i < popsCount; i++) {
        const popTime = now + (i * 0.045) + (Math.random() * 0.025);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = Math.random() > 0.4 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(900 + Math.random() * 1900, popTime);
        osc.frequency.exponentialRampToValueAtTime(140 + Math.random() * 180, popTime + 0.025);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400 + Math.random() * 1600, popTime);
        filter.Q.setValueAtTime(4.5, popTime);

        gain.gain.setValueAtTime(0.24, popTime);
        gain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.03);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(popTime);
        osc.stop(popTime + 0.035);
      }
    } catch(e) {}
  }

  function playSplintRelightSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // 1. Initial low ignition pop ("thump")
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      oscGain.gain.setValueAtTime(0.38, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      // 2. White noise rushing "fwoosh" flame burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.55);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.18));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.45);
      filter.Q.setValueAtTime(1.8, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch(e) {}
  }

  function playDropletSizzleSound() {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.4);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch(e) {}
  }

  // ── 3. Reaction Physics & State Resolver ───────────────────────
  function resolveReactionState(saltKey, testId, stage = 'idle', prompt = '', obsStr = '', options = {}) {
    if (typeof obsStr === 'object' && obsStr !== null) {
      options = obsStr;
      obsStr = '';
    }
    const salt = resolveSalt(saltKey);
    const pStr = (prompt || '').toLowerCase();
    const oStr = (obsStr || '').toLowerCase();
    const tId = (testId || '').toLowerCase();

    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const isExcess = stage === 'excess' || stage === 'step3_nh3' || stage === 'step2_bacl2' || stage === 'step2_gas_warm' || (stage !== 'few_drops' && stage !== 'step1' && pStr.includes('excess'));
    const isStep1 = stage === 'few_drops' || stage === 'step1' || stage === 'step1_hno3' || stage === 'step1_acid' || stage === 'step1_hcl' || stage === 'step1_feso4' || stage === 'inspected';
    const isHeated = stage === 'heated' || stage === 'warm' || stage === 'step2_warm' || (!isStep1 && stage !== 'cooled' && stage !== 'few_drops' && stage !== 'idle' && (tId.includes('heat') || tId.includes('ignit') || (pStr.includes('heat') && !pStr.includes('portion') && !pStr.includes('drop'))));
    const isCooled = stage === 'cooled' || stage === 'step3_cool' || stage === 'cool_down';

    const cation = salt.cation;
    const anion = salt.anion;

    // Detect specialized test types
    const isPhysicalAppearance =
      pStr.includes('physical appearance') ||
      pStr.includes('appearance of solid') ||
      pStr.includes('describe solid') ||
      pStr.includes('appearance of sample') ||
      (pStr.includes('appearance') && !pStr.includes('dissolv') && !pStr.includes('water')) ||
      (tId.includes('appearance') && !pStr.includes('water')) ||
      (tId === 't1' && pStr.includes('describe') && pStr.includes('solid'));

    const isDissolving = !isPhysicalAppearance && (
      pStr.includes('dissolv') ||
      (pStr.includes('water') && (pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('portion')))
    );

    const isFlameTest =
      pStr.includes('flame test') ||
      pStr.includes('nichrome') ||
      (pStr.includes('glass rod') && (pStr.includes('flame') || pStr.includes('bunsen'))) ||
      (pStr.includes('solution') && pStr.includes('flame') && !pStr.includes('heat') && !pStr.includes('warm')) ||
      tId.includes('flame');

    const isHeat = !isFlameTest && (
      (pStr.includes('heat') && (pStr.includes('dry') || pStr.includes('strongly') || pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('test tube'))) ||
      tId.includes('heat') ||
      tId.includes('ignit')
    );

    const isAgNO3 = tId.includes('agno3') || pStr.includes('silver nitrate') || pStr.includes('agno3') || (pStr.includes('hno3') && pStr.includes('silver'));
    const isBaCl2 = tId.includes('bacl2') || tId.includes('barium') || pStr.includes('barium') || pStr.includes('ba(no3)2') || pStr.includes('bacl2');
    const isPbNO3 = tId.includes('pb_no3') || tId.includes('pbno3') || (pStr.includes('lead') && (pStr.includes('nitrate') || pStr.includes('(ii)'))) || pStr.includes('pb(no3)2') || pStr.includes('pb(no₃)₂');
    const isNaOH = tId.includes('naoh') || pStr.includes('naoh') || pStr.includes('sodium hydroxide');
    const isNH3 = !isAgNO3 && !isPbNO3 && (tId.includes('nh3') || pStr.includes('ammonia') || pStr.includes('nh₃') || pStr.includes('nh3'));
    const isKI = tId.includes('ki') || pStr.includes('potassium iodide') || pStr.includes('iodide');
    const isBrownRing = tId.includes('brown_ring') || tId.includes('ring') || (pStr.includes('feso4') && pStr.includes('h2so4')) || pStr.includes('brown ring');
    const isH2SO4 = tId.includes('h2so4') || pStr.includes('h2so4') || pStr.includes('sulfuric') || pStr.includes('sulphuric');
    const isNaHCO3 = tId.includes('nahco3') || tId.includes('hydrogencarbonate') || tId.includes('bicarbonate') ||
      pStr.includes('nahco3') || pStr.includes('sodium hydrogen carbonate') || pStr.includes('sodium hydrogencarbonate') ||
      pStr.includes('bicarbonate') || (pStr.includes('solid') && (pStr.includes('carbonate') || pStr.includes('nahco3')));
    const isHCl = !isNaHCO3 && (tId.includes('hcl') || tId.includes('acid') || pStr.includes('hydrochloric') || (!pStr.includes('nahco3') && !pStr.includes('carbonate') && pStr.includes('limewater')));
    const isResidueTest = tId.includes('residue') || pStr.includes('residue');
    const isH2O2 = tId.includes('h2o2') || tId.includes('peroxide') || pStr.includes('hydrogen peroxide') || pStr.includes('h2o2') || pStr.includes('h₂o₂');
    const isZincDisplacement = tId.includes('displacement') || tId.includes('zinc_dust') ||
      pStr.includes('zinc dust') || pStr.includes('zinc powder') || pStr.includes('solid e') ||
      (pStr.includes('zinc') && (pStr.includes('shake') || pStr.includes('filtrate') || pStr.includes('dust')));

    let liquidColor = 'rgba(56, 189, 248, 0.25)';
    let ppt = false;
    let pptColor = '#FFFFFF';
    let pptDissolved = false;
    let bubbling = false;
    let complexDeepBlue = false;
    let statusLabel = 'Reaction Observed';
    let soundType = 'drop';

    // Thermal physics for dry heating in hard-glass tube
    let sublimes = false;
    let gasType = null;
    let gasColor = null;
    let residueColor = null;
    let waterCondenses = false;
    let decrepitates = false;
    let evolvesO2 = false;
    let evolvesNO2 = false;
    let evolvesNH3 = false;
    let evolvesCO2 = false;
    let evolvesSO2 = false;
    let decomposesCompletely = false;
    let residueColorHot = salt.crystalColor || '#FFFFFF';
    let residueColorCold = salt.crystalColor || '#FFFFFF';

    if (performed) {
      if (isBrownRing) {
        // Handled in SVG generator
      } else if (isKI) {
        if (cation === 'Pb2+') {
          ppt = !isHeated;
          pptColor = '#FACC15'; // Bright yellow
          liquidColor = isHeated ? 'rgba(250, 204, 21, 0.55)' : 'rgba(234, 179, 8, 0.35)';
          statusLabel = isHeated ? 'Warmed: Yellow precipitate dissolves to clear hot solution' : (isCooled ? 'Cooled: Golden shimmering spangles recrystallized' : 'Few Drops: Bright yellow precipitate formed (PbI₂)');
        } else {
          liquidColor = 'rgba(250, 204, 21, 0.2)';
          statusLabel = 'No precipitate formed';
        }
      } else if (isNaOH) {
        if (cation === 'Pb2+' || cation === 'Al3+' || cation === 'Zn2+') {
          if (isExcess) {
            pptDissolved = true;
            liquidColor = 'rgba(255, 255, 255, 0.2)';
            statusLabel = `In Excess: White ppt dissolves to form clear colorless solution ([${cation === 'Pb2+' ? 'Pb(OH)₄' : cation === 'Al3+' ? 'Al(OH)₄' : 'Zn(OH)₄'}]²⁻)`;
          } else {
            ppt = true;
            pptColor = '#FFFFFF';
            statusLabel = 'Few Drops: White precipitate formed';
          }
        } else if (cation === 'Ca2+' || cation === 'Mg2+') {
          ppt = true;
          pptColor = '#FFFFFF';
          statusLabel = isExcess ? 'In Excess: White precipitate insoluble' : 'Few Drops: White precipitate formed';
        } else if (cation === 'Cu2+') {
          ppt = true;
          pptColor = '#38BDF8'; // Pale blue
          statusLabel = isExcess ? 'In Excess: Pale blue precipitate insoluble' : 'Few Drops: Pale blue precipitate formed (Cu(OH)₂)';
        } else if (cation === 'Fe2+') {
          ppt = true;
          pptColor = '#15803D'; // Dirty green
          statusLabel = isExcess ? 'In Excess: Dirty-green precipitate insoluble' : 'Few Drops: Dirty-green precipitate formed (Fe(OH)₂)';
        } else if (cation === 'Fe3+') {
          ppt = true;
          pptColor = '#991B1B'; // Reddish-brown
          statusLabel = isExcess ? 'In Excess: Reddish-brown precipitate insoluble' : 'Few Drops: Reddish-brown precipitate formed (Fe(OH)₃)';
        } else if (cation === 'Mn2+' || cation === 'Mn4+' || pStr.includes('solid d') || pStr.includes('mno2')) {
          ppt = true;
          pptColor = '#991B1B'; // Oxidizes rapidly in air to dark reddish-brown hydrated MnO2
          statusLabel = isExcess ? 'In Excess: Reddish-brown precipitate insoluble' : 'Few Drops: Precipitate formed rapidly darkening to reddish-brown in air';
        } else if (cation === 'NH4+' || cation === 'Na+' || cation === 'K+') {
          bubbling = isHeated;
          statusLabel = (cation === 'NH4+' && isHeated)
            ? 'Warmed: Pungent gas evolved (NH₃) turning moist red litmus blue'
            : 'No precipitate formed';
        }
      } else if (isNH3) {
        if (cation === 'Zn2+') {
          if (isExcess) {
            pptDissolved = true;
            liquidColor = 'rgba(255, 255, 255, 0.2)';
            statusLabel = 'In Excess: White precipitate dissolves to form colorless solution ([Zn(NH₃)₄]²⁺)';
          } else {
            ppt = true;
            pptColor = '#FFFFFF';
            statusLabel = 'Few Drops: White precipitate formed';
          }
        } else if (cation === 'Pb2+' || cation === 'Al3+' || cation === 'Mg2+') {
          ppt = true;
          pptColor = '#FFFFFF';
          statusLabel = isExcess ? 'In Excess: White precipitate insoluble' : 'Few Drops: White precipitate formed';
        } else if (cation === 'Cu2+') {
          if (isExcess) {
            pptDissolved = true;
            complexDeepBlue = true;
            liquidColor = '#1D4ED8';
            statusLabel = 'In Excess: Pale blue ppt dissolves to form deep royal blue solution ([Cu(NH₃)₄]²⁺)';
          } else {
            ppt = true;
            pptColor = '#38BDF8';
            statusLabel = 'Few Drops: Pale blue precipitate formed';
          }
        } else if (cation === 'Fe2+') {
          ppt = true;
          pptColor = '#15803D';
          statusLabel = isExcess ? 'In Excess: Dirty green precipitate insoluble' : 'Few Drops: Dirty green precipitate formed';
        } else if (cation === 'Fe3+') {
          ppt = true;
          pptColor = '#991B1B';
          statusLabel = isExcess ? 'In Excess: Reddish-brown precipitate insoluble' : 'Few Drops: Reddish-brown precipitate formed';
        } else if (cation === 'Mn2+' || cation === 'Mn4+' || pStr.includes('solid d') || pStr.includes('mno2')) {
          ppt = true;
          pptColor = '#991B1B';
          statusLabel = isExcess ? 'In Excess: Reddish-brown precipitate insoluble' : 'Few Drops: Precipitate formed rapidly darkening to reddish-brown in air';
        } else if (cation === 'Ca2+' || cation === 'NH4+' || cation === 'Na+' || cation === 'K+' || cation === 'Ba2+') {
          statusLabel = 'No precipitate formed with drops or excess NH₃';
        }
      } else if (isAgNO3) {
        if (anion === 'Cl-' || anion === 'Cl⁻' || (anion && anion.includes('Cl')) || oStr.includes('agcl') || oStr.includes('white precipitate') || oStr.includes('white ppt')) {
          if (stage === 'step3_nh3' || isExcess) {
            pptDissolved = true;
            liquidColor = 'rgba(255, 255, 255, 0.2)';
            statusLabel = 'In Aqueous NH₃: White AgCl precipitate readily dissolves';
          } else if (stage === 'step2_agno3' || !isStep1) {
            ppt = true;
            pptColor = '#FFFFFF';
            statusLabel = 'AgNO₃ Added: Dense white precipitate of AgCl formed';
          } else {
            statusLabel = 'Dilute HNO₃ Added: Acidified stock solution';
          }
        } else if (anion === 'Br-' || anion === 'Br⁻' || (anion && anion.includes('Br')) || oStr.includes('agbr') || oStr.includes('cream')) {
          if (stage === 'step3_nh3' || isExcess) {
            ppt = true;
            pptDissolved = false;
            pptColor = '#FEF08A';
            statusLabel = 'In Aqueous NH₃: Pale cream precipitate is sparingly soluble';
          } else if (stage === 'step2_agno3' || !isStep1) {
            ppt = true;
            pptColor = '#FEF08A';
            statusLabel = 'AgNO₃ Added: Pale cream precipitate of AgBr formed';
          } else {
            statusLabel = 'Dilute HNO₃ Added: Acidified stock solution';
          }
        } else if (anion === 'I-' || anion === 'I⁻' || (anion && anion.includes('I')) || oStr.includes('agi') || oStr.includes('yellow ppt') || oStr.includes('bright yellow')) {
          if (stage === 'step3_nh3' || isExcess) {
            ppt = true;
            pptDissolved = false;
            pptColor = '#FACC15';
            statusLabel = 'In Aqueous NH₃: Yellow precipitate remains completely insoluble';
          } else if (stage === 'step2_agno3' || !isStep1) {
            ppt = true;
            pptColor = '#FACC15';
            statusLabel = 'AgNO₃ Added: Bright yellow precipitate of AgI formed';
          } else {
            statusLabel = 'Dilute HNO₃ Added: Acidified stock solution';
          }
        } else {
          statusLabel = 'No precipitate formed';
        }
      } else if (isBaCl2) {
        if (anion === 'SO3^2-' || anion === 'SO32-' || (anion && anion.includes('SO3')) || oStr.includes('baso3') || (oStr.includes('white precipitate') && oStr.includes('dissolv'))) {
          if (stage === 'step2_bacl2' || !isStep1) {
            ppt = true;
            pptColor = '#FFFFFF';
            if (stage === 'excess' || stage === 'step2_acid' || stage === 'acid' || isExcess || pStr.includes('acid') || pStr.includes('hcl') || oStr.includes('dissolv')) {
              pptDissolved = true;
              bubbling = true;
              statusLabel = 'Dilute Acid Added: White BaSO₃ precipitate dissolves with effervescence of pungent SO₂ gas';
            } else {
              statusLabel = 'Ba²⁺ Added: White precipitate of BaSO₃ formed (dissolves in acid)';
            }
          }
        } else if (anion === 'CO3^2-' || anion === 'CO32-' || anion === 'HCO3-' || (anion && (anion.includes('CO3') || anion.includes('HCO3')))) {
          if (isStep1) {
            bubbling = true;
            statusLabel = 'Acid Added: Vigorous effervescence of CO₂ gas';
          }
        } else if (anion === 'SO4^2-' || anion === 'SO42-' || (anion && anion.includes('SO4')) || oStr.includes('baso4') || oStr.includes('white precipitate') || oStr.includes('white ppt')) {
          ppt = true;
          pptColor = '#FFFFFF';
          statusLabel = (pStr.includes('acid') || pStr.includes('hno3') || pStr.includes('hcl') || oStr.includes('insoluble'))
            ? 'Ba²⁺ & Dilute Acid Added: Dense white precipitate of BaSO₄ formed (insoluble in dilute acid)'
            : 'Ba²⁺ Added: Dense white precipitate of BaSO₄ formed';
        } else {
          statusLabel = 'No precipitate formed';
        }
      } else if (isPbNO3) {
        // KNEC Standard Method for Halides & Anions: Lead(II) Nitrate with warming & cooling
        const isChloride = anion === 'Cl-' || anion === 'Cl⁻' || (anion && anion.includes('Cl')) || oStr.includes('pbcl2') || oStr.includes('chloride');
        const isSulfate = anion === 'SO4^2-' || anion === 'SO42-' || (anion && anion.includes('SO4')) || oStr.includes('pbso4') || oStr.includes('sulfate') || oStr.includes('sulphate');
        const isSulfite = anion === 'SO3^2-' || anion === 'SO32-' || (anion && anion.includes('SO3'));
        const isCarbonate = anion === 'CO3^2-' || anion === 'CO32-' || anion === 'HCO3-' || (anion && (anion.includes('CO3') || anion.includes('HCO3')));
        const hasWhitePptAnion = isChloride || isSulfate || isSulfite || isCarbonate || oStr.includes('white precipitate') || oStr.includes('white ppt');

        if (hasWhitePptAnion) {
          if (stage === 'warm' || stage === 'heated' || stage === 'step2_warm' || isHeated) {
            if (isChloride) {
              pptDissolved = true;
              ppt = false;
              liquidColor = 'rgba(255, 255, 255, 0.2)';
              statusLabel = 'Warmed: White precipitate of PbCl₂ dissolves completely to form a colourless solution';
            } else {
              ppt = true;
              pptColor = '#FFFFFF';
              statusLabel = isSulfate
                ? 'Warmed: White precipitate of PbSO₄ remains completely insoluble on boiling'
                : 'Warmed: White precipitate remains insoluble';
            }
          } else if (stage === 'cooled' || stage === 'step3_cool' || isCooled) {
            if (isChloride) {
              ppt = true;
              pptColor = '#FFFFFF';
              statusLabel = 'Cooled: White glistening needle-like crystals of PbCl₂ reappear on cooling';
            } else {
              ppt = true;
              pptColor = '#FFFFFF';
              statusLabel = 'Cooled: White precipitate persists';
            }
          } else {
            // Cold addition (Step 1)
            ppt = true;
            pptColor = '#FFFFFF';
            statusLabel = isChloride
              ? 'Lead(II) Nitrate Added: White precipitate of PbCl₂ formed'
              : 'Lead(II) Nitrate Added: White precipitate formed';
          }
        } else if (anion === 'I-' || anion === 'I⁻' || (anion && anion.includes('I'))) {
          if (stage === 'warm' || stage === 'heated' || stage === 'step2_warm' || isHeated) {
            pptDissolved = true;
            ppt = false;
            liquidColor = 'rgba(250, 204, 21, 0.4)';
            statusLabel = 'Warmed: Yellow precipitate of PbI₂ dissolves in hot water';
          } else if (stage === 'cooled' || stage === 'step3_cool' || isCooled) {
            ppt = true;
            pptColor = '#FACC15';
            statusLabel = 'Cooled: Golden shimmering spangles of PbI₂ recrystallize on cooling';
          } else {
            ppt = true;
            pptColor = '#FACC15';
            statusLabel = 'Lead(II) Nitrate Added: Bright yellow precipitate of PbI₂ formed';
          }
        } else {
          statusLabel = 'Lead(II) Nitrate Added: No precipitate formed';
        }
      } else if (isH2SO4) {
        if (cation === 'Ca2+' || cation === 'Ba2+' || cation === 'Pb2+' || oStr.includes('precipitate') || oStr.includes('ppt') || oStr.includes('caso4') || oStr.includes('baso4') || oStr.includes('pbso4')) {
          ppt = true;
          pptColor = '#FFFFFF';
          statusLabel = (cation === 'Ca2+')
            ? 'Dilute H₂SO₄ Added: White precipitate formed (sparingly soluble CaSO₄)'
            : 'Dilute H₂SO₄ Added: Dense white precipitate formed';
        } else {
          statusLabel = 'Dilute H₂SO₄ Added: No precipitate formed';
        }
      } else if (isResidueTest) {
        ppt = true;
        pptColor = '#FFFFFF';
        statusLabel = 'Dilute HCl Added: White residue remains completely insoluble (BaSO₄)';
      } else if (isHCl) {
        const isMnO2 = cation === 'Mn4+' ||
          (salt.key && (salt.key.includes('mno2') || salt.key.includes('manganese') || salt.key.includes('solidd') || salt.key.includes('solid_d'))) ||
          pStr.includes('solid d') || pStr.includes('mno2') || pStr.includes('manganese');
        if (isMnO2) {
          bubbling = true;
          gasType = 'cl2_choking';
          gasColor = '#D9F99D';
          liquidColor = 'rgba(254, 240, 138, 0.4)';
          soundType = 'effervescence';
          statusLabel = (isHeated || pStr.includes('warm') || pStr.includes('heat') || oStr.includes('effervesc'))
            ? '6M HCl Added & Warmed: Effervescence of suffocating greenish-yellow Cl₂ gas that bleaches moist blue litmus paper'
            : '6M HCl Added: Moderate effervescence on warming with Cl₂ gas evolved';
        } else if (anion === 'CO3^2-' || anion === 'CO32-' || anion === 'HCO3-' || (anion && (anion.includes('CO3') || anion.includes('HCO3')))) {
          bubbling = true;
          statusLabel = '2M HCl Added: Vigorous effervescence of a gas that turns limewater milky (CO₂)';
        } else if (anion === 'SO3^2-' || anion === 'SO32-' || (anion && anion.includes('SO3'))) {
          bubbling = true;
          statusLabel = '2M HCl Added: Effervescence of a choking gas that turns acidified K₂Cr₂O₇ green (SO₂)';
        } else if (cation === 'Pb2+') {
          ppt = true;
          pptColor = '#FFFFFF';
          statusLabel = isHeated ? 'Warmed: White precipitate of PbCl₂ dissolves in hot water' : '2M HCl Added: White precipitate of PbCl₂ formed';
        } else {
          statusLabel = 'No effervescence / No gas evolved';
        }
      } else if (isH2O2) {
        const isSplint = stage === 'splint_test' || stage === 'step2_gas_test' || stage === 'step2_splint' || stage === 'test_splint' || (pStr.includes('splint') && stage !== 'few_drops' && stage !== 'added_h2o2');
        const isSolidDOrMnO2 = cation === 'Mn4+' || cation === 'Mn2+' ||
          (salt.key && (salt.key.includes('mno2') || salt.key.includes('manganese') || salt.key.includes('solidd') || salt.key.includes('solid_d'))) ||
          (salt.name && (salt.name.includes('Manganese') || salt.name.includes('Solid D'))) ||
          pStr.includes('solid d') || pStr.includes('catalyst') || pStr.includes('mno2') || pStr.includes('manganese') ||
          oStr.includes('mno2') || oStr.includes('catalyst') || oStr.includes('effervescence') || oStr.includes('splint') || oStr.includes('rekindle') || oStr.includes('relight');

        if (isSolidDOrMnO2) {
          bubbling = true;
          evolvesO2 = true;
          ppt = true;
          pptColor = '#1E293B'; // Black solid catalyst powder
          liquidColor = 'rgba(255, 255, 255, 0.2)';
          if (isSplint) {
            statusLabel = 'Glowing Splint Inserted: Rekindles into bright flame (O₂ gas confirmed)';
            soundType = 'splint';
          } else {
            statusLabel = 'H₂O₂ Added: Vigorous effervescence of colourless gas (relights glowing splint; Solid D acts as catalyst)';
            soundType = 'effervescence';
          }
        } else if (cation === 'Fe2+' || pStr.includes('fe(oh)2') || oStr.includes('dirty green') || oStr.includes('reddish-brown') || oStr.includes('fe(oh)3')) {
          ppt = true;
          pptColor = '#991B1B'; // Reddish-brown Fe(OH)3
          liquidColor = 'rgba(217, 119, 6, 0.45)';
          statusLabel = 'H₂O₂ Added: Dirty-green precipitate rapidly oxidised to reddish-brown Fe(OH)₃';
          soundType = 'drop';
        } else if (anion === 'I-' || (anion && anion.includes('I')) || pStr.includes('iodide') || oStr.includes('iodine') || oStr.includes('brown')) {
          liquidColor = '#78350F';
          statusLabel = 'H₂O₂ Added: Clear solution turns dark brown as iodide (I⁻) is oxidised to free iodine (I₂)';
          soundType = 'drop';
        } else if (anion === 'SO3^2-' || anion === 'SO32-' || (anion && anion.includes('SO3'))) {
          statusLabel = 'H₂O₂ Added: Sulfite (SO₃²⁻) oxidised to sulfate (SO₄²⁻)';
          soundType = 'drop';
        } else if (pStr.includes('kmno4') || pStr.includes('manganate') || pStr.includes('permanganate') || oStr.includes('decoloriz')) {
          bubbling = true;
          evolvesO2 = true;
          liquidColor = 'rgba(255, 255, 255, 0.2)';
          statusLabel = 'H₂O₂ Added: Purple acidified KMnO₄ rapidly decolourises with effervescence of O₂ gas';
          soundType = 'effervescence';
        } else {
          statusLabel = 'H₂O₂ Added: No observable effervescence / no visible reaction';
          soundType = 'drop';
        }
      } else if (isNaHCO3) {
        const isLimewater = stage === 'limewater_test' || stage === 'step2_gas_test' || stage === 'step2_limewater' || (pStr.includes('limewater') && stage !== 'added_nahco3' && stage !== 'few_drops');
        const isAcidic = cation === 'H+' || (salt && salt.isAcid) ||
          (salt.key && (salt.key.toLowerCase().includes('acid') || salt.key === 'hydrochloricAcid' || salt.key === 'nitricAcid' || salt.key === 'sulfuricAcid')) ||
          pStr.includes('acid') || oStr.includes('effervesc') || oStr.includes('bubbles') || oStr.includes('milky');
        const isHydrolyzingCation = cation === 'Fe3+' || cation === 'Al3+';

        if (isAcidic) {
          bubbling = true;
          evolvesCO2 = true;
          ppt = false;
          soundType = 'effervescence';
          liquidColor = 'rgba(255, 255, 255, 0.2)';
          if (isLimewater) {
            statusLabel = 'Gas Bubbled through Limewater: White precipitate formed / Limewater turned milky (CO₂ confirmed)';
            soundType = 'effervescence';
          } else {
            statusLabel = 'Solid NaHCO₃ Added: Vigorous effervescence of a colourless gas that turns limewater milky (CO₂ evolved; H⁺ / acid present)';
          }
        } else if (isHydrolyzingCation) {
          bubbling = true;
          evolvesCO2 = true;
          ppt = true;
          pptColor = (cation === 'Fe3+') ? '#991B1B' : '#FFFFFF';
          liquidColor = (cation === 'Fe3+') ? 'rgba(217, 119, 6, 0.3)' : 'rgba(255, 255, 255, 0.2)';
          soundType = 'effervescence';
          statusLabel = (cation === 'Fe3+')
            ? 'Solid NaHCO₃ Added: Moderate effervescence with reddish-brown precipitate of Fe(OH)₃ (due to hydrolysis of Fe³⁺)'
            : 'Solid NaHCO₃ Added: Moderate effervescence with white gelatinous precipitate of Al(OH)₃ (due to hydrolysis of Al³⁺)';
        } else {
          bubbling = false;
          ppt = true;
          pptColor = '#FFFFFF';
          soundType = 'drop';
          statusLabel = 'Solid NaHCO₃ Added: No effervescence observed; white solid settles at bottom of tube';
        }
      } else if (isZincDisplacement) {
        const isCopper = cation === 'Cu2+' ||
          (salt.key && (salt.key.toLowerCase().includes('cu') || salt.key.toLowerCase().includes('copper'))) ||
          (salt.name && salt.name.toLowerCase().includes('copper')) ||
          pStr.includes('copper') || oStr.includes('copper') || oStr.includes('reddish-brown');
        if (isCopper) {
          ppt = true;
          pptColor = '#B45309'; // Reddish-brown copper metal powder
          liquidColor = 'rgba(255, 255, 255, 0.2)'; // Turns colourless from green/blue
          bubbling = true;
          soundType = 'effervescence';
          statusLabel = 'Solid E (Zinc Dust) Added: Effervescence; green solution turns colourless with reddish-brown solid deposited';
        } else {
          ppt = true;
          pptColor = '#94A3B8';
          soundType = 'drop';
          statusLabel = 'Solid E (Zinc Dust) Added: Grey metal powder settles; no displacement observed';
        }
      } else if (oStr.includes('precipitate') || oStr.includes('ppt')) {
        ppt = true;
        if (oStr.includes('dirty green') || oStr.includes('green precipitate') || oStr.includes('fe(oh)2')) {
          pptColor = '#15803D';
        } else if (oStr.includes('reddish-brown') || oStr.includes('brown precipitate') || oStr.includes('fe(oh)3')) {
          pptColor = '#991B1B';
        } else if (oStr.includes('pale blue') || oStr.includes('blue precipitate') || oStr.includes('cu(oh)2')) {
          pptColor = '#38BDF8';
        } else if (oStr.includes('yellow precipitate') || oStr.includes('bright yellow') || oStr.includes('pbi2')) {
          pptColor = '#FACC15';
        } else {
          pptColor = '#FFFFFF';
        }
        if (isExcess && (oStr.includes('dissolv') || oStr.includes('soluble'))) {
          pptDissolved = true;
        }
        statusLabel = `Observed: ${obsStr.slice(0, 65)}`;
      } else if (isPhysicalAppearance) {
        statusLabel = `Inspected: ${salt.appearance || 'Crystalline Solid'}`;
        soundType = 'inspect';
      } else if (isDissolving) {
        liquidColor = (cation === 'Cu2+') ? 'rgba(56, 189, 248, 0.6)'
          : (cation === 'Fe2+') ? 'rgba(16, 185, 129, 0.4)'
          : (cation === 'Fe3+') ? 'rgba(217, 119, 6, 0.45)'
          : 'rgba(255, 255, 255, 0.25)';
        statusLabel = `Water Added: ${salt.solubility || 'Solid dissolves completely to form clear stock solution'}`;
        soundType = 'dissolve';
      } else if (isFlameTest) {
        const isCobaltGlass = Boolean(options && options.isCobaltGlass);
        if (isCobaltGlass) {
          statusLabel = (salt.key.includes('sodium') || salt.name.includes('Sodium') || cation === 'Na+')
            ? 'Flame Test (Cobalt Glass): Golden yellow flame completely absorbed / invisible'
            : (salt.key.includes('potassium') || salt.name.includes('Potassium') || cation === 'K+')
            ? 'Flame Test (Cobalt Glass): Pale lilac / purple-crimson flame shines through clearly'
            : (cation === 'Ca2+') ? 'Flame Test (Cobalt Glass): Brick-red flame attenuated'
            : (cation === 'Cu2+') ? 'Flame Test (Cobalt Glass): Blue-green flame seen through blue filter'
            : (cation === 'Ba2+') ? 'Flame Test (Cobalt Glass): Apple-green flame absorbed'
            : 'Flame Test (Cobalt Glass): Characteristic emission observed through blue optical filter';
        } else {
          statusLabel = (cation === 'Ca2+') ? 'Flame Test: Brick-red / orange-red flame'
            : (cation === 'Cu2+') ? 'Flame Test: Blue-green flame'
            : (cation === 'Ba2+') ? 'Flame Test: Apple-green flame'
            : (cation === 'Na+' || salt.key.includes('sodium') || salt.name.includes('Sodium')) ? 'Flame Test: Persistent golden yellow flame'
            : (cation === 'K+' || salt.key.includes('potassium') || salt.name.includes('Potassium')) ? 'Flame Test: Pale lilac flame'
            : (cation === 'Pb2+') ? 'Flame Test: Dull bluish-white / grey flame'
            : 'Flame Test: Characteristic emission color recorded';
        }
        soundType = 'flame';
      } else if (isHeat) {
        const isGentleHeat = stage === 'gentle_heat' || stage === 'warm';
        const isCooled = stage === 'cooled' || stage === 'cool_down';
        decrepitates = false;
        evolvesO2 = false;
        evolvesNO2 = false;
        evolvesNH3 = false;
        evolvesCO2 = false;
        evolvesSO2 = false;
        decomposesCompletely = false;
        residueColorHot = salt.crystalColor || '#FFFFFF';
        residueColorCold = salt.crystalColor || '#FFFFFF';

        if (anion === 'NO3-') {
          liquidColor = 'rgba(180, 83, 9, 0.55)';
          gasType = 'no2_brown';
          gasColor = '#78350F';
          evolvesNO2 = true;
          evolvesO2 = true;

          if (cation === 'Pb2+') {
            decrepitates = true;
            residueColorHot = '#CA8A04'; // PbO reddish-brown/orange hot
            residueColorCold = '#FACC15'; // PbO bright yellow cold
            statusLabel = isCooled
              ? 'Cooled: Reddish-brown residue cooled to bright yellow powder (PbO formation)'
              : (isGentleHeat
                ? 'Gently Warmed: Solid crackles softly; faint fumes begin to appear'
                : 'Heated: Decrepitates; brown fumes of NO₂; rekindles glowing splint (O₂); reddish-brown hot, yellow cold');
          } else if (cation === 'Zn2+') {
            waterCondenses = true;
            residueColorHot = '#FACC15'; // ZnO canary-yellow hot
            residueColorCold = '#FFFFFF'; // ZnO white cold
            statusLabel = isCooled
              ? 'Cooled: Canary-yellow residue cooled back to pure white powder (ZnO formation)'
              : 'Heated Strongly: Brown fumes of NO₂; rekindles glowing splint (O₂); yellow hot, white cold';
          } else {
            // aluminumNitrate
            waterCondenses = true;
            residueColorHot = '#FFFFFF';
            residueColorCold = '#FFFFFF';
            statusLabel = isCooled
              ? 'Cooled: White residue (Al₂O₃) cooled to room temperature'
              : 'Heated Strongly: Brown fumes of NO₂ evolved; rekindles glowing splint (O₂)';
          }
          residueColor = isCooled ? residueColorCold : residueColorHot;
        } else if (cation === 'NH4+') {
          if (anion === 'Cl-') {
            sublimes = true;
            gasType = 'sublimate_deposit';
            gasColor = '#FFFFFF';
            evolvesNH3 = true;
            residueColorHot = '#FFFFFF';
            residueColorCold = '#FFFFFF';
            residueColor = '#FFFFFF';
            statusLabel = isCooled
              ? 'Cooled: Dense white sublimate ring deposited firmly on upper cooler glass walls'
              : 'Heated: Sublimes; dense white fumes deposit on upper cooler walls (sublimation ring)';
          } else {
            // (NH4)2CO3
            decomposesCompletely = true;
            waterCondenses = true;
            gasType = 'nh3_co2';
            gasColor = '#FFFFFF';
            evolvesNH3 = true;
            evolvesCO2 = true;
            residueColorHot = null;
            residueColorCold = null;
            residueColor = null; // disappears completely!
            statusLabel = isCooled
              ? 'Cooled: Hard-glass tube is completely empty (no residue remains)'
              : 'Heated: Decomposes completely; alkaline gas (NH₃) turns red litmus blue; CO₂ turns limewater milky';
          }
        } else if (cation === 'Zn2+') {
          waterCondenses = true;
          gasType = 'steam';
          residueColorHot = '#FACC15';
          residueColorCold = '#FFFFFF';
          residueColor = isCooled ? residueColorCold : residueColorHot;
          statusLabel = isCooled
            ? 'Cooled: Yellow hot residue cooled back to white powder (ZnO)'
            : 'Heated: Solid turns yellow when hot, white on cooling (ZnO formation)';
        } else if (cation === 'Cu2+') {
          waterCondenses = true;
          gasType = 'steam';
          residueColorHot = '#F1F5F9';
          residueColorCold = '#F1F5F9';
          residueColor = '#F1F5F9';
          statusLabel = isCooled
            ? 'Cooled: White anhydrous CuSO₄ powder remains stable in dry tube'
            : 'Heated: Blue crystals dehydrate to white anhydrous powder; water droplets condense';
        } else if (cation === 'Fe2+') {
          waterCondenses = true;
          evolvesSO2 = true;
          gasType = 'so2_steam';
          residueColorHot = '#451A03';
          residueColorCold = '#451A03';
          residueColor = '#451A03';
          statusLabel = isCooled
            ? 'Cooled: Dirty brown/black residue of Fe₂O₃ cooled to room temperature'
            : 'Heated: Pale green crystals turn dirty brown; water droplets condense; choking SO₂ gas evolved';
        } else if (anion === 'SO3^2-') {
          evolvesSO2 = true;
          gasType = 'so2_pungent';
          residueColor = '#FFFFFF';
          statusLabel = 'Heated Strongly: Solid remains stable; faint choking sulfurous smell of SO₂';
        } else if (anion === 'MnO4-' || saltKey === 'potassiumPermanganate' || (salt.name && salt.name.includes('Permanganate'))) {
          decrepitates = true;
          evolvesO2 = true;
          gasType = 'o2_gas';
          residueColorHot = '#0F172A';
          residueColorCold = '#0F172A';
          residueColor = '#0F172A';
          statusLabel = isCooled
            ? 'Cooled: Black/dark greenish-black residue of K₂MnO₄ and MnO₂ cooled to room temperature'
            : (isGentleHeat
              ? 'Gently Warmed: Purple crystals begin absorbing heat; faint crackling audible'
              : 'Heated: Decrepitates crackling loudly; decomposes to black residue (K₂MnO₄ + MnO₂); evolves colourless gas that relights glowing splint (O₂)');
        } else if (anion === 'Cr2O7^2-' || saltKey === 'potassiumDichromate' || (salt.name && salt.name.includes('Dichromate'))) {
          evolvesO2 = true;
          gasType = 'o2_gas';
          residueColorHot = '#7C2D12';
          residueColorCold = '#14532D';
          residueColor = isCooled ? residueColorCold : residueColorHot;
          statusLabel = isCooled
            ? 'Cooled: Orange crystals converted to dark green residue of Cr₂O₃ and K₂CrO₄'
            : (isGentleHeat
              ? 'Gently Warmed: Bright orange crystals begin darkening as heat is absorbed'
              : 'Heated Strongly: Orange crystals darken to reddish-brown hot; decomposes evolving O₂ gas that relights glowing splint');
        } else if (anion === 'Br-' || anion === 'I-') {
          decrepitates = true;
          residueColor = salt.crystalColor || '#FFFFFF';
          statusLabel = 'Heated Strongly: White crystalline solid crackles; melts at high temperature; no gas evolved';
        } else if (anion === 'HCO3-' || saltKey === 'sodiumHydrogenCarbonate') {
          waterCondenses = true;
          evolvesCO2 = true;
          gasType = 'co2_steam';
          gasColor = '#FFFFFF';
          residueColorHot = '#FFFFFF';
          residueColorCold = '#FFFFFF';
          residueColor = '#FFFFFF';
          statusLabel = isCooled
            ? 'Cooled: White solid residue of Na₂CO₃ remains stable'
            : 'Heated: Colorless water droplets condense on cooler upper walls; colorless gas turns limewater milky (CO₂); white residue remains';
        } else if (anion === 'CO3^2-') {
          residueColor = '#FFFFFF';
          statusLabel = 'Heated: White solid remains thermally stable in Bunsen flame; no gas evolved';
        } else {
          residueColor = salt.crystalColor || '#FFFFFF';
          statusLabel = 'Heated Strongly: Thermal decomposition observed';
        }
        soundType = decrepitates ? 'decrepitate' : 'flame';
      }
    } else {
      if (isPhysicalAppearance) statusLabel = 'Solid Specimen Y on Watch Glass';
      else if (isDissolving) statusLabel = 'Awaiting Distilled Water';
      else if (isHeat || isFlameTest) statusLabel = 'Awaiting Bunsen Flame';
      else statusLabel = 'Awaiting Reagent';
    }

    return {
      salt,
      performed,
      stage,
      liquidTopY: isStep1 ? 80 : 54,
      liquidColor,
      ppt,
      pptColor,
      pptDissolved,
      bubbling,
      sublimes,
      gasType,
      gasColor,
      residueColor,
      waterCondenses,
      isBrownRing,
      hasBrownRing: isBrownRing && anion === 'NO3-',
      isKI,
      isPbNO3,
      isLead: cation === 'Pb2+',
      isHeated,
      isCooled,
      decrepitates: Boolean(decrepitates),
      evolvesO2: Boolean(evolvesO2),
      evolvesNO2: Boolean(evolvesNO2),
      evolvesNH3: Boolean(evolvesNH3),
      evolvesCO2: Boolean(evolvesCO2),
      evolvesSO2: Boolean(evolvesSO2),
      decomposesCompletely: Boolean(decomposesCompletely),
      residueColorHot,
      residueColorCold,
      complexDeepBlue,
      isExcess,
      isStep1,
      isPhysicalAppearance,
      isDissolving,
      isFlameTest,
      isHeat,
      isNaHCO3: Boolean(isNaHCO3),
      isZincDisplacement: Boolean(isZincDisplacement),
      statusLabel,
      soundType
    };
  }

  // ── 4. High-Fidelity SVG Test Tube Apparatus ──────────────────
  function renderTubeSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      testId = 'test_1',
      stage = 'idle',
      isAdding = false,
      prompt = '',
      obsStr = '',
      tubeId = `tube_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const r = resolveReactionState(saltKey, testId, stage, prompt, obsStr);
    const performed = r.performed;
    const isStep1 = r.isStep1;
    const isExcess = r.isExcess;

    // Special Case 1: Brown Ring Test Stratification
    if (performed && r.isBrownRing) {
      const isStep2 = stage === 'step2_h2so4' || stage === 'excess' || stage === 'done';
      return `
        <svg width="160" height="230" viewBox="0 0 160 230" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
          <defs>
            <linearGradient id="h2so4Grad_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(241, 245, 249, 0.7)"/>
              <stop offset="35%" stop-color="rgba(255, 255, 255, 0.85)"/>
              <stop offset="100%" stop-color="rgba(203, 213, 225, 0.7)"/>
            </linearGradient>
            <radialGradient id="ringGlow_${tubeId}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#271105" stop-opacity="1"/>
              <stop offset="70%" stop-color="#78350F" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#B45309" stop-opacity="0.15"/>
            </radialGradient>
            <linearGradient id="woodGrad_${tubeId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#9A3412"/>
              <stop offset="40%" stop-color="#78350F"/>
              <stop offset="100%" stop-color="#451A03"/>
            </linearGradient>
          </defs>
          
          <!-- Wooden Test Tube Clamp -->
          <g transform="translate(0, 68)">
            <path d="M 4,0 L 57,0 L 57,14 L 4,14 Z" fill="url(#woodGrad_${tubeId})" stroke="#3A1700" stroke-width="1"/>
            <path d="M 103,0 L 156,0 L 156,14 L 103,14 Z" fill="url(#woodGrad_${tubeId})" stroke="#3A1700" stroke-width="1"/>
            <rect x="54" y="-1" width="3" height="16" rx="0.5" fill="#D97706" stroke="#92400E" stroke-width="0.5" opacity="0.95"/>
            <rect x="103" y="-1" width="3" height="16" rx="0.5" fill="#D97706" stroke="#92400E" stroke-width="0.5" opacity="0.95"/>
            <circle cx="20" cy="7" r="3.5" fill="#94A3B8" stroke="#334155" stroke-width="0.8"/>
            <circle cx="20" cy="7" r="1.5" fill="#475569"/>
            <circle cx="140" cy="7" r="3.5" fill="#94A3B8" stroke="#334155" stroke-width="0.8"/>
            <circle cx="140" cy="7" r="1.5" fill="#475569"/>
          </g>

          <!-- Glass Test Tube Body & Lip -->
          <rect x="53" y="27" width="54" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" stroke="#94A3B8" stroke-width="1.2"/>
          <path d="M 57,32 L 57,186 Q 57,208 80,208 Q 103,208 103,186 L 103,32 Z" fill="rgba(255,255,255,0.04)" stroke="#94A3B8" stroke-width="1.6"/>

          <!-- Frosted Volume Graduations & Pyrex Brand -->
          <line x1="97" y1="75" x2="103" y2="75" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>
          <text x="94" y="77" font-size="6" fill="#FFFFFF" opacity="0.6" text-anchor="end" font-family="'JetBrains Mono', monospace">10ml</text>
          <line x1="97" y1="120" x2="103" y2="120" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>
          <text x="94" y="122" font-size="6" fill="#FFFFFF" opacity="0.6" text-anchor="end" font-family="'JetBrains Mono', monospace">5ml</text>
          <line x1="97" y1="160" x2="103" y2="160" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>
          <text x="94" y="162" font-size="6" fill="#FFFFFF" opacity="0.6" text-anchor="end" font-family="'JetBrains Mono', monospace">2ml</text>
          <rect x="66" y="46" width="28" height="11" rx="2" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="0.6"/>
          <text x="80" y="54" font-size="5.5" font-weight="800" fill="#CBD5E1" text-anchor="middle" font-family="sans-serif">PYREX®</text>

          ${isStep2 ? `
            <!-- Lower Dense Layer (Conc. H2SO4) -->
            <path d="M 58,150 L 58,186 Q 58,206 80,206 Q 102,206 102,186 L 102,150 Z" fill="url(#h2so4Grad_${tubeId})"/>
            <ellipse cx="80" cy="150" rx="21.5" ry="4.5" fill="rgba(203, 213, 225, 0.95)"/>
          ` : ''}

          <!-- Upper Layer (Fresh FeSO4 Solution - pale emerald green) -->
          <path d="M 58,${isStep2 ? 98 : 120} L 58,${isStep2 ? 150 : 186} ${isStep2 ? '' : 'Q 58,206 80,206 Q 102,206 102,186'} L 102,${isStep2 ? 150 : 120} L 102,${isStep2 ? 98 : 120} Z" fill="rgba(16, 185, 129, 0.28)"/>
          <ellipse cx="80" cy="${isStep2 ? 98 : 120}" rx="21.5" ry="4.5" fill="rgba(16, 185, 129, 0.45)"/>

          <!-- Brown Ring [Fe(H2O)5(NO)]2+ Interface Junction -->
          ${r.hasBrownRing && isStep2 ? `
            <g class="anim-brown-ring">
              <ellipse cx="80" cy="150" rx="21.5" ry="5.5" fill="url(#ringGlow_${tubeId})" stroke="#B45309" stroke-width="1.8"/>
              <ellipse cx="80" cy="150" rx="16" ry="3.5" fill="#1C0A00"/>
              <path d="M 64,150 Q 80,152 96,150" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none"/>
            </g>
          ` : ''}

          <!-- Specular Highlight Curves -->
          <line x1="62" y1="36" x2="62" y2="186" stroke="#FFFFFF" stroke-width="1.8" opacity="0.32" stroke-linecap="round"/>
          <line x1="98" y1="36" x2="98" y2="186" stroke="#FFFFFF" stroke-width="1.2" opacity="0.18" stroke-linecap="round"/>
          <path d="M 66,196 Q 80,204 94,196" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity="0.35"/>
        </svg>
      `;
    }

    // Special Case 2: Potassium Iodide Test for Lead (PbI2 Golden Spangles)
    if (performed && r.isKI && r.isLead) {
      const topY = isExcess ? 92 : 138;
      return `
        <svg width="160" height="230" viewBox="0 0 160 230" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
          <defs>
            <linearGradient id="woodGrad_${tubeId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#9A3412"/>
              <stop offset="40%" stop-color="#78350F"/>
              <stop offset="100%" stop-color="#451A03"/>
            </linearGradient>
            <radialGradient id="pbi2Glow_${tubeId}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FEF08A"/>
              <stop offset="60%" stop-color="#FACC15"/>
              <stop offset="100%" stop-color="#CA8A04"/>
            </radialGradient>
          </defs>

          <!-- Wooden Test Tube Clamp -->
          <g transform="translate(0, 68)">
            <path d="M 4,0 L 57,0 L 57,14 L 4,14 Z" fill="url(#woodGrad_${tubeId})" stroke="#3A1700" stroke-width="1"/>
            <path d="M 103,0 L 156,0 L 156,14 L 103,14 Z" fill="url(#woodGrad_${tubeId})" stroke="#3A1700" stroke-width="1"/>
            <rect x="54" y="-1" width="3" height="16" rx="0.5" fill="#D97706" stroke="#92400E" stroke-width="0.5" opacity="0.95"/>
            <rect x="103" y="-1" width="3" height="16" rx="0.5" fill="#D97706" stroke="#92400E" stroke-width="0.5" opacity="0.95"/>
            <circle cx="20" cy="7" r="3.5" fill="#94A3B8" stroke="#334155" stroke-width="0.8"/>
            <circle cx="20" cy="7" r="1.5" fill="#475569"/>
            <circle cx="140" cy="7" r="3.5" fill="#94A3B8" stroke="#334155" stroke-width="0.8"/>
            <circle cx="140" cy="7" r="1.5" fill="#475569"/>
          </g>

          <!-- Glass Body & Lip -->
          <rect x="53" y="27" width="54" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" stroke="#94A3B8" stroke-width="1.2"/>
          <path d="M 57,32 L 57,186 Q 57,208 80,208 Q 103,208 103,186 L 103,32 Z" fill="rgba(255,255,255,0.04)" stroke="#94A3B8" stroke-width="1.6"/>

          <!-- Liquid Phase -->
          <path class="${isExcess ? 'anim-liquid-rise' : ''}" d="M 58,${topY} L 58,186 Q 58,206 80,206 Q 102,206 102,186 L 102,${topY} Z" fill="${r.liquidColor}"/>
          <ellipse cx="80" cy="${topY}" rx="21.5" ry="4.5" fill="${r.liquidColor}" class="anim-meniscus-ripple"/>

          <!-- Precision Dropper Pipette (when few drops) Centered directly over Mouth -->
          ${isStep1 ? `
            <g class="anim-dropper" style="transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease; transform: translate(0px, ${isAdding ? '6px' : '0px'}); opacity: 1;">
              <path class="${isAdding ? 'anim-dropper-bulb' : ''}" d="M 74,2 C 71.5,2 71.5,6 73.5,9.5 L 75.5,14 L 84.5,14 L 86.5,9.5 C 88.5,6 88.5,2 86,2 Z" fill="#EF4444"/>
              <rect x="75" y="13.5" width="10" height="1.8" rx="0.9" fill="#CBD5E1" stroke="#94A3B8" stroke-width="0.5"/>
              <rect x="78" y="15" width="4" height="13" rx="0.5" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" stroke-width="0.8"/>
              <rect x="78.8" y="19" width="2.4" height="9" fill="#FACC15" opacity="0.85"/>
              <path d="M 78,28 L 82,28 L 80.8,34 L 79.2,34 Z" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" stroke-width="0.8"/>
              <path d="M 78.6,28 L 81.4,28 L 80.6,33.5 L 79.4,33.5 Z" fill="#FACC15" opacity="0.9"/>
              <!-- Static Poised Tip Meniscus -->
              <ellipse cx="80" cy="35" rx="1.6" ry="1.0" fill="#FACC15"/>
            </g>
            ${isAdding ? `
              <path d="M 80,35 C 77.5,40 76.5,45 80,49 C 83.5,45 82.5,40 80,35 Z" fill="#FACC15" class="anim-droplet"/>
            ` : ''}
          ` : ''}

          <!-- Convection Heat Waves when warmed -->
          ${r.isHeated ? `
            <g class="anim-heat-wave">
              <path d="M 70,55 Q 80,48 90,55" stroke="rgba(245, 158, 11, 0.75)" stroke-width="2" fill="none"/>
              <path d="M 72,70 Q 80,63 88,70" stroke="rgba(245, 158, 11, 0.6)" stroke-width="2" fill="none"/>
            </g>
          ` : ''}

          <!-- PbI2 Golden Precipitate Bed -->
          ${r.ppt ? `
            <g class="anim-ppt-form">
              <path d="M 58,178 C 64,174 70,180 76,175 C 82,172 88,178 94,174 C 98,177 102,175 102,178 Q 102,206 80,206 Q 58,206 58,178 Z" fill="url(#pbi2Glow_${tubeId})" opacity="0.95"/>
              <path d="M 58,185 C 65,182 74,186 82,183 C 90,186 97,182 102,185 Q 102,206 80,206 Q 58,206 58,185 Z" fill="#CA8A04" opacity="0.75"/>
              <ellipse cx="68" cy="180" rx="3.5" ry="2.2" fill="#FACC15" opacity="0.9"/>
              <ellipse cx="80" cy="177" rx="4" ry="2.5" fill="#FEF08A" opacity="0.95"/>
              <ellipse cx="92" cy="179" rx="3.8" ry="2.3" fill="#EAB308" opacity="0.9"/>
            </g>
          ` : ''}

          <!-- Sparkling Golden Spangles upon cooling -->
          ${r.isCooled ? `
            <g class="anim-spangle" style="animation-delay: 0s;">
              <polygon points="80,110 83,115 88,116 83,118 80,123 77,118 72,116 77,115" fill="#FEF08A"/>
            </g>
            <g class="anim-spangle" style="animation-delay: 0.35s;">
              <polygon points="68,135 70,139 74,140 70,141 68,145 66,141 62,140 66,139" fill="#FDE047"/>
            </g>
            <g class="anim-spangle" style="animation-delay: 0.7s;">
              <polygon points="92,125 94,129 98,130 94,131 92,135 90,131 86,130 90,129" fill="#FEF08A"/>
            </g>
            <g class="anim-spangle" style="animation-delay: 1.05s;">
              <polygon points="76,155 78,159 82,160 78,161 76,165 74,161 70,160 74,159" fill="#FDE047"/>
            </g>
          ` : ''}

          <line x1="62" y1="36" x2="62" y2="186" stroke="#FFFFFF" stroke-width="1.8" opacity="0.32" stroke-linecap="round"/>
          <line x1="98" y1="36" x2="98" y2="186" stroke="#FFFFFF" stroke-width="1.2" opacity="0.18" stroke-linecap="round"/>
        </svg>
      `;
    }

    // Standard Qualitative Reagent Test Tube
    const isPpt = performed && r.ppt;
    const isPptDissolved = performed && r.pptDissolved;
    const isDeepBlue = performed && r.complexDeepBlue;
    const isSplint = performed && (stage === 'splint_test' || stage === 'step2_gas_test' || stage === 'step2_splint' || (r.evolvesO2 && stage === 'splint_test'));
    const isSpatula = r.isNaHCO3 || r.isZincDisplacement || (prompt && (prompt.toLowerCase().includes('nahco3') || prompt.toLowerCase().includes('bicarbonate') || prompt.toLowerCase().includes('zinc dust') || prompt.toLowerCase().includes('solid e') || (prompt.toLowerCase().includes('solid') && prompt.toLowerCase().includes('carbonate'))));
    const topY = isExcess ? 88 : (performed ? 138 : 160);
    const dropletColor = isPpt ? (r.pptColor || '#E2E8F0') : (r.liquidColor && r.liquidColor.startsWith('#') ? r.liquidColor : '#38BDF8');

    return `
      <svg width="160" height="230" viewBox="0 0 160 230" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
        <defs>
          <radialGradient id="liquidGlow_${tubeId}" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stop-color="${isDeepBlue ? '#2563EB' : r.liquidColor}" stop-opacity="${isDeepBlue ? '1' : '0.95'}"/>
            <stop offset="60%" stop-color="${isDeepBlue ? '#1D4ED8' : r.liquidColor}" stop-opacity="${isDeepBlue ? '0.92' : '0.85'}"/>
            <stop offset="100%" stop-color="${isDeepBlue ? '#1E3A8A' : r.liquidColor}" stop-opacity="${isDeepBlue ? '0.95' : '0.75'}"/>
          </radialGradient>
          <linearGradient id="tubeGlassSheen_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
            <stop offset="25%" stop-color="rgba(255,255,255,0.05)"/>
            <stop offset="85%" stop-color="rgba(255,255,255,0.02)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.18)"/>
          </linearGradient>
          <linearGradient id="spatulaMetal_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#94A3B8"/>
            <stop offset="40%" stop-color="#E2E8F0"/>
            <stop offset="70%" stop-color="#CBD5E1"/>
            <stop offset="100%" stop-color="#64748B"/>
          </linearGradient>
          <linearGradient id="woodGrad_${tubeId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#9A3412"/>
            <stop offset="40%" stop-color="#78350F"/>
            <stop offset="100%" stop-color="#451A03"/>
          </linearGradient>
          <radialGradient id="pptTurbidity_${tubeId}" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="${r.pptColor || '#FFFFFF'}" stop-opacity="0.6"/>
            <stop offset="50%" stop-color="${r.pptColor || '#FFFFFF'}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${r.pptColor || '#FFFFFF'}" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="splintBurst_${tubeId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="25%" stop-color="#FEF08A"/>
            <stop offset="65%" stop-color="#F59E0B" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
          </radialGradient>
        </defs>

        ${isSplint ? `
          <!-- Glowing Wooden Splint Rekindling at Test Tube Mouth -->
          <g class="anim-splint-rekindle" transform="translate(0, 0)">
            <line x1="62" y1="-6" x2="79" y2="28" stroke="#B45309" stroke-width="2.8" stroke-linecap="round"/>
            <line x1="62" y1="-6" x2="74" y2="18" stroke="#D97706" stroke-width="1.3" stroke-linecap="round"/>
            <g class="anim-flame" transform="translate(79, 28)">
              <circle cx="0" cy="0" r="13" fill="url(#splintBurst_${tubeId})" opacity="0.88"/>
              <path d="M -4,0 C -6,-10 0,-16 0,-16 C 0,-16 6,-10 4,0 Z" fill="#FDE047"/>
              <circle cx="0" cy="0" r="3.2" fill="#FFFFFF"/>
              <circle cx="-2" cy="-4" r="1.4" fill="#F59E0B"/>
              <circle cx="2" cy="-6" r="1.1" fill="#FDE047"/>
            </g>
          </g>
        ` : (isSpatula ? `
          <!-- Stainless Steel Laboratory Spatula Delivering Solid Reagent Powder -->
          <g style="transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease; transform: translate(${performed && !isAdding ? '-30px, -20px' : (isAdding ? '8px, 6px' : '0px, 0px')}); opacity: ${performed && !isAdding ? '0' : '1'};">
            <line x1="28" y1="24" x2="76" y2="24" stroke="url(#spatulaMetal_${tubeId})" stroke-width="3.2" stroke-linecap="round"/>
            <ellipse cx="76" cy="24" rx="6.5" ry="3.2" fill="url(#spatulaMetal_${tubeId})" stroke="#475569" stroke-width="0.6"/>
            <circle cx="76" cy="23" r="2.5" fill="${r.isZincDisplacement ? '#94A3B8' : '#FFFFFF'}"/>
          </g>
          ${isAdding ? `
            <!-- Falling Powder Crystals -->
            <circle cx="76" cy="38" r="1.5" fill="${r.isZincDisplacement ? '#94A3B8' : '#FFFFFF'}" class="anim-droplet"/>
            <circle cx="78" cy="46" r="1.2" fill="${r.isZincDisplacement ? '#94A3B8' : '#FFFFFF'}" class="anim-droplet" style="animation-delay: 0.1s;"/>
          ` : ''}
        ` : `
          <!-- Precision Reagent Dropper Pipette (Centered over Mouth) -->
          <g class="anim-dropper" style="transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease; transform: translate(0px, ${performed && !isAdding && (stage === 'excess' || stage === 'done') ? '-25px' : (isAdding ? '6px' : '0px')}); opacity: ${performed && !isAdding && (stage === 'excess' || stage === 'done') ? '0' : (isAdding ? '1' : (performed ? '0.85' : '0.5'))};">
            <path class="${isAdding ? 'anim-dropper-bulb' : ''}" d="M 74,2 C 71.5,2 71.5,6 73.5,9.5 L 75.5,14 L 84.5,14 L 86.5,9.5 C 88.5,6 88.5,2 86,2 Z" fill="#EF4444"/>
            <rect x="75" y="13.5" width="10" height="1.8" rx="0.9" fill="#CBD5E1" stroke="#94A3B8" stroke-width="0.5"/>
            <rect x="78" y="15" width="4" height="13" rx="0.5" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" stroke-width="0.8"/>
            <rect x="78.8" y="19" width="2.4" height="9" fill="${dropletColor}" opacity="0.85"/>
            <path d="M 78,28 L 82,28 L 80.8,34 L 79.2,34 Z" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" stroke-width="0.8"/>
            <path d="M 78.6,28 L 81.4,28 L 80.6,33.5 L 79.4,33.5 Z" fill="${dropletColor}" opacity="0.9"/>
            <!-- Static Poised Tip Meniscus -->
            <ellipse cx="80" cy="35" rx="1.6" ry="1.0" fill="${dropletColor}"/>
          </g>
          ${isAdding ? `
            <!-- Fast Gravitational Falling Reagent Droplet -->
            <path d="M 80,35 C 77.5,40 76.5,45 80,49 C 83.5,45 82.5,40 80,35 Z" fill="${dropletColor}" class="anim-droplet"/>
          ` : ''}
        `)}

        <!-- Laboratory Test Tube Wooden Clamp with Cork Cushions & Dual Brass Rivets -->
        <g transform="translate(0, 68)">
          <path d="M 4,0 L 57,0 L 57,14 L 4,14 Z" fill="url(#woodGrad_${tubeId})" stroke="#3A1700" stroke-width="1"/>
          <path d="M 103,0 L 156,0 L 156,14 L 103,14 Z" fill="url(#woodGrad_${tubeId})" stroke="#3A1700" stroke-width="1"/>
          <rect x="54" y="-1" width="3" height="16" rx="0.5" fill="#B45309" opacity="0.95"/>
          <rect x="103" y="-1" width="3" height="16" rx="0.5" fill="#B45309" opacity="0.95"/>
          <circle cx="20" cy="7" r="3.5" fill="#94A3B8" stroke="#334155" stroke-width="0.8"/>
          <circle cx="20" cy="7" r="1.5" fill="#475569"/>
          <circle cx="140" cy="7" r="3.5" fill="#94A3B8" stroke="#334155" stroke-width="0.8"/>
          <circle cx="140" cy="7" r="1.5" fill="#475569"/>
        </g>

        <!-- Glass Test Tube Body & Lip -->
        <rect x="53" y="27" width="54" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" stroke="#94A3B8" stroke-width="1.2"/>
        <path d="M 57,32 L 57,186 Q 57,208 80,208 Q 103,208 103,186 L 103,32 Z" fill="url(#tubeGlassSheen_${tubeId})" stroke="#94A3B8" stroke-width="1.6"/>

        <!-- Frosted Volume Graduations & Brand Patch -->
        <line x1="97" y1="75" x2="103" y2="75" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>
        <text x="94" y="77" font-size="6" fill="#FFFFFF" opacity="0.6" text-anchor="end" font-family="'JetBrains Mono', monospace">10ml</text>
        <line x1="97" y1="120" x2="103" y2="120" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>
        <text x="94" y="122" font-size="6" fill="#FFFFFF" opacity="0.6" text-anchor="end" font-family="'JetBrains Mono', monospace">5ml</text>
        <line x1="97" y1="160" x2="103" y2="160" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>
        <text x="94" y="162" font-size="6" fill="#FFFFFF" opacity="0.6" text-anchor="end" font-family="'JetBrains Mono', monospace">2ml</text>
        <rect x="66" y="46" width="28" height="11" rx="2" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="0.6"/>
        <text x="80" y="54" font-size="5.5" font-weight="800" fill="#CBD5E1" text-anchor="middle" font-family="sans-serif">PYREX®</text>

        <!-- Liquid Column with Volume Rise & Meniscus Ripple -->
        <path class="${isExcess ? 'anim-liquid-rise' : ''}" d="M 58,${topY} L 58,186 Q 58,206 80,206 Q 102,206 102,186 L 102,${topY} Z" fill="url(#liquidGlow_${tubeId})" opacity="${performed ? '0.94' : '0.4'}"/>
        <ellipse cx="80" cy="${topY}" rx="21.5" ry="4.5" fill="${isDeepBlue ? '#1D4ED8' : r.liquidColor}" opacity="${performed ? '0.98' : '0.5'}" class="${performed ? 'anim-meniscus-ripple' : ''}"/>
        <path d="M 58,${topY} Q 80,${topY + 3} 102,${topY}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1.2"/>

        <!-- Soft Diffuse Turbidity Cloud (Reagent Dispersion) -->
        ${performed && isPpt && !r.bubbling ? `
          <g class="anim-ppt-bloom">
            <ellipse cx="80" cy="${topY + 16}" rx="12" ry="14" fill="url(#pptTurbidity_${tubeId})"/>
            <ellipse cx="80" cy="${topY + 34}" rx="16" ry="18" fill="url(#pptTurbidity_${tubeId})"/>
            <ellipse cx="80" cy="${topY + 54}" rx="19" ry="20" fill="url(#pptTurbidity_${tubeId})"/>
          </g>
        ` : ''}

        <!-- Organic / Solid Precipitate Mass at Base -->
        ${performed && isPpt && (!r.bubbling || r.pptColor === '#1E293B' || !r.pptDissolved) ? `
          <g class="anim-ppt-form">
            <path d="M 58,176 C 64,172 70,178 76,173 C 82,170 88,176 94,172 C 98,175 102,173 102,176 Q 102,206 80,206 Q 58,206 58,176 Z" fill="${r.pptColor}" opacity="0.95"/>
            <path d="M 58,184 C 65,181 74,185 82,182 C 90,185 97,181 102,184 Q 102,206 80,206 Q 58,206 58,184 Z" fill="${r.pptColor}" opacity="0.8" filter="brightness(0.9)"/>
            <ellipse cx="68" cy="177" rx="3.8" ry="2" fill="${r.pptColor}" opacity="0.92" filter="brightness(1.1)"/>
            <ellipse cx="80" cy="174" rx="4.5" ry="2.2" fill="${r.pptColor}" opacity="0.96" filter="brightness(1.15)"/>
            <ellipse cx="91" cy="176" rx="3.5" ry="1.9" fill="${r.pptColor}" opacity="0.9" filter="brightness(1.05)"/>
          </g>
        ` : ''}

        <!-- Convection Heat Waves / Steam Wisps when warmed -->
        ${(r.isHeated || stage === 'heated' || stage === 'warm' || stage === 'step2_warm') ? `
          <g class="anim-heat-wave">
            <path d="M 70,${topY - 14} Q 80,${topY - 22} 90,${topY - 14}" stroke="rgba(245, 158, 11, 0.75)" stroke-width="2" fill="none"/>
            <path d="M 72,${topY - 4} Q 80,${topY - 12} 88,${topY - 4}" stroke="rgba(245, 158, 11, 0.6)" stroke-width="2" fill="none"/>
          </g>
        ` : ''}

        <!-- Dissolving Precipitate Transition (Excess / Heat) with Schlieren Refraction -->
        ${performed && isPptDissolved ? `
          <g class="anim-ppt-dissolve">
            <ellipse cx="80" cy="184" rx="16" ry="6" fill="#E2E8F0" opacity="0.3"/>
            <path d="M 68,130 Q 80,124 92,130" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" fill="none"/>
            <path d="M 66,152 Q 80,146 94,152" stroke="rgba(255,255,255,0.35)" stroke-width="1.2" fill="none"/>
          </g>
        ` : ''}

        <!-- Glistening White Needle-Like Crystals of PbCl2 upon cooling -->
        ${(r.isCooled || stage === 'cooled' || stage === 'step3_cool') && (r.isPbNO3 || (r.statusLabel && r.statusLabel.toLowerCase().includes('needle'))) ? `
          <g class="anim-spangle" style="animation-delay: 0s;">
            <polygon points="76,155 84,140 85,141 77,156" fill="#FFFFFF" opacity="0.95"/>
            <line x1="76" y1="155" x2="85" y2="141" stroke="#BAE6FD" stroke-width="0.8"/>
          </g>
          <g class="anim-spangle" style="animation-delay: 0.35s;">
            <polygon points="68,170 86,158 87,159 69,171" fill="#FFFFFF" opacity="0.95"/>
            <line x1="68" y1="170" x2="87" y2="159" stroke="#E0F2FE" stroke-width="0.8"/>
          </g>
          <g class="anim-spangle" style="animation-delay: 0.7s;">
            <polygon points="80,176 94,162 95,163 81,177" fill="#FFFFFF" opacity="0.92"/>
            <line x1="80" y1="176" x2="95" y2="163" stroke="#BAE6FD" stroke-width="0.8"/>
          </g>
          <g class="anim-spangle" style="animation-delay: 1.05s;">
            <polygon points="64,158 76,174 75,175 63,159" fill="#FFFFFF" opacity="0.95"/>
            <line x1="64" y1="158" x2="75" y2="175" stroke="#E0F2FE" stroke-width="0.8"/>
          </g>
          <g class="anim-spangle" style="animation-delay: 1.4s;">
            <polygon points="72,182 86,185 86,186 72,183" fill="#FFFFFF" opacity="0.92"/>
          </g>
        ` : ''}

        <!-- Solid Reagent / Powder Sediment at Base -->
        ${performed && isSpatula ? `
          <ellipse cx="80" cy="198" rx="19" ry="5" fill="${r.isZincDisplacement ? '#B45309' : '#FFFFFF'}" opacity="0.95"/>
          <circle cx="71" cy="195" r="2.8" fill="${r.isZincDisplacement ? '#9A3412' : '#F8FAFC'}"/>
          <circle cx="87" cy="196" r="3.2" fill="${r.isZincDisplacement ? '#78350F' : '#F8FAFC'}"/>
          <circle cx="79" cy="197" r="2.5" fill="${r.isZincDisplacement ? '#92400E' : '#F1F5F9'}"/>
        ` : ''}

        <!-- Bubbles & Froth Header for Acid Effervescence -->
        ${performed && r.bubbling ? `
          <g class="anim-qual-froth">
            <ellipse cx="80" cy="${topY}" rx="20.5" ry="4.5" fill="#FFFFFF" opacity="0.9"/>
            <circle cx="70" cy="${topY - 2}" r="2" fill="#FFFFFF" opacity="0.8"/>
            <circle cx="78" cy="${topY - 3}" r="2.8" fill="#FFFFFF" opacity="0.85"/>
            <circle cx="88" cy="${topY - 2}" r="2.2" fill="#FFFFFF" opacity="0.8"/>
          </g>
          <circle cx="70" cy="175" r="3.2" fill="#FFFFFF" opacity="0.85" class="bubble anim-qual-bubble"/>
          <circle cx="85" cy="162" r="3.8" fill="#FFFFFF" opacity="0.9" class="bubble anim-qual-bubble" style="animation-delay: 0.25s;"/>
          <circle cx="76" cy="148" r="2.8" fill="#FFFFFF" opacity="0.75" class="bubble anim-qual-bubble" style="animation-delay: 0.5s;"/>
          <circle cx="87" cy="132" r="3.4" fill="#FFFFFF" opacity="0.85" class="bubble anim-qual-bubble" style="animation-delay: 0.75s;"/>
          <circle cx="68" cy="116" r="3.0" fill="#FFFFFF" opacity="0.8" class="bubble anim-qual-bubble" style="animation-delay: 0.35s;"/>
          <circle cx="82" cy="102" r="3.5" fill="#FFFFFF" opacity="0.9" class="bubble anim-qual-bubble" style="animation-delay: 0.6s;"/>
        ` : ''}

        <!-- Glass Specular Highlight Curves -->
        <line x1="62" y1="36" x2="62" y2="186" stroke="#FFFFFF" stroke-width="1.8" opacity="0.32" stroke-linecap="round"/>
        <line x1="98" y1="36" x2="98" y2="186" stroke="#FFFFFF" stroke-width="1.2" opacity="0.18" stroke-linecap="round"/>
        <path d="M 66,196 Q 80,204 94,196" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity="0.35"/>
      </svg>
    `;
  }

  // ── 5. Interactive Specimen Watch Glass Renderer ───────────────
  function renderWatchGlassSvg(saltKey = 'leadNitrate', width = 180, height = 150) {
    return renderWatchGlassApparatusSvg({ saltKey, stage: 'idle', width, height });
  }

  // ── 5b. Watch Glass Specimen Examination Apparatus SVG (for Q2 / Q3 Physical Appearance) ──
  function renderWatchGlassApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      stage = 'idle',
      width = 190,
      height = 165,
      tubeId = `wg_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const salt = resolveSalt(saltKey);
    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const prim = salt.crystalColor || '#FFFFFF';
    const sec = salt.crystalSecondary || '#E2E8F0';
    const hi = salt.crystalHighlight || '#FFFFFF';

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 190 165" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
        <defs>
          <radialGradient id="dishGlassGrad_${tubeId}" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.42)"/>
            <stop offset="40%" stop-color="rgba(255,255,255,0.08)"/>
            <stop offset="85%" stop-color="rgba(148,163,184,0.3)"/>
            <stop offset="100%" stop-color="rgba(56,189,248,0.38)"/>
          </radialGradient>
          <linearGradient id="dishRimGrad_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.65)"/>
            <stop offset="50%" stop-color="rgba(255,255,255,0.18)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.55)"/>
          </linearGradient>
          <filter id="crystShadow_${tubeId}" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.38)"/>
          </filter>
        </defs>

        <!-- Lab Bench Slate Surface Shadow -->
        <ellipse cx="95" cy="108" rx="72" ry="24" fill="rgba(15,23,42,0.45)" filter="blur(5px)"/>

        <!-- Stainless Steel Laboratory Micro-Spatula (Resting on Bench) -->
        <g opacity="0.85" transform="rotate(-8 150 110)">
          <path d="M 148,110 L 176,96 L 180,102 L 152,116 Z" fill="#CBD5E1" stroke="#64748B" stroke-width="0.8"/>
          <line x1="178" y1="99" x2="194" y2="90" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
          <line x1="152" y1="113" x2="178" y2="99" stroke="#FFFFFF" stroke-width="0.9" opacity="0.6"/>
        </g>

        <!-- Watch Glass Dish Concave Body -->
        <path d="M 23,80 C 23,122 167,122 167,80" fill="url(#dishGlassGrad_${tubeId})" stroke="url(#dishRimGrad_${tubeId})" stroke-width="2.2"/>
        <ellipse cx="95" cy="80" rx="68" ry="20" fill="rgba(255,255,255,0.04)" stroke="url(#dishRimGrad_${tubeId})" stroke-width="1.4"/>

        <!-- Dynamic Salt Crystals Mound (Habit-tailored) -->
        <g filter="url(#crystShadow_${tubeId})">
          <ellipse cx="95" cy="86" rx="38" ry="13" fill="${sec}" opacity="0.8"/>
          <ellipse cx="95" cy="83" rx="30" ry="10" fill="${prim}"/>

          <!-- Multi-faceted Micro-Crystals (tailored color and geometric habit) -->
          <polygon points="84,74 95,70 101,75 90,80" fill="${hi}" opacity="0.95"/>
          <polygon points="101,75 95,70 111,73 114,79" fill="${sec}" opacity="0.85"/>
          <polygon points="73,78 82,74 88,81 79,85" fill="${prim}"/>
          <polygon points="79,85 88,81 98,84 90,88" fill="${sec}"/>
          <polygon points="103,77 114,77 120,84 110,84" fill="${hi}" opacity="0.9"/>
          <polygon points="110,84 120,84 114,91 104,91" fill="${prim}"/>
          <polygon points="65,82 74,79 81,86 73,89" fill="${sec}"/>
          <polygon points="90,81 100,78 106,85 96,88" fill="${hi}"/>
          <polygon points="82,88 92,86 98,92 88,94" fill="${sec}"/>
          <polygon points="96,87 106,85 110,91 101,93" fill="${hi}"/>

          <!-- Scattered individual crystalline granules -->
          <circle cx="56" cy="82" r="2.4" fill="${prim}"/>
          <circle cx="62" cy="88" r="2.0" fill="${sec}"/>
          <circle cx="126" cy="83" r="2.8" fill="${prim}"/>
          <circle cx="133" cy="86" r="2.2" fill="${hi}"/>
          <circle cx="95" cy="94" r="2.5" fill="${sec}"/>
          <circle cx="118" cy="90" r="2.0" fill="${hi}"/>
          <circle cx="70" cy="91" r="1.8" fill="${prim}"/>
        </g>

        <!-- Specular Sheen Curve on Watch Glass Rim -->
        <path d="M 38,82 C 55,98 135,98 152,82" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" stroke-linecap="round"/>

        <!-- Laboratory Magnifying Inspection Loupe -->
        ${performed ? `
          <!-- Inspection Loupe Centered Over Sample with Optical Zoom -->
          <g class="anim-loupe-inspect">
            <!-- Sturdy Knurled Handle -->
            <line x1="119" y1="98" x2="162" y2="140" stroke="#334155" stroke-width="6.5" stroke-linecap="round"/>
            <line x1="119" y1="98" x2="162" y2="140" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
            <!-- Metal Bezel Frame & Optical Lens -->
            <circle cx="95" cy="76" r="34" fill="none" stroke="#64748B" stroke-width="4"/>
            <circle cx="95" cy="76" r="31" fill="none" stroke="#F59E0B" stroke-width="1"/>
            <circle cx="95" cy="76" r="30" fill="rgba(56,189,248,0.12)"/>
            <path d="M 72,60 A 28 28 0 0 1 118,54" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
            
            <!-- Magnified Internal Crystal Facet Detail -->
            <g transform="translate(10, 0)">
              <polygon points="85,70 98,64 106,72 93,78" fill="${hi}" opacity="0.95"/>
              <polygon points="72,76 84,70 92,79 80,85" fill="${prim}"/>
              <polygon points="94,74 108,74 116,83 102,83" fill="${sec}"/>
            </g>

            <!-- Brilliant 4-Point Star Sparkle Glints under Magnification -->
            <g class="anim-crystal-glint">
              <polygon points="95,64 97,69 102,70 97,71 95,76 93,71 88,70 93,69" fill="#FFFFFF"/>
              <polygon points="80,75 81.5,79 85.5,80 81.5,81 80,85 78.5,81 74.5,80 78.5,79" fill="${hi}"/>
              <polygon points="108,74 109.5,78 113.5,79 109.5,80 108,84 106.5,80 102.5,79 106.5,78" fill="${hi}"/>
            </g>
          </g>
        ` : `
          <!-- Inspection Loupe Resting on Upper Edge -->
          <g opacity="0.8" transform="translate(26, -10)">
            <line x1="105" y1="65" x2="138" y2="32" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
            <line x1="105" y1="65" x2="138" y2="32" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
            <circle cx="85" cy="82" r="26" fill="rgba(255,255,255,0.08)" stroke="#94A3B8" stroke-width="2.5"/>
            <path d="M 68,72 A 20 20 0 0 1 98,68" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.75"/>
          </g>
        `}

        <!-- Specimen Plaque Label -->
        <g transform="translate(18, 136)">
          <rect x="0" y="0" width="154" height="20" rx="4" fill="rgba(15,23,42,0.92)" stroke="#334155" stroke-width="1"/>
          <text x="77" y="14" font-size="8.5" font-weight="800" fill="#38BDF8" text-anchor="middle" font-family="'JetBrains Mono', monospace">
            ${performed ? 'CRYSTALLINE HABIT: OBSERVED' : 'SOLID SPECIMEN Y · KNEC 233/3'}
          </text>
        </g>
      </svg>
    `;
  }

  // ── 5c. Dry Thermal Heating Apparatus SVG (Angled Hard-Glass Tube & Bunsen Flame) ──
  function renderDryHeatingApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      stage = 'idle',
      isHeating = false,
      isCooling = false,
      isTestingProbe = false,
      probe = null,
      prompt = '',
      obsStr = '',
      width = 240,
      height = 205,
      tubeId = `heat_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const salt = resolveSalt(saltKey);
    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const cation = salt.cation;
    const anion = salt.anion;
    const isNitrate = anion === 'NO3-';
    const isGentleHeat = stage === 'gentle_heat' || stage === 'warm';
    const isCooled = stage === 'cooled' || stage === 'cool_down';
    const isStrongHeat = stage === 'heated' || stage === 'strong_heat' || stage === 'step1_heat';
    const isGasTestStage = stage === 'step2_gas_test' || stage.startsWith('test_gas') || stage === 'test_splint' || stage === 'test_limewater';

    const isHydrated = salt.appearance?.toLowerCase().includes('hydrat') ||
      salt.formula?.includes('H2O') ||
      cation === 'Cu2+' || cation === 'Fe2+' || cation === 'Zn2+' ||
      (cation === 'NH4+' && anion === 'CO3^2-') ||
      anion === 'HCO3-' || saltKey === 'sodiumHydrogenCarbonate' ||
      (saltKey === 'copperSulfate' || saltKey === 'ironSulfate' || saltKey === 'zincSulfate' || saltKey === 'aluminumNitrate' || saltKey === 'zincNitrate' || saltKey === 'ironChloride');

    // Gas evolution identification
    const evolvesO2 = isNitrate || anion === 'MnO4-' || saltKey === 'potassiumPermanganate' || anion === 'Cr2O7^2-' || saltKey === 'potassiumDichromate';
    const evolvesNO2 = isNitrate;
    const evolvesNH3 = cation === 'NH4+';
    const evolvesCO2 = (cation === 'NH4+' && anion === 'CO3^2-') || anion === 'HCO3-' || saltKey === 'sodiumHydrogenCarbonate';
    const evolvesSO2 = (cation === 'Fe2+' && anion === 'SO4^2-') || anion === 'SO3^2-';
    const sublimes = cation === 'NH4+' && anion === 'Cl-';
    const decomposesCompletely = cation === 'NH4+' && anion === 'CO3^2-';
    const decrepitates = cation === 'Pb2+' || anion === 'MnO4-' || saltKey === 'potassiumPermanganate';

    // Active Probe Resolver: check explicit probe argument or infer from stage/salt
    let activeProbe = probe;
    if (!activeProbe) {
      if (stage === 'test_gas_blue_litmus') activeProbe = 'blue_litmus';
      else if (stage === 'test_gas_red_litmus') activeProbe = 'red_litmus';
      else if (stage === 'test_splint') activeProbe = 'glowing_splint';
      else if (stage === 'test_limewater') activeProbe = 'limewater';
      else if (isGasTestStage) {
        if (evolvesO2) activeProbe = 'glowing_splint';
        else if (evolvesNH3) activeProbe = 'red_litmus';
        else if (evolvesCO2) activeProbe = 'limewater';
        else if (evolvesSO2) activeProbe = 'blue_litmus';
        else activeProbe = 'blue_litmus';
      }
    }

    // Residue Color Transitions (Hot vs Cold & Absorption Phase)
    let hotPowderColor = salt.crystalColor || '#FFFFFF';
    let residueVisible = true;
    if (performed) {
      if (decomposesCompletely && !isGentleHeat && !isHeating) {
        residueVisible = false; // Ammonium carbonate leaves NO residue!
      } else if (cation === 'Zn2+') {
        hotPowderColor = (isCooled && !isCooling) ? '#FFFFFF' : '#FACC15'; // ZnO canary-yellow hot, pure white cold
      } else if (cation === 'Cu2+') {
        hotPowderColor = '#F1F5F9'; // Anhydrous white powder
      } else if (cation === 'Fe2+') {
        hotPowderColor = '#451A03'; // Dirty brown/black Fe2O3
      } else if (cation === 'Pb2+') {
        hotPowderColor = (isCooled && !isCooling) ? '#FACC15' : '#CA8A04'; // PbO yellow cold, brown/orange hot (#CA8A04)
      } else if (anion === 'MnO4-' || saltKey === 'potassiumPermanganate' || (salt.name && salt.name.includes('Permanganate'))) {
        hotPowderColor = '#0F172A'; // Black/dark greenish-black residue of K2MnO4 + MnO2
      } else if (anion === 'Cr2O7^2-' || saltKey === 'potassiumDichromate' || (salt.name && salt.name.includes('Dichromate'))) {
        hotPowderColor = (isCooled && !isCooling) ? '#14532D' : '#7C2D12'; // Dark green Cr2O3 cold, dark reddish-brown hot
      } else if (isNitrate && cation === 'Al3+') {
        hotPowderColor = '#FFFFFF'; // Al2O3 white residue
      }
    }

    // While absorbing heat (isHeating), crystals stay in initial appearance before decomposing!
    const currentPowderColor = isHeating ? (salt.crystalColor || '#FFFFFF') : hotPowderColor;

    // Litmus & Gas Probe Reaction States (unreacted if currently introducing probe)
    const isAcidicGas = evolvesNO2 || evolvesSO2 || (cation === 'NH4+' && anion === 'Cl-') || saltKey === 'ironChloride';
    const blueLitmusTip = isTestingProbe ? '#3B82F6' : (isAcidicGas ? '#EF4444' : '#3B82F6');
    const redLitmusTip = isTestingProbe ? '#EF4444' : (evolvesNH3 ? '#2563EB' : '#EF4444');
    const splintIgnites = isTestingProbe ? false : evolvesO2;
    const limewaterMilky = isTestingProbe ? false : evolvesCO2;

    // Status Banner Text with Realistic Heating Delays
    let badgeText = 'SOLID SPECIMEN Y IN HARD-GLASS TUBE';
    let badgeColor = '#38BDF8';
    if (isHeating) {
      badgeText = isGentleHeat ? '🔥 GENTLE WARMING: SOLID ABSORBING HEAT...' : '🔥 HEATING STRONGLY: SOLID ABSORBING HEAT...';
      badgeColor = '#F59E0B';
    } else if (isCooling) {
      badgeText = '❄️ TUBE REMOVED FROM FLAME: COOLING DOWN...';
      badgeColor = '#38BDF8';
    } else if (isCooled) {
      badgeText = cation === 'Zn2+' ? '❄️ COOLED: ZnO REVERTED TO WHITE' :
        (cation === 'Pb2+' ? '❄️ COOLED: PbO TURNED YELLOW' :
        (anion === 'Cr2O7^2-' || saltKey === 'potassiumDichromate' ? '❄️ COOLED: DARK GREEN Cr₂O₃ RESIDUE' :
        (decomposesCompletely ? '❄️ COOLED: TUBE IS EMPTY (NO RESIDUE)' : '❄️ COOLED TO ROOM TEMPERATURE')));
      badgeColor = '#38BDF8';
    } else if (activeProbe === 'glowing_splint') {
      if (isTestingProbe) {
        badgeText = '🪵 INTRODUCING GLOWING SPLINT TO TUBE MOUTH...';
        badgeColor = '#F59E0B';
      } else {
        badgeText = splintIgnites ? '🪵 SPLINT REKINDLES INTO FLAME (O₂)' : '🪵 SPLINT EXTINGUISHED (NO O₂)';
        badgeColor = splintIgnites ? '#F59E0B' : '#94A3B8';
      }
    } else if (activeProbe === 'blue_litmus') {
      if (isTestingProbe) {
        badgeText = '🔵 HOLDING MOIST BLUE LITMUS AT MOUTH...';
        badgeColor = '#3B82F6';
      } else {
        badgeText = isAcidicGas ? '🔵 BLUE LITMUS: TURNED RED (ACIDIC)' : '🔵 BLUE LITMUS: UNCHANGED (BLUE)';
        badgeColor = isAcidicGas ? '#EF4444' : '#38BDF8';
      }
    } else if (activeProbe === 'red_litmus') {
      if (isTestingProbe) {
        badgeText = '🔴 HOLDING MOIST RED LITMUS AT MOUTH...';
        badgeColor = '#EF4444';
      } else {
        badgeText = evolvesNH3 ? '🔴 RED LITMUS: TURNED BLUE (ALKALINE)' : '🔴 RED LITMUS: UNCHANGED (RED)';
        badgeColor = evolvesNH3 ? '#38BDF8' : '#EF4444';
      }
    } else if (activeProbe === 'limewater') {
      if (isTestingProbe) {
        badgeText = '🥛 INTRODUCING LIMEWATER DROPLET AT MOUTH...';
        badgeColor = '#94A3B8';
      } else {
        badgeText = limewaterMilky ? '🥛 LIMEWATER: TURNED MILKY (CO₂)' : '🥛 LIMEWATER: REMAINED CLEAR';
        badgeColor = limewaterMilky ? '#E2E8F0' : '#94A3B8';
      }
    } else if (isStrongHeat) {
      badgeText = decrepitates ? '💥 STRONG HEAT: DECREPITATION CRACKLE' : '🔥 HEATING STRONGLY (NON-LUMINOUS)';
      badgeColor = '#F59E0B';
    } else if (isGentleHeat) {
      badgeText = '🔥 GENTLY WARMING TUBE HEEL';
      badgeColor = '#38BDF8';
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 240 205" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
        <defs>
          <linearGradient id="flameInner_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.95"/>
            <stop offset="60%" stop-color="#0284C7" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="flameOuter_${tubeId}" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#2563EB" stop-opacity="0.85"/>
            <stop offset="70%" stop-color="#60A5FA" stop-opacity="0.78"/>
            <stop offset="100%" stop-color="#93C5FD" stop-opacity="0"/>
          </linearGradient>
          <radialGradient id="no2Fumes_${tubeId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#581C87" stop-opacity="0"/>
            <stop offset="20%" stop-color="#78350F" stop-opacity="0.92"/>
            <stop offset="65%" stop-color="#92400E" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#B45309" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="splintBurst_${tubeId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
            <stop offset="30%" stop-color="#FDE047" stop-opacity="0.95"/>
            <stop offset="70%" stop-color="#F97316" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#EF4444" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Retort Stand Heavy Rod & Base -->
        <line x1="18" y1="14" x2="18" y2="188" stroke="#64748B" stroke-width="5" stroke-linecap="round"/>
        <rect x="6" y="180" width="54" height="9" rx="2.5" fill="#1E293B" stroke="#0F172A" stroke-width="1.4"/>
        <line x1="6" y1="182" x2="60" y2="182" stroke="#475569" stroke-width="0.8"/>

        <!-- Heavy Laboratory Bosshead & Clamp holding Tube at 35 degrees -->
        <g transform="translate(18, 76)">
          <line x1="0" y1="0" x2="42" y2="6" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
          <circle cx="0" cy="0" r="5.5" fill="#334155" stroke="#64748B" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="2" fill="#0F172A"/>
          <!-- Tilted Clamp Jaws Gripping Boiling Tube -->
          <rect x="36" y="-6" width="22" height="7.5" rx="2" fill="#78350F" stroke="#3A1700" stroke-width="1" transform="rotate(25 40 0)"/>
          <rect x="36" y="3" width="22" height="7.5" rx="2" fill="#78350F" stroke="#3A1700" stroke-width="1" transform="rotate(25 40 0)"/>
        </g>

        <!-- Hard-Glass Pyrex Boiling Tube (Tilted at 35 degrees) -->
        <g transform="translate(56, 32) rotate(-35 30 70)">
          <!-- Glass Body & Mouth Lip -->
          <rect x="18" y="10" width="30" height="5" rx="2.2" fill="rgba(255,255,255,0.35)" stroke="#94A3B8" stroke-width="1.3"/>
          <path d="M 21,13 L 21,112 Q 21,130 33,130 Q 45,130 45,112 L 45,13 Z" fill="rgba(255,255,255,0.07)" stroke="#94A3B8" stroke-width="1.6"/>

          <!-- Dry Salt Residue Bed at Curved Base of Tube with Smooth Thermal Color Transition -->
          ${residueVisible ? `
            <path d="M 22,98 L 22,112 Q 22,129 33,129 Q 44,129 44,112 L 44,98 Q 33,104 22,98 Z" fill="${currentPowderColor}" style="transition: fill 0.85s cubic-bezier(0.4, 0, 0.2, 1);"/>
          ` : ''}

          <!-- Decrepitation Sparkles (Violently Snapping Crystal Fragments) -->
          ${performed && !isHeating && decrepitates && !isCooled ? `
            <g class="anim-spangle anim-decrepitate">
              <circle cx="28" cy="106" r="2" fill="#FDE047"/>
              <circle cx="38" cy="102" r="1.6" fill="#F59E0B"/>
              <circle cx="33" cy="94" r="1.8" fill="#FFFFFF"/>
              <circle cx="26" cy="114" r="1.8" fill="#FDE047"/>
              <polygon points="34,98 36,94 38,98 36,102" fill="#FFFFFF"/>
              <polygon points="29,112 31,108 33,112 31,116" fill="#FACC15"/>
            </g>
          ` : ''}

          <!-- Condensed Water Droplets on Upper Cooler Walls -->
          ${performed && !isHeating && isHydrated ? `
            <g opacity="0.92">
              <ellipse cx="23" cy="50" rx="2.2" ry="2.8" fill="#BAE6FD"/>
              <ellipse cx="43" cy="58" rx="2.4" ry="3.0" fill="#BAE6FD"/>
              <ellipse cx="23" cy="72" rx="2.2" ry="2.6" fill="#BAE6FD"/>
              <ellipse cx="43" cy="44" rx="2.0" ry="2.5" fill="#BAE6FD"/>
              <ellipse cx="24" cy="62" rx="1.8" ry="2.2" fill="#BAE6FD"/>
              <ellipse cx="42" cy="74" rx="1.9" ry="2.4" fill="#BAE6FD"/>
              <line x1="23" y1="52" x2="23" y2="62" stroke="#BAE6FD" stroke-width="0.9" opacity="0.6"/>
              <line x1="43" y1="60" x2="43" y2="70" stroke="#BAE6FD" stroke-width="0.9" opacity="0.5"/>
            </g>
          ` : ''}

          <!-- Dense Brown NO2 Fumes Inside Tube -->
          ${performed && !isHeating && evolvesNO2 && !isCooled ? `
            <g class="anim-heat-wave">
              <ellipse cx="33" cy="68" rx="10.5" ry="22" fill="url(#no2Fumes_${tubeId})"/>
              <ellipse cx="33" cy="38" rx="11.5" ry="24" fill="url(#no2Fumes_${tubeId})"/>
            </g>
          ` : ''}

          <!-- Sublimation Deposit Ring on Upper Cooler Walls for Ammonium Salts -->
          ${performed && !isHeating && sublimes ? `
            <g opacity="0.95">
              <ellipse cx="33" cy="45" rx="11" ry="3.8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
              <ellipse cx="33" cy="48" rx="10" ry="2.6" fill="#F8FAFC"/>
              <ellipse cx="33" cy="65" rx="8.5" ry="17" fill="rgba(255,255,255,0.45)"/>
            </g>
          ` : ''}

          <!-- Glass Specular Flank Highlight -->
          <path d="M 24,16 L 24,112 Q 24,125 33,125" fill="none" stroke="#FFFFFF" stroke-width="1.3" opacity="0.38"/>

          <!-- ── Interactive Gas Probes at Mouth ── -->
          ${performed && activeProbe === 'blue_litmus' ? `
            <!-- Moist Blue Litmus Paper Held in Forceps -->
            <g transform="translate(0, 0)">
              <!-- Upper unreacted paper (blue) -->
              <path d="M 29,-2 L 37,-2 L 37,8 L 29,8 Z" fill="#3B82F6"/>
              <!-- Lower reacted tip dipped in gas (turns red if acidic fumes) -->
              <path d="M 29,8 L 37,8 L 37,20 L 29,20 Z" fill="${blueLitmusTip}" stroke="${blueLitmusTip === '#EF4444' ? '#DC2626' : '#2563EB'}" stroke-width="0.6"/>
              <!-- Forceps clamp -->
              <line x1="22" y1="-8" x2="31" y2="2" stroke="#94A3B8" stroke-width="2.6" stroke-linecap="round"/>
            </g>
          ` : ''}

          ${performed && activeProbe === 'red_litmus' ? `
            <!-- Moist Red Litmus Paper Held in Forceps -->
            <g transform="translate(0, 0)">
              <!-- Upper unreacted paper (red) -->
              <path d="M 29,-2 L 37,-2 L 37,8 L 29,8 Z" fill="#EF4444"/>
              <!-- Lower reacted tip dipped in gas (turns blue if alkaline NH3) -->
              <path d="M 29,8 L 37,8 L 37,20 L 29,20 Z" fill="${redLitmusTip}" stroke="${redLitmusTip === '#2563EB' ? '#1D4ED8' : '#DC2626'}" stroke-width="0.6"/>
              <!-- Forceps clamp -->
              <line x1="22" y1="-8" x2="31" y2="2" stroke="#94A3B8" stroke-width="2.6" stroke-linecap="round"/>
            </g>
          ` : ''}

          ${performed && activeProbe === 'glowing_splint' ? `
            <!-- Wooden Splint Entering Mouth -->
            <g transform="translate(0, 0)">
              <!-- Wooden Splint Body -->
              <line x1="16" y1="-14" x2="33" y2="16" stroke="#B45309" stroke-width="2.8" stroke-linecap="round"/>
              <line x1="16" y1="-14" x2="28" y2="6" stroke="#D97706" stroke-width="1.2" stroke-linecap="round"/>
              ${splintIgnites ? `
                <!-- Splint Rekindles into Bright Active Flame! -->
                <g class="anim-flame" transform="translate(33, 16)">
                  <circle cx="0" cy="0" r="14" fill="url(#splintBurst_${tubeId})" opacity="0.85"/>
                  <path d="M -4,0 C -6,-10 0,-16 0,-16 C 0,-16 6,-10 4,0 Z" fill="#FDE047"/>
                  <circle cx="0" cy="0" r="3.5" fill="#FFFFFF"/>
                  <circle cx="-3" cy="-5" r="1.5" fill="#F59E0B"/>
                  <circle cx="3" cy="-7" r="1.2" fill="#FDE047"/>
                </g>
              ` : `
                <!-- Extinguished Splint: Charred Tip & Smoke Wisp -->
                <circle cx="33" cy="16" r="2.2" fill="#1E293B"/>
                <circle cx="33" cy="16" r="1.1" fill="#F97316" opacity="0.75"/>
                <path d="M 33,14 Q 36,8 32,2" stroke="#94A3B8" stroke-width="0.9" fill="none" opacity="0.65"/>
              `}
            </g>
          ` : ''}

          ${performed && activeProbe === 'limewater' ? `
            <!-- Limewater Dropper Delivery at Mouth -->
            <g transform="translate(0, 0)">
              <line x1="18" y1="-12" x2="32" y2="12" stroke="#64748B" stroke-width="2.2" stroke-linecap="round"/>
              <circle cx="33" cy="16" r="4.5" fill="${limewaterMilky ? '#F8FAFC' : 'rgba(56,189,248,0.25)'}" stroke="${limewaterMilky ? '#CBD5E1' : '#38BDF8'}" stroke-width="1.2"/>
              ${limewaterMilky ? `<ellipse cx="33" cy="16" rx="2.5" ry="2.5" fill="#E2E8F0"/>` : ''}
            </g>
          ` : ''}
        </g>

        <!-- Billowing NO2 Gas Fumes Escaping from Tube Mouth into Air -->
        ${performed && !isHeating && evolvesNO2 && !isCooled ? `
          <g class="anim-heat-wave" transform="translate(38, 14)">
            <circle cx="24" cy="18" r="9.5" fill="url(#no2Fumes_${tubeId})" opacity="0.88"/>
            <circle cx="16" cy="8" r="13.5" fill="url(#no2Fumes_${tubeId})" opacity="0.78"/>
            <circle cx="8" cy="-2" r="16.5" fill="url(#no2Fumes_${tubeId})" opacity="0.62"/>
          </g>
        ` : ''}

        <!-- Full Laboratory Bunsen Burner Heating Tube Heel -->
        <g transform="translate(98, 122)">
          <!-- Cast-iron Hexagonal Base -->
          <ellipse cx="30" cy="64" rx="28" ry="6" fill="#1E293B" stroke="#0F172A" stroke-width="1.3"/>
          <rect x="25" y="58" width="10" height="6" fill="#334155"/>
          <!-- Metallic Barrel & Air Collar -->
          <rect x="25" y="24" width="10" height="34" fill="#64748B" stroke="#334155" stroke-width="0.8"/>
          <rect x="24" y="44" width="12" height="8" rx="1.5" fill="#475569" stroke="#1E293B" stroke-width="0.6"/>
          <circle cx="30" cy="48" r="2" fill="#0F172A"/>
          <ellipse cx="30" cy="24" rx="5" ry="2" fill="#334155"/>
          <!-- Rubber Gas Tubing -->
          <path d="M 35,62 Q 54,60 72,68" fill="none" stroke="#D97706" stroke-width="3.5" stroke-linecap="round"/>

          ${isCooled || isCooling ? `
            <!-- Flame Extinguished / Burner Swung Away during Cooling -->
          ` : (isGentleHeat ? `
            <!-- Gentle Blue Heating Flame -->
            <g class="anim-flame heatWave anim-heat-wave">
              <path d="M 25,24 C 23,12 27,6 30,6 C 33,6 37,12 35,24 Z" fill="url(#flameOuter_${tubeId})" opacity="0.8"/>
              <path d="M 27,24 C 26,16 28,10 30,10 C 32,10 34,16 33,24 Z" fill="url(#flameInner_${tubeId})" opacity="0.9"/>
            </g>
          ` : (performed ? `
            <!-- Roaring Non-Luminous Bunsen Flame & Heat Waves -->
            <g class="anim-flame heatWave anim-heat-wave">
              <!-- Outer Blue Cone -->
              <path d="M 23,24 C 20,8 25,0 30,0 C 35,0 40,8 37,24 Z" fill="url(#flameOuter_${tubeId})"/>
              <!-- Inner Hot Cyan Core -->
              <path d="M 26,24 C 24,14 27,6 30,6 C 33,6 36,14 34,24 Z" fill="url(#flameInner_${tubeId})"/>
            </g>
          ` : `
            <!-- Pilot Flame -->
            <path d="M 28,24 C 27,18 29,14 30,14 C 31,14 33,18 32,24 Z" fill="#38BDF8" opacity="0.6"/>
          `))}
        </g>

        <!-- Specimen Apparatus Status Plaque -->
        <g transform="translate(18, 180)">
          <rect x="0" y="0" width="204" height="19" rx="4" fill="rgba(15,23,42,0.94)" stroke="#334155" stroke-width="1"/>
          <text x="102" y="13" font-size="8" font-weight="800" fill="${badgeColor}" text-anchor="middle" font-family="'JetBrains Mono', monospace">
            ${badgeText}
          </text>
        </g>
      </svg>
    `;
  }

  // ── 5d. Dissolution in Distilled Water Apparatus SVG ───────────
  function renderDissolutionApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      stage = 'idle',
      isAdding = false,
      prompt = '',
      obsStr = '',
      width = 180,
      height = 215,
      tubeId = `diss_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const salt = resolveSalt(saltKey);
    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const cation = salt.cation;

    let solnColor = 'rgba(56, 189, 248, 0.28)';
    if (cation === 'Cu2+') solnColor = 'rgba(56, 189, 248, 0.65)';
    else if (cation === 'Fe2+') solnColor = 'rgba(16, 185, 129, 0.45)';
    else if (cation === 'Fe3+') solnColor = 'rgba(217, 119, 6, 0.5)';

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 180 215" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.35));">
        <defs>
          <linearGradient id="washBottleGrad_${tubeId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.7)"/>
            <stop offset="40%" stop-color="rgba(255,255,255,0.9)"/>
            <stop offset="100%" stop-color="rgba(203,213,225,0.75)"/>
          </linearGradient>
          <linearGradient id="woodGrad_${tubeId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#9A3412"/>
            <stop offset="40%" stop-color="#78350F"/>
            <stop offset="100%" stop-color="#451A03"/>
          </linearGradient>
        </defs>

        <!-- Wooden Clamp -->
        <g transform="translate(10, 68)">
          <path d="M 4,0 L 57,0 L 57,14 L 4,14 Z" fill="url(#woodGrad_${tubeId})" stroke="#3A1700" stroke-width="1"/>
          <path d="M 103,0 L 156,0 L 156,14 L 103,14 Z" fill="url(#woodGrad_${tubeId})" stroke="#3A1700" stroke-width="1"/>
          <circle cx="20" cy="7" r="3.5" fill="#94A3B8" stroke="#475569" stroke-width="0.8"/>
          <circle cx="140" cy="7" r="3.5" fill="#94A3B8" stroke="#475569" stroke-width="0.8"/>
        </g>

        <!-- Laboratory Polyethylene Wash Bottle with Curved Spout -->
        ${isAdding || (!performed && stage !== 'done') ? `
          <g class="anim-dropper" transform="translate(42, 2)" style="transition: opacity 0.4s ease, transform 0.6s ease; transform: translate(42px, ${performed && !isAdding ? '-25px' : '2px'}); opacity: ${isAdding ? '1' : (performed ? '0' : '0.85')};">
            <!-- Wash Bottle Shoulder & Curved Swan-Neck Spout -->
            <path d="M 88,4 Q 72,6 64,18 L 54,30" fill="none" stroke="url(#washBottleGrad_${tubeId})" stroke-width="4.5" stroke-linecap="round"/>
            <path d="M 54,30 L 50,35" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
            ${isAdding ? `
              <!-- Laminar Stream of Distilled Water Shooting into Tube -->
              <line x1="49" y1="35" x2="48" y2="78" stroke="rgba(56,189,248,0.85)" stroke-width="2.2" stroke-linecap="round" class="anim-droplet"/>
            ` : ''}
          </g>
        ` : ''}

        <!-- Boiling Tube Body & Lip -->
        <g transform="translate(10, 0)">
          <rect x="53" y="27" width="54" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" stroke="#94A3B8" stroke-width="1.2"/>
          <path d="M 57,32 L 57,186 Q 57,208 80,208 Q 103,208 103,186 L 103,32 Z" fill="rgba(255,255,255,0.05)" stroke="#94A3B8" stroke-width="1.6"/>

          ${performed ? `
            <!-- Dissolved Solution Column -->
            <path d="M 58,82 L 58,186 Q 58,206 80,206 Q 102,206 102,186 L 102,82 Z" fill="${solnColor}" class="anim-liquid-rise"/>
            <ellipse cx="80" cy="82" rx="21.5" ry="4.5" fill="${solnColor}" class="anim-meniscus-ripple"/>
            <!-- Swirling Dissolution Vortex Waves -->
            <g opacity="0.75">
              <path d="M 68,115 Q 80,108 92,115" stroke="rgba(255,255,255,0.6)" stroke-width="1.6" fill="none"/>
              <path d="M 66,140 Q 80,132 94,140" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" fill="none"/>
              <path d="M 70,165 Q 80,158 90,165" stroke="rgba(255,255,255,0.4)" stroke-width="1.4" fill="none"/>
            </g>
          ` : `
            <!-- Dry Solid Crystals at Bottom Awaiting Water -->
            <ellipse cx="80" cy="192" rx="18" ry="8" fill="${salt.crystalColor || '#FFFFFF'}" opacity="0.95"/>
            <circle cx="72" cy="188" r="3.2" fill="${salt.crystalHighlight || '#FFFFFF'}"/>
            <circle cx="88" cy="190" r="3.8" fill="${salt.crystalSecondary || '#CBD5E1'}"/>
            <circle cx="80" cy="196" r="3.5" fill="${salt.crystalColor || '#FFFFFF'}"/>
          `}

          <!-- Specular Flank Highlight -->
          <line x1="62" y1="36" x2="62" y2="186" stroke="#FFFFFF" stroke-width="1.8" opacity="0.32" stroke-linecap="round"/>
        </g>
      </svg>
    `;
  }

  // ── 5e. Flame Test Apparatus SVG (Bunsen Burner & Clean Borosilicate Glass Rod) ──
  function renderFlameTestApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      stage = 'idle',
      prompt = '',
      width = 180,
      height = 200,
      tubeId = `flame_${Math.random().toString(36).substring(2, 7)}`,
      isCobaltGlass = false
    } = options;

    const salt = resolveSalt(saltKey);
    const performed = stage !== 'idle' && stage !== 'untested' && Boolean(stage);
    const cation = salt.cation;

    // Characteristic Emission Spectra
    let flameColor = '#38BDF8';
    let flameOuter = '#0284C7';
    let glowRadius = 40;
    if (performed) {
      if (cation === 'Ca2+') {
        flameColor = isCobaltGlass ? 'rgba(148, 163, 184, 0.35)' : '#EA580C'; // Brick red / carmine
        flameOuter = isCobaltGlass ? 'rgba(100, 116, 139, 0.25)' : '#DC2626';
        glowRadius = isCobaltGlass ? 25 : 55;
      } else if (cation === 'Cu2+') {
        flameColor = isCobaltGlass ? '#38BDF8' : '#06B6D4'; // Brilliant peacock blue-green
        flameOuter = isCobaltGlass ? '#0284C7' : '#059669';
        glowRadius = isCobaltGlass ? 45 : 60;
      } else if (cation === 'Ba2+') {
        flameColor = isCobaltGlass ? 'rgba(100, 116, 139, 0.3)' : '#84CC16'; // Pale apple-green
        flameOuter = isCobaltGlass ? 'rgba(71, 85, 105, 0.22)' : '#65A30D';
        glowRadius = isCobaltGlass ? 20 : 50;
      } else if (salt.key.includes('sodium') || salt.name.includes('Sodium') || cation === 'Na+') {
        // KNEC Guideline: Cobalt blue glass completely absorbs 589nm sodium golden yellow!
        flameColor = isCobaltGlass ? 'rgba(148, 163, 184, 0.22)' : '#FACC15'; // Intense golden yellow
        flameOuter = isCobaltGlass ? 'rgba(100, 116, 139, 0.18)' : '#EAB308';
        glowRadius = isCobaltGlass ? 15 : 70;
      } else if (salt.key.includes('potassium') || salt.name.includes('Potassium') || cation === 'K+') {
        // KNEC Guideline: Cobalt blue glass transmits violet/lilac light (766 & 404 nm) of potassium clearly!
        flameColor = isCobaltGlass ? '#F472B6' : '#C084FC'; // Delicate lilac / vivid purple
        flameOuter = isCobaltGlass ? '#C084FC' : '#A855F7';
        glowRadius = isCobaltGlass ? 62 : 52;
      } else if (cation === 'Pb2+') {
        flameColor = isCobaltGlass ? 'rgba(100, 116, 139, 0.3)' : '#94A3B8'; // Dull grayish-blue
        flameOuter = isCobaltGlass ? 'rgba(71, 85, 105, 0.22)' : '#64748B';
        glowRadius = isCobaltGlass ? 20 : 42;
      }
    }

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 180 200" style="max-width:100%; height:auto; display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
        <defs>
          <radialGradient id="flameGlow_${tubeId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${flameColor}" stop-opacity="0.85"/>
            <stop offset="60%" stop-color="${flameOuter}" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="${flameOuter}" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Bunsen Burner Cast-Iron Base & Chimney -->
        <g transform="translate(54, 80)">
          <!-- Base -->
          <ellipse cx="36" cy="106" rx="42" ry="9" fill="#1E293B" stroke="#0F172A" stroke-width="1.5"/>
          <rect x="30" y="96" width="12" height="10" fill="#334155"/>
          <!-- Chimney Barrel -->
          <rect x="29" y="30" width="14" height="66" fill="#64748B" stroke="#334155" stroke-width="1"/>
          <!-- Air Intake Collar -->
          <rect x="27" y="66" width="18" height="12" rx="2" fill="#475569" stroke="#1E293B" stroke-width="0.8"/>
          <circle cx="36" cy="72" r="3.2" fill="#0F172A"/>
          <ellipse cx="36" cy="30" rx="7" ry="2.5" fill="#475569"/>
          <!-- Rubber Gas Hose -->
          <path d="M 42,102 Q 65,98 84,108" fill="none" stroke="#D97706" stroke-width="4.5" stroke-linecap="round"/>
        </g>

        <!-- Radiant Emission Glow Halo -->
        ${performed ? `
          <circle cx="90" cy="80" r="${glowRadius}" fill="url(#flameGlow_${tubeId})" opacity="${isCobaltGlass && (salt.key.includes('sodium') || cation === 'Na+') ? '0.15' : '0.85'}"/>
        ` : ''}

        <!-- Dynamic Combustion Flame -->
        <g class="anim-flame" transform="translate(0, 0)">
          <!-- Outer Flame Cone -->
          <path d="M 80,110 C 72,70 82,34 90,34 C 98,34 108,70 100,110 Z" fill="${flameOuter}" opacity="${isCobaltGlass && (salt.key.includes('sodium') || cation === 'Na+') ? '0.2' : '0.85'}"/>
          <!-- Inner Hot Cone -->
          <path d="M 84,110 C 81,84 87,55 90,55 C 93,55 99,84 96,110 Z" fill="${flameColor}" opacity="${isCobaltGlass && (salt.key.includes('sodium') || cation === 'Na+') ? '0.25' : '0.95'}"/>
        </g>

        <!-- Clean Borosilicate Glass Rod Assembly (KNEC Standard) -->
        <g transform="${performed ? 'translate(0, 0)' : 'translate(36, -24)'}" style="transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);">
          <!-- Borosilicate Glass Rod Body -->
          <line x1="14" y1="14" x2="86" y2="86" stroke="rgba(255,255,255,0.75)" stroke-width="5" stroke-linecap="round"/>
          <line x1="14" y1="14" x2="86" y2="86" stroke="#94A3B8" stroke-width="5" stroke-linecap="round" opacity="0.3"/>
          <line x1="15" y1="12" x2="84" y2="81" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
          <!-- Rounded Glass Tip -->
          <ellipse cx="87" cy="87" rx="3.5" ry="3.5" fill="rgba(255,255,255,0.9)" stroke="#CBD5E1" stroke-width="0.8"/>
          <!-- Solution Droplet on Tip -->
          <circle cx="88" cy="88" r="3" fill="${performed ? '#FFFFFF' : 'rgba(56,189,248,0.85)'}" stroke="${performed ? flameColor : '#FFFFFF'}" stroke-width="1" opacity="0.95"/>
          ${performed ? `
            <!-- Incandescent Emission at Glass Rod Tip -->
            <circle cx="88" cy="88" r="5" fill="${flameColor}" opacity="0.55"/>
          ` : ''}
        </g>

        ${isCobaltGlass ? `
          <!-- Cobalt Blue Glass Optical Filter Plate (KNEC Standard) -->
          <g transform="translate(0, 0)">
            <rect x="8" y="8" width="164" height="184" rx="8" fill="rgba(30, 58, 138, 0.38)" stroke="#3B82F6" stroke-width="2.5"/>
            <rect x="14" y="14" width="98" height="18" rx="4" fill="#1E3A8A" opacity="0.92"/>
            <text x="63" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" font-weight="800" fill="#93C5FD" text-anchor="middle" letter-spacing="0.5">COBALT GLASS</text>
          </g>
        ` : ''}
      </svg>
    `;
  }

  // Unified Dispatcher: Dispatches to the exact apparatus based on procedure prompt & test ID
  function renderApparatusSvg(options = {}) {
    const {
      saltKey = 'leadNitrate',
      testId = '',
      stage = 'idle',
      isAdding = false,
      prompt = '',
      obsStr = '',
      tubeId = `app_${Math.random().toString(36).substring(2, 7)}`
    } = options;

    const pStr = (prompt || '').toLowerCase();
    const tId = (testId || '').toLowerCase();

    // 1. Physical Appearance of Solid
    if (
      pStr.includes('physical appearance') ||
      pStr.includes('appearance of solid') ||
      pStr.includes('describe solid') ||
      pStr.includes('appearance of sample') ||
      (pStr.includes('appearance') && !pStr.includes('dissolv') && !pStr.includes('water')) ||
      (tId.includes('appearance') && !pStr.includes('water')) ||
      (tId === 't1' && pStr.includes('describe') && pStr.includes('solid'))
    ) {
      return renderWatchGlassApparatusSvg({ saltKey, stage, prompt, tubeId });
    }

    // 2. Flame Test
    if (
      pStr.includes('flame test') ||
      pStr.includes('nichrome') ||
      (pStr.includes('glass rod') && (pStr.includes('flame') || pStr.includes('bunsen'))) ||
      (pStr.includes('solution') && pStr.includes('flame') && !pStr.includes('heat') && !pStr.includes('warm')) ||
      tId.includes('flame')
    ) {
      return renderFlameTestApparatusSvg({
        saltKey,
        stage,
        prompt,
        tubeId,
        isCobaltGlass: Boolean(options.isCobaltGlass)
      });
    }

    // 3. Dry Thermal Heating
    if (
      (pStr.includes('heat') && (pStr.includes('dry') || pStr.includes('strongly') || pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('test tube'))) ||
      tId.includes('heat') ||
      tId.includes('ignit')
    ) {
      return renderDryHeatingApparatusSvg(options);
    }

    // 4. Dissolution in Distilled Water
    if (
      pStr.includes('dissolv') ||
      (pStr.includes('distilled water') && (pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('portion')))
    ) {
      return renderDissolutionApparatusSvg({ saltKey, stage, isAdding, prompt, obsStr, tubeId });
    }

    // 5. Standard Reagent Test Tube
    return renderTubeSvg(options);
  }

  // ── 6. Step Action Buttons & Flow Machine ──────────────────────
  function getMultiStageActions(testId, prompt, stage = 'idle', testKeyOverride = null) {
    const pStr = (prompt || '').toLowerCase();
    const tId = (testId || '').toLowerCase();

    // 0. Physical Appearance of Solid
    if (
      pStr.includes('physical appearance') ||
      pStr.includes('appearance of solid') ||
      pStr.includes('describe solid') ||
      pStr.includes('appearance of sample') ||
      (pStr.includes('appearance') && !pStr.includes('dissolv') && !pStr.includes('water')) ||
      (tId.includes('appearance') && !pStr.includes('water')) ||
      (tId === 't1' && pStr.includes('describe') && pStr.includes('solid'))
    ) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'inspected', label: '🔍 Inspect Solid Specimen Y', cls: 'btn-perform-test btn-step-inspect' }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Sample Inspected', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Re-examine', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 0b. Dissolving Solid in Distilled Water
    if (
      pStr.includes('dissolv') ||
      (pStr.includes('distilled water') && (pStr.includes('solid') || pStr.includes('spatula') || pStr.includes('portion')))
    ) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'dissolved', label: '💧 Add Distilled Water & Dissolve', cls: 'btn-perform-test btn-step-dissolve' }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Stock Solution Formed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 0c. Flame Test
    if (
      pStr.includes('flame test') ||
      pStr.includes('nichrome') ||
      (pStr.includes('glass rod') && (pStr.includes('flame') || pStr.includes('bunsen'))) ||
      (pStr.includes('solution') && pStr.includes('flame') && !pStr.includes('heat') && !pStr.includes('warm')) ||
      tId.includes('flame')
    ) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'flame_tested', label: '🔥 Place Glass Rod into Flame', cls: 'btn-perform-test btn-step-heat' }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Flame Color Recorded', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 1. NaOH or NH3: Step 1 (Dropwise) -> Step 2 (Excess)
    const isNaOH = tId.includes('naoh') || pStr.includes('naoh') || pStr.includes('sodium hydroxide');
    const isNH3 = tId.includes('nh3') || pStr.includes('nh3') || pStr.includes('ammonia') || pStr.includes('aqueous ammonia') || pStr.includes('nh₄oh') || pStr.includes('nh4oh');
    if (isNaOH || isNH3) {
      const reagentLabel = isNaOH ? 'NaOH' : 'NH₃';
      if (!stage || stage === 'idle') {
        return [
          { stage: 'few_drops', label: `💧 Step 1: Add Dropwise (2–3 drops ${reagentLabel})`, cls: 'btn-perform-test' }
        ];
      } else if (stage === 'few_drops' || stage === 'step1') {
        return [
          { stage: 'excess', label: `🧪 Step 2: Add in Excess (~5 cm³ ${reagentLabel})`, cls: 'btn-perform-test btn-step-excess' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 2. Potassium Iodide (KI): Step 1 (Add KI) -> Step 2 (Warm) -> Step 3 (Cool)
    if (tId.includes('ki') || pStr.includes('potassium iodide') || pStr.includes('iodide')) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'few_drops', label: '💧 Step 1: Add 2–3 drops KI Solution', cls: 'btn-perform-test' }
        ];
      } else if (stage === 'few_drops' || stage === 'stage1') {
        return [
          { stage: 'heated', label: '🔥 Step 2: Warm Gently in Bunsen Flame', cls: 'btn-perform-test btn-step-heat' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else if (stage === 'heated') {
        return [
          { stage: 'cooled', label: '❄️ Step 3: Allow to Cool under Tap', cls: 'btn-perform-test btn-step-cool' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Test Completed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 2b. Lead(II) Nitrate Test with Warming & Cooling (KCSE Standard Anion Test)
    const isPbNO3 = tId.includes('pb_no3') || tId.includes('pbno3') ||
      (pStr.includes('lead') && (pStr.includes('nitrate') || pStr.includes('(ii)'))) ||
      pStr.includes('pb(no3)2') || pStr.includes('pb(no₃)₂');
    if (isPbNO3) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'few_drops', label: '💧 Step 1: Add 2–3 drops Lead(II) Nitrate [Pb(NO₃)₂]', cls: 'btn-perform-test' }
        ];
      } else if (stage === 'few_drops' || stage === 'stage1') {
        return [
          { stage: 'heated', label: '🔥 Step 2: Warm Gently in Bunsen Flame', cls: 'btn-perform-test btn-step-heat' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else if (stage === 'heated' || stage === 'warm' || stage === 'step2_warm') {
        return [
          { stage: 'cooled', label: '❄️ Step 3: Allow to Cool under Tap', cls: 'btn-perform-test btn-step-cool' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Observation Recorded', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 2c. Hydrogen Peroxide (H2O2) Test: Step 1 (Add H2O2) -> Step 2 (Test Gas with Glowing Splint if effervescent/catalytic)
    const isH2O2 = tId.includes('h2o2') || tId.includes('peroxide') ||
      pStr.includes('hydrogen peroxide') || pStr.includes('h2o2') || pStr.includes('h₂o₂');
    if (isH2O2) {
      const hasGasOrSplint = pStr.includes('splint') || pStr.includes('gas') || pStr.includes('effervesc') ||
        pStr.includes('solid d') || pStr.includes('mno2') || pStr.includes('manganese') || pStr.includes('catalyst') ||
        tId.includes('peroxide');
      if (!stage || stage === 'idle') {
        return [
          { stage: 'added_h2o2', label: '💧 Step 1: Add 1 cm³ Hydrogen Peroxide (H₂O₂)', cls: 'btn-perform-test' }
        ];
      } else if ((stage === 'added_h2o2' || stage === 'few_drops' || stage === 'stage1') && hasGasOrSplint) {
        return [
          { stage: 'splint_test', label: '🪵 Step 2: Test Gas with Glowing Splint', cls: 'btn-perform-test btn-step-gas' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Reaction Observed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 2d. Solid Sodium Hydrogen Carbonate (NaHCO3) Test: Step 1 (Add solid NaHCO3) -> Step 2 (Test Gas with Limewater if effervescent)
    const isNaHCO3 = tId.includes('nahco3') || tId.includes('hydrogencarbonate') || tId.includes('bicarbonate') ||
      pStr.includes('nahco3') || pStr.includes('sodium hydrogen carbonate') || pStr.includes('sodium hydrogencarbonate') ||
      pStr.includes('bicarbonate') || (pStr.includes('solid') && (pStr.includes('carbonate') || pStr.includes('nahco3')));
    if (isNaHCO3) {
      const hasLimewaterOrGas = pStr.includes('limewater') || pStr.includes('calcium hydroxide') || pStr.includes('gas') || pStr.includes('effervesc');
      if (!stage || stage === 'idle') {
        return [
          { stage: 'added_nahco3', label: '🥄 Step 1: Add Spatula-End of Solid NaHCO₃', cls: 'btn-perform-test' }
        ];
      } else if ((stage === 'added_nahco3' || stage === 'few_drops' || stage === 'stage1') && hasLimewaterOrGas) {
        return [
          { stage: 'limewater_test', label: '🧪 Step 2: Test Gas with Limewater (Ca(OH)₂)', cls: 'btn-perform-test btn-step-gas' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Reaction Observed', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // 6. Heating solid
    if (
      (pStr.includes('heat') && (pStr.includes('dry') || pStr.includes('strongly') || pStr.includes('solid') || pStr.includes('spatula'))) ||
      tId.includes('heat') ||
      tId.includes('ignit')
    ) {
      if (!stage || stage === 'idle') {
        return [
          { stage: 'heated', label: '🔥 Step 1: Heat Strongly in Bunsen Flame', cls: 'btn-perform-test btn-step-heat' }
        ];
      } else if (stage === 'heated' || stage === 'step1_heat') {
        return [
          { stage: 'step2_gas_test', label: '🧪 Step 2: Test Gas (Moist Litmus / Splint)', cls: 'btn-perform-test btn-step-gas' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else if (stage === 'step2_gas_test' || stage.startsWith('test_gas') || stage === 'test_splint' || stage === 'test_limewater') {
        return [
          { stage: 'cooled', label: '❄️ Step 3: Allow Tube to Cool', cls: 'btn-perform-test btn-step-cool' },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      } else {
        return [
          { stage: 'done', label: '✅ Thermal Observation Recorded', cls: 'btn-perform-test done', disabled: true },
          { stage: 'idle', label: '↺ Redo Test', cls: 'btn-redo-test', isRedo: true }
        ];
      }
    }

    // Default 1-step test
    if (!stage || stage === 'idle') {
      return [
        { stage: 'stage1', label: '🧪 Perform Test Procedure', cls: 'btn-perform-test' }
      ];
    } else {
      return [
        { stage: 'done', label: '✅ Reaction Observed', cls: 'btn-perform-test done', disabled: true },
        { stage: 'idle', label: '↺ Redo', cls: 'btn-redo-test', isRedo: true }
      ];
    }
  }

  // ── 7. Public API Export ───────────────────────────────────────
  const QualitativeBenchCore = {
    SALTS,
    resolveSalt,
    parseAndSynthesizeSalt,
    resolveReactionState,
    renderTubeSvg,
    renderTestTubeApparatusSvg: renderTubeSvg,
    renderWatchGlassSvg,
    renderWatchGlassApparatusSvg,
    renderDryHeatingApparatusSvg,
    renderDissolutionApparatusSvg,
    renderFlameTestApparatusSvg,
    renderApparatusSvg,
    getMultiStageActions,
    playDropSplashSound,
    playEffervescenceSound,
    playFlameSound,
    playCrystalInspectSound,
    playDecrepitationSound,
    playSplintRelightSound,
    playDropletSizzleSound,
    playReactionSound: function(reactionStateOrType, isExcess = false) {
      if (typeof reactionStateOrType === 'string') {
        if (reactionStateOrType === 'effervescence' || reactionStateOrType === 'bubbling') playEffervescenceSound();
        else if (reactionStateOrType === 'flame' || reactionStateOrType === 'heat') playFlameSound();
        else if (reactionStateOrType === 'inspect') playCrystalInspectSound();
        else if (reactionStateOrType === 'decrepitate') playDecrepitationSound();
        else if (reactionStateOrType === 'splint') playSplintRelightSound();
        else if (reactionStateOrType === 'sizzle') playDropletSizzleSound();
        else playDropSplashSound(isExcess);
      } else if (reactionStateOrType && typeof reactionStateOrType === 'object') {
        if (reactionStateOrType.soundType === 'splint' || reactionStateOrType.stage === 'splint_test') playSplintRelightSound();
        else if (reactionStateOrType.decrepitates) playDecrepitationSound();
        else if (reactionStateOrType.bubbling) playEffervescenceSound();
        else if (reactionStateOrType.isHeated || reactionStateOrType.soundType === 'flame') playFlameSound();
        else if (reactionStateOrType.isPhysicalAppearance || reactionStateOrType.soundType === 'inspect') playCrystalInspectSound();
        else playDropSplashSound(reactionStateOrType.isExcess);
      } else {
        playDropSplashSound(isExcess);
      }
    }
  };

  global.QualitativeBenchCore = QualitativeBenchCore;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = QualitativeBenchCore;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

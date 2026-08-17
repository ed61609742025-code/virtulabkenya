// ============================================================
//  VirtuLab Kenya — Canonical Qualitative Salts Registry
//  Server-Side Source of Truth for KCSE Paper 3 Qualitative Analysis
// ============================================================

const SALTS = {
  ammoniumChloride: {
    name: 'Ammonium Chloride',
    formula: 'NH₄Cl',
    cation: 'NH4+',
    anion: 'Cl-',
    cationDisplay: 'NH₄⁺',
    anionDisplay: 'Cl⁻'
  },
  copperSulfate: {
    name: 'Copper(II) Sulfate',
    formula: 'CuSO₄',
    cation: 'Cu2+',
    anion: 'SO4^2-',
    cationDisplay: 'Cu²⁺',
    anionDisplay: 'SO₄²⁻'
  },
  ironSulfate: {
    name: 'Iron(II) Sulfate',
    formula: 'FeSO₄',
    cation: 'Fe2+',
    anion: 'SO4^2-',
    cationDisplay: 'Fe²⁺',
    anionDisplay: 'SO₄²⁻'
  },
  sodiumCarbonate: {
    name: 'Sodium Carbonate',
    formula: 'Na₂CO₃',
    cation: 'Na+',
    anion: 'CO3^2-',
    cationDisplay: 'Na⁺',
    anionDisplay: 'CO₃²⁻'
  },
  calciumChloride: {
    name: 'Calcium Chloride',
    formula: 'CaCl₂',
    cation: 'Ca2+',
    anion: 'Cl-',
    cationDisplay: 'Ca²⁺',
    anionDisplay: 'Cl⁻'
  },
  potassiumChloride: {
    name: 'Potassium Chloride',
    formula: 'KCl',
    cation: 'K+',
    anion: 'Cl-',
    cationDisplay: 'K⁺',
    anionDisplay: 'Cl⁻'
  },
  leadNitrate: {
    name: 'Lead(II) Nitrate',
    formula: 'Pb(NO₃)₂',
    cation: 'Pb2+',
    anion: 'NO3-',
    cationDisplay: 'Pb²⁺',
    anionDisplay: 'NO₃⁻'
  },
  zincSulfate: {
    name: 'Zinc Sulfate',
    formula: 'ZnSO₄',
    cation: 'Zn2+',
    anion: 'SO4^2-',
    cationDisplay: 'Zn²⁺',
    anionDisplay: 'SO₄²⁻'
  },
  aluminumNitrate: {
    name: 'Aluminum Nitrate',
    formula: 'Al(NO₃)₃',
    cation: 'Al3+',
    anion: 'NO3-',
    cationDisplay: 'Al³⁺',
    anionDisplay: 'NO₃⁻'
  },
  ironChloride: {
    name: 'Iron(III) Chloride',
    formula: 'FeCl₃',
    cation: 'Fe3+',
    anion: 'Cl-',
    cationDisplay: 'Fe³⁺',
    anionDisplay: 'Cl⁻'
  },
  ammoniumCarbonate: {
    name: 'Ammonium Carbonate',
    formula: '(NH₄)₂CO₃',
    cation: 'NH4+',
    anion: 'CO3^2-',
    cationDisplay: 'NH₄⁺',
    anionDisplay: 'CO₃²⁻'
  },
  zincNitrate: {
    name: 'Zinc Nitrate',
    formula: 'Zn(NO₃)₂',
    cation: 'Zn2+',
    anion: 'NO3-',
    cationDisplay: 'Zn²⁺',
    anionDisplay: 'NO₃⁻'
  }
};

function getSalt(key) {
  return SALTS[key] || null;
}

function getAllSaltKeys() {
  return Object.keys(SALTS);
}

module.exports = {
  SALTS,
  getSalt,
  getAllSaltKeys
};

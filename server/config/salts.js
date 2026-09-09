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

const CANONICAL_OBSERVATIONS = {
  zincSulfate: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'White ppt, dissolves in excess → colorless solution' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'No characteristic flame colour' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'White ppt (BaSO₄), insoluble in dil. HCl → SO₄²⁻' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  copperSulfate: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'Pale blue ppt, insoluble in excess NaOH' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'Pale blue ppt, dissolves in excess to form a deep blue solution' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'Blue-green (viridian) flame' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'White ppt (BaSO₄), insoluble in dil. HCl → SO₄²⁻' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  ironSulfate: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'Dirty green ppt, insoluble in excess NaOH' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'Dirty green ppt, insoluble in excess' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'No characteristic flame colour' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'White ppt (BaSO₄), insoluble in dil. HCl → SO₄²⁻' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  sodiumCarbonate: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'No visible reaction' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'No visible reaction' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'Persistent golden yellow flame' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'Brisk effervescence; gas turns limewater milky (CO₂)' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  calciumChloride: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'White ppt, insoluble in excess NaOH' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'No visible reaction' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'Brick-red / crimson flame' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  potassiumChloride: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'No visible reaction' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'No visible reaction' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'Lilac flame (crimson through cobalt blue glass)' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  leadNitrate: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'White ppt, insoluble in excess NH₃' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'Pale blue-white flame' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'White ppt of PbCl₂ (soluble in hot water)' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'Bright canary-yellow ppt (PbI₂), dissolves on heating to golden sparkles → Pb²⁺' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'Distinct brown ring formed at the liquid-liquid interface → NO₃⁻' }
  ],
  aluminumNitrate: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'White ppt, insoluble in excess NH₃' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'No characteristic flame colour' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'Distinct brown ring formed at the liquid-liquid interface → NO₃⁻' }
  ],
  ironChloride: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'Reddish-brown ppt, insoluble in excess NaOH' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'Reddish-brown ppt, insoluble in excess' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'No characteristic flame colour' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  ammoniumCarbonate: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'No ppt; pungent ammonia gas evolved on warming' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'No visible reaction' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'No characteristic flame colour' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'Brisk effervescence; gas turns limewater milky (CO₂)' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  ammoniumChloride: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'No ppt; pungent ammonia gas evolved on warming' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'No visible reaction' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'No characteristic flame colour' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'White ppt (AgCl), dissolves in dilute NH₃ → Cl⁻' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  zincNitrate: [
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'White ppt, dissolves in excess → colorless solution' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'No characteristic flame colour' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'Distinct brown ring formed at the liquid-liquid interface → NO₃⁻' }
  ]
};

function getCanonicalObservations(saltKey) {
  return CANONICAL_OBSERVATIONS[saltKey] || CANONICAL_OBSERVATIONS.zincSulfate;
}

function getSalt(key) {
  return SALTS[key] || null;
}

function getAllSaltKeys() {
  return Object.keys(SALTS);
}

module.exports = {
  SALTS,
  CANONICAL_OBSERVATIONS,
  getSalt,
  getAllSaltKeys,
  getCanonicalObservations
};

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
  },
  sodiumSulfite: {
    name: 'Sodium Sulfite',
    formula: 'Na₂SO₃',
    cation: 'Na+',
    anion: 'SO3^2-',
    cationDisplay: 'Na⁺',
    anionDisplay: 'SO₃²⁻'
  },
  potassiumBromide: {
    name: 'Potassium Bromide',
    formula: 'KBr',
    cation: 'K+',
    anion: 'Br-',
    cationDisplay: 'K⁺',
    anionDisplay: 'Br⁻'
  },
  sodiumIodide: {
    name: 'Sodium Iodide',
    formula: 'NaI',
    cation: 'Na+',
    anion: 'I-',
    cationDisplay: 'Na⁺',
    anionDisplay: 'I⁻'
  }
};

const CANONICAL_OBSERVATIONS = {
  zincSulfate: [
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'Solid turns yellow when hot, white on cooling (ZnO); water droplets condense on upper tube walls' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'Blue crystalline solid turns white anhydrous powder (CuSO₄); colorless water droplets condense on cooler tube walls' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'Pale green crystals turn dirty brown/black (Fe₂O₃); water droplets condense; choking SO₂ gas evolved on strong heating' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'White solid remains unchanged; no gas evolved or water droplets formed (thermally stable)' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'White deliquescent solid loses moisture; water droplets condense; no gas evolved' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'White crystalline solid decrepitates slightly; melts at high temperature; no gas evolved' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'Decrepitates (crackles); brown fumes of NO₂ turn blue litmus red; gas relights glowing splint (O₂); residue yellow cold, brown hot (PbO)' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'Brown fumes of NO₂ turn blue litmus red; gas relights glowing splint (O₂); white residue (Al₂O₃)' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'Yellow-brown solid loses water; on strong heating, sublimes giving reddish-brown vapor and steamy acidic fumes' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'Decomposes completely with no residue; alkaline pungent gas (NH₃) turns red litmus blue; gas turns limewater milky (CO₂)' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'White solid sublimes directly; dense white fumes deposit on upper cooler walls of test tube' },
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
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'Brown fumes of NO₂ turn blue litmus red; gas relights glowing splint (O₂); residue yellow when hot, white on cooling (ZnO)' },
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'White ppt, dissolves in excess to form a colorless solution (amphoteric)' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'White ppt, dissolves in excess → colorless solution' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'No characteristic flame colour' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'Distinct brown ring formed at the liquid-liquid interface → NO₃⁻' }
  ],
  sodiumSulfite: [
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'White solid remains largely unchanged; on strong heating, faint pungent choking smell of SO₂' },
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'No visible reaction' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'No visible reaction' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'Persistent golden yellow flame' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'Colorless gas with choking sulfurous smell (SO₂) evolved with effervescence; turns acidified K₂Cr₂O₇ from orange to green' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'White ppt (Ag₂SO₃), soluble in dilute HNO₃' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'White ppt (BaSO₃), dissolves in dilute HCl with effervescence of pungent SO₂ gas → SO₃²⁻' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  potassiumBromide: [
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'White crystalline solid crackles; melts at high temperature; no gas evolved' },
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'No visible reaction' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'No visible reaction' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'Lilac flame (crimson through cobalt blue glass)' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'Pale cream ppt (AgBr), sparingly soluble in dilute NH₃, soluble in concentrated NH₃ → Br⁻' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
  ],
  sodiumIodide: [
    { test: 'Dry Thermal Heating of Solid in Hard-Glass Tube (Bunsen Flame)', observation: 'White crystalline solid remains stable; no decomposition gas' },
    { test: 'Test with 2M Sodium Hydroxide Solution (NaOH)', observation: 'No visible reaction' },
    { test: 'Test with 2M Aqueous Ammonia [NH₃(aq)]', observation: 'No visible reaction' },
    { test: 'Clean Glass Rod Flame Emission Test (KICD Standard)', observation: 'Persistent golden yellow flame' },
    { test: 'Test with Dilute Hydrochloric Acid [2M HCl(aq)]', observation: 'No visible reaction' },
    { test: 'Test with Acidified Silver Nitrate Solution [AgNO₃(aq)]', observation: 'Bright yellow ppt (AgI), completely insoluble in dilute and concentrated NH₃ → I⁻' },
    { test: 'Test with Acidified Barium Chloride Solution [BaCl₂(aq)]', observation: 'No precipitate formed' },
    { test: 'Test with Potassium Iodide Solution [1M KI(aq)]', observation: 'No precipitate formed' },
    { test: 'Brown Ring Test for Nitrates [NO₃⁻]', observation: 'No brown ring or color change at interface' }
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

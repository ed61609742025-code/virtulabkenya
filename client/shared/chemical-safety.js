// ============================================================
//  VirtuLab Kenya — Chemical Safety & GHS SDS Viewer Engine
// ============================================================

const REAGENT_SAFETY_DB = {
  'NaOH': {
    name: 'Sodium Hydroxide (2.0 M)',
    formula: 'NaOH(aq)',
    ghs: ['corrosive', 'health_hazard'],
    pictograms: ['⚠️', '☣️'],
    signalWord: 'DANGER',
    hazards: [
      'Causes severe skin burns and eye damage.',
      'Exothermic reaction when dissolving; generates heat.'
    ],
    ppe: ['🥽 Chemical Splash Goggles', '🧤 Nitrile Protective Gloves', '🥼 Full-Length Lab Coat'],
    firstAid: 'In case of skin/eye contact: Immediately flush with plenty of water for at least 15 minutes.',
    knecAdvice: 'In KCSE Paper 3: Add dropwise until in excess. Always record whether precipitate is soluble or insoluble in excess.'
  },
  'NH3': {
    name: 'Aqueous Ammonia (2.0 M)',
    formula: 'NH₃(aq)',
    ghs: ['corrosive', 'toxic'],
    pictograms: ['💨', '☣️'],
    signalWord: 'DANGER',
    hazards: [
      'Causes skin irritation and serious eye damage.',
      'Pungent, choking gas released; inhaled vapors cause respiratory distress.'
    ],
    ppe: ['🥽 Chemical Splash Goggles', '🧤 Nitrile Gloves', '🌬️ Use in Fume Hood / Well Ventilated Area'],
    firstAid: 'If inhaled: Move student into fresh air immediately. Flush eyes with water.',
    knecAdvice: 'Key reagent for Cu²⁺ (deep blue tetraamminecopper(II) solution) and Zn²⁺ vs Al³⁺ differentiation.'
  },
  'HNO3': {
    name: 'Dilute Nitric Acid (2.0 M)',
    formula: 'HNO₃(aq)',
    ghs: ['oxidizer', 'corrosive'],
    pictograms: ['🔥', '☣️'],
    signalWord: 'DANGER',
    hazards: [
      'Strong oxidizing acid; causes severe skin burns.',
      'Reacts with carbonates to release CO₂ gas with effervescence.'
    ],
    ppe: ['🥽 Goggles', '🧤 Chemical Gloves', '🥼 Lab Coat'],
    firstAid: 'Rinse affected area with copious amounts of cold water immediately.',
    knecAdvice: 'Used prior to Ba(NO₃)₂ or AgNO₃ tests to destroy interfering carbonate (CO₃²⁻) ions.'
  },
  'BaNO32': {
    name: 'Barium Nitrate Solution (0.5 M)',
    formula: 'Ba(NO₃)₂(aq)',
    ghs: ['toxic', 'oxidizer'],
    pictograms: ['☠️', '⚠️'],
    signalWord: 'WARNING',
    hazards: [
      'Toxic if swallowed or inhaled.',
      'Forms insoluble white Barium Sulfate (BaSO₄) precipitate with SO₄²⁻.'
    ],
    ppe: ['🥽 Safety Glasses', '🧤 Protective Gloves'],
    firstAid: 'Wash hands thoroughly after handling. If swallowed, seek immediate medical assistance.',
    knecAdvice: 'Confirmatory test for SO₄²⁻ anion. BaSO₄ white precipitate is insoluble in dilute HNO₃.'
  },
  'AgNO3': {
    name: 'Silver Nitrate Solution (0.1 M)',
    formula: 'AgNO₃(aq)',
    ghs: ['corrosive', 'environment'],
    pictograms: ['☣️', '🌊'],
    signalWord: 'DANGER',
    hazards: [
      'Causes skin burns and dark brown/black skin staining (reduced silver).',
      'Very toxic to aquatic life.'
    ],
    ppe: ['🥽 Safety Goggles', '🧤 Gloves (Prevents skin staining)'],
    firstAid: 'Rinse skin with water. Stains fade naturally in a few days as skin sheds.',
    knecAdvice: 'Confirmatory test for Cl⁻ anion. White AgCl precipitate is insoluble in dilute HNO₃.'
  },
  'KMnO4': {
    name: 'Acidified Potassium Manganate(VII)',
    formula: 'KMnO₄/H⁺(aq)',
    ghs: ['oxidizer', 'environment'],
    pictograms: ['🔥', '⚠️'],
    signalWord: 'DANGER',
    hazards: [
      'Strong oxidizing agent.',
      'Decolorized from purple to colorless by reducing agents and unsaturated hydrocarbons (alkenes).'
    ],
    ppe: ['🥽 Safety Glasses', '🧤 Gloves'],
    firstAid: 'Flush skin or eyes with water.',
    knecAdvice: 'Used in Organic Chemistry to test for unsaturation (>C=C< double bonds) and primary/secondary alcohols.'
  },
  'K2Cr2O7': {
    name: 'Acidified Potassium Dichromate(VI)',
    formula: 'K₂Cr₂O₇/H⁺(aq)',
    ghs: ['toxic', 'oxidizer', 'health_hazard'],
    pictograms: ['☠️', '🔥', '☣️'],
    signalWord: 'DANGER',
    hazards: [
      'Carcinogenic and toxic chromate compound.',
      'Color shift from orange to green (Cr³⁺) upon oxidation of primary/secondary alcohols.'
    ],
    ppe: ['🥽 Splash Goggles', '🧤 Heavy Duty Gloves', '🥼 Lab Coat'],
    firstAid: 'Avoid all skin contact. If exposed, wash with soap and water immediately.',
    knecAdvice: 'Differentiates 1° & 2° alcohols (orange to green) from 3° alcohols (remains orange).'
  },
  'Br2': {
    name: 'Bromine Water (Liquid Reagent)',
    formula: 'Br₂(aq)',
    ghs: ['toxic', 'corrosive'],
    pictograms: ['☠️', '☣️'],
    signalWord: 'DANGER',
    hazards: [
      'Toxic by inhalation and skin absorption.',
      'Decolorized from reddish-brown to colorless by alkenes/alkynes via addition reaction.'
    ],
    ppe: ['🥽 Safety Goggles', '🧤 Nitrile Gloves', '🌬️ Use under Fume Hood'],
    firstAid: 'If inhaled, move to fresh air. Flush skin with water.',
    knecAdvice: 'Instant decolorization of bromine water without heating proves >C=C< or -C≡C- unsaturation.'
  },
  'KNO3': {
    name: 'Potassium Nitrate (Salt W)',
    formula: 'KNO₃(s)',
    ghs: ['oxidizer', 'irritant'],
    pictograms: ['🔥', '⚠️'],
    signalWord: 'WARNING',
    hazards: [
      'Strong oxidizer; accelerates burning of combustible materials.',
      'May cause respiratory and mild eye irritation.'
    ],
    ppe: ['🥽 Chemical Splash Goggles', '🧤 Heat Resistant Gloves', '🥼 Lab Coat'],
    firstAid: 'In case of contact, rinse eyes/skin with water. If inhaled, move to fresh air.',
    knecAdvice: 'In KCSE 2018 Paper 3: Stir continuously during cooling to observe first crystals accurately without supercooling.'
  },
  'KClO3': {
    name: 'Potassium Chlorate',
    formula: 'KClO₃(s)',
    ghs: ['oxidizer', 'toxic', 'environment'],
    pictograms: ['🔥', '☠️', '🌊'],
    signalWord: 'DANGER',
    hazards: [
      'Strong oxidizer; may cause fire or explosion when heated with combustible substances.',
      'Harmful if swallowed; toxic to aquatic organisms with long lasting effects.'
    ],
    ppe: ['🥽 Safety Goggles', '🧤 Protective Gloves', '🥼 Lab Coat'],
    firstAid: 'Wash skin thoroughly with soap and water. Never heat in direct contact with paper or organic matter.',
    knecAdvice: 'In KCSE 2021 Paper 3: Has lower solubility at room temperature, forming sharp crystalline plates upon cooling.'
  },
  'CuSO4': {
    name: 'Copper(II) Sulfate Pentahydrate',
    formula: 'CuSO₄·5H₂O(s)',
    ghs: ['harmful', 'irritant', 'environment'],
    pictograms: ['⚠️', '🌊'],
    signalWord: 'WARNING',
    hazards: [
      'Harmful if swallowed; causes serious eye damage and skin irritation.',
      'Very toxic to aquatic life with long lasting effects.'
    ],
    ppe: ['🥽 Chemical Splash Goggles', '🧤 Nitrile Gloves'],
    firstAid: 'Flush eyes thoroughly with water for 15 minutes. Avoid disposal down ordinary drains without neutralization.',
    knecAdvice: 'Forms characteristic bright blue rhombic crystals upon cooling. Deep blue solution in water.'
  },
  'PbNO3': {
    name: 'Lead(II) Nitrate',
    formula: 'Pb(NO₃)₂(s)',
    ghs: ['toxic', 'health_hazard', 'oxidizer', 'environment'],
    pictograms: ['☠️', '☣️', '🔥', '🌊'],
    signalWord: 'DANGER',
    hazards: [
      'Toxic by inhalation and ingestion; cumulative heavy metal poison affecting nervous system and fertility.',
      'Oxidizing agent; toxic to aquatic life.'
    ],
    ppe: ['🥽 Splash Goggles', '🧤 Heavy Duty Chemical Gloves', '🥼 Lab Coat'],
    firstAid: 'Avoid all direct contact and aerosol inhalation. Wash hands immediately after handling.',
    knecAdvice: 'In KCSE 2015 Paper 3: Produces lustrous white dense crystals. High solubility at elevated temperatures.'
  },
  'NaCl': {
    name: 'Sodium Chloride (Table Salt)',
    formula: 'NaCl(s)',
    ghs: ['low_hazard'],
    pictograms: ['ℹ️'],
    signalWord: 'CAUTION',
    hazards: [
      'Essentially non-hazardous under normal laboratory conditions; mild eye irritant at high concentrations.'
    ],
    ppe: ['🥽 Safety Glasses', '🥼 Lab Coat'],
    firstAid: 'Flush eyes with water if irritation occurs.',
    knecAdvice: 'Shows very flat solubility curve — solubility increases only marginally from 0°C to 100°C (35.7 to 39.8 g/100g).'
  },
  'Zn': {
    name: 'Zinc Metal Powder / Granules',
    formula: 'Zn(s)',
    ghs: ['flammable_solid', 'environment'],
    pictograms: ['🔥', '🌊'],
    signalWord: 'WARNING',
    hazards: [
      'Flammable solid as fine dust; reacts with acids releasing flammable hydrogen gas (H₂).',
      'Very toxic to aquatic life with long lasting effects.'
    ],
    ppe: ['🥽 Safety Goggles', '🧤 Protective Gloves', '🥼 Lab Coat'],
    firstAid: 'Wash skin with soap and water. Keep away from open flames and ignition sources.',
    knecAdvice: 'In KCSE Paper 3 thermochemistry displacement: Ensure fine powder is used for rapid reaction; stir continuously to prevent settling.'
  },
  'HCl': {
    name: 'Hydrochloric Acid (2.0 M)',
    formula: 'HCl(aq)',
    ghs: ['corrosive', 'irritant'],
    pictograms: ['☣️', '⚠️'],
    signalWord: 'DANGER',
    hazards: [
      'Causes severe skin burns and eye damage.',
      'Pungent, irritating acidic mist; corrosive to metals.'
    ],
    ppe: ['🥽 Chemical Splash Goggles', '🧤 Nitrile Gloves', '🥼 Lab Coat'],
    firstAid: 'Immediately flush affected eyes or skin with plenty of water for at least 15 minutes.',
    knecAdvice: 'In neutralization thermochemistry: Always measure acid with clean measuring cylinder; record initial temperature before adding alkali.'
  },
  'CH3COOH': {
    name: 'Ethanoic Acid / Acetic Acid (2.0 M)',
    formula: 'CH₃COOH(aq)',
    ghs: ['corrosive', 'flammable_liquid'],
    pictograms: ['☣️', '🔥'],
    signalWord: 'WARNING',
    hazards: [
      'Causes severe skin burns and eye damage.',
      'Characteristic pungent vinegar odor; causes respiratory irritation.'
    ],
    ppe: ['🥽 Splash Goggles', '🧤 Nitrile Gloves', '🥼 Lab Coat'],
    firstAid: 'Flush with water for 15 minutes. Provide fresh air if inhaled.',
    knecAdvice: 'Weak monobasic acid; molar enthalpy of neutralization is lower in magnitude (~ -55.2 kJ/mol) due to energy absorbed in completing ionization.'
  },
  'NH4NO3': {
    name: 'Ammonium Nitrate Crystals',
    formula: 'NH₄NO₃(s)',
    ghs: ['oxidizer', 'irritant'],
    pictograms: ['🔥', '⚠️'],
    signalWord: 'WARNING',
    hazards: [
      'Strong oxidizer; may intensify fire.',
      'Causes serious eye irritation; dissolves endothermically producing significant temperature drop.'
    ],
    ppe: ['🥽 Safety Glasses', '🧤 Protective Gloves', '🥼 Lab Coat'],
    firstAid: 'Rinse eyes thoroughly with water. Wash skin after handling.',
    knecAdvice: 'In KCSE thermochemistry: Endothermic solution practical. Stir continuously to accelerate dissolution and record lowest temperature reached.'
  },
  'Ethanol': {
    name: 'Ethanol / Ethyl Alcohol (95%)',
    formula: 'C₂H₅OH(l)',
    ghs: ['flammable_liquid', 'irritant'],
    pictograms: ['🔥', '⚠️'],
    signalWord: 'DANGER',
    hazards: [
      'Highly flammable liquid and vapor; keep away from heat, hot surfaces, and sparks.',
      'Causes serious eye irritation and dizziness if vapors inhaled.'
    ],
    ppe: ['🥽 Safety Goggles', '🧤 Protective Gloves', '🌬️ Well Ventilated Area'],
    firstAid: 'If ignited, use dry chemical or foam extinguisher. Flush eyes with water.',
    knecAdvice: 'In combustion enthalpy practical: Keep spirit lamp covered when not in use to prevent evaporative mass loss. Extinguish promptly.'
  },
  'StearicAcid': {
    name: 'Stearic Acid (Octadecanoic Acid)',
    formula: 'C₁₇H₃₅COOH(s)',
    ghs: ['low_hazard'],
    pictograms: ['ℹ️'],
    signalWord: 'CAUTION',
    hazards: [
      'Combustible organic solid; mild skin irritant when molten hot.'
    ],
    ppe: ['🥽 Safety Glasses', '🧤 Heat Resistant Gloves'],
    firstAid: 'If splashed with hot molten liquid, cool immediately with cold water.',
    knecAdvice: 'In cooling curves practical: Observe temperature plateau at ~69°C where solid and liquid phases coexist at thermodynamic equilibrium.'
  },
  'Na2S2O3': {
    name: 'Sodium Thiosulfate Solution (0.2 M)',
    formula: 'Na₂S₂O₃(aq)',
    ghs: ['irritant'],
    pictograms: ['⚠️'],
    signalWord: 'WARNING',
    hazards: [
      'Reacts with acids (HCl) to produce colloidal sulfur precipitate and sulfur dioxide (SO₂) gas.',
      'Mild skin and eye irritant.'
    ],
    ppe: ['🥽 Safety Glasses', '🧤 Nitrile Gloves', '🥼 Lab Coat'],
    firstAid: 'Flush skin and eyes with water.',
    knecAdvice: 'Core KCSE practical: Disappearing cross. Add acid and start stopwatch immediately. View cross from directly above.'
  },
  'SO2': {
    name: 'Sulfur Dioxide Gas',
    formula: 'SO₂(g)',
    ghs: ['toxic', 'corrosive', 'gas_under_pressure'],
    pictograms: ['☠️', '☣️', '💨'],
    signalWord: 'DANGER',
    hazards: [
      'Toxic and suffocating gas with pungent, choking odor.',
      'Causes severe respiratory tract and eye irritation; aggravates asthma.'
    ],
    ppe: ['🌬️ Conduct in Well-Ventilated Lab or Fume Cupboard', '🥽 Chemical Goggles'],
    firstAid: 'Move affected individual to fresh air immediately. Seek medical attention if breathing difficulties persist.',
    knecAdvice: 'Byproduct of Na₂S₂O₃ + HCl. In physical labs, avoid inhaling fumes; discard reaction mixtures promptly.'
  },
  'H2O2': {
    name: 'Hydrogen Peroxide Solution (20 vol)',
    formula: 'H₂O₂(aq)',
    ghs: ['oxidizer', 'corrosive'],
    pictograms: ['🔥', '☣️'],
    signalWord: 'DANGER',
    hazards: [
      'Strong oxidizer; accelerates decomposition in contact with catalysts.',
      'Bleaches skin and causes chemical burns.'
    ],
    ppe: ['🥽 Chemical Splash Goggles', '🧤 Nitrile Gloves', '🥼 Lab Coat'],
    firstAid: 'Flush skin immediately with cold water. Keep away from combustible materials.',
    knecAdvice: 'In catalytic decomposition: Catalyzed by MnO₂, CuO, or liver catalase enzyme releasing oxygen gas (O₂).'
  },
  'MnO2': {
    name: 'Manganese(IV) Oxide (Manganese Dioxide)',
    formula: 'MnO₂(s)',
    ghs: ['toxic', 'health_hazard'],
    pictograms: ['⚠️', '☣️'],
    signalWord: 'WARNING',
    hazards: [
      'Harmful if inhaled or swallowed.',
      'Powerful black powder catalyst for H₂O₂ decomposition.'
    ],
    ppe: ['🥽 Safety Glasses', '🧤 Dust Mask / Gloves', '🥼 Lab Coat'],
    firstAid: 'Wash skin thoroughly with soap and water after handling.',
    knecAdvice: 'Acts as heterogeneous catalyst; recovered chemically unchanged at the end of the reaction.'
  },
  'CaCO3': {
    name: 'Calcium Carbonate (Marble Chips / Powder)',
    formula: 'CaCO₃(s)',
    ghs: ['low_hazard'],
    pictograms: ['ℹ️'],
    signalWord: 'CAUTION',
    hazards: [
      'Non-hazardous mineral salt; reacts with dilute acids producing vigorous CO₂ effervescence.'
    ],
    ppe: ['🥽 Safety Glasses', '🥼 Lab Coat'],
    firstAid: 'Rinse eyes with water if powder causes mechanical irritation.',
    knecAdvice: 'Surface area practical: Fine powder reacts much faster than large chips due to higher exposed surface area.'
  }
};

window.VLKSafety = {
  get(reagentKey) {
    return REAGENT_SAFETY_DB[reagentKey] || null;
  },

  getLabReagents(labKey) {
    const map = {
      'lab': ['HCl', 'NaOH', 'KMnO4'],
      'titration': ['HCl', 'NaOH', 'KMnO4'],
      'qualitative': ['NaOH', 'NH3', 'HNO3', 'BaNO32', 'AgNO3'],
      'rates': ['Na2S2O3', 'HCl', 'SO2'],
      'energy': ['HCl', 'NaOH', 'CuSO4', 'Zn', 'NH4NO3'],
      'solubility': ['KNO3', 'KClO3', 'CuSO4', 'PbNO3'],
      'organic': ['Br2', 'KMnO4', 'K2Cr2O7', 'Ethanol', 'CH3COOH'],
      'gas_prep': ['HCl', 'H2O2', 'MnO2', 'CaCO3', 'NH3'],
      'composite_exam': ['HCl', 'NaOH', 'KMnO4', 'BaNO32', 'AgNO3', 'Br2']
    };
    return map[labKey] || ['HCl', 'NaOH'];
  },

  openSDSModal(reagentKey) {
    const data = REAGENT_SAFETY_DB[reagentKey] || REAGENT_SAFETY_DB['NaOH'];
    if (!data) return;

    let modal = document.getElementById('ghsSdsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ghsSdsModal';
      modal.className = 'modal-overlay';
      modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:35000; align-items:center; justify-content:center; backdrop-filter:blur(10px); padding:20px;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background:var(--card-bg, #111A2E); border:2px solid #EF4444; border-radius:20px; max-width:620px; width:100%; max-height:90vh; overflow-y:auto; padding:26px; box-shadow:0 24px 60px rgba(239,68,68,0.3); position:relative; color:var(--text-main, #F8FAFC);">
        
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--card-border, #1E2D4A); padding-bottom:14px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:2rem; background:rgba(239,68,68,0.15); border:1.5px solid #EF4444; padding:8px 12px; border-radius:12px;">
              ⚠️
            </div>
            <div>
              <div style="font-weight:900; font-size:1.15rem; color:var(--heading-color, #FFF); font-family:var(--font-heading, sans-serif);">${data.name}</div>
              <div style="font-size:0.8rem; color:#EF4444; font-weight:800; display:flex; align-items:center; gap:8px; margin-top:2px;">
                <span>Formula: <code>${data.formula}</code></span> · 
                <span style="background:#EF4444; color:#FFF; padding:2px 8px; border-radius:100px; font-size:0.68rem;">GHS ${data.signalWord}</span>
              </div>
            </div>
          </div>
          <button type="button" class="btn" onclick="document.getElementById('ghsSdsModal').style.display='none'" style="padding:6px 14px; font-size:0.85rem; border-radius:100px; cursor:pointer; background:var(--card-bg-hover, #17233B); color:var(--text-main, #FFF); border:1px solid var(--card-border, #1E2D4A);">✕ Close</button>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-size:0.75rem; font-weight:900; color:var(--text-muted, #94A3B8); text-transform:uppercase; margin-bottom:6px;">GHS Hazard Pictograms</div>
          <div style="display:flex; gap:10px; font-size:1.6rem;">
            ${data.pictograms.map(p => `<span style="background:var(--card-bg-hover, #17233B); border:1px solid var(--card-border, #1E2D4A); padding:6px 14px; border-radius:10px;">${p}</span>`).join('')}
          </div>
        </div>

        <div style="background:rgba(239,68,68,0.08); border-left:4px solid #EF4444; padding:12px 16px; border-radius:8px; margin-bottom:16px;">
          <div style="font-weight:800; font-size:0.85rem; color:#EF4444; margin-bottom:4px;">🚨 Primary Safety Hazards:</div>
          <ul style="margin:0; padding-left:18px; font-size:0.82rem; line-height:1.5; color:var(--text-main, #F8FAFC);">
            ${data.hazards.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <div style="background:rgba(6,182,212,0.08); border-left:4px solid var(--cyan-accent, #06B6D4); padding:12px 16px; border-radius:8px; margin-bottom:16px;">
          <div style="font-weight:800; font-size:0.85rem; color:var(--cyan-accent, #06B6D4); margin-bottom:4px;">🥼 Mandatory Personal Protective Equipment (PPE):</div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:6px;">
            ${data.ppe.map(item => `<span style="background:var(--card-bg-hover, #17233B); border:1px solid var(--card-border, #1E2D4A); font-size:0.78rem; font-weight:700; padding:4px 10px; border-radius:100px; color:var(--heading-color, #FFF);">${item}</span>`).join('')}
          </div>
        </div>

        <div style="background:rgba(16,185,129,0.08); border-left:4px solid var(--green-accent, #10B981); padding:12px 16px; border-radius:8px; margin-bottom:20px;">
          <div style="font-weight:800; font-size:0.85rem; color:var(--green-accent, #10B981); margin-bottom:4px;">💡 KNEC Practical Technique & First Aid:</div>
          <div style="font-size:0.82rem; line-height:1.5; color:var(--text-main, #F8FAFC); margin-bottom:4px;">${data.knecAdvice}</div>
          <div style="font-size:0.78rem; color:var(--text-muted, #94A3B8); font-style:italic;">${data.firstAid}</div>
        </div>

        <button type="button" onclick="document.getElementById('ghsSdsModal').style.display='none'" style="width:100%; padding:12px; font-weight:800; border-radius:10px; background:#EF4444; color:#FFF; border:none; cursor:pointer; font-size:0.9rem;">
          Understood — Continue Working ✓
        </button>
      </div>
    `;

    modal.style.display = 'flex';
  },

  /**
   * Enforces a mandatory Pre-Lab Safety Briefing Modal before students can start a practical
   */
  enforcePreLabSDS(labKey, onProceed) {
    const reagents = this.getLabReagents(labKey);
    let activeIndex = 0;

    let gateway = document.getElementById('vlkPreLabGatewayModal');
    if (!gateway) {
      gateway = document.createElement('div');
      gateway.id = 'vlkPreLabGatewayModal';
      gateway.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(4,9,20,0.92); z-index:40000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(12px); padding:16px;';
      document.body.appendChild(gateway);
    }

    const render = () => {
      const activeKey = reagents[activeIndex] || reagents[0];
      const data = REAGENT_SAFETY_DB[activeKey] || REAGENT_SAFETY_DB['NaOH'];

      gateway.innerHTML = `
        <div style="background:var(--card-bg, #111A2E); border:2px solid var(--acad-gold-border, #F59E0B); border-radius:20px; max-width:680px; width:100%; max-height:92vh; overflow-y:auto; padding:24px 28px; box-shadow:0 24px 60px rgba(0,0,0,0.7); position:relative; color:var(--text-main, #F8FAFC); font-family:var(--font-body, 'Plus Jakarta Sans', sans-serif);">
          
          <!-- Institutional Header Badge -->
          <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--card-border, #1E2D4A); padding-bottom:12px; margin-bottom:16px;">
            <div>
              <div style="font-family:var(--font-mono, monospace); font-size:0.7rem; font-weight:800; color:var(--acad-gold, #F59E0B); letter-spacing:0.05em; text-transform:uppercase;">
                🇰🇪 REPUBLIC OF KENYA • KICD / KNEC LABORATORY SAFETY PROTOCOL
              </div>
              <h2 style="font-size:1.25rem; font-weight:800; color:var(--heading-color, #FFF); margin:4px 0 0 0; font-family:var(--font-heading, sans-serif); display:flex; align-items:center; gap:8px;">
                <span>🛡️</span> Mandatory Pre-Lab Chemical Safety (SDS)
              </h2>
            </div>
            <span style="background:rgba(239,68,68,0.15); color:#EF4444; border:1px solid rgba(239,68,68,0.3); font-size:0.72rem; font-weight:800; padding:4px 10px; border-radius:6px; font-family:var(--font-mono, monospace);">
              SAFETY GATEWAY
            </span>
          </div>

          <p style="font-size:0.82rem; color:var(--text-muted, #94A3B8); line-height:1.45; margin:0 0 14px 0;">
            Before operating this laboratory workbench, review the chemical hazard classifications, mandatory Personal Protective Equipment (PPE), and first aid procedures for the reagents used in this practical:
          </p>

          <!-- Reagent Switcher Tabs -->
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px;">
            ${reagents.map((rk, idx) => {
              const rData = REAGENT_SAFETY_DB[rk] || { name: rk };
              const isActive = idx === activeIndex;
              return `
                <button type="button" onclick="window.VLKSafety._switchReagent(${idx})" style="padding:6px 12px; border-radius:8px; font-size:0.78rem; font-weight:700; cursor:pointer; font-family:var(--font-mono, monospace); transition:all 0.15s ease; border:1px solid ${isActive ? '#F59E0B' : 'var(--card-border, #1E2D4A)'}; background:${isActive ? 'rgba(245,158,11,0.15)' : 'var(--card-bg-hover, #17233B)'}; color:${isActive ? '#F59E0B' : 'var(--text-muted, #94A3B8)'};">
                  ${rData.name.split(' (')[0]}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Active Reagent Details Card -->
          <div style="background:var(--card-bg-hover, #17233B); border:1px solid var(--card-border, #1E2D4A); border-radius:12px; padding:16px; margin-bottom:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
              <div>
                <b style="font-size:1.02rem; color:var(--heading-color, #FFF);">${data.name}</b>
                <span style="font-family:var(--font-mono, monospace); font-size:0.8rem; color:var(--text-muted, #94A3B8); margin-left:6px;">(${data.formula})</span>
              </div>
              <span style="background:${data.signalWord === 'DANGER' ? '#EF4444' : '#F59E0B'}; color:#FFF; font-size:0.7rem; font-weight:900; padding:2px 8px; border-radius:4px; font-family:var(--font-mono, monospace);">
                GHS ${data.signalWord}
              </span>
            </div>

            <!-- Pictograms & Hazards -->
            <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:12px; flex-wrap:wrap;">
              <div style="display:flex; gap:6px; font-size:1.4rem;">
                ${data.pictograms.map(p => `<span style="background:var(--card-bg, #111A2E); border:1px solid var(--card-border, #1E2D4A); padding:4px 10px; border-radius:8px;">${p}</span>`).join('')}
              </div>
              <div style="flex:1; min-width:200px;">
                <ul style="margin:0; padding-left:16px; font-size:0.8rem; line-height:1.45; color:#F87171;">
                  ${data.hazards.map(h => `<li>${h}</li>`).join('')}
                </ul>
              </div>
            </div>

            <!-- Mandatory PPE Strip -->
            <div style="border-top:1px solid var(--card-border, #1E2D4A); padding-top:10px; margin-top:8px;">
              <div style="font-size:0.75rem; font-weight:800; color:var(--cyan-accent, #38BDF8); margin-bottom:4px;">Required PPE for this Reagent:</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${data.ppe.map(item => `<span style="background:var(--card-bg, #111A2E); border:1px solid var(--card-border, #1E2D4A); font-size:0.74rem; font-weight:700; padding:2px 8px; border-radius:6px; color:var(--heading-color, #FFF);">${item}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Mandatory Acknowledgment Checkbox -->
          <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:12px 14px; margin-bottom:18px;">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:0.82rem; line-height:1.4; color:var(--text-main, #F8FAFC);">
              <input type="checkbox" id="preLabSafetyCheck" onchange="window.VLKSafety._toggleProceedBtn(this.checked)" style="width:18px; height:18px; accent-color:#F59E0B; cursor:pointer; flex-shrink:0;">
              <span>I confirm that I have reviewed the <b>Safety Data Sheet (SDS) hazards</b>, know the emergency first aid protocols, and will maintain standard KNEC laboratory safety rules.</span>
            </label>
          </div>

          <!-- Action Button -->
          <div style="display:flex; gap:10px;">
            <button type="button" id="btnProceedToBench" onclick="window.VLKSafety._proceed('${labKey}')" disabled style="flex:1; padding:12px 20px; font-weight:800; font-size:0.88rem; border-radius:10px; background:#475569; color:#94A3B8; border:none; cursor:not-allowed; transition:all 0.2s ease;">
              Equip PPE &amp; Enter Laboratory Workbench →
            </button>
          </div>

        </div>
      `;
      gateway.style.display = 'flex';
    };

    window.VLKSafety._switchReagent = (idx) => {
      activeIndex = idx;
      render();
    };

    window.VLKSafety._toggleProceedBtn = (checked) => {
      const btn = document.getElementById('btnProceedToBench');
      if (!btn) return;
      if (checked) {
        btn.disabled = false;
        btn.style.background = '#F59E0B';
        btn.style.color = '#000';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 0 18px rgba(245,158,11,0.4)';
      } else {
        btn.disabled = true;
        btn.style.background = '#475569';
        btn.style.color = '#94A3B8';
        btn.style.cursor = 'not-allowed';
        btn.style.boxShadow = 'none';
      }
    };

    window.VLKSafety._proceed = (lk) => {
      sessionStorage.setItem('vlk_sds_cleared_' + lk, 'true');
      const g = document.getElementById('vlkPreLabGatewayModal');
      if (g) g.style.display = 'none';
      if (typeof onProceed === 'function') onProceed();
    };

    render();
  },

  /**
   * Auto-guard initialization on page load
   */
  initPreLabGuard() {
    // Check if on a student workbench page
    const path = window.location.pathname.toLowerCase();
    let labKey = null;

    if (path.includes('lab.html')) labKey = 'titration';
    else if (path.includes('qualitative.html')) labKey = 'qualitative';
    else if (path.includes('rates.html')) labKey = 'rates';
    else if (path.includes('energy.html') && !path.includes('theory')) labKey = 'energy';
    else if (path.includes('solubility.html')) labKey = 'solubility';
    else if (path.includes('organic.html')) labKey = 'organic';
    else if (path.includes('gas_prep.html')) labKey = 'gas_prep';
    else if (path.includes('composite_exam.html')) labKey = 'composite_exam';

    if (!labKey) return;

    // Check if query param overrides (e.g. ?sds=skip for tests)
    const params = new URLSearchParams(window.location.search);
    if (params.get('sds') === 'skip') return;

    // Trigger pre-lab SDS gateway
    setTimeout(() => {
      this.enforcePreLabSDS(labKey);
    }, 150);
  }
};

// Auto-run pre-lab guard when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.VLKSafety.initPreLabGuard());
} else {
  window.VLKSafety.initPreLabGuard();
}


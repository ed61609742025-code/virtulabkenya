// ============================================================
//  VirtuLab Kenya — Canonical Organic Compounds Registry
//  Server-Side Source of Truth for KCSE Paper 3 Organic Chemistry
// ============================================================

const ORGANIC_COMPOUNDS = {
  org_alkene: {
    key: 'org_alkene',
    sampleLabel: 'Sample A',
    name: 'Hex-1-ene (C₆H₁₂)',
    fg: 'Alkene',
    canonicalFG: 'Alkene',
    aliases: ['Alkene', 'alkene', 'Alkenes', 'alkenes']
  },
  org_alcohol: {
    key: 'org_alcohol',
    sampleLabel: 'Sample B',
    name: 'Ethanol (C₂H₅OH)',
    fg: 'Primary Alcohol',
    canonicalFG: 'Primary Alcohol',
    aliases: ['Primary Alcohol', 'Alcohol', 'alkanol', 'Alkanol', 'alcohol', 'primary alcohol', 'R-OH']
  },
  org_acid: {
    key: 'org_acid',
    sampleLabel: 'Sample C',
    name: 'Ethanoic Acid (CH₃COOH)',
    fg: 'Carboxylic Acid',
    canonicalFG: 'Carboxylic Acid',
    aliases: ['Carboxylic Acid', 'Carboxylic acid', 'carboxylic acid', 'Alkanoic acid', 'alkanoic acid', 'R-COOH']
  },
  org_alkane: {
    key: 'org_alkane',
    sampleLabel: 'Sample D',
    name: 'Hexane (C₆H₁₄)',
    fg: 'Alkane',
    canonicalFG: 'Alkane',
    aliases: ['Alkane', 'alkane', 'Alkanes', 'alkanes']
  }
};

function getOrganicCompound(key) {
  return ORGANIC_COMPOUNDS[key] || null;
}

function isFunctionalGroupCorrect(compoundKey, studentFG) {
  const compound = ORGANIC_COMPOUNDS[compoundKey];
  if (!compound || !studentFG) return false;
  const s = studentFG.trim().toLowerCase();
  if (compound.fg.toLowerCase() === s) return true;
  return compound.aliases.some(a => a.toLowerCase() === s);
}

module.exports = {
  ORGANIC_COMPOUNDS,
  getOrganicCompound,
  isFunctionalGroupCorrect
};

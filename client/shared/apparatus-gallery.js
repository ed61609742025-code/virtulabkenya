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
    "id": "burette",
    "name": "Burette (50 cm³)",
    "category": "Measurement",
    "viewBox": "0 0 100 270",
    "svgPath": "M20 8 L20 2 L40 2 L40 8 M18 8 L42 8 L42 170 L38 170 L38 178 Q38 184 30 184 Q22 184 22 178 L22 170 L18 170 Z M25 170 L35 170 M20 30 L18 30 M20 50 L18 50 M20 70 L18 70 M20 90 L18 90 M20 110 L18 110 M20 130 L18 130 M20 150 L18 150",
    "primaryUse": "Delivers variable, precise volumes of titrant solution during volumetric analysis",
    "labContext": "Used in Question 1 (Volumetric Analysis) — mounted vertically on a retort stand over a white tile",
    "safetyNote": "Handle carefully — glass stopcock can jam. Never invert a filled burette.",
    "funFact": "Invented by French chemist Joseph Louis Gay-Lussac in 1824 for industrial acid-base titrations.",
    "specs": {
      "material": "Borosilicate 3.3 Glass (ISO 385)",
      "capacity": "50.00 cm³",
      "tolerance": "±0.05 cm³ (Class A)",
      "handling": "Read the lowest point of concave meniscus at eye level to eliminate parallax error"
    },
    "quizDistractors": [
      "Measuring Cylinder",
      "Bulb Pipette",
      "Graduated Syringe"
    ],
    "useDistractors": [
      "Measures fixed 25 cm³ aliquots",
      "Holds reagents for heating",
      "Separates precipitates"
    ],
    "richSVG": "\n      <g opacity=\"0.95\">\n        <rect x=\"18\" y=\"105\" width=\"28\" height=\"12\" rx=\"2\" fill=\"url(#agCastIron)\" stroke=\"#475569\" stroke-width=\"0.8\"/>\n        <circle cx=\"24\" cy=\"111\" r=\"3.5\" fill=\"url(#agBrass)\" stroke=\"#78350F\" stroke-width=\"0.6\"/>\n        <path d=\"M46 103 Q58 103 62 108\" stroke=\"#DC2626\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/>\n        <path d=\"M46 119 Q58 119 62 114\" stroke=\"#DC2626\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/>\n      </g>\n      <rect x=\"42\" y=\"15\" width=\"18\" height=\"195\" rx=\"2\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <rect x=\"43.5\" y=\"85\" width=\"15\" height=\"125\" fill=\"url(#agLiquidBlue)\"/>\n      <path d=\"M43.5 85 Q51 88 58.5 85\" stroke=\"#0284C7\" stroke-width=\"1.8\" fill=\"none\"/>\n      <line x1=\"45\" y1=\"18\" x2=\"45\" y2=\"208\" stroke=\"#FFFFFF\" stroke-width=\"1.8\" opacity=\"0.85\"/>\n      <g stroke=\"#0369A1\" stroke-width=\"0.8\">\n        <line x1=\"42\" y1=\"35\" x2=\"52\" y2=\"35\"/><text x=\"32\" y=\"37.5\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">0</text>\n        <line x1=\"42\" y1=\"50\" x2=\"48\" y2=\"50\"/>\n        <line x1=\"42\" y1=\"65\" x2=\"52\" y2=\"65\"/><text x=\"27\" y=\"67.5\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">10</text>\n        <line x1=\"42\" y1=\"80\" x2=\"48\" y2=\"80\"/>\n        <line x1=\"42\" y1=\"95\" x2=\"52\" y2=\"95\"/><text x=\"27\" y=\"97.5\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">20</text>\n        <line x1=\"42\" y1=\"110\" x2=\"48\" y2=\"110\"/>\n        <line x1=\"42\" y1=\"125\" x2=\"52\" y2=\"125\"/><text x=\"27\" y=\"127.5\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">30</text>\n        <line x1=\"42\" y1=\"140\" x2=\"48\" y2=\"140\"/>\n        <line x1=\"42\" y1=\"155\" x2=\"52\" y2=\"155\"/><text x=\"27\" y=\"157.5\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">40</text>\n        <line x1=\"42\" y1=\"170\" x2=\"48\" y2=\"170\"/>\n        <line x1=\"42\" y1=\"185\" x2=\"52\" y2=\"185\"/><text x=\"27\" y=\"187.5\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">50</text>\n      </g>\n      <rect x=\"38\" y=\"210\" width=\"26\" height=\"12\" rx=\"2\" fill=\"#E2E8F0\" stroke=\"#64748B\" stroke-width=\"1\"/>\n      <rect x=\"30\" y=\"213\" width=\"42\" height=\"6\" rx=\"3\" fill=\"url(#agTeflonRed)\" stroke=\"#991B1B\" stroke-width=\"0.8\"/>\n      <polygon points=\"48,222 54,222 52,246 50,246\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n      <circle cx=\"51\" cy=\"253\" r=\"3.2\" fill=\"#38BDF8\" opacity=\"0.9\"/>\n    "
  },
  {
    "id": "bulb-pipette",
    "name": "Bulb Pipette (25 cm³)",
    "category": "Measurement",
    "viewBox": "0 0 90 270",
    "svgPath": "M15 4 L15 60 Q15 60 8 90 Q4 108 4 118 Q4 140 15 148 Q26 140 26 118 Q26 108 22 90 L15 60 M8 90 Q15 86 22 90 M15 148 L15 174 L14 176 L16 176 L15 174",
    "primaryUse": "Delivers a single fixed, exact volume (25.00 cm³) of analyte into a conical flask",
    "labContext": "Used in Question 1 to aliquot standard solutions — filled using a rubber bulb pipette filler",
    "safetyNote": "Never pipette by mouth. Always use a rubber bulb filler or pipette pump.",
    "funFact": "Class-A volumetric bulb pipettes have an accuracy of 99.8% when drained correctly.",
    "specs": {
      "material": "Borosilicate 3.3 Glass (ISO 648)",
      "capacity": "25.00 cm³",
      "tolerance": "±0.03 cm³ (Class A)",
      "handling": "Touch the jet tip gently against inside neck of conical flask for 3 seconds after drainage"
    },
    "quizDistractors": [
      "Burette",
      "Measuring Cylinder",
      "Dropping Pipette"
    ],
    "useDistractors": [
      "Delivers variable volumes",
      "Transfers solids precisely",
      "Measures 100 cm³ liquids"
    ],
    "richSVG": "\n      <g id=\"pipetteFiller\">\n        <ellipse cx=\"45\" cy=\"24\" rx=\"14\" ry=\"16\" fill=\"url(#agRubberRed)\" stroke=\"#7F1D1D\" stroke-width=\"1\"/>\n        <rect x=\"42\" y=\"38\" width=\"6\" height=\"8\" fill=\"#7F1D1D\"/>\n        <circle cx=\"45\" cy=\"14\" r=\"3\" fill=\"#B91C1C\" stroke=\"#7F1D1D\" stroke-width=\"0.6\"/>\n        <text x=\"43\" y=\"16\" font-size=\"4\" font-weight=\"bold\" fill=\"#FFFFFF\">A</text>\n        <circle cx=\"37\" cy=\"28\" r=\"3\" fill=\"#B91C1C\" stroke=\"#7F1D1D\" stroke-width=\"0.6\"/>\n        <text x=\"35.5\" y=\"30\" font-size=\"4\" font-weight=\"bold\" fill=\"#FFFFFF\">S</text>\n        <circle cx=\"53\" cy=\"28\" r=\"3\" fill=\"#B91C1C\" stroke=\"#7F1D1D\" stroke-width=\"0.6\"/>\n        <text x=\"51.5\" y=\"30\" font-size=\"4\" font-weight=\"bold\" fill=\"#FFFFFF\">E</text>\n      </g>\n      <rect x=\"41\" y=\"44\" width=\"8\" height=\"68\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <line x1=\"37\" y1=\"72\" x2=\"53\" y2=\"72\" stroke=\"#DC2626\" stroke-width=\"1.8\"/>\n      <text x=\"56\" y=\"74.5\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#DC2626\" font-family=\"'JetBrains Mono', monospace\">25ml</text>\n      <rect x=\"42.5\" y=\"72\" width=\"5\" height=\"40\" fill=\"url(#agLiquidBlue)\"/>\n      <ellipse cx=\"45\" cy=\"142\" rx=\"22\" ry=\"32\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <ellipse cx=\"45\" cy=\"146\" rx=\"19.5\" ry=\"27\" fill=\"url(#agLiquidBlue)\"/>\n      <ellipse cx=\"38\" cy=\"132\" rx=\"8\" ry=\"16\" fill=\"#FFFFFF\" opacity=\"0.65\" transform=\"rotate(-18 38 132)\"/>\n      <polygon points=\"41,172 49,172 47,248 43,248\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <polygon points=\"42.5,172 47.5,172 46,248 44,248\" fill=\"url(#agLiquidBlue)\"/>\n      <circle cx=\"45\" cy=\"254\" r=\"3\" fill=\"#38BDF8\" opacity=\"0.9\"/>\n    "
  },
  {
    "id": "conical-flask",
    "name": "Conical Flask (250 cm³)",
    "category": "Glassware",
    "viewBox": "0 0 160 160",
    "svgPath": "M38 8 L38 2 L62 2 L62 8 M38 8 L38 28 Q38 28 10 80 Q4 92 4 100 L96 100 Q96 92 90 80 L62 28 L62 8 M10 80 L90 80",
    "primaryUse": "Holds analyte and indicator during titration; shaped for vigorous swirl mixing without spilling",
    "labContext": "Placed on a porcelain white tile directly under the burette tip during acid-base standardisation",
    "safetyNote": "Swirl with a gentle wrist motion — do not stopper when mixing reacting gases.",
    "funFact": "Also called an Erlenmeyer flask, created in 1860 by German chemist Richard August Carl Emil Erlenmeyer.",
    "specs": {
      "material": "Borosilicate 3.3 Glass (ISO 1773)",
      "capacity": "250 cm³",
      "tolerance": "±5% (approximate volume markings)",
      "handling": "Swirl continuously with one hand while controlling burette stopcock with the other"
    },
    "quizDistractors": [
      "Beaker",
      "Round-Bottom Flask",
      "Boiling Tube"
    ],
    "useDistractors": [
      "Measures exact 25 cm³ volumes",
      "Stores pressurized gases",
      "Filters solid crystals"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <rect x=\"18\" y=\"142\" width=\"124\" height=\"10\" rx=\"3\" fill=\"url(#agPorcelain)\" stroke=\"#CBD5E1\" stroke-width=\"1\"/>\n        <ellipse cx=\"80\" cy=\"146\" rx=\"42\" ry=\"3\" fill=\"rgba(56,189,248,0.2)\"/>\n      </g>\n      <ellipse cx=\"80\" cy=\"18\" rx=\"18\" ry=\"4.5\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <rect x=\"68\" y=\"18\" width=\"24\" height=\"26\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <polygon points=\"68,44 92,44 140,136 20,136\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <polygon points=\"44,92 116,92 138,134 22,134\" fill=\"url(#agLiquidPink)\"/>\n      <ellipse cx=\"80\" cy=\"92\" rx=\"36\" ry=\"5.5\" fill=\"#F472B6\" opacity=\"0.9\"/>\n      <line x1=\"72\" y1=\"46\" x2=\"30\" y2=\"132\" stroke=\"#FFFFFF\" stroke-width=\"2.5\" opacity=\"0.8\" stroke-linecap=\"round\"/>\n      <g fill=\"#FFFFFF\" opacity=\"0.85\">\n        <circle cx=\"80\" cy=\"62\" r=\"7\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"0.8\"/>\n        <text x=\"74\" y=\"64\" font-size=\"4.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#FFFFFF\">250ml</text>\n        <line x1=\"90\" y1=\"75\" x2=\"104\" y2=\"75\" stroke=\"#FFFFFF\" stroke-width=\"1\"/>\n        <text x=\"106\" y=\"77\" font-size=\"5\" fill=\"#FFFFFF\">200</text>\n        <line x1=\"94\" y1=\"92\" x2=\"114\" y2=\"92\" stroke=\"#FFFFFF\" stroke-width=\"1\"/>\n        <text x=\"116\" y=\"94\" font-size=\"5\" fill=\"#FFFFFF\">150</text>\n        <line x1=\"98\" y1=\"110\" x2=\"124\" y2=\"110\" stroke=\"#FFFFFF\" stroke-width=\"1\"/>\n        <text x=\"126\" y=\"112\" font-size=\"5\" fill=\"#FFFFFF\">100</text>\n      </g>\n    "
  },
  {
    "id": "beaker",
    "name": "Beaker (250 cm³)",
    "category": "Glassware",
    "viewBox": "0 0 150 150",
    "svgPath": "M10 4 L70 4 Q74 4 74 8 L70 82 Q70 86 66 86 L14 86 Q10 86 10 82 L6 8 Q6 4 10 4 M6 8 L74 8 M68 4 Q76 4 78 12 L78 24 M20 60 L18 60 M20 40 L18 40 M20 20 L18 20",
    "primaryUse": "General-purpose vessel for holding, stirring, heating, and transferring liquids",
    "labContext": "Used to dissolve salts, prepare stock standard solutions, or serve as a warm water bath",
    "safetyNote": "Markings are approximate only (±5%). Never use a beaker for precision titration measurements.",
    "funFact": "The pour spout lip is designed to create a clean hydrodynamic laminar pour without dripping down the side.",
    "specs": {
      "material": "Borosilicate 3.3 Glass (ISO 3819)",
      "capacity": "250 cm³",
      "tolerance": "±5% (Rough Estimation)",
      "handling": "Always place wire gauze beneath beaker before heating directly over a Bunsen flame"
    },
    "quizDistractors": [
      "Conical Flask",
      "Measuring Cylinder",
      "Boiling Tube"
    ],
    "useDistractors": [
      "Delivers exact 25 cm³ volumes",
      "Measures burette titrant precisely",
      "Collects gases over water"
    ],
    "richSVG": "\n      <path d=\"M26 22 L20 18 L24 28 L24 130 Q24 138 34 138 L116 138 Q126 138 126 130 L126 22 Q126 18 120 18 L26 18 Z\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <path d=\"M26 62 L124 62 L124 130 Q124 136 116 136 L34 136 Q26 136 26 130 Z\" fill=\"url(#agLiquidBlue)\"/>\n      <ellipse cx=\"75\" cy=\"62\" rx=\"49\" ry=\"5.5\" fill=\"#38BDF8\" opacity=\"0.9\"/>\n      <line x1=\"30\" y1=\"24\" x2=\"30\" y2=\"132\" stroke=\"#FFFFFF\" stroke-width=\"2.5\" opacity=\"0.8\" stroke-linecap=\"round\"/>\n      <g fill=\"#FFFFFF\" stroke=\"#FFFFFF\" opacity=\"0.85\">\n        <circle cx=\"56\" cy=\"42\" r=\"8\" fill=\"none\" stroke-width=\"0.8\"/>\n        <text x=\"49\" y=\"44\" font-size=\"4.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#FFFFFF\">PYREX</text>\n        <line x1=\"102\" y1=\"42\" x2=\"124\" y2=\"42\" stroke-width=\"1.2\"/><text x=\"86\" y=\"44\" font-size=\"5.5\" fill=\"#FFFFFF\">250</text>\n        <line x1=\"106\" y1=\"62\" x2=\"124\" y2=\"62\" stroke-width=\"1.2\"/><text x=\"90\" y=\"64\" font-size=\"5.5\" fill=\"#FFFFFF\">200</text>\n        <line x1=\"106\" y1=\"84\" x2=\"124\" y2=\"84\" stroke-width=\"1.2\"/><text x=\"90\" y=\"86\" font-size=\"5.5\" fill=\"#FFFFFF\">150</text>\n        <line x1=\"106\" y1=\"106\" x2=\"124\" y2=\"106\" stroke-width=\"1.2\"/><text x=\"90\" y=\"108\" font-size=\"5.5\" fill=\"#FFFFFF\">100</text>\n      </g>\n    "
  },
  {
    "id": "measuring-cylinder",
    "name": "Measuring Cylinder (100 cm³)",
    "category": "Measurement",
    "viewBox": "0 0 110 240",
    "svgPath": "M12 10 L12 4 Q12 2 25 2 Q38 2 38 4 L38 10 M12 10 L12 118 Q12 124 25 124 Q38 124 38 118 L38 10 M12 118 Q12 124 25 124 Q38 124 38 118 M12 30 L10 30 M12 50 L10 50 M12 70 L10 70 M12 90 L10 90 M12 110 L10 110",
    "primaryUse": "Measures approximate liquid volumes for preparative and qualitative tests quickly",
    "labContext": "Used to measure 20–50 cm³ of acid/distilled water when preparing dilution mixtures",
    "safetyNote": "Keep the plastic guard ring near top to protect the rim if tipped over.",
    "funFact": "Hexagonal bases were designed to stop cylinders from rolling off sloping school laboratory desks.",
    "specs": {
      "material": "Borosilicate Glass with Polypropylene Base",
      "capacity": "100.0 cm³",
      "tolerance": "±1.0 cm³ (Class B)",
      "handling": "Read the horizontal bottom of the meniscus at direct eye level"
    },
    "quizDistractors": [
      "Burette",
      "Bulb Pipette",
      "Boiling Tube"
    ],
    "useDistractors": [
      "Delivers precise titrant drops",
      "Holds analyte during titration",
      "Heats reagents directly"
    ],
    "richSVG": "\n      <polygon points=\"26,220 84,220 96,232 76,238 34,238 14,232\" fill=\"url(#agCastIron)\" stroke=\"#475569\" stroke-width=\"1\"/>\n      <polygon points=\"32,46 78,46 84,52 74,56 36,56 26,52\" fill=\"#EAB308\" stroke=\"#CA8A04\" stroke-width=\"1\"/>\n      <rect x=\"38\" y=\"24\" width=\"34\" height=\"196\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <polygon points=\"38,24 28,16 42,24\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n      <rect x=\"39.5\" y=\"98\" width=\"31\" height=\"122\" fill=\"url(#agLiquidAmber)\"/>\n      <path d=\"M39.5 98 Q55 102 70.5 98\" stroke=\"#D97706\" stroke-width=\"1.8\" fill=\"none\"/>\n      <line x1=\"42\" y1=\"28\" x2=\"42\" y2=\"216\" stroke=\"#FFFFFF\" stroke-width=\"2\" opacity=\"0.8\" stroke-linecap=\"round\"/>\n      <g stroke=\"#0369A1\" stroke-width=\"0.8\">\n        <line x1=\"56\" y1=\"38\" x2=\"72\" y2=\"38\"/><text x=\"74\" y=\"40\" font-size=\"5.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0284C7\">100</text>\n        <line x1=\"62\" y1=\"56\" x2=\"72\" y2=\"56\"/><text x=\"74\" y=\"58\" font-size=\"5.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0284C7\">80</text>\n        <line x1=\"62\" y1=\"74\" x2=\"72\" y2=\"74\"/><text x=\"74\" y=\"76\" font-size=\"5.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0284C7\">60</text>\n        <line x1=\"62\" y1=\"92\" x2=\"72\" y2=\"92\"/><text x=\"74\" y=\"94\" font-size=\"5.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0284C7\">40</text>\n        <line x1=\"62\" y1=\"110\" x2=\"72\" y2=\"110\"/><text x=\"74\" y=\"112\" font-size=\"5.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0284C7\">20</text>\n        <line x1=\"56\" y1=\"128\" x2=\"72\" y2=\"128\"/><text x=\"74\" y=\"130\" font-size=\"5.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0284C7\">10</text>\n      </g>\n    "
  },
  {
    "id": "test-tube",
    "name": "Test Tube",
    "category": "Glassware",
    "viewBox": "0 0 70 190",
    "svgPath": "M12 4 L12 90 Q12 108 20 108 Q28 108 28 90 L28 4 M12 4 L28 4",
    "primaryUse": "Holds small liquid volumes (2–10 cm³) for color changes, precipitates, and solubility tests",
    "labContext": "Central vessel used throughout Question 2 (Inorganic Salt Analysis) for ion identification",
    "safetyNote": "Never point the open mouth of a test tube at yourself or classmates.",
    "funFact": "Invented by Jöns Jacob Berzelius in the early 1800s to minimize chemical waste.",
    "specs": {
      "material": "Borosilicate Glass (15 × 150 mm)",
      "capacity": "15 cm³",
      "tolerance": "Qualitative reactions only",
      "handling": "Hold at a 45° angle when shaking or observing precipitate solubility"
    },
    "quizDistractors": [
      "Boiling Tube",
      "Burette",
      "Dropping Pipette"
    ],
    "useDistractors": [
      "Measures 10 cm³ volumes precisely",
      "Holds titration analyte",
      "Separates mixtures by density"
    ],
    "richSVG": "\n      <ellipse cx=\"35\" cy=\"14\" rx=\"15\" ry=\"4\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <rect x=\"23\" y=\"14\" width=\"24\" height=\"142\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <path d=\"M23 156 A12 12 0 0 0 47 156\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <path d=\"M24.5 130 L45.5 130 L45.5 156 A10.5 10.5 0 0 1 24.5 156 Z\" fill=\"#0284C7\"/>\n      <rect x=\"24.5\" y=\"78\" width=\"21\" height=\"52\" fill=\"#BAE6FD\" opacity=\"0.6\"/>\n      <ellipse cx=\"35\" cy=\"78\" rx=\"10.5\" ry=\"3\" fill=\"#7DD3FC\"/>\n      <line x1=\"26\" y1=\"18\" x2=\"26\" y2=\"152\" stroke=\"#FFFFFF\" stroke-width=\"2\" opacity=\"0.85\" stroke-linecap=\"round\"/>\n    "
  },
  {
    "id": "boiling-tube",
    "name": "Boiling Tube",
    "category": "Glassware",
    "viewBox": "0 0 90 210",
    "svgPath": "M12 4 L12 112 Q12 132 23 132 Q34 132 34 112 L34 4 M12 4 L34 4",
    "primaryUse": "Withstands strong direct thermal heating of solids and liquids; larger diameter than a test tube",
    "labContext": "Used in Question 2 & 3 for strong heating of solid carbonates, nitrates, and organic cracking",
    "safetyNote": "Always hold with a wooden test tube holder clamp. Never heat a sealed tube.",
    "funFact": "Boiling tubes have 25% thicker walls than standard test tubes to survive thermal expansion stress.",
    "specs": {
      "material": "Heavy-Wall Borosilicate 3.3 Glass (25 × 150 mm)",
      "capacity": "50 cm³",
      "tolerance": "Thermal shock resistant to 500°C",
      "handling": "Pass tube gently through flame (brushing technique) to distribute heat evenly"
    },
    "quizDistractors": [
      "Test Tube",
      "Measuring Cylinder",
      "Gas Jar"
    ],
    "useDistractors": [
      "Measures accurate liquid volumes",
      "Carries out burette titrations",
      "Stores cold volatile ethers"
    ],
    "richSVG": "\n      <g id=\"woodenHolder\">\n        <rect x=\"8\" y=\"58\" width=\"74\" height=\"14\" rx=\"2\" fill=\"#D97706\" stroke=\"#92400E\" stroke-width=\"1\"/>\n        <line x1=\"30\" y1=\"58\" x2=\"30\" y2=\"72\" stroke=\"#B45309\" stroke-width=\"1.5\"/>\n        <circle cx=\"68\" cy=\"65\" r=\"3.5\" fill=\"url(#agBrass)\" stroke=\"#78350F\" stroke-width=\"0.8\"/>\n      </g>\n      <ellipse cx=\"45\" cy=\"16\" rx=\"20\" ry=\"5\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <rect x=\"29\" y=\"16\" width=\"32\" height=\"154\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <path d=\"M29 170 A16 16 0 0 0 61 170\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <path d=\"M30.5 110 L59.5 110 L59.5 170 A14.5 14.5 0 0 1 30.5 170 Z\" fill=\"url(#agLiquidAmber)\"/>\n      <ellipse cx=\"45\" cy=\"110\" rx=\"14.5\" ry=\"3.5\" fill=\"#FDE68A\"/>\n      <circle cx=\"42\" cy=\"135\" r=\"2.5\" fill=\"#FFFFFF\" opacity=\"0.8\"/>\n      <circle cx=\"49\" cy=\"148\" r=\"3\" fill=\"#FFFFFF\" opacity=\"0.8\"/>\n      <circle cx=\"38\" cy=\"158\" r=\"2\" fill=\"#FFFFFF\" opacity=\"0.8\"/>\n      <line x1=\"33\" y1=\"20\" x2=\"33\" y2=\"168\" stroke=\"#FFFFFF\" stroke-width=\"2.5\" opacity=\"0.85\" stroke-linecap=\"round\"/>\n    "
  },
  {
    "id": "thermometer",
    "name": "Thermometer (0–110 °C)",
    "category": "Measurement",
    "viewBox": "0 0 60 250",
    "svgPath": "M12 4 L12 110 A6 6 0 0 0 12 122 A6 6 0 0 0 18 122 A6 6 0 0 0 18 110 L18 4 Z",
    "primaryUse": "Measures reaction temperature changes in thermochemistry and rates experiments",
    "labContext": "Used in thermochemistry practicals (enthalpy of displacement & neutralization) to measure ΔT",
    "safetyNote": "Do not use as a stirring rod. Mercury or spirit bulb is fragile and easily cracked.",
    "funFact": "Modern school thermometers use red hydrocarbon spirit (kerosene) dyed red instead of toxic mercury.",
    "specs": {
      "material": "Enclosed Scale Glass Stem with Red Spirit Fill",
      "capacity": "-10 °C to 110 °C",
      "tolerance": "±0.5 °C (Class B)",
      "handling": "Immerse bulb fully into middle of liquid; never let it rest against the beaker bottom"
    },
    "quizDistractors": [
      "Stirring Rod",
      "Boiling Tube",
      "Capillary Tube"
    ],
    "useDistractors": [
      "Stirs viscous reaction solutions",
      "Delivers drops of indicator",
      "Holds boiling liquids"
    ],
    "richSVG": "\n      <circle cx=\"30\" cy=\"14\" r=\"5.5\" fill=\"none\" stroke=\"#38BDF8\" stroke-width=\"1.8\"/>\n      <rect x=\"23\" y=\"18\" width=\"14\" height=\"204\" rx=\"7\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <rect x=\"25\" y=\"22\" width=\"10\" height=\"196\" fill=\"#F8FAFC\"/>\n      <rect x=\"29\" y=\"88\" width=\"2\" height=\"132\" fill=\"#EF4444\"/>\n      <g stroke=\"#0F172A\" stroke-width=\"0.7\">\n        <line x1=\"28\" y1=\"40\" x2=\"33\" y2=\"40\"/><text x=\"14\" y=\"42\" font-size=\"5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0F172A\">100</text>\n        <line x1=\"29\" y1=\"65\" x2=\"33\" y2=\"65\"/><text x=\"17\" y=\"67\" font-size=\"5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0F172A\">75</text>\n        <line x1=\"28\" y1=\"90\" x2=\"33\" y2=\"90\"/><text x=\"17\" y=\"92\" font-size=\"5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0F172A\">50</text>\n        <line x1=\"29\" y1=\"115\" x2=\"33\" y2=\"115\"/><text x=\"17\" y=\"117\" font-size=\"5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0F172A\">25</text>\n        <line x1=\"28\" y1=\"140\" x2=\"33\" y2=\"140\"/><text x=\"20\" y=\"142\" font-size=\"5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0F172A\">0</text>\n      </g>\n      <circle cx=\"30\" cy=\"228\" r=\"10\" fill=\"url(#agLiquidRed)\" stroke=\"#991B1B\" stroke-width=\"1\"/>\n      <circle cx=\"27\" cy=\"224\" r=\"3.2\" fill=\"#FFFFFF\" opacity=\"0.75\"/>\n    "
  },
  {
    "id": "tripod-stand",
    "name": "Tripod Stand",
    "category": "Heating",
    "viewBox": "0 0 180 160",
    "svgPath": "M30 18 L150 18 L165 145 L145 145 L135 34 L45 34 L35 145 L15 145 Z",
    "primaryUse": "Provides a sturdy three-legged elevated platform for heating beakers, flasks, and crucibles",
    "labContext": "Supports wire gauze and beaker directly above a Bunsen burner during heating practicals",
    "safetyNote": "Allow to cool completely after heating before touching. Cast iron stays hot long after flame is off.",
    "funFact": "Three legs will never wobble on an uneven floor, making tripods mechanically self-leveling.",
    "specs": {
      "material": "Cast Iron Ring with Plated Mild Steel Legs",
      "capacity": "Supports up to 5 kg",
      "tolerance": "Height standard 200 mm",
      "handling": "Always center wire gauze over the circular ring before placing glassware"
    },
    "quizDistractors": [
      "Retort Stand",
      "Test Tube Rack",
      "Pipeclay Triangle"
    ],
    "useDistractors": [
      "Holds vertical burettes",
      "Stirs heated liquids",
      "Measures heat transfer"
    ],
    "richSVG": "\n      <ellipse cx=\"90\" cy=\"148\" rx=\"72\" ry=\"7\" fill=\"rgba(0,0,0,0.18)\"/>\n      <polygon points=\"87,36 93,36 94,140 86,140\" fill=\"#334155\"/>\n      <rect x=\"85\" y=\"138\" width=\"10\" height=\"5\" rx=\"2\" fill=\"#0F172A\"/>\n      <polygon points=\"40,36 46,34 22,146 14,146\" fill=\"url(#agMetalChrome)\" stroke=\"#1E293B\" stroke-width=\"0.8\"/>\n      <rect x=\"12\" y=\"144\" width=\"12\" height=\"6\" rx=\"2\" fill=\"#0F172A\"/>\n      <polygon points=\"140,36 134,34 158,146 166,146\" fill=\"url(#agMetalChrome)\" stroke=\"#1E293B\" stroke-width=\"0.8\"/>\n      <rect x=\"156\" y=\"144\" width=\"12\" height=\"6\" rx=\"2\" fill=\"#0F172A\"/>\n      <ellipse cx=\"90\" cy=\"30\" rx=\"60\" ry=\"18\" fill=\"url(#agCastIron)\" stroke=\"#0F172A\" stroke-width=\"1.5\"/>\n      <ellipse cx=\"90\" cy=\"30\" rx=\"44\" ry=\"12\" fill=\"#1E293B\" stroke=\"#0F172A\" stroke-width=\"1\"/>\n      <ellipse cx=\"90\" cy=\"27\" rx=\"58\" ry=\"16\" fill=\"none\" stroke=\"rgba(255,255,255,0.3)\" stroke-width=\"1\"/>\n    "
  },
  {
    "id": "wire-gauze",
    "name": "Wire Gauze",
    "category": "Heating",
    "viewBox": "0 0 150 150",
    "svgPath": "M10 10 L140 10 L140 140 L10 140 Z M30 30 L120 30 L120 120 L30 120 Z",
    "primaryUse": "Diffuses Bunsen flame heat evenly across glassware base, preventing thermal cracking",
    "labContext": "Placed on top of a tripod stand beneath beakers and flasks during evaporation and boiling",
    "safetyNote": "Modern gauze uses ceramic fiber centers; never use damaged or frayed asbestos pads.",
    "funFact": "Invented by Sir Humphry Davy in 1815 as part of the safety lamp for coal miners.",
    "specs": {
      "material": "Galvanized Iron Wire Mesh with Ceramic Center Disc",
      "capacity": "Heat resistant to 800°C",
      "tolerance": "Standard 150 × 150 mm square",
      "handling": "Keep ceramic center directly over the flame to diffuse localized thermal hotspots"
    },
    "quizDistractors": [
      "Pipeclay Triangle",
      "Tripod Stand",
      "Heat Mat"
    ],
    "useDistractors": [
      "Filters precipitates from solution",
      "Directs gas into test tubes",
      "Holds crucibles at 1000°C"
    ],
    "richSVG": "\n      <rect x=\"12\" y=\"12\" width=\"126\" height=\"126\" rx=\"4\" fill=\"#94A3B8\" stroke=\"#475569\" stroke-width=\"1.2\"/>\n      <rect x=\"18\" y=\"18\" width=\"114\" height=\"114\" fill=\"#E2E8F0\"/>\n      <g stroke=\"#94A3B8\" stroke-width=\"1\" opacity=\"0.75\">\n        <line x1=\"26\" y1=\"18\" x2=\"26\" y2=\"132\"/><line x1=\"36\" y1=\"18\" x2=\"36\" y2=\"132\"/>\n        <line x1=\"46\" y1=\"18\" x2=\"46\" y2=\"132\"/><line x1=\"56\" y1=\"18\" x2=\"56\" y2=\"132\"/>\n        <line x1=\"66\" y1=\"18\" x2=\"66\" y2=\"132\"/><line x1=\"76\" y1=\"18\" x2=\"76\" y2=\"132\"/>\n        <line x1=\"86\" y1=\"18\" x2=\"86\" y2=\"132\"/><line x1=\"96\" y1=\"18\" x2=\"96\" y2=\"132\"/>\n        <line x1=\"106\" y1=\"18\" x2=\"106\" y2=\"132\"/><line x1=\"116\" y1=\"18\" x2=\"116\" y2=\"132\"/>\n        <line x1=\"18\" y1=\"26\" x2=\"132\" y2=\"26\"/><line x1=\"18\" y1=\"36\" x2=\"132\" y2=\"36\"/>\n        <line x1=\"18\" y1=\"46\" x2=\"132\" y2=\"46\"/><line x1=\"18\" y1=\"56\" x2=\"132\" y2=\"56\"/>\n        <line x1=\"18\" y1=\"66\" x2=\"132\" y2=\"66\"/><line x1=\"18\" y1=\"76\" x2=\"132\" y2=\"76\"/>\n        <line x1=\"18\" y1=\"86\" x2=\"132\" y2=\"86\"/><line x1=\"18\" y1=\"96\" x2=\"132\" y2=\"96\"/>\n        <line x1=\"18\" y1=\"106\" x2=\"132\" y2=\"106\"/><line x1=\"18\" y1=\"116\" x2=\"132\" y2=\"116\"/>\n      </g>\n      <circle cx=\"75\" cy=\"75\" r=\"42\" fill=\"#F8FAFC\" stroke=\"#CBD5E1\" stroke-width=\"2\"/>\n      <circle cx=\"75\" cy=\"75\" r=\"30\" fill=\"#F1F5F9\" opacity=\"0.8\"/>\n      <circle cx=\"75\" cy=\"75\" r=\"16\" fill=\"#E2E8F0\" opacity=\"0.6\"/>\n      <text x=\"56\" y=\"78\" font-size=\"6.5\" font-weight=\"bold\" fill=\"#64748B\" font-family=\"'Plus Jakarta Sans', sans-serif\">CERAMIC</text>\n    "
  },
  {
    "id": "bunsen-burner",
    "name": "Bunsen Burner",
    "category": "Heating",
    "viewBox": "0 0 140 220",
    "svgPath": "M50 180 L90 180 L80 140 L76 70 L64 70 L60 140 Z",
    "primaryUse": "Provides a clean, adjustable high-temperature gas flame for heating and flame tests",
    "labContext": "Used for cation flame tests (Ca²⁺ brick red, Na⁺ yellow, K⁺ lilac, Ba²⁺ pale green) & heating",
    "safetyNote": "Always light with air collar closed (yellow safety flame). Switch to non-luminous blue for heating.",
    "funFact": "Invented by Robert Bunsen and Peter Desaga in 1855 at the University of Heidelberg.",
    "specs": {
      "material": "Die-cast Heavy Base with Nickel-Plated Brass Tube",
      "capacity": "Reaches up to 1,500 °C in roaring blue zone",
      "tolerance": "LPG / Natural gas rated",
      "handling": "Adjust air collar: open collar = hot non-luminous blue flame; closed = cool smoky yellow flame"
    },
    "quizDistractors": [
      "Spirit Lamp",
      "Hot Plate",
      "Blowpipe"
    ],
    "useDistractors": [
      "Measures heat output in Joules",
      "Stores gas under pressure",
      "Filters flammable vapors"
    ],
    "richSVG": "\n      <g filter=\"url(#agGlow)\">\n        <path d=\"M63 80 Q52 38 70 6 Q88 38 77 80 Z\" fill=\"url(#agFlameOuter)\"/>\n        <path d=\"M65 80 Q60 52 70 32 Q80 52 75 80 Z\" fill=\"url(#agFlameInner)\"/>\n      </g>\n      <rect x=\"63\" y=\"80\" width=\"14\" height=\"74\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"1\"/>\n      <line x1=\"66\" y1=\"80\" x2=\"66\" y2=\"154\" stroke=\"#FFFFFF\" stroke-width=\"2\" opacity=\"0.8\"/>\n      <rect x=\"61\" y=\"152\" width=\"18\" height=\"16\" rx=\"1\" fill=\"url(#agBrass)\" stroke=\"#78350F\" stroke-width=\"0.8\"/>\n      <ellipse cx=\"70\" cy=\"160\" rx=\"4\" ry=\"5\" fill=\"#0F172A\"/>\n      <rect x=\"58\" y=\"168\" width=\"24\" height=\"8\" rx=\"2\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"0.8\"/>\n      <ellipse cx=\"70\" cy=\"195\" rx=\"52\" ry=\"14\" fill=\"url(#agCastIron)\" stroke=\"#0F172A\" stroke-width=\"1.5\"/>\n      <ellipse cx=\"70\" cy=\"192\" rx=\"48\" ry=\"11\" fill=\"none\" stroke=\"rgba(255,255,255,0.25)\" stroke-width=\"1\"/>\n      <rect x=\"18\" y=\"184\" width=\"28\" height=\"8\" rx=\"1\" fill=\"url(#agBrass)\" stroke=\"#78350F\" stroke-width=\"0.8\"/>\n      <path d=\"M18 188 C8 188 4 195 4 205\" fill=\"none\" stroke=\"#DC2626\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n    "
  },
  {
    "id": "retort-stand",
    "name": "Retort Stand & Clamp",
    "category": "Heating",
    "viewBox": "0 0 160 260",
    "svgPath": "M10 240 L150 240 L140 220 L20 220 Z M38 220 L38 20 L46 20 L46 220 Z",
    "primaryUse": "Holds and stabilizes tall laboratory glassware (burettes, condensers, and flasks) at any height",
    "labContext": "Essential backbone of Question 1 (Volumetric Analysis) — anchors the burette vertically",
    "safetyNote": "Ensure the heavy base points toward the clamp arm to prevent the stand from tipping over.",
    "funFact": "Named after the \"retort\" — an ancient spherical distillation vessel with a long bent neck.",
    "specs": {
      "material": "Cast Iron Base with Polished Stainless Steel Rod",
      "capacity": "Rod length 600 mm, holds up to 2.5 kg",
      "tolerance": "Heavy stability weighted base",
      "handling": "Always clamp glass with padded cork/rubber jaws to avoid cracking the barrel under pressure"
    },
    "quizDistractors": [
      "Tripod Stand",
      "Test Tube Rack",
      "Burette Bracket"
    ],
    "useDistractors": [
      "Heats chemical solutions directly",
      "Measures accurate liquid volume",
      "Diffuses heat evenly"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <polygon points=\"18,236 142,236 150,250 10,250\" fill=\"url(#agCastIron)\" stroke=\"#0F172A\" stroke-width=\"1.2\"/>\n        <line x1=\"22\" y1=\"238\" x2=\"138\" y2=\"238\" stroke=\"rgba(255,255,255,0.3)\" stroke-width=\"1\"/>\n      </g>\n      <rect x=\"36\" y=\"14\" width=\"8\" height=\"224\" rx=\"2\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"0.8\"/>\n      <line x1=\"38\" y1=\"15\" x2=\"38\" y2=\"236\" stroke=\"#FFFFFF\" stroke-width=\"1.8\" opacity=\"0.8\"/>\n      <rect x=\"31\" y=\"86\" width=\"18\" height=\"22\" rx=\"2\" fill=\"#1E293B\" stroke=\"#475569\" stroke-width=\"1\"/>\n      <circle cx=\"26\" cy=\"97\" r=\"5\" fill=\"url(#agBrass)\" stroke=\"#78350F\" stroke-width=\"0.8\"/>\n      <rect x=\"49\" y=\"94\" width=\"36\" height=\"6\" rx=\"1\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"0.8\"/>\n      <g stroke=\"#DC2626\" stroke-width=\"4.5\" stroke-linecap=\"round\" fill=\"none\">\n        <path d=\"M85 88 Q100 84 112 90\"/>\n        <path d=\"M85 106 Q100 110 112 104\"/>\n      </g>\n      <rect x=\"104\" y=\"58\" width=\"14\" height=\"96\" rx=\"3\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\" opacity=\"0.85\"/>\n    "
  },
  {
    "id": "watch-glass",
    "name": "Watch Glass",
    "category": "Glassware",
    "viewBox": "0 0 150 90",
    "svgPath": "M15 45 Q75 75 135 45 Q75 15 15 45 Z",
    "primaryUse": "Holds solid crystals for weighing, serves as a beaker cover, or evaporates small liquid drops",
    "labContext": "Used in Question 2 & 3 for placing sample crystals and observing subliming vapors",
    "safetyNote": "Do not heat watch glasses with a direct concentrated flame — always use a steam water bath.",
    "funFact": "Named for its identical shape to the curved crystal glass face of traditional antique pocket watches.",
    "specs": {
      "material": "Clear Annealed Soda-Lime Glass",
      "capacity": "Diameter 75 mm / 100 mm",
      "tolerance": "Chemical splash and vapor resistant",
      "handling": "Place over beakers during heating to allow condensation inspection while containing splashes"
    },
    "quizDistractors": [
      "Petri Dish",
      "Evaporating Basin",
      "Glass Slide"
    ],
    "useDistractors": [
      "Carries out buret titrations",
      "Measures 50 cm³ volumes",
      "Burns hydrocarbons directly"
    ],
    "richSVG": "\n      <ellipse cx=\"75\" cy=\"54\" rx=\"58\" ry=\"10\" fill=\"rgba(0,0,0,0.16)\"/>\n      <ellipse cx=\"75\" cy=\"42\" rx=\"60\" ry=\"22\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.6\"/>\n      <ellipse cx=\"75\" cy=\"44\" rx=\"52\" ry=\"17\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"1.8\" opacity=\"0.75\"/>\n      <ellipse cx=\"75\" cy=\"46\" rx=\"38\" ry=\"11\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"1\"/>\n      <g id=\"crystals\">\n        <polygon points=\"68,44 75,38 82,44 76,48\" fill=\"#F97316\"/>\n        <polygon points=\"62,46 68,42 74,48 66,50\" fill=\"#EA580C\"/>\n        <polygon points=\"76,45 84,41 90,46 82,50\" fill=\"#F97316\"/>\n        <polygon points=\"70,40 78,35 84,40 76,43\" fill=\"#FBBF24\"/>\n        <circle cx=\"75\" cy=\"42\" r=\"1.5\" fill=\"#FEF08A\"/>\n        <circle cx=\"82\" cy=\"44\" r=\"1\" fill=\"#FEF08A\"/>\n      </g>\n    "
  },
  {
    "id": "dropping-pipette",
    "name": "Dropping Pipette",
    "category": "Transfer",
    "viewBox": "0 0 70 230",
    "svgPath": "M30 10 L40 10 L40 40 L37 40 L37 160 L34 185 L36 185 L33 160 L33 40 L30 40 Z",
    "primaryUse": "Transfers and delivers liquids dropwise (e.g. indicators, barium chloride, ammonia solution)",
    "labContext": "Crucial for drop-by-drop addition of NaOH and NH₃(aq) until in excess during cation qualitative analysis",
    "safetyNote": "Do not lay a filled dropper flat on the bench; liquid will run into and contaminate the rubber teat.",
    "funFact": "Also called a Pasteur pipette, named after French microbiologist Louis Pasteur who popularized it.",
    "specs": {
      "material": "Borosilicate Glass Stem with Natural Rubber Teat",
      "capacity": "Approx. 1–2 cm³ (20 drops ≈ 1.0 cm³)",
      "tolerance": "Dropwise qualitative dosing",
      "handling": "Hold vertically 1 cm above test tube mouth to ensure uniform reproducible drop volume"
    },
    "quizDistractors": [
      "Bulb Pipette",
      "Burette",
      "Capillary Tube"
    ],
    "useDistractors": [
      "Measures exact 25.0 cm³ aliquot",
      "Heats volatile flammable liquids",
      "Filters insoluble residues"
    ],
    "richSVG": "\n      <g id=\"dropperTeat\">\n        <ellipse cx=\"35\" cy=\"30\" rx=\"15\" ry=\"22\" fill=\"url(#agRubberRed)\" stroke=\"#7F1D1D\" stroke-width=\"1.2\"/>\n        <ellipse cx=\"35\" cy=\"22\" rx=\"13\" ry=\"4\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"1.2\"/>\n        <ellipse cx=\"35\" cy=\"30\" rx=\"14\" ry=\"4\" fill=\"none\" stroke=\"rgba(255,255,255,0.3)\" stroke-width=\"1\"/>\n        <rect x=\"31\" y=\"50\" width=\"8\" height=\"6\" fill=\"#7F1D1D\"/>\n      </g>\n      <rect x=\"31\" y=\"54\" width=\"8\" height=\"110\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <rect x=\"32.5\" y=\"86\" width=\"5\" height=\"78\" fill=\"url(#agLiquidAmber)\"/>\n      <ellipse cx=\"35\" cy=\"86\" rx=\"2.5\" ry=\"1.2\" fill=\"#FDE68A\"/>\n      <line x1=\"33\" y1=\"56\" x2=\"33\" y2=\"160\" stroke=\"#FFFFFF\" stroke-width=\"1.6\" opacity=\"0.8\"/>\n      <polygon points=\"31,164 39,164 36.5,204 33.5,204\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n      <polygon points=\"32.5,164 37.5,164 36,204 34,204\" fill=\"url(#agLiquidAmber)\"/>\n      <path d=\"M35 208 C31 214 30 219 35 222 C40 219 39 214 35 208 Z\" fill=\"#F59E0B\" opacity=\"0.95\"/>\n    "
  },
  {
    "id": "spatula",
    "name": "Spatula",
    "category": "Transfer",
    "viewBox": "0 0 180 80",
    "svgPath": "M10 38 L60 38 L120 40 L170 36 L170 44 L120 42 L60 42 L10 42 Z",
    "primaryUse": "Transfers small quantities of solid chemical powders and crystals without direct skin contact",
    "labContext": "Used to scoop unknown solid salts into boiling tubes or watch glasses for solubility tests",
    "safetyNote": "Always wipe spatula with a clean dry cloth between reagents to prevent cross-contamination.",
    "funFact": "Laboratory spatulas are crafted from 304 austenitic stainless steel to resist corrosive acids and alkalis.",
    "specs": {
      "material": "AISI 304 Stainless Steel",
      "capacity": "Blade 150 mm long",
      "tolerance": "Acid, alkali, and flame resistant",
      "handling": "Never taste chemicals from a spatula; tap spatula handle gently to dislodge fine crystals"
    },
    "quizDistractors": [
      "Glass Rod",
      "Forceps",
      "Deflagrating Spoon"
    ],
    "useDistractors": [
      "Measures liquid volume",
      "Acts as a stirring thermometer",
      "Extracts immiscible layers"
    ],
    "richSVG": "\n      <ellipse cx=\"90\" cy=\"50\" rx=\"76\" ry=\"6\" fill=\"rgba(0,0,0,0.14)\"/>\n      <polygon points=\"14,35 60,35 60,45 14,45 8,40\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"1\"/>\n      <rect x=\"60\" y=\"36.5\" width=\"60\" height=\"7\" rx=\"1.5\" fill=\"#64748B\" stroke=\"#334155\" stroke-width=\"0.8\"/>\n      <g stroke=\"#334155\" stroke-width=\"1\">\n        <line x1=\"70\" y1=\"36.5\" x2=\"70\" y2=\"43.5\"/><line x1=\"80\" y1=\"36.5\" x2=\"80\" y2=\"43.5\"/>\n        <line x1=\"90\" y1=\"36.5\" x2=\"90\" y2=\"43.5\"/><line x1=\"100\" y1=\"36.5\" x2=\"100\" y2=\"43.5\"/>\n        <line x1=\"110\" y1=\"36.5\" x2=\"110\" y2=\"43.5\"/>\n      </g>\n      <path d=\"M120 36.5 L158 35.5 Q172 35.5 172 40 Q172 44.5 158 44.5 L120 43.5 Z\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"1\"/>\n      <line x1=\"14\" y1=\"38\" x2=\"166\" y2=\"38\" stroke=\"#FFFFFF\" stroke-width=\"1.8\" opacity=\"0.8\"/>\n      <g fill=\"#0284C7\">\n        <polygon points=\"148,37 154,34 158,38 152,41\"/>\n        <polygon points=\"155,38 162,35 166,39 160,42\" fill=\"#38BDF8\"/>\n        <circle cx=\"156\" cy=\"38\" r=\"1.5\" fill=\"#FEF08A\"/>\n      </g>\n    "
  },
  {
    "id": "filter-funnel",
    "name": "Filter Funnel & Filter Paper",
    "category": "Transfer",
    "viewBox": "0 0 140 190",
    "svgPath": "M15 20 L125 20 L75 90 L75 170 L65 170 L65 90 Z",
    "primaryUse": "Separates insoluble solid precipitates from liquid mixtures through filter paper filtration",
    "labContext": "Used in Question 2 to separate lead sulfate residue from soluble zinc filtrates",
    "safetyNote": "Wet the filter paper with distilled water so it adheres flat to funnel walls with no air bubbles.",
    "funFact": "Standard chemistry funnels have a strictly standardized 60° internal apex angle for optimum flow rate.",
    "specs": {
      "material": "Borosilicate 3.3 Glass with Whatman No. 1 Filter Paper",
      "capacity": "Diameter 75 mm, 60° cone angle",
      "tolerance": "Particle retention 11 µm",
      "handling": "Stem tip must touch the receiving beaker inside wall to maintain a continuous siphon column"
    },
    "quizDistractors": [
      "Separating Funnel",
      "Thistle Funnel",
      "Buchner Funnel"
    ],
    "useDistractors": [
      "Separates two immiscible liquids",
      "Adds acid into sealed flasks",
      "Measures filtration rates"
    ],
    "richSVG": "\n      <ellipse cx=\"70\" cy=\"22\" rx=\"48\" ry=\"8\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <polygon points=\"22,22 118,22 75,90 65,90\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      <polygon points=\"28,24 112,24 73,86 67,86\" fill=\"#F8FAFC\" stroke=\"#CBD5E1\" stroke-width=\"1\"/>\n      <line x1=\"70\" y1=\"24\" x2=\"70\" y2=\"86\" stroke=\"#E2E8F0\" stroke-width=\"1.5\"/>\n      <line x1=\"49\" y1=\"24\" x2=\"69\" y2=\"86\" stroke=\"#E2E8F0\" stroke-width=\"1.2\"/>\n      <line x1=\"91\" y1=\"24\" x2=\"71\" y2=\"86\" stroke=\"#E2E8F0\" stroke-width=\"1.2\"/>\n      <polygon points=\"65,90 75,90 75,168 65,176\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n      <line x1=\"30\" y1=\"24\" x2=\"68\" y2=\"88\" stroke=\"#FFFFFF\" stroke-width=\"2.5\" opacity=\"0.8\" stroke-linecap=\"round\"/>\n      <line x1=\"68\" y1=\"92\" x2=\"68\" y2=\"170\" stroke=\"#FFFFFF\" stroke-width=\"1.8\" opacity=\"0.8\"/>\n      <circle cx=\"70\" cy=\"182\" r=\"3\" fill=\"#38BDF8\" opacity=\"0.85\"/>\n    "
  },
  {
    "id": "wash-bottle",
    "name": "Wash Bottle",
    "category": "Transfer",
    "viewBox": "0 0 130 220",
    "svgPath": "M30 70 L100 70 L100 190 L30 190 Z M55 70 L55 45 L75 45 L75 70 Z M65 45 L65 20 Q65 10 75 10 L105 18 Q115 22 115 32 L115 50",
    "primaryUse": "Dispenses a precise jet of deionised / distilled water for rinsing apparatus and washing precipitates",
    "labContext": "Used to rinse burettes, pipettes, and wash solid residues clinging to the sides of glassware",
    "safetyNote": "Never fill with tap water — tap water contains dissolved ions ($Cl^-, Ca^{2+}, Mg^{2+}$) that corrupt tests.",
    "funFact": "Squeezing the bottle increases air pressure above the water, forcing liquid up the internal dip tube.",
    "specs": {
      "material": "Low-Density Polyethylene (LDPE) with Polypropylene Cap",
      "capacity": "500 cm³",
      "tolerance": "Flexible squeeze-dispense",
      "handling": "Always verify bottle contains pure distilled water before conducting analytical rinsing"
    },
    "quizDistractors": [
      "Reagent Bottle",
      "Dropping Bottle",
      "Gas Jar"
    ],
    "useDistractors": [
      "Contains strong concentrated sulfuric acid",
      "Measures accurate titration volumes",
      "Stores volatile liquids"
    ],
    "richSVG": "\n      <rect x=\"28\" y=\"72\" width=\"74\" height=\"126\" rx=\"20\" fill=\"#F1F5F9\" stroke=\"#94A3B8\" stroke-width=\"1.4\"/>\n      <rect x=\"30\" y=\"105\" width=\"70\" height=\"88\" rx=\"16\" fill=\"url(#agLiquidCyan)\"/>\n      <ellipse cx=\"65\" cy=\"105\" rx=\"35\" ry=\"5\" fill=\"#67E8F9\" opacity=\"0.8\"/>\n      <path d=\"M36 88 Q32 100 32 170\" stroke=\"#FFFFFF\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.8\"/>\n      <rect x=\"38\" y=\"120\" width=\"54\" height=\"34\" rx=\"3\" fill=\"#0284C7\" opacity=\"0.9\"/>\n      <text x=\"44\" y=\"133\" font-size=\"6\" font-weight=\"bold\" fill=\"#FFFFFF\" font-family=\"'Plus Jakarta Sans', sans-serif\">DISTILLED</text>\n      <text x=\"46\" y=\"143\" font-size=\"5.5\" font-weight=\"bold\" fill=\"#BAE6FD\" font-family=\"'Plus Jakarta Sans', sans-serif\">WATER H₂O</text>\n      <rect x=\"52\" y=\"52\" width=\"26\" height=\"20\" rx=\"3\" fill=\"url(#agRubberRed)\" stroke=\"#7F1D1D\" stroke-width=\"1\"/>\n      <line x1=\"56\" y1=\"52\" x2=\"56\" y2=\"72\" stroke=\"#7F1D1D\" stroke-width=\"1\"/>\n      <line x1=\"65\" y1=\"52\" x2=\"65\" y2=\"72\" stroke=\"#7F1D1D\" stroke-width=\"1\"/>\n      <line x1=\"74\" y1=\"52\" x2=\"74\" y2=\"72\" stroke=\"#7F1D1D\" stroke-width=\"1\"/>\n      <path d=\"M65 52 L65 24 Q65 14 78 14 L104 22 Q112 26 112 36 L112 56\" fill=\"none\" stroke=\"url(#agRubberRed)\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n      <path d=\"M112 56 Q115 72 118 88\" fill=\"none\" stroke=\"#06B6D4\" stroke-width=\"1.8\" stroke-dasharray=\"3,2.5\"/>\n    "
  },
  {
    "id": "safety-goggles",
    "name": "Safety Goggles",
    "category": "Safety",
    "viewBox": "0 0 180 110",
    "svgPath": "M20 30 Q50 20 90 30 Q130 20 160 30 L160 70 Q130 90 90 70 Q50 90 20 70 Z",
    "primaryUse": "Protects candidate eyes from chemical splashes, shattering glassware, and irritating fumes",
    "labContext": "Mandatory personal protective equipment (PPE) worn from the moment you enter the laboratory",
    "safetyNote": "Must fit snugly against face; regular spectacles do not protect against side chemical splashes.",
    "funFact": "Polycarbonate lenses can stop high-velocity metal particles traveling at over 150 km/h!",
    "specs": {
      "material": "Impact-Resistant Optical Polycarbonate with Soft PVC Frame",
      "capacity": "Panoramic 180° Field of View",
      "tolerance": "Meets ANSI Z87.1 / EN 166 Chemical Splash Certification",
      "handling": "Wear continuously throughout all practical papers until after apparatus cleanup"
    },
    "quizDistractors": [
      "Magnifying Glass",
      "Reading Spectacles",
      "Face Shield"
    ],
    "useDistractors": [
      "Magnifies tiny precipitate crystals",
      "Measures flame emission color",
      "Protects against UV radiation only"
    ],
    "richSVG": "\n      <path d=\"M22 50 Q8 54 2 58\" stroke=\"#1E293B\" stroke-width=\"6\" stroke-linecap=\"round\" fill=\"none\"/>\n      <path d=\"M158 50 Q172 54 178 58\" stroke=\"#1E293B\" stroke-width=\"6\" stroke-linecap=\"round\" fill=\"none\"/>\n      <path d=\"M18 32 Q54 22 90 32 Q126 22 162 32 Q174 58 160 82 Q126 95 98 74 Q90 70 82 74 Q54 95 20 82 Q6 58 18 32 Z\" fill=\"#E0F2FE\" stroke=\"#0284C7\" stroke-width=\"2.5\"/>\n      <path d=\"M22 35 Q55 26 90 35 Q125 26 158 35 Q168 56 156 78 Q125 90 98 72 Q90 68 82 72 Q55 90 24 78 Q12 56 22 35 Z\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.8\"/>\n      <path d=\"M32 40 Q54 35 76 44\" stroke=\"#FFFFFF\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.85\"/>\n      <path d=\"M104 44 Q126 35 148 40\" stroke=\"#FFFFFF\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.85\"/>\n      <circle cx=\"50\" cy=\"27\" r=\"3.5\" fill=\"#334155\" stroke=\"#1E293B\" stroke-width=\"0.8\"/>\n      <circle cx=\"130\" cy=\"27\" r=\"3.5\" fill=\"#334155\" stroke=\"#1E293B\" stroke-width=\"0.8\"/>\n      <circle cx=\"48\" cy=\"74\" r=\"3.5\" fill=\"#334155\" stroke=\"#1E293B\" stroke-width=\"0.8\"/>\n      <circle cx=\"132\" cy=\"74\" r=\"3.5\" fill=\"#334155\" stroke=\"#1E293B\" stroke-width=\"0.8\"/>\n    "
  },
  {
    "id": "volumetric-flask",
    "name": "Volumetric Flask (250 cm³)",
    "category": "Measurement",
    "viewBox": "0 0 140 210",
    "svgPath": "M62 10 L62 70 Q62 72 38 130 Q30 150 30 170 Q30 195 70 195 Q110 195 110 170 Q110 150 102 130 Q78 72 78 70 L78 10 Z M56 10 L84 10 M50 75 L90 75",
    "primaryUse": "Prepares standard solutions of precise known concentration by dissolving accurate mass up to the calibration ring",
    "labContext": "Used prior to volumetric titrations to prepare primary standard solutions (e.g. 0.05 M oxalic acid or 0.1 M Na₂CO₃)",
    "safetyNote": "Never heat liquids directly inside or dissolve hot solutes, as thermal expansion permanently distorts calibrated volume.",
    "funFact": "The narrow neck makes the meniscus position ultra-sensitive: a single excess drop visibly raises the fluid above the mark.",
    "specs": {
      "material": "Borosilicate 3.3 Glass (ISO 1042 Class A)",
      "capacity": "250.00 cm³",
      "tolerance": "±0.15 cm³",
      "handling": "Invert flask 10 times with polyethylene stopper securely seated to achieve homogeneous concentration"
    },
    "quizDistractors": [
      "Conical Flask",
      "Measuring Cylinder",
      "Flat-Bottom Flask"
    ],
    "useDistractors": [
      "Delivers variable drops of titrant",
      "Heats volatile organic liquids",
      "Filters solid precipitates"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <polygon points=\"62,10 78,10 82,24 58,24\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n        <polygon points=\"56,6 84,6 82,14 58,14\" fill=\"#0284C7\" stroke=\"#0369A1\" stroke-width=\"0.8\"/>\n        <rect x=\"64\" y=\"24\" width=\"12\" height=\"60\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n        <path d=\"M64 84 Q34 140 32 172 Q32 196 70 196 Q108 196 108 172 Q106 140 76 84 Z\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.5\"/>\n      </g>\n      <!-- Liquid fill -->\n      <path d=\"M65 68 L65 84 Q35 140 34 172 Q34 194 70 194 Q106 194 106 172 Q105 140 75 84 L75 68 Z\" fill=\"url(#agLiquidBlue)\"/>\n      <ellipse cx=\"70\" cy=\"68\" rx=\"5\" ry=\"1.2\" fill=\"#0284C7\"/>\n      <!-- Calibration etched line -->\n      <line x1=\"60\" y1=\"68\" x2=\"80\" y2=\"68\" stroke=\"#DC2626\" stroke-width=\"1.6\"/>\n      <text x=\"83\" y=\"70\" font-size=\"5\" font-weight=\"bold\" fill=\"#DC2626\" font-family=\"'JetBrains Mono', monospace\">Ring</text>\n      <!-- Specular reflection -->\n      <path d=\"M66 30 L66 80 Q40 135 38 168\" stroke=\"#FFFFFF\" stroke-width=\"2.5\" opacity=\"0.8\" stroke-linecap=\"round\" fill=\"none\"/>\n      <!-- Specification frosted badge -->\n      <g fill=\"#0284C7\" opacity=\"0.9\">\n        <circle cx=\"70\" cy=\"145\" r=\"14\" fill=\"rgba(255,255,255,0.7)\" stroke=\"#38BDF8\" stroke-width=\"0.8\"/>\n        <text x=\"60\" y=\"142\" font-size=\"5.5\" font-weight=\"bold\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0369A1\">250ml</text>\n        <text x=\"59\" y=\"148\" font-size=\"4\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0284C7\">In 20°C</text>\n        <text x=\"58\" y=\"153\" font-size=\"3.5\" font-family=\"'JetBrains Mono', monospace\" fill=\"#0284C7\">±0.15ml</text>\n      </g>\n    "
  },
  {
    "id": "white-tile",
    "name": "Porcelain White Tile",
    "category": "Transfer",
    "viewBox": "0 0 160 140",
    "svgPath": "M20 50 L100 20 L140 60 L60 90 Z M20 50 L20 62 L60 102 L60 90 Z M60 102 L140 72 L140 60 L60 90 Z",
    "primaryUse": "Provides a pure, neutral white background under the conical flask to detect subtle indicator color changes at the endpoint",
    "labContext": "Placed directly under the conical flask during Question 1 titrations so faint pink or orange endpoints are not missed",
    "safetyNote": "Keep dry; wipe clean immediately if acid or alkali drops splash onto the surface.",
    "funFact": "Eliminates chromatic distortion caused by dark or varnished wooden laboratory benchtops.",
    "specs": {
      "material": "High-fired glazed chemical porcelain",
      "capacity": "100 mm × 100 mm",
      "tolerance": "Chemically inert to strong acids and alkalis",
      "handling": "Center the conical flask directly on the tile under the burette jet"
    },
    "quizDistractors": [
      "Watch Glass",
      "Spotting Tile",
      "Filter Paper"
    ],
    "useDistractors": [
      "Measures liquid mass",
      "Heats solids to redness",
      "Evaporates solvents quickly"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- 3D Beveled porcelain tile -->\n        <!-- Front side edge -->\n        <polygon points=\"25,70 25,82 75,115 75,103\" fill=\"#94A3B8\" stroke=\"#64748B\" stroke-width=\"0.8\"/>\n        <!-- Right side edge -->\n        <polygon points=\"75,103 75,115 135,77 135,65\" fill=\"#CBD5E1\" stroke=\"#94A3B8\" stroke-width=\"0.8\"/>\n        <!-- Top surface -->\n        <polygon points=\"25,70 85,32 135,65 75,103\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"1.2\"/>\n      </g>\n      <!-- Glossy ceramic glaze specular sheen -->\n      <polygon points=\"35,68 85,37 125,63 75,94\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"1.8\" opacity=\"0.85\"/>\n      <!-- Refraction droplets illustrating indicator endpoint detection -->\n      <ellipse cx=\"65\" cy=\"74\" rx=\"8\" ry=\"4.5\" fill=\"#F472B6\" opacity=\"0.85\"/>\n      <ellipse cx=\"63\" cy=\"72\" rx=\"3\" ry=\"1.5\" fill=\"#FFFFFF\" opacity=\"0.9\"/>\n      <text x=\"78\" y=\"76\" font-size=\"5\" font-weight=\"bold\" fill=\"#DB2777\" font-family=\"'JetBrains Mono', monospace\">Endpoint Pink</text>\n      <ellipse cx=\"100\" cy=\"56\" rx=\"6\" ry=\"3.5\" fill=\"#38BDF8\" opacity=\"0.8\"/>\n      <ellipse cx=\"98\" cy=\"55\" rx=\"2\" ry=\"1.2\" fill=\"#FFFFFF\" opacity=\"0.9\"/>\n    "
  },
  {
    "id": "electronic-balance",
    "name": "Digital Top-Pan Balance",
    "category": "Measurement",
    "viewBox": "0 0 180 150",
    "svgPath": "M25 50 L155 50 L165 110 L15 110 Z M50 25 L130 25 L130 50 L50 50 Z M45 75 L135 75 L135 100 L45 100 Z",
    "primaryUse": "Accurately weighs masses of solid reagents, watch glasses, crucibles, and filter papers to 0.01 g",
    "labContext": "Used in volumetric and gravimetric practicals to weigh anhydrous salts, magnesium ribbon, or solid precipitates",
    "safetyNote": "Never place wet or hot objects directly onto the stainless steel pan. Always use a weighing boat and tare the balance.",
    "funFact": "Can detect the mass of a single human fingerprint oil residue (~0.001 g).",
    "specs": {
      "material": "ABS housing with 304 stainless steel weighing pan",
      "capacity": "500.00 g",
      "tolerance": "±0.01 g readability",
      "handling": "Level with bubble indicator, zero with TARE button, avoid vibrations and air draughts"
    },
    "quizDistractors": [
      "Spring Balance",
      "Triple Beam Balance",
      "Platform Scale"
    ],
    "useDistractors": [
      "Measures solution volume",
      "Determines boiling points",
      "Counts chemical molecules directly"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- Main balance housing -->\n        <polygon points=\"25,55 155,55 165,125 15,125\" fill=\"#F1F5F9\" stroke=\"#94A3B8\" stroke-width=\"1.2\"/>\n        <polygon points=\"15,125 165,125 165,135 15,135\" fill=\"#334155\"/>\n      </g>\n      <!-- Circular stainless steel weighing pan -->\n      <ellipse cx=\"90\" cy=\"45\" rx=\"46\" ry=\"16\" fill=\"url(#agMetalChrome)\" stroke=\"#64748B\" stroke-width=\"1.2\"/>\n      <ellipse cx=\"90\" cy=\"45\" rx=\"38\" ry=\"12\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"1.5\" opacity=\"0.8\"/>\n      <!-- Digital LCD display frame -->\n      <rect x=\"45\" y=\"70\" width=\"90\" height=\"32\" rx=\"4\" fill=\"#0F172A\" stroke=\"#475569\" stroke-width=\"1.2\"/>\n      <!-- Glowing digital readout -->\n      <text x=\"56\" y=\"92\" font-size=\"16\" font-weight=\"bold\" fill=\"#38BDF8\" font-family=\"'JetBrains Mono', monospace\" letter-spacing=\"1\">25.04</text>\n      <text x=\"116\" y=\"92\" font-size=\"11\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">g</text>\n      <!-- Membrane buttons -->\n      <g>\n        <rect x=\"35\" y=\"108\" width=\"28\" height=\"10\" rx=\"2\" fill=\"#E2E8F0\" stroke=\"#94A3B8\" stroke-width=\"0.8\"/>\n        <text x=\"40\" y=\"115.5\" font-size=\"5\" font-weight=\"bold\" fill=\"#334155\">ON/OFF</text>\n        <rect x=\"76\" y=\"108\" width=\"28\" height=\"10\" rx=\"2\" fill=\"#0284C7\" stroke=\"#0369A1\" stroke-width=\"0.8\"/>\n        <text x=\"83\" y=\"115.5\" font-size=\"5\" font-weight=\"bold\" fill=\"#FFFFFF\">TARE</text>\n        <rect x=\"117\" y=\"108\" width=\"28\" height=\"10\" rx=\"2\" fill=\"#E2E8F0\" stroke=\"#94A3B8\" stroke-width=\"0.8\"/>\n        <text x=\"124\" y=\"115.5\" font-size=\"5\" font-weight=\"bold\" fill=\"#334155\">MODE</text>\n      </g>\n      <!-- Level spirit bubble -->\n      <circle cx=\"145\" cy=\"78\" r=\"4.5\" fill=\"#E2E8F0\" stroke=\"#94A3B8\" stroke-width=\"0.8\"/>\n      <circle cx=\"145\" cy=\"78\" r=\"1.8\" fill=\"#10B981\"/>\n    "
  },
  {
    "id": "stopwatch",
    "name": "Digital Stopwatch (Timer)",
    "category": "Measurement",
    "viewBox": "0 0 140 160",
    "svgPath": "M70 20 C35 20 20 45 20 85 C20 125 35 150 70 150 C105 150 120 125 120 85 C120 45 105 20 70 20 Z M62 8 L78 8 L78 20 L62 20 Z",
    "primaryUse": "Measures elapsed reaction time in seconds during reaction kinetics and rates of reaction experiments",
    "labContext": "Used in Form 4 Rates practicals (e.g. sodium thiosulfate + dilute HCl disappearing cross experiment)",
    "safetyNote": "Keep away from corrosive chemical fumes, splashes, and heating flames.",
    "funFact": "In KCSE kinetics analysis, reaction rate is calculated as the reciprocal of time (1/t in s⁻¹).",
    "specs": {
      "material": "Shock-resistant ABS resin casing",
      "capacity": "9 hr 59 min 59.99 s",
      "tolerance": "±0.01 s precision (Quartz crystal)",
      "handling": "Start immediately when solutions make first contact; stop when cross disappears"
    },
    "quizDistractors": [
      "Thermometer",
      "Hydrometer",
      "Manometer"
    ],
    "useDistractors": [
      "Measures volume of gas evolved",
      "Calculates molar mass directly",
      "Regulates burner flame temperature"
    ],
    "richSVG": "\n      <!-- Neck lanyard loop -->\n      <path d=\"M60 12 C60 0 80 0 80 12\" stroke=\"#64748B\" stroke-width=\"3\" fill=\"none\"/>\n      <rect x=\"62\" y=\"12\" width=\"16\" height=\"12\" rx=\"2\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"1\"/>\n      <!-- Push buttons -->\n      <rect x=\"30\" y=\"24\" width=\"14\" height=\"8\" rx=\"2\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"1\" transform=\"rotate(-30 37 28)\"/>\n      <rect x=\"96\" y=\"24\" width=\"14\" height=\"8\" rx=\"2\" fill=\"#EA580C\" stroke=\"#C2410C\" stroke-width=\"1\" transform=\"rotate(30 103 28)\"/>\n      <g filter=\"url(#agShadow)\">\n        <!-- Stopwatch circular body -->\n        <circle cx=\"70\" cy=\"90\" r=\"54\" fill=\"#1E293B\" stroke=\"#334155\" stroke-width=\"2.5\"/>\n        <circle cx=\"70\" cy=\"90\" r=\"48\" fill=\"#0F172A\"/>\n      </g>\n      <!-- Rubber grip ribs -->\n      <line x1=\"16\" y1=\"80\" x2=\"16\" y2=\"100\" stroke=\"#475569\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n      <line x1=\"124\" y1=\"80\" x2=\"124\" y2=\"100\" stroke=\"#475569\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n      <!-- Digital LCD display -->\n      <rect x=\"36\" y=\"70\" width=\"68\" height=\"34\" rx=\"4\" fill=\"#E2E8F0\" stroke=\"#94A3B8\" stroke-width=\"1\"/>\n      <text x=\"42\" y=\"93\" font-size=\"14\" font-weight=\"bold\" fill=\"#0F172A\" font-family=\"'JetBrains Mono', monospace\">00:42</text>\n      <text x=\"86\" y=\"87\" font-size=\"8\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">85</text>\n      <text x=\"44\" y=\"100\" font-size=\"4\" font-weight=\"bold\" fill=\"#64748B\">MIN</text>\n      <text x=\"66\" y=\"100\" font-size=\"4\" font-weight=\"bold\" fill=\"#64748B\">SEC</text>\n      <text x=\"86\" y=\"97\" font-size=\"4\" font-weight=\"bold\" fill=\"#64748B\">1/100</text>\n      <!-- Sub labels -->\n      <text x=\"50\" y=\"125\" font-size=\"5\" font-weight=\"bold\" fill=\"#94A3B8\" font-family=\"'JetBrains Mono', monospace\">SPLIT / RESET</text>\n      <text x=\"54\" y=\"55\" font-size=\"5.5\" font-weight=\"bold\" fill=\"#EA580C\" font-family=\"'JetBrains Mono', monospace\">START / STOP</text>\n    "
  },
  {
    "id": "test-tube-rack",
    "name": "Test Tube Rack",
    "category": "Transfer",
    "viewBox": "0 0 190 140",
    "svgPath": "M15 40 L175 40 L175 120 L15 120 Z M15 75 L175 75 M40 40 L40 120 M80 40 L80 120 M120 40 L120 120 M160 40 L160 120",
    "primaryUse": "Holds multiple test tubes upright in series during qualitative tests and provides pegs for inverted drying",
    "labContext": "Organizes unknown solutions during Questions 2 & 3 qualitative testing across multiple reagents",
    "safetyNote": "Never insert hot boiling tubes straight from the flame into plastic rack holes; allow them to cool slightly first.",
    "funFact": "Hardwood lab racks are kiln-treated with linseed oil to resist acid stains and flame scorching.",
    "specs": {
      "material": "Kiln-dried hardwood or chemically resistant polypropylene",
      "capacity": "6 tube apertures + 6 drying pegs",
      "tolerance": "Fits 16 mm test tubes and 25 mm boiling tubes",
      "handling": "Arrange tubes sequentially from left to right corresponding to bench test steps"
    },
    "quizDistractors": [
      "Tripod Stand",
      "Retort Stand",
      "Crucible Tongs"
    ],
    "useDistractors": [
      "Heats multiple solutions at once",
      "Filters insoluble residues",
      "Crushes coarse crystalline rocks"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- Back drying pins -->\n        <rect x=\"35\" y=\"25\" width=\"4\" height=\"40\" rx=\"1.5\" fill=\"#78350F\"/>\n        <rect x=\"75\" y=\"25\" width=\"4\" height=\"40\" rx=\"1.5\" fill=\"#78350F\"/>\n        <rect x=\"115\" y=\"25\" width=\"4\" height=\"40\" rx=\"1.5\" fill=\"#78350F\"/>\n        <rect x=\"155\" y=\"25\" width=\"4\" height=\"40\" rx=\"1.5\" fill=\"#78350F\"/>\n        <!-- Upper tier shelf -->\n        <polygon points=\"15,65 175,65 170,78 10,78\" fill=\"#B45309\" stroke=\"#78350F\" stroke-width=\"1\"/>\n        <!-- Side pillars -->\n        <rect x=\"10\" y=\"65\" width=\"12\" height=\"55\" rx=\"2\" fill=\"#92400E\" stroke=\"#78350F\" stroke-width=\"1\"/>\n        <rect x=\"168\" y=\"65\" width=\"12\" height=\"55\" rx=\"2\" fill=\"#92400E\" stroke=\"#78350F\" stroke-width=\"1\"/>\n        <!-- Lower base tier -->\n        <polygon points=\"10,120 180,120 175,130 5,130\" fill=\"#B45309\" stroke=\"#78350F\" stroke-width=\"1\"/>\n      </g>\n      <!-- Tube 1 (Blue Cu2+ Solution) -->\n      <g>\n        <rect x=\"40\" y=\"35\" width=\"14\" height=\"75\" rx=\"7\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n        <rect x=\"41\" y=\"60\" width=\"12\" height=\"48\" rx=\"6\" fill=\"url(#agLiquidBlue)\"/>\n        <line x1=\"43\" y1=\"40\" x2=\"43\" y2=\"95\" stroke=\"#FFFFFF\" stroke-width=\"1.2\" opacity=\"0.8\"/>\n      </g>\n      <!-- Tube 2 (Amber Fe3+ Solution) -->\n      <g>\n        <rect x=\"80\" y=\"35\" width=\"14\" height=\"75\" rx=\"7\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n        <rect x=\"81\" y=\"65\" width=\"12\" height=\"43\" rx=\"6\" fill=\"url(#agLiquidAmber)\"/>\n        <line x1=\"83\" y1=\"40\" x2=\"83\" y2=\"95\" stroke=\"#FFFFFF\" stroke-width=\"1.2\" opacity=\"0.8\"/>\n      </g>\n      <!-- Tube 3 (White Precipitate) -->\n      <g>\n        <rect x=\"120\" y=\"35\" width=\"14\" height=\"75\" rx=\"7\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n        <rect x=\"121\" y=\"70\" width=\"12\" height=\"38\" rx=\"6\" fill=\"#F8FAFC\" stroke=\"#CBD5E1\" stroke-width=\"0.5\"/>\n        <ellipse cx=\"127\" cy=\"70\" rx=\"5\" ry=\"1.5\" fill=\"#E2E8F0\"/>\n        <line x1=\"123\" y1=\"40\" x2=\"123\" y2=\"95\" stroke=\"#FFFFFF\" stroke-width=\"1.2\" opacity=\"0.8\"/>\n      </g>\n    "
  },
  {
    "id": "test-tube-holder",
    "name": "Wooden Test Tube Holder",
    "category": "Heating",
    "viewBox": "0 0 170 140",
    "svgPath": "M20 65 L105 65 L135 45 M105 75 L135 95 M105 65 Q115 70 105 75 M60 60 L60 80",
    "primaryUse": "Clamps securely around a test tube or boiling tube to hold it safely over a Bunsen flame",
    "labContext": "Used in qualitative analysis when heating dry solid salts or boiling solutions for gas detection",
    "safetyNote": "Always point the mouth of the heated tube away from yourself and other students to prevent injury from bumping.",
    "funFact": "Wood is selected because it is a poor conductor of heat and won't burn your hand or shatter delicate hot glass.",
    "specs": {
      "material": "Natural birch hardwood with spring steel wire collar",
      "capacity": "Accommodates 12 mm to 25 mm diameter tubes",
      "tolerance": "Clamping pressure calibrated to avoid crushing glass",
      "handling": "Clamp near the upper third of the tube; angle at 45° with continuous gentle flicking"
    },
    "quizDistractors": [
      "Crucible Tongs",
      "Retort Clamp",
      "Deflagrating Spoon"
    ],
    "useDistractors": [
      "Measures liquid temperature",
      "Stirs acid mixtures",
      "Transfers hot liquid droplets"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- Angled test tube in jaws -->\n        <g transform=\"rotate(35 125 65)\">\n          <rect x=\"117\" y=\"10\" width=\"16\" height=\"85\" rx=\"8\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.2\"/>\n          <rect x=\"119\" y=\"50\" width=\"12\" height=\"43\" rx=\"6\" fill=\"url(#agLiquidBlue)\"/>\n          <line x1=\"121\" y1=\"15\" x2=\"121\" y2=\"85\" stroke=\"#FFFFFF\" stroke-width=\"1.5\" opacity=\"0.8\"/>\n        </g>\n        <!-- Wooden handle arms -->\n        <rect x=\"15\" y=\"60\" width=\"95\" height=\"9\" rx=\"2\" fill=\"#D97706\" stroke=\"#B45309\" stroke-width=\"0.8\"/>\n        <rect x=\"15\" y=\"73\" width=\"95\" height=\"9\" rx=\"2\" fill=\"#B45309\" stroke=\"#78350F\" stroke-width=\"0.8\"/>\n        <!-- Clamping jaws -->\n        <path d=\"M105 60 Q122 50 135 40\" stroke=\"#D97706\" stroke-width=\"8\" stroke-linecap=\"round\" fill=\"none\"/>\n        <path d=\"M105 78 Q122 88 135 98\" stroke=\"#B45309\" stroke-width=\"8\" stroke-linecap=\"round\" fill=\"none\"/>\n        <!-- Spring steel slide collar -->\n        <rect x=\"65\" y=\"55\" width=\"12\" height=\"32\" rx=\"3\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"1\"/>\n        <circle cx=\"71\" cy=\"71\" r=\"2.5\" fill=\"#334155\"/>\n      </g>\n    "
  },
  {
    "id": "crucible-lid",
    "name": "Crucible & Lid (with Pipeclay Triangle)",
    "category": "Heating",
    "viewBox": "0 0 160 160",
    "svgPath": "M45 40 L115 40 L105 120 L55 120 Z M38 34 L122 34 L118 42 L42 42 Z M74 24 L86 24 L86 34 L74 34 Z M20 125 L140 125 M80 125 L80 155",
    "primaryUse": "Withstands direct high-temperature heating to red heat when determining water of crystallization or burning metals",
    "labContext": "Used in empirical formula practicals (heating magnesium ribbon in oxygen or decomposing hydrated CuSO₄)",
    "safetyNote": "Never place a glowing hot crucible onto a cold bench (it will crack from thermal shock). Use crucible tongs.",
    "funFact": "Porcelain crucibles can withstand temperatures exceeding 1,150 °C without deformation.",
    "specs": {
      "material": "High-alumina unglazed chemical porcelain (with iron-wire pipeclay triangle)",
      "capacity": "30 cm³",
      "tolerance": "Withstands up to 1,150 °C red-heat",
      "handling": "Leave lid slightly ajar to admit oxygen while preventing loss of oxide smoke particles"
    },
    "quizDistractors": [
      "Evaporating Dish",
      "Watch Glass",
      "Beaker"
    ],
    "useDistractors": [
      "Measures solution volume",
      "Condenses hot distillation vapor",
      "Separates immiscible solvents"
    ],
    "richSVG": "\n      <!-- Pipeclay triangle -->\n      <g filter=\"url(#agShadow)\">\n        <line x1=\"20\" y1=\"130\" x2=\"140\" y2=\"130\" stroke=\"#475569\" stroke-width=\"2.5\"/>\n        <line x1=\"140\" y1=\"130\" x2=\"80\" y2=\"40\" stroke=\"#475569\" stroke-width=\"2.5\"/>\n        <line x1=\"80\" y1=\"40\" x2=\"20\" y2=\"130\" stroke=\"#475569\" stroke-width=\"2.5\"/>\n        <!-- Ceramic pipe sleeves -->\n        <rect x=\"42\" y=\"126\" width=\"76\" height=\"8\" rx=\"2\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"0.8\"/>\n        <rect x=\"36\" y=\"76\" width=\"8\" height=\"60\" rx=\"2\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"0.8\" transform=\"rotate(-30 40 106)\"/>\n        <rect x=\"116\" y=\"76\" width=\"8\" height=\"60\" rx=\"2\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"0.8\" transform=\"rotate(30 120 106)\"/>\n      </g>\n      <!-- Thermal heating glow under crucible -->\n      <ellipse cx=\"80\" cy=\"120\" rx=\"28\" ry=\"8\" fill=\"#F97316\" opacity=\"0.45\" filter=\"url(#agGlow)\"/>\n      <!-- Porcelain Crucible Pot -->\n      <g filter=\"url(#agShadow)\">\n        <path d=\"M48 65 Q45 118 70 126 Q80 128 90 126 Q115 118 112 65 Z\" fill=\"url(#agPorcelain)\" stroke=\"#CBD5E1\" stroke-width=\"1.4\"/>\n      </g>\n      <!-- Fitted Porcelain Lid (Ajar technique) -->\n      <g filter=\"url(#agShadow)\" transform=\"rotate(-12 80 55)\">\n        <polygon points=\"40,56 120,56 116,62 44,62\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"1\"/>\n        <path d=\"M72 44 L88 44 L86 56 L74 56 Z\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"1\"/>\n        <ellipse cx=\"80\" cy=\"44\" rx=\"8\" ry=\"2.5\" fill=\"#E2E8F0\"/>\n      </g>\n      <!-- Specular reflection highlight -->\n      <path d=\"M54 75 Q52 110 72 120\" stroke=\"#FFFFFF\" stroke-width=\"2\" opacity=\"0.85\" fill=\"none\"/>\n    "
  },
  {
    "id": "evaporating-dish",
    "name": "Evaporating Dish (Basin)",
    "category": "Heating",
    "viewBox": "0 0 160 120",
    "svgPath": "M20 40 Q80 110 140 40 Q80 50 20 40 Z M15 38 L25 42 M20 40 Q80 60 140 40",
    "primaryUse": "Evaporates solvent from a solution over a water bath or gentle flame to recover dissolved solute crystals",
    "labContext": "Used in salt preparation experiments to evaporate solutions to the crystallization point",
    "safetyNote": "Do not heat to complete dryness if crystals spit hot liquid. Remove heat once crystals form on a glass rod dip test.",
    "funFact": "The wide, shallow bowl maximizes the liquid surface area, drastically accelerating evaporation.",
    "specs": {
      "material": "Glazed chemical porcelain with pouring lip",
      "capacity": "80 cm³ (75 mm diameter)",
      "tolerance": "Thermal shock resistant up to 1,000 °C",
      "handling": "Heat gently on a wire gauze; stop heating when crystallization skin forms on surface"
    },
    "quizDistractors": [
      "Crucible",
      "Watch Glass",
      "Petri Dish"
    ],
    "useDistractors": [
      "Prepares exact molar standard solutions",
      "Directs gas bubbles into lime water",
      "Weighs micro-gram precipitates"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- Hemispherical porcelain dish body -->\n        <path d=\"M18 45 Q20 102 80 102 Q140 102 142 45 Q80 60 18 45 Z\" fill=\"url(#agPorcelain)\" stroke=\"#CBD5E1\" stroke-width=\"1.4\"/>\n        <!-- Pouring spout profile -->\n        <polygon points=\"18,45 10,42 22,50\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"1\"/>\n      </g>\n      <!-- Blue copper(II) sulfate evaporating liquid solution -->\n      <path d=\"M26 54 Q80 94 134 54 Q80 64 26 54 Z\" fill=\"url(#agLiquidBlue)\"/>\n      <ellipse cx=\"80\" cy=\"54\" rx=\"54\" ry=\"7\" fill=\"#0284C7\" opacity=\"0.6\"/>\n      <!-- Crystallization crust rim -->\n      <path d=\"M30 52 Q80 60 130 52\" stroke=\"#FFFFFF\" stroke-width=\"2.5\" stroke-dasharray=\"2 3\" fill=\"none\"/>\n      <text x=\"56\" y=\"42\" font-size=\"5\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">Crystal Crust</text>\n      <!-- Glaze reflection -->\n      <path d=\"M25 58 Q32 90 65 96\" stroke=\"#FFFFFF\" stroke-width=\"2\" opacity=\"0.8\" fill=\"none\"/>\n    "
  },
  {
    "id": "gas-jar",
    "name": "Gas Jar & Cover Plate",
    "category": "Glassware",
    "viewBox": "0 0 140 210",
    "svgPath": "M35 25 L105 25 L105 185 L120 185 L120 195 L20 195 L20 185 L35 185 Z M25 20 L115 20 L115 26 L25 26 Z",
    "primaryUse": "Collects and holds laboratory gases for combustion, bleaching, solubility, and chemical identification tests",
    "labContext": "Used in Form 2 gas preparations (O₂, H₂, Cl₂, CO₂, SO₂) collected over water or by downward/upward delivery",
    "safetyNote": "Slide greased ground-glass cover plate tightly onto the mouth to trap toxic or irritating gases like chlorine.",
    "funFact": "The thick, heavy glass base prevents the jar from tipping over when combustion spoons are lowered inside.",
    "specs": {
      "material": "Heavy-gauge pressed borosilicate glass with ground flat rim",
      "capacity": "250 cm³",
      "tolerance": "Withstands internal combustion heat and mild pressures",
      "handling": "Grease rim with petroleum jelly; slide cover plate horizontally across to seal"
    },
    "quizDistractors": [
      "Measuring Cylinder",
      "Boiling Tube",
      "Conical Flask"
    ],
    "useDistractors": [
      "Measures solution volume to 0.05 ml",
      "Separates oil from water layers",
      "Crushes coarse rock minerals"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- Heavy glass foot base -->\n        <rect x=\"20\" y=\"180\" width=\"100\" height=\"14\" rx=\"2\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n        <line x1=\"22\" y1=\"184\" x2=\"118\" y2=\"184\" stroke=\"#FFFFFF\" stroke-width=\"1.8\" opacity=\"0.8\"/>\n        <!-- Cylindrical glass body -->\n        <rect x=\"35\" y=\"30\" width=\"70\" height=\"150\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.4\"/>\n      </g>\n      <!-- Pale greenish-yellow gas haze (Chlorine simulation) -->\n      <rect x=\"37\" y=\"32\" width=\"66\" height=\"146\" fill=\"rgba(163,230,53,0.22)\"/>\n      <circle cx=\"55\" cy=\"80\" r=\"2\" fill=\"#84CC16\" opacity=\"0.6\"/>\n      <circle cx=\"85\" cy=\"110\" r=\"2.5\" fill=\"#84CC16\" opacity=\"0.5\"/>\n      <circle cx=\"65\" cy=\"140\" r=\"1.8\" fill=\"#84CC16\" opacity=\"0.7\"/>\n      <!-- Glass reflection highlights -->\n      <line x1=\"40\" y1=\"35\" x2=\"40\" y2=\"175\" stroke=\"#FFFFFF\" stroke-width=\"2.5\" opacity=\"0.85\"/>\n      <line x1=\"45\" y1=\"35\" x2=\"45\" y2=\"175\" stroke=\"#FFFFFF\" stroke-width=\"1\" opacity=\"0.5\"/>\n      <!-- Ground glass rim -->\n      <rect x=\"30\" y=\"24\" width=\"80\" height=\"6\" fill=\"#E2E8F0\" stroke=\"#94A3B8\" stroke-width=\"1\"/>\n      <!-- Ground glass cover plate slid on top -->\n      <g filter=\"url(#agShadow)\">\n        <polygon points=\"22,18 118,18 112,24 16,24\" fill=\"url(#agGlass)\" stroke=\"#0284C7\" stroke-width=\"1.2\"/>\n        <line x1=\"24\" y1=\"20\" x2=\"114\" y2=\"20\" stroke=\"#FFFFFF\" stroke-width=\"1.5\" opacity=\"0.85\"/>\n      </g>\n    "
  },
  {
    "id": "mortar-pestle",
    "name": "Mortar & Pestle",
    "category": "Transfer",
    "viewBox": "0 0 170 140",
    "svgPath": "M25 45 Q85 130 145 45 Q85 55 25 45 Z M100 20 L125 70 Q130 85 115 88 Q100 85 105 70 L80 20 Z",
    "primaryUse": "Grinds, pulverizes, and crushes coarse solid crystals, rock minerals, or plant matter into fine powders",
    "labContext": "Used to pulverize solid lumps before dissolution or rate testing to increase surface area",
    "safetyNote": "Grind using a firm circular twisting motion — never strike the pestle like a hammer against the bottom.",
    "funFact": "The unglazed coarse interior creates friction essential to grind crystalline lattices down to micron sizes.",
    "specs": {
      "material": "Dense chemical-grade unglazed porcelain",
      "capacity": "80 mm diameter bowl with heavy contoured pestle",
      "tolerance": "Resistant to mechanical wear, acids, and alkalis",
      "handling": "Hold mortar firmly with one hand; apply circular downward pressure with pestle head"
    },
    "quizDistractors": [
      "Crucible",
      "Evaporating Dish",
      "Spatula"
    ],
    "useDistractors": [
      "Measures gas volumes under water",
      "Holds burette during titration",
      "Burns sulfur inside gas jar"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- Heavy thick mortar bowl -->\n        <path d=\"M25 50 Q28 115 85 115 Q142 115 145 50 Q85 64 25 50 Z\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"1.5\"/>\n        <polygon points=\"25,50 16,46 28,56\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"1\"/>\n        <ellipse cx=\"85\" cy=\"50\" rx=\"60\" ry=\"14\" fill=\"#F1F5F9\" stroke=\"#CBD5E1\" stroke-width=\"1.2\"/>\n        <ellipse cx=\"85\" cy=\"50\" rx=\"48\" ry=\"10\" fill=\"#E2E8F0\"/>\n      </g>\n      <!-- Crushed orange chemical powder inside -->\n      <ellipse cx=\"85\" cy=\"85\" rx=\"28\" ry=\"12\" fill=\"#EA580C\" opacity=\"0.85\"/>\n      <circle cx=\"80\" cy=\"83\" r=\"1.5\" fill=\"#FDBA74\"/>\n      <circle cx=\"92\" cy=\"87\" r=\"2\" fill=\"#FDBA74\"/>\n      <!-- Contoured porcelain pestle tilted in bowl -->\n      <g filter=\"url(#agShadow)\" transform=\"rotate(24 95 65)\">\n        <path d=\"M90 12 L106 12 L102 75 Q104 88 98 90 Q92 88 94 75 Z\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"1.2\"/>\n        <ellipse cx=\"98\" cy=\"12\" rx=\"8\" ry=\"3\" fill=\"#E2E8F0\"/>\n        <line x1=\"93\" y1=\"18\" x2=\"95\" y2=\"72\" stroke=\"#FFFFFF\" stroke-width=\"1.5\" opacity=\"0.8\"/>\n      </g>\n    "
  },
  {
    "id": "separating-funnel",
    "name": "Separating Funnel (100 cm³)",
    "category": "Glassware",
    "viewBox": "0 0 130 230",
    "svgPath": "M55 10 L75 10 L75 40 Q105 80 100 130 Q90 170 68 175 L68 195 L62 195 L62 175 Q40 170 30 130 Q25 80 55 40 Z M60 195 L70 195 L67 225 L63 225 Z",
    "primaryUse": "Separates two immiscible liquids of differing densities (e.g. kerosene/oil and water or organic solvent extraction)",
    "labContext": "Used in Form 1 separation of mixtures and organic chemistry extraction practicals",
    "safetyNote": "Invert and open the stopcock periodically during shaking to release built-up vapor pressure.",
    "funFact": "The pear shape ensures a narrow cross-section at the bottom, creating a razor-sharp boundary interface for clean cuts.",
    "specs": {
      "material": "Borosilicate 3.3 Glass with PTFE stopcock plug",
      "capacity": "100 cm³",
      "tolerance": "Leak-proof ground glass joint and PTFE key",
      "handling": "Run out the lower denser layer via stopcock; pour the upper lighter layer out through the top neck"
    },
    "quizDistractors": [
      "Filter Funnel",
      "Thistle Funnel",
      "Burette"
    ],
    "useDistractors": [
      "Prepares standard molar solutions",
      "Supports crucible over flame",
      "Measures boiling points of liquids"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- Ground stopper -->\n        <polygon points=\"56,6 74,6 72,18 58,18\" fill=\"#0284C7\" stroke=\"#0369A1\" stroke-width=\"1\"/>\n        <rect x=\"60\" y=\"18\" width=\"10\" height=\"18\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n        <!-- Pear-shaped glass body -->\n        <path d=\"M60 36 Q106 75 100 130 Q94 165 68 174 L68 192 L62 192 L62 174 Q36 165 30 130 Q24 75 70 36 Z\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1.3\"/>\n      </g>\n      <!-- Top immiscible layer (Organic/Amber oil) -->\n      <path d=\"M42 90 Q28 120 38 135 L92 135 Q102 120 88 90 Z\" fill=\"url(#agLiquidAmber)\"/>\n      <!-- Lower immiscible layer (Aqueous blue solution) -->\n      <path d=\"M38 135 Q30 160 62 172 L62 192 L68 192 L68 172 Q100 160 92 135 Z\" fill=\"url(#agLiquidBlue)\"/>\n      <!-- Meniscus interface boundary line -->\n      <line x1=\"38\" y1=\"135\" x2=\"92\" y2=\"135\" stroke=\"#0284C7\" stroke-width=\"2\"/>\n      <text x=\"96\" y=\"137\" font-size=\"5\" font-weight=\"bold\" fill=\"#0284C7\" font-family=\"'JetBrains Mono', monospace\">Interface</text>\n      <!-- PTFE Stopcock valve -->\n      <rect x=\"52\" y=\"190\" width=\"26\" height=\"8\" rx=\"2\" fill=\"#E2E8F0\" stroke=\"#64748B\" stroke-width=\"1\"/>\n      <rect x=\"44\" y=\"192\" width=\"42\" height=\"4\" rx=\"2\" fill=\"url(#agTeflonRed)\" stroke=\"#991B1B\" stroke-width=\"0.8\"/>\n      <!-- Delivery stem jet -->\n      <polygon points=\"63,198 67,198 66,224 64,224\" fill=\"url(#agGlass)\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n      <!-- Specular reflection -->\n      <path d=\"M38 95 Q34 130 50 160\" stroke=\"#FFFFFF\" stroke-width=\"2\" opacity=\"0.85\" fill=\"none\"/>\n    "
  },
  {
    "id": "deflagrating-spoon",
    "name": "Deflagrating Spoon (Combustion Spoon)",
    "category": "Heating",
    "viewBox": "0 0 130 200",
    "svgPath": "M65 10 L65 155 L95 155 Q100 160 95 165 L65 165 Z M35 70 L95 70 L95 75 L35 75 Z",
    "primaryUse": "Holds burning chemical samples (e.g. sulfur, sodium, phosphorus) and lowers them safely into gas jars",
    "labContext": "Form 2 non-metals and oxygen practicals — observing bright combustion flames inside gas jars",
    "safetyNote": "Always lower inside a fume cupboard or well-ventilated lab; avoid breathing sulfur dioxide or chlorine gas fumes.",
    "funFact": "The circular metal disc shield serves two purposes: seals the gas jar mouth and deflects rising toxic fumes away from the hand.",
    "specs": {
      "material": "Stainless steel shaft with brass/steel combustion cup and deflector disc",
      "capacity": "15 mm cup diameter (holds 0.5–2 g solids)",
      "tolerance": "Withstands continuous direct burner flames above 800 °C",
      "handling": "Heat solid until combustion starts, then immediately lower into gas jar until disc rests on rim"
    },
    "quizDistractors": [
      "Spatula",
      "Crucible Tongs",
      "Test Tube Holder"
    ],
    "useDistractors": [
      "Draws precise 25 cm³ aliquots",
      "Crushes crystalline salts",
      "Tests pH of aqueous solutions"
    ],
    "richSVG": "\n      <!-- Top finger holding loop -->\n      <circle cx=\"65\" cy=\"16\" r=\"8\" fill=\"none\" stroke=\"url(#agMetalChrome)\" stroke-width=\"2.5\"/>\n      <!-- Vertical stainless steel shaft -->\n      <line x1=\"65\" y1=\"24\" x2=\"65\" y2=\"160\" stroke=\"url(#agMetalChrome)\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n      <line x1=\"64\" y1=\"24\" x2=\"64\" y2=\"160\" stroke=\"#FFFFFF\" stroke-width=\"1\" opacity=\"0.8\"/>\n      <!-- Circular vapor baffle disc -->\n      <g filter=\"url(#agShadow)\">\n        <ellipse cx=\"65\" cy=\"75\" rx=\"32\" ry=\"7\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"1.2\"/>\n        <ellipse cx=\"65\" cy=\"75\" rx=\"26\" ry=\"4.5\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"1\" opacity=\"0.8\"/>\n      </g>\n      <!-- Bottom right angle bend & brass combustion cup -->\n      <path d=\"M65 160 L65 170 L95 170\" stroke=\"url(#agMetalChrome)\" stroke-width=\"2.5\" fill=\"none\"/>\n      <g filter=\"url(#agShadow)\">\n        <path d=\"M85 170 Q85 182 95 182 Q105 182 105 170 Z\" fill=\"url(#agBrass)\" stroke=\"#78350F\" stroke-width=\"1\"/>\n      </g>\n      <!-- Burning sulfur with brilliant violet-blue combustion flame -->\n      <ellipse cx=\"95\" cy=\"170\" rx=\"8\" ry=\"3\" fill=\"#EAB308\"/>\n      <path d=\"M88 170 Q95 140 102 170 Z\" fill=\"url(#agFlameOuter)\" opacity=\"0.9\" filter=\"url(#agGlow)\"/>\n      <path d=\"M91 170 Q95 148 99 170 Z\" fill=\"url(#agFlameInner)\"/>\n    "
  },
  {
    "id": "lab-coat",
    "name": "Protective Lab Coat",
    "category": "Safety",
    "viewBox": "0 0 160 180",
    "svgPath": "M55 20 L40 45 L15 110 L30 115 L45 75 L45 160 L115 160 L115 75 L130 115 L145 110 L120 45 L105 20 Z M55 20 L80 60 L105 20",
    "primaryUse": "Protects skin and clothing against corrosive chemical splashes, acid droplets, toxic stains, and burner sparks",
    "labContext": "Mandatory personal protective equipment (PPE) worn fully buttoned in all secondary school chemistry laboratories",
    "safetyNote": "Always fasten all front buttons and keep sleeves rolled down. Remove immediately if saturated with concentrated acid.",
    "funFact": "100% heavy cotton resists charring without melting, whereas polyester melts and adheres directly to burned skin.",
    "specs": {
      "material": "100% heavy drill cotton (245 g/m²)",
      "capacity": "Full torso and thigh coverage with reinforced pockets",
      "tolerance": "Flame-retardant and acid-splash resistant",
      "handling": "Fasten all press studs; wear knee-length with sleeves covering wrists"
    },
    "quizDistractors": [
      "Safety Goggles",
      "Rubber Apron",
      "Insulated Gloves"
    ],
    "useDistractors": [
      "Collects gaseous products",
      "Measures temperature rise in calorimetry",
      "Separates insoluble precipitates"
    ],
    "richSVG": "\n      <g filter=\"url(#agShadow)\">\n        <!-- Lab coat body -->\n        <path d=\"M52 24 L38 48 L14 110 L30 116 L44 80 L44 165 L116 165 L116 80 L130 116 L146 110 L122 48 L108 24 Z\" fill=\"url(#agPorcelain)\" stroke=\"#94A3B8\" stroke-width=\"1.4\"/>\n      </g>\n      <!-- Center button placket & lapels -->\n      <polygon points=\"52,24 80,68 108,24 80,48\" fill=\"#F1F5F9\" stroke=\"#CBD5E1\" stroke-width=\"1\"/>\n      <line x1=\"80\" y1=\"68\" x2=\"80\" y2=\"165\" stroke=\"#94A3B8\" stroke-width=\"1.2\"/>\n      <!-- Stainless steel snap buttons -->\n      <circle cx=\"80\" cy=\"85\" r=\"2.5\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"0.6\"/>\n      <circle cx=\"80\" cy=\"110\" r=\"2.5\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"0.6\"/>\n      <circle cx=\"80\" cy=\"135\" r=\"2.5\" fill=\"url(#agMetalChrome)\" stroke=\"#475569\" stroke-width=\"0.6\"/>\n      <!-- Breast pocket with VirtuLab shield badge -->\n      <rect x=\"52\" y=\"70\" width=\"18\" height=\"20\" rx=\"1.5\" fill=\"#F8FAFC\" stroke=\"#CBD5E1\" stroke-width=\"0.8\"/>\n      <path d=\"M57 78 L65 74 L65 85 L57 82 Z\" fill=\"#059669\"/>\n      <!-- Hip patch pockets -->\n      <rect x=\"48\" y=\"115\" width=\"22\" height=\"26\" rx=\"2\" fill=\"#F8FAFC\" stroke=\"#CBD5E1\" stroke-width=\"0.8\"/>\n      <rect x=\"90\" y=\"115\" width=\"22\" height=\"26\" rx=\"2\" fill=\"#F8FAFC\" stroke=\"#CBD5E1\" stroke-width=\"0.8\"/>\n      <!-- Shadow drape lines -->\n      <line x1=\"60\" y1=\"48\" x2=\"52\" y2=\"140\" stroke=\"#CBD5E1\" stroke-width=\"1\" stroke-dasharray=\"8 6\"/>\n      <line x1=\"100\" y1=\"48\" x2=\"108\" y2=\"140\" stroke=\"#CBD5E1\" stroke-width=\"1\" stroke-dasharray=\"8 6\"/>\n    "
  },
  {
    "id": "test-tube-brush",
    "name": "Test Tube Brush",
    "category": "Safety",
    "viewBox": "0 0 170 120",
    "svgPath": "M15 60 L140 60 M140 60 C155 50 155 70 140 60 M60 35 L60 85 M80 35 L80 85 M100 35 L100 85 M120 35 L120 85",
    "primaryUse": "Cleans test tubes, boiling tubes, and glassware without scratching glass or breaking delicate rounded bottoms",
    "labContext": "Used after qualitative tests to scrub away stubborn precipitates (Fe(OH)₃, BaSO₄) before final distilled water rinses",
    "safetyNote": "Check that the tip has a soft radial fan or cotton cushion so the wire core does not punch through the glass bottom.",
    "funFact": "Twisted double-galvanized wire gives the shaft flexibility to scrub curved internal surfaces without permanent bending.",
    "specs": {
      "material": "High-density nylon bristles on twisted galvanized steel wire",
      "capacity": "Cleans tubes from 10 mm to 30 mm diameter",
      "tolerance": "Resistant to laboratory detergents, dilute acids, and hot water",
      "handling": "Insert with twisting motion using soapy water; do not force against tube bottom"
    },
    "quizDistractors": [
      "Glass Stirring Rod",
      "Spatula",
      "Dropping Pipette"
    ],
    "useDistractors": [
      "Transfers solid powder aliquots",
      "Measures 25 ml volumes accurately",
      "Heats hydrated salts over flame"
    ],
    "richSVG": "\n      <!-- Finger loop at handle end -->\n      <ellipse cx=\"22\" cy=\"60\" rx=\"9\" ry=\"7\" fill=\"none\" stroke=\"url(#agMetalChrome)\" stroke-width=\"2\"/>\n      <!-- Twisted galvanized wire shaft -->\n      <line x1=\"31\" y1=\"60\" x2=\"140\" y2=\"60\" stroke=\"url(#agMetalChrome)\" stroke-width=\"2.5\"/>\n      <line x1=\"31\" y1=\"59\" x2=\"140\" y2=\"59\" stroke=\"#FFFFFF\" stroke-width=\"0.8\" opacity=\"0.85\"/>\n      <!-- Dense cylindrical nylon bristle head -->\n      <g stroke=\"#38BDF8\" stroke-width=\"1.2\" opacity=\"0.9\">\n        <line x1=\"70\" y1=\"38\" x2=\"70\" y2=\"82\"/>\n        <line x1=\"77\" y1=\"36\" x2=\"77\" y2=\"84\"/>\n        <line x1=\"84\" y1=\"35\" x2=\"84\" y2=\"85\"/>\n        <line x1=\"91\" y1=\"35\" x2=\"91\" y2=\"85\"/>\n        <line x1=\"98\" y1=\"35\" x2=\"98\" y2=\"85\"/>\n        <line x1=\"105\" y1=\"35\" x2=\"105\" y2=\"85\"/>\n        <line x1=\"112\" y1=\"35\" x2=\"112\" y2=\"85\"/>\n        <line x1=\"119\" y1=\"36\" x2=\"119\" y2=\"84\"/>\n        <line x1=\"126\" y1=\"38\" x2=\"126\" y2=\"82\"/>\n      </g>\n      <g stroke=\"#0284C7\" stroke-width=\"1.2\" opacity=\"0.75\">\n        <line x1=\"73\" y1=\"42\" x2=\"73\" y2=\"78\"/>\n        <line x1=\"80\" y1=\"40\" x2=\"80\" y2=\"80\"/>\n        <line x1=\"87\" y1=\"38\" x2=\"87\" y2=\"82\"/>\n        <line x1=\"94\" y1=\"38\" x2=\"94\" y2=\"82\"/>\n        <line x1=\"101\" y1=\"38\" x2=\"101\" y2=\"82\"/>\n        <line x1=\"108\" y1=\"38\" x2=\"108\" y2=\"82\"/>\n        <line x1=\"115\" y1=\"40\" x2=\"115\" y2=\"80\"/>\n        <line x1=\"122\" y1=\"42\" x2=\"122\" y2=\"78\"/>\n      </g>\n      <!-- Protective radial fan tuft at tip -->\n      <path d=\"M130 50 Q145 60 130 70\" stroke=\"#38BDF8\" stroke-width=\"2.5\" fill=\"none\"/>\n      <circle cx=\"140\" cy=\"60\" r=\"4.5\" fill=\"#E0F2FE\" stroke=\"#38BDF8\" stroke-width=\"1\"/>\n    "
  }
];

  var SHARED_DEFS = "\n<defs>\n  <linearGradient id=\"agGlass\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#FFFFFF\" stop-opacity=\"0.85\"/>\n    <stop offset=\"15%\" stop-color=\"#BAE6FD\" stop-opacity=\"0.35\"/>\n    <stop offset=\"50%\" stop-color=\"#E0F2FE\" stop-opacity=\"0.12\"/>\n    <stop offset=\"85%\" stop-color=\"#38BDF8\" stop-opacity=\"0.32\"/>\n    <stop offset=\"100%\" stop-color=\"#FFFFFF\" stop-opacity=\"0.8\"/>\n  </linearGradient>\n  <linearGradient id=\"agLiquidBlue\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#38BDF8\" stop-opacity=\"0.92\"/>\n    <stop offset=\"35%\" stop-color=\"#7DD3FC\" stop-opacity=\"0.75\"/>\n    <stop offset=\"70%\" stop-color=\"#0284C7\" stop-opacity=\"0.88\"/>\n    <stop offset=\"100%\" stop-color=\"#0369A1\" stop-opacity=\"0.95\"/>\n  </linearGradient>\n  <linearGradient id=\"agLiquidCyan\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#22D3EE\" stop-opacity=\"0.9\"/>\n    <stop offset=\"50%\" stop-color=\"#A5F3FC\" stop-opacity=\"0.7\"/>\n    <stop offset=\"100%\" stop-color=\"#0891B2\" stop-opacity=\"0.92\"/>\n  </linearGradient>\n  <linearGradient id=\"agLiquidPink\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#F472B6\" stop-opacity=\"0.92\"/>\n    <stop offset=\"35%\" stop-color=\"#FBCFE8\" stop-opacity=\"0.75\"/>\n    <stop offset=\"70%\" stop-color=\"#DB2777\" stop-opacity=\"0.88\"/>\n    <stop offset=\"100%\" stop-color=\"#9D174D\" stop-opacity=\"0.95\"/>\n  </linearGradient>\n  <linearGradient id=\"agLiquidAmber\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#FBBF24\" stop-opacity=\"0.92\"/>\n    <stop offset=\"50%\" stop-color=\"#FDE68A\" stop-opacity=\"0.75\"/>\n    <stop offset=\"100%\" stop-color=\"#D97706\" stop-opacity=\"0.95\"/>\n  </linearGradient>\n  <linearGradient id=\"agLiquidRed\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#EF4444\"/>\n    <stop offset=\"45%\" stop-color=\"#FCA5A5\"/>\n    <stop offset=\"100%\" stop-color=\"#B91C1C\"/>\n  </linearGradient>\n  <linearGradient id=\"agMetalChrome\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#334155\"/>\n    <stop offset=\"20%\" stop-color=\"#94A3B8\"/>\n    <stop offset=\"45%\" stop-color=\"#F8FAFC\"/>\n    <stop offset=\"75%\" stop-color=\"#64748B\"/>\n    <stop offset=\"100%\" stop-color=\"#1E293B\"/>\n  </linearGradient>\n  <linearGradient id=\"agCastIron\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n    <stop offset=\"0%\" stop-color=\"#475569\"/>\n    <stop offset=\"25%\" stop-color=\"#334155\"/>\n    <stop offset=\"80%\" stop-color=\"#1E293B\"/>\n    <stop offset=\"100%\" stop-color=\"#0F172A\"/>\n  </linearGradient>\n  <linearGradient id=\"agBrass\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#B45309\"/>\n    <stop offset=\"50%\" stop-color=\"#FDE047\"/>\n    <stop offset=\"100%\" stop-color=\"#78350F\"/>\n  </linearGradient>\n  <linearGradient id=\"agRubberRed\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#991B1B\"/>\n    <stop offset=\"30%\" stop-color=\"#DC2626\"/>\n    <stop offset=\"65%\" stop-color=\"#EF4444\"/>\n    <stop offset=\"100%\" stop-color=\"#7F1D1D\"/>\n  </linearGradient>\n  <linearGradient id=\"agTeflonRed\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#991B1B\"/>\n    <stop offset=\"50%\" stop-color=\"#EF4444\"/>\n    <stop offset=\"100%\" stop-color=\"#7F1D1D\"/>\n  </linearGradient>\n  <linearGradient id=\"agFlameOuter\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#2563EB\" stop-opacity=\"0.85\"/>\n    <stop offset=\"60%\" stop-color=\"#38BDF8\" stop-opacity=\"0.6\"/>\n    <stop offset=\"100%\" stop-color=\"#60A5FA\" stop-opacity=\"0.15\"/>\n  </linearGradient>\n  <linearGradient id=\"agFlameInner\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\">\n    <stop offset=\"0%\" stop-color=\"#06B6D4\" stop-opacity=\"0.95\"/>\n    <stop offset=\"65%\" stop-color=\"#67E8F9\" stop-opacity=\"0.9\"/>\n    <stop offset=\"100%\" stop-color=\"#E0F2FE\" stop-opacity=\"0.8\"/>\n  </linearGradient>\n  <linearGradient id=\"agPorcelain\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n    <stop offset=\"0%\" stop-color=\"#FFFFFF\"/>\n    <stop offset=\"70%\" stop-color=\"#F8FAFC\"/>\n    <stop offset=\"100%\" stop-color=\"#E2E8F0\"/>\n  </linearGradient>\n  <filter id=\"agShadow\" x=\"-15%\" y=\"-15%\" width=\"130%\" height=\"130%\">\n    <feDropShadow dx=\"0\" dy=\"3\" stdDeviation=\"3\" flood-color=\"rgba(15,23,42,0.3)\"/>\n  </filter>\n  <filter id=\"agGlow\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\">\n    <feGaussianBlur stdDeviation=\"3\" result=\"blur\"/>\n    <feComposite in=\"SourceGraphic\" in2=\"blur\" operator=\"over\"/>\n  </filter>\n</defs>\n";

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

  function makeSVG(ap, w, h, isDetail) {
    var vb = ap.viewBox || '0 0 100 200';
    var sw = w ? 'width="' + w + '" ' : '';
    var sh = h ? 'height="' + h + '" ' : '';
    var content = ap.richSVG || ('<path d="' + esc(ap.svgPath) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>');
    return '<svg ' + sw + sh + 'viewBox="' + esc(vb) + '" class="vlk-ag-render-svg" aria-label="' + esc(ap.name) + '" role="img">' +
      SHARED_DEFS +
      content +
      '</svg>';
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
        '<div class="vlk-ag-detail-diagram">' +
          '<div class="vlk-ag-detail-stage">' + makeSVG(ap, null, 210, true) + '</div>' +
        '</div>' +
        '<div class="vlk-ag-detail-heading-row">' +
          '<h2 class="vlk-ag-detail-name">' + esc(ap.name) + '</h2>' +
          '<span class="' + badgeClass(ap.category) + '" style="font-size:0.72rem;padding:5px 12px;">' + esc(ap.category) + '</span>' +
        '</div>' +
        (ap.specs ? (
          '<div class="vlk-ag-specs-card">' +
            '<div class="vlk-ag-specs-header">' +
              '<span class="vlk-ag-specs-title">🔬 Authentic Laboratory Specifications</span>' +
              '<span class="vlk-ag-specs-badge">KNEC Paper 3 Standard</span>' +
            '</div>' +
            '<div class="vlk-ag-specs-grid">' +
              '<div class="vlk-ag-spec-item"><span class="vlk-ag-spec-k">Material:</span><span class="vlk-ag-spec-v">' + esc(ap.specs.material || 'Standard Lab Grade') + '</span></div>' +
              '<div class="vlk-ag-spec-item"><span class="vlk-ag-spec-k">Nominal Capacity:</span><span class="vlk-ag-spec-v">' + esc(ap.specs.capacity || 'Standard') + '</span></div>' +
              '<div class="vlk-ag-spec-item"><span class="vlk-ag-spec-k">Analytical Precision:</span><span class="vlk-ag-spec-v">' + esc(ap.specs.tolerance || 'Class A / ISO') + '</span></div>' +
              '<div class="vlk-ag-spec-item vlk-ag-spec-full"><span class="vlk-ag-spec-k">KNEC Handling Technique:</span><span class="vlk-ag-spec-v">' + esc(ap.specs.handling || '') + '</span></div>' +
            '</div>' +
          '</div>'
        ) : '') +
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

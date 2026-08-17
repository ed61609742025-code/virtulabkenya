// ============================================================
//  VirtuLab Kenya — Chemical Speed Battle Quiz Engine
// ============================================================

(function() {
  const QUESTIONS_POOL = [
    {
      q: "Which reagent gives a DEEP BLUE solution with Cu²⁺ ions in excess?",
      options: ["Sodium Hydroxide (NaOH)", "Aqueous Ammonia (NH₃)", "Barium Nitrate (Ba(NO₃)₂)", "Dilute Nitric Acid"],
      ans: 1,
      exp: "Cu²⁺ ions react with excess NH₃(aq) to form the deep blue tetraamminecopper(II) complex [Cu(NH₃)₄]²⁺."
    },
    {
      q: "A white precipitate insoluble in dilute HNO₃ after adding Ba(NO₃)₂ confirms which anion?",
      options: ["Carbonate (CO₃²⁻)", "Sulfate (SO₄²⁻)", "Chloride (Cl⁻)", "Nitrate (NO₃⁻)"],
      ans: 1,
      exp: "Ba²⁺ + SO₄²⁻ → BaSO₄(s) white precipitate which is insoluble in dilute HNO₃."
    },
    {
      q: "Which indicator turns PINK/MAGENTA in basic solution (pH > 8.3)?",
      options: ["Methyl Orange", "Phenolphthalein", "Litmus Paper", "Universal Indicator"],
      ans: 1,
      exp: "Phenolphthalein is colorless in acidic solution and intense pink/magenta in alkaline solution."
    },
    {
      q: "Which reagent decolorizes RAPIDLY from reddish-brown to colorless with Alkenes without heating?",
      options: ["Bromine Water (Br₂(aq))", "Sodium Carbonate", "Barium Chloride", "Silver Nitrate"],
      ans: 0,
      exp: "Bromine water undergoes an addition reaction across the double bond (>C=C<) of alkenes."
    },
    {
      q: "Adding Sodium Carbonate (Na₂CO₃) to an organic liquid produces effervescence. What functional group is present?",
      options: ["Alcohol (-OH)", "Carboxylic Acid (-COOH)", "Alkene (>C=C<)", "Ester (-COOR)"],
      ans: 1,
      exp: "Carboxylic acids (-COOH) react with carbonates to liberate Carbon Dioxide gas (CO₂)."
    },
    {
      q: "Al³⁺ and Pb²⁺ both form white precipitates in NaOH soluble in excess. Which reagent distinguishes Pb²⁺ by forming a YELLOW precipitate?",
      options: ["Potassium Iodide (KI)", "Dilute HCl", "Ammonia", "Sodium Sulfate"],
      ans: 0,
      exp: "Pb²⁺ + 2I⁻ → PbI₂ (golden yellow precipitate), whereas Al³⁺ does not form a yellow precipitate with KI."
    },
    {
      q: "What color shift occurs when Acidified Potassium Dichromate(VI) oxidizes a Primary Alcohol?",
      options: ["Purple to Colorless", "Orange to Green", "Blue to Pink", "Yellow to Brown"],
      ans: 1,
      exp: "K₂Cr₂O₇/H⁺ shifts from orange (Cr₂O₇²⁻) to green (Cr³⁺) upon oxidizing 1° or 2° alcohols."
    },
    {
      q: "Which gas turns moist RED litmus paper BLUE?",
      options: ["Carbon Dioxide (CO₂)", "Sulfur Dioxide (SO₂)", "Ammonia Gas (NH₃)", "Chlorine (Cl₂)"],
      ans: 2,
      exp: "Ammonia (NH₃) is the only common alkaline gas tested in KCSE chemistry; it turns red litmus blue."
    },
    {
      q: "What observation indicates concordant titres in KCSE Volumetric Analysis?",
      options: ["Readings within ±0.20 cm³ of each other", "Readings with exact same indicator color", "Readings taking 5 minutes each", "Readings with 50 cm³ total volume"],
      ans: 0,
      exp: "KNEC rules require concordant titre values to be within ±0.20 cm³ for accurate averaging."
    },
    {
      q: "Adding AgNO₃ followed by dilute HNO₃ gives a white precipitate. Which ion is confirmed?",
      options: ["Sulfate (SO₄²⁻)", "Chloride (Cl⁻)", "Sulfite (SO₃²⁻)", "Carbonate (CO₃²⁻)"],
      ans: 1,
      exp: "Ag⁺ + Cl⁻ → AgCl(s) white precipitate which is insoluble in dilute HNO₃."
    }
  ];

  let currentScore = 0;
  let currentStreak = 0;
  let timeLeft = 60;
  let timerInterval = null;
  let currentQIndex = 0;
  let shuffledQuestions = [];

  window.startChemicalSpeedBattle = function() {
    currentScore = 0;
    currentStreak = 0;
    timeLeft = 60;
    shuffledQuestions = [...QUESTIONS_POOL].sort(() => Math.random() - 0.5);
    currentQIndex = 0;

    document.getElementById('battleStartCard').style.display = 'none';
    document.getElementById('battleGameOverCard').style.display = 'none';
    document.getElementById('battleArenaCard').style.display = 'block';

    updateBattleHUD();
    renderQuestion();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('battleTimeDisplay').textContent = timeLeft + 's';
      if (timeLeft <= 10) {
        document.getElementById('battleTimeDisplay').style.color = '#EF4444';
      }
      if (timeLeft <= 0) {
        endChemicalSpeedBattle();
      }
    }, 1000);
  };

  function updateBattleHUD() {
    document.getElementById('battleScoreDisplay').textContent = currentScore;
    document.getElementById('battleStreakDisplay').textContent = `${currentStreak}x Combo 🔥`;
    document.getElementById('battleTimeDisplay').textContent = timeLeft + 's';
  }

  function renderQuestion() {
    if (currentQIndex >= shuffledQuestions.length) {
      shuffledQuestions = [...QUESTIONS_POOL].sort(() => Math.random() - 0.5);
      currentQIndex = 0;
    }

    const qData = shuffledQuestions[currentQIndex];
    document.getElementById('battleQuestionText').textContent = qData.q;
    const optionsBox = document.getElementById('battleOptionsBox');
    optionsBox.innerHTML = '';

    qData.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn battle-option-btn';
      btn.style.cssText = 'width:100%; padding:14px 18px; margin-bottom:10px; font-weight:800; font-size:0.9rem; text-align:left; border-radius:14px; background:var(--card-bg-hover); border:1.5px solid var(--card-border); color:var(--text-main); cursor:pointer; transition:all 0.15s ease;';
      btn.innerHTML = `<span style="opacity:0.6; margin-right:10px;">${String.fromCharCode(65 + idx)}.</span> ${optText}`;
      btn.onclick = () => handleAnswerClick(idx, qData, btn);
      optionsBox.appendChild(btn);
    });
  }

  function handleAnswerClick(selectedIdx, qData, clickedBtn) {
    const isCorrect = selectedIdx === qData.ans;

    if (isCorrect) {
      currentStreak++;
      const multiplier = Math.min(currentStreak, 5);
      const points = 100 * multiplier;
      currentScore += points;
      clickedBtn.style.background = 'rgba(16, 185, 129, 0.2)';
      clickedBtn.style.borderColor = 'var(--green-accent)';
      
      // Play audio feedback
      playTone(587, 0.15); // High D note for correct answer
    } else {
      currentStreak = 0;
      clickedBtn.style.background = 'rgba(239, 68, 68, 0.2)';
      clickedBtn.style.borderColor = '#EF4444';
      
      // Play low error tone
      playTone(220, 0.25);
    }

    updateBattleHUD();
    currentQIndex++;
    setTimeout(() => renderQuestion(), 300);
  }

  function playTone(freq, duration) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  function endChemicalSpeedBattle() {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('battleArenaCard').style.display = 'none';
    document.getElementById('battleGameOverCard').style.display = 'block';

    document.getElementById('finalScoreDisplay').textContent = currentScore;
    let rank = '🧪 Novice Chemist';
    if (currentScore >= 3000) rank = '👑 Master KCSE Chemist (A+)';
    else if (currentScore >= 2000) rank = '🔥 Senior Lab Expert (A)';
    else if (currentScore >= 1000) rank = '🎯 Skilled Analyst (B+)';

    document.getElementById('finalRankDisplay').textContent = rank;
  }
})();

// ============================================================
//  VirtuLab Kenya — Gamification, Streaks & Daily Challenges Engine
//  Duolingo/Brilliant-style Daily Habit Loop, XP Tiers & Audio Rewards
// ============================================================

(function () {
  'use strict';

  // ── 1. LEVEL TIERS CONFIGURATION ───────────────────────────
  const LEVEL_TIERS = [
    { level: 1, title: 'Form 1 Apprentice', icon: '🧪', minXP: 0, maxXP: 250 },
    { level: 2, title: 'Form 2 Experimenter', icon: '🔬', minXP: 250, maxXP: 700 },
    { level: 3, title: 'Form 3 Analytical Chemist', icon: '⚗️', minXP: 700, maxXP: 1600 },
    { level: 4, title: 'Form 4 Master Chemist', icon: '⚡', minXP: 1600, maxXP: 3200 },
    { level: 5, title: 'KCSE Distinction Scholar', icon: '👑', minXP: 3200, maxXP: 6000 }
  ];

  // ── 2. ROTATING DAILY CHALLENGES (DAY 0 TO 6) ──────────────
  const DAILY_CHALLENGES = [
    {
      dayIndex: 0, // Sunday
      title: 'Sunday Capstone: 40-Mark Mock Speed Run',
      topic: 'Comprehensive Paper 3 Revision',
      icon: '🏆',
      mode: 'blitz',
      xpReward: 100,
      description: 'Test your reflexes across all 3 KCSE Paper 3 practical questions.'
    },
    {
      dayIndex: 1, // Monday
      title: 'Monday Volumetric Standardisation Blitz',
      topic: 'Acid-Base & Redox Titrations',
      icon: '⚖️',
      mode: 'titration',
      xpReward: 100,
      description: 'Concordancy, meniscus alignment, and stoichiometric calculations.'
    },
    {
      dayIndex: 2, // Tuesday
      title: 'Tuesday Qualitative Salt Spotting',
      topic: 'Cations & Anion Precipitates',
      icon: '🔬',
      mode: 'qualitative',
      xpReward: 100,
      description: 'Systematic reagent deductions and flame emission diagnostics.'
    },
    {
      dayIndex: 3, // Wednesday
      title: 'Wednesday Thermochemistry Heat Challenge',
      topic: 'Energy Changes & Enthalpy',
      icon: '🔥',
      mode: 'energy',
      xpReward: 100,
      description: 'Calorimeter temperature jumps (ΔT) and heat of reaction equations.'
    },
    {
      dayIndex: 4, // Thursday
      title: 'Thursday Chemical Kinetics Rate Sprint',
      topic: 'Reaction Rates & Collision Theory',
      icon: '⚡',
      mode: 'energy', // shared rates/energy mode
      xpReward: 100,
      description: 'Disappearing cross timing, 1/t rate calculations, and graphs.'
    },
    {
      dayIndex: 5, // Friday
      title: 'Friday Organic Functional Group Blitz',
      topic: 'Unsaturation, Alkanols & Acids',
      icon: '⚗️',
      mode: 'organic',
      xpReward: 100,
      description: 'Bromine water, KMnO₄ unsaturation, and esterification scents.'
    },
    {
      dayIndex: 6, // Saturday
      title: 'Saturday Zero-Error Sudden Death',
      topic: 'Precision Survival Challenge',
      icon: '🎯',
      mode: 'survival',
      xpReward: 120,
      description: '15-second survival clock. Single mistake results in instant elimination.'
    }
  ];

  // ── 3. SYNTHESIZED WEB AUDIO REWARDS ───────────────────────
  function getAudioCtx() {
    if (window.AudioContext || window.webkitAudioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!window.__vlkAudioCtx) {
        window.__vlkAudioCtx = new AudioContextClass();
      }
      if (window.__vlkAudioCtx.state === 'suspended') {
        window.__vlkAudioCtx.resume().catch(() => {});
      }
      return window.__vlkAudioCtx;
    }
    return null;
  }

  const GamificationAudio = {
    playLevelUp() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        // Majestic 7-note ascending chord arpeggio
        const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 to C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.35);
        });
      } catch (e) {}
    },

    playStreakReward() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880]; // A major triumphant chime
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.1, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.28);
        });
      } catch (e) {}
    },

    playStreakMultiplier(tier = 1) {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const baseFreq = tier === 3 ? 1046.50 : (tier === 2 ? 880 : 659.25);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {}
    }
  };

  // ── 4. STREAK TRACKING LOGIC ───────────────────────────────
  const STORAGE_KEY_STREAK = 'vlk_streak_data';
  const STORAGE_KEY_XP = 'vlk_student_xp';
  const STORAGE_KEY_DAILY_BITE = 'vlk_daily_bite_completed_date';

  function getStreakData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STREAK);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      count: 1,
      longest: 1,
      lastActiveDate: new Date().toDateString(),
      freezeCount: 1
    };
  }

  function saveStreakData(data) {
    try {
      localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(data));
    } catch (e) {}
  }

  function logPracticeActivity() {
    const data = getStreakData();
    const today = new Date().toDateString();

    if (data.lastActiveDate === today) {
      return data; // Already logged today
    }

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const twoDaysAgo = new Date(Date.now() - 172800000).toDateString();

    if (data.lastActiveDate === yesterday) {
      data.count += 1;
    } else if (data.lastActiveDate === twoDaysAgo && data.freezeCount > 0) {
      // Streak freeze used automatically
      data.freezeCount -= 1;
      data.count += 1;
      showStreakToast(`🛡️ Streak Freeze preserved your ${data.count}-day streak!`);
    } else {
      // Reset streak
      data.count = 1;
    }

    data.longest = Math.max(data.longest, data.count);
    data.lastActiveDate = today;
    saveStreakData(data);

    // Milestone celebrations (3, 7, 14, 30 days)
    if ([3, 7, 14, 30].includes(data.count)) {
      GamificationAudio.playStreakReward();
      showStreakToast(`🔥 Milestone! ${data.count}-Day Practical Streak achieved!`);
    }

    return data;
  }

  // ── 5. XP & LEVEL SYSTEM ───────────────────────────────────
  function getStudentXP() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_XP) || '120', 10);
    } catch (e) {
      return 120;
    }
  }

  function getXPDetails() {
    const totalXP = getStudentXP();
    let currentTier = LEVEL_TIERS[0];

    for (const tier of LEVEL_TIERS) {
      if (totalXP >= tier.minXP) {
        currentTier = tier;
      }
    }

    const isMaxLevel = currentTier.level === LEVEL_TIERS.length;
    const tierRange = currentTier.maxXP - currentTier.minXP;
    const xpInTier = totalXP - currentTier.minXP;
    const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((xpInTier / tierRange) * 100));

    return {
      totalXP,
      level: currentTier.level,
      title: currentTier.title,
      icon: currentTier.icon,
      minXP: currentTier.minXP,
      maxXP: currentTier.maxXP,
      nextLevelXP: currentTier.maxXP,
      progressPercent
    };
  }

  function addXP(amount, reason = 'Practical Completed') {
    const prevXP = getStudentXP();
    const prevTier = getXPDetails();

    const newXP = prevXP + amount;
    try {
      localStorage.setItem(STORAGE_KEY_XP, newXP.toString());
    } catch (e) {}

    const newTier = getXPDetails();

    // Check for level-up
    if (newTier.level > prevTier.level) {
      GamificationAudio.playLevelUp();
      showLevelUpCelebration(newTier);
    } else {
      showXPToast(`+${amount} XP (${reason})`);
    }

    return newTier;
  }

  // ── 6. DAILY CHEMISTRY BITE CHALLENGE ──────────────────────
  function getDailyChallenge() {
    const todayDay = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
    const challenge = DAILY_CHALLENGES.find((c) => c.dayIndex === todayDay) || DAILY_CHALLENGES[0];
    const todayStr = new Date().toDateString();

    let isCompleted = false;
    try {
      const lastCompleted = localStorage.getItem(STORAGE_KEY_DAILY_BITE);
      isCompleted = lastCompleted === todayStr;
    } catch (e) {}

    return {
      ...challenge,
      isCompleted
    };
  }

  function completeDailyChallenge() {
    const todayStr = new Date().toDateString();
    try {
      localStorage.setItem(STORAGE_KEY_DAILY_BITE, todayStr);
    } catch (e) {}

    logPracticeActivity();
    addXP(100, 'Daily Chemistry Bite Completed');
    GamificationAudio.playStreakReward();
  }

  // ── 7. UI TOASTS & CELEBRATION MODALS ───────────────────────
  function showStreakToast(message) {
    const existing = document.getElementById('vlkStreakToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'vlkStreakToast';
    toast.className = 'streak-toast';
    toast.innerHTML = `
      <span style="font-size:1.6rem;" class="streak-flame-icon">🔥</span>
      <div style="font-size:0.82rem; font-weight:700; color:var(--b-text, #0F172A); line-height:1.4;">
        ${message}
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast) toast.remove();
    }, 4500);
  }

  function showXPToast(message) {
    const toast = document.createElement('div');
    toast.className = 'streak-toast';
    toast.style.borderColor = '#0284C7';
    toast.innerHTML = `
      <span style="font-size:1.4rem;">⭐</span>
      <div style="font-size:0.82rem; font-weight:800; color:#0284C7;">
        ${message}
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast) toast.remove();
    }, 3500);
  }

  function showLevelUpCelebration(tier) {
    const modal = document.createElement('div');
    modal.className = 'tut-modal-overlay active';
    modal.innerHTML = `
      <div class="tut-modal-card">
        <div style="font-size:3rem; margin-bottom:6px;">${tier.icon}🎉</div>
        <h2 style="font-family:'Cinzel', serif; font-size:1.45rem; color:var(--b-text, #0F172A); margin:0;">Level Up!</h2>
        <div style="font-size:1.05rem; font-weight:900; color:#0284C7; margin:8px 0 12px 0;">
          Level ${tier.level}: ${tier.title}
        </div>
        <p style="font-size:0.86rem; color:var(--b-text-secondary, #334155); line-height:1.5; margin-bottom:18px;">
          Congratulations! Your analytical chemistry skills and diagnostic speed have elevated you to the next performance tier.
        </p>
        <button type="button" class="btn-tactile btn-tactile-primary btn-tactile-full btn-tactile-lg" onclick="this.closest('.tut-modal-overlay').remove()">
          Continue Practical Mastery 🚀
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // ── 8. PUBLIC API ──────────────────────────────────────────
  window.GamificationEngine = {
    getStreak: getStreakData,
    logActivity: logPracticeActivity,
    getXP: getXPDetails,
    addXP,
    getDailyChallenge,
    completeDailyChallenge,
    audio: GamificationAudio,
    showStreakToast
  };

  // Auto-log activity on load
  if (typeof window !== 'undefined') {
    logPracticeActivity();
  }
})();

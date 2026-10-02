// ============================================================
//  VirtuLab Kenya — Shared Countdown Exam Timer & Wake Lock Utility
//  Resilient against mobile battery throttling, background pause, and screen sleep.
// ============================================================

let _activeWakeLock = null;

/**
 * Acquire a Screen Wake Lock to keep mobile display awake during practicals/exams.
 */
async function acquireLabWakeLock() {
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && typeof navigator.wakeLock.request === 'function') {
    try {
      if (!_activeWakeLock) {
        _activeWakeLock = await navigator.wakeLock.request('screen');
        _activeWakeLock.addEventListener('release', () => {
          _activeWakeLock = null;
        });
        console.log('[LabWakeLock] Screen wake lock active.');
      }
      return true;
    } catch (err) {
      // Browser may reject if battery saver is active or tab is not focused
      console.warn('[LabWakeLock] Wake lock unavailable or denied:', err.message);
      return false;
    }
  }
  return false;
}

/**
 * Release active Screen Wake Lock.
 */
async function releaseLabWakeLock() {
  if (_activeWakeLock) {
    try {
      await _activeWakeLock.release();
    } catch (_) {}
    _activeWakeLock = null;
  }
}

class ExamTimer {
  constructor({ durationSeconds = 900, displayElementId = 'examTimerDisplay', onFinish = null } = {}) {
    this.totalSeconds = durationSeconds;
    this.remainingSeconds = durationSeconds;
    this.displayElem = document.getElementById(displayElementId);
    this.onFinish = onFinish;
    this.intervalId = null;
    this.endTime = null;
    this.visibilityHandler = null;
  }

  start() {
    // 1. Calculate absolute target end epoch timestamp to avoid timer drift under background throttling
    this.endTime = Date.now() + (this.remainingSeconds * 1000);
    this.updateDisplay();

    // 2. Request Screen Wake Lock so mobile screen does not sleep during active practical
    acquireLabWakeLock();

    // 3. Resync wall clock time when tab regains visibility (e.g. phone was locked or student switched apps)
    if (typeof document !== 'undefined') {
      this.visibilityHandler = () => {
        if (document.visibilityState === 'visible' && this.intervalId && this.endTime) {
          const diffSeconds = Math.round((this.endTime - Date.now()) / 1000);
          this.remainingSeconds = Math.max(0, diffSeconds);
          this.updateDisplay();

          if (this.remainingSeconds <= 0) {
            this.stop();
            if (typeof this.onFinish === 'function') {
              this.onFinish();
            }
          } else {
            // Re-acquire wake lock which is automatically released by OS on lock/tab-blur
            acquireLabWakeLock();
          }
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    // 4. Tick interval
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const diffSeconds = Math.round((this.endTime - now) / 1000);
      this.remainingSeconds = Math.max(0, diffSeconds);
      this.updateDisplay();

      if (this.remainingSeconds <= 0) {
        this.stop();
        if (typeof this.onFinish === 'function') {
          this.onFinish();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.endTime = null;

    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    // Release wake lock when exam/practical ends
    releaseLabWakeLock();
  }

  getElapsedSeconds() {
    return Math.max(0, this.totalSeconds - this.remainingSeconds);
  }

  updateDisplay() {
    if (!this.displayElem) {
      this.displayElem = document.getElementById('examTimerDisplay');
    }
    if (!this.displayElem) return;

    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    this.displayElem.textContent = `⏱️ ${formattedMins}:${formattedSecs}`;
  }
}

if (typeof window !== 'undefined') {
  window.ExamTimer = ExamTimer;
  window.LabWakeLock = {
    request: acquireLabWakeLock,
    release: releaseLabWakeLock
  };
}

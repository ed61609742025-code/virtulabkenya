// ============================================================
//  VirtuLab Kenya — Shared Countdown Exam Timer Utility
// ============================================================

class ExamTimer {
  constructor({ durationSeconds = 900, displayElementId = 'examTimerDisplay', onFinish = null } = {}) {
    this.totalSeconds = durationSeconds;
    this.remainingSeconds = durationSeconds;
    this.displayElem = document.getElementById(displayElementId);
    this.onFinish = onFinish;
    this.intervalId = null;
  }

  start() {
    this.updateDisplay();
    this.intervalId = setInterval(() => {
      if (this.remainingSeconds <= 0) {
        this.stop();
        if (typeof this.onFinish === 'function') {
          this.onFinish();
        }
        return;
      }
      this.remainingSeconds--;
      this.updateDisplay();
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getElapsedSeconds() {
    return this.totalSeconds - this.remainingSeconds;
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
}

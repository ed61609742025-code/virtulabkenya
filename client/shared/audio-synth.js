// ============================================================
//  VirtuLab Kenya — Web Audio Synthesizer Utility
//  Shared sound synthesis for titration, flame, and gas tests
// ============================================================

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playAudioTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context initialization fallback
  }
}

function playDropSound() {
  playAudioTone(800, 'sine', 0.08, 0.15);
}

function playFlameSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch (e) {}
}

function playEffervescenceSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playAudioTone(1200 + Math.random() * 800, 'triangle', 0.04, 0.05);
      }, i * 50);
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.getAudioContext = getAudioContext;
  window.playAudioTone = playAudioTone;
  window.playDropSound = playDropSound;
  window.playFlameSound = playFlameSound;
  window.playEffervescenceSound = playEffervescenceSound;
}

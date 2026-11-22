// audio.js — every sound in Meridian Heist is synthesized with WebAudio:
// short oscillator blips, no audio files, no network. The context is
// created on the first user gesture, so a headless screenshot stays silent.

let ctx = null;
let master = null;

/** Create the audio context (call from a user gesture). Safe to call twice. */
export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
}

/** One short tone: frequency slide from `from` to `to` over `seconds`. */
function tone(from, to, seconds, type = 'sine', when = 0) {
  if (!ctx || !master) return;
  try {
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + seconds);
    gain.gain.setValueAtTime(0.9, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  } catch {
    // Audio is decoration; never let it break the game.
  }
}

/** A quiet filtered noise burst (footstep / coin clink body). */
function noiseBurst(seconds, frequency, when = 0) {
  if (!ctx || !master) return;
  try {
    const t0 = ctx.currentTime + when;
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
  } catch {
    // ignore
  }
}

export const sfx = {
  /** Picking up side loot. */
  pickup() {
    tone(660, 990, 0.12, 'triangle');
    tone(990, 1320, 0.1, 'triangle', 0.08);
  },
  /** The Meridian Star itself. */
  star() {
    tone(523, 523, 0.1, 'triangle');
    tone(659, 659, 0.1, 'triangle', 0.09);
    tone(784, 784, 0.1, 'triangle', 0.18);
    tone(1046, 1568, 0.35, 'triangle', 0.27);
  },
  /** A tossed coin landing. */
  coin() {
    noiseBurst(0.06, 5200);
    tone(2400, 1800, 0.08, 'square');
  },
  /** Smoke bomb popping open. */
  smoke() {
    noiseBurst(0.5, 700);
  },
  /** A camera or door hacked. */
  hack() {
    tone(300, 900, 0.16, 'sawtooth');
    tone(900, 1400, 0.12, 'sawtooth', 0.14);
  },
  /** The alarm climbing while you are seen. */
  alarmTick() {
    tone(880, 880, 0.07, 'square');
  },
  /** Spotted: the grace window opens. */
  spotted() {
    tone(220, 440, 0.3, 'sawtooth');
    tone(220, 440, 0.3, 'sawtooth', 0.32);
  },
  /** Caught. */
  caught() {
    tone(392, 98, 0.7, 'sawtooth');
    tone(196, 49, 0.8, 'triangle', 0.1);
  },
  /** Getaway: level complete. */
  win() {
    tone(523, 523, 0.12, 'triangle');
    tone(659, 659, 0.12, 'triangle', 0.11);
    tone(784, 784, 0.12, 'triangle', 0.22);
    tone(1046, 1046, 0.3, 'triangle', 0.33);
  },
  /** Clicking a menu button. */
  click() {
    tone(700, 500, 0.06, 'triangle');
  },
};

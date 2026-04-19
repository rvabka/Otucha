// Lekki silnik dźwięków oparty o Web Audio API.
// Generuje przyjemne, pastelowe „aurorowe" dźwięki bez plików mp3.
// Używaj przez: import { playSound } from '../lib/sound'; playSound('success')

const MUTE_KEY = 'hp.sound_muted';
const MASTER_VOLUME = 0.22;

let ctx = null;
let masterGain = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (isMuted()) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = MASTER_VOLUME;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function isMuted() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(MUTE_KEY) === '1';
}

export function setMuted(v) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MUTE_KEY, v ? '1' : '0');
}

export function toggleMuted() {
  const next = !isMuted();
  setMuted(next);
  return next;
}

// ---- prymitywy ----

function env(gainNode, t0, attack, decay, sustain, release, peak = 1) {
  const g = gainNode.gain;
  g.cancelScheduledValues(t0);
  g.setValueAtTime(0, t0);
  g.linearRampToValueAtTime(peak, t0 + attack);
  g.linearRampToValueAtTime(sustain * peak, t0 + attack + decay);
  g.linearRampToValueAtTime(0, t0 + attack + decay + release);
}

function tone(ctx, { freq, type = 'sine', start = 0, dur = 0.3, gain = 0.5, detune = 0, attack = 0.01, decay = 0.08, sustain = 0.6, release = null }) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  if (detune) osc.detune.value = detune;
  osc.connect(g);
  g.connect(masterGain);
  const t0 = ctx.currentTime + start;
  const rel = release ?? Math.max(0.05, dur - attack - decay);
  env(g, t0, attack, decay, sustain, rel, gain);
  osc.start(t0);
  osc.stop(t0 + attack + decay + rel + 0.05);
}

function noiseBurst(ctx, { start = 0, dur = 0.08, gain = 0.3, hp = 2000 }) {
  const bufferSize = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  src.start(ctx.currentTime + start);
  src.stop(ctx.currentTime + start + dur);
}

// ---- presety ----

const PRESETS = {
  // Delikatne „pop" do mood-pickera / emoji
  pop(ctx) {
    tone(ctx, { freq: 880, type: 'sine', dur: 0.15, gain: 0.5, attack: 0.005, decay: 0.06, sustain: 0.3, release: 0.08 });
    tone(ctx, { freq: 1320, type: 'sine', start: 0.03, dur: 0.12, gain: 0.35, attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.07 });
  },

  // Krótki tik podczas skanu uśmiechu
  tick(ctx) {
    tone(ctx, { freq: 660, type: 'sine', dur: 0.08, gain: 0.35, attack: 0.002, decay: 0.02, sustain: 0.3, release: 0.05 });
  },

  // Wybór / potwierdzenie (np. avatar, postać)
  select(ctx) {
    tone(ctx, { freq: 523.25, type: 'sine', dur: 0.2, gain: 0.45, attack: 0.005, decay: 0.06, sustain: 0.4, release: 0.12 });
    tone(ctx, { freq: 659.25, type: 'sine', start: 0.08, dur: 0.25, gain: 0.4, attack: 0.005, decay: 0.08, sustain: 0.3, release: 0.15 });
    tone(ctx, { freq: 783.99, type: 'triangle', start: 0.16, dur: 0.3, gain: 0.25, attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.18 });
  },

  // Sukces — quest zaliczony, uśmiech utrzymany 3s, XP
  success(ctx) {
    // C-E-G-C' arpeggio z miękkim dzwoneczkiem
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      tone(ctx, {
        freq: f,
        type: 'sine',
        start: i * 0.08,
        dur: 0.45,
        gain: 0.55 - i * 0.06,
        attack: 0.005,
        decay: 0.1,
        sustain: 0.5,
        release: 0.3,
      });
      // harmonika — dodaje blasku
      tone(ctx, {
        freq: f * 2,
        type: 'triangle',
        start: i * 0.08,
        dur: 0.3,
        gain: 0.15,
        attack: 0.005,
        decay: 0.06,
        sustain: 0.3,
        release: 0.2,
      });
    });
    // delikatny szum jak sparkle
    noiseBurst(ctx, { start: 0.28, dur: 0.35, gain: 0.08, hp: 5000 });
  },

  // Level up — dłuższe, bardziej wypasione
  levelUp(ctx) {
    // Podwójna fanfara: C-E-G-C'-E'-G'
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((f, i) => {
      tone(ctx, {
        freq: f,
        type: 'sine',
        start: i * 0.09,
        dur: 0.6,
        gain: 0.6 - i * 0.05,
        attack: 0.005,
        decay: 0.12,
        sustain: 0.5,
        release: 0.35,
      });
      tone(ctx, {
        freq: f * 1.5,
        type: 'triangle',
        start: i * 0.09,
        dur: 0.4,
        gain: 0.18,
        attack: 0.005,
        decay: 0.08,
        sustain: 0.3,
        release: 0.25,
      });
    });
    // finałowy akord po arpeggio
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
      tone(ctx, {
        freq: f,
        type: 'sine',
        start: 0.65,
        dur: 1.0,
        gain: 0.25,
        attack: 0.05,
        decay: 0.2,
        sustain: 0.6,
        release: 0.7,
      });
    });
    // iskra
    noiseBurst(ctx, { start: 0.1, dur: 0.5, gain: 0.1, hp: 6000 });
    noiseBurst(ctx, { start: 0.7, dur: 0.5, gain: 0.08, hp: 5000 });
  },

  // Ciepły akord dla logowania / heartwarming
  heart(ctx) {
    // F-major chord (F-A-C) z miękkim atakiem
    [349.23, 440, 523.25].forEach((f) => {
      tone(ctx, {
        freq: f,
        type: 'sine',
        dur: 1.0,
        gain: 0.35,
        attack: 0.08,
        decay: 0.2,
        sustain: 0.6,
        release: 0.6,
      });
    });
    tone(ctx, {
      freq: 698.46,
      type: 'triangle',
      start: 0.15,
      dur: 0.9,
      gain: 0.18,
      attack: 0.08,
      decay: 0.2,
      sustain: 0.5,
      release: 0.55,
    });
  },

  // Pojedynczy dzwoneczek — miękkie „chime" do notyfikacji/otwierania modala
  chime(ctx) {
    tone(ctx, { freq: 783.99, type: 'sine', dur: 0.5, gain: 0.4, attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.35 });
    tone(ctx, { freq: 1174.66, type: 'sine', start: 0.06, dur: 0.45, gain: 0.25, attack: 0.005, decay: 0.08, sustain: 0.3, release: 0.3 });
  },

  // Sparkle — wysoki, krótki, magiczny
  sparkle(ctx) {
    [1568, 2093, 2637].forEach((f, i) => {
      tone(ctx, {
        freq: f,
        type: 'sine',
        start: i * 0.05,
        dur: 0.2,
        gain: 0.28 - i * 0.05,
        attack: 0.003,
        decay: 0.05,
        sustain: 0.3,
        release: 0.12,
      });
    });
    noiseBurst(ctx, { start: 0, dur: 0.2, gain: 0.06, hp: 7000 });
  },
};

export function playSound(name) {
  try {
    const c = getCtx();
    if (!c) return;
    const preset = PRESETS[name];
    if (!preset) return;
    preset(c);
  } catch {
    // nie blokuj UI przy błędzie audio
  }
}

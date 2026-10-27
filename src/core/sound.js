// Optional UI sounds. Off by default; Howler is only downloaded the first time a
// sound plays. Tones are synthesized into tiny WAV data URIs, so there are no audio files.
let enabled = false;
let palette = 'professional';
let howlerPromise;
const cache = new Map();

const WAVES = { professional: 'sine', minecraft: 'square', roblox: 'triangle' };
const SOUNDS = {
  click: { f0: 660, f1: 520, dur: 0.07, vol: 0.25 },
  toggle: { f0: 520, f1: 780, dur: 0.09, vol: 0.25 },
  switch: { f0: 392, f1: 784, dur: 0.22, vol: 0.22 },
  success: { f0: 523, f1: 1046, dur: 0.3, vol: 0.25 },
  pop: { f0: 880, f1: 1320, dur: 0.08, vol: 0.2 },
  break: { f0: 180, f1: 90, dur: 0.12, vol: 0.25 },
  orb: { f0: 1200, f1: 1800, dur: 0.1, vol: 0.12 },
};

function synth({ f0, f1, dur, vol }, wave) {
  const rate = 22050;
  const n = Math.floor(rate * dur);
  const buf = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o, s) => [...s].forEach((c, i) => buf.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); buf.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt ');
  buf.setUint32(16, 16, true); buf.setUint16(20, 1, true); buf.setUint16(22, 1, true);
  buf.setUint32(24, rate, true); buf.setUint32(28, rate * 2, true); buf.setUint16(32, 2, true);
  buf.setUint16(34, 16, true); w(36, 'data'); buf.setUint32(40, n * 2, true);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    phase += (2 * Math.PI * (f0 + (f1 - f0) * t)) / rate;
    const s = Math.sin(phase);
    const v = wave === 'square' ? Math.sign(s) * 0.5 : wave === 'triangle' ? (2 / Math.PI) * Math.asin(s) : s;
    const env = Math.min(1, i / 60) * Math.pow(1 - t, 2);
    buf.setInt16(44 + i * 2, v * env * vol * 32767, true);
  }
  let bin = '';
  const bytes = new Uint8Array(buf.buffer);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(bin)}`;
}

export function setSoundEnabled(on) {
  enabled = on;
}
export function setSoundPalette(theme) {
  palette = theme;
}

export async function play(name) {
  if (!enabled || !SOUNDS[name]) return;
  howlerPromise ||= import('howler');
  const { Howl } = await howlerPromise;
  const key = `${palette}:${name}`;
  if (!cache.has(key)) cache.set(key, new Howl({ src: [synth(SOUNDS[name], WAVES[palette])], format: ['wav'] }));
  cache.get(key).play();
}

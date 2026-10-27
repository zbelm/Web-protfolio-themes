// Procedural 16×16 pixel textures (original art, generated at runtime, no image files).
// Used as CSS backgrounds (data URLs) and as Three.js block textures.

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PAL = {
  dirt: ['#79553a', '#5d4027', '#966c4a', '#6b4a30', '#866043'],
  grass: ['#5d9b3a', '#6aaa45', '#4f8a30', '#79b84f', '#58933a'],
  stone: ['#7d7d7d', '#8a8a8a', '#6e6e6e', '#959595', '#747474'],
  plank: ['#a2824e', '#b8945f', '#9c7a48', '#ad8a55'],
  log: ['#6b5232', '#4f3b22', '#5c4529', '#755a37'],
  leaves: ['#3b7a24', '#4a8f2e', '#2f6a1c', '#55a035'],
  water: ['#2f5fd0', '#3a6be0', '#2a55c0'],
};

const DRAW = {
  dirt: (px, r) => noise(px, r, PAL.dirt),
  stone: (px, r) => noise(px, r, PAL.stone),
  grass_top: (px, r) => noise(px, r, PAL.grass),
  grass_side: (px, r) => {
    noise(px, r, PAL.dirt);
    for (let x = 0; x < 16; x++) {
      const depth = 3 + Math.floor(r() * 3);
      for (let y = 0; y < depth; y++) px(x, y, pick(PAL.grass, r));
    }
  },
  cobble: (px, r) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, '#4f4f4f');
    for (let i = 0; i < 22; i++) {
      const w = 3 + Math.floor(r() * 4);
      const h = 2 + Math.floor(r() * 3);
      const x0 = Math.floor(r() * 16);
      const y0 = Math.floor(r() * 16);
      const c = pick(PAL.stone, r);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px((x0 + x) % 16, (y0 + y) % 16, c);
    }
  },
  planks: (px, r) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const board = Math.floor(y / 4);
        const seam = (x + board * 5) % 16 === 0;
        px(x, y, y % 4 === 3 || seam ? '#6b5432' : pick(PAL.plank, r));
      }
    }
  },
  log: (px, r) => {
    for (let x = 0; x < 16; x++) {
      const base = pick(PAL.log, r);
      for (let y = 0; y < 16; y++) px(x, y, r() < 0.25 ? pick(PAL.log, r) : base);
    }
  },
  leaves: (px, r) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (r() > 0.18) px(x, y, pick(PAL.leaves, r));
  },
  water: (px, r) => noise(px, r, PAL.water),
};

const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
function noise(px, r, pal) {
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(x, y, pick(pal, r));
}

const canvases = new Map();
export function textureCanvas(kind) {
  if (!canvases.has(kind)) {
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const ctx = c.getContext('2d');
    const r = rng([...kind].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7));
    DRAW[kind]((x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }, r);
    canvases.set(kind, c);
  }
  return canvases.get(kind);
}

export const TEXTURE_KINDS = Object.keys(DRAW);

// Exposes every texture as a CSS custom property: --tx-dirt, --tx-grass_side, ...
export function applyCssTextures(el) {
  TEXTURE_KINDS.forEach((k) => el.style.setProperty(`--tx-${k}`, `url(${textureCanvas(k).toDataURL()})`));
  return () => TEXTURE_KINDS.forEach((k) => el.style.removeProperty(`--tx-${k}`));
}

// Roblox-style imagery drawn in code (original art, no image files): obby-scene game
// thumbnails, round badge icons and a baseplate grid texture. Results are cached.

const cache = new Map();
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const BRICK = ['#c4281c', '#0d69ac', '#f5cd30', '#4b974b', '#da8541', '#6b327c', '#e8bac8', '#9ff3e9'];
const SKIES = {
  game: ['#5fb4ff', '#d6eeff'],
  web: ['#ff9a5c', '#ffd9a8'],
  app: ['#3fc6c0', '#d2f6f2'],
};

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

// A part (block) drawn in simple 3D: front, top and right faces.
function part(g, x, y, w, h, d, color) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
  g.fillStyle = shade(color, 1.25);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + d, y - d * 0.6);
  g.lineTo(x + w + d, y - d * 0.6);
  g.lineTo(x + w, y);
  g.fill();
  g.fillStyle = shade(color, 0.72);
  g.beginPath();
  g.moveTo(x + w, y);
  g.lineTo(x + w + d, y - d * 0.6);
  g.lineTo(x + w + d, y + h - d * 0.6);
  g.lineTo(x + w, y + h);
  g.fill();
}

// Front-view blocky avatar standing with its feet at (cx, feetY).
function avatar(g, cx, feetY, s, shirt) {
  const u = s / 6;
  part(g, cx - u * 2, feetY - u * 2, u * 1.95, u * 2, u * 0.5, '#2b2d31');
  part(g, cx + u * 0.05, feetY - u * 2, u * 1.95, u * 2, u * 0.5, '#2b2d31');
  part(g, cx - u * 2, feetY - u * 4, u * 4, u * 2, u * 0.5, shirt);
  part(g, cx - u * 3, feetY - u * 4, u * 0.95, u * 2, u * 0.5, '#f2c79b');
  part(g, cx + u * 2.05, feetY - u * 4, u * 0.95, u * 2, u * 0.5, '#f2c79b');
  part(g, cx - u * 1.2, feetY - u * 5.4, u * 2.4, u * 1.35, u * 0.5, '#f2c79b');
  g.fillStyle = '#1b1d1f';
  g.fillRect(cx - u * 0.6, feetY - u * 5, u * 0.22, u * 0.32);
  g.fillRect(cx + u * 0.38, feetY - u * 5, u * 0.22, u * 0.32);
  g.fillRect(cx - u * 0.4, feetY - u * 4.5, u * 0.8, u * 0.12);
}

export function gameThumb(project, w = 640, h = 360) {
  const key = `thumb:${project.id}:${w}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const r = rng(hash(project.id));
  const [top, bottom] = SKIES[project.category] || SKIES.game;

  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, top);
  sky.addColorStop(1, bottom);
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  // Blocky clouds
  g.fillStyle = 'rgb(255 255 255 / 0.85)';
  for (let i = 0; i < 3; i++) {
    const x = r() * w;
    const y = 20 + r() * h * 0.25;
    g.fillRect(x, y, 70, 18);
    g.fillRect(x + 16, y - 12, 38, 14);
  }

  // Baseplate floor with a perspective grid
  const horizon = h * 0.68;
  g.fillStyle = '#a3a2a5';
  g.fillRect(0, horizon, w, h - horizon);
  g.strokeStyle = 'rgb(0 0 0 / 0.12)';
  g.lineWidth = 1.5;
  for (let i = 1; i < 8; i++) {
    const y = horizon + (h - horizon) * (i / 8) ** 1.6;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  for (let i = -10; i <= 10; i++) {
    g.beginPath();
    g.moveTo(w / 2 + i * 18, horizon);
    g.lineTo(w / 2 + i * 120, h);
    g.stroke();
  }

  // Floating obby parts, rising left to right
  const steps = 5;
  let landing = null;
  for (let i = 0; i < steps; i++) {
    const pw = 70 + r() * 40;
    const x = 30 + i * (w - 120) / steps + r() * 20;
    const y = horizon - 30 - i * (h * 0.09) - r() * 20;
    const color = BRICK[Math.floor(r() * BRICK.length)];
    part(g, x, y, pw, 18, 16, color);
    if (i === steps - 2) landing = { x: x + pw / 2, y };
  }
  // Spawn pad on the floor
  part(g, w * 0.08, horizon + 18, 90, 10, 22, '#6e6e72');
  g.fillStyle = '#335fff';
  g.fillRect(w * 0.08 + 25, horizon + 14, 40, 4);

  avatar(g, landing.x, landing.y, 64, project.featured ? '#335fff' : BRICK[Math.floor(r() * 4)]);

  const url = c.toDataURL('image/webp', 0.85);
  cache.set(key, url);
  return url;
}

export function badgeImage(cert, size = 256) {
  const brand = cert.brand || { color: '#335fff', fg: '#ffffff', mark: '?' };
  const key = `badge:${cert.id}:${size}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const color = brand.color;
  const m = size / 2;

  const bg = g.createRadialGradient(m * 0.7, m * 0.6, size * 0.05, m, m, m);
  bg.addColorStop(0, shade(color, 1.45));
  bg.addColorStop(1, shade(color, 0.85));
  g.fillStyle = bg;
  g.beginPath();
  g.arc(m, m, m - 4, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = size * 0.045;
  g.strokeStyle = 'rgb(255 255 255 / 0.85)';
  g.beginPath();
  g.arc(m, m, m - size * 0.08, 0, Math.PI * 2);
  g.stroke();

  // Issuer mark on a white blocky plate (a part), plus a small gold star stud.
  const u = size / 16;
  part(g, m - u * 4.2, m - u * 4.6, u * 8, u * 6.4, u * 0.9, '#ffffff');
  g.fillStyle = color === '#ffffff' ? '#1b1d1f' : color;
  if (brand.icon) {
    // Company logo (24×24 path) centered on the plate.
    const s = (u * 4.6) / 24;
    g.save();
    g.translate(m - u * 0.2 - 12 * s, m - u * 1.35 - 12 * s);
    g.scale(s, s);
    g.fill(new Path2D(brand.icon));
    g.restore();
  } else {
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const markSize = brand.mark.length > 2 ? 0.2 : brand.mark.length > 1 ? 0.25 : 0.32;
    g.font = `900 ${Math.round(size * markSize)}px Montserrat Variable, system-ui, sans-serif`;
    g.fillText(brand.mark, m - u * 0.2, m - u * 1.35, u * 7.2);
  }
  part(g, m - u * 0.9, m + u * 2.2, u * 1.8, u * 0.9, u * 0.5, '#f5cd30');
  g.textBaseline = 'alphabetic';

  g.fillStyle = '#fff';
  g.font = `800 ${Math.round(size * 0.085)}px Montserrat Variable, system-ui, sans-serif`;
  g.textAlign = 'center';
  g.fillText(cert.issuer.slice(0, 12).toUpperCase(), m, m + u * 5.1, size * 0.62);

  const url = c.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

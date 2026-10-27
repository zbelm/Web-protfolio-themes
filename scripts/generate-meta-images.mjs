// Generates public/og.png (1200x630 social card) and public/apple-touch-icon.png.
// Run after changing your name/brand: node scripts/generate-meta-images.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const profile = JSON.parse(readFileSync(new URL('../src/data/profile.json', import.meta.url), 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const statusText = esc([profile.status, ...(profile.extraStatuses || [])].join(' · '));
const pillW = Math.round(70 + statusText.length * 11.2);
const roles = profile.roles.slice(0, 3).map((r) => r.replace(' Developer', '')).join(' · ') + ' Developer';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="a" cx="15%" cy="10%" r="70%"><stop offset="0" stop-color="#5b5bd6" stop-opacity=".55"/><stop offset="1" stop-color="#5b5bd6" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="95%" cy="100%" r="60%"><stop offset="0" stop-color="#38bdf8" stop-opacity=".25"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b0b12"/>
  <rect width="1200" height="630" fill="url(#a)"/>
  <rect width="1200" height="630" fill="url(#b)"/>
  <g font-family="Segoe UI, Inter, Arial, sans-serif">
    <rect x="80" y="96" width="${pillW}" height="48" rx="24" fill="#16161f" stroke="#2a2a3a"/>
    <circle cx="108" cy="120" r="7" fill="#5fd197"/>
    <text x="126" y="128" font-size="22" font-weight="600" fill="#ececf3">${statusText}</text>
    <text x="80" y="290" font-size="104" font-weight="800" fill="#ffffff" letter-spacing="-3">${esc(profile.name)}</text>
    <text x="80" y="368" font-size="40" font-weight="600" fill="#a5a5ff">${esc(roles)}</text>
    <text x="80" y="540" font-size="30" font-weight="700" fill="#ececf3">zachary<tspan fill="#a5a5ff">.dev</tspan></text>
  </g>
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#5b5bd6"/>
  <path d="M19 22h24L21 42h24" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

await sharp(Buffer.from(og)).png({ compressionLevel: 9, palette: true }).toFile('public/og.png');
await sharp(Buffer.from(icon)).png().toFile('public/apple-touch-icon.png');
console.log('Wrote public/og.png and public/apple-touch-icon.png');

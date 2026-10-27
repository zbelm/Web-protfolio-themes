// Theme registry. Professional ships in the main bundle; Minecraft and Roblox are
// separate chunks (JS + CSS + fonts) fetched on demand and cached.
import professional from '../themes/professional/index.js';
import { wait } from './storage.js';

export const THEMES = [
  { id: 'professional', label: 'Professional' },
  { id: 'minecraft', label: 'Minecraft' },
  { id: 'roblox', label: 'Roblox' },
];
export const THEME_IDS = THEMES.map((t) => t.id);

const importers = {
  professional: () => Promise.resolve(professional),
  minecraft: () => import('../themes/minecraft/index.js').then((m) => m.default),
  roblox: () => import('../themes/roblox/index.js').then((m) => m.default),
};

const cache = new Map();

// Resolves once the theme's code, CSS and display fonts are ready (fonts capped
// at 2.5s so a slow network never blocks the switch).
export function loadTheme(id) {
  if (!cache.has(id)) {
    const p = importers[id]()
      .then(async (theme) => {
        if (theme.fonts?.length && document.fonts?.load) {
          await Promise.race([Promise.all(theme.fonts.map((f) => document.fonts.load(f))).catch(() => {}), wait(2500)]);
        }
        return theme;
      })
      .catch((err) => {
        cache.delete(id);
        throw err;
      });
    cache.set(id, p);
  }
  return cache.get(id);
}

export const getLoadedSync = (id) => (id === 'professional' ? professional : null);

export function preloadThemes() {
  THEME_IDS.forEach((id) => loadTheme(id).catch(() => {}));
}

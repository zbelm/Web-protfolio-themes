// Themed loading screens. They live in the main bundle with self-contained
// styles, so the loader for a theme can show before that theme has downloaded.
import { useEffect, useState } from 'react';
import { useApp } from '../core/AppState.jsx';
import { store } from '../core/storage.js';

const TEXT = { professional: 'Loading', minecraft: 'Generating world', roblox: 'Joining server' };

export function ThemeLoader({ themeId }) {
  return (
    <div className={`ld ld--${themeId}`}>
      {themeId === 'professional' && (
        <div className="ld__line">
          <span />
        </div>
      )}
      {themeId === 'minecraft' && (
        <div className="ld__blocks">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} style={{ '--i': i }} />
          ))}
        </div>
      )}
      {themeId === 'roblox' && (
        <div className="ld__wall">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} style={{ '--i': i }} />
          ))}
        </div>
      )}
      <p className="ld__text">{TEXT[themeId]}…</p>
    </div>
  );
}

export function SwitchLayers() {
  const { switching, loaderFor } = useApp();
  return (
    <>
      <div className={`switch-fade ${switching ? 'is-on' : ''}`} aria-hidden="true" />
      {loaderFor && (
        <div className="switch-loader" role="status" aria-live="polite">
          <ThemeLoader themeId={loaderFor} />
        </div>
      )}
    </>
  );
}

// First visit only: a short (<1.5s), skippable intro that ends as soon as the page is ready.
export function FirstVisit() {
  const { themeId, theme, reduced } = useApp();
  const [state, setState] = useState(() => (store.get('visited') ? 'done' : 'show'));

  useEffect(() => {
    if (state !== 'show') return undefined;
    store.set('visited', '1');
    const start = performance.now();
    const leave = () => setState((s) => (s === 'show' ? 'leaving' : s));
    const cap = setTimeout(leave, reduced ? 500 : 1400);
    let minT;
    (document.fonts?.ready || Promise.resolve()).then(() => {
      minT = setTimeout(leave, Math.max(0, (reduced ? 300 : 900) - (performance.now() - start)));
    });
    const onKey = (e) => e.key === 'Escape' && leave();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(cap);
      clearTimeout(minT);
      window.removeEventListener('keydown', onKey);
    };
  }, [state, reduced]);

  useEffect(() => {
    if (state !== 'leaving') return undefined;
    const t = setTimeout(() => setState('done'), 320);
    return () => clearTimeout(t);
  }, [state]);

  if (state === 'done' || !theme) return null;
  return (
    <div className={`first-visit ${state === 'leaving' ? 'is-leaving' : ''}`} role="status" aria-label="Loading portfolio">
      <ThemeLoader themeId={themeId} />
      <button type="button" className="first-visit__skip" onClick={() => setState('leaving')}>
        Skip intro
      </button>
    </div>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { getLoadedSync, loadTheme, THEME_IDS } from './registry.js';
import { captureAnchor, restoreAnchor } from './scrollAnchor.js';
import { refreshMotion, prefersReducedMotion } from './motion.js';
import { play, setSoundEnabled, setSoundPalette } from './sound.js';
import { store, wait } from './storage.js';

const AppState = createContext(null);
export const useApp = () => useContext(AppState);

const root = document.documentElement;
const LOADER_DELAY = 300; // never show a loader for switches faster than this
const LOADER_MIN = 450; // once shown, keep it long enough to read as intentional

export function AppStateProvider({ children }) {
  // index.html already resolved ?theme, storage and system preference before paint.
  const [themeId, setThemeId] = useState(() => (THEME_IDS.includes(root.dataset.theme) ? root.dataset.theme : 'professional'));
  const [theme, setTheme] = useState(() => getLoadedSync(themeId));
  const [mode, setModeState] = useState(root.dataset.mode === 'dark' ? 'dark' : 'light');
  const [sound, setSound] = useState(() => store.get('sound') === 'on');
  const [effects, setEffects] = useState(() => store.get('effects') !== 'off');
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [switching, setSwitching] = useState(false); // page-transition fade
  const [loaderFor, setLoaderFor] = useState(null); // theme id whose loader is visible
  const busy = useRef(false);

  const motionOK = effects && !reduced;

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    setSoundEnabled(sound);
    store.set('sound', sound ? 'on' : 'off');
  }, [sound]);

  useEffect(() => {
    store.set('effects', effects ? 'on' : 'off');
    if (effects) delete root.dataset.effects;
    else root.dataset.effects = 'off';
  }, [effects]);

  useEffect(() => setSoundPalette(themeId), [themeId]);

  // Initial load of a lazy theme (returning visitor on Minecraft/Roblox or ?theme=).
  useEffect(() => {
    if (theme) return;
    const t = setTimeout(() => setLoaderFor(themeId), LOADER_DELAY);
    loadTheme(themeId)
      .then(setTheme)
      .catch(() => {
        root.dataset.theme = 'professional';
        setThemeId('professional');
        setTheme(getLoadedSync('professional'));
      })
      .finally(() => {
        clearTimeout(t);
        setLoaderFor(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestTheme = useCallback(
    async (id) => {
      if (id === themeId || busy.current || !THEME_IDS.includes(id)) return;
      busy.current = true;
      const anchor = captureAnchor();
      setSwitching(true);
      let shownAt = 0;
      const loaderTimer = setTimeout(() => {
        shownAt = performance.now();
        setLoaderFor(id);
      }, LOADER_DELAY);
      try {
        const [next] = await Promise.all([loadTheme(id), wait(motionOK ? 200 : 0)]);
        clearTimeout(loaderTimer);
        if (shownAt) await wait(Math.max(0, LOADER_MIN - (performance.now() - shownAt)));
        root.dataset.theme = id;
        flushSync(() => {
          setTheme(next);
          setThemeId(id);
        });
        store.set('theme', id);
        const url = new URL(location.href);
        if (url.searchParams.has('theme')) {
          url.searchParams.set('theme', id);
          history.replaceState(null, '', url);
        }
        restoreAnchor(anchor);
        const settledY = window.scrollY;
        requestAnimationFrame(() => {
          // Re-apply once layout settles, unless the visitor already scrolled away.
          if (Math.abs(window.scrollY - settledY) < 2) restoreAnchor(anchor);
          refreshMotion();
        });
        play('switch');
      } catch {
        clearTimeout(loaderTimer);
      } finally {
        setLoaderFor(null);
        setSwitching(false);
        busy.current = false;
      }
    },
    [themeId, motionOK],
  );

  const setMode = useCallback(
    (next) => {
      const apply = () => {
        root.dataset.mode = next;
        flushSync(() => setModeState(next));
      };
      store.set('mode', next);
      play('toggle');
      if (document.startViewTransition && motionOK) document.startViewTransition(apply);
      else apply();
    },
    [motionOK],
  );

  const value = useMemo(
    () => ({
      themeId,
      theme,
      mode,
      setMode,
      toggleMode: () => setMode(mode === 'dark' ? 'light' : 'dark'),
      requestTheme,
      switching,
      loaderFor,
      sound,
      setSound,
      effects,
      setEffects,
      reduced,
      motionOK,
    }),
    [themeId, theme, mode, setMode, requestTheme, switching, loaderFor, sound, effects, reduced, motionOK],
  );

  return <AppState.Provider value={value}>{children}</AppState.Provider>;
}

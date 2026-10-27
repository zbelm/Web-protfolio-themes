import { useEffect, useRef, useState } from 'react';
import { useApp } from '../core/AppState.jsx';

// Optional Three.js hero accent. Only loads on capable devices with effects on,
// after the browser is idle; otherwise the CSS fallback stays.
function capable() {
  const nav = navigator;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory < 4) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return false;
  if (!matchMedia('(min-width: 768px)').matches) return false;
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

// Start only after the visitor interacts (any mouse move counts), so the 3D bundle
// never competes with the initial page load.
let interacted;
function firstInteraction() {
  interacted ||= new Promise((resolve) => {
    const events = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart', 'wheel'];
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go, true));
      resolve();
    };
    events.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true }));
  });
  return interacted;
}

export default function Hero3D({ load, fallback, className = '' }) {
  const { motionOK, mode } = useApp();
  const host = useRef(null);
  const api = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!motionOK) return undefined;
    let cancelled = false;
    const start = () =>
      load()
        .then((m) => {
          if (cancelled || !host.current) return;
          api.current = m.mount(host.current, { mode: document.documentElement.dataset.mode });
          setReady(true);
        })
        .catch(() => {});
    let idle;
    firstInteraction().then(() => {
      // The WebGL probe itself is costly, so it also waits for the first interaction.
      if (!cancelled && capable()) idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300);
    });
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback ? cancelIdleCallback(idle) : clearTimeout(idle);
      api.current?.dispose();
      api.current = null;
      setReady(false);
    };
  }, [motionOK, load]);

  useEffect(() => {
    api.current?.setMode?.(mode);
  }, [mode]);

  return (
    <div className={`hero3d ${className} ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      <div className="hero3d__fallback">{fallback}</div>
      <div className="hero3d__canvas" ref={host} />
    </div>
  );
}

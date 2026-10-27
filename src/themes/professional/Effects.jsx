import { useEffect } from 'react';
import { useApp } from '../../core/AppState.jsx';

// Cursor glow on cards + magnetic buttons. Fine pointers only, effects on only.
export default function Effects() {
  const { motionOK } = useApp();
  useEffect(() => {
    if (!motionOK || !matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    let mag = null;
    let frame = 0;
    let last;
    const apply = () => {
      frame = 0;
      const e = last;
      const glow = e.target.closest?.('.pf-glow');
      if (glow) {
        const r = glow.getBoundingClientRect();
        glow.style.setProperty('--mx', `${e.clientX - r.left}px`);
        glow.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      const m = e.target.closest?.('[data-magnetic]');
      if (m !== mag) {
        if (mag) mag.style.translate = '';
        mag = m;
      }
      if (m) {
        const r = m.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        m.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      }
    };
    const onMove = (e) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
      if (mag) mag.style.translate = '';
    };
  }, [motionOK]);
  return null;
}

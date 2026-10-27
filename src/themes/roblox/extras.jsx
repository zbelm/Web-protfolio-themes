import { useEffect, useRef } from 'react';
import { useApp } from '../../core/AppState.jsx';

const GRID = 48; // baseplate tile size, keeps the parallax loop seamless

/* Gray studio-style baseplate behind the page, with gentle parallax. */
export function Background() {
  const ref = useRef(null);
  const { motionOK } = useApp();
  useEffect(() => {
    const el = ref.current;
    if (!motionOK || !el) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      el.style.transform = `translate3d(0, ${-((window.scrollY * 0.3) % GRID)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      el.style.transform = '';
    };
  }, [motionOK]);
  return (
    <div className="rb-plate" aria-hidden="true">
      <div className="rb-plate__grid" ref={ref} />
    </div>
  );
}

const COLORS = ['#335fff', '#c4281c', '#f5cd30', '#4b974b', '#ffffff'];

// Confetti burst from the resume button (skipped with reduced motion / effects off).
export function confetti(e) {
  if (document.documentElement.dataset.effects === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = e.currentTarget.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('span');
    p.className = 'rb-confetti';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = COLORS[i % COLORS.length];
    document.body.appendChild(p);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const v = 120 + Math.random() * 160;
    const dx = Math.cos(a) * v;
    const dy = Math.sin(a) * v;
    p.animate(
      [
        { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${dx * 1.3}px), calc(-50% + ${dy + 260}px)) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    ).finished.then(() => p.remove(), () => p.remove());
  }
}

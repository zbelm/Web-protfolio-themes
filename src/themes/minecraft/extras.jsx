import { useEffect, useLayoutEffect, useState } from 'react';
import { useApp } from '../../core/AppState.jsx';
import { play } from '../../core/sound.js';
import { applyCssTextures } from './textures.js';

const SECTIONS = ['about', 'projects', 'skills', 'certifications', 'experience', 'contact'];
const ADVANCEMENTS = {
  about: 'Getting to Know You',
  projects: 'World Explorer',
  skills: 'Leveling Up',
  certifications: 'Item Collector',
  experience: 'The Journey So Far',
  contact: 'Let’s Team Up',
};

/* Sky (sun or moon on a slow day/night arc, stars or clouds) + pixel textures as CSS vars. */
export function Background() {
  useLayoutEffect(() => applyCssTextures(document.documentElement), []);
  return (
    <div className="mc-sky fx" aria-hidden="true">
      <div className="mc-sky__tint" />
      <div className="mc-sky__stars" />
      <div className="mc-sky__orbit">
        <span className="mc-sky__body" />
      </div>
      <div className="mc-sky__clouds">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

/* In-game HUD above the hotbar: hearts + XP bar that fills as sections are explored. */
export function NavExtra() {
  const [xp, setXp] = useState(0);
  useEffect(() => {
    const on = () => setXp((v) => Math.min(SECTIONS.length, v + 1));
    window.addEventListener('mc:xp', on);
    return () => window.removeEventListener('mc:xp', on);
  }, []);
  return (
    <div className="mc-hud" aria-hidden="true">
      <div className="mc-hud__hearts">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="mc-hud__xp">
        <span className="mc-hud__fill" style={{ transform: `scaleX(${xp / SECTIONS.length})` }} />
        <span className="mc-hud__lv">{xp}</span>
      </div>
    </div>
  );
}

function spawnOrbs(fromEl) {
  const target = document.querySelector('.mc-hud__xp');
  if (!target || !target.getClientRects().length) return Promise.resolve();
  const from = fromEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const tx = to.left + to.width / 2;
  const ty = to.top + to.height / 2;
  return Promise.all(
    Array.from({ length: 5 }, (_, i) => {
      const orb = document.createElement('span');
      orb.className = 'mc-orb';
      const sx = from.left + Math.min(from.width, 320) * Math.random();
      const sy = from.top + 10 + Math.random() * 30;
      orb.style.left = `${sx}px`;
      orb.style.top = `${sy}px`;
      document.body.appendChild(orb);
      const dx = tx - sx;
      const dy = ty - sy;
      return orb
        .animate(
          [
            { transform: 'translate(0,0) scale(0.6)', opacity: 0 },
            { transform: `translate(${dx * 0.15}px, ${-30 - Math.random() * 30}px) scale(1)`, opacity: 1, offset: 0.3 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.9 },
          ],
          { duration: 700 + i * 90, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', delay: i * 60 },
        )
        .finished.then(() => orb.remove(), () => orb.remove());
    }),
  );
}

let toastY = 0;
function toast(title) {
  const el = document.createElement('div');
  el.className = 'mc-toast';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="mc-toast__icon"></span><span><b>Advancement Made!</b><span></span></span>';
  el.querySelector('span span').textContent = title;
  el.style.top = `${84 + toastY * 72}px`;
  toastY++;
  document.body.appendChild(el);
  const anim = el.animate(
    [
      { transform: 'translateX(110%)' },
      { transform: 'translateX(0)', offset: 0.12 },
      { transform: 'translateX(0)', offset: 0.88 },
      { transform: 'translateX(110%)' },
    ],
    { duration: 3600, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
  );
  anim.finished.then(
    () => {
      el.remove();
      toastY = Math.max(0, toastY - 1);
    },
    () => el.remove(),
  );
}

function debris(x, y) {
  const colors = ['#79553a', '#5d9b3a', '#7d7d7d', '#5d4027'];
  for (let i = 0; i < 7; i++) {
    const p = document.createElement('span');
    p.className = 'mc-debris';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = colors[i % colors.length];
    document.body.appendChild(p);
    const a = (Math.PI * 2 * i) / 7 + Math.random() * 0.5;
    const d = 24 + Math.random() * 26;
    p.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 30}px)) rotate(${120 + Math.random() * 180}deg)`, opacity: 0 },
      ],
      { duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    ).finished.then(() => p.remove(), () => p.remove());
  }
}

/* XP orbs + advancement toasts on discovering a section, block-break debris on button
   press, number keys 1-5 select hotbar slots. */
export function Effects() {
  const { motionOK } = useApp();

  useEffect(() => {
    const seen = new Set();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting || seen.has(e.target.id)) return;
          seen.add(e.target.id);
          if (!motionOK) return window.dispatchEvent(new Event('mc:xp'));
          play('orb');
          spawnOrbs(e.target.querySelector('.section-title') || e.target).then(() => window.dispatchEvent(new Event('mc:xp')));
          if (ADVANCEMENTS[e.target.id] && e.target.id !== 'about') toast(ADVANCEMENTS[e.target.id]);
        }),
      { threshold: 0.2 },
    );
    SECTIONS.map((id) => document.getElementById(id)).filter(Boolean).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [motionOK]);

  useEffect(() => {
    const onDown = (e) => {
      if (!e.target.closest?.('.app--minecraft .btn')) return;
      play('break');
      if (motionOK) debris(e.clientX, e.clientY);
    };
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(e.target.tagName) || document.querySelector('dialog[open]')) return;
      const n = Number(e.key);
      const link = n >= 1 && n <= 5 && document.querySelectorAll('.nav__links a')[n - 1];
      if (link) {
        e.preventDefault();
        link.click();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [motionOK]);

  return null;
}

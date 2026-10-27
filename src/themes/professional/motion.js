// Professional motion presets: calm, short, transform/opacity only.
import { notYetSeen } from '../../core/motion.js';

export function reveal(gsap, root) {
  const title = root.querySelector('.section-title');
  const words = title ? [...title.querySelectorAll('.w__i')] : [];
  if (words.length && notYetSeen(title)) {
    gsap.from(words, {
      yPercent: 110,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.04,
      scrollTrigger: { trigger: title, start: 'top 88%', once: true },
    });
  }
  root.querySelectorAll('.section-header .eyebrow, .section-header .lead, [data-reveal]').forEach((el) => {
    if (!notYetSeen(el)) return;
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

// Animated counters without GSAP so they run right away (no interaction needed).
export function countUp(root) {
  const els = root.querySelectorAll('[data-count]');
  const start = performance.now() + 450;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  let raf = 0;
  const tick = (now) => {
    let done = true;
    els.forEach((el, i) => {
      const t = Math.min(1, Math.max(0, (now - start - i * 120) / 1300));
      el.textContent = Math.round(ease(t) * Number(el.dataset.count));
      if (t < 1) done = false;
    });
    if (!done) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    els.forEach((el) => (el.textContent = el.dataset.count));
  };
}

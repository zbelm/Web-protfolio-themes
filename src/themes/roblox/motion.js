import { notYetSeen } from '../../core/motion.js';

// Roblox motion: pieces drop in, then snap with a tiny squash, like a brick clicking onto studs.
export function snap(gsap, root) {
  const header = root.querySelector('.section-header');
  if (header && !header.closest('[data-brick]') && notYetSeen(header)) {
    gsap.from(header.children, {
      y: 20,
      opacity: 0,
      duration: 0.45,
      ease: 'back.out(2)',
      stagger: 0.05,
      scrollTrigger: { trigger: header, start: 'top 88%', once: true },
    });
  }
  gsap.utils.toArray(root.querySelectorAll('[data-brick]')).forEach((el, i) => {
    if (!notYetSeen(el)) return;
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true }, delay: (i % 3) * 0.07 })
      .from(el, { y: -56, opacity: 0, duration: 0.32, ease: 'power2.in' })
      .to(el, { scaleY: 0.96, scaleX: 1.015, duration: 0.07, ease: 'power1.out', transformOrigin: '50% 100%' })
      .to(el, { scaleY: 1, scaleX: 1, duration: 0.35, ease: 'back.out(3)', clearProps: 'transform' });
  });
}

import { notYetSeen } from '../../core/motion.js';

// Minecraft motion: pieces drop into place on a pixel grid (y snaps in 6px steps).
export function assemble(gsap, root) {
  const header = root.querySelector('.section-header');
  if (header && notYetSeen(header)) {
    gsap.from(header.children, {
      y: -24,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.06,
      snap: { y: 6 },
      scrollTrigger: { trigger: header, start: 'top 88%', once: true },
    });
  }
  gsap.utils.toArray(root.querySelectorAll('[data-block]')).forEach((el, i) => {
    if (!notYetSeen(el)) return;
    gsap.from(el, {
      y: -48,
      opacity: 0,
      duration: 0.55,
      delay: (i % 4) * 0.06,
      ease: 'back.out(1.6)',
      snap: { y: 6 },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
  const fills = root.querySelectorAll('.mc-xp__fill');
  if (fills.length && notYetSeen(fills[0])) {
    gsap.from(fills, {
      scaleX: 0,
      duration: 0.9,
      ease: 'steps(10)',
      stagger: 0.05,
      scrollTrigger: { trigger: fills[0], start: 'top 90%', once: true },
    });
  }
}

// GSAP + ScrollTrigger load on the visitor's first interaction (scroll, key, pointer,
// touch), not during page load: content is visible by default, scroll reveals only
// matter once someone scrolls, and this keeps the startup main thread free.
let motionPromise;
let interacted;

function firstInteraction() {
  interacted ||= new Promise((resolve) => {
    const events = ['scroll', 'keydown', 'pointerdown', 'touchstart', 'wheel'];
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go, true));
      resolve();
    };
    events.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true }));
  });
  return interacted;
}

export function loadMotion() {
  if (!motionPromise) {
    motionPromise = firstInteraction()
      .then(() => Promise.all([import('gsap'), import('gsap/ScrollTrigger')]))
      .then(([g, st]) => {
        const gsap = g.gsap || g.default;
        const ScrollTrigger = st.ScrollTrigger || st.default;
        gsap.registerPlugin(ScrollTrigger);
        return { gsap, ScrollTrigger };
      });
  }
  return motionPromise;
}

export function refreshMotion() {
  motionPromise?.then(({ ScrollTrigger }) => ScrollTrigger.refresh());
}

// Only animate things the visitor hasn't seen yet; never hide content already on screen.
export const notYetSeen = (el) => el.getBoundingClientRect().top > window.innerHeight * 0.9;

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

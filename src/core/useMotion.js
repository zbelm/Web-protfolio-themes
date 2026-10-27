import { useEffect } from 'react';
import { loadMotion } from './motion.js';
import { useApp } from './AppState.jsx';

// Runs a GSAP setup function scoped to `ref` when motion is allowed (effects on and
// no reduced-motion preference). Everything is reverted on unmount, so content is
// always fully visible without JS animation.
export function useMotion(ref, setup, deps = []) {
  const { motionOK } = useApp();
  useEffect(() => {
    if (!motionOK || !ref.current) return undefined;
    let ctx;
    let cancelled = false;
    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => setup({ gsap, ScrollTrigger, root: ref.current }), ref.current);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionOK, ...deps]);
}

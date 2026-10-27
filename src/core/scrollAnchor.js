// Keeps the visitor on the same logical section across theme switches, even
// though each theme orders sections differently. We remember which section sits
// under a probe line and how far through it we are, then restore that.
const PROBE = 0.3; // 30% down the viewport

export function captureAnchor() {
  if (window.scrollY < 8) return { top: true };
  const probeY = window.innerHeight * PROBE;
  const sections = document.querySelectorAll('main section[id]');
  for (const el of sections) {
    const r = el.getBoundingClientRect();
    if (r.top <= probeY && r.bottom > probeY) {
      return { id: el.id, progress: (probeY - r.top) / Math.max(r.height, 1) };
    }
  }
  return { y: window.scrollY };
}

export function restoreAnchor(anchor) {
  if (!anchor) return;
  let top = 0;
  if (anchor.id) {
    const el = document.getElementById(anchor.id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    top = window.scrollY + r.top + anchor.progress * r.height - window.innerHeight * PROBE;
  } else if (anchor.y != null) {
    top = anchor.y;
  }
  window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
}

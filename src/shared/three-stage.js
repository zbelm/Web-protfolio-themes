// Shared Three.js stage: renderer, camera, lights, resize, offscreen pause, dispose.
import { Color, DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export function createStage(host, { fov = 35, camera: camPos = [9, 7, 11] } = {}) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.set(...camPos);
  camera.lookAt(0, 0, 0);

  const hemi = new HemisphereLight(0xffffff, 0x445566, 1.6);
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(5, 10, 6);
  scene.add(hemi, sun);

  const setLighting = (mode) => {
    const dark = mode === 'dark';
    hemi.color = new Color(dark ? 0x8899ff : 0xffffff);
    hemi.intensity = dark ? 0.9 : 1.6;
    sun.intensity = dark ? 0.7 : 1.6;
  };

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(host);

  let raf = 0;
  let tick = () => {};
  const t0 = performance.now();
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    tick((now - t0) / 1000);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  return {
    scene,
    camera,
    setLighting,
    onTick: (fn) => (tick = fn),
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        [].concat(o.material || []).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

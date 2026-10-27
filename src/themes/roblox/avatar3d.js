// Blocky avatar (original character) standing on a spawn pad on a gray studio-style baseplate.
import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';
import { createStage } from '../../shared/three-stage.js';

function canvasTex(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function mount(host, { mode }) {
  const stage = createStage(host, { fov: 30, camera: [8, 5.5, 16] });
  const { scene, camera } = stage;
  camera.lookAt(0, 3.1, 0);
  const textures = [];

  // Baseplate with a grid, like an empty studio place.
  const grid = canvasTex(64, (g, s) => {
    g.fillStyle = '#a3a2a5';
    g.fillRect(0, 0, s, s);
    g.strokeStyle = '#8e8d90';
    g.lineWidth = 2;
    g.strokeRect(1, 1, s - 2, s - 2);
  });
  grid.wrapS = grid.wrapT = RepeatWrapping;
  grid.repeat.set(24, 24);
  grid.magFilter = NearestFilter;
  textures.push(grid);
  const plate = new Mesh(new PlaneGeometry(48, 48), new MeshLambertMaterial({ map: grid }));
  plate.rotation.x = -Math.PI / 2;
  scene.add(plate);

  // Spawn pad
  const pad = new Mesh(new BoxGeometry(4, 0.3, 4), new MeshLambertMaterial({ color: 0x6e6e72 }));
  pad.position.y = 0.15;
  const ring = new Mesh(new CylinderGeometry(1.5, 1.5, 0.32, 40), new MeshLambertMaterial({ color: 0x335fff }));
  ring.position.y = 0.16;
  scene.add(pad, ring);

  // Face
  const face = canvasTex(128, (g) => {
    g.fillStyle = '#f2c79b';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#1b1d1f';
    g.beginPath();
    g.ellipse(44, 52, 7, 11, 0, 0, Math.PI * 2);
    g.ellipse(84, 52, 7, 11, 0, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 7;
    g.lineCap = 'round';
    g.strokeStyle = '#1b1d1f';
    g.beginPath();
    g.arc(64, 70, 24, 0.2 * Math.PI, 0.8 * Math.PI);
    g.stroke();
  });
  textures.push(face);

  const skin = new MeshLambertMaterial({ color: 0xf2c79b });
  const shirt = new MeshLambertMaterial({ color: 0x335fff });
  const pants = new MeshLambertMaterial({ color: 0x2b2d31 });
  const hair = new MeshLambertMaterial({ color: 0x3b2a1e });

  const avatar = new Group();
  const part = (w, h, d, mat, x, y, z) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    avatar.add(m);
    return m;
  };
  const legL = part(0.95, 2, 1, pants, -0.5, 1.3, 0);
  const legR = part(0.95, 2, 1, pants, 0.5, 1.3, 0);
  part(2, 2, 1, shirt, 0, 3.3, 0);
  const armPivotL = new Group();
  const armPivotR = new Group();
  armPivotL.position.set(-1.5, 4.2, 0);
  armPivotR.position.set(1.5, 4.2, 0);
  [armPivotL, armPivotR].forEach((p) => {
    const sleeve = new Mesh(new BoxGeometry(1, 1, 1), shirt);
    sleeve.position.y = -0.4;
    const hand = new Mesh(new BoxGeometry(0.98, 1.1, 0.98), skin);
    hand.position.y = -1.45;
    p.add(sleeve, hand);
    avatar.add(p);
  });
  const headMats = [skin, skin, hair, skin, new MeshLambertMaterial({ map: face }), skin];
  part(1.25, 1.25, 1.25, headMats, 0, 4.95, 0);
  part(1.32, 0.35, 1.32, hair, 0, 5.55, -0.02);
  avatar.position.y = 0.3;
  scene.add(avatar);

  stage.setLighting(mode);
  stage.onTick((t) => {
    avatar.rotation.y = Math.sin(t * 0.5) * 0.55;
    const s = Math.sin(t * 2.2) * 0.12;
    armPivotL.rotation.x = s;
    armPivotR.rotation.x = -s;
    legL.rotation.x = -s * 0.4;
    legR.rotation.x = s * 0.4;
    avatar.position.y = 0.3 + Math.abs(Math.sin(t * 2.2)) * 0.03;
  });

  return {
    setMode: stage.setLighting,
    dispose() {
      textures.forEach((t) => t.dispose());
      stage.dispose();
    },
  };
}

// Title-screen panorama: a small voxel landscape the camera slowly circles.
// Instanced meshes keep it to a handful of draw calls.
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  Fog,
  InstancedMesh,
  MeshLambertMaterial,
  NearestFilter,
  Object3D,
  SRGBColorSpace,
} from 'three';
import { createStage } from '../../shared/three-stage.js';
import { textureCanvas } from './textures.js';

const tex = (kind) => {
  const t = new CanvasTexture(textureCanvas(kind));
  t.magFilter = NearestFilter;
  t.minFilter = NearestFilter;
  t.colorSpace = SRGBColorSpace;
  return t;
};

export function mount(host, { mode }) {
  const stage = createStage(host, { fov: 55, camera: [16, 10, 16] });
  const { scene, camera } = stage;
  const S = 13; // half size of the world

  const height = (x, z) => Math.round(2 + 1.6 * Math.sin(x * 0.33) + 1.3 * Math.cos(z * 0.29) + Math.sin((x + z) * 0.18));
  const blocks = { grass: [], dirt: [], stone: [], log: [], leaves: [], water: [] };
  for (let x = -S; x <= S; x++) {
    for (let z = -S; z <= S; z++) {
      const h = height(x, z);
      for (let y = -1; y <= h; y++) {
        const type = y === h ? (h <= 1 ? 'dirt' : 'grass') : y >= h - 2 ? 'dirt' : 'stone';
        blocks[type].push([x, y, z]);
      }
      if (h < 1) for (let y = h + 1; y <= 1; y++) blocks.water.push([x, y, z]);
    }
  }
  [[-5, -3], [4, 6], [7, -6], [-8, 7], [1, -9]].forEach(([x, z]) => {
    const h = height(x, z);
    if (h <= 1) return;
    for (let y = 1; y <= 4; y++) blocks.log.push([x, h + y, z]);
    for (let dx = -2; dx <= 2; dx++)
      for (let dz = -2; dz <= 2; dz++)
        for (let dy = 3; dy <= 4; dy++) if (dx || dz) blocks.leaves.push([x + dx, h + dy, z + dz]);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) blocks.leaves.push([x + dx, h + 5, z + dz]);
  });

  const textures = ['grass_side', 'grass_top', 'dirt', 'stone', 'log', 'leaves', 'water'].reduce((o, k) => ({ ...o, [k]: tex(k) }), {});
  const m = (map, extra = {}) => new MeshLambertMaterial({ map, ...extra });
  const side = m(textures.grass_side);
  const mats = {
    grass: [side, side, m(textures.grass_top), m(textures.dirt), side, side],
    dirt: m(textures.dirt),
    stone: m(textures.stone),
    log: m(textures.log),
    leaves: m(textures.leaves, { alphaTest: 0.5, transparent: true }),
    water: m(textures.water, { transparent: true, opacity: 0.75 }),
  };

  const geo = new BoxGeometry(1, 1, 1);
  const dummy = new Object3D();
  Object.entries(blocks).forEach(([type, list]) => {
    if (!list.length) return;
    const mesh = new InstancedMesh(geo, mats[type], list.length);
    list.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    scene.add(mesh);
  });

  const setMode = (md) => {
    stage.setLighting(md);
    scene.fog = new Fog(new Color(md === 'dark' ? 0x10183a : 0xb8dcff), 16, 40);
  };
  setMode(mode);

  stage.onTick((t) => {
    const a = t * 0.05;
    camera.position.set(Math.cos(a) * 17, 9, Math.sin(a) * 17);
    camera.lookAt(0, 2, 0);
  });

  return {
    setMode,
    dispose() {
      Object.values(textures).forEach((t) => t.dispose());
      stage.dispose();
    },
  };
}

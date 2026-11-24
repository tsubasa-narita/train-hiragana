import * as THREE from '../vendor/three/three.module.js';

const TAU = Math.PI * 2;
const atlases = new Map();

function seedRandom(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function drawLeaf(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.bezierCurveTo(-size * .35, -size * .77, size * .37, -size * .52, size, 0);
  ctx.bezierCurveTo(size * .22, size * .63, -size * .41, size * .59, -size, 0);
  ctx.fill();
}

function drawFlower(ctx, radius, angle) {
  for (let petal = 0; petal < 5; petal++) {
    const turn = angle + TAU * petal / 5;
    const x = Math.cos(turn) * radius * .52, y = Math.sin(turn) * radius * .52;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * .62, radius * .47, turn, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#efbd95';
  ctx.beginPath();
  ctx.arc(0, 0, radius * .22, 0, TAU);
  ctx.fill();
}

function paintBranches(flowers) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d'), random = seedRandom(flowers ? 71099 : 76319);
  const palette = flowers
    ? ['#fff6ed', '#ffdfeb', '#fcd0e0', '#f5b1cb', '#fff6f5', '#ecc1cf']
    : ['#eff1d1', '#c7d4a3', '#bac78e', '#a8be88', '#9eac78', '#7d9166'];
  for (let branch = 0; branch < 7; branch++) {
    const angle = branch * 2.4 + .65;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const reach = 76 + random() * 32;
    ctx.strokeStyle = flowers ? '#906158' : '#68714d';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(125, 132);
    ctx.quadraticCurveTo(125 + dx * reach * .34 - dy * 16, 132 + dy * reach * .34 + dx * 16,
      125 + dx * reach, 132 + dy * reach);
    ctx.stroke();
    for (let spray = 0; spray < 7; spray++) {
      const distance = reach * (.21 + .107 * spray);
      const spread = Math.sin(distance / reach * Math.PI) * 25;
      for (let j = 0; j < 10; j++) {
        const along = distance + (random() - .45) * 24;
        const across = (random() - .5) * spread * 2;
        ctx.save();
        ctx.translate(125 + dx * along - dy * across, 132 + dy * along + dx * across);
        const size = flowers ? 2.6 + random() * 4.4 : 3.7 + random() * 5.7;
        const turn = angle + (j % 2 ? -.8 : .9) + random() * .85;
        ctx.fillStyle = palette[(random() * palette.length) | 0];
        if (flowers) {
          drawFlower(ctx, size, turn);
        } else {
          ctx.rotate(turn);
          drawLeaf(ctx, size);
          ctx.strokeStyle = '#eee9b54a';
          ctx.lineWidth = .6;
          ctx.beginPath();
          ctx.moveTo(-size * .75, 0);
          ctx.lineTo(size * .79, 0);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }
  return canvas;
}

// Open layers of branchlets make a broken silhouette from any camera angle.
// The cards stay in world space, so the crown has parallax during the chase.
export function branchletGeometry(dense = true) {
  const positions = [], normals = [], uv = [], indices = [];
  const count = dense ? 13 : 6;
  for (let i = 0; i < count; i++) {
    const height = 1 - (i + .5) * 2 / count, azimuth = i * 2.39996;
    const radial = Math.sqrt(1 - height * height);
    const direction = new THREE.Vector3(Math.cos(azimuth) * radial, height, Math.sin(azimuth) * radial);
    const centre = direction.clone().multiplyScalar(.57);
    const side = new THREE.Vector3(Math.sin(azimuth), 0, -Math.cos(azimuth));
    const up = new THREE.Vector3().crossVectors(direction, side);
    const base = positions.length / 3;
    for (const [x, y] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
      const point = centre.clone().addScaledVector(side, x * .88).addScaledVector(up, y * .82);
      positions.push(point.x, point.y, point.z);
      normals.push(direction.x, direction.y, direction.z);
      uv.push((x + 1) / 2, (y + 1) / 2);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  return geometry;
}

export function branchletMaterial(keep, flowers = false) {
  if (!atlases.has(flowers)) atlases.set(flowers, paintBranches(flowers));
  const map = keep(new THREE.CanvasTexture(atlases.get(flowers)));
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  const material = new THREE.MeshLambertMaterial({
    map, alphaTest: .32, alphaToCoverage: true, side: THREE.DoubleSide,
    emissive: flowers ? 0x784453 : 0x637946, emissiveIntensity: flowers ? .21 : .09,
  });
  return keep(material);
}

// Curved, creased blades with pointed tips sit in one instanced mesh.
export function grassTuftGeometry() {
  const random = seedRandom(9315), positions = [], colors = [], indices = [];
  for (let blade = 0; blade < 7; blade++) {
    const angle = blade * 2.39996, dx = Math.cos(angle), dz = Math.sin(angle);
    const height = .48 + random() * .52, bend = .18 + random() * .49;
    const width = .04 + random() * .052, lean = .65 + random() * .35;
    const root = .055 + random() * .14;
    const start = positions.length / 3;
    for (const [t, taper] of [[0,.55],[.43,1],[.78,.65],[1,0]]) {
      const distance = root + bend * t * t;
      const light = .37 + .63 * t;
      for (const edge of [-1, 0, 1]) {
        const ridge = edge === 0 ? width * taper * .18 : 0;
        const across = edge * width * taper;
        positions.push(dx * (distance + ridge) - dz * across, height * t * (1 - t * t * (1-lean)),
          dz * (distance + ridge) + dx * across);
        const shade = light * (edge < 1 ? .98 : .79);
        colors.push(shade * (1 + .09 * t), shade, shade * .83);
      }
    }
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 2; column++) {
        const a = start + row * 3 + column, b = a + 3;
        indices.push(a, a + 1, b);
        if (row < 2) indices.push(a + 1, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

import * as THREE from '../vendor/three/three.module.js';

// Periodic value-noise grids, baked once and sampled with mipmaps. Each
// channel has a different scale so nearby grain fades before distant patterns.
let detailPixels;
function surfacePixels() {
  if (detailPixels) return detailPixels;
  const size = 128;
  let seed = 51679;
  function noiseLayer(period) {
    const grid = Float32Array.from({ length: period * period }, () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    });
    function smooth(t) { return t * t * (3 - 2 * t); }
    return (u, v) => {
      const x = u * period, y = v * period;
      const col = Math.floor(x), row = Math.floor(y);
      const nextCol = (col + 1) % period, nextRow = (row + 1) % period;
      return THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(grid[row * period + col], grid[row * period + nextCol], smooth(x - col)),
        THREE.MathUtils.lerp(grid[nextRow * period + col], grid[nextRow * period + nextCol], smooth(x - col)),
        smooth(y - row));
    };
  }
  const broad = noiseLayer(5), middle = noiseLayer(14), fine = noiseLayer(47), grit = noiseLayer(91);
  const bytes = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      const i = 4 * (y * size + x);
      bytes[i] = 255 * (.72 * broad(u, v) + .28 * middle(u, v));
      bytes[i + 1] = 255 * (.60 * middle(u, v) + .40 * fine(u, v));
      bytes[i + 2] = 255 * (.42 * fine(u, v) + .58 * grit(u, v));
      bytes[i + 3] = 255;
    }
  }
  detailPixels = { bytes, size };
  return detailPixels;
}

export function sceneryDetailTexture() {
  const { bytes, size } = surfacePixels();
  const texture = new THREE.DataTexture(bytes, size, size);
  texture.name = 'scenery-surface-noise';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

// Project the texture in metres. Fine grain fades with the texture sampler;
// the broad colour and bedrock patterns remain legible in the wide shots.
export function detailSurface(material, map, { projection, scale, strength, tint }) {
  material.onBeforeCompile = shader => {
    shader.uniforms.sceneryMap = { value: map };
    shader.uniforms.sceneryProjection = { value: new THREE.Vector3(...projection) };
    shader.uniforms.sceneryScale = { value: new THREE.Vector2(...scale) };
    shader.uniforms.sceneryStrength = { value: new THREE.Vector3(...strength) };
    shader.uniforms.sceneryTint = { value: new THREE.Color(tint) };
    shader.vertexShader = 'varying vec3 sceneryPosition;\n' + shader.vertexShader.replace('#include <project_vertex>', `
      #include <project_vertex>
      vec4 terrainVertex = vec4(transformed, 1.);
      #ifdef USE_INSTANCING
        terrainVertex = instanceMatrix * terrainVertex;
      #endif
      sceneryPosition = (modelMatrix * terrainVertex).xyz;
    `);
    shader.fragmentShader = `
      varying vec3 sceneryPosition;
      uniform sampler2D sceneryMap;
      uniform vec3 sceneryProjection, sceneryStrength, sceneryTint;
      uniform vec2 sceneryScale;
    ` + shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      vec2 terrainUV = vec2(dot(sceneryPosition.xz, sceneryProjection.xy),
        sceneryPosition.z * sceneryProjection.x + sceneryPosition.y * sceneryProjection.z);
      vec2 terrain = terrainUV / sceneryScale;
      vec2 offset = vec2(terrain.y, -terrain.x);
      vec3 layers = vec3(texture2D(sceneryMap, terrain).r,
        texture2D(sceneryMap, offset * 1.53 + .17).g,
        texture2D(sceneryMap, terrain * 3.72 + .39).b) - .5;
      diffuseColor.rgb *= 1. + dot(layers, sceneryStrength);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * sceneryTint,
        smoothstep(.04, .29, layers.r));
    `);
  };
  return material;
}

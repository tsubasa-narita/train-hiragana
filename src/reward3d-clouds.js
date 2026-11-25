// Directional colour and density/thickness from the same cloud field. Both
// seasons use their existing sky dome, so clouds need no additional meshes.
export const CLOUD_RELIEF = `
  float cloudHash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * .1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  float cloudNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    vec2 offset = vec2(1.0, 0.0);
    return mix(mix(cloudHash(i), cloudHash(i + offset.xy), f.x),
      mix(cloudHash(i + offset.yx), cloudHash(i + 1.0), f.x), f.y);
  }
  float cloudField(vec2 p) {
    mat2 rotate = mat2(.82, .57, -.57, .82);
    return cloudNoise(p) * .56 + cloudNoise(rotate * p * 2.12 + 6.7) * .29
      + cloudNoise(p * 4.42 - 3.8) * .15;
  }
  vec3 seasonalClouds(vec3 sky, vec3 ray, vec2 wind, vec3 lightDirection,
    vec3 shadowColor, vec3 lightColor, float coverage) {
    float band = smoothstep(.012, .13, ray.y) * (1.0 - smoothstep(.54, .82, ray.y));
    if (band <= .001) return sky;
    vec2 p = ray.xz * vec2(1.65, 2.25) / max(.2, ray.y + .22) + wind;
    float density = cloudField(p);
    float opacity = smoothstep(coverage, coverage + .19, density) * band;
    if (opacity <= .001) return sky;
    float relief = density - cloudField(p + lightDirection.xz * .25 + vec2(.035, -.075));
    float lit = smoothstep(-.055, .11, relief + ray.y * .14);
    float facing = pow(max(0.0, dot(ray, lightDirection)), 6.0);
    vec3 cloud = mix(shadowColor, lightColor, clamp(lit + .19 * facing, 0.0, 1.0));
    return mix(sky, cloud, opacity);
  }
`;

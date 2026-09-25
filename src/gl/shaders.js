// Shaders for the instanced sticker stage.
//
// Per-instance attributes (all vec4):
//   aA  = x, y, lift, rotation            (world px, rotation in radians)
//   aB  = scaleX, scaleY, tiltX, tiltY    (tilt = 3D tumble while flying in)
//   aC  = peelAngle, peel, hover, visible (peel 0..1 of the sticker's extent)
//   aD  = layerZ, seed, size, _
//   aUV = u0, v0, du, dv                  (atlas cell)

const common = /* glsl */ `
attribute vec4 aA;
attribute vec4 aB;
attribute vec4 aC;
attribute vec4 aD;
attribute vec4 aUV;

mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
`;

export const stickerVert = /* glsl */ `
${common}
varying vec2 vUv;
varying vec2 vLocal;
varying vec3 vN;
varying vec3 vPos;
varying float vHover;
varying float vSeed;
varying float vCurl;

void main() {
  if (aC.w < 0.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }

  vec2 p = position.xy;           // -0.5..0.5
  vLocal = p;
  vec2 dir = vec2(cos(aC.x), sin(aC.x));
  float ext = 0.5 * (abs(dir.x) + abs(dir.y));
  float peel = aC.y;
  vec3 n = vec3(0.0, 0.0, 1.0);
  float z = 0.0;
  float curl = 0.0;

  // Wrap everything past the fold line around a cylinder → real 3D corner curl.
  if (peel > 0.001) {
    float fold = ext - peel * 2.0 * ext;
    float R = 0.045 + 0.1 * peel;
    float d = dot(p, dir) - fold;
    if (d > 0.0) {
      float th = d / R;
      float dn;
      if (th < 3.14159265) {
        dn = R * sin(th);
        z = R * (1.0 - cos(th));
        n = vec3(-sin(th) * dir, cos(th));
      } else {
        dn = -(d - 3.14159265 * R);
        z = 2.0 * R;
        n = vec3(0.0, 0.0, -1.0);
      }
      p += dir * (dn - d);
      curl = clamp(th / 3.14159265, 0.0, 1.0);
    }
  }

  float size = aD.z;
  vec3 pos = vec3(p * aB.xy * size, z * size);

  // tumble (X then Y), then spin around Z
  float cx = cos(aB.z), sx = sin(aB.z), cy = cos(aB.w), sy = sin(aB.w);
  pos = vec3(pos.x, pos.y * cx - pos.z * sx, pos.y * sx + pos.z * cx);
  n   = vec3(n.x,   n.y * cx - n.z * sx,     n.y * sx + n.z * cx);
  pos = vec3(pos.x * cy + pos.z * sy, pos.y, -pos.x * sy + pos.z * cy);
  n   = vec3(n.x * cy + n.z * sy,     n.y,   -n.x * sy + n.z * cy);
  mat2 r = rot2(aA.w);
  pos.xy = r * pos.xy;
  n.xy = r * n.xy;

  pos += vec3(aA.xy, aD.x + aA.z);
  vPos = pos;
  vN = n;
  vCurl = curl;
  vHover = aC.z;
  vSeed = aD.y;
  vUv = aUV.xy + uv * aUV.zw;
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`;

export const stickerFrag = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uLight;
uniform float uTime;
varying vec2 vUv;
varying vec2 vLocal;
varying vec3 vN;
varying vec3 vPos;
varying float vHover;
varying float vSeed;
varying float vCurl;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec4 t = texture2D(uMap, vUv);           // premultiplied on upload → clean die-cut edges
  if (t.a < 0.02) discard;
  vec3 base = t.rgb / t.a;
  vec3 N = normalize(vN);
  bool front = gl_FrontFacing;
  if (!front) {
    N = -N;
    base = vec3(0.94, 0.92, 0.87) - 0.035 * hash(floor(vUv * 900.0));   // paper backing
  }
  vec3 L = normalize(uLight - vPos);
  vec3 V = normalize(cameraPosition - vPos);
  vec3 H = normalize(L + V);
  float ndl = max(dot(N, L), 0.0);
  float shade = 0.74 + 0.3 * ndl;
  shade *= 1.0 - 0.22 * sin(vCurl * 3.14159265);        // darker in the bend
  vec3 col = base * shade;
  if (front) {
    float nh = max(dot(N, H), 0.0);
    col += pow(nh, 70.0) * 0.24 + pow(nh, 8.0) * 0.05;   // vinyl gloss
    float s = fract(uTime * 0.55 + vSeed) * 3.2 - 1.6;   // hover sheen sweep
    col += smoothstep(0.1, 0.0, abs(vLocal.x + vLocal.y * 0.6 - s)) * vHover * 0.3;
  }
  gl_FragColor = vec4(col, t.a);
}
`;

export const shadowVert = /* glsl */ `
${common}
uniform vec3 uLight;
varying vec2 vUv;
varying float vAlpha;

void main() {
  if (aC.w < 0.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  float lift = max(aA.z, 0.0);
  float size = aD.z * (1.04 + lift * 0.0008);
  vec2 p = position.xy * aB.xy * size;
  p *= vec2(abs(cos(aB.w)), abs(cos(aB.z)));
  p = rot2(aA.w) * p;
  vec2 away = aA.xy - uLight.xy;
  away = length(away) > 1.0 ? normalize(away) : vec2(0.0, -1.0);
  vec2 dir = normalize(mix(vec2(0.25, -1.0), away, 0.45));
  vec2 xy = aA.xy + p + dir * (4.0 + lift * 0.22);
  vAlpha = 0.5 * clamp(1.0 - lift / 1500.0, 0.25, 1.0);
  vUv = aUV.xy + uv * aUV.zw;
  gl_Position = projectionMatrix * viewMatrix * vec4(xy, aD.x - 0.5, 1.0);
}
`;

export const shadowFrag = /* glsl */ `
uniform sampler2D uMap;
varying vec2 vUv;
varying float vAlpha;
void main() {
  float a = texture2D(uMap, vUv, 2.5).a * vAlpha;   // mip bias = cheap blur
  if (a < 0.004) discard;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}
`;

export const surfaceVert = /* glsl */ `
varying vec2 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xy;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const surfaceFrag = /* glsl */ `
uniform vec3 uLight;
varying vec2 vW;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  float grain = (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.022;
  float d = length(vW - uLight.xy);
  float glow = 0.032 * exp(-d * d / (2.0 * 420.0 * 420.0));   // matte sheen under the "lamp"
  gl_FragColor = vec4(vec3(0.039) + grain + glow, 1.0);
}
`;

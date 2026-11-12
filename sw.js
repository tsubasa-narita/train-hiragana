const PREFIX = `train-hiragana:${new URL(self.registration.scope).pathname}:`;
const CACHE = PREFIX + 'v33';
const base = self.registration.scope;
const home = new URL('index.html', base).href;
const CORE = ['index.html', 'manifest.webmanifest', 'src/app.js', 'src/train-facts.js', 'src/train-facts-a.js', 'src/train-facts-b.js', 'src/train-facts-c.js', 'src/train-facts-d.js', 'src/data.js', 'src/train-expansion.js', 'src/style.css',
  'src/quiz-images.js',
  'src/capital-trains.js',
  'src/metro-trains.js',
  'src/popular-trains.js',
  'src/new15-mendel.js', 'src/new15-herschel.js', 'src/new15-einstein.js',
  'src/book-trains.js', 'src/book-express.js', 'src/book-tourist-a.js', 'src/book-tourist-b.js', 'src/book-local-work.js', 'src/book-rewards.js',
  'src/trace.js', 'src/trace-engine.js', 'src/kana-strokes.js', 'src/trace.css',
  'src/connect.js', 'src/connect-engine.js', 'src/connect.css',
  'src/fill.js', 'src/fill-engine.js', 'src/fill.css',
  'src/word.js', 'src/word-engine.js', 'src/word.css',
  'src/word-short-trains.js',
  'src/word-extra-trains.js',
  'src/connect-assets.js',
  'src/announcement-manifest.js',
  'assets/connect/komachi-carriages.png',
  'src/reward.js', 'src/reward-trains.js', 'src/reward-models.js', 'src/reward-model-assets.js', 'src/reward-scene.js', 'src/reward.css', 'src/voice.js', 'src/voice-lines.js', 'src/voice-manifest.js', 'src/pwa.js',
  'src/reward-timeline.js', 'src/reward-audio.js', 'src/reward3d-film.js', 'src/reward3d-celebration.js', 'src/reward-cinema.js', 'src/reward3d.js', 'src/reward3d-world.js', 'src/reward3d-trains.js', 'src/reward3d-catalog.js', 'src/reward3d-scenarios.js', 'src/reward3d-curve.js', 'src/reward3d-assets.js', 'src/reward3d-terrain.js', 'src/reward3d-depot.js', 'src/reward3d-skybridge.js',
  'src/reward3d-shinkansen.js', 'assets/reward3d/yamanote.glb', 'assets/reward3d/komachi.glb', 'assets/reward3d/hayabusa.glb',
  'assets/reward3d/yokosuka.glb', 'assets/reward3d/shonan-shinjuku.glb', 'assets/reward3d/saikyo.glb', 'assets/reward3d/toyoko.glb',
  'assets/reward3d/environment/small_hangar_01.hdr', 'assets/reward3d/environment/shanghai_bund.hdr', 'assets/reward3d/environment/railway_bridge_02.hdr',
  'vendor/three/addons/loaders/HDRLoader.js', 'vendor/three/addons/loaders/GLTFLoader.js', 'vendor/three/addons/utils/BufferGeometryUtils.js', 'vendor/three/addons/libs/meshopt_decoder.module.js',
  'vendor/three/three.module.js', 'vendor/three/three.core.js', 'vendor/three/LICENSE',
  'assets/icon.svg', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-maskable-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE.map(path => new Request(new URL(path, base), { cache: 'reload' })))));
  // Updates activate after existing app windows close, without interrupting a quiz.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
async function respond(request) {
  const cache = await caches.open(CACHE);
  const key = request.mode === 'navigate' ? home : request;
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      try { await cache.put(key, response.clone()); } catch { /* Storage can be full or unavailable. */ }
    }
    return response;
  } catch {
    return await cache.match(key) || new Response('通信できません。オンラインでもう一度開いてください。', { status: 503 });
  }
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || !url.href.startsWith(base)) return;
  if (request.mode === 'navigate' || url.pathname.includes('/src/') || url.pathname.includes('/assets/') || url.pathname.includes('/vendor/') || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(respond(request));
  }
});

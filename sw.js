const PREFIX = `train-hiragana:${new URL(self.registration.scope).pathname}:`;
const CACHE = PREFIX + 'v6';
const base = self.registration.scope;
const home = new URL('index.html', base).href;
const CORE = ['index.html', 'manifest.webmanifest', 'src/app.js', 'src/data.js', 'src/train-expansion.js', 'src/style.css',
  'src/trace.js', 'src/trace-engine.js', 'src/kana-strokes.js', 'src/trace.css',
  'src/reward.js', 'src/voice.js', 'src/voice-lines.js', 'src/voice-manifest.js', 'src/pwa.js',
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
  if (request.mode === 'navigate' || url.pathname.includes('/src/') || url.pathname.includes('/assets/') || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(respond(request));
  }
});

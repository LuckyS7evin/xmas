// Cache « stale-while-revalidate » : l'app marche hors ligne après la 1re visite.
const CACHE = 'traineau-v1';
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'manifest.webmanifest', 'favicon.svg'])));
});
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(r, { ignoreSearch: true }) || (r.mode === 'navigate' ? await c.match('./') : undefined);
    const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});

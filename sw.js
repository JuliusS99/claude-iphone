// Offline: serve from cache, refresh the cache in the background.
// ponytail: an update shows up on the launch after the one that downloaded it.
const CACHE = 'kontingent';
const FILES = ['./', 'index.html', 'logic.js', 'icon.png'];

self.oninstall = e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); };

self.onfetch = e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
};

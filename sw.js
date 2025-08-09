importScripts('/version.js');

let APP_VERSION = 'unknown';
let CACHE_NAME = 'mm-cache-unknown';
const ASSETS = [
  "/",                // ถ้าเป็น SPA แนะนำมี /200.html และตั้งเป็น fallback ด้วย
  "/index.html",
  "/style.css", 
  "/main.js",
  "/matcher.js",
  "/state.js",
  "/ui.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/version.txt",
  "/version.js",
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    APP_VERSION = await getAppVersion();          // ← ใช้ฟังก์ชันกลาง
    CACHE_NAME = `mm-cache-${APP_VERSION}`;

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);

    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => n !== CACHE_NAME ? caches.delete(n) : null));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});

// เผื่อหน้าเว็บอยากถามเวอร์ชันจาก SW
self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', version: APP_VERSION });
  }
});

self.addEventListener('install', (e) => {
  self.skipWaiting();                 // ให้ SW ใหม่พร้อม takeover ทันที
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());  // คุมทุกแท็บที่เปิดอยู่ทันที
});

// กลยุทธ์แคช:
// - HTML: network-first (ได้ไฟล์ใหม่ก่อน ถ้าเน็ตล่มค่อยใช้แคช)
// - อื่น ๆ (JS/CSS/img): stale-while-revalidate
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => {
      const fetching = fetch(req).then(res => {
        const copy = res.clone();
        caches.open('static-v1').then(c => c.put(req, copy));
        return res;
      }).catch(() => cached);
      return cached || fetching;
    })
  );
});
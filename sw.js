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

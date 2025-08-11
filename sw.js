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

// ติดตั้ง SW ใหม่
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    APP_VERSION = await getAppVersion();
    CACHE_NAME = `mm-cache-${APP_VERSION}`;

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);

    // บังคับให้ SW ใหม่เข้ามาทำงานทันที
    self.skipWaiting();
  })());
});

// เปิดใช้งาน SW ใหม่
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // ลบ cache เก่าทั้งหมด
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => name !== CACHE_NAME)
        .map(name => caches.delete(name))
    );
    
    // บังคับให้ SW ควบคุมทุก client ทันที
    await self.clients.claim();
  })());
});

// จัดการ fetch request
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // HTML: network-first (ดึงใหม่ก่อน ถ้าไม่ได้ใช้ cache)
    event.respondWith(
      fetch(req)
        .then(response => {
          // เก็บ HTML ใหม่ในแคช
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // ไฟล์อื่น: cache-first แต่อัพเดทในพื้นหลัง
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req)
          .then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(req, responseClone);
            });
            return response;
          })
          .catch(() => cached);
        
        return cached || fetchPromise;
      })
    );
  }
});

// รับ message จาก main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', version: APP_VERSION });
  }
  
  // เพิ่ม: รองรับการบังคับ update
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
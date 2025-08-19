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
  "/version.js",
];

// ติดตั้ง SW ใหม่
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    APP_VERSION = await getAppVersion();
    CACHE_NAME = `mm-cache-${APP_VERSION}`;

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
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
  const url = new URL(req.url);
  if (url.pathname === '/sw.js') return; // ปล่อยไฟล์ SW ให้โหลดสดเสมอ

  const accept = req.headers.get('accept') || '';
  const isHTML = req.headers.get('accept')?.includes('text/html');

  // HTML และ version.txt = network-first เพื่อเห็น deploy ใหม่ก่อน
   if (isHTML || url.pathname === './version.txt') {
     event.respondWith((async () => {
       try {
         const fresh = await fetch(req, { cache: 'no-store' });
         const cache = await caches.open(CACHE_NAME);
         cache.put(req, fresh.clone());
         return fresh;
       } catch {
         const cached = await caches.match(req);
         return cached || caches.match('/index.html');
       }
     })());
     return;
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
  
  // รองรับการบังคับ update
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // เพิ่ม: ตอบ PING เพื่อให้ main.js รู้ว่า SW ใหม่รองรับ message
  if (event.data?.type === 'PING') {
    event.source.postMessage({ type: 'PONG' });
  }
});
const CACHE = "bm-v1.0.2"; // เปลี่ยนเวอร์ชันเมื่อมีการเปลี่ยนแปลงไฟล์ที่ต้องการแคช
const ASSETS = [
  "/",                // ถ้าเป็น SPA แนะนำมี /200.html และตั้งเป็น fallback ด้วย
  "/index.html",
  "/style.css", 
  "/main.js",
  "/matcher.js",
  "/state.js",
  "/ui.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

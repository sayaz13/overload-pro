const CACHE_NAME = 'overload-fitness-v29';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './alarm.wav',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

// Kurulumda tüm dosyaları kesinlikle önbelleğe al
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Eski önbellekleri temizle
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-First Offline Stratejisi:
// 1. Önce cache'e bak → varsa hemen ver (sunucu kapalı olsa da çalışır)
// 2. Arka planda ağdan güncellemeyi dene → başarılı olursa cache'i yenile
// 3. Cache'de yoksa ağdan getirmeyi dene
// 4. İkisi de yoksa → index.html'i fallback olarak ver
self.addEventListener('fetch', (e) => {
  // Chrome extension isteklerini atla
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(e.request);

      // Arka planda güncellemeyi dene (sunucu açıksa cache'i tazele)
      const fetchPromise = fetch(e.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            cache.put(e.request, networkRes.clone());
          }
          return networkRes;
        })
        .catch(() => null); // Ağ yoksa null döner, uygulama yine de açılır

      // Cache'de varsa HEMEN ver (sunucu kapalı olsa bile açılır!)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Cache'de yoksa ağdan getirmeyi bekle
      const networkRes = await fetchPromise;
      if (networkRes) return networkRes;

      // Son çare: index.html'i ver (SPA navigation için)
      const fallback = await cache.match('./index.html');
      return fallback || new Response('Uygulama yükleniyor, lütfen bekleyin...', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    })
  );
});

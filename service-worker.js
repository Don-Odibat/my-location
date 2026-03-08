const CACHE_NAME = 'tml-offline-v1';

// These are the exact files the phone will download and save for offline use
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/guides.html',
  '/guide-safety.html',
  '/guide-accuracy.html',
  '/guide-celestial.html',
  '/guide-emergency-workflows.html',
  '/guide-gps-explained.html',
  '/guide-satellite-types.html',
  '/guide-privacy.html',
  '/guide-ip-geo.html',
  '/manifest.json',
  '/favicon.svg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// INSTALL EVENT: Pre-cache all essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all vital assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE EVENT: Clean up old caches if we update the version number
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH EVENT: The Offline Magic
self.addEventListener('fetch', (event) => {
  // Do not intercept API calls (Weather, Nominatim Address, AdSense)
  if (event.request.url.includes('api') || 
      event.request.url.includes('nominatim') || 
      event.request.url.includes('googlesyndication') || 
      event.request.url.includes('ipapi')) {
      return; 
  }

  // Network-First Strategy with Cache Fallback
  event.respondWith(
    fetch(event.request).catch(async () => {
      // If network fails (User is Offline in the woods), open the vault
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) {
          return cachedResponse;
      }
      
      // Fallback: If they requested a clean URL (e.g., /guide-safety) 
      // but we cached the file as /guide-safety.html, manually stitch it together
      const cleanUrl = new URL(event.request.url);
      if (!cleanUrl.pathname.endsWith('.html') && !cleanUrl.pathname.endsWith('/')) {
         const htmlFallback = await cache.match(cleanUrl.pathname + '.html');
         if (htmlFallback) return htmlFallback;
      }
    })
  );
});

const CACHE_NAME = 'dicoding-story-app-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/bundle.js',
  '/images/favicon.ico',
  '/styles.css',
  '/images/logo.png',
  '/manifest.json',
  ...(self.__WB_MANIFEST || [])
];

// Instalasi Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed:', error);
      })
  );
});

// Aktivasi Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Tangani pesan dari klien
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Fetch dari Service Worker
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Lewati permintaan ke API /auth/
  if (requestUrl.pathname.startsWith('/auth/') && !requestUrl.pathname.endsWith('.html')) {
    console.log(`Service Worker: Bypassing API request ${event.request.url}`);
    event.respondWith(fetch(event.request));
    return;
  }

  // Tangani rute SPA
  if (event.request.mode === 'navigate') {
    console.log(`Service Worker: Handling SPA route ${event.request.url}`);
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch('/index.html');
      })
    );
    return;
  }

  // Lewati permintaan non-HTTP
  if (!requestUrl.protocol.startsWith('http')) {
    console.log('Service Worker: Skipping non-http request', event.request.url);
    event.respondWith(fetch(event.request));
    return;
  }

  // Khusus untuk API stories
  if (requestUrl.pathname.startsWith('/stories')) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.log('Service Worker: Fetch failed for stories:', error);
        throw error;
      })
    );
    return;
  }

  // Cache tile peta
  if (requestUrl.hostname === 'api.maptiler.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => {
          console.log('Service Worker: Fetch failed for map tiles, checking cache', requestUrl);
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Service Worker: Serving cached map tiles', requestUrl);
              return cachedResponse;
            }
            throw new Error('No cached map tiles');
          });
        });
      })
    );
    return;
  }

  // Cache-first untuk file statis
  console.log(`Service Worker: Fetching resource ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

// Menangani notifikasi push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  let data = { title: 'New Story', body: 'A new story has been added!', url: '/' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error('Service Worker: Failed to parse push data', error);
    }
  }
  const options = {
    body: data.body,
    icon: '/images/logo.png',
    badge: '/images/favicon.ico',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  };
  event.waitUntil(
    self.checkNotificationPermission()
      .then((hasPermission) => {
        if (hasPermission) {
          return self.registration.showNotification(data.title, options);
        } else {
          console.warn('Service Worker: Notification permission not granted');
          return Promise.resolve();
        }
      })
      .catch((error) => {
        console.error('Service Worker: Gagal menampilkan notifikasi:', error);
      })
  );
});

// Menangani klik notifikasi
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const url = event.notification.data.url || '/';
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .catch((error) => {
        console.error('Service Worker: Gagal menangani klik notifikasi:', error);
      })
  );
});

// Helper function untuk cek permission notifikasi
self.checkNotificationPermission = function () {
  return new Promise((resolve) => {
    if (typeof Notification === 'undefined') {
      console.log('Service Worker: Notification API tidak tersedia');
      resolve(false);
      return;
    }
    console.log('Service Worker: Status izin notifikasi:', Notification.permission);
    resolve(Notification.permission === 'granted');
  });
};
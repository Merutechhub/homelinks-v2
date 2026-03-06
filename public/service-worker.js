const CACHE_NAME = 'homelink-v2.0.0';
const OFFLINE_PAGE = '/offline.html';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache opened');
      return cache.add(OFFLINE_PAGE).catch(() => {
        console.warn('Offline page not found');
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network First for API, Cache First for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network First
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches
            .match(request)
            .then((cached) => cached || new Response('Offline', { status: 503 }));
        })
    );
    return;
  }

  // Images and assets - Cache First
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(css|js|woff|woff2|ttf|svg)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const cache = caches.open(CACHE_NAME);
                cache.then((c) => c.put(request, response.clone()));
              }
              return response;
            })
            .catch(() => {
              if (request.destination === 'image') {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e5e7eb" width="200" height="200"/></svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              }
              return new Response('Offline', { status: 503 });
            })
        );
      })
    );
    return;
  }

  // HTML documents - Network First
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => {
          return caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_PAGE));
        })
    );
    return;
  }

  // Default - Network First
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  // Implement background sync logic here
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Homelink';
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'homelink-notification',
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

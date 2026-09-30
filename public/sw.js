// FireGuard Service Worker for PWA, Push Notifications, and Background System Alerts

const CACHE_NAME = 'fireguard-v1';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim all open clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification event (triggered from Web Push server / backend)
self.addEventListener('push', (event) => {
  let data = {
    title: 'FireGuard Safety Alert',
    body: 'An extinguisher inspection or service is due.',
    url: '/notifications',
    tag: 'fireguard-alert'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = Object.assign(data, parsed);
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    vibrate: [250, 100, 250, 100, 250],
    tag: data.tag || 'fireguard-alert-' + Date.now(),
    renotify: true,
    data: {
      url: data.url || '/notifications',
      notificationId: data.id,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'Open FireGuard' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Notification click event - brings the app window to the front or opens it (like WhatsApp)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. If a FireGuard window/tab is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // 2. If no window is open, launch a new window to the target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle custom messages from the Angular client (e.g. testing background notification)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = Object.assign({
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      renotify: true,
      data: {
        url: options && options.url ? options.url : '/notifications'
      }
    }, options);

    self.registration.showNotification(title, notificationOptions);
  }
});

// Service Worker for Push Notifications
const CACHE_NAME = 'chetana-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => console.log('Failed to cache:', url))
          )
        );
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'चेtanā - Mental Wellness',
    body: 'You have a new notification',
    icon: '/icon-192x192.svg',
    badge: '/badge-72x72.svg',
    tag: 'default',
    requireInteraction: false,
    actions: []
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  // Add default actions for assessment reminders
  if (notificationData.tag === 'assessment-reminder' || notificationData.title.includes('Assessment')) {
    notificationData.actions = [
      {
        action: 'take-assessment',
        title: 'Take Assessment',
        icon: '/icon-192x192.svg'
      },
      {
        action: 'remind-later',
        title: 'Remind Later',
        icon: '/icon-192x192.svg'
      }
    ];
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'take-assessment') {
    // Open assessment page
    event.waitUntil(
      clients.openWindow('/#assessment')
    );
  } else if (event.action === 'remind-later') {
    // Schedule a reminder in 30 minutes (handled by server)
    console.log('Remind later requested');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // If app is already open, focus it
        for (let client of clientList) {
          if (client.url === self.location.origin + '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending data sync when connection is restored
  console.log('Background sync triggered');
}

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag);
  
  // Track notification dismissal for analytics
  if (event.notification.tag === 'assessment-reminder') {
    // Could send analytics data here
    console.log('Assessment reminder dismissed');
  }
});